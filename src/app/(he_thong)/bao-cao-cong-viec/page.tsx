'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileText,
  CalendarDays,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Check,
  Briefcase,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Users,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Building2,
  Eye,
  Clock,
  Copy
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import type { BaoCaoCongViec, ChiTietBaoCaoCongViec } from '../../../thu_vien/types/bao_cao_cong_viec';
import type { NhanSu, PhongBan, VaiTro } from '../../../thu_vien/types/nhan_su';
import type {
  CapNhatBaoCaoCongViecDTO,
  DieuKienLocBaoCaoCongViec,
  TaoMoiBaoCaoCongViecDTO
} from '../../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import {
  danhSachBaoCaoCongViec,
  taoBaoCaoCongViecMoi,
  capNhatBaoCaoCongViec,
  xoaMemBaoCaoCongViec
} from '../../../dich_vu/bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import { danhSachPhongBan } from '../../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachVaiTro } from '../../../dich_vu/nhan_su/dich_vu_vai_tro';
import {
  coQuyen,
  layPhamViPhongBan,
  duocXemBaoCaoCuaNhanVien
} from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import FormBaoCaoCongViecDrawer from '../../../thanh_phan/bao_cao_cong_viec/form_bao_cao_cong_viec_drawer';
import { Nut, Rong, Bo_Cuc_Trang, ToLichNgay } from '../../../thanh_phan/ui';

interface ThongBaoToast {
  id: number;
  dang: 'thanh_cong' | 'loi';
  noi_dung: string;
}

const formatYYYYMMDD = (d: Date): string => {
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
};

const NGAY_HOM_NAY = formatYYYYMMDD(new Date());

const layBatDauTuan = (ngayChon: Date = new Date()): Date => {
  const d = new Date(ngayChon);
  const thu = d.getDay();
  const delta = d.getDate() - thu + (thu === 0 ? -6 : 1);
  return new Date(d.setDate(delta));
};

const layDanhSachChiTiet = (bccv: BaoCaoCongViec): ChiTietBaoCaoCongViec[] => {
  if (bccv.danh_sach_chi_tiet && Array.isArray(bccv.danh_sach_chi_tiet) && bccv.danh_sach_chi_tiet.length > 0) {
    return bccv.danh_sach_chi_tiet.filter((ct) => ct && ct.noi_dung && ct.noi_dung.trim().length > 0);
  }
  if (bccv.noi_dung_thuc_hien && bccv.noi_dung_thuc_hien.trim().length > 0) {
    return [{ du_an_id: bccv.du_an_id ?? null, noi_dung: bccv.noi_dung_thuc_hien }];
  }
  return [];
};

const layDanhSachDuAnTrongBaoCao = (bccv: BaoCaoCongViec): string[] => {
  const setIds = new Set<string>();
  const ds = layDanhSachChiTiet(bccv);
  for (const ct of ds) {
    if (ct.du_an_id) setIds.add(ct.du_an_id);
  }
  return Array.from(setIds);
};

