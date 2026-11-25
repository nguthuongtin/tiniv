export type LoaiLichLamViec = 'cong_tac_di_chuyen' | 'van_phong';

export type LoaiViecVanPhong =
  | 'goi_dien'
  | 'gui_bao_gia'
  | 'soan_hop_dong'
  | 'cham_soc'
  | 'hop_noi_bo'
  | 'khac'
  | (string & {});

export const NHAN_LOAI_VIEC_VAN_PHONG: Record<string, string> = {
  goi_dien: 'Gọi điện',
  gui_bao_gia: 'Gửi báo giá',
  soan_hop_dong: 'Soạn HĐ / Đơn hàng',
  cham_soc: 'Chăm sóc KH',
  hop_noi_bo: 'Họp nội bộ',
  khac: 'Việc VP khác'
};

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
  loai_lich?: LoaiLichLamViec; // 'cong_tac_di_chuyen' (mặc định) | 'van_phong'
  loai_viec_vp?: LoaiViecVanPhong;
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
    key: 'da_hoan_thanh',
    tieu_de: 'Đã hoàn thành',
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

/**
 * Kiểm tra xem một lịch làm việc có bị tính là "Chưa báo cáo" hay không:
 * - Nếu đã hoàn thành ('da_hoan_thanh'), đã hủy ('huy') hoặc đã dời lịch ('doi_lich'): false.
 * - Nếu ngày lịch ở trong quá khứ (< homNayISO): true (quá hạn chưa báo cáo).
 * - Nếu ngày lịch là hôm nay (=== homNayISO): CHỈ TÍNH là chưa báo cáo khi đã đến hoặc sau 20h00 (>= 1200 phút).
 * - Nếu ngày lịch ở tương lai (> homNayISO): false.
 */
export const kiemTraLichChuaBaoCao = (
  lich: { ngay: string; trang_thai?: string; ket_qua?: string | null },
  mocThoiGian?: { homNayISO?: string; phutHienTai?: number }
): boolean => {
  if (lich.trang_thai === 'da_hoan_thanh' || lich.trang_thai === 'huy' || lich.trang_thai === 'doi_lich') {
    return false;
  }

  const homNayISO =
    mocThoiGian?.homNayISO ??
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

  // Ngày trong quá khứ -> Quá hạn chưa báo cáo
  if (lich.ngay < homNayISO) {
    return true;
  }

  // Ngày hôm nay -> Chỉ tính chưa báo cáo nếu đã đến hoặc qua mốc 20h00 (20 * 60 = 1200 phút)
  if (lich.ngay === homNayISO) {
    let phut = mocThoiGian?.phutHienTai;
    if (phut === undefined) {
      const chuoi = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).format(new Date());
      const [h, m] = chuoi.split(':').map(Number);
      phut = (h || 0) * 60 + (m || 0);
    }
    return phut >= 20 * 60;
  }

  return false;
};

