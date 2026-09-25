'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Building2,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import {
  QUY_CHUAN_KHACH_HANG,
  QUY_CHUAN_DU_AN,
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
  const [daCopyId, setDaCopyId] = useState<string | null>(null);

  // Đồng bộ tab khi mở lại và hỗ trợ ESC
  React.useEffect(() => {
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

  const namHienTai = new Date().getFullYear();

  const handleCopyHoacChon = (giaTri: string, id: string) => {
    if (onChonMau) {
      onChonMau(giaTri);
      onDong();
    } else {
      void navigator.clipboard.writeText(giaTri);
      setDaCopyId(id);
      setTimeout(() => setDaCopyId(null), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onDong}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Quy chuẩn đặt tên chuẩn hóa
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="size-3 text-emerald-600" />
                  Chuẩn TINIPMS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy tắc thống nhất giúp dễ tìm kiếm, báo cáo và phân loại trên toàn hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition shadow-xs"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="px-6 pt-3 pb-0 border-b border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTabHienTai('khach_hang')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
                tabHienTai === 'khach_hang'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="size-4" />
              <span>Tên Khách hàng / Đơn vị</span>
            </button>
            <button
              type="button"
              onClick={() => setTabHienTai('du_an')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
                tabHienTai === 'du_an'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderGit2 className="size-4" />
              <span>Tên Dự án / Gói thầu</span>
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết cuộn được */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {tabHienTai === 'khach_hang' ? (
            /* TAB 1: KHÁCH HÀNG */
            <div className="space-y-6">
              {/* Formula card */}
              <div className="rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 border border-indigo-100">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb className="size-4 text-amber-500 fill-amber-400" />
                  Công thức chung chuẩn hóa:
                </div>
                <div className="p-3 bg-white/90 rounded-lg border border-indigo-100/80 font-mono text-sm sm:text-base font-bold text-indigo-900 shadow-xs flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">[Loại hình / Cơ quan]</span>
                  <span className="text-slate-400">+</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">[Tên riêng / Đơn vị]</span>
                  <span className="text-indigo-600 font-black"> - </span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">[Địa bàn / Cấp hành chính]</span>
                </div>
              </div>

              {/* Từng khối đối tượng */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Các nhóm khách hàng chính
                </h4>

                {QUY_CHUAN_KHACH_HANG.nhom.map((nhom, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="size-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {nhom.tieuDe}
                      </div>
                      <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 w-fit">
                        {nhom.congThuc}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{nhom.giaiThich}</p>

                    {/* Mẫu gợi ý nhanh */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Mẫu gợi ý (Bấm để {onChonMau ? 'áp dụng vào form' : 'sao chép'}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {nhom.mauGoiY.map((m) => {
                          const daCopy = daCopyId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleCopyHoacChon(m.mau, m.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition group text-left"
                            >
                              <span className="text-slate-800 group-hover:text-indigo-900">{m.mau}</span>
                              {daCopy ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <ArrowRight className="size-3 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bảng so sánh Đúng / Sai */}
                    <div className="mt-3 bg-slate-50/70 rounded-lg p-3 space-y-2 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Ví dụ thực tế:</div>
                      {nhom.viDu.map((vd, vIdx) => (
                        <div key={vIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-start gap-2 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-emerald-900">{vd.dung}</div>
                              <div className="text-[10px] text-emerald-700 mt-0.5">Chuẩn mực: {vd.lyDo}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 bg-rose-50/70 p-2 rounded border border-rose-100">
                            <XCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-rose-800 line-through">{vd.sai}</div>
                              <div className="text-[10px] text-rose-600 mt-0.5">Không nên đặt thế này</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lưu ý chung */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <Lightbulb className="size-4 text-amber-600" />
                  Quy tắc quan trọng cần nhớ
                </div>
                <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
                  {QUY_CHUAN_KHACH_HANG.cacLuuYChung.map((luuY, i) => (
                    <li key={i}>{luuY}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* TAB 2: DỰ ÁN */
            <div className="space-y-6">
              {/* Formula card */}
              <div className="rounded-xl bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50 p-4 border border-indigo-100">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-4 text-indigo-600" />
                  Công thức vàng đặt tên Dự án:
                </div>
                <div className="p-3 bg-white/90 rounded-lg border border-indigo-100/80 font-mono text-sm sm:text-base font-bold text-indigo-900 shadow-xs flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">[Hạng mục / Giải pháp]</span>
                  <span className="text-indigo-600 font-black"> - </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">[Tên Khách hàng / Đơn vị]</span>
                  <span className="text-indigo-600 font-black"> - </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">[Năm thực hiện]</span>
                </div>
                <p className="text-xs text-indigo-700 mt-2">
                  Cấu trúc 3 thành phần giúp nhìn vào là biết ngay: <strong>Làm cái gì</strong> - <strong>Cho ai</strong> - <strong>Năm nào</strong>.
                </p>
              </div>

              {/* Gợi ý theo Khách hàng đang chọn (nếu có) */}
              {tenKhachHangHienTai ? (
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-indigo-600" />
                      Gợi ý tự động cho khách hàng đang chọn:
                    </div>
                    <span className="text-xs font-bold text-indigo-700 max-w-[200px] truncate">
                      {tenKhachHangHienTai}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Bấm vào một trong các mẫu bên dưới để áp dụng trực tiếp vào ô Tên dự án:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUY_CHUAN_DU_AN.giaiPhapPhoBien.slice(0, 6).map((gp, i) => {
                      const tenGoiY = sinhTenDuAnGoiY(gp, tenKhachHangHienTai, namHienTai);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleCopyHoacChon(tenGoiY, `du-an-kh-${i}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-600 hover:text-white transition group text-left shadow-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs text-slate-900 group-hover:text-white truncate">
                              {gp}
                            </div>
                            <div className="text-[11px] text-slate-500 group-hover:text-indigo-100 truncate mt-0.5">
                              {tenGoiY}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 group-hover:bg-white group-hover:text-indigo-700">
                            Áp dụng
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Danh sách các Hạng mục / Giải pháp phổ biến */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="size-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Các Hạng mục / Giải pháp tiêu chuẩn
                </div>
                <p className="text-xs text-slate-500">
                  Bấm vào để {onChonMau ? 'điền nhanh mẫu này' : 'sao chép tên giải pháp'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUY_CHUAN_DU_AN.giaiPhapPhoBien.map((gp, idx) => {
                    const mauDayDu = sinhTenDuAnGoiY(gp, tenKhachHangHienTai, namHienTai);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyHoacChon(mauDayDu, `gp-${idx}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition group text-left"
                      >
                        <span className="text-slate-800 group-hover:text-indigo-900 font-semibold">{gp}</span>
                        {daCopyId === `gp-${idx}` ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <ArrowRight className="size-3 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bảng so sánh Đúng / Sai của Dự án */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="size-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Ví dụ thực tế NÊN LÀM vs KHÔNG NÊN LÀM
                </div>

                <div className="space-y-2">
                  {QUY_CHUAN_DU_AN.viDu.map((vd, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-emerald-900">{vd.dung}</div>
                          <div className="text-[10px] text-emerald-700 mt-1">Lý do: {vd.lyDo}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-rose-50/70 p-2.5 rounded-lg border border-rose-100">
                        <XCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-rose-800 line-through">{vd.sai}</div>
                          <div className="text-[10px] text-rose-600 mt-1">Tên quá sơ sài hoặc khó quản lý</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lưu ý khi đặt tên dự án */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <Lightbulb className="size-4 text-amber-600" />
                  Nguyên tắc đặt tên dự án
                </div>
                <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
                  {QUY_CHUAN_DU_AN.luuY.map((ly, i) => (
                    <li key={i}>{ly}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {tabHienTai === 'khach_hang'
              ? 'Áp dụng cho mọi Khách hàng B2B / B2G'
              : 'Áp dụng cho toàn bộ Hồ sơ dự án & Hợp đồng'}
          </span>
          <button
            type="button"
            onClick={onDong}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition shadow-xs"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
