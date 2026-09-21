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
  ChevronDown,
  RotateCcw
} from 'lucide-react';
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
      hoan_thanh:    { phanTram: 100, mau: 'bg-[#007AFF]',       nhan: '10. Hoàn thành',dot: 'bg-[#007AFF] shadow-[0_0_8px_rgba(0,122,255,0.6)]', capsule: 'bg-blue-50 text-[#007AFF] border-blue-200' },
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
        'hover:border-blue-300 hover:shadow-[0_8px_30px_rgba(0,122,255,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
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
            <span className="text-[15.5px] sm:text-[17px] font-extrabold text-slate-900 tabular-nums tracking-tight group-hover:text-[#007AFF] transition-colors">
              {anGiaTri ? '••••••' : DINH_DANG_TIEN_NGAN_GON(giaTriHienThi)}
            </span>
          </div>
        </div>

        {/* TẦNG TRỌNG TÂM: TÊN DỰ ÁN 2 DÒNG & KHÁCH HÀNG */}
        <div className="space-y-1.5 my-1">
          <h3
            className="font-bold text-[15.5px] sm:text-[16.5px] text-slate-900 leading-[1.38] tracking-tight line-clamp-2 group-hover:text-[#007AFF] transition-colors"
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
          <div className="size-7 rounded-full bg-slate-100/90 group-hover:bg-[#007AFF] text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:translate-x-0.5 shrink-0">
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

      {/* Bảng số liệu điều hành tinh gọn chuẩn Apple trên Desktop */}
      <div className="hidden sm:grid sm:grid-cols-5 bg-white rounded-[20px] border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] divide-x divide-slate-100/90 overflow-hidden">
        {/* 1. Tổng dự án */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/15">
            <FolderKanban className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Tổng dự án</div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-slate-900 tabular-nums tracking-tight leading-none mt-1">
              {thongKe.tongSo}
            </div>
          </div>
        </div>

        {/* 2. Tổng giá trị */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/15">
            <Wallet className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Tổng giá trị</div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-amber-600 tabular-nums tracking-tight leading-none mt-1 truncate">
              {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(thongKe.tongGiaTri)}
            </div>
          </div>
        </div>

        {/* 3. Đang chạy */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/15">
            <TrendingUp className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Đang chạy</div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-emerald-600 tabular-nums tracking-tight leading-none mt-1">
              {thongKe.soDangThucHien}
            </div>
          </div>
        </div>

        {/* 4. Hoàn thành */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-blue-500/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-blue-500/15">
            <CheckCircle2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Hoàn thành</div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-[#007AFF] tabular-nums tracking-tight leading-none mt-1">
              {thongKe.soHoanThanh}
            </div>
          </div>
        </div>

        {/* 5. Tạm dừng / Hủy */}
        <div className="p-3.5 xl:p-4 flex items-center gap-3">
          <div className="size-10 rounded-[14px] bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/15">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">Tạm dừng / Hủy</div>
            <div className="text-[18px] xl:text-[20px] font-extrabold text-rose-600 tabular-nums tracking-tight leading-none mt-1">
              {thongKe.soDaHuy}
            </div>
          </div>
        </div>
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
          {/* Header danh sách */}
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

          {/* Lưới danh sách thẻ dự án chuẩn Apple (1 cột Mobile, 2-3 cột PC) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
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
                onKhoiPhuc={xuLyKhoiPhuc}
                coQuyenKhoiPhuc={coQuyenKhoiPhuc}
                dangXuLyXoa={dangXuLyKhac === hda.id}
                dangXuLyKhoiPhuc={dangXuLyKhac === hda.id}
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
