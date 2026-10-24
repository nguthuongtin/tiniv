'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  ExternalLink,
  Link2,
  Clock,
  User,
  Users,
  UserCheck,
  FolderKanban,
  AlertCircle,
  X,
  History,
  Copy,
  CheckCircle2,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Search,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type {
  YeuCauPhoiHop
} from '../../thu_vien/types/yeu_cau_phoi_hop';
import { NHAN_TRANG_THAI_YEU_CAU } from '../../thu_vien/types/yeu_cau_phoi_hop';
import type { NguoiDungDangNhap, NhanSu, PhongBan } from '../../thu_vien/types/nhan_su';
import {
  chuyenBuocYeuCauPhoiHop,
  capNhatThongTinYeuCau,
  xoaYeuCauPhoiHop
} from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachPhongBan } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';

interface Props {
  danhSachYeuCau: YeuCauPhoiHop[];
  nguoiDungHienTai?: NguoiDungDangNhap | null;
  onCapNhatYeuCau?: (yeuCauCapNhat: YeuCauPhoiHop) => void;
  onXoaYeuCau?: (yeuCauId: string) => void;
  onMoChiTietDuAn?: (duAnId: string) => void;
  onMoModalTaoYeuCau?: () => void;
}

export default function HopYeuCauPhoiHop({
  danhSachYeuCau,
  nguoiDungHienTai,
  onCapNhatYeuCau,
  onXoaYeuCau,
  onMoChiTietDuAn,
  onMoModalTaoYeuCau
}: Props) {
  const [moToanBo, setMoToanBo] = useState(false);
  const [yeuCauDangXemLichSu, setYeuCauDangXemLichSu] = useState<YeuCauPhoiHop | null>(null);

  // 1. Modal tiếp nhận & phân công nhân sự
  const [modalGiaoViec, setModalGiaoViec] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
  }>({ mo: false, yeuCau: null });
  const [dsNhanSuChon, setDsNhanSuChon] = useState<{ id: string; ho_va_ten: string }[]>([]);
  const [ghiChuGiaoViec, setGhiChuGiaoViec] = useState('');
  const [hanXongGiaoViec, setHanXongGiaoViec] = useState('');
  const [tuKhoaTimNS, setTuKhoaTimNS] = useState('');
  const [dangXuLyGiaoViec, setDangXuLyGiaoViec] = useState(false);
  const [loiGiaoViec, setLoiGiaoViec] = useState('');

  // 2. Modal nộp kết quả
  const [modalNopDrive, setModalNopDrive] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
  }>({ mo: false, yeuCau: null });
  const [linkDriveNop, setLinkDriveNop] = useState('');
  const [ghiChuNop, setGhiChuNop] = useState('');
  const [dangXuLyNop, setDangXuLyNop] = useState(false);

  // 3. Modal yêu cầu chỉnh sửa lại
  const [modalYeuCauSua, setModalYeuCauSua] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
  }>({ mo: false, yeuCau: null });
  const [lyDoSua, setLyDoSua] = useState('');
  const [dangXuLyYeuCauSua, setDangXuLyYeuCauSua] = useState(false);

  // 4. Modal Chỉnh sửa yêu cầu cơ bản
  const [yeuCauDangSua, setYeuCauDangSua] = useState<YeuCauPhoiHop | null>(null);
  const [suaNoiDung, setSuaNoiDung] = useState('');
  const [suaLinkDrive, setSuaLinkDrive] = useState('');
  const [suaHanXong, setSuaHanXong] = useState('');
  const [dangLuuSua, setDangLuuSua] = useState(false);
  const [loiSua, setLoiSua] = useState('');

  // 5. Modal Xóa yêu cầu
  const [yeuCauDangXoa, setYeuCauDangXoa] = useState<YeuCauPhoiHop | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  // Dữ liệu nhân sự & phòng ban toàn hệ thống
  const [dsNhanSuToanBo, setDsNhanSuToanBo] = useState<NhanSu[]>([]);
  const [dsPhongBanToanBo, setDsPhongBanToanBo] = useState<PhongBan[]>([]);
  const [daTaiDanhMuc, setDaTaiDanhMuc] = useState(false);

  const [daCopyLink, setDaCopyLink] = useState<string | null>(null);

  // Thông tin user hiện tại
  const vaiTro = nguoiDungHienTai?.vai_tro || '';
  const userId = nguoiDungHienTai?.id || '';

  // Quyền điều hành & phân công (Lãnh đạo, Quản trị, Trưởng phòng)
  const coQuyenDieuHanh = vaiTro === 'giam_doc' || vaiTro === 'quan_tri_he_thong' || vaiTro === 'truong_phong';

  // Tải danh sách nhân sự & phòng ban khi cần chọn người
  const taiDuLieuNhanSuVaPhongBan = async () => {
    if (daTaiDanhMuc) return;
    try {
      const [resNS, resPB] = await Promise.all([
        danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong', trang_thai_hoat_dong: 'hoat_dong' }),
        danhSachPhongBan({ trang_thai_du_lieu: 'hoat_dong' })
      ]);
      setDsNhanSuToanBo(resNS.mang || []);
      setDsPhongBanToanBo(resPB.mang || []);
      setDaTaiDanhMuc(true);
    } catch (err) {
      console.warn('Lỗi tải danh mục nhân sự/phòng ban:', err);
    }
  };

  // Xác định những việc đang CHỜ ĐÚNG NGƯỜI xử lý
  const dsViecChoToi = useMemo(() => {
    return danhSachYeuCau.filter((yc) => {
      if (yc.trang_thai_du_lieu === 'da_xoa' || yc.trang_thai === 'da_hoan_thanh') {
        return false;
      }

      // Bước 1: Chờ tiếp nhận & phân công
      if (yc.trang_thai === 'cho_tpkd_duyet') {
        return coQuyenDieuHanh;
      }

      // Bước 2: Đang xử lý hoặc cần sửa lại -> việc của nhân sự được phân công
      if (yc.trang_thai === 'cho_khth_thuc_hien' || yc.trang_thai === 'yeu_cau_chinh_sua') {
        const duocGiaoDichDanh = Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
          yc.danh_sach_nhan_su_thuc_hien_ids.includes(userId);
        if (duocGiaoDichDanh) return true;
        if (!yc.danh_sach_nhan_su_thuc_hien_ids?.length && coQuyenDieuHanh) return true;
        if (coQuyenDieuHanh) return true;
        return false;
      }

      // Bước 3: Đã nộp kết quả -> Chờ duyệt kết quả
      if (yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') {
        return coQuyenDieuHanh;
      }

      // Bước 4: Đã duyệt -> Người tạo hoàn tất
      if (yc.trang_thai === 'da_phe_duyet') {
        return yc.nguoi_tao_id === userId || coQuyenDieuHanh;
      }

      return false;
    });
  }, [danhSachYeuCau, userId, coQuyenDieuHanh]);

  const dsHienThi = moToanBo
    ? danhSachYeuCau.filter((x) => x.trang_thai_du_lieu !== 'da_xoa')
    : dsViecChoToi;

  // Map ID phòng ban sang tên
  const mapTenPhongBan = useMemo(() => {
    const m = new Map<string, string>();
    dsPhongBanToanBo.forEach((pb) => m.set(pb.id, pb.ten_phong_ban));
    return m;
  }, [dsPhongBanToanBo]);

  // Mở modal tiếp nhận & phân công
  const moModalGiaoViec = async (yc: YeuCauPhoiHop) => {
    void taiDuLieuNhanSuVaPhongBan();
    setModalGiaoViec({ mo: true, yeuCau: yc });
    setGhiChuGiaoViec('');
    setHanXongGiaoViec(yc.han_hoan_thanh || '');
    setTuKhoaTimNS('');
    setLoiGiaoViec('');

    if (Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) && yc.danh_sach_nhan_su_thuc_hien_ids.length > 0) {
      const list = yc.danh_sach_nhan_su_thuc_hien_ids.map((id, idx) => ({
        id,
        ho_va_ten: yc.danh_sach_ten_nhan_su_thuc_hien?.[idx] || 'Nhân sự'
      }));
      setDsNhanSuChon(list);
    } else {
      setDsNhanSuChon([]);
    }
  };

  const toggleChonNhanSu = (ns: NhanSu) => {
    setDsNhanSuChon((prev) => {
      const tonTai = prev.some((x) => x.id === ns.id);
      if (tonTai) {
        return prev.filter((x) => x.id !== ns.id);
      } else {
        return [...prev, { id: ns.id, ho_va_ten: ns.ho_va_ten }];
      }
    });
    setLoiGiaoViec('');
  };

  const handleXacNhanGiaoViec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalGiaoViec.yeuCau) return;
    if (dsNhanSuChon.length === 0) {
      setLoiGiaoViec('Vui lòng chọn ít nhất 1 nhân sự để giao việc.');
      return;
    }

    setDangXuLyGiaoViec(true);
    setLoiGiaoViec('');
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: modalGiaoViec.yeuCau.id,
        trangThaiMoi: 'cho_khth_thuc_hien',
        danhSachNhanSuThucHien: dsNhanSuChon,
        hanHoanThanhMoi: hanXongGiaoViec || null,
        ghiChu: ghiChuGiaoViec.trim() || null,
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
      setModalGiaoViec({ mo: false, yeuCau: null });
    } catch {
      setLoiGiaoViec('Có lỗi xảy ra khi phân công. Vui lòng thử lại.');
    } finally {
      setDangXuLyGiaoViec(false);
    }
  };

  // Mở modal nộp kết quả
  const moModalNopDrive = (yc: YeuCauPhoiHop) => {
    setModalNopDrive({ mo: true, yeuCau: yc });
    setLinkDriveNop(yc.link_drive_ket_qua || '');
    setGhiChuNop('');
  };

  const handleXacNhanNopDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNopDrive.yeuCau) return;
    if (!linkDriveNop.trim()) {
      alert('Vui lòng dán link Google Drive kết quả.');
      return;
    }

    setDangXuLyNop(true);
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: modalNopDrive.yeuCau.id,
        trangThaiMoi: 'cho_tpkd_duyet_ket_qua',
        linkDriveKetQua: linkDriveNop.trim(),
        ghiChu: ghiChuNop.trim() || null,
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
      setModalNopDrive({ mo: false, yeuCau: null });
    } catch {
      alert('Có lỗi khi nộp kết quả.');
    } finally {
      setDangXuLyNop(false);
    }
  };

  // Phê duyệt kết quả
  const handlePheDuyetKetQua = async (yc: YeuCauPhoiHop) => {
    if (!window.confirm('Xác nhận phê duyệt kết quả cho dự án "' + yc.ten_du_an + '"?')) {
      return;
    }

    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'da_phe_duyet',
        ghiChu: 'Đã phê duyệt kết quả',
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
    } catch {
      alert('Có lỗi khi phê duyệt.');
    }
  };

  // Mở modal yêu cầu sửa
  const moModalYeuCauSua = (yc: YeuCauPhoiHop) => {
    setModalYeuCauSua({ mo: true, yeuCau: yc });
    setLyDoSua('');
  };

  const handleXacNhanYeuCauSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalYeuCauSua.yeuCau) return;
    if (!lyDoSua.trim()) {
      alert('Vui lòng nhập nội dung cần chỉnh sửa.');
      return;
    }

    setDangXuLyYeuCauSua(true);
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: modalYeuCauSua.yeuCau.id,
        trangThaiMoi: 'yeu_cau_chinh_sua',
        ghiChu: lyDoSua.trim(),
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
      setModalYeuCauSua({ mo: false, yeuCau: null });
    } catch {
      alert('Có lỗi khi gửi yêu cầu chỉnh sửa.');
    } finally {
      setDangXuLyYeuCauSua(false);
    }
  };

  // Hoàn tất yêu cầu
  const handleHoanTatYeuCau = async (yc: YeuCauPhoiHop) => {
    if (!window.confirm('Xác nhận hoàn tất yêu cầu này?')) {
      return;
    }
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'da_hoan_thanh',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
    } catch {
      alert('Có lỗi khi hoàn tất yêu cầu.');
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setDaCopyLink(id);
    setTimeout(() => setDaCopyLink(null), 2000);
  };

  // Mở modal sửa nội dung
  const batDauSua = (yc: YeuCauPhoiHop) => {
    setYeuCauDangSua(yc);
    setSuaNoiDung(yc.noi_dung_yeu_cau);
    setSuaLinkDrive(yc.link_drive_dau_vao || '');
    setSuaHanXong(yc.han_hoan_thanh || '');
    setLoiSua('');
  };

  const handleLuuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeuCauDangSua) return;
    if (!suaNoiDung.trim()) {
      setLoiSua('Vui lòng nhập nội dung yêu cầu.');
      return;
    }

    setDangLuuSua(true);
    setLoiSua('');
    try {
      const res = await capNhatThongTinYeuCau({
        id: yeuCauDangSua.id,
        noi_dung_yeu_cau: suaNoiDung.trim(),
        link_drive_dau_vao: suaLinkDrive.trim() || null,
        han_hoan_thanh: suaHanXong || null,
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) {
        onCapNhatYeuCau(res);
      }
      setYeuCauDangSua(null);
    } catch (err: any) {
      setLoiSua(err?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setDangLuuSua(false);
    }
  };

  const handleXacNhanXoa = async () => {
    if (!yeuCauDangXoa) return;
    setDangXoa(true);
    try {
      await xoaYeuCauPhoiHop(yeuCauDangXoa.id, nguoiDungHienTai);
      if (onXoaYeuCau) {
        onXoaYeuCau(yeuCauDangXoa.id);
      }
      setYeuCauDangXoa(null);
    } catch {
      alert('Không thể xóa yêu cầu. Vui lòng thử lại.');
    } finally {
      setDangXoa(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Banner Hộp việc */}
      <div
        className={cn(
          'rounded-2xl border transition-all p-3.5 space-y-3 shadow-xs',
          dsViecChoToi.length > 0
            ? 'bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-card border-amber-500/30 ring-1 ring-amber-500/20'
            : 'bg-card border-border'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'size-8 rounded-xl flex items-center justify-center shrink-0 font-bold',
                dsViecChoToi.length > 0
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Sparkles className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Yêu cầu phối hợp
              </h3>
              {dsViecChoToi.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-white shadow-2xs">
                  {dsViecChoToi.length} việc cần xử lý
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onMoModalTaoYeuCau && (
              <button
                type="button"
                onClick={onMoModalTaoYeuCau}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Sparkles className="size-3.5" />
                <span>+ Tạo yêu cầu</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setMoToanBo(!moToanBo)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{moToanBo ? 'Chỉ việc của tôi' : `Tất cả (${danhSachYeuCau.length})`}</span>
              {moToanBo ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Danh sách yêu cầu */}
        {dsHienThi.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground italic bg-muted/20 rounded-xl">
            Không có yêu cầu nào đang chờ xử lý.
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border bg-background overflow-hidden">
            {dsHienThi.map((yc) => {
              const cfgTrangThai = NHAN_TRANG_THAI_YEU_CAU[yc.trang_thai] || {
                label: yc.trang_thai,
                mauBadge: 'bg-slate-100 text-slate-800',
                textClass: 'text-slate-700'
              };
              const laNguoiTao = yc.nguoi_tao_id === userId;
              const coQuyenSuaXoa = laNguoiTao || coQuyenDieuHanh;

              const duocGiaoDichDanh = Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
                yc.danh_sach_nhan_su_thuc_hien_ids.includes(userId);
              const coQuyenNopKetQua = duocGiaoDichDanh || (!yc.danh_sach_nhan_su_thuc_hien_ids?.length && coQuyenDieuHanh) || coQuyenDieuHanh;

              return (
                <div
                  key={yc.id}
                  className="p-3.5 hover:bg-muted/25 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  {/* Cột trái: Thông tin dự án + Nội dung + Phân công */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => onMoChiTietDuAn?.(yc.du_an_id)}
                        className="font-bold text-indigo-700 hover:text-indigo-800 hover:underline cursor-pointer inline-flex items-center gap-1 text-sm"
                        title="Xem chi tiết dự án"
                      >
                        <FolderKanban className="size-4 text-indigo-600" />
                        <span>{yc.ten_du_an}</span>
                      </span>

                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10.5px] font-bold border',
                          cfgTrangThai.mauBadge
                        )}
                      >
                        {cfgTrangThai.label}
                      </span>

                      {yc.han_hoan_thanh && (
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          <Clock className="size-3 text-amber-600" />
                          <span>Hạn: {yc.han_hoan_thanh}</span>
                        </span>
                      )}
                    </div>

                    {/* Phân công */}
                    {yc.danh_sach_ten_nhan_su_thuc_hien && yc.danh_sach_ten_nhan_su_thuc_hien.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-md w-fit">
                        <Users className="size-3.5 text-purple-600" />
                        <span>Phân công: <strong>{yc.danh_sach_ten_nhan_su_thuc_hien.join(', ')}</strong></span>
                      </div>
                    )}

                    <div className="text-foreground font-medium text-xs leading-relaxed">
                      {yc.noi_dung_yeu_cau}
                    </div>

                    {/* Meta người tạo & Link Drive */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="size-3 text-slate-400" />
                        <span>Người gửi: <strong>{yc.ten_nguoi_tao}</strong></span>
                      </span>

                      {yc.link_drive_dau_vao && (
                        <a
                          href={yc.link_drive_dau_vao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800"
                        >
                          <Link2 className="size-3 text-blue-600" />
                          <span>Tài liệu đính kèm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}

                      {yc.link_drive_ket_qua && (
                        <a
                          href={yc.link_drive_ket_qua}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800"
                        >
                          <Link2 className="size-3 text-emerald-600" />
                          <span>Kết quả xử lý</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}

                      {yc.ghi_chu_phan_hoi && (
                        <span className="text-rose-600 font-medium italic bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          Phản hồi: {yc.ghi_chu_phan_hoi}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cột phải: Các nút hành động */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    {/* BƯỚC 1: Tiếp nhận & Giao việc */}
                    {yc.trang_thai === 'cho_tpkd_duyet' && coQuyenDieuHanh && (
                      <button
                        type="button"
                        onClick={() => moModalGiaoViec(yc)}
                        className="h-8 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                      >
                        <UserCheck className="size-3.5 stroke-[2.5]" />
                        <span>Tiếp nhận & Giao việc</span>
                      </button>
                    )}

                    {/* BƯỚC 2: Nộp kết quả */}
                    {(yc.trang_thai === 'cho_khth_thuc_hien' || yc.trang_thai === 'yeu_cau_chinh_sua') && coQuyenNopKetQua && (
                      <button
                        type="button"
                        onClick={() => moModalNopDrive(yc)}
                        className="h-8 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                      >
                        <Send className="size-3.5" />
                        <span>Nộp kết quả</span>
                      </button>
                    )}

                    {/* BƯỚC 3: Phê duyệt kết quả */}
                    {(yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') && coQuyenDieuHanh && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePheDuyetKetQua(yc)}
                          className="h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span>Phê duyệt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moModalYeuCauSua(yc)}
                          className="h-8 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>Yêu cầu sửa</span>
                        </button>
                      </>
                    )}

                    {/* BƯỚC 4: Hoàn tất */}
                    {yc.trang_thai === 'da_phe_duyet' && (laNguoiTao || coQuyenDieuHanh) && (
                      <>
                        {yc.link_drive_ket_qua && (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(yc.link_drive_ket_qua!, yc.id)}
                            className="h-8 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition hover:bg-emerald-100"
                          >
                            {daCopyLink === yc.id ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                <span>Đã chép link</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" />
                                <span>Sao chép link</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleHoanTatYeuCau(yc)}
                          className="h-8 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs transition"
                        >
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span>Hoàn tất</span>
                        </button>
                      </>
                    )}

                    {/* Lịch sử */}
                    <button
                      type="button"
                      onClick={() => setYeuCauDangXemLichSu(yc)}
                      className="size-8 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 inline-flex items-center justify-center cursor-pointer transition-colors"
                      title="Xem lịch sử xử lý"
                    >
                      <History className="size-4" />
                    </button>

                    {/* Sửa */}
                    {coQuyenSuaXoa && (
                      <button
                        type="button"
                        onClick={() => batDauSua(yc)}
                        className="size-8 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Chỉnh sửa nội dung"
                      >
                        <Pencil className="size-4" />
                      </button>
                    )}

                    {/* Xóa */}
                    {coQuyenSuaXoa && (
                      <button
                        type="button"
                        onClick={() => setYeuCauDangXoa(yc)}
                        className="size-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Xóa yêu cầu"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TIẾP NHẬN & PHÂN CÔNG                                            */}
      {/* ========================================================================= */}
      {modalGiaoViec.mo && modalGiaoViec.yeuCau && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Tiếp nhận & Phân công xử lý
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dự án: <span className="font-semibold text-slate-800 dark:text-slate-200">{modalGiaoViec.yeuCau.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalGiaoViec({ mo: false, yeuCau: null })}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleXacNhanGiaoViec} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {loiGiaoViec && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{loiGiaoViec}</span>
                </div>
              )}

              {/* Thông tin ban đầu */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Người gửi: <strong>{modalGiaoViec.yeuCau.ten_nguoi_tao}</strong></span>
                  {modalGiaoViec.yeuCau.han_hoan_thanh && <span>Hạn mong muốn: {modalGiaoViec.yeuCau.han_hoan_thanh}</span>}
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {modalGiaoViec.yeuCau.noi_dung_yeu_cau}
                </p>
                {modalGiaoViec.yeuCau.link_drive_dau_vao && (
                  <div className="pt-1">
                    <a
                      href={modalGiaoViec.yeuCau.link_drive_dau_vao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Link2 className="size-3" />
                      <span>Xem file Google Drive đính kèm</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Phân công nhân sự */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="size-4 text-purple-600" />
                    <span>Phân công nhân sự thực hiện *</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Đã chọn: <strong className="text-purple-600">{dsNhanSuChon.length}</strong> người
                  </span>
                </div>

                {dsNhanSuChon.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    {dsNhanSuChon.map((ns) => (
                      <span
                        key={ns.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-xs font-semibold text-purple-900 dark:text-purple-200 shadow-2xs"
                      >
                        <User className="size-3 text-purple-600" />
                        <span>{ns.ho_va_ten}</span>
                        <button
                          type="button"
                          onClick={() => setDsNhanSuChon((prev) => prev.filter((x) => x.id !== ns.id))}
                          className="hover:text-rose-600 cursor-pointer ml-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={tuKhoaTimNS}
                    onChange={(e) => setTuKhoaTimNS(e.target.value)}
                    placeholder="Tìm theo tên nhân sự hoặc phòng ban..."
                    className="w-full h-8.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-800 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div className="max-h-[190px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {dsNhanSuToanBo
                    .filter((ns) =>
                      !tuKhoaTimNS ||
                      ns.ho_va_ten.toLowerCase().includes(tuKhoaTimNS.toLowerCase()) ||
                      (ns.chuc_vu && ns.chuc_vu.toLowerCase().includes(tuKhoaTimNS.toLowerCase())) ||
                      (ns.phong_ban_id && (mapTenPhongBan.get(ns.phong_ban_id) || '').toLowerCase().includes(tuKhoaTimNS.toLowerCase()))
                    )
                    .map((ns) => {
                      const daChon = dsNhanSuChon.some((x) => x.id === ns.id);
                      const tenPB = mapTenPhongBan.get(ns.phong_ban_id || '') || 'Công ty';
                      return (
                        <div
                          key={ns.id}
                          onClick={() => toggleChonNhanSu(ns)}
                          className={cn(
                            'px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition select-none',
                            daChon
                              ? 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={daChon}
                              onChange={() => {}}
                              className="size-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 pointer-events-none"
                            />
                            <div>
                              <div className="font-semibold">{ns.ho_va_ten}</div>
                              <div className="text-[10.5px] text-slate-400">
                                {ns.chuc_vu || 'Nhân sự'} • {tenPB}
                              </div>
                            </div>
                          </div>

                          {daChon && <Check className="size-4 text-purple-600" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Hạn hoàn thành & Ý kiến */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-600" />
                    <span>Hạn hoàn thành</span>
                  </label>
                  <input
                    type="date"
                    value={hanXongGiaoViec}
                    onChange={(e) => setHanXongGiaoViec(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                  <div className="flex items-center gap-1 pt-0.5">
                    {[
                      { nhan: 'Mai', soNgay: 1 },
                      { nhan: '+2 ngày', soNgay: 2 },
                      { nhan: '+1 tuần', soNgay: 7 }
                    ].map((chip) => (
                      <button
                        key={chip.nhan}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + chip.soNgay);
                          setHanXongGiaoViec(d.toISOString().slice(0, 10));
                        }}
                        className="px-2 py-0.5 rounded border border-slate-200 hover:border-blue-400 text-[10.5px] text-slate-600 hover:text-blue-600"
                      >
                        {chip.nhan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ý kiến / Ghi chú (nếu có)
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuGiaoViec}
                    onChange={(e) => setGhiChuGiaoViec(e.target.value)}
                    placeholder="Lưu ý nội dung, phương án hoặc tiến độ..."
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalGiaoViec({ mo: false, yeuCau: null })}
                  disabled={dangXuLyGiaoViec}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyGiaoViec || dsNhanSuChon.length === 0}
                  className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  {dangXuLyGiaoViec ? <Loader2 className="size-3.5 animate-spin" /> : <UserCheck className="size-3.5 stroke-[2.5]" />}
                  <span>Xác nhận & Giao việc</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NỘP KẾT QUẢ                                                      */}
      {/* ========================================================================= */}
      {modalNopDrive.mo && modalNopDrive.yeuCau && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Send className="size-4 text-purple-600" />
                  <span>Nộp kết quả xử lý</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dự án: <strong className="text-slate-700 dark:text-slate-300">{modalNopDrive.yeuCau.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanNopDrive} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Link2 className="size-3.5 text-blue-600" />
                  <span>Link Google Drive kết quả *</span>
                </label>
                <input
                  type="url"
                  value={linkDriveNop}
                  onChange={(e) => setLinkDriveNop(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi chú kết quả
                </label>
                <textarea
                  rows={3}
                  value={ghiChuNop}
                  onChange={(e) => setGhiChuNop(e.target.value)}
                  placeholder="Nội dung đã hoàn thành..."
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                  disabled={dangXuLyNop}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyNop}
                  className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {dangXuLyNop ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  <span>Xác nhận nộp kết quả</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: YÊU CẦU CHỈNH SỬA                                                 */}
      {/* ========================================================================= */}
      {modalYeuCauSua.mo && modalYeuCauSua.yeuCau && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="size-5" />
                <h3 className="text-base font-bold">Yêu cầu chỉnh sửa</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanYeuCauSua} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung cần chỉnh sửa, bổ sung *
                </label>
                <textarea
                  rows={3}
                  value={lyDoSua}
                  onChange={(e) => setLyDoSua(e.target.value)}
                  placeholder="Ghi rõ các nội dung cần bổ sung, chỉnh sửa..."
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-rose-500 resize-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null })}
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {dangXuLyYeuCauSua ? <Loader2 className="size-3.5 animate-spin" /> : <AlertTriangle className="size-3.5" />}
                  <span>Xác nhận yêu cầu sửa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CHỈNH SỬA THÔNG TIN YÊU CẦU                                      */}
      {/* ========================================================================= */}
      {yeuCauDangSua && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Chỉnh sửa yêu cầu phối hợp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dự án: <span className="font-semibold text-slate-700 dark:text-slate-300">{yeuCauDangSua.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangSua(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleLuuSua} className="space-y-4">
              {loiSua && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loiSua}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nội dung yêu cầu *
                </label>
                <textarea
                  rows={3}
                  value={suaNoiDung}
                  onChange={(e) => setSuaNoiDung(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                  placeholder="Nội dung cần thực hiện..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-blue-600" />
                  <span>Link Google Drive tài liệu</span>
                </label>
                <input
                  type="url"
                  value={suaLinkDrive}
                  onChange={(e) => setSuaLinkDrive(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-600" />
                  <span>Hạn hoàn thành</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={suaHanXong}
                    onChange={(e) => setSuaHanXong(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 focus:bg-white flex-1"
                  />
                  {[
                    { nhan: 'Ngày mai', soNgay: 1 },
                    { nhan: 'Ngày kia', soNgay: 2 },
                    { nhan: 'Tuần sau', soNgay: 7 }
                  ].map((chip) => (
                    <button
                      key={chip.nhan}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + chip.soNgay);
                        setSuaHanXong(d.toISOString().slice(0, 10));
                      }}
                      className="h-9 px-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-700 transition"
                    >
                      +{chip.soNgay}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setYeuCauDangSua(null)}
                  disabled={dangLuuSua}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangLuuSua}
                  className="h-9 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  {dangLuuSua ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 stroke-[2.5]" />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: XÁC NHẬN XÓA                                                     */}
      {/* ========================================================================= */}
      {yeuCauDangXoa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="size-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Xác nhận xóa yêu cầu
                </h3>
                <p className="text-xs text-slate-500">
                  Dự án: <span className="font-semibold text-slate-700">{yeuCauDangXoa.ten_du_an}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa yêu cầu: &ldquo;<span className="font-semibold text-slate-900 dark:text-white">{yeuCauDangXoa.noi_dung_yeu_cau}</span>&rdquo;?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setYeuCauDangXoa(null)}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleXacNhanXoa}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
              >
                {dangXoa ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: LỊCH SỬ XỬ LÝ                                                    */}
      {/* ========================================================================= */}
      {yeuCauDangXemLichSu && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Lịch sử luân chuyển yêu cầu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dự án: <strong className="text-slate-700 dark:text-slate-300">{yeuCauDangXemLichSu.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {yeuCauDangXemLichSu.lich_su_xu_ly.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start gap-2.5 text-xs">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 dark:bg-slate-800/50 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {log.hanh_dong}
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-mono">
                        {log.thoi_gian?.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <User className="size-3 text-slate-400" />
                      <span>{log.ten_nguoi_thuc_hien}</span>
                    </div>

                    {log.link_drive && (
                      <div className="pt-1">
                        <a
                          href={log.link_drive}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <Link2 className="size-3" />
                          <span>Link Google Drive đính kèm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    )}

                    {log.ghi_chu && (
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11.5px] text-slate-600 dark:text-slate-300 italic">
                        "{log.ghi_chu}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="h-8 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
