'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Users,
  FolderKanban,
  FileText,
  Calendar,
  UserPlus,
  Pencil,
  Trash2,
  Plus,
  Lock,
  Unlock,
  ExternalLink,
  Wallet,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  ChevronRight,
  X
} from 'lucide-react';
import { notFound, useRouter, useParams } from 'next/navigation';
import type { KhachHang, NguoiLienHe, LoaiKhachHang } from '../../../../thu_vien/types/khach_hang';
import type { HoSoDuAn } from '../../../../thu_vien/types/du_an';
import type { ChiNhanh, NhanSu } from '../../../../thu_vien/types/nhan_su';
import {
  layChiTietKhachHang,
  capNhatKhachHang,
  doiTrangThaiKhachHang
} from '../../../../dich_vu/khach_hang/dich_vu_khach_hang';
import {
  layDanhSachNguoiLienHeTheoKhachHang,
  xoaNguoiLienHe
} from '../../../../dich_vu/khach_hang/dich_vu_nguoi_lien_he';
import {
  danhSachHoSoDuAn,
  taoHoSoDuAnMoi,
  type TaoMoiHoSoDuAnDTO
} from '../../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachChiNhanh } from '../../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachNhanSu } from '../../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { ModalNguoiLienHe } from '../../../../thanh_phan/khach_hang/modal_nguoi_lien_he';
import FormHoSoDuAnDrawer from '../../../../thanh_phan/ho_so_du_an/form_ho_so_du_an_drawer';
import { formatNgay } from '../../../../thu_vien/utils/format_ngay';
import { formatTien } from '../../../../thu_vien/utils/format_tien';
import { cn } from '../../../../thu_vien/utils/cn';
import { useStoreXacThuc } from '../../../../thu_vien/zustand/store_xac_thuc';
import { duocXemKhachHang, duocXemHoSoDuAn } from '../../../../thu_vien/phan_quyen/kiem_tra_quyen';
import {
  BoCacTab,
  DanhSachNutTab,
  NutTab,
  NoiDungTab,
  Hieu,
  Rong,
  DaiDien,
  Nut
} from '../../../../thanh_phan/ui';

type TenTab = 'ho_so_du_an' | 'nguoi_lien_he' | 'ghi_chu';

const DS_TAB: { key: TenTab; nhan: string; bieuTuong: any; dem?: number }[] = [
  { key: 'ho_so_du_an', nhan: 'Hồ sơ dự án', bieuTuong: FolderKanban },
  { key: 'nguoi_lien_he', nhan: 'Người liên hệ', bieuTuong: Users },
  { key: 'ghi_chu', nhan: 'Ghi chú & Lịch sử', bieuTuong: FileText }
];

const TEN_LOAI_KH: Record<string, { nhan: string; kieu: 'primary' | 'muted' | 'success' }> = {
  doanh_nghiep: { nhan: 'Doanh nghiệp', kieu: 'primary' },
  ca_nhan: { nhan: 'Cá nhân', kieu: 'muted' },
  to_chuc: { nhan: 'Tổ chức', kieu: 'success' },
  khac: { nhan: 'Khác', kieu: 'muted' }
};

const TRANG_THAI_MAP: Record<KhachHang['trang_thai'], { nhan: string; kieu: 'success' | 'warning' | 'muted'; cham: string }> = {
  hoat_dong: { nhan: 'Đang hợp tác', kieu: 'success', cham: 'bg-emerald-500' },
  tam_dung: { nhan: 'Tạm dừng', kieu: 'warning', cham: 'bg-amber-500' },
  da_xoa: { nhan: 'Đã xóa', kieu: 'muted', cham: 'bg-muted-foreground' }
};

