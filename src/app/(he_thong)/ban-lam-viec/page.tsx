'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ListTodo,
  CalendarCheck,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { NoiDungKeHoachNVKD } from '../../../thanh_phan/ke_hoach/NoiDungKeHoachNVKD';
import TrangLichCongTac from '../lich-cong-tac/page';
import NoiDungBaoCaoTuan from '../../../thanh_phan/bao_cao_tuan_vdcd/noi_dung_bao_cao_tuan';

type TabKhuVuc = 'ban_lam_viec' | 'lich_cong_tac' | 'bao_cao_tuan';

function NoiDungBanLamViecHopNhat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get('tab') as TabKhuVuc) || 'ban_lam_viec';

  const [tabHienTai, setTabHienTai] = useState<TabKhuVuc>(() => {
    if (tabParam === 'lich_cong_tac' || tabParam === 'bao_cao_tuan') {
      return tabParam;
    }
    return 'ban_lam_viec';
  });

  const chuyenTab = (tabMoi: TabKhuVuc) => {
    setTabHienTai(tabMoi);
    const params = new URLSearchParams(searchParams.toString());
    if (tabMoi === 'ban_lam_viec') {
      params.delete('tab');
    } else {
      params.set('tab', tabMoi);
    }
    const q = params.toString();
    router.replace(`/ban-lam-viec${q ? `?${q}` : ''}`, { scroll: false });
  };

  return (
    <div className="space-y-4 w-full">
      {/* THANH ĐIỀU HƯỚNG 3-TRONG-1 HỢP NHẤT (BÀN LÀM VIỆC - LỊCH - BÁO CÁO TUẦN) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1">
            <button
              type="button"
              onClick={() => chuyenTab('ban_lam_viec')}
              className={cn(
                'h-8 px-3.5 rounded-lg inline-flex items-center gap-2 transition cursor-pointer',
                tabHienTai === 'ban_lam_viec'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ListTodo className="size-4 text-blue-600" />
              <span>Bàn làm việc (Hôm nay)</span>
            </button>

            <button
              type="button"
              onClick={() => chuyenTab('lich_cong_tac')}
              className={cn(
                'h-8 px-3.5 rounded-lg inline-flex items-center gap-2 transition cursor-pointer',
                tabHienTai === 'lich_cong_tac'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <CalendarCheck className="size-4 text-emerald-600" />
              <span>Lịch công tác (Tuần &amp; Tháng)</span>
            </button>

            <button
              type="button"
              onClick={() => chuyenTab('bao_cao_tuan')}
              className={cn(
                'h-8 px-3.5 rounded-lg inline-flex items-center gap-2 transition cursor-pointer',
                tabHienTai === 'bao_cao_tuan'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <BarChart3 className="size-4 text-[#D11317]" />
              <span>Kế hoạch &amp; Báo cáo tuần</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Dữ liệu tác nghiệp, lịch hẹn &amp; dự án đồng bộ tự động</span>
        </div>
      </div>

      {/* NỘI DUNG TƯƠNG ỨNG VỚI TAB */}
      <div className="w-full min-w-0">
        {tabHienTai === 'ban_lam_viec' && (
          <NoiDungKeHoachNVKD tabKhoiTao="ban_lam_viec" />
        )}
        {tabHienTai === 'lich_cong_tac' && (
          <TrangLichCongTac />
        )}
        {tabHienTai === 'bao_cao_tuan' && (
          <NoiDungBaoCaoTuan />
        )}
      </div>
    </div>
  );
}

export default function TrangBanLamViec() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Đang nạp bàn làm việc...</div>}>
      <NoiDungBanLamViecHopNhat />
    </Suspense>
  );
}
