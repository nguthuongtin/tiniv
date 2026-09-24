'use client';

import { useState, useEffect } from 'react';
import { Save, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';

interface Props {
  mo: boolean;
  onDong: () => void;
  item: ItemKeHoachThang | null;
  onLuu: (
    itemId: string,
    capNhat: {
      thuc_te_thu?: number;
      ket_qua_thuc_te?: number;
      ghi_chu_ket_qua: string;
    }
  ) => void;
}

const dinhDangSoPhanNgan = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN');
};

const giaiMaSoPhanNgan = (str: string): number => {
  const numStr = str.replace(/\D/g, '');
  return numStr ? Number(numStr) : 0;
};

export default function FormCapNhatKetQuaThang({
  mo,
  onDong,
  item,
  onLuu
}: Props) {
  const [ketQuaText, setKetQuaText] = useState<string>('');
  const [ghiChuKetQua, setGhiChuKetQua] = useState<string>('');

  const isTaiChinh = item?.loai_muc_tieu === 'tai_chinh' || (!item?.loai_muc_tieu && (item?.du_kien_thu_thang_nay || 0) > 0);

  useEffect(() => {
    if (item) {
      if (isTaiChinh) {
        const val = item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0;
        setKetQuaText(val > 0 ? dinhDangSoPhanNgan(val) : '');
      } else {
        const val = item.ket_qua_thuc_te ?? item.thuc_te_thu ?? 0;
        setKetQuaText(val > 0 ? String(val) : '');
      }
      setGhiChuKetQua(item.ghi_chu_ket_qua || '');
    }
  }, [item, mo, isTaiChinh]);

  if (!item) return null;

  const chiTieuNum = isTaiChinh 
    ? (item.du_kien_thu_thang_nay || item.chi_tieu || 0)
    : (item.chi_tieu || 0);

  const ketQuaNum = isTaiChinh ? giaiMaSoPhanNgan(ketQuaText) : (Number(ketQuaText) || 0);
  const tyLeDat = chiTieuNum > 0 ? Math.round((ketQuaNum / chiTieuNum) * 100) : 0;

  const xuLyLuu = () => {
    onLuu(item.id, {
      thuc_te_thu: isTaiChinh ? ketQuaNum : 0,
      ket_qua_thuc_te: ketQuaNum,
      ghi_chu_ket_qua: ghiChuKetQua.trim()
    });
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de="Cập nhật kết quả thực hiện tháng"
      phu_de={item.ten_khach_hang_du_an}
    >
      <div className="space-y-4 p-1">
        <The_Chuc_Nang>
          <div className="p-4 space-y-4 text-xs">
            {/* Kế hoạch ban đầu */}
            {isTaiChinh ? (
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Giá trị hợp đồng:</span>
                  <span className="font-bold text-foreground font-mono text-sm block mt-0.5">
                    {DINH_DANG_TIEN_NGAN_GON(item.gia_tri_hd || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Dự kiến thu tháng này:</span>
                  <span className="font-extrabold text-emerald-600 font-mono text-sm block mt-0.5">
                    {DINH_DANG_TIEN_NGAN_GON(chiTieuNum)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Chỉ tiêu đặt ra:</span>
                  <span className="font-black text-foreground text-sm block mt-0.5">
                    {chiTieuNum} {item.don_vi_tinh || 'Chỉ tiêu'}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {item.loai_muc_tieu === 'thi_truong'
                    ? '📍 Thị trường'
                    : item.loai_muc_tieu === 'khach_hang'
                    ? '👥 Khách hàng'
                    : '🎯 Mục tiêu'}
                </div>
              </div>
            )}

            {/* Ô nhập Thực tế đạt được */}
            <div>
              <label className="block font-bold text-foreground mb-1">
                {isTaiChinh
                  ? 'Thực tế đã thu được trong tháng (VNĐ)'
                  : `Kết quả thực tế đạt được (${item.don_vi_tinh || 'Số lượng'})`}{' '}
                <span className="text-danger">*</span>
              </label>
              <input
                type={isTaiChinh ? 'text' : 'number'}
                min="0"
                value={ketQuaText}
                onChange={(e) =>
                  setKetQuaText(
                    isTaiChinh ? dinhDangSoPhanNgan(e.target.value) : e.target.value
                  )
                }
                placeholder={isTaiChinh ? 'VD: 540.000.000' : 'VD: 8'}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono font-extrabold text-blue-600 focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-muted-foreground">Tỷ lệ hoàn thành:</span>
                <span
                  className={`font-bold font-mono ${
                    tyLeDat >= 100
                      ? 'text-emerald-600'
                      : tyLeDat >= 50
                      ? 'text-amber-600'
                      : 'text-danger'
                  }`}
                >
                  {tyLeDat}%
                </span>
              </div>
            </div>

            {/* Ghi chú kết quả thực tế / giải trình */}
            <div>
              <label className="block font-bold text-foreground mb-1">
                Ghi chú diễn giải / giải trình kết quả:
              </label>
              <textarea
                rows={3}
                value={ghiChuKetQua}
                onChange={(e) => setGhiChuKetQua(e.target.value)}
                placeholder="VD: Đã tiếp cận thành công 8 xã, 2 xã còn lại dời sang tháng sau; hoặc đã thanh toán 100% đúng hạn..."
                className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </The_Chuc_Nang>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Nut kieu="outline" onClick={onDong}>
            Hủy
          </Nut>
          <Nut kieu="primary" icon_trai={Save} onClick={xuLyLuu}>
            Lưu kết quả
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
