'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const DANH_SACH_LY_DO_THAT_BAI = [
  'Giá cao hơn đối thủ cạnh tranh',
  'Khách hàng hoãn / hủy bỏ kế hoạch đầu tư',
  'Không đáp ứng yêu cầu kỹ thuật / tính năng đặc thù',
  'Khách hàng chọn đối thủ khác',
  'Thiếu ngân sách / Không duyệt được chi phí',
  'Khách hàng không phản hồi / Mất liên lạc',
  'Lý do khác'
] as const;

interface ModalLyDoHuyDuAnProps {
  mo: boolean;
  onDong: () => void;
  onXacNhan: (lyDo: string, ghiChu?: string) => Promise<void>;
  dangXuLy?: boolean;
}

export const ModalLyDoHuyDuAn: React.FC<ModalLyDoHuyDuAnProps> = ({
  mo,
  onDong,
  onXacNhan,
  dangXuLy = false
}) => {
  const [lyDoChon, setLyDoChon] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [loi, setLoi] = useState<string | null>(null);

  if (!mo) return null;

  const handleXacNhan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lyDoChon) {
      setLoi('Vui lòng chọn lý do thất bại / hủy dự án.');
      return;
    }
    setLoi(null);
    try {
      await onXacNhan(lyDoChon, ghiChu.trim() || undefined);
      setLyDoChon('');
      setGhiChu('');
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi xảy ra khi xác nhận hủy dự án.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] bg-card shadow-2xl overflow-hidden border border-border">
        <div className="flex items-center justify-between border-b border-border bg-destructive/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="p-1.5 bg-destructive/15 rounded-lg text-destructive">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Xác nhận hủy dự án</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            disabled={dangXuLy}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleXacNhan} className="p-5 space-y-4">
          {loi && (
            <div className="rounded-[var(--radius-input)] border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {loi}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Lý do dừng / hủy dự án <span className="text-destructive">*</span>
            </label>
            <div className="space-y-1.5">
              {DANH_SACH_LY_DO_THAT_BAI.map((lyDo) => (
                <label
                  key={lyDo}
                  className={`flex items-center gap-2.5 p-2.5 rounded-[var(--radius-input)] border text-xs font-medium cursor-pointer transition ${
                    lyDoChon === lyDo
                      ? 'border-destructive bg-destructive/10 text-destructive shadow-xs'
                      : 'border-border bg-muted/20 text-foreground hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="ly_do_that_bai"
                    value={lyDo}
                    checked={lyDoChon === lyDo}
                    onChange={() => setLyDoChon(lyDo)}
                    className="text-destructive focus:ring-destructive size-3.5"
                  />
                  <span>{lyDo}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Ghi chú thêm
            </label>
            <textarea
              rows={3}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi nhận thông tin phản hồi của khách hàng hoặc bài học kinh nghiệm..."
              className="w-full rounded-[var(--radius-input)] border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onDong}
              disabled={dangXuLy}
              className="rounded-[var(--radius-input)] border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangXuLy || !lyDoChon}
              className="rounded-[var(--radius-input)] bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground shadow hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {dangXuLy ? 'Đang lưu...' : 'Xác nhận hủy dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
