'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';

export type MauSoLieu =
  | 'mac_dinh'
  | 'thanh_cong'
  | 'canh_bao'
  | 'loi'
  | 'thong_tin'
  | 'trang'
  | 'xanh'
  | 'xanh_la'
  | 'xanh_ngoc'
  | 'xanh_duong'
  | 'vang'
  | 'do';

export interface MucSoLieu {
  khoa?: string;
  id?: string;
  nhan: string;
  nhan_ngan?: string;
  gia_tri?: number | string;
  so_lieu?: number | string;
  icon: LucideIcon;
  mau?: MauSoLieu;
  mau_so?: MauSoLieu;
  dang_chon?: boolean;
  khi_bam?: () => void;
}

const MAU_CHUAN: Record<string, { so: string; icon: string; vien_chon: string }> = {
  mac_dinh: {
    so: 'text-white',
    icon: 'bg-white/10 text-emerald-200 border-white/10',
    vien_chon: 'border-emerald-300/40'
  },
  trang: {
    so: 'text-white',
    icon: 'bg-white/10 text-emerald-200 border-white/10',
    vien_chon: 'border-emerald-300/40'
  },
  thanh_cong: {
    so: 'text-emerald-300',
    icon: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/20',
    vien_chon: 'border-emerald-300/40'
  },
  xanh: {
    so: 'text-emerald-300',
    icon: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/20',
    vien_chon: 'border-emerald-300/40'
  },
  xanh_la: {
    so: 'text-emerald-300',
    icon: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/20',
    vien_chon: 'border-emerald-300/40'
  },
  canh_bao: {
    so: 'text-amber-300',
    icon: 'bg-amber-400/20 text-amber-300 border-amber-400/20',
    vien_chon: 'border-amber-300/40'
  },
  vang: {
    so: 'text-amber-300',
    icon: 'bg-amber-400/20 text-amber-300 border-amber-400/20',
    vien_chon: 'border-amber-300/40'
  },
  loi: {
    so: 'text-rose-300',
    icon: 'bg-rose-400/20 text-rose-300 border-rose-400/20',
    vien_chon: 'border-rose-300/40'
  },
  do: {
    so: 'text-rose-300',
    icon: 'bg-rose-400/20 text-rose-300 border-rose-400/20',
    vien_chon: 'border-rose-300/40'
  },
  thong_tin: {
    so: 'text-sky-300',
    icon: 'bg-sky-400/20 text-sky-300 border-sky-400/20',
    vien_chon: 'border-sky-300/40'
  },
  xanh_duong: {
    so: 'text-sky-300',
    icon: 'bg-sky-400/20 text-sky-300 border-sky-400/20',
    vien_chon: 'border-sky-300/40'
  },
  xanh_ngoc: {
    so: 'text-teal-200',
    icon: 'bg-teal-400/20 text-teal-200 border-teal-400/20',
    vien_chon: 'border-teal-300/40'
  }
};

export interface ThanhSoLieuProps {
  muc?: MucSoLieu[];
  items?: MucSoLieu[];
  className?: string;
}

export function ThanhSoLieu({ muc, items, className }: ThanhSoLieuProps) {
  const ds = muc ?? items ?? [];
  return (
    <div
      className={cn('rounded-card sm:rounded-2xl bg-nen-banner p-2.5 sm:p-3.5 shadow-nhe', className)}
    >
      <div
        className="grid gap-1.5 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${ds.length}, minmax(0, 1fr))` }}
      >
        {ds.map((m, idx) => {
          const kieuMau = m.mau ?? m.mau_so ?? 'mac_dinh';
          const mau = MAU_CHUAN[kieuMau] ?? MAU_CHUAN.mac_dinh;
          const Icon = m.icon;
          const giaTri = m.gia_tri ?? m.so_lieu ?? 0;
          const lopKhung = cn(
            'min-w-0 rounded-2xl border px-1 py-2 sm:p-3.5 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-3',
            'text-center sm:text-left transition',
            m.khi_bam && 'active:scale-95 cursor-pointer',
            m.dang_chon
              ? cn('bg-banner-o-chon', mau.vien_chon)
              : cn('bg-banner-o border-transparent', m.khi_bam && 'hover:bg-banner-o-hover')
          );
          const noiDung = (
            <>
              <span
                className={cn(
                  'hidden sm:flex size-10 rounded-xl border items-center justify-center shrink-0',
                  mau.icon
                )}
              >
                <Icon className="size-5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex flex-col items-center sm:items-start">
                <span
                  className={cn(
                    'order-1 sm:order-2 text-tieu-de sm:text-trang font-extrabold tabular-nums leading-none sm:mt-1',
                    mau.so
                  )}
                >
                  {giaTri}
                </span>
                <span className="order-2 sm:order-1 text-nhan text-emerald-100/80 whitespace-nowrap sm:uppercase sm:tracking-wider truncate max-w-full mt-0.5 sm:mt-0">
                  <span className="sm:hidden">{m.nhan_ngan ?? m.nhan}</span>
                  <span className="hidden sm:inline">{m.nhan}</span>
                </span>
              </span>
            </>
          );

          if (m.khi_bam) {
            return (
              <button
                key={m.khoa ?? m.id ?? idx}
                type="button"
                onClick={m.khi_bam}
                className={lopKhung}
              >
                {noiDung}
              </button>
            );
          }

          return (
            <div key={m.khoa ?? m.id ?? idx} className={lopKhung}>
              {noiDung}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThanhSoLieu;
