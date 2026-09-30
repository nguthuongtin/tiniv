'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  UserRound,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Phone,
  Users,
  Sparkles,
  Check,
  FileText,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type {
  LichGapKH,
  TrangThaiLichGap
} from '../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP } from '../../thu_vien/types/lich_gap_kh';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  kiemTraTrungLich,
  type TaoMoiLichGapDTO,
  type CapNhatLichGapDTO
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';

const CA_SANG = ['08:00', '08:30', '09:00', '09:30', '10:00'];
const CA_CHIEU = ['13:30', '14:00', '14:30', '15:00', '16:00'];

const THOI_LUONG_NHANH = [
  { nhan: '1 giờ', phut: 60 },
  { nhan: '1.5 giờ', phut: 90 },
  { nhan: '2 giờ', phut: 120 },
  { nhan: 'Cả buổi', phut: 180 }
];

const DIA_DIEM_GOI_Y = ['Tại trụ sở KH', 'Văn phòng Chi nhánh', 'Họp trực tuyến'];

const congThemPhut = (hhmm: string, soPhut: number): string => {
  const [h, m] = (hhmm || '09:00').split(':').map((x) => parseInt(x, 10) || 0);
  const tong = Math.min(23 * 60 + 59, h * 60 + m + soPhut);
  const hMoi = String(Math.floor(tong / 60)).padStart(2, '0');
  const mMoi = String(tong % 60).padStart(2, '0');
  return `${hMoi}:${mMoi}`;
};

const tinhKhoangPhut = (batDau: string, ketThuc: string): number => {
  const [h1, m1] = (batDau || '09:00').split(':').map((x) => parseInt(x, 10) || 0);
  const [h2, m2] = (ketThuc || '10:30').split(':').map((x) => parseInt(x, 10) || 0);
  return Math.max(30, h2 * 60 + m2 - (h1 * 60 + m1));
};

const congNgayISO = (ngayGoc: string, soNgay: number): string => {
  const [y, m, d] = ngayGoc.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + soNgay);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const layChuCaiDau = (ten?: string | null): string => {
  if (!ten) return 'NV';
  const parts = ten.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase();
};

export interface GiaTriMacDinhLichGap {
  khach_hang_id?: string | null;
  ten_khach_hang?: string;
  nguoi_lien_he_id?: string | null;
  ten_nguoi_lien_he?: string | null;
  so_dien_thoai?: string | null;
  nguoi_phu_trach_id?: string;
  chi_nhanh_id?: string | null;
  ngay?: string;
  gio_bat_dau?: string;
  dia_diem?: string | null;
  noi_dung?: string | null;
  nguon_lead_id?: string | null;
}

interface FormLichGapModalProps {
  mo: boolean;
  khi_dong: () => void;
  dang_sua: LichGapKH | null;
  gia_tri_mac_dinh?: GiaTriMacDinhLichGap | null;
  dsLichHienCo: LichGapKH[];
  dsKhachHang: KhachHang[];
  dsNguoiLienHe?: NguoiLienHe[];
  dsNhanSu: NhanSu[];
  nguoiDungId?: string;
  chiNhanhMacDinhId?: string | null;
  khi_luu: (dto: TaoMoiLichGapDTO | CapNhatLichGapDTO) => Promise<void>;
  khi_xoa?: (id: string, ten: string) => Promise<void>;
  dang_xu_ly?: boolean;
}

