'use client';

import React, { useRef, useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import {
  FileSpreadsheet,
  Printer,
  X,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Building2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import {
  phanTichTuanISO,
  dichChuyenTuanISO,
  type BaoCaoTuanVDCD,
  type DongKeHoachDuAnTuan
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { SanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import { layCauHinhGiaiDoanTheoKey } from '../../thu_vien/cau_hinh/giai_doan_du_an';

export interface DuAnTiemNangTongHopExport {
  stt?: number;
  id: string;
  tenDuAn: string;
  tenKhachHang: string;
  tenNhanVienPhuTrach?: string;
  nguoiLienHe?: string;
  soDienThoai?: string;
  sanPhamDichVu?: string;
  giaTriDeal?: number;
  giaiDoanKey?: string;
  tenGiaiDoan?: string;
  mucDoTiemNang?: string;
  xacSuatPct?: number;
}

interface Props {
  mo: boolean;
  onDong: () => void;
  baoCao: BaoCaoTuanVDCD;
  lichTuanToi?: (LichGapKH & { ten_nhan_vien?: string })[];
  dsDuAnTiemNangChon?: DuAnTiemNangTongHopExport[];
  dsTatCaDuAnCRM?: HoSoDuAn[];
  dsKhachHang?: KhachHang[];
  dsNhanSu?: NhanSu[];
  dsSanPham?: SanPhamDichVu[];
  tieuDePhu?: string;
}

const fmtTien = (val?: number | null): string => {
  const n = Number(val || 0);
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
};

const formatTienTe = fmtTien;

const fmtPct = (tu: number, mau: number): string => {
  if (!mau || mau <= 0) return '';
  return `${((tu / mau) * 100).toFixed(1).replace('.', ',')}%`;
};

const fmtPctInt = (tu: number, mau: number): string => {
  if (!mau || mau <= 0) return '';
  return `${Math.round((tu / mau) * 100)}%`;
};

const chiaTrang = <T,>(items: T[], kichThuocTrang: number): T[][] => {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += kichThuocTrang) {
    pages.push(items.slice(i, i + kichThuocTrang));
  }
  return pages;
};

function tinhChieuCaoHangExcel(text: string, colWidthApprox: number = 35, minHeight: number = 26): number {
  if (!text) return minHeight;
  const lines = text.split('\n');
  const count = lines.reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / colWidthApprox)), 0);
  return Math.max(minHeight, count * 18 + 6);
}

const SlideFrame: React.FC<{ children: React.ReactNode; nenTrang?: boolean }> = ({
  children,
  nenTrang = true
}) => (
  <section
    className="vdcd-slide relative w-[1120px] h-[630px] bg-white text-slate-900 overflow-hidden shadow-lg border border-slate-200 mx-auto shrink-0 flex flex-col"
    style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
  >
    {/* Góc trang trí đỏ-đen chuẩn mẫu VDCD */}
    <div
      className="pointer-events-none absolute top-0 left-0 w-16 h-16"
      style={{
        background: 'linear-gradient(135deg, #D11317 50%, transparent 50%)'
      }}
    />
    <div
      className="pointer-events-none absolute bottom-0 right-0 w-24 h-20"
      style={{
        background: 'linear-gradient(315deg, #1F242B 42%, #D11317 42%, #D11317 48%, transparent 48%)'
      }}
    />
    {nenTrang && (
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 56px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 56px)'
        }}
      />
    )}
    <div className="relative z-10 flex-1 flex flex-col px-12 py-8">{children}</div>
  </section>
);

