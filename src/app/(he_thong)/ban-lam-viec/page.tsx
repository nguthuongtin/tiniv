'use client';

import React, { Suspense } from 'react';
import { NoiDungKeHoachNVKD } from '../../../thanh_phan/ke_hoach/NoiDungKeHoachNVKD';

export default function TrangBanLamViec() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Đang tải bàn làm việc...</div>}>
      <div className="w-full min-w-0">
        <NoiDungKeHoachNVKD tabKhoiTao="ban_lam_viec" />
      </div>
    </Suspense>
  );
}
