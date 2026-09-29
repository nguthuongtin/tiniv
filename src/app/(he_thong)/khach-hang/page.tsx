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
  ChevronDown,
  RotateCcw,
  FolderKanban
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import type { KhachHang, NguoiLienHe } from '../../../thu_vien/types/khach_hang';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
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
  doiTrangThaiKhachHang,
  khoiPhucKhachHang
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNguoiLienHe } from '../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
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
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);
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
      const vaiTroKey = String(nguoi_dung_hien_tai?.vai_tro || '');
      const laQuanLy = vaiTroKey === 'quan_tri_he_thong' || vaiTroKey === 'giam_doc' || vaiTroKey === 'truong_phong';

      const [resKh, resHda, resNlh] = await Promise.all([
        danhSachKhachHang(dieu_kien),
        danhSachHoSoDuAn({ trang_thai: 'tat_ca' }).catch(() => ({ mang: [] })),
        danhSachNguoiLienHe().catch(() => ({ mang: [] }))
      ]);

      const dsDuAnCuaToi = laQuanLy ? resHda.mang : resHda.mang.filter((hda) => duocXemHoSoDuAn(nguoi_dung_hien_tai, hda));
      const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);

      const dsLoc = resKh.mang.filter((kh) =>
        duocXemKhachHang(nguoi_dung_hien_tai, kh, undefined, dsKhachHangIdsCoDuAn)
      );

      set_danh_sach(dsLoc);
      setDsDuAn(resHda.mang);
      setDsNguoiLienHe(resNlh.mang);
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
        const vaiTroKey = String(nguoi_dung_hien_tai?.vai_tro || '');
        const laQuanLy = vaiTroKey === 'quan_tri_he_thong' || vaiTroKey === 'giam_doc' || vaiTroKey === 'truong_phong';

        const [resKh, resHda, resNlh] = await Promise.all([
          danhSachKhachHang(dieu_kien),
          danhSachHoSoDuAn({ trang_thai: 'tat_ca' }).catch(() => ({ mang: [] })),
          danhSachNguoiLienHe().catch(() => ({ mang: [] }))
        ]);

        if (huy_effect) return;

        const dsDuAnCuaToi = laQuanLy ? resHda.mang : resHda.mang.filter((hda) => duocXemHoSoDuAn(nguoi_dung_hien_tai, hda));
        const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);

        const dsLoc = resKh.mang.filter((kh) =>
          duocXemKhachHang(nguoi_dung_hien_tai, kh, undefined, dsKhachHangIdsCoDuAn)
        );

        set_danh_sach(dsLoc);
        setDsDuAn(resHda.mang);
        setDsNguoiLienHe(resNlh.mang);
      } catch (err: any) {
        if (!huy_effect) them_thong_bao('loi', 'Tải danh sách khách hàng lỗi: ' + (err?.message ?? ''));
      } finally {
        if (!huy_effect) set_dang_tai(false);
      }
    })();
    return () => {
      huy_effect = true;
    };
  }, [dieu_kien, nguoi_dung_hien_tai, them_thong_bao]);

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

  const xu_ly_khoi_phuc = async (kh: KhachHang) => {
    const key = `khoi_phuc_${kh.id}`;
    set_dang_xu_ly_khac((o) => ({ ...o, [key]: true }));
    try {
      await khoiPhucKhachHang(kh.id, nguoi_dung_hien_tai ?? null);
      them_thong_bao('thanh_cong', `Đã khôi phục khách hàng "${kh.ten_khach_hang}"`);
      await tai_lai_du_lieu();
    } catch (err: any) {
      them_thong_bao('loi', 'Không thể khôi phục: ' + (err?.message ?? ''));
    } finally {
      set_dang_xu_ly_khac((o) => ({ ...o, [key]: false }));
    }
  };

  const [kieuSapXep, setKieuSapXep] = useState<'moi_nhat' | 'cu_nhat' | 'ten_az'>('moi_nhat');

  const mapNhanSu = useMemo(() => {
    const map = new Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => map.set(ns.id, ns));
    return map;
  }, [dsNhanSu]);

  const mapSoLuongDuAnTheoKhachHang = useMemo(() => {
    const map = new Map<string, number>();
    dsDuAn.forEach((da) => {
      if (da.khach_hang_id && da.trang_thai !== 'da_xoa') {
        map.set(da.khach_hang_id, (map.get(da.khach_hang_id) || 0) + 1);
      }
    });
    return map;
  }, [dsDuAn]);

  const mapNguoiLienHeTheoKhachHang = useMemo(() => {
    const map = new Map<string, NguoiLienHe>();
    // Since dsNguoiLienHe is sorted or in order, first one encountered per khach_hang_id is considered primary
    dsNguoiLienHe.forEach((nlh) => {
      if (nlh.khach_hang_id && !map.has(nlh.khach_hang_id)) {
        map.set(nlh.khach_hang_id, nlh);
      }
    });
    return map;
  }, [dsNguoiLienHe]);

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

      {/* Bảng số liệu điều hành chuẩn Forest Green Banner trên Desktop (ảnh mẫu) */}
      <div className="hidden sm:grid sm:grid-cols-4 bg-[#0e3e2d] rounded-2xl p-3.5 gap-3 shadow-sm border border-emerald-950/20">
        {/* 1. Tổng khách hàng */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0 border border-white/10">
            <Building2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Tổng khách hàng
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {so_luong_theo_trang_thai.tong}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Quy mô hệ thống
            </div>
          </div>
        </div>

        {/* 2. Đang hợp tác */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/20">
            <CheckCircle2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đang hợp tác
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {so_luong_theo_trang_thai.hoat_dong}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Chiếm {so_luong_theo_trang_thai.tong ? Math.round((so_luong_theo_trang_thai.hoat_dong / so_luong_theo_trang_thai.tong) * 100) : 0}% tổng số
            </div>
          </div>
        </div>

        {/* 3. Tạm dừng */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/20">
            <AlertTriangle className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Tạm dừng
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {so_luong_theo_trang_thai.tam_dung}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Cần theo dõi lại
            </div>
          </div>
        </div>

        {/* 4. Đã xóa */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center shrink-0 border border-rose-400/20">
            <Trash2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đã xóa
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {so_luong_theo_trang_thai.da_xoa}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Lưu trữ thùng rác
            </div>
          </div>
        </div>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header danh sách chuẩn bảng mẫu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/80 bg-white">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Danh sách khách hàng
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                {danhSachDaSapXep.length}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={kieuSapXep}
                  onChange={(e) => setKieuSapXep(e.target.value as any)}
                  aria-label="Sắp xếp danh sách khách hàng"
                  className="appearance-none text-xs sm:text-[13px] font-semibold text-emerald-800 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2 pr-7 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="moi_nhat">Mới nhất</option>
                  <option value="cu_nhat">Cũ nhất</option>
                  <option value="ten_az">Tên A-Z</option>
                </select>
                <ChevronDown className="size-3.5 text-emerald-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={mo_them_moi}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Thêm khách hàng</span>
              </button>
            </div>
          </div>

          {/* 1. GIAO DIỆN BẢNG TRÊN DESKTOP / TABLET (ẩn trên mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[50px] text-center">STT</th>
                  <th className="py-3 px-4 min-w-[240px]">THÔNG TIN KHÁCH HÀNG</th>
                  <th className="py-3 px-4 w-[110px] text-center">DỰ ÁN</th>
                  <th className="py-3 px-4 min-w-[180px]">PHỤ TRÁCH</th>
                  <th className="py-3 px-4 min-w-[200px]">NGƯỜI LIÊN HỆ</th>
                  <th className="py-3 px-4 w-[110px] text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {danhSachDaSapXep.map((kh, index) => {
                  const soLuongDa = mapSoLuongDuAnTheoKhachHang.get(kh.id) || 0;
                  const nguoiPhuTrach = kh.nguoi_phu_trach_id ? mapNhanSu.get(kh.nguoi_phu_trach_id) : null;
                  const lienHeChinh = mapNguoiLienHeTheoKhachHang.get(kh.id);

                  return (
                    <tr
                      key={kh.id}
                      className={cn(
                        'hover:bg-slate-50/70 transition-colors',
                        kh.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/30'
                      )}
                    >
                      {/* 0. STT */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs">
                        {index + 1}
                      </td>

                      {/* 1. THÔNG TIN KHÁCH HÀNG */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/khach-hang/${kh.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors line-clamp-1"
                        >
                          {kh.ten_khach_hang}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-normal mt-0.5 flex-wrap">
                          {kh.ma_so_thue && (
                            <span className="font-mono text-slate-500">MST: {kh.ma_so_thue}</span>
                          )}
                          {kh.so_dien_thoai && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Phone className="size-3 text-slate-400" />
                              {kh.so_dien_thoai}
                            </span>
                          )}
                          {kh.email && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Mail className="size-3 text-slate-400" />
                              {kh.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. DỰ ÁN */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/khach-hang/${kh.id}#du-an`}
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all',
                            soLuongDa > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 hover:text-emerald-800'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/60'
                          )}
                          title={`${soLuongDa} dự án`}
                        >
                          <FolderKanban className="size-3.5" />
                          <span>{soLuongDa}</span>
                        </Link>
                      </td>

                      {/* 3. PHỤ TRÁCH */}
                      <td className="py-3.5 px-4">
                        {nguoiPhuTrach ? (
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                              {nguoiPhuTrach.ho_va_ten?.charAt(0) || 'N'}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {nguoiPhuTrach.ho_va_ten}
                              </div>
                              {nguoiPhuTrach.chuc_vu && (
                                <div className="text-[11px] text-slate-400 truncate">
                                  {nguoiPhuTrach.chuc_vu}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>

                      {/* 4. NGƯỜI LIÊN HỆ */}
                      <td className="py-3.5 px-4">
                        {lienHeChinh ? (
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{lienHeChinh.ho_va_ten}</span>
                              {lienHeChinh.chuc_vu && (
                                <span className="text-[11px] text-slate-500 font-normal">({lienHeChinh.chuc_vu})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                              {lienHeChinh.so_dien_thoai && (
                                <a
                                  href={`tel:${lienHeChinh.so_dien_thoai}`}
                                  className="inline-flex items-center gap-1 hover:text-emerald-700"
                                >
                                  <Phone className="size-3 text-slate-400" />
                                  <span>{lienHeChinh.so_dien_thoai}</span>
                                </a>
                              )}
                              {lienHeChinh.email && (
                                <span className="inline-flex items-center gap-1 text-slate-400">
                                  <Mail className="size-3" />
                                  <span className="truncate max-w-[120px]">{lienHeChinh.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có liên hệ</span>
                        )}
                      </td>

                      {/* 5. THAO TÁC */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Link
                            href={`/khach-hang/${kh.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => mo_chinh_sua(kh)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="size-4" />
                          </button>
                          {kh.trang_thai === 'da_xoa' ? (
                            <button
                              type="button"
                              disabled={Boolean(dang_xu_ly_khac[`khoi_phuc_${kh.id}`])}
                              onClick={() => xu_ly_khoi_phuc(kh)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50 cursor-pointer"
                              title="Khôi phục khách hàng"
                            >
                              <RotateCcw className="size-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(dang_xu_ly_khac[`doi_tt_${kh.id}`])}
                                onClick={() => xu_ly_doi_trang_thai(kh)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition disabled:opacity-50 cursor-pointer"
                                title={kh.trang_thai === 'hoat_dong' ? 'Tạm dừng' : 'Kích hoạt'}
                              >
                                {kh.trang_thai === 'hoat_dong' ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(dang_xu_ly_khac[`xoa_${kh.id}`])}
                                onClick={() => xu_ly_xoa_mem(kh)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                                title="Xóa vào thùng rác"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. GIAO DIỆN DANH SÁCH DỄ ĐỌC TRÊN MOBILE (chỉ hiện trên màn hình nhỏ) */}
          <div className="sm:hidden flex flex-col gap-2.5 p-3 bg-slate-50/50">
            {danhSachDaSapXep.map((kh, index) => {
              const soLuongDa = mapSoLuongDuAnTheoKhachHang.get(kh.id) || 0;
              const nguoiPhuTrach = kh.nguoi_phu_trach_id ? mapNhanSu.get(kh.nguoi_phu_trach_id) : null;
              const lienHeChinh = mapNguoiLienHeTheoKhachHang.get(kh.id);

              return (
                <div
                  key={kh.id}
                  className={cn(
                    "p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors relative",
                    kh.trang_thai === 'da_xoa' && 'opacity-70 bg-slate-50/50'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="pt-0.5 shrink-0">
                      <span className="text-slate-400 text-xs font-bold">{index + 1}.</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/khach-hang/${kh.id}`} className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 block hover:text-emerald-700">
                          {kh.ten_khach_hang}
                        </Link>
                        <Link
                          href={`/khach-hang/${kh.id}#du-an`}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0',
                            soLuongDa > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          )}
                        >
                          <FolderKanban className="size-3" />
                          <span>{soLuongDa} DA</span>
                        </Link>
                      </div>
                      
                      {/* Phụ trách & Người liên hệ */}
                      <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 mt-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-400 shrink-0">Phụ trách:</span>
                          <span className="font-medium text-slate-800 truncate">
                            {nguoiPhuTrach?.ho_va_ten || 'Chưa phân công'}
                          </span>
                        </div>
                        {lienHeChinh && (
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-slate-400 shrink-0">Liên hệ:</span>
                            <span className="font-medium text-slate-800 truncate">
                              {lienHeChinh.ho_va_ten} {lienHeChinh.so_dien_thoai ? `• ${lienHeChinh.so_dien_thoai}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 mt-1 pt-2 border-t border-slate-100">
                        {kh.so_dien_thoai ? (
                          <a href={`tel:${kh.so_dien_thoai}`} className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <Phone className="size-3 text-slate-400" />
                            <span>{kh.so_dien_thoai}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa có SĐT</span>
                        )}
                        {kh.trang_thai === 'da_xoa' && (
                          <button
                            type="button"
                            disabled={Boolean(dang_xu_ly_khac[`khoi_phuc_${kh.id}`])}
                            onClick={() => xu_ly_khoi_phuc(kh)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <RotateCcw className="size-3" strokeWidth={2.5} />
                            <span>Khôi phục</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
