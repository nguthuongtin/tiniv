'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import BocXacThucToanUngDung from '../thanh_phan/xac_thuc/boc_xac_thuc_toan_ung_dung';
import { SidebarDesktop, SidebarMobileDrawer } from '../thanh_phan/layout_sidebar';
import ThanhPhanTopbar from '../thanh_phan/layout_topbar';
import ThanhDieuHuongDuoi from '../thanh_phan/layout_bottom_navigation';

export default function BoCucGoc({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() ?? '/';
  const laTrangDangNhap = pathname === '/dang-nhap' || pathname.startsWith('/dang-nhap/');

  if (laTrangDangNhap) {
    return (
      <html lang="vi-VN" className="antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('startTime') !== -1 || e.message.indexOf('reportAllChanges') !== -1)) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
            `
          }}
        />
      </head>
      <body>
        <BocXacThucToanUngDung>{children}</BocXacThucToanUngDung>
      </body>
      </html>
    );
  }

  return (
    <html lang="vi-VN" className="antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('startTime') !== -1 || e.message.indexOf('reportAllChanges') !== -1)) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
            `
          }}
        />
      </head>
      <body className="bg-[linear-gradient(180deg,#f8faff_0%,#ffffff_320px)]">
        <BocXacThucToanUngDung>
          <div className="flex h-[100dvh] w-full overflow-hidden min-w-0 max-w-none">
            <aside className="hidden md:flex w-64 h-full flex-shrink-0 flex-col min-h-0 overflow-hidden bg-background/85 backdrop-blur-md">
              <SidebarDesktop />
            </aside>
            <main className="flex-1 h-full overflow-y-auto min-w-0 flex flex-col overflow-x-hidden">
              <ThanhPhanTopbar />
              <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 pb-[calc(84px+env(safe-area-inset-bottom,0px))] md:pb-12 flex-1 min-w-0">
                {children}
              </div>
              <ThanhDieuHuongDuoi />
            </main>
          </div>
          <SidebarMobileDrawer />
        </BocXacThucToanUngDung>
      </body>
    </html>
  );
}
