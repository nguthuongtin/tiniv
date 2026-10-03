'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  UserRound,
  UsersRound,
  UserCog,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  X,
  Lock,
  Unlock,
  Building2,
  Layers,
  Wrench,
  FileText,
  Eye,
  Mail,
  Phone,
  Send,
  ShieldAlert,
  Briefcase,
  FolderKanban,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  User,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { NhanSu } from '../../../thu_vien/types/nhan_su';
import type { ChiNhanh, PhongBan, VaiTro, ChucVu } from '../../../thu_vien/types/nhan_su';
import type {
  CapNhatNhanSuDTO,
  DieuKienLocNhanSu,
  TaoMoiNhanSuDTO
} from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import {
  danhSachNhanSu,
  taoNhanSuMoi,
  capNhatNhanSu,
  khoaHoacMoTaiKhoan,
  doiMatKhauNhanSu,
  guiEmailDatLaiMatKhau,
  xoaMemNhanSu,
  khoiPhucNhanSu,
  chonThongTinVaiTro
} from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachVaiTro } from '../../../dich_vu/nhan_su/dich_vu_vai_tro';
import { danhSachChucVu } from '../../../dich_vu/nhan_su/dich_vu_chuc_vu';
import BoLocNhanSu from '../../../thanh_phan/nhan_su/bo_loc_nhan_su';
import FormNhanSuDrawer from '../../../thanh_phan/nhan_su/form_nhan_su_drawer';
import {
  Bo_Cuc_Trang,
  Nut,
  Hieu,
  Rong,
  DaiDien,
  Nhan,
  ThanhSoLieu,
  KhungDanhSach,
  DanhSachTheMobile,
  TheMobile,
  NutIcon,
  Bang,
  ChuDeBang,
  ThanBang,
  HangBang,
  ODauBang,
  OBang
} from '../../../thanh_phan/ui';

const BO_LOC_MAC_DINH: DieuKienLocNhanSu = {
  tuKhoa: null,
  vai_tro: 'tat_ca',
  chi_nhanh_id: null,
  phong_ban_id: null,
  trang_thai_tk: 'tat_ca',
  trang_thai_hoat_dong: 'tat_ca',
  trang_thai_du_lieu: 'hoat_dong',
  ngay_tao_tu_ngay: null,
  ngay_tao_den_ngay: null
};

interface ThongBaoToast {
  id: number;
  dang: 'thanh_cong' | 'loi';
  noi_dung: string;
}

