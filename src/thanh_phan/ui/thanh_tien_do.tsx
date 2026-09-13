import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';

export interface ThanhTienDoProps extends React.HTMLAttributes<HTMLDivElement> {
  phan_tram: number;
  kieu?: 'primary' | 'success' | 'warning' | 'danger';
  kich_thuoc?: 'sm' | 'md' | 'lg';
  nhan_hien_thi?: React.ReactNode;
}

const MAU_TT: Record<NonNullable<ThanhTienDoProps['kieu']>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

const KT_TT: Record<NonNullable<ThanhTienDoProps['kich_thuoc']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5'
};

export const Thanh_Tien_Do = React.forwardRef<HTMLDivElement, ThanhTienDoProps>(
  ({ phan_tram, kieu = 'primary', kich_thuoc = 'md', nhan_hien_thi, className, ...props },
  ref
) => {
  const value = Math.min(100, Math.max(0, Number(phan_tram) || 0));
  return (
    <div ref={ref} className={cn('w-full space-y-1.5', className)} {...props}>
      {nhan_hien_thi ? (
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
        {nhan_hien_thi}
      </div>
    ) : null}
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', KT_TT[kich_thuoc])}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn('h-full rounded-full transition-[width] duration-[var(--animate-duration-250)]', MAU_TT[kieu])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
});
Thanh_Tien_Do.displayName = 'Thanh_Tien_Do';

export default Thanh_Tien_Do;