export default function TrangChiTietKhachHang() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);

  const [kh, setKh] = useState<KhachHang | null>(null);
  const [danhSachNLH, setDanhSachNLH] = useState<NguoiLienHe[]>([]);
  const [danhSachHDA, setDanhSachHDA] = useState<HoSoDuAn[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [errTai, setErrTai] = useState<string | null>(null);
  const [tabHienTai, setTabHienTai] = useState<TenTab>('ho_so_du_an');

  // Inline edit state
  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [dangXuLyLuuKh, setDangXuLyLuuKh] = useState(false);
  const [loiFormKh, setLoiFormKh] = useState<string | null>(null);
  const [formSuaKh, setFormSuaKh] = useState<{
    ten_khach_hang: string;
    loai_khach_hang: LoaiKhachHang;
    ma_so_thue: string;
    so_dien_thoai: string;
    email: string;
    dia_chi: string;
    website: string;
    chi_nhanh_id: string;
    nguoi_phu_trach_id: string;
    ghi_chu: string;
  }>({
    ten_khach_hang: '',
    loai_khach_hang: 'doanh_nghiep',
    ma_so_thue: '',
    so_dien_thoai: '',
    email: '',
    dia_chi: '',
    website: '',
    chi_nhanh_id: '',
    nguoi_phu_trach_id: '',
    ghi_chu: ''
  });

  const batDauChinhSua = () => {
    if (!kh) return;
    setFormSuaKh({
      ten_khach_hang: kh.ten_khach_hang || '',
      loai_khach_hang: (kh.loai_khach_hang as LoaiKhachHang) || 'doanh_nghiep',
      ma_so_thue: kh.ma_so_thue || '',
      so_dien_thoai: kh.so_dien_thoai || '',
      email: kh.email || '',
      dia_chi: kh.dia_chi || '',
      website: kh.website || '',
      chi_nhanh_id: kh.chi_nhanh_id || '',
      nguoi_phu_trach_id: kh.nguoi_phu_trach_id || '',
      ghi_chu: kh.ghi_chu || ''
    });
    setLoiFormKh(null);
    setDangChinhSua(true);
  };

  const huyChinhSua = () => {
    setDangChinhSua(false);
    setLoiFormKh(null);
  };

  const [moDrawerTaoDA, setMoDrawerTaoDA] = useState(false);
  const [dangXuLyLuuDA, setDangXuLyLuuDA] = useState(false);
  const [loiFormDA, setLoiFormDA] = useState<string | null>(null);

  const [moModalNLH, setMoModalNLH] = useState(false);
  const [dangSuaNLH, setDangSuaNLH] = useState<NguoiLienHe | null>(null);
  const [dangXuLyTacVu, setDangXuLyTacVu] = useState<Record<string, boolean>>({});

  const taiLai = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    setErrTai(null);
    try {
      const [kq1, kq2, kq3, kqCn, kqNs] = await Promise.all([
        layChiTietKhachHang(id),
        layDanhSachNguoiLienHeTheoKhachHang(id),
        danhSachHoSoDuAn({ khach_hang_id: id }),
        danhSachChiNhanh(),
        danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' })
      ]);
      if (!kq1) {
        setKh(null);
        return;
      }
      setKh(kq1);
      setDanhSachNLH(Array.isArray(kq2) ? kq2 : []);
      setDanhSachHDA(kq3.mang);
      setDsChiNhanh(kqCn.mang ?? []);
      setDsNhanSu(kqNs.mang ?? []);
    } catch (e: any) {
      setErrTai(e?.message ?? 'Tải dữ liệu khách hàng thất bại');
    } finally {
      setDangTai(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void taiLai();
  }, [id, taiLai]);

  const chiNhanhPhuTrach = useMemo(() => {
    if (!kh?.chi_nhanh_id) return null;
    return dsChiNhanh.find((c) => c.id === kh.chi_nhanh_id) ?? null;
  }, [kh?.chi_nhanh_id, dsChiNhanh]);

  const nhanSuPhuTrach = useMemo(() => {
    if (!kh?.nguoi_phu_trach_id) return null;
    return dsNhanSu.find((n) => n.id === kh.nguoi_phu_trach_id) ?? null;
  }, [kh?.nguoi_phu_trach_id, dsNhanSu]);

  const thongKeDA = useMemo(() => {
    const tongDuAn = danhSachHDA.length;
    const tongGiaTri = danhSachHDA.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0);
    const hoanThanh = danhSachHDA.filter((d) => d.giai_doan === 'hoan_thanh').length;
    return { tongDuAn, tongGiaTri, hoanThanh };
  }, [danhSachHDA]);

  const tabsHienThi = useMemo(() => {
    return DS_TAB.map((t) => {
      if (t.key === 'nguoi_lien_he') return { ...t, dem: danhSachNLH.length };
      if (t.key === 'ho_so_du_an') return { ...t, dem: danhSachHDA.length };
      return t;
    });
  }, [danhSachNLH.length, danhSachHDA.length]);

  // Actions
  const xuLyLuuSuaKh = async () => {
    if (!kh) return;
    const ten = formSuaKh.ten_khach_hang.trim();
    if (!ten) {
      setLoiFormKh('Tên khách hàng không được để trống.');
      return;
    }
    setDangXuLyLuuKh(true);
    setLoiFormKh(null);
    try {
      await capNhatKhachHang(
        {
          id: kh.id,
          ten_khach_hang: ten,
          loai_khach_hang: formSuaKh.loai_khach_hang,
          ma_so_thue: formSuaKh.ma_so_thue.trim() || null,
          so_dien_thoai: formSuaKh.so_dien_thoai.trim() || null,
          email: formSuaKh.email.trim() || null,
          dia_chi: formSuaKh.dia_chi.trim() || null,
          website: formSuaKh.website.trim() || null,
          chi_nhanh_id: formSuaKh.chi_nhanh_id || null,
          nguoi_phu_trach_id: formSuaKh.nguoi_phu_trach_id || null,
          ghi_chu: formSuaKh.ghi_chu.trim() || null
        },
        nguoiDungHienTai ?? null
      );
      setDangChinhSua(false);
      await taiLai();
    } catch (err: any) {
      setLoiFormKh(err?.message ?? 'Lưu khách hàng thất bại');
    } finally {
      setDangXuLyLuuKh(false);
    }
  };

  const xuLyLuuTaoDA = async (dto: any) => {
    setDangXuLyLuuDA(true);
    setLoiFormDA(null);
    try {
      const moi = await taoHoSoDuAnMoi(dto, nguoiDungHienTai ?? null);
      setMoDrawerTaoDA(false);
      router.push(`/ho-so-du-an/${moi.id}`);
    } catch (err: any) {
      setLoiFormDA(err?.message ?? 'Tạo hồ sơ dự án thất bại');
    } finally {
      setDangXuLyLuuDA(false);
    }
  };

  const xuLyDoiTrangThai = async () => {
    if (!kh) return;
    const key = 'doi_tt';
    setDangXuLyTacVu((o) => ({ ...o, [key]: true }));
    try {
      const ttMoi = kh.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
      await doiTrangThaiKhachHang(kh.id, ttMoi, nguoiDungHienTai ?? null);
      await taiLai();
    } catch (err: any) {
      alert('Không thể cập nhật trạng thái: ' + (err?.message ?? ''));
    } finally {
      setDangXuLyTacVu((o) => ({ ...o, [key]: false }));
    }
  };

  const xuLyXoaMem = async () => {
    if (!kh) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${kh.ten_khach_hang}"?`)) return;
    const key = 'xoa_kh';
    setDangXuLyTacVu((o) => ({ ...o, [key]: true }));
    try {
      await doiTrangThaiKhachHang(kh.id, 'da_xoa', nguoiDungHienTai ?? null);
      router.push('/khach-hang');
    } catch (err: any) {
      alert('Không thể xóa khách hàng: ' + (err?.message ?? ''));
      setDangXuLyTacVu((o) => ({ ...o, [key]: false }));
    }
  };

  const moThemNLH = () => {
    setDangSuaNLH(null);
    setMoModalNLH(true);
  };

  const moSuaNLH = (nlh: NguoiLienHe) => {
    setDangSuaNLH(nlh);
    setMoModalNLH(true);
  };

  const xuLyXoaNLH = async (nlh: NguoiLienHe) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người liên hệ "${nlh.ho_va_ten}"?`)) return;
    try {
      await xoaNguoiLienHe(nlh.id, null, nlh.ho_va_ten);
      await taiLai();
    } catch (err: any) {
      alert('Không thể xóa: ' + (err?.message ?? ''));
    }
  };

  const duocQuyenXem = useMemo(() => {
    if (!kh || !nguoiDungHienTai) return false;
    const dsDuAnCuaToi = danhSachHDA.filter((hda) => duocXemHoSoDuAn(nguoiDungHienTai, hda));
    const dsKhachHangIdsCoDuAn = new Set(dsDuAnCuaToi.map((hda) => hda.khach_hang_id).filter(Boolean) as string[]);
    return duocXemKhachHang(nguoiDungHienTai, kh, undefined, dsKhachHangIdsCoDuAn);
  }, [kh, nguoiDungHienTai, danhSachHDA]);

  if (!dangTai && kh && !duocQuyenXem) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Không có quyền truy cập</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn không có quyền xem thông tin khách hàng này. Bạn chỉ có thể xem khách hàng do mình tạo, phụ trách hoặc có dự án liên quan.
          </p>
        </div>
        <Link
          href="/khach-hang"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-input)] bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách khách hàng
        </Link>
      </div>
    );
  }

  if (!kh && !dangTai) {
    try {
      notFound();
    } catch {
      return (
        <div className="p-8 text-center max-w-md mx-auto">
          <p className="text-muted-foreground mb-4 font-medium">Không tìm thấy hồ sơ khách hàng</p>
          <Link
            href="/khach-hang"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-input)] bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </div>
      );
    }
    return null;
  }

  const loaiKh = TEN_LOAI_KH[(kh?.loai_khach_hang as string) ?? 'khac'] ?? TEN_LOAI_KH.khac;
  const ttKh = kh ? TRANG_THAI_MAP[kh.trang_thai] : TRANG_THAI_MAP.hoat_dong;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="space-y-3 pb-3 border-b border-border">
        {/* Breadcrumb & Navigation (ẩn trên mobile để tránh trùng Topbar) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-slate-500">
          <Link href="/khach-hang" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors font-semibold active:scale-95">
            <ArrowLeft className="size-3.5 text-slate-500" />
            Khách hàng
          </Link>
          <ChevronRight className="size-3 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[280px] sm:max-w-[420px] px-1.5">
            {kh?.ten_khach_hang ?? 'Đang tải...'}
          </span>
        </div>

        {/* Main Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex items-start gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {kh?.ten_khach_hang ?? 'Khách hàng'}
                </h1>
                {kh && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Hieu kieu={loaiKh.kieu} kich_thuoc="sm">
                      {loaiKh.nhan}
                    </Hieu>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                      <span className={cn('size-1.5 rounded-full shrink-0', ttKh.cham)} />
                      {ttKh.nhan}
                    </span>
                    {kh.ma_so_thue && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-xs border border-border">
                        MST: {kh.ma_so_thue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button Group */}
          {kh && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {dangChinhSua ? (
                <>
                  <Nut
                    kieu="outline"
                    kich_thuoc="sm"
                    icon_trai={X}
                    onClick={huyChinhSua}
                    disabled={dangXuLyLuuKh}
                  >
                    Hủy
                  </Nut>
                  <Nut
                    kieu="primary"
                    kich_thuoc="sm"
                    icon_trai={dangXuLyLuuKh ? Loader2 : CheckCircle2}
                    onClick={xuLyLuuSuaKh}
                    disabled={dangXuLyLuuKh}
                  >
                    {dangXuLyLuuKh ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Nut>
                </>
              ) : (
                <>
                  <Nut
                    kieu="primary"
                    kich_thuoc="sm"
                    icon_trai={Pencil}
                    onClick={batDauChinhSua}
                  >
                    Chỉnh sửa
                  </Nut>
                  <Nut
                    kieu="outline"
                    kich_thuoc="sm"
                    icon_trai={dangXuLyTacVu['doi_tt'] ? Loader2 : kh.trang_thai === 'hoat_dong' ? Lock : Unlock}
                    onClick={xuLyDoiTrangThai}
                    disabled={dangXuLyTacVu['doi_tt'] || kh.trang_thai === 'da_xoa'}
                  >
                    {kh.trang_thai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'}
                  </Nut>
                  <Nut
                    kieu="danger"
                    kich_thuoc="sm"
                    icon_trai={dangXuLyTacVu['xoa_kh'] ? Loader2 : Trash2}
                    onClick={xuLyXoaMem}
                    disabled={dangXuLyTacVu['xoa_kh'] || kh.trang_thai === 'da_xoa'}
                  >
                    Xóa
                  </Nut>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Thông báo lỗi hoặc Banner chỉnh sửa trực tiếp */}
      {loiFormKh && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{loiFormKh}</span>
        </div>
      )}
      {dangChinhSua && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="flex items-center gap-2">
            <Pencil className="size-4 shrink-0" /> Chế độ chỉnh sửa trực tiếp đang mở. Bạn có thể chỉnh sửa các thông tin bên dưới và bấm "Lưu thay đổi".
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={huyChinhSua}
              disabled={dangXuLyLuuKh}
              className="px-2.5 py-1 rounded-md border border-border bg-background text-foreground hover:bg-muted text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={xuLyLuuSuaKh}
              disabled={dangXuLyLuuKh}
              className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {dangXuLyLuuKh ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT CHÍNH (Trái ~68% - 8 cột) */}
        <div className="lg:col-span-8 space-y-6">
          {dangChinhSua && (
            <div className="rounded-[var(--radius-card)] border border-primary/30 bg-card p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground border-b border-border pb-3">
                <Building2 className="size-4 text-primary" />
                Thông tin chung khách hàng
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Tên khách hàng <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formSuaKh.ten_khach_hang}
                    onChange={(e) => setFormSuaKh((f) => ({ ...f, ten_khach_hang: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 font-medium"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Loại khách hàng</label>
                  <select
                    value={formSuaKh.loai_khach_hang}
                    onChange={(e) => setFormSuaKh((f) => ({ ...f, loai_khach_hang: e.target.value as any }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="doanh_nghiep">Doanh nghiệp</option>
                    <option value="ca_nhan">Cá nhân</option>
                    <option value="to_chuc">Tổ chức</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Mã số thuế</label>
                  <input
                    type="text"
                    value={formSuaKh.ma_so_thue}
                    onChange={(e) => setFormSuaKh((f) => ({ ...f, ma_so_thue: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    placeholder="Mã số thuế (nếu có)"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground mb-1 block">Ghi chú khách hàng</label>
                  <textarea
                    rows={3}
                    value={formSuaKh.ghi_chu}
                    onChange={(e) => setFormSuaKh((f) => ({ ...f, ghi_chu: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
                    placeholder="Ghi chú đặc điểm hoặc yêu cầu của khách hàng..."
                  />
                </div>
              </div>
            </div>
          )}

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
              {/* TAB 1: Hồ sơ dự án */}
              {tabHienTai === 'ho_so_du_an' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border pb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Hồ sơ dự án ({danhSachHDA.length})
                    </h3>
                    <Nut
                      kieu="primary"
                      kich_thuoc="sm"
                      icon_trai={Plus}
                      onClick={() => {
                        setLoiFormDA(null);
                        setMoDrawerTaoDA(true);
                      }}
                    >
                      Tạo dự án mới
                    </Nut>
                  </div>

                  <BanHoSoDuAnCuaKhach
                    danhSach={danhSachHDA}
                    dangTai={dangTai}
                    err={errTai}
                    khachHangId={id}
                    onThemDA={() => {
                      setLoiFormDA(null);
                      setMoDrawerTaoDA(true);
                    }}
                  />
                </div>
              )}

              {/* TAB 2: Người liên hệ */}
              {tabHienTai === 'nguoi_lien_he' && (
                <BanNguoiLienHe
                  danhSach={danhSachNLH}
                  dangTai={dangTai}
                  err={errTai}
                  khachHangId={id}
                  onThem={moThemNLH}
                  onSua={moSuaNLH}
                  onXoa={xuLyXoaNLH}
                />
              )}

              {/* TAB 3: Ghi chú & Lịch sử */}
              {tabHienTai === 'ghi_chu' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ghi chú
                    </div>
                    {kh?.ghi_chu ? (
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {kh.ghi_chu}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Chưa có ghi chú nào.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Lịch sử hệ thống
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Thời gian tạo:</span>
                        <span className="font-semibold text-foreground">{formatNgay(kh?.ngay_tao)}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                        <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                        <span className="font-semibold text-foreground">{formatNgay(kh?.ngay_cap_nhat)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHỤ (Phải ~32% - 4 cột) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Thẻ thông tin liên hệ */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Thông tin liên hệ
              </span>
              {!dangChinhSua ? (
                <button
                  type="button"
                  onClick={batDauChinhSua}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Sửa
                </button>
              ) : (
                <span className="text-[11px] text-primary font-semibold">Đang chỉnh sửa</span>
              )}
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Điện thoại</div>
                  {dangChinhSua ? (
                    <input
                      type="tel"
                      value={formSuaKh.so_dien_thoai}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, so_dien_thoai: e.target.value }))}
                      placeholder="Số điện thoại"
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60 font-mono"
                    />
                  ) : kh?.so_dien_thoai ? (
                    <a
                      href={`tel:${kh.so_dien_thoai}`}
                      className="font-medium text-foreground hover:text-primary hover:underline font-mono text-sm"
                    >
                      {kh.so_dien_thoai}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  {dangChinhSua ? (
                    <input
                      type="email"
                      value={formSuaKh.email}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, email: e.target.value }))}
                      placeholder="Địa chỉ email"
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    />
                  ) : kh?.email ? (
                    <a
                      href={`mailto:${kh.email}`}
                      className="font-medium text-foreground hover:text-primary hover:underline break-all text-sm"
                    >
                      {kh.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Website</div>
                  {dangChinhSua ? (
                    <input
                      type="text"
                      value={formSuaKh.website}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, website: e.target.value }))}
                      placeholder="VD: https://congty.vn"
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    />
                  ) : kh?.website ? (
                    <a
                      href={kh.website.startsWith('http') ? kh.website : `https://${kh.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1 text-sm"
                    >
                      {kh.website}
                      <ExternalLink className="size-3 opacity-70 inline" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Địa chỉ</div>
                  {dangChinhSua ? (
                    <textarea
                      rows={2}
                      value={formSuaKh.dia_chi}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, dia_chi: e.target.value }))}
                      placeholder="Địa chỉ trụ sở / văn phòng..."
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60 resize-y"
                    />
                  ) : kh?.dia_chi ? (
                    <span className="font-medium text-foreground leading-snug break-words text-sm">
                      {kh.dia_chi}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Thẻ Quản lý & Phân công */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block border-b border-border pb-3">
              Quản lý & Phân công
            </span>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Chi nhánh</div>
                  {dangChinhSua ? (
                    <select
                      value={formSuaKh.chi_nhanh_id}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, chi_nhanh_id: e.target.value }))}
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {dsChiNhanh.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.ten_chi_nhanh}
                        </option>
                      ))}
                    </select>
                  ) : chiNhanhPhuTrach ? (
                    <span className="font-medium text-foreground">{chiNhanhPhuTrach.ten_chi_nhanh}</span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa phân công</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Người phụ trách</div>
                  {dangChinhSua ? (
                    <select
                      value={formSuaKh.nguoi_phu_trach_id}
                      onChange={(e) => setFormSuaKh((f) => ({ ...f, nguoi_phu_trach_id: e.target.value }))}
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {dsNhanSu.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.ho_va_ten} ({n.email})
                        </option>
                      ))}
                    </select>
                  ) : nhanSuPhuTrach ? (
                    <div>
                      <div className="font-medium text-foreground">{nhanSuPhuTrach.ho_va_ten}</div>
                      <div className="text-xs text-muted-foreground">{nhanSuPhuTrach.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Chưa phân công</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Thẻ Tóm tắt kinh doanh */}
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-sm space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block border-b border-border pb-3">
              Tổng quan kinh doanh
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 border border-border p-3">
                <div className="text-xs text-muted-foreground">Tổng số dự án</div>
                <div className="text-xl font-bold text-foreground mt-1 tabular-nums">
                  {thongKeDA.tongDuAn}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 border border-border p-3">
                <div className="text-xs text-muted-foreground">Hoàn thành</div>
                <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
                  {thongKeDA.hoanThanh}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 border border-border p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tổng giá trị:</span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {thongKeDA.tongGiaTri > 0 ? formatTien(thongKeDA.tongGiaTri) : '0 ₫'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer tạo hồ sơ dự án mới cho khách hàng này */}
      <FormHoSoDuAnDrawer
        mo={moDrawerTaoDA}
        khi_dong={() => {
          setMoDrawerTaoDA(false);
          setLoiFormDA(null);
        }}
        dang_sua={null}
        khi_luu={xuLyLuuTaoDA}
        dang_xu_ly={dangXuLyLuuDA}
        loi_thong_bao={loiFormDA}
      />

      {/* Modal thêm/sửa người liên hệ */}
      <ModalNguoiLienHe
        mo={moModalNLH}
        onDong={() => {
          setMoModalNLH(false);
          setDangSuaNLH(null);
        }}
        khachHangId={id ?? ''}
        tenKhachHang={kh?.ten_khach_hang}
        dangSua={dangSuaNLH}
        onLuuThanhCong={taiLai}
      />
    </div>
  );
}

