'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Save, UserPlus, UserRound, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../thu_vien/utils/cn';
import { DANH_SACH_QUYEN_HAN_HE_THONG } from '../../thu_vien/types/nhan_su';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type {
  CapNhatNhanSuDTO,
  TaoMoiNhanSuDTO
} from '../../dich_vu/nhan_su/dich_vu_nhan_su';

const SchemaTaoMoi = z.object({
  ma_nhan_vien: z.string().trim().max(50, 'Mã nhân viên tối đa 50 ký tự').nullable().optional(),
  ho_va_ten: z.string({ required_error: 'Họ và tên bắt buộc' })
    .trim()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),
  so_dien_thoai: z.string().trim()
    .max(20, 'Số điện thoại tối đa 20 ký tự')
    .nullable()
    .optional()
    .or(z.literal('')),
  email: z.string({ required_error: 'Email bắt buộc' })
    .trim()
    .email('Email không hợp lệ')
    .max(150, 'Email tối đa 150 ký tự'),
  mat_khau: z
    .string()
    .trim()
    .max(50, 'Mật khẩu tối đa 50 ký tự')
    .optional()
    .nullable()
    .refine((val) => !val || val.length >= 6, {
      message: 'Mật khẩu tối thiểu 6 ký tự'
    }),
  chi_nhanh_id: z.string().nullable().optional(),
  phong_ban_id: z.string().nullable().optional(),
  chuc_vu: z.string().trim().max(100, 'Chức vụ tối đa 100 ký tự').nullable().optional().or(z.literal('')),
  vai_tro: z.string().min(1, 'Vai trò bắt buộc'),
  url_anh_dai_dien: z.string().trim().max(500, 'URL ảnh đại diện quá dài').nullable().optional().or(z.literal('')),
  trang_thai: z.boolean().optional()
});

const SchemaCapNhat = SchemaTaoMoi.omit({ mat_khau: true });

type KieuDuLieuTao = z.infer<typeof SchemaTaoMoi>;
type KieuDuLieuCapNhat = z.infer<typeof SchemaCapNhat>;

interface FormNhanSuDrawerProps {
  mo: boolean;
  onDong: () => void;
  dangSua: NhanSu | null;
  danhSachChiNhanh?: { id: string; ten_chi_nhanh: string }[];
  danhSachPhongBan?: { id: string; ten_phong_ban: string; chi_nhanh_id?: string | null }[];
  danhSachVaiTro?: { id: string; ten_vai_tro: string; ma_vai_tro?: string | null }[];
  danhSachChucVu?: { id: string; ten_chuc_vu: string; ma_chuc_vu?: string | null }[];
  onLuu: (
    data: TaoMoiNhanSuDTO | CapNhatNhanSuDTO,
    banGhi?: NhanSu
  ) => Promise<void>;
  dangXuLy: boolean;
  loi?: string | null;
}

const GIA_TRI_MAC_DINH_TAO: KieuDuLieuTao = {
  ma_nhan_vien: null,
  ho_va_ten: '',
  so_dien_thoai: null,
  email: '',
  mat_khau: null,
  chi_nhanh_id: null,
  phong_ban_id: null,
  chuc_vu: null,
  vai_tro: '',
  url_anh_dai_dien: null,
  trang_thai: true
};

