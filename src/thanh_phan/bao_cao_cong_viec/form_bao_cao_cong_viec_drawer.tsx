'use client';

import { useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CalendarDays,
  Briefcase,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BaoCaoCongViec, ChiTietBaoCaoCongViec } from '../../thu_vien/types/bao_cao_cong_viec';
import type {
  CapNhatBaoCaoCongViecDTO,
  TaoMoiBaoCaoCongViecDTO
} from '../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import {
  Ban_Ve,
  Nut,
  The_Chuc_Nang,
  The_Chuc_Nang_Header,
  The_Chuc_Nang_Tieu_De,
  The_Chuc_Nang_Noi_Dung
} from '../ui';

const homNay = () => new Date().toISOString().split('T')[0];

const SchemaChiTiet = z.object({
  du_an_id: z.string().nullable().optional(),
  noi_dung: z.string({ required_error: 'Nội dung bắt buộc' })
    .trim()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung tối đa 2000 ký tự')
});

const SchemaBaoCao = z.object({
  ngay_bao_cao: z.string({ required_error: 'Ngày báo cáo bắt buộc' })
    .min(1, 'Ngày báo cáo không được để trống'),
  danh_sach_chi_tiet: z.array(SchemaChiTiet)
    .min(1, 'Vui lòng nhập ít nhất một dòng công việc')
    .max(50, 'Tối đa 50 dòng công việc'),
  kho_khan: z.string().trim().max(2000, 'Khó khăn tối đa 2000 ký tự').nullable().optional()
});

type KieuDuLieuForm = z.infer<typeof SchemaBaoCao>;

interface FormBaoCaoCongViecDrawerProps {
  mo: boolean;
  onDong: () => void;
  dangSua: BaoCaoCongViec | null;
  ngayMacDinh?: string;
  danhSachDuAn?: { id: string; ten_du_an: string }[];
  onLuu: (
    data: TaoMoiBaoCaoCongViecDTO | CapNhatBaoCaoCongViecDTO,
    banGhi?: BaoCaoCongViec
  ) => Promise<void>;
  dangXuLy: boolean;
  loi?: string | null;
}

const taoDongMoi = (): ChiTietBaoCaoCongViec => ({
  du_an_id: null,
  noi_dung: ''
});

const GIA_TRI_MAC_DINH: KieuDuLieuForm = {
  ngay_bao_cao: homNay(),
  danh_sach_chi_tiet: [taoDongMoi()],
  kho_khan: null
};

