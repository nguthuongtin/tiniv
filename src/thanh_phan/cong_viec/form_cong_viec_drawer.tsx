'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { X, Save, ListTodo, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Nut } from '../../thanh_phan/ui';
import type {
  CapNhatCongViecDTO,
  TaoMoiCongViecDTO
} from '../../dich_vu/cong_viec/dich_vu_cong_viec';
import type { CongViec, TrangThaiCongViec } from '../../thu_vien/types/cong_viec';

const SCHEMA_CONG_VIEC = z.object({
  du_an_id: z.string().max(60, 'ID dự án quá dài').trim().nullable().optional(),
  ten_cong_viec: z
    .string({ required_error: 'Vui lòng nhập tên công việc' })
    .trim()
    .min(2, 'Tên công việc ít nhất 2 ký tự')
    .max(250, 'Tên công việc dài nhất 250 ký tự'),
  mo_ta: z.string().max(2000, 'Mô tả quá dài (tối đa 2000 ký tự)').trim().nullable().optional(),
  nguoi_thuc_hien_id: z.string().max(60, 'ID người thực hiện quá dài').trim().nullable().optional(),
  thoi_han_hoan_thanh: z.string().max(30, 'Thời hạn không hợp lệ').nullable().optional(),
  trang_thai: z.enum(['chua_thuc_hien', 'dang_thuc_hien', 'hoan_thanh', 'tam_dung'], {
    required_error: 'Chọn trạng thái công việc'
  }),
  ghi_chu: z.string().max(1000, 'Ghi chú quá dài (tối đa 1000 ký tự)').trim().nullable().optional(),
  trang_thai_du_lieu: z.enum(['hoat_dong', 'da_xoa']).optional()
});

type GiaTriForm = z.infer<typeof SCHEMA_CONG_VIEC>;

const GIA_TRI_MAC_DINH: GiaTriForm = {
  du_an_id: null,
  ten_cong_viec: '',
  mo_ta: null,
  nguoi_thuc_hien_id: null,
  thoi_han_hoan_thanh: null,
  trang_thai: 'chua_thuc_hien',
  ghi_chu: null,
  trang_thai_du_lieu: 'hoat_dong'
};

const TEN_TRANG_THAI: Record<TrangThaiCongViec, string> = {
  chua_thuc_hien: 'Chưa thực hiện',
  dang_thuc_hien: 'Đang thực hiện',
  hoan_thanh: 'Hoàn thành',
  tam_dung: 'Tạm dừng'
};

interface FormCongViecDrawerProps {
  mo: boolean;
  khi_dong: () => void;
  dang_sua: CongViec | null;
  khi_luu: (dto: TaoMoiCongViecDTO | CapNhatCongViecDTO) => Promise<void> | void;
  dang_xu_ly?: boolean;
  loi_thong_bao?: string | null;
  dsDuAn?: Array<{ id: string; ten_du_an: string; ma_ho_so?: string | null }>;
  dsNhanSu?: Array<{ id: string; ho_va_ten: string; ma_nhan_vien?: string | null; chuc_vu?: string | null }>;
}

