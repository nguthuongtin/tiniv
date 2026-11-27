// Danh sách 33 tên xã bị trùng lặp trên 5 tỉnh Miền Tây
export const DANH_SACH_XA_TRUNG_TEN = new Set([
  'an bình', 'bình phú', 'châu thành', 'long bình', 'long hưng',
  'tân hòa', 'tân long', 'tân phú', 'tân thành', 'tân thạnh',
  'thạnh phú', 'thới sơn', 'trường xuân', 'vĩnh bình', 'đông hải',
  'hòa bình', 'hòa thuận', 'hưng mỹ', 'mỹ thuận', 'phong thạnh',
  'phú tân', 'phước long', 'tân an', 'khánh bình', 'long điền',
  'long phú', 'nhơn mỹ', 'phú hữu', 'vĩnh hậu', 'vĩnh trạch',
  'tân lộc', 'vĩnh lợi', 'vĩnh phước'
]);

// Hàm rút ngắn tên nhân viên gọn gàng (1 - 2 từ cuối)
export function rutGonTen(hoVaTen: string): string {
  if (!hoVaTen) return '';
  const parts = hoVaTen.trim().split(/\s+/);
  if (parts.length <= 1) return hoVaTen;
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  if (['em', 'bé', 'anh', 'con'].includes(last.toLowerCase())) {
    return `${secondLast} ${last}`;
  }
  if (!['thị', 'văn', 'đình', 'hữu', 'ngọc', 'thanh'].includes(secondLast.toLowerCase())) {
    return `${secondLast} ${last}`;
  }
  return last;
}
