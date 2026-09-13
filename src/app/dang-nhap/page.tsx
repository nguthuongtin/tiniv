'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  LogIn,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { ketQuaDangNhapCacLoai } from '../../dich_vu/xac_thuc/dich_vu_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';

const schemaDangNhap = z.object({
  email: z
    .string({ required_error: 'Nhập email để đăng nhập' })
    .trim()
    .min(4, 'Email ít nhất 4 ký tự')
    .email('Email không hợp lệ. Vd: admin@ebms.io'),
  mat_khau: z
    .string({ required_error: 'Nhập mật khẩu' })
    .min(6, 'Mật khẩu ít nhất 6 ký tự')
});

type FormDangNhap = z.infer<typeof schemaDangNhap>;

const TrangDangNhap: React.FC = () => {
  const router = useRouter();
  const [hienMatKhau, setHienMatKhau] = React.useState(false);

  const {
    thucHienDangNhap,
    nguoiDungHienTai,
    dangXuLy,
    thongBaoDangNhap,
    xoaThongBaoDangNhap,
    daKhoiDong
  } = useStoreXacThuc();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors }
  } = useForm<FormDangNhap>({
    resolver: zodResolver(schemaDangNhap),
    defaultValues: { email: '', mat_khau: '' },
    mode: 'onSubmit'
  });

  useEffect(() => {
    try {
      setTimeout(() => setFocus('email'), 150);
    } catch {
      /* ignore */
    }
  }, [setFocus]);

  // Nếu đã đăng nhập → đẩy về trang chủ (tùy chọn, đã có guard rồi nhưng tránh trường hợp 2 action)
  useEffect(() => {
    if (daKhoiDong && nguoiDungHienTai) {
      try {
        router.replace('/');
      } catch {
        /* ignore */
      }
    }
  }, [daKhoiDong, nguoiDungHienTai, router]);

  const khiNhanNutDangNhap = async (giaTri: FormDangNhap) => {
    xoaThongBaoDangNhap();
    await thucHienDangNhap(giaTri.email, giaTri.mat_khau);
  };

  const mauThongBao = (() => {
    if (!thongBaoDangNhap) return null;
    const thanhCong = thongBaoDangNhap.ketQua === ketQuaDangNhapCacLoai.THANH_CONG;
    const khoa = thongBaoDangNhap.ketQua === ketQuaDangNhapCacLoai.TAI_KHOAN_KHOA;
    const bg = thanhCong
      ? 'bg-success/10 border-success/30 text-success-foreground'
      : khoa
        ? 'bg-warning/10 border-warning/30 text-warning'
        : 'bg-danger/10 border-danger/30 text-danger';
    const icon = thanhCong ? (
      <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
    ) : (
      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
    );
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-[var(--radius-card)] border px-4 py-3.5 text-sm font-semibold',
          bg
        )}
      >
        {icon}
        <div className="flex-1 leading-relaxed">
          {thongBaoDangNhap.thongBao}
          {thanhCong && (
            <span className="ml-1 text-success/80 inline-flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> chuyển hướng...
            </span>
          )}
        </div>
      </div>
    );
  })();

  return (
    <main className="min-h-screen w-full flex flex-col sm:flex-row bg-muted">
      {/* TRÁI - Mô tả EBMS (desktop: 1 nửa, mobile: ẩn) */}
      <section className="hidden sm:flex flex-1 flex-col justify-center relative overflow-hidden px-10 lg:px-16 xl:px-20 bg-primary text-primary-foreground">
        <div className="max-w-lg space-y-7">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-4.5 py-1.5 text-xs font-semibold">
            <Building2 size={14} />
            EBMS 1.0 — Hệ thống Quản trị Chi nhánh Doanh nghiệp
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Quản lý 1 tập thể, 10 chi nhánh, 100+ hồ sơ dự án —{' '}
            <span className="text-primary-foreground/70">trong cùng một màn hình.</span>
          </h1>
          <p className="text-primary-foreground/85 text-sm lg:text-base leading-relaxed">
            Hệ thống EBMS hợp nhất 7 module: Tổng quan, Khách hàng, Hồ sơ dự án,
            Báo cáo công việc, Nhân sự, Báo cáo tổng hợp và Quản trị
            hệ thống — phân quyền theo vai trò, truy cập mọi thời điểm trên web &amp; mobile.
          </p>
          <ul className="space-y-2.5 text-primary-foreground/90 text-sm lg:text-base">
            <li className="flex items-center gap-3 leading-relaxed"><CheckCircle2 size={16} className="text-primary-foreground/60 shrink-0" /> Thiết kế di động &amp; Font Inter — thao tác nhanh trên điện thoại</li>
            <li className="flex items-center gap-3 leading-relaxed"><CheckCircle2 size={16} className="text-primary-foreground/60 shrink-0" /> Xác thực Firebase &amp; Firestore bảo mật 2 lớp</li>
            <li className="flex items-center gap-3 leading-relaxed"><CheckCircle2 size={16} className="text-primary-foreground/60 shrink-0" /> Xuất báo cáo Excel (ExcelJS) &amp; PDF (jsPDF)</li>
          </ul>
        </div>
      </section>

      {/* PHẢI - FORM ĐĂNG NHẬP */}
      <section className="flex-1 flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12">
        <div className="w-full max-w-md space-y-7">
          {/* Logo Mobile */}
          <div className="flex sm:hidden items-center gap-3">
            <div className="size-12 rounded-[var(--radius-pop)] bg-primary text-primary-foreground shadow-[var(--shadow-card)] flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-foreground leading-tight">EBMS 1.0</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Quản trị chi nhánh doanh nghiệp</div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Đăng nhập hệ thống</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sử dụng tài khoản do Quản trị viên cấp để đăng nhập vào EBMS.
            </p>
          </div>

          {mauThongBao}

          <form
            className="space-y-5.5"
            onSubmit={(e) => {
              void handleSubmit(khiNhanNutDangNhap)(e);
            }}
            noValidate
          >
            {/* Email */}
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-sm font-bold text-foreground leading-relaxed">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="admin@ebms.io"
                  className={cn(
                    'w-full h-12 rounded-[var(--radius-input)] border border-border bg-background text-foreground text-sm pl-12 pr-4 outline-none transition shadow-[var(--shadow-card)] leading-relaxed font-medium',
                    'placeholder:text-muted-foreground',
                    errors.email
                      ? 'border-danger focus:border-danger focus:ring-4 focus:ring-danger/20'
                      : 'focus:border-primary focus:ring-4 focus:ring-primary/12'
                  )}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-loi' : undefined}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p id="email-loi" className="text-xs font-bold text-danger pl-1 leading-relaxed">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="mat_khau" className="text-sm font-bold text-foreground leading-relaxed">
                  Mật khẩu
                </label>
                <Link
                  href="/quen-mat-khau"
                  className="text-xs font-semibold text-primary hover:text-primary/90 active:text-primary/80 transition-colors leading-relaxed"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  id="mat_khau"
                  type={hienMatKhau ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full h-12 rounded-[var(--radius-input)] border border-border bg-background text-foreground text-sm pl-12 pr-12 outline-none transition-all shadow-[var(--shadow-card)] leading-relaxed font-medium',
                    'placeholder:text-muted-foreground',
                    errors.mat_khau
                      ? 'border-danger focus:border-danger focus:ring-4 focus:ring-danger/20'
                      : 'focus:border-primary focus:ring-4 focus:ring-primary/12'
                  )}
                  aria-invalid={Boolean(errors.mat_khau)}
                  aria-describedby={errors.mat_khau ? 'mk-loi' : undefined}
                  {...register('mat_khau')}
                />
                <button
                  type="button"
                  onClick={() => setHienMatKhau((c) => !c)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 flex items-center justify-center rounded-[var(--radius-button)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {hienMatKhau ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.mat_khau && (
                <p id="mk-loi" className="text-xs font-bold text-danger pl-1 leading-relaxed">
                  {errors.mat_khau.message}
                </p>
              )}
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={dangXuLy}
              className={cn(
                'w-full h-12 sm:h-13 rounded-[var(--radius-input)] font-bold text-primary-foreground transition-all inline-flex items-center justify-center gap-2.5 shadow-[var(--shadow-card)]',
                dangXuLy
                  ? 'bg-primary/80 cursor-progress'
                  : 'bg-primary hover:bg-primary/92 active:bg-primary/85 active:scale-[0.99]'
              )}
            >
              {dangXuLy ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Đăng nhập hệ thống
                </>
              )}
            </button>

            {/* Ghi chú admin */}
            <div className="rounded-[var(--radius-card)] border border-primary/20 bg-primary/8 px-4.5 py-3.5 text-xs text-primary space-y-1.5 leading-relaxed">
              <p className="font-extrabold">Tài khoản ADMIN mẫu (nếu đã chạy seed):</p>
              <p className="font-mono font-semibold">Email: admin@ebms.io</p>
              <p className="font-mono font-semibold">Mật khẩu: EBMS@2026</p>
              <p className="text-primary/90 pt-1 leading-relaxed">
                Sau khi đăng nhập LẦN ĐẦU, hãy đổi mật khẩu ngay để bảo mật tài khoản.
              </p>
            </div>
          </form>

          <div className="pt-1 border-t border-border">
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              © {new Date().getFullYear()} EBMS Hệ thống Quản trị Chi nhánh Doanh nghiệp.
              Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TrangDangNhap;
