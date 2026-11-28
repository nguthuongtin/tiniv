'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Sparkles,
  Users,
  FolderKanban,
  Award,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Building2,
  ChevronRight,
  Shield,
  Loader2,
  Flame,
  ArrowUpRight,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  FileCheck,
  Target,
  Clock,
  MapPin,
  Home,
  Landmark,
  Map as MapIcon,
  Check,
  ChevronDown
} from 'lucide-react';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen, layPhamViPhongBan } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import { DaiDien } from '../../../thanh_phan/ui/dai_dien';
import {
  Nut,
  Bo_Cuc_Trang,
  KhungDanhSach,
  Bang,
  ChuDeBang,
  HangBang,
  ODauBang,
  ThanBang,
  OBang,
  DanhSachTheMobile,
  TheMobile
} from '../../../thanh_phan/ui';
import { cn } from '../../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../../thu_vien/utils/format_tien';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import type { LichGapKH } from '../../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP, kiemTraLichChuaBaoCao } from '../../../thu_vien/types/lich_gap_kh';
import type { AIDanhGiaNhanSu, MucDoDanhGiaAI, AITongKetDieuHanh } from '../../../thu_vien/types/ai_danh_gia';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachLichGapKH } from '../../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  danhSachAIDanhGia,
  langNgheThayDoiAIDanhGia,
  kichHoatAIDanhGia,
  layAITongKetDieuHanh
} from '../../../dich_vu/ai_danh_gia/dich_vu_ai_danh_gia';
import type { KeHoachTuan, KeHoachThang } from '../../../thu_vien/types/ke_hoach';
import {
  danhSachKeHoachTuanTheoFilter,
  danhSachKeHoachThangTheoFilter,
  layTuanFromDateISO
} from '../../../dich_vu/ke_hoach/dich_vu_ke_hoach';
import DrawerChiTietDanhGia from '../../../thanh_phan/tong_quan_lanh_dao/drawer_chi_tiet_danh_gia';
import ModalDanhSachDuAn from '../../../thanh_phan/tong_quan_lanh_dao/modal_danh_sach_du_an';
import ModalChiTietKeHoach from '../../../thanh_phan/tong_quan_lanh_dao/modal_chi_tiet_ke_hoach';

// Helpers nhận diện đặc thù địa bàn & dòng sản phẩm dự án
const nhanDienDiaBan = (tenDuAn: string, moTa?: string | null): string => {
  const s = `${tenDuAn} ${moTa || ''}`.toUpperCase();
  if (
    s.includes('AN GIANG') ||
    s.includes(' AG ') ||
    s.endsWith(' AG') ||
    s.includes('TRI TÔN') ||
    s.includes('CHỢ MỚI') ||
    s.includes('THOẠI SƠN') ||
    s.includes('PHÚ TÂN') ||
    s.includes('CHÂU ĐỐC') ||
    s.includes('LONG XUYÊN') ||
    s.includes('CÔ TÔ') ||
    s.includes('BÌNH ĐỨC') ||
    s.includes('NÚI CẤM') ||
    s.includes('CÙ LAO GIÊNG') ||
    s.includes('ĐỊNH MỸ') ||
    s.includes('VĨNH HẬU') ||
    s.includes('VĨNH TRẠCH') ||
    s.includes('VĨNH GIA') ||
    s.includes('VĨNH THẠNH TRUNG')
  ) {
    return 'An Giang';
  }
  if (
    s.includes('VĨNH LONG') ||
    s.includes(' VL ') ||
    s.startsWith('VL -') ||
    s.includes('ĐÔNG THÀNH') ||
    s.includes('BÌNH MINH') ||
    s.includes('MỸ THUẬN') ||
    s.includes('CÁI VỒN') ||
    s.includes('SONG PHÚ') ||
    s.includes('TÂN QUỚI') ||
    s.includes('HÒA THUẬN') ||
    s.includes('TRÀ VINH')
  ) {
    return 'Vĩnh Long';
  }
  if (s.includes('CẦN THƠ') || s.includes('NHƠN ÁI') || s.includes('PHAN VĂN TRỊ')) {
    return 'Cần Thơ';
  }
  if (s.includes('ĐỒNG THÁP') || s.includes('LẤP VÒ') || s.includes('LAI VUNG') || s.includes('HÒA LONG')) {
    return 'Đồng Tháp';
  }
  if (s.includes('PHÚ THỌ') || s.includes('THỔ TANG')) {
    return 'Phú Thọ';
  }
  return 'Địa bàn khác';
};

type NhomSanPhamDA = 'danh_so_nha' | 'csdl_dat_dai' | 'so_hoa_di_tich' | 'khac';

const nhanDienNhomSanPham = (
  tenDuAn: string,
  moTa?: string | null
): { key: NhomSanPhamDA; label: string } => {
  const s = `${tenDuAn} ${moTa || ''}`.toUpperCase();
  if (s.includes('ĐÁNH SỐ NHÀ') || s.includes('ĐSN')) {
    return { key: 'danh_so_nha', label: 'Đánh số nhà & Bản đồ nền' };
  }
  if (
    s.includes('ĐẤT ĐAI') ||
    s.includes('NHÀ Ở') ||
    s.includes('CSDL') ||
    s.includes('ĐỊA CHÍNH') ||
    s.includes('QUY CHỦ')
  ) {
    return { key: 'csdl_dat_dai', label: 'CSDL Đất đai & Nhà ở' };
  }
  if (
    s.includes('DI TÍCH') ||
    s.includes('DI SẢN') ||
    s.includes('SA BÀN') ||
    s.includes('TOUR') ||
    s.includes('3D') ||
    s.includes('NGHĨA TRANG')
  ) {
    return { key: 'so_hoa_di_tich', label: 'Số hóa Di tích & Sa bàn 3D' };
  }
  return { key: 'khac', label: 'Giải pháp khác' };
};

