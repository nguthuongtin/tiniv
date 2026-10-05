'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles,
  MessageSquareQuote,
  Flame,
  BellRing,
  AlertCircle,
  FolderKanban,
  Building2,
  CalendarClock,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { Ban_Ve } from '../ui';
import type { HoSoDuAn, TienDoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang, NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { KeHoachTuan, ItemKeHoachTuan, KeHoachThang } from '../../thu_vien/types/ke_hoach';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import type { GoiYTaoLichHenNhanh } from './drawer_ho_so_thu_gon';

export type LoaiCanhBaoSale =
  | 'chi_dao_lanh_dao'
  | 'dut_gay_follow_up'
  | 'du_an_dong_bang'
  | 'thieu_thong_tin';

export interface CanhBaoRadarSale {
  id: string;
  loai: LoaiCanhBaoSale;
  muc_do: 'khan_cap' | 'quan_trong' | 'goi_y';
  tieu_de: string;
  noi_dung: string;
  hanh_dong_de_xuat: string;
  du_an_id?: string | null;
  khach_hang_id?: string | null;
  item_tuan_id?: string | null;
  nguon?: 'he_thong' | 'ai';
}

const TU_KHOA_FOLLOW_UP = [
  'gọi lại',
  'liên hệ lại',
  'báo lại',
  'báo giá',
  'dự toán',
  'gửi hồ sơ',
  'trình ký',
  'tuần sau',
  'ngày mai',
  'thứ 2',
  'thứ 3',
  'thứ 4',
  'thứ 5',
  'thứ 6',
  'thứ 7',
  'hẹn gặp',
  'demo',
  'khảo sát'
];

const tinhSoNgayChenhLech = (isoCu: string, isoMoi: string): number => {
  const d1 = new Date(isoCu.slice(0, 10) + 'T00:00:00');
  const d2 = new Date(isoMoi.slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return 0;
  return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
};

export function phanTichRadarCanhBaoSale(params: {
  nhanVienId: string;
  homNayISO: string;
  danhSachDuAn: HoSoDuAn[];
  danhSachTienDo: TienDoDuAn[];
  danhSachKhachHang: KhachHang[];
  danhSachNguoiLienHe: NguoiLienHe[];
  keHoachTuan: KeHoachTuan | null;
  keHoachThang?: KeHoachThang | null;
  danhSachLichGap?: LichGapKH[];
}): CanhBaoRadarSale[] {
  const {
    nhanVienId,
    homNayISO,
    danhSachDuAn,
    danhSachTienDo,
    danhSachNguoiLienHe,
    keHoachTuan,
    danhSachLichGap = []
  } = params;

  const ketQua: CanhBaoRadarSale[] = [];
  const dsTacChien = keHoachTuan?.danh_sach_tac_chien ?? [];

  // Chỉ xét các dự án đang hoạt động mà nhân viên phụ trách hoặc quản lý
  const duAnCuaSale = danhSachDuAn.filter(
    (d) =>
      d.trang_thai !== 'da_xoa' &&
      !['hoan_thanh', 'tam_dung', 'huy'].includes(String(d.giai_doan)) &&
      (!nhanVienId || d.nguoi_phu_trach_id === nhanVienId || d.nguoi_quan_ly_id === nhanVienId)
  );

  const mapTienDoTheoDA = new Map<string, TienDoDuAn[]>();
  for (const td of danhSachTienDo) {
    if (td.trang_thai_du_lieu === 'da_xoa') continue;
    const arr = mapTienDoTheoDA.get(td.du_an_id) || [];
    arr.push(td);
    mapTienDoTheoDA.set(td.du_an_id, arr);
  }

  // 1. Quét Ý KIẾN CHỈ ĐẠO TỪ LÃNH ĐẠO (Trên Tiến độ dự án & Kế hoạch tuần)
  for (const da of duAnCuaSale) {
    const dsTD = (mapTienDoTheoDA.get(da.id) || []).sort((a, b) =>
      (b.ngay_tao || '').localeCompare(a.ngay_tao || '')
    );
    const tdCoChiDao = dsTD.find((t) => Boolean(t.y_kien_chi_dao?.trim()));
    if (tdCoChiDao && tdCoChiDao.y_kien_chi_dao) {
      ketQua.push({
        id: `cd_da_${tdCoChiDao.id}`,
        loai: 'chi_dao_lanh_dao',
        muc_do: 'khan_cap',
        tieu_de: `Chỉ đạo tại dự án: ${da.ten_du_an}`,
        noi_dung: `${tdCoChiDao.ten_nguoi_chi_dao || 'Lãnh đạo'}: "${tdCoChiDao.y_kien_chi_dao}"`,
        hanh_dong_de_xuat: 'Mở hồ sơ dự án để thực hiện và phản hồi tiến độ.',
        du_an_id: da.id,
        khach_hang_id: da.khach_hang_id,
        nguon: 'he_thong'
      });
    }
  }

  for (const item of dsTacChien) {
    const kqCoChiDao = (item.danh_sach_ket_qua || []).find((k) =>
      Boolean(k.chi_dao?.noi_dung?.trim())
    );
    if (kqCoChiDao && kqCoChiDao.chi_dao) {
      ketQua.push({
        id: `cd_tuan_${item.id}_${kqCoChiDao.id}`,
        loai: 'chi_dao_lanh_dao',
        muc_do: 'khan_cap',
        tieu_de: `Chỉ đạo công việc: ${item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}`,
        noi_dung: `${kqCoChiDao.chi_dao.ten_nguoi_chi_dao || 'Lãnh đạo'}: "${kqCoChiDao.chi_dao.noi_dung}"`,
        hanh_dong_de_xuat: 'Cập nhật kết quả phản hồi vào công việc này.',
        du_an_id: item.du_an_id || null,
        khach_hang_id: item.khach_hang_id || null,
        item_tuan_id: item.id,
        nguon: 'he_thong'
      });
    }
  }

  // 2. Quét ĐỨT GÃY CHUỖI TƯƠNG TÁC / QUÊN FOLLOW-UP
  // 2a. Check-in tuần có hứa hẹn bước tiếp theo nhưng chưa hoàn thành & chưa xếp lịch tương lai
  for (const item of dsTacChien) {
    if (item.da_hoan_thanh) continue;
    const dsKq = item.danh_sach_ket_qua || [];
    const kqMoiNhat = dsKq[0];

    const cacNgay = new Set<string>([
      ...(item.cac_ngay_thuc_hien || []),
      ...(item.ngay_du_kien ? [item.ngay_du_kien] : [])
    ]);
    const coLichHomNayHoacTuongLai = Array.from(cacNgay).some((n) => n >= homNayISO);
    const coLichHenSapToi = danhSachLichGap.some(
      (l) =>
        l.ngay >= homNayISO &&
        ((item.khach_hang_id && l.khach_hang_id === item.khach_hang_id) ||
          (item.du_an_id && l.du_an_id === item.du_an_id))
    );

    if (kqMoiNhat) {
      const ndLower = kqMoiNhat.noi_dung.toLowerCase();
      const tuKhoaKhop = TU_KHOA_FOLLOW_UP.find((tk) => ndLower.includes(tk));
      if (tuKhoaKhop && !coLichHomNayHoacTuongLai && !coLichHenSapToi) {
        ketQua.push({
          id: `fu_tuan_${item.id}`,
          loai: 'dut_gay_follow_up',
          muc_do: 'khan_cap',
          tieu_de: `Cần Follow-up: ${item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}`,
          noi_dung: `Check-in ngày ${kqMoiNhat.ngay_ghi_nhan} có ghi "${kqMoiNhat.noi_dung}" nhưng chưa thấy lịch làm việc hoặc lịch hẹn tiếp theo.`,
          hanh_dong_de_xuat: 'Đưa vào việc hôm nay hoặc đặt lịch hẹn để không đứt mạch chăm sóc.',
          du_an_id: item.du_an_id || null,
          khach_hang_id: item.khach_hang_id || null,
          item_tuan_id: item.id,
          nguon: 'he_thong'
        });
        continue;
      }
    }

    // 2b. Công việc từ những ngày trước trong tuần chưa hoàn thành và chưa kéo sang hôm nay
    const cacNgayQuaKhu = Array.from(cacNgay).filter((n) => n < homNayISO);
    if (cacNgayQuaKhu.length > 0 && !coLichHomNayHoacTuongLai) {
      ketQua.push({
        id: `overdue_${item.id}`,
        loai: 'dut_gay_follow_up',
        muc_do: 'quan_trong',
        tieu_de: `Việc tồn đọng chưa dứt điểm: ${item.hanh_dong_tuan || item.noi_dung_tuan}`,
        noi_dung: `Đã lên lịch ngày ${cacNgayQuaKhu[cacNgayQuaKhu.length - 1]} (${item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an}) nhưng chưa hoàn thành.`,
        hanh_dong_de_xuat: 'Đưa vào bàn làm việc hôm nay để xử lý tiếp hoặc đánh dấu hoàn thành.',
        du_an_id: item.du_an_id || null,
        khach_hang_id: item.khach_hang_id || null,
        item_tuan_id: item.id,
        nguon: 'he_thong'
      });
    }
  }

  // 2c. Tiến độ dự án có ghi "hanh_dong_tiep_theo" nhưng quá hạn hoặc quên chưa đưa vào việc
  for (const da of duAnCuaSale) {
    const dsTD = (mapTienDoTheoDA.get(da.id) || []).sort((a, b) =>
      (b.ngay_tao || '').localeCompare(a.ngay_tao || '')
    );
    const tdMoiNhat = dsTD[0];
    if (
      tdMoiNhat &&
      tdMoiNhat.hanh_dong_tiep_theo?.trim() &&
      tdMoiNhat.trang_thai_hanh_dong !== 'da_hoan_thanh'
    ) {
      const daCoTrongTuan = dsTacChien.some((tc) => tc.du_an_id === da.id && !tc.da_hoan_thanh);
      const soNgayTuLucGhi = tinhSoNgayChenhLech(tdMoiNhat.ngay_tao, homNayISO);
      if (!daCoTrongTuan && soNgayTuLucGhi >= 2) {
        ketQua.push({
          id: `fu_da_${da.id}`,
          loai: 'dut_gay_follow_up',
          muc_do: 'quan_trong',
          tieu_de: `Quên bước tiếp theo tại DA: ${da.ten_du_an}`,
          noi_dung: `Bạn đã đề ra bước tiếp theo: "${tdMoiNhat.hanh_dong_tiep_theo}" (${soNgayTuLucGhi} ngày trước) nhưng chưa đưa vào lịch tác chiến tuần này.`,
          hanh_dong_de_xuat: 'Đưa ngay vào việc hôm nay hoặc cập nhật kết quả thực hiện.',
          du_an_id: da.id,
          khach_hang_id: da.khach_hang_id,
          nguon: 'he_thong'
        });
      }
    }
  }

  // 3. Quét DỰ ÁN ĐÓNG BĂNG (Lâu chưa tương tác >= 7 ngày)
  for (const da of duAnCuaSale) {
    const dsTD = (mapTienDoTheoDA.get(da.id) || []).sort((a, b) =>
      (b.ngay_tao || '').localeCompare(a.ngay_tao || '')
    );
    const mocCuoi = dsTD[0]?.ngay_tao || da.ngay_cap_nhat || da.ngay_tao;
    const soNgayImLang = tinhSoNgayChenhLech(mocCuoi, homNayISO);

    if (soNgayImLang >= 7) {
      const laTiemNangCao = ['rat_cao', 'cao'].includes(String(da.muc_do_tiem_nang));
      ketQua.push({
        id: `stale_${da.id}`,
        loai: 'du_an_dong_bang',
        muc_do: laTiemNangCao || soNgayImLang >= 14 ? 'khan_cap' : 'quan_trong',
        tieu_de: `Dự án ${soNgayImLang} ngày chưa tương tác: ${da.ten_du_an}`,
        noi_dung: `Dự án đang ở giai đoạn "${da.giai_doan}"${da.gia_tri_du_kien ? ` (Dự kiến ${da.gia_tri_du_kien.toLocaleString('vi-VN')} ₫)` : ''}, đã ${soNgayImLang} ngày chưa có tiến độ mới.`,
        hanh_dong_de_xuat: 'Liên hệ hỏi thăm khách hàng và cập nhật tiến độ ngay.',
        du_an_id: da.id,
        khach_hang_id: da.khach_hang_id,
        nguon: 'he_thong'
      });
    }
  }

  // 4. Quét THIẾU SÓT VŨ KHÍ (Dự án chưa có người liên hệ)
  for (const da of duAnCuaSale) {
    const coLienHe =
      Boolean(da.nguoi_lien_he_id) ||
      (da.khach_hang_id
        ? danhSachNguoiLienHe.some((l) => l.khach_hang_id === da.khach_hang_id)
        : false);

    if (!coLienHe) {
      ketQua.push({
        id: `missing_contact_${da.id}`,
        loai: 'thieu_thong_tin',
        muc_do: 'goi_y',
        tieu_de: `Thiếu đầu mối liên hệ: ${da.ten_du_an}`,
        noi_dung: 'Dự án đang theo đuổi nhưng chưa lưu thông tin Người liên hệ (Họ tên, Chức vụ, SĐT).',
        hanh_dong_de_xuat: 'Mở hồ sơ thu gọn để bổ sung người liên hệ.',
        du_an_id: da.id,
        khach_hang_id: da.khach_hang_id,
        nguon: 'he_thong'
      });
    }
  }

  return ketQua;
}

interface Props {
  mo: boolean;
  onDong: () => void;
  nhanVienId: string;
  homNayISO: string;
  danhSachCanhBaoHeThong: CanhBaoRadarSale[];
  danhSachDuAn: HoSoDuAn[];
  danhSachKhachHang: KhachHang[];
  keHoachTuan: KeHoachTuan | null;
  boLocKhoiTao?: 'tat_ca' | LoaiCanhBaoSale;
  onMoHoSoDuAn: (da: HoSoDuAn) => void;
  onMoHoSoKhachHang: (kh: KhachHang) => void;
  onMoTaoLichHen: (goiY: GoiYTaoLichHenNhanh) => void;
  onDuaVaoViecHomNay: (params: {
    duAn?: HoSoDuAn | null;
    khachHang?: KhachHang | null;
    itemTuan?: ItemKeHoachTuan | null;
    goiYHanhDong?: string;
  }) => void;
  onCheckInItemTuan: (item: ItemKeHoachTuan) => void;
}

const NHAN_LOAI: Record<
  LoaiCanhBaoSale,
  { nhan: string; icon: any; mauBadge: string }
> = {
  chi_dao_lanh_dao: {
    nhan: 'Chỉ đạo Lãnh đạo',
    icon: MessageSquareQuote,
    mauBadge: 'bg-amber-500/15 text-amber-800 border-amber-500/30'
  },
  dut_gay_follow_up: {
    nhan: 'Cần Follow-up',
    icon: BellRing,
    mauBadge: 'bg-rose-500/15 text-rose-700 border-rose-500/30'
  },
  du_an_dong_bang: {
    nhan: 'Dự án lâu chưa tương tác',
    icon: Flame,
    mauBadge: 'bg-orange-500/15 text-orange-800 border-orange-500/30'
  },
  thieu_thong_tin: {
    nhan: 'Bổ sung thông tin',
    icon: AlertCircle,
    mauBadge: 'bg-slate-200/80 text-slate-700 border-slate-300'
  }
};

export default function DrawerTroLyAISale({
  mo,
  onDong,
  nhanVienId,
  homNayISO,
  danhSachCanhBaoHeThong,
  danhSachDuAn,
  danhSachKhachHang,
  keHoachTuan,
  boLocKhoiTao = 'tat_ca',
  onMoHoSoDuAn,
  onMoHoSoKhachHang,
  onMoTaoLichHen,
  onDuaVaoViecHomNay,
  onCheckInItemTuan
}: Props) {
  const [boLoc, setBoLoc] = useState<'tat_ca' | LoaiCanhBaoSale>(boLocKhoiTao);
  const [dangQuetAI, setDangQuetAI] = useState(false);
  const [tomTatAI, setTomTatAI] = useState<string | null>(null);
  const [canhBaoTuAI, setCanhBaoTuAI] = useState<CanhBaoRadarSale[]>([]);
  const [loiAI, setLoiAI] = useState<string | null>(null);

  const mapDuAn = useMemo(() => new Map(danhSachDuAn.map((d) => [d.id, d])), [danhSachDuAn]);
  const mapKH = useMemo(() => new Map(danhSachKhachHang.map((k) => [k.id, k])), [danhSachKhachHang]);
  const dsTacChien = useMemo(() => keHoachTuan?.danh_sach_tac_chien ?? [], [keHoachTuan]);

  const tatCaCanhBao = useMemo(() => {
    return [...canhBaoTuAI, ...danhSachCanhBaoHeThong];
  }, [canhBaoTuAI, danhSachCanhBaoHeThong]);

  const dsHienThi = useMemo(() => {
    if (boLoc === 'tat_ca') return tatCaCanhBao;
    return tatCaCanhBao.filter((c) => c.loai === boLoc);
  }, [tatCaCanhBao, boLoc]);

  const xuLyQuetChuyenSauAI = async () => {
    if (!nhanVienId) return;
    setDangQuetAI(true);
    setLoiAI(null);
    try {
      const res = await fetch('/api/ai/tro-ly-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nhan_vien_id: nhanVienId,
          ngay_hien_tai: homNayISO
        })
      });
      const data = await res.json();
      if (!res.ok || !data.thanh_cong) {
        throw new Error(data.loi || 'Không thể phân tích AI lúc này.');
      }
      setTomTatAI(data.du_lieu?.tom_tat_nhanh || null);
      const listAI: CanhBaoRadarSale[] = (data.du_lieu?.danh_sach_canh_bao || []).map(
        (item: any, idx: number) => ({
          id: `ai_gen_${Date.now()}_${idx}`,
          loai: NHAN_LOAI[item.loai as LoaiCanhBaoSale] ? item.loai : 'dut_gay_follow_up',
          muc_do: item.muc_do || 'quan_trong',
          tieu_de: item.tieu_de || 'Gợi ý từ Trợ lý AI',
          noi_dung: item.noi_dung || '',
          hanh_dong_de_xuat: item.hanh_dong_de_xuat || 'Kiểm tra và xử lý ngay hôm nay.',
          du_an_id: item.du_an_id || null,
          khach_hang_id: item.khach_hang_id || null,
          nguon: 'ai'
        })
      );
      setCanhBaoTuAI(listAI);
    } catch (err: any) {
      setLoiAI(err?.message || 'Lỗi kết nối máy chủ AI.');
    } finally {
      setDangQuetAI(false);
    }
  };

  return (
    <Ban_Ve
      mo={mo}
      onDong={onDong}
      tieu_de="Trợ lý AI & Radar Cố vấn Tác chiến"
      kich_thuoc="lg"
    >
      <div className="space-y-4 pb-6">
        {/* Khối Quét AI chuyên sâu */}
        <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <span>Radar đồng hành cùng Sale</span>
            </div>
            <p className="text-xs text-slate-600">
              Tự động rà soát các cuộc liên hệ hứa hẹn tiếp theo, chỉ đạo của lãnh đạo và các dự án cần hâm nóng.
            </p>
          </div>

          <button
            type="button"
            disabled={dangQuetAI}
            onClick={xuLyQuetChuyenSauAI}
            className="h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-primary/90 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {dangQuetAI ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>AI đang đọc nhật ký...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>Phân tích sâu bằng Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {loiAI && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
            {loiAI}
          </div>
        )}

        {tomTatAI && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-950 space-y-1">
            <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Nhận định trọng tâm hôm nay từ Gemini AI:
            </div>
            <p className="font-medium leading-relaxed">{tomTatAI}</p>
          </div>
        )}

        {/* Bộ lọc nhóm vấn đề */}
        <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-200 pb-2.5">
          {[
            { id: 'tat_ca', label: `Tất cả (${tatCaCanhBao.length})` },
            {
              id: 'chi_dao_lanh_dao',
              label: `Chỉ đạo (${tatCaCanhBao.filter((x) => x.loai === 'chi_dao_lanh_dao').length})`
            },
            {
              id: 'dut_gay_follow_up',
              label: `Cần Follow-up (${tatCaCanhBao.filter((x) => x.loai === 'dut_gay_follow_up').length})`
            },
            {
              id: 'du_an_dong_bang',
              label: `Lâu chưa tương tác (${tatCaCanhBao.filter((x) => x.loai === 'du_an_dong_bang').length})`
            },
            {
              id: 'thieu_thong_tin',
              label: `Thiếu thông tin (${tatCaCanhBao.filter((x) => x.loai === 'thieu_thong_tin').length})`
            }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBoLoc(tab.id as any)}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                boLoc === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Danh sách các vấn đề cần xử lý + Nút Thao tác 1 chạm */}
        {dsHienThi.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 px-4 text-center space-y-2">
            <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900">
              Tuyệt vời! Không có cảnh báo tồn đọng nào ở mục này.
            </div>
            <p className="text-xs text-slate-500">
              Các dự án và lịch chăm sóc khách hàng của bạn đang được duy trì rất tốt.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dsHienThi.map((cb) => {
              const cfg = NHAN_LOAI[cb.loai] || NHAN_LOAI.dut_gay_follow_up;
              const Icon = cfg.icon;
              const duAn = cb.du_an_id ? mapDuAn.get(cb.du_an_id) : null;
              const khachHang = cb.khach_hang_id
                ? mapKH.get(cb.khach_hang_id)
                : duAn?.khach_hang_id
                ? mapKH.get(duAn.khach_hang_id)
                : null;
              const itemTuan = cb.item_tuan_id
                ? dsTacChien.find((x) => x.id === cb.item_tuan_id)
                : null;

              return (
                <div
                  key={cb.id}
                  className={cn(
                    'rounded-xl border p-3.5 space-y-2.5 bg-white transition-all',
                    cb.muc_do === 'khan_cap'
                      ? 'border-rose-300 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold',
                          cfg.mauBadge
                        )}
                      >
                        <Icon className="size-3" />
                        {cfg.nhan}
                      </span>
                      {cb.nguon === 'ai' && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-extrabold inline-flex items-center gap-1">
                          <Sparkles className="size-2.5" /> Gemini AI
                        </span>
                      )}
                    </div>

                    {cb.muc_do === 'khan_cap' && (
                      <span className="text-[11px] font-extrabold text-rose-600">
                        Ưu tiên xử lý
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{cb.tieu_de}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{cb.noi_dung}</p>
                    <div className="text-xs text-primary font-semibold mt-1.5 flex items-center gap-1">
                      <ArrowRight className="size-3 shrink-0" />
                      <span>Gợi ý: {cb.hanh_dong_de_xuat}</span>
                    </div>
                  </div>

                  {/* Thanh nút Thao tác ngay 1 chạm */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                    {duAn && (
                      <button
                        type="button"
                        onClick={() => {
                          onDong();
                          onMoHoSoDuAn(duAn);
                        }}
                        className="h-8 px-2.5 rounded-lg bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer"
                      >
                        <FolderKanban className="size-3.5" /> Mở Dự án & Cập nhật
                      </button>
                    )}

                    {khachHang && (
                      <button
                        type="button"
                        onClick={() => {
                          onDong();
                          onMoHoSoKhachHang(khachHang);
                        }}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="size-3.5 text-primary" /> Hồ sơ KH
                      </button>
                    )}

                    {itemTuan && (
                      <button
                        type="button"
                        onClick={() => {
                          onDong();
                          onCheckInItemTuan(itemTuan);
                        }}
                        className="h-8 px-2.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-bold inline-flex items-center gap-1.5 hover:bg-primary/20 cursor-pointer"
                      >
                        Check-in công việc
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onDong();
                        onDuaVaoViecHomNay({
                          duAn,
                          khachHang,
                          itemTuan,
                          goiYHanhDong: cb.hanh_dong_de_xuat
                        });
                      }}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3.5" /> Đưa vào việc hôm nay
                    </button>

                    {(duAn || khachHang) && (
                      <button
                        type="button"
                        onClick={() => {
                          onDong();
                          onMoTaoLichHen({
                            khach_hang_id: khachHang?.id || duAn?.khach_hang_id || null,
                            ten_khach_hang: khachHang?.ten_khach_hang || duAn?.ten_du_an,
                            du_an_id: duAn?.id || null,
                            noi_dung: cb.hanh_dong_de_xuat
                          });
                        }}
                        className="h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarClock className="size-3.5" /> Tạo lịch hẹn
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Ban_Ve>
  );
}
