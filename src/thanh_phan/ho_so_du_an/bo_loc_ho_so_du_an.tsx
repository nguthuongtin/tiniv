'use client';

import { X, Filter, Search, XCircle, ChevronDown, Building2, UserRound, Users, Calendar } from 'lucide-react';
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
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' },
  { gia_tri: 'hoat_dong', nhan: 'Hoạt động' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa' }
];

interface BoLocHoSoDuAnProps {
  gia_tri_hien_tai: DieuKienLocHoSoDuAn;
  khi_thay_doi: (gia_tri_moi: DieuKienLocHoSoDuAn) => void;
  ds_khach_hang?: KhachHang[];
  ds_nhan_su?: NhanSu[];
}

export default function BoLocHoSoDuAn({
  gia_tri_hien_tai,
  khi_thay_doi,
  ds_khach_hang = [],
  ds_nhan_su = []
}: BoLocHoSoDuAnProps) {
  const [moRong, setMoRong] = useState(false);
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (tuKhoa && tuKhoa.trim().length > 0) dem++;
    if (gia_tri_hien_tai.giai_doan && gia_tri_hien_tai.giai_doan !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.muc_do_tiem_nang && gia_tri_hien_tai.muc_do_tiem_nang !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'tat_ca') dem++;
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
      trang_thai: 'tat_ca',
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null,
      thoi_han_hoan_thanh_tu_ngay: null,
      thoi_han_hoan_thanh_den_ngay: null
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => datGiaTri('tuKhoa', e.target.value)}
            placeholder="Tìm kiếm mã hồ sơ, tên dự án..."
            className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
          />
        </div>
        <button
          type="button"
          onClick={() => setMoRong((m) => !m)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border h-10 px-3 text-sm font-medium transition',
            moRong || soLuongDieuKienKhacMacDinh > 0
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          )}
        >
          <Filter className="size-4" />
          Bộ lọc
          {soLuongDieuKienKhacMacDinh > 0 && (
            <span className="rounded-full bg-indigo-600 text-white text-[11px] px-2 py-0.5 font-bold -mr-1">
              {soLuongDieuKienKhacMacDinh}
            </span>
          )}
          <ChevronDown className={cn('size-4 transition', moRong && 'rotate-180')} />
        </button>
        {soLuongDieuKienKhacMacDinh > 0 || tuKhoa ? (
          <button
            type="button"
            onClick={xoaTatCa}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 h-10 px-3 text-sm text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition"
          >
            <XCircle className="size-4" />
            Xóa bộ lọc
          </button>
        ) : null}
      </div>
      <div
        className={cn(
          'grid gap-3 transition-all duration-200 overflow-hidden',
          moRong ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 grid gap-3 md:grid-cols-2 lg:grid-cols-3 p-4 rounded-xl border border-slate-200 bg-white/50">
          <BoLocMuc label={<><Building2 className="size-3.5" /> Khách hàng (Công ty)</>}>
            <select
              value={gia_tri_hien_tai.khach_hang_id ?? ''}
              onChange={(e) => datGiaTri('khach_hang_id', e.target.value ? e.target.value : null)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
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
          <BoLocMuc label={<><UserRound className="size-3.5" /> Giai đoạn dự án</>}>
            <select
              value={(gia_tri_hien_tai.giai_doan as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('giai_doan', e.target.value as DieuKienLocHoSoDuAn['giai_doan'])
              }
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {CAC_GIAI_DOAN.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><UserRound className="size-3.5" /> Mức tiềm năng ký</>}>
            <select
              value={(gia_tri_hien_tai.muc_do_tiem_nang as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri(
                  'muc_do_tiem_nang',
                  e.target.value as DieuKienLocHoSoDuAn['muc_do_tiem_nang']
                )
              }
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {CAC_MUC_TIEM_NANG.map((x) => (
                <option key={x.gia_tri} value={x.gia_tri}>
                  {x.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>
          <BoLocMuc label={<><Users className="size-3.5" /> Người quản lý</>}>
            <select
              value={gia_tri_hien_tai.nguoi_quan_ly_id ?? ''}
              onChange={(e) => datGiaTri('nguoi_quan_ly_id', e.target.value ? e.target.value : null)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
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
          <BoLocMuc label={<><Users className="size-3.5" /> Người phụ trách chính (PIC)</>}>
            <select
              value={gia_tri_hien_tai.nguoi_phu_trach_id ?? ''}
              onChange={(e) => datGiaTri('nguoi_phu_trach_id', e.target.value ? e.target.value : null)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
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
              value={(gia_tri_hien_tai.trang_thai as string) ?? 'tat_ca'}
              onChange={(e) =>
                datGiaTri('trang_thai', e.target.value as DieuKienLocHoSoDuAn['trang_thai'])
              }
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {CAC_TRANG_THAI.filter(Boolean).map((x) => (
                <option key={x!.gia_tri} value={x!.gia_tri as string}>
                  {x!.nhan}
                </option>
              ))}
            </select>
          </BoLocMuc>

          <div className="col-span-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-0.5" />

          <BoLocMuc label={<><Calendar className="size-3.5" /> Ngày tạo HS từ ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_tu_ngay', e.target.value || null)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </BoLocMuc>
          <BoLocMuc label={<><Calendar className="size-3.5" /> Ngày tạo HS đến ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => datGiaTri('ngay_tao_den_ngay', e.target.value || null)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </BoLocMuc>
          <div className="h-9" />
          <BoLocMuc label={<><Calendar className="size-3.5 text-amber-600" /> Deadline (THHT) từ ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_hoan_thanh_tu_ngay ?? ''}
              onChange={(e) => datGiaTri('thoi_han_hoan_thanh_tu_ngay', e.target.value || null)}
              className="w-full h-9 rounded-lg border border-amber-200 bg-amber-50/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </BoLocMuc>
          <BoLocMuc label={<><Calendar className="size-3.5 text-amber-600" /> Deadline (THHT) đến ngày</>}>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_hoan_thanh_den_ngay ?? ''}
              onChange={(e) => datGiaTri('thoi_han_hoan_thanh_den_ngay', e.target.value || null)}
              className="w-full h-9 rounded-lg border border-amber-200 bg-amber-50/40 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </BoLocMuc>
          <div className="h-9" />
        </div>
      </div>
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
