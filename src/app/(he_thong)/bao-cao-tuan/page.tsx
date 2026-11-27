'use client';

import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';
import NoiDungBaoCaoTuan from '../../../thanh_phan/bao_cao_tuan_vdcd/noi_dung_bao_cao_tuan';

export default function TrangBaoCaoTuanPage() {
  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4">
      <NoiDungBaoCaoTuan />
    </Bo_Cuc_Trang>
  );
}
