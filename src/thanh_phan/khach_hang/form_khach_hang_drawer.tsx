'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Save, UserPlus, Edit3, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import {
  kiemTraTrungKhachHang,
  type CapNhatKhachHangDTO,
  type TaoMoiKhachHangDTO
} from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import type { KhachHang, LoaiKhachHang } from '../../thu_vien/types/khach_hang';
import type { ChiNhanh, NhanSu } from '../../thu_vien/types/nhan_su';

const SCHEMA_KHACH_HANG = z.object({
  ten_khach_hang: z
    .string({ required_error: 'Vui lòng nhập tên khách hàng' })
    .trim()
    .min(2, 'Tên khách hàng ít nhất 2 ký tự')
    .max(200, 'Tên khách hàng dài nhất 200 ký tự'),
  loai_khach_hang: z.enum(['doanh_nghiep', 'ca_nhan', 'to_chuc', 'khac'], {
    required_error: 'Chọn loại khách hàng'
  }),
  ma_so_thue: z.string().max(30, 'MST quá dài (tối đa 30)').trim().nullable().optional(),
  so_dien_thoai: z.string().max(20, 'SĐT quá dài (tối đa 20)').trim().nullable().optional(),
  email: z
    .string()
    .max(150, 'Email quá dài (tối đa 150)')
    .email('Không đúng định dạng email')
    .trim()
    .nullable()
    .optional()
    .or(z.literal('')),
  dia_chi: z.string().max(300, 'Địa chỉ quá dài (tối đa 300)').trim().nullable().optional(),
  website: z.string().max(200, 'Website quá dài (tối đa 200)').trim().nullable().optional(),
  chi_nhanh_id: z.string().trim().nullable().optional(),
  nguoi_phu_trach_id: z.string().trim().nullable().optional(),
  ghi_chu: z.string().max(1000, 'Ghi chú quá dài (tối đa 1000 ký tự)').trim().nullable().optional(),
  trang_thai: z.enum(['hoat_dong', 'tam_dung', 'da_xoa']).optional()
});

type GiaTriForm = z.infer<typeof SCHEMA_KHACH_HANG>;

const GIA_TRI_MAC_DINH: GiaTriForm = {
  ten_khach_hang: '',
  loai_khach_hang: 'doanh_nghiep',
  ma_so_thue: null,
  so_dien_thoai: null,
  email: null,
  dia_chi: null,
  website: null,
  chi_nhanh_id: null,
  nguoi_phu_trach_id: null,
  ghi_chu: null,
  trang_thai: 'hoat_dong'
};

interface FormKhachHangDrawerProps {
  mo: boolean;
  khi_dong: () => void;
  dang_sua: KhachHang | null; // null = them moi, != null = sua
  khi_luu: (dto: TaoMoiKhachHangDTO | CapNhatKhachHangDTO) => Promise<void> | void;
  dang_xu_ly?: boolean;
  loi_thong_bao?: string | null;
  dsChiNhanh?: ChiNhanh[];
  dsNhanSu?: NhanSu[];
}

