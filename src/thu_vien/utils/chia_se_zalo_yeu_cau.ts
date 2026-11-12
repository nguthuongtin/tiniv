import dayjs from 'dayjs';
import type { YeuCauPhoiHop } from '../types/yeu_cau_phoi_hop';
import { formatNgay, formatNgayGio } from './format_ngay';

/** Lấy tên người tiếp nhận / xử lý hiển thị gọn */
export function layNguoiXuLyYeuCau(yc: YeuCauPhoiHop): string {
  if (yc.ten_nguoi_nhan?.trim()) {
    return yc.ten_nguoi_nhan.trim();
  }
  if (
    Array.isArray(yc.danh_sach_ten_nhan_su_thuc_hien) &&
    yc.danh_sach_ten_nhan_su_thuc_hien.length > 0
  ) {
    return yc.danh_sach_ten_nhan_su_thuc_hien.join(', ');
  }
  return '';
}

/**
 * Trích xuất mốc hoàn thành hoặc nộp kết quả từ dữ liệu và lịch sử xử lý
 */
export function layThoiGianHoanThanhYeuCau(yc: YeuCauPhoiHop): {
  daHoanThanh: boolean;
  thoiGianHoanThanh: string | null;
  thoiGianNopKetQua: string | null;
} {
  const logs = Array.isArray(yc.lich_su_xu_ly) ? yc.lich_su_xu_ly : [];

  let thoiGianNopKetQua: string | null = null;
  for (let i = logs.length - 1; i >= 0; i--) {
    const hd = (logs[i]?.hanh_dong || '').toLowerCase();
    if (hd.includes('nộp kết quả') || hd.includes('tự thực hiện')) {
      thoiGianNopKetQua = logs[i].thoi_gian || null;
      break;
    }
  }
  if (!thoiGianNopKetQua && yc.link_drive_ket_qua) {
    thoiGianNopKetQua = yc.ngay_cap_nhat || null;
  }

  if (yc.trang_thai === 'da_hoan_thanh') {
    let tgXong = yc.ngay_hoan_thanh || null;
    if (!tgXong) {
      for (let i = logs.length - 1; i >= 0; i--) {
        const hd = (logs[i]?.hanh_dong || '').toLowerCase();
        if (hd.includes('hoàn tất') || hd.includes('nghiệm thu')) {
          tgXong = logs[i].thoi_gian || null;
          break;
        }
      }
    }
    if (!tgXong && logs.length > 0) {
      tgXong = logs[logs.length - 1]?.thoi_gian || null;
    }
    if (!tgXong) {
      tgXong = yc.ngay_cap_nhat || null;
    }
    return {
      daHoanThanh: true,
      thoiGianHoanThanh: tgXong,
      thoiGianNopKetQua
    };
  }

  return {
    daHoanThanh: false,
    thoiGianHoanThanh: null,
    thoiGianNopKetQua
  };
}

/** Định dạng ngày giờ gọn cho ô bảng (cùng năm bỏ năm, khác năm thêm /YY) */
export function dinhDangThoiGianNgan(ngay: string | null | undefined): string {
  if (!ngay) return '';
  const d = dayjs(ngay);
  if (!d.isValid()) return '';
  const cungNam = d.year() === dayjs().year();
  return d.format(cungNam ? 'DD/MM HH:mm' : 'DD/MM/YY HH:mm');
}

/** Soạn nội dung tin nhắn gửi nhóm Zalo (tự động nhận diện gửi yêu cầu mới hoặc gửi kết quả) */
export function taoTenYeuCauHienThi(
  yc: Pick<YeuCauPhoiHop, 'loai_yeu_cau' | 'ten_du_an'> & { noi_dung_yeu_cau?: string | null }
): string {
  let loai = (yc.loai_yeu_cau || '').trim();
  if (!loai && yc.noi_dung_yeu_cau) {
    const nd = yc.noi_dung_yeu_cau.toLowerCase();
    if (nd.includes('lập phương án') || nd.includes('phương án')) loai = 'Lập phương án';
    else if (nd.includes('báo giá')) loai = 'Báo giá';
    else if (nd.includes('khảo sát')) loai = 'Khảo sát';
    else if (nd.includes('tờ trình')) loai = 'Tờ trình';
  }
  const tenDuAn = (yc.ten_du_an || '').trim();
  if (!loai) return tenDuAn.toLocaleUpperCase('vi-VN');
  if (!tenDuAn) return loai.toLocaleUpperCase('vi-VN');
  const loaiUpper = loai.toLocaleUpperCase('vi-VN');
  const duAnUpper = tenDuAn.toLocaleUpperCase('vi-VN');
  if (duAnUpper.startsWith(loaiUpper)) return duAnUpper;
  return `${loaiUpper} ${duAnUpper}`;
}

export function taoNoiDungTinNhanZaloYeuCau(yc: YeuCauPhoiHop): string {
  const nguoiXuLy = layNguoiXuLyYeuCau(yc);
  const { daHoanThanh, thoiGianHoanThanh, thoiGianNopKetQua } = layThoiGianHoanThanhYeuCau(yc);
  const daCoKetQua = Boolean(yc.link_drive_ket_qua) || daHoanThanh;

  if (daCoKetQua) {
    const tgXong = formatNgayGio(thoiGianHoanThanh || thoiGianNopKetQua || new Date());
    return [
      `🔔 [KẾT QUẢ YÊU CẦU HỖ TRỢ: ${taoTenYeuCauHienThi(yc)}]`,
      `• Nội dung: ${yc.noi_dung_yeu_cau}`,
      `• Người yêu cầu: ${yc.ten_nguoi_tao}`,
      `• Người xử lý: ${nguoiXuLy || 'KHTH'}`,
      yc.link_drive_ket_qua ? `• Link kết quả: ${yc.link_drive_ket_qua}` : null,
      tgXong ? `• Hoàn thành: ${tgXong}` : null
    ]
      .filter(Boolean)
      .join('\n');
  }

  const tgGui = formatNgayGio(yc.ngay_tao || new Date());
  const hanHoanThanh = yc.han_hoan_thanh ? formatNgay(yc.han_hoan_thanh) : '';

  return [
    `📌 [YÊU CẦU HỖ TRỢ: ${taoTenYeuCauHienThi(yc)}]`,
    `• Nội dung: ${yc.noi_dung_yeu_cau}`,
    `• Người yêu cầu: ${yc.ten_nguoi_tao}`,
    `• Người tiếp nhận: ${nguoiXuLy || 'Chờ phân công'}`,
    hanHoanThanh ? `• Thời hạn: ${hanHoanThanh}` : null,
    yc.link_drive_dau_vao ? `• Tài liệu đầu vào: ${yc.link_drive_dau_vao}` : null,
    tgGui ? `• Thời gian gửi: ${tgGui}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

/** Sao chép văn bản vào clipboard với fallback textarea */
export async function saoChepVanBan(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Dự phòng bằng textarea khi không có Clipboard API
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** Sao chép nội dung yêu cầu/kết quả vào clipboard và mở thẳng phần mềm/app Zalo */
export async function moZaloChiaSeYeuCau(yc: YeuCauPhoiHop): Promise<void> {
  const noiDungTinNhan = taoNoiDungTinNhanZaloYeuCau(yc);
  await saoChepVanBan(noiDungTinNhan);

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
    const urlDuPhong = yc.link_drive_ket_qua
      ? `https://zalo.me/share?url=${encodeURIComponent(yc.link_drive_ket_qua)}`
      : 'https://chat.zalo.me/';
    window.open(urlDuPhong, '_blank', 'noopener,noreferrer');
  }, 1800);
}
