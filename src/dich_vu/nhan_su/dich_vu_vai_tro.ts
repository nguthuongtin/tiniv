'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  limit,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
  onSnapshot
} from 'firebase/firestore';
import type { VaiTro, KieuBadgeVaiTro } from '../../thu_vien/types/nhan_su';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { CAC_VAI_TRO_CHUAN_HE_THONG, DANH_SACH_QUYEN_HAN_HE_THONG } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'vai_tro' as const;
const GIOI_HAN_MAC_DINH = 500;
const STORAGE_KEY = 'ebms_danh_sach_vai_tro';

const QUYEN_MAC_DINH_SYSTEM: Record<string, string[]> = {
  quan_tri_he_thong: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen),
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri' && m !== 'du_an.khoi_phuc'),
  truong_phong: ['du_an.xem', 'du_an.tao_sua', 'du_an.xoa', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  nhan_vien_kinh_doanh: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  nhan_vien_ky_thuat: ['du_an.xem', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  hanh_chinh_van_phong: ['nhan_su.xem', 'nhan_su.quan_ly', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.xuat_file']
};

export interface DieuKienLocVaiTro {
  tuKhoa?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  gioiHan?: number | null;
}

export interface TaoMoiVaiTroDTO {
  ten_vai_tro: string;
  ma_vai_tro?: string | null;
  mo_ta?: string | null;
  kieu_hien_thi?: KieuBadgeVaiTro;
  thu_tu_sap_xep?: number;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatVaiTroDTO extends Partial<Omit<TaoMoiVaiTroDTO, 'ten_vai_tro' | 'trang_thai_du_lieu'>> {
  id: string;
  ten_vai_tro?: string;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface KetQuaDanhSachVaiTro {
  mang: VaiTro[];
  tong: number;
}

type RawBanGhi = Omit<VaiTro, 'id'>;

const DS_KIEU_HOP_LE: KieuBadgeVaiTro[] = ['muted', 'primary', 'success', 'warning', 'danger', 'secondary'];

const chuyenDoiDocThanhDoiTuong = (id: string, raw: DocumentData | RawBanGhi | undefined | null): VaiTro => {
  const r = (raw ?? {}) as Partial<RawBanGhi>;
  const today = new Date().toISOString();
  const tt = (r.trang_thai_du_lieu as VaiTro['trang_thai_du_lieu']) ?? 'hoat_dong';
  const kieuRaw = String(r.kieu_hien_thi ?? 'muted');
  const kieuHopLe = DS_KIEU_HOP_LE.includes(kieuRaw as any) ? (kieuRaw as KieuBadgeVaiTro) : 'muted';
  const dsQuyenRaw = Array.isArray(r.danh_sach_quyen) ? r.danh_sach_quyen : [];

  const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((s) => s.key === id || s.key === r.ma_vai_tro);
  const tenVaiTro = String(r.ten_vai_tro || stdInfo?.tenMacDinh || id).trim();

  return {
    id,
    ma_vai_tro: r.ma_vai_tro ?? stdInfo?.key ?? id,
    ten_vai_tro: tenVaiTro,
    mo_ta: r.mo_ta ?? stdInfo?.moTa ?? null,
    kieu_hien_thi: kieuHopLe !== 'muted' ? kieuHopLe : (stdInfo?.badge ?? 'muted'),
    thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number' ? r.thu_tu_sap_xep : (stdInfo ? (CAC_VAI_TRO_CHUAN_HE_THONG.indexOf(stdInfo) + 1) * 10 : 0),
    danh_sach_quyen: dsQuyenRaw,
    is_he_thong: Boolean(r.is_he_thong || stdInfo),
    nguoi_tao_id: r.nguoi_tao_id ?? null,
    ngay_tao: String(r.ngay_tao ?? today),
    ngay_cap_nhat: String(r.ngay_cap_nhat ?? today),
    trang_thai_du_lieu: tt
  };
};

const layTuLocalStorage = (): VaiTro[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const luuVaoLocalStorage = (mang: VaiTro[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mang));
  } catch (e) {
    console.warn('[dich_vu_vai_tro] luuVaoLocalStorage failed:', e);
  }
};

const thongBaoCapNhat = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ebms:vai_tro:cap_nhat'));
  }
};

const khoiTaoVaiTroChuan = (): VaiTro[] => {
  const now = new Date().toISOString();
  return CAC_VAI_TRO_CHUAN_HE_THONG.map((std, idx) => ({
    id: std.key,
    ma_vai_tro: std.key,
    ten_vai_tro: std.tenMacDinh,
    mo_ta: std.moTa,
    kieu_hien_thi: std.badge,
    thu_tu_sap_xep: (idx + 1) * 10,
    danh_sach_quyen: QUYEN_MAC_DINH_SYSTEM[std.key] ?? [],
    is_he_thong: true,
    nguoi_tao_id: null,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: 'hoat_dong' as const
  }));
};

const taoDieuKien = (dk: DieuKienLocVaiTro): QueryConstraint[] => {
  const mang: QueryConstraint[] = [];
  mang.push(limit(typeof dk.gioiHan === 'number' ? dk.gioiHan : GIOI_HAN_MAC_DINH));
  return mang;
};

const sortTrongBoNho = (mang: VaiTro[]): VaiTro[] => {
  return [...mang].sort((a, b) => {
    const thuTu = (a.thu_tu_sap_xep ?? 0) - (b.thu_tu_sap_xep ?? 0);
    if (thuTu !== 0) return thuTu;
    return (a.ten_vai_tro ?? '').localeCompare(b.ten_vai_tro ?? '', 'vi');
  });
};

const locTheoDieuKienBoNho = (mang: VaiTro[], dk: DieuKienLocVaiTro): VaiTro[] => {
  return mang.filter((x) => {
    if (dk.trang_thai_du_lieu && dk.trang_thai_du_lieu !== 'tat_ca') {
      if ((x.trang_thai_du_lieu ?? 'hoat_dong') !== dk.trang_thai_du_lieu) return false;
    }
    return true;
  });
};

const locTheoTuKhoa = (mang: VaiTro[], tuKhoa: string | null | undefined): VaiTro[] => {
  const kw = String(tuKhoa ?? '').trim().toLowerCase();
  if (!kw) return mang;
  return mang.filter((x) =>
    [x.ten_vai_tro, x.ma_vai_tro, x.mo_ta]
      .map((s) => (s ?? '').toString().toLowerCase())
      .some((s) => s.includes(kw))
  );
};

export const danhSachVaiTro = async (dk: DieuKienLocVaiTro = {}): Promise<KetQuaDanhSachVaiTro> => {
  const full: DieuKienLocVaiTro = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  let danhSachTong: VaiTro[] = [];

  try {
    const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full)));
    const mangFirestore = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    
    const local = layTuLocalStorage();
    const uniqueMap = new Map<string, VaiTro>();
    
    // 1. Nạp từ local trước
    local.forEach((item) => {
      const converted = chuyenDoiDocThanhDoiTuong(item.id, item);
      uniqueMap.set(converted.id, converted);
    });

    // 2. Firestore là nguồn thật sự (source of truth), ghi đè local
    mangFirestore.forEach((item) => {
      uniqueMap.set(item.id, item);
    });

    // 3. Đảm bảo toàn bộ vai trò chuẩn hệ thống luôn có mặt
    const stdRoles = khoiTaoVaiTroChuan();
    stdRoles.forEach((std) => {
      const coSan = uniqueMap.get(std.id) || (std.ma_vai_tro && Array.from(uniqueMap.values()).find((x) => x.ma_vai_tro === std.ma_vai_tro));
      if (!coSan) {
        uniqueMap.set(std.id, std);
      }
    });

    danhSachTong = Array.from(uniqueMap.values());
    luuVaoLocalStorage(danhSachTong);
  } catch (err) {
    console.warn('[dich_vu_vai_tro] danhSachVaiTro getDocs error, trying API fallback:', err);
    let daLayDuocTuApi = false;
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/quan-tri/phan-quyen');
        if (res.ok) {
          const json = await res.json();
          if (json.thanh_cong && Array.isArray(json.mang) && json.mang.length > 0) {
            danhSachTong = json.mang;
            luuVaoLocalStorage(danhSachTong);
            daLayDuocTuApi = true;
          }
        }
      } catch {
        /* Bỏ qua lỗi fetch */
      }
    }

    if (!daLayDuocTuApi) {
      danhSachTong = layTuLocalStorage();
      if (danhSachTong.length === 0) {
        danhSachTong = khoiTaoVaiTroChuan();
        luuVaoLocalStorage(danhSachTong);
      } else {
        const stdRoles = khoiTaoVaiTroChuan();
        stdRoles.forEach((std) => {
          if (!danhSachTong.some((x) => x.id === std.id || (std.ma_vai_tro && x.ma_vai_tro === std.ma_vai_tro))) {
            danhSachTong.push(std);
          }
        });
        luuVaoLocalStorage(danhSachTong);
      }
    }
  }

  const danhSachHopLe = danhSachTong.filter((x) => x.ten_vai_tro && x.ten_vai_tro.trim().length > 0 && x.id && x.id.trim().length > 0);
  const mang = sortTrongBoNho(danhSachHopLe);
  const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
  const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
  return { mang: daLoc, tong: daLoc.length };
};

