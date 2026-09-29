'use client';

import { useMemo, useState } from 'react';
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Search,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Target,
  X,
  ListTodo,
  UserCheck
} from 'lucide-react';
import type { KeHoachTuan, ItemKeHoachTuan, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { Nut } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  danhSachNhanSu: NhanSu[];
  danhSachKeHoach: KeHoachTuan[];
  danhSachBaoCao: BaoCaoKeHoachTuan[];
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  tuan: string;
  onXemChiTietNV?: (nhanVienId: string) => void;
}

const formatNgay = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${thu}, ${dd}/${mm}`;
  } catch {
    return dateStr;
  }
};

const renderBadgeLoai = (loai?: LoaiMucTieuThang) => {
  switch (loai) {
    case 'tai_chinh':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <DollarSign className="size-3" /> Thu tiền
        </span>
      );
    case 'khach_hang':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
          <Users className="size-3" /> Khách hàng
        </span>
      );
    case 'khac':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-700 border border-slate-500/20">
          <Target className="size-3" /> Khác
        </span>
      );
    case 'thi_truong':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
          <MapPin className="size-3" /> Thị trường
        </span>
      );
  }
};

export default function BangTongQuanTeamTuan({
  danhSachNhanSu,
  danhSachKeHoach,
  danhSachBaoCao,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  tuan,
  onXemChiTietNV
}: Props) {
  const [cheDoXem, setCheDoXem] = useState<'ke_hoach_gom' | 'theo_nhan_su'>('ke_hoach_gom');
  const [locNhanSuId, setLocNhanSuId] = useState<string>('tat_ca');
  const [locTrangThai, setLocTrangThai] = useState<'tat_ca' | 'hoan_thanh' | 'dang_lam'>('tat_ca');
  const [locLoaiViec, setLocLoaiViec] = useState<string>('tat_ca');
  const [tuKhoa, setTuKhoa] = useState<string>('');

  const mapNhanSu = useMemo(() => new Map(danhSachNhanSu.map((ns) => [ns.id, ns])), [danhSachNhanSu]);
  const mapDuAn = useMemo(() => new Map(danhSachDuAn.map((da) => [da.id, da])), [danhSachDuAn]);
  const mapKhachHang = useMemo(() => new Map(danhSachKhachHang.map((kh) => [kh.id, kh])), [danhSachKhachHang]);
  const mapKeHoach = useMemo(() => new Map(danhSachKeHoach.map((kh) => [kh.nhan_vien_id, kh])), [danhSachKeHoach]);
  const mapBaoCao = useMemo(() => new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc])), [danhSachBaoCao]);

  // Thống kê toàn đội
  const tongSoNV = danhSachNhanSu.length;
  let tongSoViecTeam = 0;
  let tongSoXongTeam = 0;
  let soNVNopBaoCao = 0;
  let soNVLapKeHoach = 0;

  const dataBang = danhSachNhanSu.map((ns) => {
    const kh = mapKeHoach.get(ns.id);
    const bc = mapBaoCao.get(ns.id);

    const dsViec = kh?.danh_sach_tac_chien ?? [];
    const coKeHoach = dsViec.length > 0;
    if (coKeHoach) soNVLapKeHoach++;

    const soXong = dsViec.filter((x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay').length;
    const tyLe = dsViec.length > 0 ? Math.round((soXong / dsViec.length) * 100) : 0;

    tongSoViecTeam += dsViec.length;
    tongSoXongTeam += soXong;

    const daGuiBC = bc?.trang_thai === 'da_gui';
    if (daGuiBC) soNVNopBaoCao++;

    return {
      nhanSu: ns,
      keHoach: kh,
      baoCao: bc,
      coKeHoach,
      tongViec: dsViec.length,
      soXong,
      tyLe,
      daGuiBC
    };
  });

  const tyLeXongTeam = tongSoViecTeam > 0 ? Math.round((tongSoXongTeam / tongSoViecTeam) * 100) : 0;

  // Gom toàn bộ công việc của mọi người vào 1 danh sách
  const tatCaCongViec = useMemo(() => {
    const list: Array<{
      item: ItemKeHoachTuan;
      nhanSu: NhanSu;
      keHoachId: string;
      tenDuAn?: string;
      tenKhachHang?: string;
    }> = [];

    danhSachKeHoach.forEach((kh) => {
      const ns = mapNhanSu.get(kh.nhan_vien_id);
      if (!ns) return;

      (kh.danh_sach_tac_chien || []).forEach((item) => {
        const da = item.du_an_id ? mapDuAn.get(item.du_an_id) : undefined;
        const khItem = item.khach_hang_id ? mapKhachHang.get(item.khach_hang_id) : undefined;

        list.push({
          item,
          nhanSu: ns,
          keHoachId: kh.id,
          tenDuAn: da?.ten_du_an,
          tenKhachHang: khItem?.ten_khach_hang
        });
      });
    });

    return list;
  }, [danhSachKeHoach, mapNhanSu, mapDuAn, mapKhachHang]);

  // Lọc danh sách công việc đã gom
  const danhSachCongViecLoc = useMemo(() => {
    return tatCaCongViec.filter(({ item, nhanSu, tenDuAn, tenKhachHang }) => {
      if (locNhanSuId !== 'tat_ca' && nhanSu.id !== locNhanSuId) return false;

      const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
      if (locTrangThai === 'hoan_thanh' && !daXong) return false;
      if (locTrangThai === 'dang_lam' && daXong) return false;

      if (locLoaiViec !== 'tat_ca' && (item.loai_cong_viec || 'thi_truong') !== locLoaiViec) return false;

      if (tuKhoa.trim()) {
        const kw = tuKhoa.toLowerCase();
        const text = [
          nhanSu.ho_va_ten,
          nhanSu.ma_nhan_vien,
          item.ten_khach_hang_du_an,
          item.noi_dung_tuan,
          item.hanh_dong_tuan,
          item.tinh_thanh,
          item.xa_phuong,
          item.co_quan_doanh_nghiep,
          item.nguoi_lien_he,
          item.dau_ra_cam_ket,
          item.ket_qua_mong_muon,
          tenDuAn,
          tenKhachHang
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!text.includes(kw)) return false;
      }

      return true;
    });
  }, [tatCaCongViec, locNhanSuId, locTrangThai, locLoaiViec, tuKhoa]);

  const xuLyInTongHop = () => {
    window.print();
  };

  const xuLyChonNhanSuTuBang = (nsId: string) => {
    setLocNhanSuId(nsId);
    setCheDoXem('ke_hoach_gom');
  };

  return (
    <div className="space-y-5">
      {/* Tiêu đề & Thao tác in */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Kế hoạch tác chiến tuần chung
          </h2>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Tổng hợp kế hoạch hành động và tiến độ của toàn bộ đội ngũ kinh doanh ({tuan})
          </span>
        </div>
        <Nut kieu="outline" icon_trai={Printer} onClick={xuLyInTongHop} className="print:hidden">
          In / Xuất PDF
        </Nut>
      </div>

      {/* 4 Thẻ KPI tóm tắt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Nhân sự có KH
          </span>
          <span className="text-2xl font-black text-foreground mt-1 block">
            {soNVLapKeHoach} / {tongSoNV}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {tongSoNV > 0 ? Math.round((soNVLapKeHoach / tongSoNV) * 100) : 0}% thành viên
          </span>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
            Tổng việc toàn team
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-300 mt-1 block">
            {tongSoViecTeam}
          </span>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-1 block font-mono">
            TB {(tongSoViecTeam / (soNVLapKeHoach || 1)).toFixed(1)} việc / nhân sự
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Tỷ lệ hoàn thành
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1 block">
            {tongSoXongTeam}/{tongSoViecTeam} ({tyLeXongTeam}%)
          </span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 block">
            Tiến độ chung toàn đội
          </span>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
            Đã nộp báo cáo
          </span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-300 mt-1 block">
            {soNVNopBaoCao} / {soNVLapKeHoach || tongSoNV}
          </span>
          <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-1 block">
            Báo cáo tổng kết tuần
          </span>
        </div>
      </div>

      {/* Chuyển đổi chế độ xem: Kế hoạch đã gom vs Tổng hợp theo nhân sự */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCheDoXem('ke_hoach_gom')}
            className={cn(
              'h-8 px-3.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5',
              cheDoXem === 'ke_hoach_gom'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListTodo className="size-3.5" />
            Tất cả kế hoạch đã gom ({tatCaCongViec.length})
          </button>
          <button
            type="button"
            onClick={() => setCheDoXem('theo_nhan_su')}
            className={cn(
              'h-8 px-3.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5',
              cheDoXem === 'theo_nhan_su'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <UserCheck className="size-3.5" />
            Tổng hợp theo thành viên ({danhSachNhanSu.length})
          </button>
        </div>

        {cheDoXem === 'ke_hoach_gom' && locNhanSuId !== 'tat_ca' && (
          <div className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-semibold">
            <span>Đang lọc: {mapNhanSu.get(locNhanSuId)?.ho_va_ten}</span>
            <button
              type="button"
              onClick={() => setLocNhanSuId('tat_ca')}
              className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
              title="Xem tất cả"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* CHẾ ĐỘ 1: TẤT CẢ KẾ HOẠCH ĐÃ GOM */}
      {cheDoXem === 'ke_hoach_gom' && (
        <div className="space-y-3">
          {/* Thanh công cụ lọc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-card p-3 rounded-xl border border-border/80 shadow-xs print:hidden">
            {/* Lọc nhân sự */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nhân sự
              </label>
              <select
                value={locNhanSuId}
                onChange={(e) => setLocNhanSuId(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="tat_ca">Tất cả nhân sự ({danhSachNhanSu.length})</option>
                {danhSachNhanSu.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} ({ns.ma_nhan_vien})
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc trạng thái */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Trạng thái
              </label>
              <select
                value={locTrangThai}
                onChange={(e) => setLocTrangThai(e.target.value as any)}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="tat_ca">Tất cả trạng thái</option>
                <option value="hoan_thanh">Đã hoàn thành</option>
                <option value="dang_lam">Đang thực hiện</option>
              </select>
            </div>

            {/* Lọc nhóm việc */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nhóm việc
              </label>
              <select
                value={locLoaiViec}
                onChange={(e) => setLocLoaiViec(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="tat_ca">Tất cả nhóm</option>
                <option value="thi_truong">Thị trường</option>
                <option value="tai_chinh">Thu tiền</option>
                <option value="khach_hang">Khách hàng</option>
                <option value="khac">Khác</option>
              </select>
            </div>

            {/* Tìm kiếm */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  placeholder="Tìm việc, khách hàng, địa bàn..."
                  className="w-full h-8 rounded-lg border border-border bg-background pl-8 pr-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Bảng danh sách công việc gom lại */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                Danh sách kế hoạch toàn đội ({danhSachCongViecLoc.length} việc)
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{tuan}</span>
            </div>

            {danhSachCongViecLoc.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-xs space-y-1">
                <p className="font-semibold text-foreground">Không tìm thấy công việc nào phù hợp.</p>
                <p>Thử điều chỉnh bộ lọc hoặc chọn tuần khác.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">STT</th>
                      <th className="py-3 px-3 min-w-[160px]">Phụ trách</th>
                      <th className="py-3 px-3 min-w-[200px]">Việc cần làm / Hành động</th>
                      <th className="py-3 px-3 min-w-[180px]">Mục tiêu / Địa bàn / Dự án</th>
                      <th className="py-3 px-3 min-w-[110px] text-center">Ngày dự kiến</th>
                      <th className="py-3 px-3 min-w-[160px]">Đầu ra cam kết</th>
                      <th className="py-3 px-3 min-w-[120px]">Hỗ trợ</th>
                      <th className="py-3 px-3 min-w-[160px]">Kết quả thực tế</th>
                      <th className="py-3 px-3 min-w-[120px] text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {danhSachCongViecLoc.map(({ item, nhanSu, tenDuAn, tenKhachHang }, idx) => {
                      const daHoanThanh = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                      const diaBanStr = [item.xa_phuong, item.tinh_thanh].filter(Boolean).join(', ');
                      const viecCanLam = item.noi_dung_tuan || item.hanh_dong_tuan || item.ten_khach_hang_du_an;
                      const dauRa = item.dau_ra_cam_ket || item.ket_qua_mong_muon;
                      const hoTro = (item.can_ho_tro || item.nguoi_ho_tro || '').trim();

                      return (
                        <tr key={`${item.id || idx}_${nhanSu.id}`} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                            {idx + 1}
                          </td>

                          {/* Phụ trách */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-foreground">{nhanSu.ho_va_ten}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {nhanSu.ma_nhan_vien} {nhanSu.chuc_vu ? `• ${nhanSu.chuc_vu}` : ''}
                            </div>
                          </td>

                          {/* Việc cần làm */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-foreground leading-snug">{viecCanLam}</div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              {renderBadgeLoai(item.loai_cong_viec)}
                              {item.loai_hanh_dong === 'phat_sinh' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700">
                                  Phát sinh
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Mục tiêu / Địa bàn / Khách hàng / Dự án */}
                          <td className="py-3 px-3 text-muted-foreground">
                            <div className="font-medium text-foreground">
                              {tenDuAn || tenKhachHang || item.ten_khach_hang_du_an}
                            </div>
                            {item.co_quan_doanh_nghiep && (
                              <div className="text-[11px] text-foreground/80 mt-0.5">
                                {item.co_quan_doanh_nghiep}
                              </div>
                            )}
                            {diaBanStr && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                📍 {diaBanStr}
                              </div>
                            )}
                            {item.nguoi_lien_he && (
                              <div className="text-[10px] text-muted-foreground">
                                👤 {item.nguoi_lien_he}
                              </div>
                            )}
                          </td>

                          {/* Ngày dự kiến */}
                          <td className="py-3 px-3 text-center font-mono text-[11px] font-semibold text-foreground">
                            {formatNgay(item.ngay_du_kien)}
                          </td>

                          {/* Đầu ra cam kết */}
                          <td className="py-3 px-3 text-muted-foreground text-[11px]">
                            {dauRa ? (
                              <span className="font-medium text-foreground">{dauRa}</span>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Hỗ trợ */}
                          <td className="py-3 px-3 text-muted-foreground text-[11px]">
                            {hoTro ? (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium inline-block">
                                🤝 {hoTro}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          {/* Kết quả thực tế */}
                          <td className="py-3 px-3 text-[11px]">
                            {item.ket_qua_thuc_te ? (
                              <div className="line-clamp-2 text-foreground font-medium">
                                {item.ket_qua_thuc_te}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-3 text-center">
                            {daHoanThanh ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 border border-emerald-500/30">
                                <Check className="size-3" /> Đã xong
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 border border-amber-500/30">
                                <Clock className="size-3" /> Đang làm
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 2: BẢNG THEO DÕI THÀNH VIÊN */}
      {cheDoXem === 'theo_nhan_su' && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
            <span className="font-bold text-xs text-foreground uppercase tracking-wider">
              Bảng theo dõi thành viên ({dataBang.length})
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Tuần: {tuan}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[180px]">Thành viên</th>
                  <th className="py-3 px-3 min-w-[110px] text-center">Kế hoạch</th>
                  <th className="py-3 px-3 min-w-[110px] text-center">Số việc</th>
                  <th className="py-3 px-3 min-w-[140px]">Tiến độ tuần</th>
                  <th className="py-3 px-3 min-w-[130px] text-center">Báo cáo tuần</th>
                  <th className="py-3 px-3 min-w-[170px]">Khó khăn / Đề xuất</th>
                  <th className="py-3 px-3 w-28 text-center print:hidden">Kế hoạch chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dataBang.map((item, idx) => {
                  return (
                    <tr key={item.nhanSu.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">{item.nhanSu.ho_va_ten}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {item.nhanSu.ma_nhan_vien} {item.nhanSu.chuc_vu ? `• ${item.nhanSu.chuc_vu}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.coKeHoach ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            Đã lập KH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                            Chưa lập
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                        {item.tongViec > 0 ? (
                          <span>
                            {item.soXong} / {item.tongViec}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {item.tongViec > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-foreground">{item.tyLe}%</span>
                              {item.tyLe === 100 && (
                                <span className="text-[10px] text-emerald-600 font-bold">Xong hết</span>
                              )}
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  item.tyLe === 100
                                    ? 'bg-emerald-500'
                                    : item.tyLe >= 50
                                    ? 'bg-primary'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.tyLe}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.daGuiBC ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Đã nộp
                          </span>
                        ) : item.baoCao?.trang_thai === 'nhap' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Đang nháp
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1">
                            <AlertCircle className="size-3" /> Chưa nộp
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {item.baoCao?.kho_khan ? (
                          <div className="line-clamp-2 text-foreground font-medium">
                            ⚠️ {item.baoCao.kho_khan}
                          </div>
                        ) : item.baoCao?.de_xuat ? (
                          <div className="line-clamp-2 text-primary">
                            💡 {item.baoCao.de_xuat}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => xuLyChonNhanSuTuBang(item.nhanSu.id)}
                          className="h-7 px-2.5 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center gap-1 mx-auto text-[11px] font-bold transition-colors cursor-pointer"
                          title="Lọc xem toàn bộ công việc của nhân sự này"
                        >
                          <Eye className="size-3" /> Xem việc ({item.tongViec})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
