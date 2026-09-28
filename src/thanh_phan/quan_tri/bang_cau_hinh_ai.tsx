'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Radio,
  Sliders,
  Clock,
  ShieldCheck,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { Nut } from '../ui';
import { cn } from '../../thu_vien/utils/cn';
import type { CauHinhAIGemini } from '../../thu_vien/types/ai_danh_gia';
import { CAU_HINH_AI_MAC_DINH } from '../../thu_vien/types/ai_danh_gia';
import {
  layCauHinhAIAdmin,
  luuCauHinhAIAdmin,
  kiemTraKetNoiAIAdmin
} from '../../dich_vu/ai_danh_gia/dich_vu_ai_danh_gia';

const DANH_SACH_10_TIEU_CHI = [
  {
    key: 'bao_cao_doi_pho',
    so: 1,
    tieuDe: 'Soi "Báo cáo đối phó"',
    moTa: 'Phát hiện nhân viên copy/paste y hệt nội dung báo cáo của ngày hôm trước hoặc tuần trước để nộp cho có.'
  },
  {
    key: 'do_khop_ke_hoach',
    so: 2,
    tieuDe: 'Soi "Độ khớp với Kế hoạch"',
    moTa: 'So sánh xem những gì báo cáo hằng ngày có bám sát với Kế hoạch tuần/tháng đã cam kết không.'
  },
  {
    key: 'du_an_dong_bang',
    so: 3,
    tieuDe: 'Soi "Dự án đóng băng"',
    moTa: 'Cảnh báo các dự án quan trọng (nhất là Tiềm năng cao hoặc Sắp chốt) nhiều ngày không cập nhật hoặc không nhắc đến.'
  },
  {
    key: 'muc_do_uu_tien',
    so: 4,
    tieuDe: 'Soi "Mức độ ưu tiên"',
    moTa: 'Phân tích xem nhân viên có đang dành thời gian đúng chỗ không (dự án lớn vs việc vụn vặt).'
  },
  {
    key: 'ty_le_hoan_thanh_kpi',
    so: 5,
    tieuDe: 'Soi "Tỷ lệ hoàn thành (KPI)"',
    moTa: 'Đếm số lượng việc cam kết trong kế hoạch tuần và đối chiếu báo cáo ngày xem hoàn thành bao nhiêu %.'
  },
  {
    key: 'ly_do_lap_lai',
    so: 6,
    tieuDe: 'Soi "Lý do viện cớ lặp lại"',
    moTa: 'Phát hiện những khó khăn bị nhắc lại nhiều lần (chờ duyệt, khách bận...) mà không có giải pháp tháo gỡ.'
  },
  {
    key: 'khoi_luong_cong_viec',
    so: 7,
    tieuDe: 'Soi "Khối lượng công việc (Workload)"',
    moTa: 'Cảnh báo nhân sự đang bị quá tải (ôm quá nhiều dự án) hoặc đang quá rảnh rỗi (ít việc, làm cầm chừng).'
  },
  {
    key: 'tan_suat_cham_soc_kh',
    so: 8,
    tieuDe: 'Soi "Tần suất chăm sóc khách hàng"',
    moTa: 'Theo dõi thời gian cập nhật của các dự án để nhắc nhở nhân sự tương tác với khách hàng.'
  },
  {
    key: 'du_bao_cuoi_thang',
    so: 10,
    tieuDe: 'Dự báo rủi ro cuối tháng',
    moTa: 'Dựa trên tốc độ làm việc hiện tại để dự báo khả năng nhân viên có đạt chỉ tiêu tháng hay không.'
  }
];

