'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  FolderKanban,
  CalendarDays,
  TrendingUp,
  Trash2,
  Pencil,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Target,
  Wallet,
  UserRound,
  Clock,
  FileText,
  Eye,
  Building2,
  User,
  Calendar as CalendarIcon,
  Folder,
  Coins,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { duocXemHoSoDuAn } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type {
  GiaiDoanDuAn,
  HoSoDuAn,
  TienDoDuAn
} from '../../../thu_vien/types/du_an';
import type { NhanSu } from '../../../thu_vien/types/nhan_su';
import type { KhachHang } from '../../../thu_vien/types/khach_hang';
import type {
  CapNhatHoSoDuAnDTO,
  DieuKienLocHoSoDuAn,
  TaoMoiHoSoDuAnDTO
} from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import {
  danhSachHoSoDuAn,
  xoaMemHoSoDuAn as xoaMem,
  taoHoSoDuAnMoi as themMoi,
  capNhatHoSoDuAn as capNhat,
  doiTrangThaiHoSoDuAn as doiTrangThai,
  doiGiaiDoanHoSoDuAn as doiGiaiDoan
} from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachKhachHang } from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachTienDoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import BoLocHoSoDuAn from '../../../thanh_phan/ho_so_du_an/bo_loc_ho_so_du_an';
import FormHoSoDuAnDrawer from '../../../thanh_phan/ho_so_du_an/form_ho_so_du_an_drawer';
import {
  Bo_Cuc_Trang,
  Nut,
  Hieu,
  Rong,
  DaiDien
} from '../../../thanh_phan/ui';
import { DANH_SACH_GIAI_DOAN_MAC_DINH, layCauHinhGiaiDoanTheoKey, layDanhSachGiaiDoan } from '../../../thu_vien/cau_hinh/giai_doan_du_an';
import { langNgheCauHinhGiaiDoanDuAn } from '../../../dich_vu/cau_hinh/dich_vu_cau_hinh_giai_doan_du_an';

const BO_LOC_MAC_DINH: DieuKienLocHoSoDuAn = {
  tuKhoa: null,
  khach_hang_id: null,
  giai_doan: 'tat_ca',
  muc_do_tiem_nang: 'tat_ca',
  nguoi_quan_ly_id: null,
  nguoi_phu_trach_id: null,
  chi_nhanh_id: null,
  phong_ban_id: null,
  trang_thai: 'tat_ca'
};

const GIOI_HAN_MAC_DINH = 100;

