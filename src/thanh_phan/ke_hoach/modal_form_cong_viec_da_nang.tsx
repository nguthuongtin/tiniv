'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Check,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Users,
  FolderKanban,
  Sparkles,
  Search,
  Car,
  Share2,
  CheckCircle2,
  Circle,
  Link2,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';
import type { TaoMoiLichGapDTO } from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import {
  DANH_SACH_GIAI_DOAN_MAC_DINH,
  layCauHinhGiaiDoanTheoKey
} from '../../thu_vien/cau_hinh/giai_doan_du_an';
import { moZaloXinDuyetLich } from '../../thu_vien/utils/chia_se_zalo_lich';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';

export type KieuCongViec = 'goi_dien' | 'lich_gap' | 'du_an' | 'yeu_cau';

interface Props {
  mo: boolean;
  onDong: () => void;
  ngayMacDinh: string;
  danhSachKhachHang: KhachHang[];
  danhSachDuAn: HoSoDuAn[];
  danhSachNguoiLienHe: NguoiLienHe[];
  nguoiDungHienTai?: any;
  nhanVienId?: string;
  kieuKhoiTao?: KieuCongViec;
  onLuuGoiDien: (item: ItemKeHoachTuan) => Promise<void> | void;
  onLuuLichGap: (dto: TaoMoiLichGapDTO) => Promise<void> | void;
  onLuuTienDoDuAn: (params: {
    duAnId: string;
    giaiDoanMoi: string;
    noiDung: string;
    linkTaiLieu?: string | null;
    ngay: string;
  }) => Promise<void> | void;
  onLuuYeuCauPhoiHop: (params: {
    duAnId: string;
    tenDuAn: string;
    khachHangId?: string | null;
    loaiYeuCau: string;
    noiDung: string;
    linkDriveDauVao?: string | null;
    hanHoanThanh?: string | null;
    ngay: string;
  }) => Promise<void> | void;
}

const DS_LOAI_YEU_CAU = [
  'Lập báo giá',
  'Lập phương án kỹ thuật',
  'Hồ sơ thầu / Báo cáo NCKT',
  'Cung cấp vật tư / Thiết bị',
  'Khảo sát thực địa',
  'Hỗ trợ pháp lý / Thủ tục',
  'Yêu cầu khác'
];

