'use client';

import { useMemo, useState } from 'react';
import {
  Printer,
  FileSpreadsheet,
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
  UserCheck,
  XCircle
} from 'lucide-react';
import type { KeHoachTuan, ItemKeHoachTuan, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { xuatExcelDieuHanhTeamTuan } from '../../dich_vu/ke_hoach/dich_vu_xuat_excel_ke_hoach';
import { Nut, ThanhSoLieu } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  danhSachNhanSu: NhanSu[];
  danhSachKeHoach: KeHoachTuan[];
  danhSachBaoCao: BaoCaoKeHoachTuan[];
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  tuan: string;
  onXemChiTietNV?: (nhanVienId: string) => void;
  onChonCongViec?: (nhanVienId: string, item: ItemKeHoachTuan) => void;
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

const layDoiTuongKhongTrungLap = (
  viecCanLam: string,
  tenDoiTuong?: string | null,
  coQuan?: string | null,
  diaBanStr?: string | null,
  nguoiLienHe?: string | null
) => {
  const norm = (s?: string | null) =>
    (s || '')
      .trim()
      .toLowerCase()
      .replace(/^(ubnd|xã|phường|thị trấn|sở|ban|phòng|tỉnh|huyện)\s+/gi, '')
      .replace(/\s+/g, ' ');

  const nViec = norm(viecCanLam);

  // Chỉ lấy tên đối tượng nếu không trùng với việc cần làm
  const nDoiTuong = norm(tenDoiTuong);
  const coDoiTuong = Boolean(
    tenDoiTuong &&
      tenDoiTuong.trim() &&
      nDoiTuong !== nViec &&
      !nViec.includes(nDoiTuong)
  );

  // Cơ quan (nếu có và không trùng với đối tượng, việc cần làm)
  const nCoQuan = norm(coQuan);
  const coCoQuan = Boolean(
    coQuan &&
      coQuan.trim() &&
      nCoQuan !== nViec &&
      nCoQuan !== nDoiTuong &&
      !nViec.includes(nCoQuan)
  );

  // Địa bàn (nếu có và không trùng với đối tượng, cơ quan, việc cần làm)
  const nDiaBan = norm(diaBanStr);
  const coDiaBan = Boolean(
    diaBanStr &&
      diaBanStr.trim() &&
      nDiaBan !== nViec &&
      nDiaBan !== nDoiTuong &&
      nDiaBan !== nCoQuan &&
      !nViec.includes(nDiaBan)
  );

  return {
    tenDoiTuong: coDoiTuong ? tenDoiTuong : null,
    coQuan: coCoQuan ? coQuan : null,
    diaBan: coDiaBan ? diaBanStr : null,
    nguoiLienHe: (nguoiLienHe || '').trim() || null,
  };
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
  onXemChiTietNV,
  onChonCongViec
}: Props) {
  const [cheDoXem, setCheDoXem] = useState<'ke_hoach_gom' | 'theo_nhan_su'>('ke_hoach_gom');
  const [locNhanSuId, setLocNhanSuId] = useState<string>('tat_ca');
  const [locTrangThai, setLocTrangThai] = useState<
    'tat_ca' | 'dat_muc_tieu' | 'do_dang' | 'khong_dat' | 'dang_lam'
  >('tat_ca');
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

    const daGuiBC = Boolean(bc?.trang_thai === 'da_gui' || coKeHoach);
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
      if (
        locTrangThai === 'dat_muc_tieu' &&
        !(item.trang_thai_ket_qua === 'dat_muc_tieu' || daXong)
      )
        return false;
      if (locTrangThai === 'do_dang' && item.trang_thai_ket_qua !== 'do_dang') return false;
      if (locTrangThai === 'khong_dat' && item.trang_thai_ket_qua !== 'khong_dat') return false;
      if (
        locTrangThai === 'dang_lam' &&
        (daXong ||
          item.trang_thai_ket_qua === 'dat_muc_tieu' ||
          item.trang_thai_ket_qua === 'do_dang' ||
          item.trang_thai_ket_qua === 'khong_dat')
      )
        return false;

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

  const xuLyXuatExcel = () => {
    void xuatExcelDieuHanhTeamTuan(
      tuan,
      danhSachNhanSu,
      danhSachKeHoach,
      danhSachBaoCao,
      danhSachDuAn,
      danhSachKhachHang
    );
  };

  const xuLyChonNhanSuTuBang = (nsId: string) => {
    setLocNhanSuId(nsId);
    setCheDoXem('ke_hoach_gom');
  };

  return (
    <div className="space-y-4">
      <ThanhSoLieu
        items={[
          {
            id: 'nhan_su_kh',
            nhan: 'Nhân sự lập KH',
            nhan_ngan: 'Lập KH',
            so_lieu: `${soNVLapKeHoach}/${tongSoNV}`,
            icon: Users,
            mau_so: 'trang',
          },
          {
            id: 'tong_viec',
            nhan: 'Tổng việc toàn đội',
            nhan_ngan: 'Tổng việc',
            so_lieu: tongSoViecTeam,
            icon: ListTodo,
            mau_so: 'xanh_duong',
          },
          {
            id: 'hoan_thanh',
            nhan: `Hoàn thành (${tyLeXongTeam}%)`,
            nhan_ngan: 'Hoàn thành',
            so_lieu: `${tongSoXongTeam}/${tongSoViecTeam}`,
            icon: CheckCircle2,
            mau_so: 'xanh_la',
          },
          {
            id: 'da_nop_bc',
            nhan: 'Đã nộp báo cáo',
            nhan_ngan: 'Đã nộp BC',
            so_lieu: `${soNVNopBaoCao}/${soNVLapKeHoach || tongSoNV}`,
            icon: UserCheck,
            mau_so: 'vang',
          },
        ]}
      />

      {/* Chuyển đổi chế độ xem & In PDF & Xuất Excel */}
      <div className="flex items-center justify-between gap-2.5 border-b border-border pb-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCheDoXem('ke_hoach_gom')}
            className={cn(
              'h-8 px-3 rounded-lg text-phu font-bold transition-all inline-flex items-center gap-1.5',
              cheDoXem === 'ke_hoach_gom'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListTodo className="size-3.5" />
            <span>Kế hoạch đã gom ({tatCaCongViec.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCheDoXem('theo_nhan_su')}
            className={cn(
              'h-8 px-3 rounded-lg text-phu font-bold transition-all inline-flex items-center gap-1.5',
              cheDoXem === 'theo_nhan_su'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <UserCheck className="size-3.5" />
            <span>Theo thành viên ({danhSachNhanSu.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Nut kieu="outline" kich_thuoc="sm" icon_trai={FileSpreadsheet} onClick={xuLyXuatExcel}>
            Xuất Excel
          </Nut>
          <Nut kieu="outline" kich_thuoc="sm" icon_trai={Printer} onClick={xuLyInTongHop}>
            In / Xuất PDF
          </Nut>
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
                <option value="dat_muc_tieu">Đạt mục tiêu</option>
                <option value="do_dang">Dở dang</option>
                <option value="khong_dat">Không đạt</option>
                <option value="dang_lam">Đang triển khai</option>
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
                      <th className="py-3 px-3 w-12 text-center">STT</th>
                      <th className="py-3 px-3 w-44">Phụ trách</th>
                      <th className="py-3 px-3 min-w-[280px]">Nội dung công việc & Đối tượng</th>
                      <th className="py-3 px-3 w-28 text-center">Thời gian</th>
                      <th className="py-3 px-3 min-w-[260px]">Mục tiêu cam kết & Tiến độ thực tế</th>
                      <th className="py-3 px-3 w-28 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {danhSachCongViecLoc.map(({ item, nhanSu, tenDuAn, tenKhachHang }, idx) => {
                      const daHoanThanh = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                      const diaBanStr = [item.xa_phuong, item.tinh_thanh].filter(Boolean).join(', ');
                      const viecCanLam = item.noi_dung_tuan || item.hanh_dong_tuan || item.ten_khach_hang_du_an;
                      const dauRa = item.dau_ra_cam_ket || item.ket_qua_mong_muon;
                      const hoTro = (item.can_ho_tro || item.nguoi_ho_tro || '').trim();
                      const dsKetQua = item.danh_sach_ket_qua ?? [];
                      const coChiDao = dsKetQua.some((k) => Boolean(k.chi_dao?.noi_dung));

                      const thongTinDoiTuong = layDoiTuongKhongTrungLap(
                        viecCanLam,
                        tenDuAn || tenKhachHang || item.ten_khach_hang_du_an,
                        item.co_quan_doanh_nghiep,
                        diaBanStr,
                        item.nguoi_lien_he
                      );

                      return (
                        <tr
                          key={`${item.id || idx}_${nhanSu.id}`}
                          onClick={() => onChonCongViec?.(nhanSu.id, item)}
                          className={cn(
                            'hover:bg-muted/30 transition-colors',
                            onChonCongViec && 'cursor-pointer'
                          )}
                          title="Nhấp để xem lịch sử tiến độ & ghi ý kiến đồng hành hỗ trợ"
                        >
                          {/* 1. STT */}
                          <td className="py-3.5 px-3 text-center font-bold text-muted-foreground tabular-nums">
                            {idx + 1}
                          </td>

                          {/* 2. Phụ trách */}
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-foreground leading-snug">{nhanSu.ho_va_ten}</div>
                            <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {nhanSu.ma_nhan_vien} {nhanSu.chuc_vu ? `• ${nhanSu.chuc_vu}` : ''}
                            </div>
                          </td>

                          {/* 3. Nội dung công việc & Đối tượng (Gộp, chống lặp tên) */}
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-foreground leading-snug text-sm">{viecCanLam}</div>

                            {/* Đối tượng phụ trợ (Chỉ hiện nếu có và không bị lặp từ việc cần làm) */}
                            {(thongTinDoiTuong.tenDoiTuong || thongTinDoiTuong.coQuan || thongTinDoiTuong.diaBan || thongTinDoiTuong.nguoiLienHe) && (
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex-wrap">
                                {thongTinDoiTuong.tenDoiTuong && (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-200">
                                    🏛️ {thongTinDoiTuong.tenDoiTuong}
                                  </span>
                                )}
                                {thongTinDoiTuong.coQuan && (
                                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    🏢 {thongTinDoiTuong.coQuan}
                                  </span>
                                )}
                                {thongTinDoiTuong.diaBan && (
                                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    📍 {thongTinDoiTuong.diaBan}
                                  </span>
                                )}
                                {thongTinDoiTuong.nguoiLienHe && (
                                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    👤 {thongTinDoiTuong.nguoiLienHe}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Badges loại việc, phát sinh, và hỗ trợ */}
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              {renderBadgeLoai(item.loai_cong_viec)}
                              {item.loai_hanh_dong === 'phat_sinh' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                  Phát sinh
                                </span>
                              )}
                              {hoTro && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                  🤝 Cần hỗ trợ: {hoTro}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 4. Thời gian */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 font-mono text-[11px] font-semibold text-slate-800">
                              {formatNgay(item.ngay_du_kien)}
                            </span>
                          </td>

                          {/* 5. Mục tiêu cam kết & Tiến độ thực tế (Gộp) */}
                          <td className="py-3.5 px-3 space-y-1.5">
                            {/* Mục tiêu / Đầu ra cam kết */}
                            {dauRa ? (
                              <div className="text-xs text-foreground font-medium flex items-start gap-1.5 leading-snug">
                                <span className="text-sky-600 dark:text-sky-400 font-bold shrink-0">🎯</span>
                                <span>{dauRa}</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground italic">Chưa đặt cam kết đầu ra</div>
                            )}

                            {/* Kết quả thực tế / Tiến độ */}
                            {item.ket_qua_thuc_te ? (
                              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-medium leading-relaxed">
                                ✓ {item.ket_qua_thuc_te}
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <span>⏳</span>
                                <span>Đang triển khai</span>
                              </div>
                            )}

                            {coChiDao && (
                              <div className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium inline-block">
                                💬 Đã có ý kiến định hướng
                              </div>
                            )}
                          </td>

                          {/* 6. Trạng thái */}
                          <td className="py-3.5 px-3 text-center">
                            {item.trang_thai_ket_qua === 'dat_muc_tieu' || daHoanThanh ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 border border-emerald-500/30">
                                <Check className="size-3" /> Đạt MT
                              </span>
                            ) : item.trang_thai_ket_qua === 'do_dang' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1 border border-amber-500/30">
                                <Clock className="size-3" /> Dở dang
                              </span>
                            ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1 border border-rose-500/30">
                                <XCircle className="size-3" /> Không đạt
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 inline-flex items-center gap-1 border border-slate-200">
                                <Clock className="size-3 text-slate-400" /> Đang làm
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
