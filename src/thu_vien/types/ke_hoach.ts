// Collection: ke_hoach_thang & ke_hoach_tuan - Simplified CRM Sales Planning Module

export interface ItemKeHoachThang {
  id: string;
  khach_hang_id?: string | null;
  du_an_id?: string | null;
  ten_khach_hang_du_an: string; // Tên khách hàng (VD: UBND Xã Kiên Lương) hoặc nhập tự do
  gia_tri_hd: number; // Giá trị hợp đồng (VNĐ)
  du_kien_thu_thang_nay: number; // Tiền dự kiến thu tháng này (VNĐ)
  ghi_chu?: string | null; // Ghi chú ngắn
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

export interface ItemKeHoachTuan {
  id: string;
  khach_hang_id?: string | null;
  du_an_id?: string | null;
  ten_khach_hang_du_an: string; // Tên khách hàng / dự án / việc cần làm
  noi_dung_tuan: string; // Việc cần làm trong tuần
  dau_ra_cam_ket: string; // Đầu ra / Kết quả cần lấy về
  da_hoan_thanh: boolean; // Trạng thái tick xong
  ngay_hoan_thanh?: string | null; // Ngày bấm hoàn thành đầu tiên (YYYY-MM-DD) chống gian lận
  can_ho_tro?: string | null; // Cần Sếp/CN hỗ trợ
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
