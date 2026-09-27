/**
 * GỢI Ý ĐẶT TÊN KHÁCH HÀNG VÀ DỰ ÁN (TỰ ĐỘNG VIẾT HOA)
 */

export const MAU_DAT_TEN_KHACH_HANG = [
  { nhan: 'UBND Xã', mau: 'UBND XÃ [TÊN XÃ] TỈNH [TÊN TỈNH]' },
  { nhan: 'UBND Phường', mau: 'UBND PHƯỜNG [TÊN PHƯỜNG] TỈNH [TÊN TỈNH]' },
  { nhan: 'UBND Đặc khu', mau: 'UBND ĐẶC KHU [TÊN ĐẶC KHU] TỈNH [TÊN TỈNH]' },
  { nhan: 'Công ty Cổ phần', mau: 'CÔNG TY CP [TÊN CÔNG TY] TỈNH [TÊN TỈNH]' },
  { nhan: 'Công ty TNHH', mau: 'CÔNG TY TNHH [TÊN CÔNG TY] TỈNH [TÊN TỈNH]' },
  { nhan: 'Sở ban ngành', mau: 'SỞ [TÊN SỞ] TỈNH [TÊN TỈNH]' }
];

export const GIAI_PHAP_DU_AN_PHO_BIEN = [
  'ĐÁNH SỐ NHÀ',
  'SỐ HOÁ DI TÍCH/DI SẢN',
  'SỐ HOÁ NGHĨA TRANG LIỆT SĨ',
  'CSDL ĐẤT ĐAI',
  'BAY QUÉT KHẢO SÁT HIỆN TRẠNG',
  'AUTOTIMELAPSE',
  'THÀNH LẬP BẢN ĐỒ ĐỊA HÌNH'
];

/**
 * Sinh gợi ý tên dự án tự động từ giải pháp và tên khách hàng (viết hoa toàn bộ)
 */
export function sinhTenDuAnGoiY(
  giaiPhap: string,
  tenKhachHang?: string | null
): string {
  const gpUpper = giaiPhap.trim().toUpperCase();
  if (!tenKhachHang || !tenKhachHang.trim()) {
    return gpUpper;
  }
  const khUpper = tenKhachHang.trim().toUpperCase();
  return `${gpUpper} - ${khUpper}`;
}
