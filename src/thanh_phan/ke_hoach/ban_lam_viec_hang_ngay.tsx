'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Calendar,
  PhoneCall,
  Users,
  Briefcase,
  Building2,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  FileCheck,
  Inbox,
  Edit3,
  Trash2,
  CornerDownRight,
  Layers
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { KeHoachTuan, ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_GIAI_DOAN_MAC_DINH } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import { layKhoangNgayTuTuanISO } from '../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import { Nut, Ban_Ve } from '../ui';

interface Props {
  keHoachTuan: KeHoachTuan | null;
  danhSachLichGap?: LichGapKH[];
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  tuan: string;
  ngayChon: string;
  onDoiNgayChon: (ngay: string) => void;
  laSuaDuoc: boolean;
  onThemCongViec: (macDinh: { ngay: string; hinhThuc: 'gap_mat' | 'goi_dien' }) => void;
  onSuaCongViec: (item: ItemKeHoachTuan) => void;
  onXoaCongViec: (itemId: string) => void;
  onCheckIn1Cham: (item: ItemKeHoachTuan) => void;
  onDoiNhanhHoanThanh: (itemId: string, daXong: boolean) => void;
  onLenNongCongViec: (
    item: ItemKeHoachTuan,
    ngayDich: string | null,
    hinhThucMoi: 'gap_mat' | 'goi_dien'
  ) => void;
}

