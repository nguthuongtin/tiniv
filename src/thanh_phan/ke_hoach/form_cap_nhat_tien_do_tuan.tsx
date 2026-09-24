'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import type { ItemKeHoachTuan, NhatKyKetQuaTuan } from '../../thu_vien/types/ke_hoach';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  item: ItemKeHoachTuan | null;
  onLuu: (
    itemId: string,
    capNhat: {
      danh_sach_ket_qua: NhatKyKetQuaTuan[];
      ket_qua_thuc_te: string;
      da_hoan_thanh: boolean;
    }
  ) => void;
}

export default function FormCapNhatTienDoTuan({
  mo,
  onDong,
  item,
  onLuu
}: Props) {
  const [danhSachKetQua, setDanhSachKetQua] = useState<NhatKyKetQuaTuan[]>([]);
  const [noiDungMoi, setNoiDungMoi] = useState<string>('');
  const [ngayGhiNhanMoi, setNgayGhiNhanMoi] = useState<string>('');
  const [daHoanThanh, setDaHoanThanh] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      const homNay = new Date().toISOString().split('T')[0];
      setNgayGhiNhanMoi(homNay);
      setNoiDungMoi('');
      setDaHoanThanh(Boolean(item.da_hoan_thanh));

      // Migrate từ kết quả đơn lẻ sang danh sách nếu có
      if (item.danh_sach_ket_qua && item.danh_sach_ket_qua.length > 0) {
        setDanhSachKetQua(item.danh_sach_ket_qua);
      } else if (item.ket_qua_thuc_te) {
        setDanhSachKetQua([
          {
            id: 'legacy_1',
            ngay_ghi_nhan: item.ngay_hoan_thanh || homNay,
            noi_dung: item.ket_qua_thuc_te
          }
        ]);
      } else {
        setDanhSachKetQua([]);
      }
    }
  }, [item, mo]);

  if (!item) return null;

  const xuLyThemKetQua = () => {
    if (!noiDungMoi.trim()) {
      alert('Vui lòng nhập nội dung kết quả');
      return;
    }

    const itemMoi: NhatKyKetQuaTuan = {
      id: `kq_${Date.now()}`,
      ngay_ghi_nhan: ngayGhiNhanMoi || new Date().toISOString().split('T')[0],
      noi_dung: noiDungMoi.trim()
    };

    setDanhSachKetQua([itemMoi, ...danhSachKetQua]);
    setNoiDungMoi('');
  };

  const xuLyXoaKetQua = (id: string) => {
    setDanhSachKetQua(danhSachKetQua.filter((x) => x.id !== id));
  };

  const xuLyLuu = () => {
    // Nếu có đang gõ dở nội dung ở ô input mà chưa bấm "Thêm", tự động thêm luôn
    let dsCuoi = [...danhSachKetQua];
    if (noiDungMoi.trim()) {
      const itemMoi: NhatKyKetQuaTuan = {
        id: `kq_${Date.now()}`,
        ngay_ghi_nhan: ngayGhiNhanMoi || new Date().toISOString().split('T')[0],
        noi_dung: noiDungMoi.trim()
      };
      dsCuoi = [itemMoi, ...dsCuoi];
    }

    // Kết quả mới nhất làm tóm tắt hiển thị
    const ketQuaGanNhat = dsCuoi.length > 0 ? dsCuoi[0].noi_dung : '';

    onLuu(item.id, {
      danh_sach_ket_qua: dsCuoi,
      ket_qua_thuc_te: ketQuaGanNhat,
      da_hoan_thanh: daHoanThanh
    });
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de="Cập nhật kết quả thực hiện"
      phu_de={item.ten_khach_hang_du_an}
    >
      <div className="space-y-4 p-1">
        {/* Thông tin mục tiêu ban đầu */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm">
                {item.ten_khach_hang_du_an}
              </span>
              {item.ngay_du_kien && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px] inline-flex items-center gap-1">
                  <Calendar className="size-3" /> Dự kiến: {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-1 border border-border/60">
              <div className="text-muted-foreground font-semibold">Đầu ra cam kết:</div>
              <div className="font-bold text-foreground">{item.dau_ra_cam_ket || '—'}</div>
              {item.noi_dung_tuan && (
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  Lịch tuần: {item.noi_dung_tuan}
                </div>
              )}
            </div>

            {/* Checkbox Đã hoàn thành mục tiêu */}
            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={daHoanThanh}
                onChange={(e) => setDaHoanThanh(e.target.checked)}
                className="size-4.5 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span className="font-bold text-xs text-foreground">
                Đánh dấu đã hoàn thành toàn bộ mục tiêu này
              </span>
            </label>
          </div>
        </The_Chuc_Nang>

        {/* Ô nhập thêm kết quả mới */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm flex items-center justify-between">
              <span>Ghi nhận kết quả mới</span>
              <span className="text-muted-foreground text-[11px] font-normal">
                (Có thể thêm nhiều kết quả trong tuần)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={ngayGhiNhanMoi}
                onChange={(e) => setNgayGhiNhanMoi(e.target.value)}
                className="h-8.5 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground"
              />
              <span className="text-muted-foreground text-[11px]">Ngày thực hiện</span>
            </div>

            <div>
              <textarea
                rows={2}
                value={noiDungMoi}
                onChange={(e) => setNoiDungMoi(e.target.value)}
                placeholder="VD: Ngày 15/09: Đã gặp khách, trình bày giải pháp. Khách hẹn thứ 5 xem demo..."
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={xuLyThemKetQua}
              className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" /> Thêm kết quả này vào lịch sử
            </button>
          </div>
        </The_Chuc_Nang>

        {/* Danh sách các kết quả đã ghi nhận */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm flex items-center justify-between">
              <span>Lịch sử kết quả đạt được ({danhSachKetQua.length})</span>
            </div>

            {danhSachKetQua.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground italic">
                Chưa có kết quả nào được ghi nhận. Nhập nội dung ở trên và bấm "Lưu".
              </div>
            ) : (
              <div className="space-y-2">
                {danhSachKetQua.map((kq, idx) => (
                  <div
                    key={kq.id || idx}
                    className="p-3 rounded-lg border border-border/80 bg-background flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-muted-foreground">
                          {kq.ngay_ghi_nhan ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN') : '—'}
                        </span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                            Mới nhất
                          </span>
                        )}
                      </div>
                      <div className="text-foreground font-medium leading-relaxed">
                        {kq.noi_dung}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => xuLyXoaKetQua(kq.id)}
                      className="size-6 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger flex items-center justify-center shrink-0 transition-colors"
                      title="Xoá kết quả này"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </The_Chuc_Nang>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Nut kieu="outline" onClick={onDong}>
            Hủy
          </Nut>
          <Nut kieu="primary" icon_trai={Save} onClick={xuLyLuu}>
            Lưu toàn bộ kết quả
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
