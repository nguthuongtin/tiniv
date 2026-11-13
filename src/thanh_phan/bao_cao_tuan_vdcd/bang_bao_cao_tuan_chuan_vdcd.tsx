'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { SanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import type { KeHoachTuan, ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';
import { kiemTraViecThuocNgay } from '../ke_hoach/ban_lam_viec_hang_ngay';
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
  const [chuoi, setChuoi] = useState(() => (giaTri ? Number(giaTri).toLocaleString('vi-VN') : ''));

  useEffect(() => {
    setChuoi(giaTri ? Number(giaTri).toLocaleString('vi-VN') : '');
  }, [giaTri]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={chuoi}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const num = raw ? parseInt(raw, 10) : 0;
        setChuoi(raw ? Number(raw).toLocaleString('vi-VN') : '');
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
  baoCaoHienTai: BaoCaoTuanVDCD | null;
  baoCaoTuanTruoc?: BaoCaoTuanVDCD | null;
  keHoachTuanNay?: KeHoachTuan | null;
  keHoachTuanToi?: KeHoachTuan | null;
  onLuuBaoCao: (capNhat: Partial<BaoCaoTuanVDCD>, nopBaoCao: boolean) => Promise<void>;
  laQuanLy: boolean;
}

export default function BangBaoCaoTuanChuanVDCD({
  tuan,
  nhanSu,
  dsDuAn,
  dsKhachHang,
  dsNguoiLienHe,
  dsSanPham,
  dsLichGap,
  baoCaoHienTai,
  baoCaoTuanTruoc,
  keHoachTuanNay,
  keHoachTuanToi,
  onLuuBaoCao,
  laQuanLy
}: Props) {
  const infoTuan = useMemo(() => phanTichTuanISO(tuan), [tuan]);
  const tuanToiISO = useMemo(() => dichChuyenTuanISO(tuan, 1), [tuan]);
  const infoTuanToi = useMemo(() => phanTichTuanISO(tuanToiISO), [tuanToiISO]);

  const mapKH = useMemo(() => new Map(dsKhachHang.map((k) => [k.id, k])), [dsKhachHang]);
  const mapNLH = useMemo(() => new Map(dsNguoiLienHe.map((n) => [n.id, n])), [dsNguoiLienHe]);
  const mapSP = useMemo(() => new Map(dsSanPham.map((s) => [s.id, s.ten_san_pham])), [dsSanPham]);

  // Dự án thuộc sở hữu của nhân sự
  const dsDuAnCuaNV = useMemo(() => {
    return dsDuAn.filter(
      (d) =>
        d.trang_thai !== 'da_xoa' &&
        (d.nguoi_phu_trach_id === nhanSu.id ||
          d.nguoi_quan_ly_id === nhanSu.id ||
          (!d.nguoi_phu_trach_id && d.nguoi_tao_id === nhanSu.id))
    );
  }, [dsDuAn, nhanSu.id]);

  // --------------------------------------------------------------------------
  // CƠ CHẾ THEO DÕI TỰ ĐỘNG THÔNG MINH TỪ BÀN LÀM VIỆC & CRM (KHỐI I)
  // Thứ tự 5 chỉ số:
  // 1. Số lượng KH mới tiếp cận (từ Bàn làm việc & Lịch gặp)
  // 2. Tổng số báo giá đã gửi trong tuần (dự án chuyển sang báo giá & việc gửi BG)
  // 3. Tổng số dự án đã làm việc trong tuần (tập hợp dự án có tác nghiệp/bám sát)
  // 4. Số hợp đồng ký kết trong tuần (sự kiện ký HĐ thật sự & việc hoàn thành)
  // 5. Tổng doanh thu đã thu về trong tuần (Doanh số HĐ mới ký + dòng tiền thực về)
  // --------------------------------------------------------------------------
  const soLieuThucTeTuBanLamViec = useMemo(() => {
    const viecTuanNay = keHoachTuanNay?.danh_sach_tac_chien || [];

    // 1. Khách hàng mới tiếp cận:
    // Quét từ Bàn làm việc & Lịch gặp (các cuộc gặp/gọi hoặc tác nghiệp gắn nhãn tiếp cận KH mới)
    const mapKhachMoi = new Map<string, MucChiTietKPI>();

    // 1.1 Quét từ Lịch gặp / Lịch công tác CRM trong tuần
    dsLichGap.forEach((l) => {
      if (
        l.da_xoa ||
        l.ngay < infoTuan.ngayBatDau ||
        l.ngay > infoTuan.ngayKetThuc ||
        (l.nguoi_phu_trach_id !== nhanSu.id &&
          l.nguoi_tao_id !== nhanSu.id &&
          (!Array.isArray(l.nguoi_tham_gia_ids) || !l.nguoi_tham_gia_ids.includes(nhanSu.id)))
      ) {
        return;
      }
      const txt = (
        (l.tieu_de || '') + ' ' +
        (l.noi_dung || '') + ' ' +
        (l.ket_qua || '') + ' ' +
        (l.ten_khach_hang || '')
      ).toLowerCase();

      const khObj = l.khach_hang_id ? mapKH.get(l.khach_hang_id) : null;
      const khMoiTao = khObj && (khObj.ngay_tao || '').slice(0, 10) >= infoTuan.ngayBatDau;

      const laTiepCan =
        khMoiTao ||
        txt.includes('tiếp cận') ||
        txt.includes('kh mới') ||
        txt.includes('khách mới') ||
        txt.includes('khách hàng mới') ||
        txt.includes('chào sân') ||
        txt.includes('gặp mới') ||
        txt.includes('làm quen') ||
        txt.includes('tiếp xúc') ||
        txt.includes('khai thác mới');

      if (laTiepCan) {
        const key = l.khach_hang_id || (l.ten_khach_hang || 'kh_gap').trim().toLowerCase();
        if (!mapKhachMoi.has(key)) {
          mapKhachMoi.set(key, {
            id: `lich_${l.id}`,
            tieuDe: l.ten_khach_hang || 'Khách hàng mới (Lịch gặp)',
            moTa: `Lịch công tác ${l.ngay}${l.gio_bat_dau ? ` [${l.gio_bat_dau}]` : ''}: ${l.noi_dung || l.tieu_de || 'Tiếp cận khách hàng mới'}`,
            loaiNguon: 'Lịch công tác',
            daChon: true
          });
        }
      }
    });

    // 1.2 Quét từ Bàn làm việc tuần này
    viecTuanNay.forEach((item) => {
      const txt = (
        (item.ten_khach_hang_du_an || '') + ' ' +
        (item.noi_dung_tuan || '') + ' ' +
        (item.hanh_dong_tuan || '') + ' ' +
        (item.dau_ra_cam_ket || '')
      ).toLowerCase();

      const coKqTiepCan =
        item.danh_sach_ket_qua &&
        item.danh_sach_ket_qua.some(
          (kq) =>
            kq.loai_tac_nghiep === 'tao_khach_hang' ||
            (kq.noi_dung && (
              kq.noi_dung.toLowerCase().includes('tiếp cận') ||
              kq.noi_dung.toLowerCase().includes('kh mới') ||
              kq.noi_dung.toLowerCase().includes('khách mới')
            ))
        );

      const khObj = item.khach_hang_id ? mapKH.get(item.khach_hang_id) : null;
      const khMoiTao = khObj && (khObj.ngay_tao || '').slice(0, 10) >= infoTuan.ngayBatDau;

      const laTiepCan =
        item.loai_cong_viec === 'khach_hang' ||
        coKqTiepCan ||
        khMoiTao ||
        txt.includes('tiếp cận') ||
        txt.includes('kh mới') ||
        txt.includes('khách mới') ||
        txt.includes('khách hàng mới') ||
        txt.includes('chào mới') ||
        txt.includes('khai thác mới') ||
        txt.includes('tìm kiếm kh') ||
        txt.includes('tìm kh mới');

      if (laTiepCan) {
        const key = item.khach_hang_id || (item.ten_khach_hang_du_an || 'kh_viec').trim().toLowerCase();
        if (!mapKhachMoi.has(key)) {
          const ht = item.hinh_thuc === 'gap_mat' ? 'Gặp trực tiếp' : item.hinh_thuc === 'goi_dien' ? 'Gọi điện' : 'Tác nghiệp';
          mapKhachMoi.set(key, {
            id: `viec_${item.id}`,
            tieuDe: item.ten_khach_hang_du_an || 'Khách hàng mới (Bàn làm việc)',
            moTa: `Bàn làm việc [${ht}]: ${item.noi_dung_tuan || item.hanh_dong_tuan || 'Tiếp cận khách hàng mới'}`,
            loaiNguon: 'Bàn làm việc',
            daChon: true
          });
        }
      }
    });

    const dsChiTietKhachMoi = Array.from(mapKhachMoi.values());
    const tongKhachMoi = dsChiTietKhachMoi.length;

    // 2. Tổng số báo giá đã gửi trong tuần:
    // Căn cứ vào: Dự án có mốc giai đoạn báo giá trong tuần + Công việc gửi báo giá trên Bàn làm việc
    const mapBaoGia = new Map<string, MucChiTietKPI>();

    // 2.1 Dự án có hoạt động chuyển giai đoạn hoặc đạt mốc báo giá trong tuần
    dsDuAnCuaNV.forEach((d) => {
      const ngayTao = (d.ngay_tao_ho_so || d.ngay_tao || '').slice(0, 10);
      const ngayCapNhat = (d.ngay_cap_nhat || '').slice(0, 10);
      const laGiaiDoanBaoGia = d.giai_doan === 'bao_gia' && (
        (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc) ||
        (ngayCapNhat >= infoTuan.ngayBatDau && ngayCapNhat <= infoTuan.ngayKetThuc)
      );
      const laDuAnMoiBaoGia =
        ngayTao >= infoTuan.ngayBatDau &&
        ngayTao <= infoTuan.ngayKetThuc &&
        d.giai_doan !== 'tiep_can';

      if (laGiaiDoanBaoGia || laDuAnMoiBaoGia) {
        mapBaoGia.set(d.id, {
          id: `da_bg_${d.id}`,
          tieuDe: d.ten_du_an,
          moTa: `Dự án đạt mốc Báo giá • Giá trị dự kiến: ${fmtTien(d.gia_tri_du_kien || d.gia_tri_hop_dong)}`,
          loaiNguon: 'Hồ sơ dự án',
          daChon: true
        });
      }
    });

    // 2.2 Công việc/hành động báo giá trên Bàn làm việc
    viecTuanNay.forEach((item) => {
      const txt = (
        (item.noi_dung_tuan || '') + ' ' +
        (item.hanh_dong_tuan || '') + ' ' +
        (item.dau_ra_cam_ket || '')
      ).toLowerCase();

      const coKqBaoGia =
        item.danh_sach_ket_qua &&
        item.danh_sach_ket_qua.some(
          (kq) =>
            kq.noi_dung && (
              kq.noi_dung.toLowerCase().includes('báo giá') ||
              kq.noi_dung.toLowerCase().includes('gửi bg') ||
              kq.noi_dung.toLowerCase().includes('chào giá')
            )
        );

      const laBaoGia =
        coKqBaoGia ||
        txt.includes('báo giá') ||
        txt.includes('gửi bg') ||
        txt.includes('chào giá') ||
        txt.includes('lên bg') ||
        txt.includes('gửi bảng giá');

      if (laBaoGia) {
        const key = item.du_an_id || item.khach_hang_id || (item.ten_khach_hang_du_an || 'bg_viec').trim().toLowerCase();
        if (!mapBaoGia.has(key)) {
          mapBaoGia.set(key, {
            id: `viec_bg_${item.id}`,
            tieuDe: item.ten_khach_hang_du_an || 'Gửi báo giá',
            moTa: `Bàn làm việc: ${item.noi_dung_tuan || item.hanh_dong_tuan || 'Gửi báo giá cho khách hàng'}`,
            loaiNguon: 'Bàn làm việc',
            daChon: true
          });
        }
      }
    });

    const dsChiTietBaoGia = Array.from(mapBaoGia.values());
    const tongBaoGia = dsChiTietBaoGia.length;

    // 3. Tổng số dự án đã làm việc trong tuần (tập hợp các dự án có tác nghiệp thực tế)
    const mapDuAnLamViec = new Map<string, MucChiTietKPI>();

    // 3.1 Dự án có việc trên Bàn làm việc tuần
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

    // 3.2 Dự án có lịch hẹn/lịch công tác trong tuần
    dsLichGap.forEach((l) => {
      if (
        !l.da_xoa &&
        l.ngay >= infoTuan.ngayBatDau &&
        l.ngay <= infoTuan.ngayKetThuc &&
        (l.nguoi_phu_trach_id === nhanSu.id || l.nguoi_tao_id === nhanSu.id) &&
        l.du_an_id
      ) {
        const da = dsDuAnCuaNV.find((d) => d.id === l.du_an_id);
        if (da && !mapDuAnLamViec.has(da.id)) {
          mapDuAnLamViec.set(da.id, {
            id: `da_lam_${da.id}`,
            tieuDe: da.ten_du_an,
            moTa: `Lịch công tác ${l.ngay}: ${l.noi_dung || l.tieu_de || 'Làm việc dự án'}`,
            loaiNguon: 'Lịch công tác',
            daChon: true
          });
        }
      }
    });

    // 3.3 Dự án có cập nhật hoạt động hoặc tạo trong tuần
    dsDuAnCuaNV.forEach((da) => {
      const ngayTao = (da.ngay_tao_ho_so || da.ngay_tao || '').slice(0, 10);
      const ngayCN = (da.ngay_cap_nhat || '').slice(0, 10);
      const coCapNhat =
        (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc) ||
        (ngayCN >= infoTuan.ngayBatDau && ngayCN <= infoTuan.ngayKetThuc);
      if (coCapNhat && !mapDuAnLamViec.has(da.id)) {
        mapDuAnLamViec.set(da.id, {
          id: `da_lam_${da.id}`,
          tieuDe: da.ten_du_an,
          moTa: `Cập nhật tiến độ dự án • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
          loaiNguon: 'Hồ sơ dự án',
          daChon: true
        });
      }
    });

    const dsChiTietDuAnLamViec = Array.from(mapDuAnLamViec.values());
    const tongDuAnDaLamViec = dsChiTietDuAnLamViec.length;

    // 4. Số hợp đồng ký kết trong tuần (sự kiện ký HĐ thật sự phát sinh trong tuần)
    const mapHopDong = new Map<string, MucChiTietKPI>();

    // 4.1 Dự án chuyển sang giai đoạn Ký hợp đồng có mốc trong tuần
    dsDuAnCuaNV.forEach((da) => {
      const ngayTao = (da.ngay_tao_ho_so || da.ngay_tao || '').slice(0, 10);
      const ngayCN = (da.ngay_cap_nhat || '').slice(0, 10);
      const laGiaiDoanKyHD =
        da.giai_doan === 'ky_hop_dong' ||
        da.giai_doan === 'tt_dot_1' ||
        da.giai_doan === 'trien_khai';
      const trongTuan =
        (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc) ||
        (ngayCN >= infoTuan.ngayBatDau && ngayCN <= infoTuan.ngayKetThuc);

      if (laGiaiDoanKyHD && trongTuan && Number(da.gia_tri_hop_dong || 0) > 0) {
        mapHopDong.set(da.id, {
          id: `hd_${da.id}`,
          tieuDe: `Hợp đồng: ${da.ten_du_an}`,
          moTa: `Ký kết thành công • Giá trị: ${fmtTien(da.gia_tri_hop_dong)} • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
          loaiNguon: 'Hồ sơ dự án',
          soTien: Number(da.gia_tri_hop_dong || 0),
          daChon: true
        });
      }
    });

    // 4.2 Bàn làm việc có nhiệm vụ ký HĐ hoàn thành trong tuần
    viecTuanNay.forEach((item) => {
      const txt = (
        (item.noi_dung_tuan || '') + ' ' +
        (item.hanh_dong_tuan || '') + ' ' +
        (item.dau_ra_cam_ket || '')
      ).toLowerCase();
      const laViecKyHD =
        txt.includes('ký hợp đồng') ||
        txt.includes('ký hđ') ||
        txt.includes('chốt hđ') ||
        txt.includes('chốt hợp đồng');
      const daXong = item.da_hoan_thanh || item.trang_thai_ket_qua === 'dat_muc_tieu';

      if (laViecKyHD && daXong) {
        const key = item.du_an_id || item.khach_hang_id || (item.ten_khach_hang_du_an || 'hd_viec').trim().toLowerCase();
        if (!mapHopDong.has(key)) {
          mapHopDong.set(key, {
            id: `hd_viec_${item.id}`,
            tieuDe: item.ten_khach_hang_du_an || 'Ký hợp đồng mới',
            moTa: `Bàn làm việc: ${item.noi_dung_tuan || item.hanh_dong_tuan} (Đã hoàn thành)`,
            loaiNguon: 'Bàn làm việc',
            soTien: 0,
            daChon: true
          });
        }
      }
    });

    const dsChiTietHopDong = Array.from(mapHopDong.values());
    const tongHopDong = dsChiTietHopDong.length;

    // 5. Tổng doanh thu đã thu về trong tuần (HĐ ký mới + Tiền về thực tế phát sinh trong tuần)
    const mapDoanhThu = new Map<string, MucChiTietKPI>();

    // 5.1 Doanh số từ hợp đồng ký mới trong tuần
    dsChiTietHopDong.forEach((hd) => {
      if (hd.soTien && hd.soTien > 0) {
        mapDoanhThu.set(hd.id, {
          id: `dt_${hd.id}`,
          tieuDe: hd.tieuDe,
          moTa: `Doanh số hợp đồng mới ký: ${fmtTien(hd.soTien)}`,
          loaiNguon: 'Hợp đồng ký mới',
          soTien: hd.soTien,
          daChon: true
        });
      }
    });

    // 5.2 Doanh thu từ dòng tiền về thực tế trong tuần (tien_ve_thuc_te)
    dsDuAnCuaNV.forEach((da) => {
      const ngayTao = (da.ngay_tao_ho_so || da.ngay_tao || '').slice(0, 10);
      const ngayCN = (da.ngay_cap_nhat || '').slice(0, 10);
      const trongTuan =
        (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc) ||
        (ngayCN >= infoTuan.ngayBatDau && ngayCN <= infoTuan.ngayKetThuc);
      const tienThucTe = Number(da.tien_ve_thuc_te || 0);

      if (trongTuan && tienThucTe > 0 && !mapDoanhThu.has(`dt_hd_${da.id}`)) {
        mapDoanhThu.set(`tienve_${da.id}`, {
          id: `dt_tienve_${da.id}`,
          tieuDe: `Dòng tiền về: ${da.ten_du_an}`,
          moTa: `Thực thu đợt thanh toán: ${fmtTien(tienThucTe)} • Giai đoạn: ${layCauHinhGiaiDoanTheoKey(da.giai_doan).nhan_day_du}`,
          loaiNguon: 'Dòng tiền về thực tế',
          soTien: tienThucTe,
          daChon: true
        });
      }
    });

    const dsChiTietDoanhThu = Array.from(mapDoanhThu.values());
    const tongDoanhThu = dsChiTietDoanhThu.reduce((sum, item) => sum + Number(item.soTien || 0), 0);

    return {
      khachMoi: {
        thucTe: tongKhachMoi,
        chiTiet: `${tongKhachMoi} KH mới (quét từ Bàn làm việc & Lịch gặp)`,
        danhSach: dsChiTietKhachMoi
      },
      baoGia: {
        thucTe: tongBaoGia,
        chiTiet: `${tongBaoGia} báo giá (từ mốc dự án & công việc)`,
        danhSach: dsChiTietBaoGia
      },
      duAnLamViec: {
        thucTe: tongDuAnDaLamViec,
        chiTiet: `${tongDuAnDaLamViec} dự án có tác nghiệp trong tuần`,
        danhSach: dsChiTietDuAnLamViec
      },
      hopDong: {
        thucTe: tongHopDong,
        chiTiet: `${tongHopDong} hợp đồng ký kết trong tuần`,
        danhSach: dsChiTietHopDong
      },
      doanhThu: {
        thucTe: tongDoanhThu,
        chiTiet: `${fmtTien(tongDoanhThu)} (Doanh số HĐ mới & thực thu)`,
        danhSach: dsChiTietDoanhThu
      }
    };
  }, [dsDuAnCuaNV, dsLichGap, keHoachTuanNay, infoTuan, nhanSu.id, mapKH]);

  // Kế hoạch tuần trước lấy từ Cam kết tuần trước (Khối III của tuần trước đưa qua)
  const mucTieuMacDinhTuTuanTruoc = useMemo(() => {
    const ck = baoCaoTuanTruoc?.cam_ket_tuan_toi as any;
    return {
      khachMoi: ck?.khach_moi?.target ?? 20,
      baoGia: ck?.bao_gia?.target ?? 4,
      duAnLamViec: ck?.du_an_lam_viec?.target ?? 5,
      hopDong: ck?.hop_dong?.target ?? 4,
      doanhThu: ck?.doanh_so?.target ?? ck?.doanh_thu?.target ?? 150000000
    };
  }, [baoCaoTuanTruoc]);

  // --------------------------------------------------------------------------
  // STATE KHỐI I: ĐÁNH GIÁ KẾT QUẢ KPI TUẦN QUA (5 CHỈ SỐ)
  // --------------------------------------------------------------------------
  const [kpiKhachMoi, setKpiKhachMoi] = useState({ keHoachTuanTruoc: 20, thucTe: 0, daSuaTay: false });
  const [kpiBaoGia, setKpiBaoGia] = useState({ keHoachTuanTruoc: 4, thucTe: 0, daSuaTay: false });
  const [kpiDuAnLamViec, setKpiDuAnLamViec] = useState({ keHoachTuanTruoc: 5, thucTe: 0, daSuaTay: false });
  const [kpiHopDong, setKpiHopDong] = useState({ keHoachTuanTruoc: 4, thucTe: 0, daSuaTay: false });
  const [kpiDoanhThu, setKpiDoanhThu] = useState({ keHoachTuanTruoc: 150000000, thucTe: 0, daSuaTay: false });

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

  // Khởi tạo số liệu: Ưu tiên dữ liệu đã lưu, nếu chưa có thì nạp tự động từ Bàn làm việc & CRM
  useEffect(() => {
    if (baoCaoHienTai?.kpi_tuan_qua) {
      const k = baoCaoHienTai.kpi_tuan_qua as any;
      setKpiKhachMoi({
        keHoachTuanTruoc: k.khach_moi_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.khachMoi,
        thucTe: k.khach_moi_thuc_te ?? soLieuThucTeTuBanLamViec.khachMoi.thucTe,
        daSuaTay: false
      });
      setKpiBaoGia({
        keHoachTuanTruoc: k.bao_gia_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.baoGia,
        thucTe: k.bao_gia_thuc_te ?? soLieuThucTeTuBanLamViec.baoGia.thucTe,
        daSuaTay: false
      });
      setKpiDuAnLamViec({
        keHoachTuanTruoc: k.du_an_lam_viec_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.duAnLamViec,
        thucTe: k.du_an_lam_viec_thuc_te ?? soLieuThucTeTuBanLamViec.duAnLamViec.thucTe,
        daSuaTay: false
      });
      setKpiHopDong({
        keHoachTuanTruoc: k.hop_dong_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.hopDong,
        thucTe: k.hop_dong_thuc_te ?? soLieuThucTeTuBanLamViec.hopDong.thucTe,
        daSuaTay: false
      });
      setKpiDoanhThu({
        keHoachTuanTruoc: k.doanh_so_muc_tieu ?? k.doanh_thu_muc_tieu ?? mucTieuMacDinhTuTuanTruoc.doanhThu,
        thucTe: k.doanh_so_thuc_te ?? k.doanh_thu_thuc_te ?? soLieuThucTeTuBanLamViec.doanhThu.thucTe,
        daSuaTay: false
      });
      return;
    }

    setKpiKhachMoi({
      keHoachTuanTruoc: mucTieuMacDinhTuTuanTruoc.khachMoi,
      thucTe: soLieuThucTeTuBanLamViec.khachMoi.thucTe,
      daSuaTay: false
    });
    setKpiBaoGia({
      keHoachTuanTruoc: mucTieuMacDinhTuTuanTruoc.baoGia,
      thucTe: soLieuThucTeTuBanLamViec.baoGia.thucTe,
      daSuaTay: false
    });
    setKpiDuAnLamViec({
      keHoachTuanTruoc: mucTieuMacDinhTuTuanTruoc.duAnLamViec,
      thucTe: soLieuThucTeTuBanLamViec.duAnLamViec.thucTe,
      daSuaTay: false
    });
    setKpiHopDong({
      keHoachTuanTruoc: mucTieuMacDinhTuTuanTruoc.hopDong,
      thucTe: soLieuThucTeTuBanLamViec.hopDong.thucTe,
      daSuaTay: false
    });
    setKpiDoanhThu({
      keHoachTuanTruoc: mucTieuMacDinhTuTuanTruoc.doanhThu,
      thucTe: soLieuThucTeTuBanLamViec.doanhThu.thucTe,
      daSuaTay: false
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
      nd: 'Đã cập nhật lại toàn bộ số liệu thực tế tự động từ Bàn làm việc & CRM!'
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
    if (baoCaoHienTai?.du_an_trong_diem_ids && baoCaoHienTai.du_an_trong_diem_ids.length > 0) {
      const idHopLe = baoCaoHienTai.du_an_trong_diem_ids.filter((id) =>
        dsDuAnTiemNangCaoNV.some((d) => d.id === id)
      );
      setIdsDuAnChon(idHopLe.length > 0 ? idHopLe : dsDuAnTiemNangCaoNV.slice(0, 6).map((d) => d.id));
      return;
    }

    setIdsDuAnChon(dsDuAnTiemNangCaoNV.slice(0, 6).map((d) => d.id));
  }, [baoCaoHienTai, dsDuAnTiemNangCaoNV]);

  const dsDuAnTrongDiem = useMemo(() => {
    return idsDuAnChon
      .map((id) => dsDuAnTiemNangCaoNV.find((d) => d.id === id))
      .filter(Boolean) as HoSoDuAn[];
  }, [idsDuAnChon, dsDuAnTiemNangCaoNV]);

  const tongGiaTriDealTrongDiem = useMemo(() => {
    return dsDuAnTrongDiem.reduce((acc, d) => {
      const val = d.gia_tri_hop_dong || d.gia_tri_du_kien || 0;
      return acc + Number(val);
    }, 0);
  }, [dsDuAnTrongDiem]);

  // --------------------------------------------------------------------------
  // STATE KHỐI III: CHỈ TIÊU CAM KẾT TUẦN TỚI (5 CHỈ SỐ TƯƠNG ỨNG)
  // --------------------------------------------------------------------------
  const [camKet, setCamKet] = useState({
    khachMoi: { target: 20, min: 15, max: 25 },
    baoGia: { target: 4, min: 2, max: 6 },
    duAnLamViec: { target: 5, min: 3, max: 8 },
    hopDong: { target: 4, min: 2, max: 6 },
    doanhThu: { target: 180000000, min: 150000000, max: 220000000 }
  });

  useEffect(() => {
    if (baoCaoHienTai?.cam_ket_tuan_toi) {
      const c = baoCaoHienTai.cam_ket_tuan_toi as any;
      setCamKet({
        khachMoi: c.khach_moi || { target: 20, min: 15, max: 25 },
        baoGia: c.bao_gia || { target: 4, min: 2, max: 6 },
        duAnLamViec: c.du_an_lam_viec || { target: 5, min: 3, max: 8 },
        hopDong: c.hop_dong || { target: 4, min: 2, max: 6 },
        doanhThu: c.doanh_so || c.doanh_thu || { target: 180000000, min: 150000000, max: 220000000 }
      });
    }
  }, [baoCaoHienTai]);

  // --------------------------------------------------------------------------
  // STATE KHỐI IV: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (KHỬ TRÙNG LẶP TUYỆT ĐỐI)
  // --------------------------------------------------------------------------
  const [ghiChuLichNgay, setGhiChuLichNgay] = useState<Record<string, string>>({});

  useEffect(() => {
    if (baoCaoHienTai?.ghi_chu_lich_ngay) {
      setGhiChuLichNgay(baoCaoHienTai.ghi_chu_lich_ngay);
    }
  }, [baoCaoHienTai]);

  // Quét các lịch hẹn tuần tới của nhân viên từ Lịch công tác
  const dsLichTuanToiCuaNV = useMemo(() => {
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
        const ten = l.ten_khach_hang || 'Khách hàng';
        const diaDiem = l.dia_diem ? ` (${l.dia_diem})` : '';
        const nd = l.noi_dung || l.tieu_de || 'Lịch công tác';
        return `${gio}${ten}${diaDiem} - ${nd}`.trim();
      });

      // 2. Nhiệm vụ trên Bàn làm việc (ItemKeHoachTuan) được xếp cho ngày này
      const viecTrongNgay = dsViec.filter((item) => kiemTraViecThuocNgay(item, d.ngay));

      // LỌC KHỬ TRÙNG: Loại bỏ việc trùng với lịch hẹn công tác
      const viecKhongTrung = viecTrongNgay.filter((item) => {
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

      const tongHopTuHeThong = tongHopArray.length > 1
        ? tongHopArray.map((line) => `• ${line}`).join('\n')
        : (tongHopArray[0] ? `• ${tongHopArray[0]}` : '');

      const noiDungCustom = ghiChuLichNgay[d.ngay];
      const noiDungCuoi =
        (noiDungCustom && noiDungCustom.trim()) ? noiDungCustom : (tongHopTuHeThong || '');

      return {
        thuIndex: idx + 1,
        tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
        ngayISO: d.ngay,
        soLich: lichTrongNgay.length + viecKhongTrung.length,
        soLichCongTac: lichTrongNgay.length,
        soViecBanLamViec: viecKhongTrung.length,
        noiDung: noiDungCuoi,
        noiDungGocHeThong: tongHopTuHeThong
      };
    });
  }, [infoTuanToi, dsLichTuanToiCuaNV, keHoachTuanToi, ghiChuLichNgay]);

  const taiLaiLichTuBanLamViec = () => {
    const resetMap: Record<string, string> = {};
    danhSach7NgayTuanToi.forEach((d) => {
      resetMap[d.ngayISO] = d.noiDungGocHeThong;
    });
    setGhiChuLichNgay(resetMap);
    setThongBao({
      loai: 'tc',
      nd: 'Đã tải lại toàn bộ nội dung công việc từ Bàn làm việc & Lịch công tác tuần tới.'
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
          xacSuatPct: cfgTN.xacSuat
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
      }))
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
      await onLuuBaoCao(
        {
          kpi_tuan_qua: {
            khach_moi_muc_tieu: kpiKhachMoi.keHoachTuanTruoc,
            khach_moi_thuc_te: kpiKhachMoi.thucTe,
            bao_gia_muc_tieu: kpiBaoGia.keHoachTuanTruoc,
            bao_gia_thuc_te: kpiBaoGia.thucTe,
            du_an_lam_viec_muc_tieu: kpiDuAnLamViec.keHoachTuanTruoc,
            du_an_lam_viec_thuc_te: kpiDuAnLamViec.thucTe,
            hop_dong_muc_tieu: kpiHopDong.keHoachTuanTruoc,
            hop_dong_thuc_te: kpiHopDong.thucTe,
            doanh_so_muc_tieu: kpiDoanhThu.keHoachTuanTruoc,
            doanh_so_thuc_te: kpiDoanhThu.thucTe,
            cuoc_gap_muc_tieu: 0,
            cuoc_gap_thuc_te: 0
          } as any,
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
          trang_thai: nopBaoCao ? 'cho_duyet' : 'nhap'
        },
        nopBaoCao
      );
      setThongBao({
        loai: 'tc',
        nd: nopBaoCao
          ? 'Đã nộp báo cáo tuần cho Trưởng phòng phê duyệt thành công!'
          : 'Đã lưu bản nháp báo cáo tuần.'
      });
    } catch (err) {
      console.error(err);
      setThongBao({ loai: 'loi', nd: 'Có lỗi khi lưu báo cáo.' });
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
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-foreground uppercase tracking-wide">
                Báo Cáo Kết Quả &amp; Kế Hoạch Tuần Sales VDCD
              </h2>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10.5px] font-bold border',
                  baoCaoHienTai?.trang_thai === 'da_duyet'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : baoCaoHienTai?.trang_thai === 'cho_duyet'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                )}
              >
                {baoCaoHienTai?.trang_thai === 'da_duyet'
                  ? 'Đã duyệt'
                  : baoCaoHienTai?.trang_thai === 'cho_duyet'
                  ? 'Chờ duyệt'
                  : 'Bản nháp'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {infoTuan.nhanTieuDe} ({infoTuan.khoangNgayNhan}/{infoTuan.nam}) · {nhanSu.ho_va_ten}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={xuLyXuatExcel}
            disabled={dangXuatExcel}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title="Xuất file Excel đúng định dạng mẫu Google Sheet VDCD"
          >
            <Download className="size-4" />
            <span>{dangXuatExcel ? 'Đang xuất file...' : 'Xuất Excel chuẩn VDCD'}</span>
          </button>

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
            <span>Nộp báo cáo tuần</span>
          </button>
        </div>
      </div>

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
      {/* KHỐI I: ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN CHỈ TIÊU TUẦN QUA */}
      {/* =================================================================== */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
              I
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                Đánh giá kết quả thực hiện chỉ tiêu tuần qua
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tự động theo dõi &amp; tổng hợp từ kết quả công việc trên Bàn làm việc, Lịch công tác &amp; Hồ sơ dự án
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dongBoLaiKPITuBanLamViec}
            className="h-8 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Quét lại kết quả thực tế mới nhất từ Bàn làm việc và CRM"
          >
            <RefreshCw className="size-3.5" />
            <span>Lấy tự động từ Bàn làm việc &amp; CRM</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-left">Chỉ tiêu đánh giá tuần qua</th>
                <th className="py-2.5 px-3 text-center w-28">ĐVT</th>
                <th className="py-2.5 px-4 text-right w-44">Kế hoạch tuần trước</th>
                <th className="py-2.5 px-4 text-right w-44">Thực tế đạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Dòng 1: Khách hàng mới tiếp cận */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">1</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Số lượng khách hàng mới tiếp cận</div>
                  <button
                    type="button"
                    onClick={() =>
                      moModalDrillDown('khachMoi', 'Chi tiết Khách hàng mới tiếp cận tuần qua', soLieuThucTeTuBanLamViec.khachMoi.chiTiet)
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.khachMoi.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Khách hàng</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiKhachMoi.keHoachTuanTruoc}
                    onChange={(e) => setKpiKhachMoi({ ...kpiKhachMoi, keHoachTuanTruoc: Number(e.target.value) })}
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiKhachMoi.thucTe}
                    onChange={(e) =>
                      setKpiKhachMoi({ ...kpiKhachMoi, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-blue-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiKhachMoi.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiKhachMoi((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.khachMoi.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
              </tr>

              {/* Dòng 2: Tổng số báo giá đã gửi */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">2</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Tổng số báo giá đã gửi trong tuần</div>
                  <button
                    type="button"
                    onClick={() =>
                      moModalDrillDown('baoGia', 'Chi tiết Báo giá đã gửi trong tuần qua', soLieuThucTeTuBanLamViec.baoGia.chiTiet)
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.baoGia.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Báo giá</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiBaoGia.keHoachTuanTruoc}
                    onChange={(e) => setKpiBaoGia({ ...kpiBaoGia, keHoachTuanTruoc: Number(e.target.value) })}
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiBaoGia.thucTe}
                    onChange={(e) =>
                      setKpiBaoGia({ ...kpiBaoGia, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-amber-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiBaoGia.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiBaoGia((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.baoGia.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
              </tr>

              {/* Dòng 3: Tổng số dự án đã làm việc trong tuần */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">3</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Tổng số dự án đã làm việc trong tuần</div>
                  <button
                    type="button"
                    onClick={() =>
                      moModalDrillDown('duAnLamViec', 'Chi tiết Dự án đã làm việc trong tuần qua', soLieuThucTeTuBanLamViec.duAnLamViec.chiTiet)
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.duAnLamViec.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Dự án</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiDuAnLamViec.keHoachTuanTruoc}
                    onChange={(e) => setKpiDuAnLamViec({ ...kpiDuAnLamViec, keHoachTuanTruoc: Number(e.target.value) })}
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiDuAnLamViec.thucTe}
                    onChange={(e) =>
                      setKpiDuAnLamViec({ ...kpiDuAnLamViec, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-indigo-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiDuAnLamViec.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiDuAnLamViec((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.duAnLamViec.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
              </tr>

              {/* Dòng 4: Số hợp đồng ký kết */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">4</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Số hợp đồng ký kết</div>
                  <button
                    type="button"
                    onClick={() =>
                      moModalDrillDown('hopDong', 'Chi tiết Hợp đồng / Đơn hàng ký kết tuần qua', soLieuThucTeTuBanLamViec.hopDong.chiTiet)
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.hopDong.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Hợp đồng</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiHopDong.keHoachTuanTruoc}
                    onChange={(e) => setKpiHopDong({ ...kpiHopDong, keHoachTuanTruoc: Number(e.target.value) })}
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiHopDong.thucTe}
                    onChange={(e) =>
                      setKpiHopDong({ ...kpiHopDong, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-purple-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiHopDong.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiHopDong((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.hopDong.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
              </tr>

              {/* Dòng 5: Tổng doanh thu đã thu về trong tuần */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">5</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Tổng doanh thu đã thu về trong tuần</div>
                  <button
                    type="button"
                    onClick={() =>
                      moModalDrillDown('doanhThu', 'Chi tiết Doanh thu thực tế tuần qua', soLieuThucTeTuBanLamViec.doanhThu.chiTiet, true)
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.doanhThu.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">VNĐ</td>
                <td className="py-2.5 px-4 text-right">
                  <ONhapSoTien
                    giaTri={kpiDoanhThu.keHoachTuanTruoc}
                    onChange={(val) => setKpiDoanhThu({ ...kpiDoanhThu, keHoachTuanTruoc: val })}
                    className="w-32 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-2 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <ONhapSoTien
                    giaTri={kpiDoanhThu.thucTe}
                    onChange={(val) => setKpiDoanhThu({ ...kpiDoanhThu, thucTe: val, daSuaTay: true })}
                    className="w-32 text-right font-mono text-xs font-bold text-emerald-600 bg-transparent border border-border/80 rounded px-2 py-0.5 focus:border-primary"
                  />
                  {kpiDoanhThu.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiDoanhThu((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.doanhThu.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
              </tr>

              {/* Dòng Tổng kết Khối I */}
              <tr className="bg-red-500/[0.04] font-bold text-xs border-t border-red-500/20">
                <td colSpan={3} className="py-3 px-4 text-left text-red-950 font-black">
                  TỔNG DOANH THU THỰC TẾ TUẦN (VNĐ)
                </td>
                <td className="py-3 px-4 text-right font-mono text-foreground font-extrabold">
                  {fmtTien(kpiDoanhThu.keHoachTuanTruoc)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 font-black text-sm">
                  {fmtTien(kpiDoanhThu.thucTe)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* KHỐI II: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO) */}
      {/* =================================================================== */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
              II
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                Danh sách dự án trọng điểm đang bám sát (Tiềm năng cao)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tự động chọn lọc từ Hồ sơ dự án dựa trên mức độ tiềm năng (Rất cao &gt; Cao &gt; Trung bình)
              </p>
            </div>
          </div>

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-left">Tên dự án &amp; Khách hàng / CĐT</th>
                <th className="py-2.5 px-4 text-left">Người liên hệ &amp; SĐT</th>
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
                        <div className="font-medium text-foreground">
                          {nlh?.ho_va_ten || kh?.so_dien_thoai || '—'}
                        </div>
                        {(nlh?.so_dien_thoai || kh?.so_dien_thoai) && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                            <Phone className="size-3 text-muted-foreground shrink-0" />
                            <span>{nlh?.so_dien_thoai || kh?.so_dien_thoai}</span>
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

      {/* =================================================================== */}
      {/* KHỐI III: CHỈ TIÊU CAM KẾT TUẦN TỚI */}
      {/* =================================================================== */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
              III
            </span>
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
              Chỉ tiêu cam kết tuần tới
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            3 mức độ cam kết: Mục tiêu (Target) • Tối thiểu (Min) • Thách thức (Max)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-left">Chỉ tiêu cam kết tuần tới</th>
                <th className="py-2.5 px-3 text-center w-28">ĐVT</th>
                <th className="py-2.5 px-4 text-right w-40">Mục tiêu (Target)</th>
                <th className="py-2.5 px-4 text-right w-40">Mức tối thiểu (Min)</th>
                <th className="py-2.5 px-4 text-right w-40">Mức thách thức (Max)</th>
                <th className="py-2.5 px-4 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* 1. Khách hàng mới */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">1</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Số lượng khách hàng mới tiếp cận</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Khách hàng</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.khachMoi.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, khachMoi: { ...camKet.khachMoi, target: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-blue-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.khachMoi.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, khachMoi: { ...camKet.khachMoi, min: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.khachMoi.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, khachMoi: { ...camKet.khachMoi, max: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-muted-foreground text-[11px]">Khai thác mới từ thị trường</td>
              </tr>

              {/* 2. Báo giá */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">2</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Tổng số báo giá dự kiến gửi</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Báo giá</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.baoGia.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, baoGia: { ...camKet.baoGia, target: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-amber-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.baoGia.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, baoGia: { ...camKet.baoGia, min: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.baoGia.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, baoGia: { ...camKet.baoGia, max: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-muted-foreground text-[11px]">Báo giá dự toán khảo sát / đo đạc</td>
              </tr>

              {/* 3. Dự án làm việc */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">3</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Tổng số dự án dự kiến làm việc</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Dự án</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.duAnLamViec.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, duAnLamViec: { ...camKet.duAnLamViec, target: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-indigo-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.duAnLamViec.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, duAnLamViec: { ...camKet.duAnLamViec, min: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.duAnLamViec.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, duAnLamViec: { ...camKet.duAnLamViec, max: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-muted-foreground text-[11px]">Bám sát tiến độ & tác nghiệp dự án</td>
              </tr>

              {/* 4. Hợp đồng ký mới */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">4</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Số hợp đồng / đơn hàng ký mới</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Hợp đồng</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.hopDong.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, hopDong: { ...camKet.hopDong, target: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-purple-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.hopDong.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, hopDong: { ...camKet.hopDong, min: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.hopDong.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, hopDong: { ...camKet.hopDong, max: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-muted-foreground text-[11px]">Chốt HĐ các dự án tiềm năng cao</td>
              </tr>

              {/* 5. Tổng doanh thu dự kiến thu về */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">5</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Tổng doanh thu dự kiến thu về</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">VNĐ</td>
                <td className="py-2.5 px-4 text-right">
                  <ONhapSoTien
                    giaTri={camKet.doanhThu.target}
                    onChange={(val) =>
                      setCamKet({ ...camKet, doanhThu: { ...camKet.doanhThu, target: val } })
                    }
                    className="w-32 text-right font-mono text-xs font-bold text-emerald-700 bg-transparent border border-border/80 rounded px-2 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <ONhapSoTien
                    giaTri={camKet.doanhThu.min}
                    onChange={(val) =>
                      setCamKet({ ...camKet, doanhThu: { ...camKet.doanhThu, min: val } })
                    }
                    className="w-32 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-2 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <ONhapSoTien
                    giaTri={camKet.doanhThu.max}
                    onChange={(val) =>
                      setCamKet({ ...camKet, doanhThu: { ...camKet.doanhThu, max: val } })
                    }
                    className="w-32 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-2 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-muted-foreground text-[11px]">Dòng tiền thực tế & ký kết mới</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* KHỐI IV: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (Lấy từ Lịch & Bàn làm việc) */}
      {/* =================================================================== */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
              IV
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
                Kế hoạch lịch làm việc tuần tới
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Tự động tổng hợp 100% từ Lịch làm việc &amp; Bàn làm việc có sẵn trên hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={taiLaiLichTuBanLamViec}
              className="h-8 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs text-muted-foreground hover:text-foreground"
              title="Khôi phục toàn bộ nội dung tự động từ Bàn làm việc và Lịch công tác tuần tới"
            >
              <RefreshCw className="size-3.5" />
              <span>Tải lại từ Lịch &amp; Bàn làm việc</span>
            </button>
            <span className="text-xs font-bold text-primary">
              {infoTuanToi.nhanTieuDe} ({infoTuanToi.khoangNgayNhan})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[11px] text-muted-foreground font-bold">
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 text-left w-52">Lịch tuần / Ngày</th>
                <th className="py-2.5 px-4 text-left">Nội dung công việc chi tiết (Đã đồng bộ từ Bàn làm việc &amp; Lịch)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {danhSach7NgayTuanToi.map((d) => (
                <tr key={d.ngayISO} className="hover:bg-muted/20">
                  <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                    {d.thuIndex}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{d.tenThuNgay}</span>
                        {d.soLich > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-700 text-[10px] font-bold">
                            {d.soLich} việc / lịch
                          </span>
                        )}
                      </div>
                      {d.soLich > 0 && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {d.soLichCongTac > 0 && `${d.soLichCongTac} lịch gặp `}
                          {d.soViecBanLamViec > 0 && `• ${d.soViecBanLamViec} việc Bàn làm việc`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <textarea
                      rows={2}
                      value={d.noiDung}
                      onChange={(e) =>
                        setGhiChuLichNgay({ ...ghiChuLichNgay, [d.ngayISO]: e.target.value })
                      }
                      placeholder="Chưa có lịch. Nhập nội dung hoặc lên lịch trên Bàn làm việc để tự động đồng bộ..."
                      className="w-full bg-transparent border border-border/70 rounded-lg p-2 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs resize-y"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                                    item.loaiNguon === 'Lịch công tác' && 'bg-amber-100 text-amber-800',
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
                  <button
                    type="button"
                    onClick={apDungVaoBaoCao}
                    className="h-8.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Check className="size-3.5" />
                    <span>Áp dụng vào báo cáo</span>
                  </button>
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
    </div>
  );
}