export default function FormLichGapModal({
  mo,
  khi_dong,
  dang_sua,
  gia_tri_mac_dinh,
  dsLichHienCo,
  dsKhachHang,
  dsNguoiLienHe = [],
  dsNhanSu,
  nguoiDungId,
  chiNhanhMacDinhId,
  khi_luu,
  khi_xoa,
  dang_xu_ly = false
}: FormLichGapModalProps) {
  const homNay = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()),
    []
  );
  const ngayMai = useMemo(() => congNgayISO(homNay, 1), [homNay]);
  const ngayKia = useMemo(() => congNgayISO(homNay, 2), [homNay]);

  const dropdownKHRef = useRef<HTMLDivElement>(null);

  const [khachHangId, setKhachHangId] = useState<string>('');
  const [tenKhachHang, setTenKhachHang] = useState<string>('');
  const [timKhachHang, setTimKhachHang] = useState<string>('');
  const [moGoiYKH, setMoGoiYKH] = useState(false);

  const [tenNguoiLienHe, setTenNguoiLienHe] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [ngay, setNgay] = useState<string>(homNay);
  const [gioBatDau, setGioBatDau] = useState<string>('09:00');
  const [gioKetThuc, setGioKetThuc] = useState<string>('10:30');
  const [diaDiem, setDiaDiem] = useState<string>('');
  const [noiDung, setNoiDung] = useState<string>('');
  const [ketQua, setKetQua] = useState<string>('');
  const [nguoiPhuTrachId, setNguoiPhuTrachId] = useState<string>('');
  const [nguoiThamGiaIds, setNguoiThamGiaIds] = useState<string[]>([]);
  const [trangThai, setTrangThai] = useState<TrangThaiLichGap>('sap_toi');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownKHRef.current && !dropdownKHRef.current.contains(e.target as Node)) {
        setMoGoiYKH(false);
      }
    };
    if (moGoiYKH) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moGoiYKH]);

  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      setKhachHangId(dang_sua.khach_hang_id || '');
      setTenKhachHang(dang_sua.ten_khach_hang || '');
      setTimKhachHang(dang_sua.ten_khach_hang || '');
      setTenNguoiLienHe(dang_sua.ten_nguoi_lien_he || '');
      setSoDienThoai(dang_sua.so_dien_thoai || '');
      setNgay(dang_sua.ngay || homNay);
      setGioBatDau(dang_sua.gio_bat_dau || '09:00');
      setGioKetThuc(dang_sua.gio_ket_thuc || '10:30');
      setDiaDiem(dang_sua.dia_diem || '');
      setNoiDung(dang_sua.noi_dung || '');
      setKetQua(dang_sua.ket_qua || '');
      setNguoiPhuTrachId(dang_sua.nguoi_phu_trach_id || nguoiDungId || '');
      setNguoiThamGiaIds(dang_sua.nguoi_tham_gia_ids || []);
      setTrangThai(dang_sua.trang_thai || 'sap_toi');
    } else {
      const khId = gia_tri_mac_dinh?.khach_hang_id || '';
      const tenKH = gia_tri_mac_dinh?.ten_khach_hang || '';
      const gioBD = gia_tri_mac_dinh?.gio_bat_dau || '09:00';
      setKhachHangId(khId);
      setTenKhachHang(tenKH);
      setTimKhachHang(tenKH);
      setTenNguoiLienHe(gia_tri_mac_dinh?.ten_nguoi_lien_he || '');
      setSoDienThoai(gia_tri_mac_dinh?.so_dien_thoai || '');
      setNgay(gia_tri_mac_dinh?.ngay || homNay);
      setGioBatDau(gioBD);
      setGioKetThuc(congThemPhut(gioBD, 90));
      setDiaDiem(gia_tri_mac_dinh?.dia_diem || '');
      setNoiDung(gia_tri_mac_dinh?.noi_dung || '');
      setKetQua('');
      setNguoiPhuTrachId(gia_tri_mac_dinh?.nguoi_phu_trach_id || nguoiDungId || '');
      setNguoiThamGiaIds([]);
      setTrangThai('sap_toi');
    }
    setMoGoiYKH(false);
  }, [mo, dang_sua, gia_tri_mac_dinh, homNay, nguoiDungId]);

  const mapNhanSu = useMemo(() => {
    const m = new Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => m.set(ns.id, ns));
    return m;
  }, [dsNhanSu]);

  const dsKHGoiY = useMemo(() => {
    const kw = timKhachHang.trim().toLowerCase();
    if (!kw) return dsKhachHang.slice(0, 8);
    return dsKhachHang
      .filter(
        (kh) =>
          kh.ten_khach_hang.toLowerCase().includes(kw) ||
          (kh.so_dien_thoai && kh.so_dien_thoai.includes(kw))
      )
      .slice(0, 8);
  }, [dsKhachHang, timKhachHang]);

  const chonKhachHang = (kh: KhachHang) => {
    setKhachHangId(kh.id);
    setTenKhachHang(kh.ten_khach_hang);
    setTimKhachHang(kh.ten_khach_hang);
    setMoGoiYKH(false);

    if (kh.dia_chi && !diaDiem) {
      setDiaDiem(kh.dia_chi);
    }

    const nlh = dsNguoiLienHe.find((x) => x.khach_hang_id === kh.id);
    if (nlh) {
      setTenNguoiLienHe(nlh.ho_va_ten || '');
      setSoDienThoai(nlh.so_dien_thoai || kh.so_dien_thoai || '');
    } else if (kh.so_dien_thoai) {
      setSoDienThoai(kh.so_dien_thoai);
    }
  };

  const thoiLuongHienTai = useMemo(
    () => tinhKhoangPhut(gioBatDau, gioKetThuc),
    [gioBatDau, gioKetThuc]
  );

  // Kiểm tra trùng lịch realtime
  const canhBaoTrung = useMemo(() => {
    const nsPhuTrach = mapNhanSu.get(nguoiPhuTrachId);
    const cnId = nsPhuTrach?.chi_nhanh_id || chiNhanhMacDinhId || null;
    return kiemTraTrungLich(
      dsLichHienCo,
      ngay,
      gioBatDau,
      gioKetThuc,
      nguoiPhuTrachId,
      cnId,
      dang_sua?.id || null
    );
  }, [dsLichHienCo, ngay, gioBatDau, gioKetThuc, nguoiPhuTrachId, mapNhanSu, chiNhanhMacDinhId, dang_sua?.id]);

  // Kiểm tra nhanh mỗi khung giờ xem đã có lịch trong ngày chưa
  const kiemTraSlotCoLich = (gio: string) => {
    const ketThucSlot = congThemPhut(gio, 60);
    const lichTrongNgay = dsLichHienCo.filter(
      (l) => !l.da_xoa && l.trang_thai !== 'huy' && l.ngay === ngay && l.id !== dang_sua?.id
    );
    const trungCaNhanSlot = lichTrongNgay.some(
      (l) =>
        (l.nguoi_phu_trach_id === nguoiPhuTrachId ||
          (l.nguoi_tham_gia_ids || []).includes(nguoiPhuTrachId)) &&
        gio < l.gio_ket_thuc &&
        l.gio_bat_dau < ketThucSlot
    );
    const trungChiNhanhSlot = lichTrongNgay.some(
      (l) => gio < l.gio_ket_thuc && l.gio_bat_dau < ketThucSlot
    );
    return { trungCaNhanSlot, trungChiNhanhSlot };
  };

  const toggleNguoiThamGia = (id: string) => {
    if (id === nguoiPhuTrachId) return;
    setNguoiThamGiaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tenKHChuan = (tenKhachHang || timKhachHang).trim();
    if (!tenKHChuan) {
      alert('Vui lòng chọn hoặc nhập tên khách hàng!');
      return;
    }
    if (!ngay || !gioBatDau) {
      alert('Vui lòng chọn ngày và giờ hẹn!');
      return;
    }

    const nsPhuTrach = mapNhanSu.get(nguoiPhuTrachId);
    const cnId =
      dang_sua?.chi_nhanh_id ||
      gia_tri_mac_dinh?.chi_nhanh_id ||
      nsPhuTrach?.chi_nhanh_id ||
      chiNhanhMacDinhId ||
      null;

    const payload: TaoMoiLichGapDTO = {
      tieu_de: `Gặp KH ${tenKHChuan}`,
      khach_hang_id: khachHangId || null,
      ten_khach_hang: tenKHChuan,
      nguoi_lien_he_id: gia_tri_mac_dinh?.nguoi_lien_he_id || dang_sua?.nguoi_lien_he_id || null,
      ten_nguoi_lien_he: tenNguoiLienHe.trim() || null,
      so_dien_thoai: soDienThoai.trim() || null,
      nguoi_phu_trach_id: nguoiPhuTrachId || nguoiDungId || '',
      nguoi_tham_gia_ids: nguoiThamGiaIds,
      chi_nhanh_id: cnId,
      ngay,
      gio_bat_dau: gioBatDau,
      gio_ket_thuc: gioKetThuc || congThemPhut(gioBatDau, 90),
      dia_diem: diaDiem.trim() || null,
      noi_dung: noiDung.trim() || null,
      ket_qua: ketQua.trim() || null,
      trang_thai: trangThai,
      nguon_lead_id: gia_tri_mac_dinh?.nguon_lead_id || dang_sua?.nguon_lead_id || null,
      du_an_id: dang_sua?.du_an_id || null,
      nguoi_tao_id: dang_sua?.nguoi_tao_id || nguoiDungId || ''
    };

    await khi_luu(payload);
  };

  if (!mo) return null;

  const coTrungCaNhan = canhBaoTrung.trungCaNhan.length > 0;
  const coTrungChiNhanh = canhBaoTrung.trungChiNhanh.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden max-h-[94vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header sang trọng */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-emerald-300 flex items-center justify-center shadow-inner">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  {dang_sua ? 'Chi tiết Lịch hẹn Khách hàng' : 'Đăng ký Lịch gặp Khách hàng'}
                </h3>
                {dang_sua && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-emerald-200 border border-white/15">
                    Cập nhật
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={khi_dong}
            className="size-8 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* KHỐI 1: THÔNG TIN KHÁCH HÀNG & ĐỊA ĐIỂM */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  <Building2 className="size-4 text-emerald-600" />
                  <span>Đơn vị / Khách hàng làm việc</span>
                </div>
                {khachHangId && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="size-3" />
                    Đã liên kết hồ sơ KH
                  </span>
                )}
              </div>

              {/* Ô chọn / nhập khách hàng */}
              <div className="relative" ref={dropdownKHRef}>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={timKhachHang}
                    onChange={(e) => {
                      setTimKhachHang(e.target.value);
                      setTenKhachHang(e.target.value);
                      setKhachHangId('');
                      setMoGoiYKH(true);
                    }}
                    onFocus={() => setMoGoiYKH(true)}
                    placeholder="Tìm chọn hoặc nhập tên cơ quan, đơn vị, khách hàng..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white text-sm font-semibold text-slate-900 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                    required
                  />
                  {timKhachHang ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTimKhachHang('');
                        setTenKhachHang('');
                        setKhachHangId('');
                        setMoGoiYKH(true);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  )}
                </div>

                {moGoiYKH && dsKHGoiY.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                    {dsKHGoiY.map((kh) => (
                      <button
                        key={kh.id}
                        type="button"
                        onClick={() => chonKhachHang(kh)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-emerald-50/80 transition flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                            {kh.ten_khach_hang}
                          </div>
                          {kh.dia_chi && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {kh.dia_chi}
                            </div>
                          )}
                        </div>
                        {kh.so_dien_thoai && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                            {kh.so_dien_thoai}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Người liên hệ & SĐT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={tenNguoiLienHe}
                    onChange={(e) => setTenNguoiLienHe(e.target.value)}
                    placeholder="Người đại diện / Liên hệ (VD: Anh Minh - Phó Phòng)"
                    className="w-full pl-10 pr-3 py-2 bg-white text-sm font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    placeholder="Số điện thoại liên hệ..."
                    className="w-full pl-10 pr-3 py-2 bg-white text-sm font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              {/* Địa điểm & Gợi ý nhanh */}
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={diaDiem}
                    onChange={(e) => setDiaDiem(e.target.value)}
                    placeholder="Địa điểm làm việc (Trụ sở UBND / Sở ngành / Văn phòng...)"
                    className="w-full pl-10 pr-3 py-2 bg-white text-sm font-medium text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DIA_DIEM_GOI_Y.map((dd) => (
                    <button
                      key={dd}
                      type="button"
                      onClick={() => setDiaDiem(dd)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                        diaDiem === dd
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-100'
                      )}
                    >
                      {dd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KHỐI 2: THỜI GIAN & KIỂM TRA TRÙNG LỊCH THÔNG MINH */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <Clock className="size-4 text-emerald-600" />
                <span>Thời gian hẹn gặp</span>
              </div>

              {/* Dòng chọn Ngày & Khoảng giờ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Ngày hẹn</label>
                  <input
                    type="date"
                    value={ngay}
                    onChange={(e) => setNgay(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-sm font-bold text-slate-900 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Khung giờ</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={gioBatDau}
                      onChange={(e) => {
                        setGioBatDau(e.target.value);
                        setGioKetThuc(congThemPhut(e.target.value, thoiLuongHienTai));
                      }}
                      className="w-full px-3 py-2 bg-white text-sm font-bold text-slate-900 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      required
                    />
                    <ArrowRight className="size-4 text-slate-400 shrink-0" />
                    <input
                      type="time"
                      value={gioKetThuc}
                      onChange={(e) => setGioKetThuc(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-sm font-bold text-slate-900 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* CẢNH BÁO TRÙNG LỊCH CHI TIẾT */}
              {(coTrungCaNhan || coTrungChiNhanh) && (
                <div className="space-y-2 pt-1">
                  {coTrungCaNhan && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-700">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Trùng lịch cá nhân của nhân sự chủ trì:</span>
                      </div>
                      {canhBaoTrung.trungCaNhan.map((l) => (
                        <div key={l.id} className="pl-5 font-semibold">
                          • {l.gio_bat_dau} – {l.gio_ket_thuc}: {l.ten_khach_hang}
                        </div>
                      ))}
                    </div>
                  )}

                  {coTrungChiNhanh && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Clock className="size-4 shrink-0" />
                        <span>Lịch công tác cùng khung giờ tại Chi nhánh:</span>
                      </div>
                      {canhBaoTrung.trungChiNhanh.map((l) => {
                        const ns = mapNhanSu.get(l.nguoi_phu_trach_id);
                        return (
                          <div key={l.id} className="pl-5 font-medium">
                            • {l.gio_bat_dau} – {l.gio_ket_thuc}:{' '}
                            <span className="font-bold">{ns?.ho_va_ten || 'NV'}</span> làm việc với{' '}
                            <span className="font-semibold">{l.ten_khach_hang}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KHỐI 3: NHÂN SỰ THAM GIA & NỘI DUNG CÔNG VIỆC */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Nhân sự chủ trì */}
                <div className="sm:col-span-5">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    <UserRound className="size-4 text-emerald-600" />
                    <span>Nhân sự chủ trì</span>
                  </label>
                  <select
                    value={nguoiPhuTrachId}
                    onChange={(e) => {
                      const idMoi = e.target.value;
                      setNguoiPhuTrachId(idMoi);
                      setNguoiThamGiaIds((prev) => prev.filter((x) => x !== idMoi));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-sm font-bold text-slate-900 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    {dsNhanSu.map((ns) => (
                      <option key={ns.id} value={ns.id}>
                        {ns.ho_va_ten}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thành viên đi cùng */}
                <div className="sm:col-span-7">
                  <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-emerald-600" />
                      <span>Cùng tham gia</span>
                    </span>
                    {nguoiThamGiaIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        +{nguoiThamGiaIds.length} thành viên
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-1.5 flex-wrap max-h-48 sm:max-h-32 overflow-y-auto p-2 rounded-xl border border-slate-200/90 bg-white">
                    {dsNhanSu
                      .filter((ns) => ns.id !== nguoiPhuTrachId)
                      .map((ns) => {
                        const daChon = nguoiThamGiaIds.includes(ns.id);
                        return (
                          <button
                            key={ns.id}
                            type="button"
                            onClick={() => toggleNguoiThamGia(ns.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer',
                              daChon
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                            )}
                          >
                            <span
                              className={cn(
                                'size-4 rounded-md text-[9px] font-black flex items-center justify-center shrink-0',
                                daChon ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                              )}
                            >
                              {daChon ? <Check className="size-2.5" /> : layChuCaiDau(ns.ho_va_ten)}
                            </span>
                            <span className="truncate max-w-[130px]">{ns.ho_va_ten}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Nội dung chuẩn bị */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  <FileText className="size-4 text-emerald-600" />
                  <span>Nội dung làm việc & Chuẩn bị</span>
                </label>
                <textarea
                  rows={2}
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  placeholder="Mục tiêu buổi làm việc, giải pháp demo, hồ sơ báo giá cần chuẩn bị..."
                  className="w-full px-3.5 py-2.5 bg-white text-sm font-medium text-slate-800 rounded-xl border border-slate-200 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* KHỐI 4: CẬP NHẬT TRẠNG THÁI & KẾT QUẢ (KHI CHỈNH SỬA) */}
            {dang_sua && (
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3.5">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Trạng thái lịch hẹn
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DANH_SACH_TRANG_THAI_LICH_GAP.map((tt) => (
                    <button
                      key={tt.key}
                      type="button"
                      onClick={() => setTrangThai(tt.key)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer flex items-center justify-center gap-1.5',
                        trangThai === tt.key
                          ? cn(tt.mauBadge, 'ring-2 ring-slate-900/10 shadow-2xs')
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn('size-2 rounded-full', tt.mauDot)} />
                      <span>{tt.tieu_de}</span>
                    </button>
                  ))}
                </div>

                {trangThai === 'da_hoan_thanh' && (
                  <div className="pt-1">
                    <label className="block text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-1.5">
                      Kết quả buổi làm việc
                    </label>
                    <textarea
                      rows={2}
                      value={ketQua}
                      onChange={(e) => setKetQua(e.target.value)}
                      placeholder="Ghi nhận phản hồi của khách hàng, bước tiếp theo..."
                      className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-emerald-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            {dang_sua && khi_xoa ? (
              <button
                type="button"
                onClick={() => khi_xoa(dang_sua.id, dang_sua.ten_khach_hang)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
              >
                <Trash2 className="size-4" />
                <span>Xóa lịch</span>
              </button>
            ) : (
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Lịch sẽ hiển thị trên bảng điều hành Chi nhánh
              </div>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={khi_dong}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={dang_xu_ly}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="size-4" />
                <span>{dang_xu_ly ? 'Đang lưu...' : dang_sua ? 'Lưu cập nhật' : 'Đăng ký lịch hẹn'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
