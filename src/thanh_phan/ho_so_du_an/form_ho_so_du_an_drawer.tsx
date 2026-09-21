'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import {
  Save,
  FolderPlus,
  Edit3,
  AlertCircle,
  FileText,
  Target,
  DollarSign,
  CalendarDays,
  Users,
  Building2,
  UserPlus,
  CheckCircle2,
  Layers,
  Package,
  Info
} from 'lucide-react';
import type {
  CapNhatHoSoDuAnDTO,
  TaoMoiHoSoDuAnDTO
} from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type { HoSoDuAn, GiaiDoanDuAn, MucDoTiemNangKyHopDong } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh, PhongBan } from '../../thu_vien/types/nhan_su';
import type { SanPhamDichVu, NhomSanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import { danhSachKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachSanPhamDichVu } from '../../dich_vu/san_pham_dich_vu/dich_vu_san_pham_dich_vu';
import { danhSachNhomSanPhamDichVu } from '../../dich_vu/san_pham_dich_vu/dich_vu_nhom_san_pham_dich_vu';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import {
  Ban_Ve,
  O,
  Chon,
  Nhan,
  Nut,
  The_Chuc_Nang,
  The_Chuc_Nang_Header,
  The_Chuc_Nang_Tieu_De,
  The_Chuc_Nang_Noi_Dung,
  DaiDien
} from '../ui';
import { cn } from '../../thu_vien/utils/cn';

const DINH_DANG_SO_TIEN = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  if (n === 0) return '0';
  return n.toLocaleString('vi-VN');
};

const SCHEMA_HO_SO_DU_AN = z.object({
  ma_ho_so: z.string().max(50, 'Mã hồ sơ quá dài (tối đa 50 ký tự)').trim().nullable().optional(),
  ten_du_an: z
    .string({ required_error: 'Vui lòng nhập tên dự án' })
    .trim()
    .min(2, 'Tên dự án ít nhất 2 ký tự')
    .max(250, 'Tên dự án dài nhất 250 ký tự'),
  khach_hang_id: z.string().trim().nullable().optional(),
  nguoi_lien_he_id: z.string().trim().nullable().optional(),
  chi_nhanh_id: z.string().trim().nullable().optional(),
  phong_ban_id: z.string().trim().nullable().optional(),
  san_pham_dich_vu_id: z.string().nullable().optional(),
  san_pham_khac_mo_ta: z
    .string()
    .max(500, 'Mô tả sản phẩm khác tối đa 500 ký tự')
    .nullable()
    .optional()
    .or(z.literal('')),
  giai_doan: z.string().min(1, 'Chọn giai đoạn dự án'),
  muc_do_tiem_nang: z.enum(['rat_cao', 'cao', 'trung_binh', 'thap', 'rat_thap'], {
    required_error: 'Chọn mức tiềm năng'
  }),
  gia_tri_du_kien: z.coerce.number().min(0, 'Giá trị không được âm').optional(),
  gia_tri_hop_dong: z.coerce.number().min(0, 'Giá trị không được âm').optional(),
  nguoi_quan_ly_id: z.string().trim().nullable().optional(),
  nguoi_phu_trach_id: z.string().trim().nullable().optional(),
  danh_sach_nguoi_ho_tro_ids: z.string().array().default([]),
  ngay_tao_ho_so: z.string().max(30, 'Ngày tạo không hợp lệ').nullable().optional(),
  thoi_han_hoan_thanh: z.string().max(30, 'Thời hạn không hợp lệ').nullable().optional(),
  mo_ta: z.string().max(2000, 'Mô tả quá dài (tối đa 2000 ký tự)').trim().nullable().optional(),
  ghi_chu: z.string().max(1000, 'Ghi chú quá dài (tối đa 1000 ký tự)').trim().nullable().optional(),
  trang_thai: z.enum(['hoat_dong', 'da_xoa']).optional()
});

type GiaTriForm = z.infer<typeof SCHEMA_HO_SO_DU_AN>;

const GIA_TRI_MAC_DINH: GiaTriForm = {
  ma_ho_so: null,
  ten_du_an: '',
  khach_hang_id: null,
  nguoi_lien_he_id: null,
  chi_nhanh_id: null,
  phong_ban_id: null,
  san_pham_dich_vu_id: null,
  san_pham_khac_mo_ta: null,
  giai_doan: 'moi_tao',
  muc_do_tiem_nang: 'trung_binh',
  gia_tri_du_kien: 0,
  gia_tri_hop_dong: 0,
  nguoi_quan_ly_id: null,
  nguoi_phu_trach_id: null,
  danh_sach_nguoi_ho_tro_ids: [],
  ngay_tao_ho_so: new Date().toISOString().split('T')[0],
  thoi_han_hoan_thanh: null,
  mo_ta: null,
  ghi_chu: null,
  trang_thai: 'hoat_dong'
};

