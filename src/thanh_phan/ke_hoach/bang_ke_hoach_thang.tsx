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
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';
import type {
  KeHoachThang,
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
  baoCao?: BaoCaoKeHoachThang | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onSuaItem: (item: ItemKeHoachThang) => void;
  onXoaItem: (itemId: string) => void;
  onCapNhatThucTe: (item: ItemKeHoachThang) => void;
  onMoDrawerTongKet: () => void;
  onLuuGhiChuBaoCao?: (khoKhan: string, deXuat: string) => Promise<void>;
  onXuatExcel?: () => void;
}

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'thi_truong':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
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
    case 'tai_chinh':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-nhan font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
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
  onLuuGhiChuBaoCao,
  onXuatExcel
}: Props) {
  const ds = keHoach?.danh_sach_dia_ban ?? [];

  const [moGhiChu, setMoGhiChu] = useState(false);
  const [khoKhan, setKhoKhan] = useState(baoCao?.kho_khan ?? '');
  const [deXuat, setDeXuat] = useState(baoCao?.de_xuat ?? '');
  const [dangLuuGhiChu, setDangLuuGhiChu] = useState(false);

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

  // Tính toán tỷ lệ hoàn thành KPI tổng quát
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
            nhan: 'Chỉ tiêu doanh thu',
            nhan_ngan: 'Chỉ tiêu',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongDuKienThu),
            icon: DollarSign,
            mau_so: 'xanh_la'
          },
          {
            id: 'thuc_te_thu',
            nhan: `Thực tế về (${tyLeDatTien}%)`,
            nhan_ngan: 'Thực tế',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongThucTeThu),
            icon: TrendingUp,
            mau_so: 'xanh_duong'
          }
        ]}
      />

      {/* Thanh trạng thái tự động đồng bộ + Ghi chú Khó khăn / Đề xuất tháng */}
      {ds.length > 0 && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3.5 py-2.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-4 text-emerald-600 shrink-0" />
              <span className="text-phu font-semibold text-foreground">
                Kết quả thực tế cập nhật tới đâu tự động đồng bộ Báo cáo Tháng tới đó ({tyLeHoanThanhChung}%)
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
                    Khó khăn / Vướng mắc trong tháng
                  </label>
                  <textarea
                    rows={2}
                    value={khoKhan}
                    onChange={(e) => setKhoKhan(e.target.value)}
                    placeholder="Nhập vướng mắc trong tháng..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-phu text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-nhan font-bold text-foreground block mb-1">
                    Đề xuất / Kiến nghị tháng tới
                  </label>
                  <textarea
                    rows={2}
                    value={deXuat}
                    onChange={(e) => setDeXuat(e.target.value)}
                    placeholder="Nhập đề xuất hỗ trợ..."
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

      {/* Bảng & Thẻ Mục tiêu Tháng */}
      <KhungDanhSach
        tieu_de="Mục tiêu & Kế hoạch Tháng"
        tieu_de_ngan="KH Tháng"
        so_luong={ds.length}
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
                <Plus className="size-4" /> Thêm mục tiêu
              </button>
            )}
          </div>
        }
      >
        {ds.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-phu">Chưa có mục tiêu hoặc KPI tháng nào.</p>
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-phu font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm mục tiêu tháng
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden sm:block">
              <Bang>
                <ChuDeBang>
                  <HangBang>
                    <ODauBang className="w-10 text-center">STT</ODauBang>
                    <ODauBang className="w-[220px]">Khách hàng / Địa bàn</ODauBang>
                    <ODauBang className="w-[200px]">Dự án & Phân loại</ODauBang>
                    <ODauBang>Mục tiêu & Giải trình</ODauBang>
                    <ODauBang className="w-[210px] text-right">Thực tế đạt / Chỉ tiêu</ODauBang>
                    {laSuaDuoc && <ODauBang className="w-28 text-right">Thao tác</ODauBang>}
                  </HangBang>
                </ChuDeBang>
                <ThanBang>
                  {ds.map((item, idx) => {
                    const xaPhuongVal = item.xa_phuong || '';
                    const coQuan = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '—';
                    const duAnVal = item.du_an_du_kien || '';
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
                    const ghiChuText = item.ghi_chu_ket_qua || item.ghi_chu || '';

                    return (
                      <HangBang
                        key={item.id || idx}
                        className="cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, a')) return;
                          if (laSuaDuoc) onCapNhatThucTe(item);
                        }}
                      >
                        <OBang className="text-center font-bold text-muted-foreground align-top">
                          {idx + 1}
                        </OBang>

                        <OBang className="align-top space-y-1">
                          <div className="font-bold text-noi-dung text-foreground">{coQuan}</div>
                          {xaPhuongVal && (
                            <div className="text-nhan text-muted-foreground flex items-center gap-1">
                              <MapPin className="size-3 text-amber-600 shrink-0" />
                              <span>{xaPhuongVal}</span>
                            </div>
                          )}
                          {item.nguoi_ho_tro && (
                            <div className="text-nhan text-amber-700 font-medium">
                              Phối hợp: {item.nguoi_ho_tro}
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-top space-y-1">
                          {duAnVal && (
                            <div className="font-semibold text-phu text-foreground line-clamp-2">
                              {duAnVal}
                            </div>
                          )}
                          <div>{renderBadgeLoai(item.loai_muc_tieu)}</div>
                        </OBang>

                        <OBang className="align-top space-y-1">
                          <div className="font-medium text-phu text-foreground">{mucTieuVal}</div>
                          {ghiChuText && (
                            <div className="text-nhan text-muted-foreground italic">
                              Ghi chú: {ghiChuText}
                            </div>
                          )}
                        </OBang>

                        <OBang className="align-top text-right space-y-1.5">
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

                          {chiTieu > 0 && (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    tyLe >= 100
                                      ? 'bg-emerald-600'
                                      : tyLe >= 50
                                        ? 'bg-primary'
                                        : 'bg-amber-500'
                                  )}
                                  style={{ width: `${Math.min(100, tyLe)}%` }}
                                />
                              </div>
                              <span className="font-mono text-nhan font-bold text-muted-foreground">
                                {tyLe}%
                              </span>
                            </div>
                          )}
                        </OBang>

                        {laSuaDuoc && (
                          <OBang className="text-right align-top" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onCapNhatThucTe(item)}
                                className="h-7 px-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-nhan font-bold inline-flex items-center gap-1 transition-colors"
                                title="Cập nhật kết quả thực tế"
                              >
                                <TrendingUp className="size-3.5" />
                                Cập nhật
                              </button>
                              <NutIcon
                                icon={Pencil}
                                tieu_de="Sửa mục tiêu"
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

            {/* MOBILE CARDS */}
            <DanhSachTheMobile>
              {ds.map((item, idx) => {
                const coQuan = item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || 'Mục tiêu tháng';
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
                        <div className="font-bold text-noi-dung text-foreground">{coQuan}</div>
                        {item.xa_phuong && (
                          <div className="text-nhan text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-amber-600 shrink-0" />
                            <span>{item.xa_phuong}</span>
                          </div>
                        )}
                      </div>
                      {renderBadgeLoai(item.loai_muc_tieu)}
                    </div>

                    <div className="text-phu text-foreground font-medium bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                      <div>{mucTieuVal}</div>
                      <div className="flex items-center justify-between text-nhan pt-1 border-t border-border/50">
                        <span className="text-muted-foreground">Thực tế / Chỉ tiêu:</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {laTaiChinh
                            ? `${DINH_DANG_TIEN_NGAN_GON(thucTe)} / ${DINH_DANG_TIEN_NGAN_GON(chiTieu)}`
                            : `${thucTe} / ${chiTieu} ${item.don_vi_tinh || ''}`}{' '}
                          ({tyLe}%)
                        </span>
                      </div>
                    </div>

                    {laSuaDuoc && (
                      <div
                        className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onCapNhatThucTe(item)}
                          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-nhan font-bold inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <TrendingUp className="size-3.5" />
                          Cập nhật thực tế
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
