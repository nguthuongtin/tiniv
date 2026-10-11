'use client';

import { useState } from 'react';
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
  Save,
  ArrowRight,
  CalendarRange,
  Building2,
  FolderKanban
} from 'lucide-react';
import type {
  KeHoachThang,
  KeHoachTuan,
  ItemKeHoachThang,
  LoaiMucTieuThang
} from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
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
  keHoach: KeHoachThang | null;
  keHoachTuan?: KeHoachTuan | null;
  baoCao?: BaoCaoKeHoachThang | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onThemNhanh?: (item: ItemKeHoachThang) => void;
  onSuaItem: (item: ItemKeHoachThang) => void;
  onXoaItem: (itemId: string) => void;
  onCapNhatThucTe: (item: ItemKeHoachThang) => void;
  onMoDrawerTongKet: () => void;
  onLuuGhiChuBaoCao?: (khoKhan: string, deXuat: string) => Promise<void>;
  onXuatExcel?: () => void;
  onTaoViecTuanTuMucTieu?: (mucTieuThang: ItemKeHoachThang) => void;
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'thi_truong':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-700 border border-purple-500/20">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'tai_chinh':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <DollarSign className="size-3" /> Doanh số
        </span>
      );
  }
};

const dinhDangSoPhanNgan = (str: string): string => {
  const numStr = str.replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN');
};

