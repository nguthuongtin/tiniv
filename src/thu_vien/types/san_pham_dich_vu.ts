export type LoaiSanPhamDichVu = 'san_pham' | 'dich_vu' | 'kep';

export interface NhomSanPhamDichVu {
  id: string;
  ma_nhom: string | null;
  ten_nhom: string;
  mo_ta: string | null;
  mau_sac: string | null;
  icon_hien_thi: string | null;
  thu_tu_sap_xep: number;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

export interface SanPhamDichVu {
  id: string;
  nhom_san_pham_id: string | null;
  ma_san_pham: string | null;
  ten_san_pham: string;
  loai: LoaiSanPhamDichVu;
  don_vi_tinh: string | null;
  gia_tham_khao: number | null;
  mo_ta: string | null;
  thu_tu_sap_xep: number;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
