'use client';

import {
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
  type DocumentData
} from 'firebase/firestore';
import type { NguoiLienHe, KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'nguoi_lien_he' as const;
type RawNLH = Omit<NguoiLienHe, 'id'>;

const chuyenDoiDocThanhDoiTuong = (id: string, raw: DocumentData | RawNLH | undefined | null): NguoiLienHe => {
  const r = (raw ?? {}) as Partial<RawNLH>;
  const today = new Date().toISOString();
  return {
    id,
    khach_hang_id: (r.khach_hang_id as string) ?? '',
    ho_va_ten: (r.ho_va_ten as string) ?? '(Chua dat ten)',
    chuc_vu: (r.chuc_vu as string | null) ?? null,
    so_dien_thoai: (r.so_dien_thoai as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today
  };
};

export const layDanhSachNguoiLienHeTheoKhachHang = async (
  khach_hang_id: string
): Promise<NguoiLienHe[]> => {
  if (!khach_hang_id) return [];
  const q = query(
    thamChieuCollection(TEN_COLLECTION),
    where('khach_hang_id', '==', khach_hang_id)
  );
  const snap = await getDocs(q);
  const mang = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
  mang.sort((a, b) => (b.ngay_tao ?? '').localeCompare(a.ngay_tao ?? ''));
  return mang;
};

export const langNgheThayDoiNguoiLienHeTheoKhachHang = (
  khach_hang_id: string,
  callback: (mang: NguoiLienHe[]) => void
): (() => void) => {
  if (!khach_hang_id) return () => {};
  const q = query(
    thamChieuCollection(TEN_COLLECTION),
    where('khach_hang_id', '==', khach_hang_id)
  );
  return onSnapshot(q, (snap) => {
    const mang = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    mang.sort((a, b) => (b.ngay_tao ?? '').localeCompare(a.ngay_tao ?? ''));
    callback(mang);
  });
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
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined,
  thongTinKhachHang?: Pick<KhachHang, 'ten_khach_hang'> | null
): Promise<NguoiLienHe> => {
  if (!dto.khach_hang_id) throw new Error('Thieu khach_hang_id khi tao nguoi lien he.');
  if (!dto.ho_va_ten || !dto.ho_va_ten.trim()) throw new Error('Ho va ten khong duoc de trong.');
  const now = new Date().toISOString();
  const raw: RawNLH = {
    khach_hang_id: dto.khach_hang_id,
    ho_va_ten: dto.ho_va_ten.trim(),
    chuc_vu: dto.chuc_vu?.trim() || null,
    so_dien_thoai: dto.so_dien_thoai?.trim() || null,
    email: dto.email?.trim() || null,
    ghi_chu: dto.ghi_chu?.trim() || null,
    ngay_tao: now
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), raw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, raw);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nguoi_lien_he',
    'tao_moi',
    moi.id,
    `Tao nguoi lien he "${moi.ho_va_ten}" cho khach hang "${thongTinKhachHang?.ten_khach_hang ?? moi.khach_hang_id}"`
  );
  return moi;
};

export interface CapNhatNguoiLienHeDTO extends Partial<Omit<TaoMoiNguoiLienHeDTO, 'khach_hang_id'>> {
  id: string;
}

export const capNhatNguoiLienHe = async (
  dto: CapNhatNguoiLienHeDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<NguoiLienHe> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id));
  if (!snap.exists()) throw new Error(`Khong ton tai nguoi lien he id = ${dto.id}`);
  const hienTai = chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
  const patch: Partial<RawNLH> = {};
  (Object.keys(dto) as (keyof CapNhatNguoiLienHeDTO)[]).forEach((k) => {
    if (k === 'id') return;
    const giaTri = (dto as unknown as Record<string, unknown>)[k];
    if (giaTri === undefined) return;
    (patch as unknown as Record<string, unknown>)[k] = typeof giaTri === 'string' ? giaTri.trim() || null : giaTri;
  });
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patch as any, { merge: true });
  const moi = { ...hienTai, ...patch } as NguoiLienHe;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nguoi_lien_he',
    'cap_nhat',
    moi.id,
    `Cap nhat nguoi lien he "${moi.ho_va_ten}"`
  );
  return moi;
};

export const xoaNguoiLienHe = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined,
  hoVaTenCu?: string | null
): Promise<void> => {
  await deleteDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nguoi_lien_he',
    'xoa',
    id,
    `Xoa nguoi lien he "${hoVaTenCu ?? id}"`
  );
};
