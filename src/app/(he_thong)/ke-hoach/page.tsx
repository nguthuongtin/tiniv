'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Users,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen, layPhamViPhongBan } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { NhanSu, ChiNhanh } from '../../../thu_vien/types/nhan_su';
import type { HoSoDuAn, TienDoDuAn } from '../../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../../thu_vien/types/khach_hang';
import type { LichGapKH } from '../../../thu_vien/types/lich_gap_kh';
import type {
  KeHoachThang,
  KeHoachTuan,
  ItemKeHoachThang,
  ItemKeHoachTuan,
  TrangThaiKetQuaCongViec,
  NhatKyKetQuaTuan
} from '../../../thu_vien/types/ke_hoach';
import type {
  BaoCaoKeHoachTuan,
  BaoCaoKeHoachThang
} from '../../../thu_vien/types/bao_cao_ke_hoach';
import {
  layKeHoachThang,
  luuKeHoachThang,
  layKeHoachTuan,
  luuKeHoachTuan,
  layThangHienTaiISO,
  layTuanHienTaiISO,
  layTuanFromDateISO,
  danhSachKeHoachThangTheoFilter,
  danhSachKeHoachTuanTheoFilter
} from '../../../dich_vu/ke_hoach/dich_vu_ke_hoach';
import {
  layBaoCaoKeHoachTuan,
  luuBaoCaoKeHoachTuan,
  layBaoCaoKeHoachThang,
  luuBaoCaoKeHoachThang,
  danhSachBaoCaoTuanTheoFilter,
  danhSachBaoCaoThangTheoFilter
} from '../../../dich_vu/ke_hoach/dich_vu_bao_cao_ke_hoach';
import {
  xuatExcelKeHoachTuan,
  xuatExcelKeHoachThang
} from '../../../dich_vu/ke_hoach/dich_vu_xuat_excel_ke_hoach';
import {
  dongBoTuDongBaoCaoTuan,
  dongBoTuDongBaoCaoThang,
  ghiNhanCheckInVaoBaoCaoNgay,
  dongBoCongViecTuanSangLichGap,
  dongBoLichGapSangKeHoachTuanVaBaoCaoNgay,
  superSyncCheckIn1Cham,
  layKhoangNgayTuTuanISO
} from '../../../dich_vu/ke_hoach/dich_vu_dong_bo_tac_nghiep';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachChiNhanh } from '../../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import {
  danhSachHoSoDuAn,
  taoHoSoDuAnMoi,
  capNhatHoSoDuAn,
  type TaoMoiHoSoDuAnDTO,
  type CapNhatHoSoDuAnDTO
} from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachTienDoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_tien_do_du_an';
import {
  danhSachKhachHang,
  taoKhachHangMoi,
  capNhatKhachHang,
  type TaoMoiKhachHangDTO,
  type CapNhatKhachHangDTO
} from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNguoiLienHe, xoaCacheNguoiLienHe } from '../../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import {
  danhSachLichGapKH,
  taoLichGapKHMoi,
  type TaoMoiLichGapDTO
} from '../../../dich_vu/lich_gap_kh/dich_vu_lich_gap_kh';
import Bo_Cuc_Trang from '../../../thanh_phan/ui/bo_cuc_trang';

import BangKeHoachThang from '../../../thanh_phan/ke_hoach/bang_ke_hoach_thang';
import BangKeHoachTuan from '../../../thanh_phan/ke_hoach/bang_ke_hoach_tuan';
import BanLamViecHangNgay from '../../../thanh_phan/ke_hoach/ban_lam_viec_hang_ngay';
import type { GoiYTaoLichHenNhanh } from '../../../thanh_phan/ke_hoach/drawer_ho_so_thu_gon';
import FormDiaBanDrawer from '../../../thanh_phan/ke_hoach/form_dia_ban_drawer';
import FormTacChienTuanDrawer from '../../../thanh_phan/ke_hoach/form_tac_chien_tuan_drawer';
import FormCapNhatTienDoTuan from '../../../thanh_phan/ke_hoach/form_cap_nhat_tien_do_tuan';
import FormCapNhatKetQuaThang from '../../../thanh_phan/ke_hoach/form_cap_nhat_ket_qua_thang';
import DrawerTongKetTuan from '../../../thanh_phan/ke_hoach/drawer_tong_ket_tuan';
import DrawerTongKetThang from '../../../thanh_phan/ke_hoach/drawer_tong_ket_thang';
import BangTongQuanTeamTuan from '../../../thanh_phan/ke_hoach/bang_tong_quan_team_tuan';
import BangTongQuanTeamThang from '../../../thanh_phan/ke_hoach/bang_tong_quan_team_thang';
import FormKhachHangDrawer from '../../../thanh_phan/khach_hang/form_khach_hang_drawer';
import FormHoSoDuAnDrawer from '../../../thanh_phan/ho_so_du_an/form_ho_so_du_an_drawer';
import FormLichGapModal from '../../../thanh_phan/lich_gap_kh/form_lich_gap_modal';

const DS_NAM = [2024, 2025, 2026, 2027, 2028];

