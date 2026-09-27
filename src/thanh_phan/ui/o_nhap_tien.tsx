'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { dinhDangSoPhanNgan, giaiMaSoPhanNgan } from '../../thu_vien/utils/format_tien';

export interface ONhapTienProps {
  id?: string;
  value?: number | string | null;
  onChange?: (val: number) => void;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  icon_trai?: LucideIcon;
  icon_phai?: LucideIcon;
  phan_hoi?: string | null;
  don_vi?: string;
}

export const O_NhapTien = React.forwardRef<HTMLInputElement, ONhapTienProps>(
  (
    {
      id,
      value,
      onChange,
      disabled,
      className,
      wrapperClassName,
      icon_trai: IconTrai,
      icon_phai: IconPhai,
      phan_hoi,
      don_vi = '₫'
    },
    ref
  ) => {
    const textHienThi = React.useMemo(() => {
      if (value === undefined || value === null || value === '' || value === 0) return '';
      return dinhDangSoPhanNgan(value);
    }, [value]);

    const xuLyThayDoi = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawText = e.target.value;
      const so = giaiMaSoPhanNgan(rawText);
      if (onChange) {
        onChange(so);
      }
    };

    return (
      <div className={cn('w-full space-y-1.5', wrapperClassName)}>
        <div
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 pl-3 pr-2 shadow-xs transition-all',
            'focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed'
          )}
        >
          {IconTrai ? (
            <IconTrai className="size-4 shrink-0 text-slate-400 pointer-events-none" />
          ) : null}
          <input
            id={id}
            ref={ref}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={textHienThi}
            onChange={xuLyThayDoi}
            className={cn(
              'flex h-full w-full min-w-0 bg-transparent px-0.5 py-1 text-sm font-mono text-slate-900 outline-none',
              className
            )}
          />
          {don_vi && (
            <span className="text-xs font-semibold text-slate-400 shrink-0 select-none">
              {don_vi}
            </span>
          )}
          {IconPhai ? (
            <IconPhai className="size-4 shrink-0 text-slate-400 pointer-events-none" />
          ) : null}
        </div>
        {phan_hoi ? (
          <p className="text-[11px] font-medium text-danger leading-tight">{phan_hoi}</p>
        ) : null}
      </div>
    );
  }
);

O_NhapTien.displayName = 'O_NhapTien';
export default O_NhapTien;