interface FormHoSoDuAnDrawerProps {
  mo: boolean;
  khi_dong: () => void;
  dang_sua: HoSoDuAn | null;
  khi_luu: (dto: TaoMoiHoSoDuAnDTO | CapNhatHoSoDuAnDTO) => Promise<void> | void;
  dang_xu_ly?: boolean;
  loi_thong_bao?: string | null;
}

export default function FormHoSoDuAnDrawer({
  mo,
  khi_dong,
  dang_sua,
  khi_luu,
  dang_xu_ly = false,
  loi_thong_bao = null
}: FormHoSoDuAnDrawerProps) {
  const [dsKH, setDsKH] = useState<KhachHang[]>([]);
  const [dsNLH, setDsNLH] = useState<NguoiLienHe[]>([]);
  const [dsNS, setDsNS] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsSanPham, setDsSanPham] = useState<SanPhamDichVu[]>([]);
  const [dsNhomSanPham, setDsNhomSanPham] = useState<NhomSanPhamDichVu[]>([]);

  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laBackOffice = ['hanh_chinh_van_phong'].includes(nguoiDungHienTai?.vai_tro ?? '');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting }
  } = useForm<GiaTriForm>({
    resolver: zodResolver(SCHEMA_HO_SO_DU_AN),
    defaultValues: GIA_TRI_MAC_DINH,
    mode: 'onTouched'
  });

  const khachHangDangChon = watch('khach_hang_id');
  const chiNhanhDangChon = watch('chi_nhanh_id');
  const nguoiQuanLyId = watch('nguoi_quan_ly_id');
  const nguoiPhuTrachId = watch('nguoi_phu_trach_id');
  const rawHoTro = watch('danh_sach_nguoi_ho_tro_ids');
  const dsHoTroDangChon = useMemo(() => (Array.isArray(rawHoTro) ? rawHoTro : []), [rawHoTro]);
  const spdvDangChon = watch('san_pham_dich_vu_id');
  const laChonKhac = spdvDangChon === '__KHAC__';

  useEffect(() => {
    if (!mo) return;
    void (async () => {
      try {
        const [kq1, kq2, kq3, kq4, kq5, kq6] = await Promise.all([
          danhSachKhachHang({ trang_thai: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachChiNhanh(),
          danhSachPhongBan(),
          danhSachSanPhamDichVu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachNhomSanPhamDichVu({ trang_thai_du_lieu: 'hoat_dong' })
        ]);
        setDsKH(kq1.mang);
        setDsNS(kq2.mang);
        setDsChiNhanh(kq3.mang);
        setDsPhongBan(kq4.mang);
        setDsSanPham(kq5.mang);
        setDsNhomSanPham(kq6.mang);
      } catch {}
    })();
  }, [mo]);

  useEffect(() => {
    if (!mo) {
      setDsNLH([]);
      return;
    }
    if (!khachHangDangChon) {
      setDsNLH([]);
      setValue('nguoi_lien_he_id', null, { shouldDirty: isDirty });
      return;
    }
    void (async () => {
      try {
        const kq = await danhSachNguoiLienHe({ khach_hang_id: khachHangDangChon });
        setDsNLH(kq.mang);
        const danhSachId = kq.mang.map((x) => x.id);
        if (danhSachId.length > 0 && watch('nguoi_lien_he_id') && !danhSachId.includes(watch('nguoi_lien_he_id')!)) {
          setValue('nguoi_lien_he_id', null, { shouldDirty: isDirty });
        }
      } catch {
        setDsNLH([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mo, khachHangDangChon]);

  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      const coSpKhacMoTa = Boolean(dang_sua.san_pham_khac_mo_ta && dang_sua.san_pham_khac_mo_ta.trim());
      const selectGiaTri = dang_sua.san_pham_dich_vu_id
        ? dang_sua.san_pham_dich_vu_id
        : coSpKhacMoTa
        ? '__KHAC__'
        : null;
      reset({
        ma_ho_so: dang_sua.ma_ho_so || null,
        ten_du_an: dang_sua.ten_du_an,
        khach_hang_id: dang_sua.khach_hang_id ?? null,
        nguoi_lien_he_id: dang_sua.nguoi_lien_he_id ?? null,
        chi_nhanh_id: dang_sua.chi_nhanh_id ?? null,
        phong_ban_id: dang_sua.phong_ban_id ?? null,
        san_pham_dich_vu_id: selectGiaTri,
        san_pham_khac_mo_ta: dang_sua.san_pham_khac_mo_ta ?? null,
        giai_doan: (dang_sua.giai_doan as GiaiDoanDuAn) ?? 'moi_tao',
        muc_do_tiem_nang: (dang_sua.muc_do_tiem_nang as MucDoTiemNangKyHopDong) ?? 'trung_binh',
        gia_tri_du_kien: dang_sua.gia_tri_du_kien ?? 0,
        gia_tri_hop_dong: dang_sua.gia_tri_hop_dong ?? 0,
        nguoi_quan_ly_id: dang_sua.nguoi_quan_ly_id ?? null,
        nguoi_phu_trach_id: dang_sua.nguoi_phu_trach_id ?? null,
        danh_sach_nguoi_ho_tro_ids: Array.isArray(dang_sua.danh_sach_nguoi_ho_tro_ids)
          ? dang_sua.danh_sach_nguoi_ho_tro_ids
          : [],
        ngay_tao_ho_so: dang_sua.ngay_tao_ho_so ?? new Date().toISOString().split('T')[0],
        thoi_han_hoan_thanh: dang_sua.thoi_han_hoan_thanh ?? null,
        mo_ta: dang_sua.mo_ta ?? null,
        ghi_chu: dang_sua.ghi_chu ?? null,
        trang_thai: dang_sua.trang_thai
      });
    } else {
      reset({
        ...GIA_TRI_MAC_DINH,
        chi_nhanh_id: nguoiDungHienTai?.chi_nhanh_id ?? null,
        phong_ban_id: nguoiDungHienTai?.phong_ban_id ?? null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mo, dang_sua?.id]);

  const laSua = Boolean(dang_sua);

  const watchDK = Number(watch('gia_tri_du_kien') ?? 0);
  const watchHD = Number(watch('gia_tri_hop_dong') ?? 0);
  const coSoTien = watchDK > 0 || watchHD > 0;

  const dsPhongBanFiltered = useMemo(() => {
    if (!chiNhanhDangChon) return dsPhongBan;
    return dsPhongBan.filter((pb) => pb.chi_nhanh_id === chiNhanhDangChon);
  }, [dsPhongBan, chiNhanhDangChon]);

  const dsNLHFiltered = useMemo(() => {
    if (!khachHangDangChon) return dsNLH;
    return dsNLH.filter((nlh) => nlh.khach_hang_id === khachHangDangChon);
  }, [dsNLH, khachHangDangChon]);

  const toggleNguoiHoTro = (nsId: string) => {
    const arr = Array.isArray(dsHoTroDangChon) ? dsHoTroDangChon : [];
    const hienTai = new Set<string>(arr);
    if (hienTai.has(nsId)) {
      hienTai.delete(nsId);
    } else {
      hienTai.add(nsId);
    }
    setValue('danh_sach_nguoi_ho_tro_ids', Array.from(hienTai), { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const rawSpdv = values.san_pham_dich_vu_id ?? null;
    let san_pham_dich_vu_id: string | null = null;
    let san_pham_khac_mo_ta: string | null = null;
    if (rawSpdv === '__KHAC__') {
      san_pham_dich_vu_id = null;
      san_pham_khac_mo_ta = (values.san_pham_khac_mo_ta || '').trim() || null;
    } else if (rawSpdv && rawSpdv.trim()) {
      san_pham_dich_vu_id = rawSpdv;
      san_pham_khac_mo_ta = null;
    } else {
      san_pham_dich_vu_id = null;
      san_pham_khac_mo_ta = null;
    }
    const duLieuChuan = {
      ...values,
      ma_ho_so: (values.ma_ho_so ?? null) || null,
      khach_hang_id: (values.khach_hang_id ?? null) || null,
      nguoi_lien_he_id: (values.nguoi_lien_he_id ?? null) || null,
      chi_nhanh_id: (values.chi_nhanh_id ?? null) || null,
      phong_ban_id: (values.phong_ban_id ?? null) || null,
      san_pham_dich_vu_id,
      san_pham_khac_mo_ta,
      nguoi_quan_ly_id: (values.nguoi_quan_ly_id ?? null) || null,
      nguoi_phu_trach_id: (values.nguoi_phu_trach_id ?? null) || null,
      danh_sach_nguoi_ho_tro_ids: Array.isArray(values.danh_sach_nguoi_ho_tro_ids)
        ? values.danh_sach_nguoi_ho_tro_ids.filter(Boolean)
        : [],
      mo_ta: (values.mo_ta ?? null) || null,
      ghi_chu: (values.ghi_chu ?? null) || null,
      thoi_han_hoan_thanh: (values.thoi_han_hoan_thanh ?? null) || null,
      ngay_tao_ho_so:
        values.ngay_tao_ho_so && values.ngay_tao_ho_so.length > 0
          ? values.ngay_tao_ho_so
          : new Date().toISOString().split('T')[0],
      gia_tri_du_kien: Number(values.gia_tri_du_kien) || 0,
      gia_tri_hop_dong: Number(values.gia_tri_hop_dong) || 0
    };
    if (dang_sua) {
      await khi_luu({ id: dang_sua.id, ...duLieuChuan } as CapNhatHoSoDuAnDTO);
    } else {
      await khi_luu(duLieuChuan as TaoMoiHoSoDuAnDTO);
    }
  });

  return (
    <Ban_Ve
      mo={mo}
      onDong={khi_dong}
      tieu_de={
        <div className="flex items-center gap-2.5">
          <div className="size-9 shrink-0 rounded-xl bg-indigo-50 text-indigo-700 inline-flex items-center justify-center">
            {laSua ? <Edit3 className="size-[18px]" /> : <FolderPlus className="size-[18px]" />}
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-900">
              {laSua ? 'Chỉnh sửa hồ sơ dự án' : 'Thêm hồ sơ dự án mới'}
            </div>
          </div>
        </div>
      }
      phu_de={
        laSua && dang_sua
          ? `Mã: ${dang_sua.ma_ho_so ?? dang_sua.id.slice(0, 10)}  ·  Lần cập nhật cuối: ${(dang_sua.ngay_cap_nhat ?? dang_sua.ngay_tao ?? '').slice(0, 10)}`
          : 'Nhập thông tin cơ bản, bạn luôn có thể sửa lại sau.'
      }
      cuoi={
        <>
          <Nut kieu="ghost" kich_thuoc="md" onClick={khi_dong} type="button">
            Hủy
          </Nut>
          <Nut
            kieu="primary"
            kich_thuoc="md"
            icon_trai={Save}
            type="submit"
            form="form-ho-so-du-an"
            disabled={dang_xu_ly || !isDirty || isSubmitting}
          >
            {dang_xu_ly ? 'Đang lưu...' : laSua ? 'Lưu thay đổi' : 'Thêm hồ sơ dự án'}
          </Nut>
        </>
      }
    >
      {loi_thong_bao ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2.5 mb-5">
          <div className="size-7 rounded-xl bg-rose-100 text-rose-700 inline-flex shrink-0 items-center justify-center">
            <AlertCircle className="size-4" />
          </div>
          <div className="min-w-0 font-semibold pt-0.5">{loi_thong_bao}</div>
        </div>
      ) : null}

      <form id="form-ho-so-du-an" onSubmit={onSubmit} className="space-y-6">
        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600" />
              Khách hàng & Liên hệ
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-kh">Khách hàng (Công ty)</Nhan>
                <Controller
                  name="khach_hang_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-kh"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value ? e.target.value : null);
                      }}
                      phan_hoi={errors.khach_hang_id?.message ?? null}
                    >
                      <option value="">(Chưa chọn — chọn khách hàng)</option>
                      {dsKH.map((kh) => (
                        <option key={kh.id} value={kh.id}>
                          {kh.ten_khach_hang}
                          {kh.ma_so_thue ? `  (MST: ${kh.ma_so_thue})` : ''}
                        </option>
                      ))}
                    </Chon>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-nlh">Người liên hệ (thuộc KH)</Nhan>
                <Controller
                  name="nguoi_lien_he_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-nlh"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value ? e.target.value : null);
                      }}
                      phan_hoi={errors.nguoi_lien_he_id?.message ?? null}
                      disabled={!khachHangDangChon}
                    >
                      {!khachHangDangChon ? (
                        <option value="">— Chọn khách hàng trước —</option>
                      ) : dsNLHFiltered.length === 0 ? (
                        <option value="">(Khách hàng này chưa có liên hệ)</option>
                      ) : (
                        <>
                          <option value="">(Chưa chọn người liên hệ)</option>
                          {dsNLHFiltered.map((nlh) => (
                            <option key={nlh.id} value={nlh.id}>
                              {nlh.ho_va_ten}
                              {nlh.chuc_vu ? ` — ${nlh.chuc_vu}` : ''}
                            </option>
                          ))}
                        </>
                      )}
                    </Chon>
                  )}
                />
              </div>
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Package className="size-5 text-indigo-600" />
              Sản phẩm / Dịch vụ
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="space-y-1.5">
              <Nhan htmlFor="f-hda-spdv">Sản phẩm / Dịch vụ</Nhan>
              <Controller
                name="san_pham_dich_vu_id"
                control={control}
                render={({ field }) => (
                  <Chon
                    {...field}
                    id="f-hda-spdv"
                    value={field.value ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const val = e.target.value;
                      field.onChange(val ? val : null);
                      if (val !== '__KHAC__') {
                        setValue('san_pham_khac_mo_ta', null, { shouldDirty: true });
                      }
                    }}
                    phan_hoi={errors.san_pham_dich_vu_id?.message ?? null}
                  >
                    <option value="">Chọn...</option>
                    {dsNhomSanPham.map((n) => {
                      const cacMonTheoNhom = dsSanPham.filter((s) => s.nhom_san_pham_id === n.id);
                      if (cacMonTheoNhom.length === 0) return null;
                      return (
                        <optgroup key={n.id} label={(n.ma_nhom ? `[${n.ma_nhom}] ` : '') + n.ten_nhom}>
                          {cacMonTheoNhom.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              [{sp.ma_san_pham || 'ĐB'}] {sp.ten_san_pham}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {dsSanPham.filter((s) => !s.nhom_san_pham_id).length > 0 && (
                      <optgroup label="(Chưa phân nhóm)">
                        {dsSanPham
                          .filter((s) => !s.nhom_san_pham_id)
                          .map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              [{sp.ma_san_pham || 'ĐB'}] {sp.ten_san_pham}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    <option value="__KHAC__">⚙ Khác</option>
                  </Chon>
                )}
              />
            </div>
            {laChonKhac ? (
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-spdv-khac-mota">Mô tả</Nhan>
                <O
                  {...register('san_pham_khac_mo_ta')}
                  id="f-hda-spdv-khac-mota"
                  type="textarea"
                  placeholder="Nhập mô tả..."
                  phan_hoi={errors.san_pham_khac_mo_ta?.message ?? null}
                />
              </div>
            ) : null}
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Layers className="size-5 text-indigo-600" />
              Cơ cấu tổ chức
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-cn">Chi nhánh</Nhan>
                <Controller
                  name="chi_nhanh_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-cn"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const giaTriMoi = e.target.value ? e.target.value : null;
                        field.onChange(giaTriMoi);
                        if (!giaTriMoi) {
                          setValue('phong_ban_id', null, { shouldDirty: true });
                        } else {
                          const pbKhongThuoc = dsPhongBanFiltered.find(
                            (pb) => pb.id === watch('phong_ban_id')
                          );
                          if (!pbKhongThuoc) {
                            setValue('phong_ban_id', null, { shouldDirty: true });
                          }
                        }
                      }}
                      phan_hoi={errors.chi_nhanh_id?.message ?? null}
                    >
                      <option value="">(Chưa chọn chi nhánh)</option>
                      {dsChiNhanh.map((cn) => (
                        <option key={cn.id} value={cn.id}>
                          {cn.ten_chi_nhanh}
                          {cn.ma_chi_nhanh ? `  (${cn.ma_chi_nhanh})` : ''}
                        </option>
                      ))}
                    </Chon>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-pb">Phòng ban</Nhan>
                <Controller
                  name="phong_ban_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-pb"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value ? e.target.value : null);
                      }}
                      phan_hoi={errors.phong_ban_id?.message ?? null}
                      disabled={!chiNhanhDangChon && dsPhongBan.length > 0}
                    >
                      {!chiNhanhDangChon && dsPhongBan.length > 0 ? (
                        <option value="">— Chọn chi nhánh trước —</option>
                      ) : dsPhongBanFiltered.length === 0 ? (
                        <option value="">(Chưa có phòng ban cho chi nhánh này)</option>
                      ) : (
                        <>
                          <option value="">(Chưa chọn phòng ban)</option>
                          {dsPhongBanFiltered.map((pb) => (
                            <option key={pb.id} value={pb.id}>
                              {pb.ten_phong_ban}
                              {pb.ma_phong_ban ? `  (${pb.ma_phong_ban})` : ''}
                            </option>
                          ))}
                        </>
                      )}
                    </Chon>
                  )}
                />
              </div>
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <FileText className="size-5 text-indigo-600" />
              Thông tin cơ bản
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-1">
                <Nhan bat_buoc htmlFor="f-hda-ten">Tên dự án</Nhan>
                <O
                  {...register('ten_du_an')}
                  id="f-hda-ten"
                  type="text"
                  placeholder="Ví dụ: Xây dựng Hệ thống quản lý tài sản ABC"
                  phan_hoi={errors.ten_du_an?.message ?? null}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-ma">Mã hồ sơ dự án</Nhan>
                <O
                  {...register('ma_ho_so')}
                  id="f-hda-ma"
                  type="text"
                  placeholder="Ví dụ: EBMS-2026-001 (có thể để trống)"
                  phan_hoi={errors.ma_ho_so?.message ?? null}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan bat_buoc htmlFor="f-hda-gd">Giai đoạn hiện tại</Nhan>
                <Controller
                  name="giai_doan"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-gd"
                      phan_hoi={errors.giai_doan?.message ?? null}
                    >
                      <option value="moi_tao">Mới tạo</option>
                      <option value="tiep_can">Tiếp cận</option>
                      <option value="khao_sat">Khảo sát</option>
                      <option value="len_giai_phap">Lên giải pháp</option>
                      <option value="bao_gia">Báo giá</option>
                      <option value="dam_phan">Đàm phán</option>
                      <option value="ky_hop_dong">Ký hợp đồng</option>
                      <option value="trien_khai">Triển khai</option>
                      <option value="nghiem_thu">Nghiệm thu</option>
                      <option value="hoan_thanh">Hoàn thành</option>
                      <option value="tam_dung">Tạm dừng</option>
                      <option value="huy">Đã hủy</option>
                    </Chon>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan bat_buoc htmlFor="f-hda-tn">Mức tiềm năng ký Hợp đồng</Nhan>
                <Controller
                  name="muc_do_tiem_nang"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-tn"
                      phan_hoi={errors.muc_do_tiem_nang?.message ?? null}
                    >
                      <option value="rat_cao">Rất cao (vượt 80% thực hiện)</option>
                      <option value="cao">Cao (60-80%)</option>
                      <option value="trung_binh">Trung bình (40-60%)</option>
                      <option value="thap">Thấp (20-40%)</option>
                      <option value="rat_thap">Rất thấp (dưới 20%)</option>
                    </Chon>
                  )}
                />
              </div>
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Users className="size-5 text-indigo-600" />
              Quản lý & Phân công
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-nql">Người quản lý (Giám đốc / Trưởng phòng)</Nhan>
                <Controller
                  name="nguoi_quan_ly_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-nql"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value ? e.target.value : null);
                      }}
                      phan_hoi={errors.nguoi_quan_ly_id?.message ?? null}
                    >
                      <option value="">(Chưa phân công — chọn nhân sự)</option>
                      {dsPhongBan.map((pb) => {
                        const nsThuocPb = dsNS.filter((ns) => ns.phong_ban_id === pb.id);
                        if (nsThuocPb.length === 0) return null;
                        return (
                          <optgroup key={pb.id} label={`🏢 ${pb.ten_phong_ban}`}>
                            {nsThuocPb.map((ns) => (
                              <option key={ns.id} value={ns.id}>
                                {ns.ho_va_ten} {ns.chuc_vu ? `— ${ns.chuc_vu}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                      {dsNS.filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id)).length > 0 && (
                        <optgroup label="🏢 Chưa phân phòng ban">
                          {dsNS
                            .filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id))
                            .map((ns) => (
                              <option key={ns.id} value={ns.id}>
                                {ns.ho_va_ten} {ns.chuc_vu ? `— ${ns.chuc_vu}` : ''}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </Chon>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-npt">Người phụ trách chính (PIC)</Nhan>
                <Controller
                  name="nguoi_phu_trach_id"
                  control={control}
                  render={({ field }) => (
                    <Chon
                      {...field}
                      id="f-hda-npt"
                      value={field.value ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.onChange(e.target.value ? e.target.value : null);
                      }}
                      phan_hoi={errors.nguoi_phu_trach_id?.message ?? null}
                    >
                      <option value="">(Chưa phân công — chọn nhân sự)</option>
                      {dsPhongBan.map((pb) => {
                        const nsThuocPb = dsNS.filter((ns) => ns.phong_ban_id === pb.id);
                        if (nsThuocPb.length === 0) return null;
                        return (
                          <optgroup key={pb.id} label={`🏢 ${pb.ten_phong_ban}`}>
                            {nsThuocPb.map((ns) => (
                              <option key={ns.id} value={ns.id}>
                                {ns.ho_va_ten} {ns.vai_tro ? `— ${String(ns.vai_tro).replace(/_/g, ' ')}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                      {dsNS.filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id)).length > 0 && (
                        <optgroup label="🏢 Chưa phân phòng ban">
                          {dsNS
                            .filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id))
                            .map((ns) => (
                              <option key={ns.id} value={ns.id}>
                                {ns.ho_va_ten} {ns.vai_tro ? `— ${String(ns.vai_tro).replace(/_/g, ' ')}` : ''}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </Chon>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Nhan htmlFor="f-hda-dsht">
                  <span className="inline-flex items-center gap-1.5">
                    <UserPlus className="size-4 text-indigo-600" />
                    Danh sách người hỗ trợ (phân công đa phòng ban)
                    {dsHoTroDangChon.length > 0 && (
                      <span className="rounded-full bg-indigo-600 text-white text-[11px] px-2 py-0.5 font-bold ml-1">
                        {dsHoTroDangChon.length}
                      </span>
                    )}
                  </span>
                </Nhan>
                {dsNS.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const tatCaId = dsNS
                        .filter((ns) => ns.id !== nguoiPhuTrachId && ns.id !== nguoiQuanLyId)
                        .map((ns) => ns.id);
                      const tatCaDaChon = tatCaId.every((id) => dsHoTroDangChon.includes(id)) && tatCaId.length > 0;
                      setValue(
                        'danh_sach_nguoi_ho_tro_ids',
                        tatCaDaChon ? [] : tatCaId,
                        { shouldDirty: true }
                      );
                    }}
                    className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline shrink-0"
                  >
                    {dsHoTroDangChon.filter(Boolean).length ===
                    dsNS.filter((ns) => ns.id !== nguoiPhuTrachId && ns.id !== nguoiQuanLyId).length
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả (trừ NQL/NPT)'}
                  </button>
                )}
              </div>
              {dsNS.length === 0 ? (
                <div className="text-xs text-slate-500 italic rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                  Chưa có dữ liệu nhân sự — mở Drawer sau khi hệ thống tải danh sách.
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5">
                  {/* Danh sách nhân sự tự động phân nhóm theo tất cả các phòng ban trong hệ thống */}
                  {dsPhongBan.map((pb) => {
                    const nsThuocPb = dsNS.filter((ns) => ns.phong_ban_id === pb.id);
                    if (nsThuocPb.length === 0) return null;
                    const soChon = nsThuocPb.filter((ns) => dsHoTroDangChon.includes(ns.id)).length;
                    return (
                      <div key={pb.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <Building2 className="size-3.5 text-indigo-600 shrink-0" />
                            <span>{pb.ten_phong_ban}</span>
                            {pb.ma_phong_ban && <span className="text-slate-400 font-mono font-normal">({pb.ma_phong_ban})</span>}
                            <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 font-semibold">
                              {nsThuocPb.length} người
                            </span>
                          </div>
                          {soChon > 0 && (
                            <span className="text-[11px] font-bold text-indigo-600">
                              Đã chọn {soChon}/{nsThuocPb.length}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {nsThuocPb.map((ns) => {
                            const laNQL = ns.id === nguoiQuanLyId;
                            const laNPT = ns.id === nguoiPhuTrachId;
                            const daChon = dsHoTroDangChon.includes(ns.id);
                            return (
                              <button
                                key={ns.id}
                                type="button"
                                disabled={laNQL || laNPT}
                                onClick={() => toggleNguoiHoTro(ns.id)}
                                className={cn(
                                  'group flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition select-none text-left w-full',
                                  daChon
                                    ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                                  (laNQL || laNPT) && 'opacity-70 bg-slate-50/60 cursor-not-allowed'
                                )}
                              >
                                <div
                                  className={cn(
                                    'size-4.5 shrink-0 rounded-[5px] border flex items-center justify-center transition',
                                    daChon
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                                  )}
                                >
                                  <CheckCircle2 className="size-3" strokeWidth={3} />
                                </div>
                                <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 truncate">{ns.ho_va_ten}</div>
                                  <div className="text-[10.5px] text-slate-500 truncate">
                                    {laNQL && <span className="font-bold text-amber-700 mr-1">[QL]</span>}
                                    {laNPT && <span className="font-bold text-indigo-700 mr-1">[PIC]</span>}
                                    {ns.chuc_vu ? ns.chuc_vu : String(ns.vai_tro || 'Nhân viên').replace(/_/g, ' ')}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Phòng ban chưa phân loại hoặc nhân sự không thuộc phòng ban nào */}
                  {dsNS.filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id)).length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Building2 className="size-3.5 text-slate-400 shrink-0" />
                          <span>Chưa phân phòng ban / Khác</span>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {dsNS
                          .filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id))
                          .map((ns) => {
                            const laNQL = ns.id === nguoiQuanLyId;
                            const laNPT = ns.id === nguoiPhuTrachId;
                            const daChon = dsHoTroDangChon.includes(ns.id);
                            return (
                              <button
                                key={ns.id}
                                type="button"
                                disabled={laNQL || laNPT}
                                onClick={() => toggleNguoiHoTro(ns.id)}
                                className={cn(
                                  'group flex items-center gap-2.5 rounded-xl border px-3 py-2 cursor-pointer transition select-none text-left w-full',
                                  daChon
                                    ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                                  (laNQL || laNPT) && 'opacity-70 bg-slate-50/60 cursor-not-allowed'
                                )}
                              >
                                <div
                                  className={cn(
                                    'size-4.5 shrink-0 rounded-[5px] border flex items-center justify-center transition',
                                    daChon
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                                  )}
                                >
                                  <CheckCircle2 className="size-3" strokeWidth={3} />
                                </div>
                                <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-800 truncate">{ns.ho_va_ten}</div>
                                  <div className="text-[10.5px] text-slate-500 truncate">
                                    {laNQL && <span className="font-bold text-amber-700 mr-1">[QL]</span>}
                                    {laNPT && <span className="font-bold text-indigo-700 mr-1">[PIC]</span>}
                                    {ns.chuc_vu ? ns.chuc_vu : String(ns.vai_tro || 'Nhân viên').replace(/_/g, ' ')}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errors.danh_sach_nguoi_ho_tro_ids && (
                <div className="text-xs text-rose-600 font-semibold pt-1">
                  {String(errors.danh_sach_nguoi_ho_tro_ids.message ?? '')}
                </div>
              )}
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Target className="size-5 text-amber-600" />
              Tài chính & Thời gian
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-dk">Giá trị dự kiến (VND)</Nhan>
                <O
                  {...register('gia_tri_du_kien')}
                  id="f-hda-dk"
                  type="number"
                  min={0}
                  step={1000000}
                  icon_phai={DollarSign}
                  placeholder={laBackOffice ? '— ẩn theo phân quyền —' : '0'}
                  phan_hoi={errors.gia_tri_du_kien?.message ?? null}
                  disabled={laBackOffice}
                />
                {laBackOffice && (
                  <p className="text-xs text-slate-500 italic mt-1">
                  Thông tin tài chính được ẩn theo vai trò Back-office.
                </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-hd">Giá trị hợp đồng (VND)</Nhan>
                <O
                  {...register('gia_tri_hop_dong')}
                  id="f-hda-hd"
                  type="number"
                  min={0}
                  step={1000000}
                  icon_phai={DollarSign}
                  placeholder={laBackOffice ? '— ẩn theo phân quyền —' : '0 (nếu chưa ký HĐ)'}
                  phan_hoi={errors.gia_tri_hop_dong?.message ?? null}
                  disabled={laBackOffice}
                />
                {laBackOffice && (
                  <p className="text-xs text-slate-500 italic mt-1">
                  Thông tin tài chính được ẩn theo vai trò Back-office.
                </p>
                )}
              </div>
            </div>

            {coSoTien ? (
              <div className="grid gap-3 md:grid-cols-2 -mx-1">
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 px-4 py-3.5">
                  <div className="text-[11px] uppercase font-black text-indigo-600 tracking-[0.08em] mb-1">
                    Giá trị dự kiến
                  </div>
                  <div className="text-xl md:text-2xl font-black text-indigo-900">
                    {laBackOffice ? '***' : DINH_DANG_SO_TIEN(watchDK)} <span className="text-sm font-semibold text-indigo-700">₫</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3.5">
                  <div className="text-[11px] uppercase font-black text-emerald-600 tracking-[0.08em] mb-1">
                    Giá trị hợp đồng
                  </div>
                  <div className="text-xl md:text-2xl font-black text-emerald-900">
                    {laBackOffice ? '***' : DINH_DANG_SO_TIEN(watchHD)} <span className="text-sm font-semibold text-emerald-700">₫</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-ngay">Ngày tạo hồ sơ</Nhan>
                <O
                  {...register('ngay_tao_ho_so')}
                  id="f-hda-ngay"
                  type="date"
                  icon_trai={CalendarDays}
                  phan_hoi={errors.ngay_tao_ho_so?.message ?? null}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-th">Thời hạn hoàn thành (dự kiến)</Nhan>
                <O
                  {...register('thoi_han_hoan_thanh')}
                  id="f-hda-th"
                  type="date"
                  icon_trai={CalendarDays}
                  phan_hoi={errors.thoi_han_hoan_thanh?.message ?? null}
                />
              </div>
            </div>

            {laSua ? (
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-tt">Trạng thái hồ sơ</Nhan>
                <Controller
                  name="trang_thai"
                  control={control}
                  render={({ field }) => (
                    <Chon {...field} id="f-hda-tt">
                      <option value="hoat_dong">Hoạt động — đang theo dõi</option>
                      <option value="da_xoa">Đã xóa (ẩn khỏi danh sách mặc định)</option>
                    </Chon>
                  )}
                />
              </div>
            ) : null}
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>

        <The_Chuc_Nang>
          <The_Chuc_Nang_Header>
            <The_Chuc_Nang_Tieu_De className="text-base flex items-center gap-2">
              <Edit3 className="size-5 text-slate-600" />
              Mô tả & Ghi chú
            </The_Chuc_Nang_Tieu_De>
          </The_Chuc_Nang_Header>
          <The_Chuc_Nang_Noi_Dung className="space-y-4">
            <div className="space-y-1.5">
              <Nhan htmlFor="f-hda-mota">Mô tả chi tiết / Phạm vi công việc</Nhan>
              <O
                {...register('mo_ta')}
                id="f-hda-mota"
                type="textarea"
                placeholder="Mô tả phạm vi, yêu cầu, mục tiêu của dự án..."
                phan_hoi={errors.mo_ta?.message ?? null}
              />
            </div>
            <div className="space-y-1.5">
              <Nhan htmlFor="f-hda-ghichu">Ghi chú nội bộ</Nhan>
              <O
                {...register('ghi_chu')}
                id="f-hda-ghichu"
                type="textarea"
                placeholder="Thông tin thêm, lời nhắc, điểm cần chú ý..."
                phan_hoi={errors.ghi_chu?.message ?? null}
              />
            </div>
          </The_Chuc_Nang_Noi_Dung>
        </The_Chuc_Nang>
      </form>
    </Ban_Ve>
  );
}
