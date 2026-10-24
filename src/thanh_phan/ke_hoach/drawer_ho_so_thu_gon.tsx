'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FolderKanban,
  Building2,
  CalendarClock,
  UserPlus,
  Pencil,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquareQuote,
  Link2,
  Plus,
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Ban_Ve } from '../ui';
import {
  DANH_SACH_GIAI_DOAN_MAC_DINH,
  layCauHinhGiaiDoanTheoKey
} from '../../thu_vien/cau_hinh/giai_doan_du_an';
import type { HoSoDuAn, TienDoDuAn, GiaiDoanDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  danhSachTienDoDuAn,
  taoTienDoDuAnMoi
} from '../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import { doiGiaiDoanHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { ModalNguoiLienHe } from '../khach_hang/modal_nguoi_lien_he';
import ModalTaoYeuCauPhoiHop from './modal_tao_yeu_cau_phoi_hop';

export interface GoiYTaoLichHenNhanh {
  khach_hang_id?: string | null;
  ten_khach_hang?: string;
  du_an_id?: string | null;
  nguoi_lien_he_id?: string | null;
  ten_nguoi_lien_he?: string | null;
  so_dien_thoai?: string | null;
  dia_diem?: string | null;
  noi_dung?: string | null;
}

interface Props {
  mo: boolean;
  onDong: () => void;
  cheDo: 'du_an' | 'khach_hang';
  duAn: HoSoDuAn | null;
  khachHang: KhachHang | null;
  danhSachDuAn: HoSoDuAn[];
  danhSachKhachHang: KhachHang[];
  nguoiDungHienTai?: { id: string; ho_va_ten?: string | null } | null;
  laSuaDuoc: boolean;
  onChonDuAn: (da: HoSoDuAn) => void;
  onChonKhachHang: (kh: KhachHang) => void;
  onMoSuaDuAn: (da: HoSoDuAn) => void;
  onMoTaoDuAnChoKH: (kh: KhachHang) => void;
  onMoSuaKhachHang: (kh: KhachHang) => void;
  onMoTaoLichHen: (goiY: GoiYTaoLichHenNhanh) => void;
  onDuaVaoViecHomNay: (params: {
    duAn?: HoSoDuAn | null;
    khachHang?: KhachHang | null;
    goiYHanhDong?: string;
  }) => void;
  onDaCapNhatTienDoDuAn?: (params: {
    duAn: HoSoDuAn;
    noiDung: string;
    linkTaiLieu?: string | null;
    tenTaiLieu?: string | null;
    giaiDoanMoi?: string | null;
  }) => void;
  onDaThayDoiNguoiLienHe?: () => void;
}

const dinhDangTien = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  if (n <= 0) return 'Chưa cập nhật';
  return `${n.toLocaleString('vi-VN')} ₫`;
};

