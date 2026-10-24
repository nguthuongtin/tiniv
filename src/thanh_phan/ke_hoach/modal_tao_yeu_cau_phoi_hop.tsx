'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Send, Link2, Calendar, FolderKanban, Loader2, Sparkles, Search, Check, ChevronDown } from 'lucide-react';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import { taoYeuCauPhoiHopMoi, type YeuCauPhoiHop } from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';

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
  const [tuKhoaDuAn, setTuKhoaDuAn] = useState('');
  const [moDropdownDuAn, setMoDropdownDuAn] = useState(false);
  const [noiDung, setNoiDung] = useState(noiDungGoiY);
  const [linkDrive, setLinkDrive] = useState('');
  const [hanXong, setHanXong] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const inputSearchRef = useRef<HTMLInputElement>(null);

  // Đồng bộ lại dữ liệu mỗi khi mở modal
  useEffect(() => {
    if (mo) {
      setDuAnId(duAnMacDinh?.id || '');
      setTuKhoaDuAn('');
      setMoDropdownDuAn(false);
      setNoiDung(noiDungGoiY || '');
      setLinkDrive('');
      setLoi('');
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setHanXong(d.toISOString().slice(0, 10));
    }
  }, [mo, duAnMacDinh, noiDungGoiY]);

  // Dự án đang chọn
  const duAnChon = useMemo(() => {
    return danhSachDuAn.find((d) => d.id === (duAnId || duAnMacDinh?.id)) || duAnMacDinh || null;
  }, [danhSachDuAn, duAnId, duAnMacDinh]);

  // Lọc danh sách dự án tìm kiếm
  const dsDuAnLoc = useMemo(() => {
    const list = danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa');
    if (!tuKhoaDuAn.trim()) return list.slice(0, 50);
    const kw = tuKhoaDuAn.toLowerCase().trim();
    return list
      .filter((d) =>
        d.ten_du_an.toLowerCase().includes(kw) ||
        (d.ma_ho_so && d.ma_ho_so.toLowerCase().includes(kw))
      )
      .slice(0, 50);
  }, [danhSachDuAn, tuKhoaDuAn]);

  if (!mo) return null;

  const handleGui = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duAnChon) {
      setLoi('Vui lòng chọn Dự án cần phối hợp.');
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      {/* Background card với màu nền trắng/dark tuyệt đối */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                Tạo yêu cầu phối hợp
              </h3>
              <p className="text-xs text-slate-500">
                Gửi nội dung cần hỗ trợ sang bộ phận liên quan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loi && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {loi}
          </div>
        )}

        <form onSubmit={handleGui} className="space-y-4">
          {/* Dự án áp dụng - Searchable Combobox */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FolderKanban className="size-3.5 text-primary" />
              <span>Dự án áp dụng *</span>
            </label>

            {duAnChon && !moDropdownDuAn ? (
              <div className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2 truncate">
                  <FolderKanban className="size-4 text-primary shrink-0" />
                  <span className="truncate text-slate-900 dark:text-slate-100 font-bold">{duAnChon.ten_du_an}</span>
                </div>
                {!duAnMacDinh && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoDropdownDuAn(true);
                      setTimeout(() => inputSearchRef.current?.focus(), 50);
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold shrink-0 cursor-pointer"
                  >
                    Đổi dự án
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="size-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    ref={inputSearchRef}
                    type="text"
                    value={tuKhoaDuAn}
                    onChange={(e) => {
                      setTuKhoaDuAn(e.target.value);
                      setMoDropdownDuAn(true);
                    }}
                    onFocus={() => setMoDropdownDuAn(true)}
                    placeholder="Gõ tên hoặc mã dự án để tìm kiếm..."
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8.5 pr-8 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
                    autoFocus
                  />
                  <ChevronDown className="size-3.5 absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>

                {moDropdownDuAn && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMoDropdownDuAn(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-700">
                      {dsDuAnLoc.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 italic">
                          Không tìm thấy dự án phù hợp
                        </div>
                      ) : (
                        dsDuAnLoc.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              setDuAnId(d.id);
                              setMoDropdownDuAn(false);
                              setLoi('');
                            }}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition text-xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {d.ten_du_an}
                              </div>
                              {d.ma_ho_so && (
                                <div className="text-[10.5px] text-slate-500 font-mono">
                                  {d.ma_ho_so}
                                </div>
                              )}
                            </div>
                            {duAnId === d.id && (
                              <Check className="size-3.5 text-primary shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Nội dung yêu cầu */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Nội dung yêu cầu *
            </label>
            <textarea
              rows={3}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Nhập nội dung cần hỗ trợ hoặc phối hợp..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-slate-400"
              required
            />
          </div>

          {/* Link Google Drive đầu vào */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Link2 className="size-3.5 text-slate-400" />
                <span>Link Google Drive tài liệu (nếu có)</span>
              </label>
              <span className="text-[11px] text-slate-400">Tùy chọn</span>
            </div>
            <input
              type="url"
              value={linkDrive}
              onChange={(e) => setLinkDrive(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
            />
          </div>

          {/* Hạn hoàn thành */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                <span>Thời hạn hoàn thành</span>
              </label>
              <div className="flex items-center gap-1">
                {[
                  { nhan: 'Mai', so: 1 },
                  { nhan: '+2 ngày', so: 2 },
                  { nhan: '+1 tuần', so: 7 }
                ].map((chip) => (
                  <button
                    key={chip.nhan}
                    type="button"
                    onClick={() => setNgayNhanh(chip.so)}
                    className="px-2 py-0.5 rounded-md text-[10.5px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition"
                  >
                    {chip.nhan}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="date"
              value={hanXong}
              onChange={(e) => setHanXong(e.target.value)}
              className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onDong}
              disabled={dangGui}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangGui}
              className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90 transition disabled:opacity-50"
            >
              {dangGui ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
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
