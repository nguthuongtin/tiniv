'use client';

import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  Calendar,
  MessageSquarePlus,
  MapPin,
  DollarSign,
  Users,
  Target,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  MessageSquareQuote
} from 'lucide-react';
import type { KeHoachTuan, ItemKeHoachTuan, ItemKeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';

interface Props {
  keHoach: KeHoachTuan | null;
  baoCao?: BaoCaoKeHoachTuan | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onSuaItem: (item: ItemKeHoachTuan) => void;
  onXoaItem: (itemId: string) => void;
  onDoiVatChung: (itemId: string, daLay: boolean) => void;
  onCapNhatTienDo: (item: ItemKeHoachTuan) => void;
  onMoDrawerTongKet: () => void;
  onXuatExcel?: () => void;
  danhSachMucTieuThang?: ItemKeHoachThang[];
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'tai_chinh':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <DollarSign className="size-3" /> Thu tiền
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
    case 'thi_truong':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
  }
};

export default function BangKeHoachTuan({
  keHoach,
  baoCao,
  laSuaDuoc,
  onThemMoi,
  onSuaItem,
  onXoaItem,
  onDoiVatChung,
  onCapNhatTienDo,
  onMoDrawerTongKet,
  onXuatExcel,
  danhSachMucTieuThang = []
}: Props) {
  const ds = keHoach?.danh_sach_tac_chien ?? [];

  const soDaHoanThanh = ds.filter((x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay').length;
  const soPhaiHoTro = ds.filter((x) => (x.can_ho_tro ?? x.nguoi_ho_tro ?? '').trim().length > 0).length;

  return (
    <div className="space-y-4">
      {/* Banner trạng thái báo cáo tuần nếu có */}
      {baoCao && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
          baoCao.trang_thai === 'da_gui'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-5 shrink-0" />
            <div>
              <span className="text-xs font-bold block">
                {baoCao.trang_thai === 'da_gui'
                  ? 'Báo cáo tổng kết tuần này đã nộp cho Sếp'
                  : 'Báo cáo tổng kết tuần này đang lưu nháp'}
              </span>
              <span className="text-[11px] opacity-80 block">
                Hoàn thành: {baoCao.so_hoan_thanh}/{baoCao.tong_muc_tieu} ({baoCao.ty_le_hoan_thanh}%)
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng số công việc tuần
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {ds.length} <span className="text-xs font-normal text-muted-foreground">việc</span>
            </span>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            🎯
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Đã hoàn thành
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {soDaHoanThanh} / {ds.length}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Cần hỗ trợ
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {soPhaiHoTro}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
            <HelpCircle className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-3.5 sm:p-4 border-b border-border/80 flex items-center justify-between gap-2 flex-wrap bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-foreground">
              Bảng Kế hoạch & Tác chiến Tuần
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
              {ds.length} công việc
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onXuatExcel && (
              <button
                type="button"
                onClick={onXuatExcel}
                className="h-8.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="size-4" /> Xuất KH Tuần
              </button>
            )}
            {ds.length > 0 && (
              <button
                type="button"
                onClick={onMoDrawerTongKet}
                className="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck2 className="size-4" /> Tổng kết tuần
              </button>
            )}
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="size-4" /> Thêm mới
              </button>
            )}
          </div>
        </div>

        {ds.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-xs">Chưa có kế hoạch tác chiến tuần nào.</p>
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-xs font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm kế hoạch tuần
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-2 w-8 text-center">Xong</th>
                  <th className="py-3 px-2 w-10 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[170px]">Mục tiêu tháng</th>
                  <th className="py-3 px-3 min-w-[130px]">Xã / Phường</th>
                  <th className="py-3 px-3 min-w-[170px]">Cơ quan / Khách hàng</th>
                  <th className="py-3 px-3 min-w-[130px]">Người liên hệ</th>
                  <th className="py-3 px-3 min-w-[110px]">Chức vụ</th>
                  <th className="py-3 px-3 min-w-[100px] text-center">Ngày dự kiến</th>
                  <th className="py-3 px-3 min-w-[160px]">Dự án (Dự kiến)</th>
                  <th className="py-3 px-3 min-w-[200px]">Kế hoạch / Hành động</th>
                  <th className="py-3 px-3 min-w-[180px]">Kết quả mong muốn / Thực tế</th>
                  <th className="py-3 px-3 min-w-[110px]">Người hỗ trợ</th>
                  {laSuaDuoc && <th className="py-3 px-3 w-16 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ds.map((item, idx) => {
                  const mtGoc = item.muc_tieu_thang_id
                    ? danhSachMucTieuThang.find((m) => m.id === item.muc_tieu_thang_id)
                    : null;
                  const coQuan = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '—';
                  const xaPhuongVal = item.xa_phuong || '';
                  const nlhRaw = item.nguoi_lien_he || '';
                  let tenLienHe = nlhRaw;
                  let chucVuLienHe = item.chuc_vu || '';
                  if (!chucVuLienHe && nlhRaw.includes('_')) {
                    const parts = nlhRaw.split('_');
                    tenLienHe = parts[0];
                    chucVuLienHe = parts.slice(1).join('_');
                  }

                  const duAnVal = item.du_an_du_kien || item.ten_khach_hang_du_an || '—';
                  const hanhDongVal = item.hanh_dong_tuan || item.noi_dung_tuan || '—';
                  const ketQuaMongMuonVal = item.ket_qua_mong_muon || item.dau_ra_cam_ket || '—';
                  const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                  const dsKetQua = item.danh_sach_ket_qua ?? [];
                  const hoTroVal = item.nguoi_ho_tro || item.can_ho_tro || '—';

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, input, a')) return;
                        if (laSuaDuoc) onCapNhatTienDo(item);
                      }}
                    >
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        {laSuaDuoc ? (
                          <input
                            type="checkbox"
                            checked={Boolean(daXong)}
                            onChange={(e) => onDoiVatChung(item.id, e.target.checked)}
                            className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                            title={daXong ? 'Đã xong' : 'Đánh dấu xong'}
                          />
                        ) : (
                          <span className="size-4 inline-block">
                            {daXong ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertCircle className="size-4 text-muted-foreground" />}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        {mtGoc ? (
                          <div className="flex items-start gap-1.5">
                            <Target className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="font-semibold text-foreground text-xs leading-snug line-clamp-2">
                              {mtGoc.muc_tieu_thang || mtGoc.ten_muc_tieu}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic font-normal">
                            — Việc phát sinh —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px] font-medium">
                        {xaPhuongVal || '—'}
                      </td>
                      <td className="py-3 px-3">
                        {coQuan && coQuan !== '—' ? (
                          <div className="font-bold text-foreground">{coQuan}</div>
                        ) : (
                          <div className="text-[11px] font-medium text-muted-foreground italic">
                            — Công việc chung —
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {tenLienHe || '—'}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {chucVuLienHe || '—'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {item.ngay_du_kien ? (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold font-mono text-[11px] inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Trong tuần</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {duAnVal}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {hanhDongVal}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-primary">{ketQuaMongMuonVal}</div>
                        {item.ket_qua_thuc_te && (
                          <div className="text-[11px] font-bold text-emerald-600 mt-1">
                            [Thực tế]: {item.ket_qua_thuc_te}
                          </div>
                        )}
                        {dsKetQua.length > 0 && (
                          <div className="mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
                            {dsKetQua.slice(0, 3).map((kq, kIdx) => (
                              <div key={kq.id || kIdx} className="text-[11px] text-foreground space-y-0.5">
                                <div className="flex items-start gap-1">
                                  <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1 rounded shrink-0 mt-0.5">
                                    {kq.ngay_ghi_nhan ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN') : ''}
                                  </span>
                                  <span className="line-clamp-2 leading-tight">{kq.noi_dung}</span>
                                  {kq.link_dinh_kem && (
                                    <a
                                      href={kq.link_dinh_kem}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline shrink-0 font-semibold"
                                      title={kq.ten_tai_lieu || kq.link_dinh_kem}
                                    >
                                      <Link2 className="size-2.5" /> Link
                                    </a>
                                  )}
                                </div>
                                {kq.chi_dao && (
                                  <div className="text-[10px] text-amber-800 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-medium">
                                    <MessageSquareQuote className="size-2.5 text-amber-600 shrink-0" />
                                    <span className="line-clamp-1">
                                      <span className="font-bold">{kq.chi_dao.ten_nguoi_chi_dao || 'Sếp'}:</span> {kq.chi_dao.noi_dung}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-amber-700 font-medium">
                        {hoTroVal}
                      </td>
                      {laSuaDuoc && (
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onCapNhatTienDo(item)}
                              className="size-7 rounded-md border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
                              title="Ghi nhận kết quả"
                            >
                              <MessageSquarePlus className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onSuaItem(item)}
                              className="size-7 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                              title="Sửa kế hoạch"
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
