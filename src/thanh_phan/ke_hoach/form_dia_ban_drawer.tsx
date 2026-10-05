'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  Building2,
  Briefcase,
  Target,
  DollarSign,
  Hash,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  UserRound,
  Check
} from 'lucide-react';
import type { ItemKeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import { danhSachNguoiLienHe as taiDanhSachNguoiLienHe } from '../../dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import { Nut, Ban_Ve } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachThang | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  danhSachNguoiLienHe?: NguoiLienHe[];
  onLuu: (item: ItemKeHoachThang) => void;
}

type KieuDoLuong = 'tien' | 'so_luong' | 'dinh_tinh';

const dinhDangSoPhanNgan = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN');
};

const giaiMaSoPhanNgan = (str: string): number => {
  const numStr = str.replace(/\D/g, '');
  return numStr ? Number(numStr) : 0;
};

export default function FormDiaBanDrawer({
  mo,
  onDong,
  dangSua,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  danhSachNguoiLienHe = [],
  onLuu
}: Props) {
  const [mucTieuThang, setMucTieuThang] = useState<string>('');
  const [kieuDoLuong, setKieuDoLuong] = useState<KieuDoLuong>('tien');
  const [doanhSoText, setDoanhSoText] = useState<string>('');
  const [chiTieuText, setChiTieuText] = useState<string>('');
  const [donViTinh, setDonViTinh] = useState<string>('');

  // Tùy chọn mở rộng (Khách hàng / Dự án / Người liên hệ trọng điểm)
  const [moRongDoiTuong, setMoRongDoiTuong] = useState<boolean>(false);
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

  const [xaPhuong, setXaPhuong] = useState<string>('');
  const [nguoiHoTro, setNguoiHoTro] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');

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
      setMucTieuThang(
        dangSua.muc_tieu_thang || dangSua.ten_muc_tieu || dangSua.ten_khach_hang_du_an || ''
      );
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

      setNguoiHoTro(dangSua.nguoi_ho_tro || '');
      setGhiChu(dangSua.ghi_chu || dangSua.ghi_chu_ket_qua || '');
      setXaPhuong(dangSua.xa_phuong || '');
      setMoRongDoiTuong(
        Boolean(
          dangSua.khach_hang_id ||
            dangSua.du_an_id ||
            dangSua.co_quan_doanh_nghiep ||
            dangSua.nguoi_lien_he ||
            dangSua.nguoi_ho_tro ||
            dangSua.ghi_chu
        )
      );

      const ds =
        dangSua.doanh_so_du_kien ?? dangSua.du_kien_thu_thang_nay ?? dangSua.gia_tri_hd ?? 0;
      if (dangSua.loai_muc_tieu === 'tai_chinh' || ds > 0) {
        setKieuDoLuong('tien');
        setDoanhSoText(ds > 0 ? dinhDangSoPhanNgan(ds) : '');
        setChiTieuText('');
        setDonViTinh('');
      } else if (dangSua.chi_tieu !== undefined && dangSua.chi_tieu !== null) {
        setKieuDoLuong('so_luong');
        setChiTieuText(String(dangSua.chi_tieu));
        setDonViTinh(dangSua.don_vi_tinh || 'Khách hàng');
        setDoanhSoText('');
      } else {
        setKieuDoLuong('dinh_tinh');
        setDoanhSoText('');
        setChiTieuText('');
        setDonViTinh('');
      }
    } else {
      setMucTieuThang('');
      setKieuDoLuong('tien');
      setDoanhSoText('');
      setChiTieuText('');
      setDonViTinh('Khách hàng');
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
      setNguoiHoTro('');
      setGhiChu('');
      setXaPhuong('');
      setMoRongDoiTuong(false);
    }
    setMoGoiYKH(false);
    setMoGoiYDA(false);
    setMoGoiYNLH(false);
  }, [dangSua, mo]);

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
    if (!mucTieuThang.trim()) {
      alert('Vui lòng nhập nội dung Mục tiêu tháng.');
      return;
    }

    const tenDoiTuong = coQuanDoanhNghiep.trim();
    const tenKhachHangDuAn = tenDoiTuong || mucTieuThang.trim();

    let loaiMt: LoaiMucTieuThang = 'tai_chinh';
    let doanhSo: number | null = null;
    let chiTieu: number | undefined = undefined;
    let dvt: string | undefined = undefined;

    if (kieuDoLuong === 'tien') {
      loaiMt = 'tai_chinh';
      const val = giaiMaSoPhanNgan(doanhSoText);
      doanhSo = val > 0 ? val : null;
      chiTieu = val > 0 ? val : undefined;
      dvt = 'VNĐ';
    } else if (kieuDoLuong === 'so_luong') {
      loaiMt = 'thi_truong';
      chiTieu = chiTieuText ? Number(chiTieuText) : undefined;
      dvt = donViTinh.trim() || 'Mục tiêu';
    } else {
      loaiMt = 'khac';
    }

    const itemCapNhat: ItemKeHoachThang = {
      id: dangSua?.id || `item_${Date.now()}`,
      khach_hang_id: khachHangId || null,
      du_an_id: duAnId || null,
      nguoi_lien_he_id: nguoiLienHeId || null,
      ten_khach_hang_du_an: tenKhachHangDuAn,
      co_quan_doanh_nghiep: tenDoiTuong || null,
      nguoi_lien_he: tenNguoiLienHe.trim() || null,
      chuc_vu: chucVuLienHe.trim() || null,
      so_dien_thoai_lien_he: sdtLienHe.trim() || null,
      du_an_du_kien: duAnDuKien.trim() || null,
      muc_tieu_thang: mucTieuThang.trim(),
      ten_muc_tieu: mucTieuThang.trim(),
      doanh_so_du_kien: doanhSo,
      du_kien_thu_thang_nay: doanhSo ?? undefined,
      nguoi_ho_tro: nguoiHoTro.trim() || null,
      ghi_chu: ghiChu.trim() || null,
      xa_phuong: xaPhuong.trim() || null,
      loai_muc_tieu: loaiMt,
      chi_tieu: chiTieu,
      don_vi_tinh: dvt,
      ket_qua_thuc_te: dangSua?.ket_qua_thuc_te,
      thuc_te_thu: dangSua?.thuc_te_thu,
      ghi_chu_ket_qua: dangSua?.ghi_chu_ket_qua,
      ngay_cap_nhat_ket_qua: dangSua?.ngay_cap_nhat_ket_qua
    };

    onLuu(itemCapNhat);
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={dangSua ? 'Sửa Mục tiêu Tháng' : 'Thêm Mục tiêu Tháng'}
      kich_thuoc="md"
    >
      <div className="space-y-4 pb-4 px-1">
        {/* 1. Loại chỉ tiêu */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">1. Nhóm mục tiêu</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tien', label: 'Doanh số (VNĐ)', icon: DollarSign },
              { id: 'so_luong', label: 'Số lượng (KH/DA)', icon: Hash },
              { id: 'dinh_tinh', label: 'Mục tiêu khác', icon: CheckCircle2 }
            ].map((opt) => {
              const Icon = opt.icon;
              const daChon = kieuDoLuong === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKieuDoLuong(opt.id as KieuDoLuong)}
                  className={`h-9 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    daChon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Nội dung mục tiêu */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1">
            <Target className="size-3.5 text-primary" />
            <span>2. Nội dung mục tiêu cam kết trong tháng</span>
            <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={mucTieuThang}
            onChange={(e) => setMucTieuThang(e.target.value)}
            placeholder={
              kieuDoLuong === 'tien'
                ? 'VD: Thu hồi công nợ & chốt HĐ dự án Bệnh viện A...'
                : kieuDoLuong === 'so_luong'
                ? 'VD: Mở mới 15 khách hàng tiềm năng khối trường học...'
                : 'VD: Hoàn thiện khảo sát địa bàn phụ trách...'
            }
            className="w-full h-10 text-sm rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:border-primary font-semibold text-foreground"
            autoFocus
          />
        </div>

        {/* 3. Chỉ số đo lường */}
        {kieuDoLuong === 'tien' && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              3. Doanh số dự kiến đạt (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={doanhSoText}
                onChange={(e) => setDoanhSoText(dinhDangSoPhanNgan(e.target.value))}
                placeholder="VD: 150.000.000"
                className="w-full h-10 text-sm rounded-lg border border-border bg-background pl-3 pr-14 font-mono font-bold text-emerald-700 focus:outline-hidden focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                VNĐ
              </span>
            </div>
          </div>
        )}

        {kieuDoLuong === 'so_luong' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">3. Chỉ tiêu số lượng</label>
              <input
                type="number"
                min={1}
                value={chiTieuText}
                onChange={(e) => setChiTieuText(e.target.value)}
                placeholder="VD: 15"
                className="w-full h-10 text-sm rounded-lg border border-border bg-background px-3 font-mono font-bold text-foreground focus:outline-hidden focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Đơn vị tính</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={donViTinh}
                  onChange={(e) => setDonViTinh(e.target.value)}
                  placeholder="Khách hàng, Dự án, HĐ..."
                  className="w-full h-10 text-sm rounded-lg border border-border bg-background px-3 font-medium text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. Gắn Khách hàng / Dự án / Người liên hệ trọng điểm */}
        <div className="pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setMoRongDoiTuong(!moRongDoiTuong)}
            className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              Gắn Khách hàng / Dự án / Người liên hệ (Tùy chọn)
              {(coQuanDoanhNghiep || duAnDuKien || tenNguoiLienHe) && (
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                  Đã gắn
                </span>
              )}
            </span>
            {moRongDoiTuong ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>

          {moRongDoiTuong && (
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
                  Cần hỗ trợ / Ghi chú thêm
                </label>
                <input
                  type="text"
                  value={nguoiHoTro}
                  onChange={(e) => setNguoiHoTro(e.target.value)}
                  placeholder="VD: Cần kỹ thuật đi khảo sát cùng..."
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
            {dangSua ? 'Lưu cập nhật' : 'Thêm mục tiêu'}
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}

