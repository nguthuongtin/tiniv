/**
 * Rút gọn họ tên nhân viên theo quy chuẩn:
 * - Lấy chữ cái đầu của từ liền trước tên (tên đệm) viết hoa kèm dấu chấm + Tên chính.
 * - Ví dụ: "Dương Tiểu Linh" -> "T. Linh"
 * - "Nguyễn Thị Ngọc Ánh" -> "N. Ánh"
 * - "Trần Văn Nam" -> "V. Nam"
 * - "Trần Nam" -> "T. Nam"
 * - "Linh" -> "Linh"
 */
export function rutGonTenNhanVienQuyChuan(hoVaTen?: string | null): string {
  if (!hoVaTen) return '';
  const parts = hoVaTen.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const ten = parts[parts.length - 1];
  const dem = parts[parts.length - 2];
  return `${dem.charAt(0).toUpperCase()}. ${ten}`;
}
