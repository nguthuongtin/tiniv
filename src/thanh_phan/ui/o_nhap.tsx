'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { LucideIcon } from 'lucide-react';

export interface ONhapProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'textarea' | 'date';
  icon_trai?: LucideIcon;
  icon_phai?: LucideIcon;
  phan_hoi?: string | null;
  wrapperClassName?: string;
}

const O_Nhap = React.forwardRef<HTMLInputElement, ONhapProps>(
  (
    { className, type = 'text', icon_trai: IconTrai, icon_phai: IconPhai, phan_hoi, wrapperClassName, disabled, ...props },
    ref
  ) => {
    if (type === 'textarea') {
      return (
        <div className={cn('w-full space-y-1.5', wrapperClassName)}>
          <div className="w-full">
            <textarea
              disabled={disabled}
              ref={ref as any}
              className={cn(
                'flex min-h-[88px] w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs',
                'focus-visible:outline-none focus-visible:bg-white focus-visible:border-[#007AFF] focus-visible:ring-2 focus-visible:ring-[#007AFF]/20 transition-all',
                'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
                className
              )}
              {...(props as any)}
            />
          </div>
          {phan_hoi ? (
            <p className="text-[11px] font-medium text-danger leading-tight">{phan_hoi}</p>
          ) : null}
        </div>
      );
    }

    return (
      <div className={cn('w-full space-y-1.5', wrapperClassName)}>
        <div
          className={cn(
            'flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 pl-3 pr-2 shadow-xs transition-all',
            'focus-within:bg-white focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/20',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed'
          )}
        >
          {IconTrai ? (
            <IconTrai className="size-4 shrink-0 text-slate-400 pointer-events-none" />
          ) : null}
          <input
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              'flex h-full w-full min-w-0 bg-transparent px-0.5 py-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none',
              className
            )}
            {...props}
          />
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
O_Nhap.displayName = 'O_Nhap';

export default O_Nhap;
export { O_Nhap };
export { O_Nhap as O };
