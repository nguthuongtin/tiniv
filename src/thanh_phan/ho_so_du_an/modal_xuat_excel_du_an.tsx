'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Layers,
  CheckSquare,
  X,
  Loader2
} from 'lucide-react';
import type { HoSoDuAn, TienDoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import { xuatExcelTienDoDuAn } from '../../dich_vu/ho_so_du_an/dich_vu_xuat_excel_tien_do';

export type CheDoXuat = 'tat_ca' | 'bo_loc' | 'da_chon';

interface ModalXuatExcelDuAnProps {
  mo: boolean;
  onDong: () => void;
  tatCaDuAn: HoSoDuAn[];
  duAnTheoBoLoc: HoSoDuAn[];
  duAnDaChon: HoSoDuAn[];
  dsKhachHang: KhachHang[];
  dsNhanSu: NhanSu[];
  dsTienDo: TienDoDuAn[];
  tenGiaiDoan?: Record<string, { nhan: string }>;
  cheDoMacDinh?: CheDoXuat;
}

export default function ModalXuatExcelDuAn({
  mo,
  onDong,
  tatCaDuAn,
  duAnTheoBoLoc,
  duAnDaChon,
  dsKhachHang,
  dsNhanSu,
  dsTienDo,
  tenGiaiDoan = {},
  cheDoMacDinh
}: ModalXuatExcelDuAnProps) {
  const [cheDo, setCheDo] = useState<CheDoXuat>(() => {
    if (cheDoMacDinh) return cheDoMacDinh;
    if (duAnDaChon.length > 0) return 'da_chon';
    if (duAnTheoBoLoc.length < tatCaDuAn.length) return 'bo_loc';
    return 'tat_ca';
  });

  const [dangXuat, setDangXuat] = useState(false);

  // Cập nhật chế độ mặc định khi modal mở
  React.useEffect(() => {
    if (mo) {
      if (cheDoMacDinh) setCheDo(cheDoMacDinh);
      else if (duAnDaChon.length > 0) setCheDo('da_chon');
      else if (duAnTheoBoLoc.length < tatCaDuAn.length) setCheDo('bo_loc');
      else setCheDo('tat_ca');
    }
  }, [mo, cheDoMacDinh, duAnDaChon.length, duAnTheoBoLoc.length, tatCaDuAn.length]);

  if (!mo) return null;

  const layDanhSachCanXuat = (): HoSoDuAn[] => {
    if (cheDo === 'da_chon') return duAnDaChon;
    if (cheDo === 'bo_loc') return duAnTheoBoLoc;
    return tatCaDuAn;
  };

  const danhSachCanXuat = layDanhSachCanXuat();

  const handleXuatExcel = async () => {
    if (danhSachCanXuat.length === 0) return;
    setDangXuat(true);
    try {
      let tenTep = 'Tien_Do_Du_An';
      const dateStr = new Date().toISOString().slice(0, 10);
      if (cheDo === 'da_chon') {
        tenTep = `Tien_Do_${danhSachCanXuat.length}_Du_An_Chon_${dateStr}.xlsx`;
      } else if (cheDo === 'bo_loc') {
        tenTep = `Tien_Do_Du_An_Bo_Loc_${dateStr}.xlsx`;
      } else {
        tenTep = `Tien_Do_Tat_Ca_Du_An_${dateStr}.xlsx`;
      }

      await xuatExcelTienDoDuAn({
        danhSachDuAn: danhSachCanXuat,
        dsKhachHang,
        dsNhanSu,
        dsTienDo,
        tenGiaiDoan,
        tenTep
      });
      onDong();
    } catch (e) {
      console.error('Lỗi xuất Excel:', e);
      alert('Đã xảy ra lỗi khi tạo file Excel. Vui lòng thử lại!');
    } finally {
      setDangXuat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xuất file Excel Tiến độ dự án
              </h3>
              <p className="text-xs text-slate-500">
                Định dạng chuẩn theo biểu mẫu theo dõi tiến độ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Nội dung chọn 3 chế độ */}
        <div className="p-5 space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Chọn phạm vi dự án cần xuất:
          </label>

          {/* Lựa chọn 1: Xuất tất cả */}
          <div
            onClick={() => setCheDo('tat_ca')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              cheDo === 'tat_ca'
                ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="radio"
              name="che_do_xuat"
              checked={cheDo === 'tat_ca'}
              onChange={() => setCheDo('tat_ca')}
              className="mt-1 text-emerald-700 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Layers className="size-4 text-emerald-700" />
                  1. Xuất tất cả dự án
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {tatCaDuAn.length} dự án
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xuất toàn bộ các hồ sơ dự án hiện có trong hệ thống
              </p>
            </div>
          </div>

          {/* Lựa chọn 2: Xuất theo bộ lọc */}
          <div
            onClick={() => setCheDo('bo_loc')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              cheDo === 'bo_loc'
                ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="radio"
              name="che_do_xuat"
              checked={cheDo === 'bo_loc'}
              onChange={() => setCheDo('bo_loc')}
              className="mt-1 text-emerald-700 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Filter className="size-4 text-[#107555]" />
                  2. Xuất theo bộ lọc đang xem
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {duAnTheoBoLoc.length} dự án
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ xuất các dự án đang hiển thị sau khi lọc tìm kiếm
              </p>
            </div>
          </div>

          {/* Lựa chọn 3: Xuất các dự án được chọn */}
          <div
            onClick={() => {
              if (duAnDaChon.length > 0) setCheDo('da_chon');
            }}
            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
              duAnDaChon.length === 0
                ? 'opacity-60 bg-slate-50/50 border-slate-200 cursor-not-allowed'
                : cheDo === 'da_chon'
                ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-xs cursor-pointer'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
            }`}
          >
            <input
              type="radio"
              name="che_do_xuat"
              checked={cheDo === 'da_chon'}
              disabled={duAnDaChon.length === 0}
              onChange={() => setCheDo('da_chon')}
              className="mt-1 text-emerald-700 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="size-4 text-emerald-700" />
                  3. Xuất các dự án được chọn
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    duAnDaChon.length > 0
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {duAnDaChon.length} dự án đã chọn
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {duAnDaChon.length > 0
                  ? 'Chỉ xuất các dự án bạn đã tích chọn trên bảng'
                  : 'Hãy tích chọn các ô vuông trên danh sách nếu muốn dùng tùy chọn này'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/80">
          <div className="text-xs text-slate-500">
            Sẽ xuất: <strong className="text-slate-900">{danhSachCanXuat.length}</strong> dự án
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDong}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={dangXuat || danhSachCanXuat.length === 0}
              onClick={handleXuatExcel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {dangXuat ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang tạo file...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Tải file Excel (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
