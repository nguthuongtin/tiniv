'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  Building2,
  Briefcase,
  Target,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Inbox,
  Search,
  UserRound,
  Check
} from 'lucide-react';
import type { ItemKeHoachTuan, ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import { danhSachNguoiLienHe as taiDanhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { Nut, Ban_Ve } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachTuan | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  danhSachNguoiLienHe?: NguoiLienHe[];
  danhSachMucTieuThang?: ItemKeHoachThang[];
  ngayMacDinh?: string;
  hinhThucMacDinh?: 'gap_mat' | 'goi_dien' | 'nhan_tin' | 'khac';
  loaiHanhDongMacDinh?: 'theo_muc_tieu' | 'phat_sinh';
  mucTieuThangMacDinhId?: string | null;
  onLuu: (item: ItemKeHoachTuan) => void;
}

export default function FormTacChienTuanDrawer({
  mo,
  onDong,
  dangSua,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  danhSachNguoiLienHe = [],
  danhSachMucTieuThang = [],
  ngayMacDinh = '',
  hinhThucMacDinh = 'goi_dien',
  mucTieuThangMacDinhId = null,
  onLuu
}: Props) {
  const [hanhDongTuan, setHanhDongTuan] = useState<string>('');
  const [ketQuaMongMuon, setKetQuaMongMuon] = useState<string>('');
  const [mucTieuThangId, setMucTieuThangId] = useState<string>('');
  const [ngayDuKien, setNgayDuKien] = useState<string>('');
  const [hinhThuc, setHinhThuc] = useState<'gap_mat' | 'goi_dien' | 'nhan_tin' | 'khac'>('goi_dien');

  // Tùy chọn mở rộng (Khách hàng / Dự án / Người liên hệ cố định / Hỗ trợ)
  const [moRongChiTiet, setMoRongChiTiet] = useState<boolean>(false);
  const [khachHangId, setKhachHangId] = useState<string>('');
  const [coQuanDoanhNghiep, setCoQuanDoanhNghiep] = useState<string>('');
  const [tuKhoaTimKH, setTuKhoaTimKH] = useState<string>('');
  const [moGoiYKH, setMoGoiYKH] = useState<boolean>(false);

  const [duAnId, setDuAnId] = useState<string>('');
  const [duAnDuKien, setDuAnDuKien] = useState<string>('');
  const [tuKhoaTimDA, setTuKhoaTimDA] = useState<string>('');
  const [moGoiYDA, setMoGoiYDA] = useState<boolean>(false);

  const [nguoiLienHeId, setNguoiLienHeId] = useState<string>('');
  const [tenNguoiLienHe, setTenNguoiLienHe] = useState<string>('');
  const [chucVuLienHe, setChucVuLienHe] = useState<string>('');
  const [sdtLienHe, setSdtLienHe] = useState<string>('');
  const [moGoiYNLH, setMoGoiYNLH] = useState<boolean>(false);
  const [dsLienHeRiengKH, setDsLienHeRiengKH] = useState<NguoiLienHe[]>([]);

  const [nguoiHoTro, setNguoiHoTro] = useState<string>('');
  const [xaPhuong, setXaPhuong] = useState<string>('');

  const refKH = useRef<HTMLDivElement>(null);
  const refDA = useRef<HTMLDivElement>(null);
  const refNLH = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (refKH.current && !refKH.current.contains(e.target as Node)) setMoGoiYKH(false);
      if (refDA.current && !refDA.current.contains(e.target as Node)) setMoGoiYDA(false);
      if (refNLH.current && !refNLH.current.contains(e.target as Node)) setMoGoiYNLH(false);
    };
    if (moGoiYKH || moGoiYDA || moGoiYNLH) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moGoiYKH, moGoiYDA, moGoiYNLH]);

  useEffect(() => {
    if (dangSua) {
      setHanhDongTuan(
        dangSua.hanh_dong_tuan || dangSua.noi_dung_tuan || dangSua.ten_khach_hang_du_an || ''
      );
      setKetQuaMongMuon(dangSua.ket_qua_mong_muon || dangSua.dau_ra_cam_ket || '');
      setMucTieuThangId(dangSua.muc_tieu_thang_id || '');
      setNgayDuKien(dangSua.ngay_du_kien || '');
      setHinhThuc((dangSua.hinh_thuc as any) || 'goi_dien');

      setKhachHangId(dangSua.khach_hang_id || '');
      setCoQuanDoanhNghiep(dangSua.co_quan_doanh_nghiep || '');
      setTuKhoaTimKH(dangSua.co_quan_doanh_nghiep || '');

      setDuAnId(dangSua.du_an_id || '');
      setDuAnDuKien(dangSua.du_an_du_kien || '');
      setTuKhoaTimDA(dangSua.du_an_du_kien || '');

      setNguoiLienHeId(dangSua.nguoi_lien_he_id || '');
      setTenNguoiLienHe(dangSua.nguoi_lien_he || '');
      setChucVuLienHe(dangSua.chuc_vu || '');
      setSdtLienHe(dangSua.so_dien_thoai_lien_he || '');

      setNguoiHoTro(dangSua.nguoi_ho_tro || dangSua.can_ho_tro || '');
      setXaPhuong(dangSua.xa_phuong || '');

      setMoRongChiTiet(
        Boolean(
          dangSua.khach_hang_id ||
            dangSua.du_an_id ||
            dangSua.co_quan_doanh_nghiep ||
            dangSua.nguoi_lien_he ||
            dangSua.nguoi_ho_tro ||
            dangSua.can_ho_tro
        )
      );
    } else {
      setHanhDongTuan('');
      setKetQuaMongMuon('');
      setNgayDuKien(ngayMacDinh || '');
      setHinhThuc(hinhThucMacDinh || 'goi_dien');
      setNguoiHoTro('');

      if (mucTieuThangMacDinhId) {
        const mt = danhSachMucTieuThang.find((m) => m.id === mucTieuThangMacDinhId);
        setMucTieuThangId(mucTieuThangMacDinhId);
        setKhachHangId(mt?.khach_hang_id || '');
        setCoQuanDoanhNghiep(mt?.co_quan_doanh_nghiep || '');
        setTuKhoaTimKH(mt?.co_quan_doanh_nghiep || '');
        setDuAnId(mt?.du_an_id || '');
        setDuAnDuKien(mt?.du_an_du_kien || '');
        setTuKhoaTimDA(mt?.du_an_du_kien || '');
        setNguoiLienHeId(mt?.nguoi_lien_he_id || '');
        setTenNguoiLienHe(mt?.nguoi_lien_he || '');
        setChucVuLienHe(mt?.chuc_vu || '');
        setSdtLienHe(mt?.so_dien_thoai_lien_he || '');
        setXaPhuong(mt?.xa_phuong || '');
        setMoRongChiTiet(Boolean(mt?.khach_hang_id || mt?.du_an_id || mt?.nguoi_lien_he));
      } else {
        setMucTieuThangId('');
        setKhachHangId('');
        setCoQuanDoanhNghiep('');
        setTuKhoaTimKH('');
        setDuAnId('');
        setDuAnDuKien('');
        setTuKhoaTimDA('');
        setNguoiLienHeId('');
        setTenNguoiLienHe('');
        setChucVuLienHe('');
        setSdtLienHe('');
        setXaPhuong('');
        setMoRongChiTiet(false);
      }
    }
    setMoGoiYKH(false);
    setMoGoiYDA(false);
    setMoGoiYNLH(false);
  }, [dangSua, mo, ngayMacDinh, hinhThucMacDinh, mucTieuThangMacDinhId, danhSachMucTieuThang]);

  // Tải danh sách người liên hệ của khách hàng đang chọn
  useEffect(() => {
    if (!mo || !khachHangId) {
      setDsLienHeRiengKH([]);
      return;
    }
    let huy = false;
    void (async () => {
      try {
        const kq = await taiDanhSachNguoiLienHe({ khach_hang_id: khachHangId });
        if (!huy) setDsLienHeRiengKH(kq.mang || []);
      } catch {
        if (!huy) setDsLienHeRiengKH([]);
      }
    })();
    return () => {
      huy = true;
    };
  }, [mo, khachHangId]);

  const dsLienHeCuaKH = useMemo(() => {
    if (!khachHangId) return [];
    const map = new Map<string, NguoiLienHe>();
    danhSachNguoiLienHe
      .filter((x) => x.khach_hang_id === khachHangId)
      .forEach((x) => map.set(x.id, x));
    dsLienHeRiengKH.forEach((x) => map.set(x.id, x));
    return Array.from(map.values());
  }, [khachHangId, danhSachNguoiLienHe, dsLienHeRiengKH]);

  // Lọc Khách hàng theo từ khóa tìm kiếm
  const dsKhachHangGoiY = useMemo(() => {
    const q = tuKhoaTimKH.trim().toLowerCase();
    const khDangChon = khachHangId
      ? danhSachKhachHang.find((k) => k.id === khachHangId)
      : null;
    if (!q || (khDangChon && q === khDangChon.ten_khach_hang.trim().toLowerCase())) {
      return danhSachKhachHang;
    }
    return danhSachKhachHang.filter(
      (k) =>
        k.ten_khach_hang.toLowerCase().includes(q) ||
        (k.so_dien_thoai && k.so_dien_thoai.toLowerCase().includes(q)) ||
        (k.dia_chi && k.dia_chi.toLowerCase().includes(q)) ||
        (k.xa_phuong && k.xa_phuong.toLowerCase().includes(q))
    );
  }, [danhSachKhachHang, tuKhoaTimKH, khachHangId]);

  // Lọc Dự án theo Khách hàng (nếu có) và từ khóa tìm kiếm
  const dsDuAnGoiY = useMemo(() => {
    const pool = khachHangId
      ? danhSachDuAn.filter((d) => d.khach_hang_id === khachHangId && d.trang_thai !== 'da_xoa')
      : danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa');
    const dsNguon = pool.length > 0 ? pool : danhSachDuAn.filter((d) => d.trang_thai !== 'da_xoa');

    const q = tuKhoaTimDA.trim().toLowerCase();
    const daDangChon = duAnId ? danhSachDuAn.find((d) => d.id === duAnId) : null;
    if (!q || (daDangChon && q === daDangChon.ten_du_an.trim().toLowerCase())) {
      return dsNguon;
    }
    return dsNguon.filter(
      (d) =>
        d.ten_du_an.toLowerCase().includes(q) ||
        (d.ma_ho_so && d.ma_ho_so.toLowerCase().includes(q))
    );
  }, [danhSachDuAn, khachHangId, tuKhoaTimDA, duAnId]);

  const xuLyChonMucTieuThang = (mtId: string) => {
    setMucTieuThangId(mtId);
    if (!mtId) return;
    const mt = danhSachMucTieuThang.find((x) => x.id === mtId);
    if (mt) {
      if (mt.khach_hang_id) {
        xuLyChonKhachHang(mt.khach_hang_id);
      }
      if (mt.du_an_id) {
        xuLyChonDuAn(mt.du_an_id);
      }
      if (mt.nguoi_lien_he) {
        setNguoiLienHeId(mt.nguoi_lien_he_id || '');
        setTenNguoiLienHe(mt.nguoi_lien_he);
        setChucVuLienHe(mt.chuc_vu || '');
        setSdtLienHe(mt.so_dien_thoai_lien_he || '');
      }
      if (mt.xa_phuong) setXaPhuong(mt.xa_phuong);
      if (mt.khach_hang_id || mt.du_an_id || mt.nguoi_lien_he) {
        setMoRongChiTiet(true);
      }
    }
  };

  const xuLyChonKhachHang = (id: string) => {
    setKhachHangId(id);
    setMoGoiYKH(false);
    if (!id) {
      setCoQuanDoanhNghiep('');
      setTuKhoaTimKH('');
      setXaPhuong('');
      setNguoiLienHeId('');
      setTenNguoiLienHe('');
      setChucVuLienHe('');
      setSdtLienHe('');
      return;
    }
    const kh = danhSachKhachHang.find((k) => k.id === id);
    if (kh) {
      setCoQuanDoanhNghiep(kh.ten_khach_hang);
      setTuKhoaTimKH(kh.ten_khach_hang);
      const diaBan = [kh.xa_phuong, kh.tinh_thanh].filter(Boolean).join(', ');
      setXaPhuong(diaBan);

      // Tự động lấy người liên hệ đầu tiên của KH này (nếu có)
      const nlhDau = danhSachNguoiLienHe.find((n) => n.khach_hang_id === kh.id);
      if (nlhDau) {
        setNguoiLienHeId(nlhDau.id);
        setTenNguoiLienHe(nlhDau.ho_va_ten);
        setChucVuLienHe(nlhDau.chuc_vu || '');
        setSdtLienHe(nlhDau.so_dien_thoai || '');
      } else {
        setNguoiLienHeId('');
        setTenNguoiLienHe('');
        setChucVuLienHe('');
        setSdtLienHe('');
      }
    }
  };

  const xuLyChonDuAn = (daId: string) => {
    setDuAnId(daId);
    setMoGoiYDA(false);
    if (!daId) {
      setDuAnDuKien('');
      setTuKhoaTimDA('');
      return;
    }
    const da = danhSachDuAn.find((d) => d.id === daId);
    if (da) {
      setDuAnDuKien(da.ten_du_an);
      setTuKhoaTimDA(da.ten_du_an);
      if (da.khach_hang_id && da.khach_hang_id !== khachHangId) {
        xuLyChonKhachHang(da.khach_hang_id);
      }
    }
  };

  const xuLyChonNguoiLienHe = (nlh: NguoiLienHe) => {
    setNguoiLienHeId(nlh.id);
    setTenNguoiLienHe(nlh.ho_va_ten);
    setChucVuLienHe(nlh.chuc_vu || '');
    setSdtLienHe(nlh.so_dien_thoai || '');
    setMoGoiYNLH(false);
  };

  const xuLyLuu = () => {
    if (!hanhDongTuan.trim()) {
      alert('Vui lòng nhập nội dung công việc tuần.');
      return;
    }

    const tenDoiTuong = coQuanDoanhNghiep.trim();
    const tenHienThi = tenDoiTuong || hanhDongTuan.trim();

    const itemCapNhat: ItemKeHoachTuan = {
      id: dangSua?.id || `tuan_${Date.now()}`,
      muc_tieu_thang_id: mucTieuThangId || null,
      loai_hanh_dong: mucTieuThangId ? 'theo_muc_tieu' : 'phat_sinh',
      hinh_thuc: hinhThuc,
      khach_hang_id: khachHangId || null,
      du_an_id: duAnId || null,
      nguoi_lien_he_id: nguoiLienHeId || null,
      ten_khach_hang_du_an: tenHienThi,
      co_quan_doanh_nghiep: tenDoiTuong || null,
      nguoi_lien_he: tenNguoiLienHe.trim() || null,
      chuc_vu: chucVuLienHe.trim() || null,
      so_dien_thoai_lien_he: sdtLienHe.trim() || null,
      du_an_du_kien: duAnDuKien.trim() || null,
      hanh_dong_tuan: hanhDongTuan.trim(),
      noi_dung_tuan: hanhDongTuan.trim(),
      ket_qua_mong_muon: ketQuaMongMuon.trim() || hanhDongTuan.trim(),
      dau_ra_cam_ket: ketQuaMongMuon.trim() || hanhDongTuan.trim(),
      ngay_du_kien: ngayDuKien || null,
      cac_ngay_thuc_hien: ngayDuKien ? [ngayDuKien] : [],
      nguoi_ho_tro: nguoiHoTro.trim() || null,
      can_ho_tro: nguoiHoTro.trim() || null,
      xa_phuong: xaPhuong.trim() || null,
      da_hoan_thanh: dangSua?.da_hoan_thanh ?? false,
      ket_qua_thuc_te: dangSua?.ket_qua_thuc_te,
      danh_sach_ket_qua: dangSua?.danh_sach_ket_qua ?? [],
      ngay_hoan_thanh: dangSua?.ngay_hoan_thanh,
      ngay_cap_nhat_tien_do: dangSua?.ngay_cap_nhat_tien_do
    };

    onLuu(itemCapNhat);
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={dangSua ? 'Sửa Công việc Tuần' : 'Thêm Công việc Tuần'}
      kich_thuoc="md"
    >
      <div className="space-y-4 pb-4 px-1">
        {/* 1. Nội dung công việc tuần */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            1. Nội dung công việc cần làm <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={hanhDongTuan}
            onChange={(e) => setHanhDongTuan(e.target.value)}
            placeholder="VD: Gọi điện 20 khách hàng trường học / Báo giá dự án Bệnh viện B..."
            className="w-full h-10 text-sm rounded-lg border border-border bg-background px-3 font-semibold text-foreground focus:outline-hidden focus:border-primary"
            autoFocus
          />
        </div>

        {/* 2. Kết quả đầu ra kỳ vọng */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            2. Kết quả mong muốn đạt được (Tùy chọn)
          </label>
          <input
            type="text"
            value={ketQuaMongMuon}
            onChange={(e) => setKetQuaMongMuon(e.target.value)}
            placeholder="VD: Ra được 3 khách hàng tiềm năng hẹn gặp demo..."
            className="w-full h-9.5 text-xs rounded-lg border border-border bg-background px-3 font-medium text-foreground focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* 3. Lịch thực hiện: Rổ tuần (Không định ngày) hoặc Ngày cụ thể */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" />
            <span>3. Thời điểm thực hiện</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNgayDuKien('')}
              className={`h-9.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                !ngayDuKien
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background hover:bg-muted text-muted-foreground'
              }`}
            >
              <Inbox className="size-3.5" />
              <span>Để trong Rổ việc tuần (Chưa định ngày)</span>
            </button>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={ngayDuKien}
                onChange={(e) => setNgayDuKien(e.target.value)}
                className={`w-full h-9.5 rounded-lg border px-2.5 text-xs font-bold transition-all ${
                  ngayDuKien
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 4. Liên kết Mục tiêu Tháng (Nếu có) */}
        {danhSachMucTieuThang.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Target className="size-3.5 text-emerald-600" />
              <span>4. Thuộc Mục tiêu Tháng nào?</span>
            </label>
            <select
              value={mucTieuThangId}
              onChange={(e) => xuLyChonMucTieuThang(e.target.value)}
              className="w-full h-9.5 text-xs rounded-lg border border-border bg-background px-2.5 font-medium text-foreground"
            >
              <option value="">-- Việc độc lập / Không gắn mục tiêu tháng --</option>
              {danhSachMucTieuThang.map((mt) => (
                <option key={mt.id} value={mt.id}>
                  {mt.muc_tieu_thang || mt.ten_muc_tieu || mt.ten_khach_hang_du_an}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 5. Tùy chọn mở rộng: Gắn cứng Khách hàng / Dự án / Người liên hệ */}
        <div className="pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setMoRongChiTiet(!moRongChiTiet)}
            className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              Gắn cố định Khách hàng / Dự án / Người liên hệ (Tùy chọn)
              {(coQuanDoanhNghiep || duAnDuKien || tenNguoiLienHe) && (
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                  Đã gắn
                </span>
              )}
            </span>
            {moRongChiTiet ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {moRongChiTiet && (
            <div className="mt-2.5 p-3 rounded-xl bg-muted/30 border border-border/70 space-y-3">
              {/* Ô tìm chọn Khách hàng */}
              <div className="space-y-1" ref={refKH}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Khách hàng (Gõ tìm theo tên, SĐT, địa chỉ)
                  </label>
                  {(khachHangId || coQuanDoanhNghiep) && (
                    <button
                      type="button"
                      onClick={() => xuLyChonKhachHang('')}
                      className="text-[10px] font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="size-3" /> Bỏ gắn KH
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tuKhoaTimKH}
                    onFocus={() => setMoGoiYKH(true)}
                    onChange={(e) => {
                      setTuKhoaTimKH(e.target.value);
                      setCoQuanDoanhNghiep(e.target.value);
                      setKhachHangId('');
                      setMoGoiYKH(true);
                    }}
                    placeholder="Gõ tìm khách hàng trong danh bạ..."
                    className="w-full h-9 rounded-lg border border-border bg-background pl-8.5 pr-8 text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary"
                  />
                  {tuKhoaTimKH ? (
                    <button
                      type="button"
                      onClick={() => {
                        xuLyChonKhachHang('');
                        setMoGoiYKH(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="size-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}

                  {moGoiYKH && (
                    <div className="absolute z-40 left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-52 overflow-y-auto divide-y divide-border/50 p-1">
                      {dsKhachHangGoiY.length === 0 ? (
                        <div className="p-2.5 text-center text-xs text-muted-foreground">
                          Không tìm thấy khách hàng khớp từ khóa.
                        </div>
                      ) : (
                        dsKhachHangGoiY.map((kh) => {
                          const dangChon = kh.id === khachHangId;
                          return (
                            <button
                              key={kh.id}
                              type="button"
                              onClick={() => xuLyChonKhachHang(kh.id)}
                              className={cn(
                                'w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between gap-2 cursor-pointer',
                                dangChon ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {kh.ten_khach_hang}
                                </div>
                                {(kh.dia_chi || kh.xa_phuong) && (
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    {kh.dia_chi || kh.xa_phuong}
                                  </div>
                                )}
                              </div>
                              {kh.so_dien_thoai && (
                                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                  {kh.so_dien_thoai}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ô tìm chọn Dự án */}
              <div className="space-y-1" ref={refDA}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Briefcase className="size-3" /> Dự án (Gõ tìm theo tên dự án)
                  </label>
                  {(duAnId || duAnDuKien) && (
                    <button
                      type="button"
                      onClick={() => xuLyChonDuAn('')}
                      className="text-[10px] font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="size-3" /> Bỏ gắn Dự án
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tuKhoaTimDA}
                    onFocus={() => setMoGoiYDA(true)}
                    onChange={(e) => {
                      setTuKhoaTimDA(e.target.value);
                      setDuAnDuKien(e.target.value);
                      setDuAnId('');
                      setMoGoiYDA(true);
                    }}
                    placeholder="Gõ tìm dự án..."
                    className="w-full h-9 rounded-lg border border-border bg-background pl-8.5 pr-8 text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary"
                  />
                  {tuKhoaTimDA ? (
                    <button
                      type="button"
                      onClick={() => {
                        xuLyChonDuAn('');
                        setMoGoiYDA(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="size-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}

                  {moGoiYDA && (
                    <div className="absolute z-40 left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-52 overflow-y-auto divide-y divide-border/50 p-1">
                      {dsDuAnGoiY.length === 0 ? (
                        <div className="p-2.5 text-center text-xs text-muted-foreground">
                          Không tìm thấy dự án khớp từ khóa.
                        </div>
                      ) : (
                        dsDuAnGoiY.map((da) => {
                          const dangChon = da.id === duAnId;
                          const kh = da.khach_hang_id
                            ? danhSachKhachHang.find((k) => k.id === da.khach_hang_id)
                            : null;
                          return (
                            <button
                              key={da.id}
                              type="button"
                              onClick={() => xuLyChonDuAn(da.id)}
                              className={cn(
                                'w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between gap-2 cursor-pointer',
                                dangChon ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {da.ten_du_an}
                                </div>
                                {kh && (
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    KH: {kh.ten_khach_hang}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Người liên hệ & Chức vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1" ref={refNLH}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <UserRound className="size-3" /> Người liên hệ
                    </label>
                    {dsLienHeCuaKH.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMoGoiYNLH(!moGoiYNLH)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Chọn ({dsLienHeCuaKH.length} liên hệ)
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={tenNguoiLienHe}
                      onFocus={() => {
                        if (dsLienHeCuaKH.length > 0) setMoGoiYNLH(true);
                      }}
                      onChange={(e) => {
                        setTenNguoiLienHe(e.target.value);
                        setNguoiLienHeId('');
                      }}
                      placeholder={
                        dsLienHeCuaKH.length > 0
                          ? 'Chọn liên hệ hoặc nhập tên...'
                          : 'Tên người liên hệ...'
                      }
                      className="w-full h-9 rounded-lg border border-border bg-background px-2.5 pr-7 text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary"
                    />
                    {tenNguoiLienHe && (
                      <button
                        type="button"
                        onClick={() => {
                          setNguoiLienHeId('');
                          setTenNguoiLienHe('');
                          setChucVuLienHe('');
                          setSdtLienHe('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}

                    {moGoiYNLH && dsLienHeCuaKH.length > 0 && (
                      <div className="absolute z-40 left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-48 overflow-y-auto divide-y divide-border/50 p-1">
                        {dsLienHeCuaKH.map((nlh) => {
                          const dangChon =
                            (nguoiLienHeId && nguoiLienHeId === nlh.id) ||
                            tenNguoiLienHe === nlh.ho_va_ten;
                          return (
                            <button
                              key={nlh.id}
                              type="button"
                              onClick={() => xuLyChonNguoiLienHe(nlh)}
                              className={cn(
                                'w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between gap-2 cursor-pointer',
                                dangChon ? 'bg-emerald-500/10 text-emerald-900' : 'hover:bg-muted'
                              )}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {nlh.ho_va_ten}
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate">
                                  {[nlh.chuc_vu, nlh.so_dien_thoai].filter(Boolean).join(' · ') ||
                                    'Chưa có SĐT'}
                                </div>
                              </div>
                              {dangChon && <Check className="size-3.5 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Chức vụ / SĐT liên hệ
                  </label>
                  <input
                    type="text"
                    value={chucVuLienHe}
                    onChange={(e) => setChucVuLienHe(e.target.value)}
                    placeholder="VD: Hiệu trưởng / Trưởng phòng..."
                    className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Cần phối hợp / hỗ trợ
                </label>
                <input
                  type="text"
                  value={nguoiHoTro}
                  onChange={(e) => setNguoiHoTro(e.target.value)}
                  placeholder="VD: Kỹ thuật hỗ trợ demo..."
                  className="w-full h-8.5 text-xs rounded-lg border border-border bg-background px-2.5"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Nut kieu="outline" onClick={onDong}>
            Hủy
          </Nut>
          <Nut kieu="primary" icon_trai={Save} onClick={xuLyLuu}>
            {dangSua ? 'Lưu cập nhật' : 'Thêm vào kế hoạch tuần'}
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}

