export type TrangThaiLichGap =
  | 'cho_duyet'
  | 'da_duyet'
  | 'can_dieu_chinh'
  | 'sap_toi'
  | 'da_hoan_thanh'
  | 'doi_lich'
  | 'huy';

export interface LichGapKH {
  id: string;
  tieu_de: string;
  khach_hang_id?: string | null;
  ten_khach_hang: string;
  nguoi_lien_he_id?: string | null;
  ten_nguoi_lien_he?: string | null;
  so_dien_thoai?: string | null;
  nguoi_phu_trach_id: string;
  nguoi_tham_gia_ids?: string[];
  chi_nhanh_id?: string | null;
  ngay: string; // YYYY-MM-DD
  gio_bat_dau: string; // HH:mm
  gio_ket_thuc: string; // HH:mm
  dia_diem?: string | null;
  noi_dung?: string | null;
  ket_qua?: string | null;
  trang_thai: TrangThaiLichGap;
  la_phat_sinh?: boolean;
  la_tiep_can_moi?: boolean;
  ghi_chu_duyet?: string | null;
  nguoi_duyet_id?: string | null;
  ten_nguoi_duyet?: string | null;
  ngay_duyet?: string | null;
  ly_do_doi_huy?: string | null;
  nguon_lead_id?: string | null;
  du_an_id?: string | null;
  nguoi_tao_id: string;
  ngay_tao: string;
  ngay_cap_nhat: string;
  da_xoa?: boolean;
}

export const DANH_SACH_TRANG_THAI_LICH_GAP: {
  key: TrangThaiLichGap;
  tieu_de: string;
  mauBadge: string;
  mauDot: string;
}[] = [
  {
    key: 'da_duyet',
    tieu_de: 'Đã duyệt / Sẵn sàng đi',
    mauBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    mauDot: 'bg-emerald-600'
  },
  {
    key: 'cho_duyet',
    tieu_de: 'Chờ duyệt',
    mauBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    mauDot: 'bg-blue-600'
  },
  {
    key: 'can_dieu_chinh',
    tieu_de: 'Cần điều chỉnh',
    mauBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    mauDot: 'bg-amber-500'
  },
  {
    key: 'sap_toi',
    tieu_de: 'Sắp tới',
    mauBadge: 'bg-slate-100 text-slate-700 border-slate-200',
    mauDot: 'bg-slate-500'
  },
  {
    key: 'da_hoan_thanh',
    tieu_de: 'Đã gặp',
    mauBadge: 'bg-teal-50 text-teal-700 border-teal-200',
    mauDot: 'bg-teal-600'
  },
  {
    key: 'doi_lich',
    tieu_de: 'Dời lịch',
    mauBadge: 'bg-purple-50 text-purple-700 border-purple-200',
    mauDot: 'bg-purple-500'
  },
  {
    key: 'huy',
    tieu_de: 'Đã hủy',
    mauBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    mauDot: 'bg-rose-500'
  }
];
