export type MucDoDanhGiaAI = 'tot' | 'canh_bao' | 'rui_ro';

export interface ChiTietTieuChiAI {
  ten_tieu_chi: string;
  muc_do: MucDoDanhGiaAI;
  nhan_xet: string;
}

export interface ChiTiet9TieuChi {
  bao_cao_doi_pho?: ChiTietTieuChiAI;      // 1. Soi báo cáo đối phó
  do_khop_ke_hoach?: ChiTietTieuChiAI;     // 2. Soi độ khớp với Kế hoạch
  du_an_dong_bang?: ChiTietTieuChiAI;      // 3. Soi dự án đóng băng
  muc_do_uu_tien?: ChiTietTieuChiAI;       // 4. Soi mức độ ưu tiên
  ty_le_hoan_thanh_kpi?: ChiTietTieuChiAI; // 5. Soi tỷ lệ hoàn thành (KPI)
  ly_do_lap_lai?: ChiTietTieuChiAI;        // 6. Soi lý do viện cớ lặp lại
  khoi_luong_cong_viec?: ChiTietTieuChiAI; // 7. Soi khối lượng công việc (Workload)
  tan_suat_cham_soc_kh?: ChiTietTieuChiAI; // 8. Soi tần suất chăm sóc khách hàng
  du_bao_cuoi_thang?: ChiTietTieuChiAI;    // 10. Dự báo rủi ro cuối tháng
}

export interface AIDanhGiaNhanSu {
  id: string; // `${nhan_vien_id}_${ngay_danh_gia}`
  nhan_vien_id: string;
  ten_nhan_vien?: string;
  ngay_danh_gia: string; // YYYY-MM-DD
  diem_hieu_suat: number; // 0 - 100
  muc_do_tong_the: MucDoDanhGiaAI; // 'tot' | 'canh_bao' | 'rui_ro'
  nhan_dinh_chung: string; // 1-2 câu nhận định cốt lõi
  chi_tiet_tieu_chi: ChiTiet9TieuChi;
  de_xuat_cho_quan_ly: string; // Khuyến nghị cụ thể cho Giám đốc / Trưởng phòng
  du_an_chinh_thong_ke?: {
    tong_du_an: number;
    tiem_nang_cao: number;
    sap_ky_hop_dong: number;
    tong_gia_tri_du_kien: number;
  };
  ngay_tao: string;
  ngay_cap_nhat: string;
}

export interface CauHinhAIGemini {
  gemini_api_key?: string;
  model: string; // 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro'
  tu_dong_danh_gia_hang_ngay: boolean;
  gio_chay_tu_dong?: string; // e.g. "23:00"
  tieu_chi_kich_hoat: {
    bao_cao_doi_pho: boolean;
    do_khop_ke_hoach: boolean;
    du_an_dong_bang: boolean;
    muc_do_uu_tien: boolean;
    ty_le_hoan_thanh_kpi: boolean;
    ly_do_lap_lai: boolean;
    khoi_luong_cong_viec: boolean;
    tan_suat_cham_soc_kh: boolean;
    du_bao_cuoi_thang: boolean;
  };
  ngay_cap_nhat?: string;
}

export const CAU_HINH_AI_MAC_DINH: CauHinhAIGemini = {
  gemini_api_key: '',
  model: 'gemini-2.0-flash',
  tu_dong_danh_gia_hang_ngay: true,
  gio_chay_tu_dong: '23:00',
  tieu_chi_kich_hoat: {
    bao_cao_doi_pho: true,
    do_khop_ke_hoach: true,
    du_an_dong_bang: true,
    muc_do_uu_tien: true,
    ty_le_hoan_thanh_kpi: true,
    ly_do_lap_lai: true,
    khoi_luong_cong_viec: true,
    tan_suat_cham_soc_kh: true,
    du_bao_cuoi_thang: true
  }
};