const MAU_ICON_MAC_DINH_THEO_KIEU: Record<VaiTro['kieu_hien_thi'] | 'tong' | 'da_khoa', { mau_icon: string; chu_label: string; icon: any }> = {
  muted:   { mau_icon: 'bg-muted text-muted-foreground border border-border',                                              chu_label: 'text-muted-foreground',    icon: UserRound },
  primary: { mau_icon: 'bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary',          chu_label: 'text-primary',             icon: UserCog   },
  success: { mau_icon: 'bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success',          chu_label: 'text-success',             icon: UsersRound },
  warning: { mau_icon: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning',          chu_label: 'text-warning',             icon: Building2 },
  danger:  { mau_icon: 'bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger',             chu_label: 'text-danger',              icon: UserRound  },
  secondary:{mau_icon: 'bg-card-icon-bg-secondary text-card-icon-fg-secondary border border-card-icon-br-secondary',   chu_label: 'text-secondary-foreground',icon: FileText   },
  tong:    { mau_icon: 'bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted',                chu_label: 'text-muted-foreground',    icon: UserRound },
  da_khoa: { mau_icon: 'bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger',             chu_label: 'text-danger',              icon: Lock       }
};

export default function TrangNhanSu() {
  const router = useRouter();
  const { nguoiDungHienTai, _layCredentialTam } = useStoreXacThuc();

  const [dangTai, setDangTai] = useState<boolean>(true);
  const [danhSach, setDanhSach] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsVaiTroNS, setDsVaiTroNS] = useState<VaiTro[]>([]);
  const [dsChucVuNS, setDsChucVuNS] = useState<ChucVu[]>([]);
  const [dieukien, setDieuKien] = useState<DieuKienLocNhanSu>(BO_LOC_MAC_DINH);

  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSua, setDangSua] = useState<NhanSu | null>(null);
  const [dangXuLyForm, setDangXuLyForm] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  const [dsToast, setDsToast] = useState<ThongBaoToast[]>([]);
  const [dangXuLyKhac, setDangXuLyKhac] = useState<Record<string, boolean>>({});

  const [moModalDoiMk, setMoModalDoiMk] = useState<NhanSu | null>(null);
  const [mkMoiModal, setMkMoiModal] = useState('');
  const [nhapLaiMkModal, setNhapLaiMkModal] = useState('');
  const [dangXuLyMk, setDangXuLyMk] = useState(false);
  const [loiMk, setLoiMk] = useState<string | null>(null);

  const duocQuanLyNhanSu = coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTroNS);
  const duocXemNhanSu = coQuyen(nguoiDungHienTai, 'nhan_su.xem', dsVaiTroNS) || duocQuanLyNhanSu;

  const [kieuSapXep, setKieuSapXep] = useState<'moi_nhat' | 'cu_nhat' | 'ten_az'>('moi_nhat');

  const danhSachDaSapXep = useMemo(() => {
    const ds = [...danhSach];
    if (kieuSapXep === 'moi_nhat') {
      ds.sort((a, b) => (b.ngay_tao ?? '').localeCompare(a.ngay_tao ?? ''));
    } else if (kieuSapXep === 'cu_nhat') {
      ds.sort((a, b) => (a.ngay_tao ?? '').localeCompare(b.ngay_tao ?? ''));
    } else if (kieuSapXep === 'ten_az') {
      ds.sort((a, b) => (a.ho_va_ten || '').localeCompare(b.ho_va_ten || ''));
    }
    return ds;
  }, [danhSach, kieuSapXep]);

  const themToast = useCallback((dang: ThongBaoToast['dang'], noi_dung: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setDsToast((trc) => [...trc, { id, dang, noi_dung }]);
    setTimeout(() => {
      setDsToast((trc) => trc.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const taiLai = useCallback(async () => {
    if (!coQuyen(nguoiDungHienTai, 'nhan_su.xem') && !coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly')) {
      setDangTai(false);
      return;
    }
    setDangTai(true);
    try {
      const [kqNs, kqCn, kqPb, kqVaiTro, kqChucVu] = await Promise.all([
        danhSachNhanSu(dieukien),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachVaiTro(),
        danhSachChucVu()
      ]);
      setDanhSach(kqNs.mang);
      setDsChiNhanh(kqCn.mang);
      setDsPhongBan(kqPb.mang);
      setDsVaiTroNS(kqVaiTro.mang);
      setDsChucVuNS(kqChucVu.mang);
    } catch (e) {
      themToast('loi', 'Tải danh sách nhân sự thất bại: ' + (e as Error).message);
    } finally {
      setDangTai(false);
    }
  }, [dieukien, themToast]);

  useEffect(() => {
    void taiLai();
  }, [taiLai]);

  useEffect(() => {
    const handler = () => {
      setDangSua(null);
      setLoiForm(null);
      setMoDrawer(true);
    };
    window.addEventListener('ebms:nhan_su:them_moi', handler);
    return () => window.removeEventListener('ebms:nhan_su:them_moi', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      void taiLai();
    };
    window.addEventListener('ebms:chuc_vu:cap_nhat', handler);
    return () => window.removeEventListener('ebms:chuc_vu:cap_nhat', handler);
  }, [taiLai]);

  const thongKe = useMemo(() => {
    const theoVaiTro = (vt: string) =>
      danhSach.filter((x) => x.vai_tro === vt).length;
    const ketQua: Record<string, number> = {
      tong: danhSach.length,
      da_khoa: danhSach.filter((x) => !x.trang_thai).length
    };
    if (dsVaiTroNS.length > 0) {
      for (const vt of dsVaiTroNS) {
        ketQua[vt.id] = theoVaiTro(vt.id);
        if (vt.ma_vai_tro) ketQua[vt.ma_vai_tro] = theoVaiTro(vt.ma_vai_tro);
      }
    } else {
      ketQua.quan_tri_he_thong = theoVaiTro('quan_tri_he_thong');
      ketQua.giam_doc = theoVaiTro('giam_doc');
      ketQua.truong_phong = theoVaiTro('truong_phong');
      ketQua.nhan_vien_kinh_doanh = theoVaiTro('nhan_vien_kinh_doanh');
      ketQua.nhan_vien_ky_thuat = theoVaiTro('nhan_vien_ky_thuat');
      ketQua.hanh_chinh_van_phong = theoVaiTro('hanh_chinh_van_phong');
    }
    return ketQua;
  }, [danhSach, dsVaiTroNS]);

  const moTaoMoi = () => {
    setDangSua(null);
    setLoiForm(null);
    setMoDrawer(true);
  };

  const moChinhSua = (ns: NhanSu) => {
    setDangSua(ns);
    setLoiForm(null);
    setMoDrawer(true);
  };

  const xuLyLuuForm = async (
    data: TaoMoiNhanSuDTO | CapNhatNhanSuDTO,
    banGhi?: NhanSu
  ) => {
    setDangXuLyForm(true);
    setLoiForm(null);
    const nguoiThucHienCast = nguoiDungHienTai as unknown as Pick<NhanSu, 'id' | 'vai_tro'> | null;
    try {
      if (banGhi) {
        await capNhatNhanSu(banGhi.id, data as CapNhatNhanSuDTO, nguoiThucHienCast);
        themToast('thanh_cong', `Đã cập nhật thông tin nhân viên.`);
        setMoDrawer(false);
        setDangSua(null);
        await taiLai();
      } else {
        const resMoi = await taoNhanSuMoi(
          data as TaoMoiNhanSuDTO,
          nguoiThucHienCast
        );
        const mkHienThi = (data as TaoMoiNhanSuDTO).mat_khau?.trim() || 'Ebms@2026';
        themToast('thanh_cong', `Đã tạo tài khoản cho ${resMoi.ho_va_ten}. Mật khẩu: ${mkHienThi}`);
        setMoDrawer(false);
        setDangSua(null);
        router.push(`/nhan-su/${resMoi.id}`);
        return;
      }
    } catch (e) {
      const msg = (e as Error).message;
      setLoiForm(msg);
      themToast('loi', msg);
    } finally {
      setDangXuLyForm(false);
    }
  };

  const xuLyKhoaHoacMo = async (ns: NhanSu) => {
    const khoa = ns.trang_thai;
    if (khoa && !confirm(`Bạn chắc chắn KHÓA tài khoản "${ns.ho_va_ten}"? Người này sẽ không đăng nhập được nữa.`)) return;
    if (!khoa && !confirm(`Bạn chắc chắn MỞ KHÓA tài khoản "${ns.ho_va_ten}"?`)) return;
    setDangXuLyKhac((t) => ({ ...t, [`khoa_${ns.id}`]: true }));
    try {
      await khoaHoacMoTaiKhoan(ns.id, khoa, nguoiDungHienTai);
      themToast('thanh_cong', khoa ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
      await taiLai();
    } catch (e) {
      themToast('loi', 'Xử lý thất bại: ' + (e as Error).message);
    } finally {
      setDangXuLyKhac((t) => {
        const m = { ...t };
        delete m[`khoa_${ns.id}`];
        return m;
      });
    }
  };

  const xuLyXoa = async (ns: NhanSu) => {
    if (!confirm(`Bạn chắc muốn XÓA MỀM nhân viên "${ns.ho_va_ten}" (${ns.ma_nhan_vien})? Tài khoản sẽ bị khóa và ẩn khỏi danh sách.`)) return;
    setDangXuLyKhac((t) => ({ ...t, [`xoa_${ns.id}`]: true }));
    try {
      await xoaMemNhanSu(ns.id, nguoiDungHienTai);
      themToast('thanh_cong', 'Đã xóa mềm nhân viên.');
      await taiLai();
    } catch (e) {
      themToast('loi', 'Xóa thất bại: ' + (e as Error).message);
    } finally {
      setDangXuLyKhac((t) => {
        const m = { ...t };
        delete m[`xoa_${ns.id}`];
        return m;
      });
    }
  };

  const xuLyKhoiPhuc = async (ns: NhanSu) => {
    setDangXuLyKhac((t) => ({ ...t, [`khoi_phuc_${ns.id}`]: true }));
    try {
      await khoiPhucNhanSu(ns.id, nguoiDungHienTai);
      themToast('thanh_cong', `Đã khôi phục nhân viên "${ns.ho_va_ten}".`);
      await taiLai();
    } catch (e) {
      themToast('loi', 'Khôi phục thất bại: ' + (e as Error).message);
    } finally {
      setDangXuLyKhac((t) => {
        const m = { ...t };
        delete m[`khoi_phuc_${ns.id}`];
        return m;
      });
    }
  };

  const xuLyGuiEmailReset = async () => {
    if (!moModalDoiMk?.email) return;
    setDangXuLyMk(true);
    setLoiMk(null);
    const nguoiThucHienCast = nguoiDungHienTai as unknown as Pick<NhanSu, 'id' | 'vai_tro'> | null;
    try {
      await guiEmailDatLaiMatKhau(moModalDoiMk.email, nguoiThucHienCast);
      themToast('thanh_cong', `Đã gửi email liên kết đặt lại mật khẩu đến: ${moModalDoiMk.email}`);
      setMoModalDoiMk(null);
      setMkMoiModal('');
      setNhapLaiMkModal('');
    } catch (e) {
      setLoiMk((e as Error).message);
      themToast('loi', (e as Error).message);
    } finally {
      setDangXuLyMk(false);
    }
  };

  const xuLyDoiMkModal = async () => {
    if (!moModalDoiMk) return;
    setLoiMk(null);
    if (!mkMoiModal || mkMoiModal.length < 6) {
      setLoiMk('Mật khẩu mới phải ít nhất 6 ký tự.');
      return;
    }
    if (mkMoiModal !== nhapLaiMkModal) {
      setLoiMk('2 lần nhập mật khẩu không trùng nhau.');
      return;
    }
    setDangXuLyMk(true);
    const nguoiThucHienCast = nguoiDungHienTai as unknown as Pick<NhanSu, 'id' | 'vai_tro'> | null;
    try {
      await doiMatKhauNhanSu(moModalDoiMk.id, mkMoiModal, nguoiThucHienCast);
      themToast('thanh_cong', 'Đổi mật khẩu thành công.');
      setMoModalDoiMk(null);
      setMkMoiModal('');
      setNhapLaiMkModal('');
    } catch (e) {
      setLoiMk((e as Error).message);
      themToast('loi', (e as Error).message);
    } finally {
      setDangXuLyMk(false);
    }
  };

  const tenChiNhanh = (id: string | null): string => {
    if (!id) return '';
    return dsChiNhanh.find((x) => x.id === id)?.ten_chi_nhanh ?? `CN#${id.slice(0, 5)}`;
  };
  const tenPhongBan = (id: string | null): string => {
    if (!id) return '';
    return dsPhongBan.find((x) => x.id === id)?.ten_phong_ban ?? `PB#${id.slice(0, 5)}`;
  };

  const MAU_PALETTE_PB = [
    { mau_icon: 'bg-primary/10 text-primary border border-primary/20', icon: Layers },
    { mau_icon: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20', icon: Building2 },
    { mau_icon: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', icon: Briefcase },
    { mau_icon: 'bg-purple-500/10 text-purple-600 border border-purple-500/20', icon: UsersRound },
    { mau_icon: 'bg-sky-500/10 text-sky-600 border border-sky-500/20', icon: FolderKanban },
    { mau_icon: 'bg-rose-500/10 text-rose-600 border border-rose-500/20', icon: ShieldCheck },
    { mau_icon: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20', icon: UserCog }
  ];

  const CARD_THONG_KE_PB = useMemo(() => {
    const cards: {
      key: string;
      label: string;
      gia_tri: number;
      mau_icon: string;
      icon: any;
    }[] = [];

    // 1. Thẻ đầu là Tổng số NV
    cards.push({
      key: 'tong',
      label: 'Tổng số NV',
      gia_tri: danhSach.length,
      mau_icon: 'bg-primary/10 text-primary border border-primary/20',
      icon: UsersRound
    });

    // 2. Các thẻ còn lại là của các phòng ban
    dsPhongBan.forEach((pb, idx) => {
      const palette = MAU_PALETTE_PB[idx % MAU_PALETTE_PB.length];
      const soLuong = danhSach.filter((ns) => ns.phong_ban_id === pb.id).length;
      cards.push({
        key: pb.id,
        label: pb.ten_phong_ban,
        gia_tri: soLuong,
        mau_icon: palette.mau_icon,
        icon: palette.icon
      });
    });

    // 3. Nếu có nhân sự chưa phân phòng ban
    const chuaPhan = danhSach.filter((ns) => !ns.phong_ban_id).length;
    if (chuaPhan > 0) {
      cards.push({
        key: 'chua_phan',
        label: 'Chưa phân phòng',
        gia_tri: chuaPhan,
        mau_icon: 'bg-muted text-muted-foreground border border-border',
        icon: UserRound
      });
    }

    return cards;
  }, [danhSach, dsPhongBan]);

  if (!duocXemNhanSu) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-card rounded-2xl border border-border shadow-sm">
          <div className="mx-auto size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Không có quyền truy cập</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bạn không có quyền xem danh sách nhân sự (<b className="font-mono text-xs">nhan_su.xem</b>). Vui lòng liên hệ Quản trị viên để được cấp quyền.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full rounded-xl bg-primary text-primary-foreground font-semibold py-2.5 px-4 text-sm hover:opacity-90 transition"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      <ThanhSoLieu
        muc={[
          {
            khoa: 'tong',
            nhan: 'Tổng nhân sự',
            nhan_ngan: 'Tổng NV',
            gia_tri: danhSach.length,
            icon: UsersRound,
            dang_chon: dieukien.trang_thai_hoat_dong === 'tat_ca' && !dieukien.phong_ban_id,
            khi_bam: () =>
              setDieuKien((d) => ({ ...d, trang_thai_hoat_dong: 'tat_ca', phong_ban_id: null }))
          },
          {
            khoa: 'hoat_dong',
            nhan: 'Đang hoạt động',
            nhan_ngan: 'Hoạt động',
            gia_tri: danhSach.filter((x) => x.trang_thai).length,
            icon: CheckCircle2,
            mau: 'thanh_cong',
            dang_chon: dieukien.trang_thai_hoat_dong === 'hoat_dong',
            khi_bam: () =>
              setDieuKien((d) => ({
                ...d,
                trang_thai_hoat_dong: d.trang_thai_hoat_dong === 'hoat_dong' ? 'tat_ca' : 'hoat_dong'
              }))
          },
          {
            khoa: 'da_khoa',
            nhan: 'Đã khóa',
            gia_tri: danhSach.filter((x) => !x.trang_thai).length,
            icon: Lock,
            mau: 'loi',
            dang_chon: dieukien.trang_thai_hoat_dong === 'khoa',
            khi_bam: () =>
              setDieuKien((d) => ({
                ...d,
                trang_thai_hoat_dong: d.trang_thai_hoat_dong === 'khoa' ? 'tat_ca' : 'khoa'
              }))
          },
          {
            khoa: 'phong_ban',
            nhan: 'Phòng ban',
            gia_tri: dsPhongBan.length,
            icon: Building2,
            mau: 'thong_tin'
          }
        ]}
      />

      <BoLocNhanSu
        boLocHienTai={dieukien}
        onChange={setDieuKien}
        onLamMoi={taiLai}
        danhSachChiNhanh={dsChiNhanh.map((x) => ({ id: x.id, ten_chi_nhanh: x.ten_chi_nhanh }))}
        danhSachPhongBan={dsPhongBan.map((x) => ({ id: x.id, ten_phong_ban: x.ten_phong_ban }))}
        danhSachVaiTro={dsVaiTroNS.map((x) => ({ id: x.id, ten_vai_tro: x.ten_vai_tro }))}
      />

      {dangTai ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="size-5 animate-spin" strokeWidth={2.25} />
          <span className="font-semibold text-noi-dung">Đang tải danh sách nhân sự...</span>
        </div>
      ) : danhSachDaSapXep.length === 0 ? (
        <Rong
          icon_tuy_chinh={UserRound}
          nhan_tuy_chinh="Không tìm thấy nhân sự"
          nhan_phu_tuy_chinh="Thử thay đổi bộ lọc hoặc thêm nhân sự mới vào hệ thống."
          hanh_dong={
            duocQuanLyNhanSu ? (
              <Nut kieu="primary" icon_trai={Plus} onClick={moTaoMoi}>
                Thêm nhân viên đầu tiên
              </Nut>
            ) : undefined
          }
        />
      ) : (
        <KhungDanhSach
          tieu_de="Danh sách nhân sự"
          tieu_de_ngan="Nhân sự"
          so_luong={danhSachDaSapXep.length}
          hanh_dong={
            <>
              <div className="relative">
                <select
                  value={kieuSapXep}
                  onChange={(e) => setKieuSapXep(e.target.value as any)}
                  aria-label="Sắp xếp danh sách nhân sự"
                  className="appearance-none text-phu font-semibold text-emerald-800 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2 pr-7 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="moi_nhat">Mới nhất</option>
                  <option value="cu_nhat">Cũ nhất</option>
                  <option value="ten_az">Tên A-Z</option>
                </select>
                <ChevronDown className="size-3.5 text-emerald-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {duocQuanLyNhanSu && (
                <Nut
                  kich_thuoc="sm"
                  icon_trai={Plus}
                  onClick={moTaoMoi}
                  title="Thêm nhân viên"
                  aria-label="Thêm nhân viên"
                >
                  <span className="hidden sm:inline">Thêm nhân viên</span>
                </Nut>
              )}
            </>
          }
        >
          <div className="hidden sm:block">
            <Bang>
              <ChuDeBang>
                <HangBang className="border-slate-200/80 hover:bg-transparent">
                  <ODauBang className="w-14 px-4 text-center">STT</ODauBang>
                  <ODauBang className="min-w-[240px] px-4">Họ và tên & tài khoản</ODauBang>
                  <ODauBang className="min-w-[180px] px-4">Phòng ban & chi nhánh</ODauBang>
                  <ODauBang className="min-w-[130px] px-4">Vai trò</ODauBang>
                  <ODauBang className="w-32 px-4">Trạng thái</ODauBang>
                  <ODauBang className="w-32 px-4 text-right">Thao tác</ODauBang>
                </HangBang>
              </ChuDeBang>
              <ThanBang>
                {danhSachDaSapXep.map((ns, index) => {
                  const thongTinVt = chonThongTinVaiTro(String(ns.vai_tro), dsVaiTroNS);
                  const biKhoa = !ns.trang_thai;
                  const pb = tenPhongBan(ns.phong_ban_id);
                  const cnStr = tenChiNhanh(ns.chi_nhanh_id);

                  return (
                    <HangBang
                      key={ns.id}
                      className={cn(biKhoa && 'opacity-60 bg-slate-50/30')}
                    >
                      <OBang className="px-4 py-3.5 text-center font-semibold text-slate-400 text-phu tabular-nums">
                        {index + 1}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <DaiDien
                            anh={ns.url_anh_dai_dien ?? undefined}
                            ten={ns.ho_va_ten}
                            kich_thuoc="sm"
                            className="size-8 rounded-lg shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/nhan-su/${ns.id}`}
                              className="font-bold text-slate-900 text-noi-dung hover:text-emerald-700 transition-colors line-clamp-1"
                            >
                              {ns.ho_va_ten}
                            </Link>
                            <div className="flex items-center gap-2.5 text-phu text-slate-400 font-normal mt-0.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Mail className="size-3 text-slate-400" />
                                {ns.email}
                              </span>
                              {ns.so_dien_thoai && (
                                <span className="inline-flex items-center gap-1 text-slate-500">
                                  <Phone className="size-3 text-slate-400" />
                                  {ns.so_dien_thoai}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="text-phu font-semibold text-slate-700">
                          {[pb, cnStr].filter(Boolean).join(' • ') || 'Chưa phân'}
                        </div>
                        {ns.chuc_vu && (
                          <div className="text-nhan text-slate-400 mt-0.5">
                            {ns.chuc_vu}
                          </div>
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-phu font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {thongTinVt.nhan}
                        </span>
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-phu font-semibold border',
                            biKhoa
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full shrink-0',
                              biKhoa ? 'bg-rose-500' : 'bg-emerald-500'
                            )}
                          />
                          {biKhoa ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <NutIcon href={`/nhan-su/${ns.id}`} icon={Eye} nhan="Xem chi tiết" sac="primary" />
                          {duocQuanLyNhanSu && (
                            <>
                              {ns.trang_thai_du_lieu === 'da_xoa' ? (
                                <NutIcon
                                  icon={RotateCcw}
                                  nhan="Khôi phục nhân sự"
                                  sac="primary"
                                  disabled={Boolean(dangXuLyKhac[`khoi_phuc_${ns.id}`])}
                                  onClick={() => xuLyKhoiPhuc(ns)}
                                />
                              ) : (
                                <>
                                  <NutIcon
                                    icon={Pencil}
                                    nhan="Chỉnh sửa"
                                    onClick={() => {
                                      setDangSua(ns);
                                      setLoiForm(null);
                                      setMoDrawer(true);
                                    }}
                                  />
                                  <NutIcon
                                    icon={KeyRound}
                                    nhan="Đổi mật khẩu"
                                    sac="canh_bao"
                                    onClick={() => {
                                      setLoiMk(null);
                                      setMkMoiModal('');
                                      setNhapLaiMkModal('');
                                      setMoModalDoiMk(ns);
                                    }}
                                  />
                                  <NutIcon
                                    icon={Trash2}
                                    nhan="Xóa vào thùng rác"
                                    sac="loi"
                                    disabled={Boolean(dangXuLyKhac[`xoa_${ns.id}`])}
                                    onClick={() => xuLyXoa(ns)}
                                  />
                                </>
                              )}
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
            {danhSachDaSapXep.map((ns, index) => {
              const biKhoa = !ns.trang_thai;
              const daXoa = ns.trang_thai_du_lieu === 'da_xoa';
              const pb = tenPhongBan(ns.phong_ban_id);
              const thongTinVt = chonThongTinVaiTro(String(ns.vai_tro), dsVaiTroNS);

              return (
                <TheMobile key={ns.id} mo_di={daXoa || biKhoa}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-slate-400 text-nhan font-extrabold tabular-nums mt-0.5 shrink-0">
                      {index + 1}.
                    </span>

                    <div className="flex-1 min-w-0 flex items-start gap-3">
                      <DaiDien
                        anh={ns.url_anh_dai_dien ?? undefined}
                        ten={ns.ho_va_ten}
                        kich_thuoc="sm"
                        className="size-10 rounded-full shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-noi-dung leading-snug">
                          <Link
                            href={`/nhan-su/${ns.id}`}
                            className="font-bold text-slate-900 hover:text-emerald-700"
                          >
                            {ns.ho_va_ten}
                          </Link>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-nhan font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                            {thongTinVt.nhan}
                          </span>
                        </div>
                        <div className="text-phu text-slate-500 truncate mt-0.5">
                          {pb || 'Chưa phân PB'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-nhan font-bold border shrink-0',
                          daXoa
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : biKhoa
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}
                      >
                        {daXoa ? 'Đã xóa' : biKhoa ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                      {ns.so_dien_thoai && (
                        <a
                          href={`tel:${ns.so_dien_thoai}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/70 text-slate-600 text-nhan font-semibold hover:bg-emerald-50 hover:text-emerald-700 truncate"
                        >
                          <Phone className="size-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ns.so_dien_thoai}</span>
                        </a>
                      )}
                    </div>

                    {daXoa && duocQuanLyNhanSu && (
                      <NutIcon
                        icon={RotateCcw}
                        nhan="Khôi phục"
                        sac="primary"
                        disabled={Boolean(dangXuLyKhac[`khoi_phuc_${ns.id}`])}
                        onClick={() => xuLyKhoiPhuc(ns)}
                      />
                    )}
                  </div>
                </TheMobile>
              );
            })}
          </DanhSachTheMobile>
        </KhungDanhSach>
      )}

      <FormNhanSuDrawer
        mo={moDrawer}
        onDong={() => { setMoDrawer(false); setDangSua(null); setLoiForm(null); }}
        dangSua={dangSua}
        danhSachChiNhanh={dsChiNhanh.map((x) => ({ id: x.id, ten_chi_nhanh: x.ten_chi_nhanh }))}
        danhSachPhongBan={dsPhongBan.map((x) => ({ id: x.id, ten_phong_ban: x.ten_phong_ban, chi_nhanh_id: x.chi_nhanh_id }))}
        danhSachVaiTro={dsVaiTroNS.map((x) => ({ id: x.id, ten_vai_tro: x.ten_vai_tro, ma_vai_tro: x.ma_vai_tro }))}
        danhSachChucVu={dsChucVuNS.map((x) => ({ id: x.id, ten_chuc_vu: x.ten_chuc_vu, ma_chuc_vu: x.ma_chuc_vu }))}
        onLuu={xuLyLuuForm}
        dangXuLy={dangXuLyForm}
        loi={loiForm}
      />

      {moModalDoiMk && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => { setMoModalDoiMk(null); setMkMoiModal(''); setNhapLaiMkModal(''); setLoiMk(null); }}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--radius-pop)] border border-border bg-background shadow-[var(--shadow-pop)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-[var(--radius-card)] bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary flex items-center justify-center">
                  <KeyRound className="size-[18px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Đổi mật khẩu</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[280px]">
                    Tài khoản: {moModalDoiMk.ho_va_ten} ({moModalDoiMk.ma_nhan_vien})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setMoModalDoiMk(null); setMkMoiModal(''); setNhapLaiMkModal(''); setLoiMk(null); }}
                className="size-9 rounded-[var(--radius-input)] border border-border bg-background text-muted-foreground hover:bg-muted flex items-center justify-center transition"
              >
                <X className="size-4" />
              </button>
            </div>
            {/* Kiểm tra xem có phải chính chủ tài khoản đang đăng nhập hay không */}
            {(() => {
              const laChinhMinh = nguoiDungHienTai?.id === moModalDoiMk.id;
              return (
                <>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <Nhan bat_buoc>Mật khẩu mới (tối thiểu 6 ký tự)</Nhan>
                        <button
                          type="button"
                          onClick={() => {
                            setMkMoiModal('123456');
                            setNhapLaiMkModal('123456');
                          }}
                          className="text-[11px] font-semibold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded"
                        >
                          Gán nhanh: 123456
                        </button>
                      </div>
                      <input
                        type="text"
                        value={mkMoiModal}
                        onChange={(e) => setMkMoiModal(e.target.value)}
                        placeholder="Nhập mật khẩu mới..."
                        className="w-full px-4 py-3 h-11 bg-background border border-border rounded-[var(--radius-input)] text-sm font-mono tracking-wide focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition shadow-[var(--shadow-card)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Nhan bat_buoc>Xác nhận lại mật khẩu</Nhan>
                      <input
                        type="text"
                        value={nhapLaiMkModal}
                        onChange={(e) => setNhapLaiMkModal(e.target.value)}
                        placeholder="Nhập lại mật khẩu..."
                        className="w-full px-4 py-3 h-11 bg-background border border-border rounded-[var(--radius-input)] text-sm font-mono tracking-wide focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition shadow-[var(--shadow-card)]"
                      />
                    </div>

                    {!laChinhMinh && (
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Hoặc gửi link qua email của nhân viên:</span>
                        <button
                          type="button"
                          disabled={dangXuLyMk}
                          onClick={() => void xuLyGuiEmailReset()}
                          className="text-primary hover:underline font-semibold"
                        >
                          Gửi email khôi phục
                        </button>
                      </div>
                    )}

                    {loiMk && (
                      <div className="rounded-[var(--radius-card)] border border-danger/20 bg-danger/10 p-3 text-sm text-danger flex items-start gap-2">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                        <span>{loiMk}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/40">
                    <Nut
                      kieu="ghost"
                      onClick={() => { setMoModalDoiMk(null); setMkMoiModal(''); setNhapLaiMkModal(''); setLoiMk(null); }}
                      disabled={dangXuLyMk}
                    >
                      Hủy
                    </Nut>
                    <Nut
                      kieu="primary"
                      icon_trai={dangXuLyMk ? Loader2 : KeyRound}
                      onClick={() => void xuLyDoiMkModal()}
                      disabled={dangXuLyMk}
                      className={cn(dangXuLyMk && 'animate-pulse')}
                    >
                      {dangXuLyMk ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                    </Nut>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {dsToast.length > 0 ? (
        <div className="fixed top-5 right-5 z-[90] space-y-3 max-w-[340px] w-full pointer-events-none">
          {dsToast.map((t) => (
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


