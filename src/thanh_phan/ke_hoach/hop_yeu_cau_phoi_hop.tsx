'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  ExternalLink,
  Link2,
  Clock,
  User,
  Users,
  UserCheck,
  FolderKanban,
  AlertCircle,
  X,
  History,
  Copy,
  CheckCircle2,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  ShieldAlert,
  FileCheck2
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import type {
  YeuCauPhoiHop,
  TrangThaiYeuCauPhoiHop
} from '../../thu_vien/types/yeu_cau_phoi_hop';
import { NHAN_TRANG_THAI_YEU_CAU } from '../../thu_vien/types/yeu_cau_phoi_hop';
import type { NguoiDungDangNhap, NhanSu, PhongBan } from '../../thu_vien/types/nhan_su';
import {
  chuyenBuocYeuCauPhoiHop,
  capNhatThongTinYeuCau,
  xoaYeuCauPhoiHop
} from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachPhongBan } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';

type TabYeuCau =
  | 'dang_chay'
  | 'cho_tpkd'
  | 'cho_tpkh'
  | 'khth_dang_lam'
  | 'cho_sale'
  | 'da_hoan_thanh'
  | 'tat_ca';

interface Props {
  danhSachYeuCau: YeuCauPhoiHop[];
  nguoiDungHienTai?: NguoiDungDangNhap | null;
  onCapNhatYeuCau?: (yeuCauCapNhat: YeuCauPhoiHop) => void;
  onXoaYeuCau?: (yeuCauId: string) => void;
  onMoChiTietDuAn?: (duAnId: string) => void;
  onMoModalTaoYeuCau?: () => void;
}

