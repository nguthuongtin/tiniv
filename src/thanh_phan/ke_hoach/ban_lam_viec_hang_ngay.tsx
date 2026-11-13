'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Plus,
  Calendar,
  PhoneCall,
  Users,
  Trash2,
  Sparkles,
  Clock,
  MapPin,
  Search,
  Pencil,
  UserPlus,
  FolderKanban,
  CalendarClock,
  Building2,
  MessageSquareQuote,
  X,
  Edit2,
  Check,
  Inbox,
  ArrowRight,
  Link2,
  ExternalLink,
  AlertTriangle,
  Send,
  XCircle,
  Circle,
  Flame,
  CalendarPlus,
  Loader2,
  Car,
  Phone,
  CalendarCheck,
  Share2,
  Layers,
  RotateCcw,
  ListTodo,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { moZaloXinDuyetLich } from '../../thu_vien/utils/chia_se_zalo_lich';
import ModalFormCongViecDaNang, { type KieuCongViec } from './modal_form_cong_viec_da_nang';
import { dongBoLichGapSangKeHoachTuanVaBaoCaoNgay } from '../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import { capNhatHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { taoYeuCauPhoiHopMoi } from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import type {
  KeHoachTuan,
  KeHoachThang,
  ItemKeHoachTuan,
  NhatKyKetQuaTuan,
  LoaiTacNghiepKetQuaTuan,
  TrangThaiKetQuaCongViec
} from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn, TienDoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import {
  DANH_SACH_GIAI_DOAN_MAC_DINH,
  layCauHinhGiaiDoanTheoKey
} from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  layKhoangNgayTuTuanISO,
  ghiNhanCheckInVaoBaoCaoNgay
} from '../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import { taoLichGapKHMoi, capNhatLichGapKH, type TaoMoiLichGapDTO } from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import { taoTienDoDuAnMoi } from '../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import DrawerHoSoThuGon, { type GoiYTaoLichHenNhanh } from './drawer_ho_so_thu_gon';
import { ModalNguoiLienHe } from '../khach_hang/modal_nguoi_lien_he';
import HopYeuCauPhoiHop from './hop_yeu_cau_phoi_hop';
import ModalTaoYeuCauPhoiHop from './modal_tao_yeu_cau_phoi_hop';
import {
  danhSachYeuCauPhoiHop,
  langNgheYeuCauPhoiHop,
  type YeuCauPhoiHop
} from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import { danhSachNguoiLienHe as taiDanhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';

export interface CapNhatLichPayload {
  ngay_du_kien?: string | null;
  cac_ngay_thuc_hien?: string[];
  hinh_thuc?: 'gap_mat' | 'goi_dien';
  gio_bat_dau?: string | null;
  gio_ket_thuc?: string | null;
  dia_diem_hen?: string | null;
  khach_hang_id?: string | null;
  co_quan_doanh_nghiep?: string | null;
  du_an_id?: string | null;
  du_an_du_kien?: string | null;
  ten_khach_hang_du_an?: string;
  nguoi_lien_he_id?: string | null;
  nguoi_lien_he?: string | null;
  chuc_vu?: string | null;
  so_dien_thoai_lien_he?: string | null;
}

export interface DoiTuongThucThiTask {
  khachHang?: KhachHang | null;
  duAn?: HoSoDuAn | null;
  nguoiLienHe?: NguoiLienHe | null;
}

interface Props {
  cheDoXem?: 'tuan' | 'thang';
  onDoiCheDoXem?: (mode: 'tuan' | 'thang') => void;
  onMoBaoCaoTuan?: () => void;
  tyLeHoanThanh?: number;
  keHoachTuan: KeHoachTuan | null;
  keHoachThang?: KeHoachThang | null;
  nhanVienId?: string;
  tuanChon: string;
  ngayChon: string;
  onDoiNgayChon: (ngay: string) => void;
  viecChonMacDinhId?: string | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachTienDoDuAn?: TienDoDuAn[];
  danhSachKhachHang?: KhachHang[];
  danhSachNguoiLienHe?: NguoiLienHe[];
  danhSachLichGap?: LichGapKH[];
  laSuaDuoc: boolean;
  onThemNhanh: (item: ItemKeHoachTuan) => void;
  onXoaCongViec: (itemId: string) => void;
  onCheckIn1Cham: (item: ItemKeHoachTuan) => void;
  onSuaCongViec?: (item: ItemKeHoachTuan) => void;
  onSuaNoiDungCongViec?: (itemId: string, noiDungMoi: string) => Promise<void> | void;
  onDoiNhanhHoanThanh: (itemId: string, daXong: boolean) => void;
  onChotKetQua?: (
    itemId: string,
    trangThai: TrangThaiKetQuaCongViec,
    ketQuaThucTe: string
  ) => Promise<void> | void;
  onCapNhatLichCongViec: (item: ItemKeHoachTuan, capNhat: CapNhatLichPayload) => void;
  onCapNhatTienDoInline: (
    itemId: string,
    capNhat: {
      danh_sach_ket_qua: NhatKyKetQuaTuan[];
      ket_qua_thuc_te: string;
      da_hoan_thanh: boolean;
      giai_doan_du_an_moi?: string | null;
      khach_hang_id?: string | null;
      co_quan_doanh_nghiep?: string | null;
      du_an_id?: string | null;
      du_an_du_kien?: string | null;
    }
  ) => void;
  onMoFormViecPhatSinh: (ngayMacDinh: string) => void;
  onMoFormKhachHang: (itemTuan?: ItemKeHoachTuan | null) => void;
  onMoFormDuAn: (options?: {
    itemTuan?: ItemKeHoachTuan | null;
    khachHangId?: string | null;
  }) => void;
  onMoFormLichCongTac: (ngayMacDinh: string) => void;
  onMoSuaDuAn?: (da: HoSoDuAn) => void;
  onMoTaoDuAnChoKH?: (kh: KhachHang, itemTuan?: ItemKeHoachTuan | null) => void;
  onMoSuaKhachHang?: (kh: KhachHang) => void;
  onMoTaoLichHenGoiY?: (
    goiY: GoiYTaoLichHenNhanh,
    itemTuan?: ItemKeHoachTuan | null
  ) => void;
  onDaCapNhatTienDoTuHoSoThuGon?: (params: {
    duAn: HoSoDuAn;
    noiDung: string;
    giaiDoanMoi?: string | null;
    linkTaiLieu?: string | null;
    tenTaiLieu?: string | null;
  }) => void;
  onTaiLaiNguoiLienHe?: () => void;
  khachHangVuaTaoChoTask?: {
    itemId: string;
    khachHang: KhachHang;
  } | null;
}

const TEN_THU_NGAN: Record<number, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  0: 'CN'
};

const TEN_THU_DAY_DU: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật'
};

const NHAN_LOAI_TAC_NGHIEP: Record<
  LoaiTacNghiepKetQuaTuan,
  { nhan: string; mau: string }
> = {
  ghi_chu: {
    nhan: 'Ghi chú',
    mau: 'bg-slate-200/70 text-slate-700'
  },
  goi_dien: {
    nhan: 'Gọi điện',
    mau: 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
  },
  gap_mat: {
    nhan: 'Gặp KH',
    mau: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
  },
  cap_nhat_du_an: {
    nhan: 'Tiến độ DA',
    mau: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
  },
  tao_khach_hang: {
    nhan: 'Thêm KH mới',
    mau: 'bg-teal-500/15 text-teal-700 dark:text-teal-400'
  },
  tao_du_an: {
    nhan: 'Tạo Dự án mới',
    mau: 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
  },
  dat_lich_hen: {
    nhan: 'Chốt lịch hẹn',
    mau: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
  }
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const congNgay = (iso: string, soNgay: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + soNgay);
  return toISO(d);
};

const dinhDangNgayNgan = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const layDanhSachNgayCuaViec = (item: ItemKeHoachTuan): string[] => {
  if (Array.isArray(item.cac_ngay_thuc_hien)) {
    return Array.from(new Set(item.cac_ngay_thuc_hien.filter(Boolean))).sort();
  }
  if (item.ngay_du_kien) {
    return [item.ngay_du_kien];
  }
  return [];
};

export const kiemTraViecThuocNgay = (item: ItemKeHoachTuan, ngayISO: string): boolean => {
  const cacNgay = layDanhSachNgayCuaViec(item);
  return cacNgay.includes(ngayISO);
};

const xoaDauTiengViet = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

interface MentionItem {
  id: string;
  loai: 'nguoi_lien_he' | 'khach_hang' | 'du_an';
  tieuDe: string;
  phuDe?: string;
  badge?: string;
  nguoiLienHe?: NguoiLienHe;
  khachHang?: KhachHang;
  duAn?: HoSoDuAn;
}

