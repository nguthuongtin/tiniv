'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Building2,
  Sparkles,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  UserRound,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import type { KhachHang } from '../../../thu_vien/types/khach_hang';
import type { ChiNhanh, NhanSu } from '../../../thu_vien/types/nhan_su';
import type {
  CapNhatKhachHangDTO,
  DieuKienLocKhachHang,
  TaoMoiKhachHangDTO
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import {
  danhSachKhachHang,
  taoKhachHangMoi,
  capNhatKhachHang,
  doiTrangThaiKhachHang
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { duocXemKhachHang, duocXemHoSoDuAn } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import BoLocKhachHang from '../../../thanh_phan/khach_hang/bo_loc_khach_hang';
import FormKhachHangDrawer from '../../../thanh_phan/khach_hang/form_khach_hang_drawer';
import {
  Nut,
  Hieu,
  Rong,
  DaiDien,
  Bo_Cuc_Trang
} from '../../../thanh_phan/ui';

const BO_LOC_MAC_DINH: DieuKienLocKhachHang = {
  tuKhoa: null,
  loai_khach_hang: 'tat_ca',
  trang_thai: 'hoat_dong',
  chi_nhanh_id: null,
  nguoi_phu_trach_id: null,
  ngay_tao_tu_ngay: null,
  ngay_tao_den_ngay: null
};

interface ThongBaoToast {
  id: number;
  dang: 'thanh_cong' | 'loi';
  noi_dung: string;
}

export default function TrangKhachHang() {
  const router = useRouter();
  const { nguoiDungHienTai } = useStoreXacThuc();
  const nguoi_dung_hien_tai = nguoiDungHienTai;

  const [dang_tai, set_dang_tai] = useState<boolean>(true);
  const [danh_sach, set_danh_sach] = useState<KhachHang[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dieu_kien, set_dieu_kien] = useState<DieuKienLocKhachHang>(BO_LOC_MAC_DINH);

  const [mo_drawer, set_mo_drawer] = useState(false);
  const [dang_sua, set_dang_sua] = useState<KhachHang | null>(null);
  const [dang_xu_ly_form, set_dang_xu_ly_form] = useState(false);
  const [loi_form, set_loi_form] = useState<string | null>(null);

  const [ds_thong_bao, set_ds_thong_bao] = useState<ThongBaoToast[]>([]);
  const [dang_xu_ly_khac, set_dang_xu_ly_khac] = useState<Record<string, boolean>>({});

  const them_thong_bao = useCallback((dang: ThongBaoToast['dang'], noi_dung: string) => {
    const id = Date.now() + Math.random();
    set_ds_thong_bao((ds) => [...ds, { id, dang, noi_dung }]);
    setTimeout(() => {
      set_ds_thong_bao((ds) => ds.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const tai_lai_du_lieu = useCallback(async () => {
    set_dang_tai(true);
    try {
      const [resKh, resHda] = await Promise.all([
        danhSachKhachHang(dieu_kien),
        danhSachHoSoDuAn({ trang_thai: 'tat_ca' }).catch(() => ({ mang: [] }))
      ]);

      const dsDuAnCuaToi = resHda.mang.filter((hda) => duocXemHoSoDuAn(nguoi_dung_hien_tai, hda));
      const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);

      const dsLoc = resKh.mang.filter((kh) =>
        duocXemKhachHang(nguoi_dung_hien_tai, kh, undefined, dsKhachHangIdsCoDuAn)
      );

      set_danh_sach(dsLoc);
    } catch (err: any) {
      them_thong_bao('loi', 'Không thể tải danh sách khách hàng: ' + (err?.message ?? 'lỗi mạng'));
      set_danh_sach([]);
    } finally {
      set_dang_tai(false);
    }
  }, [dieu_kien, nguoi_dung_hien_tai, them_thong_bao]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resCN, resNS] = await Promise.allSettled([
          danhSachChiNhanh({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' } as any)
        ]);
        if (!mounted) return;
        if (resCN.status === 'fulfilled') setDsChiNhanh(resCN.value.mang);
        if (resNS.status === 'fulfilled') setDsNhanSu(resNS.value.mang);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let huy_effect = false;
    (async () => {
      set_dang_tai(true);
      try {
        const [resKh, resHda] = await Promise.all([
          danhSachKhachHang(dieu_kien),
          danhSachHoSoDuAn({ trang_thai: 'tat_ca' }).catch(() => ({ mang: [] }))
        ]);
        if (huy_effect) return;

        const dsDuAnCuaToi = resHda.mang.filter((hda) => duocXemHoSoDuAn(nguoi_dung_hien_tai, hda));
        const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);

        const dsLoc = resKh.mang.filter((kh) =>
          duocXemKhachHang(nguoi_dung_hien_tai, kh, undefined, dsKhachHangIdsCoDuAn)
        );

        set_danh_sach(dsLoc);
      } catch (err: any) {
        if (!huy_effect) them_thong_bao('loi', 'Tải danh sách khách hàng lỗi: ' + (err?.message ?? ''));
      } finally {
        if (!huy_effect) set_dang_tai(false);
      }
    })();
    return () => {
      huy_effect = true;
    };
  }, [dieu_kien.loai_khach_hang, dieu_kien.trang_thai, dieu_kien.chi_nhanh_id, dieu_kien.nguoi_phu_trach_id, dieu_kien.ngay_tao_tu_ngay, dieu_kien.ngay_tao_den_ngay, nguoi_dung_hien_tai, them_thong_bao]);

  useEffect(() => {
    const xu_ly = () => {
      set_dang_sua(null);
      set_loi_form(null);
      set_mo_drawer(true);
    };
    window.addEventListener('ebms:khach_hang:them_moi', xu_ly);
    return () => window.removeEventListener('ebms:khach_hang:them_moi', xu_ly);
  }, []);

  const mo_them_moi = () => {
    set_dang_sua(null);
    set_loi_form(null);
    set_mo_drawer(true);
  };

  const mo_chinh_sua = (kh: KhachHang) => {
    set_dang_sua(kh);
    set_loi_form(null);
    set_mo_drawer(true);
  };

  const xu_ly_luu_form = async (dto: TaoMoiKhachHangDTO | CapNhatKhachHangDTO) => {
    set_dang_xu_ly_form(true);
    set_loi_form(null);
    try {
      if ('id' in dto) {
        await capNhatKhachHang(dto as CapNhatKhachHangDTO, nguoi_dung_hien_tai ?? null);
        them_thong_bao('thanh_cong', `Đã cập nhật khách hàng "${(dto as CapNhatKhachHangDTO).ten_khach_hang ?? dang_sua?.ten_khach_hang ?? ''}"`);
        set_mo_drawer(false);
        set_dang_sua(null);
        await tai_lai_du_lieu();
      } else {
        const moi = await taoKhachHangMoi(dto as TaoMoiKhachHangDTO, nguoi_dung_hien_tai ?? null);
        them_thong_bao('thanh_cong', `Đã tạo khách hàng "${moi.ten_khach_hang}"`);
        set_mo_drawer(false);
        set_dang_sua(null);
        router.push(`/khach-hang/${moi.id}`);
        return;
      }
    } catch (err: any) {
      const msg = (err?.message as string) ?? 'Lỗi lưu dữ liệu khách hàng, vui lòng thử lại.';
      set_loi_form(msg);
    } finally {
      set_dang_xu_ly_form(false);
    }
  };

  const xu_ly_doi_trang_thai = async (kh: KhachHang) => {
    const key = `doi_tt_${kh.id}`;
    set_dang_xu_ly_khac((o) => ({ ...o, [key]: true }));
    try {
      const trang_thai_moi: KhachHang['trang_thai'] = kh.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
      await doiTrangThaiKhachHang(kh.id, trang_thai_moi, nguoi_dung_hien_tai ?? null);
      them_thong_bao(
        'thanh_cong',
        `Đã ${trang_thai_moi === 'hoat_dong' ? 'mở khóa' : 'khóa'} khách hàng "${kh.ten_khach_hang}"`
      );
      await tai_lai_du_lieu();
    } catch (err: any) {
      them_thong_bao('loi', 'Không thể đổi trạng thái: ' + (err?.message ?? ''));
    } finally {
      set_dang_xu_ly_khac((o) => ({ ...o, [key]: false }));
    }
  };

  const xu_ly_xoa_mem = async (kh: KhachHang) => {
    const key = `xoa_${kh.id}`;
    set_dang_xu_ly_khac((o) => ({ ...o, [key]: true }));
    try {
      await doiTrangThaiKhachHang(kh.id, 'da_xoa', nguoi_dung_hien_tai ?? null);
      them_thong_bao('thanh_cong', `Đã xóa khách hàng "${kh.ten_khach_hang}"`);
      await tai_lai_du_lieu();
    } catch (err: any) {
      them_thong_bao('loi', 'Không thể xóa: ' + (err?.message ?? ''));
    } finally {
      set_dang_xu_ly_khac((o) => ({ ...o, [key]: false }));
    }
  };

  const [kieuSapXep, setKieuSapXep] = useState<'moi_nhat' | 'cu_nhat' | 'ten_az'>('moi_nhat');

  const danhSachDaSapXep = useMemo(() => {
    const ds = [...danh_sach];
    if (kieuSapXep === 'moi_nhat') {
      ds.sort((a, b) => (b.ngay_tao ?? '').localeCompare(a.ngay_tao ?? ''));
    } else if (kieuSapXep === 'cu_nhat') {
      ds.sort((a, b) => (a.ngay_tao ?? '').localeCompare(b.ngay_tao ?? ''));
    } else if (kieuSapXep === 'ten_az') {
      ds.sort((a, b) => (a.ten_khach_hang || '').localeCompare(b.ten_khach_hang || ''));
    }
    return ds;
  }, [danh_sach, kieuSapXep]);

  const so_luong_theo_trang_thai = useMemo(() => {
    const r = { hoat_dong: 0, tam_dung: 0, da_xoa: 0, tong: 0 };
    for (const k of danh_sach) {
      r.tong++;
      if (k.trang_thai === 'hoat_dong') r.hoat_dong++;
      else if (k.trang_thai === 'tam_dung') r.tam_dung++;
      else r.da_xoa++;
    }
    return r;
  }, [danh_sach]);

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-6">
      {/* Summary 2 dòng tinh gọn trên Mobile */}
      <div className="sm:hidden bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
        {/* Dòng 1 — quy mô khách hàng */}
        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng khách hàng</span>
            <span className="font-extrabold text-slate-900 text-[15px] tabular-nums">{so_luong_theo_trang_thai.tong}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Đang hợp tác</span>
            <span className="font-extrabold text-[#34C759] text-[15px] tabular-nums">{so_luong_theo_trang_thai.hoat_dong}</span>
          </div>
        </div>

        {/* Dòng 2 — tình trạng */}
        <div className="flex items-center justify-between text-[12px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Tạm dừng</span>
            <span className="font-bold text-[#FF9500] text-[13px] tabular-nums">{so_luong_theo_trang_thai.tam_dung}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đã xóa</span>
            <span className="font-bold text-slate-400 text-[13px] tabular-nums">{so_luong_theo_trang_thai.da_xoa}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards đầy đủ trên Desktop */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-2.5 sm:gap-3">
        <CardThongKe label="Tổng khách hàng" gia_tri={so_luong_theo_trang_thai.tong} icon={Building2} mau="primary" />
        <CardThongKe label="Đang hợp tác" gia_tri={so_luong_theo_trang_thai.hoat_dong} icon={CheckCircle2} mau="success" />
        <CardThongKe label="Tạm dừng" gia_tri={so_luong_theo_trang_thai.tam_dung} icon={AlertTriangle} mau="warning" />
        <CardThongKe label="Đã xóa" gia_tri={so_luong_theo_trang_thai.da_xoa} icon={Trash2} mau="danger" />
      </div>

      <BoLocKhachHang
        gia_tri_hien_tai={dieu_kien}
        khi_thay_doi={set_dieu_kien}
        dsChiNhanh={dsChiNhanh}
        dsNhanSu={dsNhanSu}
      />

      {dang_tai ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-background p-12 flex items-center justify-center text-muted-foreground gap-5 shadow-[var(--shadow-card)]">
          <Loader2 className="size-7 animate-spin text-primary" strokeWidth={2.25} />
          <span className="text-[14.5px] font-semibold leading-body">Đang tải danh sách khách hàng...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <KhongCoDuLieu onThemMoi={mo_them_moi} />
      ) : (
        <div className="space-y-3">
          {/* Header danh sách chuẩn ảnh */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-[17px] sm:text-[19px] font-bold text-slate-900 tracking-tight">
              Danh sách khách hàng
            </h2>

            <div className="relative">
              <select
                value={kieuSapXep}
                onChange={(e) => setKieuSapXep(e.target.value as any)}
                aria-label="Sắp xếp danh sách khách hàng"
                className="appearance-none text-xs sm:text-[13px] font-semibold text-[#007AFF] bg-white border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-1.5 pr-7 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="moi_nhat">Mới nhất</option>
                <option value="cu_nhat">Cũ nhất</option>
                <option value="ten_az">Tên A-Z</option>
              </select>
              <ChevronDown className="size-3.5 text-[#007AFF] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3">
            {danhSachDaSapXep.map((kh) => (
              <TheKhachHang
                key={kh.id}
                kh={kh}
                chiNhanh={dsChiNhanh.find((c) => c.id === kh.chi_nhanh_id) ?? null}
                nguoiPhuTrach={dsNhanSu.find((n) => n.id === kh.nguoi_phu_trach_id) ?? null}
                onSua={() => mo_chinh_sua(kh)}
                onDoiTrangThai={() => xu_ly_doi_trang_thai(kh)}
                onXoaMem={() => xu_ly_xoa_mem(kh)}
                dangXuLyDoiTT={Boolean(dang_xu_ly_khac[`doi_tt_${kh.id}`])}
                dangXuLyXoa={Boolean(dang_xu_ly_khac[`xoa_${kh.id}`])}
              />
            ))}
          </div>
        </div>
      )}

      <FormKhachHangDrawer
        mo={mo_drawer}
        khi_dong={() => {
          set_mo_drawer(false);
          set_dang_sua(null);
          set_loi_form(null);
        }}
        dang_sua={dang_sua}
        khi_luu={xu_ly_luu_form}
        dang_xu_ly={dang_xu_ly_form}
        loi_thong_bao={loi_form}
        dsChiNhanh={dsChiNhanh}
        dsNhanSu={dsNhanSu}
      />

      {ds_thong_bao.length > 0 ? (
        <div className="fixed top-5 right-5 z-[90] space-y-3 max-w-[340px] w-full pointer-events-none">
          {ds_thong_bao.map((t) => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto shadow-[var(--shadow-pop)] rounded-[var(--radius-card)] p-5 flex items-start gap-3 leading-body text-[13.5px] border',
                t.dang === 'thanh_cong'
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-danger/10 border-danger/20 text-danger'
              )}
            >
              {t.dang === 'thanh_cong' ? (
                <CheckCircle2 className="size-5 mt-0.5 shrink-0" strokeWidth={2.25} />
              ) : (
                <AlertTriangle className="size-5 mt-0.5 shrink-0" strokeWidth={2.25} />
              )}
              <div className="min-w-0 flex-1 font-bold leading-title">{t.noi_dung}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Bo_Cuc_Trang>
  );
}

const CardThongKe = ({
  label,
  gia_tri,
  icon: Icon,
  mau
}: {
  label: string;
  gia_tri: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mau: 'muted' | 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const iconTheme = {
    primary: 'bg-[#007AFF]/10 text-[#007AFF]',
    warning: 'bg-[#FF9500]/10 text-[#FF9500]',
    success: 'bg-[#34C759]/10 text-[#34C759]',
    danger: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    muted: 'bg-slate-100 text-slate-500'
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
      <div className="font-extrabold tracking-tight leading-none text-slate-900 mt-2.5 sm:mt-3 text-[20px] sm:text-[24px] tabular-nums">
        {gia_tri}
      </div>
    </div>
  );
};

const KhongCoDuLieu = ({ onThemMoi }: { onThemMoi: () => void }) => (
  <Rong
    kieu="mac_dinh"
    icon_tuy_chinh={Sparkles}
    nhan_tuy_chinh="Chưa có khách hàng nào"
    nhan_phu_tuy_chinh="Hãy thêm khách hàng đầu tiên để bắt đầu quản lý, sau đó tạo người liên hệ và liên kết với hồ sơ dự án."
    hanh_dong={
      <Nut
        kieu="primary"
        kich_thuoc="md"
        icon_trai={Plus}
        onClick={onThemMoi}
      >
        Thêm khách hàng đầu tiên
      </Nut>
    }
  />
);

const TEN_LOAI_KH: Record<string, { nhan: string; kieu: 'primary' | 'muted' | 'success' }> = {
  doanh_nghiep: { nhan: 'Doanh nghiệp', kieu: 'primary' },
  ca_nhan: { nhan: 'Cá nhân', kieu: 'muted' },
  to_chuc: { nhan: 'Tổ chức', kieu: 'success' },
  khac: { nhan: 'Khác', kieu: 'muted' }
};

const TRANG_THAI_MAP: Record<KhachHang['trang_thai'], { nhan: string; kieu: 'success' | 'warning' | 'muted'; cham: string }> = {
  hoat_dong: { nhan: 'Hợp tác', kieu: 'success', cham: 'bg-success' },
  tam_dung: { nhan: 'Tạm dừng', kieu: 'warning', cham: 'bg-warning' },
  da_xoa: { nhan: 'Đã xóa', kieu: 'muted', cham: 'bg-muted-foreground' }
};

const TheKhachHang = ({
  kh
}: {
  kh: KhachHang;
  chiNhanh?: ChiNhanh | null;
  nguoiPhuTrach?: NhanSu | null;
  onSua?: () => void;
  onDoiTrangThai?: () => void;
  onXoaMem?: () => void;
  dangXuLyDoiTT?: boolean;
  dangXuLyXoa?: boolean;
}) => {
  const router = useRouter();

  const badgeStyle = kh.trang_thai === 'hoat_dong'
    ? { text: 'Hợp tác', bg: 'bg-[#34C759]/10 text-[#34C759]', dot: 'bg-[#34C759]' }
    : kh.trang_thai === 'tam_dung'
    ? { text: 'Tạm dừng', bg: 'bg-[#FF9500]/10 text-[#FF9500]', dot: 'bg-[#FF9500]' }
    : { text: 'Đã xóa', bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' };

  return (
    <div
      onClick={() => router.push(`/khach-hang/${kh.id}`)}
      className={cn(
        'relative rounded-[20px] border border-slate-200/80 bg-white p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer group active:scale-[0.99]',
        kh.trang_thai === 'da_xoa' && 'opacity-60 grayscale-[50%]'
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Blue Squircle Building Icon */}
        <div className="size-11 sm:size-12 rounded-[16px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/15 shadow-2xs">
          <Building2 className="size-5 sm:size-5.5 text-[#007AFF]" strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3
            className="font-bold text-[15px] sm:text-[16.5px] text-slate-900 group-hover:text-[#007AFF] transition-colors truncate tracking-tight"
            title={kh.ten_khach_hang}
          >
            {kh.ten_khach_hang}
          </h3>

          <div className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal truncate mt-0.5">
            {kh.ma_so_thue ? `MST: ${kh.ma_so_thue}` : (kh.dia_chi || 'Khách hàng')}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 text-[11.5px] sm:text-[12.5px] text-slate-500 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Phone className="size-3.5 text-slate-400 shrink-0" />
              <span>{kh.so_dien_thoai || '--'}</span>
            </span>
            <span className="text-slate-200">│</span>
            <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[200px]">
              <Mail className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{kh.email || 'Chưa có email'}</span>
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
