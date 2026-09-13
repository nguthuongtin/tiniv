import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';

export const Bang = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Bang.displayName = 'Bang';

export const ChuDeBang = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('[&_tr]:border-b-0 bg-slate-50/80 backdrop-blur', className)}
      {...props}
    >
      {children}
    </thead>
  )
);
ChuDeBang.displayName = 'ChuDeBang';

export const ThanBang = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);
ThanBang.displayName = 'ThanBang';

export const HangBang = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-slate-200/70 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-blue-50/40',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
);
HangBang.displayName = 'HangBang';

export const ODauBang = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-10 px-3 text-left align-middle font-semibold text-[11px] uppercase tracking-wider text-slate-500',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
);
ODauBang.displayName = 'ODauBang';

export const OBang = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-3 align-middle text-sm text-slate-700', className)}
      {...props}
    >
      {children}
    </td>
  )
);
OBang.displayName = 'OBang';

export default Bang;
