'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStoreXacThuc } from '../thu_vien/zustand/store_xac_thuc';
import { langNgheYeuCauPhoiHop, type YeuCauPhoiHop } from '../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import {
  phatChuongThongBao,
  phatThongBaoTrinhDuyet,
  xinQuyenThongBaoTrinhDuyet
} from '../dich_vu/thong_bao/dich_vu_am_thanh_va_push';
import { cn } from '../thu_vien/utils/cn';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  FolderKanban,
  Building2,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  UserCog,
  LogOut,
  Sparkles,
  Bell,
  BellRing,
  Smartphone,
  X,
  User,
  BookOpen,
  TrendingUp,
  MapPin,
  ListTodo,
  Menu
} from 'lucide-react';

function getTenNgan(hoVaTen?: string | null) {
  if (!hoVaTen) return 'Tài khoản';
  const clean = hoVaTen.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('ebms') || lower.includes('quản trị') || lower.includes('hệ thống') || lower === 'admin') {
    return 'Quản trị';
  }
  const parts = clean.split(/\s+/);
  if (parts.length <= 2) return clean;
  return parts.slice(-2).join(' ');
}

interface ThongTinTrang {
  nhan: string;
  nhan_mobile?: string;
  mo_ta: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  nut_them?: string;
  placeholder_tim: string;
  event_them?: string;
  parent?: { nhan: string; href: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };
}

const MAP_TIEU_DE: Record<string, ThongTinTrang> = {
  '/': {
    nhan: 'Tổng quan',
    nhan_mobile: 'Tổng quan',
    mo_ta: 'Bảng điều khiển hệ thống và các module chính',
    icon: Home,
    placeholder_tim: 'Tìm kiếm hồ sơ, khách hàng...'
  },
  '/tong-quan-lanh-dao': {
    nhan: 'Tổng quan Điều hành',
    nhan_mobile: 'Tổng quan',
    mo_ta: 'Theo dõi tiến độ đội ngũ và dự án trọng điểm',
    icon: TrendingUp,
    placeholder_tim: 'Tìm kiếm nhân sự, dự án...'
  },
  '/lich-cong-tac': {
    nhan: 'Lịch công tác',
    nhan_mobile: 'Lịch hẹn',
    mo_ta: 'Lịch hẹn gặp và làm việc với khách hàng',
    icon: Calendar,
    placeholder_tim: 'Tìm lịch hẹn...'
  },
  '/khach-hang': {
    nhan: 'Khách hàng',
    nhan_mobile: 'Khách hàng',
    mo_ta: 'CRM — toàn bộ khách hàng và người liên hệ',
    icon: Building2,
    nut_them: 'Thêm khách hàng',
    placeholder_tim: 'Tìm kiếm tên khách hàng, điện thoại, MST, email...',
    event_them: 'ebms:khach_hang:them_moi'
  },
  '/ban-do-3d': {
    nhan: 'Bản đồ địa bàn',
    nhan_mobile: 'Bản đồ',
    mo_ta: 'Bản đồ 102 xã/phường phụ trách tại An Giang',
    icon: MapPin,
    placeholder_tim: 'Tìm xã, phường, nhân sự phụ trách...'
  },
  '/ban-lam-viec': {
    nhan: 'Bàn làm việc',
    nhan_mobile: 'Bàn làm việc',
    mo_ta: 'Danh sách công việc trong ngày và tác nghiệp khách hàng',
    icon: ListTodo,
    placeholder_tim: 'Tìm công việc...'
  },
  '/ho-so-du-an': {
    nhan: 'Hồ sơ dự án',
    nhan_mobile: 'Dự án',
    mo_ta: 'Theo dõi giai đoạn, giá trị và thời hạn dự án',
    icon: FolderKanban,
    nut_them: 'Tạo hồ sơ dự án',
    placeholder_tim: 'Tìm kiếm mã hồ sơ, tên dự án, tên khách hàng...',
    event_them: 'ebms:ho_so_du_an:them_moi'
  },
  '/bao-cao-cong-viec': {
    nhan: 'Báo cáo công việc',
    nhan_mobile: 'Báo cáo',
    mo_ta: 'Báo cáo hàng ngày nhân viên và lịch sử',
    icon: FileText,
    nut_them: 'Gửi báo cáo hôm nay',
    placeholder_tim: 'Tìm kiếm nội dung, khó khăn...',
    event_them: 'ebms:bao_cao_cong_viec:them_moi'
  },
  '/nhan-su': {
    nhan: 'Nhân sự',
    nhan_mobile: 'Nhân sự',
    mo_ta: 'Quản lý tài khoản, vai trò và thông tin nhân viên',
    icon: Users,
    nut_them: 'Thêm nhân viên',
    placeholder_tim: 'Tìm kiếm tên, mã NV, email, SĐT...',
    event_them: 'ebms:nhan_su:them_moi'
  },
  '/bao-cao': {
    nhan: 'Báo cáo & Thống kê',
    nhan_mobile: 'Thống kê',
    mo_ta: 'Bảng điều khiển tổng hợp số liệu và biểu đồ',
    icon: BarChart3,
    nut_them: 'Tải xuất',
    placeholder_tim: 'Tìm kiếm trong báo cáo...'
  },
  '/ke-hoach': {
    nhan: 'Kế hoạch Kinh doanh',
    nhan_mobile: 'Kế hoạch',
    mo_ta: 'Kế hoạch Tháng và Kế hoạch Tuần',
    icon: Calendar,
    nut_them: 'Thêm kế hoạch',
    placeholder_tim: 'Tìm kiếm kế hoạch...',
    event_them: 'ebms:ke_hoach:them_moi'
  },
  '/kho-tai-lieu': {
    nhan: 'Kho tài liệu',
    nhan_mobile: 'Tài liệu',
    mo_ta: 'Thư viện liên kết, biểu mẫu và tài nguyên công ty & cá nhân',
    icon: BookOpen,
    nut_them: 'Thêm tài liệu',
    placeholder_tim: 'Tìm kiếm tài liệu, liên kết...',
    event_them: 'ebms:kho_tai_lieu:them_moi'
  },
  '/quan-tri': {
    nhan: 'Quản trị hệ thống',
    nhan_mobile: 'Quản trị',
    mo_ta: 'Thiết lập chi nhánh, phòng ban, danh mục sản phẩm, dịch vụ và phân quyền',
    icon: Settings,
    nut_them: 'Làm mới',
    placeholder_tim: 'Tìm kiếm thiết lập...',
    event_them: 'ebms:quan_tri:tai_lai'
  },
  '/tai-khoan': {
    nhan: 'Tài khoản cá nhân',
    nhan_mobile: 'Tài khoản',
    mo_ta: 'Quản lý thông tin cá nhân, ảnh đại diện và mật khẩu đăng nhập',
    icon: User,
    placeholder_tim: 'Tìm kiếm thiết lập...'
  }
};

