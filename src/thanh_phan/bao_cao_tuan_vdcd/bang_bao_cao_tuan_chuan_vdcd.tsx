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
  // CƠ CHẾ THEO DÕI TỰ ĐỘNG LẤY DỮ LIỆU TỪ BÀN LÀM VIỆC & CRM (KHỐI I)
  // --------------------------------------------------------------------------
  const soLieuThucTeTuBanLamViec = useMemo(() => {
    // 1. Doanh số tuần qua (Tiền về thực tế + Hợp đồng ký mới trong tuần)
    const dsDuAnTrongTuan = dsDuAnCuaNV.filter((d) => {
      const ngayCapNhat = (d.ngay_cap_nhat || d.ngay_tao || '').slice(0, 10);
      return (
        ngayCapNhat >= infoTuan.ngayBatDau &&
        ngayCapNhat <= infoTuan.ngayKetThuc &&
        (Number(d.tien_ve_thuc_te || 0) > 0 || Number(d.gia_tri_hop_dong || 0) > 0)
      );
    });
    const dtThucTe = dsDuAnTrongTuan.reduce(
      (acc, d) => acc + Number(d.tien_ve_thuc_te || d.gia_tri_hop_dong || 0),
      0
    );

    // 2. Số lượng KH mới tiếp cận:
    // - Khách hàng mới do nhân sự tạo trong tuần
    const dsKhMoi = dsKhachHang.filter((k) => {
      const ngay = (k.ngay_tao || '').slice(0, 10);
      return (
        ngay >= infoTuan.ngayBatDau &&
        ngay <= infoTuan.ngayKetThuc &&
        (k.nguoi_tao_id === nhanSu.id || k.nguoi_phu_trach_id === nhanSu.id)
      );
    });

    // - Công việc tiếp cận khách hàng trên Bàn làm việc (ItemKeHoachTuan)
    const viecTuanNay = keHoachTuanNay?.danh_sach_tac_chien || [];
    const idKhMoiSet = new Set(dsKhMoi.map((k) => k.id));
    const dsViecTiepCan = viecTuanNay.filter((item) => {
      const laTiepCan =
        item.loai_cong_viec === 'khach_hang' ||
        item.loai_hanh_dong === 'phat_sinh' ||
        (item.danh_sach_ket_qua &&
          item.danh_sach_ket_qua.some((kq) => kq.loai_tac_nghiep === 'tao_khach_hang'));
      return laTiepCan && item.da_hoan_thanh && (!item.khach_hang_id || !idKhMoiSet.has(item.khach_hang_id));
    });
    const tongKhachMoi = dsKhMoi.length + dsViecTiepCan.length;

    // 3. Số lượng cuộc gặp / trao đổi trực tiếp:
    // - Lịch gặp hoàn thành từ Lịch công tác CRM
    const dsLichGapXong = dsLichGap.filter(
      (l) =>
        !l.da_xoa &&
        l.ngay >= infoTuan.ngayBatDau &&
        l.ngay <= infoTuan.ngayKetThuc &&
        (l.nguoi_phu_trach_id === nhanSu.id || l.nguoi_tao_id === nhanSu.id) &&
        (l.trang_thai === 'da_hoan_thanh' || Boolean(l.ket_qua))
    );

    // - Công việc gặp mặt trực tiếp hoàn thành trên Bàn làm việc (ItemKeHoachTuan)
    const dsViecGapMat = viecTuanNay.filter((item) => {
      const laGap =
        item.hinh_thuc === 'gap_mat' ||
        (item.danh_sach_ket_qua &&
          item.danh_sach_ket_qua.some((kq) => kq.loai_tac_nghiep === 'gap_mat'));
      return laGap && (item.da_hoan_thanh || (item.danh_sach_ket_qua && item.danh_sach_ket_qua.length > 0));
    });
    const tongCuocGap = dsLichGapXong.length + dsViecGapMat.length;

    // 4. Số hợp đồng / đơn hàng ký kết:
    // - Dự án chuyển sang giai đoạn hợp đồng trong tuần
    const dsDuAnKyHD = dsDuAnCuaNV.filter((d) => {
      const ngay = (d.ngay_cap_nhat || d.ngay_tao || '').slice(0, 10);
      return (
        ngay >= infoTuan.ngayBatDau &&
        ngay <= infoTuan.ngayKetThuc &&
        (d.giai_doan === 'ky_hop_dong' || d.giai_doan === 'tt_dot_1' || d.giai_doan === 'trien_khai')
      );
    });

    // - Công việc ký hợp đồng hoàn thành trên Bàn làm việc
    const dsViecKyHD = viecTuanNay.filter((item) => {
      const txt = (item.noi_dung_tuan + ' ' + (item.hanh_dong_tuan || '')).toLowerCase();
      return (
        (txt.includes('hợp đồng') || txt.includes('ký hđ') || txt.includes('chốt hđ')) &&
        item.da_hoan_thanh
      );
    });
    const tongHopDong = Math.max(dsDuAnKyHD.length, dsViecKyHD.length);

    return {
      doanhSo: {
        thucTe: dtThucTe,
        chiTiet: `${dsDuAnTrongTuan.length} dự án phát sinh dòng tiền/HĐ trong tuần qua`,
        danhSach: dsDuAnTrongTuan.map((d) => ({
          tieuDe: d.ten_du_an,
          moTa: fmtTien(d.tien_ve_thuc_te || d.gia_tri_hop_dong)
        }))
      },
      khachMoi: {
        thucTe: tongKhachMoi,
        chiTiet: `${dsKhMoi.length} KH mới trên CRM + ${dsViecTiepCan.length} việc tiếp cận trên Bàn làm việc`,
        danhSach: [
          ...dsKhMoi.map((k) => ({ tieuDe: k.ten_khach_hang, moTa: 'Khách hàng mới tạo trên CRM' })),
          ...dsViecTiepCan.map((v) => ({ tieuDe: v.ten_khach_hang_du_an || 'Khách hàng', moTa: v.noi_dung_tuan }))
        ]
      },
      cuocGap: {
        thucTe: tongCuocGap,
        chiTiet: `${dsLichGapXong.length} lịch công tác hoàn thành + ${dsViecGapMat.length} cuộc gặp trên Bàn làm việc`,
        danhSach: [
          ...dsLichGapXong.map((l) => ({ tieuDe: l.ten_khach_hang || 'Lịch công tác', moTa: l.noi_dung || l.tieu_de || 'Lịch hẹn' })),
          ...dsViecGapMat.map((v) => ({ tieuDe: v.ten_khach_hang_du_an || 'Khách hàng', moTa: v.noi_dung_tuan }))
        ]
      },
      hopDong: {
        thucTe: tongHopDong,
        chiTiet: `${dsDuAnKyHD.length} dự án lên giai đoạn HĐ + ${dsViecKyHD.length} việc ký HĐ hoàn thành`,
        danhSach: [
          ...dsDuAnKyHD.map((d) => ({ tieuDe: d.ten_du_an, moTa: 'Dự án đã ký hợp đồng' })),
          ...dsViecKyHD.map((v) => ({ tieuDe: v.ten_khach_hang_du_an || 'Khách hàng', moTa: v.noi_dung_tuan }))
        ]
      }
    };
  }, [dsDuAnCuaNV, dsKhachHang, dsLichGap, keHoachTuanNay, infoTuan, nhanSu.id]);

  // Mục tiêu kế thừa từ Cam kết tuần trước (Khối III của tuần trước)
  const mucTieuMacDinhTuTuanTruoc = useMemo(() => {
    const ck = baoCaoTuanTruoc?.cam_ket_tuan_toi;
    return {
      doanhSo: ck?.doanh_so?.target ?? 150000000,
      khachMoi: ck?.khach_moi?.target ?? 20,
      cuocGap: ck?.cuoc_hen?.target ?? 35,
      hopDong: ck?.hop_dong?.target ?? 4
    };
  }, [baoCaoTuanTruoc]);

  // --------------------------------------------------------------------------
  // STATE KHỐI I: ĐÁNH GIÁ KẾT QUẢ KPI TUẦN QUA
  // --------------------------------------------------------------------------
  const [kpiDoanhSo, setKpiDoanhSo] = useState({ mucTieu: 150000000, thucTe: 0, daSuaTay: false });
  const [kpiKhachMoi, setKpiKhachMoi] = useState({ mucTieu: 20, thucTe: 0, daSuaTay: false });
  const [kpiCuocGap, setKpiCuocGap] = useState({ mucTieu: 35, thucTe: 0, daSuaTay: false });
  const [kpiHopDong, setKpiHopDong] = useState({ mucTieu: 4, thucTe: 0, daSuaTay: false });

  // Modal xem chi tiết số liệu Drill-down
  const [modalDrillDownKPI, setModalDrillDownKPI] = useState<{
    mo: boolean;
    tieuDe: string;
    moTa: string;
    danhSach: { tieuDe: string; moTa?: string }[];
  }>({ mo: false, tieuDe: '', moTa: '', danhSach: [] });

  // Khởi tạo số liệu: Ưu tiên dữ liệu đã lưu, nếu chưa có thì nạp tự động từ Bàn làm việc & CRM
  useEffect(() => {
    if (baoCaoHienTai?.kpi_tuan_qua) {
      const k = baoCaoHienTai.kpi_tuan_qua;
      setKpiDoanhSo({ mucTieu: k.doanh_so_muc_tieu, thucTe: k.doanh_so_thuc_te, daSuaTay: false });
      setKpiKhachMoi({ mucTieu: k.khach_moi_muc_tieu, thucTe: k.khach_moi_thuc_te, daSuaTay: false });
      setKpiCuocGap({ mucTieu: k.cuoc_gap_muc_tieu, thucTe: k.cuoc_gap_thuc_te, daSuaTay: false });
      setKpiHopDong({ mucTieu: k.hop_dong_muc_tieu, thucTe: k.hop_dong_thuc_te, daSuaTay: false });
      return;
    }

    setKpiDoanhSo({
      mucTieu: mucTieuMacDinhTuTuanTruoc.doanhSo,
      thucTe: soLieuThucTeTuBanLamViec.doanhSo.thucTe,
      daSuaTay: false
    });
    setKpiKhachMoi({
      mucTieu: mucTieuMacDinhTuTuanTruoc.khachMoi,
      thucTe: soLieuThucTeTuBanLamViec.khachMoi.thucTe,
      daSuaTay: false
    });
    setKpiCuocGap({
      mucTieu: mucTieuMacDinhTuTuanTruoc.cuocGap,
      thucTe: soLieuThucTeTuBanLamViec.cuocGap.thucTe,
      daSuaTay: false
    });
    setKpiHopDong({
      mucTieu: mucTieuMacDinhTuTuanTruoc.hopDong,
      thucTe: soLieuThucTeTuBanLamViec.hopDong.thucTe,
      daSuaTay: false
    });
  }, [baoCaoHienTai, mucTieuMacDinhTuTuanTruoc, soLieuThucTeTuBanLamViec]);

  const dongBoLaiKPITuBanLamViec = () => {
    setKpiDoanhSo((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.doanhSo.thucTe, daSuaTay: false }));
    setKpiKhachMoi((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.khachMoi.thucTe, daSuaTay: false }));
    setKpiCuocGap((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.cuocGap.thucTe, daSuaTay: false }));
    setKpiHopDong((prev) => ({ ...prev, thucTe: soLieuThucTeTuBanLamViec.hopDong.thucTe, daSuaTay: false }));
    setThongBao({
      loai: 'tc',
      nd: 'Đã cập nhật lại toàn bộ số liệu thực tế tự động từ Bàn làm việc & CRM!'
    });
  };

  // --------------------------------------------------------------------------
  // STATE KHỐI II: DANH SÁCH DỰ ÁN TRỌNG ĐIỂM ĐANG BÁM SÁT (TIỀM NĂNG CAO)
  // --------------------------------------------------------------------------
  const [idsDuAnChon, setIdsDuAnChon] = useState<string[]>([]);
  const [moModalChonDA, setMoModalChonDA] = useState(false);

  useEffect(() => {
    if (baoCaoHienTai?.du_an_trong_diem_ids && baoCaoHienTai.du_an_trong_diem_ids.length > 0) {
      setIdsDuAnChon(baoCaoHienTai.du_an_trong_diem_ids);
      return;
    }

    // Tự động chọn các dự án có tiềm năng 'rat_cao' hoặc 'cao', chưa hoàn thành/hủy
    const dsLoc = dsDuAnCuaNV
      .filter(
        (d) =>
          d.giai_doan !== 'hoan_thanh_tt_dot_2' &&
          d.giai_doan !== 'tam_dung_huy'
      )
      .sort((a, b) => {
        const score = (tn?: string) => (tn === 'rat_cao' ? 5 : tn === 'cao' ? 4 : tn === 'trung_binh' ? 3 : 2);
        return score(b.muc_do_tiem_nang) - score(a.muc_do_tiem_nang);
      })
      .slice(0, 6)
      .map((d) => d.id);

    setIdsDuAnChon(dsLoc);
  }, [baoCaoHienTai, dsDuAnCuaNV]);

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
  // STATE KHỐI III: CHỈ TIÊU CAM KẾT TUẦN TỚI
  // --------------------------------------------------------------------------
  const [camKet, setCamKet] = useState({
    doanhSo: { target: 180000000, min: 150000000, max: 220000000 },
    khachMoi: { target: 25, min: 20, max: 30 },
    cuocHen: { target: 15, min: 12, max: 18 },
    baoGia: { target: 4, min: 2, max: 6 },
    hopDong: { target: 5, min: 3, max: 7 }
  });

  useEffect(() => {
    if (baoCaoHienTai?.cam_ket_tuan_toi) {
      const c = baoCaoHienTai.cam_ket_tuan_toi;
      setCamKet({
        doanhSo: c.doanh_so || { target: 180000000, min: 150000000, max: 220000000 },
        khachMoi: c.khach_moi || { target: 25, min: 20, max: 30 },
        cuocHen: c.cuoc_hen || { target: 15, min: 12, max: 18 },
        baoGia: c.bao_gia || { target: 4, min: 2, max: 6 },
        hopDong: c.hop_dong || { target: 5, min: 3, max: 7 }
      });
    }
  }, [baoCaoHienTai]);

  // --------------------------------------------------------------------------
  // STATE KHỐI IV: KẾ HOẠCH LỊCH LÀM VIỆC TUẦN TỚI (Lấy từ Lịch & Bàn làm việc)
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

  // Gom lịch làm việc tuần tới theo 7 ngày (tự động lấy cả từ Bàn làm việc và Lịch công tác)
  const danhSach7NgayTuanToi = useMemo(() => {
    const dsViec = keHoachTuanToi?.danh_sach_tac_chien || [];

    return infoTuanToi.danhSachNgay.map((d, idx) => {
      // 1. Lịch công tác / gặp KH
      const lichTrongNgay = dsLichTuanToiCuaNV.filter((l) => l.ngay === d.ngay);
      const dsDongLich = lichTrongNgay.map((l) => {
        const gio = l.gio_bat_dau ? `[${l.gio_bat_dau}] ` : '';
        const ten = l.ten_khach_hang || 'Khách hàng';
        const nd = l.noi_dung || l.tieu_de || 'Lịch công tác';
        return `${gio}${ten}: ${nd}`;
      });

      // 2. Nhiệm vụ trên Bàn làm việc (ItemKeHoachTuan) được xếp cho ngày này
      const viecTrongNgay = dsViec.filter((item) => kiemTraViecThuocNgay(item, d.ngay));
      const dsDongViec = viecTrongNgay.map((item) => {
        const ht =
          item.hinh_thuc === 'gap_mat'
            ? 'Gặp trực tiếp'
            : item.hinh_thuc === 'goi_dien'
            ? 'Gọi điện'
            : 'Tác nghiệp';
        const ten = item.ten_khach_hang_du_an || 'Khách hàng';
        const nd = item.noi_dung_tuan || item.hanh_dong_tuan || item.dau_ra_cam_ket || 'Công việc';
        return `[${ht}] ${ten}: ${nd}`;
      });

      const tongHopTuHeThong = [...dsDongLich, ...dsDongViec].join('; ');
      const noiDungCustom = ghiChuLichNgay[d.ngay];
      const noiDungCuoi =
        noiDungCustom !== undefined ? noiDungCustom : (tongHopTuHeThong || '');

      return {
        thuIndex: idx + 1,
        tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
        ngayISO: d.ngay,
        soLich: lichTrongNgay.length + viecTrongNgay.length,
        soLichCongTac: lichTrongNgay.length,
        soViecBanLamViec: viecTrongNgay.length,
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
        doanhSo: { mucTieu: kpiDoanhSo.mucTieu, thucTe: kpiDoanhSo.thucTe },
        khachHangMoi: { mucTieu: kpiKhachMoi.mucTieu, thucTe: kpiKhachMoi.thucTe },
        cuocGapTrucTiep: { mucTieu: kpiCuocGap.mucTieu, thucTe: kpiCuocGap.thucTe },
        hopDongKy: { mucTieu: kpiHopDong.mucTieu, thucTe: kpiHopDong.thucTe }
      },
      danhSachDuAnTrongDiem: dsDuAnTrongDiem.map((d, idx) => {
        const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
        const nlh = d.nguoi_lien_he_id ? mapNLH.get(d.nguoi_lien_he_id) : null;
        const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
        const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.trung_binh;
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
        doanhSo: camKet.doanhSo,
        khachHangMoi: camKet.khachMoi,
        cuocHenDemo: camKet.cuocHen,
        baoGiaMoi: camKet.baoGia,
        hopDongMoi: camKet.hopDong
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
            doanh_so_muc_tieu: kpiDoanhSo.mucTieu,
            doanh_so_thuc_te: kpiDoanhSo.thucTe,
            khach_moi_muc_tieu: kpiKhachMoi.mucTieu,
            khach_moi_thuc_te: kpiKhachMoi.thucTe,
            cuoc_gap_muc_tieu: kpiCuocGap.mucTieu,
            cuoc_gap_thuc_te: kpiCuocGap.thucTe,
            hop_dong_muc_tieu: kpiHopDong.mucTieu,
            hop_dong_thuc_te: kpiHopDong.thucTe
          },
          du_an_trong_diem_ids: idsDuAnChon,
          cam_ket_tuan_toi: {
            doanh_so: camKet.doanhSo,
            khach_moi: camKet.khachMoi,
            cuoc_hen: camKet.cuocHen,
            bao_gia: camKet.baoGia,
            hop_dong: camKet.hopDong
          },
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
                <th className="py-2.5 px-4 text-left">Chỉ tiêu KPI tuần</th>
                <th className="py-2.5 px-3 text-center w-28">ĐVT</th>
                <th className="py-2.5 px-4 text-right w-36">Mục tiêu giao</th>
                <th className="py-2.5 px-4 text-right w-36">Thực tế đạt</th>
                <th className="py-2.5 px-3 text-center w-28">Tỷ lệ hoàn thành</th>
                <th className="py-2.5 px-4 text-left w-48">Đánh giá kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Dòng 1: Doanh số */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">1</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Doanh số bán lẻ / Dự án</div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalDrillDownKPI({
                        mo: true,
                        tieuDe: 'Chi tiết Doanh số phát sinh tuần qua',
                        moTa: soLieuThucTeTuBanLamViec.doanhSo.chiTiet,
                        danhSach: soLieuThucTeTuBanLamViec.doanhSo.danhSach
                      })
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.doanhSo.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">VNĐ</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiDoanhSo.mucTieu}
                    onChange={(e) => setKpiDoanhSo({ ...kpiDoanhSo, mucTieu: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiDoanhSo.thucTe}
                    onChange={(e) =>
                      setKpiDoanhSo({ ...kpiDoanhSo, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-28 text-right font-mono text-xs font-bold text-emerald-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiDoanhSo.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiDoanhSo((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.doanhSo.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                  {kpiDoanhSo.mucTieu > 0
                    ? `${((kpiDoanhSo.thucTe / kpiDoanhSo.mucTieu) * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10.5px] font-bold',
                      kpiDoanhSo.thucTe >= kpiDoanhSo.mucTieu
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    )}
                  >
                    {kpiDoanhSo.thucTe >= kpiDoanhSo.mucTieu
                      ? `Vượt chỉ tiêu (+${Math.round(((kpiDoanhSo.thucTe - kpiDoanhSo.mucTieu) / kpiDoanhSo.mucTieu) * 100)}%)`
                      : 'Chưa đạt chỉ tiêu'}
                  </span>
                </td>
              </tr>

              {/* Dòng 2: Khách hàng mới */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">2</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Số lượng khách hàng mới tiếp cận</div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalDrillDownKPI({
                        mo: true,
                        tieuDe: 'Chi tiết Khách hàng mới tiếp cận tuần qua',
                        moTa: soLieuThucTeTuBanLamViec.khachMoi.chiTiet,
                        danhSach: soLieuThucTeTuBanLamViec.khachMoi.danhSach
                      })
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
                    value={kpiKhachMoi.mucTieu}
                    onChange={(e) => setKpiKhachMoi({ ...kpiKhachMoi, mucTieu: Number(e.target.value) })}
                    className="w-20 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiKhachMoi.thucTe}
                    onChange={(e) =>
                      setKpiKhachMoi({ ...kpiKhachMoi, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-20 text-right font-mono text-xs font-bold text-blue-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
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
                <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                  {kpiKhachMoi.mucTieu > 0
                    ? `${((kpiKhachMoi.thucTe / kpiKhachMoi.mucTieu) * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10.5px] font-bold',
                      kpiKhachMoi.thucTe >= kpiKhachMoi.mucTieu
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    )}
                  >
                    {kpiKhachMoi.thucTe >= kpiKhachMoi.mucTieu
                      ? `Đạt chỉ tiêu (${Math.round((kpiKhachMoi.thucTe / kpiKhachMoi.mucTieu) * 100)}%)`
                      : 'Chưa đạt chỉ tiêu'}
                  </span>
                </td>
              </tr>

              {/* Dòng 3: Cuộc gặp trực tiếp */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">3</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Số lượng cuộc gặp / trao đổi trực tiếp</div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalDrillDownKPI({
                        mo: true,
                        tieuDe: 'Chi tiết Cuộc gặp / Trao đổi trực tiếp tuần qua',
                        moTa: soLieuThucTeTuBanLamViec.cuocGap.chiTiet,
                        danhSach: soLieuThucTeTuBanLamViec.cuocGap.danhSach
                      })
                    }
                    className="text-[10.5px] text-muted-foreground hover:text-blue-600 inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                    <span>{soLieuThucTeTuBanLamViec.cuocGap.chiTiet} (Xem chi tiết)</span>
                  </button>
                </td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Lượt</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiCuocGap.mucTieu}
                    onChange={(e) => setKpiCuocGap({ ...kpiCuocGap, mucTieu: Number(e.target.value) })}
                    className="w-20 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiCuocGap.thucTe}
                    onChange={(e) =>
                      setKpiCuocGap({ ...kpiCuocGap, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-20 text-right font-mono text-xs font-bold text-teal-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                  {kpiCuocGap.daSuaTay && (
                    <button
                      type="button"
                      onClick={() =>
                        setKpiCuocGap((p) => ({
                          ...p,
                          thucTe: soLieuThucTeTuBanLamViec.cuocGap.thucTe,
                          daSuaTay: false
                        }))
                      }
                      className="text-[10px] text-blue-600 hover:underline block text-right mt-0.5 cursor-pointer"
                    >
                      (Lấy lại số CRM)
                    </button>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                  {kpiCuocGap.mucTieu > 0
                    ? `${((kpiCuocGap.thucTe / kpiCuocGap.mucTieu) * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10.5px] font-bold',
                      kpiCuocGap.thucTe >= kpiCuocGap.mucTieu
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    )}
                  >
                    {kpiCuocGap.thucTe >= kpiCuocGap.mucTieu
                      ? `Đạt chỉ tiêu (${Math.round((kpiCuocGap.thucTe / kpiCuocGap.mucTieu) * 100)}%)`
                      : 'Chưa đạt chỉ tiêu'}
                  </span>
                </td>
              </tr>

              {/* Dòng 4: Hợp đồng ký kết */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">4</td>
                <td className="py-2.5 px-4">
                  <div className="font-bold text-foreground">Số hợp đồng / đơn hàng ký kết</div>
                  <button
                    type="button"
                    onClick={() =>
                      setModalDrillDownKPI({
                        mo: true,
                        tieuDe: 'Chi tiết Hợp đồng / Đơn hàng ký kết tuần qua',
                        moTa: soLieuThucTeTuBanLamViec.hopDong.chiTiet,
                        danhSach: soLieuThucTeTuBanLamViec.hopDong.danhSach
                      })
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
                    value={kpiHopDong.mucTieu}
                    onChange={(e) => setKpiHopDong({ ...kpiHopDong, mucTieu: Number(e.target.value) })}
                    className="w-20 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={kpiHopDong.thucTe}
                    onChange={(e) =>
                      setKpiHopDong({ ...kpiHopDong, thucTe: Number(e.target.value), daSuaTay: true })
                    }
                    className="w-20 text-right font-mono text-xs font-bold text-purple-600 bg-transparent border border-border/80 rounded px-1.5 py-0.5 focus:border-primary"
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
                <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                  {kpiHopDong.mucTieu > 0
                    ? `${((kpiHopDong.thucTe / kpiHopDong.mucTieu) * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10.5px] font-bold',
                      kpiHopDong.thucTe >= kpiHopDong.mucTieu
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    )}
                  >
                    {kpiHopDong.thucTe >= kpiHopDong.mucTieu
                      ? `Vượt chỉ tiêu (+${Math.round(((kpiHopDong.thucTe - kpiHopDong.mucTieu) / kpiHopDong.mucTieu) * 100)}%)`
                      : 'Chưa đạt chỉ tiêu'}
                  </span>
                </td>
              </tr>

              {/* Dòng Tổng kết Khối I */}
              <tr className="bg-red-500/[0.04] font-bold text-xs border-t border-red-500/20">
                <td colSpan={3} className="py-3 px-4 text-left text-red-950 font-black">
                  TỔNG HỢP DOANH SỐ TUẦN (VNĐ)
                </td>
                <td className="py-3 px-4 text-right font-mono text-foreground font-extrabold">
                  {fmtTien(kpiDoanhSo.mucTieu)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 font-black text-sm">
                  {fmtTien(kpiDoanhSo.thucTe)}
                </td>
                <td className="py-3 px-3 text-center font-mono text-primary font-black">
                  {kpiDoanhSo.mucTieu > 0
                    ? `${((kpiDoanhSo.thucTe / kpiDoanhSo.mucTieu) * 100).toFixed(1)}%`
                    : '100%'}
                </td>
                <td className="py-3 px-4 font-bold text-red-800">
                  {kpiDoanhSo.thucTe >= kpiDoanhSo.mucTieu ? 'Hoàn thành chỉ tiêu doanh số' : 'Chưa đạt chỉ tiêu'}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* 1. Doanh số cam kết */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">1</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Doanh số cam kết tuần</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">VNĐ</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.doanhSo.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, doanhSo: { ...camKet.doanhSo, target: Number(e.target.value) } })
                    }
                    className="w-32 text-right font-mono text-xs font-bold text-emerald-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.doanhSo.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, doanhSo: { ...camKet.doanhSo, min: Number(e.target.value) } })
                    }
                    className="w-32 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.doanhSo.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, doanhSo: { ...camKet.doanhSo, max: Number(e.target.value) } })
                    }
                    className="w-32 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
              </tr>

              {/* 2. Khách hàng mới */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">2</td>
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
              </tr>

              {/* 3. Cuộc hẹn demo */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">3</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Số lượng cuộc hẹn demo / gặp trực tiếp</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">Cuộc hẹn</td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.cuocHen.target}
                    onChange={(e) =>
                      setCamKet({ ...camKet, cuocHen: { ...camKet.cuocHen, target: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-teal-700 bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.cuocHen.min}
                    onChange={(e) =>
                      setCamKet({ ...camKet, cuocHen: { ...camKet.cuocHen, min: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-semibold bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
                <td className="py-2.5 px-4 text-right">
                  <input
                    type="number"
                    value={camKet.cuocHen.max}
                    onChange={(e) =>
                      setCamKet({ ...camKet, cuocHen: { ...camKet.cuocHen, max: Number(e.target.value) } })
                    }
                    className="w-24 text-right font-mono text-xs font-bold text-primary bg-transparent border border-border/80 rounded px-1.5 py-0.5"
                  />
                </td>
              </tr>

              {/* 4. Báo giá mới gửi */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">4</td>
                <td className="py-2.5 px-4 font-bold text-foreground">Số lượng báo giá mới gửi cho KH</td>
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
              </tr>

              {/* 5. Hợp đồng ký mới */}
              <tr className="hover:bg-muted/20">
                <td className="py-2.5 px-3 text-center font-bold text-muted-foreground">5</td>
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

      {/* MODAL DRILL-DOWN CHI TIẾT SỐ LIỆU KPI KHỐI I */}
      {modalDrillDownKPI.mo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">
                  {modalDrillDownKPI.tieuDe}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modalDrillDownKPI.moTa}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDrillDownKPI((p) => ({ ...p, mo: false }))}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-border/60 max-h-[420px] text-xs">
              {modalDrillDownKPI.danhSach.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Chưa có dữ liệu chi tiết ghi nhận trong khoảng thời gian này.
                </div>
              ) : (
                modalDrillDownKPI.danhSach.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-foreground">{item.tieuDe}</div>
                      {item.moTa && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {item.moTa}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-muted/40 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setModalDrillDownKPI((p) => ({ ...p, mo: false }))}
                className="h-8.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
              {dsDuAnCuaNV.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nhân sự chưa có hồ sơ dự án nào trong hệ thống.
                </div>
              ) : (
                dsDuAnCuaNV.map((d) => {
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
