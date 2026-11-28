'use client';

import type { NhanSu, NguoiDungDangNhap, VaiTro } from '../types/nhan_su';
import { DANH_SACH_QUYEN_HAN_HE_THONG } from '../types/nhan_su';

export type NguoiDungXacThuc = NhanSu | NguoiDungDangNhap | null | undefined;

const QUYEN_MAC_DINH_SYSTEM: Record<string, string[]> = {
  quan_tri_he_thong: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen),
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri'),
  truong_phong_kd: ['tong_quan.theo_doi_kinh_doanh', 'lanh_dao.xem', 'du_an.xem', 'du_an.tao_sua', 'du_an.xoa', 'du_an.khoi_phuc', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  truong_phong_khth: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  truong_phong: ['tong_quan.theo_doi_kinh_doanh', 'lanh_dao.xem', 'du_an.xem', 'du_an.tao_sua', 'du_an.xoa', 'du_an.khoi_phuc', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
  nhan_vien_kinh_doanh: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  nhan_vien_ky_thuat: ['du_an.xem', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'bao_cao.xem', 'bao_cao.tao'],
  hanh_chinh_van_phong: ['nhan_su.xem', 'nhan_su.quan_ly', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.xuat_file']
};

/**
 * Lấy danh sách tất cả quyền hiệu lực của người dùng theo mô hình:
 * Quyền hiệu lực = (Quyền vai trò + Quyền ngoại lệ cấp thêm) - Quyền ngoại lệ bị chặn
 */
export const layQuyenHieuLuc = (
  nguoiDung: NguoiDungXacThuc,
  dsVaiTro?: VaiTro[]
): string[] => {
  if (!nguoiDung) return [];

  const vaiTroKey = String(nguoiDung.vai_tro || '');

  // Quản trị hệ thống cao nhất có toàn quyền
  if (vaiTroKey === 'quan_tri_he_thong') {
    return [...DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen), '*'];
  }

  // 1. Quyền gốc từ vai trò
  let quyenGoc: string[] = [];
  let effectiveRoles = dsVaiTro;
  if ((!effectiveRoles || effectiveRoles.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ebms_danh_sach_vai_tro');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          effectiveRoles = parsed;
        }
      }
    } catch {}
  }

  let daTimThayVaiTro = false;
  if (effectiveRoles && effectiveRoles.length > 0) {
    const vt = effectiveRoles.find((v) => v.id === vaiTroKey || v.ma_vai_tro === vaiTroKey);
    if (vt && Array.isArray(vt.danh_sach_quyen)) {
      quyenGoc = vt.danh_sach_quyen;
      daTimThayVaiTro = true;
    }
  }

  if (!daTimThayVaiTro && QUYEN_MAC_DINH_SYSTEM[vaiTroKey]) {
    quyenGoc = QUYEN_MAC_DINH_SYSTEM[vaiTroKey];
  }

  const setQuyen = new Set<string>(quyenGoc);

  // 2. Gộp quyền ngoại lệ được cấp thêm (+)
  if (Array.isArray(nguoiDung.quyen_ngoai_le_cap_them)) {
    nguoiDung.quyen_ngoai_le_cap_them.forEach((q) => setQuyen.add(q));
  }

  // 3. Loại bỏ quyền ngoại lệ bị chặn (-)
  if (Array.isArray(nguoiDung.quyen_ngoai_le_chan)) {
    nguoiDung.quyen_ngoai_le_chan.forEach((q) => setQuyen.delete(q));
  }

  return Array.from(setQuyen);
};

/**
 * Kiểm tra xem người dùng có quyền cụ thể hay không
 */
export const coQuyen = (
  nguoiDung: NguoiDungXacThuc,
  maQuyen: string,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung) return false;
  if (nguoiDung.vai_tro === 'quan_tri_he_thong') return true;

  const dsQuyen = layQuyenHieuLuc(nguoiDung, dsVaiTro);
  return dsQuyen.includes('*') || dsQuyen.includes(maQuyen);
};

