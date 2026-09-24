'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Building2,
  UserCheck,
  Briefcase,
  Target,
  Calendar,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  MapPin
} from 'lucide-react';
import type { ItemKeHoachTuan, ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import { layDanhSachNguoiLienHeTheoKhachHang } from '../../dich_vu/khach_hang/dich_vu_nguoi_lien_he';
import { Nut, Ban_Ve } from '../ui';

interface Props {
  mo: boolean;
  onDong: () => void;
  dangSua?: ItemKeHoachTuan | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  danhSachMucTieuThang?: ItemKeHoachThang[];
  onLuu: (item: ItemKeHoachTuan) => void;
}

export default function FormTacChienTuanDrawer({
  mo,
  onDong,
  dangSua,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  danhSachMucTieuThang = [],
  onLuu
}: Props) {
  // Chế độ: 'theo_muc_tieu' hoặc 'phat_sinh'
  const [loaiHanhDong, setLoaiHanhDong] = useState<'theo_muc_tieu' | 'phat_sinh'>('theo_muc_tieu');

  const [mucTieuThangId, setMucTieuThangId] = useState<string>('');
  const [khachHangId, setKhachHangId] = useState<string>('');
  const [coQuanDoanhNghiep, setCoQuanDoanhNghiep] = useState<string>('');
  const [nguoiLienHe, setNguoiLienHe] = useState<string>('');
  const [chucVu, setChucVu] = useState<string>('');
  const [duAnId, setDuAnId] = useState<string>('');
  const [duAnDuKien, setDuAnDuKien] = useState<string>('');
  const [hanhDongTuan, setHanhDongTuan] = useState<string>('');
  const [ketQuaMongMuon, setKetQuaMongMuon] = useState<string>('');
  const [ngayDuKien, setNgayDuKien] = useState<string>('');
  const [nguoiHoTro, setNguoiHoTro] = useState<string>('');
  const [xaPhuong, setXaPhuong] = useState<string>('');

  // Danh sách người liên hệ của khách hàng
  const [dsNguoiLienHe, setDsNguoiLienHe] = useState<NguoiLienHe[]>([]);

  // Đổ dữ liệu khi mở form hoặc sửa
  useEffect(() => {
    if (dangSua) {
      const mt = danhSachMucTieuThang.find((x) => x.id === dangSua.muc_tieu_thang_id);
      let khId = dangSua.khach_hang_id || mt?.khach_hang_id || '';
      if (!khId && (dangSua.co_quan_doanh_nghiep || mt?.co_quan_doanh_nghiep)) {
        const tenCQ = (dangSua.co_quan_doanh_nghiep || mt?.co_quan_doanh_nghiep || '').trim().toLowerCase();
        const khKhop = danhSachKhachHang.find(
          (k) => k.ten_khach_hang.trim().toLowerCase() === tenCQ
        );
        if (khKhop) khId = khKhop.id;
      }
      setKhachHangId(khId);

      setCoQuanDoanhNghiep(dangSua.co_quan_doanh_nghiep || dangSua.ten_khach_hang_du_an || '');
      
      const nlhRaw = dangSua.nguoi_lien_he || '';
      let ten = nlhRaw;
      let cv = dangSua.chuc_vu || '';
      if (!cv && nlhRaw.includes('_')) {
        const parts = nlhRaw.split('_');
        ten = parts[0];
        cv = parts.slice(1).join('_');
      }
      setNguoiLienHe(ten);
      setChucVu(cv);

      setDuAnId(dangSua.du_an_id || '');
      setDuAnDuKien(dangSua.du_an_du_kien || '');
      setHanhDongTuan(dangSua.hanh_dong_tuan || dangSua.noi_dung_tuan || '');
      setKetQuaMongMuon(dangSua.ket_qua_mong_muon || dangSua.dau_ra_cam_ket || '');
      setNgayDuKien(dangSua.ngay_du_kien || '');
      setNguoiHoTro(dangSua.nguoi_ho_tro || dangSua.can_ho_tro || '');
      setXaPhuong(dangSua.xa_phuong || '');
    } else {
      // Mặc định: nếu có mục tiêu tháng thì chọn mục tiêu tháng đầu tiên
      const coMucTieu = danhSachMucTieuThang.length > 0;
      setLoaiHanhDong(coMucTieu ? 'theo_muc_tieu' : 'phat_sinh');
      if (coMucTieu) {
        const mtDau = danhSachMucTieuThang[0];
        setMucTieuThangId(mtDau.id);
        setCoQuanDoanhNghiep(mtDau.co_quan_doanh_nghiep || mtDau.ten_khach_hang_du_an || '');
        
        const nlhRaw = mtDau.nguoi_lien_he || '';
        let ten = nlhRaw;
        let cv = '';
        if (nlhRaw.includes('_')) {
          const parts = nlhRaw.split('_');
          ten = parts[0];
          cv = parts.slice(1).join('_');
        }
        setNguoiLienHe(ten);
        setChucVu(cv);

        setDuAnDuKien(mtDau.du_an_du_kien || '');
        setDuAnId(mtDau.du_an_id || '');

        let khId = mtDau.khach_hang_id || '';
        if (!khId && mtDau.co_quan_doanh_nghiep) {
          const tenCQ = mtDau.co_quan_doanh_nghiep.trim().toLowerCase();
          const khKhop = danhSachKhachHang.find(
            (k) => k.ten_khach_hang.trim().toLowerCase() === tenCQ
          );
          if (khKhop) khId = khKhop.id;
        }
        setKhachHangId(khId);
        setXaPhuong(mtDau.xa_phuong || '');
      } else {
        setMucTieuThangId('');
        setCoQuanDoanhNghiep('');
        setNguoiLienHe('');
        setChucVu('');
        setDuAnDuKien('');
        setDuAnId('');
        setKhachHangId('');
        setXaPhuong('');
      }
      setHanhDongTuan('');
      setKetQuaMongMuon('');
      setNgayDuKien('');
      setNguoiHoTro('');
      setDsNguoiLienHe([]);
    }
  }, [dangSua, mo, danhSachMucTieuThang, danhSachKhachHang]);

  // Load danh sách người liên hệ khi chọn khách hàng
  useEffect(() => {
    if (!khachHangId) {
      setDsNguoiLienHe([]);
      return;
    }
    void (async () => {
      try {
        const contacts = await layDanhSachNguoiLienHeTheoKhachHang(khachHangId);
        setDsNguoiLienHe(contacts);
      } catch (err) {
        console.error('Lỗi lấy liên hệ:', err);
      }
    })();
  }, [khachHangId]);

  // Mục tiêu tháng đang chọn
  const mucTieuHienTai = useMemo(() => {
    return danhSachMucTieuThang.find((mt) => mt.id === mucTieuThangId);
  }, [danhSachMucTieuThang, mucTieuThangId]);

  // Xử lý khi chọn Mục tiêu tháng
  const xuLyChonMucTieuThang = (mtId: string) => {
    setMucTieuThangId(mtId);
    if (!mtId) {
      setKhachHangId('');
      return;
    }

    const mt = danhSachMucTieuThang.find((x) => x.id === mtId);
    if (mt) {
      setCoQuanDoanhNghiep(mt.co_quan_doanh_nghiep || mt.ten_khach_hang_du_an || '');
      setDuAnDuKien(mt.du_an_du_kien || '');
      setDuAnId(mt.du_an_id || '');

      let khId = mt.khach_hang_id || '';
      if (!khId && mt.co_quan_doanh_nghiep) {
        const tenCQ = mt.co_quan_doanh_nghiep.trim().toLowerCase();
        const khKhop = danhSachKhachHang.find(
          (k) => k.ten_khach_hang.trim().toLowerCase() === tenCQ
        );
        if (khKhop) khId = khKhop.id;
      }
      setKhachHangId(khId);

      if (mt.xa_phuong) {
        setXaPhuong(mt.xa_phuong);
      } else if (khId) {
        const kh = danhSachKhachHang.find((k) => k.id === khId);
        if (kh) {
          const diaBan = [kh.xa_phuong, kh.tinh_thanh].filter(Boolean).join(', ');
          setXaPhuong(diaBan);
        }
      } else {
        setXaPhuong('');
      }

      if (mt.nguoi_lien_he) {
        const nlhRaw = mt.nguoi_lien_he;
        if (nlhRaw.includes('_')) {
          const parts = nlhRaw.split('_');
          setNguoiLienHe(parts[0]);
          setChucVu(parts.slice(1).join('_'));
        } else {
          setNguoiLienHe(nlhRaw);
        }
      } else {
        setNguoiLienHe('');
        setChucVu('');
      }
    }
  };

  // Xử lý khi chọn Khách hàng (dành cho việc phát sinh)
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

  const xuLyLuu = () => {
    if (!hanhDongTuan.trim()) {
      alert('Vui lòng nhập Kế hoạch / Hành động trong tuần.');
      return;
    }

    const tenDoiTuong = coQuanDoanhNghiep.trim();
    const tenHienThi = tenDoiTuong || hanhDongTuan.trim();

    const itemCapNhat: ItemKeHoachTuan = {
      id: dangSua?.id || `item_tuan_${Date.now()}`,
      muc_tieu_thang_id: loaiHanhDong === 'theo_muc_tieu' ? (mucTieuThangId || null) : null,
      loai_hanh_dong: loaiHanhDong,
      khach_hang_id: khachHangId || null,
      du_an_id: duAnId || null,
      ten_khach_hang_du_an: tenHienThi,
      co_quan_doanh_nghiep: tenDoiTuong || null,
      nguoi_lien_he: nguoiLienHe.trim() || null,
      chuc_vu: chucVu.trim() || null,
      du_an_du_kien: duAnDuKien.trim() || null,
      hanh_dong_tuan: hanhDongTuan.trim(),
      noi_dung_tuan: hanhDongTuan.trim(),
      ket_qua_mong_muon: ketQuaMongMuon.trim() || null,
      dau_ra_cam_ket: ketQuaMongMuon.trim() || hanhDongTuan.trim(),
      ngay_du_kien: ngayDuKien || null,
      nguoi_ho_tro: nguoiHoTro.trim() || null,
      can_ho_tro: nguoiHoTro.trim() || null,
      xa_phuong: xaPhuong.trim() || null,
      da_hoan_thanh: dangSua?.da_hoan_thanh || false,
      ngay_hoan_thanh: dangSua?.ngay_hoan_thanh,
      ket_qua_thuc_te: dangSua?.ket_qua_thuc_te,
      danh_sach_ket_qua: dangSua?.danh_sach_ket_qua
    };

    onLuu(itemCapNhat);
    onDong();
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de={dangSua ? 'Chỉnh sửa Kế hoạch Tuần' : 'Thêm Kế hoạch Tuần'}
      kich_thuoc="lg"
    >
      <div className="space-y-4 pb-6">
        {/* Toggle Luồng: Theo mục tiêu tháng VS Việc phát sinh */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/60 border border-border/80">
          <button
            type="button"
            onClick={() => setLoaiHanhDong('theo_muc_tieu')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              loaiHanhDong === 'theo_muc_tieu'
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-3.5" />
            <span>Theo Mục tiêu Tháng</span>
            {danhSachMucTieuThang.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                {danhSachMucTieuThang.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setLoaiHanhDong('phat_sinh')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              loaiHanhDong === 'phat_sinh'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>Việc Phát sinh / Khác</span>
          </button>
        </div>

        {/* LUỒNG 1: THEO MỤC TIÊU THÁNG */}
        {loaiHanhDong === 'theo_muc_tieu' ? (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-primary border-b border-primary/20 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Target className="size-4" />
                Gắn với Mục tiêu tháng
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Tự động điền Cơ quan, Liên hệ, Dự án
              </span>
            </div>

            {danhSachMucTieuThang.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground bg-background rounded-lg border border-border">
                Chưa có mục tiêu tháng nào được lập. Hãy chuyển sang &quot;Việc phát sinh&quot; hoặc tạo mục tiêu tháng trước.
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Chọn Mục tiêu tháng <span className="text-destructive">*</span>
                </label>
                <select
                  value={mucTieuThangId}
                  onChange={(e) => xuLyChonMucTieuThang(e.target.value)}
                  className="w-full text-xs h-9.5 rounded-lg border border-border bg-background px-3 font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Chọn mục tiêu tháng cần thực hiện hành động --</option>
                  {danhSachMucTieuThang.map((mt, idx) => (
                    <option key={mt.id || idx} value={mt.id}>
                      {mt.muc_tieu_thang || mt.ten_muc_tieu || 'Mục tiêu'} {mt.co_quan_doanh_nghiep ? `— (${mt.co_quan_doanh_nghiep})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Thẻ tóm tắt mục tiêu tháng đã chọn */}
            {mucTieuHienTai && (
              <div className="p-3 rounded-lg bg-background border border-primary/20 text-xs space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Target className="size-3.5 text-emerald-600 shrink-0" />
                    <span>{mucTieuHienTai.muc_tieu_thang || mucTieuHienTai.ten_muc_tieu}</span>
                  </span>
                  {mucTieuHienTai.doanh_so_du_kien ? (
                    <span className="font-mono font-bold text-emerald-600 text-[11px] shrink-0">
                      {mucTieuHienTai.doanh_so_du_kien.toLocaleString('vi-VN')} đ
                    </span>
                  ) : mucTieuHienTai.chi_tieu ? (
                    <span className="font-mono font-bold text-primary text-[11px] shrink-0">
                      {mucTieuHienTai.chi_tieu} {mucTieuHienTai.don_vi_tinh || ''}
                    </span>
                  ) : null}
                </div>

                {mucTieuHienTai.co_quan_doanh_nghiep && (
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                    <Building2 className="size-3 text-muted-foreground shrink-0" />
                    <span>{mucTieuHienTai.co_quan_doanh_nghiep}</span>
                  </div>
                )}

                {mucTieuHienTai.du_an_du_kien && (
                  <div className="text-[11px] text-foreground font-medium flex items-center gap-1">
                    <Briefcase className="size-3 text-muted-foreground shrink-0" />
                    <span>{mucTieuHienTai.du_an_du_kien}</span>
                  </div>
                )}
              </div>
            )}

            {/* Danh sách người liên hệ của khách hàng (nếu có) */}
            {dsNguoiLienHe.length > 0 && (
              <div className="p-2.5 rounded-lg bg-background border border-primary/20 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <UserCheck className="size-3.5 text-primary" />
                    Người liên hệ của khách hàng ({dsNguoiLienHe.length})
                  </span>
                  <span className="text-[10px] text-muted-foreground italic">Bấm để chọn nhanh</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dsNguoiLienHe.map((nlh) => (
                    <button
                      key={nlh.id}
                      type="button"
                      onClick={() => {
                        setNguoiLienHe(nlh.ho_va_ten);
                        if (nlh.chuc_vu) setChucVu(nlh.chuc_vu);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-muted/60 border border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-medium transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      + {nlh.ho_va_ten} {nlh.chuc_vu ? `(${nlh.chuc_vu})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Địa bàn, Người liên hệ & Chức vụ tuần này */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-primary/20">
              <div>
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                  <MapPin className="size-3 text-muted-foreground" />
                  Xã/ Phường/ Đặc khu
                </label>
                <input
                  type="text"
                  value={xaPhuong}
                  onChange={(e) => setXaPhuong(e.target.value)}
                  placeholder="VD: Xã Phú Hòa..."
                  className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground flex items-center gap-1 mb-1">
                  <UserCheck className="size-3 text-muted-foreground" />
                  Người liên hệ
                </label>
                <input
                  type="text"
                  value={nguoiLienHe}
                  onChange={(e) => setNguoiLienHe(e.target.value)}
                  placeholder="VD: Chị Giang, Anh Đào..."
                  className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground mb-1 block">
                  Chức vụ
                </label>
                <input
                  type="text"
                  value={chucVu}
                  onChange={(e) => setChucVu(e.target.value)}
                  placeholder="VD: Chủ tịch, Trưởng phòng..."
                  className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        ) : (
          /* LUỒNG 2: VIỆC PHÁT SINH */
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground pb-1 border-b border-border/60">
              <Building2 className="size-4 text-foreground" />
              <span>Đối tượng & Khách hàng phát sinh</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Khách hàng có sẵn (Tùy chọn)
              </label>
              <select
                value={khachHangId}
                onChange={(e) => xuLyChonKhachHang(e.target.value)}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn khách hàng từ danh mục (hoặc gõ tay bên dưới) --</option>
                {danhSachKhachHang.map((kh) => (
                  <option key={kh.id} value={kh.id}>
                    {kh.ten_khach_hang} {kh.tinh_thanh ? `(${kh.tinh_thanh})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Cơ quan / Doanh nghiệp <span className="text-[11px] text-muted-foreground font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={coQuanDoanhNghiep}
                  onChange={(e) => setCoQuanDoanhNghiep(e.target.value)}
                  placeholder="UBND Xã..., Công ty... (để trống nếu là việc nội bộ/chung)"
                  className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Xã/ Phường/ Đặc khu <span className="text-[11px] text-muted-foreground font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={xaPhuong}
                  onChange={(e) => setXaPhuong(e.target.value)}
                  placeholder="VD: Xã Phú Hòa, Phường 1..."
                  className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Tách biệt Người liên hệ & Chức vụ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <UserCheck className="size-3.5 text-muted-foreground" />
                  Người liên hệ & Chức vụ (Tùy chọn)
                </label>
                {dsNguoiLienHe.length > 0 && (
                  <span className="text-[10px] text-primary font-bold">
                    Liên hệ sẵn có ({dsNguoiLienHe.length})
                  </span>
                )}
              </div>

              {dsNguoiLienHe.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/50">
                  {dsNguoiLienHe.map((nlh) => (
                    <button
                      key={nlh.id}
                      type="button"
                      onClick={() => {
                        setNguoiLienHe(nlh.ho_va_ten);
                        if (nlh.chuc_vu) setChucVu(nlh.chuc_vu);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-background border border-border hover:border-primary text-foreground hover:text-primary transition-colors shadow-2xs"
                    >
                      + {nlh.ho_va_ten} {nlh.chuc_vu ? `(${nlh.chuc_vu})` : ''}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={nguoiLienHe}
                    onChange={(e) => setNguoiLienHe(e.target.value)}
                    placeholder="Tên: Chị Giang, Anh Đào..."
                    className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={chucVu}
                    onChange={(e) => setChucVu(e.target.value)}
                    placeholder="Chức vụ: Chủ tịch, Trưởng phòng..."
                    className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Briefcase className="size-3.5 text-muted-foreground" />
                Dự án (Dự kiến)
              </label>
              <input
                type="text"
                value={duAnDuKien}
                onChange={(e) => setDuAnDuKien(e.target.value)}
                placeholder="Tên dự án hoặc nội dung công việc..."
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* NỘI DUNG HÀNH ĐỘNG TRONG TUẦN */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground pb-1 border-b border-border/60">
            <ArrowRight className="size-4 text-primary" />
            <span>Kế hoạch hành động tuần</span>
          </div>

          {/* Kế hoạch / Hành động */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Kế hoạch / Hành động trong tuần <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              value={hanhDongTuan}
              onChange={(e) => setHanhDongTuan(e.target.value)}
              placeholder="Ví dụ: Gặp Chị Giang để hâm nóng tình cảm, thống nhất lịch demo..."
              className="w-full text-xs rounded-lg border border-border bg-background p-2.5 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>

          {/* Kết quả mong muốn */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Kết quả mong muốn <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              value={ketQuaMongMuon}
              onChange={(e) => setKetQuaMongMuon(e.target.value)}
              placeholder="Ví dụ: Hâm được tình cảm, chốt được lịch demo thứ 4..."
              className="w-full text-xs rounded-lg border border-border bg-background p-2.5 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Ngày dự kiến & Người hỗ trợ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" />
                Ngày dự kiến
              </label>
              <input
                type="date"
                value={ngayDuKien}
                onChange={(e) => setNgayDuKien(e.target.value)}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 focus:outline-hidden focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <HelpCircle className="size-3.5 text-amber-600" />
                Người hỗ trợ
              </label>
              <input
                type="text"
                value={nguoiHoTro}
                onChange={(e) => setNguoiHoTro(e.target.value)}
                placeholder="Anh Tuấn PGĐ, Kỹ thuật..."
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
            Lưu kế hoạch tuần
          </Nut>
        </div>
      </div>
    </Ban_Ve>
  );
}
