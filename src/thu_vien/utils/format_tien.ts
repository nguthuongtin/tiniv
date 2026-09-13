export const formatTien = (
  gia_tri: unknown,
  don_vi: string = '₫',
  phan_cach_hang_nghin: string = '.'
): string => {
  let so: number;

  if (typeof gia_tri === 'number') {
    so = gia_tri;
  } else if (typeof gia_tri === 'string') {
    const parse = Number(gia_tri.replace(/[^0-9-]/g, ''));
    so = Number.isFinite(parse) ? parse : 0;
  } else {
    so = 0;
  }

  if (!Number.isFinite(so)) {
    so = 0;
  }

  const phan_nguyen = Math.trunc(Math.abs(so)).toString();
  const phan_nguyen_cach = phan_nguyen.replace(/\B(?=(\d{3})+(?!\d))/g, phan_cach_hang_nghin);
  const dau = so < 0 ? '-' : '';
  const ket_qua = `${dau}${phan_nguyen_cach}`;

  if (!don_vi) {
    return ket_qua;
  }

  return `${ket_qua} ${don_vi}`.trim();
};

export const dinhDangTienNganGon = (val: number | null | undefined): string => {
  if (!val || val === 0) return '0 đ';
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (absVal >= 1_000_000_000) {
    return `${sign}${(absVal / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }
  if (absVal >= 1_000_000) {
    return `${sign}${(absVal / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
  }
  if (absVal >= 1_000) {
    return `${sign}${(absVal / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`;
  }
  return `${sign}${absVal.toLocaleString('vi-VN')} đ`;
};

export const DINH_DANG_TIEN_NGAN_GON = dinhDangTienNganGon;

export default formatTien;
