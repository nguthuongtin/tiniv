'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';

type GiaTriTabs = string;

export interface BoCacProps {
  children?: React.ReactNode;
  gia_tri_mac_dinh?: GiaTriTabs;
  gia_tri?: GiaTriTabs;
  on_gia_tri_thay_doi?: (gia_tri: GiaTriTabs) => void;
  className?: string;
}

const NguCanhTabs = React.createContext<{
  gia_tri: GiaTriTabs;
  chon: (gia_tri: GiaTriTabs) => void;
} | null>(null);

export const BoCacTab = ({
  children,
  gia_tri_mac_dinh,
  gia_tri: giaTriKiemSoat,
  on_gia_tri_thay_doi,
  className
}: BoCacProps) => {
  const [gia_tri_ben_trong, dat_gia_tri_ben_trong] = React.useState<GiaTriTabs>(gia_tri_mac_dinh ?? '');
  const gia_tri = giaTriKiemSoat ?? gia_tri_ben_trong;
  const chon = React.useCallback(
    (gt: GiaTriTabs) => {
      if (giaTriKiemSoat === undefined) dat_gia_tri_ben_trong(gt);
      on_gia_tri_thay_doi?.(gt);
    },
    [giaTriKiemSoat, on_gia_tri_thay_doi]
  );
  return (
    <NguCanhTabs.Provider value={{ gia_tri, chon }}>
      <div className={cn('w-full', className)}>{children}</div>
    </NguCanhTabs.Provider>
  );
};

export const DanhSachNutTab = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DanhSachNutTab.displayName = 'DanhSachNutTab';

export const NutTab = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { gia_tri: GiaTriTabs; kich_hoat?: boolean; so_luong?: React.ReactNode; icon_trai?: React.ComponentType<{ className?: string }> }
>(({ className, gia_tri, so_luong, icon_trai: Icon, children, onClick, ...props }, ref) => {
  const ctx = React.useContext(NguCanhTabs);
  const active = props.kich_hoat ?? (ctx && ctx.gia_tri === gia_tri);
  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={active ? true : undefined}
      onClick={(e) => {
        onClick?.(e);
        ctx?.chon(gia_tri);
      }}
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all shrink-0 active:scale-95',
        active
          ? 'bg-white text-slate-900 shadow-xs shadow-black/5 font-bold'
          : 'text-slate-500 hover:text-slate-800 hover:bg-white/40',
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span>{children}</span>
      {so_luong !== undefined && so_luong !== null && (
        <span
          className={cn(
            'h-5 min-w-[20px] px-1.5 rounded-full text-[10px] inline-flex items-center justify-center font-bold',
            active ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-slate-200 text-slate-600'
          )}
        >
          {so_luong}
        </span>
      )}
    </button>
  );
});
NutTab.displayName = 'NutTab';

export const NoiDungTab = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { gia_tri: GiaTriTabs }
>(({ className, gia_tri, children, ...props }, ref) => {
  const ctx = React.useContext(NguCanhTabs);
  const hien_thi = ctx ? ctx.gia_tri === gia_tri : true;
  if (!hien_thi) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('mt-4 focus:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
});
NoiDungTab.displayName = 'NoiDungTab';

export default BoCacTab;
