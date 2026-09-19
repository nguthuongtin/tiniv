'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  onSnapshot
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  updateEmail as authUpdateEmail,
  updatePassword as authUpdatePassword,
  updateProfile as authUpdateProfile,
  type User
} from 'firebase/auth';
import type {
  NhanSu,
  TrangThaiTaiKhoan,
  VaiTroNguoiDung,
  VaiTro
} from '../../thu_vien/types/nhan_su';
import type { ChiNhanh, PhongBan } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong,
  layCauHinhFirebase
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'nhan_su' as const;
const GIOI_HAN_MAC_DINH = 200;
const TEN_COLLECTION_CN = 'chi_nhanh' as const;
const TEN_COLLECTION_PB = 'phong_ban' as const;

const LEGACY_DS_VAI_TRO: { key: string; nhan: string; mau: string; kieu_hien_thi: VaiTro['kieu_hien_thi'] }[] = [
  { key: 'quan_tri_he_thong', nhan: 'Quản trị hệ thống', mau: 'bg-primary/12 text-primary border border-primary/25', kieu_hien_thi: 'primary' },
  { key: 'giam_doc', nhan: 'Giám đốc', mau: 'bg-danger/12 text-danger border border-danger/25', kieu_hien_thi: 'danger' },
  { key: 'truong_phong', nhan: 'Trưởng phòng', mau: 'bg-warning/12 text-warning border border-warning/25', kieu_hien_thi: 'warning' },
  { key: 'nhan_vien_kinh_doanh', nhan: 'Nhân viên Kinh doanh', mau: 'bg-success/12 text-success border border-success/25', kieu_hien_thi: 'success' },
  { key: 'nhan_vien_ky_thuat', nhan: 'Nhân viên Kỹ thuật', mau: 'bg-muted text-muted-foreground border border-border', kieu_hien_thi: 'muted' },
  { key: 'hanh_chinh_van_phong', nhan: 'Hành chính văn phòng', mau: 'bg-secondary/12 text-secondary border border-secondary/25', kieu_hien_thi: 'secondary' }
];

const MAU_THEO_KIEU: Record<VaiTro['kieu_hien_thi'], string> = {
  muted: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary/12 text-primary border border-primary/25',
  success: 'bg-success/12 text-success border border-success/25',
  warning: 'bg-warning/12 text-warning border border-warning/25',
  danger: 'bg-danger/12 text-danger border border-danger/25',
  secondary: 'bg-secondary/12 text-secondary border border-secondary/25'
};

export const chonThongTinVaiTro = (
  vt: string | null | undefined,
  dsVaiTroTuCollection?: VaiTro[] | null
): { nhan: string; mau: string; kieu_hien_thi: VaiTro['kieu_hien_thi'] } => {
  if (!vt) {
    return {
      nhan: 'Chưa phân vai trò',
      mau: MAU_THEO_KIEU.muted,
      kieu_hien_thi: 'muted'
    };
  }
  if (dsVaiTroTuCollection && dsVaiTroTuCollection.length > 0) {
    const khopId = dsVaiTroTuCollection.find((x) => x.id === vt);
    if (khopId) {
      return {
        nhan: khopId.ten_vai_tro,
        mau: MAU_THEO_KIEU[khopId.kieu_hien_thi ?? 'muted'],
        kieu_hien_thi: khopId.kieu_hien_thi ?? 'muted'
      };
    }
    const khopMa = dsVaiTroTuCollection.find((x) => x.ma_vai_tro && x.ma_vai_tro.toLowerCase() === vt.toLowerCase());
    if (khopMa) {
      return {
        nhan: khopMa.ten_vai_tro,
        mau: MAU_THEO_KIEU[khopMa.kieu_hien_thi ?? 'muted'],
        kieu_hien_thi: khopMa.kieu_hien_thi ?? 'muted'
      };
    }
  }
  const legacyKhop = LEGACY_DS_VAI_TRO.find((x) => x.key === vt);
  if (legacyKhop) {
    return { nhan: legacyKhop.nhan, mau: legacyKhop.mau, kieu_hien_thi: legacyKhop.kieu_hien_thi };
  }
  return {
    nhan: vt,
    mau: MAU_THEO_KIEU.muted,
    kieu_hien_thi: 'muted'
  };
};

