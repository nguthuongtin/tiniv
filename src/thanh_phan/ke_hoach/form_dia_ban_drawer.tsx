'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachThang | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  onLuu: (item: ItemKeHoachThang) => void;
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

export default function FormDiaBanDrawer({
  mo,
  onDong,
  dangSua,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  onLuu
}: Props) {
  const [tenKhachHangDuAn, setTenKhachHangDuAn] = useState<string>('');
  const [giaTriHdText, setGiaTriHdText] = useState<string>('');
  const [duKienThuText, setDuKienThuText] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');

  useEffect(() => {
    if (dangSua) {
      setTenKhachHangDuAn(dangSua.ten_khach_hang_du_an ?? (dangSua as any).ten_dia_ban ?? '');
      setGiaTriHdText(dinhDangSoPhanNgan(dangSua.gia_tri_hd));
      setDuKienThuText(dinhDangSoPhanNgan(dangSua.du_kien_thu_thang_nay));
      setGhiChu(dangSua.ghi_chu ?? (dangSua as any).ghi_chu_tam_ung ?? '');
    } else {
      setTenKhachHangDuAn('');
      setGiaTriHdText('');
      setDuKienThuText('');
      setGhiChu('');
    }
  }, [dangSua, mo]);

  const xuLyChonMau = (val: string) => {
    if (!val) return;
    if (val.startsWith('KH:')) {
      const khId = val.replace('KH:', '');
      const kh = danhSachKhachHang.find((x) => x.id === khId);
      if (kh) setTenKhachHangDuAn(kh.ten_khach_hang);
    } else if (val.startsWith('DA:')) {
      const daId = val.replace('DA:', '');
      const da = danhSachDuAn.find((x) => x.id === daId);
      if (da) {
        setTenKhachHangDuAn(da.ten_du_an);
        if (da.gia_tri_du_kien) {
          setGiaTriHdText(dinhDangSoPhanNgan(da.gia_tri_du_kien));
          setDuKienThuText(dinhDangSoPhanNgan(Math.round(da.gia_tri_du_kien * 0.3)));
        }
      }
    }
  };

  const xuLyLuu = () => {
    if (!tenKhachHangDuAn.trim()) {
      alert('Vui lòng nhập tên Khách hàng hoặc Dự án');
      return;
    }
    const item: ItemKeHoachThang = {
      id: dangSua?.id ?? String(Date.now()),
      ten_khach_hang_du_an: tenKhachHangDuAn.trim(),
      gia_tri_hd: giaiMaSoPhanNgan(giaTriHdText),
      du_kien_thu_thang_nay: giaiMaSoPhanNgan(duKienThuText),
      ghi_chu: ghiChu.trim() || null
    };
    onLuu(item);
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={dangSua ? 'Sửa Kế hoạch Tháng' : 'Thêm Kế hoạch Tháng'}
    >
      <div className="space-y-4 p-1">
        <The_Chuc_Nang>
          <div className="p-4 space-y-4 text-xs">
            {(danhSachKhachHang.length > 0 || danhSachDuAn.length > 0) && (
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Chọn từ danh sách có sẵn (tùy chọn)
                </label>
                <select
                  onChange={(e) => xuLyChonMau(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs"
                >
                  <option value="">-- Bấm chọn Khách hàng hoặc Dự án --</option>
                  {danhSachKhachHang.length > 0 && (
                    <optgroup label="Khách hàng">
                      {danhSachKhachHang.map((k) => (
                        <option key={k.id} value={`KH:${k.id}`}>
                          {k.ten_khach_hang}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {danhSachDuAn.length > 0 && (
                    <optgroup label="Hồ sơ dự án">
                      {danhSachDuAn.map((d) => (
                        <option key={d.id} value={`DA:${d.id}`}>
                          {d.ten_du_an}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Khách hàng / Dự án <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={tenKhachHangDuAn}
                onChange={(e) => setTenKhachHangDuAn(e.target.value)}
                placeholder="VD: UBND Xã Kiên Lương..."
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Giá trị HĐ (VNĐ)
                </label>
                <input
                  type="text"
                  value={giaTriHdText}
                  onChange={(e) => setGiaTriHdText(dinhDangSoPhanNgan(e.target.value))}
                  placeholder="1.800.000.000"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Dự kiến thu tháng này (VNĐ)
                </label>
                <input
                  type="text"
                  value={duKienThuText}
                  onChange={(e) => setDuKienThuText(dinhDangSoPhanNgan(e.target.value))}
                  placeholder="540.000.000"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-mono font-extrabold text-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="VD: Tạm ứng 30%..."
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs"
              />
            </div>
          </div>
        </The_Chuc_Nang>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Nut kieu="outline" onClick={onDong}>
            Hủy
          </Nut>
          <Nut kieu="primary" icon_trai={Save} onClick={xuLyLuu}>
            {dangSua ? 'Lưu cập nhật' : 'Thêm mới'}
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
