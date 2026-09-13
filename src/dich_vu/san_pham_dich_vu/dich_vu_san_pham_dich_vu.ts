'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  limit,
  onSnapshot,
  updateDoc,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe
} from 'firebase/firestore';
import type {
  LoaiSanPhamDichVu,
  SanPhamDichVu
} from '../../thu_vien/types/san_pham_dich_vu';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong,
  firebaseAuth
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'san_pham_dich_vu' as const;
const GIOI_HAN_MAC_DINH = 500;

export interface DieuKienLocSanPhamDichVu {
  tuKhoa?: string | null;
  loai?: 'tat_ca' | LoaiSanPhamDichVu | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  gioiHan?: number | null;
}

export interface TaoMoiSanPhamDichVuDTO {
  nhom_san_pham_id?: string | null;
  ten_san_pham: string;
  ma_san_pham?: string | null;
  loai?: LoaiSanPhamDichVu;
  don_vi_tinh?: string | null;
  gia_tham_khao?: number | null;
  mo_ta?: string | null;
  thu_tu_sap_xep?: number;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatSanPhamDichVuDTO extends Partial<Omit<TaoMoiSanPhamDichVuDTO, 'ten_san_pham' | 'trang_thai_du_lieu'>> {
  id: string;
  ten_san_pham?: string;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface KetQuaDanhSachSanPhamDichVu {
  mang: SanPhamDichVu[];
  tong: number;
}

type RawBanGhi = Omit<SanPhamDichVu, 'id'>;

const chuyenDoiDocThanhDoiTuong = (id: string, raw: DocumentData | RawBanGhi | undefined | null): SanPhamDichVu => {
  const r = (raw ?? {}) as Partial<RawBanGhi>;
  const today = new Date().toISOString();
  const tt = (r.trang_thai_du_lieu as SanPhamDichVu['trang_thai_du_lieu']) ?? 'hoat_dong';
  return {
    id,
    nhom_san_pham_id: r.nhom_san_pham_id ?? null,
    ma_san_pham: r.ma_san_pham ?? null,
    ten_san_pham: String(r.ten_san_pham ?? ''),
    loai: (r.loai as any) ?? 'san_pham',
    don_vi_tinh: r.don_vi_tinh ?? null,
    gia_tham_khao: typeof r.gia_tham_khao === 'number' ? r.gia_tham_khao : null,
    mo_ta: r.mo_ta ?? null,
    thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number' ? r.thu_tu_sap_xep : 0,
    nguoi_tao_id: r.nguoi_tao_id ?? null,
    ngay_tao: String(r.ngay_tao ?? today),
    ngay_cap_nhat: String(r.ngay_cap_nhat ?? today),
    trang_thai_du_lieu: tt
  };
};

const taoDieuKien = (dk: DieuKienLocSanPhamDichVu): QueryConstraint[] => {
  const mang: QueryConstraint[] = [];
  mang.push(limit(typeof dk.gioiHan === 'number' ? dk.gioiHan : GIOI_HAN_MAC_DINH));
  return mang;
};

const sortSanPhamTrongBoNho = (mang: SanPhamDichVu[]): SanPhamDichVu[] => {
  return [...mang].sort((a, b) => {
    const thuTu = (a.thu_tu_sap_xep ?? 0) - (b.thu_tu_sap_xep ?? 0);
    if (thuTu !== 0) return thuTu;
    return (a.ten_san_pham ?? '').localeCompare(b.ten_san_pham ?? '');
  });
};

const locTheoDieuKienCoSoDuLieuBoNho = (
  mang: SanPhamDichVu[],
  dk: DieuKienLocSanPhamDichVu
): SanPhamDichVu[] => {
  return mang.filter((x) => {
    if (dk.loai && dk.loai !== 'tat_ca') {
      if ((x.loai ?? 'san_pham') !== dk.loai) return false;
    }
    if (dk.trang_thai_du_lieu && dk.trang_thai_du_lieu !== 'tat_ca') {
      if ((x.trang_thai_du_lieu ?? 'hoat_dong') !== dk.trang_thai_du_lieu) return false;
    }
    return true;
  });
};

const locTheoTuKhoa = (mang: SanPhamDichVu[], tuKhoa: string | null | undefined): SanPhamDichVu[] => {
  const kw = String(tuKhoa ?? '').trim().toLowerCase();
  if (!kw) return mang;
  return mang.filter((x) =>
    [x.ten_san_pham, x.ma_san_pham, x.mo_ta, x.don_vi_tinh]
      .map((s) => (s ?? '').toString().toLowerCase())
      .some((s) => s.includes(kw))
  );
};

export const danhSachSanPhamDichVu = async (dk: DieuKienLocSanPhamDichVu = {}): Promise<KetQuaDanhSachSanPhamDichVu> => {
  const full: DieuKienLocSanPhamDichVu = { tuKhoa: null, loai: 'tat_ca', trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full)));
  const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
  const mang = sortSanPhamTrongBoNho(mangChuaSort);
  const daLocTheoDieuKien = locTheoDieuKienCoSoDuLieuBoNho(mang, full);
  const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
  return { mang: daLoc, tong: daLoc.length };
};

export const layChiTietSanPhamDichVu = async (id: string): Promise<SanPhamDichVu | null> => {
  const d = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!d.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(d.id, d.data());
};

