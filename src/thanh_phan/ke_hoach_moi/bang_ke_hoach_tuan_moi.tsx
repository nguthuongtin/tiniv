'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Save,
  Send,
  User,
  FolderKanban,
  Building2,
  Users,
  Check,
  X,
  FileText
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import useStoreXacThuc from '../../thu_vien/zustand/store_xac_thuc';
import {
  phanTichTuanISO,
  layTuanISOTuDate,
  dichChuyenTuanISO
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import type {
  KeHoachTuanMoi,
  MucTieuTuanMoi,
  TrangThaiMucTieuMoi
} from '../../thu_vien/types/ke_hoach_tuan_moi';
import {
  layKeHoachTuanMoi,
  luuKeHoachTuanMoi,
  danhSachKeHoachTuanMoiTheoTuan,
  phanHoiKeHoachTuanMoi,
  quetLichTuanDeGoiY,
  quetKetQuaThucTeTuan
} from '../../dich_vu/ke_hoach_moi/dich_vu_ke_hoach_tuan_moi';
import { danhSachHoSoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNhanSu } from '../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachVaiTro } from '../../dich_vu/nhan_su/dich_vu_vai_tro';
import { laQuanLyCapCaoHoacTruongPhong } from '../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { NhanSu, VaiTro } from '../../thu_vien/types/nhan_su';

export default function BangKeHoachTuanMoi() {
  const { nguoiDungHienTai } = useStoreXacThuc();

  // Tuần đang chọn
  const [tuanISO, setTuanISO] = useState<string>(() => layTuanISOTuDate(new Date()));
  const thongTinTuan = useMemo(() => phanTichTuanISO(tuanISO), [tuanISO]);

  // Tab: 'ca_nhan' | 'tong_quan_phong'
  const [tabHienTai, setTabHienTai] = useState<'ca_nhan' | 'tong_quan_phong'>('ca_nhan');

  // Dữ liệu vai trò & nhân sự
  const [dsVaiTro, setDsVaiTro] = useState<VaiTro[]>([]);
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsDuAn, setDsDuAn] = useState<HoSoDuAn[]>([]);

  // Kế hoạch cá nhân
  const [keHoachCaNhan, setKeHoachCaNhan] = useState<KeHoachTuanMoi | null>(null);
  const [dangTai, setDangTai] = useState<boolean>(true);
  const [dangLuu, setDangLuu] = useState<boolean>(false);
  const [thongBao, setThongBao] = useState<{ loai: 'tc' | 'loi'; nd: string } | null>(null);

  // Danh sách kế hoạch toàn phòng (Dành cho Lãnh đạo/TPKD)
  const [dsKeHoachPhong, setDsKeHoachPhong] = useState<KeHoachTuanMoi[]>([]);
  const [dangTaiPhong, setDangTaiPhong] = useState<boolean>(false);

  // Drawer / Modal Drill-down xem chi tiết & phản hồi cho NVKD
  const [nhanSuDangXem, setNhanSuDangXem] = useState<KeHoachTuanMoi | null>(null);
  const [noiDungPhanHoi, setNoiDungPhanHoi] = useState<string>('');
  const [dangLuuPhanHoi, setDangLuuPhanHoi] = useState<boolean>(false);

  // Kiểm tra vai trò Lãnh đạo / TPKD
  const laLanhDaoHoacTP = useMemo(() => {
    if (!nguoiDungHienTai) return false;
    return laQuanLyCapCaoHoacTruongPhong(nguoiDungHienTai as any, dsVaiTro);
  }, [nguoiDungHienTai, dsVaiTro]);

  // Load danh mục ban đầu
  useEffect(() => {
    let cancel = false;
    const loadDanhMuc = async () => {
      try {
        const [resVt, resNs, resDa] = await Promise.all([
          danhSachVaiTro(),
          danhSachNhanSu({}),
          danhSachHoSoDuAn({ trang_thai: 'hoat_dong' })
        ]);
        if (!cancel) {
          setDsVaiTro(resVt.mang || []);
          setDsNhanSu(resNs.mang || []);
          setDsDuAn(resDa.mang || []);
        }
      } catch (e) {
        console.warn('Lỗi tải danh mục:', e);
      }
    };
    loadDanhMuc();
    return () => {
      cancel = true;
    };
  }, []);

  // Tải kế hoạch cá nhân của tuần đang chọn
  const taiKeHoachCaNhan = useCallback(async () => {
    if (!nguoiDungHienTai?.id) return;
    setDangTai(true);
    try {
      const banGhi = await layKeHoachTuanMoi(nguoiDungHienTai.id, tuanISO);
      if (banGhi) {
        setKeHoachCaNhan(banGhi);
      } else {
        // Khởi tạo bản ghi trắng cho tuần
        setKeHoachCaNhan({
          id: `${nguoiDungHienTai.id}_${tuanISO}`,
          nhan_vien_id: nguoiDungHienTai.id,
          ten_nhan_vien: nguoiDungHienTai.ho_va_ten || 'Nhân viên',
          avatar_url: (nguoiDungHienTai as any).avatar_url || null,
          phong_ban_id: nguoiDungHienTai.phong_ban_id || null,
          chi_nhanh_id: (nguoiDungHienTai as any).chi_nhanh_id || null,
          chuc_vu: (nguoiDungHienTai as any).chuc_vu || null,
          tuan: tuanISO,
          ngay_bat_dau: thongTinTuan.ngayBatDau,
          ngay_ket_thuc: thongTinTuan.ngayKetThuc,
          danh_sach_muc_tieu: [],
          muc_tieu_chung: '',
          kho_khan_vuong_mac: '',
          de_xuat_ho_tro: '',
          dinh_huong_tuan_toi: '',
          trang_thai: 'dang_lap',
          ngay_cap_nhat: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Lỗi tải kế hoạch tuần:', e);
    } finally {
      setDangTai(false);
    }
  }, [nguoiDungHienTai, tuanISO, thongTinTuan]);

  // Tải danh sách kế hoạch toàn phòng của tuần đang chọn
  const taiKeHoachPhong = useCallback(async () => {
    if (!laLanhDaoHoacTP) return;
    setDangTaiPhong(true);
    try {
      const ds = await danhSachKeHoachTuanMoiTheoTuan(tuanISO);
      setDsKeHoachPhong(ds);
    } catch (e) {
      console.warn('Lỗi tải kế hoạch phòng:', e);
    } finally {
      setDangTaiPhong(false);
    }
  }, [laLanhDaoHoacTP, tuanISO]);

  useEffect(() => {
    taiKeHoachCaNhan();
    if (laLanhDaoHoacTP) {
      taiKeHoachPhong();
    }
  }, [taiKeHoachCaNhan, taiKeHoachPhong, laLanhDaoHoacTP]);

  // Toast thông báo tự tắt
  const hienThongBao = (loai: 'tc' | 'loi', nd: string) => {
    setThongBao({ loai, nd });
    setTimeout(() => setThongBao(null), 3500);
  };

  // Thêm dòng mục tiêu mới
  const themDongMucTieu = () => {
    if (!keHoachCaNhan) return;
    const itemMoi: MucTieuTuanMoi = {
      id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      noi_dung_trong_tam: '',
      trang_thai: 'dang_lam'
    };
    setKeHoachCaNhan({
      ...keHoachCaNhan,
      danh_sach_muc_tieu: [...keHoachCaNhan.danh_sach_muc_tieu, itemMoi]
    });
  };

  // Cập nhật từng dòng mục tiêu
  const suaDongMucTieu = (id: string, duLieu: Partial<MucTieuTuanMoi>) => {
    if (!keHoachCaNhan) return;
    const dsMoi = keHoachCaNhan.danh_sach_muc_tieu.map((m) =>
      m.id === id ? { ...m, ...duLieu } : m
    );
    setKeHoachCaNhan({ ...keHoachCaNhan, danh_sach_muc_tieu: dsMoi });
  };

  // Xóa dòng mục tiêu
  const xoaDongMucTieu = (id: string) => {
    if (!keHoachCaNhan) return;
    const dsMoi = keHoachCaNhan.danh_sach_muc_tieu.filter((m) => m.id !== id);
    setKeHoachCaNhan({ ...keHoachCaNhan, danh_sach_muc_tieu: dsMoi });
  };

  // Chọn dự án gắn vào mục tiêu
  const ganDuAnVaoMucTieu = (mucTieuId: string, duAnId: string) => {
    const da = dsDuAn.find((d) => d.id === duAnId);
    if (!da) {
      suaDongMucTieu(mucTieuId, { du_an_id: null, ten_du_an: null, ten_khach_hang: null });
      return;
    }
    suaDongMucTieu(mucTieuId, {
      du_an_id: da.id,
      ten_du_an: da.ten_du_an,
      ten_khach_hang: null,
      khach_hang_id: da.khach_hang_id || null
    });
  };

  // Tính năng 1: Gợi ý mục tiêu từ Lịch làm việc tuần
  const tuDongGoiYTuLich = async () => {
    if (!nguoiDungHienTai?.id || !keHoachCaNhan) return;
    try {
      const dsGoiY = await quetLichTuanDeGoiY(
        nguoiDungHienTai.id,
        thongTinTuan.ngayBatDau,
        thongTinTuan.ngayKetThuc
      );
      if (dsGoiY.length === 0) {
        hienThongBao('loi', 'Chưa có lịch làm việc nào được xếp trong tuần này.');
        return;
      }
      // Tránh trùng các dự án/khách hàng đã có trong danh sách
      const cacKeyHienTai = new Set(
        keHoachCaNhan.danh_sach_muc_tieu.map(
          (m) => m.du_an_id || m.khach_hang_id || m.noi_dung_trong_tam
        )
      );
      const mucTieuThem = dsGoiY.filter(
        (g) => !cacKeyHienTai.has(g.du_an_id || g.khach_hang_id || g.noi_dung_trong_tam)
      );

      if (mucTieuThem.length === 0) {
        hienThongBao('tc', 'Tất cả các lịch làm việc đã có trong kế hoạch.');
        return;
      }

      setKeHoachCaNhan({
        ...keHoachCaNhan,
        danh_sach_muc_tieu: [...keHoachCaNhan.danh_sach_muc_tieu, ...mucTieuThem]
      });
      hienThongBao('tc', `Đã lấy thêm ${mucTieuThem.length} mục tiêu từ Lịch làm việc.`);
    } catch {
      hienThongBao('loi', 'Không thể lấy dữ liệu lịch làm việc.');
    }
  };

  // Tính năng 2: Tự động tổng hợp kết quả thực tế cuối tuần
  const tuDongTongHopKetQua = async () => {
    if (!nguoiDungHienTai?.id || !keHoachCaNhan) return;
    try {
      const ketQuaMap = await quetKetQuaThucTeTuan(
        nguoiDungHienTai.id,
        thongTinTuan.ngayBatDau,
        thongTinTuan.ngayKetThuc
      );
      if (ketQuaMap.size === 0) {
        hienThongBao('loi', 'Chưa có kết quả làm việc hoặc báo cáo ngày nào trong tuần này.');
        return;
      }

      let count = 0;
      const dsMoi = keHoachCaNhan.danh_sach_muc_tieu.map((m) => {
        const kqDA = m.du_an_id ? ketQuaMap.get(m.du_an_id) : null;
        const kqKH = m.khach_hang_id ? ketQuaMap.get(m.khach_hang_id) : null;
        const kqMoi = kqDA || kqKH;
        if (kqMoi && !m.ket_qua_dat_duoc) {
          count++;
          return {
            ...m,
            ket_qua_dat_duoc: kqMoi,
            trang_thai: 'da_xong' as TrangThaiMucTieuMoi
          };
        }
        return m;
      });

      setKeHoachCaNhan({ ...keHoachCaNhan, danh_sach_muc_tieu: dsMoi });
      hienThongBao('tc', `Đã cập nhật kết quả tự động cho ${count} mục tiêu.`);
    } catch {
      hienThongBao('loi', 'Lỗi khi tổng hợp kết quả.');
    }
  };

  // Lưu kế hoạch
  const luuKeHoach = async (chuyenTrangThaiGui = false) => {
    if (!keHoachCaNhan) return;
    setDangLuu(true);
    try {
      const banGhiMoi: KeHoachTuanMoi = {
        ...keHoachCaNhan,
        trang_thai: chuyenTrangThaiGui ? 'da_gui' : keHoachCaNhan.trang_thai,
        ngay_cap_nhat: new Date().toISOString()
      };
      await luuKeHoachTuanMoi(banGhiMoi);
      setKeHoachCaNhan(banGhiMoi);
      hienThongBao(
        'tc',
        chuyenTrangThaiGui ? 'Đã gửi kế hoạch tuần thành công!' : 'Đã lưu bản nháp kế hoạch!'
      );
      if (laLanhDaoHoacTP) {
        taiKeHoachPhong();
      }
    } catch (e) {
      console.warn('Lỗi lưu kế hoạch:', e);
      hienThongBao('loi', 'Có lỗi xảy ra khi lưu.');
    } finally {
      setDangLuu(false);
    }
  };

  // TPKD lưu phản hồi / định hướng
  const xuLyLuuPhanHoi = async () => {
    if (!nhanSuDangXem || !nguoiDungHienTai) return;
    setDangLuuPhanHoi(true);
    try {
      await phanHoiKeHoachTuanMoi(nhanSuDangXem.id, noiDungPhanHoi, {
        id: nguoiDungHienTai.id,
        ho_va_ten: nguoiDungHienTai.ho_va_ten || 'Trưởng phòng'
      });
      hienThongBao('tc', 'Đã lưu ý kiến định hướng thành công!');
      // Update local state
      setDsKeHoachPhong((prev) =>
        prev.map((k) =>
          k.id === nhanSuDangXem.id
            ? {
                ...k,
                phan_hoi_lanh_dao: noiDungPhanHoi.trim(),
                ten_nguoi_phan_hoi: nguoiDungHienTai.ho_va_ten,
                ngay_phan_hoi: new Date().toISOString(),
                trang_thai: 'da_phan_hoi'
              }
            : k
        )
      );
      setNhanSuDangXem(null);
    } catch {
      hienThongBao('loi', 'Không thể lưu phản hồi.');
    } finally {
      setDangLuuPhanHoi(false);
    }
  };

  // Thống kê phòng
  const thongKePhong = useMemo(() => {
    const tongSo = dsNhanSu.filter((n) => n.trang_thai_du_lieu === 'hoat_dong').length;
    const daGui = dsKeHoachPhong.filter((k) => k.trang_thai === 'da_gui' || k.trang_thai === 'da_phan_hoi').length;
    const chuaGui = Math.max(0, tongSo - daGui);
    let tongMucTieu = 0;
    let tongHoanThanh = 0;
    for (const k of dsKeHoachPhong) {
      tongMucTieu += k.danh_sach_muc_tieu?.length || 0;
      tongHoanThanh += k.danh_sach_muc_tieu?.filter((m) => m.trang_thai === 'da_xong').length || 0;
    }
    return { tongSo, daGui, chuaGui, tongMucTieu, tongHoanThanh };
  }, [dsNhanSu, dsKeHoachPhong]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 py-3">
      {/* Toast thông báo */}
      {thongBao && (
        <div
          className={cn(
            'fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium transition-all duration-200',
            thongBao.loai === 'tc'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          )}
        >
          {thongBao.loai === 'tc' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {thongBao.nd}
        </div>
      )}

      {/* HEADER: BỘ CHỌN TUẦN & CHUYỂN TAB */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Bộ chọn tuần */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-1">
            <button
              onClick={() => setTuanISO(dichChuyenTuanISO(tuanISO, -1))}
              className="p-1.5 hover:bg-white rounded text-slate-600 transition"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-center min-w-[210px]">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                {thongTinTuan.nhanTieuDe} ({tuanISO})
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {thongTinTuan.danhSachNgay[0].ngayNgan} - {thongTinTuan.danhSachNgay[6].ngayNgan} / {thongTinTuan.nam}
              </div>
            </div>
            <button
              onClick={() => setTuanISO(dichChuyenTuanISO(tuanISO, 1))}
              className="p-1.5 hover:bg-white rounded text-slate-600 transition"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setTuanISO(layTuanISOTuDate(new Date()))}
            className="px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition"
          >
            Tuần này
          </button>
        </div>

        {/* Chuyển Tab nếu là Quản lý/TPKD */}
        <div className="flex items-center gap-2">
          {laLanhDaoHoacTP && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setTabHienTai('ca_nhan')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition',
                  tabHienTai === 'ca_nhan'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Kế hoạch cá nhân
              </button>
              <button
                onClick={() => setTabHienTai('tong_quan_phong')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5',
                  tabHienTai === 'tong_quan_phong'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Users className="w-3.5 h-3.5" />
                Tổng quan phòng
                <span className="ml-1 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                  {dsKeHoachPhong.length}
                </span>
              </button>
            </div>
          )}

          {tabHienTai === 'ca_nhan' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => luuKeHoach(false)}
                disabled={dangLuu || dangTai}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu nháp
              </button>
              <button
                onClick={() => luuKeHoach(true)}
                disabled={dangLuu || dangTai}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi kế hoạch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================= TAB 1: KẾ HOẠCH CÁ NHÂN ======================= */}
      {tabHienTai === 'ca_nhan' && (
        <div className="space-y-4">
          {dangTai ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              Đang tải dữ liệu kế hoạch tuần...
            </div>
          ) : (
            <>
              {/* PHẦN 1: KẾ HOẠCH ĐẦU TUẦN */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                      1. Mục tiêu & Dự án trọng tâm trong tuần
                    </h3>
                  </div>

                  {/* Nút thao tác nhanh */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={tuDongGoiYTuLich}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium rounded-lg transition"
                      title="Quét lịch làm việc đã hẹn trong tuần này để đưa vào danh sách mục tiêu"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Lấy từ Lịch làm việc
                    </button>
                    <button
                      onClick={themDongMucTieu}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-medium rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm mục tiêu
                    </button>
                  </div>
                </div>

                {/* Danh sách mục tiêu (Table Desktop) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3 w-10 text-center">STT</th>
                        <th className="py-2.5 px-3 w-64">Dự án / Khách hàng</th>
                        <th className="py-2.5 px-3">Trọng tâm công việc & Kỳ vọng đạt được</th>
                        <th className="py-2.5 px-3 w-72">Kết quả thực tế (Cuối tuần)</th>
                        <th className="py-2.5 px-3 w-32 text-center">Trạng thái</th>
                        <th className="py-2.5 px-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keHoachCaNhan?.danh_sach_muc_tieu.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Chưa có mục tiêu nào. Nhấp{' '}
                            <span
                              onClick={themDongMucTieu}
                              className="text-blue-600 font-medium cursor-pointer hover:underline"
                            >
                              Thêm mục tiêu
                            </span>{' '}
                            hoặc bấm{' '}
                            <span
                              onClick={tuDongGoiYTuLich}
                              className="text-amber-600 font-medium cursor-pointer hover:underline"
                            >
                              Lấy từ Lịch làm việc
                            </span>{' '}
                            để tự động điền.
                          </td>
                        </tr>
                      ) : (
                        keHoachCaNhan?.danh_sach_muc_tieu.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-slate-50/60 transition group">
                            {/* STT */}
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>

                            {/* Dự án / Khách hàng */}
                            <td className="py-2.5 px-3 align-top">
                              <select
                                value={m.du_an_id || ''}
                                onChange={(e) => ganDuAnVaoMucTieu(m.id, e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">-- Chọn dự án liên quan --</option>
                                {dsDuAn.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.ten_du_an}
                                  </option>
                                ))}
                              </select>
                              {m.ten_khach_hang && (
                                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{m.ten_khach_hang}</span>
                                </div>
                              )}
                            </td>

                            {/* Trọng tâm công việc & Kỳ vọng đạt được */}
                            <td className="py-2.5 px-3 align-top">
                              <textarea
                                value={m.noi_dung_trong_tam}
                                onChange={(e) => suaDongMucTieu(m.id, { noi_dung_trong_tam: e.target.value })}
                                placeholder="Ghi rõ hành động trọng tâm và kết quả kỳ vọng trong tuần..."
                                rows={2}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                              />
                            </td>

                            {/* Kết quả thực tế (Cuối tuần) */}
                            <td className="py-2.5 px-3 align-top">
                              <textarea
                                value={m.ket_qua_dat_duoc || ''}
                                onChange={(e) => suaDongMucTieu(m.id, { ket_qua_dat_duoc: e.target.value })}
                                placeholder="Cập nhật kết quả thực tế cuối tuần..."
                                rows={2}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed text-slate-700"
                              />
                            </td>

                            {/* Trạng thái */}
                            <td className="py-2.5 px-3 text-center align-top">
                              <select
                                value={m.trang_thai}
                                onChange={(e) =>
                                  suaDongMucTieu(m.id, { trang_thai: e.target.value as TrangThaiMucTieuMoi })
                                }
                                className={cn(
                                  'px-2 py-1.5 rounded text-[11px] font-semibold border focus:outline-none cursor-pointer',
                                  m.trang_thai === 'da_xong'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : m.trang_thai === 'tam_hoan'
                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                )}
                              >
                                <option value="dang_lam">Đang làm</option>
                                <option value="da_xong">Đã xong</option>
                                <option value="tam_hoan">Tạm hoãn</option>
                              </select>
                            </td>

                            {/* Xóa */}
                            <td className="py-2.5 px-3 text-center align-top">
                              <button
                                onClick={() => xoaDongMucTieu(m.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Định hướng chung cả tuần */}
                <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/30">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                    Trọng tâm điều hành chung của cá nhân trong tuần:
                  </label>
                  <textarea
                    value={keHoachCaNhan?.muc_tieu_chung || ''}
                    onChange={(e) =>
                      setKeHoachCaNhan((prev) => (prev ? { ...prev, muc_tieu_chung: e.target.value } : null))
                    }
                    placeholder="Ví dụ: Tập trung chốt các hồ sơ thầu khu vực Tây Nguyên, hoàn thành ký 2 hợp đồng khung..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white resize-none"
                  />
                </div>
              </div>

              {/* PHẦN 2: TỔNG KẾT & ĐỀ XUẤT CUỐI TUẦN */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    2. Tổng kết & Đề xuất (Cuối tuần)
                  </h3>
                  <button
                    onClick={tuDongTongHopKetQua}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium rounded-lg transition"
                    title="Tự động quét kết quả các buổi làm việc và báo cáo ngày trong tuần để điền vào mục tiêu"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Tự động tổng hợp kết quả tuần
                  </button>
                </div>

                <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1.5">
                      Khó khăn, vướng mắc phát sinh
                    </label>
                    <textarea
                      value={keHoachCaNhan?.kho_khan_vuong_mac || ''}
                      onChange={(e) =>
                        setKeHoachCaNhan((prev) =>
                          prev ? { ...prev, kho_khan_vuong_mac: e.target.value } : null
                        )
                      }
                      placeholder="Các vướng mắc về sản phẩm, kỹ thuật, thủ tục, hoặc đối thủ..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1.5">
                      Đề xuất Ban lãnh đạo / Bộ phận hỗ trợ
                    </label>
                    <textarea
                      value={keHoachCaNhan?.de_xuat_ho_tro || ''}
                      onChange={(e) =>
                        setKeHoachCaNhan((prev) =>
                          prev ? { ...prev, de_xuat_ho_tro: e.target.value } : null
                        )
                      }
                      placeholder="Cần Ban lãnh đạo hoặc bộ phận Kỹ thuật hỗ trợ giải quyết vấn đề gì..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1.5">
                      Định hướng trọng tâm tuần sau
                    </label>
                    <textarea
                      value={keHoachCaNhan?.dinh_huong_tuan_toi || ''}
                      onChange={(e) =>
                        setKeHoachCaNhan((prev) =>
                          prev ? { ...prev, dinh_huong_tuan_toi: e.target.value } : null
                        )
                      }
                      placeholder="Các công việc gối đầu hoặc chuyển tiếp sang tuần tới..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 3: ĐỒNG HÀNH & ĐỊNH HƯỚNG TỪ LÃNH ĐẠO */}
              {keHoachCaNhan?.phan_hoi_lanh_dao && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-tight">
                      Ý kiến đồng hành & Định hướng từ Lãnh đạo
                    </span>
                    {keHoachCaNhan.ten_nguoi_phan_hoi && (
                      <span className="text-[11px] text-emerald-700 font-medium">
                        — {keHoachCaNhan.ten_nguoi_phan_hoi}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100">
                    {keHoachCaNhan.phan_hoi_lanh_dao}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ======================= TAB 2: TỔNG QUAN PHÒNG KINH DOANH ======================= */}
      {tabHienTai === 'tong_quan_phong' && laLanhDaoHoacTP && (
        <div className="space-y-4">
          {/* Thẻ thống kê */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Nhân sự phòng</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{thongKePhong.tongSo}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Đã nộp kế hoạch</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">
                {thongKePhong.daGui}{' '}
                <span className="text-xs font-normal text-slate-400">/ {thongKePhong.tongSo}</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Mục tiêu trọng tâm</div>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{thongKePhong.tongMucTieu}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-medium">Mục tiêu đã hoàn thành</div>
              <div className="text-xl font-bold text-purple-600 mt-0.5">
                {thongKePhong.tongHoanThanh}{' '}
                <span className="text-xs font-normal text-slate-400">
                  (
                  {thongKePhong.tongMucTieu > 0
                    ? Math.round((thongKePhong.tongHoanThanh / thongKePhong.tongMucTieu) * 100)
                    : 0}
                  %)
                </span>
              </div>
            </div>
          </div>

          {/* Bảng tổng hợp NVKD */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Danh sách Kế hoạch & Báo cáo tuần của Nhân viên
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 w-56">Nhân viên</th>
                    <th className="py-2.5 px-3">Mục tiêu trọng tâm tuần</th>
                    <th className="py-2.5 px-3 w-32 text-center">Tiến độ</th>
                    <th className="py-2.5 px-3 w-64">Vướng mắc / Đề xuất</th>
                    <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                    <th className="py-2.5 px-3 w-28 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dangTaiPhong ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Đang tải danh sách phòng...
                      </td>
                    </tr>
                  ) : dsKeHoachPhong.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        Chưa có nhân viên nào gửi kế hoạch trong tuần này.
                      </td>
                    </tr>
                  ) : (
                    dsKeHoachPhong.map((kh) => {
                      const soXong = kh.danh_sach_muc_tieu.filter((m) => m.trang_thai === 'da_xong').length;
                      const tong = kh.danh_sach_muc_tieu.length;
                      const tiLe = tong > 0 ? Math.round((soXong / tong) * 100) : 0;

                      return (
                        <tr
                          key={kh.id}
                          onClick={() => {
                            setNhanSuDangXem(kh);
                            setNoiDungPhanHoi(kh.phan_hoi_lanh_dao || '');
                          }}
                          className="hover:bg-blue-50/40 transition cursor-pointer group"
                        >
                          {/* Nhân viên */}
                          <td className="py-3 px-3 align-top">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                                {kh.avatar_url ? (
                                  <img
                                    src={kh.avatar_url}
                                    alt=""
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  kh.ten_nhan_vien.slice(0, 1).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                                  {kh.ten_nhan_vien}
                                </div>
                                <div className="text-[11px] text-slate-400">{kh.chuc_vu || 'NVKD'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Mục tiêu trọng tâm */}
                          <td className="py-3 px-3 align-top">
                            {kh.danh_sach_muc_tieu.length === 0 ? (
                              <span className="text-slate-400 italic">Chưa lên mục tiêu</span>
                            ) : (
                              <div className="space-y-1">
                                {kh.danh_sach_muc_tieu.slice(0, 2).map((m, i) => (
                                  <div key={m.id} className="text-xs text-slate-700 flex items-start gap-1.5">
                                    <span className="text-slate-400 font-mono text-[10px] mt-0.5">{i + 1}.</span>
                                    <span className="truncate">
                                      {m.ten_du_an ? `[${m.ten_du_an}] ` : ''}
                                      {m.noi_dung_trong_tam}
                                    </span>
                                  </div>
                                ))}
                                {kh.danh_sach_muc_tieu.length > 2 && (
                                  <div className="text-[11px] text-blue-600 font-medium">
                                    + {kh.danh_sach_muc_tieu.length - 2} mục tiêu khác...
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Tiến độ */}
                          <td className="py-3 px-3 align-top text-center">
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={cn(
                                  'font-bold text-xs',
                                  tiLe === 100
                                    ? 'text-emerald-600'
                                    : tiLe >= 50
                                    ? 'text-blue-600'
                                    : 'text-slate-700'
                                )}
                              >
                                {soXong}/{tong} ({tiLe}%)
                              </span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    tiLe === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                  )}
                                  style={{ width: `${tiLe}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Vướng mắc / Đề xuất */}
                          <td className="py-3 px-3 align-top">
                            {kh.kho_khan_vuong_mac || kh.de_xuat_ho_tro ? (
                              <div className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded border border-amber-200 line-clamp-2">
                                {kh.kho_khan_vuong_mac || kh.de_xuat_ho_tro}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Không có vướng mắc</span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-3 align-top text-center">
                            <span
                              className={cn(
                                'inline-block px-2 py-0.5 rounded text-[10px] font-semibold border',
                                kh.trang_thai === 'da_phan_hoi'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : kh.trang_thai === 'da_gui'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              )}
                            >
                              {kh.trang_thai === 'da_phan_hoi'
                                ? 'Đã phản hồi'
                                : kh.trang_thai === 'da_gui'
                                ? 'Đã nộp'
                                : 'Đang lập'}
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td className="py-3 px-3 align-top text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNhanSuDangXem(kh);
                                setNoiDungPhanHoi(kh.phan_hoi_lanh_dao || '');
                              }}
                              className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-100 bg-blue-50 rounded transition font-medium"
                            >
                              Phản hồi
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL DRILL-DOWN CHI TIẾT & PHẢN HỒI ======================= */}
      {nhanSuDangXem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {nhanSuDangXem.avatar_url ? (
                    <img
                      src={nhanSuDangXem.avatar_url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    nhanSuDangXem.ten_nhan_vien.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Kế hoạch & Báo cáo tuần: {nhanSuDangXem.ten_nhan_vien}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Tuần {nhanSuDangXem.tuan} ({thongTinTuan.khoangNgayNhan})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNhanSuDangXem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Modal (Scrollable) */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Mục tiêu chung */}
              {nhanSuDangXem.muc_tieu_chung && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Trọng tâm chung tuần:
                  </div>
                  <div className="text-slate-800 leading-relaxed">
                    {nhanSuDangXem.muc_tieu_chung}
                  </div>
                </div>
              )}

              {/* Danh sách mục tiêu chi tiết */}
              <div>
                <div className="font-bold text-slate-700 uppercase tracking-tight mb-2">
                  Danh sách mục tiêu ({nhanSuDangXem.danh_sach_muc_tieu.length})
                </div>
                <div className="space-y-2">
                  {nhanSuDangXem.danh_sach_muc_tieu.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {m.ten_du_an || 'Mục tiêu cá nhân'}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-semibold border',
                            m.trang_thai === 'da_xong'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : m.trang_thai === 'tam_hoan'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          )}
                        >
                          {m.trang_thai === 'da_xong'
                            ? 'Đã xong'
                            : m.trang_thai === 'tam_hoan'
                            ? 'Tạm hoãn'
                            : 'Đang làm'}
                        </span>
                      </div>
                      <div className="text-slate-700 leading-relaxed">
                        <span className="text-slate-400 font-medium">Trọng tâm:</span>{' '}
                        {m.noi_dung_trong_tam}
                      </div>
                      {m.ket_qua_dat_duoc && (
                        <div className="text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100 whitespace-pre-wrap leading-relaxed mt-1">
                          <span className="font-semibold text-emerald-900">Kết quả đạt được:</span>
                          <div className="mt-0.5">{m.ket_qua_dat_duoc}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vướng mắc & Đề xuất */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg">
                  <div className="font-bold text-amber-900 uppercase text-[11px] mb-1">
                    Khó khăn, vướng mắc:
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {nhanSuDangXem.kho_khan_vuong_mac || 'Không có'}
                  </div>
                </div>
                <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-lg">
                  <div className="font-bold text-blue-900 uppercase text-[11px] mb-1">
                    Đề xuất hỗ trợ:
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {nhanSuDangXem.de_xuat_ho_tro || 'Không có'}
                  </div>
                </div>
              </div>

              {/* Ô gõ ý kiến định hướng từ Trưởng phòng / Lãnh đạo */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Ý kiến định hướng & Đồng hành của Trưởng phòng:
                </label>
                <textarea
                  value={noiDungPhanHoi}
                  onChange={(e) => setNoiDungPhanHoi(e.target.value)}
                  placeholder="Ghi nhận xét định hướng, tháo gỡ điểm nghẽn hoặc lời động viên..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setNhanSuDangXem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Đóng
              </button>
              <button
                onClick={xuLyLuuPhanHoi}
                disabled={dangLuuPhanHoi || !noiDungPhanHoi.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {dangLuuPhanHoi ? 'Đang lưu...' : 'Lưu ý kiến định hướng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
