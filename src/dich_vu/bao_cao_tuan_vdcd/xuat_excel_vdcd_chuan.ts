import ExcelJS from 'exceljs';

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
  // Danh sách dự án trọng điểm đang bám sát (sắp xếp theo mức độ tiềm năng cao trở lên)
  danhSachDuAnTrongDiem: {
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
  }[];
  // Khối II (Sale): Chỉ tiêu cam kết tuần tới (5 chỉ số tương ứng)
  camKetTuanToi: {
    khachHangMoi: { target: number; min: number; max: number };
    baoGia: { target: number; min: number; max: number };
    duAnLamViec: { target: number; min: number; max: number };
    hopDongMoi: { target: number; min: number; max: number };
    doanhThu: { target: number; min: number; max: number };
  };
  // Kế hoạch lịch làm việc tuần tới (Lấy từ lịch làm việc có sẵn)
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

const formatTienTe = (val?: number | null): string => {
  const n = Number(val || 0);
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
};

export async function taoFileExcelBaoCaoTuanVDCD(
  duLieu: DuLieuBaoCaoTuanVDCDChuan
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Hệ thống Quản lý Kinh doanh VDCD';
  wb.lastModifiedBy = duLieu.nhanVien.ho_va_ten;
  wb.created = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet('Báo Cáo & Kế Hoạch Tuần', {
    views: [{ showGridLines: true }]
  });

  // Thiết lập độ rộng cột chuẩn tương ứng với mẫu Google Sheet
  ws.columns = [
    { key: 'colA', width: 3 },  // Lề trái
    { key: 'stt', width: 7 },   // B: STT
    { key: 'colC', width: 38 }, // C: Tên Chỉ tiêu / Tên Dự án & KH / Lịch ngày
    { key: 'colD', width: 26 }, // D: ĐVT / Người liên hệ & SĐT / Người phụ trách
    { key: 'colE', width: 22 }, // E: Mục tiêu / Giá trị deal / Target
    { key: 'colF', width: 28 }, // F: Thực tế / Giai đoạn / Nội dung chi tiết
    { key: 'colG', width: 22 }, // G: Tỷ lệ % / Mức tiềm năng
    { key: 'colH', width: 24 }  // H: Dịch vụ
  ];

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  const styleSectionHeader = (row: ExcelJS.Row, tieuDe: string) => {
    ws.mergeCells(`B${row.number}:H${row.number}`);
    const cell = row.getCell(2);
    cell.value = tieuDe;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1F2937' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    row.height = 26;
    for (let c = 2; c <= 8; c++) {
      row.getCell(c).border = borderThin;
    }
  };

  const styleTableHeader = (row: ExcelJS.Row) => {
    row.height = 28;
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
  cTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
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
  r2.height = 22;

  // =========================================================================
  // KHỐI I: ĐÁNH GIÁ TUẦN QUA
  // =========================================================================
  if (duLieu.laTruongPhong) {
    // --- DÀNH CHO TRƯỞNG PHÒNG KINH DOANH ---
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
        noiDung: duLieu.deXuatBanGiamDocTP || 'Không có đề xuất vướng mắc đặc biệt trong tuần này.'
      }
    ];

    dsTongKetTP.forEach((item) => {
      const lineCount = (item.noiDung || '').split('\n').length;
      const row = ws.addRow(['', item.stt, item.tieuDe, '', '', item.noiDung, '', '']);
      const rIdx = row.number;
      ws.mergeCells(`C${rIdx}:E${rIdx}`);
      ws.mergeCells(`F${rIdx}:H${rIdx}`);
      row.height = Math.max(26, lineCount * 18 + 8);
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          if (item.stt === 1) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
          }
        }
      }
    });
  } else {
    // --- DÀNH CHO NHÂN VIÊN SALE ---
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
      row.height = 24;
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2 || c === 5) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'right' };
        else cell.alignment = { vertical: 'middle', horizontal: 'left' };
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
    rTot1.height = 26;
    for (let c = 2; c <= 8; c++) {
      const cell = rTot1.getCell(c);
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
      cell.border = borderThin;
      if (c === 2 || c === 5) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'right' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  }

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI II: KẾ HOẠCH & CHỈ TIÊU TUẦN TỚI
  // =========================================================================
  if (duLieu.laTruongPhong) {
    // --- DÀNH CHO TRƯỞNG PHÒNG KINH DOANH (ĐỊNH HƯỚNG & TRỌNG TÂM ĐIỀU HÀNH) ---
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
      const lineCount = (item.noiDung || '').split('\n').length;
      const row = ws.addRow(['', item.stt, item.tieuDe, '', '', item.noiDung, '', '']);
      const rIdx = row.number;
      ws.mergeCells(`C${rIdx}:E${rIdx}`);
      ws.mergeCells(`F${rIdx}:H${rIdx}`);
      row.height = Math.max(26, lineCount * 18 + 8);
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 3) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1F2937' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        } else if (c === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          if (item.stt === 1) {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
          }
        }
      }
    });
  } else {
    // --- DÀNH CHO SALE (CHỈ TIÊU CAM KẾT TUẦN TỚI) ---
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
      row.height = 24;
      for (let c = 2; c <= 8; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2 || c === 4) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
        else cell.alignment = { vertical: 'middle', horizontal: 'left' };
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
  ws.mergeCells(`F${rHead3.number}:H${rHead3.number}`);

  const dsLich = duLieu.lichLamViecTuanToi || [];
  dsLich.forEach((l, idx) => {
    const rawContent = l.noiDungChiTiet || 'Theo kế hoạch tác nghiệp phát sinh phòng kinh doanh';
    const formattedContent = rawContent.includes('; ') ? rawContent.split('; ').join('\n• ') : rawContent;
    const finalContent = formattedContent.startsWith('[') || formattedContent.startsWith('•') ? formattedContent : `• ${formattedContent}`;
    const lineCount = finalContent.split('\n').length;

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
    row.height = Math.max(28, lineCount * 18 + 8);

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
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    }
  });

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI IV: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)
  // (ĐƯỢC ĐẶT BÊN DƯỚI LỊCH LÀM VIỆC TUẦN TỚI THEO YÊU CẦU)
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
    rEmpty.height = 24;
    for (let c = 2; c <= 8; c++) {
      rEmpty.getCell(c).border = borderThin;
      rEmpty.getCell(c).font = { name: 'Calibri', size: 10, italic: true };
      rEmpty.getCell(c).alignment = { vertical: 'middle', horizontal: c === 2 ? 'center' : 'left' };
    }
  } else {
    dsDeals.forEach((d, idx) => {
      tongGiaTriDeal += Number(d.giaTriDeal || 0);
      const thongTinLienHe = duLieu.laTruongPhong && d.nguoiPhuTrach
        ? `${d.nguoiPhuTrach}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}`
        : d.nguoiLienHe ? `${d.nguoiLienHe}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}` : (d.soDienThoai || '—');

      const rDeal = ws.addRow([
        '',
        d.stt || idx + 1,
        `${d.tenDuAn}${d.tenKhachHang ? ` - CĐT: ${d.tenKhachHang}` : ''}`,
        thongTinLienHe,
        formatTienTe(d.giaTriDeal),
        d.tenGiaiDoan || d.giaiDoanKey,
        `${d.xacSuatPct || 50}%`,
        d.sanPhamDichVu || 'Khảo sát / Đo đạc'
      ]);
      rDeal.height = 26;
      for (let c = 2; c <= 8; c++) {
        const cell = rDeal.getCell(c);
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = borderThin;
        if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        else if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
        else if (c === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF047857' } };
        }
        else cell.alignment = { vertical: 'middle', horizontal: 'left' };
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
  rTot4.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTot4.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = borderThin;
    if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'center' };
    else cell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // Xuất Buffer ra Blob
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
