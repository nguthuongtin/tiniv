export type TrangThaiLichGap = 'sap_toi' | 'da_hoan_thanh' | 'doi_lich' | 'huy';

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
    key: 'sap_toi',
    tieu_de: 'Sắp tới',
    mauBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    mauDot: 'bg-blue-500'
  },
  {
    key: 'da_hoan_thanh',
    tieu_de: 'Đã gặp',
    mauBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    mauDot: 'bg-emerald-500'
  },
  {
    key: 'doi_lich',
    tieu_de: 'Dời lịch',
    mauBadge: 'bg-amber-50 text-amber-700 border-amber-200',
    mauDot: 'bg-amber-500'
  },
  {
    key: 'huy',
    tieu_de: 'Đã hủy',
    mauBadge: 'bg-slate-100 text-slate-600 border-slate-200',
    mauDot: 'bg-slate-400'
  }
];