const timThongTinTrang = (pathname: string): { thongTin: ThongTinTrang; laChiTiet: boolean; tieuDeChiTiet?: string } => {
  if (pathname in MAP_TIEU_DE) return { thongTin: MAP_TIEU_DE[pathname], laChiTiet: false };

  if (pathname.startsWith('/khach-hang/')) {
    return {
      thongTin: {
        nhan: 'Chi tiết khách hàng',
        nhan_mobile: 'Khách hàng',
        mo_ta: 'Hồ sơ chi tiết và lịch sử tương tác',
        icon: Building2,
        placeholder_tim: '',
        parent: { nhan: 'Khách hàng', href: '/khach-hang', icon: Building2 }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Chi tiết KH'
    };
  }

  if (pathname.startsWith('/ho-so-du-an/')) {
    return {
      thongTin: {
        nhan: 'Chi tiết dự án',
        nhan_mobile: 'Chi tiết DA',
        mo_ta: 'Tiến độ, công việc và kho tài liệu',
        icon: FolderKanban,
        placeholder_tim: '',
        parent: { nhan: 'Hồ sơ dự án', href: '/ho-so-du-an', icon: FolderKanban }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Chi tiết DA'
    };
  }

  if (pathname.startsWith('/nhan-su/')) {
    return {
      thongTin: {
        nhan: 'Hồ sơ nhân viên',
        nhan_mobile: 'Nhân sự',
        mo_ta: 'Thông tin cá nhân, phân quyền và lịch sử hoạt động',
        icon: Users,
        placeholder_tim: '',
        parent: { nhan: 'Nhân sự', href: '/nhan-su', icon: Users }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Nhân viên'
    };
  }

  if (pathname.startsWith('/bao-cao-cong-viec/')) {
    return {
      thongTin: {
        ...MAP_TIEU_DE['/bao-cao-cong-viec'],
        parent: { nhan: 'Báo cáo công việc', href: '/bao-cao-cong-viec', icon: FileText }
      },
      laChiTiet: true
    };
  }

  if (pathname.startsWith('/lich-cong-tac')) return { thongTin: MAP_TIEU_DE['/lich-cong-tac'], laChiTiet: false };
  if (pathname.startsWith('/kho-tai-lieu')) return { thongTin: MAP_TIEU_DE['/kho-tai-lieu'], laChiTiet: false };
  if (pathname.startsWith('/ke-hoach')) return { thongTin: MAP_TIEU_DE['/ke-hoach'], laChiTiet: false };
  if (pathname.startsWith('/quan-tri')) return { thongTin: MAP_TIEU_DE['/quan-tri'], laChiTiet: false };

  return { thongTin: MAP_TIEU_DE['/'], laChiTiet: false };
};

export default function ThanhPhanTopbar() {
  const pathname = usePathname() ?? '/';
  const { nguoiDungHienTai, thucHienDangXuat } = useStoreXacThuc();
  const [moMenuMobile, setMoMenuMobile] = React.useState(false);
  const [moDropdownThongBao, setMoDropdownThongBao] = React.useState(false);
  const [dsYeuCau, setDsYeuCau] = React.useState<YeuCauPhoiHop[]>([]);
  const [toastHienTai, setToastHienTai] = React.useState<{
    id: string;
    tieuDe: string;
    noiDung: string;
    duAn: string;
    loai: 'moi' | 'duyet' | 'sua' | 'giao';
  } | null>(null);
  const [quyenThongBao, setQuyenThongBao] = React.useState<'default' | 'granted' | 'denied'>('default');

  const daKhoiTaoRef = React.useRef(false);
  const danhSachCuRef = React.useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setQuyenThongBao(Notification.permission);
    }
  }, []);

  React.useEffect(() => {
    const huy = langNgheYeuCauPhoiHop((ds) => setDsYeuCau(ds));
    return () => huy();
  }, []);

  const vaiTro = nguoiDungHienTai?.vai_tro || '';
  const userId = nguoiDungHienTai?.id || '';

  const dsViecCho = React.useMemo(() => {
    const laLanhDaoHoacAdmin = vaiTro === 'giam_doc' || vaiTro === 'quan_tri_he_thong';
    const laTPKD = laLanhDaoHoacAdmin || vaiTro === 'truong_phong';

    return dsYeuCau.filter((yc) => {
      if (yc.trang_thai_du_lieu === 'da_xoa' || yc.trang_thai === 'da_hoan_thanh') return false;
      // 1. Chờ tiếp nhận
      if (laTPKD && yc.trang_thai === 'cho_tpkd_duyet') return true;
      // 2. Chờ xử lý hoặc cần sửa lại
      if (yc.trang_thai === 'cho_khth_thuc_hien' || yc.trang_thai === 'yeu_cau_chinh_sua') {
        const duocGiao = Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) && yc.danh_sach_nhan_su_thuc_hien_ids.includes(userId);
        if (duocGiao || laLanhDaoHoacAdmin) return true;
        return false;
      }
      // 3. Chờ duyệt kết quả
      if (laTPKD && (yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet')) return true;
      // 4. Đã duyệt -> người tạo nhận kết quả hoàn tất
      if (yc.trang_thai === 'da_phe_duyet' && (yc.nguoi_tao_id === userId || laTPKD)) return true;
      return false;
    });
  }, [dsYeuCau, vaiTro, userId]);

  // Bộ phát hiện realtime: Bật chuông & Push khi có việc mới hoặc kết quả mới
  React.useEffect(() => {
    if (!daKhoiTaoRef.current) {
      const banDo = new Map<string, string>();
      dsViecCho.forEach((yc) => {
        banDo.set(yc.id, `${yc.trang_thai}_${yc.ngay_cap_nhat || ''}`);
      });
      danhSachCuRef.current = banDo;
      daKhoiTaoRef.current = true;
      return;
    }

    // So sánh dữ liệu mới nhận từ Firestore onSnapshot
    for (const yc of dsViecCho) {
      const signature = `${yc.trang_thai}_${yc.ngay_cap_nhat || ''}`;
      const signatureCu = danhSachCuRef.current.get(yc.id);

      if (!signatureCu || signatureCu !== signature) {
        let tieuDe = 'Yêu cầu phối hợp mới';
        let loai: 'moi' | 'duyet' | 'sua' | 'giao' = 'moi';

        if (yc.trang_thai === 'da_phe_duyet') {
          tieuDe = '✅ Kết quả đã sẵn sàng';
          loai = 'duyet';
        } else if (yc.trang_thai === 'yeu_cau_chinh_sua') {
          tieuDe = '⚠️ Yêu cầu cần chỉnh sửa lại';
          loai = 'sua';
        } else if (yc.trang_thai === 'cho_khth_thuc_hien') {
          tieuDe = '📋 Bạn được phân công xử lý';
          loai = 'giao';
        } else if (yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') {
          tieuDe = '📝 Kết quả chờ duyệt nghiệm thu';
          loai = 'duyet';
        }

        const noiDung = `${yc.ten_du_an}: ${yc.noi_dung_yeu_cau}`;

        // 1. Âm thanh Web Audio API
        phatChuongThongBao();

        // 2. Push Notification Mobile / Web
        phatThongBaoTrinhDuyet(tieuDe, noiDung, '/ke-hoach');

        // 3. Floating In-app Toast
        setToastHienTai({
          id: yc.id,
          tieuDe,
          noiDung: yc.noi_dung_yeu_cau,
          duAn: yc.ten_du_an,
          loai
        });
        break;
      }
    }

    const banDoMoi = new Map<string, string>();
    dsViecCho.forEach((yc) => {
      banDoMoi.set(yc.id, `${yc.trang_thai}_${yc.ngay_cap_nhat || ''}`);
    });
    danhSachCuRef.current = banDoMoi;
  }, [dsViecCho]);

  // Tự đóng toast sau 6 giây
  React.useEffect(() => {
    if (!toastHienTai) return;
    const timer = setTimeout(() => setToastHienTai(null), 6000);
    return () => clearTimeout(timer);
  }, [toastHienTai]);

  const batQuyenThongBao = async () => {
    const perm = await xinQuyenThongBaoTrinhDuyet();
    setQuyenThongBao(perm);
    if (perm === 'granted') {
      phatChuongThongBao();
      phatThongBaoTrinhDuyet('Thông báo đã sẵn sàng', 'Bạn sẽ nhận thông báo khi có yêu cầu phối hợp hoặc kết quả hoàn tất.', '/ke-hoach');
    }
  };

  const { thongTin, laChiTiet, tieuDeChiTiet } = timThongTinTrang(pathname);
  const PageIcon = thongTin.icon;
  const ParentIcon = thongTin.parent?.icon;

  const nhanNutThem = () => {
    if (typeof window === 'undefined') return;
    if (thongTin.event_them) {
      window.dispatchEvent(new CustomEvent(thongTin.event_them));
    } else if (pathname === '/') {
      window.location.href = '/bao-cao';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-13 sm:h-[64px] shrink-0 bg-white/90 backdrop-blur-2xl border-b border-slate-200/70 px-3.5 sm:px-6 md:px-8 flex items-center justify-between gap-2 sm:gap-5 min-w-0 w-full transition-colors">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {laChiTiet && thongTin.parent && (
            <Link
              href={thongTin.parent.href}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            >
              {ParentIcon && <ParentIcon className="size-4" />}
              <span className="hidden sm:inline">{thongTin.parent.nhan}</span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </Link>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMoMenuMobile(!moMenuMobile)}
              className="sm:hidden inline-flex items-center justify-center size-8.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition shrink-0"
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </button>

            <div className="size-8 sm:size-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <PageIcon className="size-4 sm:size-4.5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {laChiTiet && tieuDeChiTiet ? tieuDeChiTiet : thongTin.nhan}
              </h1>
              <p className="text-[11px] text-slate-400 truncate hidden md:block">
                {thongTin.mo_ta}
              </p>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tai-khoan"
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50 transition"
          >
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {getTenNgan(nguoiDungHienTai?.ho_va_ten)}
              </div>
              <span className="text-[10px] text-slate-400">
                {nguoiDungHienTai?.vai_tro === 'giam_doc' ? 'Giám đốc' :
                 nguoiDungHienTai?.vai_tro === 'truong_phong' ? 'Trưởng phòng' :
                 nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' ? 'Quản trị' : 'Nhân viên'}
              </span>
            </div>
            <div className="size-8 sm:size-9 rounded-[14px] bg-emerald-500/15 text-[#107555] flex items-center justify-center font-extrabold text-[13px] border border-emerald-500/20 shrink-0">
              {getTenNgan(nguoiDungHienTai?.ho_va_ten).charAt(0).toUpperCase() || 'U'}
            </div>
          </Link>

          {/* Bell notification */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoDropdownThongBao(!moDropdownThongBao)}
              className={cn(
                "inline-flex items-center justify-center size-9.5 rounded-xl border transition relative shadow-2xs active:scale-95 cursor-pointer",
                dsViecCho.length > 0
                  ? "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-400/30"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
              aria-label="Thông báo việc cần xử lý"
              title={dsViecCho.length > 0 ? `Có ${dsViecCho.length} yêu cầu cần xử lý` : 'Thông báo'}
            >
              <Bell className="size-4" strokeWidth={2} />
              {dsViecCho.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce shadow-xs">
                  {dsViecCho.length}
                </span>
              )}
            </button>

            {moDropdownThongBao && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoDropdownThongBao(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl p-3.5 space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="font-bold text-xs text-slate-900">
                        Yêu cầu cần xử lý ({dsViecCho.length})
                      </span>
                    </div>
                    <Link
                      href="/ke-hoach"
                      onClick={() => setMoDropdownThongBao(false)}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      Mở Bàn làm việc
                    </Link>
                  </div>

                  {quyenThongBao !== 'granted' ? (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                        <Smartphone className="size-3.5 text-emerald-600 shrink-0" />
                        <span>Nhận thông báo trên Mobile / Web</span>
                      </div>
                      <button
                        type="button"
                        onClick={batQuyenThongBao}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shrink-0 active:scale-95 shadow-xs cursor-pointer"
                      >
                        Bật ngay
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                        Thông báo thiết bị đang hoạt động
                      </span>
                      <button
                        type="button"
                        onClick={() => phatChuongThongBao()}
                        className="text-slate-400 hover:text-slate-600 underline cursor-pointer"
                      >
                        Thử chuông
                      </button>
                    </div>
                  )}

                  {dsViecCho.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Không có yêu cầu nào đang chờ xử lý.
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                      {dsViecCho.slice(0, 8).map((yc) => (
                        <Link
                          key={yc.id}
                          href="/ke-hoach"
                          onClick={() => setMoDropdownThongBao(false)}
                          className="block pt-2 first:pt-0 hover:bg-slate-50 p-2 rounded-xl transition"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-indigo-700 truncate max-w-[200px]">
                              {yc.ten_du_an}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              {yc.trang_thai === 'cho_tpkd_duyet'
                                ? 'Chờ tiếp nhận'
                                : yc.trang_thai === 'cho_khth_thuc_hien'
                                ? 'Đang xử lý'
                                : (yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet')
                                ? 'Chờ duyệt'
                                : yc.trang_thai === 'yeu_cau_chinh_sua'
                                ? 'Cần sửa lại'
                                : 'Đã duyệt'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-800 font-medium truncate mt-1">
                            {yc.noi_dung_yeu_cau}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>{yc.ten_nguoi_tao}</span>
                            <span>Hạn: {yc.han_hoan_thanh || 'Không'}</span>
                          </div>
                        </Link>
                      ))}
                      {dsViecCho.length > 8 && (
                        <div className="pt-2 text-center">
                          <Link
                            href="/ke-hoach"
                            onClick={() => setMoDropdownThongBao(false)}
                            className="inline-block text-[11px] font-semibold text-emerald-700 hover:underline py-1"
                          >
                            Xem thêm {dsViecCho.length - 8} yêu cầu khác trong Bàn làm việc →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {thongTin.nut_them && (
            <button
              type="button"
              onClick={nhanNutThem}
              title={thongTin.nut_them}
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold h-9.5 px-3.5 shadow-sm shadow-emerald-900/10 transition-all shrink-0 active:scale-95"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>{thongTin.nut_them}</span>
            </button>
          )}
        </div>
      </header>

      {/* Hamburger Menu Dropdown (One UI 9 Squircle Card trên Mobile) */}
      {moMenuMobile && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-xs sm:hidden" 
            onClick={() => setMoMenuMobile(false)} 
          />
          <div className="fixed top-15 left-3 z-50 w-68 rounded-[26px] border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_16px_40px_rgba(15,23,42,0.16)] p-2 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200 sm:hidden">
            <Link
              href="/ban-do-3d"
              onClick={() => setMoMenuMobile(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-sky-500/15 text-sky-600 flex items-center justify-center shrink-0">
                <MapPin className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Bản đồ địa bàn</div>
                <div className="text-[11px] text-slate-400 leading-tight">102 xã/phường An Giang</div>
              </div>
            </Link>

            <Link
              href="/ban-lam-viec"
              onClick={() => setMoMenuMobile(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-emerald-500/15 text-[#107555] flex items-center justify-center shrink-0">
                <ListTodo className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Bàn làm việc</div>
                <div className="text-[11px] text-slate-400 leading-tight">Tác nghiệp & công việc ngày</div>
              </div>
            </Link>

            <Link
              href="/ke-hoach"
              onClick={() => setMoMenuMobile(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Kế hoạch KD</div>
                <div className="text-[11px] text-slate-400 leading-tight">Mục tiêu tuần & tháng</div>
              </div>
            </Link>

            <Link
              href="/kho-tai-lieu"
              onClick={() => setMoMenuMobile(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <BookOpen className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Kho tài liệu</div>
                <div className="text-[11px] text-slate-400 leading-tight">Biểu mẫu & Bảng giá</div>
              </div>
            </Link>

            {(nguoiDungHienTai?.vai_tro === 'giam_doc' || nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' || nguoiDungHienTai?.vai_tro === 'truong_phong') && (
              <Link
                href="/nhan-su"
                onClick={() => setMoMenuMobile(false)}
                className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
              >
                <div className="size-9 rounded-[14px] bg-emerald-500/15 text-[#107555] flex items-center justify-center shrink-0">
                  <UserCog className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-snug">Nhân sự</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Đội ngũ & tài khoản</div>
                </div>
              </Link>
            )}

            {(nguoiDungHienTai?.vai_tro === 'giam_doc' || nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong') && (
              <Link
                href="/quan-tri"
                onClick={() => setMoMenuMobile(false)}
                className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
              >
                <div className="size-9 rounded-[14px] bg-slate-500/15 text-slate-700 flex items-center justify-center shrink-0">
                  <Settings className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-snug">Quản trị hệ thống</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Cấu hình & phân quyền</div>
                </div>
              </Link>
            )}

            <div className="h-px bg-slate-100 mx-2 my-1" />
            <button
              onClick={async () => {
                setMoMenuMobile(false);
                const ok = await thucHienDangXuat();
                if (ok) window.location.href = '/dang-nhap';
              }}
              className="w-full flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-[#FF3B30] hover:bg-red-50 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-red-500/12 text-[#FF3B30] flex items-center justify-center shrink-0">
                <LogOut className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="font-bold leading-snug">Đăng xuất</div>
                <div className="text-[11px] text-red-500/80 leading-tight">
                  {getTenNgan(nguoiDungHienTai?.ho_va_ten)}
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Toast popup nổi góc màn hình khi có thông báo mới */}
      {toastHienTai && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] bg-white border border-slate-200/90 rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.18)] p-3.5 flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200">
          <div
            className={cn(
              "size-9 rounded-xl flex items-center justify-center shrink-0",
              toastHienTai.loai === 'duyet'
                ? "bg-emerald-100 text-emerald-700"
                : toastHienTai.loai === 'sua'
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-700"
            )}
          >
            <BellRing className="size-4.5" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              setToastHienTai(null);
              window.location.href = '/ke-hoach';
            }}
          >
            <div className="text-xs font-bold text-slate-900 leading-snug">
              {toastHienTai.tieuDe}
            </div>
            <div className="text-[11px] font-bold text-indigo-700 truncate mt-0.5">
              {toastHienTai.duAn}
            </div>
            <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
              {toastHienTai.noiDung}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastHienTai(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg shrink-0 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
