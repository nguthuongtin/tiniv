'use client';

import { usePathname } from 'next/navigation';
import { Plus, Search, Bell } from 'lucide-react';

const MAP_TIEU_DE: Record<string, { nhan: string; mo_ta: string; nut_them?: string; placeholder_tim: string; event_them?: string }> = {
  '/': {
    nhan: 'Tổng quan',
    mo_ta: 'Bảng điều khiển hệ thống và các module chính',
    placeholder_tim: 'Tìm kiếm hồ sơ, khách hàng...'
  },
  '/khach-hang': {
    nhan: 'Quản lý khách hàng',
    mo_ta: 'CRM — toàn bộ khách hàng và người liên hệ',
    nut_them: 'Thêm khách hàng',
    placeholder_tim: 'Tìm kiếm tên khách hàng, điện thoại, MST, email...',
    event_them: 'ebms:khach_hang:them_moi'
  },
  '/ho-so-du-an': {
    nhan: 'Hồ sơ dự án',
    mo_ta: 'Theo dõi giai đoạn, giá trị và thời hạn dự án',
    nut_them: 'Tạo hồ sơ dự án',
    placeholder_tim: 'Tìm kiếm mã hồ sơ, tên dự án, tên khách hàng...',
    event_them: 'ebms:ho_so_du_an:them_moi'
  },
  '/bao-cao-cong-viec': {
    nhan: 'Báo cáo công việc',
    mo_ta: 'Báo cáo hàng ngày nhân viên và lịch sử',
    nut_them: 'Gửi báo cáo hôm nay',
    placeholder_tim: 'Tìm kiếm nội dung, khó khăn...',
    event_them: 'ebms:bao_cao_cong_viec:them_moi'
  },
  '/nhan-su': {
    nhan: 'Nhân sự',
    mo_ta: 'Quản lý tài khoản, vai trò và thông tin nhân viên',
    nut_them: 'Thêm nhân viên',
    placeholder_tim: 'Tìm kiếm tên, mã NV, email, SĐT...',
    event_them: 'ebms:nhan_su:them_moi'
  },
  '/bao-cao': {
    nhan: 'Báo cáo & Thống kê',
    mo_ta: 'Bảng điều khiển tổng hợp số liệu và biểu đồ',
    nut_them: 'Tải xuất',
    placeholder_tim: 'Tìm kiếm trong báo cáo...'
  },
  '/ke-hoach': {
    nhan: 'Kế hoạch',
    mo_ta: 'Kế hoạch Tháng và Kế hoạch Tuần',
    nut_them: 'Thêm kế hoạch',
    placeholder_tim: 'Tìm kiếm kế hoạch...',
    event_them: 'ebms:ke_hoach:them_moi'
  },
  '/quan-tri': {
    nhan: 'Quản trị hệ thống',
    mo_ta: 'Thiết lập chi nhánh, phòng ban, danh mục sản phẩm, dịch vụ và phân quyền',
    nut_them: 'Làm mới',
    placeholder_tim: 'Tìm kiếm thiết lập...',
    event_them: 'ebms:quan_tri:tai_lai'
  }
};

const timThongTinTrang = (pathname: string) => {
  if (pathname in MAP_TIEU_DE) return MAP_TIEU_DE[pathname];
  if (pathname.startsWith('/khach-hang/')) return MAP_TIEU_DE['/khach-hang'];
  if (pathname.startsWith('/ho-so-du-an/')) return MAP_TIEU_DE['/ho-so-du-an'];
  if (pathname.startsWith('/bao-cao-cong-viec/')) return MAP_TIEU_DE['/bao-cao-cong-viec'];
  if (pathname.startsWith('/ke-hoach')) return MAP_TIEU_DE['/ke-hoach'];
  if (pathname.startsWith('/nhan-su/')) return MAP_TIEU_DE['/nhan-su'];
  if (pathname.startsWith('/quan-tri')) return MAP_TIEU_DE['/quan-tri'];
  return MAP_TIEU_DE['/'];
};

export default function ThanhPhanTopbar() {
  const pathname = usePathname() ?? '/';
  const thongTin = timThongTinTrang(pathname);

  const nhanNutThem = () => {
    if (typeof window === 'undefined') return;
    if (thongTin.event_them) {
      window.dispatchEvent(new CustomEvent(thongTin.event_them));
    } else if (pathname === '/') {
      window.location.href = '/bao-cao';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-13 sm:h-[70px] shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-3.5 sm:px-8 md:px-10 flex items-center justify-between gap-3 sm:gap-5 min-w-0 w-full transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate tracking-tight">
            {thongTin.nhan}
          </h1>
          <span className="hidden md:block text-xs text-slate-400 truncate font-normal">
            {thongTin.mo_ta}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          className="hidden md:inline-flex items-center justify-center size-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition relative shadow-xs active:scale-95"
          aria-label="Thông báo"
        >
          <Bell className="size-4.5" strokeWidth={2} />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#FF3B30] ring-2 ring-white" />
        </button>
        {thongTin.nut_them && (
          <button
            type="button"
            onClick={nhanNutThem}
            title={thongTin.nut_them}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#0055D4] hover:opacity-95 text-white text-xs sm:text-sm font-semibold size-9 sm:w-auto sm:h-10 sm:px-4 shadow-sm shadow-blue-500/20 transition-all shrink-0 active:scale-95"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">{thongTin.nut_them}</span>
          </button>
        )}
      </div>
    </header>
  );
}
