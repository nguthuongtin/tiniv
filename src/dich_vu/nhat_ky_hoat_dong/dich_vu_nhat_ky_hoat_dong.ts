'use client';

import {
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import { thamChieuCollection } from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'nhat_ky_hoat_dong' as const;
const GIOI_HAN_MAC_DINH = 200;

export type LoaiModuleNhatKy =
  | 'khach_hang'
  | 'ho_so_du_an'
  | 'cong_viec'
  | 'bao_cao_cong_viec'
  | 'tai_lieu'
  | 'nhan_su'
  | 'xac_thuc'
  | 'quan_tri';

export type LoaiHanhDongNhatKy =
  | 'tao_moi'
  | 'cap_nhat'
  | 'xoa'
  | 'chuyen_giai_doan'
  | 'phan_cong'
  | 'upload_file'
  | 'dang_nhap'
  | 'dang_xuat'
  | 'doi_mat_khau';

export interface NhatKyHoatDong {
  id: string;
  nguoi_dung_id: string;
  module: LoaiModuleNhatKy | string;
  hanh_dong: LoaiHanhDongNhatKy | string;
  ban_ghi_id: string | null;
  noi_dung: string | null;
  thoi_gian: string;
}

export interface DieuKienLocNhatKyHoatDong {
  nguoi_dung_id?: string | null;
  module?: LoaiModuleNhatKy | 'tat_ca' | string | null;
  hanh_dong?: LoaiHanhDongNhatKy | 'tat_ca' | string | null;
  ban_ghi_id?: string | null;
  thoi_gian_tu_ngay?: string | null;
  thoi_gian_den_ngay?: string | null;
  tuKhoa?: string | null;
}

type RawBanGhiNK = Omit<NhatKyHoatDong, 'id'>;

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiNK | undefined | null
): NhatKyHoatDong => {
  const r = (raw ?? {}) as Partial<RawBanGhiNK>;
  const today = new Date().toISOString();
  return {
    id,
    nguoi_dung_id: (r.nguoi_dung_id as string) ?? '',
    module: (r.module as string) ?? 'quan_tri',
    hanh_dong: (r.hanh_dong as string) ?? 'cap_nhat',
    ban_ghi_id: (r.ban_ghi_id as string | null) ?? null,
    noi_dung: (r.noi_dung as string | null) ?? null,
    thoi_gian: (r.thoi_gian as string) ?? today
  };
};

const sapXepVaLocThem = (mang: NhatKyHoatDong[], loc?: DieuKienLocNhatKyHoatDong): NhatKyHoatDong[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((nk) => {
    if (tuKhoaLower) {
      const khop = (nk.noi_dung ?? '').toLowerCase().includes(tuKhoaLower)
        || nk.module.toLowerCase().includes(tuKhoaLower)
        || nk.hanh_dong.toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.thoi_gian_tu_ngay && nk.thoi_gian < loc.thoi_gian_tu_ngay) return false;
    if (loc?.thoi_gian_den_ngay && nk.thoi_gian > loc.thoi_gian_den_ngay + 'T23:59:59.999Z') return false;
    return true;
  });
};

export const danhSachNhatKyHoatDong = async (
  loc?: DieuKienLocNhatKyHoatDong
): Promise<{ mang: NhatKyHoatDong[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_dung_id', '==', loc.nguoi_dung_id));
  }
  if (loc?.module && loc.module !== 'tat_ca') {
    mangRangBuoc.unshift(where('module', '==', loc.module));
  }
  if (loc?.ban_ghi_id) {
    mangRangBuoc.unshift(where('ban_ghi_id', '==', loc.ban_ghi_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const snapshot = await getDocs(q);
  const resultsRaw: NhatKyHoatDong[] = [];
  for (const d of snapshot.docs) {
    resultsRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data()));
  }
  resultsRaw.sort((a, b) => b.thoi_gian.localeCompare(a.thoi_gian));
  let results = resultsRaw;
  if (loc?.hanh_dong && loc.hanh_dong !== 'tat_ca') {
    results = results.filter((x) => x.hanh_dong === loc!.hanh_dong);
  }
  return { mang: sapXepVaLocThem(results, loc), tong_so: snapshot.size };
};

export const langNgheThayDoiNhatKyHoatDong = (
  callback: (mang: NhatKyHoatDong[]) => void,
  loc?: DieuKienLocNhatKyHoatDong
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [limit(GIOI_HAN_MAC_DINH)];
  if (loc?.nguoi_dung_id) {
    mangRangBuoc.unshift(where('nguoi_dung_id', '==', loc.nguoi_dung_id));
  }
  if (loc?.module && loc.module !== 'tat_ca') {
    mangRangBuoc.unshift(where('module', '==', loc.module));
  }
  if (loc?.ban_ghi_id) {
    mangRangBuoc.unshift(where('ban_ghi_id', '==', loc.ban_ghi_id));
  }
  const q = query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc);
  const unsub = onSnapshot(q, (snap) => {
    let mangRaw: NhatKyHoatDong[] = [];
    snap.forEach((d) => mangRaw.push(chuyenDoiDocThanhDoiTuong(d.id, d.data())));
    mangRaw.sort((a, b) => b.thoi_gian.localeCompare(a.thoi_gian));
    if (loc?.hanh_dong && loc.hanh_dong !== 'tat_ca') {
      mangRaw = mangRaw.filter((x) => x.hanh_dong === loc!.hanh_dong);
    }
    callback(sapXepVaLocThem(mangRaw, loc));
  });
  return unsub;
};

export const TEN_MODULE_NHAT_KY: Record<string, string> = {
  khach_hang: 'Khách hàng',
  ho_so_du_an: 'Hồ sơ dự án',
  cong_viec: 'Công việc',
  bao_cao_cong_viec: 'Báo cáo công việc',
  tai_lieu: 'Tài liệu',
  nhan_su: 'Nhân sự',
  xac_thuc: 'Xác thực',
  quan_tri: 'Quản trị'
};

export const TEN_HANH_DONG_NHAT_KY: Record<string, string> = {
  tao_moi: 'Tạo mới',
  cap_nhat: 'Cập nhật',
  xoa: 'Xóa',
  chuyen_giai_doan: 'Chuyển giai đoạn',
  phan_cong: 'Phân công',
  upload_file: 'Tải lên file',
  dang_nhap: 'Đăng nhập',
  dang_xuat: 'Đăng xuất',
  doi_mat_khau: 'Đổi mật khẩu'
};
