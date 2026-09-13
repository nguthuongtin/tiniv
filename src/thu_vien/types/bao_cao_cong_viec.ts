// Collection: bao_cao_cong_viec (work_reports) - Chuong 3.11
// Updated: Master-Detail structure - 1 bao cao -> Nhieu chi tiet cong viec

export interface ChiTietBaoCaoCongViec {
  du_an_id?: string | null;
  noi_dung: string;
}

export interface BaoCaoCongViec {
  id: string;
  ngay_bao_cao: string;
  nhan_vien_id: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;

  // === New Master-Detail fields ===
  danh_sach_chi_tiet?: ChiTietBaoCaoCongViec[] | null;
  // ================================

  // === Legacy single-item fields (kept for backward compatibility) ===
  du_an_id?: string | null;
  cong_viec_id?: string | null;
  noi_dung_thuc_hien?: string | null;
  ke_hoach_ngay_mai?: string | null;
  // ===================================================================

  kho_khan: string | null;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
