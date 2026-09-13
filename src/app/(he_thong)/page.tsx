'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  UsersRound,
  FolderKanban,
  FileText,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  User,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  CalendarDays,
  CalendarRange,
  ArrowUpRight,
  Loader2,
  CheckSquare,
  FolderPlus,
  UserPlus,
  FilePlus2,
  ArrowRight
} from 'lucide-react';
import { useStoreXacThuc } from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import { coQuyen, duocXemHoSoDuAn, duocXemBaoCaoCuaNhanVien } from '../../thu_vien/phan_quyen/kiem_tra_quyen';
import { Nut, Hieu } from '../../thanh_phan/ui';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { BaoCaoCongViec } from '../../thu_vien/types/bao_cao_cong_viec';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { danhSachHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachBaoCaoCongViec } from '../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';

interface ModuleItem {
  key: string;
  ten: string;
  mo_ta: string;
  mau: string;
  BieuTuong: any;
  duongDan: string;
  quyen?: string | string[];
  trang_thai: 'hoat_dong' | 'sap_ra_mat';
}

const DANH_MUC_MODULE: ModuleItem[] = [
  {
    key: 'khach_hang',
    ten: 'Khách hàng',
    mo_ta: 'Doanh nghiệp & người liên hệ',
    mau: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    BieuTuong: UsersRound,
    duongDan: '/khach-hang',
    trang_thai: 'hoat_dong'
  },
  {
    key: 'du_an',
    ten: 'Hồ sơ dự án',
    mo_ta: 'Vòng đời & pipeline bán hàng',
    mau: 'bg-primary/10 text-primary',
    BieuTuong: FolderKanban,
    duongDan: '/ho-so-du-an',
    quyen: 'du_an.xem',
    trang_thai: 'hoat_dong'
  },
  {
    key: 'bao_cao_cv',
    ten: 'Báo cáo ngày',
    mo_ta: 'Báo cáo công việc & đề xuất',
    mau: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    BieuTuong: FileText,
    duongDan: '/bao-cao-cong-viec',
    quyen: ['bao_cao.xem', 'bao_cao.tao'],
    trang_thai: 'hoat_dong'
  },
  {
    key: 'ke_hoach',
    ten: 'Kế hoạch NVKD',
    mo_ta: 'Quản trị địa bàn & tác chiến tuần',
    mau: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    BieuTuong: CalendarRange,
    duongDan: '/ke-hoach',
    quyen: 'ke_hoach.xem',
    trang_thai: 'hoat_dong'
  },
  {
    key: 'nhan_su',
    ten: 'Nhân sự',
    mo_ta: 'Phòng ban & nhân viên',
    mau: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    BieuTuong: UserCog,
    duongDan: '/nhan-su',
    quyen: ['nhan_su.xem', 'nhan_su.quan_ly'],
    trang_thai: 'hoat_dong'
  },
  {
    key: 'bao_cao',
    ten: 'Báo cáo TK',
    mo_ta: 'Thống kê tổng hợp & KPI',
    mau: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    BieuTuong: BarChart3,
    duongDan: '/bao-cao',
    quyen: 'bao_cao.xem',
    trang_thai: 'hoat_dong'
  },
  {
    key: 'quan_tri',
    ten: 'Quản trị',
    mo_ta: 'Chi nhánh, vai trò & danh mục',
    mau: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    BieuTuong: Settings,
    duongDan: '/quan-tri',
    quyen: 'he_thong.quan_tri',
    trang_thai: 'hoat_dong'
  }
];

const THAO_TAC_NHANH = [
  {
    tieu_de: 'Tạo hồ sơ dự án',
    mo_ta: 'Khởi tạo dự án, giai đoạn & doanh thu dự kiến',
    duongDan: '/ho-so-du-an',
    BieuTuong: FolderPlus,
    mau: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
  },
  {
    tieu_de: 'Thêm khách hàng',
    mo_ta: 'Tạo hồ sơ khách hàng & danh sách liên hệ',
    duongDan: '/khach-hang',
    BieuTuong: UserPlus,
    mau: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15'
  },
  {
    tieu_de: 'Lập kế hoạch NVKD',
    mo_ta: 'Đặt mục tiêu địa bàn B2G & cam kết tác chiến tuần',
    duongDan: '/ke-hoach',
    BieuTuong: CalendarRange,
    mau: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/15'
  },
  {
    tieu_de: 'Gửi báo cáo ngày',
    mo_ta: 'Ghi nhận công việc hoàn thành & khó khăn hỗ trợ',
    duongDan: '/bao-cao-cong-viec',
    BieuTuong: FilePlus2,
    mau: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15'
  }
] as const;

interface ToastNho {
  id: number;
  dang: 'hoat_dong' | 'thong_bao';
  noi_dung: string;
}

