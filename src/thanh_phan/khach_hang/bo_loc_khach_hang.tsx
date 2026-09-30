'use client';

import { X, Filter, Search, XCircle, Building2, UserRound, Users, Calendar, ShieldCheck, ArrowUpDown } from 'lucide-react';
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
  { gia_tri: 'hoat_dong', nhan: 'Đang hoạt động (Mặc định)' },
  { gia_tri: 'tam_dung', nhan: 'Tạm dừng' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa (Thùng rác)' },
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' }
];

export type KieuSapXepKhachHang = 'moi_nhat' | 'cu_nhat' | 'ten_az';

interface BoLocKhachHangProps {
  gia_tri_hien_tai: DieuKienLocKhachHang;
  khi_thay_doi: (gia_tri_moi: DieuKienLocKhachHang) => void;
  dsChiNhanh?: ChiNhanh[];
  dsNhanSu?: NhanSu[];
  kieu_sap_xep?: KieuSapXepKhachHang;
  khi_doi_sap_xep?: (kieu: KieuSapXepKhachHang) => void;
}

export default function BoLocKhachHang({
  gia_tri_hien_tai,
  khi_thay_doi,
  dsChiNhanh = [],
  dsNhanSu = [],
  kieu_sap_xep = 'moi_nhat',
  khi_doi_sap_xep
}: BoLocKhachHangProps) {
  const [moRong, setMoRong] = useState(false);
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (gia_tri_hien_tai.loai_khach_hang && gia_tri_hien_tai.loai_khach_hang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'hoat_dong') dem++;
    if (gia_tri_hien_tai.chi_nhanh_id && gia_tri_hien_tai.chi_nhanh_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.nguoi_phu_trach_id && gia_tri_hien_tai.nguoi_phu_trach_id !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay) dem++;
    if (gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai, tuKhoa]);

  const datGiaTri = <K extends keyof DieuKienLocKhachHang>(k: K, v: DieuKienLocKhachHang[K]) => {
    khi_thay_doi({ ...gia_tri_hien_tai, [k]: v });
  };

  const xoaTatCa = () => {
    khi_thay_doi({
      tuKhoa: null,
      loai_khach_hang: 'tat_ca',
      trang_thai: 'hoat_dong',
      chi_nhanh_id: null,
      nguoi_phu_trach_id: null,
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => datGiaTri('tuKhoa', e.target.value)}
            placeholder="Tìm tên, MST, SĐT khách hàng..."
            className="w-full h-11 rounded-full sm:rounded-2xl border border-slate-200/90 bg-white pl-10 pr-9 text-[13px] sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => datGiaTri('tuKhoa', '')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Nút biểu tượng Sắp xếp kế nút Bộ lọc */}
        {khi_doi_sap_xep && (
          <div
            title="Sắp xếp danh sách"
            className={cn(
              'relative size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0',
              kieu_sap_xep !== 'moi_nhat'
                ? 'bg-emerald-50 border-emerald-400 text-[#107555]'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.03)]'
            )}
          >
            <ArrowUpDown className="size-[18px] pointer-events-none" />
            <select
              value={kieu_sap_xep}
              onChange={(e) => khi_doi_sap_xep(e.target.value as KieuSapXepKhachHang)}
              aria-label="Sắp xếp khách hàng"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="moi_nhat">Sắp xếp: Mới nhất</option>
              <option value="cu_nhat">Sắp xếp: Cũ nhất</option>
              <option value="ten_az">Sắp xếp: Tên A-Z</option>
            </select>
          </div>
        )}

        {/* Nút biểu tượng Phễu lọc tinh gọn bên cạnh ô tìm kiếm */}
        <button
          type="button"
          onClick={() => setMoRong((m) => !m)}
          title={moRong ? 'Đóng bộ lọc' : 'Mở bộ lọc'}
          className={cn(
            'relative size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0 cursor-pointer',
            moRong || soLuongDieuKienKhacMacDinh > 0
              ? 'bg-[#107555] border-[#107555] text-white shadow-sm shadow-emerald-700/20'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.03)]'
          )}
        >
          <Filter className="size-[18px]" />
          {soLuongDieuKienKhacMacDinh > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 size-5 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white',
                moRong ? 'bg-amber-400 text-slate-900' : 'bg-[#107555] text-white'
              )}
            >
              {soLuongDieuKienKhacMacDinh}
            </span>
          )}
        </button>

        {/* Nút reset nhanh nếu đang có điều kiện lọc */}
        {soLuongDieuKienKhacMacDinh > 0 && (
          <button
            type="button"
            onClick={xoaTatCa}
            title="Xóa tất cả điều kiện lọc"
            className="size-11 rounded-full sm:rounded-2xl border border-rose-200/80 bg-rose-50/60 flex items-center justify-center text-rose-600 hover:bg-rose-100/60 transition active:scale-[0.95] shrink-0 cursor-pointer"
          >
            <XCircle className="size-5" />
          </button>
        )}
      </div>

      {moRong && (
        <div className="mt-2.5 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5 rounded-[24px] border border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Loại khách hàng</>}>
            <select
              value={(gia_tri_hien_tai.loai_khach_hang as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('loai_khach_hang', e.target.value as DieuKienLocKhachHang['loai_khach_hang'])
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_LOAI_KH.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><ShieldCheck className="size-3.5 text-slate-500" /> Trạng thái hợp tác</>}>
            <select
              value={(gia_tri_hien_tai.trang_thai as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('trang_thai', e.target.value as DieuKienLocKhachHang['trang_thai'])
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_TRANG_THAI.filter(Boolean).map((x) => (
                <option key={x!.gia_tri} value={x!.gia_tri as string}>
                  {x!.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Building2 className="size-3.5 text-slate-500" /> Chi nhánh phụ trách</>}>
            <select
              value={gia_tri_hien_tai.chi_nhanh_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('chi_nhanh_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="tat_ca">Tất cả chi nhánh</option>
              {dsChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>
                  {cn.ten_chi_nhanh}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Người phụ trách chính</>}>
            <select
              value={gia_tri_hien_tai.nguoi_phu_trach_id ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('nguoi_phu_trach_id', e.target.value === 'tat_ca' ? null : e.target.value)
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="tat_ca">Tất cả người phụ trách</option>
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten} {ns.ma_nhan_vien ? `(${ns.ma_nhan_vien})` : ''}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo từ</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tạo đến</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>
        </div>
      )}
    </div>
  );
}

const BoLocMuc = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);
