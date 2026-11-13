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
  // Khối I: Đánh giá kết quả KPI tuần qua
  kpiTuanQua: {
    doanhSo: { mucTieu: number; thucTe: number; danhGia?: string };
    khachHangMoi: { mucTieu: number; thucTe: number; danhGia?: string };
    cuocGapTrucTiep: { mucTieu: number; thucTe: number; danhGia?: string };
    hopDongKy: { mucTieu: number; thucTe: number; danhGia?: string };
  };
  // Khối II: Danh sách dự án trọng điểm đang bám sát (sắp xếp theo mức độ tiềm năng)
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
    mucDoTiemNang: string; // 'rat_cao' | 'cao' | 'trung_binh' | 'thap' | 'rat_thap'
    xacSuatPct: number; // 90, 70, 50...
  }[];
  // Khối III: Chỉ tiêu cam kết tuần tới
  camKetTuanToi: {
    doanhSo: { target: number; min: number; max: number };
    khachHangMoi: { target: number; min: number; max: number };
    cuocHenDemo: { target: number; min: number; max: number };
    baoGiaMoi: { target: number; min: number; max: number };
    hopDongMoi: { target: number; min: number; max: number };
  };
  // Khối IV: Kế hoạch lịch làm việc tuần tới (Lấy từ lịch làm việc có sẵn)
  lichLamViecTuanToi: {
    thu: number;
    tenThuNgay: string;
    noiDungChiTiet: string;
  }[];
}

const formatTienTe = (val?: number | null): string => {
  const n = Number(val || 0);
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
};

const formatPct = (val?: number | null): string => {
  const n = Number(val || 0);
  return `${n.toFixed(1).replace('.', ',')}%`;
};

