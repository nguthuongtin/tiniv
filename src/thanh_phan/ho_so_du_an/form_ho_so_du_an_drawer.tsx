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
  Search,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Loader2,
  Briefcase,
  Lightbulb
} from 'lucide-react';
import { ModalHuongDanDatTen } from '../chung/modal_huong_dan_dat_ten';
import type {
  CapNhatHoSoDuAnDTO,
  TaoMoiHoSoDuAnDTO
} from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type { HoSoDuAn, GiaiDoanDuAn, MucDoTiemNangKyHopDong } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh, PhongBan } from '../../thu_vien/types/nhan_su';
import { danhSachKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import {
  Ban_Ve,
  O,
  O_NhapTien,
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

const DOC_TIEN_RUT_GON = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  if (!n || n <= 0) return '';
  if (n >= 1_000_000_000) {
    const ty = (n / 1_000_000_000).toFixed(2).replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1');
    return `(~ ${ty} tỷ VNĐ)`;
  }
  if (n >= 1_000_000) {
    const tr = (n / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `(~ ${tr} triệu VNĐ)`;
  }
  return '';
};

const SCHEMA_HO_SO_DU_AN = z
  .object({
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
    giai_doan: z.string().min(1, 'Chọn giai đoạn dự án'),
    muc_do_tiem_nang: z.enum(['rat_cao', 'cao', 'trung_binh', 'thap', 'rat_thap'], {
      required_error: 'Chọn mức tiềm năng'
    }),
    gia_tri_du_kien: z.coerce.number().min(0, 'Giá trị không được âm').optional(),
    gia_tri_hop_dong: z.coerce.number().min(0, 'Giá trị không được âm').optional(),
    nguoi_quan_ly_id: z.string().trim().nullable().optional(),
    nguoi_phu_trach_id: z.string().trim().nullable().optional(),
    danh_sach_nguoi_ho_tro_ids: z.string().array().default([]),
    san_pham_khac_mo_ta: z.string().max(500, 'Tên sản phẩm quá dài').trim().nullable().optional(),
    ngay_tao_ho_so: z.string().max(30, 'Ngày tiếp cận không hợp lệ').nullable().optional(),
    thoi_han_hoan_thanh: z.string().max(30, 'Thời hạn không hợp lệ').nullable().optional(),
    mo_ta: z.string().max(2000, 'Mô tả quá dài (tối đa 2000 ký tự)').trim().nullable().optional(),
    ghi_chu: z.string().max(1000, 'Ghi chú quá dài (tối đa 1000 ký tự)').trim().nullable().optional(),
    trang_thai: z.enum(['hoat_dong', 'da_xoa']).optional()
  })
  .superRefine((data, ctx) => {
    if (data.ngay_tao_ho_so && data.thoi_han_hoan_thanh) {
      if (data.thoi_han_hoan_thanh < data.ngay_tao_ho_so) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['thoi_han_hoan_thanh'],
          message: 'Ngày dự kiến ký HĐ không được trước ngày tiếp cận dự án'
        });
      }
    }
  });

type GiaTriForm = z.infer<typeof SCHEMA_HO_SO_DU_AN>;

