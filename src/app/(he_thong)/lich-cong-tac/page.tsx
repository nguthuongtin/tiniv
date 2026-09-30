'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  UserRound,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Users,
  Building2,
  Loader2,
  RotateCcw,
  LayoutGrid,
  Columns3,
  ListFilter
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import type { LichGapKH, TrangThaiLichGap } from '../../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP } from '../../../thu_vien/types/lich_gap_kh';
import type { KhachHang, NguoiLienHe } from '../../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh } from '../../../thu_vien/types/nhan_su';
import {
  danhSachLichGapKH,
  langNgheLichGapKH,
  taoLichGapKHMoi,
  capNhatLichGapKH,
  xoaLichGapKH,
  type TaoMoiLichGapDTO,
  type CapNhatLichGapDTO
} from '../../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { danhSachKhachHang } from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import FormLichGapModal, {
  type GiaTriMacDinhLichGap
} from '../../../thanh_phan/lich_gap_kh/form_lich_gap_modal';
import { Bo_Cuc_Trang, Nut, DaiDien } from '../../../thanh_phan/ui';

type CheDoXem = 'tuan' | 'thang' | 'danh_sach';

// Bảng màu phân biệt theo nhân viên trên Google Calendar
const BANG_MAU_NHAN_VIEN = [
  {
    bg: 'bg-blue-50/90 hover:bg-blue-100/90',
    border: 'border-blue-200 border-l-4 border-l-blue-600',
    text: 'text-blue-900',
    sub: 'text-blue-700',
    dot: 'bg-blue-600'
  },
  {
    bg: 'bg-emerald-50/90 hover:bg-emerald-100/90',
    border: 'border-emerald-200 border-l-4 border-l-emerald-600',
    text: 'text-emerald-900',
    sub: 'text-emerald-700',
    dot: 'bg-emerald-600'
  },
  {
    bg: 'bg-purple-50/90 hover:bg-purple-100/90',
    border: 'border-purple-200 border-l-4 border-l-purple-600',
    text: 'text-purple-900',
    sub: 'text-purple-700',
    dot: 'bg-purple-600'
  },
  {
    bg: 'bg-amber-50/90 hover:bg-amber-100/90',
    border: 'border-amber-200 border-l-4 border-l-amber-500',
    text: 'text-amber-900',
    sub: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  {
    bg: 'bg-rose-50/90 hover:bg-rose-100/90',
    border: 'border-rose-200 border-l-4 border-l-rose-500',
    text: 'text-rose-900',
    sub: 'text-rose-700',
    dot: 'bg-rose-500'
  },
  {
    bg: 'bg-cyan-50/90 hover:bg-cyan-100/90',
    border: 'border-cyan-200 border-l-4 border-l-cyan-600',
    text: 'text-cyan-900',
    sub: 'text-cyan-700',
    dot: 'bg-cyan-600'
  },
  {
    bg: 'bg-indigo-50/90 hover:bg-indigo-100/90',
    border: 'border-indigo-200 border-l-4 border-l-indigo-600',
    text: 'text-indigo-900',
    sub: 'text-indigo-700',
    dot: 'bg-indigo-600'
  }
];

const layMauTheoNhanVien = (nhanVienId: string) => {
  if (!nhanVienId) return BANG_MAU_NHAN_VIEN[0];
  let hash = 0;
  for (let i = 0; i < nhanVienId.length; i++) {
    hash = nhanVienId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BANG_MAU_NHAN_VIEN[Math.abs(hash) % BANG_MAU_NHAN_VIEN.length];
};

const chuyenDateSangISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const layDanhSach7NgayTrongTuan = (ngayGocISO: string): { iso: string; thu: string; ngayThang: string; laHomNay: boolean }[] => {
  const homNayISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const [y, m, d] = ngayGocISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0 (CN) -> 6 (T7)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(y, m - 1, d + diffToMonday);

  const TEN_THU = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  return Array.from({ length: 7 }, (_, idx) => {
    const cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
    const iso = chuyenDateSangISO(cur);
    return {
      iso,
      thu: TEN_THU[idx],
      ngayThang: `${String(cur.getDate()).padStart(2, '0')}/${String(cur.getMonth() + 1).padStart(2, '0')}`,
      laHomNay: iso === homNayISO
    };
  });
};

const layLuoiNgayTrongThang = (ngayGocISO: string): { iso: string; ngaySo: number; trongThang: boolean; laHomNay: boolean }[] => {
  const homNayISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const [y, m] = ngayGocISO.split('-').map(Number);
  const dauThang = new Date(y, m - 1, 1);
  const cuoiThang = new Date(y, m, 0);

  const thuDauThang = dauThang.getDay(); // 0..6
  const soNgayTruoc = thuDauThang === 0 ? 6 : thuDauThang - 1;

  const batDau = new Date(y, m - 1, 1 - soNgayTruoc);
  const tongO = soNgayTruoc + cuoiThang.getDate() > 35 ? 42 : 35;

  return Array.from({ length: tongO }, (_, idx) => {
    const cur = new Date(batDau.getFullYear(), batDau.getMonth(), batDau.getDate() + idx);
    const iso = chuyenDateSangISO(cur);
    return {
      iso,
      ngaySo: cur.getDate(),
      trongThang: cur.getMonth() === m - 1,
      laHomNay: iso === homNayISO
    };
  });
};

export default function TrangLichCongTac() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const homNayISO = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()),
    []
  );

  // Dữ liệu
  const [dsLich, setDsLich] = useState<LichGapKH[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  // Điều khiển Calendar & Bộ lọc
  const [cheDoXem, setCheDoXem] = useState<CheDoXem>('tuan');
  const [ngayDangXem, setNgayDangXem] = useState<string>(homNayISO);
  const [ngayChonTrongThang, setNgayChonTrongThang] = useState<string>(homNayISO);
  const [chiNhanhLoc, setChiNhanhLoc] = useState<string>('tat_ca');
  const [nhanSuLoc, setNhanSuLoc] = useState<string>('tat_ca');

  useEffect(() => {
    setNgayChonTrongThang(ngayDangXem);
  }, [ngayDangXem]);

  // Modal tạo/sửa lịch
  const [moModal, setMoModal] = useState(false);
  const [lichDangSua, setLichDangSua] = useState<LichGapKH | null>(null);
  const [giaTriMacDinhModal, setGiaTriMacDinhModal] = useState<GiaTriMacDinhLichGap | null>(null);

  const taiDanhMuc = useCallback(async () => {
    try {
      const [khs, nlhs, nss, cns] = await Promise.all([
        danhSachKhachHang(),
        danhSachNguoiLienHe(),
        danhSachNhanSu(),
        danhSachChiNhanh()
      ]);
      setDsKhachHang(Array.isArray(khs) ? khs : (khs as any)?.mang || []);
      setDsNguoiLienHe(Array.isArray(nlhs) ? nlhs : (nlhs as any)?.mang || []);
      const mangNS = Array.isArray(nss) ? nss : (nss as any)?.mang || [];
      setDsNhanSu(mangNS.filter((ns: NhanSu) => ns.trang_thai_du_lieu !== 'da_xoa' && ns.trang_thai !== false));
      setDsChiNhanh(Array.isArray(cns) ? cns : (cns as any)?.mang || []);
    } catch (e) {
      console.error('Lỗi tải danh mục:', e);
    }
  }, []);

  const taiDanhSachLich = useCallback(async () => {
    const data = await danhSachLichGapKH();
    setDsLich(data);
    setDangTai(false);
  }, []);

  useEffect(() => {
    if (!nguoiDungHienTai?.id) return;
    void taiDanhMuc();
    const unsub = langNgheLichGapKH((data) => {
      setDsLich(data);
      setDangTai(false);
    });
    return () => unsub();
  }, [taiDanhMuc, nguoiDungHienTai?.id]);

  const mapNhanSu = useMemo(() => {
    const m = new Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => m.set(ns.id, ns));
    return m;
  }, [dsNhanSu]);

  const mapChiNhanh = useMemo(() => {
    const m = new Map<string, ChiNhanh>();
    dsChiNhanh.forEach((cn) => m.set(cn.id, cn));
    return m;
  }, [dsChiNhanh]);

  // Lọc danh sách lịch theo Chi nhánh & Nhân viên
  const dsLichLoc = useMemo(() => {
    return dsLich.filter((l) => {
      if (chiNhanhLoc !== 'tat_ca' && l.chi_nhanh_id !== chiNhanhLoc) {
        const ns = mapNhanSu.get(l.nguoi_phu_trach_id);
        if (ns?.chi_nhanh_id !== chiNhanhLoc) return false;
      }
      if (nhanSuLoc !== 'tat_ca') {
        const laChuTri = l.nguoi_phu_trach_id === nhanSuLoc;
        const laThamGia = l.nguoi_tham_gia_ids?.includes(nhanSuLoc);
        if (!laChuTri && !laThamGia) return false;
      }
      return true;
    });
  }, [dsLich, chiNhanhLoc, nhanSuLoc, mapNhanSu]);

  // 7 ngày của tuần đang xem
  const ds7NgayTuan = useMemo(() => layDanhSach7NgayTrongTuan(ngayDangXem), [ngayDangXem]);
  const luoiNgayThang = useMemo(() => layLuoiNgayTrongThang(ngayDangXem), [ngayDangXem]);

  // Thống kê tổng quan
  const thongKe = useMemo(() => {
    const dauTuan = ds7NgayTuan[0]?.iso || homNayISO;
    const cuoiTuan = ds7NgayTuan[6]?.iso || homNayISO;
    const thangHienTai = ngayDangXem.slice(0, 7);

    const lichHomNay = dsLichLoc.filter((l) => l.ngay === homNayISO && l.trang_thai !== 'huy').length;
    const lichTuanNay = dsLichLoc.filter(
      (l) => l.ngay >= dauTuan && l.ngay <= cuoiTuan && l.trang_thai !== 'huy'
    ).length;
    const lichThangNay = dsLichLoc.filter(
      (l) => l.ngay.startsWith(thangHienTai) && l.trang_thai !== 'huy'
    ).length;
    const daHoanThanh = dsLichLoc.filter(
      (l) => l.ngay.startsWith(thangHienTai) && l.trang_thai === 'da_hoan_thanh'
    ).length;

    return { lichHomNay, lichTuanNay, lichThangNay, daHoanThanh };
  }, [dsLichLoc, ds7NgayTuan, homNayISO, ngayDangXem]);

  // Chuyển tuần / tháng trước - sau
  const diChuyenThoiGian = (huong: -1 | 1) => {
    const [y, m, d] = ngayDangXem.split('-').map(Number);
    if (cheDoXem === 'thang') {
      const next = new Date(y, m - 1 + huong, 1);
      setNgayDangXem(chuyenDateSangISO(next));
    } else {
      const next = new Date(y, m - 1, d + huong * 7);
      setNgayDangXem(chuyenDateSangISO(next));
    }
  };

  const tieuDeThoiGian = useMemo(() => {
    const [y, m] = ngayDangXem.split('-').map(Number);
    if (cheDoXem === 'thang') {
      return `Tháng ${m}, ${y}`;
    }
    const d1 = ds7NgayTuan[0];
    const d7 = ds7NgayTuan[6];
    return `${d1.ngayThang} – ${d7.ngayThang}/${y}`;
  }, [ngayDangXem, cheDoXem, ds7NgayTuan]);

  // Mở modal thêm nhanh vào ngày + giờ cụ thể
  const handleMoThemNhanh = (ngayChon?: string, gioChon?: string) => {
    setLichDangSua(null);
    setGiaTriMacDinhModal({
      ngay: ngayChon || homNayISO,
      gio_bat_dau: gioChon || '09:00',
      nguoi_phu_trach_id: nhanSuLoc !== 'tat_ca' ? nhanSuLoc : nguoiDungHienTai?.id,
      chi_nhanh_id: chiNhanhLoc !== 'tat_ca' ? chiNhanhLoc : nguoiDungHienTai?.chi_nhanh_id
    });
    setMoModal(true);
  };

  const handleLuuLich = async (dto: TaoMoiLichGapDTO | CapNhatLichGapDTO) => {
    setDangLuu(true);
    try {
      if (lichDangSua) {
        await capNhatLichGapKH(lichDangSua.id, dto, nguoiDungHienTai?.id);
      } else {
        await taoLichGapKHMoi(dto as TaoMoiLichGapDTO);
      }
      setMoModal(false);
      setLichDangSua(null);
      await taiDanhSachLich();
    } catch {
      alert('Không thể lưu lịch gặp. Vui lòng thử lại!');
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoaLich = async (id: string, tenKH: string) => {
    if (!confirm(`Bạn có chắc muốn xóa lịch gặp "${tenKH}"?`)) return;
    try {
      await xoaLichGapKH(id, nguoiDungHienTai?.id);
      setMoModal(false);
      setLichDangSua(null);
      await taiDanhSachLich();
    } catch {
      alert('Không thể xóa lịch gặp.');
    }
  };

  // Nhóm lịch theo ngày cho chế độ Danh sách (Agenda)
  const nhomLichTheoNgay = useMemo(() => {
    const dauTuan = ds7NgayTuan[0]?.iso || homNayISO;
    const cuoiTuan = ds7NgayTuan[6]?.iso || homNayISO;
    const thangHienTai = ngayDangXem.slice(0, 7);

    const dsTrongKy = dsLichLoc.filter((l) => {
      if (cheDoXem === 'thang') return l.ngay.startsWith(thangHienTai);
      return l.ngay >= dauTuan && l.ngay <= cuoiTuan;
    });

    const map = new Map<string, LichGapKH[]>();
    dsTrongKy.forEach((l) => {
      const arr = map.get(l.ngay) || [];
      arr.push(l);
      map.set(l.ngay, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [dsLichLoc, ds7NgayTuan, homNayISO, ngayDangXem, cheDoXem]);

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      {/* 1. ONE UI 9 NOW BRIEF SUMMARY TRÊN MOBILE */}
      <div className="sm:hidden bg-gradient-to-br from-[#0e3e2d] via-[#13503b] to-[#185942] rounded-[26px] p-3.5 text-white shadow-[0_8px_24px_rgba(14,62,45,0.16)] space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-emerald-300" />
            <span className="text-[13px] font-extrabold text-white tracking-tight">{tieuDeThoiGian}</span>
          </div>
          <button
            type="button"
            onClick={() => handleMoThemNhanh(homNayISO, '09:00')}
            title="Thêm lịch hẹn"
            aria-label="Thêm lịch hẹn"
            className="inline-flex items-center justify-center size-8 rounded-full bg-white text-[#0e3e2d] font-extrabold shadow-xs active:scale-95 transition cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-white/12 rounded-[16px] py-1.5 px-1 text-center border border-white/10">
            <div className="text-[15px] font-extrabold text-sky-300 tabular-nums leading-tight">{thongKe.lichHomNay}</div>
            <div className="text-[10px] font-medium text-emerald-100/85 whitespace-nowrap mt-0.5">Hôm nay</div>
          </div>
          <div className="bg-white/10 rounded-[16px] py-1.5 px-1 text-center border border-white/5">
            <div className="text-[15px] font-extrabold text-white tabular-nums leading-tight">{thongKe.lichTuanNay}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Tuần này</div>
          </div>
          <div className="bg-white/10 rounded-[16px] py-1.5 px-1 text-center border border-white/5">
            <div className="text-[15px] font-extrabold text-amber-300 tabular-nums leading-tight">{thongKe.lichThangNay}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Tháng này</div>
          </div>
          <div className="bg-white/10 rounded-[16px] py-1.5 px-1 text-center border border-white/5">
            <div className="text-[15px] font-extrabold text-emerald-300 tabular-nums leading-tight">{thongKe.daHoanThanh}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Đã gặp</div>
          </div>
        </div>
      </div>

      {/* 2. BẢNG SỐ LIỆU ĐIỀU HÀNH DESKTOP */}
      <div className="hidden sm:grid sm:grid-cols-4 bg-[#0e3e2d] rounded-2xl p-3.5 gap-3 shadow-sm border border-emerald-950/20">
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-400/20 text-blue-200 flex items-center justify-center shrink-0 border border-blue-400/20">
            <Clock className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Lịch hôm nay
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKe.lichHomNay}
            </div>
          </div>
        </div>

        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0 border border-white/10">
            <CalendarIcon className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Lịch tuần này
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKe.lichTuanNay}
            </div>
          </div>
        </div>

        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-400/20 text-purple-200 flex items-center justify-center shrink-0 border border-purple-400/20">
            <Users className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Lịch trong tháng
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKe.lichThangNay}
            </div>
          </div>
        </div>

        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/20">
            <CheckCircle2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đã hoàn thành
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKe.daHoanThanh}
            </div>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐIỀU HƯỚNG GOOGLE CALENDAR & BỘ LỌC */}
      <div className="bg-white p-3 sm:p-4 rounded-[24px] sm:rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3">
        {/* Cụm nút điều hướng ngày/tuần/tháng + Chuyển chế độ xem trên Mobile */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setNgayDangXem(homNayISO);
                setNgayChonTrongThang(homNayISO);
              }}
              className="px-3 py-1.5 rounded-full sm:rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => diChuyenThoiGian(-1)}
              className="p-1.5 rounded-full sm:rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Kỳ trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => diChuyenThoiGian(1)}
              className="p-1.5 rounded-full sm:rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Kỳ sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="hidden sm:block text-base font-extrabold text-slate-900 ml-1 tabular-nums">
            {tieuDeThoiGian}
          </h2>

          {/* Segmented View Switcher trên Mobile: Tuần (mặc định - lịch dọc) & Tháng (lưới Google Calendar) */}
          <div className="flex sm:hidden items-center p-1 bg-slate-100 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => setCheDoXem('tuan')}
              className={cn(
                'px-3 py-1 rounded-full text-[11.5px] font-bold transition cursor-pointer',
                cheDoXem === 'tuan' || cheDoXem === 'danh_sach'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500'
              )}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => setCheDoXem('thang')}
              className={cn(
                'px-3 py-1 rounded-full text-[11.5px] font-bold transition cursor-pointer',
                cheDoXem === 'thang'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500'
              )}
            >
              Tháng
            </button>
          </div>
        </div>

        {/* Cụm lọc Chi nhánh, Nhân viên & Chuyển chế độ xem Desktop */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <select
              value={chiNhanhLoc}
              onChange={(e) => setChiNhanhLoc(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-full sm:rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-hidden focus:bg-white min-w-0 truncate"
            >
              <option value="tat_ca">Tất cả chi nhánh</option>
              {dsChiNhanh.map((cn) => (
                <option key={cn.id} value={cn.id}>
                  {cn.ten_chi_nhanh}
                </option>
              ))}
            </select>

            <select
              value={nhanSuLoc}
              onChange={(e) => setNhanSuLoc(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-full sm:rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-hidden focus:bg-white min-w-0 truncate sm:max-w-[170px]"
            >
              <option value="tat_ca">Tất cả nhân sự</option>
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten}
                </option>
              ))}
            </select>
          </div>

          {/* Segmented View Switcher Desktop */}
          <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setCheDoXem('tuan')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1',
                cheDoXem === 'tuan'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Columns3 className="size-3.5" />
              <span>Tuần</span>
            </button>
            <button
              type="button"
              onClick={() => setCheDoXem('thang')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1',
                cheDoXem === 'thang'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Tháng</span>
            </button>
            <button
              type="button"
              onClick={() => setCheDoXem('danh_sach')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1',
                cheDoXem === 'danh_sach'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <ListFilter className="size-3.5" />
              <span>Danh sách</span>
            </button>
          </div>

          <Nut
            kieu="primary"
            kich_thuoc="sm"
            onClick={() => handleMoThemNhanh(homNayISO, '09:00')}
            className="hidden sm:inline-flex bg-[#107555] hover:bg-emerald-800 rounded-xl"
          >
            <Plus className="size-4 mr-1.5" />
            Đặt lịch gặp KH
          </Nut>
        </div>
      </div>

      {/* 4. NỘI DUNG LỊCH */}
      {dangTai ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="size-7 animate-spin text-emerald-600 mb-2" />
          <span className="text-sm font-medium">Đang tải lịch công tác...</span>
        </div>
      ) : (
        <>
          {/* CHẾ ĐỘ 1: LỊCH TUẦN (Desktop: 7 cột | Mobile: Thanh 7 ngày + Danh sách lịch dọc trực quan) */}
          {(cheDoXem === 'tuan' || cheDoXem === 'danh_sach') && (
            <>
              {/* DESKTOP: GOOGLE CALENDAR 7 CỘT (Khi chọn 'tuan') */}
              {cheDoXem === 'tuan' && (
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[980px] grid grid-cols-7 divide-x divide-slate-200/80">
                      {ds7NgayTuan.map((cotNgay) => {
                        const lichTrongNgay = dsLichLoc.filter((l) => l.ngay === cotNgay.iso);

                        return (
                          <div
                            key={cotNgay.iso}
                            className={cn(
                              'flex flex-col min-h-[480px]',
                              cotNgay.laHomNay ? 'bg-emerald-50/20' : 'bg-white'
                            )}
                          >
                            {/* Header Thứ & Ngày */}
                            <div
                              className={cn(
                                'p-3 border-b border-slate-200/80 flex items-center justify-between',
                                cotNgay.laHomNay ? 'bg-emerald-50/70' : 'bg-slate-50/70'
                              )}
                            >
                              <div>
                                <div
                                  className={cn(
                                    'text-[11px] font-bold uppercase tracking-wider',
                                    cotNgay.laHomNay ? 'text-emerald-700' : 'text-slate-500'
                                  )}
                                >
                                  {cotNgay.thu}
                                </div>
                                <div
                                  className={cn(
                                    'text-sm font-black mt-0.5 tabular-nums',
                                    cotNgay.laHomNay ? 'text-emerald-800' : 'text-slate-800'
                                  )}
                                >
                                  {cotNgay.ngayThang}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleMoThemNhanh(cotNgay.iso, '09:00')}
                                className="size-7 rounded-lg bg-white border border-slate-200/80 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                title="Thêm lịch vào ngày này"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>

                            {/* Danh sách thẻ sự kiện trong ngày */}
                            <div className="p-2 space-y-2 flex-1">
                              {lichTrongNgay.map((lich) => {
                                const ns = mapNhanSu.get(lich.nguoi_phu_trach_id);
                                const mau = layMauTheoNhanVien(lich.nguoi_phu_trach_id);
                                const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find(
                                  (t) => t.key === lich.trang_thai
                                );

                                return (
                                  <div
                                    key={lich.id}
                                    onClick={() => {
                                      setLichDangSua(lich);
                                      setMoModal(true);
                                    }}
                                    className={cn(
                                      'p-2.5 rounded-xl border transition cursor-pointer shadow-2xs space-y-1.5',
                                      lich.trang_thai === 'huy'
                                        ? 'bg-slate-100 border-slate-200 opacity-60 line-through'
                                        : cn(mau.bg, mau.border)
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className={cn('text-[11px] font-extrabold tabular-nums', mau.sub)}>
                                        {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                                      </span>
                                      <span
                                        className={cn(
                                          'size-2 rounded-full shrink-0',
                                          ttObj?.mauDot || 'bg-blue-500'
                                        )}
                                        title={ttObj?.tieu_de}
                                      />
                                    </div>

                                    <div className={cn('text-xs font-bold leading-snug line-clamp-2', mau.text)}>
                                      {lich.ten_khach_hang}
                                    </div>

                                    {lich.dia_diem && (
                                      <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate">
                                        <MapPin className="size-3 shrink-0 text-slate-400" />
                                        <span className="truncate">{lich.dia_diem}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-1 border-t border-black/5">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <DaiDien
                                          ten={ns?.ho_va_ten || 'NV'}
                                          kich_thuoc="xs"
                                          className="size-4 text-[9px]"
                                        />
                                        <span className="text-[11px] font-semibold text-slate-700 truncate">
                                          {ns?.ho_va_ten || 'Chưa gán'}
                                        </span>
                                      </div>
                                      {lich.nguoi_tham_gia_ids && lich.nguoi_tham_gia_ids.length > 0 && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 text-slate-600">
                                          +{lich.nguoi_tham_gia_ids.length}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MOBILE: LỊCH TUẦN DỌC TRỰC QUAN (7 ngày trong tuần theo chiều dọc + thanh chọn nhanh 7 ngày) */}
              <div className="sm:hidden space-y-2.5">
                {/* Thanh 7 ngày trong tuần có chấm đánh dấu ngày có lịch */}
                <div className="bg-white rounded-[22px] p-2 border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] grid grid-cols-7 gap-1">
                  {ds7NgayTuan.map((cotNgay, idx) => {
                    const soLich = dsLichLoc.filter((l) => l.ngay === cotNgay.iso && l.trang_thai !== 'huy').length;
                    const thuGon = idx === 6 ? 'CN' : `T${idx + 2}`;
                    const ngaySo = cotNgay.ngayThang.slice(0, 2);
                    return (
                      <a
                        key={cotNgay.iso}
                        href={`#lich-ngay-${cotNgay.iso}`}
                        className={cn(
                          'flex flex-col items-center justify-center py-1.5 rounded-2xl transition',
                          cotNgay.laHomNay
                            ? 'bg-[#107555] text-white shadow-xs'
                            : soLich > 0
                            ? 'bg-emerald-50/70 text-slate-900'
                            : 'text-slate-500'
                        )}
                      >
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase',
                            cotNgay.laHomNay ? 'text-emerald-100' : 'text-slate-400'
                          )}
                        >
                          {thuGon}
                        </span>
                        <span className="text-[13px] font-extrabold tabular-nums mt-0.5">{ngaySo}</span>
                        <div className="h-1.5 flex items-center justify-center gap-0.5 mt-0.5">
                          {soLich > 0 && (
                            <span
                              className={cn(
                                'size-1.5 rounded-full',
                                cotNgay.laHomNay ? 'bg-white' : 'bg-[#107555]'
                              )}
                            />
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Danh sách lịch dọc 7 ngày trong tuần */}
                <div className="bg-slate-100/70 p-2.5 rounded-[26px] border border-slate-200/80 space-y-2">
                  {ds7NgayTuan.map((cotNgay) => {
                    const lichTrongNgay = dsLichLoc.filter((l) => l.ngay === cotNgay.iso);
                    const coLich = lichTrongNgay.length > 0;

                    return (
                      <div
                        key={cotNgay.iso}
                        id={`lich-ngay-${cotNgay.iso}`}
                        className={cn(
                          'bg-white rounded-[22px] border transition-all overflow-hidden',
                          cotNgay.laHomNay
                            ? 'border-emerald-400/80 shadow-[0_2px_10px_rgba(16,117,85,0.08)]'
                            : 'border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.02)]'
                        )}
                      >
                        {/* Header từng ngày */}
                        <div
                          className={cn(
                            'px-3.5 py-2.5 flex items-center justify-between',
                            coLich && 'border-b border-slate-100',
                            cotNgay.laHomNay ? 'bg-emerald-50/60' : 'bg-white'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'text-[13px] font-extrabold',
                                cotNgay.laHomNay ? 'text-[#107555]' : 'text-slate-800'
                              )}
                            >
                              {cotNgay.thu}, {cotNgay.ngayThang}
                            </span>
                            {cotNgay.laHomNay && (
                              <span className="px-2 py-0.5 rounded-full bg-[#107555] text-white text-[10px] font-bold">
                                Hôm nay
                              </span>
                            )}
                            {coLich ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] font-extrabold tabular-nums">
                                {lichTrongNgay.length} lịch
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Trống</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoThemNhanh(cotNgay.iso, '09:00')}
                            title={`Thêm lịch ngày ${cotNgay.ngayThang}`}
                            aria-label={`Thêm lịch ngày ${cotNgay.ngayThang}`}
                            className="size-7 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 flex items-center justify-center active:scale-95 transition cursor-pointer shrink-0"
                          >
                            <Plus className="size-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Danh sách lịch hẹn trong ngày đó */}
                        {coLich && (
                          <div className="divide-y divide-slate-100">
                            {lichTrongNgay.map((lich, idxLich) => {
                              const ns = mapNhanSu.get(lich.nguoi_phu_trach_id);
                              const tenNsNgan = ns?.ho_va_ten
                                ? ns.ho_va_ten.trim().split(/\s+/).slice(-2).join(' ')
                                : 'Chưa gán';
                              const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find(
                                (t) => t.key === lich.trang_thai
                              );

                              return (
                                <div
                                  key={lich.id}
                                  onClick={() => {
                                    setLichDangSua(lich);
                                    setMoModal(true);
                                  }}
                                  className={cn(
                                    'p-3.5 active:bg-slate-50 transition cursor-pointer',
                                    lich.trang_thai === 'huy' && 'opacity-55 line-through'
                                  )}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-slate-400 text-[11.5px] font-extrabold tabular-nums mt-0.5 shrink-0">
                                      {idxLich + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[14px] leading-snug">
                                        <span className="font-bold text-slate-900">
                                          {lich.ten_khach_hang}
                                        </span>
                                        {ttObj && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                                            {ttObj.tieu_de}
                                          </span>
                                        )}
                                      </div>

                                      {(lich.dia_diem || lich.noi_dung) && (
                                        <div className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                                          {lich.dia_diem ? `📍 ${lich.dia_diem}` : lich.noi_dung}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                                        <span className="font-mono font-extrabold text-[#107555] text-[12px] bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60 tabular-nums">
                                          {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                                        </span>
                                        <div className="flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700">
                                          <UserRound className="size-3 text-slate-400" />
                                          <span>{tenNsNgan}</span>
                                          {lich.nguoi_tham_gia_ids && lich.nguoi_tham_gia_ids.length > 0 && (
                                            <span className="text-emerald-700 font-bold">
                                              +{lich.nguoi_tham_gia_ids.length}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* CHẾ ĐỘ 2: GOOGLE CALENDAR THEO THÁNG (Desktop: Lưới chi tiết | Mobile: Lưới chấm Google Calendar + Bấm vào xem chi tiết ngày bên dưới) */}
          {cheDoXem === 'thang' && (
            <>
              {/* DESKTOP: LƯỚI THÁNG ĐẦY ĐỦ */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[840px]">
                    {/* Header Thứ */}
                    <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200/80 text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <div>Thứ 2</div>
                      <div>Thứ 3</div>
                      <div>Thứ 4</div>
                      <div>Thứ 5</div>
                      <div>Thứ 6</div>
                      <div>Thứ 7</div>
                      <div>Chủ Nhật</div>
                    </div>

                    {/* Lưới ngày */}
                    <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/70">
                      {luoiNgayThang.map((oNgay) => {
                        const lichNgay = dsLichLoc.filter((l) => l.ngay === oNgay.iso);

                        return (
                          <div
                            key={oNgay.iso}
                            className={cn(
                              'min-h-[120px] p-2 flex flex-col gap-1 transition group',
                              !oNgay.trongThang && 'bg-slate-50/50 text-slate-400',
                              oNgay.laHomNay && 'bg-emerald-50/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  'text-xs font-bold size-6 rounded-full flex items-center justify-center tabular-nums',
                                  oNgay.laHomNay
                                    ? 'bg-emerald-600 text-white'
                                    : oNgay.trongThang
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                )}
                              >
                                {oNgay.ngaySo}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMoThemNhanh(oNgay.iso, '09:00')}
                                className="opacity-0 group-hover:opacity-100 size-5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            <div className="space-y-1 mt-0.5">
                              {lichNgay.slice(0, 3).map((lich) => {
                                const mau = layMauTheoNhanVien(lich.nguoi_phu_trach_id);
                                return (
                                  <div
                                    key={lich.id}
                                    onClick={() => {
                                      setLichDangSua(lich);
                                      setMoModal(true);
                                    }}
                                    className={cn(
                                      'px-1.5 py-1 rounded text-[11px] font-semibold truncate cursor-pointer border',
                                      mau.bg,
                                      mau.border,
                                      mau.text
                                    )}
                                  >
                                    <span className="font-extrabold mr-1">{lich.gio_bat_dau}</span>
                                    {lich.ten_khach_hang}
                                  </div>
                                );
                              })}
                              {lichNgay.length > 3 && (
                                <div className="text-[10px] font-bold text-slate-500 pl-1">
                                  +{lichNgay.length - 3} lịch khác
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* MOBILE: LỊCH THÁNG KIỂU GOOGLE CALENDAR (Đánh dấu chấm trên ngày có lịch, bấm vào hiện chi tiết bên dưới) */}
              <div className="sm:hidden space-y-2.5">
                <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-3">
                  {/* Header Thứ gọn gàng */}
                  <div className="grid grid-cols-7 text-center pb-2 mb-1 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400">
                    <div>T2</div>
                    <div>T3</div>
                    <div>T4</div>
                    <div>T5</div>
                    <div>T6</div>
                    <div>T7</div>
                    <div className="text-rose-500">CN</div>
                  </div>

                  {/* Lưới 7 cột vừa khít màn hình điện thoại */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {luoiNgayThang.map((oNgay) => {
                      const lichNgay = dsLichLoc.filter(
                        (l) => l.ngay === oNgay.iso && l.trang_thai !== 'huy'
                      );
                      const dangChon = ngayChonTrongThang === oNgay.iso;
                      const coLich = lichNgay.length > 0;

                      return (
                        <button
                          key={oNgay.iso}
                          type="button"
                          onClick={() => setNgayChonTrongThang(oNgay.iso)}
                          className={cn(
                            'h-12 rounded-2xl flex flex-col items-center justify-center relative transition cursor-pointer',
                            !oNgay.trongThang && 'opacity-35',
                            dangChon
                              ? 'bg-[#107555] text-white shadow-xs'
                              : oNgay.laHomNay
                              ? 'bg-emerald-50 text-[#107555] ring-1 ring-emerald-300'
                              : coLich
                              ? 'bg-emerald-50/40 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          <span className="text-[13px] font-extrabold tabular-nums leading-none">
                            {oNgay.ngaySo}
                          </span>

                          {/* Dấu chấm đánh dấu ngày có lịch hẹn */}
                          <div className="h-2.5 flex items-center justify-center gap-0.5 mt-1">
                            {coLich && (
                              <>
                                {lichNgay.slice(0, 3).map((l) => (
                                  <span
                                    key={l.id}
                                    className={cn(
                                      'size-1.5 rounded-full',
                                      dangChon ? 'bg-white' : 'bg-[#107555]'
                                    )}
                                  />
                                ))}
                                {lichNgay.length > 3 && (
                                  <span
                                    className={cn(
                                      'text-[8px] font-black leading-none',
                                      dangChon ? 'text-emerald-100' : 'text-[#107555]'
                                    )}
                                  >
                                    +
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Danh sách lịch hẹn của ngày đang bấm chọn trên lịch tháng */}
                {(() => {
                  const lichNgayChon = dsLichLoc.filter((l) => l.ngay === ngayChonTrongThang);
                  return (
                    <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-4 text-[#107555]" />
                          <span className="text-[13.5px] font-extrabold text-slate-900">
                            Lịch ngày {formatNgay(ngayChonTrongThang)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-extrabold tabular-nums">
                            {lichNgayChon.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMoThemNhanh(ngayChonTrongThang, '09:00')}
                          title="Thêm lịch vào ngày đang chọn"
                          aria-label="Thêm lịch vào ngày đang chọn"
                          className="size-8 rounded-full bg-[#107555] text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="size-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {lichNgayChon.length === 0 ? (
                        <div className="py-8 px-4 text-center">
                          <p className="text-xs font-medium text-slate-400">
                            Chưa có lịch hẹn nào trong ngày {formatNgay(ngayChonTrongThang)}
                          </p>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-100/70 space-y-2">
                          {lichNgayChon.map((lich, idxLich) => {
                            const ns = mapNhanSu.get(lich.nguoi_phu_trach_id);
                            const tenNsNgan = ns?.ho_va_ten
                              ? ns.ho_va_ten.trim().split(/\s+/).slice(-2).join(' ')
                              : 'Chưa gán';
                            const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find(
                              (t) => t.key === lich.trang_thai
                            );

                            return (
                              <div
                                key={lich.id}
                                onClick={() => {
                                  setLichDangSua(lich);
                                  setMoModal(true);
                                }}
                                className="p-3.5 bg-white rounded-[22px] border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] active:scale-[0.99] transition cursor-pointer"
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-400 text-[11.5px] font-extrabold tabular-nums mt-0.5 shrink-0">
                                    {idxLich + 1}.
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[14px] leading-snug">
                                      <span className="font-bold text-slate-900">
                                        {lich.ten_khach_hang}
                                      </span>
                                      {ttObj && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                                          {ttObj.tieu_de}
                                        </span>
                                      )}
                                    </div>

                                    {(lich.dia_diem || lich.noi_dung) && (
                                      <div className="text-[12px] text-slate-500 mt-1 line-clamp-1">
                                        {lich.dia_diem ? `📍 ${lich.dia_diem}` : lich.noi_dung}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                                      <span className="font-mono font-extrabold text-[#107555] text-[12px] bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60 tabular-nums">
                                        {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                                      </span>
                                      <div className="flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700">
                                        <UserRound className="size-3 text-slate-400" />
                                        <span>{tenNsNgan}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {/* CHẾ ĐỘ 3: DANH SÁCH CHI TIẾT THEO NGÀY TRÊN DESKTOP (AGENDA) */}
          {cheDoXem === 'danh_sach' && (
            <div className="hidden sm:block space-y-3">
              {nhomLichTheoNgay.length === 0 ? (
                <div className="py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-500">
                    Chưa có lịch gặp khách hàng trong khoảng thời gian này
                  </p>
                  <button
                    type="button"
                    onClick={() => handleMoThemNhanh(homNayISO, '09:00')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Đăng ký lịch gặp ngay
                  </button>
                </div>
              ) : (
                nhomLichTheoNgay.map(([ngayISO, danhSachTrongNgay]) => {
                  const laHomNay = ngayISO === homNayISO;
                  return (
                    <div
                      key={ngayISO}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
                    >
                      <div
                        className={cn(
                          'px-4 py-2.5 border-b border-slate-100 flex items-center justify-between',
                          laHomNay ? 'bg-emerald-50/70' : 'bg-slate-50/70'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon
                            className={cn('size-4', laHomNay ? 'text-emerald-700' : 'text-slate-500')}
                          />
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {formatNgay(ngayISO)}
                          </span>
                          {laHomNay && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              Hôm nay
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {danhSachTrongNgay.length} cuộc hẹn
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {danhSachTrongNgay.map((lich) => {
                          const ns = mapNhanSu.get(lich.nguoi_phu_trach_id);
                          const cnObj = lich.chi_nhanh_id ? mapChiNhanh.get(lich.chi_nhanh_id) : null;
                          const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find(
                            (t) => t.key === lich.trang_thai
                          );

                          return (
                            <div
                              key={lich.id}
                              onClick={() => {
                                setLichDangSua(lich);
                                setMoModal(true);
                              }}
                              className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-center shrink-0 min-w-[72px]">
                                  <div className="text-xs font-black tabular-nums">{lich.gio_bat_dau}</div>
                                  <div className="text-[10px] font-semibold text-slate-500 tabular-nums">
                                    {lich.gio_ket_thuc}
                                  </div>
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                                      {lich.ten_khach_hang}
                                    </span>
                                    {ttObj && (
                                      <span
                                        className={cn(
                                          'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                                          ttObj.mauBadge
                                        )}
                                      >
                                        {ttObj.tieu_de}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                    {lich.ten_nguoi_lien_he && (
                                      <span className="inline-flex items-center gap-1">
                                        <UserRound className="size-3.5 text-slate-400" />
                                        {lich.ten_nguoi_lien_he}
                                      </span>
                                    )}
                                    {lich.so_dien_thoai && (
                                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                        <Phone className="size-3" />
                                        {lich.so_dien_thoai}
                                      </span>
                                    )}
                                    {lich.dia_diem && (
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="size-3.5 text-slate-400" />
                                        {lich.dia_diem}
                                      </span>
                                    )}
                                  </div>

                                  {lich.noi_dung && (
                                    <p className="text-xs text-slate-500 line-clamp-1">{lich.noi_dung}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                                <div className="flex items-center gap-2">
                                  <DaiDien
                                    ten={ns?.ho_va_ten || 'NV'}
                                    kich_thuoc="xs"
                                    className="size-6 text-[10px]"
                                  />
                                  <div className="text-xs">
                                    <div className="font-bold text-slate-800">
                                      {ns?.ho_va_ten || 'Chưa phân công'}
                                    </div>
                                    {cnObj && (
                                      <div className="text-[11px] text-slate-400">
                                        {cnObj.ten_chi_nhanh}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Modal Đăng ký / Chỉnh sửa lịch */}
      <FormLichGapModal
        mo={moModal}
        khi_dong={() => {
          setMoModal(false);
          setLichDangSua(null);
        }}
        dang_sua={lichDangSua}
        gia_tri_mac_dinh={giaTriMacDinhModal}
        dsLichHienCo={dsLich}
        dsKhachHang={dsKhachHang}
        dsNguoiLienHe={dsNguoiLienHe}
        dsNhanSu={dsNhanSu}
        nguoiDungId={nguoiDungHienTai?.id}
        chiNhanhMacDinhId={nguoiDungHienTai?.chi_nhanh_id}
        khi_luu={handleLuuLich}
        khi_xoa={handleXoaLich}
        dang_xu_ly={dangLuu}
      />
    </Bo_Cuc_Trang>
  );
}