const TEN_VAI_TRO: Record<string, string> = {
  quan_tri_he_thong: 'Quản trị hệ thống',
  giam_doc: 'Giám đốc',
  truong_phong: 'Trưởng phòng',
  nhan_vien_kinh_doanh: 'Nhân viên kinh doanh',
  nhan_vien_ky_thuat: 'Nhân viên kỹ thuật',
  hanh_chinh_van_phong: 'Hành chính văn phòng'
};

const DANH_SACH_12_GIAI_DOAN: {
  key: string;
  nhan: string;
  kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger';
}[] = [
  { key: 'moi_tao', nhan: 'Mới tạo', kieu: 'muted' },
  { key: 'tiep_can', nhan: 'Tiếp cận', kieu: 'primary' },
  { key: 'khao_sat', nhan: 'Khảo sát', kieu: 'primary' },
  { key: 'len_giai_phap', nhan: 'Lên GP', kieu: 'primary' },
  { key: 'bao_gia', nhan: 'Báo giá', kieu: 'warning' },
  { key: 'dam_phan', nhan: 'Đàm phán', kieu: 'warning' },
  { key: 'ky_hop_dong', nhan: 'Ký HĐ', kieu: 'primary' },
  { key: 'trien_khai', nhan: 'Triển khai', kieu: 'primary' },
  { key: 'nghiem_thu', nhan: 'Nghiệm thu', kieu: 'primary' },
  { key: 'hoan_thanh', nhan: 'Hoàn thành', kieu: 'success' },
  { key: 'tam_dung', nhan: 'Tạm dừng', kieu: 'warning' },
  { key: 'huy', nhan: 'Đã hủy', kieu: 'danger' }
];

const MAU_KIEU_GD: Record<string, string> = {
  muted: 'bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted',
  primary: 'bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary',
  success: 'bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success',
  warning: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning',
  danger: 'bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger'
};

const dauTiengVietHoa = (s?: string | null) => (s ?? '').trim().charAt(0).toUpperCase();

