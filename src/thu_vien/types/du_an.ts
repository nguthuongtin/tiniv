// Collection: ho_so_du_an (projects) - Chuong 3.9

export type GiaiDoanDuAn = string;

export type MucDoTiemNangKyHopDong = 'rat_cao' | 'cao' | 'trung_binh' | 'thap' | 'rat_thap';

export interface HoSoDuAn {
  id: string;
  ma_ho_so: string;
  ten_du_an: string;
  khach_hang_id: string | null;
  nguoi_lien_he_id: string | null;
  chi_nhanh_id: string | null;
  phong_ban_id: string | null;
  giai_doan: GiaiDoanDuAn | string;
  muc_do_tiem_nang: MucDoTiemNangKyHopDong | string;
  gia_tri_du_kien: number;
  gia_tri_hop_dong: number;
  nguoi_quan_ly_id: string | null;
  nguoi_phu_trach_id: string | null;
  danh_sach_nguoi_ho_tro_ids: string[];
  san_pham_dich_vu_id: string | null;
  san_pham_khac_mo_ta: string | null;
  ngay_tao_ho_so: string;
  thoi_han_hoan_thanh: string | null;
  mo_ta: string | null;
  ghi_chu: string | null;
  ly_do_that_bai?: string | null;
  ghi_chu_that_bai?: string | null;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai: 'hoat_dong' | 'da_xoa';
}

export interface TienDoDuAn {
  id: string;
  du_an_id: string;
  tinh_hinh_hien_tai: string;
  hanh_dong_tiep_theo: string | null;
  deadline_hanh_dong: string | null;
  link_tai_lieu: string | null;
  ket_qua_thuc_hien: string | null;
  trang_thai_hanh_dong: 'dang_cho' | 'dang_thuc_hien' | 'da_hoan_thanh' | 'qua_han';
  nguoi_tao_id: string | null;
  nguoi_hoan_thanh_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  ngay_hoan_thanh: string | null;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
