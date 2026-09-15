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
  MoreHorizontal,
  User,
  Calendar as CalendarIcon
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
  trang_thai: 'hoat_dong'
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
  const mauMap = {
    primary: 'from-primary/12 via-primary/6 to-transparent border-primary/20 text-primary',
    warning: 'from-warning/12 via-warning/6 to-transparent border-warning/20 text-warning',
    success: 'from-success/12 via-success/6 to-transparent border-success/20 text-success',
    danger: 'from-danger/12 via-danger/6 to-transparent border-danger/20 text-danger'
  };
  return (
    <div
      className={cn(
        'rounded-[12px] sm:rounded-[var(--radius-card)] border bg-gradient-to-br p-2 sm:p-5 flex flex-col gap-1.5 sm:gap-3.5 shadow-sm sm:shadow-[var(--shadow-card)]',
        mauMap[mau]
      )}
    >
      <div className="flex items-center justify-between gap-1 sm:gap-3">
        <div className="text-[10px] sm:text-[13px] font-bold leading-none uppercase tracking-wide sm:tracking-wider opacity-90 truncate flex-1">
          {label}
        </div>
        <div className="size-5 sm:size-10 shrink-0 rounded-md sm:rounded-[var(--radius-button)] bg-background/80 border border-border inline-flex items-center justify-center">
          <Icon className="size-3 sm:size-5" strokeWidth={2.25} />
        </div>
      </div>
      <div
        className={cn(
          'font-black tracking-tight leading-none break-words tabular-nums',
          giaTriTien ? 'text-[15px] sm:text-[22px]' : 'text-[18px] sm:text-[26px]'
        )}
      >
        {anGiaTri && giaTriTien
          ? '***'
          : giaTriTien
            ? DINH_DANG_TIEN(Number(giaTri))
            : giaTri}
      </div>
    </div>
  );
};

const TheHoSoDuAn = ({
  hda,
  ds_nhan_su,
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
  const npt = hda.nguoi_phu_trach_id && ds_nhan_su
    ? ds_nhan_su.find(n => n.id === hda.nguoi_phu_trach_id) ?? null
    : null;

  // Thanh màu tiến độ (progressBgClass)
  const progressBgClass = 
    gd.kieu === 'primary' ? 'bg-primary' :
    gd.kieu === 'success' ? 'bg-emerald-500' :
    gd.kieu === 'warning' ? 'bg-amber-500' :
    gd.kieu === 'danger' ? 'bg-rose-500' : 'bg-slate-300';

  const dsGiaiDoan = layDanhSachGiaiDoan();
  const index = dsGiaiDoan.findIndex(x => x.key === hda.giai_doan);
  const stt = index >= 0 ? index + 1 : 1;
  const phanTramTienDo = Math.round((stt / Math.max(dsGiaiDoan.length, 1)) * 100);

  return (
    <div
      onClick={() => router.push(`/ho-so-du-an/${hda.id}`)}
      className={cn(
        'relative rounded-[16px] border border-border/60 bg-white p-5 flex flex-col justify-between transition-all duration-300 hover:border-primary/40 hover:shadow-lg shadow-sm cursor-pointer group overflow-hidden h-full',
        hda.trang_thai === 'da_xoa' ? 'opacity-60 grayscale-[50%]' : 'hover:-translate-y-0.5'
      )}
    >
      {/* Thanh màu tiến độ (Top edge) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
        <div 
          className={cn("h-full transition-all duration-500", progressBgClass)} 
          style={{ width: `${phanTramTienDo}%` }} 
        />
      </div>

      <div className="mt-1">
        {/* Top row: Stage pill & More icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border-none shadow-xs',
              gd.kieu === 'primary' ? 'bg-primary/10 text-primary' :
              gd.kieu === 'success' ? 'bg-emerald-500/10 text-emerald-700' :
              gd.kieu === 'warning' ? 'bg-amber-500/10 text-amber-700' :
              gd.kieu === 'danger' ? 'bg-rose-500/10 text-rose-700' :
              'bg-slate-100 text-slate-600'
            )}
          >
            <span className={cn('size-2 rounded-full', gd.kieu !== 'muted' ? 'bg-current' : 'bg-slate-400')} />
            <span className="truncate max-w-[150px] tracking-wide">{gd.nhan}</span>
          </span>
          <MoreHorizontal className="size-5 text-slate-400 group-hover:text-slate-700 transition" />
        </div>

        {/* Project Name */}
        <h3
          className="font-bold text-[17px] text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug tracking-tight mb-2"
          title={hda.ten_du_an}
        >
          {hda.ten_du_an}
        </h3>

        {/* Customer */}
        {kh && (
          <div className="flex items-center gap-2 text-[13px] text-slate-500 truncate">
            <Building2 className="size-4 shrink-0 text-slate-400" />
            <span className="truncate font-medium" title={kh.ten_khach_hang}>
              {kh.ten_khach_hang}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[12px] text-slate-500 mb-1 font-medium">Giá trị dự kiến</div>
          <div className="text-[16px] font-black text-slate-900 tabular-nums tracking-tight">
            {anGiaTri ? '***' : DINH_DANG_TIEN_NGAN_GON(hda.gia_tri_du_kien)}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-slate-500 mb-1 font-medium">Cập nhật gần nhất</div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mt-0.5">
            <CalendarIcon className="size-3.5 text-slate-400" />
            {hda.ngay_cap_nhat ? formatNgay(hda.ngay_cap_nhat.slice(0, 10)) : '--/--/----'}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 overflow-hidden shadow-xs border border-white">
             {npt ? npt.ho_va_ten.charAt(0).toUpperCase() : <User className="size-4" />}
          </div>
          <div className="min-w-0">
             <div className="text-[13px] font-semibold text-slate-700 truncate">{npt?.ho_va_ten || 'Chưa gán'}</div>
             <div className="text-[11px] text-slate-500 font-medium">Phụ trách</div>
          </div>
        </div>
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

  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laBackOffice = ['hanh_chinh_van_phong'].includes(
    nguoiDungHienTai?.vai_tro ?? ''
  );

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
    window.addEventListener('ebms:ho_so_du_an:them_moi', moThemMoi);
    return () => window.removeEventListener('ebms:ho_so_du_an:them_moi', moThemMoi);
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
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3.5 sm:space-y-8">
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <CardThongKe
          label="Tổng số hồ sơ"
          giaTri={thongKe.tongSo}
          icon={FolderKanban}
          mau="primary"
        />
        <CardThongKe
          label="Đang thực hiện"
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
          label="Đã hủy / tạm dừng"
          giaTri={thongKe.soDaHuy}
          icon={AlertTriangle}
          mau="danger"
        />
        <CardThongKe
          label="Tổng giá trị dự kiến"
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
      ) : danhSach.length === 0 ? (
        <EmptyState onThemMoi={moThemMoi} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {danhSach.map((hda) => (
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
