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
  { href: '/lich-cong-tac', icon: CalendarCheck, nhan: 'Lịch làm việc' },
  { href: '/ho-so-du-an', icon: FolderKanban, nhan: 'Dự án' },
  { href: '/khach-hang', icon: Building2, nhan: 'Khách hàng' },
  { href: '/bao-cao-cong-viec', icon: FileText, nhan: 'Báo cáo' }
] as const;

export default function ThanhDieuHuongDuoi() {
  const pathname = usePathname() ?? '/';

  return (
    <div
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50',
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      <nav className="mx-3 mb-2 rounded-[22px] bg-white/90 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <ul className="grid grid-cols-5">
          {MUC_DUOI_CO_BAN.map((muc) => {
            const active =
              muc.href === '/'
                ? pathname === '/' || pathname === '/tong-quan-lanh-dao' || pathname.startsWith('/bao-cao') && !pathname.startsWith('/bao-cao-cong-viec')
                : pathname.startsWith(muc.href);
            return (
              <li key={muc.href}>
                <Link
                  href={muc.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px] transition relative active:scale-95',
                    active
                      ? 'text-[#107555] font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'size-8 rounded-[10px] flex items-center justify-center transition',
                      active ? 'bg-emerald-50 text-[#107555]' : 'bg-transparent'
                    )}
                  >
                    <muc.icon
                      className={cn(
                        'size-[18px] transition',
                        active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                      )}
                    />
                  </div>
                  <span className="leading-tight">{muc.nhan}</span>
                  {active && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#107555]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
