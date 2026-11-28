import type ExcelJS from 'exceljs';
import type { BaoCaoTuanVDCD } from '../../thu_vien/types/bao_cao_tuan_vdcd';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';

export interface DuAnTrongDiemExcel {
  stt?: number;
  id: string;
  tenDuAn: string;
  tenKhachHang: string;
  nguoiLienHe: string;
  soDienThoai: string;
  sanPhamDichVu?: string;
  giaTriDeal: number;
  giaiDoanKey: string;
  tenGiaiDoan: string;
  mucDoTiemNang: string; // 'rat_cao' | 'cao'
  xacSuatPct: number; // 90, 70...
  nguoiPhuTrach?: string;
}

export interface DuLieuBaoCaoTuanVDCDChuan {
  tuan: string; // VD: '2026-W46'
  nhanTieuDeTuan: string; // VD: 'Tuần 46 (11/11 - 17/11/2026)'
  nhanVien: {
    id: string;
    ho_va_ten: string;
    ma_nhan_vien?: string;
    chuc_vu?: string;
    phong_ban?: string;
  };
  // Khối I: Đánh giá kết quả KPI tuần qua (5 chỉ số dành cho Sale)
  kpiTuanQua: {
    khachHangMoi: { mucTieu: number; thucTe: number };
    baoGia: { mucTieu: number; thucTe: number };
    duAnLamViec: { mucTieu: number; thucTe: number };
    hopDongKy: { mucTieu: number; thucTe: number };
    doanhThu: { mucTieu: number; thucTe: number };
  };
  // Danh sách dự án trọng điểm đang bám sát
  danhSachDuAnTrongDiem: DuAnTrongDiemExcel[];
  // Khối II (Sale): Chỉ tiêu cam kết tuần tới
  camKetTuanToi: {
    khachHangMoi: { target: number; min: number; max: number };
    baoGia: { target: number; min: number; max: number };
    duAnLamViec: { target: number; min: number; max: number };
    hopDongMoi: { target: number; min: number; max: number };
    doanhThu: { target: number; min: number; max: number };
  };
  // Kế hoạch lịch làm việc tuần tới
  lichLamViecTuanToi: {
    thu: number;
    tenThuNgay: string;
    noiDungChiTiet: string;
  }[];
  // Dành riêng cho Trưởng phòng Kinh doanh (Điều hành)
  laTruongPhong?: boolean;
  dinhHuongDieuHanh?: {
    mucTieuDoanhThuPhong?: number;
    soHopDongDuKien?: number;
    trongTamDieuHanh?: string;
    keHoachHoTroNhanSu?: string;
  };
  danhGiaTuanQuaTP?: string;
  deXuatBanGiamDocTP?: string;
}

export interface ThamSoXuatExcelTongHopToanBoSale {
  tuan: string;
  nhanTieuDeTuan: string;
  tenChiNhanh: string;
  baoCaoTongChiNhanh: BaoCaoTuanVDCD;
  danhSachBaoCaoSale: DuLieuBaoCaoTuanVDCDChuan[];
  lichTuanToiToanChiNhanh?: (LichGapKH & { ten_nhan_vien?: string })[];
  danhSachDuAnTrongDiemChiNhanh?: DuAnTrongDiemExcel[];
}

const formatTienTe = (val?: number | null): string => {
  const n = Number(val || 0);
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
};

const borderThin: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
};

/**
 * Hàm tính chiều cao hàng chuẩn xác dựa trên số dòng \n và độ dài ký tự
 * Đảm bảo 100% không bao giờ bị che khuất hàng khi xuất file Excel
 */
function tinhChieuCaoHang(noiDung: string, doRongCotUocTinh: number = 60, minHeight: number = 26): number {
  if (!noiDung) return minHeight;
  const lines = noiDung.split('\n');
  const totalVisualLines = lines.reduce((acc, line) => {
    return acc + Math.max(1, Math.ceil(line.length / doRongCotUocTinh));
  }, 0);
  return Math.max(minHeight, totalVisualLines * 18 + 8);
}

/**
 * Helper tạo và định dạng 1 Sheet chuẩn Sales / Trưởng phòng VDCD
 */
function cauHinhInA4Doc(ws: ExcelJS.Worksheet, fitToHeight: number = 0) {
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight,
    horizontalCentered: true,
    margins: {
      left: 0.2,
      right: 0.2,
      top: 0.25,
      bottom: 0.25,
      header: 0.1,
      footer: 0.1
    }
  };
}

