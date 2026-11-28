'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { ArrowUpDown, Filter, MoreVertical, Search, X, XCircle } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Ban_Ve } from './ban_ve';
import { Nut } from './nut';

function useLaMobile(): boolean {
  const [laMobile, setLaMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const capNhat = () => setLaMobile(mq.matches);
    capNhat();
    mq.addEventListener('change', capNhat);
    return () => mq.removeEventListener('change', capNhat);
  }, []);

  return laMobile;
}

export interface ChipLocNhanh {
  khoa: string;
  nhan: string;
  dang_chon: boolean;
  khi_bam: () => void;
}

export interface TuyChonSapXep {
  gia_tri: string;
  nhan: string;
}

export interface ThanhLocChuanProps {
  tu_khoa: string;
  khi_doi_tu_khoa: (giaTri: string) => void;
  placeholder?: string;
  so_dieu_kien?: number;
  khi_xoa_tat_ca?: () => void;
  chips_nhanh?: ChipLocNhanh[];
  sap_xep?: {
    gia_tri: string;
    mac_dinh?: string;
    khi_doi: (giaTri: string) => void;
    tuy_chon: TuyChonSapXep[];
    aria_label?: string;
  };
  tieu_de_bo_loc?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Thanh tìm kiếm & lọc chuẩn mobile-first:
 * - 1 hàng tìm kiếm + sắp xếp + nút phễu lọc (vùng chạm 44px, font >= 16px trên mobile).
 * - 1 hàng chip lọc nhanh cuộn ngang (nếu có).
 * - Bộ lọc chi tiết mở dạng Bottom Sheet trên mobile, lưới inline trên desktop.
 */
export function ThanhLocChuan({
  tu_khoa,
  khi_doi_tu_khoa,
  placeholder = 'Tìm kiếm...',
  so_dieu_kien = 0,
  khi_xoa_tat_ca,
  chips_nhanh,
  sap_xep,
  tieu_de_bo_loc = 'Bộ lọc chi tiết',
  children,
  className
}: ThanhLocChuanProps) {
  const [moRong, setMoRong] = useState(false);
  const laMobile = useLaMobile();
  const sapXepKhacMacDinh = sap_xep ? sap_xep.gia_tri !== (sap_xep.mac_dinh ?? '') : false;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tu_khoa}
            onChange={(e) => khi_doi_tu_khoa(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 rounded-full sm:rounded-2xl border border-slate-200/90 bg-white pl-10 pr-10 text-base sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-nhe transition"
          />
          {tu_khoa && (
            <button
              type="button"
              onClick={() => khi_doi_tu_khoa('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {sap_xep && (
          <div
            className={cn(
              'relative size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0',
              sapXepKhacMacDinh
                ? 'bg-emerald-50 border-emerald-300 text-primary'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-nhe'
            )}
            title="Sắp xếp danh sách"
          >
            <ArrowUpDown className="size-[18px] pointer-events-none" />
            <select
              value={sap_xep.gia_tri}
              onChange={(e) => sap_xep.khi_doi(e.target.value)}
              aria-label={sap_xep.aria_label ?? 'Sắp xếp danh sách'}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {sap_xep.tuy_chon.map((tc) => (
                <option key={tc.gia_tri} value={tc.gia_tri}>
                  {tc.nhan}
                </option>
              ))}
            </select>
          </div>
        )}

        {children && (
          <button
            type="button"
            onClick={() => setMoRong((m) => !m)}
            title={moRong ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
            aria-label={tieu_de_bo_loc}
            className={cn(
              'relative size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0 cursor-pointer',
              moRong || so_dieu_kien > 0
                ? 'bg-[#107555] border-[#107555] text-white shadow-sm shadow-emerald-700/20'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-nhe'
            )}
          >
            <Filter className="size-[18px]" />
            {so_dieu_kien > 0 && (
              <span
                className={cn(
                  'absolute -top-1 -right-1 size-5 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white',
                  moRong ? 'bg-amber-400 text-slate-900' : 'bg-[#107555] text-white'
                )}
              >
                {so_dieu_kien}
              </span>
            )}
          </button>
        )}

        {so_dieu_kien > 0 && khi_xoa_tat_ca && (
          <button
            type="button"
            onClick={khi_xoa_tat_ca}
            title="Xóa tất cả điều kiện lọc"
            aria-label="Xóa tất cả điều kiện lọc"
            className="hidden sm:flex size-11 rounded-2xl border border-rose-200/80 bg-rose-50/60 items-center justify-center text-rose-600 hover:bg-rose-100/60 transition active:scale-[0.95] shrink-0 cursor-pointer"
          >
            <XCircle className="size-5" />
          </button>
        )}
      </div>

      {chips_nhanh && chips_nhanh.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {chips_nhanh.map((chip) => (
            <button
              key={chip.khoa}
              type="button"
              onClick={chip.khi_bam}
              className={cn(
                'h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition active:scale-95 cursor-pointer',
                chip.dang_chon
                  ? 'bg-[#107555] text-white border-[#107555] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
              )}
            >
              {chip.nhan}
            </button>
          ))}
        </div>
      )}

      {children && moRong && !laMobile && (
        <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5 rounded-[24px] border border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          {children}
        </div>
      )}

      {children && laMobile && (
        <Ban_Ve
          mo={moRong}
          onDong={() => setMoRong(false)}
          tieu_de={tieu_de_bo_loc}
          cuoi={
            <div className="flex items-center gap-2 w-full">
              {khi_xoa_tat_ca && (
                <Nut
                  kieu="outline"
                  kich_thuoc="md"
                  className="flex-1"
                  onClick={() => {
                    khi_xoa_tat_ca();
                    setMoRong(false);
                  }}
                >
                  Đặt lại
                </Nut>
              )}
              <Nut
                kieu="primary"
                kich_thuoc="md"
                className="flex-1"
                onClick={() => setMoRong(false)}
              >
                Áp dụng
              </Nut>
            </div>
          }
        >
          <div className="grid gap-4">{children}</div>
        </Ban_Ve>
      )}
    </div>
  );
}

export interface MucHanhDongMobile {
  khoa: string;
  nhan: string;
  icon?: React.ComponentType<{ className?: string }>;
  khi_bam: () => void;
  nguy_hiem?: boolean;
}

/**
 * NútOverflow `⋯` gom các hành động phụ trên mobile vào Action Sheet.
 */
export function MenuHanhDongMobile({
  tieu_de = 'Tùy chọn',
  muc,
  className
}: {
  tieu_de?: string;
  muc: MucHanhDongMobile[];
  className?: string;
}) {
  const [mo, setMo] = useState(false);

  if (muc.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setMo(true)}
        aria-label={tieu_de}
        className={cn(
          'sm:hidden size-10 rounded-xl border border-slate-200 bg-white text-slate-700 inline-flex items-center justify-center active:scale-95 transition cursor-pointer',
          className
        )}
      >
        <MoreVertical className="size-4.5" />
      </button>

      <Ban_Ve mo={mo} onDong={() => setMo(false)} tieu_de={tieu_de} kich_thuoc="sm">
        <div className="flex flex-col gap-2">
          {muc.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.khoa}
                type="button"
                onClick={() => {
                  setMo(false);
                  m.khi_bam();
                }}
                className={cn(
                  'w-full h-12 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center gap-3 text-sm font-semibold text-left transition active:scale-[0.99] cursor-pointer',
                  m.nguy_hiem ? 'text-rose-600' : 'text-slate-800'
                )}
              >
                {Icon ? <Icon className="size-4.5 shrink-0 text-slate-500" /> : null}
                <span>{m.nhan}</span>
              </button>
            );
          })}
        </div>
      </Ban_Ve>
    </>
  );
}