export default function BangKeHoachThang({
  keHoach,
  keHoachTuan,
  baoCao,
  laSuaDuoc,
  onThemMoi,
  onThemNhanh,
  onSuaItem,
  onXoaItem,
  onCapNhatThucTe,
  onMoDrawerTongKet,
  onLuuGhiChuBaoCao,
  onTaoViecTuanTuMucTieu
}: Props) {
  const ds = keHoach?.danh_sach_dia_ban ?? [];
  const dsViecTuan = keHoachTuan?.danh_sach_tac_chien ?? [];

  // State thêm nhanh mục tiêu tháng ngay trên đầu bảng
  const [loaiNhanh, setLoaiNhanh] = useState<'tai_chinh' | 'thi_truong' | 'khac'>('tai_chinh');
  const [noiDungNhanh, setNoiDungNhanh] = useState('');
  const [chiTieuNhanh, setChiTieuNhanh] = useState('');
  const [donViNhanh, setDonViNhanh] = useState('Khách hàng');

  const [itemChiTiet, setItemChiTiet] = useState<ItemKeHoachThang | null>(null);

  const xuLyThemNhanhMucTieu = () => {
    if (!noiDungNhanh.trim() || !onThemNhanh) return;
    const soChiTieu = Number(chiTieuNhanh.replace(/\D/g, '')) || 0;
    const itemMoi: ItemKeHoachThang = {
      id: `item_${Date.now()}`,
      ten_khach_hang_du_an: noiDungNhanh.trim(),
      co_quan_doanh_nghiep: null,
      muc_tieu_thang: noiDungNhanh.trim(),
      ten_muc_tieu: noiDungNhanh.trim(),
      loai_muc_tieu: loaiNhanh,
      doanh_so_du_kien: loaiNhanh === 'tai_chinh' && soChiTieu > 0 ? soChiTieu : null,
      du_kien_thu_thang_nay: loaiNhanh === 'tai_chinh' && soChiTieu > 0 ? soChiTieu : undefined,
      chi_tieu: loaiNhanh !== 'khac' && soChiTieu > 0 ? soChiTieu : undefined,
      don_vi_tinh:
        loaiNhanh === 'tai_chinh'
          ? 'VNĐ'
          : loaiNhanh === 'thi_truong'
          ? donViNhanh.trim() || 'Mục tiêu'
          : undefined
    };
    onThemNhanh(itemMoi);
    setNoiDungNhanh('');
    setChiTieuNhanh('');
  };

  // Tính toán chỉ số tài chính
  const dsTaiChinh = ds.filter(
    (x) =>
      x.loai_muc_tieu === 'tai_chinh' ||
      (!x.loai_muc_tieu && ((x.du_kien_thu_thang_nay || 0) > 0 || (x.doanh_so_du_kien || 0) > 0))
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

  let tongDiemDat = 0;
  ds.forEach((item) => {
    const isTC =
      item.loai_muc_tieu === 'tai_chinh' ||
      (!item.loai_muc_tieu &&
        ((item.du_kien_thu_thang_nay || 0) > 0 || (item.doanh_so_du_kien || 0) > 0));
    const chiTieu = isTC
      ? item.doanh_so_du_kien || item.du_kien_thu_thang_nay || item.chi_tieu || 0
      : item.chi_tieu || 0;
    const thucTe = isTC
      ? item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0
      : item.ket_qua_thuc_te || 0;
    const tyLe = chiTieu > 0 ? Math.min(100, Math.round((thucTe / chiTieu) * 100)) : 0;
    tongDiemDat += tyLe;
  });
  const tyLeHoanThanhChung = ds.length > 0 ? Math.round(tongDiemDat / ds.length) : 0;

  return (
    <div className="space-y-4">
      <ThanhSoLieu
        items={[
          {
            id: 'muc_tieu',
            nhan: `Mục tiêu (${tyLeHoanThanhChung}%)`,
            nhan_ngan: 'Mục tiêu',
            so_lieu: ds.length,
            icon: Target,
            mau_so: 'trang'
          },
          {
            id: 'gia_tri_hd',
            nhan: 'Giá trị hợp đồng',
            nhan_ngan: 'Tổng HĐ',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongGiaTriHd),
            icon: Wallet,
            mau_so: 'vang'
          },
          {
            id: 'chi_tieu_thu',
            nhan: 'Chỉ tiêu doanh số',
            nhan_ngan: 'Chỉ tiêu',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongDuKienThu),
            icon: DollarSign,
            mau_so: 'xanh_la'
          },
          {
            id: 'thuc_te_thu',
            nhan: `Thực tế đạt (${tyLeDatTien}%)`,
            nhan_ngan: 'Thực tế',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongThucTeThu),
            icon: TrendingUp,
            mau_so: 'xanh_duong'
          }
        ]}
      />

      <KhungDanhSach
        tieu_de="Mục tiêu Tháng"
        tieu_de_ngan="Mục tiêu Tháng"
        so_luong={ds.length}
        hanh_dong={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {ds.length > 0 && (
              <button
                type="button"
                onClick={onMoDrawerTongKet}
                className="h-8.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileCheck2 className="size-4 text-emerald-600" />
                <span className="hidden sm:inline">Tổng kết tháng</span>
              </button>
            )}
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="size-4" /> Thêm mục tiêu
              </button>
            )}
          </div>
        }
      >
        {ds.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-phu">Chưa có mục tiêu tháng nào.</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Bang>
                <ChuDeBang>
                  <HangBang>
                    <ODauBang className="w-12 text-center">STT</ODauBang>
                    <ODauBang>Mục tiêu cam kết trong tháng</ODauBang>
                    <ODauBang className="w-[190px]">Tiến độ việc tuần</ODauBang>
                    <ODauBang className="w-[230px] text-right">Thực tế / Chỉ tiêu</ODauBang>
                    {laSuaDuoc && <ODauBang className="w-[180px] text-right">Thao tác</ODauBang>}
                  </HangBang>
                </ChuDeBang>
                <ThanBang>
                  {ds.map((item, idx) => {
                    const mucTieuVal =
                      item.muc_tieu_thang || item.ten_muc_tieu || item.ten_khach_hang_du_an || '—';
                    const coQuanRaw = (item.co_quan_doanh_nghiep || '').trim();
                    const coQuan =
                      coQuanRaw && coQuanRaw.toLowerCase() !== mucTieuVal.toLowerCase()
                        ? coQuanRaw
                        : '';
                    const doanhSoVal =
                      item.doanh_so_du_kien ?? item.du_kien_thu_thang_nay ?? item.gia_tri_hd ?? 0;
                    const laTaiChinh =
                      item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && doanhSoVal > 0);
                    const chiTieu = laTaiChinh ? doanhSoVal : (item.chi_tieu ?? 0);
                    const thucTe = laTaiChinh
                      ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0)
                      : (item.ket_qua_thuc_te ?? 0);
                    const tyLe =
                      chiTieu > 0 ? Math.min(100, Math.round((thucTe / chiTieu) * 100)) : 0;

                    const viecTuanLienKet = dsViecTuan.filter(
                      (v) => v.muc_tieu_thang_id === item.id
                    );
                    const soViecTuanLienKet = viecTuanLienKet.length;
                    const soViecTuanDaXong = viecTuanLienKet.filter(
                      (v) => v.trang_thai_ket_qua === 'dat_muc_tieu' || v.da_hoan_thanh
                    ).length;

                    return (
                      <HangBang
                        key={item.id || idx}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, a')) return;
                          setItemChiTiet(item);
                        }}
                      >
                        <OBang className="text-center font-medium text-xs text-muted-foreground align-middle">
                          {idx + 1}
                        </OBang>

                        <OBang className="align-middle space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {mucTieuVal}
                            </span>
                            {renderBadgeLoai(item.loai_muc_tieu)}
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
                        </OBang>

                        <OBang className="align-middle">
                          {soViecTuanLienKet > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                <span className="font-semibold text-emerald-700">
                                  {soViecTuanDaXong}/{soViecTuanLienKet} việc xong
                                </span>
                                <span className="font-mono text-muted-foreground text-[11px]">
                                  {Math.round((soViecTuanDaXong / soViecTuanLienKet) * 100)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    soViecTuanDaXong === soViecTuanLienKet ? 'bg-emerald-500' : 'bg-primary'
                                  )}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round((soViecTuanDaXong / soViecTuanLienKet) * 100)
                                    )}%`
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">
                              Chưa bẻ việc tuần
                            </span>
                          )}
                        </OBang>

                        <OBang className="align-middle text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right">
                              {laTaiChinh ? (
                                <div className="font-mono text-xs font-semibold">
                                  <span className="text-emerald-600">
                                    {DINH_DANG_TIEN_NGAN_GON(thucTe)}
                                  </span>
                                  <span className="text-muted-foreground font-normal"> / </span>
                                  <span className="text-foreground">
                                    {chiTieu > 0 ? DINH_DANG_TIEN_NGAN_GON(chiTieu) : '—'}
                                  </span>
                                </div>
                              ) : (
                                <div className="font-mono text-xs font-semibold">
                                  <span className="text-emerald-600">{thucTe}</span>
                                  <span className="text-muted-foreground font-normal"> / </span>
                                  <span className="text-foreground">
                                    {chiTieu} {item.don_vi_tinh || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            {chiTieu > 0 && (
                              <div className="w-14 shrink-0">
                                <div className="text-right mb-1">
                                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                    {tyLe}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all',
                                      tyLe >= 100
                                        ? 'bg-emerald-500'
                                        : tyLe >= 50
                                        ? 'bg-primary'
                                        : 'bg-amber-500'
                                    )}
                                    style={{ width: `${Math.min(100, tyLe)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </OBang>

                        {laSuaDuoc && (
                          <OBang
                            className="text-right align-middle whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {onTaoViecTuanTuMucTieu && (
                                <button
                                  type="button"
                                  onClick={() => onTaoViecTuanTuMucTieu(item)}
                                  className="h-7 px-2.5 rounded-lg border border-primary/25 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Rút mục tiêu tháng thành công việc trong tuần"
                                >
                                  <CalendarRange className="size-3" />
                                  <span>+ Bẻ việc</span>
                                </button>
                              )}
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
              {ds.map((item, idx) => {
                const mucTieuVal =
                  item.muc_tieu_thang || item.ten_muc_tieu || item.ten_khach_hang_du_an || '—';
                const doanhSoVal =
                  item.doanh_so_du_kien ?? item.du_kien_thu_thang_nay ?? item.gia_tri_hd ?? 0;
                const laTaiChinh =
                  item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && doanhSoVal > 0);
                const chiTieu = laTaiChinh ? doanhSoVal : (item.chi_tieu ?? 0);
                const thucTe = laTaiChinh
                  ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0)
                  : (item.ket_qua_thuc_te ?? 0);
                const tyLe =
                  chiTieu > 0 ? Math.min(100, Math.round((thucTe / chiTieu) * 100)) : 0;

                return (
                  <TheMobile
                    key={item.id || idx}
                    onClick={() => {
                      if (laSuaDuoc) onCapNhatThucTe(item);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-noi-dung text-foreground">{mucTieuVal}</div>
                      </div>
                      {renderBadgeLoai(item.loai_muc_tieu)}
                    </div>

                    <div className="text-phu text-foreground font-medium bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-nhan">
                        <span className="text-muted-foreground">Thực tế / Chỉ tiêu:</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {laTaiChinh
                            ? `${DINH_DANG_TIEN_NGAN_GON(thucTe)} / ${DINH_DANG_TIEN_NGAN_GON(chiTieu)}`
                            : `${thucTe} / ${chiTieu} ${item.don_vi_tinh || ''}`}{' '}
                          ({tyLe}%)
                        </span>
                      </div>
                    </div>

                    {laSuaDuoc && onTaoViecTuanTuMucTieu && (
                      <div
                        className="pt-1 flex justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onTaoViecTuanTuMucTieu(item)}
                          className="h-7 px-2.5 rounded-lg bg-primary/10 text-primary text-nhan font-bold inline-flex items-center gap-1"
                        >
                          + Rút thành việc tuần <ArrowRight className="size-3" />
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

      {/* Drill-down: Chi tiết mục tiêu */}
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
              <h3 className="font-bold text-lg text-slate-900">Chi tiết mục tiêu tháng</h3>
              <button
                onClick={() => setItemChiTiet(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <div className="text-sm text-slate-500 mb-1">Nội dung mục tiêu</div>
                <div className="font-bold">
                  {itemChiTiet.muc_tieu_thang || itemChiTiet.ten_muc_tieu || '—'}
                </div>
              </div>
              {itemChiTiet.co_quan_doanh_nghiep && (
                <div>
                  <div className="text-sm text-slate-500 mb-1">Khách hàng / Dự án gắn kèm</div>
                  <div className="font-medium">{itemChiTiet.co_quan_doanh_nghiep}</div>
                </div>
              )}
              {(itemChiTiet.ghi_chu || itemChiTiet.ghi_chu_ket_qua) && (
                <div>
                  <div className="text-xs font-bold text-muted-foreground mb-1">Ghi chú & Giải trình</div>
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {itemChiTiet.ghi_chu_ket_qua || itemChiTiet.ghi_chu}
                  </div>
                </div>
              )}

              {/* Danh sách công việc tuần triển khai mục tiêu này */}
              <div>
                <div className="text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                  <span>Việc tuần triển khai</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {dsViecTuan.filter((v) => v.muc_tieu_thang_id === itemChiTiet.id).length} việc
                  </span>
                </div>
                {dsViecTuan.filter((v) => v.muc_tieu_thang_id === itemChiTiet.id).length === 0 ? (
                  <div className="text-xs text-muted-foreground italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Chưa bẻ mục tiêu này thành công việc tuần nào.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {dsViecTuan
                      .filter((v) => v.muc_tieu_thang_id === itemChiTiet.id)
                      .map((v, vIdx) => {
                        const daXong = v.trang_thai_ket_qua === 'dat_muc_tieu' || v.da_hoan_thanh;
                        return (
                          <div
                            key={v.id || vIdx}
                            className="p-2.5 rounded-lg border border-border bg-slate-50/60 flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className={cn('font-bold text-foreground leading-snug', daXong && 'line-through text-muted-foreground')}>
                                {v.noi_dung_tuan || v.hanh_dong_tuan}
                              </div>
                              {v.dau_ra_cam_ket && v.dau_ra_cam_ket !== (v.noi_dung_tuan || v.hanh_dong_tuan) && (
                                <div className="text-[11px] text-muted-foreground">
                                  🎯 {v.dau_ra_cam_ket}
                                </div>
                              )}
                            </div>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border',
                                v.trang_thai_ket_qua === 'dat_muc_tieu' || daXong
                                  ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                  : v.trang_thai_ket_qua === 'do_dang'
                                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                  : v.trang_thai_ket_qua === 'khong_dat'
                                  ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              )}
                            >
                              {v.trang_thai_ket_qua === 'dat_muc_tieu' || daXong
                                ? 'Đạt MT'
                                : v.trang_thai_ket_qua === 'do_dang'
                                ? 'Dở dang'
                                : v.trang_thai_ket_qua === 'khong_dat'
                                ? 'Không đạt'
                                : 'Đang làm'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
              {laSuaDuoc && (
                <>
                  {onTaoViecTuanTuMucTieu && (
                    <button
                      onClick={() => {
                        onTaoViecTuanTuMucTieu(itemChiTiet);
                        setItemChiTiet(null);
                      }}
                      className="h-9 px-3.5 rounded-lg bg-primary/10 text-primary font-bold text-sm"
                    >
                      + Rút việc tuần
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onCapNhatThucTe(itemChiTiet);
                      setItemChiTiet(null);
                    }}
                    className="h-9 px-4 rounded-lg bg-primary text-white font-bold text-sm"
                  >
                    Cập nhật thực tế
                  </button>
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

    </div>
  );
}
