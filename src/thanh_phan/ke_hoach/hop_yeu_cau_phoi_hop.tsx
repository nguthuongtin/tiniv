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

  // Xác định những việc liên quan đến người dùng hiện tại
  const dsViecChoToi = useMemo(() => {
    return danhSachYeuCau.filter((yc) => {
      if (yc.trang_thai_du_lieu === 'da_xoa' || yc.trang_thai === 'da_hoan_thanh') {
        return false;
      }

      // Người tạo (Sale) luôn thấy các yêu cầu mình đã tạo trong bàn làm việc để theo dõi tiến độ
      if (yc.nguoi_tao_id === userId) {
        return true;
      }

      // Bước 1: Chờ tiếp nhận & phân công -> dành cho người điều hành
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
      {/* Khung Hộp yêu cầu */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs text-foreground">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Yêu cầu phối hợp
              </h3>
              {dsViecChoToi.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {dsViecChoToi.length} cần theo dõi & xử lý
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMoModalTaoYeuCau && (
              <button
                type="button"
                onClick={onMoModalTaoYeuCau}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Sparkles className="size-3.5" />
                <span>+ Tạo yêu cầu</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setMoToanBo(!moToanBo)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
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
          <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
            {dsHienThi.map((yc) => {
              const cfgTrangThai = NHAN_TRANG_THAI_YEU_CAU[yc.trang_thai] || {
                label: yc.trang_thai,
                mauBadge: 'bg-muted text-muted-foreground border-border',
                textClass: 'text-muted-foreground'
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
                        className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 text-sm"
                        title="Xem chi tiết dự án"
                      >
                        <FolderKanban className="size-4 text-muted-foreground" />
                        <span>{yc.ten_du_an}</span>
                      </span>

                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[11px] font-medium border',
                          cfgTrangThai.mauBadge
                        )}
                      >
                        {cfgTrangThai.label}
                      </span>

                      {yc.han_hoan_thanh && (
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          <span>Hạn: {yc.han_hoan_thanh}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-foreground text-xs leading-relaxed">
                      {yc.noi_dung_yeu_cau}
                    </div>

                    {/* Metadata line: Người gửi, Phân công, Link Drive, Ghi chú phản hồi */}
                    <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" />
                        <span>Người gửi: <strong className="text-foreground font-semibold">{yc.ten_nguoi_tao}</strong></span>
                      </span>

                      {yc.danh_sach_ten_nhan_su_thuc_hien && yc.danh_sach_ten_nhan_su_thuc_hien.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="size-3 text-muted-foreground" />
                          <span>Phân công: <strong className="text-foreground font-semibold">{yc.danh_sach_ten_nhan_su_thuc_hien.join(', ')}</strong></span>
                        </span>
                      )}

                      {yc.link_drive_dau_vao && (
                        <a
                          href={yc.link_drive_dau_vao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <Link2 className="size-3" />
                          <span>Tài liệu đính kèm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}

                      {yc.link_drive_ket_qua && (
                        <a
                          href={yc.link_drive_ket_qua}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Link2 className="size-3" />
                          <span>Kết quả xử lý</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}

                      {yc.ghi_chu_phan_hoi && (
                        <span className="text-destructive font-medium italic">
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
                        className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                      >
                        <UserCheck className="size-3.5" />
                        <span>Tiếp nhận & Giao việc</span>
                      </button>
                    )}

                    {/* BƯỚC 2: Nộp kết quả */}
                    {(yc.trang_thai === 'cho_khth_thuc_hien' || yc.trang_thai === 'yeu_cau_chinh_sua') && coQuyenNopKetQua && (
                      <button
                        type="button"
                        onClick={() => moModalNopDrive(yc)}
                        className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
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
                          className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                        >
                          <Check className="size-3.5" />
                          <span>Phê duyệt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => moModalYeuCauSua(yc)}
                          className="h-8 px-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 font-medium text-xs inline-flex items-center gap-1 cursor-pointer transition"
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
                            className="h-8 px-3 rounded-lg border border-border bg-background text-foreground font-medium text-xs inline-flex items-center gap-1 cursor-pointer transition hover:bg-muted"
                          >
                            {daCopyLink === yc.id ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-primary" />
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
                          className="h-8 px-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs transition"
                        >
                          <Check className="size-3.5" />
                          <span>Hoàn tất</span>
                        </button>
                      </>
                    )}

                    {/* Lịch sử */}
                    <button
                      type="button"
                      onClick={() => setYeuCauDangXemLichSu(yc)}
                      className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center cursor-pointer transition-colors"
                      title="Xem lịch sử xử lý"
                    >
                      <History className="size-4" />
                    </button>

                    {/* Sửa */}
                    {coQuyenSuaXoa && (
                      <button
                        type="button"
                        onClick={() => batDauSua(yc)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center cursor-pointer transition-colors"
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
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 inline-flex items-center justify-center cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col space-y-4 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center font-bold">
                  <UserCheck className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Tiếp nhận & Phân công xử lý
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Dự án: <span className="font-semibold text-foreground">{modalGiaoViec.yeuCau.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalGiaoViec({ mo: false, yeuCau: null })}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleXacNhanGiaoViec} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {loiGiaoViec && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{loiGiaoViec}</span>
                </div>
              )}

              {/* Thông tin ban đầu */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Người gửi: <strong className="text-foreground">{modalGiaoViec.yeuCau.ten_nguoi_tao}</strong></span>
                  {modalGiaoViec.yeuCau.han_hoan_thanh && <span>Hạn mong muốn: {modalGiaoViec.yeuCau.han_hoan_thanh}</span>}
                </div>
                <p className="text-foreground font-medium">
                  {modalGiaoViec.yeuCau.noi_dung_yeu_cau}
                </p>
                {modalGiaoViec.yeuCau.link_drive_dau_vao && (
                  <div className="pt-1">
                    <a
                      href={modalGiaoViec.yeuCau.link_drive_dau_vao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
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
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Users className="size-4 text-primary" />
                    <span>Phân công nhân sự thực hiện *</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Đã chọn: <strong className="text-foreground">{dsNhanSuChon.length}</strong> người
                  </span>
                </div>

                {dsNhanSuChon.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-muted/30 border border-border">
                    {dsNhanSuChon.map((ns) => (
                      <span
                        key={ns.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-medium text-foreground shadow-2xs"
                      >
                        <User className="size-3 text-muted-foreground" />
                        <span>{ns.ho_va_ten}</span>
                        <button
                          type="button"
                          onClick={() => setDsNhanSuChon((prev) => prev.filter((x) => x.id !== ns.id))}
                          className="hover:text-destructive cursor-pointer ml-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={tuKhoaTimNS}
                    onChange={(e) => setTuKhoaTimNS(e.target.value)}
                    placeholder="Tìm theo tên nhân sự hoặc phòng ban..."
                    className="w-full h-8.5 rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="max-h-[190px] overflow-y-auto rounded-xl border border-border divide-y divide-border">
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
                              ? 'bg-muted/80 text-foreground font-medium'
                              : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={daChon}
                              onChange={() => {}}
                              className="size-4 rounded border-border text-primary focus:ring-primary pointer-events-none"
                            />
                            <div>
                              <div className="font-semibold text-foreground">{ns.ho_va_ten}</div>
                              <div className="text-[10.5px] text-muted-foreground">
                                {ns.chuc_vu || 'Nhân sự'} • {tenPB}
                              </div>
                            </div>
                          </div>

                          {daChon && <Check className="size-4 text-primary" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Hạn hoàn thành & Ý kiến */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Hạn hoàn thành</span>
                  </label>
                  <input
                    type="date"
                    value={hanXongGiaoViec}
                    onChange={(e) => setHanXongGiaoViec(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
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
                        className="px-2 py-0.5 rounded border border-border hover:bg-muted text-[10.5px] text-muted-foreground hover:text-foreground transition cursor-pointer"
                      >
                        {chip.nhan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Ý kiến / Ghi chú (nếu có)
                  </label>
                  <textarea
                    rows={2}
                    value={ghiChuGiaoViec}
                    onChange={(e) => setGhiChuGiaoViec(e.target.value)}
                    placeholder="Lưu ý nội dung, phương án hoặc tiến độ..."
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground focus:outline-hidden focus:border-primary resize-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalGiaoViec({ mo: false, yeuCau: null })}
                  disabled={dangXuLyGiaoViec}
                  className="h-9 px-4 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyGiaoViec || dsNhanSuChon.length === 0}
                  className="h-9 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Send className="size-4 text-primary" />
                  <span>Nộp kết quả xử lý</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dự án: <strong className="text-foreground">{modalNopDrive.yeuCau.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanNopDrive} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                  <Link2 className="size-3.5 text-muted-foreground" />
                  <span>Link Google Drive kết quả *</span>
                </label>
                <input
                  type="url"
                  value={linkDriveNop}
                  onChange={(e) => setLinkDriveNop(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Ghi chú kết quả
                </label>
                <textarea
                  rows={3}
                  value={ghiChuNop}
                  onChange={(e) => setGhiChuNop(e.target.value)}
                  placeholder="Nội dung đã hoàn thành..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:border-primary resize-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                  disabled={dangXuLyNop}
                  className="h-9 px-3.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyNop}
                  className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                <h3 className="text-base font-bold text-foreground">Yêu cầu chỉnh sửa</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null })}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanYeuCauSua} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nội dung cần chỉnh sửa, bổ sung *
                </label>
                <textarea
                  rows={3}
                  value={lyDoSua}
                  onChange={(e) => setLyDoSua(e.target.value)}
                  placeholder="Ghi rõ các nội dung cần bổ sung, chỉnh sửa..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:border-primary resize-none placeholder:text-muted-foreground"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null })}
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-3.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-muted text-foreground flex items-center justify-center">
                  <Pencil className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Chỉnh sửa yêu cầu phối hợp
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Dự án: <span className="font-semibold text-foreground">{yeuCauDangSua.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangSua(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleLuuSua} className="space-y-4">
              {loiSua && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {loiSua}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nội dung yêu cầu *
                </label>
                <textarea
                  rows={3}
                  value={suaNoiDung}
                  onChange={(e) => setSuaNoiDung(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:border-primary resize-none placeholder:text-muted-foreground"
                  placeholder="Nội dung cần thực hiện..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-muted-foreground" />
                  <span>Link Google Drive tài liệu</span>
                </label>
                <input
                  type="url"
                  value={suaLinkDrive}
                  onChange={(e) => setSuaLinkDrive(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:border-primary placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span>Hạn hoàn thành</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={suaHanXong}
                    onChange={(e) => setSuaHanXong(e.target.value)}
                    className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:border-primary flex-1"
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
                      className="h-9 px-2.5 rounded-xl border border-border hover:bg-muted bg-background text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      +{chip.soNgay}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setYeuCauDangSua(null)}
                  disabled={dangLuuSua}
                  className="h-9 px-4 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangLuuSua}
                  className="h-9 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 text-foreground">
            <div className="flex items-center gap-3 text-destructive">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Xác nhận xóa yêu cầu
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dự án: <span className="font-semibold text-foreground">{yeuCauDangXoa.ten_du_an}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Bạn có chắc chắn muốn xóa yêu cầu: &ldquo;<span className="font-semibold text-foreground">{yeuCauDangXoa.noi_dung_yeu_cau}</span>&rdquo;?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setYeuCauDangXoa(null)}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleXacNhanXoa}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl space-y-4 text-foreground">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Lịch sử luân chuyển yêu cầu
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dự án: <strong className="text-foreground">{yeuCauDangXemLichSu.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer transition-colors"
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
                  <div className="min-w-0 flex-1 p-2.5 rounded-xl border border-border bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {log.hanh_dong}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground font-mono">
                        {log.thoi_gian?.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <User className="size-3 text-muted-foreground" />
                      <span>{log.ten_nguoi_thuc_hien}</span>
                    </div>

                    {log.link_drive && (
                      <div className="pt-1">
                        <a
                          href={log.link_drive}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Link2 className="size-3" />
                          <span>Link Google Drive đính kèm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    )}

                    {log.ghi_chu && (
                      <div className="p-2 rounded-lg bg-background border border-border text-[11.5px] text-foreground italic">
                        "{log.ghi_chu}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="h-8 px-4 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
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
