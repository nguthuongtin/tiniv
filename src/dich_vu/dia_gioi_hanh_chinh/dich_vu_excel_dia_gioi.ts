import ExcelJS from 'exceljs';
import { phanLoaiXaPhuong } from './dich_vu_dia_gioi_hanh_chinh';

export interface HangDiaGioiExcel {
  tinh_thanh: string;
  xa_phuong: string;
  loai: 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac';
}

/**
 * Đọc file Excel (.xlsx, .xls) hoặc CSV để trích xuất danh sách Xã/Phường và Tỉnh/Thành phố
 */
export const docFileExcelDiaGioi = async (file: File): Promise<HangDiaGioiExcel[]> => {
  const tenFile = file.name.toLowerCase();

  if (tenFile.endsWith('.csv')) {
    const text = await file.text();
    return parseCsvDiaGioi(text);
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('File Excel không có trang tính (sheet) nào.');
  }

  // Tự động dò tìm vị trí cột "Tên" và cột "Tỉnh/Thành" trong 10 dòng đầu
  let colTenIdx = -1;
  let colTinhIdx = -1;
  let startRow = 1;

  for (let r = 1; r <= Math.min(worksheet.rowCount, 10); r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= Math.max(row.cellCount, 10); c++) {
      const cellVal = layGiaTriCellText(row.getCell(c)).toLowerCase();
      if (!cellVal) continue;

      if (
        (cellVal.includes('tên') ||
          cellVal.includes('xã') ||
          cellVal.includes('phường') ||
          cellVal.includes('đơn vị') ||
          cellVal.includes('địa bàn')) &&
        !cellVal.includes('tỉnh') &&
        !cellVal.includes('thành phố') &&
        colTenIdx === -1
      ) {
        colTenIdx = c;
      }

      if (
        (cellVal.includes('tỉnh') ||
          cellVal.includes('thành phố') ||
          cellVal.includes('tỉnh/thành') ||
          cellVal.includes('tỉnh / thành')) &&
        colTinhIdx === -1
      ) {
        colTinhIdx = c;
      }
    }

    if (colTenIdx !== -1 && colTinhIdx !== -1) {
      startRow = r + 1;
      break;
    }
  }

  // Nếu không tìm thấy qua từ khóa tiêu đề, mặc định Cột 1 là Tên, Cột 2 là Tỉnh/Thành phố
  if (colTenIdx === -1 || colTinhIdx === -1) {
    colTenIdx = 1;
    colTinhIdx = 2;
    startRow = 2; // Giả sử dòng 1 là tiêu đề
  }

  const ketQua: HangDiaGioiExcel[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < startRow) return;

    const ten = layGiaTriCellText(row.getCell(colTenIdx)).trim();
    const tinh = layGiaTriCellText(row.getCell(colTinhIdx)).trim();

    if (ten && tinh) {
      ketQua.push({
        xa_phuong: ten,
        tinh_thanh: tinh,
        loai: phanLoaiXaPhuong(ten)
      });
    }
  });

  return ketQua;
};

/**
 * Trích xuất an toàn giá trị text từ ExcelJS Cell (hỗ trợ richText, formula result, string, number...)
 */
const layGiaTriCellText = (cell: ExcelJS.Cell): string => {
  const v = cell.value;
  if (v === null || v === undefined) return '';

  if (typeof v === 'object') {
    if ('text' in v && typeof (v as any).text === 'string') return (v as any).text;
    if ('result' in v && (v as any).result !== undefined) return String((v as any).result);
    if ('richText' in v && Array.isArray((v as any).richText)) {
      return (v as any).richText.map((t: any) => t.text || '').join('');
    }
  }

  return String(v).trim();
};

/**
 * Phân tích nội dung file CSV
 */
const parseCsvDiaGioi = (csvText: string): HangDiaGioiExcel[] => {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Tự động nhận diện dấu phân cách: phẩy (,), chấm phẩy (;), hoặc tab (\t)
  const firstLine = lines[0];
  let sep = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) sep = ';';
  if (firstLine.includes('\t')) sep = '\t';

  let startIdx = 0;
  let colTen = 0;
  let colTinh = 1;

  // Dò dòng tiêu đề
  const headerParts = lines[0].split(sep).map((p) => p.replace(/^"|"$/g, '').trim().toLowerCase());
  const foundTen = headerParts.findIndex(
    (h) => (h.includes('tên') || h.includes('xã') || h.includes('phường')) && !h.includes('tỉnh')
  );
  const foundTinh = headerParts.findIndex((h) => h.includes('tỉnh') || h.includes('thành phố'));

  if (foundTen !== -1 && foundTinh !== -1) {
    colTen = foundTen;
    colTinh = foundTinh;
    startIdx = 1;
  } else if (lines.length > 1) {
    startIdx = 1;
  }

  const ketQua: HangDiaGioiExcel[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(sep).map((p) => p.replace(/^"|"$/g, '').trim());
    const ten = parts[colTen] || '';
    const tinh = parts[colTinh] || '';
    if (ten && tinh) {
      ketQua.push({
        xa_phuong: ten,
        tinh_thanh: tinh,
        loai: phanLoaiXaPhuong(ten)
      });
    }
  }

  return ketQua;
};

/**
 * Tạo và tải xuống file Excel mẫu chuẩn
 */
export const xuatFileMauExcelDiaGioi = async (): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('DiaGioiHanhChinh');

  worksheet.columns = [
    { header: 'Tên', key: 'ten', width: 35 },
    { header: 'Tỉnh / Thành Phố', key: 'tinh', width: 30 }
  ];

  // Định dạng hàng tiêu đề
  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' } // Blue 800
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Thêm dữ liệu mẫu
  const mauData = [
    { ten: 'Phường Ba Đình', tinh: 'Thành phố Hà Nội' },
    { ten: 'Phường Cửa Nam', tinh: 'Thành phố Hà Nội' },
    { ten: 'Phường Bến Nghé', tinh: 'Thành phố Hồ Chí Minh' },
    { ten: 'Phường Thới Bình', tinh: 'Thành phố Cần Thơ' },
    { ten: 'Xã Phú Hòa', tinh: 'Tỉnh An Giang' },
    { ten: 'Thị trấn Núi Sập', tinh: 'Tỉnh An Giang' },
    { ten: 'Đặc khu Phú Quốc', tinh: 'Tỉnh Kiên Giang' }
  ];

  mauData.forEach((row) => {
    worksheet.addRow([row.ten, row.tinh]);
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 22;
      row.alignment = { vertical: 'middle' };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Mau_Import_Dia_Gioi_Hanh_Chinh.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
