import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

type KieuHieu = 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

const KIEU_HIEU: Record<KieuHieu, string> = {
  muted: 'bg-card-icon-bg-muted text-card-icon-fg-muted',
  primary: 'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary border border-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-success border border-[color-mix(in_srgb,var(--color-success)_15%,transparent)]',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-warning border border-[color-mix(in_srgb,var(--color-warning)_15%,transparent)]',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-danger border border-[color-mix(in_srgb,var(--color-danger)_15%,transparent)]',
  secondary: 'bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)] text-secondary-foreground border border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)]'
};

export interface HieuProps extends React.HTMLAttributes<HTMLSpanElement> {
  kieu?: KieuHieu;
  tron_vien?: boolean;
  kich_thuoc?: 'xs' | 'sm' | 'md';
  icon_trai?: LucideIcon;
}

export const Hieu = React.forwardRef<HTMLSpanElement, HieuProps>(
  ({ className, kieu = 'muted', tron_vien = true, kich_thuoc = 'sm', icon_trai: IconTrai, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center font-black tracking-tight border',
        kieu === 'muted' && 'border-transparent',
        kich_thuoc === 'xs' ? 'h-5 px-2 text-[10.5px] leading-small gap-1' : kich_thuoc === 'sm' ? 'h-6 px-3 text-[12px] leading-small gap-1.5' : 'h-7 px-3.5 text-[13px] leading-title gap-1.5',
        tron_vien ? 'rounded-full' : 'rounded-[var(--radius-button)]',
        KIEU_HIEU[kieu],
        className
      )}
      {...props}
    >
      {IconTrai ? <IconTrai className={cn(kich_thuoc === 'xs' ? 'size-3' : 'size-3.5')} strokeWidth={2.25} /> : null}
      {children}
    </span>
  )
);
Hieu.displayName = 'Hieu';

export { KIEU_HIEU };
export type { KieuHieu };
export default Hieu;
