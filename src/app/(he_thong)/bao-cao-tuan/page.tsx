'use client';

import Link from 'next/link';
import { ListTodo, CalendarCheck, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';
import NoiDungBaoCaoTuan from '../../../thanh_phan/bao_cao_tuan_vdcd/noi_dung_bao_cao_tuan';

export default function TrangBaoCaoTuanPage() {
  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4">
      {/* THANH ĐIỀU HƯỚNG 3-TRONG-1 HỢP NHẤT */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1">
            <Link
              href="/ban-lam-viec?tab=ban_lam_viec"
              className="h-8 px-3.5 rounded-lg inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <CalendarCheck className="size-4 text-blue-600" />
              <span>Bàn làm việc &amp; Lịch tuần</span>
            </Link>

            <Link
              href="/ban-lam-viec?tab=lich_cong_tac"
              className="h-8 px-3.5 rounded-lg inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <Calendar className="size-4 text-emerald-600" />
              <span>Lịch tháng</span>
            </Link>

            <div
              className="h-8 px-3.5 rounded-lg inline-flex items-center gap-2 bg-white text-slate-900 shadow-2xs font-bold"
            >
              <BarChart3 className="size-4 text-[#D11317]" />
              <span>Kế hoạch &amp; Báo cáo tuần</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Dữ liệu tác nghiệp, lịch hẹn &amp; dự án đồng bộ tự động</span>
        </div>
      </div>

      <NoiDungBaoCaoTuan />
    </Bo_Cuc_Trang>
  );
}
