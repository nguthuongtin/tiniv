'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NoiDungKeHoachNVKD } from '../../../thanh_phan/ke_hoach/NoiDungKeHoachNVKD';
import { NoiDungLichCongTac } from '../../../thanh_phan/lich_gap_kh/noi_dung_lich_cong_tac';

type CheDoXem = 'tuan' | 'thang';

function NoiDungBanLamViecHopNhat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = (searchParams.get('view') as CheDoXem) || (searchParams.get('tab') === 'lich_cong_tac' ? 'thang' : 'tuan');

  const [cheDoXem, setCheDoXem] = useState<CheDoXem>(viewParam === 'thang' ? 'thang' : 'tuan');

  useEffect(() => {
    if (viewParam === 'thang' || viewParam === 'tuan') {
      setCheDoXem(viewParam);
    }
  }, [viewParam]);

  const chuyenCheDoXem = (mode: CheDoXem) => {
    setCheDoXem(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    if (mode === 'tuan') {
      params.delete('view');
    } else {
      params.set('view', mode);
    }
    const q = params.toString();
    router.replace(`/ban-lam-viec${q ? `?${q}` : ''}`, { scroll: false });
  };

  return (
    <div className="w-full min-w-0">
      {cheDoXem === 'tuan' ? (
        <NoiDungKeHoachNVKD
          cheDoXem={cheDoXem}
          onDoiCheDoXem={chuyenCheDoXem}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-card border border-border p-2.5 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Lịch công tác bao quát tháng
              </span>
            </div>
            <div className="inline-flex items-center rounded-xl bg-muted/70 p-1 text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => chuyenCheDoXem('tuan')}
                className="h-8 px-3 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition"
              >
                📅 Tuần tác nghiệp
              </button>
              <button
                type="button"
                onClick={() => chuyenCheDoXem('thang')}
                className="h-8 px-3 rounded-lg bg-card text-foreground shadow-2xs font-bold border border-border/70 cursor-pointer transition"
              >
                📆 Lịch tháng
              </button>
            </div>
          </div>
          <NoiDungLichCongTac cheDoXemMacDinh="thang" anThanh3Tab={true} />
        </div>
      )}
    </div>
  );
}

export default function TrangBanLamViec() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Đang tải bàn làm việc...</div>}>
      <NoiDungBanLamViecHopNhat />
    </Suspense>
  );
}
