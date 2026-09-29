'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  FileCheck
} from 'lucide-react';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen, layPhamViPhongBan } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import { DaiDien } from '../../../thanh_phan/ui/dai_dien';
import { Nut } from '../../../thanh_phan/ui';
import { cn } from '../../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../../thu_vien/utils/format_tien';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import type { AIDanhGiaNhanSu, MucDoDanhGiaAI } from '../../../thu_vien/types/ai_danh_gia';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import {
  danhSachAIDanhGia,
  langNgheThayDoiAIDanhGia,
  kichHoatAIDanhGia
} from '../../../dich_vu/ai_danh_gia/dich_vu_ai_danh_gia';
import DrawerChiTietDanhGia from '../../../thanh_phan/tong_quan_lanh_dao/drawer_chi_tiet_danh_gia';

export default function TrangTongQuanLanhDao() {
  const { nguoiDungHienTai } = useStoreXacThuc();

  // State dữ liệu
  const [dangTai, setDangTai] = useState(true);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsDanhGiaAI, setDsDanhGiaAI] = useState<AIDanhGiaNhanSu[]>([]);

  // State bộ lọc (mặc định theo ngày hiện tại giờ Việt Nam)
  const [ngayChon, setNgayChon] = useState<string>(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
  );
  const [tuKhoa, setTuKhoa] = useState('');
  const [chiNhanhId, setChiNhanhId] = useState<string>('tat_ca');
  const [phongBanId, setPhongBanId] = useState<string>('tat_ca');
  const [boLocMucDoAI, setBoLocMucDoAI] = useState<'tat_ca' | 'tot' | 'canh_bao' | 'rui_ro'>('tat_ca');

  // State tương tác AI & Drawer
  const [dangChayAITatCa, setDangChayAITatCa] = useState(false);
  const [nhanSuDangChon, setNhanSuDangChon] = useState<NhanSu | null>(null);

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
      const [resNS, resDA, resCN, resPB, resAI] = await Promise.all([
        danhSachNhanSu(),
        danhSachHoSoDuAn(),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachAIDanhGia(ngayChon)
      ]);

      const mangNS = Array.isArray(resNS) ? resNS : resNS?.mang || [];
      const mangDA = Array.isArray(resDA) ? resDA : resDA?.mang || [];
      const mangCN = Array.isArray(resCN) ? resCN : resCN?.mang || [];
      const mangPB = Array.isArray(resPB) ? resPB : resPB?.mang || [];

      setDsNhanSu(mangNS.filter((ns: NhanSu) => ns.trang_thai_du_lieu !== 'da_xoa' && ns.trang_thai === true));
      setDsDuAn(mangDA.filter((da: HoSoDuAn) => da.trang_thai !== 'da_xoa' && (da as any).trang_thai_du_lieu !== 'da_xoa'));
      setDsChiNhanh(mangCN.filter((cn: ChiNhanh) => cn.trang_thai_du_lieu !== 'da_xoa'));
      setDsPhongBan(mangPB.filter((pb: PhongBan) => pb.trang_thai_du_lieu !== 'da_xoa'));
      setDsDanhGiaAI(resAI);
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

      // Bộ lọc chi nhánh
      if (chiNhanhId !== 'tat_ca' && ns.chi_nhanh_id !== chiNhanhId) {
        return false;
      }

      // Bộ lọc phòng ban
      if (phongBanId !== 'tat_ca' && ns.phong_ban_id !== phongBanId) {
        return false;
      }

      // Tìm kiếm từ khóa
      if (tuKhoa.trim()) {
        const kw = tuKhoa.toLowerCase();
        const ten = (ns.ho_va_ten || '').toLowerCase();
        const email = (ns.email || '').toLowerCase();
        const sdt = (ns.so_dien_thoai || '').toLowerCase();
        if (!ten.includes(kw) && !email.includes(kw) && !sdt.includes(kw)) {
          return false;
        }
      }

      // Bộ lọc mức độ AI
      if (boLocMucDoAI !== 'tat_ca') {
        const dg = dsDanhGiaAI.find((d) => d.nhan_vien_id === ns.id);
        if (!dg || dg.muc_do_tong_the !== boLocMucDoAI) {
          return false;
        }
      }

      return true;
    });
  }, [dsNhanSu, phamVi, chiNhanhId, phongBanId, tuKhoa, boLocMucDoAI, dsDanhGiaAI]);

  // 5. Thống kê KPI cấp cao
  const thongKeLanhDao = useMemo(() => {
    const nhanVienIds = new Set(dsNhanSuHienThi.map((ns) => ns.id));
    const duAnPhuTrach = dsDuAn.filter(
      (da) => da.nguoi_phu_trach_id && nhanVienIds.has(da.nguoi_phu_trach_id)
    );

    const tongTiemNangCao = duAnPhuTrach.filter((da) =>
      ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
    ).length;

    const tongSapKyHD = duAnPhuTrach.filter((da) =>
      ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
    ).length;

    const tongGiaTri = duAnPhuTrach.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);

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
      tongDuAnPhuTrach: duAnPhuTrach.length,
      tongTiemNangCao,
      tongSapKyHD,
      tongGiaTri,
      soTot,
      soCanhBao,
      soRuiRo
    };
  }, [dsNhanSuHienThi, dsDuAn, dsDanhGiaAI]);

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
      {/* 1. Header Banner dành cho Lãnh đạo */}
      <div className="bg-gradient-to-r from-[#185942] via-[#144b37] to-[#0f3a2b] rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Kinh Doanh • Giám Sát &amp; Điều Hành
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Trung Tâm Giám Sát Đội Ngũ Kinh Doanh</h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Theo dõi khối lượng dự án đội ngũ chuyên viên kinh doanh phụ trách chính, lọc dự án tiềm năng &amp; sắp ký hợp đồng, đối chiếu kết quả thực tế qua Google AI.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch md:self-center">
          <div className="flex items-center bg-white/10 backdrop-blur-xs rounded-xl px-3 py-2 border border-white/20 text-xs font-medium text-emerald-100">
            <Calendar className="w-3.5 h-3.5 mr-2 shrink-0" />
            <input
              type="date"
              value={ngayChon}
              onChange={(e) => setNgayChon(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer w-full text-xs"
            />
          </div>

          <Nut
            onClick={handleChayAIToanBo}
            disabled={dangChayAITatCa}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs shadow-sm py-2 px-3.5 justify-center"
          >
            {dangChayAITatCa ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5" />
            )}
            {dangChayAITatCa ? 'AI đang phân tích...' : 'Quét AI toàn bộ'}
          </Nut>
        </div>
      </div>

      {/* 2. Các thẻ KPI Lãnh đạo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Thẻ 1: Tổng nhân sự */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Nhân viên KD
            </span>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{thongKeLanhDao.tongNhanSu}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">
            {thongKeLanhDao.tongDuAnPhuTrach} dự án phụ trách
          </p>
        </div>

        {/* Thẻ 2: Dự án tiềm năng cao */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-700">
              Tiềm năng cao
            </span>
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700">{thongKeLanhDao.tongTiemNangCao}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">Tiềm năng &quot;Cao&quot; &amp; &quot;Rất cao&quot;</p>
        </div>

        {/* Thẻ 3: Dự án sắp ký hợp đồng */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-purple-700">
              Sắp ký hợp đồng
            </span>
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-700">{thongKeLanhDao.tongSapKyHD}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">Báo giá / Đàm phán / Ký HĐ</p>
        </div>

        {/* Thẻ 4: Tổng giá trị & Sức khỏe AI */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between text-[#185942]">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Giá trị dự kiến
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#185942]" />
          </div>
          <p className="text-lg sm:text-xl font-black text-[#185942] truncate">
            {DINH_DANG_TIEN_NGAN_GON(thongKeLanhDao.tongGiaTri)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <span className="text-emerald-700 font-bold">{thongKeLanhDao.soTot} Tốt</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{thongKeLanhDao.soCanhBao} Cảnh báo</span>
            <span>•</span>
            <span className="text-rose-600 font-bold">{thongKeLanhDao.soRuiRo} Rủi ro</span>
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm & Bộ lọc */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên nhân viên, email, số điện thoại..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#185942]/20 focus:border-[#185942]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Lọc Chi nhánh */}
            {phamVi.toanCongTy && (
              <select
                value={chiNhanhId}
                onChange={(e) => setChiNhanhId(e.target.value)}
                className="flex-1 sm:flex-none px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option value="tat_ca">Tất cả chi nhánh</option>
                {dsChiNhanh.map((cn) => (
                  <option key={cn.id} value={cn.id}>
                    {cn.ten_chi_nhanh}
                  </option>
                ))}
              </select>
            )}

            {/* Lọc Phòng ban */}
            <select
              value={phongBanId}
              onChange={(e) => setPhongBanId(e.target.value)}
              className="flex-1 sm:flex-none px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="tat_ca">Tất cả phòng ban</option>
              {dsPhongBan.map((pb) => (
                <option key={pb.id} value={pb.id}>
                  {pb.ten_phong_ban}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lọc Sức khỏe AI: cuộn ngang mượt mà trên mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0 mr-1">Lọc AI:</span>
          {[
            { key: 'tat_ca', label: 'Tất cả AI' },
            { key: 'tot', label: 'Tốt / Đạt' },
            { key: 'canh_bao', label: 'Cần lưu ý' },
            { key: 'rui_ro', label: 'Rủi ro cao' }
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setBoLocMucDoAI(m.key as any)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0',
                boLocMucDoAI === m.key
                  ? 'bg-[#185942] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Danh sách Nhân sự & Bảng Chỉ số Dự án + Nhận định AI */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#185942]" />
            <h3 className="font-bold text-slate-800 text-sm">
              Danh Sách Nhân Sự &amp; Chỉ Số Phụ Trách ({dsNhanSuHienThi.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Chỉ tính các dự án nhân viên là người phụ trách chính
          </span>
        </div>

        {dangTai ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#185942]" />
            <span>Đang tổng hợp dữ liệu nhân sự &amp; dự án...</span>
          </div>
        ) : dsNhanSuHienThi.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Không tìm thấy nhân sự phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dsNhanSuHienThi.map((ns) => {
              // Dự án nhân viên phụ trách chính
              const duAnCuaNS = dsDuAn.filter((da) => da.nguoi_phu_trach_id === ns.id);
              const soTiemNang = duAnCuaNS.filter((da) =>
                ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
              ).length;
              const soSapKy = duAnCuaNS.filter((da) =>
                ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
              ).length;
              const giaTriDuAn = duAnCuaNS.reduce(
                (sum, da) => sum + (Number(da.gia_tri_du_kien) || 0),
                0
              );

              // Đánh giá AI hôm nay
              const aiRecord = dsDanhGiaAI.find((d) => d.nhan_vien_id === ns.id);

              return (
                <div
                  key={ns.id}
                  onClick={() => setNhanSuDangChon(ns)}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/90 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4"
                >
                  {/* Top mobile / Cột 1 desktop: Thông tin nhân sự & Badge điểm AI */}
                  <div className="flex items-center justify-between gap-3 min-w-[220px]">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <DaiDien
                        anh={ns.url_anh_dai_dien || ''}
                        ten={ns.ho_va_ten || 'NV'}
                        className="w-10 h-10 sm:w-11 sm:h-11 text-xs sm:text-sm font-semibold ring-2 ring-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-800 hover:text-[#185942] transition-colors truncate">
                            {ns.ho_va_ten}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                            {ns.ma_nhan_vien || ns.id.slice(0, 5)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {ns.chuc_vu || 'Nhân viên kinh doanh'}
                        </p>
                      </div>
                    </div>

                    {/* Badge điểm AI hiển thị nổi bật trên mobile góc phải */}
                    <div className="lg:hidden shrink-0">
                      {aiRecord ? (
                        <span
                          className={cn(
                            'text-[11px] font-black px-2 py-0.5 rounded-lg inline-flex items-center gap-1',
                            aiRecord.muc_do_tong_the === 'tot' && 'bg-emerald-100 text-emerald-800',
                            aiRecord.muc_do_tong_the === 'canh_bao' && 'bg-amber-100 text-amber-800',
                            aiRecord.muc_do_tong_the === 'rui_ro' && 'bg-rose-100 text-rose-800'
                          )}
                        >
                          <Sparkles className="w-3 h-3" />
                          {aiRecord.diem_hieu_suat}/100
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                          Chưa phân tích
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle mobile / Cột 2 desktop: Chỉ số Dự án phụ trách chính */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3">
                    {/* Tổng dự án */}
                    <div className="bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-center min-w-[70px]">
                      <p className="text-[9.5px] uppercase font-bold text-slate-400">Dự án chính</p>
                      <p className="text-sm sm:text-base font-black text-slate-800">{duAnCuaNS.length}</p>
                    </div>

                    {/* Tiềm năng cao */}
                    <div className="bg-amber-50/70 border border-amber-200/80 px-2.5 py-1.5 rounded-xl text-center min-w-[70px]">
                      <p className="text-[9.5px] uppercase font-bold text-amber-600">Tiềm năng</p>
                      <p className="text-sm sm:text-base font-black text-amber-700">{soTiemNang}</p>
                    </div>

                    {/* Sắp ký HĐ */}
                    <div className="bg-purple-50/70 border border-purple-200/80 px-2.5 py-1.5 rounded-xl text-center min-w-[70px]">
                      <p className="text-[9.5px] uppercase font-bold text-purple-600">Sắp ký HĐ</p>
                      <p className="text-sm sm:text-base font-black text-purple-700">{soSapKy}</p>
                    </div>

                    {/* Giá trị trên desktop & tablet */}
                    <div className="hidden sm:block text-right min-w-[95px]">
                      <p className="text-[9.5px] uppercase font-bold text-slate-400">Giá trị dự kiến</p>
                      <p className="text-xs font-black text-emerald-700 mt-0.5 truncate">
                        {DINH_DANG_TIEN_NGAN_GON(giaTriDuAn)}
                      </p>
                    </div>
                  </div>

                  {/* Giá trị hiển thị phụ trên mobile */}
                  <div className="sm:hidden flex items-center justify-between text-[11px] px-1 text-slate-500">
                    <span>Tổng giá trị dự kiến:</span>
                    <span className="font-bold text-emerald-700">{DINH_DANG_TIEN_NGAN_GON(giaTriDuAn)}</span>
                  </div>

                  {/* Bottom mobile / Cột 3 desktop: Tóm tắt Đánh giá AI */}
                  <div className="flex-1 lg:max-w-md bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 flex items-start gap-2">
                    {aiRecord ? (
                      <>
                        <div className="hidden lg:block shrink-0 text-center">
                          <span
                            className={cn(
                              'text-[10px] font-black px-2 py-0.5 rounded-md inline-block',
                              aiRecord.muc_do_tong_the === 'tot' && 'bg-emerald-100 text-emerald-800',
                              aiRecord.muc_do_tong_the === 'canh_bao' && 'bg-amber-100 text-amber-800',
                              aiRecord.muc_do_tong_the === 'rui_ro' && 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {aiRecord.diem_hieu_suat}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
                          {aiRecord.nhan_dinh_chung}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 py-0.5 flex-1">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Chưa có đánh giá hôm nay • Chạm để phân tích</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center lg:hidden" />
                  </div>

                  {/* Cột 4: Nút mũi tên desktop */}
                  <div className="hidden lg:flex items-center justify-end text-slate-400 hover:text-slate-700">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Drawer Xem chi tiết Đánh giá AI */}
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
    </div>
  );
}
