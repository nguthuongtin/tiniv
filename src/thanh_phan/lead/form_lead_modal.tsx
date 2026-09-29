'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Plus,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronDown,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import type { Lead, NguonLead, TrangThaiLead } from '../../thu_vien/types/lead';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { TaoMoiLeadDTO, CapNhatLeadDTO } from '../../dich_vu/lead/dich_vu_lead';
import { ModalHuongDanDatTen } from '../chung/modal_huong_dan_dat_ten';
import { Nut, Ban_Ve } from '../ui';
import { cn } from '../../thu_vien/utils/cn';

const DANH_SACH_NGUON: { key: NguonLead; nhan: string }[] = [
  { key: 'facebook', nhan: 'Facebook' },
  { key: 'zalo', nhan: 'Zalo' },
  { key: 'gioi_thieu', nhan: 'Người quen giới thiệu' },
  { key: 'cold_call', nhan: 'Gọi điện trực tiếp' },
  { key: 'website', nhan: 'Website công ty' },
  { key: 'su_kien', nhan: 'Sự kiện / Hội thảo' },
  { key: 'khac', nhan: 'Khác' }
];

const DANH_SACH_TRANG_THAI: { key: TrangThaiLead; nhan: string }[] = [
  { key: 'moi_tiep_can', nhan: 'Mới tiếp cận' },
  { key: 'da_lien_he', nhan: 'Đã liên hệ' },
  { key: 'da_hen_gap', nhan: 'Đã hẹn gặp' },
  { key: 'da_chuyen_doi', nhan: 'Đã lên Dự án' },
  { key: 'that_bai', nhan: 'Thất bại' }
];

interface FormLeadModalProps {
  mo: boolean;
  khi_dong: () => void;
  dang_sua: Lead | null;
  dsKhachHang: KhachHang[];
  dsNguoiLienHe: NguoiLienHe[];
  dsNhanSu: NhanSu[];
  nguoiDungId?: string;
  onMoModalTaoKH: () => void;
  khi_luu: (dto: TaoMoiLeadDTO | CapNhatLeadDTO) => Promise<void> | void;
  dang_xu_ly?: boolean;
}

