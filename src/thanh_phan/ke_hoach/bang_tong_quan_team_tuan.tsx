'use client';

import { Printer, CheckCircle2, AlertCircle, Eye, Users } from 'lucide-react';
import type { KeHoachTuan } from '../../thu_vien/types/ke_hoach';
import type { BaoCaoKeHoachTuan } from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { Nut } from '../ui';

interface Props {
  danhSachNhanSu: NhanSu[];
  danhSachKeHoach: KeHoachTuan[];
  danhSachBaoCao: BaoCaoKeHoachTuan[];
  tuan: string;
  onXemChiTietNV: (nhanVienId: string) => void;
}

export default function BangTongQuanTeamTuan({
  danhSachNhanSu,
  danhSachKeHoach,
  danhSachBaoCao,
  tuan,
  onXemChiTietNV
}: Props) {
  // Thống kê toàn đội
  const tongSoNV = danhSachNhanSu.length;
  const mapKeHoach = new Map(danhSachKeHoach.map((kh) => [kh.nhan_vien_id, kh]));
  const mapBaoCao = new Map(danhSachBaoCao.map((bc) => [bc.nhan_vien_id, bc]));

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
            Tổng quan tác chiến tuần — Toàn đội
          </h3>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Theo dõi tiến độ nộp kế hoạch, hoàn thành công việc và báo cáo của các thành viên
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

        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Tổng việc toàn team
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {tongSoViecTeam}
          </span>
          <span className="text-[10px] text-blue-700/80 mt-1 block">
            TB {(tongSoViecTeam / (soNVLapKeHoach || 1)).toFixed(1)} việc/người
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Tỷ lệ hoàn thành
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {tongSoXongTeam}/{tongSoViecTeam} ({tyLeXongTeam}%)
          </span>
          <span className="text-[10px] text-emerald-700/80 mt-1 block">
            Tiến độ chung toàn đội
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
            Báo cáo tổng kết tuần
          </span>
        </div>
      </div>

      {/* Bảng danh sách từng nhân sự */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-border/80 bg-muted/20 flex items-center justify-between">
          <span className="font-bold text-xs text-foreground uppercase tracking-wider">
            Bảng theo dõi thành viên ({dataBang.length})
          </span>
          <span className="text-[11px] text-muted-foreground">Tuần: {tuan}</span>
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
                <th className="py-3 px-3 min-w-[150px]">Ghi chú / Khó khăn</th>
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
                    <td className="py-3 px-3 text-center">
                      {item.coKeHoach ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700">
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
          </table>
        </div>
      </div>
    </div>
  );
}
