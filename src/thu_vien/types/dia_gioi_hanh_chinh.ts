export interface DiaGioiHanhChinh {
  id: string;
  tinh_thanh: string;
  xa_phuong: string;
  loai?: 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac';
  trang_thai: 'hoat_dong' | 'da_xoa';
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}
