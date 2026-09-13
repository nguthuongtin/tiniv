'use client';

import { X, Filter, Search, XCircle, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../thu_vien/utils/cn';
import type { DieuKienLocCongViec } from '../../dich_vu/cong_viec/dich_vu_cong_viec';
import type { TrangThaiCongViec } from '../../thu_vien/types/cong_viec';

const CAC_TRANG_THAI: Array<{ gia_tri: 'tat_ca' | TrangThaiCongViec; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả trạng thái' },
  { gia_tri: 'chua_thuc_hien', nhan: 'Chưa thực hiện' },
  { gia_tri: 'dang_thuc_hien', nhan: 'Đang thực hiện' },
  { gia_tri: 'hoan_thanh', nhan: 'Hoàn thành' },
  { gia_tri: 'tam_dung', nhan: 'Tạm dừng' }
];

const CAC_TRANG_THAI_DL: Array<{ gia_tri: DieuKienLocCongViec['trang_thai_du_lieu']; nhan: string }> = [
  { gia_tri: 'tat_ca', nhan: 'Tất cả (cả đã xóa)' },
  { gia_tri: 'hoat_dong', nhan: 'Hoạt động' },
  { gia_tri: 'da_xoa', nhan: 'Đã xóa' }
];

interface BoLocCongViecProps {
  gia_tri_hien_tai: DieuKienLocCongViec;
  khi_thay_doi: (gia_tri_moi: DieuKienLocCongViec) => void;
  dsDuAn?: Array<{ id: string; ten_du_an: string; ma_ho_so?: string | null }>;
  dsNhanSu?: Array<{ id: string; ho_va_ten: string; chuc_vu?: string | null }>;
}

export default function BoLocCongViec({
  gia_tri_hien_tai,
  khi_thay_doi,
  dsDuAn = [],
  dsNhanSu = []
}: BoLocCongViecProps) {
  const [moRong, setMoRong] = useState(false);
  const tuKhoa = gia_tri_hien_tai.tuKhoa ?? '';
  const soLuongDieuKienKhacMacDinh = useMemo(() => {
    let dem = 0;
    if (gia_tri_hien_tai.trang_thai && gia_tri_hien_tai.trang_thai !== 'tat_ca') dem++;
    if (gia_tri_hien_tai.trang_thai_du_lieu && gia_tri_hien_tai.trang_thai_du_lieu !== 'hoat_dong') dem++;
    if (gia_tri_hien_tai.du_an_id) dem++;
    if (gia_tri_hien_tai.nguoi_thuc_hien_id) dem++;
    if (gia_tri_hien_tai.ngay_tao_tu_ngay || gia_tri_hien_tai.ngay_tao_den_ngay) dem++;
    if (gia_tri_hien_tai.thoi_han_tu_ngay || gia_tri_hien_tai.thoi_han_den_ngay) dem++;
    return dem;
  }, [gia_tri_hien_tai]);

  const capNhat = (patch: Partial<DieuKienLocCongViec>) => {
    khi_thay_doi({ ...gia_tri_hien_tai, ...patch });
  };

  const datLaiMacDinh = () => {
    khi_thay_doi({
      tuKhoa: null,
      du_an_id: null,
      nguoi_thuc_hien_id: null,
      nguoi_tao_id: null,
      trang_thai: 'tat_ca',
      trang_thai_du_lieu: 'hoat_dong',
      ngay_tao_tu_ngay: null,
      ngay_tao_den_ngay: null,
      thoi_han_tu_ngay: null,
      thoi_han_den_ngay: null
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-100">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => capNhat({ tuKhoa: e.target.value })}
            placeholder="Tìm kiếm tên, mô tả, ghi chú công việc…"
            className={cn(
              'w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
            )}
          />
        </div>
        <select
          value={(gia_tri_hien_tai.trang_thai ?? 'tat_ca') as string}
          onChange={(e) => capNhat({ trang_thai: e.target.value as DieuKienLocCongViec['trang_thai'] })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-w-[180px]"
        >
          {CAC_TRANG_THAI.map((t) => (
            <option key={t.gia_tri} value={t.gia_tri}>
              {t.nhan}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setMoRong((m) => !m)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
            moRong
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          <Filter className="size-4" />
          Bộ lọc thêm
          {soLuongDieuKienKhacMacDinh > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px]">
              {soLuongDieuKienKhacMacDinh}
            </span>
          )}
          <ChevronDown className={cn('size-4 transition-transform', moRong && 'rotate-180')} />
        </button>
        {(soLuongDieuKienKhacMacDinh > 0 || tuKhoa.length > 0) && (
          <button
            type="button"
            onClick={datLaiMacDinh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <XCircle className="size-4" /> Đặt lại
          </button>
        )}
      </div>

      {moRong && (
        <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-slate-50/60">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Dự án
            </label>
            <select
              value={gia_tri_hien_tai.du_an_id ?? ''}
              onChange={(e) => capNhat({ du_an_id: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700"
            >
              <option value="">Tất cả dự án</option>
              {dsDuAn.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ma_ho_so ? `[${d.ma_ho_so}] ` : ''}{d.ten_du_an}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Người thực hiện
            </label>
            <select
              value={gia_tri_hien_tai.nguoi_thuc_hien_id ?? ''}
              onChange={(e) => capNhat({ nguoi_thuc_hien_id: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700"
            >
              <option value="">Tất cả nhân sự</option>
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten}{ns.chuc_vu ? ` (${ns.chuc_vu})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Trạng thái dữ liệu
            </label>
            <select
              value={(gia_tri_hien_tai.trang_thai_du_lieu ?? 'hoat_dong') as string}
              onChange={(e) => capNhat({ trang_thai_du_lieu: e.target.value as DieuKienLocCongViec['trang_thai_du_lieu'] })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CAC_TRANG_THAI_DL.map((t) => (
                <option key={String(t.gia_tri)} value={t.gia_tri ?? ''}>
                  {t.nhan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Ngày tạo (Từ ngày)
            </label>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_tu_ngay ?? ''}
              onChange={(e) => capNhat({ ngay_tao_tu_ngay: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Ngày tạo (Đến ngày)
            </label>
            <input
              type="date"
              value={gia_tri_hien_tai.ngay_tao_den_ngay ?? ''}
              onChange={(e) => capNhat({ ngay_tao_den_ngay: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div />
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Thời hạn (Từ ngày)
            </label>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_tu_ngay ?? ''}
              onChange={(e) => capNhat({ thoi_han_tu_ngay: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
              Thời hạn (Đến ngày)
            </label>
            <input
              type="date"
              value={gia_tri_hien_tai.thoi_han_den_ngay ?? ''}
              onChange={(e) => capNhat({ thoi_han_den_ngay: e.target.value || null })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}