function taoSheetBaoCaoTuanVDCD(ws: ExcelJS.Worksheet, duLieu: DuLieuBaoCaoTuanVDCDChuan) {
  cauHinhInA4Doc(ws);

  // Thiết lập độ rộng cột tối ưu cho trang in A4 dọc (tổng ~115 ký tự)
  ws.columns = [
    { key: 'colA', width: 1.2 }, // A: Lề mảnh
    { key: 'stt', width: 5 },    // B: STT
    { key: 'colC', width: 24 },  // C: Ngày / Chỉ tiêu / Dự án
    { key: 'colD', width: 20 },  // D: ĐVT / Liên hệ & SĐT / Bắt đầu nội dung
    { key: 'colE', width: 17 },  // E: Mục tiêu / Giá trị deal
    { key: 'colF', width: 17 },  // F: Thực tế / Giai đoạn
    { key: 'colG', width: 13 },  // G: Tiềm năng %
    { key: 'colH', width: 18 }   // H: Dịch vụ
  ];

  const styleSectionHeader = (row: ExcelJS.Row, tieuDe: string) => {
    ws.mergeCells(`B${row.number}:H${row.number}`);
    const cell = row.getCell(2);
    cell.value = tieuDe;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    row.height = 28;
    for (let c = 2; c <= 8; c++) {
      row.getCell(c).border = borderThin;
    }
  };

  const styleTableHeader = (row: ExcelJS.Row) => {
    row.height = 30;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } }; // Đỏ cờ VDCD
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF991B1B' } },
        left: { style: 'thin', color: { argb: 'FF991B1B' } },
        bottom: { style: 'thin', color: { argb: 'FF991B1B' } },
        right: { style: 'thin', color: { argb: 'FF991B1B' } }
      };
    }
  };

  // 1. BANNER TIÊU ĐỀ BÁO CÁO (ROW 1)
  const r1 = ws.addRow([]);
  ws.mergeCells('B1:H1');
  const cTitle = r1.getCell(2);
  cTitle.value = duLieu.laTruongPhong
    ? 'BÁO CÁO ĐIỀU HÀNH & KẾ HOẠCH TUẦN TRƯỞNG PHÒNG KINH DOANH VDCD'
    : 'BÁO CÁO KẾT QUẢ & KẾ HOẠCH TUẦN SALES VDCD';
  cTitle.font = { name: 'Calibri', size: 13.5, bold: true, color: { argb: 'FFFFFFFF' } };
  cTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
  cTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  r1.height = 36;

  // ROW 2: THÔNG TIN NHÂN SỰ & TUẦN
  const r2 = ws.addRow([]);
  ws.mergeCells('B2:H2');
  const cSub = r2.getCell(2);
  const vaiTroHienThi = duLieu.laTruongPhong ? 'Trưởng phòng Kinh doanh' : (duLieu.nhanVien.chuc_vu || 'Chuyên viên Kinh doanh');
  cSub.value = `${duLieu.nhanTieuDeTuan}  |  Nhân sự: ${duLieu.nhanVien.ho_va_ten} (${vaiTroHienThi})  |  Phòng Kinh doanh VDCD`;
  cSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  cSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cSub.alignment = { vertical: 'middle', horizontal: 'center' };
  r2.height = 24;

  // =========================================================================
  // KHỐI I: ĐÁNH GIÁ TUẦN QUA
  // =========================================================================
  if (duLieu.laTruongPhong) {
    const rSec1 = ws.addRow([]);
    styleSectionHeader(rSec1, 'I. TỔNG KẾT ĐIỀU HÀNH & KẾT QUẢ TOÀN PHÒNG TUẦN QUA');

    const rHead1 = ws.addRow(['', 'STT', 'Nội dung tổng kết toàn phòng tuần qua', '', '', 'Kết quả ghi nhận', '', '']);
    styleTableHeader(rHead1);
    ws.mergeCells(`C${rHead1.number}:E${rHead1.number}`);
    ws.mergeCells(`F${rHead1.number}:H${rHead1.number}`);

    const dsTongKetTP = [
      {
        stt: 1,
        tieuDe: 'Tổng doanh thu thực tế toàn phòng đạt được',
        noiDung: formatTienTe(duLieu.kpiTuanQua.doanhThu.thucTe)
      },
      {
        stt: 2,
        tieuDe: 'Tổng số hợp đồng toàn phòng đã ký kết',
        noiDung: `${duLieu.kpiTuanQua.hopDongKy.thucTe} hợp đồng`
      },
      {
        stt: 3,
        tieuDe: 'Tổng số dự án toàn phòng đang bám sát',
        noiDung: `${duLieu.kpiTuanQua.duAnLamViec.thucTe} dự án`
      },
      {
        stt: 4,
        tieuDe: 'Tổng số báo giá toàn phòng đã phát hành',
        noiDung: `${duLieu.kpiTuanQua.baoGia.thucTe} báo giá`
      },
      {
        stt: 5,
        tieuDe: 'Đánh giá tổng quan tình hình kinh doanh của Phòng',
        noiDung: duLieu.danhGiaTuanQuaTP || '—'
      },
      {
        stt: 6,
        tieuDe: 'Khó khăn, vướng mắc & Đề xuất gửi lên Ban Giám đốc',
        noiDung: duLieu.deXuatBanGiamDocTP || '—'
      }
    ];

    dsTongKetTP.forEach((item) => {
      const row = ws.addRow(['', item.stt, item.tieuDe, '', '', item.noiDung, '', '']);
      const rIdx = row.number;
      ws.mergeCells(`C${rIdx}:E${rIdx}`);
      ws.mergeCells(`F${rIdx}:H${rIdx}`);
      row.height = tinhChieuCaoHang(item.noiDung, 70, 26);
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          if (item.stt === 1) {
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF047857' } };
          }
        }
      }
    });
  } else {
    const rSec1 = ws.addRow([]);
    styleSectionHeader(rSec1, `I. KẾT QUẢ CHỈ TIÊU (${duLieu.nhanTieuDeTuan})`);

    const rHead1 = ws.addRow(['', 'STT', 'Chỉ tiêu đánh giá', '', 'ĐVT', 'Mục tiêu', 'Thực tế đạt', '']);
    styleTableHeader(rHead1);
    ws.mergeCells(`C${rHead1.number}:D${rHead1.number}`);
    ws.mergeCells(`G${rHead1.number}:H${rHead1.number}`);

    const kpiData = [
      {
        stt: 1,
        ten: 'Số lượng khách hàng mới tiếp cận',
        dvt: 'Khách hàng',
        mucTieu: duLieu.kpiTuanQua.khachHangMoi.mucTieu,
        thucTe: duLieu.kpiTuanQua.khachHangMoi.thucTe,
        laTien: false
      },
      {
        stt: 2,
        ten: 'Tổng số báo giá đã gửi trong tuần',
        dvt: 'Báo giá',
        mucTieu: duLieu.kpiTuanQua.baoGia.mucTieu,
        thucTe: duLieu.kpiTuanQua.baoGia.thucTe,
        laTien: false
      },
      {
        stt: 3,
        ten: 'Tổng số dự án đã làm việc trong tuần',
        dvt: 'Dự án',
        mucTieu: duLieu.kpiTuanQua.duAnLamViec.mucTieu,
        thucTe: duLieu.kpiTuanQua.duAnLamViec.thucTe,
        laTien: false
      },
      {
        stt: 4,
        ten: 'Số hợp đồng ký kết',
        dvt: 'Hợp đồng',
        mucTieu: duLieu.kpiTuanQua.hopDongKy.mucTieu,
        thucTe: duLieu.kpiTuanQua.hopDongKy.thucTe,
        laTien: false
      },
      {
        stt: 5,
        ten: 'Tổng doanh thu đã thu về trong tuần',
        dvt: 'VNĐ',
        mucTieu: duLieu.kpiTuanQua.doanhThu.mucTieu,
        thucTe: duLieu.kpiTuanQua.doanhThu.thucTe,
        laTien: true
      }
    ];

    for (const item of kpiData) {
      const coMucTieu = item.mucTieu > 0;
      const hienThiMucTieu = coMucTieu
        ? (item.laTien ? formatTienTe(item.mucTieu) : item.mucTieu)
        : '—';
      const hienThiThucTe = item.laTien ? formatTienTe(item.thucTe) : item.thucTe;

      const row = ws.addRow([
        '',
        item.stt,
        item.ten,
        '',
        item.dvt,
        hienThiMucTieu,
        hienThiThucTe,
        ''
      ]);
      const rIdx = row.number;
      ws.mergeCells(`C${rIdx}:D${rIdx}`);
      ws.mergeCells(`G${rIdx}:H${rIdx}`);
      row.height = 25;
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2 || c === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (c === 6) {
          cell.alignment = { vertical: 'middle', horizontal: coMucTieu ? 'right' : 'center' };
          if (coMucTieu && item.laTien) cell.font = { name: 'Calibri', size: 10, bold: true };
        } else if (c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.font = { name: 'Calibri', size: 10, bold: true };
          if (item.laTien) cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        }
      }
    }

    // Dòng Tổng hợp Doanh thu thực tế
    const rTot1 = ws.addRow([
      '',
      '',
      'TỔNG DOANH THU THỰC TẾ TUẦN (VNĐ)',
      '',
      'VNĐ',
      formatTienTe(duLieu.kpiTuanQua.doanhThu.mucTieu),
      formatTienTe(duLieu.kpiTuanQua.doanhThu.thucTe),
      ''
    ]);
    const rTot1Idx = rTot1.number;
    ws.mergeCells(`C${rTot1Idx}:D${rTot1Idx}`);
    ws.mergeCells(`G${rTot1Idx}:H${rTot1Idx}`);
    rTot1.height = 28;
    for (let c = 2; c <= 8; c++) {
      const cell = rTot1.getCell(c);
      cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF991B1B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
      cell.border = borderThin;
      if (c === 2 || c === 5) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'right' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    }
  }

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI II: KẾ HOẠCH & CHỈ TIÊU TUẦN TỚI
  // =========================================================================
  if (duLieu.laTruongPhong) {
    const rSec2 = ws.addRow([]);
    styleSectionHeader(rSec2, 'II. ĐỊNH HƯỚNG & TRỌNG TÂM ĐIỀU HÀNH TUẦN TỚI (TRƯỞNG PHÒNG KINH DOANH)');

    const rHead2 = ws.addRow(['', 'STT', 'Nội dung định hướng & Mục tiêu phòng', '', '', 'Kế hoạch / Cam kết điều hành', '', '']);
    styleTableHeader(rHead2);
    ws.mergeCells(`C${rHead2.number}:E${rHead2.number}`);
    ws.mergeCells(`F${rHead2.number}:H${rHead2.number}`);

    const dh = duLieu.dinhHuongDieuHanh;
    const dsDinhHuong = [
      {
        stt: 1,
        tieuDe: 'Mục tiêu Doanh thu toàn phòng tuần tới',
        noiDung: formatTienTe(dh?.mucTieuDoanhThuPhong || 0)
      },
      {
        stt: 2,
        tieuDe: 'Số Hợp đồng toàn phòng dự kiến chốt trong tuần',
        noiDung: `${dh?.soHopDongDuKien || 0} hợp đồng`
      },
      {
        stt: 3,
        tieuDe: 'Trọng tâm điều hành & Chỉ đạo tuần tới',
        noiDung: dh?.trongTamDieuHanh || 'Tập trung đôn đốc chốt các deal tiềm năng cao và hỗ trợ tháo gỡ khó khăn cho nhân sự.'
      },
      {
        stt: 4,
        tieuDe: 'Kế hoạch đồng hành & Hỗ trợ đội ngũ kinh doanh',
        noiDung: dh?.keHoachHoTroNhanSu || 'Đi cùng NVKD gặp khách hàng các hợp đồng lớn; Đào tạo kỹ năng đàm phán chốt hợp đồng.'
      }
    ];

    dsDinhHuong.forEach((item) => {
      const row = ws.addRow(['', item.stt, item.tieuDe, '', '', item.noiDung, '', '']);
      const rIdx = row.number;
      ws.mergeCells(`C${rIdx}:E${rIdx}`);
      ws.mergeCells(`F${rIdx}:H${rIdx}`);
      row.height = tinhChieuCaoHang(item.noiDung, 70, 26);
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          if (item.stt === 1) {
            cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
          }
        }
      }
    });
  } else {
    const rSec2 = ws.addRow([]);
    styleSectionHeader(rSec2, 'II. CHỈ TIÊU CAM KẾT TUẦN TỚI');

    const rHead2 = ws.addRow(['', 'STT', 'Chỉ tiêu cam kết tuần tới', 'ĐVT', 'Mục tiêu cam kết (Target)', '', '', '']);
    styleTableHeader(rHead2);
    ws.mergeCells(`E${rHead2.number}:H${rHead2.number}`);

    const dsCamKet = [
      {
        stt: 1,
        ten: 'Số lượng khách hàng mới tiếp cận',
        dvt: 'Khách hàng',
        laTien: false,
        target: duLieu.camKetTuanToi.khachHangMoi.target
      },
      {
        stt: 2,
        ten: 'Tổng số báo giá dự kiến gửi',
        dvt: 'Báo giá',
        laTien: false,
        target: duLieu.camKetTuanToi.baoGia.target
      },
      {
        stt: 3,
        ten: 'Tổng số dự án dự kiến làm việc',
        dvt: 'Dự án',
        laTien: false,
        target: duLieu.camKetTuanToi.duAnLamViec.target
      },
      {
        stt: 4,
        ten: 'Số hợp đồng / đơn hàng ký mới',
        dvt: 'Hợp đồng',
        laTien: false,
        target: duLieu.camKetTuanToi.hopDongMoi.target
      },
      {
        stt: 5,
        ten: 'Tổng doanh thu dự kiến thu về',
        dvt: 'VNĐ',
        laTien: true,
        target: duLieu.camKetTuanToi.doanhThu.target
      }
    ];

    dsCamKet.forEach((item) => {
      const row = ws.addRow([
        '',
        item.stt,
        item.ten,
        item.dvt,
        item.laTien ? formatTienTe(item.target) : item.target,
        '',
        '',
        ''
      ]);
      ws.mergeCells(`E${row.number}:H${row.number}`);
      row.height = 25;
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2 || c === 4) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
        } else cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }
    });
  }

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI III: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (Lấy từ lịch có sẵn)
  // =========================================================================
  const rSec3 = ws.addRow([]);
  styleSectionHeader(
    rSec3,
    duLieu.laTruongPhong
      ? 'III. KẾ HOẠCH LỊCH LÀM VIỆC & ĐIỀU HÀNH TUẦN TỚI'
      : 'III. KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (LẤY TỪ LỊCH TÁC NGHIỆP CÓ SẴN)'
  );

  const rHead3 = ws.addRow(['', 'STT', 'Lịch tuần / Ngày', 'Nội dung công việc chi tiết', '', '', '', '']);
  styleTableHeader(rHead3);
  ws.mergeCells(`D${rHead3.number}:H${rHead3.number}`);

  const dsLich = duLieu.lichLamViecTuanToi || [];
  dsLich.forEach((l, idx) => {
    const rawContent = l.noiDungChiTiet || 'Theo kế hoạch tác nghiệp phát sinh phòng kinh doanh';
    const formattedContent = rawContent.includes('; ') ? rawContent.split('; ').join('\n• ') : rawContent;
    const finalContent = formattedContent.startsWith('[') || formattedContent.startsWith('•') ? formattedContent : `• ${formattedContent}`;

    const row = ws.addRow([
      '',
      idx + 1,
      l.tenThuNgay,
      finalContent,
      '',
      '',
      '',
      ''
    ]);
    const rIdx = row.number;
    ws.mergeCells(`D${rIdx}:H${rIdx}`);
    row.height = tinhChieuCaoHang(finalContent, 80, 28);

    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 3) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      } else if (c === 4) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
      }
    }
  });

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI IV: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)
  // (CHỈ DÀNH CHO SALE - TPKD KHÔNG CÓ DỰ ÁN TRỌNG ĐIỂM CÁ NHÂN)
  // =========================================================================
  if (!duLieu.laTruongPhong) {
    const rSec4 = ws.addRow([]);
    styleSectionHeader(rSec4, 'IV. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)');

    const rHead4 = ws.addRow([
      '',
      'STT',
      'Tên dự án & Khách hàng / CĐT',
      'Người liên hệ & SĐT',
      'Giá trị dự toán / HĐ',
      'Giai đoạn dự án',
      'Mức độ tiềm năng (%)',
      'Dịch vụ cung cấp'
    ]);
    styleTableHeader(rHead4);

    const dsDeals = duLieu.danhSachDuAnTrongDiem || [];
    let tongGiaTriDeal = 0;

    if (dsDeals.length === 0) {
      const rEmpty = ws.addRow(['', 1, 'Chưa có dự án trọng điểm nào được chọn', '—', '0 ₫', 'Đang cập nhật', '—', '—']);
      rEmpty.height = 25;
      for (let c = 2; c <= 8; c++) {
        rEmpty.getCell(c).border = borderThin;
        rEmpty.getCell(c).font = { name: 'Calibri', size: 10, italic: true };
        rEmpty.getCell(c).alignment = { vertical: 'middle', horizontal: c === 2 ? 'center' : 'left', indent: c === 2 ? 0 : 1 };
      }
    } else {
      dsDeals.forEach((d, idx) => {
        tongGiaTriDeal += Number(d.giaTriDeal || 0);
        const thongTinLienHe = d.nguoiLienHe ? `${d.nguoiLienHe}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}` : (d.soDienThoai || '—');

        const tenDuAnFull = `${d.tenDuAn}${d.tenKhachHang ? ` - CĐT: ${d.tenKhachHang}` : ''}`;

        const rDeal = ws.addRow([
          '',
          d.stt || idx + 1,
          tenDuAnFull,
          thongTinLienHe,
          formatTienTe(d.giaTriDeal),
          d.tenGiaiDoan || d.giaiDoanKey,
          `${d.xacSuatPct || 50}%`,
          d.sanPhamDichVu || 'Khảo sát / Đo đạc'
        ]);

        const h1 = tinhChieuCaoHang(tenDuAnFull, 22, 26);
        const h2 = tinhChieuCaoHang(thongTinLienHe, 18, 26);
        rDeal.height = Math.max(h1, h2);

        for (let c = 2; c <= 8; c++) {
          const cell = rDeal.getCell(c);
          cell.font = { name: 'Calibri', size: 10 };
          cell.border = borderThin;
          if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
          else if (c === 3) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
            cell.font = { name: 'Calibri', size: 10, bold: true };
          } else if (c === 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          } else if (c === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
          } else if (c === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          } else if (c === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          }
        }
      });
    }

    // Dòng tổng giá trị dự án trọng điểm
    const rTot4 = ws.addRow([
      '',
      '',
      'TỔNG GIÁ TRỊ DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT',
      '',
      formatTienTe(tongGiaTriDeal),
      'Số dự án bám sát:',
      `${dsDeals.length} dự án`,
      ''
    ]);
    rTot4.height = 28;
    for (let c = 2; c <= 8; c++) {
      const cell = rTot4.getCell(c);
      cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      cell.border = borderThin;
      if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
      else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    }
  }
}