export interface DieuKienLocNhanSu {
  tuKhoa?: string | null;
  vai_tro?: string | 'tat_ca' | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  trang_thai_tk?: 'tat_ca' | TrangThaiTaiKhoan | null;
  trang_thai_hoat_dong?: 'tat_ca' | 'hoat_dong' | 'khoa' | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  ngay_tao_tu_ngay?: string | null;
  ngay_tao_den_ngay?: string | null;
}

export interface TaoMoiNhanSuDTO {
  ma_nhan_vien?: string | null;
  ho_va_ten: string;
  so_dien_thoai?: string | null;
  email: string;
  mat_khau?: string | null;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  phong_ban_phu_trach_them?: string[] | null;
  chuc_vu?: string | null;
  vai_tro: string;
  quyen_ngoai_le_cap_them?: string[] | null;
  quyen_ngoai_le_chan?: string[] | null;
  url_anh_dai_dien?: string | null;
  trang_thai?: boolean;
}

export interface CapNhatNhanSuDTO {
  ma_nhan_vien?: string;
  ho_va_ten?: string;
  so_dien_thoai?: string | null;
  email?: string;
  chi_nhanh_id?: string | null;
  phong_ban_id?: string | null;
  phong_ban_phu_trach_them?: string[] | null;
  chuc_vu?: string | null;
  vai_tro?: string;
  quyen_ngoai_le_cap_them?: string[] | null;
  quyen_ngoai_le_chan?: string[] | null;
  url_anh_dai_dien?: string | null;
  trang_thai?: boolean;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

type RawBanGhiNS = Omit<NhanSu, 'id'>;

const loaiBoUndefined = <T extends Record<string, any>>(obj: T): T => {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
};

const chuyenDoiDocThanhDoiTuong = (
  id: string,
  raw: DocumentData | RawBanGhiNS | undefined | null
): NhanSu => {
  const r = (raw ?? {}) as Partial<RawBanGhiNS>;
  const today = new Date().toISOString();
  return {
    id,
    ma_nhan_vien: (r.ma_nhan_vien as string) ?? `NV${id.slice(0, 6).toUpperCase()}`,
    ho_va_ten: (r.ho_va_ten as string) ?? '(Chua dat ten)',
    so_dien_thoai: (r.so_dien_thoai as string | null) ?? null,
    email: (r.email as string) ?? '',
    chi_nhanh_id: (r.chi_nhanh_id as string | null) ?? null,
    phong_ban_id: (r.phong_ban_id as string | null) ?? null,
    phong_ban_phu_trach_them: Array.isArray(r.phong_ban_phu_trach_them) ? r.phong_ban_phu_trach_them : [],
    chuc_vu: (r.chuc_vu as string | null) ?? null,
    vai_tro: (r.vai_tro as string) ?? 'nhan_vien_kinh_doanh',
    quyen_ngoai_le_cap_them: Array.isArray(r.quyen_ngoai_le_cap_them) ? r.quyen_ngoai_le_cap_them : [],
    quyen_ngoai_le_chan: Array.isArray(r.quyen_ngoai_le_chan) ? r.quyen_ngoai_le_chan : [],
    url_anh_dai_dien: (r.url_anh_dai_dien as string | null) ?? null,
    trang_thai: typeof r.trang_thai === 'boolean' ? r.trang_thai : true,
    nguoi_tao_id: (r.nguoi_tao_id as string | null) ?? null,
    ngay_tao: (r.ngay_tao as string) ?? today,
    ngay_cap_nhat: (r.ngay_cap_nhat as string) ?? today,
    trang_thai_du_lieu: (r.trang_thai_du_lieu as NhanSu['trang_thai_du_lieu']) ?? 'hoat_dong'
  };
};

const sapXepVaLocThem = (mang: NhanSu[], loc?: DieuKienLocNhanSu): NhanSu[] => {
  const tuKhoaLower = loc?.tuKhoa?.trim().toLowerCase() ?? '';
  return mang.filter((ns) => {
    if (tuKhoaLower) {
      const khop = ns.ho_va_ten.toLowerCase().includes(tuKhoaLower)
        || ns.ma_nhan_vien.toLowerCase().includes(tuKhoaLower)
        || ns.email.toLowerCase().includes(tuKhoaLower)
        || (ns.so_dien_thoai ?? '').toLowerCase().includes(tuKhoaLower)
        || (ns.chuc_vu ?? '').toLowerCase().includes(tuKhoaLower);
      if (!khop) return false;
    }
    if (loc?.vai_tro && loc.vai_tro !== 'tat_ca' && ns.vai_tro !== loc.vai_tro) return false;
    if (loc?.chi_nhanh_id && ns.chi_nhanh_id !== loc.chi_nhanh_id) return false;
    if (loc?.phong_ban_id && ns.phong_ban_id !== loc.phong_ban_id) return false;
    if (loc?.trang_thai_hoat_dong) {
      if (loc.trang_thai_hoat_dong === 'hoat_dong' && !ns.trang_thai) return false;
      if (loc.trang_thai_hoat_dong === 'khoa' && ns.trang_thai) return false;
    }
    if (loc?.ngay_tao_tu_ngay && ns.ngay_tao < loc.ngay_tao_tu_ngay) return false;
    if (loc?.ngay_tao_den_ngay && ns.ngay_tao > loc.ngay_tao_den_ngay + 'T23:59:59.999Z') return false;
    return true;
  });
};

export const danhSachNhanSu = async (
  loc?: DieuKienLocNhanSu
): Promise<{ mang: NhanSu[]; tong_so?: number }> => {
  const mangRangBuoc: QueryConstraint[] = [
    limit(GIOI_HAN_MAC_DINH)
  ];
  if (loc?.vai_tro && loc.vai_tro !== 'tat_ca') {
    mangRangBuoc.unshift(where('vai_tro', '==', loc.vai_tro));
  }
  if (loc?.chi_nhanh_id) {
    mangRangBuoc.unshift(where('chi_nhanh_id', '==', loc.chi_nhanh_id));
  }
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  if (loc?.trang_thai_hoat_dong === 'hoat_dong') {
    mangRangBuoc.unshift(where('trang_thai', '==', true));
  }
  if (loc?.trang_thai_hoat_dong === 'khoa') {
    mangRangBuoc.unshift(where('trang_thai', '==', false));
  }

  try {
    const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc));
    const mangDaLoc = sapXepVaLocThem(
      snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data())),
      loc
    );
    mangDaLoc.sort((a, b) => (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? ''));
    return { mang: mangDaLoc, tong_so: mangDaLoc.length };
  } catch (err) {
    console.warn('[dich_vu_nhan_su] danhSachNhanSu catch:', err);
    return { mang: [], tong_so: 0 };
  }
};

