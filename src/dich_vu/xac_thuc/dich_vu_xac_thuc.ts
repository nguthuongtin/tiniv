'use client';

import {
  signInWithEmailAndPassword,
  signOut as firebaseDangXuat,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
  type Unsubscribe
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  firebaseAuth,
  firebaseFirestore,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';
import type {
  NguoiDungDangNhap,
  NhanSu,
  VaiTroNguoiDung
} from '../../thu_vien/types';

// === 1. Nap thong tin nhan_su document theo Firebase Auth UID ===
const napHoSoNguoiDungTuFirestore = async (
  uid: string
): Promise<NguoiDungDangNhap | null> => {
  try {
    const thamChieu = doc(firebaseFirestore, 'nhan_su', uid);
    const snap = await getDoc(thamChieu);
    if (!snap.exists()) return null;
    const duLieu = snap.data() as Partial<NhanSu>;
    return {
      id: uid,
      email: (duLieu.email ?? '').trim(),
      ho_va_ten: duLieu.ho_va_ten ?? null,
      vai_tro: (duLieu.vai_tro as VaiTroNguoiDung) ?? null,
      chi_nhanh_id: duLieu.chi_nhanh_id ?? null,
      phong_ban_id: duLieu.phong_ban_id ?? null,
      phong_ban_phu_trach_them: duLieu.phong_ban_phu_trach_them ?? [],
      quyen_ngoai_le_cap_them: duLieu.quyen_ngoai_le_cap_them ?? [],
      quyen_ngoai_le_chan: duLieu.quyen_ngoai_le_chan ?? [],
      url_anh_dai_dien: duLieu.url_anh_dai_dien ?? null,
      trang_thai: duLieu.trang_thai === true
    };
  } catch (_err) {
    return null;
  }
};

// === 2. Chuc nang Dang nhap ===
export const ketQuaDangNhapCacLoai = {
  THANH_CONG: 'THANH_CONG',
  SAI_THONG_TIN: 'SAI_THONG_TIN',
  TAI_KHOAN_KHOA: 'TAI_KHOAN_KHOA',
  CHUA_CO_HO_SO_NHAN_SU: 'CHUA_CO_HO_SO_NHAN_SU',
  LOI_KHAC: 'LOI_KHAC'
} as const;

export type KetQuaDangNhap =
  (typeof ketQuaDangNhapCacLoai)[keyof typeof ketQuaDangNhapCacLoai];

export interface DangNhapReturn {
  ketQua: KetQuaDangNhap;
  thongBao: string;
  thongTinNguoiDung: NguoiDungDangNhap | null;
}

export const dangNhapBangEmailMatKhau = async (
  email: string,
  matKhau: string
): Promise<DangNhapReturn> => {
  const emailSach = String(email ?? '').trim().toLowerCase();
  if (!emailSach || !matKhau) {
    return {
      ketQua: ketQuaDangNhapCacLoai.SAI_THONG_TIN,
      thongBao: 'Vui lòng nhập đầy đủ email và mật khẩu.',
      thongTinNguoiDung: null
    };
  }

  try {
    // Set persistence: Local (giu dang nhap qua tat ca tab)
    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
    } catch {
      /* ignore */
    }

    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      emailSach,
      matKhau
    );
    const user: User = userCredential.user;

    // Doc Firestore ho so nhan su
    const hoSo = await napHoSoNguoiDungTuFirestore(user.uid);

    if (!hoSo) {
      await firebaseDangXuat(firebaseAuth);
      return {
        ketQua: ketQuaDangNhapCacLoai.CHUA_CO_HO_SO_NHAN_SU,
        thongBao:
          'Tài khoản Auth chưa có hồ sơ nhân viên trên Firestore. Vui lòng liên hệ quản trị viên.',
        thongTinNguoiDung: null
      };
    }

    if (hoSo.trang_thai !== true) {
      await firebaseDangXuat(firebaseAuth);
      return {
        ketQua: ketQuaDangNhapCacLoai.TAI_KHOAN_KHOA,
        thongBao:
          'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được mở khóa.',
        thongTinNguoiDung: null
      };
    }

    // Ghi nhat ky dang nhap
    try {
      await ghiNhatKyHoatDong(user.uid, 'xac_thuc', 'dang_nhap', user.uid, `Đăng nhập thành công từ IP client (${emailSach})`);
    } catch {
      /* ignore nhat ky */
    }

    return {
      ketQua: ketQuaDangNhapCacLoai.THANH_CONG,
      thongBao: 'Đăng nhập thành công. Đang chuyển hướng đến trang chủ…',
      thongTinNguoiDung: hoSo
    };
  } catch (e: any) {
    const maLoi = String(e?.code ?? '').toLowerCase();
    if (
      maLoi.includes('auth/invalid-email') ||
      maLoi.includes('auth/wrong-password') ||
      maLoi.includes('auth/user-not-found') ||
      maLoi.includes('auth/invalid-credential')
    ) {
      return {
        ketQua: ketQuaDangNhapCacLoai.SAI_THONG_TIN,
        thongBao: 'Sai email hoặc mật khẩu. Hãy thử lại.',
        thongTinNguoiDung: null
      };
    }
    if (maLoi.includes('auth/user-disabled')) {
      return {
        ketQua: ketQuaDangNhapCacLoai.TAI_KHOAN_KHOA,
        thongBao:
          'Tài khoản đã bị khóa trên Firebase Auth. Hãy liên hệ quản trị viên.',
        thongTinNguoiDung: null
      };
    }
    if (maLoi.includes('auth/too-many-requests')) {
      return {
        ketQua: ketQuaDangNhapCacLoai.LOI_KHAC,
        thongBao: 'Có quá nhiều lần đăng nhập sai. Hãy thử lại sau ít phút.',
        thongTinNguoiDung: null
      };
    }
    return {
      ketQua: ketQuaDangNhapCacLoai.LOI_KHAC,
      thongBao: `Lỗi đăng nhập: ${String(e?.message ?? e)}`,
      thongTinNguoiDung: null
    };
  }
};

