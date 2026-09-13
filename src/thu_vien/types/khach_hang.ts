// Collection: khach_hang (customers) - Chuong 3.7
// Collection: nguoi_lien_he (contacts) - Chuong 3.8

export type LoaiKhachHang = 'doanh_nghiep' | 'ca_nhan' | 'to_chuc' | 'khac';

export interface KhachHang {
  id: string;
  ten_khach_hang: string;
  loai_khach_hang: LoaiKhachHang | string;
  ma_so_thue: string | null;
  so_dien_thoai: string | null;
  email: string | null;
  dia_chi: string | null;
  website: string | null;
  chi_nhanh_id: string | null;
  nguoi_phu_trach_id: string | null;
  ghi_chu: string | null;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai: 'hoat_dong' | 'tam_dung' | 'da_xoa';
}

export interface NguoiLienHe {
  id: string;
  khach_hang_id: string;
  ho_va_ten: string;
  chuc_vu: string | null;
  so_dien_thoai: string | null;
  email: string | null;
  ghi_chu: string | null;
  ngay_tao: string;
}

