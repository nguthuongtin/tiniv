'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Users,
  Briefcase,
  PhoneCall,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Paperclip,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Send,
  Check,
  Building2,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertTriangle,
  FolderKanban,
  Clock,
  Handshake,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import type { TienDoDuAn } from '../../thu_vien/types/du_an';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import { DANH_SACH_TRANG_THAI_LICH_GAP, kiemTraLichChuaBaoCao } from '../../thu_vien/types/lich_gap_kh';
import type { YeuCauPhoiHop } from '../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import type { NhanSu, PhongBan } from '../../thu_vien/types/nhan_su';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import { cn } from '../../thu_vien/utils/cn';
import { DaiDien } from '../ui/dai_dien';
import { Nut } from '../ui/nut';
import HopYeuCauPhoiHop from '../ke_hoach/hop_yeu_cau_phoi_hop';

export type CheDoXemLichSu = 'timeline' | 'khach_hang' | 'noi_bo';

export interface SuKienDuAn {
  id: string;
  nguon_goc: 'lich_gap' | 'tien_do' | 'yeu_cau_phoi_hop';
  phan_loai: 'khach_hang' | 'noi_bo';
  loai_chi_tiet:
    | 'gap_kh'
    | 'goi_dien_kh'
    | 'gui_bao_gia_kh'
    | 'cham_soc_kh'
    | 'nhat_ky_kh'
    | 'yeu_cau_phoi_hop'
    | 'hop_noi_bo'
    | 'ghi_chu_noi_bo';
  tieu_de: string;
  noi_dung?: string | null;
  ket_qua?: string | null;
  nguoi_thuc_hien?: string | null;
  nguoi_thuc_hien_id?: string | null;
  url_anh_dai_dien?: string | null;
  thoi_gian: string;
  ngay_hien_thi: string;
  gio_hien_thi?: string;
  dia_diem?: string | null;
  trang_thai?: string | null;
  link_tai_lieu?: string | null;
  ten_tai_lieu?: string | null;
  y_kien_chi_dao?: string | null;
  ten_nguoi_chi_dao?: string | null;
  chuc_vu_nguoi_chi_dao?: string | null;
  ngay_chi_dao?: string | null;
  lich_goc?: LichGapKH;
  tien_do_goc?: TienDoDuAn;
  yeu_cau_goc?: YeuCauPhoiHop;
}

interface BanNhatKyVaTimelineDuAnProps {
  duAnId: string;
  tenDuAn?: string;
  dsTD: (TienDoDuAn & { canh_bao?: 'sap_den' | 'qua_han' | null })[];
  dsLich: LichGapKH[];
  dsYeuCau: YeuCauPhoiHop[];
  dsNS: NhanSu[];
  dsPhongBan?: PhongBan[];
  nguoiDungHienTai?: any;
  laQuanLyHoacGiamDoc?: boolean;
  dangTai?: boolean;
  err?: string | null;
  onTaoGhiNhan: (params: {
    noi_dung: string;
    loai_nhat_ky: 'khach_hang' | 'noi_bo';
    file?: { ten_file: string; url_file: string; loai_file: string; ghi_chu?: string } | null;
  }) => Promise<void>;
  onXoaTD: (td: TienDoDuAn) => void;
  onSuaTD: (
    tdId: string,
    params: {
      tinh_hinh_hien_tai: string;
      link_tai_lieu?: string | null;
      ten_tai_lieu?: string | null;
    }
  ) => Promise<void>;
  onChiDaoTD: (tdId: string, noiDungChiDao: string) => Promise<void>;
  onMoModalTaoLich: () => void;
  onSuaLich: (lich: LichGapKH) => void;
  onMoModalTaoYeuCau: () => void;
  onCapNhatYeuCau: (yc: YeuCauPhoiHop) => void;
  onXoaYeuCau: (id: string) => void;
}