export const layChiTietNhanSu = async (id: string): Promise<NhanSu | null> => {
  const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
  if (!snap.exists()) return null;
  return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
};

export const taoMaNhanVienTuDong = async (): Promise<string> => {
  try {
    const snap = await getDocs(query(
      thamChieuCollection(TEN_COLLECTION),
      orderBy('ma_nhan_vien', 'desc'),
      limit(1)
    ));
    let so = 1;
    if (snap.docs.length > 0) {
      const cuoi = snap.docs[0].data().ma_nhan_vien as string | undefined;
      const chuSo = (cuoi ?? '').replace(/[^0-9]/g, '');
      if (chuSo) so = parseInt(chuSo, 10) + 1;
    }
    return `NV${so.toString().padStart(4, '0')}`;
  } catch {
    return `NV${Date.now().toString().slice(-4)}`;
  }
};

const authInstance = () => {
  try {
    return getAuth();
  } catch {
    return null;
  }
};

export interface TaoMoiNhanSuOptions {
  /**
   * Trade-off Firebase client SDK: createUserWithEmailAndPassword() TỰ ĐỘNG
   * sign-in user con mới → sign-out admin người tạo. Không có cách nào tránh
   * nếu chỉ dùng client SDK (chỉ admin SDK server-side giải quyết triệt để).
   * Solution chấp nhận cho MVP: truyền { email, matKhau } của người tạo vào đây,
   * sau khi tạo NV xong (atomic) sẽ sign-in lại admin với credential này.
   * Nếu không truyền (null): user sẽ bị sign-out ra login page sau khi tạo.
   */
  signInLaiNguoiTao?: {
    email: string;
    matKhau: string;
  } | null;
}

