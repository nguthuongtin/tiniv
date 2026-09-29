// Collection: leads (Khai thác tiềm năng / Tiếp cận ban đầu)

export type TrangThaiLead =
  | 'moi_tiep_can'   // Mới lấy được liên hệ, chưa liên lạc
  | 'da_lien_he'     // Đã gọi điện/nhắn tin, đang trao đổi
  | 'da_hen_gap'     // Đã hẹn lịch gặp mặt / khảo sát
  | 'da_chuyen_doi'  // Đã gặp và thấy khả thi -> Đã tạo Dự án
  | 'that_bai';      // Không có nhu cầu / không khả thi

export type NguonLead =
  | 'facebook'
  | 'zalo'
  | 'gioi_thieu'
  | 'cold_call'
  | 'website'
  | 'su_kien'
  | 'khac';

export interface NhatKyLead {
  id: string;
  ngay_tao: string;
  nguoi_tao_id: string;
  ten_nguoi_tao?: string;
  noi_dung: string;
}

export interface Lead {
  id: string;
  khach_hang_id: string; // Bắt buộc liên kết với Khách hàng (được tạo trước hoặc cùng lúc)
  nguoi_lien_he_id?: string | null; // Liên kết với Người liên hệ của khách hàng
  
  // Thông tin tóm tắt hiển thị nhanh
  ten_khach_hang: string;
  ten_nguoi_lien_he?: string | null;
  so_dien_thoai?: string | null;
  email?: string | null;

  // Bám sát và chuyển đổi
  nguon: NguonLead | string;
  trang_thai: TrangThaiLead;
  ngay_hen_lai?: string | null; // ISO string hoặc YYYY-MM-DD
  ghi_chu?: string | null;
  ly_do_that_bai?: string | null;

  // Nếu đã chuyển đổi thành Dự án
  du_an_id?: string | null;
  ten_du_an?: string | null;

  // Phụ trách & audit
  nguoi_phu_trach_id: string; // NV kinh doanh phụ trách bám
  chi_nhanh_id?: string | null;
  nguoi_tao_id: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
  da_xoa?: boolean;
}
