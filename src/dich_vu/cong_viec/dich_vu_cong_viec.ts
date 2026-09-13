'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import type { CongViec, TrangThaiCongViec } from '../../thu_vien/types/cong_viec';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'cong_viec' as const;
const GIOI_HAN_MAC_DINH = 100;

export interface DieuKienLocCongViec {
  tuKhoa?: string | null;
  du_an_id?: string | null;
  nguoi_thuc_hien_id?: string | null;
  nguoi_tao_id?: string | null;
  trang_thai?: TrangThaiCongViec | 'tat_ca' | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
  thoi_han_tu_ngay?: string | null;
  thoi_han_den_ngay?: string | null;
}

type RawBanGhiCV = Omit<CongViec, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiCV | undefined | null
): CongViec => {
  const r = (raw ?? {}) as Partial<RawBanGhiCV>;
  const today = new Date().toISOString();
  return {
    id,
    du_an_id: (r.du_an_id as string | null) ?? null,
    ten_cong_viec: (r.ten_cong_viec as string) ?? '(Chua dat ten)',
    mo_ta: (r.mo_ta as string | null) ?? null,
    nguoi_thuc_hien_id: (r.nguoi_thuc_hien_id as string | null) ?? null,
    thoi_han_hoan_thanh: (r.thoi_han_hoan_thanh as string | null) ?? null,
    trang_thai: (r.trang_thai as TrangThaiCongViec) ?? 'chua_thuc_hien',
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai_du_lieu: (r.trang_thai_du_lieu as CongViec['trang_thai_du_lieu']) ?? 'hoat_dong'
  };
};

