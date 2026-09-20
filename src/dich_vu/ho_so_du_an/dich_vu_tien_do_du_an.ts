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
import type { TienDoDuAn } from '../../thu_vien/types/du_an';
export type { TienDoDuAn };
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'tien_do_du_an' as const;
const GIOI_HAN_MAC_DINH = 100;

export interface DieuKienLocTienDoDuAn {
  du_an_id?: string | null;
  trang_thai_hanh_dong?: 'tat_ca' | TienDoDuAn['trang_thai_hanh_dong'] | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  deadline_tu_ngay?: string | null;
  deadline_den_ngay?: string | null;
}

export interface TaoMoiTienDoDuAnDTO {
  du_an_id: string;
  tinh_hinh_hien_tai: string;
  hanh_dong_tiep_theo?: string | null;
  deadline_hanh_dong?: string | null;
  link_tai_lieu?: string | null;
  trang_thai_hanh_dong?: TienDoDuAn['trang_thai_hanh_dong'];
  nguoi_tao_id?: string | null;
}

export interface CapNhatTienDoDuAnDTO {
  tinh_hinh_hien_tai?: string;
  hanh_dong_tiep_theo?: string | null;
  deadline_hanh_dong?: string | null;
  link_tai_lieu?: string | null;
  ket_qua_thuc_hien?: string | null;
  trang_thai_hanh_dong?: TienDoDuAn['trang_thai_hanh_dong'];
  nguoi_hoan_thanh_id?: string | null;
  ngay_hoan_thanh?: string | null;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

type RawBanGhiTDDA = Omit<TienDoDuAn, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiTDDA | undefined | null
): TienDoDuAn => {
  const r = (raw ?? {}) as Partial<RawBanGhiTDDA>;
  const today = new Date().toISOString();
  return {
    id,
    du_an_id: (r.du_an_id as string) ?? '',
    tinh_hinh_hien_tai: (r.tinh_hinh_hien_tai as string) ?? '',
    hanh_dong_tiep_theo: (r.hanh_dong_tiep_theo as string | null) ?? null,
    deadline_hanh_dong: (r.deadline_hanh_dong as string | null) ?? null,
    link_tai_lieu: (r.link_tai_lieu as string | null) ?? null,
    ket_qua_thuc_hien: (r.ket_qua_thuc_hien as string | null) ?? null,
    trang_thai_hanh_dong:
      (r.trang_thai_hanh_dong as TienDoDuAn['trang_thai_hanh_dong']) ?? 'dang_cho',
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    nguoi_hoan_thanh_id: (r.nguoi_hoan_thanh_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    ngay_hoan_thanh: (r.ngay_hoan_thanh as string | null) ?? null,
    trang_thai_du_lieu: (r.trang_thai_du_lieu as TienDoDuAn['trang_thai_du_lieu']) ?? 'hoat_dong'
  };
};

const sapXepVaLocThem = (mang: TienDoDuAn[], loc?: DieuKienLocTienDoDuAn): TienDoDuAn[] => {
  return mang.filter((td) => {
    if (loc?.deadline_tu_ngay) {
      if (!td.deadline_hanh_dong) return false;
      if (td.deadline_hanh_dong < loc.deadline_tu_ngay) return false;
    }
    if (loc?.deadline_den_ngay) {
      if (!td.deadline_hanh_dong) return false;
      if (td.deadline_hanh_dong > loc.deadline_den_ngay + 'T23:59:59.999Z') return false;
    }
    return true;
  });
};

export const danhSachTienDoDuAn = async (
  loc?: DieuKienLocTienDoDuAn
): Promise<{ mang: TienDoDuAn[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.du_an_id) {
    mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  }
  if (loc?.trang_thai_hanh_dong && loc.trang_thai_hanh_dong !== 'tat_ca') {
    mangRangBuoc.unshift(where('trang_thai_hanh_dong', '==', loc.trang_thai_hanh_dong));
  }
  const ttDuLieu =
    loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
      ? loc.trang_thai_du_lieu
      : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));

  try {
    const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
    const snapshot = await getDocs(q);
    const resultsRaw: TienDoDuAn[] = [];
    for (const d of snapshot.docs) {
      resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    }
    resultsRaw.sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao));
    return { mang: sapXepVaLocThem(resultsRaw, loc), tong_so: snapshot.size };
  } catch (err) {
    console.warn('[dich_vu_tien_do_du_an] danhSachTienDoDuAn catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietTienDoDuAn = async (id: string): Promise<TienDoDuAn | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export const taoTienDoDuAnMoi = async (
  dto: TaoMoiTienDoDuAnDTO,
  tenDuAn?: string | null
): Promise<TienDoDuAn | null> => {
  const today = new Date().toISOString();
  const linkGoc = (dto.link_tai_lieu ?? '').trim();
  const duLieu: RawBanGhiTDDA = {
    du_an_id: dto.du_an_id,
    tinh_hinh_hien_tai: dto.tinh_hinh_hien_tai.trim(),
    hanh_dong_tiep_theo: dto.hanh_dong_tiep_theo ? dto.hanh_dong_tiep_theo.trim() : null,
    deadline_hanh_dong: dto.deadline_hanh_dong ?? null,
    link_tai_lieu: linkGoc || null,
    ket_qua_thuc_hien: null,
    trang_thai_hanh_dong: dto.trang_thai_hanh_dong ?? 'dang_thuc_hien',
    nguoi_tao_id: dto.nguoi_tao_id ?? null,
    nguoi_hoan_thanh_id: null,
    ngay_tao: today,
    ngay_cap_nhat: today,
    ngay_hoan_thanh: null,
    trang_thai_du_lieu: 'hoat_dong'
  };
  const snap = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieu as any);
  const ketQua = chuyenDoiDocThanhDoiTuong(snap.id, duLieu);
  try {
    const noiDungNK = [
      `[Tiến độ dự án] ${tenDuAn ? `Dự án "${tenDuAn}"` : 'Dự án'}`,
      `• Tình hình HT: ${duLieu.tinh_hinh_hien_tai.slice(0, 120)}`,
      duLieu.hanh_dong_tiep_theo ? `• Hành động TT: ${duLieu.hanh_dong_tiep_theo.slice(0, 120)}` : '',
      duLieu.deadline_hanh_dong ? `• Deadline: ${duLieu.deadline_hanh_dong}` : '',
      duLieu.link_tai_lieu ? `• Link tài liệu: ${duLieu.link_tai_lieu.slice(0, 120)}` : ''
    ]
      .filter(Boolean)
      .join('\n');
    await ghiNhatKyHoatDong(
      dto.nguoi_tao_id,
      'ho_so_du_an',
      'tao',
      dto.du_an_id,
      noiDungNK
    );
  } catch {}
  return ketQua;
};

