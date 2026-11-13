'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FolderPlus,
  Loader2,
  MessageSquareWarning,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Trash2,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { coQuyen } from '../../thu_vien/phan_quyen/kiem_tra_quyen';
import { cn } from '../../thu_vien/utils/cn';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import type { ChiNhanh, NhanSu } from '../../thu_vien/types/nhan_su';
import type { SanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import { danhSachHoSoDuAn, doiGiaiDoanHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachKhachHang } from '../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachSanPhamDichVu } from '../../dich_vu/san_pham_dich_vu/dich_vu_san_pham_dich_vu';
import BangBaoCaoTuanChuanVDCD from './bang_bao_cao_tuan_chuan_vdcd';
import {
  capNhatLichGapKH,
  danhSachLichGapKH,
  taoLichGapKHMoi
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { layTuanHienTaiISO } from '../../dich_vu/ke_hoach/dich_vu_ke_hoach';
import { layDanhSachGiaiDoan } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  dichChuyenTuanISO,
  phanTichTuanISO,
  taoBaoCaoTuanMacDinh,
  tinhSoLieuTuCRM,
  tongHopBaoCaoChiNhanh,
  type BaoCaoTuanVDCD,
  type CauHinhMucTieuBaoCaoTuan,
  type DongDoanhThuTuan,
  type DongKeHoachDuAnTuan
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import {
  duyetBaoCaoTuanVDCD,
  layCauHinhKPIBaoCaoTuan,
  layDanhSachBaoCaoTuanVDCD,
  luuBaoCaoTuanVDCD,
  luuCauHinhKPIBaoCaoTuan
} from '../../dich_vu/bao_cao_tuan_vdcd/dich_vu_bao_cao_tuan_vdcd';
import ModalXuatBaoCaoVDCD, { xuatExcelBaoCaoTuanVDCD } from './xuat_bao_cao_vdcd';

const fmtSo = (n?: number | null) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(n || 0)));

const NHAN_TRANG_THAI: Record<
  BaoCaoTuanVDCD['trang_thai'],
  { label: string; cls: string }
