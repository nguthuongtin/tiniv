'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  FolderKanban,
  Building2,
  Phone,
  Plus,
  Check,
  X,
  CalendarPlus,
  ListTodo,
  ExternalLink,
  Target,
  Sparkles,
  Search
} from 'lucide-react';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import { layCauHinhGiaiDoanTheoKey } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import { BANG_TIEM_NANG_DU_AN } from '../bao_cao_tuan_vdcd/bang_bao_cao_tuan_chuan_vdcd';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  danhSachDuAn: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  danhSachNguoiLienHe?: NguoiLienHe[];
  nhanVienId?: string;
  duAnTrongDiemIds?: string[];
  onCapNhatDuAnTrongDiem?: (ids: string[]) => Promise<void>;
  onMoChiTietDuAn?: (duAn: HoSoDuAn) => void;
  onTaoLichHen?: (duAn: HoSoDuAn) => void;
  onThemTaskTuan?: (duAn: HoSoDuAn) => void;
  onThemDuAnMoi?: () => void;
  laSuaDuoc?: boolean;
}

const fmtTien = (val?: number | null): string => {
  if (!val) return '0 ₫';
  return `${Number(val).toLocaleString('vi-VN')} ₫`;
};

export default function BangDuAnTiemNangTuan({
  danhSachDuAn,
  danhSachKhachHang = [],
  danhSachNguoiLienHe = [],
  nhanVienId,
  duAnTrongDiemIds = [],
  onCapNhatDuAnTrongDiem,
  onMoChiTietDuAn,
  onTaoLichHen,
  onThemTaskTuan,
  onThemDuAnMoi,
  laSuaDuoc = true
}: Props) {
  const mapKH = useMemo(
    () => new Map(danhSachKhachHang.map((k) => [k.id, k])),
    [danhSachKhachHang]
  );
  const mapNLH = useMemo(
    () => new Map(danhSachNguoiLienHe.map((n) => [n.id, n])),
    [danhSachNguoiLienHe]
  );

  // Lọc dự án thuộc về nhân sự
  const dsDuAnCuaNV = useMemo(() => {
    if (!nhanVienId) return danhSachDuAn;
    return danhSachDuAn.filter(
      (d) =>
        d.trang_thai !== 'da_xoa' &&
        (d.nguoi_phu_trach_id === nhanVienId ||
          d.nguoi_quan_ly_id === nhanVienId ||
          (!d.nguoi_phu_trach_id && d.nguoi_tao_id === nhanVienId))
    );
  }, [danhSachDuAn, nhanVienId]);

  // Bộ lọc dự án tiềm năng từ CAO trở lên ('cao', 'rat_cao')
  const dsDuAnTiemNangCaoNV = useMemo(() => {
    return dsDuAnCuaNV
      .filter(
        (d) =>
          (d.muc_do_tiem_nang === 'rat_cao' || d.muc_do_tiem_nang === 'cao') &&
          d.giai_doan !== 'hoan_thanh_tt_dot_2' &&
          d.giai_doan !== 'tam_dung_huy'
      )
      .sort((a, b) => {
        const score = (tn?: string) => (tn === 'rat_cao' ? 5 : 4);
        return score(b.muc_do_tiem_nang) - score(a.muc_do_tiem_nang);
      });
  }, [dsDuAnCuaNV]);

  const [idsDuAnChon, setIdsDuAnChon] = useState<string[]>([]);
  const [moModalChonDA, setMoModalChonDA] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [tuKhoaModal, setTuKhoaModal] = useState('');

  useEffect(() => {
    if (duAnTrongDiemIds && duAnTrongDiemIds.length > 0) {
      const idHopLe = duAnTrongDiemIds.filter((id) =>
        dsDuAnTiemNangCaoNV.some((d) => d.id === id)
      );
      setIdsDuAnChon(idHopLe.length > 0 ? idHopLe : dsDuAnTiemNangCaoNV.slice(0, 6).map((d) => d.id));
      return;
    }
    setIdsDuAnChon(dsDuAnTiemNangCaoNV.slice(0, 6).map((d) => d.id));
  }, [duAnTrongDiemIds, dsDuAnTiemNangCaoNV]);

  const dsDuAnTrongDiem = useMemo(() => {
    return idsDuAnChon
      .map((id) => dsDuAnTiemNangCaoNV.find((d) => d.id === id))
      .filter(Boolean) as HoSoDuAn[];
  }, [idsDuAnChon, dsDuAnTiemNangCaoNV]);

  const tongGiaTriDeal = useMemo(() => {
    return dsDuAnTrongDiem.reduce(
      (s, d) => s + Number(d.gia_tri_hop_dong || d.gia_tri_du_kien || 0),
      0
    );
  }, [dsDuAnTrongDiem]);

  const xuLyLuuChon = async (newIds: string[]) => {
    setIdsDuAnChon(newIds);
    if (onCapNhatDuAnTrongDiem) {
      setDangLuu(true);
      try {
        await onCapNhatDuAnTrongDiem(newIds);
      } finally {
        setDangLuu(false);
      }
    }
  };

  const dsDuAnModalLoc = useMemo(() => {
    if (!tuKhoaModal.trim()) return dsDuAnTiemNangCaoNV;
    const kw = tuKhoaModal.toLowerCase().trim();
    return dsDuAnTiemNangCaoNV.filter((d) => {
      const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
      return (
        d.ten_du_an.toLowerCase().includes(kw) ||
        (kh?.ten_khach_hang && kh.ten_khach_hang.toLowerCase().includes(kw))
      );
    });
  }, [dsDuAnTiemNangCaoNV, tuKhoaModal, mapKH]);

  return (
    <div className="space-y-4">
      {/* KHỐI DỰ ÁN TRỌNG ĐIỂM TIỀM NĂNG CAO */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        {/* BANNER HEADER */}
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center shrink-0">
              II
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Danh sách dự án trọng điểm đang bám sát (Tiềm năng cao)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {dsDuAnTrongDiem.length} dự án
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tự động chọn lọc từ Hồ sơ dự án dựa trên mức độ tiềm năng (Rất cao &gt; Cao). Dữ liệu này được làm căn cứ xuất Báo cáo kế hoạch tổng chi nhánh.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {laSuaDuoc && (
              <button
                type="button"
                onClick={() => setMoModalChonDA(true)}
                className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                <span>Chọn / Thay đổi dự án</span>
              </button>
            )}

            {onThemDuAnMoi && (
              <button
                type="button"
                onClick={onThemDuAnMoi}
                className="h-8 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <FolderKanban className="size-3.5 text-primary" />
                <span>+ Thêm dự án</span>
              </button>
            )}
          </div>
        </div>

        {/* BẢNG DỰ ÁN TRỌNG ĐIỂM */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-left">Tên dự án &amp; Khách hàng / CĐT</th>
                <th className="py-2.5 px-4 text-left">Người liên hệ &amp; SĐT</th>
                <th className="py-2.5 px-4 text-right w-36">Giá trị dự toán / HĐ</th>
                <th className="py-2.5 px-4 text-left w-36">Giai đoạn dự án</th>
                <th className="py-2.5 px-3 text-center w-36">Mức độ tiềm năng</th>
                <th className="py-2.5 px-4 text-left w-40">Sản phẩm / Dịch vụ</th>
                {laSuaDuoc && <th className="py-2.5 px-3 text-right w-36">Tác chiến tuần</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {dsDuAnTrongDiem.length === 0 ? (
                <tr>
                  <td colSpan={laSuaDuoc ? 8 : 7} className="py-8 text-center text-muted-foreground text-xs">
                    Chưa có dự án trọng điểm nào được chọn cho tuần này. Bấm nút &quot;Chọn / Thay đổi dự án&quot; phía trên để đưa dự án tiềm năng cao vào kế hoạch.
                  </td>
                </tr>
              ) : (
                dsDuAnTrongDiem.map((d, idx) => {
                  const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
                  const nlh = d.nguoi_lien_he_id ? mapNLH.get(d.nguoi_lien_he_id) : null;
                  const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
                  const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.trung_binh;
                  const giaTri = d.gia_tri_hop_dong || d.gia_tri_du_kien || 0;

                  return (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => onMoChiTietDuAn?.(d)}
                          className="font-extrabold text-foreground hover:text-primary transition-colors text-left flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span>{d.ten_du_an}</span>
                          <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition" />
                        </button>
                        {kh && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="size-3 text-muted-foreground shrink-0" />
                            <span>CĐT: {kh.ten_khach_hang}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-foreground">
                          {nlh?.ho_va_ten || kh?.so_dien_thoai || '—'}
                        </div>
                        {(nlh?.so_dien_thoai || kh?.so_dien_thoai) && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground shrink-0" />
                            <span>{nlh?.so_dien_thoai || kh?.so_dien_thoai}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-foreground">
                        {fmtTien(giaTri)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {cfgGD.nhan_ngan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border', cfgTN.badgeCls)}>
                          {cfgTN.nhan}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground text-[11px] truncate max-w-[160px]">
                        {d.san_pham_khac_mo_ta || 'Khảo sát / Đo đạc'}
                      </td>
                      {laSuaDuoc && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {onTaoLichHen && (
                              <button
                                type="button"
                                onClick={() => onTaoLichHen(d)}
                                className="h-7 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                                title="Lên lịch hẹn công tác cho dự án này"
                              >
                                <CalendarPlus className="size-3" />
                                <span>Lịch</span>
                              </button>
                            )}
                            {onThemTaskTuan && (
                              <button
                                type="button"
                                onClick={() => onThemTaskTuan(d)}
                                className="h-7 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                                title="Thêm việc tác chiến tuần cho dự án này"
                              >
                                <ListTodo className="size-3" />
                                <span>Việc</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            {dsDuAnTrongDiem.length > 0 && (
              <tfoot>
                <tr className="bg-muted/40 font-bold border-t border-border text-foreground">
                  <td colSpan={3} className="py-2.5 px-4 text-right uppercase tracking-wider text-[11px] text-muted-foreground">
                    Tổng giá trị Deal dự án bám sát tuần:
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm text-primary font-black">
                    {fmtTien(tongGiaTriDeal)}
                  </td>
                  <td colSpan={laSuaDuoc ? 4 : 3} className="py-2.5 px-4 text-muted-foreground text-[11px]">
                    (Bao gồm {dsDuAnTrongDiem.length} dự án tiềm năng cao)
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* MODAL CHỌN DỰ ÁN TRỌNG ĐIỂM TIỀM NĂNG CAO */}
      {moModalChonDA && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">
                  Chọn dự án trọng điểm đang bám sát
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đánh dấu các dự án có tiềm năng cao (Rất cao &gt; Cao) để đưa vào kế hoạch tuần
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoModalChonDA(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Ô TÌM NHANH TRONG MODAL */}
            <div className="p-3 border-b border-border/60 bg-muted/20">
              <div className="relative">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tuKhoaModal}
                  onChange={(e) => setTuKhoaModal(e.target.value)}
                  placeholder="Tìm tên dự án, chủ đầu tư..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-border/60 max-h-[460px] text-xs">
              {dsDuAnModalLoc.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Không tìm thấy dự án nào có mức tiềm năng Cao hoặc Rất cao.
                </div>
              ) : (
                dsDuAnModalLoc.map((d) => {
                  const daChon = idsDuAnChon.includes(d.id);
                  const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
                  const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
                  const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.trung_binh;

                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        if (daChon) {
                          xuLyLuuChon(idsDuAnChon.filter((id) => id !== d.id));
                        } else {
                          xuLyLuuChon([...idsDuAnChon, d.id]);
                        }
                      }}
                      className={cn(
                        'p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition my-1',
                        daChon
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            'size-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition',
                            daChon
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border bg-card'
                          )}
                        >
                          {daChon && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-xs truncate">
                            {d.ten_du_an}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {kh ? `CĐT: ${kh.ten_khach_hang}` : 'Chưa gắn KH'} · Giai đoạn:{' '}
                            <span className="font-semibold text-foreground">{cfgGD.nhan_ngan}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', cfgTN.badgeCls)}>
                          {cfgTN.nhan}
                        </span>
                        <span className="font-mono font-bold text-foreground text-xs">
                          {fmtTien(d.gia_tri_hop_dong || d.gia_tri_du_kien)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Đã chọn: <span className="font-bold text-foreground">{idsDuAnChon.length}</span> dự án
              </span>
              <button
                type="button"
                onClick={() => setMoModalChonDA(false)}
                className="h-8 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
