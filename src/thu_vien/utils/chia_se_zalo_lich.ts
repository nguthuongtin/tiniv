import dayjs from 'dayjs';
import type { LichGapKH } from '../types/lich_gap_kh';
import { formatNgay } from './format_ngay';
import { saoChepVanBan } from './chia_se_zalo_yeu_cau';

export function taoNoiDungZaloXinDuyetLich(params: {
  lich: LichGapKH;
  tenNhanSu: string;
  tenDuAn?: string | null;
  linkDuyet?: string | null;
}): string {
  const { lich, tenNhanSu, tenDuAn, linkDuyet } = params;
  const ngayFmt = lich.ngay ? formatNgay(lich.ngay) : '';
  const gio = `${lich.gio_bat_dau || ''} - ${lich.gio_ket_thuc || ''}`.trim();
  const diaDiem = lich.dia_diem?.trim();
  const noiDung = lich.noi_dung?.trim() || lich.tieu_de?.trim();

  return [
    `🚗 [XIN DUYỆT LỊCH CÔNG TÁC PHÁT SINH]`,
    `• Nhân sự: ${tenNhanSu}`,
    `• Khách hàng / Địa bàn: ${lich.ten_khach_hang}`,
    tenDuAn ? `• Dự án: ${tenDuAn}` : null,
    `• Thời gian: ${gio ? `${gio}, ` : ''}Ngày ${ngayFmt}`,
    diaDiem ? `• Địa điểm: ${diaDiem}` : null,
    noiDung ? `• Nội dung: ${noiDung}` : null,
    linkDuyet ? `👉 Bấm để duyệt nhanh trên hệ thống: ${linkDuyet}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

export async function moZaloXinDuyetLich(params: {
  lich: LichGapKH;
  tenNhanSu: string;
  tenDuAn?: string | null;
  linkDuyet?: string | null;
}): Promise<void> {
  const text = taoNoiDungZaloXinDuyetLich(params);
  await saoChepVanBan(text);

  if (typeof window === 'undefined') return;

  try {
    const a = document.createElement('a');
    a.href = 'zalo://';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 300);
  } catch {
    try {
      window.location.href = 'zalo://';
    } catch {}
  }

  const start = Date.now();
  setTimeout(() => {
    if (document.hidden || Date.now() - start > 2600) return;
    window.open('https://chat.zalo.me/', '_blank');
  }, 1200);
}
