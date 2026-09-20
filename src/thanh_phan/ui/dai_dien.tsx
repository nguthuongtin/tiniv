import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';
import { User } from 'lucide-react';

type KieuDaiDien = 'primary' | 'success' | 'warning' | 'danger' | 'slate';
const MAP_KIEU_DAI_DIEN: Record<KieuDaiDien, string> = {
  primary: 'bg-[color-mix(in_srgb,var(--color-primary),black_10%)] text-white',
  success: 'bg-[color-mix(in_srgb,var(--color-success),black_10%)] text-white',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning),black_10%)] text-white',
  danger: 'bg-[color-mix(in_srgb,var(--color-danger),black_10%)] text-white',
  slate: 'bg-muted text-muted-foreground'
};

export interface DaiDienProps extends React.HTMLAttributes<HTMLDivElement> {
  kich_thuoc?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  kieu?: KieuDaiDien;
  ten?: string | null;
  anh?: string | null;
  khong_anh_gradient?: boolean;
}

const KT_DD = {
  xs: 'size-7 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg'
};

export const layKieuDaiDienTuTen = (ten: string | null | undefined): KieuDaiDien => {
  if (!ten) return 'slate';
  const b = ten.trim().toLowerCase().charCodeAt(0);
  if (isNaN(b)) return 'slate';
  const keys = Object.keys(MAP_KIEU_DAI_DIEN) as KieuDaiDien[];
  return keys[b % keys.length];
};

export const DaiDien = React.forwardRef<HTMLDivElement, DaiDienProps>(
  ({ className, kich_thuoc = 'md', kieu, ten, anh, khong_anh_gradient, ...props }, ref) => {
    const [loiAnh, setLoiAnh] = React.useState(false);
    const chu_cai_dau = ten?.trim()?.charAt?.(0)?.toUpperCase?.() ?? '';
    const kieu_dung = kieu ?? layKieuDaiDienTuTen(ten);

    const anhHopLe = typeof anh === 'string' && anh.trim().length > 0 && anh !== 'null' && anh !== 'undefined' ? anh.trim() : null;
    const co_anh = Boolean(anhHopLe && !khong_anh_gradient && !loiAnh);

    React.useEffect(() => {
      setLoiAnh(false);
    }, [anhHopLe]);

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold border-0 ring-2 ring-background shadow-[var(--shadow-card)] relative',
          KT_DD[kich_thuoc],
          co_anh ? 'bg-muted p-0' : MAP_KIEU_DAI_DIEN[kieu_dung],
          className
        )}
        {...props}
      >
        {co_anh ? (
          <img
            src={anhHopLe!}
            alt={ten ?? 'Avatar'}
            className="h-full w-full object-cover rounded-full"
            onError={() => setLoiAnh(true)}
          />
        ) : chu_cai_dau ? (
          <span>{chu_cai_dau}</span>
        ) : (
          <User className={cn(kich_thuoc === 'xs' ? 'size-3' : kich_thuoc === 'sm' ? 'size-4' : 'size-5')} />
        )}
      </div>
    );
  }
);
DaiDien.displayName = 'DaiDien';

export default DaiDien;
