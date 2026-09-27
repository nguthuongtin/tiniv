import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

export interface NhanProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  bat_buoc?: boolean;
}

export const Nhan = React.forwardRef<HTMLLabelElement, NhanProps>(
  ({ className, children, bat_buoc, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-xs font-bold text-slate-800 block leading-tight', className)}
      {...props}
    >
      {children}
      {bat_buoc ? <span className="ml-0.5 text-rose-500 font-bold">*</span> : null}
    </label>
  )
);
Nhan.displayName = 'Nhan';

export default Nhan;
