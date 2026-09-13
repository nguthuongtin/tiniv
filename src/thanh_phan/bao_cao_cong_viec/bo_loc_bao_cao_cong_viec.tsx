'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
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
  const [moMoRong, setMoMoRong] = useState(false);
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
    <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={boLocHienTai.tuKhoa ?? ''}
            onChange={(e) => capNhatMotTruong('tuKhoa', e.target.value || null)}
            placeholder="Tìm kiếm nội dung công việc, khó khăn..."
            className="w-full pl-10 pr-9 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:border-primary transition"
          />
          {boLocHienTai.tuKhoa && (
            <button
              type="button"
              onClick={() => capNhatMotTruong('tuKhoa', null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMoMoRong((x) => !x)}
            className={cn(
              'relative inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-input)] border text-sm font-semibold transition',
              moMoRong || soDieuKien > 0
                ? 'bg-primary/10 border-primary/25 text-primary'
                : 'bg-background border-border text-foreground hover:bg-muted/50'
            )}
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc
            {soDieuKien > 0 && (
              <span className="inline-flex items-center justify-center size-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {soDieuKien}
              </span>
            )}
            <ChevronDown className={cn('size-3.5 transition', moMoRong && 'rotate-180')} />
          </button>

          {soDieuKien > 0 && (
            <button
              type="button"
              onClick={datLai}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-input)] border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
            >
              <X className="size-3.5" />
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {moMoRong && (
        <div className="mt-4 pt-4 border-t border-border grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nhân viên</label>
            <select
              value={boLocHienTai.nhan_vien_id ?? ''}
              onChange={(e) => capNhatMotTruong('nhan_vien_id', e.target.value || null)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:bg-background focus:border-primary transition"
            >
              <option value="">Tất cả nhân viên</option>
              {danhSachNhanVien.map((nv) => (
                <option key={nv.id} value={nv.id}>{nv.ho_ten}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Dự án liên quan</label>
            <select
              value={boLocHienTai.du_an_id ?? ''}
              onChange={(e) => capNhatMotTruong('du_an_id', e.target.value || null)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:bg-background focus:border-primary transition"
            >
              <option value="">Tất cả dự án</option>
              {danhSachDuAn.map((da) => (
                <option key={da.id} value={da.id}>{da.ten_du_an}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Trạng thái dữ liệu</label>
            <select
              value={boLocHienTai.trang_thai_du_lieu ?? 'hoat_dong'}
              onChange={(e) => capNhatMotTruong('trang_thai_du_lieu', (e.target.value as any) || null)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:bg-background focus:border-primary transition"
            >
              <option value="hoat_dong">Đang hoạt động</option>
              <option value="tat_ca">Tất cả</option>
              <option value="da_xoa">Đã xóa tạm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngày báo cáo (từ ngày)</label>
            <input
              type="date"
              value={boLocHienTai.ngay_bao_cao_tu_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_bao_cao_tu_ngay', e.target.value || null)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:bg-background focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Ngày báo cáo (đến ngày)</label>
            <input
              type="date"
              value={boLocHienTai.ngay_bao_cao_den_ngay ?? ''}
              onChange={(e) => capNhatMotTruong('ngay_bao_cao_den_ngay', e.target.value || null)}
              className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:bg-background focus:border-primary transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
