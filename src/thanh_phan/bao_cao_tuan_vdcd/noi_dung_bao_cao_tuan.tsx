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
  Trash2,
  UserCheck,
  Users,
  Building2,
  ExternalLink,
  Target,
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
import BangBaoCaoTuanChuanVDCD, { BANG_TIEM_NANG_DU_AN } from './bang_bao_cao_tuan_chuan_vdcd';
import { layCauHinhGiaiDoanTheoKey } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  capNhatLichGapKH,
  danhSachLichGapKH,
  langNgheLichGapKH,
  taoLichGapKHMoi
} from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { layTuanHienTaiISO, layKeHoachTuan } from '../../dich_vu/ke_hoach/dich_vu_ke_hoach';
import type { KeHoachTuan } from '../../thu_vien/types/ke_hoach';
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
  type DongKeHoachDuAnTuan,
  type SoLieuTinhTrangDuAnTuan
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import {
  duyetBaoCaoTuanVDCD,
  layCauHinhKPIBaoCaoTuan,
  layDanhSachBaoCaoTuanVDCD,
  luuBaoCaoTuanVDCD,
  luuCauHinhKPIBaoCaoTuan
} from '../../dich_vu/bao_cao_tuan_vdcd/dich_vu_bao_cao_tuan_vdcd';
import {
  layCauHinhQuyTrinhPhoiHop,
  type CauHinhQuyTrinhPhoiHop
} from '../../dich_vu/cau_hinh/dich_vu_cau_hinh_quy_trinh_phoi_hop';
import ModalXuatBaoCaoVDCD, { xuatExcelBaoCaoTuanVDCD } from './xuat_bao_cao_vdcd';
import {
  taoFileExcelBaoCaoTuanVDCD,
  taoFileExcelTongHopToanBoSaleChiNhanh,
  taiFileExcelBlob,
  type DuLieuBaoCaoTuanVDCDChuan
} from '../../dich_vu/bao_cao_tuan_vdcd/xuat_excel_vdcd_chuan';

const fmtSo = (n?: number | null) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(n || 0)));

const NHAN_TRANG_THAI: Record<
  BaoCaoTuanVDCD['trang_thai'],
  { label: string; cls: string }