const laySoTuanTrongNam = (nam: number): number => {
  const d = new Date(Date.UTC(nam, 11, 28));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const layThangTuTuanISO = (wISO: string): string => {
  const { tuNgay } = layKhoangNgayTuTuanISO(wISO);
  const d = new Date(tuNgay);
  d.setDate(d.getDate() + 3); // Giữa tuần (Thứ Năm)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const layDanhSachTuanTrongThang = (thangISO: string) => {
  const [yyyyStr, mmStr] = thangISO.split('-');
  const nam = Number(yyyyStr) || new Date().getFullYear();
  const thang = Number(mmStr) || (new Date().getMonth() + 1);
  const soNgay = new Date(nam, thang, 0).getDate();
  const cacTuanSet = new Set<string>();

  for (let d = 1; d <= soNgay; d++) {
    const dStr = `${nam}-${String(thang).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const wISO = layTuanFromDateISO(dStr);
    cacTuanSet.add(wISO);
  }

  const dsTuanArray = Array.from(cacTuanSet);
  return dsTuanArray.map((wISO, idx) => {
    const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(wISO);
    const tuNgayFmt = `${tuNgay.slice(8, 10)}/${tuNgay.slice(5, 7)}`;
    const denNgayFmt = `${denNgay.slice(8, 10)}/${denNgay.slice(5, 7)}`;
    return {
      val: wISO,
      tuanSo: idx + 1,
      label: `Tuần ${idx + 1} (${tuNgayFmt} - ${denNgayFmt})`
    };
  });
};

export default function TrangKeHoachNVKD() {
  return <NoiDungKeHoachNVKD />;
}

export function NoiDungKeHoachNVKD({
  tabKhoiTao
}: {
  tabKhoiTao?: 'ban_lam_viec' | 'thang' | 'tuan' | 'team_tuan' | 'team_thang';
} = {}) {
  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laQuanLyHoacGiamDoc =
    ['quan_tri_he_thong', 'giam_doc', 'truong_phong'].includes(nguoiDungHienTai?.vai_tro ?? '') ||
    coQuyen(nguoiDungHienTai, 'ke_hoach.duyet');

  const [tabHienTai, setTabHienTai] = useState<'ban_lam_viec' | 'thang' | 'tuan' | 'team_tuan' | 'team_thang'>(
    tabKhoiTao || 'ban_lam_viec'
  );
  const [dangTai, setDangTai] = useState(true);

  // Time selectors
  const [thangChon, setThangChon] = useState<string>(layThangHienTaiISO());
  const [tuanChon, setTuanChon] = useState<string>(layTuanHienTaiISO());
  const [namTuanChon, setNamTuanChon] = useState<number>(new Date().getFullYear());
  const [ngayTacChien, setNgayTacChien] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Data states cá nhân
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsChiNhanh, setDsChiNhanh] = useState<ChiNhanh[]>([]);
  const [dsHoSoDuAn, setDsHoSoDuAn] = useState<HoSoDuAn[]>([]);
  const [dsTienDoDuAn, setDsTienDoDuAn] = useState<TienDoDuAn[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);
  const [dsLichGap, setDsLichGap] = useState<LichGapKH[]>([]);
  const [nhanVienChonId, setNhanVienChonId] = useState<string>('');

  const [keHoachThang, setKeHoachThang] = useState<KeHoachThang | null>(null);
  const [keHoachTuan, setKeHoachTuan] = useState<KeHoachTuan | null>(null);
  const [baoCaoTuan, setBaoCaoTuan] = useState<BaoCaoKeHoachTuan | null>(null);
  const [baoCaoThang, setBaoCaoThang] = useState<BaoCaoKeHoachThang | null>(null);

  // Data states team (dành cho Sếp)
  const [dsKeHoachTeamTuan, setDsKeHoachTeamTuan] = useState<KeHoachTuan[]>([]);
  const [dsBaoCaoTeamTuan, setDsBaoCaoTeamTuan] = useState<BaoCaoKeHoachTuan[]>([]);
  const [dsKeHoachTeamThang, setDsKeHoachTeamThang] = useState<KeHoachThang[]>([]);
  const [dsBaoCaoTeamThang, setDsBaoCaoTeamThang] = useState<BaoCaoKeHoachThang[]>([]);

  // Drawers Thêm/Sửa kế hoạch
  const [moDrawerThang, setMoDrawerThang] = useState(false);
  const [dangSuaThang, setDangSuaThang] = useState<ItemKeHoachThang | null>(null);

  const [moDrawerTuan, setMoDrawerTuan] = useState(false);
  const [dangSuaTuan, setDangSuaTuan] = useState<ItemKeHoachTuan | null>(null);
  const [ngayMacDinhDrawerTuan, setNgayMacDinhDrawerTuan] = useState<string>('');
  const [hinhThucMacDinhDrawerTuan, setHinhThucMacDinhDrawerTuan] = useState<'gap_mat' | 'goi_dien'>('goi_dien');
  const [loaiHanhDongMacDinhDrawerTuan, setLoaiHanhDongMacDinhDrawerTuan] = useState<'theo_muc_tieu' | 'phat_sinh' | undefined>(undefined);
  const [mucTieuThangMacDinhId, setMucTieuThangMacDinhId] = useState<string | null>(null);
  const [viecChonMacDinhId, setViecChonMacDinhId] = useState<string | null>(null);

  // Drawers chuẩn hệ thống cho Thanh Thao tác nhanh & Trạm thực thi nhiệm vụ (Khách hàng, Dự án, Lịch công tác)
  const [itemTuanDangThucThi, setItemTuanDangThucThi] = useState<ItemKeHoachTuan | null>(null);
  const [khachHangVuaTaoChoTask, setKhachHangVuaTaoChoTask] = useState<{
    itemId: string;
    khachHang: KhachHang;
  } | null>(null);

  const [moDrawerKhachHang, setMoDrawerKhachHang] = useState(false);
  const [dangSuaKhachHang, setDangSuaKhachHang] = useState<KhachHang | null>(null);
  const [dangXuLyKhachHang, setDangXuLyKhachHang] = useState(false);
  const [loiKhachHang, setLoiKhachHang] = useState<string | null>(null);

  const [moDrawerDuAn, setMoDrawerDuAn] = useState(false);
  const [dangSuaDuAn, setDangSuaDuAn] = useState<HoSoDuAn | null>(null);
  const [khachHangMacDinhDuAnId, setKhachHangMacDinhDuAnId] = useState<string | null>(null);
  const [dangXuLyDuAn, setDangXuLyDuAn] = useState(false);
  const [loiDuAn, setLoiDuAn] = useState<string | null>(null);

  const [moModalLichCongTac, setMoModalLichCongTac] = useState(false);
  const [ngayMacDinhLichCongTac, setNgayMacDinhLichCongTac] = useState<string>('');
  const [goiYLichCongTac, setGoiYLichCongTac] = useState<GoiYTaoLichHenNhanh | null>(null);
  const [dangXuLyLichCongTac, setDangXuLyLichCongTac] = useState(false);

  // Drawers Cập nhật tiến độ / thực tế thu (Tap nhanh)
  const [moCapNhatTienDoTuan, setMoCapNhatTienDoTuan] = useState(false);
  const [itemTuanDangCapNhat, setItemTuanDangCapNhat] = useState<ItemKeHoachTuan | null>(null);

  const [moCapNhatThucTeThang, setMoCapNhatThucTeThang] = useState(false);
  const [itemThangDangCapNhat, setItemThangDangCapNhat] = useState<ItemKeHoachThang | null>(null);

  // Drawers Tổng kết báo cáo tuần / tháng
  const [moDrawerTongKetTuan, setMoDrawerTongKetTuan] = useState(false);
  const [moDrawerTongKetThang, setMoDrawerTongKetThang] = useState(false);

  // Định tuyến tab mặc định theo vai trò (nếu không truyền tabKhoiTao)
  useEffect(() => {
    if (tabKhoiTao) return;
    if (laQuanLyHoacGiamDoc) {
      if (tabHienTai === 'tuan' || tabHienTai === 'thang' || tabHienTai === 'ban_lam_viec') {
        setTabHienTai('team_tuan');
      }
    } else {
      if (tabHienTai === 'team_tuan' || tabHienTai === 'team_thang') {
        setTabHienTai('ban_lam_viec');
      }
    }
  }, [laQuanLyHoacGiamDoc, tabKhoiTao]);

  const phamVi = useMemo(() => {
    return layPhamViPhongBan(nguoiDungHienTai);
  }, [nguoiDungHienTai]);

  // Danh sách nhân sự cho cá nhân
  const dsNhanSuDuocChon = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    if (phamVi.toanCongTy) return dsNhanSu;
    return dsNhanSu.filter((ns) =>
      ns.id === nguoiDungHienTai.id || (ns.phong_ban_id && phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id))
    );
  }, [dsNhanSu, nguoiDungHienTai, phamVi]);

  // Danh sách nhân sự kinh doanh toàn đội (loại trừ Giám đốc / Trưởng phòng để thống kê chuẩn xác)
  const dsNhanSuTeam = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    return dsNhanSu.filter((ns) => {
      if (!phamVi.toanCongTy) {
        if (ns.phong_ban_id && !phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id)) {
          return false;
        }
      }
      if (
        ns.vai_tro === 'truong_phong' ||
        ns.vai_tro === 'giam_doc' ||
        ns.vai_tro === 'quan_tri_he_thong' ||
        (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') ||
        (ns.chuc_vu || '').toLowerCase().includes('phó phòng')
      ) {
        return false;
      }
      return true;
    });
  }, [dsNhanSu, nguoiDungHienTai, phamVi]);

  useEffect(() => {
    if (nguoiDungHienTai?.id && !nhanVienChonId) {
      setNhanVienChonId(nguoiDungHienTai.id);
    }
  }, [nguoiDungHienTai, nhanVienChonId]);

  useEffect(() => {
    void (async () => {
      try {
        const [resNS, resDA, resTD, resKH, resCN, resNLH] = await Promise.all([
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }),
          danhSachTienDoDuAn().catch(() => ({ mang: [] })),
          danhSachKhachHang({ trang_thai: 'hoat_dong' }),
          danhSachChiNhanh().catch(() => ({ mang: [] })),
          danhSachNguoiLienHe().catch(() => ({ mang: [] }))
        ]);
        setDsNhanSu(resNS.mang ?? []);
        setDsHoSoDuAn(resDA.mang ?? []);
        setDsTienDoDuAn(resTD.mang ?? []);
        setDsKhachHang(resKH.mang ?? []);
        setDsChiNhanh(Array.isArray(resCN) ? resCN : (resCN as any)?.mang ?? []);
        setDsNguoiLienHe(Array.isArray(resNLH) ? resNLH : (resNLH as any)?.mang ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const taiKinhDoanhPlan = useCallback(async () => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    setDangTai(true);
    try {
      if (tabHienTai === 'thang') {
        if (!targetId) return;
        const [resKH, resBC] = await Promise.all([
          layKeHoachThang(targetId, thangChon),
          layBaoCaoKeHoachThang(targetId, thangChon)
        ]);
        setKeHoachThang(resKH);
        setBaoCaoThang(resBC);
      } else if (tabHienTai === 'tuan' || tabHienTai === 'ban_lam_viec') {
        if (!targetId) return;
        const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(tuanChon);
        const [resKH, resBC, resThang, resLich] = await Promise.all([
          layKeHoachTuan(targetId, tuanChon),
          layBaoCaoKeHoachTuan(targetId, tuanChon),
          layKeHoachThang(targetId, thangChon),
          danhSachLichGapKH({
            nguoi_phu_trach_id: targetId,
            tu_ngay: tuNgay,
            den_ngay: denNgay
          })
        ]);
        setKeHoachTuan(resKH);
        setBaoCaoTuan(resBC);
        setDsLichGap(resLich);
        if (resThang) {
          setKeHoachThang(resThang);
        }
      } else if (tabHienTai === 'team_tuan') {
        const [resKH, resBC] = await Promise.all([
          danhSachKeHoachTuanTheoFilter(tuanChon),
          danhSachBaoCaoTuanTheoFilter(tuanChon)
        ]);
        setDsKeHoachTeamTuan(resKH);
        setDsBaoCaoTeamTuan(resBC);
      } else if (tabHienTai === 'team_thang') {
        const [resKH, resBC] = await Promise.all([
          danhSachKeHoachThangTheoFilter(thangChon),
          danhSachBaoCaoThangTheoFilter(thangChon)
        ]);
        setDsKeHoachTeamThang(resKH);
        setDsBaoCaoTeamThang(resBC);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDangTai(false);
    }
  }, [nhanVienChonId, nguoiDungHienTai, tabHienTai, thangChon, tuanChon]);

  useEffect(() => {
    void taiKinhDoanhPlan();
  }, [taiKinhDoanhPlan]);

  const dsTuanTrongThang = useMemo(() => layDanhSachTuanTrongThang(thangChon), [thangChon]);

  const xuLyDoiThang = (thangMoi: string) => {
    setThangChon(thangMoi);
    const dsTuan = layDanhSachTuanTrongThang(thangMoi);
    if (dsTuan.length > 0 && !dsTuan.some((t) => t.val === tuanChon)) {
      setTuanChon(dsTuan[0].val);
    }
  };

  // Handlers for Month Navigation
  const doiThangTroi = (delta: number) => {
    const [y, m] = thangChon.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    xuLyDoiThang(`${yyyy}-${mm}`);
  };

  // Handlers for Week Navigation
  const doiTuanTroi = (delta: number) => {
    const match = tuanChon.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return;
    let y = Number(match[1]);
    let w = Number(match[2]) + delta;
    const maxWeeks = laySoTuanTrongNam(y);

    if (w < 1) {
      y -= 1;
      w = laySoTuanTrongNam(y);
    } else if (w > maxWeeks) {
      y += 1;
      w = 1;
    }
    const nextTuan = `${y}-W${String(w).padStart(2, '0')}`;
    setNamTuanChon(y);
    setTuanChon(nextTuan);
    const thangMoi = layThangTuTuanISO(nextTuan);
    if (thangMoi !== thangChon) {
      setThangChon(thangMoi);
    }
  };

  useEffect(() => {
    const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(tuanChon);
    if (ngayTacChien < tuNgay || ngayTacChien > denNgay) {
      const homNay = new Date().toISOString().slice(0, 10);
      if (homNay >= tuNgay && homNay <= denNgay) {
        setNgayTacChien(homNay);
      } else {
        setNgayTacChien(tuNgay);
      }
    }
  }, [tuanChon, ngayTacChien]);

  // Handlers Kế hoạch Tháng (Tự động đồng bộ sang Báo cáo Tháng)
  const xuLyLuuItemThang = async (item: ItemKeHoachThang) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;

    const dsHienTai = keHoachThang?.danh_sach_dia_ban ?? [];
    const tonTaiIdx = dsHienTai.findIndex((x) => x.id === item.id);
    let dsMoi: ItemKeHoachThang[];
    if (tonTaiIdx >= 0) {
      dsMoi = [...dsHienTai];
      dsMoi[tonTaiIdx] = item;
    } else {
      dsMoi = [...dsHienTai, item];
    }

    const nv = dsNhanSu.find((x) => x.id === targetId);

    const res = await luuKeHoachThang(
      {
        id: keHoachThang?.id,
        thang: thangChon,
        nhan_vien_id: targetId,
        chi_nhanh_id: nv?.chi_nhanh_id ?? null,
        phong_ban_id: nv?.phong_ban_id ?? null,
        danh_sach_dia_ban: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachThang(res);
    const bcDongBo = await dongBoTuDongBaoCaoThang(res, nv || nguoiDungHienTai);
    if (bcDongBo) setBaoCaoThang(bcDongBo);
  };

  const xuLyXoaItemThang = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa kế hoạch này?')) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachThang) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const dsMoi = keHoachThang.danh_sach_dia_ban.filter((x) => x.id !== itemId);
    const res = await luuKeHoachThang(
      {
        id: keHoachThang.id,
        thang: thangChon,
        nhan_vien_id: targetId,
        danh_sach_dia_ban: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachThang(res);
    const bcDongBo = await dongBoTuDongBaoCaoThang(res, nv || nguoiDungHienTai);
    if (bcDongBo) setBaoCaoThang(bcDongBo);
  };

  const xuLyCapNhatThucTeThang = async (
    itemId: string,
    capNhat: { thuc_te_thu?: number; ket_qua_thuc_te?: number; ghi_chu_ket_qua: string }
  ) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachThang) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const now = new Date().toISOString();
    const dsMoi = keHoachThang.danh_sach_dia_ban.map((x) => {
      if (x.id !== itemId) return x;
      return {
        ...x,
        thuc_te_thu: capNhat.thuc_te_thu ?? x.thuc_te_thu ?? 0,
        ket_qua_thuc_te: capNhat.ket_qua_thuc_te ?? x.ket_qua_thuc_te ?? 0,
        ghi_chu_ket_qua: capNhat.ghi_chu_ket_qua,
        ngay_cap_nhat_ket_qua: now
      };
    });

    const res = await luuKeHoachThang(
      {
        id: keHoachThang.id,
        thang: thangChon,
        nhan_vien_id: targetId,
        danh_sach_dia_ban: dsMoi
      },
      nguoiDungHienTai
    );
    setKeHoachThang(res);
    const bcDongBo = await dongBoTuDongBaoCaoThang(res, nv || nguoiDungHienTai);
    if (bcDongBo) setBaoCaoThang(bcDongBo);
  };

  const xuLyLuuGhiChuBaoCaoThang = async (khoKhan: string, deXuat: string) => {
    if (!keHoachThang) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const bcDongBo = await dongBoTuDongBaoCaoThang(keHoachThang, nv || nguoiDungHienTai, {
      kho_khan: khoKhan || null,
      de_xuat: deXuat || null,
      trang_thai: 'da_gui'
    });
    if (bcDongBo) setBaoCaoThang(bcDongBo);
  };

  // Handlers Kế hoạch Tuần (Tự động đồng bộ Báo cáo Tuần + Báo cáo Ngày + Lịch công tác)
  const xuLyLuuItemTuan = async (item: ItemKeHoachTuan) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;

    const dsHienTai = keHoachTuan?.danh_sach_tac_chien ?? [];
    const tonTaiIdx = dsHienTai.findIndex((x) => x.id === item.id);
    let dsMoi: ItemKeHoachTuan[];
    if (tonTaiIdx >= 0) {
      dsMoi = [...dsHienTai];
      dsMoi[tonTaiIdx] = item;
    } else {
      dsMoi = [...dsHienTai, item];
    }

    const nv = dsNhanSu.find((x) => x.id === targetId);

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan?.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        chi_nhanh_id: nv?.chi_nhanh_id ?? null,
        phong_ban_id: nv?.phong_ban_id ?? null,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);

    // Tự động đồng bộ sang Báo cáo Tuần & Lịch công tác (không chặn UI)
    void (async () => {
      const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
      if (bcDongBo) setBaoCaoTuan(bcDongBo);

      if (item.ngay_du_kien && item.hinh_thuc === 'gap_mat') {
        await dongBoCongViecTuanSangLichGap({
          item,
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          nguoiTaoId: nguoiDungHienTai?.id || targetId,
          choPhepTaoMoiLich: true
        });
        const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(tuanChon);
        const resLich = await danhSachLichGapKH({
          nguoi_phu_trach_id: targetId,
          tu_ngay: tuNgay,
          den_ngay: denNgay
        });
        setDsLichGap(resLich);
      }
    })();
  };

  const xuLyXoaItemTuan = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa kế hoạch này?')) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const dsMoi = keHoachTuan.danh_sach_tac_chien.filter((x) => x.id !== itemId);
    setKeHoachTuan((prev) => (prev ? { ...prev, danh_sach_tac_chien: dsMoi } : prev));

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);
    const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
    if (bcDongBo) setBaoCaoTuan(bcDongBo);
  };

  const xuLyDoiVatChung = async (itemId: string, daLay: boolean) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const homNay = new Date().toISOString().split('T')[0];
    let itemDaCapNhat: ItemKeHoachTuan | null = null;

    const dsMoi = keHoachTuan.danh_sach_tac_chien.map((x) => {
      if (x.id !== itemId) return x;

      let ngayHoanThanh = x.ngay_hoan_thanh || null;
      if (daLay) {
        if (!ngayHoanThanh) {
          ngayHoanThanh = homNay;
        }
      } else {
        if (ngayHoanThanh === homNay) {
          ngayHoanThanh = null;
        }
      }

      itemDaCapNhat = {
        ...x,
        da_hoan_thanh: daLay,
        ngay_hoan_thanh: ngayHoanThanh
      };
      return itemDaCapNhat;
    });

    setKeHoachTuan((prev) => (prev ? { ...prev, danh_sach_tac_chien: dsMoi } : prev));

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);

    void (async () => {
      const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
      if (bcDongBo) setBaoCaoTuan(bcDongBo);

      if (itemDaCapNhat && daLay) {
        const it = itemDaCapNhat as ItemKeHoachTuan;
        await dongBoCongViecTuanSangLichGap({
          item: it,
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          nguoiTaoId: nguoiDungHienTai?.id || targetId,
          choPhepTaoMoiLich: false
        });
        await ghiNhanCheckInVaoBaoCaoNgay({
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
          ngayBaoCao: homNay,
          duAnId: it.du_an_id || null,
          tenKhachHangDuAn: it.co_quan_doanh_nghiep || it.ten_khach_hang_du_an || 'Công việc tuần',
          noiDungKetQua:
            it.ket_qua_thuc_te ||
            `Hoàn thành kế hoạch: ${it.hanh_dong_tuan || it.noi_dung_tuan || it.dau_ra_cam_ket}`,
          nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
        });
      }
    })();
  };

  const xuLyChotKetQuaTuan = async (
    itemId: string,
    trangThai: TrangThaiKetQuaCongViec,
    ketQuaThucTe: string
  ) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const homNay = new Date().toISOString().split('T')[0];
    let itemDaCapNhat: ItemKeHoachTuan | null = null;
    const daHoanThanh = trangThai === 'dat_muc_tieu';

    const dsMoi = keHoachTuan.danh_sach_tac_chien.map((x) => {
      if (x.id !== itemId) return x;

      let ngayHoanThanh = x.ngay_hoan_thanh || null;
      if (daHoanThanh) {
        if (!ngayHoanThanh) ngayHoanThanh = homNay;
      } else {
        ngayHoanThanh = null;
      }

      const dsKetQuaCu = x.danh_sach_ket_qua || [];
      const dsKetQuaMoi: NhatKyKetQuaTuan[] = ketQuaThucTe
        ? [
            {
              id: `kq_${Date.now()}`,
              ngay_ghi_nhan: homNay,
              noi_dung: ketQuaThucTe,
              nguoi_ghi_id: nguoiDungHienTai?.id || targetId,
              ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || nv?.ho_va_ten || null
            },
            ...dsKetQuaCu
          ]
        : dsKetQuaCu;

      itemDaCapNhat = {
        ...x,
        da_hoan_thanh: daHoanThanh,
        trang_thai_ket_qua: trangThai,
        ket_qua_thuc_te: ketQuaThucTe || x.ket_qua_thuc_te,
        danh_sach_ket_qua: dsKetQuaMoi,
        ngay_hoan_thanh: ngayHoanThanh,
        ngay_cap_nhat_tien_do: new Date().toISOString()
      };
      return itemDaCapNhat;
    });

    setKeHoachTuan((prev) => (prev ? { ...prev, danh_sach_tac_chien: dsMoi } : prev));

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);

    void (async () => {
      const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
      if (bcDongBo) setBaoCaoTuan(bcDongBo);

      if (itemDaCapNhat && (daHoanThanh || ketQuaThucTe)) {
        const it = itemDaCapNhat as ItemKeHoachTuan;
        if (daHoanThanh) {
          await dongBoCongViecTuanSangLichGap({
            item: it,
            nhanVienId: targetId,
            chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
            nguoiTaoId: nguoiDungHienTai?.id || targetId,
            choPhepTaoMoiLich: false
          });
        }
        await ghiNhanCheckInVaoBaoCaoNgay({
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
          ngayBaoCao: homNay,
          duAnId: it.du_an_id || null,
          tenKhachHangDuAn: it.co_quan_doanh_nghiep || it.ten_khach_hang_du_an || 'Công việc tuần',
          noiDungKetQua:
            it.ket_qua_thuc_te ||
            `Chốt kết quả: [${trangThai === 'dat_muc_tieu' ? 'Đạt mục tiêu' : trangThai === 'do_dang' ? 'Dở dang' : 'Không đạt'}] ${it.hanh_dong_tuan || it.noi_dung_tuan || it.dau_ra_cam_ket}`,
          nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
        });
      }
    })();
  };

  const xuLyDoiNgayTacChien = (ngayMoi: string) => {
    setNgayTacChien(ngayMoi);
    const tuanMoi = layTuanFromDateISO(ngayMoi);
    if (tuanMoi && tuanMoi !== tuanChon) {
      const m = tuanMoi.match(/^(\d{4})-W(\d{2})$/);
      if (m) setNamTuanChon(Number(m[1]));
      setTuanChon(tuanMoi);
      const thMoi = layThangTuTuanISO(tuanMoi);
      if (thMoi !== thangChon) setThangChon(thMoi);
    }
  };

  // Điều phối Kéo - Thả lịch tuần & Cập nhật ngày thực hiện / liên kết Dự án
  const xuLyCapNhatLichCongViec = async (
    item: ItemKeHoachTuan,
    capNhat: {
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
  ) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const itemCapNhat: ItemKeHoachTuan = {
      ...item,
      ngay_du_kien: capNhat.ngay_du_kien !== undefined ? capNhat.ngay_du_kien : item.ngay_du_kien,
      cac_ngay_thuc_hien:
        capNhat.cac_ngay_thuc_hien !== undefined
          ? capNhat.cac_ngay_thuc_hien
          : item.cac_ngay_thuc_hien,
      hinh_thuc: capNhat.hinh_thuc !== undefined ? capNhat.hinh_thuc : item.hinh_thuc,
      gio_bat_dau: capNhat.gio_bat_dau !== undefined ? capNhat.gio_bat_dau : item.gio_bat_dau,
      gio_ket_thuc: capNhat.gio_ket_thuc !== undefined ? capNhat.gio_ket_thuc : item.gio_ket_thuc,
      dia_diem_hen: capNhat.dia_diem_hen !== undefined ? capNhat.dia_diem_hen : item.dia_diem_hen,
      khach_hang_id:
        capNhat.khach_hang_id !== undefined ? capNhat.khach_hang_id : item.khach_hang_id,
      co_quan_doanh_nghiep:
        capNhat.co_quan_doanh_nghiep !== undefined
          ? capNhat.co_quan_doanh_nghiep
          : item.co_quan_doanh_nghiep,
      du_an_id: capNhat.du_an_id !== undefined ? capNhat.du_an_id : item.du_an_id,
      du_an_du_kien:
        capNhat.du_an_du_kien !== undefined ? capNhat.du_an_du_kien : item.du_an_du_kien,
      ten_khach_hang_du_an:
        capNhat.ten_khach_hang_du_an !== undefined
          ? capNhat.ten_khach_hang_du_an
          : item.ten_khach_hang_du_an,
      nguoi_lien_he_id:
        capNhat.nguoi_lien_he_id !== undefined
          ? capNhat.nguoi_lien_he_id
          : item.nguoi_lien_he_id,
      nguoi_lien_he:
        capNhat.nguoi_lien_he !== undefined ? capNhat.nguoi_lien_he : item.nguoi_lien_he,
      chuc_vu:
        capNhat.chuc_vu !== undefined
          ? capNhat.chuc_vu
          : item.chuc_vu,
      so_dien_thoai_lien_he:
        capNhat.so_dien_thoai_lien_he !== undefined
          ? capNhat.so_dien_thoai_lien_he
          : item.so_dien_thoai_lien_he
    };

    const dsHienTai = keHoachTuan?.danh_sach_tac_chien ?? [];
    const dsMoi = dsHienTai.map((x) => (x.id === item.id ? itemCapNhat : x));

    setKeHoachTuan((prev) => (prev ? { ...prev, danh_sach_tac_chien: dsMoi } : prev));

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan?.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        chi_nhanh_id: nv?.chi_nhanh_id ?? null,
        phong_ban_id: nv?.phong_ban_id ?? null,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);

    void (async () => {
      const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
      if (bcDongBo) setBaoCaoTuan(bcDongBo);

      if (itemCapNhat.ngay_du_kien && itemCapNhat.hinh_thuc === 'gap_mat') {
        await dongBoCongViecTuanSangLichGap({
          item: itemCapNhat,
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          nguoiTaoId: nguoiDungHienTai?.id || targetId,
          choPhepTaoMoiLich: true
        });
        const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(tuanChon);
        const resLich = await danhSachLichGapKH({
          nguoi_phu_trach_id: targetId,
          tu_ngay: tuNgay,
          den_ngay: denNgay
        });
        setDsLichGap(resLich);
      }
    })();
  };

  // Hàm phụ trợ: Đẩy tự động 1 dòng kết quả (Tạo KH / Tạo Dự án / Chốt lịch hẹn) vào Nhiệm vụ đang thực thi
  const ghiNhanKetQuaVaoItemTuanDangThucThi = async (
    itemId: string,
    kqMoi: import('../../../thu_vien/types/ke_hoach').NhatKyKetQuaTuan
  ) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const idx = keHoachTuan.danh_sach_tac_chien.findIndex((x) => x.id === itemId);
    if (idx < 0) return;

    const itemCu = keHoachTuan.danh_sach_tac_chien[idx];
    const dsMoi = [...keHoachTuan.danh_sach_tac_chien];
    dsMoi[idx] = {
      ...itemCu,
      danh_sach_ket_qua: [kqMoi, ...(itemCu.danh_sach_ket_qua ?? [])],
      ket_qua_thuc_te: kqMoi.noi_dung,
      ngay_cap_nhat_tien_do: new Date().toISOString()
    };

    const resKH = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );
    setKeHoachTuan(resKH);
    const bcDongBo = await dongBoTuDongBaoCaoTuan(resKH, nv || nguoiDungHienTai);
    if (bcDongBo) setBaoCaoTuan(bcDongBo);
  };

  // 1. Lưu Khách hàng (Thêm mới hoặc Cập nhật) từ FormKhachHangDrawer chuẩn hệ thống
  const xuLyLuuKhachHangChuan = async (dto: TaoMoiKhachHangDTO | CapNhatKhachHangDTO) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const taskCtx = itemTuanDangThucThi;
    setDangXuLyKhachHang(true);
    setLoiKhachHang(null);
    try {
      if ('id' in dto && dto.id) {
        const khCapNhat = await capNhatKhachHang(
          dto as CapNhatKhachHangDTO,
          nguoiDungHienTai || (targetId ? { id: targetId } : null)
        );
        setDsKhachHang((prev) => prev.map((k) => (k.id === khCapNhat.id ? khCapNhat : k)));
        setMoDrawerKhachHang(false);
        setDangSuaKhachHang(null);
        setItemTuanDangThucThi(null);
      } else {
        const khMoi = await taoKhachHangMoi(
          {
            ...(dto as TaoMoiKhachHangDTO),
            chi_nhanh_id: dto.chi_nhanh_id ?? nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
            nguoi_phu_trach_id: dto.nguoi_phu_trach_id ?? targetId ?? null
          },
          nguoiDungHienTai || (targetId ? { id: targetId } : null)
        );
        setDsKhachHang((prev) => [khMoi, ...prev.filter((k) => k.id !== khMoi.id)]);
        setMoDrawerKhachHang(false);
        setDangSuaKhachHang(null);
        setItemTuanDangThucThi(null);

        // Nếu tạo Khách hàng từ Trạm thực thi của 1 nhiệm vụ -> tự động ghi vào Timeline nhiệm vụ & chọn KH đó trên thẻ việc
        if (taskCtx) {
          setKhachHangVuaTaoChoTask({ itemId: taskCtx.id, khachHang: khMoi });
          const diaBan = [khMoi.xa_phuong, khMoi.tinh_thanh].filter(Boolean).join(', ');
          await ghiNhanKetQuaVaoItemTuanDangThucThi(taskCtx.id, {
            id: `kq_kh_${Date.now()}`,
            ngay_ghi_nhan: ngayTacChien,
            loai_tac_nghiep: 'tao_khach_hang',
            khach_hang_id: khMoi.id,
            ten_khach_hang: khMoi.ten_khach_hang,
            noi_dung: `Thêm mới Khách hàng: ${khMoi.ten_khach_hang}${diaBan ? ` (${diaBan})` : ''}`,
            nguoi_ghi_id: nguoiDungHienTai?.id || targetId || null,
            ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null
          });
        }

        if (targetId) {
          void ghiNhanCheckInVaoBaoCaoNgay({
            nhanVienId: targetId,
            chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
            phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
            ngayBaoCao: ngayTacChien,
            duAnId: null,
            tenKhachHangDuAn: khMoi.ten_khach_hang,
            noiDungKetQua: `Tạo mới hồ sơ Khách hàng: ${khMoi.ten_khach_hang}`,
            nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
          });
        }
      }
    } catch (err: any) {
      setLoiKhachHang(err?.message || 'Không thể lưu thông tin khách hàng.');
    } finally {
      setDangXuLyKhachHang(false);
    }
  };

  // 2. Lưu Dự án (Thêm mới hoặc Cập nhật) từ FormHoSoDuAnDrawer chuẩn hệ thống
  const xuLyLuuDuAnChuan = async (dto: TaoMoiHoSoDuAnDTO | CapNhatHoSoDuAnDTO) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const taskCtx = itemTuanDangThucThi;
    setDangXuLyDuAn(true);
    setLoiDuAn(null);
    const nguoiThucHienCtx = nguoiDungHienTai
      ? {
          id: nguoiDungHienTai.id,
          chi_nhanh_id: nguoiDungHienTai.chi_nhanh_id,
          phong_ban_id: nguoiDungHienTai.phong_ban_id
        }
      : targetId
      ? { id: targetId, chi_nhanh_id: nv?.chi_nhanh_id, phong_ban_id: nv?.phong_ban_id }
      : null;

    try {
      if ('id' in dto && dto.id) {
        const daCapNhat = await capNhatHoSoDuAn(dto as CapNhatHoSoDuAnDTO, nguoiThucHienCtx);
        setDsHoSoDuAn((prev) => prev.map((d) => (d.id === daCapNhat.id ? daCapNhat : d)));
        setMoDrawerDuAn(false);
        setDangSuaDuAn(null);
        setKhachHangMacDinhDuAnId(null);
        setItemTuanDangThucThi(null);
      } else {
        const daMoi = await taoHoSoDuAnMoi(dto as TaoMoiHoSoDuAnDTO, nguoiThucHienCtx);
        setDsHoSoDuAn((prev) => [daMoi, ...prev.filter((d) => d.id !== daMoi.id)]);
        setMoDrawerDuAn(false);
        setDangSuaDuAn(null);
        setKhachHangMacDinhDuAnId(null);
        setItemTuanDangThucThi(null);

        // Nếu tạo Dự án từ Trạm thực thi của 1 nhiệm vụ -> tự động ghi vào Timeline nhiệm vụ đó
        if (taskCtx) {
          const khCuaDa = daMoi.khach_hang_id
            ? dsKhachHang.find((k) => k.id === daMoi.khach_hang_id) || null
            : null;
          await ghiNhanKetQuaVaoItemTuanDangThucThi(taskCtx.id, {
            id: `kq_da_moi_${Date.now()}`,
            ngay_ghi_nhan: ngayTacChien,
            loai_tac_nghiep: 'tao_du_an',
            khach_hang_id: daMoi.khach_hang_id || null,
            ten_khach_hang: khCuaDa?.ten_khach_hang || null,
            du_an_id: daMoi.id,
            ten_du_an: daMoi.ten_du_an,
            giai_doan_du_an: daMoi.giai_doan,
            noi_dung: `Tạo mới Dự án: ${daMoi.ten_du_an}${
              daMoi.ma_ho_so ? ` (${daMoi.ma_ho_so})` : ''
            }`,
            nguoi_ghi_id: nguoiDungHienTai?.id || targetId || null,
            ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null
          });
        }

        if (targetId) {
          void ghiNhanCheckInVaoBaoCaoNgay({
            nhanVienId: targetId,
            chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
            phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
            ngayBaoCao: ngayTacChien,
            duAnId: daMoi.id,
            tenKhachHangDuAn: daMoi.ten_du_an,
            noiDungKetQua: `Tạo mới Hồ sơ Dự án: ${daMoi.ten_du_an}`,
            nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
          });
        }
      }
    } catch (err: any) {
      setLoiDuAn(err?.message || 'Không thể lưu hồ sơ dự án.');
    } finally {
      setDangXuLyDuAn(false);
    }
  };

  // 3. Lưu Lịch công tác từ FormLichGapModal chuẩn hệ thống (Tự động đồng bộ vào Kế hoạch Tuần & Lịch làm việc)
  const xuLyLuuLichCongTacChuan = async (dto: TaoMoiLichGapDTO) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const taskCtx = itemTuanDangThucThi;
    setDangXuLyLichCongTac(true);
    try {
      const lichMoi = await taoLichGapKHMoi({
        ...dto,
        du_an_id: dto.du_an_id ?? goiYLichCongTac?.du_an_id ?? null,
        nguoi_phu_trach_id: dto.nguoi_phu_trach_id || targetId || '',
        chi_nhanh_id: dto.chi_nhanh_id ?? nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
        nguoi_tao_id: nguoiDungHienTai?.id || targetId || ''
      });
      setDsLichGap((prev) => [...prev, lichMoi]);
      setMoModalLichCongTac(false);
      setGoiYLichCongTac(null);
      setItemTuanDangThucThi(null);

      const dHen = new Date(`${lichMoi.ngay}T00:00:00`);
      const dmHen = `${String(dHen.getDate()).padStart(2, '0')}/${String(dHen.getMonth() + 1).padStart(2, '0')}`;

      if (taskCtx) {
        const daCuaLich = lichMoi.du_an_id
          ? dsHoSoDuAn.find((d) => d.id === lichMoi.du_an_id) || null
          : null;
        await ghiNhanKetQuaVaoItemTuanDangThucThi(taskCtx.id, {
          id: `kq_hen_${Date.now()}`,
          ngay_ghi_nhan: ngayTacChien,
          loai_tac_nghiep: 'dat_lich_hen',
          lich_hen_id: lichMoi.id,
          khach_hang_id: lichMoi.khach_hang_id || null,
          ten_khach_hang: lichMoi.ten_khach_hang || null,
          du_an_id: lichMoi.du_an_id || null,
          ten_du_an: daCuaLich?.ten_du_an || null,
          noi_dung: `Chốt lịch hẹn ngày ${dmHen} (${lichMoi.gio_bat_dau} - ${lichMoi.gio_ket_thuc})${
            lichMoi.dia_diem ? ` tại ${lichMoi.dia_diem}` : ''
          }`,
          nguoi_ghi_id: nguoiDungHienTai?.id || targetId || null,
          ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null
        });
      } else {
        const keHoachDaDongBo = await dongBoLichGapSangKeHoachTuanVaBaoCaoNgay({
          lich: lichMoi,
          nguoiThucHien: nguoiDungHienTai
        });

        if (keHoachDaDongBo && keHoachDaDongBo.tuan === tuanChon) {
          setKeHoachTuan(keHoachDaDongBo);
          const bcDongBo = await dongBoTuDongBaoCaoTuan(keHoachDaDongBo, nv || nguoiDungHienTai);
          if (bcDongBo) setBaoCaoTuan(bcDongBo);
        }
      }

      if (targetId) {
        void ghiNhanCheckInVaoBaoCaoNgay({
          nhanVienId: targetId,
          chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
          phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
          ngayBaoCao: ngayTacChien,
          duAnId: lichMoi.du_an_id || null,
          tenKhachHangDuAn: lichMoi.ten_khach_hang || lichMoi.tieu_de,
          noiDungKetQua: `Chốt lịch công tác gặp ${lichMoi.ten_khach_hang || 'khách hàng'} vào ngày ${dmHen} (${lichMoi.gio_bat_dau} - ${lichMoi.gio_ket_thuc})`,
          nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể đăng ký lịch công tác.');
    } finally {
      setDangXuLyLichCongTac(false);
    }
  };

  // 4. Đồng bộ khi Sale cập nhật tiến độ trực tiếp từ Hồ sơ thu gọn Dự án
  const xuLyDongBoTienDoTuHoSoThuGon = async (params: {
    duAn: HoSoDuAn;
    noiDung: string;
    linkTaiLieu?: string | null;
    tenTaiLieu?: string | null;
    giaiDoanMoi?: string | null;
  }) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);

    // Làm mới tiến độ & giai đoạn dự án
    void (async () => {
      const [resTD, resDA] = await Promise.all([
        danhSachTienDoDuAn().catch(() => ({ mang: [] })),
        params.giaiDoanMoi ? danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }) : Promise.resolve(null)
      ]);
      setDsTienDoDuAn(resTD.mang ?? []);
      if (resDA?.mang) setDsHoSoDuAn(resDA.mang);
    })();

    if (!targetId) return;

    // Ghi vào Báo cáo công việc ngày
    void ghiNhanCheckInVaoBaoCaoNgay({
      nhanVienId: targetId,
      chiNhanhId: nv?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null,
      phongBanId: nv?.phong_ban_id ?? nguoiDungHienTai?.phong_ban_id ?? null,
      ngayBaoCao: ngayTacChien,
      duAnId: params.duAn.id,
      tenKhachHangDuAn: params.duAn.ten_du_an,
      noiDungKetQua: params.noiDung,
      nguoiThucHien: nguoiDungHienTai ? { id: nguoiDungHienTai.id } : { id: targetId }
    });

    // Nếu trong Kế hoạch tuần đang có công việc gắn với dự án này (hoặc đã tương tác dự án này) -> tự động thêm kết quả check-in vào công việc đó
    if (keHoachTuan) {
      const idx = keHoachTuan.danh_sach_tac_chien.findIndex(
        (x) =>
          x.du_an_id === params.duAn.id ||
          x.danh_sach_ket_qua?.some((k) => k.du_an_id === params.duAn.id)
      );
      if (idx >= 0) {
        const item = keHoachTuan.danh_sach_tac_chien[idx];
        const khCuaDa = params.duAn.khach_hang_id
          ? dsKhachHang.find((k) => k.id === params.duAn.khach_hang_id) || null
          : null;
        const kqMoi: import('../../../thu_vien/types/ke_hoach').NhatKyKetQuaTuan = {
          id: `kq_da_${Date.now()}`,
          ngay_ghi_nhan: ngayTacChien,
          loai_tac_nghiep: 'cap_nhat_du_an',
          khach_hang_id: params.duAn.khach_hang_id || null,
          ten_khach_hang: khCuaDa?.ten_khach_hang || null,
          du_an_id: params.duAn.id,
          ten_du_an: params.duAn.ten_du_an,
          noi_dung: params.noiDung,
          link_dinh_kem: params.linkTaiLieu || null,
          ten_tai_lieu: params.tenTaiLieu || null,
          nguoi_ghi_id: nguoiDungHienTai?.id || targetId,
          ten_nguoi_ghi: nguoiDungHienTai?.ho_va_ten || null
        };
        const dsMoi = [...keHoachTuan.danh_sach_tac_chien];
        dsMoi[idx] = {
          ...item,
          danh_sach_ket_qua: [kqMoi, ...(item.danh_sach_ket_qua ?? [])],
          ket_qua_thuc_te: params.noiDung,
          ngay_cap_nhat_tien_do: new Date().toISOString()
        };
        const resKH = await luuKeHoachTuan(
          {
            id: keHoachTuan.id,
            tuan: tuanChon,
            nhan_vien_id: targetId,
            danh_sach_tac_chien: dsMoi
          },
          nguoiDungHienTai
        );
        setKeHoachTuan(resKH);
        const bcDongBo = await dongBoTuDongBaoCaoTuan(resKH, nv || nguoiDungHienTai);
        if (bcDongBo) setBaoCaoTuan(bcDongBo);
      }
    }
  };

  const xuLyCapNhatTienDoTuan = async (
    itemId: string,
    capNhat: {
      danh_sach_ket_qua: import('../../../thu_vien/types/ke_hoach').NhatKyKetQuaTuan[];
      ket_qua_thuc_te: string;
      da_hoan_thanh: boolean;
      trang_thai_cong_viec?: 'da_hoan_thanh' | 'dang_thuc_hien' | 'doi_hen';
      giai_doan_du_an_moi?: string | null;
      ngay_du_kien_moi?: string | null;
      khach_hang_id?: string | null;
      co_quan_doanh_nghiep?: string | null;
      du_an_id?: string | null;
      du_an_du_kien?: string | null;
    }
  ) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const keHoachMucTieu =
      tabHienTai === 'team_tuan'
        ? dsKeHoachTeamTuan.find((k) => k.nhan_vien_id === targetId) || keHoachTuan
        : keHoachTuan;

    if (!targetId || !keHoachMucTieu) return;

    const nv = dsNhanSu.find((x) => x.id === targetId);
    const homNay = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    let itemDaCapNhat: ItemKeHoachTuan | null = null;

    const dsMoi = keHoachMucTieu.danh_sach_tac_chien.map((x) => {
      if (x.id !== itemId) return x;
      let ngayHoanThanh = x.ngay_hoan_thanh || null;
      if (capNhat.da_hoan_thanh && !ngayHoanThanh) {
        ngayHoanThanh = homNay;
      } else if (!capNhat.da_hoan_thanh && ngayHoanThanh === homNay) {
        ngayHoanThanh = null;
      }

      itemDaCapNhat = {
        ...x,
        ngay_du_kien:
          capNhat.ngay_du_kien_moi !== undefined ? capNhat.ngay_du_kien_moi : x.ngay_du_kien,
        khach_hang_id:
          capNhat.khach_hang_id !== undefined ? capNhat.khach_hang_id : x.khach_hang_id,
        co_quan_doanh_nghiep:
          capNhat.co_quan_doanh_nghiep !== undefined ? capNhat.co_quan_doanh_nghiep : x.co_quan_doanh_nghiep,
        du_an_id:
          capNhat.du_an_id !== undefined ? capNhat.du_an_id : x.du_an_id,
        du_an_du_kien:
          capNhat.du_an_du_kien !== undefined ? capNhat.du_an_du_kien : x.du_an_du_kien,
        danh_sach_ket_qua: capNhat.danh_sach_ket_qua,
        ket_qua_thuc_te: capNhat.ket_qua_thuc_te,
        da_hoan_thanh: capNhat.da_hoan_thanh,
        ngay_hoan_thanh: ngayHoanThanh,
        ngay_cap_nhat_tien_do: now
      };
      return itemDaCapNhat;
    });

    const res = await luuKeHoachTuan(
      {
        id: keHoachMucTieu.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    if (tabHienTai === 'team_tuan') {
      setDsKeHoachTeamTuan((prev) => prev.map((k) => (k.id === res.id ? res : k)));
    } else {
      setKeHoachTuan(res);
    }

    // Super-Sync: Tự động đồng bộ sang Báo cáo Tuần, Báo cáo Ngày, Timeline Dự án, Pipeline & Lịch công tác
    void (async () => {
      const bcDongBo = await dongBoTuDongBaoCaoTuan(res, nv || nguoiDungHienTai);
      if (bcDongBo) {
        if (tabHienTai === 'team_tuan') {
          setDsBaoCaoTeamTuan((prev) => {
            const exists = prev.some((b) => b.id === bcDongBo.id);
            return exists ? prev.map((b) => (b.id === bcDongBo.id ? bcDongBo : b)) : [...prev, bcDongBo];
          });
        } else {
          setBaoCaoTuan(bcDongBo);
        }
      }

      if (itemDaCapNhat) {
        const it = itemDaCapNhat as ItemKeHoachTuan;
        const kqMoiNhat = capNhat.danh_sach_ket_qua[0];
        await superSyncCheckIn1Cham({
          item: it,
          nhanVienId: targetId,
          ngayBaoCao: kqMoiNhat?.ngay_ghi_nhan || homNay,
          noiDungKetQua: kqMoiNhat?.noi_dung || capNhat.ket_qua_thuc_te || '',
          linkTaiLieu: kqMoiNhat?.link_dinh_kem || null,
          tenTaiLieu: kqMoiNhat?.ten_tai_lieu || null,
          trangThaiCongViec: capNhat.trang_thai_cong_viec || (capNhat.da_hoan_thanh ? 'da_hoan_thanh' : 'dang_thuc_hien'),
          giaiDoanDuAnMoi: capNhat.giai_doan_du_an_moi,
          nguoiThucHien: nguoiDungHienTai
        });

        if (capNhat.giai_doan_du_an_moi) {
          const resDA = await danhSachHoSoDuAn({ trang_thai: 'hoat_dong' });
          setDsHoSoDuAn(resDA.mang ?? []);
        }
      }
    })();
  };

  const xuLyLuuGhiChuBaoCaoTuan = async (khoKhan: string, deXuat: string) => {
    if (!keHoachTuan) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    const nv = dsNhanSu.find((x) => x.id === targetId);
    const bcDongBo = await dongBoTuDongBaoCaoTuan(keHoachTuan, nv || nguoiDungHienTai, {
      kho_khan: khoKhan || null,
      de_xuat: deXuat || null,
      trang_thai: 'da_gui'
    });
    if (bcDongBo) setBaoCaoTuan(bcDongBo);
  };

  // Handlers Nộp Báo cáo Tuần & Tháng (từ Drawer in/xuất)
  const xuLyLuuBaoCaoTuan = async (bc: Partial<BaoCaoKeHoachTuan>) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const res = await luuBaoCaoKeHoachTuan({
      ...bc,
      id: baoCaoTuan?.id || bc.id,
      ke_hoach_tuan_id: keHoachTuan.id,
      nhan_vien_id: targetId,
      tuan: tuanChon,
      tong_muc_tieu: bc.tong_muc_tieu || 0,
      so_hoan_thanh: bc.so_hoan_thanh || 0,
      ty_le_hoan_thanh: bc.ty_le_hoan_thanh || 0,
      danh_sach_ket_qua: bc.danh_sach_ket_qua || [],
      trang_thai: bc.trang_thai || 'da_gui',
      nguoi_tao_id: nguoiDungHienTai?.id || targetId
    });
    setBaoCaoTuan(res);
  };

  const xuLyLuuBaoCaoThang = async (bc: Partial<BaoCaoKeHoachThang>) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachThang) return;

    const res = await luuBaoCaoKeHoachThang({
      ...bc,
      id: baoCaoThang?.id || bc.id,
      ke_hoach_thang_id: keHoachThang.id,
      nhan_vien_id: targetId,
      thang: thangChon,
      tong_gia_tri_hd: bc.tong_gia_tri_hd || 0,
      tong_du_kien_thu: bc.tong_du_kien_thu || 0,
      tong_thuc_te_thu: bc.tong_thuc_te_thu || 0,
      ty_le_dat_ke_hoach: bc.ty_le_dat_ke_hoach || 0,
      danh_sach_ket_qua: bc.danh_sach_ket_qua || [],
      trang_thai: bc.trang_thai || 'da_gui',
      nguoi_tao_id: nguoiDungHienTai?.id || targetId
    });
    setBaoCaoThang(res);
  };

  const laSuaDuoc = Boolean(
    !nhanVienChonId ||
      nhanVienChonId === nguoiDungHienTai?.id ||
      laQuanLyHoacGiamDoc
  );

  const nhanVienDangXem = useMemo(() => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    return dsNhanSu.find((x) => x.id === targetId) || null;
  }, [dsNhanSu, nhanVienChonId, nguoiDungHienTai]);

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border print:hidden">
        {/* Main View Switcher: Hôm nay -> Tuần này -> Tháng này */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setTabHienTai('ban_lam_viec')}
            className={cn(
              'h-9 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              tabHienTai === 'ban_lam_viec'
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListTodo className="size-4" /> Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setTabHienTai('tuan')}
            className={cn(
              'h-9 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              tabHienTai === 'tuan'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarRange className="size-4" /> Kế hoạch tuần
          </button>
          <button
            type="button"
            onClick={() => setTabHienTai('thang')}
            className={cn(
              'h-9 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              tabHienTai === 'thang'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="size-4" /> Mục tiêu tháng
          </button>

          {laQuanLyHoacGiamDoc && (
            <>
              <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
              <button
                type="button"
                onClick={() => setTabHienTai('team_tuan')}
                className={cn(
                  'h-9 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
                  tabHienTai === 'team_tuan'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="size-4" /> Điều hành Tuần
              </button>
              <button
                type="button"
                onClick={() => setTabHienTai('team_thang')}
                className={cn(
                  'h-9 px-3 sm:px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
                  tabHienTai === 'team_thang'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutDashboard className="size-4" /> Điều hành Tháng
              </button>
            </>
          )}
        </div>

        {/* Filters: Nhân viên (nếu là Quản lý đang xem Bàn làm việc) & Time Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {laQuanLyHoacGiamDoc && (tabHienTai === 'ban_lam_viec' || tabHienTai === 'tuan' || tabHienTai === 'thang') && (
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 h-9">
              <Users className="size-3.5 text-muted-foreground" />
              <select
                value={nhanVienChonId}
                onChange={(e) => setNhanVienChonId(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-foreground focus:ring-0"
              >
                {dsNhanSuTeam.map((nv) => (
                  <option key={nv.id} value={nv.id}>
                    {nv.ho_va_ten}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tabHienTai === 'thang' || tabHienTai === 'team_thang' ? (
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => doiThangTroi(-1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <input
                type="month"
                value={thangChon}
                onChange={(e) => setThangChon(e.target.value)}
                className="h-7 border-0 bg-transparent px-2 text-xs font-bold text-foreground focus:ring-0"
              />
              <button
                type="button"
                onClick={() => doiThangTroi(1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <input
                type="month"
                value={thangChon}
                onChange={(e) => xuLyDoiThang(e.target.value)}
                className="h-7 border-0 bg-transparent px-1.5 text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer"
                title="Chọn tháng"
              />
              <div className="h-4 w-px bg-border my-auto" />
              <button
                type="button"
                onClick={() => doiTuanTroi(-1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Tuần trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <select
                value={tuanChon}
                onChange={(e) => setTuanChon(e.target.value)}
                className="h-7 border-0 bg-transparent px-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {dsTuanTrongThang.map((t) => (
                  <option key={t.val} value={t.val} className="text-slate-900 bg-white">
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => doiTuanTroi(1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Tuần sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {dangTai ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2.25} />
          <span className="font-semibold text-xs">Đang tải dữ liệu...</span>
        </div>
      ) : tabHienTai === 'ban_lam_viec' ? (
        <BanLamViecHangNgay
          keHoachTuan={keHoachTuan}
          keHoachThang={keHoachThang}
          nhanVienId={nhanVienChonId || nguoiDungHienTai?.id}
          tuanChon={tuanChon}
          ngayChon={ngayTacChien}
          onDoiNgayChon={xuLyDoiNgayTacChien}
          viecChonMacDinhId={viecChonMacDinhId}
          danhSachDuAn={dsHoSoDuAn}
          danhSachTienDoDuAn={dsTienDoDuAn}
          danhSachKhachHang={dsKhachHang}
          danhSachNguoiLienHe={dsNguoiLienHe}
          danhSachLichGap={dsLichGap}
          laSuaDuoc={laSuaDuoc}
          onThemNhanh={xuLyLuuItemTuan}
          onXoaCongViec={xuLyXoaItemTuan}
          onCheckIn1Cham={(item) => {
            setItemTuanDangCapNhat(item);
            setMoCapNhatTienDoTuan(true);
          }}
          onSuaCongViec={(item) => {
            setDangSuaTuan(item);
            setMucTieuThangMacDinhId(null);
            setMoDrawerTuan(true);
          }}
          onDoiNhanhHoanThanh={xuLyDoiVatChung}
          onChotKetQua={xuLyChotKetQuaTuan}
          onCapNhatLichCongViec={xuLyCapNhatLichCongViec}
          onCapNhatTienDoInline={xuLyCapNhatTienDoTuan}
          onMoFormViecPhatSinh={(ngayMacDinh) => {
            setDangSuaTuan(null);
            setMucTieuThangMacDinhId(null);
            setNgayMacDinhDrawerTuan(ngayMacDinh || '');
            setHinhThucMacDinhDrawerTuan('goi_dien');
            setLoaiHanhDongMacDinhDrawerTuan('phat_sinh');
            setMoDrawerTuan(true);
          }}
          onMoFormKhachHang={(itemTuan) => {
            setItemTuanDangThucThi(itemTuan || null);
            setDangSuaKhachHang(null);
            setLoiKhachHang(null);
            setMoDrawerKhachHang(true);
          }}
          onMoSuaKhachHang={(kh) => {
            setItemTuanDangThucThi(null);
            setDangSuaKhachHang(kh);
            setLoiKhachHang(null);
            setMoDrawerKhachHang(true);
          }}
          onMoFormDuAn={(options) => {
            setItemTuanDangThucThi(options?.itemTuan || null);
            setDangSuaDuAn(null);
            setKhachHangMacDinhDuAnId(options?.khachHangId || null);
            setLoiDuAn(null);
            setMoDrawerDuAn(true);
          }}
          onMoSuaDuAn={(da) => {
            setItemTuanDangThucThi(null);
            setDangSuaDuAn(da);
            setKhachHangMacDinhDuAnId(null);
            setLoiDuAn(null);
            setMoDrawerDuAn(true);
          }}
          onMoTaoDuAnChoKH={(kh, itemTuan) => {
            setItemTuanDangThucThi(itemTuan || null);
            setDangSuaDuAn(null);
            setKhachHangMacDinhDuAnId(kh.id);
            setLoiDuAn(null);
            setMoDrawerDuAn(true);
          }}
          onMoFormLichCongTac={(ngayMacDinh) => {
            setItemTuanDangThucThi(null);
            setGoiYLichCongTac(null);
            setNgayMacDinhLichCongTac(ngayMacDinh || ngayTacChien);
            setMoModalLichCongTac(true);
          }}
          onMoTaoLichHenGoiY={(goiY, itemTuan) => {
            setItemTuanDangThucThi(itemTuan || null);
            setGoiYLichCongTac(goiY);
            setNgayMacDinhLichCongTac(ngayTacChien);
            setMoModalLichCongTac(true);
          }}
          khachHangVuaTaoChoTask={khachHangVuaTaoChoTask}
          onDaCapNhatTienDoTuHoSoThuGon={(params) => {
            void xuLyDongBoTienDoTuHoSoThuGon(params);
          }}
          onTaiLaiNguoiLienHe={() => {
            xoaCacheNguoiLienHe();
            void danhSachNguoiLienHe()
              .then((res) => setDsNguoiLienHe(res.mang ?? []))
              .catch(() => {});
          }}
        />
      ) : tabHienTai === 'thang' ? (
        <BangKeHoachThang
          keHoach={keHoachThang}
          keHoachTuan={keHoachTuan}
          baoCao={baoCaoThang}
          laSuaDuoc={laSuaDuoc}
          onThemMoi={() => {
            setDangSuaThang(null);
            setMoDrawerThang(true);
          }}
          onThemNhanh={xuLyLuuItemThang}
          onSuaItem={(item) => {
            setDangSuaThang(item);
            setMoDrawerThang(true);
          }}
          onXoaItem={xuLyXoaItemThang}
          onCapNhatThucTe={(item) => {
            setItemThangDangCapNhat(item);
            setMoCapNhatThucTeThang(true);
          }}
          onTaoViecTuanTuMucTieu={(mt) => {
            setDangSuaTuan(null);
            setMucTieuThangMacDinhId(mt.id);
            setNgayMacDinhDrawerTuan('');
            setMoDrawerTuan(true);
          }}
          onMoDrawerTongKet={() => setMoDrawerTongKetThang(true)}
          onLuuGhiChuBaoCao={xuLyLuuGhiChuBaoCaoThang}
          onXuatExcel={() => void xuatExcelKeHoachThang(keHoachThang, nhanVienDangXem, thangChon, dsKhachHang)}
        />
      ) : tabHienTai === 'tuan' ? (
        <BangKeHoachTuan
          keHoach={keHoachTuan}
          baoCao={baoCaoTuan}
          laSuaDuoc={laSuaDuoc}
          onThemMoi={() => {
            setDangSuaTuan(null);
            setMucTieuThangMacDinhId(null);
            setNgayMacDinhDrawerTuan('');
            setHinhThucMacDinhDrawerTuan('goi_dien');
            setLoaiHanhDongMacDinhDrawerTuan(undefined);
            setMoDrawerTuan(true);
          }}
          onThemNhanh={xuLyLuuItemTuan}
          onSuaItem={(item) => {
            setDangSuaTuan(item);
            setMucTieuThangMacDinhId(null);
            setMoDrawerTuan(true);
          }}
          onXoaItem={xuLyXoaItemTuan}
          onDoiVatChung={xuLyDoiVatChung}
          onChotKetQua={xuLyChotKetQuaTuan}
          onCapNhatTienDo={(item) => {
            setViecChonMacDinhId(item.id);
            setTabHienTai('ban_lam_viec');
          }}
          onLamHomNay={(item) => {
            const hienTai = item.cac_ngay_thuc_hien ?? (item.ngay_du_kien ? [item.ngay_du_kien] : []);
            const moi = Array.from(new Set([...hienTai, ngayTacChien])).sort();
            void xuLyCapNhatLichCongViec(item, {
              cac_ngay_thuc_hien: moi,
              ngay_du_kien: item.ngay_du_kien || ngayTacChien
            });
            setViecChonMacDinhId(item.id);
            setTabHienTai('ban_lam_viec');
          }}
          onMoDrawerTongKet={() => setMoDrawerTongKetTuan(true)}
          onLuuGhiChuBaoCao={xuLyLuuGhiChuBaoCaoTuan}
          onXuatExcel={() => void xuatExcelKeHoachTuan(keHoachTuan, nhanVienDangXem, tuanChon, dsKhachHang)}
          danhSachMucTieuThang={keHoachThang?.danh_sach_dia_ban ?? []}
        />
      ) : tabHienTai === 'team_tuan' ? (
        <BangTongQuanTeamTuan
          danhSachNhanSu={dsNhanSuTeam}
          danhSachKeHoach={dsKeHoachTeamTuan}
          danhSachBaoCao={dsBaoCaoTeamTuan}
          danhSachDuAn={dsHoSoDuAn}
          danhSachKhachHang={dsKhachHang}
          tuan={tuanChon}
          onChonCongViec={(nvId, item) => {
            setNhanVienChonId(nvId);
            setItemTuanDangCapNhat(item);
            setMoCapNhatTienDoTuan(true);
          }}
        />
      ) : (
        <BangTongQuanTeamThang
          danhSachNhanSu={dsNhanSuTeam}
          danhSachKeHoach={dsKeHoachTeamThang}
          danhSachBaoCao={dsBaoCaoTeamThang}
          danhSachDuAn={dsHoSoDuAn}
          danhSachKhachHang={dsKhachHang}
          thang={thangChon}
        />
      )}

      {/* Drawers Thêm/Sửa mục tiêu */}
      <FormDiaBanDrawer
        mo={moDrawerThang}
        onDong={() => setMoDrawerThang(false)}
        dangSua={dangSuaThang}
        danhSachDuAn={dsHoSoDuAn}
        danhSachKhachHang={dsKhachHang}
        danhSachNguoiLienHe={dsNguoiLienHe}
        onLuu={xuLyLuuItemThang}
      />

      <FormTacChienTuanDrawer
        mo={moDrawerTuan}
        onDong={() => {
          setMoDrawerTuan(false);
          setMucTieuThangMacDinhId(null);
        }}
        dangSua={dangSuaTuan}
        danhSachDuAn={dsHoSoDuAn}
        danhSachKhachHang={dsKhachHang}
        danhSachNguoiLienHe={dsNguoiLienHe}
        danhSachMucTieuThang={keHoachThang?.danh_sach_dia_ban ?? []}
        ngayMacDinh={ngayMacDinhDrawerTuan}
        hinhThucMacDinh={hinhThucMacDinhDrawerTuan}
        loaiHanhDongMacDinh={loaiHanhDongMacDinhDrawerTuan}
        mucTieuThangMacDinhId={mucTieuThangMacDinhId}
        onLuu={xuLyLuuItemTuan}
      />

      {/* Drawers chuẩn hệ thống gọi từ Thanh Thao tác nhanh & Hồ sơ thu gọn (Khách hàng, Dự án, Lịch công tác) */}
      <FormKhachHangDrawer
        mo={moDrawerKhachHang}
        khi_dong={() => {
          setMoDrawerKhachHang(false);
          setDangSuaKhachHang(null);
          setItemTuanDangThucThi(null);
          setLoiKhachHang(null);
        }}
        dang_sua={dangSuaKhachHang}
        khi_luu={xuLyLuuKhachHangChuan as any}
        dang_xu_ly={dangXuLyKhachHang}
        loi_thong_bao={loiKhachHang}
        dsChiNhanh={dsChiNhanh}
        dsNhanSu={dsNhanSu}
      />

      <FormHoSoDuAnDrawer
        mo={moDrawerDuAn}
        khi_dong={() => {
          setMoDrawerDuAn(false);
          setDangSuaDuAn(null);
          setKhachHangMacDinhDuAnId(null);
          setItemTuanDangThucThi(null);
          setLoiDuAn(null);
        }}
        dang_sua={dangSuaDuAn}
        giaTriMacDinh={{
          khach_hang_id: khachHangMacDinhDuAnId,
          nguoi_phu_trach_id: nhanVienChonId || nguoiDungHienTai?.id || null,
          nguoi_quan_ly_id: nhanVienChonId || nguoiDungHienTai?.id || null
        }}
        khi_luu={xuLyLuuDuAnChuan as any}
        dang_xu_ly={dangXuLyDuAn}
        loi_thong_bao={loiDuAn}
      />

      <FormLichGapModal
        mo={moModalLichCongTac}
        khi_dong={() => {
          setMoModalLichCongTac(false);
          setGoiYLichCongTac(null);
          setItemTuanDangThucThi(null);
        }}
        dang_sua={null}
        gia_tri_mac_dinh={{
          ngay: ngayMacDinhLichCongTac || ngayTacChien,
          nguoi_phu_trach_id: nhanVienChonId || nguoiDungHienTai?.id || '',
          khach_hang_id: goiYLichCongTac?.khach_hang_id || null,
          ten_khach_hang: goiYLichCongTac?.ten_khach_hang || '',
          nguoi_lien_he_id: goiYLichCongTac?.nguoi_lien_he_id || null,
          ten_nguoi_lien_he: goiYLichCongTac?.ten_nguoi_lien_he || null,
          so_dien_thoai: goiYLichCongTac?.so_dien_thoai || null,
          dia_diem: goiYLichCongTac?.dia_diem || null,
          noi_dung: goiYLichCongTac?.noi_dung || null
        }}
        dsLichHienCo={dsLichGap}
        dsKhachHang={dsKhachHang}
        dsNguoiLienHe={dsNguoiLienHe}
        dsNhanSu={dsNhanSu}
        nguoiDungId={nguoiDungHienTai?.id}
        chiNhanhMacDinhId={nhanVienDangXem?.chi_nhanh_id ?? nguoiDungHienTai?.chi_nhanh_id ?? null}
        khi_luu={xuLyLuuLichCongTacChuan as any}
        dang_xu_ly={dangXuLyLichCongTac}
      />

      {/* Drawers Tap cập nhật nhanh tiến độ & kết quả thực tế */}
      <FormCapNhatTienDoTuan
        mo={moCapNhatTienDoTuan}
        onDong={() => setMoCapNhatTienDoTuan(false)}
        item={itemTuanDangCapNhat}
        onLuu={xuLyCapNhatTienDoTuan}
      />

      <FormCapNhatKetQuaThang
        mo={moCapNhatThucTeThang}
        onDong={() => setMoCapNhatThucTeThang(false)}
        item={itemThangDangCapNhat}
        onLuu={xuLyCapNhatThucTeThang}
      />

      {/* Drawers Tổng kết báo cáo tuần / tháng & Xuất PDF */}
      <DrawerTongKetTuan
        mo={moDrawerTongKetTuan}
        onDong={() => setMoDrawerTongKetTuan(false)}
        keHoach={keHoachTuan}
        baoCaoHienTai={baoCaoTuan}
        nhanVien={nhanVienDangXem}
        tuan={tuanChon}
        onLuuBaoCao={xuLyLuuBaoCaoTuan}
        danhSachKhachHang={dsKhachHang}
      />

      <DrawerTongKetThang
        mo={moDrawerTongKetThang}
        onDong={() => setMoDrawerTongKetThang(false)}
        keHoach={keHoachThang}
        baoCaoHienTai={baoCaoThang}
        nhanVien={nhanVienDangXem}
        thang={thangChon}
        onLuuBaoCao={xuLyLuuBaoCaoThang}
        danhSachKhachHang={dsKhachHang}
      />
    </Bo_Cuc_Trang>
  );
}
