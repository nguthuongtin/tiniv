'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  MessageSquarePlus,
  MapPin,
  Target,
  Link2,
  Save,
  Inbox,
  Play,
  Clock,
  XCircle,
  Building2,
  FolderKanban,
  Users
} from 'lucide-react';
import type {
  KeHoachTuan,
  ItemKeHoachTuan,
  ItemKeHoachThang,
  TrangThaiKetQuaCongViec
} from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import ModalChotKetQuaTuan from './modal_chot_ket_qua_tuan';
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
  onThemNhanh?: (item: ItemKeHoachTuan) => void;
  onSuaItem: (item: ItemKeHoachTuan) => void;
  onXoaItem: (itemId: string) => void;
  onDoiVatChung: (itemId: string, daLay: boolean) => void;
  onChotKetQua?: (
    itemId: string,
    trangThai: TrangThaiKetQuaCongViec,
    ketQuaThucTe: string
  ) => Promise<void> | void;
  onCapNhatTienDo: (item: ItemKeHoachTuan) => void;
  onLamHomNay?: (item: ItemKeHoachTuan) => void;
  onMoDrawerTongKet: () => void;
  onLuuGhiChuBaoCao?: (khoKhan: string, deXuat: string) => Promise<void>;
  onXuatExcel?: () => void;
  danhSachMucTieuThang?: ItemKeHoachThang[];
}

