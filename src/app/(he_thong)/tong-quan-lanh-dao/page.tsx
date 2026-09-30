'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Target
} from 'lucide-react';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen, layPhamViPhongBan } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import { DaiDien } from '../../../thanh_phan/ui/dai_dien';
import { Nut } from '../../../thanh_phan/ui';
import { cn } from '../../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../../thu_vien/utils/format_tien';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import type { Lead } from '../../../thu_vien/types/lead';
import type { LichGapKH } from '../../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP } from '../../../thu_vien/types/lich_gap_kh';
import type { AIDanhGiaNhanSu, MucDoDanhGiaAI } from '../../../thu_vien/types/ai_danh_gia';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachLead } from '../../../dich_vu/lead/dich_vu_lead';
import { danhSachLichGapKH } from '../../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  danhSachAIDanhGia,
  langNgheThayDoiAIDanhGia,
  kichHoatAIDanhGia
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

export default function TrangTongQuanLanhDao() {
  const { nguoiDungHienTai } = useStoreXacThuc();

  // State dữ liệu
  const [dangTai, setDangTai] = useState(true);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsLead, setDsLead] = useState<Lead[]>([]);
  const [dsLichGap, setDsLichGap] = useState<LichGapKH[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsDanhGiaAI, setDsDanhGiaAI] = useState<AIDanhGiaNhanSu[]>([]);
  const [dsKeHoachTuan, setDsKeHoachTuan] = useState<KeHoachTuan[]>([]);
  const [dsKeHoachThang, setDsKeHoachThang] = useState<KeHoachThang[]>([]);

  // State bộ lọc (mặc định theo ngày hiện tại giờ Việt Nam)
  const [ngayChon, setNgayChon] = useState<string>(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  );

  // State tương tác AI & Drawer & Modal Drill-down
  const [dangChayAITatCa, setDangChayAITatCa] = useState(false);
  const [nhanSuDangChon, setNhanSuDangChon] = useState<NhanSu | null>(null);
  const [duAnModal, setDuAnModal] = useState<{
    mo: boolean;
    tieuDe: string;
    moTaPhu?: string;
    danhSachDuAn: HoSoDuAn[];
  } | null>(null);
  const [keHoachModal, setKeHoachModal] = useState<{
    mo: boolean;
    loai: 'tuan' | 'thang';
    tieuDe: string;
    nhanVienTen: string;
    keHoachTuan?: KeHoachTuan | null;
    keHoachThang?: KeHoachThang | null;
  } | null>(null);
  const [lichGapModal, setLichGapModal] = useState<{
    mo: boolean;
    tieuDe: string;
    danhSachLich: LichGapKH[];
  } | null>(null);

  // 1. Kiểm tra phân quyền truy cập
  const duocPhepXem = useMemo(() => {
    if (!nguoiDungHienTai) return false;
    return (
      coQuyen(nguoiDungHienTai, 'lanh_dao.xem') ||
      ['giam_doc', 'truong_phong', 'quan_tri_he_thong'].includes(nguoiDungHienTai.vai_tro as string)
    );
  }, [nguoiDungHienTai]);

  // 2. Tải dữ liệu ban đầu
  useEffect(() => {
    if (!nguoiDungHienTai?.id) return;
    taiToanBoDuLieu();
  }, [nguoiDungHienTai?.id]);

  // 3. Lắng nghe realtime các đánh giá AI của ngày đang chọn
  useEffect(() => {
    if (!ngayChon) return;
    const unsubscribe = langNgheThayDoiAIDanhGia(ngayChon, (data) => {
      setDsDanhGiaAI(data);
    });
    return () => unsubscribe();
  }, [ngayChon]);

  const taiToanBoDuLieu = async () => {
    setDangTai(true);
    try {
      const tuanHienTai = layTuanFromDateISO(ngayChon);
      const thangHienTai = ngayChon.slice(0, 7);

      const [resNS, resDA, resCN, resPB, resAI, resKHTuan, resKHThang, resLead, resLichGap] = await Promise.all([
        danhSachNhanSu(),
        danhSachHoSoDuAn(),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachAIDanhGia(ngayChon),
        danhSachKeHoachTuanTheoFilter(tuanHienTai),
        danhSachKeHoachThangTheoFilter(thangHienTai),
        danhSachLead().catch(() => []),
        danhSachLichGapKH().catch(() => [])
      ]);

      const mangNS = Array.isArray(resNS) ? resNS : resNS?.mang || [];
      const mangDA = Array.isArray(resDA) ? resDA : resDA?.mang || [];
      const mangCN = Array.isArray(resCN) ? resCN : resCN?.mang || [];
      const mangPB = Array.isArray(resPB) ? resPB : resPB?.mang || [];
      const mangLead = Array.isArray(resLead) ? resLead : (resLead as any)?.mang || resLead || [];
      const mangLichGap = Array.isArray(resLichGap) ? resLichGap : [];

      setDsNhanSu(mangNS.filter((ns: NhanSu) => ns.trang_thai_du_lieu !== 'da_xoa' && ns.trang_thai === true));
      setDsDuAn(mangDA.filter((da: HoSoDuAn) => da.trang_thai !== 'da_xoa' && (da as any).trang_thai_du_lieu !== 'da_xoa'));
      setDsChiNhanh(mangCN.filter((cn: ChiNhanh) => cn.trang_thai_du_lieu !== 'da_xoa'));
      setDsPhongBan(mangPB.filter((pb: PhongBan) => pb.trang_thai_du_lieu !== 'da_xoa'));
      setDsDanhGiaAI(resAI);
      setDsKeHoachTuan(resKHTuan || []);
      setDsKeHoachThang(resKHThang || []);
      setDsLead(mangLead);
      setDsLichGap(mangLichGap);
    } catch (e) {
      console.error('Lỗi khi tải dữ liệu lãnh đạo:', e);
    } finally {
      setDangTai(false);
    }
  };

  // 4. Lọc nhân sự theo quyền hạn & bộ lọc UI
  const phamVi = useMemo(() => {
    return layPhamViPhongBan(nguoiDungHienTai);
  }, [nguoiDungHienTai]);

  const dsNhanSuHienThi = useMemo(() => {
    return dsNhanSu.filter((ns) => {
      // Chỉ theo dõi và đánh giá NHÂN VIÊN KINH DOANH
      const pb = dsPhongBan.find((p) => p.id === ns.phong_ban_id);
      const tenPb = (pb?.ten_phong_ban || '').toLowerCase();
      if (!tenPb.includes('kinh doanh')) {
        return false;
      }

      // Trưởng phòng KD là người quản lý/điều hành kế hoạch chung, không trực tiếp nhận KPI doanh số cá nhân
      if (
        ns.vai_tro === 'truong_phong' ||
        ns.vai_tro === 'giam_doc' ||
        ns.vai_tro === 'quan_tri_he_thong' ||
        (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') ||
        (ns.chuc_vu || '').toLowerCase().includes('phó phòng')
      ) {
        return false;
      }

      // Phạm vi quản lý theo tài khoản
      if (!phamVi.toanCongTy) {
        if (ns.phong_ban_id && !phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id)) {
          return false;
        }
      }

      return true;
    });
  }, [dsNhanSu, dsPhongBan, phamVi]);

  // 5. Thống kê cấp cao
  const thongKeLanhDao = useMemo(() => {
    const nhanVienIds = new Set(dsNhanSuHienThi.map((ns) => ns.id));
    const duAnPhuTrach = dsDuAn.filter(
      (da) => da.nguoi_phu_trach_id && nhanVienIds.has(da.nguoi_phu_trach_id)
    );

    const duAnTiemNangCao = duAnPhuTrach.filter((da) =>
      ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
    );

    const duAnSapKyHD = duAnPhuTrach.filter((da) =>
      ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
    );

    const tongGiaTri = duAnPhuTrach.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);

    const tongLead = dsLead.length;
    const leadMoiVaDangChamSoc = dsLead.filter((l) =>
      ['moi_tiep_can', 'da_lien_he', 'da_hen_gap'].includes(l.trang_thai)
    ).length;

    // Tính tuần (Thứ 2 -> Chủ Nhật) của ngayChon
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

    const lichHopLe = dsLichGap.filter((l) => l.trang_thai !== 'huy');
    const lichHomNay = lichHopLe.filter((l) => l.ngay === ngayChon);
    const lichTuanNay = lichHopLe.filter((l) => l.ngay >= dauTuanISO && l.ngay <= cuoiTuanISO);
    const lichThangNay = lichHopLe.filter((l) => l.ngay.startsWith(thangISO));
    const lichDaHoanThanhThang = lichThangNay.filter((l) => l.trang_thai === 'da_hoan_thanh');

    // AI health count
    let soTot = 0;
    let soCanhBao = 0;
    let soRuiRo = 0;
    dsDanhGiaAI.forEach((dg) => {
      if (nhanVienIds.has(dg.nhan_vien_id)) {
        if (dg.muc_do_tong_the === 'tot') soTot++;
        else if (dg.muc_do_tong_the === 'canh_bao') soCanhBao++;
        else if (dg.muc_do_tong_the === 'rui_ro') soRuiRo++;
      }
    });

    return {
      tongNhanSu: dsNhanSuHienThi.length,
      tongLead,
      leadMoiVaDangChamSoc,
      tongDuAnPhuTrach: duAnPhuTrach.length,
      duAnPhuTrach,
      tongTiemNangCao: duAnTiemNangCao.length,
      duAnTiemNangCao,
      tongSapKyHD: duAnSapKyHD.length,
      duAnSapKyHD,
      tongGiaTri,
      lichHomNay,
      lichTuanNay,
      lichThangNay,
      lichDaHoanThanhThang,
      soTot,
      soCanhBao,
      soRuiRo
    };
  }, [dsNhanSuHienThi, dsDuAn, dsLead, dsLichGap, ngayChon, dsDanhGiaAI]);

  // 6. Xử lý chạy AI toàn bộ nhân sự
  const handleChayAIToanBo = async () => {
    if (dangChayAITatCa) return;
    setDangChayAITatCa(true);
    try {
      const res = await kichHoatAIDanhGia({ ngay_danh_gia: ngayChon });
      if (res.thanh_cong) {
        await taiToanBoDuLieu();
      } else {
        alert(res.loi || 'Không thể quét AI toàn bộ');
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
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Quyền Truy Cập Lãnh Đạo</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Trang tổng quan này được thiết kế dành riêng cho Ban Giám Đốc và Cấp Quản Lý/Trưởng Phòng.
          Vui lòng liên hệ Quản trị viên hệ thống nếu bạn cần phân quyền.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header tinh gọn */}
      <div className="bg-[#185942] rounded-2xl p-4 sm:p-5 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Phòng Kinh Doanh
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Tổng Quan Kinh Doanh</h1>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto">
          <div className="flex items-center bg-white/10 rounded-xl px-3 py-2 border border-white/20 text-xs font-medium text-emerald-100">
            <Calendar className="w-3.5 h-3.5 mr-2 shrink-0" />
            <input
              type="date"
              value={ngayChon}
              onChange={(e) => setNgayChon(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            />
          </div>

          <Nut
            onClick={handleChayAIToanBo}
            disabled={dangChayAITatCa}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-xs py-2 px-3.5 justify-center"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", dangChayAITatCa && "animate-spin")} />
            {dangChayAITatCa ? 'Đang cập nhật...' : 'Đánh giá'}
          </Nut>
        </div>
      </div>

      {/* 2. Thẻ chỉ số tổng hợp (Thiết kế chuyên nghiệp, nhấp vào xem danh sách) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Thẻ 1: Số lượng Lead */}
        <Link
          href="/lead"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Số lượng Lead
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
            {thongKeLanhDao.tongLead}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            {thongKeLanhDao.leadMoiVaDangChamSoc} tiếp cận &amp; đang trao đổi
          </p>
        </Link>

        {/* Thẻ 2: Dự án tiềm năng cao (Clickable) */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: 'Dự án Tiềm năng cao (Toàn đội ngũ)',
              moTaPhu: 'Các dự án có tiềm năng Cao & Rất cao',
              danhSachDuAn: thongKeLanhDao.duAnTiemNangCao
            })
          }
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Tiềm năng cao
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
            {thongKeLanhDao.tongTiemNangCao}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Khả năng chốt hợp đồng cao
          </p>
        </div>

        {/* Thẻ 3: Dự án sắp ký hợp đồng (Clickable) */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: 'Dự án Sắp ký hợp đồng (Toàn đội ngũ)',
              moTaPhu: 'Giai đoạn Báo giá, Đàm phán, Ký HĐ',
              danhSachDuAn: thongKeLanhDao.duAnSapKyHD
            })
          }
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Sắp ký hợp đồng
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
            {thongKeLanhDao.tongSapKyHD}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Giai đoạn đàm phán &amp; hoàn tất
          </p>
        </div>

        {/* Thẻ 4: Tổng giá trị dự kiến (Clickable) */}
        <div
          onClick={() =>
            setDuAnModal({
              mo: true,
              tieuDe: 'Tất cả dự án đang chạy (Toàn đội ngũ)',
              danhSachDuAn: thongKeLanhDao.duAnPhuTrach
            })
          }
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng giá trị dự kiến
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#185942] group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#185942] truncate tracking-tight">
            {DINH_DANG_TIEN_NGAN_GON(thongKeLanhDao.tongGiaTri)}
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Toàn bộ dự án đang theo dõi
          </p>
        </div>
      </div>

      {/* 2.5. Thông báo Tổng kết Lịch Gặp Khách Hàng (Tuần / Tháng) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[#185942] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Tổng Kết Lịch Gặp Khách Hàng
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setLichGapModal({
                  mo: true,
                  tieuDe: `Lịch gặp khách hàng • Ngày ${formatNgay(ngayChon)}`,
                  danhSachLich: thongKeLanhDao.lichHomNay
                })
              }
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-xs font-bold text-blue-700 transition cursor-pointer"
            >
              Hôm nay: <span className="font-black">{thongKeLanhDao.lichHomNay.length}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setLichGapModal({
                  mo: true,
                  tieuDe: 'Lịch gặp khách hàng trong Tuần',
                  danhSachLich: thongKeLanhDao.lichTuanNay
                })
              }
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-xs font-bold text-purple-700 transition cursor-pointer"
            >
              Tuần này: <span className="font-black">{thongKeLanhDao.lichTuanNay.length}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setLichGapModal({
                  mo: true,
                  tieuDe: `Lịch gặp khách hàng trong Tháng ${ngayChon.slice(5, 7)}/${ngayChon.slice(0, 4)}`,
                  danhSachLich: thongKeLanhDao.lichThangNay
                })
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-xs font-bold text-emerald-700 transition cursor-pointer"
            >
              Tháng này: <span className="font-black">{thongKeLanhDao.lichThangNay.length}</span> (Đã gặp{' '}
              {thongKeLanhDao.lichDaHoanThanhThang.length})
            </button>

            <Link
              href="/lich-cong-tac"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              <span>Xem Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Danh sách rút gọn các lịch hẹn trong tuần */}
        {thongKeLanhDao.lichTuanNay.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
            {thongKeLanhDao.lichTuanNay.slice(0, 3).map((lich) => {
              const ns = dsNhanSu.find((x) => x.id === lich.nguoi_phu_trach_id);
              const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find((t) => t.key === lich.trang_thai);
              return (
                <Link
                  key={lich.id}
                  href="/lich-cong-tac"
                  className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between gap-2 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <span>{formatNgay(lich.ngay)}</span>
                      <span>•</span>
                      <span>
                        {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {lich.ten_khach_hang}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Phụ trách: {ns?.ho_va_ten || 'Chưa gán'}
                    </div>
                  </div>
                  {ttObj && (
                    <span
                      className={cn(
                        'shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        ttObj.mauBadge
                      )}
                    >
                      {ttObj.tieu_de}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Danh sách Đội Ngũ Kinh Doanh */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#185942]" />
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              Đội Ngũ Kinh Doanh ({dsNhanSuHienThi.length})
            </h3>
          </div>
        </div>

        {dangTai ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#185942]" />
            <span>Đang tải danh sách nhân viên &amp; dự án...</span>
          </div>
        ) : dsNhanSuHienThi.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Chưa có dữ liệu nhân viên kinh doanh.
          </div>
        ) : (
          <>
            {/* GIAO DIỆN BẢNG TRÊN PC (Desktop Table - Cột rõ ràng, chữ to ngay ngắn) */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200/80">
                    <th className="py-3.5 px-4 w-[200px]">Nhân viên</th>
                    <th className="py-3.5 px-2 text-center w-[65px]">Lead</th>
                    <th className="py-3.5 px-2 text-center w-[65px]">Dự án</th>
                    <th className="py-3.5 px-2 text-center w-[85px]">Tiềm năng</th>
                    <th className="py-3.5 px-2 text-center w-[85px]">Sắp ký HĐ</th>
                    <th className="py-3.5 px-3 text-right w-[125px]">Giá trị dự kiến</th>
                    <th className="py-3.5 px-3 text-center w-[120px]">Tổng hợp KH tuần</th>
                    <th className="py-3.5 px-3 text-center w-[130px]">KH tháng tổng hợp</th>
                    <th className="py-3.5 px-2 text-center w-[85px]">Điểm</th>
                    <th className="py-3.5 px-4">Hành động cần làm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dsNhanSuHienThi.map((ns) => {
                    const leadCuaNS = dsLead.filter((l) => l.nguoi_phu_trach_id === ns.id);
                    const duAnCuaNS = dsDuAn.filter((da) => da.nguoi_phu_trach_id === ns.id);
                    const dsTiemNangCuaNS = duAnCuaNS.filter((da) =>
                      ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
                    );
                    const dsSapKyCuaNS = duAnCuaNS.filter((da) =>
                      ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
                    );
                    const giaTriDuAn = duAnCuaNS.reduce(
                      (sum, da) => sum + (Number(da.gia_tri_du_kien) || 0),
                      0
                    );
                    const aiRecord = dsDanhGiaAI.find((d) => d.nhan_vien_id === ns.id);

                    // Kế hoạch tuần & tháng
                    const khTuan = dsKeHoachTuan.find((k) => k.nhan_vien_id === ns.id);
                    const dsTacChien = khTuan?.danh_sach_tac_chien || [];
                    const soTuanXong = dsTacChien.filter((x) => x.da_hoan_thanh).length;

                    const khThang = dsKeHoachThang.find((k) => k.nhan_vien_id === ns.id);
                    const dsDiaBan = khThang?.danh_sach_dia_ban || [];

                    return (
                      <tr
                        key={ns.id}
                        className="hover:bg-slate-50/90 transition-colors group"
                      >
                        {/* Cột 1: Nhân viên */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <DaiDien
                              anh={ns.url_anh_dai_dien || ''}
                              ten={ns.ho_va_ten || 'NV'}
                              className="w-9 h-9 text-xs font-bold ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#185942] transition-colors truncate">
                                {ns.ho_va_ten}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                {ns.ma_nhan_vien || ns.id.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Cột 2: Lead */}
                        <td className="py-3.5 px-2 text-center">
                          <Link
                            href="/lead"
                            className={cn(
                              'px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer text-xs inline-flex items-center gap-1',
                              leadCuaNS.length > 0
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-400'
                            )}
                            title="Xem danh sách Lead"
                          >
                            <span>{leadCuaNS.length}</span>
                          </Link>
                        </td>

                        {/* Cột 2: Dự án phụ trách */}
                        <td className="py-3.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDuAnModal({
                                mo: true,
                                tieuDe: `Dự án phụ trách • ${ns.ho_va_ten}`,
                                danhSachDuAn: duAnCuaNS
                              });
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer text-xs"
                            title="Xem danh sách dự án"
                          >
                            {duAnCuaNS.length}
                          </button>
                        </td>

                        {/* Cột 3: Tiềm năng cao */}
                        <td className="py-3.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDuAnModal({
                                mo: true,
                                tieuDe: `Dự án tiềm năng cao • ${ns.ho_va_ten}`,
                                danhSachDuAn: dsTiemNangCuaNS
                              });
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer text-xs inline-flex items-center gap-1',
                              dsTiemNangCuaNS.length > 0
                                ? 'bg-amber-100/90 hover:bg-amber-200 text-amber-800'
                                : 'bg-slate-100 text-slate-400'
                            )}
                            title="Xem danh sách dự án tiềm năng"
                          >
                            {dsTiemNangCuaNS.length > 0 && <Flame className="w-3 h-3 text-amber-600" />}
                            <span>{dsTiemNangCuaNS.length}</span>
                          </button>
                        </td>

                        {/* Cột 4: Sắp ký HĐ */}
                        <td className="py-3.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setDuAnModal({
                                mo: true,
                                tieuDe: `Dự án sắp ký hợp đồng • ${ns.ho_va_ten}`,
                                danhSachDuAn: dsSapKyCuaNS
                              });
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-xl font-bold transition-colors cursor-pointer text-xs inline-flex items-center gap-1',
                              dsSapKyCuaNS.length > 0
                                ? 'bg-purple-100/90 hover:bg-purple-200 text-purple-800'
                                : 'bg-slate-100 text-slate-400'
                            )}
                            title="Xem danh sách dự án sắp ký"
                          >
                            {dsSapKyCuaNS.length > 0 && <Award className="w-3 h-3 text-purple-600" />}
                            <span>{dsSapKyCuaNS.length}</span>
                          </button>
                        </td>

                        {/* Cột 5: Giá trị dự kiến */}
                        <td className="py-3.5 px-3 text-right font-bold text-xs sm:text-sm text-emerald-700">
                          {DINH_DANG_TIEN_NGAN_GON(giaTriDuAn)}
                        </td>

                        {/* Cột 6: Tổng hợp KH tuần */}
                        <td className="py-3.5 px-3 text-center">
                          {dsTacChien.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setKeHoachModal({
                                  mo: true,
                                  loai: 'tuan',
                                  tieuDe: `Kế hoạch tuần ${layTuanFromDateISO(ngayChon)}`,
                                  nhanVienTen: ns.ho_va_ten,
                                  keHoachTuan: khTuan
                                });
                              }}
                              className={cn(
                                'px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1',
                                soTuanXong === dsTacChien.length
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                              )}
                              title="Bấm để xem chi tiết kế hoạch tuần"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{soTuanXong}/{dsTacChien.length} việc</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa lập</span>
                          )}
                        </td>

                        {/* Cột 7: KH tháng tổng hợp */}
                        <td className="py-3.5 px-3 text-center">
                          {dsDiaBan.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setKeHoachModal({
                                  mo: true,
                                  loai: 'thang',
                                  tieuDe: `Kế hoạch tháng ${ngayChon.slice(0, 7)}`,
                                  nhanVienTen: ns.ho_va_ten,
                                  keHoachThang: khThang
                                });
                              }}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Bấm để xem chi tiết kế hoạch tháng"
                            >
                              <Target className="w-3 h-3" />
                              <span>{dsDiaBan.length} mục tiêu</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa lập</span>
                          )}
                        </td>

                        {/* Cột 8: Điểm (Dạng 50/100, bấm vào ra thông tin đánh giá) */}
                        <td className="py-3.5 px-2 text-center">
                          {aiRecord ? (
                            <button
                              type="button"
                              onClick={() => setNhanSuDangChon(ns)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer border hover:scale-105',
                                aiRecord.muc_do_tong_the === 'tot' &&
                                  'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
                                aiRecord.muc_do_tong_the === 'canh_bao' &&
                                  'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
                                aiRecord.muc_do_tong_the === 'rui_ro' &&
                                  'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                              )}
                              title="Bấm để xem thông tin đánh giá"
                            >
                              {aiRecord.diem_hieu_suat}/100
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs italic">—</span>
                          )}
                        </td>

                        {/* Cột 9: 1 câu tóm ngắn gọn hành động cần làm */}
                        <td className="py-3.5 px-4">
                          {aiRecord ? (
                            <p className="text-slate-700 text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed">
                              {aiRecord.de_xuat_cho_quan_ly || aiRecord.nhan_dinh_chung}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Chưa có hành động đề xuất</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* GIAO DIỆN THẺ TRÊN TABLET & MOBILE (Responsive Cards) */}
            <div className="xl:hidden divide-y divide-slate-100">
              {dsNhanSuHienThi.map((ns) => {
                const leadCuaNS = dsLead.filter((l) => l.nguoi_phu_trach_id === ns.id);
                const duAnCuaNS = dsDuAn.filter((da) => da.nguoi_phu_trach_id === ns.id);
                const dsTiemNangCuaNS = duAnCuaNS.filter((da) =>
                  ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
                );
                const dsSapKyCuaNS = duAnCuaNS.filter((da) =>
                  ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
                );
                const giaTriDuAn = duAnCuaNS.reduce(
                  (sum, da) => sum + (Number(da.gia_tri_du_kien) || 0),
                  0
                );
                const aiRecord = dsDanhGiaAI.find((d) => d.nhan_vien_id === ns.id);

                const khTuan = dsKeHoachTuan.find((k) => k.nhan_vien_id === ns.id);
                const dsTacChien = khTuan?.danh_sach_tac_chien || [];
                const soTuanXong = dsTacChien.filter((x) => x.da_hoan_thanh).length;

                const khThang = dsKeHoachThang.find((k) => k.nhan_vien_id === ns.id);
                const dsDiaBan = khThang?.danh_sach_dia_ban || [];

                return (
                  <div
                    key={ns.id}
                    className="p-4 hover:bg-slate-50/90 transition-all space-y-3"
                  >
                    {/* Hàng 1: Avatar, Tên & Điểm đánh giá (bấm ô điểm ra thông tin đánh giá) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <DaiDien
                          anh={ns.url_anh_dai_dien || ''}
                          ten={ns.ho_va_ten || 'NV'}
                          className="w-11 h-11 text-sm font-semibold ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-base text-slate-900 truncate">
                              {ns.ho_va_ten}
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                              {ns.ma_nhan_vien || ns.id.slice(0, 5)}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-emerald-700 mt-0.5">
                            {DINH_DANG_TIEN_NGAN_GON(giaTriDuAn)}
                          </p>
                        </div>
                      </div>

                      {/* Điểm dạng 50/100 */}
                      {aiRecord ? (
                        <button
                          type="button"
                          onClick={() => setNhanSuDangChon(ns)}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-black border transition-transform active:scale-95 shrink-0',
                            aiRecord.muc_do_tong_the === 'tot' &&
                              'bg-emerald-50 text-emerald-800 border-emerald-200',
                            aiRecord.muc_do_tong_the === 'canh_bao' &&
                              'bg-amber-50 text-amber-800 border-amber-200',
                            aiRecord.muc_do_tong_the === 'rui_ro' &&
                              'bg-rose-50 text-rose-800 border-rose-200'
                          )}
                          title="Bấm để xem thông tin đánh giá"
                        >
                          {aiRecord.diem_hieu_suat}/100
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg font-medium shrink-0">
                          Chưa có nhận định
                        </span>
                      )}
                    </div>

                    {/* Hàng 2: Các nút chỉ số nhấp được (Lead, Dự án, Tiềm năng, Sắp ký, KH tuần, KH tháng) */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <Link
                        href="/lead"
                        className="bg-blue-50/70 border border-blue-200/60 px-2 py-1.5 rounded-xl text-center hover:bg-blue-100 transition-colors block"
                      >
                        <p className="text-[10px] uppercase font-bold text-blue-600">Lead</p>
                        <p className="text-sm font-black text-blue-800">{leadCuaNS.length}</p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án phụ trách • ${ns.ho_va_ten}`,
                            danhSachDuAn: duAnCuaNS
                          });
                        }}
                        className="bg-slate-50 border border-slate-200/80 px-2 py-1.5 rounded-xl text-center hover:bg-slate-100 transition-colors"
                      >
                        <p className="text-[10px] uppercase font-bold text-slate-400">Dự án</p>
                        <p className="text-sm font-black text-slate-800">{duAnCuaNS.length}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án tiềm năng cao • ${ns.ho_va_ten}`,
                            danhSachDuAn: dsTiemNangCuaNS
                          });
                        }}
                        className={cn(
                          'border px-2 py-1.5 rounded-xl text-center transition-colors',
                          dsTiemNangCuaNS.length > 0
                            ? 'bg-amber-50/70 border-amber-200/80 text-amber-800 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400'
                        )}
                      >
                        <p className="text-[10px] uppercase font-bold text-amber-600">Tiềm năng</p>
                        <p className="text-sm font-black text-amber-700">{dsTiemNangCuaNS.length}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDuAnModal({
                            mo: true,
                            tieuDe: `Dự án sắp ký hợp đồng • ${ns.ho_va_ten}`,
                            danhSachDuAn: dsSapKyCuaNS
                          });
                        }}
                        className={cn(
                          'border px-2 py-1.5 rounded-xl text-center transition-colors',
                          dsSapKyCuaNS.length > 0
                            ? 'bg-purple-50/70 border-purple-200/80 text-purple-800 hover:bg-purple-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400'
                        )}
                      >
                        <p className="text-[10px] uppercase font-bold text-purple-600">Sắp ký HĐ</p>
                        <p className="text-sm font-black text-purple-700">{dsSapKyCuaNS.length}</p>
                      </button>

                      {/* KH tuần mobile */}
                      <button
                        type="button"
                        onClick={() => {
                          if (dsTacChien.length === 0) return;
                          setKeHoachModal({
                            mo: true,
                            loai: 'tuan',
                            tieuDe: `Kế hoạch tuần ${layTuanFromDateISO(ngayChon)}`,
                            nhanVienTen: ns.ho_va_ten,
                            keHoachTuan: khTuan
                          });
                        }}
                        className={cn(
                          'border px-2 py-1.5 rounded-xl text-center transition-colors',
                          dsTacChien.length > 0
                            ? 'bg-blue-50/70 border-blue-200/80 text-blue-800 hover:bg-blue-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400'
                        )}
                      >
                        <p className="text-[10px] uppercase font-bold text-blue-600">KH tuần</p>
                        <p className="text-sm font-black text-blue-800">
                          {dsTacChien.length > 0 ? `${soTuanXong}/${dsTacChien.length}` : '—'}
                        </p>
                      </button>

                      {/* KH tháng mobile */}
                      <button
                        type="button"
                        onClick={() => {
                          if (dsDiaBan.length === 0) return;
                          setKeHoachModal({
                            mo: true,
                            loai: 'thang',
                            tieuDe: `Kế hoạch tháng ${ngayChon.slice(0, 7)}`,
                            nhanVienTen: ns.ho_va_ten,
                            keHoachThang: khThang
                          });
                        }}
                        className={cn(
                          'border px-2 py-1.5 rounded-xl text-center transition-colors',
                          dsDiaBan.length > 0
                            ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-800 hover:bg-indigo-100'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400'
                        )}
                      >
                        <p className="text-[10px] uppercase font-bold text-indigo-600 flex items-center justify-center gap-0.5">
                          <Target className="w-2.5 h-2.5" />
                          <span>KH tháng</span>
                        </p>
                        <p className="text-sm font-black text-indigo-800">
                          {dsDiaBan.length}
                        </p>
                      </button>
                    </div>

                    {/* Hàng 3: 1 câu tóm ngắn gọn hành động cần làm */}
                    {aiRecord && (
                      <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Hành động cần làm:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {aiRecord.de_xuat_cho_quan_ly || aiRecord.nhan_dinh_chung}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Drawer Xem chi tiết Đánh giá */}
      <DrawerChiTietDanhGia
        nhanSu={nhanSuDangChon}
        danhGiaHienTai={
          nhanSuDangChon
            ? dsDanhGiaAI.find((d) => d.nhan_vien_id === nhanSuDangChon.id) || null
            : null
        }
        danhSachDuAn={dsDuAn}
        onDong={() => setNhanSuDangChon(null)}
        onCapNhatDanhGia={(danhGiaMoi) => {
          setDsDanhGiaAI((prev) => {
            const index = prev.findIndex((d) => d.id === danhGiaMoi.id);
            if (index >= 0) {
              const capNhat = [...prev];
              capNhat[index] = danhGiaMoi;
              return capNhat;
            }
            return [danhGiaMoi, ...prev];
          });
        }}
      />

      {/* 5. Modal Drill-down hiển thị danh sách dự án khi nhấp vào chỉ số tổng hợp */}
      {duAnModal?.mo && (
        <ModalDanhSachDuAn
          tieuDe={duAnModal.tieuDe}
          moTaPhu={duAnModal.moTaPhu}
          danhSachDuAn={duAnModal.danhSachDuAn}
          danhSachNhanSu={dsNhanSu}
          onDong={() => setDuAnModal(null)}
        />
      )}

      {/* 6. Modal Drill-down hiển thị kế hoạch tuần và tháng */}
      {keHoachModal?.mo && (
        <ModalChiTietKeHoach
          loai={keHoachModal.loai}
          tieuDe={keHoachModal.tieuDe}
          nhanVienTen={keHoachModal.nhanVienTen}
          keHoachTuan={keHoachModal.keHoachTuan}
          keHoachThang={keHoachModal.keHoachThang}
          onDong={() => setKeHoachModal(null)}
        />
      )}

      {/* 7. Modal Drill-down hiển thị chi tiết Lịch gặp khách hàng */}
      {lichGapModal?.mo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {lichGapModal.tieuDe} ({lichGapModal.danhSachLich.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLichGapModal(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-200/70 hover:bg-slate-200 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {lichGapModal.danhSachLich.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Chưa có lịch gặp khách hàng trong kỳ này.
                </div>
              ) : (
                lichGapModal.danhSachLich.map((lich) => {
                  const ns = dsNhanSu.find((x) => x.id === lich.nguoi_phu_trach_id);
                  const ttObj = DANH_SACH_TRANG_THAI_LICH_GAP.find((t) => t.key === lich.trang_thai);
                  return (
                    <div
                      key={lich.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-extrabold tabular-nums">
                            {formatNgay(lich.ngay)} • {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {lich.ten_khach_hang}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                          <span>
                            Phụ trách: <strong className="text-slate-800">{ns?.ho_va_ten || 'Chưa gán'}</strong>
                          </span>
                          {lich.dia_diem && <span>• Địa điểm: {lich.dia_diem}</span>}
                        </div>
                        {lich.noi_dung && (
                          <p className="text-xs text-slate-500 line-clamp-2">{lich.noi_dung}</p>
                        )}
                      </div>

                      {ttObj && (
                        <span
                          className={cn(
                            'shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full border',
                            ttObj.mauBadge
                          )}
                        >
                          {ttObj.tieu_de}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
              <Link
                href="/lich-cong-tac"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#185942] hover:bg-emerald-900 text-white text-xs font-bold transition"
              >
                <span>Mở Lịch Công Tác (Google Calendar)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
