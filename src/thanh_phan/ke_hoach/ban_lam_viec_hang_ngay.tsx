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
  BellRing,
  Flame,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  Loader2
} from 'lucide-react';
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
import { taoLichGapKHMoi, capNhatLichGapKH } from '../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
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

  // Mở rộng/thu gọn Banner nhắc việc thông minh
  const [moRongCanhBao, setMoRongCanhBao] = useState(true);

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
      if (nhanVienId && l.nguoi_phu_trach_id !== nhanVienId) return false;
      return true;
    });
  }, [danhSachLichGap, ngayChon, nhanVienId]);

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

  // Danh sách lịch hẹn đã đến hoặc quá ngày hẹn nhưng chưa có kết quả (cần báo cáo ngay)
  const dsLichHenCanBaoCao = useMemo(() => {
    return danhSachLichGap.filter((l) => {
      if (nhanVienId && l.nguoi_phu_trach_id !== nhanVienId) return false;
      return l.ngay <= homNayISO && l.trang_thai === 'sap_toi';
    });
  }, [danhSachLichGap, homNayISO, nhanVienId]);

  // Danh sách dự án đang theo dõi nhưng >= 7 ngày chưa có tương tác / cập nhật mới
  const dsDuAnDongBang = useMemo(() => {
    return danhSachDuAn
      .filter((d) => {
        if (d.trang_thai === 'da_xoa') return false;
        if (['hoan_thanh', 'tam_dung', 'huy'].includes(String(d.giai_doan))) return false;
        if (nhanVienId && d.nguoi_phu_trach_id !== nhanVienId && d.nguoi_quan_ly_id !== nhanVienId) {
          return false;
        }
        const ngayCu = (d.ngay_cap_nhat || d.ngay_tao || '').slice(0, 10);
        if (!ngayCu) return false;
        const diff = Math.floor(
          (new Date(`${homNayISO}T00:00:00`).getTime() - new Date(`${ngayCu}T00:00:00`).getTime()) /
            86400000
        );
        return diff >= 7;
      })
      .map((d) => {
        const ngayCu = (d.ngay_cap_nhat || d.ngay_tao || '').slice(0, 10);
        const soNgay = Math.floor(
          (new Date(`${homNayISO}T00:00:00`).getTime() - new Date(`${ngayCu}T00:00:00`).getTime()) /
            86400000
        );
        return {
          id: d.id,
          tieu_de: `Dự án ${soNgay} ngày chưa tương tác: ${d.ten_du_an}`,
          noi_dung: `Giai đoạn "${d.giai_doan}", ${soNgay} ngày qua chưa có cập nhật tiến độ mới.`,
          du_an_id: d.id,
          soNgay
        };
      });
  }, [danhSachDuAn, nhanVienId, homNayISO]);

  const tongSoNhacNho = dsLichHenCanBaoCao.length + dsDuAnDongBang.length;

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

  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* THANH LỊCH 7 NGÀY TRONG TUẦN + TÌM NHANH KH/DỰ ÁN + TRỢ LÝ AI      */}
      {/* ================================================================= */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Dải lịch 7 ngày thiết kế cân đối */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="grid grid-cols-7 gap-1.5 flex-1 min-w-0">
              {cacNgayTrongTuan.map((n) => {
                const dangChon = n.iso === ngayChon;
                const laHomNay = n.iso === homNayISO;
                const dsViecTrongNgay = ds.filter((v) => kiemTraViecThuocNgay(v, n.iso));
                const soViec = dsViecTrongNgay.length;
                const soXong = dsViecTrongNgay.filter(
                  (v) => v.da_hoan_thanh || (v as any).trang_thai_vat_chung === 'da_lay'
                ).length;
                const hoanTatHet = soViec > 0 && soXong === soViec;

                return (
                  <button
                    key={n.iso}
                    type="button"
                    onClick={() => onDoiNgayChon(n.iso)}
                    className={cn(
                      'relative py-2 px-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none',
                      dangChon
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : laHomNay
                        ? 'bg-primary/5 border-primary/40 text-foreground hover:bg-primary/10'
                        : 'bg-muted/25 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          'text-[11px] uppercase tracking-wider',
                          dangChon
                            ? 'font-extrabold text-primary-foreground'
                            : laHomNay
                            ? 'font-extrabold text-primary'
                            : 'font-bold text-muted-foreground'
                        )}
                      >
                        {n.thuNgan}
                      </span>
                      {laHomNay && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            dangChon ? 'bg-white' : 'bg-primary'
                          )}
                          title="Hôm nay"
                        />
                      )}
                    </div>

                    <span
                      className={cn(
                        'text-xs font-mono',
                        dangChon
                          ? 'font-extrabold text-primary-foreground'
                          : 'font-bold text-foreground'
                      )}
                    >
                      {n.ngayThang}
                    </span>

                    <div className="h-4 flex items-center justify-center mt-0.5">
                      {soViec > 0 ? (
                        <span
                          className={cn(
                            'px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold leading-tight',
                            dangChon
                              ? 'bg-white/20 text-white'
                              : hoanTatHet
                              ? 'bg-emerald-500/15 text-emerald-700'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {soXong}/{soViec}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'text-[10px]',
                            dangChon ? 'text-primary-foreground/50' : 'text-muted-foreground/40'
                          )}
                        >
                          —
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {ngayChon !== homNayISO && (
              <button
                type="button"
                onClick={() => onDoiNgayChon(homNayISO)}
                className="h-14 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-extrabold shrink-0 hover:bg-primary/20 cursor-pointer"
              >
                Hôm nay
              </button>
            )}
          </div>

          {/* Ô Tìm nhanh Khách hàng / Dự án + Trợ lý AI */}
          <div className="flex items-center gap-2">
            <div ref={khungTimNhanhRef} className="relative flex-1 sm:w-64">
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
                placeholder="Tìm nhanh KH, Dự án (Ctrl+K)..."
                className="w-full h-9 rounded-xl border border-border bg-background pl-8.5 pr-7 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
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
      </div>

      {/* ================================================================= */}
      {/* TRUNG TÂM NHẮC VIỆC & CẢNH BÁO TÁC NGHIỆP TRỰC DIỆN (LỊCH HẸN CHỜ BÁO CÁO, DỰ ÁN ĐÓNG BĂNG) */}
      {/* ================================================================= */}
      {tongSoNhacNho > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 rounded-xl bg-amber-500/20 text-amber-700 items-center justify-center shrink-0">
                <BellRing className="size-4 animate-pulse" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Nhắc việc & Cảnh báo tác nghiệp</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                    {tongSoNhacNho}
                  </span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Các cuộc hẹn cần báo cáo kết quả và dự án cần đẩy nhanh tiến độ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMoRongCanhBao(!moRongCanhBao)}
              className="text-xs text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer flex items-center gap-1 font-medium"
            >
              <span>{moRongCanhBao ? 'Thu gọn' : 'Xem chi tiết'}</span>
              {moRongCanhBao ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          </div>

          {moRongCanhBao && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {/* 1. Lịch hẹn quá hạn cần báo cáo kết quả */}
              {dsLichHenCanBaoCao.map((lich) => (
                <div
                  key={`warn_lich_${lich.id}`}
                  className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0">
                        Chờ báo cáo
                      </span>
                      <span className="text-xs font-bold text-rose-950 truncate">
                        {lich.ten_khach_hang || lich.tieu_de}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-900/80 line-clamp-1">
                      Hẹn ngày {lich.ngay} ({lich.gio_bat_dau}) {lich.ten_nguoi_lien_he ? `• Gặp ${lich.ten_nguoi_lien_he}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLichHenDangBaoCao(lich);
                      setNoiDungBaoCaoLichHen('');
                    }}
                    className="h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1"
                  >
                    <span>Báo cáo KQ</span>
                  </button>
                </div>
              ))}

              {/* 2. Dự án đóng băng / lâu chưa cập nhật */}
              {dsDuAnDongBang.map((c) => (
                <div
                  key={`warn_radar_${c.id}`}
                  className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.06] flex items-start justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                        Dự án im ắng
                      </span>
                      <span className="text-xs font-bold text-indigo-950 truncate">
                        {c.tieu_de}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-900/80 line-clamp-1">
                      {c.noi_dung}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {c.du_an_id && mapDuAn.get(c.du_an_id) && (
                      <button
                        type="button"
                        onClick={() => {
                          const da = mapDuAn.get(c.du_an_id!);
                          if (da) {
                            setDuAnThemNhanh(da);
                            if (da.khach_hang_id) {
                              setKhachHangThemNhanh(mapKH.get(da.khach_hang_id) || null);
                            }
                            setNoiDungThemHomNay(`Liên hệ thúc đẩy dự án ${da.ten_du_an}`);
                          }
                        }}
                        className="h-7 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs transition"
                        title="Đưa dự án này vào việc hôm nay"
                      >
                        + Việc hôm nay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* HỘP VIỆC CẦN XỬ LÝ / YÊU CẦU PHỐI HỢP LIÊN PHÒNG BAN              */}
      {/* ================================================================= */}
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

      {/* ================================================================= */}
      {/* VIỆC HÔM NAY — TẤT CẢ THAO TÁC NẰM TẠI ĐÂY                      */}
      {/* ================================================================= */}
      <div className="w-full">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            {/* Header Việc hôm nay + Ô thêm nhanh */}
            <div className="p-4 border-b border-border bg-muted/15 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-foreground">
                    Việc ngày {dinhDangNgayNgan(ngayChon)}
                  </h2>
                  {ngayChon === homNayISO && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 text-[11px] font-bold">
                      Hôm nay
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {dsViecNgayChon.length} công việc
                </span>
              </div>

              {laSuaDuoc && (
                <div className="space-y-2">
                  {/* Hàng ô nhập chính + Dropdown Mention @ / # */}
                  <div className="flex items-center gap-2">
                    <div ref={khungMentionRef} className="relative flex-1">
                      <input
                        ref={inputThemHomNayRef}
                        type="text"
                        value={noiDungThemHomNay}
                        onChange={xuLyThayDoiNoiDungThem}
                        onKeyDown={(e) => {
                          if (trangThaiMention.mo && danhSachGoiYMention.length > 0) {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setChiSoHighlightMention((prev) => (prev + 1) % danhSachGoiYMention.length);
                              return;
                            }
                            if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setChiSoHighlightMention((prev) => (prev - 1 + danhSachGoiYMention.length) % danhSachGoiYMention.length);
                              return;
                            }
                            if (e.key === 'Enter' || e.key === 'Tab') {
                              e.preventDefault();
                              const mucDangChon = danhSachGoiYMention[chiSoHighlightMention];
                              if (mucDangChon) {
                                chonMucMention(mucDangChon);
                              }
                              return;
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setTrangThaiMention({ mo: false, kyTuKichHoat: null, viTriBatDau: -1, tuKhoa: '' });
                              return;
                            }
                          }

                          if (e.key === 'Enter') {
                            e.preventDefault();
                            xuLyThemNhanhHomNay();
                          }
                        }}
                        placeholder="+ Nhập kết quả công việc hôm nay (gõ @ gắn Người/Xã, # gắn Dự án) rồi nhấn Enter..."
                        className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary shadow-2xs"
                      />

                      {/* Dropdown Gợi ý Mention @ và # */}
                      {trangThaiMention.mo && (
                        <div className="absolute left-0 top-full mt-1.5 w-full max-w-lg z-50 rounded-2xl border border-border bg-popover/95 backdrop-blur-md shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground flex items-center justify-between border-b border-border/50">
                            <span className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-bold">
                                {trangThaiMention.kyTuKichHoat}
                              </span>
                              {trangThaiMention.kyTuKichHoat === '@'
                                ? 'Gợi ý Người liên hệ & Khách hàng/Xã'
                                : 'Gợi ý Dự án'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80 font-normal">
                              ↑ ↓ chọn • Enter chốt • Esc hủy
                            </span>
                          </div>

                          {danhSachGoiYMention.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground">
                              Không tìm thấy kết quả phù hợp {trangThaiMention.tuKhoa ? `với "${trangThaiMention.tuKhoa}"` : ''}
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-y-auto space-y-0.5">
                              {danhSachGoiYMention.map((item, idx) => {
                                const isHighlight = idx === chiSoHighlightMention;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onMouseEnter={() => setChiSoHighlightMention(idx)}
                                    onClick={() => chonMucMention(item)}
                                    className={cn(
                                      'w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2.5 cursor-pointer',
                                      isHighlight
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-muted/60 text-foreground'
                                    )}
                                  >
                                    <div className="size-7 rounded-lg flex items-center justify-center shrink-0 text-xs bg-muted/80">
                                      {item.loai === 'nguoi_lien_he' ? (
                                        <Users className="size-3.5 text-emerald-600" />
                                      ) : item.loai === 'khach_hang' ? (
                                        <Building2 className="size-3.5 text-amber-600" />
                                      ) : (
                                        <FolderKanban className="size-3.5 text-indigo-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                        <span className="truncate">{item.tieuDe}</span>
                                        {item.badge && (
                                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground shrink-0">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.phuDe && (
                                        <div className="text-[11px] text-muted-foreground truncate">
                                          {item.phuDe}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Nút gắn KH / Dự án trước khi thêm */}
                    <button
                      type="button"
                      onClick={() => setMoChonDoiTuongThemNhanh(!moChonDoiTuongThemNhanh)}
                      className={cn(
                        'h-9 px-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0',
                        khachHangThemNhanh || duAnThemNhanh
                          ? 'border-emerald-500/40 bg-emerald-50 text-emerald-800'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                      title="Gắn Khách hàng hoặc Dự án cho công việc"
                    >
                      {khachHangThemNhanh ? (
                        <>
                          <Building2 className="size-3.5 text-emerald-600" />
                          <span className="truncate max-w-[130px] font-semibold">{khachHangThemNhanh.ten_khach_hang}</span>
                        </>
                      ) : duAnThemNhanh ? (
                        <>
                          <FolderKanban className="size-3.5 text-indigo-600" />
                          <span className="truncate max-w-[130px] font-semibold">{duAnThemNhanh.ten_du_an}</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <span className="hidden sm:inline">+ Gắn KH / Dự án</span>
                        </>
                      )}
                    </button>

                    {/* Nút Đặt lịch hẹn mở trực tiếp FormLichGapModal */}
                    <button
                      type="button"
                      onClick={() => {
                        const kh =
                          khachHangThemNhanh ||
                          (duAnThemNhanh?.khach_hang_id ? mapKH.get(duAnThemNhanh.khach_hang_id) : null);
                        onMoTaoLichHenGoiY?.({
                          khach_hang_id: kh?.id || null,
                          ten_khach_hang: kh?.ten_khach_hang || '',
                          nguoi_lien_he_id: nguoiLienHeThemNhanh?.id || null,
                          ten_nguoi_lien_he: nguoiLienHeThemNhanh?.ho_va_ten || null,
                          so_dien_thoai: nguoiLienHeThemNhanh?.so_dien_thoai || null,
                          noi_dung: noiDungThemHomNay.trim() || undefined,
                          dia_diem: kh?.dia_chi || undefined
                        });
                      }}
                      className="h-9 px-2.5 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Mở form đặt lịch hẹn gặp khách hàng"
                    >
                      <CalendarClock className="size-3.5 text-primary" />
                      <span className="hidden sm:inline">Đặt lịch hẹn</span>
                    </button>

                    {/* Nút Gửi yêu cầu phối hợp dự án */}
                    <button
                      type="button"
                      onClick={() => {
                        setDuAnChoYeuCau(duAnThemNhanh || null);
                        setMoModalTaoYeuCau(true);
                      }}
                      className="h-9 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Gửi yêu cầu phối hợp liên phòng ban cho dự án"
                    >
                      <Sparkles className="size-3.5 text-amber-600" />
                      <span>⚡ Yêu cầu phối hợp</span>
                    </button>

                    {noiDungThemHomNay.trim() && (
                      <button
                        type="button"
                        onClick={xuLyThemNhanhHomNay}
                        className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Check className="size-3.5" />
                        <span>Lưu kết quả</span>
                      </button>
                    )}
                  </div>

                  {/* Hiển thị các Chip đối tượng đã được gắn qua phím tắt @/# */}
                  {(khachHangThemNhanh || duAnThemNhanh || nguoiLienHeThemNhanh) && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium">Đã gắn:</span>
                      {khachHangThemNhanh && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 text-[11px] font-semibold border border-emerald-500/20">
                          <Building2 className="size-3 text-emerald-600" />
                          <span>{khachHangThemNhanh.ten_khach_hang}</span>
                          <button
                            type="button"
                            onClick={() => setKhachHangThemNhanh(null)}
                            className="hover:text-rose-600 ml-0.5 cursor-pointer"
                            title="Gỡ khách hàng"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      )}
                      {duAnThemNhanh && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-800 text-[11px] font-semibold border border-indigo-500/20">
                          <FolderKanban className="size-3 text-indigo-600" />
                          <span>{duAnThemNhanh.ten_du_an}</span>
                          <button
                            type="button"
                            onClick={() => setDuAnThemNhanh(null)}
                            className="hover:text-rose-600 ml-0.5 cursor-pointer"
                            title="Gỡ dự án"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      )}
                      {nguoiLienHeThemNhanh && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-800 text-[11px] font-semibold border border-sky-500/20">
                          <Users className="size-3 text-sky-600" />
                          <span>
                            {nguoiLienHeThemNhanh.ho_va_ten}
                            {nguoiLienHeThemNhanh.chuc_vu ? ` (${nguoiLienHeThemNhanh.chuc_vu})` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setNguoiLienHeThemNhanh(null)}
                            className="hover:text-rose-600 ml-0.5 cursor-pointer"
                            title="Gỡ người liên hệ"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Gợi ý danh sách Người liên hệ khi đã gắn Khách hàng/Xã */}
                  {khachHangThemNhanh && dsLienHeCuaKhThemNhanh.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs bg-muted/30 p-2 rounded-xl border border-border/60">
                      <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1 shrink-0">
                        <Users className="size-3 text-emerald-600" /> Người liên hệ:
                      </span>
                      {dsLienHeCuaKhThemNhanh.map((lh) => {
                        const isChon = nguoiLienHeThemNhanh?.id === lh.id;
                        return (
                          <button
                            key={lh.id}
                            type="button"
                            onClick={() => setNguoiLienHeThemNhanh(isChon ? null : lh)}
                            className={cn(
                              'px-2 py-0.5 rounded-md text-xs font-medium border transition cursor-pointer flex items-center gap-1',
                              isChon
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-background text-foreground border-border hover:border-emerald-500/50'
                            )}
                          >
                            <span>{lh.ho_va_ten}</span>
                            {lh.chuc_vu && <span className="opacity-75 text-[10px]">({lh.chuc_vu})</span>}
                          </button>
                        );
                      })}
                      {nguoiLienHeThemNhanh && (
                        <button
                          type="button"
                          onClick={() => setNguoiLienHeThemNhanh(null)}
                          className="text-[11px] text-rose-500 hover:underline ml-auto cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                  )}

                  {/* Panel chọn nhanh Khách hàng / Dự án khi thêm việc */}
                  {moChonDoiTuongThemNhanh && (
                    <div className="p-2.5 rounded-xl border border-border bg-card shadow-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Gắn Khách hàng hoặc Dự án (tự động đồng bộ lịch sử)
                        </span>
                        {(khachHangThemNhanh || duAnThemNhanh) && (
                          <button
                            type="button"
                            onClick={() => {
                              setKhachHangThemNhanh(null);
                              setDuAnThemNhanh(null);
                            }}
                            className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                          >
                            Xóa gắn
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={tuKhoaThemNhanh}
                        onChange={(e) => setTuKhoaThemNhanh(e.target.value)}
                        placeholder="Tìm khách hàng hoặc dự án..."
                        className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                        autoFocus
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {ketQuaTimThemNhanh.length === 0 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            Không tìm thấy khách hàng hoặc dự án phù hợp
                          </div>
                        ) : (
                          ketQuaTimThemNhanh.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                if (item.loai === 'khach_hang') {
                                  setKhachHangThemNhanh(item.data);
                                  setDuAnThemNhanh(null);
                                } else {
                                  setDuAnThemNhanh(item.data);
                                  setKhachHangThemNhanh(null);
                                }
                                setMoChonDoiTuongThemNhanh(false);
                                setTuKhoaThemNhanh('');
                              }}
                              className="w-full text-left p-1.5 rounded-lg hover:bg-muted text-xs flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <span className="font-medium text-foreground truncate flex items-center gap-1.5">
                                {item.loai === 'khach_hang' ? (
                                  <Building2 className="size-3 text-emerald-600 shrink-0" />
                                ) : (
                                  <FolderKanban className="size-3 text-indigo-600 shrink-0" />
                                )}
                                {item.ten}
                              </span>
                              <span className="text-[11px] text-muted-foreground shrink-0">
                                {item.loai === 'khach_hang' ? 'KH' : 'Dự án'}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Danh sách Lịch hẹn / Công tác trong ngày đang chọn */}
            {dsLichGapNgayChon.length > 0 && (
              <div className="p-3.5 bg-primary/[0.03] border-b border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <CalendarClock className="size-3.5" />
                    <span>Lịch hẹn / Công tác trong ngày ({dsLichGapNgayChon.length})</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dsLichGapNgayChon.map((lich) => {
                    const daXong = lich.trang_thai === 'da_hoan_thanh';
                    return (
                      <div
                        key={`ngay_lich_${lich.id}`}
                        className={cn(
                          'p-2.5 rounded-xl border text-xs space-y-1 transition',
                          daXong
                            ? 'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-950'
                            : 'bg-card border-border text-foreground shadow-2xs'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-primary">
                            {lich.gio_bat_dau} - {lich.gio_ket_thuc}
                          </span>
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded text-[10px] font-bold',
                              daXong
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white'
                            )}
                          >
                            {daXong ? 'Đã xong' : 'Sắp tới'}
                          </span>
                        </div>
                        <div className="font-bold truncate text-foreground">
                          {lich.ten_khach_hang || lich.tieu_de}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          {lich.ten_nguoi_lien_he && <span>Gặp: {lich.ten_nguoi_lien_he}</span>}
                          {lich.dia_diem && <span>• {lich.dia_diem}</span>}
                        </div>
                        {lich.ket_qua ? (
                          <div className="text-[11px] text-emerald-700 italic border-t border-emerald-500/20 pt-1 line-clamp-1">
                            Kết quả: {lich.ket_qua}
                          </div>
                        ) : (
                          <div className="pt-1 border-t border-border/50 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setLichHenDangBaoCao(lich);
                                setNoiDungBaoCaoLichHen('');
                              }}
                              className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>Báo cáo kết quả cuộc gặp</span>
                              <ArrowRight className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danh sách công việc hôm nay */}
            {dsViecNgayChon.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted-foreground">
                Chưa có việc nào trong ngày {dinhDangNgayNgan(ngayChon)}. Nhập công việc / kết quả đã thực hiện ở trên.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {dsViecNgayChon.map((item, idx) => {
                  const dangSua = idDangSua === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                    >
                      {/* Cột trái: STT + Nội dung công việc 1 dòng duy nhất có Link */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="size-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {dangSua ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0 py-0.5">
                            <input
                              type="text"
                              value={noiDungDangSua}
                              onChange={(e) => setNoiDungDangSua(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  xuLyLuuSuaInline(item);
                                } else if (e.key === 'Escape') {
                                  setIdDangSua(null);
                                }
                              }}
                              className="flex-1 h-8 rounded-lg border border-primary bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden shadow-2xs"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => xuLyLuuSuaInline(item)}
                              className="size-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs shrink-0"
                              title="Lưu nội dung (Enter)"
                            >
                              <Check className="size-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIdDangSua(null)}
                              className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors shrink-0"
                              title="Hủy (Esc)"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            {renderDongNoiDung1Dong(item)}
                          </div>
                        )}
                      </div>

                      {/* Cột phải: Thao tác (Sửa trực tiếp, Xóa) */}
                      {laSuaDuoc && !dangSua && (
                        <div className="flex items-center gap-1 shrink-0">
                          {timDuAnCuaItem(item) && (
                            <button
                              type="button"
                              onClick={() => {
                                const da = timDuAnCuaItem(item);
                                setDuAnChoYeuCau(da || null);
                                setNoiDungThemHomNay(
                                  (item.ket_qua_thuc_te || item.hanh_dong_tuan || item.noi_dung_tuan || '').trim()
                                );
                                setMoModalTaoYeuCau(true);
                              }}
                              className="size-7 rounded-lg hover:bg-amber-500/15 text-amber-600 hover:text-amber-700 inline-flex items-center justify-center cursor-pointer transition-colors"
                              title="Tạo yêu cầu phối hợp cho dự án này"
                            >
                              <Sparkles className="size-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIdDangSua(item.id);
                              setNoiDungDangSua(
                                item.ket_qua_thuc_te ||
                                item.hanh_dong_tuan ||
                                item.noi_dung_tuan ||
                                item.ten_khach_hang_du_an ||
                                ''
                              );
                            }}
                            className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center cursor-pointer transition-colors"
                            title="Sửa trực tiếp nội dung công việc"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onXoaCongViec(item.id)}
                            className="size-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 inline-flex items-center justify-center cursor-pointer transition-colors"
                            title="Xóa công việc"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
