'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  FolderKanban,
  FileText,
  ListTodo,
  LogOut,
  Home,
  User,
  Shield,
  MapPin,
  Users,
  BarChart3,
  Settings2,
  CalendarRange
} from 'lucide-react';
import { cn } from '../thu_vien/utils/cn';
import useStoreXacThuc from '../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../thu_vien/phan_quyen/kiem_tra_quyen';
import { DaiDien } from './ui/dai_dien';

interface MucSidebar {
  href: string;
  icon: any;
  nhan: string;
  nhom: 'Tổng quan' | 'Module' | 'Quản trị';
  quyen?: string | string[];
}

const DANH_MUC_SIDEBAR: MucSidebar[] = [
  { href: '/', icon: Home, nhan: 'Tổng quan', nhom: 'Tổng quan' },
  { href: '/khach-hang', icon: Building2, nhan: 'Khách hàng', nhom: 'Module' },
  { href: '/ho-so-du-an', icon: FolderKanban, nhan: 'Hồ sơ dự án', nhom: 'Module', quyen: 'du_an.xem' },
  { href: '/ke-hoach', icon: CalendarRange, nhan: 'Kế hoạch', nhom: 'Module', quyen: 'ke_hoach.xem' },
  { href: '/bao-cao-cong-viec', icon: FileText, nhan: 'Báo cáo công việc', nhom: 'Module', quyen: ['bao_cao.xem', 'bao_cao.tao'] },
  { href: '/nhan-su', icon: Users, nhan: 'Nhân sự', nhom: 'Module', quyen: ['nhan_su.xem', 'nhan_su.quan_ly'] },
  { href: '/bao-cao', icon: BarChart3, nhan: 'Báo cáo & Thống kê', nhom: 'Quản trị', quyen: 'bao_cao.xem' },
  { href: '/quan-tri', icon: Settings2, nhan: 'Quản trị', nhom: 'Quản trị', quyen: 'he_thong.quan_tri' }
];

const MAP_TEN_VAI_TRO: Record<string, string> = {
  quan_tri_he_thong: 'Quản trị hệ thống',
  giam_doc: 'Giám đốc',
  truong_phong: 'Trưởng phòng',
  nhan_vien_kinh_doanh: 'Nhân viên kinh doanh',
  nhan_vien_ky_thuat: 'Nhân viên kỹ thuật'
};

const chuyenDauKhongDauVeCoDau = (tenRaw: string | null | undefined): string => {
  if (!tenRaw) return '';
  const s = String(tenRaw).trim();
  const map: Record<string, string> = {
    He: 'Hệ', 'he': 'hệ',
    thong: 'thống', Thong: 'Thống',
    Quan: 'Quản', quan: 'quản',
    Tri: 'Trị', tri: 'trị',
    Dang: 'Đăng', dang: 'đăng',
    Xuat: 'Xuất', xuat: 'xuất',
    nhap: 'nhập', Nhap: 'Nhập',
    nhan: 'nhân', Nhan: 'Nhân',
    vien: 'viên', Vien: 'Viên',
    kinh: 'kinh', Kinh: 'Kinh',
    doanh: 'doanh', Doanh: 'Doanh',
    ky: 'kỹ', Ky: 'Kỹ',
    thuat: 'thuật', Thuat: 'Thuật',
    giam: 'giám', Giam: 'Giám',
    doc: 'đốc', Doc: 'Đốc',
    truong: 'trưởng', Truong: 'Trưởng',
    phong: 'phòng', Phong: 'Phòng',
    tai: 'tài', Tai: 'Tài',
    khoan: 'khoản', Khoan: 'Khoản',
    chua: 'chưa', Chua: 'Chưa',
    co: 'có', Co: 'Có'
  };
  let out = s;
  for (const [k, v] of Object.entries(map)) {
    const re = new RegExp(`\\b${k}\\b`, 'g');
    out = out.replace(re, v);
  }
  return out;
};

export const hienThiTenVaiTro = (vaiTro: string | null | undefined): string => {
  if (!vaiTro) return 'Nhân viên';
  const coSan = MAP_TEN_VAI_TRO[vaiTro];
  if (coSan) return coSan;
  const chuyenDoi = chuyenDauKhongDauVeCoDau(vaiTro);
  return chuyenDoi || String(vaiTro);
};

