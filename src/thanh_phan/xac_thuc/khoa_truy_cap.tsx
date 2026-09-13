'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert, AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import { coQuyen } from '../../thu_vien/phan_quyen/kiem_tra_quyen';

interface KhoaTruyCapProps {
  children: React.ReactNode;
  /** Khi can vai tro nao moi dc xem (VD: 'quan_tri_he_thong', ['giam_doc','truong_phong']). Mac dinh = dang nhap la dc. */
  yeuCauVaiTro?: string | string[];
  /** Khi can ma quyen nao moi dc xem (VD: 'he_thong.quan_tri', ['du_an.xem', 'nhan_su.xem']) */
  yeuCauQuyen?: string | string[];
  /** Khi co loi vai tro/quyen, hien thay vi bao loi mac dinh */
  thayTheKhongDuQuyen?: React.ReactNode;
  /** Redirect ve /dang-nhap khi chua dang nhap (mac dinh = true) */
  chuyenHuongKhiChuaDangNhap?: boolean;
}

const TRANG_DANG_NHAP = '/dang-nhap';
const TRANG_CHU = '/';

const hienTaiLaTrangDangNhap = (path: string | null) => {
  if (!path) return false;
  const p = path.toLowerCase().replace(/\/+$/, '');
  return p === '/dang-nhap' || p.startsWith('/dang-nhap/');
};

const vaiTroHopLe = (vaiTroHienTai: string | null | undefined, yeuCau: string | string[] | undefined): boolean => {
  if (!yeuCau || yeuCau.length === 0) return true;
  if (!vaiTroHienTai) return false;
  if (vaiTroHienTai === 'quan_tri_he_thong') return true;
  if (Array.isArray(yeuCau)) {
    return yeuCau.includes(vaiTroHienTai);
  }
  return vaiTroHienTai === yeuCau;
};

const quyenHopLe = (nguoiDung: any, yeuCau: string | string[] | undefined): boolean => {
  if (!yeuCau || (Array.isArray(yeuCau) && yeuCau.length === 0)) return true;
  if (!nguoiDung) return false;
  if (nguoiDung.vai_tro === 'quan_tri_he_thong') return true;
  if (Array.isArray(yeuCau)) {
    return yeuCau.some((q) => coQuyen(nguoiDung, q));
  }
  return coQuyen(nguoiDung, yeuCau);
};

