'use client';

import { ArrowUpRight, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import { Ban_Ve, Nut } from '../ui';
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
  rat_cao: { label: 'Rất cao', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
  cao: { label: 'Cao', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  trung_binh: { label: 'Trung bình', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600' },
  thap: { label: 'Thấp', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-400' },
  rat_thap: { label: 'Rất thấp', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-400' }
};

const NHAN_GIAI_DOAN: Record<string, { label: string; bg: string; text: string }> = {
  tiep_can: { label: '1. Tiếp cận', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  bao_gia: { label: '2. Báo giá', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  co_chu_truong: { label: '3. Có chủ trương', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  ky_hop_dong: { label: '4. Ký HĐ', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  tt_dot_1: { label: '5. TT đợt 1', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  trien_khai: { label: '6. Triển khai', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
  hoan_thanh_tt_dot_2: { label: '7. Hoàn thành & TT đợt 2', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  tam_dung_huy: { label: 'Tạm dừng / Hủy', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' }
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
    <Ban_Ve
      mo={true}
      onDong={onDong}
      kich_thuoc="lg"
      tieu_de={
        <span className="flex items-center gap-2 flex-wrap">
          <span>{tieuDe}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#185942]/10 text-[#185942] text-xs font-bold">
            {danhSachDuAn.length}
          </span>
        </span>
      }
      phu_de={
        <>
          {moTaPhu ? `${moTaPhu} • ` : ''}Tổng giá trị dự kiến:{' '}
          <strong className="text-emerald-700 font-semibold">{DINH_DANG_TIEN_NGAN_GON(tongGiaTri)}</strong>
        </>
      }
      cuoi={
        <Nut kieu="outline" kich_thuoc="sm" onClick={onDong} className="w-full sm:w-auto">
          Đóng
        </Nut>
      }
    >
      <div className="space-y-2.5">
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
              <Link
                key={da.id}
                href={`/ho-so-du-an/${da.id}`}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white hover:border-[#185942]/30 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-800 truncate">
                      {da.ten_du_an}
                    </span>
                    <span
                      className={cn(
                        'sm:hidden px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0',
                        tiemNangInfo.bg,
                        tiemNangInfo.text
                      )}
                    >
                      {tiemNangInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 truncate">
                    <span className="font-bold text-emerald-700 shrink-0">
                      {DINH_DANG_TIEN_NGAN_GON(Number(da.gia_tri_du_kien) || 0)}
                    </span>
                    <span>·</span>
                    <span className="truncate">{giaiDoanInfo.label}</span>
                    {nguoiPhuTrach && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <User className="size-3.5 text-slate-400 shrink-0" />
                          {nguoiPhuTrach.ho_va_ten.split(' ').pop()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                      tiemNangInfo.bg,
                      tiemNangInfo.text
                    )}
                  >
                    {tiemNangInfo.label}
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                      giaiDoanInfo.bg,
                      giaiDoanInfo.text
                    )}
                  >
                    {giaiDoanInfo.label}
                  </span>
                  <span className="p-2 rounded-lg text-slate-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Ban_Ve>
  );
}
