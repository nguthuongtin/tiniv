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
  FilePlus,
  Layers,
  Paperclip
} from 'lucide-react';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
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

const layBadgeGiaiDoanClass = (gdKey?: string | null) => {
  const gd = DANH_SACH_12_GIAI_DOAN.find((g) => g.key === gdKey);
  if (gd) {
    return `${gd.mauSac.badgeBg} ${gd.mauSac.badgeText} ${gd.mauSac.badgeBorder}`;
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
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

const layTenGiaiDoan = (gdKey?: string | null) => {
  const gd = DANH_SACH_12_GIAI_DOAN.find((g) => g.key === gdKey);
  if (gd) return gd.nhan;
  return gdKey || 'Mới tạo';
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

  const ngayLocal = layChuoiNgayLocal();
  const ngayUtc = layChuoiNgayUTC();

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
      .slice(0, 15);
  }, [nguoiDungHienTai, dsDuAnLienQuan, dsTienDo, dsTaiLieu, dsNhatKy, setDuAnLienQuanIds, dsTatCaKhachHang, dsNhanSu]);

  return (
    <div className="w-full max-w-none space-y-4 sm:space-y-5">
      {/* 1. 3 THẺ TỔNG QUAN CHUẨN WIDGET APPLE iOS (SÁNG SỦA, TINH TẾ, NỀN TRẮNG SẠCH SẼ) */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* THẺ 1: DỰ ÁN LIÊN QUAN */}
        <Link
          href="/ho-so-du-an"
          className="group relative overflow-hidden rounded-[20px] sm:rounded-[22px] border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-300 transition-all active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-10 rounded-[13px] bg-gradient-to-br from-[#007AFF] to-[#0055D4] text-white flex items-center justify-center shadow-sm shadow-blue-500/25 shrink-0">
              <FolderKanban className="size-4 sm:size-5" />
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover:text-[#007AFF] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
              Dự án liên quan
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {dangTai ? '-' : dsDuAnLienQuan.length}
              </span>
              <span className="text-xs font-medium text-slate-400">dự án</span>
            </div>
          </div>
        </Link>

        {/* THẺ 2: KHÁCH HÀNG LIÊN QUAN */}
        <Link
          href="/khach-hang"
          className="group relative overflow-hidden rounded-[20px] sm:rounded-[22px] border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-green-300 transition-all active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="size-9 sm:size-10 rounded-[13px] bg-gradient-to-br from-[#34C759] to-[#248A3D] text-white flex items-center justify-center shadow-sm shadow-green-500/25 shrink-0">
              <UsersRound className="size-4 sm:size-5" />
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover:text-[#34C759] group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
              Khách hàng
            </p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {dangTai ? '-' : dsKhachHangLienQuan.length}
              </span>
              <span className="text-xs font-medium text-slate-400">khách</span>
            </div>
          </div>
        </Link>

        {/* THẺ 3: BÁO CÁO HÔM NAY (CHIẾM HÀNG 2 TRÊN MOBILE) */}
        <Link
          href="/bao-cao-cong-viec"
          className="group relative overflow-hidden col-span-2 md:col-span-1 rounded-[20px] sm:rounded-[22px] border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div
              className={cn(
                'size-9 sm:size-10 rounded-[13px] text-white flex items-center justify-center shrink-0 shadow-sm',
                !bccvHomNay
                  ? 'bg-gradient-to-br from-[#FF9500] to-[#E07000] shadow-amber-500/25'
                  : bccvHomNay.trang_thai === 'tam_luu'
                  ? 'bg-gradient-to-br from-[#5E5CE6] to-[#423CB8] shadow-indigo-500/25'
                  : 'bg-gradient-to-br from-[#34C759] to-[#248A3D] shadow-green-500/25'
              )}
            >
              <FileText className="size-4 sm:size-5" />
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
              Báo cáo hôm nay ({ngayLocal})
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {dangTai ? (
                <span className="text-xs text-slate-400">Đang tải...</span>
              ) : !bccvHomNay ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Clock className="size-3.5" /> Chưa nộp
                </span>
              ) : bccvHomNay.trang_thai === 'tam_luu' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                  <Clock className="size-3.5" /> Lưu tạm ({bccvHomNay.danh_sach_chi_tiet?.length || 0} việc)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="size-3.5" /> Đã nộp
                </span>
              )}
            </div>
          </div>
        </Link>
      </section>

      {/* 2. BỐ TRÍ 2 CỘT TRÊN DESKTOP: (CẬP NHẬT DỰ ÁN & PHÂN BỔ 12 GIAI ĐOẠN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* CỘT TRÁI (7/12): CẬP NHẬT DỰ ÁN LIÊN QUAN */}
        <section className="lg:col-span-7 rounded-[22px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 sm:size-9 rounded-[12px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                <Activity className="size-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Cập nhật tiến độ dự án
                </h2>
              </div>
            </div>
            <Link
              href="/ho-so-du-an"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:opacity-85 shrink-0"
            >
              Tất cả ({dsDuAnLienQuan.length})
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {dangTai ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="size-5 animate-spin text-[#007AFF]" />
              <span className="text-xs">Đang tải cập nhật...</span>
            </div>
          ) : dsCapNhatMoiNhat.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <History className="size-8 text-slate-300 stroke-1" />
              <p className="text-xs font-medium text-slate-600">Chưa có cập nhật tiến độ mới nào</p>
              <p className="text-[11px] text-slate-400">Các ghi chú tiến độ và tài liệu đính kèm sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dsCapNhatMoiNhat.map((cnItem) => {
                const badgeClass = layBadgeGiaiDoanClass(cnItem.giaiDoan);
                const tenGD = layTenGiaiDoan(cnItem.giaiDoan);
                const laChuyenGiaiDoan = cnItem.loaiHanhDong === 'chuyen_giai_doan';

                return (
                  <div
                    key={cnItem.id}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 space-y-2.5 transition-all hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                  >
                    {/* Hàng 1: Mã dự án, Tên dự án, Giai đoạn, Thời gian */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                        {cnItem.maDuAn && (
                          <span className="font-mono text-[11px] font-bold text-[#007AFF] px-2 py-0.5 rounded-lg bg-[#007AFF]/10 border border-[#007AFF]/20 shrink-0">
                            {cnItem.maDuAn}
                          </span>
                        )}
                        <Link
                          href={`/ho-so-du-an/${cnItem.duAnId}`}
                          className="text-xs sm:text-[13.5px] font-bold text-slate-900 hover:text-[#007AFF] transition-colors truncate"
                        >
                          {cnItem.tenDuAn}
                        </Link>
                        <span className={cn('text-[10px] px-2.5 py-0.5 rounded-full font-semibold border shrink-0', badgeClass)}>
                          {tenGD}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0 ml-auto">
                        <Clock className="size-3" />
                        {dinhDangThoiGian(cnItem.thoiGian)}
                      </span>
                    </div>

                    {/* Hàng 2: NỘI DUNG CẬP NHẬT & FILE ĐÍNH KÈM (GỘP TRONG 1 THẺ DUY NHẤT) */}
                    {laChuyenGiaiDoan ? (
                      <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 sm:p-3 flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-900">
                        <div className="size-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                          <ArrowRightCircle className="size-3.5" />
                        </div>
                        <span>Chuyển sang giai đoạn: <b className="text-sky-700 font-bold">{cnItem.chiTietNoiBat || tenGD}</b></span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Văn bản nội dung nếu có */}
                        {cnItem.chiTietNoiBat && (
                          <div className="rounded-xl bg-white border border-slate-200/80 p-3 text-xs sm:text-[13.5px] text-slate-800 font-normal leading-relaxed whitespace-pre-wrap shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            {cnItem.chiTietNoiBat}
                          </div>
                        )}

                        {/* File đính kèm (Nút pill chuẩn iOS sáng màu, click trực tiếp vào file) */}
                        {cnItem.tepDinhKem && cnItem.tepDinhKem.url && (
                          <div>
                            <a
                              href={cnItem.tepDinhKem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="group/file inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all max-w-full"
                              title="Bấm để mở hoặc tải tài liệu đính kèm"
                            >
                              <div className="size-6 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                                <Paperclip className="size-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-800 truncate group-hover/file:text-[#007AFF]">
                                {cnItem.tepDinhKem.ten}
                              </span>
                              <ExternalLink className="size-3 text-slate-400 group-hover/file:text-[#007AFF] shrink-0 ml-0.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hàng 3: Khách hàng, Người thực hiện & Link chi tiết */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex items-center gap-1 truncate max-w-[220px] sm:max-w-none">
                          <UsersRound className="size-3 shrink-0 text-slate-400" />
                          <span>KH: <b className="text-slate-800 font-semibold">{cnItem.tenKhachHang}</b></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3 shrink-0 text-slate-400" />
                          <span>Bởi: <b className="text-slate-800 font-semibold">{cnItem.nguoiThucHien}</b></span>
                        </span>
                      </div>
                      <Link
                        href={`/ho-so-du-an/${cnItem.duAnId}`}
                        className="text-xs text-[#007AFF] font-semibold hover:underline inline-flex items-center gap-0.5 ml-auto"
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

        {/* CỘT PHẢI (5/12): PHÂN BỔ 12 GIAI ĐOẠN DỰ ÁN (ẨN TRÊN MOBILE, KIỂU CONTROL CENTER iOS SÁNG ĐẸP) */}
        <section className="hidden lg:block lg:col-span-5 rounded-[22px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="size-8 sm:size-9 rounded-[12px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center shrink-0">
                <Layers className="size-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Phân bổ 12 giai đoạn
              </h2>
            </div>
            <Link
              href="/ho-so-du-an"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#007AFF] hover:opacity-85"
            >
              Hồ sơ dự án
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {dangTai ? (
            <div className="flex items-center justify-center py-12 text-xs text-slate-400">
              <Loader2 className="size-4 mr-2 animate-spin text-[#007AFF]" />
              Đang tải giai đoạn...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {DANH_SACH_12_GIAI_DOAN.map((gd) => {
                const sl = thongKe12GiaiDoan[gd.key] || 0;
                return (
                  <div
                    key={gd.key}
                    className={cn(
                      'rounded-2xl border px-3.5 py-3 flex items-center justify-between gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
                      gd.mauSac.bg,
                      gd.mauSac.border,
                      gd.mauSac.text
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono font-bold opacity-60 leading-none mb-1">
                        {String(gd.stt).padStart(2, '0')}.
                      </div>
                      <div className="text-xs font-semibold leading-tight truncate">
                        {gd.nhan}
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold leading-none tabular-nums shrink-0">
                      {sl}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="pt-2 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} Tini PMS
      </footer>
    </div>
  );
}



