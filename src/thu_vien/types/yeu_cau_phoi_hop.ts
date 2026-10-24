export type TrangThaiYeuCauPhoiHop =
  | 'cho_tpkd_duyet' // Chờ tiếp nhận & phân công
  | 'cho_khth_thuc_hien' // Đang xử lý
  | 'cho_tpkd_duyet_ket_qua' // Chờ duyệt kết quả
  | 'cho_lanh_dao_duyet' // Tương thích dữ liệu cũ -> Chờ duyệt kết quả
  | 'da_phe_duyet' // Đã duyệt
  | 'yeu_cau_chinh_sua' // Cần chỉnh sửa lại
  | 'da_hoan_thanh'; // Đã hoàn tất

export interface NhatKyXuLyYeuCau {
  id: string;
  thoi_gian: string; // ISO
  nguoi_thuc_hien_id: string;
  ten_nguoi_thuc_hien: string;
  chuc_vu?: string | null;
  vai_tro?: string | null;
  hanh_dong: string;
  ghi_chu?: string | null;
  link_drive?: string | null;
}

export interface YeuCauPhoiHop {
  id: string;
  du_an_id: string; // Thao tác trên dự án
  ten_du_an: string;
  khach_hang_id?: string | null;
  ten_khach_hang?: string | null;

  noi_dung_yeu_cau: string;
  link_drive_dau_vao?: string | null;
  link_drive_ket_qua?: string | null;
  han_hoan_thanh?: string | null; // YYYY-MM-DD
  ghi_chu_phan_hoi?: string | null;

  // Phân công nhân sự thực hiện
  danh_sach_nhan_su_thuc_hien_ids?: string[] | null;
  danh_sach_ten_nhan_su_thuc_hien?: string[] | null;

  trang_thai: TrangThaiYeuCauPhoiHop;

  nguoi_tao_id: string;
  ten_nguoi_tao: string;
  phong_ban_id?: string | null;
  chi_nhanh_id?: string | null;

  lich_su_xu_ly: NhatKyXuLyYeuCau[];

  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

export const NHAN_TRANG_THAI_YEU_CAU: Record<
  TrangThaiYeuCauPhoiHop,
  { label: string; mauBadge: string; textClass: string; moTa: string }
> = {
  cho_tpkd_duyet: {
    label: 'Chờ tiếp nhận',
    mauBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    textClass: 'text-amber-800',
    moTa: 'Đang chờ tiếp nhận và phân công xử lý'
  },
  cho_khth_thuc_hien: {
    label: 'Đang xử lý',
    mauBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    textClass: 'text-sky-800',
    moTa: 'Nhân sự được phân công đang xử lý hồ sơ'
  },
  cho_tpkd_duyet_ket_qua: {
    label: 'Chờ duyệt kết quả',
    mauBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    textClass: 'text-purple-800',
    moTa: 'Đã nộp kết quả, đang chờ phê duyệt'
  },
  cho_lanh_dao_duyet: {
    label: 'Chờ duyệt kết quả',
    mauBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    textClass: 'text-purple-800',
    moTa: 'Đã nộp kết quả, đang chờ phê duyệt'
  },
  da_phe_duyet: {
    label: 'Đã duyệt',
    mauBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textClass: 'text-emerald-800',
    moTa: 'Đã được phê duyệt kết quả'
  },
  yeu_cau_chinh_sua: {
    label: 'Cần chỉnh sửa',
    mauBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    textClass: 'text-rose-800',
    moTa: 'Yêu cầu rà soát và chỉnh sửa lại'
  },
  da_hoan_thanh: {
    label: 'Hoàn tất',
    mauBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    textClass: 'text-slate-700',
    moTa: 'Đã hoàn tất quy trình'
  }
};