export const KhoaTruyCap: React.FC<KhoaTruyCapProps> = ({
  children,
  yeuCauVaiTro,
  yeuCauQuyen,
  thayTheKhongDuQuyen,
  chuyenHuongKhiChuaDangNhap = true
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // ======== ZUSTAND SELECTOR RIÊNG ========
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const daKhoiDong = useStoreXacThuc((s) => s.daKhoiDong);
  const dangTaiHoSo = useStoreXacThuc((s) => s.dangTaiHoSo);
  const thoiDiemBootLanDau = useStoreXacThuc((s) => s.thoiDiemBootLanDau);
  const thietLapDaKhoiDong = useStoreXacThuc((s) => s.thietLapDaKhoiDong);

  // ======== COUNTER THỜI GIAN CHỜ — HIỂN THỊ ĐỂ USER NHÌN THẤY CODE ĐANG CHẠY ========
  const [soGiayCho, setSoGiayCho] = useState(0);
  useEffect(() => {
    if (daKhoiDong && !dangTaiHoSo) {
      setSoGiayCho(0);
      return;
    }
    const id = setInterval(() => {
      setSoGiayCho((s) => (daKhoiDong === false || dangTaiHoSo === true ? s + 1 : s));
    }, 1000);
    return () => clearInterval(id);
  }, [daKhoiDong, dangTaiHoSo]);

  const refDaEpKhoaLoading = useRef(false);

  // === 1) Redirect: chua dang nhap → /dang-nhap, da dang nhap nhung o trang dang-nhap → /
  useEffect(() => {
    if (!daKhoiDong) return;
    const laTrangDangNhap = hienTaiLaTrangDangNhap(pathname);
    if (!nguoiDungHienTai) {
      if (!laTrangDangNhap && chuyenHuongKhiChuaDangNhap) {
        try {
          router.replace(TRANG_DANG_NHAP);
        } catch {
          /* ignore */
        }
      }
      return;
    }
    // Da co nguoi dung roi: neu van o /dang-nhap thi day ve trang chu
    if (laTrangDangNhap) {
      try {
        router.replace(TRANG_CHU);
      } catch {
        /* ignore */
      }
    }
  }, [nguoiDungHienTai, daKhoiDong, router, pathname, chuyenHuongKhiChuaDangNhap]);

  // === 2) Man hinh loading (chua khoi dong xong / dang nap ho so tu Firestore)
  if (!daKhoiDong || dangTaiHoSo) {
    const daQua10s = soGiayCho >= 10 || Date.now() - thoiDiemBootLanDau > 10_000;
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6">
        <div className="size-16 text-primary animate-spin">
          <Loader2 />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-800 text-sm font-semibold text-center">
            {dangTaiHoSo ? 'Đang nạp thông tin tài khoản...' : 'Đang khởi động hệ thống EBMS...'}
          </p>
          <p className="text-slate-600 text-[13px] font-medium tracking-wide">
            Đã chờ:{' '}
            <span
              className={cn(
                'font-bold px-1.5 py-0.5 rounded text-[12px]',
                soGiayCho < 5 && 'bg-slate-100 text-slate-700',
                soGiayCho >= 5 && soGiayCho < 10 && 'bg-amber-100 text-amber-800',
                soGiayCho >= 10 && 'bg-red-100 text-red-700'
              )}
            >
              {soGiayCho}s
            </span>
            {' · '}Tối đa 6s (tự động thoát nếu kẹt)
          </p>
          <p className="text-slate-400 text-xs text-center max-w-md leading-relaxed">
            Bình thường {'< 3s'}. Nếu đợi lâu → nhấn{' '}
            <span className="underline cursor-pointer text-slate-600 font-medium" onClick={() => window.location.reload()}>
              Tải lại trang
            </span>{' '}
            hoặc <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono">Ctrl+F5</kbd>.
          </p>

          {/* NÚT KHẨN CẤP - HIỆN NGAY LẬP TỨC */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full max-w-md">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold shadow-sm',
                'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors'
              )}
            >
              <RefreshCw className="size-4" />
              Tải lại (F5)
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  refDaEpKhoaLoading.current = true;
                  thietLapDaKhoiDong(true);
                  useStoreXacThuc.setState({ dangTaiHoSo: false });
                } catch {}
              }}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold shadow-sm',
                'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors'
              )}
            >
              <RotateCcw className="size-4" />
              Buộc thoát loading
            </button>
          </div>

          {daQua10s && (
            <div className="mt-3 max-w-md w-full rounded-xl border-2 border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3">
              <AlertTriangle className="size-5 mt-0.5 shrink-0 text-red-600" />
              <div className="flex-1 leading-relaxed space-y-1.5">
                <div className="font-bold text-sm mb-1">⏹ ĐỢI QUÁ LÂU (trên 10s) — CÓ LỖI</div>
                <div>
                  <div className="font-semibold">Lý do 95% trường hợp: Firestore Rules chưa Publish.</div>
                  <div className="mt-1">
                    1. Mở tab khác vào Firebase Console → Build → Firestore → <b>Rules</b>
                  </div>
                  <div>2. Dán toàn bộ nội dung file <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200 break-all">c:\Litte POS\firestore.rules</code> vào</div>
                  <div>3. Bấm <b>Publish</b> → quay lại đây nhấn nút "Tải lại"</div>
                </div>
                <div className="mt-2 text-red-700 font-medium">
                  Nếu đã Publish rules rồi vẫn bị → Mở DevTools (F12) → Tab Console, chụp ảnh màn hình có lỗi màu đỏ (PERMISSION_DENIED) gửi lại cho dev.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === 3) Chua dang nhap (khong chuyen huong tu dong, hoac la trang dang-nhap)
  if (!nguoiDungHienTai) {
    if (!hienTaiLaTrangDangNhap(pathname)) {
      // Bao loi thay vi chuyen huong (neu tat chuyen huong)
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="mx-auto size-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Chưa đăng nhập</h2>
              <p className="text-slate-500 text-sm mt-1">Bạn cần đăng nhập để truy cập chức năng này.</p>
            </div>
            <button
              type="button"
              onClick={() => router.replace(TRANG_DANG_NHAP)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm"
            >
              Đi đến trang đăng nhập
            </button>
          </div>
        </div>
      );
    }
    // La trang dang-nhap → pass children cho no render form
    return <>{children}</>;
  }

  // === 4) Da dang nhap → kiem tra vai tro & quyen ===
  const khongDuVaiTro = !vaiTroHopLe(nguoiDungHienTai.vai_tro, yeuCauVaiTro);
  const khongDuQuyen = !quyenHopLe(nguoiDungHienTai, yeuCauQuyen);

  if (khongDuVaiTro || khongDuQuyen) {
    if (thayTheKhongDuQuyen) return <>{thayTheKhongDuQuyen}</>;
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="mx-auto size-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Không đủ quyền truy cập</h2>
            <p className="text-slate-500 text-sm mt-1">
              Tài khoản của bạn (<b className="text-slate-700">{nguoiDungHienTai.vai_tro || 'chua_cap_nhat'}</b>) không có quyền truy cập vào chức năng này.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.replace(TRANG_CHU)}
            className="w-full rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 text-sm"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  // === 5) OK — render noi dung ===
  return <>{children}</>;
};

export default KhoaTruyCap;
