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
import type { LichGapKH } from '../../../thu_vien/types/lich_gap_kh';
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
  danhSachLichGapKH,
  taoLichGapKHMoi,
  type TaoMoiLichGapDTO
} from '../../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
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
import FormLichGapModal from '../../../thanh_phan/lich_gap_kh/form_lich_gap_modal';
import FormKhachHangDrawer from '../../../thanh_phan/khach_hang/form_khach_hang_drawer';
import FormHoSoDuAnDrawer from '../../../thanh_phan/ho_so_du_an/form_ho_so_du_an_drawer';
import {
  Bo_Cuc_Trang,
  Nut,
  DaiDien,
  ThanhSoLieu,
  KhungDanhSach,
  DanhSachTheMobile,
  TheMobile,
  NutIcon,
  Bang,
  ChuDeBang,
  ThanBang,
  HangBang,
  ODauBang,
  OBang
} from '../../../thanh_phan/ui';

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
  const [dsLichGap, setDsLichGap] = useState<LichGapKH[]>([]);
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
  const [leadDatLich, setLeadDatLich] = useState<Lead | null>(null);
  const [dangLuuLich, setDangLuuLich] = useState(false);

  // Fetch initial data
  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const [leads, khs, nlhs, nss, cns, lichs] = await Promise.all([
        danhSachLead(),
        danhSachKhachHang(),
        danhSachNguoiLienHe(),
        danhSachNhanSu(),
        danhSachChiNhanh(),
        danhSachLichGapKH().catch(() => [])
      ]);
      setDsLead(leads);
      setDsKhachHang(Array.isArray(khs) ? khs : (khs as any).mang || []);
      setDsNguoiLienHe(Array.isArray(nlhs) ? nlhs : (nlhs as any).mang || []);
      setDsNhanSu(Array.isArray(nss) ? nss : (nss as any).mang || []);
      setDsChiNhanh(Array.isArray(cns) ? cns : (cns as any).mang || []);
      setDsLichGap(Array.isArray(lichs) ? lichs : []);
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
      if (ttMoi === 'da_hen_gap') {
        const found = dsLead.find(x => x.id === id);
        if (found) setLeadDatLich(found);
      }
    } catch (e) {
      console.error('Lỗi đổi trạng thái:', e);
    }
  };

  // Lưu lịch hẹn gặp KH từ Lead
  const handleLuuLichTuLead = async (dto: any) => {
    if (!leadDatLich) return;
    setDangLuuLich(true);
    try {
      await taoLichGapKHMoi(dto as TaoMoiLichGapDTO);
      await capNhatLead(leadDatLich.id, {
        trang_thai: 'da_hen_gap',
        ngay_hen_lai: dto.ngay
      });
      setLeadDatLich(null);
      await taiDuLieu();
    } catch (e) {
      console.error('Lỗi đặt lịch từ Lead:', e);
      alert('Không thể đăng ký lịch gặp. Vui lòng thử lại!');
    } finally {
      setDangLuuLich(false);
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
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      <ThanhSoLieu
        muc={[
          {
            khoa: 'tong',
            nhan: 'Tổng Lead',
            gia_tri: thongKeTongQuan.tong,
            icon: Target,
            dang_chon: tabHienTai === 'tat_ca',
            khi_bam: () => setTabHienTai('tat_ca')
          },
          {
            khoa: 'dang_cham_soc',
            nhan: 'Đang chăm sóc',
            nhan_ngan: 'Đang chăm',
            gia_tri: thongKeTongQuan.dangChamSoc,
            icon: Sparkles,
            mau: 'thong_tin',
            dang_chon: tabHienTai === 'da_lien_he',
            khi_bam: () => setTabHienTai('da_lien_he')
          },
          {
            khoa: 'da_hen_gap',
            nhan: 'Đã hẹn gặp',
            nhan_ngan: 'Đã hẹn',
            gia_tri: thongKeTongQuan.daHenGap,
            icon: CalendarCheck,
            mau: 'canh_bao',
            dang_chon: tabHienTai === 'da_hen_gap',
            khi_bam: () => setTabHienTai('da_hen_gap')
          },
          {
            khoa: 'da_len_du_an',
            nhan: `Đã lên DA (${thongKeTongQuan.tyLeChuyenDoi}%)`,
            nhan_ngan: `Lên DA (${thongKeTongQuan.tyLeChuyenDoi}%)`,
            gia_tri: thongKeTongQuan.daLenDuAn,
            icon: CheckCircle2,
            mau: 'thanh_cong',
            dang_chon: tabHienTai === 'da_chuyen_doi',
            khi_bam: () => setTabHienTai('da_chuyen_doi')
          }
        ]}
      />

      {/* 3. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tuKhoa}
            onChange={e => setTuKhoa(e.target.value)}
            placeholder="Tìm tên KH, người liên hệ, SĐT..."
            className="w-full h-11 rounded-full sm:rounded-2xl border border-slate-200/90 bg-white pl-10 pr-4 text-noi-dung font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-nhe transition"
          />
        </div>

        <select
          value={nguoiPhuTrachId}
          onChange={e => setNguoiPhuTrachId(e.target.value)}
          aria-label="Lọc theo người phụ trách"
          className="h-11 text-phu font-bold px-3 rounded-full sm:rounded-2xl border border-slate-200/90 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 max-w-[135px] sm:max-w-[180px] truncate shadow-nhe"
        >
          <option value="tat_ca">Tất cả NV</option>
          {dsNhanSu.map(ns => (
            <option key={ns.id} value={ns.id}>
              {ns.ho_va_ten}
            </option>
          ))}
        </select>
      </div>

      {/* 4. SEGMENTED TABS */}
      <div className="flex items-center p-1 bg-slate-200/60 rounded-full sm:rounded-2xl overflow-x-auto hide-scrollbar gap-1 border border-slate-300/40">
        <button
          onClick={() => setTabHienTai('tat_ca')}
          className={cn(
            'whitespace-nowrap px-3.5 py-1.5 rounded-full sm:rounded-xl text-phu font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5',
            tabHienTai === 'tat_ca'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          )}
        >
          <span>Tất cả</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-nhan tabular-nums font-semibold',
              tabHienTai === 'tat_ca' ? 'bg-primary text-white' : 'bg-slate-300/70 text-slate-700'
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
              'whitespace-nowrap px-3.5 py-1.5 rounded-full sm:rounded-xl text-phu font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5',
              tabHienTai === cot.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            )}
          >
            <span className={cn('size-2 rounded-full shrink-0', cot.mauDot)} />
            <span>{cot.tieu_de}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-nhan tabular-nums font-semibold',
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
          <p className="text-noi-dung font-medium">Đang tải danh sách Lead...</p>
        </div>
      ) : dsLeadHienThi.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-card bg-white space-y-2">
          <p className="text-slate-500 font-semibold text-noi-dung">Chưa có Lead nào trong mục này</p>
          <button
            onClick={() => {
              setLeadDangSua(null);
              setMoModalLead(true);
            }}
            className="inline-flex items-center gap-1 text-phu font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            <Plus className="size-3.5" /> Tạo Lead mới ngay
          </button>
        </div>
      ) : (
        <KhungDanhSach
          tieu_de="Danh sách Lead"
          tieu_de_ngan="Lead"
          so_luong={dsLeadHienThi.length}
          hanh_dong={
            <Nut
              kich_thuoc="sm"
              icon_trai={Plus}
              onClick={() => {
                setLeadDangSua(null);
                setMoModalLead(true);
              }}
              title="Thêm Lead mới"
              aria-label="Thêm Lead mới"
            >
              <span className="hidden sm:inline">Thêm Lead</span>
            </Nut>
          }
        >
          <div className="hidden sm:block">
            <Bang>
              <ChuDeBang>
                <HangBang className="border-slate-200/80 hover:bg-transparent">
                  <ODauBang className="w-14 px-4 text-center">STT</ODauBang>
                  <ODauBang className="min-w-[240px] px-4">Khách hàng</ODauBang>
                  <ODauBang className="min-w-[170px] px-4">Trạng thái</ODauBang>
                  <ODauBang className="min-w-[220px] px-4">Tiến trình & hẹn lại</ODauBang>
                  <ODauBang className="min-w-[170px] px-4">Phụ trách</ODauBang>
                  <ODauBang className="w-28 px-4 text-right">Thao tác</ODauBang>
                </HangBang>
              </ChuDeBang>
              <ThanBang>
                {dsLeadHienThi.map((lead, index) => {
                  const ns = mapNhanSu.get(lead.nguoi_phu_trach_id);
                  const hanHen = kiemTraHanHen(lead.ngay_hen_lai);
                  const cotHienTai = COT_KANBAN.find(c => c.key === lead.trang_thai);

                  return (
                    <HangBang key={lead.id}>
                      <OBang className="px-4 py-3.5 text-center font-semibold text-slate-400 text-phu tabular-nums">
                        {index + 1}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <Link
                          href={`/khach-hang/${lead.khach_hang_id}`}
                          className="font-bold text-slate-900 text-noi-dung hover:text-emerald-700 transition-colors line-clamp-1 inline-flex items-center gap-1.5"
                        >
                          {lead.ten_khach_hang}
                          <ExternalLink className="size-3 text-slate-300 hover:text-emerald-600 shrink-0" />
                        </Link>
                        <div className="flex items-center gap-3 text-phu text-slate-500 mt-1">
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
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="relative inline-block">
                          <select
                            value={lead.trang_thai}
                            onChange={e => handleDoiTrangThai(lead.id, e.target.value as TrangThaiLead)}
                            className={cn(
                              'text-phu font-bold pl-2.5 pr-7 py-1.5 rounded-lg border appearance-none cursor-pointer outline-none transition-shadow focus:ring-2 focus:ring-emerald-500/20',
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
                            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-nhan font-bold text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                          >
                            <FolderKanban className="size-3" />
                            <span>{lead.ten_du_an || 'Xem Dự án'}</span>
                          </Link>
                        )}

                        {lead.trang_thai === 'that_bai' && lead.ly_do_that_bai && (
                          <p className="mt-1 text-nhan text-rose-600 line-clamp-1 italic">
                            {lead.ly_do_that_bai}
                          </p>
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        {lead.ngay_hen_lai && (
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 text-nhan font-semibold px-2 py-0.5 rounded-md mb-1 border',
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
                          <p className="text-phu text-slate-600 line-clamp-2 leading-relaxed">
                            {lead.ghi_chu}
                          </p>
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <DaiDien
                            ten={ns?.ho_va_ten || 'N'}
                            kich_thuoc="xs"
                            className="size-6 text-nhan bg-slate-100 text-slate-700"
                          />
                          <div className="min-w-0 text-phu">
                            <div className="font-semibold text-slate-900 truncate">
                              {ns?.ho_va_ten || 'Chưa phân công'}
                            </div>
                            {ns?.chuc_vu && (
                              <div className="text-slate-400 text-nhan truncate">{ns.chuc_vu}</div>
                            )}
                          </div>
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {lead.trang_thai !== 'da_chuyen_doi' && lead.trang_thai !== 'that_bai' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setLeadDatLich(lead)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-phu font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 transition cursor-pointer"
                                title="Đăng ký lịch hẹn gặp vào Lịch công tác"
                              >
                                <CalendarCheck className="size-3.5" />
                                <span>Đặt lịch</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBatDauLenDuAn(lead)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-phu font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition cursor-pointer"
                                title="Tạo dự án từ Lead này"
                              >
                                <FolderKanban className="size-3.5" />
                                <span>Lên DA</span>
                              </button>
                            </>
                          )}
                          <NutIcon
                            icon={Edit3}
                            nhan="Chỉnh sửa"
                            onClick={() => {
                              setLeadDangSua(lead);
                              setMoModalLead(true);
                            }}
                          />
                          <NutIcon
                            icon={Trash2}
                            nhan="Xóa"
                            sac="loi"
                            onClick={() => handleXoaLead(lead.id, lead.ten_khach_hang)}
                          />
                        </div>
                      </OBang>
                    </HangBang>
                  );
                })}
              </ThanBang>
            </Bang>
          </div>

          <DanhSachTheMobile>
            {dsLeadHienThi.map((lead, index) => {
              const ns = mapNhanSu.get(lead.nguoi_phu_trach_id);
              const tenNsNgan = ns?.ho_va_ten
                ? ns.ho_va_ten.trim().split(/\s+/).slice(-2).join(' ')
                : null;
              const cotHienTai = COT_KANBAN.find(c => c.key === lead.trang_thai);

              return (
                <TheMobile key={lead.id} className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="text-slate-400 text-nhan font-extrabold tabular-nums mt-0.5 shrink-0">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0 text-noi-dung leading-snug">
                        <Link
                          href={`/khach-hang/${lead.khach_hang_id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {lead.ten_khach_hang}
                        </Link>
                        {cotHienTai && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-nhan font-semibold bg-slate-100 text-slate-500 border border-slate-200/70 ml-1.5 align-middle whitespace-nowrap">
                            {cotHienTai.tieu_de}
                          </span>
                        )}
                      </div>
                    </div>

                    <NutIcon
                      icon={Edit3}
                      nhan="Chỉnh sửa"
                      className="shrink-0 -my-1"
                      onClick={() => {
                        setLeadDangSua(lead);
                        setMoModalLead(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {lead.so_dien_thoai ? (
                        <a
                          href={`tel:${lead.so_dien_thoai}`}
                          className="inline-flex items-center gap-1 font-mono font-extrabold text-primary text-phu bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60"
                        >
                          <Phone className="size-3" />
                          {lead.so_dien_thoai}
                        </a>
                      ) : lead.ngay_hen_lai ? (
                        <span className="inline-flex items-center gap-1 text-nhan font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <Clock className="size-3" />
                          {formatNgay(lead.ngay_hen_lai)}
                        </span>
                      ) : (
                        <span className="text-nhan text-slate-400 truncate">
                          {lead.ten_nguoi_lien_he || 'Chưa có SĐT'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {lead.trang_thai !== 'da_chuyen_doi' && lead.trang_thai !== 'that_bai' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setLeadDatLich(lead)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-nhan font-bold bg-purple-50 text-purple-700 border border-purple-200/80 active:scale-95 transition"
                          >
                            <CalendarCheck className="size-3" />
                            <span>Hẹn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBatDauLenDuAn(lead)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-nhan font-bold bg-primary text-white active:scale-95 transition"
                          >
                            <FolderKanban className="size-3" />
                            <span>Lên DA</span>
                          </button>
                        </>
                      )}
                      {tenNsNgan && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-nhan font-semibold text-slate-700">
                          {tenNsNgan}
                        </span>
                      )}
                    </div>
                  </div>
                </TheMobile>
              );
            })}
          </DanhSachTheMobile>
        </KhungDanhSach>
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

      {/* Modal Đăng ký Lịch gặp KH từ Lead */}
      <FormLichGapModal
        mo={Boolean(leadDatLich)}
        khi_dong={() => setLeadDatLich(null)}
        dang_sua={null}
        gia_tri_mac_dinh={
          leadDatLich
            ? {
                khach_hang_id: leadDatLich.khach_hang_id,
                ten_khach_hang: leadDatLich.ten_khach_hang,
                nguoi_lien_he_id: leadDatLich.nguoi_lien_he_id,
                ten_nguoi_lien_he: leadDatLich.ten_nguoi_lien_he,
                so_dien_thoai: leadDatLich.so_dien_thoai,
                nguoi_phu_trach_id: leadDatLich.nguoi_phu_trach_id,
                chi_nhanh_id: leadDatLich.chi_nhanh_id,
                ngay: leadDatLich.ngay_hen_lai || undefined,
                noi_dung: leadDatLich.ghi_chu,
                nguon_lead_id: leadDatLich.id
              }
            : null
        }
        dsLichHienCo={dsLichGap}
        dsKhachHang={dsKhachHang}
        dsNguoiLienHe={dsNguoiLienHe}
        dsNhanSu={dsNhanSu}
        nguoiDungId={nguoiDungHienTai?.id}
        chiNhanhMacDinhId={nguoiDungHienTai?.chi_nhanh_id}
        khi_luu={handleLuuLichTuLead}
        dang_xu_ly={dangLuuLich}
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