export default function HopYeuCauPhoiHop({
  danhSachYeuCau,
  nguoiDungHienTai,
  onCapNhatYeuCau,
  onXoaYeuCau,
  onMoChiTietDuAn,
  onMoModalTaoYeuCau
}: Props) {
  const [tabHienTai, setTabHienTai] = useState<TabYeuCau>('dang_chay');
  const [tuKhoaTim, setTuKhoaTim] = useState('');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const SO_MUC_MOI_TRANG = 15;
  const [yeuCauDangXemLichSu, setYeuCauDangXemLichSu] = useState<YeuCauPhoiHop | null>(null);

  // 1. Modal tiếp nhận & phân công của TPKH (Giao việc cho CV hoặc Tự làm)
  const [modalGiaoViec, setModalGiaoViec] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
    hinhThuc: 'giao_cv' | 'tu_lam';
  }>({ mo: false, yeuCau: null, hinhThuc: 'giao_cv' });

  const [dsNhanSuChon, setDsNhanSuChon] = useState<{ id: string; ho_va_ten: string }[]>([]);
  const [ghiChuGiaoViec, setGhiChuGiaoViec] = useState('');
  const [hanXongGiaoViec, setHanXongGiaoViec] = useState('');
  const [linkDriveTuLam, setLinkDriveTuLam] = useState('');
  const [tuKhoaTimNS, setTuKhoaTimNS] = useState('');
  const [dangXuLyGiaoViec, setDangXuLyGiaoViec] = useState(false);
  const [loiGiaoViec, setLoiGiaoViec] = useState('');

  // 2. Modal nộp kết quả (Dành cho CV KHTH hoặc TPKH)
  const [modalNopDrive, setModalNopDrive] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
  }>({ mo: false, yeuCau: null });
  const [linkDriveNop, setLinkDriveNop] = useState('');
  const [ghiChuNop, setGhiChuNop] = useState('');
  const [dangXuLyNop, setDangXuLyNop] = useState(false);

  // 3. Modal yêu cầu chỉnh sửa đa năng (TPKD -> Sale, TPKH -> TPKD, TPKH -> CV, TPKD -> TPKH, Sale -> chạy lại)
  const [modalYeuCauSua, setModalYeuCauSua] = useState<{
    mo: boolean;
    yeuCau: YeuCauPhoiHop | null;
    loaiSua:
      | 'tpkd_tu_choi_sale'
      | 'tpkh_tra_ve_tpkd'
      | 'tpkh_yeu_cau_cv'
      | 'tpkd_yeu_cau_tpkh'
      | 'sale_yeu_cau_sua';
    tieuDe: string;
  }>({
    mo: false,
    yeuCau: null,
    loaiSua: 'tpkd_tu_choi_sale',
    tieuDe: 'Yêu cầu chỉnh sửa lại'
  });
  const [lyDoSua, setLyDoSua] = useState('');
  const [dangXuLyYeuCauSua, setDangXuLyYeuCauSua] = useState(false);

  // 4. Modal Chỉnh sửa thông tin yêu cầu ban đầu (chỉ sửa nội dung/link/hạn khi chưa duyệt)
  const [yeuCauDangSua, setYeuCauDangSua] = useState<YeuCauPhoiHop | null>(null);
  const [suaNoiDung, setSuaNoiDung] = useState('');
  const [suaLinkDrive, setSuaLinkDrive] = useState('');
  const [suaHanXong, setSuaHanXong] = useState('');
  const [dangLuuSua, setDangLuuSua] = useState(false);
  const [loiSua, setLoiSua] = useState('');

  // 5. Modal Xóa yêu cầu
  const [yeuCauDangXoa, setYeuCauDangXoa] = useState<YeuCauPhoiHop | null>(null);
  const [dangXoa, setDangXoa] = useState(false);

  // Dữ liệu nhân sự & phòng ban toàn hệ thống
  const [dsNhanSuToanBo, setDsNhanSuToanBo] = useState<NhanSu[]>([]);
  const [dsPhongBanToanBo, setDsPhongBanToanBo] = useState<PhongBan[]>([]);
  const [daTaiDanhMuc, setDaTaiDanhMuc] = useState(false);

  const [daCopyLink, setDaCopyLink] = useState<string | null>(null);

  // Thông tin user hiện tại
  const vaiTro = nguoiDungHienTai?.vai_tro || '';
  const userId = nguoiDungHienTai?.id || '';
  const userPhongBanId = nguoiDungHienTai?.phong_ban_id || '';
  const userChucVu = ((nguoiDungHienTai as any)?.chuc_vu || '').toLowerCase();

  // 1. Quản trị hệ thống, Ban Giám đốc: có toàn quyền điều phối & duyệt thay thế
  const coQuyenAdmin =
    !nguoiDungHienTai ||
    vaiTro === 'giam_doc' ||
    vaiTro === 'quan_tri_he_thong' ||
    vaiTro === 'admin' ||
    vaiTro.includes('giam_doc') ||
    vaiTro.includes('admin') ||
    vaiTro.includes('quan_tri');

  // Tải danh sách nhân sự & phòng ban khi cần chọn người
  const taiDuLieuNhanSuVaPhongBan = async () => {
    if (daTaiDanhMuc) return;
    try {
      const [resNS, resPB] = await Promise.all([
        danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong', trang_thai_hoat_dong: 'hoat_dong' }),
        danhSachPhongBan({ trang_thai_du_lieu: 'hoat_dong' })
      ]);
      setDsNhanSuToanBo(resNS.mang || []);
      setDsPhongBanToanBo(resPB.mang || []);
      setDaTaiDanhMuc(true);
    } catch (err) {
      console.warn('Lỗi tải danh mục nhân sự/phòng ban:', err);
    }
  };

  // Map ID phòng ban sang tên
  const mapTenPhongBan = useMemo(() => {
    const m = new Map<string, string>();
    dsPhongBanToanBo.forEach((pb) => m.set(pb.id, pb.ten_phong_ban));
    return m;
  }, [dsPhongBanToanBo]);

  // Lọc danh sách nhân sự CHỈ THUỘC PHÒNG KHTH (Kế hoạch tổng hợp)
  const dsNhanSuKHTH = useMemo(() => {
    const dsPbKHTH = dsPhongBanToanBo.filter((pb) => {
      const ten = (pb.ten_phong_ban || '').toLowerCase();
      const ma = (pb.ma_phong_ban || '').toLowerCase();
      return (
        ten.includes('kế hoạch') ||
        ten.includes('khth') ||
        ten.includes('tổng hợp') ||
        ma.includes('khth') ||
        ma.includes('kh')
      );
    });
    const pbIds = new Set(dsPbKHTH.map((p) => p.id));

    let list = dsNhanSuToanBo.filter((ns) => {
      if (ns.trang_thai_du_lieu === 'da_xoa' || ns.trang_thai === false) return false;
      if (ns.phong_ban_id && pbIds.has(ns.phong_ban_id)) return true;
      const cv = (ns.chuc_vu || '').toLowerCase();
      if (cv.includes('khth') || cv.includes('kế hoạch') || cv.includes('tổng hợp')) return true;
      if (Array.isArray(ns.phong_ban_phu_trach_them) && ns.phong_ban_phu_trach_them.some((id) => pbIds.has(id))) return true;
      return false;
    });

    if (list.length === 0) {
      list = dsNhanSuToanBo.filter((ns) => {
        if (ns.trang_thai_du_lieu === 'da_xoa' || ns.trang_thai === false) return false;
        const cv = (ns.chuc_vu || '').toLowerCase();
        const vt = (ns.vai_tro || '').toLowerCase();
        return (
          cv.includes('khth') ||
          cv.includes('kế hoạch') ||
          cv.includes('kỹ thuật') ||
          vt === 'nhan_vien_ky_thuat'
        );
      });
    }

    return list;
  }, [dsNhanSuToanBo, dsPhongBanToanBo]);

  // Kiểm tra phòng ban người dùng
  const isKHTHDepartment = useMemo(() => {
    if (!userPhongBanId) return userChucVu.includes('khth') || userChucVu.includes('kế hoạch');
    const tenPB = (mapTenPhongBan.get(userPhongBanId) || '').toLowerCase();
    return (
      tenPB.includes('kế hoạch') ||
      tenPB.includes('khth') ||
      tenPB.includes('tổng hợp') ||
      userChucVu.includes('khth') ||
      userChucVu.includes('kế hoạch')
    );
  }, [userPhongBanId, mapTenPhongBan, userChucVu]);

  const isKDDepartment = useMemo(() => {
    if (!userPhongBanId) return userChucVu.includes('kinh doanh') || userChucVu.includes('sales');
    const tenPB = (mapTenPhongBan.get(userPhongBanId) || '').toLowerCase();
    return (
      tenPB.includes('kinh doanh') ||
      tenPB.includes('kd') ||
      tenPB.includes('sales') ||
      userChucVu.includes('kinh doanh') ||
      userChucVu.includes('sales')
    );
  }, [userPhongBanId, mapTenPhongBan, userChucVu]);

  // Phân quyền theo chức vụ:
  // - laTPKD: Trưởng phòng Kinh doanh (hoặc Trưởng phòng nếu chưa gán phòng cụ thể, hoặc Admin)
  const laTPKD = coQuyenAdmin || vaiTro === 'truong_phong_kd' || (vaiTro === 'truong_phong' && (isKDDepartment || !isKHTHDepartment));

  // - laTPKH: Trưởng phòng KHTH (hoặc Trưởng phòng nếu chưa gán phòng cụ thể, hoặc Admin)
  const laTPKH = coQuyenAdmin || vaiTro === 'truong_phong_khth' || (vaiTro === 'truong_phong' && (isKHTHDepartment || !isKDDepartment));

  // Kiểm tra yêu cầu có phải do user hiện tại tạo hay không
  const laNguoiTaoCuaYeuCau = (yc: YeuCauPhoiHop) => {
    if (!userId && !nguoiDungHienTai) return true; // Preview mode khi chưa đăng nhập
    if (yc.nguoi_tao_id && userId && yc.nguoi_tao_id === userId) return true;
    if (
      nguoiDungHienTai?.ho_va_ten &&
      yc.ten_nguoi_tao &&
      yc.ten_nguoi_tao.trim().toLowerCase() === nguoiDungHienTai.ho_va_ten.trim().toLowerCase()
    ) {
      return true;
    }
    if (
      nguoiDungHienTai?.email &&
      (yc as any).nguoi_tao_email &&
      (yc as any).nguoi_tao_email.trim().toLowerCase() === nguoiDungHienTai.email.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  // Quản lý hoặc Ban giám đốc: Toàn quyền xem, điều phối & duyệt
  const laQuanLyHoacAdmin = coQuyenAdmin || laTPKD || laTPKH;

  // Nguồn dữ liệu theo phân quyền:
  // - Sale: Chỉ thấy các yêu cầu do chính mình tạo ("yêu cầu của sale nào thì sale đó thấy")
  // - Chuyên viên KHTH: Thấy yêu cầu được giao cho mình hoặc do chính mình tạo
  // - Trưởng phòng & Lãnh đạo (TPKD, TPKHTH, Admin, Giám đốc): Thấy toàn bộ để điều phối & phê duyệt
  const dsNguon = useMemo(() => {
    const tatCa = danhSachYeuCau.filter((x) => x.trang_thai_du_lieu !== 'da_xoa');
    if (!userId || laQuanLyHoacAdmin) {
      return tatCa;
    }

    return tatCa.filter((yc) => {
      const laNguoiTao = laNguoiTaoCuaYeuCau(yc);
      const duocGiao =
        (Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
          yc.danh_sach_nhan_su_thuc_hien_ids.includes(userId)) ||
        (Array.isArray(yc.danh_sach_ten_nhan_su_thuc_hien) &&
          !!nguoiDungHienTai?.ho_va_ten &&
          yc.danh_sach_ten_nhan_su_thuc_hien.some(
            (t) => t.trim().toLowerCase() === nguoiDungHienTai.ho_va_ten!.trim().toLowerCase()
          ));

      // Nếu là chuyên viên KHTH
      if (vaiTro === 'nhan_vien_ky_thuat' || isKHTHDepartment) {
        return duocGiao || laNguoiTao;
      }

      // Nếu là Sale (hoặc bất kỳ nhân sự thường nào): chỉ thấy yêu cầu do chính mình tạo
      return laNguoiTao;
    });
  }, [
    danhSachYeuCau,
    userId,
    laQuanLyHoacAdmin,
    vaiTro,
    isKHTHDepartment,
    nguoiDungHienTai?.ho_va_ten,
    nguoiDungHienTai?.email
  ]);

  // Đếm số lượng badge cho từng tab
  const thongKeTabs = useMemo(() => {
    let dangChay = 0;
    let choTPKD = 0;
    let choTPKH = 0;
    let khthDangLam = 0;
    let choSale = 0;
    let daHoanThanh = 0;

    for (const yc of dsNguon) {
      if (yc.trang_thai === 'da_hoan_thanh') {
        daHoanThanh++;
      } else {
        dangChay++;
      }

      if (yc.trang_thai === 'cho_tpkd_duyet' || yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') {
        choTPKD++;
      }
      if (yc.trang_thai === 'cho_tpkh_tiep_nhan' || yc.trang_thai === 'cho_tpkh_duyet_ket_qua') {
        choTPKH++;
      }
      if (yc.trang_thai === 'cho_cv_khth_thuc_hien' || yc.trang_thai === 'cho_khth_thuc_hien') {
        khthDangLam++;
      }
      if (yc.trang_thai === 'cho_sale_nghiem_thu' || yc.trang_thai === 'da_phe_duyet' || yc.trang_thai === 'yeu_cau_chinh_sua') {
        choSale++;
      }
    }

    return {
      dang_chay: dangChay,
      cho_tpkd: choTPKD,
      cho_tpkh: choTPKH,
      khth_dang_lam: khthDangLam,
      cho_sale: choSale,
      da_hoan_thanh: daHoanThanh,
      tat_ca: dsNguon.length
    };
  }, [dsNguon]);

  // Lọc theo Tab đang chọn
  const dsTheoTab = useMemo(() => {
    if (tabHienTai === 'dang_chay') return dsNguon.filter((yc) => yc.trang_thai !== 'da_hoan_thanh');
    if (tabHienTai === 'cho_tpkd') {
      return dsNguon.filter(
        (yc) => yc.trang_thai === 'cho_tpkd_duyet' || yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet'
      );
    }
    if (tabHienTai === 'cho_tpkh') {
      return dsNguon.filter(
        (yc) => yc.trang_thai === 'cho_tpkh_tiep_nhan' || yc.trang_thai === 'cho_tpkh_duyet_ket_qua'
      );
    }
    if (tabHienTai === 'khth_dang_lam') {
      return dsNguon.filter(
        (yc) => yc.trang_thai === 'cho_cv_khth_thuc_hien' || yc.trang_thai === 'cho_khth_thuc_hien'
      );
    }
    if (tabHienTai === 'cho_sale') {
      return dsNguon.filter(
        (yc) =>
          yc.trang_thai === 'cho_sale_nghiem_thu' ||
          yc.trang_thai === 'da_phe_duyet' ||
          yc.trang_thai === 'yeu_cau_chinh_sua'
      );
    }
    if (tabHienTai === 'da_hoan_thanh') {
      return dsNguon.filter((yc) => yc.trang_thai === 'da_hoan_thanh');
    }
    return dsNguon;
  }, [dsNguon, tabHienTai]);

  // Lọc theo từ khóa tìm kiếm
  const dsSauLoc = useMemo(() => {
    const kw = tuKhoaTim.trim().toLowerCase();
    if (!kw) return dsTheoTab;
    return dsTheoTab.filter((yc) => {
      return (
        (yc.ten_du_an && yc.ten_du_an.toLowerCase().includes(kw)) ||
        (yc.noi_dung_yeu_cau && yc.noi_dung_yeu_cau.toLowerCase().includes(kw)) ||
        (yc.ten_nguoi_tao && yc.ten_nguoi_tao.toLowerCase().includes(kw)) ||
        (Array.isArray(yc.danh_sach_ten_nhan_su_thuc_hien) &&
          yc.danh_sach_ten_nhan_su_thuc_hien.some((ten) => ten.toLowerCase().includes(kw)))
      );
    });
  }, [dsTheoTab, tuKhoaTim]);

  // Tìm kiếm xuyên suốt trên tất cả tab để gợi ý nếu tab hiện tại ra 0 kết quả
  const soKetQuaTimTatCa = useMemo(() => {
    const kw = tuKhoaTim.trim().toLowerCase();
    if (!kw) return 0;
    return dsNguon.filter((yc) => {
      return (
        (yc.ten_du_an && yc.ten_du_an.toLowerCase().includes(kw)) ||
        (yc.noi_dung_yeu_cau && yc.noi_dung_yeu_cau.toLowerCase().includes(kw)) ||
        (yc.ten_nguoi_tao && yc.ten_nguoi_tao.toLowerCase().includes(kw)) ||
        (Array.isArray(yc.danh_sach_ten_nhan_su_thuc_hien) &&
          yc.danh_sach_ten_nhan_su_thuc_hien.some((ten) => ten.toLowerCase().includes(kw)))
      );
    }).length;
  }, [dsNguon, tuKhoaTim]);

  // Phân trang
  const tongSoTrang = Math.max(1, Math.ceil(dsSauLoc.length / SO_MUC_MOI_TRANG));
  const dsHienThi = useMemo(() => {
    const batDau = (trangHienTai - 1) * SO_MUC_MOI_TRANG;
    return dsSauLoc.slice(batDau, batDau + SO_MUC_MOI_TRANG);
  }, [dsSauLoc, trangHienTai]);

  // =========================================================================
  // CÁC HÀNH ĐỘNG THEO ĐÚNG QUY TRÌNH 7 BƯỚC
  // =========================================================================

  // BƯỚC 1: TPKD bấm Chuyển KHTH
  const handleTPKDChuyenKHTH = async (yc: YeuCauPhoiHop) => {
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'cho_tpkh_tiep_nhan',
        ghiChu: 'TPKD đã duyệt yêu cầu và chuyển sang Trưởng phòng KHTH',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
    } catch {
      alert('Có lỗi khi chuyển thông tin sang KHTH.');
    }
  };

  // BƯỚC 2: TPKH Mở modal tiếp nhận & phân công (Tự làm hoặc Giao CV)
  const moModalTiepNhanTPKH = async (yc: YeuCauPhoiHop, hinhThuc: 'giao_cv' | 'tu_lam' = 'giao_cv') => {
    void taiDuLieuNhanSuVaPhongBan();
    setModalGiaoViec({ mo: true, yeuCau: yc, hinhThuc });
    setGhiChuGiaoViec('');
    setLinkDriveTuLam('');
    setHanXongGiaoViec(yc.han_hoan_thanh || '');
    setTuKhoaTimNS('');
    setLoiGiaoViec('');

    if (Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) && yc.danh_sach_nhan_su_thuc_hien_ids.length > 0) {
      const list = yc.danh_sach_nhan_su_thuc_hien_ids.map((id, idx) => ({
        id,
        ho_va_ten: yc.danh_sach_ten_nhan_su_thuc_hien?.[idx] || 'Nhân sự'
      }));
      setDsNhanSuChon(list);
    } else {
      setDsNhanSuChon([]);
    }
  };

  const toggleChonNhanSu = (ns: NhanSu) => {
    setDsNhanSuChon((prev) => {
      const tonTai = prev.some((x) => x.id === ns.id);
      if (tonTai) {
        return prev.filter((x) => x.id !== ns.id);
      } else {
        return [...prev, { id: ns.id, ho_va_ten: ns.ho_va_ten }];
      }
    });
    setLoiGiaoViec('');
  };

  const daChonTatCaKHTH = useMemo(() => {
    if (dsNhanSuKHTH.length === 0) return false;
    return dsNhanSuKHTH.every((ns) => dsNhanSuChon.some((x) => x.id === ns.id));
  }, [dsNhanSuKHTH, dsNhanSuChon]);

  const toggleChonTatCaKHTH = () => {
    if (daChonTatCaKHTH) {
      setDsNhanSuChon([]);
    } else {
      setDsNhanSuChon(dsNhanSuKHTH.map((ns) => ({ id: ns.id, ho_va_ten: ns.ho_va_ten })));
    }
    setLoiGiaoViec('');
  };

  // TPKH Xác nhận giao việc cho CV hoặc Tự làm nộp thẳng TPKD
  const handleXacNhanGiaoViec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalGiaoViec.yeuCau) return;

    if (modalGiaoViec.hinhThuc === 'giao_cv') {
      if (dsNhanSuChon.length === 0) {
        setLoiGiaoViec('Vui lòng chọn ít nhất 1 nhân sự phòng KHTH.');
        return;
      }
      setDangXuLyGiaoViec(true);
      try {
        const res = await chuyenBuocYeuCauPhoiHop({
          yeuCauId: modalGiaoViec.yeuCau.id,
          trangThaiMoi: 'cho_cv_khth_thuc_hien',
          danhSachNhanSuThucHien: dsNhanSuChon,
          hanHoanThanhMoi: hanXongGiaoViec || null,
          ghiChu: ghiChuGiaoViec.trim() || null,
          nguoiThucHien: nguoiDungHienTai
        });
        if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
        setModalGiaoViec({ mo: false, yeuCau: null, hinhThuc: 'giao_cv' });
      } catch {
        setLoiGiaoViec('Có lỗi xảy ra khi phân công.');
      } finally {
        setDangXuLyGiaoViec(false);
      }
    } else {
      // TPKH Tự thực hiện & Nộp kết quả trực tiếp cho TPKD
      if (!linkDriveTuLam.trim()) {
        setLoiGiaoViec('Vui lòng dán link Google Drive kết quả.');
        return;
      }
      setDangXuLyGiaoViec(true);
      try {
        const res = await chuyenBuocYeuCauPhoiHop({
          yeuCauId: modalGiaoViec.yeuCau.id,
          trangThaiMoi: 'cho_tpkd_duyet_ket_qua',
          linkDriveKetQua: linkDriveTuLam.trim(),
          ghiChu: ghiChuGiaoViec.trim() || 'TPKH tự thực hiện & nộp kết quả trực tiếp cho TPKD',
          nguoiThucHien: nguoiDungHienTai
        });
        if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
        setModalGiaoViec({ mo: false, yeuCau: null, hinhThuc: 'giao_cv' });
      } catch {
        setLoiGiaoViec('Có lỗi khi nộp kết quả.');
      } finally {
        setDangXuLyGiaoViec(false);
      }
    }
  };

  // BƯỚC 3: CV KHTH Nộp kết quả
  const moModalNopDrive = (yc: YeuCauPhoiHop) => {
    setModalNopDrive({ mo: true, yeuCau: yc });
    setLinkDriveNop(yc.link_drive_ket_qua || '');
    setGhiChuNop('');
  };

  const handleXacNhanNopDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNopDrive.yeuCau) return;
    if (!linkDriveNop.trim()) {
      alert('Vui lòng dán link Google Drive kết quả.');
      return;
    }

    setDangXuLyNop(true);
    try {
      const laTPKHNopThang =
        modalNopDrive.yeuCau.trang_thai === 'cho_tpkh_duyet_ket_qua' ||
        !Array.isArray(modalNopDrive.yeuCau.danh_sach_nhan_su_thuc_hien_ids) ||
        modalNopDrive.yeuCau.danh_sach_nhan_su_thuc_hien_ids.length === 0;

      const trangThaiMoi: TrangThaiYeuCauPhoiHop = laTPKHNopThang
        ? 'cho_tpkd_duyet_ket_qua'
        : 'cho_tpkh_duyet_ket_qua';

      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: modalNopDrive.yeuCau.id,
        trangThaiMoi,
        linkDriveKetQua: linkDriveNop.trim(),
        ghiChu:
          ghiChuNop.trim() ||
          (laTPKHNopThang
            ? 'TPKH đã cập nhật & nộp kết quả trực tiếp cho TPKD'
            : 'CV KHTH nộp kết quả xử lý'),
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
      setModalNopDrive({ mo: false, yeuCau: null });
    } catch {
      alert('Có lỗi khi nộp kết quả.');
    } finally {
      setDangXuLyNop(false);
    }
  };

  // BƯỚC 4: TPKH Duyệt KQ của CV & Chuyển TPKD
  const handleTPKHDuyetKetQua = async (yc: YeuCauPhoiHop) => {
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'cho_tpkd_duyet_ket_qua',
        ghiChu: 'TPKH đã kiểm tra đạt yêu cầu & chuyển TPKD phê duyệt',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
    } catch {
      alert('Có lỗi khi duyệt kết quả.');
    }
  };

  // BƯỚC 5: TPKD Phê duyệt kết quả & Chuyển Sale
  const handleTPKDDuyetKetQua = async (yc: YeuCauPhoiHop) => {
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'cho_sale_nghiem_thu',
        ghiChu: 'TPKD đã duyệt kết quả và chuyển Sale nghiệm thu',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
    } catch {
      alert('Có lỗi khi phê duyệt.');
    }
  };

  // BƯỚC 6: Sale Nghiệm thu & Hoàn tất
  const handleSaleNghiemThuHoanTat = async (yc: YeuCauPhoiHop) => {
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'da_hoan_thanh',
        ghiChu: 'Sale đã nghiệm thu đạt yêu cầu & hoàn tất quy trình',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
    } catch {
      alert('Có lỗi khi hoàn tất yêu cầu.');
    }
  };

  // Mở modal yêu cầu sửa đổi (5 loại)
  const moModalYeuCauSua = (
    yc: YeuCauPhoiHop,
    loaiSua:
      | 'tpkd_tu_choi_sale'
      | 'tpkh_tra_ve_tpkd'
      | 'tpkh_yeu_cau_cv'
      | 'tpkd_yeu_cau_tpkh'
      | 'sale_yeu_cau_sua'
  ) => {
    let tieuDe = 'Yêu cầu chỉnh sửa';
    if (loaiSua === 'tpkd_tu_choi_sale') tieuDe = 'TPKD yêu cầu Sale sửa lại yêu cầu';
    if (loaiSua === 'tpkh_tra_ve_tpkd') tieuDe = 'TPKH trả lại yêu cầu cho TPKD/Sale làm rõ';
    if (loaiSua === 'tpkh_yeu_cau_cv') tieuDe = 'TPKH yêu cầu Chuyên viên chỉnh sửa kết quả';
    if (loaiSua === 'tpkd_yeu_cau_tpkh') tieuDe = 'TPKD yêu cầu TPKH rà soát sửa lại kết quả';
    if (loaiSua === 'sale_yeu_cau_sua') tieuDe = 'Sale yêu cầu hiệu chỉnh lại kết quả (Làm lại)';

    setModalYeuCauSua({ mo: true, yeuCau: yc, loaiSua, tieuDe });
    setLyDoSua('');
  };

  // TPKH chuyển CV tiếp tục sửa lại kết quả theo ý kiến TPKD
  const handleTPKHChuyenCVSuaLai = async (yc: YeuCauPhoiHop) => {
    try {
      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: yc.id,
        trangThaiMoi: 'cho_cv_khth_thuc_hien',
        ghiChu: yc.ghi_chu_phan_hoi || 'TPKH chuyển Chuyên viên hiệu chỉnh lại kết quả',
        nguoiThucHien: nguoiDungHienTai
      });
      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
    } catch {
      alert('Có lỗi khi chuyển cho Chuyên viên.');
    }
  };

  const handleXacNhanYeuCauSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalYeuCauSua.yeuCau) return;
    if (!lyDoSua.trim()) {
      alert('Vui lòng nhập nội dung cần chỉnh sửa.');
      return;
    }

    setDangXuLyYeuCauSua(true);
    try {
      let trangThaiMoi: TrangThaiYeuCauPhoiHop = 'yeu_cau_chinh_sua';
      let ghiChu = lyDoSua.trim();

      if (modalYeuCauSua.loaiSua === 'tpkd_tu_choi_sale') {
        trangThaiMoi = 'yeu_cau_chinh_sua';
        ghiChu = `TPKD yêu cầu Sale sửa lại: ${lyDoSua.trim()}`;
      } else if (modalYeuCauSua.loaiSua === 'tpkh_tra_ve_tpkd') {
        trangThaiMoi = 'cho_tpkd_duyet';
        ghiChu = `TPKH trả lại yêu cầu TPKD/Sale làm rõ: ${lyDoSua.trim()}`;
      } else if (modalYeuCauSua.loaiSua === 'tpkh_yeu_cau_cv') {
        trangThaiMoi = 'cho_cv_khth_thuc_hien';
        ghiChu = `TPKH yêu cầu CV sửa lại: ${lyDoSua.trim()}`;
      } else if (modalYeuCauSua.loaiSua === 'tpkd_yeu_cau_tpkh') {
        // "TPKD không ok thì yêu cầu sửa, lúc này yêu cầu sửa sẽ đến TPKH"
        trangThaiMoi = 'cho_tpkh_tiep_nhan';
        ghiChu = `TPKD yêu cầu TPKH rà soát sửa lại: ${lyDoSua.trim()}`;
      } else if (modalYeuCauSua.loaiSua === 'sale_yeu_cau_sua') {
        // "Sale vẫn có thể yêu càu sửa lại, và quy trình lại chạy lại từ đầu"
        trangThaiMoi = 'cho_tpkd_duyet';
        ghiChu = `Sale yêu cầu làm lại: ${lyDoSua.trim()}`;
      }

      const res = await chuyenBuocYeuCauPhoiHop({
        yeuCauId: modalYeuCauSua.yeuCau.id,
        trangThaiMoi,
        ghiChu,
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
      setModalYeuCauSua({ mo: false, yeuCau: null, loaiSua: 'tpkd_tu_choi_sale', tieuDe: '' });
    } catch {
      alert('Có lỗi khi gửi phản hồi.');
    } finally {
      setDangXuLyYeuCauSua(false);
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setDaCopyLink(id);
    setTimeout(() => setDaCopyLink(null), 2000);
  };

  // Mở modal sửa nội dung cơ bản
  const batDauSua = (yc: YeuCauPhoiHop) => {
    setYeuCauDangSua(yc);
    setSuaNoiDung(yc.noi_dung_yeu_cau);
    setSuaLinkDrive(yc.link_drive_dau_vao || '');
    setSuaHanXong(yc.han_hoan_thanh || '');
    setLoiSua('');
  };

  const handleLuuSua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeuCauDangSua) return;
    if (!suaNoiDung.trim()) {
      setLoiSua('Vui lòng nhập nội dung yêu cầu.');
      return;
    }

    setDangLuuSua(true);
    try {
      const laDangSuaLai = yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua';
      const res = await capNhatThongTinYeuCau({
        id: yeuCauDangSua.id,
        noi_dung_yeu_cau: suaNoiDung.trim(),
        link_drive_dau_vao: suaLinkDrive.trim() || null,
        han_hoan_thanh: suaHanXong || null,
        trang_thai: laDangSuaLai ? 'cho_tpkd_duyet' : undefined,
        ghi_chu: laDangSuaLai
          ? `Sale đã hiệu chỉnh và gửi lại TPKD: ${suaNoiDung.trim().slice(0, 80)}`
          : undefined,
        nguoiThucHien: nguoiDungHienTai
      });

      if (res && onCapNhatYeuCau) onCapNhatYeuCau(res);
      setYeuCauDangSua(null);
    } catch {
      setLoiSua('Có lỗi khi lưu thay đổi.');
    } finally {
      setDangLuuSua(false);
    }
  };

  // Xóa yêu cầu
  const handleXacNhanXoa = async () => {
    if (!yeuCauDangXoa) return;
    setDangXoa(true);
    try {
      const ok = await xoaYeuCauPhoiHop(yeuCauDangXoa.id, nguoiDungHienTai);
      if (ok && onXoaYeuCau) onXoaYeuCau(yeuCauDangXoa.id);
      setYeuCauDangXoa(null);
    } catch {
      alert('Có lỗi khi xóa yêu cầu.');
    } finally {
      setDangXoa(false);
    }
  };

  // Danh sách các tab hiển thị
  const danhSachTabs: {
    key: TabYeuCau;
    nhan: string;
    count: number;
    badgeColor?: string;
  }[] = [
    {
      key: 'dang_chay',
      nhan: 'Đang chạy',
      count: thongKeTabs.dang_chay,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      key: 'cho_tpkd',
      nhan: 'Chờ TPKD',
      count: thongKeTabs.cho_tpkd,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      key: 'cho_tpkh',
      nhan: 'Chờ TPKH',
      count: thongKeTabs.cho_tpkh,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      key: 'khth_dang_lam',
      nhan: 'KHTH đang làm',
      count: thongKeTabs.khth_dang_lam,
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      key: 'cho_sale',
      nhan: 'Chờ Sale',
      count: thongKeTabs.cho_sale,
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    {
      key: 'da_hoan_thanh',
      nhan: 'Đã hoàn thành',
      count: thongKeTabs.da_hoan_thanh,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      key: 'tat_ca',
      nhan: 'Tất cả',
      count: thongKeTabs.tat_ca,
      badgeColor: 'bg-slate-200 text-slate-700'
    }
  ];

  // Component Stepper 5 bước trực quan
  const renderStepper = (yc: YeuCauPhoiHop) => {
    let buocHienTai = 2;
    let textHienTai = '';

    if (yc.trang_thai === 'cho_tpkd_duyet') {
      buocHienTai = 2;
      textHienTai = 'Chờ Trưởng phòng Kinh doanh xem xét & chuyển KHTH';
    } else if (yc.trang_thai === 'cho_tpkh_tiep_nhan') {
      buocHienTai = 3;
      textHienTai = 'Chờ Trưởng phòng KHTH tiếp nhận (Giao việc CV hoặc Tự làm)';
    } else if (yc.trang_thai === 'cho_cv_khth_thuc_hien' || yc.trang_thai === 'cho_khth_thuc_hien') {
      buocHienTai = 3;
      const tenCV = yc.danh_sach_ten_nhan_su_thuc_hien?.length ? yc.danh_sach_ten_nhan_su_thuc_hien.join(', ') : 'CV KHTH';
      textHienTai = `Chuyên viên KHTH (${tenCV}) đang thực hiện`;
    } else if (yc.trang_thai === 'cho_tpkh_duyet_ket_qua') {
      buocHienTai = 4;
      textHienTai = 'CV đã nộp kết quả ➔ Chờ Trưởng phòng KHTH kiểm tra duyệt';
    } else if (yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') {
      buocHienTai = 4;
      textHienTai = 'KHTH đã gửi kết quả ➔ Chờ Trưởng phòng KD duyệt bàn giao';
    } else if (yc.trang_thai === 'cho_sale_nghiem_thu' || yc.trang_thai === 'da_phe_duyet') {
      buocHienTai = 5;
      textHienTai = `Đã duyệt KQ ➔ Chờ Sale (${yc.ten_nguoi_tao}) nghiệm thu hoàn tất`;
    } else if (yc.trang_thai === 'da_hoan_thanh') {
      buocHienTai = 6;
      textHienTai = 'Hoàn tất toàn bộ quy trình phối hợp';
    } else if (yc.trang_thai === 'yeu_cau_chinh_sua') {
      buocHienTai = 1;
      textHienTai = 'TPKD yêu cầu sửa lại ➔ Chờ Sale chỉnh sửa & gửi lại TPKD';
    }

    const dsCacBuoc = [
      { so: 1, ten: 'Khởi tạo', vaiTro: 'Sale' },
      { so: 2, ten: 'Chuyển KHTH', vaiTro: 'TPKD' },
      { so: 3, ten: 'Thực hiện', vaiTro: 'TPKH / CV' },
      { so: 4, ten: 'Duyệt KQ', vaiTro: 'TPKH ➔ TPKD' },
      { so: 5, ten: 'Nghiệm thu', vaiTro: 'Sale' }
    ];

    return (
      <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 space-y-2">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {dsCacBuoc.map((b) => {
            const daQua = buocHienTai > b.so;
            const dangChay = buocHienTai === b.so;
            return (
              <div key={b.so} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'w-full h-1.5 rounded-full transition-all mb-1',
                    daQua ? 'bg-emerald-500' : dangChay ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'
                  )}
                />
                <div className="flex items-center gap-1 justify-center">
                  {daQua ? (
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                  ) : dangChay ? (
                    <div className="size-2 rounded-full bg-blue-600 ring-2 ring-blue-200 shrink-0" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-[11px] font-semibold truncate',
                      daQua ? 'text-emerald-700' : dangChay ? 'text-blue-700 font-bold' : 'text-slate-400'
                    )}
                  >
                    {b.ten}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:block truncate">
                  {b.vaiTro}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 flex-wrap gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="text-blue-600 font-bold text-[11px]">Tiến trình:</span>
            <span className={cn('text-xs font-semibold', buocHienTai === 6 ? 'text-emerald-700' : 'text-slate-800')}>
              {textHienTai}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* KHỐI HEADER TRANG */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-2xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Yêu cầu phối hợp phòng ban
                </h2>
                {thongKeTabs.dang_chay > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {thongKeTabs.dang_chay} đang chạy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Luân chuyển thông tin tác nghiệp xuyên suốt giữa Kinh doanh và Kế hoạch tổng hợp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMoModalTaoYeuCau && (
              <button
                type="button"
                onClick={onMoModalTaoYeuCau}
                className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Sparkles className="size-3.5" />
                <span>+ Tạo yêu cầu mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Thanh Tabs phân loại trạng thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
          {danhSachTabs.map((tab) => {
            const dangChon = tabHienTai === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setTabHienTai(tab.key);
                  setTrangHienTai(1);
                }}
                className={cn(
                  'h-8.5 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all shrink-0',
                  dangChon
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <span>{tab.nhan}</span>
                {tab.count > 0 && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded-full text-[10.5px] font-bold',
                      dangChon ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Thanh tìm kiếm nhanh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={tuKhoaTim}
              onChange={(e) => {
                setTuKhoaTim(e.target.value);
                setTrangHienTai(1);
              }}
              placeholder="Tìm theo tên dự án, nội dung yêu cầu, người tạo..."
              className="w-full h-9 pl-8.5 pr-8 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
            {tuKhoaTim && (
              <button
                type="button"
                onClick={() => {
                  setTuKhoaTim('');
                  setTrangHienTai(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {dsSauLoc.length > 0 && (
            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 font-medium">
              {dsSauLoc.length} yêu cầu
            </span>
          )}
        </div>

        {/* DANH SÁCH YÊU CẦU: THẺ CARD RÕ RÀNG */}
        {dsHienThi.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <p>
              {tabHienTai === 'tat_ca'
                ? 'Không có yêu cầu phối hợp nào.'
                : `Không có yêu cầu nào ở mục "${danhSachTabs.find((t) => t.key === tabHienTai)?.nhan}".`}
            </p>
            {tuKhoaTim && soKetQuaTimTatCa > 0 && tabHienTai !== 'tat_ca' && (
              <button
                type="button"
                onClick={() => setTabHienTai('tat_ca')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer block mx-auto not-italic"
              >
                Tìm thấy {soKetQuaTimTatCa} yêu cầu ở các mục khác. Bấm để xem tất cả.
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {dsHienThi.map((yc) => {
              const cfgTrangThai = NHAN_TRANG_THAI_YEU_CAU[yc.trang_thai] || {
                label: yc.trang_thai,
                mauBadge: 'bg-slate-100 text-slate-600 border-slate-200',
                textClass: 'text-slate-600',
                buocSo: 1
              };

              const laNguoiTao = laNguoiTaoCuaYeuCau(yc);
              const coQuyenSuaXoa =
                ((laNguoiTao || coQuyenAdmin) &&
                  (yc.trang_thai === 'cho_tpkd_duyet' || yc.trang_thai === 'yeu_cau_chinh_sua')) ||
                coQuyenAdmin;

              const duocGiaoDichDanh =
                (Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
                  yc.danh_sach_nhan_su_thuc_hien_ids.includes(userId)) ||
                (Array.isArray(yc.danh_sach_ten_nhan_su_thuc_hien) &&
                  !!nguoiDungHienTai?.ho_va_ten &&
                  yc.danh_sach_ten_nhan_su_thuc_hien.some(
                    (t) => t.trim().toLowerCase() === nguoiDungHienTai.ho_va_ten!.trim().toLowerCase()
                  ));
              const coQuyenNopKetQua = duocGiaoDichDanh || laTPKH || coQuyenAdmin;

              return (
                <div
                  key={yc.id}
                  className="rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white p-4 shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  {/* DÒNG 1: DỰ ÁN + TRẠNG THÁI + THỜI GIAN */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <button
                        type="button"
                        onClick={() => onMoChiTietDuAn?.(yc.du_an_id)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-sm truncate text-left"
                        title="Xem chi tiết dự án"
                      >
                        <FolderKanban className="size-4 text-blue-600 shrink-0" />
                        <span className="truncate">{yc.ten_du_an}</span>
                      </button>

                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', cfgTrangThai.mauBadge)}>
                        {cfgTrangThai.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-500 shrink-0 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium text-slate-600">
                        <CalendarDays className="size-3.5 text-slate-400" />
                        <span>Ngày tạo: <strong className="text-slate-800 font-semibold">{formatNgay(yc.ngay_tao) || 'Hôm nay'}</strong></span>
                      </div>

                      {yc.han_hoan_thanh && (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium text-amber-800">
                          <Clock className="size-3.5 text-amber-500" />
                          <span>Hạn xong: <strong className="font-semibold">{formatNgay(yc.han_hoan_thanh)}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DÒNG 2: THANH TIẾN TRÌNH STEPPER 5 BƯỚC */}
                  {renderStepper(yc)}

                  {/* THÔNG BÁO Ý KIẾN PHẢN HỒI / YÊU CẦU CHỈNH SỬA KHI BỊ TRẢ LẠI */}
                  {yc.ghi_chu_phan_hoi && yc.trang_thai !== 'da_hoan_thanh' && (
                    <div
                      className={cn(
                        'rounded-xl border p-3 space-y-1.5',
                        yc.trang_thai === 'yeu_cau_chinh_sua'
                          ? 'border-rose-200 bg-rose-50/90'
                          : yc.ghi_chu_phan_hoi.toLowerCase().includes('sửa') ||
                            yc.ghi_chu_phan_hoi.toLowerCase().includes('làm lại') ||
                            yc.ghi_chu_phan_hoi.toLowerCase().includes('làm rõ')
                          ? 'border-amber-200 bg-amber-50/90'
                          : 'border-blue-200 bg-blue-50/90'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1.5 font-bold text-xs',
                          yc.trang_thai === 'yeu_cau_chinh_sua' ? 'text-rose-800' : 'text-amber-800'
                        )}
                      >
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>
                          {yc.trang_thai === 'yeu_cau_chinh_sua'
                            ? 'TPKD yêu cầu chỉnh sửa lại yêu cầu:'
                            : 'Ý kiến phản hồi / Yêu cầu chỉnh sửa:'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 bg-white/90 p-2.5 rounded-lg border border-slate-200/60 font-medium whitespace-pre-wrap leading-relaxed shadow-2xs">
                        {yc.ghi_chu_phan_hoi}
                      </div>
                    </div>
                  )}

                  {/* DÒNG 3: NỘI DUNG YÊU CẦU */}
                  <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 text-[13px] text-slate-800 leading-relaxed font-normal">
                    {yc.noi_dung_yeu_cau}
                  </div>

                  {/* DÒNG 4: LINK TÀI LIỆU ĐẦU VÀO & FILE KẾT QUẢ & PHẢN HỒI */}
                  {(yc.link_drive_dau_vao || yc.link_drive_ket_qua || yc.ghi_chu_phan_hoi) && (
                    <div className="flex items-center gap-2.5 flex-wrap pt-0.5 text-xs">
                      {yc.link_drive_dau_vao && (
                        <a
                          href={yc.link_drive_dau_vao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-medium transition"
                        >
                          <Link2 className="size-3.5 text-blue-600" />
                          <span>File yêu cầu đầu vào</span>
                          <ExternalLink className="size-3 text-blue-500" />
                        </a>
                      )}

                      {/* Link kết quả KHTH: ai cũng xem được khi đã có kết quả */}
                      {yc.link_drive_ket_qua && (
                        <a
                          href={yc.link_drive_ket_qua}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-semibold transition"
                        >
                          <FileCheck2 className="size-3.5 text-emerald-600" />
                          <span>File kết quả KHTH</span>
                          <ExternalLink className="size-3 text-emerald-500" />
                        </a>
                      )}

                      {yc.ghi_chu_phan_hoi && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 font-medium">
                          <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
                          <span>Phản hồi: {yc.ghi_chu_phan_hoi}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DÒNG 5: METADATA NGƯỜI GỬI & CÁC NÚT HÀNH ĐỘNG THEO TỪNG BƯỚC */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-slate-400" />
                        <span>Người tạo: <strong className="text-slate-800 font-semibold">{yc.ten_nguoi_tao}</strong></span>
                      </div>

                      {yc.danh_sach_ten_nhan_su_thuc_hien && yc.danh_sach_ten_nhan_su_thuc_hien.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-blue-500" />
                          <span>KHTH xử lý: <strong className="text-slate-800 font-semibold">{yc.danh_sach_ten_nhan_su_thuc_hien.join(', ')}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* CÁC NÚT HÀNH ĐỘNG TƯƠNG ỨNG TỪNG GIAI ĐOẠN */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {/* BƯỚC 1: Chờ TPKD duyệt & chuyển KHTH */}
                      {yc.trang_thai === 'cho_tpkd_duyet' && (
                        <>
                          {(laTPKD || coQuyenAdmin) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleTPKDChuyenKHTH(yc)}
                                className="h-8 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                              >
                                <UserCheck className="size-3.5 stroke-[2.5]" />
                                <span>Chuyển KHTH</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => moModalYeuCauSua(yc, 'tpkd_tu_choi_sale')}
                                className="h-8 px-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                              >
                                <AlertTriangle className="size-3.5 text-rose-600" />
                                <span>Yêu cầu Sale sửa</span>
                              </button>
                            </>
                          )}
                          {laNguoiTao && !laTPKD && !coQuyenAdmin && (
                            <button
                              type="button"
                              onClick={() => batDauSua(yc)}
                              className="h-8 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <Pencil className="size-3.5 text-amber-600" />
                              <span>Chỉnh sửa yêu cầu</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* BƯỚC SỬA: TPKD YÊU CẦU SỬA ➔ SALE (HOẶC ADMIN) CHỈNH SỬA & GỬI LẠI TPKD */}
                      {yc.trang_thai === 'yeu_cau_chinh_sua' && (laNguoiTao || coQuyenAdmin) && (
                        <button
                          type="button"
                          onClick={() => batDauSua(yc)}
                          className="h-8.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition"
                        >
                          <Pencil className="size-3.5 stroke-[2.5]" />
                          <span>Chỉnh sửa & Gửi lại TPKD</span>
                        </button>
                      )}

                      {/* BƯỚC 2: Chờ TPKH tiếp nhận & phân công (2 LỰA CHỌN: Giao CV hoặc Tự làm) */}
                      {yc.trang_thai === 'cho_tpkh_tiep_nhan' && (laTPKH || coQuyenAdmin) && (
                        <>
                          {/* Nếu trước đó đã có CV phân công và đang bị yêu cầu sửa: TPKH có thể chuyển nhanh cho CV sửa */}
                          {Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
                            yc.danh_sach_nhan_su_thuc_hien_ids.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleTPKHChuyenCVSuaLai(yc)}
                                className="h-8.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                              >
                                <Send className="size-3.5" />
                                <span>Chuyển CV sửa lại KQ</span>
                              </button>
                            )}

                          <button
                            type="button"
                            onClick={() => moModalTiepNhanTPKH(yc, 'giao_cv')}
                            className="h-8 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                          >
                            <Users className="size-3.5" />
                            <span>
                              {Array.isArray(yc.danh_sach_nhan_su_thuc_hien_ids) &&
                              yc.danh_sach_nhan_su_thuc_hien_ids.length > 0
                                ? 'Phân công lại CV'
                                : 'Giao việc cho CV'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moModalTiepNhanTPKH(yc, 'tu_lam')}
                            className="h-8 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                          >
                            <Send className="size-3.5" />
                            <span>Tự thực hiện & Nộp KQ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moModalYeuCauSua(yc, 'tpkh_tra_ve_tpkd')}
                            className="h-8 px-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                            title="Trả lại TPKD yêu cầu làm rõ"
                          >
                            <AlertTriangle className="size-3.5 text-rose-600" />
                            <span>Trả lại TPKD làm rõ</span>
                          </button>
                        </>
                      )}

                      {/* BƯỚC 3: CV KHTH đang thực hiện ➔ Nộp kết quả (hoặc TPKH nộp thay / phân công lại) */}
                      {(yc.trang_thai === 'cho_cv_khth_thuc_hien' || yc.trang_thai === 'cho_khth_thuc_hien') && (
                        <>
                          {coQuyenNopKetQua && (
                            <button
                              type="button"
                              onClick={() => moModalNopDrive(yc)}
                              className="h-8.5 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                            >
                              <Send className="size-3.5" />
                              <span>
                                {yc.link_drive_ket_qua
                                  ? 'Chỉnh sửa kết quả & Nộp lại'
                                  : 'Nộp kết quả xử lý'}
                              </span>
                            </button>
                          )}
                          {(laTPKH || coQuyenAdmin) && (
                            <button
                              type="button"
                              onClick={() => moModalTiepNhanTPKH(yc, 'giao_cv')}
                              className="h-8 px-3 rounded-xl bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                              title="Phân công lại nhân sự thực hiện"
                            >
                              <Users className="size-3.5 text-blue-600" />
                              <span>Phân công lại CV</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* BƯỚC 4: Chờ TPKH duyệt KQ của CV ➔ Chuyển TPKD hoặc Yêu cầu CV sửa */}
                      {yc.trang_thai === 'cho_tpkh_duyet_ket_qua' && (laTPKH || coQuyenAdmin) && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTPKHDuyetKetQua(yc)}
                            className="h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                          >
                            <Check className="size-3.5 stroke-[2.5]" />
                            <span>Duyệt & Chuyển TPKD</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moModalYeuCauSua(yc, 'tpkh_yeu_cau_cv')}
                            className="h-8 px-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                          >
                            <AlertTriangle className="size-3.5 text-rose-600" />
                            <span>Yêu cầu CV sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moModalNopDrive(yc)}
                            className="h-8 px-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                            title="TPKH tự chỉnh sửa file kết quả"
                          >
                            <Pencil className="size-3.5 text-amber-600" />
                            <span>Tự sửa file KQ</span>
                          </button>
                        </>
                      )}

                      {/* BƯỚC 5: Chờ TPKD duyệt kết quả ➔ Duyệt chuyển Sale hoặc Yêu cầu TPKH sửa */}
                      {(yc.trang_thai === 'cho_tpkd_duyet_ket_qua' || yc.trang_thai === 'cho_lanh_dao_duyet') &&
                        (laTPKD || coQuyenAdmin) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTPKDDuyetKetQua(yc)}
                              className="h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                            >
                              <Check className="size-3.5 stroke-[2.5]" />
                              <span>Duyệt kết quả (Chuyển Sale)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moModalYeuCauSua(yc, 'tpkd_yeu_cau_tpkh')}
                              className="h-8 px-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <AlertTriangle className="size-3.5 text-rose-600" />
                              <span>Yêu cầu sửa lại (đến TPKH)</span>
                            </button>
                          </>
                        )}

                      {/* BƯỚC 6: Chờ Sale nghiệm thu ➔ Nghiệm thu hoàn tất hoặc Yêu cầu sửa lại (quy trình chạy lại từ đầu) */}
                      {(yc.trang_thai === 'cho_sale_nghiem_thu' || yc.trang_thai === 'da_phe_duyet') &&
                        (laNguoiTao || laTPKD || coQuyenAdmin) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaleNghiemThuHoanTat(yc)}
                              className="h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                            >
                              <Check className="size-3.5 stroke-[2.5]" />
                              <span>Nghiệm thu hoàn tất</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moModalYeuCauSua(yc, 'sale_yeu_cau_sua')}
                              className="h-8 px-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <AlertTriangle className="size-3.5 text-rose-600" />
                              <span>Yêu cầu sửa lại</span>
                            </button>
                          </>
                        )}

                      {/* SAO CHÉP LINK KẾT QUẢ KHI ĐÃ CÓ FILE */}
                      {yc.link_drive_ket_qua && (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(yc.link_drive_ket_qua!, yc.id)}
                          className="h-8 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer transition"
                        >
                          {daCopyLink === yc.id ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Đã chép link</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5 text-slate-500" />
                              <span>Sao chép link</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Nút phụ: Xem lịch sử luân chuyển, Sửa, Xóa */}
                      <div className="flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          onClick={() => setYeuCauDangXemLichSu(yc)}
                          className="size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 inline-flex items-center justify-center cursor-pointer transition-colors"
                          title="Xem lịch sử luân chuyển"
                        >
                          <History className="size-3.5" />
                        </button>

                        {coQuyenSuaXoa && (
                          <button
                            type="button"
                            onClick={() => batDauSua(yc)}
                            className="size-8 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 inline-flex items-center justify-center cursor-pointer transition-colors"
                            title="Chỉnh sửa nội dung"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        )}

                        {laNguoiTao && (yc.trang_thai === 'cho_tpkd_duyet' || yc.trang_thai === 'yeu_cau_chinh_sua') && (
                          <button
                            type="button"
                            onClick={() => setYeuCauDangXoa(yc)}
                            className="size-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 inline-flex items-center justify-center cursor-pointer transition-colors"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {tongSoTrang > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div>
              Trang <span className="font-semibold text-slate-800">{trangHienTai}</span> / {tongSoTrang}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={trangHienTai === 1}
                onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: tongSoTrang }, (_, i) => i + 1).map((soTrang) => {
                if (
                  soTrang === 1 ||
                  soTrang === tongSoTrang ||
                  (soTrang >= trangHienTai - 1 && soTrang <= trangHienTai + 1)
                ) {
                  return (
                    <button
                      key={soTrang}
                      type="button"
                      onClick={() => setTrangHienTai(soTrang)}
                      className={cn(
                        'size-7 rounded-lg text-xs font-semibold transition cursor-pointer',
                        trangHienTai === soTrang
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'hover:bg-slate-100 text-slate-600'
                      )}
                    >
                      {soTrang}
                    </button>
                  );
                }
                if (soTrang === trangHienTai - 2 || soTrang === trangHienTai + 2) {
                  return (
                    <span key={soTrang} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                type="button"
                disabled={trangHienTai === tongSoTrang}
                onClick={() => setTrangHienTai((p) => Math.min(tongSoTrang, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TPKH TIẾP NHẬN & PHÂN CÔNG (Giao việc cho CV hoặc Tự làm)          */}
      {/* ========================================================================= */}
      {modalGiaoViec.mo && modalGiaoViec.yeuCau && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col space-y-4 text-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                  <UserCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    TPKH Tiếp nhận & Điều phối xử lý
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dự án: <span className="font-semibold text-slate-900">{modalGiaoViec.yeuCau.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalGiaoViec({ mo: false, yeuCau: null, hinhThuc: 'giao_cv' })}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* TAB LỰA CHỌN: GIAO VIỆC CHO CV HOẶC TỰ THỰC HIỆN */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalGiaoViec((prev) => ({ ...prev, hinhThuc: 'giao_cv' }))}
                className={cn(
                  'py-2 px-3 rounded-lg transition-all text-center cursor-pointer',
                  modalGiaoViec.hinhThuc === 'giao_cv'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                1. Giao việc cho CV KHTH
              </button>
              <button
                type="button"
                onClick={() => setModalGiaoViec((prev) => ({ ...prev, hinhThuc: 'tu_lam' }))}
                className={cn(
                  'py-2 px-3 rounded-lg transition-all text-center cursor-pointer',
                  modalGiaoViec.hinhThuc === 'tu_lam'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                2. TPKH tự thực hiện & nộp KQ
              </button>
            </div>

            <form onSubmit={handleXacNhanGiaoViec} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {loiGiaoViec && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{loiGiaoViec}</span>
                </div>
              )}

              {/* Thông tin ban đầu */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Người gửi: <strong className="text-slate-900">{modalGiaoViec.yeuCau.ten_nguoi_tao}</strong></span>
                  <span>Ngày tạo: <strong className="text-slate-900">{formatNgay(modalGiaoViec.yeuCau.ngay_tao)}</strong></span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {modalGiaoViec.yeuCau.noi_dung_yeu_cau}
                </p>
                {modalGiaoViec.yeuCau.link_drive_dau_vao && (
                  <div className="pt-1">
                    <a
                      href={modalGiaoViec.yeuCau.link_drive_dau_vao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Link2 className="size-3" />
                      <span>Xem file Google Drive đính kèm</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* HÌNH THỨC 1: GIAO VIỆC CHO CV */}
              {modalGiaoViec.hinhThuc === 'giao_cv' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="size-4 text-blue-600" />
                      <span>Chọn nhân sự KHTH thực hiện *</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Đã chọn: <strong className="text-blue-600 font-bold">{dsNhanSuChon.length}</strong> / {dsNhanSuKHTH.length}
                    </span>
                  </div>

                  {/* Nút tích chọn tất cả nhân sự KHTH */}
                  <div
                    onClick={toggleChonTatCaKHTH}
                    className={cn(
                      'p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer select-none transition-all',
                      daChonTatCaKHTH
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={daChonTatCaKHTH}
                        onChange={() => {}}
                        className="size-4 rounded border-slate-300 text-blue-600 pointer-events-none"
                      />
                      <span>Chọn tất cả nhân sự phòng KHTH ({dsNhanSuKHTH.length} người)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {daChonTatCaKHTH ? 'Đã chọn toàn bộ' : 'Tích để chọn tất cả'}
                    </span>
                  </div>

                  {/* Tags đã chọn */}
                  {dsNhanSuChon.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      {dsNhanSuChon.map((ns) => (
                        <span
                          key={ns.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 shadow-2xs"
                        >
                          <User className="size-3 text-slate-400" />
                          <span>{ns.ho_va_ten}</span>
                          <button
                            type="button"
                            onClick={() => setDsNhanSuChon((prev) => prev.filter((x) => x.id !== ns.id))}
                            className="hover:text-rose-600 cursor-pointer ml-0.5"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Ô tìm kiếm */}
                  <div className="relative">
                    <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={tuKhoaTimNS}
                      onChange={(e) => setTuKhoaTimNS(e.target.value)}
                      placeholder="Tìm kiếm nhân sự KHTH..."
                      className="w-full h-8.5 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Danh sách nhân sự */}
                  <div className="max-h-[170px] overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                    {dsNhanSuKHTH
                      .filter((ns) =>
                        !tuKhoaTimNS ||
                        ns.ho_va_ten.toLowerCase().includes(tuKhoaTimNS.toLowerCase()) ||
                        (ns.chuc_vu && ns.chuc_vu.toLowerCase().includes(tuKhoaTimNS.toLowerCase()))
                      )
                      .map((ns) => {
                        const daChon = dsNhanSuChon.some((x) => x.id === ns.id);
                        return (
                          <div
                            key={ns.id}
                            onClick={() => toggleChonNhanSu(ns)}
                            className={cn(
                              'px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition select-none',
                              daChon ? 'bg-blue-50/70 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={daChon}
                                onChange={() => {}}
                                className="size-4 rounded border-slate-300 text-blue-600 pointer-events-none"
                              />
                              <div>
                                <div className="font-semibold text-slate-900">{ns.ho_va_ten}</div>
                                <div className="text-[10.5px] text-slate-400">
                                  {ns.chuc_vu || 'Nhân sự KHTH'}
                                </div>
                              </div>
                            </div>
                            {daChon && <Check className="size-4 text-blue-600" />}
                          </div>
                        );
                      })}
                  </div>

                  {/* Hạn hoàn thành */}
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      <span>Hạn hoàn thành cho CV</span>
                    </label>
                    <input
                      type="date"
                      value={hanXongGiaoViec}
                      onChange={(e) => setHanXongGiaoViec(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* HÌNH THỨC 2: TPKH TỰ THỰC HIỆN */
                <div className="space-y-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Link2 className="size-3.5 text-teal-600" />
                      <span>Link Google Drive kết quả của TPKH *</span>
                    </label>
                    <input
                      type="url"
                      value={linkDriveTuLam}
                      onChange={(e) => setLinkDriveTuLam(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Khi nộp, kết quả sẽ chuyển thẳng đến Trưởng phòng Kinh doanh để phê duyệt.
                  </p>
                </div>
              )}

              {/* Ghi chú chung */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {modalGiaoViec.hinhThuc === 'giao_cv' ? 'Định hướng / Lưu ý cho CV' : 'Ghi chú giải trình kết quả'}
                </label>
                <textarea
                  rows={2}
                  value={ghiChuGiaoViec}
                  onChange={(e) => setGhiChuGiaoViec(e.target.value)}
                  placeholder="Ghi chú nội dung..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalGiaoViec({ mo: false, yeuCau: null, hinhThuc: 'giao_cv' })}
                  disabled={dangXuLyGiaoViec}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyGiaoViec || (modalGiaoViec.hinhThuc === 'giao_cv' && dsNhanSuChon.length === 0)}
                  className={cn(
                    'h-9 px-5 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition',
                    modalGiaoViec.hinhThuc === 'giao_cv' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'
                  )}
                >
                  {dangXuLyGiaoViec ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : modalGiaoViec.hinhThuc === 'giao_cv' ? (
                    <UserCheck className="size-3.5 stroke-[2.5]" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>{modalGiaoViec.hinhThuc === 'giao_cv' ? 'Chuyển giao cho CV' : 'Nộp thẳng cho TPKD'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CV KHTH NỘP KẾT QUẢ                                               */}
      {/* ========================================================================= */}
      {modalNopDrive.mo && modalNopDrive.yeuCau && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="size-4 text-teal-600" />
                  <span>
                    {modalNopDrive.yeuCau.link_drive_ket_qua
                      ? 'Hiệu chỉnh kết quả xử lý (KHTH)'
                      : 'Nộp kết quả xử lý (KHTH)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dự án: <strong className="text-slate-900">{modalNopDrive.yeuCau.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanNopDrive} className="space-y-3">
              {/* Nếu có ý kiến yêu cầu chỉnh sửa từ trước: hiển thị ngay trong modal */}
              {modalNopDrive.yeuCau.ghi_chu_phan_hoi && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="size-3.5 text-rose-600 shrink-0" />
                    <span>Nội dung yêu cầu hiệu chỉnh:</span>
                  </div>
                  <div className="text-xs text-rose-700 whitespace-pre-wrap pl-5 font-medium leading-relaxed">
                    {modalNopDrive.yeuCau.ghi_chu_phan_hoi}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Link2 className="size-3.5 text-slate-400" />
                  <span>Link Google Drive file kết quả *</span>
                </label>
                <input
                  type="url"
                  value={linkDriveNop}
                  onChange={(e) => setLinkDriveNop(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Ghi chú kết quả hoàn thành
                </label>
                <textarea
                  rows={3}
                  value={ghiChuNop}
                  onChange={(e) => setGhiChuNop(e.target.value)}
                  placeholder="Ghi chú nội dung đã hoàn thành hoặc nội dung đã hiệu chỉnh..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-teal-500 resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNopDrive({ mo: false, yeuCau: null })}
                  disabled={dangXuLyNop}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyNop}
                  className="h-9 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  {dangXuLyNop ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  <span>
                    {modalNopDrive.yeuCau.link_drive_ket_qua
                      ? 'Cập nhật & Nộp lại kết quả'
                      : 'Nộp cho TPKH duyệt'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: YÊU CẦU CHỈNH SỬA ĐA NĂNG                                         */}
      {/* ========================================================================= */}
      {modalYeuCauSua.mo && modalYeuCauSua.yeuCau && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="size-5" />
                <h3 className="text-base font-bold text-slate-900">{modalYeuCauSua.tieuDe}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null, loaiSua: 'tpkd_tu_choi_sale', tieuDe: '' })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleXacNhanYeuCauSua} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Lý do & Nội dung yêu cầu chỉnh sửa *
                </label>
                <textarea
                  rows={3}
                  value={lyDoSua}
                  onChange={(e) => setLyDoSua(e.target.value)}
                  placeholder="Ghi rõ các nội dung cần bổ sung, chỉnh sửa hoặc hoàn thiện lại..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500 resize-none placeholder:text-slate-400"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalYeuCauSua({ mo: false, yeuCau: null, loaiSua: 'tpkd_tu_choi_sale', tieuDe: '' })}
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangXuLyYeuCauSua}
                  className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
                >
                  {dangXuLyYeuCauSua ? <Loader2 className="size-3.5 animate-spin" /> : <AlertTriangle className="size-3.5" />}
                  <span>Xác nhận gửi yêu cầu sửa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CHỈNH SỬA THÔNG TIN YÊU CẦU BAN ĐẦU                             */}
      {/* ========================================================================= */}
      {yeuCauDangSua && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua'
                      ? 'Chỉnh sửa & Gửi lại yêu cầu cho TPKD'
                      : 'Chỉnh sửa nội dung yêu cầu'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dự án: <span className="font-semibold text-slate-900">{yeuCauDangSua.ten_du_an}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangSua(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleLuuSua} className="space-y-4">
              {loiSua && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loiSua}
                </div>
              )}

              {/* Nếu TPKD yêu cầu sửa: hiển thị phản hồi của TPKD ngay trong modal để Sale đối chiếu sửa */}
              {yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua' && yeuCauDangSua.ghi_chu_phan_hoi && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="size-3.5 text-rose-600 shrink-0" />
                    <span>Ý kiến yêu cầu từ TPKD:</span>
                  </div>
                  <div className="text-xs text-rose-700 whitespace-pre-wrap pl-5 font-medium leading-relaxed">
                    {yeuCauDangSua.ghi_chu_phan_hoi}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Nội dung yêu cầu *
                </label>
                <textarea
                  rows={3}
                  value={suaNoiDung}
                  onChange={(e) => setSuaNoiDung(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 resize-none placeholder:text-slate-400"
                  placeholder="Nội dung cần thực hiện..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-slate-400" />
                  <span>Link Google Drive tài liệu</span>
                </label>
                <input
                  type="url"
                  value={suaLinkDrive}
                  onChange={(e) => setSuaLinkDrive(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-slate-400" />
                  <span>Hạn hoàn thành</span>
                </label>
                <input
                  type="date"
                  value={suaHanXong}
                  onChange={(e) => setSuaHanXong(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setYeuCauDangSua(null)}
                  disabled={dangLuuSua}
                  className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dangLuuSua}
                  className={cn(
                    'h-9 px-5 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition',
                    yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {dangLuuSua ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua' ? (
                    <Send className="size-3.5" />
                  ) : (
                    <Check className="size-3.5 stroke-[2.5]" />
                  )}
                  <span>
                    {yeuCauDangSua.trang_thai === 'yeu_cau_chinh_sua'
                      ? 'Lưu & Gửi lại cho TPKD'
                      : 'Lưu thay đổi'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: XÁC NHẬN XÓA                                                     */}
      {/* ========================================================================= */}
      {yeuCauDangXoa && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="size-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận xóa yêu cầu</h3>
                <p className="text-xs text-slate-500">
                  Dự án: <span className="font-semibold text-slate-900">{yeuCauDangXoa.ten_du_an}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa yêu cầu: &ldquo;<span className="font-semibold text-slate-900">{yeuCauDangXoa.noi_dung_yeu_cau}</span>&rdquo;?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setYeuCauDangXoa(null)}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleXacNhanXoa}
                disabled={dangXoa}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition"
              >
                {dangXoa ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: LỊCH SỬ LUÂN CHUYỂN YÊU CẦU                                      */}
      {/* ========================================================================= */}
      {yeuCauDangXemLichSu && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch sử luân chuyển yêu cầu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dự án: <strong className="text-slate-900">{yeuCauDangXemLichSu.ten_du_an}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {yeuCauDangXemLichSu.lich_su_xu_ly.map((log, idx) => (
                <div key={log.id || idx} className="flex items-start gap-2.5 text-xs">
                  <div className="size-6 rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {log.hanh_dong}
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-mono">
                        {log.thoi_gian?.slice(0, 16).replace('T', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <User className="size-3 text-slate-400" />
                      <span>{log.ten_nguoi_thuc_hien}</span>
                    </div>

                    {log.link_drive && (
                      <div className="pt-1">
                        <a
                          href={log.link_drive}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Link2 className="size-3" />
                          <span>Link Google Drive đính kèm</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    )}

                    {log.ghi_chu && (
                      <div className="p-2 rounded-lg bg-white border border-slate-100 text-[11.5px] text-slate-700 italic">
                        &ldquo;{log.ghi_chu}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setYeuCauDangXemLichSu(null)}
                className="h-8 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
