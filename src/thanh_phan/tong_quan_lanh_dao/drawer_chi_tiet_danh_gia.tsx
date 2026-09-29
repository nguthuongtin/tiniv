'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  RefreshCw,
  FolderKanban,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Layers,
  Building2,
  User,
  ShieldAlert,
  Loader2,
  ChevronRight,
  ExternalLink,
  Flame,
  Award,
  CalendarDays
} from 'lucide-react';
import { Nut } from '../ui';
import { DaiDien } from '../ui/dai_dien';
import { cn } from '../../thu_vien/utils/cn';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { AIDanhGiaNhanSu, MucDoDanhGiaAI } from '../../thu_vien/types/ai_danh_gia';
import {
  kichHoatAIDanhGia,
  layLichSuDanhGiaNhanVien
} from '../../dich_vu/ai_danh_gia/dich_vu_ai_danh_gia';

interface Props {
  nhanSu: NhanSu | null;
  danhGiaHienTai: AIDanhGiaNhanSu | null;
  danhSachDuAn: HoSoDuAn[];
  onDong: () => void;
  onCapNhatDanhGia: (danhGiaMoi: AIDanhGiaNhanSu) => void;
}

const MAU_MUC_DO: Record<
  MucDoDanhGiaAI,
  { bg: string; text: string; border: string; icon: any; label: string }
> = {
  tot: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    label: 'Tốt / Đạt'
  },
  canh_bao: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
    label: 'Cảnh báo'
  },
  rui_ro: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: AlertCircle,
    label: 'Rủi ro cao'
  }
};

