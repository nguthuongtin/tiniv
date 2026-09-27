'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CalendarDays,
  Briefcase,
  Save,
  Send,
  Bookmark
} from 'lucide-react';
import type { BaoCaoCongViec, ChiTietBaoCaoCongViec } from '../../thu_vien/types/bao_cao_cong_viec';
import type {
  CapNhatBaoCaoCongViecDTO,
  TaoMoiBaoCaoCongViecDTO
} from '../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import {
  Ban_Ve,
  Nut,
  The_Chuc_Nang,
  The_Chuc_Nang_Header,
  The_Chuc_Nang_Tieu_De,
  The_Chuc_Nang_Noi_Dung
} from '../ui';

const homNay = () => new Date().toISOString().split('T')[0];

interface FormBaoCaoCongViecDrawerProps {
  mo: boolean;
  onDong: () => void;
  dangSua: BaoCaoCongViec | null;
  ngayMacDinh?: string;
  danhSachDuAn?: { id: string; ten_du_an: string }[];
  onLuu: (
    data: TaoMoiBaoCaoCongViecDTO | CapNhatBaoCaoCongViecDTO,
    banGhi?: BaoCaoCongViec
  ) => Promise<void>;
  dangXuLy: boolean;
  loi?: string | null;
}

const taoDongMoi = (): ChiTietBaoCaoCongViec => ({
  du_an_id: null,
  noi_dung: ''
});

