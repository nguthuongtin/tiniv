'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Nut } from './nut';

export interface KhungDanhSachProps {
  tieu_de: string;
  tieu_de_ngan?: string;
  so_luong?: number;
  hanh_dong?: React.ReactNode;
  hanh_dong_phu?: React.ReactNode;
  chan?: React.ReactNode;
  chan_trang?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function KhungDanhSach({
  tieu_de,
  tieu_de_ngan,
  so_luong,
  hanh_dong,
  hanh_dong_phu,
  chan,
  chan_trang,
  className,
  children
}: KhungDanhSachProps) {
  const nutHanhDong = hanh_dong ?? hanh_dong_phu;
  const phanChan = chan ?? chan_trang;
  return (
    <section
      className={cn(
        'bg-white rounded-card sm:rounded-2xl border border-slate-200/80 shadow-nhe overflow-hidden',
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-noi-dung sm:text-trang font-extrabold text-slate-900 tracking-tight truncate">
            <span className="sm:hidden">{tieu_de_ngan ?? tieu_de}</span>
            <span className="hidden sm:inline">{tieu_de}</span>
          </h2>
          {so_luong !== undefined && (
            <span className="text-nhan sm:text-phu px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/80 tabular-nums shrink-0">
              {so_luong}
            </span>
          )}
        </div>
        {nutHanhDong ? <div className="flex items-center gap-2 shrink-0">{nutHanhDong}</div> : null}
      </header>
      {children}
      {phanChan}
    </section>
  );
}

export function DanhSachTheMobile({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('sm:hidden flex flex-col gap-2.5 p-2.5 bg-slate-100/70', className)}>
      {children}
    </div>
  );
}

export function TheMobile({
  mo_di,
  className,
  children,
  ...con_lai
}: React.HTMLAttributes<HTMLDivElement> & {
  mo_di?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-3.5 bg-white rounded-card border border-slate-200/80 shadow-nhe transition-colors',
        mo_di && 'opacity-70 bg-slate-50/50',
        con_lai.onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      {...con_lai}
    >
      {children}
    </div>
  );
}

export interface PhanTrangProps {
  trang?: number;
  trang_hien_tai?: number;
  tong_trang?: number;
  tong_so_trang?: number;
  tong_ban_ghi?: number;
  tong_so_ban_ghi?: number;
  so_ban_ghi_moi_trang?: number;
  don_vi?: string;
  ten_don_vi?: string;
  khi_doi?: (trang: number) => void;
  khi_chuyen_trang?: (trang: number) => void;
}

export function PhanTrang({
  trang,
  trang_hien_tai,
  tong_trang,
  tong_so_trang,
  tong_ban_ghi,
  tong_so_ban_ghi,
  don_vi,
  ten_don_vi,
  khi_doi,
  khi_chuyen_trang
}: PhanTrangProps) {
  const t = trang ?? trang_hien_tai ?? 1;
  const tt = tong_trang ?? tong_so_trang ?? 1;
  const tb = tong_ban_ghi ?? tong_so_ban_ghi ?? 0;
  const dv = don_vi ?? ten_don_vi ?? 'bản ghi';
  const onChange = khi_doi ?? khi_chuyen_trang ?? (() => {});

  if (tt <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 bg-white">
      <div className="text-phu font-semibold text-slate-500 tabular-nums">
        Trang <span className="text-slate-900 font-bold">{t}</span> / {tt} ({tb} {dv})
      </div>
      <div className="flex items-center gap-1.5">
        <Nut
          kieu="outline"
          kich_thuoc="xs"
          icon_trai={ChevronLeft}
          disabled={t <= 1}
          onClick={() => onChange(Math.max(1, t - 1))}
        >
          Trước
        </Nut>
        <Nut
          kieu="outline"
          kich_thuoc="xs"
          icon_phai={ChevronRight}
          disabled={t >= tt}
          onClick={() => onChange(Math.min(tt, t + 1))}
        >
          Sau
        </Nut>
      </div>
    </div>
  );
}

type SacNutIcon = 'mac_dinh' | 'primary' | 'canh_bao' | 'loi' | 'xanh' | 'vang' | 'do';

const SAC_NUT_ICON: Record<SacNutIcon, string> = {
  mac_dinh: 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
  primary: 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50',
  xanh: 'text-slate-400 hover:text-emerald-700 hover:bg-emerald-50',
  canh_bao: 'text-slate-400 hover:text-amber-700 hover:bg-amber-50',
  vang: 'text-slate-400 hover:text-amber-700 hover:bg-amber-50',
  loi: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
  do: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
};

interface NutIconChung {
  icon: LucideIcon;
  nhan?: string;
  tieu_de?: string;
  sac?: SacNutIcon;
  mau?: SacNutIcon;
  className?: string;
}

export function NutIcon(
  props: NutIconChung &
    (
      | ({ href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>)
      | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)
    )
) {
  const { icon: Icon, nhan, tieu_de, sac, mau, className, ...con_lai } = props;
  const label = nhan ?? tieu_de ?? '';
  const kieuSac = sac ?? mau ?? 'mac_dinh';
  const lop = cn(
    'inline-flex items-center justify-center p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
    SAC_NUT_ICON[kieuSac] ?? SAC_NUT_ICON.mac_dinh,
    className
  );
  if ('href' in con_lai && con_lai.href !== undefined) {
    return (
      <Link title={label} aria-label={label} className={lop} {...(con_lai as React.ComponentProps<typeof Link>)}>
        <Icon className="size-4" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={lop}
      {...(con_lai as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      <Icon className="size-4" />
    </button>
  );
}
