'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import type {
  HoSoDuAn,
  GiaiDoanDuAn,
  MucDoTiemNangKyHopDong
} from '../../thu_vien/types/du_an';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'ho_so_du_an' as const;
const GIOI_HAN_MAC_DINH = 200;

export interface DieuKienLocHoSoDuAn {
  tuKhoa?: string | null;
  khach_hang_id?: string | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  giai_doan?: GiaiDoanDuAn | 'tat_ca' | null;
  muc_do_tiem_nang?: MucDoTiemNangKyHopDong | 'tat_ca' | null;
  nguoi_quan_ly_id?: string | null;
  nguoi_phu_trach_id?: string | null;
  trang_thai?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
  thoi_han_hoan_thanh_tu_ngay?: string | null;
  thoi_han_hoan_thanh_den_ngay?: string | null;
}

type RawBanGhiHDA = Omit<HoSoDuAn, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiHDA | undefined | null
): HoSoDuAn => {
  const r = (raw ?? {}) as Partial<RawBanGhiHDA>;
  const today = new Date().toISOString();
  return {
    id,
    ma_ho_so: (r.ma_ho_so as string) ?? '',
    ten_du_an: (r.ten_du_an as string) ?? '(Chua dat ten)',
    khach_hang_id: (r.khach_hang_id as string | null) ?? null,
    nguoi_lien_he_id: (r.nguoi_lien_he_id as string | null) ?? null,
    chi_nhanh_id: (r.chi_nhanh_id as string | null) ?? null,
    phong_ban_id: (r.phong_ban_id as string | null) ?? null,
    giai_doan: (r.giai_doan as GiaiDoanDuAn) ?? 'moi_tao',
    muc_do_tiem_nang: (r.muc_do_tiem_nang as MucDoTiemNangKyHopDong) ?? 'trung_binh',
    gia_tri_du_kien: Number(r.gia_tri_du_kien) || 0,
    gia_tri_hop_dong: Number(r.gia_tri_hop_dong) || 0,
    nguoi_quan_ly_id: (r.nguoi_quan_ly_id as string | null) ?? null,
    nguoi_phu_trach_id: (r.nguoi_phu_trach_id as string | null) ?? null,
    danh_sach_nguoi_ho_tro_ids: Array.isArray(r.danh_sach_nguoi_ho_tro_ids)
      ? r.danh_sach_nguoi_ho_tro_ids
      : [],
    san_pham_dich_vu_id: (r.san_pham_dich_vu_id as string | null) ?? null,
    san_pham_khac_mo_ta: (r.san_pham_khac_mo_ta as string | null) ?? null,
    ngay_tao_ho_so: (r.ngay_tao_ho_so as string) ?? today.split('T')[0],
    thoi_han_hoan_thanh: (r.thoi_han_hoan_thanh as string | null) ?? null,
    mo_ta: (r.mo_ta as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    ly_do_that_bai: (r.ly_do_that_bai as string | null) ?? null,
    ghi_chu_that_bai: (r.ghi_chu_that_bai as string | null) ?? null,
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai: (r.trang_thai as HoSoDuAn['trang_thai']) ?? 'hoat_dong'
  };
};

const sapXepVaLocThem = (mang: HoSoDuAn[], loc?: DieuKienLocHoSoDuAn): HoSoDuAn[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((hda) => {
    // Lọc theo trạng thái xóa mềm / hoạt động
    if (loc?.trang_thai === 'da_xoa') {
      if (hda.trang_thai !== 'da_xoa') return false;
    } else if (loc?.trang_thai === 'hoat_dong' || !loc?.trang_thai) {
      if (hda.trang_thai === 'da_xoa') return false;
    }

    if (loc?.chi_nhanh_id && hda.chi_nhanh_id !== loc.chi_nhanh_id) return false;
    if (loc?.phong_ban_id && hda.phong_ban_id !== loc.phong_ban_id) return false;
    if (tuKhoaLower) {
      const khop =
        hda.ma_ho_so.toLowerCase().includes(tuKhoaLower) ||
        hda.ten_du_an.toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.ngay_tao_tu_ngay && hda.ngay_tao < loc.ngay_tao_tu_ngay) return false;
    if (loc?.ngay_tao_den_ngay && hda.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return false;
    if (loc?.thoi_han_hoan_thanh_tu_ngay) {
      if (!hda.thoi_han_hoan_thanh) return false;
      if (hda.thoi_han_hoan_thanh < loc.thoi_han_hoan_thanh_tu_ngay) return false;
    }
    if (loc?.thoi_han_hoan_thanh_den_ngay) {
      if (!hda.thoi_han_hoan_thanh) return false;
      if (hda.thoi_han_hoan_thanh > loc.thoi_han_hoan_thanh_den_ngay + 'T23:59:59.999Z') return false;
    }
    return true;
  });
};

export const danhSachHoSoDuAn = async (
  loc?: DieuKienLocHoSoDuAn
): Promise<{ mang: HoSoDuAn[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.khach_hang_id) {
    mangRangBuoc.unshift(where('khach_hang_id', '==', loc.khach_hang_id));
  }
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  if (loc?.phong_ban_id) {
    mangRangBuoc.unshift(where('phong_ban_id', '==', loc.phong_ban_id));
  }
  if (loc?.giai_doan && loc.giai_doan !== 'tat_ca') {
    mangRangBuoc.unshift(where('giai_doan', '==', loc.giai_doan));
  }
  if (loc?.muc_do_tiem_nang && loc.muc_do_tiem_nang !== 'tat_ca') {
    mangRangBuoc.unshift(where('muc_do_tiem_nang', '==', loc.muc_do_tiem_nang));
  }
  if (loc?.nguoi_quan_ly_id) {
    mangRangBuoc.unshift(where('nguoi_quan_ly_id', '==', loc.nguoi_quan_ly_id));
  }
  if (loc?.nguoi_phu_trach_id) {
    mangRangBuoc.unshift(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const resultsRaw: HoSoDuAn[] = [];
    for (const d of snapshot.docs) {
      resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    }
    resultsRaw.sort((a, b) => (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? ''));
    return { mang: sapXepVaLocThem(resultsRaw, loc), tong_so: snapshot.size };
  } catch (err) {
    console.warn('[dich_vu_ho_so_du_an] danhSachHoSoDuAn catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietHoSoDuAn = async (id: string): Promise<HoSoDuAn | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export interface TaoMoiHoSoDuAnDTO {
  ma_ho_so?: string | null;
  ten_du_an: string;
  khach_hang_id?: string | null;
  nguoi_lien_he_id?: string | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  giai_doan?: GiaiDoanDuAn | string;
  muc_do_tiem_nang?: MucDoTiemNangKyHopDong | string;
  gia_tri_du_kien?: number;
  gia_tri_hop_dong?: number;
  nguoi_quan_ly_id?: string | null;
  nguoi_phu_trach_id?: string | null;
  danh_sach_nguoi_ho_tro_ids?: string[];
  san_pham_dich_vu_id?: string | null;
  san_pham_khac_mo_ta?: string | null;
  ngay_tao_ho_so?: string | null;
  thoi_han_hoan_thanh?: string | null;
  mo_ta?: string | null;
  ghi_chu?: string | null;
  ly_do_that_bai?: string | null;
  ghi_chu_that_bai?: string | null;
  trang_thai?: 'hoat_dong' | 'da_xoa';
}

type NguoiThucHienDTO = Pick<NhanSu, 'id'> & { chi_nhanh_id?: string | null; phong_ban_id?: string | null };

export const taoHoSoDuAnMoi = async (
  dto: TaoMoiHoSoDuAnDTO,
  nguoiThucHien: NguoiThucHienDTO | null | undefined
): Promise<HoSoDuAn> => {
  if (!dto.ten_du_an || !dto.ten_du_an.trim()) {
    throw new Error('Ten du an khong duoc de trong.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const mac_dinh_trang_thai = dto.trang_thai ?? 'hoat_dong';
  const duLieuRaw: RawBanGhiHDA = {
    ma_ho_so: dto.ma_ho_so?.trim() || '',
    ten_du_an: dto.ten_du_an.trim(),
    khach_hang_id: dto.khach_hang_id ?? null,
    nguoi_lien_he_id: dto.nguoi_lien_he_id ?? null,
    chi_nhanh_id: dto.chi_nhanh_id ?? nguoiThucHien?.chi_nhanh_id ?? null,
    phong_ban_id: dto.phong_ban_id ?? nguoiThucHien?.phong_ban_id ?? null,
    giai_doan: dto.giai_doan ?? 'moi_tao',
    muc_do_tiem_nang: dto.muc_do_tiem_nang ?? 'trung_binh',
    gia_tri_du_kien: Number(dto.gia_tri_du_kien) || 0,
    gia_tri_hop_dong: Number(dto.gia_tri_hop_dong) || 0,
    nguoi_quan_ly_id: dto.nguoi_quan_ly_id ?? idNguoiThucHien,
    nguoi_phu_trach_id: dto.nguoi_phu_trach_id ?? idNguoiThucHien,
    danh_sach_nguoi_ho_tro_ids: Array.isArray(dto.danh_sach_nguoi_ho_tro_ids)
      ? dto.danh_sach_nguoi_ho_tro_ids
      : [],
    san_pham_dich_vu_id: dto.san_pham_dich_vu_id ?? null,
    san_pham_khac_mo_ta: dto.san_pham_khac_mo_ta?.trim() || null,
    ngay_tao_ho_so: dto.ngay_tao_ho_so ?? now.split('T')[0],
    thoi_han_hoan_thanh: dto.thoi_han_hoan_thanh ?? null,
    mo_ta: dto.mo_ta?.trim() || null,
    ghi_chu: dto.ghi_chu?.trim() || null,
    ly_do_that_bai: dto.ly_do_that_bai?.trim() || null,
    ghi_chu_that_bai: dto.ghi_chu_that_bai?.trim() || null,
    nguoi_tao_id: idNguoiThucHien,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai: mac_dinh_trang_thai
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  const logThem = [
    moi.san_pham_dich_vu_id ? `SP/DV: ${moi.san_pham_dich_vu_id}` : null,
    moi.san_pham_khac_mo_ta ? `SP Khac: ${moi.san_pham_khac_mo_ta}` : null
  ].filter(Boolean).join(' | ');
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'tao_moi',
    moi.id,
    `Tao ho so du an "${moi.ten_du_an}"${logThem ? ` (${logThem})` : ''}`
  );
  return moi;
};

export interface CapNhatHoSoDuAnDTO extends Partial<TaoMoiHoSoDuAnDTO> {
  id: string;
}

export const capNhatHoSoDuAn = async (
  dto: CapNhatHoSoDuAnDTO,
  nguoiThucHien: NguoiThucHienDTO | null | undefined
): Promise<HoSoDuAn> => {
  const hienTai = await layChiTietHoSoDuAn(dto.id);
  if (!hienTai) throw new Error(`Khong ton tai ho so du an id = ${dto.id}`);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiHDA> = {};
  (Object.keys(dto) as (keyof CapNhatHoSoDuAnDTO)[]).forEach((k) => {
    if (k === 'id') return;
    if (!Object.prototype.hasOwnProperty.call(dto, k)) return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    if (k === 'gia_tri_du_kien' || k === 'gia_tri_hop_dong') {
      (patchRaw as unknown as Record<string, unknown>)[k] = Number(giaTriRaw) || 0;
    } else if (k === 'danh_sach_nguoi_ho_tro_ids') {
      (patchRaw as unknown as Record<string, unknown>)[k] = Array.isArray(giaTriRaw)
        ? giaTriRaw
        : [];
    } else if (
      typeof giaTriRaw === 'string' &&
      k !== 'trang_thai' &&
      k !== 'giai_doan' &&
      k !== 'muc_do_tiem_nang'
    ) {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw.trim() || null;
    } else {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw;
    }
  });
  patchRaw.ngay_cap_nhat = now;
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as HoSoDuAn;
  const logThem = [
    moi.san_pham_dich_vu_id ? `SP/DV: ${moi.san_pham_dich_vu_id}` : null,
    moi.san_pham_khac_mo_ta ? `SP Khac: ${moi.san_pham_khac_mo_ta}` : null
  ].filter(Boolean).join(' | ');
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'cap_nhat',
    moi.id,
    `Cap nhat ho so du an "${moi.ten_du_an}"${logThem ? ` (${logThem})` : ''}`
  );
  return moi;
};

export const doiTrangThaiHoSoDuAn = async (
  id: string,
  trang_thai_moi: HoSoDuAn['trang_thai'],
  nguoiThucHien: NguoiThucHienDTO | null | undefined
): Promise<HoSoDuAn> => {
  const ketQua = await capNhatHoSoDuAn({ id, trang_thai: trang_thai_moi }, nguoiThucHien);

  // Cascade soft-delete khi xóa dự án
  if (trang_thai_moi === 'da_xoa') {
    try {
      // Cascade soft-delete tien_do_du_an
      const qTienDo = query(
        thamChieuCollection('tien_do_du_an'),
        where('du_an_id', '==', id),
        where('trang_thai_du_lieu', '==', 'hoat_dong')
      );
      const snapTienDo = await getDocs(qTienDo);
      const capNhatTienDo = snapTienDo.docs.map((docSnap) =>
        setDoc(docSnap.ref, { trang_thai_du_lieu: 'da_xoa' }, { merge: true })
      );

      await Promise.allSettled(capNhatTienDo);
    } catch (loiCascade) {
      console.error('Lỗi khi cascade soft-delete dữ liệu tiến độ của dự án:', loiCascade);
    }
  } else if (trang_thai_moi === 'hoat_dong') {
    try {
      // Cascade restore tien_do_du_an
      const qTienDo = query(
        thamChieuCollection('tien_do_du_an'),
        where('du_an_id', '==', id),
        where('trang_thai_du_lieu', '==', 'da_xoa')
      );
      const snapTienDo = await getDocs(qTienDo);
      const capNhatTienDo = snapTienDo.docs.map((docSnap) =>
        setDoc(docSnap.ref, { trang_thai_du_lieu: 'hoat_dong' }, { merge: true })
      );

      await Promise.allSettled(capNhatTienDo);
    } catch (loiCascade) {
      console.error('Lỗi khi cascade restore dữ liệu tiến độ của dự án:', loiCascade);
    }
  }

  return ketQua;
};

export const xoaMemHoSoDuAn = async (
  id: string,
  nguoiThucHien: NguoiThucHienDTO | null | undefined
): Promise<HoSoDuAn> => {
  return doiTrangThaiHoSoDuAn(id, 'da_xoa', nguoiThucHien);
};

export const khoiPhucHoSoDuAn = async (
  id: string,
  nguoiThucHien: NguoiThucHienDTO | null | undefined
): Promise<HoSoDuAn> => {
  return doiTrangThaiHoSoDuAn(id, 'hoat_dong', nguoiThucHien);
};

export interface ThongTinThatBaiDTO {
  ly_do_that_bai?: string | null;
  ghi_chu_that_bai?: string | null;
}

export const doiGiaiDoanHoSoDuAn = async (
  id: string,
  giai_doan_moi: GiaiDoanDuAn,
  nguoiThucHien: NguoiThucHienDTO | null | undefined,
  thongTinThatBai?: ThongTinThatBaiDTO
): Promise<HoSoDuAn> => {
  if (giai_doan_moi === 'huy') {
    if (!thongTinThatBai?.ly_do_that_bai || !thongTinThatBai.ly_do_that_bai.trim()) {
      throw new Error('Vui lòng chọn lý do thất bại khi hủy dự án.');
    }
  }

  const payload: CapNhatHoSoDuAnDTO = {
    id,
    giai_doan: giai_doan_moi
  };

  if (giai_doan_moi === 'huy') {
    payload.ly_do_that_bai = thongTinThatBai?.ly_do_that_bai?.trim() || null;
    payload.ghi_chu_that_bai = thongTinThatBai?.ghi_chu_that_bai?.trim() || null;
  }

  const res = await capNhatHoSoDuAn(payload, nguoiThucHien);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'thay_doi_giai_doan',
    id,
    `Chuyen giai doan du an "${res.ten_du_an}" thanh "${giai_doan_moi}"${
      giai_doan_moi === 'huy' ? ` (Ly do: ${thongTinThatBai?.ly_do_that_bai})` : ''
    }`
  );
  return res;
};

export const langNgheThayDoiDanhSachHoSoDuAn = (
  callback: (mang: HoSoDuAn[]) => void,
  loc?: DieuKienLocHoSoDuAn
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.khach_hang_id) {
    mangRangBuoc.unshift(where('khach_hang_id', '==', loc.khach_hang_id));
  }
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  if (loc?.phong_ban_id) {
    mangRangBuoc.unshift(where('phong_ban_id', '==', loc.phong_ban_id));
  }
  if (loc?.giai_doan && loc.giai_doan !== 'tat_ca') {
    mangRangBuoc.unshift(where('giai_doan', '==', loc.giai_doan));
  }
  if (loc?.muc_do_tiem_nang && loc.muc_do_tiem_nang !== 'tat_ca') {
    mangRangBuoc.unshift(where('muc_do_tiem_nang', '==', loc.muc_do_tiem_nang));
  }
  if (loc?.nguoi_quan_ly_id) {
    mangRangBuoc.unshift(where('nguoi_quan_ly_id', '==', loc.nguoi_quan_ly_id));
  }
  if (loc?.nguoi_phu_trach_id) {
    mangRangBuoc.unshift(where('nguoi_phu_trach_id', '==', loc.nguoi_phu_trach_id));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw: HoSoDuAn[] = [];
    snap.forEach((d) => {
      mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    });
    mangRaw.sort((a, b) => b.ngay_cap_nhat.localeCompare(a.ngay_cap_nhat));
    callback(sapXepVaLocThem(mangRaw, loc));
  });
  return unsub;
};