export default function FormLeadModal({
  mo,
  khi_dong,
  dang_sua,
  dsKhachHang,
  dsNguoiLienHe,
  dsNhanSu,
  nguoiDungId,
  onMoModalTaoKH,
  khi_luu,
  dang_xu_ly = false
}: FormLeadModalProps) {
  // Form fields
  const [khachHangId, setKhachHangId] = useState<string>('');
  const [nguoiLienHeId, setNguoiLienHeId] = useState<string>('');
  const [tenNguoiLienHe, setTenNguoiLienHe] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [nguon, setNguon] = useState<NguonLead>('zalo');
  const [trangThai, setTrangThai] = useState<TrangThaiLead>('moi_tiep_can');
  const [ngayHenLai, setNgayHenLai] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<string>('');
  const [lyDoThatBai, setLyDoThatBai] = useState<string>('');
  const [nguoiPhuTrachId, setNguoiPhuTrachId] = useState<string>('');

  // Search autocomplete state
  const [tuKhoaKH, setTuKhoaKH] = useState('');
  const [moDropdownKH, setMoDropdownKH] = useState(false);
  const [moModalQuyChuan, setMoModalQuyChuan] = useState(false);
  const [loiValidation, setLoiValidation] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize or reset form
  useEffect(() => {
    if (!mo) return;
    setLoiValidation(null);
    if (dang_sua) {
      setKhachHangId(dang_sua.khach_hang_id || '');
      setNguoiLienHeId(dang_sua.nguoi_lien_he_id || '');
      setTenNguoiLienHe(dang_sua.ten_nguoi_lien_he || '');
      setSoDienThoai(dang_sua.so_dien_thoai || '');
      setEmail(dang_sua.email || '');
      setNguon((dang_sua.nguon as NguonLead) || 'zalo');
      setTrangThai(dang_sua.trang_thai || 'moi_tiep_can');
      setNgayHenLai(dang_sua.ngay_hen_lai || '');
      setGhiChu(dang_sua.ghi_chu || '');
      setLyDoThatBai(dang_sua.ly_do_that_bai || '');
      setNguoiPhuTrachId(dang_sua.nguoi_phu_trach_id || nguoiDungId || '');
      setTuKhoaKH(dang_sua.ten_khach_hang || '');
    } else {
      setKhachHangId('');
      setNguoiLienHeId('');
      setTenNguoiLienHe('');
      setSoDienThoai('');
      setEmail('');
      setNguon('zalo');
      setTrangThai('moi_tiep_can');
      setNgayHenLai('');
      setGhiChu('');
      setLyDoThatBai('');
      setNguoiPhuTrachId(nguoiDungId || '');
      setTuKhoaKH('');
    }
  }, [mo, dang_sua, nguoiDungId]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoDropdownKH(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter KH list by keyword
  const danhSachLocKH = useMemo(() => {
    const kw = tuKhoaKH.trim().toLowerCase();
    if (!kw) return dsKhachHang.slice(0, 10);
    return dsKhachHang
      .filter(
        kh =>
          kh.ten_khach_hang.toLowerCase().includes(kw) ||
          (kh.so_dien_thoai && kh.so_dien_thoai.includes(kw))
      )
      .slice(0, 10);
  }, [dsKhachHang, tuKhoaKH]);

  // When customer changes, populate contact list
  const dsLienHeCuaKhach = useMemo(() => {
    if (!khachHangId) return [];
    return dsNguoiLienHe.filter(nlh => nlh.khach_hang_id === khachHangId);
  }, [dsNguoiLienHe, khachHangId]);

  const chonKhachHang = (kh: KhachHang) => {
    setKhachHangId(kh.id);
    setTuKhoaKH(kh.ten_khach_hang);
    setMoDropdownKH(false);
    setLoiValidation(null);

    // Auto-fill from first contact if available
    const contacts = dsNguoiLienHe.filter(x => x.khach_hang_id === kh.id);
    if (contacts.length > 0) {
      const c = contacts[0];
      setNguoiLienHeId(c.id);
      setTenNguoiLienHe(c.ho_va_ten || '');
      setSoDienThoai(c.so_dien_thoai || kh.so_dien_thoai || '');
      setEmail(c.email || kh.email || '');
    } else {
      setNguoiLienHeId('');
      setSoDienThoai(kh.so_dien_thoai || '');
      setEmail(kh.email || '');
    }
  };

  const chonNguoiLienHe = (nlhId: string) => {
    setNguoiLienHeId(nlhId);
    const c = dsLienHeCuaKhach.find(x => x.id === nlhId);
    if (c) {
      setTenNguoiLienHe(c.ho_va_ten);
      if (c.so_dien_thoai) setSoDienThoai(c.so_dien_thoai);
      if (c.email) setEmail(c.email);
    }
  };

  const handleLuu = async () => {
    if (!khachHangId) {
      setLoiValidation('Vui lòng chọn hoặc tạo mới Khách hàng để liên kết Lead.');
      return;
    }
    const khSelected = dsKhachHang.find(x => x.id === khachHangId);
    const tenKH = khSelected ? khSelected.ten_khach_hang : tuKhoaKH;

    const dto: TaoMoiLeadDTO = {
      khach_hang_id: khachHangId,
      nguoi_lien_he_id: nguoiLienHeId || null,
      ten_khach_hang: tenKH,
      ten_nguoi_lien_he: tenNguoiLienHe.trim() || null,
      so_dien_thoai: soDienThoai.trim() || null,
      email: email.trim() || null,
      nguon,
      trang_thai: trangThai,
      ngay_hen_lai: ngayHenLai || null,
      ghi_chu: ghiChu.trim() || null,
      ly_do_that_bai: trangThai === 'that_bai' ? lyDoThatBai.trim() || 'Không có nhu cầu' : null,
      nguoi_phu_trach_id: nguoiPhuTrachId || nguoiDungId || '',
      chi_nhanh_id: khSelected?.chi_nhanh_id || null,
      nguoi_tao_id: dang_sua ? dang_sua.nguoi_tao_id : nguoiDungId || ''
    };

    await khi_luu(dto);
  };

  if (!mo) return null;

  return (
    <>
      <Ban_Ve mo={mo} onDong={khi_dong} kich_thuoc="lg">
        <div className="flex flex-col h-full bg-white text-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {dang_sua ? 'Cập nhật Lead' : 'Thêm Lead mới'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi liên hệ giai đoạn tiếp cận ban đầu trước khi hình thành dự án
                </p>
              </div>
            </div>
            <button
              onClick={khi_dong}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loiValidation && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <span>{loiValidation}</span>
              </div>
            )}

            {/* Khách hàng selector (Search or create) */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-blue-600" />
                  Khách hàng liên kết <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMoModalQuyChuan(true)}
                    className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <HelpCircle className="size-3" />
                    Cách đặt tên chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={onMoModalTaoKH}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                  >
                    <Plus className="size-3.5" />
                    + Tạo KH mới
                  </button>
                </div>
              </div>

              {/* Input search autocomplete */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={tuKhoaKH}
                    onChange={e => {
                      setTuKhoaKH(e.target.value);
                      setMoDropdownKH(true);
                      if (khachHangId) setKhachHangId('');
                    }}
                    onFocus={() => setMoDropdownKH(true)}
                    placeholder="Gõ để tìm kiếm KH có sẵn..."
                    className={cn(
                      'w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition',
                      khachHangId && 'border-green-500 bg-green-50/20 text-slate-900 font-medium'
                    )}
                  />
                  {khachHangId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                      <Check className="size-4" />
                    </span>
                  )}
                </div>

                {/* Dropdown list */}
                {moDropdownKH && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {danhSachLocKH.length > 0 ? (
                      danhSachLocKH.map(kh => (
                        <button
                          key={kh.id}
                          type="button"
                          onClick={() => chonKhachHang(kh)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 hover:bg-blue-50/60 transition flex items-center justify-between',
                            kh.id === khachHangId && 'bg-blue-50'
                          )}
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">
                              {kh.ten_khach_hang}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {kh.so_dien_thoai || 'Chưa có SĐT'} {kh.dia_chi ? `• ${kh.dia_chi}` : ''}
                            </p>
                          </div>
                          {kh.id === khachHangId && (
                            <Check className="size-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 mb-2">
                          Không tìm thấy khách hàng nào khớp &ldquo;{tuKhoaKH}&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMoDropdownKH(false);
                            onMoModalTaoKH();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <Plus className="size-3.5" />
                          Tạo ngay khách hàng mới
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Người liên hệ & SĐT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="size-3.5 text-slate-500" />
                  Người liên hệ
                </label>
                {dsLienHeCuaKhach.length > 0 ? (
                  <select
                    value={nguoiLienHeId}
                    onChange={e => chonNguoiLienHe(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="">-- Chọn hoặc nhập tay bên dưới --</option>
                    {dsLienHeCuaKhach.map(nlh => (
                      <option key={nlh.id} value={nlh.id}>
                        {nlh.ho_va_ten} {nlh.chuc_vu ? `(${nlh.chuc_vu})` : ''} - {nlh.so_dien_thoai || ''}
                      </option>
                    ))}
                  </select>
                ) : null}
                <input
                  type="text"
                  value={tenNguoiLienHe}
                  onChange={e => setTenNguoiLienHe(e.target.value)}
                  placeholder="Họ tên người liên hệ..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-500" />
                  Số điện thoại / Zalo
                </label>
                <input
                  type="text"
                  value={soDienThoai}
                  onChange={e => setSoDienThoai(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Email & Nguồn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-500" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nguồn tiếp cận</label>
                <select
                  value={nguon}
                  onChange={e => setNguon(e.target.value as NguonLead)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {DANH_SACH_NGUON.map(n => (
                    <option key={n.key} value={n.key}>
                      {n.nhan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trạng thái & Ngày hẹn lại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Trạng thái bám sát</label>
                <select
                  value={trangThai}
                  onChange={e => setTrangThai(e.target.value as TrangThaiLead)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                >
                  {DANH_SACH_TRANG_THAI.map(tt => (
                    <option key={tt.key} value={tt.key}>
                      {tt.nhan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-blue-600" />
                  Ngày giờ hẹn liên hệ lại
                </label>
                <input
                  type="date"
                  value={ngayHenLai}
                  onChange={e => setNgayHenLai(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Nhân viên phụ trách */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nhân viên phụ trách</label>
              <select
                value={nguoiPhuTrachId}
                onChange={e => setNguoiPhuTrachId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">-- Chọn nhân viên --</option>
                {dsNhanSu.map(ns => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} ({ns.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Thất bại lý do (nếu chọn thất bại) */}
            {trangThai === 'that_bai' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="text-xs font-semibold text-red-600">Lý do không khả thi</label>
                <input
                  type="text"
                  value={lyDoThatBai}
                  onChange={e => setLyDoThatBai(e.target.value)}
                  placeholder="VD: Không đúng nhu cầu, chi phí cao, đã chọn đơn vị khác..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-red-200 bg-red-50/30 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>
            )}

            {/* Ghi chú nhanh */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Ghi chú diễn biến liên hệ
              </label>
              <textarea
                rows={3}
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
                placeholder="VD: KH đang phân vân giữa 2 giải pháp, hẹn thứ 5 gọi lại xác nhận thời gian khảo sát thực tế..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
            <Nut kieu="outline" kich_thuoc="sm" onClick={khi_dong} disabled={dang_xu_ly}>
              Hủy
            </Nut>
            <Nut
              kieu="primary"
              kich_thuoc="sm"
              onClick={handleLuu}
              disabled={dang_xu_ly}
              className="bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            >
              {dang_xu_ly ? 'Đang lưu...' : dang_sua ? 'Cập nhật Lead' : 'Lưu Lead'}
            </Nut>
          </div>
        </div>
      </Ban_Ve>

      {/* Modal hướng dẫn đặt tên KH */}
      <ModalHuongDanDatTen
        mo={moModalQuyChuan}
        onDong={() => setMoModalQuyChuan(false)}
        loaiMacDinh="khach_hang"
        onChonMau={mau => {
          setTuKhoaKH(mau);
          setMoDropdownKH(true);
        }}
      />
    </>
  );
}