/**
 * Lấy phạm vi phòng ban mà người dùng có quyền xem/quản lý:
 * - toanCongTy = true: Giám đốc hoặc tài khoản được cấp quyền toàn công ty
 * - danhSachPhongBanIds: Danh sách ID phòng ban trực thuộc + các phòng ban kiêm nhiệm phụ trách thêm
 */
export const layPhamViPhongBan = (
  nguoiDung: NguoiDungXacThuc,
  dsVaiTro?: VaiTro[]
): { toanCongTy: boolean; danhSachPhongBanIds: string[] } => {
  if (!nguoiDung) {
    return { toanCongTy: false, danhSachPhongBanIds: [] };
  }

  const vaiTroKey = String(nguoiDung.vai_tro || '');

  // Admin hoặc Giám đốc hoặc người có quyền xem toàn công ty
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    coQuyen(nguoiDung, 'bao_cao.xem_toan_cong_ty', dsVaiTro)
  ) {
    return { toanCongTy: true, danhSachPhongBanIds: [] };
  }

  const setIds = new Set<string>();
  if (nguoiDung.phong_ban_id) {
    setIds.add(nguoiDung.phong_ban_id);
  }

  if (Array.isArray(nguoiDung.phong_ban_phu_trach_them)) {
    nguoiDung.phong_ban_phu_trach_them.forEach((id) => {
      if (id && typeof id === 'string') setIds.add(id);
    });
  }

  return {
    toanCongTy: false,
    danhSachPhongBanIds: Array.from(setIds)
  };
};

/**
 * Kiểm tra xem người dùng hiện tại có được phép xem báo cáo của một nhân viên cụ thể hay không
 */
export const duocXemBaoCaoCuaNhanVien = (
  nguoiDung: NguoiDungXacThuc,
  nhanVienBaoCao: { id: string; phong_ban_id?: string | null } | null | undefined,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung) return false;
  if (!nhanVienBaoCao) return false;

  // Luôn luôn xem được báo cáo của chính mình
  if (nguoiDung.id === nhanVienBaoCao.id) return true;

  // Quyền toàn công ty
  const phamVi = layPhamViPhongBan(nguoiDung, dsVaiTro);
  if (phamVi.toanCongTy) return true;

  // Quyền phòng ban
  const coQuyenPhongBan = coQuyen(nguoiDung, 'bao_cao.xem_phong_ban', dsVaiTro);
  if (coQuyenPhongBan && nhanVienBaoCao.phong_ban_id) {
    return phamVi.danhSachPhongBanIds.includes(nhanVienBaoCao.phong_ban_id);
  }

  return false;
};

/**
 * Kiểm tra xem người dùng hiện tại có được phép xem hồ sơ dự án cụ thể hay không:
 * - Admin / Giám đốc / Trưởng phòng: Xem được toàn bộ dự án trong hệ thống.
 * - Nhân viên kinh doanh / nhân viên thường: CHỈ xem được dự án của chính mình:
 *   + Người phụ trách chính (nguoi_phu_trach_id)
 *   + Người quản lý dự án (nguoi_quan_ly_id)
 *   + Người tạo hồ sơ (nguoi_tao_id) khi dự án chưa có người phụ trách
 *   * Lưu ý: Không phân quyền theo danh_sach_nguoi_ho_tro_ids để đảm bảo cách ly dữ liệu
 *     tuyệt đối giữa các nhân viên kinh doanh.
 */
