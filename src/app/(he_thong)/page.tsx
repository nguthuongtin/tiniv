'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  UsersRound,
  FileText,
  Clock,
  ArrowUpRight,
  Loader2,
  ExternalLink,
  ChevronRight,
  Activity,
  User,
  History,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRightCircle,
  Layers,
  Paperclip,
  Wallet,
  Plus,
  Calendar,
  Sun,
  Sunset,
  Moon,
  FileCheck,
  AlertCircle,
  Filter,
  FolderPlus,
  UserPlus
} from 'lucide-react';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { BaoCaoCongViec } from '../../thu_vien/types/bao_cao_cong_viec';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhatKyHoatDong } from '../../thu_vien/types/nhat_ky_hoat_dong';
import { danhSachHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import {
  danhSachBaoCaoCongViec,
  langNgheThayDoiDanhSachBaoCaoCongViec
} from '../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import {
  danhSachNhatKyHoatDong,
  langNgheThayDoiNhatKyHoatDong
} from '../../dich_vu/nhat_ky_hoat_dong/dich_vu_nhat_ky_hoat_dong';
import {
  langNgheDSTienDoDuAn,
  type TienDoDuAn
} from '../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import {
  langNgheThayDoiDanhSachTaiLieuDuAn,
  type TaiLieuDuAn
} from '../../dich_vu/tai_lieu_du_an/dich_vu_tai_lieu_du_an';

const DANH_SACH_12_GIAI_DOAN: {
  key: string;
  stt: number;
  nhan: string;
  kieu: string;
  mauSac: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  };
}[] = [
  {
    key: 'moi_tao',
    stt: 1,
    nhan: 'Mới tạo',
    kieu: 'slate',
    mauSac: {
      bg: 'bg-slate-50/80 hover:bg-slate-100/90',
      text: 'text-slate-700',
      border: 'border-slate-200',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700',
      badgeBorder: 'border-slate-200'
    }
  },
  {
    key: 'tiep_can',
    stt: 2,
    nhan: 'Tiếp cận',
    kieu: 'sky',
    mauSac: {
      bg: 'bg-sky-50/80 hover:bg-sky-100/90',
      text: 'text-sky-700',
      border: 'border-sky-200',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-700',
      badgeBorder: 'border-sky-200'
    }
  },
  {
    key: 'khao_sat',
    stt: 3,
    nhan: 'Khảo sát',
    kieu: 'cyan',
    mauSac: {
      bg: 'bg-cyan-50/80 hover:bg-cyan-100/90',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      badgeBg: 'bg-cyan-50',
      badgeText: 'text-cyan-700',
      badgeBorder: 'border-cyan-200'
    }
  },
  {
    key: 'len_giai_phap',
    stt: 4,
    nhan: 'Lên giải pháp',
    kieu: 'indigo',
    mauSac: {
      bg: 'bg-indigo-50/80 hover:bg-indigo-100/90',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-200'
    }
  },
  {
    key: 'bao_gia',
    stt: 5,
    nhan: 'Báo giá',
    kieu: 'amber',
    mauSac: {
      bg: 'bg-amber-50/80 hover:bg-amber-100/90',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-200'
    }
  },
  {
    key: 'dam_phan',
    stt: 6,
    nhan: 'Đàm phán',
    kieu: 'orange',
    mauSac: {
      bg: 'bg-orange-50/80 hover:bg-orange-100/90',
      text: 'text-orange-700',
      border: 'border-orange-200',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200'
    }
  },
  {
    key: 'ky_hop_dong',
    stt: 7,
    nhan: 'Ký hợp đồng',
    kieu: 'teal',
    mauSac: {
      bg: 'bg-teal-50/80 hover:bg-teal-100/90',
      text: 'text-teal-700',
      border: 'border-teal-200',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700',
      badgeBorder: 'border-teal-200'
    }
  },
  {
    key: 'trien_khai',
    stt: 8,
    nhan: 'Triển khai',
    kieu: 'blue',
    mauSac: {
      bg: 'bg-blue-50/80 hover:bg-blue-100/90',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200'
    }
  },
  {
    key: 'nghiem_thu',
    stt: 9,
    nhan: 'Nghiệm thu',
    kieu: 'emerald',
    mauSac: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/90',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200'
    }
  },
  {
    key: 'hoan_thanh',
    stt: 10,
    nhan: 'Hoàn thành',
    kieu: 'emerald-rich',
    mauSac: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-100/90',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      badgeBorder: 'border-emerald-300'
    }
  },
  {
    key: 'tam_dung',
    stt: 11,
    nhan: 'Tạm dừng',
    kieu: 'zinc',
    mauSac: {
      bg: 'bg-zinc-50/80 hover:bg-zinc-100/90',
      text: 'text-zinc-700',
      border: 'border-zinc-200',
      badgeBg: 'bg-zinc-100',
      badgeText: 'text-zinc-700',
      badgeBorder: 'border-zinc-200'
    }
  },
  {
    key: 'huy',
    stt: 12,
    nhan: 'Đã hủy',
    kieu: 'rose',
    mauSac: {
      bg: 'bg-rose-50/80 hover:bg-rose-100/90',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200'
    }
  }
];

const GIAI_DOAN_DANG_CHAY = [
  'moi_tao',
  'tiep_can',
  'khao_sat',
  'len_giai_phap',
  'bao_gia',
  'dam_phan',
  'ky_hop_dong',
  'trien_khai',
  'nghiem_thu'
];

