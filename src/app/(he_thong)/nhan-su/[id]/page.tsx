'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Users,
  FolderKanban,
  FileText,
  Calendar,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  TrendingUp,
  X,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { notFound, useRouter, useParams } from 'next/navigation';
import type { NhanSu, ChiNhanh, PhongBan, VaiTro, ChucVu } from '../../../../thu_vien/types/nhan_su';
import { DANH_SACH_QUYEN_HAN_HE_THONG, CAC_VAI_TRO_CHUAN_HE_THONG } from '../../../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../../../thu_vien/types/du_an';
import type { BaoCaoCongViec } from '../../../../thu_vien/types/bao_cao_cong_viec';
import {
  layChiTietNhanSu,
  capNhatNhanSu,
  khoaHoacMoTaiKhoan,
  doiMatKhauNhanSu,
  guiEmailDatLaiMatKhau,
  xoaMemNhanSu,
  chonThongTinVaiTro
} from '../../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachBaoCaoCongViec } from '../../../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachChiNhanh } from '../../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachVaiTro } from '../../../../dich_vu/nhan_su/dich_vu_vai_tro';
import { danhSachChucVu } from '../../../../dich_vu/nhan_su/dich_vu_chuc_vu';
import { formatNgay } from '../../../../thu_vien/utils/format_ngay';
import { formatTien } from '../../../../thu_vien/utils/format_tien';
import { cn } from '../../../../thu_vien/utils/cn';
import { useStoreXacThuc } from '../../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../../../thu_vien/phan_quyen/kiem_tra_quyen';
import {
  BoCacTab,
  DanhSachNutTab,
  NutTab,
  NoiDungTab,
  Hieu,
  Rong,
  DaiDien,
  TaiLenAnhDaiDien,
  Nut,
  ToLichNgay
} from '../../../../thanh_phan/ui';

type TenTab = 'du_an' | 'bao_cao';

const DS_TAB: { key: TenTab; nhan: string; bieuTuong: any; dem?: number }[] = [
  { key: 'du_an', nhan: 'Dự án phụ trách', bieuTuong: FolderKanban },
  { key: 'bao_cao', nhan: 'Báo cáo gần đây', bieuTuong: FileText }
];

