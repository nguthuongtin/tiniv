'use client';

import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Target,
  AlertCircle
} from 'lucide-react';
import type { ItemKeHoachTuan, TrangThaiKetQuaCongViec } from '../../thu_vien/types/ke_hoach';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  mo: boolean;
  onDong: () => void;
  item: ItemKeHoachTuan | null;
  onLuu: (
    itemId: string,
    trangThai: TrangThaiKetQuaCongViec,
    ketQuaThucTe: string
  ) => Promise<void> | void;
}

export default function ModalChotKetQuaTuan({
  mo,
  onDong,
  item,
  onLuu
}: Props) {
  const [trangThai, setTrangThai] = useState<TrangThaiKetQuaCongViec>('dat_muc_tieu');
  const [ketQua, setKetQua] = useState<string>('');
  const [loi, setLoi] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    if (item && mo) {
      if (item.trang_thai_ket_qua) {
        setTrangThai(item.trang_thai_ket_qua);
      } else if (item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay') {
        setTrangThai('dat_muc_tieu');
      } else {
        setTrangThai('dat_muc_tieu');
      }
      setKetQua(item.ket_qua_thuc_te || '');
      setLoi(null);
    }
  }, [item, mo]);

  if (!mo || !item) return null;

  const tieuDeViec = item.noi_dung_tuan || item.hanh_dong_tuan || item.ten_khach_hang_du_an;
  const dauRaCamKet = item.dau_ra_cam_ket || item.ket_qua_mong_muon;
  const doiTuong = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an;

  const xuLyLuu = async () => {
    const ketQuaTrim = ketQua.trim();
    if (trangThai !== 'dang_thuc_hien' && ketQuaTrim.length < 6) {
      setLoi('Vui lòng nhập rõ kết quả thực tế đạt được (tối thiểu 6 ký tự).');
      return;
    }

    setDangLuu(true);
    try {
      await onLuu(item.id, trangThai, ketQuaTrim);
      onDong();
    } catch (e: any) {
      setLoi(e?.message || 'Có lỗi khi lưu kết quả.');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onDong}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Chốt kết quả công việc
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Đánh giá mức độ hoàn thành và ghi nhận kết quả thực tế
            </p>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="size-8 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Thông tin công việc & Đầu ra cam kết */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2">
            <div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Công việc
              </div>
              <div className="text-xs font-bold text-foreground leading-snug mt-0.5">
                {tieuDeViec}
              </div>
              {doiTuong && doiTuong !== tieuDeViec && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  🏢 {doiTuong}
                </div>
              )}
            </div>

            {dauRaCamKet && (
              <div className="pt-2 border-t border-border/60">
                <div className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                  <Target className="size-3" /> Cam kết ban đầu
                </div>
                <div className="text-xs font-semibold text-foreground mt-0.5">
                  {dauRaCamKet}
                </div>
              </div>
            )}
          </div>

          {/* Chọn 3 trạng thái thực tế */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Trạng thái thực tế:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* 1. Đạt mục tiêu */}
              <button
                type="button"
                onClick={() => {
                  setTrangThai('dat_muc_tieu');
                  setLoi(null);
                }}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
                  trangThai === 'dat_muc_tieu'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" /> Đạt mục tiêu
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-snug">
                  Đã hoàn thành đúng cam kết ban đầu
                </span>
              </button>

              {/* 2. Dở dang */}
              <button
                type="button"
                onClick={() => {
                  setTrangThai('do_dang');
                  setLoi(null);
                }}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
                  trangThai === 'do_dang'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <Clock className="size-4" /> Dở dang
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-snug">
                  Đã làm nhưng chưa dứt điểm, cần theo dõi
                </span>
              </button>

              {/* 3. Không đạt / Dừng */}
              <button
                type="button"
                onClick={() => {
                  setTrangThai('khong_dat');
                  setLoi(null);
                }}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5',
                  trangThai === 'khong_dat'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                    <XCircle className="size-4" /> Không đạt
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground leading-snug">
                  Khách từ chối hoặc dừng công việc
                </span>
              </button>
            </div>

            {/* Tùy chọn chuyển về đang triển khai nếu muốn hủy chốt */}
            {(item.da_hoan_thanh || item.trang_thai_ket_qua) && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setTrangThai('dang_thuc_hien');
                    setLoi(null);
                  }}
                  className={cn(
                    'text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer',
                    trangThai === 'dang_thuc_hien'
                      ? 'text-primary font-bold underline'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <RotateCcw className="size-3" /> Chuyển về Đang triển khai (Chưa xong)
                </button>
              </div>
            )}
          </div>

          {/* Ô nhập kết quả thực tế */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Kết quả thực tế / Lý do cụ thể <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={ketQua}
              onChange={(e) => {
                setKetQua(e.target.value);
                if (loi) setLoi(null);
              }}
              placeholder={
                trangThai === 'dat_muc_tieu'
                  ? 'Ghi rõ kết quả đạt được (VD: Đã làm việc với Phó Chủ tịch, hẹn thứ 5 tuần sau mang hợp đồng sang ký...)'
                  : trangThai === 'do_dang'
                  ? 'Ghi rõ tình hình hiện tại và bước tiếp theo (VD: Khách bận họp, hẹn liên hệ lại vào đầu tháng tới...)'
                  : trangThai === 'khong_dat'
                  ? 'Ghi rõ nguyên nhân không đạt (VD: Đơn vị đã chọn đối tác khác / Chưa có nguồn kinh phí trong năm nay...)'
                  : 'Ghi chú thêm về tiến độ công việc...'
              }
              className="w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
            />
            {loi && (
              <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{loi}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDong}
            disabled={dangLuu}
            className="h-8.5 px-3.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={xuLyLuu}
            disabled={dangLuu}
            className="h-8.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            {dangLuu ? 'Đang lưu...' : 'Lưu kết quả & Trạng thái'}
          </button>
        </div>
      </div>
    </div>
  );
}
