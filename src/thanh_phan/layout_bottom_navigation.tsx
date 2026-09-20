'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FolderKanban,
  FileText,
  Plus,
  Building2,
  UserCog,
  Shield,
  LogOut,
  BarChart3
} from 'lucide-react';
import { cn } from '../thu_vien/utils/cn';
import useStoreXacThuc from '../thu_vien/zustand/store_xac_thuc';
import { useEffect, useState } from 'react';

const MUC_DUOI_CO_BAN = [
  { href: '/', icon: Home, nhan: 'Trang chủ' },
  { href: '/khach-hang', icon: Building2, nhan: 'Khách hàng' },
  { href: '/ho-so-du-an', icon: FolderKanban, nhan: 'Dự án' },
  { href: '/bao-cao-cong-viec', icon: FileText, nhan: 'Báo cáo CV' }
] as const;

export default function ThanhDieuHuongDuoi() {
  const pathname = usePathname() ?? '/';
  const [moMenuThem, setMoMenuThem] = useState(false);
  const router = useRouter();
  const { thucHienDangXuat, dangXuLy, nguoiDungHienTai } = useStoreXacThuc();
  const laGiamDocHoacQTVHT =
    nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' ||
    nguoiDungHienTai?.vai_tro === 'giam_doc';

  useEffect(() => {
    setMoMenuThem(false);
  }, [pathname]);

  const hienQuanTriSoon = () => {
    alert('Chức năng Quản trị đang phát triển, sẽ có trong bản cập nhật tiếp theo');
  };

  return (
    <div
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50',
        'pb-[env(safe-area-inset-bottom,0px)]'
      )}
    >
      {moMenuThem && (
        <div
          className="absolute inset-0 bottom-0 -z-10 bg-slate-900/20 backdrop-blur-xs min-h-[100dvh]"
          onClick={() => setMoMenuThem(false)}
        />
      )}

      {moMenuThem && (
        <div className="absolute inset-x-3 bottom-20 rounded-[22px] border border-slate-200/90 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] p-2 space-y-0.5 animate-in slide-in-from-bottom-6 fade-in duration-200">
          <Link
            href="/khach-hang"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-50 transition leading-relaxed active:scale-[0.98]"
          >
            <div className="size-9 rounded-[12px] bg-gradient-to-br from-[#34C759] to-[#248A3D] text-white flex items-center justify-center shrink-0 shadow-xs shadow-green-500/20">
              <Building2 className="size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold leading-snug">Khách hàng</div>
              <div className="text-[11px] text-slate-400 leading-tight">CRM & liên hệ</div>
            </div>
          </Link>

          {laGiamDocHoacQTVHT && (
            <Link
              href="/nhan-su"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-50 transition leading-relaxed active:scale-[0.98]"
            >
              <div className="size-9 rounded-[12px] bg-gradient-to-br from-[#007AFF] to-[#0055D4] text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
                <UserCog className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Nhân sự</div>
                <div className="text-[11px] text-slate-400 leading-tight">Hồ sơ & tài khoản</div>
              </div>
            </Link>
          )}

          {laGiamDocHoacQTVHT && (
            <button
              type="button"
              onClick={() => router.push('/bao-cao')}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-900 hover:bg-slate-50 transition text-left leading-relaxed active:scale-[0.98]"
            >
              <div className="size-9 rounded-[12px] bg-gradient-to-br from-[#FF9500] to-[#E07000] text-white flex items-center justify-center shrink-0 shadow-xs shadow-orange-500/20">
                <BarChart3 className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold leading-snug">Báo cáo</div>
                <div className="text-[11px] text-slate-400 leading-tight">Thống kê & xuất file</div>
              </div>
            </button>
          )}

          <div className="h-px bg-slate-100 mx-2 my-1" />
          <button
            onClick={async () => {
              const ok = await thucHienDangXuat();
              if (ok) router.replace('/dang-nhap');
            }}
            disabled={dangXuLy}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#FF3B30] hover:bg-red-50 transition disabled:opacity-60 leading-relaxed active:scale-[0.98]"
          >
            <div className="size-9 rounded-[12px] bg-red-100 text-[#FF3B30] flex items-center justify-center shrink-0">
              <LogOut className="size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold leading-snug">Đăng xuất</div>
              <div className="text-[11px] text-red-500/80 leading-tight">
                {nguoiDungHienTai?.email ?? 'Thoát tài khoản'}
              </div>
            </div>
          </button>
        </div>
      )}

      <nav className="mx-3 mb-2 rounded-[22px] bg-white/90 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <ul className="grid grid-cols-5">
          {MUC_DUOI_CO_BAN.map((muc) => {
            const active =
              muc.href === '/'
                ? pathname === '/' || pathname.startsWith('/bao-cao')
                : pathname.startsWith(muc.href);
            return (
              <li key={muc.href}>
                <Link
                  href={muc.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px] transition relative active:scale-95',
                    active
                      ? 'text-[#007AFF] font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'size-8 rounded-[10px] flex items-center justify-center transition',
                      active ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-transparent'
                    )}
                  >
                    <muc.icon
                      className={cn(
                        'size-[18px] transition',
                        active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                      )}
                    />
                  </div>
                  <span className="leading-tight">{muc.nhan}</span>
                  {active && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#007AFF]" />
                  )}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              onClick={() => setMoMenuThem((m) => !m)}
              className={cn(
                'w-full h-full flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px] transition active:scale-95',
                moMenuThem
                  ? 'text-[#007AFF] font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              )}
              aria-haspopup="true"
              aria-expanded={moMenuThem}
            >
              <div
                className={cn(
                  'size-8 rounded-[10px] flex items-center justify-center transition',
                  moMenuThem
                    ? 'bg-[#007AFF]/10 text-[#007AFF] ring-1 ring-[#007AFF]/25 shadow-xs'
                    : 'bg-transparent'
                )}
              >
                <Plus
                  className={cn(
                    'size-[18px] transition',
                    moMenuThem ? 'rotate-45 stroke-[2.5px]' : 'stroke-[1.8px]'
                  )}
                />
              </div>
              <span className="leading-tight">Thêm</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
