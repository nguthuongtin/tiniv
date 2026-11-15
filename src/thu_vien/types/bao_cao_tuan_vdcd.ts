import type { HoSoDuAn } from './du_an';
import type { KhachHang } from './khach_hang';
import type { ChiNhanh, NhanSu } from './nhan_su';
import type { SanPhamDichVu } from './san_pham_dich_vu';
import { layCauHinhGiaiDoanTheoKey } from '../cau_hinh/giai_doan_du_an';

export type TrangThaiBaoCaoTuanVDCD = 'nhap' | 'cho_duyet' | 'da_duyet' | 'can_dieu_chinh';

export interface DongDoanhThuTuan {
  id: string;
  du_an_id?: string | null;
  ten_khach_hang: string;
  ten_du_an: string;
  trang_thai: string;
  doanh_thu_ky_ket: number;
  doanh_thu_tien_ve: number;
}

export interface SoLieuTinhTrangDuAnTuan {
  tong_tiep_can: number;
  dang_tiep_can: number;
  bao_gia: number;
  hop_dong: number;
  khong_phu_hop: number;
}

export interface SoLieuNguonTiepCanTuan {
  gioi_thieu: number;
  tu_khai_thac: number;
  hotline_fanpage: number;
  dau_thau_online: number;
}

export interface DongKeHoachDuAnTuan {
  id: string;
  du_an_id?: string | null;
  ten_khach_hang: string;
  giam_doc_du_an: string;
  san_pham: string;
  trang_thai: string;
  doanh_thu_ky_ket: number;
  doanh_thu_tien_ve: number;
  ghi_chu_tien_ve?: string | null;
  de_xuat?: string | null;
}

export interface DongMarketingContent {
  id: string;
  kenh: string;
  so_luong_th_kh: string;
  reach: string;
  engagement: string;
  tang_truong: string;
  noi_dung_noi_bat: string;
  link: string;
}

export interface DongMarketingPerformance {
  id: string;
  kenh: string;
  ngan_sach: string;
  lead_inbox: string;
  lead_sdt: string;
  deal: string;
  th_kh: string;
  tang_truong: string;
}

export interface ThongTinDuyetLichNgay {
  trang_thai: 'cho_duyet' | 'da_duyet' | 'can_dieu_chinh';
  ghi_chu?: string | null;
}

export interface BaoCaoTuanVDCD {
  id: string;
  tuan: string; // YYYY-Www
  nhan_vien_id: string;
  ten_nhan_vien: string;
  chi_nhanh_id?: string | null;
  ten_chi_nhanh?: string | null;
  phong_ban_id?: string | null;

  // Slide 2: Doanh thu
  dt_tuan_ky_ket: number;
  dt_tuan_tien_ve: number;
  mtd_ky_ket: number;
  mtd_tien_ve: number;
  ytd_ky_ket: number;
  ytd_tien_ve: number;
  kpi_thang_ky_ket: number;
  kpi_thang_tien_ve: number;
  kpi_nam_ky_ket: number;
  kpi_nam_tien_ve: number;
  cung_ky_ky_ket_pct?: number | null;
  cung_ky_tien_ve_pct?: number | null;
  chi_tiet_doanh_thu: DongDoanhThuTuan[];

  // Slide 3: Tình trạng dự án
  tinh_trang_tuan_truoc: SoLieuTinhTrangDuAnTuan;
  tinh_trang_tuan_nay: SoLieuTinhTrangDuAnTuan;
  ke_hoach_tiep_can_tuan_nay: number;
  thuc_hien_tiep_can_tuan_nay: number;
  ke_hoach_tiep_can_tuan_toi: number;

  // Slide 4: Cơ cấu nguồn tiếp cận (%)
  nguon_tuan_truoc: SoLieuNguonTiepCanTuan;
  nguon_tuan_nay: SoLieuNguonTiepCanTuan;

  // Slide 5-8: Kế hoạch triển khai tuần tiếp theo
  ke_hoach_dong_tien: DongKeHoachDuAnTuan[];
  ke_hoach_tiem_nang: DongKeHoachDuAnTuan[];
  ke_hoach_san_xuat: DongKeHoachDuAnTuan[];

  // Slide 9: Marketing (tùy chọn cho đơn vị/chi nhánh)
  marketing_content?: DongMarketingContent[];
  marketing_performance?: DongMarketingPerformance[];

  // Duyệt lịch công tác tuần & trạng thái báo cáo
  trang_thai: TrangThaiBaoCaoTuanVDCD;
  ghi_chu_quan_ly?: string | null;
  nguoi_duyet_id?: string | null;
  ten_nguoi_duyet?: string | null;
  ngay_duyet?: string | null;
  ghi_chu_chung?: string | null;