const dauTiengVietHoa = (s?: string | null) => (chuyenDauKhongDauVeCoDau(s) ?? '').trim().charAt(0).toUpperCase();

const hoTenCoDau = (raw: string | null | undefined): string => {
  const dk = chuyenDauKhongDauVeCoDau(raw);
  if (!dk) return '';
  return dk;
};

const useSidebarShared = () => {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { nguoiDungHienTai, thucHienDangXuat, dangXuLy } = useStoreXacThuc();

  const nhomHienTai = (() => {
    if (pathname === '/') return 'Tổng quan';
    if (pathname.startsWith('/bao-cao-cong-viec')) return 'Báo cáo công việc';
    if (pathname.startsWith('/bao-cao')) return 'Báo cáo & Thống kê';
    if (pathname.startsWith('/khach-hang')) return 'Khách hàng';
    if (pathname.startsWith('/ho-so-du-an')) return 'Hồ sơ dự án';
    if (pathname.startsWith('/nhan-su')) return 'Nhân sự';
    if (pathname.startsWith('/quan-tri')) return 'Quản trị hệ thống';
    return 'TiniPMS';
  })();

  const laQuyenQuanTri =
    nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' ||
    nguoiDungHienTai?.vai_tro === 'giam_doc';

  const xuLyDangXuat = async () => {
    const ok = await thucHienDangXuat();
    if (ok) router.replace('/dang-nhap');
  };

  return { pathname, nguoiDungHienTai, dangXuLy, nhomHienTai, laQuyenQuanTri, xuLyDangXuat };
};

