'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

export interface ChonProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  phan_hoi?: string | null;
  wrapperClassName?: string;
}

const Chon = React.forwardRef<HTMLSelectElement, ChonProps>(
  ({ className, phan_hoi, wrapperClassName, disabled, children, ...props }, ref) => (
    <div className={cn('w-full space-y-1.5', wrapperClassName)}>
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full appearance-none items-center rounded-[var(--radius-input)] border border-border bg-background pl-3 pr-10 py-2 text-sm text-foreground shadow-[0_1px_0_rgb(15,23,42,0.03)] outline-none transition',
            'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--color-primary),white_88%)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
      {phan_hoi ? (
        <p className="text-[11px] font-medium text-danger leading-tight">{phan_hoi}</p>
      ) : null}
    </div>
  )
);
Chon.displayName = 'Chon';

export { Chon };
export default Chon;