export default function BanLamViecHangNgay({
  cheDoXem = 'tuan',
  onDoiCheDoXem,
  onMoBaoCaoTuan,
  tyLeHoanThanh,
  keHoachTuan,
  keHoachThang,
  nhanVienId,
  tuanChon,
  ngayChon,
  onDoiNgayChon,
  viecChonMacDinhId,
  danhSachDuAn = [],
  danhSachTienDoDuAn = [],
  danhSachKhachHang = [],
  danhSachNguoiLienHe = [],
  danhSachLichGap = [],
  laSuaDuoc,
  onThemNhanh,
  onXoaCongViec,
  onSuaCongViec,
  onSuaNoiDungCongViec,
  onDoiNhanhHoanThanh,
  onChotKetQua,
  onCapNhatLichCongViec,
  onCapNhatTienDoInline,
  onMoFormKhachHang,
  onMoFormDuAn,
  onMoFormLichCongTac,
  onMoSuaDuAn,
  onMoTaoDuAnChoKH,
  onMoSuaKhachHang,
  onMoTaoLichHenGoiY,
  onDaCapNhatTienDoTuHoSoThuGon,
  onTaiLaiNguoiLienHe,
  khachHangVuaTaoChoTask
}: Props) {
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const homNayISO = useMemo(() => toISO(new Date()), []);
  const ds = keHoachTuan?.danh_sach_tac_chien ?? [];
  const dsMucTieuThang = keHoachThang?.danh_sach_dia_ban ?? [];

  // 7 ngày của tuần đang chọn
  const cacNgayTrongTuan = useMemo(() => {
    const { tuNgay } = layKhoangNgayTuTuanISO(tuanChon);
    const kq: {
      iso: string;
      thuNgan: string;
      thuDayDu: string;
      ngayThang: string;
    }[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = congNgay(tuNgay, i);
      const d = new Date(`${iso}T00:00:00`);
      const dayOfWeek = d.getDay();
      kq.push({
        iso,
        thuNgan: TEN_THU_NGAN[dayOfWeek] || 'T2',
        thuDayDu: TEN_THU_DAY_DU[dayOfWeek] || 'Thứ Hai',
        ngayThang: dinhDangNgayNgan(iso)
      });
    }
    return kq;
  }, [tuanChon]);

  // Quick Finder (Ctrl+K)
  const [tuKhoaTimNhanh, setTuKhoaTimNhanh] = useState('');
  const [moKetQuaTimNhanh, setMoKetQuaTimNhanh] = useState(false);
  const inputTimNhanhRef = useRef<HTMLInputElement | null>(null);
  const khungTimNhanhRef = useRef<HTMLDivElement | null>(null);

  // Hồ sơ thu gọn Drawer
  const [hoSoThuGonState, setHoSoThuGonState] = useState<{
    mo: boolean;
    cheDo: 'du_an' | 'khach_hang';
    duAn: HoSoDuAn | null;
    khachHang: KhachHang | null;
  }>({
    mo: false,
    cheDo: 'du_an',
    duAn: null,
    khachHang: null
  });

  // Thêm nhanh việc vào Hôm nay
  // Trạng thái sửa nội dung trực tiếp trên dòng
  const [idDangSua, setIdDangSua] = useState<string | null>(null);
  const [noiDungDangSua, setNoiDungDangSua] = useState('');

  const xuLyLuuSuaInline = async (item: ItemKeHoachTuan) => {
    const text = noiDungDangSua.trim();
    if (!text) return;
    setIdDangSua(null);
    if (onSuaNoiDungCongViec) {
      await onSuaNoiDungCongViec(item.id, text);
    } else if (onCapNhatLichCongViec) {
      onCapNhatLichCongViec(item, {
        ten_khach_hang_du_an: text
      });
    }
  };

  // Render 1 dòng công việc tự nhiên kết hợp các Link đến Khách hàng, Dự án, Người liên hệ, Lịch hẹn
  const renderDongNoiDung1Dong = (item: ItemKeHoachTuan) => {
    const rawText = (
      item.ket_qua_thuc_te ||
      item.hanh_dong_tuan ||
      item.noi_dung_tuan ||
      item.ten_khach_hang_du_an ||
      'Công việc'
    ).trim();

    const kh = timKhachHangCuaItem(item);
    const da = timDuAnCuaItem(item);
    const tenLh = item.nguoi_lien_he?.trim();
    const tenKh = (kh?.ten_khach_hang || item.co_quan_doanh_nghiep || '').trim();
    const tenDa = (da?.ten_du_an || item.du_an_du_kien || '').trim();
    const isLich = item.id.startsWith('tuan_lich_');

    let fullText = rawText;
    if (tenKh && !fullText.toLowerCase().includes(tenKh.toLowerCase())) {
      if (tenLh && fullText.includes(tenLh)) {
        fullText = fullText.replace(tenLh, `${tenLh} - ${tenKh}`);
      } else {
        fullText = `${fullText} - ${tenKh}`;
      }
    }

    if (tenDa && !fullText.toLowerCase().includes(tenDa.toLowerCase())) {
      fullText = `${fullText} (Dự án: ${tenDa})`;
    }

    interface EntityMatch {
      type: 'nguoi_lien_he' | 'khach_hang' | 'du_an';
      text: string;
      startIndex: number;
      endIndex: number;
    }

    const entities: { text: string; type: 'nguoi_lien_he' | 'khach_hang' | 'du_an' }[] = [];
    if (tenKh) entities.push({ text: tenKh, type: 'khach_hang' });
    if (tenDa) entities.push({ text: tenDa, type: 'du_an' });
    if (tenLh) entities.push({ text: tenLh, type: 'nguoi_lien_he' });

    entities.sort((a, b) => b.text.length - a.text.length);

    const matches: EntityMatch[] = [];
    entities.forEach((ent) => {
      if (!ent.text) return;
      const idx = fullText.toLowerCase().indexOf(ent.text.toLowerCase());
      if (idx !== -1) {
        const conflict = matches.some(
          (m) =>
            (idx >= m.startIndex && idx < m.endIndex) ||
            (idx + ent.text.length > m.startIndex && idx + ent.text.length <= m.endIndex)
        );
        if (!conflict) {
          matches.push({
            type: ent.type,
            text: fullText.slice(idx, idx + ent.text.length),
            startIndex: idx,
            endIndex: idx + ent.text.length
          });
        }
      }
    });

    matches.sort((a, b) => a.startIndex - b.startIndex);

    const segments: React.ReactNode[] = [];
    let curIdx = 0;

    matches.forEach((m, mIdx) => {
      if (m.startIndex > curIdx) {
        segments.push(fullText.slice(curIdx, m.startIndex));
      }

      if (m.type === 'khach_hang') {
        segments.push(
          <button
            key={`kh_${mIdx}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (kh) {
                setHoSoThuGonState({ mo: true, cheDo: 'khach_hang', khachHang: kh, duAn: null });
              }
            }}
            className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-0.5 mx-0.5 transition-colors"
            title="Nhấp để xem hồ sơ Khách hàng / Xã"
          >
            <Building2 className="size-3 text-emerald-600 inline shrink-0 -mt-0.5" />
            <span>{m.text}</span>
          </button>
        );
      } else if (m.type === 'du_an') {
        segments.push(
          <button
            key={`da_${mIdx}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (da) {
                setHoSoThuGonState({ mo: true, cheDo: 'du_an', duAn: da, khachHang: null });
              }
            }}
            className="font-bold text-indigo-700 hover:text-indigo-800 hover:underline cursor-pointer inline-flex items-center gap-0.5 mx-0.5 transition-colors"
            title="Nhấp để xem hồ sơ Dự án"
          >
            <FolderKanban className="size-3 text-indigo-600 inline shrink-0 -mt-0.5" />
            <span>{m.text}</span>
          </button>
        );
      } else if (m.type === 'nguoi_lien_he') {
        segments.push(
          <button
            key={`lh_${mIdx}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (kh) {
                setHoSoThuGonState({ mo: true, cheDo: 'khach_hang', khachHang: kh, duAn: null });
              }
            }}
            className="font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-0.5 mx-0.5 transition-colors"
            title={`Người liên hệ${item.so_dien_thoai_lien_he ? `: ${item.so_dien_thoai_lien_he}` : ''}`}
          >
            <Users className="size-3 text-blue-600 inline shrink-0 -mt-0.5" />
            <span>{m.text}</span>
          </button>
        );
      }

      curIdx = m.endIndex;
    });

    if (curIdx < fullText.length) {
      segments.push(fullText.slice(curIdx));
    }

    return (
      <span className="text-sm font-medium text-foreground leading-normal break-words">
        {segments}
        {isLich && (
          <a
            href="/lich-cong-tac"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 hover:underline ml-2 text-xs shrink-0"
            title="Nhấp để xem Lịch công tác"
          >
            <CalendarClock className="size-3 text-amber-600 shrink-0" />
            <span>Lịch hẹn{item.gio_bat_dau ? ` (${item.gio_bat_dau})` : ''}</span>
          </a>
        )}
      </span>
    );
  };

  const [noiDungThemHomNay, setNoiDungThemHomNay] = useState('');
  const [khachHangThemNhanh, setKhachHangThemNhanh] = useState<KhachHang | null>(null);
  const [duAnThemNhanh, setDuAnThemNhanh] = useState<HoSoDuAn | null>(null);
  const [nguoiLienHeThemNhanh, setNguoiLienHeThemNhanh] = useState<NguoiLienHe | null>(null);
  const [moChonDoiTuongThemNhanh, setMoChonDoiTuongThemNhanh] = useState(false);
  const [tuKhoaThemNhanh, setTuKhoaThemNhanh] = useState('');

  // Yêu cầu phối hợp phòng ban
  const [danhSachYeuCau, setDanhSachYeuCau] = useState<YeuCauPhoiHop[]>([]);
  const [moModalTaoYeuCau, setMoModalTaoYeuCau] = useState(false);
  const [duAnChoYeuCau, setDuAnChoYeuCau] = useState<HoSoDuAn | null>(null);

  useEffect(() => {
    danhSachYeuCauPhoiHop().then((ds) => setDanhSachYeuCau(ds)).catch(() => {});
    const huyLangNghe = langNgheYeuCauPhoiHop((ds) => setDanhSachYeuCau(ds));
    return () => {
      huyLangNghe();
    };
  }, []);

  // Tab con: Lịch tác nghiệp 7 ngày HOẶC Yêu cầu hỗ trợ
  const [tabHienThi, setTabHienThi] = useState<'lich_tuan' | 'yeu_cau_ho_tro'>('lich_tuan');
  const [dangChiaSeZaloId, setDangChiaSeZaloId] = useState<string | null>(null);

  const soYeuCauCanXuLy = useMemo(() => {
    return danhSachYeuCau.filter((yc) => yc.trang_thai !== 'da_hoan_thanh').length;
  }, [danhSachYeuCau]);

    // Mention phím tắt @ và # cho ô thêm việc
  const [trangThaiMention, setTrangThaiMention] = useState<{
    mo: boolean;
    kyTuKichHoat: '@' | '#' | null;
    viTriBatDau: number;
    tuKhoa: string;
  }>({ mo: false, kyTuKichHoat: null, viTriBatDau: -1, tuKhoa: '' });
  const [chiSoHighlightMention, setChiSoHighlightMention] = useState(0);
  const inputThemHomNayRef = useRef<HTMLInputElement>(null);
  const khungMentionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const xuLyClickNgoaiMention = (e: MouseEvent) => {
      if (khungMentionRef.current && !khungMentionRef.current.contains(e.target as Node)) {
        setTrangThaiMention((prev) => (prev.mo ? { ...prev, mo: false } : prev));
      }
    };
    document.addEventListener('mousedown', xuLyClickNgoaiMention);
    return () => document.removeEventListener('mousedown', xuLyClickNgoaiMention);
  }, []);

  // Modal Báo cáo kết quả Lịch hẹn
  const [lichHenDangBaoCao, setLichHenDangBaoCao] = useState<LichGapKH | null>(null);
  const [noiDungBaoCaoLichHen, setNoiDungBaoCaoLichHen] = useState('');
  const [dangLuuBaoCaoLichHen, setDangLuuBaoCaoLichHen] = useState(false);

  // Công việc đang chọn để tác nghiệp ở Cột trái
  const [viecDangChonId, setViecDangChonId] = useState<string | null>(null);

  // Lịch hẹn công tác tác nghiệp
  const [coHenLich, setCoHenLich] = useState(false);
  const [ngayHenLich, setNgayHenLich] = useState('');
  const [gioHenLich, setGioHenLich] = useState('09:00');
  const [diaDiemHen, setDiaDiemHen] = useState('');

  // Trạng thái Trạm tác nghiệp inline
  const [doiTuongThucThiMap, setDoiTuongThucThiMap] = useState<
    Record<string, DoiTuongThucThiTask>
  >({});
  const [moTimDoiTuongTrongPanel, setMoTimDoiTuongTrongPanel] = useState(false);
  const [tuKhoaDoiTuongPanel, setTuKhoaDoiTuongPanel] = useState('');
  const [loaiTacNghiepChon, setLoaiTacNghiepChon] =
    useState<LoaiTacNghiepKetQuaTuan>('goi_dien');
  const [giaiDoanDuAnChon, setGiaiDoanDuAnChon] = useState<string>('');
  const [noiDungCheckIn, setNoiDungCheckIn] = useState<string>('');
  const [linkDinhKemCheckIn, setLinkDinhKemCheckIn] = useState<string>('');
  const [tenTaiLieuCheckIn, setTenTaiLieuCheckIn] = useState<string>('');
  const [moLinkCheckIn, setMoLinkCheckIn] = useState<boolean>(false);

  // Sửa dòng nhật ký inline
  const [dangSuaKetQua, setDangSuaKetQua] = useState<{
    itemId: string;
    kqId: string;
    noiDung: string;
  } | null>(null);

  const inputCheckInRef = useRef<HTMLTextAreaElement | null>(null);

  // Map tra cứu nhanh
  const mapDuAn = useMemo(() => {
    const m = new Map<string, HoSoDuAn>();
    danhSachDuAn.forEach((d) => m.set(d.id, d));
    return m;
  }, [danhSachDuAn]);

  const mapKH = useMemo(() => {
    const m = new Map<string, KhachHang>();
    danhSachKhachHang.forEach((k) => m.set(k.id, k));
    return m;
  }, [danhSachKhachHang]);

  const mapMucTieuThang = useMemo(() => {
    const m = new Map<string, string>();
    dsMucTieuThang.forEach((mt) =>
      m.set(mt.id, mt.muc_tieu_thang || mt.ten_muc_tieu || mt.ten_khach_hang_du_an)
    );
    return m;
  }, [dsMucTieuThang]);

  // Danh sách việc của ngày đang chọn
  const dsViecNgayChon = useMemo(() => {
    return ds.filter((item) => kiemTraViecThuocNgay(item, ngayChon));
  }, [ds, ngayChon]);

  // Lịch hẹn khách hàng của ngày đang chọn
  const dsLichGapNgayChon = useMemo(() => {
    return danhSachLichGap.filter((l) => {
      if (l.ngay !== ngayChon) return false;
      if (
        nhanVienId &&
        l.nguoi_phu_trach_id !== nhanVienId &&
        l.nguoi_tao_id !== nhanVienId &&
        (!Array.isArray(l.nguoi_tham_gia_ids) || !l.nguoi_tham_gia_ids.includes(nhanVienId))
      ) {
        return false;
      }
      return true;
    });
  }, [danhSachLichGap, ngayChon, nhanVienId]);

  // Thống kê chi tiết từng ngày trong 7 ngày của tuần
  const thongKeTungNgay = useMemo(() => {
    const map = new Map<
      string,
      {
        dsViec: ItemKeHoachTuan[];
        dsLich: LichGapKH[];
        soViec: number;
        soViecXong: number;
        soLich: number;
        soLichXong: number;
      }
    >();

    cacNgayTrongTuan.forEach((n) => {
      const dsViec = ds.filter((v) => kiemTraViecThuocNgay(v, n.iso));
      const dsLich = danhSachLichGap.filter((l) => {
        if (l.ngay !== n.iso) return false;
        if (
          nhanVienId &&
          l.nguoi_phu_trach_id !== nhanVienId &&
          l.nguoi_tao_id !== nhanVienId &&
          (!Array.isArray(l.nguoi_tham_gia_ids) || !l.nguoi_tham_gia_ids.includes(nhanVienId))
        ) {
          return false;
        }
        return true;
      });
      const soViecXong = dsViec.filter(
        (v) => v.da_hoan_thanh || (v as any).trang_thai_vat_chung === 'da_lay'
      ).length;
      const soLichXong = dsLich.filter((l) => l.trang_thai === 'da_hoan_thanh').length;

      map.set(n.iso, {
        dsViec,
        dsLich,
        soViec: dsViec.length,
        soViecXong,
        soLich: dsLich.length,
        soLichXong
      });
    });

    return map;
  }, [cacNgayTrongTuan, ds, danhSachLichGap, nhanVienId]);

  const thongTinNgayChon = useMemo(() => {
    const n = cacNgayTrongTuan.find((x) => x.iso === ngayChon);
    const d = new Date(`${ngayChon}T00:00:00`);
    const dayOfWeek = d.getDay();
    const thuDayDu = n?.thuDayDu || TEN_THU_DAY_DU[dayOfWeek] || 'Thứ Hai';
    const dmy = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return {
      thuDayDu,
      ngayThangNam: dmy,
      laHomNay: ngayChon === homNayISO
    };
  }, [cacNgayTrongTuan, ngayChon, homNayISO]);

  const kichHoatGoiDienNhanh = () => {
    if (inputThemHomNayRef.current) {
      inputThemHomNayRef.current.focus();
      setNoiDungThemHomNay('Gọi điện ');
      setTrangThaiMention({
        mo: true,
        kyTuKichHoat: '@',
        viTriBatDau: 8,
        tuKhoa: ''
      });
    }
  };

  const kichHoatGanDuAnNhanh = () => {
    if (inputThemHomNayRef.current) {
      inputThemHomNayRef.current.focus();
      setNoiDungThemHomNay('Cập nhật DA ');
      setTrangThaiMention({
        mo: true,
        kyTuKichHoat: '#',
        viTriBatDau: 14,
        tuKhoa: ''
      });
    }
  };

  const xuLyXinDuyetZaloLich = async (lich: LichGapKH) => {
    setDangChiaSeZaloId(lich.id);
    try {
      await moZaloXinDuyetLich({
        lich,
        tenNhanSu: nguoiDungHienTai?.ho_va_ten || 'Nhân viên kinh doanh',
        tenDuAn: lich.du_an_id ? mapDuAn.get(lich.du_an_id)?.ten_du_an : undefined
      });
    } catch (err) {
      console.error('Lỗi chia sẻ Zalo:', err);
    } finally {
      setTimeout(() => setDangChiaSeZaloId(null), 1500);
    }
  };

  // Tự động mở việc được truyền từ ngoài (viecChonMacDinhId) hoặc việc đầu tiên khi đổi ngày
  useEffect(() => {
    if (viecChonMacDinhId && ds.some((x) => x.id === viecChonMacDinhId)) {
      setViecDangChonId(viecChonMacDinhId);
      return;
    }
    if (dsViecNgayChon.length > 0) {
      setViecDangChonId(dsViecNgayChon[0].id);
    } else {
      setViecDangChonId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viecChonMacDinhId, ngayChon]);

  // Khi vừa tạo Khách hàng mới từ Trạm thực thi -> tự động gán vào nhiệm vụ đó
  useEffect(() => {
    if (!khachHangVuaTaoChoTask) return;
    const { itemId, khachHang } = khachHangVuaTaoChoTask;
    setDoiTuongThucThiMap((prev) => ({
      ...prev,
      [itemId]: {
        khachHang,
        duAn: prev[itemId]?.duAn ?? null
      }
    }));
  }, [khachHangVuaTaoChoTask]);

  // Công việc đang chọn ở Cột phải
  const viecDangChon = useMemo(() => {
    if (!viecDangChonId) return null;
    return ds.find((x) => x.id === viecDangChonId) || null;
  }, [ds, viecDangChonId]);

  // Reset form nhỏ khi chuyển sang việc khác
  useEffect(() => {
    setMoTimDoiTuongTrongPanel(false);
    setTuKhoaDoiTuongPanel('');
    setGiaiDoanDuAnChon('');
    setMoLinkCheckIn(false);
    setLinkDinhKemCheckIn('');
    setTenTaiLieuCheckIn('');
    setCoHenLich(false);
    setNgayHenLich('');
    setGioHenLich('09:00');
    setDiaDiemHen('');
    if (viecDangChon?.hinh_thuc === 'gap_mat') {
      setLoaiTacNghiepChon('gap_mat');
    } else if (viecDangChon?.du_an_id) {
      setLoaiTacNghiepChon('cap_nhat_du_an');
    } else {
      setLoaiTacNghiepChon('goi_dien');
    }
  }, [viecDangChon?.id]);

  // Phím tắt Ctrl+K mở ô tìm nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputTimNhanhRef.current?.focus();
        setMoKetQuaTimNhanh(true);
      } else if (e.key === 'Escape') {
        setMoKetQuaTimNhanh(false);
        setMoTimDoiTuongTrongPanel(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Đóng dropdown Quick Finder khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        khungTimNhanhRef.current &&
        !khungTimNhanhRef.current.contains(e.target as Node)
      ) {
        setMoKetQuaTimNhanh(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách Người liên hệ của khách hàng đang chọn trong ô thêm việc nhanh
  const dsLienHeCuaKhThemNhanh = useMemo(() => {
    if (!khachHangThemNhanh) return [];
    return danhSachNguoiLienHe.filter((lh) => lh.khach_hang_id === khachHangThemNhanh.id);
  }, [khachHangThemNhanh, danhSachNguoiLienHe]);

  // Xử lý báo cáo kết quả cuộc gặp & tự động đồng bộ vào Báo cáo ngày + Khách hàng/Dự án
  const xuLyLuuBaoCaoLichHen = async () => {
    if (!lichHenDangBaoCao || !noiDungBaoCaoLichHen.trim()) return;
    setDangLuuBaoCaoLichHen(true);
    try {
      const now = new Date().toISOString();
      const kqSach = noiDungBaoCaoLichHen.trim();

      // 1. Cập nhật trạng thái lịch hẹn sang đã hoàn thành
      await capNhatLichGapKH(lichHenDangBaoCao.id, {
        trang_thai: 'da_hoan_thanh',
        ket_qua: kqSach
      });

      // 2. Tự động ghi vào Báo cáo công việc ngày hôm nay
      const nvId = nhanVienId || nguoiDungHienTai?.id;
      if (nvId) {
        await ghiNhanCheckInVaoBaoCaoNgay({
          nhanVienId: nvId,
          chiNhanhId: (nguoiDungHienTai as any)?.chi_nhanh_id || null,
          phongBanId: (nguoiDungHienTai as any)?.phong_ban_id || null,
          ngayBaoCao: homNayISO,
          duAnId: lichHenDangBaoCao.du_an_id || null,
          tenKhachHangDuAn: lichHenDangBaoCao.ten_khach_hang || lichHenDangBaoCao.tieu_de,
          noiDungKetQua: `Kết quả cuộc gặp [${lichHenDangBaoCao.tieu_de}]: ${kqSach}`,
          nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: nvId }
        });
      }

      // 3. Nếu cuộc gặp thuộc dự án, tự động tạo 1 mốc tiến độ dự án
      if (lichHenDangBaoCao.du_an_id && nvId) {
        await taoTienDoDuAnMoi({
          du_an_id: lichHenDangBaoCao.du_an_id,
          tinh_hinh_hien_tai: `Kết quả cuộc gặp: ${lichHenDangBaoCao.tieu_de} — ${kqSach}`,
          nguoi_tao_id: nvId
        }).catch(() => {});
      }

      // 4. Cập nhật state trực tiếp để UI phản hồi ngay lập tức
      lichHenDangBaoCao.trang_thai = 'da_hoan_thanh';
      lichHenDangBaoCao.ket_qua = kqSach;

      setLichHenDangBaoCao(null);
      setNoiDungBaoCaoLichHen('');
    } catch (err: any) {
      alert(err?.message || 'Có lỗi khi lưu kết quả cuộc hẹn.');
    } finally {
      setDangLuuBaoCaoLichHen(false);
    }
  };

  // Tìm thực thể của 1 công việc
  const timDuAnCuaItem = (item: ItemKeHoachTuan): HoSoDuAn | null => {
    if (item.du_an_id && mapDuAn.has(item.du_an_id)) {
      return mapDuAn.get(item.du_an_id) || null;
    }
    if (item.du_an_du_kien) {
      const lower = item.du_an_du_kien.trim().toLowerCase();
      return (
        danhSachDuAn.find((d) => d.ten_du_an.trim().toLowerCase() === lower) || null
      );
    }
    return null;
  };

  const timKhachHangCuaItem = (item: ItemKeHoachTuan): KhachHang | null => {
    if (item.khach_hang_id && mapKH.has(item.khach_hang_id)) {
      return mapKH.get(item.khach_hang_id) || null;
    }
    const da = timDuAnCuaItem(item);
    if (da?.khach_hang_id && mapKH.has(da.khach_hang_id)) {
      return mapKH.get(da.khach_hang_id) || null;
    }
    if (item.co_quan_doanh_nghiep) {
      const lower = item.co_quan_doanh_nghiep.trim().toLowerCase();
      return (
        danhSachKhachHang.find(
          (k) => k.ten_khach_hang.trim().toLowerCase() === lower
        ) || null
      );
    }
    return null;
  };

  const moHoSoDuAnNhanh = (da: HoSoDuAn) => {
    const kh = da.khach_hang_id ? mapKH.get(da.khach_hang_id) || null : null;
    setHoSoThuGonState({
      mo: true,
      cheDo: 'du_an',
      duAn: da,
      khachHang: kh
    });
    setMoKetQuaTimNhanh(false);
  };

  const moHoSoKhachHangNhanh = (kh: KhachHang) => {
    const dsDaCuaKH = danhSachDuAn.filter(
      (d) => d.khach_hang_id === kh.id && d.trang_thai === 'hoat_dong'
    );
    setHoSoThuGonState({
      mo: true,
      cheDo: 'khach_hang',
      duAn: dsDaCuaKH[0] || null,
      khachHang: kh
    });
    setMoKetQuaTimNhanh(false);
  };

  // Kết quả Quick Finder (Top Bar)
  const ketQuaTimNhanh = useMemo(() => {
    const q = tuKhoaTimNhanh.trim().toLowerCase();
    const dsDuAnPhuTrach = danhSachDuAn.filter((d) => {
      if (d.trang_thai === 'da_xoa') return false;
      if (!nhanVienId) return true;
      return (
        d.nguoi_phu_trach_id === nhanVienId ||
        d.nguoi_quan_ly_id === nhanVienId ||
        (d.danh_sach_nguoi_ho_tro_ids || []).includes(nhanVienId)
      );
    });

    if (!q) {
      return {
        duAn: dsDuAnPhuTrach.slice(0, 5),
        khachHang: danhSachKhachHang.slice(0, 5)
      };
    }

    const duAnKhop = danhSachDuAn
      .filter((d) => {
        if (d.trang_thai === 'da_xoa') return false;
        const kh = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
        return (
          d.ten_du_an.toLowerCase().includes(q) ||
          (d.ma_ho_so || '').toLowerCase().includes(q) ||
          (kh?.ten_khach_hang || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 6);

    const khachHangKhop = danhSachKhachHang
      .filter(
        (k) =>
          k.ten_khach_hang.toLowerCase().includes(q) ||
          (k.ma_so_thue || '').toLowerCase().includes(q) ||
          (k.so_dien_thoai || '').toLowerCase().includes(q) ||
          (k.xa_phuong || '').toLowerCase().includes(q)
      )
      .slice(0, 6);

    return {
      duAn: duAnKhop,
      khachHang: khachHangKhop
    };
  }, [tuKhoaTimNhanh, danhSachDuAn, danhSachKhachHang, nhanVienId, mapKH]);

  // Kết quả tìm Khách hàng / Dự án trong Action Panel
  const ketQuaTimDoiTuongPanel = useMemo(() => {
    const q = tuKhoaDoiTuongPanel.trim().toLowerCase();
    if (!q) {
      return {
        khachHang: danhSachKhachHang.slice(0, 25),
        duAn: danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa').slice(0, 25)
      };
    }
    const kh = danhSachKhachHang
      .filter(
        (k) =>
          k.ten_khach_hang.toLowerCase().includes(q) ||
          (k.ma_so_thue || '').toLowerCase().includes(q) ||
          (k.so_dien_thoai || '').toLowerCase().includes(q) ||
          (k.dia_chi || '').toLowerCase().includes(q) ||
          (k.xa_phuong || '').toLowerCase().includes(q) ||
          (k.tinh_thanh || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
    const da = danhSachDuAn
      .filter((d) => {
        if (d.trang_thai === 'da_xoa') return false;
        const khObj = d.khach_hang_id ? mapKH.get(d.khach_hang_id) : null;
        return (
          d.ten_du_an.toLowerCase().includes(q) ||
          (d.ma_ho_so || '').toLowerCase().includes(q) ||
          (khObj?.ten_khach_hang || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 30);
    return { khachHang: kh, duAn: da };
  }, [tuKhoaDoiTuongPanel, danhSachKhachHang, danhSachDuAn, mapKH]);

  const ketQuaTimThemNhanh = useMemo(() => {
    const q = tuKhoaThemNhanh.trim().toLowerCase();
    const dsKH = danhSachKhachHang
      .filter((k) => !q || k.ten_khach_hang.toLowerCase().includes(q))
      .slice(0, 10)
      .map((k) => ({ id: `kh_${k.id}`, loai: 'khach_hang' as const, ten: k.ten_khach_hang, data: k }));
    const dsDA = danhSachDuAn
      .filter((d) => d.trang_thai !== 'da_xoa' && (!q || d.ten_du_an.toLowerCase().includes(q)))
      .slice(0, 10)
      .map((d) => ({ id: `da_${d.id}`, loai: 'du_an' as const, ten: d.ten_du_an, data: d }));
    return [...dsKH, ...dsDA];
  }, [tuKhoaThemNhanh, danhSachKhachHang, danhSachDuAn]);

  // Danh sách gợi ý khi gõ @ hoặc #
  const danhSachGoiYMention = useMemo<MentionItem[]>(() => {
    if (!trangThaiMention.mo || !trangThaiMention.kyTuKichHoat) return [];

    const rawQ = trangThaiMention.tuKhoa.trim();
    const qKhongDau = xoaDauTiengViet(rawQ);

    if (trangThaiMention.kyTuKichHoat === '@') {
      const ketQua: MentionItem[] = [];

      // 1. Tìm Người liên hệ
      for (const lh of danhSachNguoiLienHe) {
        const ten = lh.ho_va_ten || '';
        const chucVu = lh.chuc_vu || '';
        const sdt = lh.so_dien_thoai || '';
        const kh = lh.khach_hang_id ? mapKH.get(lh.khach_hang_id) : undefined;
        const tenKH = kh?.ten_khach_hang || '';

        const match =
          !rawQ ||
          xoaDauTiengViet(ten).includes(qKhongDau) ||
          xoaDauTiengViet(chucVu).includes(qKhongDau) ||
          xoaDauTiengViet(tenKH).includes(qKhongDau) ||
          sdt.includes(rawQ);

        if (match) {
          ketQua.push({
            id: `nlh_${lh.id}`,
            loai: 'nguoi_lien_he',
            tieuDe: ten,
            phuDe: [chucVu, tenKH, sdt].filter(Boolean).join(' • '),
            badge: 'Người liên hệ',
            nguoiLienHe: lh,
            khachHang: kh
          });
        }
        if (ketQua.length >= 6) break;
      }

      // 2. Tìm Khách hàng / Xã phường
      for (const kh of danhSachKhachHang) {
        const ten = kh.ten_khach_hang || '';
        const diaChi = kh.dia_chi || '';
        const match =
          !rawQ ||
          xoaDauTiengViet(ten).includes(qKhongDau) ||
          xoaDauTiengViet(diaChi).includes(qKhongDau);

        if (match) {
          ketQua.push({
            id: `kh_${kh.id}`,
            loai: 'khach_hang',
            tieuDe: ten,
            phuDe: diaChi || undefined,
            badge: 'Xã / Khách hàng',
            khachHang: kh
          });
        }
        if (ketQua.length >= 10) break;
      }

      return ketQua;
    }

    if (trangThaiMention.kyTuKichHoat === '#') {
      const ketQua: MentionItem[] = [];

      // Tìm Dự án
      for (const da of danhSachDuAn) {
        const ten = da.ten_du_an || '';
        const ma = da.ma_ho_so || '';
        const kh = da.khach_hang_id ? mapKH.get(da.khach_hang_id) : undefined;
        const tenKH = kh?.ten_khach_hang || '';

        const match =
          !rawQ ||
          xoaDauTiengViet(ten).includes(qKhongDau) ||
          xoaDauTiengViet(ma).includes(qKhongDau) ||
          xoaDauTiengViet(tenKH).includes(qKhongDau);

        if (match) {
          ketQua.push({
            id: `da_${da.id}`,
            loai: 'du_an',
            tieuDe: ten,
            phuDe: [ma, tenKH].filter(Boolean).join(' • '),
            badge: 'Dự án',
            duAn: da,
            khachHang: kh
          });
        }
        if (ketQua.length >= 8) break;
      }

      return ketQua;
    }

    return [];
  }, [trangThaiMention, danhSachNguoiLienHe, danhSachKhachHang, danhSachDuAn, mapKH]);

  const xuLyThayDoiNoiDungThem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNoiDungThemHomNay(val);

    const conTro = e.target.selectionStart ?? val.length;
    const chuoiTruocConTro = val.slice(0, conTro);

    const match = chuoiTruocConTro.match(/(?:^|\s)([@#])([^\s@#]*)$/);
    if (match) {
      const kyTu = match[1] as '@' | '#';
      const tuKhoa = match[2];
      const viTri = chuoiTruocConTro.lastIndexOf(kyTu);
      setTrangThaiMention({
        mo: true,
        kyTuKichHoat: kyTu,
        viTriBatDau: viTri,
        tuKhoa: tuKhoa
      });
      setChiSoHighlightMention(0);
    } else {
      if (trangThaiMention.mo) {
        setTrangThaiMention({ mo: false, kyTuKichHoat: null, viTriBatDau: -1, tuKhoa: '' });
      }
    }
  };

  const chonMucMention = (item: MentionItem) => {
    const { viTriBatDau, tuKhoa } = trangThaiMention;
    const doDaiThayThe = 1 + tuKhoa.length;

    let chuoiChen = '';
    if (item.loai === 'nguoi_lien_he') {
      if (item.nguoiLienHe) {
        setNguoiLienHeThemNhanh(item.nguoiLienHe);
      }
      if (item.khachHang) {
        setKhachHangThemNhanh(item.khachHang);
      }
      chuoiChen = `${item.tieuDe} `;
    } else if (item.loai === 'khach_hang') {
      if (item.khachHang) {
        setKhachHangThemNhanh(item.khachHang);
      }
      chuoiChen = `${item.tieuDe} `;
    } else if (item.loai === 'du_an') {
      if (item.duAn) {
        setDuAnThemNhanh(item.duAn);
        if (item.khachHang) {
          setKhachHangThemNhanh(item.khachHang);
        }
      }
      chuoiChen = `${item.tieuDe} `;
    }

    const phanDau = noiDungThemHomNay.slice(0, viTriBatDau);
    const phanSau = noiDungThemHomNay.slice(viTriBatDau + doDaiThayThe);
    const noiDungMoi = phanDau + chuoiChen + phanSau;
    setNoiDungThemHomNay(noiDungMoi);

    setTrangThaiMention({ mo: false, kyTuKichHoat: null, viTriBatDau: -1, tuKhoa: '' });

    setTimeout(() => {
      if (inputThemHomNayRef.current) {
        inputThemHomNayRef.current.focus();
        const viTriConTroMoi = phanDau.length + chuoiChen.length;
        inputThemHomNayRef.current.setSelectionRange(viTriConTroMoi, viTriConTroMoi);
      }
    }, 20);
  };

  // Thao tác thêm nhanh việc vào Hôm nay (Cột trái) - Nhập là nhập kết quả đã hoàn thành
  const xuLyThemNhanhHomNay = () => {
    const noiDungKetQua = noiDungThemHomNay.trim();
    if (!noiDungKetQua) return;
    const idMoi = `tuan_${Date.now()}`;
    const kh =
      khachHangThemNhanh ||
      (duAnThemNhanh?.khach_hang_id ? mapKH.get(duAnThemNhanh.khach_hang_id) : null);
    const da = duAnThemNhanh;

    const itemMoi: ItemKeHoachTuan = {
      id: idMoi,
      loai_hanh_dong: 'phat_sinh',
      hinh_thuc: 'goi_dien',
      khach_hang_id: kh?.id || null,
      co_quan_doanh_nghiep: kh?.ten_khach_hang || null,
      du_an_id: da?.id || null,
      du_an_du_kien: da?.ten_du_an || null,
      ten_khach_hang_du_an: da?.ten_du_an || kh?.ten_khach_hang || noiDungKetQua,
      hanh_dong_tuan: noiDungKetQua,
      noi_dung_tuan: noiDungKetQua,
      ket_qua_thuc_te: noiDungKetQua,
      nguoi_lien_he_id: nguoiLienHeThemNhanh?.id || null,
      nguoi_lien_he: nguoiLienHeThemNhanh?.ho_va_ten || null,
      chuc_vu: nguoiLienHeThemNhanh?.chuc_vu || null,
      so_dien_thoai_lien_he: nguoiLienHeThemNhanh?.so_dien_thoai || null,
      ket_qua_mong_muon: noiDungKetQua,
      dau_ra_cam_ket: noiDungKetQua,
      ngay_du_kien: ngayChon,
      cac_ngay_thuc_hien: [ngayChon],
      da_hoan_thanh: true,
      ngay_hoan_thanh: ngayChon,
      trang_thai_ket_qua: 'dat_muc_tieu',
      danh_sach_ket_qua: [
        {
          id: `kq_${Date.now()}`,
          ngay_ghi_nhan: ngayChon,
          noi_dung: noiDungKetQua,
          khach_hang_id: kh?.id || null,
          ten_khach_hang: kh?.ten_khach_hang || null,
          du_an_id: da?.id || null,
          ten_du_an: da?.ten_du_an || null,
          nguoi_lien_he_id: nguoiLienHeThemNhanh?.id || null,
          ten_nguoi_lien_he: nguoiLienHeThemNhanh?.ho_va_ten || null
        }
      ]
    };
    onThemNhanh(itemMoi);
    setNoiDungThemHomNay('');
    setKhachHangThemNhanh(null);
    setDuAnThemNhanh(null);
    setNguoiLienHeThemNhanh(null);
    setMoChonDoiTuongThemNhanh(false);
    setViecDangChonId(null);
  };

  // Bật / tắt 1 ngày cho công việc đang chọn
  const xuLyBatTatNgayCuaViec = (item: ItemKeHoachTuan, iso: string) => {
    const hienTai = layDanhSachNgayCuaViec(item);
    const daCo = hienTai.includes(iso);
    const moi = daCo ? hienTai.filter((x) => x !== iso) : [...hienTai, iso].sort();
    onCapNhatLichCongViec(item, {
      cac_ngay_thuc_hien: moi,
      ngay_du_kien: moi[0] || null
    });
  };

  // Gỡ Khách hàng / Dự án cố định khỏi công việc
  const xuLyGoKhachHangKhoiItem = (item: ItemKeHoachTuan) => {
    const tenGoc = item.hanh_dong_tuan || item.noi_dung_tuan || 'Công việc tuần';
    onCapNhatLichCongViec(item, {
      khach_hang_id: null,
      co_quan_doanh_nghiep: null,
      ten_khach_hang_du_an: tenGoc,
      nguoi_lien_he_id: null,
      nguoi_lien_he: null,
      chuc_vu: null,
      so_dien_thoai_lien_he: null
    });
  };

  const xuLyGoDuAnKhoiItem = (item: ItemKeHoachTuan) => {
    onCapNhatLichCongViec(item, {
      du_an_id: null,
      du_an_du_kien: null
    });
  };

  // Thống kê nhanh trong ngày
  const soViecNgayDaXong = dsViecNgayChon.filter(
    (x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay'
  ).length;

  // Đối tượng đang được chọn trong Action Panel của viecDangChon
  const daCoDinhCuaViecChon = viecDangChon ? timDuAnCuaItem(viecDangChon) : null;
  const khCoDinhCuaViecChon = viecDangChon ? timKhachHangCuaItem(viecDangChon) : null;
  const doiTuongTamCuaViecChon = viecDangChon
    ? doiTuongThucThiMap[viecDangChon.id]
    : undefined;

  const duAnDangTacNghiep =
    doiTuongTamCuaViecChon?.duAn !== undefined
      ? doiTuongTamCuaViecChon.duAn
      : daCoDinhCuaViecChon;

  const khachHangDangTacNghiep =
    doiTuongTamCuaViecChon?.khachHang !== undefined
      ? doiTuongTamCuaViecChon.khachHang
      : duAnDangTacNghiep?.khach_hang_id
      ? mapKH.get(duAnDangTacNghiep.khach_hang_id) || khCoDinhCuaViecChon
      : khCoDinhCuaViecChon;

  // Danh bạ Người liên hệ của Khách hàng đang tác nghiệp
  const [dsLienHeBoSung, setDsLienHeBoSung] = useState<NguoiLienHe[]>([]);
  const [moModalThemLienHe, setMoModalThemLienHe] = useState(false);

  useEffect(() => {
    let active = true;
    if (!khachHangDangTacNghiep?.id) {
      setDsLienHeBoSung([]);
      return;
    }
    taiDanhSachNguoiLienHe({ khach_hang_id: khachHangDangTacNghiep.id })
      .then((res) => {
        if (active) setDsLienHeBoSung(res.mang || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [khachHangDangTacNghiep?.id]);

  const dsLienHeCuaKhDangTacNghiep = useMemo(() => {
    if (!khachHangDangTacNghiep) return [];
    const tuProps = danhSachNguoiLienHe.filter(
      (lh) => lh.khach_hang_id === khachHangDangTacNghiep.id
    );
    const map = new Map<string, NguoiLienHe>();
    [...tuProps, ...dsLienHeBoSung].forEach((lh) => map.set(lh.id, lh));
    return Array.from(map.values());
  }, [khachHangDangTacNghiep, danhSachNguoiLienHe, dsLienHeBoSung]);

  const nguoiLienHeDangTacNghiep = useMemo((): NguoiLienHe | null => {
    if (!viecDangChon) return null;
    if (doiTuongTamCuaViecChon?.nguoiLienHe !== undefined) {
      return doiTuongTamCuaViecChon.nguoiLienHe;
    }
    if (viecDangChon.nguoi_lien_he_id) {
      const timTheoId = dsLienHeCuaKhDangTacNghiep.find(
        (lh) => lh.id === viecDangChon.nguoi_lien_he_id
      );
      if (timTheoId) return timTheoId;
    }
    if (viecDangChon.nguoi_lien_he) {
      const timTheoTen = dsLienHeCuaKhDangTacNghiep.find(
        (lh) =>
          lh.ho_va_ten.trim().toLowerCase() ===
          viecDangChon.nguoi_lien_he!.trim().toLowerCase()
      );
      if (timTheoTen) return timTheoTen;
      return {
        id: viecDangChon.nguoi_lien_he_id || 'lh_item',
        khach_hang_id: khachHangDangTacNghiep?.id || '',
        ho_va_ten: viecDangChon.nguoi_lien_he,
        chuc_vu: viecDangChon.chuc_vu || null,
        so_dien_thoai: viecDangChon.so_dien_thoai_lien_he || null,
        email: null,
        ghi_chu: null,
        ngay_tao: ''
      };
    }
    return dsLienHeCuaKhDangTacNghiep[0] || null;
  }, [
    viecDangChon,
    doiTuongTamCuaViecChon?.nguoiLienHe,
    dsLienHeCuaKhDangTacNghiep,
    khachHangDangTacNghiep?.id
  ]);

  const dsDuAnCuaKhDangTacNghiep = useMemo(() => {
    if (!khachHangDangTacNghiep) return [];
    return danhSachDuAn.filter(
      (d) => d.khach_hang_id === khachHangDangTacNghiep.id && d.trang_thai !== 'da_xoa'
    );
  }, [khachHangDangTacNghiep, danhSachDuAn]);

  // Ghi nhận kết quả tương tác -> Đồng bộ toàn hệ thống
  const xuLyGhiNhanKetQuaPanel = async (danhDauXongLuon = false) => {
    if (!viecDangChon) return;
    const text = noiDungCheckIn.trim();
    if (!text && !danhDauXongLuon && !coHenLich) {
      inputCheckInRef.current?.focus();
      return;
    }

    const doiTuongChon = doiTuongThucThiMap[viecDangChon.id];
    const daCoDinh = timDuAnCuaItem(viecDangChon);
    const khCoDinh = timKhachHangCuaItem(viecDangChon);

    const duAnTuongTac = doiTuongChon?.duAn ?? daCoDinh ?? null;
    const khTuongTac =
      doiTuongChon?.khachHang ??
      (duAnTuongTac?.khach_hang_id
        ? mapKH.get(duAnTuongTac.khach_hang_id) || null
        : null) ??
      khCoDinh ??
      null;
    const lhTuongTac = nguoiLienHeDangTacNghiep;

    // Xử lý tự động tạo lịch hẹn công tác nếu bật hẹn lịch
    let noiDungHenThem = '';
    if (coHenLich && ngayHenLich) {
      try {
        const tenKhach =
          khTuongTac?.ten_khach_hang || duAnTuongTac?.ten_du_an || 'Khách hàng';
        const nguoiPhuTrach = nhanVienId || nguoiDungHienTai?.id || '';

        await taoLichGapKHMoi({
          tieu_de: `Gặp làm việc với ${tenKhach}`,
          khach_hang_id: khTuongTac?.id || null,
          ten_khach_hang: tenKhach,
          nguoi_lien_he_id:
            lhTuongTac?.id && lhTuongTac.id !== 'lh_item' ? lhTuongTac.id : null,
          ten_nguoi_lien_he: lhTuongTac?.ho_va_ten || null,
          so_dien_thoai:
            lhTuongTac?.so_dien_thoai || khTuongTac?.so_dien_thoai || null,
          nguoi_phu_trach_id: nguoiPhuTrach,
          nguoi_tham_gia_ids: nguoiPhuTrach ? [nguoiPhuTrach] : [],
          chi_nhanh_id: null,
          ngay: ngayHenLich,
          gio_bat_dau: gioHenLich || '09:00',
          gio_ket_thuc: '10:30',
          dia_diem: diaDiemHen.trim() || khTuongTac?.dia_chi || null,
          noi_dung:
            text ||
            `Hẹn gặp trao đổi công việc (${
              viecDangChon.hanh_dong_tuan || viecDangChon.noi_dung_tuan || ''
            })`,
          ket_qua: null,
          trang_thai: 'sap_toi',
          nguon_lead_id: null,
          du_an_id: duAnTuongTac?.id || null,
          nguoi_tao_id: nguoiDungHienTai?.id || nguoiPhuTrach
        });

        // Tự động sinh công việc vào đúng ngày hẹn trên Bàn làm việc
        const itemViecHenMoi: ItemKeHoachTuan = {
          id: `item_hen_${Date.now()}`,
          ten_khach_hang_du_an: tenKhach,
          noi_dung_tuan: `Gặp trực tiếp ${tenKhach}`,
          hanh_dong_tuan: `Gặp trực tiếp ${tenKhach}`,
          dau_ra_cam_ket: 'Chốt nội dung làm việc',
          hinh_thuc: 'gap_mat',
          gio_bat_dau: gioHenLich || '09:00',
          gio_ket_thuc: '10:30',
          dia_diem_hen: diaDiemHen.trim() || khTuongTac?.dia_chi || null,
          ngay_du_kien: ngayHenLich,
          cac_ngay_thuc_hien: [ngayHenLich],
          khach_hang_id: khTuongTac?.id || null,
          co_quan_doanh_nghiep: tenKhach,
          du_an_id: duAnTuongTac?.id || null,
          du_an_du_kien: duAnTuongTac?.ten_du_an || null,
          nguoi_lien_he_id:
            lhTuongTac?.id && lhTuongTac.id !== 'lh_item' ? lhTuongTac.id : null,
          nguoi_lien_he: lhTuongTac?.ho_va_ten || null,
          chuc_vu: lhTuongTac?.chuc_vu || null,
          so_dien_thoai_lien_he: lhTuongTac?.so_dien_thoai || null,
          ket_qua_mong_muon: 'Chốt nội dung làm việc',
          da_hoan_thanh: false,
          danh_sach_ket_qua: []
        };
        onThemNhanh(itemViecHenMoi);
        noiDungHenThem = `[Hẹn gặp: ${ngayHenLich} lúc ${gioHenLich || '09:00'}${
          diaDiemHen.trim() ? ` @ ${diaDiemHen.trim()}` : ''
        }]`;
      } catch (err) {
        console.error('Lỗi khi tự động tạo lịch hẹn:', err);
      }
    }

    const noiDungCuoiCung = [noiDungHenThem, text].filter(Boolean).join(' - ');

    const dsCu = viecDangChon.danh_sach_ket_qua ?? [];
    let dsMoi = [...dsCu];

    if (noiDungCuoiCung) {
      const kqMoi: NhatKyKetQuaTuan = {
        id: `kq_${Date.now()}`,
        ngay_ghi_nhan: ngayChon,
        noi_dung: noiDungCuoiCung,
        nguoi_ghi_id: nguoiDungHienTai?.id || null,
        ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null,
        loai_tac_nghiep: coHenLich ? 'gap_mat' : loaiTacNghiepChon,
        khach_hang_id: khTuongTac?.id || null,
        ten_khach_hang: khTuongTac?.ten_khach_hang || null,
        du_an_id: duAnTuongTac?.id || null,
        ten_du_an: duAnTuongTac?.ten_du_an || null,
        nguoi_lien_he_id:
          lhTuongTac?.id && lhTuongTac.id !== 'lh_item' ? lhTuongTac.id : null,
        ten_nguoi_lien_he: lhTuongTac?.ho_va_ten || null,
        chuc_vu_lien_he: lhTuongTac?.chuc_vu || null,
        so_dien_thoai_lien_he: lhTuongTac?.so_dien_thoai || null,
        giai_doan_du_an: giaiDoanDuAnChon || duAnTuongTac?.giai_doan || null,
        link_dinh_kem: linkDinhKemCheckIn.trim() || null,
        ten_tai_lieu: tenTaiLieuCheckIn.trim() || null
      };
      dsMoi = [kqMoi, ...dsCu];
    }

    const daXongHienTai = Boolean(
      viecDangChon.da_hoan_thanh ||
        (viecDangChon as any).trang_thai_vat_chung === 'da_lay'
    );
    const daHoanThanhMoi = danhDauXongLuon ? true : daXongHienTai;

    onCapNhatTienDoInline(viecDangChon.id, {
      danh_sach_ket_qua: dsMoi,
      ket_qua_thuc_te:
        dsMoi[0]?.noi_dung || viecDangChon.ket_qua_thuc_te || 'Đã hoàn thành',
      da_hoan_thanh: daHoanThanhMoi,
      giai_doan_du_an_moi: giaiDoanDuAnChon || null,
      khach_hang_id: khTuongTac?.id || null,
      co_quan_doanh_nghiep: khTuongTac?.ten_khach_hang || null,
      du_an_id: duAnTuongTac?.id || null,
      du_an_du_kien: duAnTuongTac?.ten_du_an || null
    });

    setNoiDungCheckIn('');
    setCoHenLich(false);
    setNgayHenLich('');
    setGioHenLich('09:00');
    setDiaDiemHen('');
    setGiaiDoanDuAnChon('');
    setLinkDinhKemCheckIn('');
    setTenTaiLieuCheckIn('');
    setMoLinkCheckIn(false);

    // Nếu nhiệm vụ chung (không gắn cố định KH/DA), tự động reset đối tượng chọn sau khi ghi xong để gọi tiếp KH thứ 2, 3...
    if (!daCoDinh && !khCoDinh && doiTuongChon) {
      setDoiTuongThucThiMap((prev) => ({
        ...prev,
        [viecDangChon.id]: { khachHang: null, duAn: null, nguoiLienHe: null }
      }));
    }
  };

  // Sửa / Xóa 1 dòng kết quả trong lịch sử
  const xuLyLuuSuaKetQuaInline = (item: ItemKeHoachTuan) => {
    if (!dangSuaKetQua || dangSuaKetQua.itemId !== item.id) return;
    const text = dangSuaKetQua.noiDung.trim();
    if (!text) return;

    const dsMoi = (item.danh_sach_ket_qua ?? []).map((k) =>
      k.id === dangSuaKetQua.kqId
        ? { ...k, noi_dung: text, ngay_chinh_sua_gan_nhat: new Date().toISOString() }
        : k
    );
    const daXong = Boolean(
      item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay'
    );

    onCapNhatTienDoInline(item.id, {
      danh_sach_ket_qua: dsMoi,
      ket_qua_thuc_te: dsMoi[0]?.noi_dung || '',
      da_hoan_thanh: daXong
    });
    setDangSuaKetQua(null);
  };

  const xuLyXoaKetQuaInline = (item: ItemKeHoachTuan, kqId: string) => {
    if (!confirm('Xóa dòng kết quả tương tác này?')) return;
    const dsMoi = (item.danh_sach_ket_qua ?? []).filter((k) => k.id !== kqId);
    const daXong = Boolean(
      item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay'
    );

    onCapNhatTienDoInline(item.id, {
      danh_sach_ket_qua: dsMoi,
      ket_qua_thuc_te: dsMoi[0]?.noi_dung || '',
      da_hoan_thanh: daXong
    });
  };


  // Modal Form Đa Năng (Nhập nhiều kiểu công việc khi bấm vào lịch)
  const [moFormDaNang, setMoFormDaNang] = useState(false);
  const [ngayChonChoForm, setNgayChonChoForm] = useState(homNayISO);
  const [kieuKhoiTaoForm, setKieuKhoiTaoForm] = useState<KieuCongViec>('goi_dien');

  const moFormThemCongViec = (ngayTarget?: string, kieu: KieuCongViec = 'goi_dien') => {
    const ngayDung = ngayTarget || ngayChon || homNayISO;
    setNgayChonChoForm(ngayDung);
    setKieuKhoiTaoForm(kieu);
    setMoFormDaNang(true);
  };

  const xuLyLuuGoiDienTuModal = async (item: ItemKeHoachTuan) => {
    onThemNhanh(item);
    if (item.da_hoan_thanh && item.noi_dung_tuan) {
      const nvId = nhanVienId || nguoiDungHienTai?.id;
      if (nvId) {
        void ghiNhanCheckInVaoBaoCaoNgay({
          nhanVienId: nvId,
          chiNhanhId: (nguoiDungHienTai as any)?.chi_nhanh_id || null,
          phongBanId: (nguoiDungHienTai as any)?.phong_ban_id || null,
          ngayBaoCao: item.ngay_du_kien || homNayISO,
          duAnId: item.du_an_id || null,
          tenKhachHangDuAn: item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || 'Cuộc gọi khách hàng',
          noiDungKetQua: item.ket_qua_thuc_te || item.noi_dung_tuan,
          nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: nvId }
        });
      }
    }
  };

  const xuLyLuuLichGapTuModal = async (dto: TaoMoiLichGapDTO) => {
    const lichMoi = await taoLichGapKHMoi(dto);
    void dongBoLichGapSangKeHoachTuanVaBaoCaoNgay({
      lich: lichMoi,
      nguoiThucHien: nguoiDungHienTai
    });
  };

  const xuLyLuuTienDoDuAnTuModal = async (params: {
    duAnId: string;
    giaiDoanMoi: string;
    noiDung: string;
    linkTaiLieu?: string | null;
    ngay: string;
  }) => {
    const da = mapDuAn.get(params.duAnId);
    const kh = da?.khach_hang_id ? mapKH.get(da.khach_hang_id) : null;
    const nvId = nhanVienId || nguoiDungHienTai?.id;

    if (da && params.giaiDoanMoi && da.giai_doan !== params.giaiDoanMoi) {
      void capNhatHoSoDuAn(
        { id: da.id, giai_doan: params.giaiDoanMoi as any },
        nguoiDungHienTai
      );
    }

    void taoTienDoDuAnMoi(
      {
        du_an_id: params.duAnId,
        tinh_hinh_hien_tai: params.noiDung,
        link_tai_lieu: params.linkTaiLieu || null,
        trang_thai_hanh_dong: 'da_hoan_thanh',
        nguoi_tao_id: nvId || null
      },
      da?.ten_du_an || null
    );

    const itemMoi: ItemKeHoachTuan = {
      id: `da_item_${Date.now()}`,
      hinh_thuc: 'khac',
      loai_hanh_dong: 'phat_sinh',
      khach_hang_id: da?.khach_hang_id || null,
      co_quan_doanh_nghiep: kh?.ten_khach_hang || null,
      du_an_id: da?.id || null,
      du_an_du_kien: da?.ten_du_an || null,
      ten_khach_hang_du_an: da?.ten_du_an || 'Dự án',
      hanh_dong_tuan: params.noiDung,
      noi_dung_tuan: params.noiDung,
      ket_qua_thuc_te: params.noiDung,
      dau_ra_cam_ket: params.noiDung,
      ngay_du_kien: params.ngay,
      cac_ngay_thuc_hien: [params.ngay],
      da_hoan_thanh: true,
      ngay_hoan_thanh: params.ngay,
      trang_thai_ket_qua: 'dat_muc_tieu',
      danh_sach_ket_qua: [
        {
          id: `kq_${Date.now()}`,
          ngay_ghi_nhan: params.ngay,
          noi_dung: params.noiDung,
          khach_hang_id: da?.khach_hang_id || null,
          ten_khach_hang: kh?.ten_khach_hang || null,
          du_an_id: da?.id || null,
          ten_du_an: da?.ten_du_an || null,
          giai_doan_du_an: params.giaiDoanMoi,
          link_dinh_kem: params.linkTaiLieu || null
        }
      ]
    };
    onThemNhanh(itemMoi);

    if (nvId) {
      void ghiNhanCheckInVaoBaoCaoNgay({
        nhanVienId: nvId,
        chiNhanhId: (nguoiDungHienTai as any)?.chi_nhanh_id || null,
        phongBanId: (nguoiDungHienTai as any)?.phong_ban_id || null,
        ngayBaoCao: params.ngay,
        duAnId: params.duAnId,
        tenKhachHangDuAn: da?.ten_du_an || 'Dự án',
        noiDungKetQua: params.noiDung,
        nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: nvId }
      });
    }
  };

  const xuLyLuuYeuCauPhoiHopTuModal = async (params: {
    duAnId: string;
    tenDuAn: string;
    khachHangId?: string | null;
    loaiYeuCau: string;
    noiDung: string;
    linkDriveDauVao?: string | null;
    hanHoanThanh?: string | null;
    ngay: string;
  }) => {
    const ycMoi = await taoYeuCauPhoiHopMoi(
      {
        du_an_id: params.duAnId,
        ten_du_an: params.tenDuAn,
        khach_hang_id: params.khachHangId || null,
        loai_yeu_cau: params.loaiYeuCau,
        noi_dung_yeu_cau: params.noiDung,
        link_drive_dau_vao: params.linkDriveDauVao || null,
        han_hoan_thanh: params.hanHoanThanh || null
      },
      nguoiDungHienTai
    );
    setDanhSachYeuCau((prev) => [ycMoi, ...prev.filter((x) => x.id !== ycMoi.id)]);

    const itemMoi: ItemKeHoachTuan = {
      id: `yc_${Date.now()}`,
      hinh_thuc: 'khac',
      loai_hanh_dong: 'phat_sinh',
      khach_hang_id: params.khachHangId || null,
      du_an_id: params.duAnId,
      du_an_du_kien: params.tenDuAn,
      ten_khach_hang_du_an: params.tenDuAn,
      hanh_dong_tuan: `[Yêu cầu]: ${params.noiDung}`,
      noi_dung_tuan: `[Yêu cầu]: ${params.noiDung}`,
      dau_ra_cam_ket: 'Hoàn tất yêu cầu phối hợp',
      ngay_du_kien: params.ngay,
      cac_ngay_thuc_hien: [params.ngay],
      da_hoan_thanh: false,
      trang_thai_ket_qua: 'dang_thuc_hien'
    };
    onThemNhanh(itemMoi);
  };

  return (
    <div className="space-y-4">
      {/* THANH ĐIỀU HƯỚNG TINH GỌN: CHẾ ĐỘ XEM, HỖ TRỢ, BÁO CÁO TUẦN & THÊM VIỆC */}
      <div className="rounded-2xl border border-border bg-card p-2.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Bộ chuyển View: [ 📅 Tuần | 📆 Tháng ] */}
          {onDoiCheDoXem && (
            <div className="inline-flex items-center rounded-xl bg-muted/70 p-1 text-xs font-semibold gap-1">
              <button
                type="button"
                onClick={() => onDoiCheDoXem('tuan')}
                className={cn(
                  'h-8 px-3 rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer',
                  cheDoXem === 'tuan'
                    ? 'bg-card text-foreground shadow-2xs font-bold border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Calendar className="size-3.5 text-blue-600" />
                <span>Tuần</span>
              </button>
              <button
                type="button"
                onClick={() => onDoiCheDoXem('thang')}
                className={cn(
                  'h-8 px-3 rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer',
                  cheDoXem === 'thang'
                    ? 'bg-card text-foreground shadow-2xs font-bold border border-border/70'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <CalendarClock className="size-3.5 text-emerald-600" />
                <span>Tháng</span>
              </button>
            </div>
          )}

          {/* 2. Nút chuyển xem Yêu cầu hỗ trợ */}
          <button
            type="button"
            onClick={() => setTabHienThi(tabHienThi === 'yeu_cau_ho_tro' ? 'lich_tuan' : 'yeu_cau_ho_tro')}
            className={cn(
              'h-8 px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer',
              tabHienThi === 'yeu_cau_ho_tro'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300'
                : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
            title="Xem và xử lý các yêu cầu phối hợp kỹ thuật / báo giá"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Yêu cầu hỗ trợ</span>
            {soYeuCauCanXuLy > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {soYeuCauCanXuLy}
              </span>
            )}
          </button>
        </div>

        {/* Cụm Thao tác Nhanh: [ 📊 Báo cáo tuần ] + [ + Thêm việc ] */}
        <div className="flex items-center gap-2 flex-wrap">
          {onMoBaoCaoTuan && (
            <button
              type="button"
              onClick={onMoBaoCaoTuan}
              className="h-8.5 px-3.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-2xs"
              title="Mở bảng tổng kết tự động và nộp báo cáo tuần"
            >
              <BarChart3 className="size-3.5 text-rose-600" />
              <span>Báo cáo tuần</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[10.5px] font-black',
                  (tyLeHoanThanh ?? 0) >= 80
                    ? 'bg-emerald-500/15 text-emerald-700'
                    : 'bg-amber-500/15 text-amber-700'
                )}
              >
                {tyLeHoanThanh ?? 0}%
              </span>
            </button>
          )}

          <a
            href="/bao-cao-tuan"
            className="h-8.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Mở Báo cáo tuần chuẩn VDCD & Xuất Excel"
          >
            <FileSpreadsheet className="size-3.5 text-rose-600" />
            <span>Báo cáo tuần &amp; Xuất Excel</span>
          </a>

          <button
            type="button"
            onClick={() => moFormThemCongViec(ngayChon, 'goi_dien')}
            className="h-8.5 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-primary/90 transition"
            title="Bấm vào để mở Form nhập công việc cho Lịch"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>+ Thêm việc</span>
          </button>

          {/* Ô Tìm nhanh Khách hàng / Dự án (Ctrl+K) */}
          <div ref={khungTimNhanhRef} className="relative sm:w-60">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputTimNhanhRef}
              type="text"
              value={tuKhoaTimNhanh}
              onFocus={() => setMoKetQuaTimNhanh(true)}
              onChange={(e) => {
                setTuKhoaTimNhanh(e.target.value);
                setMoKetQuaTimNhanh(true);
              }}
              placeholder="Tìm nhanh KH, DA (Ctrl+K)..."
              className="w-full h-8.5 rounded-xl border border-border bg-background pl-8 pr-7 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs"
            />
            {tuKhoaTimNhanh && (
              <button
                type="button"
                onClick={() => setTuKhoaTimNhanh('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}

            {moKetQuaTimNhanh && (
              <div className="absolute right-0 left-0 sm:left-auto sm:w-[380px] top-[calc(100%+6px)] z-50 rounded-2xl border border-border bg-card shadow-xl p-2.5 space-y-2 max-h-[380px] overflow-y-auto">
                {ketQuaTimNhanh.duAn.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground px-1">
                      Dự án
                    </div>
                    {ketQuaTimNhanh.duAn.map((da) => {
                      const kh = da.khach_hang_id ? mapKH.get(da.khach_hang_id) : null;
                      const gd = layCauHinhGiaiDoanTheoKey(da.giai_doan);
                      return (
                        <button
                          key={da.id}
                          type="button"
                          onClick={() => moHoSoDuAnNhanh(da)}
                          className="w-full text-left p-2 rounded-xl hover:bg-muted flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                              <FolderKanban className="size-3.5 text-primary shrink-0" />
                              <span className="truncate">{da.ten_du_an}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate pl-5">
                              {kh ? kh.ten_khach_hang : 'Chưa gắn KH'} · {gd.nhan_ngan}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {ketQuaTimNhanh.khachHang.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <div className="text-[10px] font-extrabold uppercase text-muted-foreground px-1">
                      Khách hàng
                    </div>
                    {ketQuaTimNhanh.khachHang.map((kh) => (
                      <button
                        key={kh.id}
                        type="button"
                        onClick={() => moHoSoKhachHangNhanh(kh)}
                        className="w-full text-left p-2 rounded-xl hover:bg-muted flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                            <Building2 className="size-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{kh.ten_khach_hang}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate pl-5">
                            {[kh.xa_phuong, kh.tinh_thanh].filter(Boolean).join(', ') ||
                              kh.so_dien_thoai ||
                              'Khách hàng'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      {tabHienThi === 'yeu_cau_ho_tro' ? (
        <HopYeuCauPhoiHop
          danhSachYeuCau={danhSachYeuCau}
          nguoiDungHienTai={nguoiDungHienTai}
          onXoaYeuCau={(ycId) => { setDanhSachYeuCau((prev) => prev.filter((x) => x.id !== ycId)); }}
          onCapNhatYeuCau={(ycCapNhat) => {
            setDanhSachYeuCau((prev) =>
              prev.map((x) => (x.id === ycCapNhat.id ? ycCapNhat : x))
            );
          }}
          onMoModalTaoYeuCau={() => {
            setDuAnChoYeuCau(duAnThemNhanh || null);
            setMoModalTaoYeuCau(true);
          }}
          onMoChiTietDuAn={(daId) => {
            const da = danhSachDuAn.find((d) => d.id === daId);
            if (da) {
              setHoSoThuGonState({ mo: true, cheDo: 'du_an', duAn: da, khachHang: null });
            }
          }}
        />
      ) : (
        <>
          {/* GIAO DIỆN LỊCH 7 CỘT (NHƯ LỊCH CÔNG TÁC, NGÀY HÔM NAY TO NHẤT) */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* DESKTOP: 7 CỘT ĐỀU NHAU CHUẨN MỰC (Hôm nay viền xanh nổi bật, không lệch cột) */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="min-w-[1080px] grid grid-cols-7 divide-x divide-border">
                {cacNgayTrongTuan.map((cotNgay) => {
                  const laHomNay = cotNgay.iso === homNayISO;
                  const dangChon = cotNgay.iso === ngayChon;
                  const tk = thongKeTungNgay.get(cotNgay.iso) || {
                    dsViec: [],
                    dsLich: [],
                    soViec: 0,
                    soViecXong: 0,
                    soLich: 0,
                    soLichXong: 0
                  };

                  return (
                    <div
                      key={cotNgay.iso}
                      onClick={() => onDoiNgayChon(cotNgay.iso)}
                      className={cn(
                        'flex flex-col min-h-[580px] transition-colors',
                        laHomNay
                          ? 'bg-emerald-500/[0.04] ring-2 ring-emerald-500/40 ring-inset z-10'
                          : dangChon
                          ? 'bg-primary/[0.02]'
                          : 'bg-card hover:bg-muted/15'
                      )}
                    >
                      {/* Header Cột: Thứ & Ngày */}
                      <div
                        className={cn(
                          'p-3 border-b border-border flex items-center justify-between gap-2',
                          laHomNay
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-muted/30'
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={cn(
                                'text-[11px] font-extrabold uppercase tracking-wider',
                                laHomNay ? 'text-emerald-700' : 'text-muted-foreground'
                              )}
                            >
                              {laHomNay ? cotNgay.thuDayDu : cotNgay.thuNgan}
                            </span>
                            {laHomNay && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                                HÔM NAY
                              </span>
                            )}
                          </div>

                          <div
                            className={cn(
                              'font-mono font-black mt-0.5',
                              laHomNay ? 'text-base text-emerald-950' : 'text-xs text-foreground'
                            )}
                          >
                            {cotNgay.ngayThang}
                          </div>

                          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            {tk.soLich} lịch • {tk.soViec} việc
                          </div>
                        </div>

                        {/* Nút bấm để hiện FORM đa năng cho ngày này */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDoiNgayChon(cotNgay.iso);
                            moFormThemCongViec(cotNgay.iso);
                          }}
                          className={cn(
                            'rounded-lg flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0',
                            laHomNay
                              ? 'h-8 px-2.5 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 gap-1'
                              : 'size-7 bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                          title={`Bấm để mở Form thêm công việc ngày ${cotNgay.thuNgan} (${cotNgay.ngayThang})`}
                        >
                          <Plus className={cn('stroke-[2.5]', laHomNay ? 'size-3.5' : 'size-3.5')} />
                          {laHomNay && <span>+ Thêm việc</span>}
                        </button>
                      </div>

                      {/* Thân Cột: Danh sách Thẻ Sự kiện & Công việc */}
                      <div
                        className="p-2 space-y-2 flex-1 overflow-y-auto cursor-pointer"
                        onDoubleClick={() => moFormThemCongViec(cotNgay.iso)}
                      >
                        {/* 1. LỊCH CÔNG TÁC / GẶP KHÁCH HÀNG */}
                        {tk.dsLich.map((lich) => {
                          const daXong = lich.trang_thai === 'da_hoan_thanh';
                          const laChoDuyet = lich.trang_thai === 'cho_duyet';
                          const laDaDuyet = lich.trang_thai === 'da_duyet';
                          const laPhatSinh = Boolean(lich.la_phat_sinh);

                          return (
                            <div
                              key={`cal_lich_${lich.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLichHenDangBaoCao(lich);
                                setNoiDungBaoCaoLichHen(lich.ket_qua || '');
                              }}
                              className={cn(
                                'p-2 rounded-xl border text-xs space-y-1.5 transition cursor-pointer shadow-2xs hover:shadow-xs',
                                daXong
                                  ? 'bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-950'
                                  : laChoDuyet
                                  ? 'bg-amber-500/[0.08] border-amber-500/35 text-amber-950'
                                  : 'bg-blue-500/[0.06] border-blue-500/25 text-blue-950'
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-extrabold text-blue-800 flex items-center gap-1">
                                  <Car className="size-3 text-blue-600" />
                                  <span>{lich.gio_bat_dau} - {lich.gio_ket_thuc}</span>
                                </span>
                                <span
                                  className={cn(
                                    'px-1.5 py-0.2 rounded text-[9px] font-bold',
                                    daXong
                                      ? 'bg-emerald-600 text-white'
                                      : laChoDuyet
                                      ? 'bg-amber-600 text-white'
                                      : laDaDuyet
                                      ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                                      : 'bg-blue-600 text-white'
                                  )}
                                >
                                  {daXong ? 'Đã xong' : laChoDuyet ? 'Chờ duyệt' : laDaDuyet ? 'Đã duyệt' : 'Sắp tới'}
                                </span>
                              </div>

                              <div className="font-bold text-xs text-foreground line-clamp-2">
                                {lich.ten_khach_hang || lich.tieu_de}
                              </div>

                              {lich.dia_diem && (
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                                  <MapPin className="size-2.5 text-rose-500 shrink-0" />
                                  <span className="truncate">{lich.dia_diem}</span>
                                </div>
                              )}

                              {/* Nút hành động nhanh trên thẻ lịch */}
                              <div className="pt-1 border-t border-border/50 flex items-center justify-between gap-1 flex-wrap">
                                {(laChoDuyet || laPhatSinh) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      xuLyXinDuyetZaloLich(lich);
                                    }}
                                    className="text-[10px] font-bold text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 transition"
                                    title="Gửi Zalo xin duyệt"
                                  >
                                    <Share2 className="size-2.5 text-blue-600" />
                                    <span>{dangChiaSeZaloId === lich.id ? 'Đang gửi...' : 'Zalo duyệt'}</span>
                                  </button>
                                )}
                                {!daXong && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLichHenDangBaoCao(lich);
                                      setNoiDungBaoCaoLichHen('');
                                    }}
                                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer ml-auto flex items-center gap-0.5"
                                  >
                                    <span>Báo cáo KQ</span>
                                    <ArrowRight className="size-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* 2. CÔNG VIỆC / CUỘC GỌI / DỰ ÁN */}
                        {tk.dsViec.map((item) => {
                          const daXong = Boolean(item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay');
                          const isCall = item.hinh_thuc === 'goi_dien';
                          const isDuAn = Boolean(item.du_an_id);

                          return (
                            <div
                              key={`cal_task_${item.id}`}
                              className={cn(
                                'p-2 rounded-xl border text-xs space-y-1 transition bg-card shadow-2xs hover:border-primary/50',
                                daXong && 'bg-muted/20 opacity-75'
                              )}
                            >
                              <div className="flex items-start gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDoiNhanhHoanThanh(item.id, !daXong);
                                  }}
                                  className="cursor-pointer shrink-0 mt-0.5 text-muted-foreground hover:text-emerald-600 transition"
                                  title={daXong ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                                >
                                  {daXong ? (
                                    <CheckCircle2 className="size-3.5 text-emerald-600 fill-emerald-100" />
                                  ) : (
                                    <Circle className="size-3.5" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                    {isCall ? (
                                      <span className="flex items-center gap-0.5 text-blue-600">
                                        <Phone className="size-2.5" /> Gọi điện
                                      </span>
                                    ) : isDuAn ? (
                                      <span className="flex items-center gap-0.5 text-indigo-600">
                                        <FolderKanban className="size-2.5" /> Dự án
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-0.5 text-slate-600">
                                        <Check className="size-2.5" /> Việc tuần
                                      </span>
                                    )}
                                  </div>
                                  <div className={cn('text-xs font-medium text-foreground line-clamp-3 mt-0.5', daXong && 'line-through text-muted-foreground')}>
                                    {renderDongNoiDung1Dong(item)}
                                  </div>
                                </div>

                                {laSuaDuoc && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onXoaCongViec(item.id);
                                    }}
                                    className="size-5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 flex items-center justify-center cursor-pointer transition shrink-0"
                                    title="Xóa việc"
                                  >
                                    <Trash2 className="size-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Trạng thái trống khi chưa có việc gì trong ngày */}
                        {tk.soLich === 0 && tk.soViec === 0 && (
                          <div className="py-8 text-center text-xs text-muted-foreground/50 space-y-1 select-none">
                            <p>Trống</p>
                            <p className="text-[10px] text-muted-foreground/40">Bấm để thêm việc</p>
                          </div>
                        )}
                      </div>

                      {/* Footer Cột: Nút Thêm Nhanh ở chân cột */}
                      <div className="p-2 border-t border-border/60 bg-muted/15">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDoiNgayChon(cotNgay.iso);
                            moFormThemCongViec(cotNgay.iso);
                          }}
                          className="w-full h-7 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground border border-border/80 text-[11px] font-bold text-muted-foreground flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <Plus className="size-3" />
                          <span>+ Thêm việc</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MOBILE: LỊCH 7 NGÀY - Thanh chọn ngày cuộn + Danh sách thẻ dọc */}
            <div className="sm:hidden p-3 space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {cacNgayTrongTuan.map((n) => {
                  const dangChon = n.iso === ngayChon;
                  const laHomNay = n.iso === homNayISO;
                  const tk = thongKeTungNgay.get(n.iso) || { soViec: 0, soLich: 0 };

                  return (
                    <button
                      key={n.iso}
                      type="button"
                      onClick={() => onDoiNgayChon(n.iso)}
                      className={cn(
                        'py-2 px-3 rounded-xl border flex flex-col items-center gap-0.5 shrink-0 transition select-none',
                        dangChon
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                          : laHomNay
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 font-bold'
                          : 'bg-card border-border text-muted-foreground'
                      )}
                    >
                      <span className="text-[10px] uppercase">{n.thuNgan}</span>
                      <span className="text-xs font-mono font-bold">{n.ngayThang}</span>
                      {(tk.soLich > 0 || tk.soViec > 0) && (
                        <span className="text-[9px] px-1 rounded bg-black/10 mt-0.5">
                          {tk.soLich + tk.soViec}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Nút Thêm công việc Mobile */}
              <button
                type="button"
                onClick={() => moFormThemCongViec(ngayChon)}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ Thêm công việc ngày {dinhDangNgayNgan(ngayChon)}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL FORM TÁC NGHIỆP ĐA NĂNG (BẬT LÊN KHI BẤM VÀO LỊCH ĐỂ NHẬP NHIỀU KIỂU VIỆC) */}
      <ModalFormCongViecDaNang
        mo={moFormDaNang}
        onDong={() => setMoFormDaNang(false)}
        ngayMacDinh={ngayChonChoForm}
        kieuKhoiTao={kieuKhoiTaoForm}
        danhSachKhachHang={danhSachKhachHang}
        danhSachDuAn={danhSachDuAn}
        danhSachNguoiLienHe={danhSachNguoiLienHe}
        nguoiDungHienTai={nguoiDungHienTai}
        nhanVienId={nhanVienId}
        onLuuGoiDien={xuLyLuuGoiDienTuModal}
        onLuuLichGap={xuLyLuuLichGapTuModal}
        onLuuTienDoDuAn={xuLyLuuTienDoDuAnTuModal}
        onLuuYeuCauPhoiHop={xuLyLuuYeuCauPhoiHopTuModal}
      />
      {/* ================================================================= */}
      {/* DRAWER HỒ SƠ THU GỌN (XEM & TƯƠNG TÁC KHÁCH HÀNG / DỰ ÁN TẠI CHỖ) */}
      {/* ================================================================= */}
      <ModalTaoYeuCauPhoiHop
        mo={moModalTaoYeuCau}
        onDong={() => setMoModalTaoYeuCau(false)}
        duAnMacDinh={duAnChoYeuCau}
        danhSachDuAn={danhSachDuAn}
        noiDungGoiY={noiDungThemHomNay.trim()}
        nguoiDungHienTai={nguoiDungHienTai}
        onTaoThanhCong={(ycMoi) => {
          setDanhSachYeuCau((prev) => [ycMoi, ...prev.filter((x) => x.id !== ycMoi.id)]);
          // Tự động bổ sung vào danh sách công việc hôm nay của Sale để tiện theo dõi
          const idMoi = `tuan_yc_${Date.now()}`;
          const tieuDeViec = `[Yêu cầu]: ${ycMoi.noi_dung_yeu_cau}`;
          const itemMoi: ItemKeHoachTuan = {
            id: idMoi,
            loai_hanh_dong: 'phat_sinh',
            hinh_thuc: 'khac',
            khach_hang_id: ycMoi.khach_hang_id || null,
            co_quan_doanh_nghiep: ycMoi.ten_khach_hang || null,
            du_an_id: ycMoi.du_an_id,
            du_an_du_kien: ycMoi.ten_du_an,
            ten_khach_hang_du_an: ycMoi.ten_du_an,
            hanh_dong_tuan: tieuDeViec,
            noi_dung_tuan: tieuDeViec,
            ket_qua_mong_muon: 'Hoàn tất yêu cầu phối hợp',
            dau_ra_cam_ket: 'Hoàn tất yêu cầu phối hợp',
            ngay_du_kien: ngayChon,
            cac_ngay_thuc_hien: [ngayChon],
            da_hoan_thanh: false,
            trang_thai_ket_qua: 'dang_thuc_hien'
          };
          onThemNhanh(itemMoi);
        }}
      />

      <DrawerHoSoThuGon
        mo={hoSoThuGonState.mo}
        onDong={() => setHoSoThuGonState((prev) => ({ ...prev, mo: false }))}
        cheDo={hoSoThuGonState.cheDo}
        duAn={hoSoThuGonState.duAn}
        khachHang={hoSoThuGonState.khachHang}
        danhSachDuAn={danhSachDuAn}
        danhSachKhachHang={danhSachKhachHang}
        nguoiDungHienTai={nguoiDungHienTai}
        laSuaDuoc={laSuaDuoc}
        onChonDuAn={(da) =>
          setHoSoThuGonState((prev) => ({ ...prev, cheDo: 'du_an', duAn: da }))
        }
        onChonKhachHang={(kh) =>
          setHoSoThuGonState((prev) => ({
            ...prev,
            cheDo: 'khach_hang',
            khachHang: kh
          }))
        }
        onMoSuaDuAn={(da) => {
          setHoSoThuGonState((prev) => ({ ...prev, mo: false }));
          onMoSuaDuAn?.(da);
        }}
        onMoSuaKhachHang={(kh) => {
          setHoSoThuGonState((prev) => ({ ...prev, mo: false }));
          onMoSuaKhachHang?.(kh);
        }}
        onMoTaoDuAnChoKH={(kh) => {
          setHoSoThuGonState((prev) => ({ ...prev, mo: false }));
          onMoTaoDuAnChoKH?.(kh, viecDangChon);
        }}
        onMoTaoLichHen={(goiY) => {
          setHoSoThuGonState((prev) => ({ ...prev, mo: false }));
          onMoTaoLichHenGoiY?.(goiY, viecDangChon);
        }}
        onDuaVaoViecHomNay={({ duAn, khachHang, goiYHanhDong }) => {
          setHoSoThuGonState((prev) => ({ ...prev, mo: false }));
          const idMoi = `tuan_${Date.now()}`;
          const tenKH =
            khachHang?.ten_khach_hang ||
            (duAn?.khach_hang_id
              ? mapKH.get(duAn.khach_hang_id)?.ten_khach_hang
              : undefined) ||
            duAn?.ten_du_an ||
            'Công việc mới';
          const hanhDong =
            goiYHanhDong ||
            (duAn
              ? `Tương tác & cập nhật tiến độ dự án: ${duAn.ten_du_an}`
              : `Liên hệ chăm sóc khách hàng: ${tenKH}`);
          const itemMoi: ItemKeHoachTuan = {
            id: idMoi,
            loai_hanh_dong: 'phat_sinh',
            hinh_thuc: 'goi_dien',
            ten_khach_hang_du_an: tenKH,
            co_quan_doanh_nghiep: khachHang?.ten_khach_hang || null,
            khach_hang_id: khachHang?.id || duAn?.khach_hang_id || null,
            du_an_id: duAn?.id || null,
            du_an_du_kien: duAn?.ten_du_an || null,
            hanh_dong_tuan: hanhDong,
            noi_dung_tuan: hanhDong,
            ket_qua_mong_muon: hanhDong,
            dau_ra_cam_ket: hanhDong,
            ngay_du_kien: ngayChon,
            cac_ngay_thuc_hien: [ngayChon],
            da_hoan_thanh: false,
            danh_sach_ket_qua: []
          };
          onThemNhanh(itemMoi);
          setViecDangChonId(idMoi);
        }}
        onDaCapNhatTienDoDuAn={onDaCapNhatTienDoTuHoSoThuGon}
        onDaThayDoiNguoiLienHe={onTaiLaiNguoiLienHe}
      />

      {khachHangDangTacNghiep && (
        <ModalNguoiLienHe
          mo={moModalThemLienHe}
          onDong={() => setMoModalThemLienHe(false)}
          khachHangId={khachHangDangTacNghiep.id}
          tenKhachHang={khachHangDangTacNghiep.ten_khach_hang}
          nguoiDungHienTai={nguoiDungHienTai}
          onLuuThanhCong={() => {
            taiDanhSachNguoiLienHe({ khach_hang_id: khachHangDangTacNghiep.id })
              .then((res) => {
                const mang = res.mang || [];
                setDsLienHeBoSung(mang);
                if (mang[0] && viecDangChon) {
                  setDoiTuongThucThiMap((prev) => ({
                    ...prev,
                    [viecDangChon.id]: {
                      khachHang:
                        prev[viecDangChon.id]?.khachHang ?? khachHangDangTacNghiep,
                      duAn: prev[viecDangChon.id]?.duAn ?? duAnDangTacNghiep,
                      nguoiLienHe: mang[0]
                    }
                  }));
                }
              })
              .catch(() => {});
            onTaiLaiNguoiLienHe?.();
          }}
        />
      )}

      {/* Modal Báo cáo kết quả lịch hẹn quá hạn / hôm nay */}
      {lichHenDangBaoCao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Báo cáo kết quả cuộc gặp
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {lichHenDangBaoCao.ten_khach_hang || lichHenDangBaoCao.tieu_de}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lịch hẹn ngày {lichHenDangBaoCao.ngay} ({lichHenDangBaoCao.gio_bat_dau} - {lichHenDangBaoCao.gio_ket_thuc})
                  {lichHenDangBaoCao.ten_nguoi_lien_he ? ` • Gặp ${lichHenDangBaoCao.ten_nguoi_lien_he}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLichHenDangBaoCao(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Kết quả / Diễn biến cuộc gặp thực tế:
              </label>
              <textarea
                value={noiDungBaoCaoLichHen}
                onChange={(e) => setNoiDungBaoCaoLichHen(e.target.value)}
                placeholder="Ví dụ: Đã gặp anh Nam PCT xã, thống nhất tuần sau ký duyệt phương án và gửi tờ trình..."
                className="w-full h-28 rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-hidden focus:border-primary resize-none"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                * Kết quả này sẽ tự động được ghi nhận vào Báo cáo công việc hôm nay và hồ sơ Khách hàng/Dự án.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
              <button
                type="button"
                onClick={() => setLichHenDangBaoCao(null)}
                className="h-9 px-3.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!noiDungBaoCaoLichHen.trim() || dangLuuBaoCaoLichHen}
                onClick={xuLyLuuBaoCaoLichHen}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {dangLuuBaoCaoLichHen ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Lưu & Hoàn thành</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