  // Dữ liệu mở rộng mẫu chuẩn Sales VDCD (Google Sheet template)
  kpi_tuan_qua?: {
    doanh_so_muc_tieu: number;
    doanh_so_thuc_te: number;
    khach_moi_muc_tieu: number;
    khach_moi_thuc_te: number;
    bao_gia_muc_tieu?: number;
    bao_gia_thuc_te?: number;
    du_an_lam_viec_muc_tieu?: number;
    du_an_lam_viec_thuc_te?: number;
    cuoc_gap_muc_tieu: number;
    cuoc_gap_thuc_te: number;
    hop_dong_muc_tieu: number;
    hop_dong_thuc_te: number;
    da_sua_tay_khach_moi?: boolean;
    da_sua_tay_bao_gia?: boolean;
    da_sua_tay_du_an_lam_viec?: boolean;
    da_sua_tay_hop_dong?: boolean;
    da_sua_tay_doanh_so?: boolean;
  };
  du_an_trong_diem_ids?: string[];
  cam_ket_tuan_toi?: {
    doanh_so: { target: number; min: number; max: number };
    khach_moi: { target: number; min: number; max: number };
    cuoc_hen?: { target: number; min: number; max: number };
    bao_gia: { target: number; min: number; max: number };
    du_an_lam_viec?: { target: number; min: number; max: number };
    hop_dong: { target: number; min: number; max: number };
  };
  ghi_chu_lich_ngay?: Record<string, string>;

  // Dành riêng cho Trưởng phòng Kinh doanh (Điều hành & Báo cáo cấp quản lý)
  danh_gia_tuan_qua?: string | null;
  de_xuat_ban_giam_doc?: string | null;
  dinh_huong_dieu_hanh_tuan_toi?: {
    muc_tieu_doanh_thu_phong?: number;
    so_hop_dong_du_kien?: number;
    trong_tam_dieu_hanh?: string;
    ke_hoach_ho_tro_nhan_su?: string;
  };

  ngay_tao: string;
  ngay_cap_nhat: string;
}

export interface CauHinhMucTieuBaoCaoTuan {
  id: string; // kpi_{scopeId}
  pham_vi_id: string; // chi_nhanh_id hoặc 'toan_cong_ty'
  kpi_thang_ky_ket: number;
  kpi_thang_tien_ve: number;
  kpi_nam_ky_ket: number;
  kpi_nam_tien_ve: number;
  ngay_cap_nhat: string;
}

export interface ThongTinTuanVDCD {
  tuan: string;
  nam: number;
  soTuanISO: number;
  tuanTrongThang: number;
  thang: number;
  ngayBatDau: string; // YYYY-MM-DD (Thứ 2)
  ngayKetThuc: string; // YYYY-MM-DD (Chủ nhật)
  danhSachNgay: { ngay: string; thuNhan: string; ngayNgan: string }[];
  nhanTieuDe: string; // VD: "TUẦN 2 / THÁNG 11"
  khoangNgayNhan: string; // VD: "09/11 - 15/11"
}

const TEN_THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const dinhDangYMD = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function phanTichTuanISO(tuan: string): ThongTinTuanVDCD {
  const m = /^(\d{4})-W(\d{2})$/.exec((tuan || '').trim());
  const now = new Date();
  const nam = m ? Number(m[1]) : now.getFullYear();
  const soTuanISO = m ? Number(m[2]) : 1;

  // Ngày 4 tháng 1 luôn thuộc tuần 1 ISO
  const jan4 = new Date(nam, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const thu2Tuan1 = new Date(nam, 0, 4 - (jan4Day - 1));
  const thu2 = new Date(thu2Tuan1.getTime() + (soTuanISO - 1) * 7 * 86400000);
  const chuNhat = new Date(thu2.getTime() + 6 * 86400000);

  // Lấy thứ 5 giữa tuần để xác định tháng chính xác của tuần
  const thu5 = new Date(thu2.getTime() + 3 * 86400000);
  const thang = thu5.getMonth() + 1;
  const tuanTrongThang = Math.ceil(thu5.getDate() / 7);

  const danhSachNgay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(thu2.getTime() + i * 86400000);
    return {
      ngay: dinhDangYMD(d),
      thuNhan: TEN_THU[i],
      ngayNgan: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    };
  });

  return {
    tuan: `${nam}-W${String(soTuanISO).padStart(2, '0')}`,
    nam,
    soTuanISO,
    tuanTrongThang,
    thang,
    ngayBatDau: dinhDangYMD(thu2),
    ngayKetThuc: dinhDangYMD(chuNhat),
    danhSachNgay,
    nhanTieuDe: `TUẦN ${tuanTrongThang}/THÁNG ${thang}`,
    khoangNgayNhan: `${danhSachNgay[0].ngayNgan} - ${danhSachNgay[6].ngayNgan}`
  };
}

