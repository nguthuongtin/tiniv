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
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import ModalXuatExcelDuAn, { type CheDoXuat } from '../../../thanh_phan/ho_so_du_an/modal_xuat_excel_du_an';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { duocXemHoSoDuAn, coQuyen } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
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
  langNgheThayDoiDanhSachHoSoDuAn,
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
  const iconTheme = {
    primary: 'bg-emerald-50 text-[#107555]',
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
  ds_nhan_su,
  ds_khach_hang,
  tien_do_cuoi_cung,
  tenGiaiDoan,
  anGiaTri,
  onSua,
  onXoa,
  onKhoiPhuc,
  coQuyenKhoiPhuc = false,
  dangXuLyXoa = false,
  dangXuLyKhoiPhuc = false
}: {
  hda: HoSoDuAn;
  ds_nhan_su?: NhanSu[];
  ds_khach_hang: KhachHang[];
  tien_do_cuoi_cung?: TienDoDuAn | null;
  tenGiaiDoan: Record<string, { nhan: string; kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger' }>;
  anGiaTri?: boolean;
  onSua?: (hda: HoSoDuAn) => void;
  onXoa?: (hda: HoSoDuAn) => void;
  onKhoiPhuc?: (hda: HoSoDuAn) => void;
  coQuyenKhoiPhuc?: boolean;
  dangXuLyXoa?: boolean;
  dangXuLyKhoiPhuc?: boolean;
}) => {
  const router = useRouter();
  const gd = tenGiaiDoan[hda.giai_doan] ?? {
    nhan: String(hda.giai_doan),
    kieu: 'muted' as const
  };
  const kh = hda.khach_hang_id
    ? ds_khach_hang.find((k) => k.id === hda.khach_hang_id) ?? null
    : null;

  const nguoiLead = useMemo(() => {
    const idLead = hda.nguoi_phu_trach_id || hda.nguoi_quan_ly_id;
    return idLead && ds_nhan_su ? ds_nhan_su.find((n) => n.id === idLead) ?? null : null;
  }, [hda.nguoi_phu_trach_id, hda.nguoi_quan_ly_id, ds_nhan_su]);

  const laHoanThanh = hda.giai_doan === 'hoan_thanh';
  const laTamDung = ['tam_dung', 'huy'].includes(String(hda.giai_doan)) || hda.trang_thai === 'da_xoa';

  // Thanh tiến độ chuẩn xác 10 giai đoạn từ Mới tạo (10%) đến Hoàn thành (100%)
  const thongTinTienDo = useMemo(() => {
    const TIEN_DO_MAP: Record<string, { phanTram: number; mau: string; nhan: string; dot: string; capsule: string }> = {
      moi_tao:       { phanTram: 10,  mau: 'bg-slate-400',       nhan: '1. Mới tạo',    dot: 'bg-slate-400',       capsule: 'bg-slate-100 text-slate-700 border-slate-200' },
      tiep_can:      { phanTram: 20,  mau: 'bg-blue-400',        nhan: '2. Tiếp cận',   dot: 'bg-blue-400',        capsule: 'bg-blue-50 text-blue-700 border-blue-200' },
      khao_sat:      { phanTram: 30,  mau: 'bg-blue-500',        nhan: '3. Khảo sát',   dot: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)] animate-pulse', capsule: 'bg-blue-50 text-blue-700 border-blue-200' },
      len_giai_phap: { phanTram: 40,  mau: 'bg-sky-500',         nhan: '4. Giải pháp',  dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.5)] animate-pulse', capsule: 'bg-sky-50 text-sky-700 border-sky-200' },
      bao_gia:       { phanTram: 50,  mau: 'bg-amber-500',       nhan: '5. Báo giá',    dot: 'bg-amber-500',       capsule: 'bg-amber-50 text-amber-700 border-amber-200' },
      dam_phan:      { phanTram: 60,  mau: 'bg-amber-600',       nhan: '6. Đàm phán',   dot: 'bg-amber-600',       capsule: 'bg-amber-50 text-amber-800 border-amber-200' },
      ky_hop_dong:   { phanTram: 70,  mau: 'bg-teal-500',        nhan: '7. Ký HĐ',      dot: 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.5)]', capsule: 'bg-teal-50 text-teal-700 border-teal-200' },
      trien_khai:    { phanTram: 80,  mau: 'bg-emerald-500',     nhan: '8. Triển khai', dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse', capsule: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      nghiem_thu:    { phanTram: 90,  mau: 'bg-emerald-600',     nhan: '9. Nghiệm thu', dot: 'bg-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.5)]', capsule: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      hoan_thanh:    { phanTram: 100, mau: 'bg-emerald-700',     nhan: '10. Hoàn thành',dot: 'bg-emerald-700 shadow-[0_0_8px_rgba(16,117,85,0.6)]', capsule: 'bg-emerald-50 text-[#107555] border-emerald-200' },
      tam_dung:      { phanTram: 50,  mau: 'bg-amber-500',       nhan: 'Tạm dừng',      dot: 'bg-amber-500',       capsule: 'bg-amber-50 text-amber-700 border-amber-200' },
      huy:           { phanTram: 100, mau: 'bg-rose-500',        nhan: 'Đã hủy',        dot: 'bg-rose-500',        capsule: 'bg-rose-50 text-rose-700 border-rose-200' }
    };

    return TIEN_DO_MAP[hda.giai_doan] ?? {
      phanTram: 10,
      mau: 'bg-slate-400',
      nhan: gd.nhan || 'Đang chạy',
      dot: 'bg-slate-400',
      capsule: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  }, [hda.giai_doan, gd.nhan]);

  const giaTriHienThi = Number(hda.gia_tri_hop_dong) > 0 ? hda.gia_tri_hop_dong : hda.gia_tri_du_kien;

  return (
    <div
      onClick={() => router.push(`/ho-so-du-an/${hda.id}`)}
      className={cn(
        'group relative bg-white rounded-[22px] border border-slate-200/80 p-4 sm:p-5 pt-5 sm:pt-6 transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden',
        'hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,117,85,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
        'active:scale-[0.985] active:bg-slate-50/60 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03),0_6px_16px_rgba(0,0,0,0.02)]',
        hda.trang_thai === 'da_xoa' && 'opacity-70 bg-slate-50/70 border-rose-200/80'
      )}
    >
      {/* 1. THANH TIẾN ĐỘ MÉP TRÊN THẺ (Apple Top-Edge Progress Bar) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100/90 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 ease-out', hda.trang_thai === 'da_xoa' ? 'bg-rose-400' : thongTinTienDo.mau)}
          style={{ width: `${thongTinTienDo.phanTram}%` }}
        />
      </div>

      <div>
        {/* TẦNG ĐỈNH: STATUS CAPSULE & GIÁ TRỊ DỰ ÁN */}
        <div className="flex items-center justify-between gap-3 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {/* Apple Status Capsule */}
            {hda.trang_thai === 'da_xoa' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] sm:text-[12px] font-bold tracking-wide border shrink-0 bg-rose-50 text-rose-700 border-rose-200">
                <span className="size-1.5 rounded-full shrink-0 bg-rose-500" />
                <span>Đã xóa</span>
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] sm:text-[12px] font-semibold tracking-wide border shrink-0',
                  thongTinTienDo.capsule
                )}
              >
                <span className={cn('size-1.5 rounded-full shrink-0', thongTinTienDo.dot)} />
                <span className="truncate max-w-[140px]">{thongTinTienDo.nhan}</span>
              </span>
            )}

            {hda.ma_ho_so && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-500 font-mono text-[11px] font-medium border border-slate-200/60">
                {hda.ma_ho_so}
              </span>
            )}
          </div>

          {/* Hero Value */}
          <div className="text-right shrink-0">
            <span className="text-[15.5px] sm:text-[17px] font-extrabold text-slate-900 tabular-nums tracking-tight group-hover:text-emerald-700 transition-colors">
              {anGiaTri ? '••••••' : DINH_DANG_TIEN_NGAN_GON(giaTriHienThi)}
            </span>
          </div>
        </div>

        {/* TẦNG TRỌNG TÂM: TÊN DỰ ÁN 2 DÒNG & KHÁCH HÀNG */}
        <div className="space-y-1.5 my-1">
          <h3
            className="font-bold text-[15.5px] sm:text-[16.5px] text-slate-900 leading-[1.38] tracking-tight line-clamp-2 group-hover:text-emerald-700 transition-colors"
            title={hda.ten_du_an}
          >
            {hda.ten_du_an}
          </h3>

          <div className="flex items-center gap-1.5 text-[12.5px] sm:text-[13px] text-slate-500 font-normal truncate">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{kh?.ten_khach_hang || 'Chưa liên kết khách hàng'}</span>
          </div>
        </div>
      </div>

      {/* TẦNG CHÂN: THỜI GIAN, NGƯỜI PHỤ TRÁCH LIỀN SAU & ACTION */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 text-[11.5px] sm:text-[12px] text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {/* Thời gian */}
          <span className="inline-flex items-center gap-1 text-slate-600">
            <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
            <span>{hda.ngay_tao ? formatNgay(hda.ngay_tao.slice(0, 10)) : '--/--/----'}</span>
          </span>

          {/* Tên người phụ trách đặt liền ngay sau thời gian */}
          {nguoiLead && (
            <>
              <span className="text-slate-300">│</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-medium truncate" title={`Phụ trách: ${nguoiLead.ho_va_ten}`}>
                <User className="size-3 text-slate-400 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[130px]">{nguoiLead.ho_va_ten}</span>
              </span>
            </>
          )}

          {hda.thoi_han_hoan_thanh && (
            <>
              <span className="text-slate-300">│</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="size-3 text-slate-400 shrink-0" />
                <span className="truncate">Hạn: {formatNgay(hda.thoi_han_hoan_thanh.slice(0, 10))}</span>
              </span>
            </>
          )}
        </div>

        {/* Nút hành động tròn Apple hoặc Nút Khôi phục */}
        {hda.trang_thai === 'da_xoa' && coQuyenKhoiPhuc ? (
          <button
            type="button"
            disabled={dangXuLyKhoiPhuc}
            onClick={(e) => {
              e.stopPropagation();
              onKhoiPhuc?.(hda);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Khôi phục hồ sơ dự án"
          >
            {dangXuLyKhoiPhuc ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RotateCcw className="size-3" strokeWidth={2.5} />
            )}
            <span>Khôi phục</span>
          </button>
        ) : (
          <div className="size-7 rounded-full bg-slate-100/90 group-hover:bg-[#107555] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:translate-x-0.5 shrink-0">
            <ChevronRight className="size-3.5" strokeWidth={2.5} />
          </div>
        )}
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

  // Phân trang danh sách
  const [trangHienTai, setTrangHienTai] = useState(1);
  const SO_BAN_GHI_MOI_TRANG = 12;
  const [duAnXacNhanXoa, setDuAnXacNhanXoa] = useState<HoSoDuAn | null>(null);

  // Quản lý xuất Excel & chọn dự án
  const [moModalXuatExcel, setMoModalXuatExcel] = useState(false);
  const [dsDuAnDaChonIds, setDsDuAnDaChonIds] = useState<Set<string>>(new Set());
  const [cheDoXuatMacDinh, setCheDoXuatMacDinh] = useState<CheDoXuat | undefined>(undefined);

  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const coQuyenXoa = coQuyen(nguoiDungHienTai, 'du_an.xoa');
  const coQuyenKhoiPhuc = coQuyen(nguoiDungHienTai, 'du_an.khoi_phuc');
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

  // Reset trang về 1 khi lọc hoặc đổi sắp xếp
  useEffect(() => {
    setTrangHienTai(1);
  }, [dieukien, kieuSapXep]);

  const tongSoTrang = useMemo(() => {
    return Math.max(1, Math.ceil(danhSachDaSapXep.length / SO_BAN_GHI_MOI_TRANG));
  }, [danhSachDaSapXep.length]);

  const danhSachTrangHienTai = useMemo(() => {
    const batDau = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG;
    return danhSachDaSapXep.slice(batDau, batDau + SO_BAN_GHI_MOI_TRANG);
  }, [danhSachDaSapXep, trangHienTai]);

  const toggleChonDuAn = useCallback((id: string) => {
    setDsDuAnDaChonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const chonTatCaTrang = useCallback(() => {
    setDsDuAnDaChonIds((prev) => {
      const next = new Set(prev);
      const idsTrang = danhSachTrangHienTai.map((d) => d.id);
      const daChonHet = idsTrang.length > 0 && idsTrang.every((id) => next.has(id));
      if (daChonHet) {
        idsTrang.forEach((id) => next.delete(id));
      } else {
        idsTrang.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [danhSachTrangHienTai]);

  const daChonHetTrang = useMemo(() => {
    if (danhSachTrangHienTai.length === 0) return false;
    return danhSachTrangHienTai.every((d) => dsDuAnDaChonIds.has(d.id));
  }, [danhSachTrangHienTai, dsDuAnDaChonIds]);

  const duAnDaChonList = useMemo(() => {
    return danhSach.filter((d) => dsDuAnDaChonIds.has(d.id));
  }, [danhSach, dsDuAnDaChonIds]);

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
    const soTamDung = danhSach.filter(
      (h) => h.trang_thai !== 'da_xoa' && String(h.giai_doan) === 'tam_dung'
    ).length;
    const soDaHuy = danhSach.filter(
      (h) => h.trang_thai === 'da_xoa' || String(h.giai_doan) === 'huy'
    ).length;
    const tongGiaTri = danhSach.reduce(
      (sum, h) => sum + (Number(h.gia_tri_du_kien) || 0),
      0
    );
    return { tongSo, soDangThucHien, soHoanThanh, soTamDung, soDaHuy, tongGiaTri };
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

  // Lắng nghe dữ liệu Realtime qua onSnapshot
  useEffect(() => {
    setDangTai(true);
    const huyLangNghe = langNgheThayDoiDanhSachHoSoDuAn((mang) => {
      const dsLoc = mang.filter((hda) => duocXemHoSoDuAn(nguoiDungHienTai, hda));
      setDanhSach(dsLoc);
      setDangTai(false);
    }, dieukien);

    return () => huyLangNghe();
  }, [dieukien, nguoiDungHienTai]);

  const taiLaiDuLieu = useCallback(async () => {
    try {
      const kq = await danhSachHoSoDuAn(dieukien);
      const dsLoc = (kq.mang ?? []).filter((hda) => duocXemHoSoDuAn(nguoiDungHienTai, hda));
      setDanhSach(dsLoc);
    } catch {}
  }, [dieukien, nguoiDungHienTai]);

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

  const xuLyXoa = useCallback((hda: HoSoDuAn) => {
    setDuAnXacNhanXoa(hda);
  }, []);

  const thucHienXoa = useCallback(
    async (hda: HoSoDuAn) => {
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
        await xoaMem(hda.id, nguoiTH);
        themToast('thanh_cong', 'Đã chuyển hồ sơ dự án vào thùng rác');
        setDuAnXacNhanXoa(null);
      } catch (e) {
        const msg = (e as Error)?.message ?? 'Lỗi xóa';
        themToast('loi', msg);
      } finally {
        setDangXuLyKhac(null);
      }
    },
    [nguoiDungHienTai, themToast]
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

  const xuLyKhoiPhuc = useCallback(
    async (hda: HoSoDuAn) => {
      await xuLyDoiTrangThai(hda, 'hoat_dong');
    },
    [xuLyDoiTrangThai]
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
      {/* Flagship Dashboard Bento Hub - Thống nhất cho cả Mobile & Desktop */}
      <section className="bento-flagship squircle-card p-5 sm:p-6 text-white shadow-squircle relative overflow-hidden mb-2">
        <div className="absolute -right-6 -top-6 w-40 h-40 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between relative z-10 gap-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">TỔNG QUAN HỆ THỐNG</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/25"></span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs font-semibold text-emerald-100/80">Dự án:</span>
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm font-sans">{thongKe.tongSo}</span>
              <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 hidden sm:inline-block">Hoạt động</span>
            </div>
          </div>
          
          <div className="glass-inner-pill px-3 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0 font-bold">
              <Wallet className="size-4 sm:size-5 text-emerald-950 stroke-[2.4]" />
            </div>
            <div>
              <p className="text-[9px] text-emerald-200/90 font-bold uppercase tracking-wider leading-none">TỔNG GIÁ TRỊ</p>
              <p className="text-[13px] sm:text-[15px] font-black text-amber-300 tracking-tight mt-1 leading-none drop-shadow">
                {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(thongKe.tongGiaTri)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-4 sm:mt-6 relative z-10">
          <div className="glass-inner-pill-active rounded-2xl py-2 px-1 sm:py-3 text-center transition-transform hover:scale-95 cursor-default">
            <div className="text-[19px] sm:text-[22px] font-black text-emerald-300 leading-none drop-shadow-sm">{thongKe.soDangThucHien}</div>
            <div className="text-[10px] sm:text-[12px] font-bold text-emerald-100 tracking-tight mt-1 truncate">Đang chạy</div>
            <div className="w-6 h-0.5 bg-emerald-400/70 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-slate-200 leading-none">{thongKe.soHoanThanh}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-slate-300/80 tracking-tight mt-1 truncate">Hoàn tất</div>
            <div className="w-4 h-0.5 bg-white/20 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-amber-200/90 leading-none">{thongKe.soTamDung}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-amber-200/70 tracking-tight mt-1 truncate">Tạm dừng</div>
            <div className="w-4 h-0.5 bg-amber-400/20 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-rose-200/80 leading-none">{thongKe.soDaHuy}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-rose-200/60 tracking-tight mt-1 truncate">Đã hủy</div>
            <div className="w-4 h-0.5 bg-rose-400/20 rounded-full mx-auto mt-1.5"></div>
          </div>
        </div>
      </section>
      <BoLocHoSoDuAn
        gia_tri_hien_tai={dieukien}
        khi_thay_doi={setDieukien}
        ds_khach_hang={dsKhachHang}
        ds_nhan_su={dsNhanSu}
        kieu_sap_xep={kieuSapXep}
        khi_doi_sap_xep={setKieuSapXep}
      />

      {dangTai ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="size-5 animate-spin text-emerald-700" strokeWidth={2.25} />
          <span className="font-semibold">Đang tải danh sách...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <EmptyState onThemMoi={moThemMoi} />
      ) : (
        <div className="bg-white rounded-[26px] sm:rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* Header danh sách: Gọn gàng trên 1 hàng cả Mobile & Desktop */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100 sm:border-slate-200/80 bg-white">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <h2 className="text-[14px] sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                <span className="sm:hidden">Dự án</span>
                <span className="hidden sm:inline">Danh sách dự án</span>
              </h2>
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/80 tabular-nums shrink-0">
                {danhSachDaSapXep.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCheDoXuatMacDinh(dsDuAnDaChonIds.size > 0 ? 'da_chon' : undefined);
                  setMoModalXuatExcel(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full sm:rounded-xl bg-slate-100/80 sm:bg-white hover:bg-slate-100 text-emerald-800 border border-slate-200/80 hover:border-emerald-300 text-[12px] sm:text-sm font-bold transition cursor-pointer active:scale-95"
                title="Xuất file Excel tiến độ dự án"
              >
                <FileSpreadsheet className="size-4 text-emerald-700 shrink-0" />
                <span className="sm:hidden">Xuất</span>
                <span className="hidden sm:inline">Xuất Excel</span>
                {dsDuAnDaChonIds.size > 0 && (
                  <span className="size-4.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {dsDuAnDaChonIds.size}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={moThemMoi}
                title="Thêm dự án mới"
                aria-label="Thêm dự án mới"
                className="inline-flex items-center justify-center gap-1.5 size-8 sm:size-auto sm:px-3.5 sm:py-2 rounded-full sm:rounded-xl bg-[#107555] hover:bg-emerald-800 active:scale-95 text-white text-[12px] sm:text-sm font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Thêm dự án</span>
              </button>
            </div>
          </div>

          {/* Flagship Apple Squircle Glass Project Cards Unified Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-5 bg-slate-50/50">
            {danhSachTrangHienTai.map((hda, index) => {
              const kh = hda.khach_hang_id ? dsKhachHang.find((k) => k.id === hda.khach_hang_id) ?? null : null;
              const idLead = hda.nguoi_phu_trach_id || hda.nguoi_quan_ly_id;
              const nguoiLead = idLead ? dsNhanSu.find((n) => n.id === idLead) ?? null : null;
              const gd = tenGiaiDoan[hda.giai_doan] ?? { nhan: String(hda.giai_doan) };
              const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
              const duocChon = dsDuAnDaChonIds.has(hda.id);
              const giaTri = laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(hda.gia_tri_du_kien || hda.gia_tri_hop_dong);
              
              const gdColors: Record<string, { badge: string; dotBg: string; barWidth: string }> = {
                moi_tao: { badge: 'bg-violet-50 text-violet-700 border-violet-200/80', dotBg: 'bg-violet-600', barWidth: '15%' },
                tiep_can: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dotBg: 'bg-indigo-600', barWidth: '25%' },
                khao_sat: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-300/80', dotBg: 'bg-emerald-500', barWidth: '35%' },
                len_giai_phap: { badge: 'bg-sky-50 text-sky-700 border-sky-200/80', dotBg: 'bg-sky-500', barWidth: '50%' },
                bao_gia: { badge: 'bg-amber-50 text-amber-700 border-amber-200/80', dotBg: 'bg-amber-500', barWidth: '65%' },
                dam_phan: { badge: 'bg-orange-50 text-orange-700 border-orange-200/80', dotBg: 'bg-orange-500', barWidth: '80%' },
                ky_hop_dong: { badge: 'bg-teal-50 text-teal-700 border-teal-200/80', dotBg: 'bg-teal-500', barWidth: '90%' },
                trien_khai: { badge: 'bg-blue-50 text-blue-700 border-blue-200/80', dotBg: 'bg-blue-600', barWidth: '95%' },
                nghiem_thu: { badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80', dotBg: 'bg-fuchsia-600', barWidth: '98%' },
                hoan_thanh: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-300/80', dotBg: 'bg-emerald-500', barWidth: '100%' },
                tam_dung: { badge: 'bg-slate-50 text-slate-700 border-slate-200/80', dotBg: 'bg-slate-500', barWidth: '50%' },
                huy: { badge: 'bg-rose-50 text-rose-700 border-rose-200/80', dotBg: 'bg-rose-500', barWidth: '10%' },
              };
              const styleColor = hda.trang_thai === 'da_xoa' ? { badge: 'bg-rose-50 text-rose-700 border-rose-200/80', dotBg: 'bg-rose-500', barWidth: '0%' } : (gdColors[hda.giai_doan] || { badge: 'bg-slate-100 text-slate-600 border-slate-200/80', dotBg: 'bg-slate-400', barWidth: '0%' });

              return (
                <article
                  key={hda.id}
                  className={cn(
                    "glass-card-item p-4 sm:p-5 hover:shadow-card-hover transition-all duration-200 relative group flex flex-col",
                    hda.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/50 grayscale-[30%]',
                    duocChon && 'border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/10 shadow-emerald-500/10'
                  )}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <label className="pt-0.5 cursor-pointer flex items-center">
                      <input type="checkbox" checked={duocChon} onChange={() => toggleChonDuAn(hda.id)} className="custom-check" />
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60 leading-none">
                          #{stt < 10 ? `0${stt}` : stt}
                        </span>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-xs", styleColor.badge)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", styleColor.dotBg, hda.giai_doan === 'moi_tao' && 'animate-pulse')}></span>
                          {hda.trang_thai === 'da_xoa' ? 'Đã xóa' : gd.nhan}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-400 font-semibold truncate max-w-[80px]">
                          {hda.ngay_tao ? formatNgay(hda.ngay_tao.slice(0, 10)) : 'Hôm nay'}
                        </span>
                      </div>
                      
                      <Link href={`/ho-so-du-an/${hda.id}`}>
                        <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 mt-1 hover:text-emerald-700 transition-colors">
                          {hda.ten_du_an}
                        </h3>
                      </Link>
                      
                      {kh && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                          <Building2 className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{kh.ten_khach_hang}</span>
                        </div>
                      )}
                      
                      <div className="mt-3.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", styleColor.dotBg)} style={{ width: styleColor.barWidth }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-1 p-1">
                    <Link href={`/ho-so-du-an/${hda.id}`} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition" title="Xem"><Eye className="size-3.5" /></Link>
                    <button type="button" onClick={() => moSua(hda)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition" title="Sửa"><Pencil className="size-3.5" /></button>
                    {hda.trang_thai === 'da_xoa' && coQuyenKhoiPhuc ? (
                      <button type="button" onClick={() => xuLyKhoiPhuc(hda)} disabled={dangXuLyKhac === hda.id} className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50" title="Khôi phục"><RotateCcw className="size-3.5" /></button>
                    ) : coQuyenXoa ? (
                      <button type="button" onClick={() => xuLyXoa(hda)} disabled={dangXuLyKhac === hda.id} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50" title="Xóa"><Trash2 className="size-3.5" /></button>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs">
                    <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-300/80 font-black tracking-tight text-[11px] shadow-xs truncate max-w-[130px]">
                      {giaTri}
                    </div>
                    {nguoiLead ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 truncate max-w-[80px]">
                          {nguoiLead.ho_va_ten.split(' ').pop()}
                        </span>
                        <div className="size-6 sm:size-7 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-black shadow-xs ring-2 ring-white">
                          {nguoiLead.ho_va_ten.split(' ').pop()?.[0]?.toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Chưa gán</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Thanh phân trang Pagination */}
          {tongSoTrang > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
              <div className="text-xs sm:text-[13px] text-slate-500 font-medium">
                Hiển thị <span className="font-bold text-slate-800">{(trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + 1}</span> -{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(trangHienTai * SO_BAN_GHI_MOI_TRANG, danhSachDaSapXep.length)}
                </span>{' '}
                trên tổng số <span className="font-bold text-slate-800">{danhSachDaSapXep.length}</span> dự án
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={trangHienTai <= 1}
                  onClick={() => setTrangHienTai((t) => Math.max(1, t - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-[13px] font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" /> Trước
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: tongSoTrang }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === tongSoTrang || Math.abs(p - trangHienTai) <= 1)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`dots-${idx}`} className="px-1.5 text-xs text-slate-400 font-bold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          type="button"
                          onClick={() => setTrangHienTai(item as number)}
                          className={cn(
                            'size-7 sm:size-8 rounded-xl text-xs sm:text-[13px] font-bold transition shadow-2xs cursor-pointer',
                            trangHienTai === item
                              ? 'bg-[#107555] text-white shadow-emerald-700/20 shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          )}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  type="button"
                  disabled={trangHienTai >= tongSoTrang}
                  onClick={() => setTrangHienTai((t) => Math.min(tongSoTrang, t + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-[13px] font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                >
                  Sau <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
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

      {/* Modal xác nhận xóa dự án */}
      {duAnXacNhanXoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 className="size-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa hồ sơ dự án</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn chuyển hồ sơ dự án{' '}
              <span className="font-semibold text-slate-900">"{duAnXacNhanXoa.ten_du_an}"</span> vào thùng rác không?
              Dự án sẽ bị ẩn khỏi danh sách chính và chỉ tài khoản có quyền mới có thể khôi phục.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={dangXuLyKhac === duAnXacNhanXoa.id}
                onClick={() => setDuAnXacNhanXoa(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={dangXuLyKhac === duAnXacNhanXoa.id}
                onClick={async () => {
                  await thucHienXoa(duAnXacNhanXoa);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {dangXuLyKhac === duAnXacNhanXoa.id && <Loader2 className="size-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Thanh công cụ nổi khi có dự án được chọn */}
      {dsDuAnDaChonIds.size > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[92vw]">
          <div className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            Đã chọn <span className="text-emerald-400 font-extrabold">{dsDuAnDaChonIds.size}</span> dự án
          </div>
          <div className="h-4 w-[1px] bg-slate-700" />
          <button
            type="button"
            onClick={() => {
              setCheDoXuatMacDinh('da_chon');
              setMoModalXuatExcel(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shrink-0 shadow-xs"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Xuất Excel ({dsDuAnDaChonIds.size})</span>
          </button>
          <button
            type="button"
            onClick={() => setDsDuAnDaChonIds(new Set())}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer shrink-0"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Modal xuất Excel tiến độ dự án */}
      <ModalXuatExcelDuAn
        mo={moModalXuatExcel}
        onDong={() => setMoModalXuatExcel(false)}
        tatCaDuAn={danhSach}
        duAnTheoBoLoc={danhSachDaSapXep}
        duAnDaChon={duAnDaChonList}
        dsKhachHang={dsKhachHang}
        dsNhanSu={dsNhanSu}
        dsTienDo={dsTienDo}
        tenGiaiDoan={tenGiaiDoan}
        cheDoMacDinh={cheDoXuatMacDinh}
      />
    </Bo_Cuc_Trang>
  );
}

export default TrangHoSoDuAn;
