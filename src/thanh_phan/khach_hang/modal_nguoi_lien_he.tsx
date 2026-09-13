'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Phone, Mail, Briefcase, FileText } from 'lucide-react';
import type { NguoiLienHe } from '../../thu_vien/types/khach_hang';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  taoNguoiLienHeMoi,
  capNhatNguoiLienHe
} from '../../dich_vu/khach_hang/dich_vu_nguoi_lien_he';

interface ModalNguoiLienHeProps {
  mo: boolean;
  onDong: () => void;
  khachHangId: string;
  tenKhachHang?: string;
  dangSua?: NguoiLienHe | null;
  onLuuThanhCong: () => void;
  nguoiDungHienTai?: Pick<NhanSu, 'id'> | null;
}

export const ModalNguoiLienHe: React.FC<ModalNguoiLienHeProps> = ({
  mo,
  onDong,
  khachHangId,
  tenKhachHang,
  dangSua,
  onLuuThanhCong,
  nguoiDungHienTai
}) => {
  const [hoVaTen, setHoVaTen] = useState('');
  const [chucVu, setChucVu] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    if (dangSua) {
      setHoVaTen(dangSua.ho_va_ten || '');
      setChucVu(dangSua.chuc_vu || '');
      setSoDienThoai(dangSua.so_dien_thoai || '');
      setEmail(dangSua.email || '');
      setGhiChu(dangSua.ghi_chu || '');
    } else {
      setHoVaTen('');
      setChucVu('');
      setSoDienThoai('');
      setEmail('');
      setGhiChu('');
    }
    setLoi(null);
  }, [dangSua, mo]);

  if (!mo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoVaTen.trim()) {
      setLoi('Vui lòng nhập họ và tên người liên hệ.');
      return;
    }

    setLoi(null);
    setDangLuu(true);
    try {
      if (dangSua) {
        await capNhatNguoiLienHe(
          {
            id: dangSua.id,
            ho_va_ten: hoVaTen.trim(),
            chuc_vu: chucVu.trim() || null,
            so_dien_thoai: soDienThoai.trim() || null,
            email: email.trim() || null,
            ghi_chu: ghiChu.trim() || null
          },
          nguoiDungHienTai
        );
      } else {
        await taoNguoiLienHeMoi(
          {
            khach_hang_id: khachHangId,
            ho_va_ten: hoVaTen.trim(),
            chuc_vu: chucVu.trim() || null,
            so_dien_thoai: soDienThoai.trim() || null,
            email: email.trim() || null,
            ghi_chu: ghiChu.trim() || null
          },
          nguoiDungHienTai,
          tenKhachHang ? { ten_khach_hang: tenKhachHang } : null
        );
      }
      onLuuThanhCong();
      onDong();
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi xảy ra khi lưu người liên hệ.');
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              {dangSua ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {dangSua ? 'Chỉnh sửa Người liên hệ' : 'Thêm Người liên hệ mới'}
              </h3>
              {tenKhachHang && (
                <p className="text-xs text-slate-500">Khách hàng: {tenKhachHang}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onDong}
            disabled={dangLuu}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loi && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {loi}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={hoVaTen}
              onChange={(e) => setHoVaTen(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Chức vụ
            </label>
            <input
              type="text"
              value={chucVu}
              onChange={(e) => setChucVu(e.target.value)}
              placeholder="VD: Giám đốc, Kế toán trưởng, Trưởng phòng mua hàng..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Số điện thoại
              </label>
              <input
                type="tel"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                placeholder="0912345678"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@congty.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" /> Ghi chú
            </label>
            <textarea
              rows={2}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú thêm về người liên hệ này (vai trò quyết định, thói quen liên hệ...)"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onDong}
              disabled={dangLuu}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangLuu || !hoVaTen.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {dangLuu ? 'Đang lưu...' : dangSua ? 'Cập nhật' : 'Thêm người liên hệ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
