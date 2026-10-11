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
  CornerUpLeft,
  Send,
  XCircle
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
import { layKhoangNgayTuTuanISO } from '../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import { cn } from '../../thu_vien/utils/cn';
import ModalChotKetQuaTuan from './modal_chot_ket_qua_tuan';
import DrawerHoSoThuGon, { type GoiYTaoLichHenNhanh } from './drawer_ho_so_thu_gon';
import DrawerTroLyAISale, {
  phanTichRadarCanhBaoSale,
  type LoaiCanhBaoSale
} from './drawer_tro_ly_ai_sale';
import { ModalNguoiLienHe } from '../khach_hang/modal_nguoi_lien_he';
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

  // Trợ lý AI Drawer
  const [moDrawerTroLyAI, setMoDrawerTroLyAI] = useState(false);

  // Thêm nhanh việc vào Hôm nay (Cột trái) và Rổ tuần (Cột phải)
  const [noiDungThemHomNay, setNoiDungThemHomNay] = useState('');
  const [noiDungThemRoTuan, setNoiDungThemRoTuan] = useState('');
  const [khachHangThemNhanh, setKhachHangThemNhanh] = useState<KhachHang | null>(null);
  const [duAnThemNhanh, setDuAnThemNhanh] = useState<HoSoDuAn | null>(null);
  const [moChonDoiTuongThemNhanh, setMoChonDoiTuongThemNhanh] = useState(false);
  const [tuKhoaThemNhanh, setTuKhoaThemNhanh] = useState('');

  // Công việc đang chọn để tác nghiệp ở Cột trái
  const [viecDangChonId, setViecDangChonId] = useState<string | null>(null);
  const [itemChotKetQua, setItemChotKetQua] = useState<ItemKeHoachTuan | null>(null);

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

  // Rổ việc tuần: TẤT CẢ việc chưa hoàn thành trong tuần mà chưa nằm trong ngày đang chọn
  // (Bao gồm cả việc chưa xếp ngày VÀ việc đã làm ở ngày trước nhưng chưa bấm hoàn thành!)
  const dsRoViecTuan = useMemo(() => {
    return ds.filter((item) => {
      const daXong = Boolean(
        item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay'
      );
      if (daXong) return false;
      return !kiemTraViecThuocNgay(item, ngayChon);
    });
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

  // Radar cảnh báo cho Sale
  const danhSachCanhBaoRadar = useMemo(() => {
    return phanTichRadarCanhBaoSale({
      nhanVienId: nhanVienId || nguoiDungHienTai?.id || '',
      homNayISO,
      keHoachTuan,
      keHoachThang,
      danhSachDuAn,
      danhSachTienDo: danhSachTienDoDuAn,
      danhSachKhachHang,
      danhSachNguoiLienHe,
      danhSachLichGap
    });
  }, [
    nhanVienId,
    nguoiDungHienTai?.id,
    homNayISO,
    keHoachTuan,
    keHoachThang,
    danhSachDuAn,
    danhSachTienDoDuAn,
    danhSachKhachHang,
    danhSachNguoiLienHe,
    danhSachLichGap
  ]);

  const soChiDaoMoi = useMemo(
    () => danhSachCanhBaoRadar.filter((c) => c.loai === 'chi_dao_lanh_dao').length,
    [danhSachCanhBaoRadar]
  );

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

  // Thao tác thêm nhanh việc vào Hôm nay (Cột trái)
  const xuLyThemNhanhHomNay = () => {
    if (!noiDungThemHomNay.trim()) return;
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
      ten_khach_hang_du_an: da?.ten_du_an || kh?.ten_khach_hang || noiDungThemHomNay.trim(),
      hanh_dong_tuan: noiDungThemHomNay.trim(),
      noi_dung_tuan: noiDungThemHomNay.trim(),
      ket_qua_mong_muon: '',
      dau_ra_cam_ket: '',
      ngay_du_kien: ngayChon,
      cac_ngay_thuc_hien: [ngayChon],
      da_hoan_thanh: false,
      danh_sach_ket_qua: []
    };
    onThemNhanh(itemMoi);
    setNoiDungThemHomNay('');
    setKhachHangThemNhanh(null);
    setDuAnThemNhanh(null);
    setMoChonDoiTuongThemNhanh(false);
    setViecDangChonId(idMoi);
  };

  // Thêm nhanh việc vào Rổ tuần (chưa định ngày)
  const xuLyThemNhanhRoTuan = () => {
    if (!noiDungThemRoTuan.trim()) return;
    const idMoi = `tuan_${Date.now()}`;
    const itemMoi: ItemKeHoachTuan = {
      id: idMoi,
      loai_hanh_dong: 'phat_sinh',
      hinh_thuc: 'goi_dien',
      ten_khach_hang_du_an: noiDungThemRoTuan.trim(),
      co_quan_doanh_nghiep: null,
      hanh_dong_tuan: noiDungThemRoTuan.trim(),
      noi_dung_tuan: noiDungThemRoTuan.trim(),
      ket_qua_mong_muon: '',
      dau_ra_cam_ket: '',
      ngay_du_kien: null,
      cac_ngay_thuc_hien: [],
      da_hoan_thanh: false,
      danh_sach_ket_qua: []
    };
    onThemNhanh(itemMoi);
    setNoiDungThemRoTuan('');
  };

  // Kéo 1 việc từ Rổ tuần vào Ngày đang chọn và mở ngay ở Cột trái
  const xuLyKeoVaoNgayChon = (item: ItemKeHoachTuan) => {
    const hienTai = layDanhSachNgayCuaViec(item);
    const moi = Array.from(new Set([...hienTai, ngayChon])).sort();
    onCapNhatLichCongViec(item, {
      cac_ngay_thuc_hien: moi,
      ngay_du_kien: item.ngay_du_kien || ngayChon
    });
    setViecDangChonId(item.id);
    setTimeout(() => inputCheckInRef.current?.focus(), 80);
  };

  // Trả việc về Rổ việc tuần (Bỏ khỏi ngày đang chọn)
  const xuLyTraVeRoTuan = (item: ItemKeHoachTuan) => {
    const hienTai = layDanhSachNgayCuaViec(item);
    const conLai = hienTai.filter((d) => d !== ngayChon);
    if (viecDangChonId === item.id) {
      setViecDangChonId(null);
    }
    onCapNhatLichCongViec(item, {
      cac_ngay_thuc_hien: conLai,
      ngay_du_kien: conLai[0] || null
    });
  };

  // Bật / tắt 1 ngày trong tuần cho công việc đang chọn
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
  const xuLyGhiNhanKetQuaPanel = (danhDauXongLuon = false) => {
    if (!viecDangChon) return;
    const text = noiDungCheckIn.trim();
    if (!text && !danhDauXongLuon) {
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

    const dsCu = viecDangChon.danh_sach_ket_qua ?? [];
    let dsMoi = [...dsCu];

    if (text) {
      const kqMoi: NhatKyKetQuaTuan = {
        id: `kq_${Date.now()}`,
        ngay_ghi_nhan: ngayChon,
        noi_dung: text,
        nguoi_ghi_id: nguoiDungHienTai?.id || null,
        ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null,
        loai_tac_nghiep: loaiTacNghiepChon,
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
      ket_qua_thuc_te: dsMoi[0]?.noi_dung || viecDangChon.ket_qua_thuc_te || 'Đã hoàn thành',
      da_hoan_thanh: daHoanThanhMoi,
      giai_doan_du_an_moi: giaiDoanDuAnChon || null,
      khach_hang_id: khTuongTac?.id || null,
      co_quan_doanh_nghiep: khTuongTac?.ten_khach_hang || null,
      du_an_id: duAnTuongTac?.id || null,
      du_an_du_kien: duAnTuongTac?.ten_du_an || null
    });

    setNoiDungCheckIn('');
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

            <button
              type="button"
              onClick={() => setMoDrawerTroLyAI(true)}
              className={cn(
                'h-9 px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0',
                soChiDaoMoi > 0
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20'
                  : danhSachCanhBaoRadar.length > 0
                  ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>Nhắc việc AI</span>
              {danhSachCanhBaoRadar.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                  {danhSachCanhBaoRadar.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BỐ CỤC 2 CỘT: TRÁI TO (VIỆC HÔM NAY & MỌI THAO TÁC) - PHẢI NHỎ (RỔ VIỆC TUẦN) */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* =============================================================== */}
        {/* CỘT TRÁI (8/12): VIỆC HÔM NAY — TẤT CẢ THAO TÁC NẰM TẠI ĐÂY     */}
        {/* =============================================================== */}
        <div className="lg:col-span-8">
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
                  {soViecNgayDaXong}/{dsViecNgayChon.length} hoàn thành
                </span>
              </div>

              {laSuaDuoc && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noiDungThemHomNay}
                      onChange={(e) => setNoiDungThemHomNay(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          xuLyThemNhanhHomNay();
                        }
                      }}
                      placeholder="+ Thêm việc làm hôm nay rồi nhấn Enter..."
                      className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                    />

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

                    {noiDungThemHomNay.trim() && (
                      <button
                        type="button"
                        onClick={xuLyThemNhanhHomNay}
                        className="h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Thêm
                      </button>
                    )}
                  </div>

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

            {/* Danh sách công việc hôm nay & Khu vực thao tác trực tiếp */}
            {dsViecNgayChon.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted-foreground">
                Chưa có việc nào trong ngày {dinhDangNgayNgan(ngayChon)}. Bấm chọn từ Rổ việc tuần bên phải hoặc nhập mới ở trên.
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {dsViecNgayChon.map((item) => {
                  const dangMo = item.id === viecDangChon?.id;
                  const daXong = Boolean(
                    item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay'
                  );
                  const tieuDe =
                    item.hanh_dong_tuan ||
                    item.noi_dung_tuan ||
                    item.ten_khach_hang_du_an ||
                    'Công việc';
                  const dauRa = item.ket_qua_mong_muon || item.dau_ra_cam_ket;
                  const khCoDinh = timKhachHangCuaItem(item);
                  const daCoDinh = timDuAnCuaItem(item);
                  const dsKetQua = item.danh_sach_ket_qua || [];

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'transition-colors',
                        dangMo ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'
                      )}
                    >
                      {/* Dòng tiêu đề công việc */}
                      <div
                        onClick={() =>
                          setViecDangChonId(dangMo ? null : item.id)
                        }
                        className="p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {laSuaDuoc ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemChotKetQua(item);
                              }}
                              className={cn(
                                'mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer border',
                                item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua)
                                  ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30'
                                  : item.trang_thai_ket_qua === 'do_dang'
                                  ? 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30'
                                  : item.trang_thai_ket_qua === 'khong_dat'
                                  ? 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/30'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border'
                              )}
                              title="Nhấp để chốt kết quả hoặc đổi trạng thái"
                            >
                              {item.trang_thai_ket_qua === 'dat_muc_tieu' || (item.da_hoan_thanh && !item.trang_thai_ket_qua) ? (
                                <>
                                  <CheckCircle2 className="size-3 text-emerald-600" />
                                  <span>Đạt MT</span>
                                </>
                              ) : item.trang_thai_ket_qua === 'do_dang' ? (
                                <>
                                  <Clock className="size-3 text-amber-600" />
                                  <span>Dở dang</span>
                                </>
                              ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                                <>
                                  <XCircle className="size-3 text-rose-600" />
                                  <span>Không đạt</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3 text-muted-foreground" />
                                  <span>Chốt KQ</span>
                                </>
                              )}
                            </button>
                          ) : item.trang_thai_ket_qua === 'dat_muc_tieu' || daXong ? (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 inline-flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              <span>Đạt MT</span>
                            </span>
                          ) : item.trang_thai_ket_qua === 'do_dang' ? (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30 inline-flex items-center gap-1 shrink-0">
                              <Clock className="size-3 text-amber-600" />
                              <span>Dở dang</span>
                            </span>
                          ) : item.trang_thai_ket_qua === 'khong_dat' ? (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 border border-rose-500/30 inline-flex items-center gap-1 shrink-0">
                              <XCircle className="size-3 text-rose-600" />
                              <span>Không đạt</span>
                            </span>
                          ) : (
                            <span className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border inline-flex items-center gap-1 shrink-0">
                              <Clock className="size-3 text-muted-foreground" />
                              <span>Đang làm</span>
                            </span>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={cn(
                                  'text-sm font-semibold text-foreground leading-snug',
                                  daXong && 'line-through text-muted-foreground'
                                )}
                              >
                                {tieuDe}
                              </span>
                              {dsKetQua.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                                  {dsKetQua.length} kết quả
                                </span>
                              )}
                            </div>

                            {dauRa && dauRa !== tieuDe && (
                              <div className="text-xs text-muted-foreground">
                                Đầu ra cam kết: <span className="font-medium text-foreground">{dauRa}</span>
                              </div>
                            )}

                            {!dangMo && (khCoDinh || daCoDinh || item.nguoi_lien_he || dsKetQua[0]) && (
                              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                {khCoDinh && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                    <Building2 className="size-3 text-emerald-600" />
                                    <span>{khCoDinh.ten_khach_hang}</span>
                                  </span>
                                )}
                                {daCoDinh && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                                    <FolderKanban className="size-3 text-indigo-600" />
                                    <span>{daCoDinh.ten_du_an}</span>
                                  </span>
                                )}
                                {item.nguoi_lien_he && (
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                                    <Users className="size-3 text-slate-400" />
                                    <span>{item.nguoi_lien_he}{item.so_dien_thoai_lien_he ? ` (${item.so_dien_thoai_lien_he})` : ''}</span>
                                  </span>
                                )}
                                {dsKetQua[0] && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[360px]">
                                    — {dsKetQua[0].noi_dung}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nút thao tác nhanh góc phải của dòng việc */}
                        {laSuaDuoc && (
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!daXong && (
                              <button
                                type="button"
                                onClick={() => xuLyTraVeRoTuan(item)}
                                className="h-7 px-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                                title="Trả việc này về lại Rổ việc tuần bên phải"
                              >
                                <CornerUpLeft className="size-3.5" />
                                <span className="hidden sm:inline">Để lại rổ</span>
                              </button>
                            )}
                            {onSuaCongViec && (
                              <button
                                type="button"
                                onClick={() => onSuaCongViec(item)}
                                className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center cursor-pointer"
                                title="Sửa"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onXoaCongViec(item.id)}
                              className="size-7 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* KHU VỰC THAO TÁC TRỰC TIẾP NGAY TRONG VIỆC ĐANG MỞ */}
                      {dangMo && (
                        <div className="px-4 pb-4 pt-1 pl-10 space-y-3 border-t border-border/40">
                          {/* Banner nhắc đồng bộ lịch sử Khách hàng & Dự án */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/50">
                            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                            <span>Tự động đồng bộ vào </span>
                            {khachHangDangTacNghiep || duAnDangTacNghiep ? (
                              <span className="font-semibold text-foreground">
                                Lịch sử {[khachHangDangTacNghiep?.ten_khach_hang, duAnDangTacNghiep?.ten_du_an].filter(Boolean).join(' · ')}
                              </span>
                            ) : (
                              <span>Báo cáo ngày của bạn</span>
                            )}
                          </div>

                          {laSuaDuoc && (
                            <div className="space-y-2 pt-1">
                              {/* Thanh gắn Khách hàng / Dự án / Người liên hệ + Tạo nhanh */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {khachHangDangTacNghiep && (
                                    <div className="inline-flex items-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 text-xs font-bold overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moHoSoKhachHangNhanh(khachHangDangTacNghiep)
                                        }
                                        className="px-2.5 py-1 inline-flex items-center gap-1.5 hover:bg-emerald-500/20 cursor-pointer"
                                      >
                                        <Building2 className="size-3.5 text-emerald-700" />
                                        <span>{khachHangDangTacNghiep.ten_khach_hang}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            khCoDinhCuaViecChon?.id ===
                                            khachHangDangTacNghiep.id
                                          ) {
                                            xuLyGoKhachHangKhoiItem(item);
                                          }
                                          setDoiTuongThucThiMap((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              khachHang: null,
                                              duAn: prev[item.id]?.duAn ?? null,
                                              nguoiLienHe: null
                                            }
                                          }));
                                        }}
                                        className="px-1.5 py-1 hover:bg-rose-500/20 hover:text-rose-700 border-l border-emerald-500/25 cursor-pointer"
                                        title="Gỡ khách hàng"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </div>
                                  )}

                                  {duAnDangTacNghiep && (
                                    <div className="inline-flex items-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 text-xs font-bold overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => moHoSoDuAnNhanh(duAnDangTacNghiep)}
                                        className="px-2.5 py-1 inline-flex items-center gap-1.5 hover:bg-indigo-500/20 cursor-pointer"
                                      >
                                        <FolderKanban className="size-3.5 text-indigo-700" />
                                        <span>{duAnDangTacNghiep.ten_du_an}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            daCoDinhCuaViecChon?.id ===
                                            duAnDangTacNghiep.id
                                          ) {
                                            xuLyGoDuAnKhoiItem(item);
                                          }
                                          setDoiTuongThucThiMap((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              khachHang:
                                                prev[item.id]?.khachHang ??
                                                khachHangDangTacNghiep,
                                              duAn: null,
                                              nguoiLienHe: prev[item.id]?.nguoiLienHe
                                            }
                                          }));
                                        }}
                                        className="px-1.5 py-1 hover:bg-rose-500/20 hover:text-rose-700 border-l border-indigo-500/25 cursor-pointer"
                                        title="Gỡ dự án"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Chọn / Gắn Người liên hệ của Khách hàng đang tác nghiệp */}
                                  {khachHangDangTacNghiep && (
                                    <div className="inline-flex items-center gap-1">
                                      <select
                                        value={nguoiLienHeDangTacNghiep?.id || ''}
                                        onChange={(e) => {
                                          const idChon = e.target.value;
                                          const lhChon =
                                            dsLienHeCuaKhDangTacNghiep.find(
                                              (x) => x.id === idChon
                                            ) || null;
                                          setDoiTuongThucThiMap((prev) => ({
                                            ...prev,
                                            [item.id]: {
                                              khachHang:
                                                prev[item.id]?.khachHang ??
                                                khachHangDangTacNghiep,
                                              duAn:
                                                prev[item.id]?.duAn ?? duAnDangTacNghiep,
                                              nguoiLienHe: lhChon
                                            }
                                          }));
                                          onCapNhatLichCongViec(item, {
                                            nguoi_lien_he_id: lhChon?.id || null,
                                            nguoi_lien_he:
                                              lhChon?.ho_va_ten || null,
                                            chuc_vu: lhChon?.chuc_vu || null,
                                            so_dien_thoai_lien_he:
                                              lhChon?.so_dien_thoai || null
                                          });
                                        }}
                                        className="h-7 rounded-lg border border-border bg-background px-2 text-[11px] font-bold text-foreground max-w-[210px] truncate"
                                        title="Chọn người liên hệ của khách hàng"
                                      >
                                        <option value="">-- Người liên hệ --</option>
                                        {dsLienHeCuaKhDangTacNghiep.map((lh) => (
                                          <option key={lh.id} value={lh.id}>
                                            {lh.ho_va_ten}
                                            {lh.chuc_vu ? ` (${lh.chuc_vu})` : ''}
                                            {lh.so_dien_thoai ? ` - ${lh.so_dien_thoai}` : ''}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => setMoModalThemLienHe(true)}
                                        className="h-7 px-2 rounded-lg border border-border hover:border-primary/50 bg-background hover:bg-primary/5 text-[11px] font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1 cursor-pointer"
                                        title="Thêm người liên hệ mới cho khách hàng này"
                                      >
                                        <Plus className="size-3" />
                                        <span>Liên hệ</span>
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setMoTimDoiTuongTrongPanel(!moTimDoiTuongTrongPanel)
                                    }
                                    className="h-7 px-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 bg-background hover:bg-primary/5 text-muted-foreground hover:text-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Search className="size-3" />
                                    <span>
                                      {khachHangDangTacNghiep || duAnDangTacNghiep
                                        ? 'Đổi KH / Dự án'
                                        : '+ Gắn Khách hàng / Dự án'}
                                    </span>
                                  </button>

                                  {duAnDangTacNghiep && (
                                    <select
                                      value={
                                        giaiDoanDuAnChon || duAnDangTacNghiep.giai_doan
                                      }
                                      onChange={(e) => setGiaiDoanDuAnChon(e.target.value)}
                                      className="h-7 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 text-[11px] font-bold text-indigo-800"
                                    >
                                      {DANH_SACH_GIAI_DOAN_MAC_DINH.map((gd) => (
                                        <option key={gd.key} value={gd.key}>
                                          {gd.nhan_day_du}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onMoFormKhachHang(item)}
                                    className="h-7 px-2 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <UserPlus className="size-3" /> + KH mới
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onMoFormDuAn({
                                        itemTuan: item,
                                        khachHangId: khachHangDangTacNghiep?.id || null
                                      })
                                    }
                                    className="h-7 px-2 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <FolderKanban className="size-3" /> + Dự án mới
                                  </button>
                                </div>
                              </div>

                              {/* Dropdown chọn KH / Dự án từ danh bạ (có ô tìm kiếm) */}
                              {moTimDoiTuongTrongPanel && (
                                <div className="p-2.5 rounded-xl border border-border bg-card space-y-2 shadow-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      <input
                                        type="text"
                                        value={tuKhoaDoiTuongPanel}
                                        onChange={(e) =>
                                          setTuKhoaDoiTuongPanel(e.target.value)
                                        }
                                        placeholder="Gõ tìm tên Khách hàng, SĐT, MST hoặc tên Dự án..."
                                        className="w-full h-8 rounded-lg border border-border bg-background pl-8 pr-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                                        autoFocus
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setMoTimDoiTuongTrongPanel(false)}
                                      className="h-8 px-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                      Đóng
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-bold uppercase text-muted-foreground px-1">
                                        Khách hàng ({ketQuaTimDoiTuongPanel.khachHang.length})
                                      </div>
                                      {ketQuaTimDoiTuongPanel.khachHang.map((k) => (
                                        <button
                                          key={k.id}
                                          type="button"
                                          onClick={() => {
                                            setDoiTuongThucThiMap((prev) => ({
                                              ...prev,
                                              [item.id]: {
                                                khachHang: k,
                                                duAn: null,
                                                nguoiLienHe: undefined
                                              }
                                            }));
                                            onCapNhatLichCongViec(item, {
                                              khach_hang_id: k.id,
                                              co_quan_doanh_nghiep: k.ten_khach_hang,
                                              ten_khach_hang_du_an: item.hanh_dong_tuan
                                                ? `${k.ten_khach_hang} - ${item.hanh_dong_tuan}`
                                                : k.ten_khach_hang
                                            });
                                            setMoTimDoiTuongTrongPanel(false);
                                            setTimeout(
                                              () => inputCheckInRef.current?.focus(),
                                              50
                                            );
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-background hover:bg-emerald-500/10 border border-border/60 text-xs cursor-pointer"
                                        >
                                          <div className="font-semibold text-foreground truncate">
                                            {k.ten_khach_hang}
                                          </div>
                                          {(k.so_dien_thoai || k.xa_phuong || k.dia_chi) && (
                                            <div className="text-[10px] text-muted-foreground truncate">
                                              {[k.so_dien_thoai, k.xa_phuong || k.dia_chi]
                                                .filter(Boolean)
                                                .join(' · ')}
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    </div>

                                    <div className="space-y-1">
                                      <div className="text-[10px] font-bold uppercase text-muted-foreground px-1">
                                        Dự án ({ketQuaTimDoiTuongPanel.duAn.length})
                                      </div>
                                      {ketQuaTimDoiTuongPanel.duAn.map((d) => {
                                        const khCuaDa = d.khach_hang_id
                                          ? mapKH.get(d.khach_hang_id) || null
                                          : null;
                                        return (
                                          <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => {
                                              setDoiTuongThucThiMap((prev) => ({
                                                ...prev,
                                                [item.id]: {
                                                  khachHang: khCuaDa,
                                                  duAn: d,
                                                  nguoiLienHe: undefined
                                                }
                                              }));
                                              onCapNhatLichCongViec(item, {
                                                du_an_id: d.id,
                                                du_an_du_kien: d.ten_du_an,
                                                khach_hang_id: khCuaDa?.id || null,
                                                co_quan_doanh_nghiep: khCuaDa?.ten_khach_hang || null,
                                                ten_khach_hang_du_an: d.ten_du_an
                                              });
                                              setMoTimDoiTuongTrongPanel(false);
                                              setTimeout(
                                                () => inputCheckInRef.current?.focus(),
                                                50
                                              );
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 rounded-lg bg-background hover:bg-indigo-500/10 border border-border/60 text-xs cursor-pointer"
                                          >
                                            <div className="font-semibold text-foreground truncate">
                                              {d.ten_du_an}
                                            </div>
                                            {khCuaDa && (
                                              <div className="text-[10px] text-muted-foreground truncate">
                                                KH: {khCuaDa.ten_khach_hang}
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Ô nhập kết quả + Nút Lưu */}
                              <div className="flex items-start gap-2">
                                <textarea
                                  ref={inputCheckInRef}
                                  rows={2}
                                  value={noiDungCheckIn}
                                  onChange={(e) => setNoiDungCheckIn(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      xuLyGhiNhanKetQuaPanel(false);
                                    }
                                  }}
                                  placeholder={
                                    khachHangDangTacNghiep || duAnDangTacNghiep
                                      ? `Nhập kết quả làm việc với ${
                                          nguoiLienHeDangTacNghiep
                                            ? `${nguoiLienHeDangTacNghiep.ho_va_ten} - `
                                            : ''
                                        }${
                                          duAnDangTacNghiep?.ten_du_an ||
                                          khachHangDangTacNghiep?.ten_khach_hang
                                        }... (Enter để lưu)`
                                      : 'Nhập kết quả làm việc... (Enter để lưu)'
                                  }
                                  className="flex-1 rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                                />
                                <button
                                  type="button"
                                  disabled={!noiDungCheckIn.trim()}
                                  onClick={() => xuLyGhiNhanKetQuaPanel(false)}
                                  className="h-[58px] px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                  <Send className="size-3.5" />
                                  <span>Lưu</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Danh sách kết quả đã ghi nhận của việc này */}
                          {dsKetQua.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {dsKetQua.map((kq) => {
                                const dangSuaDongNay =
                                  dangSuaKetQua?.itemId === item.id &&
                                  dangSuaKetQua?.kqId === kq.id;
                                const khCuaKq = kq.khach_hang_id
                                  ? mapKH.get(kq.khach_hang_id) || null
                                  : null;
                                const daCuaKq = kq.du_an_id
                                  ? mapDuAn.get(kq.du_an_id) || null
                                  : null;

                                return (
                                  <div
                                    key={kq.id}
                                    className="p-2.5 rounded-xl border border-border bg-background flex items-start justify-between gap-2 text-xs"
                                  >
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                          {dinhDangNgayNgan(kq.ngay_ghi_nhan)}
                                        </span>

                                        {(khCuaKq || kq.ten_khach_hang) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              khCuaKq && moHoSoKhachHangNhanh(khCuaKq)
                                            }
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 font-bold text-[11px] cursor-pointer"
                                          >
                                            <Building2 className="size-3 shrink-0" />
                                            <span>
                                              {khCuaKq?.ten_khach_hang || kq.ten_khach_hang}
                                            </span>
                                          </button>
                                        )}

                                        {(daCuaKq || kq.ten_du_an) && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              daCuaKq && moHoSoDuAnNhanh(daCuaKq)
                                            }
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 font-bold text-[11px] cursor-pointer"
                                          >
                                            <FolderKanban className="size-3 shrink-0" />
                                            <span>
                                              {daCuaKq?.ten_du_an || kq.ten_du_an}
                                            </span>
                                          </button>
                                        )}

                                        {kq.ten_nguoi_lien_he && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold text-[11px]">
                                            <Users className="size-3 shrink-0 text-muted-foreground" />
                                            <span>
                                              {kq.ten_nguoi_lien_he}
                                              {kq.so_dien_thoai_lien_he
                                                ? ` (${kq.so_dien_thoai_lien_he})`
                                                : ''}
                                            </span>
                                          </span>
                                        )}
                                      </div>

                                      {dangSuaDongNay ? (
                                        <div className="flex items-center gap-1.5">
                                          <input
                                            type="text"
                                            value={dangSuaKetQua.noiDung}
                                            onChange={(e) =>
                                              setDangSuaKetQua({
                                                ...dangSuaKetQua,
                                                noiDung: e.target.value
                                              })
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                xuLyLuuSuaKetQuaInline(item);
                                              } else if (e.key === 'Escape') {
                                                setDangSuaKetQua(null);
                                              }
                                            }}
                                            className="flex-1 h-7 rounded border border-primary bg-background px-2 text-xs"
                                            autoFocus
                                          />
                                          <button
                                            type="button"
                                            onClick={() => xuLyLuuSuaKetQuaInline(item)}
                                            className="h-7 px-2 rounded bg-primary text-primary-foreground text-[11px] font-bold"
                                          >
                                            Lưu
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="text-foreground font-medium">
                                          {kq.noi_dung}
                                        </div>
                                      )}

                                      {kq.chi_dao?.noi_dung && (
                                        <div className="text-[11px] text-amber-800 font-semibold">
                                          Chỉ đạo ({kq.chi_dao.ten_nguoi_chi_dao || 'Lãnh đạo'}):{' '}
                                          {kq.chi_dao.noi_dung}
                                        </div>
                                      )}
                                    </div>

                                    {laSuaDuoc && !dangSuaDongNay && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        {khCuaKq && !daCuaKq && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onMoTaoDuAnChoKH
                                                ? onMoTaoDuAnChoKH(khCuaKq, item)
                                                : onMoFormDuAn({
                                                    itemTuan: item,
                                                    khachHangId: khCuaKq.id
                                                  })
                                            }
                                            className="h-6 px-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 text-[10px] font-bold cursor-pointer"
                                          >
                                            + Dự án
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDangSuaKetQua({
                                              itemId: item.id,
                                              kqId: kq.id,
                                              noiDung: kq.noi_dung
                                            })
                                          }
                                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                          <Edit2 className="size-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            xuLyXoaKetQuaInline(item, kq.id)
                                          }
                                          className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 cursor-pointer"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* CỘT PHẢI (4/12): RỔ VIỆC TUẦN — DANH SÁCH ĐƠN GIẢN               */}
        {/* =============================================================== */}
        <div className="lg:col-span-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-border bg-muted/15 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-foreground">
                  Rổ việc tuần ({dsRoViecTuan.length})
                </span>
              </div>

              {laSuaDuoc && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={noiDungThemRoTuan}
                    onChange={(e) => setNoiDungThemRoTuan(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        xuLyThemNhanhRoTuan();
                      }
                    }}
                    placeholder="+ Thêm việc vào rổ tuần..."
                    className="flex-1 h-8 rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                  />
                  {noiDungThemRoTuan.trim() && (
                    <button
                      type="button"
                      onClick={xuLyThemNhanhRoTuan}
                      className="h-8 px-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Thêm
                    </button>
                  )}
                </div>
              )}
            </div>

            {dsRoViecTuan.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Không có việc nào chờ trong rổ tuần.
              </div>
            ) : (
              <div className="divide-y divide-border/60 max-h-[540px] overflow-y-auto">
                {dsRoViecTuan.map((item) => {
                  const tieuDe =
                    item.hanh_dong_tuan ||
                    item.noi_dung_tuan ||
                    item.ten_khach_hang_du_an ||
                    'Công việc tuần';
                  const cacNgay = layDanhSachNgayCuaViec(item);
                  const soKq = item.danh_sach_ket_qua?.length || 0;
                  const daLamDo = cacNgay.length > 0 || soKq > 0;

                  return (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between gap-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-xs font-bold text-foreground truncate">
                          {tieuDe}
                        </div>
                        {daLamDo && (
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground">
                            {soKq > 0 && (
                              <span className="font-bold text-primary">
                                Đã ghi {soKq} kết quả
                              </span>
                            )}
                            {cacNgay.length > 0 && (
                              <span className="font-mono">
                                {soKq > 0 ? '· ' : ''}
                                {cacNgay.map((d) => dinhDangNgayNgan(d)).join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {laSuaDuoc && (
                        <button
                          type="button"
                          onClick={() => xuLyKeoVaoNgayChon(item)}
                          className={cn(
                            'h-7 px-2.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer',
                            daLamDo
                              ? 'bg-amber-500/15 hover:bg-amber-500 text-amber-800 hover:text-white'
                              : 'bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground'
                          )}
                        >
                          {daLamDo ? '+ Làm tiếp' : '+ Làm'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* DRAWER HỒ SƠ THU GỌN (XEM & TƯƠNG TÁC KHÁCH HÀNG / DỰ ÁN TẠI CHỖ) */}
      {/* ================================================================= */}
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

      {/* ================================================================= */}
      {/* DRAWER TRỢ LÝ AI & RADAR CẢNH BÁO CHO SALE                         */}
      {/* ================================================================= */}
      <DrawerTroLyAISale
        mo={moDrawerTroLyAI}
        onDong={() => setMoDrawerTroLyAI(false)}
        nhanVienId={nhanVienId || nguoiDungHienTai?.id || ''}
        homNayISO={homNayISO}
        danhSachCanhBaoHeThong={danhSachCanhBaoRadar}
        danhSachDuAn={danhSachDuAn}
        danhSachKhachHang={danhSachKhachHang}
        keHoachTuan={keHoachTuan}
        onMoHoSoDuAn={(da) => {
          setMoDrawerTroLyAI(false);
          moHoSoDuAnNhanh(da);
        }}
        onMoHoSoKhachHang={(kh) => {
          setMoDrawerTroLyAI(false);
          moHoSoKhachHangNhanh(kh);
        }}
        onMoTaoLichHen={(goiY) => {
          setMoDrawerTroLyAI(false);
          onMoTaoLichHenGoiY?.(goiY, viecDangChon);
        }}
        onDuaVaoViecHomNay={({ duAn, khachHang, itemTuan, goiYHanhDong }) => {
          setMoDrawerTroLyAI(false);
          if (itemTuan) {
            xuLyKeoVaoNgayChon(itemTuan);
            return;
          }
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
        onCheckInItemTuan={(item) => {
          setMoDrawerTroLyAI(false);
          setViecDangChonId(item.id);
          setTimeout(() => inputCheckInRef.current?.focus(), 80);
        }}
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

      {/* MODAL CHỐT KẾT QUẢ CÔNG VIỆC (3 TRẠNG THÁI + BẮT BUỘC KẾT QUẢ THỰC TẾ) */}
      <ModalChotKetQuaTuan
        mo={Boolean(itemChotKetQua)}
        item={itemChotKetQua}
        onDong={() => setItemChotKetQua(null)}
        onLuu={async (itemId, trangThai, ketQuaThucTe) => {
          if (onChotKetQua) {
            await onChotKetQua(itemId, trangThai, ketQuaThucTe);
          } else {
            onDoiNhanhHoanThanh(itemId, trangThai === 'dat_muc_tieu');
          }
        }}
      />
    </div>
  );
}