const sapXepVaLocThem = (mang: CongViec[], loc?: DieuKienLocCongViec): CongViec[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((cv) => {
    if (tuKhoaLower) {
      const khop = cv.ten_cong_viec.toLowerCase().includes(tuKhoaLower)
        || (cv.mo_ta ?? '').toLowerCase().includes(tuKhoaLower)
        || (cv.ghi_chu ?? '').toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.ngay_tao_tu_ngay && cv.ngay_tao < loc.ngay_tao_tu_ngay) return false;
    if (loc?.ngay_tao_den_ngay && cv.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return false;
    if (loc?.thoi_han_tu_ngay && (!cv.thoi_han_hoan_thanh || cv.thoi_han_hoan_thanh < loc.thoi_han_tu_ngay)) return false;
    if (loc?.thoi_han_den_ngay && (!cv.thoi_han_hoan_thanh || cv.thoi_han_hoan_thanh > loc.thoi_han_den_ngay)) return false;
    return true;
  });
};

export const danhSachCongViec = async (
  loc?: DieuKienLocCongViec
): Promise<{ mang: CongViec[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.du_an_id) {
    mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  }
  if (loc?.nguoi_thuc_hien_id) {
    mangRangBuoc.unshift(where('nguoi_thuc_hien_id', '==', loc.nguoi_thuc_hien_id));
  }
  if (loc?.nguoi_tao_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_tao_id));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', loc.trang_thai_du_lieu));
  }
  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const resultsRaw: CongViec[] = [];
    for (const d of snapshot.docs) {
      resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    }
    resultsRaw.sort((a, b) => (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? ''));
    return { mang: sapXepVaLocThem(resultsRaw, loc), tong_so: snapshot.size };
  } catch (err) {
    console.warn('[dich_vu_cong_viec] danhSachCongViec catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietCongViec = async (id: string): Promise<CongViec | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export interface TaoMoiCongViecDTO {
  du_an_id?: string | null;
  ten_cong_viec: string;
  mo_ta?: string | null;
  nguoi_thuc_hien_id?: string | null;
  thoi_han_hoan_thanh?: string | null;
  trang_thai?: TrangThaiCongViec | string;
  ghi_chu?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export const taoCongViecMoi = async (
  dto: TaoMoiCongViecDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<CongViec> => {
  if (!dto.ten_cong_viec || !dto.ten_cong_viec.trim()) {
    throw new Error('Ten cong viec khong duoc de trong.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const duLieuRaw: RawBanGhiCV = {
    du_an_id: dto.du_an_id ?? null,
    ten_cong_viec: dto.ten_cong_viec.trim(),
    mo_ta: dto.mo_ta?.trim() || null,
    nguoi_thuc_hien_id: dto.nguoi_thuc_hien_id ?? idNguoiThucHien,
    thoi_han_hoan_thanh: dto.thoi_han_hoan_thanh ?? null,
    trang_thai: dto.trang_thai ?? 'chua_thuc_hien',
    ghi_chu: dto.ghi_chu?.trim() || null,
    nguoi_tao_id: idNguoiThucHien,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'cong_viec',
    'tao_moi',
    moi.id,
    `Tao cong viec "${moi.ten_cong_viec}"`
  );
  return moi;
};

export interface CapNhatCongViecDTO extends Partial<TaoMoiCongViecDTO> {
  id: string;
}

export const capNhatCongViec = async (
  dto: CapNhatCongViecDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<CongViec> => {
  const hienTai = await layChiTietCongViec(dto.id);
  if (!hienTai) throw new Error(`Khong ton tai cong viec id = ${dto.id}`);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiCV> = {};
  (Object.keys(dto) as (keyof CapNhatCongViecDTO)[]).forEach((k) => {
    if (k === 'id') return;
    if (!Object.prototype.hasOwnProperty.call(dto, k)) return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    if (typeof giaTriRaw === 'string' && k !== 'trang_thai' && k !== 'trang_thai_du_lieu') {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw.trim() || null;
    } else {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw;
    }
  });
  patchRaw.ngay_cap_nhat = now;
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as CongViec;
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'cong_viec',
    'cap_nhat',
    moi.id,
    `Cap nhat cong viec "${moi.ten_cong_viec}"`
  );
  return moi;
};

export const doiTrangThaiCongViec = async (
  id: string,
  trang_thai_moi: TrangThaiCongViec,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<CongViec> => {
  const res = await capNhatCongViec({ id, trang_thai: trang_thai_moi }, nguoiThucHien);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'cong_viec',
    'thay_doi_trang_thai',
    id,
    `Doi trang thai cong viec "${res.ten_cong_viec}" thanh "${trang_thai_moi}"`
  );
  return res;
};

export const xoaMemCongViec = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<CongViec> => {
  return capNhatCongViec({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const CHUOI_TRANG_THAI_CONG_VIEC: TrangThaiCongViec[] = [
  'chua_thuc_hien',
  'dang_thuc_hien',
  'hoan_thanh',
  'tam_dung'
];

export const chuyenTrangThaiTiepTheo = (hienTai: TrangThaiCongViec): TrangThaiCongViec => {
  const idx = CHUOI_TRANG_THAI_CONG_VIEC.indexOf(hienTai);
  if (idx < 0 || idx >= CHUOI_TRANG_THAI_CONG_VIEC.length - 1) return CHUOI_TRANG_THAI_CONG_VIEC[0];
  return CHUOI_TRANG_THAI_CONG_VIEC[idx + 1];
};

export const langNgheThayDoiDanhSachCongViec = (
  callback: (mang: CongViec[]) => void,
  loc?: DieuKienLocCongViec
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.du_an_id) {
    mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  }
  if (loc?.nguoi_thuc_hien_id) {
    mangRangBuoc.unshift(where('nguoi_thuc_hien_id', '==', loc.nguoi_thuc_hien_id));
  }
  if (loc?.nguoi_tao_id) {
    mangRangBuoc.unshift(where('nguoi_tao_id', '==', loc.nguoi_tao_id));
  }
  if (loc?.trang_thai && loc.trang_thai !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai', '==', loc.trang_thai));
  }
  if (loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', loc.trang_thai_du_lieu));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw: CongViec[] = [];
    snap.forEach((d) => {
      mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    });
    mangRaw.sort((a, b) => b.ngay_cap_nhat.localeCompare(a.ngay_cap_nhat));
    callback(sapXepVaLocThem(mangRaw, loc));
  });
  return unsub;
};