const layBadgeGiaiDoanClass = (gdKey?: string | null) => {
  const gd = DANH_SACH_12_GIAI_DOAN.find((g) => g.key === gdKey);
  if (gd) {
    return `${gd.mauSac.badgeBg} ${gd.mauSac.badgeText} ${gd.mauSac.badgeBorder}`;
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const layTenGiaiDoan = (gdKey?: string | null) => {
  const gd = DANH_SACH_12_GIAI_DOAN.find((g) => g.key === gdKey);
  if (gd) return gd.nhan;
  return gdKey || 'Mới tạo';
};

const layPhanTramGiaiDoan = (gdKey?: string | null): number => {
  switch (gdKey) {
    case 'moi_tao': return 10;
    case 'tiep_can': return 20;
    case 'khao_sat': return 30;
    case 'len_giai_phap': return 40;
    case 'bao_gia': return 50;
    case 'dam_phan': return 60;
    case 'ky_hop_dong': return 70;
    case 'trien_khai': return 80;
    case 'nghiem_thu': return 90;
    case 'hoan_thanh': return 100;
    case 'tam_dung': return 50;
    case 'huy': return 0;
    default: return 10;
  }
};

const layChuoiNgayLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const layChuoiNgayUTC = () => {
  return new Date().toISOString().split('T')[0];
};

const layLoiChaoTheoGio = () => {
  const gio = new Date().getHours();
  if (gio < 12) return { text: 'Chào buổi sáng', icon: 'sun' };
  if (gio < 18) return { text: 'Chào buổi chiều', icon: 'sunset' };
  return { text: 'Chào buổi tối', icon: 'moon' };
};

const layNgayTiengViet = () => {
  const d = new Date();
  const thu = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][d.getDay()];
  const ngay = d.getDate();
  const thang = d.getMonth() + 1;
  const nam = d.getFullYear();
  return `${thu}, ngày ${ngay} tháng ${thang}, ${nam}`;
};

const layTenVaiTro = (vaiTro?: string | null) => {
  switch (vaiTro) {
    case 'quan_tri_he_thong': return 'Quản trị hệ thống';
    case 'giam_doc': return 'Giám đốc';
    case 'truong_phong': return 'Trưởng phòng';
    case 'kinh_doanh': return 'Kinh doanh';
    case 'ky_thuat': return 'Kỹ thuật';
    case 'ke_toan': return 'Kế toán';
    case 'hanh_chinh_van_phong': return 'Hành chính VP';
    default: return 'Thành viên';
  }
};

const layKieuGiaiDoan = (gdKey?: string | null) => {
  const gd = DANH_SACH_12_GIAI_DOAN.find((g) => g.key === gdKey);
  return gd?.kieu || 'muted';
};

const dinhDangThoiGian = (isoString?: string | null) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
};

const chuanHoaNoiDungCapNhat = (
  rawNoiDung: string | null | undefined,
  tenDuAn: string,
  hanhDong: string,
  giaiDoan?: string | null
): { tieuDeHanhDong: string; chiTietNoiBat?: string | null; loaiHanhDong: 'chuyen_giai_doan' | 'tao_moi' | 'tai_lieu' | 'tien_do' | 'cap_nhat' | 'khac' } => {
  if (!rawNoiDung || rawNoiDung.trim().length === 0) {
    if (hanhDong === 'chuyen_giai_doan') {
      return {
        tieuDeHanhDong: 'Chuyển giai đoạn',
        chiTietNoiBat: layTenGiaiDoan(giaiDoan),
        loaiHanhDong: 'chuyen_giai_doan'
      };
    }
    if (hanhDong === 'tao_moi' || hanhDong === 'tao') {
      return {
        tieuDeHanhDong: 'Khởi tạo hồ sơ dự án mới',
        loaiHanhDong: 'tao_moi'
      };
    }
    if (hanhDong === 'upload_file') {
      return {
        tieuDeHanhDong: 'Đính kèm tài liệu mới',
        loaiHanhDong: 'tai_lieu'
      };
    }
    return {
      tieuDeHanhDong: 'Cập nhật tiến độ dự án',
      loaiHanhDong: 'cap_nhat'
    };
  }

  let nd = rawNoiDung.trim();

  // 1. Nếu là tải file / tài liệu
  if (hanhDong === 'upload_file' || nd.toLowerCase().includes('tải lên tài liệu') || nd.toLowerCase().includes('tai lieu')) {
    const match = nd.match(/["'“]([^"'”]+)["'”]/);
    const tenFile = match ? match[1] : nd.replace(/^[^\s:]+[:\s]*/, '');
    return {
      tieuDeHanhDong: 'Đính kèm tài liệu mới',
      chiTietNoiBat: tenFile.trim() || 'Tài liệu dự án',
      loaiHanhDong: 'tai_lieu'
    };
  }

  // 2. Nếu là chuyển giai đoạn
  if (
    hanhDong === 'chuyen_giai_doan' ||
    nd.toLowerCase().includes('chuyen giai doan') ||
    nd.toLowerCase().includes('chuyển giai đoạn') ||
    nd.toLowerCase().includes('đổi giai đoạn')
  ) {
    const match = nd.match(/thành\s*["'“]?([^"'”\)\n]+)["'”]?/i) || nd.match(/sang\s*["'“]?([^"'”\)\n]+)["'”]?/i);
    const gdMoi = match ? match[1].trim() : giaiDoan;
    return {
      tieuDeHanhDong: 'Chuyển sang giai đoạn',
      chiTietNoiBat: layTenGiaiDoan(gdMoi),
      loaiHanhDong: 'chuyen_giai_doan'
    };
  }

  // 3. Nếu là tạo mới
  if (
    hanhDong === 'tao_moi' ||
    hanhDong === 'tao' ||
    nd.toLowerCase().includes('khoi tao') ||
    nd.toLowerCase().includes('khởi tạo') ||
    nd.toLowerCase().includes('tạo mới')
  ) {
    return {
      tieuDeHanhDong: 'Khởi tạo hồ sơ dự án mới',
      loaiHanhDong: 'tao_moi'
    };
  }

  // 4. Nếu là tiến độ / tình hình làm việc
  if (nd.includes('[Tiến độ dự án]') || nd.includes('Tình hình HT:') || nd.includes('tinh_hinh_hien_tai')) {
    let chiTiet = nd;
    const matchHT = nd.match(/Tình hình HT:\s*([^\n•]+)/i);
    if (matchHT) {
      chiTiet = matchHT[1].trim();
    } else {
      chiTiet = nd.replace(/\[Tiến độ dự án\]/gi, '').replace(/Dự án\s*["'“][^"'”]+["'”]/gi, '').trim();
      chiTiet = chiTiet.replace(/^[•\s-]+/, '').trim();
    }
    return {
      tieuDeHanhDong: 'Cập nhật tiến độ',
      chiTietNoiBat: chiTiet || 'Đã cập nhật diễn biến dự án',
      loaiHanhDong: 'tien_do'
    };
  }

  // 5. Loại bỏ tên dự án bị lặp lại trong nội dung mô tả
  if (tenDuAn) {
    nd = nd.replace(new RegExp(`dự án\\s*["'“][^"'”]+["'”]`, 'gi'), '');
    nd = nd.replace(new RegExp(`du an\\s*["'“][^"'”]+["'”]`, 'gi'), '');
    nd = nd.replace(new RegExp(`"${tenDuAn}"`, 'gi'), '');
    nd = nd.replace(new RegExp(tenDuAn, 'gi'), '');
  }

  nd = nd.replace(/^\[[^\]]+\]\s*/g, '');
  nd = nd.replace(/^(cập nhật thông tin dự án|cập nhật tiến độ|cập nhật|ghi chú)[:\s-]*/i, '');
  nd = nd.replace(/^[•\s,;:-]+|[•\s,;:-]+$/g, '').trim();

  return {
    tieuDeHanhDong: 'Nội dung cập nhật',
    chiTietNoiBat: nd || 'Đã cập nhật thông tin dự án',
    loaiHanhDong: 'cap_nhat'
  };
};

