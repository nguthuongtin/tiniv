'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  LogIn,
  FolderKanban,
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
    .min(1, 'Vui lòng nhập email')
    .email('Email không đúng định dạng'),
  mat_khau: z
    .string({ required_error: 'Nhập mật khẩu' })
    .min(1, 'Vui lòng nhập mật khẩu')
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

  // Nếu đã đăng nhập → đẩy về trang chủ
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
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : khoa
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-rose-50 border-rose-200 text-rose-800';
    const icon = thanhCong ? (
      <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
    ) : (
      <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />
    );
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-semibold',
          bg
        )}
      >
        {icon}
        <div className="flex-1 leading-relaxed">
          {thongBaoDangNhap.thongBao}
          {thanhCong && (
            <span className="ml-1 text-emerald-600 inline-flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> đang chuyển hướng...
            </span>
          )}
        </div>
      </div>
    );
  })();

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 relative overflow-hidden">
      {/* Hiệu ứng nền trang trí nhẹ nhàng */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/60 relative z-10 space-y-6">
        {/* Logo & Tên phần mềm */}
        <div className="text-center space-y-2">
          <div className="size-16 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/25 mx-auto border border-white/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192x192.png" alt="TiniPMS" className="size-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            TiniPMS
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Hệ thống Quản trị Dự án &amp; Báo cáo Công việc
          </p>
        </div>

        {mauThongBao}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            void handleSubmit(khiNhanNutDangNhap)(e);
          }}
          noValidate
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-700">
              Tài khoản Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                placeholder="name@company.com"
                className={cn(
                  'w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-xs pl-10 pr-3.5 outline-none transition font-medium',
                  'placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100',
                  errors.email && 'border-rose-500 focus:border-rose-500 focus:ring-rose-100'
                )}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] font-bold text-rose-600 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label htmlFor="mat_khau" className="text-xs font-bold text-slate-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="mat_khau"
                type={hienMatKhau ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={cn(
                  'w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-xs pl-10 pr-11 outline-none transition font-medium',
                  'placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100',
                  errors.mat_khau && 'border-rose-500 focus:border-rose-500 focus:ring-rose-100'
                )}
                {...register('mat_khau')}
              />
              <button
                type="button"
                onClick={() => setHienMatKhau((c) => !c)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {hienMatKhau ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.mat_khau && (
              <p className="text-[11px] font-bold text-rose-600 pl-1">
                {errors.mat_khau.message}
              </p>
            )}
          </div>

          {/* Nút Đăng nhập */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={dangXuLy}
              className={cn(
                'w-full h-11 rounded-xl font-bold text-xs text-white transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer',
                dangXuLy
                  ? 'bg-blue-400 cursor-progress'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
              )}
            >
              {dangXuLy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn size={16} /> Đăng nhập
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default TrangDangNhap;