const renderDanhMuc = (
  pathname: string,
  laQuyenQuanTri: boolean,
  nguoiDungHienTai: any
) => {
  const kiemTraQuyenMuc = (muc: MucSidebar): boolean => {
    if (!muc.quyen) return true;
    if (!nguoiDungHienTai) return false;
    if (nguoiDungHienTai.vai_tro === 'quan_tri_he_thong') return true;
    if (Array.isArray(muc.quyen)) {
      return muc.quyen.some((q) => coQuyen(nguoiDungHienTai, q));
    }
    return coQuyen(nguoiDungHienTai, muc.quyen);
  };

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
      {['Tổng quan', 'Module', 'Quản trị'].map((tenNhom) => {
        const ds = DANH_MUC_SIDEBAR.filter(
          (m) => m.nhom === tenNhom && kiemTraQuyenMuc(m)
        );
        if (!ds.length) return null;
        return (
          <div key={tenNhom}>
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {tenNhom}
            </div>
            <ul className="space-y-1">
              {ds.map((muc) => {
                const active =
                  muc.href === '/'
                    ? pathname === '/'
                    : muc.href === '/bao-cao'
                    ? pathname === '/bao-cao' ||
                      (pathname.startsWith('/bao-cao/') &&
                        !pathname.startsWith('/bao-cao-cong-viec'))
                    : pathname.startsWith(muc.href);
                const khoa_muc_doan = (muc as any).soon && !laQuyenQuanTri;
                const Wrapper: any = (muc as any).soon
                  ? ({ children }: any) => (
                      <button
                        type="button"
                        onClick={() => {
                          alert('Quản trị: Sẽ có trong bản cập nhật tiếp theo');
                        }}
                        className="w-full text-left"
                      >
                        {children}
                      </button>
                    )
                  : ({ children, href }: any) => <Link href={href}>{children}</Link>;
                return (
                  <li key={muc.href}>
                    <Wrapper href={muc.href}>
                      <span
                        className={cn(
                          'group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] transition-all',
                          khoa_muc_doan && 'opacity-60',
                          active
                            ? 'bg-[#007AFF]/10 text-[#007AFF] font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                        )}
                      >
                        <span
                          className={cn(
                            'size-7.5 rounded-[9px] inline-flex items-center justify-center shrink-0 transition-colors',
                            active
                              ? 'bg-[#007AFF] text-white shadow-xs shadow-blue-500/20'
                              : 'text-slate-400 group-hover:text-slate-700'
                          )}
                        >
                          <muc.icon className="size-4" strokeWidth={active ? 2.4 : 1.9} />
                        </span>
                        <span className="truncate flex-1">{muc.nhan}</span>
                        {active && (
                          <span className="size-1.5 rounded-full bg-[#007AFF] shrink-0" />
                        )}
                        {(muc as any).soon && (
                          <span className="text-[10px] px-2 h-5 rounded-full bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 inline-flex items-center font-bold shrink-0">
                            Soon
                          </span>
                        )}
                      </span>
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
};

const renderCuoiSidebar = (
  nguoiDungHienTai: any,
  dangXuLy: boolean,
  xuLyDangXuat: () => Promise<void>
) => {
  const tenNguoiDung = hoTenCoDau(nguoiDungHienTai?.ho_va_ten) || 'Nhân viên TiniPMS';
  const vaiTro = hienThiTenVaiTro(nguoiDungHienTai?.vai_tro);

  return (
    <div className="border-t border-slate-200/80 p-3 bg-slate-50/50 shrink-0">
      <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <DaiDien
          ten={nguoiDungHienTai?.ho_va_ten}
          anh={nguoiDungHienTai?.url_anh_dai_dien}
          kich_thuoc="sm"
          className="shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-slate-900 truncate leading-snug">
            {tenNguoiDung}
          </div>
          <div className="text-[11px] text-slate-400 truncate leading-tight font-medium">
            {vaiTro}
          </div>
        </div>
        <button
          type="button"
          onClick={xuLyDangXuat}
          disabled={dangXuLy}
          className="size-8 rounded-xl text-slate-400 hover:text-[#FF3B30] hover:bg-red-50 flex items-center justify-center shrink-0 transition disabled:opacity-50 active:scale-95"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
};

const renderHeaderSidebar = (nhomHienTai: string) => (
  <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0 bg-white">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="size-9 rounded-[12px] overflow-hidden shadow-sm shadow-blue-500/20 shrink-0 border border-slate-200/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192x192.png" alt="TiniPMS" className="size-full object-cover" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-slate-900 text-[15.5px] leading-none">
            TiniPMS
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 leading-none">
            PMS
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate mt-1 leading-none font-medium">
          {nhomHienTai}
        </p>
      </div>
    </div>
  </div>
);

export function SidebarDesktop() {
  const { pathname, nguoiDungHienTai, dangXuLy, nhomHienTai, laQuyenQuanTri, xuLyDangXuat } = useSidebarShared();
  return (
    <aside className="hidden md:flex w-full h-full shrink-0 flex-col bg-white border-r border-slate-200/80 overflow-hidden min-h-0">
      {renderHeaderSidebar(nhomHienTai)}
      {renderDanhMuc(pathname, laQuyenQuanTri, nguoiDungHienTai)}
      {renderCuoiSidebar(nguoiDungHienTai, dangXuLy, xuLyDangXuat)}
    </aside>
  );
}

export function SidebarMobileDrawer() {
  const { pathname, nguoiDungHienTai, dangXuLy, nhomHienTai, laQuyenQuanTri, xuLyDangXuat } = useSidebarShared();
  const [moMobile, setMoMobile] = useState(false);

  useEffect(() => {
    const handler = () => setMoMobile((m: boolean) => !m);
    window.addEventListener('ebms:toggle_mobile_sidebar', handler);
    return () => window.removeEventListener('ebms:toggle_mobile_sidebar', handler);
  }, []);

  useEffect(() => {
    setMoMobile(false);
  }, [pathname]);

  if (!moMobile) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-10 flex flex-col min-h-0"
      aria-modal="true"
      role="dialog"
      aria-label="Menu điều hướng"
    >
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-xs min-h-[100dvh] animate-in fade-in duration-200"
        onClick={() => setMoMobile(false)}
        aria-hidden="true"
      />
      <aside className="relative z-[1] w-[82%] max-w-[280px] h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-250 border-r border-slate-200/80 shrink-0 overflow-hidden">
        <div className="flex flex-col h-full min-h-0">
          {renderHeaderSidebar(nhomHienTai)}
          <div className="flex-1 overflow-y-auto min-h-0">
            {renderDanhMuc(pathname, laQuyenQuanTri, nguoiDungHienTai)}
          </div>
          {renderCuoiSidebar(nguoiDungHienTai, dangXuLy, xuLyDangXuat)}
        </div>
      </aside>
    </div>
  );
}

export default function BoCucSidebar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarDesktop />
      <SidebarMobileDrawer />
      {children}
    </>
  );
}
