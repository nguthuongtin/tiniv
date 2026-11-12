'use client';

import React, { useMemo, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import { FileSpreadsheet, Printer, X, Loader2 } from 'lucide-react';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import {
  phanTichTuanISO,
  type BaoCaoTuanVDCD,
  type DongKeHoachDuAnTuan
} from '../../thu_vien/types/bao_cao_tuan_vdcd';
import { dichChuyenTuanISO } from '../../thu_vien/types/bao_cao_tuan_vdcd';

interface Props {
  mo: boolean;
  onDong: () => void;
  baoCao: BaoCaoTuanVDCD;
  lichTuanToi?: (LichGapKH & { ten_nhan_vien?: string })[];
  tieuDePhu?: string;
}

const fmtTien = (val?: number | null): string => {
  const n = Number(val || 0);
  if (!n) return '';
  return new Intl.NumberFormat('vi-VN').format(Math.round(n));
};

const fmtPct = (tu: number, mau: number): string => {
  if (!mau || mau <= 0) return '';
  return `${((tu / mau) * 100).toFixed(2).replace('.', ',')}%`;
};

const fmtPctInt = (tu: number, mau: number): string => {
  if (!mau || mau <= 0) return '';
  return `${Math.round((tu / mau) * 100)}%`;
};

const chiaTrang = <T,>(items: T[], kichThuocTrang: number): T[][] => {
  if (items.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += kichThuocTrang) {
    pages.push(items.slice(i, i + kichThuocTrang));
  }
  return pages;
};

const SlideFrame: React.FC<{ children: React.ReactNode; nenTrang?: boolean }> = ({
  children,
  nenTrang = true
}) => (
  <section
    className="vdcd-slide relative w-[1120px] h-[630px] bg-white text-slate-900 overflow-hidden shadow-lg border border-slate-200 mx-auto shrink-0 flex flex-col"
    style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
  >
    {/* Góc trang trí đỏ-đen chuẩn mẫu VDCD */}
    <div
      className="pointer-events-none absolute top-0 left-0 w-16 h-16"
      style={{
        background: 'linear-gradient(135deg, #D11317 50%, transparent 50%)'
      }}
    />
    <div
      className="pointer-events-none absolute bottom-0 right-0 w-24 h-20"
      style={{
        background: 'linear-gradient(315deg, #1F242B 42%, #D11317 42%, #D11317 48%, transparent 48%)'
      }}
    />
    {nenTrang && (
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 56px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 56px)'
        }}
      />
    )}
    <div className="relative z-10 flex-1 flex flex-col px-12 py-8">{children}</div>
  </section>
);

