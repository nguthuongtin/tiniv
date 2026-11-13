'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react';
import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';
import NoiDungBaoCaoTuan from '../../../thanh_phan/bao_cao_tuan_vdcd/noi_dung_bao_cao_tuan';

export default function TrangBaoCaoTuanPage() {
  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4">
      {/* THANH ĐIỀU HƯỚNG TINH GỌN */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/ban-lam-viec"
            className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Về Bàn làm việc &amp; Lịch tác nghiệp</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <BarChart3 className="size-4 text-[#D11317]" />
            <span>Kế hoạch &amp; Báo cáo tuần chi tiết (Dòng tiền &amp; Dự án VDCD)</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Dữ liệu đồng bộ tự động từ Bàn làm việc &amp; Hoạt động CRM</span>
        </div>
      </div>

      <NoiDungBaoCaoTuan />
    </Bo_Cuc_Trang>
  );
}