export const taoNhanSuMoi = async (
  dto: TaoMoiNhanSuDTO,
  nguoiThucHien: Pick<NhanSu, 'id' | 'vai_tro'> | null | undefined,
  _options?: TaoMoiNhanSuOptions
): Promise<NhanSu> => {
  if (!dto.ho_va_ten || !dto.ho_va_ten.trim()) throw new Error('Họ và tên không được để trống.');
  if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
    throw new Error('Email không hợp lệ.');
  }
  const idNguoiTao = nguoiThucHien?.id ?? null;
  const emailSach = dto.email.trim().toLowerCase();
  const mkThucTe = dto.mat_khau && dto.mat_khau.trim().length >= 6 ? dto.mat_khau.trim() : 'Ebms@2026';

  let userFirebaseMoi: User | null = null;
  let secondaryApp: any = null;

  try {
    // 🌟 KHỞI TẠO SECONDARY APP TẠM THỜI:
    // Đảm bảo tạo user con mà KHÔNG bao giờ làm sign-out tài khoản Admin chính đang đăng nhập!
    const config = layCauHinhFirebase();
    const appName = `temp-create-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    secondaryApp = initializeApp(config, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, emailSach, mkThucTe);
      userFirebaseMoi = cred.user;
      try {
        await authUpdateProfile(userFirebaseMoi, {
          displayName: dto.ho_va_ten.trim(),
          photoURL: dto.url_anh_dai_dien ?? undefined
        });
      } catch { /* bo qua */ }
    } catch (e) {
      const rawErr = e as { code?: string; message?: string };
      const code = (rawErr.code ?? '').toLowerCase();
      let msg: string | null = null;
      if (code === 'auth/email-already-in-use' || code === 'auth/email-already-exists') {
        msg = 'Email này đã tồn tại tài khoản trên hệ thống. Hãy sử dụng email khác hoặc liên hệ quản trị viên.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Email không hợp lệ theo quy tắc Firebase Auth. Hãy kiểm tra lại định dạng email.';
      } else if (code === 'auth/weak-password') {
        msg = 'Mật khẩu quá yếu theo yêu cầu Firebase (cần tối thiểu 6 ký tự). Hãy chọn mật khẩu mạnh hơn.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Tính năng Email/Password chưa được bật trong Firebase Console Authentication → Sign-in method.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Lỗi kết nối mạng khi gọi dịch vụ Firebase Auth. Hãy kiểm tra đường truyền rồi thử lại.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Firebase Auth đã chặn do quá nhiều yêu cầu thất bại. Hãy thử lại sau vài phút.';
      } else if (code === 'auth/user-disabled') {
        msg = 'Tài khoản Firebase đã bị vô hiệu hóa. Hãy liên hệ quản trị viên.';
      }
      if (msg) {
        throw new Error(msg);
      }
      const msgFallback = (e as Error).message || rawErr.code || 'Lỗi không xác định';
      throw new Error(`Lỗi tạo tài khoản Firebase Auth (${code || 'unknown-code'}): ${msgFallback}`);
    }

    const idDinhDanh = userFirebaseMoi?.uid;
    if (!idDinhDanh) {
      throw new Error('Không thể tạo tài khoản Firebase Auth. Hãy thử lại.');
    }

    const now = new Date().toISOString();
    const maNhanVien = dto.ma_nhan_vien ?? await taoMaNhanVienTuDong();
    const duLieuRaw: RawBanGhiNS = loaiBoUndefined({
      ma_nhan_vien: maNhanVien,
      ho_va_ten: dto.ho_va_ten.trim(),
      so_dien_thoai: dto.so_dien_thoai?.trim() || null,
      email: emailSach,
      chi_nhanh_id: dto.chi_nhanh_id ?? null,
      phong_ban_id: dto.phong_ban_id ?? null,
      phong_ban_phu_trach_them: dto.phong_ban_phu_trach_them ?? [],
      chuc_vu: dto.chuc_vu?.trim() || null,
      vai_tro: dto.vai_tro,
      quyen_ngoai_le_cap_them: dto.quyen_ngoai_le_cap_them ?? [],
      quyen_ngoai_le_chan: dto.quyen_ngoai_le_chan ?? [],
      url_anh_dai_dien: dto.url_anh_dai_dien ?? null,
      trang_thai: dto.trang_thai ?? true,
      nguoi_tao_id: idNguoiTao,
      ngay_tao: now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: 'hoat_dong'
    });

    // Ghi hồ sơ nhân sự vào Firestore với Document ID chính là UID Auth
    try {
      await setDoc(thamChieuBanGhi(TEN_COLLECTION, idDinhDanh), duLieuRaw as any);
    } catch (eFirestore) {
      // Rollback Auth user vừa tạo trên secondary app nếu Firestore lỗi
      if (userFirebaseMoi) {
        try {
          await userFirebaseMoi.delete();
        } catch { /* ignore rollback fail */ }
      }
      throw new Error(`Lỗi ghi Firestore nhân sự: ${(eFirestore as Error).message}`);
    }

    // Ghi nhật ký hoạt động
    try {
      if (idNguoiTao) {
        await ghiNhatKyHoatDong(
          idNguoiTao,
          'nhan_su',
          'tao_moi',
          idDinhDanh,
          `Tạo nhân sự "${duLieuRaw.ho_va_ten}" (${duLieuRaw.ma_nhan_vien}) vai trò "${chonThongTinVaiTro(String(duLieuRaw.vai_tro)).nhan}"`
        );
      }
    } catch (_eNhatKy) {
      /* ignore */
    }

    const moi = chuyenDoiDocThanhDoiTuong(idDinhDanh, duLieuRaw);
    return moi;
  } finally {
    // Dọn dẹp secondary app
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch { /* ignore */ }
    }
  }
};

export const capNhatNhanSu = async (
  id: string,
  dto: CapNhatNhanSuDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<NhanSu> => {
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const hienTai = await layChiTietNhanSu(id);
  if (!hienTai) throw new Error('Khong tim thay nhan su de cap nhat.');

  if (dto.email !== undefined && dto.email !== hienTai.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      throw new Error('Email mới không hợp lệ.');
    }
    await doiEmailNhanSu(id, dto.email, nguoiThucHien as any);
  }
  if (dto.ho_va_ten || dto.url_anh_dai_dien) {
    const auth = authInstance();
    if (auth?.currentUser && auth.currentUser.uid === id) {
      try {
        await authUpdateProfile(auth.currentUser, {
          displayName: dto.ho_va_ten ? dto.ho_va_ten.trim() : auth.currentUser.displayName ?? undefined,
          photoURL: dto.url_anh_dai_dien !== undefined ? dto.url_anh_dai_dien ?? undefined : auth.currentUser.photoURL ?? undefined
        });
      } catch { /* bo qua */ }
    }
  }

  const now = new Date().toISOString();
  const duLieuMoi: RawBanGhiNS = loaiBoUndefined({
    ...hienTai,
    ma_nhan_vien: dto.ma_nhan_vien ?? hienTai.ma_nhan_vien,
    ho_va_ten: dto.ho_va_ten !== undefined ? dto.ho_va_ten.trim() : hienTai.ho_va_ten,
    so_dien_thoai: dto.so_dien_thoai !== undefined
      ? (dto.so_dien_thoai?.trim() || null)
      : hienTai.so_dien_thoai,
    email: dto.email !== undefined ? dto.email.trim().toLowerCase() : hienTai.email,
    chi_nhanh_id: dto.chi_nhanh_id !== undefined ? dto.chi_nhanh_id : hienTai.chi_nhanh_id,
    phong_ban_id: dto.phong_ban_id !== undefined ? dto.phong_ban_id : hienTai.phong_ban_id,
    phong_ban_phu_trach_them: dto.phong_ban_phu_trach_them !== undefined
      ? (dto.phong_ban_phu_trach_them ?? [])
      : (hienTai.phong_ban_phu_trach_them ?? []),
    chuc_vu: dto.chuc_vu !== undefined
      ? (dto.chuc_vu?.trim() || null)
      : hienTai.chuc_vu,
    vai_tro: dto.vai_tro ?? hienTai.vai_tro,
    quyen_ngoai_le_cap_them: dto.quyen_ngoai_le_cap_them !== undefined
      ? (dto.quyen_ngoai_le_cap_them ?? [])
      : (hienTai.quyen_ngoai_le_cap_them ?? []),
    quyen_ngoai_le_chan: dto.quyen_ngoai_le_chan !== undefined
      ? (dto.quyen_ngoai_le_chan ?? [])
      : (hienTai.quyen_ngoai_le_chan ?? []),
    url_anh_dai_dien: dto.url_anh_dai_dien !== undefined ? dto.url_anh_dai_dien : hienTai.url_anh_dai_dien,
    trang_thai: dto.trang_thai !== undefined ? dto.trang_thai : hienTai.trang_thai,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? hienTai.trang_thai_du_lieu
  });
  await setDoc(thamChieuBanGhi(TEN_COLLECTION, id), duLieuMoi as any, { merge: true });
  await ghiNhatKyHoatDong(
    idNguoiThucHien,
    'nhan_su',
    'cap_nhat',
    id,
    `Cap nhat thong tin nhan su "${duLieuMoi.ho_va_ten}"`
  );
  return chuyenDoiDocThanhDoiTuong(id, duLieuMoi);
};

export const khoaHoacMoTaiKhoan = async (
  id: string,
  khoaMoi: boolean,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<NhanSu> => {
  const res = await capNhatNhanSu(id, { trang_thai: !khoaMoi }, nguoiThucHien);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nhan_su',
    khoaMoi ? 'khoa_tai_khoan' : 'mo_khoa_tai_khoan',
    id,
    khoaMoi ? `Khoa tai khoan ${res.ho_va_ten}` : `Mo khoa tai khoan ${res.ho_va_ten}`
  );
  return res;
};

export const guiEmailDatLaiMatKhau = async (
  email: string,
  nguoiThucHien: Pick<NhanSu, 'id' | 'vai_tro'> | null | undefined
): Promise<void> => {
  const emailSach = email.trim().toLowerCase();
  if (!emailSach) throw new Error('Email không hợp lệ.');
  const auth = authInstance();
  if (!auth) throw new Error('Firebase Auth chưa khởi tạo.');
  await sendPasswordResetEmail(auth, emailSach);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nhan_su',
    'gui_email_doi_mat_khau',
    null,
    `Gửi email khôi phục mật khẩu tới ${emailSach}`
  );
};

export const doiEmailNhanSu = async (
  id: string,
  emailMoi: string,
  _nguoiThucHien?: Pick<NhanSu, 'id' | 'vai_tro'> | null | undefined
): Promise<void> => {
  const emailChuan = emailMoi.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailChuan)) {
    throw new Error('Email mới không hợp lệ.');
  }
  const auth = authInstance();
  if (!auth?.currentUser) throw new Error('Chưa đăng nhập, không thể đổi email.');

  const token = await auth.currentUser.getIdToken();
  const res = await fetch('/api/nhan-su/doi-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nhan_su_id: id,
      email_moi: emailChuan
    })
  });

  const kq = await res.json();
  if (!res.ok || !kq.thanh_cong) {
    throw new Error(kq.thong_diep || 'Đổi email thất bại.');
  }
};

export const doiMatKhauNhanSu = async (
  id: string,
  matKhauMoi: string,
  _nguoiThucHien?: Pick<NhanSu, 'id' | 'vai_tro'> | null | undefined
): Promise<void> => {
  if (!matKhauMoi || matKhauMoi.length < 6) throw new Error('Mật khẩu tối thiểu 6 ký tự.');
  const auth = authInstance();
  if (!auth?.currentUser) throw new Error('Chưa đăng nhập, không thể đổi mật khẩu.');

  const token = await auth.currentUser.getIdToken();
  const res = await fetch('/api/nhan-su/doi-mat-khau', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nhan_su_id: id,
      mat_khau_moi: matKhauMoi
    })
  });

  const kq = await res.json();
  if (!res.ok || !kq.thanh_cong) {
    throw new Error(kq.thong_diep || 'Đổi mật khẩu thất bại.');
  }
};

export const xoaMemNhanSu = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<void> => {
  await capNhatNhanSu(id, { trang_thai_du_lieu: 'da_xoa', trang_thai: false }, nguoiThucHien);
  await ghiNhatKyHoatDong(
    nguoiThucHien?.id,
    'nhan_su',
    'xoa_mem',
    id,
    'Xoa mem tai khoan nhan su'
  );
};

export const langNgheThayDoiDanhSachNhanSu = (
  callback: (mang: NhanSu[]) => void,
  loc?: DieuKienLocNhanSu
): (() => void) => {
  const mangRangBuoc: QueryConstraint[] = [
    limit(GIOI_HAN_MAC_DINH)
  ];
  const ttDuLieu = loc?.trang_thai_du_lieu && loc.trang_thai_du_lieu !== 'tat_ca'
    ? loc.trang_thai_du_lieu
    : 'hoat_dong';
  mangRangBuoc.unshift(where('trang_thai_du_lieu', '==', ttDuLieu));
  if (loc?.vai_tro && loc.vai_tro !== 'tat_ca') {
    mangRangBuoc.unshift(where('vai_tro', '==', loc.vai_tro));
  }
  const unsub = onSnapshot(
    query(thamChieuCollection(TEN_COLLECTION), ...mangRangBuoc),
    (snap) => {
      const mang = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
      const daLoc = sapXepVaLocThem(mang, loc);
      daLoc.sort((a, b) => (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? ''));
      callback(daLoc);
    },
    (err) => {
      console.warn('[dich_vu_nhan_su] onSnapshot error:', err);
    }
  );
  return unsub;
};
