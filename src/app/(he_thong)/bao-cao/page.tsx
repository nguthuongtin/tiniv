'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  FolderKanban,
  ClipboardList,
  FileText,
  UserCog,
  TrendingUp,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Lock,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ListTodo,
  CircleDollarSign,
  Loader2,
  Filter,
  FileSpreadsheet,
  FileDown,
  ShieldAlert
} from 'lucide-react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { KhachHang } from '../../../thu_vien/types/khach_hang';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import type { CongViec } from '../../../thu_vien/types/cong_viec';
import type { BaoCaoCongViec } from '../../../thu_vien/types/bao_cao_cong_viec';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../thu_vien/types/nhan_su';
import type { NhatKyHoatDong } from '../../../thu_vien/types/nhat_ky_hoat_dong';
import { danhSachKhachHang } from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachCongViec } from '../../../dich_vu/cong_viec/dich_vu_cong_viec';
import { danhSachBaoCaoCongViec } from '../../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { thamChieuCollection } from '../../../thu_vien/firebase/client_firebase';
import { layDanhSachGiaiDoan, layDanhSachGiaiDoanGhiNhanDoanhSo, layCauHinhGiaiDoanTheoKey, DANH_SACH_GIAI_DOAN_MAC_DINH } from '../../../thu_vien/cau_hinh/giai_doan_du_an';
import { langNgheCauHinhGiaiDoanDuAn } from '../../../dich_vu/cau_hinh/dich_vu_cau_hinh_giai_doan_du_an';

const NGAY_HOM_NAY = new Date().toISOString().split('T')[0];
const SO_NGAY_BIEU_DO = 14;

const layMang14Ngay = (): string[] => {
  const arr: string[] = [];
  for (let i = SO_NGAY_BIEU_DO - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d.toISOString().split('T')[0]);
  }
  return arr;
};

const phanLoaiTheoNgayTao = (mang: { ngay_tao: string }[], ngay: string): number =>
  mang.filter((x) => (x.ngay_tao ?? '').slice(0, 10) === ngay).length;