export const capNhatTienDoDuAn = async (
  id: string,
  dto: CapNhatTienDoDuAnDTO,
  meta?: { nguoi_thuc_hien_id?: string | null; du_an_id?: string | null; ten_du_an?: string | null }
): Promise<TienDoDuAn | null> => {
  const hienTai = await layChiTietTienDoDuAn(id);
  if (!hienTai) return null;
  const today = new Date().toISOString();
  const duLieuCapNhat: Partial<RawBanGhiTDDA> = {
    ngay_cap_nhat: today
  };
  if (typeof dto.tinh_hinh_hien_tai === 'string')
    duLieuCapNhat.tinh_hinh_hien_tai = dto.tinh_hinh_hien_tai.trim();
  if (typeof dto.hanh_dong_tiep_theo === 'string')
    duLieuCapNhat.hanh_dong_tiep_theo = dto.hanh_dong_tiep_theo.trim();
  if (dto.hanh_dong_tiep_theo === null) duLieuCapNhat.hanh_dong_tiep_theo = null;
  if (dto.deadline_hanh_dong !== undefined)
    duLieuCapNhat.deadline_hanh_dong = dto.deadline_hanh_dong;
  if (typeof dto.link_tai_lieu === 'string') {
    duLieuCapNhat.link_tai_lieu = dto.link_tai_lieu.trim() || null;
  }
  if (dto.link_tai_lieu === null) duLieuCapNhat.link_tai_lieu = null;
  if (dto.ket_qua_thuc_hien !== undefined) duLieuCapNhat.ket_qua_thuc_hien = dto.ket_qua_thuc_hien;
  if (dto.trang_thai_hanh_dong) duLieuCapNhat.trang_thai_hanh_dong = dto.trang_thai_hanh_dong;
  if (dto.nguoi_hoan_thanh_id !== undefined)
    duLieuCapNhat.nguoi_hoan_thanh_id = dto.nguoi_hoan_thanh_id;
  if (dto.ngay_hoan_thanh !== undefined) duLieuCapNhat.ngay_hoan_thanh = dto.ngay_hoan_thanh;
  if (dto.trang_thai_du_lieu) duLieuCapNhat.trang_thai_du_lieu = dto.trang_thai_du_lieu;

  await setDoc(thamChieuBanGhi(TEN_COLLECTION, id), duLieuCapNhat as any, { merge: true });
  const ketQua = await layChiTietTienDoDuAn(id);
  try {
    const laHoanThanh =
      dto.trang_thai_hanh_dong === 'da_hoan_thanh' &&
      hienTai.trang_thai_hanh_dong !== 'da_hoan_thanh';
    const nkdId = meta?.nguoi_thuc_hien_id ?? hienTai.nguoi_tao_id ?? null;
    const banGhiId = meta?.du_an_id ?? hienTai.du_an_id ?? null;
    if (laHoanThanh) {
      const noiDungNK = [
        `[Hoàn thành hành động] ${meta?.ten_du_an ? `Dự án "${meta.ten_du_an}"` : 'Dự án'}`,
        hienTai.hanh_dong_tiep_theo ? `• Hành động: ${hienTai.hanh_dong_tiep_theo.slice(0, 120)}` : '',
        dto.ket_qua_thuc_hien ? `• Kết quả: ${dto.ket_qua_thuc_hien.slice(0, 160)}` : ''
      ]
        .filter(Boolean)
        .join('\n');
      await ghiNhatKyHoatDong(nkdId, 'ho_so_du_an', 'sua', banGhiId, noiDungNK);
    } else if (dto.trang_thai_du_lieu !== 'da_xoa') {
      const noiDungNK = [
        `[Cập nhật tiến độ] ${meta?.ten_du_an ? `Dự án "${meta.ten_du_an}"` : 'Dự án'}`
      ]
        .filter(Boolean)
        .join('\n');
      await ghiNhatKyHoatDong(nkdId, 'ho_so_du_an', 'sua', banGhiId, noiDungNK);
    } else if (dto.trang_thai_du_lieu === 'da_xoa') {
      await ghiNhatKyHoatDong(
        nkdId,
        'ho_so_du_an',
        'xoa',
        banGhiId,
        `Xóa tiến độ dự án: ${(hienTai.hanh_dong_tiep_theo ?? hienTai.tinh_hinh_hien_tai).slice(0, 100)}`
      );
    }
  } catch {}
  return ketQua;
};

export const xoaMemTienDoDuAn = async (
  id: string,
  meta?: { nguoi_thuc_hien_id?: string | null; du_an_id?: string | null; ten_du_an?: string | null }
): Promise<boolean> => {
  const kq = await capNhatTienDoDuAn(id, { trang_thai_du_lieu: 'da_xoa' }, meta);
  return !!kq;
};

export const langNgheDSTienDoDuAn = (
  onData: (mang: TienDoDuAn[]) => void,
  loc?: DieuKienLocTienDoDuAn
) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.du_an_id) mangRangBuoc.unshift(where('du_an_id', '==', loc.du_an_id));
  const ttDuLieu =
    loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
      ? loc.trang_thai_du_lieu
      : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const huyLangNghe = onSnapshot(q, (snap) => {
    const mang: TienDoDuAn[] = [];
    for (const d of snap.docs) mang.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    mang.sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao));
    onData(sapXepVaLocThem(mang, loc));
  });
  return huyLangNghe;
};
