'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Phone,
  Mail,
  FolderKanban,
  Edit3,
  Trash2,
  Clock,
  ArrowRight,
  Search,
  RotateCcw,
  Loader2,
  UserRound,
  ExternalLink,
  Target,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Building2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';
import type { Lead, TrangThaiLead } from '../../../thu_vien/types/lead';
import type { KhachHang, NguoiLienHe } from '../../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh } from '../../../thu_vien/types/nhan_su';
import {
  danhSachLead,
  taoLeadMoi,
  capNhatLead,
  doiTrangThaiLead,
  xoaLead,
  type TaoMoiLeadDTO,
  type CapNhatLeadDTO
} from '../../../dich_vu/lead/dich_vu_lead';
import {
  danhSachKhachHang,
  taoKhachHangMoi,
  type TaoMoiKhachHangDTO
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { taoHoSoDuAnMoi } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import FormLeadModal from '../../../thanh_phan/lead/form_lead_modal';
import FormKhachHangDrawer from '../../../thanh_phan/khach_hang/form_khach_hang_drawer';
import FormHoSoDuAnDrawer from '../../../thanh_phan/ho_so_du_an/form_ho_so_du_an_drawer';
import { Bo_Cuc_Trang, Nut, DaiDien } from '../../../thanh_phan/ui';

const COT_KANBAN: { key: TrangThaiLead; tieu_de: string; mauBadge: string; mauDot: string }[] = [
  {
    key: 'moi_tiep_can',
    tieu_de: 'Mới tiếp cận',
    mauBadge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    mauDot: 'bg-blue-500'
  },
  {
    key: 'da_lien_he',
    tieu_de: 'Đang trao đổi',
    mauBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    mauDot: 'bg-amber-500'
  },
  {
    key: 'da_hen_gap',
    tieu_de: 'Đã hẹn gặp',
    mauBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    mauDot: 'bg-purple-500'
  },
  {
    key: 'da_chuyen_doi',
    tieu_de: 'Đã lên Dự án',
    mauBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    mauDot: 'bg-emerald-500'
  },
  {
    key: 'that_bai',
    tieu_de: 'Không khả thi',
    mauBadge: 'bg-slate-100 text-slate-600 border-slate-200/80',
    mauDot: 'bg-slate-400'
  }
];

export default function TrangLead() {
  const router = useRouter();
  const { nguoiDungHienTai } = useStoreXacThuc();

  // State danh sách
  const [dsLead, setDsLead] = useState<Lead[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);

  const [dangTai, setDangTai] = useState(true);
  const [dangXuLyLuu, setDangXuLyLuu] = useState(false);

  // Bộ lọc
  const [tuKhoa, setTuKhoa] = useState('');
  const [nguoiPhuTrachId, setNguoiPhuTrachId] = useState<string>('tat_ca');
  const [tabHienTai, setTabHienTai] = useState<TrangThaiLead | 'tat_ca'>('tat_ca');

  // Modal / Drawer state
  const [moModalLead, setMoModalLead] = useState(false);
  const [leadDangSua, setLeadDangSua] = useState<Lead | null>(null);

  const [moDrawerKhachHang, setMoDrawerKhachHang] = useState(false);
  const [moDrawerDuAn, setMoDrawerDuAn] = useState(false);
  const [leadChuyenDoi, setLeadChuyenDoi] = useState<Lead | null>(null);

  // Fetch initial data
  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const [leads, khs, nlhs, nss, cns] = await Promise.all([
        danhSachLead(),
        danhSachKhachHang(),
        danhSachNguoiLienHe(),
        danhSachNhanSu(),
        danhSachChiNhanh()
      ]);
      setDsLead(leads);
      setDsKhachHang(Array.isArray(khs) ? khs : (khs as any).mang || []);
      setDsNguoiLienHe(Array.isArray(nlhs) ? nlhs : (nlhs as any).mang || []);
      setDsNhanSu(Array.isArray(nss) ? nss : (nss as any).mang || []);
      setDsChiNhanh(Array.isArray(cns) ? cns : (cns as any).mang || []);
    } catch (e) {
      console.error('Lỗi tải dữ liệu Lead:', e);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    void taiDuLieu();
  }, [taiDuLieu]);

  // Lookup map nhân sự
  const mapNhanSu = useMemo(() => {
    const m = new Map<string, NhanSu>();
    dsNhanSu.forEach(ns => m.set(ns.id, ns));
    return m;
  }, [dsNhanSu]);

  // Thống kê tổng quan Lead
  const thongKeTongQuan = useMemo(() => {
    const tong = dsLead.length;
    const moiTiepCan = dsLead.filter(x => x.trang_thai === 'moi_tiep_can').length;
    const dangTraoDoi = dsLead.filter(x => x.trang_thai === 'da_lien_he').length;
    const daHenGap = dsLead.filter(x => x.trang_thai === 'da_hen_gap').length;
    const daLenDuAn = dsLead.filter(x => x.trang_thai === 'da_chuyen_doi').length;
    const thatBai = dsLead.filter(x => x.trang_thai === 'that_bai').length;
    const dangChamSoc = moiTiepCan + dangTraoDoi;
    const tyLeChuyenDoi = tong > 0 ? Math.round((daLenDuAn / tong) * 100) : 0;
    return {
      tong,
      moiTiepCan,
      dangTraoDoi,
      dangChamSoc,
      daHenGap,
      daLenDuAn,
      thatBai,
      tyLeChuyenDoi
    };
  }, [dsLead]);

  // Lead sau khi lọc theo từ khóa & người phụ trách
  const dsLeadLoc = useMemo(() => {
    let list = dsLead;
    if (nguoiPhuTrachId !== 'tat_ca') {
      list = list.filter(x => x.nguoi_phu_trach_id === nguoiPhuTrachId);
    }
    if (tuKhoa.trim()) {
      const kw = tuKhoa.trim().toLowerCase();
      list = list.filter(
        x =>
          x.ten_khach_hang.toLowerCase().includes(kw) ||
          (x.ten_nguoi_lien_he && x.ten_nguoi_lien_he.toLowerCase().includes(kw)) ||
          (x.so_dien_thoai && x.so_dien_thoai.includes(kw)) ||
          (x.ghi_chu && x.ghi_chu.toLowerCase().includes(kw))
      );
    }
    return list;
  }, [dsLead, nguoiPhuTrachId, tuKhoa]);

  // Số lượng theo từng tab (sau khi lọc tìm kiếm & nhân viên)
  const soLuongTheoTab = useMemo(() => {
    const map: Record<string, number> = {
      tat_ca: dsLeadLoc.length,
      moi_tiep_can: 0,
      da_lien_he: 0,
      da_hen_gap: 0,
      da_chuyen_doi: 0,
      that_bai: 0
    };
    dsLeadLoc.forEach(lead => {
      if (map[lead.trang_thai] !== undefined) {
        map[lead.trang_thai]++;
      }
    });
    return map;
  }, [dsLeadLoc]);

  // Lọc theo Tab (Giai đoạn)
  const dsLeadHienThi = useMemo(() => {
    let list = dsLeadLoc;
    if (tabHienTai !== 'tat_ca') {
      list = list.filter(x => x.trang_thai === tabHienTai);
    }
    return list;
  }, [dsLeadLoc, tabHienTai]);

  // Lưu Lead (Tạo mới hoặc Sửa)
  const handleLuuLead = async (dto: TaoMoiLeadDTO | CapNhatLeadDTO) => {
    setDangXuLyLuu(true);
    try {
      if (leadDangSua) {
        await capNhatLead(leadDangSua.id, dto);
      } else {
        await taoLeadMoi(dto as TaoMoiLeadDTO);
      }
      setMoModalLead(false);
      setLeadDangSua(null);
      await taiDuLieu();
    } catch (e) {
      console.error('Lỗi lưu Lead:', e);
      alert('Không thể lưu Lead. Vui lòng thử lại!');
    } finally {
      setDangXuLyLuu(false);
    }
  };

  // Tạo KH mới từ trong Lead form
  const handleLuuKhachHangMoi = async (dto: TaoMoiKhachHangDTO) => {
    try {
      const khMoi = await taoKhachHangMoi(dto, nguoiDungHienTai ? { id: nguoiDungHienTai.id } : null);
      const dsMoi = await danhSachKhachHang();
      setDsKhachHang(Array.isArray(dsMoi) ? dsMoi : (dsMoi as any).mang || []);
      setMoDrawerKhachHang(false);
    } catch (e) {
      console.error('Lỗi tạo khách hàng:', e);
      alert('Không thể tạo khách hàng mới.');
    }
  };

  // Đổi trạng thái Lead nhanh
  const handleDoiTrangThai = async (id: string, ttMoi: TrangThaiLead) => {
    try {
      await doiTrangThaiLead(id, ttMoi);
      setDsLead(prev => prev.map(x => (x.id === id ? { ...x, trang_thai: ttMoi } : x)));
    } catch (e) {
      console.error('Lỗi đổi trạng thái:', e);
    }
  };

  // Mở modal tạo Dự án từ Lead
  const handleBatDauLenDuAn = (lead: Lead) => {
    setLeadChuyenDoi(lead);
    setMoDrawerDuAn(true);
  };

  // Xử lý tạo Dự án thành công và cập nhật Lead
  const handleLuuDuAnThanhCong = async (duAnDto: any) => {
    try {
      const hdaMoi = await taoHoSoDuAnMoi(duAnDto, nguoiDungHienTai ? {
        id: nguoiDungHienTai.id,
        chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id,
        phong_ban_id: nguoiDungHienTai.phong_ban_id
      } : null);
      if (leadChuyenDoi && hdaMoi) {
        await capNhatLead(leadChuyenDoi.id, {
          trang_thai: 'da_chuyen_doi',
          du_an_id: hdaMoi.id,
          ten_du_an: hdaMoi.ten_du_an
        });
      }
      setMoDrawerDuAn(false);
      setLeadChuyenDoi(null);
      await taiDuLieu();
    } catch (e) {
      console.error('Lỗi tạo dự án từ lead:', e);
      alert('Không thể tạo dự án. Vui lòng kiểm tra lại!');
    }
  };

  // Xóa Lead
  const handleXoaLead = async (id: string, ten: string) => {
    if (!confirm(`Bạn có chắc muốn xóa Lead "${ten}"?`)) return;
    try {
      await xoaLead(id);
      setDsLead(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      console.error('Lỗi xóa lead:', e);
      alert('Không thể xóa Lead.');
    }
  };

  const kiemTraHanHen = (ngayHen?: string | null) => {
    if (!ngayHen) return null;
    const today = new Date().toISOString().slice(0, 10);
    if (ngayHen < today) return 'qua_han';
    if (ngayHen === today) return 'hom_nay';
    return 'sap_toi';
  };

  return (
    <Bo_Cuc_Trang
      tieu_de="Lead"
      khoang_cach_trong="space-y-4 sm:space-y-6"
      hanh_dong_phai={
        <Nut
          kieu="primary"
          kich_thuoc="sm"
          onClick={() => {
            setLeadDangSua(null);
            setMoModalLead(true);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20 rounded-xl"
        >
          <Plus className="size-4 mr-1.5" />
          Thêm Lead
        </Nut>
      }
    >
      {/* 1. BẢNG SỐ LIỆU TỔNG QUAN NATIVE MOBILE (Gọn gàng 2 dòng kiểu iOS) */}
      <div className="sm:hidden bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Tổng Lead</span>
            <span className="font-extrabold text-slate-900 text-[15px] tabular-nums">{thongKeTongQuan.tong}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Đã lên DA</span>
            <span className="font-extrabold text-emerald-600 text-[15px] tabular-nums">{thongKeTongQuan.daLenDuAn}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px] pt-0.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đang chăm sóc:</span>
            <span className="font-bold text-blue-600 tabular-nums">{thongKeTongQuan.dangChamSoc}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Đã hẹn gặp:</span>
            <span className="font-bold text-purple-600 tabular-nums">{thongKeTongQuan.daHenGap}</span>
          </div>
          <span className="text-slate-200">│</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Tỷ lệ:</span>
            <span className="font-bold text-emerald-600 tabular-nums">{thongKeTongQuan.tyLeChuyenDoi}%</span>
          </div>
        </div>
      </div>

      {/* 2. BẢNG SỐ LIỆU ĐIỀU HÀNH CHUẨN DEEP FOREST BANNER TRÊN DESKTOP */}
      <div className="hidden sm:grid sm:grid-cols-4 bg-[#0e3e2d] rounded-2xl p-3.5 gap-3 shadow-sm border border-emerald-950/20">
        {/* Thẻ 1: Tổng Lead */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center shrink-0 border border-white/10">
            <Target className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Tổng Lead
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKeTongQuan.tong}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Quy mô cơ hội
            </div>
          </div>
        </div>

        {/* Thẻ 2: Đang chăm sóc */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-400/20 text-blue-200 flex items-center justify-center shrink-0 border border-blue-400/20">
            <Sparkles className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đang chăm sóc
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKeTongQuan.dangChamSoc}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Mới & Đang trao đổi
            </div>
          </div>
        </div>

        {/* Thẻ 3: Đã hẹn gặp */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-400/20 text-purple-200 flex items-center justify-center shrink-0 border border-purple-400/20">
            <CalendarCheck className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đã hẹn gặp
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKeTongQuan.daHenGap}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Cơ hội tiềm năng cao
            </div>
          </div>
        </div>

        {/* Thẻ 4: Đã lên dự án */}
        <div className="bg-[#185942] rounded-xl p-3.5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/20">
            <CheckCircle2 className="size-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-emerald-200/80 uppercase tracking-wider truncate">
              Đã lên Dự án
            </div>
            <div className="text-[20px] font-extrabold text-white tabular-nums tracking-tight leading-none mt-1">
              {thongKeTongQuan.daLenDuAn}
            </div>
            <div className="text-[10.5px] text-emerald-300/70 mt-0.5 truncate">
              Tỷ lệ chuyển đổi {thongKeTongQuan.tyLeChuyenDoi}%
            </div>
          </div>
        </div>
      </div>

      {/* 3. THANH TÌM KIẾM & BỘ LỌC TINH GỌN */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={e => setTuKhoa(e.target.value)}
            placeholder="Tìm theo tên KH, người liên hệ, SĐT..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              Phụ trách:
            </span>
            <select
              value={nguoiPhuTrachId}
              onChange={e => setNguoiPhuTrachId(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-auto"
            >
              <option value="tat_ca">Tất cả nhân viên</option>
              {dsNhanSu.map(ns => (
                <option key={ns.id} value={ns.id}>
                  {ns.ho_va_ten}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => taiDuLieu()}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
            title="Tải lại"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* 4. SEGMENTED TABS CHUẨN IOS TRƯỢT MƯỢT MÀ */}
      <div className="flex items-center p-1 bg-slate-200/60 rounded-2xl overflow-x-auto hide-scrollbar gap-1 border border-slate-300/40">
        <button
          onClick={() => setTabHienTai('tat_ca')}
          className={cn(
            'whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5',
            tabHienTai === 'tat_ca'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          )}
        >
          <span>Tất cả</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-[10.5px] tabular-nums font-semibold',
              tabHienTai === 'tat_ca' ? 'bg-slate-900 text-white' : 'bg-slate-300/70 text-slate-700'
            )}
          >
            {soLuongTheoTab['tat_ca']}
          </span>
        </button>

        {COT_KANBAN.map(cot => (
          <button
            key={cot.key}
            onClick={() => setTabHienTai(cot.key)}
            className={cn(
              'whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
              tabHienTai === cot.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            )}
          >
            <span className={cn('size-2 rounded-full shrink-0', cot.mauDot)} />
            <span>{cot.tieu_de}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10.5px] tabular-nums font-semibold',
                tabHienTai === cot.key
                  ? 'bg-slate-100 text-slate-900 border border-slate-200'
                  : 'bg-slate-300/70 text-slate-700'
              )}
            >
              {soLuongTheoTab[cot.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* 5. NỘI DUNG DANH SÁCH */}
      {dangTai ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="size-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm font-medium">Đang tải danh sách Lead...</p>
        </div>
      ) : dsLeadHienThi.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
          <p className="text-slate-500 font-semibold text-sm">Chưa có Lead nào trong mục này</p>
          <button
            onClick={() => {
              setLeadDangSua(null);
              setMoModalLead(true);
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            <Plus className="size-3.5" /> Tạo Lead mới ngay
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header Bảng trên Desktop */}
          <div className="hidden sm:flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Danh sách Lead</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold tabular-nums">
                {dsLeadHienThi.length}
              </span>
            </div>
          </div>

          {/* GIAO DIỆN 1: BẢNG TRÊN DESKTOP */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[50px] text-center">STT</th>
                  <th className="py-3 px-4 min-w-[240px]">KHÁCH HÀNG</th>
                  <th className="py-3 px-4 min-w-[170px]">TRẠNG THÁI</th>
                  <th className="py-3 px-4 min-w-[220px]">TIẾN TRÌNH & HẸN LẠI</th>
                  <th className="py-3 px-4 min-w-[170px]">PHỤ TRÁCH</th>
                  <th className="py-3 px-4 w-[110px] text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dsLeadHienThi.map((lead, index) => {
                  const ns = mapNhanSu.get(lead.nguoi_phu_trach_id);
                  const hanHen = kiemTraHanHen(lead.ngay_hen_lai);
                  const cotHienTai = COT_KANBAN.find(c => c.key === lead.trang_thai);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400 text-xs">
                        {index + 1}
                      </td>

                      {/* KHÁCH HÀNG */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/khach-hang/${lead.khach_hang_id}`}
                          className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors line-clamp-1 inline-flex items-center gap-1.5"
                        >
                          {lead.ten_khach_hang}
                          <ExternalLink className="size-3 text-slate-300 hover:text-emerald-600 shrink-0" />
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {lead.ten_nguoi_lien_he && (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                              <UserRound className="size-3 text-slate-400" />
                              {lead.ten_nguoi_lien_he}
                            </span>
                          )}
                          {lead.so_dien_thoai && (
                            <a
                              href={`tel:${lead.so_dien_thoai}`}
                              className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium"
                            >
                              <Phone className="size-3 text-emerald-600" />
                              {lead.so_dien_thoai}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={lead.trang_thai}
                            onChange={e => handleDoiTrangThai(lead.id, e.target.value as TrangThaiLead)}
                            className={cn(
                              'text-xs font-bold pl-2.5 pr-7 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-shadow focus:ring-2 focus:ring-emerald-500/20',
                              cotHienTai?.mauBadge
                            )}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.35rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.1em 1.1em'
                            }}
                          >
                            {COT_KANBAN.map(c => (
                              <option key={c.key} value={c.key}>
                                {c.tieu_de}
                              </option>
                            ))}
                          </select>
                        </div>

                        {lead.trang_thai === 'da_chuyen_doi' && lead.du_an_id && (
                          <Link
                            href={`/ho-so-du-an/${lead.du_an_id}`}
                            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                          >
                            <FolderKanban className="size-3" />
                            <span>{lead.ten_du_an || 'Xem Dự án'}</span>
                          </Link>
                        )}

                        {lead.trang_thai === 'that_bai' && lead.ly_do_that_bai && (
                          <p className="mt-1 text-[11px] text-rose-600 line-clamp-1 italic">
                            {lead.ly_do_that_bai}
                          </p>
                        )}
                      </td>

                      {/* TIẾN TRÌNH & HẸN LẠI */}
                      <td className="py-3.5 px-4">
                        {lead.ngay_hen_lai && (
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1 border',
                              hanHen === 'qua_han'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : hanHen === 'hom_nay'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            )}
                          >
                            <Clock className="size-3" />
                            {formatNgay(lead.ngay_hen_lai)}
                          </div>
                        )}
                        {lead.ghi_chu && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {lead.ghi_chu}
                          </p>
                        )}
                      </td>

                      {/* PHỤ TRÁCH */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <DaiDien
                            ten={ns?.ho_va_ten || 'N'}
                            kich_thuoc="xs"
                            className="size-6 text-[11px] bg-slate-100 text-slate-700"
                          />
                          <div className="min-w-0 text-xs">
                            <div className="font-semibold text-slate-900 truncate">
                              {ns?.ho_va_ten || 'Chưa phân công'}
                            </div>
                            {ns?.chuc_vu && (
                              <div className="text-slate-400 text-[11px] truncate">{ns.chuc_vu}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* THAO TÁC */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {lead.trang_thai !== 'da_chuyen_doi' && lead.trang_thai !== 'that_bai' && (
                            <button
                              type="button"
                              onClick={() => handleBatDauLenDuAn(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer"
                              title="Tạo dự án từ Lead này"
                            >
                              <FolderKanban className="size-3.5" />
                              <span>Lên DA</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setLeadDangSua(lead);
                              setMoModalLead(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleXoaLead(lead.id, lead.ten_khach_hang)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* GIAO DIỆN 2: THẺ CARD NATIVE TRÊN MOBILE */}
          <div className="sm:hidden flex flex-col divide-y divide-slate-100 bg-white">
            {dsLeadHienThi.map((lead, index) => {
              const ns = mapNhanSu.get(lead.nguoi_phu_trach_id);
              const hanHen = kiemTraHanHen(lead.ngay_hen_lai);
              const cotHienTai = COT_KANBAN.find(c => c.key === lead.trang_thai);

              return (
                <div key={lead.id} className="p-4 space-y-3">
                  {/* Hàng 1: Tên KH & Trạng thái */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/khach-hang/${lead.khach_hang_id}`}
                      className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 hover:text-emerald-700"
                    >
                      {lead.ten_khach_hang}
                    </Link>
                    <span
                      className={cn(
                        'shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border',
                        cotHienTai?.mauBadge
                      )}
                    >
                      {cotHienTai?.tieu_de}
                    </span>
                  </div>

                  {/* Hàng 2: Người liên hệ & SĐT */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    {lead.ten_nguoi_lien_he && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <UserRound className="size-3.5 text-slate-400" />
                        {lead.ten_nguoi_lien_he}
                      </span>
                    )}
                    {lead.so_dien_thoai && (
                      <a
                        href={`tel:${lead.so_dien_thoai}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"
                      >
                        <Phone className="size-3" />
                        {lead.so_dien_thoai}
                      </a>
                    )}
                  </div>

                  {/* Hàng 3: Lịch hẹn & Ghi chú (nếu có) */}
                  {(lead.ngay_hen_lai || lead.ghi_chu) && (
                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 border border-slate-100">
                      {lead.ngay_hen_lai && (
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-bold',
                            hanHen === 'qua_han'
                              ? 'text-rose-600'
                              : hanHen === 'hom_nay'
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          )}
                        >
                          <Clock className="size-3" />
                          <span>Hẹn lại: {formatNgay(lead.ngay_hen_lai)}</span>
                        </div>
                      )}
                      {lead.ghi_chu && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {lead.ghi_chu}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hàng 4: Phụ trách & Nút Thao tác */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <DaiDien
                        ten={ns?.ho_va_ten || 'N'}
                        kich_thuoc="xs"
                        className="size-5 text-[10px] bg-slate-100 text-slate-700"
                      />
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[120px]">
                        {ns?.ho_va_ten || 'Chưa gán'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {lead.trang_thai !== 'da_chuyen_doi' && lead.trang_thai !== 'that_bai' && (
                        <button
                          type="button"
                          onClick={() => handleBatDauLenDuAn(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition"
                        >
                          <FolderKanban className="size-3" />
                          <span>Lên DA</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setLeadDangSua(lead);
                          setMoModalLead(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <Edit3 className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleXoaLead(lead.id, lead.ten_khach_hang)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal / Drawer Lead */}
      <FormLeadModal
        mo={moModalLead}
        khi_dong={() => {
          setMoModalLead(false);
          setLeadDangSua(null);
        }}
        dang_sua={leadDangSua}
        dsKhachHang={dsKhachHang}
        dsNguoiLienHe={dsNguoiLienHe}
        dsNhanSu={dsNhanSu}
        nguoiDungId={nguoiDungHienTai?.id}
        onMoModalTaoKH={() => setMoDrawerKhachHang(true)}
        khi_luu={handleLuuLead}
        dang_xu_ly={dangXuLyLuu}
      />

      {/* Drawer Khách Hàng */}
      <FormKhachHangDrawer
        mo={moDrawerKhachHang}
        khi_dong={() => setMoDrawerKhachHang(false)}
        dang_sua={null}
        khi_luu={handleLuuKhachHangMoi as any}
        dsChiNhanh={dsChiNhanh}
        dsNhanSu={dsNhanSu}
      />

      {/* Drawer Dự Án */}
      {leadChuyenDoi && (
        <FormHoSoDuAnDrawer
          mo={moDrawerDuAn}
          khi_dong={() => {
            setMoDrawerDuAn(false);
            setLeadChuyenDoi(null);
          }}
          dang_sua={null}
          giaTriMacDinh={{
            khach_hang_id: leadChuyenDoi.khach_hang_id,
            nguoi_lien_he_id: leadChuyenDoi.nguoi_lien_he_id || null,
            nguoi_phu_trach_id: leadChuyenDoi.nguoi_phu_trach_id,
            ten_du_an: `Dự án ${leadChuyenDoi.ten_khach_hang}`,
            ghi_chu: leadChuyenDoi.ghi_chu ? `Nguồn Lead: ${leadChuyenDoi.ghi_chu}` : null
          }}
          khi_luu={handleLuuDuAnThanhCong}
        />
      )}
    </Bo_Cuc_Trang>
  );
}
