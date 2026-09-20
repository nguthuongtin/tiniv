'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { LucideIcon } from 'lucide-react';

type KieuNut = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type KichThuocNut = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

const KIEU_NUT: Record<KieuNut, string> = {
  primary:
    'bg-gradient-to-r from-[#007AFF] to-[#0055D4] text-white shadow-sm shadow-blue-500/20 hover:opacity-95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200/80 active:scale-[0.97] border border-slate-200/60 transition-all',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 active:scale-[0.97] transition-all',
  outline:
    'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97] shadow-xs transition-all',
  danger:
    'bg-[#FF3B30] text-white hover:bg-red-600 active:scale-[0.97] shadow-sm shadow-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all'
};

const KICH_THUOC_NUT: Record<KichThuocNut, string> = {
  xs: 'h-7.5 px-3 text-xs rounded-lg gap-1.5 font-medium',
  sm: 'h-9 px-3.5 text-xs font-semibold rounded-xl gap-1.5',
  md: 'h-11 px-4.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'h-13 px-6 text-base font-semibold rounded-2xl gap-2.5',
  icon: 'size-10 rounded-xl'
};

export interface NutProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kieu?: KieuNut;
  kich_thuoc?: KichThuocNut;
  icon_trai?: LucideIcon;
  icon_phai?: LucideIcon;
  block?: boolean;
}

export const Nut = React.forwardRef<HTMLButtonElement, NutProps>(
  (
    {
      className,
      kieu = 'primary',
      kich_thuoc = 'md',
      icon_trai: IconTrai,
      icon_phai: IconPhai,
      block,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-black select-none disabled:opacity-50 disabled:pointer-events-none shadow-[var(--shadow-card)] active:scale-[0.982]',
          KIEU_NUT[kieu],
          KICH_THUOC_NUT[kich_thuoc],
          block && 'w-full',
          className
        )}
        {...props}
      >
        {IconTrai ? <IconTrai className={cn('shrink-0', kich_thuoc === 'md' ? 'size-[19px]' : 'size-[17px]')} strokeWidth={2} /> : null}
        {children}
        {IconPhai ? <IconPhai className={cn('shrink-0', kich_thuoc === 'md' ? 'size-[19px]' : 'size-[17px]')} strokeWidth={2} /> : null}
      </button>
    );
  }
);
Nut.displayName = 'Nut';

export default Nut;
