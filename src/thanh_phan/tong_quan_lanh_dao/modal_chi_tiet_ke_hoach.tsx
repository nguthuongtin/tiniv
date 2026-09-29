'use client';

import { X, CheckCircle2, Clock, Calendar, Target, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import type { KeHoachTuan, KeHoachThang } from '../../thu_vien/types/ke_hoach';

interface Props {
  loai: 'tuan' | 'thang';
  tieuDe: string;
  nhanVienTen: string;
  keHoachTuan?: KeHoachTuan | null;
  keHoachThang?: KeHoachThang | null;
  onDong: () => void;
}

export default function ModalChiTietKeHoach({
  loai,
  tieuDe,
  nhanVienTen,
  keHoachTuan,
  keHoachThang,
  onDong
}: Props) {
  const itemsTuan = keHoachTuan?.danh_sach_tac_chien || [];
  const itemsThang = keHoachThang?.danh_sach_dia_ban || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#185942]/10 text-[#185942] text-xs font-semibold mb-1">
              {loai === 'tuan' ? 'Kế hoạch tác chiến tuần' : 'Kế hoạch mục tiêu tháng'}
            </div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <span>{tieuDe}</span>
              <span className="text-slate-400 font-normal">•</span>
              <span className="text-[#185942]">{nhanVienTen}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loai === 'tuan' ? (
            itemsTuan.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Nhân viên này chưa cập nhật danh sách hành động trong tuần này.
              </div>
            ) : (
              <div className="space-y-2.5">
                {itemsTuan.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Mục {idx + 1}
                        </span>
                        <h4 className="font-bold text-base text-slate-800 leading-snug">
                          {item.ten_khach_hang_du_an || item.hanh_dong_tuan || 'Chưa đặt tên'}
                        </h4>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 shrink-0 border',
                          item.da_hoan_thanh
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        )}
                      >
                        {item.da_hoan_thanh ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Đã hoàn thành
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Đang thực hiện
                          </>
                        )}
                      </span>
                    </div>

                    {item.noi_dung_tuan && (
                      <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-700">Việc cần làm:</strong> {item.noi_dung_tuan}
                      </p>
                    )}

                    {item.dau_ra_cam_ket && (
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-700">Đầu ra cam kết:</strong> {item.dau_ra_cam_ket}
                      </p>
                    )}

                    {(item.tinh_thanh || item.xa_phuong) && (
                      <div className="text-xs text-slate-400">
                        Địa bàn: {[item.xa_phuong, item.tinh_thanh].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : itemsThang.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nhân viên này chưa lập kế hoạch mục tiêu trong tháng này.
            </div>
          ) : (
            <div className="space-y-2.5">
              {itemsThang.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mục tiêu {idx + 1}
                      </span>
                      <h4 className="font-bold text-base text-slate-800 leading-snug">
                        {item.ten_khach_hang_du_an || 'Mục tiêu tháng'}
                      </h4>
                    </div>
                    {item.doanh_so_du_kien ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Doanh số: {DINH_DANG_TIEN_NGAN_GON(item.doanh_so_du_kien)}
                      </span>
                    ) : null}
                  </div>

                  {item.muc_tieu_thang && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <strong className="text-slate-700">Mục tiêu mong muốn:</strong> {item.muc_tieu_thang}
                    </p>
                  )}

                  {(item.tinh_thanh || item.xa_phuong || item.co_quan_doanh_nghiep) && (
                    <div className="text-xs text-slate-500">
                      Đối tượng / Địa bàn: {[item.co_quan_doanh_nghiep, item.xa_phuong, item.tinh_thanh].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onDong}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