const tinhDanhGiaKPI = (thucTe: number, mucTieu: number): string => {
  if (!mucTieu || mucTieu <= 0) {
    return thucTe > 0 ? 'Đạt' : '—';
  }
  const ratio = (thucTe / mucTieu) * 100;
  if (ratio >= 110) return `Vượt chỉ tiêu (+${Math.round(ratio - 100)}%)`;
  if (ratio >= 100) return `Đạt chỉ tiêu (${Math.round(ratio)}%)`;
  return `Chưa đạt (${Math.round(ratio)}%)`;
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
    { key: 'colD', width: 26 }, // D: ĐVT / Người liên hệ & SĐT
    { key: 'colE', width: 22 }, // E: Mục tiêu / Giá trị deal / Target
    { key: 'colF', width: 28 }, // F: Thực tế / Giai đoạn / Min / Nội dung chi tiết
    { key: 'colG', width: 22 }, // G: Tỷ lệ % / Mức tiềm năng / Max
    { key: 'colH', width: 24 }  // H: Đánh giá / Dịch vụ
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
  cTitle.value = 'BÁO CÁO KẾT QUẢ & KẾ HOẠCH TUẦN SALES VDCD';
  cTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  cTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
  cTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  r1.height = 36;

  // ROW 2: THÔNG TIN NHÂN SỰ & TUẦN
  const r2 = ws.addRow([]);
  ws.mergeCells('B2:H2');
  const cSub = r2.getCell(2);
  cSub.value = `${duLieu.nhanTieuDeTuan}  |  Nhân sự: ${duLieu.nhanVien.ho_va_ten} ${duLieu.nhanVien.ma_nhan_vien ? `(${duLieu.nhanVien.ma_nhan_vien})` : ''}  |  Phòng Kinh doanh VDCD`;
  cSub.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  cSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cSub.alignment = { vertical: 'middle', horizontal: 'center' };
  r2.height = 22;

  // =========================================================================
  // KHỐI I: ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN CHỈ TIÊU TUẦN QUA
  // =========================================================================
  const rSec1 = ws.addRow([]);
  styleSectionHeader(rSec1, 'I. ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN CHỈ TIÊU TUẦN QUA');

  const rHead1 = ws.addRow(['', 'STT', 'Chỉ tiêu KPI tuần', 'ĐVT', 'Mục tiêu giao', 'Thực tế đạt', 'Tỷ lệ hoàn thành', 'Đánh giá kết quả']);
  styleTableHeader(rHead1);

  const kpiData = [
    {
      stt: 1,
      ten: 'Doanh số bán lẻ / Dự án',
      dvt: 'VNĐ',
      mucTieu: duLieu.kpiTuanQua.doanhSo.mucTieu,
      thucTe: duLieu.kpiTuanQua.doanhSo.thucTe,
      laTien: true,
      danhGia: duLieu.kpiTuanQua.doanhSo.danhGia || tinhDanhGiaKPI(duLieu.kpiTuanQua.doanhSo.thucTe, duLieu.kpiTuanQua.doanhSo.mucTieu)
    },
    {
      stt: 2,
      ten: 'Số lượng khách hàng mới tiếp cận',
      dvt: 'Khách hàng',
      mucTieu: duLieu.kpiTuanQua.khachHangMoi.mucTieu,
      thucTe: duLieu.kpiTuanQua.khachHangMoi.thucTe,
      laTien: false,
      danhGia: duLieu.kpiTuanQua.khachHangMoi.danhGia || tinhDanhGiaKPI(duLieu.kpiTuanQua.khachHangMoi.thucTe, duLieu.kpiTuanQua.khachHangMoi.mucTieu)
    },
    {
      stt: 3,
      ten: 'Số lượng cuộc gặp / trao đổi trực tiếp',
      dvt: 'Lượt',
      mucTieu: duLieu.kpiTuanQua.cuocGapTrucTiep.mucTieu,
      thucTe: duLieu.kpiTuanQua.cuocGapTrucTiep.thucTe,
      laTien: false,
      danhGia: duLieu.kpiTuanQua.cuocGapTrucTiep.danhGia || tinhDanhGiaKPI(duLieu.kpiTuanQua.cuocGapTrucTiep.thucTe, duLieu.kpiTuanQua.cuocGapTrucTiep.mucTieu)
    },
    {
      stt: 4,
      ten: 'Số hợp đồng / đơn hàng ký kết',
      dvt: 'Hợp đồng',
      mucTieu: duLieu.kpiTuanQua.hopDongKy.mucTieu,
      thucTe: duLieu.kpiTuanQua.hopDongKy.thucTe,
      laTien: false,
      danhGia: duLieu.kpiTuanQua.hopDongKy.danhGia || tinhDanhGiaKPI(duLieu.kpiTuanQua.hopDongKy.thucTe, duLieu.kpiTuanQua.hopDongKy.mucTieu)
    }
  ];

  let sumRatio = 0;
  for (const item of kpiData) {
    const ratio = item.mucTieu > 0 ? (item.thucTe / item.mucTieu) * 100 : (item.thucTe > 0 ? 100 : 0);
    sumRatio += ratio;

    const row = ws.addRow([
      '',
      item.stt,
      item.ten,
      item.dvt,
      item.laTien ? formatTienTe(item.mucTieu) : item.mucTieu,
      item.laTien ? formatTienTe(item.thucTe) : item.thucTe,
      formatPct(ratio),
      item.danhGia
    ]);
    row.height = 24;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2 || c === 4) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 5 || c === 6) cell.alignment = { vertical: 'middle', horizontal: 'right' };
      else if (c === 7) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  }

  // Dòng Tổng hợp Doanh số & KPI Trung bình
  const avgRatio = Math.round(sumRatio / kpiData.length);
  const ratioDS = duLieu.kpiTuanQua.doanhSo.mucTieu > 0
    ? (duLieu.kpiTuanQua.doanhSo.thucTe / duLieu.kpiTuanQua.doanhSo.mucTieu) * 100
    : 0;
  const rTot1 = ws.addRow([
    '',
    '',
    'TỔNG HỢP DOANH SỐ TUẦN (VNĐ)',
    'VNĐ',
    formatTienTe(duLieu.kpiTuanQua.doanhSo.mucTieu),
    formatTienTe(duLieu.kpiTuanQua.doanhSo.thucTe),
    formatPct(ratioDS),
    `KPI TB: ${avgRatio}%`
  ]);
  rTot1.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTot1.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
    cell.border = borderThin;
    if (c === 2 || c === 4 || c === 7 || c === 8) cell.alignment = { vertical: 'middle', horizontal: 'center' };
    else if (c === 5 || c === 6) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else cell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI II: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT
  // (Lấy từ hồ sơ dự án, ưu tiên mức độ tiềm năng cao/rất cao)
  // =========================================================================
  const rSec2 = ws.addRow([]);
  styleSectionHeader(rSec2, 'II. DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)');

  const rHead2 = ws.addRow(['', 'STT', 'Tên dự án & Khách hàng / CĐT', 'Người liên hệ & SĐT', 'Giá trị dự toán / HĐ', 'Giai đoạn dự án', 'Mức độ tiềm năng (%)', 'Dịch vụ cung cấp']);
  styleTableHeader(rHead2);

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
      const rDeal = ws.addRow([
        '',
        d.stt || idx + 1,
        `${d.tenDuAn}${d.tenKhachHang ? ` - CĐT: ${d.tenKhachHang}` : ''}`,
        d.nguoiLienHe ? `${d.nguoiLienHe}${d.soDienThoai ? ` (${d.soDienThoai})` : ''}` : (d.soDienThoai || '—'),
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
  const rTot2 = ws.addRow([
    '',
    '',
    'TỔNG GIÁ TRỊ DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT',
    '',
    formatTienTe(tongGiaTriDeal),
    'Số dự án bám sát:',
    `${dsDeals.length} dự án`,
    ''
  ]);
  rTot2.height = 26;
  for (let c = 2; c <= 8; c++) {
    const cell = rTot2.getCell(c);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    cell.border = borderThin;
    if (c === 5) cell.alignment = { vertical: 'middle', horizontal: 'right' };
    else if (c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'center' };
    else cell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI III: CHỈ TIÊU CAM KẾT TUẦN TỚI
  // =========================================================================
  const rSec3 = ws.addRow([]);
  styleSectionHeader(rSec3, 'III. CHỈ TIÊU CAM KẾT TUẦN TỚI');

  const rHead3 = ws.addRow(['', 'STT', 'Chỉ tiêu cam kết tuần tới', 'ĐVT', 'Mục tiêu (Target)', 'Mức tối thiểu (Min)', 'Mức thách thức (Max)', 'Ghi chú']);
  styleTableHeader(rHead3);

  const dsCamKet = [
    {
      stt: 1,
      ten: 'Doanh số cam kết tuần',
      dvt: 'VNĐ',
      laTien: true,
      target: duLieu.camKetTuanToi.doanhSo.target,
      min: duLieu.camKetTuanToi.doanhSo.min,
      max: duLieu.camKetTuanToi.doanhSo.max
    },
    {
      stt: 2,
      ten: 'Số lượng khách hàng mới tiếp cận',
      dvt: 'Khách hàng',
      laTien: false,
      target: duLieu.camKetTuanToi.khachHangMoi.target,
      min: duLieu.camKetTuanToi.khachHangMoi.min,
      max: duLieu.camKetTuanToi.khachHangMoi.max
    },
    {
      stt: 3,
      ten: 'Số lượng cuộc hẹn demo / gặp trực tiếp',
      dvt: 'Cuộc hẹn',
      laTien: false,
      target: duLieu.camKetTuanToi.cuocHenDemo.target,
      min: duLieu.camKetTuanToi.cuocHenDemo.min,
      max: duLieu.camKetTuanToi.cuocHenDemo.max
    },
    {
      stt: 4,
      ten: 'Số lượng báo giá mới gửi cho KH',
      dvt: 'Báo giá',
      laTien: false,
      target: duLieu.camKetTuanToi.baoGiaMoi.target,
      min: duLieu.camKetTuanToi.baoGiaMoi.min,
      max: duLieu.camKetTuanToi.baoGiaMoi.max
    },
    {
      stt: 5,
      ten: 'Số hợp đồng / đơn hàng ký mới',
      dvt: 'Hợp đồng',
      laTien: false,
      target: duLieu.camKetTuanToi.hopDongMoi.target,
      min: duLieu.camKetTuanToi.hopDongMoi.min,
      max: duLieu.camKetTuanToi.hopDongMoi.max
    }
  ];

  dsCamKet.forEach((item) => {
    const row = ws.addRow([
      '',
      item.stt,
      item.ten,
      item.dvt,
      item.laTien ? formatTienTe(item.target) : item.target,
      item.laTien ? formatTienTe(item.min) : item.min,
      item.laTien ? formatTienTe(item.max) : item.max,
      ''
    ]);
    row.height = 24;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = borderThin;
      if (c === 2 || c === 4) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      else if (c === 5 || c === 6 || c === 7) cell.alignment = { vertical: 'middle', horizontal: 'right' };
      else cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  });

  // Dòng trống cách quãng
  ws.addRow([]);

  // =========================================================================
  // KHỐI IV: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (Lấy từ lịch có sẵn)
  // =========================================================================
  const rSec4 = ws.addRow([]);
  styleSectionHeader(rSec4, 'IV. KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (LẤY TỪ LỊCH TÁC NGHIỆP CÓ SẴN)');

  const rHead4 = ws.addRow(['', 'STT', 'Lịch tuần / Ngày', '', '', 'Nội dung công việc chi tiết', '', '']);
  styleTableHeader(rHead4);
  ws.mergeCells(`F${rHead4.number}:H${rHead4.number}`);

  const dsLich = duLieu.lichLamViecTuanToi || [];
  dsLich.forEach((l, idx) => {
    const row = ws.addRow([
      '',
      idx + 1,
      l.tenThuNgay,
      '',
      '',
      l.noiDungChiTiet || 'Theo kế hoạch tác nghiệp phát sinh phòng kinh doanh',
      '',
      ''
    ]);
    const rIdx = row.number;
    ws.mergeCells(`C${rIdx}:E${rIdx}`);
    ws.mergeCells(`F${rIdx}:H${rIdx}`);
    row.height = 28;

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
