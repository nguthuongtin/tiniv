'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

export interface BanVeProps {
  mo: boolean;
  onDong: () => void;
  tieu_de?: React.ReactNode;
  phu_de?: React.ReactNode;
  cuoi?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  khoa_khi_dong_khi_click_ngoai?: boolean;
  kich_thuoc?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const MAP_KICH_THUOC: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full', string> = {
  sm: 'md:max-w-md',
  md: 'md:max-w-[640px]',
  lg: 'md:max-w-3xl',
  xl: 'md:max-w-4xl lg:max-w-5xl',
  '2xl': 'md:max-w-6xl',
  full: 'md:max-w-[95vw]'
};

export const Ban_Ve: React.FC<BanVeProps> = ({
  mo,
  onDong,
  tieu_de,
  phu_de,
  cuoi,
  children,
  className,
  khoa_khi_dong_khi_click_ngoai = true,
  kich_thuoc = 'md'
}) => {
  useEffect(() => {
    if (!mo) return;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDong();
    };
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [mo, onDong]);

  if (!mo) return null;

  const backdrop = khoa_khi_dong_khi_click_ngoai ? onDong : undefined;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
    >
      <div
        onClick={backdrop}
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm animate-in fade-in duration-[var(--animate-duration-200)]"
      />

      <div
        className={cn(
          'relative z-10 w-full bg-background flex flex-col overflow-hidden border border-border shadow-[var(--shadow-pop)]',
          'max-h-[92vh] rounded-t-[var(--radius-pop)] animate-in slide-in-from-bottom-6 duration-[var(--animate-duration-250)]',
          MAP_KICH_THUOC[kich_thuoc],
          'md:mx-auto md:max-h-[88vh] md:rounded-[var(--radius-pop)] md:animate-in md:fade-in md:zoom-in-[0.97] md:duration-[var(--animate-duration-200)]'
        )}
      >
        <div className="mx-auto mt-2 size-1 h-1.5 w-16 shrink-0 rounded-full bg-muted-foreground/20 md:hidden" />
        {renderBody(tieu_de, phu_de, cuoi, children, className, onDong)}
      </div>
    </div>
  );
};

function renderBody(
  tieu_de: React.ReactNode | undefined,
  phu_de: React.ReactNode | undefined,
  cuoi: React.ReactNode | undefined,
  children: React.ReactNode | undefined,
  className: string | undefined,
  onDong: () => void
) {
  return (
    <>
      {(tieu_de || phu_de) && (
        <div className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 md:py-5 shrink-0 border-b border-border">
          <div className="min-w-0 flex-1 space-y-1">
          {tieu_de ? (
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              {tieu_de}
            </h2>
          ) : null}
          {phu_de ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{phu_de}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDong}
          className="size-9 rounded-[var(--radius-button)] border border-border bg-background hover:bg-muted text-muted-foreground shrink-0 inline-flex items-center justify-center transition"
          aria-label="Dong"
        >
          <X className="size-4" />
        </button>
      </div>
    )}
    <div className={cn('flex-1 min-h-0 overflow-y-auto px-5 md:px-6 py-5 md:py-6', className)}>
      {children}
    </div>
    {cuoi ? (
      <div className="shrink-0 px-5 md:px-6 py-4 border-t border-border bg-muted/40 flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2 sm:gap-3">
        {cuoi}
      </div>
    ) : null}
  </>
  );
}

export default Ban_Ve;