export const duocXemHoSoDuAn = (
  nguoiDung: NguoiDungXacThuc,
  duAn: {
    id?: string;
    chi_nhanh_id?: string | null;
    phong_ban_id?: string | null;
    nguoi_phu_trach_id?: string | null;
    nguoi_quan_ly_id?: string | null;
    nguoi_tao_id?: string | null;
    danh_sach_nguoi_ho_tro_ids?: string[] | null;
  } | null | undefined,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung || !duAn) return false;

  const vaiTroKey = String(nguoiDung.vai_tro || '');

  // 1. Quản trị hệ thống, Ban Giám đốc, Trưởng phòng: Toàn quyền xem
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    vaiTroKey === 'truong_phong' ||
    vaiTroKey.startsWith('truong_phong_') ||
    coQuyen(nguoiDung, 'du_an.xem_toan_bo', dsVaiTro)
  ) {
    return true;
  }

  // 2. Nhân viên thông thường: CHỈ xem được các dự án mà mình trực tiếp phụ trách/sở hữu
  const uid = nguoiDung.id;
  if (duAn.nguoi_phu_trach_id) {
    return duAn.nguoi_phu_trach_id === uid || duAn.nguoi_quan_ly_id === uid;
  }
  return duAn.nguoi_tao_id === uid || duAn.nguoi_quan_ly_id === uid;
};

/**
 * Kiểm tra xem người dùng hiện tại có được phép xem khách hàng cụ thể hay không:
 * - Admin / Giám đốc / Trưởng phòng: xem theo thẩm quyền điều hành.
 * - Nhân viên kinh doanh / thường: CHỈ xem khách hàng do mình trực tiếp phụ trách,
 *   hoặc do mình tạo (nếu chưa gán phụ trách), HOẶC khách hàng có dự án mà mình trực tiếp phụ trách.
 */
export const duocXemKhachHang = (
  nguoiDung: NguoiDungXacThuc,
  khachHang: {
    id?: string;
    chi_nhanh_id?: string | null;
    nguoi_phu_trach_id?: string | null;
    nguoi_tao_id?: string | null;
  } | null | undefined,
  dsVaiTro?: VaiTro[],
  dsKhachHangIdsCoDuAnLienQuan?: Set<string> | string[]
): boolean => {
  if (!nguoiDung || !khachHang) return false;

  const vaiTroKey = String(nguoiDung.vai_tro || '');

  // 1. Quản trị hệ thống, Ban Giám đốc, Trưởng phòng Kinh doanh: Quản lý khách hàng
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    vaiTroKey === 'truong_phong_kd' ||
    (vaiTroKey === 'truong_phong' && !coQuyen(nguoiDung, 'khach_hang.xem_chi_du_an')) ||
    coQuyen(nguoiDung, 'khach_hang.xem_toan_bo', dsVaiTro)
  ) {
    return true;
  }

  // 2. Trưởng phòng KHTH (truong_phong_khth):
  // Chỉ xem khách hàng khi có dự án KHTH tham gia phối hợp kỹ thuật
  if (vaiTroKey === 'truong_phong_khth') {
    if (dsKhachHangIdsCoDuAnLienQuan && khachHang.id) {
      if (dsKhachHangIdsCoDuAnLienQuan instanceof Set) {
        return dsKhachHangIdsCoDuAnLienQuan.has(khachHang.id);
      }
      return Array.isArray(dsKhachHangIdsCoDuAnLienQuan) && dsKhachHangIdsCoDuAnLienQuan.includes(khachHang.id);
    }
    return false;
  }

  const uid = nguoiDung.id;

  // 2. Nhân viên kinh doanh / nhân viên thường:
  // TUYỆT ĐỐI CÁCH LY: Khách hàng của nhân viên nào thì nhân viên đó thấy!
  // - Nếu có người phụ trách: CHỈ người phụ trách (nguoi_phu_trach_id) thấy.
  // - Nếu chưa phân bổ người phụ trách: Người tạo (nguoi_tao_id) thấy.
  if (khachHang.nguoi_phu_trach_id) {
    if (khachHang.nguoi_phu_trach_id === uid) return true;
  } else if (khachHang.nguoi_tao_id === uid) {
    return true;
  }

  if (dsKhachHangIdsCoDuAnLienQuan && khachHang.id) {
    if (dsKhachHangIdsCoDuAnLienQuan instanceof Set) {
      return dsKhachHangIdsCoDuAnLienQuan.has(khachHang.id);
    }
    return Array.isArray(dsKhachHangIdsCoDuAnLienQuan) && dsKhachHangIdsCoDuAnLienQuan.includes(khachHang.id);
  }
  return false;
};

