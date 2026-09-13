'use client';

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { khoiDongAuthMotLanDuyNhat } from '../../thu_vien/zustand/store_xac_thuc';

// KhoaTruyCap dynamic import de tranh loi Nextjs server component import usePathname
const KhoaTruyCapDynamic = dynamic(
  () =>
    import('./khoa_truy_cap').then((md) => {
      return md.KhoaTruyCap;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="animate-pulse text-sm text-slate-500">Đang tải…</div>
      </div>
    )
  }
);

interface IBocXacThucToanUngDungProps {
  children: React.ReactNode;
}

/**
 * Boi toan bo Root Layout boi KhoaTruyCap:
 *  - 🔥 Khoi tao onAuthStateChanged SINGLETON (1 LAN DUY NHAT toan app life) — KHÔNG BAO GIỜ BỊ CLEANUP
 *    → di chuyen tu KhoaTruyCap de tranh race condition StrictMode mount-unmount-loop 20 lan/s
 *  - Neu chua dang nhap + ko o /dang-nhap → redirect /dang-nhap
 *  - Neu da dang nhap + o /dang-nhap → redirect /
 */
const BocXacThucToanUngDung: React.FC<IBocXacThucToanUngDungProps> = ({ children }) => {
  useEffect(() => {
    // 1 LAN DUY NHAT TOAN APP LIFE.
    // Flag `daKhoiDongAuthGlobal` trong store ngan chay lai 2 lan (ke ca StrictMode 2 mount).
    khoiDongAuthMotLanDuyNhat();

    // Ngăn chặn lỗi từ tiện ích mở rộng trình duyệt (Web Vitals / DevTools extension) khi gọi reportAllChanges
    const boQuaLoiWebVitals = (event: ErrorEvent) => {
      if (
        event?.message?.includes("reading 'startTime'") ||
        event?.message?.includes('reportAllChanges')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', boQuaLoiWebVitals);
    return () => window.removeEventListener('error', boQuaLoiWebVitals);
  }, []);

  return <KhoaTruyCapDynamic>{children}</KhoaTruyCapDynamic>;
};

export default BocXacThucToanUngDung;
