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
  danh_sach_link?: string[] | null;
}

export interface YeuCauPhoiHop {
  id: string;
  du_an_id: string; // Thao tác trên dự án
  ten_du_an: string;
  khach_hang_id?: string | null;
  ten_khach_hang?: string | null;

  loai_yeu_cau?: string | null;
  noi_dung_yeu_cau: string;
  link_drive_dau_vao?: string | null;
  danh_sach_link_dau_vao?: string[] | null;
  link_drive_ket_qua?: string | null;
  danh_sach_link_ket_qua?: string[] | null;
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
  ngay_hoan_thanh?: string | null;
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


export const LOAI_YEU_CAU_MAC_DINH = 'Báo giá';

export const GOI_Y_LOAI_YEU_CAU = [
  'Báo giá',
  'Lập phương án',
  'Khảo sát',
  'Tờ trình / Hồ sơ'
] as const;

export function chuanHoaTrangThaiYeuCau(trangThai?: string | null): TrangThaiYeuCauPhoiHop {
  const s = (trangThai || '').trim();
  if (s === 'hoan_thanh' || s === 'da_hoan_thanh') return 'da_hoan_thanh';
  if (s === 'can_chinh_sua' || s === 'yeu_cau_chinh_sua') return 'yeu_cau_chinh_sua';
  if (s === 'cho_lanh_dao_duyet' || s === 'cho_tpkd_duyet_ket_qua') return 'cho_tpkd_duyet_ket_qua';
  if (s === 'da_phe_duyet' || s === 'cho_sale_nghiem_thu') return 'cho_sale_nghiem_thu';
  if (s === 'cho_khth_thuc_hien' || s === 'cho_cv_khth_thuc_hien') return 'cho_cv_khth_thuc_hien';
  if (s === 'cho_tpkh_duyet_ket_qua') return 'cho_tpkh_duyet_ket_qua';
  if (s === 'cho_tpkh_tiep_nhan') return 'cho_tpkh_tiep_nhan';
  return 'cho_tpkd_duyet';
}

export function xacDinhTrangThaiBanDauYeuCau(params: {
  trang_thai_ban_dau?: TrangThaiYeuCauPhoiHop | null;
  vai_tro_nguoi_nhan?: string | null;
  chuc_vu_nguoi_nhan?: string | null;
}): TrangThaiYeuCauPhoiHop {
  if (params.trang_thai_ban_dau) return chuanHoaTrangThaiYeuCau(params.trang_thai_ban_dau);

  const vt = (params.vai_tro_nguoi_nhan || '').toLowerCase().trim();
  const cv = (params.chuc_vu_nguoi_nhan || '').toLowerCase().trim();

  if (
    vt === 'truong_phong_khth' ||
    (vt === 'truong_phong' && (cv.includes('khth') || cv.includes('kế hoạch') || cv.includes('tổng hợp'))) ||
    cv.includes('tp khth') ||
    cv.includes('tp kh') ||
    cv.includes('trưởng phòng khth') ||
    cv.includes('trưởng phòng kế hoạch') ||
    (cv.includes('trưởng phòng') && (cv.includes('kế hoạch') || cv.includes('tổng hợp')))
  ) {
    return 'cho_tpkh_tiep_nhan';
  }

  if (
    vt === 'truong_phong_kd' ||
    vt === 'giam_doc' ||
    vt === 'quan_tri_he_thong' ||
    vt === 'admin' ||
    (vt === 'truong_phong' && (cv.includes('kinh doanh') || cv.includes('kd') || cv.includes('sales'))) ||
    cv.includes('tpkd') ||
    cv.includes('tp kd') ||
    cv.includes('trưởng phòng kinh doanh') ||
    cv.includes('giám đốc')
  ) {
    return 'cho_tpkd_duyet';
  }

  if (
    vt === 'nhan_vien_khth' ||
    vt === 'nhan_vien_ky_thuat' ||
    cv.includes('khth') ||
    cv.includes('kế hoạch') ||
    cv.includes('tổng hợp') ||
    cv.includes('kỹ thuật') ||
    cv.includes('chuyên viên')
  ) {
    return 'cho_cv_khth_thuc_hien';
  }

  return 'cho_tpkd_duyet';
}

export function chuanHoaDanhSachLink(
  links?: (string | null | undefined)[] | null,
  fallbackSingle?: string | null
): string[] {
  const ketQua: string[] = [];
  const seen = new Set<string>();
  const themItem = (raw?: string | null) => {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const parts = /[\r\n\s]/.test(trimmed)
      ? trimmed.split(/[\r\n\s,;]+/).map((s) => s.trim()).filter(Boolean)
      : [trimmed];
    for (const p of parts) {
      if (!seen.has(p)) {
        seen.add(p);
        ketQua.push(p);
      }
    }
  };
  if (Array.isArray(links)) {
    for (const item of links) themItem(item);
  }
  if (fallbackSingle) themItem(fallbackSingle);
  return ketQua;
}

const NHAN_HE_THONG_KHONG_RUT_GON = new Set([
  'khth',
  'người dùng',
  'thành viên',
  'hệ thống',
  'quản trị',
  'quản trị hệ thống',
  'tpkd',
  'tpkh',
  'ban giám đốc',
  'bgd'
]);

/** Rút gọn họ tên theo dạng viết tắt họ & chữ lót + tên chính (VD: "Dương Tiểu Linh" -> "D.T. Linh") */
export function rutGonTenVietTat(ten?: string | null): string {
  if (!ten) return '';
  const chuanHoa = ten.trim().replace(/\s+/g, ' ');
  if (!chuanHoa) return '';
  if (NHAN_HE_THONG_KHONG_RUT_GON.has(chuanHoa.toLowerCase())) return chuanHoa;

  const parts = chuanHoa.split(' ').filter(Boolean);
  if (parts.length <= 1) return chuanHoa;

  const hoLotVietTat = parts
    .slice(0, -1)
    .map((p) => `${p.charAt(0).toLocaleUpperCase('vi-VN')}.`)
    .join('');
  const tenCuoiRaw = parts[parts.length - 1];
  const laAllCaps =
    tenCuoiRaw.length > 1 &&
    tenCuoiRaw === tenCuoiRaw.toLocaleUpperCase('vi-VN') &&
    tenCuoiRaw !== tenCuoiRaw.toLocaleLowerCase('vi-VN');
  const laAllLower =
    tenCuoiRaw === tenCuoiRaw.toLocaleLowerCase('vi-VN') &&
    tenCuoiRaw !== tenCuoiRaw.toLocaleUpperCase('vi-VN');
  const tenCuoi =
    laAllCaps || laAllLower
      ? tenCuoiRaw.charAt(0).toLocaleUpperCase('vi-VN') + tenCuoiRaw.slice(1).toLocaleLowerCase('vi-VN')
      : tenCuoiRaw;

  return `${hoLotVietTat} ${tenCuoi}`.trim();
}

/** Rút gọn chuỗi nhiều tên phân cách bằng dấu phẩy hoặc mảng tên */
export function rutGonDanhSachTenVietTat(ds?: string | string[] | null): string {
  if (!ds) return '';
  const items = Array.isArray(ds) ? ds : ds.split(',');
  return items
    .map((item) => rutGonTenVietTat(item))
    .filter(Boolean)
    .join(', ');
}

export function layDanhSachLinkDauVao(
  yc: Pick<YeuCauPhoiHop, 'danh_sach_link_dau_vao' | 'link_drive_dau_vao'>
): string[] {
  return chuanHoaDanhSachLink(yc.danh_sach_link_dau_vao, yc.link_drive_dau_vao);
}

export function layDanhSachLinkKetQua(
  yc: Pick<YeuCauPhoiHop, 'danh_sach_link_ket_qua' | 'link_drive_ket_qua'>
): string[] {
  return chuanHoaDanhSachLink(yc.danh_sach_link_ket_qua, yc.link_drive_ket_qua);
}

export function layNhanTrangThaiDichDanh(
  yc: {
    trang_thai?: string | null;
    ten_nguoi_tao?: string | null;
    ten_nguoi_nhan?: string | null;
    chuc_vu_nguoi_nhan?: string | null;
    danh_sach_ten_nhan_su_thuc_hien?: string[] | null;
    lich_su_xu_ly?: NhatKyXuLyYeuCau[] | null;
  },
  options?: {
    tenTPKD?: string | null;
    tenTPKH?: string | null;
  }
): string {
  const tt = chuanHoaTrangThaiYeuCau(yc.trang_thai);
  const cvNhan = (yc.chuc_vu_nguoi_nhan || '').toLowerCase();
  const tenNhan = yc.ten_nguoi_nhan?.trim() || null;
  const tenTao = yc.ten_nguoi_tao?.trim() || null;

  const laTPKDHoacGD = (vt?: string | null, cv?: string | null, hd?: string | null) => {
    const v = (vt || '').toLowerCase();
    const c = (cv || '').toLowerCase();
    const h = (hd || '').toLowerCase();
    return (
      v === 'truong_phong_kd' ||
      v === 'giam_doc' ||
      (v === 'truong_phong' && (c.includes('kinh doanh') || c.includes('kd') || c.includes('sales'))) ||
      c.includes('tpkd') ||
      c.includes('tp kd') ||
      c.includes('trưởng phòng kinh doanh') ||
      c.includes('giám đốc') ||
      h.includes('tpkd')
    );
  };

  const laTPKHTH = (vt?: string | null, cv?: string | null, hd?: string | null) => {
    const v = (vt || '').toLowerCase();
    const c = (cv || '').toLowerCase();
    const h = (hd || '').toLowerCase();
    return (
      v === 'truong_phong_khth' ||
      (v === 'truong_phong' && (c.includes('khth') || c.includes('kế hoạch') || c.includes('tổng hợp'))) ||
      c.includes('tp khth') ||
      c.includes('tp kh') ||
      c.includes('trưởng phòng khth') ||
      c.includes('trưởng phòng kế hoạch') ||
      h.includes('tpkh') ||
      h.includes('phân công')
    );
  };

  const dsLog = yc.lich_su_xu_ly || [];
  let tenTPKDTuLog: string | null = null;
  let tenTPKHTuLog: string | null = null;
  for (let i = dsLog.length - 1; i >= 0; i--) {
    const log = dsLog[i];
    const tenLog = log.ten_nguoi_thuc_hien?.trim();
    if (!tenLog) continue;
    if (!tenTPKDTuLog && laTPKDHoacGD(log.vai_tro, log.chuc_vu, log.hanh_dong)) {
      tenTPKDTuLog = tenLog;
    }
    if (!tenTPKHTuLog && laTPKHTH(log.vai_tro, log.chuc_vu, log.hanh_dong)) {
      tenTPKHTuLog = tenLog;
    }
  }

  const tenTPKD =
    (tenNhan && !cvNhan.includes('khth') && !cvNhan.includes('kế hoạch') && !cvNhan.includes('tổng hợp') && !cvNhan.includes('chuyên viên') && !cvNhan.includes('kỹ thuật')
      ? tenNhan
      : null) ||
    tenTPKDTuLog ||
    options?.tenTPKD?.trim() ||
    null;

  const tenTPKH =
    tenTPKHTuLog ||
    (tenNhan && (cvNhan.includes('khth') || cvNhan.includes('kế hoạch') || cvNhan.includes('tổng hợp'))
      ? tenNhan
      : null) ||
    options?.tenTPKH?.trim() ||
    (tenNhan && !laTPKDHoacGD(undefined, yc.chuc_vu_nguoi_nhan) ? tenNhan : null);

  switch (tt) {
    case 'cho_tpkd_duyet':
      return tenTPKD ? `Chờ ${rutGonTenVietTat(tenTPKD)} duyệt` : 'Chờ duyệt yêu cầu';
    case 'cho_tpkh_tiep_nhan': {
      const nguoiDieuPhoi =
        (tenNhan && (cvNhan.includes('khth') || cvNhan.includes('kế hoạch') || cvNhan.includes('tổng hợp'))
          ? tenNhan
          : null) || tenTPKH;
      return nguoiDieuPhoi ? `Chờ ${rutGonTenVietTat(nguoiDieuPhoi)} điều phối` : 'Chờ điều phối';
    }
    case 'cho_cv_khth_thuc_hien':
    case 'cho_khth_thuc_hien': {
      const dsCV = (yc.danh_sach_ten_nhan_su_thuc_hien || [])
        .map((s) => rutGonTenVietTat(s))
        .filter(Boolean);
      const nguoiLam =
        dsCV.length > 0
          ? dsCV.join(', ')
          : tenNhan && !laTPKDHoacGD(undefined, yc.chuc_vu_nguoi_nhan)
            ? rutGonTenVietTat(tenNhan)
            : null;
      return nguoiLam ? `${nguoiLam} đang xử lý` : 'Đang xử lý';
    }
    case 'cho_tpkh_duyet_ket_qua':
      return tenTPKH ? `Chờ ${rutGonTenVietTat(tenTPKH)} duyệt KQ` : 'Chờ duyệt kết quả';
    case 'cho_tpkd_duyet_ket_qua':
    case 'cho_lanh_dao_duyet': {
      const nguoiDuyetKQ = tenTPKDTuLog || options?.tenTPKD?.trim() || tenTPKD;
      return nguoiDuyetKQ ? `Chờ ${rutGonTenVietTat(nguoiDuyetKQ)} duyệt KQ` : 'Chờ duyệt bàn giao';
    }
    case 'cho_sale_nghiem_thu':
    case 'da_phe_duyet':
      return tenTao ? `Chờ ${rutGonTenVietTat(tenTao)} nghiệm thu` : 'Chờ nghiệm thu';
    case 'yeu_cau_chinh_sua':
      return tenTao ? `Chờ ${rutGonTenVietTat(tenTao)} chỉnh sửa` : 'Chờ chỉnh sửa';
    case 'da_hoan_thanh':
      return 'Đã hoàn thành';
    default:
      return 'Chờ xử lý';
  }
}

export function timLanhDaoMacDinhYeuCau(
  dsNhanSu: {
    ho_va_ten?: string | null;
    vai_tro?: string | null;
    chuc_vu?: string | null;
    phong_ban_id?: string | null;
    trang_thai_du_lieu?: string | null;
    trang_thai?: boolean | null;
  }[],
  mapTenPhongBan?: Map<string, string>
): { tenTPKDMacDinh: string | null; tenTPKHMacDinh: string | null } {
  const nsHoatDong = dsNhanSu.filter(
    (ns) => ns.trang_thai_du_lieu !== 'da_xoa' && ns.trang_thai !== false
  );
  const layTenPB = (phongBanId?: string | null) =>
    phongBanId && mapTenPhongBan ? (mapTenPhongBan.get(phongBanId) || '').toLowerCase() : '';

  const tpkd = nsHoatDong.find((ns) => {
    const cv = (ns.chuc_vu || '').toLowerCase();
    const pb = layTenPB(ns.phong_ban_id);
    return (
      ns.vai_tro === 'truong_phong_kd' ||
      (ns.vai_tro === 'truong_phong' &&
        (cv.includes('kinh doanh') || cv.includes('kd') || pb.includes('kinh doanh') || pb.includes('kd'))) ||
      cv.includes('tpkd') ||
      cv.includes('tp kd') ||
      cv.includes('trưởng phòng kinh doanh')
    );
  });

  const tpkh = nsHoatDong.find((ns) => {
    const cv = (ns.chuc_vu || '').toLowerCase();
    const pb = layTenPB(ns.phong_ban_id);
    return (
      ns.vai_tro === 'truong_phong_khth' ||
      (ns.vai_tro === 'truong_phong' &&
        (cv.includes('khth') || cv.includes('kế hoạch') || pb.includes('khth') || pb.includes('kế hoạch'))) ||
      cv.includes('tp khth') ||
      cv.includes('tp kh') ||
      cv.includes('trưởng phòng khth') ||
      cv.includes('trưởng phòng kế hoạch')
    );
  });

  return {
    tenTPKDMacDinh: tpkd?.ho_va_ten || null,
    tenTPKHMacDinh: tpkh?.ho_va_ten || null
  };
}
