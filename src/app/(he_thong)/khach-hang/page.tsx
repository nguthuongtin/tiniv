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
  Bo_Cuc_Trang,
  DaiDien,
  ThanhSoLieu,
  KhungDanhSach,
  DanhSachTheMobile,
  TheMobile,
  PhanTrang,
  NutIcon,
  Bang,
  ChuDeBang,
  ThanBang,
  HangBang,
  ODauBang,
  OBang
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
      <ThanhSoLieu
        muc={[
          {
            khoa: 'tat_ca',
            nhan: 'Tổng khách hàng',
            nhan_ngan: 'Tổng KH',
            gia_tri: so_luong_theo_trang_thai.tong,
            icon: Building2,
            dang_chon: dieu_kien.trang_thai === 'tat_ca',
            khi_bam: () => set_dieu_kien((d) => ({ ...d, trang_thai: 'tat_ca' }))
          },
          {
            khoa: 'hoat_dong',
            nhan: 'Đang hợp tác',
            nhan_ngan: 'Hợp tác',
            gia_tri: so_luong_theo_trang_thai.hoat_dong,
            icon: CheckCircle2,
            mau: 'thanh_cong',
            dang_chon: dieu_kien.trang_thai === 'hoat_dong',
            khi_bam: () => set_dieu_kien((d) => ({ ...d, trang_thai: 'hoat_dong' }))
          },
          {
            khoa: 'tam_dung',
            nhan: 'Tạm dừng',
            gia_tri: so_luong_theo_trang_thai.tam_dung,
            icon: AlertTriangle,
            mau: 'canh_bao',
            dang_chon: dieu_kien.trang_thai === 'tam_dung',
            khi_bam: () => set_dieu_kien((d) => ({ ...d, trang_thai: 'tam_dung' }))
          },
          {
            khoa: 'da_xoa',
            nhan: 'Đã xóa',
            gia_tri: so_luong_theo_trang_thai.da_xoa,
            icon: Trash2,
            mau: 'loi',
            dang_chon: dieu_kien.trang_thai === 'da_xoa',
            khi_bam: () => set_dieu_kien((d) => ({ ...d, trang_thai: 'da_xoa' }))
          }
        ]}
      />

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
        <KhungDanhSach
          tieu_de="Danh sách khách hàng"
          tieu_de_ngan="Khách hàng"
          so_luong={danhSachDaSapXep.length}
          hanh_dong={
            <Nut
              kich_thuoc="sm"
              icon_trai={Plus}
              onClick={mo_them_moi}
              title="Thêm khách hàng mới"
              aria-label="Thêm khách hàng mới"
            >
              <span className="hidden sm:inline">Thêm khách hàng</span>
            </Nut>
          }
          chan={
            <PhanTrang
              trang={trangHienTai}
              tong_trang={tongSoTrang}
              tong_ban_ghi={danhSachDaSapXep.length}
              don_vi="khách hàng"
              khi_doi={setTrangHienTai}
            />
          }
        >
          <div className="hidden sm:block">
            <Bang>
              <ChuDeBang>
                <HangBang className="border-slate-200/80 hover:bg-transparent">
                  <ODauBang className="w-14 px-4 text-center">STT</ODauBang>
                  <ODauBang className="min-w-[240px] px-4">Thông tin khách hàng</ODauBang>
                  <ODauBang className="w-28 px-4 text-center">Dự án</ODauBang>
                  <ODauBang className="min-w-[180px] px-4">Phụ trách</ODauBang>
                  <ODauBang className="min-w-[200px] px-4">Người liên hệ</ODauBang>
                  <ODauBang className="w-28 px-4 text-right">Thao tác</ODauBang>
                </HangBang>
              </ChuDeBang>
              <ThanBang>
                {danhSachTrangHienTai.map((kh, index) => {
                  const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
                  const soLuongDa = mapSoLuongDuAnTheoKhachHang.get(kh.id) || 0;
                  const nguoiPhuTrach = kh.nguoi_phu_trach_id ? mapNhanSu.get(kh.nguoi_phu_trach_id) : null;
                  const lienHeChinh = mapNguoiLienHeTheoKhachHang.get(kh.id);

                  return (
                    <HangBang key={kh.id} className={cn(kh.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/30')}>
                      <OBang className="px-4 py-3.5 text-center font-semibold text-slate-400 text-phu tabular-nums">
                        {stt}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <Link
                          href={`/khach-hang/${kh.id}`}
                          className="font-bold text-slate-900 text-noi-dung hover:text-emerald-700 transition-colors line-clamp-1"
                        >
                          {kh.ten_khach_hang}
                        </Link>
                        <div className="flex items-center gap-3 text-phu text-slate-500 mt-0.5 flex-wrap">
                          {kh.ma_so_thue && <span className="font-mono">MST: {kh.ma_so_thue}</span>}
                          {kh.so_dien_thoai && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3 text-slate-400" />
                              {kh.so_dien_thoai}
                            </span>
                          )}
                          {kh.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="size-3 text-slate-400" />
                              {kh.email}
                            </span>
                          )}
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5 text-center">
                        <Link
                          href={`/khach-hang/${kh.id}#du-an`}
                          title={`${soLuongDa} dự án`}
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-phu font-bold transition-all border',
                            soLuongDa > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/60'
                          )}
                        >
                          <FolderKanban className="size-3.5" />
                          <span>{soLuongDa}</span>
                        </Link>
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        {nguoiPhuTrach ? (
                          <div className="flex items-center gap-2">
                            <DaiDien ten={nguoiPhuTrach.ho_va_ten} kich_thuoc="xs" className="size-6 text-nhan" />
                            <div className="min-w-0">
                              <div className="text-phu font-semibold text-slate-900 truncate">
                                {nguoiPhuTrach.ho_va_ten}
                              </div>
                              {nguoiPhuTrach.chuc_vu && (
                                <div className="text-nhan text-slate-400 truncate">{nguoiPhuTrach.chuc_vu}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-phu text-slate-400">Chưa phân công</span>
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        {lienHeChinh ? (
                          <div className="min-w-0">
                            <div className="text-phu font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              <span>{lienHeChinh.ho_va_ten}</span>
                              {lienHeChinh.chuc_vu && (
                                <span className="text-nhan text-slate-500 font-normal">({lienHeChinh.chuc_vu})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-nhan text-slate-500 mt-0.5 flex-wrap">
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
                          <span className="text-phu text-slate-400">Chưa có liên hệ</span>
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <NutIcon href={`/khach-hang/${kh.id}`} icon={Eye} nhan="Xem chi tiết" sac="primary" />
                          <NutIcon icon={Pencil} nhan="Chỉnh sửa" onClick={() => mo_chinh_sua(kh)} />
                          {kh.trang_thai === 'da_xoa' ? (
                            <NutIcon
                              icon={RotateCcw}
                              nhan="Khôi phục khách hàng"
                              sac="primary"
                              disabled={Boolean(dang_xu_ly_khac[`khoi_phuc_${kh.id}`])}
                              onClick={() => xu_ly_khoi_phuc(kh)}
                            />
                          ) : (
                            <>
                              <NutIcon
                                icon={kh.trang_thai === 'hoat_dong' ? Lock : Unlock}
                                nhan={kh.trang_thai === 'hoat_dong' ? 'Tạm dừng' : 'Kích hoạt'}
                                sac="canh_bao"
                                disabled={Boolean(dang_xu_ly_khac[`doi_tt_${kh.id}`])}
                                onClick={() => xu_ly_doi_trang_thai(kh)}
                              />
                              <NutIcon
                                icon={Trash2}
                                nhan="Xóa vào thùng rác"
                                sac="loi"
                                disabled={Boolean(dang_xu_ly_khac[`xoa_${kh.id}`])}
                                onClick={() => xu_ly_xoa_mem(kh)}
                              />
                            </>
                          )}
                        </div>
                      </OBang>
                    </HangBang>
                  );
                })}
              </ThanBang>
            </Bang>
          </div>

          <DanhSachTheMobile>
            {danhSachTrangHienTai.map((kh, index) => {
              const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
              const soLuongDa = mapSoLuongDuAnTheoKhachHang.get(kh.id) || 0;
              const nguoiPhuTrach = kh.nguoi_phu_trach_id ? mapNhanSu.get(kh.nguoi_phu_trach_id) : null;
              const tenPhuTrachNgan = nguoiPhuTrach?.ho_va_ten
                ? nguoiPhuTrach.ho_va_ten.trim().split(/\s+/).slice(-2).join(' ')
                : null;
              const loaiKhNhan = TEN_LOAI_KH[kh.loai_khach_hang]?.nhan || 'Khách hàng';

              return (
                <TheMobile key={kh.id} mo_di={kh.trang_thai === 'da_xoa'}>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 text-nhan font-extrabold tabular-nums mt-0.5 shrink-0">
                      {stt}.
                    </span>
                    <Link href={`/khach-hang/${kh.id}`} className="flex-1 min-w-0">
                      <div className="text-noi-dung leading-snug">
                        <span className="font-bold text-slate-900">{kh.ten_khach_hang}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-nhan font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                          {loaiKhNhan}
                        </span>
                      </div>
                    </Link>

                    {kh.trang_thai === 'da_xoa' && (
                      <NutIcon
                        icon={RotateCcw}
                        nhan="Khôi phục khách hàng"
                        sac="primary"
                        className="shrink-0 -my-1"
                        disabled={Boolean(dang_xu_ly_khac[`khoi_phuc_${kh.id}`])}
                        onClick={() => xu_ly_khoi_phuc(kh)}
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/khach-hang/${kh.id}#du-an`}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-phu font-extrabold shrink-0 border',
                          soLuongDa > 0
                            ? 'bg-emerald-50/80 text-primary border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border-slate-200/60'
                        )}
                      >
                        <FolderKanban className="size-3" />
                        <span>{soLuongDa} DA</span>
                      </Link>
                      {kh.so_dien_thoai && (
                        <a
                          href={`tel:${kh.so_dien_thoai}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 text-nhan font-semibold hover:bg-emerald-50 hover:text-emerald-700 truncate"
                        >
                          <Phone className="size-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{kh.so_dien_thoai}</span>
                        </a>
                      )}
                    </div>

                    {tenPhuTrachNgan && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-nhan font-semibold text-slate-700 shrink-0">
                        {tenPhuTrachNgan}
                      </span>
                    )}
                  </div>
                </TheMobile>
              );
            })}
          </DanhSachTheMobile>
        </KhungDanhSach>
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
