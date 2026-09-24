'use client';

import { useState, useEffect } from 'react';
import { Save, Send, Printer, Calendar, DollarSign, MapPin, Users, Target, FileSpreadsheet } from 'lucide-react';
import type { KeHoachTuan, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { xuatExcelTongKetTuan } from '../../dich_vu/ke_hoach/dich_vu_xuat_excel_ke_hoach';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  keHoach: KeHoachTuan | null;
  baoCaoHienTai: BaoCaoKeHoachTuan | null;
  nhanVien: NhanSu | null;
  tuan: string;
  onLuuBaoCao: (bc: Partial<BaoCaoKeHoachTuan>, guiSep: boolean) => Promise<void>;
  danhSachKhachHang?: KhachHang[];
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'tai_chinh':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <DollarSign className="size-3" /> Thu tiền
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-700 border border-slate-500/20">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'thi_truong':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
  }
};

export default function DrawerTongKetTuan({
  mo,
  onDong,
  keHoach,
  baoCaoHienTai,
  nhanVien,
  tuan,
  onLuuBaoCao,
  danhSachKhachHang = []
}: Props) {
  const [khoKhan, setKhoKhan] = useState<string>('');
  const [deXuat, setDeXuat] = useState<string>('');
  const [dangLuu, setDangLuu] = useState<boolean>(false);

  const ds = keHoach?.danh_sach_tac_chien ?? [];
  const soHoanThanh = ds.filter((x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay').length;
  const tyLeHoanThanh = ds.length > 0 ? Math.round((soHoanThanh / ds.length) * 100) : 0;

  useEffect(() => {
    if (baoCaoHienTai) {
      setKhoKhan(baoCaoHienTai.kho_khan || '');
      setDeXuat(baoCaoHienTai.de_xuat || '');
    } else {
      setKhoKhan('');
      setDeXuat('');
    }
  }, [baoCaoHienTai, mo]);

  const xuLyLuu = async (guiSep: boolean) => {
    if (!keHoach) return;
    setDangLuu(true);
    try {
      const danhSachKetQua = ds.map((item) => ({
        item_id: item.id,
        loai_cong_viec: item.loai_cong_viec || 'thi_truong',
        ten_khach_hang_du_an: item.ten_khach_hang_du_an,
        dau_ra_cam_ket: item.dau_ra_cam_ket,
        ngay_du_kien: item.ngay_du_kien || null,
        danh_sach_ket_qua: item.danh_sach_ket_qua || [],
        ket_qua_thuc_te: item.ket_qua_thuc_te || null,
        da_hoan_thanh: Boolean(item.da_hoan_thanh),
        can_ho_tro: item.can_ho_tro || null
      }));

      await onLuuBaoCao(
        {
          id: baoCaoHienTai?.id,
          ke_hoach_tuan_id: keHoach.id,
          nhan_vien_id: keHoach.nhan_vien_id,
          ten_nhan_vien: nhanVien?.ho_va_ten || '',
          ma_nhan_vien: nhanVien?.ma_nhan_vien || '',
          chi_nhanh_id: keHoach.chi_nhanh_id || null,
          phong_ban_id: keHoach.phong_ban_id || null,
          tuan: tuan,
          tong_muc_tieu: ds.length,
          so_hoan_thanh: soHoanThanh,
          ty_le_hoan_thanh: tyLeHoanThanh,
          danh_sach_ket_qua: danhSachKetQua,
          kho_khan: khoKhan.trim() || null,
          de_xuat: deXuat.trim() || null,
          trang_thai: guiSep ? 'da_gui' : 'nhap'
        },
        guiSep
      );
      onDong();
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu báo cáo!');
    } finally {
      setDangLuu(false);
    }
  };

  const xuLyInBaoCao = () => {
    window.print();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={`Báo cáo tổng kết tuần ${tuan}`}
      phu_de={nhanVien ? `${nhanVien.ho_va_ten} (${nhanVien.ma_nhan_vien})` : ''}
    >
      <div className="space-y-4 p-1 print:p-0">
        {/* Header báo cáo printable */}
        <div className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Tổng kết tác chiến tuần
              </span>
              <h4 className="text-lg font-black text-foreground mt-0.5">
                Tuần {tuan}
              </h4>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-block ${
                baoCaoHienTai?.trang_thai === 'da_gui'
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'bg-amber-500/15 text-amber-700'
              }`}>
                {baoCaoHienTai?.trang_thai === 'da_gui' ? '✓ ĐÃ NỘP BÁO CÁO' : 'BẢN NHÁP'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
            <div className="p-2 bg-background rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Tổng việc</span>
              <span className="text-lg font-black text-foreground">{ds.length}</span>
            </div>
            <div className="p-2 bg-background rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Đã xong</span>
              <span className="text-lg font-black text-emerald-600">{soHoanThanh}</span>
            </div>
            <div className="p-2 bg-background rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Hoàn thành</span>
              <span className="text-lg font-black text-primary">{tyLeHoanThanh}%</span>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết kết quả từng mục tiêu */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm">
              Chi tiết thực hiện từng mục tiêu:
            </div>
            {ds.length === 0 ? (
              <p className="text-muted-foreground italic py-4 text-center">
                Chưa có mục tiêu tuần nào để tổng kết.
              </p>
            ) : (
              <div className="space-y-2.5">
                {ds.map((item, idx) => {
                  const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                  const dsKq = item.danh_sach_ket_qua ?? [];
                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-lg border border-border/70 bg-background space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {renderBadgeLoai(item.loai_cong_viec || 'thi_truong')}
                            <span className="font-bold text-foreground text-sm">
                              {idx + 1}. {item.ten_khach_hang_du_an}
                            </span>
                          </div>
                          {item.ngay_du_kien && (
                            <span className="text-[11px] text-primary font-mono inline-flex items-center gap-0.5">
                              <Calendar className="size-3" /> Dự kiến: {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          daXong ? 'bg-emerald-500/15 text-emerald-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {daXong ? '✓ Đã xong' : 'Chưa xong'}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Cam kết:</span> {item.dau_ra_cam_ket || '—'}
                      </div>

                      {/* Các kết quả ghi nhận */}
                      <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40 space-y-1.5">
                        <span className="font-semibold text-primary text-[11px] block">Kết quả thực tế đã đạt:</span>
                        {dsKq.length > 0 ? (
                          <div className="space-y-1">
                            {dsKq.map((kq, kIdx) => (
                              <div key={kq.id || kIdx} className="text-[11px] flex items-start gap-1.5">
                                <span className="font-mono text-[10px] bg-background px-1 rounded border border-border/60 text-muted-foreground shrink-0 mt-0.5">
                                  {kq.ngay_ghi_nhan ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN') : ''}
                                </span>
                                <span className="text-foreground font-medium">{kq.noi_dung}</span>
                              </div>
                            ))}
                          </div>
                        ) : item.ket_qua_thuc_te ? (
                          <span className="font-medium text-foreground text-[11px] block">{item.ket_qua_thuc_te}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px] block">Chưa có kết quả ghi nhận</span>
                        )}
                      </div>

                      {item.can_ho_tro && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          💡 Cần hỗ trợ: {item.can_ho_tro}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </The_Chuc_Nang>

        {/* Khó khăn & Đề xuất */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Khó khăn, vướng mắc trong tuần:
              </label>
              <textarea
                rows={2}
                value={khoKhan}
                onChange={(e) => setKhoKhan(e.target.value)}
                placeholder="VD: Khách hàng hẹn lùi lịch khảo sát, thiết bị chưa về kịp..."
                className="w-full rounded-lg border border-border bg-background p-2 text-xs font-medium text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Đề xuất, kiến nghị với Sếp / Chi nhánh:
              </label>
              <textarea
                rows={2}
                value={deXuat}
                onChange={(e) => setDeXuat(e.target.value)}
                placeholder="VD: Nhờ Giám đốc hỗ trợ đàm phán giá hợp đồng với UBND Xã..."
                className="w-full rounded-lg border border-border bg-background p-2 text-xs font-medium text-foreground"
              />
            </div>
          </div>
        </The_Chuc_Nang>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border print:hidden flex-wrap">
          <div className="flex items-center gap-2">
            <Nut kieu="outline" icon_trai={Printer} onClick={xuLyInBaoCao}>
              In / Xuất PDF
            </Nut>
            <Nut
              kieu="outline"
              icon_trai={FileSpreadsheet}
              onClick={() => void xuatExcelTongKetTuan(keHoach, nhanVien, tuan, danhSachKhachHang)}
              disabled={ds.length === 0}
            >
              Xuất Excel Tổng kết
            </Nut>
          </div>
          <div className="flex items-center gap-2">
            <Nut
              kieu="outline"
              icon_trai={Save}
              onClick={() => xuLyLuu(false)}
              disabled={dangLuu || ds.length === 0}
            >
              Lưu nháp
            </Nut>
            <Nut
              kieu="primary"
              icon_trai={Send}
              onClick={() => xuLyLuu(true)}
              disabled={dangLuu || ds.length === 0}
            >
              {baoCaoHienTai?.trang_thai === 'da_gui' ? 'Cập nhật & Gửi lại' : 'Nộp báo cáo cho Sếp'}
            </Nut>
          </div>
        </div>
      </div>
    </Ban_Ve>
  );
}