const TEN_HANH_DONG: Record<string, { nhan: string; mau: string }> = {
  tao_moi: { nhan: 'Tạo mới', mau: 'bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success' },
  cap_nhat: { nhan: 'Cập nhật', mau: 'bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary' },
  xoa_mem: { nhan: 'Xóa mềm', mau: 'bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger' },
  khoa_tai_khoan: { nhan: 'Khóa TK', mau: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning' },
  mo_khoa_tai_khoan: { nhan: 'Mở khóa TK', mau: 'bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success' },
  doi_mat_khau: { nhan: 'Đổi MK', mau: 'bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary' },
  doi_trang_thai: { nhan: 'Đổi trạng thái', mau: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning' },
  thay_doi_trang_thai: { nhan: 'Đổi trạng thái', mau: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning' }
};

const chonTenHanhDong = (h: string) => TEN_HANH_DONG[h] ?? { nhan: h, mau: 'bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted' };

const TEN_COLLECTION: Record<string, string> = {
  khach_hang: 'Khách hàng',
  nguoi_lien_he: 'Người liên hệ',
  ho_so_du_an: 'Hồ sơ dự án',
  cong_viec: 'Công việc',
  bao_cao_cong_viec: 'Báo cáo CV',
  nhan_su: 'Nhân sự',
  nhat_ky_hoat_dong: 'Nhật ký',
  tai_lieu_du_an: 'Tài liệu DA'
};

const DANH_SACH_12_GIAI_DOAN_MAC_DINH_RUT_GON = DANH_SACH_GIAI_DOAN_MAC_DINH.map(x => ({
  key: x.key,
  nhan: x.nhan_day_du,
  kieu: x.kieu
}));

const MAU_KIEU_GD: Record<string, string> = {
  muted: 'bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted',
  primary: 'bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary',
  success: 'bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success',
  warning: 'bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning',
  danger: 'bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger'
};

export default function TrangBaoCaoThongKe() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const laBackOffice = ['hanh_chinh_van_phong'].includes(nguoiDungHienTai?.vai_tro ?? '');

  const [dangTai, setDangTai] = useState(true);
  const [dsKh, setDsKh] = useState<KhachHang[]>([]);
  const [dsDa, setDsDa] = useState<HoSoDuAn[]>([]);
  const [dsCv, setDsCv] = useState<CongViec[]>([]);
  const [dsBccv, setDsBccv] = useState<BaoCaoCongViec[]>([]);
  const [dsNs, setDsNs] = useState<NhanSu[]>([]);
  const [dsHd, setDsHd] = useState<NhatKyHoatDong[]>([]);
  const [errTai, setErrTai] = useState<string | null>(null);
  const [loaiKhoang, setLoaiKhoang] = useState<'ngay' | 'tuan' | 'thang'>('ngay');
  const [ngayChon, setNgayChon] = useState<string>(new Date().toISOString().slice(0, 10));
  const [locChiNhanhId, setLocChiNhanhId] = useState<string>('');
  const [locPhongBanId, setLocPhongBanId] = useState<string>('');
  const [dsChiNhanhLoc, setDsChiNhanhLoc] = useState<ChiNhanh[]>([]);
  const [dsPhongBanLoc, setDsPhongBanLoc] = useState<PhongBan[]>([]);
  const [dangXuat, setDangXuat] = useState<'excel' | 'pdf' | null>(null);
  const [danhSachGiaiDoan, setDanhSachGiaiDoan] = useState(DANH_SACH_12_GIAI_DOAN_MAC_DINH_RUT_GON);

  const mang14Ngay = useMemo(() => layMang14Ngay(), []);

  const taiLai = useCallback(async () => {
    if (!coQuyen(nguoiDungHienTai, 'bao_cao.xem')) {
      setDangTai(false);
      return;
    }
    setDangTai(true);
    setErrTai(null);
    try {
      const [kqKh, kqDa, kqCv, kqBccv, kqNs, kqCn, kqPb] = await Promise.all([
        danhSachKhachHang({ trang_thai: 'hoat_dong' }),
        danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }),
        danhSachCongViec({ trang_thai_du_lieu: 'hoat_dong' }),
        danhSachBaoCaoCongViec({ trang_thai_du_lieu: 'hoat_dong' }),
        danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
        danhSachChiNhanh({ trang_thai_du_lieu: 'hoat_dong' }),
        danhSachPhongBan({ trang_thai_du_lieu: 'hoat_dong' })
      ]);
      setDsKh(kqKh.mang);
      setDsDa(kqDa.mang);
      setDsCv(kqCv.mang);
      setDsBccv(kqBccv.mang);
      setDsNs(kqNs.mang);
      setDsChiNhanhLoc(kqCn.mang as any);
      setDsPhongBanLoc(kqPb.mang as any);
    } catch (e) {
      setErrTai('Không thể tải toàn bộ dữ liệu dashboard. Lỗi: ' + (e as Error).message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    void taiLai();
    let unsubAudit: (() => void) | null = null;
    try {
      unsubAudit = onSnapshot(
        query(
          thamChieuCollection('nhat_ky_hoat_dong'),
          orderBy('thoi_gian', 'desc'),
          limit(20)
        ),
        (snap) => {
          const mang = snap.docs.map((d) => {
            const r = d.data();
            return {
              id: d.id,
              nguoi_dung_id: (r.nguoi_dung_id as string) ?? '',
              module: (r.module as string) ?? '',
              hanh_dong: (r.hanh_dong as string) ?? '',
              ban_ghi_id: (r.ban_ghi_id as string | null) ?? null,
              noi_dung: (r.noi_dung as string | null) ?? null,
              thoi_gian: (r.thoi_gian as string) ?? new Date().toISOString()
            } as unknown as NhatKyHoatDong;
          });
          setDsHd(mang.slice(0, 10));
        }
      );
    } catch {
      /* bo qua neu khong quyen doc nhat ky */
    }
    return () => {
      unsubAudit?.();
    };
  }, [taiLai]);

  useEffect(() => {
    const huyLangNghe = langNgheCauHinhGiaiDoanDuAn((c) => {
      setDanhSachGiaiDoan(c.danh_sach.map(x => ({
        key: x.key,
        nhan: x.nhan_day_du,
        kieu: x.kieu
      })));
    });
    return () => huyLangNghe();
  }, []);

  const tk = useMemo(() => {
    // KH
    const khMoiTrongTuan = dsKh.filter((x) => x.ngay_tao.slice(0, 10) >= mang14Ngay[0]).length;
    // HĐA
    const tongGiaTriHopDong = dsDa.reduce((t, x) => t + ((x.gia_tri_hop_dong as number) || 0), 0);
    const tongGiaTriDuKien = dsDa.reduce((t, x) => t + ((x.gia_tri_du_kien as number) || 0), 0);
    const daHoanThanh = dsDa.filter((x) => x.giai_doan === 'hoan_thanh').length;
    // Doanh thu ghi nhan (theo cau hinh dong)
    const dsGiaiDoanGhiNhan = layDanhSachGiaiDoanGhiNhanDoanhSo().map(String);
    const tongDoanhThuGhiNhanDuKien = dsDa.reduce((sum, x) => {
      if (dsGiaiDoanGhiNhan.includes(String(x.giai_doan))) return sum + Number(x.gia_tri_du_kien || 0);
      return sum;
    }, 0);
    const tongDoanhThuGhiNhanHopDong = dsDa.reduce((sum, x) => {
      if (dsGiaiDoanGhiNhan.includes(String(x.giai_doan))) return sum + Number(x.gia_tri_hop_dong || 0);
      return sum;
    }, 0);
    // CV
    const cvHoanThanh = dsCv.filter((x) => x.trang_thai === 'hoan_thanh').length;
    const cvTreHan = dsCv.filter((x) => x.thoi_han_hoan_thanh && x.thoi_han_hoan_thanh < NGAY_HOM_NAY && x.trang_thai !== 'hoan_thanh').length;
    // BCCV
    const bccvHomNay = dsBccv.filter((x) => x.ngay_bao_cao === NGAY_HOM_NAY).length;
    const bccvCoKhoKhan = dsBccv.filter((x) => (x.kho_khan ?? '').trim().length > 0).length;
    // NS
    const nsKhoa = dsNs.filter((x) => !x.trang_thai).length;
    const nsTuanMoi = dsNs.filter((x) => x.ngay_tao.slice(0, 10) >= mang14Ngay[0]).length;
    // Ti le
    const tiLeCv = dsCv.length === 0 ? 0 : Math.round((cvHoanThanh / dsCv.length) * 100);
    const tiLeDa = dsDa.length === 0 ? 0 : Math.round((daHoanThanh / dsDa.length) * 100);
    return {
      khTong: dsKh.length, khMoiTrongTuan,
      daTong: dsDa.length, daHoanThanh, tiLeDa, tongGiaTriHopDong, tongGiaTriDuKien,
      tongDoanhThuGhiNhanDuKien, tongDoanhThuGhiNhanHopDong,
      cvTong: dsCv.length, cvHoanThanh, cvTreHan, tiLeCv,
      bccvTong: dsBccv.length, bccvHomNay, bccvCoKhoKhan,
      nsTong: dsNs.length, nsKhoa, nsTuanMoi
    };
  }, [dsKh, dsDa, dsCv, dsBccv, dsNs, mang14Ngay, danhSachGiaiDoan]);

  const phanBoGiaiDoanDA = useMemo(() => {
    const nhom: Record<string, number> = {};
    dsDa.forEach((d) => {
      const g = String(d.giai_doan || 'chua_xac_dinh');
      nhom[g] = (nhom[g] || 0) + 1;
    });
    return nhom;
  }, [dsDa]);

  const phanBoTrangThaiCV = useMemo(() => {
    const s: Record<string, number> = { chua_thuc_hien: 0, dang_thuc_hien: 0, hoan_thanh: 0, tam_dung: 0 };
    dsCv.forEach((c) => {
      const t = String(c.trang_thai || 'chua_thuc_hien');
      s[t] = (s[t] || 0) + 1;
    });
    return s;
  }, [dsCv]);

  const { duLieuBieuDo, maxCot } = useMemo(() => {
    const tatCaNgayTao: { ngay_tao: string }[] = [
      ...dsKh.map((x) => ({ ngay_tao: x.ngay_tao })),
      ...dsDa.map((x) => ({ ngay_tao: x.ngay_tao })),
      ...dsCv.map((x) => ({ ngay_tao: x.ngay_tao })),
      ...dsBccv.map((x) => ({ ngay_tao: x.ngay_tao })),
      ...dsNs.map((x) => ({ ngay_tao: x.ngay_tao }))
    ];
    const dl = mang14Ngay.map((ngay) => ({ ngay, soLuong: phanLoaiTheoNgayTao(tatCaNgayTao, ngay) }));
    const max = Math.max(1, ...dl.map((x) => x.soLuong));
    return { duLieuBieuDo: dl, maxCot: max };
  }, [dsKh, dsDa, dsCv, dsBccv, dsNs, mang14Ngay]);

  const dinhDangTien = (n: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' tỷ';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' tr';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  };

  const tenNguoiDung = (id: string | null | undefined): string => {
    if (!id) return 'Hệ thống';
    const u = dsNs.find((x) => x.id === id);
    if (u) return u.ho_va_ten;
    if (nguoiDungHienTai?.id === id) return nguoiDungHienTai.ho_va_ten ?? 'Tôi';
    return `UID${id.slice(0, 4)}`;
  };

  const tenChiNhanh = (id: string | null | undefined): string => {
    if (!id) return '(Tất cả)';
    const cn = dsChiNhanhLoc.find((x) => x.id === id);
    return cn?.ten_chi_nhanh ?? id.slice(0, 6);
  };

  const tenPhongBan = (id: string | null | undefined): string => {
    if (!id) return '(Tất cả)';
    const pb = dsPhongBanLoc.find((x) => x.id === id);
    return pb?.ten_phong_ban ?? id.slice(0, 6);
  };

  const tenDuAn = (id: string | null | undefined): string => {
    if (!id) return 'Việc nội bộ / không liên quan dự án';
    const da = dsDa.find((x) => x.id === id);
    return da?.ten_du_an ?? 'N/D';
  };

  const tinhKhoangNgay = (loai: 'ngay' | 'tuan' | 'thang', moc: string): [string, string] => {
    const d = new Date(moc);
    if (isNaN(d.getTime())) return [moc, moc];
    const iso = (dt: Date) => dt.toISOString().slice(0, 10);
    if (loai === 'ngay') return [iso(d), iso(d)];
    if (loai === 'tuan') {
      const day = d.getDay();
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return [iso(monday), iso(sunday)];
    }
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return [iso(first), iso(last)];
  };

  const khoangNgay = useMemo(
    () => tinhKhoangNgay(loaiKhoang, ngayChon),
    [loaiKhoang, ngayChon]
  );

  const dsPhongBanLocTheoChiNhanh = useMemo(
    () => !locChiNhanhId ? dsPhongBanLoc : dsPhongBanLoc.filter((pb) => pb.chi_nhanh_id === locChiNhanhId),
    [locChiNhanhId, dsPhongBanLoc]
  );

  useEffect(() => {
    if (!locChiNhanhId) return;
    if (!locPhongBanId) return;
    const hopLe = dsPhongBanLocTheoChiNhanh.some((pb) => pb.id === locPhongBanId);
    if (!hopLe) setLocPhongBanId('');
  }, [locChiNhanhId, locPhongBanId, dsPhongBanLocTheoChiNhanh]);

  const dsBccvDaLoc = useMemo(() => {
    const [batDau, ketThuc] = khoangNgay;
    return dsBccv.filter((b) => {
      const nb = b.ngay_bao_cao ?? '';
      if (batDau && nb < batDau) return false;
      if (ketThuc && nb > ketThuc) return false;
      if (locChiNhanhId && (b.chi_nhanh_id ?? '') !== locChiNhanhId) return false;
      if (locPhongBanId && (b.phong_ban_id ?? '') !== locPhongBanId) return false;
      return true;
    });
  }, [dsBccv, khoangNgay, locChiNhanhId, locPhongBanId]);

  const xuatExcel = useCallback(async () => {
    try {
      setDangXuat('excel');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('BaoCaoHDQT');
      ws.columns = [
        { header: 'STT', key: 'stt', width: 6 },
        { header: 'Ngày báo cáo', key: 'ngay_bao_cao', width: 13 },
        { header: 'Nhân viên', key: 'nhan_vien', width: 22 },
        { header: 'Chi nhánh', key: 'chi_nhanh', width: 22 },
        { header: 'Phòng ban', key: 'phong_ban', width: 22 },
        { header: 'Tên dự án', key: 'du_an', width: 30 },
        { header: 'Nội dung công việc', key: 'noi_dung', width: 60 },
        { header: 'Khó khăn / Đề xuất', key: 'kho_khan', width: 40 }
      ];
      const [bd, kt] = khoangNgay;
      (ws.getCell('A2').value as any) = `Từ ngày ${bd} đến ${kt} | Chi nhánh: ${locChiNhanhId ? tenChiNhanh(locChiNhanhId) : 'Tất cả'} | Phòng ban: ${locPhongBanId ? tenPhongBan(locPhongBanId) : 'Tất cả'}`;
      ws.mergeCells('A1:H1');
      (ws.getCell('A1').value as any) = `BÁO CÁO TỔNG HỢP CÔNG VIỆC - HĐQT (${loaiKhoang === 'ngay' ? 'NGÀY' : loaiKhoang === 'tuan' ? 'TUẦN' : 'THÁNG'})`;
      (ws.getCell('A1').alignment as any) = { horizontal: 'center', vertical: 'middle' };
      (ws.getCell('A1').font as any) = { bold: true, size: 14, color: { argb: 'FF1F4788' } };
      let stt = 0;
      const rowStart = 3;
      dsBccvDaLoc.forEach((b) => {
        const cn = b.chi_nhanh_id ? tenChiNhanh(b.chi_nhanh_id) : '';
        const pb = b.phong_ban_id ? tenPhongBan(b.phong_ban_id) : '';
        const nv = tenNguoiDung(b.nhan_vien_id);
        const dsCt = b.danh_sach_chi_tiet ?? [];
        if (dsCt.length === 0) {
          stt++;
          ws.addRow({
            stt,
            ngay_bao_cao: b.ngay_bao_cao,
            nhan_vien: nv,
            chi_nhanh: cn,
            phong_ban: pb,
            du_an: '',
            noi_dung: '',
            kho_khan: b.kho_khan ?? ''
          });
        } else {
          dsCt.forEach((ct) => {
            stt++;
            ws.addRow({
              stt,
              ngay_bao_cao: b.ngay_bao_cao,
              nhan_vien: nv,
              chi_nhanh: cn,
              phong_ban: pb,
              du_an: tenDuAn(ct.du_an_id ?? null),
              noi_dung: ct.noi_dung,
              kho_khan: b.kho_khan ?? ''
            });
          });
        }
      });
      const headerRow = ws.getRow(rowStart);
      headerRow.eachCell((cell, idx) => {
        (cell.fill as any) = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4788' } };
        (cell.font as any) = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        (cell.alignment as any) = { vertical: 'middle', horizontal: idx === 1 ? 'center' : 'left' };
        (cell.border as any) = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BaoCaoHDQT_${loaiKhoang}_${khoangNgay[0]}_${khoangNgay[1]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } finally {
      setDangXuat(null);
    }
  }, [dsBccvDaLoc, khoangNgay, loaiKhoang, locChiNhanhId, locPhongBanId, dsChiNhanhLoc, dsPhongBanLoc]);

  const xuatPDF = useCallback(async () => {
    try {
      setDangXuat('pdf');
      await new Promise((r) => setTimeout(r, 30));
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      const tieuDe = `BÁO CÁO TỔNG HỢP CÔNG VIỆC HĐQT - ${loaiKhoang === 'ngay' ? 'NGÀY' : loaiKhoang === 'tuan' ? 'TUẦN' : 'THÁNG'}`;
      doc.text(tieuDe, pageWidth / 2, y, { align: 'center' });
      y += 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const [bd, kt] = khoangNgay;
      doc.text(`Từ ngày ${bd} đến ${kt}  |  Chi nhánh: ${locChiNhanhId ? tenChiNhanh(locChiNhanhId) : 'Tất cả'}  |  Phòng ban: ${locPhongBanId ? tenPhongBan(locPhongBanId) : 'Tất cả'}  |  Tổng BCCV: ${dsBccvDaLoc.length}`, 40, y);
      y += 22;
      const columns = ['STT', 'Ngày', 'Nhân viên', 'Chi nhánh', 'Phòng ban', 'Dự án', 'Nội dung', 'Khó khăn'];
      const colWidths = [36, 70, 110, 110, 110, 150, 240, 120];
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(31, 71, 136);
      doc.setTextColor(255, 255, 255);
      let xCur = 40;
      columns.forEach((c, i) => {
        doc.rect(xCur, y - 12, colWidths[i], 18, 'F');
        doc.text(c, xCur + 6, y);
        xCur += colWidths[i];
      });
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      let stt = 0;
      const themDong = (arr: any[]) => {
        const height = 18;
        if (y + height > 550) {
          doc.addPage();
          y = 40;
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(31, 71, 136);
          doc.setTextColor(255, 255, 255);
          let xx = 40;
          columns.forEach((c, i) => {
            doc.rect(xx, y - 12, colWidths[i], 18, 'F');
            doc.text(c, xx + 6, y);
            xx += colWidths[i];
          });
          y += 14;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(20, 20, 20);
        }
        let x = 40;
        arr.forEach((val, idx) => {
          const text = String(val ?? '');
          const w = colWidths[idx] - 12;
          let sub = text;
          if (sub.length > Math.floor(w / 5)) sub = sub.substring(0, Math.floor(w / 5)) + '…';
          doc.text(sub, x + 6, y);
          x += colWidths[idx];
        });
        y += height;
      };
      dsBccvDaLoc.forEach((b) => {
        const cn = b.chi_nhanh_id ? tenChiNhanh(b.chi_nhanh_id) : '';
        const pb = b.phong_ban_id ? tenPhongBan(b.phong_ban_id) : '';
        const nv = tenNguoiDung(b.nhan_vien_id);
        const dsCt = b.danh_sach_chi_tiet ?? [];
        if (dsCt.length === 0) {
          stt++;
          themDong([stt, b.ngay_bao_cao, nv, cn, pb, '', '', b.kho_khan ?? '']);
        } else {
          dsCt.forEach((ct) => {
            stt++;
            themDong([stt, b.ngay_bao_cao, nv, cn, pb, tenDuAn(ct.du_an_id ?? null), ct.noi_dung, b.kho_khan ?? '']);
          });
        }
      });
      doc.save(`BaoCaoHDQT_${loaiKhoang}_${khoangNgay[0]}_${khoangNgay[1]}.pdf`);
    } finally {
      setDangXuat(null);
    }
  }, [dsBccvDaLoc, khoangNgay, loaiKhoang, locChiNhanhId, locPhongBanId, dsChiNhanhLoc, dsPhongBanLoc]);

  const thayDoiChiNhanhLoc = (id: string) => {
    setLocChiNhanhId(id);
  };

  if (!coQuyen(nguoiDungHienTai, 'bao_cao.xem')) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-card rounded-2xl border border-border shadow-sm">
          <div className="mx-auto size-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Không có quyền truy cập</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bạn không có quyền xem Báo cáo & Thống kê (<b className="font-mono text-xs">bao_cao.xem</b>). Vui lòng liên hệ Quản trị viên để được cấp quyền.
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
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center justify-end gap-2 mb-4">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-input)] bg-card-icon-bg-primary text-card-icon-fg-primary text-xs font-medium border border-card-icon-br-primary">
          <CalendarDays className="size-3.5" />
          {formatNgay(NGAY_HOM_NAY)}
        </div>
        <button
          type="button"
          onClick={() => void taiLai()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-input)] border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
        >
          {dangTai ? <Loader2 className="size-4 animate-spin" /> : <Activity className="size-4" />}
          {dangTai ? 'Đang tải' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {errTai && (
        <div className="mb-6 rounded-[var(--radius-card)] border border-card-icon-br-danger bg-card-icon-bg-danger p-4 flex items-start gap-3">
          <AlertTriangle className="size-5 shrink-0 text-card-icon-fg-danger mt-0.5" />
          <div>
            <div className="font-semibold text-card-icon-fg-danger">Có lỗi khi tải dữ liệu</div>
            <div className="text-sm text-card-icon-fg-danger mt-0.5 opacity-90">{errTai}</div>
          </div>
        </div>
      )}

      {/* Block 1: 12 Card tong hop 5 module */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-6">
        <CardThongKe icon={<Building2 className="size-[18px]" />} iconMau="bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary"
          nhan="Khách hàng" giaTri={tk.khTong}
          phu={<span className="inline-flex items-center gap-1 text-card-icon-fg-success"><ArrowUpRight className="size-3" /> +{tk.khMoiTrongTuan} 14 ngày</span>} />
        <CardThongKe icon={<FolderKanban className="size-[18px]" />} iconMau="bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted"
          nhan="Hồ sơ dự án" giaTri={tk.daTong}
          phu={<span className="inline-flex items-center gap-1 text-card-icon-fg-success"><CheckCircle2 className="size-3" /> HT {tk.daHoanThanh}/{tk.daTong} ({tk.tiLeDa}%)</span>} />
        <CardThongKe icon={<CircleDollarSign className="size-[18px]" />} iconMau="bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success"
          nhan="Giá trị HĐ" giaTri={laBackOffice ? '***' : dinhDangTien(tk.tongGiaTriHopDong)}
          phu={<span className="text-muted-foreground">{laBackOffice ? '***' : `Dự kiến ${dinhDangTien(tk.tongGiaTriDuKien)}`}</span>} />
        <CardThongKe icon={<TrendingUp className="size-[18px]" />} iconMau="bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary"
          nhan="Doanh thu Ghi nhận" giaTri={laBackOffice ? '***' : dinhDangTien(tk.tongDoanhThuGhiNhanHopDong)}
          phu={<span className="text-muted-foreground">{laBackOffice ? '***' : `Dự kiến ${dinhDangTien(tk.tongDoanhThuGhiNhanDuKien)}`}</span>} />
        <CardThongKe icon={<ClipboardList className="size-[18px]" />} iconMau="bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary"
          nhan="Công việc" giaTri={tk.cvTong}
          phu={<span className="inline-flex items-center gap-1 text-card-icon-fg-primary"><CheckCircle2 className="size-3" /> HT {tk.cvHoanThanh} ({tk.tiLeCv}%)</span>} />
        <CardThongKe icon={<FileText className="size-[18px]" />} iconMau="bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning"
          nhan="Báo cáo CV" giaTri={tk.bccvTong}
          phu={<span className="inline-flex items-center gap-1 text-card-icon-fg-warning"><CalendarDays className="size-3" /> Hôm nay {tk.bccvHomNay}</span>} />
        <CardThongKe icon={<UserCog className="size-[18px]" />} iconMau="bg-card-icon-bg-muted text-card-icon-fg-muted border border-card-icon-br-muted"
          nhan="Nhân sự" giaTri={tk.nsTong}
          phu={<span className="inline-flex items-center gap-1 text-muted-foreground"><Lock className="size-3" /> Khóa {tk.nsKhoa} · +{tk.nsTuanMoi} 14 ngày</span>} />
      </div>

      {/* Bộ lọc báo cáo HĐQT */}
      <section className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-[var(--shadow-card)] mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-10 bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary rounded-[var(--radius-input)] flex items-center justify-center shrink-0">
              <Filter className="size-[18px]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">Bộ lọc báo cáo HĐQT</h3>
              <p className="text-xs text-muted-foreground mt-0.5 opacity-80 truncate">
                Lọc Báo cáo ngày theo khoảng + Chi nhánh / Phòng ban → Tổng hợp &amp; Xuất file
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 h-6 font-bold">
              <FileText className="size-3" />
              {dsBccvDaLoc.length} / {dsBccv.length} BCCV
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground border border-border px-3 h-6 font-bold">
              <CalendarDays className="size-3" />
              {khoangNgay[0]} → {khoangNgay[1]}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Khoảng thời gian */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">
              1. Khoảng thời gian
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {(['ngay', 'tuan', 'thang'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLoaiKhoang(k)}
                  className={cn(
                    'h-9 px-3 rounded-[var(--radius-input)] text-xs font-bold transition border',
                    loaiKhoang === k
                      ? 'bg-primary text-primary-foreground border-primary shadow-[var(--shadow-card)]'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  )}
                >
                  {k === 'ngay' ? '📅 Ngày' : k === 'tuan' ? '📆 Tuần' : '🗓️ Tháng'}
                </button>
              ))}
              <input
                type="date"
                value={ngayChon}
                onChange={(e) => setNgayChon(e.target.value)}
                className="h-9 col-span-1 sm:col-span-1 px-3 rounded-[var(--radius-input)] border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Bộ lọc cơ cấu */}
          <div className="lg:col-span-4 space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">
              2. Cơ cấu tổ chức
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5">Chi nhánh</label>
                <select
                  value={locChiNhanhId}
                  onChange={(e) => thayDoiChiNhanhLoc(e.target.value)}
                  className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">(Tất cả chi nhánh)</option>
                  {dsChiNhanhLoc.map((cn) => (
                    <option key={cn.id} value={cn.id}>{cn.ten_chi_nhanh}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5">Phòng ban</label>
                <select
                  value={locPhongBanId}
                  onChange={(e) => setLocPhongBanId(e.target.value)}
                  className="w-full h-9 px-3 rounded-[var(--radius-input)] border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">(Tất cả phòng ban)</option>
                  {dsPhongBanLocTheoChiNhanh.map((pb) => (
                    <option key={pb.id} value={pb.id}>{pb.ten_phong_ban}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nút xuất file */}
          <div className="lg:col-span-3 space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">
              3. Xuất dữ liệu (HĐQT)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coQuyen(nguoiDungHienTai, 'bao_cao.xuat_file') && (
                <>
                  <button
                    type="button"
                    disabled={dangXuat !== null}
                    onClick={() => void xuatExcel()}
                    className="h-9 px-3 rounded-[var(--radius-input)] bg-success hover:bg-success/90 text-success-foreground text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 border border-success/20"
                  >
                    {dangXuat === 'excel' ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="size-3.5" />
                    )}
                    Xuất Excel
                  </button>
                  <button
                    type="button"
                    disabled={dangXuat !== null}
                    onClick={() => void xuatPDF()}
                    className="h-9 px-3 rounded-[var(--radius-input)] bg-danger hover:bg-danger/90 text-danger-foreground text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 border border-danger/20"
                  >
                    {dangXuat === 'pdf' ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileDown className="size-3.5" />
                    )}
                    Xuất PDF
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setLoaiKhoang('ngay');
                  setNgayChon(new Date().toISOString().slice(0, 10));
                  setLocChiNhanhId('');
                  setLocPhongBanId('');
                }}
                className="h-9 col-span-2 px-3 rounded-[var(--radius-input)] border border-border bg-background text-foreground hover:bg-muted text-xs font-semibold transition inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-3.5 text-success" />
                Làm sạch bộ lọc (hiển thị tất cả)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Block 2: BCCV stream moi nhat & BCCV kho khan (2 alert uu tien cao) */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning rounded-[var(--radius-input)] flex items-center justify-center">
                <FileText className="size-[18px]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Báo cáo ngày mới nhất</h3>
                <p className="text-xs text-muted-foreground mt-0.5 opacity-80">Dòng chảy cập nhật 5 BCCV gần đây</p>
              </div>
            </div>
            <Link href="/bao-cao-cong-viec" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0">
              Xem tất cả
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dangTai ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 mr-2 animate-spin" />
              Đang tải BCCV gần đây...
            </div>
          ) : dsBccv.length === 0 ? (
            <div className="py-8 text-center text-[13px] italic text-muted-foreground">
              Chưa có báo cáo công việc nào gần đây
            </div>
          ) : (
            <ul className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {[...dsBccv]
                .sort((a, b) => {
                  const t1 = new Date(a.ngay_cap_nhat || a.ngay_tao).getTime();
                  const t2 = new Date(b.ngay_cap_nhat || b.ngay_tao).getTime();
                  return t2 - t1;
                })
                .slice(0, 5)
                .map((b) => {
                  const ten = tenNguoiDung(b.nhan_vien_id);
                  const nd = b.danh_sach_chi_tiet && b.danh_sach_chi_tiet.length > 0
                    ? b.danh_sach_chi_tiet[0].noi_dung
                    : '(Chưa có nội dung chi tiết)';
                  const coKK = Boolean((b.kho_khan ?? '').trim().length > 0);
                  return (
                    <li key={b.id} className="rounded-[var(--radius-input)] border border-border bg-muted/30 hover:bg-muted/60 transition px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="size-7 rounded-full bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary flex items-center justify-center shrink-0 text-xs font-bold">
                            {(ten || '?').trim().charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-foreground truncate min-w-0">{ten}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {coKK && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning border border-warning/20 px-2 h-5 text-[10px] font-bold">
                              <AlertTriangle className="size-3" />
                              Khó khăn
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {(b.ngay_bao_cao || '').slice(5)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-foreground/90 line-clamp-2">{nd}</p>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        {tk.bccvCoKhoKhan > 0 ? (
          <div className="rounded-[var(--radius-card)] border border-card-icon-br-warning bg-background p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="size-10 bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning rounded-[var(--radius-input)] flex items-center justify-center"><AlertTriangle className="size-[18px]" /></div>
                <div>
                  <div className="font-semibold text-card-icon-fg-warning">Báo cáo có KHÓ KHĂN cần hỗ trợ</div>
                  <div className="text-xs text-card-icon-fg-warning mt-0.5 opacity-80">Quản lý xem kỹ và hỗ trợ nhân sự</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-card-icon-fg-warning">{tk.bccvCoKhoKhan}</div>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {dsBccv
                .filter((x) => (x.kho_khan ?? '').trim().length > 0)
                .slice(0, 5)
                .map((b) => (
                  <div key={b.id} className="text-xs bg-muted rounded-[var(--radius-input)] px-3 py-2 border border-border">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="font-semibold text-card-icon-fg-warning">{tenNguoiDung(b.nhan_vien_id)}</span>
                      <span className="font-mono">{b.ngay_bao_cao.slice(5)}</span>
                    </div>
                    <div className="text-foreground line-clamp-2">{b.kho_khan}</div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-card-icon-br-primary bg-background p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-10 bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary rounded-[var(--radius-input)] flex items-center justify-center"><TrendingUp className="size-[18px]" /></div>
              <div>
                <div className="font-semibold text-card-icon-fg-primary">Không có báo cáo nêu khó khăn</div>
                <div className="text-xs text-card-icon-fg-primary mt-0.5 opacity-80">Tất cả nhân sự đều đang làm việc thuận lợi</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block 3: 3 cot phan tram cong viec / du an + 14 ngay bieu do */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FolderKanban className="size-4 text-card-icon-fg-success" />
              HĐA theo giai đoạn
            </h3>
            <span className="text-xs text-muted-foreground">Tổng {tk.daTong}</span>
          </div>
          <div className="space-y-3">
            {Object.entries(phanBoGiaiDoanDA).length === 0 && (
              <div className="text-[13px] text-muted-foreground italic py-4 text-center">Chưa có dữ liệu</div>
            )}
            {Object.entries(phanBoGiaiDoanDA).map(([giaiDoan, soLuong]) => {
              const pct = tk.daTong === 0 ? 0 : Math.round((soLuong / tk.daTong) * 100);
              const tenGd = giaiDoan.replace(/_/g, ' ');
              return (
                <div key={giaiDoan}>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="font-medium text-foreground capitalize">{tenGd}</span>
                    <span className="text-muted-foreground font-mono">{soLuong} · {pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="size-10 bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success rounded-[var(--radius-input)] flex items-center justify-center">
                <FolderKanban className="size-[18px]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">12 giai đoạn dự án</h3>
                <p className="text-xs text-muted-foreground mt-0.5 opacity-80">Tổng quan tất cả HĐA theo từng giai đoạn</p>
              </div>
            </div>
            <Link href="/ho-so-du-an" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0">
              Mở
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dangTai ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 mr-2 animate-spin" />
              Đang thống kê...
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
              {danhSachGiaiDoan.map((gd) => {
                const sl = dsDa.filter((d) => String(d.giai_doan || 'moi_tao') === gd.key).length;
                const mau = MAU_KIEU_GD[gd.kieu] ?? MAU_KIEU_GD.muted;
                return (
                  <div
                    key={gd.key}
                    className={cn(
                      'rounded-[var(--radius-input)] border px-2 py-2 flex items-center justify-between gap-1 transition hover:shadow-[var(--shadow-card)]',
                      mau
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold opacity-90 leading-none truncate">{gd.nhan}</div>
                    </div>
                    <div className="text-lg font-black leading-none tabular-nums shrink-0">
                      {sl}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="size-4 text-card-icon-fg-primary" />
              Vai trò nhân sự
            </h3>
            <span className="text-xs text-muted-foreground">Tổng {tk.nsTong}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <MiniVaiTro nhan="QTVHT" sl={dsNs.filter((x) => x.vai_tro === 'quan_tri_he_thong').length} tong={tk.nsTong} mau="bg-card-icon-bg-danger text-card-icon-fg-danger border border-card-icon-br-danger" />
            <MiniVaiTro nhan="Giám đốc" sl={dsNs.filter((x) => x.vai_tro === 'giam_doc').length} tong={tk.nsTong} mau="bg-card-icon-bg-warning text-card-icon-fg-warning border border-card-icon-br-warning" />
            <MiniVaiTro nhan="Trưởng phòng" sl={dsNs.filter((x) => x.vai_tro === 'truong_phong').length} tong={tk.nsTong} mau="bg-card-icon-bg-success text-card-icon-fg-success border border-card-icon-br-success" />
            <MiniVaiTro nhan="NV KD" sl={dsNs.filter((x) => x.vai_tro === 'nhan_vien_kinh_doanh').length} tong={tk.nsTong} mau="bg-card-icon-bg-primary text-card-icon-fg-primary border border-card-icon-br-primary" />
          </div>
          <div className="rounded-[var(--radius-input)] bg-muted border border-border p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tỷ lệ tài khoản hoạt động</span>
              <span className="font-mono font-semibold text-foreground">
                {tk.nsTong === 0 ? '—' : `${Math.round(((tk.nsTong - tk.nsKhoa) / tk.nsTong) * 100)}%`}
              </span>
            </div>
            <div className="h-1 mt-2 rounded-full bg-background overflow-hidden">
              <div className="h-full bg-success" style={{
                width: tk.nsTong === 0 ? '0%' : `${Math.round(((tk.nsTong - tk.nsKhoa) / tk.nsTong) * 100)}%`
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Block 4: Biểu đồ cột 14 ngày */}
      <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-card-icon-fg-primary" />
            Hoạt động tạo mới 14 ngày gần nhất
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" /> KH + HĐA</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-card-icon-fg-success" /> + CV + BCCV + NS</span>
            <span className="font-mono bg-muted rounded-[var(--radius-input)] px-2 py-0.5">MAX {maxCot} bản ghi/ngày</span>
          </div>
        </div>
        {dangTai ? (
          <div className="py-12 mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="size-5 mr-2 animate-spin text-card-icon-fg-primary" />
            Đang thu thập dữ liệu biểu đồ...
          </div>
        ) : (
          <div className="mt-4 flex items-end gap-2 h-44 border-b border-border pb-2 px-1">
            {duLieuBieuDo.map(({ ngay, soLuong }, idx) => {
              const chieuCao = Math.max(6, Math.round((soLuong / maxCot) * 140));
              const laHomNay = ngay === NGAY_HOM_NAY;
              const laThuHai = ngay === mang14Ngay[0];
              return (
                <div key={ngay} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  <div className="text-[10px] text-muted-foreground font-mono h-4">{soLuong || ''}</div>
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className={cn(
                        'w-[80%] rounded-t-md transition-all',
                        laHomNay ? 'bg-primary'
                          : idx % 2 ? 'bg-card-icon-fg-success' : 'bg-primary/70'
                      )}
                      style={{ height: chieuCao }}
                      title={`${ngay} · ${soLuong} bản ghi mới`}
                    />
                  </div>
                  <div className={cn(
                    'text-[10px] font-mono h-4 truncate w-full text-center',
                    laHomNay ? 'text-primary font-semibold' : laThuHai || idx === duLieuBieuDo.length - 1 ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {ngay.slice(8)}/{ngay.slice(5, 7)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block 5: Nhật ký hoạt động 10 gần nhất */}
      <div className="rounded-[var(--radius-card)] border border-border bg-background shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            Nhật ký hoạt động gần đây
          </h3>
          <span className="text-xs text-muted-foreground">Realtime · 10 mục</span>
        </div>
        {dsHd.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {dangTai ? 'Đang tải...' : 'Chưa có hoạt động nào được ghi.'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {dsHd.map((hd) => {
              const thongTin = chonTenHanhDong(hd.hanh_dong || '');
              return (
                <li key={hd.id} className="px-6 py-3 flex items-center gap-3 hover:bg-muted transition">
                  <div className={cn('size-8 rounded-[var(--radius-input)] flex items-center justify-center shrink-0 text-xs font-semibold', thongTin.mau)}>
                    {thongTin.nhan.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">
                      <span className="font-semibold">{tenNguoiDung(hd.nguoi_dung_id)}</span>
                      {' · '}
                      <span className="font-medium">{thongTin.nhan}</span>
                      {' · '}
                      <span className="text-muted-foreground">{TEN_COLLECTION[hd.module] ?? hd.module}</span>
                      {hd.ban_ghi_id && (
                        <span className="text-xs text-muted-foreground font-mono ml-1">#{hd.ban_ghi_id.slice(0, 6)}</span>
                      )}
                    </div>
                    {hd.noi_dung && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{hd.noi_dung}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono shrink-0">
                    {formatNgay(hd.thoi_gian)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function CardThongKe(props: {
  icon: React.ReactNode;
  iconMau: string;
  nhan: string;
  giaTri: string | number;
  phu?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{props.nhan}</span>
        <div className={cn('size-10 rounded-[var(--radius-input)] flex items-center justify-center shrink-0', props.iconMau)}>
          {props.icon}
        </div>
      </div>
      <div className="text-2xl tracking-tight font-bold text-foreground leading-tight mb-1">{props.giaTri}</div>
      <div className="text-xs">{props.phu}</div>
    </div>
  );
}

function MiniVaiTro(props: { nhan: string; sl: number; tong: number; mau: string }) {
  const pct = props.tong === 0 ? 0 : Math.round((props.sl / props.tong) * 100);
  return (
    <div className={cn('rounded-[var(--radius-input)] border p-2.5', props.mau)}>
      <div className="text-[11px] font-medium opacity-80">{props.nhan}</div>
      <div className="text-lg font-bold mt-0.5">{props.sl}</div>
      <div className="h-1 mt-1.5 rounded-full bg-background/40 overflow-hidden">
        <div className="h-full bg-current opacity-60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
