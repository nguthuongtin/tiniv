'use client';

import React, { Suspense } from 'react';
import { NoiDungLichCongTac } from '../../../thanh_phan/lich_gap_kh/noi_dung_lich_cong_tac';

export default function TrangLichCongTac() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Đang tải lịch công tác...</div>}>
      <NoiDungLichCongTac anThanh3Tab={true} />
    </Suspense>
  );
}
