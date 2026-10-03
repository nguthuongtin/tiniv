'use client';

import { useState, useMemo } from 'react';
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
  MessageSquareQuote,
  Sparkles,
  UserRound,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type {
  KeHoachTuan,
  ItemKeHoachTuan,
  ItemKeHoachThang,
  LoaiMucTieuThang
} from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import {
  ThanhSoLieu,
  KhungDanhSach,
  DanhSachTheMobile,
  TheMobile,
  NutIcon,
  Bang,
  ChuDeBang,
  ThanBang,
  HangBang,
  ODauBang,
  OBang
} from '../ui';
import { cn } from '../../thu_vien/utils/cn';

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
  onLuuGhiChuBaoCao?: (khoKhan: string, deXuat: string) => Promise<void>;
  onXuatExcel?: () => void;
  danhSachMucTieuThang?: ItemKeHoachThang[];
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'tai_chinh':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <DollarSign className="size-3" /> Thu tiền
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-slate-500/10 text-slate-700 border border-slate-500/20">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'thi_truong':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
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
  onLuuGhiChuBaoCao,
  onXuatExcel,
  danhSachMucTieuThang = []
}: Props) {
  const ds = keHoach?.danh_sach_tac_chien ?? [];

  const [boLocTrangThai, setBoLocTrangThai] = useState<'tat_ca' | 'chua_xong' | 'da_xong' | 'hom_nay'>('tat_ca');
  const [moGhiChu, setMoGhiChu] = useState(false);
  const [khoKhan, setKhoKhan] = useState(baoCao?.kho_khan ?? '');
  const [deXuat, setDeXuat] = useState(baoCao?.de_xuat ?? '');
  const [dangLuuGhiChu, setDangLuuGhiChu] = useState(false);

  const homNayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const soDaHoanThanh = ds.filter(
    (x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay'
  ).length;
  const soChuaXong = ds.length - soDaHoanThanh;
  const soHomNay = ds.filter((x) => x.ngay_du_kien === homNayISO).length;
  const soPhaiHoTro = ds.filter(
    (x) => (x.can_ho_tro ?? x.nguoi_ho_tro ?? '').trim().length > 0
  ).length;
  const tyLeHoanThanh = ds.length > 0 ? Math.round((soDaHoanThanh / ds.length) * 100) : 0;

  const dsHienThi = useMemo(() => {
    return ds.filter((item) => {
      const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
      if (boLocTrangThai === 'da_xong') return daXong;
      if (boLocTrangThai === 'chua_xong') return !daXong;
      if (boLocTrangThai === 'hom_nay') return item.ngay_du_kien === homNayISO;
      return true;
    });
  }, [ds, boLocTrangThai, homNayISO]);

  const xuLyLuuGhiChuNhanh = async () => {
    if (!onLuuGhiChuBaoCao) return;
    setDangLuuGhiChu(true);
    try {
      await onLuuGhiChuBaoCao(khoKhan.trim(), deXuat.trim());
      setMoGhiChu(false);
    } finally {
      setDangLuuGhiChu(false);
    }
  };

  return (
    <div className="space-y-4">
      <ThanhSoLieu
        items={[
          {
            id: 'tong_viec',
            nhan: 'Công việc tuần',
            nhan_ngan: 'Tổng việc',
            so_lieu: ds.length,
            icon: Target,
            mau_so: 'trang',
            dang_chon: boLocTrangThai === 'tat_ca',
            khi_bam: () => setBoLocTrangThai('tat_ca')
          },
          {
            id: 'hoan_thanh',
            nhan: 'Đã hoàn thành',
            nhan_ngan: 'Hoàn thành',
            so_lieu: `${soDaHoanThanh}/${ds.length}`,
            icon: CheckCircle2,
            mau_so: 'xanh_la',
            dang_chon: boLocTrangThai === 'da_xong',
            khi_bam: () =>
              setBoLocTrangThai(boLocTrangThai === 'da_xong' ? 'tat_ca' : 'da_xong')
          },
          {
            id: 'ty_le',
            nhan: 'Đang thực hiện',
            nhan_ngan: 'Đang làm',
            so_lieu: `${soChuaXong} việc (${tyLeHoanThanh}%)`,
            icon: Calendar,
            mau_so: 'xanh_duong',
            dang_chon: boLocTrangThai === 'chua_xong',
            khi_bam: () =>
              setBoLocTrangThai(boLocTrangThai === 'chua_xong' ? 'tat_ca' : 'chua_xong')
          },
          {
            id: 'can_ho_tro',
            nhan: 'Cần phối hợp / Hỗ trợ',
            nhan_ngan: 'Hỗ trợ',
            so_lieu: soPhaiHoTro,
            icon: HelpCircle,
            mau_so: 'vang'
          }
        ]}
      />

      {/* Thanh trạng thái tự động đồng bộ + Ghi chú Khó khăn / Đề xuất 1 chạm */}
      {ds.length > 0 && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3.5 py-2.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-4 text-emerald-600 shrink-0" />
              <span className="text-phu font-semibold text-foreground">
                Tiến độ tự động đồng bộ sang Báo cáo Tuần, Báo cáo Ngày & Lịch công tác
              </span>
              {(baoCao?.kho_khan || baoCao?.de_xuat) && !moGhiChu && (
                <span className="text-nhan px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-bold">
                  Đã có ghi chú khó khăn / đề xuất
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onLuuGhiChuBaoCao && laSuaDuoc && (
                <button
                  type="button"
                  onClick={() => {
                    setKhoKhan(baoCao?.kho_khan ?? '');
                    setDeXuat(baoCao?.de_xuat ?? '');
                    setMoGhiChu(!moGhiChu);
                  }}
                  className="h-7.5 px-2.5 rounded-lg bg-background border border-border hover:bg-muted text-nhan font-bold text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  {moGhiChu ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  Khó khăn & Đề xuất
                </button>
              )}
              <button
                type="button"
                onClick={onMoDrawerTongKet}
                className="h-7.5 px-2.5 rounded-lg bg-background border border-border hover:bg-muted text-nhan font-bold text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <FileCheck2 className="size-3.5 text-emerald-600" />
                Phiếu tổng kết / In
              </button>
            </div>
          </div>

          {!moGhiChu && (baoCao?.kho_khan || baoCao?.de_xuat) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-500/15 text-phu">
              {baoCao?.kho_khan && (
                <div className="text-muted-foreground">
                  <span className="font-bold text-amber-700">Khó khăn: </span>
                  {baoCao.kho_khan}
                </div>
              )}
              {baoCao?.de_xuat && (
                <div className="text-muted-foreground">
                  <span className="font-bold text-primary">Đề xuất: </span>
                  {baoCao.de_xuat}
                </div>
              )}
            </div>
          )}

          {moGhiChu && (
            <div className="pt-2 border-t border-emerald-500/20 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-nhan font-bold text-foreground block mb-1">
                    Khó khăn / Vướng mắc trong tuần
                  </label>
                  <textarea
                    rows={2}
                    value={khoKhan}
                    onChange={(e) => setKhoKhan(e.target.value)}
                    placeholder="Nhập vướng mắc cần tháo gỡ (nếu có)..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-phu text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-nhan font-bold text-foreground block mb-1">
                    Đề xuất / Kiến nghị hỗ trợ
                  </label>
                  <textarea
                    rows={2}
                    value={deXuat}
                    onChange={(e) => setDeXuat(e.target.value)}
                    placeholder="Nhập đề xuất với Trưởng phòng / Ban Giám đốc..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-phu text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMoGhiChu(false)}
                  className="h-8 px-3 rounded-lg border border-border bg-background text-nhan font-semibold hover:bg-muted"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={dangLuuGhiChu}
                  onClick={xuLyLuuGhiChuNhanh}
                  className="h-8 px-3.5 rounded-lg bg-primary text-primary-foreground text-nhan font-bold hover:bg-primary/90 inline-flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  {dangLuuGhiChu ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bảng & Thẻ Công việc Tuần */}
      <KhungDanhSach
        tieu_de="Kế hoạch & Tác chiến Tuần"
        tieu_de_ngan="KH Tuần"
        so_luong={dsHienThi.length}
        hanh_dong={
          <div className="flex items-center gap-2">
            {onXuatExcel && ds.length > 0 && (
              <button
                type="button"
                onClick={onXuatExcel}
                className="h-8.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="size-3.5" />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            )}
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="size-4" /> Thêm việc tuần
              </button>
            )}
          </div>
        }
      >
        <div className="px-3.5 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'tat_ca', nhan: `Tất cả (${ds.length})` },
              { id: 'chua_xong', nhan: `Cần làm (${soChuaXong})` },
              { id: 'da_xong', nhan: `Đã xong (${soDaHoanThanh})` },
              ...(soHomNay > 0 ? [{ id: 'hom_nay', nhan: `Hôm nay (${soHomNay})` }] : [])
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBoLocTrangThai(tab.id as any)}
              className={cn(
                'h-7.5 px-2.5 rounded-lg text-nhan font-bold transition-all',
                boLocTrangThai === tab.id
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.nhan}
            </button>
          ))}
        </div>

        {dsHienThi.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-phu">
              {ds.length === 0
                ? 'Chưa có kế hoạch tác chiến tuần nào.'
                : 'Không có công việc nào khớp bộ lọc đang chọn.'}
            </p>
            {laSuaDuoc && ds.length === 0 && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-phu font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm công việc tuần đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE (6 cột tinh gọn, căn lề chuẩn) */}
            <div className="hidden sm:block">
              <Bang>
                <ChuDeBang>
                  <HangBang>
                    <ODauBang className="w-12 text-center">Xong</ODauBang>
                    <ODauBang className="w-[220px]">Khách hàng / Địa bàn</ODauBang>
                    <ODauBang className="w-[190px]">Dự án & Mục tiêu</ODauBang>
                    <ODauBang className="w-[230px]">Hành động & Lịch dự kiến</ODauBang>
                    <ODauBang>Kết quả & Tiến độ (Check-in)</ODauBang>
                    {laSuaDuoc && <ODauBang className="w-28 text-right">Thao tác</ODauBang>}
                  </HangBang>
                </ChuDeBang>
                <ThanBang>
                  {dsHienThi.map((item, idx) => {
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

                    const duAnVal = item.du_an_du_kien || '';
                    const hanhDongVal = item.hanh_dong_tuan || item.noi_dung_tuan || '—';
                    const ketQuaMongMuonVal = item.ket_qua_mong_muon || item.dau_ra_cam_ket || '—';
                    const daXong =
                      item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                    const dsKetQua = item.danh_sach_ket_qua ?? [];
                    const hoTroVal = item.nguoi_ho_tro || item.can_ho_tro || '';

                    return (
                      <HangBang
                        key={item.id || idx}
                        className={cn(
                          'cursor-pointer transition-colors',
                          daXong && 'bg-emerald-500/[0.03]'
                        )}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, input, a')) return;
                          if (laSuaDuoc) onCapNhatTienDo(item);
                        }}
                      >
                        <OBang className="text-center align-top" onClick={(e) => e.stopPropagation()}>
                          {laSuaDuoc ? (
                            <input
                              type="checkbox"
                              checked={Boolean(daXong)}
                              onChange={(e) => onDoiVatChung(item.id, e.target.checked)}
                              className="size-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                              title={daXong ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                            />
                          ) : daXong ? (
                            <CheckCircle2 className="size-4.5 text-emerald-600 mx-auto mt-0.5" />
                          ) : (
                            <AlertCircle className="size-4.5 text-muted-foreground mx-auto mt-0.5" />
                          )}
                        </OBang>

                        <OBang className="align-top space-y-1">
                          <div className={cn('font-bold text-noi-dung text-foreground', daXong && 'line-through decoration-emerald-600/50')}>
                            {coQuan}
                          </div>
                          {xaPhuongVal && (
                            <div className="text-nhan text-muted-foreground flex items-center gap-1">
                              <MapPin className="size-3 shrink-0 text-amber-600" />
                              <span>{xaPhuongVal}</span>
                            </div>
                          )}
                          {(tenLienHe || chucVuLienHe) && (
                            <div className="text-nhan text-muted-foreground flex items-center gap-1">
                              <UserRound className="size-3 shrink-0 text-primary" />
                              <span>
                                {tenLienHe}
                                {chucVuLienHe ? ` (${chucVuLienHe})` : ''}
                              </span>
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-top space-y-1">
                          {duAnVal && (
                            <div className="font-semibold text-phu text-foreground line-clamp-2">
                              {duAnVal}
                            </div>
                          )}
                          {mtGoc ? (
                            <div className="inline-flex items-start gap-1 text-nhan text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <Target className="size-3 mt-0.5 shrink-0" />
                              <span className="line-clamp-2 font-medium">
                                {mtGoc.muc_tieu_thang || mtGoc.ten_muc_tieu}
                              </span>
                            </div>
                          ) : (
                            renderBadgeLoai(item.loai_cong_viec)
                          )}
                        </OBang>

                        <OBang className="align-top space-y-1.5">
                          <div className="font-medium text-phu text-foreground leading-snug">
                            {hanhDongVal}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.ngay_du_kien ? (
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-nhan font-bold font-mono inline-flex items-center gap-1',
                                  item.ngay_du_kien === homNayISO
                                    ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                                    : 'bg-primary/10 text-primary'
                                )}
                              >
                                <Calendar className="size-3" />
                                {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')}
                              </span>
                            ) : (
                              <span className="text-nhan text-muted-foreground italic">
                                Trong tuần
                              </span>
                            )}
                            {hoTroVal && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 text-nhan font-medium">
                                HT: {hoTroVal}
                              </span>
                            )}
                          </div>
                        </OBang>

                        <OBang className="align-top space-y-1.5">
                          <div className="text-nhan text-muted-foreground">
                            <span className="font-semibold">Mục tiêu:</span>{' '}
                            <span className="text-foreground font-medium">{ketQuaMongMuonVal}</span>
                          </div>

                          {dsKetQua.length > 0 ? (
                            <div className="space-y-1 pt-1 border-t border-border/50">
                              {dsKetQua.slice(0, 2).map((kq, kIdx) => (
                                <div key={kq.id || kIdx} className="text-nhan text-foreground space-y-0.5">
                                  <div className="flex items-start gap-1.5">
                                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0 mt-0.5 font-bold">
                                      {kq.ngay_ghi_nhan
                                        ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit'
                                          })
                                        : 'KQ'}
                                    </span>
                                    <span className="line-clamp-2 leading-snug font-medium">
                                      {kq.noi_dung}
                                    </span>
                                    {kq.link_dinh_kem && (
                                      <a
                                        href={kq.link_dinh_kem}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline shrink-0 font-bold"
                                      >
                                        <Link2 className="size-2.5" /> Link
                                      </a>
                                    )}
                                  </div>
                                  {kq.chi_dao && (
                                    <div className="text-[11px] text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-medium">
                                      <MessageSquareQuote className="size-3 text-amber-600 shrink-0" />
                                      <span className="line-clamp-1">
                                        <b>{kq.chi_dao.ten_nguoi_chi_dao || 'Lãnh đạo'}:</b>{' '}
                                        {kq.chi_dao.noi_dung}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : item.ket_qua_thuc_te ? (
                            <div className="text-nhan font-semibold text-emerald-700">
                              ✓ {item.ket_qua_thuc_te}
                            </div>
                          ) : (
                            <div className="text-nhan text-primary font-semibold hover:underline inline-flex items-center gap-1">
                              <MessageSquarePlus className="size-3" /> Bấm để Check-in kết quả
                            </div>
                          )}
                        </OBang>

                        {laSuaDuoc && (
                          <OBang className="text-right align-top" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onCapNhatTienDo(item)}
                                className="h-7 px-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-nhan font-bold inline-flex items-center gap-1 transition-colors"
                                title="Check-in kết quả (Tự động vào Báo cáo ngày & Tuần)"
                              >
                                <MessageSquarePlus className="size-3.5" />
                                Check-in
                              </button>
                              <NutIcon
                                icon={Pencil}
                                tieu_de="Sửa kế hoạch"
                                onClick={() => onSuaItem(item)}
                              />
                              <NutIcon
                                icon={Trash2}
                                tieu_de="Xóa"
                                mau="do"
                                onClick={() => onXoaItem(item.id)}
                              />
                            </div>
                          </OBang>
                        )}
                      </HangBang>
                    );
                  })}
                </ThanBang>
              </Bang>
            </div>

            {/* MOBILE CARDS (Chuẩn TheMobile, thao tác 1 chạm trên điện thoại) */}
            <DanhSachTheMobile>
              {dsHienThi.map((item, idx) => {
                const coQuan = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || 'Công việc tuần';
                const hanhDongVal = item.hanh_dong_tuan || item.noi_dung_tuan || '—';
                const ketQuaMongMuonVal = item.ket_qua_mong_muon || item.dau_ra_cam_ket || '—';
                const daXong =
                  item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                const dsKetQua = item.danh_sach_ket_qua ?? [];
                const kqMoiNhat = dsKetQua[0]?.noi_dung || item.ket_qua_thuc_te || '';

                return (
                  <TheMobile
                    key={item.id || idx}
                    onClick={() => {
                      if (laSuaDuoc) onCapNhatTienDo(item);
                    }}
                    className={cn(daXong && 'border-emerald-500/30 bg-emerald-500/[0.02]')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {laSuaDuoc && (
                          <input
                            type="checkbox"
                            checked={Boolean(daXong)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onDoiVatChung(item.id, e.target.checked)}
                            className="size-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div
                            className={cn(
                              'font-bold text-noi-dung text-foreground leading-snug',
                              daXong && 'line-through decoration-emerald-600/50'
                            )}
                          >
                            {coQuan}
                          </div>
                          {item.xa_phuong && (
                            <div className="text-nhan text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="size-3 text-amber-600 shrink-0" />
                              <span className="truncate">{item.xa_phuong}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.ngay_du_kien && (
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-nhan font-bold shrink-0">
                          {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      )}
                    </div>

                    <div className="text-phu text-foreground font-medium bg-muted/40 rounded-lg p-2.5 space-y-1">
                      <div>{hanhDongVal}</div>
                      <div className="text-nhan text-muted-foreground">
                        Mục tiêu: <span className="text-foreground font-semibold">{ketQuaMongMuonVal}</span>
                      </div>
                    </div>

                    {kqMoiNhat && (
                      <div className="text-nhan text-emerald-700 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-medium">
                        <b>Kết quả:</b> {kqMoiNhat}
                      </div>
                    )}

                    {laSuaDuoc && (
                      <div
                        className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onCapNhatTienDo(item)}
                          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-nhan font-bold inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <MessageSquarePlus className="size-3.5" />
                          Check-in kết quả
                        </button>
                        <div className="flex items-center gap-1">
                          <NutIcon
                            icon={Pencil}
                            tieu_de="Sửa"
                            onClick={() => onSuaItem(item)}
                          />
                          <NutIcon
                            icon={Trash2}
                            tieu_de="Xóa"
                            mau="do"
                            onClick={() => onXoaItem(item.id)}
                          />
                        </div>
                      </div>
                    )}
                  </TheMobile>
                );
              })}
            </DanhSachTheMobile>
          </>
        )}
      </KhungDanhSach>
    </div>
  );
}
