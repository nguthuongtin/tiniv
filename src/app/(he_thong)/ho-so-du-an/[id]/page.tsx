'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderKanban,
  Users,
  FileText,
  Paperclip,
  Activity,
  Calendar,
  Gauge,
  DollarSign,
  Building2,
  UserPlus,
  UserRound,
  Target,
  Wallet,
  Download,
  Clock,
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  ExternalLink,
  Image as ImageIcon,
  File as FileIcon,
  TrendingUp,
  CheckCircle2,
  Send,
  XCircle,
  Timer,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Loader2,
  Pin,
  FileVideo,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  Layers,
  X,
  Plus,
  Search
} from 'lucide-react';
import { notFound, useRouter, useParams } from 'next/navigation';
import type { HoSoDuAn, TienDoDuAn, GiaiDoanDuAn } from '../../../../thu_vien/types/du_an';
import type { BaoCaoCongViec } from '../../../../thu_vien/types/bao_cao_cong_viec';
import type { KhachHang, NguoiLienHe } from '../../../../thu_vien/types/khach_hang';
import type { NhanSu, ChiNhanh, PhongBan } from '../../../../thu_vien/types/nhan_su';
import type { SanPhamDichVu } from '../../../../thu_vien/types/san_pham_dich_vu';
import type {
  CapNhatHoSoDuAnDTO,
  DieuKienLocHoSoDuAn,
  TaoMoiHoSoDuAnDTO
} from '../../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import {
  layChiTietHoSoDuAn,
  danhSachHoSoDuAn,
  capNhatHoSoDuAn,
  doiTrangThaiHoSoDuAn,
  doiGiaiDoanHoSoDuAn
} from '../../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import {
  danhSachTienDoDuAn,
  taoTienDoDuAnMoi,
  capNhatTienDoDuAn,
  xoaMemTienDoDuAn
} from '../../../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import { danhSachBaoCaoCongViec } from '../../../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachKhachHang } from '../../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe } from '../../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { danhSachNhanSu } from '../../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { danhSachPhongBan } from '../../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachSanPhamDichVu } from '../../../../dich_vu/san_pham_dich_vu/dich_vu_san_pham_dich_vu';
import {
  danhSachTaiLieuDuAn,
  themTaiLieuDuAn,
  xoaTaiLieuDuAn,
  type TaiLieuDuAn
} from '../../../../dich_vu/tai_lieu_du_an/dich_vu_tai_lieu_du_an';
import {
  danhSachNhatKyHoatDong,
  type NhatKyHoatDong,
  TEN_MODULE_NHAT_KY,
  TEN_HANH_DONG_NHAT_KY
} from '../../../../dich_vu/nhat_ky_hoat_dong/dich_vu_nhat_ky_hoat_dong';
import { layDanhSachGiaiDoan } from '../../../../thu_vien/cau_hinh/giai_doan_du_an';
import { duocXemHoSoDuAn } from '../../../../thu_vien/phan_quyen/kiem_tra_quyen';
import useStoreXacThuc from '../../../../thu_vien/zustand/store_xac_thuc';
import { ModalLyDoHuyDuAn } from '../../../../thanh_phan/ho_so_du_an/modal_ly_do_huy_du_an';
import { formatNgay } from '../../../../thu_vien/utils/format_ngay';
import { formatTien } from '../../../../thu_vien/utils/format_tien';
import { cn } from '../../../../thu_vien/utils/cn';
import {
  BoCacTab,
  DanhSachNutTab,
  NutTab,
  NoiDungTab,
  Hieu,
  Rong,
  Thanh_Tien_Do,
  DaiDien,
  Nut,
  O_Nhap
} from '../../../../thanh_phan/ui';

type TenTab = 'tien_do' | 'tai_lieu' | 'thong_tin';

const DS_TAB: { key: TenTab; nhan: string; bieuTuong: any; dem?: number }[] = [
  { key: 'tien_do', nhan: 'Nhật ký & Tiến độ', bieuTuong: Activity },
  { key: 'tai_lieu', nhan: 'Kho tài liệu', bieuTuong: Paperclip },
  { key: 'thong_tin', nhan: 'Thông tin dự án', bieuTuong: FolderKanban }
];

const TEN_GIAI_DOAN_DA: Record<string, string> = {
  moi_tao: 'Mới tạo',
  tiep_can: 'Tiếp cận',
  khao_sat: 'Khảo sát',
  len_giai_phap: 'Lên giải pháp',
  bao_gia: 'Báo giá',
  dam_phan: 'Đàm phán',
  ky_hop_dong: 'Ký hợp đồng',
  trien_khai: 'Triển khai',
  nghiem_thu: 'Nghiệm thu',
  hoan_thanh: 'Hoàn thành',
  tam_dung: 'Tạm dừng',
  huy: 'Đã hủy'
};

const GIAI_DOAN_DANG_TRIEN_KHAI: string[] = [
  'moi_tao',
  'tiep_can',
  'khao_sat',
  'len_giai_phap',
  'bao_gia',
  'dam_phan',
  'ky_hop_dong',
  'trien_khai',
  'nghiem_thu',
  'hoan_thanh'
];

const MAP_HIEU_GIAI_DOAN: Record<string, string> = {
  moi_tao: 'bg-slate-100 text-slate-700 border-slate-200/80',
  tiep_can: 'bg-sky-50 text-sky-700 border-sky-200/80',
  khao_sat: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  len_giai_phap: 'bg-indigo-50 text-[#5E5CE6] border-indigo-200/80',
  bao_gia: 'bg-amber-50 text-amber-700 border-amber-200/80',
  dam_phan: 'bg-orange-50 text-[#FF9500] border-orange-200/80',
  ky_hop_dong: 'bg-teal-50 text-teal-700 border-teal-200/80',
  trien_khai: 'bg-blue-50 text-[#007AFF] border-blue-200/80',
  nghiem_thu: 'bg-emerald-50 text-[#34C759] border-emerald-200/80',
  hoan_thanh: 'bg-emerald-100/80 text-emerald-800 border-emerald-300/80',
  tam_dung: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
  huy: 'bg-rose-50 text-[#FF3B30] border-rose-200/80'
};

function BadgeGiaiDoan({ value }: { value?: string | null }) {
  const cls = MAP_HIEU_GIAI_DOAN[value ?? 'moi_tao'] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  const ten = TEN_GIAI_DOAN_DA[value ?? 'moi_tao'] ?? value ?? 'Mới tạo';
  return (
    <span className={cn('text-[11px] px-2.5 py-0.5 rounded-full font-semibold border inline-flex items-center', cls)}>
      {ten}
    </span>
  );
}

const TEN_TIEM_NANG: Record<string, string> = {
  rat_cao: 'Rất cao',
  cao: 'Cao',
  trung_binh: 'Trung bình',
  thap: 'Thấp',
  rat_thap: 'Rất thấp'
};



const TEN_TRANG_THAI_TIEN_DO: Record<TienDoDuAn['trang_thai_hanh_dong'], string> = {
  dang_cho: 'Chờ thực hiện',
  dang_thuc_hien: 'Đang thực hiện',
  da_hoan_thanh: 'Đã hoàn thành',
  qua_han: 'Quá hạn'
};

