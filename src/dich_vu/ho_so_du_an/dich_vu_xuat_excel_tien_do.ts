import ExcelJS from 'exceljs';
import type { HoSoDuAn, TienDoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';

const formatNgayVN = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
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
  return Math.max(26, Math.min(maxLines * 17 + 8, 220));
};

export interface TuyChonXuatExcelTienDo {
  danhSachDuAn: HoSoDuAn[];
  dsKhachHang: KhachHang[];
  dsNhanSu: NhanSu[];
  dsTienDo: TienDoDuAn[];
  tenGiaiDoan?: Record<string, { nhan: string }>;
  tenTep?: string;
}

export const xuatExcelTienDoDuAn = async ({
  danhSachDuAn,
  dsKhachHang,
  dsNhanSu,
  dsTienDo,
  tenGiaiDoan = {},
  tenTep
}: TuyChonXuatExcelTienDo): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tiến độ dự án', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
  });

  // Độ rộng 17 cột (Đã bỏ cột Nguồn KH và Ngày ký tạm ứng theo yêu cầu)
  const colWidths = [
    6,   // A: STT (1)
    14,  // B: LOẠI KH (2)
    15,  // C: NGÀY TIẾP CẬN DỰ ÁN (3)
    26,  // D: TÊN KHÁCH HÀNG (4)
    32,  // E: TÊN DỰ ÁN (5)
    28,  // F: LOẠI SẢN PHẨM (6)
    18,  // G: DT DỰ KIẾN (7)
    15,  // H: DỰ KIẾN KÝ HĐ (8)
    20,  // I: NGƯỜI QLDA (9)
    20,  // J: NGƯỜI HỖ TRỢ (10)
    20,  // K: THEO DÕI DỰ ÁN (11)
    16,  // L: TRẠNG THÁI (12)
    18,  // M: DOANH THU TIỀN VỀ (13)
    28,  // N: GHI CHÚ (14)
    36,  // O: Cập nhật lần 1 (15)
    36,  // P: Cập nhật lần 2 (16)
    36   // Q: Cập nhật lần 3 (17)
  ];

  colWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
  };

  const borderHeader: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF808080' } },
    bottom: { style: 'thin', color: { argb: 'FF808080' } },
    left: { style: 'thin', color: { argb: 'FF808080' } },
    right: { style: 'thin', color: { argb: 'FF808080' } }
  };

  // 1. Tiêu đề lớn (Dòng 1): TIẾN ĐỘ DỰ ÁN (Merged A1:Q1)
  sheet.mergeCells('A1:Q1');
  const cellA1 = sheet.getCell('A1');
  cellA1.value = 'TIẾN ĐỘ DỰ ÁN';
  cellA1.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFF0000' } };
  cellA1.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 34;

  // 2. Tiêu đề 17 cột (Dòng 2)
  const headerTexts = [
    'STT',
    'LOẠI KH',
    'NGÀY TIẾP CẬN DỰ ÁN',
    'TÊN KHÁCH HÀNG',
    'TÊN DỰ ÁN',
    'LOẠI SẢN PHẨM',
    'DT DỰ KIẾN',
    'DỰ KIẾN KÝ HĐ',
    'NGƯỜI QLDA',
    'NGƯỜI HỖ TRỢ',
    'THEO DÕI DỰ ÁN',
    'TRẠNG THÁI',
    'DOANH THU TIỀN VỀ',
    'GHI CHÚ',
    'Cập nhật lần 1',
    'Cập nhật lần 2',
    'Cập nhật lần 3'
  ];

  const rowHeader = sheet.getRow(2);
  rowHeader.height = 36;
  headerTexts.forEach((text, i) => {
    const cell = rowHeader.getCell(i + 1);
    cell.value = text;
    cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF6B1D1D' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFADBD8' } // Màu hồng đào nhạt chuẩn như mẫu ảnh
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderHeader;
  });

  // Tính tổng Doanh thu dự kiến & Doanh thu tiền về
  const tongDtDuKien = danhSachDuAn.reduce(
    (sum, d) => sum + (Number(d.gia_tri_du_kien || d.gia_tri_hop_dong) || 0),
    0
  );
  const tongDoanhThuTienVe = danhSachDuAn.reduce(
    (sum, d) => sum + (Number(d.gia_tri_hop_dong) || 0),
    0
  );

  // 3. Dòng Tổng kết (Dòng 3 - Ngay dưới Header như ảnh)
  const rowSummary = sheet.getRow(3);
  rowSummary.height = 24;
  for (let c = 1; c <= 17; c++) {
    const cell = rowSummary.getCell(c);
    cell.border = borderThin;
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' }
    };
  }

  // Cột G (DT DỰ KIẾN - Cột số 7): Ô vàng đậm
  const cellSumDT = rowSummary.getCell(7);
  cellSumDT.value = tongDtDuKien;
  cellSumDT.numFmt = '#,##0';
  cellSumDT.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
  cellSumDT.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' } // Màu vàng chanh nổi bật như mẫu ảnh
  };
  cellSumDT.alignment = { vertical: 'middle', horizontal: 'right' };

  // Cột M (DOANH THU TIỀN VỀ - Cột số 13): Chữ đỏ
  const cellSumTV = rowSummary.getCell(13);
  cellSumTV.value = tongDoanhThuTienVe;
  cellSumTV.numFmt = '#,##0';
  cellSumTV.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFF0000' } };
  cellSumTV.alignment = { vertical: 'middle', horizontal: 'right' };

  // 4. Đổ dữ liệu các dự án (Từ Dòng 4 trở đi)
  const mapKH = new Map(dsKhachHang.map((k) => [k.id, k]));
  const mapNS = new Map(dsNhanSu.map((n) => [n.id, n]));

  // Nhóm tiến độ theo dự án
  const mapTienDo = new Map<string, TienDoDuAn[]>();
  for (const td of dsTienDo) {
    if (td.trang_thai_du_lieu === 'da_xoa') continue;
    const arr = mapTienDo.get(td.du_an_id) ?? [];
    arr.push(td);
    mapTienDo.set(td.du_an_id, arr);
  }

  danhSachDuAn.forEach((hda, idx) => {
    const kh = hda.khach_hang_id ? mapKH.get(hda.khach_hang_id) : null;
    const qlda = hda.nguoi_quan_ly_id ? mapNS.get(hda.nguoi_quan_ly_id) : null;
    const theoDoi = hda.nguoi_phu_trach_id ? mapNS.get(hda.nguoi_phu_trach_id) : null;
    const nguoiHoTroStr = (hda.danh_sach_nguoi_ho_tro_ids || [])
      .map((id) => mapNS.get(id)?.ho_va_ten)
      .filter(Boolean)
      .join(', ');

    // Lấy 3 lần cập nhật tiến độ theo thứ tự thời gian
    const tdList = (mapTienDo.get(hda.id) ?? []).sort((a, b) =>
      (a.ngay_tao || '').localeCompare(b.ngay_tao || '')
    );

    const formatUpdate = (td?: TienDoDuAn): string => {
      if (!td) return '';
      const parts: string[] = [];
      if (td.tinh_hinh_hien_tai) parts.push(td.tinh_hinh_hien_tai);
      if (td.hanh_dong_tiep_theo) parts.push(`Hành động: ${td.hanh_dong_tiep_theo}`);
      if (td.ket_qua_thuc_hien) parts.push(`Kết quả: ${td.ket_qua_thuc_hien}`);
      return parts.join('\n');
    };

    const capNhat1 = formatUpdate(tdList[0]);
    const capNhat2 = formatUpdate(tdList[1]);
    const capNhat3 = formatUpdate(tdList[2]);

    let loaiKhText = 'Khác';
    if (kh?.loai_khach_hang === 'doanh_nghiep') loaiKhText = 'Doanh nghiệp';
    else if (kh?.loai_khach_hang === 'ca_nhan') loaiKhText = 'Cá nhân';
    else if (kh?.loai_khach_hang === 'to_chuc') loaiKhText = 'Cơ quan / Tổ chức';

    const tenGD = tenGiaiDoan[hda.giai_doan]?.nhan || String(hda.giai_doan || 'Mới tạo');
    const dtDuKienVal = Number(hda.gia_tri_du_kien || hda.gia_tri_hop_dong || 0);
    const dtTienVeVal = Number(hda.gia_tri_hop_dong || 0);

    // Ngày tiếp cận dự án chính xác (lấy ngay_tao_ho_so hoặc ngay_tao)
    const ngayTiepCan = hda.ngay_tao_ho_so?.slice(0, 10) || hda.ngay_tao?.slice(0, 10) || '';

    const rowData = [
      idx + 1,                                       // 1. STT
      loaiKhText,                                    // 2. LOẠI KH
      formatNgayVN(ngayTiepCan),                     // 3. NGÀY TIẾP CẬN DỰ ÁN
      kh?.ten_khach_hang || '',                      // 4. TÊN KHÁCH HÀNG
      hda.ten_du_an || '',                           // 5. TÊN DỰ ÁN
      hda.san_pham_khac_mo_ta || hda.mo_ta || '',    // 6. LOẠI SẢN PHẨM (nhập text ở trường sản phẩm)
      dtDuKienVal,                                   // 7. DT DỰ KIẾN
      formatNgayVN(hda.thoi_han_hoan_thanh),         // 8. DỰ KIẾN KÝ HĐ
      qlda?.ho_va_ten || '',                         // 9. NGƯỜI QLDA
      nguoiHoTroStr,                                 // 10. NGƯỜI HỖ TRỢ
      theoDoi?.ho_va_ten || '',                      // 11. THEO DÕI DỰ ÁN
      tenGD,                                         // 12. TRẠNG THÁI
      dtTienVeVal,                                   // 13. DOANH THU TIỀN VỀ
      hda.ghi_chu || '',                             // 14. GHI CHÚ
      capNhat1,                                      // 15. Cập nhật lần 1
      capNhat2,                                      // 16. Cập nhật lần 2
      capNhat3                                       // 17. Cập nhật lần 3
    ];

    const row = sheet.addRow(rowData);
    row.height = tinhChieuCaoDong(rowData, colWidths);

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9.5 };
      cell.border = borderThin;

      // Căn lề từng cột phù hợp
      if (colNumber === 1 || colNumber === 2 || colNumber === 3 || colNumber === 8 || colNumber === 12) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 7 || colNumber === 13) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }

      // Làm đậm tên dự án và tên khách hàng
      if (colNumber === 4 || colNumber === 5) {
        cell.font = { name: 'Arial', size: 9.5, bold: true };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().slice(0, 10);
  taiBlob(buffer, tenTep || `Tien_Do_Du_An_${dateStr}.xlsx`);
};
