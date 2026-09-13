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
  UserRound
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
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3.5 sm:space-y-10">
      <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-4 md:gap-x-7 mb-2.5 sm:mb-10">
        <CardThongKe label="Tổng khách hàng" gia_tri={so_luong_theo_trang_thai.tong} icon={Building2} mau="primary" />
        <CardThongKe label="Đang hợp tác" gia_tri={so_luong_theo_trang_thai.hoat_dong} icon={CheckCircle2} mau="success" />
        <CardThongKe label="Tạm dừng" gia_tri={so_luong_theo_trang_thai.tam_dung} icon={AlertTriangle} mau="warning" />
        <CardThongKe label="Đã xóa" gia_tri={so_luong_theo_trang_thai.da_xoa} icon={Trash2} mau="danger" />
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-background p-3 sm:p-6 shadow-[var(--shadow-card)] mb-3 sm:mb-10">
        <BoLocKhachHang
          gia_tri_hien_tai={dieu_kien}
          khi_thay_doi={set_dieu_kien}
          dsChiNhanh={dsChiNhanh}
          dsNhanSu={dsNhanSu}
        />
      </div>

      {dang_tai ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-background p-12 flex items-center justify-center text-muted-foreground gap-5 shadow-[var(--shadow-card)]">
          <Loader2 className="size-7 animate-spin text-primary" strokeWidth={2.25} />
          <span className="text-[14.5px] font-semibold leading-body">Đang tải danh sách khách hàng...</span>
        </div>
      ) : danh_sach.length === 0 ? (
        <KhongCoDuLieu onThemMoi={mo_them_moi} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {danh_sach.map((kh) => (
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

const MAU_CARD: Record<'muted' | 'primary' | 'success' | 'warning' | 'danger', { icon: string }> = {
  muted: { icon: 'bg-card-icon-bg-muted text-card-icon-fg-muted' },
  primary: { icon: 'bg-card-icon-bg-primary text-card-icon-fg-primary' },
  success: { icon: 'bg-card-icon-bg-success text-card-icon-fg-success' },
  warning: { icon: 'bg-card-icon-bg-warning text-card-icon-fg-warning' },
  danger: { icon: 'bg-card-icon-bg-danger text-card-icon-fg-danger' }
};

const CardThongKe = ({
  label,
  gia_tri,
  icon: Icon,
  mau
}: {
  label: string;
  gia_tri: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  mau: keyof typeof MAU_CARD;
}) => {
  const c = MAU_CARD[mau];
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-background min-h-[72px] sm:min-h-[96px] p-3 sm:p-6 flex items-center gap-3 sm:gap-5 shadow-[var(--shadow-card)]">
      <div className={cn('size-8 sm:size-10 rounded-lg sm:rounded-[var(--radius-input)] inline-flex items-center justify-center shrink-0 shadow-sm', c.icon)}>
        <Icon className="size-4 sm:size-[18px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="text-[9px] sm:text-[11px] uppercase tracking-wide sm:tracking-[0.12em] font-semibold text-muted-foreground leading-small truncate">{label}</div>
        <div className="text-[16px] sm:text-[24px] font-black tracking-tight text-foreground mt-0.5 sm:mt-2 tabular-nums leading-none">
          {gia_tri}
        </div>
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
  return (
    <div
      onClick={() => router.push(`/khach-hang/${kh.id}`)}
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-4 flex items-center gap-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer group min-h-[90px]',
        kh.trang_thai === 'da_xoa' && 'opacity-60'
      )}
    >
      <DaiDien ten={kh.ten_khach_hang} kich_thuoc="md" className="shadow-xs shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3
          className="font-bold text-[14px] text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 tracking-tight"
          title={kh.ten_khach_hang}
        >
          {kh.ten_khach_hang}
        </h3>
      </div>
    </div>
  );
};
