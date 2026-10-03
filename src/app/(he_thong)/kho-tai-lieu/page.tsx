'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  X,
  Building2,
  User,
  Trash2,
  RotateCcw,
  Pencil,
  Copy,
  Check,
  Pin,
  FolderKanban,
  FileSpreadsheet,
  FileText,
  Presentation,
  Video,
  FileCheck,
  Globe,
  Palette,
  Loader2,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Tag,
  BookOpen,
  Eye,
  Calendar,
  Layers
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import { formatNgay } from '../../../thu_vien/utils/format_ngay';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import type {
  TaiLieuLienKet,
  TaoTaiLieuDTO,
  CapNhatTaiLieuDTO,
  LoaiLienKet
} from '../../../thu_vien/types/kho_tai_lieu';
import {
  NHAN_LOAI_LIEN_KET,
  DANH_MUC_GOI_Y
} from '../../../thu_vien/types/kho_tai_lieu';
import {
  langNgheThayDoiDanhSachTaiLieu,
  taoTaiLieuMoi,
  capNhatTaiLieu,
  xoaMemTaiLieu,
  khoiPhucTaiLieu,
  tangLuotMoTaiLieu
} from '../../../dich_vu/kho_tai_lieu/dich_vu_kho_tai_lieu';
import FormTaiLieuDrawer from '../../../thanh_phan/kho_tai_lieu/form_tai_lieu_drawer';
import {
  Bo_Cuc_Trang,
  Nut,
  DaiDien,
  ThanhSoLieu,
  KhungDanhSach,
  DanhSachTheMobile,
  TheMobile,
  NutIcon,
  Bang,
  ChuDeBang,
  ThanBang,
  HangBang,
  ODauBang,
  OBang
} from '../../../thanh_phan/ui';

type TabCheDo = 'chung' | 'rieng' | 'thung_rac';
type KieuSapXep = 'moi_nhat' | 'cu_nhat' | 'tieu_de' | 'luot_mo';

