import type { Metadata } from 'next';
import BangKeHoachTuanMoi from '../../../thanh_phan/ke_hoach_moi/bang_ke_hoach_tuan_moi';

export const metadata: Metadata = {
  title: 'Kế hoạch & Báo cáo Tuần (Mới) - TiniPMS'
};

export default function TrangKeHoachTuanMoi() {
  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-16">
      <BangKeHoachTuanMoi />
    </div>
  );
}
