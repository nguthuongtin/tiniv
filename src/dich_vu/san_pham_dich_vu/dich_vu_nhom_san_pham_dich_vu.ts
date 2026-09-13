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
import type { NhomSanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong,
  firebaseAuth
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'nhom_san_pham_dich_vu' as const;
const GIOI_HAN_MAC_DINH = 500;

export interface DieuKienLocNhomSanPhamDichVu {
  tuKhoa?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  gioiHan?: number | null;
}

export interface TaoMoiNhomSanPhamDichVuDTO {
  ten_nhom: string;
  ma_nhom?: string | null;
  mo_ta?: string | null;
  mau_sac?: string | null;
  icon_hien_thi?: string | null;
  thu_tu_sap_xep?: number;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatNhomSanPhamDichVuDTO extends Partial<Omit<TaoMoiNhomSanPhamDichVuDTO, 'ten_nhom' | 'trang_thai_du_lieu'>> {
  id: string;
  ten_nhom?: string;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface KetQuaDanhSachNhomSanPhamDichVu {
  mang: NhomSanPhamDichVu[];
  tong: number;
}

type RawBanGhi = Omit<NhomSanPhamDichVu, 'id'>;

const chuyenDoiDocThanhDoiTuong = (id: string, raw: DocumentData | RawBanGhi | undefined | null): NhomSanPhamDichVu => {
  const r = (raw ?? {}) as Partial<RawBanGhi>;
  const today = new Date().toISOString();
  const tt = (r.trang_thai_du_lieu as NhomSanPhamDichVu['trang_thai_du_lieu']) ?? 'hoat_dong';
  return {
    id,
    ma_nhom: r.ma_nhom ?? null,
    ten_nhom: String(r.ten_nhom ?? ''),
    mo_ta: r.mo_ta ?? null,
    mau_sac: r.mau_sac ?? null,
    icon_hien_thi: r.icon_hien_thi ?? null,
    thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number' ? r.thu_tu_sap_xep : 0,
    nguoi_tao_id: r.nguoi_tao_id ?? null,
    ngay_tao: String(r.ngay_tao ?? today),
    ngay_cap_nhat: String(r.ngay_cap_nhat ?? today),
    trang_thai_du_lieu: tt
  };
};

const taoDieuKien = (dk: DieuKienLocNhomSanPhamDichVu): QueryConstraint[] => {
  const mang: QueryConstraint[] = [];
  mang.push(limit(typeof dk.gioiHan === 'number' ? dk.gioiHan : GIOI_HAN_MAC_DINH));
  return mang;
};

const sortNhomTrongBoNho = (mang: NhomSanPhamDichVu[]): NhomSanPhamDichVu[] => {
  return [...mang].sort((a, b) => {
    const thuTu = (a.thu_tu_sap_xep ?? 0) - (b.thu_tu_sap_xep ?? 0);
    if (thuTu !== 0) return thuTu;
    return (a.ten_nhom ?? '').localeCompare(b.ten_nhom ?? '');
  });
};

const locTheoDieuKienCoSoDuLieuBoNho = (
  mang: NhomSanPhamDichVu[],
  dk: DieuKienLocNhomSanPhamDichVu
): NhomSanPhamDichVu[] => {
  return mang.filter((x) => {
    if (dk.trang_thai_du_lieu && dk.trang_thai_du_lieu !== 'tat_ca') {
      if ((x.trang_thai_du_lieu ?? 'hoat_dong') !== dk.trang_thai_du_lieu) return false;
    }
    return true;
  });
};

const locTheoTuKhoa = (mang: NhomSanPhamDichVu[], tuKhoa: string | null | undefined): NhomSanPhamDichVu[] => {
  const kw = String(tuKhoa ?? '').trim().toLowerCase();
  if (!kw) return mang;
  return mang.filter((x) =>
    [x.ten_nhom, x.ma_nhom, x.mo_ta, x.mau_sac, x.icon_hien_thi]
      .map((s) => (s ?? '').toString().toLowerCase())
      .some((s) => s.includes(kw))
  );
};

export const danhSachNhomSanPhamDichVu = async (dk: DieuKienLocNhomSanPhamDichVu = {}): Promise<KetQuaDanhSachNhomSanPhamDichVu> => {
  const full: DieuKienLocNhomSanPhamDichVu = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full)));
  const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
  const mang = sortNhomTrongBoNho(mangChuaSort);
  const daLocTheoDieuKien = locTheoDieuKienCoSoDuLieuBoNho(mang, full);
  const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
  return { mang: daLoc, tong: daLoc.length };
};

