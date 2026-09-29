'use client';

import { X, ExternalLink, Flame, Award, Building2, User, Layers, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { NhanSu } from '../../thu_vien/types/nhan_su';

interface Props {
  tieuDe: string;
  moTaPhu?: string;
  danhSachDuAn: HoSoDuAn[];
  danhSachNhanSu?: NhanSu[];
  onDong: () => void;
}

const NHAN_MUC_DO_TIEM_NANG: Record<string, { label: string; bg: string; text: string }> = {
  rat_cao: { label: 'Tiềm năng rất cao', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  cao: { label: 'Tiềm năng cao', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  trung_binh: { label: 'Trung bình', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600' },
  thap: { label: 'Thấp', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-400' },
  rat_thap: { label: 'Rất thấp', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-400' }
};

const NHAN_GIAI_DOAN: Record<string, { label: string; bg: string; text: string }> = {
  tiep_can: { label: 'Tiếp cận', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  khao_sat: { label: 'Khảo sát', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700' },
  bao_gia: { label: 'Báo giá', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
  dam_phan: { label: 'Đàm phán', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
  ky_hop_dong: { label: 'Ký hợp đồng', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  trien_khai: { label: 'Triển khai', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  nghiem_thu: { label: 'Nghiệm thu', bg: 'bg-green-50 border-green-200', text: 'text-green-700' }
};

export default function ModalDanhSachDuAn({
  tieuDe,
  moTaPhu,
  danhSachDuAn,
  danhSachNhanSu = [],
  onDong
}: Props) {
  const tongGiaTri = danhSachDuAn.reduce(
    (sum, da) => sum + (Number(da.gia_tri_du_kien) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <span>{tieuDe}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#185942]/10 text-[#185942] text-xs font-bold">
                {danhSachDuAn.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {moTaPhu ? `${moTaPhu} • ` : ''}Tổng giá trị dự kiến:{' '}
              <strong className="text-emerald-700 font-semibold">{DINH_DANG_TIEN_NGAN_GON(tongGiaTri)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Danh sách dự án */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {danhSachDuAn.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không có dự án nào trong mục này.
            </div>
          ) : (
            danhSachDuAn.map((da) => {
              const nguoiPhuTrach = danhSachNhanSu.find((ns) => ns.id === da.nguoi_phu_trach_id);
              const tiemNangInfo = NHAN_MUC_DO_TIEM_NANG[da.muc_do_tiem_nang] || {
                label: da.muc_do_tiem_nang || 'Chưa phân loại',
                bg: 'bg-slate-50 border-slate-200',
                text: 'text-slate-600'
              };
              const giaiDoanInfo = NHAN_GIAI_DOAN[da.giai_doan] || {
                label: da.giai_doan || 'Đang cập nhật',
                bg: 'bg-slate-50 border-slate-200',
                text: 'text-slate-600'
              };

              return (
                <div
                  key={da.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-[#185942]/30 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                        {da.ma_ho_so || 'DA'}
                      </span>
                      <Link
                        href={`/ho-so-du-an/${da.id}`}
                        target="_blank"
                        className="font-bold text-sm text-slate-800 hover:text-[#185942] transition-colors truncate"
                      >
                        {da.ten_du_an}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      {nguoiPhuTrach && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {nguoiPhuTrach.ho_va_ten}
                        </span>
                      )}
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">
                        {DINH_DANG_TIEN_NGAN_GON(Number(da.gia_tri_du_kien) || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Badge tiềm năng */}
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                        tiemNangInfo.bg,
                        tiemNangInfo.text
                      )}
                    >
                      {tiemNangInfo.label}
                    </span>

                    {/* Badge giai đoạn */}
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                        giaiDoanInfo.bg,
                        giaiDoanInfo.text
                      )}
                    >
                      {giaiDoanInfo.label}
                    </span>

                    {/* Nút mở dự án */}
                    <Link
                      href={`/ho-so-du-an/${da.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#185942] hover:bg-slate-100 transition-colors"
                      title="Mở chi tiết dự án"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onDong}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
