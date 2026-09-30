'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStoreXacThuc } from '../thu_vien/zustand/store_xac_thuc';
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
  User,
  BookOpen,
  TrendingUp,
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
  '/lead': {
    nhan: 'Quản lý Lead',
    nhan_mobile: 'Lead',
    mo_ta: 'Tiếp cận và khai thác khách hàng tiềm năng',
    icon: Sparkles,
    placeholder_tim: 'Tìm kiếm Lead...'
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
  if (pathname.startsWith('/lead')) return { thongTin: MAP_TIEU_DE['/lead'], laChiTiet: false };
  if (pathname.startsWith('/kho-tai-lieu')) return { thongTin: MAP_TIEU_DE['/kho-tai-lieu'], laChiTiet: false };
  if (pathname.startsWith('/ke-hoach')) return { thongTin: MAP_TIEU_DE['/ke-hoach'], laChiTiet: false };
  if (pathname.startsWith('/quan-tri')) return { thongTin: MAP_TIEU_DE['/quan-tri'], laChiTiet: false };

  return { thongTin: MAP_TIEU_DE['/'], laChiTiet: false };
};

export default function ThanhPhanTopbar() {
  const pathname = usePathname() ?? '/';
  const { nguoiDungHienTai, thucHienDangXuat } = useStoreXacThuc();
  const [moMenuMobile, setMoMenuMobile] = React.useState(false);
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
              className="size-8 rounded-[14px] bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors active:scale-95 border border-slate-200/60"
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
                      <PageIcon className="size-3.5 text-[#107555] shrink-0" strokeWidth={2.2} />
                      <span className="truncate">{tieuDeChiTiet ?? thongTin.nhan}</span>
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 px-2 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 truncate tracking-tight">
                    <PageIcon className="size-3.5 text-[#107555] shrink-0" strokeWidth={2.2} />
                    <span className="truncate">{thongTin.nhan}</span>
                  </span>
                )}
              </>
            )}
          </nav>

          {/* Tiêu đề thanh Topbar trên Mobile (One UI 9 gọn gàng, không bị cắt chữ) */}
          <div className="sm:hidden flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMoMenuMobile(!moMenuMobile)}
              className="size-9 flex items-center justify-center rounded-[14px] bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 transition active:scale-95 shrink-0"
              aria-label="Mở menu"
            >
              <Menu className="size-4.5" strokeWidth={2.4} />
            </button>
            <span className="inline-flex items-center gap-1.5 font-extrabold text-slate-900 text-[15px] tracking-tight whitespace-nowrap">
              <PageIcon className="size-4 text-[#107555] shrink-0" strokeWidth={2.3} />
              <span>{tieuDeChiTiet ?? thongTin.nhan_mobile ?? thongTin.nhan}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Tên nhân sự trên Mobile/Desktop */}
          <Link
            href="/tai-khoan"
            className="flex items-center gap-2 pl-2 sm:pl-3 sm:border-l sm:border-slate-200/80 py-1 rounded-full hover:bg-slate-50 transition"
          >
            <div className="flex flex-col items-end justify-center">
              <span className="text-[12.5px] sm:text-[13px] font-bold text-slate-800 leading-none whitespace-nowrap">
                <span className="hidden sm:inline">{nguoiDungHienTai?.ho_va_ten || 'Tài khoản'}</span>
                <span className="sm:hidden">{getTenNgan(nguoiDungHienTai?.ho_va_ten)}</span>
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium mt-0.5">
                {nguoiDungHienTai?.vai_tro === 'giam_doc' ? 'Giám đốc' : 
                 nguoiDungHienTai?.vai_tro === 'truong_phong' ? 'Trưởng phòng' : 
                 nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' ? 'Quản trị' : 'Nhân viên'}
              </span>
            </div>
            <div className="size-8 sm:size-9 rounded-[14px] bg-emerald-500/15 text-[#107555] flex items-center justify-center font-extrabold text-[13px] border border-emerald-500/20 shrink-0">
              {getTenNgan(nguoiDungHienTai?.ho_va_ten).charAt(0).toUpperCase() || 'U'}
            </div>
          </Link>

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
              href="/lead"
              onClick={() => setMoMenuMobile(false)}
              className="flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-100/80 transition active:scale-[0.98]"
            >
              <div className="size-9 rounded-[14px] bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Lead tiềm năng</div>
                <div className="text-[11px] text-slate-400 leading-tight">Tiếp cận & khai thác</div>
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
    </>
  );
}