function BanNguoiLienHe({
  danhSach,
  dangTai,
  err,
  khachHangId,
  onThem,
  onSua,
  onXoa
}: {
  danhSach: NguoiLienHe[];
  dangTai: boolean;
  err: string | null;
  khachHangId: string | null;
  onThem: () => void;
  onSua: (nlh: NguoiLienHe) => void;
  onXoa: (nlh: NguoiLienHe) => void;
}) {
  if (dangTai) return <SkeletonList so={3} />;
  if (err) return <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Người liên hệ ({danhSach.length})
        </h3>
        <Nut
          kieu="primary"
          kich_thuoc="sm"
          icon_trai={UserPlus}
          onClick={onThem}
        >
          Thêm người liên hệ
        </Nut>
      </div>

      {danhSach.length === 0 ? (
        <Rong
          kieu="mac_dinh"
          icon_tuy_chinh={Users}
          nhan_tuy_chinh="Chưa có người liên hệ"
          nhan_phu_tuy_chinh="Thêm người liên hệ để lưu thông tin trao đổi với khách hàng."
          hanh_dong={
            <Nut kieu="primary" kich_thuoc="sm" icon_trai={UserPlus} onClick={onThem}>
              Thêm người liên hệ
            </Nut>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {danhSach.map((nlh) => (
            <div
              key={nlh.id}
              className="group rounded-[var(--radius-card)] border border-border bg-card hover:border-primary/40 hover:shadow-sm transition p-4 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <DaiDien ten={nlh.ho_va_ten} kich_thuoc="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {nlh.ho_va_ten ?? '(Chưa đặt tên)'}
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onSua(nlh)}
                        title="Chỉnh sửa"
                        className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onXoa(nlh)}
                        title="Xóa"
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {nlh.chuc_vu && (
                    <div className="text-xs text-primary font-medium mt-0.5">{nlh.chuc_vu}</div>
                  )}
                  <div className="mt-2.5 space-y-1.5">
                    {nlh.so_dien_thoai ? (
                      <a
                        href={`tel:${nlh.so_dien_thoai}`}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline"
                      >
                        <Phone className="size-3" /> <span className="font-mono">{nlh.so_dien_thoai}</span>
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                        <Phone className="size-3" /> (Chưa có SĐT)
                      </span>
                    )}
                    {nlh.email ? (
                      <a
                        href={`mailto:${nlh.email}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                      >
                        <Mail className="size-3" /> <span className="truncate">{nlh.email}</span>
                      </a>
                    ) : null}
                  </div>
                  {nlh.ghi_chu && (
                    <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground line-clamp-2 italic">
                      {nlh.ghi_chu}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BanHoSoDuAnCuaKhach({
  danhSach,
  dangTai,
  err,
  khachHangId,
  onThemDA
}: {
  danhSach: HoSoDuAn[];
  dangTai: boolean;
  err: string | null;
  khachHangId: string | null;
  onThemDA: () => void;
}) {
  if (dangTai) return <SkeletonList so={3} />;
  if (err) return <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4">{err}</div>;

  if (danhSach.length === 0) {
    return (
      <Rong
        kieu="mac_dinh"
        icon_tuy_chinh={FolderKanban}
        nhan_tuy_chinh="Chưa có hồ sơ dự án"
        nhan_phu_tuy_chinh="Tạo hồ sơ dự án mới để quản lý hoạt động kinh doanh với khách hàng này."
        hanh_dong={
          <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={onThemDA}>
            Tạo hồ sơ dự án mới
          </Nut>
        }
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
      {danhSach.map((hda: HoSoDuAn) => (
        <Link
          key={hda.id}
          href={`/ho-so-du-an/${hda.id}`}
          className="group rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md transition p-4 block space-y-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
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

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="text-muted-foreground">Giá trị dự kiến:</span>
            <span className="font-semibold text-foreground tabular-nums">
              {hda.gia_tri_du_kien ? formatTien(hda.gia_tri_du_kien) : '0 ₫'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <BadgeGiaiDoan value={hda.giai_doan} />
            {hda.muc_do_tiem_nang && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 font-medium border border-purple-500/20">
                Tiềm năng: {hda.muc_do_tiem_nang}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

const MAP_HIEU_GIAI_DOAN: Record<string, 'muted' | 'primary' | 'success' | 'warning' | 'danger'> = {
  moi_tao: 'muted',
  tiep_can: 'primary',
  khao_sat: 'primary',
  len_giai_phap: 'primary',
  bao_gia: 'warning',
  dam_phan: 'warning',
  ky_hop_dong: 'success',
  trien_khai: 'primary',
  nghiem_thu: 'success',
  hoan_thanh: 'success',
  tam_dung: 'warning',
  huy: 'danger'
};

const TEN_GIAI_DOAN_LABEL: Record<string, string> = {
  moi_tao: 'Mới tạo',
  tiep_can: 'Tiếp cận',
  khao_sat: 'Khảo sát',
  len_giai_phap: 'Giải pháp',
  bao_gia: 'Báo giá',
  dam_phan: 'Đàm phán',
  ky_hop_dong: 'Ký HĐ',
  trien_khai: 'Triển khai',
  nghiem_thu: 'Nghiệm thu',
  hoan_thanh: 'Hoàn thành',
  tam_dung: 'Tạm dừng',
  huy: 'Đã hủy'
};

function BadgeGiaiDoan({ value }: { value?: string | null }) {
  const kieu = MAP_HIEU_GIAI_DOAN[value ?? 'moi_tao'] ?? 'muted';
  const label = TEN_GIAI_DOAN_LABEL[value ?? 'moi_tao'] ?? (value ?? 'Mới tạo');
  return (
    <Hieu kieu={kieu} kich_thuoc="sm">
      {label}
    </Hieu>
  );
}

function SkeletonList({ so }: { so: number }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
      {Array.from({ length: so }).map((_, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-4 space-y-3">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-5 w-4/5 bg-muted animate-pulse rounded" />
          <div className="h-7 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}
