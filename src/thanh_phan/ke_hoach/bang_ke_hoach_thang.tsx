'use client';

import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Target,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  MapPin,
  Users,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import type { KeHoachThang, ItemKeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';

interface Props {
  keHoach: KeHoachThang | null;
  baoCao?: BaoCaoKeHoachThang | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onSuaItem: (item: ItemKeHoachThang) => void;
  onXoaItem: (itemId: string) => void;
  onCapNhatThucTe: (item: ItemKeHoachThang) => void;
  onMoDrawerTongKet: () => void;
  onXuatExcel?: () => void;
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'thi_truong':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'tai_chinh':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <DollarSign className="size-3" /> Tài chính
        </span>
      );
  }
};

export default function BangKeHoachThang({
  keHoach,
  baoCao,
  laSuaDuoc,
  onThemMoi,
  onSuaItem,
  onXoaItem,
  onCapNhatThucTe,
  onMoDrawerTongKet,
  onXuatExcel
}: Props) {
  const ds = keHoach?.danh_sach_dia_ban ?? [];

  // Tính toán chỉ số tài chính
  const dsTaiChinh = ds.filter(
    (x) => x.loai_muc_tieu === 'tai_chinh' || (!x.loai_muc_tieu && (x.du_kien_thu_thang_nay || 0) > 0)
  );
  const tongGiaTriHd = dsTaiChinh.reduce((acc, x) => acc + (x.gia_tri_hd || 0), 0);
  const tongDuKienThu = dsTaiChinh.reduce(
    (acc, x) => acc + (x.doanh_so_du_kien || x.du_kien_thu_thang_nay || x.chi_tieu || 0),
    0
  );
  const tongThucTeThu = dsTaiChinh.reduce(
    (acc, x) => acc + (x.thuc_te_thu ?? x.ket_qua_thuc_te ?? 0),
    0
  );
  const tyLeDatTien = tongDuKienThu > 0 ? Math.round((tongThucTeThu / tongDuKienThu) * 100) : 0;

  // Tính toán tỷ lệ hoàn thành KPI tổng quát
  let tongDiemDat = 0;
  ds.forEach((item) => {
    const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
    const chiTieu = isTC ? (item.doanh_so_du_kien || item.du_kien_thu_thang_nay || item.chi_tieu || 0) : (item.chi_tieu || 0);
    const thucTe = isTC ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0) : (item.ket_qua_thuc_te || 0);
    const tyLe = chiTieu > 0 ? Math.min(100, Math.round((thucTe / chiTieu) * 100)) : 0;
    tongDiemDat += tyLe;
  });
  const tyLeHoanThanhChung = ds.length > 0 ? Math.round(tongDiemDat / ds.length) : 0;

  return (
    <div className="space-y-4">
      {/* Banner trạng thái báo cáo tháng nếu có */}
      {baoCao && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
            baoCao.trang_thai === 'da_gui'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-5 shrink-0" />
            <div>
              <span className="text-xs font-bold block">
                {baoCao.trang_thai === 'da_gui'
                  ? 'Báo cáo tổng kết tháng này đã nộp cho Sếp'
                  : 'Báo cáo tổng kết tháng này đang lưu nháp'}
              </span>
              <span className="text-[11px] opacity-80 block">
                {tongDuKienThu > 0 && `Doanh thu: ${DINH_DANG_TIEN_NGAN_GON(tongThucTeThu)} / ${DINH_DANG_TIEN_NGAN_GON(tongDuKienThu)} • `}
                Độ hoàn thành KPI chung: {tyLeHoanThanhChung}%
                {baoCao.ngay_cap_nhat && ` • Cập nhật: ${new Date(baoCao.ngay_cap_nhat).toLocaleDateString('vi-VN')}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onMoDrawerTongKet}
            className="h-7.5 px-3 rounded-lg bg-background border border-border hover:bg-muted text-xs font-bold transition-colors shadow-xs"
          >
            Xem & Xuất báo cáo
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Card 1: Tổng số mục tiêu & Tỷ lệ chung */}
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng số Mục tiêu / KPI
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {ds.length} <span className="text-xs font-normal text-muted-foreground">mục tiêu</span>
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block font-medium">
              Hoàn thành chung: <strong className="text-primary">{tyLeHoanThanhChung}%</strong>
            </span>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Target className="size-5" />
          </div>
        </div>

        {/* Card 2: Tổng HĐ */}
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng giá trị HĐ gắn liền
            </span>
            <span className="text-2xl font-extrabold text-foreground tabular-nums mt-1 block">
              {DINH_DANG_TIEN_NGAN_GON(tongGiaTriHd)}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">
              {dsTaiChinh.length} mục tiêu tài chính
            </span>
          </div>
          <div className="size-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
            <Wallet className="size-5" />
          </div>
        </div>

        {/* Card 3: Dự kiến thu */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Chỉ tiêu Doanh thu tháng
            </span>
            <span className="text-2xl font-black text-emerald-600 tabular-nums mt-1 block">
              {DINH_DANG_TIEN_NGAN_GON(tongDuKienThu)}
            </span>
            <span className="text-[10px] text-emerald-700/80 mt-0.5 block">
              Chỉ tiêu tiền cần thu
            </span>
          </div>
          <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-lg">
            💵
          </div>
        </div>

        {/* Card 4: Thực tế đã thu */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Doanh thu thực tế về
              </span>
              <span className="text-[11px] font-extrabold text-blue-600 font-mono">
                {tyLeDatTien}%
              </span>
            </div>
            <span className="text-2xl font-black text-blue-600 tabular-nums mt-1 block">
              {DINH_DANG_TIEN_NGAN_GON(tongThucTeThu)}
            </span>
            <span className="text-[10px] text-blue-700/80 mt-0.5 block">
              Tiền đã về tài khoản/quỹ
            </span>
          </div>
          <div className="size-10 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-border/80 flex items-center justify-between gap-2 flex-wrap bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">
              Bảng Mục tiêu & Kế hoạch Tháng
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
              {ds.length} mục tiêu
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onXuatExcel && (
              <button
                type="button"
                onClick={onXuatExcel}
                className="h-8.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="size-4" /> Xuất KH Tháng
              </button>
            )}
            {ds.length > 0 && (
              <button
                type="button"
                onClick={onMoDrawerTongKet}
                className="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck2 className="size-4" /> Tổng kết tháng
              </button>
            )}
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="size-4" /> Thêm mục tiêu
              </button>
            )}
          </div>
        </div>

        {ds.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-xs">Chưa có mục tiêu hoặc KPI tháng nào.</p>
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-xs font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm mục tiêu tháng
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-2 w-10 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[140px]">Xã/ Phường/ Đặc khu</th>
                  <th className="py-3 px-3 min-w-[180px]">Cơ quan / Khách hàng</th>
                  <th className="py-3 px-3 min-w-[160px]">Dự án (Dự kiến)</th>
                  <th className="py-3 px-3 min-w-[200px]">Mục tiêu (Kết quả mong muốn)</th>
                  <th className="py-3 px-3 min-w-[140px] text-right">Chỉ tiêu / Doanh số</th>
                  <th className="py-3 px-3 min-w-[110px]">Người hỗ trợ</th>
                  <th className="py-3 px-3 min-w-[120px]">Ghi chú</th>
                  {laSuaDuoc && <th className="py-3 px-3 w-16 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ds.map((item, idx) => {
                  const xaPhuongVal = item.xa_phuong || '';
                  const coQuan = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '—';
                  const duAnVal = item.du_an_du_kien || item.ten_khach_hang_du_an || '—';
                  const mucTieuVal = item.muc_tieu_thang || item.ten_muc_tieu || item.ten_khach_hang_du_an || '—';
                  const doanhSoVal = item.doanh_so_du_kien ?? item.du_kien_thu_thang_nay ?? item.gia_tri_hd ?? 0;
                  const hoTroVal = item.nguoi_ho_tro || '—';
                  const ghiChuText = item.ghi_chu || item.ghi_chu_ket_qua || '—';
                  const laTaiChinh = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && doanhSoVal > 0);

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, a')) return;
                        if (laSuaDuoc) onCapNhatThucTe(item);
                      }}
                    >
                      <td className="py-3 px-2 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px] font-medium">
                        {xaPhuongVal || '—'}
                      </td>
                      <td className="py-3 px-3">
                        {coQuan && coQuan !== '—' ? (
                          <div className="font-bold text-foreground">{coQuan}</div>
                        ) : (
                          <div className="text-[11px] font-medium text-muted-foreground italic">
                            — Mục tiêu chung / Địa bàn —
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {duAnVal}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground">{mucTieuVal}</div>
                        {item.loai_muc_tieu && item.loai_muc_tieu !== 'tai_chinh' && (
                          <div className="mt-1">
                            {renderBadgeLoai(item.loai_muc_tieu)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {laTaiChinh ? (
                          <span className="font-mono font-extrabold tabular-nums text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                            {doanhSoVal > 0 ? DINH_DANG_TIEN_NGAN_GON(doanhSoVal) : '—'}
                          </span>
                        ) : item.chi_tieu !== undefined && item.chi_tieu !== null ? (
                          <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md inline-block">
                            {item.chi_tieu} <span className="text-[10px] font-normal text-muted-foreground">{item.don_vi_tinh || ''}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Tiến độ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-amber-700 font-medium">
                        {hoTroVal}
                      </td>
                      <td className="py-3 px-3 leading-relaxed text-muted-foreground">
                        {ghiChuText}
                      </td>
                      {laSuaDuoc && (
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onCapNhatThucTe(item)}
                              className="size-7 rounded-md border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                              title="Cập nhật kết quả"
                            >
                              <TrendingUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSuaItem(item)}
                              className="size-7 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                              title="Sửa mục tiêu"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onXoaItem(item.id)}
                              className="size-7 rounded-md border border-danger/20 bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
