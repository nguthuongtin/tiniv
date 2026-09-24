'use client';

import { useState, useEffect } from 'react';
import { Save, Send, Printer, DollarSign, MapPin, Users, Target, FileSpreadsheet } from 'lucide-react';
import type { KeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { xuatExcelTongKetThang } from '../../dich_vu/ke_hoach/dich_vu_xuat_excel_ke_hoach';
import { Nut, Ban_Ve, The_Chuc_Nang } from '../ui';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';

interface Props {
  mo: boolean;
  onDong: () => void;
  keHoach: KeHoachThang | null;
  baoCaoHienTai: BaoCaoKeHoachThang | null;
  nhanVien: NhanSu | null;
  thang: string;
  onLuuBaoCao: (bc: Partial<BaoCaoKeHoachThang>, guiSep: boolean) => Promise<void>;
  danhSachKhachHang?: KhachHang[];
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'thi_truong':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-700">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'tai_chinh':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
          <DollarSign className="size-3" /> Tài chính
        </span>
      );
  }
};

export default function DrawerTongKetThang({
  mo,
  onDong,
  keHoach,
  baoCaoHienTai,
  nhanVien,
  thang,
  onLuuBaoCao,
  danhSachKhachHang = []
}: Props) {
  const [khoKhan, setKhoKhan] = useState<string>('');
  const [deXuat, setDeXuat] = useState<string>('');
  const [dangLuu, setDangLuu] = useState<boolean>(false);

  const ds = keHoach?.danh_sach_dia_ban ?? [];

  // Tài chính
  const dsTaiChinh = ds.filter(
    (x) => x.loai_muc_tieu === 'tai_chinh' || (!x.loai_muc_tieu && (x.du_kien_thu_thang_nay || 0) > 0)
  );
  const tongGiaTriHd = dsTaiChinh.reduce((acc, x) => acc + (x.gia_tri_hd || 0), 0);
  const tongDuKienThu = dsTaiChinh.reduce((acc, x) => acc + (x.du_kien_thu_thang_nay || x.chi_tieu || 0), 0);
  const tongThucTeThu = dsTaiChinh.reduce((acc, x) => acc + (x.thuc_te_thu ?? x.ket_qua_thuc_te ?? 0), 0);
  const tyLeDatKeHoach = tongDuKienThu > 0 ? Math.round((tongThucTeThu / tongDuKienThu) * 100) : 0;

  // KPI chung
  let tongDiemDat = 0;
  let soMucTieuDat = 0;
  ds.forEach((item) => {
    const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
    const chiTieu = isTC ? (item.du_kien_thu_thang_nay || item.chi_tieu || 0) : (item.chi_tieu || 0);
    const thucTe = isTC ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0) : (item.ket_qua_thuc_te || 0);
    const tyLe = chiTieu > 0 ? Math.round((thucTe / chiTieu) * 100) : 0;
    tongDiemDat += Math.min(100, tyLe);
    if (tyLe >= 100) soMucTieuDat++;
  });
  const tyLeHoanThanhKPI = ds.length > 0 ? Math.round(tongDiemDat / ds.length) : 0;

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
      const danhSachKetQua = ds.map((item) => {
        const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
        const chiTieu = isTC ? (item.du_kien_thu_thang_nay || item.chi_tieu || 0) : (item.chi_tieu || 0);
        const thucTe = isTC ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0) : (item.ket_qua_thuc_te || 0);
        const tyLe = chiTieu > 0 ? Math.round((thucTe / chiTieu) * 100) : 0;

        return {
          item_id: item.id,
          ten_khach_hang_du_an: item.ten_khach_hang_du_an,
          loai_muc_tieu: item.loai_muc_tieu || (isTC ? 'tai_chinh' : 'thi_truong'),
          chi_tieu: chiTieu,
          don_vi_tinh: item.don_vi_tinh || (isTC ? 'VNĐ' : ''),
          ket_qua_thuc_te: thucTe,
          gia_tri_hd: isTC ? (item.gia_tri_hd || 0) : 0,
          du_kien_thu_thang_nay: isTC ? chiTieu : 0,
          thuc_te_thu: isTC ? thucTe : 0,
          ty_le_dat: tyLe,
          ghi_chu_ket_qua: item.ghi_chu_ket_qua || item.ghi_chu || null
        };
      });

      await onLuuBaoCao(
        {
          id: baoCaoHienTai?.id,
          ke_hoach_thang_id: keHoach.id,
          nhan_vien_id: keHoach.nhan_vien_id,
          ten_nhan_vien: nhanVien?.ho_va_ten || '',
          ma_nhan_vien: nhanVien?.ma_nhan_vien || '',
          chi_nhanh_id: keHoach.chi_nhanh_id || null,
          phong_ban_id: keHoach.phong_ban_id || null,
          thang: thang,
          tong_muc_tieu: ds.length,
          so_muc_tieu_dat: soMucTieuDat,
          ty_le_hoan_thanh_kpi: tyLeHoanThanhKPI,
          tong_gia_tri_hd: tongGiaTriHd,
          tong_du_kien_thu: tongDuKienThu,
          tong_thuc_te_thu: tongThucTeThu,
          ty_le_dat_ke_hoach: tyLeDatKeHoach,
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
      tieu_de={`Báo cáo tổng kết tháng ${thang}`}
      phu_de={nhanVien ? `${nhanVien.ho_va_ten} (${nhanVien.ma_nhan_vien})` : ''}
    >
      <div className="space-y-4 p-1 print:p-0">
        {/* Header báo cáo printable */}
        <div className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Tổng kết kế hoạch & KPI
              </span>
              <h4 className="text-lg font-black text-foreground mt-0.5">
                Tháng {thang}
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
              <span className="text-[10px] text-muted-foreground block">Tổng số mục tiêu</span>
              <span className="text-sm font-extrabold text-foreground font-mono block mt-0.5">
                {ds.length} <span className="text-xs font-normal">mục tiêu</span>
              </span>
            </div>
            <div className="p-2 bg-background rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Doanh thu thu về</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono block mt-0.5">
                {DINH_DANG_TIEN_NGAN_GON(tongThucTeThu)}
              </span>
            </div>
            <div className="p-2 bg-background rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Hoàn thành KPI</span>
              <span className={`text-base font-black font-mono block mt-0.5 ${
                tyLeHoanThanhKPI >= 100 ? 'text-emerald-600' : tyLeHoanThanhKPI >= 50 ? 'text-amber-600' : 'text-danger'
              }`}>
                {tyLeHoanThanhKPI}%
              </span>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết kết quả từng mục tiêu */}
        <The_Chuc_Nang>
          <div className="p-4 space-y-3 text-xs">
            <div className="font-bold text-foreground text-sm">
              Chi tiết thực hiện các mục tiêu trong tháng:
            </div>
            {ds.length === 0 ? (
              <p className="text-muted-foreground italic py-4 text-center">
                Chưa có mục tiêu tháng nào để tổng kết.
              </p>
            ) : (
              <div className="space-y-2.5">
                {ds.map((item, idx) => {
                  const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
                  const chiTieu = isTC ? (item.du_kien_thu_thang_nay || item.chi_tieu || 0) : (item.chi_tieu || 0);
                  const thucTe = isTC ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0) : (item.ket_qua_thuc_te || 0);
                  const donVi = item.don_vi_tinh || (isTC ? 'VNĐ' : '');
                  const tyLe = chiTieu > 0 ? Math.round((thucTe / chiTieu) * 100) : 0;

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-lg border border-border/70 bg-background space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {renderBadgeLoai(item.loai_muc_tieu || (isTC ? 'tai_chinh' : 'thi_truong'))}
                            <span className="font-bold text-foreground">
                              {idx + 1}. {item.ten_khach_hang_du_an}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                          tyLe >= 100 ? 'bg-emerald-500/15 text-emerald-700' : tyLe >= 50 ? 'bg-amber-500/15 text-amber-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          Đạt {tyLe}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-muted-foreground block">Chỉ tiêu đề ra:</span>
                          <span className="font-bold text-emerald-600">
                            {isTC ? DINH_DANG_TIEN_NGAN_GON(chiTieu) : `${chiTieu} ${donVi}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Thực tế đạt được:</span>
                          <span className="font-bold text-blue-600">
                            {isTC ? DINH_DANG_TIEN_NGAN_GON(thucTe) : `${thucTe} ${donVi}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] bg-muted/40 p-2 rounded border border-border/40">
                        <span className="font-semibold text-foreground">Diễn giải / Ghi chú:</span>{' '}
                        {item.ghi_chu_ket_qua || item.ghi_chu ? (
                          <span className="font-medium text-foreground">
                            {item.ghi_chu_ket_qua || item.ghi_chu}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Không có ghi chú</span>
                        )}
                      </div>
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
                Khó khăn trong tháng (thị trường, đối thủ, thanh toán...):
              </label>
              <textarea
                rows={2}
                value={khoKhan}
                onChange={(e) => setKhoKhan(e.target.value)}
                placeholder="VD: Chủ đầu tư tạm hoãn giải ngân sang quý sau, vướng thủ tục ký hợp đồng, mưa bão..."
                className="w-full rounded-lg border border-border bg-background p-2 text-xs font-medium text-foreground"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Đề xuất chiến lược / Kế hoạch tháng tới:
              </label>
              <textarea
                rows={2}
                value={deXuat}
                onChange={(e) => setDeXuat(e.target.value)}
                placeholder="VD: Đề xuất mở rộng thêm địa bàn huyện lân cận, xin hỗ trợ từ ban giám đốc..."
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
              onClick={() => void xuatExcelTongKetThang(keHoach, nhanVien, thang, danhSachKhachHang)}
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
