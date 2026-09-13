'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import type { NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'nguoi_lien_he' as const;
const GIOI_HAN_MAC_DINH = 200;

export interface DieuKienLocNguoiLienHe {
  tuKhoa?: string | null;
  khach_hang_id?: string | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
}

type RawBanGhiNLH = Omit<NguoiLienHe, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiNLH | undefined | null
): NguoiLienHe => {
  const r = (raw ?? {}) as Partial<RawBanGhiNLH>;
  const today = new Date().toISOString();
  return {
    id,
    khach_hang_id: (r.khach_hang_id as string) ?? '',
    ho_va_ten: (r.ho_va_ten as string) ?? '(Chưa đặt tên)',
    chuc_vu: (r.chuc_vu as string | null) ?? null,
    so_dien_thoai: (r.so_dien_thoai as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today
  };
};

const sapXepVaLocThem = (mang: NguoiLienHe[], loc?: DieuKienLocNguoiLienHe): NguoiLienHe[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((nlh) => {
    if (tuKhoaLower) {
      const khop =
        nlh.ho_va_ten.toLowerCase().includes(tuKhoaLower) ||
        (nlh.chuc_vu ?? '').toLowerCase().includes(tuKhoaLower) ||
        (nlh.so_dien_thoai ?? '').includes(tuKhoaLower) ||
        (nlh.email ?? '').toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.ngay_tao_tu_ngay && nlh.ngay_tao < loc.ngay_tao_tu_ngay) return false;
    if (loc?.ngay_tao_den_ngay && nlh.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return false;
    return true;
  });
};

export const danhSachNguoiLienHe = async (
  loc?: DieuKienLocNguoiLienHe
): Promise<{ mang: NguoiLienHe[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.khach_hang_id) {
    mangRangBuoc.unshift(where('khach_hang_id', '==', loc.khach_hang_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const snapshot = await getDocs(q);
  const resultsRaw: NguoiLienHe[] = [];
  for (const d of snapshot.docs) {
    resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
  }
  resultsRaw.sort((a, b) => a.ho_va_ten.localeCompare(b.ho_va_ten, 'vi'));
  return { mang: sapXepVaLocThem(resultsRaw, loc), tong_so: snapshot.size };
};

export const layChiTietNguoiLienHe = async (id: string): Promise<NguoiLienHe | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export interface TaoMoiNguoiLienHeDTO {
  khach_hang_id: string;
  ho_va_ten: string;
  chuc_vu?: string | null;
  so_dien_thoai?: string | null;
  email?: string | null;
  ghi_chu?: string | null;
}

export const taoNguoiLienHeMoi = async (
  dto: TaoMoiNguoiLienHeDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<NguoiLienHe> => {
  if (!dto.ho_va_ten || !dto.ho_va_ten.trim()) {
    throw new Error('Họ và tên liên hệ không được để trống.');
  }
  if (!dto.khach_hang_id) {
    throw new Error('Liên hệ phải thuộc 1 khách hàng.');
  }
  const now = new Date().toISOString();
  const duLieuRaw: RawBanGhiNLH = {
    khach_hang_id: dto.khach_hang_id,
    ho_va_ten: dto.ho_va_ten.trim(),
    chuc_vu: dto.chuc_vu?.trim() || null,
    so_dien_thoai: dto.so_dien_thoai?.trim() || null,
    email: dto.email?.trim() || null,
    ghi_chu: dto.ghi_chu?.trim() || null,
    ngay_tao: now
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'khach_hang',
    'tao_moi',
    moi.khach_hang_id,
    `Thêm liên hệ "${moi.ho_va_ten}" cho khách hàng`
  );
  return moi;
};

export interface CapNhatNguoiLienHeDTO extends Partial<TaoMoiNguoiLienHeDTO> {
  id: string;
}

export const capNhatNguoiLienHe = async (
  dto: CapNhatNguoiLienHeDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<NguoiLienHe> => {
  const hienTai = await layChiTietNguoiLienHe(dto.id);
  if (!hienTai) throw new Error(`Không tồn tại liên hệ id = ${dto.id}`);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiNLH> = {};
  (Object.keys(dto) as (keyof CapNhatNguoiLienHeDTO)[]).forEach((k) => {
    if (k === 'id') return;
    if (!Object.prototype.hasOwnProperty.call(dto, k)) return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    (patchRaw as unknown as Record<string, unknown>)[k] =
      typeof giaTriRaw === 'string' ? giaTriRaw.trim() || null : giaTriRaw;
  });
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as NguoiLienHe;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'khach_hang',
    'cap_nhat',
    moi.khach_hang_id,
    `Cập nhật liên hệ "${moi.ho_va_ten}"`
  );
  return moi;
};

export const xoaNguoiLienHe = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<void> => {
  const hienTai = await layChiTietNguoiLienHe(id);
  if (!hienTai) return;
  await deleteDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'khach_hang',
    'xoa',
    hienTai.khach_hang_id,
    `Xóa liên hệ "${hienTai.ho_va_ten}"`
  );
};

export const langNgheThayDoiDanhSachNguoiLienHe = (
  callback: (mang: NguoiLienHe[]) => void,
  loc?: DieuKienLocNguoiLienHe
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [
    orderBy('ho_va_ten', 'asc'),
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.khach_hang_id) {
    mangRangBuoc.unshift(where('khach_hang_id', '==', loc.khach_hang_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw: NguoiLienHe[] = [];
    snap.forEach((d) => mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data())));
    callback(sapXepVaLocThem(mangRaw, loc));
  });
  return unsub;
};