export default function TrangChu() {
  const { nguoiDungHienTai, thucHienDangXuat } = useStoreXacThuc();
  const [dangXuLyDangXuat, setDangXuLyDangXuat] = React.useState(false);
  const [dsToast, setDsToast] = React.useState<ToastNho[]>([]);

  const hoTen = nguoiDungHienTai?.ho_va_ten ?? 'Người dùng';
  const vaiTro = nguoiDungHienTai?.vai_tro
    ? TEN_VAI_TRO[String(nguoiDungHienTai.vai_tro)] ?? String(nguoiDungHienTai.vai_tro)
    : 'Chưa xác định';
  const email = nguoiDungHienTai?.email ?? '';

  const xuLyDangXuat = async () => {
    try {
      setDangXuLyDangXuat(true);
      await thucHienDangXuat();
    } finally {
      setDangXuLyDangXuat(false);
    }
  };

  const themToastSoon = React.useCallback((tenModule: string) => {
    const id = Date.now() + Math.random();
    setDsToast((ds) => [
      ...ds,
      {
        id,
        dang: 'thong_bao',
        noi_dung: `Module "${tenModule}" đang được xây dựng, sẽ phát hành ở bản cập nhật tiếp theo.`
      }
    ]);
    setTimeout(() => {
      setDsToast((ds) => ds.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const soModuleHoatDong = DANH_MUC_MODULE.filter((m) => m.trang_thai === 'hoat_dong').length;
  const soModuleSoon = DANH_MUC_MODULE.length - soModuleHoatDong;

  const [dangTaiWidget, setDangTaiWidget] = React.useState(true);
  const [dsBccvMoiNhat, setDsBccvMoiNhat] = React.useState<BaoCaoCongViec[]>([]);
  const [dsHdaWidget, setDsHdaWidget] = React.useState<HoSoDuAn[]>([]);
  const [dsNsWidget, setDsNsWidget] = React.useState<NhanSu[]>([]);

  const dsModuleHienThi = React.useMemo(() => {
    return DANH_MUC_MODULE.filter((m) => {
      if (!m.quyen) return true;
      if (!nguoiDungHienTai) return false;
      if (nguoiDungHienTai.vai_tro === 'quan_tri_he_thong') return true;
      if (Array.isArray(m.quyen)) {
        return m.quyen.some((q) => coQuyen(nguoiDungHienTai, q));
      }
      return coQuyen(nguoiDungHienTai, m.quyen);
    });
  }, [nguoiDungHienTai]);

  React.useEffect(() => {
    let huy = false;
    (async () => {
      setDangTaiWidget(true);
      try {
        const [kqBccv, kqHda, kqNs] = await Promise.all([
          danhSachBaoCaoCongViec({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' })
        ]);
        const dsNs = kqNs.mang;
        const dsHdaLoc = kqHda.mang.filter((hda) => duocXemHoSoDuAn(nguoiDungHienTai, hda));
        const dsBccvLoc = kqBccv.mang.filter((b) => {
          const ns = dsNs.find((x) => x.id === b.nhan_vien_id);
          return duocXemBaoCaoCuaNhanVien(
            nguoiDungHienTai,
            ns ? { id: ns.id, phong_ban_id: ns.phong_ban_id } : { id: b.nhan_vien_id }
          );
        });

        const bccvSapXep = [...dsBccvLoc].sort((a, b) => {
          const t1 = new Date(a.ngay_cap_nhat || a.ngay_tao).getTime();
          const t2 = new Date(b.ngay_cap_nhat || b.ngay_tao).getTime();
          return t2 - t1;
        }).slice(0, 6);
        setDsBccvMoiNhat(bccvSapXep);
        setDsHdaWidget(dsHdaLoc);
        setDsNsWidget(dsNs);
      } finally {
        if (!huy) setDangTaiWidget(false);
      }
    })();
    return () => { huy = true; };
  }, [nguoiDungHienTai]);

  const layTenNguoiDung = (id?: string | null) => {
    if (!id) return '(Chưa có)';
    const ns = dsNsWidget.find((n) => n.id === id);
    return ns?.ho_va_ten ?? '(N/D)';
  };

  const layNoiDungTomTat = (b: BaoCaoCongViec) => {
    if (b.danh_sach_chi_tiet && b.danh_sach_chi_tiet.length > 0) {
      const ct0 = b.danh_sach_chi_tiet[0];
      return ct0.noi_dung;
    }
    return '(Chưa có nội dung chi tiết)';
  };

  const demGiaiDoan = (key: string) =>
    dsHdaWidget.filter((d) => String(d.giai_doan || 'moi_tao') === key).length;

  return (
    <div className="w-full max-w-none space-y-8">
      <section className="rounded-[var(--radius-card)] border border-border bg-background p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-[var(--shadow-card)]">
        <div className="flex-1 min-w-0 flex items-start gap-4">
          <div className="shrink-0 size-12 sm:size-14 rounded-[var(--radius-card)] bg-primary text-primary-foreground flex items-center justify-center text-lg font-extrabold shadow-[var(--shadow-card)]">
            {dauTiengVietHoa(hoTen) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              Hệ thống Quản lý Doanh nghiệp &amp; CRM
            </p>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
              Xin chào, <span className="text-primary">{hoTen.length > 26 ? hoTen.slice(0, 26) + '…' : hoTen}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Hieu kieu="primary">
                <Shield className="size-3 mr-1" />
                {vaiTro}
              </Hieu>
              {email && (
                <Hieu kieu="muted">
                  <User className="size-3 mr-1" />
                  {email}
                </Hieu>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end xl:items-center gap-2 w-full sm:w-auto">
          {coQuyen(nguoiDungHienTai, 'bao_cao.xem') && (
            <Link
              href="/bao-cao"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[var(--radius-button)] bg-primary/10 text-primary border border-primary/15 hover:bg-primary/15 transition text-sm font-semibold"
            >
              <BarChart3 className="size-4" />
              Báo cáo & Thống kê
            </Link>
          )}
          <Nut
            kieu="danger"
            icon_trai={dangXuLyDangXuat ? undefined : LogOut}
            onClick={xuLyDangXuat}
            disabled={dangXuLyDangXuat}
            className={dangXuLyDangXuat ? 'animate-pulse' : undefined}
          >
            {dangXuLyDangXuat ? 'Đang xử lý...' : 'Đăng xuất'}
          </Nut>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Phân hệ chức năng</h2>
          <span className="text-xs text-muted-foreground font-semibold">{dsModuleHienThi.length} phân hệ sẵn sàng</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {dsModuleHienThi.map((module) => {
            const { BieuTuong } = module;
            const laHoatDong = module.trang_thai === 'hoat_dong';
            const Wrapper: any = laHoatDong ? Link : 'button';
            const wrapperProps: any = laHoatDong
              ? { href: module.duongDan }
              : {
                  type: 'button',
                  onClick: () => themToastSoon(module.ten)
                };
            return (
              <Wrapper
                key={module.key}
                {...wrapperProps}
                className={cn(
                  'group rounded-[var(--radius-card)] border bg-background p-5 shadow-[var(--shadow-card)] transition',
                  'hover:border-primary/30 hover:shadow-[var(--shadow-pop)] active:scale-[0.99]',
                  laHoatDong ? 'border-border' : 'border-border opacity-80'
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-[var(--radius-input)] flex items-center justify-center shrink-0 mb-4',
                    module.mau
                  )}
                >
                  <BieuTuong className="size-[18px]" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-[15px] font-bold text-foreground truncate min-w-0 flex-1">
                    {module.ten}
                  </h3>
                  {laHoatDong ? (
                    <span className="inline-flex size-1.5 rounded-full bg-success shrink-0" />
                  ) : (
                    <span className="text-[11px] px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border inline-flex items-center font-bold">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {module.mo_ta}
                </p>
              </Wrapper>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-[var(--shadow-card)] xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning rounded-[var(--radius-input)] flex items-center justify-center">
                <FileText className="size-[18px]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Báo cáo ngày mới nhất</h3>
                <p className="text-xs text-muted-foreground mt-0.5 opacity-80">Dòng chảy cập nhật 6 BCCV gần đây</p>
              </div>
            </div>
            <Link href="/bao-cao-cong-viec" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0">
              Xem tất cả
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dangTaiWidget ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 mr-2 animate-spin" />
              Đang tải BCCV gần đây...
            </div>
          ) : dsBccvMoiNhat.length === 0 ? (
            <div className="py-8 text-center text-[13px] italic text-muted-foreground">
              Chưa có báo cáo công việc nào gần đây
            </div>
          ) : (
            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {dsBccvMoiNhat.map((b) => {
                const ten = layTenNguoiDung(b.nhan_vien_id);
                const nd = layNoiDungTomTat(b);
                const coKK = Boolean((b.kho_khan ?? '').trim().length > 0);
                return (
                  <li key={b.id} className="rounded-[var(--radius-input)] border border-border bg-muted/30 hover:bg-muted/60 transition px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="min-w-0 flex items-center gap-2">
                        <div className="size-7 rounded-full bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary flex items-center justify-center shrink-0 text-xs font-bold">
                          {(ten || '?').trim().charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate min-w-0">{ten}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {coKK && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning border border-warning/20 px-2 h-5 text-[10px] font-bold">
                            <AlertTriangle className="size-3" />
                            Khó khăn
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {(b.ngay_bao_cao || '').slice(5)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-foreground/90 line-clamp-2">{nd}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-[var(--shadow-card)] xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success rounded-[var(--radius-input)] flex items-center justify-center">
                <FolderKanban className="size-[18px]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Phân bổ 12 giai đoạn dự án</h3>
                <p className="text-xs text-muted-foreground mt-0.5 opacity-80">Tổng quan tất cả Hồ sơ dự án theo từng giai đoạn</p>
              </div>
            </div>
            <Link href="/ho-so-du-an" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0">
              Mở HĐA
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dangTaiWidget ? (
            <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
              <Loader2 className="size-4 mr-2 animate-spin" />
              Đang thống kê giai đoạn dự án...
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-3 gap-2.5">
              {DANH_SACH_12_GIAI_DOAN.map((gd) => {
                const sl = demGiaiDoan(gd.key);
                const mau = MAU_KIEU_GD[gd.kieu] ?? MAU_KIEU_GD.muted;
                return (
                  <div
                    key={gd.key}
                    className={cn(
                      'rounded-[var(--radius-input)] border px-3 py-3 flex items-center justify-between gap-2 transition hover:shadow-[var(--shadow-card)]',
                      mau
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold opacity-90 leading-none">{gd.nhan}</div>
                      <div className="mt-1 text-[10px] opacity-65 leading-none">{gd.key.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="text-2xl font-black leading-none tabular-nums shrink-0">
                      {sl}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-foreground">Thao tác nhanh</h2>
          <span className="text-xs text-muted-foreground font-medium">Lối tắt tác vụ thường dùng</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THAO_TAC_NHANH.map((item) => {
            const { BieuTuong } = item;
            return (
              <Link
                key={item.tieu_de}
                href={item.duongDan}
                className="group rounded-[var(--radius-card)] border border-border bg-background p-4 shadow-[var(--shadow-card)] hover:border-primary/40 hover:shadow-[var(--shadow-pop)] transition flex flex-col justify-between"
              >
                <div>
                  <div className={cn('size-10 rounded-[var(--radius-input)] flex items-center justify-center shrink-0 mb-3 transition', item.mau)}>
                    <BieuTuong className="size-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition flex items-center justify-between">
                    {item.tieu_de}
                    <ArrowRight className="size-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-primary" />
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.mo_ta}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="pt-2 text-center text-[11px] text-muted-foreground space-y-1">
        <div>
          © {new Date().getFullYear()} EBMS v1.0
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-[80] space-y-2 max-w-xs w-full pointer-events-none">
        {dsToast.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto shadow-[var(--shadow-pop)] rounded-[var(--radius-card)] p-3 flex items-start gap-2 text-sm border border-warning/20 bg-warning/10 text-warning"
          >
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">{t.noi_dung}</div>
            <button
              type="button"
              aria-label="Đóng thông báo"
              onClick={() => setDsToast((ds) => ds.filter((x) => x.id !== t.id))}
              className="size-5 shrink-0 rounded-[var(--radius-input)] hover:bg-warning/15 inline-flex items-center justify-center"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
