import type { ReactNode } from 'react';
import { cn } from '../../thu_vien/utils/cn';

export interface BoCucTrangProps {
  tieu_de?: string;
  phu_de?: string;
  hanh_dong_phai?: ReactNode;
  badge_tieu_de?: ReactNode;
  children?: ReactNode;
  className?: string;
  khoang_cach_trong?: string;
}

export function Bo_Cuc_Trang({
  tieu_de,
  phu_de,
  hanh_dong_phai,
  badge_tieu_de,
  children,
  className,
  khoang_cach_trong = 'space-y-12'
}: BoCucTrangProps) {
  const co_header = Boolean(tieu_de || hanh_dong_phai || badge_tieu_de || phu_de);
  return (
    <section
      className={cn(
        'relative w-full h-full flex flex-col min-w-0 max-w-none',
        khoang_cach_trong,
        className
      )}
    >
      {co_header ? (
        <header className="flex flex-wrap items-start justify-between gap-6 min-w-0 w-full pt-2">
          <div className="min-w-0 max-w-full flex-1">
            <div className="flex items-center gap-3.5 flex-wrap min-w-0">
              {tieu_de ? (
                <h1 className="text-2xl md:text-3xl font-black text-foreground leading-display tracking-tight">
                  {tieu_de}
                </h1>
              ) : null}
              {badge_tieu_de}
            </div>
            {phu_de ? (
              <p className="text-[15px] text-muted-foreground mt-3 max-w-3xl leading-body font-medium">
                {phu_de}
              </p>
            ) : null}
          </div>
          {hanh_dong_phai ? (
            <div className="shrink-0 inline-flex items-center gap-3">{hanh_dong_phai}</div>
          ) : null}
        </header>
      ) : null}
      <div className={cn('min-w-0 w-full flex flex-col flex-1', khoang_cach_trong)}>{children}</div>
    </section>
  );
}

Bo_Cuc_Trang.displayName = 'Bo_Cuc_Trang';

export default Bo_Cuc_Trang;
