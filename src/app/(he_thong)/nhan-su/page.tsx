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
  User
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
  chonThongTinVaiTro
} from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachVaiTro } from '../../../dich_vu/nhan_su/dich_vu_vai_tro';
import { danhSachChucVu } from '../../../dich_vu/nhan_su/dich_vu_chuc_vu';
import BoLocNhanSu from '../../../thanh_phan/nhan_su/bo_loc_nhan_su';
import FormNhanSuDrawer from '../../../thanh_phan/nhan_su/form_nhan_su_drawer';
import Bo_Cuc_Trang from '../../../thanh_phan/ui/bo_cuc_trang';
import { Nut, Hieu, Rong, DaiDien, Nhan } from '../../../thanh_phan/ui';

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
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3.5 sm:space-y-6">
      {/* Summary 2 dòng tinh gọn trên Mobile */}
      <div className="sm:hidden bg-white rounded-[18px] p-3.5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
        {/* Dòng 1 — quy mô nhân sự */}
        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng số NV</span>
            <span className="font-extrabold text-slate-900 text-[15px] tabular-nums">{danhSach.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Đang hoạt động</span>
            <span className="font-extrabold text-[#34C759] text-[15px] tabular-nums">
              {danhSach.filter((x) => x.trang_thai).length}
            </span>
          </div>
        </div>

        {/* Dòng 2 — tình trạng / phân bổ */}
        <div className="flex items-center justify-between text-[12px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đã khóa</span>
            <span className="font-bold text-[#FF3B30] text-[13px] tabular-nums">
              {danhSach.filter((x) => !x.trang_thai).length}
            </span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Phòng ban</span>
            <span className="font-bold text-[#007AFF] text-[13px] tabular-nums">{dsPhongBan.length}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Chưa phân PB</span>
            <span className="font-bold text-[#FF9500] text-[13px] tabular-nums">
              {danhSach.filter((x) => !x.phong_ban_id).length}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards đầy đủ trên Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5 mb-2">
        {CARD_THONG_KE_PB.map((c) => {
          const Icon = c.icon;
          const dangChon =
            (c.key === 'tong' && !dieukien.phong_ban_id) ||
            (c.key !== 'tong' && dieukien.phong_ban_id === c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                if (c.key === 'tong') {
                  setDieuKien((prev) => ({ ...prev, phong_ban_id: null }));
                } else if (c.key === 'chua_phan') {
                  setDieuKien((prev) => ({
                    ...prev,
                    phong_ban_id: prev.phong_ban_id === 'chua_phan' ? null : ('chua_phan' as any)
                  }));
                } else {
                  setDieuKien((prev) => ({
                    ...prev,
                    phong_ban_id: prev.phong_ban_id === c.key ? null : c.key
                  }));
                }
              }}
              className={cn(
                'text-left rounded-[20px] border bg-white p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer active:scale-[0.98]',
                dangChon
                  ? 'border-[#007AFF] ring-2 ring-[#007AFF]/20 bg-[#007AFF]/5'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              )}
            >
              <div
                className={cn(
                  'size-8 rounded-[11px] flex items-center justify-center shrink-0',
                  dangChon ? 'bg-[#007AFF] text-white' : c.mau_icon
                )}
              >
                <Icon className="size-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-slate-500 truncate">{c.label}</div>
                <div className="text-[18px] sm:text-[20px] font-extrabold text-slate-900 leading-tight tabular-nums">
                  {c.gia_tri}
                </div>
              </div>
            </button>
          );
        })}
      </div>

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
          <span className="font-semibold">Đang tải danh sách nhân sự...</span>
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
        <div className="space-y-3">
          {/* Header danh sách chuẩn ảnh */}
          <div className="flex items-center justify-between px-1 pt-1">
            <h2 className="text-[17px] sm:text-[19px] font-bold text-slate-900 tracking-tight">
              Danh sách nhân sự
            </h2>

            <div className="relative">
              <select
                value={kieuSapXep}
                onChange={(e) => setKieuSapXep(e.target.value as any)}
                aria-label="Sắp xếp danh sách nhân sự"
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
            {danhSachDaSapXep.map((ns) => {
              const thongTinVt = chonThongTinVaiTro(String(ns.vai_tro), dsVaiTroNS);
              const biKhoa = !ns.trang_thai;
              return (
                <div
                  key={ns.id}
                  onClick={() => router.push(`/nhan-su/${ns.id}`)}
                  className={cn(
                    'relative rounded-[20px] border border-slate-200/80 bg-white p-3.5 sm:p-4.5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer group active:scale-[0.99]',
                    biKhoa && 'opacity-60 grayscale-[50%]'
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Squircle Avatar or Blue User Icon */}
                    {ns.url_anh_dai_dien ? (
                      <DaiDien
                        ten={ns.ho_va_ten}
                        anh={ns.url_anh_dai_dien}
                        kich_thuoc="md"
                        className="size-11 sm:size-12 rounded-[16px] shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="size-11 sm:size-12 rounded-[16px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0 border border-[#007AFF]/15 shadow-2xs">
                        <User className="size-5 sm:size-5.5 text-[#007AFF]" strokeWidth={2.2} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-bold text-[15px] sm:text-[16.5px] text-slate-900 group-hover:text-[#007AFF] transition-colors truncate tracking-tight"
                        title={ns.ho_va_ten}
                      >
                        {ns.ho_va_ten}
                      </h3>

                      <div className="text-[12.5px] sm:text-[13px] text-slate-500 font-normal truncate mt-0.5">
                        {thongTinVt.nhan} • {tenPhongBan(ns.phong_ban_id) || 'Chưa phân PB'}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-2.5 text-[11.5px] sm:text-[12.5px] text-slate-500 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[200px]">
                          <Mail className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ns.email}</span>
                        </span>
                        <span className="text-slate-200">│</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Phone className="size-3.5 text-slate-400 shrink-0" />
                          <span>{ns.so_dien_thoai || '--'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badge, KeyRound & Chevron */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11.5px] sm:text-[12px] font-semibold tracking-wide shrink-0',
                        biKhoa
                          ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                          : 'bg-[#34C759]/10 text-[#34C759]'
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          biKhoa ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                        )}
                      />
                      <span>{biKhoa ? 'Đã khóa' : 'Hoạt động'}</span>
                    </span>

                    {duocQuanLyNhanSu && (
                      <button
                        type="button"
                        title="Đổi mật khẩu"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLoiMk(null);
                          setMkMoiModal('');
                          setNhapLaiMkModal('');
                          setMoModalDoiMk(ns);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#007AFF] hover:bg-blue-50 transition shrink-0"
                      >
                        <KeyRound className="size-4" />
                      </button>
                    )}

                    <ChevronRight className="size-4.5 sm:size-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