export default function TrangChiTietHoSoDuAn() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;
  const { nguoiDungHienTai } = useStoreXacThuc();
  const laBackOffice = ['hanh_chinh_van_phong'].includes(nguoiDungHienTai?.vai_tro ?? '');

  const [hda, setHda] = useState<HoSoDuAn | null>(null);
  const [dsTD, setDsTD] = useState<TienDoDuAn[]>([]);
  const [dsBCCV, setDsBCCV] = useState<BaoCaoCongViec[]>([]);
  const [dsKH, setDsKH] = useState<KhachHang[]>([]);
  const [dsNLH, setDsNLH] = useState<NguoiLienHe[]>([]);
  const [dsNS, setDsNS] = useState<NhanSu[]>([]);
  const [dsTL, setDsTL] = useState<TaiLieuDuAn[]>([]);
  const [dsNK, setDsNK] = useState<NhatKyHoatDong[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsSanPham, setDsSanPham] = useState<SanPhamDichVu[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [errTai, setErrTai] = useState<string | null>(null);
  const [tabHienTai, setTabHienTai] = useState<TenTab>('tien_do');

  const [dsTDKemCanhBao, setDsTDKemCanhBao] = useState<
    (TienDoDuAn & { canh_bao: 'sap_den' | 'qua_han' | null })[]
  >([]);

  const stepperContainerRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn ngang slider đến đúng vị trí giai đoạn hiện tại trên thiết bị di động
  useEffect(() => {
    if (!hda?.giai_doan || !stepperContainerRef.current) return;
    const container = stepperContainerRef.current;
    const activeEl = container.querySelector(`[data-stage-key="${hda.giai_doan}"]`) as HTMLElement | null;
    if (activeEl) {
      const scrollOffset = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
      container.scrollTo({ left: Math.max(0, scrollOffset), behavior: 'smooth' });
    }
  }, [hda?.giai_doan]);

  const xuLyThemCapNhatTongHop = async (params: {
    noi_dung: string;
    file?: { ten_file: string; url_file: string; loai_file: string; ghi_chu?: string } | null;
  }) => {
    if (!id) return;
    const nd = params.noi_dung.trim();
    const f = params.file;
    let urlFileChoTienDo: string | null = null;

    // 1. Thêm tài liệu nếu có
    if (f && f.ten_file.trim() && f.url_file.trim()) {
      await themTaiLieuDuAn(
        {
          du_an_id: id,
          ten_file: f.ten_file.trim(),
          url_file: f.url_file.trim(),
          loai_file: f.loai_file || 'link_khac',
          ghi_chu: f.ghi_chu?.trim() || null,
          nguoi_tai_len_id: nguoiDungHienTai?.id ?? null
        },
        nguoiDungHienTai ?? null
      );
      urlFileChoTienDo = f.url_file.trim();
    }

    // 2. Thêm tiến độ (nếu có nội dung hoặc nếu chỉ đính kèm file)
    const noiDungTD = nd || (f ? `Đính kèm tài liệu: ${f.ten_file.trim()}` : '');
    if (noiDungTD) {
      await taoTienDoDuAnMoi(
        {
          du_an_id: id,
          tinh_hinh_hien_tai: noiDungTD,
          hanh_dong_tiep_theo: null,
          deadline_hanh_dong: null,
          link_tai_lieu: urlFileChoTienDo,
          nguoi_tao_id: nguoiDungHienTai?.id ?? null
        },
        hda?.ten_du_an ?? null
      );
    }

    await taiLai();
  };

  const xuLyXoaTaiLieu = async (tl: TaiLieuDuAn) => {
    if (!id) return;
    try {
      await xoaTaiLieuDuAn(tl.id, nguoiDungHienTai ?? null);
      await taiLai();
    } catch {}
  };

  const taiLai = useCallback(async () => {
    if (!id) return;
    setDangTai(true);
    setErrTai(null);
    try {
      const results = await Promise.allSettled([
        layChiTietHoSoDuAn(id),
        danhSachBaoCaoCongViec({ du_an_id: id, trang_thai_du_lieu: 'hoat_dong' }),
        danhSachKhachHang({ trang_thai: 'hoat_dong' }),
        danhSachNguoiLienHe({}),
        danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' } as any),
        danhSachTienDoDuAn({ du_an_id: id, trang_thai_du_lieu: 'hoat_dong' }),
        danhSachTaiLieuDuAn({ du_an_id: id }),
        danhSachNhatKyHoatDong({ ban_ghi_id: id, module: 'ho_so_du_an' }),
        danhSachChiNhanh(),
        danhSachPhongBan(),
        danhSachSanPhamDichVu({ trang_thai_du_lieu: 'hoat_dong' })
      ]);
      const kq1Raw = results[0].status === 'fulfilled' ? results[0].value : null;
      const kq3 = results[1].status === 'fulfilled' ? results[1].value : { mang: [] };
      const kq4 = results[2].status === 'fulfilled' ? results[2].value : { mang: [] };
      const kq5 = results[3].status === 'fulfilled' ? results[3].value : { mang: [] };
      const kq6 = results[4].status === 'fulfilled' ? results[4].value : { mang: [] };
      const kqTD = results[5].status === 'fulfilled' ? results[5].value : { mang: [] };
      const kq7a = results[6].status === 'fulfilled' ? results[6].value : { mang: [] };
      const kq7b = results[7].status === 'fulfilled' ? results[7].value : { mang: [] };
      const kqCN = results[8].status === 'fulfilled' ? results[8].value : { mang: [] };
      const kqPB = results[9].status === 'fulfilled' ? results[9].value : { mang: [] };
      const kqSP = results[10].status === 'fulfilled' ? results[10].value : { mang: [] };
      let kq1 = kq1Raw;
      if (!kq1) {
        try {
          const fallback = await danhSachHoSoDuAn({ trang_thai: 'tat_ca' });
          kq1 = fallback.mang.find((x) => x.id === id) ?? null;
        } catch {}
      }
      if (!kq1) {
        try {
          const fallbackAll = await danhSachHoSoDuAn({});
          kq1 = fallbackAll.mang.find((x) => x.id === id) ?? null;
        } catch {}
      }
      if (!kq1) {
        setHda(null);
        return;
      }
      setHda(kq1);
      setDsBCCV(kq3.mang);
      setDsKH(kq4.mang);
      setDsNLH(kq5.mang);
      setDsNS(kq6.mang);
      setDsTL(kq7a.mang);
      setDsNK(kq7b.mang);
      setDsTD(kqTD.mang);
      setDsChiNhanh(kqCN.mang ?? []);
      setDsPhongBan(kqPB.mang ?? []);
      setDsSanPham(kqSP.mang ?? []);
    } catch (e: any) {
      setErrTai(e?.message ?? 'Tải thất bại');
    } finally {
      setDangTai(false);
    }
  }, [id]);

  const [dangChinhSua, setDangChinhSua] = useState(false);
  const [dangXuLyLuuDA, setDangXuLyLuuDA] = useState(false);
  const [loiLuuDA, setLoiLuuDA] = useState<string | null>(null);

  const [formSuaDA, setFormSuaDA] = useState<{
    ten_du_an: string;
    ma_ho_so: string;
    muc_do_tiem_nang: string;
    san_pham_dich_vu_id: string;
    san_pham_khac_mo_ta: string;
    chi_nhanh_id: string;
    phong_ban_id: string;
    khach_hang_id: string;
    nguoi_lien_he_id: string;
    nguoi_quan_ly_id: string;
    nguoi_phu_trach_id: string;
    danh_sach_nguoi_ho_tro_ids: string[];
    gia_tri_du_kien: number;
    gia_tri_hop_dong: number;
    ngay_tao_ho_so: string;
    thoi_han_hoan_thanh: string;
    mo_ta: string;
    ghi_chu: string;
  }>({
    ten_du_an: '',
    ma_ho_so: '',
    muc_do_tiem_nang: 'trung_binh',
    san_pham_dich_vu_id: '',
    san_pham_khac_mo_ta: '',
    chi_nhanh_id: '',
    phong_ban_id: '',
    khach_hang_id: '',
    nguoi_lien_he_id: '',
    nguoi_quan_ly_id: '',
    nguoi_phu_trach_id: '',
    danh_sach_nguoi_ho_tro_ids: [],
    gia_tri_du_kien: 0,
    gia_tri_hop_dong: 0,
    ngay_tao_ho_so: '',
    thoi_han_hoan_thanh: '',
    mo_ta: '',
    ghi_chu: ''
  });

  const batDauChinhSua = () => {
    if (!hda) return;
    setFormSuaDA({
      ten_du_an: hda.ten_du_an || '',
      ma_ho_so: hda.ma_ho_so || '',
      muc_do_tiem_nang: hda.muc_do_tiem_nang || 'trung_binh',
      san_pham_dich_vu_id: hda.san_pham_dich_vu_id || '',
      san_pham_khac_mo_ta: hda.san_pham_khac_mo_ta || '',
      chi_nhanh_id: hda.chi_nhanh_id || '',
      phong_ban_id: hda.phong_ban_id || '',
      khach_hang_id: hda.khach_hang_id || '',
      nguoi_lien_he_id: hda.nguoi_lien_he_id || '',
      nguoi_quan_ly_id: hda.nguoi_quan_ly_id || '',
      nguoi_phu_trach_id: hda.nguoi_phu_trach_id || '',
      danh_sach_nguoi_ho_tro_ids: Array.isArray(hda.danh_sach_nguoi_ho_tro_ids) ? [...hda.danh_sach_nguoi_ho_tro_ids] : [],
      gia_tri_du_kien: Number(hda.gia_tri_du_kien) || 0,
      gia_tri_hop_dong: Number(hda.gia_tri_hop_dong) || 0,
      ngay_tao_ho_so: hda.ngay_tao_ho_so || '',
      thoi_han_hoan_thanh: hda.thoi_han_hoan_thanh || '',
      mo_ta: hda.mo_ta || '',
      ghi_chu: hda.ghi_chu || ''
    });
    setLoiLuuDA(null);
    setDangChinhSua(true);
    setTabHienTai('thong_tin');
  };

  const huyChinhSua = () => {
    setDangChinhSua(false);
    setLoiLuuDA(null);
  };

  const xuLyLuuChinhSuaDA = async () => {
    if (!hda) return;
    const ten = formSuaDA.ten_du_an.trim();
    if (!ten) {
      setLoiLuuDA('Tên dự án không được để trống.');
      return;
    }
    setDangXuLyLuuDA(true);
    setLoiLuuDA(null);
    try {
      await capNhatHoSoDuAn(
        {
          id: hda.id,
          ten_du_an: ten,
          ma_ho_so: formSuaDA.ma_ho_so.trim() || '',
          muc_do_tiem_nang: formSuaDA.muc_do_tiem_nang as any,
          san_pham_dich_vu_id: formSuaDA.san_pham_dich_vu_id || null,
          san_pham_khac_mo_ta: formSuaDA.san_pham_khac_mo_ta.trim() || null,
          chi_nhanh_id: formSuaDA.chi_nhanh_id || null,
          phong_ban_id: formSuaDA.phong_ban_id || null,
          khach_hang_id: formSuaDA.khach_hang_id || null,
          nguoi_lien_he_id: formSuaDA.nguoi_lien_he_id || null,
          nguoi_quan_ly_id: formSuaDA.nguoi_quan_ly_id || null,
          nguoi_phu_trach_id: formSuaDA.nguoi_phu_trach_id || null,
          danh_sach_nguoi_ho_tro_ids: formSuaDA.danh_sach_nguoi_ho_tro_ids,
          gia_tri_du_kien: Number(formSuaDA.gia_tri_du_kien) || 0,
          gia_tri_hop_dong: Number(formSuaDA.gia_tri_hop_dong) || 0,
          ngay_tao_ho_so: formSuaDA.ngay_tao_ho_so || null,
          thoi_han_hoan_thanh: formSuaDA.thoi_han_hoan_thanh || null,
          mo_ta: formSuaDA.mo_ta.trim() || null,
          ghi_chu: formSuaDA.ghi_chu.trim() || null
        },
        nguoiDungHienTai ?? null
      );
      setDangChinhSua(false);
      await taiLai();
    } catch (err: any) {
      setLoiLuuDA(err?.message ?? 'Lưu hồ sơ dự án thất bại');
    } finally {
      setDangXuLyLuuDA(false);
    }
  };

  const [dangXuLyKhac, setDangXuLyKhac] = useState<Record<string, boolean>>({});

  const giaiDoanTiepTheo = useMemo(() => {
    if (!hda?.giai_doan) return null;
    const idx = GIAI_DOAN_DANG_TRIEN_KHAI.indexOf(String(hda.giai_doan));
    if (idx >= 0 && idx < GIAI_DOAN_DANG_TRIEN_KHAI.length - 1) {
      return GIAI_DOAN_DANG_TRIEN_KHAI[idx + 1];
    }
    return null;
  }, [hda?.giai_doan]);

  const xuLyChuyenGiaiDoan = async () => {
    if (!hda) return;
    const key = 'cgd_detail';
    setDangXuLyKhac((o) => ({ ...o, [key]: true }));
    try {
      const viTriHienTai = GIAI_DOAN_DANG_TRIEN_KHAI.indexOf(String(hda.giai_doan));
      let giaiDoanMoi: GiaiDoanDuAn = 'moi_tao';
      if (viTriHienTai >= 0 && viTriHienTai < GIAI_DOAN_DANG_TRIEN_KHAI.length - 1) {
        giaiDoanMoi = GIAI_DOAN_DANG_TRIEN_KHAI[viTriHienTai + 1] as GiaiDoanDuAn;
      } else if (hda.giai_doan === 'hoan_thanh' || hda.giai_doan === 'huy' || hda.giai_doan === 'tam_dung') {
        giaiDoanMoi = 'moi_tao';
      } else {
        giaiDoanMoi = 'hoan_thanh';
      }
      await doiGiaiDoanHoSoDuAn(hda.id, giaiDoanMoi, nguoiDungHienTai ?? null);
      await taiLai();
    } finally {
      setDangXuLyKhac((o) => ({ ...o, [key]: false }));
    }
  };

  const xuLyXoaMem = async () => {
    if (!hda) return;
    const key = 'xoa_detail';
    setDangXuLyKhac((o) => ({ ...o, [key]: true }));
    try {
      await doiTrangThaiHoSoDuAn(hda.id, 'da_xoa', nguoiDungHienTai ?? null);
      router.push('/ho-so-du-an');
    } finally {
      setDangXuLyKhac((o) => ({ ...o, [key]: false }));
    }
  };



  useEffect(() => {
    if (!id) return;
    void taiLai();
  }, [id, taiLai]);

  useEffect(() => {
    const bayGio = new Date();
    const ngayHomNay = bayGio.toISOString().slice(0, 10);
    const hanChuyenTiepTheoMs = 2 * 24 * 60 * 60 * 1000;
    const kq = dsTD.map((td) => {
      let cb: 'sap_den' | 'qua_han' | null = null;
      if (td.trang_thai_hanh_dong !== 'da_hoan_thanh' && td.deadline_hanh_dong) {
        const dl = new Date(td.deadline_hanh_dong + 'T23:59:59').getTime();
        const nowMs = bayGio.getTime();
        if (td.deadline_hanh_dong < ngayHomNay && td.trang_thai_hanh_dong !== 'qua_han') {
          cb = 'qua_han';
          void (async () => {
            try {
              await capNhatTienDoDuAn(
                td.id,
                { trang_thai_hanh_dong: 'qua_han' },
                {
                  nguoi_thuc_hien_id: nguoiDungHienTai?.id ?? null,
                  du_an_id: hda?.id ?? null,
                  ten_du_an: hda?.ten_du_an ?? null
                }
              );
            } catch {}
          })();
        } else if (dl - nowMs <= hanChuyenTiepTheoMs && td.trang_thai_hanh_dong !== 'qua_han') {
          cb = 'sap_den';
        }
      }
      return { ...td, canh_bao: cb };
    });
    setDsTDKemCanhBao(kq);
  }, [dsTD, hda?.id, hda?.ten_du_an, nguoiDungHienTai?.id]);

  const tabs = useMemo(() => {
    return DS_TAB.map((t) => {
      if (t.key === 'tien_do') return { ...t, dem: dsTD.length };
      if (t.key === 'tai_lieu') return { ...t, dem: dsTL.length };
      return t;
    });
  }, [dsTD.length, dsTL.length]);

  const CAC_GIAI_DOAN_OPT: Array<{ value: GiaiDoanDuAn | string; nhan: string }> = [
    { value: 'moi_tao', nhan: '1. Mới tạo' },
    { value: 'tiep_can', nhan: '2. Tiếp cận' },
    { value: 'khao_sat', nhan: '3. Khảo sát' },
    { value: 'len_giai_phap', nhan: '4. Lên giải pháp' },
    { value: 'bao_gia', nhan: '5. Báo giá' },
    { value: 'dam_phan', nhan: '6. Đàm phán' },
    { value: 'ky_hop_dong', nhan: '7. Ký hợp đồng' },
    { value: 'trien_khai', nhan: '8. Triển khai' },
    { value: 'nghiem_thu', nhan: '9. Nghiệm thu' },
    { value: 'hoan_thanh', nhan: '✓ Hoàn thành' },
    { value: 'tam_dung', nhan: '⏸ Tạm dừng' },
    { value: 'huy', nhan: '✕ Đã hủy' }
  ];

  const [tamGiaiDoan, setTamGiaiDoan] = useState<string>('');
  const [tamTrangThai, setTamTrangThai] = useState<'hoat_dong' | 'da_xoa' | ''>('');
  const [moModalHuy, setMoModalHuy] = useState<boolean>(false);

  useEffect(() => {
    if (hda) {
      setTamGiaiDoan(String(hda.giai_doan ?? 'moi_tao'));
      setTamTrangThai((hda.trang_thai as any) ?? 'hoat_dong');
    }
  }, [hda]);

  const xuLyDoiGiaiDoanThuCong = async () => {
    if (!hda || !tamGiaiDoan) return;
    if (tamGiaiDoan === 'huy') {
      setMoModalHuy(true);
      return;
    }
    const key = 'cgd_manual';
    setDangXuLyKhac((o) => ({ ...o, [key]: true }));
    try {
      await doiGiaiDoanHoSoDuAn(hda.id, tamGiaiDoan as any, nguoiDungHienTai ?? null);
      await taiLai();
    } finally {
      setDangXuLyKhac((o) => ({ ...o, [key]: false }));
    }
  };

  const xuLyXacNhanHuy = async (lyDo: string, ghiChu?: string) => {
    if (!hda) return;
    const key = 'cgd_manual';
    setDangXuLyKhac((o) => ({ ...o, [key]: true }));
    try {
      await doiGiaiDoanHoSoDuAn(hda.id, 'huy', nguoiDungHienTai ?? null, {
        ly_do_that_bai: lyDo,
        ghi_chu_that_bai: ghiChu
      });
      setMoModalHuy(false);
      await taiLai();
    } finally {
      setDangXuLyKhac((o) => ({ ...o, [key]: false }));
    }
  };

  const xuLyDoiTrangThaiThuCong = async () => {
    if (!hda || !tamTrangThai) return;
    const key = 'ctt_manual';
    setDangXuLyKhac((o) => ({ ...o, [key]: true }));
    try {
      await doiTrangThaiHoSoDuAn(hda.id, tamTrangThai as any, nguoiDungHienTai ?? null);
      if (tamTrangThai === 'da_xoa') {
        router.push('/ho-so-du-an');
        return;
      }
      await taiLai();
    } finally {
      setDangXuLyKhac((o) => ({ ...o, [key]: false }));
    }
  };

  const kh = hda?.khach_hang_id ? dsKH.find((x) => x.id === hda.khach_hang_id) ?? null : null;
  const nlh = hda?.nguoi_lien_he_id ? dsNLH.find((x) => x.id === hda.nguoi_lien_he_id) ?? null : null;
  const nql = hda?.nguoi_quan_ly_id ? dsNS.find((x) => x.id === hda.nguoi_quan_ly_id) ?? null : null;
  const npt = hda?.nguoi_phu_trach_id ? dsNS.find((x) => x.id === hda.nguoi_phu_trach_id) ?? null : null;

  const tuoiDuAn = useMemo(() => {
    const hnay = new Date();
    const tinhNgay = (ngayStr: string | null | undefined): string => {
      if (!ngayStr) return '—';
      const ms = Math.max(0, hnay.getTime() - new Date(ngayStr).getTime());
      const ngay = Math.floor(ms / (24 * 60 * 60 * 1000));
      if (ngay === 0) return 'Hôm nay';
      if (ngay === 1) return '1 ngày';
      return `${ngay} ngày`;
    };
    return {
      tu_tao_duoc: tinhNgay(hda?.ngay_tao),
      cap_nhat_cuoi: tinhNgay(hda?.ngay_cap_nhat)
    };
  }, [hda?.ngay_tao, hda?.ngay_cap_nhat]);
  const dsNHT = useMemo(() => {
    if (!hda?.danh_sach_nguoi_ho_tro_ids?.length) return [];
    return (hda.danh_sach_nguoi_ho_tro_ids as string[])
      .map((nid) => dsNS.find((x) => x.id === nid) ?? null)
      .filter(Boolean) as NhanSu[];
  }, [hda?.danh_sach_nguoi_ho_tro_ids, dsNS]);


  const xuLyXoaTienDo = async (td: TienDoDuAn) => {
    if (!id) return;
    try {
      await xoaMemTienDoDuAn(td.id, {
        nguoi_thuc_hien_id: nguoiDungHienTai?.id ?? null,
        du_an_id: hda?.id ?? null,
        ten_du_an: hda?.ten_du_an ?? null
      });
      await taiLai();
    } catch {}
  };

  const duocQuyenXem = useMemo(() => {
    if (!hda || !nguoiDungHienTai) return false;
    return duocXemHoSoDuAn(nguoiDungHienTai, hda);
  }, [hda, nguoiDungHienTai]);

  if (!dangTai && hda && !duocQuyenXem) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Không có quyền truy cập</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn không có quyền xem hồ sơ dự án này. Bạn chỉ có thể xem các dự án do mình phụ trách, quản lý, hỗ trợ hoặc thuộc thẩm quyền phòng ban.
          </p>
        </div>
        <Link
          href="/ho-so-du-an"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-input)] bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách dự án
        </Link>
      </div>
    );
  }

  if (!hda && !dangTai) {
    try {
      notFound();
    } catch {
      return (
        <div className="p-6 text-center">
          <p className="text-slate-500 mb-4">Không tìm thấy hồ sơ dự án</p>
          <Link
            href="/ho-so-du-an"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            <ArrowLeft className="size-4" /> Quay lại danh sách
          </Link>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header Bar chuẩn Enterprise SaaS */}
      <div className="space-y-3 pb-2 border-b border-border">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/ho-so-du-an" className="hover:text-foreground transition inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" />
            Danh sách hồ sơ dự án
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-[320px]">
            {hda?.ten_du_an ?? 'Đang tải...'}
          </span>
        </div>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex items-start gap-3.5">
            <div className="size-11 rounded-[var(--radius-card)] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs mt-0.5">
              <FolderKanban className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
                  {hda?.ten_du_an ?? 'Hồ sơ dự án'}
                </h1>
                {hda && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Luôn hiển thị giai đoạn hiện tại */}
                    <BadgeGiaiDoan value={hda.giai_doan} />

                    {/* Các stick phụ ẩn trên điện thoại để tinh gọn giao diện */}
                    {hda.ma_ho_so && (
                      <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-md bg-muted text-foreground font-mono text-[11px] font-semibold border border-border">
                        {hda.ma_ho_so}
                      </span>
                    )}
                    {kh && (
                      <Link
                        href={`/khach-hang/${kh.id}`}
                        className="hidden sm:inline-flex items-center hover:opacity-85 transition"
                        title="Xem chi tiết khách hàng"
                      >
                        <Hieu kieu="primary" kich_thuoc="sm" icon_trai={Users}>
                          {kh.ten_khach_hang}
                          <ExternalLink className="size-3 ml-1 inline opacity-70" />
                        </Hieu>
                      </Link>
                    )}
                    {hda.muc_do_tiem_nang && (
                      <span className="hidden sm:inline-flex">
                        <Hieu kieu="warning" kich_thuoc="sm">
                          TN: {TEN_TIEM_NANG[hda.muc_do_tiem_nang] ?? hda.muc_do_tiem_nang}
                        </Hieu>
                      </span>
                    )}
                    {hda.trang_thai === 'da_xoa' && (
                      <Hieu kieu="danger" kich_thuoc="sm">
                        Đã xóa (tạm)
                      </Hieu>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {hda && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {dangChinhSua ? (
                <>
                  <Nut
                    kieu="outline"
                    kich_thuoc="sm"
                    icon_trai={X}
                    onClick={huyChinhSua}
                    disabled={dangXuLyLuuDA}
                  >
                    Hủy
                  </Nut>
                  <Nut
                    kieu="primary"
                    kich_thuoc="sm"
                    icon_trai={dangXuLyLuuDA ? Loader2 : CheckCircle2}
                    onClick={xuLyLuuChinhSuaDA}
                    disabled={dangXuLyLuuDA}
                    className="font-bold shadow-sm"
                  >
                    {dangXuLyLuuDA ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Nut>
                </>
              ) : (
                <>
                  <Nut
                    kieu="primary"
                    kich_thuoc="sm"
                    icon_trai={Pencil}
                    onClick={batDauChinhSua}
                    className="font-bold shadow-sm"
                  >
                    Chỉnh sửa dự án
                  </Nut>
                  <Nut
                    kieu="danger"
                    kich_thuoc="sm"
                    icon_trai={dangXuLyKhac['xoa_detail'] ? Loader2 : Trash2}
                    onClick={xuLyXoaMem}
                    disabled={dangXuLyKhac['xoa_detail'] || hda.trang_thai === 'da_xoa'}
                    className="font-semibold"
                  >
                    Xóa
                  </Nut>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Thông báo lỗi lưu hoặc Banner chế độ chỉnh sửa dự án */}
      {loiLuuDA && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{loiLuuDA}</span>
        </div>
      )}
      {dangChinhSua && (
        <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="flex items-center gap-2">
            <Pencil className="size-4 shrink-0" /> Chế độ chỉnh sửa thông tin dự án đang mở tại tab "Giải pháp & Yêu cầu". Hãy điều chỉnh các thông tin và nhấn "Lưu thay đổi".
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={huyChinhSua}
              disabled={dangXuLyLuuDA}
              className="px-2.5 py-1 rounded-md border border-border bg-background text-foreground hover:bg-muted text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={xuLyLuuChinhSuaDA}
              disabled={dangXuLyLuuDA}
              className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              {dangXuLyLuuDA ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Cảnh báo nếu dự án đã hủy */}
      {hda?.giai_doan === 'huy' && (
        <div className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm">
          <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm sm:text-base text-rose-800">Dự án đã kết thúc với trạng thái: Đã hủy (Thất bại)</div>
            <div className="text-xs sm:text-sm mt-1 text-rose-700">
              <span className="font-bold">Nguyên nhân / Lý do:</span> {hda.ly_do_that_bai || 'Chưa có lý do cụ thể'}
              {hda.ghi_chu_that_bai && (
                <div className="mt-1 text-rose-600 italic">
                  Ghi chú chi tiết: {hda.ghi_chu_that_bai}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh trượt chuyển tiếp giai đoạn dự án (Slide Stepper tinh gọn) */}
      <div className="rounded-[22px] border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div
          ref={stepperContainerRef}
          className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          <div className="flex items-center min-w-[760px] justify-between px-1">
            {[
              { key: 'moi_tao', stt: 1, label: 'Mới tạo' },
              { key: 'tiep_can', stt: 2, label: 'Tiếp cận' },
              { key: 'khao_sat', stt: 3, label: 'Khảo sát' },
              { key: 'len_giai_phap', stt: 4, label: 'Giải pháp' },
              { key: 'bao_gia', stt: 5, label: 'Báo giá' },
              { key: 'dam_phan', stt: 6, label: 'Đàm phán' },
              { key: 'ky_hop_dong', stt: 7, label: 'Ký HĐ' },
              { key: 'trien_khai', stt: 8, label: 'Triển khai' },
              { key: 'nghiem_thu', stt: 9, label: 'Nghiệm thu' },
              { key: 'hoan_thanh', stt: 10, label: 'Hoàn thành' }
            ].map((step, idx, arr) => {
              const currentIdx = arr.findIndex((x) => x.key === hda?.giai_doan);
              const isPast = currentIdx >= 0 && idx < currentIdx;
              const isCurrent = hda?.giai_doan === step.key;

              return (
                <div
                  key={step.key}
                  data-stage-key={step.key}
                  className="flex-1 flex items-center min-w-0 first:flex-none"
                >
                  {idx > 0 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 transition-colors mx-1.5',
                        isPast || isCurrent ? 'bg-[#007AFF]' : 'bg-slate-200'
                      )}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (hda?.trang_thai === 'da_xoa') return;
                      setTamGiaiDoan(step.key);
                      void doiGiaiDoanHoSoDuAn(hda!.id, step.key as any, nguoiDungHienTai ?? null).then(taiLai);
                    }}
                    title={`Chuyển sang ${step.label}`}
                    className="flex flex-col items-center gap-1.5 px-1 py-1 group shrink-0 active:scale-95 transition"
                  >
                    <div
                      className={cn(
                        'size-7 sm:size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        isCurrent
                          ? 'bg-[#007AFF] text-white ring-4 ring-[#007AFF]/20 shadow-xs'
                          : isPast
                          ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/30'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                      )}
                    >
                      {isPast ? <CheckCircle2 className="size-4 text-[#007AFF]" /> : step.stt}
                    </div>
                    <span
                      className={cn(
                        'text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors',
                        isCurrent
                          ? 'text-[#007AFF] font-extrabold'
                          : isPast
                          ? 'text-slate-800 font-semibold'
                          : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    >
                      {step.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Bố cục 2 cột Enterprise SaaS 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT CHÍNH (Trái ~68% - 8 cột) */}
        <div className="lg:col-span-8 space-y-6">

          <div className="rounded-[22px] border border-slate-200/90 bg-white overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <BoCacTab
              gia_tri={tabHienTai}
              gia_tri_mac_dinh="tien_do"
              on_gia_tri_thay_doi={(gt) => setTabHienTai(gt as TenTab)}
            >
              <div className="border-b border-slate-200/80 px-4 pt-3 pb-3 bg-slate-50/50">
                <DanhSachNutTab>
                  {tabs.map((t) => (
                    <NutTab
                      key={t.key}
                      gia_tri={t.key}
                      icon_trai={t.bieuTuong}
                      so_luong={typeof t.dem === 'number' ? t.dem : undefined}
                    >
                      {t.nhan}
                    </NutTab>
                  ))}
                </DanhSachNutTab>
              </div>

              <div className="p-5 sm:p-6">
                <NoiDungTab gia_tri="tien_do">
                  <BanNhatKyVaTienDo
                    dsTD={dsTDKemCanhBao}
                    dangTai={dangTai}
                    err={errTai}
                    dsNS={dsNS}
                    onTao={xuLyThemCapNhatTongHop}
                    onXoaTD={xuLyXoaTienDo}
                  />
                </NoiDungTab>
                <NoiDungTab gia_tri="tai_lieu">
                  <BanKhoTaiLieu
                    dsTL={dsTL}
                    dangTai={dangTai}
                    err={errTai}
                    dsNS={dsNS}
                    onThemTL={async (f) => {
                      if (!id) return;
                      await themTaiLieuDuAn(
                        {
                          du_an_id: id,
                          ten_file: f.ten_file.trim(),
                          url_file: f.url_file.trim(),
                          loai_file: f.loai_file || 'link_khac',
                          ghi_chu: f.ghi_chu?.trim() || null,
                          nguoi_tai_len_id: nguoiDungHienTai?.id ?? null
                        },
                        nguoiDungHienTai ?? null
                      );
                      await taiLai();
                    }}
                    onXoaTL={xuLyXoaTaiLieu}
                  />
                </NoiDungTab>
                <NoiDungTab gia_tri="thong_tin">
                  <BanThongTinHDA
                    hda={hda}
                    dangTai={dangTai}
                    kh={kh}
                    nlh={nlh}
                    nql={nql}
                    npt={npt}
                    dsNHT={dsNHT}
                    dsChiNhanh={dsChiNhanh}
                    dsPhongBan={dsPhongBan}
                    dsSanPham={dsSanPham}
                    router={router}
                    anGiaTri={laBackOffice}
                    dangChinhSua={dangChinhSua}
                    formSuaDA={formSuaDA}
                    setFormSuaDA={setFormSuaDA}
                    dsKH={dsKH}
                    dsNLH={dsNLH}
                    dsNS={dsNS}
                  />
                </NoiDungTab>
              </div>
            </BoCacTab>
          </div>
        </div>

        {/* CỘT PHỤ (Phải ~32% - 4 cột) */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Thẻ Tài chính & Tiềm năng */}
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block border-b border-slate-100 pb-3">
              Tài chính & Hiệu quả
            </span>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Giá trị dự kiến</div>
                  <div className="text-lg font-black text-foreground tabular-nums mt-0.5">
                    {laBackOffice ? '***' : hda?.gia_tri_du_kien ? formatTien(hda.gia_tri_du_kien) : '0 ₫'}
                  </div>
                </div>
                <div className="size-9 rounded-[13px] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target className="size-4" />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Giá trị hợp đồng</div>
                  <div className="text-lg font-black text-[#007AFF] tabular-nums mt-0.5">
                    {laBackOffice ? '***' : hda?.gia_tri_hop_dong ? formatTien(hda.gia_tri_hop_dong) : 'Chưa ký HĐ'}
                  </div>
                </div>
                <div className="size-9 rounded-[13px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                  <Wallet className="size-4" />
                </div>
              </div>

              {hda?.muc_do_tiem_nang && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs">
                  <span className="text-muted-foreground font-medium">Mức độ tiềm năng:</span>
                  <Hieu kieu="warning" kich_thuoc="sm">
                    {TEN_TIEM_NANG[hda.muc_do_tiem_nang] ?? hda.muc_do_tiem_nang}
                  </Hieu>
                </div>
              )}

            </div>
          </div>

          {/* 2. Thẻ Khách hàng */}
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Đối tác khách hàng
              </span>
              {kh && (
                <Link
                  href={`/khach-hang/${kh.id}`}
                  className="text-xs text-[#007AFF] font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  Xem hồ sơ <ExternalLink className="size-3" />
                </Link>
              )}
            </div>

            {kh ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-bold text-foreground text-base">{kh.ten_khach_hang}</div>
                  {kh.ma_so_thue && (
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">MST: {kh.ma_so_thue}</div>
                  )}
                </div>

                {nlh ? (
                  <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Người liên hệ chính
                    </div>
                    <div className="flex items-center gap-2.5">
                      <DaiDien ten={nlh.ho_va_ten} kich_thuoc="sm" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">{nlh.ho_va_ten}</div>
                        {nlh.chuc_vu && <div className="text-[11px] text-[#007AFF]">{nlh.chuc_vu}</div>}
                      </div>
                    </div>
                    {nlh.so_dien_thoai && (
                      <a href={`tel:${nlh.so_dien_thoai}`} className="flex items-center gap-1.5 text-xs text-[#007AFF] font-mono hover:underline">
                        <Phone className="size-3" /> {nlh.so_dien_thoai}
                      </a>
                    )}
                    {nlh.email && (
                      <a href={`mailto:${nlh.email}`} className="flex items-center gap-1.5 text-xs text-[#007AFF] truncate hover:underline">
                        <Mail className="size-3" /> {nlh.email}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">Chưa gắn người liên hệ chính</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">Chưa gán khách hàng</div>
            )}
          </div>

          {/* 3. Thẻ Đội ngũ thực hiện */}
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block border-b border-slate-100 pb-3">
              Đội ngũ phụ trách
            </span>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <DaiDien ten={nql?.ho_va_ten ?? 'PM'} anh={nql?.url_anh_dai_dien ?? undefined} kich_thuoc="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Quản lý dự án (PM)</div>
                  <div className="font-bold text-foreground truncate">{nql?.ho_va_ten ?? 'Chưa phân công'}</div>
                  {nql?.email && <div className="text-xs text-muted-foreground truncate">{nql.email}</div>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DaiDien ten={npt?.ho_va_ten ?? 'PT'} anh={npt?.url_anh_dai_dien ?? undefined} kich_thuoc="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Phụ trách chính (PIC)</div>
                  <div className="font-bold text-foreground truncate">{npt?.ho_va_ten ?? 'Chưa phân công'}</div>
                  {npt?.email && <div className="text-xs text-muted-foreground truncate">{npt.email}</div>}
                </div>
              </div>

              {dsNHT.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-2">Thành viên hỗ trợ ({dsNHT.length})</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dsNHT.map((ns) => (
                      <span key={ns.id} title={ns.ho_va_ten}>
                        <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien ?? undefined} kich_thuoc="xs" />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Thẻ Thời hạn & Tuổi dự án */}
          <div className="rounded-[22px] border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block border-b border-slate-100 pb-3">
              Thời gian & Tiến độ
            </span>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
                <span className="text-muted-foreground">Đã tạo được:</span>
                <span className="font-bold text-foreground">{tuoiDuAn.tu_tao_duoc}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
                <span className="text-muted-foreground">Cập nhật cuối:</span>
                <span className="font-bold text-foreground">{tuoiDuAn.cap_nhat_cuoi}</span>
              </div>
              {hda?.thoi_han_hoan_thanh && (
                <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-muted-foreground">Hạn hoàn thành:</span>
                  <span className="font-bold text-[#007AFF]">{formatNgay(hda.thoi_han_hoan_thanh)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalLyDoHuyDuAn
        mo={moModalHuy}
        onDong={() => {
          setMoModalHuy(false);
          if (hda) setTamGiaiDoan(String(hda.giai_doan ?? 'moi_tao'));
        }}
        onXacNhan={xuLyXacNhanHuy}
        dangXuLy={!!dangXuLyKhac['cgd_manual']}
      />


    </div>
  );
}


function CardThongKe({ icon: Icon, label, value, gradient, dangTai, right }: any) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 bg-gradient-to-br text-white shadow-sm shadow-slate-200',
        gradient
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Icon className="size-4" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">{label}</span>
          </div>
          {dangTai ? (
            <div className="h-7 w-28 bg-white/20 animate-pulse rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold break-words">{value}</div>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}

function RightBar({ phanTram }: { phanTram: number }) {
  return (
    <div className="w-24">
      <Thanh_Tien_Do
        phan_tram={phanTram}
        kieu="success"
        kich_thuoc="sm"
        className="[&_div]:bg-white/90 [&>div]:bg-white/30"
      />
      <div className="text-[10px] opacity-80 mt-1 text-right font-bold">{phanTram}%</div>
    </div>
  );
}

const GIAI_DOAN_DA_SO_THU_TU: Array<{ k: string; so: number; mau: 'from-slate-500 to-slate-700' | 'from-indigo-500 to-blue-600' | 'from-amber-500 to-orange-600' | 'from-emerald-500 to-teal-600' | 'from-rose-500 to-pink-600' | 'from-yellow-500 to-amber-600' }> = [
  { k: 'moi_tao', so: 1, mau: 'from-slate-500 to-slate-700' },
  { k: 'tiep_can', so: 2, mau: 'from-indigo-500 to-blue-600' },
  { k: 'khao_sat', so: 3, mau: 'from-indigo-500 to-blue-600' },
  { k: 'len_giai_phap', so: 4, mau: 'from-indigo-500 to-blue-600' },
  { k: 'bao_gia', so: 5, mau: 'from-amber-500 to-orange-600' },
  { k: 'dam_phan', so: 6, mau: 'from-amber-500 to-orange-600' },
  { k: 'ky_hop_dong', so: 7, mau: 'from-yellow-500 to-amber-600' },
  { k: 'trien_khai', so: 8, mau: 'from-indigo-500 to-blue-600' },
  { k: 'nghiem_thu', so: 9, mau: 'from-indigo-500 to-blue-600' },
  { k: 'hoan_thanh', so: 10, mau: 'from-emerald-500 to-teal-600' },
  { k: 'tam_dung', so: 11, mau: 'from-yellow-500 to-amber-600' },
  { k: 'huy', so: 12, mau: 'from-rose-500 to-pink-600' }
];

function CardGiaiDoanDuAn(props: {
  giaidoan: string | null;
  dangTai: boolean;
  gia_tri_hien_tai: string;
  khi_thay_doi: (v: any) => void;
  khi_luu: () => void;
  dang_xu_ly: boolean;
  khong_the_thay_doi?: boolean;
  options: Array<{ value: GiaiDoanDuAn | string; nhan: string }>;
}) {
  const { giaidoan, dangTai, gia_tri_hien_tai, khi_thay_doi, khi_luu, dang_xu_ly, khong_the_thay_doi, options } = props;
  const thongTin = GIAI_DOAN_DA_SO_THU_TU.find((x) => x.k === giaidoan) ?? { so: 1, mau: 'from-slate-500 to-slate-700' as const };
  const tenGD = TEN_GIAI_DOAN_DA[String(giaidoan)] ?? 'Đang cập nhật';
  const daThayDoi = gia_tri_hien_tai !== String(giaidoan ?? '');
  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 bg-gradient-to-br text-white shadow-sm shadow-slate-200',
        thongTin.mau
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 opacity-90">
            <FolderKanban className="size-4 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Giai đoạn</span>
          </div>
          {dangTai ? (
            <div className="h-7 w-32 bg-white/20 animate-pulse rounded-md" />
          ) : (
            <div className="text-lg sm:text-xl font-extrabold break-words leading-tight">{tenGD}</div>
          )}
        </div>
        <div className="shrink-0 size-11 rounded-xl flex items-center justify-center border border-white/25 bg-white/10 backdrop-blur-sm">
          {dangTai ? (
            <div className="h-5 w-5 rounded-full bg-white/20 animate-pulse" />
          ) : (
            <span className="text-lg font-black tabular-nums leading-none">{thongTin.so}</span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-stretch gap-2">
        <select
          value={gia_tri_hien_tai}
          onChange={(e) => khi_thay_doi(e.target.value)}
          disabled={dangTai || dang_xu_ly || khong_the_thay_doi}
          className="flex-1 min-w-0 rounded-lg bg-white/15 hover:bg-white/20 transition px-2.5 py-2 text-xs font-bold text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60 appearance-none cursor-pointer"
          style={{ backgroundImage: 'none' }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-800 text-white">{o.nhan}</option>
          ))}
        </select>
        <button
          onClick={() => khi_luu()}
          disabled={dangTai || dang_xu_ly || khong_the_thay_doi || !daThayDoi}
          className={cn(
            'shrink-0 px-3 py-2 rounded-lg text-xs font-extrabold transition',
            daThayDoi && !dang_xu_ly && !dangTai && !khong_the_thay_doi
              ? 'bg-white text-slate-800 hover:bg-slate-100 shadow-sm shadow-slate-900/10'
              : 'bg-white/15 hover:bg-white/25 text-white/90 border border-white/20'
          )}
        >
          {dang_xu_ly ? '...' : daThayDoi ? 'Lưu' : 'OK'}
        </button>
      </div>
    </div>
  );
}

function CardNguoiQuanLyVaPhuTrach({ nql, npt, dangTai }: { nql: NhanSu | null; npt: NhanSu | null; dangTai: boolean }) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm shadow-slate-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 opacity-90">
            <Users className="size-4 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Nhân sự</span>
          </div>
          {!dangTai && (nql || npt) ? (
            <DaiDien ten={nql?.ho_va_ten ?? npt?.ho_va_ten ?? 'QS'} anh={nql?.url_anh_dai_dien ?? npt?.url_anh_dai_dien ?? undefined} kich_thuoc="sm" />
          ) : null}
        </div>
        {dangTai ? (
          <>
            <div className="h-5 w-full bg-white/20 animate-pulse rounded-md" />
            <div className="h-5 w-4/5 bg-white/15 animate-pulse rounded-md" />
          </>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 min-w-0">
              <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20 text-[10.5px] font-black tracking-wider uppercase leading-none">QL</span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold break-words leading-tight truncate">
                  {nql ? nql.ho_va_ten : '—'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md bg-white/20 border border-white/20 text-[10.5px] font-black tracking-wider uppercase leading-none">PT</span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold break-words leading-tight truncate">
                  {npt ? npt.ho_va_ten : '—'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BanThongTinHDA({
  hda,
  dangTai,
  kh,
  nlh,
  nql,
  npt,
  dsNHT,
  dsChiNhanh,
  dsPhongBan,
  dsSanPham,
  router,
  anGiaTri = false,
  dangChinhSua = false,
  formSuaDA,
  setFormSuaDA,
  dsKH = [],
  dsNLH = [],
  dsNS = []
}: {
  hda: HoSoDuAn | null;
  dangTai: boolean;
  kh: KhachHang | null;
  nlh: NguoiLienHe | null;
  nql: NhanSu | null;
  npt: NhanSu | null;
  dsNHT: NhanSu[];
  dsChiNhanh: ChiNhanh[];
  dsPhongBan: PhongBan[];
  dsSanPham: SanPhamDichVu[];
  router: ReturnType<typeof useRouter>;
  anGiaTri?: boolean;
  dangChinhSua?: boolean;
  formSuaDA?: any;
  setFormSuaDA?: React.Dispatch<React.SetStateAction<any>>;
  dsKH?: KhachHang[];
  dsNLH?: NguoiLienHe[];
  dsNS?: NhanSu[];
}) {
  if (dangChinhSua && formSuaDA && setFormSuaDA) {
    const chiNhanhChon = formSuaDA.chi_nhanh_id;
    const khachHangChon = formSuaDA.khach_hang_id;
    const dsPbTheoCn = chiNhanhChon ? dsPhongBan.filter((p) => p.chi_nhanh_id === chiNhanhChon) : dsPhongBan;
    const dsNlhTheoKh = khachHangChon ? dsNLH.filter((n) => n.khach_hang_id === khachHangChon) : dsNLH;
    const dsHoTroDangChon = Array.isArray(formSuaDA.danh_sach_nguoi_ho_tro_ids) ? formSuaDA.danh_sach_nguoi_ho_tro_ids : [];

    const toggleNguoiHoTro = (nsId: string) => {
      const set = new Set<string>(dsHoTroDangChon);
      if (set.has(nsId)) set.delete(nsId);
      else set.add(nsId);
      setFormSuaDA((prev: any) => ({ ...prev, danh_sach_nguoi_ho_tro_ids: Array.from(set) }));
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cột trái */}
          <div className="space-y-5">
            <Nhom label="Thông tin cơ bản dự án">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Tên dự án <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formSuaDA.ten_du_an}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, ten_du_an: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 font-medium"
                  placeholder="Nhập tên dự án"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Mã hồ sơ</label>
                  <input
                    type="text"
                    value={formSuaDA.ma_ho_so}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, ma_ho_so: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60"
                    placeholder="Mã hồ sơ"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Mức tiềm năng</label>
                  <select
                    value={formSuaDA.muc_do_tiem_nang}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, muc_do_tiem_nang: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="rat_cao">Rất cao</option>
                    <option value="cao">Cao</option>
                    <option value="trung_binh">Trung bình</option>
                    <option value="thap">Thấp</option>
                    <option value="rat_thap">Rất thấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Sản phẩm / Dịch vụ</label>
                <select
                  value={formSuaDA.san_pham_dich_vu_id}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, san_pham_dich_vu_id: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 mb-2"
                >
                  <option value="">-- Chọn sản phẩm / dịch vụ --</option>
                  {dsSanPham.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.ten_san_pham} {sp.ma_san_pham ? `(${sp.ma_san_pham})` : ''}
                    </option>
                  ))}
                  <option value="__KHAC__">Khác (nhập chi tiết)</option>
                </select>
                <input
                  type="text"
                  value={formSuaDA.san_pham_khac_mo_ta}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, san_pham_khac_mo_ta: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  placeholder="Mô tả cụ thể gói/phiên bản sản phẩm (nếu có)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Chi nhánh</label>
                  <select
                    value={formSuaDA.chi_nhanh_id}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, chi_nhanh_id: e.target.value, phong_ban_id: '' }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="">-- Chưa chọn --</option>
                    {dsChiNhanh.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ten_chi_nhanh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Phòng ban</label>
                  <select
                    value={formSuaDA.phong_ban_id}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, phong_ban_id: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="">-- Chưa chọn --</option>
                    {dsPbTheoCn.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.ten_phong_ban}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Thời hạn hoàn thành</label>
                <input
                  type="date"
                  value={formSuaDA.thoi_han_hoan_thanh}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, thoi_han_hoan_thanh: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                />
              </div>
            </Nhom>

            <Nhom label="Tài chính">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Giá trị dự kiến (₫)</label>
                  <input
                    type="number"
                    disabled={anGiaTri}
                    value={anGiaTri ? '' : formSuaDA.gia_tri_du_kien}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, gia_tri_du_kien: Number(e.target.value) || 0 }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60 disabled:opacity-50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Giá trị hợp đồng (₫)</label>
                  <input
                    type="number"
                    disabled={anGiaTri}
                    value={anGiaTri ? '' : formSuaDA.gia_tri_hop_dong}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, gia_tri_hop_dong: Number(e.target.value) || 0 }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60 disabled:opacity-50"
                    placeholder="0"
                  />
                </div>
              </div>
            </Nhom>

            <Nhom label="Mô tả & Ghi chú">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Mô tả phạm vi dự án</label>
                <textarea
                  rows={3}
                  value={formSuaDA.mo_ta}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, mo_ta: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 resize-y"
                  placeholder="Mô tả chi tiết mục tiêu, phạm vi hoặc yêu cầu triển khai..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Ghi chú nội bộ</label>
                <textarea
                  rows={2}
                  value={formSuaDA.ghi_chu}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, ghi_chu: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 resize-y"
                  placeholder="Ghi chú nội bộ lưu ý riêng cho đội ngũ..."
                />
              </div>
            </Nhom>
          </div>

          {/* Cột phải */}
          <div className="space-y-5">
            <Nhom label="Khách hàng & Người liên hệ">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Đối tác khách hàng</label>
                <select
                  value={formSuaDA.khach_hang_id}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, khach_hang_id: e.target.value, nguoi_lien_he_id: '' }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                >
                  <option value="">-- Chưa gắn khách hàng --</option>
                  {dsKH.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.ten_khach_hang} {k.ma_so_thue ? `(MST: ${k.ma_so_thue})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Người liên hệ chính</label>
                <select
                  value={formSuaDA.nguoi_lien_he_id}
                  onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, nguoi_lien_he_id: e.target.value }))}
                  className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                >
                  <option value="">-- Chưa chọn người liên hệ --</option>
                  {dsNlhTheoKh.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.ho_va_ten} {n.chuc_vu ? `— ${n.chuc_vu}` : ''} {n.so_dien_thoai ? `(${n.so_dien_thoai})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </Nhom>

            <Nhom label="Đội ngũ phụ trách & Nhân sự tham gia">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Người quản lý (PM)</label>
                  <select
                    value={formSuaDA.nguoi_quan_ly_id}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, nguoi_quan_ly_id: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {dsNS.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.ho_va_ten} ({n.chuc_vu || n.vai_tro || 'NS'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Phụ trách chính (PIC)</label>
                  <select
                    value={formSuaDA.nguoi_phu_trach_id}
                    onChange={(e) => setFormSuaDA((prev: any) => ({ ...prev, nguoi_phu_trach_id: e.target.value }))}
                    className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {dsNS.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.ho_va_ten} ({n.chuc_vu || n.vai_tro || 'NS'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Danh sách người hỗ trợ đa phòng ban */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <UserPlus className="size-3.5 text-primary" />
                    Thành viên hỗ trợ theo từng phòng ban ({dsHoTroDangChon.length})
                  </label>
                  {dsNS.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const tatCaId = dsNS
                          .filter((ns) => ns.id !== formSuaDA.nguoi_phu_trach_id && ns.id !== formSuaDA.nguoi_quan_ly_id)
                          .map((ns) => ns.id);
                        const tatCaDaChon = tatCaId.every((id) => dsHoTroDangChon.includes(id)) && tatCaId.length > 0;
                        setFormSuaDA((prev: any) => ({
                          ...prev,
                          danh_sach_nguoi_ho_tro_ids: tatCaDaChon ? [] : tatCaId
                        }));
                      }}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      {dsHoTroDangChon.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto rounded-xl border border-border bg-muted/20 p-2.5">
                  {dsPhongBan.map((pb) => {
                    const nsThuocPb = dsNS.filter((ns) => ns.phong_ban_id === pb.id);
                    if (nsThuocPb.length === 0) return null;
                    const soChon = nsThuocPb.filter((ns) => dsHoTroDangChon.includes(ns.id)).length;
                    return (
                      <div key={pb.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Building2 className="size-3.5 text-primary shrink-0" />
                            <span>{pb.ten_phong_ban}</span>
                            <span className="rounded-full bg-muted text-muted-foreground text-[10px] px-1.5 py-0.2 font-semibold">
                              {nsThuocPb.length} người
                            </span>
                          </div>
                          {soChon > 0 && (
                            <span className="text-[11px] font-bold text-primary">
                              Đã chọn {soChon}/{nsThuocPb.length}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {nsThuocPb.map((ns) => {
                            const daChon = dsHoTroDangChon.includes(ns.id);
                            const laNQLHoacNPT = ns.id === formSuaDA.nguoi_quan_ly_id || ns.id === formSuaDA.nguoi_phu_trach_id;
                            return (
                              <button
                                key={ns.id}
                                type="button"
                                disabled={laNQLHoacNPT}
                                onClick={() => toggleNguoiHoTro(ns.id)}
                                className={cn(
                                  'flex items-center gap-2 p-1.5 rounded-lg border text-left transition text-xs',
                                  laNQLHoacNPT
                                    ? 'opacity-40 border-dashed border-border bg-muted/30 cursor-not-allowed'
                                    : daChon
                                    ? 'border-primary/50 bg-primary/10 text-primary font-bold shadow-xs'
                                    : 'border-border/70 bg-background text-foreground hover:bg-muted/60'
                                )}
                              >
                                <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="xs" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-semibold text-[11.5px]">{ns.ho_va_ten}</div>
                                  <div className="text-[10px] opacity-75 truncate">{ns.chuc_vu || ns.vai_tro || 'Thành viên'}</div>
                                </div>
                                {daChon && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {dsNS.filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id)).length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                      <div className="text-xs font-bold text-foreground border-b border-border/60 pb-1.5">
                        Chưa phân phòng ban
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {dsNS
                          .filter((ns) => !ns.phong_ban_id || !dsPhongBan.some((p) => p.id === ns.phong_ban_id))
                          .map((ns) => {
                            const daChon = dsHoTroDangChon.includes(ns.id);
                            return (
                              <button
                                key={ns.id}
                                type="button"
                                onClick={() => toggleNguoiHoTro(ns.id)}
                                className={cn(
                                  'flex items-center gap-2 p-1.5 rounded-lg border text-left transition text-xs',
                                  daChon
                                    ? 'border-primary/50 bg-primary/10 text-primary font-bold shadow-xs'
                                    : 'border-border/70 bg-background text-foreground hover:bg-muted/60'
                                )}
                              >
                                <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="xs" />
                                <div className="min-w-0 flex-1 truncate font-semibold text-[11.5px]">{ns.ho_va_ten}</div>
                                {daChon && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Nhom>
          </div>
        </div>
      </div>
    );
  }

  const chiNhanh = hda?.chi_nhanh_id ? dsChiNhanh.find((c) => c.id === hda.chi_nhanh_id) ?? null : null;
  const phongBan = hda?.phong_ban_id ? dsPhongBan.find((p) => p.id === hda.phong_ban_id) ?? null : null;
  const sanPham = hda?.san_pham_dich_vu_id ? dsSanPham.find((s) => s.id === hda.san_pham_dich_vu_id) ?? null : null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Nhom label="Thông tin chung">
          <InfoDong
            bieuTuong={FolderKanban}
            label="Mã hồ sơ dự án"
            value={hda?.ma_ho_so ?? '(Tự động)'}
            dangTai={dangTai}
            mono
          />
          <InfoDong
            bieuTuong={Gauge}
            label="Giai đoạn hiện tại"
            value={
              hda?.giai_doan ? TEN_GIAI_DOAN_DA[hda.giai_doan] ?? hda.giai_doan : '(Đang cập nhật)'
            }
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Target}
            label="Mức tiềm năng ký HĐ"
            value={
              hda?.muc_do_tiem_nang
                ? TEN_TIEM_NANG[hda.muc_do_tiem_nang] ?? hda.muc_do_tiem_nang
                : '(Chưa đánh giá)'
            }
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Sparkles}
            label="Sản phẩm / Dịch vụ"
            value={
              sanPham
                ? (hda?.san_pham_khac_mo_ta ? `${sanPham.ten_san_pham} (${hda.san_pham_khac_mo_ta})` : sanPham.ten_san_pham)
                : (hda?.san_pham_khac_mo_ta ?? '(Chưa chọn)')
            }
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Building2}
            label="Chi nhánh & Phòng ban"
            value={
              chiNhanh
                ? `${chiNhanh.ten_chi_nhanh}${phongBan ? ` · ${phongBan.ten_phong_ban}` : ''}`
                : '(Chưa chọn)'
            }
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Calendar}
            label="Ngày tạo hồ sơ"
            value={hda?.ngay_tao_ho_so ? formatNgay(hda.ngay_tao_ho_so) : '(Chưa có)'}
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Calendar}
            label="Thời hạn hoàn thành"
            value={hda?.thoi_han_hoan_thanh ? formatNgay(hda.thoi_han_hoan_thanh) : '(Chưa đặt)'}
            dangTai={dangTai}
          />
        </Nhom>

        <Nhom label="Tài chính">
          <InfoDong
            bieuTuong={Target}
            label="Giá trị dự kiến"
            value={anGiaTri ? '***' : (hda?.gia_tri_du_kien ? formatTien(hda.gia_tri_du_kien) : '0 ₫')}
            dangTai={dangTai}
          />
          <InfoDong
            bieuTuong={Wallet}
            label="Giá trị hợp đồng"
            value={anGiaTri ? '***' : (hda?.gia_tri_hop_dong ? formatTien(hda.gia_tri_hop_dong) : '(Chưa ký HĐ)')}
            dangTai={dangTai}
          />
        </Nhom>

        <Nhom label="Mô tả & Ghi chú">
          {dangTai ? (
            <div className="space-y-2">
              <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/5 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-medium">
                {hda?.mo_ta ?? '(Chưa có mô tả chi tiết / phạm vi công việc)'}
              </p>
              {hda?.ghi_chu && (
                <div className="mt-4 rounded-2xl bg-[#FF9500]/5 border border-[#FF9500]/20 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF9500] mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5" /> Ghi chú nội bộ
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {hda.ghi_chu}
                  </p>
                </div>
              )}
            </>
          )}
        </Nhom>
      </div>

      <div className="space-y-5">
        <Nhom label="Khách hàng & Liên hệ">
          <InfoDong
            bieuTuong={Building2}
            label="Khách hàng (Công ty)"
            value={
              dangTai ? (
                <SkeletonInline />
              ) : kh ? (
                <button
                  type="button"
                  onClick={() => router.push(`/khach-hang/${kh.id}`)}
                  className="text-left inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline max-w-full"
                >
                  <span className="truncate">{kh.ten_khach_hang}</span>
                  {kh.ma_so_thue && (
                    <span className="text-[10px] font-mono bg-primary/10 text-primary rounded-md px-1.5 py-0.5 shrink-0">
                      MST {kh.ma_so_thue}
                    </span>
                  )}
                  <ExternalLink className="size-3.5 shrink-0 opacity-70" />
                </button>
              ) : (
                '(Chưa liên kết khách hàng)'
              )
            }
            dangTai={false}
          />
          <InfoDong
            bieuTuong={UserPlus}
            label="Người liên hệ"
            value={
              dangTai ? (
                <SkeletonInline />
              ) : nlh ? (
                <div className="inline-flex items-center gap-3 max-w-full">
                  <DaiDien ten={nlh.ho_va_ten} kich_thuoc="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">
                      {nlh.ho_va_ten}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {nlh.chuc_vu ?? 'Liên hệ'}
                      {nlh.so_dien_thoai && <> · {nlh.so_dien_thoai}</>}
                    </div>
                  </div>
                </div>
              ) : (
                '(Chưa gán người liên hệ)'
              )
            }
            dangTai={false}
          />
        </Nhom>

        <Nhom label="Nhân sự - Quản lý & Phân công">
          <InfoDong
            bieuTuong={ShieldAlert}
            label="Người quản lý (Trưởng nhóm / Giám sát)"
            value={
              dangTai ? (
                <SkeletonInline />
              ) : nql ? (
                <NhanSuInline ns={nql} tag="QL" tagMau="warning" />
              ) : (
                '(Chưa phân công)'
              )
            }
            dangTai={false}
          />
          <InfoDong
            bieuTuong={UserRound}
            label="Người phụ trách chính (PIC)"
            value={
              dangTai ? (
                <SkeletonInline />
              ) : npt ? (
                <NhanSuInline ns={npt} tag="PIC" tagMau="primary" />
              ) : (
                '(Chưa phân công)'
              )
            }
            dangTai={false}
          />
          <InfoDong
            bieuTuong={Users}
            label={`Danh sách người hỗ trợ (${dsNHT.length})`}
            value={
              dangTai ? (
                <SkeletonInline so={2} />
              ) : dsNHT.length === 0 ? (
                '(Chưa có người hỗ trợ)'
              ) : (
                <div className="flex flex-wrap gap-2 -my-0.5">
                  {dsNHT.map((ns) => {
                    const pb = ns.phong_ban_id ? dsPhongBan.find((p) => p.id === ns.phong_ban_id) : null;
                    return (
                      <div
                        key={ns.id}
                        className="inline-flex items-center gap-2 rounded-full bg-muted/60 border border-border pr-3 pl-1 py-1"
                      >
                        <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
                        <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                          {ns.ho_va_ten}
                        </span>
                        {pb && (
                          <span className="text-[10px] bg-primary/10 text-primary font-semibold rounded-md px-1.5 py-0.5">
                            {pb.ten_phong_ban}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            }
            dangTai={false}
          />
        </Nhom>
      </div>
    </div>
  );
}

function SkeletonInline({ so = 1 }: { so?: number }) {
  return (
    <div className="space-y-1.5 w-full">
      {Array.from({ length: so }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-3/4 bg-muted animate-pulse rounded"
          style={{ width: `${60 + Math.round(Math.random() * 35)}%` }}
        />
      ))}
    </div>
  );
}

function NhanSuInline({
  ns,
  tag,
  tagMau
}: {
  ns: NhanSu;
  tag: string;
  tagMau: 'primary' | 'success' | 'warning' | 'muted' | 'danger';
}) {
  return (
    <div className="inline-flex items-center gap-3 max-w-full min-w-0">
      <DaiDien ten={ns.ho_va_ten} anh={ns.url_anh_dai_dien} kich_thuoc="sm" />
      <div className="min-w-0 flex items-center gap-2">
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground truncate">{ns.ho_va_ten}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {ns.chuc_vu ?? (ns.vai_tro ?? 'Nhân viên').toString().replace(/_/g, ' ')}
          </div>
        </div>
        <Hieu kieu={tagMau} kich_thuoc="sm" className="shrink-0">
          {tag}
        </Hieu>
      </div>
    </div>
  );
}

function Nhom({ label, children }: any) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-muted/30 p-4 sm:p-5">
      <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3.5 flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-primary shrink-0" />
        {label}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoDong({ bieuTuong: B, label, value, dangTai, mono }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-[var(--radius-input)] bg-background border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-xs">
        <B className="size-4" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[11px] text-muted-foreground font-semibold mb-0.5">{label}</div>
        {dangTai ? (
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded mt-1" />
        ) : typeof value === 'string' || typeof value === 'number' ? (
          <div
            className={cn(
              'text-sm font-semibold text-foreground break-all leading-snug',
              mono && 'font-mono'
            )}
          >
            {value}
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}


function layDanhSachChiTietBCCV(b: BaoCaoCongViec): { du_an_id?: string | null; noi_dung: string }[] {
  if (b.danh_sach_chi_tiet && Array.isArray(b.danh_sach_chi_tiet) && b.danh_sach_chi_tiet.length > 0) {
    return b.danh_sach_chi_tiet.filter((ct) => ct && ct.noi_dung && ct.noi_dung.trim().length > 0);
  }
  if (b.noi_dung_thuc_hien && b.noi_dung_thuc_hien.trim().length > 0) {
    return [{ du_an_id: b.du_an_id ?? null, noi_dung: b.noi_dung_thuc_hien }];
  }
  return [];
}

function BanBCCV({
  ds,
  dangTai,
  err,
  dsDuAn
}: {
  ds: BaoCaoCongViec[];
  dangTai: boolean;
  err: string | null;
  dsDuAn?: HoSoDuAn[];
}) {
  if (dangTai) return <SkeletonList so={2} />;
  if (err)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-4 font-semibold">
        Lỗi tải: {err}
      </div>
    );
  if (ds.length === 0)
    return (
      <Rong
        kieu="mac_dinh"
        icon_tuy_chinh={FileCheck2}
        nhan_tuy_chinh="Chưa có báo cáo công việc"
        nhan_phu_tuy_chinh="Nhân sự chưa gửi báo cáo nào cho dự án này. Sẽ hiện ngay khi có báo cáo."
      />
    );
  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
      {ds.map((b: BaoCaoCongViec) => {
        const dsChiTiet = layDanhSachChiTietBCCV(b);
        return (
          <div key={b.id} className="p-4 sm:p-5 bg-white hover:bg-slate-50/50 transition">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="size-4 text-indigo-500" />
                Ngày báo cáo: {b.ngay_bao_cao ? formatNgay(b.ngay_bao_cao) : '(chưa ghi)'}
              </div>
              <div className="flex items-center gap-1.5">
                <Hieu kieu="primary" kich_thuoc="sm">
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" /> {dsChiTiet.length} dòng
                  </span>
                </Hieu>
                {b.kho_khan && (
                  <Hieu kieu="warning" kich_thuoc="sm">
                    Có khó khăn
                  </Hieu>
                )}
              </div>
            </div>
            <div className="space-y-2.5">
              {dsChiTiet.map((ct, idx) => {
                const tenDuAn = ct.du_an_id && dsDuAn
                  ? dsDuAn.find((da) => da.id === ct.du_an_id)?.ten_du_an
                  : null;
                return (
                  <div key={idx} className="rounded-xl bg-slate-50/70 border border-slate-100 p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center size-5 rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700 shrink-0">
                        {idx + 1}
                      </span>
                      {tenDuAn && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          <FolderKanban className="size-3" /> {tenDuAn}
                        </span>
                      )}
                      {!ct.du_an_id && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          Việc nội bộ / Hành chính
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed pl-7">
                      {ct.noi_dung}
                    </p>
                  </div>
                );
              })}
              {dsChiTiet.length === 0 && (
                <p className="text-sm text-slate-400 italic">(chưa có nội dung)</p>
              )}
            </div>
            {b.kho_khan && (
              <div className="mt-3.5 rounded-xl bg-rose-50/60 border border-rose-100 p-3.5">
                <div className="text-[11px] uppercase tracking-wider font-bold text-rose-700 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> Khó khăn / Đề xuất
                </div>
                <p className="text-sm text-rose-900 whitespace-pre-wrap leading-relaxed">
                  {b.kho_khan}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function kichThuocFileReadable(byt: number | null | undefined): string {
  const n = Number(byt) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1).replace(/\.0$/, '')} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const LOAI_LINK_TL: Record<string, { nhan: string; mau: 'success' | 'danger' | 'primary' | 'warning' | 'muted'; icon: any }> = {
  google_drive: { nhan: 'Google Drive', mau: 'success', icon: FileIcon },
  youtube: { nhan: 'YouTube', mau: 'danger', icon: FileVideo },
  link_khac: { nhan: 'Liên kết', mau: 'primary', icon: ExternalLink }
};

function BanNhatKyVaTienDo(props: {
  dsTD: (TienDoDuAn & { canh_bao: 'sap_den' | 'qua_han' | null })[];
  dangTai: boolean;
  err: string | null;
  dsNS: NhanSu[];
  onTao: (params: {
    noi_dung: string;
    file?: { ten_file: string; url_file: string; loai_file: string; ghi_chu?: string } | null;
  }) => Promise<void>;
  onXoaTD: (td: TienDoDuAn) => void;
}) {
  const { dsTD, dangTai, err, dsNS, onTao, onXoaTD } = props;

  const [moForm, setMoForm] = useState(false);
  const [noiDung, setNoiDung] = useState('');
  const [kemFile, setKemFile] = useState(false);
  const [tenFile, setTenFile] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [loaiFile, setLoaiFile] = useState<'google_drive' | 'youtube' | 'link_khac'>('google_drive');
  const [ghiChuFile, setGhiChuFile] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  const xuLyLuu = async () => {
    setLoiForm(null);
    const nd = noiDung.trim();
    const tf = tenFile.trim();
    const uf = urlFile.trim();

    if (!nd && !tf && !uf) {
      setLoiForm('Vui lòng nhập nội dung tiến độ hoặc điền thông tin tài liệu đính kèm.');
      return;
    }

    if (kemFile || tf || uf) {
      if (!tf || !uf) {
        setLoiForm('Vui lòng điền đủ: Tên tài liệu và Đường dẫn URL.');
        return;
      }
      try {
        new URL(uf);
      } catch {
        setLoiForm('Đường dẫn URL tài liệu không hợp lệ (phải bắt đầu bằng https:// hoặc http://)');
        return;
      }
    }

    setDangXuLy(true);
    try {
      await onTao({
        noi_dung: nd,
        file: (kemFile || (tf && uf)) ? {
          ten_file: tf,
          url_file: uf,
          loai_file: loaiFile,
          ghi_chu: ghiChuFile.trim() || undefined
        } : null
      });

      // Reset form
      setNoiDung('');
      setKemFile(false);
      setTenFile('');
      setUrlFile('');
      setGhiChuFile('');
      setMoForm(false);
    } catch (e: any) {
      setLoiForm(e?.message ?? 'Lưu cập nhật thất bại');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Bar & Nút Thao tác */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-[#007AFF]" />
            Nhật ký tiến độ dự án
          </h3>
        </div>
        <Nut
          kieu={moForm ? 'outline' : 'primary'}
          kich_thuoc="sm"
          icon_trai={moForm ? X : Plus}
          onClick={() => setMoForm((v) => !v)}
        >
          {moForm ? 'Đóng form' : 'Cập nhật tiến độ mới'}
        </Nut>
      </div>

      {/* 2. Form Cập nhật tiến độ & đính kèm tài liệu nhanh */}
      {(moForm || dsTD.length === 0) && (
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Send className="size-3.5" />
              </div>
              <div className="text-sm font-bold text-foreground">
                Ghi nhận cập nhật tiến độ mới
              </div>
            </div>
            {dsTD.length > 0 && (
              <button
                type="button"
                onClick={() => setMoForm(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {/* Nội dung tiến độ */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Nội dung cập nhật tiến độ / Tình hình công việc <span className="text-destructive">*</span>
              </label>
              <textarea
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                rows={3}
                placeholder="Nhập chi tiết tiến trình công việc, tình hình hiện tại hoặc trao đổi vừa diễn ra..."
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y min-h-[75px]"
              />
            </div>

            {/* Nút bật/tắt đính kèm tài liệu */}
            <div>
              <button
                type="button"
                onClick={() => setKemFile((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer',
                  kemFile
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Paperclip className="size-3.5" />
                <span>{kemFile ? 'Đang bật đính kèm tài liệu' : '+ Đính kèm tài liệu / Link URL'}</span>
              </button>
            </div>

            {/* Khối nhập tài liệu đính kèm (nếu bật) */}
            {kemFile && (
              <div className="p-3.5 rounded-xl border border-border bg-background/80 space-y-3 animate-in fade-in duration-150">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
                  <ExternalLink className="size-3.5 text-primary" /> Thông tin tài liệu đính kèm
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11.5px] font-semibold text-foreground mb-1 block">
                      Tên tài liệu <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenFile}
                      onChange={(e) => setTenFile(e.target.value)}
                      placeholder="VD: Báo giá chi tiết, Bản vẽ layout..."
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-foreground mb-1 block">
                      Đường dẫn URL <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="url"
                      value={urlFile}
                      onChange={(e) => setUrlFile(e.target.value)}
                      placeholder="https://drive.google.com/... hoặc https://..."
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-foreground mb-1 block">
                      Loại liên kết
                    </label>
                    <select
                      value={loaiFile}
                      onChange={(e) => setLoaiFile(e.target.value as any)}
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="google_drive">Google Drive</option>
                      <option value="youtube">YouTube</option>
                      <option value="link_khac">Liên kết ngoài (Web / Cloud)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-foreground mb-1 block">
                      Ghi chú thêm (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={ghiChuFile}
                      onChange={(e) => setGhiChuFile(e.target.value)}
                      placeholder="VD: Bản chốt lần 2..."
                      className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo lỗi và Nút submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                {loiForm && (
                  <div className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0" /> {loiForm}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {dsTD.length > 0 && (
                  <Nut kieu="outline" kich_thuoc="sm" onClick={() => setMoForm(false)}>
                    Hủy
                  </Nut>
                )}
                <Nut
                  kieu="primary"
                  kich_thuoc="sm"
                  disabled={dangXuLy}
                  onClick={xuLyLuu}
                  icon_trai={dangXuLy ? Loader2 : Send}
                  className="font-bold"
                >
                  {dangXuLy ? 'Đang lưu...' : 'Lưu tiến độ'}
                </Nut>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Danh sách tiến độ */}
      <div className="space-y-3">
        {dangTai ? (
          <SkeletonList so={3} cotDoc={false} />
        ) : err ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4 font-semibold">
            Lỗi tải: {err}
          </div>
        ) : dsTD.length === 0 ? (
          <Rong
            kieu="mac_dinh"
            icon_tuy_chinh={TrendingUp}
            nhan_tuy_chinh="Chưa có ghi nhận tiến độ nào"
            nhan_phu_tuy_chinh="Nhấn 'Cập nhật tiến độ mới' để bắt đầu ghi nhận tiến trình triển khai cho dự án này."
            hanh_dong={
              <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={() => setMoForm(true)}>
                Thêm tiến độ đầu tiên
              </Nut>
            }
          />
        ) : (
          <div className="space-y-3.5">
            {dsTD.map((td, i) => {
              const nguoiTao = td.nguoi_tao_id
                ? dsNS.find((x) => x.id === td.nguoi_tao_id) ?? null
                : null;

              return (
                <div
                  key={td.id}
                  className={cn(
                    'rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-slate-300 transition space-y-3',
                    i === 0 ? 'border-[#007AFF]/40 ring-1 ring-[#007AFF]/15' : 'border-slate-200/90'
                  )}
                >
                  {/* Header Tiến độ: Ngày giờ & Nhân sự nổi bật */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <DaiDien
                        ten={nguoiTao?.ho_va_ten ?? 'Nhân sự'}
                        anh={nguoiTao?.url_anh_dai_dien}
                        kich_thuoc="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {nguoiTao?.ho_va_ten ?? 'Nhân sự'}
                        </div>
                        {/* Ngày tháng & Giờ nổi bật với badge iOS rõ ràng */}
                        <div className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200 text-[#007AFF] font-bold text-[11px] sm:text-xs tabular-nums">
                          <Clock className="size-3.5 text-[#007AFF]" />
                          <span>{formatNgay(td.ngay_tao, 'DD/MM/YYYY')}</span>
                          <span className="text-slate-400 font-normal">|</span>
                          <span className="text-slate-700">{formatNgay(td.ngay_tao, 'HH:mm')}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#5E5CE6]/10 text-[#5E5CE6] border border-[#5E5CE6]/20 text-[11px] font-bold">
                        <Activity className="size-3" /> Tiến độ
                      </span>

                      {i === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 font-bold text-[10.5px]">
                          <Sparkles className="size-3" /> Mới nhất
                        </span>
                      )}
                    </div>

                    <Nut
                      kieu="ghost"
                      kich_thuoc="xs"
                      icon_trai={Trash2}
                      onClick={() => onXoaTD(td)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      Xóa
                    </Nut>
                  </div>

                  {/* Nội dung Tiến độ */}
                  <div className="rounded-xl bg-slate-50/70 border border-slate-200/80 p-3.5 space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                      {td.tinh_hinh_hien_tai}
                    </p>

                    {td.link_tai_lieu && (
                      <div className="pt-2 border-t border-border/60">
                        <a
                          href={td.link_tai_lieu}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/20 transition shadow-2xs"
                        >
                          <ExternalLink className="size-3" />
                          <span>Mở liên kết đính kèm</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BanKhoTaiLieu(props: {
  dsTL: TaiLieuDuAn[];
  dangTai: boolean;
  err: string | null;
  dsNS: NhanSu[];
  onThemTL: (file: { ten_file: string; url_file: string; loai_file: string; ghi_chu?: string }) => Promise<void>;
  onXoaTL: (tl: TaiLieuDuAn) => void;
}) {
  const { dsTL, dangTai, err, dsNS, onThemTL, onXoaTL } = props;

  const [tuKhoa, setTuKhoa] = useState('');
  const [loaiLoc, setLoaiLoc] = useState<'tat_ca' | 'google_drive' | 'youtube' | 'link_khac'>('tat_ca');

  const [moForm, setMoForm] = useState(false);
  const [tenFile, setTenFile] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [loaiFile, setLoaiFile] = useState<'google_drive' | 'youtube' | 'link_khac'>('google_drive');
  const [ghiChuFile, setGhiChuFile] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  // Thống kê theo loại
  const demGD = useMemo(() => dsTL.filter((x) => x.loai_file === 'google_drive').length, [dsTL]);
  const demYT = useMemo(() => dsTL.filter((x) => x.loai_file === 'youtube').length, [dsTL]);
  const demKhac = useMemo(() => dsTL.filter((x) => x.loai_file === 'link_khac' || !x.loai_file).length, [dsTL]);

  // Lọc tài liệu theo từ khóa tìm kiếm và loại
  const dsLoc = useMemo(() => {
    let list = dsTL;
    if (loaiLoc !== 'tat_ca') {
      list = list.filter((tl) => (tl.loai_file || 'link_khac') === loaiLoc);
    }
    const tk = tuKhoa.trim().toLowerCase();
    if (tk) {
      list = list.filter((tl) => {
        const ten = (tl.ten_file || '').toLowerCase();
        const gc = (tl.ghi_chu || '').toLowerCase();
        const url = (tl.url_file || '').toLowerCase();
        return ten.includes(tk) || gc.includes(tk) || url.includes(tk);
      });
    }
    return list;
  }, [dsTL, loaiLoc, tuKhoa]);

  const xuLyLuuTaiLieu = async () => {
    setLoiForm(null);
    const tf = tenFile.trim();
    const uf = urlFile.trim();

    if (!tf || !uf) {
      setLoiForm('Vui lòng điền đủ Tên tài liệu và Đường dẫn URL.');
      return;
    }

    try {
      new URL(uf);
    } catch {
      setLoiForm('Đường dẫn URL không hợp lệ (phải bắt đầu bằng https:// hoặc http://)');
      return;
    }

    setDangXuLy(true);
    try {
      await onThemTL({
        ten_file: tf,
        url_file: uf,
        loai_file: loaiFile,
        ghi_chu: ghiChuFile.trim() || undefined
      });
      // Reset form
      setTenFile('');
      setUrlFile('');
      setGhiChuFile('');
      setMoForm(false);
    } catch (e: any) {
      setLoiForm(e?.message ?? 'Thêm tài liệu thất bại');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Bar & Nút Thêm mới */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Paperclip className="size-4 text-[#007AFF]" />
            Kho tài liệu dự án ({dsTL.length})
          </h3>
        </div>
        <Nut
          kieu={moForm ? 'outline' : 'primary'}
          kich_thuoc="sm"
          icon_trai={moForm ? X : Plus}
          onClick={() => setMoForm((v) => !v)}
        >
          {moForm ? 'Đóng form' : '+ Thêm tài liệu mới'}
        </Nut>
      </div>

      {/* 2. Form Thêm tài liệu mới */}
      {moForm && (
        <div className="rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Paperclip className="size-3.5" />
              </div>
              <div className="text-sm font-bold text-foreground">
                Thêm tài liệu / Liên kết mới
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMoForm(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Tên tài liệu / Tiêu đề <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={tenFile}
                onChange={(e) => setTenFile(e.target.value)}
                placeholder="VD: Hợp đồng nguyên tắc, Bản vẽ thiết kế..."
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Đường dẫn URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={urlFile}
                onChange={(e) => setUrlFile(e.target.value)}
                placeholder="https://drive.google.com/... hoặc https://..."
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Loại liên kết
              </label>
              <select
                value={loaiFile}
                onChange={(e) => setLoaiFile(e.target.value as any)}
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
              >
                <option value="google_drive">Google Drive</option>
                <option value="youtube">YouTube</option>
                <option value="link_khac">Liên kết ngoài (Web / Cloud)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Ghi chú thêm (tùy chọn)
              </label>
              <input
                type="text"
                value={ghiChuFile}
                onChange={(e) => setGhiChuFile(e.target.value)}
                placeholder="VD: File đính kèm lần nghiệm thu 1..."
                className="w-full rounded-[var(--radius-input)] border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/50">
            <div>
              {loiForm && (
                <div className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" /> {loiForm}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Nut kieu="outline" kich_thuoc="sm" onClick={() => setMoForm(false)}>
                Hủy
              </Nut>
              <Nut
                kieu="primary"
                kich_thuoc="sm"
                disabled={dangXuLy}
                onClick={xuLyLuuTaiLieu}
                icon_trai={dangXuLy ? Loader2 : CheckCircle2}
                className="font-bold"
              >
                {dangXuLy ? 'Đang lưu...' : 'Lưu tài liệu'}
              </Nut>
            </div>
          </div>
        </div>
      )}

      {/* 3. Thanh tìm kiếm tài liệu thời gian thực & Bộ lọc loại */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Ô tìm kiếm trực quan */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm kiếm tài liệu theo tên, ghi chú..."
            className="w-full pl-9 pr-8 py-2 rounded-[var(--radius-input)] border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => setTuKhoa('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded transition cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setLoaiLoc('tat_ca')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap',
              loaiLoc === 'tat_ca'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Tất cả ({dsTL.length})
          </button>
          <button
            type="button"
            onClick={() => setLoaiLoc('google_drive')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap',
              loaiLoc === 'google_drive'
                ? 'bg-white text-[#34C759] shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Google Drive ({demGD})
          </button>
          <button
            type="button"
            onClick={() => setLoaiLoc('youtube')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap',
              loaiLoc === 'youtube'
                ? 'bg-white text-[#FF3B30] shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            YouTube ({demYT})
          </button>
          <button
            type="button"
            onClick={() => setLoaiLoc('link_khac')}
            className={cn(
              'px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap',
              loaiLoc === 'link_khac'
                ? 'bg-white text-[#007AFF] shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Khác ({demKhac})
          </button>
        </div>
      </div>

      {/* 4. Danh sách tài liệu */}
      <div>
        {dangTai ? (
          <SkeletonList so={4} cotDoc={false} />
        ) : err ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm p-4 font-semibold">
            Lỗi tải: {err}
          </div>
        ) : dsTL.length === 0 ? (
          <Rong
            kieu="mac_dinh"
            icon_tuy_chinh={Paperclip}
            nhan_tuy_chinh="Chưa có tài liệu đính kèm nào"
            nhan_phu_tuy_chinh="Bấm '+ Thêm tài liệu mới' ở trên hoặc đính kèm khi cập nhật tiến độ."
            hanh_dong={
              <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={() => setMoForm(true)}>
                Thêm tài liệu đầu tiên
              </Nut>
            }
          />
        ) : dsLoc.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <Search className="size-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-foreground">
              Không tìm thấy tài liệu phù hợp
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Không có tài liệu nào khớp với từ khóa "{tuKhoa}". Vui lòng thử từ khóa khác hoặc xóa bộ lọc.
            </p>
            <button
              type="button"
              onClick={() => {
                setTuKhoa('');
                setLoaiLoc('tat_ca');
              }}
              className="mt-3 text-xs font-bold text-[#007AFF] hover:underline"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dsLoc.map((tl) => {
              const nguoiTai = tl.nguoi_tai_len_id
                ? dsNS.find((x) => x.id === tl.nguoi_tai_len_id) ?? null
                : null;
              const loaiKey = (tl.loai_file ?? 'link_khac');
              const loai = LOAI_LINK_TL[loaiKey] ?? LOAI_LINK_TL.link_khac;
              const IconType = loai.icon;

              return (
                <div
                  key={tl.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-slate-300 transition flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2.5">
                    {/* Hàng 1: Icon loại, Loại badge, nút Xóa */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'size-8 rounded-lg flex items-center justify-center shrink-0',
                          loaiKey === 'google_drive' ? 'bg-[#34C759]/10 text-[#34C759]' :
                          loaiKey === 'youtube' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' :
                          'bg-[#007AFF]/10 text-[#007AFF]'
                        )}>
                          <IconType className="size-4" />
                        </div>
                        <Hieu kieu={loai.mau} kich_thuoc="sm">
                          {loai.nhan}
                        </Hieu>
                      </div>

                      <Nut
                        kieu="ghost"
                        kich_thuoc="xs"
                        icon_trai={Trash2}
                        onClick={() => onXoaTL(tl)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        Xóa
                      </Nut>
                    </div>

                    {/* Hàng 2: Tên file & Ghi chú */}
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-foreground break-words group-hover:text-primary transition-colors">
                        {tl.ten_file}
                      </div>
                      {tl.ghi_chu && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {tl.ghi_chu}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hàng 3: Người tải, thời gian & Nút mở liên kết */}
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <DaiDien
                        ten={nguoiTai?.ho_va_ten ?? 'Nhân sự'}
                        anh={nguoiTai?.url_anh_dai_dien}
                        kich_thuoc="xs"
                      />
                      <span className="truncate max-w-[120px] font-medium text-foreground">
                        {nguoiTai?.ho_va_ten ?? 'Nhân sự'}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {formatNgay(tl.ngay_tai_len, 'DD/MM/YYYY')}
                      </span>
                    </div>

                    {tl.url_file && (
                      <a
                        href={tl.url_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold shadow-xs transition shrink-0 ml-auto"
                      >
                        <ExternalLink className="size-3" /> Mở liên kết
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonList({ so, cotDoc = false }: { so: number; cotDoc?: boolean }) {
  if (cotDoc) {
    return (
      <div className="space-y-3">
        {Array.from({ length: so }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-4 space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-4/5 bg-muted animate-pulse rounded-md" />
            <div className="h-3 w-2/3 bg-muted animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
      {Array.from({ length: so }).map((_, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
          <div className="flex gap-3">
            <div className="size-10 rounded-xl bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
