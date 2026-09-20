'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
  Bell,
  User
} from 'lucide-react';

interface ThongTinTrang {
  nhan: string;
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
    mo_ta: 'Bảng điều khiển hệ thống và các module chính',
    icon: Home,
    placeholder_tim: 'Tìm kiếm hồ sơ, khách hàng...'
  },
  '/khach-hang': {
    nhan: 'Khách hàng',
    mo_ta: 'CRM — toàn bộ khách hàng và người liên hệ',
    icon: Building2,
    nut_them: 'Thêm khách hàng',
    placeholder_tim: 'Tìm kiếm tên khách hàng, điện thoại, MST, email...',
    event_them: 'ebms:khach_hang:them_moi'
  },
  '/ho-so-du-an': {
    nhan: 'Hồ sơ dự án',
    mo_ta: 'Theo dõi giai đoạn, giá trị và thời hạn dự án',
    icon: FolderKanban,
    nut_them: 'Tạo hồ sơ dự án',
    placeholder_tim: 'Tìm kiếm mã hồ sơ, tên dự án, tên khách hàng...',
    event_them: 'ebms:ho_so_du_an:them_moi'
  },
  '/bao-cao-cong-viec': {
    nhan: 'Báo cáo công việc',
    mo_ta: 'Báo cáo hàng ngày nhân viên và lịch sử',
    icon: FileText,
    nut_them: 'Gửi báo cáo hôm nay',
    placeholder_tim: 'Tìm kiếm nội dung, khó khăn...',
    event_them: 'ebms:bao_cao_cong_viec:them_moi'
  },
  '/nhan-su': {
    nhan: 'Nhân sự',
    mo_ta: 'Quản lý tài khoản, vai trò và thông tin nhân viên',
    icon: Users,
    nut_them: 'Thêm nhân viên',
    placeholder_tim: 'Tìm kiếm tên, mã NV, email, SĐT...',
    event_them: 'ebms:nhan_su:them_moi'
  },
  '/bao-cao': {
    nhan: 'Báo cáo & Thống kê',
    mo_ta: 'Bảng điều khiển tổng hợp số liệu và biểu đồ',
    icon: BarChart3,
    nut_them: 'Tải xuất',
    placeholder_tim: 'Tìm kiếm trong báo cáo...'
  },
  '/ke-hoach': {
    nhan: 'Kế hoạch',
    mo_ta: 'Kế hoạch Tháng và Kế hoạch Tuần',
    icon: Calendar,
    nut_them: 'Thêm kế hoạch',
    placeholder_tim: 'Tìm kiếm kế hoạch...',
    event_them: 'ebms:ke_hoach:them_moi'
  },
  '/quan-tri': {
    nhan: 'Quản trị hệ thống',
    mo_ta: 'Thiết lập chi nhánh, phòng ban, danh mục sản phẩm, dịch vụ và phân quyền',
    icon: Settings,
    nut_them: 'Làm mới',
    placeholder_tim: 'Tìm kiếm thiết lập...',
    event_them: 'ebms:quan_tri:tai_lai'
  },
  '/tai-khoan': {
    nhan: 'Tài khoản cá nhân',
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
        mo_ta: 'Hồ sơ chi tiết và lịch sử tương tác',
        icon: Building2,
        placeholder_tim: '',
        parent: { nhan: 'Khách hàng', href: '/khach-hang', icon: Building2 }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Chi tiết khách hàng'
    };
  }

  if (pathname.startsWith('/ho-so-du-an/')) {
    return {
      thongTin: {
        nhan: 'Chi tiết dự án',
        mo_ta: 'Tiến độ, công việc và kho tài liệu',
        icon: FolderKanban,
        placeholder_tim: '',
        parent: { nhan: 'Hồ sơ dự án', href: '/ho-so-du-an', icon: FolderKanban }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Chi tiết dự án'
    };
  }

  if (pathname.startsWith('/nhan-su/')) {
    return {
      thongTin: {
        nhan: 'Hồ sơ nhân viên',
        mo_ta: 'Thông tin cá nhân, phân quyền và lịch sử hoạt động',
        icon: Users,
        placeholder_tim: '',
        parent: { nhan: 'Nhân sự', href: '/nhan-su', icon: Users }
      },
      laChiTiet: true,
      tieuDeChiTiet: 'Hồ sơ nhân viên'
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

  if (pathname.startsWith('/ke-hoach')) return { thongTin: MAP_TIEU_DE['/ke-hoach'], laChiTiet: false };
  if (pathname.startsWith('/quan-tri')) return { thongTin: MAP_TIEU_DE['/quan-tri'], laChiTiet: false };

  return { thongTin: MAP_TIEU_DE['/'], laChiTiet: false };
};

export default function ThanhPhanTopbar() {
  const pathname = usePathname() ?? '/';
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
    <header className="sticky top-0 z-30 h-13 sm:h-[64px] shrink-0 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-3.5 sm:px-6 md:px-8 flex items-center justify-between gap-3 sm:gap-5 min-w-0 w-full transition-colors">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {laChiTiet && thongTin.parent && (
          <Link
            href={thongTin.parent.href}
            className="size-8 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors active:scale-95 border border-slate-200/60 shadow-2xs"
            title={`Quay lại ${thongTin.parent.nhan}`}
          >
            <ChevronLeft className="size-4.5" strokeWidth={2.5} />
          </Link>
        )}

        {/* Breadcrumb trên Desktop (sm trở lên) */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[13.5px] min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium shrink-0"
            title="Trang chủ Tổng quan"
          >
            <Home className="size-4 text-slate-400" strokeWidth={2} />
            <span>Tổng quan</span>
          </Link>

          {pathname !== '/' && (
            <>
              <ChevronRight className="size-3.5 text-slate-300 shrink-0" strokeWidth={2} />

              {laChiTiet && thongTin.parent ? (
                <>
                  <Link
                    href={thongTin.parent.href}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium shrink-0"
                  >
                    {ParentIcon && <ParentIcon className="size-3.5 text-slate-400 shrink-0" strokeWidth={2} />}
                    <span>{thongTin.parent.nhan}</span>
                  </Link>

                  <ChevronRight className="size-3.5 text-slate-300 shrink-0" strokeWidth={2} />

                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 px-2 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 truncate max-w-[260px] tracking-tight">
                    <PageIcon className="size-3.5 text-[#007AFF] shrink-0" strokeWidth={2.2} />
                    <span className="truncate">{tieuDeChiTiet ?? thongTin.nhan}</span>
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 px-2 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 truncate tracking-tight">
                  <PageIcon className="size-3.5 text-[#007AFF] shrink-0" strokeWidth={2.2} />
                  <span className="truncate">{thongTin.nhan}</span>
                </span>
              )}
            </>
          )}
        </nav>

        {/* Tiêu đề thanh Topbar trên Mobile (chuẩn Mobile App tinh gọn) */}
        <div className="sm:hidden flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-sm truncate tracking-tight">
            <PageIcon className="size-4 text-[#007AFF] shrink-0" strokeWidth={2.2} />
            <span className="truncate">{tieuDeChiTiet ?? thongTin.nhan}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center size-9.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition relative shadow-2xs active:scale-95"
          aria-label="Thông báo"
        >
          <Bell className="size-4" strokeWidth={2} />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#FF3B30] ring-2 ring-white" />
        </button>
        {thongTin.nut_them && (
          <button
            type="button"
            onClick={nhanNutThem}
            title={thongTin.nut_them}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#0055D4] hover:opacity-95 text-white text-xs sm:text-sm font-semibold size-8.5 sm:w-auto sm:h-9.5 sm:px-3.5 shadow-sm shadow-blue-500/20 transition-all shrink-0 active:scale-95"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">{thongTin.nut_them}</span>
          </button>
        )}
      </div>
    </header>
  );
}

