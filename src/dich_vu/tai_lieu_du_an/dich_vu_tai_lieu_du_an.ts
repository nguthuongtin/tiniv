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
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'tai_lieu_du_an' as const;
const GIOI_HAN_MAC_DINH = 200;

export interface TaiLieuDuAn {
  id: string;
  du_an_id: string;
  ten_file: string;
  url_file: string;
  kich_thuoc: number | null;
  loai_file: string | null;
  ghi_chu: string | null;
  nguoi_tai_len_id: string | null;
  ngay_tai_len: string;
}

export interface DieuKienLocTaiLieuDuAn {
  du_an_id?: string | null;
  tuKhoa?: string | null;
  ngay_tai_len_tu?: string | null;
  ngay_tai_len_den?: string | null;
}

type RawBanGhiTL = Omit<TaiLieuDuAn, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiTL | undefined | null
): TaiLieuDuAn => {
  const r = (raw ?? {}) as Partial<RawBanGhiTL>;
  const today = new Date().toISOString();
  return {
    id,
    du_an_id: (r.du_an_id as string) ?? '',
    ten_file: (r.ten_file as string) ?? '(Chưa có tên file)',
    url_file: (r.url_file as string) ?? '',
    kich_thuoc: typeof r.kich_thuoc === 'number' ? r.kich_thuoc : null,
    loai_file: (r.loai_file as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    nguoi_tai_len_id: (r.nguoi_tai_len_id as string | null) ?? null,
    ngay_tai_len: (r.ngay_tai_len as string) ?? today
  };
};

const sapXepVaLocThem = (mang: TaiLieuDuAn[], loc?: DieuKienLocTaiLieuDuAn): TaiLieuDuAn[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((tl) => {
    if (tuKhoaLower && !tl.ten_file.toLowerCase().includes(tuKhoaLower)) return false;
    if (loc?.ngay_tai_len_tu && tl.ngay_tai_len < loc.ngay_tai_len_tu) return false;
    if (loc?.ngay_tai_len_den && tl.ngay_tai_len > loc.ngay_tai_len_den + 'T23:59:59.999Z') return false;
    return true;
  });
};

export const danhSachTaiLieuDuAn = async (
  loc?: DieuKienLocTaiLieuDuAn
): Promise<{ mang: TaiLieuDuAn[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.du_an_id) {
    mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  }
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const resultsRaw: TaiLieuDuAn[] = [];
    for (const d of snapshot.docs) {
      resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    }
    resultsRaw.sort((a, b) => b.ngay_tai_len.localeCompare(a.ngay_tai_len));
    return { mang: sapXepVaLocThem(resultsRaw, loc), tong_so: snapshot.size };
  } catch (err) {
    console.warn('[dich_vu_tai_lieu_du_an] danhSachTaiLieuDuAn catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietTaiLieuDuAn = async (id: string): Promise<TaiLieuDuAn | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export interface TaoMoiTaiLieuDuAnDTO {
  du_an_id: string;
  ten_file: string;
  url_file: string;
  kich_thuoc?: number | null;
  loai_file?: string | null;
  ghi_chu?: string | null;
  nguoi_tai_len_id?: string | null;
}

export const themTaiLieuDuAn = async (
  dto: TaoMoiTaiLieuDuAnDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<TaiLieuDuAn> => {
  if (!dto.ten_file || !dto.ten_file.trim()) {
    throw new Error('Tên file không được để trống.');
  }
  if (!dto.du_an_id) {
    throw new Error('Tài liệu phải thuộc 1 hồ sơ dự án.');
  }
  if (!dto.url_file || !dto.url_file.trim()) {
    throw new Error('URL file không được để trống.');
  }
  const now = new Date().toISOString();
  const duLieuRaw: RawBanGhiTL = {
    du_an_id: dto.du_an_id,
    ten_file: dto.ten_file.trim(),
    url_file: dto.url_file.trim(),
    kich_thuoc: typeof dto.kich_thuoc === 'number' ? dto.kich_thuoc : null,
    loai_file: dto.loai_file?.trim() || null,
    ghi_chu: typeof dto.ghi_chu === 'string' ? dto.ghi_chu.trim() || null : null,
    nguoi_tai_len_id: dto.nguoi_tai_len_id ?? nguoiThucHien?.id ?? null,
    ngay_tai_len: now
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'upload_file',
    moi.du_an_id,
    `Tải lên tài liệu "${moi.ten_file}"`
  );
  return moi;
};

export interface CapNhatTaiLieuDuAnDTO extends Partial<TaoMoiTaiLieuDuAnDTO> {
  id: string;
}

export const capNhatTaiLieuDuAn = async (
  dto: CapNhatTaiLieuDuAnDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<TaiLieuDuAn> => {
  const hienTai = await layChiTietTaiLieuDuAn(dto.id);
  if (!hienTai) throw new Error(`Không tồn tại tài liệu id = ${dto.id}`);
  const patchRaw: Partial<RawBanGhiTL> = {};
  (Object.keys(dto) as (keyof CapNhatTaiLieuDuAnDTO)[]).forEach((k) => {
    if (k === 'id') return;
    if (!Object.prototype.hasOwnProperty.call(dto, k)) return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    (patchRaw as unknown as Record<string, unknown>)[k] =
      typeof giaTriRaw === 'string' ? giaTriRaw.trim() || null : giaTriRaw;
  });
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as TaiLieuDuAn;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'cap_nhat',
    moi.du_an_id,
    `Cập nhật tài liệu "${moi.ten_file}"`
  );
  return moi;
};

export const xoaTaiLieuDuAn = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<void> => {
  const hienTai = await layChiTietTaiLieuDuAn(id);
  if (!hienTai) return;
  await deleteDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'ho_so_du_an',
    'xoa',
    hienTai.du_an_id,
    `Xóa tài liệu "${hienTai.ten_file}"`
  );
};

export const langNgheThayDoiDanhSachTaiLieuDuAn = (
  callback: (mang: TaiLieuDuAn[]) => void,
  loc?: DieuKienLocTaiLieuDuAn
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.du_an_id) {
    mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw: TaiLieuDuAn[] = [];
    snap.forEach((d) => mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data())));
    mangRaw.sort((a, b) => b.ngay_tai_len.localeCompare(a.ngay_tai_len));
    callback(sapXepVaLocThem(mangRaw, loc));
  });
  return unsub;
};