/**
 * Kiểm tra xem người dùng có phải là Quản trị hệ thống, Ban Giám đốc hoặc Trưởng phòng hay không
 * Thường dùng để phân quyền chỉ định/chuyển giao phụ trách nhân sự khác.
 */
export const laQuanLyCapCaoHoacTruongPhong = (
  nguoiDung: NguoiDungXacThuc,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung) return false;
  const vaiTroKey = String(nguoiDung.vai_tro || '').toLowerCase();
  const chucVuLower = String(nguoiDung.chuc_vu || '').toLowerCase();

  // 1. Kiểm tra trực tiếp key vai trò chuẩn
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    vaiTroKey === 'truong_phong' ||
    vaiTroKey.startsWith('truong_phong_')
  ) {
    return true;
  }

  // 2. Kiểm tra theo chức vụ nhân sự (Trưởng phòng, Phó phòng, Giám đốc, Quản lý, v.v.)
  if (
    chucVuLower.includes('trưởng phòng') ||
    chucVuLower.includes('phó phòng') ||
    chucVuLower.includes('giám đốc') ||
    chucVuLower.includes('quản lý') ||
    chucVuLower.includes('leader') ||
    chucVuLower.includes('manager')
  ) {
    return true;
  }

  // 3. Phân giải vai trò từ cache danh mục vai trò nếu vaiTroKey là ID
  let effectiveRoles = dsVaiTro;
  if ((!effectiveRoles || effectiveRoles.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ebms_danh_sach_vai_tro');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) effectiveRoles = parsed;
      }
    } catch {}
  }
  if (effectiveRoles && effectiveRoles.length > 0) {
    const vt = effectiveRoles.find((v) => v.id === vaiTroKey || v.ma_vai_tro === vaiTroKey);
    const maVT = (vt?.ma_vai_tro || '').toLowerCase();
    if (
      maVT === 'quan_tri_he_thong' ||
      maVT === 'giam_doc' ||
      maVT === 'truong_phong' ||
      maVT.startsWith('truong_phong_')
    ) {
      return true;
    }
  }

  // 4. Kiểm tra theo quyền hạn hệ thống
  if (
    coQuyen(nguoiDung, 'lanh_dao.xem', dsVaiTro) ||
    coQuyen(nguoiDung, 'ke_hoach.duyet', dsVaiTro) ||
    coQuyen(nguoiDung, 'tong_quan.theo_doi_kinh_doanh', dsVaiTro) ||
    coQuyen(nguoiDung, 'he_thong.quan_tri', dsVaiTro) ||
    coQuyen(nguoiDung, 'khach_hang.xem_toan_bo', dsVaiTro) ||
    coQuyen(nguoiDung, 'du_an.xem_toan_bo', dsVaiTro)
  ) {
    return true;
  }

  return false;
};


/**
 * Kiểm tra xem người dùng hiện tại có phải là Trưởng phòng trực tiếp của một nhân sự hay không
 * (theo cơ chế Sơ đồ tổ chức phòng ban)
 */
export const laTruongPhongCuaNhanSu = (
  nguoiDung: NguoiDungXacThuc,
  nhanSuMucTieu: { id?: string; phong_ban_id?: string | null } | null | undefined,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung || !nhanSuMucTieu) return false;
  const vaiTroKey = String(nguoiDung.vai_tro || '');
  if (vaiTroKey === 'quan_tri_he_thong' || vaiTroKey === 'giam_doc') return true;

  const phamVi = layPhamViPhongBan(nguoiDung, dsVaiTro);
  if (phamVi.toanCongTy) return true;

  if (nhanSuMucTieu.phong_ban_id && phamVi.danhSachPhongBanIds.includes(nhanSuMucTieu.phong_ban_id)) {
    return vaiTroKey === 'truong_phong' || vaiTroKey.startsWith('truong_phong_');
  }
  return false;
};