export default function FormNhanSuDrawer(props: FormNhanSuDrawerProps) {
  const {
    mo,
    onDong,
    dangSua,
    danhSachChiNhanh = [],
    danhSachPhongBan = [],
    danhSachVaiTro = [],
    danhSachChucVu = [],
    onLuu,
    dangXuLy,
    loi
  } = props;

  const taoMoi = !dangSua;

  const [phongBanPhuTrachThem, setPhongBanPhuTrachThem] = useState<string[]>([]);
  const [quyenCapThem, setQuyenCapThem] = useState<string[]>([]);
  const [quyenChan, setQuyenChan] = useState<string[]>([]);
  const [moNgoaiLe, setMoNgoaiLe] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<KieuDuLieuTao>({
    resolver: zodResolver(taoMoi ? SchemaTaoMoi : (SchemaCapNhat as any)),
    defaultValues: GIA_TRI_MAC_DINH_TAO,
    mode: 'onTouched'
  });

  const chiNhanhDangChon = watch('chi_nhanh_id');
  const phongBanDangChon = watch('phong_ban_id');
  const vaiTroDangChon = watch('vai_tro');
  const chucVuDangChon = watch('chuc_vu');

  const dsPhongBanFiltered = useMemo(
    () => !chiNhanhDangChon
      ? danhSachPhongBan
      : danhSachPhongBan.filter(pb => pb.chi_nhanh_id === chiNhanhDangChon),
    [chiNhanhDangChon, danhSachPhongBan]
  );

  useEffect(() => {
    if (!chiNhanhDangChon || !phongBanDangChon) return;
    const vanHopLe = dsPhongBanFiltered.some(pb => pb.id === phongBanDangChon);
    if (!vanHopLe) {
      setValue('phong_ban_id', null, { shouldValidate: false });
    }
  }, [chiNhanhDangChon, phongBanDangChon, dsPhongBanFiltered, setValue]);

  useEffect(() => {
    if (!mo) return;
    if (dangSua) {
      setPhongBanPhuTrachThem(dangSua.phong_ban_phu_trach_them || []);
      setQuyenCapThem(dangSua.quyen_ngoai_le_cap_them || []);
      setQuyenChan(dangSua.quyen_ngoai_le_chan || []);
      reset({
        ma_nhan_vien: dangSua.ma_nhan_vien,
        ho_va_ten: dangSua.ho_va_ten,
        so_dien_thoai: dangSua.so_dien_thoai,
        email: dangSua.email,
        mat_khau: undefined,
        chi_nhanh_id: dangSua.chi_nhanh_id,
        phong_ban_id: dangSua.phong_ban_id,
        chuc_vu: dangSua.chuc_vu,
        vai_tro: String(dangSua.vai_tro ?? ''),
        url_anh_dai_dien: dangSua.url_anh_dai_dien,
        trang_thai: dangSua.trang_thai
      });
    } else {
      setPhongBanPhuTrachThem([]);
      setQuyenCapThem([]);
      setQuyenChan([]);
      reset({
        ...GIA_TRI_MAC_DINH_TAO,
        vai_tro: danhSachVaiTro[0]?.id ?? ''
      });
    }
  }, [mo, dangSua, reset, danhSachVaiTro]);

  const xuLyLuu = handleSubmit(async (data) => {
    if (dangSua) {
      const dto: CapNhatNhanSuDTO = {
        ma_nhan_vien: data.ma_nhan_vien ?? undefined,
        ho_va_ten: data.ho_va_ten,
        so_dien_thoai: (data.so_dien_thoai as string | undefined) ?? null,
        email: data.email,
        chi_nhanh_id: data.chi_nhanh_id ?? null,
        phong_ban_id: data.phong_ban_id ?? null,
        phong_ban_phu_trach_them: phongBanPhuTrachThem,
        chuc_vu: (data.chuc_vu as string | undefined) ?? null,
        vai_tro: data.vai_tro,
        quyen_ngoai_le_cap_them: quyenCapThem,
        quyen_ngoai_le_chan: quyenChan,
        url_anh_dai_dien: (data.url_anh_dai_dien as string | undefined) ?? null,
        trang_thai: data.trang_thai
      };
      await onLuu(dto, dangSua);
    } else {
      const dto: TaoMoiNhanSuDTO = {
        ma_nhan_vien: data.ma_nhan_vien ?? null,
        ho_va_ten: data.ho_va_ten,
        so_dien_thoai: (data.so_dien_thoai as string | undefined) ?? null,
        email: data.email,
        mat_khau: (data.mat_khau as string | undefined) ?? null,
        chi_nhanh_id: data.chi_nhanh_id ?? null,
        phong_ban_id: data.phong_ban_id ?? null,
        phong_ban_phu_trach_them: phongBanPhuTrachThem,
        chuc_vu: (data.chuc_vu as string | undefined) ?? null,
        vai_tro: data.vai_tro,
        quyen_ngoai_le_cap_them: quyenCapThem,
        quyen_ngoai_le_chan: quyenChan,
        url_anh_dai_dien: (data.url_anh_dai_dien as string | undefined) ?? null,
        trang_thai: data.trang_thai
      };
      await onLuu(dto);
    }
  });

  if (!mo) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 opacity-100"
        onClick={onDong}
      />
      <div
        className="relative z-10 w-full sm:max-w-[720px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 translate-x-0"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              {taoMoi ? <UserPlus className="size-5" /> : <UserRound className="size-5" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {taoMoi ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="size-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          id="form-nhan-su-drawer"
          onSubmit={xuLyLuu}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={dangXuLy}
                  {...register('ho_va_ten')}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.ho_va_ten && (
                  <p className="mt-1 text-xs text-red-600">{errors.ho_va_ten.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  disabled={dangXuLy}
                  {...register('ma_nhan_vien')}
                  placeholder="Tự động tạo nếu để trống"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:text-slate-500"
                />
                {errors.ma_nhan_vien && (
                  <p className="mt-1 text-xs text-red-600">{errors.ma_nhan_vien.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  disabled={dangXuLy}
                  {...register('email')}
                  placeholder="email@congty.com"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input
                  type="tel"
                  disabled={dangXuLy}
                  {...register('so_dien_thoai')}
                  placeholder="09xx xxx xxx"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.so_dien_thoai && (
                  <p className="mt-1 text-xs text-red-600">{errors.so_dien_thoai.message}</p>
                )}
              </div>
            </div>

            {taoMoi && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu tạo lần đầu
                </label>
                <input
                  type="text"
                  disabled={dangXuLy}
                  {...register('mat_khau')}
                  placeholder="Tự tạo mặc định nếu để trống"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500 font-mono tracking-wide"
                />
                {errors.mat_khau && (
                  <p className="mt-1 text-xs text-red-600">{errors.mat_khau.message}</p>
                )}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={dangXuLy || (danhSachVaiTro.length === 0 && !dangSua?.vai_tro)}
                  value={vaiTroDangChon}
                  {...register('vai_tro')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {danhSachVaiTro.length === 0 && !dangSua?.vai_tro && (
                    <option value="">Chưa có vai trò — Quản trị → Vai trò để tạo</option>
                  )}
                  {dangSua?.vai_tro && !danhSachVaiTro.some((v) => v.id === dangSua.vai_tro || v.ma_vai_tro === dangSua.vai_tro) && (
                    <option value={dangSua.vai_tro}>{dangSua.vai_tro}</option>
                  )}
                  {danhSachVaiTro.map((v) => (
                    <option key={v.id} value={v.id}>{v.ten_vai_tro}{v.ma_vai_tro ? ` (${v.ma_vai_tro})` : ''}</option>
                  ))}
                </select>
                {errors.vai_tro && (
                  <p className="mt-1 text-xs text-red-600">{errors.vai_tro.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Chi nhánh</label>
                <select
                  disabled={dangXuLy}
                  {...register('chi_nhanh_id')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">(Chưa có chi nhánh)</option>
                  {danhSachChiNhanh.map((cn) => (
                    <option key={cn.id} value={cn.id}>{cn.ten_chi_nhanh}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng ban</label>
                <select
                  disabled={dangXuLy}
                  {...register('phong_ban_id')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">(Chưa có phòng ban)</option>
                  {dsPhongBanFiltered.map((pb) => (
                    <option key={pb.id} value={pb.id}>{pb.ten_phong_ban}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phụ trách kiêm nhiệm / Phụ trách chéo */}
            {danhSachPhongBan.length > 1 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Phòng ban phụ trách bổ sung (Kiêm nhiệm / Phụ trách chéo)
                  </label>
                  {phongBanPhuTrachThem.length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      Đang phụ trách {phongBanPhuTrachThem.length} phòng
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cho phép nhân sự này (Trưởng phòng/Quản lý) xem & theo dõi báo cáo, công việc của các phòng ban khác được giao.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {danhSachPhongBan
                    .filter((pb) => pb.id !== phongBanDangChon)
                    .map((pb) => {
                      const daChon = phongBanPhuTrachThem.includes(pb.id);
                      return (
                        <button
                          key={pb.id}
                          type="button"
                          onClick={() => {
                            setPhongBanPhuTrachThem((prev) =>
                              daChon ? prev.filter((id) => id !== pb.id) : [...prev, pb.id]
                            );
                          }}
                          className={cn(
                            'px-2.5 py-1 text-xs rounded-lg border font-medium transition flex items-center gap-1.5 cursor-pointer',
                            daChon
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          {daChon && <Check className="size-3" />}
                          <span>{pb.ten_phong_ban}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chức vụ</label>
              <select
                disabled={dangXuLy}
                value={chucVuDangChon ?? ''}
                {...register('chuc_vu')}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="">(Chưa chọn chức vụ)</option>
                {dangSua?.chuc_vu && !danhSachChucVu.some((cv) => cv.ten_chuc_vu === dangSua.chuc_vu || cv.id === dangSua.chuc_vu) && (
                  <option value={dangSua.chuc_vu}>{dangSua.chuc_vu}</option>
                )}
                {danhSachChucVu.map((cv) => (
                  <option key={cv.id} value={cv.ten_chuc_vu}>
                    {cv.ten_chuc_vu}{cv.ma_chuc_vu ? ` (${cv.ma_chuc_vu})` : ''}
                  </option>
                ))}
              </select>
              {errors.chuc_vu && (
                <p className="mt-1 text-xs text-red-600">{errors.chuc_vu.message}</p>
              )}
            </div>

            {/* Cấu hình ngoại lệ cá nhân */}
            <div className="rounded-xl border border-amber-300/80 bg-amber-50/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setMoNgoaiLe((v) => !v)}
                className="w-full flex items-center justify-between p-4 text-left transition hover:bg-amber-50/80 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Cấu hình Ngoại lệ Cá nhân (User Exceptions)</span>
                      {(quyenCapThem.length > 0 || quyenChan.length > 0) && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                          {quyenCapThem.length > 0 && `+${quyenCapThem.length} cấp`}
                          {quyenCapThem.length > 0 && quyenChan.length > 0 && ' | '}
                          {quyenChan.length > 0 && `-${quyenChan.length} chặn`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Cấp thêm quyền (+) hoặc chặn quyền (-) riêng cho nhân sự này mà không cần đổi vai trò
                    </div>
                  </div>
                </div>
                {moNgoaiLe ? (
                  <ChevronUp className="size-5 text-slate-400" />
                ) : (
                  <ChevronDown className="size-5 text-slate-400" />
                )}
              </button>

              {moNgoaiLe && (
                <div className="p-4 pt-0 border-t border-amber-200/60 bg-white space-y-4">
                  <div className="text-xs text-slate-500 py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Quy tắc ưu tiên:</span> Quyền ngoại lệ cá nhân sẽ ghi đè quyền của vai trò mặc định. Tích chọn <span className="text-emerald-600 font-semibold">[+ Cấp thêm]</span> để cấp riêng quyền, hoặc <span className="text-rose-600 font-semibold">[- Chặn]</span> để tước quyền.
                  </div>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                    {Object.entries({
                      bao_cao: '📝 Báo cáo ngày',
                      du_an: '📁 Phân hệ Dự án',
                      ke_hoach: '🎯 Kế hoạch tác chiến',
                      nhan_su: '👥 Quản lý Nhân sự',
                      he_thong: '⚙️ Quản trị Hệ thống'
                    }).map(([nhomKey, nhomTen]) => {
                      const dsQuyenTheoNhom = DANH_SACH_QUYEN_HAN_HE_THONG.filter((q) => q.nhom === nhomKey);
                      if (dsQuyenTheoNhom.length === 0) return null;
                      return (
                        <div key={nhomKey} className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">{nhomTen}</div>
                          <div className="space-y-1">
                            {dsQuyenTheoNhom.map((q) => {
                              const duocCapThem = quyenCapThem.includes(q.ma_quyen);
                              const biChan = quyenChan.includes(q.ma_quyen);

                              return (
                                <div
                                  key={q.ma_quyen}
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition text-xs border border-slate-200/60"
                                >
                                  <span className="font-medium text-slate-800">{q.ten_quyen}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (duocCapThem) {
                                          setQuyenCapThem((prev) => prev.filter((k) => k !== q.ma_quyen));
                                        } else {
                                          setQuyenCapThem((prev) => [...prev, q.ma_quyen]);
                                          setQuyenChan((prev) => prev.filter((k) => k !== q.ma_quyen));
                                        }
                                      }}
                                      className={cn(
                                        'px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 cursor-pointer',
                                        duocCapThem
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                                      )}
                                    >
                                      + Cấp thêm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (biChan) {
                                          setQuyenChan((prev) => prev.filter((k) => k !== q.ma_quyen));
                                        } else {
                                          setQuyenChan((prev) => [...prev, q.ma_quyen]);
                                          setQuyenCapThem((prev) => prev.filter((k) => k !== q.ma_quyen));
                                        }
                                      }}
                                      className={cn(
                                        'px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 cursor-pointer',
                                        biChan
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'
                                      )}
                                    >
                                      - Chặn
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">URL ảnh đại diện</label>
              <input
                type="url"
                disabled={dangXuLy}
                {...register('url_anh_dai_dien')}
                placeholder="https://… (để trống nếu chưa có)"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">Trạng thái tài khoản</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {dangSua?.trang_thai ?? true
                    ? '✅ Đang hoạt động — có thể đăng nhập'
                    : '⛔ Bị khóa — không thể đăng nhập'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  disabled={dangXuLy}
                  defaultChecked={dangSua?.trang_thai ?? true}
                  {...register('trang_thai')}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {loi && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loi}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/60">
            <button
              type="button"
              onClick={onDong}
              disabled={dangXuLy}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="form-nhan-su-drawer"
              disabled={dangXuLy}
              className={
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 '
                + (taoMoi
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-amber-600 hover:bg-amber-700')
              }
            >
              {dangXuLy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {taoMoi ? 'Tạo tài khoản + Firestore' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
