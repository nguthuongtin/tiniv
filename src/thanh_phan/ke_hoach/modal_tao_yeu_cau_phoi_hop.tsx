'use client';

import { useState, useEffect } from 'react';
import { X, Send, Link2, Calendar, FolderKanban, Loader2, Sparkles } from 'lucide-react';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import { taoYeuCauPhoiHopMoi, type YeuCauPhoiHop } from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';

interface Props {
  mo: boolean;
  onDong: () => void;
  duAnMacDinh?: HoSoDuAn | null;
  danhSachDuAn: HoSoDuAn[];
  noiDungGoiY?: string;
  nguoiDungHienTai?: { id: string; ho_va_ten?: string | null; [key: string]: any } | null;
  onTaoThanhCong?: (yeuCau: YeuCauPhoiHop) => void;
}

export default function ModalTaoYeuCauPhoiHop({
  mo,
  onDong,
  duAnMacDinh,
  danhSachDuAn,
  noiDungGoiY = '',
  nguoiDungHienTai,
  onTaoThanhCong
}: Props) {
  const { nguoiDungHienTai: userFromStore } = useStoreXacThuc();
  const userHieuLuc = nguoiDungHienTai || userFromStore;

  const [duAnId, setDuAnId] = useState(duAnMacDinh?.id || '');
  const [noiDung, setNoiDung] = useState(noiDungGoiY);
  const [linkDrive, setLinkDrive] = useState('');
  const [hanXong, setHanXong] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');

  // Đồng bộ lại dữ liệu mỗi khi mở modal
  useEffect(() => {
    if (mo) {
      setDuAnId(duAnMacDinh?.id || '');
      setNoiDung(noiDungGoiY || '');
      setLinkDrive('');
      setLoi('');
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setHanXong(d.toISOString().slice(0, 10));
    }
  }, [mo, duAnMacDinh, noiDungGoiY]);

  if (!mo) return null;

  const duAnChon = danhSachDuAn.find((d) => d.id === (duAnId || duAnMacDinh?.id)) || duAnMacDinh;

  const handleGui = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duAnChon) {
      setLoi('Vui lòng chọn Dự án.');
      return;
    }
    if (!noiDung.trim()) {
      setLoi('Vui lòng nhập nội dung yêu cầu.');
      return;
    }

    try {
      setDangGui(true);
      setLoi('');
      const yc = await taoYeuCauPhoiHopMoi(
        {
          du_an_id: duAnChon.id,
          ten_du_an: duAnChon.ten_du_an,
          khach_hang_id: duAnChon.khach_hang_id || null,
          ten_khach_hang: null,
          noi_dung_yeu_cau: noiDung.trim(),
          link_drive_dau_vao: linkDrive.trim() || null,
          han_hoan_thanh: hanXong || null
        },
        userHieuLuc
      );

      if (onTaoThanhCong) {
        onTaoThanhCong(yc);
      }
      onDong();
    } catch (err: any) {
      setLoi(err?.message || 'Không thể tạo yêu cầu. Vui lòng thử lại.');
    } finally {
      setDangGui(false);
    }
  };

  const setNgayNhanh = (soNgay: number) => {
    const d = new Date();
    d.setDate(d.getDate() + soNgay);
    setHanXong(d.toISOString().slice(0, 10));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                Tạo yêu cầu phối hợp
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loi && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {loi}
          </div>
        )}

        <form onSubmit={handleGui} className="space-y-4">
          {/* Dự án áp dụng */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <FolderKanban className="size-3.5 text-indigo-600" />
              <span>Dự án áp dụng *</span>
            </label>

            {duAnMacDinh ? (
              <div className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-300">
                <FolderKanban className="size-4 text-indigo-600 shrink-0" />
                <span className="truncate">{duAnMacDinh.ten_du_an}</span>
              </div>
            ) : (
              <select
                value={duAnId}
                onChange={(e) => setDuAnId(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              >
                <option value="">-- Chọn dự án --</option>
                {danhSachDuAn
                  .filter((d) => d.trang_thai !== 'da_xoa')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.ten_du_an}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Nội dung yêu cầu */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Nội dung yêu cầu *
            </label>
            <textarea
              rows={3}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Nhập nội dung cần hỗ trợ hoặc phối hợp..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none placeholder:text-slate-400"
              required
              autoFocus
            />
          </div>

          {/* Link Google Drive đầu vào */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <Link2 className="size-3.5 text-blue-600" />
                <span>Link Google Drive tài liệu (nếu có)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Tùy chọn</span>
            </label>
            <input
              type="url"
              value={linkDrive}
              onChange={(e) => setLinkDrive(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400"
            />
          </div>

          {/* Hạn hoàn thành */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-500" />
                <span>Thời hạn hoàn thành</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNgayNhanh(1)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                >
                  Mai
                </button>
                <button
                  type="button"
                  onClick={() => setNgayNhanh(2)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                >
                  +2 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setNgayNhanh(7)}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                >
                  +1 tuần
                </button>
              </div>
            </div>
            <input
              type="date"
              value={hanXong}
              onChange={(e) => setHanXong(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onDong}
              disabled={dangGui}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangGui}
              className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition disabled:opacity-50"
            >
              {dangGui ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Gửi yêu cầu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
