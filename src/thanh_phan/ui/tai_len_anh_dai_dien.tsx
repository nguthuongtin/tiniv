'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, Upload, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { DaiDien } from './dai_dien';
import { nenVaThuNhoAnh } from '../../thu_vien/utils/xu_ly_anh';
import { cn } from '../../thu_vien/utils/cn';

interface TaiLenAnhDaiDienProps {
  url_anh?: string | null;
  ho_ten?: string;
  khiThayDoi: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function TaiLenAnhDaiDien({
  url_anh,
  ho_ten = '',
  khiThayDoi,
  disabled = false,
  className
}: TaiLenAnhDaiDienProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienNhapUrl, setHienNhapUrl] = useState(false);
  const [urlTam, setUrlTam] = useState(url_anh || '');
  const [loi, setLoi] = useState<string | null>(null);

  // Đồng bộ khi url_anh từ component cha thay đổi
  useEffect(() => {
    setUrlTam(url_anh || '');
  }, [url_anh]);

  const xuLyChonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDangXuLy(true);
    setLoi(null);
    try {
      // Tự động resize ảnh về kích thước tối đa 256px và nén chất lượng cao ~15KB - 25KB
      const dataUrlNen = await nenVaThuNhoAnh(file, 256, 0.85);
      setUrlTam(dataUrlNen);
      khiThayDoi(dataUrlNen);
    } catch (err: any) {
      setLoi(err?.message || 'Không thể xử lý ảnh này.');
    } finally {
      setDangXuLy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const xuLyXoaAnh = () => {
    setUrlTam('');
    khiThayDoi(null);
    setLoi(null);
  };

  const xuLyLuuUrl = () => {
    const val = urlTam.trim();
    khiThayDoi(val || null);
    setHienNhapUrl(false);
  };

  const anhHienThi = url_anh || urlTam || undefined;

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-4">
        {/* Avatar Preview with Camera Overlay */}
        <div className="relative group shrink-0">
          <DaiDien
            ten={ho_ten || 'A'}
            anh={anhHienThi}
            kich_thuoc="xl"
            className="size-16 sm:size-20 border-2 border-border shadow-md"
          />

          <button
            type="button"
            disabled={disabled || dangXuLy}
            onClick={() => fileInputRef.current?.click()}
            title="Tải ảnh từ máy"
            className="absolute inset-0 rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {dangXuLy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Camera className="size-5" />
                <span className="text-[10px] font-semibold mt-0.5">Tải ảnh</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={xuLyChonFile}
            disabled={disabled || dangXuLy}
          />
        </div>

        {/* Action Controls */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={disabled || dangXuLy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition shadow-xs"
            >
              <Upload className="size-3.5 text-primary" />
              Tải ảnh lên
            </button>

            {url_anh && (
              <button
                type="button"
                disabled={disabled || dangXuLy}
                onClick={xuLyXoaAnh}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-destructive/20 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
              >
                <Trash2 className="size-3.5" />
                Xóa
              </button>
            )}

            <button
              type="button"
              onClick={() => setHienNhapUrl((h) => !h)}
              className="text-[11.5px] text-muted-foreground hover:text-primary transition underline underline-offset-2 ml-1"
            >
              {hienNhapUrl ? 'Đóng' : 'Nhập URL'}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Hỗ trợ JPG, PNG, WEBP. Ảnh tự động tối ưu & nén gọn (~20KB) để tiết kiệm dung lượng.
          </p>

          {loi && (
            <p className="text-xs text-destructive font-medium">{loi}</p>
          )}
        </div>
      </div>

      {/* Optional URL input box */}
      {hienNhapUrl && (
        <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
          <input
            type="url"
            value={urlTam}
            onChange={(e) => setUrlTam(e.target.value)}
            placeholder="Dán đường dẫn ảnh: https://..."
            className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={xuLyLuuUrl}
            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}

export default TaiLenAnhDaiDien;
