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
                'flex min-h-[88px] w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_1px_0_rgb(15,23,42,0.03)]',
                'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--color-primary),white_88%)]',
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
            'flex h-10 w-full items-center gap-2 rounded-[var(--radius-input)] border border-border bg-background pl-3 pr-2 shadow-[0_1px_0_rgb(15,23,42,0.03)] transition',
            'focus-within:border-primary focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--color-primary),white_88%)]',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed'
          )}
        >
          {IconTrai ? (
            <IconTrai className="size-4 shrink-0 text-muted-foreground pointer-events-none" />
          ) : null}
          <input
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              'flex h-full w-full min-w-0 bg-transparent px-0.5 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none',
              className
            )}
            {...props}
          />
          {IconPhai ? (
            <IconPhai className="size-4 shrink-0 text-muted-foreground pointer-events-none" />
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
