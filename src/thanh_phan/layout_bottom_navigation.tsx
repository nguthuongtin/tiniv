'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderKanban,
  FileText,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { cn } from '../thu_vien/utils/cn';

const MUC_DUOI_CO_BAN = [
  { href: '/', icon: Home, nhan: 'Tổng quan' },
  { href: '/lich-cong-tac', icon: CalendarCheck, nhan: 'Lịch hẹn' },
  { href: '/ho-so-du-an', icon: FolderKanban, nhan: 'Dự án', laTrungTam: true },
  { href: '/khach-hang', icon: Building2, nhan: 'Khách hàng' },
  { href: '/bao-cao-cong-viec', icon: FileText, nhan: 'Báo cáo' }
] as const;

export default function ThanhDieuHuongDuoi() {
  const pathname = usePathname() ?? '/';

  return (
    <div
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none',
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <nav className="pointer-events-auto mx-3 mb-2.5 rounded-[28px] bg-white/92 border border-slate-200/80 shadow-[0_8px_32px_rgba(15,23,42,0.10)] backdrop-blur-2xl px-1.5 py-1">
        <ul className="grid grid-cols-5 items-center">
          {MUC_DUOI_CO_BAN.map((muc) => {
            const active =
              muc.href === '/'
                ? pathname === '/' ||
                  pathname === '/tong-quan-lanh-dao' ||
                  (pathname.startsWith('/bao-cao') && !pathname.startsWith('/bao-cao-cong-viec'))
                : pathname.startsWith(muc.href);
            const laGiua = 'laTrungTam' in muc && muc.laTrungTam;

            return (
              <li key={muc.href} className="min-w-0">
                <Link
                  href={muc.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-[20px] transition-all duration-200 relative active:scale-95 focus:outline-none focus-visible:outline-none select-none',
                    active
                      ? 'text-[#107555]'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-11 rounded-[15px] flex items-center justify-center transition-all duration-200',
                      active
                        ? laGiua
                          ? 'bg-[#107555] text-white shadow-xs shadow-emerald-900/20'
                          : 'bg-emerald-500/15 text-[#107555]'
                        : laGiua
                          ? 'bg-slate-100/90 text-slate-700'
                          : 'bg-transparent'
                    )}
                  >
                    <muc.icon
                      className={cn(
                        'size-[18px] transition-transform duration-200',
                        active ? 'stroke-[2.4px] scale-105' : 'stroke-[1.9px]'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] leading-tight tracking-tight text-center whitespace-nowrap truncate max-w-full',
                      active ? 'font-extrabold text-[#107555]' : 'font-semibold text-slate-500'
                    )}
                  >
                    {muc.nhan}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
