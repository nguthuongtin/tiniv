'use client';

import { useMemo, useState } from 'react';
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Search,
  DollarSign,
  MapPin,
  Target,
  X,
  ListOrdered,
  UserCheck
} from 'lucide-react';
import type { KeHoachThang, ItemKeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { Nut, ThanhSoLieu } from '../ui';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  danhSachNhanSu: NhanSu[];
  danhSachKeHoach: KeHoachThang[];
  danhSachBaoCao: BaoCaoKeHoachThang[];
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  thang: string;
  onXemChiTietNV?: (nhanVienId: string) => void;
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

export default function BangTongQuanTeamThang({
  danhSachNhanSu,
  danhSachKeHoach,
  danhSachBaoCao,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  thang,
  onXemChiTietNV
}: Props) {
  const [cheDoXem, setCheDoXem] = useState<'ke_hoach_gom' | 'theo_nhan_su'>('ke_hoach_gom');
  const [locNhanSuId, setLocNhanSuId] = useState<string>('tat_ca');
  const [locLoaiMucTieu, setLocLoaiMucTieu] = useState<string>('tat_ca');
  const [tuKhoa, setTuKhoa] = useState<string>('');

  const mapNhanSu = useMemo(() => new Map(danhSachNhanSu.map((ns) => [ns.id, ns])), [danhSachNhanSu]);
  const mapDuAn = useMemo(() => new Map(danhSachDuAn.map((da) => [da.id, da])), [danhSachDuAn]);
  const mapKhachHang = useMemo(() => new Map(danhSachKhachHang.map((kh) => [kh.id, kh])), [danhSachKhachHang]);
  const mapKeHoach = useMemo(() => new Map(danhSachKeHoach.map((kh) => [kh.nhan_vien_id, kh])), [danhSachKeHoach]);
  const mapBaoCao = useMemo(() => new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc])), [danhSachBaoCao]);

  const tongSoNV = danhSachNhanSu.length;
  let tongGiaTriHdTeam = 0;
  let tongDuKienThuTeam = 0;
  let tongThucTeThuTeam = 0;
  let soNVLapKeHoach = 0;
  let soNVNopBaoCao = 0;

  const dataBang = danhSachNhanSu.map((ns) => {
    const kh = mapKeHoach.get(ns.id);
    const bc = mapBaoCao.get(ns.id);

    const dsDiaBan = kh?.danh_sach_dia_ban ?? [];
    const coKeHoach = dsDiaBan.length > 0;
    if (coKeHoach) soNVLapKeHoach++;

    // Tính toán tài chính
    const dsTaiChinh = dsDiaBan.filter(
      (x) => x.loai_muc_tieu === 'tai_chinh' || (!x.loai_muc_tieu && (x.du_kien_thu_thang_nay || 0) > 0)
    );
    const tongHd = dsTaiChinh.reduce((acc, x) => acc + (x.gia_tri_hd || 0), 0);
    const duKien = dsTaiChinh.reduce((acc, x) => acc + (x.du_kien_thu_thang_nay || x.chi_tieu || 0), 0);
    const thucTe = dsTaiChinh.reduce((acc, x) => acc + (x.thuc_te_thu ?? x.ket_qua_thuc_te ?? 0), 0);
    const tyLeTien = duKien > 0 ? Math.round((thucTe / duKien) * 100) : 0;

    // Tính tỷ lệ hoàn thành KPI chung
    let tongDiemDat = 0;
    dsDiaBan.forEach((item) => {
      const isTC = item.loai_muc_tieu === 'tai_chinh' || (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
      const chiTieu = isTC ? (item.du_kien_thu_thang_nay || item.chi_tieu || 0) : (item.chi_tieu || 0);
      const tt = isTC ? (item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0) : (item.ket_qua_thuc_te || 0);
      const tyLe = chiTieu > 0 ? Math.round((tt / chiTieu) * 100) : 0;
      tongDiemDat += Math.min(100, tyLe);
    });
    const tyLeHoanThanhKPI = dsDiaBan.length > 0 ? Math.round(tongDiemDat / dsDiaBan.length) : 0;

    tongGiaTriHdTeam += tongHd;
    tongDuKienThuTeam += duKien;
    tongThucTeThuTeam += thucTe;

    const daGuiBC = bc?.trang_thai === 'da_gui';
    if (daGuiBC) soNVNopBaoCao++;

    return {
      nhanSu: ns,
      keHoach: kh,
      baoCao: bc,
      coKeHoach,
      soMucTieu: dsDiaBan.length,
      tongHd,
      duKien,
      thucTe,
      tyLeTien,
      tyLeHoanThanhKPI,
      daGuiBC
    };
  });

  const tyLeDatTeam = tongDuKienThuTeam > 0 ? Math.round((tongThucTeThuTeam / tongDuKienThuTeam) * 100) : 0;

  // Gom toàn bộ mục tiêu tháng của mọi người
  const tatCaMucTieu = useMemo(() => {
    const list: Array<{
      item: ItemKeHoachThang;
      nhanSu: NhanSu;
      keHoachId: string;
      tenDuAn?: string;
      tenKhachHang?: string;
    }> = [];

    danhSachKeHoach.forEach((kh) => {
      const ns = mapNhanSu.get(kh.nhan_vien_id);
      if (!ns) return;

      (kh.danh_sach_dia_ban || []).forEach((item) => {
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

  // Lọc mục tiêu gom
  const danhSachMucTieuLoc = useMemo(() => {
    return tatCaMucTieu.filter(({ item, nhanSu, tenDuAn, tenKhachHang }) => {
      if (locNhanSuId !== 'tat_ca' && nhanSu.id !== locNhanSuId) return false;

      const loai = item.loai_muc_tieu || (item.du_kien_thu_thang_nay ? 'tai_chinh' : 'thi_truong');
      if (locLoaiMucTieu !== 'tat_ca' && loai !== locLoaiMucTieu) return false;

      if (tuKhoa.trim()) {
        const kw = tuKhoa.toLowerCase();
        const text = [
          nhanSu.ho_va_ten,
          nhanSu.ma_nhan_vien,
          item.ten_khach_hang_du_an,
          (item as any).dia_ban,
          item.tinh_thanh,
          item.xa_phuong,
          item.co_quan_doanh_nghiep,
          item.nguoi_lien_he,
          item.muc_tieu_thang,
          item.ten_muc_tieu,
          item.ghi_chu,
          item.ghi_chu_ket_qua,
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
  }, [tatCaMucTieu, locNhanSuId, locLoaiMucTieu, tuKhoa]);

  const xuLyInTongHop = () => {
    window.print();
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
            id: 'chi_tieu_dt',
            nhan: 'Chỉ tiêu doanh thu',
            nhan_ngan: 'Chỉ tiêu',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongDuKienThuTeam),
            icon: DollarSign,
            mau_so: 'xanh_la',
          },
          {
            id: 'thuc_te_dt',
            nhan: `Thực tế thu (${tyLeDatTeam}%)`,
            nhan_ngan: 'Thực tế',
            so_lieu: DINH_DANG_TIEN_NGAN_GON(tongThucTeThuTeam),
            icon: CheckCircle2,
            mau_so: 'xanh_duong',
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

      {/* Chuyển đổi chế độ xem & In PDF */}
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
            <ListOrdered className="size-3.5" />
            <span>Mục tiêu đã gom ({tatCaMucTieu.length})</span>
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

        <Nut kieu="outline" kich_thuoc="sm" icon_trai={Printer} onClick={xuLyInTongHop} className="print:hidden">
          In / Xuất PDF
        </Nut>

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

      {/* CHẾ ĐỘ 1: TẤT CẢ MỤC TIÊU ĐÃ GOM */}
      {cheDoXem === 'ke_hoach_gom' && (
        <div className="space-y-3">
          {/* Thanh công cụ lọc */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-card p-3 rounded-xl border border-border/80 shadow-xs print:hidden">
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

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nhóm mục tiêu
              </label>
              <select
                value={locLoaiMucTieu}
                onChange={(e) => setLocLoaiMucTieu(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="tat_ca">Tất cả nhóm</option>
                <option value="tai_chinh">Thu tiền</option>
                <option value="thi_truong">Thị trường</option>
                <option value="khach_hang">Khách hàng</option>
                <option value="khac">Khác</option>
              </select>
            </div>

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
                  placeholder="Tìm mục tiêu, khách hàng, dự án, địa bàn..."
                  className="w-full h-8 rounded-lg border border-border bg-background pl-8 pr-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Bảng danh sách mục tiêu gom lại */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                Danh sách mục tiêu tháng toàn đội ({danhSachMucTieuLoc.length} mục tiêu)
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{thang}</span>
            </div>

            {danhSachMucTieuLoc.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-xs space-y-1">
                <p className="font-semibold text-foreground">Không tìm thấy mục tiêu nào phù hợp.</p>
                <p>Thử điều chỉnh bộ lọc hoặc chọn tháng khác.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">STT</th>
                      <th className="py-3 px-3 min-w-[160px]">Phụ trách</th>
                      <th className="py-3 px-3 min-w-[200px]">Mục tiêu / Dự án / Địa bàn</th>
                      <th className="py-3 px-3 min-w-[110px] text-center">Nhóm</th>
                      <th className="py-3 px-3 min-w-[140px] text-right">Chỉ tiêu / Kế hoạch</th>
                      <th className="py-3 px-3 min-w-[140px] text-right">Thực tế đạt được</th>
                      <th className="py-3 px-3 min-w-[100px] text-center">% Hoàn thành</th>
                      <th className="py-3 px-3 min-w-[180px]">Đánh giá / Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {danhSachMucTieuLoc.map(({ item, nhanSu, tenDuAn, tenKhachHang }, idx) => {
                      const isTC =
                        item.loai_muc_tieu === 'tai_chinh' ||
                        (!item.loai_muc_tieu && (item.du_kien_thu_thang_nay || 0) > 0);
                      const diaBanStr = [item.xa_phuong, item.tinh_thanh].filter(Boolean).join(', ');
                      const tenMucTieu =
                        tenDuAn || tenKhachHang || item.ten_khach_hang_du_an || (item as any).dia_ban;

                      // Tính % hoàn thành của item
                      let tyLeItem = 0;
                      if (isTC) {
                        const target = item.du_kien_thu_thang_nay || item.chi_tieu || 0;
                        const tt = item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0;
                        tyLeItem = target > 0 ? Math.round((tt / target) * 100) : 0;
                      } else {
                        const target = item.chi_tieu || 0;
                        const tt = item.ket_qua_thuc_te || 0;
                        tyLeItem = target > 0 ? Math.round((tt / target) * 100) : 0;
                      }

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

                          {/* Mục tiêu / Dự án / Địa bàn */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-foreground leading-snug">{tenMucTieu}</div>
                            {item.muc_tieu_thang && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                🎯 {item.muc_tieu_thang}
                              </div>
                            )}
                            {item.co_quan_doanh_nghiep && (
                              <div className="text-[11px] text-foreground/80 mt-0.5">
                                🏢 {item.co_quan_doanh_nghiep}
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

                          {/* Nhóm */}
                          <td className="py-3 px-3 text-center">
                            {renderBadgeLoai(item.loai_muc_tieu)}
                          </td>

                          {/* Chỉ tiêu / Kế hoạch */}
                          <td className="py-3 px-3 text-right">
                            {isTC ? (
                              <div>
                                <div className="font-mono font-bold text-emerald-600">
                                  {DINH_DANG_TIEN_NGAN_GON(
                                    item.du_kien_thu_thang_nay || item.chi_tieu || 0
                                  )}
                                </div>
                                {(item.gia_tri_hd || 0) > 0 && (
                                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    HĐ: {DINH_DANG_TIEN_NGAN_GON(item.gia_tri_hd || 0)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="font-mono font-bold text-foreground">
                                {item.chi_tieu ? `${item.chi_tieu} ${item.don_vi_tinh || ''}` : '—'}
                              </div>
                            )}
                          </td>

                          {/* Thực tế đạt được */}
                          <td className="py-3 px-3 text-right">
                            {isTC ? (
                              <div className="font-mono font-bold text-blue-600">
                                {DINH_DANG_TIEN_NGAN_GON(item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0)}
                              </div>
                            ) : (
                              <div className="font-mono font-bold text-blue-600">
                                {item.ket_qua_thuc_te != null
                                  ? `${item.ket_qua_thuc_te} ${item.don_vi_tinh || ''}`
                                  : '—'}
                              </div>
                            )}
                          </td>

                          {/* % Hoàn thành */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block ${
                                tyLeItem >= 100
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : tyLeItem >= 50
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                  : tyLeItem > 0
                                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {tyLeItem}%
                            </span>
                          </td>

                          {/* Đánh giá / Ghi chú */}
                          <td className="py-3 px-3 text-[11px] text-muted-foreground">
                            {item.ghi_chu_ket_qua ? (
                              <div className="text-foreground font-medium line-clamp-2">
                                {item.ghi_chu_ket_qua}
                              </div>
                            ) : item.ghi_chu ? (
                              <div className="line-clamp-2">{item.ghi_chu}</div>
                            ) : (
                              '—'
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
              Bảng chỉ tiêu thành viên ({dataBang.length})
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Tháng: {thang}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[180px]">Thành viên</th>
                  <th className="py-3 px-3 min-w-[90px] text-center">Số mục tiêu</th>
                  <th className="py-3 px-3 min-w-[130px] text-right">Chỉ tiêu doanh thu</th>
                  <th className="py-3 px-3 min-w-[130px] text-right">Thực tế đã thu</th>
                  <th className="py-3 px-3 min-w-[90px] text-center">% Hoàn thành KPI</th>
                  <th className="py-3 px-3 min-w-[130px] text-center">Báo cáo tháng</th>
                  <th className="py-3 px-3 min-w-[160px]">Khó khăn / Đề xuất</th>
                  <th className="py-3 px-3 w-28 text-center print:hidden">Chi tiết</th>
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
                      <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                        {item.soMucTieu > 0 ? (
                          <span>{item.soMucTieu}</span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Chưa lập</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                        {item.duKien > 0 ? DINH_DANG_TIEN_NGAN_GON(item.duKien) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                        {item.thucTe > 0 ? DINH_DANG_TIEN_NGAN_GON(item.thucTe) : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.soMucTieu > 0 ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              item.tyLeHoanThanhKPI >= 100
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : item.tyLeHoanThanhKPI >= 50
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : item.tyLeHoanThanhKPI > 0
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.tyLeHoanThanhKPI}%
                          </span>
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
                          title="Lọc xem toàn bộ mục tiêu của nhân sự này"
                        >
                          <Eye className="size-3" /> Xem mục tiêu ({item.soMucTieu})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/50 font-bold">
                  <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px] text-muted-foreground">
                    Tổng cộng toàn team:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-emerald-600">
                    {DINH_DANG_TIEN_NGAN_GON(tongDuKienThuTeam)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-xs tabular-nums text-blue-600">
                    {DINH_DANG_TIEN_NGAN_GON(tongThucTeThuTeam)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-xs text-blue-700">
                    {tyLeDatTeam}%
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
