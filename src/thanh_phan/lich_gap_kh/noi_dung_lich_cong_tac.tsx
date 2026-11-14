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
  ListFilter,
  ListTodo,
  BarChart3,
  CalendarCheck,
  Briefcase,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import HopYeuCauPhoiHop from '../ke_hoach/hop_yeu_cau_phoi_hop';
import ModalTaoYeuCauPhoiHop from '../ke_hoach/modal_tao_yeu_cau_phoi_hop';
import {
  danhSachYeuCauPhoiHop,
  langNgheYeuCauPhoiHop,
  type YeuCauPhoiHop
} from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import { danhSachHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';

import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import type {
  LichGapKH,
  TrangThaiLichGap,
  LoaiLichLamViec,
  LoaiViecVanPhong
} from '../../thu_vien/types/lich_gap_kh';
import { NHAN_LOAI_VIEC_VAN_PHONG } from '../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP } from '../../thu_vien/types/lich_gap_kh';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh } from '../../thu_vien/types/nhan_su';
import {
  danhSachLichGapKH,
  langNgheLichGapKH,
  taoLichGapKHMoi,
  capNhatLichGapKH,
  xoaLichGapKH,
  taoNhanhViecVanPhong,
  type TaoMoiLichGapDTO,
  type CapNhatLichGapDTO
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { danhSachKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { duocXemKhachHang, laQuanLyCapCaoHoacTruongPhong } from '../../thu_vien/phan_quyen/kiem_tra_quyen';
import FormLichGapModal, {
  type GiaTriMacDinhLichGap
} from './form_lich_gap_modal';
import { dongBoLichGapSangKeHoachTuanVaBaoCaoNgay, dongBoXoaLichGapSangKeHoachTuan } from '../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import { Bo_Cuc_Trang, Nut, DaiDien, ThanhSoLieu } from '../ui';

type CheDoXem = 'tuan' | 'thang' | 'danh_sach';

export const taoTieuDeLichHienThi = (lich: LichGapKH): {
  tieuDeChinh: string;
  chiTietThem?: string;
  icon: string;
  nhanLoai: string;
} => {
  const laVP = lich.loai_lich === 'van_phong';
  const tenDoiTuong = (lich.ten_khach_hang || '').trim();
  const nd = (lich.noi_dung || lich.tieu_de || '').trim();
  const nlh = (lich.ten_nguoi_lien_he || '').trim();

  if (!laVP) {
    const tenKH = tenDoiTuong && tenDoiTuong !== 'Làm việc tại văn phòng' ? tenDoiTuong : '';
    let tieuDeChinh = 'Công tác di chuyển';
    if (tenKH) {
      tieuDeChinh = `Công tác gặp ${tenKH}`;
    } else if (nd) {
      tieuDeChinh = `Công tác: ${nd}`;
    }
    const chiTietThem =
      tenKH && nd && !nd.toLowerCase().includes(tenKH.toLowerCase())
        ? nd
        : (lich.dia_diem ? `Địa điểm: ${lich.dia_diem}` : undefined);
    return {
      tieuDeChinh,
      chiTietThem: chiTietThem || undefined,
      icon: '🚗',
      nhanLoai: 'Công tác ngoài'
    };
  }

  const loaiVP = lich.loai_viec_vp || 'khac';
  let tienTo = 'Việc VP';
  let icon = '🏢';

  if (loaiVP === 'goi_dien') {
    tienTo = 'Gọi điện';
    icon = '📞';
  } else if (loaiVP === 'gui_bao_gia') {
    tienTo = 'Gửi báo giá';
    icon = '📄';
  } else if (loaiVP === 'soan_hop_dong') {
    tienTo = 'Soạn hợp đồng';
    icon = '📝';
  } else if (loaiVP === 'cham_soc') {
    tienTo = 'Chăm sóc KH';
    icon = '🤝';
  } else if (loaiVP === 'hop_noi_bo') {
    tienTo = 'Họp nội bộ';
    icon = '👥';
  }

  const target = nlh || (tenDoiTuong && tenDoiTuong !== 'Làm việc tại văn phòng' ? tenDoiTuong : '');
  let tieuDeChinh = '';
  if (loaiVP === 'hop_noi_bo') {
    tieuDeChinh = nd ? `Họp nội bộ: ${nd}` : 'Họp nội bộ văn phòng';
  } else if (target) {
    tieuDeChinh = `${tienTo} ${target}`;
  } else if (nd) {
    tieuDeChinh = `${tienTo}: ${nd}`;
  } else {
    tieuDeChinh = tienTo;
  }

  const chiTietThem =
    target && nd && !nd.toLowerCase().includes(target.toLowerCase())
      ? nd
      : undefined;

  return {
    tieuDeChinh,
    chiTietThem,
    icon,
    nhanLoai: NHAN_LOAI_VIEC_VAN_PHONG[loaiVP] || 'Văn phòng'
  };
};


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

const CHIEU_CAO_GIO = 72;

const chuyenGioSangPhut = (gio?: string): number => {
  const [h, m] = (gio || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const layPhutHienTai = (): number => {
  const chuoi = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date());
  return chuyenGioSangPhut(chuoi);
};

export interface PropsTrangLichCongTac {
  cheDoXemMacDinh?: CheDoXem;
  anThanh3Tab?: boolean;
  tabKhoiTao?: 'lich_lam_viec' | 'yeu_cau_ho_tro';
}

export function NoiDungLichCongTac({
  cheDoXemMacDinh,
  anThanh3Tab = true
}: PropsTrangLichCongTac = {}) {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabChinh, setTabChinh] = useState<'lich_lam_viec' | 'yeu_cau_ho_tro'>('lich_lam_viec');
  const [danhSachYeuCau, setDanhSachYeuCau] = useState<YeuCauPhoiHop[]>([]);
  const [dsHoSoDuAn, setDsHoSoDuAn] = useState<HoSoDuAn[]>([]);
  const [moModalTaoYeuCau, setMoModalTaoYeuCau] = useState(false);
  const [duAnChoYeuCau, setDuAnChoYeuCau] = useState<HoSoDuAn | null>(null);

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'yeu_cau_ho_tro') {
      setTabChinh('yeu_cau_ho_tro');
    }
    const viewParam = searchParams?.get('view') as CheDoXem | null;
    if (viewParam && ['tuan', 'thang', 'danh_sach'].includes(viewParam)) {
      setCheDoXem(viewParam);
    }
  }, [searchParams]);

  const soYeuCauCanXuLy = useMemo(() => {
    return danhSachYeuCau.filter((yc) => yc.trang_thai !== 'da_hoan_thanh').length;
  }, [danhSachYeuCau]);

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

  const laQuanLy = useMemo(() => {
    return laQuanLyCapCaoHoacTruongPhong(nguoiDungHienTai);
  }, [nguoiDungHienTai]);

  // Điều khiển Calendar & Bộ lọc
  const [cheDoXem, setCheDoXem] = useState<CheDoXem>(() => cheDoXemMacDinh || 'tuan');
  const [ngayDangXem, setNgayDangXem] = useState<string>(homNayISO);
  const [ngayChonTrongThang, setNgayChonTrongThang] = useState<string>(homNayISO);
  const [ngayChonTuan, setNgayChonTuan] = useState<string>(homNayISO);
  const [phutHienTai, setPhutHienTai] = useState<number>(() => layPhutHienTai());

  useEffect(() => {
    const timer = setInterval(() => setPhutHienTai(layPhutHienTai()), 60000);
    return () => clearInterval(timer);
  }, []);
  const [chiNhanhLoc, setChiNhanhLoc] = useState<string>('tat_ca');
  const [nhanSuLoc, setNhanSuLoc] = useState<string>('tat_ca');
  const [locLoaiLich, setLocLoaiLich] = useState<'tat_ca' | 'cong_tac_di_chuyen' | 'van_phong'>('tat_ca');
  const [tenViecVPNhanh, setTenViecVPNhanh] = useState('');
  const [loaiViecVPNhanh, setLoaiViecVPNhanh] = useState<LoaiViecVanPhong>('goi_dien');
  const [dangThemNhanhVP, setDangThemNhanhVP] = useState(false);

  useEffect(() => {
    setNgayChonTrongThang(ngayDangXem);
  }, [ngayDangXem]);

  // Modal tạo/sửa lịch
  const [moModal, setMoModal] = useState(false);
  const [lichDangSua, setLichDangSua] = useState<LichGapKH | null>(null);
  const [giaTriMacDinhModal, setGiaTriMacDinhModal] = useState<GiaTriMacDinhLichGap | null>(null);

  const dsKhachHangHieuLuc = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    if (laQuanLy) return dsKhachHang;
    return dsKhachHang.filter((kh) => {
      if (lichDangSua?.khach_hang_id === kh.id) return true;
      return duocXemKhachHang(nguoiDungHienTai, kh);
    });
  }, [dsKhachHang, laQuanLy, lichDangSua, nguoiDungHienTai]);

  const taiDanhMuc = useCallback(async () => {
    try {
      const [khs, nlhs, nss, cns, das, ycs] = await Promise.all([
        danhSachKhachHang(),
        danhSachNguoiLienHe(),
        danhSachNhanSu(),
        danhSachChiNhanh(),
        danhSachHoSoDuAn(),
        danhSachYeuCauPhoiHop()
      ]);
      setDsHoSoDuAn(Array.isArray(das) ? das : (das as any)?.mang || []);
      setDanhSachYeuCau(Array.isArray(ycs) ? ycs : []);
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
    const unsubYC = langNgheYeuCauPhoiHop((data) => {
      setDanhSachYeuCau(data);
    });
    return () => {
      unsub();
      unsubYC();
    };
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
      // 1. Phân quyền: Lịch của sale nào thì sale đó thấy, chỉ có quản lý mới thấy hết
      if (!laQuanLy && nguoiDungHienTai?.id) {
        const laChuTri = l.nguoi_phu_trach_id === nguoiDungHienTai.id;
        const laNguoiTao = l.nguoi_tao_id === nguoiDungHienTai.id;
        const laThamGia = Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(nguoiDungHienTai.id);
        if (!laChuTri && !laNguoiTao && !laThamGia) return false;
      }

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
  }, [dsLich, laQuanLy, nguoiDungHienTai?.id, chiNhanhLoc, nhanSuLoc, mapNhanSu]);

  // 7 ngày của tuần đang xem
  const ds7NgayTuan = useMemo(() => layDanhSach7NgayTrongTuan(ngayDangXem), [ngayDangXem]);
  const luoiNgayThang = useMemo(() => layLuoiNgayTrongThang(ngayDangXem), [ngayDangXem]);

  // Lịch tuần mobile: ngày đang chọn, khung giờ & bố trí thẻ theo giờ
  const ngayTuanHienThi =
    ds7NgayTuan.find((d) => d.iso === ngayChonTuan) ??
    ds7NgayTuan.find((d) => d.laHomNay) ??
    ds7NgayTuan[0];

  const lichNgayChon = useMemo(
    () =>
      dsLichLoc
        .filter((l) => l.ngay === ngayTuanHienThi.iso && l.trang_thai !== 'huy')
        .sort((a, b) => a.gio_bat_dau.localeCompare(b.gio_bat_dau)),
    [dsLichLoc, ngayTuanHienThi.iso]
  );

  const khungGio = useMemo(() => {
    let dau = 8;
    let cuoi = 18;
    dsLichLoc
      .filter((l) => l.ngay === ngayTuanHienThi.iso)
      .forEach((l) => {
        dau = Math.min(dau, Math.floor(chuyenGioSangPhut(l.gio_bat_dau) / 60));
        cuoi = Math.max(cuoi, Math.ceil(chuyenGioSangPhut(l.gio_ket_thuc) / 60));
      });
    return { dau, cuoi: Math.min(24, Math.max(cuoi, dau + 1)) };
  }, [dsLichLoc, ngayTuanHienThi.iso]);

  const lichBoTri = useMemo(() => {
    const muc = dsLichLoc
      .filter((l) => l.ngay === ngayTuanHienThi.iso)
      .map((lich) => {
        const batDau = chuyenGioSangPhut(lich.gio_bat_dau);
        const ketThuc = Math.max(chuyenGioSangPhut(lich.gio_ket_thuc), batDau + 30);
        return { lich, batDau, ketThuc, lane: 0, tongLane: 1 };
      })
      .sort((a, b) => a.batDau - b.batDau || a.ketThuc - b.ketThuc);

    let nhom: typeof muc = [];
    let lanes: number[] = [];
    let ketThucNhom = -1;
    const chotNhom = () => {
      nhom.forEach((m) => {
        m.tongLane = lanes.length || 1;
      });
      nhom = [];
      lanes = [];
    };
    muc.forEach((m) => {
      if (nhom.length > 0 && m.batDau >= ketThucNhom) chotNhom();
      let idx = lanes.findIndex((ketThuc) => ketThuc <= m.batDau);
      if (idx === -1) {
        idx = lanes.length;
        lanes.push(m.ketThuc);
      } else {
        lanes[idx] = m.ketThuc;
      }
      m.lane = idx;
      ketThucNhom = nhom.length === 0 ? m.ketThuc : Math.max(ketThucNhom, m.ketThuc);
      nhom.push(m);
    });
    chotNhom();
    return muc;
  }, [dsLichLoc, ngayTuanHienThi.iso]);

  const viTriDuongHienTai =
    ngayTuanHienThi.iso === homNayISO &&
    phutHienTai >= khungGio.dau * 60 &&
    phutHienTai <= khungGio.cuoi * 60
      ? ((phutHienTai - khungGio.dau * 60) / 60) * CHIEU_CAO_GIO
      : null;

  const chuyenTuanMobile = (huong: -1 | 1) => {
    const [y, m, d] = ngayTuanHienThi.iso.split('-').map(Number);
    const moi = chuyenDateSangISO(new Date(y, m - 1, d + huong * 7));
    setNgayChonTuan(moi);
    setNgayDangXem(moi);
  };

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
      nguoi_phu_trach_id: laQuanLy && nhanSuLoc !== 'tat_ca' ? nhanSuLoc : nguoiDungHienTai?.id,
      chi_nhanh_id: chiNhanhLoc !== 'tat_ca' ? chiNhanhLoc : nguoiDungHienTai?.chi_nhanh_id
    });
    setMoModal(true);
  };

  const handleLuuLich = async (dto: TaoMoiLichGapDTO | CapNhatLichGapDTO) => {
    setDangLuu(true);
    try {
      let lichDaLuu: LichGapKH | null = null;
      if (lichDangSua) {
        await capNhatLichGapKH(lichDangSua.id, dto, nguoiDungHienTai?.id);
        lichDaLuu = { ...lichDangSua, ...dto } as LichGapKH;
      } else {
        lichDaLuu = await taoLichGapKHMoi(dto as TaoMoiLichGapDTO);
      }
      if (lichDaLuu) {
        void dongBoLichGapSangKeHoachTuanVaBaoCaoNgay({
          lich: lichDaLuu,
          nguoiThucHien: nguoiDungHienTai
        });
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

  const handleThemNhanhViecVP = async () => {
    if (!tenViecVPNhanh.trim()) return;
    setDangThemNhanhVP(true);
    try {
      const lichMoi = await taoNhanhViecVanPhong({
        tieu_de: tenViecVPNhanh.trim(),
        ngay: ngayChonTuan || homNayISO,
        gio_bat_dau: '08:30',
        loai_viec_vp: loaiViecVPNhanh,
        nguoi_phu_trach_id: nguoiDungHienTai?.id || '',
        nguoi_tao_id: nguoiDungHienTai?.id || '',
        chi_nhanh_id: nguoiDungHienTai?.chi_nhanh_id || null
      });
      setTenViecVPNhanh('');
      setDsLich((prev) => [lichMoi, ...prev]);
      void dongBoLichGapSangKeHoachTuanVaBaoCaoNgay({
        lich: lichMoi,
        nguoiThucHien: nguoiDungHienTai
      });
    } catch (err) {
      console.error('Lỗi thêm nhanh việc VP:', err);
      alert('Không thể thêm việc văn phòng. Vui lòng thử lại!');
    } finally {
      setDangThemNhanhVP(false);
    }
  };

  const handleToggleXong = async (lich: LichGapKH, e: React.MouseEvent) => {
    e.stopPropagation();
    const trangThaiMoi = lich.trang_thai === 'da_hoan_thanh' ? 'da_duyet' : 'da_hoan_thanh';
    try {
      await capNhatLichGapKH(lich.id, { trang_thai: trangThaiMoi }, nguoiDungHienTai?.id);
      setDsLich((prev) =>
        prev.map((x) => (x.id === lich.id ? { ...x, trang_thai: trangThaiMoi } : x))
      );
      void dongBoLichGapSangKeHoachTuanVaBaoCaoNgay({
        lich: { ...lich, trang_thai: trangThaiMoi },
        nguoiThucHien: nguoiDungHienTai
      });
    } catch (err) {
      console.error('Lỗi cập nhật hoàn thành việc:', err);
    }
  };

    const handleXoaLich = async (id: string, tenKH: string) => {
    if (!laQuanLy) {
      alert('Chỉ Cấp Quản lý mới có quyền xóa lịch làm việc/công tác đã tạo. Bạn có thể cập nhật nội dung hoặc dời lịch.');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa lịch gặp "${tenKH}"?`)) return;
    try {
      const lichCanXoa = dsLich.find((l) => l.id === id);
      await xoaLichGapKH(id, nguoiDungHienTai?.id);
      if (lichCanXoa) {
        await dongBoXoaLichGapSangKeHoachTuan({
          lichId: id,
          nhanVienId: lichCanXoa.nguoi_phu_trach_id,
          ngayISO: lichCanXoa.ngay,
          nguoiThucHien: nguoiDungHienTai
        });
      }
      setMoModal(false);
      setLichDangSua(null);
      await taiDanhSachLich();
    } catch {
      alert('Không thể xóa lịch gặp.');
    }
  };

  // Tìm lịch gần nhất với hôm nay để gợi ý chuyển kỳ khi tuần/tháng đang xem trống
  const lichGanNhat = useMemo(() => {
    if (dsLichLoc.length === 0) return null;
    const sorted = [...dsLichLoc].sort(
      (a, b) =>
        Math.abs(new Date(a.ngay).getTime() - new Date(homNayISO).getTime()) -
        Math.abs(new Date(b.ngay).getTime() - new Date(homNayISO).getTime())
    );
    return sorted[0] || null;
  }, [dsLichLoc, homNayISO]);

  const coLichNgoaiKyHienTai = useMemo(() => {
    if (dsLichLoc.length === 0) return false;
    if (cheDoXem === 'tuan') return thongKe.lichTuanNay === 0;
    if (cheDoXem === 'thang') return thongKe.lichThangNay === 0;
    return false;
  }, [dsLichLoc.length, cheDoXem, thongKe.lichTuanNay, thongKe.lichThangNay]);

  // Nhóm lịch theo ngày cho chế độ Danh sách (Agenda)
  const nhomLichTheoNgay = useMemo(() => {
    const dsTrongKy =
      cheDoXem === 'danh_sach'
        ? dsLichLoc
        : dsLichLoc.filter((l) => {
            const dauTuan = ds7NgayTuan[0]?.iso || homNayISO;
            const cuoiTuan = ds7NgayTuan[6]?.iso || homNayISO;
            const thangHienTai = ngayDangXem.slice(0, 7);
            if (cheDoXem === 'thang') return l.ngay.startsWith(thangHienTai);
            return l.ngay >= dauTuan && l.ngay <= cuoiTuan;
          });

    const map = new Map<string, LichGapKH[]>();
    dsTrongKy.forEach((l) => {
      const arr = map.get(l.ngay) || [];
      arr.push(l);
      map.set(l.ngay, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [dsLichLoc, ds7NgayTuan, homNayISO, ngayDangXem, cheDoXem]);

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      {/* THANH ĐIỀU HƯỚNG TAB: LỊCH LÀM VIỆC & YÊU CẦU HỖ TRỢ */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTabChinh('lich_lam_viec')}
            className={cn(
              'h-9 px-4 rounded-lg inline-flex items-center gap-2 text-xs font-bold transition cursor-pointer',
              tabChinh === 'lich_lam_viec'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <CalendarCheck className="size-4 text-emerald-600" />
            <span>Lịch làm việc</span>
          </button>

          <button
            type="button"
            onClick={() => setTabChinh('yeu_cau_ho_tro')}
            className={cn(
              'h-9 px-4 rounded-lg inline-flex items-center gap-2 text-xs font-bold transition cursor-pointer',
              tabChinh === 'yeu_cau_ho_tro'
                ? 'bg-white text-amber-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Sparkles className="size-4 text-amber-500" />
            <span>Yêu cầu hỗ trợ</span>
            {soYeuCauCanXuLy > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {soYeuCauCanXuLy}
              </span>
            )}
          </button>
        </div>

        {tabChinh === 'yeu_cau_ho_tro' && (
          <button
            type="button"
            onClick={() => {
              setDuAnChoYeuCau(null);
              setMoModalTaoYeuCau(true);
            }}
            className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition active:scale-95"
          >
            <Plus className="size-4" />
            <span>+ Gửi yêu cầu hỗ trợ</span>
          </button>
        )}
      </div>

      {tabChinh === 'yeu_cau_ho_tro' ? (
        <HopYeuCauPhoiHop
          danhSachYeuCau={danhSachYeuCau}
          nguoiDungHienTai={nguoiDungHienTai}
          onXoaYeuCau={(ycId) => setDanhSachYeuCau((prev) => prev.filter((x) => x.id !== ycId))}
          onCapNhatYeuCau={(ycCapNhat) =>
            setDanhSachYeuCau((prev) =>
              prev.map((x) => (x.id === ycCapNhat.id ? ycCapNhat : x))
            )
          }
          onMoModalTaoYeuCau={() => {
            setDuAnChoYeuCau(null);
            setMoModalTaoYeuCau(true);
          }}
          onMoChiTietDuAn={(daId) => router.push(`/ho-so-du-an/${daId}`)}
        />
      ) : (
        <>
      <ThanhSoLieu
        items={[
          {
            id: 'hom_nay',
            nhan: 'Lịch hôm nay',
            nhan_ngan: 'Hôm nay',
            so_lieu: thongKe.lichHomNay,
            icon: Clock,
            mau_so: 'xanh_duong',
            dang_chon: ngayChonTuan === homNayISO && cheDoXem === 'tuan',
            khi_bam: () => {
              setNgayDangXem(homNayISO);
              setNgayChonTrongThang(homNayISO);
              setNgayChonTuan(homNayISO);
              setCheDoXem('tuan');
            },
          },
          {
            id: 'tuan_nay',
            nhan: 'Lịch tuần này',
            nhan_ngan: 'Tuần này',
            so_lieu: thongKe.lichTuanNay,
            icon: CalendarIcon,
            mau_so: 'trang',
            dang_chon: cheDoXem === 'tuan',
            khi_bam: () => setCheDoXem('tuan'),
          },
          {
            id: 'thang_nay',
            nhan: 'Lịch trong tháng',
            nhan_ngan: 'Tháng này',
            so_lieu: thongKe.lichThangNay,
            icon: Users,
            mau_so: 'vang',
            dang_chon: cheDoXem === 'thang',
            khi_bam: () => setCheDoXem('thang'),
          },
          {
            id: 'da_hoan_thanh',
            nhan: 'Đã hoàn thành',
            nhan_ngan: 'Đã gặp',
            so_lieu: thongKe.daHoanThanh,
            icon: CheckCircle2,
            mau_so: 'xanh_la',
          },
          {
            id: 'tat_ca',
            nhan: 'Tất cả lịch',
            nhan_ngan: 'Tất cả',
            so_lieu: dsLichLoc.length,
            icon: ListFilter,
            mau_so: 'trang',
            dang_chon: cheDoXem === 'danh_sach',
            khi_bam: () => setCheDoXem('danh_sach'),
          },
        ]}
      />

{/* Banner nhắc thông minh khi kỳ đang xem chưa có lịch nhưng có lịch ở kỳ khác */}
      {coLichNgoaiKyHienTai && lichGanNhat && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-600 shrink-0" />
            <span>
              Kỳ đang xem (<strong>{tieuDeThoiGian}</strong>) chưa có lịch hẹn. Bạn đang có{' '}
              <strong className="text-amber-800">{dsLichLoc.length}</strong> lịch công tác ở các kỳ khác.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setNgayDangXem(lichGanNhat.ngay);
              setNgayChonTuan(lichGanNhat.ngay);
              setNgayChonTrongThang(lichGanNhat.ngay);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
          >
            <CalendarIcon className="size-3.5" />
            <span>Chuyển đến kỳ có lịch ({formatNgay(lichGanNhat.ngay)})</span>
          </button>
        </div>
      )}

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
                setNgayChonTuan(homNayISO);
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

        {/* Cụm lọc Chi nhánh, Nhân viên (Chỉ Quản lý mới thấy) & Chuyển chế độ xem Desktop */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          {laQuanLy ? (
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
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <UserRound className="size-3.5 text-primary" />
              <span>Lịch của bạn ({nguoiDungHienTai?.ho_va_ten || 'Cá nhân'})</span>
            </div>
          )}

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

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGiaTriMacDinhModal({
                  ngay: homNayISO,
                  gio_bat_dau: '08:30',
                  loai_lich: 'van_phong'
                });
                setLichDangSua(null);
                setMoModal(true);
              }}
              className="h-8.5 px-3 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Briefcase className="size-3.5" />
              <span>+ Việc tại VP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGiaTriMacDinhModal({
                  ngay: homNayISO,
                  gio_bat_dau: '09:00',
                  loai_lich: 'cong_tac_di_chuyen'
                });
                setLichDangSua(null);
                setMoModal(true);
              }}
              className="h-8.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Plus className="size-4" />
              <span>+ Công tác ngoài</span>
            </button>
          </div>
        </div>
      </div>

      {/* BỘ LỌC PHÂN LOẠI & THANH THÊM NHANH VIỆC TẠI VĂN PHÒNG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Bộ lọc loại lịch: Tất cả, Công tác ngoài, Việc tại VP */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setLocLoaiLich('tat_ca')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer',
              locLoaiLich === 'tat_ca'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Tất cả lịch
          </button>
          <button
            type="button"
            onClick={() => setLocLoaiLich('cong_tac_di_chuyen')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1',
              locLoaiLich === 'cong_tac_di_chuyen'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span>🚗 Công tác ngoài</span>
          </button>
          <button
            type="button"
            onClick={() => setLocLoaiLich('van_phong')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1',
              locLoaiLich === 'van_phong'
                ? 'bg-white text-blue-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span>🏢 Việc tại VP</span>
          </button>
        </div>

        {/* Thanh thêm nhanh việc tại văn phòng */}
        <div className="flex-1 max-w-xl flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <input
            type="text"
            value={tenViecVPNhanh}
            onChange={(e) => setTenViecVPNhanh(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleThemNhanhViecVP();
            }}
            placeholder="Gõ việc tại VP (VD: Gọi điện khách hàng, gửi báo giá...)"
            className="flex-1 h-8 px-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          <select
            value={loaiViecVPNhanh}
            onChange={(e) => setLoaiViecVPNhanh(e.target.value as LoaiViecVanPhong)}
            className="h-8 px-2 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer focus:outline-none"
          >
            {(['goi_dien', 'gui_bao_gia', 'soan_hop_dong', 'cham_soc', 'hop_noi_bo', 'khac'] as LoaiViecVanPhong[]).map((k) => (
              <option key={k} value={k}>
                {NHAN_LOAI_VIEC_VAN_PHONG[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleThemNhanhViecVP()}
            disabled={dangThemNhanhVP || !tenViecVPNhanh.trim()}
            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Thêm</span>
          </button>
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

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGiaTriMacDinhModal({
                                      ngay: cotNgay.iso,
                                      gio_bat_dau: '08:30',
                                      loai_lich: 'van_phong'
                                    });
                                    setLichDangSua(null);
                                    setMoModal(true);
                                  }}
                                  className="size-6.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Thêm việc tại văn phòng"
                                >
                                  <Briefcase className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGiaTriMacDinhModal({
                                      ngay: cotNgay.iso,
                                      gio_bat_dau: '09:00',
                                      loai_lich: 'cong_tac_di_chuyen'
                                    });
                                    setLichDangSua(null);
                                    setMoModal(true);
                                  }}
                                  className="size-6.5 rounded-lg bg-white border border-slate-200/80 text-slate-500 hover:text-emerald-700 hover:border-emerald-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
                                  title="Thêm lịch công tác ngoài"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>
                            </div>

                            {/* Danh sách thẻ sự kiện trong ngày */}
                            <div className="p-2 space-y-2 flex-1">
                              {lichTrongNgay.map((lich) => {
                                const ns = mapNhanSu.get(lich.nguoi_phu_trach_id);
                                const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find(
                                  (t) => t.key === lich.trang_thai
                                );
                                const laViecVP = lich.loai_lich === 'van_phong';
                                const daHoanThanh = lich.trang_thai === 'da_hoan_thanh';
                                const infoHienThi = taoTieuDeLichHienThi(lich);

                                if (laViecVP) {
                                  return (
                                    <div
                                      key={lich.id}
                                      onClick={() => {
                                        setLichDangSua(lich);
                                        setMoModal(true);
                                      }}
                                      className={cn(
                                        'p-2.5 rounded-xl border transition cursor-pointer shadow-2xs space-y-1 border-l-4',
                                        daHoanThanh
                                          ? 'bg-slate-50/80 border-slate-200 opacity-70 border-l-slate-400'
                                          : 'bg-sky-50/90 border-sky-200/90 hover:bg-sky-100/90 border-l-sky-500 text-sky-950'
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[9.5px] font-bold text-sky-700 bg-white/95 px-1.5 py-0.5 rounded-md border border-sky-200/70 inline-flex items-center gap-1">
                                          <span>{infoHienThi.icon}</span>
                                          <span>{infoHienThi.nhanLoai}</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => void handleToggleXong(lich, e)}
                                          className={cn(
                                            'size-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0',
                                            daHoanThanh
                                              ? 'bg-emerald-600 border-emerald-600 text-white'
                                              : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-500'
                                          )}
                                          title={daHoanThanh ? 'Đã xong (Bấm để mở lại)' : 'Đánh dấu hoàn thành'}
                                        >
                                          <Check className="size-3" strokeWidth={3} />
                                        </button>
                                      </div>

                                      <div className={cn('text-xs font-bold leading-snug line-clamp-2 text-slate-900', daHoanThanh && 'line-through text-slate-500')}>
                                        {infoHienThi.tieuDeChinh}
                                      </div>

                                      {infoHienThi.chiTietThem && (
                                        <div className="text-[11px] text-slate-500 truncate">
                                          {infoHienThi.chiTietThem}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-1 border-t border-sky-100/80 text-[10.5px] text-slate-500">
                                        <span>{lich.gio_bat_dau || 'VP'}</span>
                                        <span className="truncate max-w-[100px]">{ns?.ho_va_ten || ''}</span>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={lich.id}
                                    onClick={() => {
                                      setLichDangSua(lich);
                                      setMoModal(true);
                                    }}
                                    className={cn(
                                      'p-2.5 rounded-xl border transition cursor-pointer shadow-2xs space-y-1.5 border-l-4',
                                      lich.trang_thai === 'huy'
                                        ? 'bg-slate-100 border-slate-200 opacity-60 line-through border-l-slate-400'
                                        : 'bg-amber-50/90 border-amber-200/90 hover:bg-amber-100/90 border-l-amber-500 text-amber-950'
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-200/80 inline-flex items-center gap-1 shrink-0">
                                          <span>🚗</span>
                                          <span>Công tác</span>
                                        </span>
                                        <span className="text-[10.5px] font-extrabold text-amber-900 tabular-nums truncate">
                                          {lich.gio_bat_dau}–{lich.gio_ket_thuc}
                                        </span>
                                      </div>
                                      <span
                                        className={cn(
                                          'size-2 rounded-full shrink-0',
                                          ttObj?.mauDot || 'bg-amber-500'
                                        )}
                                        title={ttObj?.tieu_de}
                                      />
                                    </div>

                                    <div className="text-xs font-bold leading-snug line-clamp-2 text-slate-900">
                                      {infoHienThi.tieuDeChinh}
                                    </div>

                                    {infoHienThi.chiTietThem && (
                                      <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate">
                                        {lich.dia_diem && <MapPin className="size-3 shrink-0 text-slate-400" />}
                                        <span className="truncate">{infoHienThi.chiTietThem}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
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

              {/* MOBILE: LỊCH TUẦN - Thanh chọn ngày + Timeline theo giờ của ngày đang chọn */}
              <div className="sm:hidden space-y-3">
                <div className="bg-[#0e3e2d] rounded-[28px] p-4 space-y-4 shadow-[0_8px_24px_rgba(14,62,45,0.18)]">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => chuyenTuanMobile(-1)}
                      aria-label="Tuần trước"
                      className="size-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <span className="text-[15px] font-bold text-white tracking-tight">
                      Tháng {Number(ngayTuanHienThi.iso.slice(5, 7))}, {ngayTuanHienThi.iso.slice(0, 4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => chuyenTuanMobile(1)}
                      aria-label="Tuần sau"
                      className="size-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {ds7NgayTuan.map((ngay, idx) => {
                      const dangChon = ngay.iso === ngayTuanHienThi.iso;
                      const coLich = dsLichLoc.some((l) => l.ngay === ngay.iso && l.trang_thai !== 'huy');
                      return (
                        <button
                          key={ngay.iso}
                          type="button"
                          onClick={() => setNgayChonTuan(ngay.iso)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
                        >
                          <span className="text-[11px] font-medium text-emerald-100/60">
                            {idx === 6 ? 'CN' : `T${idx + 2}`}
                          </span>
                          <span
                            className={cn(
                              'size-9 rounded-full flex items-center justify-center text-[14px] font-bold tabular-nums transition',
                              dangChon
                                ? 'bg-amber-400 text-[#0e3e2d]'
                                : ngay.laHomNay
                                ? 'text-white ring-1 ring-amber-300/80'
                                : 'text-white'
                            )}
                          >
                            {ngay.ngayThang.slice(0, 2)}
                          </span>
                          <span
                            className={cn(
                              'size-1 rounded-full',
                              coLich ? 'bg-amber-300' : 'bg-transparent'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoThemNhanh(ngayTuanHienThi.iso, '09:00')}
                    className="w-full h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-[#0e3e2d] text-[14px] font-extrabold flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[2.8]" />
                    Thêm lịch hẹn
                  </button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">
                    {ngayTuanHienThi.thu}, {ngayTuanHienThi.ngayThang}
                  </h3>
                  {lichNgayChon.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-extrabold tabular-nums">
                      {lichNgayChon.length} lịch
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] px-3 py-4">
                  <div className="relative flex" style={{ height: (khungGio.cuoi - khungGio.dau) * CHIEU_CAO_GIO }}>
                    <div className="w-12 shrink-0 relative">
                      {Array.from({ length: khungGio.cuoi - khungGio.dau + 1 }, (_, i) => (
                        <span
                          key={i}
                          className="absolute left-0 text-[11px] font-semibold text-slate-400 tabular-nums leading-none"
                          style={{ top: i * CHIEU_CAO_GIO - 5 }}
                        >
                          {String(khungGio.dau + i).padStart(2, '0')}:00
                        </span>
                      ))}
                    </div>

                    <div className="relative flex-1 min-w-0">
                      {Array.from({ length: khungGio.cuoi - khungGio.dau }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Thêm lịch lúc ${String(khungGio.dau + i).padStart(2, '0')}:00`}
                          onClick={() =>
                            handleMoThemNhanh(
                              ngayTuanHienThi.iso,
                              `${String(khungGio.dau + i).padStart(2, '0')}:00`
                            )
                          }
                          className="absolute inset-x-0 border-t border-slate-100 active:bg-slate-50 transition cursor-pointer"
                          style={{ top: i * CHIEU_CAO_GIO, height: CHIEU_CAO_GIO }}
                        />
                      ))}
                      <div
                        className="absolute inset-x-0 border-t border-slate-100"
                        style={{ top: (khungGio.cuoi - khungGio.dau) * CHIEU_CAO_GIO }}
                      />

                      {lichBoTri.map((muc) => {
                        const { lich } = muc;
                        const top = ((muc.batDau - khungGio.dau * 60) / 60) * CHIEU_CAO_GIO;
                        const cao = Math.max(((muc.ketThuc - muc.batDau) / 60) * CHIEU_CAO_GIO - 4, 44);
                        const dangDienRa =
                          ngayTuanHienThi.iso === homNayISO &&
                          phutHienTai >= muc.batDau &&
                          phutHienTai < muc.ketThuc &&
                          lich.trang_thai !== 'huy';
                        const dsNguoi = Array.from(
                          new Set([lich.nguoi_phu_trach_id, ...(lich.nguoi_tham_gia_ids || [])].filter(Boolean))
                        );
                        const rong = cao >= 92;

                        return (
                          <div
                            key={lich.id}
                            role="button"
                            onClick={() => {
                              setLichDangSua(lich);
                              setMoModal(true);
                            }}
                            className={cn(
                              'absolute z-10 rounded-2xl px-3 py-2 overflow-hidden cursor-pointer active:scale-[0.98] transition',
                              lich.trang_thai === 'huy'
                                ? 'bg-slate-100 opacity-60 line-through'
                                : dangDienRa
                                ? 'bg-[#FFEBD6]'
                                : lich.trang_thai === 'da_hoan_thanh'
                                ? 'bg-emerald-50 border border-emerald-100'
                                : 'bg-white border border-slate-200 shadow-xs'
                            )}
                            style={{
                              top: top + 2,
                              height: cao,
                              left: `calc(${(muc.lane / muc.tongLane) * 100}% + 4px)`,
                              width: `calc(${100 / muc.tongLane}% - 6px)`
                            }}
                          >
                            {(() => {
                              const infoH = taoTieuDeLichHienThi(lich);
                              const isVP = lich.loai_lich === 'van_phong';
                              return (
                                <>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={cn('text-[9.5px] font-bold px-1.5 py-0.2 rounded', isVP ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')}>
                                      {infoH.icon} {isVP ? infoH.nhanLoai : 'Công tác'}
                                    </span>
                                  </div>
                                  <div className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">
                                    {infoH.tieuDeChinh}
                                  </div>
                                  {infoH.chiTietThem && (
                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                      {infoH.chiTietThem}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                            <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                              {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                            </div>
                            {rong && lich.dia_diem && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 min-w-0">
                                <MapPin className="size-3 shrink-0" />
                                <span className="truncate">{lich.dia_diem}</span>
                              </div>
                            )}
                            {rong && dsNguoi.length > 0 && (
                              <div className="flex items-center mt-2">
                                {dsNguoi.slice(0, 3).map((id, i) => (
                                  <DaiDien
                                    key={id}
                                    ten={mapNhanSu.get(id)?.ho_va_ten || 'NV'}
                                    kich_thuoc="xs"
                                    className={cn('size-6 text-[10px] ring-2 ring-white', i > 0 && '-ml-1.5')}
                                  />
                                ))}
                                {dsNguoi.length > 3 && (
                                  <span className="ml-1.5 text-[11px] font-bold text-slate-500">
                                    +{dsNguoi.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {viTriDuongHienTai !== null && (
                        <div
                          className="absolute inset-x-0 z-20 pointer-events-none flex items-center"
                          style={{ top: viTriDuongHienTai }}
                        >
                          <span className="size-2 rounded-full border-2 border-amber-400 bg-white -ml-1 shrink-0" />
                          <span className="h-px flex-1 bg-amber-400" />
                        </div>
                      )}
                    </div>
                  </div>
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
                                const infoH = taoTieuDeLichHienThi(lich);
                                const isVP = lich.loai_lich === 'van_phong';
                                const daXong = lich.trang_thai === 'da_hoan_thanh';
                                return (
                                  <div
                                    key={lich.id}
                                    onClick={() => {
                                      setLichDangSua(lich);
                                      setMoModal(true);
                                    }}
                                    className={cn(
                                      'px-1.5 py-1 rounded text-[11px] font-semibold truncate cursor-pointer border border-l-2',
                                      daXong
                                        ? 'bg-slate-100 border-slate-200 text-slate-500 line-through border-l-slate-400'
                                        : isVP
                                        ? 'bg-sky-50 border-sky-200 border-l-sky-500 text-sky-950 hover:bg-sky-100'
                                        : 'bg-amber-50 border-amber-200 border-l-amber-500 text-amber-950 hover:bg-amber-100'
                                    )}
                                    title={infoH.tieuDeChinh}
                                  >
                                    <span className="font-extrabold mr-1">{infoH.icon} {lich.gio_bat_dau}</span>
                                    <span>{infoH.tieuDeChinh}</span>
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
                                      {(() => {
                                        const infoH = taoTieuDeLichHienThi(lich);
                                        const isVP = lich.loai_lich === 'van_phong';
                                        return (
                                          <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                              <span className={cn('text-[9.5px] font-bold px-1.5 py-0.2 rounded', isVP ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')}>
                                                {infoH.icon} {isVP ? infoH.nhanLoai : 'Công tác'}
                                              </span>
                                              <span className="font-bold text-slate-900 text-[13.5px]">
                                                {infoH.tieuDeChinh}
                                              </span>
                                            </div>
                                            {infoH.chiTietThem && (
                                              <div className="text-[11.5px] text-slate-500">
                                                {infoH.chiTietThem}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
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

                          const infoH = taoTieuDeLichHienThi(lich);
                          const isVP = lich.loai_lich === 'van_phong';

                          return (
                            <div
                              key={lich.id}
                              onClick={() => {
                                setLichDangSua(lich);
                                setMoModal(true);
                              }}
                              className={cn(
                                'p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer border-l-4',
                                isVP ? 'border-l-sky-500' : 'border-l-amber-500'
                              )}
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
                                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1', isVP ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')}>
                                      <span>{infoH.icon}</span>
                                      <span>{isVP ? infoH.nhanLoai : 'Công tác ngoài'}</span>
                                    </span>
                                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                                      {infoH.tieuDeChinh}
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
        dsKhachHang={dsKhachHangHieuLuc}
        dsNguoiLienHe={dsNguoiLienHe}
        dsNhanSu={dsNhanSu}
        dsDuAn={dsHoSoDuAn}
        nguoiDungId={nguoiDungHienTai?.id}
        chiNhanhMacDinhId={nguoiDungHienTai?.chi_nhanh_id}
        khi_luu={handleLuuLich}
        khi_xoa={handleXoaLich}
        dang_xu_ly={dangLuu}
      />
      {/* Modal Tạo Yêu Cầu Hỗ Trợ */}
      <ModalTaoYeuCauPhoiHop
        mo={moModalTaoYeuCau}
        onDong={() => setMoModalTaoYeuCau(false)}
        duAnMacDinh={duAnChoYeuCau}
        danhSachDuAn={dsHoSoDuAn}
        nguoiDungHienTai={nguoiDungHienTai}
        onTaoThanhCong={(ycMoi) => {
          setDanhSachYeuCau((prev) => [ycMoi, ...prev.filter((x) => x.id !== ycMoi.id)]);
        }}
      />

    </Bo_Cuc_Trang>
  );
}