const layNgayHienTaiVN = (): string => {
  const now = new Date();
  const nam = now.getFullYear();
  const thang = String(now.getMonth() + 1).padStart(2, '0');
  const ngay = String(now.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
};

const GIA_TRI_MAC_DINH: GiaTriForm = {
  ma_ho_so: null,
  ten_du_an: '',
  khach_hang_id: null,
  nguoi_lien_he_id: null,
  chi_nhanh_id: null,
  phong_ban_id: null,
  giai_doan: 'moi_tao',
  muc_do_tiem_nang: 'trung_binh',
  gia_tri_du_kien: 0,
  gia_tri_hop_dong: 0,
  nguoi_quan_ly_id: null,
  nguoi_phu_trach_id: null,
  danh_sach_nguoi_ho_tro_ids: [],
  san_pham_khac_mo_ta: null,
  ngay_tao_ho_so: layNgayHienTaiVN(),
  thoi_han_hoan_thanh: null,
  mo_ta: null,
  ghi_chu: null,
  trang_thai: 'hoat_dong'
};

const CAC_MUC_FORM = [
  { id: 'sec-thong-tin-chinh', label: '1. Thông tin chính' },
  { id: 'sec-khach-hang-co-cau', label: '2. Khách hàng & Cơ cấu' },
  { id: 'sec-phan-cong-nhan-su', label: '3. Phân công nhân sự' },
  { id: 'sec-tai-chinh-thoi-gian', label: '4. Tài chính & Thời hạn' },
  { id: 'sec-mo-ta-ghi-chu', label: '5. Mô tả & Ghi chú' }
];

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
  const [dangTaiDanhMuc, setDangTaiDanhMuc] = useState<boolean>(false);
  const [tuKhoaNS, setTuKhoaNS] = useState<string>('');

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
  const [moModalQuyChuan, setMoModalQuyChuan] = useState(false);

  const tenKhachHangDangChon = useMemo(() => {
    if (!khachHangDangChon) return null;
    const kh = dsKH.find((x) => x.id === khachHangDangChon);
    return kh?.ten_khach_hang || null;
  }, [dsKH, khachHangDangChon]);

  // Load danh mục nền tảng khi mở form (bỏ sản phẩm/dịch vụ để tối ưu tốc độ)
  useEffect(() => {
    if (!mo) return;
    let huy = false;
    setDangTaiDanhMuc(true);
    void (async () => {
      try {
        const [kq1, kq2, kq3, kq4] = await Promise.all([
          danhSachKhachHang({ trang_thai: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachChiNhanh(),
          danhSachPhongBan()
        ]);
        if (!huy) {
          setDsKH(kq1.mang);
          setDsNS(kq2.mang);
          setDsChiNhanh(kq3.mang);
          setDsPhongBan(kq4.mang);
        }
      } catch (err) {
        console.error('[FormHoSoDuAnDrawer] Loi tai danh muc:', err);
      } finally {
        if (!huy) setDangTaiDanhMuc(false);
      }
    })();
    return () => {
      huy = true;
    };
  }, [mo]);

  // Load người liên hệ theo khách hàng
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

  // Khởi tạo form khi sửa hoặc tạo mới
  useEffect(() => {
    if (!mo) return;
    if (dang_sua) {
      reset({
        ma_ho_so: dang_sua.ma_ho_so || null,
        ten_du_an: dang_sua.ten_du_an,
        khach_hang_id: dang_sua.khach_hang_id ?? null,
        nguoi_lien_he_id: dang_sua.nguoi_lien_he_id ?? null,
        chi_nhanh_id: dang_sua.chi_nhanh_id ?? null,
        phong_ban_id: dang_sua.phong_ban_id ?? null,
        giai_doan: (dang_sua.giai_doan as GiaiDoanDuAn) ?? 'moi_tao',
        muc_do_tiem_nang: (dang_sua.muc_do_tiem_nang as MucDoTiemNangKyHopDong) ?? 'trung_binh',
        gia_tri_du_kien: dang_sua.gia_tri_du_kien ?? 0,
        gia_tri_hop_dong: dang_sua.gia_tri_hop_dong ?? 0,
        nguoi_quan_ly_id: dang_sua.nguoi_quan_ly_id ?? null,
        nguoi_phu_trach_id: dang_sua.nguoi_phu_trach_id ?? null,
        danh_sach_nguoi_ho_tro_ids: Array.isArray(dang_sua.danh_sach_nguoi_ho_tro_ids)
          ? dang_sua.danh_sach_nguoi_ho_tro_ids
          : [],
        san_pham_khac_mo_ta: dang_sua.san_pham_khac_mo_ta ?? null,
        ngay_tao_ho_so: dang_sua.ngay_tao_ho_so ?? layNgayHienTaiVN(),
        thoi_han_hoan_thanh: dang_sua.thoi_han_hoan_thanh ?? null,
        mo_ta: dang_sua.mo_ta ?? null,
        ghi_chu: dang_sua.ghi_chu ?? null,
        trang_thai: dang_sua.trang_thai ?? 'hoat_dong'
      });
    } else {
      reset({
        ...GIA_TRI_MAC_DINH,
        chi_nhanh_id: nguoiDungHienTai?.chi_nhanh_id ?? null,
        phong_ban_id: nguoiDungHienTai?.phong_ban_id ?? null
      });
    }
    setTuKhoaNS('');
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

  // Danh sách nhân sự khả dụng làm người hỗ trợ (loại bỏ NQL và PIC để tránh rối)
  const dsUngVienHoTro = useMemo(() => {
    return dsNS.filter((ns) => ns.id !== nguoiQuanLyId && ns.id !== nguoiPhuTrachId);
  }, [dsNS, nguoiQuanLyId, nguoiPhuTrachId]);

  // Lọc danh sách nhân sự hỗ trợ theo từ khóa tìm kiếm
  const tuKhoaClean = tuKhoaNS.trim().toLowerCase();
  const dsUngVienFiltered = useMemo(() => {
    if (!tuKhoaClean) return dsUngVienHoTro;
    return dsUngVienHoTro.filter(
      (ns) =>
        (ns.ho_va_ten || '').toLowerCase().includes(tuKhoaClean) ||
        (ns.chuc_vu || '').toLowerCase().includes(tuKhoaClean) ||
        (ns.email || '').toLowerCase().includes(tuKhoaClean)
    );
  }, [dsUngVienHoTro, tuKhoaClean]);

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

  const chonTatCaTheoPhong = (nsList: NhanSu[]) => {
    const ids = nsList.map((x) => x.id);
    const tatCaDaChon = ids.every((id) => dsHoTroDangChon.includes(id));
    const tapHop = new Set(dsHoTroDangChon);
    if (tatCaDaChon) {
      ids.forEach((id) => tapHop.delete(id));
    } else {
      ids.forEach((id) => tapHop.add(id));
    }
    setValue('danh_sach_nguoi_ho_tro_ids', Array.from(tapHop), { shouldDirty: true });
  };

  const cuonDenMuc = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    // Tự động làm sạch: loại bỏ NQL hoặc PIC nếu vô tình còn trong ds hỗ trợ
    const dsHoTroSach = (values.danh_sach_nguoi_ho_tro_ids || []).filter(
      (id) => id && id !== values.nguoi_quan_ly_id && id !== values.nguoi_phu_trach_id
    );

    const duLieuChuan = {
      ...values,
      ten_du_an: values.ten_du_an.trim().toUpperCase(),
      ma_ho_so: (values.ma_ho_so ?? null) || null,
      khach_hang_id: (values.khach_hang_id ?? null) || null,
      nguoi_lien_he_id: (values.nguoi_lien_he_id ?? null) || null,
      chi_nhanh_id: (values.chi_nhanh_id ?? null) || null,
      phong_ban_id: (values.phong_ban_id ?? null) || null,
      san_pham_dich_vu_id: null,
      san_pham_khac_mo_ta: (values.san_pham_khac_mo_ta ?? null) || null,
      nguoi_quan_ly_id: (values.nguoi_quan_ly_id ?? null) || null,
      nguoi_phu_trach_id: (values.nguoi_phu_trach_id ?? null) || null,
      danh_sach_nguoi_ho_tro_ids: dsHoTroSach,
      mo_ta: (values.mo_ta ?? null) || null,
      ghi_chu: (values.ghi_chu ?? null) || null,
      thoi_han_hoan_thanh: (values.thoi_han_hoan_thanh ?? null) || null,
      ngay_tao_ho_so:
        values.ngay_tao_ho_so && values.ngay_tao_ho_so.length > 0
          ? values.ngay_tao_ho_so
          : layNgayHienTaiVN(),
      gia_tri_du_kien: Number(values.gia_tri_du_kien) || 0,
      gia_tri_hop_dong: Number(values.gia_tri_hop_dong) || 0,
      trang_thai: 'hoat_dong' as const
    };

    if (dang_sua) {
      await khi_luu({ id: dang_sua.id, ...duLieuChuan } as CapNhatHoSoDuAnDTO);
    } else {
      await khi_luu(duLieuChuan as TaoMoiHoSoDuAnDTO);
    }
  });

  return (
    <>
      <Ban_Ve
        mo={mo}
      onDong={khi_dong}
      kich_thuoc="xl"
      tieu_de={
        <div className="flex items-center gap-2.5">
          <div className="size-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center justify-center">
            {laSua ? <Edit3 className="size-4.5" /> : <FolderPlus className="size-4.5" />}
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-900 text-lg md:text-xl">
              {laSua ? 'Chỉnh sửa hồ sơ dự án' : 'Tạo hồ sơ dự án mới'}
            </div>
          </div>
        </div>
      }
      cuoi={
        <div className="w-full flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {!laSua ? (
              <Nut
                kieu="ghost"
                kich_thuoc="md"
                onClick={() => {
                  reset({
                    ...GIA_TRI_MAC_DINH,
                    chi_nhanh_id: nguoiDungHienTai?.chi_nhanh_id ?? null,
                    phong_ban_id: nguoiDungHienTai?.phong_ban_id ?? null
                  });
                }}
                type="button"
                icon_trai={RotateCcw}
                disabled={dang_xu_ly || isSubmitting || !isDirty}
                className="text-slate-600 hover:text-slate-900"
              >
                Làm mới
              </Nut>
            ) : null}
            <Nut kieu="ghost" kich_thuoc="md" onClick={khi_dong} type="button">
              Đóng
            </Nut>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="submit"
              form="form-ho-so-du-an"
              disabled={dang_xu_ly || !isDirty || isSubmitting || dangTaiDanhMuc}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs min-w-[140px]"
            >
              <Save className="size-4" />
              {dang_xu_ly ? 'Đang lưu...' : laSua ? 'Lưu thay đổi' : 'Tạo dự án'}
            </button>
          </div>
        </div>
      }
    >
      {loi_thong_bao ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2.5 mb-5 shadow-xs">
          <div className="size-7 rounded-xl bg-rose-100 text-rose-700 inline-flex shrink-0 items-center justify-center">
            <AlertCircle className="size-4" />
          </div>
          <div className="min-w-0 font-semibold pt-0.5">{loi_thong_bao}</div>
        </div>
      ) : null}

      {/* Thanh Quick Jump trên cùng */}
      <div className="sticky top-0 z-20 -mx-5 md:-mx-6 -mt-5 md:-mt-6 px-5 md:px-6 py-2.5 bg-background/95 backdrop-blur-sm border-b border-border mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase shrink-0 mr-1 hidden sm:inline">
            Chuyển nhanh:
          </span>
          {CAC_MUC_FORM.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => cuonDenMuc(item.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition shrink-0 border border-transparent hover:border-emerald-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {dangTaiDanhMuc ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="size-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium">Đang tải danh mục dữ liệu...</p>
        </div>
      ) : (
        <form id="form-ho-so-du-an" onSubmit={onSubmit} className="space-y-6">
          {/* 1. THÔNG TIN CHÍNH (ĐƯA LÊN ĐẦU TIÊN) */}
          <section id="sec-thong-tin-chinh" className="space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Thông tin cơ bản dự án
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Nhan bat_buoc htmlFor="f-hda-ten">
                      Tên dự án
                    </Nhan>
                    <button
                      type="button"
                      onClick={() => setMoModalQuyChuan(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full transition border border-emerald-200/60"
                      title="Xem quy chuẩn & hướng dẫn đặt tên dự án"
                    >
                      <Lightbulb className="size-3 text-amber-500 fill-amber-400" />
                      <span>Quy chuẩn đặt tên</span>
                    </button>
                  </div>
                  <O
                    {...register('ten_du_an', {
                      onChange: (e) => {
                        const upper = e.target.value.toUpperCase();
                        e.target.value = upper;
                        setValue('ten_du_an', upper);
                      }
                    })}
                    id="f-hda-ten"
                    type="text"
                    className="text-base font-semibold text-slate-900 uppercase focus:border-emerald-600 focus:ring-emerald-500/20"
                    phan_hoi={errors.ten_du_an?.message ?? null}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <Nhan htmlFor="f-hda-ma">Mã hồ sơ dự án</Nhan>
                  <O
                    {...register('ma_ho_so')}
                    id="f-hda-ma"
                    type="text"
                    className="font-mono focus:border-emerald-600 focus:ring-emerald-500/20"
                    phan_hoi={errors.ma_ho_so?.message ?? null}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-1">
                <div className="space-y-1.5">
                  <Nhan bat_buoc htmlFor="f-hda-gd">
                    Giai đoạn hiện tại
                  </Nhan>
                  <Controller
                    name="giai_doan"
                    control={control}
                    render={({ field }) => (
                      <Chon {...field} id="f-hda-gd" phan_hoi={errors.giai_doan?.message ?? null}>
                        <option value="moi_tao">🌱 Mới tạo</option>
                        <option value="tiep_can">📞 Tiếp cận</option>
                        <option value="khao_sat">📋 Khảo sát</option>
                        <option value="len_giai_phap">💡 Lên giải pháp</option>
                        <option value="bao_gia">📊 Báo giá</option>
                        <option value="dam_phan">🤝 Đàm phán</option>
                        <option value="ky_hop_dong">✍️ Ký hợp đồng</option>
                        <option value="trien_khai">🚀 Triển khai</option>
                        <option value="nghiem_thu">✅ Nghiệm thu</option>
                        <option value="hoan_thanh">🎉 Hoàn thành</option>
                        <option value="tam_dung">⏸️ Tạm dừng</option>
                        <option value="huy">❌ Đã hủy</option>
                      </Chon>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Nhan bat_buoc htmlFor="f-hda-tn">
                    Mức tiềm năng ký HĐ
                  </Nhan>
                  <Controller
                    name="muc_do_tiem_nang"
                    control={control}
                    render={({ field }) => (
                      <Chon {...field} id="f-hda-tn" phan_hoi={errors.muc_do_tiem_nang?.message ?? null}>
                        <option value="rat_cao">🔥 Rất cao (&gt; 80% khả thi)</option>
                        <option value="cao">🟢 Cao (60% - 80%)</option>
                        <option value="trung_binh">🟡 Trung bình (40% - 60%)</option>
                        <option value="thap">🟠 Thấp (20% - 40%)</option>
                        <option value="rat_thap">⚪ Rất thấp (&lt; 20%)</option>
                      </Chon>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Nhan htmlFor="f-hda-sp">Sản phẩm / Dịch vụ</Nhan>
                <O
                  {...register('san_pham_khac_mo_ta')}
                  id="f-hda-sp"
                  type="text"
                  className="focus:border-emerald-600 focus:ring-emerald-500/20"
                  phan_hoi={errors.san_pham_khac_mo_ta?.message ?? null}
                />
              </div>
            </div>
          </section>

          {/* 2. KHÁCH HÀNG & CƠ CẤU TỔ CHỨC */}
          <section id="sec-khach-hang-co-cau" className="space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Khách hàng & Cơ cấu tổ chức
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Nhan htmlFor="f-hda-kh">Khách hàng (Doanh nghiệp/Đối tác)</Nhan>
                    <Controller
                      name="khach_hang_id"
                      control={control}
                      render={({ field }) => {
                        return (
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="Nhập tên hoặc MST để tìm..."
                              className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition"
                              defaultValue={dsKH.find(k => k.id === field.value)?.ten_khach_hang ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const matched = dsKH.find(k => k.ten_khach_hang === val);
                                if (matched) {
                                  field.onChange(matched.id);
                                } else {
                                  field.onChange(null);
                                }
                              }}
                              list="ds-kh-goi-y"
                              autoComplete="off"
                            />
                            <datalist id="ds-kh-goi-y">
                              {dsKH.map((kh) => (
                                <option key={kh.id} value={kh.ten_khach_hang}>
                                  {kh.ma_so_thue ? `MST: ${kh.ma_so_thue}` : ''}
                                </option>
                              ))}
                            </datalist>
                            <input type="hidden" value={field.value ?? ''} />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Search className="size-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Nhan htmlFor="f-hda-nlh">Người liên hệ đại diện</Nhan>
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
                            <option value="">— Vui lòng chọn khách hàng trước —</option>
                          ) : dsNLHFiltered.length === 0 ? (
                            <option value="">(Khách hàng này chưa có người liên hệ)</option>
                          ) : (
                            <>
                              <option value="">(Chưa chọn người liên hệ)</option>
                              {dsNLHFiltered.map((nlh) => (
                                <option key={nlh.id} value={nlh.id}>
                                  {nlh.ho_va_ten}
                                  {nlh.chuc_vu ? ` — ${nlh.chuc_vu}` : ''}
                                  {nlh.so_dien_thoai ? ` (${nlh.so_dien_thoai})` : ''}
                                </option>
                              ))}
                            </>
                          )}
                        </Chon>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-1 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <Nhan htmlFor="f-hda-cn">Chi nhánh phụ trách</Nhan>
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
                          <option value="">(Chưa phân chi nhánh)</option>
                          {dsChiNhanh.map((cn) => (
                            <option key={cn.id} value={cn.id}>
                              {cn.ten_chi_nhanh}
                              {cn.ma_chi_nhanh ? ` (${cn.ma_chi_nhanh})` : ''}
                            </option>
                          ))}
                        </Chon>
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Nhan htmlFor="f-hda-pb">Phòng ban chủ trì</Nhan>
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
                            <option value="">(Chi nhánh này chưa có phòng ban)</option>
                          ) : (
                            <>
                              <option value="">(Chưa chọn phòng ban)</option>
                              {dsPhongBanFiltered.map((pb) => (
                                <option key={pb.id} value={pb.id}>
                                  {pb.ten_phong_ban}
                                  {pb.ma_phong_ban ? ` (${pb.ma_phong_ban})` : ''}
                                </option>
                              ))}
                            </>
                          )}
                        </Chon>
                      )}
                    />
                  </div>
                </div>
              </div>
          </section>

          {/* 3. PHÂN CÔNG NHÂN SỰ */}
          <section id="sec-phan-cong-nhan-su" className="space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Quản lý & Phân công nhân sự
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Nhan htmlFor="f-hda-nql">Người quản lý dự án (Giám đốc / Trưởng phòng)</Nhan>
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
                          <option value="">(Chưa phân công quản lý)</option>
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
                          {dsNS.filter((ns) => !ns.phong_ban_id).length > 0 && (
                            <optgroup label="🏢 Chưa phân phòng ban">
                              {dsNS
                                .filter((ns) => !ns.phong_ban_id)
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
                    <Nhan htmlFor="f-hda-npt">Người phụ trách chính (PIC - Trực tiếp thực hiện)</Nhan>
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
                          <option value="">(Chưa phân công PIC)</option>
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
                          {dsNS.filter((ns) => !ns.phong_ban_id).length > 0 && (
                            <optgroup label="🏢 Chưa phân phòng ban">
                              {dsNS
                                .filter((ns) => !ns.phong_ban_id)
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
                </div>

                {/* Danh sách người hỗ trợ */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <UserPlus className="size-4 text-indigo-600" />
                        Danh sách nhân sự hỗ trợ
                        {dsHoTroDangChon.length > 0 && (
                          <span className="rounded-full bg-indigo-600 text-white text-[11px] px-2 py-0.5 font-bold ml-1">
                            {dsHoTroDangChon.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ô tìm kiếm nhân sự nhanh */}
                    <div className="relative w-full sm:w-64">
                      <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={tuKhoaNS}
                        onChange={(e) => setTuKhoaNS(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  {dsNS.length === 0 ? (
                    <div className="text-xs text-slate-500 italic rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center">
                      Chưa có dữ liệu nhân sự trên hệ thống.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2.5 md:p-3.5">
                      {dsPhongBan.map((pb) => {
                        const nsThuocPb = dsUngVienFiltered.filter((ns) => ns.phong_ban_id === pb.id);
                        if (nsThuocPb.length === 0) return null;
                        const soChon = nsThuocPb.filter((ns) => dsHoTroDangChon.includes(ns.id)).length;
                        const tatCaDaChon = soChon === nsThuocPb.length;

                        return (
                          <div key={pb.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                <Building2 className="size-3.5 text-emerald-700 shrink-0" />
                                <span>{pb.ten_phong_ban}</span>
                                {pb.ma_phong_ban && <span className="text-slate-400 font-mono">({pb.ma_phong_ban})</span>}
                                <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 font-semibold">
                                  {nsThuocPb.length} người
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                {soChon > 0 && (
                                  <span className="text-[11px] font-bold text-emerald-700">
                                    Đã chọn {soChon}/{nsThuocPb.length}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => chonTatCaTheoPhong(nsThuocPb)}
                                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                                >
                                  {tatCaDaChon ? 'Bỏ chọn phòng' : 'Chọn cả phòng'}
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                              {nsThuocPb.map((ns) => {
                                const daChon = dsHoTroDangChon.includes(ns.id);
                                return (
                                  <button
                                    key={ns.id}
                                    type="button"
                                    onClick={() => toggleNguoiHoTro(ns.id)}
                                    className={cn(
                                      'group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 cursor-pointer transition select-none text-left w-full min-h-[44px]',
                                      daChon
                                        ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'size-4 shrink-0 rounded-[4px] border flex items-center justify-center transition',
                                        daChon
                                          ? 'bg-emerald-700 border-emerald-700 text-white'
                                          : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                                      )}
                                    >
                                      <CheckCircle2 className="size-3" strokeWidth={3} />
                                    </div>
                                    <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-800 truncate">{ns.ho_va_ten}</div>
                                      <div className="text-[10px] text-slate-500 truncate">
                                        {ns.chuc_vu || String(ns.vai_tro || 'Nhân viên').replace(/_/g, ' ')}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Nhân sự chưa gán phòng ban */}
                      {dsUngVienFiltered.filter((ns) => !ns.phong_ban_id).length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-2xs">
                          <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
                            Chưa phân phòng ban / Khác
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {dsUngVienFiltered
                              .filter((ns) => !ns.phong_ban_id)
                              .map((ns) => {
                                const daChon = dsHoTroDangChon.includes(ns.id);
                                return (
                                  <button
                                    key={ns.id}
                                    type="button"
                                    onClick={() => toggleNguoiHoTro(ns.id)}
                                    className={cn(
                                      'group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 cursor-pointer transition select-none text-left w-full min-h-[44px]',
                                      daChon
                                        ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'size-4 shrink-0 rounded-[4px] border flex items-center justify-center transition',
                                        daChon
                                          ? 'bg-emerald-700 border-emerald-700 text-white'
                                          : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                                      )}
                                    >
                                      <CheckCircle2 className="size-3" strokeWidth={3} />
                                    </div>
                                    <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-slate-800 truncate">{ns.ho_va_ten}</div>
                                      <div className="text-[10px] text-slate-500 truncate">
                                        {ns.chuc_vu || 'Nhân viên'}
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
                </div>
              </div>
          </section>

          {/* 4. TÀI CHÍNH & THỜI HẠN */}
          <section id="sec-tai-chinh-thoi-gian" className="space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Kế hoạch tài chính & Thời hạn
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Nhan htmlFor="f-hda-dk">Giá trị dự kiến (VND)</Nhan>
                  <Controller
                    control={control}
                    name="gia_tri_du_kien"
                    render={({ field }) => (
                      <O_NhapTien
                        id="f-hda-dk"
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        icon_phai={DollarSign}
                        phan_hoi={errors.gia_tri_du_kien?.message ?? null}
                        disabled={laBackOffice}
                      />
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Nhan htmlFor="f-hda-hd">Giá trị hợp đồng (VND)</Nhan>
                  <Controller
                    control={control}
                    name="gia_tri_hop_dong"
                    render={({ field }) => (
                      <O_NhapTien
                        id="f-hda-hd"
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        icon_phai={DollarSign}
                        phan_hoi={errors.gia_tri_hop_dong?.message ?? null}
                        disabled={laBackOffice}
                      />
                    )}
                  />
                </div>
              </div>

              {coSoTien && !laBackOffice ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                    <div className="text-[10.5px] uppercase font-bold text-emerald-800 tracking-wider mb-0.5">
                      Dự kiến: {DINH_DANG_SO_TIEN(watchDK)} ₫
                    </div>
                    <div className="text-xs font-semibold text-emerald-950">
                      {DOC_TIEN_RUT_GON(watchDK) || 'Chưa nhập số tiền'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3">
                    <div className="text-[10.5px] uppercase font-bold text-teal-800 tracking-wider mb-0.5">
                      Hợp đồng: {DINH_DANG_SO_TIEN(watchHD)} ₫
                    </div>
                    <div className="text-xs font-semibold text-teal-950">
                      {DOC_TIEN_RUT_GON(watchHD) || 'Chưa ký hợp đồng chính thức'}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <Nhan htmlFor="f-hda-ngay">Ngày tiếp cận dự án</Nhan>
                  <O
                    {...register('ngay_tao_ho_so')}
                    id="f-hda-ngay"
                    type="date"
                    icon_trai={CalendarDays}
                    phan_hoi={errors.ngay_tao_ho_so?.message ?? null}
                  />
                </div>
                <div className="space-y-1.5">
                  <Nhan htmlFor="f-hda-th">Ngày dự kiến ký HĐ</Nhan>
                  <O
                    {...register('thoi_han_hoan_thanh')}
                    id="f-hda-th"
                    type="date"
                    icon_trai={CalendarDays}
                    phan_hoi={errors.thoi_han_hoan_thanh?.message ?? null}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 5. MÔ TẢ & GHI CHÚ */}
          <section id="sec-mo-ta-ghi-chu" className="space-y-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                5. Mô tả & Ghi chú nội bộ
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-mota">Mô tả chi tiết / Phạm vi dự án</Nhan>
                <O
                  {...register('mo_ta')}
                  id="f-hda-mota"
                  type="textarea"
                  rows={3}
                  phan_hoi={errors.mo_ta?.message ?? null}
                />
              </div>
              <div className="space-y-1.5">
                <Nhan htmlFor="f-hda-ghichu">Ghi chú nội bộ</Nhan>
                <O
                  {...register('ghi_chu')}
                  id="f-hda-ghichu"
                  type="textarea"
                  rows={2}
                  phan_hoi={errors.ghi_chu?.message ?? null}
                />
              </div>
            </div>
          </section>
        </form>
      )}
      </Ban_Ve>

      <ModalHuongDanDatTen
        mo={moModalQuyChuan}
        onDong={() => setMoModalQuyChuan(false)}
        loaiMacDinh="du_an"
        tenKhachHangHienTai={tenKhachHangDangChon}
        onChonMau={(mau) => {
          setValue('ten_du_an', mau.toUpperCase(), { shouldValidate: true, shouldDirty: true });
        }}
      />
    </>
  );
}
