// Collection: bao_cao_ke_hoach_tuan & bao_cao_ke_hoach_thang
// Phục vụ tổng kết kế hoạch tuần/tháng, nộp báo cáo cho Sếp (Trưởng phòng/Giám đốc)

import type { NhatKyKetQuaTuan, LoaiMucTieuThang } from './ke_hoach';

export interface ItemKetQuaBaoCaoTuan {
  item_id: string;
  loai_cong_viec?: LoaiMucTieuThang;
  ten_khach_hang_du_an: string;
  dau_ra_cam_ket: string;
  ngay_du_kien?: string | null;
  danh_sach_ket_qua?: NhatKyKetQuaTuan[];
  ket_qua_thuc_te?: string | null;
  da_hoan_thanh: boolean;
  can_ho_tro?: string | null;
  tien_do?: number;
}

export interface BaoCaoKeHoachTuan {
  id: string;
  ke_hoach_tuan_id: string;
  nhan_vien_id: string;
  ten_nhan_vien?: string;
  ma_nhan_vien?: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  tuan: string; // YYYY-Www

  // Thống kê tổng hợp
  tong_muc_tieu: number;
  so_hoan_thanh: number;
  ty_le_hoan_thanh: number; // 0 - 100 (%)

  danh_sach_ket_qua: ItemKetQuaBaoCaoTuan[];

  // Đánh giá tự nhận xét
  kho_khan?: string | null;
  de_xuat?: string | null;

  trang_thai: 'nhap' | 'da_gui';
  nguoi_tao_id: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

export interface ItemKetQuaBaoCaoThang {
  item_id: string;
  ten_khach_hang_du_an: string;
  loai_muc_tieu?: LoaiMucTieuThang;
  chi_tieu?: number;
  don_vi_tinh?: string;
  ket_qua_thuc_te?: number;

  // Tài chính
  gia_tri_hd?: number;
  du_kien_thu_thang_nay?: number;
  thuc_te_thu?: number;
  ty_le_dat: number; // %
  ghi_chu_ket_qua?: string | null;
}

export interface BaoCaoKeHoachThang {
  id: string;
  ke_hoach_thang_id: string;
  nhan_vien_id: string;
  ten_nhan_vien?: string;
  ma_nhan_vien?: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  thang: string; // YYYY-MM

  // Thống kê tổng hợp
  tong_muc_tieu?: number;
  so_muc_tieu_dat?: number;
  ty_le_hoan_thanh_kpi?: number; // 0 - 100 (%)

  // Thống kê tài chính
  tong_gia_tri_hd: number;
  tong_du_kien_thu: number;
  tong_thuc_te_thu: number;
  ty_le_dat_ke_hoach: number; // 0 - 100 (%)

  danh_sach_ket_qua: ItemKetQuaBaoCaoThang[];

  // Đánh giá tự nhận xét
  kho_khan?: string | null;
  de_xuat?: string | null;

  trang_thai: 'nhap' | 'da_gui';
  nguoi_tao_id: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
