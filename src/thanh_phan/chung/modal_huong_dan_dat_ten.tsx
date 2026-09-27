'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Building2, FolderGit2, ArrowRight } from 'lucide-react';
import {
  MAU_DAT_TEN_KHACH_HANG,
  GIAI_PHAP_DU_AN_PHO_BIEN,
  sinhTenDuAnGoiY
} from '../../thu_vien/quy_chuan_dat_ten';

interface ModalHuongDanDatTenProps {
  mo: boolean;
  onDong: () => void;
  loaiMacDinh?: 'khach_hang' | 'du_an';
  tenKhachHangHienTai?: string | null;
  onChonMau?: (mau: string) => void;
}

export const ModalHuongDanDatTen: React.FC<ModalHuongDanDatTenProps> = ({
  mo,
  onDong,
  loaiMacDinh = 'du_an',
  tenKhachHangHienTai,
  onChonMau
}) => {
  const [tabHienTai, setTabHienTai] = useState<'khach_hang' | 'du_an'>(loaiMacDinh);

  useEffect(() => {
    if (mo) {
      setTabHienTai(loaiMacDinh);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onDong();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [mo, loaiMacDinh, onDong]);

  if (!mo) return null;

  const handleChon = (giaTri: string) => {
    const valUpper = giaTri.trim().toUpperCase();
    if (onChonMau) {
      onChonMau(valUpper);
      onDong();
    } else {
      void navigator.clipboard.writeText(valUpper);
      onDong();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onDong} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-xl flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header gọn gàng */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Gợi ý đặt tên (Tự động VIẾT HOA)
              </h3>
              <p className="text-[11px] text-slate-500">
                Bấm vào mẫu gợi ý bên dưới để áp dụng nhanh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="px-5 pt-2.5 border-b border-slate-100 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTabHienTai('khach_hang')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                tabHienTai === 'khach_hang'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-md'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Gợi ý tên Khách hàng</span>
            </button>
            <button
              type="button"
              onClick={() => setTabHienTai('du_an')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                tabHienTai === 'du_an'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-md'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderGit2 className="size-3.5" />
              <span>Gợi ý tên Dự án / Giải pháp</span>
            </button>
          </div>
        </div>

        {/* Nội dung danh sách gợi ý tinh gọn */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3 text-xs">
          {tabHienTai === 'khach_hang' ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Các mẫu tên Khách hàng chuẩn (Bấm để áp dụng):
              </div>
              <div className="space-y-2">
                {MAU_DAT_TEN_KHACH_HANG.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChon(m.mau)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/60 transition text-left group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-900 font-mono text-xs">
                        {m.mau}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.nhan}</div>
                    </div>
                    <ArrowRight className="size-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {tenKhachHangHienTai
                  ? `Giải pháp theo Khách hàng "${tenKhachHangHienTai.toUpperCase()}" (Bấm để áp dụng):`
                  : 'Các loại Sản phẩm / Giải pháp (Bấm để áp dụng):'}
              </div>
              <div className="space-y-2">
                {GIAI_PHAP_DU_AN_PHO_BIEN.map((gp, idx) => {
                  const tenDayDu = sinhTenDuAnGoiY(gp, tenKhachHangHienTai);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChon(tenDayDu)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/60 transition text-left group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-900 font-mono text-xs">
                          {tenDayDu}
                        </div>
                        {tenKhachHangHienTai && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Giải pháp: {gp}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="size-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 italic">
            Tự động viết hoa toàn bộ khi lưu
          </span>
          <button
            type="button"
            onClick={onDong}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHuongDanDatTen;