export async function xuatExcelBaoCaoTuanVDCD(
  baoCao: BaoCaoTuanVDCD,
  lichTuanToi: (LichGapKH & { ten_nhan_vien?: string })[] = []
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  const infoTuan = phanTichTuanISO(baoCao.tuan);
  const infoTuanToi = phanTichTuanISO(dichChuyenTuanISO(baoCao.tuan, 1));

  const styleHeader = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD11317' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    row.height = 28;
  };

  const styleBody = (row: ExcelJS.Row) => {
    row.eachCell((cell) => {
      cell.font = { size: 11 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });
  };

  // Sheet 1: Doanh thu
  const s1 = wb.addWorksheet('Doanh_Thu');
  s1.addRow([`BÁO CÁO DOANH THU ${infoTuan.nhanTieuDe} (${infoTuan.khoangNgayNhan}) - ${baoCao.ten_nhan_vien}`]);
  s1.addRow(['Chỉ tiêu', 'DT Tuần (VND)', 'MTD (VND)', 'YTD (VND)', '%/KPI Tháng', '%/KPI Năm']);
  styleHeader(s1.getRow(2));
  const rKy = s1.addRow([
    'Doanh thu ký kết',
    baoCao.dt_tuan_ky_ket,
    baoCao.mtd_ky_ket,
    baoCao.ytd_ky_ket,
    fmtPct(baoCao.mtd_ky_ket, baoCao.kpi_thang_ky_ket),
    fmtPct(baoCao.ytd_ky_ket, baoCao.kpi_nam_ky_ket)
  ]);
  const rVe = s1.addRow([
    'Doanh thu tiền về',
    baoCao.dt_tuan_tien_ve,
    baoCao.mtd_tien_ve,
    baoCao.ytd_tien_ve,
    fmtPct(baoCao.mtd_tien_ve, baoCao.kpi_thang_tien_ve),
    fmtPct(baoCao.ytd_tien_ve, baoCao.kpi_nam_tien_ve)
  ]);
  styleBody(rKy);
  styleBody(rVe);
  s1.addRow([]);
  const hChiTiet = s1.addRow(['TÊN CÔNG TY / CÁ NHÂN', 'TÊN DỰ ÁN', 'TRẠNG THÁI', 'DOANH THU KÝ KẾT', 'DOANH THU TIỀN VỀ']);
  styleHeader(hChiTiet);
  for (const d of baoCao.chi_tiet_doanh_thu) {
    styleBody(s1.addRow([d.ten_khach_hang, d.ten_du_an, d.trang_thai, d.doanh_thu_ky_ket, d.doanh_thu_tien_ve]));
  }
  s1.columns = [{ width: 32 }, { width: 38 }, { width: 22 }, { width: 20 }, { width: 20 }, { width: 16 }];

  // Sheet 2: Tình trạng DA & Nguồn
  const s2 = wb.addWorksheet('Tinh_Trang_DA');
  const hTT = s2.addRow(['TÌNH TRẠNG DỰ ÁN', 'Tuần trước', 'Tuần này']);
  styleHeader(hTT);
  [
    ['TỔNG TIẾP CẬN', baoCao.tinh_trang_tuan_truoc.tong_tiep_can, baoCao.tinh_trang_tuan_nay.tong_tiep_can],
    ['ĐANG TIẾP CẬN', baoCao.tinh_trang_tuan_truoc.dang_tiep_can, baoCao.tinh_trang_tuan_nay.dang_tiep_can],
    ['BÁO GIÁ', baoCao.tinh_trang_tuan_truoc.bao_gia, baoCao.tinh_trang_tuan_nay.bao_gia],
    ['HỢP ĐỒNG', baoCao.tinh_trang_tuan_truoc.hop_dong, baoCao.tinh_trang_tuan_nay.hop_dong],
    ['KHÔNG PHÙ HỢP', baoCao.tinh_trang_tuan_truoc.khong_phu_hop, baoCao.tinh_trang_tuan_nay.khong_phu_hop]
  ].forEach((r) => styleBody(s2.addRow(r)));
  s2.addRow([]);
  const hNguon = s2.addRow(['NGUỒN TIẾP CẬN (%)', 'Tuần trước', 'Tuần này']);
  styleHeader(hNguon);
  [
    ['Giới thiệu', `${baoCao.nguon_tuan_truoc.gioi_thieu}%`, `${baoCao.nguon_tuan_nay.gioi_thieu}%`],
    ['Tự khai thác', `${baoCao.nguon_tuan_truoc.tu_khai_thac}%`, `${baoCao.nguon_tuan_nay.tu_khai_thac}%`],
    ['Hotline & Fanpage', `${baoCao.nguon_tuan_truoc.hotline_fanpage}%`, `${baoCao.nguon_tuan_nay.hotline_fanpage}%`],
    ['Đấu thầu Online', `${baoCao.nguon_tuan_truoc.dau_thau_online}%`, `${baoCao.nguon_tuan_nay.dau_thau_online}%`]
  ].forEach((r) => styleBody(s2.addRow(r)));
  s2.columns = [{ width: 32 }, { width: 18 }, { width: 18 }];

  // Helper sheet Kế hoạch
  const addPlanSheet = (tenSheet: string, ds: DongKeHoachDuAnTuan[], coDeXuat: boolean) => {
    const sh = wb.addWorksheet(tenSheet);
    const cols = ['TÊN KHÁCH HÀNG', 'ĐƠN VỊ / GĐ DA', 'SẢN PHẨM', 'TRẠNG THÁI', 'DOANH THU KÝ KẾT', 'DOANH THU TIỀN VỀ'];
    if (coDeXuat) cols.push('ĐỀ XUẤT');
    styleHeader(sh.addRow(cols));
    for (const d of ds) {
      const row = [
        d.ten_khach_hang,
        d.giam_doc_du_an,
        d.san_pham,
        d.trang_thai,
        d.doanh_thu_ky_ket,
        d.ghi_chu_tien_ve ? `${fmtTien(d.doanh_thu_tien_ve)} (${d.ghi_chu_tien_ve})` : d.doanh_thu_tien_ve
      ];
      if (coDeXuat) row.push(d.de_xuat || '');
      styleBody(sh.addRow(row));
    }
    sh.columns = [
      { width: 30 },
      { width: 18 },
      { width: 34 },
      { width: 22 },
      { width: 20 },
      { width: 24 },
      ...(coDeXuat ? [{ width: 28 }] : [])
    ];
  };

  addPlanSheet('KH_Dong_Tien', baoCao.ke_hoach_dong_tien, false);
  addPlanSheet('KH_DA_Tiem_Nang', baoCao.ke_hoach_tiem_nang, false);

  // Sheet Lịch công tác tuần tới
  const sLich = wb.addWorksheet('Lich_Cong_Tac_Tuan');
  sLich.addRow([`LỊCH CÔNG TÁC ${infoTuanToi.nhanTieuDe} (${infoTuanToi.khoangNgayNhan})`]);
  styleHeader(sLich.addRow(['NGÀY', 'GIỜ', 'NHÂN SỰ', 'KHÁCH HÀNG / ĐỊA BÀN', 'NỘI DUNG CÔNG TÁC', 'TRẠNG THÁI']));
  for (const l of lichTuanToi) {
    styleBody(
      sLich.addRow([
        l.ngay,
        `${l.gio_bat_dau || ''} - ${l.gio_ket_thuc || ''}`,
        l.ten_nhan_vien || baoCao.ten_nhan_vien,
        `${l.ten_khach_hang}${l.dia_diem ? ` (${l.dia_diem})` : ''}`,
        l.noi_dung || l.tieu_de,
        l.trang_thai === 'da_hoan_thanh' ? 'Đã gặp' : 'Kế hoạch'
      ])
    );
  }
  sLich.columns = [{ width: 14 }, { width: 15 }, { width: 22 }, { width: 30 }, { width: 36 }, { width: 14 }];

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_cao_tuan_${baoCao.tuan}_${baoCao.ten_nhan_vien.replace(/\s+/g, '_')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

const ModalXuatBaoCaoVDCD: React.FC<Props> = ({
  mo,
  onDong,
  baoCao,
  lichTuanToi = [],
  tieuDePhu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dangXuatExcel, setDangXuatExcel] = useState(false);

  const infoTuan = useMemo(() => phanTichTuanISO(baoCao.tuan), [baoCao.tuan]);
  const infoTuanToi = useMemo(
    () => phanTichTuanISO(dichChuyenTuanISO(baoCao.tuan, 1)),
    [baoCao.tuan]
  );

  const trangTiemNang = useMemo(
    () => chiaTrang(baoCao.ke_hoach_tiem_nang, 6),
    [baoCao.ke_hoach_tiem_nang]
  );
  const trangDongTien = useMemo(
    () => chiaTrang(baoCao.ke_hoach_dong_tien, 6),
    [baoCao.ke_hoach_dong_tien]
  );

  if (!mo) return null;

  const ttNay = baoCao.tinh_trang_tuan_nay;
  const ttTruoc = baoCao.tinh_trang_tuan_truoc;
  const tiLeChuyenDoiTiepCan = fmtPct(ttNay.bao_gia + ttNay.hop_dong, ttNay.tong_tiep_can);
  const tiLeChuyenDoiBaoGia = fmtPct(ttNay.hop_dong, ttNay.bao_gia + ttNay.hop_dong);

  const inSlidePDF = () => {
    if (!containerRef.current) return;
    const htmlSlides = containerRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=1280,height=780');
    if (!win) {
      alert('Vui lòng cho phép mở cửa sổ bật lên (pop-up) để xuất PDF.');
      return;
    }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Báo cáo ${infoTuan.nhanTieuDe} - ${baoCao.ten_nhan_vien}</title>
  ${styles}
  <style>
    @page { size: 1120px 630px; margin: 0; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .vdcd-slide { box-shadow: none !important; border: none !important; margin: 0 !important; }
    @media screen {
      body { background: #1e293b; padding: 16px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
    }
  </style>
</head>
<body>${htmlSlides}</body>
</html>`);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 550);
  };

  const handleXuatExcel = async () => {
    setDangXuatExcel(true);
    try {
      await xuatExcelBaoCaoTuanVDCD(baoCao, lichTuanToi);
    } finally {
      setDangXuatExcel(false);
    }
  };

  const renderBangKeHoach = (
    tieuDeCon: string,
    danhSach: DongKeHoachDuAnTuan[],
    coCotDeXuat = false
  ) => (
    <>
      <div className="text-center mb-4">
        <h2 className="text-[24px] font-black tracking-tight text-slate-900 uppercase">
          KẾ HOẠCH TRIỂN KHAI TUẦN TIẾP THEO
        </h2>
        <div className="text-[20px] font-black text-[#D11317] uppercase">{tieuDeCon}</div>
      </div>

      <table className="w-full border-collapse text-[12px] bg-white">
        <thead>
          <tr className="bg-[#D11317] text-white">
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[22%]">
              TÊN KHÁCH HÀNG
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[12%]">
              ĐƠN VỊ / GĐ DA
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[23%]">
              Sản phẩm
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[14%]">
              TRẠNG THÁI
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[13%]">
              DOANH THU ký kết
            </th>
            <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[16%]">
              Doanh thu tiền về
            </th>
            {coCotDeXuat && (
              <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[15%]">
                ĐỀ XUẤT
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {(danhSach.length > 0 ? danhSach : Array.from({ length: 4 }, () => null)).map((row, idx) => (
            <tr key={row?.id || idx} className="h-[54px]">
              <td className="border border-slate-700 px-2.5 py-1.5 font-medium">
                {row?.ten_khach_hang || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                {row?.giam_doc_du_an || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5">{row?.san_pham || ''}</td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                {row?.trang_thai || ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                {row ? fmtTien(row.doanh_thu_ky_ket) : ''}
              </td>
              <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                {row
                  ? [fmtTien(row.doanh_thu_tien_ve), row.ghi_chu_tien_ve ? `(${row.ghi_chu_tien_ve})` : '']
                      .filter(Boolean)
                      .join(' ')
                  : ''}
              </td>
              {coCotDeXuat && (
                <td className="border border-slate-700 px-2.5 py-1.5">{row?.de_xuat || ''}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xs flex flex-col">
      {/* Thanh công cụ modal */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0">
        <div>
          <h3 className="text-sm font-bold">
            Xem trước Slide Báo cáo {infoTuan.nhanTieuDe} — {baoCao.ten_nhan_vien}
          </h3>
          {tieuDePhu && <p className="text-xs text-slate-400">{tieuDePhu}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleXuatExcel}
            disabled={dangXuatExcel}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            {dangXuatExcel ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={inSlidePDF}
            className="h-9 px-4 rounded-xl bg-[#D11317] hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
          >
            <Printer className="size-4" />
            <span>Xuất Slide PDF (16:9)</span>
          </button>
          <button
            type="button"
            onClick={onDong}
            className="h-9 w-9 rounded-xl border border-slate-700 hover:bg-slate-800 inline-flex items-center justify-center cursor-pointer transition"
            title="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Khu vực preview các slide 16:9 */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <div ref={containerRef} className="space-y-6">
          {/* SLIDE 1: TRANG BÌA */}
          <SlideFrame nenTrang={false}>
            <div className="flex flex-col items-center text-center pt-1 pb-4 border-b border-slate-200">
              <div className="text-[11px] font-bold tracking-[0.14em] text-slate-700 uppercase">
                VIETNAM CONSTRUCTION DESIGN TECHNOLOGY CORPORATION
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-4">
                <span>MST: 2700338327</span>
                <span>Email: vipcare@vdcd.vn</span>
                <span>Hotline: (+84)888 133335</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <div className="text-[42px] font-black tracking-[0.22em] text-slate-900 leading-none">
                  <span className="text-[#D11317]">V</span>DCD
                </div>
                <div className="text-[11px] tracking-[0.55em] text-slate-500 mt-1 uppercase">
                  GROUP
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <div
                className="w-[620px] py-8 px-10 text-center text-white shadow-xl"
                style={{ backgroundColor: 'rgba(209, 19, 23, 0.94)' }}
              >
                <div className="text-[24px] font-bold tracking-wide uppercase">
                  BÁO CÁO QUẢN TRỊ
                </div>
                <div className="text-[26px] font-black tracking-wide uppercase mt-1">
                  KINH DOANH KỲ {infoTuan.nhanTieuDe}
                </div>
                <div className="text-[15px] font-semibold mt-2 uppercase tracking-wider text-white/95">
                  {baoCao.nhan_vien_id === 'tong_chi_nhanh'
                    ? `ĐƠN VỊ: ${baoCao.ten_chi_nhanh || 'AN GIANG'}`
                    : `NHÂN SỰ: ${baoCao.ten_nhan_vien} (${baoCao.ten_chi_nhanh || 'An Giang'})`}
                </div>
                <div className="text-[12px] text-white/85 mt-1">
                  Kỳ báo cáo: {infoTuan.khoangNgayNhan}/{infoTuan.nam}
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-6 bg-[#D11317] text-white text-[11px] font-bold px-2.5 py-2 rounded-sm tracking-widest">
              {infoTuan.nam}
            </div>
          </SlideFrame>

          {/* SLIDE 2: BÁO CÁO DOANH THU */}
          <SlideFrame>
            <h2 className="text-center text-[24px] font-black text-slate-900 uppercase mb-4">
              BÁO CÁO DOANH THU TUẦN {infoTuan.tuanTrongThang} THÁNG {infoTuan.thang}
            </h2>

            <table className="w-full border-collapse text-[13px] bg-white">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-3 w-[22%]"></th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    DT Tuần (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    MTD (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    YTD (VND)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    %/KPI (Tháng)
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold">
                    %/Cùng kỳ
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[40px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Doanh thu ký kết
                  </td>
                  <td className="border border-slate-700 px-3 text-right font-semibold tabular-nums">
                    {fmtTien(baoCao.dt_tuan_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.mtd_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.ytd_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {fmtPct(baoCao.mtd_ky_ket, baoCao.kpi_thang_ky_ket)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center">
                    {baoCao.cung_ky_ky_ket_pct != null ? `${baoCao.cung_ky_ky_ket_pct}%` : ''}
                  </td>
                </tr>
                <tr className="h-[40px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Doanh thu tiền về
                  </td>
                  <td className="border border-slate-700 px-3 text-right font-semibold tabular-nums">
                    {fmtTien(baoCao.dt_tuan_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.mtd_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-right tabular-nums">
                    {fmtTien(baoCao.ytd_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {fmtPct(baoCao.mtd_tien_ve, baoCao.kpi_thang_tien_ve)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center">
                    {baoCao.cung_ky_tien_ve_pct != null ? `${baoCao.cung_ky_tien_ve_pct}%` : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-[11px] italic text-slate-700 my-2.5 space-y-0.5">
              <div>• MTD: Doanh thu tích lũy từ ngày đầu tháng đến ngày báo cáo / Tổng doanh thu mục tiêu tháng</div>
              <div>• YTD: Doanh thu tích lũy từ ngày 1/1 đến ngày báo cáo / Tổng doanh thu mục tiêu năm</div>
            </div>

            <table className="w-full border-collapse text-[12px] bg-white mt-1">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[21%]">
                    TÊN CÔNG TY/ CÁ NHÂN
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[29%]">
                    TÊN DỰ ÁN
                    <div className="text-[10px] font-normal">(Mã DV + Tên dự án)</div>
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[16%]">
                    TRẠNG THÁI
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[17%]">
                    DOANH THU KÝ KẾT
                  </th>
                  <th className="border border-slate-700 py-2.5 px-2.5 text-center font-bold w-[17%]">
                    DOANH THU TIỀN VỀ
                  </th>
                </tr>
              </thead>
              <tbody>
                {(baoCao.chi_tiet_doanh_thu.length > 0
                  ? baoCao.chi_tiet_doanh_thu.slice(0, 5)
                  : [null, null]
                ).map((d, idx) => (
                  <tr key={d?.id || idx} className="h-[44px]">
                    <td className="border border-slate-700 px-2.5 py-1.5 font-medium">
                      {d?.ten_khach_hang || ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5">{d?.ten_du_an || ''}</td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-center">
                      {d?.trang_thai || ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                      {d ? fmtTien(d.doanh_thu_ky_ket) : ''}
                    </td>
                    <td className="border border-slate-700 px-2.5 py-1.5 text-right tabular-nums">
                      {d ? fmtTien(d.doanh_thu_tien_ve) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SlideFrame>

          {/* SLIDE 3: BÁO CÁO TÌNH TRẠNG DỰ ÁN */}
          <SlideFrame>
            <div className="text-center mb-4">
              <h2 className="text-[24px] font-black text-slate-900 uppercase">
                BÁO CÁO TÌNH TRẠNG DỰ ÁN
              </h2>
              <div className="text-[18px] font-bold text-slate-800">Triển khai trong tuần</div>
            </div>

            <table className="w-full border-collapse text-[13px] bg-white mb-5">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2.5 px-3 w-[34%]"></th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold w-[33%]">
                    Tuần trước
                  </th>
                  <th className="border border-slate-700 py-2.5 px-3 text-center font-bold w-[33%]">
                    Tuần này
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['TỔNG TIẾP CẬN', ttTruoc.tong_tiep_can, ttNay.tong_tiep_can],
                  ['ĐANG TIẾP CẬN', ttTruoc.dang_tiep_can, ttNay.dang_tiep_can],
                  ['BÁO GIÁ', ttTruoc.bao_gia, ttNay.bao_gia],
                  ['HỢP ĐỒNG', ttTruoc.hop_dong, ttNay.hop_dong],
                  ['KHÔNG PHÙ HỢP', ttTruoc.khong_phu_hop || '', ttNay.khong_phu_hop || '']
                ].map(([nhan, tr, nay], idx) => (
                  <tr key={idx} className="h-[36px]">
                    <td className="border border-slate-700 px-3 font-extrabold text-center">{nhan}</td>
                    <td className="border border-slate-700 px-3 text-center font-semibold tabular-nums">
                      {tr}
                    </td>
                    <td className="border border-slate-700 px-3 text-center font-semibold tabular-nums">
                      {nay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full border-collapse text-[13px] bg-white">
              <thead>
                <tr className="bg-[#D11317] text-white">
                  <th className="border border-slate-700 py-2 px-3 w-[22%]"></th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[22%]">
                    Tổng tiếp cận
                  </th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[28%]">
                    Tỉ lệ chuyển đổi
                    <div className="text-[11px] font-normal">Tiếp cận → Báo giá và Hợp đồng</div>
                  </th>
                  <th className="border border-slate-700 py-2 px-3 text-center font-bold w-[28%]">
                    Tỉ lệ chuyển đổi
                    <div className="text-[11px] font-normal">Báo giá → Hợp đồng</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">Kế hoạch</td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {baoCao.ke_hoach_tiep_can_tuan_nay}
                  </td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                </tr>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">Thực hiện</td>
                  <td className="border border-slate-700 px-3 text-center font-semibold">
                    {baoCao.thuc_hien_tiep_can_tuan_nay}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {tiLeChuyenDoiTiepCan}
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {tiLeChuyenDoiBaoGia}
                  </td>
                </tr>
                <tr className="h-[36px]">
                  <td className="border border-slate-700 px-3 font-bold text-center">
                    Thực hiện/kế hoạch
                  </td>
                  <td className="border border-slate-700 px-3 text-center font-bold">
                    {fmtPctInt(baoCao.thuc_hien_tiep_can_tuan_nay, baoCao.ke_hoach_tiep_can_tuan_nay)}
                  </td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                  <td className="border border-slate-700 px-3 text-center"></td>
                </tr>
              </tbody>
            </table>

            <div className="mt-auto pt-2 text-[11px] italic font-bold text-slate-800">
              Chỉ áp dụng với các dự án đang triển khai, không bao gồm các dự án đã nghiệm thu hoặc dừng hoạt động ở các kỳ trước
            </div>
          </SlideFrame>

          {/* SLIDE 4: CƠ CẤU NGUỒN TIẾP CẬN */}
          <SlideFrame>
            <h2 className="text-center text-[24px] font-black text-slate-900 uppercase mb-8">
              CƠ CẤU NGUỒN TIẾP CẬN DỰ ÁN
            </h2>

            <table className="w-full border-collapse text-[14px] bg-white my-auto">
              <thead>
                <tr className="bg-[#D11317] text-white h-[48px]">
                  <th className="border border-slate-700 px-4 w-[36%]"></th>
                  <th className="border border-slate-700 px-4 text-center font-bold w-[32%]">
                    Tuần trước
                  </th>
                  <th className="border border-slate-700 px-4 text-center font-bold w-[32%]">
                    Tuần này
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Giới thiệu', baoCao.nguon_tuan_truoc.gioi_thieu, baoCao.nguon_tuan_nay.gioi_thieu],
                  ['Tự khai thác', baoCao.nguon_tuan_truoc.tu_khai_thac, baoCao.nguon_tuan_nay.tu_khai_thac],
                  ['Hotline & Fanpage', baoCao.nguon_tuan_truoc.hotline_fanpage, baoCao.nguon_tuan_nay.hotline_fanpage],
                  ['Đấu thầu Online', baoCao.nguon_tuan_truoc.dau_thau_online, baoCao.nguon_tuan_nay.dau_thau_online]
                ].map(([nhan, tr, nay], idx) => (
                  <tr key={idx} className="h-[68px]">
                    <td className="border border-slate-700 px-4 font-bold">{nhan}</td>
                    <td className="border border-slate-700 px-4 text-center font-semibold">
                      {Number(tr) > 0 ? `${tr}%` : ''}
                    </td>
                    <td className="border border-slate-700 px-4 text-center font-semibold">
                      {Number(nay) > 0 ? `${nay}%` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SlideFrame>

          {/* SLIDE 5+: KẾ HOẠCH DÒNG TIỀN */}
          {trangDongTien.map((items, idx) => (
            <SlideFrame key={`dt_${idx}`}>
              {renderBangKeHoach('- DÒNG TIỀN -', items, false)}
            </SlideFrame>
          ))}

          {/* SLIDE 6+: KẾ HOẠCH DỰ ÁN TIỀM NĂNG */}
          {trangTiemNang.map((items, idx) => (
            <SlideFrame key={`tn_${idx}`}>
              {renderBangKeHoach('- DA TIỀM NĂNG -', items, false)}
            </SlideFrame>
          ))}

          {/* SLIDE LỊCH CÔNG TÁC TUẦN TIẾP THEO */}
          {lichTuanToi.length > 0 &&
            chiaTrang(lichTuanToi, 7).map((items, idx) => (
              <SlideFrame key={`lich_${idx}`}>
                <div className="text-center mb-4">
                  <h2 className="text-[24px] font-black text-slate-900 uppercase">
                    LỊCH CÔNG TÁC {infoTuanToi.nhanTieuDe}
                  </h2>
                  <div className="text-[14px] font-semibold text-[#D11317]">
                    {infoTuanToi.khoangNgayNhan}/{infoTuanToi.nam} • Mục tiêu tiếp cận tuần tới: {baoCao.ke_hoach_tiep_can_tuan_toi} dự án
                  </div>
                </div>
                <table className="w-full border-collapse text-[12px] bg-white">
                  <thead>
                    <tr className="bg-[#D11317] text-white">
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[12%]">NGÀY</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[13%]">GIỜ</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[17%]">NHÂN SỰ</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[25%]">KHÁCH HÀNG / ĐỊA BÀN</th>
                      <th className="border border-slate-700 py-2 px-2.5 text-center w-[33%]">NỘI DUNG CÔNG TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((l) => (
                      <tr key={l.id} className="h-[48px]">
                        <td className="border border-slate-700 px-2.5 text-center font-semibold">
                          {l.ngay}
                        </td>
                        <td className="border border-slate-700 px-2.5 text-center">
                          {l.gio_bat_dau} - {l.gio_ket_thuc}
                        </td>
                        <td className="border border-slate-700 px-2.5 font-medium">
                          {l.ten_nhan_vien || baoCao.ten_nhan_vien}
                        </td>
                        <td className="border border-slate-700 px-2.5">
                          <div className="font-semibold">{l.ten_khach_hang}</div>
                          {l.dia_diem && <div className="text-[10px] text-slate-500">{l.dia_diem}</div>}
                        </td>
                        <td className="border border-slate-700 px-2.5">
                          {l.noi_dung || l.tieu_de}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SlideFrame>
            ))}

          {/* SLIDE CUỐI: CẢM ƠN */}
          <SlideFrame>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-[28px] italic font-extrabold text-slate-900 text-center">
                Xin trân trọng cảm ơn sự theo dõi của Ban Lãnh đạo!
              </div>
            </div>
          </SlideFrame>
        </div>
      </div>
    </div>
  );
};

export default ModalXuatBaoCaoVDCD;
