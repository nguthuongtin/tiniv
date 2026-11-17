'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, FileText, CalendarRange } from 'lucide-react';
import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';
import NoiDungBaoCaoTuan from '../../../thanh_phan/bao_cao_tuan_vdcd/noi_dung_bao_cao_tuan';

export default function TrangBaoCaoTuanPage() {
  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-4">
      {/* THANH ĐIỀU HƯỚNG TINH GỌN & CHUYỂN BÁO CÁO NGÀY / TUẦN */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-2xs flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 w-full sm:w-fit">
          <Link
            href="/bao-cao-cong-viec"
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="size-3.5 text-emerald-600" />
            <span>Báo cáo ngày</span>
          </Link>
          <Link
            href="/bao-cao-tuan"
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-white text-slate-900 font-extrabold text-xs shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CalendarRange className="size-3.5 text-purple-600" />
            <span>Báo cáo tuần</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700">
          <BarChart3 className="size-4 text-[#D11317]" />
          <span>Kế hoạch &amp; Báo cáo tuần chi tiết</span>
        </div>
      </div>

      <NoiDungBaoCaoTuan />
    </Bo_Cuc_Trang>
  );
}