> = {
  nhap: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  cho_duyet: { label: 'Chờ TPKD duyệt', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  cho_giam_doc_duyet: { label: 'Chờ GĐ duyệt', cls: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
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
  const [tabTongHop, setTabTongHop] = useState<'bao_cao' | 'ke_hoach'>('bao_cao');
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
  const [keHoachTuanNay, setKeHoachTuanNay] = useState<KeHoachTuan | null>(null);
  const [keHoachTuanToi, setKeHoachTuanToi] = useState<KeHoachTuan | null>(null);
  const [kpiCauHinh, setKpiCauHinh] = useState<CauHinhMucTieuBaoCaoTuan | null>(null);
  const [cauHinhQuyTrinh, setCauHinhQuyTrinh] = useState<CauHinhQuyTrinhPhoiHop | null>(null);

  const cheDoDuyet = cauHinhQuyTrinh?.che_do_duyet_bao_cao_tuan === '1_cap' ? '1_cap' : '2_cap';
  const laNguoiDuyetCap1 = useMemo(() => {
    const vt = String(nguoiDungHienTai?.vai_tro || '');
    const cap1Id = cauHinhQuyTrinh?.nguoi_duyet_tuan_cap_1_id || cauHinhQuyTrinh?.tp_kd_id;
    return (
      (Boolean(cap1Id) && uid === cap1Id) ||
      vt === 'truong_phong_kd' ||
      vt === 'truong_phong' ||
      vt === 'quan_tri_he_thong'
    );
  }, [nguoiDungHienTai?.vai_tro, cauHinhQuyTrinh, uid]);

  const laNguoiDuyetCap2 = useMemo(() => {
    const vt = String(nguoiDungHienTai?.vai_tro || '');
    const cap2Id = cauHinhQuyTrinh?.nguoi_duyet_tuan_cap_2_id || cauHinhQuyTrinh?.giam_doc_id;
    return (
      (Boolean(cap2Id) && uid === cap2Id) ||
      vt === 'giam_doc' ||
      vt === 'quan_tri_he_thong'
    );
  }, [nguoiDungHienTai?.vai_tro, cauHinhQuyTrinh, uid]);

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
    tieuDe?: string;
  }>({ mo: false, nhanSu: null, lich: [] });

  const [modalXemDANhanVien, setModalXemDANhanVien] = useState<{
    mo: boolean;
    nhanSu: NhanSu | null;
    dsDuAn: HoSoDuAn[];
  }>({ mo: false, nhanSu: null, dsDuAn: [] });

  const [modalYeuCauSua, setModalYeuCauSua] = useState<{
    mo: boolean;
    baoCao: BaoCaoTuanVDCD | null;
    ghiChu: string;
    phanDuyet?: 'bao_cao' | 'ke_hoach';
  }>({ mo: false, baoCao: null, ghiChu: '', phanDuyet: 'bao_cao' });

  const [modalChiTietChiNhanh, setModalChiTietChiNhanh] = useState<{
    mo: boolean;
    tieuDe: string;
    dongChiTiet: { ten: string; mucTieu: number; thucTe: number; laTien?: boolean }[];
  }>({ mo: false, tieuDe: '', dongChiTiet: [] });

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
      const [resDA, resKH, resNLH, resNS, resCN, resSP, resLich, resBCTuan, resBCTruoc, resKPI, resQT] =
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
          layCauHinhKPIBaoCaoTuan(kpiScope),
          layCauHinhQuyTrinhPhoiHop()
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
      setCauHinhQuyTrinh(resQT);
    } finally {
      setDangTai(false);
    }
  }, [tuanChon, tuanTruocISO, chiNhanhLocId, nguoiDungHienTai?.chi_nhanh_id]);

  useEffect(() => {
    void taiDuLieu();
  }, [taiDuLieu]);

  // Lắng nghe dữ liệu Lịch công tác real-time để tự động cập nhật kết quả vào Báo cáo
  useEffect(() => {
    const unsub = langNgheLichGapKH((ds) => {
      if (ds && ds.length > 0) setDsLichGap(ds);
    });
    return () => unsub();
  }, []);

  const mapChiNhanh = useMemo(
    () => new Map(dsChiNhanh.map((c) => [c.id, c.ten_chi_nhanh])),
    [dsChiNhanh]
  );

  // Danh sách nhân sự kinh doanh trong phạm vi xem
  // CHỈ DÀNH CHO SALE THỰC SỰ - TUYỆT ĐỐI LOẠI BỎ TPKD VÀ TRẦN MINH ĐẠT (KỸ THUẬT)
  const dsSaleTeam = useMemo(() => {
    return dsNhanSu.filter((n) => {
      if (n.trang_thai_du_lieu === 'da_xoa') return false;
      if (chiNhanhLocId !== 'tat_ca' && n.chi_nhanh_id !== chiNhanhLocId) return false;

      const ten = (n.ho_va_ten || '').toLowerCase().trim();
      // Loại trừ Trần Minh Đạt theo yêu cầu người dùng ("trần minh đạt đâu phải sale")
      if (ten.includes('trần minh đạt') || ten.includes('trần mình đạt') || ten.includes('tran minh dat')) {
        return false;
      }

      const vt = String(n.vai_tro || '');
      const cv = (n.chuc_vu || '').toLowerCase();

      // Loại trừ Trưởng phòng (TPKD không nộp báo cáo sale)
      if (vt === 'truong_phong_kd' || vt === 'truong_phong' || cv.includes('trưởng phòng') || cv.includes('tpkd')) {
        return false;
      }

      // Loại trừ Kỹ thuật, Hành chính, Lãnh đạo
      if (
        vt === 'nhan_vien_ky_thuat' ||
        vt === 'hanh_chinh_van_phong' ||
        vt === 'giam_doc' ||
        vt === 'quan_tri_he_thong' ||
        cv.includes('kỹ thuật') ||
        cv.includes('hành chính') ||
        cv.includes('giám đốc')
      ) {
        return false;
      }

      // Chỉ lấy đúng Nhân viên Kinh doanh
      return vt === 'nhan_vien_kinh_doanh' || cv.includes('kinh doanh') || cv.includes('sale');
    });
  }, [dsNhanSu, chiNhanhLocId]);

  // Trưởng phòng Kinh doanh của chi nhánh (nếu có) để có trang báo cáo điều hành riêng biệt
  const tpKinhDoanh = useMemo(() => {
    return dsNhanSu.find((n) => {
      if (n.trang_thai_du_lieu === 'da_xoa') return false;
      if (chiNhanhLocId !== 'tat_ca' && n.chi_nhanh_id !== chiNhanhLocId) return false;
      const ten = (n.ho_va_ten || '').toLowerCase().trim();
      if (ten.includes('trần minh đạt') || ten.includes('trần mình đạt') || ten.includes('tran minh dat')) {
        return false;
      }
      const vt = String(n.vai_tro || '');
      const cv = (n.chuc_vu || '').toLowerCase();
      return vt === 'truong_phong_kd' || cv.includes('trưởng phòng kinh doanh') || cv.includes('trưởng phòng kd') || cv.includes('tpkd');
    }) || (nguoiDungHienTai?.vai_tro === 'truong_phong_kd' ? (nguoiDungHienTai as any as NhanSu) : null);
  }, [dsNhanSu, chiNhanhLocId, nguoiDungHienTai]);

  // Danh sách nhân sự để Quản lý chọn xem chi tiết: Trưởng phòng + Đội ngũ Sale (Tuyệt đối không có Trần Minh Đạt)
  const dsNhanSuChonXem = useMemo(() => {
    const list: { id: string; tenHienThi: string; nv: NhanSu; laTP: boolean }[] = [];
    if (tpKinhDoanh) {
      list.push({
        id: tpKinhDoanh.id,
        tenHienThi: `👑 ${tpKinhDoanh.ho_va_ten} (Trưởng phòng Kinh doanh)`,
        nv: tpKinhDoanh,
        laTP: true
      });
    }
    dsSaleTeam.forEach((s) => {
      list.push({
        id: s.id,
        tenHienThi: `👤 ${s.ho_va_ten} (Chuyên viên Kinh doanh)`,
        nv: s,
        laTP: false
      });
    });
    return list;
  }, [tpKinhDoanh, dsSaleTeam]);

  const nhanSuMucTieu = useMemo(() => {
    if (laQuanLy && nhanVienDangXemId) {
      const found = dsNhanSu.find((n) => n.id === nhanVienDangXemId);
      if (found) return found;
    }
    if (laQuanLy && dsNhanSuChonXem.length > 0) {
      return dsNhanSuChonXem[0].nv;
    }
    return (
      dsNhanSu.find((n) => n.id === uid) ||
      (nguoiDungHienTai
        ? ({
            id: nguoiDungHienTai.id,
            ho_va_ten: nguoiDungHienTai.ho_va_ten || 'Nhân viên',
            chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id,
            phong_ban_id: nguoiDungHienTai.phong_ban_id
          } as NhanSu)
        : null)
    );
  }, [dsNhanSu, nhanVienDangXemId, laQuanLy, dsNhanSuChonXem, uid, nguoiDungHienTai]);

  const baoCaoTuanTruocCuaNV = useMemo(() => {
    const targetId = nhanSuMucTieu?.id;
    if (!targetId) return null;
    return dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === targetId) || null;
  }, [dsBaoCaoTuanTruoc, nhanSuMucTieu]);

  // Tải Kế hoạch tác chiến tuần này & tuần tới từ Bàn làm việc
  useEffect(() => {
    const targetId = nhanSuMucTieu?.id;
    if (!targetId) return;
    let active = true;
    void Promise.all([
      layKeHoachTuan(targetId, tuanChon),
      layKeHoachTuan(targetId, tuanToiISO)
    ]).then(([khNay, khToi]) => {
      if (active) {
        setKeHoachTuanNay(khNay);
        setKeHoachTuanToi(khToi);
      }
    });
    return () => {
      active = false;
    };
  }, [nhanSuMucTieu?.id, tuanChon, tuanToiISO]);

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
      const lichTuanNay = dsLichGap.filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuan.ngayBatDau &&
          l.ngay <= infoTuan.ngayKetThuc &&
          (l.nguoi_phu_trach_id === nv.id || l.nguoi_tao_id === nv.id)
      );
      const lichToi = dsLichGap.filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (l.nguoi_phu_trach_id === nv.id || l.nguoi_tao_id === nv.id)
      );
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

      // Số liệu gợi ý từ CRM cho Tuần trước (Tuần 1) để luôn có đầy đủ số liệu đối soát
      const goiYTuanTruoc = tinhSoLieuTuCRM({
        tuan: tuanTruocISO,
        dsDuAn: dsDaNV,
        dsKhachHang,
        dsSanPham,
        dsChiNhanh,
        dsNhanSu
      });

      const truoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nv.id) || null;
      const tenCN = nv.chi_nhanh_id ? mapChiNhanh.get(nv.chi_nhanh_id) : 'An Giang';
      const baoCaoGoc =
        daLuu ||
        taoBaoCaoTuanMacDinh({
          tuan: tuanChon,
          nhanSu: nv,
          tenChiNhanh: tenCN,
          goiY,
          baoCaoTuanTruoc: truoc,
          kpiMacDinh: kpiCauHinh
        });

      // Đảm bảo số liệu Tuần 1 luôn có đủ các chỉ số thực tế
      const daThucTeTuanTruoc = Number(
        truoc?.kpi_tuan_qua?.du_an_lam_viec_thuc_te ??
          truoc?.tinh_trang_tuan_nay?.dang_tiep_can ??
          goiYTuanTruoc.tinh_trang_tuan_nay.dang_tiep_can ??
          0
      );
      const bgThucTeTuanTruoc = Number(
        truoc?.kpi_tuan_qua?.bao_gia_thuc_te ??
          truoc?.tinh_trang_tuan_nay?.bao_gia ??
          goiYTuanTruoc.tinh_trang_tuan_nay.bao_gia ??
          0
      );
      const hdThucTeTuanTruoc = Number(
        truoc?.kpi_tuan_qua?.hop_dong_thuc_te ??
          truoc?.tinh_trang_tuan_nay?.hop_dong ??
          goiYTuanTruoc.tinh_trang_tuan_nay.hop_dong ??
          0
      );
      const kpThucTeTuanTruoc = Number(
        truoc?.tinh_trang_tuan_nay?.khong_phu_hop ??
          goiYTuanTruoc.tinh_trang_tuan_nay.khong_phu_hop ??
          0
      );
      const tcThucTeTuanTruoc = Number(
        truoc?.kpi_tuan_qua?.khach_moi_thuc_te ??
          truoc?.thuc_hien_tiep_can_tuan_nay ??
          truoc?.tinh_trang_tuan_nay?.tong_tiep_can ??
          goiYTuanTruoc.tinh_trang_tuan_nay.tong_tiep_can ??
          (daThucTeTuanTruoc + bgThucTeTuanTruoc + hdThucTeTuanTruoc + kpThucTeTuanTruoc)
      );

      const ttTruocChuan: SoLieuTinhTrangDuAnTuan = {
        tong_tiep_can: Math.max(tcThucTeTuanTruoc, daThucTeTuanTruoc + bgThucTeTuanTruoc + hdThucTeTuanTruoc + kpThucTeTuanTruoc),
        dang_tiep_can: daThucTeTuanTruoc,
        bao_gia: bgThucTeTuanTruoc,
        hop_dong: hdThucTeTuanTruoc,
        khong_phu_hop: kpThucTeTuanTruoc
      };

      const baoCao: BaoCaoTuanVDCD = {
        ...baoCaoGoc,
        tinh_trang_tuan_truoc:
          baoCaoGoc.tinh_trang_tuan_truoc &&
          (baoCaoGoc.tinh_trang_tuan_truoc.tong_tiep_can > 0 ||
            baoCaoGoc.tinh_trang_tuan_truoc.dang_tiep_can > 0 ||
            baoCaoGoc.tinh_trang_tuan_truoc.bao_gia > 0)
            ? {
                ...baoCaoGoc.tinh_trang_tuan_truoc,
                // Luôn cập nhật đúng chỉ số đang tiếp cận là dự án làm việc
                dang_tiep_can: baoCaoGoc.tinh_trang_tuan_truoc.dang_tiep_can || daThucTeTuanTruoc
              }
            : ttTruocChuan,
        nguon_tuan_truoc:
          baoCaoGoc.nguon_tuan_truoc &&
          (baoCaoGoc.nguon_tuan_truoc.gioi_thieu > 0 ||
            baoCaoGoc.nguon_tuan_truoc.tu_khai_thac > 0 ||
            baoCaoGoc.nguon_tuan_truoc.hotline_fanpage > 0)
            ? baoCaoGoc.nguon_tuan_truoc
            : (truoc?.nguon_tuan_nay || goiYTuanTruoc.nguon_tuan_nay)
      };

      const coIdsDaChon = Boolean(
        daLuu &&
          (baoCao.trang_thai_ke_hoach === 'da_duyet') &&
          baoCao.du_an_trong_diem_ids &&
          baoCao.du_an_trong_diem_ids.length > 0
      );
      const dsDATiemNang = coIdsDaChon
        ? dsDuAn.filter((d) => {
            if (d.trang_thai === 'da_xoa') return false;
            const thuocNV =
              d.nguoi_phu_trach_id === nv.id ||
              d.nguoi_quan_ly_id === nv.id ||
              (!d.nguoi_phu_trach_id && d.nguoi_tao_id === nv.id);
            return thuocNV && baoCao.du_an_trong_diem_ids!.includes(d.id);
          })
        : [];

      return {
        nv,
        baoCao,
        daGui: Boolean(daLuu),
        lichTuanNay,
        lichToi,
        dsDATiemNang
      };
    });
  }, [
    dsSaleTeam,
    dsBaoCaoTuan,
    dsBaoCaoTuanTruoc,
    dsLichGap,
    infoTuan,
    infoTuanToi,
    dsDuAn,
    tuanChon,
    tuanTruocISO,
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

    // CHỈ LẤY ĐÚNG NHÂN SỰ THUỘC PHÒNG KINH DOANH: TPKD + ĐỘI NGŨ SALE
    // Tuyệt đối không lấy Kỹ thuật, Ban Giám đốc, Kế toán, Admin hay bất kỳ ai ngoài phòng KD
    const idPhongKD = new Set<string>();
    dsSaleTeam.forEach((s) => idPhongKD.add(s.id));
    if (tpKinhDoanh) {
      idPhongKD.add(tpKinhDoanh.id);
    }

    return dsLichGap
      .filter((l) => {
        if (l.da_xoa) return false;
        if (l.trang_thai === 'huy') return false;
        if (l.ngay < infoTuanToi.ngayBatDau || l.ngay > infoTuanToi.ngayKetThuc) return false;

        // Chỉ lấy lịch công tác theo kế hoạch của nhân sự phòng Kinh doanh
        const idPhuTrach = l.nguoi_phu_trach_id && idPhongKD.has(l.nguoi_phu_trach_id)
          ? l.nguoi_phu_trach_id
          : l.nguoi_tao_id && idPhongKD.has(l.nguoi_tao_id)
          ? l.nguoi_tao_id
          : null;

        if (!idPhuTrach) return false;

        // Kiểm tra loại trừ nếu lỡ dính tên Trần Minh Đạt
        const ten = (mapTenNV.get(idPhuTrach) || '').toLowerCase();
        if (ten.includes('trần minh đạt') || ten.includes('trần mình đạt') || ten.includes('tran minh dat')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => `${a.ngay}_${a.gio_bat_dau}`.localeCompare(`${b.ngay}_${b.gio_bat_dau}`))
      .map((l) => {
        const idPhuTrach = (l.nguoi_phu_trach_id && idPhongKD.has(l.nguoi_phu_trach_id))
          ? l.nguoi_phu_trach_id
          : l.nguoi_tao_id;
        let tenNV = mapTenNV.get(idPhuTrach) || '';
        const laTP = tpKinhDoanh && idPhuTrach === tpKinhDoanh.id;
        if (laTP && tenNV && !tenNV.includes('TPKD') && !tenNV.includes('Trưởng phòng')) {
          tenNV = `${tenNV} (TPKD)`;
        }
        return {
          ...l,
          nguoi_phu_trach_id: idPhuTrach,
          ten_nhan_vien: tenNV
        };
      });
  }, [dsLichGap, dsNhanSu, dsSaleTeam, tpKinhDoanh, infoTuanToi]);

  const dsDuAnTiemNangChiNhanh = useMemo(() => {
    const setIdsDuAnChon = new Set(
      danhSachBaoCaoTeam
        .filter((x) => x.daGui && x.baoCao.trang_thai_ke_hoach === 'da_duyet')
        .flatMap((x) => x.baoCao.du_an_trong_diem_ids || [])
    );
    if (setIdsDuAnChon.size === 0) return [];

    const mapTenNV = new Map(dsNhanSu.map((n) => [n.id, n.ho_va_ten]));
    const mapKH = new Map(dsKhachHang.map((k) => [k.id, k]));
    const mapNLH = new Map(dsNguoiLienHe.map((n) => [n.id, n]));
    const mapSP = new Map(dsSanPham.map((s) => [s.id, s.ten_san_pham]));

    const dsDuAnDonVi = dsDuAn.filter((d) => {
      if (d.trang_thai === 'da_xoa') return false;
      if (chiNhanhLocId !== 'tat_ca' && d.chi_nhanh_id && d.chi_nhanh_id !== chiNhanhLocId) return false;
      const thuocSaleTeam = dsSaleTeam.some(
        (nv) => nv.id === d.nguoi_phu_trach_id || nv.id === d.nguoi_quan_ly_id || nv.id === d.nguoi_tao_id
      );
      return thuocSaleTeam;
    });

    const dsTiemNang = dsDuAnDonVi.filter(
      (d) =>
        (d.muc_do_tiem_nang === 'rat_cao' || d.muc_do_tiem_nang === 'cao') &&
        d.giai_doan !== 'hoan_thanh_tt_dot_2' &&
        d.giai_doan !== 'tam_dung_huy'
    );

    const ketQua = dsTiemNang
      .filter((d) => (setIdsDuAnChon.size > 0 ? setIdsDuAnChon.has(d.id) : true))
      .sort((a, b) => {
        const score = (tn?: string) => (tn === 'rat_cao' ? 5 : 4);
        return score(b.muc_do_tiem_nang) - score(a.muc_do_tiem_nang);
      });

    return ketQua.map((d, idx) => {
      const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
      const nlh = d.nguoi_lien_he_id ? mapNLH.get(d.nguoi_lien_he_id) : null;
      const cfgGD = layCauHinhGiaiDoanTheoKey(d.giai_doan);
      const cfgTN = BANG_TIEM_NANG_DU_AN[d.muc_do_tiem_nang] || BANG_TIEM_NANG_DU_AN.cao;
      const sp = d.san_pham_dich_vu_id ? mapSP.get(d.san_pham_dich_vu_id) : d.san_pham_khac_mo_ta;
      const tenNV = mapTenNV.get(d.nguoi_phu_trach_id || '') || mapTenNV.get(d.nguoi_tao_id || '') || '—';

      return {
        stt: idx + 1,
        id: d.id,
        tenDuAn: d.ten_du_an,
        tenKhachHang: kh?.ten_khach_hang || '',
        tenNhanVienPhuTrach: tenNV,
        nguoiLienHe: nlh?.ho_va_ten || kh?.so_dien_thoai || '—',
        soDienThoai: nlh?.so_dien_thoai || kh?.so_dien_thoai || '',
        sanPhamDichVu: sp || 'Khảo sát / Đo đạc',
        giaTriDeal: d.gia_tri_hop_dong || d.gia_tri_du_kien || 0,
        giaiDoanKey: d.giai_doan,
        tenGiaiDoan: cfgGD.nhan_day_du,
        mucDoTiemNang: d.muc_do_tiem_nang,
        xacSuatPct: cfgTN.xacSuat,
        duAnGoc: d
      };
    });
  }, [danhSachBaoCaoTeam, dsNhanSu, dsKhachHang, dsNguoiLienHe, dsSanPham, dsDuAn, chiNhanhLocId, dsSaleTeam]);

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
    trangThai: 'cho_giam_doc_duyet' | 'da_duyet' | 'can_dieu_chinh',
    ghiChu?: string,
    phanDuyet: 'bao_cao' | 'ke_hoach' = 'bao_cao'
  ) => {
    const updated = await duyetBaoCaoTuanVDCD({
      baoCao: bc,
      phanDuyet,
      trangThai,
      nguoiDuyetId: uid,
      tenNguoiDuyet: nguoiDungHienTai?.ho_va_ten || 'Quản lý',
      ghiChuQuanLy: ghiChu ?? null
    });
    setDsBaoCaoTuan((prev) => [updated, ...prev.filter((x) => x.id !== updated.id)]);
    if (formBaoCao?.id === updated.id) setFormBaoCao(updated);

    // Chỉ kích hoạt lịch công tác tuần tới khi phê duyệt chốt Kế hoạch (phanDuyet === 'ke_hoach' && trangThai === 'da_duyet')
    let soLichDaDuyet = 0;
    if (phanDuyet === 'ke_hoach' && trangThai === 'da_duyet') {
      const tuanToi = dichChuyenTuanISO(bc.tuan, 1);
      const infoTuanToi = phanTichTuanISO(tuanToi);
      const lichCanDuyet = dsLichGap.filter(
        (l) =>
          !l.da_xoa &&
          l.ngay >= infoTuanToi.ngayBatDau &&
          l.ngay <= infoTuanToi.ngayKetThuc &&
          (l.nguoi_phu_trach_id === bc.nhan_vien_id || l.nguoi_tao_id === bc.nhan_vien_id) &&
          (l.trang_thai === 'cho_duyet' || l.trang_thai === 'sap_toi' || l.trang_thai === 'can_dieu_chinh')
      );
      for (const l of lichCanDuyet) {
        try {
          await capNhatLichGapKH(l.id, { trang_thai: 'da_duyet', nguoi_duyet_id: uid }, uid);
          soLichDaDuyet += 1;
        } catch (e) {
          console.error(e);
        }
      }
      if (lichCanDuyet.length > 0) {
        setDsLichGap((prev) =>
          prev.map((l) =>
            lichCanDuyet.some((c) => c.id === l.id) ? { ...l, trang_thai: 'da_duyet' } : l
          )
        );
      }
    }

    const tenPhan = phanDuyet === 'ke_hoach' ? 'kế hoạch' : 'báo cáo';
    hienThongBao(
      trangThai === 'da_duyet'
        ? soLichDaDuyet > 0
          ? `Đã phê duyệt chốt ${tenPhan} tuần cho ${bc.ten_nhan_vien} & kích hoạt ${soLichDaDuyet} lịch công tác tuần tới.`
          : `Đã phê duyệt chốt ${tenPhan} tuần cho ${bc.ten_nhan_vien}.`
        : trangThai === 'cho_giam_doc_duyet'
        ? `Đã duyệt Cấp 1 (${tenPhan}) cho ${bc.ten_nhan_vien} và chuyển lên Giám đốc.`
        : `Đã gửi yêu cầu điều chỉnh ${tenPhan} cho ${bc.ten_nhan_vien}.`
    );
  };

  const handleYeuCauMoKhoa = async (lyDo: string, phanDuyet: 'bao_cao' | 'ke_hoach' = 'bao_cao') => {
    if (!formBaoCao) return;
    const reqObj = {
      ly_do: lyDo,
      ngay_yeu_cau: new Date().toISOString(),
      nguoi_yeu_cau_id: uid,
      ten_nguoi_yeu_cau: nguoiDungHienTai?.ho_va_ten || formBaoCao.ten_nhan_vien
    };
    const saved = await luuBaoCaoTuanVDCD({
      ...formBaoCao,
      ...(phanDuyet === 'ke_hoach' ? { yeu_cau_mo_khoa_ke_hoach: reqObj } : { yeu_cau_mo_khoa: reqObj })
    });
    setFormBaoCao(saved);
    setDsBaoCaoTuan((prev) => [saved, ...prev.filter((x) => x.id !== saved.id)]);
  };

  const xuLyXuatExcelMotSale = async (nv: NhanSu, bc: BaoCaoTuanVDCD) => {
    try {
      const bcTruoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nv.id);
      const daCuaSale = dsDuAnTiemNangChiNhanh.filter(
        (d) =>
          d.duAnGoc.nguoi_phu_trach_id === nv.id ||
          d.duAnGoc.nguoi_quan_ly_id === nv.id ||
          d.duAnGoc.nguoi_tao_id === nv.id
      );

      const blob = await taoFileExcelBaoCaoTuanVDCD({
        tuan: bc.tuan,
        nhanTieuDeTuan: `${infoTuan.nhanTieuDe} (${infoTuan.khoangNgayNhan}/${infoTuan.nam})`,
        nhanVien: {
          id: nv.id,
          ho_va_ten: nv.ho_va_ten,
          ma_nhan_vien: nv.ma_nhan_vien,
          chuc_vu: nv.chuc_vu || 'Chuyên viên Kinh doanh',
          phong_ban: nv.phong_ban_id || undefined
        },
        kpiTuanQua: {
          khachHangMoi: {
            mucTieu: Number(bc.kpi_tuan_qua?.khach_moi_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.khach_moi?.target ?? 0),
            thucTe: Number(bc.kpi_tuan_qua?.khach_moi_thuc_te ?? bc.thuc_hien_tiep_can_tuan_nay ?? 0)
          },
          baoGia: {
            mucTieu: Number(bc.kpi_tuan_qua?.bao_gia_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.bao_gia?.target ?? 0),
            thucTe: Number(bc.kpi_tuan_qua?.bao_gia_thuc_te ?? bc.tinh_trang_tuan_nay?.bao_gia ?? 0)
          },
          duAnLamViec: {
            mucTieu: Number(bc.kpi_tuan_qua?.du_an_lam_viec_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.du_an_lam_viec?.target ?? 0),
            thucTe: Number(bc.kpi_tuan_qua?.du_an_lam_viec_thuc_te ?? bc.tinh_trang_tuan_nay?.dang_tiep_can ?? 0)
          },
          hopDongKy: {
            mucTieu: Number(bc.kpi_tuan_qua?.hop_dong_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.hop_dong?.target ?? 0),
            thucTe: Number(bc.kpi_tuan_qua?.hop_dong_thuc_te ?? bc.tinh_trang_tuan_nay?.hop_dong ?? 0)
          },
          doanhThu: {
            mucTieu: Number(bc.kpi_tuan_qua?.doanh_so_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.doanh_so?.target ?? 0),
            thucTe: Number(bc.kpi_tuan_qua?.doanh_so_thuc_te ?? bc.dt_tuan_ky_ket ?? 0)
          }
        },
        danhSachDuAnTrongDiem: daCuaSale.map((d, idx) => ({
          stt: idx + 1,
          id: d.id,
          tenDuAn: d.tenDuAn,
          tenKhachHang: d.tenKhachHang,
          nguoiLienHe: d.nguoiLienHe,
          soDienThoai: d.soDienThoai,
          sanPhamDichVu: d.sanPhamDichVu,
          giaTriDeal: d.giaTriDeal,
          giaiDoanKey: d.giaiDoanKey,
          tenGiaiDoan: d.tenGiaiDoan,
          mucDoTiemNang: d.mucDoTiemNang,
          xacSuatPct: d.xacSuatPct
        })),
        camKetTuanToi: {
          khachHangMoi: bc.cam_ket_tuan_toi?.khach_moi || { target: 0, min: 0, max: 0 },
          baoGia: bc.cam_ket_tuan_toi?.bao_gia || { target: 0, min: 0, max: 0 },
          duAnLamViec: bc.cam_ket_tuan_toi?.du_an_lam_viec || { target: 0, min: 0, max: 0 },
          hopDongMoi: bc.cam_ket_tuan_toi?.hop_dong || { target: 0, min: 0, max: 0 },
          doanhThu: bc.cam_ket_tuan_toi?.doanh_so || { target: 0, min: 0, max: 0 }
        },
        lichLamViecTuanToi: infoTuanToi.danhSachNgay.map((d, idx) => {
          const lichNgay = lichTuanToiToanTeam.filter(
            (l) => l.ngay === d.ngay && (l.nguoi_phu_trach_id === nv.id || l.nguoi_tao_id === nv.id)
          );
          const nd = lichNgay.map((l) => `${l.gio_bat_dau || ''} ${l.ten_khach_hang}: ${l.noi_dung || l.tieu_de || ''}`).join('; ');
          return {
            thu: idx + 1,
            tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
            noiDungChiTiet: nd || 'Tác nghiệp văn phòng / Bám sát dự án'
          };
        }),
        laTruongPhong: false
      });

      taiFileExcelBlob(blob, `Bao_cao_tuan_${tuanChon}_${nv.ho_va_ten.replace(/\s+/g, '_')}.xlsx`);
      hienThongBao(`Đã xuất file Excel báo cáo tuần của ${nv.ho_va_ten}.`);
    } catch (e) {
      console.error(e);
      alert('Không thể xuất file Excel của nhân sự.');
    }
  };

  const xuLyXuatExcelToanBoSale = async () => {
    try {
      const danhSachBaoCaoSale: DuLieuBaoCaoTuanVDCDChuan[] = [];

      // 1. Thêm Sheet của Trưởng phòng Kinh doanh nếu có (với form điều hành chuẩn Trưởng phòng)
      if (tpKinhDoanh) {
        const daLuuTP = dsBaoCaoTuan.find((b) => b.nhan_vien_id === tpKinhDoanh.id);
        const dh = daLuuTP?.dinh_huong_dieu_hanh_tuan_toi;
        const lichToiTP = dsLichGap.filter(
          (l) =>
            !l.da_xoa &&
            l.ngay >= infoTuanToi.ngayBatDau &&
            l.ngay <= infoTuanToi.ngayKetThuc &&
            (l.nguoi_phu_trach_id === tpKinhDoanh.id ||
              l.nguoi_tao_id === tpKinhDoanh.id ||
              (Array.isArray(l.nguoi_tham_gia_ids) && l.nguoi_tham_gia_ids.includes(tpKinhDoanh.id)))
        );

        danhSachBaoCaoSale.push({
          tuan: tuanChon,
          nhanTieuDeTuan: infoTuan.nhanTieuDe,
          nhanVien: {
            id: tpKinhDoanh.id,
            ho_va_ten: tpKinhDoanh.ho_va_ten,
            ma_nhan_vien: tpKinhDoanh.ma_nhan_vien,
            chuc_vu: 'Trưởng phòng Kinh doanh',
            phong_ban: tpKinhDoanh.phong_ban_id || undefined
          },
          kpiTuanQua: {
            khachHangMoi: {
              mucTieu: baoCaoTongChiNhanh.ke_hoach_tiep_can_tuan_nay || 0,
              thucTe: baoCaoTongChiNhanh.thuc_hien_tiep_can_tuan_nay || 0
            },
            baoGia: {
              mucTieu: 0,
              thucTe: baoCaoTongChiNhanh.tinh_trang_tuan_nay.bao_gia || 0
            },
            duAnLamViec: {
              mucTieu: 0,
              thucTe: baoCaoTongChiNhanh.tinh_trang_tuan_nay.tong_tiep_can || 0
            },
            hopDongKy: {
              mucTieu: 0,
              thucTe: baoCaoTongChiNhanh.tinh_trang_tuan_nay.hop_dong || 0
            },
            doanhThu: {
              mucTieu: baoCaoTongChiNhanh.kpi_thang_ky_ket || 0,
              thucTe: baoCaoTongChiNhanh.dt_tuan_ky_ket || 0
            }
          },
          danhSachDuAnTrongDiem: [],
          camKetTuanToi: {
            khachHangMoi: { target: 0, min: 0, max: 0 },
            baoGia: { target: 0, min: 0, max: 0 },
            duAnLamViec: { target: 0, min: 0, max: 0 },
            hopDongMoi: { target: dh?.so_hop_dong_du_kien || 0, min: 0, max: 0 },
            doanhThu: { target: dh?.muc_tieu_doanh_thu_phong || 0, min: 0, max: 0 }
          },
          lichLamViecTuanToi: infoTuanToi.danhSachNgay.map((d, idx) => {
            const lichNgay = lichToiTP.filter((l) => l.ngay === d.ngay);
            const nd = lichNgay.map((l) => `${l.gio_bat_dau || ''} ${l.ten_khach_hang}: ${l.noi_dung || l.tieu_de || ''}`).join('; ');
            return {
              thu: idx + 1,
              tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
              noiDungChiTiet: nd || 'Điều hành hoạt động phòng kinh doanh / Đồng hành hỗ trợ nhân sự'
            };
          }),
          laTruongPhong: true,
          dinhHuongDieuHanh: {
            mucTieuDoanhThuPhong: dh?.muc_tieu_doanh_thu_phong || 0,
            soHopDongDuKien: dh?.so_hop_dong_du_kien || 0,
            trongTamDieuHanh: dh?.trong_tam_dieu_hanh || '',
            keHoachHoTroNhanSu: dh?.ke_hoach_ho_tro_nhan_su || ''
          },
          danhGiaTuanQuaTP: daLuuTP?.danh_gia_tuan_qua || '',
          deXuatBanGiamDocTP: daLuuTP?.de_xuat_ban_giam_doc || ''
        });
      }

      // 2. Thêm Sheet của từng Chuyên viên Kinh doanh thực sự
      danhSachBaoCaoTeam.forEach((item) => {
        const nv = item.nv;
        const bc = item.baoCao;
        const bcTruoc = dsBaoCaoTuanTruoc.find((b) => b.nhan_vien_id === nv.id);

        const daCuaSale = dsDuAnTiemNangChiNhanh.filter(
          (d) =>
            d.duAnGoc.nguoi_phu_trach_id === nv.id ||
            d.duAnGoc.nguoi_quan_ly_id === nv.id ||
            d.duAnGoc.nguoi_tao_id === nv.id
        );

        // Mục tiêu tuần: Lấy từ kpi_tuan_qua của báo cáo hoặc cam_ket_tuan_toi của tuần trước (mặc định 0)
        const mtKhachMoi = Number(bc.kpi_tuan_qua?.khach_moi_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.khach_moi?.target ?? 0);
        const mtBaoGia = Number(bc.kpi_tuan_qua?.bao_gia_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.bao_gia?.target ?? 0);
        const mtDuAn = Number(bc.kpi_tuan_qua?.du_an_lam_viec_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.du_an_lam_viec?.target ?? bcTruoc?.cam_ket_tuan_toi?.cuoc_hen?.target ?? 0);
        const mtHopDong = Number(bc.kpi_tuan_qua?.hop_dong_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.hop_dong?.target ?? 0);
        const mtDoanhThu = Number(bc.kpi_tuan_qua?.doanh_so_muc_tieu ?? bcTruoc?.cam_ket_tuan_toi?.doanh_so?.target ?? 0);

        // Số thực tế đạt được: Đọc trực tiếp từ kpi_tuan_qua của báo cáo (mặc định 0)
        const ttKhachMoi = Number(bc.kpi_tuan_qua?.khach_moi_thuc_te ?? bc.thuc_hien_tiep_can_tuan_nay ?? 0);
        const ttBaoGia = Number(bc.kpi_tuan_qua?.bao_gia_thuc_te ?? bc.tinh_trang_tuan_nay.bao_gia ?? 0);
        const ttDuAn = Number(bc.kpi_tuan_qua?.du_an_lam_viec_thuc_te ?? bc.tinh_trang_tuan_nay.dang_tiep_can ?? 0);
        const ttHopDong = Number(bc.kpi_tuan_qua?.hop_dong_thuc_te ?? bc.tinh_trang_tuan_nay.hop_dong ?? 0);
        const ttDoanhThu = Number(bc.kpi_tuan_qua?.doanh_so_thuc_te ?? (bc.dt_tuan_ky_ket || 0));

        danhSachBaoCaoSale.push({
          tuan: bc.tuan,
          nhanTieuDeTuan: `${infoTuan.nhanTieuDe} (${infoTuan.khoangNgayNhan}/${infoTuan.nam})`,
          nhanVien: {
            id: nv.id,
            ho_va_ten: nv.ho_va_ten,
            ma_nhan_vien: nv.ma_nhan_vien,
            chuc_vu: nv.chuc_vu || 'Chuyên viên Kinh doanh',
            phong_ban: nv.phong_ban_id || undefined
          },
          kpiTuanQua: {
            khachHangMoi: { mucTieu: mtKhachMoi, thucTe: ttKhachMoi },
            baoGia: { mucTieu: mtBaoGia, thucTe: ttBaoGia },
            duAnLamViec: { mucTieu: mtDuAn, thucTe: ttDuAn },
            hopDongKy: { mucTieu: mtHopDong, thucTe: ttHopDong },
            doanhThu: { mucTieu: mtDoanhThu, thucTe: ttDoanhThu }
          },
          danhSachDuAnTrongDiem: daCuaSale.map((d, idx) => ({
            stt: idx + 1,
            id: d.id,
            tenDuAn: d.tenDuAn,
            tenKhachHang: d.tenKhachHang,
            nguoiLienHe: d.nguoiLienHe,
            soDienThoai: d.soDienThoai,
            sanPhamDichVu: d.sanPhamDichVu,
            giaTriDeal: d.giaTriDeal,
            giaiDoanKey: d.giaiDoanKey,
            tenGiaiDoan: d.tenGiaiDoan,
            mucDoTiemNang: d.mucDoTiemNang,
            xacSuatPct: d.xacSuatPct
          })),
          camKetTuanToi: {
            khachHangMoi: bc.cam_ket_tuan_toi?.khach_moi || { target: 0, min: 0, max: 0 },
            baoGia: bc.cam_ket_tuan_toi?.bao_gia || { target: 0, min: 0, max: 0 },
            duAnLamViec: bc.cam_ket_tuan_toi?.du_an_lam_viec || bc.cam_ket_tuan_toi?.cuoc_hen || { target: 0, min: 0, max: 0 },
            hopDongMoi: bc.cam_ket_tuan_toi?.hop_dong || { target: 0, min: 0, max: 0 },
            doanhThu: bc.cam_ket_tuan_toi?.doanh_so || { target: 0, min: 0, max: 0 }
          },
          lichLamViecTuanToi: infoTuanToi.danhSachNgay.map((d, idx) => {
            const lichNgay = lichTuanToiToanTeam.filter(
              (l) => l.ngay === d.ngay && (l.nguoi_phu_trach_id === nv.id || l.nguoi_tao_id === nv.id)
            );
            const nd = lichNgay.map((l) => `${l.gio_bat_dau || ''} ${l.ten_khach_hang}: ${l.noi_dung || l.tieu_de || ''}`).join('; ');
            return {
              thu: idx + 1,
              tenThuNgay: `${d.thuNhan === 'CN' ? 'Chủ Nhật' : `Thứ ${d.thuNhan.replace('T', '')}`} (${d.ngayNgan})`,
              noiDungChiTiet: nd || 'Tác nghiệp văn phòng / Bám sát dự án'
            };
          }),
          laTruongPhong: false
        });
      });

      const blob = await taoFileExcelTongHopToanBoSaleChiNhanh({
        tuan: tuanChon,
        nhanTieuDeTuan: infoTuan.nhanTieuDe,
        tenChiNhanh: baoCaoTongChiNhanh.ten_chi_nhanh || 'Chi Nhánh',
        baoCaoTongChiNhanh,
        danhSachBaoCaoSale,
        lichTuanToiToanChiNhanh: lichTuanToiToanTeam,
        danhSachDuAnTrongDiemChiNhanh: dsDuAnTiemNangChiNhanh.map((d, idx) => ({
          stt: idx + 1,
          id: d.id,
          tenDuAn: d.tenDuAn,
          tenKhachHang: d.tenKhachHang,
          nguoiLienHe: d.nguoiLienHe,
          soDienThoai: d.soDienThoai,
          sanPhamDichVu: d.sanPhamDichVu,
          giaTriDeal: d.giaTriDeal,
          giaiDoanKey: d.giaiDoanKey,
          tenGiaiDoan: d.tenGiaiDoan,
          mucDoTiemNang: d.mucDoTiemNang,
          xacSuatPct: d.xacSuatPct,
          nguoiPhuTrach: d.tenNhanVienPhuTrach
        }))
      });

      taiFileExcelBlob(blob, `BaoCao_TongHop_ChiNhanh_${baoCaoTongChiNhanh.ten_chi_nhanh || 'ChiNhanh'}_${tuanChon}.xlsx`);
      hienThongBao('Đã xuất thành công file Excel tổng hợp chi nhánh (gồm Trưởng phòng & mỗi Sale 1 sheet)!');
    } catch (e) {
      console.error(e);
      alert('Không thể xuất file Excel tổng hợp chi nhánh.');
    }
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
      {/* Thanh điều khiển gọn: Tuần + Chế độ xem + Bộ lọc */}
      <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setTuanChon((t) => dichChuyenTuanISO(t, -1))}
              className="size-7.5 rounded-lg hover:bg-white inline-flex items-center justify-center text-slate-600 cursor-pointer transition"
              title="Tuần trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="px-2.5 text-center leading-tight">
              <span className="text-xs font-extrabold text-slate-900 uppercase">
                {infoTuan.nhanTieuDe}
              </span>
              <span className="text-[11px] text-slate-500 font-medium ml-1.5">
                ({infoTuan.khoangNgayNhan})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTuanChon((t) => dichChuyenTuanISO(t, 1))}
              className="size-7.5 rounded-lg hover:bg-white inline-flex items-center justify-center text-slate-600 cursor-pointer transition"
              title="Tuần sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTuanChon(layTuanHienTaiISO())}
            className="h-8.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Tuần này
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {laQuanLy && (
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTabChinh('quan_ly')}
                className={cn(
                  'h-7.5 px-3 rounded-lg transition cursor-pointer',
                  tabChinh === 'quan_ly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Tổng hợp Chi nhánh
              </button>
              <button
                type="button"
                onClick={() => setTabChinh('ca_nhan')}
                className={cn(
                  'h-7.5 px-3 rounded-lg transition cursor-pointer',
                  tabChinh === 'ca_nhan'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Chi tiết nhân sự
              </button>
            </div>
          )}

          {laQuanLy && dsChiNhanh.length > 0 && (
            <select
              value={chiNhanhLocId}
              onChange={(e) => setChiNhanhLocId(e.target.value)}
              className="h-8.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
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
              className="h-8.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
            >
              {dsNhanSuChonXem.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tenHienThi}
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
        /* TAB QUẢN LÝ: TỔNG HỢP CHI NHÁNH (TÁCH RÕ BÁO CÁO & KẾ HOẠCH)      */
        /* ================================================================= */
        (() => {
          const tongKQ = danhSachBaoCaoTeam.reduce(
            (acc, x) => {
              const bcDuyet = x.baoCao.trang_thai === 'da_duyet';
              const khDuyet = (x.baoCao.trang_thai_ke_hoach || 'nhap') === 'da_duyet';

              if (bcDuyet) {
                acc.soBaoCaoDuyet += 1;
                const k = x.baoCao.kpi_tuan_qua;
                acc.km += Number(k?.khach_moi_thuc_te ?? x.baoCao.thuc_hien_tiep_can_tuan_nay ?? 0);
                acc.bg += Number(k?.bao_gia_thuc_te ?? x.baoCao.tinh_trang_tuan_nay?.bao_gia ?? 0);
                acc.da += Number(k?.du_an_lam_viec_thuc_te ?? x.baoCao.tinh_trang_tuan_nay?.dang_tiep_can ?? 0);
                acc.hd += Number(k?.hop_dong_thuc_te ?? x.baoCao.tinh_trang_tuan_nay?.hop_dong ?? 0);
                acc.ds += Number(k?.doanh_so_thuc_te ?? x.baoCao.dt_tuan_ky_ket ?? 0);
              }

              if (khDuyet) {
                acc.soKeHoachDuyet += 1;
                const ck = x.baoCao.cam_ket_tuan_toi;
                acc.ckKM += Number(ck?.khach_moi?.target ?? 0);
                acc.ckBG += Number(ck?.bao_gia?.target ?? 0);
                acc.ckDA += Number(ck?.du_an_lam_viec?.target ?? 0);
                acc.ckHD += Number(ck?.hop_dong?.target ?? 0);
                acc.ckDS += Number(ck?.doanh_so?.target ?? 0);
                acc.daTiemNang += x.dsDATiemNang.length;
                acc.lichToi += x.lichToi.length;
              }
              return acc;
            },
            {
              soBaoCaoDuyet: 0,
              soKeHoachDuyet: 0,
              km: 0,
              bg: 0,
              da: 0,
              hd: 0,
              ds: 0,
              ckKM: 0,
              ckBG: 0,
              ckDA: 0,
              ckHD: 0,
              ckDS: 0,
              daTiemNang: 0,
              lichToi: 0
            }
          );

          return (
            <div className="space-y-4">
              {/* Header Tổng hợp Chi nhánh + Sub-tabs Báo cáo / Kế hoạch */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase">
                      {baoCaoTongChiNhanh.ten_chi_nhanh || 'Chi nhánh'}
                    </h2>
                    <div className="text-[11px] text-slate-500">
                      {tabTongHop === 'bao_cao'
                        ? `Báo cáo đã chốt: ${tongKQ.soBaoCaoDuyet}/${danhSachBaoCaoTeam.length} nhân sự`
                        : `Kế hoạch đã chốt: ${tongKQ.soKeHoachDuyet}/${danhSachBaoCaoTeam.length} nhân sự`}
                    </div>
                  </div>

                  <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTabTongHop('bao_cao')}
                      className={cn(
                        'h-7.5 px-3 rounded-lg transition cursor-pointer',
                        tabTongHop === 'bao_cao'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      1. Báo cáo &amp; KQ làm việc {infoTuan.nhanTieuDe}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTabTongHop('ke_hoach')}
                      className={cn(
                        'h-7.5 px-3 rounded-lg transition cursor-pointer',
                        tabTongHop === 'ke_hoach'
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      2. Kế hoạch {infoTuanToi.nhanTieuDe}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={xuLyXuatExcelToanBoSale}
                    className="h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="size-4" />
                    <span>Xuất Excel Tổng hợp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setModalSlide({
                        mo: true,
                        baoCao: baoCaoTongChiNhanh,
                        lichTuanToi: lichTuanToiToanTeam,
                        tieuDePhu: `Tổng hợp ${danhSachBaoCaoTeam.length} Chuyên viên Kinh doanh`
                      })
                    }
                    className="h-8.5 px-3.5 rounded-xl bg-[#D11317] hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="size-4" />
                    <span>Xem Slide &amp; PDF</span>
                  </button>
                </div>
              </div>

              {tabTongHop === 'bao_cao' ? (
                /* BẢNG 1: BÁO CÁO & KQ LÀM VIỆC TUẦN X (CHỈ HIỆN SỐ ĐÃ DUYỆT CHỐT CUỐI) */
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                          <th className="py-3 px-3 text-center w-12">STT</th>
                          <th className="py-3 px-4 min-w-[165px]">Nhân sự</th>
                          <th className="py-3 px-3 w-[130px]">Trạng thái BC</th>
                          <th className="py-3 px-3 w-[110px] text-center">KQ làm việc</th>
                          <th className="py-3 px-3 w-[85px] text-right">KH mới</th>
                          <th className="py-3 px-3 w-[85px] text-right">Báo giá</th>
                          <th className="py-3 px-3 w-[85px] text-right">Dự án</th>
                          <th className="py-3 px-3 w-[85px] text-right">Hợp đồng</th>
                          <th className="py-3 px-4 w-[135px] text-right">Doanh số (VNĐ)</th>
                          <th className="py-3 px-4 w-[1%] whitespace-nowrap text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tpKinhDoanh && (() => {
                          const bcTP = dsBaoCaoTuan.find((b) => b.nhan_vien_id === tpKinhDoanh.id);
                          const stTP = NHAN_TRANG_THAI[bcTP?.trang_thai || 'nhap'];
                          const lichTPNay = dsLichGap.filter(
                            (l) =>
                              !l.da_xoa &&
                              l.ngay >= infoTuan.ngayBatDau &&
                              l.ngay <= infoTuan.ngayKetThuc &&
                              (l.nguoi_phu_trach_id === tpKinhDoanh.id || l.nguoi_tao_id === tpKinhDoanh.id)
                          );
                          const lichTPXong = lichTPNay.filter((l) => l.trang_thai === 'da_hoan_thanh').length;
                          return (
                            <tr className="bg-amber-50/30 hover:bg-amber-50/50">
                              <td className="py-3 px-3 text-center font-bold text-amber-700">—</td>
                              <td className="py-3 px-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNhanVienDangXemId(tpKinhDoanh.id);
                                    setTabChinh('ca_nhan');
                                  }}
                                  className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-left"
                                >
                                  {tpKinhDoanh.ho_va_ten}
                                </button>
                                <div className="text-[11px] text-amber-700 font-semibold">Trưởng phòng KD</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', stTP.cls)}>
                                  {stTP.label}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalXemLichNV({
                                      mo: true,
                                      nhanSu: tpKinhDoanh,
                                      lich: lichTPNay,
                                      tieuDe: `KQ làm việc ${infoTuan.nhanTieuDe} — ${tpKinhDoanh.ho_va_ten}`
                                    })
                                  }
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold cursor-pointer"
                                >
                                  {lichTPXong}/{lichTPNay.length} lịch
                                </button>
                              </td>
                              <td colSpan={5} className="py-3 px-3 text-[11px] text-slate-600">
                                {bcTP?.trang_thai === 'da_duyet' && bcTP?.danh_gia_tuan_qua
                                  ? bcTP.danh_gia_tuan_qua
                                  : 'Báo cáo điều hành phòng Kinh doanh'}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {bcTP && (
                                  <div className="inline-flex items-center gap-1.5">
                                    {bcTP.trang_thai === 'cho_giam_doc_duyet' && laNguoiDuyetCap2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDuyetTuan(bcTP, 'da_duyet', undefined, 'bao_cao')}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="size-3.5" />
                                        <span>Duyệt cuối</span>
                                      </button>
                                    )}
                                    {(bcTP.trang_thai === 'cho_giam_doc_duyet' ||
                                      (bcTP.trang_thai === 'da_duyet' && laNguoiDuyetCap2)) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setModalYeuCauSua({
                                            mo: true,
                                            baoCao: bcTP,
                                            ghiChu: bcTP.ghi_chu_quan_ly || '',
                                            phanDuyet: 'bao_cao'
                                          })
                                        }
                                        className="h-7 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <MessageSquareWarning className="size-3.5" />
                                        <span>{bcTP.trang_thai === 'da_duyet' ? 'Mở khóa' : 'Yêu cầu sửa'}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })()}

                        {danhSachBaoCaoTeam.map(({ nv, baoCao, daGui, lichTuanNay }, idx) => {
                          const st = NHAN_TRANG_THAI[baoCao.trang_thai];
                          const daDuyet = baoCao.trang_thai === 'da_duyet';
                          const k = baoCao.kpi_tuan_qua;
                          const kmTT = Number(k?.khach_moi_thuc_te ?? baoCao.thuc_hien_tiep_can_tuan_nay ?? 0);
                          const bgTT = Number(k?.bao_gia_thuc_te ?? baoCao.tinh_trang_tuan_nay?.bao_gia ?? 0);
                          const daTT = Number(k?.du_an_lam_viec_thuc_te ?? baoCao.tinh_trang_tuan_nay?.dang_tiep_can ?? 0);
                          const hdTT = Number(k?.hop_dong_thuc_te ?? baoCao.tinh_trang_tuan_nay?.hop_dong ?? 0);
                          const dsTT = Number(k?.doanh_so_thuc_te ?? baoCao.dt_tuan_ky_ket ?? 0);
                          const lichXong = lichTuanNay.filter((l) => l.trang_thai === 'da_hoan_thanh').length;

                          return (
                            <tr key={nv.id} className="hover:bg-slate-50/60">
                              <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
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
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={cn(
                                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                                    daGui ? st.cls : 'bg-slate-50 text-slate-500 border-slate-200'
                                  )}
                                >
                                  {daGui ? st.label : 'Chưa lập'}
                                </span>
                                {baoCao.yeu_cau_mo_khoa && (
                                  <div className="text-[10.5px] text-amber-700 font-semibold mt-1" title={baoCao.yeu_cau_mo_khoa.ly_do}>
                                    Xin mở khóa: {baoCao.yeu_cau_mo_khoa.ly_do}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {lichTuanNay.length > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setModalXemLichNV({
                                        mo: true,
                                        nhanSu: nv,
                                        lich: lichTuanNay,
                                        tieuDe: `KQ làm việc ${infoTuan.nhanTieuDe} — ${nv.ho_va_ten}`
                                      })
                                    }
                                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-semibold cursor-pointer tabular-nums"
                                  >
                                    {lichXong}/{lichTuanNay.length} lịch
                                  </button>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                                {daDuyet ? (
                                  <>
                                    {kmTT}
                                    {Number(k?.khach_moi_muc_tieu || 0) > 0 && (
                                      <span className="text-[10.5px] text-slate-400 font-normal">/{k?.khach_moi_muc_tieu}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                                {daDuyet ? (
                                  <>
                                    {bgTT}
                                    {Number(k?.bao_gia_muc_tieu || 0) > 0 && (
                                      <span className="text-[10.5px] text-slate-400 font-normal">/{k?.bao_gia_muc_tieu}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 tabular-nums">
                                {daDuyet ? (
                                  <>
                                    {daTT}
                                    {Number(k?.du_an_lam_viec_muc_tieu || 0) > 0 && (
                                      <span className="text-[10.5px] text-slate-400 font-normal">/{k?.du_an_lam_viec_muc_tieu}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-purple-700 tabular-nums">
                                {daDuyet ? (
                                  <>
                                    {hdTT}
                                    {Number(k?.hop_dong_muc_tieu || 0) > 0 && (
                                      <span className="text-[10.5px] text-slate-400 font-normal">/{k?.hop_dong_muc_tieu}</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-300 font-normal">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                                {daDuyet ? fmtSo(dsTT) : <span className="text-slate-300 font-normal">—</span>}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  {baoCao.trang_thai === 'cho_duyet' && (laNguoiDuyetCap1 || laNguoiDuyetCap2) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDuyetTuan(
                                          baoCao,
                                          cheDoDuyet === '2_cap' ? 'cho_giam_doc_duyet' : 'da_duyet',
                                          undefined,
                                          'bao_cao'
                                        )
                                      }
                                      className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="size-3.5" />
                                      <span>{cheDoDuyet === '2_cap' ? 'Duyệt → GĐ' : 'Duyệt'}</span>
                                    </button>
                                  )}
                                  {baoCao.trang_thai === 'cho_giam_doc_duyet' && laNguoiDuyetCap2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDuyetTuan(baoCao, 'da_duyet', undefined, 'bao_cao')}
                                      className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="size-3.5" />
                                      <span>Duyệt cuối</span>
                                    </button>
                                  )}
                                  {(baoCao.trang_thai === 'cho_duyet' ||
                                    baoCao.trang_thai === 'cho_giam_doc_duyet' ||
                                    (baoCao.trang_thai === 'da_duyet' &&
                                      (laNguoiDuyetCap2 || (cheDoDuyet === '1_cap' && laNguoiDuyetCap1)))) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModalYeuCauSua({
                                          mo: true,
                                          baoCao,
                                          ghiChu: baoCao.ghi_chu_quan_ly || '',
                                          phanDuyet: 'bao_cao'
                                        })
                                      }
                                      className="h-7 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <MessageSquareWarning className="size-3.5" />
                                      <span>{baoCao.trang_thai === 'da_duyet' ? 'Mở khóa' : 'Yêu cầu sửa'}</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => xuLyXuatExcelMotSale(nv, baoCao)}
                                    className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    title="Xuất Excel báo cáo tuần chuẩn"
                                  >
                                    <Download className="size-3.5" />
                                    <span>Xuất Excel</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* Dòng TỔNG CHI NHÁNH (Chỉ tính báo cáo Đã duyệt) */}
                        <tr className="bg-red-50/70 border-t-2 border-red-200 font-extrabold text-xs">
                          <td colSpan={4} className="py-3 px-4 text-red-900 uppercase">
                            Tổng chi nhánh (Đã duyệt: {tongKQ.soBaoCaoDuyet}/{danhSachBaoCaoTeam.length})
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-blue-800 tabular-nums">{tongKQ.km}</td>
                          <td className="py-3 px-3 text-right font-mono text-amber-800 tabular-nums">{tongKQ.bg}</td>
                          <td className="py-3 px-3 text-right font-mono text-indigo-800 tabular-nums">{tongKQ.da}</td>
                          <td className="py-3 px-3 text-right font-mono text-purple-800 tabular-nums">{tongKQ.hd}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-800 tabular-nums text-sm">{fmtSo(tongKQ.ds)}</td>
                          <td className="py-3 px-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* BẢNG 2: KẾ HOẠCH TUẦN TỚI (CHỈ HIỆN SỐ ĐÃ DUYỆT CHỐT CUỐI) + DỰ ÁN TRỌNG ĐIỂM */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                            <th className="py-3 px-3 text-center w-12">STT</th>
                            <th className="py-3 px-4 min-w-[165px]">Nhân sự</th>
                            <th className="py-3 px-3 w-[130px]">Trạng thái KH</th>
                            <th className="py-3 px-3 w-[85px] text-right">KH mới</th>
                            <th className="py-3 px-3 w-[85px] text-right">Báo giá</th>
                            <th className="py-3 px-3 w-[85px] text-right">Dự án</th>
                            <th className="py-3 px-3 w-[85px] text-right">Hợp đồng</th>
                            <th className="py-3 px-4 w-[135px] text-right">DS dự kiến (VNĐ)</th>
                            <th className="py-3 px-3 w-[125px] text-center">DA trọng điểm</th>
                            <th className="py-3 px-3 w-[100px] text-center">Lịch tuần tới</th>
                            <th className="py-3 px-4 w-[1%] whitespace-nowrap text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tpKinhDoanh && (() => {
                            const bcTP = dsBaoCaoTuan.find((b) => b.nhan_vien_id === tpKinhDoanh.id);
                            const stKH = bcTP?.trang_thai_ke_hoach || 'nhap';
                            const stTP = NHAN_TRANG_THAI[stKH];
                            const dh = bcTP?.dinh_huong_dieu_hanh_tuan_toi;
                            const lichTPToi = dsLichGap.filter(
                              (l) =>
                                !l.da_xoa &&
                                l.trang_thai !== 'huy' &&
                                l.ngay >= infoTuanToi.ngayBatDau &&
                                l.ngay <= infoTuanToi.ngayKetThuc &&
                                (l.nguoi_phu_trach_id === tpKinhDoanh.id || l.nguoi_tao_id === tpKinhDoanh.id)
                            );
                            return (
                              <tr className="bg-amber-50/30 hover:bg-amber-50/50">
                                <td className="py-3 px-3 text-center font-bold text-amber-700">—</td>
                                <td className="py-3 px-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNhanVienDangXemId(tpKinhDoanh.id);
                                      setTabChinh('ca_nhan');
                                    }}
                                    className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-left"
                                  >
                                    {tpKinhDoanh.ho_va_ten}
                                  </button>
                                  <div className="text-[11px] text-amber-700 font-semibold">Trưởng phòng KD</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', stTP.cls)}>
                                    {stTP.label}
                                  </span>
                                </td>
                                <td colSpan={5} className="py-3 px-3 text-[11px] text-slate-600 tabular-nums">
                                  {stKH === 'da_duyet' && dh?.muc_tieu_doanh_thu_phong
                                    ? `Định hướng phòng: ${fmtSo(dh.muc_tieu_doanh_thu_phong)} đ (${dh.so_hop_dong_du_kien || 0} HĐ)`
                                    : 'Kế hoạch điều hành phòng'}
                                </td>
                                <td className="py-3 px-3 text-center text-slate-300">—</td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setModalXemLichNV({
                                        mo: true,
                                        nhanSu: tpKinhDoanh,
                                        lich: lichTPToi,
                                        tieuDe: `Lịch ${infoTuanToi.nhanTieuDe} — ${tpKinhDoanh.ho_va_ten}`
                                      })
                                    }
                                    className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                                  >
                                    {lichTPToi.length} lịch
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  {bcTP && (
                                    <div className="inline-flex items-center gap-1.5">
                                      {stKH === 'cho_giam_doc_duyet' && laNguoiDuyetCap2 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDuyetTuan(bcTP, 'da_duyet', undefined, 'ke_hoach')}
                                          className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Check className="size-3.5" />
                                          <span>Duyệt cuối</span>
                                        </button>
                                      )}
                                      {(stKH === 'cho_giam_doc_duyet' || (stKH === 'da_duyet' && laNguoiDuyetCap2)) && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setModalYeuCauSua({
                                              mo: true,
                                              baoCao: bcTP,
                                              ghiChu: bcTP.ghi_chu_ke_hoach || '',
                                              phanDuyet: 'ke_hoach'
                                            })
                                          }
                                          className="h-7 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <MessageSquareWarning className="size-3.5" />
                                          <span>{stKH === 'da_duyet' ? 'Mở khóa' : 'Yêu cầu sửa'}</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })()}

                          {danhSachBaoCaoTeam.map(({ nv, baoCao, daGui, lichToi, dsDATiemNang }, idx) => {
                            const ttKH = baoCao.trang_thai_ke_hoach || 'nhap';
                            const st = NHAN_TRANG_THAI[ttKH];
                            const daDuyetKH = ttKH === 'da_duyet';
                            const ck = baoCao.cam_ket_tuan_toi;
                            const tongGiaTriDA = dsDATiemNang.reduce((s, d) => s + (d.gia_tri_hop_dong || d.gia_tri_du_kien || 0), 0);

                            return (
                              <tr key={nv.id} className="hover:bg-slate-50/60">
                                <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
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
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={cn(
                                      'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                                      daGui ? st.cls : 'bg-slate-50 text-slate-500 border-slate-200'
                                    )}
                                  >
                                    {daGui ? st.label : 'Chưa lập'}
                                  </span>
                                  {baoCao.yeu_cau_mo_khoa_ke_hoach && (
                                    <div className="text-[10.5px] text-amber-700 font-semibold mt-1" title={baoCao.yeu_cau_mo_khoa_ke_hoach.ly_do}>
                                      Xin mở khóa: {baoCao.yeu_cau_mo_khoa_ke_hoach.ly_do}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                                  {daDuyetKH ? (ck?.khach_moi?.target ?? 0) : <span className="text-slate-300 font-normal">—</span>}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                                  {daDuyetKH ? (ck?.bao_gia?.target ?? 0) : <span className="text-slate-300 font-normal">—</span>}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 tabular-nums">
                                  {daDuyetKH ? (ck?.du_an_lam_viec?.target ?? 0) : <span className="text-slate-300 font-normal">—</span>}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-purple-700 tabular-nums">
                                  {daDuyetKH ? (ck?.hop_dong?.target ?? 0) : <span className="text-slate-300 font-normal">—</span>}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                                  {daDuyetKH ? fmtSo(ck?.doanh_so?.target ?? 0) : <span className="text-slate-300 font-normal">—</span>}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {daDuyetKH && dsDATiemNang.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModalXemDANhanVien({
                                          mo: true,
                                          nhanSu: nv,
                                          dsDuAn: dsDATiemNang
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 border border-rose-200"
                                    >
                                      <Target className="size-3 text-rose-600" />
                                      <span>{dsDATiemNang.length} DA {tongGiaTriDA > 0 ? `(${fmtSo(tongGiaTriDA)})` : ''}</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {lichToi.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModalXemLichNV({
                                          mo: true,
                                          nhanSu: nv,
                                          lich: lichToi,
                                          tieuDe: `Lịch ${infoTuanToi.nhanTieuDe} — ${nv.ho_va_ten}`
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold cursor-pointer"
                                    >
                                      {lichToi.length} lịch
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 text-[11px]">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    {ttKH === 'cho_duyet' && (laNguoiDuyetCap1 || laNguoiDuyetCap2) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDuyetTuan(
                                            baoCao,
                                            cheDoDuyet === '2_cap' ? 'cho_giam_doc_duyet' : 'da_duyet',
                                            undefined,
                                            'ke_hoach'
                                          )
                                        }
                                        className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="size-3.5" />
                                        <span>{cheDoDuyet === '2_cap' ? 'Duyệt → GĐ' : 'Duyệt'}</span>
                                      </button>
                                    )}
                                    {ttKH === 'cho_giam_doc_duyet' && laNguoiDuyetCap2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDuyetTuan(baoCao, 'da_duyet', undefined, 'ke_hoach')}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="size-3.5" />
                                        <span>Duyệt cuối</span>
                                      </button>
                                    )}
                                    {(ttKH === 'cho_duyet' ||
                                      ttKH === 'cho_giam_doc_duyet' ||
                                      (ttKH === 'da_duyet' &&
                                        (laNguoiDuyetCap2 || (cheDoDuyet === '1_cap' && laNguoiDuyetCap1)))) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setModalYeuCauSua({
                                            mo: true,
                                            baoCao,
                                            ghiChu: baoCao.ghi_chu_ke_hoach || '',
                                            phanDuyet: 'ke_hoach'
                                          })
                                        }
                                        className="h-7 px-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <MessageSquareWarning className="size-3.5" />
                                        <span>{ttKH === 'da_duyet' ? 'Mở khóa' : 'Yêu cầu sửa'}</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {/* Dòng TỔNG CHI NHÁNH (Chỉ tính kế hoạch Đã duyệt) */}
                          <tr className="bg-blue-50/70 border-t-2 border-blue-200 font-extrabold text-xs">
                            <td colSpan={3} className="py-3 px-4 text-blue-950 uppercase">
                              Tổng kế hoạch chi nhánh (Đã duyệt: {tongKQ.soKeHoachDuyet}/{danhSachBaoCaoTeam.length})
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-blue-800 tabular-nums">{tongKQ.ckKM}</td>
                            <td className="py-3 px-3 text-right font-mono text-amber-800 tabular-nums">{tongKQ.ckBG}</td>
                            <td className="py-3 px-3 text-right font-mono text-indigo-800 tabular-nums">{tongKQ.ckDA}</td>
                            <td className="py-3 px-3 text-right font-mono text-purple-800 tabular-nums">{tongKQ.ckHD}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-800 tabular-nums text-sm">{fmtSo(tongKQ.ckDS)}</td>
                            <td className="py-3 px-3 text-center font-bold text-rose-700">{tongKQ.daTiemNang} DA</td>
                            <td className="py-3 px-3 text-center font-bold text-blue-700">{tongKQ.lichToi} lịch</td>
                            <td className="py-3 px-4"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

          {/* KHỐI II: DỰ ÁN TRỌNG ĐIỂM TOÀN CHI NHÁNH */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  II
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Dự án trọng điểm {infoTuanToi.nhanTieuDe} ({dsDuAnTiemNangChiNhanh.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="text-slate-500 font-medium">Tổng giá trị deal:</span>
                <span className="text-primary font-black tabular-nums">
                  {fmtSo(dsDuAnTiemNangChiNhanh.reduce((s, d) => s + (d.giaTriDeal || 0), 0))}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-4">Tên dự án &amp; Khách hàng / CĐT</th>
                    <th className="py-2.5 px-3 w-40">Nhân sự phụ trách</th>
                    <th className="py-2.5 px-3 w-40">Người liên hệ &amp; SĐT</th>
                    <th className="py-2.5 px-3 w-36 text-right">Giá trị Deal / HĐ</th>
                    <th className="py-2.5 px-3 w-36">Giai đoạn</th>
                    <th className="py-2.5 px-3 w-32 text-center">Tiềm năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dsDuAnTiemNangChiNhanh.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                        Chưa có dự án tiềm năng cao nào được đưa vào kế hoạch tuần.
                      </td>
                    </tr>
                  ) : (
                    dsDuAnTiemNangChiNhanh.map((d, idx) => {
                      const cfgTN = BANG_TIEM_NANG_DU_AN[d.mucDoTiemNang || ''] || BANG_TIEM_NANG_DU_AN.cao;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-extrabold text-slate-900">{d.tenDuAn}</div>
                            {d.tenKhachHang && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="size-3 text-slate-400 shrink-0" />
                                <span>CĐT: {d.tenKhachHang}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-blue-700">{d.tenNhanVienPhuTrach}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-800">{d.nguoiLienHe}</div>
                            {d.soDienThoai && (
                              <div className="text-[11px] text-slate-500">{d.soDienThoai}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {fmtSo(d.giaTriDeal)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {d.tenGiaiDoan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={cn('px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border', cfgTN.badgeCls)}>
                              {cfgTN.nhan}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
                </div>
              )}
            </div>
          );
        })()
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
            dsNhanSu={dsNhanSu}
            baoCaoHienTai={formBaoCao}
            baoCaoTuanTruoc={baoCaoTuanTruocCuaNV}
            keHoachTuanNay={keHoachTuanNay}
            keHoachTuanToi={keHoachTuanToi}
            onLuuBaoCao={handleLuuBaoCaoChuan}
            onDuyetBaoCao={async (trangThai, ghiChu, phanDuyet) => {
              if (formBaoCao) await handleDuyetTuan(formBaoCao, trangThai, ghiChu, phanDuyet || 'bao_cao');
            }}
            onThuHoiBaoCao={async (phanDuyet) => {
              if (formBaoCao) {
                await handleLuuBaoCaoChuan(
                  phanDuyet === 'ke_hoach' ? { trang_thai_ke_hoach: 'nhap' } : { trang_thai: 'nhap' },
                  false
                );
              }
            }}
            onYeuCauMoKhoa={handleYeuCauMoKhoa}
            cheDoDuyet={cheDoDuyet}
            laNguoiDuyetCap1={laNguoiDuyetCap1}
            laNguoiDuyetCap2={laNguoiDuyetCap2}
            onCapNhatKetQuaLich={async (lich, ketQua) => {
              await capNhatLichGapKH(lich.id, { trang_thai: 'da_hoan_thanh', ket_qua: ketQua }, uid);
              setDsLichGap((prev) =>
                prev.map((x) =>
                  x.id === lich.id ? { ...x, trang_thai: 'da_hoan_thanh', ket_qua: ketQua } : x
                )
              );
            }}
            laQuanLy={laQuanLy}
            nguoiDungHienTaiId={uid}
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
                  {modalXemLichNV.tieuDe || `Lịch ${infoTuanToi.nhanTieuDe} — ${modalXemLichNV.nhanSu.ho_va_ten}`}
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
                Nhân sự chưa có lịch công tác nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {modalXemLichNV.lich.map((l) => (
                  <div key={l.id} className="py-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700">{l.ngay}</span>
                        <span className="text-slate-500">
                          {l.gio_bat_dau} - {l.gio_ket_thuc}
                        </span>
                        <span className="font-bold text-slate-900">{l.ten_khach_hang}</span>
                      </div>
                      {l.trang_thai === 'da_hoan_thanh' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Đã xong
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600">{l.noi_dung || l.tieu_de}</div>
                    {l.ket_qua && (
                      <div className="text-emerald-700 font-medium bg-emerald-50/70 px-2 py-1 rounded-lg">
                        KQ: {l.ket_qua}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT DỰ ÁN TIỀM NĂNG CỦA 1 NHÂN VIÊN */}
      {modalXemDANhanVien.mo && modalXemDANhanVien.nhanSu && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Dự án tiềm năng bám sát tuần — {modalXemDANhanVien.nhanSu.ho_va_ten}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {modalXemDANhanVien.dsDuAn.length} dự án
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalXemDANhanVien({ mo: false, nhanSu: null, dsDuAn: [] })}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs px-1 text-slate-600">
              <span>Tổng giá trị deal bám sát:</span>
              <span className="font-bold text-rose-600 text-sm">
                {fmtSo(modalXemDANhanVien.dsDuAn.reduce((s, d) => s + (d.gia_tri_hop_dong || d.gia_tri_du_kien || 0), 0))}
              </span>
            </div>

            <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3 text-center w-10">STT</th>
                    <th className="py-2.5 px-3">Tên dự án &amp; Khách hàng</th>
                    <th className="py-2.5 px-3 w-32 text-right">Giá trị Deal</th>
                    <th className="py-2.5 px-3 w-32">Giai đoạn</th>
                    <th className="py-2.5 px-3 w-28 text-center">Tiềm năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modalXemDANhanVien.dsDuAn.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        Nhân sự chưa có dự án tiềm năng cao nào trong kế hoạch tuần này.
                      </td>
                    </tr>
                  ) : (
                    modalXemDANhanVien.dsDuAn.map((da, idx) => {
                      const kh = dsKhachHang.find((k) => k.id === da.khach_hang_id);
                      const gd = dsGiaiDoan.find((g) => g.key === da.giai_doan);
                      return (
                        <tr key={da.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{da.ten_du_an}</div>
                            <div className="text-[11px] text-slate-500">{kh?.ten_khach_hang || '—'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {fmtSo(da.gia_tri_hop_dong || da.gia_tri_du_kien || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-700">
                            {gd?.nhan_ngan || gd?.nhan_day_du || da.giai_doan}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                da.muc_do_tiem_nang === 'rat_cao'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              )}
                            >
                              {da.muc_do_tiem_nang === 'rat_cao' ? 'Rất cao' : 'Cao'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setModalXemDANhanVien({ mo: false, nhanSu: null, dsDuAn: [] })}
                className="h-8.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
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
              await handleDuyetTuan(
                modalYeuCauSua.baoCao,
                'can_dieu_chinh',
                modalYeuCauSua.ghiChu,
                modalYeuCauSua.phanDuyet || 'bao_cao'
              );
              setModalYeuCauSua({ mo: false, baoCao: null, ghiChu: '', phanDuyet: 'bao_cao' });
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

      {/* MODAL DRILL-DOWN CHỈ SỐ CHI NHÁNH */}
      {modalChiTietChiNhanh.mo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">{modalChiTietChiNhanh.tieuDe}</h3>
              <button
                type="button"
                onClick={() => setModalChiTietChiNhanh({ mo: false, tieuDe: '', dongChiTiet: [] })}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Nhân sự</th>
                    <th className="py-2.5 px-3 text-right">Mục tiêu</th>
                    <th className="py-2.5 px-3 text-right">Thực tế</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {modalChiTietChiNhanh.dongChiTiet.map((r) => (
                    <tr key={r.ten}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.ten}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">
                        {fmtSo(r.mucTieu)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {fmtSo(r.thucTe)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          dsDuAnTiemNangChon={dsDuAnTiemNangChiNhanh}
          dsTatCaDuAnCRM={dsDuAn}
          dsKhachHang={dsKhachHang}
          dsNhanSu={dsNhanSu}
          dsSanPham={dsSanPham}
          danhSachBaoCaoTeam={danhSachBaoCaoTeam}
        />
      )}
    </div>
  );
}