export function layTuanISOTuDate(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function dichChuyenTuanISO(tuan: string, deltaTuan: number): string {
  const info = phanTichTuanISO(tuan);
  const [y, m, d] = info.ngayBatDau.split('-').map(Number);
  const next = new Date(y, m - 1, d + deltaTuan * 7);
  return layTuanISOTuDate(next);
}

export const SO_LIEU_TINH_TRANG_TRONG = (): SoLieuTinhTrangDuAnTuan => ({
  tong_tiep_can: 0,
  dang_tiep_can: 0,
  bao_gia: 0,
  hop_dong: 0,
  khong_phu_hop: 0
});

export const SO_LIEU_NGUON_TRONG = (): SoLieuNguonTiepCanTuan => ({
  gioi_thieu: 0,
  tu_khai_thac: 0,
  hotline_fanpage: 0,
  dau_thau_online: 0
});

const GIAI_DOAN_DANG_TIEP_CAN = new Set(['moi_tao', 'tiep_can', 'khao_sat', 'len_giai_phap', 'co_chu_truong']);
const GIAI_DOAN_BAO_GIA = new Set(['bao_gia', 'dam_phan']);
const GIAI_DOAN_HOP_DONG = new Set(['ky_hop_dong', 'tt_dot_1', 'trien_khai', 'hoan_thanh_tt_dot_2', 'nghiem_thu', 'hoan_thanh']);
const GIAI_DOAN_KHONG_PHU_HOP = new Set(['tam_dung', 'huy', 'tam_dung_huy']);

function chuanHoaKenhTiepCan(raw?: string | null): keyof SoLieuNguonTiepCanTuan {
  const s = (raw || '').toLowerCase();
  if (s.includes('giới thiệu') || s.includes('gioi_thieu') || s.includes('doi_tac') || s.includes('đối tác')) {
    return 'gioi_thieu';
  }
  if (s.includes('hotline') || s.includes('fanpage') || s.includes('marketing') || s.includes('facebook') || s.includes('zalo')) {
    return 'hotline_fanpage';
  }
  if (s.includes('đấu thầu') || s.includes('dau_thau') || s.includes('online')) {
    return 'dau_thau_online';
  }
  return 'tu_khai_thac';
}

export interface KetQuaGoiYTuCRM {
  tinh_trang_tuan_nay: SoLieuTinhTrangDuAnTuan;
  nguon_tuan_nay: SoLieuNguonTiepCanTuan;
  dt_tuan_ky_ket: number;
  dt_tuan_tien_ve: number;
  mtd_ky_ket: number;
  mtd_tien_ve: number;
  ytd_ky_ket: number;
  ytd_tien_ve: number;
  chi_tiet_doanh_thu: DongDoanhThuTuan[];
  goi_y_dong_tien: DongKeHoachDuAnTuan[];
  goi_y_tiem_nang: DongKeHoachDuAnTuan[];
  goi_y_san_xuat: DongKeHoachDuAnTuan[];
}

export function tinhSoLieuTuCRM(params: {
  tuan: string;
  dsDuAn: HoSoDuAn[];
  dsKhachHang: KhachHang[];
  dsSanPham: SanPhamDichVu[];
  dsChiNhanh: ChiNhanh[];
  dsNhanSu: NhanSu[];
}): KetQuaGoiYTuCRM {
  const { tuan, dsDuAn, dsKhachHang, dsSanPham, dsChiNhanh, dsNhanSu } = params;
  const infoTuan = phanTichTuanISO(tuan);
  const dauThang = `${infoTuan.nam}-${String(infoTuan.thang).padStart(2, '0')}-01`;
  const dauNam = `${infoTuan.nam}-01-01`;

  const mapKH = new Map(dsKhachHang.map((k) => [k.id, k.ten_khach_hang]));
  const mapSP = new Map(dsSanPham.map((s) => [s.id, s]));
  const mapCN = new Map(dsChiNhanh.map((c) => [c.id, c.ten_chi_nhanh]));
  const mapNS = new Map(dsNhanSu.map((n) => [n.id, n.ho_va_ten]));

  const tinhTrang = SO_LIEU_TINH_TRANG_TRONG();
  const demNguon = SO_LIEU_NGUON_TRONG();
  let tongNguon = 0;

  let dtTuanKy = 0;
  let dtTuanVe = 0;
  let mtdKy = 0;
  let mtdVe = 0;
  let ytdKy = 0;
  let ytdVe = 0;

  const chiTietDoanhThu: DongDoanhThuTuan[] = [];
  const goiYDongTien: DongKeHoachDuAnTuan[] = [];
  const goiYTiemNang: DongKeHoachDuAnTuan[] = [];
  const goiYSanXuat: DongKeHoachDuAnTuan[] = [];

  for (const da of dsDuAn) {
    if (da.trang_thai === 'da_xoa') continue;
    const gd = String(da.giai_doan || '');
    const ngayTao = (da.ngay_tao || '').slice(0, 10);
    const ngayCapNhat = (da.ngay_cap_nhat || da.ngay_tao || '').slice(0, 10);
    const trongTuanNay = ngayCapNhat >= infoTuan.ngayBatDau && ngayCapNhat <= infoTuan.ngayKetThuc;
    const coTacNghiepTrongTuan =
      trongTuanNay || (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc);

    // Slide 3: Tình trạng dự án Triển khai trong tuần
    // - Chỉ tính các dự án có triển khai / tác nghiệp / cập nhật hoặc tạo mới trong tuần
    const coHoatDongTrongTuan =
      coTacNghiepTrongTuan ||
      (ngayCapNhat >= infoTuan.ngayBatDau && ngayCapNhat <= infoTuan.ngayKetThuc) ||
      (ngayTao >= infoTuan.ngayBatDau && ngayTao <= infoTuan.ngayKetThuc);

    const daKetThucKyTruoc =
      (gd === 'hoan_thanh' || gd === 'hoan_thanh_tt_dot_2' || gd === 'nghiem_thu' || GIAI_DOAN_KHONG_PHU_HOP.has(gd)) &&
      ngayCapNhat < infoTuan.ngayBatDau;

    if (coHoatDongTrongTuan && !daKetThucKyTruoc) {
      if (GIAI_DOAN_KHONG_PHU_HOP.has(gd)) {
        tinhTrang.khong_phu_hop += 1;
      } else if (GIAI_DOAN_HOP_DONG.has(gd)) {
        tinhTrang.hop_dong += 1;
      } else if (GIAI_DOAN_BAO_GIA.has(gd)) {
        tinhTrang.bao_gia += 1;
      } else if (GIAI_DOAN_DANG_TIEP_CAN.has(gd)) {
        tinhTrang.dang_tiep_can += 1;
      } else {
        tinhTrang.dang_tiep_can += 1;
      }

      const kenhKey = chuanHoaKenhTiepCan(da.kenh_ban_hang);
      demNguon[kenhKey] += 1;
      tongNguon += 1;
    }

    const tenKH = (da.khach_hang_id && mapKH.get(da.khach_hang_id)) || da.ten_du_an;
    const sp = da.san_pham_dich_vu_id ? mapSP.get(da.san_pham_dich_vu_id) : undefined;
    const tenSP = sp?.ten_san_pham || da.san_pham_khac_mo_ta || da.ten_du_an;
    const maSP = sp?.ma_san_pham ? `${sp.ma_san_pham} - ` : '';
    const nhanTrangThai = layCauHinhGiaiDoanTheoKey(gd).nhan_ngan;
    const tenDonVi =
      (da.chi_nhanh_id && mapCN.get(da.chi_nhanh_id)) ||
      (da.nguoi_phu_trach_id && mapNS.get(da.nguoi_phu_trach_id)) ||
      'An Giang';

    const gtHD = Number(da.gia_tri_hop_dong || 0);
    const gtDuKien = Number(da.gia_tri_du_kien || 0);
    const tienVe = Number(da.tien_ve_thuc_te || 0);

    if (GIAI_DOAN_HOP_DONG.has(gd) && (gtHD > 0 || tienVe > 0)) {
      if (ngayCapNhat >= dauNam && ngayCapNhat <= infoTuan.ngayKetThuc) {
        ytdKy += gtHD;
        ytdVe += tienVe;
      }
      if (ngayCapNhat >= dauThang && ngayCapNhat <= infoTuan.ngayKetThuc) {
        mtdKy += gtHD;
        mtdVe += tienVe;
      }
      if (trongTuanNay) {
        dtTuanKy += gtHD;
        dtTuanVe += tienVe;
        chiTietDoanhThu.push({
          id: `dt_${da.id}`,
          du_an_id: da.id,
          ten_khach_hang: tenKH,
          ten_du_an: `${maSP}${da.ten_du_an}`,
          trang_thai: nhanTrangThai,
          doanh_thu_ky_ket: gtHD,
          doanh_thu_tien_ve: tienVe
        });
      }
    }

    const dongMau: DongKeHoachDuAnTuan = {
      id: `kh_${da.id}`,
      du_an_id: da.id,
      ten_khach_hang: tenKH,
      giam_doc_du_an: tenDonVi,
      san_pham: tenSP,
      trang_thai: nhanTrangThai,
      doanh_thu_ky_ket: gtHD > 0 ? gtHD : gtDuKien,
      doanh_thu_tien_ve: tienVe,
      ghi_chu_tien_ve: null,
      de_xuat: ''
    };

    if (gd === 'dam_phan' || gd === 'co_chu_truong' || gd === 'ky_hop_dong' || gd === 'tt_dot_1') {
      goiYDongTien.push({
        ...dongMau,
        id: `d_${da.id}`,
        doanh_thu_tien_ve: tienVe > 0 ? tienVe : Math.round((dongMau.doanh_thu_ky_ket || 0) * 0.3),
        ghi_chu_tien_ve: tienVe > 0 ? null : 'dự kiến tạm ứng 30%'
      });
    }
    if (
      !GIAI_DOAN_KHONG_PHU_HOP.has(gd) &&
      gd !== 'hoan_thanh' &&
      gd !== 'hoan_thanh_tt_dot_2' &&
      gd !== 'nghiem_thu' &&
      gd !== 'trien_khai' &&
      gd !== 'tt_dot_1' &&
      gd !== 'tam_dung_huy' &&
      (da.muc_do_tiem_nang === 'rat_cao' || da.muc_do_tiem_nang === 'cao')
    ) {
      goiYTiemNang.push({ ...dongMau, id: `tn_${da.id}` });
    }
  }

  tinhTrang.tong_tiep_can =
    tinhTrang.dang_tiep_can + tinhTrang.bao_gia + tinhTrang.hop_dong + (tinhTrang.khong_phu_hop || 0);

  const nguonPct: SoLieuNguonTiepCanTuan =
    tongNguon > 0
      ? {
          gioi_thieu: Math.round((demNguon.gioi_thieu / tongNguon) * 100),
          tu_khai_thac: Math.round((demNguon.tu_khai_thac / tongNguon) * 100),
          hotline_fanpage: Math.round((demNguon.hotline_fanpage / tongNguon) * 100),
          dau_thau_online: Math.round((demNguon.dau_thau_online / tongNguon) * 100)
        }
      : SO_LIEU_NGUON_TRONG();

  return {
    tinh_trang_tuan_nay: tinhTrang,
    nguon_tuan_nay: nguonPct,
    dt_tuan_ky_ket: dtTuanKy,
    dt_tuan_tien_ve: dtTuanVe,
    mtd_ky_ket: mtdKy,
    mtd_tien_ve: mtdVe,
    ytd_ky_ket: ytdKy,
    ytd_tien_ve: ytdVe,
    chi_tiet_doanh_thu: chiTietDoanhThu,
    goi_y_dong_tien: goiYDongTien,
    goi_y_tiem_nang: goiYTiemNang,
    goi_y_san_xuat: goiYSanXuat
  };
}

export function taoBaoCaoTuanMacDinh(params: {
  tuan: string;
  nhanSu: Pick<NhanSu, 'id' | 'ho_va_ten' | 'chi_nhanh_id' | 'phong_ban_id'>;
  tenChiNhanh?: string | null;
  goiY: KetQuaGoiYTuCRM;
  baoCaoTuanTruoc?: BaoCaoTuanVDCD | null;
  kpiMacDinh?: Partial<CauHinhMucTieuBaoCaoTuan> | null;
}): BaoCaoTuanVDCD {
  const { tuan, nhanSu, tenChiNhanh, goiY, baoCaoTuanTruoc, kpiMacDinh } = params;
  const now = new Date().toISOString();
  const prevTT = baoCaoTuanTruoc?.tinh_trang_tuan_nay || SO_LIEU_TINH_TRANG_TRONG();
  const prevNguon = baoCaoTuanTruoc?.nguon_tuan_nay || SO_LIEU_NGUON_TRONG();
  const keHoachTuanNay =
    baoCaoTuanTruoc?.ke_hoach_tiep_can_tuan_toi ||
    baoCaoTuanTruoc?.cam_ket_tuan_toi?.khach_moi?.target ||
    baoCaoTuanTruoc?.cam_ket_tuan_toi?.du_an_lam_viec?.target ||
    16;

  return {
    id: `vdcd_${tuan}_${nhanSu.id}`,
    tuan,
    nhan_vien_id: nhanSu.id,
    ten_nhan_vien: nhanSu.ho_va_ten || 'Nhân viên',
    chi_nhanh_id: nhanSu.chi_nhanh_id || null,
    ten_chi_nhanh: tenChiNhanh || 'An Giang',
    phong_ban_id: nhanSu.phong_ban_id || null,

    dt_tuan_ky_ket: goiY.dt_tuan_ky_ket,
    dt_tuan_tien_ve: goiY.dt_tuan_tien_ve,
    mtd_ky_ket: goiY.mtd_ky_ket,
    mtd_tien_ve: goiY.mtd_tien_ve,
    ytd_ky_ket: goiY.ytd_ky_ket,
    ytd_tien_ve: goiY.ytd_tien_ve,
    kpi_thang_ky_ket: Number(kpiMacDinh?.kpi_thang_ky_ket || baoCaoTuanTruoc?.kpi_thang_ky_ket || 0),
    kpi_thang_tien_ve: Number(kpiMacDinh?.kpi_thang_tien_ve || baoCaoTuanTruoc?.kpi_thang_tien_ve || 0),
    kpi_nam_ky_ket: Number(kpiMacDinh?.kpi_nam_ky_ket || baoCaoTuanTruoc?.kpi_nam_ky_ket || 0),
    kpi_nam_tien_ve: Number(kpiMacDinh?.kpi_nam_tien_ve || baoCaoTuanTruoc?.kpi_nam_tien_ve || 0),
    cung_ky_ky_ket_pct: null,
    cung_ky_tien_ve_pct: null,
    chi_tiet_doanh_thu: goiY.chi_tiet_doanh_thu,

    tinh_trang_tuan_truoc: prevTT,
    tinh_trang_tuan_nay: goiY.tinh_trang_tuan_nay,
    ke_hoach_tiep_can_tuan_nay: keHoachTuanNay,
    thuc_hien_tiep_can_tuan_nay: goiY.tinh_trang_tuan_nay.tong_tiep_can,
    ke_hoach_tiep_can_tuan_toi:
      baoCaoTuanTruoc?.cam_ket_tuan_toi?.khach_moi?.target ||
      16,

    nguon_tuan_truoc: prevNguon,
    nguon_tuan_nay: goiY.nguon_tuan_nay,

    ke_hoach_dong_tien: goiY.goi_y_dong_tien.slice(0, 8),
    ke_hoach_tiem_nang: goiY.goi_y_tiem_nang.slice(0, 12),
    du_an_trong_diem_ids: (baoCaoTuanTruoc?.du_an_trong_diem_ids && baoCaoTuanTruoc.du_an_trong_diem_ids.length > 0) ? baoCaoTuanTruoc.du_an_trong_diem_ids : (goiY.goi_y_tiem_nang.slice(0, 6).map((x) => x.du_an_id).filter(Boolean) as string[]),
    ke_hoach_san_xuat: goiY.goi_y_san_xuat.slice(0, 8),
    marketing_content: [],
    marketing_performance: [],

    // Khởi tạo KPI tuần qua từ thực tế CRM & Mục tiêu tuần trước
    kpi_tuan_qua: {
      khach_moi_muc_tieu: baoCaoTuanTruoc?.cam_ket_tuan_toi?.khach_moi?.target ?? 20,
      khach_moi_thuc_te: goiY.tinh_trang_tuan_nay.dang_tiep_can ?? 0,
      bao_gia_muc_tieu: baoCaoTuanTruoc?.cam_ket_tuan_toi?.bao_gia?.target ?? 4,
      bao_gia_thuc_te: goiY.tinh_trang_tuan_nay.bao_gia ?? 0,
      du_an_lam_viec_muc_tieu: baoCaoTuanTruoc?.cam_ket_tuan_toi?.du_an_lam_viec?.target ?? baoCaoTuanTruoc?.cam_ket_tuan_toi?.cuoc_hen?.target ?? 5,
      du_an_lam_viec_thuc_te: goiY.tinh_trang_tuan_nay.tong_tiep_can ?? 0,
      hop_dong_muc_tieu: baoCaoTuanTruoc?.cam_ket_tuan_toi?.hop_dong?.target ?? 4,
      hop_dong_thuc_te: goiY.tinh_trang_tuan_nay.hop_dong ?? 0,
      doanh_so_muc_tieu: baoCaoTuanTruoc?.cam_ket_tuan_toi?.doanh_so?.target ?? 150000000,
      doanh_so_thuc_te: (goiY.dt_tuan_ky_ket || 0) + (goiY.dt_tuan_tien_ve || 0),
      cuoc_gap_muc_tieu: 0,
      cuoc_gap_thuc_te: 0
    },

    // Khởi tạo Cam kết tuần tới
    cam_ket_tuan_toi: {
      khach_moi: baoCaoTuanTruoc?.cam_ket_tuan_toi?.khach_moi || { target: 20, min: 0, max: 0 },
      bao_gia: baoCaoTuanTruoc?.cam_ket_tuan_toi?.bao_gia || { target: 4, min: 0, max: 0 },
      du_an_lam_viec: baoCaoTuanTruoc?.cam_ket_tuan_toi?.du_an_lam_viec || { target: 5, min: 0, max: 0 },
      hop_dong: baoCaoTuanTruoc?.cam_ket_tuan_toi?.hop_dong || { target: 4, min: 0, max: 0 },
      doanh_so: baoCaoTuanTruoc?.cam_ket_tuan_toi?.doanh_so || { target: 150000000, min: 0, max: 0 }
    },

    trang_thai: 'nhap',
    ghi_chu_quan_ly: null,
    nguoi_duyet_id: null,
    ten_nguoi_duyet: null,
    ngay_duyet: null,
    ghi_chu_chung: null,
    ngay_tao: now,
    ngay_cap_nhat: now
  };
}

export function tongHopBaoCaoChiNhanh(params: {
  tuan: string;
  tenDonVi: string;
  danhSachBaoCao: BaoCaoTuanVDCD[];
  kpiDonVi?: Partial<CauHinhMucTieuBaoCaoTuan> | null;
}): BaoCaoTuanVDCD {
  const { tuan, tenDonVi, danhSachBaoCao, kpiDonVi } = params;
  const now = new Date().toISOString();

  const congTinhTrang = (picker: (b: BaoCaoTuanVDCD) => SoLieuTinhTrangDuAnTuan): SoLieuTinhTrangDuAnTuan =>
    danhSachBaoCao.reduce((acc, item) => {
      const s = picker(item);
      return {
        tong_tiep_can: acc.tong_tiep_can + Number(s?.tong_tiep_can || 0),
        dang_tiep_can: acc.dang_tiep_can + Number(s?.dang_tiep_can || 0),
        bao_gia: acc.bao_gia + Number(s?.bao_gia || 0),
        hop_dong: acc.hop_dong + Number(s?.hop_dong || 0),
        khong_phu_hop: acc.khong_phu_hop + Number(s?.khong_phu_hop || 0)
      };
    }, SO_LIEU_TINH_TRANG_TRONG());

  const trungBinhNguon = (picker: (b: BaoCaoTuanVDCD) => SoLieuNguonTiepCanTuan): SoLieuNguonTiepCanTuan => {
    const coDuLieu = danhSachBaoCao.filter((b) => {
      const s = picker(b);
      return (s.gioi_thieu + s.tu_khai_thac + s.hotline_fanpage + s.dau_thau_online) > 0;
    });
    if (coDuLieu.length === 0) return SO_LIEU_NGUON_TRONG();
    const sum = coDuLieu.reduce((acc, b) => {
      const s = picker(b);
      return {
        gioi_thieu: acc.gioi_thieu + Number(s.gioi_thieu || 0),
        tu_khai_thac: acc.tu_khai_thac + Number(s.tu_khai_thac || 0),
        hotline_fanpage: acc.hotline_fanpage + Number(s.hotline_fanpage || 0),
        dau_thau_online: acc.dau_thau_online + Number(s.dau_thau_online || 0)
      };
    }, SO_LIEU_NGUON_TRONG());
    const n = coDuLieu.length;
    return {
      gioi_thieu: Math.round(sum.gioi_thieu / n),
      tu_khai_thac: Math.round(sum.tu_khai_thac / n),
      hotline_fanpage: Math.round(sum.hotline_fanpage / n),
      dau_thau_online: Math.round(sum.dau_thau_online / n)
    };
  };

  const gomDong = (picker: (b: BaoCaoTuanVDCD) => DongKeHoachDuAnTuan[]): DongKeHoachDuAnTuan[] => {
    const seen = new Set<string>();
    const out: DongKeHoachDuAnTuan[] = [];
    for (const bc of danhSachBaoCao) {
      for (const d of picker(bc) || []) {
        const key = d.du_an_id || `${d.ten_khach_hang}_${d.san_pham}_${d.trang_thai}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          ...d,
          giam_doc_du_an: d.giam_doc_du_an || bc.ten_chi_nhanh || tenDonVi
        });
      }
    }
    return out;
  };

  const dtTuanKy = danhSachBaoCao.reduce((s, b) => s + Number(b.dt_tuan_ky_ket || 0), 0);
  const dtTuanVe = danhSachBaoCao.reduce((s, b) => s + Number(b.dt_tuan_tien_ve || 0), 0);
  const mtdKy = danhSachBaoCao.reduce((s, b) => s + Number(b.mtd_ky_ket || 0), 0);
  const mtdVe = danhSachBaoCao.reduce((s, b) => s + Number(b.mtd_tien_ve || 0), 0);
  const ytdKy = danhSachBaoCao.reduce((s, b) => s + Number(b.ytd_ky_ket || 0), 0);
  const ytdVe = danhSachBaoCao.reduce((s, b) => s + Number(b.ytd_tien_ve || 0), 0);

  const kpiThangKy = Number(kpiDonVi?.kpi_thang_ky_ket || 0) ||
    danhSachBaoCao.reduce((s, b) => s + Number(b.kpi_thang_ky_ket || 0), 0);
  const kpiThangVe = Number(kpiDonVi?.kpi_thang_tien_ve || 0) ||
    danhSachBaoCao.reduce((s, b) => s + Number(b.kpi_thang_tien_ve || 0), 0);
  const kpiNamKy = Number(kpiDonVi?.kpi_nam_ky_ket || 0) ||
    danhSachBaoCao.reduce((s, b) => s + Number(b.kpi_nam_ky_ket || 0), 0);
  const kpiNamVe = Number(kpiDonVi?.kpi_nam_tien_ve || 0) ||
    danhSachBaoCao.reduce((s, b) => s + Number(b.kpi_nam_tien_ve || 0), 0);

  const congKPITeam = (): NonNullable<BaoCaoTuanVDCD['kpi_tuan_qua']> => {
    return danhSachBaoCao.reduce(
      (acc, b) => {
        const k = b.kpi_tuan_qua;
        if (!k) return acc;
        return {
          khach_moi_muc_tieu: acc.khach_moi_muc_tieu + Number(k.khach_moi_muc_tieu || 0),
          khach_moi_thuc_te: acc.khach_moi_thuc_te + Number(k.khach_moi_thuc_te || 0),
          bao_gia_muc_tieu: acc.bao_gia_muc_tieu + Number(k.bao_gia_muc_tieu || 0),
          bao_gia_thuc_te: acc.bao_gia_thuc_te + Number(k.bao_gia_thuc_te || 0),
          du_an_lam_viec_muc_tieu: acc.du_an_lam_viec_muc_tieu + Number(k.du_an_lam_viec_muc_tieu || 0),
          du_an_lam_viec_thuc_te: acc.du_an_lam_viec_thuc_te + Number(k.du_an_lam_viec_thuc_te || 0),
          hop_dong_muc_tieu: acc.hop_dong_muc_tieu + Number(k.hop_dong_muc_tieu || 0),
          hop_dong_thuc_te: acc.hop_dong_thuc_te + Number(k.hop_dong_thuc_te || 0),
          doanh_so_muc_tieu: acc.doanh_so_muc_tieu + Number(k.doanh_so_muc_tieu || 0),
          doanh_so_thuc_te: acc.doanh_so_thuc_te + Number(k.doanh_so_thuc_te || 0),
          cuoc_gap_muc_tieu: acc.cuoc_gap_muc_tieu + Number(k.cuoc_gap_muc_tieu || 0),
          cuoc_gap_thuc_te: acc.cuoc_gap_thuc_te + Number(k.cuoc_gap_thuc_te || 0)
        };
      },
      {
        khach_moi_muc_tieu: 0,
        khach_moi_thuc_te: 0,
        bao_gia_muc_tieu: 0,
        bao_gia_thuc_te: 0,
        du_an_lam_viec_muc_tieu: 0,
        du_an_lam_viec_thuc_te: 0,
        hop_dong_muc_tieu: 0,
        hop_dong_thuc_te: 0,
        doanh_so_muc_tieu: 0,
        doanh_so_thuc_te: 0,
        cuoc_gap_muc_tieu: 0,
        cuoc_gap_thuc_te: 0
      }
    );
  };

  const congCamKetTeam = (): NonNullable<BaoCaoTuanVDCD['cam_ket_tuan_toi']> => {
    return danhSachBaoCao.reduce(
      (acc, b) => {
        const c = b.cam_ket_tuan_toi;
        if (!c) return acc;
        return {
          khach_moi: { target: acc.khach_moi.target + Number(c.khach_moi?.target || 0), min: 0, max: 0 },
          bao_gia: { target: acc.bao_gia.target + Number(c.bao_gia?.target || 0), min: 0, max: 0 },
          du_an_lam_viec: { target: acc.du_an_lam_viec.target + Number(c.du_an_lam_viec?.target || 0), min: 0, max: 0 },
          hop_dong: { target: acc.hop_dong.target + Number(c.hop_dong?.target || 0), min: 0, max: 0 },
          doanh_so: { target: acc.doanh_so.target + Number(c.doanh_so?.target || 0), min: 0, max: 0 }
        };
      },
      {
        khach_moi: { target: 0, min: 0, max: 0 },
        bao_gia: { target: 0, min: 0, max: 0 },
        du_an_lam_viec: { target: 0, min: 0, max: 0 },
        hop_dong: { target: 0, min: 0, max: 0 },
        doanh_so: { target: 0, min: 0, max: 0 }
      }
    );
  };

  const kpiTong = congKPITeam();
  const camKetTong = congCamKetTeam();
  const ttNay = congTinhTrang((b) => b.tinh_trang_tuan_nay);

  // Kế hoạch tiếp cận tuần này: Ưu tiên tổng mục tiêu tiếp cận của đội ngũ
  const keHoachTiepCan: number =
    Number(kpiTong.khach_moi_muc_tieu || 0) > 0
      ? Number(kpiTong.khach_moi_muc_tieu)
      : Number(kpiTong.du_an_lam_viec_muc_tieu || 0) > 0
      ? Number(kpiTong.du_an_lam_viec_muc_tieu)
      : (danhSachBaoCao.reduce((s, b) => s + Number(b.ke_hoach_tiep_can_tuan_nay || 0), 0) || 16);

  // Thực hiện tiếp cận tuần này: Ưu tiên thực tế tiếp cận của đội ngũ (hoặc tổng dự án triển khai trong tuần)
  const thucHienTiepCan =
    kpiTong.khach_moi_thuc_te > 0
      ? kpiTong.khach_moi_thuc_te
      : ttNay.tong_tiep_can > 0
      ? ttNay.tong_tiep_can
      : danhSachBaoCao.reduce((s, b) => s + Number(b.thuc_hien_tiep_can_tuan_nay || 0), 0);

  return {
    id: `vdcd_tong_${tuan}`,
    tuan,
    nhan_vien_id: 'tong_chi_nhanh',
    ten_nhan_vien: `Tổng hợp ${tenDonVi}`,
    ten_chi_nhanh: tenDonVi,

    dt_tuan_ky_ket: dtTuanKy,
    dt_tuan_tien_ve: dtTuanVe,
    mtd_ky_ket: mtdKy,
    mtd_tien_ve: mtdVe,
    ytd_ky_ket: ytdKy,
    ytd_tien_ve: ytdVe,
    kpi_thang_ky_ket: kpiThangKy,
    kpi_thang_tien_ve: kpiThangVe,
    kpi_nam_ky_ket: kpiNamKy,
    kpi_nam_tien_ve: kpiNamVe,
    chi_tiet_doanh_thu: danhSachBaoCao.flatMap((b) => b.chi_tiet_doanh_thu || []),

    tinh_trang_tuan_truoc: congTinhTrang((b) => b.tinh_trang_tuan_truoc),
    tinh_trang_tuan_nay: ttNay,
    ke_hoach_tiep_can_tuan_nay: keHoachTiepCan,
    thuc_hien_tiep_can_tuan_nay: thucHienTiepCan,
    ke_hoach_tiep_can_tuan_toi:
      camKetTong.khach_moi.target > 0
        ? camKetTong.khach_moi.target
        : danhSachBaoCao.reduce((s, b) => s + Number(b.ke_hoach_tiep_can_tuan_toi || 0), 0) || 16,

    kpi_tuan_qua: kpiTong,
    cam_ket_tuan_toi: camKetTong,

    nguon_tuan_truoc: trungBinhNguon((b) => b.nguon_tuan_truoc),
    nguon_tuan_nay: trungBinhNguon((b) => b.nguon_tuan_nay),

    ke_hoach_dong_tien: gomDong((b) => b.ke_hoach_dong_tien),
    ke_hoach_tiem_nang: gomDong((b) => b.ke_hoach_tiem_nang),
    du_an_trong_diem_ids: Array.from(new Set(danhSachBaoCao.flatMap((b) => b.du_an_trong_diem_ids || []))),
    ke_hoach_san_xuat: gomDong((b) => b.ke_hoach_san_xuat),
    marketing_content: danhSachBaoCao.flatMap((b) => b.marketing_content || []),
    marketing_performance: danhSachBaoCao.flatMap((b) => b.marketing_performance || []),

    trang_thai: 'da_duyet',
    ngay_tao: now,
    ngay_cap_nhat: now
  };
}
