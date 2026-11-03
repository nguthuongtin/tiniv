export type TrangThaiYeuCauPhoiHop =
  | 'cho_tpkd_duyet' // 1. Chờ TPKD duyệt & chuyển KHTH
  | 'cho_tpkh_tiep_nhan' // 2. Chờ TPKH tiếp nhận (Tự làm hoặc Giao CV)
  | 'cho_cv_khth_thuc_hien' // 3. CV KHTH đang thực hiện
  | 'cho_tpkh_duyet_ket_qua' // 4. Chờ TPKH duyệt kết quả của CV
  | 'cho_tpkd_duyet_ket_qua' // 5. Chờ TPKD duyệt kết quả
  | 'cho_sale_nghiem_thu' // 6. Chờ Sale nghiệm thu kết quả
  | 'da_hoan_thanh' // 7. Đã hoàn thành toàn bộ quy trình
  // Tương thích dữ liệu cũ
  | 'cho_khth_thuc_hien' // Tương đương cho_cv_khth_thuc_hien
  | 'cho_lanh_dao_duyet' // Tương đương cho_tpkd_duyet_ket_qua
  | 'da_phe_duyet' // Tương đương cho_sale_nghiem_thu
  | 'yeu_cau_chinh_sua'; // Cần chỉnh sửa lại

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

  // Người nhận chỉ định / phân công đích danh
  nguoi_nhan_id?: string | null;
  ten_nguoi_nhan?: string | null;
  chuc_vu_nguoi_nhan?: string | null;

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
  { label: string; mauBadge: string; textClass: string; moTa: string; buocSo: number }
> = {
  cho_tpkd_duyet: {
    label: 'Chờ TPKD duyệt',
    mauBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    textClass: 'text-amber-800',
    moTa: 'Đang chờ Trưởng phòng Kinh doanh xem xét & chuyển KHTH',
    buocSo: 1
  },
  cho_tpkh_tiep_nhan: {
    label: 'Chờ TPKH điều phối',
    mauBadge: 'bg-blue-50 text-blue-800 border-blue-200',
    textClass: 'text-blue-800',
    moTa: 'Đang ở Trưởng phòng KHTH (Tự thực hiện hoặc Giao CV)',
    buocSo: 2
  },
  cho_cv_khth_thuc_hien: {
    label: 'CV KHTH đang xử lý',
    mauBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    textClass: 'text-sky-800',
    moTa: 'Chuyên viên KHTH đang thực hiện hồ sơ',
    buocSo: 3
  },
  cho_khth_thuc_hien: {
    label: 'CV KHTH đang xử lý',
    mauBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    textClass: 'text-sky-800',
    moTa: 'Chuyên viên KHTH đang thực hiện hồ sơ',
    buocSo: 3
  },
  cho_tpkh_duyet_ket_qua: {
    label: 'Chờ TPKH duyệt KQ',
    mauBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    textClass: 'text-indigo-800',
    moTa: 'CV KHTH đã nộp, đang chờ TPKH kiểm tra kết quả',
    buocSo: 4
  },
  cho_tpkd_duyet_ket_qua: {
    label: 'Chờ TPKD duyệt KQ',
    mauBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    textClass: 'text-purple-800',
    moTa: 'KHTH đã gửi kết quả, đang chờ TPKD phê duyệt bàn giao',
    buocSo: 5
  },
  cho_lanh_dao_duyet: {
    label: 'Chờ TPKD duyệt KQ',
    mauBadge: 'bg-purple-50 text-purple-800 border-purple-200',
    textClass: 'text-purple-800',
    moTa: 'KHTH đã gửi kết quả, đang chờ TPKD phê duyệt bàn giao',
    buocSo: 5
  },
  cho_sale_nghiem_thu: {
    label: 'Chờ Sale nghiệm thu',
    mauBadge: 'bg-teal-50 text-teal-800 border-teal-200',
    textClass: 'text-teal-800',
    moTa: 'Đã có kết quả duyệt, chờ Sale nghiệm thu hoàn tất',
    buocSo: 6
  },
  da_phe_duyet: {
    label: 'Chờ Sale nghiệm thu',
    mauBadge: 'bg-teal-50 text-teal-800 border-teal-200',
    textClass: 'text-teal-800',
    moTa: 'Đã có kết quả duyệt, chờ Sale nghiệm thu',
    buocSo: 6
  },
  yeu_cau_chinh_sua: {
    label: 'Cần chỉnh sửa',
    mauBadge: 'bg-rose-50 text-rose-800 border-rose-200',
    textClass: 'text-rose-800',
    moTa: 'Yêu cầu rà soát và chỉnh sửa lại',
    buocSo: 1
  },
  da_hoan_thanh: {
    label: 'Đã hoàn thành',
    mauBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textClass: 'text-emerald-800',
    moTa: 'Đã hoàn tất quy trình phối hợp',
    buocSo: 7
  }
};
