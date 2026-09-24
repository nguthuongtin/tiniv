'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Building2,
  Briefcase,
  Target,
  DollarSign,
  HelpCircle,
  FileText,
  Hash,
  Sparkles,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import type { ItemKeHoachThang, LoaiMucTieuThang } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import { Nut, Ban_Ve } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachThang | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
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
  onLuu
}: Props) {
  // 1. Mục tiêu (Bắt buộc)
  const [mucTieuThang, setMucTieuThang] = useState<string>('');

  // 2. Phương thức đo lường kết quả
  const [kieuDoLuong, setKieuDoLuong] = useState<KieuDoLuong>('tien');
  const [doanhSoText, setDoanhSoText] = useState<string>('');
  const [chiTieuText, setChiTieuText] = useState<string>('');
  const [donViTinh, setDonViTinh] = useState<string>('');

  // 3. Đối tượng (Tùy chọn)
  const [khachHangId, setKhachHangId] = useState<string>('');
  const [coQuanDoanhNghiep, setCoQuanDoanhNghiep] = useState<string>('');
  const [duAnId, setDuAnId] = useState<string>('');
  const [duAnDuKien, setDuAnDuKien] = useState<string>('');
  const [xaPhuong, setXaPhuong] = useState<string>('');

  // 4. Hỗ trợ & Ghi chú
  const [nguoiHoTro, setNguoiHoTro] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');

  // Đổ dữ liệu khi mở form hoặc chuyển item đang sửa
  useEffect(() => {
    if (dangSua) {
      setMucTieuThang(dangSua.muc_tieu_thang || dangSua.ten_muc_tieu || dangSua.ten_khach_hang_du_an || '');
      setKhachHangId(dangSua.khach_hang_id || '');
      setCoQuanDoanhNghiep(dangSua.co_quan_doanh_nghiep || '');
      setDuAnId(dangSua.du_an_id || '');
      setDuAnDuKien(dangSua.du_an_du_kien || '');
      setNguoiHoTro(dangSua.nguoi_ho_tro || '');
      setGhiChu(dangSua.ghi_chu || dangSua.ghi_chu_ket_qua || '');
      setXaPhuong(dangSua.xa_phuong || '');

      // Xác định kiểu đo lường
      const ds = dangSua.doanh_so_du_kien ?? dangSua.du_kien_thu_thang_nay ?? dangSua.gia_tri_hd ?? 0;
      if (dangSua.loai_muc_tieu === 'tai_chinh' || ds > 0) {
        setKieuDoLuong('tien');
        setDoanhSoText(ds > 0 ? dinhDangSoPhanNgan(ds) : '');
        setChiTieuText('');
        setDonViTinh('');
      } else if (dangSua.chi_tieu !== undefined && dangSua.chi_tieu !== null) {
        setKieuDoLuong('so_luong');
        setChiTieuText(String(dangSua.chi_tieu));
        setDonViTinh(dangSua.don_vi_tinh || '');
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
      setDonViTinh('');
      setKhachHangId('');
      setCoQuanDoanhNghiep('');
      setDuAnId('');
      setDuAnDuKien('');
      setNguoiHoTro('');
      setGhiChu('');
      setXaPhuong('');
    }
  }, [dangSua, mo]);

  // Danh sách dự án liên quan đến khách hàng đã chọn (hoặc toàn bộ)
  const dsDuAnLoc = useMemo(() => {
    if (!khachHangId) return danhSachDuAn;
    const locTheoKh = danhSachDuAn.filter((da) => da.khach_hang_id === khachHangId);
    return locTheoKh.length > 0 ? locTheoKh : danhSachDuAn;
  }, [danhSachDuAn, khachHangId]);

  // Xử lý khi chọn Khách hàng từ dropdown
  const xuLyChonKhachHang = (id: string) => {
    setKhachHangId(id);
    if (!id) return;

    const kh = danhSachKhachHang.find((k) => k.id === id);
    if (kh) {
      setCoQuanDoanhNghiep(kh.ten_khach_hang);
      const diaBan = [kh.xa_phuong, kh.tinh_thanh].filter(Boolean).join(', ');
      setXaPhuong(diaBan);
    }
  };

  // Xử lý chọn Dự án từ dropdown
  const xuLyChonDuAn = (daId: string) => {
    setDuAnId(daId);
    if (!daId) return;
    const da = danhSachDuAn.find((d) => d.id === daId);
    if (da) {
      setDuAnDuKien(da.ten_du_an);
    }
  };

  const xuLyLuu = () => {
    if (!mucTieuThang.trim()) {
      alert('Vui lòng nhập Mục tiêu / Kết quả mong muốn trong tháng.');
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
      dvt = donViTinh.trim() || undefined;
    } else {
      loaiMt = 'khac';
    }

    const itemCapNhat: ItemKeHoachThang = {
      id: dangSua?.id || `item_${Date.now()}`,
      khach_hang_id: khachHangId || null,
      du_an_id: duAnId || null,
      ten_khach_hang_du_an: tenKhachHangDuAn,
      co_quan_doanh_nghiep: tenDoiTuong || null,
      nguoi_lien_he: null, // Kế hoạch tháng không cần người liên hệ theo yêu cầu
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
      tieu_de={dangSua ? 'Chỉnh sửa Mục tiêu Tháng' : 'Thêm Mục tiêu Tháng'}
      kich_thuoc="lg"
    >
      <div className="space-y-4 pb-6">
        {/* Phần 1: Muốn đạt gì? (Bắt buộc - Ưu tiên hàng đầu) */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground pb-1 border-b border-border/60">
            <Target className="size-4 text-emerald-600" />
            <span>1. Muốn đạt được gì trong tháng?</span>
            <span className="text-destructive">*</span>
          </div>

          <div>
            <textarea
              rows={2}
              value={mucTieuThang}
              onChange={(e) => setMucTieuThang(e.target.value)}
              placeholder="Ví dụ: Tiếp cận 12 xã phường mới để giới thiệu giải pháp, Trình duyệt hồ sơ kỹ thuật giai đoạn 1, Ký hợp đồng đợt 1..."
              className="w-full text-xs rounded-lg border border-border bg-background p-3 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>
        </div>

        {/* Phần 2: Đo lường kết quả bằng gì? */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground pb-1 border-b border-border/60">
            <Sparkles className="size-4 text-amber-600" />
            <span>2. Đo lường kết quả bằng gì?</span>
          </div>

          {/* 3 nút chọn trực quan */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tien', label: 'Tiền (VNĐ)', icon: DollarSign },
              { id: 'so_luong', label: 'Số lượng / Chỉ tiêu', icon: Hash },
              { id: 'dinh_tinh', label: 'Định tính / Tiến độ', icon: CheckCircle2 }
            ].map((opt) => {
              const Icon = opt.icon;
              const daChon = kieuDoLuong === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKieuDoLuong(opt.id as KieuDoLuong)}
                  className={`h-9 px-2 rounded-lg border text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    daChon
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Trường nhập tương ứng */}
          {kieuDoLuong === 'tien' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <DollarSign className="size-3.5 text-emerald-600" />
                Doanh số dự kiến (VNĐ)
              </label>
              <input
                type="text"
                value={doanhSoText}
                onChange={(e) => setDoanhSoText(dinhDangSoPhanNgan(e.target.value))}
                placeholder="Ví dụ: 800.000.000"
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 font-mono font-bold text-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {kieuDoLuong === 'so_luong' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Con số chỉ tiêu
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={chiTieuText}
                    onChange={(e) => setChiTieuText(e.target.value)}
                    placeholder="Ví dụ: 12"
                    className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={donViTinh}
                    onChange={(e) => setDonViTinh(e.target.value)}
                    placeholder="VD: Xã/Phường, Cuộc họp, Hồ sơ..."
                    className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Chips gợi ý đơn vị tính */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                <span className="text-muted-foreground">Gợi ý nhanh:</span>
                {['Xã/Phường', 'Cuộc họp', 'Bộ hồ sơ', 'Biên bản/MOU', 'Hợp đồng'].map((dv) => (
                  <button
                    key={dv}
                    type="button"
                    onClick={() => setDonViTinh(dv)}
                    className="px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                  >
                    + {dv}
                  </button>
                ))}
              </div>
            </div>
          )}

          {kieuDoLuong === 'dinh_tinh' && (
            <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50">
              ✓ Mục tiêu này không cần đo bằng con số cụ thể, sẽ theo dõi và đánh giá theo tiến độ thực hiện thực tế.
            </p>
          )}
        </div>

        {/* Phần 3: Với ai? (Tùy chọn) */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-1 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Building2 className="size-4 text-primary" />
              <span>3. Với ai? (Khách hàng / Cơ quan đối tác)</span>
            </div>
            <span className="text-[11px] text-muted-foreground italic">Tùy chọn</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Chọn từ danh sách KH */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Chọn từ Khách hàng có sẵn
              </label>
              <select
                value={khachHangId}
                onChange={(e) => xuLyChonKhachHang(e.target.value)}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn khách hàng --</option>
                {danhSachKhachHang.map((kh) => (
                  <option key={kh.id} value={kh.id}>
                    {kh.ten_khach_hang} {kh.tinh_thanh ? `(${kh.tinh_thanh})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Hoặc gõ tay tên Cơ quan / Khách hàng */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Tên Cơ quan / Doanh nghiệp
              </label>
              <input
                type="text"
                value={coQuanDoanhNghiep}
                onChange={(e) => setCoQuanDoanhNghiep(e.target.value)}
                placeholder="VD: UBND Xã Phú Hòa, Sở KH&ĐT..."
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Xã / Phường / Đặc khu */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground" />
                Xã/ Phường/ Đặc khu
              </label>
              <input
                type="text"
                value={xaPhuong}
                onChange={(e) => setXaPhuong(e.target.value)}
                placeholder="VD: Xã Phú Hòa, Phường 1..."
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Dự án liên quan */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Briefcase className="size-3 text-muted-foreground" />
                Dự án liên quan (Dự kiến)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <select
                  value={duAnId}
                  onChange={(e) => xuLyChonDuAn(e.target.value)}
                  className="w-full text-xs h-9 rounded-lg border border-border bg-background px-2 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Dự án có sẵn --</option>
                  {dsDuAnLoc.map((da) => (
                    <option key={da.id} value={da.id}>
                      {da.ten_du_an}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={duAnDuKien}
                  onChange={(e) => setDuAnDuKien(e.target.value)}
                  placeholder="Hoặc gõ tên..."
                  className="w-full text-xs h-9 rounded-lg border border-border bg-background px-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {!khachHangId && !coQuanDoanhNghiep.trim() && (
            <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
              💡 <em>Để trống nếu là mục tiêu chung (VD: phát triển địa bàn 12 xã, khảo sát thị trường mới, công việc nội bộ...).</em>
            </p>
          )}
        </div>

        {/* Phần 4: Ai hỗ trợ? & Ghi chú (Tùy chọn) */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <HelpCircle className="size-3.5 text-amber-600" />
                Người hỗ trợ (Tùy chọn)
              </label>
              <input
                type="text"
                value={nguoiHoTro}
                onChange={(e) => setNguoiHoTro(e.target.value)}
                placeholder="Ví dụ: Anh Tuấn PGĐ, Kỹ thuật..."
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <FileText className="size-3.5 text-muted-foreground" />
                Ghi chú (Tùy chọn)
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Ghi chú thêm nếu có..."
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Nut kieu="outline" kich_thuoc="xs" onClick={onDong}>
            Hủy bỏ
          </Nut>
          <Nut kieu="primary" kich_thuoc="xs" onClick={xuLyLuu}>
            <Save className="size-3.5" />
            Lưu mục tiêu tháng
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