export default function TrangChiTietNhanSu() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);

  const [ns, setNs] = useState<NhanSu | null>(null);
  const [dsDA, setDsDA] = useState<HoSoDuAn[]>([]);
  const [dsBC, setDsBC] = useState<BaoCaoCongViec[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsVaiTro, setDsVaiTro] = useState<VaiTro[]>([]);
  const [dsChucVu, setDsChucVu] = useState<ChucVu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [errTai, setErrTai] = useState<string | null>(null);
  const [tabHienTai, setTabHienTai] = useState<TenTab>('du_an');

  // In-place Edit & Modal states
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [dangXuLySua, setDangXuLySua] = useState(false);
  const [loiSua, setLoiSua] = useState<string | null>(null);
  const [moNgoaiLe, setMoNgoaiLe] = useState(false);

  const [formSua, setFormSua] = useState({
    ho_va_ten: '',
    ma_nhan_vien: '',
    email: '',
    so_dien_thoai: '',
    chuc_vu: '',
    chi_nhanh_id: '',
    phong_ban_id: '',
    vai_tro: '',
    url_anh_dai_dien: '',
    phong_ban_phu_trach_them: [] as string[],
    quyen_ngoai_le_cap_them: [] as string[],
    quyen_ngoai_le_chan: [] as string[]
  });

  const [moModalDoiMk, setMoModalDoiMk] = useState(false);
  const [mkMoi, setMkMoi] = useState('');
  const [nhapLaiMk, setNhapLaiMk] = useState('');
  const [dangXuLyMk, setDangXuLyMk] = useState(false);
  const [loiMk, setLoiMk] = useState<string | null>(null);

  const [dangXuLyTacVu, setDangXuLyTacVu] = useState<Record<string, boolean>>({});

  const taiLai = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    setErrTai(null);
    try {
      const [kqNs, kqDA, kqBC, kqCn, kqPb, kqVt, kqCv] = await Promise.all([
        layChiTietNhanSu(id),
        danhSachHoSoDuAn({}),
        danhSachBaoCaoCongViec({ nhan_vien_id: id, trang_thai_du_lieu: 'hoat_dong' }),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachVaiTro(),
        danhSachChucVu()
      ]);

      if (!kqNs) {
        setNs(null);
        return;
      }
      setNs(kqNs);
      // Lọc các dự án mà nhân viên này phụ trách hoặc quản lý hoặc tham gia hỗ trợ
      const duAnCuaNs = (kqDA.mang ?? []).filter(
        (d) =>
          d.nguoi_phu_trach_id === id ||
          d.nguoi_quan_ly_id === id ||
          (Array.isArray(d.danh_sach_nguoi_ho_tro_ids) && d.danh_sach_nguoi_ho_tro_ids.includes(id))
      );
      setDsDA(duAnCuaNs);
      setDsBC(kqBC.mang ?? []);
      setDsChiNhanh(kqCn.mang ?? []);
      setDsPhongBan(kqPb.mang ?? []);
      setDsVaiTro(kqVt.mang ?? []);
      setDsChucVu(kqCv.mang ?? []);
    } catch (e: any) {
      setErrTai(e?.message ?? 'Tải thông tin nhân sự thất bại');
    } finally {
      setDangTai(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void taiLai();
  }, [id, taiLai]);

  const batDauChinhSua = () => {
    if (!ns) return;
    setFormSua({
      ho_va_ten: ns.ho_va_ten || '',
      ma_nhan_vien: ns.ma_nhan_vien || '',
      email: ns.email || '',
      so_dien_thoai: ns.so_dien_thoai || '',
      chuc_vu: ns.chuc_vu || '',
      chi_nhanh_id: ns.chi_nhanh_id || '',
      phong_ban_id: ns.phong_ban_id || '',
      vai_tro: String(ns.vai_tro || ''),
      url_anh_dai_dien: ns.url_anh_dai_dien || '',
      phong_ban_phu_trach_them: ns.phong_ban_phu_trach_them || [],
      quyen_ngoai_le_cap_them: ns.quyen_ngoai_le_cap_them || [],
      quyen_ngoai_le_chan: ns.quyen_ngoai_le_chan || []
    });
    setLoiSua(null);
    setDangChinhSua(true);
  };

  const huyChinhSua = () => {
    setDangChinhSua(false);
    setLoiSua(null);
  };

  const xuLyLuuSuaInPlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ns) return;
    if (!formSua.ho_va_ten.trim()) {
      setLoiSua('Họ và tên không được để trống.');
      return;
    }
    if (!formSua.email.trim()) {
      setLoiSua('Email tài khoản không được để trống.');
      return;
    }
    setDangXuLySua(true);
    setLoiSua(null);
    try {
      await capNhatNhanSu(
        ns.id,
        {
          ho_va_ten: formSua.ho_va_ten.trim(),
          ma_nhan_vien: formSua.ma_nhan_vien.trim() || undefined,
          email: formSua.email.trim() !== ns.email ? formSua.email.trim() : undefined,
          so_dien_thoai: formSua.so_dien_thoai.trim() || null,
          chuc_vu: formSua.chuc_vu.trim() || null,
          chi_nhanh_id: formSua.chi_nhanh_id || null,
          phong_ban_id: formSua.phong_ban_id || null,
          vai_tro: formSua.vai_tro || ns.vai_tro,
          url_anh_dai_dien: formSua.url_anh_dai_dien.trim() || null,
          phong_ban_phu_trach_them: formSua.phong_ban_phu_trach_them,
          quyen_ngoai_le_cap_them: formSua.quyen_ngoai_le_cap_them,
          quyen_ngoai_le_chan: formSua.quyen_ngoai_le_chan
        },
        nguoiDungHienTai ?? null
      );
      setDangChinhSua(false);
      await taiLai();
    } catch (err: any) {
      setLoiSua(err?.message ?? 'Lưu thông tin nhân sự thất bại');
    } finally {
      setDangXuLySua(false);
    }
  };

  const thongTinVaiTro = useMemo(() => {
    return chonThongTinVaiTro(String(ns?.vai_tro), dsVaiTro);
  }, [ns?.vai_tro, dsVaiTro]);

  const dsVaiTroHopLe = useMemo(() => {
    const map = new Map<string, { id: string; ten: string }>();
    // 1. Vai trò chuẩn hệ thống (tên thuần tiếng Việt, không kèm mã)
    CAC_VAI_TRO_CHUAN_HE_THONG.forEach((std) => {
      map.set(std.key, { id: std.key, ten: std.tenMacDinh });
    });
    // 2. Vai trò tùy chỉnh từ cơ sở dữ liệu
    (dsVaiTro || []).forEach((vt) => {
      const ten = (vt.ten_vai_tro || '').trim();
      const id = (vt.id || '').trim();
      if (!ten || !id) return;
      if (!map.has(id)) {
        map.set(id, { id, ten });
      }
    });
    // 3. Fallback cho vai trò hiện tại nếu chưa có trong map
    const current = (formSua.vai_tro || ns?.vai_tro || '').trim();
    if (current && !map.has(current)) {
      const info = chonThongTinVaiTro(current, dsVaiTro);
      map.set(current, { id: current, ten: info.nhan || current });
    }
    return Array.from(map.values()).filter((item) => item.ten && item.ten.trim().length > 0);
  }, [dsVaiTro, formSua.vai_tro, ns?.vai_tro]);

  const chiNhanh = useMemo(() => {
    if (!ns?.chi_nhanh_id) return null;
    return dsChiNhanh.find((c) => c.id === ns.chi_nhanh_id) ?? null;
  }, [ns?.chi_nhanh_id, dsChiNhanh]);

  const phongBan = useMemo(() => {
    if (!ns?.phong_ban_id) return null;
    return dsPhongBan.find((p) => p.id === ns.phong_ban_id) ?? null;
  }, [ns?.phong_ban_id, dsPhongBan]);

  const tabsHienThi = useMemo(() => {
    return DS_TAB.map((t) => {
      if (t.key === 'du_an') return { ...t, dem: dsDA.length };
      if (t.key === 'bao_cao') return { ...t, dem: dsBC.length };
      return t;
    });
  }, [dsDA.length, dsBC.length]);

  const dsPhongBanFiltered = useMemo(() => {
    if (!formSua.chi_nhanh_id) return dsPhongBan;
    return dsPhongBan.filter((pb) => pb.chi_nhanh_id === formSua.chi_nhanh_id);
  }, [formSua.chi_nhanh_id, dsPhongBan]);

  const xuLyKhoaMo = async () => {
    if (!ns) return;
    const key = 'khoa_mo';
    setDangXuLyTacVu((o) => ({ ...o, [key]: true }));
    try {
      const trangThaiMoi = !ns.trang_thai;
      await khoaHoacMoTaiKhoan(ns.id, trangThaiMoi, nguoiDungHienTai as any);
      await taiLai();
    } catch (err: any) {
      alert('Không thể cập nhật trạng thái: ' + (err?.message ?? ''));
    } finally {
      setDangXuLyTacVu((o) => ({ ...o, [key]: false }));
    }
  };

  const xuLyDoiMatKhau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ns) return;
    setLoiMk(null);

    if (!mkMoi || mkMoi.length < 6) {
      setLoiMk('Mật khẩu mới phải ít nhất 6 ký tự.');
      return;
    }
    if (mkMoi !== nhapLaiMk) {
      setLoiMk('Mật khẩu nhập lại không khớp.');
      return;
    }

    setDangXuLyMk(true);
    try {
      await doiMatKhauNhanSu(ns.id, mkMoi, nguoiDungHienTai as any);
      alert('Đổi mật khẩu thành công!');
      setMoModalDoiMk(false);
      setMkMoi('');
      setNhapLaiMk('');
    } catch (err: any) {
      setLoiMk(err?.message ?? 'Thao tác thất bại');
    } finally {
      setDangXuLyMk(false);
    }
  };

  const xuLyGuiEmailReset = async () => {
    if (!ns?.email) return;
    setDangXuLyMk(true);
    setLoiMk(null);
    try {
      await guiEmailDatLaiMatKhau(ns.email, nguoiDungHienTai as any);
      alert(`Đã gửi email khôi phục mật khẩu đến: ${ns.email}`);
      setMoModalDoiMk(false);
    } catch (err: any) {
      setLoiMk(err?.message ?? 'Không thể gửi email khôi phục');
    } finally {
      setDangXuLyMk(false);
    }
  };

  const xuLyXoaMem = async () => {
    if (!ns) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${ns.ho_va_ten}"?`)) return;
    const key = 'xoa_ns';
    setDangXuLyTacVu((o) => ({ ...o, [key]: true }));
    try {
      await xoaMemNhanSu(ns.id, nguoiDungHienTai as any);
      router.push('/nhan-su');
    } catch (err: any) {
      alert('Không thể xóa: ' + (err?.message ?? ''));
      setDangXuLyTacVu((o) => ({ ...o, [key]: false }));
    }
  };

  if (!ns && !dangTai) {
    try {
      notFound();
    } catch {
      return (
        <div className="p-8 text-center max-w-md mx-auto">
          <p className="text-muted-foreground mb-4 font-medium">Không tìm thấy hồ sơ nhân viên</p>
          <Link
            href="/nhan-su"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-input)] bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </div>
      );
    }
    return null;
  }

  const biKhoa = !ns?.trang_thai;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="space-y-3 pb-3 border-b border-border">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/nhan-su" className="hover:text-foreground transition inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" />
            Nhân sự
          </Link>
          <ChevronRight className="size-3 opacity-60" />
          <span className="text-foreground font-semibold truncate max-w-[320px]">
            {ns?.ho_va_ten ?? 'Đang tải...'}
          </span>
        </div>

        {/* Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex items-start gap-3.5">
            <DaiDien
              ten={ns?.ho_va_ten ?? 'NS'}
              anh={(dangChinhSua ? formSua.url_anh_dai_dien : ns?.url_anh_dai_dien) || undefined}
              kich_thuoc="xl"
              className="mt-0.5 shadow-sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {ns?.ho_va_ten ?? 'Nhân sự'}
                </h1>
                {ns && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ns.ma_nhan_vien && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-xs border border-border">
                        {ns.ma_nhan_vien}
                      </span>
                    )}
                    <Hieu kieu={thongTinVaiTro.kieu_hien_thi} kich_thuoc="sm">
                      {thongTinVaiTro.nhan}
                    </Hieu>
                    {biKhoa ? (
                      <Hieu kieu="danger" kich_thuoc="sm">
                        <Lock className="size-3 mr-1" /> Đã khóa
                      </Hieu>
                    ) : (
                      <Hieu kieu="success" kich_thuoc="sm">
                        <Unlock className="size-3 mr-1" /> Hoạt động
                      </Hieu>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button Group */}
          {ns && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {dangChinhSua ? (
                <>
                  <Nut
                    kieu="outline"
                    kich_thuoc="sm"
                    onClick={huyChinhSua}
                    disabled={dangXuLySua}
                  >
                    Hủy
                  </Nut>
                  <Nut
                    kieu="primary"
                    kich_thuoc="sm"
                    icon_trai={dangXuLySua ? Loader2 : Save}
                    onClick={() => void xuLyLuuSuaInPlace()}
                    disabled={dangXuLySua}
                  >
                    Lưu thay đổi
                  </Nut>
                </>
              ) : (
                <>
                  {(coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) || nguoiDungHienTai?.id === ns.id) && (
                    <Nut
                      kieu="primary"
                      kich_thuoc="sm"
                      icon_trai={Pencil}
                      onClick={batDauChinhSua}
                    >
                      Chỉnh sửa
                    </Nut>
                  )}
                  {(coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) || nguoiDungHienTai?.id === ns.id) && (
                    <Nut
                      kieu="outline"
                      kich_thuoc="sm"
                      icon_trai={KeyRound}
                      onClick={() => {
                        setLoiMk(null);
                        setMkMoi('');
                        setNhapLaiMk('');
                        setMoModalDoiMk(true);
                      }}
                    >
                      Đổi mật khẩu
                    </Nut>
                  )}
                  {coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) && nguoiDungHienTai?.id !== ns.id && (
                    <>
                      <Nut
                        kieu="outline"
                        kich_thuoc="sm"
                        icon_trai={dangXuLyTacVu['khoa_mo'] ? Loader2 : biKhoa ? Unlock : Lock}
                        onClick={xuLyKhoaMo}
                        disabled={dangXuLyTacVu['khoa_mo']}
                      >
                        {biKhoa ? 'Mở tài khoản' : 'Khóa tài khoản'}
                      </Nut>
                      <Nut
                        kieu="danger"
                        kich_thuoc="sm"
                        icon_trai={dangXuLyTacVu['xoa_ns'] ? Loader2 : Trash2}
                        onClick={xuLyXoaMem}
                        disabled={dangXuLyTacVu['xoa_ns']}
                      >
                        Xóa
                      </Nut>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner thông báo chế độ chỉnh sửa */}
      {dangChinhSua && (
        <div className="rounded-2xl bg-[#FF9500]/10 border border-[#FF9500]/30 p-3.5 sm:p-4 text-xs sm:text-sm text-[#FF9500] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-[#FF9500]" />
            <span>Đang ở chế độ chỉnh sửa thông tin nhân sự. Chỉnh sửa trực tiếp trên form và bấm <b>Lưu thay đổi</b>.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Nut kieu="outline" kich_thuoc="sm" onClick={huyChinhSua} disabled={dangXuLySua}>
              Hủy
            </Nut>
            <Nut kieu="primary" kich_thuoc="sm" onClick={() => void xuLyLuuSuaInPlace()} disabled={dangXuLySua} icon_trai={dangXuLySua ? Loader2 : Save}>
              Lưu thay đổi
            </Nut>
          </div>
        </div>
      )}

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT CHÍNH (Trái ~68% - 8 cột) */}
        <div className="lg:col-span-8 space-y-6">
          {dangChinhSua ? (
            <div className="space-y-6">
              {loiSua && (
                <div className="p-3.5 rounded-[var(--radius-card)] bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{loiSua}</span>
                </div>
              )}

              {/* Thẻ Thông tin cơ bản */}
              <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
                <div className="border-b border-border pb-3">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Thông tin nhân viên
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cập nhật các thông tin danh tính, vai trò và chức danh công việc
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formSua.ho_va_ten}
                      onChange={(e) => setFormSua((s) => ({ ...s, ho_va_ten: e.target.value }))}
                      placeholder="Nhập họ và tên đầy đủ..."
                      required
                      className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>

                  {/* Mã nhân viên */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Mã nhân viên
                    </label>
                    <input
                      type="text"
                      value={formSua.ma_nhan_vien}
                      onChange={(e) => setFormSua((s) => ({ ...s, ma_nhan_vien: e.target.value }))}
                      placeholder="VD: NV-001..."
                      className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>

                  {/* Chức vụ */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Chức vụ / Chức danh
                    </label>
                    <input
                      type="text"
                      list="goi-y-chuc-vu"
                      value={formSua.chuc_vu}
                      onChange={(e) => setFormSua((s) => ({ ...s, chuc_vu: e.target.value }))}
                      placeholder="Chọn hoặc nhập chức vụ..."
                      className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                    <datalist id="goi-y-chuc-vu">
                      {dsChucVu.map((cv) => (
                        <option key={cv.id} value={cv.ten_chuc_vu} />
                      ))}
                    </datalist>
                  </div>

                  {/* Vai trò hệ thống */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">
                      Vai trò tài khoản hệ thống
                    </label>
                    {coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) ? (
                      <select
                        value={formSua.vai_tro}
                        onChange={(e) => setFormSua((s) => ({ ...s, vai_tro: e.target.value }))}
                        className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      >
                        {dsVaiTroHopLe.map((vt) => (
                          <option key={vt.id} value={vt.id}>
                            {vt.ten}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="h-9 px-3 rounded-[var(--radius-input)] bg-muted/40 border border-border flex items-center text-xs text-muted-foreground">
                        {thongTinVaiTro.nhan} (Chỉ Quản trị viên mới có thể phân vai trò)
                      </div>
                    )}
                  </div>

                  {/* Ảnh đại diện nhân viên */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-foreground">
                      Ảnh đại diện nhân viên
                    </label>
                    <TaiLenAnhDaiDien
                      url_anh={formSua.url_anh_dai_dien}
                      ho_ten={formSua.ho_va_ten || ns?.ho_va_ten}
                      khiThayDoi={(url) => setFormSua((s) => ({ ...s, url_anh_dai_dien: url || '' }))}
                      disabled={dangXuLySua}
                    />
                  </div>
                </div>
              </div>

              {/* Phân quyền nâng cao (Chỉ Quản trị viên) */}
              {coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) && (
                <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setMoNgoaiLe((v) => !v)}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Phân quyền ngoại lệ & Phụ trách mở rộng
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Thiết lập các phòng ban phụ trách thêm hoặc cấp quyền/chặn quyền chi tiết
                      </p>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                    >
                      {moNgoaiLe ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>
                  </div>

                  {moNgoaiLe && (
                    <div className="space-y-5 pt-3 border-t border-border">
                      {/* Phòng ban phụ trách thêm */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Phòng ban phụ trách thêm (ngoài phòng ban chính)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-[var(--radius-input)] border border-border bg-muted/20">
                          {dsPhongBan.map((pb) => {
                            const daChon = formSua.phong_ban_phu_trach_them.includes(pb.id);
                            return (
                              <label
                                key={pb.id}
                                className="flex items-center gap-2 text-xs text-foreground cursor-pointer p-1.5 rounded hover:bg-muted/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={daChon}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormSua((s) => ({
                                        ...s,
                                        phong_ban_phu_trach_them: [...s.phong_ban_phu_trach_them, pb.id]
                                      }));
                                    } else {
                                      setFormSua((s) => ({
                                        ...s,
                                        phong_ban_phu_trach_them: s.phong_ban_phu_trach_them.filter(
                                          (x) => x !== pb.id
                                        )
                                      }));
                                    }
                                  }}
                                  className="rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="truncate">{pb.ten_phong_ban}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quyền cấp thêm */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Quyền ngoại lệ cấp thêm
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-[var(--radius-input)] border border-border bg-muted/20">
                          {DANH_SACH_QUYEN_HAN_HE_THONG.map((qh) => {
                            const daCap = formSua.quyen_ngoai_le_cap_them.includes(qh.ma_quyen);
                            return (
                              <label
                                key={qh.ma_quyen}
                                className="flex items-start gap-2 text-xs text-foreground cursor-pointer p-1.5 rounded hover:bg-muted/50"
                              >
                                <input
                                  type="checkbox"
                                  checked={daCap}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormSua((s) => ({
                                        ...s,
                                        quyen_ngoai_le_cap_them: [...s.quyen_ngoai_le_cap_them, qh.ma_quyen]
                                      }));
                                    } else {
                                      setFormSua((s) => ({
                                        ...s,
                                        quyen_ngoai_le_cap_them: s.quyen_ngoai_le_cap_them.filter(
                                          (x) => x !== qh.ma_quyen
                                        )
                                      }));
                                    }
                                  }}
                                  className="mt-0.5 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{qh.ten_quyen}</div>
                                  <div className="text-[10.5px] text-muted-foreground font-mono">{qh.ma_quyen}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-border bg-card shadow-sm overflow-hidden">
              {/* Header Tabs */}
              <div className="border-b border-border px-4 pt-2.5 pb-0 bg-muted/20">
                <BoCacTab
                  gia_tri_mac_dinh={tabHienTai}
                  on_gia_tri_thay_doi={(gt) => setTabHienTai(gt as TenTab)}
                >
                  <DanhSachNutTab>
                    {tabsHienThi.map((t) => (
                      <NutTab
                        key={t.key}
                        gia_tri={t.key}
                        icon_trai={t.bieuTuong}
                        so_luong={typeof t.dem === 'number' ? t.dem : undefined}
                      >
                        {t.nhan}
                      </NutTab>
                    ))}
                  </DanhSachNutTab>
                </BoCacTab>
              </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6">
              {/* TAB 1: Dự án phụ trách */}
              {tabHienTai === 'du_an' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Hồ sơ dự án ({dsDA.length})
                    </h3>
                  </div>

                  {dsDA.length === 0 ? (
                    <Rong
                      kieu="mac_dinh"
                      icon_tuy_chinh={FolderKanban}
                      nhan_tuy_chinh="Chưa có dự án"
                      nhan_phu_tuy_chinh="Nhân viên này hiện chưa được phân công dự án nào."
                    />
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {dsDA.map((hda) => (
                        <Link
                          key={hda.id}
                          href={`/ho-so-du-an/${hda.id}`}
                          className="group rounded-[var(--radius-card)] border border-border bg-card hover:border-primary/40 hover:shadow-sm transition p-4 block space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {hda.ma_ho_so && (
                                <div className="text-xs font-mono text-muted-foreground font-medium mb-0.5">
                                  {hda.ma_ho_so}
                                </div>
                              )}
                              <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition">
                                {hda.ten_du_an}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border">
                            <span className="text-muted-foreground">Giá trị dự kiến:</span>
                            <span className="font-semibold text-foreground tabular-nums">
                              {hda.gia_tri_du_kien ? formatTien(hda.gia_tri_du_kien) : '0 ₫'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Hieu kieu="primary" kich_thuoc="xs">
                              {hda.giai_doan}
                            </Hieu>
                            {hda.muc_do_tiem_nang && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 font-medium border border-purple-500/20">
                                {hda.muc_do_tiem_nang}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}



              {/* TAB 3: Báo cáo công việc */}
              {tabHienTai === 'bao_cao' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Báo cáo công việc ({dsBC.length})
                    </h3>
                  </div>

                  {dsBC.length === 0 ? (
                    <Rong
                      kieu="mac_dinh"
                      icon_tuy_chinh={FileText}
                      nhan_tuy_chinh="Chưa có báo cáo"
                      nhan_phu_tuy_chinh="Chưa có báo cáo công việc nào từ nhân sự này."
                    />
                  ) : (
                    <div className="space-y-3">
                      {dsBC.map((bc) => {
                        const laTamLuu = bc.trang_thai === 'tam_luu';
                        const dsChiTiet =
                          bc.danh_sach_chi_tiet && bc.danh_sach_chi_tiet.length > 0
                            ? bc.danh_sach_chi_tiet.filter((x) => x && x.noi_dung?.trim())
                            : bc.noi_dung_thuc_hien
                            ? [{ du_an_id: bc.du_an_id ?? null, noi_dung: bc.noi_dung_thuc_hien }]
                            : [];

                        return (
                          <div
                            key={bc.id}
                            className={cn(
                              'rounded-[var(--radius-card)] border bg-card p-4 flex items-start gap-3.5 hover:shadow-sm transition',
                              laTamLuu ? 'border-amber-300 bg-amber-50/10' : 'border-border hover:border-primary/40'
                            )}
                          >
                            <ToLichNgay
                              ngayStr={bc.ngay_bao_cao}
                              kichThuoc="sm"
                              trangThai={bc.trang_thai}
                            />
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  {laTamLuu ? (
                                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                      📝 Tạm lưu (nháp)
                                    </span>
                                  ) : (
                                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      ✓ Đã gửi
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {dsChiTiet.length} đầu việc
                                  </span>
                                </div>
                                {bc.kho_khan && (
                                  <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                                    <AlertTriangle className="size-3" /> Vướng mắc
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 text-xs text-foreground/90">
                                {dsChiTiet.map((ct, idx) => (
                                  <div key={idx} className="line-clamp-2 leading-relaxed">
                                    • {ct.noi_dung}
                                  </div>
                                ))}
                              </div>

                              {bc.kho_khan && (
                                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                                  <span className="font-bold">Khó khăn:</span> {bc.kho_khan}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* CỘT PHỤ (Phải ~32% - 4 cột) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Thẻ Thông tin cá nhân */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Thông tin cá nhân
              </span>
              {!dangChinhSua && (coQuyen(nguoiDungHienTai, 'nhan_su.quan_ly', dsVaiTro) || nguoiDungHienTai?.id === ns?.id) && (
                <button
                  type="button"
                  onClick={batDauChinhSua}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Sửa
                </button>
              )}
            </div>

            {dangChinhSua ? (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email đăng nhập tài khoản
                  </label>
                  <input
                    type="email"
                    value={formSua.email}
                    onChange={(e) => setFormSua((s) => ({ ...s, email: e.target.value }))}
                    placeholder="VD: nhanvien@domain.com"
                    required
                    className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <span className="text-[10.5px] text-muted-foreground block">
                    Đổi email tại đây sẽ tự động đồng bộ cả tài khoản đăng nhập Firebase và hồ sơ nhân sự.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formSua.so_dien_thoai}
                    onChange={(e) => setFormSua((s) => ({ ...s, so_dien_thoai: e.target.value }))}
                    placeholder="VD: 0901234567..."
                    className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Email tài khoản</div>
                    <a
                      href={`mailto:${ns?.email}`}
                      className="font-medium text-foreground hover:text-primary hover:underline break-all text-sm"
                    >
                      {ns?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Số điện thoại</div>
                    {ns?.so_dien_thoai ? (
                      <a
                        href={`tel:${ns.so_dien_thoai}`}
                        className="font-medium text-foreground hover:text-primary hover:underline font-mono text-sm"
                      >
                        {ns.so_dien_thoai}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Chức vụ</div>
                    <span className="font-medium text-foreground text-sm">
                      {ns?.chuc_vu || 'Chưa thiết lập'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Thẻ Cơ cấu tổ chức */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block border-b border-border pb-3">
              Cơ cấu tổ chức
            </span>

            {dangChinhSua ? (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Chi nhánh</label>
                  <select
                    value={formSua.chi_nhanh_id}
                    onChange={(e) => {
                      const cnMoi = e.target.value;
                      setFormSua((s) => {
                        const hopLe = dsPhongBan.some((pb) => pb.chi_nhanh_id === cnMoi && pb.id === s.phong_ban_id);
                        return {
                          ...s,
                          chi_nhanh_id: cnMoi,
                          phong_ban_id: hopLe ? s.phong_ban_id : ''
                        };
                      });
                    }}
                    className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="">Chưa gán chi nhánh</option>
                    {dsChiNhanh.map((cn) => (
                      <option key={cn.id} value={cn.id}>
                        {cn.ten_chi_nhanh}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Phòng ban</label>
                  <select
                    value={formSua.phong_ban_id}
                    onChange={(e) => setFormSua((s) => ({ ...s, phong_ban_id: e.target.value }))}
                    className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  >
                    <option value="">Chưa gán phòng ban</option>
                    {dsPhongBanFiltered.map((pb) => (
                      <option key={pb.id} value={pb.id}>
                        {pb.ten_phong_ban}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Chi nhánh</div>
                    <span className="font-medium text-foreground text-sm">
                      {chiNhanh?.ten_chi_nhanh || 'Chưa gán chi nhánh'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Phòng ban</div>
                    <span className="font-medium text-foreground text-sm">
                      {phongBan?.ten_phong_ban || 'Chưa gán phòng ban'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Thẻ Thông tin hệ thống */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block border-b border-border pb-3">
              Thông tin hệ thống
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <span className="text-muted-foreground">Mã nhân viên:</span>
                <span className="font-mono font-semibold text-foreground">{ns?.ma_nhan_vien || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <span className="text-muted-foreground">Ngày tham gia:</span>
                <span className="font-semibold text-foreground">{formatNgay(ns?.ngay_tao)}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                <span className="font-semibold text-foreground">{formatNgay(ns?.ngay_cap_nhat)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {moModalDoiMk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-card shadow-2xl overflow-hidden border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <KeyRound className="size-4 text-primary" />
                Đổi mật khẩu nhân viên
              </div>
              <button
                type="button"
                onClick={() => setMoModalDoiMk(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={xuLyDoiMatKhau} className="p-5 space-y-4">
              {loiMk && (
                <div className="p-3 rounded-[var(--radius-input)] bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                  {loiMk}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Mật khẩu mới (tối thiểu 6 ký tự) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMkMoi('123456');
                      setNhapLaiMk('123456');
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded"
                  >
                    Gán nhanh: 123456
                  </button>
                </div>

                <input
                  type="text"
                  value={mkMoi}
                  onChange={(e) => setMkMoi(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  required
                  className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Xác nhận lại mật khẩu *
                  </label>
                  <input
                    type="text"
                    value={nhapLaiMk}
                    onChange={(e) => setNhapLaiMk(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    required
                    className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                {nguoiDungHienTai?.id !== ns?.id && (
                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Hoặc gửi link qua email của nhân viên:</span>
                    <button
                      type="button"
                      disabled={dangXuLyMk}
                      onClick={xuLyGuiEmailReset}
                      className="text-primary hover:underline font-semibold"
                    >
                      Gửi email khôi phục
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Nut
                  kieu="outline"
                  kich_thuoc="sm"
                  onClick={() => setMoModalDoiMk(false)}
                >
                  Hủy
                </Nut>
                <Nut
                  kieu="primary"
                  kich_thuoc="sm"
                  type="submit"
                  disabled={dangXuLyMk}
                  icon_trai={dangXuLyMk ? Loader2 : KeyRound}
                >
                  {dangXuLyMk ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
                </Nut>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