export default function DrawerChiTietDanhGia({
  nhanSu,
  danhGiaHienTai,
  danhSachDuAn,
  onDong,
  onCapNhatDanhGia
}: Props) {
  const [tabHienTai, setTabHienTai] = useState<'danh_gia' | 'du_an' | 'lich_su'>('danh_gia');
  const [dangChayAI, setDangChayAI] = useState(false);
  const [lichSu, setLichSu] = useState<AIDanhGiaNhanSu[]>([]);
  const [dangTaiLichSu, setDangTaiLichSu] = useState(false);
  const [danhGiaDangXem, setDanhGiaDangXem] = useState<AIDanhGiaNhanSu | null>(danhGiaHienTai);

  useEffect(() => {
    setDanhGiaDangXem(danhGiaHienTai);
  }, [danhGiaHienTai]);

  useEffect(() => {
    if (nhanSu?.id && tabHienTai === 'lich_su') {
      taiLichSu(nhanSu.id);
    }
  }, [nhanSu?.id, tabHienTai]);

  const taiLichSu = async (nhanVienId: string) => {
    setDangTaiLichSu(true);
    try {
      const data = await layLichSuDanhGiaNhanVien(nhanVienId);
      setLichSu(data);
    } catch (e) {
      console.error('Lỗi tải lịch sử đánh giá:', e);
    } finally {
      setDangTaiLichSu(false);
    }
  };

  const handleChayAI = async () => {
    if (!nhanSu?.id) return;
    setDangChayAI(true);
    try {
      const ngayHomNay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
      const res = await kichHoatAIDanhGia({
        nhan_vien_id: nhanSu.id,
        ngay_danh_gia: ngayHomNay
      });

      if (res.thanh_cong && res.du_lieu) {
        const itemMoi = Array.isArray(res.du_lieu) ? res.du_lieu[0] : res.du_lieu;
        setDanhGiaDangXem(itemMoi);
        onCapNhatDanhGia(itemMoi);
      } else {
        alert(res.loi || 'Không thể chạy AI đánh giá');
      }
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi gọi AI');
    } finally {
      setDangChayAI(false);
    }
  };

  if (!nhanSu) return null;

  // Lọc các dự án mà nhân viên này phụ trách chính
  const dsDuAnPhuTrach = danhSachDuAn.filter(
    (da) =>
      da.nguoi_phu_trach_id === nhanSu.id &&
      da.trang_thai !== 'da_xoa' &&
      (da as any).trang_thai_du_lieu !== 'da_xoa'
  );

  const soTiemNangCao = dsDuAnPhuTrach.filter((da) =>
    ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
  ).length;

  const soSapKyHD = dsDuAnPhuTrach.filter((da) =>
    ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
  ).length;

  const tongGiaTri = dsDuAnPhuTrach.reduce((sum, da) => sum + (Number(da.gia_tri_du_kien) || 0), 0);

  const tieuChiKeys = danhGiaDangXem?.chi_tiet_tieu_chi
    ? Object.keys(danhGiaDangXem.chi_tiet_tieu_chi)
    : [];

  const mucDoInfo =
    MAU_MUC_DO[danhGiaDangXem?.muc_do_tong_the || 'canh_bao'] || MAU_MUC_DO.canh_bao;
  const MucDoIcon = mucDoInfo.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <DaiDien
              anh={nhanSu.url_anh_dai_dien || ''}
              ten={nhanSu.ho_va_ten || 'NV'}
              className="w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base font-semibold ring-2 ring-white shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">{nhanSu.ho_va_ten}</h3>
                <span className="text-[10px] sm:text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 shrink-0">
                  {nhanSu.ma_nhan_vien || nhanSu.id.slice(0, 6)}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {nhanSu.chuc_vu || 'Nhân viên kinh doanh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Nut
              kieu="primary"
              onClick={handleChayAI}
              disabled={dangChayAI}
              className="bg-[#185942] hover:bg-[#134634] text-xs font-semibold shadow-xs py-1.5 px-2.5 sm:px-3 sm:py-2"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-1 sm:mr-1.5", dangChayAI && "animate-spin")} />
              <span>{dangChayAI ? 'Đang cập nhật...' : 'Cập nhật đánh giá'}</span>
            </Nut>

            <button
              type="button"
              onClick={onDong}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Thẻ chỉ số phụ trách chính */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-100/50 border-b border-slate-200 text-center">
          <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Dự án chính
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">{dsDuAnPhuTrach.length}</p>
          </div>
          <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
              Tiềm năng cao
            </p>
            <p className="text-base sm:text-lg font-bold text-amber-700 mt-0.5">{soTiemNangCao}</p>
          </div>
          <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
              Sắp ký HĐ
            </p>
            <p className="text-base sm:text-lg font-bold text-purple-700 mt-0.5">{soSapKyHD}</p>
          </div>
          <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
              Giá trị dự kiến
            </p>
            <p className="text-xs font-bold text-emerald-700 mt-1 truncate">
              {DINH_DANG_TIEN_NGAN_GON(tongGiaTri)}
            </p>
          </div>
        </div>

        {/* Tabs chọn xem */}
        <div className="flex border-b border-slate-200 px-3 sm:px-4 bg-white text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTabHienTai('danh_gia')}
            className={cn(
              'px-4 py-3 border-b-2 flex items-center gap-2 transition-colors',
              tabHienTai === 'danh_gia'
                ? 'border-[#185942] text-[#185942]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Đánh giá chi tiết
          </button>
          <button
            type="button"
            onClick={() => setTabHienTai('du_an')}
            className={cn(
              'px-4 py-3 border-b-2 flex items-center gap-2 transition-colors',
              tabHienTai === 'du_an'
                ? 'border-[#185942] text-[#185942]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Dự án phụ trách ({dsDuAnPhuTrach.length})
          </button>
          <button
            type="button"
            onClick={() => setTabHienTai('lich_su')}
            className={cn(
              'px-4 py-3 border-b-2 flex items-center gap-2 transition-colors',
              tabHienTai === 'lich_su'
                ? 'border-[#185942] text-[#185942]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            Lịch sử đánh giá
          </button>
        </div>

        {/* Nội dung theo Tab */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tabHienTai === 'danh_gia' && (
            <>
              {danhGiaDangXem ? (
                <div className="space-y-5">
                  {/* Điểm số & Nhận định tổng quát */}
                  <div
                    className={cn(
                      'p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4',
                      mucDoInfo.bg,
                      mucDoInfo.border
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MucDoIcon className={cn('w-5 h-5', mucDoInfo.text)} />
                        <span className={cn('font-bold text-sm uppercase tracking-wide', mucDoInfo.text)}>
                          {mucDoInfo.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          (Đánh giá ngày: {danhGiaDangXem.ngay_danh_gia})
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                        {danhGiaDangXem.nhan_dinh_chung}
                      </p>
                    </div>

                    <div className="shrink-0 bg-white/90 px-4 py-2 rounded-xl border border-slate-200/60 shadow-2xs text-center min-w-[90px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Hiệu suất</p>
                      <p className="text-2xl font-black text-[#185942]">
                        {danhGiaDangXem.diem_hieu_suat}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </p>
                    </div>
                  </div>

                  {/* Đề xuất hành động cho Lãnh đạo */}
                  {danhGiaDangXem.de_xuat_cho_quan_ly && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl space-y-1 shadow-2xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                        <Award className="w-4 h-4 text-amber-600" />
                        Đề xuất hành động cho Cấp Lãnh Đạo
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {danhGiaDangXem.de_xuat_cho_quan_ly}
                      </p>
                    </div>
                  )}

                  {/* Danh sách 9 tiêu chí soi chi tiết */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Chi tiết các tiêu chí giám sát</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {tieuChiKeys.length} tiêu chí đã phân tích
                      </span>
                    </h4>

                    <div className="space-y-2.5">
                      {tieuChiKeys.map((key) => {
                        const tc = danhGiaDangXem.chi_tiet_tieu_chi[
                          key as keyof typeof danhGiaDangXem.chi_tiet_tieu_chi
                        ];
                        if (!tc) return null;
                        const tcInfo = MAU_MUC_DO[tc.muc_do] || MAU_MUC_DO.canh_bao;
                        const TcIcon = tcInfo.icon;

                        return (
                          <div
                            key={key}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-slate-800">
                                {tc.ten_tieu_chi || key}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border',
                                  tcInfo.bg,
                                  tcInfo.text,
                                  tcInfo.border
                                )}
                              >
                                <TcIcon className="w-3 h-3" />
                                {tcInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                              {tc.nhan_xet}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#185942] mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">Chưa có đánh giá hôm nay</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Bấm nút bên dưới để hệ thống đối chiếu Kế hoạch, Báo cáo ngày và Hồ sơ Dự án của nhân sự để đưa ra nhận định ngay.
                  </p>
                  <Nut
                    kieu="primary"
                    onClick={handleChayAI}
                    disabled={dangChayAI}
                    className="bg-[#185942] hover:bg-[#134634] text-xs font-semibold shadow-xs mx-auto"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", dangChayAI && "animate-spin")} />
                    {dangChayAI ? 'Đang cập nhật...' : 'Bắt đầu đánh giá'}
                  </Nut>
                </div>
              )}
            </>
          )}

          {tabHienTai === 'du_an' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Dự án phụ trách chính ({dsDuAnPhuTrach.length})
              </h4>
              {dsDuAnPhuTrach.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Nhân sự này hiện chưa được chỉ định làm người phụ trách chính của dự án nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {dsDuAnPhuTrach.map((da) => (
                    <Link
                      key={da.id}
                      href={`/ho-so-du-an/${da.id}`}
                      className="block p-3 bg-white rounded-xl border border-slate-200 hover:border-[#185942]/40 hover:shadow-xs transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-800 leading-snug group-hover:text-[#185942]">
                          {da.ten_du_an}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {da.ma_ho_so}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          Giai đoạn: {da.giai_doan}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded font-semibold',
                            ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          Tiềm năng: {da.muc_do_tiem_nang}
                        </span>
                        {da.gia_tri_du_kien > 0 && (
                          <span className="ml-auto font-bold text-emerald-700">
                            {DINH_DANG_TIEN_NGAN_GON(da.gia_tri_du_kien)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabHienTai === 'lich_su' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Lịch sử đánh giá theo ngày
              </h4>
              {dangTaiLichSu ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#185942]" />
                  Đang tải lịch sử...
                </div>
              ) : lichSu.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Chưa có dữ liệu lịch sử</p>
              ) : (
                <div className="space-y-2">
                  {lichSu.map((ls) => (
                    <div
                      key={ls.id}
                      onClick={() => {
                        setDanhGiaDangXem(ls);
                        setTabHienTai('danh_gia');
                      }}
                      className={cn(
                        'p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between',
                        danhGiaDangXem?.id === ls.id
                          ? 'border-[#185942] bg-emerald-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ngày {ls.ngay_danh_gia}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                          {ls.nhan_dinh_chung}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-[#185942]">
                          {ls.diem_hieu_suat}
                          <span className="text-[10px] text-slate-400 font-normal">/100</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