const duLieuGhiTuDto = (dto: TaoMoiSanPhamDichVuDTO, nguoi_tao_id: string | null, ngayHienTai: string): RawBanGhi => ({
  nhom_san_pham_id: dto.nhom_san_pham_id ?? null,
  ten_san_pham: String(dto.ten_san_pham ?? '').trim(),
  ma_san_pham: dto.ma_san_pham?.trim() || null,
  loai: dto.loai ?? 'san_pham',
  don_vi_tinh: dto.don_vi_tinh?.trim() || null,
  gia_tham_khao: typeof dto.gia_tham_khao === 'number' ? dto.gia_tham_khao : null,
  mo_ta: dto.mo_ta?.trim() || null,
  thu_tu_sap_xep: typeof dto.thu_tu_sap_xep === 'number' ? dto.thu_tu_sap_xep : 0,
  nguoi_tao_id,
  ngay_tao: ngayHienTai,
  ngay_cap_nhat: ngayHienTai,
  trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
});

const layUidNguoiThucHien = (nguoiThucHien: any): string | null => {
  if (!nguoiThucHien) return firebaseAuth?.currentUser?.uid ?? null;
  return nguoiThucHien.id || nguoiThucHien.uid || firebaseAuth?.currentUser?.uid || null;
};

export const taoSanPhamDichVuMoi = async (dto: TaoMoiSanPhamDichVuDTO, nguoiThucHien: any = null): Promise<SanPhamDichVu> => {
  const today = new Date().toISOString();
  const uid = layUidNguoiThucHien(nguoiThucHien);
  const duLieuGoi = duLieuGhiTuDto(dto, uid, today);
  const ref = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuGoi as any);
  try {
    await ghiNhatKyHoatDong(
      uid,
      'danh_muc_san_pham',
      'tao_moi',
      ref.id,
      `Tạo mới sản phẩm/dịch vụ ${duLieuGoi.ten_san_pham}${duLieuGoi.ma_san_pham ? ` (${duLieuGoi.ma_san_pham})` : ''}`
    );
  } catch {
    /* ignore */
  }
  return { id: ref.id, ...duLieuGoi };
};

export const capNhatSanPhamDichVu = async (dto: CapNhatSanPhamDichVuDTO, nguoiThucHien: any = null): Promise<SanPhamDichVu> => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, dto.id);
  const trc = await getDoc(ref);
  if (!trc.exists()) throw new Error('Không tìm thấy sản phẩm/dịch vụ để cập nhật.');
  const banTruoc = chuyenDoiDocThanhDoiTuong(trc.id, trc.data());
  const today = new Date().toISOString();
  const capNhat: Record<string, any> = { ngay_cap_nhat: today };
  if (dto.nhom_san_pham_id !== undefined) capNhat.nhom_san_pham_id = dto.nhom_san_pham_id ?? null;
  if (dto.ten_san_pham !== undefined) capNhat.ten_san_pham = String(dto.ten_san_pham ?? '').trim();
  if (dto.ma_san_pham !== undefined) capNhat.ma_san_pham = dto.ma_san_pham?.trim() || null;
  if (dto.loai !== undefined) capNhat.loai = dto.loai;
  if (dto.don_vi_tinh !== undefined) capNhat.don_vi_tinh = dto.don_vi_tinh?.trim() || null;
  if (dto.gia_tham_khao !== undefined) capNhat.gia_tham_khao = typeof dto.gia_tham_khao === 'number' ? dto.gia_tham_khao : null;
  if (dto.mo_ta !== undefined) capNhat.mo_ta = dto.mo_ta?.trim() || null;
  if (dto.thu_tu_sap_xep !== undefined) capNhat.thu_tu_sap_xep = typeof dto.thu_tu_sap_xep === 'number' ? dto.thu_tu_sap_xep : 0;
  if (dto.trang_thai_du_lieu !== undefined) capNhat.trang_thai_du_lieu = dto.trang_thai_du_lieu;
  await updateDoc(ref, capNhat);
  const banSau = chuyenDoiDocThanhDoiTuong(trc.id, { ...banTruoc, ...capNhat } as any);
  const uid = layUidNguoiThucHien(nguoiThucHien);
  try {
    await ghiNhatKyHoatDong(
      uid,
      'danh_muc_san_pham',
      'cap_nhat',
      trc.id,
      `Cập nhật sản phẩm/dịch vụ ${banSau.ten_san_pham}`
    );
  } catch {
    /* ignore */
  }
  return banSau;
};

export const xoaMemSanPhamDichVu = async (id: string, nguoiThucHien: any = null): Promise<void> => {
  await capNhatSanPhamDichVu({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucSanPhamDichVu = async (id: string, nguoiThucHien: any = null): Promise<void> => {
  await capNhatSanPhamDichVu({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const langNgheThayDoi = (
  dk: DieuKienLocSanPhamDichVu = {},
  xuLy: (mang: SanPhamDichVu[]) => void
): Unsubscribe => {
  const full: DieuKienLocSanPhamDichVu = { tuKhoa: null, loai: 'tat_ca', trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  const ref = query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full));
  return onSnapshot(ref, (snap) => {
    const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    const mang = sortSanPhamTrongBoNho(mangChuaSort);
    const daLocTheoDieuKien = locTheoDieuKienCoSoDuLieuBoNho(mang, full);
    xuLy(locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa));
  });
};
