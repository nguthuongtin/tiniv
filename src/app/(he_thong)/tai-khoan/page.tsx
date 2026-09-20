'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Trash2,
  Link as LinkIcon,
  BadgeCheck
} from 'lucide-react';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { DaiDien } from '../../../thanh_phan/ui/dai_dien';
import {
  layChiTietNhanSu,
  capNhatNhanSu,
  doiMatKhauNhanSu
} from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { hienThiTenVaiTro } from '../../../thanh_phan/layout_sidebar';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../thu_vien/types/nhan_su';
import { cn } from '../../../thu_vien/utils/cn';

// Helper nén ảnh đại diện tự động bằng Canvas (kích thước tối đa 300x300, dung lượng < 35KB)
const nenAnhDaiDien = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxKichThuoc = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxKichThuoc) {
            height = Math.round((height * maxKichThuoc) / width);
            width = maxKichThuoc;
          }
        } else {
          if (height > maxKichThuoc) {
            width = Math.round((width * maxKichThuoc) / height);
            height = maxKichThuoc;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Ưu tiên định dạng WebP, fallback JPEG
        try {
          const dataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(dataUrl);
        } catch {
          const fallbackUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(fallbackUrl);
        }
      };
      img.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp.'));
    reader.readAsDataURL(file);
  });
};