export const layChiTietVaiTro = async (id: string): Promise<VaiTro | null> => {
  try {
    const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
    if (snap.exists()) {
      return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
    }
  } catch (e) {
    console.warn('[dich_vu_vai_tro] layChiTietVaiTro error:', e);
  }
  const local = layTuLocalStorage();
  const found = local.find((x) => x.id === id || x.ma_vai_tro === id);
  if (found) return found;

  const std = CAC_VAI_TRO_CHUAN_HE_THONG.find((x) => x.key === id);
  if (std) {
    return {
      id: std.key,
      ma_vai_tro: std.key,
      ten_vai_tro: std.tenMacDinh,
      mo_ta: std.moTa,
      kieu_hien_thi: std.badge,
      thu_tu_sap_xep: 0,
      danh_sach_quyen: QUYEN_MAC_DINH_SYSTEM[std.key] ?? [],
      is_he_thong: true,
      nguoi_tao_id: null,
      ngay_tao: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
      trang_thai_du_lieu: 'hoat_dong'
    };
  }
  return null;
};

export const taoVaiTroMoi = async (
  dto: TaoMoiVaiTroDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<VaiTro> => {
  if (!dto.ten_vai_tro || !dto.ten_vai_tro.trim()) {
    throw new Error('Tên vai trò không được để trống.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const duLieuRaw: RawBanGhi = {
    ten_vai_tro: dto.ten_vai_tro.trim(),
    ma_vai_tro: dto.ma_vai_tro?.trim() || null,
    mo_ta: dto.mo_ta?.trim() || null,
    kieu_hien_thi: dto.kieu_hien_thi ?? 'muted',
    thu_tu_sap_xep: typeof dto.thu_tu_sap_xep === 'number' ? dto.thu_tu_sap_xep : 0,
    nguoi_tao_id: idNguoiThucHien,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  };

  let moi: VaiTro;
  try {
    const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
    moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
    try {
      await ghiNhatKyHoatDong(
        idNguoiThucHien,
        TEN_COLLECTION,
        'tao_moi',
        moi.id,
        `Tạo vai trò "${moi.ten_vai_tro}"`
      );
    } catch { /* Bỏ qua nhật ký */ }
  } catch (err) {
    console.warn('[dich_vu_vai_tro] taoVaiTroMoi Firestore fallback:', err);
    const mockId = `vt_${Date.now()}`;
    moi = chuyenDoiDocThanhDoiTuong(mockId, duLieuRaw);
  }

  const dsHienTai = layTuLocalStorage();
  const dsMoi = [moi, ...dsHienTai.filter((x) => x.id !== moi.id)];
  luuVaoLocalStorage(dsMoi);

  return moi;
};

export const capNhatVaiTro = async (
  dto: CapNhatVaiTroDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<VaiTro> => {
  const hienTai = await layChiTietVaiTro(dto.id);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhi> = {};
  (Object.keys(dto) as (keyof CapNhatVaiTroDTO)[]).forEach((k) => {
    if (k === 'id') return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    if (typeof giaTriRaw === 'string') {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw.trim() || null;
    } else {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw;
    }
  });
  patchRaw.ngay_cap_nhat = now;

  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
    try {
      await ghiNhatKyHoatDong(
        nguoiThucHien?.id,
        TEN_COLLECTION,
        'cap_nhat',
        dto.id,
        `Cập nhật vai trò "${patchRaw.ten_vai_tro || hienTai?.ten_vai_tro || dto.id}"`
      );
    } catch { /* Bỏ qua nhật ký */ }
  } catch (err) {
    console.warn('[dich_vu_vai_tro] capNhatVaiTro Firestore fallback:', err);
  }

  const moi = { ...(hienTai || {}), ...patchRaw, id: dto.id } as VaiTro;

  const dsHienTai = layTuLocalStorage();
  const dsMoi = dsHienTai.map((x) => (x.id === dto.id ? moi : x));
  if (!dsMoi.some((x) => x.id === dto.id)) dsMoi.push(moi);
  luuVaoLocalStorage(dsMoi);

  return moi;
};

export const xoaMemVaiTro = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<VaiTro> => {
  return capNhatVaiTro({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucVaiTro = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<VaiTro> => {
  return capNhatVaiTro({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const capNhatQuyenHanVaiTro = async (
  vaiTroId: string,
  danhSachQuyen: string[],
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<VaiTro> => {
  const hienTai = await layChiTietVaiTro(vaiTroId);
  const now = new Date().toISOString();
  const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((x) => x.key === vaiTroId || x.key === hienTai?.ma_vai_tro);

  const tenVaiTro = (hienTai?.ten_vai_tro || stdInfo?.tenMacDinh || vaiTroId).trim();
  const maVaiTro = hienTai?.ma_vai_tro || stdInfo?.key || vaiTroId;
  const isHeThong = Boolean(hienTai?.is_he_thong || stdInfo);
  const kieuHienThi = hienTai?.kieu_hien_thi || stdInfo?.badge || 'primary';
  const moTa = hienTai?.mo_ta ?? stdInfo?.moTa ?? null;
  const thuTu = typeof hienTai?.thu_tu_sap_xep === 'number'
    ? hienTai.thu_tu_sap_xep
    : (stdInfo ? (CAC_VAI_TRO_CHUAN_HE_THONG.indexOf(stdInfo) + 1) * 10 : 0);
  const trangThai = hienTai?.trang_thai_du_lieu || 'hoat_dong';

  const duLieuRaw: RawBanGhi = {
    ten_vai_tro: tenVaiTro,
    ma_vai_tro: maVaiTro,
    mo_ta: moTa,
    kieu_hien_thi: kieuHienThi,
    thu_tu_sap_xep: thuTu,
    danh_sach_quyen: danhSachQuyen,
    is_he_thong: isHeThong,
    nguoi_tao_id: hienTai?.nguoi_tao_id ?? nguoiThucHien?.id ?? null,
    ngay_tao: hienTai?.ngay_tao ?? now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: trangThai
  };

  // 1. Thử gọi API Server-side (dùng Admin SDK - 100% không bị chặn bởi Rules)
  let daLuuApiThanhCong = false;
  try {
    const res = await fetch('/api/quan-tri/phan-quyen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vai_tro_id: vaiTroId,
        danh_sach_quyen: danhSachQuyen,
        nguoi_thuc_hien_id: nguoiThucHien?.id || null
      })
    });
    if (res.ok) {
      daLuuApiThanhCong = true;
    }
  } catch (e) {
    console.warn('[dich_vu_vai_tro] Gọi API /api/quan-tri/phan-quyen thất bại, fallback sang Client SDK:', e);
  }

  // 2. Ghi trực tiếp bằng Client Firestore SDK (backup / cache sync)
  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, vaiTroId), duLieuRaw as any, { merge: true });
    try {
      await ghiNhatKyHoatDong(
        nguoiThucHien?.id,
        TEN_COLLECTION,
        'cap_nhat',
        vaiTroId,
        `Cập nhật ma trận phân quyền cho vai trò "${tenVaiTro}" (${danhSachQuyen.length} quyền)`
      );
    } catch { /* Bỏ qua nhật ký */ }
  } catch (e) {
    if (!daLuuApiThanhCong) {
      console.warn('[dich_vu_vai_tro] capNhatQuyenHanVaiTro Firestore error:', e);
    }
  }

  const moi: VaiTro = {
    id: vaiTroId,
    ...duLieuRaw
  };

  // 3. Cập nhật localStorage
  const dsHienTai = layTuLocalStorage();
  const dsMoi = dsHienTai.map((x) => (x.id === vaiTroId || (x.ma_vai_tro && x.ma_vai_tro === vaiTroId) ? moi : x));
  if (!dsMoi.some((x) => x.id === vaiTroId || (x.ma_vai_tro && x.ma_vai_tro === vaiTroId))) {
    dsMoi.push(moi);
  }
  luuVaoLocalStorage(dsMoi);

  thongBaoCapNhat();
  return moi;
};

export const capNhatHangLoatQuyenHanVaiTro = async (
  danhSachCapNhat: Array<{ vai_tro_id: string; danh_sach_quyen: string[] }>,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<boolean> => {
  if (!danhSachCapNhat || danhSachCapNhat.length === 0) return true;

  // 1. Gọi API Server-side với batch
  try {
    const res = await fetch('/api/quan-tri/phan-quyen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        danh_sach_cap_nhat: danhSachCapNhat,
        nguoi_thuc_hien_id: nguoiThucHien?.id || null
      })
    });
    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }
  } catch (e) {
    console.warn('[dich_vu_vai_tro] Batch API call error, fallback to individual saves:', e);
    // Fallback: Lưu từng vai trò
    for (const item of danhSachCapNhat) {
      await capNhatQuyenHanVaiTro(item.vai_tro_id, item.danh_sach_quyen, nguoiThucHien);
    }
    return true;
  }

  // 2. Cập nhật đồng bộ LocalStorage
  const dsHienTai = layTuLocalStorage();
  const now = new Date().toISOString();
  const mapCapNhat = new Map<string, string[]>();
  danhSachCapNhat.forEach((c) => mapCapNhat.set(c.vai_tro_id, c.danh_sach_quyen));

  const dsMoi = dsHienTai.map((x) => {
    if (mapCapNhat.has(x.id)) {
      return { ...x, danh_sach_quyen: mapCapNhat.get(x.id)!, ngay_cap_nhat: now };
    }
    if (x.ma_vai_tro && mapCapNhat.has(x.ma_vai_tro)) {
      return { ...x, danh_sach_quyen: mapCapNhat.get(x.ma_vai_tro)!, ngay_cap_nhat: now };
    }
    return x;
  });

  luuVaoLocalStorage(dsMoi);
  thongBaoCapNhat();
  return true;
};

export const langNgheThayDoiDanhSachVaiTro = (
  callback: (mang: VaiTro[]) => void,
  loc: DieuKienLocVaiTro = {}
): Unsubscribe => {
  const full: DieuKienLocVaiTro = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...loc };
  const q = query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full));
  
  const unsub = onSnapshot(
    q,
    (snap) => {
      const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
      const local = layTuLocalStorage();
      const map = new Map<string, VaiTro>();
      local.forEach((item) => map.set(item.id, item));
      mangChuaSort.forEach((item) => map.set(item.id, item));
      const danhSachTong = Array.from(map.values());

      const mang = sortTrongBoNho(danhSachTong);
      const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
      const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
      callback(daLoc);
    },
    (err) => {
      console.warn('[dich_vu_vai_tro] onSnapshot error:', err);
      const local = layTuLocalStorage();
      const mang = sortTrongBoNho(local);
      const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
      const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
      callback(daLoc);
    }
  );

  return unsub;
};
