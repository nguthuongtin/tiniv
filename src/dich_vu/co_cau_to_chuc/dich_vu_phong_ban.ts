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
import type { PhongBan } from '../../thu_vien/types/nhan_su';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'phong_ban' as const;
const GIOI_HAN_MAC_DINH = 200;

export interface DieuKienLocPhongBan {
  tuKhoa?: string | null;
  chi_nhanh_id?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
}

export interface TaoMoiPhongBanDTO {
  ten_phong_ban: string;
  chi_nhanh_id?: string | null;
  ma_phong_ban?: string | null;
  ghi_chu?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatPhongBanDTO extends Partial<TaoMoiPhongBanDTO> {
  id: string;
}

type RawBanGhiPhongBan = Omit<PhongBan, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiPhongBan | undefined | null
): PhongBan => {
  const r = (raw ?? {}) as Partial<RawBanGhiPhongBan>;
  const today = new Date().toISOString();
  const ttDuLieu = (r.trang_thai_du_lieu as PhongBan['trang_thai_du_lieu']) ?? 'hoat_dong';
  return {
    id,
    chi_nhanh_id: (r.chi_nhanh_id as string | null) ?? null,
    ten_phong_ban: (r.ten_phong_ban as string) ?? '(Chua dat ten phong ban)',
    ma_phong_ban: (r.ma_phong_ban as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai_du_lieu: ttDuLieu
  };
};

const sapXepVaLocThem = (mang: PhongBan[], loc?: DieuKienLocPhongBan): PhongBan[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((pb) => {
    if (loc?.chi_nhanh_id && pb.chi_nhanh_id !== loc.chi_nhanh_id) return false;
    if (loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca' && pb.trang_thai_du_lieu !== loc.trang_thai_du_lieu) return false;
    if (tuKhoaLower) {
      const khop =
        pb.ten_phong_ban.toLowerCase().includes(tuKhoaLower) ||
        (pb.ma_phong_ban ?? '').toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    return true;
  });
};

export const danhSachPhongBan = async (
  loc?: DieuKienLocPhongBan
): Promise<{ mang: PhongBan[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  try {
    const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc));
    const mangRaw = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    const mangDaLoc = sapXepVaLocThem(mangRaw, loc);
    mangDaLoc.sort((a, b) => (a.ten_phong_ban ?? '').localeCompare(b.ten_phong_ban ?? '', 'vi'));
    return { mang: mangDaLoc, tong_so: mangDaLoc.length };
  } catch {
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietPhongBan = async (id: string): Promise<PhongBan | null> => {
  try {
    const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
    if (!snap.exists()) return null;
    return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
  } catch {
    return null;
  }
};

export const taoPhongBanMoi = async (
  dto: TaoMoiPhongBanDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<PhongBan> => {
  if (!dto.ten_phong_ban || !dto.ten_phong_ban.trim()) {
    throw new Error('Ten phong ban khong duoc de trong.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const duLieuRaw: RawBanGhiPhongBan = {
    ten_phong_ban: dto.ten_phong_ban.trim(),
    chi_nhanh_id: dto.chi_nhanh_id ?? null,
    ma_phong_ban: dto.ma_phong_ban?.trim() || null,
    ghi_chu: dto.ghi_chu?.trim() || null,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    idNguoiThucHien,
    'phong_ban',
    'tao_moi',
    moi.id,
    `Tao phong ban "${moi.ten_phong_ban}"`
  );
  return moi;
};

export const capNhatPhongBan = async (
  dto: CapNhatPhongBanDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<PhongBan> => {
  const hienTai = await layChiTietPhongBan(dto.id);
  if (!hienTai) throw new Error(`Khong ton tai phong ban id = ${dto.id}`);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiPhongBan> = {};
  (Object.keys(dto) as (keyof CapNhatPhongBanDTO)[]).forEach((k) => {
    if (k === 'id') return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    if (k === 'chi_nhanh_id') {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw ?? null;
    } else if (typeof giaTriRaw === 'string') {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw.trim() || null;
    } else {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw;
    }
  });
  patchRaw.ngay_cap_nhat = now;
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as PhongBan;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'phong_ban',
    'cap_nhat',
    moi.id,
    `Cap nhat phong ban "${moi.ten_phong_ban}"`
  );
  return moi;
};

export const xoaMemPhongBan = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<PhongBan> => {
  return capNhatPhongBan({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucPhongBan = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<PhongBan> => {
  return capNhatPhongBan({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const langNgheThayDoiDanhSachPhongBan = (
  callback: (mang: PhongBan[]) => void,
  loc?: DieuKienLocPhongBan
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    const daLoc = sapXepVaLocThem(mangRaw, loc);
    daLoc.sort((a, b) => (a.ten_phong_ban ?? '').localeCompare(b.ten_phong_ban ?? '', 'vi'));
    callback(daLoc);
  });
  return unsub;
};
