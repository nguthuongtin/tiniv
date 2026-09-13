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
      className={cn('text-sm font-medium text-foreground leading-none', className)}
      {...props}
    >
      {children}
      {bat_buoc ? <span className="ml-1 text-danger font-semibold">*</span> : null}
    </label>
  )
);
Nhan.displayName = 'Nhan';

export default Nhan;
