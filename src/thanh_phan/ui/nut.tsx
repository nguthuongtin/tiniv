'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { LucideIcon } from 'lucide-react';

type KieuNut = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type KichThuocNut = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

const KIEU_NUT: Record<KieuNut, string> = {
  primary:
    'bg-primary text-white shadow-[0_1px_2px_0_rgb(37,99,235,0.20),0_1px_3px_0_rgb(37,99,235,0.10)] hover:bg-[color-mix(in_srgb,var(--color-primary),black_10%)] active:bg-[color-mix(in_srgb,var(--color-primary),black_18%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary),white_40%)] transition duration-[var(--animate-duration-200)]',
  secondary:
    'bg-muted text-foreground hover:bg-[color-mix(in_srgb,var(--color-muted),black_4%)] active:bg-[color-mix(in_srgb,var(--color-muted),black_8%)] border border-border',
  ghost:
    'bg-transparent hover:bg-muted text-foreground active:bg-[color-mix(in_srgb,var(--color-muted),black_6%)]',
  outline:
    'border border-border bg-background text-foreground hover:bg-muted active:bg-[color-mix(in_srgb,var(--color-muted),black_5%)]',
  danger:
    'bg-danger text-white hover:bg-[color-mix(in_srgb,var(--color-danger),black_8%)] active:bg-[color-mix(in_srgb,var(--color-danger),black_16%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-danger),white_50%)]'
};

const KICH_THUOC_NUT: Record<KichThuocNut, string> = {
  xs: 'h-8 px-3 text-[11px] rounded-[var(--radius-button)] gap-1.5',
  sm: 'h-11 px-4.5 text-[13px] rounded-[var(--radius-input)] gap-2',
  md: 'h-14 px-5.5 text-[14px] rounded-[var(--radius-input)] gap-2.5',
  lg: 'h-16 px-7 text-[15.5px] rounded-[var(--radius-input)] gap-3.5',
  icon: 'size-11 rounded-[var(--radius-button)]'
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
