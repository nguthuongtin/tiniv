'use client';

import { create } from 'zustand';
import type { NguoiDungDangNhap } from '../types';
import {
  dangNhapBangEmailMatKhau,
  dangXuatHeThong,
  langNgheTrangThaiDangNhap,
  type DangNhapReturn,
  ketQuaDangNhapCacLoai
} from '../../dich_vu/xac_thuc/dich_vu_xac_thuc';

interface TrangThaiStoreXacThuc {
  // === Du lieu ===
  nguoiDungHienTai: NguoiDungDangNhap | null;
  daKhoiDong: boolean; // true 1 lan sau khi onAuthStateChanged ket thuc lan 1
  dangXuLy: boolean;   // dang bam nut dang nhap / dang xuat
  dangTaiHoSo: boolean; // dang doc thong tin nhan_su/{uid} tu Firestore
  thongBaoLoiChaoMung: string | null;
  thongBaoDangNhap: DangNhapReturn | null;
  /** Timestamp ms — thoi diem app khoi dong lan dau, dung tinh thoi gian cho de FORCE BREAK */
  thoiDiemBootLanDau: number;

  /**
   * ⚠️ TRANSIENT MEMORY-ONLY (KHÔNG persist ra localStorage)
   * Trade-off client-only Firebase SDK cho chức năng tạo nhân viên mới:
   * createUserWithEmailAndPassword() của client SDK sẽ TỰ ĐỘNG sign-in user con
   * và SIGN-OUT admin hiện tại. Không có cách nào tránh nếu chỉ dùng client SDK
   * (chỉ giải quyết được bằng admin SDK server-side). Cách làm 99% production
   * chấp nhận cho MVP: lưu tạm email + mk người tạo vào store (không ghi file/log)
   * sau khi tạo NV xong → signInWithEmailAndPassword() lại admin với credential này.
   * Sau 1 giờ hoặc signOut sẽ xoá 2 trường này.
   */
  _emailDangNhapTam: string | null;
  _matKhauDangNhapTam: string | null;

  // === Action ===
  thucHienDangNhap: (email: string, matKhau: string) => Promise<DangNhapReturn>;
  thucHienDangXuat: () => Promise<boolean>;
  datNguoiDungHienTai: (info: NguoiDungDangNhap | null) => void;
  boTriLangNgheTrangThaiDangNhap: () => () => void;
  xoaThongBaoDangNhap: () => void;
  thietLapDaKhoiDong: (xong: boolean) => void;
  /** Force thoat khoi loading bat chap trang thai — khi user bam nut khan cap */
  _boKhoaLoadingTamThoi: (lyDo: string) => void;
  /** Lấy credential người dùng hiện tại (dùng signIn lại admin sau tạo NV con) */
  _layCredentialTam: () => { email: string; matKhau: string } | null;
}

// ============================================================================
// 🔥 GLOBAL SINGLETON FALLBACK 6s — CHẠY 1 LẦN DUY NHẤT, KHÔNG BAO GIỜ BỊ HUỶ
// Init auth đã stable 1 lần (không còn loop mount-unmount), nhưng để phòng
// trường hợp rules Firestore block silent → tối đa 6s mở khoá loading.
// ============================================================================
const THOI_GIAN_CHO_TOI_DA_MS = 6000;
let daChayFallbackMotLan = false;
const kichHoatGlobalFallbackMotLan = () => {
  if (daChayFallbackMotLan) return;
  daChayFallbackMotLan = true;
  queueMicrotask(() => {
    try {
      const layStoreRef = () => (useStoreXacThuc as any)?.getState?.() as TrangThaiStoreXacThuc | null;
      let daBoKhoa1Lan = false;
      // Không dùng setInterval lặp vô hạn, dùng setTimeout 1 lần duy nhất
      setTimeout(() => {
        try {
          const s = layStoreRef();
          if (!s) return;
          const dangBiKet = !s.daKhoiDong || s.dangTaiHoSo;
          if (dangBiKet && !daBoKhoa1Lan) {
            daBoKhoa1Lan = true;
             
            console.error('[STORE] ⛔ FALLBACK 6s (singleton 1 lan) — FORCE dangTai=false, daKhoiDong=true. Kiem tra Firestore rules collection nhan_su.');
            s._boKhoaLoadingTamThoi('fallback_6s_singleton');
          }
        } catch { /* ignore */ }
      }, THOI_GIAN_CHO_TOI_DA_MS);
    } catch { /* ignore */ }
  });
};

