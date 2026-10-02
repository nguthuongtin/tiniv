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
  Trash2,
  Phone,
  Check,
  ArrowRight,
  ChevronDown,
  Search,
  UserPlus,
  Save
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Ban_Ve, DaiDien, Nut } from '../ui';
import type {
  LichGapKH,
  TrangThaiLichGap
} from '../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP } from '../../thu_vien/types/lich_gap_kh';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import {
  kiemTraTrungLich,
  type TaoMoiLichGapDTO,
  type CapNhatLichGapDTO
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';

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

const inputCls =
  'w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs';

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

  const dropdownKHRef = useRef<HTMLDivElement>(null);
  const dropdownNLHRef = useRef<HTMLDivElement>(null);
  const dropdownNSRef = useRef<HTMLDivElement>(null);

  const [khachHangId, setKhachHangId] = useState<string>('');
  const [tenKhachHang, setTenKhachHang] = useState<string>('');
  const [timKhachHang, setTimKhachHang] = useState<string>('');
  const [dangGoTimKH, setDangGoTimKH] = useState(false);
  const [moGoiYKH, setMoGoiYKH] = useState(false);

  const [nguoiLienHeId, setNguoiLienHeId] = useState<string>('');
  const [tenNguoiLienHe, setTenNguoiLienHe] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [moGoiYNLH, setMoGoiYNLH] = useState(false);
  const [dsLienHeRiengKH, setDsLienHeRiengKH] = useState<NguoiLienHe[]>([]);

  const [ngay, setNgay] = useState<string>(homNay);
  const [gioBatDau, setGioBatDau] = useState<string>('09:00');
  const [gioKetThuc, setGioKetThuc] = useState<string>('10:30');
  const [diaDiem, setDiaDiem] = useState<string>('');
  const [noiDung, setNoiDung] = useState<string>('');
  const [ketQua, setKetQua] = useState<string>('');
  const [nguoiPhuTrachId, setNguoiPhuTrachId] = useState<string>('');
  const [nguoiThamGiaIds, setNguoiThamGiaIds] = useState<string[]>([]);
  const [trangThai, setTrangThai] = useState<TrangThaiLichGap>('sap_toi');

  const [timKiemNS, setTimKiemNS] = useState<string>('');
  const [moGoiYNS, setMoGoiYNS] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownKHRef.current && !dropdownKHRef.current.contains(e.target as Node)) {
        setMoGoiYKH(false);
      }
      if (dropdownNLHRef.current && !dropdownNLHRef.current.contains(e.target as Node)) {
        setMoGoiYNLH(false);
      }
      if (dropdownNSRef.current && !dropdownNSRef.current.contains(e.target as Node)) {
        setMoGoiYNS(false);
      }
    };
    if (moGoiYKH || moGoiYNLH || moGoiYNS) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moGoiYKH, moGoiYNLH, moGoiYNS]);

  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      setKhachHangId(dang_sua.khach_hang_id || '');
      setTenKhachHang(dang_sua.ten_khach_hang || '');
      setTimKhachHang(dang_sua.ten_khach_hang || '');
      setNguoiLienHeId(dang_sua.nguoi_lien_he_id || '');
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
      setNguoiLienHeId(gia_tri_mac_dinh?.nguoi_lien_he_id || '');
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
    setDangGoTimKH(false);
    setMoGoiYKH(false);
    setMoGoiYNLH(false);
    setMoGoiYNS(false);
    setTimKiemNS('');
  }, [mo, dang_sua, gia_tri_mac_dinh, homNay, nguoiDungId]);

  // Tải đầy đủ danh sách người liên hệ của khách hàng đang chọn từ Firestore
  useEffect(() => {
    if (!mo || !khachHangId) {
      setDsLienHeRiengKH([]);
      return;
    }
    let huy = false;
    void (async () => {
      try {
        const kq = await danhSachNguoiLienHe({ khach_hang_id: khachHangId });
        if (!huy) {
          setDsLienHeRiengKH(kq.mang || []);
        }
      } catch {
        if (!huy) setDsLienHeRiengKH([]);
      }
    })();
    return () => {
      huy = true;
    };
  }, [mo, khachHangId]);

  // Gộp danh sách liên hệ từ prop và từ truy vấn trực tiếp theo khach_hang_id
  const dsLienHeCuaKH = useMemo(() => {
    if (!khachHangId) return [];
    const map = new Map<string, NguoiLienHe>();
    dsNguoiLienHe
      .filter((x) => x.khach_hang_id === khachHangId)
      .forEach((x) => map.set(x.id, x));
    dsLienHeRiengKH.forEach((x) => map.set(x.id, x));
    return Array.from(map.values());
  }, [khachHangId, dsNguoiLienHe, dsLienHeRiengKH]);

  const mapNhanSu = useMemo(() => {
    const m = new Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => m.set(ns.id, ns));
    return m;
  }, [dsNhanSu]);

  // Danh sách khách hàng hiển thị đầy đủ (không cắt 8 dòng như trước)
  const dsKHGoiY = useMemo(() => {
    if (!dangGoTimKH) return dsKhachHang;
    const kw = timKhachHang.trim().toLowerCase();
    if (!kw) return dsKhachHang;
    return dsKhachHang.filter(
      (kh) =>
        kh.ten_khach_hang.toLowerCase().includes(kw) ||
        (kh.so_dien_thoai && kh.so_dien_thoai.includes(kw)) ||
        (kh.dia_chi && kh.dia_chi.toLowerCase().includes(kw))
    );
  }, [dsKhachHang, timKhachHang, dangGoTimKH]);

  const chonKhachHang = async (kh: KhachHang) => {
    setKhachHangId(kh.id);
    setTenKhachHang(kh.ten_khach_hang);
    setTimKhachHang(kh.ten_khach_hang);
    setDangGoTimKH(false);
    setMoGoiYKH(false);

    if (kh.dia_chi) {
      setDiaDiem(kh.dia_chi);
    }

    // Tìm các liên hệ hiện có của khách hàng
    let listNLH = dsNguoiLienHe.filter((x) => x.khach_hang_id === kh.id);
    try {
      const kq = await danhSachNguoiLienHe({ khach_hang_id: kh.id });
      if (kq.mang && kq.mang.length > 0) {
        const m = new Map<string, NguoiLienHe>();
        listNLH.forEach((x) => m.set(x.id, x));
        kq.mang.forEach((x) => m.set(x.id, x));
        listNLH = Array.from(m.values());
        setDsLienHeRiengKH(kq.mang);
      }
    } catch {}

    if (listNLH.length === 1) {
      setNguoiLienHeId(listNLH[0].id);
      setTenNguoiLienHe(listNLH[0].ho_va_ten || '');
      setSoDienThoai(listNLH[0].so_dien_thoai || kh.so_dien_thoai || '');
    } else if (listNLH.length > 1) {
      // Nếu có nhiều người liên hệ: điền người đầu tiên và tự mở danh sách để chọn ngay
      setNguoiLienHeId(listNLH[0].id);
      setTenNguoiLienHe(listNLH[0].ho_va_ten || '');
      setSoDienThoai(listNLH[0].so_dien_thoai || kh.so_dien_thoai || '');
      setMoGoiYNLH(true);
    } else {
      setNguoiLienHeId('');
      setTenNguoiLienHe('');
      setSoDienThoai(kh.so_dien_thoai || '');
    }
  };

  const chonNguoiLienHe = (nlh: NguoiLienHe) => {
    setNguoiLienHeId(nlh.id);
    setTenNguoiLienHe(nlh.ho_va_ten || '');
    if (nlh.so_dien_thoai) {
      setSoDienThoai(nlh.so_dien_thoai);
    }
    setMoGoiYNLH(false);
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

  const toggleNguoiThamGia = (id: string) => {
    if (id === nguoiPhuTrachId) return;
    setNguoiThamGiaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const dsNhanSuKhaDung = useMemo(() => {
    const kw = timKiemNS.trim().toLowerCase();
    return dsNhanSu.filter((ns) => {
      if (ns.id === nguoiPhuTrachId) return false;
      if (!kw) return true;
      return (
        ns.ho_va_ten.toLowerCase().includes(kw) ||
        (ns.chuc_vu && ns.chuc_vu.toLowerCase().includes(kw))
      );
    });
  }, [dsNhanSu, nguoiPhuTrachId, timKiemNS]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      nguoi_lien_he_id: nguoiLienHeId || gia_tri_mac_dinh?.nguoi_lien_he_id || dang_sua?.nguoi_lien_he_id || null,
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

  const coTrungCaNhan = canhBaoTrung.trungCaNhan.length > 0;
  const coTrungChiNhanh = canhBaoTrung.trungChiNhanh.length > 0;

  return (
    <Ban_Ve
      mo={mo}
      onDong={khi_dong}
      kich_thuoc="lg"
      tieu_de={
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Calendar className="size-4.5" />
          </div>
          <span className="font-bold text-slate-900 text-base sm:text-lg">
            {dang_sua ? 'Cập nhật lịch hẹn' : 'Đăng ký lịch hẹn'}
          </span>
        </div>
      }
      cuoi={
        <div className="w-full flex items-center justify-between gap-2.5">
          <div>
            {dang_sua && khi_xoa && (
              <button
                type="button"
                onClick={() => khi_xoa(dang_sua.id, dang_sua.ten_khach_hang)}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition cursor-pointer"
              >
                <Trash2 className="size-4" />
                <span>Xóa</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Nut kieu="outline" kich_thuoc="md" type="button" onClick={khi_dong} disabled={dang_xu_ly}>
              Hủy
            </Nut>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={dang_xu_ly}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-bold transition disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Save className="size-4" />
              <span>{dang_xu_ly ? 'Đang lưu...' : dang_sua ? 'Lưu thay đổi' : 'Lưu lịch hẹn'}</span>
            </button>
          </div>
        </div>
      }
    >
      <form id="form-lich-gap-kh" onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Khách hàng */}
        <div className="space-y-1.5" ref={dropdownKHRef}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              Khách hàng / Đơn vị <span className="text-rose-500">*</span>
            </label>
            {khachHangId && (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="size-3" /> Đã liên kết KH
              </span>
            )}
          </div>

          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={timKhachHang}
              onChange={(e) => {
                setTimKhachHang(e.target.value);
                setTenKhachHang(e.target.value);
                setKhachHangId('');
                setDangGoTimKH(true);
                setMoGoiYKH(true);
              }}
              onFocus={() => setMoGoiYKH(true)}
              placeholder="Tìm chọn khách hàng hoặc nhập tên đơn vị..."
              className={cn(inputCls, 'pl-10 pr-9 font-medium')}
              required
            />
            {timKhachHang ? (
              <button
                type="button"
                onClick={() => {
                  setTimKhachHang('');
                  setTenKhachHang('');
                  setKhachHangId('');
                  setDsLienHeRiengKH([]);
                  setDangGoTimKH(false);
                  setMoGoiYKH(true);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            )}

            {moGoiYKH && dsKHGoiY.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Danh sách khách hàng ({dsKHGoiY.length})</span>
                  <span>Cuộn để xem thêm</span>
                </div>
                {dsKHGoiY.map((kh) => {
                  const dangChon = kh.id === khachHangId;
                  return (
                    <button
                      key={kh.id}
                      type="button"
                      onClick={() => void chonKhachHang(kh)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg transition flex items-center justify-between gap-3 cursor-pointer',
                        dangChon ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {kh.ten_khach_hang}
                        </div>
                        {kh.dia_chi && (
                          <div className="text-xs text-slate-400 truncate mt-0.5">{kh.dia_chi}</div>
                        )}
                      </div>
                      {kh.so_dien_thoai && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {kh.so_dien_thoai}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Người liên hệ & Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5" ref={dropdownNLHRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Người liên hệ</label>
              {dsLienHeCuaKH.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMoGoiYNLH((v) => !v)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Chọn từ {dsLienHeCuaKH.length} liên hệ</span>
                  <ChevronDown className="size-3" />
                </button>
              )}
            </div>

            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={tenNguoiLienHe}
                onChange={(e) => {
                  setTenNguoiLienHe(e.target.value);
                  setNguoiLienHeId('');
                }}
                onFocus={() => {
                  if (dsLienHeCuaKH.length > 0) setMoGoiYNLH(true);
                }}
                placeholder={
                  dsLienHeCuaKH.length > 0
                    ? 'Chọn liên hệ có sẵn hoặc nhập mới...'
                    : 'Họ tên người liên hệ...'
                }
                className={cn(inputCls, 'pl-10', dsLienHeCuaKH.length > 0 && 'pr-8')}
              />
              {dsLienHeCuaKH.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMoGoiYNLH((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <ChevronDown className="size-4" />
                </button>
              )}

              {moGoiYNLH && dsLienHeCuaKH.length > 0 && (
                <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 p-1">
                  {dsLienHeCuaKH.map((nlh) => {
                    const dangChon =
                      (nguoiLienHeId && nguoiLienHeId === nlh.id) ||
                      tenNguoiLienHe === nlh.ho_va_ten;
                    return (
                      <button
                        key={nlh.id}
                        type="button"
                        onClick={() => chonNguoiLienHe(nlh)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between gap-2 cursor-pointer',
                          dangChon ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {nlh.ho_va_ten}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {[nlh.chuc_vu, nlh.so_dien_thoai].filter(Boolean).join(' • ') ||
                              'Chưa có SĐT'}
                          </div>
                        </div>
                        {dangChon && <Check className="size-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="Số điện thoại liên hệ..."
                className={cn(inputCls, 'pl-10')}
              />
            </div>
          </div>
        </div>

        {/* 3. Ngày hẹn & Khung giờ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Ngày hẹn <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={ngay}
              onChange={(e) => setNgay(e.target.value)}
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Khung giờ <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={gioBatDau}
                onChange={(e) => {
                  setGioBatDau(e.target.value);
                  setGioKetThuc(congThemPhut(e.target.value, thoiLuongHienTai));
                }}
                className={inputCls}
                required
              />
              <ArrowRight className="size-4 text-slate-400 shrink-0" />
              <input
                type="time"
                value={gioKetThuc}
                onChange={(e) => setGioKetThuc(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Cảnh báo trùng lịch (chỉ hiển thị khi phát sinh trùng) */}
        {(coTrungCaNhan || coTrungChiNhanh) && (
          <div className="space-y-2">
            {coTrungCaNhan && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Trùng lịch cá nhân của nhân sự chủ trì:</span>
                </div>
                {canhBaoTrung.trungCaNhan.map((l) => (
                  <div key={l.id} className="pl-5 font-medium">
                    • {l.gio_bat_dau} – {l.gio_ket_thuc}: {l.ten_khach_hang}
                  </div>
                ))}
              </div>
            )}

            {coTrungChiNhanh && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Clock className="size-4 shrink-0" />
                  <span>Lịch cùng khung giờ tại Chi nhánh:</span>
                </div>
                {canhBaoTrung.trungChiNhanh.map((l) => {
                  const ns = mapNhanSu.get(l.nguoi_phu_trach_id);
                  return (
                    <div key={l.id} className="pl-5 font-medium">
                      • {l.gio_bat_dau} – {l.gio_ket_thuc}:{' '}
                      <span className="font-semibold">{ns?.ho_va_ten || 'NV'}</span> —{' '}
                      <span>{l.ten_khach_hang}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. Địa điểm */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">Địa điểm làm việc</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={diaDiem}
              onChange={(e) => setDiaDiem(e.target.value)}
              placeholder="Nhập địa chỉ cơ quan, văn phòng hoặc hình thức họp..."
              className={cn(inputCls, 'pl-10')}
            />
          </div>
        </div>

        {/* 5. Nhân sự chủ trì & Cùng tham gia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Nhân sự chủ trì</label>
            <select
              value={nguoiPhuTrachId}
              onChange={(e) => {
                const idMoi = e.target.value;
                setNguoiPhuTrachId(idMoi);
                setNguoiThamGiaIds((prev) => prev.filter((x) => x !== idMoi));
              }}
              className={cn(inputCls, 'cursor-pointer')}
            >
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten} {ns.chuc_vu ? `(${ns.chuc_vu})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cùng tham gia: Avatar Pills + Popover Picker hiện đại */}
          <div className="space-y-1.5 relative" ref={dropdownNSRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Cùng tham gia</label>
              {nguoiThamGiaIds.length > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700">
                  Đã chọn {nguoiThamGiaIds.length} người
                </span>
              )}
            </div>

            <div
              onClick={() => setMoGoiYNS(true)}
              className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 flex items-center flex-wrap gap-1.5 cursor-pointer hover:border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition shadow-2xs"
            >
              {nguoiThamGiaIds.map((id) => {
                const ns = mapNhanSu.get(id);
                if (!ns) return null;
                return (
                  <span
                    key={id}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80"
                  >
                    <DaiDien
                      ten={ns.ho_va_ten}
                      anh={ns.url_anh_dai_dien}
                      kich_thuoc="xs"
                      className="size-5 text-[9px] ring-0"
                    />
                    <span className="max-w-[110px] truncate">{ns.ho_va_ten}</span>
                    <button
                      type="button"
                      onClick={() => toggleNguoiThamGia(id)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoGoiYNS((v) => !v);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
              >
                <UserPlus className="size-3.5" />
                <span>{nguoiThamGiaIds.length === 0 ? 'Thêm thành viên...' : 'Thêm'}</span>
              </button>
            </div>

            {moGoiYNS && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                  <Search className="size-3.5 text-slate-400 ml-1.5 shrink-0" />
                  <input
                    type="text"
                    value={timKiemNS}
                    onChange={(e) => setTimKiemNS(e.target.value)}
                    placeholder="Tìm nhanh theo tên hoặc chức vụ..."
                    className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none py-1"
                    autoFocus
                  />
                  {timKiemNS && (
                    <button
                      type="button"
                      onClick={() => setTimKiemNS('')}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto p-1 divide-y divide-slate-50">
                  {dsNhanSuKhaDung.length > 0 ? (
                    dsNhanSuKhaDung.map((ns) => {
                      const daChon = nguoiThamGiaIds.includes(ns.id);
                      return (
                        <button
                          key={ns.id}
                          type="button"
                          onClick={() => toggleNguoiThamGia(ns.id)}
                          className={cn(
                            'w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between gap-2.5 cursor-pointer',
                            daChon ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <DaiDien
                              ten={ns.ho_va_ten}
                              anh={ns.url_anh_dai_dien}
                              kich_thuoc="xs"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">
                                {ns.ho_va_ten}
                              </div>
                              {ns.chuc_vu && (
                                <div className="text-[11px] text-slate-500 truncate">
                                  {ns.chuc_vu}
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={cn(
                              'size-4.5 rounded-md border flex items-center justify-center shrink-0 transition',
                              daChon
                                ? 'bg-emerald-700 border-emerald-700 text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {daChon && <Check className="size-3" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Không tìm thấy nhân sự phù hợp
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Nội dung công việc */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Nội dung làm việc & Chuẩn bị
          </label>
          <textarea
            rows={2}
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            placeholder="Mục tiêu buổi gặp, nội dung trao đổi, tài liệu cần chuẩn bị..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
          />
        </div>

        {/* 7. Trạng thái & Kết quả (khi cập nhật lịch hẹn) */}
        {dang_sua && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Trạng thái lịch hẹn</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DANH_SACH_TRANG_THAI_LICH_GAP.map((tt) => (
                  <button
                    key={tt.key}
                    type="button"
                    onClick={() => setTrangThai(tt.key)}
                    className={cn(
                      'h-9 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer flex items-center justify-center gap-1.5',
                      trangThai === tt.key
                        ? cn(tt.mauBadge, 'ring-2 ring-slate-900/10')
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <span className={cn('size-2 rounded-full', tt.mauDot)} />
                    <span>{tt.tieu_de}</span>
                  </button>
                ))}
              </div>
            </div>

            {trangThai === 'da_hoan_thanh' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-emerald-700">
                  Kết quả buổi làm việc
                </label>
                <textarea
                  rows={2}
                  value={ketQua}
                  onChange={(e) => setKetQua(e.target.value)}
                  placeholder="Ghi nhận phản hồi của khách hàng, bước tiếp theo..."
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}
          </div>
        )}
      </form>
    </Ban_Ve>
  );
}
