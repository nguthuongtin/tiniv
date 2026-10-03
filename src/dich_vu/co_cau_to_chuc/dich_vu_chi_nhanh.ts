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
import type { ChiNhanh } from '../../thu_vien/types/nhan_su';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'chi_nhanh' as const;
const GIOI_HAN_MAC_DINH = 100;

export interface DieuKienLocChiNhanh {
  tuKhoa?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
}

export interface TaoMoiChiNhanhDTO {
  ten_chi_nhanh: string;
  ma_chi_nhanh?: string | null;
  dia_chi?: string | null;
  so_dien_thoai?: string | null;
  ghi_chu?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatChiNhanhDTO extends Partial<TaoMoiChiNhanhDTO> {
  id: string;
}

type RawBanGhiChiNhanh = Omit<ChiNhanh, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiChiNhanh | undefined | null
): ChiNhanh => {
  const r = (raw ?? {}) as Partial<RawBanGhiChiNhanh>;
  const today = new Date().toISOString();
  const ttDuLieu = (r.trang_thai_du_lieu as ChiNhanh['trang_thai_du_lieu']) ?? 'hoat_dong';
  return {
    id,
    ten_chi_nhanh: (r.ten_chi_nhanh as string) ?? '(Chua dat ten chi nhanh)',
    ma_chi_nhanh: (r.ma_chi_nhanh as string | null) ?? null,
    dia_chi: (r.dia_chi as string | null) ?? null,
    so_dien_thoai: (r.so_dien_thoai as string | null) ?? null,
    ghi_chu: (r.ghi_chu as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai_du_lieu: ttDuLieu
  };
};

const sapXepVaLocThem = (mang: ChiNhanh[], loc?: DieuKienLocChiNhanh): ChiNhanh[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((cn) => {
    if (loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca' && cn.trang_thai_du_lieu !== loc.trang_thai_du_lieu) return false;
    if (tuKhoaLower) {
      const khop =
        cn.ten_chi_nhanh.toLowerCase().includes(tuKhoaLower) ||
        (cn.ma_chi_nhanh ?? '').toLowerCase().includes(tuKhoaLower) ||
        (cn.dia_chi ?? '').toLowerCase().includes(tuKhoaLower) ||
        (cn.so_dien_thoai ?? '').toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    return true;
  });
};

let _rawCacheCN: { mang: ChiNhanh[]; ts: number } | null = null;
let _dangTaiCNPromise: Promise<ChiNhanh[]> | null = null;
const CACHE_TTL_CN = 10 * 60 * 1000; // 10 phút

export const layCacheChiNhanhDongBo = (
  loc?: DieuKienLocChiNhanh
): { mang: ChiNhanh[]; tong_so: number } | null => {
  if (!_rawCacheCN) return null;
  const ttDuLieu = loc?.trang_thai_du_lieu ?? 'hoat_dong';
  const mangDaLoc = sapXepVaLocThem(_rawCacheCN.mang, { ...loc, trang_thai_du_lieu: ttDuLieu });
  return { mang: mangDaLoc, tong_so: mangDaLoc.length };
};

export const danhSachChiNhanh = async (
  loc?: DieuKienLocChiNhanh
): Promise<{ mang: ChiNhanh[]; tong_so?: number }> => {
  const ttDuLieu = loc?.trang_thai_du_lieu ?? 'hoat_dong';
  if (_rawCacheCN && Date.now() - _rawCacheCN.ts < CACHE_TTL_CN) {
    const mangDaLoc = sapXepVaLocThem(_rawCacheCN.mang, { ...loc, trang_thai_du_lieu: ttDuLieu });
    return { mang: mangDaLoc, tong_so: mangDaLoc.length };
  }

  try {
    if (!_dangTaiCNPromise) {
      _dangTaiCNPromise = (async () => {
        try {
          const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), limit(GIOI_HAN_MAC_DINH)));
          const mangRaw = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
          mangRaw.sort((a, b) => (a.ten_chi_nhanh ?? '').localeCompare(b.ten_chi_nhanh ?? '', 'vi'));
          _rawCacheCN = { mang: mangRaw, ts: Date.now() };
          return mangRaw;
        } finally {
          _dangTaiCNPromise = null;
        }
      })();
    }

    const rawAll = await _dangTaiCNPromise;
    const mangDaLoc = sapXepVaLocThem(rawAll, { ...loc, trang_thai_du_lieu: ttDuLieu });
    return { mang: mangDaLoc, tong_so: mangDaLoc.length };
  } catch {
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietChiNhanh = async (id: string): Promise<ChiNhanh | null> => {
  if (_rawCacheCN) {
    const found = _rawCacheCN.mang.find((c) => c.id === id);
    if (found) return found;
  }
  try {
    const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
    if (!snap.exists()) return null;
    return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
  } catch {
    return null;
  }
};

export const taoChiNhanhMoi = async (
  dto: TaoMoiChiNhanhDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChiNhanh> => {
  if (!dto.ten_chi_nhanh || !dto.ten_chi_nhanh.trim()) {
    throw new Error('Ten chi nhanh khong duoc de trong.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const duLieuRaw: RawBanGhiChiNhanh = {
    ten_chi_nhanh: dto.ten_chi_nhanh.trim(),
    ma_chi_nhanh: dto.ma_chi_nhanh?.trim() || null,
    dia_chi: dto.dia_chi?.trim() || null,
    so_dien_thoai: dto.so_dien_thoai?.trim() || null,
    ghi_chu: dto.ghi_chu?.trim() || null,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  };
  const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
  const moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
  if (_rawCacheCN) {
    _rawCacheCN = {
      mang: [..._rawCacheCN.mang.filter((c) => c.id !== moi.id), moi].sort((a, b) =>
        (a.ten_chi_nhanh ?? '').localeCompare(b.ten_chi_nhanh ?? '', 'vi')
      ),
      ts: Date.now()
    };
  }
  void ghiNhatKyHoatDong(
    idNguoiThucHien,
    'chi_nhanh',
    'tao_moi',
    moi.id,
    `Tao chi nhanh "${moi.ten_chi_nhanh}"`
  );
  return moi;
};

export const capNhatChiNhanh = async (
  dto: CapNhatChiNhanhDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChiNhanh> => {
  const hienTai = await layChiTietChiNhanh(dto.id);
  if (!hienTai) throw new Error(`Khong ton tai chi nhanh id = ${dto.id}`);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhiChiNhanh> = {};
  (Object.keys(dto) as (keyof CapNhatChiNhanhDTO)[]).forEach((k) => {
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
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), patchRaw as any, { merge: true });
  const moi = { ...hienTai, ...patchRaw } as ChiNhanh;
  if (_rawCacheCN) {
    const idx = _rawCacheCN.mang.findIndex((c) => c.id === moi.id);
    const mangMoi = [..._rawCacheCN.mang];
    if (idx >= 0) mangMoi[idx] = moi;
    else mangMoi.push(moi);
    mangMoi.sort((a, b) => (a.ten_chi_nhanh ?? '').localeCompare(b.ten_chi_nhanh ?? '', 'vi'));
    _rawCacheCN = { mang: mangMoi, ts: Date.now() };
  }
  void ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'chi_nhanh',
    'cap_nhat',
    moi.id,
    `Cap nhat chi nhanh "${moi.ten_chi_nhanh}"`
  );
  return moi;
};

export const xoaMemChiNhanh = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChiNhanh> => {
  return capNhatChiNhanh({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucChiNhanh = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChiNhanh> => {
  return capNhatChiNhanh({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const langNgheThayDoiDanhSachChiNhanh = (
  callback: (mang: ChiNhanh[]) => void,
  loc?: DieuKienLocChiNhanh
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    const mangRaw = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    const daLoc = sapXepVaLocThem(mangRaw, loc);
    daLoc.sort((a, b) => (a.ten_chi_nhanh ?? '').localeCompare(b.ten_chi_nhanh ?? '', 'vi'));
    callback(daLoc);
  });
  return unsub;
};
