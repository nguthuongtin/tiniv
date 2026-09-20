'use client';

import * as React from 'react';
import { cn } from '../../thu_vien/utils/cn';

interface ToLichNgayProps {
  ngayStr: string;
  kichThuoc?: 'sm' | 'md' | 'lg';
  noiBat?: boolean;
  trangThai?: 'tam_luu' | 'da_gui' | 'chua_nop';
  className?: string;
}

const THU_TIENG_VIET = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const THU_TIENG_VIET_NGAN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function ToLichNgay({
  ngayStr,
  kichThuoc = 'md',
  noiBat = false,
  trangThai,
  className
}: ToLichNgayProps) {
  const d = React.useMemo(() => {
    if (!ngayStr) return new Date();
    const parts = ngayStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(ngayStr);
  }, [ngayStr]);

  const ngay = isNaN(d.getTime()) ? '--' : d.getDate();
  const thang = isNaN(d.getTime()) ? '' : `Thg ${d.getMonth() + 1}`;
  const nam = isNaN(d.getTime()) ? '' : d.getFullYear();
  const thu = isNaN(d.getTime()) ? '' : THU_TIENG_VIET[d.getDay()];
  const thuNgan = isNaN(d.getTime()) ? '' : THU_TIENG_VIET_NGAN[d.getDay()];

  const mauHeader = trangThai === 'tam_luu'
    ? 'bg-[#FF9500]'
    : trangThai === 'chua_nop'
    ? 'bg-[#FF3B30]'
    : noiBat
    ? 'bg-[#007AFF]'
    : 'bg-[#FF3B30]';

  if (kichThuoc === 'sm') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-between rounded-xl border overflow-hidden shrink-0 shadow-xs select-none w-11 h-12 text-center bg-card transition',
          noiBat ? 'border-primary ring-2 ring-primary/20' : 'border-border/80',
          className
        )}
        title={`Ngày ${ngay}/${d.getMonth() + 1}/${nam} (${thu})`}
      >
        <div className={cn('w-full py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white', mauHeader)}>
          {thang}
        </div>
        <div className="flex-1 flex items-center justify-center -my-0.5">
          <span className="text-base font-black text-foreground tabular-nums leading-none tracking-tight">
            {ngay}
          </span>
        </div>
        <div className="w-full pb-0.5 text-[8px] font-bold text-muted-foreground uppercase leading-none">
          {thuNgan}
        </div>
      </div>
    );
  }

  if (kichThuoc === 'lg') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-between rounded-2xl border-2 overflow-hidden shrink-0 shadow-sm select-none w-16 h-18 text-center bg-card transition',
          noiBat ? 'border-primary ring-4 ring-primary/15' : 'border-border/80',
          className
        )}
        title={`Ngày ${ngay}/${d.getMonth() + 1}/${nam} (${thu})`}
      >
        <div className={cn('w-full py-1 text-[10px] font-black uppercase tracking-wider text-white', mauHeader)}>
          {thang} / {nam}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-2xl font-black text-foreground tabular-nums leading-none tracking-tight">
            {ngay}
          </span>
        </div>
        <div className="w-full pb-1 text-[9.5px] font-bold text-muted-foreground uppercase leading-none">
          {thu}
        </div>
      </div>
    );
  }

  // Mặc định: 'md'
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between rounded-xl border overflow-hidden shrink-0 shadow-xs select-none w-13 h-14 text-center bg-card transition',
        noiBat ? 'border-primary ring-2 ring-primary/20' : 'border-border/80',
        className
      )}
      title={`Ngày ${ngay}/${d.getMonth() + 1}/${nam} (${thu})`}
    >
      <div className={cn('w-full py-0.5 text-[9px] font-black uppercase tracking-wider text-white', mauHeader)}>
        {thang}
      </div>
      <div className="flex-1 flex items-center justify-center -my-0.5">
        <span className="text-lg font-black text-foreground tabular-nums leading-none tracking-tight">
          {ngay}
        </span>
      </div>
      <div className="w-full pb-0.5 text-[8.5px] font-bold text-muted-foreground uppercase leading-none">
        {thu}
      </div>
    </div>
  );
}

export default ToLichNgay;
