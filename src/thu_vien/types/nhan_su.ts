// Collection: nhan_su (maps to users trong Tai lieu Chuong 3)
// Cac truong tuong ung 1-1 theo Chuong 3.4 He thong

export type VaiTroNguoiDung =
  | 'quan_tri_he_thong'
  | 'giam_doc'
  | 'truong_phong'
  | 'nhan_vien_kinh_doanh'
  | 'nhan_vien_ky_thuat'
  | 'hanh_chinh_van_phong';

export type KieuBadgeVaiTro = 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

export type TrangThaiTaiKhoan = 'hoat_dong' | 'khoa' | 'dang_ky_moi';

export interface NhanSu {
  id: string;
  ma_nhan_vien: string;
  ho_va_ten: string;
  so_dien_thoai: string | null;
  email: string;
  chi_nhanh_id: string | null;
  phong_ban_id: string | null;
  phong_ban_phu_trach_them?: string[] | null;
  chuc_vu: string | null;
  vai_tro: VaiTroNguoiDung | string;
  quyen_ngoai_le_cap_them?: string[] | null;
  quyen_ngoai_le_chan?: string[] | null;
  url_anh_dai_dien: string | null;
  trang_thai: boolean;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

export interface NguoiDungDangNhap {
  id: string;
  email: string;
  ho_va_ten: string | null;
  vai_tro: VaiTroNguoiDung | string | null;
  chi_nhanh_id: string | null;
  phong_ban_id: string | null;
  phong_ban_phu_trach_them?: string[] | null;
  quyen_ngoai_le_cap_them?: string[] | null;
  quyen_ngoai_le_chan?: string[] | null;
  url_anh_dai_dien: string | null;
  trang_thai: boolean;
}

// Collection: chi_nhanh (branches) - Chuong 3.5
export interface ChiNhanh {
  id: string;
  ten_chi_nhanh: string;
  ma_chi_nhanh: string | null;
  dia_chi: string | null;
  so_dien_thoai: string | null;
  ghi_chu: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

// Collection: phong_ban (departments) - Chuong 3.6
export interface PhongBan {
  id: string;
  chi_nhanh_id: string | null;
  ten_phong_ban: string;
  ma_phong_ban: string | null;
  ghi_chu: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

export interface ItemQuyenHan {
  ma_quyen: string;
  ten_quyen: string;
  nhom: 'du_an' | 'ke_hoach' | 'bao_cao' | 'nhan_su' | 'he_thong';
  mo_ta?: string;
}

export const CAC_VAI_TRO_CHUAN_HE_THONG: Array<{
  key: string;
  tenMacDinh: string;
  phamVi: string;
  moTa: string;
  badge: KieuBadgeVaiTro;
}> = [
  {
    key: 'quan_tri_he_thong',
    tenMacDinh: 'Quản trị hệ thống',
    phamVi: 'Toàn hệ thống',
    moTa: 'Toàn quyền cấu hình hệ thống, quản trị danh mục, tài khoản và phân quyền.',
    badge: 'danger'
  },
  {
    key: 'giam_doc',
    tenMacDinh: 'Ban Giám Đốc',
    phamVi: 'Toàn công ty',
    moTa: 'Xem và giám sát số liệu tất cả chi nhánh, mọi dự án, hợp đồng và báo cáo tài chính.',
    badge: 'primary'
  },
  {
    key: 'truong_phong',
    tenMacDinh: 'Trưởng phòng / Quản lý',
    phamVi: 'Chi nhánh & Phòng ban',
    moTa: 'Quản lý nhân sự, phân công công việc, phê duyệt tiến độ thuộc chi nhánh phụ trách.',
    badge: 'warning'
  },
  {
    key: 'nhan_vien_kinh_doanh',
    tenMacDinh: 'Nhân viên Kinh doanh',
    phamVi: 'Dữ liệu được phân công',
    moTa: 'Quản lý khách hàng, hồ sơ dự án, báo giá và công việc kinh doanh được giao.',
    badge: 'success'
  },
  {
    key: 'nhan_vien_ky_thuat',
    tenMacDinh: 'Nhân viên Kỹ thuật',
    phamVi: 'Dữ liệu được phân công',
    moTa: 'Cập nhật tiến độ khảo sát, giải pháp, triển khai kỹ thuật và nghiệm thu dự án.',
    badge: 'secondary'
  },
  {
    key: 'hanh_chinh_van_phong',
    tenMacDinh: 'Hành chính / Văn phòng',
    phamVi: 'Vận hành nội bộ',
    moTa: 'Theo dõi hợp đồng, tài liệu pháp lý và hỗ trợ thủ tục văn phòng.',
    badge: 'muted'
  }
];

export const DANH_SACH_QUYEN_HAN_HE_THONG: ItemQuyenHan[] = [
  // Dự án
  { ma_quyen: 'du_an.xem', ten_quyen: 'Xem danh sách dự án', nhom: 'du_an' },
  { ma_quyen: 'du_an.tao_sua', ten_quyen: 'Tạo & Sửa hồ sơ dự án', nhom: 'du_an' },
  { ma_quyen: 'du_an.xoa', ten_quyen: 'Xóa hồ sơ dự án', nhom: 'du_an' },
  // Kế hoạch
  { ma_quyen: 'ke_hoach.xem', ten_quyen: 'Xem kế hoạch tác chiến', nhom: 'ke_hoach' },
  { ma_quyen: 'ke_hoach.tao_sua', ten_quyen: 'Lập & Cập nhật kế hoạch', nhom: 'ke_hoach' },
  { ma_quyen: 'ke_hoach.duyet', ten_quyen: 'Duyệt & Quản lý kế hoạch nhân viên', nhom: 'ke_hoach' },
  // Báo cáo ngày
  { ma_quyen: 'bao_cao.xem', ten_quyen: 'Xem báo cáo cá nhân', nhom: 'bao_cao' },
  { ma_quyen: 'bao_cao.xem_phong_ban', ten_quyen: 'Xem báo cáo nhân viên phòng ban (Trưởng phòng)', nhom: 'bao_cao' },
  { ma_quyen: 'bao_cao.xem_toan_cong_ty', ten_quyen: 'Xem báo cáo toàn công ty (Giám đốc)', nhom: 'bao_cao' },
  { ma_quyen: 'bao_cao.tao', ten_quyen: 'Tạo báo cáo công việc ngày', nhom: 'bao_cao' },
  { ma_quyen: 'bao_cao.xuat_file', ten_quyen: 'Tổng hợp & Xuất file báo cáo (Admin)', nhom: 'bao_cao' },
  // Nhân sự
  { ma_quyen: 'nhan_su.xem', ten_quyen: 'Xem danh sách nhân sự', nhom: 'nhan_su' },
  { ma_quyen: 'nhan_su.quan_ly', ten_quyen: 'Thêm, sửa & quản lý nhân sự', nhom: 'nhan_su' },
  // Hệ thống
  { ma_quyen: 'he_thong.quan_tri', ten_quyen: 'Quản trị hệ thống & Ma trận phân quyền', nhom: 'he_thong' }
];

// Collection: vai_tro (danh muc vai tro nguoi dung - thay cho hardcode VaiTroNguoiDung)
export interface VaiTro {
  id: string;
  ma_vai_tro: string | null;
  ten_vai_tro: string;
  mo_ta: string | null;
  kieu_hien_thi: KieuBadgeVaiTro;
  thu_tu_sap_xep: number;
  danh_sach_quyen?: string[]; // Các ma_quyen được gán cho vai trò này
  is_he_thong?: boolean; // Vai trò mặc định hệ thống không thể xóa
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}

// Collection: chuc_vu (danh muc chuc vu - thay cho free-text trong nhan_su.chuc_vu)
export interface ChucVu {
  id: string;
  ma_chuc_vu: string | null;
  ten_chuc_vu: string;
  mo_ta: string | null;
  thu_tu_sap_xep: number;
  nguoi_tao_id: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai_du_lieu: 'hoat_dong' | 'da_xoa';
}
