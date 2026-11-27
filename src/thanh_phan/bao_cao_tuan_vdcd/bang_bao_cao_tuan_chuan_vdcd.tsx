'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Save,
  Send,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Users,
  Phone,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Edit2,
  Check,
  X,
  RefreshCw,
  Info,
  Layers,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MessageSquareWarning,
  RotateCcw,
  MapPin,
  CalendarCheck,
  FileText,
  Award,
  TrendingUp,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { SanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import type { KeHoachTuan, ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';

const kiemTraViecThuocNgay = (item: any, ngayISO: string): boolean => {
  if (!item) return false;
  if (item.ngay_du_kien === ngayISO) return true;
  if (Array.isArray(item.cac_ngay_thuc_hien) && item.cac_ngay_thuc_hien.includes(ngayISO)) return true;
  return false;
};
import {
  phanTichTuanISO,
  dichChuyenTuanISO,
  type BaoCaoTuanVDCD
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import {
  DANH_SACH_GIAI_DOAN_MAC_DINH,
  layCauHinhGiaiDoanTheoKey
} from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  taoFileExcelBaoCaoTuanVDCD,
  taiFileExcelBlob,
  type DuLieuBaoCaoTuanVDCDChuan
} from '../../dich_vu/bao_cao_tuan_vdcd/xuat_excel_vdcd_chuan';

export const BANG_TIEM_NANG_DU_AN: Record<
  string,
  { nhan: string; xacSuat: number; badgeCls: string }
> = {
  rat_cao: {
    nhan: 'Rất cao (90%)',
    xacSuat: 90,
    badgeCls: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  cao: {
    nhan: 'Cao (70%)',
    xacSuat: 70,
    badgeCls: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  trung_binh: {
    nhan: 'Trung bình (50%)',
    xacSuat: 50,
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  thap: {
    nhan: 'Thấp (30%)',
    xacSuat: 30,
    badgeCls: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  rat_thap: {
    nhan: 'Rất thấp (10%)',
    xacSuat: 10,
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200'
  }
};

const fmtTien = (val?: number | null) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(val || 0))) + ' ₫';

function ONhapSoTien({
  giaTri,
  onChange,
  className,
  placeholder = '0',
  disabled = false
}: {
  giaTri: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [chuoi, setChuoi] = useState(() => (giaTri != null && giaTri !== 0 ? Number(giaTri).toLocaleString('vi-VN') : giaTri === 0 ? '0' : ''));
  const [dangFocus, setDangFocus] = useState(false);

  useEffect(() => {
    if (!dangFocus) {
      setChuoi(giaTri != null && giaTri !== 0 ? Number(giaTri).toLocaleString('vi-VN') : giaTri === 0 ? '0' : '');
    }
  }, [giaTri, dangFocus]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={chuoi}
      onFocus={() => {
        setDangFocus(true);
        setChuoi(giaTri ? String(giaTri) : '');
      }}
      onBlur={() => {
        setDangFocus(false);
        const raw = chuoi.replace(/\D/g, '');
        const num = raw ? parseInt(raw, 10) : 0;
        setChuoi(num ? num.toLocaleString('vi-VN') : '0');
        onChange(num);
      }}
      onChange={(e) => {
        const val = e.target.value;
        const raw = val.replace(/\D/g, '');
        setChuoi(raw);
        const num = raw ? parseInt(raw, 10) : 0;
        onChange(num);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}

export interface MucChiTietKPI {
  id: string;
  tieuDe: string;
  moTa?: string;
  loaiNguon?: 'Bàn làm việc' | 'Lịch công tác' | 'Hồ sơ dự án' | 'Dòng tiền về thực tế' | 'Hợp đồng ký mới' | 'Phát sinh ngoài' | string;
  soTien?: number;
  daChon?: boolean;
}

interface Props {
  tuan: string;
  nhanSu: NhanSu;
  dsDuAn: HoSoDuAn[];
  dsKhachHang: KhachHang[];
  dsNguoiLienHe: NguoiLienHe[];
  dsSanPham: SanPhamDichVu[];
  dsLichGap: LichGapKH[];
  dsNhanSu?: NhanSu[];
  baoCaoHienTai: BaoCaoTuanVDCD | null;
  baoCaoTuanTruoc?: BaoCaoTuanVDCD | null;
  keHoachTuanNay?: KeHoachTuan | null;
  keHoachTuanToi?: KeHoachTuan | null;
  onLuuBaoCao: (capNhat: Partial<BaoCaoTuanVDCD>, nopBaoCao: boolean) => Promise<void>;
  onDuyetBaoCao?: (
    trangThai: 'cho_giam_doc_duyet' | 'da_duyet' | 'can_dieu_chinh',
    ghiChu?: string,
    phanDuyet?: 'bao_cao' | 'ke_hoach'
  ) => Promise<void>;
  onThuHoiBaoCao?: (phanDuyet?: 'bao_cao' | 'ke_hoach') => Promise<void>;
  onYeuCauMoKhoa?: (lyDo: string, phanDuyet?: 'bao_cao' | 'ke_hoach') => Promise<void>;
  onCapNhatKetQuaLich?: (lich: LichGapKH, ketQua: string) => Promise<void>;
  laQuanLy: boolean;
  cheDoDuyet?: '1_cap' | '2_cap';
  laNguoiDuyetCap1?: boolean;
  laNguoiDuyetCap2?: boolean;
  nguoiDungHienTaiId?: string;
}

export default function BangBaoCaoTuanChuanVDCD({
  tuan,
  nhanSu,
  dsDuAn,
  dsKhachHang,
  dsNguoiLienHe,
  dsSanPham,
  dsLichGap,
  dsNhanSu = [],
  baoCaoHienTai,
  baoCaoTuanTruoc,
  keHoachTuanNay,
  keHoachTuanToi,
  onLuuBaoCao,
  onDuyetBaoCao,
  onThuHoiBaoCao,
  onYeuCauMoKhoa,
  onCapNhatKetQuaLich,
  laQuanLy,
  cheDoDuyet = '2_cap',
  laNguoiDuyetCap1 = false,
  laNguoiDuyetCap2 = false,
  nguoiDungHienTaiId
}: Props) {
  const infoTuan = useMemo(() => phanTichTuanISO(tuan), [tuan]);
  const tuanToiISO = useMemo(() => dichChuyenTuanISO(tuan, 1), [tuan]);
  const infoTuanToi = useMemo(() => phanTichTuanISO(tuanToiISO), [tuanToiISO]);

  const mapKH = useMemo(() => new Map(dsKhachHang.map((k) => [k.id, k])), [dsKhachHang]);
  const mapNLH = useMemo(() => new Map(dsNguoiLienHe.map((n) => [n.id, n])), [dsNguoiLienHe]);
  const mapSP = useMemo(() => new Map(dsSanPham.map((s) => [s.id, s.ten_san_pham])), [dsSanPham]);
  const mapNS = useMemo(() => new Map(dsNhanSu.map((n) => [n.id, n])), [dsNhanSu]);

  // Phân định vai trò Trưởng phòng Kinh doanh (Điều hành chung, không nhận KPI cá nhân vi mô)
  const laTruongPhongKD = useMemo(() => {
    const vt = String(nhanSu?.vai_tro || '');
    const cv = String(nhanSu?.chuc_vu || '').toLowerCase();
    return (
      vt === 'truong_phong_kd' ||
      vt === 'truong_phong' ||
      vt === 'giam_doc' ||
      vt === 'quan_tri_he_thong' ||
      cv.includes('trưởng phòng') ||
      cv.includes('tp kd') ||
      cv.includes('tp.kd') ||
      cv.includes('giám đốc')
    );
  }, [nhanSu]);

  // Dự án thuộc sở hữu của nhân sự (với TP KD: quản lý toàn bộ dự án thuộc chi nhánh/toàn phòng)
  const dsDuAnCuaNV = useMemo(() => {
    if (laTruongPhongKD) {
      return dsDuAn.filter((d) => {
        if (d.trang_thai === 'da_xoa') return false;
        if (nhanSu.chi_nhanh_id && d.chi_nhanh_id) {
          return d.chi_nhanh_id === nhanSu.chi_nhanh_id;
        }
        return true;
      });
    }
    return dsDuAn.filter(
      (d) =>
        d.trang_thai !== 'da_xoa' &&
        (d.nguoi_phu_trach_id === nhanSu.id ||
          d.nguoi_quan_ly_id === nhanSu.id ||
          (!d.nguoi_phu_trach_id && d.nguoi_tao_id === nhanSu.id))
    );
  }, [dsDuAn, nhanSu, laTruongPhongKD]);

  // --------------------------------------------------------------------------
  // CƠ CHẾ TỔNG HỢP 5 CHỈ SỐ PHỄU BÁN HÀNG TỪ DỮ LIỆU TƯỜNG MINH (KHỐI I)
  // Nguyên tắc: Chỉ dựa vào mốc ngày nghiệp vụ & phân loại tường minh,
  // KHÔNG quét từ khóa text tự do, KHÔNG dựa vào ngay_cap_nhat để tránh đếm lại dự án cũ.
  // --------------------------------------------------------------------------
  const soLieuThucTeTuBanLamViec = useMemo(() => {
    const viecTuanNay = keHoachTuanNay?.danh_sach_tac_chien || [];
    const thuocTuan = (ngayStr?: string | null): boolean => {
      const d = (ngayStr || '').slice(0, 10);
      return Boolean(d && d >= infoTuan.ngayBatDau && d <= infoTuan.ngayKetThuc);
    };
    const lichHopLeTrongTuan = dsLichGap.filter(
      (l) =>
        !l.da_xoa &&
        l.trang_thai !== 'huy' &&
        l.trang_thai !== 'doi_lich' &&
        thuocTuan(l.ngay) &&
        (l.nguoi_phu_trach_id === nhanSu.id ||
          l.nguoi_tao_id === nhanSu.id ||
          (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(nhanSu.id)))
    );

    // 1. Khách hàng mới tiếp cận:
    // - Lịch công tác trong tuần được đánh dấu tường minh la_tiep_can_moi === true
    // - Khách hàng thuộc phụ trách/tạo bởi nhân sự có ngay_tao trong tuần
    // - Nhật ký Bàn làm việc trong tuần có loai_tac_nghiep === 'tao_khach_hang'
    const mapKhachMoi = new Map<string, MucChiTietKPI>();

    lichHopLeTrongTuan.forEach((l) => {
      if (!l.la_tiep_can_moi) return;
      const tenNorm = (l.ten_khach_hang || '').toLowerCase().trim();
      const key = l.khach_hang_id || tenNorm || `lich_${l.id}`;
      if (!mapKhachMoi.has(key)) {
        mapKhachMoi.set(key, {
          id: `lich_${l.id}`,
          tieuDe: l.ten_khach_hang || 'Khách hàng mới',
          moTa: `Lịch công tác ${l.ngay}${l.gio_bat_dau ? ` [${l.gio_bat_dau}]` : ''}: ${l.noi_dung || l.tieu_de || 'Tiếp cận mới'}`,
          loaiNguon: 'Lịch làm việc',
          daChon: true
        });
      }
    });

    dsKhachHang.forEach((kh) => {
      if (kh.trang_thai === 'da_xoa') return;
      const thuocNV =
        kh.nguoi_phu_trach_id === nhanSu.id ||
        (!kh.nguoi_phu_trach_id && kh.nguoi_tao_id === nhanSu.id);
      if (!thuocNV || !thuocTuan(kh.ngay_tao)) return;
      const key = kh.id;
      if (!mapKhachMoi.has(key)) {
        mapKhachMoi.set(key, {
          id: `kh_${kh.id}`,
          tieuDe: kh.ten_khach_hang,
          moTa: `Khách hàng mới tạo trên CRM ngày ${kh.ngay_tao.slice(0, 10)}`,
          loaiNguon: 'Hồ sơ dự án',
          daChon: true
        });
      }
    });

    viecTuanNay.forEach((item) => {
      const kqTaoKH = (item.danh_sach_ket_qua || []).find(
        (kq) => kq.loai_tac_nghiep === 'tao_khach_hang' && (!kq.ngay_ghi_nhan || thuocTuan(kq.ngay_ghi_nhan))
      );
      if (!kqTaoKH) return;
      const key = kqTaoKH.khach_hang_id || item.khach_hang_id || `viec_${item.id}`;
      if (!mapKhachMoi.has(key)) {
        mapKhachMoi.set(key, {
          id: `viec_${item.id}`,
          tieuDe: kqTaoKH.ten_khach_hang || item.ten_khach_hang_du_an || 'Khách hàng mới',
          moTa: `Bàn làm việc: ${kqTaoKH.noi_dung || item.noi_dung_tuan || 'Tạo khách hàng mới'}`,
          loaiNguon: 'Bàn làm việc',
          daChon: true
        });
      }
    });

    const dsChiTietKhachMoi = Array.from(mapKhachMoi.values());
    const tongKhachMoi = dsChiTietKhachMoi.length;

    // 2. Tổng số báo giá đã gửi trong tuần:
    // - Dự án có ngay_gui_bao_gia trong tuần (hoặc giai_doan === 'bao_gia' và ngay_tao_ho_so trong tuần)
    // - Lịch làm việc VP có loai_viec_vp === 'gui_bao_gia' trong tuần
    const mapBaoGia = new Map<string, MucChiTietKPI>();

    dsDuAnCuaNV.forEach((d) => {
      const ngayBG = d.ngay_gui_bao_gia || (d.giai_doan === 'bao_gia' ? (d.ngay_tao_ho_so || d.ngay_tao) : '');
      if (thuocTuan(ngayBG)) {
        mapBaoGia.set(d.id, {
          id: `da_bg_${d.id}`,
          tieuDe: d.ten_du_an,
          moTa: `Gửi báo giá (${(ngayBG || '').slice(0, 10)}) • Giá trị dự kiến: ${fmtTien(d.gia_tri_du_kien || d.gia_tri_hop_dong)}`,
          loaiNguon: 'Hồ sơ dự án',
          daChon: true
        });
      }
    });

    lichHopLeTrongTuan.forEach((l) => {
      if (l.loai_viec_vp !== 'gui_bao_gia') return;
      const key = l.du_an_id || l.khach_hang_id || `lich_bg_${l.id}`;
      if (!mapBaoGia.has(key)) {
        mapBaoGia.set(key, {
          id: `lich_bg_${l.id}`,
          tieuDe: l.ten_khach_hang || l.tieu_de || 'Gửi báo giá',
          moTa: `Lịch làm việc ${l.ngay}: ${l.noi_dung || l.tieu_de || 'Gửi báo giá'}`,
          loaiNguon: 'Lịch làm việc',
          daChon: true
        });
      }
    });

    const dsChiTietBaoGia = Array.from(mapBaoGia.values());
    const tongBaoGia = dsChiTietBaoGia.length;

    // 3. Tổng số dự án đã làm việc trong tuần:
    // - Dự án gắn với công việc trên Bàn làm việc tuần này
    // - Dự án gắn với Lịch công tác hợp lệ trong tuần
    // - Dự án có mốc tạo mới / tiếp cận / gửi báo giá / ký HĐ trong tuần
    const mapDuAnLamViec = new Map<string, MucChiTietKPI>();

    viecTuanNay.forEach((item) => {
      if (item.du_an_id) {
        const da = dsDuAnCuaNV.find((d) => d.id === item.du_an_id);
        if (da && !mapDuAnLamViec.has(da.id)) {
          mapDuAnLamViec.set(da.id, {
            id: `da_lam_${da.id}`,
            tieuDe: da.ten_du_an,
            moTa: `Bàn làm việc: ${item.noi_dung_tuan} • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
            loaiNguon: 'Bàn làm việc',
            daChon: true
          });
        }
      }
    });

    lichHopLeTrongTuan.forEach((l) => {
      if (l.du_an_id) {
        const da = dsDuAnCuaNV.find((d) => d.id === l.du_an_id);
        if (da && !mapDuAnLamViec.has(da.id)) {
          mapDuAnLamViec.set(da.id, {
            id: `da_lam_${da.id}`,
            tieuDe: da.ten_du_an,
            moTa: `Lịch công tác ${l.ngay}: ${l.noi_dung || l.tieu_de || 'Làm việc dự án'}`,
            loaiNguon: 'Lịch làm việc',
            daChon: true
          });
        }
      }
    });

    dsDuAnCuaNV.forEach((da) => {
      const coMocTrongTuan =
        thuocTuan(da.ngay_tao_ho_so || da.ngay_tao) ||
        thuocTuan(da.ngay_tiep_can) ||
        thuocTuan(da.ngay_gui_bao_gia) ||
        thuocTuan(da.ngay_ky_hop_dong);
      if (coMocTrongTuan && !mapDuAnLamViec.has(da.id)) {
        mapDuAnLamViec.set(da.id, {
          id: `da_lam_${da.id}`,
          tieuDe: da.ten_du_an,
          moTa: `Phát sinh mốc dự án trong tuần • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
          loaiNguon: 'Hồ sơ dự án',
          daChon: true
        });
      }
    });

    const dsChiTietDuAnLamViec = Array.from(mapDuAnLamViec.values());
    const tongDuAnDaLamViec = dsChiTietDuAnLamViec.length;

    // 4. Số hợp đồng ký kết trong tuần:
    // Chỉ tính dự án có ngay_ky_hop_dong rơi vào tuần (hoặc mới tạo ở giai đoạn ky_hop_dong trong tuần)
    const mapHopDong = new Map<string, MucChiTietKPI>();

    dsDuAnCuaNV.forEach((da) => {
      const ngayKy = da.ngay_ky_hop_dong || (da.giai_doan === 'ky_hop_dong' ? (da.ngay_tao_ho_so || da.ngay_tao) : '');
      const giaTriHD = Number(da.gia_tri_hop_dong || 0);

      if (thuocTuan(ngayKy) && giaTriHD > 0) {
        mapHopDong.set(da.id, {
          id: `hd_${da.id}`,
          tieuDe: `Hợp đồng: ${da.ten_du_an}`,
          moTa: `Ký kết ngày ${(ngayKy || '').slice(0, 10)} • Giá trị: ${fmtTien(giaTriHD)} • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
          loaiNguon: 'Hồ sơ dự án',
          soTien: giaTriHD,
          daChon: true
        });
      }
    });

    const dsChiTietHopDong = Array.from(mapHopDong.values());
    const tongHopDong = dsChiTietHopDong.length;

    // 5. Doanh số ký kết trong tuần (không cộng trùng gia_tri_hop_dong + tien_ve_thuc_te lũy kế)
    const mapDoanhThu = new Map<string, MucChiTietKPI>();

    dsChiTietHopDong.forEach((hd) => {
      if (hd.soTien && hd.soTien > 0) {
        mapDoanhThu.set(hd.id, {
          id: `dt_${hd.id}`,
          tieuDe: hd.tieuDe,
          moTa: `Giá trị hợp đồng ký mới trong tuần: ${fmtTien(hd.soTien)}`,
          loaiNguon: 'Hợp đồng ký mới',
          soTien: hd.soTien,
          daChon: true
        });
      }
    });

    const dsChiTietDoanhThu = Array.from(mapDoanhThu.values());
    const tongDoanhThu = dsChiTietDoanhThu.reduce((sum, item) => sum + Number(item.soTien || 0), 0);

    return {
      khachMoi: {
        thucTe: tongKhachMoi,
        chiTiet: `${tongKhachMoi} KH mới (Lịch tiếp cận mới & CRM)`,
        danhSach: dsChiTietKhachMoi
      },
      baoGia: {
        thucTe: tongBaoGia,
        chiTiet: `${tongBaoGia} báo giá (ngày gửi BG & việc gửi BG)`,
        danhSach: dsChiTietBaoGia
      },
      duAnLamViec: {
        thucTe: tongDuAnDaLamViec,
        chiTiet: `${tongDuAnDaLamViec} dự án tác nghiệp trong tuần`,
        danhSach: dsChiTietDuAnLamViec
      },
      hopDong: {
        thucTe: tongHopDong,
        chiTiet: `${tongHopDong} hợp đồng ký kết trong tuần`,
        danhSach: dsChiTietHopDong
      },
      doanhThu: {
        thucTe: tongDoanhThu,
        chiTiet: `${fmtTien(tongDoanhThu)} (Giá trị HĐ ký mới trong tuần)`,
        danhSach: dsChiTietDoanhThu
      }
    };
  }, [dsDuAnCuaNV, dsKhachHang, dsLichGap, keHoachTuanNay, infoTuan, nhanSu.id]);

  // Mục tiêu tuần báo cáo chỉ lấy từ Cam kết ĐÃ ĐƯỢC DUYỆT của tuần trước (mặc định 0 nếu chưa có/chưa duyệt)
  const mucTieuMacDinhTuTuanTruoc = useMemo(() => {
    const tuanTruocDaDuyet =
      (baoCaoTuanTruoc?.trang_thai_ke_hoach || baoCaoTuanTruoc?.trang_thai) === 'da_duyet';
    const ck = tuanTruocDaDuyet ? (baoCaoTuanTruoc?.cam_ket_tuan_toi as any) : null;
    return {
      khachMoi: Number(ck?.khach_moi?.target ?? 0),
      baoGia: Number(ck?.bao_gia?.target ?? 0),
      duAnLamViec: Number(ck?.du_an_lam_viec?.target ?? 0),
      hopDong: Number(ck?.hop_dong?.target ?? 0),
      doanhThu: Number(ck?.doanh_so?.target ?? ck?.doanh_thu?.target ?? 0)
    };
  }, [baoCaoTuanTruoc]);

  // --------------------------------------------------------------------------
  // STATE KHỐI I: ĐÁNH GIÁ KẾT QUẢ KPI TUẦN (5 CHỈ SỐ)
  // --------------------------------------------------------------------------
  const [kpiKhachMoi, setKpiKhachMoi] = useState({ keHoachTuanTruoc: 0, thucTe: 0, daSuaTay: false });
  const [kpiBaoGia, setKpiBaoGia] = useState({ keHoachTuanTruoc: 0, thucTe: 0, daSuaTay: false });
  const [kpiDuAnLamViec, setKpiDuAnLamViec] = useState({ keHoachTuanTruoc: 0, thucTe: 0, daSuaTay: false });
  const [kpiHopDong, setKpiHopDong] = useState({ keHoachTuanTruoc: 0, thucTe: 0, daSuaTay: false });
  const [kpiDoanhThu, setKpiDoanhThu] = useState({ keHoachTuanTruoc: 0, thucTe: 0, daSuaTay: false });

  // Modal xem chi tiết số liệu Drill-down (Checklist tương tác & Thêm nhanh)
  const [modalDrillDownKPI, setModalDrillDownKPI] = useState<{
    mo: boolean;
    chiSoKey: 'khachMoi' | 'baoGia' | 'duAnLamViec' | 'hopDong' | 'doanhThu' | '';
    tieuDe: string;
    moTa: string;
    laTien?: boolean;
    danhSach: MucChiTietKPI[];
  }>({ mo: false, chiSoKey: '', tieuDe: '', moTa: '', laTien: false, danhSach: [] });

  const [dangThemNhanh, setDangThemNhanh] = useState(false);
  const [mucThemMoi, setMucThemMoi] = useState({ tieuDe: '', moTa: '', soTien: 0 });

  const moModalDrillDown = (
    chiSoKey: 'khachMoi' | 'baoGia' | 'duAnLamViec' | 'hopDong' | 'doanhThu',
    tieuDe: string,
    moTa: string,
    laTien: boolean = false
  ) => {
    const goc = soLieuThucTeTuBanLamViec[chiSoKey].danhSach;
    setModalDrillDownKPI({
      mo: true,
      chiSoKey,
      tieuDe,
      moTa,
      laTien,
      danhSach: goc.map((m) => ({ ...m, daChon: true }))
    });
    setDangThemNhanh(false);
    setMucThemMoi({ tieuDe: '', moTa: '', soTien: 0 });
  };

  const toggleChonMuc = (id: string) => {
    setModalDrillDownKPI((p) => ({
      ...p,
      danhSach: p.danhSach.map((m) => (m.id === id ? { ...m, daChon: !m.daChon } : m))
    }));
  };

  const chonTatCa = (chon: boolean) => {
    setModalDrillDownKPI((p) => ({
      ...p,
      danhSach: p.danhSach.map((m) => ({ ...m, daChon: chon }))
    }));
  };

  const themMucPhatSinhNgoai = () => {
    if (!mucThemMoi.tieuDe.trim()) return;
    const itemMoi: MucChiTietKPI = {
      id: `ngoai_${Date.now()}`,
      tieuDe: mucThemMoi.tieuDe.trim(),
      moTa: mucThemMoi.moTa.trim() || 'Mục phát sinh ngoài hệ thống',
      loaiNguon: 'Phát sinh ngoài',
      soTien: Number(mucThemMoi.soTien || 0),
      daChon: true
    };
    setModalDrillDownKPI((p) => ({
      ...p,
      danhSach: [itemMoi, ...p.danhSach]
    }));
    setMucThemMoi({ tieuDe: '', moTa: '', soTien: 0 });
    setDangThemNhanh(false);
  };

  const xoaMucPhatSinh = (id: string) => {
    setModalDrillDownKPI((p) => ({
      ...p,
      danhSach: p.danhSach.filter((m) => m.id !== id)
    }));
  };

  const apDungVaoBaoCao = () => {
    const { chiSoKey, laTien, danhSach } = modalDrillDownKPI;
    const dsChon = danhSach.filter((m) => m.daChon);
    if (laTien) {
      const tongTien = dsChon.reduce((sum, m) => sum + Number(m.soTien || 0), 0);
      setKpiDoanhThu((p) => ({ ...p, thucTe: tongTien, daSuaTay: true }));
    } else {
      const sl = dsChon.length;
      if (chiSoKey === 'khachMoi') {
        setKpiKhachMoi((p) => ({ ...p, thucTe: sl, daSuaTay: true }));
      } else if (chiSoKey === 'baoGia') {
        setKpiBaoGia((p) => ({ ...p, thucTe: sl, daSuaTay: true }));
      } else if (chiSoKey === 'duAnLamViec') {
        setKpiDuAnLamViec((p) => ({ ...p, thucTe: sl, daSuaTay: true }));
      } else if (chiSoKey === 'hopDong') {
        setKpiHopDong((p) => ({ ...p, thucTe: sl, daSuaTay: true }));
      }
    }
    setModalDrillDownKPI((p) => ({ ...p, mo: false }));
    setThongBao({
      loai: 'tc',
      nd: `Đã cập nhật chỉ số thực tế (${laTien ? fmtTien(dsChon.reduce((sum, m) => sum + Number(m.soTien || 0), 0)) : `${dsChon.length} mục`}) vào báo cáo!`
    });
  };

  // Khởi tạo số liệu: Nếu báo cáo đã nộp/đã duyệt thì luôn giữ nguyên snapshot đã chốt;
  // nếu chưa nộp thì ưu tiên số liệu thực tế hoặc số đã sửa tay.
  useEffect(() => {
    const k = baoCaoHienTai?.kpi_tuan_qua as any;
    const daChot = baoCaoHienTai?.trang_thai === 'da_duyet' || baoCaoHienTai?.trang_thai === 'cho_duyet';

    setKpiKhachMoi({
      keHoachTuanTruoc: k?.khach_moi_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.khachMoi,
      thucTe: ((daChot || k?.da_sua_tay_khach_moi) && typeof k?.khach_moi_thuc_te === 'number')
        ? k.khach_moi_thuc_te
        : soLieuThucTeTuBanLamViec.khachMoi.thucTe,
      daSuaTay: Boolean(k?.da_sua_tay_khach_moi)
    });

    setKpiBaoGia({
      keHoachTuanTruoc: k?.bao_gia_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.baoGia,
      thucTe: ((daChot || k?.da_sua_tay_bao_gia) && typeof k?.bao_gia_thuc_te === 'number')
        ? k.bao_gia_thuc_te
        : soLieuThucTeTuBanLamViec.baoGia.thucTe,
      daSuaTay: Boolean(k?.da_sua_tay_bao_gia)
    });

    setKpiDuAnLamViec({
      keHoachTuanTruoc: k?.du_an_lam_viec_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.duAnLamViec,
      thucTe: ((daChot || k?.da_sua_tay_du_an_lam_viec) && typeof k?.du_an_lam_viec_thuc_te === 'number')
        ? k.du_an_lam_viec_thuc_te
        : soLieuThucTeTuBanLamViec.duAnLamViec.thucTe,
      daSuaTay: Boolean(k?.da_sua_tay_du_an_lam_viec)
    });

    setKpiHopDong({
      keHoachTuanTruoc: k?.hop_dong_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.hopDong,
      thucTe: ((daChot || k?.da_sua_tay_hop_dong) && typeof k?.hop_dong_thuc_te === 'number')
        ? k.hop_dong_thuc_te
        : soLieuThucTeTuBanLamViec.hopDong.thucTe,
      daSuaTay: Boolean(k?.da_sua_tay_hop_dong)
    });

    setKpiDoanhThu({
      keHoachTuanTruoc: k?.doanh_so_muc_tieu ?? k?.doanh_thu_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.doanhThu,
      thucTe: ((daChot || k?.da_sua_tay_doanh_so) && typeof (k?.doanh_so_thuc_te ?? k?.doanh_thu_thuc_te) === 'number')
        ? Number(k.doanh_so_thuc_te ?? k.doanh_thu_thuc_te)
        : soLieuThucTeTuBanLamViec.doanhThu.thucTe,
      daSuaTay: Boolean(k?.da_sua_tay_doanh_so)
    });
  }, [baoCaoHienTai, mucTieuMacDinhTuTuanTruoc, soLieuThucTeTuBanLamViec]);

  const dongBoLaiKPITuBanLamViec = () => {
    setKpiKhachMoi((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.khachMoi.thucTe, daSuaTay: false }));
    setKpiBaoGia((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.baoGia.thucTe, daSuaTay: false }));
    setKpiDuAnLamViec((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.duAnLamViec.thucTe, daSuaTay: false }));
    setKpiHopDong((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.hopDong.thucTe, daSuaTay: false }));
    setKpiDoanhThu((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.doanhThu.thucTe, daSuaTay: false }));
    setThongBao({
      loai: 'tc',
      nd: 'Đã cập nhật lại toàn bộ số liệu thực tế tự động từ Lịch làm việc & CRM!'
    });
  };

  // --------------------------------------------------------------------------
  // STATE KHỐI II: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)
  // Chỉ liệt kê những dự án có mức độ tiềm năng từ CAO trở lên ('cao', 'rat_cao')
  // --------------------------------------------------------------------------
  const [idsDuAnChon, setIdsDuAnChon] = useState<string[]>([]);
  const [moModalChonDA, setMoModalChonDA] = useState(false);

  // Bộ lọc dự án tiềm năng cao trở lên
  const dsDuAnTiemNangCaoNV = useMemo(() => {
    return dsDuAnCuaNV
      .filter(
        (d) =>
          (d.muc_do_tiem_nang === 'rat_cao' || d.muc_do_tiem_nang === 'cao') &&
          d.giai_doan !== 'hoan_thanh_tt_dot_2' &&
          d.giai_doan !== 'tam_dung_huy'
      )
      .sort((a, b) => {
        const score = (tn?: string) => (tn === 'rat_cao' ? 5 : 4);
        return score(b.muc_do_tiem_nang) - score(a.muc_do_tiem_nang);
      });
  }, [dsDuAnCuaNV]);

  useEffect(() => {
    const idsCoSan = baoCaoHienTai?.du_an_trong_diem_ids || keHoachTuanToi?.du_an_trong_diem_ids;
    if (idsCoSan && idsCoSan.length > 0) {
      // Giữ nguyên danh sách dự án đã lưu trong snapshot tuần
      const idHopLe = idsCoSan.filter((id) => dsDuAnCuaNV.some((d) => d.id === id));
      setIdsDuAnChon(idHopLe);
      return;
    }

    setIdsDuAnChon([]);
  }, [baoCaoHienTai, keHoachTuanToi, dsDuAnCuaNV]);

  const dsDuAnTrongDiem = useMemo(() => {
    return idsDuAnChon
      .map((id) => dsDuAnCuaNV.find((d) => d.id === id))
      .filter(Boolean) as HoSoDuAn[];
  }, [idsDuAnChon, dsDuAnCuaNV]);

  const tongGiaTriDealTrongDiem = useMemo(() => {
    return dsDuAnTrongDiem.reduce((acc, d) => {
      const val = d.gia_tri_hop_dong || d.gia_tri_du_kien || 0;
      return acc + Number(val);
    }, 0);
  }, [dsDuAnTrongDiem]);

  // --------------------------------------------------------------------------
  // STATE DÀNH CHO TRƯỞNG PHÒNG KINH DOANH (ĐIỀU HÀNH CHUNG & ĐỊNH HƯỚNG PHÒNG)
  // --------------------------------------------------------------------------
  const [danhGiaTuanQuaTP, setDanhGiaTuanQuaTP] = useState<string>('');
  const [deXuatBanGiamDocTP, setDeXuatBanGiamDocTP] = useState<string>('');
  const [dieuHanhTP, setDieuHanhTP] = useState({
    mucTieuDoanhThuPhong: 0,
    soHopDongDuKien: 0,
    trongTamDieuHanh: '',
    keHoachHoTroNhanSu: ''
  });

  const daKhoiTaoTPRef = useRef<string | null>(null);

  useEffect(() => {
    if (!baoCaoHienTai) return;
    const key = `${baoCaoHienTai.id || 'new'}_${baoCaoHienTai.tuan}`;
    if (daKhoiTaoTPRef.current === key) return;
    daKhoiTaoTPRef.current = key;

    setDanhGiaTuanQuaTP(baoCaoHienTai.danh_gia_tuan_qua || '');
    setDeXuatBanGiamDocTP(baoCaoHienTai.de_xuat_ban_giam_doc || '');

    const dh = baoCaoHienTai.dinh_huong_dieu_hanh_tuan_toi as any;
    setDieuHanhTP({
      mucTieuDoanhThuPhong: Number(dh?.mucTieuDoanhThuPhong ?? dh?.muc_tieu_doanh_thu_phong ?? 0),
      soHopDongDuKien: Number(dh?.soHopDongDuKien ?? dh?.so_hop_dong_du_kien ?? 0),
      trongTamDieuHanh: String(dh?.trongTamDieuHanh || dh?.trong_tam_dieu_hanh || ''),
      keHoachHoTroNhanSu: String(dh?.keHoachHoTroNhanSu || dh?.ke_hoach_ho_tro_nhan_su || '')
    });
  }, [baoCaoHienTai?.id, baoCaoHienTai?.tuan]);

  // --------------------------------------------------------------------------
  // STATE KHỐI III: CHỈ TIÊU CAM KẾT TUẦN TỚI (MẶC ĐỊNH 0)
  // --------------------------------------------------------------------------
  const [camKet, setCamKet] = useState({
    khachMoi: { target: 0, min: 0, max: 0 },
    baoGia: { target: 0, min: 0, max: 0 },
    duAnLamViec: { target: 0, min: 0, max: 0 },
    hopDong: { target: 0, min: 0, max: 0 },
    doanhThu: { target: 0, min: 0, max: 0 }
  });

  const daKhoiTaoCamKetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!baoCaoHienTai) return;
    const key = `${baoCaoHienTai.id || 'new'}_${baoCaoHienTai.tuan}`;
    if (daKhoiTaoCamKetRef.current === key) return;
    daKhoiTaoCamKetRef.current = key;

    if (baoCaoHienTai?.cam_ket_tuan_toi) {
      const c = baoCaoHienTai.cam_ket_tuan_toi as any;
      setCamKet({
        khachMoi: c.khach_moi || { target: 0, min: 0, max: 0 },
        baoGia: c.bao_gia || { target: 0, min: 0, max: 0 },
        duAnLamViec: c.du_an_lam_viec || { target: 0, min: 0, max: 0 },
        hopDong: c.hop_dong || { target: 0, min: 0, max: 0 },
        doanhThu: c.doanh_so || c.doanh_thu || { target: 0, min: 0, max: 0 }
      });
    } else {
      setCamKet({
        khachMoi: { target: 0, min: 0, max: 0 },
        baoGia: { target: 0, min: 0, max: 0 },
        duAnLamViec: { target: 0, min: 0, max: 0 },
        hopDong: { target: 0, min: 0, max: 0 },
        doanhThu: { target: 0, min: 0, max: 0 }
      });
    }
  }, [baoCaoHienTai?.id, baoCaoHienTai?.tuan]);

  // --------------------------------------------------------------------------
  // STATE KHỐI IV: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (KHỬ TRÙNG LẶP TUYỆT ĐỐI)
  // --------------------------------------------------------------------------
  const [tabChinh, setTabChinh] = useState<'bao_cao' | 'ke_hoach'>('bao_cao');

  // Trạng thái phê duyệt & Khóa chỉnh sửa độc lập theo từng Tab (Báo cáo vs Kế hoạch)
  const laSepXemNhanVien = laQuanLy && nhanSu.id !== nguoiDungHienTaiId;
  const trangThaiBaoCao = baoCaoHienTai?.trang_thai || 'nhap';
  const trangThaiKeHoach = baoCaoHienTai?.trang_thai_ke_hoach || 'nhap';
  const trangThaiTab = tabChinh === 'bao_cao' ? trangThaiBaoCao : trangThaiKeHoach;
  const ghiChuTab = tabChinh === 'bao_cao' ? baoCaoHienTai?.ghi_chu_quan_ly : baoCaoHienTai?.ghi_chu_ke_hoach;
  const yeuCauMoKhoaTab = tabChinh === 'bao_cao' ? baoCaoHienTai?.yeu_cau_mo_khoa : baoCaoHienTai?.yeu_cau_mo_khoa_ke_hoach;

  const khoaBaoCao =
    trangThaiBaoCao === 'da_duyet' ||
    (!laSepXemNhanVien && (trangThaiBaoCao === 'cho_duyet' || trangThaiBaoCao === 'cho_giam_doc_duyet'));
  const khoaKeHoach =
    trangThaiKeHoach === 'da_duyet' ||
    (!laSepXemNhanVien && (trangThaiKeHoach === 'cho_duyet' || trangThaiKeHoach === 'cho_giam_doc_duyet'));
  const khoaChinhSua = tabChinh === 'bao_cao' ? khoaBaoCao : khoaKeHoach;
  const [modalYeuCauDieuChinh, setModalYeuCauDieuChinh] = useState(false);
  const [ghiChuYeuCau, setGhiChuYeuCau] = useState('');
  const [modalMoKhoa, setModalMoKhoa] = useState(false);
  const [lyDoMoKhoa, setLyDoMoKhoa] = useState('');
  const [dangDuyet, setDangDuyet] = useState(false);

  // Báo cáo nhanh kết quả cuộc hẹn tuần qua
  const [modalBaoCaoNhanhLich, setModalBaoCaoNhanhLich] = useState<{
    lich: LichGapKH | null;
    ketQua: string;
  }>({ lich: null, ketQua: '' });
  const [dangLuuBaoCaoLich, setDangLuuBaoCaoLich] = useState(false);
  const [moLichTuanQua, setMoLichTuanQua] = useState(true);

  // Lịch công tác tuần qua của nhân sự (Khử trùng tuyệt đối theo ID & nội dung)
  const dsLichTuanQuaCuaNV = useMemo(() => {
    const seen = new Set<string>();
    return dsLichGap
      .filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuan.ngayBatDau &&
          l.ngay <= infoTuan.ngayKetThuc &&
          (l.nguoi_phu_trach_id === nhanSu.id ||
            l.nguoi_tao_id === nhanSu.id ||
            (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(nhanSu.id)))
      )
      .filter((l) => {
        const key = `${l.id}`;
        const keyND = `${l.ngay}_${l.gio_bat_dau || ''}_${(l.ten_khach_hang || '').trim().toLowerCase()}_${(l.noi_dung || l.tieu_de || '').trim().toLowerCase()}`;
        if (seen.has(key) || seen.has(keyND)) return false;
        seen.add(key);
        seen.add(keyND);
        return true;
      })
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`));
  }, [dsLichGap, nhanSu.id, infoTuan]);

  const thongKeLichTuanQua = useMemo(() => {
    const tong = dsLichTuanQuaCuaNV.length;
    const xong = dsLichTuanQuaCuaNV.filter((l) => l.trang_thai === 'da_hoan_thanh').length;
    const huy = dsLichTuanQuaCuaNV.filter((l) => l.trang_thai === 'doi_lich' || l.trang_thai === 'huy').length;
    const chua = dsLichTuanQuaCuaNV.filter(
      (l) => l.trang_thai !== 'da_hoan_thanh' && l.trang_thai !== 'doi_lich' && l.trang_thai !== 'huy'
    ).length;
    return { tong, xong, huy, chua };
  }, [dsLichTuanQuaCuaNV]);

  const danhSach7NgayTuanQua = useMemo(() => {
    return infoTuan.danhSachNgay.map((d, idx) => {
      const lichTrongNgay = dsLichTuanQuaCuaNV.filter((l) => l.ngay === d.ngay);
      return {
        thuIndex: idx + 1,
        tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
        ngayISO: d.ngay,
        danhSachLich: lichTrongNgay
      };
    });
  }, [infoTuan, dsLichTuanQuaCuaNV]);

  const [ghiChuLichNgay, setGhiChuLichNgay] = useState<Record<string, string>>({});

  useEffect(() => {
    setGhiChuLichNgay(baoCaoHienTai?.ghi_chu_lich_ngay || {});
  }, [baoCaoHienTai?.id, baoCaoHienTai?.tuan]);

  // Quét các lịch hẹn tuần tới của nhân viên từ Lịch công tác (Khử trùng tuyệt đối theo ID & nội dung)
  const dsLichTuanToiCuaNV = useMemo(() => {
    const seen = new Set<string>();
    return dsLichGap
      .filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (l.nguoi_phu_trach_id === nhanSu.id ||
            l.nguoi_tao_id === nhanSu.id ||
            (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(nhanSu.id)))
      )
      .filter((l) => {
        const key = `${l.id}`;
        const keyND = `${l.ngay}_${l.gio_bat_dau || ''}_${(l.ten_khach_hang || '').trim().toLowerCase()}_${(l.noi_dung || l.tieu_de || '').trim().toLowerCase()}`;
        if (seen.has(key) || seen.has(keyND)) return false;
        seen.add(key);
        seen.add(keyND);
        return true;
      })
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`));
  }, [dsLichGap, nhanSu.id, infoTuanToi]);

  // Gom lịch làm việc tuần tới theo 7 ngày (khử trùng hoàn toàn giữa Lịch công tác & Bàn làm việc)
  const danhSach7NgayTuanToi = useMemo(() => {
    const dsViec = keHoachTuanToi?.danh_sach_tac_chien || [];

    return infoTuanToi.danhSachNgay.map((d, idx) => {
      // 1. Lịch công tác / gặp KH
      const lichTrongNgay = dsLichTuanToiCuaNV.filter((l) => l.ngay === d.ngay);
      const dsDongLich = lichTrongNgay.map((l) => {
        const gio = l.gio_bat_dau ? `[${l.gio_bat_dau}] ` : '';
        const isVP = l.loai_lich === 'van_phong';
        const tagLoai = isVP ? '[VP] ' : '';
        const ten = l.ten_khach_hang || l.tieu_de || 'Khách hàng';
        const diaDiem = (!isVP && l.dia_diem) ? ` (${l.dia_diem})` : '';
        const nd = l.noi_dung || l.tieu_de || (isVP ? 'Công việc VP' : 'Lịch công tác');
        return `${gio}${tagLoai}${ten}${diaDiem} - ${nd}`.trim();
      });

      // 2. Nhiệm vụ trên Bàn làm việc (ItemKeHoachTuan) được xếp cho ngày này
      const viecTrongNgay = dsViec.filter((item) => kiemTraViecThuocNgay(item, d.ngay));

      // LỌC KHỬ TRÙNG TUYỆT ĐỐI: Bỏ qua item đồng bộ từ lịch công tác & trùng lịch
      const viecKhongTrung = viecTrongNgay.filter((item) => {
        if (item.id && (item.id.startsWith('tuan_lich_') || item.id.startsWith('lich_'))) {
          return false;
        }
        if ((item as any).lich_gap_id && lichTrongNgay.some((l) => l.id === (item as any).lich_gap_id)) {
          return false;
        }
        const tenViec = (item.ten_khach_hang_du_an || '').toLowerCase().trim();
        const ndViec = (item.noi_dung_tuan || item.hanh_dong_tuan || '').toLowerCase().trim();
        const trungLich = lichTrongNgay.some((l) => {
          const tenLich = (l.ten_khach_hang || '').toLowerCase().trim();
          const ndLich = (l.noi_dung || l.tieu_de || '').toLowerCase().trim();
          if (l.khach_hang_id && item.khach_hang_id && l.khach_hang_id === item.khach_hang_id) {
            return true;
          }
          if (tenLich && tenViec && (tenLich.includes(tenViec) || tenViec.includes(tenLich))) {
            return true;
          }
          if (ndLich && ndViec && (ndLich.includes(ndViec) || ndViec.includes(ndLich))) {
            return true;
          }
          return false;
        });
        return !trungLich;
      });

      const dsDongViec = viecKhongTrung.map((item) => {
        const ht =
          item.hinh_thuc === 'gap_mat'
            ? 'Gặp trực tiếp'
            : item.hinh_thuc === 'goi_dien'
            ? 'Gọi điện'
            : 'Tác nghiệp';
        const ten = item.ten_khach_hang_du_an || 'Khách hàng';
        const nd = item.noi_dung_tuan || item.hanh_dong_tuan || item.dau_ra_cam_ket || 'Công việc';
        return `[${ht}] ${ten}: ${nd}`.trim();
      });

      // Khử trùng tuyệt đối các dòng có nội dung giống nhau
      const setDong = new Set<string>();
      const tongHopArray: string[] = [];
      [...dsDongLich, ...dsDongViec].forEach((dong) => {
        const clean = dong.trim();
        if (clean && !setDong.has(clean)) {
          setDong.add(clean);
          tongHopArray.push(clean);
        }
      });

      // Ghép nội dung cuối dùng để xuất Excel hoặc lưu
      const dsTextLich = tongHopArray.join('; ');
      const ghiChuPhatSinh = (ghiChuLichNgay[d.ngay] || '').trim();
      let noiDungCuoi = '';
      if (dsTextLich && ghiChuPhatSinh) {
        noiDungCuoi = `${dsTextLich}; [Phát sinh] ${ghiChuPhatSinh}`;
      } else if (dsTextLich) {
        noiDungCuoi = dsTextLich;
      } else if (ghiChuPhatSinh) {
        noiDungCuoi = ghiChuPhatSinh;
      } else {
        noiDungCuoi = 'Tác nghiệp văn phòng / Bám sát dự án';
      }

      return {
        thuIndex: idx + 1,
        tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
        ngayISO: d.ngay,
        soLich: lichTrongNgay.length + viecKhongTrung.length,
        soLichCongTac: lichTrongNgay.length,
        soViecBanLamViec: viecKhongTrung.length,
        noiDung: noiDungCuoi,
        ghiChuPhatSinh,
        lichTrongNgay,
        viecKhongTrung,
        tongHopArray
      };
    });
  }, [infoTuanToi, dsLichTuanToiCuaNV, keHoachTuanToi, ghiChuLichNgay]);

  const taiLaiLichTuBanLamViec = () => {
    setGhiChuLichNgay({});
    setThongBao({
      loai: 'tc',
      nd: 'Đã tải lại toàn bộ nội dung công việc từ Lịch làm việc tuần tới.'
    });
  };

  // --------------------------------------------------------------------------
  // XỬ LÝ LƯU & XUẤT EXCEL
  // --------------------------------------------------------------------------
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXuatExcel, setDangXuatExcel] = useState(false);
  const [thongBao, setThongBao] = useState<{ loai: 'tc' | 'loi'; nd: string } | null>(null);

  const layDuLieuChuan = (): DuLieuBaoCaoTuanVDCDChuan => {
    return {
      tuan,
      nhanTieuDeTuan: `${infoTuan.nhanTieuDe} (${infoTuan.khoangNgayNhan}/${infoTuan.nam})`,
      nhanVien: {
        id: nhanSu.id,
        ho_va_ten: nhanSu.ho_va_ten,
        ma_nhan_vien: nhanSu.ma_nhan_vien,
        chuc_vu: nhanSu.vai_tro,
        phong_ban: 'Kinh doanh'
      },
      kpiTuanQua: {
        khachHangMoi: { mucTieu: kpiKhachMoi.keHoachTuanTruoc, thucTe: kpiKhachMoi.thucTe },
        baoGia: { mucTieu: kpiBaoGia.keHoachTuanTruoc, thucTe: kpiBaoGia.thucTe },
        duAnLamViec: { mucTieu: kpiDuAnLamViec.keHoachTuanTruoc, thucTe: kpiDuAnLamViec.thucTe },
        hopDongKy: { mucTieu: kpiHopDong.keHoachTuanTruoc, thucTe: kpiHopDong.thucTe },
        doanhThu: { mucTieu: kpiDoanhThu.keHoachTuanTruoc, thucTe: kpiDoanhThu.thucTe }
      },
      danhSachDuAnTrongDiem: dsDuAnTrongDiem.map((d, idx) => {
        const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
        const nlh = d.nguoi_lien_he_id ? mapNLH.get(d.nguoi_lien_he_id) : null;
        const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
        const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.cao;
        const sp = d.san_pham_dich_vu_id ? mapSP.get(d.san_pham_dich_vu_id) : d.san_pham_khac_mo_ta;
        const nsPhuTrach = d.nguoi_phu_trach_id ? mapNS.get(d.nguoi_phu_trach_id) : null;

        return {
          stt: idx + 1,
          id: d.id,
          tenDuAn: d.ten_du_an,
          tenKhachHang: kh?.ten_khach_hang || '',
          nguoiLienHe: nlh?.ho_va_ten || kh?.so_dien_thoai || '—',
          soDienThoai: nlh?.so_dien_thoai || kh?.so_dien_thoai || '',
          sanPhamDichVu: sp || 'Khảo sát / Đo đạc',
          giaTriDeal: d.gia_tri_hop_dong || d.gia_tri_du_kien || 0,
          giaiDoanKey: d.giai_doan,
          tenGiaiDoan: cfgGD.nhan_day_du,
          mucDoTiemNang: d.muc_do_tiem_nang,
          xacSuatPct: cfgTN.xacSuat,
          nguoiPhuTrach: nsPhuTrach?.ho_va_ten || 'Đang cập nhật'
        };
      }),
      camKetTuanToi: {
        khachHangMoi: camKet.khachMoi,
        baoGia: camKet.baoGia,
        duAnLamViec: camKet.duAnLamViec,
        hopDongMoi: camKet.hopDong,
        doanhThu: camKet.doanhThu
      },
      lichLamViecTuanToi: danhSach7NgayTuanToi.map((d) => ({
        thu: d.thuIndex,
        tenThuNgay: d.tenThuNgay,
        noiDungChiTiet: d.noiDung
      })),
      laTruongPhong: laTruongPhongKD,
      dinhHuongDieuHanh: laTruongPhongKD
        ? {
            mucTieuDoanhThuPhong: dieuHanhTP.mucTieuDoanhThuPhong,
            soHopDongDuKien: dieuHanhTP.soHopDongDuKien,
            trongTamDieuHanh: dieuHanhTP.trongTamDieuHanh,
            keHoachHoTroNhanSu: dieuHanhTP.keHoachHoTroNhanSu
          }
        : undefined,
      danhGiaTuanQuaTP: laTruongPhongKD ? danhGiaTuanQuaTP : undefined,
      deXuatBanGiamDocTP: laTruongPhongKD ? deXuatBanGiamDocTP : undefined
    };
  };

  const xuLyXuatExcel = async () => {
    setDangXuatExcel(true);
    try {
      const duLieu = layDuLieuChuan();
      const blob = await taoFileExcelBaoCaoTuanVDCD(duLieu);
      const tenFile = `Bao_cao_tuan_${tuan}_${nhanSu.ho_va_ten.replace(/\s+/g, '_')}.xlsx`;
      taiFileExcelBlob(blob, tenFile);
      setThongBao({ loai: 'tc', nd: `Đã xuất file Excel "${tenFile}" thành công!` });
    } catch (err) {
      console.error(err);
      setThongBao({ loai: 'loi', nd: 'Có lỗi khi xuất file Excel. Vui lòng thử lại.' });
    } finally {
      setDangXuatExcel(false);
    }
  };

  const xuLyLuu = async (nopBaoCao: boolean) => {
    setDangLuu(true);
    try {
      const keHoachTiemNangSnapshot = dsDuAnTrongDiem.map((d) => {
        const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
        const sp = d.san_pham_dich_vu_id ? mapSP.get(d.san_pham_dich_vu_id) : d.san_pham_khac_mo_ta;
        const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
        return {
          id: `tn_${d.id}`,
          du_an_id: d.id,
          ten_khach_hang: kh?.ten_khach_hang || d.ten_du_an,
          giam_doc_du_an: nhanSu.ho_va_ten,
          san_pham: sp || d.ten_du_an,
          trang_thai: cfgGD.nhan_ngan,
          doanh_thu_ky_ket: Number(d.gia_tri_hop_dong || d.gia_tri_du_kien || 0),
          doanh_thu_tien_ve: Number(d.tien_ve_thuc_te || 0)
        };
      });

      const tongTiepCanThucTe = kpiKhachMoi.thucTe;
      const trangThaiMoi: BaoCaoTuanVDCD['trang_thai'] = nopBaoCao
        ? laTruongPhongKD && !laSepXemNhanVien
          ? cheDoDuyet === '2_cap'
            ? 'cho_giam_doc_duyet'
            : 'da_duyet'
          : 'cho_duyet'
        : 'nhap';

      const payloadCapNhat: Partial<BaoCaoTuanVDCD> =
        tabChinh === 'bao_cao'
          ? {
              danh_gia_tuan_qua: laTruongPhongKD ? danhGiaTuanQuaTP : undefined,
              de_xuat_ban_giam_doc: laTruongPhongKD ? deXuatBanGiamDocTP : undefined,
              dt_tuan_ky_ket: kpiDoanhThu.thucTe,
              thuc_hien_tiep_can_tuan_nay: tongTiepCanThucTe,
              ke_hoach_tiep_can_tuan_nay: kpiKhachMoi.keHoachTuanTruoc,
              tinh_trang_tuan_nay: {
                tong_tiep_can: Math.max(tongTiepCanThucTe, kpiDuAnLamViec.thucTe),
                dang_tiep_can: kpiDuAnLamViec.thucTe,
                bao_gia: kpiBaoGia.thucTe,
                hop_dong: kpiHopDong.thucTe,
                khong_phu_hop: baoCaoHienTai?.tinh_trang_tuan_nay?.khong_phu_hop || 0
              },
              kpi_tuan_qua: {
                khach_moi_muc_tieu: kpiKhachMoi.keHoachTuanTruoc,
                khach_moi_thuc_te: kpiKhachMoi.thucTe,
                da_sua_tay_khach_moi: kpiKhachMoi.daSuaTay,
                bao_gia_muc_tieu: kpiBaoGia.keHoachTuanTruoc,
                bao_gia_thuc_te: kpiBaoGia.thucTe,
                da_sua_tay_bao_gia: kpiBaoGia.daSuaTay,
                du_an_lam_viec_muc_tieu: kpiDuAnLamViec.keHoachTuanTruoc,
                du_an_lam_viec_thuc_te: kpiDuAnLamViec.thucTe,
                da_sua_tay_du_an_lam_viec: kpiDuAnLamViec.daSuaTay,
                hop_dong_muc_tieu: kpiHopDong.keHoachTuanTruoc,
                hop_dong_thuc_te: kpiHopDong.thucTe,
                da_sua_tay_hop_dong: kpiHopDong.daSuaTay,
                doanh_so_muc_tieu: kpiDoanhThu.keHoachTuanTruoc,
                doanh_so_thuc_te: kpiDoanhThu.thucTe,
                da_sua_tay_doanh_so: kpiDoanhThu.daSuaTay,
                cuoc_gap_muc_tieu: 0,
                cuoc_gap_thuc_te: 0
              } as any,
              trang_thai: trangThaiMoi
            }
          : {
              dinh_huong_dieu_hanh_tuan_toi: laTruongPhongKD
                ? {
                    muc_tieu_doanh_thu_phong: dieuHanhTP.mucTieuDoanhThuPhong,
                    so_hop_dong_du_kien: dieuHanhTP.soHopDongDuKien,
                    trong_tam_dieu_hanh: dieuHanhTP.trongTamDieuHanh,
                    ke_hoach_ho_tro_nhan_su: dieuHanhTP.keHoachHoTroNhanSu
                  }
                : undefined,
              ke_hoach_tiep_can_tuan_toi: camKet.khachMoi.target,
              ke_hoach_tiem_nang: keHoachTiemNangSnapshot,
              du_an_trong_diem_ids: idsDuAnChon,
              cam_ket_tuan_toi: {
                khach_moi: camKet.khachMoi,
                bao_gia: camKet.baoGia,
                du_an_lam_viec: camKet.duAnLamViec,
                hop_dong: camKet.hopDong,
                doanh_so: camKet.doanhThu,
                cuoc_hen: { target: 0, min: 0, max: 0 }
              } as any,
              ghi_chu_lich_ngay: ghiChuLichNgay,
              trang_thai_ke_hoach: trangThaiMoi
            };

      await onLuuBaoCao(payloadCapNhat, nopBaoCao);
      const tenPhan = tabChinh === 'bao_cao' ? `Báo cáo ${infoTuan.nhanTieuDe}` : `Kế hoạch ${infoTuanToi.nhanTieuDe}`;
      setThongBao({
        loai: 'tc',
        nd: nopBaoCao ? `Đã nộp ${tenPhan} thành công!` : `Đã lưu bản nháp ${tenPhan}.`
      });
    } catch (err: any) {
      console.error(err);
      setThongBao({ loai: 'loi', nd: err?.message || 'Có lỗi khi lưu báo cáo lên máy chủ.' });
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. THANH ĐIỀU HƯỚNG & HÀNH ĐỘNG CHÍNH */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="size-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-foreground uppercase tracking-wide">
                Báo cáo {infoTuan.nhanTieuDe} &amp; Kế hoạch {infoTuanToi.nhanTieuDe}
              </h2>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border',
                  trangThaiTab === 'da_duyet'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : trangThaiTab === 'can_dieu_chinh'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : trangThaiTab === 'cho_giam_doc_duyet'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                    : trangThaiTab === 'cho_duyet'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                )}
              >
                {trangThaiTab === 'da_duyet'
                  ? 'Đã duyệt'
                  : trangThaiTab === 'can_dieu_chinh'
                  ? 'Cần điều chỉnh'
                  : trangThaiTab === 'cho_giam_doc_duyet'
                  ? 'Chờ GĐ duyệt'
                  : trangThaiTab === 'cho_duyet'
                  ? (cheDoDuyet === '2_cap' ? 'Chờ TPKD duyệt' : 'Chờ duyệt')
                  : 'Bản nháp'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nhanSu.ho_va_ten} · Báo cáo: <b className="text-foreground">{infoTuan.khoangNgayNhan}/{infoTuan.nam}</b> → Kế hoạch: <b className="text-foreground">{infoTuanToi.khoangNgayNhan}/{infoTuanToi.nam}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={xuLyXuatExcel}
            disabled={dangXuatExcel}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Xuất file Excel đúng định dạng mẫu Google Sheet VDCD"
          >
            <Download className="size-4" />
            <span>{dangXuatExcel ? 'Đang xuất...' : 'Xuất Excel chuẩn'}</span>
          </button>

          {/* NÚT ĐIỀU HÀNH DÀNH CHO QUẢN LÝ */}
          {laSepXemNhanVien ? (
            <div className="flex items-center gap-2 flex-wrap">
              {!khoaChinhSua && (
                <button
                  type="button"
                  onClick={() => xuLyLuu(false)}
                  disabled={dangLuu}
                  className="h-9 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Save className="size-4 text-blue-600" />
                  <span>Lưu thay đổi</span>
                </button>
              )}

              {onDuyetBaoCao && (
                <>
                  {(trangThaiTab === 'cho_duyet' ||
                    trangThaiTab === 'cho_giam_doc_duyet' ||
                    trangThaiTab === 'da_duyet') && (
                    <button
                      type="button"
                      onClick={() => setModalYeuCauDieuChinh(true)}
                      className="h-9 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <MessageSquareWarning className="size-4 text-amber-600" />
                      <span>{trangThaiTab === 'da_duyet' ? 'Mở khóa điều chỉnh' : 'Yêu cầu điều chỉnh'}</span>
                    </button>
                  )}

                  {trangThaiTab === 'cho_duyet' && (laNguoiDuyetCap1 || laNguoiDuyetCap2) && (
                    <button
                      type="button"
                      disabled={dangDuyet}
                      onClick={async () => {
                        setDangDuyet(true);
                        try {
                          const nextState =
                            cheDoDuyet === '2_cap' && laNguoiDuyetCap1
                              ? 'cho_giam_doc_duyet'
                              : 'da_duyet';
                          await onDuyetBaoCao(nextState, undefined, tabChinh);
                        } finally {
                          setDangDuyet(false);
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Check className="size-4" />
                      <span>
                        {dangDuyet
                          ? 'Đang duyệt...'
                          : cheDoDuyet === '2_cap'
                          ? 'Duyệt & Chuyển GĐ'
                          : 'Phê duyệt chốt'}
                      </span>
                    </button>
                  )}

                  {trangThaiTab === 'cho_giam_doc_duyet' && laNguoiDuyetCap2 && (
                    <button
                      type="button"
                      disabled={dangDuyet}
                      onClick={async () => {
                        setDangDuyet(true);
                        try {
                          await onDuyetBaoCao('da_duyet', undefined, tabChinh);
                        } finally {
                          setDangDuyet(false);
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Check className="size-4" />
                      <span>{dangDuyet ? 'Đang duyệt...' : 'Phê duyệt cuối'}</span>
                    </button>
                  )}

                  {trangThaiTab === 'da_duyet' && (
                    <span className="h-9 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Đã chốt</span>
                    </span>
                  )}

                  {trangThaiTab === 'nhap' && (
                    <span className="h-9 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold inline-flex items-center">
                      Nhân sự chưa nộp
                    </span>
                  )}
                </>
              )}
            </div>
          ) : (
            /* NÚT THAO TÁC DÀNH CHO NHÂN VIÊN SALE / TPKD TỰ XEM */
            <div className="flex items-center gap-2 flex-wrap">
              {trangThaiTab === 'cho_duyet' ? (
                <>
                  {onThuHoiBaoCao && (
                    <button
                      type="button"
                      onClick={() => onThuHoiBaoCao(tabChinh)}
                      className="h-9 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="size-4 text-amber-600" />
                      <span>Thu hồi để sửa</span>
                    </button>
                  )}
                </>
              ) : trangThaiTab === 'cho_giam_doc_duyet' ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 px-3.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-800 text-xs font-bold inline-flex items-center gap-1.5">
                    <Clock className="size-4 text-indigo-600" />
                    <span>Chờ Giám đốc duyệt</span>
                  </div>
                  {laTruongPhongKD && onThuHoiBaoCao && (
                    <button
                      type="button"
                      onClick={() => onThuHoiBaoCao(tabChinh)}
                      className="h-9 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Thu hồi</span>
                    </button>
                  )}
                </div>
              ) : trangThaiTab === 'da_duyet' ? (
                <div className="flex items-center gap-2">
                  <div className="h-9 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Đã chốt</span>
                  </div>
                  {onYeuCauMoKhoa && !yeuCauMoKhoaTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setLyDoMoKhoa('');
                        setModalMoKhoa(true);
                      }}
                      className="h-9 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Yêu cầu mở khóa</span>
                    </button>
                  )}
                  {yeuCauMoKhoaTab && (
                    <span className="h-9 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold inline-flex items-center">
                      Đã gửi yêu cầu mở khóa
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => xuLyLuu(false)}
                    disabled={dangLuu}
                    className="h-9 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Save className="size-4 text-blue-600" />
                    <span>Lưu nháp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => xuLyLuu(true)}
                    disabled={dangLuu}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    <span>
                      {tabChinh === 'bao_cao'
                        ? (trangThaiTab === 'can_dieu_chinh' ? `Nộp lại Báo cáo ${infoTuan.nhanTieuDe}` : `Nộp Báo cáo ${infoTuan.nhanTieuDe}`)
                        : (trangThaiTab === 'can_dieu_chinh' ? `Nộp lại Kế hoạch ${infoTuanToi.nhanTieuDe}` : `Nộp Kế hoạch ${infoTuanToi.nhanTieuDe}`)}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BANNER YÊU CẦU ĐIỀU CHỈNH */}
      {trangThaiTab === 'can_dieu_chinh' && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/70 text-xs shadow-2xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <MessageSquareWarning className="size-4 text-amber-600" />
            <span>Ý kiến yêu cầu điều chỉnh:</span>
          </div>
          <div className="text-amber-800 text-xs pl-6 italic font-medium">
            &ldquo;{ghiChuTab || 'Vui lòng rà soát và bổ sung chi tiết trước khi nộp lại.'}&rdquo;
          </div>
        </div>
      )}

      {/* BANNER KHI ĐÃ DUYỆT */}
      {trangThaiTab === 'da_duyet' && (
        <div className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 text-xs shadow-2xs flex items-center justify-between gap-3 flex-wrap animate-in fade-in">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              {tabChinh === 'bao_cao' ? `Báo cáo ${infoTuan.nhanTieuDe}` : `Kế hoạch ${infoTuanToi.nhanTieuDe}`} đã được phê duyệt chính thức.
            </span>
          </div>
          {laSepXemNhanVien && onDuyetBaoCao && (
            <button
              type="button"
              onClick={() => setModalYeuCauDieuChinh(true)}
              className="text-[11px] text-amber-800 hover:underline font-semibold cursor-pointer"
            >
              Mở lại điều chỉnh
            </button>
          )}
        </div>
      )}

      {/* THÔNG BÁO TÁC VỤ */}
      {thongBao && (
        <div
          className={cn(
            'p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-2xs',
            thongBao.loai === 'tc'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="font-semibold">{thongBao.nd}</span>
          </div>
          <button
            type="button"
            onClick={() => setThongBao(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* THANH ĐIỀU HƯỚNG 2 TAB: BÁO CÁO TUẦN QUA & KẾ HOẠCH TUẦN TỚI        */}
      {/* =================================================================== */}
      <div className="flex items-center gap-2 border-b border-border pb-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => setTabChinh('bao_cao')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer',
            tabChinh === 'bao_cao'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
          )}
        >
          <CalendarCheck className="size-4" />
          <span>BÁO CÁO {infoTuan.nhanTieuDe}</span>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold',
              tabChinh === 'bao_cao'
                ? 'bg-white/20 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {infoTuan.khoangNgayNhan}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabChinh('ke_hoach')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer',
            tabChinh === 'ke_hoach'
              ? 'bg-primary text-primary-foreground shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
          )}
        >
          <Target className="size-4" />
          <span>KẾ HOẠCH {infoTuanToi.nhanTieuDe}</span>
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold',
              tabChinh === 'ke_hoach'
                ? 'bg-white/20 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {infoTuanToi.khoangNgayNhan}
          </span>
        </button>
      </div>

      {/* TAB 1: BÁO CÁO TUẦN QUA */}
      {tabChinh === 'bao_cao' && (
        <div className="space-y-4 animate-in fade-in">
          {/* =================================================================== */}
          {/* KHỐI I: TỔNG KẾT ĐIỀU HÀNH (TRƯỞNG PHÒNG) HOẶC ĐÁNH GIÁ KPI (SALE)  */}
          {/* =================================================================== */}
          {laTruongPhongKD ? (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs space-y-4 p-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  I
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Tổng kết điều hành &amp; Kết quả toàn phòng tuần qua
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Tổng hợp tình hình kinh doanh, doanh thu thực tế và tiến độ của cả phòng trong tuần ({infoTuan.khoangNgayNhan}/{infoTuan.nam})
                  </p>
                </div>
              </div>

              {/* Cards 4 chỉ số tổng hợp toàn phòng */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50">
                  <span className="text-[11px] text-emerald-800 font-bold block">Tổng doanh thu thực tế</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                    {fmtTien(soLieuThucTeTuBanLamViec.doanhThu.thucTe)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Tiền về &amp; HĐ mới ký</span>
                </div>

                <div className="p-3 rounded-xl border border-purple-200/80 bg-purple-50/50">
                  <span className="text-[11px] text-purple-800 font-bold block">Hợp đồng ký kết</span>
                  <span className="text-base sm:text-lg font-black text-purple-700 font-mono">
                    {soLieuThucTeTuBanLamViec.hopDong.thucTe}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Hợp đồng toàn phòng</span>
                </div>

                <div className="p-3 rounded-xl border border-indigo-200/80 bg-indigo-50/50">
                  <span className="text-[11px] text-indigo-800 font-bold block">Dự án đang làm việc</span>
                  <span className="text-base sm:text-lg font-black text-indigo-700 font-mono">
                    {soLieuThucTeTuBanLamViec.duAnLamViec.thucTe}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Dự án có tác nghiệp</span>
                </div>

                <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50">
                  <span className="text-[11px] text-amber-800 font-bold block">Báo giá đã phát hành</span>
                  <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                    {soLieuThucTeTuBanLamViec.baoGia.thucTe}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Báo giá gửi khách</span>
                </div>
              </div>

              {/* 2 Ô Textarea nhận xét & Đề xuất */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Đánh giá tổng quan tình hình kinh doanh của Phòng:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={danhGiaTuanQuaTP}
                    onChange={(e) => setDanhGiaTuanQuaTP(e.target.value)}
                    placeholder="VD: Đội ngũ bám sát kế hoạch tuần, nhịp độ tiếp cận khách hàng mới duy trì tốt. Khâu hoàn thiện hồ sơ thầu cần đẩy nhanh hơn..."
                    className="w-full bg-transparent border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Khó khăn, vướng mắc &amp; Đề xuất gửi lên Ban Giám đốc:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={deXuatBanGiamDocTP}
                    onChange={(e) => setDeXuatBanGiamDocTP(e.target.value)}
                    placeholder="VD: Đề xuất Ban Giám đốc phê duyệt cơ chế phối hợp liên chi nhánh; Bổ sung thêm trang thiết bị đo đạc phục vụ dự án lớn..."
                    className="w-full bg-transparent border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs space-y-4 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    I
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Kết quả chỉ tiêu {infoTuan.nhanTieuDe} ({infoTuan.khoangNgayNhan})
                  </h3>
                </div>

                {!khoaChinhSua && (
                  <button
                    type="button"
                    onClick={dongBoLaiKPITuBanLamViec}
                    className="h-8 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="Quét lại kết quả thực tế mới nhất từ Lịch làm việc và CRM"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Cập nhật từ CRM</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/80">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-4 text-left">Chỉ tiêu</th>
                      <th className="py-2.5 px-3 text-center w-28">ĐVT</th>
                      <th className="py-2.5 px-4 text-right w-40">Mục tiêu</th>
                      <th className="py-2.5 px-4 text-right w-40">Thực tế</th>
                      <th className="py-2.5 px-3 text-center w-20">Đạt %</th>
                      <th className="py-2.5 px-3 text-center w-28">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[
                      {
                        stt: 1,
                        key: 'khachMoi' as const,
                        label: 'Khách hàng mới tiếp cận',
                        dvt: 'Khách hàng',
                        state: kpiKhachMoi,
                        setter: setKpiKhachMoi,
                        modalTitle: `Khách hàng mới tiếp cận — ${infoTuan.nhanTieuDe}`,
                        colorCls: 'text-blue-700',
                        crmCount: soLieuThucTeTuBanLamViec.khachMoi.danhSach.length
                      },
                      {
                        stt: 2,
                        key: 'baoGia' as const,
                        label: 'Báo giá đã gửi',
                        dvt: 'Báo giá',
                        state: kpiBaoGia,
                        setter: setKpiBaoGia,
                        modalTitle: `Báo giá đã gửi — ${infoTuan.nhanTieuDe}`,
                        colorCls: 'text-amber-700',
                        crmCount: soLieuThucTeTuBanLamViec.baoGia.danhSach.length
                      },
                      {
                        stt: 3,
                        key: 'duAnLamViec' as const,
                        label: 'Dự án đang làm việc',
                        dvt: 'Dự án',
                        state: kpiDuAnLamViec,
                        setter: setKpiDuAnLamViec,
                        modalTitle: `Dự án làm việc — ${infoTuan.nhanTieuDe}`,
                        colorCls: 'text-indigo-700',
                        crmCount: soLieuThucTeTuBanLamViec.duAnLamViec.danhSach.length
                      },
                      {
                        stt: 4,
                        key: 'hopDong' as const,
                        label: 'Hợp đồng ký kết',
                        dvt: 'Hợp đồng',
                        state: kpiHopDong,
                        setter: setKpiHopDong,
                        modalTitle: `Hợp đồng ký kết — ${infoTuan.nhanTieuDe}`,
                        colorCls: 'text-purple-700',
                        crmCount: soLieuThucTeTuBanLamViec.hopDong.danhSach.length
                      }
                    ].map((row) => {
                      const pct = row.state.keHoachTuanTruoc > 0
                        ? Math.round((row.state.thucTe / row.state.keHoachTuanTruoc) * 100)
                        : 0;
                      return (
                        <tr key={row.key} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">{row.stt}</td>
                          <td className="py-2.5 px-4 font-bold text-foreground">{row.label}</td>
                          <td className="py-2.5 px-3 text-center text-muted-foreground">{row.dvt}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-xs font-semibold text-slate-600 tabular-nums">
                            {row.state.keHoachTuanTruoc}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <input
                              type="number"
                              disabled={khoaChinhSua}
                              value={row.state.thucTe}
                              onChange={(e) => row.setter({ ...row.state, thucTe: Number(e.target.value), daSuaTay: true })}
                              className={cn('w-24 text-right font-mono text-xs font-bold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary disabled:opacity-70', row.colorCls)}
                            />
                            {row.state.daSuaTay && !khoaChinhSua && (
                              <button
                                type="button"
                                onClick={() =>
                                  row.setter((p) => ({
                                    ...p,
                                    thucTe: soLieuThucTeTuBanLamViec[row.key].thucTe,
                                    daSuaTay: false
                                  }))
                                }
                                className="text-[10px] text-blue-600 hover:underline block ml-auto mt-0.5 cursor-pointer"
                              >
                                Khôi phục CRM
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 tabular-nums">
                            {pct}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                moModalDrillDown(row.key, row.modalTitle, soLieuThucTeTuBanLamViec[row.key].chiTiet)
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold cursor-pointer transition"
                            >
                              {row.crmCount} mục
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Dòng 5: Doanh thu */}
                    <tr className="hover:bg-muted/20 bg-emerald-500/[0.03]">
                      <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">5</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-950">Doanh số hợp đồng ký mới</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">VNĐ</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs font-semibold text-slate-600 tabular-nums">
                        {fmtTien(kpiDoanhThu.keHoachTuanTruoc)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <ONhapSoTien
                          disabled={khoaChinhSua}
                          giaTri={kpiDoanhThu.thucTe}
                          onChange={(val) => setKpiDoanhThu({ ...kpiDoanhThu, thucTe: val, daSuaTay: true })}
                          className="w-32 text-right font-mono text-xs font-bold text-emerald-700 bg-transparent border border-border/80 rounded px-2 py-0.5 focus:border-primary disabled:opacity-70"
                        />
                        {kpiDoanhThu.daSuaTay && !khoaChinhSua && (
                          <button
                            type="button"
                            onClick={() =>
                              setKpiDoanhThu((p) => ({
                                ...p,
                                thucTe: soLieuThucTeTuBanLamViec.doanhThu.thucTe,
                                daSuaTay: false
                              }))
                            }
                            className="text-[10px] text-blue-600 hover:underline block ml-auto mt-0.5 cursor-pointer"
                          >
                            Khôi phục CRM
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 tabular-nums">
                        {kpiDoanhThu.keHoachTuanTruoc > 0
                          ? Math.round((kpiDoanhThu.thucTe / kpiDoanhThu.keHoachTuanTruoc) * 100)
                          : 0}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            moModalDrillDown('doanhThu', `Doanh số ký mới — ${infoTuan.nhanTieuDe}`, soLieuThucTeTuBanLamViec.doanhThu.chiTiet, true)
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold cursor-pointer transition"
                        >
                          {soLieuThucTeTuBanLamViec.doanhThu.danhSach.length} mục
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              II
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
              Lịch công tác {infoTuan.nhanTieuDe} ({infoTuan.khoangNgayNhan})
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                Tổng: <b>{thongKeLichTuanQua.tong}</b> lịch
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
                Đạt: <b>{thongKeLichTuanQua.xong}</b>
              </span>
              {thongKeLichTuanQua.chua > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200 text-[11px]">
                  Chưa báo cáo: <b>{thongKeLichTuanQua.chua}</b>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMoLichTuanQua((v) => !v)}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title={moLichTuanQua ? 'Thu gọn' : 'Mở rộng'}
            >
              {moLichTuanQua ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>

        {moLichTuanQua && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-4 text-left w-36 sm:w-44">Thứ / Ngày</th>
                  <th className="py-2.5 px-4 text-left">Chi tiết cuộc hẹn &amp; Kết quả thực tế đạt được</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {danhSach7NgayTuanQua.map((ngayItem) => (
                  <tr key={ngayItem.ngayISO} className="hover:bg-muted/20">
                    <td className="py-3 px-3 text-center font-bold text-muted-foreground align-top">
                      {ngayItem.thuIndex}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground align-top whitespace-nowrap">
                      {ngayItem.tenThuNgay}
                      <span className="block text-[10.5px] font-normal text-muted-foreground mt-0.5">
                        {ngayItem.danhSachLich.length > 0
                          ? `${ngayItem.danhSachLich.length} lịch hẹn`
                          : 'Không có lịch'}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-top">
                      {ngayItem.danhSachLich.length === 0 ? (
                        <span className="text-muted-foreground/60 italic text-[11px]">
                          Không có lịch công tác ghi nhận trong ngày này
                        </span>
                      ) : (
                        <div className="space-y-2">
                          {ngayItem.danhSachLich.map((l) => {
                            const daXong = l.trang_thai === 'da_hoan_thanh';
                            const daHuy = l.trang_thai === 'huy' || l.trang_thai === 'doi_lich';

                            return (
                              <div
                                key={l.id}
                                className="p-2.5 rounded-xl border border-border/70 bg-card/60 flex items-start justify-between gap-3 flex-wrap"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] font-bold text-primary">
                                      [{l.gio_bat_dau || 'Lịch hẹn'}]
                                    </span>
                                    {l.loai_lich === 'van_phong' ? (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9.5px] font-bold">
                                        🏢 Việc VP
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9.5px] font-bold">
                                        🚗 Công tác
                                      </span>
                                    )}
                                    <span className="font-bold text-foreground text-xs">
                                      {l.ten_khach_hang || l.tieu_de}
                                    </span>
                                    {l.dia_diem && (
                                      <span className="text-muted-foreground text-[11px] inline-flex items-center gap-0.5">
                                        <MapPin className="size-3 shrink-0" />
                                        {l.dia_diem}
                                      </span>
                                    )}
                                    {l.la_tiep_can_moi && (
                                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                                        Tiếp cận mới
                                      </span>
                                    )}
                                    {l.la_phat_sinh && (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9.5px] font-bold">
                                        Phát sinh
                                      </span>
                                    )}
                                  </div>

                                  {(l.noi_dung || l.tieu_de) && (
                                    <div className="text-[11px] text-muted-foreground">
                                      <b>Nội dung hẹn:</b> {l.noi_dung || l.tieu_de}
                                    </div>
                                  )}

                                  {daXong && l.ket_qua && (
                                    <div className="text-[11.5px] text-emerald-800 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200/80">
                                      <b>Kết quả thực tế:</b> {l.ket_qua}
                                    </div>
                                  )}

                                  {daHuy && l.ly_do_doi_huy && (
                                    <div className="text-[11px] text-rose-800 bg-rose-50/70 p-1.5 rounded-lg border border-rose-200/80">
                                      <b>Lý do hoãn/hủy:</b> {l.ly_do_doi_huy}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                      daXong
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : daHuy
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    )}
                                  >
                                    {daXong
                                      ? 'Đã hoàn thành'
                                      : daHuy
                                      ? 'Đã dời / Hủy'
                                      : 'Chưa có kết quả'}
                                  </span>

                                  {onCapNhatKetQuaLich && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModalBaoCaoNhanhLich({
                                          lich: l,
                                          ketQua: l.ket_qua || ''
                                        })
                                      }
                                      className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit2 className="size-3" />
                                      <span>{l.ket_qua ? 'Sửa kết quả' : 'Ghi kết quả'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </div>
      )}

      {/* TAB 2: KẾ HOẠCH TUẦN TỚI */}
      {tabChinh === 'ke_hoach' && (
        <div className="space-y-4 animate-in fade-in">
          {/* =================================================================== */}
          {/* KHỐI III: ĐỊNH HƯỚNG ĐIỀU HÀNH (TRƯỞNG PHÒNG) HOẶC CAM KẾT (SALE)  */}
          {/* =================================================================== */}
          {laTruongPhongKD ? (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs space-y-4 p-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  III
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Định hướng &amp; Trọng tâm điều hành tuần tới (Trưởng phòng Kinh doanh)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Mục tiêu doanh thu toàn phòng, trọng tâm chỉ đạo và kế hoạch đồng hành hỗ trợ nhân viên ({infoTuanToi.khoangNgayNhan}/{infoTuanToi.nam})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/40">
                  <label className="text-xs font-bold text-foreground block">
                    Mục tiêu Doanh thu toàn phòng tuần tới (Target):
                  </label>
                  <div className="flex items-center gap-2">
                    <ONhapSoTien
                      giaTri={dieuHanhTP.mucTieuDoanhThuPhong}
                      onChange={(val) => setDieuHanhTP((prev) => ({ ...prev, mucTieuDoanhThuPhong: val }))}
                      className="w-full text-left sm:text-right font-mono text-sm font-black text-blue-700 bg-background border border-border/80 rounded-lg px-3 py-1.5 focus:border-primary"
                    />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground block">Kế hoạch doanh thu ký mới &amp; dòng tiền về của cả phòng</span>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl border border-purple-200/80 bg-purple-50/40">
                  <label className="text-xs font-bold text-foreground block">
                    Số Hợp đồng toàn phòng dự kiến chốt:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dieuHanhTP.soHopDongDuKien !== undefined && dieuHanhTP.soHopDongDuKien !== null ? dieuHanhTP.soHopDongDuKien : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setDieuHanhTP((prev) => ({ ...prev, soHopDongDuKien: val }));
                      }}
                      className="w-full text-left sm:text-right font-mono text-sm font-black text-purple-700 bg-background border border-border/80 rounded-lg px-3 py-1.5 focus:border-primary"
                    />
                    <span className="text-xs font-bold text-muted-foreground shrink-0">Hợp đồng</span>
                  </div>
                  <span className="text-[10.5px] text-muted-foreground block">Tổng số deal dự kiến chuyển sang giai đoạn ký kết</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    Trọng tâm điều hành &amp; Chỉ đạo tuần tới:
                  </label>
                  <textarea
                    rows={3}
                    value={dieuHanhTP.trongTamDieuHanh}
                    onChange={(e) => setDieuHanhTP({ ...dieuHanhTP, trongTamDieuHanh: e.target.value })}
                    placeholder="VD: Tập trung đôn đốc các dự án thuộc nhóm tiềm năng cao; Họp rà soát tiến độ gửi báo giá vào sáng Thứ 4..."
                    className="w-full bg-transparent border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    Kế hoạch đồng hành &amp; Hỗ trợ đội ngũ nhân sự:
                  </label>
                  <textarea
                    rows={3}
                    value={dieuHanhTP.keHoachHoTroNhanSu}
                    onChange={(e) => setDieuHanhTP({ ...dieuHanhTP, keHoachHoTroNhanSu: e.target.value })}
                    placeholder="VD: Đi cùng bạn Nam gặp đại diện CĐT Viglacera đàm phán hợp đồng; Đào tạo kỹ năng phân tích hồ sơ thầu cho nhân sự mới..."
                    className="w-full bg-transparent border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs space-y-4 p-4">
              <div className="bg-muted/50 -m-4 mb-0 px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    I
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Chỉ tiêu cam kết {infoTuanToi.nhanTieuDe} ({infoTuanToi.khoangNgayNhan})
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/80">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-[11px] text-muted-foreground font-bold uppercase">
                      <th className="py-2.5 px-3 text-center w-12">STT</th>
                      <th className="py-2.5 px-4 text-left">Chỉ tiêu</th>
                      <th className="py-2.5 px-3 text-center w-28">ĐVT</th>
                      <th className="py-2.5 px-4 text-right w-40">Thực tế {infoTuan.nhanTieuDe}</th>
                      <th className="py-2.5 px-4 text-right w-48">Cam kết {infoTuanToi.nhanTieuDe}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[
                      {
                        stt: 1,
                        label: 'Khách hàng mới tiếp cận',
                        dvt: 'Khách hàng',
                        thucTe: kpiKhachMoi.thucTe,
                        val: camKet.khachMoi.target,
                        onChange: (n: number) => setCamKet({ ...camKet, khachMoi: { ...camKet.khachMoi, target: n } }),
                        colorCls: 'text-blue-700'
                      },
                      {
                        stt: 2,
                        label: 'Báo giá dự kiến gửi',
                        dvt: 'Báo giá',
                        thucTe: kpiBaoGia.thucTe,
                        val: camKet.baoGia.target,
                        onChange: (n: number) => setCamKet({ ...camKet, baoGia: { ...camKet.baoGia, target: n } }),
                        colorCls: 'text-amber-700'
                      },
                      {
                        stt: 3,
                        label: 'Dự án dự kiến làm việc',
                        dvt: 'Dự án',
                        thucTe: kpiDuAnLamViec.thucTe,
                        val: camKet.duAnLamViec.target,
                        onChange: (n: number) => setCamKet({ ...camKet, duAnLamViec: { ...camKet.duAnLamViec, target: n } }),
                        colorCls: 'text-indigo-700'
                      },
                      {
                        stt: 4,
                        label: 'Hợp đồng ký mới',
                        dvt: 'Hợp đồng',
                        thucTe: kpiHopDong.thucTe,
                        val: camKet.hopDong.target,
                        onChange: (n: number) => setCamKet({ ...camKet, hopDong: { ...camKet.hopDong, target: n } }),
                        colorCls: 'text-purple-700'
                      }
                    ].map((r) => (
                      <tr key={r.stt} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">{r.stt}</td>
                        <td className="py-2.5 px-4 font-bold text-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{r.dvt}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">{r.thucTe}</td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            disabled={khoaChinhSua}
                            value={r.val}
                            onChange={(e) => r.onChange(Number(e.target.value))}
                            className={cn('w-28 text-right font-mono text-xs font-bold bg-background border border-border/80 rounded px-2 py-1 focus:border-primary disabled:opacity-70', r.colorCls)}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-muted/20 bg-emerald-500/[0.03]">
                      <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">5</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-950">Doanh số hợp đồng dự kiến</td>
                      <td className="py-2.5 px-3 text-center text-muted-foreground">VNĐ</td>
                      <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">{fmtTien(kpiDoanhThu.thucTe)}</td>
                      <td className="py-2.5 px-4 text-right">
                        <ONhapSoTien
                          disabled={khoaChinhSua}
                          giaTri={camKet.doanhThu.target}
                          onChange={(val) => setCamKet({ ...camKet, doanhThu: { ...camKet.doanhThu, target: val } })}
                          className="w-36 text-right font-mono text-xs font-bold text-emerald-700 bg-background border border-border/80 rounded px-2 py-1 focus:border-primary disabled:opacity-70"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs space-y-4 p-4">
            <div className="bg-muted/50 -m-4 mb-0 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  II
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                  {laTruongPhongKD ? `Lịch làm việc & Điều hành ${infoTuanToi.nhanTieuDe}` : `Lịch làm việc ${infoTuanToi.nhanTieuDe}`} ({infoTuanToi.khoangNgayNhan})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!khoaChinhSua && (
                  <button
                    type="button"
                    onClick={taiLaiLichTuBanLamViec}
                    className="h-8 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Tải lại từ Lịch làm việc</span>
                  </button>
                )}
                <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-lg">
                  {infoTuanToi.khoangNgayNhan}/{infoTuanToi.nam}
                </span>
              </div>
            </div>

            {/* DANH SÁCH 7 THẺ NGÀY TRỰC QUAN */}
            <div className="space-y-3 pt-2">
              {danhSach7NgayTuanToi.map((d) => (
                <div
                  key={d.ngayISO}
                  className="rounded-xl border border-border/80 bg-background/80 hover:border-primary/40 transition-colors p-3.5 flex flex-col md:flex-row md:items-start gap-4 shadow-2xs"
                >
                  {/* Cột Thứ & Ngày */}
                  <div className="w-full md:w-44 shrink-0 flex md:flex-col items-center md:items-start justify-between gap-1 border-b md:border-b-0 md:border-r border-border/60 pb-2 md:pb-0 md:pr-3">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-md bg-muted text-muted-foreground font-black text-xs flex items-center justify-center">
                        {d.thuIndex}
                      </span>
                      <span className="font-extrabold text-foreground text-xs">{d.tenThuNgay}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {d.soLich > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 text-[10.5px] font-bold">
                          {d.soLich} việc / lịch
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-muted-foreground">Chưa có lịch</span>
                      )}
                    </div>
                  </div>

                  {/* Cột Danh sách việc từ Lịch làm việc & Textarea ghi chú */}
                  <div className="flex-1 space-y-2.5 min-w-0">
                    {/* Danh sách các việc đã có từ CRM */}
                    {d.tongHopArray && d.tongHopArray.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {d.tongHopArray.map((dong, vIdx) => (
                          <div
                            key={vIdx}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-border/70 bg-muted/40 text-foreground flex items-center gap-1.5"
                          >
                            <CalendarCheck className="size-3 text-primary shrink-0" />
                            <span className="font-medium">{dong}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ô nhập kế hoạch / ghi chú ngày bổ sung */}
                    <div className="space-y-1">
                      <textarea
                        rows={2}
                        disabled={khoaChinhSua}
                        value={d.ghiChuPhatSinh}
                        onChange={(e) =>
                          setGhiChuLichNgay({ ...ghiChuLichNgay, [d.ngayISO]: e.target.value })
                        }
                        placeholder="Ghi chú & công việc phát sinh thêm trong ngày (nếu có)..."
                        className="w-full bg-card border border-border/80 rounded-xl p-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!laTruongPhongKD && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    III
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                    Dự án trọng điểm {infoTuanToi.nhanTieuDe} ({dsDuAnTrongDiem.length})
                  </h3>
                </div>

              {!khoaChinhSua && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMoModalChonDA(true)}
                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Chọn / Thay đổi dự án</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-4 text-left">Tên dự án &amp; Khách hàng / CĐT</th>
                    <th className="py-2.5 px-4 text-left">{laTruongPhongKD ? 'Nhân sự phụ trách' : 'Người liên hệ & SĐT'}</th>
                    <th className="py-2.5 px-4 text-right w-40">Giá trị dự toán / HĐ</th>
                    <th className="py-2.5 px-4 text-left w-36">Giai đoạn dự án</th>
                    <th className="py-2.5 px-3 text-center w-36">Mức độ tiềm năng</th>
                    <th className="py-2.5 px-4 text-left w-44">Sản phẩm / Dịch vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {dsDuAnTrongDiem.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                        Chưa có dự án trọng điểm nào được chọn. Bấm nút &quot;Chọn / Thay đổi dự án&quot; phía trên.
                      </td>
                    </tr>
                  ) : (
                    dsDuAnTrongDiem.map((d, idx) => {
                      const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
                      const nlh = d.nguoi_lien_he_id ? mapNLH.get(d.nguoi_lien_he_id) : null;
                      const nsPhuTrach = d.nguoi_phu_trach_id ? mapNS.get(d.nguoi_phu_trach_id) : null;
                      const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
                      const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.trung_binh;
                      const sp = d.san_pham_dich_vu_id ? mapSP.get(d.san_pham_dich_vu_id) : d.san_pham_khac_mo_ta;

                      return (
                        <tr key={d.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-extrabold text-foreground">{d.ten_du_an}</div>
                            {kh && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Building2 className="size-3 text-muted-foreground shrink-0" />
                                <span>CĐT: {kh.ten_khach_hang}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {laTruongPhongKD ? (
                              <div>
                                <div className="font-bold text-foreground">
                                  {nsPhuTrach?.ho_va_ten || 'Chưa phân công'}
                                </div>
                                {nsPhuTrach?.so_dien_thoai && (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                    <Phone className="size-3 text-muted-foreground shrink-0" />
                                    <span>{nsPhuTrach.so_dien_thoai}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-foreground">
                                  {nlh?.ho_va_ten || kh?.so_dien_thoai || '—'}
                                </div>
                                {(nlh?.so_dien_thoai || kh?.so_dien_thoai) && (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                    <Phone className="size-3 text-muted-foreground shrink-0" />
                                    <span>{nlh?.so_dien_thoai || kh?.so_dien_thoai}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-foreground">
                            {fmtTien(d.gia_tri_hop_dong || d.gia_tri_du_kien)}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-muted text-foreground border border-border/80">
                              {cfgGD.nhan_ngan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1',
                                cfgTN.badgeCls
                              )}
                            >
                              <span>{cfgTN.nhan}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground font-medium">
                            {sp || 'Khảo sát / Đo đạc'}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* Dòng Tổng giá trị dự án trọng điểm */}
                  <tr className="bg-blue-500/[0.04] font-bold text-xs border-t border-blue-500/20">
                    <td colSpan={3} className="py-3 px-4 text-left text-blue-950 font-black">
                      TỔNG GIÁ TRỊ DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-primary font-black text-sm">
                      {fmtTien(tongGiaTriDealTrongDiem)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                      Số dự án bám sát:
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-primary font-mono">
                      {dsDuAnTrongDiem.length} dự án
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* MODAL DRILL-DOWN CHI TIẾT SỐ LIỆU KPI KHỐI I (INTERACTIVE CHECKLIST) */}
      {modalDrillDownKPI.mo && (() => {
        const dsChon = modalDrillDownKPI.danhSach.filter((m) => m.daChon);
        const tongTienChon = dsChon.reduce((sum, m) => sum + Number(m.soTien || 0), 0);
        const tatCaDaChon = modalDrillDownKPI.danhSach.length > 0 && dsChon.length === modalDrillDownKPI.danhSach.length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-start justify-between gap-3 bg-muted/40">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    <span>{modalDrillDownKPI.tieuDe}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {modalDrillDownKPI.moTa} • Tick chọn hoặc bỏ chọn để cập nhật số thực tế
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalDrillDownKPI((p) => ({ ...p, mo: false }))}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Toolbar */}
              <div className="px-4 py-2.5 border-b border-border/80 flex items-center justify-between gap-2 bg-background flex-wrap text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => chonTatCa(!tatCaDaChon)}
                    className="px-2.5 py-1 rounded-lg border border-border hover:bg-muted font-medium text-foreground cursor-pointer"
                  >
                    {tatCaDaChon ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <span className="text-muted-foreground text-[11px]">
                    Đã chọn <b className="text-primary font-bold">{dsChon.length}</b>/{modalDrillDownKPI.danhSach.length} mục
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDangThemNhanh((v) => !v)}
                  className="px-2.5 py-1 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Thêm mục ngoài hệ thống</span>
                </button>
              </div>

              {/* Form thêm nhanh mục ngoài */}
              {dangThemNhanh && (
                <div className="p-3.5 bg-blue-50/50 border-b border-blue-200/80 text-xs animate-in slide-in-from-top-2">
                  <div className="font-bold text-blue-900 mb-2">Thêm mục phát sinh thực tế ngoài hệ thống:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Tên khách hàng / dự án / việc..."
                      value={mucThemMoi.tieuDe}
                      onChange={(e) => setMucThemMoi({ ...mucThemMoi, tieuDe: e.target.value })}
                      className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Ghi chú (kết quả / người liên hệ)..."
                      value={mucThemMoi.moTa}
                      onChange={(e) => setMucThemMoi({ ...mucThemMoi, moTa: e.target.value })}
                      className="px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
                    />
                  </div>
                  {modalDrillDownKPI.laTien && (
                    <div className="mb-2">
                      <ONhapSoTien
                        giaTri={mucThemMoi.soTien}
                        onChange={(val) => setMucThemMoi({ ...mucThemMoi, soTien: val })}
                        placeholder="Số tiền thực tế (VNĐ)..."
                        className="w-full sm:w-60 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDangThemNhanh(false)}
                      className="px-3 py-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={themMucPhatSinhNgoai}
                      disabled={!mucThemMoi.tieuDe.trim()}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      Thêm vào danh sách
                    </button>
                  </div>
                </div>
              )}

              {/* Danh sách checklist */}
              <div className="p-4 overflow-y-auto divide-y divide-border/60 max-h-[380px] text-xs">
                {modalDrillDownKPI.danhSach.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Chưa có mục nào được ghi nhận. Bạn có thể bấm "Thêm mục ngoài hệ thống" ở trên để bổ sung.
                  </div>
                ) : (
                  modalDrillDownKPI.danhSach.map((item) => {
                    const laPhatSinhNgoai = item.id.startsWith('ngoai_');
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'py-2.5 px-2 rounded-xl flex items-start justify-between gap-3 transition-colors',
                          item.daChon ? 'bg-primary/5 hover:bg-primary/10' : 'opacity-60 hover:opacity-100 hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={Boolean(item.daChon)}
                            onChange={() => toggleChonMuc(item.id)}
                            className="mt-1 size-4 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground">{item.tieuDe}</span>
                              {item.loaiNguon && (
                                <span
                                  className={cn(
                                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                    item.loaiNguon === 'Bàn làm việc' && 'bg-blue-100 text-blue-800',
                                    item.loaiNguon === 'Lịch làm việc' || item.loaiNguon === 'Lịch công tác' && 'bg-amber-100 text-amber-800',
                                    item.loaiNguon === 'Hồ sơ dự án' && 'bg-purple-100 text-purple-800',
                                    item.loaiNguon === 'Phát sinh ngoài' && 'bg-emerald-100 text-emerald-800',
                                    item.loaiNguon === 'Hợp đồng ký mới' && 'bg-emerald-100 text-emerald-800',
                                    item.loaiNguon === 'Dòng tiền về thực tế' && 'bg-teal-100 text-teal-800'
                                  )}
                                >
                                  {item.loaiNguon}
                                </span>
                              )}
                            </div>
                            {item.moTa && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {item.moTa}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {modalDrillDownKPI.laTien && item.soTien !== undefined && (
                            <span className="font-mono text-xs font-bold text-emerald-700">
                              {fmtTien(item.soTien)}
                            </span>
                          )}
                          {laPhatSinhNgoai && (
                            <button
                              type="button"
                              onClick={() => xoaMucPhatSinh(item.id)}
                              className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                              title="Xóa mục phát sinh này"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3.5 bg-muted/40 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs">
                  {modalDrillDownKPI.laTien ? (
                    <span>
                      Tổng doanh thu chọn: <b className="text-emerald-700 font-mono text-sm">{fmtTien(tongTienChon)}</b>
                    </span>
                  ) : (
                    <span>
                      Đã chọn: <b className="text-primary font-bold">{dsChon.length}</b> mục thực tế
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalDrillDownKPI((p) => ({ ...p, mo: false }))}
                    className="h-8.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                  {!khoaChinhSua && (
                    <button
                      type="button"
                      onClick={apDungVaoBaoCao}
                      className="h-8.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>Áp dụng vào báo cáo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL CHỌN THÊM DỰ ÁN TRỌNG ĐIỂM (KHỐI II) */}
      {moModalChonDA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">
                  Chọn dự án trọng điểm đang bám sát
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đánh dấu các dự án có tiềm năng cao để đưa vào danh mục theo dõi tuần
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoModalChonDA(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-border/60 max-h-[460px] text-xs">
              {dsDuAnTiemNangCaoNV.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Không có dự án nào có mức tiềm năng Cao hoặc Rất cao đang theo dõi.
                </div>
              ) : (
                dsDuAnTiemNangCaoNV.map((d) => {
                  const daChon = idsDuAnChon.includes(d.id);
                  const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
                  const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
                  const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.trung_binh;

                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        if (daChon) {
                          setIdsDuAnChon(idsDuAnChon.filter((id) => id !== d.id));
                        } else {
                          setIdsDuAnChon([...idsDuAnChon, d.id]);
                        }
                      }}
                      className={cn(
                        'p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition my-1',
                        daChon
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            'size-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition',
                            daChon
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border bg-card'
                          )}
                        >
                          {daChon && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-xs truncate">
                            {d.ten_du_an}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {kh ? `CĐT: ${kh.ten_khach_hang}` : 'Chưa gắn KH'} · Giai đoạn:{' '}
                            <span className="font-semibold text-foreground">{cfgGD.nhan_ngan}</span>
                            {laTruongPhongKD && (
                              <span className="ml-2 font-medium text-blue-700">
                                · Phụ trách: {mapNS.get(d.nguoi_phu_trach_id || '')?.ho_va_ten || 'Chưa gán'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            cfgTN.badgeCls
                          )}
                        >
                          {cfgTN.nhan}
                        </span>
                        <span className="font-mono font-bold text-foreground text-xs">
                          {fmtTien(d.gia_tri_hop_dong || d.gia_tri_du_kien)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Đã chọn <strong className="text-foreground">{idsDuAnChon.length}</strong> dự án trọng điểm
              </span>
              <button
                type="button"
                onClick={() => setMoModalChonDA(false)}
                className="h-8.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL YÊU CẦU MỞ KHÓA SAU KHI ĐÃ CHỐT */}
      {modalMoKhoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <RotateCcw className="size-4 text-amber-600" />
                <span>Yêu cầu mở khóa báo cáo đã chốt</span>
              </div>
              <button
                type="button"
                onClick={() => setModalMoKhoa(false)}
                className="p-1 rounded-lg hover:bg-amber-100 text-amber-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <textarea
                rows={3}
                value={lyDoMoKhoa}
                onChange={(e) => setLyDoMoKhoa(e.target.value)}
                placeholder="Nhập lý do cần mở khóa để điều chỉnh..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                autoFocus
              />
            </div>
            <div className="p-3 bg-muted/40 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalMoKhoa(false)}
                className="h-8.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={dangDuyet || !lyDoMoKhoa.trim()}
                onClick={async () => {
                  if (!onYeuCauMoKhoa) return;
                  setDangDuyet(true);
                  try {
                    await onYeuCauMoKhoa(lyDoMoKhoa.trim(), tabChinh);
                    setModalMoKhoa(false);
                    setThongBao({ loai: 'tc', nd: 'Đã gửi yêu cầu mở khóa tới Quản lý.' });
                  } finally {
                    setDangDuyet(false);
                  }
                }}
                className="h-8.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL YÊU CẦU ĐIỀU CHỈNH (DÀNH CHO TRƯỞNG PHÒNG) */}
      {modalYeuCauDieuChinh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <MessageSquareWarning className="size-4 text-amber-600" />
                <span>Ý kiến định hướng / Yêu cầu điều chỉnh kế hoạch</span>
              </div>
              <button
                type="button"
                onClick={() => setModalYeuCauDieuChinh(false)}
                className="p-1 rounded-lg hover:bg-amber-100 text-amber-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-muted-foreground">
                Nhập lời dặn, định hướng mục tiêu hoặc các điểm nhân sự ({nhanSu.ho_va_ten}) cần hoàn thiện thêm trước khi phê duyệt:
              </p>
              <textarea
                rows={4}
                value={ghiChuYeuCau}
                onChange={(e) => setGhiChuYeuCau(e.target.value)}
                placeholder="VD: Cần bổ sung lịch làm việc Thứ 5 với UBND Huyện; Mục tiêu số báo giá tuần tới nên nâng lên 5..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="p-3 bg-muted/40 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalYeuCauDieuChinh(false)}
                className="h-8.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={dangDuyet || !ghiChuYeuCau.trim()}
                onClick={async () => {
                  if (!onDuyetBaoCao) return;
                  setDangDuyet(true);
                  try {
                    await onDuyetBaoCao('can_dieu_chinh', ghiChuYeuCau.trim(), tabChinh);
                    setModalYeuCauDieuChinh(false);
                    setGhiChuYeuCau('');
                    setThongBao({ loai: 'tc', nd: 'Đã gửi ý kiến định hướng yêu cầu điều chỉnh cho nhân sự!' });
                  } finally {
                    setDangDuyet(false);
                  }
                }}
                className="h-8.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>{dangDuyet ? 'Đang gửi...' : 'Gửi ý kiến cho nhân sự'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BÁO CÁO NHANH KẾT QUẢ CUỘC HẸN TUẦN QUA */}
      {modalBaoCaoNhanhLich.lich && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <CalendarCheck className="size-4 text-blue-600" />
                <span>Báo cáo kết quả cuộc hẹn</span>
              </div>
              <button
                type="button"
                onClick={() => setModalBaoCaoNhanhLich({ lich: null, ketQua: '' })}
                className="p-1 rounded-lg hover:bg-blue-100 text-blue-800 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="font-bold text-foreground">
                {modalBaoCaoNhanhLich.lich.ten_khach_hang} ({modalBaoCaoNhanhLich.lich.ngay})
              </div>
              <p className="text-muted-foreground text-[11px]">
                Nội dung cuộc hẹn: {modalBaoCaoNhanhLich.lich.noi_dung || modalBaoCaoNhanhLich.lich.tieu_de || 'Lịch công tác'}
              </p>
              <div className="space-y-1">
                <label className="font-bold text-foreground block">Kết quả thực tế đạt được:</label>
                <textarea
                  rows={3}
                  value={modalBaoCaoNhanhLich.ketQua}
                  onChange={(e) => setModalBaoCaoNhanhLich((p) => ({ ...p, ketQua: e.target.value }))}
                  placeholder="VD: Đã gặp anh Hùng (Trưởng phòng), khách hàng đồng ý chủ trương và hẹn gửi báo giá trước Thứ 4..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="p-3 bg-muted/40 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalBaoCaoNhanhLich({ lich: null, ketQua: '' })}
                className="h-8.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={dangLuuBaoCaoLich || !modalBaoCaoNhanhLich.ketQua.trim()}
                onClick={async () => {
                  if (!onCapNhatKetQuaLich || !modalBaoCaoNhanhLich.lich) return;
                  setDangLuuBaoCaoLich(true);
                  try {
                    await onCapNhatKetQuaLich(modalBaoCaoNhanhLich.lich, modalBaoCaoNhanhLich.ketQua.trim());
                    setModalBaoCaoNhanhLich({ lich: null, ketQua: '' });
                    setThongBao({ loai: 'tc', nd: 'Đã cập nhật kết quả cuộc hẹn thành công!' });
                  } finally {
                    setDangLuuBaoCaoLich(false);
                  }
                }}
                className="h-8.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="size-3.5" />
                <span>{dangLuuBaoCaoLich ? 'Đang lưu...' : 'Lưu kết quả'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
