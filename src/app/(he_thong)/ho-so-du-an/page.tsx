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
  DaiDien,
  ThanhSoLieu,
  KhungDanhSach,
  PhanTrang,
  NutIcon
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

const TEN_GIAI_DOAN_MAC_DINH: Record<
  string,
  { nhan: string; kieu: 'muted' | 'primary' | 'success' | 'warning' | 'danger' }
> = Object.fromEntries(
  DANH_SACH_GIAI_DOAN_MAC_DINH.map(x => [x.key, { nhan: x.nhan_day_du, kieu: x.kieu }])
);

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
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      <ThanhSoLieu
        items={[
          {
            id: 'tat_ca',
            nhan: 'Tổng dự án',
            nhan_ngan: 'Tổng dự án',
            so_lieu: thongKe.tongSo,
            icon: FolderKanban,
            mau_so: 'trang',
            dang_chon: dieukien.giai_doan === 'tat_ca' && dieukien.trang_thai === 'hoat_dong',
            khi_bam: () =>
              setDieukien((d) => ({ ...d, giai_doan: 'tat_ca', trang_thai: 'hoat_dong' })),
          },
          {
            id: 'dang_chay',
            nhan: 'Đang thực hiện',
            nhan_ngan: 'Đang chạy',
            so_lieu: thongKe.soDangThucHien,
            icon: TrendingUp,
            mau_so: 'xanh_la',
          },
          {
            id: 'hoan_thanh',
            nhan: 'Hoàn thành',
            nhan_ngan: 'Hoàn tất',
            so_lieu: thongKe.soHoanThanh,
            icon: CheckCircle2,
            mau_so: 'xanh_duong',
            dang_chon: dieukien.giai_doan === 'hoan_thanh',
            khi_bam: () =>
              setDieukien((d) => ({
                ...d,
                giai_doan: d.giai_doan === 'hoan_thanh' ? 'tat_ca' : 'hoan_thanh',
                trang_thai: 'hoat_dong',
              })),
          },
          {
            id: 'tong_gia_tri',
            nhan: 'Tổng giá trị',
            nhan_ngan: 'Giá trị',
            so_lieu: laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(thongKe.tongGiaTri),
            icon: Wallet,
            mau_so: 'vang',
          },
        ]}
      />

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
          <Loader2 className="size-5 animate-spin text-primary" strokeWidth={2.25} />
          <span className="text-noi-dung font-semibold">Đang tải danh sách...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <EmptyState onThemMoi={moThemMoi} />
      ) : (
        <KhungDanhSach
          tieu_de="Danh sách dự án"
          tieu_de_ngan="Dự án"
          so_luong={danhSachDaSapXep.length}
          hanh_dong={
            <>
              <Nut
                kieu="outline"
                kich_thuoc="sm"
                icon_trai={FileSpreadsheet}
                onClick={() => {
                  setCheDoXuatMacDinh(dsDuAnDaChonIds.size > 0 ? 'da_chon' : undefined);
                  setMoModalXuatExcel(true);
                }}
              >
                <span className="sm:hidden">Xuất</span>
                <span className="hidden sm:inline">Xuất Excel</span>
                {dsDuAnDaChonIds.size > 0 && (
                  <span className="size-4.5 rounded-full bg-primary text-white text-nhan font-bold flex items-center justify-center">
                    {dsDuAnDaChonIds.size}
                  </span>
                )}
              </Nut>
              <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoi}>
                <span className="hidden sm:inline">Thêm dự án</span>
              </Nut>
            </>
          }
          chan_trang={
            <PhanTrang
              trang_hien_tai={trangHienTai}
              tong_so_trang={tongSoTrang}
              tong_so_ban_ghi={danhSachDaSapXep.length}
              so_ban_ghi_moi_trang={SO_BAN_GHI_MOI_TRANG}
              ten_don_vi="dự án"
              khi_chuyen_trang={setTrangHienTai}
            />
          }
        >
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
                    "bg-white rounded-[var(--radius-card)] border border-slate-200/80 p-3.5 sm:p-4 shadow-nhe hover:border-emerald-300/80 transition-all duration-200 relative group flex flex-col",
                    hda.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/50 grayscale-[30%]',
                    duocChon && 'border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                  )}
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <label className="pt-0.5 cursor-pointer flex items-center">
                      <input type="checkbox" checked={duocChon} onChange={() => toggleChonDuAn(hda.id)} className="custom-check" />
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className="text-nhan font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60 leading-none tabular-nums">
                          #{stt < 10 ? `0${stt}` : stt}
                        </span>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-nhan font-semibold border", styleColor.badge)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", styleColor.dotBg, hda.giai_doan === 'moi_tao' && 'animate-pulse')}></span>
                          {hda.trang_thai === 'da_xoa' ? 'Đã xóa' : gd.nhan}
                        </span>
                        <span className="ml-auto text-nhan text-slate-400 font-medium truncate">
                          {hda.ngay_tao ? formatNgay(hda.ngay_tao.slice(0, 10)) : 'Hôm nay'}
                        </span>
                      </div>

                      <Link href={`/ho-so-du-an/${hda.id}`}>
                        <h3 className="text-noi-dung font-bold text-slate-900 leading-snug line-clamp-2 mt-1 hover:text-primary transition-colors">
                          {hda.ten_du_an}
                        </h3>
                      </Link>

                      {kh && (
                        <div className="mt-1 flex items-center gap-1.5 text-phu font-medium text-slate-500 truncate">
                          <Building2 className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{kh.ten_khach_hang}</span>
                        </div>
                      )}

                      <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", styleColor.dotBg)} style={{ width: styleColor.barWidth }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between gap-2">
                    <div className="px-2.5 py-0.5 rounded-lg bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 font-bold text-phu tabular-nums truncate max-w-[130px]">
                      {giaTri}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {nguoiLead ? (
                        <div className="flex items-center gap-1.5 mr-1">
                          <DaiDien ten={nguoiLead.ho_va_ten} kich_thuoc="sm" />
                          <span className="text-phu font-medium text-slate-600 truncate max-w-[90px]">
                            {nguoiLead.ho_va_ten.split(' ').pop()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-nhan text-slate-400 italic mr-1">Chưa gán</span>
                      )}
                      <NutIcon icon={Eye} tieu_de="Xem chi tiết" href={`/ho-so-du-an/${hda.id}`} />
                      <NutIcon icon={Pencil} tieu_de="Chỉnh sửa" onClick={() => moSua(hda)} />
                      {hda.trang_thai === 'da_xoa' && coQuyenKhoiPhuc ? (
                        <NutIcon
                          icon={RotateCcw}
                          tieu_de="Khôi phục"
                          mau="primary"
                          disabled={dangXuLyKhac === hda.id}
                          onClick={() => xuLyKhoiPhuc(hda)}
                        />
                      ) : coQuyenXoa ? (
                        <NutIcon
                          icon={Trash2}
                          tieu_de="Xóa"
                          mau="loi"
                          disabled={dangXuLyKhac === hda.id}
                          onClick={() => xuLyXoa(hda)}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </KhungDanhSach>
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