export default function TrangKhoTaiLieu() {
  const { nguoiDungHienTai } = useStoreXacThuc();
  const laAdmin =
    nguoiDungHienTai?.vai_tro === 'quan_tri_he_thong' ||
    nguoiDungHienTai?.vai_tro === 'giam_doc';

  const [tabHienTai, setTabHienTai] = useState<TabCheDo>('chung');
  const [tuKhoa, setTuKhoa] = useState('');
  const [danhMucChon, setDanhMucChon] = useState<string>('tat_ca');
  const [loaiChon, setLoaiChon] = useState<string>('tat_ca');
  const [kieuSapXep, setKieuSapXep] = useState<KieuSapXep>('moi_nhat');

  const [danhSach, setDanhSach] = useState<TaiLieuLienKet[]>([]);
  const [dangTai, setDangTai] = useState(true);

  const [moDrawer, setMoDrawer] = useState(false);
  const [dangSua, setDangSua] = useState<TaiLieuLienKet | null>(null);
  const [dangXuLyForm, setDangXuLyForm] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [daCopyId, setDaCopyId] = useState<string | null>(null);
  const [thongBaoToast, setThongBaoToast] = useState<{ id: number; msg: string; type: 'success' | 'error' } | null>(null);

  const hienToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setThongBaoToast({ id, msg, type });
    setTimeout(() => {
      setThongBaoToast((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  };

  // Lắng nghe dữ liệu realtime
  useEffect(() => {
    if (!nguoiDungHienTai?.id) {
      setDangTai(false);
      return;
    }

    setDangTai(true);
    const loc: any = {
      nguoi_dung_id: nguoiDungHienTai.id,
      trang_thai: tabHienTai === 'thung_rac' ? 'da_xoa' : 'hoat_dong'
    };

    if (tabHienTai === 'chung') {
      loc.pham_vi = 'chung';
    } else if (tabHienTai === 'rieng') {
      loc.pham_vi = 'rieng';
      loc.chi_lay_cua_toi = true;
    } else if (tabHienTai === 'thung_rac') {
      if (!laAdmin) {
        loc.chi_lay_cua_toi = true;
      }
    }

    const unsub = langNgheThayDoiDanhSachTaiLieu(
      (mang) => {
        setDanhSach(mang);
        setDangTai(false);
      },
      loc,
      (err) => {
        setDangTai(false);
        hienToast(err?.message || 'Không thể tải danh sách tài liệu', 'error');
      }
    );

    return () => unsub();
  }, [tabHienTai, nguoiDungHienTai?.id, laAdmin]);

  // Lọc và sắp xếp dữ liệu
  const danhSachDaLoc = useMemo(() => {
    const tuKhoaLower = tuKhoa.trim().toLowerCase();

    const ketQua = danhSach.filter((tl) => {
      if (danhMucChon !== 'tat_ca' && tl.danh_muc !== danhMucChon) return false;
      if (loaiChon !== 'tat_ca' && tl.loai_lien_ket !== loaiChon) return false;

      if (tuKhoaLower) {
        const tagStr = (tl.the_tags ?? []).join(' ').toLowerCase();
        const khop =
          tl.tieu_de.toLowerCase().includes(tuKhoaLower) ||
          (tl.mo_ta ?? '').toLowerCase().includes(tuKhoaLower) ||
          tl.url.toLowerCase().includes(tuKhoaLower) ||
          (tl.danh_muc ?? '').toLowerCase().includes(tuKhoaLower) ||
          (tl.ten_nguoi_tao ?? '').toLowerCase().includes(tuKhoaLower) ||
          tagStr.includes(tuKhoaLower);
        if (!khop) return false;
      }

      return true;
    });

    // Sắp xếp: Ưu tiên Ghim lên đầu, sau đó sắp xếp theo tùy chọn
    return ketQua.sort((a, b) => {
      if (a.ghim && !b.ghim) return -1;
      if (!a.ghim && b.ghim) return 1;

      if (kieuSapXep === 'cu_nhat') {
        return (a.ngay_cap_nhat ?? '').localeCompare(b.ngay_cap_nhat ?? '');
      }
      if (kieuSapXep === 'tieu_de') {
        return a.tieu_de.localeCompare(b.tieu_de, 'vi');
      }
      if (kieuSapXep === 'luot_mo') {
        return (b.luot_mo || 0) - (a.luot_mo || 0);
      }
      return (b.ngay_cap_nhat ?? '').localeCompare(a.ngay_cap_nhat ?? '');
    });
  }, [danhSach, tuKhoa, danhMucChon, loaiChon, kieuSapXep]);

  // Thống kê nhanh
  const thongKe = useMemo(() => {
    const tongSo = danhSach.length;
    const soChung = danhSach.filter((x) => x.pham_vi === 'chung').length;
    const soRieng = danhSach.filter((x) => x.pham_vi === 'rieng').length;
    const soGhim = danhSach.filter((x) => x.ghim).length;
    return { tongSo, soChung, soRieng, soGhim };
  }, [danhSach]);

  const moFormThemMoi = () => {
    setDangSua(null);
    setLoiForm(null);
    setMoDrawer(true);
  };

  useEffect(() => {
    const xuLyEvent = () => moFormThemMoi();
    window.addEventListener('ebms:kho_tai_lieu:them_moi', xuLyEvent);
    return () => window.removeEventListener('ebms:kho_tai_lieu:them_moi', xuLyEvent);
  }, []);

  const moFormSua = (tl: TaiLieuLienKet) => {
    setDangSua(tl);
    setLoiForm(null);
    setMoDrawer(true);
  };

  const xuLyLuuForm = async (dto: TaoTaiLieuDTO | CapNhatTaiLieuDTO) => {
    setDangXuLyForm(true);
    setLoiForm(null);
    try {
      if ('id' in dto) {
        await capNhatTaiLieu(dto, nguoiDungHienTai);
        hienToast('Đã cập nhật thông tin tài liệu');
      } else {
        await taoTaiLieuMoi(dto, nguoiDungHienTai);
        hienToast('Đã thêm tài liệu mới thành công');
      }
      setMoDrawer(false);
      setDangSua(null);
    } catch (err: any) {
      setLoiForm(err?.message || 'Lỗi khi lưu tài liệu');
    } finally {
      setDangXuLyForm(false);
    }
  };

  const xuLyXoa = async (tl: TaiLieuLienKet) => {
    if (!confirm(`Bạn có chắc muốn chuyển tài liệu "${tl.tieu_de}" vào thùng rác?`)) return;
    setDangXuLyId(tl.id);
    try {
      await xoaMemTaiLieu(tl.id, nguoiDungHienTai);
      hienToast('Đã chuyển tài liệu vào thùng rác');
    } catch (err: any) {
      hienToast(err?.message || 'Lỗi khi xóa', 'error');
    } finally {
      setDangXuLyId(null);
    }
  };

  const xuLyKhoiPhuc = async (tl: TaiLieuLienKet) => {
    setDangXuLyId(tl.id);
    try {
      await khoiPhucTaiLieu(tl.id, nguoiDungHienTai);
      hienToast(`Đã khôi phục tài liệu "${tl.tieu_de}"`);
    } catch (err: any) {
      hienToast(err?.message || 'Lỗi khi khôi phục', 'error');
    } finally {
      setDangXuLyId(null);
    }
  };

  const xuLyCopyLink = (e: React.MouseEvent, tl: TaiLieuLienKet) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tl.url);
    setDaCopyId(tl.id);
    hienToast('Đã sao chép liên kết vào clipboard');
    setTimeout(() => {
      setDaCopyId((prev) => (prev === tl.id ? null : prev));
    }, 2000);
  };

  const xuLyMoLink = (tl: TaiLieuLienKet) => {
    void tangLuotMoTaiLieu(tl.id);
    window.open(tl.url, '_blank', 'noopener,noreferrer');
  };

  const layIconLoaiLienKet = (loai: LoaiLienKet) => {
    switch (loai) {
      case 'google_sheets':
        return <FileSpreadsheet className="size-4 text-emerald-600 shrink-0" />;
      case 'google_docs':
        return <FileText className="size-4 text-blue-600 shrink-0" />;
      case 'google_drive':
        return <FolderKanban className="size-4 text-amber-600 shrink-0" />;
      case 'google_slides':
        return <Presentation className="size-4 text-orange-600 shrink-0" />;
      case 'figma':
        return <Palette className="size-4 text-purple-600 shrink-0" />;
      case 'canva':
        return <Sparkles className="size-4 text-cyan-600 shrink-0" />;
      case 'pdf':
        return <FileCheck className="size-4 text-rose-600 shrink-0" />;
      case 'video':
        return <Video className="size-4 text-red-600 shrink-0" />;
      default:
        return <Globe className="size-4 text-slate-600 shrink-0" />;
    }
  };

  const layDomainRutGon = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-3 sm:space-y-5">
      <ThanhSoLieu
        muc={[
          {
            khoa: 'tong',
            nhan: 'Tổng tài liệu',
            nhan_ngan: 'Tổng TL',
            gia_tri: thongKe.tongSo,
            icon: BookOpen
          },
          {
            khoa: 'chung',
            nhan: 'Kho công ty',
            nhan_ngan: 'Công ty',
            gia_tri: thongKe.soChung,
            icon: Building2,
            mau: 'thanh_cong',
            dang_chon: tabHienTai === 'chung',
            khi_bam: () => setTabHienTai('chung')
          },
          {
            khoa: 'rieng',
            nhan: 'Kho của tôi',
            nhan_ngan: 'Của tôi',
            gia_tri: thongKe.soRieng,
            icon: User,
            mau: 'thong_tin',
            dang_chon: tabHienTai === 'rieng',
            khi_bam: () => setTabHienTai('rieng')
          },
          {
            khoa: 'thung_rac',
            nhan: 'Thùng rác',
            gia_tri: tabHienTai === 'thung_rac' ? danhSach.length : 'Lưu trữ',
            icon: Trash2,
            mau: 'loi',
            dang_chon: tabHienTai === 'thung_rac',
            khi_bam: () => setTabHienTai('thung_rac')
          }
        ]}
      />

      {/* 2. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-3.5 sm:p-4 rounded-card sm:rounded-2xl border border-slate-200/80 shadow-nhe space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="size-4 pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm tài liệu theo tên, đường link, #tag, người tạo..."
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-noi-dung text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
            />
            {tuKhoa && (
              <button
                type="button"
                onClick={() => setTuKhoa('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:flex items-center gap-2">
            <select
              value={danhMucChon}
              onChange={(e) => setDanhMucChon(e.target.value)}
              aria-label="Lọc theo danh mục"
              className="w-full md:w-52 h-10 rounded-xl border border-slate-200 bg-white px-3 text-phu font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer truncate"
            >
              <option value="tat_ca">Tất cả danh mục</option>
              {DANH_MUC_GOI_Y.map((dm) => (
                <option key={dm} value={dm}>
                  {dm}
                </option>
              ))}
            </select>

            <select
              value={loaiChon}
              onChange={(e) => setLoaiChon(e.target.value)}
              aria-label="Lọc theo loại tệp"
              className="w-full md:w-48 h-10 rounded-xl border border-slate-200 bg-white px-3 text-phu font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer truncate"
            >
              <option value="tat_ca">Tất cả loại file</option>
              <option value="google_sheets">Google Sheets</option>
              <option value="google_docs">Google Docs</option>
              <option value="google_drive">Google Drive</option>
              <option value="google_slides">Google Slides</option>
              <option value="figma">Figma</option>
              <option value="canva">Canva</option>
              <option value="pdf">Tệp tin PDF</option>
              <option value="video">Video</option>
              <option value="trang_web">Trang web</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setTabHienTai('chung')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-phu font-bold transition flex items-center gap-2 cursor-pointer shrink-0',
                tabHienTai === 'chung'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Building2 className="size-3.5" />
              <span>Tài liệu công ty</span>
            </button>

            <button
              type="button"
              onClick={() => setTabHienTai('rieng')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-phu font-bold transition flex items-center gap-2 cursor-pointer shrink-0',
                tabHienTai === 'rieng'
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <User className="size-3.5" />
              <span>Kho của tôi</span>
            </button>

            <button
              type="button"
              onClick={() => setTabHienTai('thung_rac')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-phu font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0',
                tabHienTai === 'thung_rac'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-rose-600'
              )}
            >
              <Trash2 className="size-3.5" />
              <span>Thùng rác</span>
            </button>
          </div>

          <div className="text-phu text-slate-400 font-medium hidden sm:block">
            Hiển thị <span className="font-bold text-slate-700">{danhSachDaLoc.length}</span> tài liệu
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH TÀI LIỆU */}
      {dangTai ? (
        <div className="rounded-card border border-slate-200 bg-white p-12 flex items-center justify-center text-slate-400 gap-3 shadow-nhe">
          <Loader2 className="size-6 animate-spin text-emerald-600" />
          <span className="text-noi-dung font-semibold">Đang nạp danh sách tài liệu...</span>
        </div>
      ) : danhSachDaLoc.length === 0 ? (
        <div className="py-16 px-4 rounded-card border border-dashed border-slate-200 bg-white text-center flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h3 className="text-noi-dung font-bold text-slate-900">
              {tuKhoa ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào trong danh mục này'}
            </h3>
            <p className="text-phu text-slate-400 mt-0.5 max-w-sm">
              {tuKhoa
                ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc.'
                : 'Bấm nút "Thêm tài liệu" để dán đường link Google Drive, Docs, Sheets vào kho.'}
            </p>
          </div>
          {!tuKhoa && (
            <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moFormThemMoi}>
              Thêm tài liệu đầu tiên
            </Nut>
          )}
        </div>
      ) : (
        <KhungDanhSach
          tieu_de={
            tabHienTai === 'chung'
              ? 'Kho tài liệu công ty'
              : tabHienTai === 'rieng'
              ? 'Kho tài liệu của tôi'
              : 'Thùng rác tài liệu'
          }
          tieu_de_ngan={
            tabHienTai === 'chung'
              ? 'Kho công ty'
              : tabHienTai === 'rieng'
              ? 'Kho của tôi'
              : 'Thùng rác'
          }
          so_luong={danhSachDaLoc.length}
          hanh_dong={
            <>
              <select
                value={kieuSapXep}
                onChange={(e) => setKieuSapXep(e.target.value as KieuSapXep)}
                aria-label="Sắp xếp danh sách tài liệu"
                className="appearance-none text-phu font-semibold text-emerald-800 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2 pr-7 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="moi_nhat">Mới cập nhật</option>
                <option value="cu_nhat">Cũ nhất</option>
                <option value="tieu_de">Tiêu đề (A-Z)</option>
                <option value="luot_mo">Nhiều lượt mở nhất</option>
              </select>

              <Nut
                kich_thuoc="sm"
                icon_trai={Plus}
                onClick={moFormThemMoi}
                title="Thêm tài liệu"
                aria-label="Thêm tài liệu"
              >
                <span className="hidden sm:inline">Thêm tài liệu</span>
              </Nut>
            </>
          }
        >
          <div className="hidden sm:block">
            <Bang>
              <ChuDeBang>
                <HangBang className="border-slate-200/80 hover:bg-transparent">
                  <ODauBang className="w-14 px-4 text-center">STT</ODauBang>
                  <ODauBang className="min-w-[280px] px-4">Tài liệu & đường dẫn</ODauBang>
                  <ODauBang className="w-32 px-4">Phạm vi</ODauBang>
                  <ODauBang className="w-40 px-4">Danh mục</ODauBang>
                  <ODauBang className="min-w-[150px] px-4">Thẻ tags</ODauBang>
                  <ODauBang className="w-44 px-4">Người tạo</ODauBang>
                  <ODauBang className="w-24 px-4 text-center">Lượt xem</ODauBang>
                  <ODauBang className="w-32 px-4 text-right">Thao tác</ODauBang>
                </HangBang>
              </ChuDeBang>
              <ThanBang>
                {danhSachDaLoc.map((tl, index) => {
                  const laNguoiTao = tl.nguoi_tao_id === nguoiDungHienTai?.id;
                  const coQuyenSuaXoa = laNguoiTao || laAdmin;
                  const domain = layDomainRutGon(tl.url);

                  return (
                    <HangBang
                      key={tl.id}
                      className={cn(
                        'group',
                        tl.ghim && 'bg-amber-50/25',
                        tl.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/40'
                      )}
                    >
                      <OBang className="px-4 py-3.5 text-center font-semibold text-slate-400 text-phu tabular-nums">
                        {tl.ghim ? (
                          <span title="Được ghim lên đầu">
                            <Pin className="size-3.5 text-amber-500 fill-amber-500 inline-block" />
                          </span>
                        ) : (
                          index + 1
                        )}
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="size-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                            {layIconLoaiLienKet(tl.loai_lien_ket)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => xuLyMoLink(tl)}
                                title="Nhấp để mở tài liệu"
                                className="font-bold text-slate-900 text-noi-dung hover:text-emerald-700 transition-colors text-left line-clamp-1 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>{tl.tieu_de}</span>
                                <ArrowUpRight className="size-3.5 text-slate-400 group-hover:text-emerald-600 transition shrink-0" />
                              </button>
                            </div>

                            {tl.mo_ta && (
                              <p className="text-phu text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                                {tl.mo_ta}
                              </p>
                            )}

                            {domain && (
                              <div className="text-nhan text-slate-400 font-mono mt-0.5 truncate flex items-center gap-1">
                                <span>{domain}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-phu font-semibold border',
                            tl.pham_vi === 'chung'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                          )}
                        >
                          <span
                            className={cn(
                              'size-1.5 rounded-full shrink-0',
                              tl.pham_vi === 'chung' ? 'bg-emerald-500' : 'bg-indigo-500'
                            )}
                          />
                          {tl.pham_vi === 'chung' ? 'Công ty' : 'Kho riêng'}
                        </span>
                      </OBang>

                      <OBang className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-phu font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {tl.danh_muc || 'Khác'}
                        </span>
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {tl.the_tags && tl.the_tags.length > 0 ? (
                            tl.the_tags.map((tag, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setTuKhoa(tag.replace(/^#/, ''))}
                                title={`Lọc theo thẻ ${tag}`}
                                className="px-1.5 py-0.5 rounded-md text-nhan font-medium bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition cursor-pointer"
                              >
                                {tag}
                              </button>
                            ))
                          ) : (
                            <span className="text-nhan text-slate-300">Không có tag</span>
                          )}
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <DaiDien
                            anh={tl.url_anh_nguoi_tao ?? undefined}
                            ten={tl.ten_nguoi_tao || 'U'}
                            kich_thuoc="sm"
                            className="size-6 rounded-full text-nhan"
                          />
                          <div className="min-w-0">
                            <div className="text-phu font-semibold text-slate-800 truncate">
                              {tl.ten_nguoi_tao || 'Thành viên'}
                            </div>
                            <div className="text-nhan text-slate-400">
                              {formatNgay(tl.ngay_cap_nhat || tl.ngay_tao)}
                            </div>
                          </div>
                        </div>
                      </OBang>

                      <OBang className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-phu font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Eye className="size-3 text-slate-400" />
                          <span>{tl.luot_mo || 0}</span>
                        </span>
                      </OBang>

                      <OBang className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <NutIcon
                            icon={daCopyId === tl.id ? Check : Copy}
                            nhan="Sao chép liên kết"
                            sac={daCopyId === tl.id ? 'primary' : 'mac_dinh'}
                            onClick={(e) => xuLyCopyLink(e, tl)}
                          />
                          <NutIcon
                            icon={ExternalLink}
                            nhan="Mở liên kết sang tab mới"
                            sac="primary"
                            onClick={() => xuLyMoLink(tl)}
                          />

                          {tabHienTai === 'thung_rac' ? (
                            coQuyenSuaXoa && (
                              <NutIcon
                                icon={RotateCcw}
                                nhan="Khôi phục tài liệu"
                                sac="primary"
                                disabled={dangXuLyId === tl.id}
                                onClick={() => xuLyKhoiPhuc(tl)}
                              />
                            )
                          ) : (
                            <>
                              {coQuyenSuaXoa && (
                                <NutIcon
                                  icon={Pencil}
                                  nhan="Chỉnh sửa thông tin"
                                  onClick={() => moFormSua(tl)}
                                />
                              )}
                              {coQuyenSuaXoa && (
                                <NutIcon
                                  icon={Trash2}
                                  nhan="Chuyển vào thùng rác"
                                  sac="loi"
                                  disabled={dangXuLyId === tl.id}
                                  onClick={() => xuLyXoa(tl)}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </OBang>
                    </HangBang>
                  );
                })}
              </ThanBang>
            </Bang>
          </div>

          <DanhSachTheMobile>
            {danhSachDaLoc.map((tl, index) => {
              const laNguoiTao = tl.nguoi_tao_id === nguoiDungHienTai?.id;
              const coQuyenSuaXoa = laNguoiTao || laAdmin;

              return (
                <TheMobile key={tl.id} mo_di={tl.trang_thai === 'da_xoa'} className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="text-slate-400 text-nhan font-extrabold tabular-nums mt-0.5 shrink-0">
                        {tl.ghim ? (
                          <Pin className="size-3.5 text-amber-500 fill-amber-500 inline-block" />
                        ) : (
                          `${index + 1}.`
                        )}
                      </span>
                      <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {layIconLoaiLienKet(tl.loai_lien_ket)}
                      </div>
                      <button
                        type="button"
                        onClick={() => xuLyMoLink(tl)}
                        className="text-left text-noi-dung font-bold text-slate-900 hover:text-emerald-700 line-clamp-2 flex-1 min-w-0"
                      >
                        {tl.tieu_de}
                      </button>
                    </div>

                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-nhan font-bold border shrink-0',
                        tl.pham_vi === 'chung'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      )}
                    >
                      {tl.pham_vi === 'chung' ? 'Chung' : 'Riêng'}
                    </span>
                  </div>

                  {tl.mo_ta && <p className="text-phu text-slate-500 line-clamp-2">{tl.mo_ta}</p>}

                  {tl.the_tags && tl.the_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tl.the_tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-nhan font-medium bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-nhan text-slate-400">
                    <span className="truncate">{tl.ten_nguoi_tao || 'Thành viên'}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <NutIcon
                        icon={daCopyId === tl.id ? Check : Copy}
                        nhan="Sao chép liên kết"
                        sac={daCopyId === tl.id ? 'primary' : 'mac_dinh'}
                        onClick={(e) => xuLyCopyLink(e, tl)}
                      />
                      <NutIcon
                        icon={ExternalLink}
                        nhan="Mở liên kết"
                        sac="primary"
                        onClick={() => xuLyMoLink(tl)}
                      />
                      {coQuyenSuaXoa && tabHienTai !== 'thung_rac' && (
                        <>
                          <NutIcon
                            icon={Pencil}
                            nhan="Chỉnh sửa"
                            onClick={() => moFormSua(tl)}
                          />
                          <NutIcon
                            icon={Trash2}
                            nhan="Xóa"
                            sac="loi"
                            onClick={() => xuLyXoa(tl)}
                          />
                        </>
                      )}
                      {coQuyenSuaXoa && tabHienTai === 'thung_rac' && (
                        <NutIcon
                          icon={RotateCcw}
                          nhan="Khôi phục"
                          sac="primary"
                          onClick={() => xuLyKhoiPhuc(tl)}
                        />
                      )}
                    </div>
                  </div>
                </TheMobile>
              );
            })}
          </DanhSachTheMobile>
        </KhungDanhSach>
      )}

      {/* Form Modal đồng bộ */}
      <FormTaiLieuDrawer
        mo={moDrawer}
        khiDong={() => {
          setMoDrawer(false);
          setDangSua(null);
          setLoiForm(null);
        }}
        dangSua={dangSua}
        khiLuu={xuLyLuuForm}
        dangXuLy={dangXuLyForm}
        loiThongBao={loiForm}
      />

      {/* Toast thông báo */}
      {thongBaoToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={cn(
              'px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2',
              thongBaoToast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-700'
            )}
          >
            {thongBaoToast.type === 'success' ? (
              <Check className="size-4 text-emerald-400" strokeWidth={2.5} />
            ) : (
              <X className="size-4 text-white" strokeWidth={2.5} />
            )}
            <span>{thongBaoToast.msg}</span>
          </div>
        </div>
      )}
    </Bo_Cuc_Trang>
  );
}