const dinhDangNgayGio = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function DrawerHoSoThuGon({
  mo,
  onDong,
  cheDo,
  duAn,
  khachHang,
  danhSachDuAn,
  danhSachKhachHang,
  nguoiDungHienTai,
  laSuaDuoc,
  onChonDuAn,
  onChonKhachHang,
  onMoSuaDuAn,
  onMoTaoDuAnChoKH,
  onMoSuaKhachHang,
  onMoTaoLichHen,
  onDuaVaoViecHomNay,
  onDaCapNhatTienDoDuAn,
  onDaThayDoiNguoiLienHe
}: Props) {
  const [dsTienDo, setDsTienDo] = useState<TienDoDuAn[]>([]);
  const [dangTaiTienDo, setDangTaiTienDo] = useState(false);

  const [dsLienHe, setDsLienHe] = useState<NguoiLienHe[]>([]);
  const [dangTaiLienHe, setDangTaiLienHe] = useState(false);

  // State cập nhật tiến độ trực tiếp trong Hồ sơ thu gọn Dự án
  const [noiDungTienDo, setNoiDungTienDo] = useState('');
  const [hanhDongTiepTheo, setHanhDongTiepTheo] = useState('');
  const [moLinkDinhKem, setMoLinkDinhKem] = useState(false);
  const [linkTaiLieu, setLinkTaiLieu] = useState('');
  const [tenTaiLieu, setTenTaiLieu] = useState('');
  const [giaiDoanChon, setGiaiDoanChon] = useState<string>('');
  const [dangLuuTienDo, setDangLuuTienDo] = useState(false);

  // State Modal Thêm / Sửa Người liên hệ ngay tại chỗ
  const [moModalLienHe, setMoModalLienHe] = useState(false);
  const [lienHeDangSua, setLienHeDangSua] = useState<NguoiLienHe | null>(null);
  const [moModalYeuCau, setMoModalYeuCau] = useState(false);

  // Khách hàng tương ứng (khi đang xem Dự án hoặc xem Khách hàng)
  const khachHangHienTai = useMemo(() => {
    if (cheDo === 'khach_hang') return khachHang;
    if (duAn?.khach_hang_id) {
      return danhSachKhachHang.find((k) => k.id === duAn.khach_hang_id) || null;
    }
    return null;
  }, [cheDo, khachHang, duAn, danhSachKhachHang]);

  // Các dự án thuộc khách hàng đang xem
  const dsDuAnCuaKH = useMemo(() => {
    if (!khachHangHienTai) return [];
    return danhSachDuAn.filter((d) => d.khach_hang_id === khachHangHienTai.id);
  }, [danhSachDuAn, khachHangHienTai]);

  const taiDanhSachLienHe = useCallback(async (khId: string) => {
    setDangTaiLienHe(true);
    try {
      const res = await danhSachNguoiLienHe({ khach_hang_id: khId });
      setDsLienHe(res.mang ?? []);
    } catch {
      setDsLienHe([]);
    } finally {
      setDangTaiLienHe(false);
    }
  }, []);

  const taiDanhSachTienDo = useCallback(async (daId: string) => {
    setDangTaiTienDo(true);
    try {
      const res = await danhSachTienDoDuAn({ du_an_id: daId });
      setDsTienDo(res.mang ?? []);
    } catch {
      setDsTienDo([]);
    } finally {
      setDangTaiTienDo(false);
    }
  }, []);

  useEffect(() => {
    if (!mo) return;
    setNoiDungTienDo('');
    setHanhDongTiepTheo('');
    setLinkTaiLieu('');
    setTenTaiLieu('');
    setMoLinkDinhKem(false);
    setGiaiDoanChon('');

    if (cheDo === 'du_an' && duAn?.id) {
      void taiDanhSachTienDo(duAn.id);
    } else {
      setDsTienDo([]);
    }

    if (khachHangHienTai?.id) {
      void taiDanhSachLienHe(khachHangHienTai.id);
    } else {
      setDsLienHe([]);
    }
  }, [mo, cheDo, duAn?.id, khachHangHienTai?.id, taiDanhSachTienDo, taiDanhSachLienHe]);

  const xuLyLuuTienDoNhanh = async () => {
    if (!duAn || (!noiDungTienDo.trim() && !giaiDoanChon)) return;
    setDangLuuTienDo(true);
    try {
      const textGhi =
        noiDungTienDo.trim() ||
        `Chuyển giai đoạn sang: ${layCauHinhGiaiDoanTheoKey(giaiDoanChon).nhan_day_du}`;

      await taoTienDoDuAnMoi(
        {
          du_an_id: duAn.id,
          tinh_hinh_hien_tai: textGhi,
          hanh_dong_tiep_theo: hanhDongTiepTheo.trim() || null,
          link_tai_lieu: linkTaiLieu.trim() || null,
          ten_tai_lieu: tenTaiLieu.trim() || null,
          trang_thai_hanh_dong: 'dang_thuc_hien',
          nguoi_tao_id: nguoiDungHienTai?.id || null
        },
        duAn.ten_du_an
      );

      if (giaiDoanChon && giaiDoanChon !== duAn.giai_doan) {
        await doiGiaiDoanHoSoDuAn(
          duAn.id,
          giaiDoanChon as GiaiDoanDuAn,
          nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null
        );
      }

      if (onDaCapNhatTienDoDuAn) {
        onDaCapNhatTienDoDuAn({
          duAn,
          noiDung: textGhi,
          linkTaiLieu: linkTaiLieu.trim() || null,
          tenTaiLieu: tenTaiLieu.trim() || null,
          giaiDoanMoi: giaiDoanChon || null
        });
      }

      setNoiDungTienDo('');
      setHanhDongTiepTheo('');
      setLinkTaiLieu('');
      setTenTaiLieu('');
      setMoLinkDinhKem(false);
      setGiaiDoanChon('');
      await taiDanhSachTienDo(duAn.id);
    } catch (err: any) {
      alert(err?.message || 'Không thể lưu tiến độ dự án.');
    } finally {
      setDangLuuTienDo(false);
    }
  };

  const lienHeChinh = useMemo(() => {
    if (duAn?.nguoi_lien_he_id) {
      const found = dsLienHe.find((l) => l.id === duAn.nguoi_lien_he_id);
      if (found) return found;
    }
    return dsLienHe[0] || null;
  }, [duAn?.nguoi_lien_he_id, dsLienHe]);

  const diaBanKH = useMemo(() => {
    if (!khachHangHienTai) return '';
    return [khachHangHienTai.dia_chi, khachHangHienTai.xa_phuong, khachHangHienTai.tinh_thanh]
      .filter(Boolean)
      .join(', ');
  }, [khachHangHienTai]);

  const cauHinhGiaiDoan = duAn ? layCauHinhGiaiDoanTheoKey(duAn.giai_doan) : null;

  return (
    <>
      <Ban_Ve
        mo={mo}
        onDong={onDong}
        tieu_de={
          cheDo === 'du_an'
            ? 'Hồ sơ thu gọn Dự án'
            : 'Hồ sơ thu gọn Khách hàng'
        }
        kich_thuoc="lg"
      >
        {cheDo === 'du_an' && duAn ? (
          <div className="space-y-5 pb-6">
            {/* 1. Thông tin cốt lõi Dự án & Hợp đồng */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {duAn.ma_ho_so && (
                      <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[11px] font-bold">
                        {duAn.ma_ho_so}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {cauHinhGiaiDoan?.nhan_day_du || duAn.giai_doan}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {duAn.ten_du_an}
                  </h3>
                </div>

                {laSuaDuoc && (
                  <button
                    type="button"
                    onClick={() => onMoSuaDuAn(duAn)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Pencil className="size-3.5" /> Sửa DA
                  </button>
                )}
              </div>

              {/* Khách hàng liên kết */}
              {khachHangHienTai && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold min-w-0">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{khachHangHienTai.ten_khach_hang}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChonKhachHang(khachHangHienTai)}
                    className="text-primary font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    Xem hồ sơ KH &rarr;
                  </button>
                </div>
              )}

              {/* Thông tin tài chính / Hợp đồng */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/70">
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-medium">Giá trị dự kiến</div>
                  <div className="text-xs sm:text-sm font-extrabold font-mono text-emerald-700 mt-0.5">
                    {dinhDangTien(duAn.gia_tri_du_kien)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-medium">Giá trị hợp đồng</div>
                  <div className="text-xs sm:text-sm font-extrabold font-mono text-primary mt-0.5">
                    {dinhDangTien(duAn.gia_tri_hop_dong)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-500 font-medium">Dự kiến chốt / Thời hạn</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                    {dinhDangNgayGio(duAn.thoi_han_hoan_thanh)}
                  </div>
                </div>
              </div>

              {(duAn.mo_ta || duAn.ghi_chu) && (
                <div className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200/60 space-y-1">
                  {duAn.mo_ta && <div><span className="font-bold text-slate-700">Mô tả:</span> {duAn.mo_ta}</div>}
                  {duAn.ghi_chu && <div><span className="font-bold text-slate-700">Ghi chú:</span> {duAn.ghi_chu}</div>}
                </div>
              )}
            </div>

            {/* 2. Thanh Thao tác 1 chạm cho Sale */}
            {laSuaDuoc && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    onMoTaoLichHen({
                      khach_hang_id: khachHangHienTai?.id || duAn.khach_hang_id || null,
                      ten_khach_hang: khachHangHienTai?.ten_khach_hang || duAn.ten_du_an,
                      du_an_id: duAn.id,
                      nguoi_lien_he_id: lienHeChinh?.id || null,
                      ten_nguoi_lien_he: lienHeChinh?.ho_va_ten || null,
                      so_dien_thoai: lienHeChinh?.so_dien_thoai || khachHangHienTai?.so_dien_thoai || null,
                      dia_diem: diaBanKH || null,
                      noi_dung: `Làm việc về dự án ${duAn.ten_du_an}`
                    })
                  }
                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <CalendarClock className="size-3.5" /> Tạo lịch hẹn
                </button>

                {khachHangHienTai && (
                  <button
                    type="button"
                    onClick={() => {
                      setLienHeDangSua(null);
                      setMoModalLienHe(true);
                    }}
                    className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="size-3.5 text-primary" /> + Người liên hệ
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onDuaVaoViecHomNay({
                      duAn,
                      khachHang: khachHangHienTai,
                      goiYHanhDong: `Thúc đẩy tiến độ dự án ${duAn.ten_du_an}`
                    });
                  }}
                  className="h-9 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Đưa vào việc hôm nay
                </button>
              </div>
            )}

            {/* 3. Ô Check-in / Cập nhật tiến độ Dự án ngay tại chỗ */}
            {laSuaDuoc && (
              <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-3.5 space-y-2.5">
                <div className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Cập nhật tiến độ & Phản hồi ngay</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Tự động đồng bộ Dự án, Kế hoạch tuần & Báo cáo ngày
                  </span>
                </div>

                <textarea
                  rows={2}
                  value={noiDungTienDo}
                  onChange={(e) => setNoiDungTienDo(e.target.value)}
                  placeholder="Nhập tình hình vừa làm việc với khách hàng, kết quả cuộc gọi, phản hồi chỉ đạo..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={hanhDongTiepTheo}
                    onChange={(e) => setHanhDongTiepTheo(e.target.value)}
                    placeholder="Bước tiếp theo (nếu có)..."
                    className="flex-1 h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() => setMoLinkDinhKem((prev) => !prev)}
                    className={cn(
                      'h-8.5 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer',
                      moLinkDinhKem
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Link2 className="size-3.5" /> Link
                  </button>

                  <select
                    value={giaiDoanChon}
                    onChange={(e) => setGiaiDoanChon(e.target.value)}
                    className="h-8.5 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
                  >
                    <option value="">Giữ giai đoạn ({cauHinhGiaiDoan?.nhan_ngan})</option>
                    {DANH_SACH_GIAI_DOAN_MAC_DINH.map((gd) => (
                      <option key={gd.key} value={gd.key}>
                        Đổi sang: {gd.nhan_day_du}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={dangLuuTienDo || (!noiDungTienDo.trim() && !giaiDoanChon)}
                    onClick={xuLyLuuTienDoNhanh}
                    className="h-8.5 px-3.5 rounded-lg bg-primary text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    {dangLuuTienDo ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                    Lưu tiến độ
                  </button>
                </div>

                {moLinkDinhKem && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={linkTaiLieu}
                      onChange={(e) => setLinkTaiLieu(e.target.value)}
                      placeholder="Dán link tài liệu, báo giá, hợp đồng..."
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={tenTaiLieu}
                      onChange={(e) => setTenTaiLieu(e.target.value)}
                      placeholder="Tên tài liệu đính kèm..."
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. Đầu mối Người liên hệ để gọi điện ngay */}
            {khachHangHienTai && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    Người liên hệ ({dsLienHe.length})
                  </h4>
                  {laSuaDuoc && (
                    <button
                      type="button"
                      onClick={() => {
                        setLienHeDangSua(null);
                        setMoModalLienHe(true);
                      }}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      + Thêm liên hệ
                    </button>
                  )}
                </div>

                {dangTaiLienHe ? (
                  <div className="text-xs text-slate-400 py-2">Đang tải liên hệ...</div>
                ) : dsLienHe.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500 flex items-center justify-between">
                    <span>Chưa có thông tin người liên hệ cho khách hàng này.</span>
                    {laSuaDuoc && (
                      <button
                        type="button"
                        onClick={() => {
                          setLienHeDangSua(null);
                          setMoModalLienHe(true);
                        }}
                        className="font-bold text-primary hover:underline"
                      >
                        + Thêm ngay
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dsLienHe.map((lh) => (
                      <div
                        key={lh.id}
                        className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {lh.ho_va_ten}
                          </div>
                          {lh.chuc_vu && (
                            <div className="text-[11px] text-slate-500 font-medium">{lh.chuc_vu}</div>
                          )}
                          {lh.so_dien_thoai && (
                            <a
                              href={`tel:${lh.so_dien_thoai}`}
                              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 hover:underline pt-0.5"
                            >
                              <Phone className="size-3" /> {lh.so_dien_thoai}
                            </a>
                          )}
                        </div>
                        {laSuaDuoc && (
                          <button
                            type="button"
                            onClick={() => {
                              setLienHeDangSua(lh);
                              setMoModalLienHe(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Sửa người liên hệ"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Toàn bộ Lịch sử Tiến độ & Ý kiến chỉ đạo của Lãnh đạo */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Lịch sử Tiến độ & Chỉ đạo ({dsTienDo.length})
              </h4>

              {dangTaiTienDo ? (
                <div className="flex items-center gap-2 py-6 justify-center text-xs text-slate-500">
                  <Loader2 className="size-4 animate-spin text-primary" /> Đang tải lịch sử tiến độ...
                </div>
              ) : dsTienDo.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  Dự án này chưa có bản ghi tiến độ nào. Hãy nhập tiến độ đầu tiên ở ô bên trên!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dsTienDo.map((td) => (
                    <div
                      key={td.id}
                      className={cn(
                        'rounded-xl border p-3 space-y-2',
                        td.y_kien_chi_dao
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {dinhDangNgayGio(td.ngay_tao)}
                        </span>
                        {td.link_tai_lieu && (
                          <a
                            href={td.link_tai_lieu}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                          >
                            <FileText className="size-3" />
                            {td.ten_tai_lieu || 'Tài liệu đính kèm'}
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                        {td.tinh_hinh_hien_tai}
                      </div>

                      {td.hanh_dong_tiep_theo && (
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-700">Bước tiếp theo:</span>{' '}
                          {td.hanh_dong_tiep_theo}
                          {td.deadline_hanh_dong
                            ? ` (Hạn: ${dinhDangNgayGio(td.deadline_hanh_dong)})`
                            : ''}
                        </div>
                      )}

                      {td.y_kien_chi_dao && (
                        <div className="rounded-lg border border-amber-300 bg-amber-100/70 p-2.5 text-xs text-amber-950 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold flex items-center gap-1 text-amber-900">
                              <MessageSquareQuote className="size-3.5 text-amber-700" />
                              Chỉ đạo từ {td.ten_nguoi_chi_dao || 'Lãnh đạo'}:
                            </span>
                            {laSuaDuoc && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNoiDungTienDo(
                                    `[Phản hồi chỉ đạo: "${td.y_kien_chi_dao?.slice(0, 45)}..."] Đã thực hiện: `
                                  );
                                }}
                                className="text-[11px] font-bold text-amber-900 underline hover:text-primary cursor-pointer"
                              >
                                Phản hồi ngay &uarr;
                              </button>
                            )}
                          </div>
                          <p className="font-medium leading-snug">{td.y_kien_chi_dao}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : khachHangHienTai ? (
          /* CHẾ ĐỘ XEM HỒ SƠ THU GỌN KHÁCH HÀNG */
          <div className="space-y-5 pb-6">
            {/* 1. Thông tin Khách hàng */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold">
                    <Building2 className="size-3" /> Khách hàng / Cơ quan
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {khachHangHienTai.ten_khach_hang}
                  </h3>
                </div>

                {laSuaDuoc && (
                  <button
                    type="button"
                    onClick={() => onMoSuaKhachHang(khachHangHienTai)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Pencil className="size-3.5" /> Sửa KH
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-200/70">
                {khachHangHienTai.so_dien_thoai && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-emerald-600 shrink-0" />
                    <a
                      href={`tel:${khachHangHienTai.so_dien_thoai}`}
                      className="font-mono font-bold text-emerald-700 hover:underline"
                    >
                      {khachHangHienTai.so_dien_thoai}
                    </a>
                  </div>
                )}
                {khachHangHienTai.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{khachHangHienTai.email}</span>
                  </div>
                )}
                {diaBanKH && (
                  <div className="flex items-center gap-1.5 sm:col-span-2">
                    <MapPin className="size-3.5 text-amber-600 shrink-0" />
                    <span>{diaBanKH}</span>
                  </div>
                )}
              </div>

              {khachHangHienTai.ghi_chu && (
                <div className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200/60">
                  <span className="font-bold text-slate-700">Ghi chú:</span> {khachHangHienTai.ghi_chu}
                </div>
              )}
            </div>

            {/* 2. Thanh Thao tác 1 chạm cho Khách hàng */}
            {laSuaDuoc && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    onMoTaoLichHen({
                      khach_hang_id: khachHangHienTai.id,
                      ten_khach_hang: khachHangHienTai.ten_khach_hang,
                      nguoi_lien_he_id: lienHeChinh?.id || null,
                      ten_nguoi_lien_he: lienHeChinh?.ho_va_ten || null,
                      so_dien_thoai:
                        lienHeChinh?.so_dien_thoai || khachHangHienTai.so_dien_thoai || null,
                      dia_diem: diaBanKH || null,
                      noi_dung: `Làm việc với ${khachHangHienTai.ten_khach_hang}`
                    })
                  }
                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <CalendarClock className="size-3.5" /> Tạo lịch hẹn
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLienHeDangSua(null);
                    setMoModalLienHe(true);
                  }}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="size-3.5 text-primary" /> + Người liên hệ
                </button>

                <button
                  type="button"
                  onClick={() => onMoTaoDuAnChoKH(khachHangHienTai)}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderKanban className="size-3.5 text-amber-600" /> + Tạo dự án
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDuaVaoViecHomNay({
                      khachHang: khachHangHienTai,
                      goiYHanhDong: `Liên hệ chăm sóc ${khachHangHienTai.ten_khach_hang}`
                    })
                  }
                  className="h-9 px-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Đưa vào việc hôm nay
                </button>
              </div>
            )}

            {/* 3. Danh sách Người liên hệ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  Người liên hệ ({dsLienHe.length})
                </h4>
              </div>

              {dangTaiLienHe ? (
                <div className="text-xs text-slate-400 py-2">Đang tải liên hệ...</div>
              ) : dsLienHe.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  Chưa có người liên hệ. Bấm <strong>+ Người liên hệ</strong> bên trên để bổ sung.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dsLienHe.map((lh) => (
                    <div
                      key={lh.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-slate-900">{lh.ho_va_ten}</div>
                        {lh.chuc_vu && (
                          <div className="text-[11px] text-slate-500 font-medium">{lh.chuc_vu}</div>
                        )}
                        {lh.so_dien_thoai && (
                          <a
                            href={`tel:${lh.so_dien_thoai}`}
                            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 hover:underline pt-0.5"
                          >
                            <Phone className="size-3" /> {lh.so_dien_thoai}
                          </a>
                        )}
                      </div>
                      {laSuaDuoc && (
                        <button
                          type="button"
                          onClick={() => {
                            setLienHeDangSua(lh);
                            setMoModalLienHe(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Danh sách Dự án của Khách hàng này (Bấm vào để xem tiến độ & hợp đồng) */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderKanban className="size-3.5 text-amber-600" />
                Dự án của khách hàng này ({dsDuAnCuaKH.length})
              </h4>

              {dsDuAnCuaKH.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  Khách hàng này chưa có hồ sơ dự án nào.
                </div>
              ) : (
                <div className="space-y-2">
                  {dsDuAnCuaKH.map((d) => {
                    const gd = layCauHinhGiaiDoanTheoKey(d.giai_doan);
                    return (
                      <div
                        key={d.id}
                        onClick={() => onChonDuAn(d)}
                        className="rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50/60 p-3 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900">
                              {d.ten_du_an}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {gd.nhan_ngan}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>Dự kiến: <strong className="font-mono text-emerald-700">{dinhDangTien(d.gia_tri_du_kien)}</strong></span>
                            {d.gia_tri_hop_dong > 0 && (
                              <span>HĐ: <strong className="font-mono text-primary">{dinhDangTien(d.gia_tri_hop_dong)}</strong></span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0">
                          Tiến độ &rarr;
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Ban_Ve>

      {duAn && (
        <ModalTaoYeuCauPhoiHop
          mo={moModalYeuCau}
          onDong={() => setMoModalYeuCau(false)}
          duAnMacDinh={duAn}
          danhSachDuAn={danhSachDuAn}
          nguoiDungHienTai={nguoiDungHienTai}
          onTaoThanhCong={(yc) => {
            if (onDaCapNhatTienDoDuAn && duAn) {
              onDaCapNhatTienDoDuAn({
                duAn,
                noiDung: `[Yêu cầu phối hợp] ${yc.noi_dung_yeu_cau}`,
                linkTaiLieu: yc.link_drive_dau_vao || null,
                tenTaiLieu: yc.link_drive_dau_vao ? 'Tài liệu Drive' : null
              });
            }
          }}
        />
      )}

      {/* Modal Thêm / Sửa Người liên hệ chuẩn hệ thống */}
      {khachHangHienTai && (
        <ModalNguoiLienHe
          mo={moModalLienHe}
          onDong={() => {
            setMoModalLienHe(false);
            setLienHeDangSua(null);
          }}
          khachHangId={khachHangHienTai.id}
          tenKhachHang={khachHangHienTai.ten_khach_hang}
          dangSua={lienHeDangSua}
          nguoiDungHienTai={nguoiDungHienTai}
          onLuuThanhCong={() => {
            void taiDanhSachLienHe(khachHangHienTai.id);
            if (onDaThayDoiNguoiLienHe) onDaThayDoiNguoiLienHe();
          }}
        />
      )}
    </>
  );
}
