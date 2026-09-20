import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

type KieuHieu = 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

const KIEU_HIEU: Record<KieuHieu, string> = {
  muted: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-blue-50 text-[#007AFF] border-blue-200/80',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  secondary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
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
