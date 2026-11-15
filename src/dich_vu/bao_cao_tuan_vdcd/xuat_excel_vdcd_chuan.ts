import ExcelJS from 'exceljs';
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
function taoSheetBaoCaoTuanVDCD(ws: ExcelJS.Worksheet, duLieu: DuLieuBaoCaoTuanVDCDChuan) {
  // Thiết lập độ rộng cột chuẩn
  ws.columns = [
    { key: 'colA', width: 3 },  // A: Lề
    { key: 'stt', width: 7 },   // B: STT
    { key: 'colC', width: 40 }, // C: Tên Chỉ tiêu / Tên Dự án & KH / Lịch ngày
    { key: 'colD', width: 28 }, // D: ĐVT / Người liên hệ & SĐT / Người phụ trách
    { key: 'colE', width: 24 }, // E: Mục tiêu / Giá trị deal / Target
    { key: 'colF', width: 30 }, // F: Thực tế / Giai đoạn / Nội dung chi tiết
    { key: 'colG', width: 22 }, // G: Tỷ lệ % / Mức tiềm năng
    { key: 'colH', width: 26 }  // H: Dịch vụ
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
        noiDung: duLieu.danhGiaTuanQuaTP || 'Đội ngũ bám sát kế hoạch, duy trì nhịp độ làm việc và phối hợp xử lý hồ sơ tốt.'
      },
      {
        stt: 6,
        tieuDe: 'Khó khăn, vướng mắc & Đề xuất gửi lên Ban Giám đốc',
        noiDung: duLieu.deXuatBanGiamDocTP || 'Không có vướng mắc đặc biệt trong tuần này.'
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
    styleSectionHeader(rSec1, 'I. ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN CHỈ TIÊU TUẦN QUA');

    const rHead1 = ws.addRow(['', 'STT', 'Chỉ tiêu đánh giá tuần qua', '', 'ĐVT', 'Kế hoạch tuần trước', 'Thực tế đạt', '']);
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
      const row = ws.addRow([
        '',
        item.stt,
        item.ten,
        '',
        item.dvt,
        item.laTien ? formatTienTe(item.mucTieu) : item.mucTieu,
        item.laTien ? formatTienTe(item.thucTe) : item.thucTe,
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
        if (c === 2 || c === 5) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 6 || c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          if (item.laTien) cell.font = { name: 'Calibri', size: 10, bold: true };
        } else cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
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

  const rHead3 = ws.addRow(['', 'STT', 'Lịch tuần / Ngày', '', '', 'Nội dung công việc chi tiết', '', '']);
  styleTableHeader(rHead3);
  ws.mergeCells(`C${rHead3.number}:E${rHead3.number}`);
  ws.mergeCells(`F${rHead3.number}:H${rHead3.number}`);

  const dsLich = duLieu.lichLamViecTuanToi || [];
  dsLich.forEach((l, idx) => {
    const rawContent = l.noiDungChiTiet || 'Theo kế hoạch tác nghiệp phát sinh phòng kinh doanh';
    const formattedContent = rawContent.includes('; ') ? rawContent.split('; ').join('\n• ') : rawContent;
    const finalContent = formattedContent.startsWith('[') || formattedContent.startsWith('•') ? formattedContent : `• ${formattedContent}`;

    const row = ws.addRow([
      '',
      idx + 1,
      l.tenThuNgay,
      '',
      '',
      finalContent,
      '',
      ''
    ]);
    const rIdx = row.number;
    ws.mergeCells(`C${rIdx}:E${rIdx}`);
    ws.mergeCells(`F${rIdx}:H${rIdx}`);
    row.height = tinhChieuCaoHang(finalContent, 72, 28);

    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (c === 3) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      } else if (c === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
      }
    }
  });

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI IV: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)
  // (ĐƯỢC ĐẶT BÊN DƯỚI LỊCH LÀM VIỆC TUẦN TỚI)
  // =========================================================================
  const rSec4 = ws.addRow([]);
  styleSectionHeader(
    rSec4,
    duLieu.laTruongPhong
      ? 'IV. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM TOÀN PHÒNG ĐANG BÁM SÁT & CHỈ ĐẠO (TIỀM NĂNG CAO)'
      : 'IV. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)'
  );

  const rHead4 = ws.addRow([
    '',
    'STT',
    'Tên dự án & Khách hàng / CĐT',
    duLieu.laTruongPhong ? 'Phụ trách & SĐT' : 'Người liên hệ & SĐT',
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
      const thongTinLienHe = duLieu.laTruongPhong && d.nguoiPhuTrach
        ? `${d.nguoiPhuTrach}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}`
        : d.nguoiLienHe ? `${d.nguoiLienHe}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}` : (d.soDienThoai || '—');

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

      const h1 = tinhChieuCaoHang(tenDuAnFull, 38, 26);
      const h2 = tinhChieuCaoHang(thongTinLienHe, 26, 26);
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

/**
 * Xuất file Excel Báo cáo Tuần chuẩn Sales / Trưởng phòng (1 Sheet)
 */
export async function taoFileExcelBaoCaoTuanVDCD(
  duLieu: DuLieuBaoCaoTuanVDCDChuan
): Promise<Blob> {
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

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ thống Quản trị Kinh doanh VDCD';
  wb.created = new Date();
  wb.modified = new Date();

  // =========================================================================
  // SHEET 1: TỔNG QUAN CHI NHÁNH
  // =========================================================================
  const sTong = wb.addWorksheet('Tổng Quan Chi Nhánh', {
    views: [{ showGridLines: true }]
  });

  sTong.columns = [
    { key: 'colA', width: 3 },
    { key: 'stt', width: 7 },
    { key: 'colC', width: 32 },
    { key: 'colD', width: 22 },
    { key: 'colE', width: 22 },
    { key: 'colF', width: 22 },
    { key: 'colG', width: 20 },
    { key: 'colH', width: 24 }
  ];

  const styleSectionHeaderTong = (row: ExcelJS.Row, tieuDe: string) => {
    sTong.mergeCells(`B${row.number}:H${row.number}`);
    const cell = row.getCell(2);
    cell.value = tieuDe;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    row.height = 28;
    for (let c = 2; c <= 8; c++) row.getCell(c).border = borderThin;
  };

  const styleTableHeaderTong = (row: ExcelJS.Row) => {
    row.height = 30;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
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
  cT1.value = `BÁO CÁO TỔNG HỢP KINH DOANH CHI NHÁNH ${tenChiNhanh.toUpperCase()} — VDCD`;
  cT1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  cT1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
  cT1.alignment = { vertical: 'middle', horizontal: 'center' };
  rT1.height = 36;

  const rT2 = sTong.addRow([]);
  sTong.mergeCells('B2:H2');
  const cT2 = rT2.getCell(2);
  cT2.value = `Kỳ: ${nhanTieuDeTuan}  |  Đơn vị: ${tenChiNhanh}  |  Tổng hợp dữ liệu ${danhSachBaoCaoSale.length} nhân sự kinh doanh`;
  cT2.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  cT2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cT2.alignment = { vertical: 'middle', horizontal: 'center' };
  rT2.height = 24;

  // I. TỔNG KẾT DOANH THU TOÀN PHÒNG
  const rSecT1 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT1, 'I. TỔNG KẾT DOANH THU TOÀN PHÒNG TUẦN QUA');

  const rHeadT1 = sTong.addRow(['', 'STT', 'Chỉ tiêu doanh thu', 'DT Tuần (VNĐ)', 'MTD (VNĐ)', 'YTD (VNĐ)', '%/KPI Tháng', '%/KPI Năm']);
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
    row.height = 26;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2 || c === 7 || c === 8) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      }
    }
  });

  sTong.addRow([]);

  // II. BẢNG TỔNG HỢP KẾT QUẢ TỪNG NHÂN VIÊN KINH DOANH
  const rSecT2 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT2, 'II. BẢNG TỔNG HỢP KẾT QUẢ & CHỈ SỐ TỪNG NHÂN VIÊN KINH DOANH TUẦN QUA');

  const rHeadT2 = sTong.addRow([
    '',
    'STT',
    'Họ và tên NVKD',
    'Khách mới (Đạt/KH)',
    'Báo giá (Đạt/KH)',
    'Dự án bám sát',
    'HĐ ký kết (Đạt/KH)',
    'DT Thực tế tuần (VNĐ)'
  ]);
  styleTableHeaderTong(rHeadT2);

  let tongKhachMoiThuc = 0;
  let tongBaoGiaThuc = 0;
  let tongDuAnThuc = 0;
  let tongHopDongThuc = 0;
  let tongDTThuc = 0;

  danhSachBaoCaoSale.forEach((sale, idx) => {
    const kp = sale.kpiTuanQua;
    tongKhachMoiThuc += kp.khachHangMoi.thucTe;
    tongBaoGiaThuc += kp.baoGia.thucTe;
    tongDuAnThuc += kp.duAnLamViec.thucTe;
    tongHopDongThuc += kp.hopDongKy.thucTe;
    tongDTThuc += kp.doanhThu.thucTe;

    const row = sTong.addRow([
      '',
      idx + 1,
      sale.nhanVien.ho_va_ten,
      `${kp.khachHangMoi.thucTe} / ${kp.khachHangMoi.mucTieu}`,
      `${kp.baoGia.thucTe} / ${kp.baoGia.mucTieu}`,
      `${kp.duAnLamViec.thucTe} / ${kp.duAnLamViec.mucTieu}`,
      `${kp.hopDongKy.thucTe} / ${kp.hopDongKy.mucTieu}`,
      formatTienTe(kp.doanhThu.thucTe)
    ]);
    row.height = 26;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      } else if (c === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  // Dòng tổng cộng NVKD
  const rTongSale = sTong.addRow([
    '',
    '',
    'TỔNG CỘNG TOÀN ĐỘI NGŨ',
    `${tongKhachMoiThuc} khách`,
    `${tongBaoGiaThuc} báo giá`,
    `${tongDuAnThuc} dự án`,
    `${tongHopDongThuc} hợp đồng`,
    formatTienTe(tongDTThuc)
  ]);
  rTongSale.height = 28;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongSale.getCell(c);
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    cell.border = borderThin;
    if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    else if (c === 8) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  sTong.addRow([]);

  // III. BẢNG TỔNG HỢP CHỈ TIÊU CAM KẾT TUẦN TỚI TỪNG NHÂN SỰ
  const rSecT3 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT3, 'III. BẢNG TỔNG HỢP CHỈ TIÊU CAM KẾT TUẦN TỚI TỪNG NHÂN SỰ');

  const rHeadT3 = sTong.addRow([
    '',
    'STT',
    'Họ và tên NVKD',
    'Khách mới cam kết',
    'Báo giá cam kết',
    'Dự án bám sát',
    'HĐ mới cam kết',
    'DT Mục tiêu tuần tới (VNĐ)'
  ]);
  styleTableHeaderTong(rHeadT3);

  let tongKhachCK = 0;
  let tongBaoGiaCK = 0;
  let tongDuAnCK = 0;
  let tongHopDongCK = 0;
  let tongDTCK = 0;

  danhSachBaoCaoSale.forEach((sale, idx) => {
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
    row.height = 26;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      } else if (c === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  });

  const rTongCK = sTong.addRow([
    '',
    '',
    'TỔNG CAM KẾT TOÀN PHÒNG',
    `${tongKhachCK} khách`,
    `${tongBaoGiaCK} báo giá`,
    `${tongDuAnCK} dự án`,
    `${tongHopDongCK} hợp đồng`,
    formatTienTe(tongDTCK)
  ]);
  rTongCK.height = 28;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongCK.getCell(c);
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = borderThin;
    if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    else if (c === 8) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  sTong.addRow([]);

  // IV. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH
  const rSecT4 = sTong.addRow([]);
  styleSectionHeaderTong(rSecT4, 'IV. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH ĐANG BÁM SÁT (TIỀM NĂNG CAO)');

  const rHeadT4 = sTong.addRow([
    '',
    'STT',
    'Tên dự án & Khách hàng / CĐT',
    'Nhân sự phụ trách & SĐT',
    'Giá trị deal / HĐ (VNĐ)',
    'Giai đoạn',
    'Mức tiềm năng',
    'Dịch vụ'
  ]);
  styleTableHeaderTong(rHeadT4);

  let tongGTDuAnCN = 0;
  if (danhSachDuAnTrongDiemChiNhanh.length === 0) {
    const rE = sTong.addRow(['', 1, 'Chưa có dự án trọng điểm nào được chọn', '—', '0 ₫', 'Đang cập nhật', '—', '—']);
    rE.height = 25;
    for (let c = 2; c <= 8; c++) {
      rE.getCell(c).border = borderThin;
      rE.getCell(c).font = { name: 'Calibri', size: 10, italic: true };
      rE.getCell(c).alignment = { vertical: 'middle', horizontal: c === 2 ? 'center' : 'left', indent: c === 2 ? 0 : 1 };
    }
  } else {
    danhSachDuAnTrongDiemChiNhanh.forEach((d, idx) => {
      tongGTDuAnCN += Number(d.giaTriDeal || 0);
      const thongTin = d.nguoiPhuTrach ? `${d.nguoiPhuTrach}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}` : (d.soDienThoai || '—');
      const tenFull = `${d.tenDuAn}${d.tenKhachHang ? ` - CĐT: ${d.tenKhachHang}` : ''}`;

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

      const h1 = tinhChieuCaoHang(tenFull, 32, 26);
      const h2 = tinhChieuCaoHang(thongTin, 22, 26);
      row.height = Math.max(h1, h2);

      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
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
        } else if (c === 6 || c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (c === 7) cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        }
      }
    });
  }

  const rTongDA = sTong.addRow([
    '',
    '',
    'TỔNG GIÁ TRỊ DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH',
    '',
    formatTienTe(tongGTDuAnCN),
    'Số lượng deal:',
    `${danhSachDuAnTrongDiemChiNhanh.length} dự án`,
    ''
  ]);
  rTongDA.height = 28;
  for (let c = 2; c <= 8; c++) {
    const cell = rTongDA.getCell(c);
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = borderThin;
    if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'center' };
    else cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  }

  sTong.addRow([]);

  // V. LỊCH CÔNG TÁC TỔNG HỢP TOÀN PHÒNG TUẦN TỚI
  if (lichTuanToiToanChiNhanh.length > 0) {
    const rSecT5 = sTong.addRow([]);
    styleSectionHeaderTong(rSecT5, 'V. LỊCH CÔNG TÁC TỔNG HỢP TOÀN PHÒNG TUẦN TỚI');

    const rHeadT5 = sTong.addRow([
      '',
      'STT',
      'Ngày & Giờ',
      'Nhân sự',
      'Khách hàng / Địa bàn',
      '',
      'Nội dung công tác chi tiết',
      ''
    ]);
    styleTableHeaderTong(rHeadT5);
    sTong.mergeCells(`E${rHeadT5.number}:F${rHeadT5.number}`);
    sTong.mergeCells(`G${rHeadT5.number}:H${rHeadT5.number}`);

    lichTuanToiToanChiNhanh.forEach((l, idx) => {
      const thoiGian = `${l.ngay} (${l.gio_bat_dau || ''} - ${l.gio_ket_thuc || ''})`;
      const khachHang = `${l.ten_khach_hang}${l.dia_diem ? ` (${l.dia_diem})` : ''}`;
      const noiDung = l.noi_dung || l.tieu_de || 'Lịch gặp khách hàng theo kế hoạch';

      const row = sTong.addRow([
        '',
        idx + 1,
        thoiGian,
        l.ten_nhan_vien || 'Kinh doanh',
        khachHang,
        '',
        noiDung,
        ''
      ]);
      const rIdx = row.number;
      sTong.mergeCells(`E${rIdx}:F${rIdx}`);
      sTong.mergeCells(`G${rIdx}:H${rIdx}`);
      row.height = tinhChieuCaoHang(noiDung, 44, 26);

      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          cell.font = { name: 'Calibri', size: 10, bold: true };
        } else if (c === 5) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        } else if (c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        }
      }
    });
  }

  // =========================================================================
  // CÁC SHEET TIẾP THEO: MỖI SALE 1 SHEET RIÊNG BIỆT
  // =========================================================================
  const setTenSheets = new Set<string>();
  setTenSheets.add('Tổng Quan Chi Nhánh');

  for (const sale of danhSachBaoCaoSale) {
    let rawSheetName = sale.laTruongPhong ? 'TP - Điều Hành' : `Sale - ${sale.nhanVien.ho_va_ten}`;
    // Cắt tối đa 30 ký tự vì giới hạn Excel sheet name là 31 ký tự
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