export default function TrangTaiKhoanCaNhan() {
  const { nguoiDungHienTai, datNguoiDungHienTai } = useStoreXacThuc();

  const [dangTai, setDangTai] = useState(true);
  const [hoSoChiTiet, setHoSoChiTiet] = useState<NhanSu | null>(null);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);

  // Form Avatar & Liên hệ
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [soDienThoai, setSoDienThoai] = useState('');
  const [linkAvatarNgoai, setLinkAvatarNgoai] = useState('');
  const [hienNhapLink, setHienNhapLink] = useState(false);
  const [dangLuuHoSo, setDangLuuHoSo] = useState(false);
  const [thongBaoHoSo, setThongBaoHoSo] = useState<{ loai: 'ok' | 'loi'; nd: string } | null>(null);

  // Form Đổi Mật Khẩu
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [hienPass1, setHienPass1] = useState(false);
  const [hienPass2, setHienPass2] = useState(false);
  const [dangDoiMatKhau, setDangDoiMatKhau] = useState(false);
  const [thongBaoMatKhau, setThongBaoMatKhau] = useState<{ loai: 'ok' | 'loi'; nd: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Nạp thông tin nhân sự chi tiết
  useEffect(() => {
    let cancel = false;

    async function load() {
      if (!nguoiDungHienTai?.id) return;
      try {
        setDangTai(true);
        const [ns, cnRes, pbRes] = await Promise.all([
          layChiTietNhanSu(nguoiDungHienTai.id),
          danhSachChiNhanh().catch(() => ({ mang: [] })),
          danhSachPhongBan().catch(() => ({ mang: [] }))
        ]);

        if (!cancel) {
          if (ns) {
            setHoSoChiTiet(ns);
            setAvatarPreview(ns.url_anh_dai_dien || null);
            setSoDienThoai(ns.so_dien_thoai || '');
          } else {
            setAvatarPreview(nguoiDungHienTai.url_anh_dai_dien || null);
          }
          setDsChiNhanh(cnRes.mang || []);
          setDsPhongBan(pbRes.mang || []);
        }
      } catch (err) {
        console.error('Lỗi nạp hồ sơ nhân sự:', err);
      } finally {
        if (!cancel) setDangTai(false);
      }
    }

    void load();
    return () => {
      cancel = true;
    };
  }, [nguoiDungHienTai]);

  // Xử lý chọn ảnh từ thiết bị
  const khiChonFileAnh = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setThongBaoHoSo({ loai: 'loi', nd: 'Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WebP).' });
      return;
    }

    try {
      const dataUrl = await nenAnhDaiDien(file);
      setAvatarPreview(dataUrl);
      setThongBaoHoSo(null);
    } catch {
      setThongBaoHoSo({ loai: 'loi', nd: 'Không thể xử lý hình ảnh này. Hãy thử ảnh khác.' });
    }
  };

  // Xử lý lưu Avatar & Số điện thoại
  const khiLuuThongTinCaNhan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiDungHienTai) return;

    try {
      setDangLuuHoSo(true);
      setThongBaoHoSo(null);

      const urlCuoi = linkAvatarNgoai.trim() ? linkAvatarNgoai.trim() : avatarPreview;

      await capNhatNhanSu(
        nguoiDungHienTai.id,
        {
          url_anh_dai_dien: urlCuoi,
          so_dien_thoai: soDienThoai.trim() || null
        },
        nguoiDungHienTai
      );

      // Cập nhật state toàn cục để Sidebar & Topbar đổi ngay
      datNguoiDungHienTai({
        ...nguoiDungHienTai,
        url_anh_dai_dien: urlCuoi
      });

      if (hoSoChiTiet) {
        setHoSoChiTiet({
          ...hoSoChiTiet,
          url_anh_dai_dien: urlCuoi,
          so_dien_thoai: soDienThoai.trim() || null
        });
      }

      setThongBaoHoSo({
        loai: 'ok',
        nd: 'Cập nhật ảnh đại diện và thông tin cá nhân thành công!'
      });
      setLinkAvatarNgoai('');
      setHienNhapLink(false);
    } catch (err: any) {
      setThongBaoHoSo({
        loai: 'loi',
        nd: err?.message || 'Có lỗi xảy ra khi lưu thông tin.'
      });
    } finally {
      setDangLuuHoSo(false);
    }
  };

  // Xử lý đổi mật khẩu
  const khiDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiDungHienTai) return;

    if (!matKhauMoi || matKhauMoi.length < 6) {
      setThongBaoMatKhau({ loai: 'loi', nd: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      setThongBaoMatKhau({ loai: 'loi', nd: 'Xác nhận mật khẩu mới không trùng khớp.' });
      return;
    }

    try {
      setDangDoiMatKhau(true);
      setThongBaoMatKhau(null);

      await doiMatKhauNhanSu(nguoiDungHienTai.id, matKhauMoi, {
        id: nguoiDungHienTai.id,
        vai_tro: String(nguoiDungHienTai.vai_tro || '')
      });

      setThongBaoMatKhau({
        loai: 'ok',
        nd: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới cho lần đăng nhập tiếp theo.'
      });
      setMatKhauMoi('');
      setXacNhanMatKhau('');
    } catch (err: any) {
      setThongBaoMatKhau({
        loai: 'loi',
        nd: err?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.'
      });
    } finally {
      setDangDoiMatKhau(false);
    }
  };

  const tenChiNhanh =
    dsChiNhanh.find((cnItem) => cnItem.id === hoSoChiTiet?.chi_nhanh_id)?.ten_chi_nhanh ||
    'Chưa phân công';
  const tenPhongBan =
    dsPhongBan.find((pbItem) => pbItem.id === hoSoChiTiet?.phong_ban_id)?.ten_phong_ban ||
    'Chưa phân công';
  const tenVaiTro = hienThiTenVaiTro(nguoiDungHienTai?.vai_tro);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-7 pb-12">
      {/* 1. PROFILE HEADER CARD (APPLE STYLE) */}
      <div className="relative overflow-hidden rounded-[26px] border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/40 to-slate-50 p-5 sm:p-7 shadow-[0_2px_16px_rgba(15,23,42,0.03)]">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar to có viền sáng */}
          <div className="relative group">
            <DaiDien
              ten={nguoiDungHienTai?.ho_va_ten}
              anh={avatarPreview}
              kich_thuoc="xl"
              className="size-20 sm:size-24 rounded-3xl ring-4 ring-white shadow-md shadow-slate-200/70"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 size-7.5 rounded-full bg-[#007AFF] hover:bg-[#0055D4] text-white flex items-center justify-center shadow-sm transition active:scale-95"
              title="Đổi ảnh đại diện"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {nguoiDungHienTai?.ho_va_ten || 'Tài khoản cá nhân'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20">
                <BadgeCheck className="size-3.5" /> {tenVaiTro}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hoạt động
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2">
              <Mail className="size-3.5 text-slate-400" />
              <span>{nguoiDungHienTai?.email}</span>
              {hoSoChiTiet?.ma_nhan_vien && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {hoSoChiTiet.ma_nhan_vien}
                  </span>
                </>
              )}
            </p>

            <p className="text-xs text-slate-400">
              Quản lý thông tin cá nhân, ảnh chân dung và bảo mật tài khoản hệ thống TiniPMS.
            </p>
          </div>
        </div>
      </div>

      {/* 2. NỘI DUNG 2 CỘT: CỘT 1 (AVATAR & THÔNG TIN), CỘT 2 (ĐỔI MẬT KHẨU) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* CỘT 1: HỒ SƠ & ẢNH ĐẠI DIỆN */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card Đổi Avatar & Số điện thoại */}
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Camera className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Ảnh đại diện & Thông tin liên hệ
                </h2>
                <p className="text-[11px] text-slate-400">
                  Tải lên ảnh chân dung của bạn để hiển thị trên toàn hệ thống
                </p>
              </div>
            </div>

            {/* Thông báo cập nhật hồ sơ */}
            {thongBaoHoSo && (
              <div
                className={cn(
                  'p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border',
                  thongBaoHoSo.loai === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                )}
              >
                {thongBaoHoSo.loai === 'ok' ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{thongBaoHoSo.nd}</span>
              </div>
            )}

            <form onSubmit={khiLuuThongTinCaNhan} className="space-y-4">
              {/* Khu vực chọn ảnh đại diện */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Ảnh đại diện (Avatar)
                </label>

                <div className="flex items-center gap-4">
                  <DaiDien
                    ten={nguoiDungHienTai?.ho_va_ten}
                    anh={avatarPreview}
                    kich_thuoc="lg"
                    className="size-16 rounded-2xl ring-2 ring-white shadow-xs shrink-0"
                  />

                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Nút ẩn kích hoạt chọn file */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={khiChonFileAnh}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Camera className="size-3.5 text-[#007AFF]" />
                        <span>Chọn ảnh từ máy / điện thoại</span>
                      </button>

                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview(null);
                            setLinkAvatarNgoai('');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/60 transition"
                          title="Gỡ ảnh về avatar mặc định"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setHienNhapLink(!hienNhapLink)}
                      className="text-[11px] text-[#007AFF] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <LinkIcon className="size-3" />
                      <span>{hienNhapLink ? 'Đóng ô nhập URL' : 'Hoặc dán link ảnh từ web'}</span>
                    </button>
                  </div>
                </div>

                {hienNhapLink && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <input
                      type="url"
                      placeholder="Dán link ảnh (https://...)"
                      value={linkAvatarNgoai}
                      onChange={(e) => {
                        setLinkAvatarNgoai(e.target.value);
                        if (e.target.value.trim()) {
                          setAvatarPreview(e.target.value.trim());
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                    />
                  </div>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/50 border border-slate-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={dangLuuHoSo}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0055D4] text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/25 transition active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {dangLuuHoSo ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu ảnh & thông tin</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card Thông Tin Hệ Thống (Read-only) */}
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Lock className="size-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Thông tin phân nhiệm hệ thống
                </h3>
              </div>
              <span className="text-[10.5px] font-medium text-slate-400 italic">
                Chỉ Quản trị viên được chỉnh sửa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Họ và tên</span>
                <span className="font-bold text-slate-800 block truncate">
                  {nguoiDungHienTai?.ho_va_ten || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Email đăng nhập</span>
                <span className="font-bold text-slate-800 block truncate">
                  {nguoiDungHienTai?.email}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Vai trò</span>
                <span className="font-bold text-[#007AFF] block truncate">
                  {tenVaiTro}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Chức vụ</span>
                <span className="font-bold text-slate-800 block truncate">
                  {hoSoChiTiet?.chuc_vu || 'Nhân viên'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Chi nhánh</span>
                <span className="font-bold text-slate-800 block truncate">{tenChiNhanh}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10.5px] text-slate-400 font-medium block">Phòng ban</span>
                <span className="font-bold text-slate-800 block truncate">{tenPhongBan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 2: ĐỔI MẬT KHẨU BẢO MẬT */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-[24px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <KeyRound className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Đổi mật khẩu cá nhân
                </h2>
                <p className="text-[11px] text-slate-400">
                  Thay đổi mật khẩu đăng nhập để bảo vệ an toàn cho tài khoản
                </p>
              </div>
            </div>

            {/* Thông báo đổi mật khẩu */}
            {thongBaoMatKhau && (
              <div
                className={cn(
                  'p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 border',
                  thongBaoMatKhau.loai === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                )}
              >
                {thongBaoMatKhau.loai === 'ok' ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{thongBaoMatKhau.nd}</span>
              </div>
            )}

            <form onSubmit={khiDoiMatKhau} className="space-y-4">
              {/* Mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={hienPass1 ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={matKhauMoi}
                    onChange={(e) => setMatKhauMoi(e.target.value)}
                    className="w-full px-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/50 border border-slate-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setHienPass1(!hienPass1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {hienPass1 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={hienPass2 ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={xacNhanMatKhau}
                    onChange={(e) => setXacNhanMatKhau(e.target.value)}
                    className="w-full px-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/50 border border-slate-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setHienPass2(!hienPass2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {hienPass2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Điều kiện mật khẩu */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                <div
                  className={cn(
                    'flex items-center gap-1.5 font-medium',
                    matKhauMoi.length >= 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  Độ dài tối thiểu từ 6 ký tự trở lên
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1.5 font-medium',
                    matKhauMoi && xacNhanMatKhau && matKhauMoi === xacNhanMatKhau
                      ? 'text-emerald-600 font-bold'
                      : 'text-slate-400'
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  Mật khẩu xác nhận trùng khớp
                </div>
              </div>

              <button
                type="submit"
                disabled={dangDoiMatKhau || !matKhauMoi || matKhauMoi !== xacNhanMatKhau}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {dangDoiMatKhau ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <span>Đổi mật khẩu</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