/**
 * Kiểm tra xem người dùng hiện tại có được phép xóa một lịch công tác/làm việc hay không:
 * - Ban Giám đốc / Quản trị hệ thống: Xóa được tất cả lịch.
 * - Nhân viên (người tạo / người phụ trách lịch): Được xóa lịch của mình khi chưa phê duyệt ('cho_duyet' hoặc 'can_dieu_chinh').
 * - Trưởng phòng trở lên: CHỈ ĐƯỢC XÓA lịch của nhân sự thuộc phòng ban mình điều hành (hoặc lịch của chính mình).
 */
export const duocXoaLichCongTac = (
  nguoiDung: NguoiDungXacThuc,
  lich: {
    nguoi_phu_trach_id?: string | null;
    nguoi_tao_id?: string | null;
    chi_nhanh_id?: string | null;
    phong_ban_id?: string | null;
    trang_thai?: string | null;
  } | null | undefined,
  mapNhanSu?: Map<string, NhanSu>,
  dsVaiTro?: VaiTro[]
): boolean => {
  if (!nguoiDung || !lich) return false;

  const vaiTroKey = String(nguoiDung.vai_tro || '').toLowerCase();
  const chucVuLower = String(nguoiDung.chuc_vu || '').toLowerCase();

  // 1. Ban Giám đốc, Ban Tổng Giám đốc hoặc Quản trị hệ thống -> Toàn quyền xóa lịch
  const laLanhDaoCapCao =
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    chucVuLower.includes('giám đốc') ||
    chucVuLower.includes('tổng giám đốc') ||
    coQuyen(nguoiDung, 'he_thong.quan_tri', dsVaiTro);

  if (laLanhDaoCapCao) return true;

  // 2. Nhân viên (người tạo hoặc người phụ trách) được xóa lịch của mình nếu chưa phê duyệt
  const laChuaPheDuyet =
    !lich.trang_thai ||
    lich.trang_thai === 'cho_duyet' ||
    lich.trang_thai === 'can_dieu_chinh';
  const laNguoiCuaLich =
    (lich.nguoi_tao_id && lich.nguoi_tao_id === nguoiDung.id) ||
    (lich.nguoi_phu_trach_id && lich.nguoi_phu_trach_id === nguoiDung.id);

  if (laChuaPheDuyet && laNguoiCuaLich) return true;

  // 3. Kiểm tra có phải là Trưởng phòng trở lên không
  const laTruongPhong =
    vaiTroKey === 'truong_phong' ||
    vaiTroKey.startsWith('truong_phong_') ||
    chucVuLower.includes('trưởng phòng') ||
    chucVuLower.includes('phó phòng') ||
    coQuyen(nguoiDung, 'lanh_dao.xem', dsVaiTro) ||
    coQuyen(nguoiDung, 'ke_hoach.duyet', dsVaiTro);

  // Nhân viên thông thường -> Không có quyền xóa
  if (!laTruongPhong) return false;

  // 3. Với Trưởng phòng: CHỈ xóa được lịch của nhân viên thuộc phòng mình
  const phamVi = layPhamViPhongBan(nguoiDung, dsVaiTro);
  if (phamVi.toanCongTy) return true;

  const targetUid = lich.nguoi_phu_trach_id || lich.nguoi_tao_id;
  // Nếu là lịch của chính Trưởng phòng
  if (targetUid && targetUid === nguoiDung.id) return true;

  // Xác định phòng ban của nhân viên chủ trì lịch
  const nsMucTieu = targetUid ? mapNhanSu?.get(targetUid) : undefined;
  const phongBanNV = nsMucTieu?.phong_ban_id || (lich as any)?.phong_ban_id;

  const phongBanTP = nguoiDung.phong_ban_id;
  if (phongBanTP && phongBanNV && phongBanTP === phongBanNV) return true;
  if (phongBanNV && phamVi.danhSachPhongBanIds.includes(phongBanNV)) return true;

  return false;
};