> = {
  nhap: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  cho_duyet: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  da_duyet: { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  can_dieu_chinh: { label: 'Cần điều chỉnh', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
};

type NhomKeHoach = 'dong_tien' | 'tiem_nang';

export default function NoiDungBaoCaoTuan() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const uid = nguoiDungHienTai?.id || '';

  const laQuanLy = useMemo(() => {
    const vt = String(nguoiDungHienTai?.vai_tro || '');
    return (
      vt === 'quan_tri_he_thong' ||
      vt === 'giam_doc' ||
      vt === 'truong_phong_kd' ||
      vt === 'truong_phong' ||
      coQuyen(nguoiDungHienTai, 'ke_hoach.duyet')
    );
  }, [nguoiDungHienTai]);

  const [tuanChon, setTuanChon] = useState<string>(() => layTuanHienTaiISO());
  const [tabChinh, setTabChinh] = useState<'quan_ly' | 'ca_nhan'>('ca_nhan');
  const [nhanVienDangXemId, setNhanVienDangXemId] = useState<string>('');
  const [chiNhanhLocId, setChiNhanhLocId] = useState<string>('tat_ca');

  // Dữ liệu nền CRM
  const [dangTai, setDangTai] = useState(true);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsSanPham, setDsSanPham] = useState<SanPhamDichVu[]>([]);
  const [dsLichGap, setDsLichGap] = useState<LichGapKH[]>([]);
  const [dsBaoCaoTuan, setDsBaoCaoTuan] = useState<BaoCaoTuanVDCD[]>([]);
  const [dsBaoCaoTuanTruoc, setDsBaoCaoTuanTruoc] = useState<BaoCaoTuanVDCD[]>([]);
  const [kpiCauHinh, setKpiCauHinh] = useState<CauHinhMucTieuBaoCaoTuan | null>(null);

  // Bản nháp đang chỉnh sửa cho 1 nhân viên
  const [formBaoCao, setFormBaoCao] = useState<BaoCaoTuanVDCD | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [thongBao, setThongBao] = useState<string | null>(null);

  // Các modal phụ trợ
  const [modalSlide, setModalSlide] = useState<{
    mo: boolean;
    baoCao: BaoCaoTuanVDCD | null;
    lichTuanToi: (LichGapKH & { ten_nhan_vien?: string })[];
    tieuDePhu?: string;
  }>({ mo: false, baoCao: null, lichTuanToi: [] });

  const [modalBaoCaoLich, setModalBaoCaoLich] = useState<{
    lich: LichGapKH | null;
    ketQua: string;
    giaiDoanMoi: string;
    dangLuu: boolean;
  }>({ lich: null, ketQua: '', giaiDoanMoi: '', dangLuu: false });

  const [modalThemLich, setModalThemLich] = useState<{
    mo: boolean;
    ngay: string;
    gioBatDau: string;
    gioKetThuc: string;
    tenKhachHang: string;
    khachHangId: string;
    duAnId: string;
    diaDiem: string;
    noiDung: string;
    dangLuu: boolean;
  }>({
    mo: false,
    ngay: '',
    gioBatDau: '08:30',
    gioKetThuc: '10:30',
    tenKhachHang: '',
    khachHangId: '',
    duAnId: '',
    diaDiem: '',
    noiDung: '',
    dangLuu: false
  });

  const [modalChonDuAn, setModalChonDuAn] = useState<{
    mo: boolean;
    nhom: NhomKeHoach;
    tuKhoa: string;
  }>({ mo: false, nhom: 'tiem_nang', tuKhoa: '' });

  const [modalXemLichNV, setModalXemLichNV] = useState<{
    mo: boolean;
    nhanSu: NhanSu | null;
    lich: LichGapKH[];
  }>({ mo: false, nhanSu: null, lich: [] });

  const [modalYeuCauSua, setModalYeuCauSua] = useState<{
    mo: boolean;
    baoCao: BaoCaoTuanVDCD | null;
    ghiChu: string;
  }>({ mo: false, baoCao: null, ghiChu: '' });

  const [modalKPI, setModalKPI] = useState<{
    mo: boolean;
    kpiThangKy: number;
    kpiThangVe: number;
    kpiNamKy: number;
    kpiNamVe: number;
  }>({ mo: false, kpiThangKy: 0, kpiThangVe: 0, kpiNamKy: 0, kpiNamVe: 0 });

  const [modalDrillDown, setModalDrillDown] = useState<{
    mo: boolean;
    tieuDe: string;
    dsDuAn: HoSoDuAn[];
  }>({ mo: false, tieuDe: '', dsDuAn: [] });

  const infoTuan = useMemo(() => phanTichTuanISO(tuanChon), [tuanChon]);
  const tuanTruocISO = useMemo(() => dichChuyenTuanISO(tuanChon, -1), [tuanChon]);
  const tuanToiISO = useMemo(() => dichChuyenTuanISO(tuanChon, 1), [tuanChon]);
  const infoTuanToi = useMemo(() => phanTichTuanISO(tuanToiISO), [tuanToiISO]);
  const dsGiaiDoan = useMemo(() => layDanhSachGiaiDoan(), []);

  useEffect(() => {
    if (laQuanLy) {
      setTabChinh('quan_ly');
    } else {
      setTabChinh('ca_nhan');
    }
  }, [laQuanLy]);

  useEffect(() => {
    if (uid && !nhanVienDangXemId) {
      setNhanVienDangXemId(uid);
    }
  }, [uid, nhanVienDangXemId]);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const kpiScope = chiNhanhLocId !== 'tat_ca' ? chiNhanhLocId : nguoiDungHienTai?.chi_nhanh_id || 'toan_cong_ty';
      const [resDA, resKH, resNLH, resNS, resCN, resSP, resLich, resBCTuan, resBCTruoc, resKPI] =
        await Promise.all([
          danhSachHoSoDuAn(),
          danhSachKhachHang(),
          danhSachNguoiLienHe().catch(() => ({ mang: [] as NguoiLienHe[] })),
          danhSachNhanSu(),
          danhSachChiNhanh(),
          danhSachSanPhamDichVu().catch(() => ({ mang: [] as SanPhamDichVu[] })),
          danhSachLichGapKH(),
          layDanhSachBaoCaoTuanVDCD(tuanChon),
          layDanhSachBaoCaoTuanVDCD(tuanTruocISO),
          layCauHinhKPIBaoCaoTuan(kpiScope)
        ]);

      setDsDuAn(resDA.mang || []);
      setDsKhachHang(resKH.mang || []);
      setDsNguoiLienHe(resNLH.mang || []);
      setDsNhanSu((resNS.mang || []).filter((n) => n.trang_thai_du_lieu !== 'da_xoa'));
      setDsChiNhanh(resCN.mang || []);
      setDsSanPham(resSP.mang || []);
      setDsLichGap(resLich || []);
      setDsBaoCaoTuan(resBCTuan || []);
      setDsBaoCaoTuanTruoc(resBCTruoc || []);
      setKpiCauHinh(resKPI);
    } finally {
      setDangTai(false);
    }
  }, [tuanChon, tuanTruocISO, chiNhanhLocId, nguoiDungHienTai?.chi_nhanh_id]);

  useEffect(() => {
    void taiDuLieu();
  }, [taiDuLieu]);

  const mapChiNhanh = useMemo(
    () => new Map(dsChiNhanh.map((c) => [c.id, c.ten_chi_nhanh])),
    [dsChiNhanh]
  );

  // Danh sách nhân sự kinh doanh trong phạm vi xem
  const dsSaleTeam = useMemo(() => {
    return dsNhanSu.filter((n) => {
      if (chiNhanhLocId !== 'tat_ca' && n.chi_nhanh_id !== chiNhanhLocId) return false;
      const vt = String(n.vai_tro || '');
      return vt === 'nhan_vien_kinh_doanh' || vt === 'truong_phong_kd' || vt === 'nhan_vien_ky_thuat';
    });
  }, [dsNhanSu, chiNhanhLocId]);

  const nhanSuMucTieu = useMemo(() => {
    const targetId = nhanVienDangXemId || uid;
    return (
      dsNhanSu.find((n) => n.id === targetId) ||
      (nguoiDungHienTai
        ? ({
            id: nguoiDungHienTai.id,
            ho_va_ten: nguoiDungHienTai.ho_va_ten || 'Nhân viên',
            chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id,
            phong_ban_id: nguoiDungHienTai.phong_ban_id
          } as NhanSu)
        : null)
    );
  }, [dsNhanSu, nhanVienDangXemId, uid, nguoiDungHienTai]);

  // Dự án thuộc quyền sở hữu của nhân sự đang chọn
  const dsDuAnCuaNhanSu = useMemo(() => {
    const targetId = nhanSuMucTieu?.id;
    if (!targetId) return [];
    return dsDuAn.filter(
      (d) =>
        d.trang_thai !== 'da_xoa' &&
        (d.nguoi_phu_trach_id === targetId ||
          d.nguoi_quan_ly_id === targetId ||
          (!d.nguoi_phu_trach_id && d.nguoi_tao_id === targetId))
    );
  }, [dsDuAn, nhanSuMucTieu]);

  // Khởi tạo hoặc nạp bản báo cáo tuần của nhân sự đang chọn
  useEffect(() => {
    if (!nhanSuMucTieu || dangTai) return;
    const daCo = dsBaoCaoTuan.find((b) => b.nhan_vien_id === nhanSuMucTieu.id);
    if (daCo) {
      setFormBaoCao(daCo);
      return;
    }

    const truoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nhanSuMucTieu.id) || null;
    const goiY = tinhSoLieuTuCRM({
      tuan: tuanChon,
      dsDuAn: dsDuAnCuaNhanSu,
      dsKhachHang,
      dsSanPham,
      dsChiNhanh,
      dsNhanSu
    });
    const tenCN = nhanSuMucTieu.chi_nhanh_id ? mapChiNhanh.get(nhanSuMucTieu.chi_nhanh_id) : 'An Giang';
    setFormBaoCao(
      taoBaoCaoTuanMacDinh({
        tuan: tuanChon,
        nhanSu: nhanSuMucTieu,
        tenChiNhanh: tenCN,
        goiY,
        baoCaoTuanTruoc: truoc,
        kpiMacDinh: kpiCauHinh
      })
    );
  }, [
    nhanSuMucTieu,
    dangTai,
    dsBaoCaoTuan,
    dsBaoCaoTuanTruoc,
    tuanChon,
    dsDuAnCuaNhanSu,
    dsKhachHang,
    dsSanPham,
    dsChiNhanh,
    dsNhanSu,
    mapChiNhanh,
    kpiCauHinh
  ]);

  const lichTuanNayCuaNV = useMemo(() => {
    const targetId = nhanSuMucTieu?.id;
    if (!targetId) return [];
    return dsLichGap
      .filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuan.ngayBatDau &&
          l.ngay <= infoTuan.ngayKetThuc &&
          (l.nguoi_phu_trach_id === targetId ||
            l.nguoi_tao_id === targetId ||
            (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(targetId)))
      )
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`));
  }, [dsLichGap, nhanSuMucTieu, infoTuan]);

  const lichTuanToiCuaNV = useMemo(() => {
    const targetId = nhanSuMucTieu?.id;
    if (!targetId) return [];
    return dsLichGap
      .filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (l.nguoi_phu_trach_id === targetId ||
            l.nguoi_tao_id === targetId ||
            (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(targetId)))
      )
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`));
  }, [dsLichGap, nhanSuMucTieu, infoTuanToi]);

  // Tính bản báo cáo của từng nhân sự (dù đã lưu hay chưa vẫn có số liệu CRM tức thời để Quản lý check)
  const danhSachBaoCaoTeam = useMemo(() => {
    return dsSaleTeam.map((nv) => {
      const daLuu = dsBaoCaoTuan.find((b) => b.nhan_vien_id === nv.id);
      const lichToi = dsLichGap.filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (l.nguoi_phu_trach_id === nv.id || l.nguoi_tao_id === nv.id)
      );
      if (daLuu) {
        return { nv, baoCao: daLuu, daGui: true, lichToi };
      }
      const dsDaNV = dsDuAn.filter(
        (d) =>
          d.trang_thai !== 'da_xoa' &&
          (d.nguoi_phu_trach_id === nv.id ||
            d.nguoi_quan_ly_id === nv.id ||
            (!d.nguoi_phu_trach_id && d.nguoi_tao_id === nv.id))
      );
      const goiY = tinhSoLieuTuCRM({
        tuan: tuanChon,
        dsDuAn: dsDaNV,
        dsKhachHang,
        dsSanPham,
        dsChiNhanh,
        dsNhanSu
      });
      const truoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nv.id) || null;
      const tenCN = nv.chi_nhanh_id ? mapChiNhanh.get(nv.chi_nhanh_id) : 'An Giang';
      return {
        nv,
        baoCao: taoBaoCaoTuanMacDinh({
          tuan: tuanChon,
          nhanSu: nv,
          tenChiNhanh: tenCN,
          goiY,
          baoCaoTuanTruoc: truoc,
          kpiMacDinh: kpiCauHinh
        }),
        daGui: false,
        lichToi
      };
    });
  }, [
    dsSaleTeam,
    dsBaoCaoTuan,
    dsBaoCaoTuanTruoc,
    dsLichGap,
    infoTuanToi,
    dsDuAn,
    tuanChon,
    dsKhachHang,
    dsSanPham,
    dsChiNhanh,
    dsNhanSu,
    mapChiNhanh,
    kpiCauHinh
  ]);

  const baoCaoTongChiNhanh = useMemo(() => {
    const tenDonVi =
      chiNhanhLocId !== 'tat_ca'
        ? mapChiNhanh.get(chiNhanhLocId) || 'AN GIANG'
        : (nguoiDungHienTai?.chi_nhanh_id && mapChiNhanh.get(nguoiDungHienTai.chi_nhanh_id)) || 'AN GIANG';
    return tongHopBaoCaoChiNhanh({
      tuan: tuanChon,
      tenDonVi,
      danhSachBaoCao: danhSachBaoCaoTeam.map((x) => x.baoCao),
      kpiDonVi: kpiCauHinh
    });
  }, [chiNhanhLocId, mapChiNhanh, nguoiDungHienTai?.chi_nhanh_id, tuanChon, danhSachBaoCaoTeam, kpiCauHinh]);

  const lichTuanToiToanTeam = useMemo(() => {
    const mapTenNV = new Map(dsNhanSu.map((n) => [n.id, n.ho_va_ten]));
    const allowedIds = new Set(dsSaleTeam.map((n) => n.id));
    return dsLichGap
      .filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (allowedIds.has(l.nguoi_phu_trach_id) || allowedIds.has(l.nguoi_tao_id))
      )
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`))
      .map((l) => ({
        ...l,
        ten_nhan_vien: mapTenNV.get(l.nguoi_phu_trach_id) || ''
      }));
  }, [dsLichGap, dsNhanSu, dsSaleTeam, infoTuanToi]);

  const hienThongBao = (msg: string) => {
    setThongBao(msg);
    setTimeout(() => setThongBao(null), 3200);
  };

  const dongBoLaiTuCRM = () => {
    if (!formBaoCao || !nhanSuMucTieu) return;
    const truoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nhanSuMucTieu.id) || null;
    const goiY = tinhSoLieuTuCRM({
      tuan: tuanChon,
      dsDuAn: dsDuAnCuaNhanSu,
      dsKhachHang,
      dsSanPham,
      dsChiNhanh,
      dsNhanSu
    });
    setFormBaoCao({
      ...formBaoCao,
      tinh_trang_tuan_nay: goiY.tinh_trang_tuan_nay,
      tinh_trang_tuan_truoc: truoc?.tinh_trang_tuan_nay || formBaoCao.tinh_trang_tuan_truoc,
      nguon_tuan_nay: goiY.nguon_tuan_nay,
      nguon_tuan_truoc: truoc?.nguon_tuan_nay || formBaoCao.nguon_tuan_truoc,
      thuc_hien_tiep_can_tuan_nay: goiY.tinh_trang_tuan_nay.tong_tiep_can,
      dt_tuan_ky_ket: goiY.dt_tuan_ky_ket,
      dt_tuan_tien_ve: goiY.dt_tuan_tien_ve,
      mtd_ky_ket: goiY.mtd_ky_ket,
      mtd_tien_ve: goiY.mtd_tien_ve,
      ytd_ky_ket: goiY.ytd_ky_ket,
      ytd_tien_ve: goiY.ytd_tien_ve,
      chi_tiet_doanh_thu: goiY.chi_tiet_doanh_thu
    });
    hienThongBao('Đã cập nhật số liệu mới nhất từ Hồ sơ dự án.');
  };

  const luuBaoCao = async (trangThaiMoi?: BaoCaoTuanVDCD['trang_thai']) => {
    if (!formBaoCao) return;
    setDangLuu(true);
    try {
      const next: BaoCaoTuanVDCD = {
        ...formBaoCao,
        trang_thai: trangThaiMoi ?? formBaoCao.trang_thai
      };
      const saved = await luuBaoCaoTuanVDCD(next);
      setFormBaoCao(saved);
      setDsBaoCaoTuan((prev) => [saved, ...prev.filter((x) => x.id !== saved.id)]);
      hienThongBao(
        trangThaiMoi === 'cho_duyet'
          ? 'Đã gửi báo cáo & lịch tuần lên Quản lý duyệt.'
          : 'Đã lưu báo cáo tuần.'
      );
    } finally {
      setDangLuu(false);
    }
  };

  const handleLuuBaoCaoChuan = async (
    capNhat: Partial<BaoCaoTuanVDCD>,
    nopBaoCao: boolean
  ) => {
    if (!formBaoCao) return;
    const next: BaoCaoTuanVDCD = {
      ...formBaoCao,
      ...capNhat,
      trang_thai: nopBaoCao ? 'cho_duyet' : (capNhat.trang_thai || formBaoCao.trang_thai)
    };
    setDangLuu(true);
    try {
      const saved = await luuBaoCaoTuanVDCD(next);
      setFormBaoCao(saved);
      setDsBaoCaoTuan((prev) => [saved, ...prev.filter((x) => x.id !== saved.id)]);
      hienThongBao(
        nopBaoCao
          ? 'Đã gửi báo cáo & lịch tuần lên Quản lý duyệt.'
          : 'Đã lưu báo cáo kế hoạch tuần.'
      );
    } finally {
      setDangLuu(false);
    }
  };

  const xuLyLuuBaoCaoNhanhLich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBaoCaoLich.lich || !modalBaoCaoLich.ketQua.trim()) return;
    setModalBaoCaoLich((p) => ({ ...p, dangLuu: true }));
    try {
      const lich = modalBaoCaoLich.lich;
      const kq = modalBaoCaoLich.ketQua.trim();
      await capNhatLichGapKH(
        lich.id,
        { trang_thai: 'da_hoan_thanh', ket_qua: kq },
        uid
      );
      setDsLichGap((prev) =>
        prev.map((x) =>
          x.id === lich.id ? { ...x, trang_thai: 'da_hoan_thanh', ket_qua: kq } : x
        )
      );
      if (lich.du_an_id && modalBaoCaoLich.giaiDoanMoi) {
        const daHienTai = dsDuAn.find((d) => d.id === lich.du_an_id);
        if (daHienTai && daHienTai.giai_doan !== modalBaoCaoLich.giaiDoanMoi) {
          const daMoi = await doiGiaiDoanHoSoDuAn(
            lich.du_an_id,
            modalBaoCaoLich.giaiDoanMoi,
            nguoiDungHienTai
          );
          setDsDuAn((prev) => prev.map((d) => (d.id === daMoi.id ? daMoi : d)));
        }
      }
      setModalBaoCaoLich({ lich: null, ketQua: '', giaiDoanMoi: '', dangLuu: false });
      hienThongBao('Đã lưu kết quả công tác.');
    } catch {
      alert('Không thể lưu kết quả công tác.');
      setModalBaoCaoLich((p) => ({ ...p, dangLuu: false }));
    }
  };

  const xuLyThemLichTuanToi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nhanSuMucTieu || !modalThemLich.ngay || !modalThemLich.tenKhachHang.trim()) return;
    setModalThemLich((p) => ({ ...p, dangLuu: true }));
    try {
      const lichMoi = await taoLichGapKHMoi({
        tieu_de: modalThemLich.noiDung.trim() || `Làm việc ${modalThemLich.tenKhachHang.trim()}`,
        khach_hang_id: modalThemLich.khachHangId || null,
        ten_khach_hang: modalThemLich.tenKhachHang.trim(),
        du_an_id: modalThemLich.duAnId || null,
        nguoi_phu_trach_id: nhanSuMucTieu.id,
        nguoi_tham_gia_ids: [],
        chi_nhanh_id: nhanSuMucTieu.chi_nhanh_id || null,
        ngay: modalThemLich.ngay,
        gio_bat_dau: modalThemLich.gioBatDau,
        gio_ket_thuc: modalThemLich.gioKetThuc,
        dia_diem: modalThemLich.diaDiem.trim() || null,
        noi_dung: modalThemLich.noiDung.trim() || null,
        ket_qua: null,
        trang_thai: 'sap_toi',
        nguoi_tao_id: uid || nhanSuMucTieu.id
      });
      setDsLichGap((prev) => [lichMoi, ...prev]);
      setModalThemLich({
        mo: false,
        ngay: '',
        gioBatDau: '08:30',
        gioKetThuc: '10:30',
        tenKhachHang: '',
        khachHangId: '',
        duAnId: '',
        diaDiem: '',
        noiDung: '',
        dangLuu: false
      });
      hienThongBao('Đã thêm lịch công tác tuần tới.');
    } catch {
      alert('Không thể tạo lịch công tác.');
      setModalThemLich((p) => ({ ...p, dangLuu: false }));
    }
  };

  const layKeyKeHoach = (nhom: NhomKeHoach): 'ke_hoach_dong_tien' | 'ke_hoach_tiem_nang' =>
    nhom === 'dong_tien' ? 'ke_hoach_dong_tien' : 'ke_hoach_tiem_nang';

  const capNhatDongKeHoach = (
    nhom: NhomKeHoach,
    id: string,
    patch: Partial<DongKeHoachDuAnTuan>
  ) => {
    if (!formBaoCao) return;
    const key = layKeyKeHoach(nhom);
    setFormBaoCao({
      ...formBaoCao,
      [key]: formBaoCao[key].map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  };

  const xoaDongKeHoach = (nhom: NhomKeHoach, id: string) => {
    if (!formBaoCao) return;
    const key = layKeyKeHoach(nhom);
    setFormBaoCao({
      ...formBaoCao,
      [key]: formBaoCao[key].filter((item) => item.id !== id)
    });
  };

  const themDongKeHoachTuDuAn = (da: HoSoDuAn) => {
    if (!formBaoCao) return;
    const kh = dsKhachHang.find((k) => k.id === da.khach_hang_id);
    const sp = dsSanPham.find((s) => s.id === da.san_pham_dich_vu_id);
    const gdNhan = dsGiaiDoan.find((g) => g.key === da.giai_doan)?.nhan_ngan || String(da.giai_doan);
    const tenCN = (da.chi_nhanh_id && mapChiNhanh.get(da.chi_nhanh_id)) || formBaoCao.ten_chi_nhanh || 'An Giang';
    const row: DongKeHoachDuAnTuan = {
      id: `${modalChonDuAn.nhom}_${Date.now()}_${da.id}`,
      du_an_id: da.id,
      ten_khach_hang: kh?.ten_khach_hang || da.ten_du_an,
      giam_doc_du_an: tenCN,
      san_pham: sp?.ten_san_pham || da.san_pham_khac_mo_ta || da.ten_du_an,
      trang_thai: gdNhan,
      doanh_thu_ky_ket: Number(da.gia_tri_hop_dong || da.gia_tri_du_kien || 0),
      doanh_thu_tien_ve: Number(da.tien_ve_thuc_te || 0),
      ghi_chu_tien_ve: null,
      de_xuat: ''
    };
    const key = layKeyKeHoach(modalChonDuAn.nhom);
    setFormBaoCao({
      ...formBaoCao,
      [key]: [...formBaoCao[key], row]
    });
    setModalChonDuAn((p) => ({ ...p, mo: false }));
  };

  const themDongKeHoachTay = (nhom: NhomKeHoach) => {
    if (!formBaoCao) return;
    const row: DongKeHoachDuAnTuan = {
      id: `${nhom}_tay_${Date.now()}`,
      ten_khach_hang: '',
      giam_doc_du_an: formBaoCao.ten_chi_nhanh || 'An Giang',
      san_pham: '',
      trang_thai: 'Đang tiếp cận',
      doanh_thu_ky_ket: 0,
      doanh_thu_tien_ve: 0,
      de_xuat: ''
    };
    const key = layKeyKeHoach(nhom);
    setFormBaoCao({ ...formBaoCao, [key]: [...formBaoCao[key], row] });
  };

  const handleDuyetTuan = async (
    bc: BaoCaoTuanVDCD,
    trangThai: 'da_duyet' | 'can_dieu_chinh',
    ghiChu?: string
  ) => {
    const updated = await duyetBaoCaoTuanVDCD({
      baoCao: bc,
      trangThai,
      nguoiDuyetId: uid,
      tenNguoiDuyet: nguoiDungHienTai?.ho_va_ten || 'Quản lý',
      ghiChuQuanLy: ghiChu ?? null
    });
    setDsBaoCaoTuan((prev) => [updated, ...prev.filter((x) => x.id !== updated.id)]);
    if (formBaoCao?.id === updated.id) setFormBaoCao(updated);
    hienThongBao(trangThai === 'da_duyet' ? `Đã duyệt tuần cho ${bc.ten_nhan_vien}.` : 'Đã gửi yêu cầu điều chỉnh.');
  };

  const renderBangKeHoachUI = (
    nhom: NhomKeHoach,
    tieuDe: string,
    danhSach: DongKeHoachDuAnTuan[]
  ) => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800">{tieuDe}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[11px] font-bold tabular-nums">
            {danhSach.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setModalChonDuAn({ mo: true, nhom, tuKhoa: '' })}
            className="h-7.5 px-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <FolderPlus className="size-3.5" />
            <span>Chọn dự án</span>
          </button>
          <button
            type="button"
            onClick={() => themDongKeHoachTay(nhom)}
            className="h-7.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Thêm dòng</span>
          </button>
        </div>
      </div>

      {danhSach.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">Chưa có dự án trong mục này.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] text-slate-500 uppercase">
                <th className="py-2.5 px-3 min-w-[200px]">Tên khách hàng</th>
                <th className="py-2.5 px-3 min-w-[180px]">Sản phẩm / Dự án</th>
                <th className="py-2.5 px-3 w-[150px]">Trạng thái</th>
                <th className="py-2.5 px-3 w-[140px] text-right">DT ký kết</th>
                <th className="py-2.5 px-3 w-[140px] text-right">DT tiền về</th>
                <th className="py-2.5 px-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {danhSach.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="py-1.5 px-2.5">
                    <input
                      type="text"
                      value={row.ten_khach_hang}
                      onChange={(e) =>
                        capNhatDongKeHoach(nhom, row.id, { ten_khach_hang: e.target.value })
                      }
                      className="w-full h-8 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white bg-transparent text-xs font-medium outline-hidden"
                      placeholder="Tên khách hàng..."
                    />
                  </td>
                  <td className="py-1.5 px-2.5">
                    <input
                      type="text"
                      value={row.san_pham}
                      onChange={(e) =>
                        capNhatDongKeHoach(nhom, row.id, { san_pham: e.target.value })
                      }
                      className="w-full h-8 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white bg-transparent text-xs outline-hidden"
                      placeholder="Sản phẩm / Dự án..."
                    />
                  </td>
                  <td className="py-1.5 px-2.5">
                    <input
                      type="text"
                      value={row.trang_thai}
                      onChange={(e) =>
                        capNhatDongKeHoach(nhom, row.id, { trang_thai: e.target.value })
                      }
                      className="w-full h-8 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white bg-transparent text-xs outline-hidden"
                    />
                  </td>
                  <td className="py-1.5 px-2.5">
                    <input
                      type="number"
                      value={row.doanh_thu_ky_ket || ''}
                      onChange={(e) =>
                        capNhatDongKeHoach(nhom, row.id, {
                          doanh_thu_ky_ket: Number(e.target.value || 0)
                        })
                      }
                      className="w-full h-8 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white bg-transparent text-xs text-right tabular-nums outline-hidden"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-1.5 px-2.5">
                    <input
                      type="number"
                      value={row.doanh_thu_tien_ve || ''}
                      onChange={(e) =>
                        capNhatDongKeHoach(nhom, row.id, {
                          doanh_thu_tien_ve: Number(e.target.value || 0)
                        })
                      }
                      className="w-full h-8 px-2 rounded-lg border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white bg-transparent text-xs text-right tabular-nums outline-hidden"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => xoaDongKeHoach(nhom, row.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Xóa dòng"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Thanh điều hướng Tuần + Chế độ xem */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setTuanChon((t) => dichChuyenTuanISO(t, -1))}
              className="size-8 rounded-lg hover:bg-white inline-flex items-center justify-center text-slate-600 cursor-pointer transition"
              title="Tuần trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="px-2.5 text-center">
              <div className="text-xs font-extrabold text-slate-900 uppercase">
                {infoTuan.nhanTieuDe}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {infoTuan.khoangNgayNhan}/{infoTuan.nam}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTuanChon((t) => dichChuyenTuanISO(t, 1))}
              className="size-8 rounded-lg hover:bg-white inline-flex items-center justify-center text-slate-600 cursor-pointer transition"
              title="Tuần sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTuanChon(layTuanHienTaiISO())}
            className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Tuần này
          </button>

          {laQuanLy && (
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTabChinh('quan_ly')}
                className={cn(
                  'h-7 px-3 rounded-lg transition cursor-pointer',
                  tabChinh === 'quan_ly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Tổng hợp Chi nhánh &amp; Duyệt tuần
              </button>
              <button
                type="button"
                onClick={() => setTabChinh('ca_nhan')}
                className={cn(
                  'h-7 px-3 rounded-lg transition cursor-pointer',
                  tabChinh === 'ca_nhan'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Chi tiết nhân sự
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {laQuanLy && dsChiNhanh.length > 0 && (
            <select
              value={chiNhanhLocId}
              onChange={(e) => setChiNhanhLocId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="tat_ca">Tất cả chi nhánh</option>
              {dsChiNhanh.map((cnItem) => (
                <option key={cnItem.id} value={cnItem.id}>
                  {cnItem.ten_chi_nhanh}
                </option>
              ))}
            </select>
          )}

          {tabChinh === 'ca_nhan' && laQuanLy && (
            <select
              value={nhanSuMucTieu?.id || ''}
              onChange={(e) => setNhanVienDangXemId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
            >
              {dsSaleTeam.map((nv) => (
                <option key={nv.id} value={nv.id}>
                  {nv.ho_va_ten}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {thongBao && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{thongBao}</span>
        </div>
      )}

      {dangTai ? (
        <div className="py-20 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
          <Loader2 className="size-5 animate-spin text-blue-600" />
          <span>Đang tổng hợp dữ liệu...</span>
        </div>
      ) : tabChinh === 'quan_ly' && laQuanLy ? (
        /* ================================================================= */
        /* TAB QUẢN LÝ: DUYỆT LỊCH TUẦN TEAM & XUẤT FILE TỔNG CHI NHÁNH      */
        /* ================================================================= */
        <div className="space-y-5">
          {/* Card Tổng hợp Chi nhánh */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase">
                  Báo cáo Tổng hợp {baoCaoTongChiNhanh.ten_chi_nhanh} — {infoTuan.nhanTieuDe}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setModalKPI({
                      mo: true,
                      kpiThangKy: kpiCauHinh?.kpi_thang_ky_ket || baoCaoTongChiNhanh.kpi_thang_ky_ket,
                      kpiThangVe: kpiCauHinh?.kpi_thang_tien_ve || baoCaoTongChiNhanh.kpi_thang_tien_ve,
                      kpiNamKy: kpiCauHinh?.kpi_nam_ky_ket || baoCaoTongChiNhanh.kpi_nam_ky_ket,
                      kpiNamVe: kpiCauHinh?.kpi_nam_tien_ve || baoCaoTongChiNhanh.kpi_nam_tien_ve
                    })
                  }
                  className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings2 className="size-3.5" />
                  <span>Cấu hình KPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => xuatExcelBaoCaoTuanVDCD(baoCaoTongChiNhanh, lichTuanToiToanTeam)}
                  className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>Xuất Excel Tổng</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalSlide({
                      mo: true,
                      baoCao: baoCaoTongChiNhanh,
                      lichTuanToi: lichTuanToiToanTeam,
                      tieuDePhu: `Tổng hợp ${danhSachBaoCaoTeam.length} nhân sự`
                    })
                  }
                  className="h-9 px-4 rounded-xl bg-[#D11317] hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>Xem Slide &amp; Xuất PDF Tổng</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(() => {
                const pctThangKy =
                  baoCaoTongChiNhanh.kpi_thang_ky_ket > 0
                    ? Math.min(100, Math.round((baoCaoTongChiNhanh.mtd_ky_ket / baoCaoTongChiNhanh.kpi_thang_ky_ket) * 100))
                    : 0;
                const pctThangVe =
                  baoCaoTongChiNhanh.kpi_thang_tien_ve > 0
                    ? Math.min(100, Math.round((baoCaoTongChiNhanh.mtd_tien_ve / baoCaoTongChiNhanh.kpi_thang_tien_ve) * 100))
                    : 0;
                const tt = baoCaoTongChiNhanh.tinh_trang_tuan_nay;
                const pctBaoGia =
                  tt.tong_tiep_can > 0
                    ? Math.round(((tt.bao_gia + tt.hop_dong) / tt.tong_tiep_can) * 100)
                    : 0;
                const soDaGui = danhSachBaoCaoTeam.filter(
                  (x) => x.baoCao.trang_thai === 'cho_duyet' || x.baoCao.trang_thai === 'da_duyet'
                ).length;
                const pctGui =
                  danhSachBaoCaoTeam.length > 0
                    ? Math.round((soDaGui / danhSachBaoCaoTeam.length) * 100)
                    : 0;

                return (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>DT Ký kết tuần</span>
                        {baoCaoTongChiNhanh.kpi_thang_ky_ket > 0 && (
                          <span className="text-blue-700 font-bold tabular-nums">{pctThangKy}% KPI tháng</span>
                        )}
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {fmtSo(baoCaoTongChiNhanh.dt_tuan_ky_ket)}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pctThangKy}%` }} />
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Tháng: <span className="font-semibold text-slate-700">{fmtSo(baoCaoTongChiNhanh.mtd_ky_ket)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>DT Tiền về tuần</span>
                        {baoCaoTongChiNhanh.kpi_thang_tien_ve > 0 && (
                          <span className="text-emerald-700 font-bold tabular-nums">{pctThangVe}% KPI tháng</span>
                        )}
                      </div>
                      <div className="text-lg font-extrabold text-emerald-700 tabular-nums">
                        {fmtSo(baoCaoTongChiNhanh.dt_tuan_tien_ve)}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pctThangVe}%` }} />
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Tháng: <span className="font-semibold text-slate-700">{fmtSo(baoCaoTongChiNhanh.mtd_tien_ve)}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Phễu Tiếp cận toàn đội</span>
                        <span className="text-indigo-700 font-bold tabular-nums">{pctBaoGia}% lên BG/HĐ</span>
                      </div>
                      <div className="text-lg font-extrabold text-blue-700 tabular-nums">
                        {tt.tong_tiep_can} dự án
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Báo giá: {tt.bao_gia}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HĐ: {tt.hop_dong}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Nộp tuần &amp; Lịch tuần tới</span>
                        <span className="text-slate-700 font-bold tabular-nums">{pctGui}%</span>
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {soDaGui}/{danhSachBaoCaoTeam.length} nhân sự
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${pctGui}%` }} />
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Lịch tuần tới: <span className="font-semibold text-slate-800">{lichTuanToiToanTeam.length} buổi</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Bảng Duyệt lịch & Báo cáo tuần từng nhân viên */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase">
                <Users className="size-4 text-blue-600" />
                <span>Danh sách nhân sự &amp; Duyệt lịch tuần</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4 min-w-[180px]">Nhân sự</th>
                    <th className="py-3 px-3 w-[125px]">Trạng thái</th>
                    <th className="py-3 px-3 w-[150px] text-right">DT Tuần (Ký / Về)</th>
                    <th className="py-3 px-3 w-[120px] text-center">Tiếp cận</th>
                    <th className="py-3 px-3 w-[140px] text-center">Lịch tuần tới</th>
                    <th className="py-3 px-4 w-[1%] whitespace-nowrap text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {danhSachBaoCaoTeam.map(({ nv, baoCao, daGui, lichToi }) => {
                    const st = NHAN_TRANG_THAI[baoCao.trang_thai];
                    return (
                      <tr key={nv.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setNhanVienDangXemId(nv.id);
                              setTabChinh('ca_nhan');
                            }}
                            className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-left"
                          >
                            {nv.ho_va_ten}
                          </button>
                          <div className="text-[11px] text-slate-500">
                            {daGui ? 'Đã lưu dữ liệu tuần' : 'Số liệu tự động từ CRM'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', st.cls)}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          <div className="font-semibold text-slate-900">{fmtSo(baoCao.dt_tuan_ky_ket)}</div>
                          <div className="text-[11px] text-emerald-700">{fmtSo(baoCao.dt_tuan_tien_ve)}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold">
                          {baoCao.tinh_trang_tuan_nay.tong_tiep_can} DA
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setModalXemLichNV({ mo: true, nhanSu: nv, lich: lichToi })}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                          >
                            {lichToi.length} lịch hẹn
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {baoCao.trang_thai !== 'da_duyet' && (
                              <button
                                type="button"
                                onClick={() => handleDuyetTuan(baoCao, 'da_duyet')}
                                className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="size-3.5" />
                                <span>Duyệt</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setModalYeuCauSua({
                                  mo: true,
                                  baoCao,
                                  ghiChu: baoCao.ghi_chu_quan_ly || ''
                                })
                              }
                              className="h-7 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquareWarning className="size-3.5" />
                              <span>Yêu cầu sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setModalSlide({
                                  mo: true,
                                  baoCao,
                                  lichTuanToi: lichToi.map((l) => ({ ...l, ten_nhan_vien: nv.ho_va_ten })),
                                  tieuDePhu: `Nhân sự: ${nv.ho_va_ten}`
                                })
                              }
                              className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              title="Xem Slide / Xuất PDF"
                            >
                              <Download className="size-3.5" />
                              <span>Xuất file</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* TAB CÁ NHÂN: BẢNG BÁO CÁO KẾ HOẠCH TUẦN CHUẨN 4 KHỐI VDCD         */
        /* (TỰ ĐỘNG LẤY LỊCH CÔNG TÁC & XUẤT FILE EXCEL MẪU GOOGLE SHEET)     */
        /* ================================================================= */
        formBaoCao && nhanSuMucTieu && (
          <BangBaoCaoTuanChuanVDCD
            tuan={tuanChon}
            nhanSu={nhanSuMucTieu}
            dsDuAn={dsDuAn}
            dsKhachHang={dsKhachHang}
            dsNguoiLienHe={dsNguoiLienHe}
            dsSanPham={dsSanPham}
            dsLichGap={dsLichGap}
            baoCaoHienTai={formBaoCao}
            onLuuBaoCao={handleLuuBaoCaoChuan}
            laQuanLy={laQuanLy}
          />
        )
      )}

      {/* MODAL BÁO CÁO NHANH CHUYẾN CÔNG TÁC */}
      {modalBaoCaoLich.lich && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={xuLyLuuBaoCaoNhanhLich}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                Báo cáo kết quả — {modalBaoCaoLich.lich.ten_khach_hang}
              </h3>
              <button
                type="button"
                onClick={() => setModalBaoCaoLich({ lich: null, ketQua: '', giaiDoanMoi: '', dangLuu: false })}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Kết quả làm việc *
              </label>
              <textarea
                rows={3}
                value={modalBaoCaoLich.ketQua}
                onChange={(e) => setModalBaoCaoLich((p) => ({ ...p, ketQua: e.target.value }))}
                placeholder="Ghi ngắn gọn kết quả sau buổi làm việc..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-hidden focus:border-blue-500"
                required
                autoFocus
              />
            </div>

            {modalBaoCaoLich.lich.du_an_id && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cập nhật giai đoạn dự án (nếu đổi)
                </label>
                <select
                  value={modalBaoCaoLich.giaiDoanMoi}
                  onChange={(e) => setModalBaoCaoLich((p) => ({ ...p, giaiDoanMoi: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-slate-200 px-2.5 text-xs"
                >
                  {dsGiaiDoan.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.nhan_ngan}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalBaoCaoLich({ lich: null, ketQua: '', giaiDoanMoi: '', dangLuu: false })}
                className="h-8.5 px-3 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={modalBaoCaoLich.dangLuu}
                className="h-8.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {modalBaoCaoLich.dangLuu && <Loader2 className="size-3.5 animate-spin" />}
                <span>Lưu kết quả</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL THÊM LỊCH TUẦN TỚI */}
      {modalThemLich.mo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={xuLyThemLichTuanToi}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Thêm lịch công tác tuần tới</h3>
              <button
                type="button"
                onClick={() => setModalThemLich((p) => ({ ...p, mo: false }))}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Ngày *</span>
                <input
                  type="date"
                  value={modalThemLich.ngay}
                  onChange={(e) => setModalThemLich((p) => ({ ...p, ngay: e.target.value }))}
                  className="w-full h-8.5 px-2 rounded-lg border border-slate-200"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Từ giờ</span>
                <input
                  type="time"
                  value={modalThemLich.gioBatDau}
                  onChange={(e) => setModalThemLich((p) => ({ ...p, gioBatDau: e.target.value }))}
                  className="w-full h-8.5 px-2 rounded-lg border border-slate-200"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">Đến giờ</span>
                <input
                  type="time"
                  value={modalThemLich.gioKetThuc}
                  onChange={(e) => setModalThemLich((p) => ({ ...p, gioKetThuc: e.target.value }))}
                  className="w-full h-8.5 px-2 rounded-lg border border-slate-200"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="font-semibold text-slate-700">Gắn dự án (tùy chọn)</span>
              <select
                value={modalThemLich.duAnId}
                onChange={(e) => {
                  const da = dsDuAnCuaNhanSu.find((d) => d.id === e.target.value);
                  const kh = da ? dsKhachHang.find((k) => k.id === da.khach_hang_id) : undefined;
                  setModalThemLich((p) => ({
                    ...p,
                    duAnId: e.target.value,
                    khachHangId: da?.khach_hang_id || p.khachHangId,
                    tenKhachHang: kh?.ten_khach_hang || da?.ten_du_an || p.tenKhachHang
                  }));
                }}
                className="w-full h-8.5 px-2 rounded-lg border border-slate-200"
              >
                <option value="">-- Không gắn dự án --</option>
                {dsDuAnCuaNhanSu.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ten_du_an}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-semibold text-slate-700">Khách hàng / Địa bàn *</span>
              <input
                type="text"
                value={modalThemLich.tenKhachHang}
                onChange={(e) => setModalThemLich((p) => ({ ...p, tenKhachHang: e.target.value }))}
                placeholder="VD: UBND xã Châu Phong..."
                className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="font-semibold text-slate-700">Địa điểm</span>
              <input
                type="text"
                value={modalThemLich.diaDiem}
                onChange={(e) => setModalThemLich((p) => ({ ...p, diaDiem: e.target.value }))}
                placeholder="Địa điểm làm việc..."
                className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200"
              />
            </label>

            <label className="block space-y-1">
              <span className="font-semibold text-slate-700">Nội dung công tác</span>
              <textarea
                rows={2}
                value={modalThemLich.noiDung}
                onChange={(e) => setModalThemLich((p) => ({ ...p, noiDung: e.target.value }))}
                placeholder="Mục tiêu buổi gặp..."
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalThemLich((p) => ({ ...p, mo: false }))}
                className="h-8.5 px-3 rounded-xl border border-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={modalThemLich.dangLuu}
                className="h-8.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {modalThemLich.dangLuu && <Loader2 className="size-3.5 animate-spin" />}
                <span>Lưu lịch</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CHỌN DỰ ÁN VÀO KẾ HOẠCH TUẦN TỚI */}
      {modalChonDuAn.mo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Chọn dự án đưa vào kế hoạch</h3>
              <button
                type="button"
                onClick={() => setModalChonDuAn((p) => ({ ...p, mo: false }))}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <input
              type="text"
              value={modalChonDuAn.tuKhoa}
              onChange={(e) => setModalChonDuAn((p) => ({ ...p, tuKhoa: e.target.value }))}
              placeholder="Tìm tên dự án hoặc khách hàng..."
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
              autoFocus
            />
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
              {dsDuAnCuaNhanSu
                .filter((d) => {
                  const q = modalChonDuAn.tuKhoa.trim().toLowerCase();
                  if (!q) return true;
                  const kh = dsKhachHang.find((k) => k.id === d.khach_hang_id);
                  return (
                    d.ten_du_an.toLowerCase().includes(q) ||
                    (kh?.ten_khach_hang || '').toLowerCase().includes(q)
                  );
                })
                .map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => themDongKeHoachTuDuAn(d)}
                    className="w-full py-2.5 px-2 text-left hover:bg-blue-50/60 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{d.ten_du_an}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {dsKhachHang.find((k) => k.id === d.khach_hang_id)?.ten_khach_hang || '—'}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 shrink-0">
                      {fmtSo(d.gia_tri_hop_dong || d.gia_tri_du_kien)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT LỊCH CÔNG TÁC TUẦN TỚI CỦA 1 NHÂN VIÊN */}
      {modalXemLichNV.mo && modalXemLichNV.nhanSu && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch {infoTuanToi.nhanTieuDe} — {modalXemLichNV.nhanSu.ho_va_ten}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalXemLichNV({ mo: false, nhanSu: null, lich: [] })}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            {modalXemLichNV.lich.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nhân sự chưa có lịch công tác nào trong tuần tới.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {modalXemLichNV.lich.map((l) => (
                  <div key={l.id} className="py-2.5 text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{l.ngay}</span>
                      <span className="text-slate-500">
                        {l.gio_bat_dau} - {l.gio_ket_thuc}
                      </span>
                      <span className="font-bold text-slate-900">{l.ten_khach_hang}</span>
                    </div>
                    <div className="text-slate-600">{l.noi_dung || l.tieu_de}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL YÊU CẦU ĐIỀU CHỈNH */}
      {modalYeuCauSua.mo && modalYeuCauSua.baoCao && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!modalYeuCauSua.baoCao) return;
              await handleDuyetTuan(modalYeuCauSua.baoCao, 'can_dieu_chinh', modalYeuCauSua.ghiChu);
              setModalYeuCauSua({ mo: false, baoCao: null, ghiChu: '' });
            }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Yêu cầu điều chỉnh — {modalYeuCauSua.baoCao.ten_nhan_vien}
            </h3>
            <textarea
              rows={3}
              value={modalYeuCauSua.ghiChu}
              onChange={(e) => setModalYeuCauSua((p) => ({ ...p, ghiChu: e.target.value }))}
              placeholder="Ghi rõ nội dung cần bổ sung hoặc điều chỉnh lịch..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
              required
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalYeuCauSua({ mo: false, baoCao: null, ghiChu: '' })}
                className="h-8.5 px-3 rounded-xl border border-slate-200 text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="h-8.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CẤU HÌNH KPI CHI NHÁNH */}
      {modalKPI.mo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const scope =
                chiNhanhLocId !== 'tat_ca'
                  ? chiNhanhLocId
                  : nguoiDungHienTai?.chi_nhanh_id || 'toan_cong_ty';
              const saved = await luuCauHinhKPIBaoCaoTuan({
                pham_vi_id: scope,
                kpi_thang_ky_ket: modalKPI.kpiThangKy,
                kpi_thang_tien_ve: modalKPI.kpiThangVe,
                kpi_nam_ky_ket: modalKPI.kpiNamKy,
                kpi_nam_tien_ve: modalKPI.kpiNamVe
              });
              setKpiCauHinh(saved);
              setModalKPI((p) => ({ ...p, mo: false }));
              hienThongBao('Đã lưu mục tiêu KPI.');
            }}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3 text-xs"
          >
            <h3 className="text-sm font-bold text-slate-900">Mục tiêu KPI Doanh thu</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">KPI Tháng (Ký kết)</span>
                <input
                  type="number"
                  value={modalKPI.kpiThangKy || ''}
                  onChange={(e) => setModalKPI((p) => ({ ...p, kpiThangKy: Number(e.target.value || 0) }))}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 text-right tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">KPI Tháng (Tiền về)</span>
                <input
                  type="number"
                  value={modalKPI.kpiThangVe || ''}
                  onChange={(e) => setModalKPI((p) => ({ ...p, kpiThangVe: Number(e.target.value || 0) }))}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 text-right tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">KPI Năm (Ký kết)</span>
                <input
                  type="number"
                  value={modalKPI.kpiNamKy || ''}
                  onChange={(e) => setModalKPI((p) => ({ ...p, kpiNamKy: Number(e.target.value || 0) }))}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 text-right tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold text-slate-700">KPI Năm (Tiền về)</span>
                <input
                  type="number"
                  value={modalKPI.kpiNamVe || ''}
                  onChange={(e) => setModalKPI((p) => ({ ...p, kpiNamVe: Number(e.target.value || 0) }))}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 text-right tabular-nums"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalKPI((p) => ({ ...p, mo: false }))}
                className="h-8.5 px-3 rounded-xl border border-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="h-8.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Lưu KPI
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DRILL-DOWN DANH SÁCH DỰ ÁN */}
      {modalDrillDown.mo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                {modalDrillDown.tieuDe} ({modalDrillDown.dsDuAn.length})
              </h3>
              <button
                type="button"
                onClick={() => setModalDrillDown({ mo: false, tieuDe: '', dsDuAn: [] })}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 text-xs">
              {modalDrillDown.dsDuAn.map((d) => (
                <div key={d.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{d.ten_du_an}</div>
                    <div className="text-[11px] text-slate-500">
                      {dsGiaiDoan.find((g) => g.key === d.giai_doan)?.nhan_ngan || d.giai_doan}
                    </div>
                  </div>
                  <div className="text-right tabular-nums shrink-0 font-semibold text-slate-800">
                    {fmtSo(d.gia_tri_hop_dong || d.gia_tri_du_kien)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM & XUẤT SLIDE PDF / EXCEL */}
      {modalSlide.mo && modalSlide.baoCao && (
        <ModalXuatBaoCaoVDCD
          mo={modalSlide.mo}
          onDong={() => setModalSlide({ mo: false, baoCao: null, lichTuanToi: [] })}
          baoCao={modalSlide.baoCao}
          lichTuanToi={modalSlide.lichTuanToi}
          tieuDePhu={modalSlide.tieuDePhu}
        />
      )}
    </div>
  );
}