export function BanNhatKyVaTimelineDuAn(props: BanNhatKyVaTimelineDuAnProps) {
  const {
    duAnId,
    tenDuAn,
    dsTD,
    dsLich,
    dsYeuCau,
    dsNS,
    dsPhongBan = [],
    nguoiDungHienTai,
    laQuanLyHoacGiamDoc = false,
    dangTai = false,
    err = null,
    onTaoGhiNhan,
    onXoaTD,
    onSuaTD,
    onChiDaoTD,
    onMoModalTaoLich,
    onSuaLich,
    onMoModalTaoYeuCau,
    onCapNhatYeuCau,
    onXoaYeuCau
  } = props;

  // 1. Chế độ xem: Timeline chung | Tương tác Khách hàng | Tác nghiệp Nội bộ
  const [cheDoXem, setCheDoXem] = useState<CheDoXemLichSu>('timeline');

  // Chế độ xem con trong tab Khách hàng & Nội bộ
  const [dangXemBangLich, setDangXemBangLich] = useState(false);
  const [dangXemHopYeuCau, setDangXemHopYeuCau] = useState(false);

  // 2. Form Ghi nhận nhanh
  const [moFormGhiNhan, setMoFormGhiNhan] = useState(false);
  const [loaiGhiNhanForm, setLoaiGhiNhanForm] = useState<'khach_hang' | 'noi_bo'>('khach_hang');
  const [noiDungForm, setNoiDungForm] = useState('');
  const [kemFile, setKemFile] = useState(false);
  const [tenFile, setTenFile] = useState('');
  const [urlFile, setUrlFile] = useState('');
  const [loaiFile, setLoaiFile] = useState('link_khac');
  const [dangLuuForm, setDangLuuForm] = useState(false);
  const [loiForm, setLoiForm] = useState<string | null>(null);

  // 3. Inline Edit & Chỉ đạo của Cấp trên
  const [dangSuaTDId, setDangSuaTDId] = useState<string | null>(null);
  const [tinhHinhSua, setTinhHinhSua] = useState('');
  const [linkTaiLieuSua, setLinkTaiLieuSua] = useState('');
  const [tenTaiLieuSua, setTenTaiLieuSua] = useState('');
  const [dangLuuSua, setDangLuuSua] = useState(false);
  const [loiSua, setLoiSua] = useState<string | null>(null);

  const [dangChiDaoTDId, setDangChiDaoTDId] = useState<string | null>(null);
  const [noiDungChiDao, setNoiDungChiDao] = useState('');
  const [dangLuuChiDao, setDangLuuChiDao] = useState(false);

  // 4. CHUYỂN ĐỔI TOÀN BỘ SỰ KIỆN THÀNH TIMELINE CHUẨN (SINGLE SOURCE OF TRUTH - 0% DUPLICATE)
  const { dsSuKien, soLuongKH, soLuongNoiBo } = useMemo(() => {
    const list: SuKienDuAn[] = [];

    // Nguồn 1: Lịch làm việc / Lịch công tác
    dsLich.forEach((l) => {
      const isHopNoiBo = l.loai_viec_vp === 'hop_noi_bo';
      let loaiChiTiet: SuKienDuAn['loai_chi_tiet'] = 'gap_kh';
      if (isHopNoiBo) {
        loaiChiTiet = 'hop_noi_bo';
      } else if (l.loai_lich === 'van_phong') {
        if (l.loai_viec_vp === 'goi_dien') loaiChiTiet = 'goi_dien_kh';
        else if (l.loai_viec_vp === 'gui_bao_gia') loaiChiTiet = 'gui_bao_gia_kh';
        else if (l.loai_viec_vp === 'cham_soc') loaiChiTiet = 'cham_soc_kh';
        else loaiChiTiet = 'nhat_ky_kh';
      }

      const ns = dsNS.find((x) => x.id === l.nguoi_phu_trach_id);

      list.push({
        id: `lich_${l.id}`,
        nguon_goc: 'lich_gap',
        phan_loai: isHopNoiBo ? 'noi_bo' : 'khach_hang',
        loai_chi_tiet: loaiChiTiet,
        tieu_de: l.tieu_de || (isHopNoiBo ? 'Họp nội bộ dự án' : `Gặp KH ${l.ten_khach_hang || ''}`),
        noi_dung: l.noi_dung,
        ket_qua: l.ket_qua,
        nguoi_thuc_hien: ns?.ho_va_ten || 'Nhân sự',
        nguoi_thuc_hien_id: l.nguoi_phu_trach_id,
        url_anh_dai_dien: ns?.url_anh_dai_dien,
        thoi_gian: `${l.ngay}T${l.gio_bat_dau || '08:00'}:00`,
        ngay_hien_thi: formatNgay(l.ngay),
        gio_hien_thi: `${l.gio_bat_dau} - ${l.gio_ket_thuc}`,
        dia_diem: l.dia_diem,
        trang_thai: l.trang_thai,
        lich_goc: l
      });
    });

    // Nguồn 2: Yêu cầu phối hợp phòng ban
    dsYeuCau.forEach((yc) => {
      const nsTao = dsNS.find((x) => x.id === yc.nguoi_tao_id);
      const pbNhan = dsPhongBan.find((x) => x.id === yc.phong_ban_id);
      const tenPB = pbNhan?.ten_phong_ban || 'Kỹ thuật / Dự toán';
      const linkTL = yc.link_drive_ket_qua || yc.link_drive_dau_vao || (yc.danh_sach_link_ket_qua?.[0]) || (yc.danh_sach_link_dau_vao?.[0]) || null;
      const tenTL = yc.link_drive_ket_qua ? 'Tài liệu kết quả phối hợp' : (yc.link_drive_dau_vao ? 'Tài liệu yêu cầu' : 'Tài liệu đính kèm');

      list.push({
        id: `yc_${yc.id}`,
        nguon_goc: 'yeu_cau_phoi_hop',
        phan_loai: 'noi_bo',
        loai_chi_tiet: 'yeu_cau_phoi_hop',
        tieu_de: `Phối hợp [${tenPB}]: ${yc.noi_dung_yeu_cau?.slice(0, 80) || ''}`,
        noi_dung: yc.noi_dung_yeu_cau,
        ket_qua: yc.ghi_chu_phan_hoi || null,
        nguoi_thuc_hien: nsTao?.ho_va_ten || yc.ten_nguoi_tao || 'Kinh doanh',
        nguoi_thuc_hien_id: yc.nguoi_tao_id,
        url_anh_dai_dien: nsTao?.url_anh_dai_dien,
        thoi_gian: yc.ngay_tao || new Date().toISOString(),
        ngay_hien_thi: formatNgay(yc.ngay_tao),
        trang_thai: yc.trang_thai,
        link_tai_lieu: linkTL,
        ten_tai_lieu: linkTL ? tenTL : null,
        yeu_cau_goc: yc
      });
    });

    // Nguồn 3: Tiến độ ghi nhận trực tiếp (LOẠI BỎ BẢN GHI CLONE TỰ ĐỘNG ĐỂ 0% TRÙNG LẶP)
    dsTD.forEach((td) => {
      if (td.id.startsWith('td_lich_') || (td as any).lich_gap_kh_id) return;
      const nd = (td.tinh_hinh_hien_tai || '').trim();
      if (
        nd.startsWith('[KHTH nộp kết quả]') ||
        nd.startsWith('[Đã duyệt kết quả phối hợp]') ||
        nd.startsWith('Gửi yêu cầu phối hợp:') ||
        nd.startsWith('[Yêu cầu phối hợp]')
      ) {
        return;
      }

      const isNoiBo = (td as any).loai_nhat_ky === 'noi_bo' || (td as any).la_noi_bo;
      const ns = dsNS.find((x) => x.id === td.nguoi_tao_id);

      list.push({
        id: `td_${td.id}`,
        nguon_goc: 'tien_do',
        phan_loai: isNoiBo ? 'noi_bo' : 'khach_hang',
        loai_chi_tiet: isNoiBo ? 'ghi_chu_noi_bo' : 'nhat_ky_kh',
        tieu_de: isNoiBo ? 'Ghi chú / Trao đổi nội bộ' : 'Làm việc / Trao đổi với khách hàng',
        noi_dung: td.tinh_hinh_hien_tai,
        ket_qua: td.ket_qua_thuc_hien,
        nguoi_thuc_hien: ns?.ho_va_ten || 'Nhân sự',
        nguoi_thuc_hien_id: td.nguoi_tao_id,
        url_anh_dai_dien: ns?.url_anh_dai_dien,
        thoi_gian: td.ngay_tao || new Date().toISOString(),
        ngay_hien_thi: formatNgay(td.ngay_tao),
        gio_hien_thi: formatNgay(td.ngay_tao, 'HH:mm'),
        trang_thai: td.trang_thai_hanh_dong,
        link_tai_lieu: td.link_tai_lieu,
        ten_tai_lieu: td.ten_tai_lieu,
        y_kien_chi_dao: td.y_kien_chi_dao,
        ten_nguoi_chi_dao: td.ten_nguoi_chi_dao,
        chuc_vu_nguoi_chi_dao: td.chuc_vu_nguoi_chi_dao,
        ngay_chi_dao: td.ngay_chi_dao,
        tien_do_goc: td
      });
    });

    list.sort((a, b) => (b.thoi_gian || '').localeCompare(a.thoi_gian || ''));

    const khCount = list.filter((x) => x.phan_loai === 'khach_hang').length;
    const nbCount = list.filter((x) => x.phan_loai === 'noi_bo').length;

    return { dsSuKien: list, soLuongKH: khCount, soLuongNoiBo: nbCount };
  }, [dsLich, dsYeuCau, dsTD, dsNS, dsPhongBan]);

  // Danh sách sự kiện được lọc theo chế độ xem
  const dsHienThi = useMemo(() => {
    if (cheDoXem === 'khach_hang') {
      return dsSuKien.filter((x) => x.phan_loai === 'khach_hang');
    }
    if (cheDoXem === 'noi_bo') {
      return dsSuKien.filter((x) => x.phan_loai === 'noi_bo');
    }
    return dsSuKien;
  }, [dsSuKien, cheDoXem]);

  // Xử lý gửi form ghi nhận nhanh
  const handleLuuGhiNhanNhanh = async (e: React.FormEvent) => {
    e.preventDefault();
    const nd = noiDungForm.trim();
    if (!nd && !urlFile.trim()) {
      setLoiForm('Vui lòng nhập nội dung hoặc đính kèm tài liệu');
      return;
    }
    setDangLuuForm(true);
    setLoiForm(null);
    try {
      const fileData =
        kemFile && urlFile.trim()
          ? {
              ten_file: tenFile.trim() || 'Tài liệu đính kèm',
              url_file: urlFile.trim(),
              loai_file: loaiFile || 'link_khac'
            }
          : null;

      await onTaoGhiNhan({
        noi_dung: nd,
        loai_nhat_ky: loaiGhiNhanForm,
        file: fileData
      });

      setNoiDungForm('');
      setTenFile('');
      setUrlFile('');
      setKemFile(false);
      setMoFormGhiNhan(false);
    } catch (err: any) {
      setLoiForm(err?.message || 'Có lỗi khi lưu ghi nhận');
    } finally {
      setDangLuuForm(false);
    }
  };

  // Helper mở form với phạm vi được định sẵn
  const moFormVoiPhamVi = (phamVi: 'khach_hang' | 'noi_bo') => {
    setLoaiGhiNhanForm(phamVi);
    setMoFormGhiNhan(true);
  };

  return (
    <div className="space-y-5">
      {/* 1. THANH CHUYỂN ĐỔI CHẾ ĐỘ XEM & CÁC NÚT TÁC VỤ NHANH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        {/* Nhóm 3 tab chuyển đổi lớn */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 gap-1 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              setCheDoXem('timeline');
              setDangXemBangLich(false);
              setDangXemHopYeuCau(false);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              cheDoXem === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            <Clock className="size-3.5 text-blue-600" />
            <span>Tất cả hoạt động</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10.5px] bg-slate-100 text-slate-700 font-mono font-normal">
              {dsSuKien.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCheDoXem('khach_hang');
              setDangXemHopYeuCau(false);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              cheDoXem === 'khach_hang'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
            )}
          >
            <Briefcase className="size-3.5 text-emerald-600" />
            <span>Tương tác Khách hàng</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10.5px] bg-emerald-100 text-emerald-800 font-mono font-normal">
              {soLuongKH}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCheDoXem('noi_bo');
              setDangXemBangLich(false);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              cheDoXem === 'noi_bo'
                ? 'bg-white text-purple-800 shadow-2xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
            )}
          >
            <Users className="size-3.5 text-purple-600" />
            <span>Tác nghiệp Nội bộ</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10.5px] bg-purple-100 text-purple-800 font-mono font-normal">
              {soLuongNoiBo}
            </span>
          </button>
        </div>

        {/* Nhóm nút tác vụ nhanh */}
        <div className="flex items-center gap-2 flex-wrap">
          <Nut
            kieu={moFormGhiNhan ? 'outline' : 'primary'}
            kich_thuoc="sm"
            icon_trai={moFormGhiNhan ? X : Plus}
            onClick={() => {
              if (moFormGhiNhan) {
                setMoFormGhiNhan(false);
              } else {
                moFormVoiPhamVi(cheDoXem === 'noi_bo' ? 'noi_bo' : 'khach_hang');
              }
            }}
            className="text-xs font-bold"
          >
            {moFormGhiNhan ? 'Đóng form' : '+ Ghi nhận tiến độ'}
          </Nut>

          <button
            type="button"
            onClick={onMoModalTaoLich}
            className="h-8 px-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Calendar className="size-3.5 text-emerald-600" />
            <span>+ Đặt lịch gặp KH</span>
          </button>

          <button
            type="button"
            onClick={onMoModalTaoYeuCau}
            className="h-8 px-3 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Building2 className="size-3.5 text-purple-600" />
            <span>+ Yêu cầu phối hợp</span>
          </button>
        </div>
      </div>

      {/* 2. FORM GHI NHẬN TIẾN ĐỘ CÓ PHÂN ĐỊNH PHẠM VI RÕ RÀNG */}
      {moFormGhiNhan && (
        <form
          onSubmit={handleLuuGhiNhanNhanh}
          className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Phân định phạm vi ghi nhận:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-white border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => setLoaiGhiNhanForm('khach_hang')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                    loaiGhiNhanForm === 'khach_hang'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Briefcase className="size-3" />
                  <span>Làm việc với KH</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoaiGhiNhanForm('noi_bo')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer',
                    loaiGhiNhanForm === 'noi_bo'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Users className="size-3" />
                  <span>Ghi chú nội bộ</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMoFormGhiNhan(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 mb-1 block">
              {loaiGhiNhanForm === 'khach_hang'
                ? 'Nội dung làm việc / Kết quả trao đổi với khách hàng'
                : 'Nội dung tác nghiệp / Thống nhất nội bộ / Chỉ đạo dự án'}
              <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <textarea
              value={noiDungForm}
              onChange={(e) => setNoiDungForm(e.target.value)}
              rows={3}
              placeholder={
                loaiGhiNhanForm === 'khach_hang'
                  ? 'Ví dụ: Đã gọi điện chốt phương án vật tư với anh Hùng, khách đồng ý báo giá 450 triệu...'
                  : 'Ví dụ: Họp thống nhất phương án thi công với kỹ thuật, sếp duyệt chiết khấu tối đa 3%...'
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setKemFile((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer',
                kemFile
                  ? 'bg-blue-100 border-blue-300 text-blue-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              )}
            >
              <Paperclip className="size-3.5" />
              <span>{kemFile ? 'Đang bật đính kèm tài liệu' : '+ Đính kèm Link tài liệu'}</span>
            </button>

            {kemFile && (
              <div className="mt-2.5 p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 animate-in fade-in duration-150">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tên tài liệu / Văn bản
                    </label>
                    <input
                      type="text"
                      value={tenFile}
                      onChange={(e) => setTenFile(e.target.value)}
                      placeholder="VD: Bản vẽ kỹ thuật / Biên bản làm việc"
                      className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Đường dẫn URL (Google Drive, Zalo...) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={urlFile}
                      onChange={(e) => setUrlFile(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {loiForm && (
            <div className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="size-3.5" /> {loiForm}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200/60">
            <button
              type="button"
              onClick={() => setMoFormGhiNhan(false)}
              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangLuuForm}
              className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {dangLuuForm ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              <span>Lưu ghi nhận</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. SUB-VIEW TRONG TAB KHÁCH HÀNG HOẶC NỘI BỘ */}
      {cheDoXem === 'khach_hang' && (
        <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900">Xem dạng:</span>
            <button
              type="button"
              onClick={() => setDangXemBangLich(false)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                !dangXemBangLich
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-100'
              )}
            >
              Dòng thời gian tương tác KH
            </button>
            <button
              type="button"
              onClick={() => setDangXemBangLich(true)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1',
                dangXemBangLich
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-100'
              )}
            >
              <Calendar className="size-3" />
              <span>Bảng Lịch hẹn ({dsLich.filter((x) => x.loai_viec_vp !== 'hop_noi_bo').length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onMoModalTaoLich}
            className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="size-3" /> Thêm lịch hẹn mới
          </button>
        </div>
      )}

      {cheDoXem === 'noi_bo' && (
        <div className="flex items-center justify-between bg-purple-50/60 border border-purple-200 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-900">Xem dạng:</span>
            <button
              type="button"
              onClick={() => setDangXemHopYeuCau(false)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
                !dangXemHopYeuCau
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-800 hover:bg-purple-100'
              )}
            >
              Dòng thời gian tác nghiệp nội bộ
            </button>
            <button
              type="button"
              onClick={() => setDangXemHopYeuCau(true)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1',
                dangXemHopYeuCau
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-800 hover:bg-purple-100'
              )}
            >
              <Building2 className="size-3" />
              <span>Hộp yêu cầu phối hợp ({dsYeuCau.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onMoModalTaoYeuCau}
            className="text-xs font-bold text-purple-800 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="size-3" /> Tạo yêu cầu mới
          </button>
        </div>
      )}

      {/* 4. NỘI DUNG HIỂN THỊ */}

      {/* Trường hợp 4A: Bảng quản lý Lịch hẹn (nếu chọn) */}
      {cheDoXem === 'khach_hang' && dangXemBangLich ? (
        <div className="space-y-3">
          {dsLich.filter((x) => x.loai_viec_vp !== 'hop_noi_bo').length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Chưa có lịch hẹn nào với khách hàng cho dự án này.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] font-bold text-slate-700">
                    <th className="py-2.5 px-3 w-[150px]">Ngày & Giờ</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Tiêu đề & Nội dung</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Kết quả đạt được</th>
                    <th className="py-2.5 px-3 w-[140px]">Địa điểm</th>
                    <th className="py-2.5 px-3 w-[110px]">Trạng thái</th>
                    <th className="py-2.5 px-3 w-[80px] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dsLich
                    .filter((x) => x.loai_viec_vp !== 'hop_noi_bo')
                    .map((l) => {
                      const cfgTT = DANH_SACH_TRANG_THAI_LICH_GAP.find((x) => x.key === l.trang_thai);
                      const chuaBC = kiemTraLichChuaBaoCao(l);
                      return (
                        <tr
                          key={l.id}
                          onClick={() => onSuaLich(l)}
                          className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <div className="font-bold text-slate-900">{formatNgay(l.ngay)}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {l.gio_bat_dau} - {l.gio_ket_thuc}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                              {l.tieu_de}
                            </div>
                            {l.noi_dung && (
                              <p className="text-slate-600 text-[11.5px] mt-0.5 line-clamp-2">
                                {l.noi_dung}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            {l.ket_qua ? (
                              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11.5px] font-medium leading-relaxed">
                                {l.ket_qua}
                              </div>
                            ) : chuaBC ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10.5px] font-bold border border-amber-300">
                                <AlertCircle className="size-3 text-amber-700" /> Chưa báo cáo
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Chưa cập nhật</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top text-slate-600 text-[11.5px]">
                            {l.dia_diem || '—'}
                          </td>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-[10.5px] font-semibold border',
                                cfgTT?.mauBadge || 'bg-slate-100 text-slate-700'
                              )}
                            >
                              {cfgTT?.tieu_de || l.trang_thai}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSuaLich(l);
                              }}
                              className="h-6.5 px-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="size-2.5 text-slate-500" /> Sửa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : cheDoXem === 'noi_bo' && dangXemHopYeuCau ? (
        /* Trường hợp 4B: Hộp yêu cầu phối hợp (nếu chọn) */
        <div className="space-y-3">
          <HopYeuCauPhoiHop
            danhSachYeuCau={dsYeuCau}
            nguoiDungHienTai={nguoiDungHienTai}
            onCapNhatYeuCau={onCapNhatYeuCau}
            onXoaYeuCau={onXoaYeuCau}
            onMoModalTaoYeuCau={onMoModalTaoYeuCau}
          />
        </div>
      ) : (
        /* Trường hợp 4C: DÒNG THỜI GIAN CHUẨN (TIMELINE / KH / NỘI BỘ) */
        <div className="space-y-3">
          {dangTai ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải dữ liệu tác nghiệp...</div>
          ) : err ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-xs p-3 font-semibold">
              Lỗi tải: {err}
            </div>
          ) : dsHienThi.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <p>Chưa có ghi nhận hoạt động nào trong chế độ xem này.</p>
              <button
                type="button"
                onClick={() => moFormVoiPhamVi(cheDoXem === 'noi_bo' ? 'noi_bo' : 'khach_hang')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer transition shadow-2xs"
              >
                <Plus className="size-3" /> Thêm ghi nhận đầu tiên
              </button>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {dsHienThi.map((sk) => {
                const laKH = sk.phan_loai === 'khach_hang';

                return (
                  <div key={sk.id} className="relative group">
                    {/* Điểm mốc trên dòng thời gian */}
                    <div
                      className={cn(
                        'absolute -left-6 sm:-left-8 top-3 size-6 sm:size-7 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs',
                        laKH ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                      )}
                    >
                      {sk.loai_chi_tiet === 'gap_kh' && <Briefcase className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'goi_dien_kh' && <PhoneCall className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'gui_bao_gia_kh' && <FileText className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'cham_soc_kh' && <Handshake className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'nhat_ky_kh' && <MessageCircle className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'yeu_cau_phoi_hop' && <Building2 className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'hop_noi_bo' && <Users className="size-3 sm:size-3.5" />}
                      {sk.loai_chi_tiet === 'ghi_chu_noi_bo' && <MessageSquare className="size-3 sm:size-3.5" />}
                    </div>

                    {/* Thẻ sự kiện */}
                    <div
                      className={cn(
                        'rounded-2xl border bg-white p-4 transition-all duration-200 space-y-2.5 shadow-2xs',
                        laKH
                          ? 'border-emerald-200/90 hover:border-emerald-300'
                          : 'border-purple-200/90 hover:border-purple-300'
                      )}
                    >
                      {/* Header thẻ: Người thực hiện, Thời gian, Badge Phân loại & Hành động */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                          <DaiDien
                            ten={sk.nguoi_thuc_hien || 'Nhân sự'}
                            anh={sk.url_anh_dai_dien}
                            kich_thuoc="sm"
                            className="size-7 sm:size-7.5 rounded-full ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap text-xs">
                            <span className="font-bold text-slate-900">{sk.nguoi_thuc_hien}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500 font-medium">
                              {sk.ngay_hien_thi} {sk.gio_hien_thi && `lúc ${sk.gio_hien_thi}`}
                            </span>
                          </div>

                          {/* Badge Phân định: Khách hàng vs Nội bộ */}
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              laKH
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            )}
                          >
                            {laKH ? '👥 Khách hàng' : '🏢 Nội bộ'}
                          </span>

                          {/* Badge loại hành động chi tiết */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {sk.loai_chi_tiet === 'gap_kh' && 'Gặp trực tiếp'}
                            {sk.loai_chi_tiet === 'goi_dien_kh' && 'Gọi điện thoại'}
                            {sk.loai_chi_tiet === 'gui_bao_gia_kh' && 'Gửi báo giá'}
                            {sk.loai_chi_tiet === 'cham_soc_kh' && 'Chăm sóc KH'}
                            {sk.loai_chi_tiet === 'nhat_ky_kh' && 'Ghi nhận trao đổi'}
                            {sk.loai_chi_tiet === 'yeu_cau_phoi_hop' && 'Phối hợp phòng ban'}
                            {sk.loai_chi_tiet === 'hop_noi_bo' && 'Họp nội bộ'}
                            {sk.loai_chi_tiet === 'ghi_chu_noi_bo' && 'Ghi chú nội bộ'}
                          </span>
                        </div>

                        {/* Thao tác nút Sửa/Xóa tùy theo nguồn gốc */}
                        <div className="flex items-center gap-1 shrink-0">
                          {sk.nguon_goc === 'lich_gap' && sk.lich_goc && (
                            <button
                              type="button"
                              onClick={() => onSuaLich(sk.lich_goc!)}
                              className="h-6.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            >
                              <Pencil className="size-2.5 text-slate-500" />
                              <span>Sửa lịch / KQ</span>
                            </button>
                          )}

                          {sk.nguon_goc === 'tien_do' && sk.tien_do_goc && (
                            <>
                              <button
                                type="button"
                                title="Sửa nội dung"
                                onClick={() => {
                                  setDangSuaTDId(sk.tien_do_goc!.id);
                                  setTinhHinhSua(sk.tien_do_goc!.tinh_hinh_hien_tai || '');
                                  setLinkTaiLieuSua(sk.tien_do_goc!.link_tai_lieu || '');
                                  setTenTaiLieuSua(sk.tien_do_goc!.ten_tai_lieu || '');
                                }}
                                className="size-6.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition cursor-pointer"
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button
                                type="button"
                                title="Xóa ghi nhận"
                                onClick={() => onXoaTD(sk.tien_do_goc!)}
                                className="size-6.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Tiêu đề & Nội dung */}
                      <div className="space-y-1">
                        <div className="text-xs sm:text-[13px] font-bold text-slate-900">
                          {sk.tieu_de}
                        </div>
                        {sk.noi_dung && (
                          <p className="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {sk.noi_dung}
                          </p>
                        )}
                        {sk.dia_diem && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                            <span>Địa điểm:</span> <span className="font-medium text-slate-700">{sk.dia_diem}</span>
                          </div>
                        )}
                      </div>

                      {/* KHỐI KẾT QUẢ ĐẠT ĐƯỢC - NỔI BẬT & RÕ RÀNG */}
                      {sk.ket_qua ? (
                        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 text-xs sm:text-[12.5px] space-y-1">
                          <div className="font-bold flex items-center gap-1 text-emerald-800 text-[11.5px]">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>KẾT QUẢ ĐẠT ĐƯỢC:</span>
                          </div>
                          <div className="leading-relaxed font-medium pl-4.5 whitespace-pre-wrap">
                            {sk.ket_qua}
                          </div>
                        </div>
                      ) : sk.nguon_goc === 'lich_gap' && sk.lich_goc && kiemTraLichChuaBaoCao(sk.lich_goc) ? (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">
                            <AlertCircle className="size-3.5 text-amber-600" /> Chưa có báo cáo kết quả buổi làm việc
                          </span>
                          <button
                            type="button"
                            onClick={() => onSuaLich(sk.lich_goc!)}
                            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                          >
                            Cập nhật ngay
                          </button>
                        </div>
                      ) : null}

                      {/* Tài liệu đính kèm (nếu có) */}
                      {sk.link_tai_lieu && (
                        <div className="pt-0.5">
                          <a
                            href={sk.link_tai_lieu}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
                          >
                            <ExternalLink className="size-3 text-slate-400 group-hover:text-blue-600" />
                            <span>{sk.ten_tai_lieu || 'Mở tài liệu đính kèm'}</span>
                          </a>
                        </div>
                      )}

                      {/* Ý kiến chỉ đạo của cấp trên (nếu có) */}
                      {sk.y_kien_chi_dao && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs space-y-1">
                          <div className="font-bold text-[11px] text-indigo-800 flex items-center gap-1">
                            <Sparkles className="size-3 text-indigo-600" />
                            <span>Ý kiến chỉ đạo từ {sk.ten_nguoi_chi_dao || 'Lãnh đạo'} ({sk.chuc_vu_nguoi_chi_dao || 'Ban Giám đốc'}):</span>
                          </div>
                          <p className="leading-relaxed pl-4">{sk.y_kien_chi_dao}</p>
                        </div>
                      )}

                      {/* Khối chỉ đạo cho Cấp quản lý/Giám đốc */}
                      {laQuanLyHoacGiamDoc && sk.nguon_goc === 'tien_do' && sk.tien_do_goc && (
                        <div className="pt-1 flex items-center justify-end">
                          {dangChiDaoTDId === sk.tien_do_goc.id ? (
                            <div className="w-full p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
                              <textarea
                                value={noiDungChiDao}
                                onChange={(e) => setNoiDungChiDao(e.target.value)}
                                rows={2}
                                placeholder="Nhập ý kiến chỉ đạo, định hướng cho nhân sự..."
                                className="w-full rounded-lg border border-indigo-300 bg-white p-2 text-xs text-slate-900 focus:outline-none"
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDangChiDaoTDId(null)}
                                  className="h-6.5 px-2 rounded-md bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  disabled={dangLuuChiDao}
                                  onClick={async () => {
                                    setDangLuuChiDao(true);
                                    try {
                                      await onChiDaoTD(sk.tien_do_goc!.id, noiDungChiDao);
                                      setDangChiDaoTDId(null);
                                    } finally {
                                      setDangLuuChiDao(false);
                                    }
                                  }}
                                  className="h-6.5 px-2.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 cursor-pointer"
                                >
                                  Lưu ý kiến
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDangChiDaoTDId(sk.tien_do_goc!.id);
                                setNoiDungChiDao(sk.tien_do_goc!.y_kien_chi_dao || '');
                              }}
                              className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <MessageSquare className="size-3" />
                              <span>{sk.y_kien_chi_dao ? 'Sửa ý kiến chỉ đạo' : '+ Cho ý kiến chỉ đạo'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default BanNhatKyVaTimelineDuAn;
