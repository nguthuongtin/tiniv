// Collection: cong_viec (tasks) - Chuong 3.10

export type TrangThaiCongViec = 'chua_thuc_hien' | 'dang_thuc_hien' | 'hoan_thanh' | 'tam_dung';

export interface CongViec {
  id: string;
  du_an_id: string | null;
  ten_cong_viec: string;
  mo_ta: string | null;
  nguoi_thuc_hien_id: string | null;
  thoi_han_hoan_thanh: string | null;
  trang_thai: TrangThaiCongViec | string;
  ghi_chu: string | null;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
