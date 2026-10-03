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
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FolderKanban
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '../../../thu_vien/utils/cn';
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
  layCacheKhachHangDongBo,
  locDanhSachKhachHangTrenRam,
  taoKhachHangMoi,
  capNhatKhachHang,
  doiTrangThaiKhachHang,
  xoaMemKhachHang,
  khoiPhucKhachHang
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachChiNhanh, layCacheChiNhanhDongBo } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachNhanSu, layCacheNhanSuDongBo } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn, layCacheHoSoDuAnDongBo } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNguoiLienHe, layCacheNguoiLienHeDongBo } from '../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { duocXemKhachHang, duocXemHoSoDuAn } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import BoLocKhachHang from '../../../thanh_phan/khach_hang/bo_loc_khach_hang';
import FormKhachHangDrawer from '../../../thanh_phan/khach_hang/form_khach_hang_drawer';
import {
  Nut,
  Rong,
  Bo_Cuc_Trang
} from '../../../thanh_phan/ui';

const SO_BAN_GHI_MOI_TRANG = 20;

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

  // Khởi tạo tức thì từ RAM cache (0ms, không chớp màn hình loading nếu đã nạp dữ liệu trong phiên)
  const [danh_sach_goc, set_danh_sach_goc] = useState<KhachHang[]>(
    () => layCacheKhachHangDongBo({ trang_thai: 'tat_ca' })?.mang ?? []
  );
  const [dang_tai, set_dang_tai] = useState<boolean>(
    () => layCacheKhachHangDongBo({ trang_thai: 'tat_ca' }) === null
  );
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>(
    () => layCacheChiNhanhDongBo({ trang_thai_du_lieu: 'hoat_dong' })?.mang ?? []
  );
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>(
    () => layCacheNhanSuDongBo({ trang_thai_du_lieu: 'hoat_dong' })?.mang ?? []
  );
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>(
    () => layCacheHoSoDuAnDongBo({ trang_thai: 'tat_ca' })?.mang ?? []
  );
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>(
    () => layCacheNguoiLienHeDongBo()?.mang ?? []
  );
  const [dieu_kien, set_dieu_kien] = useState<DieuKienLocKhachHang>(BO_LOC_MAC_DINH);
  const [trangHienTai, setTrangHienTai] = useState<number>(1);

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

  // Chỉ tải dữ liệu gốc 1 lần khi vào trang (và tận dụng RAM cache), KHÔNG gọi lại khi gõ tìm kiếm hay đổi bộ lọc!
  useEffect(() => {
    let huy = false;
    const daCoCacheKH = layCacheKhachHangDongBo({ trang_thai: 'tat_ca' }) !== null;
    if (!daCoCacheKH) {
      set_dang_tai(true);
    }

    (async () => {
      try {
        // Ưu tiên mở khóa danh sách khách hàng ngay khi danhSachKhachHang xong
        const resKh = await danhSachKhachHang({ trang_thai: 'tat_ca' });
        if (huy) return;
        set_danh_sach_goc(resKh.mang);
        set_dang_tai(false);

        // Các dữ liệu phụ trợ (Dự án, Liên hệ, Chi nhánh, Nhân sự) nạp song song không chặn giao diện
        const [resHda, resNlh, resCN, resNS] = await Promise.allSettled([
          danhSachHoSoDuAn({ trang_thai: 'tat_ca' }),
          danhSachNguoiLienHe(),
          danhSachChiNhanh({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' })
        ]);
        if (huy) return;
        if (resHda.status === 'fulfilled') setDsDuAn(resHda.value.mang);
        if (resNlh.status === 'fulfilled') setDsNguoiLienHe(resNlh.value.mang);
        if (resCN.status === 'fulfilled') setDsChiNhanh(resCN.value.mang);
        if (resNS.status === 'fulfilled') setDsNhanSu(resNS.value.mang);
      } catch (err: any) {
        if (!huy) {
          them_thong_bao('loi', 'Tải danh sách khách hàng lỗi: ' + (err?.message ?? ''));
          set_dang_tai(false);
        }
      }
    })();

    return () => {
      huy = true;
    };
  }, [them_thong_bao]);

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

  const capNhatBanGhiTrongState = useCallback((khCapNhat: KhachHang) => {
    set_danh_sach_goc((prev) => {
      const idx = prev.findIndex((item) => item.id === khCapNhat.id);
      if (idx === -1) return [khCapNhat, ...prev];
      const next = [...prev];
      next[idx] = khCapNhat;
      return next;
    });
  }, []);

  const xu_ly_luu_form = async (dto: TaoMoiKhachHangDTO | CapNhatKhachHangDTO) => {
    set_dang_xu_ly_form(true);
    set_loi_form(null);
    try {
      if ('id' in dto) {
        const daCapNhat = await capNhatKhachHang(dto as CapNhatKhachHangDTO, nguoi_dung_hien_tai ?? null);
        capNhatBanGhiTrongState(daCapNhat);
        them_thong_bao('thanh_cong', `Đã cập nhật khách hàng "${daCapNhat.ten_khach_hang}"`);
        set_mo_drawer(false);
        set_dang_sua(null);
      } else {
        const moi = await taoKhachHangMoi(dto as TaoMoiKhachHangDTO, nguoi_dung_hien_tai ?? null);
        capNhatBanGhiTrongState(moi);
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
      const daCapNhat = await doiTrangThaiKhachHang(kh.id, trang_thai_moi, nguoi_dung_hien_tai ?? null);
      capNhatBanGhiTrongState(daCapNhat);
      them_thong_bao(
        'thanh_cong',
        `Đã ${trang_thai_moi === 'hoat_dong' ? 'mở khóa' : 'khóa'} khách hàng "${kh.ten_khach_hang}"`
      );
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
      const daXoa = await xoaMemKhachHang(kh.id, nguoi_dung_hien_tai ?? null);
      capNhatBanGhiTrongState(daXoa);
      them_thong_bao('thanh_cong', `Đã chuyển khách hàng "${kh.ten_khach_hang}" vào thùng rác`);
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
      const daKhoiPhuc = await khoiPhucKhachHang(kh.id, nguoi_dung_hien_tai ?? null);
      capNhatBanGhiTrongState(daKhoiPhuc);
      them_thong_bao('thanh_cong', `Đã khôi phục khách hàng "${kh.ten_khach_hang}"`);
    } catch (err: any) {
      them_thong_bao('loi', 'Không thể khôi phục: ' + (err?.message ?? ''));
    } finally {
      set_dang_xu_ly_khac((o) => ({ ...o, [key]: false }));
    }
  };

  const [kieuSapXep, setKieuSapXep] = useState<'moi_nhat' | 'cu_nhat' | 'ten_az'>('moi_nhat');

  // Reset về trang 1 khi thay đổi bộ lọc hoặc kiểu sắp xếp
  useEffect(() => {
    setTrangHienTai(1);
  }, [dieu_kien, kieuSapXep]);

  // Bước 1: Lọc theo phân quyền người dùng trên RAM
  const danhSachDuocQuyenXem = useMemo(() => {
    const vaiTroKey = String(nguoi_dung_hien_tai?.vai_tro || '');
    const laQuanLy = vaiTroKey === 'quan_tri_he_thong' || vaiTroKey === 'giam_doc' || vaiTroKey === 'truong_phong';
    const dsDuAnCuaToi = laQuanLy ? dsDuAn : dsDuAn.filter((hda) => duocXemHoSoDuAn(nguoi_dung_hien_tai, hda));
    const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);

    return danh_sach_goc.filter((kh) =>
      duocXemKhachHang(nguoi_dung_hien_tai, kh, undefined, dsKhachHangIdsCoDuAn)
    );
  }, [danh_sach_goc, dsDuAn, nguoi_dung_hien_tai]);

  // Bước 2: Thống kê số lượng theo trạng thái (dựa trên các điều kiện lọc khác ngoài trạng thái)
  const so_luong_theo_trang_thai = useMemo(() => {
    const dsTheoBoLocKhac = locDanhSachKhachHangTrenRam(danhSachDuocQuyenXem, {
      ...dieu_kien,
      trang_thai: 'tat_ca'
    });
    const r = { hoat_dong: 0, tam_dung: 0, da_xoa: 0, tong: 0 };
    for (const k of dsTheoBoLocKhac) {
      if (k.trang_thai === 'hoat_dong') {
        r.hoat_dong++;
        r.tong++;
      } else if (k.trang_thai === 'tam_dung') {
        r.tam_dung++;
        r.tong++;
      } else {
        r.da_xoa++;
      }
    }
    return r;
  }, [danhSachDuocQuyenXem, dieu_kien]);

  // Bước 3: Lọc tức thì trên RAM (< 1ms) khi gõ từ khóa hoặc đổi dropdown lọc
  const danh_sach = useMemo(() => {
    return locDanhSachKhachHangTrenRam(danhSachDuocQuyenXem, dieu_kien);
  }, [danhSachDuocQuyenXem, dieu_kien]);

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
      ds.sort((a, b) => (a.ten_khach_hang || '').localeCompare(b.ten_khach_hang || '', 'vi'));
    }
    return ds;
  }, [danh_sach, kieuSapXep]);

  const tongSoTrang = Math.max(1, Math.ceil(danhSachDaSapXep.length / SO_BAN_GHI_MOI_TRANG));
  const danhSachTrangHienTai = useMemo(() => {
    const batDau = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG;
    return danhSachDaSapXep.slice(batDau, batDau + SO_BAN_GHI_MOI_TRANG);
  }, [danhSachDaSapXep, trangHienTai]);

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-6">
      {/* One UI 9 Now Brief Summary trên Mobile (Hỗ trợ nhấp chọn nhanh trạng thái) */}
      <div className="sm:hidden bg-gradient-to-br from-[#0e3e2d] via-[#13503b] to-[#185942] rounded-[26px] p-3.5 text-white shadow-[0_8px_24px_rgba(14,62,45,0.16)]">
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'tat_ca' }))}
            className={cn(
              'rounded-[16px] py-2 px-1 text-center border transition active:scale-95 cursor-pointer',
              dieu_kien.trang_thai === 'tat_ca' ? 'bg-white/20 border-white/40' : 'bg-white/12 border-white/10'
            )}
          >
            <div className="text-[16px] font-extrabold text-white tabular-nums leading-tight">{so_luong_theo_trang_thai.tong}</div>
            <div className="text-[10px] font-medium text-emerald-100/85 whitespace-nowrap mt-0.5">Tổng KH</div>
          </button>
          <button
            type="button"
            onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'hoat_dong' }))}
            className={cn(
              'rounded-[16px] py-2 px-1 text-center border transition active:scale-95 cursor-pointer',
              dieu_kien.trang_thai === 'hoat_dong' ? 'bg-white/20 border-emerald-300/50' : 'bg-white/10 border-white/5'
            )}
          >
            <div className="text-[16px] font-extrabold text-emerald-300 tabular-nums leading-tight">{so_luong_theo_trang_thai.hoat_dong}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Hợp tác</div>
          </button>
          <button
            type="button"
            onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'tam_dung' }))}
            className={cn(
              'rounded-[16px] py-2 px-1 text-center border transition active:scale-95 cursor-pointer',
              dieu_kien.trang_thai === 'tam_dung' ? 'bg-white/20 border-amber-300/50' : 'bg-white/10 border-white/5'
            )}
          >
            <div className="text-[16px] font-extrabold text-amber-300 tabular-nums leading-tight">{so_luong_theo_trang_thai.tam_dung}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Tạm dừng</div>
          </button>
          <button
            type="button"
            onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'da_xoa' }))}
            className={cn(
              'rounded-[16px] py-2 px-1 text-center border transition active:scale-95 cursor-pointer',
              dieu_kien.trang_thai === 'da_xoa' ? 'bg-white/20 border-rose-300/50' : 'bg-white/10 border-white/5'
            )}
          >
            <div className="text-[16px] font-extrabold text-rose-300 tabular-nums leading-tight">{so_luong_theo_trang_thai.da_xoa}</div>
            <div className="text-[10px] font-medium text-emerald-100/80 whitespace-nowrap mt-0.5">Đã xóa</div>
          </button>
        </div>
      </div>

      {/* Bảng số liệu điều hành chuẩn Forest Green Banner trên Desktop (hỗ trợ nhấp lọc nhanh) */}
      <div className="hidden sm:grid sm:grid-cols-4 bg-[#0e3e2d] rounded-2xl p-3.5 gap-3 shadow-sm border border-emerald-950/20">
        {/* 1. Tổng khách hàng */}
        <button
          type="button"
          onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'tat_ca' }))}
          className={cn(
            'rounded-xl p-3.5 flex items-center gap-3 text-left transition cursor-pointer border',
            dieu_kien.trang_thai === 'tat_ca'
              ? 'bg-[#1f6e52] border-emerald-300/40 shadow-xs'
              : 'bg-[#185942] border-transparent hover:bg-[#1c644b]'
          )}
        >
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
          </div>
        </button>

        {/* 2. Đang hợp tác */}
        <button
          type="button"
          onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'hoat_dong' }))}
          className={cn(
            'rounded-xl p-3.5 flex items-center gap-3 text-left transition cursor-pointer border',
            dieu_kien.trang_thai === 'hoat_dong'
              ? 'bg-[#1f6e52] border-emerald-300/40 shadow-xs'
              : 'bg-[#185942] border-transparent hover:bg-[#1c644b]'
          )}
        >
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
          </div>
        </button>

        {/* 3. Tạm dừng */}
        <button
          type="button"
          onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'tam_dung' }))}
          className={cn(
            'rounded-xl p-3.5 flex items-center gap-3 text-left transition cursor-pointer border',
            dieu_kien.trang_thai === 'tam_dung'
              ? 'bg-[#1f6e52] border-amber-300/40 shadow-xs'
              : 'bg-[#185942] border-transparent hover:bg-[#1c644b]'
          )}
        >
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
          </div>
        </button>

        {/* 4. Đã xóa */}
        <button
          type="button"
          onClick={() => set_dieu_kien((d) => ({ ...d, trang_thai: 'da_xoa' }))}
          className={cn(
            'rounded-xl p-3.5 flex items-center gap-3 text-left transition cursor-pointer border',
            dieu_kien.trang_thai === 'da_xoa'
              ? 'bg-[#1f6e52] border-rose-300/40 shadow-xs'
              : 'bg-[#185942] border-transparent hover:bg-[#1c644b]'
          )}
        >
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
          </div>
        </button>
      </div>

      <BoLocKhachHang
        gia_tri_hien_tai={dieu_kien}
        khi_thay_doi={set_dieu_kien}
        dsChiNhanh={dsChiNhanh}
        dsNhanSu={dsNhanSu}
        kieu_sap_xep={kieuSapXep}
        khi_doi_sap_xep={setKieuSapXep}
      />

      {dang_tai ? (
        <div className="rounded-[24px] border border-border bg-background p-12 flex items-center justify-center text-muted-foreground gap-5 shadow-[var(--shadow-card)]">
          <Loader2 className="size-7 animate-spin text-primary" strokeWidth={2.25} />
          <span className="text-[14.5px] font-semibold leading-body">Đang tải danh sách khách hàng...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <KhongCoDuLieu onThemMoi={mo_them_moi} />
      ) : (
        <div className="bg-white rounded-[26px] sm:rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden">
          {/* Header danh sách: Gọn gàng trên 1 hàng cả Mobile & Desktop */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-100 sm:border-slate-200/80 bg-white">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <h2 className="text-[14px] sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                <span className="sm:hidden">Khách hàng</span>
                <span className="hidden sm:inline">Danh sách khách hàng</span>
              </h2>
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/80 tabular-nums shrink-0">
                {danhSachDaSapXep.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={mo_them_moi}
                title="Thêm khách hàng mới"
                aria-label="Thêm khách hàng mới"
                className="inline-flex items-center justify-center gap-1.5 size-8 sm:size-auto sm:px-3.5 sm:py-2 rounded-full sm:rounded-xl bg-[#107555] hover:bg-emerald-800 active:scale-95 text-white text-[12px] sm:text-sm font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Thêm khách hàng</span>
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
                {danhSachTrangHienTai.map((kh, index) => {
                  const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
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
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs tabular-nums">
                        {stt}
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

          {/* 2. GIAO DIỆN THẺ SQUIRCLE ONE UI 9 TRÊN MOBILE */}
          <div className="sm:hidden flex flex-col gap-2.5 p-2.5 bg-slate-100/70">
            {danhSachTrangHienTai.map((kh, index) => {
              const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
              const soLuongDa = mapSoLuongDuAnTheoKhachHang.get(kh.id) || 0;
              const nguoiPhuTrach = kh.nguoi_phu_trach_id ? mapNhanSu.get(kh.nguoi_phu_trach_id) : null;
              const tenPhuTrachNgan = nguoiPhuTrach?.ho_va_ten
                ? nguoiPhuTrach.ho_va_ten.trim().split(/\s+/).slice(-2).join(' ')
                : null;
              const loaiKhNhan = TEN_LOAI_KH[kh.loai_khach_hang]?.nhan || 'Khách hàng';

              return (
                <div
                  key={kh.id}
                  className={cn(
                    "p-3.5 bg-white rounded-[22px] border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-colors relative",
                    kh.trang_thai === 'da_xoa' && 'opacity-70 bg-slate-50/50'
                  )}
                >
                  {/* Hàng 1: STT + Tên khách hàng + Phân loại chìm ngay sau tên */}
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 text-[11.5px] font-extrabold tabular-nums mt-0.5 shrink-0">
                      {stt}.
                    </span>
                    <Link href={`/khach-hang/${kh.id}`} className="flex-1 min-w-0 group">
                      <div className="text-[14.5px] leading-snug">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {kh.ten_khach_hang}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                          {loaiKhNhan}
                        </span>
                      </div>
                    </Link>

                    {kh.trang_thai === 'da_xoa' && (
                      <button
                        type="button"
                        disabled={Boolean(dang_xu_ly_khac[`khoi_phuc_${kh.id}`])}
                        onClick={() => xu_ly_khoi_phuc(kh)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white active:scale-95 transition cursor-pointer shrink-0"
                      >
                        <RotateCcw className="size-3" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>

                  {/* Hàng 2 (Footer): Số dự án + SĐT bên trái | Người phụ trách bên phải */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/khach-hang/${kh.id}#du-an`}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-extrabold shrink-0',
                          soLuongDa > 0
                            ? 'bg-emerald-50/80 text-[#107555] border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                        )}
                      >
                        <FolderKanban className="size-3" />
                        <span>{soLuongDa} DA</span>
                      </Link>
                      {kh.so_dien_thoai && (
                        <a
                          href={`tel:${kh.so_dien_thoai}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 text-[11.5px] font-semibold hover:bg-emerald-50 hover:text-emerald-700 truncate"
                        >
                          <Phone className="size-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{kh.so_dien_thoai}</span>
                        </a>
                      )}
                    </div>

                    {tenPhuTrachNgan && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700 shrink-0">
                        {tenPhuTrachNgan}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Thanh phân trang */}
          {tongSoTrang > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 bg-white">
              <div className="text-xs font-semibold text-slate-500 tabular-nums">
                Trang <span className="text-slate-900 font-bold">{trangHienTai}</span> / {tongSoTrang} ({danhSachDaSapXep.length} khách hàng)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={trangHienTai <= 1}
                  onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Trước</span>
                </button>
                <button
                  type="button"
                  disabled={trangHienTai >= tongSoTrang}
                  onClick={() => setTrangHienTai((p) => Math.min(tongSoTrang, p + 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition"
                >
                  <span>Sau</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
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