export default function ModalFormCongViecDaNang({
  mo,
  onDong,
  ngayMacDinh,
  danhSachKhachHang = [],
  danhSachDuAn = [],
  danhSachNguoiLienHe = [],
  nguoiDungHienTai,
  nhanVienId,
  kieuKhoiTao = 'goi_dien',
  onLuuGoiDien,
  onLuuLichGap,
  onLuuTienDoDuAn,
  onLuuYeuCauPhoiHop
}: Props) {
  const [kieuChon, setKieuChon] = useState<KieuCongViec>(kieuKhoiTao);
  const [ngay, setNgay] = useState(ngayMacDinh || new Date().toISOString().slice(0, 10));

  // State chung
  const [khachHangId, setKhachHangId] = useState<string>('');
  const [tuKhoaKhachHang, setTuKhoaKhachHang] = useState('');
  const [moDropdownKH, setMoDropdownKH] = useState(false);

  const [duAnId, setDuAnId] = useState<string>('');
  const [tuKhoaDuAn, setTuKhoaDuAn] = useState('');
  const [moDropdownDA, setMoDropdownDA] = useState(false);

  const [nguoiLienHeId, setNguoiLienHeId] = useState<string>('');
  const [noiDung, setNoiDung] = useState('');
  const [daHoanThanh, setDaHoanThanh] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  // State riêng cho Lịch công tác
  const [gioBatDau, setGioBatDau] = useState('09:00');
  const [gioKetThuc, setGioKetThuc] = useState('10:30');
  const [diaDiem, setDiaDiem] = useState('');
  const [laPhatSinh, setLaPhatSinh] = useState(false);
  const [dangGuiZalo, setDangGuiZalo] = useState(false);

  // State riêng cho Dự án
  const [giaiDoanChon, setGiaiDoanChon] = useState<string>('tiep_can');
  const [linkTaiLieu, setLinkTaiLieu] = useState('');

  // State riêng cho Yêu cầu hỗ trợ
  const [loaiYeuCau, setLoaiYeuCau] = useState('Lập báo giá');
  const [linkDriveDauVao, setLinkDriveDauVao] = useState('');
  const [hanHoanThanh, setHanHoanThanh] = useState('');

  // Map & Tra cứu
  const mapKH = useMemo(() => {
    const m = new Map<string, KhachHang>();
    danhSachKhachHang.forEach((k) => m.set(k.id, k));
    return m;
  }, [danhSachKhachHang]);

  const mapDA = useMemo(() => {
    const m = new Map<string, HoSoDuAn>();
    danhSachDuAn.forEach((d) => m.set(d.id, d));
    return m;
  }, [danhSachDuAn]);

  const khachHangHienTai = useMemo(() => {
    if (!khachHangId) return null;
    return mapKH.get(khachHangId) || null;
  }, [khachHangId, mapKH]);

  const duAnHienTai = useMemo(() => {
    if (!duAnId) return null;
    return mapDA.get(duAnId) || null;
  }, [duAnId, mapDA]);

  // Danh sách Người liên hệ theo khách hàng đang chọn
  const dsLienHeTheoKH = useMemo(() => {
    if (!khachHangId) return [];
    return danhSachNguoiLienHe.filter((lh) => lh.khach_hang_id === khachHangId);
  }, [khachHangId, danhSachNguoiLienHe]);

  const nguoiLienHeHienTai = useMemo(() => {
    if (!nguoiLienHeId) return null;
    return danhSachNguoiLienHe.find((lh) => lh.id === nguoiLienHeId) || null;
  }, [nguoiLienHeId, danhSachNguoiLienHe]);

  // Tự động đồng bộ khi mở modal
  useEffect(() => {
    if (mo) {
      setKieuChon(kieuKhoiTao);
      setNgay(ngayMacDinh || new Date().toISOString().slice(0, 10));
      setKhachHangId('');
      setTuKhoaKhachHang('');
      setMoDropdownKH(false);
      setDuAnId('');
      setTuKhoaDuAn('');
      setMoDropdownDA(false);
      setNguoiLienHeId('');
      setNoiDung('');
      setDaHoanThanh(true);
      setLoi(null);
      setDangLuu(false);
      setGioBatDau('09:00');
      setGioKetThuc('10:30');
      setDiaDiem('');
      setLaPhatSinh(false);
      setDangGuiZalo(false);
      setGiaiDoanChon('tiep_can');
      setLinkTaiLieu('');
      setLoaiYeuCau('Lập báo giá');
      setLinkDriveDauVao('');
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setHanHoanThanh(d.toISOString().slice(0, 10));
    }
  }, [mo, ngayMacDinh, kieuKhoiTao]);

  // Tự động gán địa điểm khi chọn khách hàng
  useEffect(() => {
    if (khachHangHienTai) {
      if (khachHangHienTai.dia_chi) {
        setDiaDiem(khachHangHienTai.dia_chi);
      } else {
        const diaBan = [khachHangHienTai.xa_phuong, khachHangHienTai.tinh_thanh].filter(Boolean).join(', ');
        if (diaBan) setDiaDiem(diaBan);
      }
      if (dsLienHeTheoKH.length > 0 && !nguoiLienHeId) {
        setNguoiLienHeId(dsLienHeTheoKH[0].id);
      }
    }
  }, [khachHangHienTai, dsLienHeTheoKH, nguoiLienHeId]);

  // Tự động gán khách hàng và giai đoạn khi chọn Dự án
  useEffect(() => {
    if (duAnHienTai) {
      if (duAnHienTai.khach_hang_id && !khachHangId) {
        setKhachHangId(duAnHienTai.khach_hang_id);
      }
      if (duAnHienTai.giai_doan) {
        setGiaiDoanChon(duAnHienTai.giai_doan);
      }
    }
  }, [duAnHienTai, khachHangId]);

  // Lọc tìm kiếm Khách hàng
  const dsKhachHangLoc = useMemo(() => {
    const q = tuKhoaKhachHang.trim().toLowerCase();
    if (!q) return danhSachKhachHang.slice(0, 20);
    return danhSachKhachHang
      .filter((k) =>
        k.ten_khach_hang.toLowerCase().includes(q) ||
        (k.xa_phuong || '').toLowerCase().includes(q) ||
        (k.tinh_thanh || '').toLowerCase().includes(q) ||
        (k.so_dien_thoai || '').includes(q)
      )
      .slice(0, 20);
  }, [danhSachKhachHang, tuKhoaKhachHang]);

  // Lọc tìm kiếm Dự án
  const dsDuAnLoc = useMemo(() => {
    const q = tuKhoaDuAn.trim().toLowerCase();
    let list = danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa');
    if (khachHangId) {
      const listCuaKH = list.filter((d) => d.khach_hang_id === khachHangId);
      if (listCuaKH.length > 0) list = listCuaKH;
    }
    if (!q) return list.slice(0, 20);
    return list
      .filter((d) =>
        d.ten_du_an.toLowerCase().includes(q) ||
        (d.ma_ho_so || '').toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [danhSachDuAn, tuKhoaDuAn, khachHangId]);

  if (!mo) return null;

  // Xử lý gửi Zalo xin duyệt ngay
  const xuLyGuiZaloXinDuyet = async () => {
    if (!khachHangHienTai && !diaDiem.trim()) {
      alert('Vui lòng chọn Khách hàng hoặc nhập Địa điểm làm việc trước.');
      return;
    }
    setDangGuiZalo(true);
    try {
      const giaLapLich: any = {
        ngay,
        gio_bat_dau: gioBatDau,
        gio_ket_thuc: gioKetThuc,
        ten_khach_hang: khachHangHienTai?.ten_khach_hang || 'Khách hàng / Địa bàn',
        dia_diem: diaDiem.trim() || null,
        noi_dung: noiDung.trim() || `Lịch công tác ngày ${formatNgay(ngay)}`
      };
      await moZaloXinDuyetLich({
        lich: giaLapLich,
        tenNhanSu: nguoiDungHienTai?.ho_va_ten || 'Nhân viên kinh doanh',
        tenDuAn: duAnHienTai?.ten_du_an || null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDangGuiZalo(false), 1200);
    }
  };

  // Xử lý lưu công việc
  const xuLyLuu = async () => {
    setLoi(null);
    setDangLuu(true);

    try {
      const ndSach = noiDung.trim();
      const tenKhach = khachHangHienTai?.ten_khach_hang || '';
      const tenDuAn = duAnHienTai?.ten_du_an || '';
      const targetUserId = nhanVienId || nguoiDungHienTai?.id || '';

      if (kieuChon === 'goi_dien') {
        if (!tenKhach && !ndSach) {
          throw new Error('Vui lòng chọn Khách hàng hoặc nhập Nội dung cuộc gọi.');
        }
        const tieuDe = ndSach || `Gọi điện trao đổi với ${tenKhach}`;
        const itemMoi: ItemKeHoachTuan = {
          id: `call_${Date.now()}`,
          hinh_thuc: 'goi_dien',
          loai_hanh_dong: 'phat_sinh',
          khach_hang_id: khachHangId || null,
          co_quan_doanh_nghiep: tenKhach || null,
          du_an_id: duAnId || null,
          du_an_du_kien: tenDuAn || null,
          ten_khach_hang_du_an: tenKhach || tenDuAn || tieuDe,
          hanh_dong_tuan: tieuDe,
          noi_dung_tuan: tieuDe,
          ket_qua_thuc_te: daHoanThanh ? tieuDe : undefined,
          dau_ra_cam_ket: tieuDe,
          nguoi_lien_he_id: nguoiLienHeId || null,
          nguoi_lien_he: nguoiLienHeHienTai?.ho_va_ten || null,
          chuc_vu: nguoiLienHeHienTai?.chuc_vu || null,
          so_dien_thoai_lien_he: nguoiLienHeHienTai?.so_dien_thoai || null,
          ngay_du_kien: ngay,
          cac_ngay_thuc_hien: [ngay],
          da_hoan_thanh: daHoanThanh,
          ngay_hoan_thanh: daHoanThanh ? ngay : null,
          trang_thai_ket_qua: daHoanThanh ? 'dat_muc_tieu' : 'dang_thuc_hien',
          danh_sach_ket_qua: daHoanThanh
            ? [
                {
                  id: `kq_${Date.now()}`,
                  ngay_ghi_nhan: ngay,
                  noi_dung: tieuDe,
                  khach_hang_id: khachHangId || null,
                  ten_khach_hang: tenKhach || null,
                  du_an_id: duAnId || null,
                  ten_du_an: tenDuAn || null,
                  nguoi_lien_he_id: nguoiLienHeId || null,
                  ten_nguoi_lien_he: nguoiLienHeHienTai?.ho_va_ten || null
                }
              ]
            : []
        };
        await onLuuGoiDien(itemMoi);
      } else if (kieuChon === 'lich_gap') {
        if (!tenKhach && !diaDiem.trim()) {
          throw new Error('Vui lòng chọn Khách hàng hoặc nhập Địa điểm làm việc.');
        }
        const dto: TaoMoiLichGapDTO = {
          ngay,
          gio_bat_dau: gioBatDau,
          gio_ket_thuc: gioKetThuc,
          tieu_de: ndSach || `Gặp làm việc với ${tenKhach || diaDiem}`,
          noi_dung: ndSach || `Gặp trực tiếp trao đổi công việc`,
          khach_hang_id: khachHangId || '',
          ten_khach_hang: tenKhach || diaDiem,
          nguoi_lien_he_id: nguoiLienHeId || null,
          ten_nguoi_lien_he: nguoiLienHeHienTai?.ho_va_ten || null,
          so_dien_thoai: nguoiLienHeHienTai?.so_dien_thoai || null,
          du_an_id: duAnId || null,
          dia_diem: diaDiem.trim() || null,
          nguoi_phu_trach_id: targetUserId,
          nguoi_tao_id: nguoiDungHienTai?.id || targetUserId,
          chi_nhanh_id: nguoiDungHienTai?.chi_nhanh_id || null,
          trang_thai: laPhatSinh ? 'cho_duyet' : 'sap_toi',
          la_phat_sinh: laPhatSinh,
          nguoi_tham_gia_ids: []
        };
        await onLuuLichGap(dto);
      } else if (kieuChon === 'du_an') {
        if (!duAnId) {
          throw new Error('Vui lòng chọn Dự án cần cập nhật tiến độ.');
        }
        if (!ndSach) {
          throw new Error('Vui lòng nhập Nội dung kết quả/tiến độ.');
        }
        await onLuuTienDoDuAn({
          duAnId,
          giaiDoanMoi: giaiDoanChon,
          noiDung: ndSach,
          linkTaiLieu: linkTaiLieu.trim() || null,
          ngay
        });
      } else if (kieuChon === 'yeu_cau') {
        if (!duAnId) {
          throw new Error('Vui lòng chọn Dự án để gửi yêu cầu hỗ trợ.');
        }
        if (!ndSach) {
          throw new Error('Vui lòng nhập Nội dung chi tiết cần hỗ trợ.');
        }
        await onLuuYeuCauPhoiHop({
          duAnId,
          tenDuAn: duAnHienTai?.ten_du_an || 'Dự án',
          khachHangId: khachHangId || duAnHienTai?.khach_hang_id || null,
          loaiYeuCau,
          noiDung: ndSach,
          linkDriveDauVao: linkDriveDauVao.trim() || null,
          hanHoanThanh: hanHoanThanh || null,
          ngay
        });
      }

      onDong();
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi xảy ra khi lưu công việc.');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal */}
        <div className="p-4 sm:px-5 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Calendar className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Thêm công việc vào Lịch
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Ngày {formatNgay(ngay)} • Tự động đồng bộ báo cáo &amp; dự án
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={ngay}
              onChange={(e) => e.target.value && setNgay(e.target.value)}
              className="h-8 border border-border rounded-lg bg-background px-2 text-xs font-mono font-bold text-foreground cursor-pointer"
            />
            <button
              type="button"
              onClick={onDong}
              className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Thanh chọn Kiểu công việc (Tabs) */}
        <div className="p-3 bg-muted/10 border-b border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-muted/40 rounded-xl">
            <button
              type="button"
              onClick={() => setKieuChon('goi_dien')}
              className={cn(
                'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                kieuChon === 'goi_dien'
                  ? 'bg-card text-blue-700 shadow-2xs border border-blue-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Phone className="size-3.5 text-blue-600" />
              <span>1. Gọi điện KH</span>
            </button>

            <button
              type="button"
              onClick={() => setKieuChon('lich_gap')}
              className={cn(
                'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                kieuChon === 'lich_gap'
                  ? 'bg-card text-emerald-700 shadow-2xs border border-emerald-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Car className="size-3.5 text-emerald-600" />
              <span>2. Lịch công tác</span>
            </button>

            <button
              type="button"
              onClick={() => setKieuChon('du_an')}
              className={cn(
                'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                kieuChon === 'du_an'
                  ? 'bg-card text-indigo-700 shadow-2xs border border-indigo-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderKanban className="size-3.5 text-indigo-600" />
              <span>3. Tiến độ DA</span>
            </button>

            <button
              type="button"
              onClick={() => setKieuChon('yeu_cau')}
              className={cn(
                'py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer',
                kieuChon === 'yeu_cau'
                  ? 'bg-card text-amber-700 shadow-2xs border border-amber-200'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="size-3.5 text-amber-600" />
              <span>4. Yêu cầu hỗ trợ</span>
            </button>
          </div>
        </div>

        {/* Thân Form */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {loi && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{loi}</span>
            </div>
          )}

          {/* HÀNG 1: CHỌN KHÁCH HÀNG / XÃ & NGƯỜI LIÊN HỆ (Cho Gọi điện & Lịch gặp) */}
          {(kieuChon === 'goi_dien' || kieuChon === 'lich_gap') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chọn Khách hàng */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Khách hàng / Xã, Huyện:</span>
                  {khachHangHienTai && (
                    <button
                      type="button"
                      onClick={() => {
                        setKhachHangId('');
                        setNguoiLienHeId('');
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={khachHangHienTai ? khachHangHienTai.ten_khach_hang : tuKhoaKhachHang}
                    onFocus={() => setMoDropdownKH(true)}
                    onChange={(e) => {
                      setTuKhoaKhachHang(e.target.value);
                      if (khachHangId) setKhachHangId('');
                      setMoDropdownKH(true);
                    }}
                    placeholder="Tìm tên xã, phường, doanh nghiệp..."
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs"
                  />
                  {moDropdownKH && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-border bg-card shadow-xl p-1.5 max-h-48 overflow-y-auto space-y-0.5">
                      {dsKhachHangLoc.length === 0 ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          Không tìm thấy khách hàng phù hợp
                        </div>
                      ) : (
                        dsKhachHangLoc.map((kh) => (
                          <button
                            key={kh.id}
                            type="button"
                            onClick={() => {
                              setKhachHangId(kh.id);
                              setTuKhoaKhachHang('');
                              setMoDropdownKH(false);
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-muted text-xs flex flex-col gap-0.5 cursor-pointer"
                          >
                            <span className="font-bold text-foreground">{kh.ten_khach_hang}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {[kh.xa_phuong, kh.tinh_thanh].filter(Boolean).join(', ') || kh.so_dien_thoai}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chọn Người liên hệ */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Người liên hệ / Chức vụ:</span>
                  {nguoiLienHeHienTai?.so_dien_thoai && (
                    <a
                      href={`tel:${nguoiLienHeHienTai.so_dien_thoai}`}
                      className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="size-3" />
                      <span>{nguoiLienHeHienTai.so_dien_thoai}</span>
                    </a>
                  )}
                </label>
                <select
                  value={nguoiLienHeId}
                  onChange={(e) => setNguoiLienHeId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs cursor-pointer"
                >
                  <option value="">-- Chọn người liên hệ --</option>
                  {dsLienHeTheoKH.map((lh) => (
                    <option key={lh.id} value={lh.id}>
                      {lh.ho_va_ten} {lh.chuc_vu ? `(${lh.chuc_vu})` : ''} {lh.so_dien_thoai ? `• ${lh.so_dien_thoai}` : ''}
                    </option>
                  ))}
                  {dsLienHeTheoKH.length === 0 && khachHangId && (
                    <option value="" disabled>Chưa có danh sách liên hệ cho KH này</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* CHỌN DỰ ÁN (Cho Dự án, Yêu cầu hỗ trợ, hoặc tùy chọn gắn vào Cuộc gọi / Lịch gặp) */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>
                {kieuChon === 'du_an' || kieuChon === 'yeu_cau' ? 'Dự án (Bắt buộc):' : 'Gắn với Dự án (Tùy chọn):'}
              </span>
              {duAnHienTai && (
                <button
                  type="button"
                  onClick={() => setDuAnId('')}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={duAnHienTai ? duAnHienTai.ten_du_an : tuKhoaDuAn}
                onFocus={() => setMoDropdownDA(true)}
                onChange={(e) => {
                  setTuKhoaDuAn(e.target.value);
                  if (duAnId) setDuAnId('');
                  setMoDropdownDA(true);
                }}
                placeholder="Tìm tên dự án hoặc mã hồ sơ..."
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs"
              />
              {moDropdownDA && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-border bg-card shadow-xl p-1.5 max-h-48 overflow-y-auto space-y-0.5">
                  {dsDuAnLoc.length === 0 ? (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      Không tìm thấy dự án phù hợp
                    </div>
                  ) : (
                    dsDuAnLoc.map((da) => (
                      <button
                        key={da.id}
                        type="button"
                        onClick={() => {
                          setDuAnId(da.id);
                          setTuKhoaDuAn('');
                          setMoDropdownDA(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted text-xs flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="font-bold text-foreground truncate">{da.ten_du_an}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
                          {layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_ngan}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CÁC TRƯỜNG ĐẶC THÙ THEO TỪNG KIỂU CÔNG VIỆC */}

          {/* 1. LỊCH CÔNG TÁC */}
          {kieuChon === 'lich_gap' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary" />
                    <span>Thời gian bắt đầu:</span>
                  </label>
                  <input
                    type="time"
                    value={gioBatDau}
                    onChange={(e) => setGioBatDau(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono font-bold text-foreground shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary" />
                    <span>Thời gian kết thúc:</span>
                  </label>
                  <input
                    type="time"
                    value={gioKetThuc}
                    onChange={(e) => setGioKetThuc(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono font-bold text-foreground shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-rose-500" />
                  <span>Địa điểm làm việc / Gặp gỡ:</span>
                </label>
                <input
                  type="text"
                  value={diaDiem}
                  onChange={(e) => setDiaDiem(e.target.value)}
                  placeholder="Ví dụ: UBND Xã Ea Ktur, Huyện Cư Kuin..."
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground shadow-2xs"
                />
              </div>

              {/* Tùy chọn Lịch phát sinh đột xuất & Nút xin duyệt Zalo */}
              <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={laPhatSinh}
                    onChange={(e) => setLaPhatSinh(e.target.checked)}
                    className="size-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-900">
                    Lịch công tác phát sinh đột xuất trong tuần
                  </span>
                </label>

                <button
                  type="button"
                  onClick={xuLyGuiZaloXinDuyet}
                  disabled={dangGuiZalo}
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition shrink-0"
                >
                  <Share2 className="size-3.5" />
                  <span>{dangGuiZalo ? 'Đang mở Zalo...' : 'Gửi Zalo xin duyệt nhanh'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. TIẾN ĐỘ DỰ ÁN */}
          {kieuChon === 'du_an' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/20">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Chuyển sang Giai đoạn mới (8 giai đoạn chuẩn):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {DANH_SACH_GIAI_DOAN_MAC_DINH.map((gd) => {
                    const isChon = giaiDoanChon === gd.key;
                    return (
                      <button
                        key={gd.key}
                        type="button"
                        onClick={() => setGiaiDoanChon(gd.key)}
                        className={cn(
                          'p-2 rounded-lg text-left text-xs font-bold transition border cursor-pointer',
                          isChon
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-background text-foreground border-border hover:border-indigo-400'
                        )}
                      >
                        <div className="truncate">{gd.nhan_day_du}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Link2 className="size-3 text-indigo-600" />
                  <span>Link tài liệu / Biên bản nghiệm thu (nếu có):</span>
                </label>
                <input
                  type="text"
                  value={linkTaiLieu}
                  onChange={(e) => setLinkTaiLieu(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* 3. YÊU CẦU HỖ TRỢ */}
          {kieuChon === 'yeu_cau' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Loại yêu cầu hỗ trợ:
                  </label>
                  <select
                    value={loaiYeuCau}
                    onChange={(e) => setLoaiYeuCau(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs cursor-pointer"
                  >
                    {DS_LOAI_YEU_CAU.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-amber-600" />
                    <span>Hạn hoàn thành mong muốn:</span>
                  </label>
                  <input
                    type="date"
                    value={hanHoanThanh}
                    onChange={(e) => setHanHoanThanh(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono font-bold text-foreground shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Link2 className="size-3 text-amber-600" />
                  <span>Link tài liệu đầu vào (Google Drive):</span>
                </label>
                <input
                  type="text"
                  value={linkDriveDauVao}
                  onChange={(e) => setLinkDriveDauVao(e.target.value)}
                  placeholder="Link chứa hồ sơ, file khảo sát, yêu cầu của khách hàng..."
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* NỘI DUNG CHI TIẾT CỦA CÔNG VIỆC */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {kieuChon === 'goi_dien'
                ? 'Nội dung trao đổi / Kết quả cuộc gọi:'
                : kieuChon === 'lich_gap'
                ? 'Nội dung làm việc / Mục tiêu buổi gặp:'
                : kieuChon === 'du_an'
                ? 'Diễn biến thực tế / Kết quả đạt được:'
                : 'Nội dung chi tiết yêu cầu hỗ trợ:'}
            </label>
            <textarea
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder={
                kieuChon === 'goi_dien'
                  ? 'Ví dụ: Đã gọi anh Nam PCT, thống nhất thứ 3 tuần sau lên làm việc phương án...'
                  : kieuChon === 'lich_gap'
                  ? 'Ví dụ: Làm việc với lãnh đạo xã về chủ trương dự án...'
                  : kieuChon === 'du_an'
                  ? 'Ví dụ: Khách hàng đã ký nháy vào biên bản họp và đồng ý phương án...'
                  : 'Ví dụ: Nhờ KHTH lập báo giá cấu hình camera cho gói thầu xã...'
              }
              className="w-full h-24 rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-none"
            />
          </div>

          {/* Tùy chọn đánh dấu hoàn thành (cho Gọi điện & Dự án) */}
          {(kieuChon === 'goi_dien' || kieuChon === 'du_an') && (
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={daHoanThanh}
                onChange={(e) => setDaHoanThanh(e.target.checked)}
                className="size-4 rounded text-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-foreground">
                Đánh dấu đã hoàn thành (tự động ghi nhận vào Báo cáo công việc hôm nay)
              </span>
            </label>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-border bg-muted/15 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onDong}
            className="h-9 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={dangLuu}
            onClick={xuLyLuu}
            className="h-9 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-50"
          >
            {dangLuu ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5 stroke-[2.5]" />
                <span>Lưu công việc vào Lịch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