const NHAN_GIAI_DOAN_CHUAN: Record<string, { label: string; mauBadge: string }> = {
  tiep_can: { label: '1. Tiếp cận', mauBadge: 'bg-blue-50 text-blue-700 border-blue-200' },
  bao_gia: { label: '2. Báo giá', mauBadge: 'bg-amber-50 text-amber-700 border-amber-200' },
  co_chu_truong: { label: '3. Có chủ trương', mauBadge: 'bg-sky-50 text-sky-700 border-sky-200' },
  ky_hop_dong: { label: '4. Ký HĐ', mauBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  tt_dot_1: { label: '5. TT đợt 1', mauBadge: 'bg-teal-50 text-teal-700 border-teal-200' },
  trien_khai: { label: '6. Triển khai', mauBadge: 'bg-teal-50 text-teal-700 border-teal-200' },
  hoan_thanh_tt_dot_2: { label: '7. Hoàn thành & TT đợt 2', mauBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  tam_dung_huy: { label: 'Tạm dừng / Hủy', mauBadge: 'bg-rose-50 text-rose-700 border-rose-200' }
};

const NHAN_TIEM_NANG_CHUAN: Record<string, { label: string; mauBadge: string }> = {
  rat_cao: { label: 'Rất cao', mauBadge: 'bg-rose-50 text-rose-700 border-rose-200' },
  cao: { label: 'Cao', mauBadge: 'bg-amber-50 text-amber-700 border-amber-200' },
  trung_binh: { label: 'Trung bình', mauBadge: 'bg-slate-50 text-slate-600 border-slate-200' },
  thap: { label: 'Thấp', mauBadge: 'bg-slate-50 text-slate-400 border-slate-200' },
  rat_thap: { label: 'Rất thấp', mauBadge: 'bg-slate-50 text-slate-400 border-slate-200' }
};

export default function TrangTongQuanLanhDao() {
  const router = useRouter();
  const { nguoiDungHienTai } = useStoreXacThuc();

  // State dữ liệu
  const [dangTai, setDangTai] = useState(true);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsLichGap, setDsLichGap] = useState<LichGapKH[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsDanhGiaAI, setDsDanhGiaAI] = useState<AIDanhGiaNhanSu[]>([]);
  const [dsKeHoachTuan, setDsKeHoachTuan] = useState<KeHoachTuan[]>([]);
  const [dsKeHoachThang, setDsKeHoachThang] = useState<KeHoachThang[]>([]);

  // State bộ lọc lãnh đạo
  const [locDiaBan, setLocDiaBan] = useState<string>('tat_ca');
  const [locNhomSP, setLocNhomSP] = useState<string>('tat_ca');
  const [ngayChon, setNgayChon] = useState<string>(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  );

  // State tương tác AI & Modal Drill-down
  const [dangChayAITatCa, setDangChayAITatCa] = useState(false);
  const [tongKetAI, setTongKetAI] = useState<AITongKetDieuHanh | null>(null);
  const [nhanSuDangChon, setNhanSuDangChon] = useState<NhanSu | null>(null);
  const [duAnModal, setDuAnModal] = useState<{
    mo: boolean;
    tieuDe: string;
    moTaPhu?: string;
    danhSachDuAn: HoSoDuAn[];
  } | null>(null);
  const [lichGapModal, setLichGapModal] = useState<{
    mo: boolean;
    tieuDe: string;
    danhSachLich: LichGapKH[];
  } | null>(null);

  // Phân quyền truy cập
  const duocPhepXem = useMemo(() => {
    if (!nguoiDungHienTai) return false;
    return (
      coQuyen(nguoiDungHienTai, 'tong_quan.theo_doi_kinh_doanh') ||
      coQuyen(nguoiDungHienTai, 'lanh_dao.xem') ||
      ['giam_doc', 'truong_phong', 'truong_phong_kd', 'truong_phong_khth', 'quan_tri_he_thong'].includes(
        nguoiDungHienTai.vai_tro as string
      )
    );
  }, [nguoiDungHienTai]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    if (!nguoiDungHienTai?.id) return;
    taiToanBoDuLieu();
  }, [nguoiDungHienTai?.id]);

  // Lắng nghe realtime AI
  useEffect(() => {
    if (!ngayChon) return;
    const unsubscribe = langNgheThayDoiAIDanhGia(ngayChon, (data) => {
      setDsDanhGiaAI(data);
    });
    layAITongKetDieuHanh(ngayChon).then((tk) => setTongKetAI(tk));
    return () => unsubscribe();
  }, [ngayChon]);

  const taiToanBoDuLieu = async () => {
    setDangTai(true);
    try {
      const tuanHienTai = layTuanFromDateISO(ngayChon);
      const thangHienTai = ngayChon.slice(0, 7);

      const [resNS, resDA, resCN, resPB, resAI, resKHTuan, resKHThang, resLichGap, resTongKet] = await Promise.all([
        danhSachNhanSu(),
        danhSachHoSoDuAn(),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachAIDanhGia(ngayChon),
        danhSachKeHoachTuanTheoFilter(tuanHienTai),
        danhSachKeHoachThangTheoFilter(thangHienTai),
        danhSachLichGapKH().catch(() => []),
        layAITongKetDieuHanh(ngayChon).catch(() => null)
      ]);

      const mangNS = Array.isArray(resNS) ? resNS : resNS?.mang || [];
      const mangDA = Array.isArray(resDA) ? resDA : resDA?.mang || [];
      const mangCN = Array.isArray(resCN) ? resCN : resCN?.mang || [];
      const mangPB = Array.isArray(resPB) ? resPB : resPB?.mang || [];
      const mangLichGap = Array.isArray(resLichGap) ? resLichGap : [];

      setDsNhanSu(mangNS.filter((ns: NhanSu) => ns.trang_thai_du_lieu !== 'da_xoa' && ns.trang_thai === true));
      setDsDuAn(mangDA.filter((da: HoSoDuAn) => da.trang_thai !== 'da_xoa' && (da as any).trang_thai_du_lieu !== 'da_xoa'));
      setDsChiNhanh(mangCN.filter((cn: ChiNhanh) => cn.trang_thai_du_lieu !== 'da_xoa'));
      setDsPhongBan(mangPB.filter((pb: PhongBan) => pb.trang_thai_du_lieu !== 'da_xoa'));
      setDsDanhGiaAI(resAI);
      setDsKeHoachTuan(resKHTuan || []);
      setDsKeHoachThang(resKHThang || []);
      setDsLichGap(mangLichGap);
      setTongKetAI(resTongKet);
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu lãnh đạo:', e);
    } finally {
      setDangTai(false);
    }
  };

  // Lọc danh sách nhân viên kinh doanh (không bao gồm Trưởng phòng / Lãnh đạo)
  const phamVi = useMemo(() => layPhamViPhongBan(nguoiDungHienTai), [nguoiDungHienTai]);

  const dsNhanSuHienThi = useMemo(() => {
    return dsNhanSu.filter((ns) => {
      const pb = dsPhongBan.find((p) => p.id === ns.phong_ban_id);
      const tenPb = (pb?.ten_phong_ban || '').toLowerCase();
      if (!tenPb.includes('kinh doanh')) return false;

      // Không chấm KPI lãnh đạo / trưởng phòng
      if (
        ns.vai_tro === 'truong_phong' ||
        ns.vai_tro === 'truong_phong_kd' ||
        ns.vai_tro === 'truong_phong_khth' ||
        ns.vai_tro === 'giam_doc' ||
        ns.vai_tro === 'quan_tri_he_thong' ||
        (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') ||
        (ns.chuc_vu || '').toLowerCase().includes('phó phòng')
      ) {
        return false;
      }

      if (!phamVi.toanCongTy) {
        if (ns.phong_ban_id && !phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id)) {
          return false;
        }
      }
      return true;
    });
  }, [dsNhanSu, dsPhongBan, phamVi]);

  // Bộ lọc dự án theo Địa bàn & Dòng sản phẩm
  const dsDuAnBoLoc = useMemo(() => {
    return dsDuAn.filter((da) => {
      if (locDiaBan !== 'tat_ca') {
        const db = nhanDienDiaBan(da.ten_du_an, da.mo_ta);
        if (db !== locDiaBan) return false;
      }
      if (locNhomSP !== 'tat_ca') {
        const sp = nhanDienNhomSanPham(da.ten_du_an, da.mo_ta);
        if (sp.key !== locNhomSP) return false;
      }
      return true;
    });
  }, [dsDuAn, locDiaBan, locNhomSP]);

  // Thống kê số liệu kinh doanh cốt lõi
  const thongKeLanhDao = useMemo(() => {
    const tongPipeline = dsDuAnBoLoc.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);
    const tongHopDongDaKy = dsDuAnBoLoc.reduce((sum, da) => sum + (Number(da.gia_tri_hop_dong) || 0), 0);
    const tongTienThucVe = dsDuAnBoLoc.reduce((sum, da) => sum + (Number(da.tien_ve_thuc_te) || 0), 0);

    const duAnTiemNangCao = dsDuAnBoLoc.filter((da) => ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang));
    const duAnTiepCan = dsDuAnBoLoc.filter((da) => da.giai_doan === 'tiep_can');
    const duAnBaoGia = dsDuAnBoLoc.filter((da) => da.giai_doan === 'bao_gia');
    const duAnCoChuTruong = dsDuAnBoLoc.filter((da) => da.giai_doan === 'co_chu_truong');
    const duAnKyHD = dsDuAnBoLoc.filter((da) => da.giai_doan === 'ky_hop_dong');
    const duAnTTDot1 = dsDuAnBoLoc.filter((da) => da.giai_doan === 'tt_dot_1');
    const duAnTrienKhai = dsDuAnBoLoc.filter((da) => da.giai_doan === 'trien_khai');
    const duAnHoanThanh = dsDuAnBoLoc.filter((da) => da.giai_doan === 'hoan_thanh_tt_dot_2');
    const duAnDaKyHD = dsDuAnBoLoc.filter((da) => (Number(da.gia_tri_hop_dong) || 0) > 0 || da.giai_doan === 'ky_hop_dong');

    // Dự án trọng điểm quy mô lớn >= 1.5 tỷ
    const duAnTrongDiem = [...dsDuAnBoLoc]
      .filter((da) => (Number(da.gia_tri_du_kien) || 0) >= 1_500_000_000)
      .sort((a, b) => (Number(b.gia_tri_du_kien) || 0) - (Number(a.gia_tri_du_kien) || 0));

    // Thống kê theo từng địa bàn (An Giang, Vĩnh Long, Cần Thơ, Đồng Tháp, Khác)
    const cacDiaBan = ['An Giang', 'Vĩnh Long', 'Cần Thơ', 'Đồng Tháp', 'Địa bàn khác'];
    const thongKeTheoDiaBan = cacDiaBan.map((tenDb) => {
      const danhSach = dsDuAn.filter((da) => nhanDienDiaBan(da.ten_du_an, da.mo_ta) === tenDb);
      const giaTri = danhSach.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);
      const soTiemNang = danhSach.filter((da) => ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)).length;
      return {
        ten: tenDb,
        soLuong: danhSach.length,
        giaTri,
        soTiemNang,
        danhSach
      };
    });

    // Thống kê theo 3 Dòng sản phẩm cốt lõi
    const spDanhSoNha = dsDuAn.filter((da) => nhanDienNhomSanPham(da.ten_du_an, da.mo_ta).key === 'danh_so_nha');
    const spDatDai = dsDuAn.filter((da) => nhanDienNhomSanPham(da.ten_du_an, da.mo_ta).key === 'csdl_dat_dai');
    const spDiTich = dsDuAn.filter((da) => nhanDienNhomSanPham(da.ten_du_an, da.mo_ta).key === 'so_hoa_di_tich');

    // Lịch công tác thị trường
    const [y, m, d] = ngayChon.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mon = new Date(y, m - 1, d + diffToMon);
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
    const fmt = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const dauTuanISO = fmt(mon);
    const cuoiTuanISO = fmt(sun);
    const thangISO = ngayChon.slice(0, 7);

    const lichHopLe = dsLichGap.filter((l) => l.trang_thai !== 'huy' && !l.da_xoa);
    const lichHomNay = lichHopLe.filter((l) => l.ngay === ngayChon);
    const lichTuanNay = lichHopLe.filter((l) => l.ngay >= dauTuanISO && l.ngay <= cuoiTuanISO);
    const lichThangNay = lichHopLe.filter((l) => l.ngay.startsWith(thangISO));
    const lichChuaCapNhatKQ = lichHopLe.filter((l) => kiemTraLichChuaBaoCao(l));

    return {
      tongDuAn: dsDuAnBoLoc.length,
      tongPipeline,
      tongHopDongDaKy,
      tongTienThucVe,
      duAnTiemNangCao,
      duAnTiepCan,
      duAnBaoGia,
      duAnCoChuTruong,
      duAnKyHD,
      duAnTTDot1,
      duAnTrienKhai,
      duAnHoanThanh,
      duAnDaKyHD,
      duAnTrongDiem,
      thongKeTheoDiaBan,
      spDanhSoNha,
      spDatDai,
      spDiTich,
      lichHomNay,
      lichTuanNay,
      lichThangNay,
      lichChuaCapNhatKQ
    };
  }, [dsDuAnBoLoc, dsDuAn, dsLichGap, ngayChon]);

  // Map người phụ trách dự án
  const mapNhanSu = useMemo(() => {
    const map = new globalThis.Map<string, NhanSu>();
    dsNhanSu.forEach((ns) => map.set(ns.id, ns));
    return map;
  }, [dsNhanSu]);

  const handleChayAIToanBo = async () => {
    if (dangChayAITatCa) return;
    setDangChayAITatCa(true);
    try {
      const res = await kichHoatAIDanhGia({ ngay_danh_gia: ngayChon });
      if (res.thanh_cong) {
        if (res.tong_ket_dieu_hanh) setTongKetAI(res.tong_ket_dieu_hanh);
        await taiToanBoDuLieu();
      } else {
        alert(res.loi || 'Không thể quét phân tích AI');
      }
    } catch (e: any) {
      alert(e?.message || 'Lỗi khi gọi AI');
    } finally {
      setDangChayAITatCa(false);
    }
  };

  if (!duocPhepXem) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Shield className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Quyền Truy Cập Lãnh Đạo</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Trang tổng quan này được thiết kế dành riêng cho Ban Giám Đốc và Quản Lý Điều Hành.
        </p>
      </div>
    );
  }

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4 sm:space-y-5">
      {/* ========================================================================= */}
      {/* 1. THANH TIÊU ĐỀ & BỘ LỌC ĐỊA BÀN / DÒNG SẢN PHẨM                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>Điều hành Kinh doanh & Thị phần Địa bàn</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng quan đường ống dự án B2G cấp Xã/Phường, nhịp độ thị trường và các trọng điểm cần chỉ đạo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 hover:bg-slate-100 transition rounded-xl px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700">
              <Calendar className="size-3.5 mr-1.5 text-primary shrink-0" />
              <input
                type="date"
                value={ngayChon}
                onChange={(e) => setNgayChon(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleChayAIToanBo}
              disabled={dangChayAITatCa}
              className="h-8.5 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-2xs disabled:opacity-50 shrink-0"
              title="Quét lại toàn bộ số liệu và phân tích AI"
            >
              <RefreshCw className={cn('size-3.5', dangChayAITatCa && 'animate-spin')} />
              <span>{dangChayAITatCa ? 'Đang chạy...' : 'Cập nhật'}</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc Chips: Địa bàn & Dòng sản phẩm */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 flex-wrap">
          {/* Lọc Địa bàn */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="size-3 text-slate-400" />
              <span>Địa bàn:</span>
            </span>
            {[
              { key: 'tat_ca', label: 'Toàn bộ địa bàn' },
              { key: 'An Giang', label: 'An Giang' },
              { key: 'Vĩnh Long', label: 'Vĩnh Long' },
              { key: 'Cần Thơ', label: 'Cần Thơ' },
              { key: 'Đồng Tháp', label: 'Đồng Tháp' },
              { key: 'Địa bàn khác', label: 'Địa bàn khác' }
            ].map((chip) => {
              const dangChon = locDiaBan === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setLocDiaBan(chip.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer select-none',
                    dangChon
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Lọc Dòng sản phẩm */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="size-3 text-slate-400" />
              <span>Sản phẩm:</span>
            </span>
            {[
              { key: 'tat_ca', label: 'Tất cả' },
              { key: 'danh_so_nha', label: 'Đánh số nhà' },
              { key: 'csdl_dat_dai', label: 'CSDL Đất đai' },
              { key: 'so_hoa_di_tich', label: 'Số hóa Di tích & 3D' }
            ].map((chip) => {
              const dangChon = locNhomSP === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setLocNhomSP(chip.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer select-none',
                    dangChon
                      ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 THƯỚC ĐO SỨC KHỎE KINH DOANH (KPI CARDS VỚI DRILL-DOWN)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. Tổng quy mô Pipeline */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: `Toàn bộ đường ống dự án (${thongKeLanhDao.tongDuAn} DA)`,
              moTaPhu: locDiaBan !== 'tat_ca' ? `Địa bàn: ${locDiaBan}` : undefined,
              danhSachDuAn: dsDuAnBoLoc
            })
          }
          className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-xs transition cursor-pointer select-none space-y-2 group"
          title="Nhấp để xem danh sách toàn bộ dự án đang theo đuổi"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600" />
              <span>Tổng quy mô Pipeline</span>
            </span>
            <ArrowUpRight className="size-4 text-slate-300 group-hover:text-emerald-600 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {dangTai ? '...' : DINH_DANG_TIEN_NGAN_GON(thongKeLanhDao.tongPipeline)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Đang bám sát <strong className="text-slate-800">{thongKeLanhDao.tongDuAn}</strong> dự án xã/phường
          </div>
        </div>

        {/* 2. Dự án tiềm năng cao */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: `Dự án Tiềm năng cao (Hạng Rất cao / Cao)`,
              danhSachDuAn: thongKeLanhDao.duAnTiemNangCao
            })
          }
          className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-xs transition cursor-pointer select-none space-y-2 group"
          title="Nhấp để xem danh sách dự án tiềm năng cao"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Flame className="size-4 text-amber-500" />
              <span>Tiềm năng chốt cao</span>
            </span>
            <ArrowUpRight className="size-4 text-slate-300 group-hover:text-amber-600 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-700 flex items-center gap-2">
            <span>{dangTai ? '...' : thongKeLanhDao.duAnTiemNangCao.length}</span>
            <span className="text-xs font-normal text-slate-400">dự án</span>
          </div>
          <div className="text-xs text-slate-500 font-medium truncate">
            Giá trị:{' '}
            <strong className="text-slate-800">
              {DINH_DANG_TIEN_NGAN_GON(
                thongKeLanhDao.duAnTiemNangCao.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
              )}
            </strong>
          </div>
        </div>

        {/* 3. Giai đoạn 2 • Báo giá */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: `Dự án Giai đoạn 2 • Báo giá (${thongKeLanhDao.duAnBaoGia.length} DA)`,
              danhSachDuAn: thongKeLanhDao.duAnBaoGia
            })
          }
          className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-xs transition cursor-pointer select-none space-y-2 group"
          title="Nhấp để xem danh sách dự án đang gửi Báo giá"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <FileCheck className="size-4 text-amber-600" />
              <span>Giai đoạn 2 • Báo giá</span>
            </span>
            <ArrowUpRight className="size-4 text-slate-300 group-hover:text-amber-600 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-700 flex items-center gap-2">
            <span>{dangTai ? '...' : thongKeLanhDao.duAnBaoGia.length}</span>
            <span className="text-xs font-normal text-slate-400">dự án</span>
          </div>
          <div className="text-xs text-slate-500 font-medium truncate">
            Giá trị:{' '}
            <strong className="text-slate-800">
              {DINH_DANG_TIEN_NGAN_GON(
                thongKeLanhDao.duAnBaoGia.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
              )}
            </strong>
          </div>
        </div>

        {/* 4. Giai đoạn 1 • Tiếp cận */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: `Dự án Giai đoạn 1 • Tiếp cận (${thongKeLanhDao.duAnTiepCan.length} DA)`,
              danhSachDuAn: thongKeLanhDao.duAnTiepCan
            })
          }
          className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs transition cursor-pointer select-none space-y-2 group"
          title="Nhấp để xem các dự án đang ở bước Tiếp cận địa bàn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Target className="size-4 text-blue-600" />
              <span>Giai đoạn 1 • Tiếp cận</span>
            </span>
            <ArrowUpRight className="size-4 text-slate-300 group-hover:text-blue-600 transition" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-800 flex items-center gap-2">
            <span>{dangTai ? '...' : thongKeLanhDao.duAnTiepCan.length}</span>
            <span className="text-xs font-normal text-slate-400">dự án</span>
          </div>
          <div className="text-xs text-slate-500 font-medium truncate">
            Giá trị:{' '}
            <strong className="text-slate-800">
              {DINH_DANG_TIEN_NGAN_GON(
                thongKeLanhDao.duAnTiepCan.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 THANH TIẾN ĐỘ 7 BƯỚC ĐƯỜNG ỐNG DỰ ÁN (SLIDE STEPPER 7 BƯỚC CHUẨN)     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="size-4 text-primary" />
            <span>Tiến độ 7 bước đường ống dự án</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {thongKeLanhDao.tongDuAn} dự án đang theo dõi
          </span>
        </div>
        <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
          <div className="flex items-center min-w-[760px] justify-between px-1">
            {[
              { stt: 1, key: 'tiep_can', label: 'Tiếp cận', ds: thongKeLanhDao.duAnTiepCan },
              { stt: 2, key: 'bao_gia', label: 'Báo giá', ds: thongKeLanhDao.duAnBaoGia },
              { stt: 3, key: 'co_chu_truong', label: 'Có chủ trương', ds: thongKeLanhDao.duAnCoChuTruong },
              { stt: 4, key: 'ky_hop_dong', label: 'Ký HĐ', ds: thongKeLanhDao.duAnKyHD },
              { stt: 5, key: 'tt_dot_1', label: 'TT đợt 1', ds: thongKeLanhDao.duAnTTDot1 },
              { stt: 6, key: 'trien_khai', label: 'Triển khai', ds: thongKeLanhDao.duAnTrienKhai },
              { stt: 7, key: 'hoan_thanh_tt_dot_2', label: 'Hoàn thành & TT đợt 2', ds: thongKeLanhDao.duAnHoanThanh }
            ].map((step, idx) => {
              const coDuAn = step.ds.length > 0;
              const tongTien = step.ds.reduce((sum, d) => sum + (Number(d.gia_tri_du_kien) || 0), 0);
              return (
                <div
                  key={step.key}
                  className="flex-1 flex items-center min-w-0 first:flex-none"
                >
                  {idx > 0 && (
                    <div className={cn('h-0.5 flex-1 mx-1.5 transition-colors', coDuAn ? 'bg-primary' : 'bg-slate-200')} />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (coDuAn) {
                        setDuAnModal({
                          mo: true,
                          tieuDe: `Dự án bước ${step.stt} • ${step.label} (${step.ds.length} DA)`,
                          danhSachDuAn: step.ds
                        });
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 px-1.5 py-1 group shrink-0 transition select-none',
                      coDuAn ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'size-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all',
                        coDuAn
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs font-black'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      )}
                    >
                      {step.stt}
                    </div>
                    <span className={cn('text-xs font-semibold whitespace-nowrap', coDuAn ? 'text-slate-900 font-bold' : 'text-slate-400')}>
                      {step.label}
                    </span>
                    <span className={cn('text-[11px] font-mono px-1.5 py-0.2 rounded-full font-bold', coDuAn ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400')}>
                      {step.ds.length} DA {coDuAn && `• ${DINH_DANG_TIEN_NGAN_GON(tongTien)}`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BẢN ĐỒ THỊ PHẦN THEO ĐỊA BÀN & 3 DÒNG SẢN PHẨM CỐT LÕI                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Khối 1: Phủ sóng Thị phần theo Tỉnh / Địa bàn */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="size-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Phủ sóng Địa bàn (Tỉnh / Khu vực)</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Nhấp để xem dự án</span>
          </div>

          <div className="space-y-2">
            {thongKeLanhDao.thongKeTheoDiaBan.map((dbItem) => (
              <div
                key={dbItem.ten}
                onClick={() =>
                  setDuAnModal({
                    mo: true,
                    tieuDe: `Dự án tại Địa bàn: ${dbItem.ten} (${dbItem.soLuong} DA)`,
                    danhSachDuAn: dbItem.danhSach
                  })
                }
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition flex items-center justify-between gap-3 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="size-2 rounded-full bg-primary shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-primary transition truncate">
                      {dbItem.ten}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      ({dbItem.soLuong} xã/phường)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    {dbItem.soTiemNang} tiềm năng
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-900 min-w-[70px] text-right">
                    {DINH_DANG_TIEN_NGAN_GON(dbItem.giaTri)}
                  </span>
                  <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-600 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối 2: Cơ cấu 3 Dòng sản phẩm Cốt lõi */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Layers className="size-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">3 Dòng Sản phẩm & Dịch vụ Cốt lõi</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Nhấp để xem dự án</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* SP 1: Đánh số nhà */}
            <div
              onClick={() =>
                setDuAnModal({
                  mo: true,
                  tieuDe: `Dòng sản phẩm: Đánh số nhà & Bản đồ nền (${thongKeLanhDao.spDanhSoNha.length} DA)`,
                  danhSachDuAn: thongKeLanhDao.spDanhSoNha
                })
              }
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-primary/40 hover:bg-slate-50/60 transition flex items-center justify-between gap-3 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Home className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-primary transition">
                    Đánh số nhà & Bản đồ nền
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sản phẩm mũi nhọn cấp xã/phường • {thongKeLanhDao.spDanhSoNha.length} dự án
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-xs text-slate-900">
                  {DINH_DANG_TIEN_NGAN_GON(
                    thongKeLanhDao.spDanhSoNha.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
                  )}
                </div>
                <div className="text-[10.5px] text-amber-700 font-semibold">
                  {thongKeLanhDao.spDanhSoNha.filter((d) => ['cao', 'rat_cao'].includes(d.muc_do_tiem_nang)).length} tiềm năng cao
                </div>
              </div>
            </div>

            {/* SP 2: CSDL Đất đai */}
            <div
              onClick={() =>
                setDuAnModal({
                  mo: true,
                  tieuDe: `Dòng sản phẩm: CSDL Đất đai & Nhà ở (${thongKeLanhDao.spDatDai.length} DA)`,
                  danhSachDuAn: thongKeLanhDao.spDatDai
                })
              }
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-primary/40 hover:bg-slate-50/60 transition flex items-center justify-between gap-3 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapIcon className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-primary transition">
                    CSDL Đất đai & Nhà ở
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gói lớn (1.5 tỷ – 5 tỷ/xã) • {thongKeLanhDao.spDatDai.length} dự án
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-xs text-slate-900">
                  {DINH_DANG_TIEN_NGAN_GON(
                    thongKeLanhDao.spDatDai.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
                  )}
                </div>
                <div className="text-[10.5px] text-amber-700 font-semibold">
                  {thongKeLanhDao.spDatDai.filter((d) => ['cao', 'rat_cao'].includes(d.muc_do_tiem_nang)).length} tiềm năng cao
                </div>
              </div>
            </div>

            {/* SP 3: Số hóa di tích / Sa bàn 3D */}
            <div
              onClick={() =>
                setDuAnModal({
                  mo: true,
                  tieuDe: `Dòng sản phẩm: Số hóa Di tích & Sa bàn 3D (${thongKeLanhDao.spDiTich.length} DA)`,
                  danhSachDuAn: thongKeLanhDao.spDiTich
                })
              }
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-primary/40 hover:bg-slate-50/60 transition flex items-center justify-between gap-3 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Landmark className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-primary transition">
                    Số hóa Di tích & Sa bàn 3D
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tour 360, Sa bàn 3D-4D, Nghĩa trang • {thongKeLanhDao.spDiTich.length} dự án
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-xs text-slate-900">
                  {DINH_DANG_TIEN_NGAN_GON(
                    thongKeLanhDao.spDiTich.reduce((s, d) => s + (Number(d.gia_tri_du_kien) || 0), 0)
                  )}
                </div>
                <div className="text-[10.5px] text-amber-700 font-semibold">
                  {thongKeLanhDao.spDiTich.filter((d) => ['cao', 'rat_cao'].includes(d.muc_do_tiem_nang)).length} tiềm năng cao
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TOP DỰ ÁN TRỌNG ĐIỂM CẦN LÃNH ĐẠO HỖ TRỢ (DEAL WATCHLIST >= 1.5 TỶ)     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Top Dự Án Trọng Điểm Cần Lãnh Đạo Đồng Hành</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {thongKeLanhDao.duAnTrongDiem.length} gói lớn ≥ 1.5 tỷ
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Các gói thầu quy mô lớn cấp Huyện/Xã cần Ban Giám Đốc hỗ trợ ngoại giao gỡ nút thắt chủ trương & nguồn vốn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setDuAnModal({
                mo: true,
                tieuDe: `Toàn bộ Dự án Trọng điểm (≥ 1.5 Tỷ)`,
                danhSachDuAn: thongKeLanhDao.duAnTrongDiem
              })
            }
            className="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0 hidden sm:inline"
          >
            Xem tất cả
          </button>
        </div>

        {/* BẢNG PC THẲNG HÀNG, CĂN LỀ CHUẨN CHỈNH */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Dự án & Khách hàng</th>
                <th className="py-3 px-3">Địa bàn</th>
                <th className="py-3 px-3">Dòng sản phẩm</th>
                <th className="py-3 px-3">Giai đoạn</th>
                <th className="py-3 px-3">Tiềm năng</th>
                <th className="py-3 px-3">Phụ trách</th>
                <th className="py-3 px-4 text-right">Giá trị dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {thongKeLanhDao.duAnTrongDiem.slice(0, 10).map((da) => {
                const nsPhuTrach = mapNhanSu.get(da.nguoi_phu_trach_id || '');
                const diaBan = nhanDienDiaBan(da.ten_du_an, da.mo_ta);
                const nhomSP = nhanDienNhomSanPham(da.ten_du_an, da.mo_ta);
                const cfgGD = NHAN_GIAI_DOAN_CHUAN[da.giai_doan] || {
                  label: da.giai_doan || 'Mới',
                  mauBadge: 'bg-slate-50 text-slate-600 border-slate-200'
                };
                const cfgTN = NHAN_TIEM_NANG_CHUAN[da.muc_do_tiem_nang] || {
                  label: 'Trung bình',
                  mauBadge: 'bg-slate-50 text-slate-600 border-slate-200'
                };

                return (
                  <tr key={da.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[280px]">
                      <Link
                        href={`/ho-so-du-an/${da.id}`}
                        className="hover:text-primary transition line-clamp-1 group-hover:underline block"
                        title={da.ten_du_an}
                      >
                        {da.ten_du_an}
                      </Link>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{diaBan}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      {nhomSP.label}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={cn('px-2 py-0.5 rounded-md text-[10.5px] font-semibold border', cfgGD.mauBadge)}>
                        {cfgGD.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={cn('px-2 py-0.5 rounded-md text-[10.5px] font-semibold border', cfgTN.mauBadge)}>
                        {cfgTN.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {nsPhuTrach?.ho_va_ten || 'Chưa gán'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-black text-slate-900">
                      {DINH_DANG_TIEN_NGAN_GON(da.gia_tri_du_kien)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* THẺ MOBILE THU GỌN */}
        <div className="md:hidden divide-y divide-slate-100">
          {thongKeLanhDao.duAnTrongDiem.slice(0, 8).map((da) => (
            <Link
              key={da.id}
              href={`/ho-so-du-an/${da.id}`}
              className="p-3.5 block hover:bg-slate-50 transition space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 line-clamp-1">{da.ten_du_an}</span>
                <span className="font-mono font-bold text-xs text-primary shrink-0">
                  {DINH_DANG_TIEN_NGAN_GON(da.gia_tri_du_kien)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{nhanDienDiaBan(da.ten_du_an, da.mo_ta)}</span>
                <span className="font-medium text-slate-700">
                  {mapNhanSu.get(da.nguoi_phu_trach_id || '')?.ho_va_ten || 'Chưa gán'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. NHỊP ĐỘ NGOẠI NGHIỆP & BẢNG ĐỘI NGŨ KINH DOANH                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Nhịp Độ Thị Trường & Đội Ngũ Kinh Doanh
              </h2>
              <p className="text-xs text-slate-500">
                Theo dõi tiến độ tiếp xúc xã/phường thực tế của từng chuyên viên kinh doanh.
              </p>
            </div>
          </div>

          {/* Thanh nhịp độ lịch hẹn */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setLichGapModal({
                  mo: true,
                  tieuDe: 'Lịch gặp UBND Xã/Phường trong tuần',
                  danhSachLich: thongKeLanhDao.lichTuanNay
                })
              }
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition cursor-pointer"
            >
              Tuần này: <strong>{thongKeLanhDao.lichTuanNay.length} cuộc gặp</strong>
            </button>
            <button
              type="button"
              onClick={() =>
                setLichGapModal({
                  mo: true,
                  tieuDe: 'Lịch hẹn đã đến hạn nhưng CHƯA CẬP NHẬT KẾT QUẢ',
                  danhSachLich: thongKeLanhDao.lichChuaCapNhatKQ
                })
              }
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
                thongKeLanhDao.lichChuaCapNhatKQ.length > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              )}
            >
              <Clock className="size-3.5 text-amber-600" />
              <span>Chưa có KQ: <strong>{thongKeLanhDao.lichChuaCapNhatKQ.length}</strong></span>
            </button>
          </div>
        </div>

        {/* BẢNG ĐỘI NGŨ KINH DOANH */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Chuyên viên</th>
                <th className="py-3 px-3 text-center">Dự án phụ trách</th>
                <th className="py-3 px-3 text-center">Tiềm năng cao</th>
                <th className="py-3 px-3 text-center">Sắp ký HĐ</th>
                <th className="py-3 px-3 text-center">Lịch chưa KQ</th>
                <th className="py-3 px-4 text-right">Tổng giá trị Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dsNhanSuHienThi.map((ns) => {
                const duAnCuaNS = dsDuAn.filter((da) => da.nguoi_phu_trach_id === ns.id);
                const dsTiemNangCuaNS = duAnCuaNS.filter((da) => ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang));
                const dsSapKyCuaNS = duAnCuaNS.filter((da) => ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan));
                const lichChuaKQCuaNS = thongKeLanhDao.lichChuaCapNhatKQ.filter(
                  (l) => l.nguoi_phu_trach_id === ns.id || (l.nguoi_tham_gia_ids || []).includes(ns.id)
                );
                const giaTriDuAn = duAnCuaNS.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);

                return (
                  <tr key={ns.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <DaiDien
                          anh={ns.url_anh_dai_dien || ''}
                          ten={ns.ho_va_ten || 'NV'}
                          className="size-8 text-xs font-bold ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{ns.ho_va_ten}</p>
                          <p className="text-[10.5px] text-slate-400 font-mono">{ns.ma_nhan_vien || ns.id.slice(0, 5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án phụ trách • ${ns.ho_va_ten}`,
                            danhSachDuAn: duAnCuaNS
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        {duAnCuaNS.length}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án tiềm năng cao • ${ns.ho_va_ten}`,
                            danhSachDuAn: dsTiemNangCuaNS
                          })
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer',
                          dsTiemNangCuaNS.length > 0
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {dsTiemNangCuaNS.length}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án sắp ký hợp đồng • ${ns.ho_va_ten}`,
                            danhSachDuAn: dsSapKyCuaNS
                          })
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer',
                          dsSapKyCuaNS.length > 0
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {dsSapKyCuaNS.length}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setLichGapModal({
                            mo: true,
                            tieuDe: `Lịch hẹn chưa cập nhật KQ • ${ns.ho_va_ten}`,
                            danhSachLich: lichChuaKQCuaNS
                          })
                        }
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer',
                          lichChuaKQCuaNS.length > 0
                            ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                            : 'bg-slate-100 text-slate-400'
                        )}
                      >
                        {lichChuaKQCuaNS.length}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {DINH_DANG_TIEN_NGAN_GON(giaTriDuAn)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODAL DRILL-DOWN XEM CHI TIẾT DỰ ÁN & LỊCH HẸN                          */}
      {/* ========================================================================= */}
      {duAnModal?.mo && (
        <ModalDanhSachDuAn
          tieuDe={duAnModal.tieuDe}
          moTaPhu={duAnModal.moTaPhu}
          danhSachDuAn={duAnModal.danhSachDuAn}
          danhSachNhanSu={dsNhanSu}
          onDong={() => setDuAnModal(null)}
        />
      )}

      {lichGapModal?.mo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                  <span>{lichGapModal.tieuDe}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {lichGapModal.danhSachLich.length}
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLichGapModal(null)}
                className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {lichGapModal.danhSachLich.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">Không có lịch hẹn nào.</div>
              ) : (
                lichGapModal.danhSachLich.map((l) => (
                  <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{l.tieu_de || l.noi_dung || 'Lịch gặp KH'}</span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {formatNgay(l.ngay)}
                      </span>
                    </div>
                    {l.ten_khach_hang && (
                      <div className="text-xs text-slate-600 font-medium">{l.ten_khach_hang}</div>
                    )}
                    {l.ket_qua ? (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        Kết quả: {l.ket_qua}
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 italic">Chưa có ghi nhận kết quả</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Bo_Cuc_Trang>
  );
}