const TEN_GIAI_DOAN_MAC_DINH: Record<
  string,
  { nhan: string; kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger' }
> = Object.fromEntries(
  DANH_SACH_GIAI_DOAN_MAC_DINH.map(x => [x.key, { nhan: x.nhan_day_du, kieu: x.kieu }])
);

const TEN_TIEM_NANG: Record<
  string,
  { nhan: string; kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger' }
> = {
  rat_cao: { nhan: 'Rất cao', kieu: 'success' },
  cao: { nhan: 'Cao', kieu: 'success' },
  trung_binh: { nhan: 'TB', kieu: 'warning' },
  thap: { nhan: 'Thấp', kieu: 'warning' },
  rat_thap: { nhan: 'Rất thấp', kieu: 'danger' }
};

const DINH_DANG_TIEN = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  if (n === 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(n);
};

const DINH_DANG_TIEN_NGAN_GON = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  if (n === 0) return '0 ₫';
  const ty = Math.floor(n / 1_000_000_000);
  const duSauTy = Math.round((n % 1_000_000_000) / 1_000_000);
  if (ty >= 1) {
    if (duSauTy === 0) return `${ty} tỷ`;
    return `${ty} tỷ ${duSauTy} triệu`;
  }
  const trieu = Math.round(n / 1_000_000);
  if (trieu >= 1) return `${trieu} triệu`;
  const nghin = Math.round(n / 1_000);
  if (nghin >= 1) return `${nghin} nghìn`;
  return `${n} ₫`;
};

interface ThongBaoToast {
  id: number;
  dang: 'thanh_cong' | 'loi';
  noi_dung: string;
}

const EmptyState = ({ onThemMoi }: { onThemMoi: () => void }) => {
  return (
    <Rong
      icon_tuy_chinh={FolderKanban}
      nhan_tuy_chinh="Chưa có hồ sơ dự án nào"
      nhan_phu_tuy_chinh="Thêm hồ sơ dự án đầu tiên để bắt đầu quản lý pipeline kinh doanh"
      hanh_dong={
        <Nut kieu="primary" kich_thuoc="md" icon_trai={Plus} onClick={onThemMoi}>
          Thêm dự án
        </Nut>
      }
    />
  );
};

const CardThongKe = ({
  label,
  giaTri,
  giaTriTien = false,
  icon: Icon,
  mau,
  anGiaTri = false
}: {
  label: string;
  giaTri: string | number;
  giaTriTien?: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mau: 'primary' | 'warning' | 'success' | 'danger';
  anGiaTri?: boolean;
}) => {
  const iconTheme = {
    primary: 'bg-[#007AFF]/10 text-[#007AFF]',
    warning: 'bg-[#FF9500]/10 text-[#FF9500]',
    success: 'bg-[#34C759]/10 text-[#34C759]',
    danger: 'bg-[#FF3B30]/10 text-[#FF3B30]'
  };
  return (
    <div className="rounded-[20px] border border-slate-200/90 bg-white p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:shadow-md active:scale-[0.98]">
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-slate-500 truncate">
          {label}
        </span>
        <div className={cn('size-8 rounded-[11px] flex items-center justify-center shrink-0', iconTheme[mau])}>
          <Icon className="size-4" strokeWidth={2.2} />
        </div>
      </div>
      <div
        className={cn(
          'font-extrabold tracking-tight leading-none text-slate-900 mt-2.5 sm:mt-3',
          giaTriTien ? 'text-[16px] sm:text-[20px]' : 'text-[20px] sm:text-[24px]'
        )}
      >
        {anGiaTri && giaTriTien
          ? '***'
          : giaTriTien
            ? DINH_DANG_TIEN_NGAN_GON(Number(giaTri))
            : giaTri}
      </div>
    </div>
  );
};

const TheHoSoDuAn = ({
  hda,
  ds_khach_hang,
  tenGiaiDoan,
  anGiaTri
}: {
  hda: HoSoDuAn;
  ds_nhan_su?: NhanSu[];
  ds_khach_hang: KhachHang[];
  tien_do_cuoi_cung?: TienDoDuAn | null;
  tenGiaiDoan: Record<string, { nhan: string; kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger' }>;
  anGiaTri?: boolean;
  onSua?: (hda: HoSoDuAn) => void;
  onXoa?: (hda: HoSoDuAn) => void;
  dangXuLyXoa?: boolean;
}) => {
  const router = useRouter();
  const gd = tenGiaiDoan[hda.giai_doan] ?? {
    nhan: String(hda.giai_doan),
    kieu: 'muted' as const
  };
  const kh = hda.khach_hang_id
    ? ds_khach_hang.find((k) => k.id === hda.khach_hang_id) ?? null
    : null;

  const laHoanThanh = hda.giai_doan === 'hoan_thanh';
  const laTamDung = ['tam_dung', 'huy'].includes(String(hda.giai_doan)) || hda.trang_thai === 'da_xoa';

  const badgeStyle = laHoanThanh
    ? { text: 'Hoàn thành', bg: 'bg-[#007AFF]/10 text-[#007AFF]', dot: 'bg-[#007AFF]' }
    : laTamDung
    ? { text: 'Tạm dừng/Hủy', bg: 'bg-[#FF9500]/10 text-[#FF9500]', dot: 'bg-[#FF9500]' }
    : { text: gd.nhan || 'Đang chạy', bg: 'bg-[#34C759]/10 text-[#34C759]', dot: 'bg-[#34C759]' };

  return (
    <div
      onClick={() => router.push(`/ho-so-du-an/${hda.id}`)}
      className={cn(
        'relative rounded-[20px] border border-slate-200/80 bg-white p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer group active:scale-[0.99]',
        hda.trang_thai === 'da_xoa' && 'opacity-60 grayscale-[50%]'
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Blue Squircle Folder Icon */}
        <div className="size-11 sm:size-12 rounded-[16px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/15 shadow-2xs">
          <Folder className="size-5 sm:size-5.5 text-[#007AFF]" strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3
            className="font-bold text-[15px] sm:text-[16.5px] text-slate-900 group-hover:text-[#007AFF] transition-colors truncate tracking-tight"
            title={hda.ten_du_an}
          >
            {hda.ten_du_an}
          </h3>

          <div className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal truncate mt-0.5">
            KH: {kh?.ten_khach_hang || 'Chưa liên kết'}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 text-[11.5px] sm:text-[12.5px] text-slate-500 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
              <span>{hda.ngay_tao ? formatNgay(hda.ngay_tao.slice(0, 10)) : hda.ngay_cap_nhat ? formatNgay(hda.ngay_cap_nhat.slice(0, 10)) : '--/--/----'}</span>
            </span>
            <span className="text-slate-200">│</span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Coins className="size-3.5 text-slate-400 shrink-0" />
              <span>{anGiaTri ? '***' : DINH_DANG_TIEN_NGAN_GON(hda.gia_tri_du_kien)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Badge & Chevron */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11.5px] sm:text-[12px] font-semibold tracking-wide shrink-0',
            badgeStyle.bg
          )}
        >
          <span className={cn('size-1.5 rounded-full', badgeStyle.dot)} />
          <span className="truncate max-w-[90px] sm:max-w-[130px]">{badgeStyle.text}</span>
        </span>

        <ChevronRight className="size-4.5 sm:size-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>
  );
};

function TrangHoSoDuAn() {
  const router = useRouter();
  const [dangTai, setDangTai] = useState(true);
  const [danhSach, setDanhSach] = useState<HoSoDuAn[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [dsTienDo, setDsTienDo] = useState<TienDoDuAn[]>([]);
  const [dieukien, setDieukien] = useState<DieuKienLocHoSoDuAn>(BO_LOC_MAC_DINH);
  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSua, setDangSua] = useState<HoSoDuAn | null>(null);
  const [dangXuLyForm, setDangXuLyForm] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);
  const [dsToast, setDsToast] = useState<ThongBaoToast[]>([]);
  const [dangXuLyKhac, setDangXuLyKhac] = useState<string | null>(null);
  const [tenGiaiDoan, setTenGiaiDoan] = useState(TEN_GIAI_DOAN_MAC_DINH);
  const [kieuSapXep, setKieuSapXep] = useState<'moi_nhat' | 'cu_nhat' | 'gia_tri_cao' | 'ten_az'>('moi_nhat');

  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laBackOffice = ['hanh_chinh_van_phong'].includes(
    nguoiDungHienTai?.vai_tro ?? ''
  );

  const danhSachDaSapXep = useMemo(() => {
    const ds = [...danhSach];
    if (kieuSapXep === 'moi_nhat') {
      ds.sort((a, b) => (b.ngay_tao ?? '').localeCompare(a.ngay_tao ?? ''));
    } else if (kieuSapXep === 'cu_nhat') {
      ds.sort((a, b) => (a.ngay_tao ?? '').localeCompare(b.ngay_tao ?? ''));
    } else if (kieuSapXep === 'gia_tri_cao') {
      ds.sort((a, b) => (Number(b.gia_tri_du_kien) || 0) - (Number(a.gia_tri_du_kien) || 0));
    } else if (kieuSapXep === 'ten_az') {
      ds.sort((a, b) => (a.ten_du_an || '').localeCompare(b.ten_du_an || ''));
    }
    return ds;
  }, [danhSach, kieuSapXep]);

  const groupTienDoMoiNhatTheoDuAn = useMemo(() => {
    const map = new Map<string, TienDoDuAn>();
    for (const td of dsTienDo) {
      const hienCo = map.get(td.du_an_id);
      if (!hienCo || (td.ngay_tao ?? '') > (hienCo.ngay_tao ?? '')) {
        map.set(td.du_an_id, td);
      }
    }
    return map;
  }, [dsTienDo]);

  const thongKe = useMemo(() => {
    const dsGiaiDoan = layDanhSachGiaiDoan();
    const tongSo = danhSach.length;
    const gdKetThuc = new Set<string>(['hoan_thanh', 'tam_dung', 'huy']);
    const gdThucHien = dsGiaiDoan
      .filter((g) => !gdKetThuc.has(String(g.key)))
      .map((g) => String(g.key));
    const soDangThucHien = danhSach.filter(
      (h) => h.trang_thai !== 'da_xoa' && gdThucHien.includes(String(h.giai_doan))
    ).length;
    const soHoanThanh = danhSach.filter(
      (h) => h.trang_thai !== 'da_xoa' && String(h.giai_doan) === 'hoan_thanh'
    ).length;
    const soDaHuy = danhSach.filter(
      (h) =>
        h.trang_thai === 'da_xoa' ||
        String(h.giai_doan) === 'huy' ||
        String(h.giai_doan) === 'tam_dung'
    ).length;
    const tongGiaTri = danhSach.reduce(
      (sum, h) => sum + (Number(h.gia_tri_du_kien) || 0),
      0
    );
    return { tongSo, soDangThucHien, soHoanThanh, soDaHuy, tongGiaTri };
  }, [danhSach]);

  const themToast = useCallback(
    (dang: ThongBaoToast['dang'], noi_dung: string) => {
      const id = Date.now() + Math.random();
      setDsToast((m) => [...m, { id, dang, noi_dung }]);
      setTimeout(() => {
        setDsToast((m) => m.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const taiLaiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const kq = await danhSachHoSoDuAn(dieukien);
      const dsGoc = kq.mang ?? [];
      const dsLoc = dsGoc.filter((hda) => duocXemHoSoDuAn(nguoiDungHienTai, hda));
      setDanhSach(dsLoc);
    } catch (e) {
      console.error(e);
      themToast('loi', 'Lỗi tải danh sách hồ sơ dự án');
    } finally {
      setDangTai(false);
    }
  }, [dieukien, nguoiDungHienTai, themToast]);

  useEffect(() => {
    void (async () => {
      try {
        const [kqNS, kqKH, kqTD] = await Promise.all([
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachKhachHang({ trang_thai: 'hoat_dong' }),
          danhSachTienDoDuAn()
        ]);
        setDsNhanSu(kqNS.mang ?? []);
        setDsKhachHang(kqKH.mang ?? []);
        setDsTienDo(kqTD.mang ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    void taiLaiDuLieu();
  }, [taiLaiDuLieu]);

  useEffect(() => {
    const huyLangNghe = langNgheCauHinhGiaiDoanDuAn((c) => {
      setTenGiaiDoan(
        Object.fromEntries(
          c.danh_sach.map(x => [x.key, { nhan: x.nhan_day_du, kieu: x.kieu }])
        )
      );
    });
    return () => huyLangNghe();
  }, []);

  const moThemMoi = useCallback(() => {
    setDangSua(null);
    setLoiForm(null);
    setMoDrawer(true);
  }, []);

  useEffect(() => {
    const xuLy = () => moThemMoi();
    window.addEventListener('ebms:ho_so_du_an:them_moi', xuLy);
    return () => window.removeEventListener('ebms:ho_so_du_an:them_moi', xuLy);
  }, [moThemMoi]);

  const moSua = useCallback((hda: HoSoDuAn) => {
    setDangSua(hda);
    setLoiForm(null);
    setMoDrawer(true);
  }, []);

  const xuLyLuuForm = useCallback(
    async (dto: TaoMoiHoSoDuAnDTO | CapNhatHoSoDuAnDTO) => {
      setDangXuLyForm(true);
      setLoiForm(null);
      try {
        const credential =
          (useStoreXacThuc.getState() as any)?._layCredentialTam?.() ?? null;
        const nguoiTH =
          nguoiDungHienTai?.id
            ? {
                id: nguoiDungHienTai.id,
                chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id ?? null,
                phong_ban_id: nguoiDungHienTai.phong_ban_id ?? null,
                vai_tro: nguoiDungHienTai.vai_tro ?? null,
                email: credential?.email ?? null,
                matKhau: credential?.matKhau ?? null
              }
            : null;

        if (dangSua) {
          await capNhat(dto as CapNhatHoSoDuAnDTO, nguoiTH);
          themToast('thanh_cong', 'Đã cập nhật hồ sơ dự án');
          setMoDrawer(false);
          setDangSua(null);
          await taiLaiDuLieu();
        } else {
          const moi = await themMoi(dto as TaoMoiHoSoDuAnDTO, nguoiTH);
          themToast('thanh_cong', 'Đã thêm hồ sơ dự án mới');
          setMoDrawer(false);
          setDangSua(null);
          router.push(`/ho-so-du-an/${moi.id}`);
          return;
        }
      } catch (e) {
        const msg = (e as Error)?.message ?? 'Lỗi lưu dữ liệu';
        setLoiForm(msg);
        themToast('loi', msg);
      } finally {
        setDangXuLyForm(false);
      }
    },
    [dangSua, nguoiDungHienTai, taiLaiDuLieu, themToast]
  );

  const xuLyXoa = useCallback(
    async (hda: HoSoDuAn) => {
      if (!confirm(`Xác nhận xóa hồ sơ dự án "${hda.ten_du_an}"?`)) return;
      setDangXuLyKhac(hda.id);
      try {
        const credential =
          (useStoreXacThuc.getState() as any)?._layCredentialTam?.() ?? null;
        const nguoiTH =
          nguoiDungHienTai?.id
            ? {
                id: nguoiDungHienTai.id,
                chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id ?? null,
                phong_ban_id: nguoiDungHienTai.phong_ban_id ?? null
              }
            : null;
        await xoaMem(hda.id, nguoiTH);
        themToast('thanh_cong', 'Đã xóa hồ sơ dự án');
        await taiLaiDuLieu();
      } catch (e) {
        const msg = (e as Error)?.message ?? 'Lỗi xóa';
        themToast('loi', msg);
      } finally {
        setDangXuLyKhac(null);
      }
    },
    [nguoiDungHienTai, taiLaiDuLieu, themToast]
  );

  const xuLyDoiTrangThai = useCallback(
    async (hda: HoSoDuAn, trangThaiMoi: HoSoDuAn['trang_thai']) => {
      setDangXuLyKhac(hda.id);
      try {
        const nguoiTH =
          nguoiDungHienTai?.id
            ? {
                id: nguoiDungHienTai.id,
                chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id ?? null,
                phong_ban_id: nguoiDungHienTai.phong_ban_id ?? null
              }
            : null;
        await doiTrangThai(hda.id, trangThaiMoi, nguoiTH);
        themToast(
          'thanh_cong',
          `Đã ${trangThaiMoi === 'da_xoa' ? 'xóa' : 'khôi phục'} hồ sơ`
        );
        await taiLaiDuLieu();
      } catch (e) {
        themToast('loi', (e as Error)?.message ?? 'Lỗi');
      } finally {
        setDangXuLyKhac(null);
      }
    },
    [nguoiDungHienTai, taiLaiDuLieu, themToast]
  );

  const xuLyDoiGiaiDoan = useCallback(
    async (hda: HoSoDuAn, giaiDoanMoi: GiaiDoanDuAn) => {
      setDangXuLyKhac(hda.id);
      try {
        const nguoiTH =
          nguoiDungHienTai?.id
            ? {
                id: nguoiDungHienTai.id,
                chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id ?? null,
                phong_ban_id: nguoiDungHienTai.phong_ban_id ?? null
              }
            : null;
        await doiGiaiDoan(hda.id, giaiDoanMoi, nguoiTH);
        themToast('thanh_cong', 'Đã chuyển giai đoạn');
        await taiLaiDuLieu();
      } catch (e) {
        themToast('loi', (e as Error)?.message ?? 'Lỗi');
      } finally {
        setDangXuLyKhac(null);
      }
    },
    [nguoiDungHienTai, taiLaiDuLieu, themToast]
  );

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-6">
      {/* Summary 2 dòng tinh gọn trên Mobile */}
      <div className="sm:hidden bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
        {/* Dòng 1 — quy mô dự án */}
        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng dự án</span>
            <span className="font-extrabold text-slate-900 text-[15px] tabular-nums">{thongKe.tongSo}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Giá trị</span>
            <span className="font-extrabold text-[#007AFF] text-[15px] tabular-nums">
              {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(thongKe.tongGiaTri)}
            </span>
          </div>
        </div>

        {/* Dòng 2 — tình trạng */}
        <div className="flex items-center justify-between text-[12px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đang chạy</span>
            <span className="font-bold text-[#34C759] text-[13px] tabular-nums">{thongKe.soDangThucHien}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Hoàn thành</span>
            <span className="font-bold text-[#007AFF] text-[13px] tabular-nums">{thongKe.soHoanThanh}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Tạm dừng/Hủy</span>
            <span className="font-bold text-[#FF9500] text-[13px] tabular-nums">{thongKe.soDaHuy}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards đầy đủ trên Desktop */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        <CardThongKe
          label="Tổng dự án"
          giaTri={thongKe.tongSo}
          icon={FolderKanban}
          mau="primary"
        />
        <CardThongKe
          label="Đang chạy"
          giaTri={thongKe.soDangThucHien}
          icon={TrendingUp}
          mau="warning"
        />
        <CardThongKe
          label="Hoàn thành"
          giaTri={thongKe.soHoanThanh}
          icon={CheckCircle2}
          mau="success"
        />
        <CardThongKe
          label="Tạm dừng / Hủy"
          giaTri={thongKe.soDaHuy}
          icon={AlertTriangle}
          mau="danger"
        />
        <CardThongKe
          label="Tổng giá trị"
          giaTri={thongKe.tongGiaTri}
          giaTriTien={true}
          icon={Wallet}
          mau="warning"
          anGiaTri={laBackOffice}
        />
      </div>

      <BoLocHoSoDuAn
        gia_tri_hien_tai={dieukien}
        khi_thay_doi={setDieukien}
        ds_khach_hang={dsKhachHang}
        ds_nhan_su={dsNhanSu}
      />

      {dangTai ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="size-5 animate-spin" strokeWidth={2.25} />
          <span className="font-semibold">Đang tải danh sách...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <EmptyState onThemMoi={moThemMoi} />
      ) : (
        <div className="space-y-3">
          {/* Header danh sách chuẩn ảnh */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-[17px] sm:text-[19px] font-bold text-slate-900 tracking-tight">
              Danh sách dự án
            </h2>

            <div className="relative">
              <select
                value={kieuSapXep}
                onChange={(e) => setKieuSapXep(e.target.value as any)}
                aria-label="Sắp xếp danh sách dự án"
                className="appearance-none text-xs sm:text-[13px] font-semibold text-[#007AFF] bg-white border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-1.5 pr-7 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="moi_nhat">Mới nhất</option>
                <option value="cu_nhat">Cũ nhất</option>
                <option value="gia_tri_cao">Giá trị cao</option>
                <option value="ten_az">Tên A-Z</option>
              </select>
              <ChevronDown className="size-3.5 text-[#007AFF] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* List items chuẩn như ảnh */}
          <div className="space-y-3">
            {danhSachDaSapXep.map((hda) => (
              <TheHoSoDuAn
                key={hda.id}
                hda={hda}
                ds_nhan_su={dsNhanSu}
                ds_khach_hang={dsKhachHang}
                tien_do_cuoi_cung={
                  groupTienDoMoiNhatTheoDuAn.get(hda.id) ?? null
                }
                tenGiaiDoan={tenGiaiDoan}
                anGiaTri={laBackOffice}
                onSua={moSua}
                onXoa={xuLyXoa}
                dangXuLyXoa={dangXuLyKhac === hda.id}
              />
            ))}
          </div>
        </div>
      )}

      <FormHoSoDuAnDrawer
        mo={moDrawer}
        khi_dong={() => {
          setMoDrawer(false);
          setDangSua(null);
          setLoiForm(null);
        }}
        dang_sua={dangSua}
        khi_luu={xuLyLuuForm}
        dang_xu_ly={dangXuLyForm}
        loi_thong_bao={loiForm}
      />

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
        {dsToast.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-[var(--radius-card)] border px-4 py-3.5 shadow-[0_10px_40px_-10px_rgb(0,0,0,0.2)] flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-200',
              t.dang === 'thanh_cong'
                ? 'bg-success/5 border-success/20 text-foreground'
                : 'bg-danger/5 border-danger/20 text-foreground'
            )}
          >
            <div
              className={cn(
                'size-8 shrink-0 rounded-[var(--radius-button)] inline-flex items-center justify-center mt-0.5',
                t.dang === 'thanh_cong'
                  ? 'bg-success/15 text-success'
                  : 'bg-danger/15 text-danger'
              )}
            >
              {t.dang === 'thanh_cong' ? (
                <CheckCircle2 className="size-4.5" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="size-4.5" strokeWidth={2.5} />
              )}
            </div>
            <div className="min-w-0 flex-1 text-[13.5px] leading-snug font-semibold pt-0.5">
              {t.noi_dung}
            </div>
          </div>
        ))}
      </div>
    </Bo_Cuc_Trang>
  );
}

export default TrangHoSoDuAn;