export default function FormCongViecDrawer({
  mo,
  khi_dong,
  dang_sua,
  khi_luu,
  dang_xu_ly = false,
  loi_thong_bao = null,
  dsDuAn = [],
  dsNhanSu = []
}: FormCongViecDrawerProps) {
  const form = useForm<GiaTriForm>({
    resolver: zodResolver(SCHEMA_CONG_VIEC),
    defaultValues: GIA_TRI_MAC_DINH,
    mode: 'onTouched'
  });

  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      form.reset({
        du_an_id: dang_sua.du_an_id || null,
        ten_cong_viec: dang_sua.ten_cong_viec,
        mo_ta: dang_sua.mo_ta ?? null,
        nguoi_thuc_hien_id: dang_sua.nguoi_thuc_hien_id ?? null,
        thoi_han_hoan_thanh: dang_sua.thoi_han_hoan_thanh ?? null,
        trang_thai: (dang_sua.trang_thai as TrangThaiCongViec) ?? 'chua_thuc_hien',
        ghi_chu: dang_sua.ghi_chu ?? null,
        trang_thai_du_lieu: dang_sua.trang_thai_du_lieu
      });
    } else {
      form.reset(GIA_TRI_MAC_DINH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mo, dang_sua?.id]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const duLieuChuan = {
      ...values,
      du_an_id: values.du_an_id?.trim() || null,
      mo_ta: values.mo_ta?.trim() || null,
      nguoi_thuc_hien_id: values.nguoi_thuc_hien_id?.trim() || null,
      ghi_chu: values.ghi_chu?.trim() || null,
      thoi_han_hoan_thanh: values.thoi_han_hoan_thanh || null
    };
    if (dang_sua) {
      await khi_luu({ id: dang_sua.id, ...duLieuChuan } as CapNhatCongViecDTO);
    } else {
      await khi_luu(duLieuChuan as TaoMoiCongViecDTO);
    }
  });

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-end transition-opacity duration-200',
        mo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!mo}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={dang_xu_ly ? undefined : khi_dong}
      />
      <div
        className={cn(
          'relative w-full max-w-xl bg-card shadow-2xl h-full overflow-y-auto transition-transform duration-300 ease-out',
          'border-l border-border',
          mo ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-10 rounded-xl flex items-center justify-center',
                dang_sua
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              )}
            >
              {dang_sua ? <Edit3 className="size-5" /> : <ListTodo className="size-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {dang_sua ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={khi_dong}
            disabled={dang_xu_ly}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Dong"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loi_thong_bao && (
            <div className="rounded-[var(--radius-input)] border border-destructive/20 bg-destructive/10 p-3 flex items-start gap-2.5">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs text-destructive font-medium leading-relaxed">{loi_thong_bao}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Tên công việc <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên công việc..."
                className={cn(
                  'w-full rounded-[var(--radius-input)] border px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  form.formState.errors.ten_cong_viec
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-primary'
                )}
                {...form.register('ten_cong_viec')}
              />
              {form.formState.errors.ten_cong_viec && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  {form.formState.errors.ten_cong_viec?.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Dự án liên quan
              </label>
              <select
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                {...form.register('du_an_id')}
              >
                <option value="">(Không gắn dự án)</option>
                {dsDuAn.map((da) => (
                  <option key={da.id} value={da.id}>
                    {da.ma_ho_so ? `[${da.ma_ho_so}] ` : ''}{da.ten_du_an}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Người thực hiện
              </label>
              <select
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                {...form.register('nguoi_thuc_hien_id')}
              >
                <option value="">(Chưa phân công)</option>
                {dsNhanSu.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten}{ns.chuc_vu ? ` (${ns.chuc_vu})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Trạng thái <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                {...form.register('trang_thai')}
              >
                <option value="chua_thuc_hien">{TEN_TRANG_THAI['chua_thuc_hien']}</option>
                <option value="dang_thuc_hien">{TEN_TRANG_THAI['dang_thuc_hien']}</option>
                <option value="hoan_thanh">{TEN_TRANG_THAI['hoan_thanh']}</option>
                <option value="tam_dung">{TEN_TRANG_THAI['tam_dung']}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Thời hạn hoàn thành
              </label>
              <input
                type="date"
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                {...form.register('thoi_han_hoan_thanh')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Mô tả công việc
            </label>
            <textarea
              rows={3}
              placeholder="Nội dung, mục tiêu hoặc yêu cầu cụ thể..."
              className={cn(
                'w-full rounded-[var(--radius-input)] border px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                form.formState.errors.mo_ta
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-primary'
              )}
              {...form.register('mo_ta')}
            />
            {form.formState.errors.mo_ta && (
              <p className="mt-1 text-xs font-medium text-destructive">
                {form.formState.errors.mo_ta?.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Ghi chú
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm..."
              className={cn(
                'w-full rounded-[var(--radius-input)] border px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                form.formState.errors.ghi_chu
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-primary'
              )}
              {...form.register('ghi_chu')}
            />
            {form.formState.errors.ghi_chu && (
              <p className="mt-1 text-xs font-medium text-destructive">
                {form.formState.errors.ghi_chu?.message as string}
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border">
            <Nut
              kieu="outline"
              kich_thuoc="sm"
              onClick={khi_dong}
              disabled={dang_xu_ly}
            >
              Hủy
            </Nut>
            <Nut
              kieu="primary"
              kich_thuoc="sm"
              type="submit"
              disabled={dang_xu_ly || form.formState.isSubmitting}
              icon_trai={dang_xu_ly ? Loader2 : Save}
            >
              {dang_sua ? 'Lưu thay đổi' : 'Tạo công việc'}
            </Nut>
          </div>
        </form>
      </div>
    </div>
  );
}
