'use client';

import KhoaTruyCap from '../../thanh_phan/xac_thuc/khoa_truy_cap';

export default function BoCucNhomHeThong({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <KhoaTruyCap chuyenHuongKhiChuaDangNhap={true}>
      {children}
    </KhoaTruyCap>
  );
}
