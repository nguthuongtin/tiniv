'use client';

import { ThanhLocChuan } from '../ui';
import type { DieuKienLocBaoCaoCongViec } from '../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';

interface BoLocBaoCaoCongViecProps {
  boLocHienTai: DieuKienLocBaoCaoCongViec;
  onChange: (boLocMoi: DieuKienLocBaoCaoCongViec) => void;
  onLamMoi?: () => void;
  danhSachDuAn?: { id: string; ten_du_an: string }[];
  danhSachNhanVien?: { id: string; ho_ten: string }[];
}

const BO_LOC_MAC_DINH: DieuKienLocBaoCaoCongViec = {
  tuKhoa: null,
  nhan_vien_id: null,
  du_an_id: null,
  trang_thai_du_lieu: 'hoat_dong',
  ngay_bao_cao_tu_ngay: null,
  ngay_bao_cao_den_ngay: null,
  ngay_tao_tu_ngay: null,
  ngay_tao_den_ngay: null
};

const demDieuKienThem = (bl: DieuKienLocBaoCaoCongViec): number => {
  let dem = 0;
  if (bl.du_an_id) dem++;
  if (bl.nhan_vien_id) dem++;
  if (bl.ngay_bao_cao_tu_ngay) dem++;
  if (bl.ngay_bao_cao_den_ngay) dem++;
  if (bl.ngay_tao_tu_ngay) dem++;
  if (bl.ngay_tao_den_ngay) dem++;
  if (bl.trang_thai_du_lieu && bl.trang_thai_du_lieu !== 'hoat_dong') dem++;
  return dem;
};

export default function BoLocBaoCaoCongViec(props: BoLocBaoCaoCongViecProps) {
  const { boLocHienTai, onChange, onLamMoi, danhSachDuAn = [], danhSachNhanVien = [] } = props;
  const soDieuKien = demDieuKienThem(boLocHienTai);

  const capNhatMotTruong = <K extends keyof DieuKienLocBaoCaoCongViec>(
    key: K,
    value: DieuKienLocBaoCaoCongViec[K]
  ) => {
    onChange({ ...boLocHienTai, [key]: value });
  };

  const datLai = () => {
    onChange({ ...BO_LOC_MAC_DINH });
    onLamMoi?.();
  };

  return (
    <ThanhLocChuan
      tu_khoa={boLocHienTai.tuKhoa ?? ''}
      khi_doi_tu_khoa={(v) => capNhatMotTruong('tuKhoa', v || null)}
      placeholder="Tìm nội dung công việc, khó khăn..."
      so_dieu_kien={soDieuKien}
      khi_xoa_tat_ca={datLai}
      tieu_de_bo_loc="Bộ lọc báo cáo công việc"
      className="mb-3 sm:mb-5"
    >
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nhân viên</label>
        <select
          value={boLocHienTai.nhan_vien_id ?? ''}
          onChange={(e) => capNhatMotTruong('nhan_vien_id', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        >
          <option value="">Tất cả nhân viên</option>
          {danhSachNhanVien.map((nv) => (
            <option key={nv.id} value={nv.id}>{nv.ho_ten}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dự án liên quan</label>
        <select
          value={boLocHienTai.du_an_id ?? ''}
          onChange={(e) => capNhatMotTruong('du_an_id', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        >
          <option value="">Tất cả dự án</option>
          {danhSachDuAn.map((da) => (
            <option key={da.id} value={da.id}>{da.ten_du_an}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái dữ liệu</label>
        <select
          value={boLocHienTai.trang_thai_du_lieu ?? 'hoat_dong'}
          onChange={(e) => capNhatMotTruong('trang_thai_du_lieu', (e.target.value as DieuKienLocBaoCaoCongViec['trang_thai_du_lieu']) || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        >
          <option value="hoat_dong">Đang hoạt động</option>
          <option value="tat_ca">Tất cả</option>
          <option value="da_xoa">Đã xóa tạm</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày báo cáo (từ ngày)</label>
        <input
          type="date"
          value={boLocHienTai.ngay_bao_cao_tu_ngay ?? ''}
          onChange={(e) => capNhatMotTruong('ngay_bao_cao_tu_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày báo cáo (đến ngày)</label>
        <input
          type="date"
          value={boLocHienTai.ngay_bao_cao_den_ngay ?? ''}
          onChange={(e) => capNhatMotTruong('ngay_bao_cao_den_ngay', e.target.value || null)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        />
      </div>
    </ThanhLocChuan>
  );
}
