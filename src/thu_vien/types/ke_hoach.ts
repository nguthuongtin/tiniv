export type LoaiMucTieuThang = 'tai_chinh' | 'thi_truong' | 'khach_hang' | 'khac';

export interface ItemKeHoachThang {
  id: string;
  khach_hang_id?: string | null;
  du_an_id?: string | null;
  ten_khach_hang_du_an: string; // Tên khách hàng / dự án / mục tiêu

  // === Trường dữ liệu chuẩn hóa theo mẫu ===
  tinh_thanh?: string | null; // Tỉnh / Thành phố
  xa_phuong?: string | null; // Xã / Phường / Đặc khu
  nguoi_lien_he?: string | null; // Người liên hệ (Chị Giang_Chủ tịch...)
  co_quan_doanh_nghiep?: string | null; // Cơ quan / Doanh nghiệp (UBND Xã...)
  du_an_du_kien?: string | null; // Dự án (Dự kiến)
  muc_tieu_thang?: string | null; // Mục tiêu (Kết quả mong muốn)
  doanh_so_du_kien?: number | null; // Doanh số (VND) (Dự kiến)
  nguoi_ho_tro?: string | null; // Người hỗ trợ

  // === Cấu trúc KPI linh hoạt ===
  loai_muc_tieu?: LoaiMucTieuThang; // Mặc định 'tai_chinh' hoặc 'thi_truong'
  ten_muc_tieu?: string; // Tên mục tiêu cụ thể (VD: Tiếp cận xã mới, Thu hồi công nợ)
  chi_tieu?: number; // Con số chỉ tiêu cần đạt (VD: 10, 50000000)
  don_vi_tinh?: string; // Đơn vị tính (VD: "Xã", "VNĐ", "Hợp đồng", "Khách hàng")
  ket_qua_thuc_te?: number; // Kết quả thực tế đạt được

  // === Dành riêng cho nhóm Tài chính (để tương thích ngược) ===
  gia_tri_hd?: number; // Giá trị hợp đồng (VNĐ)
  du_kien_thu_thang_nay?: number; // Tiền dự kiến thu tháng này (VNĐ)
  thuc_te_thu?: number; // Số tiền thực tế thu được (VNĐ)

  ghi_chu?: string | null; // Ghi chú ngắn
  ghi_chu_ket_qua?: string | null; // Ghi chú kết quả thực tế / giải trình
  ngay_cap_nhat_ket_qua?: string | null; // Ngày cập nhật kết quả gần nhất (ISO)
}

// Backward compatibility alias for existing code
export type ItemDiaBanThang = ItemKeHoachThang;

export interface KeHoachThang {
  id: string;
  thang: string; // YYYY-MM
  nhan_vien_id: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  danh_sach_dia_ban: ItemKeHoachThang[];
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

// Mỗi kết quả ghi nhận theo ngày / thời điểm
export interface NhatKyKetQuaTuan {
  id: string;
  ngay_ghi_nhan: string; // YYYY-MM-DD
  noi_dung: string; // Nội dung kết quả đạt được
  nguoi_ghi_id?: string | null;
}

export interface ItemKeHoachTuan {
  id: string;
  muc_tieu_thang_id?: string | null; // Liên kết với mục tiêu tháng (nếu có)
  loai_hanh_dong?: 'theo_muc_tieu' | 'phat_sinh'; // Phân loại hành động theo mục tiêu hay phát sinh
  khach_hang_id?: string | null;
  du_an_id?: string | null;

  // === Trường dữ liệu chuẩn hóa theo mẫu ===
  tinh_thanh?: string | null; // Tỉnh / Thành phố
  xa_phuong?: string | null; // Xã / Phường / Đặc khu
  nguoi_lien_he?: string | null; // Người liên hệ
  chuc_vu?: string | null; // Chức vụ của người liên hệ
  co_quan_doanh_nghiep?: string | null; // Cơ quan / Doanh nghiệp
  du_an_du_kien?: string | null; // Dự án (Dự kiến)
  hanh_dong_tuan?: string | null; // Kế hoạch / Hành động trong tuần
  ket_qua_mong_muon?: string | null; // Kết quả mong muốn
  nguoi_ho_tro?: string | null; // Người hỗ trợ

  loai_cong_viec?: LoaiMucTieuThang; // Phân loại 4 nhóm đồng bộ với tháng: tai_chinh | thi_truong | khach_hang | khac
  ten_khach_hang_du_an: string; // Tên khách hàng / dự án / việc cần làm
  noi_dung_tuan: string; // Việc cần làm trong tuần
  dau_ra_cam_ket: string; // Đầu ra / Kết quả cần lấy về
  ngay_du_kien?: string | null; // Ngày dự kiến thực hiện / hoàn thành (YYYY-MM-DD)
  da_hoan_thanh: boolean; // Trạng thái tick xong
  ngay_hoan_thanh?: string | null; // Ngày bấm hoàn thành đầu tiên (YYYY-MM-DD) chống gian lận
  can_ho_tro?: string | null; // Cần Sếp/CN hỗ trợ

  // === Tracking & Báo cáo kết quả ===
  danh_sach_ket_qua?: NhatKyKetQuaTuan[]; // Danh sách nhiều kết quả ghi nhận theo tiến trình
  ket_qua_thuc_te?: string | null; // Kết quả tổng hợp hoặc gần nhất
  ngay_cap_nhat_tien_do?: string | null; // Ngày cập nhật kết quả gần nhất (ISO)
  tien_do?: number; // Giữ lại optional để backward compatibility nếu có dữ liệu cũ
}

// Backward compatibility alias for existing code
export type ItemTacChienTuan = ItemKeHoachTuan;

export interface KeHoachTuan {
  id: string;
  tuan: string; // YYYY-Www (ví dụ 2026-W37)
  nhan_vien_id: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  danh_sach_tac_chien: ItemKeHoachTuan[];
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