export interface TepDinhKemHienThi {
  ten: string;
  url: string;
  loai?: string | null;
}

interface CapNhatDuAnHienThi {
  id: string;
  duAnId: string;
  maDuAn?: string | null;
  tenDuAn: string;
  khachHangId?: string | null;
  tenKhachHang: string;
  giaiDoan?: string | null;
  tieuDeHanhDong: string;
  chiTietNoiBat?: string | null;
  tepDinhKem?: TepDinhKemHienThi | null;
  loaiHanhDong: 'chuyen_giai_doan' | 'tao_moi' | 'tai_lieu' | 'tien_do' | 'cap_nhat' | 'khac';
  nguoiThucHien: string;
  thoiGian: string;
}

export default function TrangChu() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const [dangTai, setDangTai] = useState(true);

  const [dsTatCaDuAn, setDsTatCaDuAn] = useState<HoSoDuAn[]>([]);
  const [dsTatCaKhachHang, setDsTatCaKhachHang] = useState<KhachHang[]>([]);
  const [dsTatCaBccv, setDsTatCaBccv] = useState<BaoCaoCongViec[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsNhatKy, setDsNhatKy] = useState<NhatKyHoatDong[]>([]);
  const [dsTienDo, setDsTienDo] = useState<TienDoDuAn[]>([]);
  const [dsTaiLieu, setDsTaiLieu] = useState<TaiLieuDuAn[]>([]);
  const [locHoatDong, setLocHoatDong] = useState<'tat_ca' | 'tien_do' | 'tai_lieu' | 'chuyen_giai_doan'>('tat_ca');
  const [tabMobile, setTabMobile] = useState<'cap_nhat' | 'du_an'>('cap_nhat');

  const ngayLocal = layChuoiNgayLocal();
  const ngayUtc = layChuoiNgayUTC();
  const loiChao = layLoiChaoTheoGio();
  const chuoiNgayHienTai = layNgayTiengViet();

  useEffect(() => {
    let huy = false;
    (async () => {
      setDangTai(true);
      try {
        const [kqHda, kqKh, kqNs] = await Promise.all([
          danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }),
          danhSachKhachHang({ trang_thai: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' })
        ]);
        if (!huy) {
          setDsTatCaDuAn(kqHda.mang || []);
          setDsTatCaKhachHang(kqKh.mang || []);
          setDsNhanSu(kqNs.mang || []);
        }
      } catch (err) {
        console.error('Loi tai du lieu tong quan:', err);
      } finally {
        if (!huy) setDangTai(false);
      }
    })();

    // Lắng nghe Báo cáo công việc thời gian thực
    const huyBccv = langNgheThayDoiDanhSachBaoCaoCongViec((mang) => {
      if (!huy) {
        setDsTatCaBccv(mang || []);
      }
    }, { trang_thai_du_lieu: 'hoat_dong' });

    // Lắng nghe Nhật ký hoạt động thời gian thực
    const huyNk = langNgheThayDoiNhatKyHoatDong((mang) => {
      if (!huy) {
        setDsNhatKy(mang || []);
      }
    }, { module: 'ho_so_du_an' });

    // Lắng nghe Tiến độ dự án thời gian thực
    const huyTD = langNgheDSTienDoDuAn((mang) => {
      if (!huy) {
        setDsTienDo(mang || []);
      }
    });

    // Lắng nghe Tài liệu dự án thời gian thực
    const huyTL = langNgheThayDoiDanhSachTaiLieuDuAn((mang) => {
      if (!huy) {
        setDsTaiLieu(mang || []);
      }
    });

    return () => {
      huy = true;
      huyBccv();
      huyNk();
      huyTD();
      huyTL();
    };
  }, []);

  // Xác định danh sách dự án liên quan đến nhân viên này
  const dsDuAnLienQuan = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    const userId = nguoiDungHienTai.id;
    const laAdmin =
      nguoiDungHienTai.vai_tro === 'quan_tri_he_thong' || nguoiDungHienTai.vai_tro === 'giam_doc';

    if (laAdmin) {
      return dsTatCaDuAn;
    }

    return dsTatCaDuAn.filter((da) => {
      if (da.nguoi_phu_trach_id === userId) return true;
      if (da.nguoi_quan_ly_id === userId) return true;
      if (da.nguoi_tao_id === userId) return true;
      if (
        Array.isArray(da.danh_sach_nguoi_ho_tro_ids) &&
        da.danh_sach_nguoi_ho_tro_ids.includes(userId)
      ) {
        return true;
      }
      if (
        nguoiDungHienTai.vai_tro === 'truong_phong' &&
        nguoiDungHienTai.phong_ban_id &&
        da.phong_ban_id === nguoiDungHienTai.phong_ban_id
      ) {
        return true;
      }
      return false;
    });
  }, [nguoiDungHienTai, dsTatCaDuAn]);

  const setDuAnLienQuanIds = useMemo(() => {
    return new Set(dsDuAnLienQuan.map((d) => d.id));
  }, [dsDuAnLienQuan]);

  // Xác định danh sách khách hàng liên quan
  const dsKhachHangLienQuan = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    const userId = nguoiDungHienTai.id;
    const laAdmin =
      nguoiDungHienTai.vai_tro === 'quan_tri_he_thong' || nguoiDungHienTai.vai_tro === 'giam_doc';

    if (laAdmin) {
      return dsTatCaKhachHang;
    }

    const setKhachHangIds = new Set<string>();
    dsDuAnLienQuan.forEach((da) => {
      if (da.khach_hang_id) {
        setKhachHangIds.add(da.khach_hang_id);
      }
    });

    return dsTatCaKhachHang.filter((kh) => {
      if (setKhachHangIds.has(kh.id)) return true;
      if (kh.nguoi_phu_trach_id === userId) return true;
      if (kh.nguoi_tao_id === userId) return true;
      return false;
    });
  }, [nguoiDungHienTai, dsTatCaKhachHang, dsDuAnLienQuan]);

  // Báo cáo ngày hôm nay (khớp cả local date và UTC date, theo user hiện tại)
  const bccvHomNay = useMemo(() => {
    if (!nguoiDungHienTai) return null;
    const uid = nguoiDungHienTai.id;
    
    // Tìm các báo cáo của user này
    const dsBccvCuaUser = dsTatCaBccv.filter(
      (b) => (b.nhan_vien_id === uid || b.nguoi_tao_id === uid)
    );

    // 1. Khớp chính xác ngày báo cáo là hôm nay (local hoặc UTC)
    const timTheoNgay = dsBccvCuaUser.find(
      (b) => b.ngay_bao_cao === ngayLocal || b.ngay_bao_cao === ngayUtc
    );
    if (timTheoNgay) return timTheoNgay;

    // 2. Hoặc khớp ngày tạo/ngày cập nhật là hôm nay
    const timTheoNgayTao = dsBccvCuaUser.find(
      (b) => (b.ngay_cap_nhat && (b.ngay_cap_nhat.startsWith(ngayLocal) || b.ngay_cap_nhat.startsWith(ngayUtc))) ||
             (b.ngay_tao && (b.ngay_tao.startsWith(ngayLocal) || b.ngay_tao.startsWith(ngayUtc)))
    );
    return timTheoNgayTao ?? null;
  }, [nguoiDungHienTai, dsTatCaBccv, ngayLocal, ngayUtc]);

  const layTenKhachHang = (khId?: string | null) => {
    if (!khId) return 'Chưa gắn khách hàng';
    const kh = dsTatCaKhachHang.find((k) => k.id === khId);
    return kh?.ten_khach_hang || 'Chưa xác định';
  };

  const layTenNhanSu = (nsId?: string | null) => {
    if (!nsId) return 'Hệ thống';
    const ns = dsNhanSu.find((n) => n.id === nsId);
    return ns?.ho_va_ten || 'Thành viên';
  };

  // Thống kê phân bổ 12 giai đoạn dự án
  const thongKe12GiaiDoan = useMemo(() => {
    const dem: Record<string, number> = {};
    DANH_SACH_12_GIAI_DOAN.forEach((gd) => {
      dem[gd.key] = 0;
    });
    dsDuAnLienQuan.forEach((da) => {
      const gd = da.giai_doan || 'moi_tao';
      if (dem[gd] !== undefined) {
        dem[gd] += 1;
      }
    });
    return dem;
  }, [dsDuAnLienQuan]);

  // Tính toán số liệu thống kê điều hành
  const soDangChay = useMemo(() => {
    return dsDuAnLienQuan.filter(
      (h) => h.trang_thai !== 'da_xoa' && GIAI_DOAN_DANG_CHAY.includes(String(h.giai_doan))
    ).length;
  }, [dsDuAnLienQuan]);

  const soHoanThanh = useMemo(() => {
    return dsDuAnLienQuan.filter(
      (h) => h.trang_thai !== 'da_xoa' && String(h.giai_doan) === 'hoan_thanh'
    ).length;
  }, [dsDuAnLienQuan]);

  const soTamDungHuy = useMemo(() => {
    return dsDuAnLienQuan.filter(
      (h) => h.trang_thai === 'da_xoa' || String(h.giai_doan) === 'tam_dung' || String(h.giai_doan) === 'huy'
    ).length;
  }, [dsDuAnLienQuan]);

  const tongGiaTri = useMemo(() => {
    return dsDuAnLienQuan.reduce(
      (sum, h) => sum + (Number(h.gia_tri_du_kien) || Number(h.gia_tri_hop_dong) || 0),
      0
    );
  }, [dsDuAnLienQuan]);

  const laBackOffice = useMemo(() => {
    return ['hanh_chinh_van_phong'].includes(nguoiDungHienTai?.vai_tro ?? '');
  }, [nguoiDungHienTai]);

  // Top dự án đang triển khai trọng tâm
  const dsDuAnTieuBieu = useMemo(() => {
    return dsDuAnLienQuan
      .filter((da) => da.trang_thai !== 'da_xoa' && GIAI_DOAN_DANG_CHAY.includes(da.giai_doan))
      .slice(0, 4);
  }, [dsDuAnLienQuan]);

  // CẬP NHẬT MỚI NHẤT: GỘP TIẾN ĐỘ & FILE ĐÍNH KÈM THÀNH DUY NHẤT 1 DÒNG / 1 THẺ
  const dsCapNhatMoiNhat = useMemo<CapNhatDuAnHienThi[]>(() => {
    if (!nguoiDungHienTai || dsDuAnLienQuan.length === 0) return [];

    const mapDuAn = new Map<string, HoSoDuAn>();
    dsDuAnLienQuan.forEach((da) => mapDuAn.set(da.id, da));

    const danhSach: CapNhatDuAnHienThi[] = [];
    const setTaiLieuDaGop = new Set<string>();

    // 1. Tiến độ công việc: Nếu có đính kèm file, GỘP VÀO ĐÚNG 1 MỤC
    dsTienDo.forEach((td) => {
      if (td.du_an_id && setDuAnLienQuanIds.has(td.du_an_id)) {
        const da = mapDuAn.get(td.du_an_id);
        if (!da) return;

        const rawNd = (td.tinh_hinh_hien_tai || '').trim();
        if (!rawNd && !td.link_tai_lieu) return;

        let tepDinhKem: TepDinhKemHienThi | null = null;

        // Khớp tài liệu qua link_tai_lieu
        const linkTL = td.link_tai_lieu;
        if (linkTL) {
          const matchTl = dsTaiLieu.find(
            (tl) =>
              tl.du_an_id === td.du_an_id &&
              tl.url_file &&
              (tl.url_file === linkTL ||
                tl.url_file.includes(linkTL) ||
                linkTL.includes(tl.url_file))
          );
          if (matchTl) {
            setTaiLieuDaGop.add(matchTl.id);
            tepDinhKem = {
              ten: matchTl.ten_file || 'Tài liệu đính kèm',
              url: linkTL,
              loai: matchTl.loai_file
            };
          } else {
            let tenFile = 'Tài liệu đính kèm';
            if (rawNd.toLowerCase().startsWith('đính kèm tài liệu:')) {
              tenFile = rawNd.replace(/^đính kèm tài liệu:\s*/i, '').trim() || tenFile;
            }
            tepDinhKem = {
              ten: tenFile,
              url: linkTL,
              loai: 'link_khac'
            };
          }
        } else {
          // Khớp nếu cùng người đăng và cùng thời điểm (dưới 45 giây)
          const tdTime = new Date(td.ngay_tao || td.ngay_cap_nhat || 0).getTime();
          if (tdTime > 0) {
            const matchTl = dsTaiLieu.find(
              (tl) =>
                !setTaiLieuDaGop.has(tl.id) &&
                tl.du_an_id === td.du_an_id &&
                tl.nguoi_tai_len_id === td.nguoi_tao_id &&
                Math.abs(new Date(tl.ngay_tai_len).getTime() - tdTime) < 45000
            );
            if (matchTl) {
              setTaiLieuDaGop.add(matchTl.id);
              tepDinhKem = {
                ten: matchTl.ten_file,
                url: matchTl.url_file,
                loai: matchTl.loai_file
              };
            }
          }
        }

        let noiDungHienThi: string | null = rawNd;
        let tieuDe = 'Tiến độ';

        if (rawNd.toLowerCase().startsWith('đính kèm tài liệu:') && tepDinhKem) {
          noiDungHienThi = null;
          tieuDe = 'Tài liệu';
        } else if (tepDinhKem && rawNd) {
          tieuDe = 'Tiến độ & Tài liệu';
        }

        danhSach.push({
          id: `td-${td.id}`,
          duAnId: da.id,
          maDuAn: da.ma_ho_so,
          tenDuAn: da.ten_du_an,
          khachHangId: da.khach_hang_id,
          tenKhachHang: layTenKhachHang(da.khach_hang_id),
          giaiDoan: da.giai_doan,
          tieuDeHanhDong: tieuDe,
          chiTietNoiBat: noiDungHienThi,
          tepDinhKem,
          loaiHanhDong: tepDinhKem && !noiDungHienThi ? 'tai_lieu' : 'tien_do',
          nguoiThucHien: layTenNhanSu(td.nguoi_tao_id),
          thoiGian: td.ngay_tao || td.ngay_cap_nhat || new Date().toISOString()
        });
      }
    });

    // 2. Tài liệu độc lập (chưa gộp vào tiến độ)
    dsTaiLieu.forEach((tl) => {
      if (tl.du_an_id && setDuAnLienQuanIds.has(tl.du_an_id)) {
        if (setTaiLieuDaGop.has(tl.id)) return; // BỎ QUA vì đã gộp ở trên

        const daCo = danhSach.some((item) => item.tepDinhKem?.url === tl.url_file);
        if (daCo) return;

        const da = mapDuAn.get(tl.du_an_id);
        if (da && tl.ten_file) {
          danhSach.push({
            id: `tl-${tl.id}`,
            duAnId: da.id,
            maDuAn: da.ma_ho_so,
            tenDuAn: da.ten_du_an,
            khachHangId: da.khach_hang_id,
            tenKhachHang: layTenKhachHang(da.khach_hang_id),
            giaiDoan: da.giai_doan,
            tieuDeHanhDong: 'Tài liệu',
            chiTietNoiBat: tl.ghi_chu || null,
            tepDinhKem: {
              ten: tl.ten_file,
              url: tl.url_file,
              loai: tl.loai_file
            },
            loaiHanhDong: 'tai_lieu',
            nguoiThucHien: layTenNhanSu(tl.nguoi_tai_len_id),
            thoiGian: tl.ngay_tai_len || new Date().toISOString()
          });
        }
      }
    });

    // 3. Nhật ký CHUYỂN GIAI ĐOẠN (Bỏ qua hoàn toàn tao_moi)
    dsNhatKy.forEach((nk) => {
      if (nk.ban_ghi_id && setDuAnLienQuanIds.has(nk.ban_ghi_id)) {
        const da = mapDuAn.get(nk.ban_ghi_id);
        if (
          da &&
          (nk.hanh_dong === 'chuyen_giai_doan' ||
            nk.noi_dung?.toLowerCase().includes('chuyển giai đoạn'))
        ) {
          const info = chuanHoaNoiDungCapNhat(nk.noi_dung, da.ten_du_an, nk.hanh_dong, da.giai_doan);
          danhSach.push({
            id: `nk-${nk.id}`,
            duAnId: da.id,
            maDuAn: da.ma_ho_so,
            tenDuAn: da.ten_du_an,
            khachHangId: da.khach_hang_id,
            tenKhachHang: layTenKhachHang(da.khach_hang_id),
            giaiDoan: da.giai_doan,
            tieuDeHanhDong: 'Chuyển giai đoạn',
            chiTietNoiBat: info.chiTietNoiBat || layTenGiaiDoan(da.giai_doan),
            tepDinhKem: null,
            loaiHanhDong: 'chuyen_giai_doan',
            nguoiThucHien: layTenNhanSu(nk.nguoi_dung_id),
            thoiGian: nk.thoi_gian
          });
        }
      }
    });

    return danhSach
      .sort((a, b) => new Date(b.thoiGian).getTime() - new Date(a.thoiGian).getTime())
      .slice(0, 20);
  }, [nguoiDungHienTai, dsDuAnLienQuan, dsTienDo, dsTaiLieu, dsNhatKy, setDuAnLienQuanIds, dsTatCaKhachHang, dsNhanSu]);

  // Lọc theo tab hoạt động
  const dsCapNhatLoc = useMemo(() => {
    if (locHoatDong === 'tat_ca') return dsCapNhatMoiNhat;
    return dsCapNhatMoiNhat.filter((item) => {
      if (locHoatDong === 'tien_do') return item.loaiHanhDong === 'tien_do';
      if (locHoatDong === 'tai_lieu') return item.loaiHanhDong === 'tai_lieu';
      if (locHoatDong === 'chuyen_giai_doan') return item.loaiHanhDong === 'chuyen_giai_doan';
      return true;
    });
  }, [dsCapNhatMoiNhat, locHoatDong]);

  const tileHoanThanh = useMemo(() => {
    if (dsDuAnLienQuan.length === 0) return 0;
    return Math.round((soHoanThanh / dsDuAnLienQuan.length) * 100);
  }, [dsDuAnLienQuan, soHoanThanh]);

  return (
    <div className="w-full max-w-none space-y-3.5 sm:space-y-6">
      {/* 1. HEADER: MOBILE VS DESKTOP */}
      {/* 1A. Header trên Mobile: Siêu tinh gọn, không nút bấm trùng lặp */}
      <div className="sm:hidden flex items-center justify-between pt-0.5">
        <div>
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <span>{loiChao.text}</span>
            <span>•</span>
            <span>{ngayLocal}</span>
          </div>
          <h1 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {nguoiDungHienTai?.ho_va_ten || 'Trang tổng quan'}
          </h1>
        </div>

        {/* Badge trạng thái báo cáo hôm nay trên mobile */}
        <Link
          href="/bao-cao-cong-viec"
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1 shadow-2xs shrink-0 transition-transform active:scale-95',
            !bccvHomNay
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : bccvHomNay.trang_thai === 'tam_luu'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          )}
        >
          {!bccvHomNay ? (
            <>
              <Clock className="size-3 text-amber-600" />
              <span>Báo cáo: Chưa nộp</span>
            </>
          ) : bccvHomNay.trang_thai === 'tam_luu' ? (
            <>
              <Clock className="size-3 text-indigo-600" />
              <span>Lưu tạm</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>Đã nộp</span>
            </>
          )}
        </Link>
      </div>

      {/* 1B. Header trên Desktop: Đầy đủ lời chào, ngày tháng tiếng Việt & cụm phím tắt */}
      <section className="hidden sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-7 rounded-full bg-amber-500/10 text-amber-500">
              {loiChao.icon === 'sun' && <Sun className="size-4" />}
              {loiChao.icon === 'sunset' && <Sunset className="size-4" />}
              {loiChao.icon === 'moon' && <Moon className="size-4" />}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {loiChao.text},
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {nguoiDungHienTai?.ho_va_ten || 'Bạn'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#007AFF] border border-blue-200/60">
              {layTenVaiTro(nguoiDungHienTai?.vai_tro)}
            </span>
          </div>
          <p className="text-[13px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            <span>{chuoiNgayHienTai}</span>
          </p>
        </div>

        {/* Quick Action Capsules trên Desktop */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ho-so-du-an"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] text-white hover:bg-[#0066D6] text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <FolderPlus className="size-3.5" />
            <span>Dự án</span>
          </Link>
          <Link
            href="/bao-cao-cong-viec"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <FileText className="size-3.5 text-slate-500" />
            <span>Báo cáo</span>
          </Link>
          <Link
            href="/khach-hang"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="size-3.5 text-slate-500" />
            <span>Khách hàng</span>
          </Link>
        </div>
      </section>

      {/* 2. THƯỚC ĐO ĐIỀU HÀNH TỔNG QUAN */}
      {/* 2A. Mobile View: Chuẩn 2 dòng tinh gọn theo yêu cầu */}
      <section className="sm:hidden bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
        {/* Dòng 1 — quy mô dự án */}
        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng dự án</span>
            <span className="font-extrabold text-slate-900 text-[15px] tabular-nums">
              {dangTai ? '-' : dsDuAnLienQuan.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Giá trị</span>
            <span className="font-extrabold text-[#007AFF] text-[15px] tabular-nums">
              {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(tongGiaTri)}
            </span>
          </div>
        </div>

        {/* Dòng 2 — tình trạng */}
        <div className="flex items-center justify-between text-[12px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đang chạy</span>
            <span className="font-bold text-[#34C759] text-[13px] tabular-nums">{soDangChay}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Hoàn thành</span>
            <span className="font-bold text-[#007AFF] text-[13px] tabular-nums">{soHoanThanh}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Tạm dừng/Hủy</span>
            <span className="font-bold text-[#FF9500] text-[13px] tabular-nums">{soTamDungHuy}</span>
          </div>
        </div>
      </section>

      {/* 2B. Desktop View: Thanh phân đoạn Apple Glassmorphic 5 khối */}
      <section className="hidden sm:grid sm:grid-cols-5 bg-white rounded-[22px] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] divide-x divide-slate-100/90 overflow-hidden">
        {/* 1. Tổng dự án */}
        <Link
          href="/ho-so-du-an"
          className="group p-3.5 xl:p-4 flex items-center gap-3 hover:bg-slate-50/70 transition-colors"
        >
          <div className="size-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/15 group-hover:scale-105 transition-transform">
            <FolderKanban className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              Tổng dự án
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[20px] xl:text-[22px] font-extrabold text-slate-900 tabular-nums tracking-tight leading-none">
                {dangTai ? '-' : dsDuAnLienQuan.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">hồ sơ</span>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:text-[#007AFF] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* 2. Khách hàng */}
        <Link
          href="/khach-hang"
          className="group p-3.5 xl:p-4 flex items-center gap-3 hover:bg-slate-50/70 transition-colors"
        >
          <div className="size-10 rounded-[14px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0 border border-[#34C759]/15 group-hover:scale-105 transition-transform">
            <UsersRound className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              Khách hàng
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[20px] xl:text-[22px] font-extrabold text-slate-900 tabular-nums tracking-tight leading-none">
                {dangTai ? '-' : dsKhachHangLienQuan.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">đối tác</span>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:text-[#34C759] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>

        {/* 3. Tổng giá trị */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/15">
            <Wallet className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              Tổng giá trị
            </div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-amber-600 tabular-nums tracking-tight leading-none mt-1 truncate">
              {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(tongGiaTri)}
            </div>
          </div>
        </div>

        {/* 4. Tiến độ chung */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center shrink-0 border border-[#5856D6]/15">
            <TrendingUp className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              <span>Tiến độ</span>
              <span className="text-slate-600 font-bold tabular-nums">{tileHoanThanh}%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold text-[#34C759] tabular-nums">{soDangChay}</span>
              <span className="text-[10px] text-slate-400">chạy</span>
              <span className="text-slate-200">│</span>
              <span className="text-xs font-bold text-[#007AFF] tabular-nums">{soHoanThanh}</span>
              <span className="text-[10px] text-slate-400">xong</span>
            </div>
            <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#34C759] to-[#007AFF] rounded-full transition-all duration-500"
                style={{ width: `${tileHoanThanh}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5. Báo cáo hôm nay */}
        <Link
          href="/bao-cao-cong-viec"
          className="group p-3.5 xl:p-4 flex items-center gap-3 hover:bg-slate-50/70 transition-colors"
        >
          <div
            className={cn(
              'size-10 rounded-[14px] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform',
              !bccvHomNay
                ? 'bg-gradient-to-br from-[#FF9500] to-[#E07000]'
                : bccvHomNay.trang_thai === 'tam_luu'
                ? 'bg-gradient-to-br from-[#5E5CE6] to-[#423CB8]'
                : 'bg-gradient-to-br from-[#34C759] to-[#248A3D]'
            )}
          >
            <FileText className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              Báo cáo hôm nay
            </div>
            <div className="mt-1">
              {dangTai ? (
                <span className="text-xs text-slate-400">Đang tải...</span>
              ) : !bccvHomNay ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                  <Clock className="size-3" /> Chưa nộp
                </span>
              ) : bccvHomNay.trang_thai === 'tam_luu' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                  <Clock className="size-3" /> Lưu tạm ({bccvHomNay.danh_sach_chi_tiet?.length || 0})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="size-3" /> Đã nộp
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </section>

      {/* 3. DÒNG CHẢY 12 GIAI ĐOẠN DỰ ÁN (CHỈ HIỂN THỊ TRÊN DESKTOP ĐỂ TRÁNH RỐI TRÊN MOBILE) */}
      <section className="hidden sm:block bg-white rounded-[22px] border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center">
              <Layers className="size-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Dòng chảy 12 giai đoạn dự án
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              ({dsDuAnLienQuan.length} dự án)
            </span>
          </div>
          <Link
            href="/ho-so-du-an"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#007AFF] hover:underline"
          >
            Hồ sơ chi tiết
            <ArrowUpRight className="size-3" />
          </Link>
        </div>

        {/* Lưới phân bổ 12 giai đoạn desktop */}
        <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
          {DANH_SACH_12_GIAI_DOAN.map((gd) => {
            const sl = thongKe12GiaiDoan[gd.key] || 0;
            const coDuAn = sl > 0;

            return (
              <Link
                key={gd.key}
                href={`/ho-so-du-an?giai_doan=${gd.key}`}
                className={cn(
                  'group rounded-xl p-2.5 border transition-all duration-200 flex flex-col justify-between active:scale-95 text-left',
                  coDuAn
                    ? `${gd.mauSac.bg} ${gd.mauSac.border} shadow-2xs hover:shadow-xs`
                    : 'bg-slate-50/50 border-slate-100 opacity-60 hover:opacity-100 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    {String(gd.stt).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-extrabold tabular-nums leading-none',
                      coDuAn ? gd.mauSac.text : 'text-slate-400'
                    )}
                  >
                    {sl}
                  </span>
                </div>
                <div
                  className={cn(
                    'text-[11px] font-bold truncate leading-tight',
                    coDuAn ? 'text-slate-800' : 'text-slate-500'
                  )}
                  title={gd.nhan}
                >
                  {gd.nhan}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. CHUYỂN TAB TRÊN MOBILE (GIÚP MOBILE CỰC KỲ GỌN GÀNG, TẬP TRUNG, KHÔNG RỐI) */}
      <div className="sm:hidden flex items-center p-1 bg-slate-200/60 rounded-2xl">
        <button
          type="button"
          onClick={() => setTabMobile('cap_nhat')}
          className={cn(
            'flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center',
            tabMobile === 'cap_nhat'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          Tiến độ mới ({dsCapNhatLoc.length})
        </button>
        <button
          type="button"
          onClick={() => setTabMobile('du_an')}
          className={cn(
            'flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center',
            tabMobile === 'du_an'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          Dự án đang chạy ({soDangChay})
        </button>
      </div>

      {/* 5. NỘI DUNG VẬN HÀNH: TRÊN MOBILE HIỂN THỊ THEO TAB ĐÃ CHỌN, TRÊN DESKTOP HIỂN THỊ 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* CỘT 1: DÒNG CẬP NHẬT TIẾN ĐỘ & TÀI LIỆU */}
        <section
          className={cn(
            'lg:col-span-7 xl:col-span-8 rounded-[22px] border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3 sm:space-y-4',
            tabMobile !== 'cap_nhat' && 'hidden sm:block'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 sm:pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="size-7 sm:size-9 rounded-[11px] sm:rounded-[13px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <Activity className="size-3.5 sm:size-4" />
              </div>
              <h2 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Cập nhật tiến độ & tài liệu</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200/60">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Trực tiếp
                </span>
              </h2>
            </div>

            {/* Filter Tabs Apple Capsule */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-xl overflow-x-auto no-scrollbar shrink-0">
              {[
                { key: 'tat_ca', label: 'Tất cả' },
                { key: 'tien_do', label: 'Tiến độ' },
                { key: 'tai_lieu', label: 'Tài liệu' },
                { key: 'chuyen_giai_doan', label: 'Giai đoạn' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLocHoatDong(tab.key as any)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                    locHoatDong === tab.key
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {dangTai ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="size-5 animate-spin text-[#007AFF]" />
              <span className="text-xs">Đang đồng bộ cập nhật mới nhất...</span>
            </div>
          ) : dsCapNhatLoc.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <History className="size-8 text-slate-300 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">Chưa có dữ liệu cập nhật</p>
              <p className="text-[11px] text-slate-400">
                Các ghi chú tiến độ, báo cáo giai đoạn và tài liệu tải lên sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {dsCapNhatLoc.map((cnItem) => {
                const badgeClass = layBadgeGiaiDoanClass(cnItem.giaiDoan);
                const tenGD = layTenGiaiDoan(cnItem.giaiDoan);
                const laChuyenGiaiDoan = cnItem.loaiHanhDong === 'chuyen_giai_doan';

                return (
                  <div
                    key={cnItem.id}
                    className="group relative rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 space-y-2 transition-all hover:border-slate-300 hover:shadow-2xs"
                  >
                    {/* Hàng 1: Mã, Tên dự án, Giai đoạn, Thời gian */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                        {cnItem.maDuAn && (
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#007AFF] px-1.5 py-0.5 rounded-md bg-[#007AFF]/10 shrink-0">
                            {cnItem.maDuAn}
                          </span>
                        )}
                        <Link
                          href={`/ho-so-du-an/${cnItem.duAnId}`}
                          className="text-[13px] sm:text-[14px] font-bold text-slate-900 hover:text-[#007AFF] transition-colors truncate"
                        >
                          {cnItem.tenDuAn}
                        </Link>
                        <span className={cn('text-[9.5px] px-2 py-0.5 rounded-full font-bold border shrink-0', badgeClass)}>
                          {tenGD}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0 ml-auto tabular-nums">
                        <Clock className="size-3" />
                        {dinhDangThoiGian(cnItem.thoiGian)}
                      </span>
                    </div>

                    {/* Hàng 2: Nội dung / Chuyển giai đoạn / File đính kèm */}
                    {laChuyenGiaiDoan ? (
                      <div className="rounded-xl bg-sky-50/70 border border-sky-100 px-3 py-2 flex items-center gap-2 text-xs text-slate-900">
                        <ArrowRightCircle className="size-3.5 text-sky-600 shrink-0" />
                        <span>
                          Chuyển sang giai đoạn: <b className="text-sky-700 font-bold">{cnItem.chiTietNoiBat || tenGD}</b>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cnItem.chiTietNoiBat && (
                          <p className="text-xs sm:text-[13px] text-slate-700 font-normal leading-relaxed whitespace-pre-wrap">
                            {cnItem.chiTietNoiBat}
                          </p>
                        )}

                        {/* File đính kèm pill */}
                        {cnItem.tepDinhKem && cnItem.tepDinhKem.url && (
                          <div>
                            <a
                              href={cnItem.tepDinhKem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="group/file inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-800 transition-all max-w-full"
                              title="Bấm để mở tài liệu đính kèm"
                            >
                              <Paperclip className="size-3 text-[#007AFF] shrink-0" />
                              <span className="truncate font-medium group-hover/file:text-[#007AFF]">
                                {cnItem.tepDinhKem.ten}
                              </span>
                              <ExternalLink className="size-3 text-slate-400 shrink-0 ml-0.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hàng 3: Khách hàng & Người thực hiện */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">
                          KH: <b className="text-slate-700 font-semibold">{cnItem.tenKhachHang}</b>
                        </span>
                        <span>•</span>
                        <span className="truncate">
                          Bởi: <b className="text-slate-700 font-semibold">{cnItem.nguoiThucHien}</b>
                        </span>
                      </div>
                      <Link
                        href={`/ho-so-du-an/${cnItem.duAnId}`}
                        className="text-[11px] text-[#007AFF] font-bold hover:underline inline-flex items-center gap-0.5 shrink-0 ml-auto"
                      >
                        Chi tiết <ChevronRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CỘT 2: DỰ ÁN TRỌNG TÂM & BÁO CÁO CÔNG VIỆC */}
        <div
          className={cn(
            'lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-6',
            tabMobile !== 'du_an' && 'hidden sm:block'
          )}
        >
          {/* THẺ 1: DỰ ÁN ĐANG TRIỂN KHAI TRỌNG TÂM */}
          <section className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-[12px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                  <FolderKanban className="size-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Dự án đang chạy
                </h2>
              </div>
              <Link
                href="/ho-so-du-an"
                className="text-xs font-semibold text-[#007AFF] hover:underline inline-flex items-center gap-1"
              >
                Tất cả ({soDangChay})
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {dangTai ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Loader2 className="size-4 animate-spin inline mr-1.5 text-[#007AFF]" />
                Đang tải dự án...
              </div>
            ) : dsDuAnTieuBieu.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Hiện không có dự án nào đang chạy
              </div>
            ) : (
              <div className="space-y-2.5">
                {dsDuAnTieuBieu.map((da) => {
                  const badgeClass = layBadgeGiaiDoanClass(da.giai_doan);
                  const tenGD = layTenGiaiDoan(da.giai_doan);
                  const phanTram = layPhanTramGiaiDoan(da.giai_doan);
                  const tenKH = layTenKhachHang(da.khach_hang_id);
                  const tenPhuTrach = layTenNhanSu(da.nguoi_phu_trach_id);

                  return (
                    <Link
                      key={da.id}
                      href={`/ho-so-du-an/${da.id}`}
                      className="group relative block overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 hover:border-slate-300 hover:shadow-xs transition-all active:scale-[0.99]"
                    >
                      {/* Thanh tiến độ mép trên thẻ chuẩn Apple */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] transition-all duration-300"
                          style={{ width: `${phanTram}%` }}
                        />
                      </div>

                      {/* Tên dự án & Giai đoạn */}
                      <div className="flex items-start justify-between gap-1.5 mt-0.5">
                        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-[#007AFF] transition-colors line-clamp-1">
                          {da.ten_du_an}
                        </h3>
                        <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0', badgeClass)}>
                          {tenGD}
                        </span>
                      </div>

                      {/* Khách hàng & Giá trị */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                        <span className="truncate max-w-[150px]">
                          KH: <b className="text-slate-700 font-semibold">{tenKH}</b>
                        </span>
                        <span className="font-extrabold text-[#007AFF] tabular-nums shrink-0">
                          {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(Number(da.gia_tri_du_kien || da.gia_tri_hop_dong || 0))}
                        </span>
                      </div>

                      {/* Người phụ trách & Hạn */}
                      <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-1 pt-1.5 border-t border-slate-100">
                        <span className="flex items-center gap-1 truncate">
                          <User className="size-2.5 text-slate-400 shrink-0" />
                          <span>{tenPhuTrach}</span>
                        </span>
                        {da.thoi_han_hoan_thanh && (
                          <span className="flex items-center gap-1 shrink-0 tabular-nums">
                            <Clock className="size-2.5 text-slate-400 shrink-0" />
                            <span>Hạn: {da.thoi_han_hoan_thanh.slice(0, 10)}</span>
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* THẺ 2: WIDGET BÁO CÁO CÔNG VIỆC HÔM NAY (CHỈ HIỂN THỊ TRÊN DESKTOP) */}
          <section className="hidden sm:block rounded-[22px] border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'size-8 rounded-[12px] flex items-center justify-center text-white shrink-0',
                    !bccvHomNay
                      ? 'bg-amber-500'
                      : bccvHomNay.trang_thai === 'tam_luu'
                      ? 'bg-indigo-500'
                      : 'bg-emerald-500'
                  )}
                >
                  <FileCheck className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Báo cáo công việc
                  </h2>
                  <p className="text-[11px] text-slate-400">Hôm nay: {ngayLocal}</p>
                </div>
              </div>
            </div>

            {!bccvHomNay ? (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <AlertCircle className="size-4 text-amber-600 shrink-0" />
                  <span>Bạn chưa nộp báo cáo công việc hôm nay</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Hãy ghi nhận các hạng mục công việc đã hoàn thành để ban điều hành nắm bắt tiến độ kịp thời.
                </p>
                <Link
                  href="/bao-cao-cong-viec"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-98 mt-1"
                >
                  <Plus className="size-3.5" />
                  Tạo báo cáo ngay
                </Link>
              </div>
            ) : bccvHomNay.trang_thai === 'tam_luu' ? (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 text-xs font-semibold">
                  <Clock className="size-4 text-indigo-600 shrink-0" />
                  <span>Báo cáo đang ở trạng thái Lưu tạm</span>
                </div>
                <p className="text-[11px] text-indigo-700">
                  Đã ghi nhận {bccvHomNay.danh_sach_chi_tiet?.length || 0} công việc. Vui lòng kiểm tra và bấm nộp chính thức.
                </p>
                <Link
                  href="/bao-cao-cong-viec"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-98 mt-1"
                >
                  Tiếp tục chỉnh sửa & Nộp
                </Link>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Đã nộp báo cáo công việc hôm nay</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Tổng cộng: {bccvHomNay.danh_sach_chi_tiet?.length || 0} mục công việc đã được gửi lên hệ thống.
                </p>
                <Link
                  href="/bao-cao-cong-viec"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs transition-all active:scale-98"
                >
                  Xem lại báo cáo
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="pt-2 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} Tini PMS — Hệ thống Quản trị Doanh nghiệp & Dự án
      </footer>
    </div>
  );
}



