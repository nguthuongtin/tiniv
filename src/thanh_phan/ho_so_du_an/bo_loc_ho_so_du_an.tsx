'use client';

import { X, Filter, Search, XCircle, ChevronDown, Building2, UserRound, Users, Calendar, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { DieuKienLocHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type {
  GiaiDoanDuAn,
  MucDoTiemNangKyHopDong
} from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';

const CAC_GIAI_DOAN: Array<{ gia_tri: 'tat_ca' | GiaiDoanDuAn; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả giai đoạn' },
  { gia_tri: 'moi_tao', nhan: 'Mới tạo' },
  { gia_tri: 'tiep_can', nhan: 'Tiếp cận' },
  { gia_tri: 'khao_sat', nhan: 'Khảo sát' },
  { gia_tri: 'len_giai_phap', nhan: 'Lên giải pháp' },
  { gia_tri: 'bao_gia', nhan: 'Báo giá' },
  { gia_tri: 'dam_phan', nhan: 'Đàm phán' },
  { gia_tri: 'ky_hop_dong', nhan: 'Ký hợp đồng' },
  { gia_tri: 'trien_khai', nhan: 'Triển khai' },
  { gia_tri: 'nghiem_thu', nhan: 'Nghiệm thu' },
  { gia_tri: 'hoan_thanh', nhan: 'Hoàn thành' },
  { gia_tri: 'tam_dung', nhan: 'Tạm dừng' },
  { gia_tri: 'huy', nhan: 'Đã hủy' }
];

const CAC_MUC_TIEM_NANG: Array<{
  gia_tri: 'tat_ca' | MucDoTiemNangKyHopDong;
  nhan: string;
}> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả mức tiềm năng' },
  { gia_tri: 'rat_cao', nhan: 'Rất cao' },
  { gia_tri: 'cao', nhan: 'Cao' },
  { gia_tri: 'trung_binh', nhan: 'Trung bình' },
  { gia_tri: 'thap', nhan: 'Thấp' },
  { gia_tri: 'rat_thap', nhan: 'Rất thấp' }
];

const CAC_TRANG_THAI: Array<{ gia_tri: DieuKienLocHoSoDuAn['trang_thai']; nhan: string }> = [
  { gia_tri: 'hoat_dong', nhan: 'Đang hoạt động (Mặc định)' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa (Thùng rác)' },
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' }
];

interface BoLocHoSoDuAnProps {
  gia_tri_hien_tai: DieuKienLocHoSoDuAn;
  khi_thay_doi: (gia_tri_moi: DieuKienLocHoSoDuAn) => void;
  ds_khach_hang?: KhachHang[];
  ds_nhan_su?: NhanSu[];
  kieu_sap_xep?: 'moi_nhat' | 'cu_nhat' | 'gia_tri_cao' | 'ten_az';
  khi_doi_sap_xep?: (kieu: 'moi_nhat' | 'cu_nhat' | 'gia_tri_cao' | 'ten_az') => void;
}

export default function BoLocHoSoDuAn({
  gia_tri_hien_tai,
  khi_thay_doi,
  ds_khach_hang = [],
  ds_nhan_su = [],
  kieu_sap_xep = 'moi_nhat',
  khi_doi_sap_xep
}: BoLocHoSoDuAnProps) {
  const [moRong, setMoRong] = useState(false);
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (gia_tri_hien_tai.giai_doan && gia_tri_hien_tai.giai_doan !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.muc_do_tiem_nang && gia_tri_hien_tai.muc_do_tiem_nang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'hoat_dong') dem++;
    if (gia_tri_hien_tai.khach_hang_id) dem++;
    if (gia_tri_hien_tai.nguoi_quan_ly_id) dem++;
    if (gia_tri_hien_tai.nguoi_phu_trach_id) dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay) dem++;
    if (gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    if (gia_tri_hien_tai.thoi_han_hoan_thanh_tu_ngay) dem++;
    if (gia_tri_hien_tai.thoi_han_hoan_thanh_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai, tuKhoa]);

  const datGiaTri = <K extends keyof DieuKienLocHoSoDuAn>(
    k: K,
    v: DieuKienLocHoSoDuAn[K]
  ) => {
    khi_thay_doi({ ...gia_tri_hien_tai, [k]: v });
  };

  const xoaTatCa = () => {
    khi_thay_doi({
      tuKhoa: null,
      khach_hang_id: null,
      giai_doan: 'tat_ca',
      muc_do_tiem_nang: 'tat_ca',
      nguoi_quan_ly_id: null,
      nguoi_phu_trach_id: null,
      trang_thai: 'hoat_dong',
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null,
      thoi_han_hoan_thanh_tu_ngay: null,
      thoi_han_hoan_thanh_den_ngay: null
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
            placeholder="Tìm tên dự án, khách hàng..."
            className="w-full h-10 sm:h-11 rounded-full sm:rounded-2xl border border-slate-200/90 bg-white pl-10 pr-9 text-noi-dung font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-nhe transition"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => datGiaTri('tuKhoa', '')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Nút Icon Sắp xếp kế bên nút Bộ lọc */}
        {khi_doi_sap_xep && (
          <div
            className={cn(
              'relative size-10 sm:size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0',
              kieu_sap_xep !== 'moi_nhat'
                ? 'bg-emerald-50 border-emerald-300 text-primary'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-nhe'
            )}
            title="Sắp xếp danh sách"
          >
            <ArrowUpDown className="size-[18px] pointer-events-none" />
            <select
              value={kieu_sap_xep}
              onChange={(e) => khi_doi_sap_xep(e.target.value as any)}
              aria-label="Sắp xếp danh sách dự án"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="moi_nhat">Sắp xếp: Mới nhất</option>
              <option value="cu_nhat">Sắp xếp: Cũ nhất</option>
              <option value="gia_tri_cao">Sắp xếp: Giá trị cao</option>
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
            'relative size-10 sm:size-11 rounded-full sm:rounded-2xl border flex items-center justify-center transition active:scale-[0.95] shrink-0 cursor-pointer',
            moRong || soLuongDieuKienKhacMacDinh > 0
              ? 'bg-primary border-primary text-white shadow-sm shadow-emerald-700/20'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-nhe'
          )}
        >
          <Filter className="size-[18px]" />
          {soLuongDieuKienKhacMacDinh > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 size-5 rounded-full text-nhan font-bold flex items-center justify-center border-2 border-white",
              moRong ? "bg-amber-400 text-slate-900" : "bg-primary text-white"
            )}>
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
            className="size-10 sm:size-11 rounded-full sm:rounded-2xl border border-rose-200/80 bg-rose-50/60 flex items-center justify-center text-rose-600 hover:bg-rose-100/60 transition active:scale-[0.95] shrink-0 cursor-pointer"
          >
            <XCircle className="size-5" />
          </button>
        )}
      </div>
      {moRong && (
        <div className="mt-2.5 grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5 rounded-[24px] border border-slate-200/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <BoLocMuc label={<><Building2 className="size-3.5 text-slate-500" /> Khách hàng (Công ty)</>}>
            <select
              value={gia_tri_hien_tai.khach_hang_id ?? ''}
              onChange={(e) => datGiaTri('khach_hang_id', e.target.value ? e.target.value : null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="">Tất cả khách hàng</option>
              {ds_khach_hang.map((kh) => (
                <option key={kh.id} value={kh.id}>
                  {kh.ten_khach_hang}
                  {kh.ma_so_thue ? ` (MST: ${kh.ma_so_thue})` : ''}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Giai đoạn dự án</>}>
            <select
              value={(gia_tri_hien_tai.giai_doan as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('giai_doan', e.target.value as DieuKienLocHoSoDuAn['giai_doan'])
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_GIAI_DOAN.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><UserRound className="size-3.5 text-slate-500" /> Mức tiềm năng ký</>}>
            <select
              value={(gia_tri_hien_tai.muc_do_tiem_nang as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri(
                  'muc_do_tiem_nang',
                  e.target.value as DieuKienLocHoSoDuAn['muc_do_tiem_nang']
                )
              }
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              {CAC_MUC_TIEM_NANG.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Người quản lý</>}>
            <select
              value={gia_tri_hien_tai.nguoi_quan_ly_id ?? ''}
              onChange={(e) => datGiaTri('nguoi_quan_ly_id', e.target.value ? e.target.value : null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="">Tất cả người quản lý</option>
              {ds_nhan_su.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten}
                  {ns.chuc_vu ? ` — ${ns.chuc_vu}` : ''}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><Users className="size-3.5 text-slate-500" /> Người phụ trách chính (PIC)</>}>
            <select
              value={gia_tri_hien_tai.nguoi_phu_trach_id ?? ''}
              onChange={(e) => datGiaTri('nguoi_phu_trach_id', e.target.value ? e.target.value : null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            >
              <option value="">Tất cả người phụ trách</option>
              {ds_nhan_su.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten}
                  {ns.vai_tro ? ` — ${String(ns.vai_tro).replace(/_/g, ' ')}` : ''}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label="Trạng thái hồ sơ">
            <select
              value={(gia_tri_hien_tai.trang_thai as string) ?? 'hoat_dong'}
              onChange={(e) =>
                datGiaTri('trang_thai', e.target.value as DieuKienLocHoSoDuAn['trang_thai'])
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

          <div className="col-span-full h-px bg-slate-200/80 my-1" />

          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tiếp cận từ ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>
          <BoLocMuc label={<><Calendar className="size-3.5 text-slate-500" /> Ngày tiếp cận đến ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
            />
          </BoLocMuc>
          <div className="hidden lg:block h-10" />
          <BoLocMuc label={<><Calendar className="size-3.5 text-[#FF9500]" /> Dự kiến ký HĐ từ ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_hoan_thanh_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('thoi_han_hoan_thanh_tu_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-[#FF9500]/30 bg-amber-50/40 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] shadow-2xs"
            />
          </BoLocMuc>
          <BoLocMuc label={<><Calendar className="size-3.5 text-[#FF9500]" /> Dự kiến ký HĐ đến ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_hoan_thanh_den_ngay ?? ''}
              onChange={(e) => datGiaTri('thoi_han_hoan_thanh_den_ngay', e.target.value || null)}
              className="w-full h-10 rounded-xl border border-[#FF9500]/30 bg-amber-50/40 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/20 focus:border-[#FF9500] shadow-2xs"
            />
          </BoLocMuc>
        </div>
      )}
    </div>
  );
}

const BoLocMuc = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-600 mb-1 inline-flex items-center gap-1.5">
      {label}
    </span>
    {children}
  </label>
);