const TEN_THU = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const taoDanhSach7NgayTrongTuan = (tuanISO: string): { ngay: string; nhanThu: string; ngayThang: string }[] => {
  const { tuNgay } = layKhoangNgayTuTuanISO(tuanISO);
  const d0 = new Date(`${tuNgay}T00:00:00`);
  const ds: { ngay: string; nhanThu: string; ngayThang: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(d0);
    d.setDate(d0.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const thu = TEN_THU[d.getDay()];
    ds.push({
      ngay: iso,
      nhanThu: thu,
      ngayThang: `${dd}/${mm}`
    });
  }
  return ds;
};

export default function BanLamViecHangNgay({
  keHoachTuan,
  danhSachLichGap = [],
  danhSachDuAn = [],
  tuan,
  ngayChon,
  onDoiNgayChon,
  laSuaDuoc,
  onThemCongViec,
  onSuaCongViec,
  onXoaCongViec,
  onCheckIn1Cham,
  onDoiNhanhHoanThanh,
  onLenNongCongViec
}: Props) {
  const homNayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [boLocVanPhong, setBoLocVanPhong] = useState<'tat_ca' | 'chua_xong' | 'da_xong'>('tat_ca');
  const [loaiDrillDown, setLoaiDrillDown] = useState<
    'tong_viec' | 'van_phong' | 'lich_cong_tac' | 'bao_cao_ngay' | null
  >(null);

  const ds7Ngay = useMemo(() => taoDanhSach7NgayTrongTuan(tuan), [tuan]);
  const tatCaTacChien = useMemo(() => keHoachTuan?.danh_sach_tac_chien ?? [], [keHoachTuan]);

  // Map dự án để hiển thị tên & giai đoạn hiện tại
  const mapDuAn = useMemo(() => {
    const m = new Map<string, HoSoDuAn>();
    for (const da of danhSachDuAn) {
      m.set(da.id, da);
    }
    return m;
  }, [danhSachDuAn]);

  const mapNhanGiaiDoan = useMemo(() => {
    const m = new Map<string, string>();
    for (const gd of DANH_SACH_GIAI_DOAN_MAC_DINH) {
      m.set(gd.key, gd.nhan_ngan);
    }
    return m;
  }, []);

  // Kiểm tra 1 việc có phát sinh tương tác / cập nhật trong ngày đang chọn hay không
  const coTuongTacTrongNgay = (item: ItemKeHoachTuan, ngay: string): boolean => {
    if (item.ngay_hoan_thanh === ngay) return true;
    if (item.danh_sach_ket_qua?.some((kq) => kq.ngay_ghi_nhan === ngay)) return true;
    return false;
  };

  // 1. Danh sách Việc Văn Phòng của ngày đang chọn (hinh_thuc !== 'gap_mat')
  const dsViecVanPhongNgay = useMemo(() => {
    return tatCaTacChien.filter((item) => {
      const laGapMat = item.hinh_thuc === 'gap_mat';
      if (laGapMat) return false;
      return item.ngay_du_kien === ngayChon || coTuongTacTrongNgay(item, ngayChon);
    });
  }, [tatCaTacChien, ngayChon]);

  const dsViecVanPhongHienThi = useMemo(() => {
    if (boLocVanPhong === 'chua_xong') {
      return dsViecVanPhongNgay.filter((x) => !x.da_hoan_thanh);
    }
    if (boLocVanPhong === 'da_xong') {
      return dsViecVanPhongNgay.filter((x) => Boolean(x.da_hoan_thanh));
    }
    return dsViecVanPhongNgay;
  }, [dsViecVanPhongNgay, boLocVanPhong]);

  // 2. Danh sách Lịch Công Tác (Gặp mặt) của ngày đang chọn
  const dsViecGapMatNgay = useMemo(() => {
    return tatCaTacChien.filter((item) => {
      return item.hinh_thuc === 'gap_mat' && (item.ngay_du_kien === ngayChon || coTuongTacTrongNgay(item, ngayChon));
    });
  }, [tatCaTacChien, ngayChon]);

  // Các lịch hẹn trên Lịch công tác của ngày đang chọn
  const dsLichHenHomNay = useMemo(() => {
    return danhSachLichGap.filter((l) => l.ngay === ngayChon);
  }, [danhSachLichGap, ngayChon]);

  // 3. Rổ Việc Chờ trong tuần (Chưa gắn ngày HOẶC ngày trước chưa xong)
  const dsRoViecCho = useMemo(() => {
    return tatCaTacChien.filter((item) => {
      if (item.da_hoan_thanh) return false;
      if (!item.ngay_du_kien) return true;
      if (item.ngay_du_kien < ngayChon) return true;
      return false;
    });
  }, [tatCaTacChien, ngayChon]);

  // 4. Các việc đã tương tác / hoàn thành trong ngày (Tự động gom vào Báo cáo ngày)
  const dsDaXuLyTrongNgay = useMemo(() => {
    return tatCaTacChien.filter((item) => {
      if (coTuongTacTrongNgay(item, ngayChon)) return true;
      if (item.ngay_du_kien === ngayChon && (item.da_hoan_thanh || (item.danh_sach_ket_qua?.length ?? 0) > 0)) {
        return true;
      }
      return false;
    });
  }, [tatCaTacChien, ngayChon]);

  // Tổng việc trong ngày
  const dsTongViecNgay = useMemo(() => {
    const ids = new Set<string>();
    const out: ItemKeHoachTuan[] = [];
    for (const it of [...dsViecVanPhongNgay, ...dsViecGapMatNgay, ...dsDaXuLyTrongNgay]) {
      if (!ids.has(it.id)) {
        ids.add(it.id);
        out.push(it);
      }
    }
    return out;
  }, [dsViecVanPhongNgay, dsViecGapMatNgay, dsDaXuLyTrongNgay]);

  // Đếm số việc theo từng ngày trên thanh 7 ngày
  const demTheoNgay = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of ds7Ngay) {
      m[d.ngay] = tatCaTacChien.filter((x) => x.ngay_du_kien === d.ngay).length;
    }
    return m;
  }, [ds7Ngay, tatCaTacChien]);

  const layKetQuaMoiNhat = (item: ItemKeHoachTuan): string | null => {
    if (item.danh_sach_ket_qua && item.danh_sach_ket_qua.length > 0) {
      const kqNgay = item.danh_sach_ket_qua.find((k) => k.ngay_ghi_nhan === ngayChon);
      return kqNgay ? kqNgay.noi_dung : item.danh_sach_ket_qua[0].noi_dung;
    }
    return item.ket_qua_thuc_te || null;
  };

  return (
    <div className="space-y-5">
      {/* Thanh chọn ngày trong tuần */}
      <div className="bg-card border border-border rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-1">
          {ds7Ngay.map((d) => {
            const dangChon = d.ngay === ngayChon;
            const laHomNay = d.ngay === homNayISO;
            const soViec = demTheoNgay[d.ngay] || 0;
            return (
              <button
                key={d.ngay}
                type="button"
                onClick={() => onDoiNgayChon(d.ngay)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer',
                  dangChon
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                    : laHomNay
                    ? 'bg-primary/5 border-primary/30 text-primary font-bold hover:bg-primary/10'
                    : 'bg-background border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium'
                )}
              >
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-85">{d.nhanThu}</div>
                  <div className="text-xs font-mono font-bold">{d.ngayThang}</div>
                </div>
                {soViec > 0 && (
                  <span
                    className={cn(
                      'size-5 rounded-full text-[10px] font-bold inline-flex items-center justify-center',
                      dangChon ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    )}
                  >
                    {soViec}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ngayChon !== homNayISO && (
            <button
              type="button"
              onClick={() => onDoiNgayChon(homNayISO)}
              className="h-8.5 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/15 text-xs font-bold transition-colors cursor-pointer"
            >
              Về Hôm nay
            </button>
          )}
          <input
            type="date"
            value={ngayChon}
            onChange={(e) => e.target.value && onDoiNgayChon(e.target.value)}
            className="h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-bold text-foreground"
          />
        </div>
      </div>

      {/* 4 Thẻ chỉ số ngày (Tương tác Drill-down khi nhấp vào) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setLoaiDrillDown('tong_viec')}
          className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Tổng việc trong ngày</span>
            <Layers className="size-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground font-mono">{dsTongViecNgay.length}</span>
            <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-0.5">
              Xem chi tiết <ArrowUpRight className="size-3" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLoaiDrillDown('van_phong')}
          className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Bảng việc văn phòng</span>
            <PhoneCall className="size-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-700 font-mono">{dsViecVanPhongNgay.length}</span>
            <span className="text-[11px] font-semibold text-sky-700 inline-flex items-center gap-0.5">
              Xem chi tiết <ArrowUpRight className="size-3" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLoaiDrillDown('lich_cong_tac')}
          className="text-left p-4 rounded-2xl border border-border bg-card hover:border-emerald-500/40 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Lịch công tác (Gặp mặt)</span>
            <Users className="size-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {Math.max(dsViecGapMatNgay.length, dsLichHenHomNay.length)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-0.5">
              Xem chi tiết <ArrowUpRight className="size-3" />
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLoaiDrillDown('bao_cao_ngay')}
          className="text-left p-4 rounded-2xl border border-border bg-card hover:border-amber-500/40 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Đã tương tác / Báo cáo ngày</span>
            <FileCheck className="size-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 font-mono">{dsDaXuLyTrongNgay.length}</span>
            <span className="text-[11px] font-semibold text-amber-700 inline-flex items-center gap-0.5">
              Xem chi tiết <ArrowUpRight className="size-3" />
            </span>
          </div>
        </button>
      </div>

      {/* Bố cục Trận địa 2 cột: Cột Trái (Bảng việc văn phòng) - Cột Phải (Lịch công tác & Rổ việc chờ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* CỘT TRÁI (7/12): BẢNG VIỆC VĂN PHÒNG (TO-DO LIST) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center shrink-0">
                <PhoneCall className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground">
                  Bảng Việc Văn Phòng ({dsViecVanPhongNgay.length})
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Gọi điện, báo giá, làm hồ sơ thầu trong ngày {new Date(ngayChon).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-lg bg-muted p-0.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setBoLocVanPhong('tat_ca')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                    boLocVanPhong === 'tat_ca' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Tất cả ({dsViecVanPhongNgay.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBoLocVanPhong('chua_xong')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                    boLocVanPhong === 'chua_xong' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Cần làm ({dsViecVanPhongNgay.filter((x) => !x.da_hoan_thanh).length})
                </button>
                <button
                  type="button"
                  onClick={() => setBoLocVanPhong('da_xong')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                    boLocVanPhong === 'da_xong' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground'
                  )}
                >
                  Đã xong ({dsViecVanPhongNgay.filter((x) => x.da_hoan_thanh).length})
                </button>
              </div>

              {laSuaDuoc && (
                <Nut
                  kieu="primary"
                  kich_thuoc="xs"
                  onClick={() => onThemCongViec({ ngay: ngayChon, hinhThuc: 'goi_dien' })}
                >
                  <Plus className="size-3.5" /> Thêm việc VP
                </Nut>
              )}
            </div>
          </div>

          {dsViecVanPhongHienThi.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Chưa có đầu việc văn phòng nào trong ngày này.
              </div>
              {laSuaDuoc && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Nut
                    kieu="outline"
                    kich_thuoc="xs"
                    onClick={() => onThemCongViec({ ngay: ngayChon, hinhThuc: 'goi_dien' })}
                  >
                    <Plus className="size-3.5" /> Tạo việc phát sinh hôm nay
                  </Nut>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {dsViecVanPhongHienThi.map((item) => {
                const duAn = item.du_an_id ? mapDuAn.get(item.du_an_id) : undefined;
                const tenDuAn = duAn?.ten_du_an || item.du_an_du_kien;
                const nhanGiaiDoan = duAn?.giai_doan ? mapNhanGiaiDoan.get(duAn.giai_doan) || duAn.giai_doan : null;
                const kqMoi = layKetQuaMoiNhat(item);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 transition-colors hover:bg-muted/25 flex flex-col sm:flex-row sm:items-start justify-between gap-3',
                      item.da_hoan_thanh && 'bg-emerald-50/20'
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        disabled={!laSuaDuoc}
                        onClick={() => onDoiNhanhHoanThanh(item.id, !item.da_hoan_thanh)}
                        className="mt-0.5 text-muted-foreground hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                        title={item.da_hoan_thanh ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                      >
                        {item.da_hoan_thanh ? (
                          <CheckCircle2 className="size-5 text-emerald-600" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Dòng 1: Dự án & Khách hàng */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {tenDuAn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                              <Briefcase className="size-3 shrink-0" />
                              <span className="truncate max-w-[220px]">{tenDuAn}</span>
                            </span>
                          )}
                          {nhanGiaiDoan && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[10px] font-bold">
                              {nhanGiaiDoan}
                            </span>
                          )}
                          <span className="text-xs font-bold text-foreground inline-flex items-center gap-1">
                            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                            {item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}
                          </span>
                          {item.nguoi_lien_he && (
                            <span className="text-[11px] text-muted-foreground font-medium">
                              · LH: {item.nguoi_lien_he} {item.chuc_vu ? `(${item.chuc_vu})` : ''}
                            </span>
                          )}
                        </div>

                        {/* Dòng 2: Hành động cần làm */}
                        <div
                          className={cn(
                            'text-xs font-semibold text-foreground leading-relaxed',
                            item.da_hoan_thanh && 'line-through text-muted-foreground'
                          )}
                        >
                          {item.hanh_dong_tuan || item.noi_dung_tuan}
                        </div>

                        {/* Dòng 3: Đầu ra mong muốn */}
                        {(item.ket_qua_mong_muon || item.dau_ra_cam_ket) && (
                          <div className="text-[11px] text-muted-foreground">
                            Đầu ra: <span className="font-medium text-foreground">{item.ket_qua_mong_muon || item.dau_ra_cam_ket}</span>
                          </div>
                        )}

                        {/* Dòng 4: Kết quả đã cập nhật */}
                        {kqMoi && (
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 flex items-start gap-1.5">
                            <CornerDownRight className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Kết quả: </span>
                              <span>{kqMoi}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cụm nút thao tác 1 chạm */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => onCheckIn1Cham(item)}
                        className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Check-in
                      </button>

                      {laSuaDuoc && (
                        <>
                          <button
                            type="button"
                            onClick={() => onLenNongCongViec(item, ngayChon, 'gap_mat')}
                            className="h-8 px-2 rounded-lg border border-border bg-background hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-semibold text-muted-foreground transition-colors cursor-pointer"
                            title="Chuyển sang Lịch công tác (Gặp mặt)"
                          >
                            <Users className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSuaCongViec(item)}
                            className="h-8 px-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Sửa công việc"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onXoaCongViec(item.id)}
                            className="h-8 px-2 rounded-lg border border-border bg-background hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (5/12): LỊCH CÔNG TÁC HÔM NAY & RỔ VIỆC CHỜ */}
        <div className="lg:col-span-5 space-y-5">
          {/* KHỐI 1: LỊCH CÔNG TÁC TRONG NGÀY (GẶP MẶT / KHẢO SÁT) */}
          <div className="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <Users className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground">
                    Lịch Công Tác ({Math.max(dsViecGapMatNgay.length, dsLichHenHomNay.length)})
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Lịch hẹn gặp mặt, khảo sát thực tế
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {laSuaDuoc && (
                  <Nut
                    kieu="outline"
                    kich_thuoc="xs"
                    onClick={() => onThemCongViec({ ngay: ngayChon, hinhThuc: 'gap_mat' })}
                  >
                    <Plus className="size-3.5" /> Thêm lịch
                  </Nut>
                )}
                <Link
                  href="/lich-cong-tac"
                  className="h-7 px-2.5 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-bold text-foreground inline-flex items-center gap-1"
                >
                  Mở Lịch <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </div>

            {dsViecGapMatNgay.length === 0 && dsLichHenHomNay.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Không có lịch hẹn gặp mặt trong ngày này.
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {dsViecGapMatNgay.map((item) => {
                  const lichKhop = dsLichHenHomNay.find(
                    (l) =>
                      (item.du_an_id && l.du_an_id === item.du_an_id) ||
                      (item.khach_hang_id && l.khach_hang_id === item.khach_hang_id) ||
                      l.ten_khach_hang?.toLowerCase() ===
                        (item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '').toLowerCase()
                  );
                  const khungGio = lichKhop
                    ? `${lichKhop.gio_bat_dau || '08:30'} - ${lichKhop.gio_ket_thuc || '10:00'}`
                    : 'Trong ngày';
                  const kqMoi = layKetQuaMoiNhat(item);

                  return (
                    <div key={item.id} className="p-3.5 hover:bg-muted/20 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-800 text-[11px] font-mono font-bold">
                              <Clock className="size-3" /> {khungGio}
                            </span>
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-foreground">
                            {item.hanh_dong_tuan || item.noi_dung_tuan}
                          </div>
                          {(item.xa_phuong || lichKhop?.dia_diem) && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="size-3 shrink-0" />
                              <span>{lichKhop?.dia_diem || item.xa_phuong}</span>
                            </div>
                          )}
                          {kqMoi && (
                            <div className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                              ✓ Kết quả: {kqMoi}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onCheckIn1Cham(item)}
                          className="h-7.5 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="size-3" />
                          Check-in
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KHỐI 2: RỔ VIỆC CHỜ TRONG TUẦN ("LÊN NÒNG" ĐIỀU PHỐI MỖI SÁNG) */}
          <div className="bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                  <Inbox className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground">
                    Rổ Việc Chờ Tuần ({dsRoViecCho.length})
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Rút việc từ Kế hoạch Tuần xuống ngày đang chọn
                  </p>
                </div>
              </div>
            </div>

            {dsRoViecCho.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Tất cả đầu việc trong tuần đã được phân bổ hoặc hoàn thành.
              </div>
            ) : (
              <div className="divide-y divide-border/70 max-h-[420px] overflow-y-auto">
                {dsRoViecCho.map((item) => {
                  const tonDong = Boolean(item.ngay_du_kien && item.ngay_du_kien < ngayChon);
                  return (
                    <div key={item.id} className="p-3.5 hover:bg-muted/25 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tonDong ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 text-[10px] font-bold">
                                Tồn từ {new Date(item.ngay_du_kien!).toLocaleDateString('vi-VN')}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 text-[10px] font-bold">
                                Chưa xếp ngày
                              </span>
                            )}
                            <span className="text-xs font-bold text-foreground">
                              {item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}
                            </span>
                          </div>
                          <div className="text-xs text-foreground font-medium">
                            {item.hanh_dong_tuan || item.noi_dung_tuan}
                          </div>
                        </div>
                      </div>

                      {laSuaDuoc && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onLenNongCongViec(item, ngayChon, 'goi_dien')}
                            className="flex-1 h-7.5 px-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 border border-sky-500/20 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <PhoneCall className="size-3" /> + Việc VP hôm nay
                          </button>
                          <button
                            type="button"
                            onClick={() => onLenNongCongViec(item, ngayChon, 'gap_mat')}
                            className="flex-1 h-7.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-500/20 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Users className="size-3" /> + Lịch gặp hôm nay
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Drill-down khi nhấp vào bất kỳ thẻ số liệu tổng hợp nào */}
      <Ban_Ve
        mo={Boolean(loaiDrillDown)}
        onDong={() => setLoaiDrillDown(null)}
        tieu_de={
          loaiDrillDown === 'tong_viec'
            ? `Chi tiết Tổng việc ngày ${new Date(ngayChon).toLocaleDateString('vi-VN')}`
            : loaiDrillDown === 'van_phong'
            ? `Chi tiết Bảng việc văn phòng ngày ${new Date(ngayChon).toLocaleDateString('vi-VN')}`
            : loaiDrillDown === 'lich_cong_tac'
            ? `Chi tiết Lịch công tác ngày ${new Date(ngayChon).toLocaleDateString('vi-VN')}`
            : `Chi tiết Đã tương tác / Báo cáo ngày ${new Date(ngayChon).toLocaleDateString('vi-VN')}`
        }
        kich_thuoc="lg"
      >
        <div className="space-y-3 pb-4">
          {(loaiDrillDown === 'tong_viec'
            ? dsTongViecNgay
            : loaiDrillDown === 'van_phong'
            ? dsViecVanPhongNgay
            : loaiDrillDown === 'lich_cong_tac'
            ? dsViecGapMatNgay
            : dsDaXuLyTrongNgay
          ).map((item) => {
            const kq = layKetQuaMoiNhat(item);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-border bg-card flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold',
                        item.hinh_thuc === 'gap_mat'
                          ? 'bg-emerald-500/15 text-emerald-800'
                          : 'bg-sky-500/15 text-sky-800'
                      )}
                    >
                      {item.hinh_thuc === 'gap_mat' ? 'Lịch công tác' : 'Việc văn phòng'}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {item.hanh_dong_tuan || item.noi_dung_tuan}
                  </div>
                  {kq && (
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Kết quả: {kq}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoaiDrillDown(null);
                    onCheckIn1Cham(item);
                  }}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0 cursor-pointer"
                >
                  Check-in
                </button>
              </div>
            );
          })}
        </div>
      </Ban_Ve>
    </div>
  );
}