export default function BangKeHoachTuan({
  keHoach,
  baoCao,
  laSuaDuoc,
  onThemMoi,
  onThemNhanh,
  onSuaItem,
  onXoaItem,
  onDoiVatChung,
  onChotKetQua,
  onCapNhatTienDo,
  onLamHomNay,
  onMoDrawerTongKet,
  onLuuGhiChuBaoCao,
  danhSachMucTieuThang = []
}: Props) {
  const ds = keHoach?.danh_sach_tac_chien ?? [];

  // State thêm nhanh vào Rổ việc tuần
  const [noiDungNhanh, setNoiDungNhanh] = useState('');
  const [mucTieuThangNhanhId, setMucTieuThangNhanhId] = useState('');
  const [ngayNhanh, setNgayNhanh] = useState('');

  const [boLocTrangThai, setBoLocTrangThai] = useState<
    'tat_ca' | 'ro_tuan' | 'da_xep_ngay' | 'da_xong'
  >('tat_ca');
  const [itemChiTiet, setItemChiTiet] = useState<ItemKeHoachTuan | null>(null);
  const [itemChotKetQua, setItemChotKetQua] = useState<ItemKeHoachTuan | null>(null);

  const homNayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const kiemTraChuaDinhNgay = (x: ItemKeHoachTuan) =>
    !x.ngay_du_kien && (!x.cac_ngay_thuc_hien || x.cac_ngay_thuc_hien.length === 0);

  const soDaHoanThanh = ds.filter(
    (x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay'
  ).length;
  const soRoTuan = ds.filter(
    (x) =>
      !(x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay') &&
      kiemTraChuaDinhNgay(x)
  ).length;
  const soDaXepNgay = ds.filter(
    (x) =>
      !(x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay') &&
      !kiemTraChuaDinhNgay(x)
  ).length;
  const tyLeHoanThanh = ds.length > 0 ? Math.round((soDaHoanThanh / ds.length) * 100) : 0;

  const dsHienThi = useMemo(() => {
    return ds.filter((item) => {
      const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
      const chuaDinhNgay = kiemTraChuaDinhNgay(item);
      if (boLocTrangThai === 'da_xong') return daXong;
      if (boLocTrangThai === 'ro_tuan') return !daXong && chuaDinhNgay;
      if (boLocTrangThai === 'da_xep_ngay') return !daXong && !chuaDinhNgay;
      return true;
    });
  }, [ds, boLocTrangThai]);

  const xuLyThemNhanhViecTuan = () => {
    if (!noiDungNhanh.trim() || !onThemNhanh) return;
    const mt = mucTieuThangNhanhId
      ? danhSachMucTieuThang.find((m) => m.id === mucTieuThangNhanhId)
      : null;

    const itemMoi: ItemKeHoachTuan = {
      id: `tuan_${Date.now()}`,
      muc_tieu_thang_id: mt?.id || null,
      loai_hanh_dong: mt ? 'theo_muc_tieu' : 'phat_sinh',
      hinh_thuc: 'goi_dien',
      khach_hang_id: mt?.khach_hang_id || null,
      du_an_id: mt?.du_an_id || null,
      ten_khach_hang_du_an: mt?.co_quan_doanh_nghiep || noiDungNhanh.trim(),
      co_quan_doanh_nghiep: mt?.co_quan_doanh_nghiep || null,
      du_an_du_kien: mt?.du_an_du_kien || null,
      hanh_dong_tuan: noiDungNhanh.trim(),
      noi_dung_tuan: noiDungNhanh.trim(),
      ket_qua_mong_muon: '',
      dau_ra_cam_ket: '',
      ngay_du_kien: ngayNhanh || null,
      cac_ngay_thuc_hien: ngayNhanh ? [ngayNhanh] : [],
      da_hoan_thanh: false,
      danh_sach_ket_qua: []
    };

    onThemNhanh(itemMoi);
    setNoiDungNhanh('');
  };

  return (
    <div className="space-y-4">
      <ThanhSoLieu
        items={[
          {
            id: 'tong_viec',
            nhan: 'Tổng việc tuần',
            nhan_ngan: 'Tổng việc',
            so_lieu: ds.length,
            icon: Target,
            mau_so: 'trang',
            dang_chon: boLocTrangThai === 'tat_ca',
            khi_bam: () => setBoLocTrangThai('tat_ca')
          },
          {
            id: 'ro_tuan',
            nhan: 'Rổ việc tuần (Chưa định ngày)',
            nhan_ngan: 'Rổ tuần',
            so_lieu: soRoTuan,
            icon: Inbox,
            mau_so: 'vang',
            dang_chon: boLocTrangThai === 'ro_tuan',
            khi_bam: () =>
              setBoLocTrangThai(boLocTrangThai === 'ro_tuan' ? 'tat_ca' : 'ro_tuan')
          },
          {
            id: 'da_xep_ngay',
            nhan: 'Đã xếp vào ngày',
            nhan_ngan: 'Đã xếp ngày',
            so_lieu: soDaXepNgay,
            icon: Calendar,
            mau_so: 'xanh_duong',
            dang_chon: boLocTrangThai === 'da_xep_ngay',
            khi_bam: () =>
              setBoLocTrangThai(boLocTrangThai === 'da_xep_ngay' ? 'tat_ca' : 'da_xep_ngay')
          },
          {
            id: 'hoan_thanh',
            nhan: `Hoàn thành (${tyLeHoanThanh}%)`,
            nhan_ngan: 'Hoàn thành',
            so_lieu: `${soDaHoanThanh}/${ds.length}`,
            icon: CheckCircle2,
            mau_so: 'xanh_la',
            dang_chon: boLocTrangThai === 'da_xong',
            khi_bam: () =>
              setBoLocTrangThai(boLocTrangThai === 'da_xong' ? 'tat_ca' : 'da_xong')
          }
        ]}
      />

      <KhungDanhSach
        tieu_de="Rổ Việc Tuần & Lịch Phân Bổ"
        tieu_de_ngan="Việc Tuần"
        so_luong={dsHienThi.length}
        hanh_dong={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {ds.length > 0 && (
              <button
                type="button"
                onClick={onMoDrawerTongKet}
                className="h-8.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileCheck2 className="size-4 text-emerald-600" />
                <span className="hidden sm:inline">Tổng kết tuần</span>
              </button>
            )}
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
              { id: 'ro_tuan', nhan: `Rổ việc tuần - Chưa định ngày (${soRoTuan})` },
              { id: 'da_xep_ngay', nhan: `Đã xếp ngày (${soDaXepNgay})` },
              { id: 'da_xong', nhan: `Đã xong (${soDaHoanThanh})` }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBoLocTrangThai(tab.id)}
              className={cn(
                'h-7.5 px-2.5 rounded-lg text-nhan font-bold transition-all cursor-pointer',
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
                ? 'Chưa có công việc tuần nào.'
                : 'Không có công việc nào khớp bộ lọc đang chọn.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Bang>
                <ChuDeBang>
                  <HangBang>
                    <ODauBang className="w-28 text-center">Trạng thái</ODauBang>
                    <ODauBang>Nội dung & Đối tượng</ODauBang>
                    <ODauBang className="w-[180px]">Đầu ra cam kết</ODauBang>
                    <ODauBang className="w-[150px]">Lịch thực hiện</ODauBang>
                    <ODauBang className="w-[210px]">Kết quả thực tế</ODauBang>
                    {laSuaDuoc && <ODauBang className="w-[190px] text-right">Thao tác</ODauBang>}
                  </HangBang>
                </ChuDeBang>
                <ThanBang>
                  {dsHienThi.map((item, idx) => {
                    const mtGoc = item.muc_tieu_thang_id
                      ? danhSachMucTieuThang.find((m) => m.id === item.muc_tieu_thang_id)
                      : null;
                    const hanhDongVal =
                      item.hanh_dong_tuan ||
                      item.noi_dung_tuan ||
                      item.ten_khach_hang_du_an ||
                      '—';
                    const coQuanRaw = (item.co_quan_doanh_nghiep || '').trim();
                    const coQuan =
                      coQuanRaw && coQuanRaw.toLowerCase() !== hanhDongVal.toLowerCase()
                        ? coQuanRaw
                        : '';
                    const daXong =
                      item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                    const dsKetQua = item.danh_sach_ket_qua ?? [];
                    const kqMoiNhat = dsKetQua[0]?.noi_dung || item.ket_qua_thuc_te || '';
                    const chuaDinhNgay = kiemTraChuaDinhNgay(item);

                    return (
                      <HangBang
                        key={item.id || idx}
                        className={cn(
                          'cursor-pointer hover:bg-slate-50 transition-colors',
                          daXong && 'bg-emerald-500/[0.03]'
                        )}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, input, a')) return;
                          setItemChiTiet(item);
                        }}
                      >
                        <OBang
                          className="text-center align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {laSuaDuoc ? (
                            <button
                              type="button"
                              onClick={() => setItemChotKetQua(item)}
                              className={cn(
                                'px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border',
                                item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua)
                                  ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30'
                                  : item.trang_thai_ket_qua === 'do_dang'
                                  ? 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30'
                                  : item.trang_thai_ket_qua === 'khong_dat'
                                  ? 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              )}
                              title="Nhấp để chốt kết quả hoặc đổi trạng thái"
                            >
                              {item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua) ? (
                                <>
                                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                                  <span>Đạt mục tiêu</span>
                                </>
                              ) : item.trang_thai_ket_qua === 'do_dang' ? (
                                <>
                                  <Clock className="size-3.5 text-amber-600" />
                                  <span>Dở dang</span>
                                </>
                              ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                                <>
                                  <XCircle className="size-3.5 text-rose-600" />
                                  <span>Không đạt</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3.5 text-slate-400" />
                                  <span>Đang làm</span>
                                </>
                              )}
                            </button>
                          ) : item.trang_thai_ket_qua === 'dat_muc_tieu' || daXong ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3 text-emerald-600" /> Đạt MT
                            </span>
                          ) : item.trang_thai_ket_qua === 'do_dang' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30 inline-flex items-center gap-1">
                              <Clock className="size-3 text-amber-600" /> Dở dang
                            </span>
                          ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 border border-rose-500/30 inline-flex items-center gap-1">
                              <XCircle className="size-3 text-rose-600" /> Không đạt
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                              <Clock className="size-3 text-slate-400" /> Đang làm
                            </span>
                          )}
                        </OBang>

                        <OBang className="align-middle space-y-1">
                          <div
                            className={cn(
                              'font-semibold text-sm text-foreground',
                              daXong && 'line-through text-muted-foreground'
                            )}
                          >
                            {hanhDongVal}
                          </div>
                          {(coQuan || item.du_an_du_kien || item.nguoi_lien_he) && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                              {coQuan && (
                                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                  <Building2 className="size-3" /> {coQuan}
                                </span>
                              )}
                              {item.du_an_du_kien && (
                                <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                                  <FolderKanban className="size-3" /> {item.du_an_du_kien}
                                </span>
                              )}
                              {item.nguoi_lien_he && (
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <Users className="size-3 text-slate-400" /> {item.nguoi_lien_he}
                                  {item.chuc_vu ? ` (${item.chuc_vu})` : ''}
                                </span>
                              )}
                            </div>
                          )}
                          {mtGoc && (
                            <div className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                              <Target className="size-3 text-slate-500" />
                              <span className="line-clamp-1">
                                {mtGoc.muc_tieu_thang || mtGoc.ten_muc_tieu}
                              </span>
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-middle text-xs" onClick={(e) => e.stopPropagation()}>
                          {item.dau_ra_cam_ket || item.ket_qua_mong_muon ? (
                            <span className="font-medium text-foreground line-clamp-2">
                              {item.dau_ra_cam_ket || item.ket_qua_mong_muon}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </OBang>

                        <OBang className="align-middle space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          {!chuaDinhNgay ? (
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-semibold font-mono inline-flex items-center gap-1',
                                item.ngay_du_kien === homNayISO ||
                                  item.cac_ngay_thuc_hien?.includes(homNayISO)
                                  ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                                  : 'bg-slate-100 text-slate-700'
                              )}
                            >
                              <Calendar className="size-3 text-muted-foreground" />
                              {item.ngay_du_kien
                                ? new Date(item.ngay_du_kien).toLocaleDateString('vi-VN')
                                : `${item.cac_ngay_thuc_hien?.length || 1} ngày`}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/25 text-xs font-semibold inline-flex items-center gap-1">
                                <Inbox className="size-3" /> Rổ tuần (Chưa định ngày)
                              </span>
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-middle">
                          {kqMoiNhat ? (
                            <div className="space-y-1">
                              {dsKetQua.length > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold">
                                  {dsKetQua.length} lượt tương tác
                                </span>
                              )}
                              <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 line-clamp-2">
                                {dsKetQua[0]?.ten_khach_hang
                                  ? `[${dsKetQua[0].ten_khach_hang}] `
                                  : ''}
                                {kqMoiNhat}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              Chưa có tương tác
                            </div>
                          )}
                        </OBang>

                        {laSuaDuoc && (
                          <OBang
                            className="text-right align-middle whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {onLamHomNay && !daXong && (
                                <button
                                  type="button"
                                  onClick={() => onLamHomNay(item)}
                                  className="h-7 px-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-nhan font-bold inline-flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                                  title="Đưa vào Hôm nay và mở làm việc"
                                >
                                  <Play className="size-3 fill-current shrink-0" />
                                  <span>Làm hôm nay</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onCapNhatTienDo(item)}
                                className="size-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                title="Xem & cập nhật nhật ký"
                              >
                                <MessageSquarePlus className="size-3.5" />
                              </button>
                              <NutIcon icon={Pencil} tieu_de="Sửa" onClick={() => onSuaItem(item)} />
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

            {/* MOBILE CARDS */}
            <DanhSachTheMobile>
              {dsHienThi.map((item, idx) => {
                const hanhDongVal =
                  item.hanh_dong_tuan ||
                  item.noi_dung_tuan ||
                  item.ten_khach_hang_du_an ||
                  'Công việc tuần';
                const daXong =
                  item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                const dsKetQua = item.danh_sach_ket_qua ?? [];
                const kqMoiNhat = dsKetQua[0]?.noi_dung || item.ket_qua_thuc_te || '';
                const chuaDinhNgay = kiemTraChuaDinhNgay(item);

                return (
                  <TheMobile
                    key={item.id || idx}
                    onClick={() => {
                      if (laSuaDuoc) onCapNhatTienDo(item);
                    }}
                    className={cn(daXong && 'border-emerald-500/30 bg-emerald-500/[0.02]')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        {laSuaDuoc && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemChotKetQua(item);
                            }}
                            className={cn(
                              'mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer border',
                              item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua)
                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                : item.trang_thai_ket_qua === 'do_dang'
                                ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                : item.trang_thai_ket_qua === 'khong_dat'
                                ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            )}
                            title="Chốt kết quả"
                          >
                            {item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua) ? (
                              <CheckCircle2 className="size-3 text-emerald-600" />
                            ) : item.trang_thai_ket_qua === 'do_dang' ? (
                              <Clock className="size-3 text-amber-600" />
                            ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                              <XCircle className="size-3 text-rose-600" />
                            ) : (
                              <Clock className="size-3 text-slate-400" />
                            )}
                            <span>
                              {item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua)
                                ? 'Đạt MT'
                                : item.trang_thai_ket_qua === 'do_dang'
                                ? 'Dở dang'
                                : item.trang_thai_ket_qua === 'khong_dat'
                                ? 'Không đạt'
                                : 'Chốt KQ'}
                            </span>
                          </button>
                        )}
                        <div className="min-w-0">
                          <div
                            className={cn(
                              'font-bold text-noi-dung text-foreground leading-snug',
                              daXong && 'line-through decoration-emerald-600/50'
                            )}
                          >
                            {hanhDongVal}
                          </div>
                        </div>
                      </div>

                      {!chuaDinhNgay && item.ngay_du_kien ? (
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-nhan font-bold shrink-0">
                          {new Date(item.ngay_du_kien).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 text-nhan font-bold shrink-0">
                          Rổ tuần
                        </span>
                      )}
                    </div>

                    {(item.dau_ra_cam_ket || item.ket_qua_mong_muon) && (
                      <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md font-medium">
                        🎯 Cam kết: {item.dau_ra_cam_ket || item.ket_qua_mong_muon}
                      </div>
                    )}

                    {kqMoiNhat && (
                      <div className="text-nhan text-emerald-700 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-medium line-clamp-2">
                        ✓ {dsKetQua[0]?.ten_khach_hang ? `[${dsKetQua[0].ten_khach_hang}] ` : ''}
                        {kqMoiNhat}
                      </div>
                    )}

                    {laSuaDuoc && onLamHomNay && !daXong && (
                      <div
                        className="pt-1 flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onLamHomNay(item)}
                          className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-nhan font-bold inline-flex items-center gap-1"
                        >
                          <Play className="size-3 fill-current" /> Làm hôm nay
                        </button>
                      </div>
                    )}
                  </TheMobile>
                );
              })}
            </DanhSachTheMobile>
          </>
        )}
      </KhungDanhSach>

      {/* Drill-down: Chi tiết công việc tuần */}
      {itemChiTiet && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setItemChiTiet(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Chi tiết công việc tuần</h3>
              <button
                onClick={() => setItemChiTiet(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <div className="text-sm text-slate-500 mb-1">Nhiệm vụ thực hiện</div>
                <div className="font-bold">
                  {itemChiTiet.hanh_dong_tuan ||
                    itemChiTiet.noi_dung_tuan ||
                    itemChiTiet.ten_khach_hang_du_an ||
                    '—'}
                </div>
                {itemChiTiet.co_quan_doanh_nghiep &&
                  itemChiTiet.co_quan_doanh_nghiep !==
                    (itemChiTiet.hanh_dong_tuan || itemChiTiet.noi_dung_tuan) && (
                    <div className="text-sm text-emerald-700 font-semibold mt-1">
                      KH: {itemChiTiet.co_quan_doanh_nghiep}
                    </div>
                  )}
                {itemChiTiet.xa_phuong && (
                  <div className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin className="size-3 text-amber-600" /> {itemChiTiet.xa_phuong}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Mục tiêu cam kết</div>
                <div className="text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                  {itemChiTiet.ket_qua_mong_muon || itemChiTiet.dau_ra_cam_ket || '—'}
                </div>
              </div>

              {(itemChiTiet.danh_sach_ket_qua || []).length > 0 && (
                <div>
                  <div className="text-sm text-slate-500 mb-2">
                    Nhật ký tương tác ({(itemChiTiet.danh_sach_ket_qua || []).length} lượt)
                  </div>
                  <div className="space-y-2.5">
                    {(itemChiTiet.danh_sach_ket_qua || []).map((kq, idx) => (
                      <div
                        key={kq.id || idx}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-100"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {kq.ngay_ghi_nhan
                              ? new Date(kq.ngay_ghi_nhan).toLocaleDateString('vi-VN')
                              : 'KQ'}
                          </span>
                          {kq.ten_khach_hang && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              KH: {kq.ten_khach_hang}
                            </span>
                          )}
                          {kq.ten_du_an && (
                            <span className="text-xs font-bold text-indigo-800 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              DA: {kq.ten_du_an}
                            </span>
                          )}
                          {kq.link_dinh_kem && (
                            <a
                              href={kq.link_dinh_kem}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <Link2 className="size-3" /> Link
                            </a>
                          )}
                        </div>
                        <div className="text-sm font-medium">{kq.noi_dung}</div>
                        {kq.chi_dao && (
                          <div className="mt-2 text-xs bg-amber-50 p-2 rounded border border-amber-100 text-amber-900">
                            <strong>{kq.chi_dao.ten_nguoi_chi_dao || 'Lãnh đạo'}:</strong>{' '}
                            {kq.chi_dao.noi_dung}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
              {laSuaDuoc && (
                <>
                  {onLamHomNay && (
                    <button
                      onClick={() => {
                        onLamHomNay(itemChiTiet);
                        setItemChiTiet(null);
                      }}
                      className="h-9 px-4 rounded-lg bg-primary text-white font-bold text-sm"
                    >
                      Làm hôm nay
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSuaItem(itemChiTiet);
                      setItemChiTiet(null);
                    }}
                    className="h-9 px-4 rounded-lg bg-white border border-slate-200 font-bold text-sm"
                  >
                    Sửa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỐT KẾT QUẢ CÔNG VIỆC (3 TRẠNG THÁI + BẮT BUỘC KẾT QUẢ THỰC TẾ) */}
      <ModalChotKetQuaTuan
        mo={Boolean(itemChotKetQua)}
        item={itemChotKetQua}
        onDong={() => setItemChotKetQua(null)}
        onLuu={async (itemId, trangThai, ketQuaThucTe) => {
          if (onChotKetQua) {
            await onChotKetQua(itemId, trangThai, ketQuaThucTe);
          } else {
            onDoiVatChung(itemId, trangThai === 'dat_muc_tieu');
          }
        }}
      />
    </div>
  );
}
