// Collection: nhat_ky_hoat_dong (activity_logs) - Chuong 3.13

export type HanhDongNhatKy =
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
  module: string;
  hanh_dong: HanhDongNhatKy | string;
  ban_ghi_id: string | null;
  noi_dung: string | null;
  thoi_gian: string;
}
