export type TrangThaiMucTieuMoi = 'dang_lam' | 'da_xong' | 'tam_hoan';
export type TrangThaiKeHoachMoi = 'dang_lap' | 'da_gui' | 'da_phan_hoi';

export interface MucTieuTuanMoi {
  id: string;
  du_an_id?: string | null;
  ten_du_an?: string | null;
  khach_hang_id?: string | null;
  ten_khach_hang?: string | null;
  noi_dung_trong_tam: string;
  ket_qua_dat_duoc?: string | null;
  trang_thai: TrangThaiMucTieuMoi;
}

export interface KeHoachTuanMoi {
  id: string; // `${nhan_vien_id}_${tuan}`
  nhan_vien_id: string;
  ten_nhan_vien: string;
  avatar_url?: string | null;
  phong_ban_id?: string | null;
  chi_nhanh_id?: string | null;
  chuc_vu?: string | null;
  tuan: string; // YYYY-Www, ví dụ '2026-W47'
  ngay_bat_dau: string; // YYYY-MM-DD
  ngay_ket_thuc: string; // YYYY-MM-DD
  // Kế hoạch đầu tuần
  danh_sach_muc_tieu: MucTieuTuanMoi[];
  muc_tieu_chung?: string | null;
  // Tổng kết cuối tuần
  kho_khan_vuong_mac?: string | null;
  de_xuat_ho_tro?: string | null;
  dinh_huong_tuan_toi?: string | null;
  // Phản hồi định hướng từ Quản lý / Lãnh đạo
  phan_hoi_lanh_dao?: string | null;
  nguoi_phan_hoi_id?: string | null;
  ten_nguoi_phan_hoi?: string | null;
  ngay_phan_hoi?: string | null;
  trang_thai: TrangThaiKeHoachMoi;
  ngay_cap_nhat: string;
}
