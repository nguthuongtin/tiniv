'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachTuan | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  onLuu: (item: ItemKeHoachTuan) => void;
}

export default function FormTacChienTuanDrawer({
  mo,
  onDong,
  dangSua,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  onLuu
}: Props) {
  const [tenKhachHangDuAn, setTenKhachHangDuAn] = useState<string>('');
  const [noiDungTuan, setNoiDungTuan] = useState<string>('');
  const [dauRaCamKet, setDauRaCamKet] = useState<string>('');
  const [canHoTro, setCanHoTro] = useState<string>('');

  useEffect(() => {
    if (dangSua) {
      setTenKhachHangDuAn(dangSua.ten_khach_hang_du_an ?? (dangSua as any).ten_dia_ban ?? '');
      setNoiDungTuan(dangSua.noi_dung_tuan ?? (dangSua as any).hanh_dong_cu_the ?? '');
      setDauRaCamKet(dangSua.dau_ra_cam_ket ?? (dangSua as any).vat_chung_bat_buoc ?? '');
      setCanHoTro(dangSua.can_ho_tro ?? '');
    } else {
      setTenKhachHangDuAn('');
      setNoiDungTuan('');
      setDauRaCamKet('');
      setCanHoTro('');
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
      if (da) setTenKhachHangDuAn(da.ten_du_an);
    }
  };

  const xuLyLuu = () => {
    if (!tenKhachHangDuAn.trim()) {
      alert('Vui lòng nhập Tên Khách hàng / Công việc');
      return;
    }
    const item: ItemKeHoachTuan = {
      id: dangSua?.id ?? String(Date.now()),
      ten_khach_hang_du_an: tenKhachHangDuAn.trim(),
      noi_dung_tuan: noiDungTuan.trim(),
      dau_ra_cam_ket: dauRaCamKet.trim(),
      da_hoan_thanh: dangSua?.da_hoan_thanh ?? false,
      can_ho_tro: canHoTro.trim() || null
    };
    onLuu(item);
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={dangSua ? 'Sửa tác chiến tuần' : 'Thêm tác chiến tuần mới'}
      phu_de="Kế hoạch công việc & đầu ra cần đạt trong tuần"
    >
      <div className="space-y-4 p-1">
        <The_Chuc_Nang>
          <div className="p-4 space-y-4 text-xs">
            {(danhSachKhachHang.length > 0 || danhSachDuAn.length > 0) && (
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Chọn nhanh từ danh sách có sẵn (tùy chọn)
                </label>
                <select
                  onChange={(e) => xuLyChonMau(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs"
                >
                  <option value="">-- Bấm chọn KH hoặc Hồ sơ dự án --</option>
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
                Khách hàng / Công việc <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={tenKhachHangDuAn}
                onChange={(e) => setTenKhachHangDuAn(e.target.value)}
                placeholder="VD: UBND Xã Kiên Lương, Khảo sát mặt bằng..."
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Nội dung / Lịch làm việc tuần này
              </label>
              <textarea
                rows={2}
                value={noiDungTuan}
                onChange={(e) => setNoiDungTuan(e.target.value)}
                placeholder="VD: Thứ 3 trình bản thảo HĐ, Thứ 4 ký đóng dấu"
                className="w-full rounded-lg border border-border bg-background p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Kết quả / Đầu ra cần đạt
              </label>
              <input
                type="text"
                value={dauRaCamKet}
                onChange={(e) => setDauRaCamKet(e.target.value)}
                placeholder="VD: Hợp đồng ký xong có dấu, BB khảo sát..."
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Cần Sếp / Chi nhánh hỗ trợ gì? (tùy chọn)
              </label>
              <input
                type="text"
                value={canHoTro}
                onChange={(e) => setCanHoTro(e.target.value)}
                placeholder="VD: Sếp Tín gọi điện hỗ trợ đàm phán..."
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
            {dangSua ? 'Lưu cập nhật' : 'Thêm tác chiến tuần'}
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
