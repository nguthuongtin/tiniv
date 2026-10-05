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
  CalendarRange
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <MapPin className="size-3" /> Số lượng / Thị trường
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
          <Target className="size-3" /> Mục tiêu khác
        </span>
      );
    case 'tai_chinh':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
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

  const [moGhiChu, setMoGhiChu] = useState(false);
  const [khoKhan, setKhoKhan] = useState(baoCao?.kho_khan ?? '');
  const [deXuat, setDeXuat] = useState(baoCao?.de_xuat ?? '');
  const [dangLuuGhiChu, setDangLuuGhiChu] = useState(false);
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
            {onLuuGhiChuBaoCao && laSuaDuoc && ds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setKhoKhan(baoCao?.kho_khan ?? '');
                  setDeXuat(baoCao?.de_xuat ?? '');
                  setMoGhiChu(true);
                }}
                className="h-8.5 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-nhan font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs relative cursor-pointer"
              >
                <AlertCircle className="size-4 text-amber-600" />
                <span className="hidden sm:inline">Khó khăn & Đề xuất</span>
                {(baoCao?.kho_khan || baoCao?.de_xuat) && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                )}
              </button>
            )}
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
                    <ODauBang className="w-[180px]">Triển khai tuần</ODauBang>
                    <ODauBang className="w-[240px] text-right">Thực tế / Chỉ tiêu</ODauBang>
                    {laSuaDuoc && <ODauBang className="w-48 text-right">Thao tác</ODauBang>}
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

                    const soViecTuanLienKet = dsViecTuan.filter(
                      (v) => v.muc_tieu_thang_id === item.id
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
                        <OBang className="text-center font-bold text-muted-foreground align-middle">
                          {idx + 1}
                        </OBang>

                        <OBang className="align-middle space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-noi-dung text-foreground">
                              {mucTieuVal}
                            </span>
                            {renderBadgeLoai(item.loai_muc_tieu)}
                          </div>
                          {(coQuan || item.du_an_du_kien || item.nguoi_lien_he) && (
                            <div className="font-medium text-phu text-muted-foreground flex items-center gap-2 flex-wrap">
                              {coQuan && <span>KH: {coQuan}</span>}
                              {item.du_an_du_kien && <span>· DA: {item.du_an_du_kien}</span>}
                              {item.nguoi_lien_he && (
                                <span className="text-emerald-700 font-semibold">
                                  · LH: {item.nguoi_lien_he}
                                  {item.chuc_vu ? ` (${item.chuc_vu})` : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {soViecTuanLienKet > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-nhan font-bold">
                                {soViecTuanLienKet} việc tuần
                              </span>
                            )}
                            {laSuaDuoc && onTaoViecTuanTuMucTieu && (
                              <button
                                type="button"
                                onClick={() => onTaoViecTuanTuMucTieu(item)}
                                className="h-7 px-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-nhan font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Rút mục tiêu tháng này thành công việc trong tuần"
                              >
                                <CalendarRange className="size-3.5" /> + Rút việc tuần
                              </button>
                            )}
                          </div>
                        </OBang>

                        <OBang className="align-middle text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right">
                              {laTaiChinh ? (
                                <div className="font-mono text-phu font-bold">
                                  <span className="text-emerald-600">
                                    {DINH_DANG_TIEN_NGAN_GON(thucTe)}
                                  </span>
                                  <span className="text-muted-foreground font-normal"> / </span>
                                  <span className="text-foreground">
                                    {chiTieu > 0 ? DINH_DANG_TIEN_NGAN_GON(chiTieu) : '—'}
                                  </span>
                                </div>
                              ) : (
                                <div className="font-mono text-phu font-bold">
                                  <span className="text-emerald-600">{thucTe}</span>
                                  <span className="text-muted-foreground font-normal"> / </span>
                                  <span className="text-foreground">
                                    {chiTieu} {item.don_vi_tinh || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            {chiTieu > 0 && (
                              <div className="w-16 shrink-0">
                                <div className="flex items-center justify-end gap-1.5 mb-1">
                                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
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
                            className="text-right align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onCapNhatThucTe(item)}
                                className="h-7 px-2 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 text-nhan font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Cập nhật kết quả thực tế"
                              >
                                <TrendingUp className="size-3.5" /> Thực tế
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
                  <div className="text-sm text-slate-500 mb-1">Ghi chú & Giải trình</div>
                  <div className="text-sm bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {itemChiTiet.ghi_chu_ket_qua || itemChiTiet.ghi_chu}
                  </div>
                </div>
              )}
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

      {/* Modal: Khó khăn đề xuất */}
      {moGhiChu && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setMoGhiChu(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-600" /> Khó khăn & Đề xuất Tháng
              </h3>
              <button
                onClick={() => setMoGhiChu(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-1">
                  Khó khăn / Vướng mắc
                </label>
                <textarea
                  rows={3}
                  value={khoKhan}
                  onChange={(e) => setKhoKhan(e.target.value)}
                  placeholder="Nhập vướng mắc trong tháng..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-1">
                  Đề xuất / Kiến nghị
                </label>
                <textarea
                  rows={3}
                  value={deXuat}
                  onChange={(e) => setDeXuat(e.target.value)}
                  placeholder="Nhập đề xuất hỗ trợ..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setMoGhiChu(false)}
                className="h-9 px-4 rounded-lg bg-white border border-slate-200 font-bold text-sm"
              >
                Đóng
              </button>
              <button
                disabled={dangLuuGhiChu}
                onClick={xuLyLuuGhiChuNhanh}
                className="h-9 px-4 rounded-lg bg-primary text-white font-bold text-sm flex items-center gap-2"
              >
                <Save className="size-4" /> {dangLuuGhiChu ? 'Đang lưu...' : 'Lưu ghi chú'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
