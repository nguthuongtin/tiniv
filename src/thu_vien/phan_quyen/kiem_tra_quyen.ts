'use client';

import type { NhanSu, NguoiDungDangNhap, VaiTro } from '../types/nhan_su';
import { DANH_SACH_QUYEN_HAN_HE_THONG } from '../types/nhan_su';

export type NguoiDungXacThuc = NhanSu | NguoiDungDangNhap | null | undefined;

const QUYEN_MAC_DINH_SYSTEM: Record<string, string[]> = {
  quan_tri_he_thong: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen),
  giam_doc: DANH_SACH_QUYEN_HAN_HE_THONG.map((q) => q.ma_quyen).filter((m) => m !== 'he_thong.quan_tri'),
  truong_phong: ['du_an.xem', 'du_an.tao_sua', 'ke_hoach.xem', 'ke_hoach.tao_sua', 'ke_hoach.duyet', 'bao_cao.xem', 'bao_cao.xem_phong_ban', 'bao_cao.tao', 'bao_cao.xuat_file', 'nhan_su.xem'],
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

  if (effectiveRoles && effectiveRoles.length > 0) {
    const vt = effectiveRoles.find((v) => v.id === vaiTroKey || v.ma_vai_tro === vaiTroKey);
    if (vt && Array.isArray(vt.danh_sach_quyen) && vt.danh_sach_quyen.length > 0) {
      quyenGoc = vt.danh_sach_quyen;
    }
  }

  if (quyenGoc.length === 0 && QUYEN_MAC_DINH_SYSTEM[vaiTroKey]) {
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
 * - Admin / Giám đốc / Người có quyền xem toàn công ty: Xem được tất cả.
 * - Trưởng phòng: Xem được dự án thuộc chi nhánh/phòng ban mình phụ trách, HOẶC dự án mình liên quan.
 * - Nhân viên thường: CHỈ xem được khi có liên quan trực tiếp:
 *   + Người phụ trách chính (nguoi_phu_trach_id)
 *   + Người quản lý dự án (nguoi_quan_ly_id)
 *   + Người tạo hồ sơ (nguoi_tao_id)
 *   + Nằm trong danh sách người hỗ trợ (danh_sach_nguoi_ho_tro_ids)
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

  // 1. Quản trị hệ thống hoặc Giám đốc hoặc quyền xem toàn công ty
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    coQuyen(nguoiDung, 'bao_cao.xem_toan_cong_ty', dsVaiTro)
  ) {
    return true;
  }

  // 2. Kiểm tra quan hệ trực tiếp với dự án (áp dụng cho mọi cấp)
  const uid = nguoiDung.id;
  const laLienQuanTrucTiep =
    duAn.nguoi_phu_trach_id === uid ||
    duAn.nguoi_quan_ly_id === uid ||
    duAn.nguoi_tao_id === uid ||
    (Array.isArray(duAn.danh_sach_nguoi_ho_tro_ids) && duAn.danh_sach_nguoi_ho_tro_ids.includes(uid));

  if (laLienQuanTrucTiep) return true;

  // 3. Trưởng phòng: xem được dự án trong phạm vi phòng ban phụ trách
  if (vaiTroKey === 'truong_phong') {
    const phamVi = layPhamViPhongBan(nguoiDung, dsVaiTro);
    if (phamVi.toanCongTy) return true;
    if (duAn.phong_ban_id && phamVi.danhSachPhongBanIds.includes(duAn.phong_ban_id)) {
      return true;
    }
  }

  // Nhân viên thường không liên quan: không được xem
  return false;
};

/**
 * Kiểm tra xem người dùng hiện tại có được phép xem khách hàng cụ thể hay không:
 * - Admin / Giám đốc / Trưởng phòng: xem theo thẩm quyền.
 * - Nhân viên thường: CHỈ xem được khách hàng do mình tạo, mình phụ trách, HOẶC có dự án liên quan đến khách hàng đó.
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

  // 1. Quản trị hệ thống hoặc Giám đốc
  if (
    vaiTroKey === 'quan_tri_he_thong' ||
    vaiTroKey === 'giam_doc' ||
    coQuyen(nguoiDung, 'bao_cao.xem_toan_cong_ty', dsVaiTro)
  ) {
    return true;
  }

  // 2. Trực tiếp phụ trách hoặc tạo khách hàng
  const uid = nguoiDung.id;
  if (khachHang.nguoi_phu_trach_id === uid || khachHang.nguoi_tao_id === uid) {
    return true;
  }

  // 3. Có dự án liên quan đến khách hàng này
  if (khachHang.id && dsKhachHangIdsCoDuAnLienQuan) {
    if (dsKhachHangIdsCoDuAnLienQuan instanceof Set) {
      if (dsKhachHangIdsCoDuAnLienQuan.has(khachHang.id)) return true;
    } else if (Array.isArray(dsKhachHangIdsCoDuAnLienQuan)) {
      if (dsKhachHangIdsCoDuAnLienQuan.includes(khachHang.id)) return true;
    }
  }

  // 4. Trưởng phòng xem được khách hàng cùng chi nhánh
  if (vaiTroKey === 'truong_phong') {
    if (khachHang.chi_nhanh_id && nguoiDung.chi_nhanh_id && khachHang.chi_nhanh_id === nguoiDung.chi_nhanh_id) {
      return true;
    }
    if (!khachHang.nguoi_phu_trach_id) {
      return true;
    }
  }

  return false;
};
