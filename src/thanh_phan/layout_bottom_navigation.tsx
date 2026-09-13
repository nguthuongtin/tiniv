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
          className="absolute inset-0 bottom-0 -z-10 bg-foreground/45 backdrop-blur-sm min-h-[100dvh]"
          onClick={() => setMoMenuThem(false)}
        />
      )}

      {moMenuThem && (
        <div className="absolute inset-x-2 bottom-20 rounded-[var(--radius-pop)] border border-border bg-background shadow-[var(--shadow-pop)] p-2 space-y-0.5 animate-in slide-in-from-bottom-6 fade-in duration-200">
          <Link
            href="/khach-hang"
            className="flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-3 text-sm text-foreground hover:bg-muted transition leading-relaxed"
          >
            <div className="size-9 rounded-[var(--radius-input)] bg-success text-success-foreground flex items-center justify-center shrink-0">
              <Building2 className="size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-relaxed">Khách hàng</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">CRM & liên hệ</div>
            </div>
          </Link>

          {laGiamDocHoacQTVHT && (
            <Link
              href="/nhan-su"
              className="flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-3 text-sm text-foreground hover:bg-muted transition leading-relaxed"
            >
              <div className="size-9 rounded-[var(--radius-input)] bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <UserCog className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-relaxed">Nhân sự</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">Hồ sơ & tài khoản</div>
              </div>
            </Link>
          )}

          {laGiamDocHoacQTVHT && (
            <button
              type="button"
              onClick={() => router.push('/bao-cao')}
              className="w-full flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-3 text-sm text-foreground hover:bg-muted transition text-left leading-relaxed"
            >
              <div className="size-9 rounded-[var(--radius-input)] bg-warning text-warning-foreground flex items-center justify-center shrink-0">
                <BarChart3 className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold leading-relaxed">Báo cáo</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">Thống kê & xuất file</div>
              </div>
            </button>
          )}

          {laGiamDocHoacQTVHT && (
            <button
              type="button"
              onClick={hienQuanTriSoon}
              className="w-full flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-3 text-sm text-muted-foreground hover:bg-muted transition text-left opacity-80 leading-relaxed"
            >
              <div className="size-9 rounded-[var(--radius-input)] bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0">
                <Shield className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold flex items-center gap-2 leading-relaxed">
                  Quản trị
                  <span className="text-[10px] px-1.5 h-4 rounded-full bg-muted text-muted-foreground border border-border inline-flex items-center">
                    Soon
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">CN/PB/Vai trò/Phân quyền</div>
              </div>
            </button>
          )}

          <div className="h-px bg-border mx-2 my-1.5" />
          <button
            onClick={async () => {
              const ok = await thucHienDangXuat();
              if (ok) router.replace('/dang-nhap');
            }}
            disabled={dangXuLy}
            className="w-full flex items-center gap-3 rounded-[var(--radius-card)] px-3.5 py-3 text-sm text-danger hover:bg-danger/10 transition disabled:opacity-60 leading-relaxed"
          >
            <div className="size-9 rounded-[var(--radius-input)] bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <LogOut className="size-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-relaxed">Đăng xuất</div>
              <div className="text-[11px] text-danger/80 leading-relaxed">
                {nguoiDungHienTai?.email ?? 'Thoát tài khoản'}
              </div>
            </div>
          </button>
        </div>
      )}

      <nav className="mx-2 mb-2 rounded-[var(--radius-pop)] bg-background border border-border shadow-[var(--shadow-pop)] backdrop-blur-md">
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
                    'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition relative',
                    active
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'size-9 rounded-[var(--radius-input)] flex items-center justify-center transition',
                      active ? 'bg-primary/10' : 'bg-transparent'
                    )}
                  >
                    <muc.icon
                      className={cn(
                        'size-[18px] transition',
                        active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'
                      )}
                    />
                  </div>
                  <span className="leading-relaxed">{muc.nhan}</span>
                  {active && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              onClick={() => setMoMenuThem((m) => !m)}
              className={cn(
                'w-full h-full flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition',
                moMenuThem
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-haspopup="true"
              aria-expanded={moMenuThem}
            >
              <div
                className={cn(
                  'size-9 rounded-[var(--radius-input)] flex items-center justify-center transition',
                  moMenuThem
                    ? 'bg-primary/10 ring-1 ring-primary/25 shadow-[var(--shadow-card)]'
                    : 'bg-transparent'
                )}
              >
                <Plus
                  className={cn(
                    'size-[18px] transition',
                    moMenuThem ? 'rotate-45 stroke-[2.5px]' : 'stroke-[1.75px]'
                  )}
                />
              </div>
              <span className="leading-relaxed">Thêm</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