export async function xuatExcelBaoCaoTuanVDCD(
  baoCao: BaoCaoTuanVDCD,
  lichTuanToi: (LichGapKH & { ten_nhan_vien?: string })[] = [],
  dsDuAnTiemNangChon: DuAnTiemNangTongHopExport[] = []
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const infoTuan = phanTichTuanISO(baoCao.tuan);
  const infoTuanToi = phanTichTuanISO(dichChuyenTuanISO(baoCao.tuan, 1));

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  const styleHeader = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10.5 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF991B1B' } },
        left: { style: 'thin', color: { argb: 'FF991B1B' } },
        bottom: { style: 'thin', color: { argb: 'FF991B1B' } },
        right: { style: 'thin', color: { argb: 'FF991B1B' } }
      };
    });
    row.height = 30;
  };

  const styleBody = (row: ExcelJS.Row, alignments?: ('left' | 'center' | 'right')[]) => {
    let maxVisual = 1;
    row.eachCell((cell, colNumber) => {
      const align = alignments?.[colNumber - 1] || 'left';
      cell.font = { size: 10 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: align,
        wrapText: true,
        indent: align === 'left' ? 1 : 0
      };
      cell.border = borderThin;

      const strVal = cell.value != null ? String(cell.value) : '';
      const lines = strVal.split('\n');
      const linesCell = lines.reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / 35)), 0);
      if (linesCell > maxVisual) maxVisual = linesCell;
    });
    row.height = Math.max(26, maxVisual * 18 + 6);
  };

  // Sheet 1: Doanh thu
  const s1 = wb.addWorksheet('Doanh_Thu');
  s1.addRow([`BÁO CÁO DOANH THU ${infoTuan.nhanTieuDe} (${infoTuan.khoangNgayNhan}) - ${baoCao.ten_nhan_vien}`]);
  s1.addRow(['Chỉ tiêu', 'DT Tuần (VND)', 'MTD (VND)', 'YTD (VND)', '%/KPI Tháng', '%/KPI Năm']);
  styleHeader(s1.getRow(2));
  const rKy = s1.addRow([
    'Doanh thu ký kết',
    formatTienTe(baoCao.dt_tuan_ky_ket),
    formatTienTe(baoCao.mtd_ky_ket),
    formatTienTe(baoCao.ytd_ky_ket),
    fmtPct(baoCao.mtd_ky_ket, baoCao.kpi_thang_ky_ket),
    fmtPct(baoCao.ytd_ky_ket, baoCao.kpi_nam_ky_ket)
  ]);
  const rVe = s1.addRow([
    'Doanh thu tiền về',
    formatTienTe(baoCao.dt_tuan_tien_ve),
    formatTienTe(baoCao.mtd_tien_ve),
    formatTienTe(baoCao.ytd_tien_ve),
    fmtPct(baoCao.mtd_tien_ve, baoCao.kpi_thang_tien_ve),
    fmtPct(baoCao.ytd_tien_ve, baoCao.kpi_nam_tien_ve)
  ]);
  styleBody(rKy, ['left', 'right', 'right', 'right', 'center', 'center']);
  styleBody(rVe, ['left', 'right', 'right', 'right', 'center', 'center']);
  s1.addRow([]);

  const hChiTiet = s1.addRow(['TÊN CÔNG TY / CÁ NHÂN', 'TÊN DỰ ÁN', 'TRẠNG THÁI', 'DOANH THU KÝ KẾT', 'DOANH THU TIỀN VỀ']);
  styleHeader(hChiTiet);
  for (const d of baoCao.chi_tiet_doanh_thu) {
    const row = s1.addRow([d.ten_khach_hang, d.ten_du_an, d.trang_thai, formatTienTe(d.doanh_thu_ky_ket), formatTienTe(d.doanh_thu_tien_ve)]);
    styleBody(row, ['left', 'left', 'center', 'right', 'right']);
  }
  s1.columns = [{ width: 34 }, { width: 40 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 16 }];

  // Sheet 2: Tình trạng DA & Nguồn
  const s2 = wb.addWorksheet('Tinh_Trang_DA');
  const hTT = s2.addRow(['TÌNH TRẠNG DỰ ÁN TRIỂN KHAI TRONG TUẦN', 'Tuần trước', 'Tuần này']);
  styleHeader(hTT);
  [
    ['TỔNG TIẾP CẬN', baoCao.tinh_trang_tuan_truoc.tong_tiep_can, baoCao.tinh_trang_tuan_nay.tong_tiep_can],
    ['ĐANG TIẾP CẬN', baoCao.tinh_trang_tuan_truoc.dang_tiep_can, baoCao.tinh_trang_tuan_nay.dang_tiep_can],
    ['BÁO GIÁ', baoCao.tinh_trang_tuan_truoc.bao_gia, baoCao.tinh_trang_tuan_nay.bao_gia],
    ['HỢP ĐỒNG', baoCao.tinh_trang_tuan_truoc.hop_dong, baoCao.tinh_trang_tuan_nay.hop_dong],
    ['KHÔNG PHÙ HỢP', baoCao.tinh_trang_tuan_truoc.khong_phu_hop, baoCao.tinh_trang_tuan_nay.khong_phu_hop]
  ].forEach((r) => {
    const row = s2.addRow(r);
    styleBody(row, ['left', 'center', 'center']);
  });

  s2.addRow([]);
  const hNguon = s2.addRow(['CƠ CẤU NGUỒN TIẾP CẬN (%)', 'Tuần trước', 'Tuần này']);
  styleHeader(hNguon);
  [
    ['Giới thiệu', `${baoCao.nguon_tuan_truoc.gioi_thieu}%`, `${baoCao.nguon_tuan_nay.gioi_thieu}%`],
    ['Tự khai thác', `${baoCao.nguon_tuan_truoc.tu_khai_thac}%`, `${baoCao.nguon_tuan_nay.tu_khai_thac}%`],
    ['Hotline & Fanpage', `${baoCao.nguon_tuan_truoc.hotline_fanpage}%`, `${baoCao.nguon_tuan_nay.hotline_fanpage}%`],
    ['Đấu thầu Online', `${baoCao.nguon_tuan_truoc.dau_thau_online}%`, `${baoCao.nguon_tuan_nay.dau_thau_online}%`]
  ].forEach((r) => {
    const row = s2.addRow(r);
    styleBody(row, ['left', 'center', 'center']);
  });
  s2.columns = [{ width: 34 }, { width: 20 }, { width: 20 }];

  // Sheet Kế hoạch Dự án Tiềm năng
  const dsTNDung: DuAnTiemNangTongHopExport[] = dsDuAnTiemNangChon && dsDuAnTiemNangChon.length > 0
    ? dsDuAnTiemNangChon
    : (baoCao.ke_hoach_tiem_nang || []).map((x, idx) => ({
        stt: idx + 1,
        id: x.du_an_id || x.id || `tn_${idx}`,
        tenDuAn: x.san_pham || 'Dự án',
        tenKhachHang: x.ten_khach_hang || 'Khách hàng',
        tenNhanVienPhuTrach: x.giam_doc_du_an || '',
        nguoiLienHe: '',
        soDienThoai: '',
        sanPhamDichVu: x.san_pham || 'Khảo sát / Đo đạc',
        giaTriDeal: x.doanh_thu_ky_ket || 0,
        giaiDoanKey: 'dang_tiep_can',
        tenGiaiDoan: x.trang_thai || 'Đang bám sát',
        mucDoTiemNang: 'cao',
        xacSuatPct: 70
      }));

  const sTN = wb.addWorksheet('KH_DA_Tiem_Nang');
  sTN.addRow([`DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO) — ${baoCao.ten_chi_nhanh || baoCao.ten_nhan_vien}`]);
  styleHeader(sTN.addRow([
    'STT',
    'TÊN DỰ ÁN',
    'KHÁCH HÀNG / CĐT',
    'PHỤ TRÁCH / KINH DOANH',
    'NGƯỜI LIÊN HỆ & SĐT',
    'GIÁ TRỊ DEAL / HĐ (VNĐ)',
    'GIAI ĐOẠN',
    'MỨC TIỀM NĂNG',
    'DỊCH VỤ'
  ]));

  let tongGiaTriTN = 0;
  dsTNDung.forEach((d, idx) => {
    const gt = Number(d.giaTriDeal || 0);
    tongGiaTriTN += gt;
    const r = sTN.addRow([
      idx + 1,
      d.tenDuAn,
      d.tenKhachHang,
      d.tenNhanVienPhuTrach || '—',
      `${d.nguoiLienHe || ''}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}`.trim() || '—',
      formatTienTe(gt),
      d.tenGiaiDoan || d.giaiDoanKey || 'Đang bám sát',
      d.mucDoTiemNang === 'rat_cao' ? 'Rất cao (90%)' : 'Cao (70%)',
      d.sanPhamDichVu || 'Khảo sát / Đo đạc'
    ]);
    styleBody(r, ['center', 'left', 'left', 'left', 'left', 'right', 'center', 'center', 'left']);
  });

  const rTongTN = sTN.addRow([
    '',
    '',
    '',
    'TỔNG GIÁ TRỊ DEAL BÁM SÁT',
    `${dsTNDung.length} dự án`,
    formatTienTe(tongGiaTriTN),
    '',
    '',
    ''
  ]);
  rTongTN.height = 28;
  rTongTN.eachCell((cell) => {
    cell.font = { bold: true, size: 10.5, color: { argb: 'FFB91C1C' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    cell.border = borderThin;
  });
  rTongTN.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };
  rTongTN.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };

  sTN.columns = [
    { width: 8 },
    { width: 36 },
    { width: 30 },
    { width: 24 },
    { width: 26 },
    { width: 24 },
    { width: 22 },
    { width: 22 },
    { width: 26 }
  ];

  // Sheet Lịch công tác tuần tới
  if (lichTuanToi.length > 0) {
    const sLich = wb.addWorksheet('Lich_Cong_Tac_Tuan');
    sLich.addRow([`LỊCH CÔNG TÁC ${infoTuanToi.nhanTieuDe} (${infoTuanToi.khoangNgayNhan})`]);
    styleHeader(sLich.addRow(['NGÀY', 'GIỜ', 'NHÂN SỰ', 'KHÁCH HÀNG / ĐỊA BÀN', 'NỘI DUNG CÔNG TÁC', 'TRẠNG THÁI']));
    for (const l of lichTuanToi) {
      const r = sLich.addRow([
        l.ngay,
        `${l.gio_bat_dau || ''} - ${l.gio_ket_thuc || ''}`,
        l.ten_nhan_vien || baoCao.ten_nhan_vien,
        `${l.ten_khach_hang}${l.dia_diem ? ` (${l.dia_diem})` : ''}`,
        l.noi_dung || l.tieu_de,
        l.trang_thai === 'da_hoan_thanh' ? 'Đã gặp' : 'Kế hoạch'
      ]);
      styleBody(r, ['center', 'center', 'left', 'left', 'left', 'center']);
    }
    sLich.columns = [{ width: 14 }, { width: 16 }, { width: 24 }, { width: 32 }, { width: 40 }, { width: 15 }];
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_cao_tuan_${baoCao.tuan}_${baoCao.ten_nhan_vien.replace(/\s+/g, '_')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

const ModalXuatBaoCaoVDCD: React.FC<Props> = ({
  mo,
  onDong,
  baoCao,
  lichTuanToi = [],
  dsDuAnTiemNangChon = [],
  dsTatCaDuAnCRM = [],
  dsKhachHang = [],
  dsNhanSu = [],
  dsSanPham = [],
  tieuDePhu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dangXuatExcel, setDangXuatExcel] = useState(false);
  const [moBangQuanLyDA, setMoBangQuanLyDA] = useState(false);
  const [duAnThemId, setDuAnThemId] = useState('');

  const infoTuan = useMemo(() => phanTichTuanISO(baoCao.tuan), [baoCao.tuan]);
  const infoTuanToi = useMemo(
    () => phanTichTuanISO(dichChuyenTuanISO(baoCao.tuan, 1)),
    [baoCao.tuan]
  );

  // Danh sách dự án xuất slide/PDF có thể thêm, sửa, xoá bớt
  const [dsDuAnXuat, setDsDuAnXuat] = useState<DuAnTiemNangTongHopExport[]>(() => {
    if (dsDuAnTiemNangChon && dsDuAnTiemNangChon.length > 0) return dsDuAnTiemNangChon;
    return (baoCao.ke_hoach_tiem_nang || []).map((x, idx) => ({
      stt: idx + 1,
      id: x.du_an_id || x.id || `da_${idx}`,
      tenDuAn: x.san_pham || 'Dự án',
      tenKhachHang: x.ten_khach_hang || 'Khách hàng',
      tenNhanVienPhuTrach: x.giam_doc_du_an || '',
      giaTriDeal: x.doanh_thu_ky_ket || 0,
      tenGiaiDoan: x.trang_thai || 'Đang bám sát',
      mucDoTiemNang: 'cao',
      xacSuatPct: 70
    }));
  });

  // Đồng bộ lại khi dsDuAnTiemNangChon từ props thay đổi
  React.useEffect(() => {
    if (dsDuAnTiemNangChon && dsDuAnTiemNangChon.length > 0) {
      setDsDuAnXuat(dsDuAnTiemNangChon);
    }
  }, [dsDuAnTiemNangChon]);

  // Phân trang cho Slide Dự án tiềm năng: 5 dự án mỗi slide
  const trangTiemNang = useMemo(
    () => chiaTrang(dsDuAnXuat, 5),
    [dsDuAnXuat]
  );

  const trangDongTien = useMemo(
    () => chiaTrang(baoCao.ke_hoach_dong_tien, 6),
    [baoCao.ke_hoach_dong_tien]
  );

  if (!mo) return null;

  const ttNay = baoCao.tinh_trang_tuan_nay;
  const ttTruoc = baoCao.tinh_trang_tuan_truoc;
  const tiLeChuyenDoiTiepCan = fmtPct(ttNay.bao_gia + ttNay.hop_dong, ttNay.tong_tiep_can);
  const tiLeChuyenDoiBaoGia = fmtPct(ttNay.hop_dong, ttNay.bao_gia + ttNay.hop_dong);

  const inSlidePDF = () => {
    if (!containerRef.current) return;
    const htmlSlides = containerRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=1280,height=780');
    if (!win) {
      alert('Vui lòng cho phép mở cửa sổ bật lên (pop-up) để xuất PDF.');
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Báo cáo ${infoTuan.nhanTieuDe} - ${baoCao.ten_nhan_vien}</title>
  ${styles}
  <style>
    @page { size: 1120px 630px; margin: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .vdcd-slide { box-shadow: none !important; border: none !important; margin: 0 !important; }
    @media screen {
      body { background: #1e293b; padding: 16px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
    }
  </style>
</head>
<body>${htmlSlides}</body>
</html>`);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 550);
  };

  const handleXuatExcel = async () => {
    setDangXuatExcel(true);
    try {
      await xuatExcelBaoCaoTuanVDCD(baoCao, lichTuanToi, dsDuAnXuat);
    } finally {
      setDangXuatExcel(false);
    }
  };

  // Thêm dự án từ CRM vào danh sách Slide
  const handleThemDuAnTuCRM = () => {
    if (!duAnThemId) return;
    const da = dsTatCaDuAnCRM.find((d) => d.id === duAnThemId);
    if (!da) return;

    const kh = dsKhachHang.find((k) => k.id === da.khach_hang_id);
    const ns = dsNhanSu.find((n) => n.id === da.nguoi_phu_trach_id);
    const sp = dsSanPham.find((s) => s.id === da.san_pham_dich_vu_id);
    const cfg = layCauHinhGiaiDoanTheoKey(da.giai_doan);

    const daMoi: DuAnTiemNangTongHopExport = {
      id: da.id,
      tenDuAn: da.ten_du_an,
      tenKhachHang: kh?.ten_khach_hang || '',
      tenNhanVienPhuTrach: ns?.ho_va_ten || '',
      soDienThoai: kh?.so_dien_thoai || '',
      sanPhamDichVu: sp?.ten_san_pham || da.san_pham_khac_mo_ta || 'Khảo sát / Đo đạc',
      giaTriDeal: Number(da.gia_tri_hop_dong || da.gia_tri_du_kien || 0),
      giaiDoanKey: da.giai_doan,
      tenGiaiDoan: cfg.nhan_ngan,
      mucDoTiemNang: da.muc_do_tiem_nang || 'cao',
      xacSuatPct: da.muc_do_tiem_nang === 'rat_cao' ? 90 : 70
    };

    setDsDuAnXuat((prev) => [...prev, daMoi]);
    setDuAnThemId('');
  };

  // Sửa trường thông tin dự án
  const handleSuaTruong = (idx: number, field: keyof DuAnTiemNangTongHopExport, val: any) => {
    setDsDuAnXuat((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Xoá dự án khỏi Slide
  const handleXoaDuAn = (idx: number) => {
    setDsDuAnXuat((prev) => prev.filter((_, i) => i !== idx));
  };

  const renderBangKeHoachDongTien = (
    tieuDeCon: string,
    danhSach: DongKeHoachDuAnTuan[]
  ) => (
    <>
      <div className="text-center mb-4">
        <h2 className="text-[24px] font-black tracking-tight text-slate-900 uppercase">
          KẾ HOẠCH TRIỂN KHAI TUẦN TIẾP THEO
        </h2>
        <div className="text-[20px] font-black text-[#D11317] uppercase">{tieuDeCon}</div>
      </div>

      <table className="w-full border-collapse text-[12px] bg-white">
        <thead>
          <tr className="bg-[#D11317] text-white">
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[22%]">
              TÊN KHÁCH HÀNG
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[12%]">
              ĐƠN VỊ / GĐ DA
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[23%]">
              Sản phẩm
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[14%]">
              TRẠNG THÁI
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[13%]">
              DOANH THU ký kết
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[16%]">
              Doanh thu tiền về
            </th>
          </tr>
        </thead>
        <tbody>
          {(danhSach.length > 0 ? danhSach : Array.from({ length: 4 }, () => null)).map((row, idx) => (
            <tr key={row?.id || idx} className="h-[52px]">
              <td className="border border-slate-700 px-2.5 py-1.5 font-medium">
                {row?.ten_khach_hang || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                {row?.giam_doc_du_an || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5">{row?.san_pham || ''}</td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                {row?.trang_thai || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                {row ? fmtTien(row.doanh_thu_ky_ket) : ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                {row
                  ? [fmtTien(row.doanh_thu_tien_ve), row.ghi_chu_tien_ve ? `(${row.ghi_chu_tien_ve})` : '']
                      .filter(Boolean)
                      .join(' ')
                  : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-xs flex flex-col">
      {/* Thanh công cụ modal */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0">
        <div>
          <h3 className="text-sm font-bold">
            Xem trước Slide Báo cáo {infoTuan.nhanTieuDe} — {baoCao.ten_nhan_vien}
          </h3>
          {tieuDePhu && <p className="text-xs text-slate-400">{tieuDePhu}</p>}
        </div>
        <div className="flex items-center gap-2">
          {/* Nút bật/tắt quản lý danh sách dự án slide */}
          <button
            type="button"
            onClick={() => setMoBangQuanLyDA((v) => !v)}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
              moBangQuanLyDA
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'border-slate-700 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Quản lý dự án Slide ({dsDuAnXuat.length})</span>
          </button>

          <button
            type="button"
            onClick={handleXuatExcel}
            disabled={dangXuatExcel}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            {dangXuatExcel ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={inSlidePDF}
            className="h-9 px-4 rounded-xl bg-[#D11317] hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
          >
            <Printer className="size-4" />
            <span>Xuất Slide PDF (16:9)</span>
          </button>
          <button
            type="button"
            onClick={onDong}
            className="h-9 w-9 rounded-xl border border-slate-700 hover:bg-slate-800 inline-flex items-center justify-center cursor-pointer transition"
            title="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* PANEL QUẢN LÝ DỰ ÁN TRƯỚC KHI XUẤT (THÊM, SỬA, XOÁ) */}
      {moBangQuanLyDA && (
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-4 max-h-[360px] overflow-y-auto text-xs space-y-3 shrink-0 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-white text-sm">
                Quản lý danh sách dự án trọng điểm xuất Slide &amp; File
              </h4>
              <p className="text-[11px] text-slate-400">
                Cho phép thêm, sửa giá trị, giai đoạn hoặc xoá bớt dự án trước khi xuất file Slide và PDF
              </p>
            </div>

            {/* Ô thêm dự án từ CRM */}
            <div className="flex items-center gap-2">
              <select
                value={duAnThemId}
                onChange={(e) => setDuAnThemId(e.target.value)}
                className="h-8.5 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:border-blue-500 max-w-xs"
              >
                <option value="">-- Chọn dự án từ CRM để thêm --</option>
                {dsTatCaDuAnCRM
                  .filter((d) => !dsDuAnXuat.some((x) => x.id === d.id))
                  .slice(0, 30)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.ten_du_an}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleThemDuAnTuCRM}
                disabled={!duAnThemId}
                className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                  <th className="py-2 text-center w-10">STT</th>
                  <th className="py-2 text-left">Tên dự án</th>
                  <th className="py-2 text-left">Khách hàng</th>
                  <th className="py-2 text-left">Phụ trách</th>
                  <th className="py-2 text-right w-36">Giá trị deal (VND)</th>
                  <th className="py-2 text-left w-32">Giai đoạn</th>
                  <th className="py-2 text-center w-28">Tiềm năng</th>
                  <th className="py-2 text-center w-12">Xoá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dsDuAnXuat.map((d, idx) => (
                  <tr key={d.id || idx} className="hover:bg-slate-800/40">
                    <td className="py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={d.tenDuAn}
                        onChange={(e) => handleSuaTruong(idx, 'tenDuAn', e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-white text-xs font-semibold"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={d.tenKhachHang}
                        onChange={(e) => handleSuaTruong(idx, 'tenKhachHang', e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={d.tenNhanVienPhuTrach || ''}
                        onChange={(e) => handleSuaTruong(idx, 'tenNhanVienPhuTrach', e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <input
                        type="number"
                        value={d.giaTriDeal || ''}
                        onChange={(e) => handleSuaTruong(idx, 'giaTriDeal', Number(e.target.value))}
                        className="w-32 bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-emerald-400 text-xs font-mono text-right"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={d.tenGiaiDoan || d.giaiDoanKey || ''}
                        onChange={(e) => handleSuaTruong(idx, 'tenGiaiDoan', e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                      />
                    </td>
                    <td className="py-2 pr-2 text-center">
                      <select
                        value={d.mucDoTiemNang || 'cao'}
                        onChange={(e) => handleSuaTruong(idx, 'mucDoTiemNang', e.target.value)}
                        className="bg-slate-800/80 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200"
                      >
                        <option value="rat_cao">Rất cao (90%)</option>
                        <option value="cao">Cao (70%)</option>
                        <option value="trung_binh">Trung bình (50%)</option>
                      </select>
                    </td>
                    <td className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleXoaDuAn(idx)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        title="Xoá khỏi slide"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Khu vực preview các slide 16:9 */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <div ref={containerRef} className="space-y-6">
          {/* SLIDE 1: TRANG BÌA */}
          <SlideFrame nenTrang={false}>
            <div className="flex flex-col items-center text-center pt-1 pb-4 border-b border-slate-200">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-700 uppercase">
                VIETNAM CONSTRUCTION DESIGN TECHNOLOGY CORPORATION
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-4">
                <span>MST: 2700338327</span>
                <span>Email: vipcare@vdcd.vn</span>
                <span>Hotline: (+84)888 133335</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <div className="text-[42px] font-black tracking-[0.22em] text-slate-900 leading-none">
                  <span className="text-[#D11317]">V</span>DCD
                </div>
                <div className="text-[11px] tracking-[0.55em] text-slate-500 mt-1 uppercase">
                  GROUP
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <div
                className="w-[620px] py-8 px-10 text-center text-white shadow-xl"
                style={{ backgroundColor: 'rgba(209, 19, 23, 0.94)' }}
              >
                <div className="text-[24px] font-bold tracking-wide uppercase">
                  BÁO CÁO QUẢN TRỊ
                </div>
                <div className="text-[26px] font-black tracking-wide uppercase mt-1">
                  KINH DOANH KỲ {infoTuan.nhanTieuDe}
                </div>
                <div className="text-[15px] font-semibold mt-2 uppercase tracking-wider text-white/95">
                  {baoCao.nhan_vien_id === 'tong_chi_nhanh'
                    ? `ĐƠN VỊ: ${baoCao.ten_chi_nhanh || 'AN GIANG'}`
                    : `NHÂN SỰ: ${baoCao.ten_nhan_vien} (${baoCao.ten_chi_nhanh || 'An Giang'})`}
                </div>
                <div className="text-[12px] text-white/85 mt-1">
                  Kỳ báo cáo: {infoTuan.khoangNgayNhan}/{infoTuan.nam}
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-6 bg-[#D11317] text-white text-[11px] font-bold px-2.5 py-2 rounded-sm tracking-widest">
              {infoTuan.nam}
            </div>
          </SlideFrame>

          {/* SLIDE 2: BÁO CÁO DOANH THU */}
          <SlideFrame>
            <h2 className="text-center text-[24px] font-black text-slate-900 uppercase mb-4">
              BÁO CÁO DOANH THU TUẦN {infoTuan.tuanTrongThang} THÁNG {infoTuan.thang}
            </h2>

            <table className="w-full border-collapse text-[13px] bg-white">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-3 w-[22%]"></th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    DT Tuần (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    MTD (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    YTD (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    %/KPI (Tháng)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    %/Cùng kỳ
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[40px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Doanh thu ký kết
                  </td>
                  <td className="border border-slate-700 px-3 text-right font-semibold tabular-nums">
                    {fmtTien(baoCao.dt_tuan_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.mtd_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.ytd_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {fmtPct(baoCao.mtd_ky_ket, baoCao.kpi_thang_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center">
                    {baoCao.cung_ky_ky_ket_pct != null ? `${baoCao.cung_ky_ky_ket_pct}%` : ''}
                  </td>
                </tr>
                <tr className="h-[40px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Doanh thu tiền về
                  </td>
                  <td className="border border-slate-700 px-3 text-right font-semibold tabular-nums">
                    {fmtTien(baoCao.dt_tuan_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.mtd_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.ytd_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {fmtPct(baoCao.mtd_tien_ve, baoCao.kpi_thang_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center">
                    {baoCao.cung_ky_tien_ve_pct != null ? `${baoCao.cung_ky_tien_ve_pct}%` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-[11px] italic text-slate-700 my-2.5 space-y-0.5">
              <div>• MTD: Doanh thu tích lũy từ ngày đầu tháng đến ngày báo cáo / Tổng doanh thu mục tiêu tháng</div>
              <div>• YTD: Doanh thu tích lũy từ ngày 1/1 đến ngày báo cáo / Tổng doanh thu mục tiêu năm</div>
            </div>

            <table className="w-full border-collapse text-[12px] bg-white mt-1">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[21%]">
                    TÊN CÔNG TY/ CÁ NHÂN
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[29%]">
                    TÊN DỰ ÁN
                    <div className="text-[10px] font-normal">(Mã DV + Tên dự án)</div>
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[16%]">
                    TRẠNG THÁI
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[17%]">
                    DOANH THU KÝ KẾT
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[17%]">
                    DOANH THU TIỀN VỀ
                  </th>
                </tr>
              </thead>
              <tbody>
                {(baoCao.chi_tiet_doanh_thu.length > 0
                  ? baoCao.chi_tiet_doanh_thu.slice(0, 5)
                  : [null, null]
                ).map((d, idx) => (
                  <tr key={d?.id || idx} className="h-[44px]">
                    <td className="border border-slate-700 px-2.5 py-1.5 font-medium">
                      {d?.ten_khach_hang || ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5">{d?.ten_du_an || ''}</td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                      {d?.trang_thai || ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                      {d ? fmtTien(d.doanh_thu_ky_ket) : ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                      {d ? fmtTien(d.doanh_thu_tien_ve) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SlideFrame>

          {/* SLIDE 3: BÁO CÁO TÌNH TRẠNG DỰ ÁN TRIỂN KHAI TRONG TUẦN */}
          <SlideFrame>
            <div className="text-center mb-4">
              <h2 className="text-[24px] font-black text-slate-900 uppercase">
                BÁO CÁO TÌNH TRẠNG DỰ ÁN
              </h2>
              <div className="text-[18px] font-bold text-slate-800">Triển khai trong tuần</div>
            </div>

            <table className="w-full border-collapse text-[13px] bg-white mb-5">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-3 w-[34%]"></th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold w-[33%]">
                    Tuần trước
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold w-[33%]">
                    Tuần này
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['TỔNG TIẾP CẬN', ttTruoc.tong_tiep_can, ttNay.tong_tiep_can],
                  ['ĐANG TIẾP CẬN', ttTruoc.dang_tiep_can, ttNay.dang_tiep_can],
                  ['BÁO GIÁ', ttTruoc.bao_gia, ttNay.bao_gia],
                  ['HỢP ĐỒNG', ttTruoc.hop_dong, ttNay.hop_dong],
                  ['KHÔNG PHÙ HỢP', ttTruoc.khong_phu_hop || '', ttNay.khong_phu_hop || '']
                ].map(([nhan, tr, nay], idx) => (
                  <tr key={idx} className="h-[36px]">
                    <td className="border border-slate-700 px-3 font-extrabold text-center">{nhan}</td>
                    <td className="border border-slate-700 px-3 text-center font-semibold tabular-nums">
                      {tr}
                    </td>
                    <td className="border border-slate-700 px-3 text-center font-semibold tabular-nums">
                      {nay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full border-collapse text-[13px] bg-white">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2 px-3 w-[22%]"></th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[22%]">
                    Tổng tiếp cận
                  </th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[28%]">
                    Tỉ lệ chuyển đổi
                    <div className="text-[11px] font-normal">Tiếp cận → Báo giá và Hợp đồng</div>
                  </th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[28%]">
                    Tỉ lệ chuyển đổi
                    <div className="text-[11px] font-normal">Báo giá → Hợp đồng</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">Kế hoạch</td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {baoCao.ke_hoach_tiep_can_tuan_nay}
                  </td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                </tr>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">Thực hiện</td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {baoCao.thuc_hien_tiep_can_tuan_nay}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {tiLeChuyenDoiTiepCan}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {tiLeChuyenDoiBaoGia}
                  </td>
                </tr>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Thực hiện/kế hoạch
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {fmtPctInt(baoCao.thuc_hien_tiep_can_tuan_nay, baoCao.ke_hoach_tiep_can_tuan_nay)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                </tr>
              </tbody>
            </table>

            <div className="mt-auto pt-2 text-[11px] italic font-bold text-slate-800">
              Áp dụng với các dự án đang triển khai bám sát trong tuần, không tính các dự án đã nghiệm thu hoặc dừng từ kỳ trước
            </div>
          </SlideFrame>

          {/* SLIDE 4: CƠ CẤU NGUỒN TIẾP CẬN */}
          <SlideFrame>
            <h2 className="text-center text-[24px] font-black text-slate-900 uppercase mb-8">
              CƠ CẤU NGUỒN TIẾP CẬN DỰ ÁN
            </h2>

            <table className="w-full border-collapse text-[14px] bg-white my-auto">
              <thead>
                <tr className="bg-[#D11317] text-white h-[48px]">
                  <th className="border border-slate-700 px-4 w-[36%]"></th>
                  <th className="border border-slate-700 px-4 text-center font-bold w-[32%]">
                    Tuần trước
                  </th>
                  <th className="border border-slate-700 px-4 text-center font-bold w-[32%]">
                    Tuần này
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Giới thiệu', baoCao.nguon_tuan_truoc.gioi_thieu, baoCao.nguon_tuan_nay.gioi_thieu],
                  ['Tự khai thác', baoCao.nguon_tuan_truoc.tu_khai_thac, baoCao.nguon_tuan_nay.tu_khai_thac],
                  ['Hotline & Fanpage', baoCao.nguon_tuan_truoc.hotline_fanpage, baoCao.nguon_tuan_nay.hotline_fanpage],
                  ['Đấu thầu Online', baoCao.nguon_tuan_truoc.dau_thau_online, baoCao.nguon_tuan_nay.dau_thau_online]
                ].map(([nhan, tr, nay], idx) => (
                  <tr key={idx} className="h-[68px]">
                    <td className="border border-slate-700 px-4 font-bold">{nhan}</td>
                    <td className="border border-slate-700 px-4 text-center font-semibold">
                      {Number(tr) > 0 ? `${tr}%` : ''}
                    </td>
                    <td className="border border-slate-700 px-4 text-center font-semibold">
                      {Number(nay) > 0 ? `${nay}%` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SlideFrame>

          {/* SLIDE 5+: KẾ HOẠCH DÒNG TIỀN */}
          {trangDongTien.map((items, idx) => (
            <SlideFrame key={`dt_${idx}`}>
              {renderBangKeHoachDongTien('- DÒNG TIỀN -', items)}
            </SlideFrame>
          ))}

          {/* SLIDE 6+: KẾ HOẠCH DỰ ÁN TIỀM NĂNG (LẤY TỪ KẾ HOẠCH TUẦN CỦA SALE & CÓ THỂ CHỈNH SỬA) */}
          {trangTiemNang.map((items, idx) => (
            <SlideFrame key={`tn_${idx}`}>
              <div className="text-center mb-4">
                <h2 className="text-[24px] font-black tracking-tight text-slate-900 uppercase">
                  KẾ HOẠCH TRIỂN KHAI TUẦN TIẾP THEO
                </h2>
                <div className="text-[20px] font-black text-[#D11317] uppercase">
                  - DỰ ÁN TRỌNG ĐIỂM TIỀM NĂNG CAO {trangTiemNang.length > 1 ? `(Trang ${idx + 1}/${trangTiemNang.length})` : ''} -
                </div>
              </div>

              <table className="w-full border-collapse text-[12px] bg-white">
                <thead>
                  <tr className="bg-[#D11317] text-white">
                    <th className="border border-slate-700 py-2.5 px-2 text-center font-bold w-[6%]">
                      STT
                    </th>
                    <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[25%]">
                      TÊN DỰ ÁN &amp; KHÁCH HÀNG
                    </th>
                    <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[18%]">
                      PHỤ TRÁCH / LIÊN HỆ
                    </th>
                    <th className="border border-slate-700 py-2.5 px-2 text-center font-bold w-[15%]">
                      GIAI ĐOẠN
                    </th>
                    <th className="border border-slate-700 py-2.5 px-2 text-center font-bold w-[16%]">
                      GIÁ TRỊ DEAL (VND)
                    </th>
                    <th className="border border-slate-700 py-2.5 px-2 text-center font-bold w-[20%]">
                      DỊCH VỤ / TIỀM NĂNG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(items.length > 0 ? items : Array.from({ length: 5 }, () => null)).map((row, rIdx) => (
                    <tr key={row?.id || rIdx} className="h-[52px]">
                      <td className="border border-slate-700 px-2 py-1.5 text-center font-bold text-slate-500">
                        {row ? idx * 5 + rIdx + 1 : ''}
                      </td>
                      <td className="border border-slate-700 px-2.5 py-1.5 font-medium">
                        {row ? (
                          <div>
                            <div className="font-bold text-slate-900">{row.tenDuAn}</div>
                            {row.tenKhachHang && (
                              <div className="text-[11px] text-slate-600">CĐT: {row.tenKhachHang}</div>
                            )}
                          </div>
                        ) : ''}
                      </td>
                      <td className="border border-slate-700 px-2.5 py-1.5">
                        {row ? (
                          <div>
                            <div className="font-semibold">{row.tenNhanVienPhuTrach || row.nguoiLienHe || '—'}</div>
                            {row.soDienThoai && (
                              <div className="text-[10px] text-slate-500">{row.soDienThoai}</div>
                            )}
                          </div>
                        ) : ''}
                      </td>
                      <td className="border border-slate-700 px-2 py-1.5 text-center">
                        {row?.tenGiaiDoan || row?.giaiDoanKey || ''}
                      </td>
                      <td className="border border-slate-700 px-2.5 py-1.5 text-right font-bold text-blue-700 tabular-nums">
                        {row && row.giaTriDeal ? fmtTien(row.giaTriDeal) : ''}
                      </td>
                      <td className="border border-slate-700 px-2.5 py-1.5">
                        {row ? (
                          <div>
                            <div className="text-slate-800">{row.sanPhamDichVu || 'Khảo sát / Đo đạc'}</div>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {row.mucDoTiemNang === 'rat_cao' ? 'Rất cao (90%)' : 'Cao (70%)'}
                            </span>
                          </div>
                        ) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SlideFrame>
          ))}

          {/* SLIDE LỊCH CÔNG TÁC TUẦN TIẾP THEO */}
          {lichTuanToi.length > 0 &&
            chiaTrang(lichTuanToi, 7).map((items, idx) => (
              <SlideFrame key={`lich_${idx}`}>
                <div className="text-center mb-4">
                  <h2 className="text-[24px] font-black text-slate-900 uppercase">
                    LỊCH CÔNG TÁC {infoTuanToi.nhanTieuDe}
                  </h2>
                  <div className="text-[14px] font-semibold text-[#D11317]">
                    {infoTuanToi.khoangNgayNhan}/{infoTuanToi.nam} • Mục tiêu tiếp cận tuần tới: {baoCao.ke_hoach_tiep_can_tuan_toi} dự án
                  </div>
                </div>
                <table className="w-full border-collapse text-[12px] bg-white">
                  <thead>
                    <tr className="bg-[#D11317] text-white">
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[12%]">NGÀY</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[13%]">GIỜ</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[17%]">NHÂN SỰ</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[25%]">KHÁCH HÀNG / ĐỊA BÀN</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[33%]">NỘI DUNG CÔNG TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((l) => (
                      <tr key={l.id} className="h-[48px]">
                        <td className="border border-slate-700 px-2.5 text-center font-semibold">
                          {l.ngay}
                        </td>
                        <td className="border border-slate-700 px-2.5 text-center">
                          {l.gio_bat_dau} - {l.gio_ket_thuc}
                        </td>
                        <td className="border border-slate-700 px-2.5 font-medium">
                          {l.ten_nhan_vien || baoCao.ten_nhan_vien}
                        </td>
                        <td className="border border-slate-700 px-2.5">
                          <div className="font-semibold">{l.ten_khach_hang}</div>
                          {l.dia_diem && <div className="text-[10px] text-slate-500">{l.dia_diem}</div>}
                        </td>
                        <td className="border border-slate-700 px-2.5">
                          {l.noi_dung || l.tieu_de}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SlideFrame>
            ))}

          {/* SLIDE CUỐI: CẢM ƠN */}
          <SlideFrame>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-[28px] italic font-extrabold text-slate-900 text-center">
                Xin trân trọng cảm ơn sự theo dõi của Ban Lãnh đạo!
              </div>
            </div>
          </SlideFrame>
        </div>
      </div>
    </div>
  );
};

export default ModalXuatBaoCaoVDCD;
