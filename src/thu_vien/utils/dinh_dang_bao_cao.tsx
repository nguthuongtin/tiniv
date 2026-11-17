'use client';

import React from 'react';

export interface ThongTinNoiDungBaoCao {
  isChuaXong: boolean;
  noiDungSach: string;
}

/**
 * Hàm phân tích và làm sạch nội dung công việc báo cáo ngày:
 * - Tách cờ `isChuaXong` nếu có tiền tố [CHƯA HOÀN THÀNH] hoặc emoji lịch chưa xong
 * - Loại bỏ các tiền tố rườm rà (🚗, 🏢, ⚡, [Công tác], [Văn phòng], [08:00 - 09:00], ✅ [Hoàn thành])
 * - Loại bỏ các tiền tố tên khách hàng bị trùng lặp
 */
export function phanTichNoiDungBaoCao(noiDung?: string | null): ThongTinNoiDungBaoCao {
  if (!noiDung) return { isChuaXong: false, noiDungSach: '' };
  let raw = noiDung.trim();

  // 1. Kiểm tra có phải đã hoàn thành hay không (legacy format)
  const daHoanThanhLegacy = raw.startsWith('✅') || /^\s*\[Hoàn thành\]/iu.test(raw);

  // 2. Kiểm tra có phải chưa hoàn thành hay không
  let isChuaXong = false;
  if (/^\[(?:CHƯA HOÀN THÀNH|Chưa hoàn thành)\]/iu.test(raw)) {
    isChuaXong = true;
    raw = raw.replace(/^\[(?:CHƯA HOÀN THÀNH|Chưa hoàn thành)\]\s*/iu, '');
  } else if (!daHoanThanhLegacy && /^[🚗🏢⚡]/u.test(raw)) {
    // Lịch công tác/văn phòng cũ chưa được đánh dấu hoàn thành
    isChuaXong = true;
  }

  // 3. Làm sạch các tiền tố thừa thãi
  raw = raw.replace(/^✅\s*\[Hoàn thành\]\s*/iu, '');
  raw = raw.replace(/^Việc VP:\s*/iu, '');
  // Xóa emoji và loại lịch: 🚗 [Công tác] [08:00 - 09:00]
  raw = raw.replace(/^[🚗🏢⚡]\s*\[[^\]]+\]\s*(?:\[\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\]\s*)?/iu, '');

  // Nếu có dạng 'Tên KH - Tên KH...' hoặc 'Tên KH - Nội dung...'
  const partsDash = raw.split(' - ');
  if (partsDash.length > 1 && partsDash[1].toLowerCase().includes(partsDash[0].toLowerCase())) {
    raw = partsDash.slice(1).join(' - ');
  }

  // Nếu có dạng 'Tên KH: Tên KH...'
  const partsColon = raw.split(/:\s+/);
  if (partsColon.length > 1 && partsColon[1].toLowerCase().includes(partsColon[0].toLowerCase())) {
    raw = partsColon.slice(1).join(': ');
  }

  // Xóa tiền tố [Khách hàng] ở đầu nếu có
  raw = raw.replace(/^\[[^\]]+\]\s*/, '');

  return {
    isChuaXong,
    noiDungSach: raw.trim()
  };
}

/**
 * Trích xuất tiêu đề cốt lõi để so sánh / khớp dữ liệu
 */
export function layTieuDeCotLoi(noiDung?: string | null): string {
  const { noiDungSach } = phanTichNoiDungBaoCao(noiDung);
  return noiDungSach.toLowerCase().trim();
}

/**
 * Component hiển thị nội dung công việc báo cáo ngày:
 * - Nếu chưa hoàn thành -> hiển thị text đỏ "[CHƯA HOÀN THÀNH]"
 * - Nếu đã hoàn thành -> chỉ hiển thị nội dung sạch (không có chữ HOÀN THÀNH)
 */
export function DinhDangNoiDungCongViec({
  noiDung,
  className = '',
  anTienToRed = false
}: {
  noiDung?: string | null;
  className?: string;
  anTienToRed?: boolean;
}) {
  const { isChuaXong, noiDungSach } = phanTichNoiDungBaoCao(noiDung);
  if (!noiDungSach) return null;

  if (isChuaXong && !anTienToRed) {
    return (
      <span className={className}>
        <span className="text-red-600 font-bold mr-1.5 select-none">[CHƯA HOÀN THÀNH]</span>
        <span>{noiDungSach}</span>
      </span>
    );
  }

  return <span className={className}>{noiDungSach}</span>;
}