export default function FormBaoCaoCongViecDrawer(props: FormBaoCaoCongViecDrawerProps) {
  const {
    mo,
    onDong,
    dangSua,
    ngayMacDinh,
    onLuu,
    dangXuLy,
    loi
  } = props;

  const dongCanFocusRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<KieuDuLieuForm>({
    resolver: zodResolver(SchemaBaoCao),
    defaultValues: GIA_TRI_MAC_DINH,
    mode: 'onTouched'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'danh_sach_chi_tiet'
  });

  const watchNgayBaoCao = watch('ngay_bao_cao');

  // Focus vào dòng mới khi append
  useEffect(() => {
    if (dongCanFocusRef.current !== null) {
      const el = document.getElementById(`f-bccv-nd-${dongCanFocusRef.current}`);
      if (el) {
        el.focus();
      }
      dongCanFocusRef.current = null;
    }
  }, [fields.length]);

  useEffect(() => {
    if (!mo) return;
    if (dangSua) {
      const dsChiTiet: ChiTietBaoCaoCongViec[] =
        dangSua.danh_sach_chi_tiet && Array.isArray(dangSua.danh_sach_chi_tiet) && dangSua.danh_sach_chi_tiet.length > 0
          ? dangSua.danh_sach_chi_tiet.map((ct) => ({
              du_an_id: ct.du_an_id ?? null,
              noi_dung: ct.noi_dung
            }))
          : dangSua.noi_dung_thuc_hien
            ? [
                {
                  du_an_id: dangSua.du_an_id ?? null,
                  noi_dung: dangSua.noi_dung_thuc_hien
                }
              ]
            : [taoDongMoi()];
      reset({
        ngay_bao_cao: dangSua.ngay_bao_cao,
        danh_sach_chi_tiet: dsChiTiet,
        kho_khan: dangSua.kho_khan
      });
    } else {
      reset({
        ...GIA_TRI_MAC_DINH,
        ngay_bao_cao: ngayMacDinh || homNay(),
        danh_sach_chi_tiet: [taoDongMoi()]
      });
    }
  }, [mo, dangSua, ngayMacDinh, reset]);

  const xuLyLuu = handleSubmit(async (data) => {
    const danh_sach_chi_tiet_chuan_hoa = data.danh_sach_chi_tiet
      .map((ct) => ({
        du_an_id: ct.du_an_id ?? null,
        noi_dung: ct.noi_dung.trim()
      }))
      .filter((ct) => ct.noi_dung.length > 0);

    if (danh_sach_chi_tiet_chuan_hoa.length === 0) {
      return;
    }

    if (dangSua) {
      const dto: CapNhatBaoCaoCongViecDTO = {
        ngay_bao_cao: data.ngay_bao_cao,
        danh_sach_chi_tiet: danh_sach_chi_tiet_chuan_hoa,
        kho_khan: data.kho_khan ?? null
      };
      await onLuu(dto, dangSua);
    } else {
      const dto: TaoMoiBaoCaoCongViecDTO = {
        ngay_bao_cao: data.ngay_bao_cao,
        danh_sach_chi_tiet: danh_sach_chi_tiet_chuan_hoa,
        kho_khan: data.kho_khan ?? null
      };
      await onLuu(dto);
    }
  });

  const themDong = () => {
    dongCanFocusRef.current = fields.length;
    append(taoDongMoi());
  };

  const xoaDong = (index: number) => {
    if (fields.length <= 1) {
      setValue(`danh_sach_chi_tiet.0.noi_dung`, '');
      return;
    }
    remove(index);
  };

  // Xử lý phím Enter để tạo dòng mới ngay lập tức
  const xuLyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === fields.length - 1) {
        themDong();
      } else {
        const nextEl = document.getElementById(`f-bccv-nd-${index + 1}`);
        if (nextEl) nextEl.focus();
      }
    }
  };

  // Xử lý dán nhiều dòng: nếu người dùng paste văn bản có nhiều dòng, tự tách thành các dòng việc
  const xuLyPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const text = e.clipboardData.getData('text');
    if (!text || !text.includes('\n')) return;

    const lines = text
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter((l) => l.length > 0);

    if (lines.length > 1) {
      e.preventDefault();
      setValue(`danh_sach_chi_tiet.${index}.noi_dung`, lines[0]);
      lines.slice(1).forEach((line) => {
        append({ du_an_id: null, noi_dung: line });
      });
    }
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="font-bold text-foreground text-lg">
              {dangSua ? 'Sửa báo cáo công việc' : 'Báo cáo công việc'}
            </div>
          </div>
        </div>
      }
      phu_de={
        dangSua
          ? `Báo cáo ngày ${watchNgayBaoCao}`
          : 'Nhập các công việc đã làm trong ngày (mỗi việc 1 dòng)'
      }
      cuoi={
        <>
          <Nut kieu="ghost" kich_thuoc="md" onClick={onDong} type="button" disabled={dangXuLy}>
            Hủy
          </Nut>
          <Nut
            kieu="primary"
            kich_thuoc="md"
            icon_trai={dangXuLy ? undefined : Save}
            type="submit"
            form="form-bao-cao-cong-viec"
            disabled={dangXuLy}
          >
            {dangXuLy ? 'Đang lưu...' : dangSua ? 'Lưu thay đổi' : 'Gửi báo cáo'}
          </Nut>
        </>
      }
    >
      <form id="form-bao-cao-cong-viec" onSubmit={xuLyLuu} className="space-y-5">
        {loi && (
          <div className="rounded-[var(--radius-input)] border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger font-medium flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{loi}</span>
          </div>
        )}

        {/* Section 1: Ngày báo cáo */}
        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-sm font-bold flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Ngày báo cáo
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung>
            <div>
              <input
                id="f-bccv-ngay"
                type="date"
                disabled={dangXuLy}
                {...register('ngay_bao_cao')}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-[var(--radius-input)] text-sm text-foreground focus:outline-none focus:border-primary transition disabled:opacity-50 font-semibold"
              />
              {errors.ngay_bao_cao && (
                <p className="mt-1 text-xs text-danger">{errors.ngay_bao_cao.message}</p>
              )}
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        {/* Section 2: Danh sách công việc đã làm (Mỗi việc trên 1 dòng - Đơn giản, tiện lợi) */}
        <The_Chuc_Nang>
          <The_Chuc_Nang_Header className="flex items-center justify-between gap-2">
            <The_Chuc_Nang_Tieu_De className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="size-4 text-primary" />
              Nội dung công việc <span className="text-danger">*</span>
            </The_Chuc_Nang_Tieu_De>
            <span className="text-xs text-muted-foreground font-medium">
              {fields.length} công việc
            </span>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Mỗi công việc nhập trên 1 dòng. Nhấn <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-foreground">Enter</kbd> để thêm dòng mới nhanh.
            </p>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const ctErrors = errors.danh_sach_chi_tiet?.[index];
                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 group"
                  >
                    <span className="size-6 rounded-md bg-muted text-muted-foreground text-xs font-bold inline-flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <input
                        id={`f-bccv-nd-${index}`}
                        type="text"
                        autoComplete="off"
                        disabled={dangXuLy}
                        {...register(`danh_sach_chi_tiet.${index}.noi_dung`)}
                        onKeyDown={(e) => xuLyKeyDown(e, index)}
                        onPaste={(e) => xuLyPaste(e, index)}
                        placeholder={`Công việc ${index + 1}...`}
                        className="w-full h-9 px-3 bg-background border border-border rounded-[var(--radius-input)] text-xs text-foreground focus:outline-none focus:border-primary transition disabled:opacity-50 font-medium"
                      />
                      {ctErrors?.noi_dung && (
                        <p className="mt-1 text-xs text-danger">{ctErrors.noi_dung.message}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => xoaDong(index)}
                      disabled={dangXuLy}
                      className="size-8 rounded-[var(--radius-input)] text-muted-foreground hover:text-danger hover:bg-danger/10 inline-flex items-center justify-center transition disabled:opacity-50 shrink-0 opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Xóa dòng"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}

              {errors.danh_sach_chi_tiet && !Array.isArray(errors.danh_sach_chi_tiet) && (
                <p className="text-xs text-danger">{(errors.danh_sach_chi_tiet as any)?.message}</p>
              )}
            </div>

            {/* Nút thêm dòng */}
            <div className="pt-2">
              <Nut
                type="button"
                kieu="outline"
                kich_thuoc="sm"
                onClick={themDong}
                disabled={dangXuLy}
                icon_trai={Plus}
                className="h-8 px-3 text-xs font-semibold border-dashed border-border hover:border-primary text-foreground hover:text-primary w-full justify-center cursor-pointer"
              >
                Thêm dòng công việc (hoặc nhấn Enter)
              </Nut>
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        {/* Section 3: Khó khăn, vướng mắc (Tùy chọn) */}
        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Khó khăn / Vướng mắc / Đề xuất
              <span className="text-xs font-normal text-muted-foreground">(tùy chọn)</span>
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung>
            <textarea
              id="f-bccv-kho-khan"
              rows={2}
              disabled={dangXuLy}
              {...register('kho_khan')}
              placeholder="Ghi chú vướng mắc hoặc đề xuất hỗ trợ nếu có..."
              className="w-full px-3.5 py-2 bg-background border border-border rounded-[var(--radius-input)] text-xs text-foreground focus:outline-none focus:border-primary transition resize-y disabled:opacity-50 font-medium"
            />
            {errors.kho_khan && (
              <p className="mt-1 text-xs text-danger">{errors.kho_khan.message}</p>
            )}
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>
      </form>
    </Ban_Ve>
  );
}