export default function FormBaoCaoCongViecDrawer(props: FormBaoCaoCongViecDrawerProps) {
  const {
    mo,
    onDong,
    dangSua,
    ngayMacDinh,
    onLuu,
    dangXuLy,
    loi
  } = props;

  const [ngayBaoCao, setNgayBaoCao] = useState<string>(homNay());
  const [danhSachDong, setDanhSachDong] = useState<ChiTietBaoCaoCongViec[]>([taoDongMoi()]);
  const [loiCucBo, setLoiCucBo] = useState<string | null>(null);

  const dongCanFocusRef = useRef<number | null>(null);

  // Focus vào dòng mới khi thêm dòng
  useEffect(() => {
    if (dongCanFocusRef.current !== null) {
      const idx = dongCanFocusRef.current;
      const el = document.getElementById(`f-bccv-nd-${idx}`);
      if (el) {
        el.focus();
      }
      dongCanFocusRef.current = null;
    }
  }, [danhSachDong.length]);

  // Khởi tạo dữ liệu form khi mở Drawer
  useEffect(() => {
    if (!mo) return;
    setLoiCucBo(null);
    if (dangSua) {
      const dsChiTiet: ChiTietBaoCaoCongViec[] =
        dangSua.danh_sach_chi_tiet && Array.isArray(dangSua.danh_sach_chi_tiet) && dangSua.danh_sach_chi_tiet.length > 0
          ? dangSua.danh_sach_chi_tiet.map((ct) => ({
              du_an_id: ct.du_an_id ?? null,
              noi_dung: ct.noi_dung || ''
            }))
          : dangSua.noi_dung_thuc_hien
            ? [
                {
                  du_an_id: dangSua.du_an_id ?? null,
                  noi_dung: dangSua.noi_dung_thuc_hien
                }
              ]
            : [taoDongMoi()];

      setNgayBaoCao(dangSua.ngay_bao_cao || homNay());
      setDanhSachDong(dsChiTiet.length > 0 ? dsChiTiet : [taoDongMoi()]);
    } else {
      setNgayBaoCao(ngayMacDinh || homNay());
      setDanhSachDong([taoDongMoi()]);
    }
  }, [mo, dangSua, ngayMacDinh]);

  const capNhatNoiDungDong = (index: number, noiDungMoi: string) => {
    setDanhSachDong((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], noi_dung: noiDungMoi };
      }
      return copy;
    });
  };

  const themDong = () => {
    dongCanFocusRef.current = danhSachDong.length;
    setDanhSachDong((prev) => [...prev, taoDongMoi()]);
  };

  const xoaDong = (index: number) => {
    setDanhSachDong((prev) => {
      if (prev.length <= 1) {
        return [{ du_an_id: null, noi_dung: '' }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Xử lý phím Enter để tạo dòng mới ngay lập tức
  const xuLyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === danhSachDong.length - 1) {
        themDong();
      } else {
        const nextEl = document.getElementById(`f-bccv-nd-${index + 1}`);
        if (nextEl) nextEl.focus();
      }
    }
  };

  // Xử lý dán nhiều dòng: nếu dán nhiều dòng, tự tách thành các dòng việc
  const xuLyPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const text = e.clipboardData.getData('text');
    if (!text || !text.includes('\n')) return;

    const lines = text
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((l) => l.length > 0);

    if (lines.length > 1) {
      e.preventDefault();
      setDanhSachDong((prev) => {
        const trc = prev.slice(0, index);
        const sau = prev.slice(index + 1);
        const chen = lines.map((l) => ({ du_an_id: null, noi_dung: l }));
        return [...trc, ...chen, ...sau];
      });
    }
  };

  const thucHienLuu = async (trangThai: 'tam_luu' | 'da_gui') => {
    // 1. Force blur active element trên mobile
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setLoiCucBo(null);

    // 2. Thu thập danh sách chi tiết hợp lệ
    const danhSachChuanHoa = danhSachDong
      .map((ct) => ({
        du_an_id: ct.du_an_id ?? null,
        noi_dung: (ct.noi_dung || '').trim()
      }))
      .filter((ct) => ct.noi_dung.length > 0);

    if (danhSachChuanHoa.length === 0) {
      setLoiCucBo('Vui lòng nhập ít nhất một nội dung công việc.');
      return;
    }

    if (!ngayBaoCao) {
      setLoiCucBo('Ngày báo cáo không được để trống.');
      return;
    }

    if (dangSua) {
      const dto: CapNhatBaoCaoCongViecDTO = {
        ngay_bao_cao: ngayBaoCao,
        danh_sach_chi_tiet: danhSachChuanHoa,
        kho_khan: null,
        trang_thai: trangThai
      };
      await onLuu(dto, dangSua);
    } else {
      const dto: TaoMoiBaoCaoCongViecDTO = {
        ngay_bao_cao: ngayBaoCao,
        danh_sach_chi_tiet: danhSachChuanHoa,
        kho_khan: null,
        trang_thai: trangThai
      };
      await onLuu(dto);
    }
  };

  const laBanNhap = dangSua?.trang_thai === 'tam_luu';

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="size-4" />
          </div>
          <div>
            <div className="font-bold text-foreground text-base sm:text-lg flex items-center gap-2">
              <span>{dangSua ? 'Cập nhật báo cáo công việc' : 'Báo cáo công việc ngày'}</span>
              {laBanNhap && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30">
                  Tạm lưu
                </span>
              )}
            </div>
          </div>
        </div>
      }
      phu_de=""
      cuoi={
        <div className="flex items-center justify-between gap-2 w-full flex-wrap">
          <Nut kieu="ghost" kich_thuoc="sm" onClick={onDong} type="button" disabled={dangXuLy}>
            Đóng
          </Nut>
          <div className="flex items-center gap-2">
            <Nut
              kieu="outline"
              kich_thuoc="sm"
              icon_trai={Save}
              type="button"
              onClick={() => void thucHienLuu('tam_luu')}
              disabled={dangXuLy}
              className="border-[#FF9500]/40 text-[#FF9500] hover:bg-[#FF9500]/10 font-semibold"
            >
              {dangXuLy ? 'Đang lưu...' : 'Tạm lưu báo cáo'}
            </Nut>
            <button
              type="button"
              onClick={() => void thucHienLuu('da_gui')}
              disabled={dangXuLy}
              className="h-9 px-4 rounded-xl font-bold text-xs text-white bg-[#107555] hover:bg-[#0d6146] shadow-sm shadow-emerald-700/20 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
            >
              <Send className="size-3.5" />
              {dangXuLy ? 'Đang gửi...' : laBanNhap ? 'Hoàn thành & Gửi' : dangSua ? 'Lưu & Gửi báo cáo' : 'Gửi báo cáo'}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="form-bao-cao-cong-viec"
        onSubmit={(e) => {
          e.preventDefault();
          void thucHienLuu('da_gui');
        }}
        className="space-y-5"
      >
        {laBanNhap && (
          <div className="rounded-xl border border-[#FF9500]/30 bg-[#FF9500]/10 p-3 text-xs text-amber-900 flex items-center gap-2">
            <Bookmark className="size-4 shrink-0 text-[#FF9500]" />
            <span>
              Báo cáo này đang ở chế độ <strong>Tạm lưu</strong>. Hãy nhập thêm công việc mới hoặc nhấn <strong>Gửi báo cáo</strong> khi hoàn tất trong ngày.
            </span>
          </div>
        )}

        {(loi || loiCucBo) && (
          <div className="rounded-[var(--radius-input)] border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger font-medium flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{loi || loiCucBo}</span>
          </div>
        )}

        {/* Section 1: Ngày báo cáo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-1 pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Thời gian báo cáo
            </span>
            <div className="h-[1px] bg-slate-200 flex-1" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="f-bccv-ngay" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-emerald-600" />
              Ngày báo cáo
            </label>
            <input
              id="f-bccv-ngay"
              type="date"
              disabled={dangXuLy}
              value={ngayBaoCao}
              onChange={(e) => setNgayBaoCao(e.target.value)}
              className="w-full h-10 px-3.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition disabled:opacity-50 font-bold"
            />
          </div>
        </div>

        {/* Section 2: Danh sách công việc */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2 pt-1 pb-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Nội dung công việc trong ngày
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">
              {danhSachDong.length} công việc
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Mỗi công việc nhập trên 1 dòng. Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700">Enter</kbd> để thêm dòng mới nhanh.
          </p>

          <div className="space-y-2">
            {danhSachDong.map((dong, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group"
              >
                <span className="size-7 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold inline-flex items-center justify-center shrink-0 border border-emerald-100">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <input
                    id={`f-bccv-nd-${index}`}
                    type="text"
                    autoComplete="off"
                    disabled={dangXuLy}
                    value={dong.noi_dung}
                    onChange={(e) => capNhatNoiDungDong(index, e.target.value)}
                    onKeyDown={(e) => xuLyKeyDown(e, index)}
                    onPaste={(e) => xuLyPaste(e, index)}
                    placeholder={`Nội dung công việc ${index + 1}...`}
                    className="w-full h-10 px-3 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition disabled:opacity-50 font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => xoaDong(index)}
                  disabled={dangXuLy}
                  className="size-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center transition disabled:opacity-50 shrink-0 cursor-pointer"
                  title="Xóa dòng"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Nút thêm dòng */}
          <div className="pt-2">
            <button
              type="button"
              onClick={themDong}
              disabled={dangXuLy}
              className="w-full h-10 px-3 text-xs font-bold border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-50 rounded-xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="size-4" /> Thêm dòng công việc mới (Enter)
            </button>
          </div>
        </div>
      </form>
    </Ban_Ve>
  );
}