export default function FormKhachHangDrawer({
  mo,
  khi_dong,
  dang_sua,
  khi_luu,
  dang_xu_ly = false,
  loi_thong_bao = null,
  dsChiNhanh = [],
  dsNhanSu = []
}: FormKhachHangDrawerProps) {
  const [canhBaoTrung, setCanhBaoTrung] = useState<{ mst?: string; sdt?: string }>({});

  const form = useForm<GiaTriForm>({
    resolver: zodResolver(SCHEMA_KHACH_HANG),
    defaultValues: GIA_TRI_MAC_DINH,
    mode: 'onTouched'
  });

  const xuLyKiemTraMst = async (mst: string) => {
    if (!mst || !mst.trim()) {
      setCanhBaoTrung((c) => ({ ...c, mst: undefined }));
      return;
    }
    try {
      const res = await kiemTraTrungKhachHang({ ma_so_thue: mst.trim(), id_bo_qua: dang_sua?.id });
      if (res?.trung_mst) {
        setCanhBaoTrung((c) => ({
          ...c,
          mst: `Đã thuộc khách hàng "${res.trung_mst?.ten_khach_hang}"`
        }));
      } else {
        setCanhBaoTrung((c) => ({ ...c, mst: undefined }));
      }
    } catch {}
  };

  const xuLyKiemTraSdt = async (sdt: string) => {
    if (!sdt || !sdt.trim()) {
      setCanhBaoTrung((c) => ({ ...c, sdt: undefined }));
      return;
    }
    try {
      const res = await kiemTraTrungKhachHang({ so_dien_thoai: sdt.trim(), id_bo_qua: dang_sua?.id });
      if (res?.trung_sdt) {
        setCanhBaoTrung((c) => ({
          ...c,
          sdt: `Đã thuộc khách hàng "${res.trung_sdt?.ten_khach_hang}"`
        }));
      } else {
        setCanhBaoTrung((c) => ({ ...c, sdt: undefined }));
      }
    } catch {}
  };

  useEffect(() => {
    if (!mo) return;
    setCanhBaoTrung({});
    if (dang_sua) {
      form.reset({
        ten_khach_hang: dang_sua.ten_khach_hang,
        loai_khach_hang: (dang_sua.loai_khach_hang as LoaiKhachHang) ?? 'khac',
        ma_so_thue: dang_sua.ma_so_thue ?? null,
        so_dien_thoai: dang_sua.so_dien_thoai ?? null,
        email: dang_sua.email ?? null,
        dia_chi: dang_sua.dia_chi ?? null,
        website: dang_sua.website ?? null,
        chi_nhanh_id: dang_sua.chi_nhanh_id ?? null,
        nguoi_phu_trach_id: dang_sua.nguoi_phu_trach_id ?? null,
        ghi_chu: dang_sua.ghi_chu ?? null,
        trang_thai: dang_sua.trang_thai
      });
    } else {
      form.reset(GIA_TRI_MAC_DINH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mo, dang_sua?.id]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (dang_sua) {
      const patchDto: CapNhatKhachHangDTO = {
        id: dang_sua.id,
        ...values,
        email: (values.email ?? null) || null,
        ma_so_thue: (values.ma_so_thue ?? null) || null,
        so_dien_thoai: (values.so_dien_thoai ?? null) || null,
        dia_chi: (values.dia_chi ?? null) || null,
        website: (values.website ?? null) || null,
        chi_nhanh_id: (values.chi_nhanh_id ?? null) || null,
        nguoi_phu_trach_id: (values.nguoi_phu_trach_id ?? null) || null,
        ghi_chu: (values.ghi_chu ?? null) || null
      };
      await khi_luu(patchDto);
    } else {
      const taoDto: TaoMoiKhachHangDTO = {
        ...values,
        email: (values.email ?? null) || null,
        ma_so_thue: (values.ma_so_thue ?? null) || null,
        so_dien_thoai: (values.so_dien_thoai ?? null) || null,
        dia_chi: (values.dia_chi ?? null) || null,
        website: (values.website ?? null) || null,
        chi_nhanh_id: (values.chi_nhanh_id ?? null) || null,
        nguoi_phu_trach_id: (values.nguoi_phu_trach_id ?? null) || null,
        ghi_chu: (values.ghi_chu ?? null) || null
      };
      await khi_luu(taoDto);
    }
  });

  const laSua = Boolean(dang_sua);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] transition duration-200',
        mo ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!mo}
    >
      <div
        onClick={khi_dong}
        className={cn(
          'absolute inset-0 bg-slate-900/40 transition-opacity',
          mo ? 'opacity-100' : 'opacity-0'
        )}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-200',
          mo ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="flex items-center gap-3 h-16 px-5 border-b border-slate-200 shrink-0">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            {laSua ? <Edit3 className="size-5" /> : <UserPlus className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900">
              {laSua ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
            </div>
            {laSua && dang_sua ? (
              <div className="text-xs text-slate-500 truncate mt-0.5">
                ID: {dang_sua.id} · Cập nhật lần cuối: {dang_sua.ngay_cap_nhat.slice(0, 10)}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={khi_dong}
            aria-label="Dong form"
            className="size-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-5">
            {loi_thong_bao ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-3">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{loi_thong_bao}</span>
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <TruongForm label="Tên khách hàng *" loi={form.formState.errors.ten_khach_hang?.message}>
                <input
                  {...form.register('ten_khach_hang')}
                  type="text"
                  placeholder="Ví dụ: Công ty TNHH Giải Pháp Công Nghệ ABC"
                  className={cn(inputStyleCls, Boolean(form.formState.errors.ten_khach_hang) && inputLoiCls)}
                />
              </TruongForm>
              <TruongForm label="Loại khách hàng *" loi={form.formState.errors.loai_khach_hang?.message}>
                <select
                  {...form.register('loai_khach_hang')}
                  className={cn(inputStyleCls, Boolean(form.formState.errors.loai_khach_hang) && inputLoiCls)}
                >
                  <option value="doanh_nghiep">Doanh nghiệp</option>
                  <option value="ca_nhan">Cá nhân</option>
                  <option value="to_chuc">Tổ chức / Chính quyền</option>
                  <option value="khac">Loại khác</option>
                </select>
              </TruongForm>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TruongForm label="Mã số thuế (MST)" loi={form.formState.errors.ma_so_thue?.message}>
                <input
                  {...form.register('ma_so_thue')}
                  onBlur={(e) => {
                    form.register('ma_so_thue').onBlur(e);
                    void xuLyKiemTraMst(e.target.value);
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="010xxxxx"
                  className={cn(
                    inputStyleCls,
                    Boolean(form.formState.errors.ma_so_thue) && inputLoiCls,
                    canhBaoTrung.mst && '!border-amber-400 !bg-amber-50/60'
                  )}
                />
                {canhBaoTrung.mst ? (
                  <span className="block text-[11px] mt-1.5 text-amber-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                    {canhBaoTrung.mst}
                  </span>
                ) : null}
              </TruongForm>
              <TruongForm label="Số điện thoại liên hệ" loi={form.formState.errors.so_dien_thoai?.message}>
                <input
                  {...form.register('so_dien_thoai')}
                  onBlur={(e) => {
                    form.register('so_dien_thoai').onBlur(e);
                    void xuLyKiemTraSdt(e.target.value);
                  }}
                  type="tel"
                  inputMode="tel"
                  placeholder="09xx xxx xxx"
                  className={cn(
                    inputStyleCls,
                    Boolean(form.formState.errors.so_dien_thoai) && inputLoiCls,
                    canhBaoTrung.sdt && '!border-amber-400 !bg-amber-50/60'
                  )}
                />
                {canhBaoTrung.sdt ? (
                  <span className="block text-[11px] mt-1.5 text-amber-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
                    {canhBaoTrung.sdt}
                  </span>
                ) : null}
              </TruongForm>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TruongForm label="Email giao dịch" loi={form.formState.errors.email?.message}>
                <input
                  {...form.register('email')}
                  type="email"
                  placeholder="lienhe@khachhang.vn"
                  className={cn(inputStyleCls, Boolean(form.formState.errors.email) && inputLoiCls)}
                />
              </TruongForm>
              <TruongForm label="Website (nếu có)" loi={form.formState.errors.website?.message}>
                <input
                  {...form.register('website')}
                  type="url"
                  placeholder="https://khachhang.vn"
                  className={cn(inputStyleCls, Boolean(form.formState.errors.website) && inputLoiCls)}
                />
              </TruongForm>
            </div>

            <TruongForm label="Địa chỉ văn phòng" loi={form.formState.errors.dia_chi?.message}>
              <input
                {...form.register('dia_chi')}
                type="text"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố/tỉnh"
                className={cn(inputStyleCls, Boolean(form.formState.errors.dia_chi) && inputLoiCls)}
              />
            </TruongForm>

            <div className="grid gap-5 md:grid-cols-2">
              <TruongForm label="Chi nhánh quản lý">
                <select {...form.register('chi_nhanh_id')} className={inputStyleCls}>
                  <option value="">-- Chưa gắn chi nhánh --</option>
                  {dsChiNhanh.map((cn) => (
                    <option key={cn.id} value={cn.id}>
                      {cn.ten_chi_nhanh}
                    </option>
                  ))}
                </select>
              </TruongForm>
              <TruongForm label="Người phụ trách (Sales / CSKH)">
                <select {...form.register('nguoi_phu_trach_id')} className={inputStyleCls}>
                  <option value="">-- Chưa phân công --</option>
                  {dsNhanSu.map((ns) => (
                    <option key={ns.id} value={ns.id}>
                      {ns.ho_va_ten} ({ns.ma_nhan_vien})
                    </option>
                  ))}
                </select>
              </TruongForm>
            </div>

            {laSua ? (
              <TruongForm label="Trạng thái tài khoản khách">
                <select {...form.register('trang_thai')} className={inputStyleCls}>
                  <option value="hoat_dong">Hoạt động — đang hợp tác</option>
                  <option value="tam_dung">Tạm dừng — tạm ngừng</option>
                  <option value="da_xoa">Đã xóa (ẩn khỏi danh sách mặc định)</option>
                </select>
              </TruongForm>
            ) : null}

            <TruongForm label="Ghi chú nội bộ" loi={form.formState.errors.ghi_chu?.message}>
              <textarea
                {...form.register('ghi_chu')}
                rows={4}
                placeholder="Thông tin thêm về khách hàng, quy tắc liên hệ, phòng ban… (không hiển thị với khách)"
                className={cn(
                  inputStyleCls,
                  'min-h-[100px] resize-y py-2',
                  Boolean(form.formState.errors.ghi_chu) && inputLoiCls
                )}
              />
            </TruongForm>
          </div>

          <footer className="flex items-center gap-3 border-t border-slate-200 p-5 bg-slate-50 shrink-0 justify-end">
            <button
              type="button"
              onClick={khi_dong}
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dang_xu_ly || !form.formState.isDirty || form.formState.isSubmitting}
              className="inline-flex items-center justify-center gap-2.5 h-11 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              <Save className="size-[18px]" />
              {dang_xu_ly ? 'Đang lưu…' : laSua ? 'Lưu thay đổi' : 'Thêm khách hàng'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

const inputStyleCls =
  'w-full h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition';
const inputLoiCls = '!border-rose-400 !bg-rose-50 !text-rose-900 focus:!ring-rose-500/30';

const TruongForm = ({
  label,
  loi,
  children
}: {
  label: string;
  loi?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700 mb-2">{label}</span>
    {children}
    {loi ? (
      <span className="block text-[11px] mt-1.5 text-rose-600 font-medium flex items-start gap-1.5">
        <AlertCircle className="size-3.5 mt-[1px] shrink-0" />
        {loi}
      </span>
    ) : null}
  </label>
);
