'use client';

import { Printer, CheckCircle2, AlertCircle, Eye, Users } from 'lucide-react';
import type { KeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachThang } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { Nut } from '../ui';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';

interface Props {
  danhSachNhanSu: NhanSu[];
  danhSachKeHoach: KeHoachThang[];
  danhSachBaoCao: BaoCaoKeHoachThang[];
  thang: string;
  onXemChiTietNV: (nhanVienId: string) => void;
}

export default function BangTongQuanTeamThang({
  danhSachNhanSu,
  danhSachKeHoach,
  danhSachBaoCao,
  thang,
  onXemChiTietNV
}: Props) {
  const tongSoNV = danhSachNhanSu.length;
  const mapKeHoach = new Map(danhSachKeHoach.map((kh) => [kh.nhan_vien_id, kh]));
  const mapBaoCao = new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc]));

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

  const xuLyInTongHop = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header & Bộ thẻ thống kê */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Tổng quan Kế hoạch & KPI Tháng — Toàn đội
          </h3>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Tổng hợp mục tiêu chỉ tiêu, tiến độ hoàn thành KPI và doanh thu của các thành viên
          </span>
        </div>
        <Nut kieu="outline" icon_trai={Printer} onClick={xuLyInTongHop} className="print:hidden">
          In / Xuất PDF báo cáo
        </Nut>
      </div>

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

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Chỉ tiêu Doanh thu team
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {DINH_DANG_TIEN_NGAN_GON(tongDuKienThuTeam)}
          </span>
          <span className="text-[10px] text-emerald-700/80 mt-1 block font-mono">
            Tổng HĐ: {DINH_DANG_TIEN_NGAN_GON(tongGiaTriHdTeam)}
          </span>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Doanh thu thực tế đã thu
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {DINH_DANG_TIEN_NGAN_GON(tongThucTeThuTeam)}
          </span>
          <span className="text-[10px] text-blue-700/80 mt-1 block font-bold font-mono">
            Đạt {tyLeDatTeam}% chỉ tiêu doanh thu
          </span>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
            Đã nộp báo cáo
          </span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {soNVNopBaoCao} / {soNVLapKeHoach || tongSoNV}
          </span>
          <span className="text-[10px] text-purple-700/80 mt-1 block">
            Báo cáo tổng kết tháng
          </span>
        </div>
      </div>

      {/* Bảng danh sách từng nhân sự */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
          <span className="font-bold text-xs text-foreground uppercase tracking-wider">
            Bảng chỉ tiêu thành viên ({dataBang.length})
          </span>
          <span className="text-[11px] text-muted-foreground">Tháng: {thang}</span>
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
                <th className="py-3 px-3 w-20 text-center print:hidden">Chi tiết</th>
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
                      <div className="text-[11px] text-muted-foreground">
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
                              ? 'bg-emerald-500/15 text-emerald-700'
                              : item.tyLeHoanThanhKPI >= 50
                              ? 'bg-amber-500/15 text-amber-700'
                              : item.tyLeHoanThanhKPI > 0
                              ? 'bg-blue-500/15 text-blue-700'
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Đã nộp
                        </span>
                      ) : item.baoCao?.trang_thai === 'nhap' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700">
                          Đang nháp
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 inline-flex items-center gap-1">
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
                        onClick={() => onXemChiTietNV(item.nhanSu.id)}
                        className="h-7 px-2 rounded-md border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center gap-1 mx-auto text-[11px] font-bold transition-colors"
                        title="Xem kế hoạch thành viên"
                      >
                        <Eye className="size-3" /> Xem
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
    </div>
  );
}
