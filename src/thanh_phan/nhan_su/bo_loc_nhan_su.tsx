'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { DieuKienLocNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';

interface BoLocNhanSuProps {
  boLocHienTai: DieuKienLocNhanSu;
  onChange: (boLocMoi: DieuKienLocNhanSu) => void;
  onLamMoi?: () => void;
  onThemMoi?: () => void;
  danhSachChiNhanh?: { id: string; ten_chi_nhanh: string }[];
  danhSachPhongBan?: { id: string; ten_phong_ban: string }[];
  danhSachVaiTro?: { id: string; ten_vai_tro: string }[];
}

const BO_LOC_MAC_DINH: DieuKienLocNhanSu = {
  tuKhoa: null,
  vai_tro: 'tat_ca',
  chi_nhanh_id: null,
  phong_ban_id: null,
  trang_thai_tk: 'tat_ca',
  trang_thai_hoat_dong: 'tat_ca',
  trang_thai_du_lieu: 'hoat_dong',
  ngay_tao_tu_ngay: null,
  ngay_tao_den_ngay: null
};

const demDieuKienThem = (bl: DieuKienLocNhanSu): number => {
  let dem = 0;
  if (bl.chi_nhanh_id) dem++;
  if (bl.phong_ban_id) dem++;
  if (bl.trang_thai_hoat_dong && bl.trang_thai_hoat_dong !== 'tat_ca') dem++;
  if (bl.ngay_tao_tu_ngay) dem++;
  if (bl.ngay_tao_den_ngay) dem++;
  if (bl.trang_thai_du_lieu && bl.trang_thai_du_lieu !== 'hoat_dong') dem++;
  return dem;
};

export default function BoLocNhanSu(props: BoLocNhanSuProps) {
  const {
    boLocHienTai,
    onChange,
    onLamMoi,
    onThemMoi,
    danhSachChiNhanh = [],
    danhSachPhongBan = [],
    danhSachVaiTro = []
  } = props;
  const [moMoRong, setMoMoRong] = useState(false);
  const soDieuKien = demDieuKienThem(boLocHienTai);

  const capNhatMotTruong = <K extends keyof DieuKienLocNhanSu>(
    key: K,
    value: DieuKienLocNhanSu[K]
  ) => {
    onChange({ ...boLocHienTai, [key]: value });
  };

  const datLai = () => {
    onChange({ ...BO_LOC_MAC_DINH });
    onLamMoi?.();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={boLocHienTai.tuKhoa ?? ''}
            onChange={(e) => capNhatMotTruong('tuKhoa', e.target.value || null)}
            placeholder="Tìm kiếm: Họ tên, Mã NV, Email, SĐT, Chức vụ…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition"
          />
          {boLocHienTai.tuKhoa && (
            <button
              type="button"
              onClick={() => capNhatMotTruong('tuKhoa', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center md:gap-2 md:shrink-0">
          <select
            value={boLocHienTai.vai_tro ?? 'tat_ca'}
            onChange={(e) => capNhatMotTruong('vai_tro', (e.target.value as any) || 'tat_ca')}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
          >
            <option value="tat_ca">Tất cả vai trò</option>
            {danhSachVaiTro.map((v) => (
              <option key={v.id} value={v.id}>{v.ten_vai_tro}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setMoMoRong((x) => !x)}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition',
              moMoRong || soDieuKien > 0
                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc thêm
            {soDieuKien > 0 && (
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {soDieuKien}
              </span>
            )}
            <ChevronDown className={cn('size-4 transition', moMoRong && 'rotate-180')} />
          </button>

          <button
            type="button"
            onClick={datLai}
            className="col-span-2 md:col-span-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <X className="size-4" />
            Đặt lại
          </button>

          {onThemMoi && (
            <button
              type="button"
              onClick={onThemMoi}
              className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm font-bold shadow-sm transition shrink-0"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Thêm nhân viên</span>
            </button>
          )}
        </div>
      </div>

      {moMoRong && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Chi nhánh</label>
            <select
              value={boLocHienTai.chi_nhanh_id ?? ''}
              onChange={(e) => capNhatMotTruong('chi_nhanh_id', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            >
              <option value="">Tất cả chi nhánh</option>
              {danhSachChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>{cn.ten_chi_nhanh}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Phòng ban</label>
            <select
              value={boLocHienTai.phong_ban_id ?? ''}
              onChange={(e) => capNhatMotTruong('phong_ban_id', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            >
              <option value="">Tất cả phòng ban</option>
              {danhSachPhongBan.map((pb) => (
                <option key={pb.id} value={pb.id}>{pb.ten_phong_ban}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Trạng thái tài khoản</label>
            <select
              value={boLocHienTai.trang_thai_hoat_dong ?? 'tat_ca'}
              onChange={(e) => capNhatMotTruong('trang_thai_hoat_dong', (e.target.value as any) || 'tat_ca')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            >
              <option value="tat_ca">Hiển thị tất cả</option>
              <option value="hoat_dong">Chỉ hoạt động</option>
              <option value="khoa">Chỉ đã khóa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Dữ liệu</label>
            <select
              value={boLocHienTai.trang_thai_du_lieu ?? 'hoat_dong'}
              onChange={(e) => capNhatMotTruong('trang_thai_du_lieu', (e.target.value as any) || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            >
              <option value="hoat_dong">Không hiển thị đã xóa</option>
              <option value="tat_ca">Hiển thị cả đã xóa</option>
              <option value="da_xoa">Chỉ đã xóa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Ngày tạo (từ)</label>
            <input
              type="date"
              value={boLocHienTai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Ngày tạo (đến)</label>
            <input
              type="date"
              value={boLocHienTai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
