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
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri'),
  truong_phong: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
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

  return {
    id,
    ma_vai_tro: r.ma_vai_tro ?? null,
    ten_vai_tro: String(r.ten_vai_tro ?? ''),
    mo_ta: r.mo_ta ?? null,
    kieu_hien_thi: kieuHopLe,
    thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number' ? r.thu_tu_sap_xep : 0,
    danh_sach_quyen: dsQuyenRaw,
    is_he_thong: Boolean(r.is_he_thong),
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
    const map = new Map<string, VaiTro>();
    
    local.forEach((item) => map.set(item.id, item));
    mangFirestore.forEach((item) => map.set(item.id, item));
    
    danhSachTong = Array.from(map.values());

    if (danhSachTong.length === 0) {
      danhSachTong = khoiTaoVaiTroChuan();
      luuVaoLocalStorage(danhSachTong);
    } else {
      // Đảm bảo các vai trò chuẩn hệ thống luôn có mặt
      const stdRoles = khoiTaoVaiTroChuan();
      stdRoles.forEach((std) => {
        if (!map.has(std.id) && (!std.ma_vai_tro || !map.has(std.ma_vai_tro))) {
          danhSachTong.push(std);
        }
      });
      luuVaoLocalStorage(danhSachTong);
    }
  } catch (err) {
    console.warn('[dich_vu_vai_tro] danhSachVaiTro getDocs error, using fallback:', err);
    danhSachTong = layTuLocalStorage();
    if (danhSachTong.length === 0) {
      danhSachTong = khoiTaoVaiTroChuan();
      luuVaoLocalStorage(danhSachTong);
    }
  }

  const mang = sortTrongBoNho(danhSachTong);
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

  if (!hienTai) {
    const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((x) => x.key === vaiTroId);
    const duLieuRaw = {
      ten_vai_tro: stdInfo?.tenMacDinh || vaiTroId,
      ma_vai_tro: vaiTroId,
      mo_ta: stdInfo?.moTa || null,
      kieu_hien_thi: stdInfo?.badge || 'primary',
      thu_tu_sap_xep: 0,
      danh_sach_quyen: danhSachQuyen,
      is_he_thong: true,
      nguoi_tao_id: nguoiThucHien?.id || null,
      ngay_tao: now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: 'hoat_dong' as const
    };
    try {
      await setDoc(thamChieuBanGhi(TEN_COLLECTION, vaiTroId), duLieuRaw as any, { merge: true });
    } catch (e) {
      console.warn('[dich_vu_vai_tro] capNhatQuyenHanVaiTro error:', e);
    }
    const moi = { id: vaiTroId, ...duLieuRaw };
    const dsHienTai = layTuLocalStorage();
    const dsMoi = [moi, ...dsHienTai.filter((x) => x.id !== moi.id)];
    luuVaoLocalStorage(dsMoi);
    return moi;
  }

  try {
    await setDoc(
      thamChieuBanGhi(TEN_COLLECTION, vaiTroId),
      {
        danh_sach_quyen: danhSachQuyen,
        ngay_cap_nhat: now
      },
      { merge: true }
    );
    try {
      await ghiNhatKyHoatDong(
        nguoiThucHien?.id,
        TEN_COLLECTION,
        'cap_nhat',
        vaiTroId,
        `Cập nhật ma trận phân quyền cho vai trò "${hienTai.ten_vai_tro}" (${danhSachQuyen.length} quyền)`
      );
    } catch { /* Bỏ qua nhật ký */ }
  } catch (e) {
    console.warn('[dich_vu_vai_tro] capNhatQuyenHanVaiTro setDoc error:', e);
  }

  const moi = { ...hienTai, danh_sach_quyen: danhSachQuyen, ngay_cap_nhat: now };
  const dsHienTai = layTuLocalStorage();
  const dsMoi = dsHienTai.map((x) => (x.id === vaiTroId ? moi : x));
  if (!dsMoi.some((x) => x.id === vaiTroId)) dsMoi.push(moi);
  luuVaoLocalStorage(dsMoi);

  return moi;
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