export default function BangCauHinhAI() {
  const [cauHinh, setCauHinh] = useState<CauHinhAIGemini>(CAU_HINH_AI_MAC_DINH);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [hienThiKey, setHienThiKey] = useState(false);
  const [ketQuaKiemTra, setKetQuaKiemTra] = useState<{
    hop_le: boolean;
    thong_diep: string;
  } | null>(null);
  const [thongBao, setThongBao] = useState<{ loai: 'thanh_cong' | 'loi'; noi_dung: string } | null>(
    null
  );

  useEffect(() => {
    taiCauHinh();
  }, []);

  const taiCauHinh = async () => {
    setDangTai(true);
    try {
      const data = await layCauHinhAIAdmin();
      setCauHinh(data);
    } catch (error) {
      console.error('Lỗi khi tải cấu hình AI:', error);
    } finally {
      setDangTai(false);
    }
  };

  const handleLuu = async () => {
    setDangLuu(true);
    setThongBao(null);
    try {
      const res = await luuCauHinhAIAdmin(cauHinh);
      if (res.thanh_cong) {
        setThongBao({ loai: 'thanh_cong', noi_dung: 'Đã lưu cấu hình AI Gemini thành công!' });
      } else {
        setThongBao({ loai: 'loi', noi_dung: res.loi || 'Không thể lưu cấu hình' });
      }
    } catch (err: any) {
      setThongBao({ loai: 'loi', noi_dung: err?.message || 'Lỗi khi lưu cấu hình' });
    } finally {
      setDangLuu(false);
    }
  };

  const handleKiemTraKetNoi = async () => {
    if (!cauHinh.gemini_api_key?.trim()) {
      setKetQuaKiemTra({
        hop_le: false,
        thong_diep: 'Vui lòng nhập API Key trước khi kiểm tra'
      });
      return;
    }
    setDangKiemTra(true);
    setKetQuaKiemTra(null);
    try {
      const kq = await kiemTraKetNoiAIAdmin(cauHinh.gemini_api_key, cauHinh.model);
      setKetQuaKiemTra(kq);
    } catch (err: any) {
      setKetQuaKiemTra({
        hop_le: false,
        thong_diep: err?.message || 'Lỗi kiểm tra kết nối API'
      });
    } finally {
      setDangKiemTra(false);
    }
  };

  const toggleTieuChi = (key: string) => {
    setCauHinh((prev) => ({
      ...prev,
      tieu_chi_kich_hoat: {
        ...prev.tieu_chi_kich_hoat,
        [key]: !prev.tieu_chi_kich_hoat[key as keyof typeof prev.tieu_chi_kich_hoat]
      }
    }));
  };

  if (dangTai) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-[#185942] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tải cấu hình AI Gemini...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-[#185942] to-[#124231] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Cấu hình Trí tuệ nhân tạo (Google AI)
          </div>
          <h2 className="text-xl font-bold tracking-tight">Trí Tuệ Nhân Tạo Google Gemini</h2>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            Tự động giám sát, đối chiếu Kế hoạch - Báo cáo ngày - Hồ sơ Dự án của nhân sự để cung cấp
            nhận định sắc bén cho Ban Lãnh Đạo mỗi ngày.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <Nut
            onClick={handleLuu}
            disabled={dangLuu}
            className="bg-white text-[#185942] hover:bg-emerald-50 font-semibold shadow-sm"
          >
            {dangLuu ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu cấu hình
          </Nut>
        </div>
      </div>

      {/* Thông báo kết quả lưu */}
      {thongBao && (
        <div
          className={cn(
            'p-4 rounded-xl text-sm font-medium flex items-center gap-3 border',
            thongBao.loai === 'thanh_cong'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          )}
        >
          {thongBao.loai === 'thanh_cong' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{thongBao.noi_dung}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Cấu hình Khóa API & Model */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-5 h-5 text-[#185942]" />
              <h3 className="font-semibold text-slate-800 text-base">Khóa API Google Gemini</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex justify-between">
                <span>Gemini API Key</span>
                <span className="text-slate-400 font-normal">Chỉ Admin thấy</span>
              </label>
              <div className="relative">
                <input
                  type={hienThiKey ? 'text' : 'password'}
                  value={cauHinh.gemini_api_key || ''}
                  onChange={(e) =>
                    setCauHinh((prev) => ({ ...prev, gemini_api_key: e.target.value }))
                  }
                  placeholder="AIzaSy..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#185942]/20 focus:border-[#185942]"
                />
                <button
                  type="button"
                  onClick={() => setHienThiKey(!hienThiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {hienThiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Lấy API Key miễn phí tại{' '}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#185942] font-semibold underline hover:text-emerald-700"
                >
                  aistudio.google.com
                </a>
              </p>
            </div>

            {/* Nút kiểm tra API Key */}
            <div>
              <Nut
                kieu="secondary"
                onClick={handleKiemTraKetNoi}
                disabled={dangKiemTra}
                className="w-full justify-center text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {dangKiemTra ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Kiểm tra kết nối API Key
              </Nut>

              {ketQuaKiemTra && (
                <div
                  className={cn(
                    'mt-3 p-3 rounded-xl text-xs font-medium border flex items-start gap-2',
                    ketQuaKiemTra.hop_le
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  )}
                >
                  {ketQuaKiemTra.hop_le ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{ketQuaKiemTra.thong_diep}</span>
                </div>
              )}
            </div>

            {/* Lựa chọn mô hình */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Mô hình AI (Google Model)
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'gemini-3.8-flash',
                    ten: 'Gemini 2.0 Flash (Khuyên dùng)',
                    moTa: 'Tốc độ cực nhanh, thông minh và phản hồi chuẩn xác'
                  },
                  {
                    id: 'gemini-1.5-flash',
                    ten: 'Gemini 1.5 Flash',
                    moTa: 'Bản ổn định, chi phí thấp, tối ưu tóm tắt'
                  },
                  {
                    id: 'gemini-1.5-pro',
                    ten: 'Gemini 1.5 Pro',
                    moTa: 'Mô hình lập luận chuyên sâu, phân tích nhiều ngữ cảnh'
                  }
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setCauHinh((prev) => ({ ...prev, model: m.id }))}
                    className={cn(
                      'p-3 rounded-xl border text-sm cursor-pointer transition-all',
                      cauHinh.model === m.id
                        ? 'border-[#185942] bg-emerald-50/50 text-[#185942] ring-1 ring-[#185942]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    )}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between">
                      <span>{m.ten}</span>
                      {cauHinh.model === m.id && <Check className="w-4 h-4 text-[#185942]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{m.moTa}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tự động chạy mỗi ngày */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Cập nhật mỗi ngày</h4>
                  <p className="text-xs text-slate-500">Tự động kích hoạt AI cuối ngày</p>
                </div>
                <input
                  type="checkbox"
                  checked={cauHinh.tu_dong_danh_gia_hang_ngay}
                  onChange={(e) =>
                    setCauHinh((prev) => ({
                      ...prev,
                      tu_dong_danh_gia_hang_ngay: e.target.checked
                    }))
                  }
                  className="w-5 h-5 accent-[#185942] rounded cursor-pointer"
                />
              </div>

              {cauHinh.tu_dong_danh_gia_hang_ngay && (
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">Giờ chạy tự động:</span>
                  <input
                    type="time"
                    value={cauHinh.gio_chay_tu_dong || '23:00'}
                    onChange={(e) =>
                      setCauHinh((prev) => ({ ...prev, gio_chay_tu_dong: e.target.value }))
                    }
                    className="ml-auto text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: 9 Tiêu chí soi */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#185942]" />
                <h3 className="font-semibold text-slate-800 text-base">
                  9 Tiêu Chí Giám Sát Nhân Sự Của AI
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Đã chọn 9/10 tiêu chí
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Bật/tắt các tiêu chí bên dưới để tùy biến các khía cạnh mà AI sẽ phân tích đối chiếu khi
              đọc dữ liệu của nhân sự:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {DANH_SACH_10_TIEU_CHI.map((tc) => {
                const isChecked = !!cauHinh.tieu_chi_kich_hoat?.[
                  tc.key as keyof typeof cauHinh.tieu_chi_kich_hoat
                ];
                return (
                  <div
                    key={tc.key}
                    onClick={() => toggleTieuChi(tc.key)}
                    className={cn(
                      'p-4 rounded-xl border text-sm cursor-pointer transition-all flex items-start gap-3 select-none',
                      isChecked
                        ? 'border-[#185942]/30 bg-emerald-50/20 text-slate-800 hover:bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60 hover:opacity-80'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 accent-[#185942] rounded shrink-0 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">
                          #{tc.so}
                        </span>
                        <span>{tc.tieuDe}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{tc.moTa}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                <p className="font-semibold text-slate-700">Lưu ý về quyền riêng tư & bảo mật:</p>
                <p>
                  Dữ liệu gửi lên Google Gemini API chỉ bao gồm text mô tả dự án, kế hoạch và báo cáo
                  công việc. Hệ thống không lưu trữ hay chia sẻ thông tin nhạy cảm của khách hàng với
                  bất kỳ bên thứ ba nào.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
