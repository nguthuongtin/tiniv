/**
 * QUY CHUẨN ĐẶT TÊN KHÁCH HÀNG VÀ DỰ ÁN (TỰ ĐỘNG VIẾT HOA TOÀN BỘ)
 */

export const MAU_DAT_TEN_KHACH_HANG = [
  { nhan: 'UBND Xã/Phường', mau: "UBND XÃ ĐẮK R'MOAN - TP. GIA NGHĨA" },
  { nhan: 'UBND Huyện/TX', mau: 'UBND HUYỆN ĐẮK R\'LẤP - TỈNH ĐẮK NÔNG' },
  { nhan: 'Công an Huyện/Xã', mau: 'CÔNG AN HUYỆN CƯ JÚT - TỈNH ĐẮK NÔNG' },
  { nhan: 'Phòng chuyên môn', mau: 'PHÒNG GD&ĐT HUYỆN KRÔNG NÔ' },
  { nhan: 'Trung tâm Y tế', mau: 'TRUNG TÂM Y TẾ HUYỆN ĐẮK MIL' },
  { nhan: 'Trường học', mau: 'TRƯỜNG THPT CHU VĂN AN - GIA NGHĨA' },
  { nhan: 'Công ty Cổ phần', mau: 'CÔNG TY CP CÔNG NGHỆ SAO MAI - CN ĐẮK NÔNG' },
  { nhan: 'Công ty TNHH', mau: 'CÔNG TY TNHH MTV CÀ PHÊ AN THÁI' },
  { nhan: 'Hộ kinh doanh', mau: 'HKD NGUYỄN VĂN NAM - TIỆM VÀNG KIM PHÁT' }
];

export const GIAI_PHAP_DU_AN_PHO_BIEN = [
  'HỆ THỐNG TRUYỀN THANH THÔNG MINH',
  'CAMERA GIÁM SÁT AN NINH & TRẬT TỰ',
  'HỘI NGHỊ TRUYỀN HÌNH TRỰC TUYẾN',
  'PHẦN MỀM QUẢN LÝ VĂN BẢN & ĐIỀU HÀNH',
  'PHẦN MỀM SỐ HÓA & QUẢN LÝ DỮ LIỆU',
  'CUNG CẤP TRANG THIẾT BỊ CNTT VĂN PHÒNG',
  'HẠ TẦNG MẠNG LAN, WIFI & MÁY CHỦ',
  'MÀN HÌNH TƯƠNG TÁC & PHÒNG HỌC THÔNG MINH'
];

/**
 * Sinh gợi ý tên dự án tự động từ giải pháp, tên khách hàng và năm (viết hoa toàn bộ)
 */
export function sinhTenDuAnGoiY(
  giaiPhap: string,
  tenKhachHang?: string | null,
  nam: number = new Date().getFullYear()
): string {
  const namStr = nam.toString();
  const gpUpper = giaiPhap.trim().toUpperCase();
  if (!tenKhachHang || !tenKhachHang.trim()) {
    return `${gpUpper} - [TÊN KHÁCH HÀNG] - ${namStr}`;
  }
  const khUpper = tenKhachHang.trim().toUpperCase();
  return `${gpUpper} - ${khUpper} - ${namStr}`;
}
