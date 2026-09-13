'use client';

import { Filter, Search, XCircle, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { DieuKienLocKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import type { LoaiKhachHang } from '../../thu_vien/types/khach_hang';

import type { ChiNhanh, NhanSu } from '../../thu_vien/types/nhan_su';

const CAC_LOAI_KH: Array<{ gia_tri: 'tat_ca' | LoaiKhachHang; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả loại' },
  { gia_tri: 'doanh_nghiep', nhan: 'Doanh nghiệp' },
  { gia_tri: 'ca_nhan', nhan: 'Cá nhân' },
  { gia_tri: 'to_chuc', nhan: 'Tổ chức' },
  { gia_tri: 'khac', nhan: 'Khác' }
];

const CAC_TRANG_THAI: Array<{ gia_tri: DieuKienLocKhachHang['trang_thai']; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' },
  { gia_tri: 'hoat_dong', nhan: 'Đang hợp tác' },
  { gia_tri: 'tam_dung', nhan: 'Tạm dừng' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa (tạm)' }
];

interface BoLocKhachHangProps {
  gia_tri_hien_tai: DieuKienLocKhachHang;
  khi_thay_doi: (gia_tri_moi: DieuKienLocKhachHang) => void;
  dsChiNhanh?: ChiNhanh[];
  dsNhanSu?: NhanSu[];
}

export default function BoLocKhachHang({
  gia_tri_hien_tai,
  khi_thay_doi,
  dsChiNhanh = [],
  dsNhanSu = []
}: BoLocKhachHangProps) {
  const [moRong, setMoRong] = useState(false);
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (gia_tri_hien_tai.loai_khach_hang && gia_tri_hien_tai.loai_khach_hang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.chi_nhanh_id && gia_tri_hien_tai.chi_nhanh_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.nguoi_phu_trach_id && gia_tri_hien_tai.nguoi_phu_trach_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay) dem++;
    if (gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai]);

  const datGiaTri = <K extends keyof DieuKienLocKhachHang>(k: K, v: DieuKienLocKhachHang[K]) => {
    khi_thay_doi({ ...gia_tri_hien_tai, [k]: v });
  };

  const xoaTatCa = () => {
    khi_thay_doi({
      tuKhoa: null,
      loai_khach_hang: 'tat_ca',
      trang_thai: 'tat_ca',
      chi_nhanh_id: null,
      nguoi_phu_trach_id: null,
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center h-12 rounded-[var(--radius-input)] border border-border bg-muted/45 shadow-[var(--shadow-card)] transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 focus-within:bg-background overflow-hidden">
            <span className="inline-flex items-center justify-center shrink-0 size-9 rounded-[var(--radius-button)] bg-card-icon-bg-muted text-card-icon-fg-muted ml-2">
              <Search className="size-[17px]" strokeWidth={2} />
            </span>
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => datGiaTri('tuKhoa', e.target.value)}
              placeholder="Tìm kiếm tên, MST, SĐT, email khách hàng..."
              className="flex-1 h-full w-full pl-2.5 pr-5 text-[14px] font-semibold text-foreground placeholder:text-foreground/55 placeholder:font-medium outline-none border-0 shadow-none rounded-none bg-transparent leading-body"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMoRong((m) => !m)}
          className={cn(
            'inline-flex items-center gap-3 rounded-[var(--radius-input)] border h-12 px-5 text-[13.5px] font-black transition shrink-0 active:scale-[0.98] leading-title',
            moRong || soLuongDieuKienKhacMacDinh > 0
              ? 'bg-card-icon-bg-primary border-card-icon-br-primary text-card-icon-fg-primary shadow-[var(--shadow-card)]'
              : 'bg-background border-border text-foreground hover:bg-muted shadow-[var(--shadow-card)]'
          )}
        >
          <Filter className="size-[17.5px]" strokeWidth={2} />
          Bộ lọc
          {soLuongDieuKienKhacMacDinh > 0 && (
            <span className="rounded-full bg-primary/12 text-primary text-[11.5px] px-2.5 h-6 inline-flex items-center font-black border border-primary/18 ml-0.5 mr-0.5 shadow-none">
              {soLuongDieuKienKhacMacDinh}
            </span>
          )}
          <ChevronDown className={cn('size-[17.5px] transition shrink-0', moRong && 'rotate-180')} />
        </button>
        {soLuongDieuKienKhacMacDinh > 0 || tuKhoa ? (
          <button
            type="button"
            onClick={xoaTatCa}
            className="inline-flex items-center gap-2.5 rounded-[var(--radius-input)] border border-border bg-background h-12 px-5 text-[13.5px] text-muted-foreground hover:bg-danger/10 hover:border-danger/25 hover:text-danger transition shrink-0 shadow-[var(--shadow-card)] active:scale-[0.98] font-black leading-title"
          >
            <XCircle className="size-[17.5px]" strokeWidth={2} />
            Xóa bộ lọc
          </button>
        ) : null}
      </div>
      <div
        className={cn(
          'transition-all duration-250 overflow-hidden',
          moRong ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        )}
      >
        <div className="min-h-0 grid gap-4 md:grid-cols-3 lg:grid-cols-4 p-5 rounded-[var(--radius-card)] border border-border bg-muted/35">
          <BoLocMuc label="Loại khách hàng">
            <select
              value={(gia_tri_hien_tai.loai_khach_hang as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('loai_khach_hang', e.target.value as DieuKienLocKhachHang['loai_khach_hang'])
              }
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            >
              {CAC_LOAI_KH.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label="Trạng thái">
            <select
              value={(gia_tri_hien_tai.trang_thai as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('trang_thai', e.target.value as DieuKienLocKhachHang['trang_thai'])
              }
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            >
              {CAC_TRANG_THAI.filter(Boolean).map((x) => (
                <option key={x!.gia_tri} value={x!.gia_tri as string}>
                  {x!.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label="Chi nhánh">
            <select
              value={gia_tri_hien_tai.chi_nhanh_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('chi_nhanh_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            >
              <option value="tat_ca">Tất cả chi nhánh</option>
              {dsChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>
                  {cn.ten_chi_nhanh}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label="Người phụ trách">
            <select
              value={gia_tri_hien_tai.nguoi_phu_trach_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('nguoi_phu_trach_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            >
              <option value="tat_ca">Tất cả phụ trách</option>
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten} ({ns.ma_nhan_vien})
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label="Ngày tạo từ">
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            />
          </BoLocMuc>
          <BoLocMuc label="Ngày tạo đến">
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-11 rounded-[var(--radius-input)] border border-border bg-background px-4.5 text-[14px] font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-[var(--shadow-card)] leading-body"
            />
          </BoLocMuc>
        </div>
      </div>
    </div>
  );
}

const BoLocMuc = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[11.5px] font-black text-muted-foreground uppercase tracking-[0.14em] mb-3 leading-small">{label}</span>
    {children}
  </label>
);
