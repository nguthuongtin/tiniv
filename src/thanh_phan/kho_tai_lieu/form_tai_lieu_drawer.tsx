'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  Sparkles,
  Pin,
  Building2,
  User,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type {
  TaiLieuLienKet,
  TaoTaiLieuDTO,
  CapNhatTaiLieuDTO,
  PhamViTaiLieu,
  LoaiLienKet
} from '../../thu_vien/types/kho_tai_lieu';
import { DANH_MUC_GOI_Y } from '../../thu_vien/types/kho_tai_lieu';

interface FormTaiLieuDrawerProps {
  mo: boolean;
  khiDong: () => void;
  dangSua: TaiLieuLienKet | null;
  khiLuu: (dto: TaoTaiLieuDTO | CapNhatTaiLieuDTO) => Promise<void>;
  dangXuLy?: boolean;
  loiThongBao?: string | null;
}

export default function FormTaiLieuDrawer({
  mo,
  khiDong,
  dangSua,
  khiLuu,
  dangXuLy = false,
  loiThongBao = null
}: FormTaiLieuDrawerProps) {
  const [url, setUrl] = useState('');
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [phamVi, setPhamVi] = useState<PhamViTaiLieu>('chung');
  const [danhMuc, setDanhMuc] = useState('Biểu mẫu & Hợp đồng');
  const [loaiLienKet, setLoaiLienKet] = useState<LoaiLienKet>('trang_web');
  const [theTags, setTheTags] = useState('');
  const [ghim, setGhim] = useState(false);

  const [dangQuet, setDangQuet] = useState(false);
  const [loiUrl, setLoiUrl] = useState<string | null>(null);
  const [loiTieuDe, setLoiTieuDe] = useState<string | null>(null);

  const laSua = Boolean(dangSua);

  // Sync khi mở form hoặc khi dangSua thay đổi
  useEffect(() => {
    if (dangSua) {
      setUrl(dangSua.url || '');
      setTieuDe(dangSua.tieu_de || '');
      setMoTa(dangSua.mo_ta || '');
      setPhamVi(dangSua.pham_vi || 'chung');
      setDanhMuc(dangSua.danh_muc || 'Biểu mẫu & Hợp đồng');
      setLoaiLienKet(dangSua.loai_lien_ket || 'trang_web');
      setTheTags((dangSua.the_tags ?? []).join(', '));
      setGhim(Boolean(dangSua.ghim));
    } else {
      setUrl('');
      setTieuDe('');
      setMoTa('');
      setPhamVi('chung');
      setDanhMuc('Biểu mẫu & Hợp đồng');
      setLoaiLienKet('trang_web');
      setTheTags('');
      setGhim(false);
    }
    setLoiUrl(null);
    setLoiTieuDe(null);
  }, [dangSua, mo]);

  // Chỉ lấy TÊN TÀI LIỆU từ đường link
  const quetThongTinLink = async (targetUrl?: string) => {
    const linkCanQuet = (targetUrl || url).trim();
    if (!linkCanQuet) return;

    if (!linkCanQuet.startsWith('http://') && !linkCanQuet.startsWith('https://')) {
      setLoiUrl('Link cần bắt đầu bằng https://');
      return;
    }

    setLoiUrl(null);
    setDangQuet(true);

    try {
      const res = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkCanQuet })
      });

      const kq = await res.json();
      if (kq.thanh_cong && kq.du_lieu) {
        const d = kq.du_lieu;
        if (d.tieu_de) {
          setTieuDe(d.tieu_de);
          setLoiTieuDe(null);
        }
        if (d.loai_lien_ket) {
          setLoaiLienKet(d.loai_lien_ket);
        }
      }
    } catch {
      // Bỏ qua lỗi kết nối
    } finally {
      setDangQuet(false);
    }
  };

  const xuLyPasteUrl = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted && (pasted.startsWith('http://') || pasted.startsWith('https://'))) {
      setUrl(pasted);
      void quetThongTinLink(pasted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let coLoi = false;

    if (!url.trim()) {
      setLoiUrl('Vui lòng nhập đường link');
      coLoi = true;
    }
    if (!tieuDe.trim()) {
      setLoiTieuDe('Vui lòng nhập tên tài liệu');
      coLoi = true;
    }

    if (coLoi) return;

    // Chuẩn hóa tags nếu người dùng có gõ
    const tagsArr = theTags
      .split(/[,;\s]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)
      .map((t) => `#${t}`);

    const duLieu = {
      url: url.trim(),
      tieu_de: tieuDe.trim(),
      mo_ta: moTa.trim() || null,
      pham_vi: phamVi,
      danh_muc: danhMuc.trim() || 'Khác',
      loai_lien_ket: loaiLienKet,
      the_tags: tagsArr,
      ghim: ghim
    };

    if (dangSua) {
      await khiLuu({ ...duLieu, id: dangSua.id });
    } else {
      await khiLuu(duLieu);
    }
  };

  if (!mo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={khiDong}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog đơn giản, gọn gàng */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-5 border-b border-slate-200/80 bg-white">
          <h2 className="font-bold text-slate-900 text-base">
            {laSua ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
          </h2>
          <button
            type="button"
            onClick={khiDong}
            aria-label="Đóng"
            className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {loiThongBao && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{loiThongBao}</span>
            </div>
          )}

          {/* 1. Đường link URL */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Đường link liên kết <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (loiUrl) setLoiUrl(null);
                }}
                onPaste={xuLyPasteUrl}
                placeholder="Dán link Google Drive, Docs, Sheets, Figma..."
                className={cn(
                  'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition',
                  loiUrl && '!border-rose-400 !bg-rose-50/50'
                )}
              />
              <button
                type="button"
                onClick={() => void quetThongTinLink()}
                disabled={dangQuet || !url.trim()}
                title="Lấy tên tài liệu từ link"
                className="px-3 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition shrink-0 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {dangQuet ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5 text-emerald-600" />
                )}
                <span>Lấy tên</span>
              </button>
            </div>
            {loiUrl && <p className="text-[11px] text-rose-600 mt-1">{loiUrl}</p>}
          </div>

          {/* 2. Tiêu đề tài liệu */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tên tài liệu / Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={tieuDe}
              onChange={(e) => {
                setTieuDe(e.target.value);
                if (loiTieuDe) setLoiTieuDe(null);
              }}
              placeholder="Ví dụ: Quy trình thanh toán công tác phí 2026"
              className={cn(
                'w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-medium',
                loiTieuDe && '!border-rose-400 !bg-rose-50/50'
              )}
            />
            {loiTieuDe && <p className="text-[11px] text-rose-600 mt-1">{loiTieuDe}</p>}
          </div>

          {/* 3. Phạm vi lưu trữ (Công ty / Cá nhân) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Phạm vi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhamVi('chung')}
                className={cn(
                  'h-9 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                  phamVi === 'chung'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                <Building2 className="size-3.5" />
                <span>🏢 Kho công ty (Chung)</span>
              </button>
              <button
                type="button"
                onClick={() => setPhamVi('rieng')}
                className={cn(
                  'h-9 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                  phamVi === 'rieng'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                <User className="size-3.5" />
                <span>👤 Kho của tôi (Riêng)</span>
              </button>
            </div>
          </div>

          {/* 4. Danh mục & Loại file (2 cột) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Danh mục
              </label>
              <input
                type="text"
                list="ds-danh-muc-simple"
                value={danhMuc}
                onChange={(e) => setDanhMuc(e.target.value)}
                placeholder="Chọn hoặc nhập danh mục"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <datalist id="ds-danh-muc-simple">
                {DANH_MUC_GOI_Y.map((dm) => (
                  <option key={dm} value={dm} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Loại file
              </label>
              <select
                value={loaiLienKet}
                onChange={(e) => setLoaiLienKet(e.target.value as LoaiLienKet)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer"
              >
                <option value="google_sheets">Google Sheets</option>
                <option value="google_docs">Google Docs</option>
                <option value="google_drive">Google Drive</option>
                <option value="google_slides">Google Slides</option>
                <option value="figma">Figma</option>
                <option value="canva">Canva</option>
                <option value="pdf">Tệp PDF</option>
                <option value="video">Video</option>
                <option value="trang_web">Trang web khác</option>
              </select>
            </div>
          </div>

          {/* 5. Thẻ tags (tự nhập nếu muốn) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Thẻ tags (tùy chọn)
            </label>
            <input
              type="text"
              value={theTags}
              onChange={(e) => setTheTags(e.target.value)}
              placeholder="Nhập thẻ tag nếu cần (cách nhau bằng dấu phẩy)..."
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* 6. Mô tả / Ghi chú (tùy chọn) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Ghi chú thêm (tùy chọn)
            </label>
            <input
              type="text"
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Ghi chú nhanh mục đích sử dụng..."
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* 7. Ghim */}
          <div className="pt-0.5">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ghim}
                onChange={(e) => setGhim(e.target.checked)}
                className="size-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Pin className="size-3.5 text-amber-500" />
                <span>Ghim tài liệu lên đầu danh sách</span>
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={khiDong}
              className="px-4 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangXuLy}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="size-3.5" />
              <span>{dangXuLy ? 'Đang lưu…' : laSua ? 'Lưu thay đổi' : 'Lưu tài liệu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