export const layChiTietNhomSanPhamDichVu = async (id: string): Promise<NhomSanPhamDichVu | null> => {
  const d = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!d.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(d.id, d.data());
};

const duLieuGhiTuDto = (dto: TaoMoiNhomSanPhamDichVuDTO, nguoi_tao_id: string | null, ngayHienTai: string): RawBanGhi => ({
  ten_nhom: String(dto.ten_nhom ?? '').trim(),
  ma_nhom: dto.ma_nhom?.trim() || null,
  mo_ta: dto.mo_ta?.trim() || null,
  mau_sac: dto.mau_sac?.trim() || null,
  icon_hien_thi: dto.icon_hien_thi?.trim() || null,
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

export const taoNhomSanPhamDichVuMoi = async (dto: TaoMoiNhomSanPhamDichVuDTO, nguoiThucHien: any = null): Promise<NhomSanPhamDichVu> => {
  const today = new Date().toISOString();
  const uid = layUidNguoiThucHien(nguoiThucHien);
  const duLieuGoi = duLieuGhiTuDto(dto, uid, today);
  const ref = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuGoi as any);
  try {
    await ghiNhatKyHoatDong(
      uid,
      'nhom_san_pham',
      'tao_moi',
      ref.id,
      `Tạo mới nhóm ${duLieuGoi.ten_nhom}${duLieuGoi.ma_nhom ? ` (${duLieuGoi.ma_nhom})` : ''}`
    );
  } catch {
    /* ignore */
  }
  return { id: ref.id, ...duLieuGoi };
};

export const capNhatNhomSanPhamDichVu = async (dto: CapNhatNhomSanPhamDichVuDTO, nguoiThucHien: any = null): Promise<NhomSanPhamDichVu> => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, dto.id);
  const trc = await getDoc(ref);
  if (!trc.exists()) throw new Error('Không tìm thấy nhóm để cập nhật.');
  const banTruoc = chuyenDoiDocThanhDoiTuong(trc.id, trc.data());
  const today = new Date().toISOString();
  const capNhat: Record<string, any> = { ngay_cap_nhat: today };
  if (dto.ten_nhom !== undefined) capNhat.ten_nhom = String(dto.ten_nhom ?? '').trim();
  if (dto.ma_nhom !== undefined) capNhat.ma_nhom = dto.ma_nhom?.trim() || null;
  if (dto.mo_ta !== undefined) capNhat.mo_ta = dto.mo_ta?.trim() || null;
  if (dto.mau_sac !== undefined) capNhat.mau_sac = dto.mau_sac?.trim() || null;
  if (dto.icon_hien_thi !== undefined) capNhat.icon_hien_thi = dto.icon_hien_thi?.trim() || null;
  if (dto.thu_tu_sap_xep !== undefined) capNhat.thu_tu_sap_xep = typeof dto.thu_tu_sap_xep === 'number' ? dto.thu_tu_sap_xep : 0;
  if (dto.trang_thai_du_lieu !== undefined) capNhat.trang_thai_du_lieu = dto.trang_thai_du_lieu;
  await updateDoc(ref, capNhat);
  const banSau = chuyenDoiDocThanhDoiTuong(trc.id, { ...banTruoc, ...capNhat } as any);
  const uid = layUidNguoiThucHien(nguoiThucHien);
  try {
    await ghiNhatKyHoatDong(
      uid,
      'nhom_san_pham',
      'cap_nhat',
      trc.id,
      `Cập nhật nhóm ${banSau.ten_nhom}`
    );
  } catch {
    /* ignore */
  }
  return banSau;
};

export const xoaMemNhomSanPhamDichVu = async (id: string, nguoiThucHien: any = null): Promise<void> => {
  await capNhatNhomSanPhamDichVu({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucNhomSanPhamDichVu = async (id: string, nguoiThucHien: any = null): Promise<void> => {
  await capNhatNhomSanPhamDichVu({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const langNgheThayDoiNhom = (
  dk: DieuKienLocNhomSanPhamDichVu = {},
  xuLy: (mang: NhomSanPhamDichVu[]) => void
): Unsubscribe => {
  const full: DieuKienLocNhomSanPhamDichVu = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  const ref = query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full));
  return onSnapshot(ref, (snap) => {
    const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    const mang = sortNhomTrongBoNho(mangChuaSort);
    const daLocTheoDieuKien = locTheoDieuKienCoSoDuLieuBoNho(mang, full);
    xuLy(locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa));
  });
};
