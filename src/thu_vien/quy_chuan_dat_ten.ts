/**
 * GỢI Ý ĐẶT TÊN KHÁCH HÀNG VÀ DỰ ÁN (TỰ ĐỘNG VIẾT HOA)
 * Quy chuẩn tên dự án bắt buộc có: [SẢN PHẨM / GIẢI PHÁP] [XÃ/PHƯỜNG] TỈNH [TỈNH]
 * Ví dụ: "ĐÁNH SỐ NHÀ XÃ CHÂU PHONG TỈNH AN GIANG"
 */

export const MAU_DAT_TEN_KHACH_HANG = [
  { nhan: 'UBND Xã', mau: 'UBND XÃ [TÊN XÃ] TỈNH [TÊN TỈNH]' },
  { nhan: 'UBND Phường', mau: 'UBND PHƯỜNG [TÊN PHƯỜNG] TỈNH [TÊN TỈNH]' },
  { nhan: 'UBND Đặc khu', mau: 'UBND ĐẶC KHU [TÊN ĐẶC KHU] TỈNH [TÊN TỈNH]' },
  { nhan: 'Công ty Cổ phần', mau: 'CÔNG TY CP [TÊN CÔNG TY] TỈNH [TÊN TỈNH]' },
  { nhan: 'Công ty TNHH', mau: 'CÔNG TY TNHH [TÊN CÔNG TY] TỈNH [TÊN TỈNH]' },
  { nhan: 'Sở ban ngành', mau: 'SỞ [TÊN SỞ] TỈNH [TÊN TỈNH]' }
];

export const MAU_DAT_TEN_DU_AN = [
  { nhan: 'Xã (Phổ biến)', mau: '[GIẢI PHÁP] XÃ [TÊN XÃ] TỈNH [TÊN TỈNH]' },
  { nhan: 'Phường', mau: '[GIẢI PHÁP] PHƯỜNG [TÊN PHƯỜNG] TỈNH [TÊN TỈNH]' },
  { nhan: 'Thị trấn', mau: '[GIẢI PHÁP] THỊ TRẤN [TÊN THỊ TRẤN] TỈNH [TÊN TỈNH]' },
  { nhan: 'Huyện / TP / Thị xã', mau: '[GIẢI PHÁP] [HUYỆN/TX/TP] TỈNH [TÊN TỈNH]' },
  { nhan: 'Doanh nghiệp / Sở ngành', mau: '[GIẢI PHÁP] [TÊN ĐỐI TÁC] TỈNH [TÊN TỈNH]' }
];

export const GIAI_PHAP_DU_AN_PHO_BIEN = [
  'ĐÁNH SỐ NHÀ',
  'CSDL ĐẤT ĐAI',
  'SỐ HOÁ DI TÍCH/DI SẢN',
  'SỐ HOÁ NGHĨA TRANG LIỆT SĨ',
  'BAY QUÉT KHẢO SÁT HIỆN TRẠNG',
  'AUTOTIMELAPSE',
  'THÀNH LẬP BẢN ĐỒ ĐỊA HÌNH'
];

/**
 * Trích xuất địa bàn hành chính từ tên khách hàng
 * Ví dụ:
 * - "UBND XÃ CHÂU PHONG TỈNH AN GIANG" -> "XÃ CHÂU PHONG TỈNH AN GIANG"
 * - "UBND PHƯỜNG 1 TỈNH TIỀN GIANG" -> "PHƯỜNG 1 TỈNH TIỀN GIANG"
 * - "ỦY BAN NHÂN DÂN XÃ EA H'LEO TỈNH ĐẮK LẮK" -> "XÃ EA H'LEO TỈNH ĐẮK LẮK"
 */
export function trichXuatDiaBanTuKhachHang(tenKhachHang?: string | null): string {
  if (!tenKhachHang || !tenKhachHang.trim()) return '';
  let s = tenKhachHang.trim().toUpperCase();
  // Bỏ tiền tố UBND / Ủy Ban Nhân Dân
  s = s.replace(/^(UBND|UỶ BAN NHÂN DÂN|ỦY BAN NHÂN DÂN|UY BAN NHAN DAN)\s+/i, '').trim();
  // Bỏ tiền tố gạch ngang nếu có
  s = s.replace(/^[-–—]\s*/, '').trim();
  return s;
}

/**
 * Sinh gợi ý tên dự án tự động từ giải pháp và tên khách hàng (viết hoa toàn bộ)
 * Luôn đảm bảo quy chuẩn tên có Xã/Phường và Tỉnh:
 * Ví dụ: "ĐÁNH SỐ NHÀ XÃ CHÂU PHONG TỈNH AN GIANG"
 * Nếu chưa có khách hàng: "ĐÁNH SỐ NHÀ XÃ [TÊN XÃ] TỈNH [TÊN TỈNH]"
 */
export function sinhTenDuAnGoiY(
  giaiPhap: string,
  tenKhachHang?: string | null,
  diaBanPhu?: { xa_phuong?: string | null; tinh_thanh?: string | null } | null
): string {
  const gpUpper = (giaiPhap || 'DỰ ÁN').trim().toUpperCase();
  const diaBanTuKH = trichXuatDiaBanTuKhachHang(tenKhachHang);

  if (diaBanTuKH) {
    let diaBanChuan = diaBanTuKH;
    // Nếu khách hàng chưa có TỈNH/THÀNH PHỐ trong tên mà có tinh_thanh phụ thì thêm vào
    if (
      diaBanPhu?.tinh_thanh &&
      !diaBanChuan.includes('TỈNH') &&
      !diaBanChuan.includes('THÀNH PHỐ') &&
      !diaBanChuan.includes('TP.')
    ) {
      const tinhUpper = diaBanPhu.tinh_thanh.trim().toUpperCase().replace(/^TỈNH\s+/i, '');
      diaBanChuan = `${diaBanChuan} TỈNH ${tinhUpper}`;
    }
    return `${gpUpper} ${diaBanChuan}`.trim();
  }

  // Nếu có địa bàn phụ (xã phường, tỉnh thành)
  if (diaBanPhu?.xa_phuong || diaBanPhu?.tinh_thanh) {
    const parts = [gpUpper];
    if (diaBanPhu.xa_phuong) {
      let xp = diaBanPhu.xa_phuong.trim().toUpperCase();
      if (!xp.startsWith('XÃ') && !xp.startsWith('PHƯỜNG') && !xp.startsWith('THỊ TRẤN')) {
        xp = `XÃ ${xp}`;
      }
      parts.push(xp);
    } else {
      parts.push('XÃ [TÊN XÃ]');
    }

    if (diaBanPhu.tinh_thanh) {
      const tt = diaBanPhu.tinh_thanh.trim().toUpperCase().replace(/^TỈNH\s+/i, '');
      parts.push(`TỈNH ${tt}`);
    } else {
      parts.push('TỈNH [TÊN TỈNH]');
    }
    return parts.join(' ');
  }

  // Mặc định chuẩn hóa theo format người dùng yêu cầu: có XÃ và TỈNH
  return `${gpUpper} XÃ [TÊN XÃ] TỈNH [TÊN TỈNH]`;
}
