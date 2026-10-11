import ExcelJS from 'exceljs';
import type { KeHoachTuan, KeHoachThang, ItemKeHoachTuan, ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan, BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { KhachHang } from '../../thu_vien/types/khach_hang';

const formatNgayVN = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
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

// Tính chiều cao dòng động để không bao giờ bị cắt ngắn / che khuất chữ trong Excel
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
  return Math.max(28, maxLines * 18 + 6);
};

// ============================================================================
// 1. XUẤT EXCEL KẾ HOẠCH & TỔNG KẾT TUẦN
// ============================================================================
export const xuatExcelKeHoachTuan = async (
  keHoach: KeHoachTuan | null,
  nhanVien: NhanSu | null,
  tuanStr: string,
  danhSachKhachHang: KhachHang[] = [],
  laTongKet: boolean = false
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(laTongKet ? 'Tổng Kết Tuần' : 'Kế Hoạch Tuần', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  let tenTuan = tuanStr;
  const match = tuanStr.match(/^(\d{4})-W(\d{2})$/);
  if (match) {
    const nam = match[1];
    const tuanNum = match[2];
    tenTuan = `TUẦN ${tuanNum} THÁNG ${new Date().getMonth() + 1}/${nam}`;
  }

  const tongSoCot = laTongKet ? 12 : 10;
  const endColLetter = String.fromCharCode(64 + tongSoCot); // 'J' or 'L'

  // 1. Tiêu đề lớn (Banner Header)
  sheet.mergeCells(`A1:${endColLetter}1`);
  const bannerCell = sheet.getCell('A1');
  bannerCell.value = laTongKet
    ? `BÁO CÁO TỔNG KẾT ${tenTuan.toUpperCase()}`
    : `KẾ HOẠCH ${tenTuan.toUpperCase()}`;
  bannerCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: laTongKet ? 'FF2E7D32' : 'FF418AB3' } // Green for report, Blue for plan
  };
  bannerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 32;

  // 2. Tiêu đề các cột
  const headers = laTongKet
    ? [
        'STT',
        'Xã/ Phường/ Đặc khu',
        'Người liên hệ',
        'Chức vụ',
        'Cơ quan/ Doanh nghiệp',
        'Ngày dự kiến',
        'Dự án\n(Dự kiến)',
        'Kế hoạch/Hành động',
        'Kết quả mong muốn',
        'Kết quả thực tế đạt được',
        'Trạng thái',
        'Người hỗ trợ'
      ]
    : [
        'STT',
        'Xã/ Phường/ Đặc khu',
        'Người liên hệ',
        'Chức vụ',
        'Cơ quan/ Doanh nghiệp',
        'Ngày dự kiến',
        'Dự án\n(Dự kiến)',
        'Kế hoạch/Hành động',
        'Kết quả mong muốn',
        'Người hỗ trợ'
      ];

  sheet.getRow(2).values = headers;
  sheet.getRow(2).height = 28;

  const headerRow = sheet.getRow(2);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Yellow background matching template
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  const colWidths = laTongKet
    ? [6, 20, 22, 18, 30, 14, 25, 38, 32, 42, 16, 20]
    : [6, 20, 22, 18, 30, 14, 25, 40, 36, 22];

  colWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  // 3. Đưa dữ liệu vào bảng
  const danhSach = keHoach?.danh_sach_tac_chien ?? [];

  danhSach.forEach((item, index) => {
    const rowIdx = index + 3;
    const kh = danhSachKhachHang.find((k) => k.id === item.khach_hang_id);
    const xaPhuong = item.xa_phuong || kh?.xa_phuong || '';
    const khachHang = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || kh?.ten_khach_hang || '';

    // Tách biệt Người liên hệ và Chức vụ
    const nlhRaw = item.nguoi_lien_he || '';
    let tenLienHe = nlhRaw;
    let chucVuLienHe = item.chuc_vu || '';
    if (!chucVuLienHe && nlhRaw.includes('_')) {
      const parts = nlhRaw.split('_');
      tenLienHe = parts[0];
      chucVuLienHe = parts.slice(1).join('_');
    }

    // Lấy toàn bộ lịch sử / kết quả thực tế, không rút ngắn hay bỏ sót
    let ketQuaThucTeDayDu = item.ket_qua_thuc_te || '';
    if (item.danh_sach_ket_qua && item.danh_sach_ket_qua.length > 0) {
      const dsSorted = [...item.danh_sach_ket_qua].sort((a, b) =>
        (a.ngay_ghi_nhan || '').localeCompare(b.ngay_ghi_nhan || '')
      );
      ketQuaThucTeDayDu = dsSorted
        .map((k) => {
          let line = k.ngay_ghi_nhan ? `• [${formatNgayVN(k.ngay_ghi_nhan)}] ${k.noi_dung}` : `• ${k.noi_dung}`;
          if (k.link_dinh_kem) {
            line += ` (Link: ${k.ten_tai_lieu ? k.ten_tai_lieu + ' - ' : ''}${k.link_dinh_kem})`;
          }
          if (k.chi_dao?.noi_dung) {
            line += `\n  ↳ [Chỉ đạo của ${k.chi_dao.ten_nguoi_chi_dao || 'Cấp trên'}]: ${k.chi_dao.noi_dung}`;
          }
          return line;
        })
        .join('\n');
    }

    let rowValues: any[] = [];

    if (laTongKet) {
      const daXongText = item.da_hoan_thanh ? 'Đã hoàn thành' : 'Đang thực hiện';
      rowValues = [
        index + 1,
        xaPhuong,
        tenLienHe,
        chucVuLienHe,
        khachHang,
        item.ngay_du_kien ? formatNgayVN(item.ngay_du_kien) : '',
        item.du_an_du_kien || '',
        item.hanh_dong_tuan || item.noi_dung_tuan || '',
        item.ket_qua_mong_muon || item.dau_ra_cam_ket || '',
        ketQuaThucTeDayDu,
        daXongText,
        item.nguoi_ho_tro || item.can_ho_tro || ''
      ];
    } else {
      rowValues = [
        index + 1,
        xaPhuong,
        tenLienHe,
        chucVuLienHe,
        khachHang,
        item.ngay_du_kien ? formatNgayVN(item.ngay_du_kien) : '',
        item.du_an_du_kien || '',
        item.hanh_dong_tuan || item.noi_dung_tuan || '',
        item.ket_qua_mong_muon || item.dau_ra_cam_ket || '',
        item.nguoi_ho_tro || item.can_ho_tro || ''
      ];
    }

    const row = sheet.getRow(rowIdx);
    row.values = rowValues;
    row.height = tinhChieuCaoDong(rowValues, colWidths);

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      // Alignment rules
      if (colNum === 1 || colNum === 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (laTongKet && colNum === 11) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (cell.value === 'Đã hoàn thành') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF2E7D32' } };
        }
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  // Nếu không có dữ liệu, thêm dòng trống tạo khung
  if (danhSach.length === 0) {
    for (let r = 3; r <= 15; r++) {
      const row = sheet.getRow(r);
      row.values = Array(tongSoCot).fill('').map((_, idx) => (idx === 0 ? r - 2 : ''));
      row.height = 24;
      row.eachCell((cell, colNum) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        if (colNum === 1 || colNum === 6) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  }

  // Tải file xuống browser
  const buffer = await workbook.xlsx.writeBuffer();
  const prefix = laTongKet ? 'Tong_Ket_Tuan' : 'Ke_Hoach_Tuan';
  taiBlob(buffer, `${prefix}_${tuanStr}_${nhanVien?.ho_va_ten || 'NhanVien'}.xlsx`);
};

export const xuatExcelTongKetTuan = async (
  keHoach: KeHoachTuan | null,
  nhanVien: NhanSu | null,
  tuanStr: string,
  danhSachKhachHang: KhachHang[] = []
): Promise<void> => {
  return xuatExcelKeHoachTuan(keHoach, nhanVien, tuanStr, danhSachKhachHang, true);
};

// ============================================================================
// 2. XUẤT EXCEL KẾ HOẠCH & TỔNG KẾT THÁNG
// ============================================================================
export const xuatExcelKeHoachThang = async (
  keHoach: KeHoachThang | null,
  nhanVien: NhanSu | null,
  thangStr: string,
  danhSachKhachHang: KhachHang[] = [],
  laTongKet: boolean = false
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(laTongKet ? 'Tổng Kết Tháng' : 'Kế Hoạch Tháng', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  let tenThang = thangStr;
  const match = thangStr.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    tenThang = `THÁNG ${match[2]}/${match[1]}`;
  }

  const tongSoCot = laTongKet ? 10 : 8;
  const endColLetter = String.fromCharCode(64 + tongSoCot); // 'H' or 'J'

  // 1. Tiêu đề banner
  sheet.mergeCells(`A1:${endColLetter}1`);
  const bannerCell = sheet.getCell('A1');
  bannerCell.value = laTongKet
    ? `BÁO CÁO TỔNG KẾT ${tenThang.toUpperCase()}`
    : `KẾ HOẠCH ${tenThang.toUpperCase()}`;
  bannerCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: laTongKet ? 'FF2E7D32' : 'FF418AB3' }
  };
  bannerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 32;

  // 2. Tiêu đề các cột (Kế hoạch tháng KHÔNG CÓ cột Người liên hệ theo yêu cầu)
  const headers = laTongKet
    ? [
        'STT',
        'Xã/ Phường/ Đặc khu',
        'Cơ quan/ Doanh nghiệp',
        'Dự án\n(Dự kiến)',
        'Mục tiêu\n(Kế hoạch)',
        'Chỉ tiêu / Doanh số\n(Kế hoạch)',
        'Kết quả thực tế\n(Đạt được)',
        'Tỷ lệ đạt\n(%)',
        'Người hỗ trợ',
        'Ghi chú / Giải trình'
      ]
    : [
        'STT',
        'Xã/ Phường/ Đặc khu',
        'Cơ quan/ Doanh nghiệp',
        'Dự án\n(Dự kiến)',
        'Mục tiêu\n(Kết quả mong muốn)',
        'Chỉ tiêu / Doanh số\n(Dự kiến)',
        'Người hỗ trợ',
        'Ghi chú'
      ];

  sheet.getRow(2).values = headers;
  sheet.getRow(2).height = 28;

  const headerRow = sheet.getRow(2);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  const colWidths = laTongKet
    ? [6, 20, 32, 26, 40, 24, 24, 14, 20, 36]
    : [6, 20, 32, 26, 42, 24, 20, 36];

  colWidths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  // 3. Dữ liệu
  const danhSach = keHoach?.danh_sach_dia_ban ?? [];

  danhSach.forEach((item, index) => {
    const rowIdx = index + 3;
    const kh = danhSachKhachHang.find((k) => k.id === item.khach_hang_id);
    const xaPhuong = item.xa_phuong || kh?.xa_phuong || '';
    const khachHang = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || kh?.ten_khach_hang || '';

    const laTaiChinh = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.doanh_so_du_kien || item.du_kien_thu_thang_nay || 0) > 0);
    const doanhSoNum = item.doanh_so_du_kien ?? item.du_kien_thu_thang_nay ?? item.gia_tri_hd ?? null;
    let chiTieuHienThi: number | string = '';
    if (laTaiChinh && doanhSoNum) {
      chiTieuHienThi = doanhSoNum;
    } else if (item.chi_tieu !== undefined && item.chi_tieu !== null) {
      chiTieuHienThi = `${item.chi_tieu} ${item.don_vi_tinh || ''}`.trim();
    } else if (item.don_vi_tinh) {
      chiTieuHienThi = item.don_vi_tinh;
    }

    let rowValues: any[] = [];

    if (laTongKet) {
      // Tính toán kết quả thực tế & tỷ lệ
      const chiTieuNum = isFinite(Number(chiTieuHienThi)) ? Number(chiTieuHienThi) : (item.chi_tieu || 0);
      const thucTeThu = item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0;
      let ketQuaThucTeHienThi: number | string = '';

      if (laTaiChinh) {
        ketQuaThucTeHienThi = thucTeThu;
      } else if (item.ket_qua_thuc_te !== undefined && item.ket_qua_thuc_te !== null) {
        ketQuaThucTeHienThi = `${item.ket_qua_thuc_te} ${item.don_vi_tinh || ''}`.trim();
      }

      let tyLeDat = '—';
      if (chiTieuNum > 0) {
        tyLeDat = `${Math.round((thucTeThu / chiTieuNum) * 100)}%`;
      }

      const ghiChuTongKet = [
        item.ghi_chu ? `[Kế hoạch]: ${item.ghi_chu}` : '',
        item.ghi_chu_ket_qua ? `[Kết quả]: ${item.ghi_chu_ket_qua}` : ''
      ].filter(Boolean).join('\n') || (item.ghi_chu_ket_qua || item.ghi_chu || '');

      rowValues = [
        index + 1,
        xaPhuong,
        khachHang,
        item.du_an_du_kien || item.ten_khach_hang_du_an || '',
        item.muc_tieu_thang || item.ten_muc_tieu || '',
        chiTieuHienThi,
        ketQuaThucTeHienThi,
        tyLeDat,
        item.nguoi_ho_tro || '',
        ghiChuTongKet
      ];
    } else {
      rowValues = [
        index + 1,
        xaPhuong,
        khachHang,
        item.du_an_du_kien || item.ten_khach_hang_du_an || '',
        item.muc_tieu_thang || item.ten_muc_tieu || '',
        chiTieuHienThi,
        item.nguoi_ho_tro || '',
        item.ghi_chu || ''
      ];
    }

    const row = sheet.getRow(rowIdx);
    row.values = rowValues;
    row.height = tinhChieuCaoDong(rowValues, colWidths);

    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      if (colNum === 1) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNum === 6) {
        // Cột Chỉ tiêu / Doanh số
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
      } else if (laTongKet && colNum === 7) {
        // Cột Kết quả thực tế
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0';
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1565C0' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
      } else if (laTongKet && colNum === 8) {
        // Cột Tỷ lệ đạt (%)
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.font = { name: 'Arial', size: 10, bold: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  if (danhSach.length === 0) {
    for (let r = 3; r <= 15; r++) {
      const row = sheet.getRow(r);
      row.values = Array(tongSoCot).fill('').map((_, idx) => (idx === 0 ? r - 2 : ''));
      row.height = 24;
      row.eachCell((cell, colNum) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        if (colNum === 1) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const prefix = laTongKet ? 'Tong_Ket_Thang' : 'Ke_Hoach_Thang';
  taiBlob(buffer, `${prefix}_${thangStr}_${nhanVien?.ho_va_ten || 'NhanVien'}.xlsx`);
};

export const xuatExcelTongKetThang = async (
  keHoach: KeHoachThang | null,
  nhanVien: NhanSu | null,
  thangStr: string,
  danhSachKhachHang: KhachHang[] = []
): Promise<void> => {
  return xuatExcelKeHoachThang(keHoach, nhanVien, thangStr, danhSachKhachHang, true);
};

// ============================================================================
// 3. XUẤT EXCEL ĐIỀU HÀNH KẾ HOẠCH TOÀN ĐỘI (TUẦN)
// ============================================================================
export const xuatExcelDieuHanhTeamTuan = async (
  tuanStr: string,
  danhSachNhanSu: NhanSu[],
  danhSachKeHoach: KeHoachTuan[],
  danhSachBaoCao: BaoCaoKeHoachTuan[] = [],
  danhSachDuAn: HoSoDuAn[] = [],
  danhSachKhachHang: KhachHang[] = []
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Điều Hành Tuần', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  const mapNhanSu = new Map(danhSachNhanSu.map((ns) => [ns.id, ns]));
  const mapDuAn = new Map(danhSachDuAn.map((da) => [da.id, da]));
  const mapKhachHang = new Map(danhSachKhachHang.map((kh) => [kh.id, kh]));
  const mapBaoCao = new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc]));

  // Banner
  sheet.mergeCells('A1:J1');
  const banner = sheet.getCell('A1');
  banner.value = `BÁO CÁO ĐIỀU HÀNH KẾ HOẠCH TOÀN ĐỘI — TUẦN ${tuanStr.toUpperCase()}`;
  banner.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  banner.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF107555' }
  };
  banner.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 34;

  // Section 1: Tổng hợp thành viên
  let curRow = 3;
  sheet.mergeCells(`A${curRow}:H${curRow}`);
  const sec1 = sheet.getCell(`A${curRow}`);
  sec1.value = 'I. BẢNG TỔNG HỢP TIẾN ĐỘ THÀNH VIÊN';
  sec1.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF107555' } };
  sheet.getRow(curRow).height = 24;
  curRow++;

  const memberHeaders = ['STT', 'Họ và tên', 'Mã NV', 'Chức vụ', 'Tổng việc', 'Đã hoàn thành', 'Tỷ lệ (%)', 'Báo cáo tuần'];
  sheet.getRow(curRow).values = memberHeaders;
  sheet.getRow(curRow).height = 26;
  sheet.getRow(curRow).eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  curRow++;

  danhSachNhanSu.forEach((ns, idx) => {
    const kh = danhSachKeHoach.find((k) => k.nhan_vien_id === ns.id);
    const bc = mapBaoCao.get(ns.id);
    const dsTacChien = kh?.danh_sach_tac_chien || [];
    const tongViec = dsTacChien.length;
    const daXong = dsTacChien.filter((t) => t.da_hoan_thanh || (t as any).trang_thai_vat_chung === 'da_lay').length;
    const tyLe = tongViec > 0 ? Math.round((daXong / tongViec) * 100) : 0;
    const trangThaiBC = bc?.trang_thai === 'da_gui' ? 'Đã nộp' : bc?.trang_thai === 'nhap' ? 'Đang nháp' : 'Chưa nộp';

    const row = sheet.getRow(curRow);
    row.values = [
      idx + 1,
      ns.ho_va_ten,
      ns.ma_nhan_vien,
      ns.chuc_vu || 'NVKD',
      tongViec,
      daXong,
      `${tyLe}%`,
      trangThaiBC
    ];
    row.height = 22;
    row.eachCell((cell, col) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if ([1, 3, 5, 6, 7, 8].includes(col)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
    curRow++;
  });

  // Section 2: Chi tiết kế hoạch toàn đội
  curRow += 2;
  sheet.mergeCells(`A${curRow}:J${curRow}`);
  const sec2 = sheet.getCell(`A${curRow}`);
  sec2.value = 'II. DANH SÁCH CHI TIẾT CÔNG VIỆC KẾ HOẠCH TOÀN ĐỘI';
  sec2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF107555' } };
  sheet.getRow(curRow).height = 24;
  curRow++;

  const taskHeaders = [
    'STT',
    'Phụ trách',
    'Nội dung công việc',
    'Đối tượng / Khách hàng / Dự án',
    'Cơ quan / Doanh nghiệp',
    'Địa bàn',
    'Ngày dự kiến',
    'Đầu ra cam kết',
    'Kết quả thực tế',
    'Trạng thái'
  ];
  sheet.getRow(curRow).values = taskHeaders;
  sheet.getRow(curRow).height = 28;
  sheet.getRow(curRow).eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  curRow++;

  let taskCount = 0;
  danhSachKeHoach.forEach((kh) => {
    const ns = mapNhanSu.get(kh.nhan_vien_id);
    (kh.danh_sach_tac_chien || []).forEach((item) => {
      taskCount++;
      const da = item.du_an_id ? mapDuAn.get(item.du_an_id) : undefined;
      const khItem = item.khach_hang_id ? mapKhachHang.get(item.khach_hang_id) : undefined;
      const tenDoiTuong = da?.ten_du_an || khItem?.ten_khach_hang || item.ten_khach_hang_du_an || '';
      const diaBanStr = [item.xa_phuong, item.tinh_thanh].filter(Boolean).join(', ');
      const daHoanThanh = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';

      const row = sheet.getRow(curRow);
      row.values = [
        taskCount,
        ns?.ho_va_ten || kh.nhan_vien_id,
        item.noi_dung_tuan || item.hanh_dong_tuan || '',
        tenDoiTuong,
        item.co_quan_doanh_nghiep || '',
        diaBanStr,
        formatNgayVN(item.ngay_du_kien || ''),
        item.dau_ra_cam_ket || item.ket_qua_mong_muon || '',
        item.ket_qua_thuc_te || '',
        daHoanThanh ? 'Đã hoàn thành' : 'Đang triển khai'
      ];
      row.height = 24;
      row.eachCell((cell, col) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (col === 1 || col === 7 || col === 10) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      curRow++;
    });
  });

  const widths = [6, 22, 36, 28, 26, 22, 14, 28, 32, 18];
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  taiBlob(buffer, `Dieu_Hanh_Team_Tuan_${tuanStr}.xlsx`);
};

// ============================================================================
// 4. XUẤT EXCEL ĐIỀU HÀNH KẾ HOẠCH TOÀN ĐỘI (THÁNG)
// ============================================================================
export const xuatExcelDieuHanhTeamThang = async (
  thangStr: string,
  danhSachNhanSu: NhanSu[],
  danhSachKeHoach: KeHoachThang[],
  danhSachBaoCao: BaoCaoKeHoachThang[] = [],
  danhSachDuAn: HoSoDuAn[] = [],
  danhSachKhachHang: KhachHang[] = []
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Điều Hành Tháng', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  const mapNhanSu = new Map(danhSachNhanSu.map((ns) => [ns.id, ns]));
  const mapDuAn = new Map(danhSachDuAn.map((da) => [da.id, da]));
  const mapKhachHang = new Map(danhSachKhachHang.map((kh) => [kh.id, kh]));
  const mapBaoCao = new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc]));

  // Banner
  sheet.mergeCells('A1:I1');
  const banner = sheet.getCell('A1');
  banner.value = `BÁO CÁO ĐIỀU HÀNH KẾ HOẠCH TOÀN ĐỘI — THÁNG ${thangStr.toUpperCase()}`;
  banner.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  banner.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF107555' }
  };
  banner.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 34;

  // Section 1: Bảng chỉ tiêu thành viên
  let curRow = 3;
  sheet.mergeCells(`A${curRow}:I${curRow}`);
  const sec1 = sheet.getCell(`A${curRow}`);
  sec1.value = 'I. BẢNG CHỈ TIÊU & TIẾN ĐỘ THÀNH VIÊN';
  sec1.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF107555' } };
  sheet.getRow(curRow).height = 24;
  curRow++;

  const memberHeaders = [
    'STT',
    'Họ và tên',
    'Mã NV',
    'Chức vụ',
    'Số mục tiêu',
    'Chỉ tiêu doanh thu (VNĐ)',
    'Thực tế đã thu (VNĐ)',
    '% Hoàn thành KPI',
    'Báo cáo tháng'
  ];
  sheet.getRow(curRow).values = memberHeaders;
  sheet.getRow(curRow).height = 26;
  sheet.getRow(curRow).eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  curRow++;

  danhSachNhanSu.forEach((ns, idx) => {
    const kh = danhSachKeHoach.find((k) => k.nhan_vien_id === ns.id);
    const bc = mapBaoCao.get(ns.id);
    const dsDiaBan = kh?.danh_sach_dia_ban || [];
    const soMucTieu = dsDiaBan.length;

    let duKien = 0;
    let thucTe = 0;
    dsDiaBan.forEach((item) => {
      const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
      if (isTC) {
        duKien += item.du_kien_thu_thang_nay || item.chi_tieu || 0;
        thucTe += item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0;
      }
    });
    const tyLe = duKien > 0 ? Math.round((thucTe / duKien) * 100) : 0;
    const trangThaiBC = bc?.trang_thai === 'da_gui' ? 'Đã nộp' : bc?.trang_thai === 'nhap' ? 'Đang nháp' : 'Chưa nộp';

    const row = sheet.getRow(curRow);
    row.values = [
      idx + 1,
      ns.ho_va_ten,
      ns.ma_nhan_vien,
      ns.chuc_vu || 'NVKD',
      soMucTieu,
      duKien > 0 ? duKien : '—',
      thucTe > 0 ? thucTe : '—',
      `${tyLe}%`,
      trangThaiBC
    ];
    row.height = 22;
    row.eachCell((cell, col) => {
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      if ([1, 3, 5, 8, 9].includes(col)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (col === 6 || col === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (typeof cell.value === 'number') cell.numFmt = '#,##0';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
    curRow++;
  });

  // Section 2: Chi tiết mục tiêu toàn đội
  curRow += 2;
  sheet.mergeCells(`A${curRow}:H${curRow}`);
  const sec2 = sheet.getCell(`A${curRow}`);
  sec2.value = 'II. CHI TIẾT MỤC TIÊU KẾ HOẠCH TOÀN ĐỘI';
  sec2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF107555' } };
  sheet.getRow(curRow).height = 24;
  curRow++;

  const targetHeaders = [
    'STT',
    'Phụ trách',
    'Mục tiêu / Dự án / Địa bàn',
    'Nhóm mục tiêu',
    'Chỉ tiêu kế hoạch',
    'Thực tế đạt được',
    'Tỷ lệ (%)',
    'Đánh giá / Ghi chú'
  ];
  sheet.getRow(curRow).values = targetHeaders;
  sheet.getRow(curRow).height = 28;
  sheet.getRow(curRow).eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });
  curRow++;

  let targetCount = 0;
  danhSachKeHoach.forEach((kh) => {
    const ns = mapNhanSu.get(kh.nhan_vien_id);
    (kh.danh_sach_dia_ban || []).forEach((item) => {
      targetCount++;
      const da = item.du_an_id ? mapDuAn.get(item.du_an_id) : undefined;
      const khItem = item.khach_hang_id ? mapKhachHang.get(item.khach_hang_id) : undefined;
      const tenMucTieu = da?.ten_du_an || khItem?.ten_khach_hang || item.ten_khach_hang_du_an || (item as any).dia_ban || '';
      const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
      const nhom = isTC ? 'Tài chính (Thu tiền)' : 'Thị trường / Địa bàn';

      let chiTieuStr: string | number = '';
      let thucTeStr: string | number = '';
      let tyLeItem = 0;

      if (isTC) {
        const target = item.du_kien_thu_thang_nay || item.chi_tieu || 0;
        const tt = item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0;
        chiTieuStr = target;
        thucTeStr = tt;
        tyLeItem = target > 0 ? Math.round((tt / target) * 100) : 0;
      } else {
        const target = item.chi_tieu || 0;
        const tt = item.ket_qua_thuc_te || 0;
        chiTieuStr = target > 0 ? `${target} ${item.don_vi_tinh || ''}` : '—';
        thucTeStr = item.ket_qua_thuc_te != null ? `${tt} ${item.don_vi_tinh || ''}` : '—';
        tyLeItem = target > 0 ? Math.round((Number(tt) / target) * 100) : 0;
      }

      const row = sheet.getRow(curRow);
      row.values = [
        targetCount,
        ns?.ho_va_ten || kh.nhan_vien_id,
        tenMucTieu,
        nhom,
        chiTieuStr,
        thucTeStr,
        `${tyLeItem}%`,
        item.ghi_chu_ket_qua || item.ghi_chu || ''
      ];
      row.height = 24;
      row.eachCell((cell, col) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (col === 1 || col === 4 || col === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (col === 5 || col === 6) {
          if (typeof cell.value === 'number') {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0';
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
      });
      curRow++;
    });
  });

  const widths = [6, 22, 34, 22, 22, 22, 14, 30];
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  taiBlob(buffer, `Dieu_Hanh_Team_Thang_${thangStr}.xlsx`);
};