/**
 * Xuất file Excel Báo cáo Tuần chuẩn Sales / Trưởng phòng (1 Sheet)
 */
export async function taoFileExcelBaoCaoTuanVDCD(
  duLieu: DuLieuBaoCaoTuanVDCDChuan
): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ thống Quản lý Kinh doanh VDCD';
  wb.lastModifiedBy = duLieu.nhanVien.ho_va_ten;
  wb.created = new Date();
  wb.modified = new Date();

  const sheetName = duLieu.laTruongPhong ? 'Báo Cáo Điều Hành' : `Báo Cáo - ${duLieu.nhanVien.ho_va_ten.slice(0, 20)}`;
  const ws = wb.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  });

  taoSheetBaoCaoTuanVDCD(ws, duLieu);

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * XUẤT 1 FILE EXCEL TỔNG HỢP GỒM TẤT CẢ SALE, MỖI BẠN 1 SHEET
 * - Sheet 1: Tổng quan Chi nhánh (KPIs, Tổng doanh thu, So sánh toàn đội ngũ, Dự án trọng điểm, Lịch công tác)
 * - Sheet 2..N: Mỗi Sale 1 sheet mang tên nhân sự, theo đúng form chuẩn VDCD
 */
export async function taoFileExcelTongHopToanBoSaleChiNhanh(
  params: ThamSoXuatExcelTongHopToanBoSale
): Promise<Blob> {
  const {
    nhanTieuDeTuan,
    tenChiNhanh,
    baoCaoTongChiNhanh,
    danhSachBaoCaoSale,
    lichTuanToiToanChiNhanh = [],
    danhSachDuAnTrongDiemChiNhanh = []
  } = params;

  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ thống Quản trị Kinh doanh VDCD';
  wb.created = new Date();
  wb.modified = new Date();

  // =========================================================================
  // SHEET 1: TỔNG QUAN CHI NHÁNH (Vừa 1 trang A4 dọc, chữ to rõ, ngắn gọn)
  // =========================================================================
  const sTong = wb.addWorksheet('Tổng Quan Chi Nhánh', {
    views: [{ showGridLines: true }]
  });

  cauHinhInA4Doc(sTong, 1);

  sTong.columns = [
    { key: 'colA', width: 1.0 },
    { key: 'stt', width: 5 },
    { key: 'colC', width: 23 },
    { key: 'colD', width: 15 },
    { key: 'colE', width: 14 },
    { key: 'colF', width: 14 },
    { key: 'colG', width: 13 },
    { key: 'colH', width: 20 }
  ];

  const themDongCachTong = () => {
    const r = sTong.addRow([]);
    r.height = 8;
  };

  const styleSectionHeaderTong = (row: ExcelJS.Row, tieuDe: string) => {
    sTong.mergeCells(`B${row.number}:H${row.number}`);
    const cell = row.getCell(2);
    cell.value = tieuDe;
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    row.height = 26;
    for (let c = 2; c <= 8; c++) row.getCell(c).border = borderThin;
  };

  const styleTableHeaderTong = (row: ExcelJS.Row) => {
    row.height = 28;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF991B1B' } },
        left: { style: 'thin', color: { argb: 'FF991B1B' } },
        bottom: { style: 'thin', color: { argb: 'FF991B1B' } },
        right: { style: 'thin', color: { argb: 'FF991B1B' } }
      };
    }
  };

  // BANNER SHEET TỔNG
  const rT1 = sTong.addRow([]);
  sTong.mergeCells('B1:H1');
  const cT1 = rT1.getCell(2);
  cT1.value = `BÁO CÁO TUẦN KINH DOANH — ${tenChiNhanh.toUpperCase()}`;
  cT1.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  cT1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
  cT1.alignment = { vertical: 'middle', horizontal: 'center' };
  rT1.height = 34;

  const rT2 = sTong.addRow([]);
  sTong.mergeCells('B2:H2');
  const cT2 = rT2.getCell(2);
  const soSale = danhSachBaoCaoSale.filter((x) => !x.laTruongPhong).length;
  const coTP = danhSachBaoCaoSale.some((x) => x.laTruongPhong);
  cT2.value = `${nhanTieuDeTuan}  ·  ${tenChiNhanh}  ·  ${soSale} NVKD${coTP ? ' + 1 TP' : ''}`;
  cT2.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF475569' } };
  cT2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cT2.alignment = { vertical: 'middle', horizontal: 'center' };
  rT2.height = 22;

  // I. DOANH THU TOÀN PHÒNG TUẦN QUA
  const rSecT1 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT1, 'I. DOANH THU TOÀN PHÒNG TUẦN QUA');

  const rHeadT1 = sTong.addRow(['', 'STT', 'Chỉ tiêu', 'DT Tuần (VNĐ)', 'MTD (VNĐ)', 'YTD (VNĐ)', '% Tháng', '% Năm']);
  styleTableHeaderTong(rHeadT1);

  const dataDTTong = [
    {
      stt: 1,
      chiTieu: 'Doanh thu ký kết',
      tuan: baoCaoTongChiNhanh.dt_tuan_ky_ket,
      mtd: baoCaoTongChiNhanh.mtd_ky_ket,
      ytd: baoCaoTongChiNhanh.ytd_ky_ket,
      pctThang: baoCaoTongChiNhanh.kpi_thang_ky_ket > 0 ? `${Math.round((baoCaoTongChiNhanh.mtd_ky_ket / baoCaoTongChiNhanh.kpi_thang_ky_ket) * 100)}%` : '—',
      pctNam: baoCaoTongChiNhanh.kpi_nam_ky_ket > 0 ? `${Math.round((baoCaoTongChiNhanh.ytd_ky_ket / baoCaoTongChiNhanh.kpi_nam_ky_ket) * 100)}%` : '—'
    },
    {
      stt: 2,
      chiTieu: 'Doanh thu tiền về',
      tuan: baoCaoTongChiNhanh.dt_tuan_tien_ve,
      mtd: baoCaoTongChiNhanh.mtd_tien_ve,
      ytd: baoCaoTongChiNhanh.ytd_tien_ve,
      pctThang: baoCaoTongChiNhanh.kpi_thang_tien_ve > 0 ? `${Math.round((baoCaoTongChiNhanh.mtd_tien_ve / baoCaoTongChiNhanh.kpi_thang_tien_ve) * 100)}%` : '—',
      pctNam: baoCaoTongChiNhanh.kpi_nam_tien_ve > 0 ? `${Math.round((baoCaoTongChiNhanh.ytd_tien_ve / baoCaoTongChiNhanh.kpi_nam_tien_ve) * 100)}%` : '—'
    }
  ];

  dataDTTong.forEach((item) => {
    const row = sTong.addRow([
      '',
      item.stt,
      item.chiTieu,
      formatTienTe(item.tuan),
      formatTienTe(item.mtd),
      formatTienTe(item.ytd),
      item.pctThang,
      item.pctNam
    ]);
    row.height = 24;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = borderThin;
      if (c === 2 || c === 7 || c === 8) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 11, bold: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 11, bold: true };
      }
    }
  });

  themDongCachTong();

  // II. KẾT QUẢ TUẦN QUA THEO NHÂN SỰ
  const rSecT2 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT2, 'II. KẾT QUẢ TUẦN QUA THEO NHÂN SỰ');

  const rHeadT2 = sTong.addRow([
    '',
    'STT',
    'Nhân sự',
    'KH mới',
    'Báo giá',
    'Dự án',
    'Hợp đồng',
    'Doanh thu (VNĐ)'
  ]);
  styleTableHeaderTong(rHeadT2);

  const dsSaleThucTe = danhSachBaoCaoSale.filter((x) => !x.laTruongPhong);

  let tongKhachMoiThuc = 0;
  let tongKhachMoiMT = 0;
  let tongBaoGiaThuc = 0;
  let tongBaoGiaMT = 0;
  let tongDuAnThuc = 0;
  let tongDuAnMT = 0;
  let tongHopDongThuc = 0;
  let tongHopDongMT = 0;
  let tongDTThuc = 0;
  let tongDTMT = 0;

  const fmtChiSoSale = (thucTe: number, mucTieu?: number) => {
    if (mucTieu && mucTieu > 0) {
      return `${thucTe} / ${mucTieu}`;
    }
    return `${thucTe}`;
  };

  dsSaleThucTe.forEach((sale, idx) => {
    const kp = sale.kpiTuanQua;
    tongKhachMoiThuc += kp.khachHangMoi.thucTe;
    tongKhachMoiMT += kp.khachHangMoi.mucTieu;
    tongBaoGiaThuc += kp.baoGia.thucTe;
    tongBaoGiaMT += kp.baoGia.mucTieu;
    tongDuAnThuc += kp.duAnLamViec.thucTe;
    tongDuAnMT += kp.duAnLamViec.mucTieu;
    tongHopDongThuc += kp.hopDongKy.thucTe;
    tongHopDongMT += kp.hopDongKy.mucTieu;
    tongDTThuc += kp.doanhThu.thucTe;
    tongDTMT += kp.doanhThu.mucTieu;

    const row = sTong.addRow([
      '',
      idx + 1,
      sale.nhanVien.ho_va_ten,
      fmtChiSoSale(kp.khachHangMoi.thucTe, kp.khachHangMoi.mucTieu),
      fmtChiSoSale(kp.baoGia.thucTe, kp.baoGia.mucTieu),
      fmtChiSoSale(kp.duAnLamViec.thucTe, kp.duAnLamViec.mucTieu),
      fmtChiSoSale(kp.hopDongKy.thucTe, kp.hopDongKy.mucTieu),
      formatTienTe(kp.doanhThu.thucTe)
    ]);
    row.height = 24;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = borderThin;
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 11, bold: true };
      } else if (c === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF047857' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  const rTongSale = sTong.addRow([
    '',
    '',
    'TỔNG CỘNG',
    fmtChiSoSale(tongKhachMoiThuc, tongKhachMoiMT),
    fmtChiSoSale(tongBaoGiaThuc, tongBaoGiaMT),
    fmtChiSoSale(tongDuAnThuc, tongDuAnMT),
    fmtChiSoSale(tongHopDongThuc, tongHopDongMT),
    formatTienTe(tongDTThuc)
  ]);
  rTongSale.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongSale.getCell(c);
    cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF991B1B' } },
      left: { style: 'thin', color: { argb: 'FF991B1B' } },
      bottom: { style: 'double', color: { argb: 'FF991B1B' } },
      right: { style: 'thin', color: { argb: 'FF991B1B' } }
    };
    if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    else if (c === 8) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  themDongCachTong();

  // III. CAM KẾT TUẦN TỚI THEO NHÂN SỰ
  const rSecT3 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT3, 'III. CAM KẾT TUẦN TỚI THEO NHÂN SỰ');

  const rHeadT3 = sTong.addRow([
    '',
    'STT',
    'Nhân sự',
    'KH mới',
    'Báo giá',
    'Dự án',
    'Hợp đồng',
    'DT dự kiến (VNĐ)'
  ]);
  styleTableHeaderTong(rHeadT3);

  let tongKhachCK = 0;
  let tongBaoGiaCK = 0;
  let tongDuAnCK = 0;
  let tongHopDongCK = 0;
  let tongDTCK = 0;

  dsSaleThucTe.forEach((sale, idx) => {
    const ck = sale.camKetTuanToi;
    tongKhachCK += ck.khachHangMoi.target;
    tongBaoGiaCK += ck.baoGia.target;
    tongDuAnCK += ck.duAnLamViec.target;
    tongHopDongCK += ck.hopDongMoi.target;
    tongDTCK += ck.doanhThu.target;

    const row = sTong.addRow([
      '',
      idx + 1,
      sale.nhanVien.ho_va_ten,
      ck.khachHangMoi.target,
      ck.baoGia.target,
      ck.duAnLamViec.target,
      ck.hopDongMoi.target,
      formatTienTe(ck.doanhThu.target)
    ]);
    row.height = 24;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = borderThin;
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 11, bold: true };
      } else if (c === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E40AF' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  const rTongCK = sTong.addRow([
    '',
    '',
    'TỔNG CAM KẾT',
    tongKhachCK,
    tongBaoGiaCK,
    tongDuAnCK,
    tongHopDongCK,
    formatTienTe(tongDTCK)
  ]);
  rTongCK.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongCK.getCell(c);
    cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E40AF' } },
      left: { style: 'thin', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'double', color: { argb: 'FF1E40AF' } },
      right: { style: 'thin', color: { argb: 'FF1E40AF' } }
    };
    if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    else if (c === 8) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  themDongCachTong();

  // IV. DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH
  const rSecT4 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT4, 'IV. DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH');

  const rHeadT4 = sTong.addRow([
    '',
    'STT',
    'Dự án & Khách hàng',
    'Phụ trách',
    'Giá trị (VNĐ)',
    'Giai đoạn',
    'Tiềm năng',
    'Dịch vụ'
  ]);
  styleTableHeaderTong(rHeadT4);

  let tongGTDuAnCN = 0;
  if (danhSachDuAnTrongDiemChiNhanh.length === 0) {
    const rE = sTong.addRow(['', 1, 'Chưa có dự án trọng điểm', '—', '0 ₫', 'Đang cập nhật', '—', '—']);
    rE.height = 24;
    for (let c = 2; c <= 8; c++) {
      rE.getCell(c).border = borderThin;
      rE.getCell(c).font = { name: 'Calibri', size: 11, italic: true };
      rE.getCell(c).alignment = { vertical: 'middle', horizontal: c === 2 ? 'center' : 'left', indent: c === 2 ? 0 : 1 };
    }
  } else {
    danhSachDuAnTrongDiemChiNhanh.forEach((d, idx) => {
      tongGTDuAnCN += Number(d.giaTriDeal || 0);
      const thongTin = d.nguoiPhuTrach ? `${d.nguoiPhuTrach}${d.soDienThoai ? `\n${d.soDienThoai}` : ''}` : (d.soDienThoai || '—');
      const tenFull = `${d.tenDuAn}${d.tenKhachHang ? ` (${d.tenKhachHang})` : ''}`;

      const row = sTong.addRow([
        '',
        idx + 1,
        tenFull,
        thongTin,
        formatTienTe(d.giaTriDeal),
        d.tenGiaiDoan || d.giaiDoanKey,
        `${d.xacSuatPct || 50}%`,
        d.sanPhamDichVu || 'Khảo sát / Đo đạc'
      ]);

      const h1 = tinhChieuCaoHang(tenFull, 22, 24);
      const h2 = tinhChieuCaoHang(thongTin, 15, 24);
      row.height = Math.max(h1, h2);

      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 11 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          cell.font = { name: 'Calibri', size: 11, bold: true };
        } else if (c === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        } else if (c === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E40AF' } };
        } else if (c === 6 || c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          if (c === 7) cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF047857' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        }
      }
    });
  }

  const rTongDA = sTong.addRow([
    '',
    '',
    'TỔNG GIÁ TRỊ DỰ ÁN',
    '',
    formatTienTe(tongGTDuAnCN),
    'Tổng số:',
    `${danhSachDuAnTrongDiemChiNhanh.length} DA`,
    ''
  ]);
  rTongDA.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongDA.getCell(c);
    cell.font = { name: 'Calibri', size: 11.5, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E40AF' } },
      left: { style: 'thin', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'double', color: { argb: 'FF1E40AF' } },
      right: { style: 'thin', color: { argb: 'FF1E40AF' } }
    };
    if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    else if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  themDongCachTong();

  // V. LỊCH CÔNG TÁC TUẦN TỚI TOÀN PHÒNG
  if (lichTuanToiToanChiNhanh.length > 0) {
    const rSecT5 = sTong.addRow([]);
    styleSectionHeaderTong(rSecT5, 'V. LỊCH CÔNG TÁC TUẦN TỚI TOÀN PHÒNG');

    const rHeadT5 = sTong.addRow([
      '',
      'STT',
      'Ngày & Giờ',
      'Nhân sự',
      'Khách hàng',
      'Nội dung chi tiết',
      '',
      ''
    ]);
    styleTableHeaderTong(rHeadT5);
    sTong.mergeCells(`F${rHeadT5.number}:H${rHeadT5.number}`);

    const mapNhomLich = new Map<string, typeof lichTuanToiToanChiNhanh>();
    lichTuanToiToanChiNhanh.forEach((l) => {
      const ten = l.ten_nhan_vien || 'Chuyên viên KD';
      if (!mapNhomLich.has(ten)) mapNhomLich.set(ten, []);
      mapNhomLich.get(ten)!.push(l);
    });

    const dsNhanSuSorted = Array.from(mapNhomLich.keys()).sort((a, b) => {
      const aTP = a.includes('TPKD') || a.includes('Trưởng phòng');
      const bTP = b.includes('TPKD') || b.includes('Trưởng phòng');
      if (aTP && !bTP) return -1;
      if (!aTP && bTP) return 1;
      return a.localeCompare(b, 'vi');
    });

    let sttTong = 0;
    dsNhanSuSorted.forEach((tenNV) => {
      const ds = mapNhomLich.get(tenNV)!;
      const rNhom = sTong.addRow(['', '', `${tenNV.toUpperCase()} (${ds.length} lịch)`, '', '', '', '', '']);
      sTong.mergeCells(`C${rNhom.number}:H${rNhom.number}`);
      rNhom.height = 24;
      for (let c = 2; c <= 8; c++) {
        const cell = rNhom.getCell(c);
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF991B1B' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.border = borderThin;
        if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }

      ds.forEach((l) => {
        sttTong += 1;
        const thoiGian = `${l.ngay.slice(5)} (${l.gio_bat_dau || ''})`;
        const khachHang = `${l.ten_khach_hang}${l.dia_diem ? ` - ${l.dia_diem}` : ''}`;
        const noiDung = l.noi_dung || l.tieu_de || 'Gặp khách hàng';

        const row = sTong.addRow([
          '',
          sttTong,
          thoiGian,
          tenNV,
          khachHang,
          noiDung,
          '',
          ''
        ]);
        const rIdx = row.number;
        sTong.mergeCells(`F${rIdx}:H${rIdx}`);
        row.height = tinhChieuCaoHang(noiDung, 45, 24);

        for (let c = 2; c <= 8; c++) {
          const cell = row.getCell(c);
          cell.font = { name: 'Calibri', size: 11 };
          cell.border = borderThin;
          if (c === 2 || c === 3) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          else if (c === 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
            cell.font = { name: 'Calibri', size: 11, bold: true };
          } else if (c === 5 || c === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
          }
        }
      });
    });
  }

  // =========================================================================
  // CÁC SHEET TIẾP THEO: MỖI SALE 1 SHEET RIÊNG BIỆT
  // =========================================================================
  const setTenSheets = new Set<string>();
  setTenSheets.add('Tổng Quan Chi Nhánh');

  for (const sale of danhSachBaoCaoSale) {
    let rawSheetName = sale.laTruongPhong
      ? `TP - ${sale.nhanVien.ho_va_ten}`
      : `Sale - ${sale.nhanVien.ho_va_ten}`;
    // Cắt tối đa 28 ký tự vì giới hạn Excel sheet name là 31 ký tự
    rawSheetName = rawSheetName.slice(0, 28).trim();
    let tenSheet = rawSheetName;
    let dem = 2;
    while (setTenSheets.has(tenSheet)) {
      tenSheet = `${rawSheetName}_${dem}`;
      dem++;
    }
    setTenSheets.add(tenSheet);

    const wsSale = wb.addWorksheet(tenSheet, {
      views: [{ showGridLines: true }]
    });

    taoSheetBaoCaoTuanVDCD(wsSale, sale);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

export function taiFileExcelBlob(blob: Blob, tenFile: string): void {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = tenFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