// === 3. Chuc nang Dang xuat ===
export const dangXuatHeThong = async (): Promise<boolean> => {
  try {
    const uidHienTai = firebaseAuth.currentUser?.uid;
    if (uidHienTai) {
      try {
        await ghiNhatKyHoatDong(
          uidHienTai,
          'xac_thuc',
          'dang_xuat',
          uidHienTai,
          'Nguoi dung dang xuat khoi he thong'
        );
      } catch {
        /* ignore */
      }
    }
    await firebaseDangXuat(firebaseAuth);
    return true;
  } catch (_e) {
    return false;
  }
};

// === 4. Lang nghe su thay doi trang thai Auth (khi F5 hoac session moi) ===
export const langNgheTrangThaiDangNhap = (
  callback: (info: NguoiDungDangNhap | null, dangTaiHoSo: boolean) => void
): Unsubscribe => {
  let daCoUserAuth = false;

  const huyLangNghe = onAuthStateChanged(firebaseAuth, async (userFirebase) => {
    // KHÔNG BAO GIỜ để Promise uncaught làm mất callback end → kẹt loading mãi
    try {
      if (!userFirebase) {
        daCoUserAuth = false;
        callback(null, false);
        return;
      }
      daCoUserAuth = true;
      callback(null, true); // bat dau tai ho so tu firestore

      let hoSo: NguoiDungDangNhap | null = null;
      try {
        hoSo = await napHoSoNguoiDungTuFirestore(userFirebase.uid);
      } catch (_errNap) {
        // Loi PERMISSION_DENIED, mang yeu, CORS, timeout Firebase — coi nhu chua co ho so
        hoSo = null;
      }

      if (hoSo && hoSo.trang_thai !== true) {
        try {
          await firebaseDangXuat(firebaseAuth);
        } catch {
          /* ignore */
        }
        callback(null, false);
        return;
      }

      callback(hoSo, false);
    } catch (_errBaoLop) {
      // Bao loi ngoai le goc: break vo han loading bang cach goi callback end
      callback(null, false);
    }
  });

  return huyLangNghe;
};

// === 5. Lay thong tin nguoi dung hien tai (sync, null neu chua dang nhap chuan) ===
export const layNguoiDungFirebaseTam = (): {
  uid: string;
  email: string | null;
} | null => {
  const u = firebaseAuth.currentUser;
  if (!u) return null;
  return { uid: u.uid, email: u.email };
};
