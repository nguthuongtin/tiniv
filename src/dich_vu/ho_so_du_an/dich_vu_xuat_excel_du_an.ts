import ExcelJS from 'exceljs';
import type { HoSoDuAn, TienDoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh } from '../../thu_vien/types/nhan_su';
import { danhSachChiNhanh } from '../co_cau_to_chuc/dich_vu_chi_nhanh';

const formatNgayVN = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const formatThangNam = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}${parts[1]}`;
  }
  return '';
};

const taiBlob = (buffer: ExcelJS.Buffer, filename: string): void => {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Tính chiều cao dòng động để không bị cắt chữ trong Excel
const tinhChieuCaoDong = (values: (string | number | null | undefined)[], widths: number[]): number => {
  let maxLines = 1;
  values.forEach((v, i) => {
    if (v === null || v === undefined) return;
    const str = String(v);
    const lines = str.split('\n');
    let totalLinesInCell = 0;
    const w = widths[i] || 25;
    for (const line of lines) {
      if (!line) {
        totalLinesInCell += 1;
      } else {
        const wrapped = Math.ceil(line.length / Math.max(1, w - 2));
        totalLinesInCell += Math.max(1, wrapped);
      }
    }
    if (totalLinesInCell > maxLines) {
      maxLines = totalLinesInCell;
    }
  });
  return Math.max(28, Math.min(maxLines * 18 + 8, 220));
};

export interface TuyChonXuatExcelDuAn {
  danhSachDuAn: HoSoDuAn[];
  dsKhachHang: KhachHang[];
  dsNhanSu: NhanSu[];
  dsTienDo: TienDoDuAn[];
  dsChiNhanh?: ChiNhanh[];
  tenGiaiDoan?: Record<string, { nhan: string }>;
  tenTep?: string;
}

// Bảng ánh xạ trạng thái sang nhãn chuẩn biểu mẫu
const MAP_TINH_TRANG_CHUAN: Record<string, string> = {
  moi_tao: 'Tiếp cận',
  tiep_can: 'Tiếp cận',
  khao_sat: 'Khảo sát',
  len_giai_phap: 'Báo giá',
  bao_gia: 'Báo giá',
  dam_phan: 'Hợp đồng',
  ky_hop_dong: 'Hợp đồng',
  tam_ung: 'Tạm ứng',
  trien_khai: 'Triển khai',
  nghiem_thu: 'Nghiệm thu',
  hoan_thanh: 'Hoàn thành',
  tam_dung: 'Tạm dừng',
  huy: 'Đã hủy'
};

export const xuatExcelBaoCaoDuAn = async ({
  danhSachDuAn,
  dsKhachHang,
  dsNhanSu,
  dsTienDo,
  dsChiNhanh,
  tenGiaiDoan = {},
  tenTep
}: TuyChonXuatExcelDuAn): Promise<void> => {
  let chiNhanhList = dsChiNhanh;
  if (!chiNhanhList || chiNhanhList.length === 0) {
    try {
      const res = await danhSachChiNhanh();
      chiNhanhList = res.mang;
    } catch {
      chiNhanhList = [];
    }
  }

  const mapKH = new Map(dsKhachHang.map((k) => [k.id, k]));
  const mapNS = new Map(dsNhanSu.map((n) => [n.id, n]));
  const mapCN = new Map((chiNhanhList || []).map((c) => [c.id, c.ten_chi_nhanh]));

  // Nhóm tiến độ theo dự án
  const mapTienDo = new Map<string, TienDoDuAn[]>();
  for (const td of dsTienDo) {
    if (td.trang_thai_du_lieu === 'da_xoa') continue;
    const arr = mapTienDo.get(td.du_an_id) ?? [];
    arr.push(td);
    mapTienDo.set(td.du_an_id, arr);
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('BÁO CÁO TUẦN - THÁNG', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
  });

  // Cố định 2 dòng đầu (Row 1 hướng dẫn, Row 2 tiêu đề) đúng như file mẫu
  sheet.views = [
    {
      state: 'frozen',
      xSplit: 0,
      ySplit: 2,
      topLeftCell: 'A3',
      activeCell: 'A3'
    }
  ];

  // Độ rộng 15 cột chuẩn 100% khớp file mẫu gốc
  const colWidths = [
    6,     // 1. STT
    20,    // 2. Đơn vị
    30,    // 3. Tên dự án
    28,    // 4. Tên khách hàng
    19,    // 5. Loại dự án
    20,    // 6. Kênh bán hàng
    19,    // 7. Sản phẩm
    18,    // 8. Sales phụ trách
    20,    // 9. Tình trạng dự án
    16,    // 10. Ngày bắt đầu dự kiến
    14,    // 11. Tháng/Năm
    20,    // 12. Doanh thu dự tính (VNĐ)
    20,    // 13. Doanh thu thực tế (VNĐ)
    18,    // 14. Tiền về thực tế (VNĐ)
    37     // 15. Ghi chú lịch trình gốc
  ];

  colWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    bottom: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    left: { style: 'thin', color: { argb: 'FFD4D4D8' } },
    right: { style: 'thin', color: { argb: 'FFD4D4D8' } }
  };

  const borderHeader: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF7F1D1D' } },
    bottom: { style: 'thin', color: { argb: 'FF7F1D1D' } },
    left: { style: 'thin', color: { argb: 'FF7F1D1D' } },
    right: { style: 'thin', color: { argb: 'FF7F1D1D' } }
  };

  // ==========================================
  // DÒNG 1: Dòng hướng dẫn (Màu xanh dương nhạt #A3DBFF)
  // ==========================================
  const rowGuidance = sheet.getRow(1);
  rowGuidance.height = 36;

  const guidanceTexts: Record<number, string> = {
    5: 'Chọn trong list có sẵn, không tự ý thêm nếu có khác, note ở cột ghi chú (Cột  P)',
    6: 'Chọn trong list có sẵn, không tự ý thêm nếu có khác, note ở cột ghi chú (Cột  P)',
    7: 'Chọn trong list có sẵn, không tự ý thêm nếu có khác, note ở cột ghi chú (Cột  P)',
    8: 'ghi rõ ai phụ trách chính, chỉ 1 người',
    9: 'Theo mô tả bên dưới, không nhập nội dung khác',
    10: 'Ngày bắt đầu tiếp cận khai thác KH',
    12: 'Doanh thu dự kiến báo giá, ký kết cho KH',
    13: 'Doanh thu trên Hợp đồng',
    14: 'Số tiền thực tế thu về theo hợp đồng (0-100%) của tuần - tháng tiếp theo',
    15: 'Ghi chú thêm tình trạng khác của KH'
  };

  for (let c = 1; c <= 15; c++) {
    const cell = rowGuidance.getCell(c);
    cell.value = guidanceTexts[c] || null;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA3DBFF' }
    };
    cell.font = { name: 'Times New Roman', size: 10, italic: true, color: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderThin;
  }

  // ==========================================
  // DÒNG 2: Tiêu đề 15 cột chuẩn (Màu đỏ mận #A20000, Chữ trắng đậm)
  // ==========================================
  const headerTexts = [
    'STT',
    'Đơn vị',
    'Tên dự án',
    'Tên khách hàng',
    'Loại dự án',
    'Kênh bán hàng',
    'Sản phẩm',
    'Sales phụ trách',
    'Tình trạng dự án',
    'Ngày bắt đầu dự kiến',
    'Tháng/Năm',
    'Doanh thu dự tính (VNĐ)',
    'Doanh thu thực tế (VNĐ)',
    'Tiền về thực tế (VNĐ)',
    'Ghi chú lịch trình gốc'
  ];

  const rowHeader = sheet.getRow(2);
  rowHeader.height = 36;
  headerTexts.forEach((text, i) => {
    const cell = rowHeader.getCell(i + 1);
    cell.value = text;
    cell.font = { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFA20000' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderHeader;
  });

  // Tính tổng Doanh thu dự tính, Doanh thu thực tế, Tiền về thực tế
  const tongDtDuTinh = danhSachDuAn.reduce(
    (sum, d) => sum + (Number(d.gia_tri_du_kien || d.gia_tri_hop_dong) || 0),
    0
  );
  const tongDtThucTe = danhSachDuAn.reduce(
    (sum, d) => sum + (Number(d.gia_tri_hop_dong) || 0),
    0
  );
  const tongTienVe = danhSachDuAn.reduce(
    (sum, d) => sum + (Number(d.tien_ve_thuc_te) || 0),
    0
  );

  // ==========================================
  // DÒNG 3: Dòng Tổng kết (Màu vàng #FFC000)
  // ==========================================
  const rowSummary = sheet.getRow(3);
  rowSummary.height = 27;
  for (let c = 1; c <= 15; c++) {
    const cell = rowSummary.getCell(c);
    cell.border = borderThin;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    cell.font = { name: 'Times New Roman', size: 10, bold: true, color: { argb: 'FF000000' } };
  }

  rowSummary.getCell(1).value = 0;
  rowSummary.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  rowSummary.getCell(2).value = 'TỔNG CỘNG';
  rowSummary.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
  rowSummary.getCell(15).value = 'Tổng hợp';
  rowSummary.getCell(15).alignment = { vertical: 'middle', horizontal: 'center' };

  const startRow = 4;
  const endRow = danhSachDuAn.length > 0 ? startRow + danhSachDuAn.length - 1 : startRow;

  if (danhSachDuAn.length > 0) {
    rowSummary.getCell(12).value = { formula: `SUM(L${startRow}:L${endRow})`, result: tongDtDuTinh };
    rowSummary.getCell(13).value = { formula: `SUM(M${startRow}:M${endRow})`, result: tongDtThucTe };
    rowSummary.getCell(14).value = { formula: `SUM(N${startRow}:N${endRow})`, result: tongTienVe };
  } else {
    rowSummary.getCell(12).value = 0;
    rowSummary.getCell(13).value = 0;
    rowSummary.getCell(14).value = 0;
  }
  rowSummary.getCell(12).numFmt = '#,##0';
  rowSummary.getCell(13).numFmt = '#,##0';
  rowSummary.getCell(14).numFmt = '#,##0';
  rowSummary.getCell(12).alignment = { vertical: 'middle', horizontal: 'right' };
  rowSummary.getCell(13).alignment = { vertical: 'middle', horizontal: 'right' };
  rowSummary.getCell(14).alignment = { vertical: 'middle', horizontal: 'right' };

  // ==========================================
  // DÒNG 4 TRỞ ĐI: Đổ dữ liệu từng dự án
  // ==========================================
  danhSachDuAn.forEach((hda, idx) => {
    const kh = hda.khach_hang_id ? mapKH.get(hda.khach_hang_id) : null;
    const qlda = hda.nguoi_quan_ly_id ? mapNS.get(hda.nguoi_quan_ly_id) : null;
    const theoDoi = hda.nguoi_phu_trach_id ? mapNS.get(hda.nguoi_phu_trach_id) : null;

    // Đơn vị (Tên chi nhánh của dự án hoặc nhân sự)
    let donViText = '';
    if (hda.chi_nhanh_id && mapCN.has(hda.chi_nhanh_id)) {
      donViText = mapCN.get(hda.chi_nhanh_id) || '';
    } else if (theoDoi?.chi_nhanh_id && mapCN.has(theoDoi.chi_nhanh_id)) {
      donViText = mapCN.get(theoDoi.chi_nhanh_id) || '';
    } else if (qlda?.chi_nhanh_id && mapCN.has(qlda.chi_nhanh_id)) {
      donViText = mapCN.get(qlda.chi_nhanh_id) || '';
    }

    // Loại dự án (Lấy từ Loại khách hàng: Nhà nước, Doanh nghiệp, Tư nhân)
    let loaiDuAnText = 'Doanh nghiệp';
    const rawLoaiKH = kh?.loai_khach_hang?.toLowerCase() || '';
    if (rawLoaiKH === 'to_chuc' || rawLoaiKH.includes('nhà nước') || rawLoaiKH.includes('nha nuoc')) {
      loaiDuAnText = 'Nhà nước';
    } else if (rawLoaiKH === 'ca_nhan' || rawLoaiKH.includes('tư nhân') || rawLoaiKH.includes('tu nhan') || rawLoaiKH.includes('cá nhân')) {
      loaiDuAnText = 'Tư nhân';
    } else if (rawLoaiKH === 'doanh_nghiep' || rawLoaiKH.includes('doanh nghiệp')) {
      loaiDuAnText = 'Doanh nghiệp';
    } else if (kh?.loai_khach_hang) {
      loaiDuAnText = kh.loai_khach_hang;
    }

    // Kênh bán hàng
    const kenhBanHangText = hda.kenh_ban_hang || 'Tự khai thác';

    // Sản phẩm
    const sanPhamText = hda.san_pham_khac_mo_ta || hda.mo_ta || '';

    // Sales phụ trách chính
    const salesText = theoDoi?.ho_va_ten || qlda?.ho_va_ten || '';

    // Tình trạng dự án
    let tinhTrangText = 'Tiếp cận';
    if (hda.giai_doan) {
      if (MAP_TINH_TRANG_CHUAN[hda.giai_doan]) {
        tinhTrangText = MAP_TINH_TRANG_CHUAN[hda.giai_doan];
      } else if (tenGiaiDoan[hda.giai_doan]?.nhan) {
        tinhTrangText = tenGiaiDoan[hda.giai_doan].nhan;
      } else {
        tinhTrangText = String(hda.giai_doan);
      }
    }

    // Ngày bắt đầu dự kiến (ngay_tao_ho_so hoặc ngay_tao)
    const ngayTiepCan = hda.ngay_tao_ho_so?.slice(0, 10) || hda.ngay_tao?.slice(0, 10) || '';
    const ngayBatDauStr = formatNgayVN(ngayTiepCan);

    // Tháng/Năm (YYYYMM, ví dụ 202610)
    const thangNamStr = formatThangNam(ngayTiepCan);

    // Doanh thu dự tính & Doanh thu thực tế & Tiền về thực tế
    const dtDuTinhVal = Number(hda.gia_tri_du_kien || hda.gia_tri_hop_dong || 0);
    const dtThucTeVal = Number(hda.gia_tri_hop_dong || 0);
    const tienVeThucTeVal = Number(hda.tien_ve_thuc_te || 0);

    // Ghi chú lịch trình gốc
    const tdList = (mapTienDo.get(hda.id) ?? []).sort((a, b) =>
      (b.ngay_tao || '').localeCompare(a.ngay_tao || '')
    );
    const tienDoGanNhat = tdList[0]?.tinh_hinh_hien_tai ? `[Tiến độ]: ${tdList[0].tinh_hinh_hien_tai}` : '';
    const ghiChuText = [hda.ghi_chu, tienDoGanNhat].filter(Boolean).join('\n') || '';

    const rowData = [
      idx + 1,            // 1. STT
      donViText,          // 2. Đơn vị
      hda.ten_du_an,      // 3. Tên dự án
      kh?.ten_khach_hang || '', // 4. Tên khách hàng
      loaiDuAnText,       // 5. Loại dự án
      kenhBanHangText,    // 6. Kênh bán hàng
      sanPhamText,        // 7. Sản phẩm
      salesText,          // 8. Sales phụ trách
      tinhTrangText,      // 9. Tình trạng dự án
      ngayBatDauStr,      // 10. Ngày bắt đầu dự kiến
      thangNamStr,        // 11. Tháng/Năm
      dtDuTinhVal,        // 12. Doanh thu dự tính (VNĐ)
      dtThucTeVal,        // 13. Doanh thu thực tế (VNĐ)
      tienVeThucTeVal,    // 14. Tiền về thực tế (VNĐ)
      ghiChuText          // 15. Ghi chú lịch trình gốc
    ];

    const row = sheet.addRow(rowData);
    row.height = tinhChieuCaoDong(rowData, colWidths);

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Times New Roman', size: 10 };
      cell.border = borderThin;

      // Căn chỉnh vị trí từng cột
      if ([1, 2, 5, 6, 7, 8, 9, 10, 11].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([12, 13, 14].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // In đậm Tên dự án và Tên khách hàng
      if (colNumber === 3 || colNumber === 4) {
        cell.font = { name: 'Times New Roman', size: 10, bold: true };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().slice(0, 10);
  taiBlob(buffer, tenTep || `Bao_Cao_Tuan_Thang_Du_An_${dateStr}.xlsx`);
};

// Giữ lại alias để tương thích ngược nếu có file khác import tên cũ
export const xuatExcelTienDoDuAn = xuatExcelBaoCaoDuAn;
export type TuyChonXuatExcelTienDo = TuyChonXuatExcelDuAn;