// ============================================================================
// 🔥 SINGLETON AUTH INIT (1 LẦN DUY NHẤT TOÀN BỘ APP LIFE) — KHÔNG BAO GIỜ BỊ CLEANUP
// DI CHUYỂN TỪ KhoaTruyCap (component bị mount/unmount theo state → vô hạn loop)
// SANG store module scope (chạy 1 lần khi import file lần đầu, không bao giờ hủy).
// ============================================================================
let daKhoiDongAuthGlobal = false;
let cleanupAuthGlobal: (() => void) | null = null;

export const khoiDongAuthMotLanDuyNhat = () => {
  if (daKhoiDongAuthGlobal) return;
  daKhoiDongAuthGlobal = true;
  try {
    const s = useStoreXacThuc.getState() as TrangThaiStoreXacThuc;
    cleanupAuthGlobal = s.boTriLangNgheTrangThaiDangNhap();
     
    console.log('[AUTH] Singleton init — lang nghe trang thai dang nhap BAT DAU (1 lan duy nhat app life)');
  } catch (e) {
     
    console.error('[AUTH] Singleton init Loi:', e);
  }
};

export const useStoreXacThuc = create<TrangThaiStoreXacThuc>((set, getState) => {
  const storeObj: TrangThaiStoreXacThuc = {
    nguoiDungHienTai: null,
    daKhoiDong: false,
    dangXuLy: false,
    dangTaiHoSo: false,
    thongBaoLoiChaoMung: null,
    thongBaoDangNhap: null,
    thoiDiemBootLanDau: Date.now(),
    _emailDangNhapTam: null,
    _matKhauDangNhapTam: null,

    datNguoiDungHienTai: (info) => set({ nguoiDungHienTai: info }),
    thietLapDaKhoiDong: (xong) => set({ daKhoiDong: xong }),
    xoaThongBaoDangNhap: () => set({ thongBaoDangNhap: null, thongBaoLoiChaoMung: null }),

    _boKhoaLoadingTamThoi: (_lyDo) => {
      set({ daKhoiDong: true, dangTaiHoSo: false, dangXuLy: false });
    },

    _layCredentialTam: () => {
      const s = getState();
      if (!s._emailDangNhapTam || !s._matKhauDangNhapTam) return null;
      return { email: s._emailDangNhapTam, matKhau: s._matKhauDangNhapTam };
    },

    thucHienDangNhap: async (email, matKhau) => {
      set({ dangXuLy: true, thongBaoLoiChaoMung: null, thongBaoDangNhap: null });
      try {
        const kq = await dangNhapBangEmailMatKhau(email, matKhau);
        if (kq.ketQua === ketQuaDangNhapCacLoai.THANH_CONG && kq.thongTinNguoiDung) {
          // Lưu tạm credential (memory-only) - cleanup sau 1 giờ hoặc signOut
          const emailSach = String(email ?? '').trim().toLowerCase();
          set({
            nguoiDungHienTai: kq.thongTinNguoiDung,
            thongBaoDangNhap: kq,
            thongBaoLoiChaoMung: kq.thongBao,
            _emailDangNhapTam: emailSach,
            _matKhauDangNhapTam: String(matKhau ?? '')
          });
          // Cleanup sau 1 giờ
          try {
            setTimeout(() => {
              try {
                const cur = getState();
                // Chỉ cleanup nếu credential vẫn là cũ của chính bản ghi lần đăng nhập này
                if (cur._emailDangNhapTam === emailSach) {
                  set({ _emailDangNhapTam: null, _matKhauDangNhapTam: null });
                }
              } catch { /* ignore */ }
            }, 60 * 60 * 1000);
          } catch { /* ignore */ }
        } else {
          // Đăng nhập thất bại → xoá luôn credential cũ để tránh dùng sai
          set({
            thongBaoDangNhap: kq,
            thongBaoLoiChaoMung: kq.thongBao,
            _emailDangNhapTam: null,
            _matKhauDangNhapTam: null
          });
        }
        return kq;
      } finally {
        set({ dangXuLy: false });
      }
    },

    thucHienDangXuat: async () => {
      set({ dangXuLy: true });
      try {
        const ok = await dangXuatHeThong();
        if (ok) {
          set({
            nguoiDungHienTai: null,
            thongBaoDangNhap: null,
            thongBaoLoiChaoMung: 'Da dang xuat khoi he thong.',
            _emailDangNhapTam: null,
            _matKhauDangNhapTam: null
          });
        }
        return ok;
      } finally {
        set({ dangXuLy: false });
      }
    },

    boTriLangNgheTrangThaiDangNhap: () => {
      let daHuy = false;
      let tamUnsub = (() => {}) as () => void;

      const huyLangNghe = langNgheTrangThaiDangNhap((info, dangTaiHoSoMoi) => {
        // ======================================
        // FIX CRITICAL:
        // ✅ LUÔN set dangTaiHoSoMoi → tránh stuck "Dang nap thong tin..." 
        //    khi instance bị StrictMode unmount set daHuy=true trước khi
        //    callback lần cuối dangTai=false về (drop callback set dangTai=true mãi mãi).
        // ======================================
        set({ dangTaiHoSo: dangTaiHoSoMoi });

        if (!dangTaiHoSoMoi) {
          if (!daHuy) {
            // Chỉ set user + daKhoiDong từ instance "CHÍNH" còn hoạt động,
            // tránh instance cũ (đã unmount) overwrite user của instance mới.
            set({
              nguoiDungHienTai: info,
              daKhoiDong: true,
              dangXuLy: false
            });
          } else if (!getState().daKhoiDong) {
            // Instance bị hủy nhưng đây là callback kết thúc lần duy nhất →
            // ít nhất mở khoá màn hình loading để Guard chuyển hướng.
            set({ daKhoiDong: true, dangXuLy: false });
          }
        }
      });

      tamUnsub = huyLangNghe;

      // Timeout an toàn 6s → PHÒNG TRƯỜNG HỢP callback lang nghe KHÔNG BAO GIỜ 
      // được gọi (SDK chưa init, offline cực lâu, rules block silent...)
      const timeoutId = setTimeout(() => {
        try {
          if (daHuy) return;
          const s = getState();
          if (!s.daKhoiDong || s.dangTaiHoSo) {
            set({ daKhoiDong: true, dangTaiHoSo: false, dangXuLy: false });
          }
        } catch {
          /* ignore */
        }
      }, 6000);

      return () => {
        daHuy = true;
        try { tamUnsub(); } catch { /* ignore */ }
        clearTimeout(timeoutId);

        // ⚠️ KHÔNG ĐƯỢC CHẠM STORE STATE Ở CLEANUP NỮA.
        // Listener này giờ chỉ khởi tạo 1 lần duy nhất ở Root Layout (singleton)
        // → cleanup gần như KHÔNG BAO GIỜ chạy (trừ khi HMR dev hoặc app exit).
        // Việc cleanup set state trước đó gây VÒNG LẶP VÔ HẠN mount-unmount-mount 20 lần/s.
      };
    }
  };
  // khoi tao fallback singleton 1 lan
  kichHoatGlobalFallbackMotLan();
  return storeObj;
});

export default useStoreXacThuc;
