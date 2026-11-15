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
  Save,
  Send,
  FolderKanban
} from 'lucide-react';
import { moZaloXinDuyetLich } from '../../thu_vien/utils/chia_se_zalo_lich';
import { cn } from '../../thu_vien/utils/cn';
import { Ban_Ve, DaiDien, Nut } from '../ui';
import type {
  LichGapKH,
  TrangThaiLichGap
} from '../../thu_vien/types/lich_gap_kh';
import {
  DANH_SACH_TRANG_THAI_LICH_GAP,
  NHAN_LOAI_VIEC_VAN_PHONG,
  type LoaiLichLamViec,
  type LoaiViecVanPhong
} from '../../thu_vien/types/lich_gap_kh';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import {
  kiemTraTrungLich,
  type TaoMoiLichGapDTO,
  type CapNhatLichGapDTO
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { laQuanLyCapCaoHoacTruongPhong, duocXemHoSoDuAn, duocXemKhachHang } from '../../thu_vien/phan_quyen/kiem_tra_quyen';

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
  du_an_id?: string | null;
  loai_lich?: LoaiLichLamViec;
  loai_viec_vp?: LoaiViecVanPhong;
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
  dsDuAn?: HoSoDuAn[];
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
  dsDuAn = [],
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

  const { nguoiDungHienTai } = useStoreXacThuc();
  const laQuanLy = useMemo(() => laQuanLyCapCaoHoacTruongPhong(nguoiDungHienTai), [nguoiDungHienTai]);

  const dropdownKHRef = useRef<HTMLDivElement>(null);
  const dropdownDARef = useRef<HTMLDivElement>(null);
  const dropdownNLHRef = useRef<HTMLDivElement>(null);
  const dropdownNSRef = useRef<HTMLDivElement>(null);

  // States dữ liệu nền
  const [dsDuAnNoiBo, setDsDuAnNoiBo] = useState<HoSoDuAn[]>([]);

  // States form
  const [loaiLich, setLoaiLich] = useState<LoaiLichLamViec>('cong_tac_di_chuyen');
  const [loaiViecVP, setLoaiViecVP] = useState<LoaiViecVanPhong>('goi_dien');
  const [tenViecVP, setTenViecVP] = useState<string>('');

  const [duAnId, setDuAnId] = useState<string>('');
  const [timDuAn, setTimDuAn] = useState<string>('');
  const [moGoiYDA, setMoGoiYDA] = useState(false);

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
  const [trangThai, setTrangThai] = useState<TrangThaiLichGap>('da_duyet');
  const [laPhatSinh, setLaPhatSinh] = useState<boolean>(false);
  const [laTiepCanMoi, setLaTiepCanMoi] = useState<boolean>(false);
  const [lyDoDoiHuy, setLyDoDoiHuy] = useState<string>('');

  const [timKiemNS, setTimKiemNS] = useState<string>('');
  const [moGoiYNS, setMoGoiYNS] = useState(false);

  // Tải dự án nội bộ nếu caller không truyền dsDuAn
  useEffect(() => {
    if (!mo) return;
    if (!dsDuAn || dsDuAn.length === 0) {
      danhSachHoSoDuAn()
        .then((res) => {
          const list = Array.isArray(res) ? res : (res as any)?.mang || [];
          setDsDuAnNoiBo(list);
        })
        .catch(() => {});
    }
  }, [mo, dsDuAn]);

  const dsDuAnHieuLuc = useMemo(() => {
    const raw = (dsDuAn && dsDuAn.length > 0) ? dsDuAn : dsDuAnNoiBo;
    if (laQuanLy) return raw;
    if (!nguoiDungHienTai) return [];
    return raw.filter((da) =>
      da.id === dang_sua?.du_an_id ||
      da.id === gia_tri_mac_dinh?.du_an_id ||
      duocXemHoSoDuAn(nguoiDungHienTai, da)
    );
  }, [dsDuAn, dsDuAnNoiBo, laQuanLy, nguoiDungHienTai, dang_sua?.du_an_id, gia_tri_mac_dinh?.du_an_id]);

  const dsDuAnTongHop = dsDuAnHieuLuc;

  const dsKhachHangHieuLuc = useMemo(() => {
    if (laQuanLy) return dsKhachHang;
    if (!nguoiDungHienTai) return [];
    const dsDuAnIdsCuaUser = new Set(
      dsDuAnHieuLuc.map((da) => da.khach_hang_id).filter(Boolean) as string[]
    );
    return dsKhachHang.filter((kh) =>
      kh.id === dang_sua?.khach_hang_id ||
      kh.id === gia_tri_mac_dinh?.khach_hang_id ||
      duocXemKhachHang(nguoiDungHienTai, kh, undefined, dsDuAnIdsCuaUser)
    );
  }, [dsKhachHang, laQuanLy, nguoiDungHienTai, dsDuAnHieuLuc, dang_sua?.khach_hang_id, gia_tri_mac_dinh?.khach_hang_id]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownKHRef.current && !dropdownKHRef.current.contains(e.target as Node)) {
        setMoGoiYKH(false);
      }
      if (dropdownDARef.current && !dropdownDARef.current.contains(e.target as Node)) {
        setMoGoiYDA(false);
      }
      if (dropdownNLHRef.current && !dropdownNLHRef.current.contains(e.target as Node)) {
        setMoGoiYNLH(false);
      }
      if (dropdownNSRef.current && !dropdownNSRef.current.contains(e.target as Node)) {
        setMoGoiYNS(false);
      }
    };
    if (moGoiYKH || moGoiYDA || moGoiYNLH || moGoiYNS) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moGoiYKH, moGoiYDA, moGoiYNLH, moGoiYNS]);

  // Initialize form state
  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      const ll = dang_sua.loai_lich || 'cong_tac_di_chuyen';
      setLoaiLich(ll);
      setLoaiViecVP(dang_sua.loai_viec_vp || 'goi_dien');
      setTenViecVP(ll === 'van_phong' ? (dang_sua.tieu_de || dang_sua.noi_dung || '') : '');

      const daId = dang_sua.du_an_id || '';
      setDuAnId(daId);
      const daObj = dsDuAnTongHop.find((d) => d.id === daId);
      setTimDuAn(daObj?.ten_du_an || '');

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
      setTrangThai(dang_sua.trang_thai || 'da_duyet');
      setLaPhatSinh(Boolean(dang_sua.la_phat_sinh));
      setLaTiepCanMoi(Boolean(dang_sua.la_tiep_can_moi));
      setLyDoDoiHuy(dang_sua.ly_do_doi_huy || '');
    } else {
      const ll = gia_tri_mac_dinh?.loai_lich || 'cong_tac_di_chuyen';
      setLoaiLich(ll);
      setLoaiViecVP(gia_tri_mac_dinh?.loai_viec_vp || 'goi_dien');
      setTenViecVP('');

      const daId = gia_tri_mac_dinh?.du_an_id || '';
      setDuAnId(daId);
      const daObj = dsDuAnTongHop.find((d) => d.id === daId);
      setTimDuAn(daObj?.ten_du_an || '');

      const khCuaDA = daObj?.khach_hang_id ? dsKhachHang.find((k) => k.id === daObj.khach_hang_id) : null;
      const khId = gia_tri_mac_dinh?.khach_hang_id || daObj?.khach_hang_id || '';
      const tenKH = gia_tri_mac_dinh?.ten_khach_hang || khCuaDA?.ten_khach_hang || '';
      const gioBD = gia_tri_mac_dinh?.gio_bat_dau || '09:00';
      setKhachHangId(khId);
      setTenKhachHang(tenKH);
      setTimKhachHang(tenKH);
      setNguoiLienHeId(gia_tri_mac_dinh?.nguoi_lien_he_id || daObj?.nguoi_lien_he_id || '');
      setTenNguoiLienHe(gia_tri_mac_dinh?.ten_nguoi_lien_he || '');
      setSoDienThoai(gia_tri_mac_dinh?.so_dien_thoai || '');
      setNgay(gia_tri_mac_dinh?.ngay || homNay);
      setGioBatDau(gioBD);
      setGioKetThuc(congThemPhut(gioBD, 90));
      setDiaDiem(gia_tri_mac_dinh?.dia_diem || (ll === 'van_phong' ? 'Tại văn phòng' : ''));
      setNoiDung(gia_tri_mac_dinh?.noi_dung || '');
      setKetQua('');
      setNguoiPhuTrachId(gia_tri_mac_dinh?.nguoi_phu_trach_id || nguoiDungId || '');
      setNguoiThamGiaIds([]);
      setTrangThai(ll === 'van_phong' || laQuanLy ? 'da_duyet' : 'cho_duyet');
      setLaPhatSinh(false);
      setLaTiepCanMoi(false);
      setLyDoDoiHuy('');
    }
    setDangGoTimKH(false);
    setMoGoiYKH(false);
    setMoGoiYDA(false);
    setMoGoiYNLH(false);
    setMoGoiYNS(false);
    setTimKiemNS('');
  }, [mo, dang_sua, gia_tri_mac_dinh, homNay, nguoiDungId, dsDuAnTongHop, laQuanLy, dsKhachHang]);

  // Tải danh sách người liên hệ riêng của khách hàng
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

  const dsLienHeCuaKH = useMemo(() => {
    if (dsLienHeRiengKH.length > 0) return dsLienHeRiengKH;
    if (!khachHangId) return [];
    return dsNguoiLienHe.filter((nlh) => nlh.khach_hang_id === khachHangId);
  }, [khachHangId, dsLienHeRiengKH, dsNguoiLienHe]);

  // Lọc gợi ý dự án
  const dsDAGoiY = useMemo(() => {
    const kw = timDuAn.toLowerCase().trim();
    if (!kw) return dsDuAnTongHop.slice(0, 30);
    return dsDuAnTongHop
      .filter((da) => {
        const kh = da.khach_hang_id ? dsKhachHang.find((k) => k.id === da.khach_hang_id) : null;
        return (
          da.ten_du_an.toLowerCase().includes(kw) ||
          (da.ma_ho_so && da.ma_ho_so.toLowerCase().includes(kw)) ||
          (kh && kh.ten_khach_hang.toLowerCase().includes(kw))
        );
      })
      .slice(0, 30);
  }, [dsDuAnTongHop, timDuAn, dsKhachHang]);

  const chonDuAn = (da: HoSoDuAn) => {
    setDuAnId(da.id);
    setTimDuAn(da.ten_du_an);
    setMoGoiYDA(false);

    // Tự động điền khách hàng nếu chưa chọn
    if (da.khach_hang_id) {
      const kh = dsKhachHang.find((k) => k.id === da.khach_hang_id);
      if (kh) {
        setKhachHangId(kh.id);
        setTenKhachHang(kh.ten_khach_hang);
        setTimKhachHang(kh.ten_khach_hang);
        if (kh.dia_chi && !diaDiem && loaiLich === 'cong_tac_di_chuyen') {
          setDiaDiem(kh.dia_chi);
        }
      }
    }

    // Tự động điền người liên hệ nếu có
    if (da.nguoi_lien_he_id) {
      const nlh = dsNguoiLienHe.find((n) => n.id === da.nguoi_lien_he_id);
      if (nlh) {
        setNguoiLienHeId(nlh.id);
        setTenNguoiLienHe(nlh.ho_va_ten);
        if (nlh.so_dien_thoai) setSoDienThoai(nlh.so_dien_thoai);
      }
    }
  };

  // Lọc gợi ý khách hàng
  const dsKHGoiY = useMemo(() => {
    const kw = timKhachHang.toLowerCase().trim();
    if (!kw) return dsKhachHangHieuLuc.slice(0, 30);
    return dsKhachHangHieuLuc
      .filter(
        (kh) =>
          kh.ten_khach_hang.toLowerCase().includes(kw) ||
          (kh.ma_so_thue && kh.ma_so_thue.toLowerCase().includes(kw)) ||
          (kh.so_dien_thoai && kh.so_dien_thoai.includes(kw))
      )
      .slice(0, 30);
  }, [dsKhachHangHieuLuc, timKhachHang]);

  const chonKhachHang = async (kh: KhachHang) => {
    setKhachHangId(kh.id);
    setTenKhachHang(kh.ten_khach_hang);
    setTimKhachHang(kh.ten_khach_hang);
    setDangGoTimKH(false);
    setMoGoiYKH(false);

    try {
      const res = await danhSachNguoiLienHe({ khach_hang_id: kh.id });
      const mangLienHe = res.mang || [];
      setDsLienHeRiengKH(mangLienHe);
      const nlhChinh = mangLienHe[0];
      if (nlhChinh) {
        setNguoiLienHeId(nlhChinh.id);
        setTenNguoiLienHe(nlhChinh.ho_va_ten);
        setSoDienThoai(nlhChinh.so_dien_thoai || kh.so_dien_thoai || '');
      } else {
        setNguoiLienHeId('');
        setTenNguoiLienHe('');
        setSoDienThoai(kh.so_dien_thoai || '');
      }
    } catch {
      setSoDienThoai(kh.so_dien_thoai || '');
    }

    if (kh.dia_chi && !diaDiem && loaiLich === 'cong_tac_di_chuyen') {
      setDiaDiem(kh.dia_chi);
    }
  };

  const chonNguoiLienHe = (nlh: NguoiLienHe) => {
    setNguoiLienHeId(nlh.id);
    setTenNguoiLienHe(nlh.ho_va_ten);
    if (nlh.so_dien_thoai) setSoDienThoai(nlh.so_dien_thoai);
    setMoGoiYNLH(false);
  };

  const mapNhanSu = useMemo(() => {
    const m = new Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => m.set(ns.id, ns));
    return m;
  }, [dsNhanSu]);

  const thoiLuongHienTai = useMemo(
    () => tinhKhoangPhut(gioBatDau, gioKetThuc),
    [gioBatDau, gioKetThuc]
  );

  const toggleNguoiThamGia = (id: string) => {
    setNguoiThamGiaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canhBaoTrung = useMemo(() => {
    if (!ngay || !gioBatDau || !gioKetThuc) {
      return { trungCaNhan: [], trungChiNhanh: [] };
    }
    const nsPhuTrach = mapNhanSu.get(nguoiPhuTrachId);
    const cnId =
      dang_sua?.chi_nhanh_id ||
      gia_tri_mac_dinh?.chi_nhanh_id ||
      nsPhuTrach?.chi_nhanh_id ||
      chiNhanhMacDinhId ||
      null;

    return kiemTraTrungLich(
      dsLichHienCo,
      ngay,
      gioBatDau,
      gioKetThuc,
      nguoiPhuTrachId,
      cnId,
      dang_sua?.id
    );
  }, [
    dsLichHienCo,
    dang_sua?.id,
    dang_sua?.chi_nhanh_id,
    gia_tri_mac_dinh?.chi_nhanh_id,
    ngay,
    gioBatDau,
    gioKetThuc,
    nguoiPhuTrachId,
    chiNhanhMacDinhId,
    mapNhanSu
  ]);

  const dsNhanSuKhaDung = useMemo(() => {
    const kw = timKiemNS.toLowerCase().trim();
    return dsNhanSu.filter((ns) => {
      if (ns.id === nguoiPhuTrachId) return false;
      if (!kw) return true;
      return (
        ns.ho_va_ten.toLowerCase().includes(kw) ||
        (ns.chuc_vu && ns.chuc_vu.toLowerCase().includes(kw))
      );
    });
  }, [dsNhanSu, nguoiPhuTrachId, timKiemNS]);

  const buildPayload = (): TaoMoiLichGapDTO | null => {
    const tenKHChuan = (tenKhachHang || timKhachHang).trim();
    const daObj = dsDuAnTongHop.find((d) => d.id === duAnId);
    const khCuaDA = daObj?.khach_hang_id ? dsKhachHang.find((k) => k.id === daObj.khach_hang_id) : null;

    if (loaiLich === 'cong_tac_di_chuyen' && !tenKHChuan) {
      alert('Vui lòng chọn hoặc nhập tên khách hàng / đơn vị công tác!');
      return null;
    }

    if (loaiLich === 'van_phong' && !tenViecVP.trim() && !noiDung.trim() && !tenKHChuan) {
      alert('Vui lòng nhập tên công việc hoặc chọn loại tác nghiệp tại văn phòng!');
      return null;
    }

    if (!ngay || !gioBatDau) {
      alert('Vui lòng chọn ngày và giờ!');
      return null;
    }

    const nsPhuTrach = mapNhanSu.get(nguoiPhuTrachId);
    const cnId =
      dang_sua?.chi_nhanh_id ||
      gia_tri_mac_dinh?.chi_nhanh_id ||
      nsPhuTrach?.chi_nhanh_id ||
      chiNhanhMacDinhId ||
      null;

    const khCuoi = tenKHChuan || khCuaDA?.ten_khach_hang || (loaiLich === 'van_phong' ? 'Làm việc tại văn phòng' : 'Khách hàng');

    let tieuDeChuan = '';
    if (loaiLich === 'van_phong') {
      const viecText = tenViecVP.trim() || noiDung.trim() || 'Công việc văn phòng';
      const targetText = tenKHChuan && tenKHChuan !== 'Làm việc tại văn phòng' ? ` - ${tenKHChuan}` : '';
      tieuDeChuan = `${viecText}${targetText}`;
    } else {
      tieuDeChuan = `Công tác gặp ${khCuoi}`;
    }

    return {
      tieu_de: tieuDeChuan,
      khach_hang_id: khachHangId || daObj?.khach_hang_id || null,
      ten_khach_hang: khCuoi,
      nguoi_lien_he_id: nguoiLienHeId || gia_tri_mac_dinh?.nguoi_lien_he_id || dang_sua?.nguoi_lien_he_id || null,
      ten_nguoi_lien_he: tenNguoiLienHe.trim() || null,
      so_dien_thoai: soDienThoai.trim() || null,
      nguoi_phu_trach_id: !laQuanLy ? (nguoiDungId || nguoiDungHienTai?.id || '') : (nguoiPhuTrachId || nguoiDungId || ''),
      nguoi_tham_gia_ids: nguoiThamGiaIds,
      chi_nhanh_id: cnId,
      ngay,
      gio_bat_dau: gioBatDau,
      gio_ket_thuc: gioKetThuc || congThemPhut(gioBatDau, 90),
      dia_diem: diaDiem.trim() || (loaiLich === 'van_phong' ? 'Tại văn phòng' : null),
      noi_dung: (noiDung.trim() || tenViecVP.trim()) || null,
      ket_qua: ketQua.trim() || null,
      trang_thai: trangThai,
      loai_lich: loaiLich,
      loai_viec_vp: loaiViecVP || (tenViecVP.trim() || 'khac'),
      du_an_id: duAnId || null,
      la_phat_sinh: laPhatSinh,
      la_tiep_can_moi: laTiepCanMoi,
      ly_do_doi_huy: lyDoDoiHuy.trim() || null,
      nguon_lead_id: gia_tri_mac_dinh?.nguon_lead_id || dang_sua?.nguon_lead_id || null,
      nguoi_tao_id: dang_sua?.nguoi_tao_id || nguoiDungId || ''
    };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = buildPayload();
    if (!payload) return;
    await khi_luu(payload);
  };

  const handleLuuVaGuiZalo = async () => {
    const payload = buildPayload();
    if (!payload) return;

    payload.trang_thai = 'cho_duyet';
    payload.la_phat_sinh = true;

    await khi_luu(payload);
    void moZaloXinDuyetLich({
      lich: { ...payload, id: 'lich_moi', ngay_tao: new Date().toISOString(), ngay_cap_nhat: new Date().toISOString() },
      tenNhanSu: nguoiDungHienTai?.ho_va_ten || 'Sale'
    });
  };

  const coTrungCaNhan = canhBaoTrung.trungCaNhan.length > 0;
  const coTrungChiNhanh = canhBaoTrung.trungChiNhanh.length > 0;

  return (
    <Ban_Ve
      mo={mo}
      onDong={khi_dong}
      tieu_de={
        dang_sua
          ? 'Cập nhật lịch làm việc'
          : loaiLich === 'van_phong'
          ? 'Thêm việc làm tại văn phòng'
          : 'Đăng ký lịch công tác di chuyển'
      }
      phu_de={
        loaiLich === 'van_phong'
          ? 'Công việc xử lý tại văn phòng (tự động có hiệu lực, không cần xin duyệt)'
          : 'Lịch công tác ngoài phát sinh công tác phí (gửi Trưởng phòng duyệt)'
      }
      kich_thuoc="lg"
      cuoi={
        <div className="flex items-center justify-between w-full gap-2">
          <div>
            {dang_sua && khi_xoa && laQuanLy && (
              <button
                type="button"
                onClick={() => khi_xoa(dang_sua.id, dang_sua.ten_khach_hang)}
                disabled={dang_xu_ly}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 transition cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Xóa lịch</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!dang_sua && loaiLich === 'cong_tac_di_chuyen' && (
              <button
                type="button"
                onClick={() => void handleLuuVaGuiZalo()}
                disabled={dang_xu_ly}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Gửi Zalo xin duyệt</span>
              </button>
            )}
            <Nut kieu="outline" kich_thuoc="sm" type="button" onClick={khi_dong} disabled={dang_xu_ly}>
              Hủy
            </Nut>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={dang_xu_ly}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Save className="size-4" />
              <span>{dang_xu_ly ? 'Đang lưu...' : dang_sua ? 'Lưu thay đổi' : 'Lưu lịch'}</span>
            </button>
          </div>
        </div>
      }
    >
      <form id="form-lich-gap-kh" onSubmit={handleSubmit} className="space-y-4">
        {/* Bộ chọn phân loại: Công tác ngoài vs Việc tại VP */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setLoaiLich('cong_tac_di_chuyen');
              if (!laQuanLy && !dang_sua) setTrangThai('cho_duyet');
            }}
            className={cn(
              'h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer',
              loaiLich === 'cong_tac_di_chuyen'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>🚗 Công tác di chuyển</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoaiLich('van_phong');
              if (!dang_sua) setTrangThai('da_duyet');
            }}
            className={cn(
              'h-9 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer',
              loaiLich === 'van_phong'
                ? 'bg-white text-blue-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>🏢 Làm việc tại VP</span>
          </button>
        </div>

        {/* 1. Hồ sơ dự án liên quan (Cho cả công tác và văn phòng) */}
        <div className="space-y-1.5" ref={dropdownDARef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Hồ sơ dự án <span className="text-slate-400 font-normal">(Tùy chọn)</span>
            </label>
            {duAnId && (
              <button
                type="button"
                onClick={() => {
                  setDuAnId('');
                  setTimDuAn('');
                }}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                Bỏ chọn dự án
              </button>
            )}
          </div>

          <div className="relative">
            <FolderKanban className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={timDuAn}
              onChange={(e) => {
                setTimDuAn(e.target.value);
                setMoGoiYDA(true);
              }}
              onFocus={() => setMoGoiYDA(true)}
              placeholder="Tìm chọn hồ sơ dự án liên quan (mã hoặc tên dự án)..."
              className={cn(inputCls, 'pl-10 pr-9 font-medium')}
            />
            {timDuAn ? (
              <button
                type="button"
                onClick={() => {
                  setDuAnId('');
                  setTimDuAn('');
                  setMoGoiYDA(true);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            )}

            {moGoiYDA && dsDAGoiY.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                {dsDAGoiY.map((da) => {
                  const dangChon = da.id === duAnId;
                  const khCuaDA = da.khach_hang_id ? dsKhachHang.find((k) => k.id === da.khach_hang_id) : null;
                  return (
                    <button
                      key={da.id}
                      type="button"
                      onClick={() => chonDuAn(da)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg transition flex items-center justify-between gap-3 cursor-pointer',
                        dangChon ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {da.ten_du_an}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {da.ma_ho_so ? `[${da.ma_ho_so}] ` : ''}{khCuaDA?.ten_khach_hang || ''}
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

        {/* 2. Loại tác nghiệp văn phòng (Có ô nhập tùy ý + Gợi ý nhanh) */}
        {loaiLich === 'van_phong' && (
          <div className="space-y-2.5 p-3 bg-sky-50/70 rounded-xl border border-sky-100">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-sky-950">
                Tên công việc / Tác nghiệp VP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tenViecVP}
                onChange={(e) => {
                  setTenViecVP(e.target.value);
                  setLoaiViecVP(e.target.value);
                }}
                placeholder="Nhập tên việc VP (VD: Soạn báo giá gửi xã Bình Mỹ, Họp nội bộ...)"
                className={cn(inputCls, 'bg-white font-medium border-sky-200 focus:border-sky-500')}
              />
            </div>

            <div>
              <div className="text-[11px] font-semibold text-sky-800 mb-1.5">Gợi ý tác nghiệp nhanh:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'goi_dien', nhan: '📞 Gọi điện', text: 'Gọi điện trao đổi' },
                  { key: 'gui_bao_gia', nhan: '📄 Gửi báo giá', text: 'Soạn & gửi báo giá' },
                  { key: 'soan_hop_dong', nhan: '📝 Soạn hợp đồng', text: 'Soạn hợp đồng / đơn hàng' },
                  { key: 'cham_soc', nhan: '🤝 Chăm sóc KH', text: 'Chăm sóc & tư vấn khách hàng' },
                  { key: 'hop_noi_bo', nhan: '👥 Họp nội bộ', text: 'Họp nội bộ triển khai' },
                  { key: 'khao_sat', nhan: '🗺️ Kỹ thuật / Đo đạc', text: 'Kiểm tra bản đồ & kỹ thuật' },
                  { key: 'in_an', nhan: '📑 In ấn hồ sơ', text: 'Soạn & in ấn hồ sơ' }
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setLoaiViecVP(g.key);
                      if (!tenViecVP || tenViecVP.startsWith('Gọi điện') || tenViecVP.startsWith('Soạn &') || tenViecVP.startsWith('Họp') || tenViecVP.startsWith('Chăm sóc')) {
                        setTenViecVP(g.text);
                      }
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer',
                      loaiViecVP === g.key
                        ? 'bg-sky-600 border-sky-600 text-white shadow-2xs font-bold'
                        : 'bg-white border-sky-200 text-sky-800 hover:bg-sky-100'
                    )}
                  >
                    {g.nhan}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Khách hàng / Đơn vị */}
        <div className="space-y-1.5" ref={dropdownKHRef}>
          <label className="block text-xs font-bold text-slate-800">
            Khách hàng / Đơn vị{' '}
            {loaiLich === 'cong_tac_di_chuyen' ? (
              <span className="text-rose-500">*</span>
            ) : (
              <span className="text-slate-400 font-normal">(Không bắt buộc nếu là việc nội bộ)</span>
            )}
          </label>

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
              placeholder={loaiLich === 'van_phong' ? 'Tùy chọn: Nhập đơn vị hoặc để trống nếu việc nội bộ...' : 'Tìm chọn khách hàng hoặc nhập tên đơn vị công tác...'}
              className={cn(inputCls, 'pl-10 pr-9 font-medium')}
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

        {/* 4. Người liên hệ & Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5" ref={dropdownNLHRef}>
            <label className="block text-xs font-bold text-slate-800">Người liên hệ</label>

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
                placeholder="Họ tên người liên hệ..."
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
                placeholder="Số điện thoại..."
                className={cn(inputCls, 'pl-10')}
              />
            </div>
          </div>
        </div>

        {/* 5. Ngày hẹn & Khung giờ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Ngày thực hiện <span className="text-rose-500">*</span>
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

        {/* Cảnh báo trùng lịch */}
        {(coTrungCaNhan || coTrungChiNhanh) && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Lưu ý: Có lịch trùng cùng khung giờ</span>
            </div>
            {coTrungCaNhan && canhBaoTrung.trungCaNhan.map((l) => (
              <div key={l.id} className="pl-5 text-[11px]">
                • Cá nhân: {l.gio_bat_dau}–{l.gio_ket_thuc} ({l.ten_khach_hang})
              </div>
            ))}
            {coTrungChiNhanh && canhBaoTrung.trungChiNhanh.map((l) => {
              const ns = mapNhanSu.get(l.nguoi_phu_trach_id);
              return (
                <div key={l.id} className="pl-5 text-[11px]">
                  • Chi nhánh: {l.gio_bat_dau}–{l.gio_ket_thuc} ({ns?.ho_va_ten || 'NV'} - {l.ten_khach_hang})
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Địa điểm */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            {loaiLich === 'van_phong' ? 'Vị trí làm việc' : 'Địa điểm công tác'}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={diaDiem}
              onChange={(e) => setDiaDiem(e.target.value)}
              placeholder={loaiLich === 'van_phong' ? 'Tại văn phòng' : 'Địa chỉ hoặc lộ trình công tác...'}
              className={cn(inputCls, 'pl-10')}
            />
          </div>
        </div>

        {/* 7. Nhân sự chủ trì & Cùng tham gia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Nhân sự chủ trì</label>
            <select
              disabled={!laQuanLy}
              value={nguoiPhuTrachId}
              onChange={(e) => {
                const idMoi = e.target.value;
                setNguoiPhuTrachId(idMoi);
                setNguoiThamGiaIds((prev) => prev.filter((x) => x !== idMoi));
              }}
              className={cn(inputCls, !laQuanLy ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'cursor-pointer')}
            >
              {dsNhanSu.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten} {ns.chuc_vu ? `(${ns.chuc_vu})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 relative" ref={dropdownNSRef}>
            <label className="block text-xs font-bold text-slate-800">Cùng tham gia</label>

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

        {/* 8. Nội dung chi tiết */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Nội dung chi tiết / Ghi chú
          </label>
          <textarea
            rows={2}
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            placeholder="Chi tiết công việc, mục tiêu trao đổi..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
          />
        </div>

        {/* Phân loại KPI */}
        <div className="flex items-center gap-5 pt-1 flex-wrap">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={laTiepCanMoi}
              onChange={(e) => setLaTiepCanMoi(e.target.checked)}
              className="size-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Tiếp cận khách hàng mới</span>
          </label>

          {!dang_sua && loaiLich === 'cong_tac_di_chuyen' && (
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={laPhatSinh}
                onChange={(e) => {
                  setLaPhatSinh(e.target.checked);
                  if (e.target.checked) setTrangThai('cho_duyet');
                }}
                className="size-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Lịch phát sinh trong tuần</span>
            </label>
          )}
        </div>

        {/* 9. Trạng thái & Kết quả (khi cập nhật) */}
        {dang_sua && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Trạng thái lịch làm việc</label>
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

            {(trangThai === 'doi_lich' || trangThai === 'huy') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-rose-700">Lý do hoãn / dời / hủy lịch</label>
                <input
                  type="text"
                  value={lyDoDoiHuy}
                  onChange={(e) => setLyDoDoiHuy(e.target.value)}
                  placeholder="Ghi rõ lý do..."
                  className={cn(inputCls, 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20')}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Kết quả làm việc đạt được</label>
              <textarea
                rows={2}
                value={ketQua}
                onChange={(e) => setKetQua(e.target.value)}
                placeholder="Ghi nhận kết quả sau khi thực hiện..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
              />
            </div>
          </div>
        )}
      </form>
    </Ban_Ve>
  );
}