export default function TrangBaoCaoCongViec() {
  const { nguoiDungHienTai } = useStoreXacThuc();

  const [dangTai, setDangTai] = useState<boolean>(true);
  const [danhSach, setDanhSach] = useState<BaoCaoCongViec[]>([]);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsPhongBan, setDsPhongBan] = useState<PhongBan[]>([]);
  const [dsVaiTro, setDsVaiTro] = useState<VaiTro[]>([]);

  // Quyền hạn & Chế độ xem
  const [cheDoXem, setCheDoXem] = useState<'bang_tong_hop' | 'lich' | 'danh_sach' | 'ma_tran_tuan'>('bang_tong_hop');
  const [ngayDangXemLich, setNgayDangXemLich] = useState<Date>(new Date());
  const [ngayDangChonLichMobile, setNgayDangChonLichMobile] = useState<string>(NGAY_HOM_NAY);
  const [kieuLich, setKieuLich] = useState<'tuan' | 'thang'>('tuan');
  const [ngayChonTongHop, setNgayChonTongHop] = useState<string>(NGAY_HOM_NAY);
  const [phongBanFilter, setPhongBanFilter] = useState<string>('tat_ca');
  const [nhanVienFilter, setNhanVienFilter] = useState<string>('tat_ca');
  const [tuKhoa, setTuKhoa] = useState<string>('');

  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSua, setDangSua] = useState<BaoCaoCongViec | null>(null);
  const [ngayTaoMacDinh, setNgayTaoMacDinh] = useState<string | null>(null);
  const [dangXuLyForm, setDangXuLyForm] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  const [dsToast, setDsToast] = useState<ThongBaoToast[]>([]);
  const [dangXuLyKhac, setDangXuLyKhac] = useState<Record<string, boolean>>({});
  const [dangXuatDoc, setDangXuatDoc] = useState<boolean>(false);

  // 1. Đánh giá quyền hạn người dùng hiện tại
  const phamVi = useMemo(() => layPhamViPhongBan(nguoiDungHienTai, dsVaiTro), [nguoiDungHienTai, dsVaiTro]);
  const coQuyenXemPhongBan = useMemo(() => coQuyen(nguoiDungHienTai, 'bao_cao.xem_phong_ban', dsVaiTro), [nguoiDungHienTai, dsVaiTro]);
  const coQuyenXemToanCongTy = useMemo(() => phamVi.toanCongTy || coQuyen(nguoiDungHienTai, 'bao_cao.xem_toan_cong_ty', dsVaiTro), [nguoiDungHienTai, dsVaiTro, phamVi]);
  const laQuanLy = useMemo(() => coQuyenXemToanCongTy || coQuyenXemPhongBan, [coQuyenXemToanCongTy, coQuyenXemPhongBan]);
  const coQuyenXuatFile = useMemo(() => coQuyen(nguoiDungHienTai, 'bao_cao.xuat_file', dsVaiTro) || laQuanLy, [nguoiDungHienTai, dsVaiTro, laQuanLy]);

  // Thiết lập chế độ mặc định theo vai trò khi tải trang lần đầu
  useEffect(() => {
    if (nguoiDungHienTai) {
      if (laQuanLy) {
        setCheDoXem('bang_tong_hop');
      } else {
        setCheDoXem('lich');
      }
    }
  }, [laQuanLy, nguoiDungHienTai]);

  const themToast = useCallback((dang: ThongBaoToast['dang'], noi_dung: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setDsToast((trc) => [...trc, { id, dang, noi_dung }]);
    setTimeout(() => {
      setDsToast((trc) => trc.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const taiLai = useCallback(async () => {
    setDangTai(true);
    try {
      const [kqBccv, kqDa, kqNs, kqPb, kqVt] = await Promise.all([
        danhSachBaoCaoCongViec({ trang_thai_du_lieu: 'hoat_dong' }),
        import('../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an').then((m) => m.danhSachHoSoDuAn({ trang_thai: 'hoat_dong' })),
        import('../../../dich_vu/nhan_su/dich_vu_nhan_su').then((m) => m.danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' })),
        danhSachPhongBan(),
        danhSachVaiTro()
      ]);
      setDanhSach(kqBccv.mang);
      setDsDuAn(kqDa.mang);
      setDsNhanSu(kqNs.mang);
      setDsPhongBan(kqPb.mang);
      setDsVaiTro(kqVt.mang);
    } catch (e) {
      themToast('loi', 'Tải danh sách báo cáo công việc thất bại: ' + (e as Error).message);
    } finally {
      setDangTai(false);
    }
  }, [themToast]);

  useEffect(() => {
    void taiLai();
  }, [taiLai]);

  // Lắng nghe sự kiện tạo mới từ topbar hoặc phím tắt
  useEffect(() => {
    const xuLySuKienThemMoi = () => {
      setDangSua(null);
      setNgayTaoMacDinh(null);
      setLoiForm(null);
      setMoDrawer(true);
    };
    window.addEventListener('ebms:bao_cao_cong_viec:them_moi', xuLySuKienThemMoi);
    return () => window.removeEventListener('ebms:bao_cao_cong_viec:them_moi', xuLySuKienThemMoi);
  }, []);

  // Danh sách phòng ban mà người dùng có quyền quản lý
  const dsPhongBanDuocXem = useMemo(() => {
    if (coQuyenXemToanCongTy) return dsPhongBan;
    return dsPhongBan.filter((pb) => phamVi.danhSachPhongBanIds.includes(pb.id));
  }, [coQuyenXemToanCongTy, dsPhongBan, phamVi]);

  // Danh sách nhân sự thuộc phạm vi quản lý
  const dsNhanSuDuocXem = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    if (coQuyenXemToanCongTy) return dsNhanSu;
    if (coQuyenXemPhongBan) {
      return dsNhanSu.filter((ns) =>
        ns.id === nguoiDungHienTai.id || (ns.phong_ban_id && phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id))
      );
    }
    return dsNhanSu.filter((ns) => ns.id === nguoiDungHienTai.id);
  }, [coQuyenXemToanCongTy, coQuyenXemPhongBan, dsNhanSu, nguoiDungHienTai, phamVi]);

  // Lọc danh sách báo cáo theo phân quyền và bộ lọc
  const dsBaoCaoHopLe = useMemo(() => {
    return danhSach.filter((b) => {
      const ns = dsNhanSu.find((x) => x.id === b.nhan_vien_id);
      // Kiểm tra quyền xem
      if (!duocXemBaoCaoCuaNhanVien(nguoiDungHienTai, ns ? { id: ns.id, phong_ban_id: ns.phong_ban_id } : { id: b.nhan_vien_id }, dsVaiTro)) {
        return false;
      }
      // Lọc phòng ban
      if (phongBanFilter !== 'tat_ca') {
        if (!ns || ns.phong_ban_id !== phongBanFilter) return false;
      }
      // Lọc nhân viên
      if (nhanVienFilter !== 'tat_ca') {
        if (b.nhan_vien_id !== nhanVienFilter) return false;
      }
      // Lọc từ khóa
      if (tuKhoa.trim()) {
        const q = tuKhoa.toLowerCase();
        const tenNs = (ns?.ho_va_ten || '').toLowerCase();
        const maNs = (ns?.ma_nhan_vien || '').toLowerCase();
        const ct = layDanhSachChiTiet(b).map((x) => x.noi_dung.toLowerCase()).join(' ');
        if (!tenNs.includes(q) && !maNs.includes(q) && !ct.includes(q)) return false;
      }
      return true;
    });
  }, [danhSach, dsNhanSu, nguoiDungHienTai, dsVaiTro, phongBanFilter, nhanVienFilter, tuKhoa]);

  // Báo cáo cá nhân của tôi
  const dsBaoCaoCuaToi = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    return danhSach.filter((b) => b.nhan_vien_id === nguoiDungHienTai.id);
  }, [danhSach, nguoiDungHienTai]);

  // Handlers
  const moTaoMoi = (ngay?: string) => {
    const ngayChon = ngay || NGAY_HOM_NAY;
    const banGhiCu = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === ngayChon);
    if (banGhiCu) {
      setDangSua(banGhiCu);
      setNgayTaoMacDinh(null);
    } else {
      setDangSua(null);
      setNgayTaoMacDinh(ngayChon);
    }
    setLoiForm(null);
    setMoDrawer(true);
  };

  const moChinhSua = (bccv: BaoCaoCongViec) => {
    setDangSua(bccv);
    setNgayTaoMacDinh(null);
    setLoiForm(null);
    setMoDrawer(true);
  };

  const xuLyLuuForm = async (
    data: TaoMoiBaoCaoCongViecDTO | CapNhatBaoCaoCongViecDTO,
    banGhi?: BaoCaoCongViec
  ) => {
    setDangXuLyForm(true);
    setLoiForm(null);
    try {
      const banGhiHienCo = banGhi || (data.ngay_bao_cao ? dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === data.ngay_bao_cao) : null);
      if (banGhiHienCo) {
        await capNhatBaoCaoCongViec(banGhiHienCo.id, data, nguoiDungHienTai);
        themToast('thanh_cong', data.trang_thai === 'tam_luu' ? 'Đã tạm lưu báo cáo công việc.' : 'Đã cập nhật báo cáo công việc.');
      } else {
        await taoBaoCaoCongViecMoi(data as TaoMoiBaoCaoCongViecDTO, nguoiDungHienTai);
        themToast('thanh_cong', data.trang_thai === 'tam_luu' ? 'Đã tạm lưu báo cáo công việc.' : 'Đã nộp báo cáo công việc thành công.');
      }
      setMoDrawer(false);
      setDangSua(null);
      await taiLai();
    } catch (e) {
      const msg = (e as Error).message;
      setLoiForm(msg);
      themToast('loi', msg);
    } finally {
      setDangXuLyForm(false);
    }
  };

  const xuLyXoa = async (bccv: BaoCaoCongViec) => {
    if (!confirm(`Bạn chắc muốn xóa báo cáo công việc ngày ${bccv.ngay_bao_cao}?`)) return;
    setDangXuLyKhac((t) => ({ ...t, [bccv.id]: true }));
    try {
      await xoaMemBaoCaoCongViec(bccv.id, nguoiDungHienTai);
      themToast('thanh_cong', 'Đã xóa báo cáo công việc.');
      await taiLai();
    } catch (e) {
      themToast('loi', 'Xóa thất bại: ' + (e as Error).message);
    } finally {
      setDangXuLyKhac((t) => {
        const m = { ...t };
        delete m[bccv.id];
        return m;
      });
    }
  };

  // Xuất file CSV
  const xuLyXuatCSV = () => {
    if (dsBaoCaoHopLe.length === 0) {
      themToast('loi', 'Không có dữ liệu báo cáo nào để xuất!');
      return;
    }
    try {
      const header = ['STT', 'HỌ VÀ TÊN & NỘI DUNG CÔNG VIỆC'].join(',');
      const rows: string[] = [];
      let stt = 1;

      for (const bccv of dsBaoCaoHopLe) {
        const ns = dsNhanSu.find((x) => x.id === bccv.nhan_vien_id);
        const dsChiTiet = layDanhSachChiTiet(bccv);
        
        const ten = (ns?.ho_va_ten || 'Nhân viên').toUpperCase();
        let noiDungGop = `${ten}:\n`;
        noiDungGop += dsChiTiet.map((ct) => `- ${ct.noi_dung}`).join('\n');
        
        const cleanNoiDung = `"${noiDungGop.replace(/"/g, '""')}"`;
        rows.push([stt++, cleanNoiDung].join(','));
      }

      const csvContent = '\uFEFF' + [header, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tong_hop_bao_cao_${ngayChonTongHop || NGAY_HOM_NAY}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      themToast('thanh_cong', 'Đã xuất file báo cáo tổng hợp thành công!');
    } catch (err: any) {
      themToast('loi', 'Xuất file thất bại: ' + (err?.message || 'Lỗi'));
    }
  };

  // Sao chép nhanh văn bản tổng hợp báo cáo ngày để gửi Zalo / Telegram / Email
  const saoChepTongHopNgay = () => {
    if (thongKeNgayTongHop.daNop.length === 0) {
      themToast('loi', 'Chưa có báo cáo nào trong ngày để sao chép!');
      return;
    }

    let text = `TỔNG HỢP BÁO CÁO CÔNG VIỆC NGÀY ${formatNgay(ngayChonTongHop)}\n`;
    text += `(Đã nộp: ${thongKeNgayTongHop.daNop.length}/${thongKeNgayTongHop.tong} nhân sự)\n\n`;

    thongKeNgayTongHop.daNop.forEach((ns, index) => {
      const bccv = thongKeNgayTongHop.dsBaoCao.find((b) => b.nhan_vien_id === ns.id);
      if (!bccv) return;
      const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || '';
      const dsChiTiet = layDanhSachChiTiet(bccv);

      text += `${index + 1}. ${ns.ho_va_ten} ${pb ? `(${pb})` : ''}:\n`;
      dsChiTiet.forEach((ct, i) => {
        text += `   - ${ct.noi_dung}\n`;
      });
      text += `\n`;
    });

    if (thongKeNgayTongHop.chuaNop.length > 0) {
      text += `Chưa nộp (${thongKeNgayTongHop.chuaNop.length}): ${thongKeNgayTongHop.chuaNop.map((x) => x.ho_va_ten).join(', ')}\n`;
    }

    navigator.clipboard.writeText(text).then(
      () => themToast('thanh_cong', 'Đã sao chép tổng hợp báo cáo ngày vào clipboard!'),
      () => themToast('loi', 'Không thể sao chép vào bộ nhớ tạm')
    );
  };

  // Sao chép báo cáo của 1 nhân viên cụ thể
  const saoChepBaoCaoNhanVien = (ns: NhanSu, bccv: BaoCaoCongViec) => {
    const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || '';
    const dsChiTiet = layDanhSachChiTiet(bccv);

    let text = `${ns.ho_va_ten} ${pb ? `(${pb})` : ''} - Báo cáo ngày ${formatNgay(bccv.ngay_bao_cao)}:\n`;
    dsChiTiet.forEach((ct, i) => {
      text += `${i + 1}. ${ct.noi_dung}\n`;
    });

    navigator.clipboard.writeText(text).then(
      () => themToast('thanh_cong', `Đã sao chép báo cáo của ${ns.ho_va_ten}!`),
      () => themToast('loi', 'Không thể sao chép vào bộ nhớ tạm')
    );
  };

  // Tính toán tuần & tháng cho Chế độ xem Lịch Cá Nhân
  const ngayTrongTuan = useMemo(() => {
    const dauTuan = layBatDauTuan(ngayDangXemLich);
    const arr: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(dauTuan);
      d.setDate(dauTuan.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [ngayDangXemLich]);

  const ngayTrongThang = useMemo(() => {
    const y = ngayDangXemLich.getFullYear();
    const m = ngayDangXemLich.getMonth();
    const dauThang = new Date(y, m, 1);
    const cuoiThang = new Date(y, m + 1, 0);

    // Padding ngày đầu tháng
    const dayOfWeek = dauThang.getDay();
    const padTruoc = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const arr: { date: Date; trongThang: boolean }[] = [];
    for (let i = padTruoc; i > 0; i--) {
      const d = new Date(y, m, 1 - i);
      arr.push({ date: d, trongThang: false });
    }
    for (let i = 1; i <= cuoiThang.getDate(); i++) {
      arr.push({ date: new Date(y, m, i), trongThang: true });
    }
    // Padding ngày cuối tháng
    const tongSo = arr.length;
    const padSau = (7 - (tongSo % 7)) % 7;
    for (let i = 1; i <= padSau; i++) {
      arr.push({ date: new Date(y, m + 1, i), trongThang: false });
    }
    return arr;
  }, [ngayDangXemLich]);

  // Thống kê tổng hợp ngày (cho cấp quản lý)
  const thongKeNgayTongHop = useMemo(() => {
    const dsBaoCaoTrongNgay = dsBaoCaoHopLe.filter((b) => b.ngay_bao_cao === ngayChonTongHop);
    const mapBaoCao = new Map(dsBaoCaoTrongNgay.map((b) => [b.nhan_vien_id, b]));

    const nhanSuTrongPhamVi = dsNhanSuDuocXem.filter((ns) => {
      if (phongBanFilter !== 'tat_ca' && ns.phong_ban_id !== phongBanFilter) return false;
      return true;
    });

    const daGui: NhanSu[] = [];
    const tamLuu: NhanSu[] = [];
    const chuaNop: NhanSu[] = [];

    for (const ns of nhanSuTrongPhamVi) {
      const bc = mapBaoCao.get(ns.id);
      if (!bc) {
        chuaNop.push(ns);
      } else if (bc.trang_thai === 'tam_luu') {
        tamLuu.push(ns);
      } else {
        daGui.push(ns);
      }
    }

    return {
      tong: nhanSuTrongPhamVi.length,
      daGui,
      tamLuu,
      daNop: [...daGui, ...tamLuu],
      chuaNop,
      dsBaoCao: dsBaoCaoTrongNgay
    };
  }, [dsBaoCaoHopLe, ngayChonTongHop, dsNhanSuDuocXem, phongBanFilter]);

  const chonTenDuAn = (id: string | null | undefined): string => {
    if (!id) return '';
    return dsDuAn.find((x) => x.id === id)?.ten_du_an ?? `DA#${id.slice(0, 6)}`;
  };

  // Xuất file Word (.doc) tổng hợp báo cáo ngày của tất cả mọi người trong ngày
  const xuatWordTongHopNgay = async () => {
    if (thongKeNgayTongHop.tong === 0) {
      themToast('loi', 'Không có dữ liệu nhân sự trong phạm vi để xuất báo cáo!');
      return;
    }

    try {
      setDangXuatDoc(true);
      await new Promise((r) => setTimeout(r, 40));

      const ngayStr = formatNgay(ngayChonTongHop);
      const ngayTaoStr = formatNgay(NGAY_HOM_NAY);

      // Bảng nhân sự đã nộp báo cáo
      let rowsDaNop = '';
      if (thongKeNgayTongHop.daNop.length === 0) {
        rowsDaNop = '<tr><td colspan="4" style="text-align: center; padding: 14px; font-style: italic; color: #6b7280;">Chưa có nhân sự nào nộp báo cáo trong ngày này.</td></tr>';
      } else {
        thongKeNgayTongHop.daNop.forEach((ns, idx) => {
          const bccv = thongKeNgayTongHop.dsBaoCao.find((b) => b.nhan_vien_id === ns.id);
          if (!bccv) return;
          const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || '-';
          const chucVu = ns.chuc_vu ? ` - ${ns.chuc_vu}` : '';
          const dsChiTiet = layDanhSachChiTiet(bccv);

          // Danh sách công việc
          let viecHtml = '';
          if (dsChiTiet.length === 0) {
            viecHtml = 'Chưa nhập nội dung chi tiết';
          } else {
            viecHtml = dsChiTiet.map((ct, i) => {
              const daTen = ct.du_an_id ? chonTenDuAn(ct.du_an_id) : '';
              return `<div style="margin-bottom: 4px;"><b>${i + 1}.</b> ${ct.noi_dung}${daTen ? ` <i>[Dự án: ${daTen}]</i>` : ''}</div>`;
            }).join('');
          }

          rowsDaNop += `
            <tr>
              <td style="text-align: center; vertical-align: top; padding: 6px;">${idx + 1}</td>
              <td style="vertical-align: top; padding: 6px;">
                <b>${ns.ho_va_ten}</b>
              </td>
              <td style="vertical-align: top; padding: 6px;">
                ${pb}${chucVu}
              </td>
              <td style="vertical-align: top; padding: 6px; line-height: 1.4;">
                ${viecHtml}
              </td>
            </tr>
          `;
        });
      }

      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo tổng hợp công việc ngày ${ngayStr}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 {
              size: 841.9pt 595.3pt; /* A4 Landscape */
              mso-page-orientation: landscape;
              margin: 1.5cm 1.5cm 1.5cm 1.5cm;
            }
            div.Section1 {
              page: Section1;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10.5pt;
              color: #111827;
              line-height: 1.4;
            }
            table {
              font-family: Arial, Helvetica, sans-serif;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .header-table td {
              border: none;
              padding: 2px 0;
              vertical-align: top;
            }
            .doc-title {
              text-align: center;
              font-size: 15pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 10px;
              margin-bottom: 16px;
              color: #0f2744;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            .data-table th {
              background-color: #1f4788;
              color: #ffffff;
              font-weight: bold;
              font-size: 9.5pt;
              padding: 7px 6px;
              border: 1px solid #1f4788;
              text-align: left;
            }
            .data-table th.center {
              text-align: center;
            }
            .data-table td {
              border: 1px solid #d1d5db;
              padding: 6px 6px;
              font-size: 9.5pt;
              vertical-align: top;
            }
          </style>
        </head>
        <body>
          <div class="Section1">
            <table class="header-table">
              <tr>
                <td style="width: 50%; text-align: left;">
                  <div style="font-weight: bold; font-size: 11.5pt; color: #0f2744; text-transform: uppercase;">VDCD AN GIANG</div>
                </td>
                <td style="width: 50%; text-align: right;">
                  <div style="font-size: 9pt; color: #6b7280;">Ngày xuất: ${ngayTaoStr}</div>
                </td>
              </tr>
            </table>

            <div class="doc-title">BÁO CÁO TỔNG HỢP CÔNG VIỆC NGÀY ${ngayStr}</div>

            <table class="data-table">
              <thead>
                <tr>
                  <th class="center" style="width: 40px;">STT</th>
                  <th style="width: 180px;">Họ và tên</th>
                  <th style="width: 170px;">Phòng ban / Chức vụ</th>
                  <th>Nội dung công việc</th>
                </tr>
              </thead>
              <tbody>
                ${rowsDaNop}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tong_hop_bao_cao_ngay_${ngayChonTongHop || NGAY_HOM_NAY}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      themToast('thanh_cong', 'Đã xuất file Word (.doc) thành công!');
    } catch (err: any) {
      themToast('loi', 'Xuất file Word thất bại: ' + (err?.message || 'Lỗi'));
    } finally {
      setDangXuatDoc(false);
    }
  };

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4 sm:space-y-8">
      {/* Header Bar - Hidden on mobile because Topbar already contains title and Add button */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-foreground tracking-tight">Báo Cáo Công Việc Hàng Ngày</h1>
            {laQuanLy && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {coQuyenXemToanCongTy ? 'Quản trị / Ban Giám Đốc' : 'Trưởng phòng / Quản lý'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {laQuanLy
              ? 'Theo dõi, tổng hợp và giám sát tiến độ công việc hàng ngày của đội ngũ nhân viên'
              : 'Ghi nhận và báo cáo tiến độ công việc hàng ngày của bạn'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {coQuyenXuatFile && (
            <>
              <Nut
                kieu="outline"
                kich_thuoc="sm"
                onClick={xuatWordTongHopNgay}
                disabled={dangXuatDoc}
                className="font-semibold text-xs border-blue-500/40 text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                {dangXuatDoc ? 'Đang xuất Word...' : 'Xuất Word Báo Cáo Ngày'}
              </Nut>
              <Nut
                kieu="outline"
                kich_thuoc="sm"
                onClick={xuLyXuatCSV}
                className="font-semibold text-xs border-success/40 text-success hover:bg-success/10 cursor-pointer"
              >
                Xuất Excel
              </Nut>
            </>
          )}

          <Nut
            kieu="primary"
            kich_thuoc="sm"
            icon_trai={Plus}
            onClick={() => moTaoMoi()}
            className="font-bold text-xs"
          >
            Tạo báo cáo hôm nay
          </Nut>
        </div>
      </div>

      {/* Chế độ xem Tabs Bar - Compact and horizontally scrollable on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 bg-muted/40 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-border">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 shrink-0">
          {laQuanLy && (
            <button
              type="button"
              onClick={() => setCheDoXem('bang_tong_hop')}
              className={cn(
                'px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap',
                cheDoXem === 'bang_tong_hop'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="size-3.5 sm:size-4 text-primary" />
              <span className="sm:hidden">Tổng hợp</span>
              <span className="hidden sm:inline">Bảng Tổng Hợp Ngày</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCheDoXem('lich')}
            className={cn(
              'px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap',
              cheDoXem === 'lich'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarIcon className="size-3.5 sm:size-4 text-purple-600" />
            <span className="sm:hidden">Lịch cá nhân</span>
            <span className="hidden sm:inline">{laQuanLy ? 'Lịch Cá Nhân Của Tôi' : 'Lịch Báo Cáo Của Tôi'}</span>
          </button>

          {laQuanLy && (
            <button
              type="button"
              onClick={() => setCheDoXem('ma_tran_tuan')}
              className={cn(
                'px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap',
                cheDoXem === 'ma_tran_tuan'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="size-3.5 sm:size-4 text-emerald-600" />
              <span className="sm:hidden">Ma trận tuần</span>
              <span className="hidden sm:inline">Ma Trận Tuần Đội Ngũ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCheDoXem('danh_sach')}
            className={cn(
              'px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap',
              cheDoXem === 'danh_sach'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="size-3.5 sm:size-4 text-amber-600" />
            <span className="sm:hidden">Tất cả</span>
            <span className="hidden sm:inline">Danh Sách Tất Cả</span>
          </button>
        </div>

        {/* Bộ lọc phạm vi phòng ban (cho Quản lý) & Nút xuất file Excel trên Mobile */}
        {laQuanLy && cheDoXem !== 'lich' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={phongBanFilter}
              onChange={(e) => setPhongBanFilter(e.target.value)}
              className="h-8 sm:h-9 px-2 sm:px-3 text-[11px] sm:text-xs rounded-lg sm:rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium flex-1 sm:flex-none"
            >
              <option value="tat_ca">Tất cả phòng ban</option>
              {dsPhongBanDuocXem.map((pb) => (
                <option key={pb.id} value={pb.id}>
                  {pb.ten_phong_ban}
                </option>
              ))}
            </select>
            {coQuyenXuatFile && (
              <>
                <button
                  type="button"
                  disabled={dangXuatDoc}
                  onClick={xuatWordTongHopNgay}
                  className="md:hidden inline-flex items-center gap-1 px-2.5 h-8 text-[11px] font-bold rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 shrink-0"
                  title="Xuất file Word (.doc)"
                >
                  <span>Xuất Word</span>
                </button>
                <button
                  type="button"
                  onClick={xuLyXuatCSV}
                  className="md:hidden inline-flex items-center gap-1 px-2.5 h-8 text-[11px] font-bold rounded-lg border border-success/30 bg-success/10 text-success shrink-0"
                  title="Xuất file Excel"
                >
                  <span>Xuất Excel</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Nút xuất file khi không phải Quản lý trên Mobile */}
        {(!laQuanLy || cheDoXem === 'lich') && coQuyenXuatFile && (
          <div className="flex md:hidden items-center justify-end gap-2 w-full">
            <button
              type="button"
              disabled={dangXuatDoc}
              onClick={xuatWordTongHopNgay}
              className="inline-flex items-center gap-1 px-2.5 h-8 text-[11px] font-bold rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600"
              title="Xuất file Word (.doc)"
            >
              <span>Xuất Word</span>
            </button>
            <button
              type="button"
              onClick={xuLyXuatCSV}
              className="inline-flex items-center gap-1 px-2.5 h-8 text-[11px] font-bold rounded-lg border border-success/30 bg-success/10 text-success"
              title="Xuất file Excel"
            >
              <span>Xuất Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {dangTai ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Đang tải dữ liệu báo cáo công việc...</span>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. CHẾ ĐỘ XEM: BẢNG TỔNG HỢP THEO NGÀY (DÀNH CHO QUẢN LÝ) */}
          {/* ========================================================================= */}
          {cheDoXem === 'bang_tong_hop' && (
            <div className="space-y-3 sm:space-y-6">
              {/* Thanh chọn ngày & KPI tiến độ nộp của đội ngũ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {/* Hộp chọn ngày có Tờ Lịch Nổi Bật */}
                <div className="p-3 sm:p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                  <ToLichNgay ngayStr={ngayChonTongHop} kichThuoc="sm" noiBat />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Chọn ngày xem
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        value={ngayChonTongHop}
                        onChange={(e) => setNgayChonTongHop(e.target.value)}
                        className="h-8 px-2 text-xs font-bold rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setNgayChonTongHop(NGAY_HOM_NAY)}
                        className="h-8 px-2 text-[10px] sm:text-xs font-bold rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition shrink-0"
                      >
                        Hôm nay
                      </button>
                    </div>
                  </div>
                </div>

                {/* KPI 1: Đã Gửi */}
                <div className="p-3 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                  <div className="size-9 sm:size-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <UserCheck className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider truncate">Đã Gửi Báo Cáo</div>
                    <div className="text-base sm:text-xl font-black text-emerald-900 mt-0.5 tabular-nums">
                      {thongKeNgayTongHop.daGui.length}{' '}
                      <span className="text-[10px] sm:text-xs font-normal text-emerald-700 truncate">
                        / {thongKeNgayTongHop.tong} ({thongKeNgayTongHop.tong > 0 ? Math.round((thongKeNgayTongHop.daGui.length / thongKeNgayTongHop.tong) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI 2: Tạm lưu (Bản nháp) */}
                <div className="p-3 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center gap-3">
                  <div className="size-9 sm:size-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Pencil className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider truncate">Đang Tạm Lưu</div>
                    <div className="text-base sm:text-xl font-black text-amber-900 mt-0.5 tabular-nums">
                      {thongKeNgayTongHop.tamLuu.length}{' '}
                      <span className="text-[10px] sm:text-xs font-normal text-amber-700">bản nháp</span>
                    </div>
                  </div>
                </div>

                {/* KPI 3: Chưa Nộp */}
                <div className="p-3 sm:p-4 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-center gap-3">
                  <div className="size-9 sm:size-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <UserX className="size-4 sm:size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[11px] font-bold text-rose-800 uppercase tracking-wider truncate">Chưa Có Báo Cáo</div>
                    <div className="text-base sm:text-xl font-black text-rose-900 mt-0.5 tabular-nums">
                      {thongKeNgayTongHop.chuaNop.length}{' '}
                      <span className="text-[10px] sm:text-xs font-normal text-rose-700">nhân sự</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách nhân viên và tình trạng báo cáo */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    Chi tiết báo cáo ngày {formatNgay(ngayChonTongHop)} ({thongKeNgayTongHop.tong} nhân viên)
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {coQuyenXuatFile && (
                      <button
                        type="button"
                        disabled={dangXuatDoc}
                        onClick={xuatWordTongHopNgay}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                        title="Xuất báo cáo tổng hợp ngày của tất cả mọi người ra file Word (.doc)"
                      >
                        {dangXuatDoc && <Loader2 className="size-3.5 animate-spin" />}
                        <span>Xuất Word (.doc)</span>
                      </button>
                    )}
                    {thongKeNgayTongHop.daNop.length > 0 && (
                      <button
                        type="button"
                        onClick={saoChepTongHopNgay}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition cursor-pointer self-start sm:self-auto"
                        title="Sao chép toàn bộ danh sách công việc đã làm của đội ngũ hôm nay"
                      >
                        <Copy className="size-3.5" />
                        <span>Sao chép tổng hợp hôm nay</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {/* Cột 1: Danh sách ĐÃ GHI NHẬN (Đã gửi + Tạm lưu) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-bold text-emerald-700">
                      <span>ĐÃ BÁO CÁO / GHI NHẬN ({thongKeNgayTongHop.daNop.length})</span>
                      {thongKeNgayTongHop.tamLuu.length > 0 && (
                        <span className="text-[11px] font-semibold text-amber-700">
                          (gồm {thongKeNgayTongHop.tamLuu.length} bản tạm lưu)
                        </span>
                      )}
                    </div>
                    {thongKeNgayTongHop.daNop.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                        Chưa có nhân viên nào nộp hoặc lưu báo cáo trong ngày này.
                      </div>
                    ) : (
                      thongKeNgayTongHop.daNop.map((ns) => {
                        const bccv = thongKeNgayTongHop.dsBaoCao.find((b) => b.nhan_vien_id === ns.id);
                        if (!bccv) return null;
                        const laTamLuu = bccv.trang_thai === 'tam_luu';
                        const dsChiTiet = layDanhSachChiTiet(bccv);
                        const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || 'Phòng ban';

                        return (
                          <div
                            key={ns.id}
                            className={cn(
                              'p-4 rounded-xl border bg-card hover:shadow-sm transition space-y-3',
                              laTamLuu ? 'border-amber-300/80 bg-amber-50/10' : 'border-emerald-200'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                  'size-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0',
                                  laTamLuu ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                )}>
                                  {ns.ho_va_ten.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-foreground truncate">{ns.ho_va_ten}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <span>{ns.ma_nhan_vien}</span>
                                    <span>•</span>
                                    <span className="text-primary font-medium">{pb}</span>
                                    {ns.chuc_vu && (
                                      <>
                                        <span>•</span>
                                        <span>{ns.chuc_vu}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {laTamLuu ? (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                                    <Pencil className="size-3" /> Tạm lưu ({dsChiTiet.length} việc)
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <Check className="size-3" /> Đã gửi ({dsChiTiet.length} việc)
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => saoChepBaoCaoNhanVien(ns, bccv)}
                                  className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center transition cursor-pointer"
                                  title="Sao chép nội dung báo cáo này"
                                >
                                  <Copy className="size-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Các công việc đã làm - Mỗi việc 1 dòng rõ ràng */}
                            <div className="space-y-1.5 text-xs text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                              {dsChiTiet.map((ct, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className={cn(
                                    'size-4 rounded-full font-bold text-[10px] inline-flex items-center justify-center shrink-0 mt-0.5',
                                    laTamLuu ? 'bg-amber-500/15 text-amber-700' : 'bg-emerald-500/15 text-emerald-700'
                                  )}>
                                    {idx + 1}
                                  </span>
                                  <span className="leading-relaxed font-medium flex-1">{ct.noi_dung}</span>
                                </div>
                              ))}
                            </div>

                            {/* Kế hoạch tiếp theo */}
                            {bccv.ke_hoach_ngay_mai && (
                              <div className="text-xs text-muted-foreground border-t border-border/40 pt-2">
                                <span className="font-semibold text-foreground">Kế hoạch ngày mai:</span>{' '}
                                {bccv.ke_hoach_ngay_mai}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" /> Cập nhật lúc {bccv.ngay_cap_nhat?.slice(11, 16) || 'Trong ngày'}
                              </span>
                              <button
                                type="button"
                                onClick={() => moChinhSua(bccv)}
                                className="font-semibold text-primary hover:underline cursor-pointer"
                              >
                                Xem / Sửa chi tiết
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Cột 2: Danh sách CHƯA NỘP */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-bold text-rose-700">
                      <span>CHƯA BÁO CÁO ({thongKeNgayTongHop.chuaNop.length})</span>
                    </div>
                    {thongKeNgayTongHop.chuaNop.length === 0 ? (
                      <div className="p-8 text-center text-xs text-emerald-600 border border-dashed border-emerald-200 rounded-xl bg-emerald-50/20 font-medium">
                        🎉 Tuyệt vời! 100% nhân viên trong phạm vi quản lý đã nộp / lưu báo cáo.
                      </div>
                    ) : (
                      thongKeNgayTongHop.chuaNop.map((ns) => {
                        const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || 'Chưa phân phòng';
                        return (
                          <div
                            key={ns.id}
                            className="p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/20 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-8 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0">
                                {ns.ho_va_ten.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground truncate">{ns.ho_va_ten}</div>
                                <div className="text-[11px] text-muted-foreground">
                                  {ns.ma_nhan_vien} • {pb} {ns.chuc_vu && `• ${ns.chuc_vu}`}
                                </div>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 shrink-0">
                              Chưa có
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CHẾ ĐỘ XEM: LỊCH CÁ NHÂN (TUẦN / THÁNG) */}
          {/* ========================================================================= */}
          {cheDoXem === 'lich' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Điều hướng lịch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(ngayDangXemLich);
                        if (kieuLich === 'tuan') {
                          d.setDate(d.getDate() - 7);
                        } else {
                          d.setMonth(d.getMonth() - 1);
                        }
                        setNgayDangXemLich(d);
                      }}
                      className="size-8 sm:size-9 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNgayDangXemLich(new Date());
                        setNgayDangChonLichMobile(NGAY_HOM_NAY);
                      }}
                      className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition cursor-pointer"
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(ngayDangXemLich);
                        if (kieuLich === 'tuan') {
                          d.setDate(d.getDate() + 7);
                        } else {
                          d.setMonth(d.getMonth() + 1);
                        }
                        setNgayDangXemLich(d);
                      }}
                      className="size-8 sm:size-9 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center text-foreground transition cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>

                  <div className="font-black text-sm sm:text-base text-foreground tracking-tight">
                    {kieuLich === 'tuan'
                      ? `Tuần ${formatNgay(formatYYYYMMDD(ngayTrongTuan[0]))} - ${formatNgay(formatYYYYMMDD(ngayTrongTuan[6]))}`
                      : `Tháng ${ngayDangXemLich.getMonth() + 1}/${ngayDangXemLich.getFullYear()}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl p-1 bg-muted border border-border text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setKieuLich('tuan')}
                      className={cn(
                        'px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs',
                        kieuLich === 'tuan' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground'
                      )}
                    >
                      Xem Tuần
                    </button>
                    <button
                      type="button"
                      onClick={() => setKieuLich('thang')}
                      className={cn(
                        'px-2.5 sm:px-3 py-1 rounded-lg transition cursor-pointer text-[11px] sm:text-xs',
                        kieuLich === 'thang' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground'
                      )}
                    >
                      Xem Tháng
                    </button>
                  </div>
                </div>
              </div>

              {/* GIAO DIỆN MOBILE (< 768px): Dạng lịch trực quan (Thanh ngày + Chi tiết ngày được chọn) */}
              <div className="block md:hidden space-y-3.5">
                {kieuLich === 'tuan' ? (
                  /* Thanh tuần 7 ngày dạng lịch tương tác */
                  <div className="p-2 rounded-2xl border border-border bg-card shadow-xs">
                    <div className="grid grid-cols-7 gap-1">
                      {ngayTrongTuan.map((dateObj, idx) => {
                        const dateStr = formatYYYYMMDD(dateObj);
                        const laHomNay = dateStr === NGAY_HOM_NAY;
                        const laDangChon = dateStr === ngayDangChonLichMobile;
                        const bccv = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === dateStr);
                        const laTamLuu = bccv?.trang_thai === 'tam_luu';
                        const thuVietTat = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx];

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setNgayDangChonLichMobile(dateStr)}
                            className={cn(
                              'flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all relative cursor-pointer text-center select-none',
                              laDangChon
                                ? 'bg-primary text-primary-foreground font-black shadow-sm ring-2 ring-primary/40'
                                : laHomNay
                                ? 'bg-primary/10 text-primary border border-primary/30 font-bold'
                                : 'bg-muted/40 hover:bg-muted text-foreground font-medium'
                            )}
                          >
                            <span className={cn('text-[10px] uppercase font-bold tracking-tight', laDangChon ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
                              {thuVietTat}
                            </span>
                            <span className="text-sm font-black mt-0.5 tabular-nums">
                              {dateObj.getDate()}
                            </span>
                            {/* Dấu chấm trạng thái */}
                            <div className="mt-1 h-1.5 flex items-center justify-center">
                              {bccv ? (
                                <span
                                  className={cn(
                                    'size-1.5 rounded-full',
                                    laDangChon
                                      ? 'bg-primary-foreground'
                                      : laTamLuu
                                      ? 'bg-amber-500 ring-1 ring-amber-200'
                                      : 'bg-emerald-500 ring-1 ring-emerald-200'
                                  )}
                                />
                              ) : (
                                <span className={cn('size-1 rounded-full opacity-20', laDangChon ? 'bg-primary-foreground' : 'bg-muted-foreground')} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Lưới tháng trên mobile */
                  <div className="rounded-2xl border border-border bg-card overflow-hidden p-2">
                    <div className="grid grid-cols-7 text-center pb-1 text-[10px] font-bold text-muted-foreground uppercase">
                      <div>T2</div>
                      <div>T3</div>
                      <div>T4</div>
                      <div>T5</div>
                      <div>T6</div>
                      <div>T7</div>
                      <div>CN</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {ngayTrongThang.map(({ date, trongThang }, idx) => {
                        const dateStr = formatYYYYMMDD(date);
                        const laHomNay = dateStr === NGAY_HOM_NAY;
                        const laDangChon = dateStr === ngayDangChonLichMobile;
                        const bccv = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === dateStr);
                        const laTamLuu = bccv?.trang_thai === 'tam_luu';

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNgayDangChonLichMobile(dateStr)}
                            className={cn(
                              'py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center transition cursor-pointer text-center select-none',
                              !trongThang && 'opacity-25 pointer-events-none',
                              laDangChon
                                ? 'bg-primary text-primary-foreground font-black ring-2 ring-primary/40'
                                : laHomNay
                                ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                                : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <span className="text-xs tabular-nums">{date.getDate()}</span>
                            <div className="h-1 flex items-center justify-center mt-0.5">
                              {bccv && (
                                <span
                                  className={cn(
                                    'size-1 rounded-full',
                                    laDangChon ? 'bg-primary-foreground' : laTamLuu ? 'bg-amber-500' : 'bg-emerald-500'
                                  )}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Chi tiết báo cáo ngày đang chọn trên Mobile */}
                {(() => {
                  const bccvChon = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === ngayDangChonLichMobile);
                  const laTamLuu = bccvChon?.trang_thai === 'tam_luu';
                  const dsChiTiet = bccvChon ? layDanhSachChiTiet(bccvChon) : [];
                  const laHomNay = ngayDangChonLichMobile === NGAY_HOM_NAY;
                  const dateObjChon = new Date(ngayDangChonLichMobile + 'T00:00:00');
                  const dayOfWeekIdx = dateObjChon.getDay();
                  const thuChon = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dayOfWeekIdx];

                  return (
                    <div className={cn(
                      'p-4 rounded-2xl border bg-card space-y-3.5 shadow-sm transition-all',
                      laTamLuu ? 'border-amber-300 bg-amber-50/10' : bccvChon ? 'border-emerald-200' : 'border-border'
                    )}>
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <CalendarIcon className="size-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-muted-foreground">{thuChon}</div>
                            <div className="text-sm font-black text-foreground flex items-center gap-1.5">
                              <span>{formatNgay(ngayDangChonLichMobile)}</span>
                              {laHomNay && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                                  Hôm nay
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {bccvChon ? (
                            laTamLuu ? (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Pencil className="size-3" /> Tạm lưu ({dsChiTiet.length} việc)
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Check className="size-3" /> Đã nộp ({dsChiTiet.length} việc)
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Chưa có báo cáo
                            </span>
                          )}
                        </div>
                      </div>

                      {bccvChon ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5 text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border/40">
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                              Công việc đã ghi nhận:
                            </div>
                            {dsChiTiet.map((ct, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className={cn(
                                  'size-4 rounded-full font-bold text-[10px] inline-flex items-center justify-center shrink-0 mt-0.5',
                                  laTamLuu ? 'bg-amber-500/20 text-amber-800' : 'bg-emerald-500/20 text-emerald-800'
                                )}>
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed font-medium flex-1">{ct.noi_dung}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => moChinhSua(bccvChon)}
                              className={cn(
                                'w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs',
                                laTamLuu
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'border border-border text-foreground hover:bg-muted'
                              )}
                            >
                              <Pencil className="size-3.5" />
                              {laTamLuu ? 'Bổ sung thêm việc / Hoàn tất gửi' : 'Xem / Chỉnh sửa chi tiết'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {ngayDangChonLichMobile <= NGAY_HOM_NAY
                              ? 'Bạn chưa ghi nhận báo cáo công việc cho ngày này.'
                              : 'Chưa tới ngày báo cáo.'}
                          </p>
                          {ngayDangChonLichMobile <= NGAY_HOM_NAY && (
                            <button
                              type="button"
                              onClick={() => moTaoMoi(ngayDangChonLichMobile)}
                              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Plus className="size-3.5" /> Ghi nhận / Nộp báo cáo ngày này
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* GIAO DIỆN DESKTOP (>= 768px): Giữ nguyên chuẩn 7 cột */}
              <div className="hidden md:block">
                {kieuLich === 'tuan' ? (
                  <div className="grid grid-cols-7 gap-3">
                    {ngayTrongTuan.map((dateObj, idx) => {
                      const dateStr = formatYYYYMMDD(dateObj);
                      const laHomNay = dateStr === NGAY_HOM_NAY;
                      const bccv = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === dateStr);
                      const laTamLuu = bccv?.trang_thai === 'tam_luu';
                      const dsChiTiet = bccv ? layDanhSachChiTiet(bccv) : [];
                      const thuTen = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'][idx];

                      return (
                        <div
                          key={dateStr}
                          className={cn(
                            'rounded-2xl border p-3.5 flex flex-col justify-between min-h-[220px] transition-all bg-card',
                            laHomNay ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                            laTamLuu ? 'border-amber-300 bg-amber-50/10' : '',
                            bccv ? 'hover:border-primary/50' : 'hover:border-border'
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 border-b border-border/50">
                              <div>
                                <div className="text-xs font-bold text-muted-foreground">{thuTen}</div>
                                <div className="text-sm font-black text-foreground">{dateObj.getDate()}</div>
                              </div>
                              {laHomNay && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                                  Hôm nay
                                </span>
                              )}
                            </div>

                            <div className="pt-3">
                              {bccv ? (
                                <div className="space-y-2">
                                  {laTamLuu ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                      <Pencil className="size-3" /> Tạm lưu ({dsChiTiet.length} việc)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                      <Check className="size-3" /> Đã nộp ({dsChiTiet.length} việc)
                                    </span>
                                  )}
                                  <div className="space-y-1 text-xs text-foreground/80 max-h-[90px] overflow-hidden">
                                    {dsChiTiet.slice(0, 2).map((ct, i) => (
                                      <div key={i} className="line-clamp-1 leading-snug">
                                        • {ct.noi_dung}
                                      </div>
                                    ))}
                                    {dsChiTiet.length > 2 && (
                                      <div className="text-[10px] text-muted-foreground italic">
                                        + {dsChiTiet.length - 2} việc khác...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground py-4 text-center">
                                  {dateStr <= NGAY_HOM_NAY ? (
                                    <span className="text-amber-600 font-medium">Chưa nộp báo cáo</span>
                                  ) : (
                                    <span>Chưa tới ngày</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-border/40">
                            {bccv ? (
                              <button
                                type="button"
                                onClick={() => moChinhSua(bccv)}
                                className={cn(
                                  'w-full py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1',
                                  laTamLuu
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold'
                                    : 'border border-border text-foreground hover:bg-muted'
                                )}
                              >
                                <Pencil className="size-3" /> {laTamLuu ? 'Bổ sung việc / Gửi' : 'Xem / Sửa'}
                              </button>
                            ) : dateStr <= NGAY_HOM_NAY ? (
                              <button
                                type="button"
                                onClick={() => moTaoMoi(dateStr)}
                                className="w-full py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Plus className="size-3" /> Nộp báo cáo
                              </button>
                            ) : (
                              <div className="h-7" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Lưới Lịch Tháng Desktop */
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center py-2 text-xs font-bold text-muted-foreground uppercase">
                      <div>Thứ 2</div>
                      <div>Thứ 3</div>
                      <div>Thứ 4</div>
                      <div>Thứ 5</div>
                      <div>Thứ 6</div>
                      <div>Thứ 7</div>
                      <div>CN</div>
                    </div>
                    <div className="grid grid-cols-7 divide-x divide-y divide-border">
                      {ngayTrongThang.map(({ date, trongThang }, idx) => {
                        const dateStr = formatYYYYMMDD(date);
                        const laHomNay = dateStr === NGAY_HOM_NAY;
                        const bccv = dsBaoCaoCuaToi.find((b) => b.ngay_bao_cao === dateStr);
                        const laTamLuu = bccv?.trang_thai === 'tam_luu';

                        return (
                          <div
                            key={idx}
                            className={cn(
                              'p-2.5 min-h-[95px] flex flex-col justify-between transition',
                              !trongThang && 'bg-muted/20 text-muted-foreground/40',
                              laHomNay && 'bg-primary/5'
                            )}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className={cn('font-bold', laHomNay && 'text-primary')}>{date.getDate()}</span>
                              {bccv && (
                                <span
                                  className={cn('size-2 rounded-full', laTamLuu ? 'bg-amber-500' : 'bg-emerald-500')}
                                  title={laTamLuu ? 'Tạm lưu (nháp)' : 'Đã nộp báo cáo'}
                                />
                              )}
                            </div>

                            <div className="mt-1">
                              {bccv ? (
                                <button
                                  type="button"
                                  onClick={() => moChinhSua(bccv)}
                                  className={cn(
                                    'w-full text-left p-1 rounded text-[11px] font-semibold line-clamp-1 transition cursor-pointer',
                                    laTamLuu
                                      ? 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                  )}
                                >
                                  {laTamLuu ? '📝 ' : ''}{layDanhSachChiTiet(bccv).length} việc
                                </button>
                              ) : trongThang && dateStr <= NGAY_HOM_NAY ? (
                                <button
                                  type="button"
                                  onClick={() => moTaoMoi(dateStr)}
                                  className="w-full py-0.5 text-[10px] text-primary hover:underline font-semibold text-center cursor-pointer"
                                >
                                  + Nộp
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. CHẾ ĐỘ XEM: MA TRẬN TUẦN ĐỘI NGŨ (CHO CẤP QUẢN LÝ) */}
          {/* ========================================================================= */}
          {cheDoXem === 'ma_tran_tuan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="text-sm font-bold text-foreground">
                  Tiến độ nộp báo cáo tuần ({formatNgay(formatYYYYMMDD(ngayTrongTuan[0]))} - {formatNgay(formatYYYYMMDD(ngayTrongTuan[6]))})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(ngayDangXemLich);
                      d.setDate(d.getDate() - 7);
                      setNgayDangXemLich(d);
                    }}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNgayDangXemLich(new Date())}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-bold cursor-pointer"
                  >
                    Tuần này
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(ngayDangXemLich);
                      d.setDate(d.getDate() + 7);
                      setNgayDangXemLich(d);
                    }}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase font-semibold">
                    <tr>
                      <th className="p-3.5 text-left w-52">Nhân viên</th>
                      <th className="p-3.5 text-left w-36">Phòng ban</th>
                      {ngayTrongTuan.map((d, i) => (
                        <th key={i} className="p-3.5 text-center">
                          <div>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}</div>
                          <div className="text-[10px] font-normal">{d.getDate()}</div>
                        </th>
                      ))}
                      <th className="p-3.5 text-center w-24">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dsNhanSuDuocXem
                      .filter((ns) => phongBanFilter === 'tat_ca' || ns.phong_ban_id === phongBanFilter)
                      .map((ns) => {
                        const pb = dsPhongBan.find((x) => x.id === ns.phong_ban_id)?.ten_phong_ban || 'Chưa phân';
                        let soNgayDaNop = 0;

                        return (
                          <tr key={ns.id} className="hover:bg-muted/20 transition">
                            <td className="p-3.5 font-bold text-foreground">
                              <div>{ns.ho_va_ten}</div>
                              <div className="text-[10px] text-muted-foreground font-normal">{ns.ma_nhan_vien}</div>
                            </td>
                            <td className="p-3.5 text-muted-foreground">{pb}</td>
                            {ngayTrongTuan.map((d, i) => {
                              const dateStr = formatYYYYMMDD(d);
                              const bccv = danhSach.find((b) => b.nhan_vien_id === ns.id && b.ngay_bao_cao === dateStr);
                              if (bccv) soNgayDaNop++;

                              return (
                                <td key={i} className="p-3 text-center">
                                  {bccv ? (
                                    <button
                                      type="button"
                                      onClick={() => moChinhSua(bccv)}
                                      className={cn(
                                        'size-7 rounded-lg font-bold inline-flex items-center justify-center hover:scale-110 transition cursor-pointer',
                                        bccv.trang_thai === 'tam_luu'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      )}
                                      title={bccv.trang_thai === 'tam_luu' ? `Tạm lưu: ${layDanhSachChiTiet(bccv).length} việc` : `Đã nộp: ${layDanhSachChiTiet(bccv).length} việc`}
                                    >
                                      {bccv.trang_thai === 'tam_luu' ? '📝' : '✓'}
                                    </button>
                                  ) : dateStr <= NGAY_HOM_NAY ? (
                                    <span className="size-2 rounded-full bg-rose-300 inline-block" title="Chưa nộp" />
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-3.5 text-center font-bold">
                              <span className={cn(soNgayDaNop >= 5 ? 'text-emerald-600' : 'text-amber-600')}>
                                {soNgayDaNop}/7
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. CHẾ ĐỘ XEM: DANH SÁCH TẤT CẢ (CARDS PHẲNG CÓ TỜ LỊCH NỔI BẬT) */}
          {/* ========================================================================= */}
          {cheDoXem === 'danh_sach' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  placeholder="Tìm theo tên nhân viên, mã, nội dung công việc..."
                  className="h-10 px-3.5 text-xs rounded-xl bg-background border border-border w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {dsBaoCaoHopLe.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-xs">
                  Không tìm thấy báo cáo nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dsBaoCaoHopLe.map((bccv) => {
                    const ns = dsNhanSu.find((x) => x.id === bccv.nhan_vien_id);
                    const tenNs = ns?.ho_va_ten || 'Nhân viên';
                    const laTamLuu = bccv.trang_thai === 'tam_luu';
                    const dsChiTiet = layDanhSachChiTiet(bccv);
                    const dsIdDuAn = layDanhSachDuAnTrongBaoCao(bccv);

                    return (
                      <div
                        key={bccv.id}
                        className={cn(
                          'rounded-2xl border bg-card p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition',
                          laTamLuu ? 'border-amber-300 hover:border-amber-400' : 'border-border hover:border-primary/40'
                        )}
                      >
                        <div>
                          {/* Header card: Tờ lịch ngày nổi bật + Thông tin nhân viên & trạng thái */}
                          <div className="flex items-start gap-3">
                            <ToLichNgay
                              ngayStr={bccv.ngay_bao_cao}
                              kichThuoc="md"
                              trangThai={bccv.trang_thai}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-foreground truncate">{tenNs}</div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {ns?.ma_nhan_vien} {ns?.chuc_vu && `• ${ns.chuc_vu}`}
                              </div>
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                {laTamLuu ? (
                                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    📝 Tạm lưu (nháp)
                                  </span>
                                ) : (
                                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ✓ Đã gửi
                                  </span>
                                )}
                                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground">
                                  {dsChiTiet.length} việc
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Projects tags */}
                          {dsIdDuAn.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {dsIdDuAn.map((daId) => (
                                <span
                                  key={daId}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                                >
                                  {chonTenDuAn(daId)}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Tasks */}
                          <div className="space-y-1.5 mt-3 text-xs text-foreground/85">
                            {dsChiTiet.slice(0, 3).map((ct, i) => (
                              <div key={i} className="line-clamp-2 leading-relaxed">
                                • {ct.noi_dung}
                              </div>
                            ))}
                            {dsChiTiet.length > 3 && (
                              <div className="text-[11px] text-muted-foreground italic">
                                + {dsChiTiet.length - 3} đầu việc khác...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 mt-4 border-t border-border flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => moChinhSua(bccv)}
                            className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground transition cursor-pointer"
                          >
                            {laTamLuu ? 'Xem / Nhập tiếp' : 'Chi tiết'}
                          </button>
                          {(bccv.nhan_vien_id === nguoiDungHienTai?.id || coQuyenXemToanCongTy) && (
                            <button
                              type="button"
                              onClick={() => void xuLyXoa(bccv)}
                              className="size-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Drawer tạo/sửa báo cáo */}
      <FormBaoCaoCongViecDrawer
        mo={moDrawer}
        onDong={() => {
          setMoDrawer(false);
          setDangSua(null);
          setNgayTaoMacDinh(null);
          setLoiForm(null);
        }}
        dangSua={dangSua}
        ngayMacDinh={ngayTaoMacDinh || undefined}
        danhSachDuAn={dsDuAn.map((x) => ({ id: x.id, ten_du_an: x.ten_du_an }))}
        onLuu={xuLyLuuForm}
        dangXuLy={dangXuLyForm}
        loi={loiForm}
      />

      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-[90] space-y-3 max-w-[340px] w-full pointer-events-none">
        {dsToast.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-xl p-4 flex items-start gap-3 text-xs font-bold border shadow-lg',
              t.dang === 'thanh_cong'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            )}
          >
            {t.dang === 'thanh_cong' ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertTriangle className="size-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div className="flex-1">{t.noi_dung}</div>
          </div>
        ))}
      </div>
    </Bo_Cuc_Trang>
  );
}
