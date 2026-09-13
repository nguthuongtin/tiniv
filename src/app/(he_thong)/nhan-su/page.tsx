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
  ShieldCheck
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-2">
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
                'text-left rounded-2xl border bg-card p-3 px-3 sm:p-3.5 sm:px-4 flex items-center gap-2 sm:gap-3.5 shadow-xs transition-all duration-200 cursor-pointer',
                dangChon
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border/80 hover:border-primary/40 hover:shadow-sm'
              )}
            >
              <div
                className={cn(
                  'size-7 sm:size-9 shrink-0 rounded-lg sm:rounded-xl inline-flex items-center justify-center',
                  c.mau_icon
                )}
              >
                <Icon className="size-3.5 sm:size-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[9px] sm:text-[11px] uppercase tracking-wide sm:tracking-wider font-semibold text-muted-foreground truncate"
                  title={c.label}
                >
                  {c.label}
                </div>
                <div className="text-[16px] sm:text-xl font-bold tabular-nums text-foreground mt-0.5 tracking-tight">
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
        <div className="rounded-[var(--radius-card)] border border-border bg-background p-12 flex items-center justify-center text-muted-foreground gap-5 shadow-[var(--shadow-card)]">
          <Loader2 className="size-7 animate-spin text-primary" strokeWidth={2.25} />
          <span className="text-[14.5px] font-semibold leading-body">Đang tải danh sách nhân sự...</span>
        </div>
      ) : danhSach.length === 0 ? (
        <Rong
          kieu="mac_dinh"
          icon_tuy_chinh={UserRound}
          nhan_tuy_chinh="Chưa có nhân viên nào"
          nhan_phu_tuy_chinh="Hãy thêm nhân sự đầu tiên để bắt đầu phân quyền và quản lý công việc."
          hanh_dong={
            duocQuanLyNhanSu ? (
              <Nut kieu="primary" icon_trai={Plus} onClick={moTaoMoi}>
                Thêm nhân viên đầu tiên
              </Nut>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {danhSach.map((ns) => {
            const thongTinVt = chonThongTinVaiTro(String(ns.vai_tro), dsVaiTroNS);
            const biKhoa = !ns.trang_thai;
            return (
              <div
                key={ns.id}
                onClick={() => router.push(`/nhan-su/${ns.id}`)}
                className={cn(
                  'rounded-2xl border border-border/80 bg-card p-4 flex flex-col justify-between transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer group min-h-[135px]',
                  biKhoa && 'opacity-75'
                )}
              >
                <div>
                  {/* Top row: Vai trò badge & Trạng thái badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground truncate max-w-[100px]">
                      {thongTinVt.nhan}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0',
                        biKhoa
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          biKhoa ? 'bg-muted-foreground' : 'bg-emerald-500'
                        )}
                      />
                      {biKhoa ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </div>

                  {/* Avatar + Tên & Chức vụ */}
                  <div className="flex items-start gap-2.5 mt-2.5">
                    <DaiDien
                      ten={ns.ho_va_ten}
                      anh={ns.url_anh_dai_dien || undefined}
                      kich_thuoc="sm"
                      className="shadow-xs shrink-0 rounded-lg mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-bold text-[14px] text-foreground group-hover:text-primary transition-colors truncate block tracking-tight"
                        title={ns.ho_va_ten}
                      >
                        {ns.ho_va_ten}
                      </h3>
                      {ns.chuc_vu && (
                        <span className="text-xs text-muted-foreground truncate block mt-0.5" title={ns.chuc_vu}>
                          {ns.chuc_vu}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phòng ban */}
                {ns.phong_ban_id && (
                  <div className="pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground truncate mt-2.5">
                    <Layers className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{tenPhongBan(ns.phong_ban_id)}</span>
                  </div>
                )}
              </div>
            );
          })}
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
                  <div className="p-8 space-y-4">
                    {laChinhMinh ? (
                      <>
                        <div>
                          <Nhan bat_buoc>Mật khẩu mới</Nhan>
                          <input
                            type="text"
                            value={mkMoiModal}
                            onChange={(e) => setMkMoiModal(e.target.value)}
                            placeholder="Ít nhất 6 ký tự"
                            className="w-full px-4 py-3 h-11 bg-background border border-border rounded-[var(--radius-input)] text-sm tabular tracking-wide focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition shadow-[var(--shadow-card)]"
                          />
                        </div>
                        <div>
                          <Nhan bat_buoc>Nhập lại mật khẩu</Nhan>
                          <input
                            type="text"
                            value={nhapLaiMkModal}
                            onChange={(e) => setNhapLaiMkModal(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                            className="w-full px-4 py-3 h-11 bg-background border border-border rounded-[var(--radius-input)] text-sm tabular tracking-wide focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition shadow-[var(--shadow-card)]"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="size-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">Gửi liên kết đặt lại mật khẩu</div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Theo chính sách bảo mật của Firebase, Admin không được can thiệp trực tiếp vào mật khẩu riêng tư của nhân viên. Hệ thống sẽ gửi email chứa đường link an toàn đến hòm thư <b>{moModalDoiMk.email}</b> để nhân viên tự tạo mật khẩu mới.
                            </p>
                          </div>
                        </div>
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
                    {laChinhMinh ? (
                      <Nut
                        kieu="primary"
                        icon_trai={dangXuLyMk ? Loader2 : KeyRound}
                        onClick={() => void xuLyDoiMkModal()}
                        disabled={dangXuLyMk}
                        className={cn(dangXuLyMk && 'animate-pulse')}
                      >
                        Lưu mật khẩu mới
                      </Nut>
                    ) : (
                      <Nut
                        kieu="primary"
                        icon_trai={dangXuLyMk ? Loader2 : Send}
                        onClick={() => void xuLyGuiEmailReset()}
                        disabled={dangXuLyMk}
                        className={cn(dangXuLyMk && 'animate-pulse')}
                      >
                        Gửi email đổi mật khẩu
                      </Nut>
                    )}
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
