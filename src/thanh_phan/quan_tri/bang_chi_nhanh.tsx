'use client';

import { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  Save,
  Phone,
  MapPin
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import type { ChiNhanh } from '../../thu_vien/types/nhan_su';
import type { TaoMoiChiNhanhDTO, CapNhatChiNhanhDTO } from '../../dich_vu/co_cau_to_chuc/dich_vu_chi_nhanh';
import { Nut, Hieu } from '../ui';

interface BangChiNhanhProps {
  danhSach: ChiNhanh[];
  dangTai: boolean;
  onLuu: (dto: TaoMoiChiNhanhDTO | CapNhatChiNhanhDTO, idSua?: string) => Promise<void>;
  onXoa: (cn: ChiNhanh) => Promise<void>;
  onKhoiPhuc: (cn: ChiNhanh) => Promise<void>;
}

export default function BangChiNhanh({
  danhSach,
  dangTai,
  onLuu,
  onXoa,
  onKhoiPhuc
}: BangChiNhanhProps) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [trangThaiLoc, setTrangThaiLoc] = useState<'hoat_dong' | 'da_xoa' | 'tat_ca'>('hoat_dong');
  const [moModal, setMoModal] = useState(false);
  const [dangSua, setDangSua] = useState<ChiNhanh | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<TaoMoiChiNhanhDTO>({
    ten_chi_nhanh: '',
    ma_chi_nhanh: null,
    dia_chi: null,
    so_dien_thoai: null,
    ghi_chu: null,
    trang_thai_du_lieu: 'hoat_dong'
  });

  const moThemMoi = () => {
    setDangSua(null);
    setLoi(null);
    setForm({
      ten_chi_nhanh: '',
      ma_chi_nhanh: null,
      dia_chi: null,
      so_dien_thoai: null,
      ghi_chu: null,
      trang_thai_du_lieu: 'hoat_dong'
    });
    setMoModal(true);
  };

  const moChinhSua = (item: ChiNhanh) => {
    setDangSua(item);
    setLoi(null);
    setForm({
      ten_chi_nhanh: item.ten_chi_nhanh,
      ma_chi_nhanh: item.ma_chi_nhanh,
      dia_chi: item.dia_chi,
      so_dien_thoai: item.so_dien_thoai,
      ghi_chu: item.ghi_chu,
      trang_thai_du_lieu: item.trang_thai_du_lieu
    });
    setMoModal(true);
  };

  const handleLuu = async () => {
    if (!form.ten_chi_nhanh.trim()) {
      setLoi('Vui lòng nhập tên chi nhánh');
      return;
    }
    setDangLuu(true);
    setLoi(null);
    try {
      if (dangSua) {
        await onLuu({ ...form, id: dangSua.id } as CapNhatChiNhanhDTO, dangSua.id);
      } else {
        await onLuu(form);
      }
      setMoModal(false);
    } catch (err: any) {
      setLoi(err?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuu(false);
    }
  };

  const dsLoc = danhSach.filter((item) => {
    if (trangThaiLoc !== 'tat_ca' && item.trang_thai_du_lieu !== trangThaiLoc) return false;
    if (tuKhoa.trim()) {
      const q = tuKhoa.toLowerCase();
      const matchTen = item.ten_chi_nhanh.toLowerCase().includes(q);
      const matchMa = item.ma_chi_nhanh?.toLowerCase().includes(q);
      const matchDiaChi = item.dia_chi?.toLowerCase().includes(q);
      return matchTen || matchMa || matchDiaChi;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Chi nhánh</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý mạng lưới chi nhánh và văn phòng giao dịch</p>
        </div>
        <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoi}>
          Thêm chi nhánh
        </Nut>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm theo tên, mã hoặc địa chỉ..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
        <select
          value={trangThaiLoc}
          onChange={(e) => setTrangThaiLoc(e.target.value as any)}
          className="h-9 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-slate-700"
        >
          <option value="hoat_dong">Đang hoạt động</option>
          <option value="da_xoa">Đã ẩn/xóa</option>
          <option value="tat_ca">Tất cả trạng thái</option>
        </select>
      </div>

      {dangTai ? (
        <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Đang tải danh sách...</span>
        </div>
      ) : dsLoc.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Không tìm thấy chi nhánh nào phù hợp.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left w-12">STT</th>
                <th className="p-3 text-left w-28">Mã CN</th>
                <th className="p-3 text-left">Tên chi nhánh</th>
                <th className="p-3 text-left">Liên hệ & Địa chỉ</th>
                <th className="p-3 text-left w-28">Ngày tạo</th>
                <th className="p-3 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dsLoc.map((item, idx) => (
                <tr
                  key={item.id}
                  className={cn(
                    'hover:bg-slate-50/70 transition-colors',
                    item.trang_thai_du_lieu === 'da_xoa' && 'opacity-60 bg-slate-50/30'
                  )}
                >
                  <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="p-3 font-mono text-xs font-semibold text-primary">
                    {item.ma_chi_nhanh || '—'}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.ten_chi_nhanh}</div>
                    {item.ghi_chu && (
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.ghi_chu}</div>
                    )}
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      {item.so_dien_thoai && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3 text-slate-400" />
                          {item.so_dien_thoai}
                        </span>
                      )}
                      {item.dia_chi && (
                        <span className="flex items-center gap-1.5 text-slate-500 line-clamp-1">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          {item.dia_chi}
                        </span>
                      )}
                      {!item.so_dien_thoai && !item.dia_chi && <span className="text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-500 tabular-nums">
                    {formatNgay(item.ngay_tao)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => moChinhSua(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="size-4" />
                      </button>
                      {item.trang_thai_du_lieu === 'da_xoa' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            setDangXuLyId(item.id);
                            try { await onKhoiPhuc(item); } finally { setDangXuLyId(null); }
                          }}
                          disabled={dangXuLyId === item.id}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                          title="Khôi phục"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Xác nhận xóa chi nhánh "${item.ten_chi_nhanh}"?`)) return;
                            setDangXuLyId(item.id);
                            try { await onXoa(item); } finally { setDangXuLyId(null); }
                          }}
                          disabled={dangXuLyId === item.id}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {moModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSua ? 'Sửa thông tin chi nhánh' : 'Thêm chi nhánh mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMoModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên chi nhánh <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.ten_chi_nhanh}
                  onChange={(e) => setForm({ ...form, ten_chi_nhanh: e.target.value })}
                  placeholder="Ví dụ: Chi nhánh TP. Hồ Chí Minh"
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Mã chi nhánh
                  </label>
                  <input
                    value={form.ma_chi_nhanh ?? ''}
                    onChange={(e) => setForm({ ...form, ma_chi_nhanh: e.target.value || null })}
                    placeholder="VD: CN-HCM"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Số điện thoại
                  </label>
                  <input
                    value={form.so_dien_thoai ?? ''}
                    onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value || null })}
                    placeholder="028..."
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Địa chỉ
                </label>
                <input
                  value={form.dia_chi ?? ''}
                  onChange={(e) => setForm({ ...form, dia_chi: e.target.value || null })}
                  placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành..."
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={form.ghi_chu ?? ''}
                  onChange={(e) => setForm({ ...form, ghi_chu: e.target.value || null })}
                  placeholder="Ghi chú thêm (nếu có)..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {loi && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-medium">
                  {loi}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Nut kieu="ghost" kich_thuoc="sm" onClick={() => setMoModal(false)}>
                Hủy
              </Nut>
              <Nut
                kieu="primary"
                kich_thuoc="sm"
                icon_trai={dangLuu ? Loader2 : Save}
                onClick={handleLuu}
                disabled={dangLuu}
              >
                {dangLuu ? 'Đang lưu...' : dangSua ? 'Cập nhật' : 'Tạo mới'}
              </Nut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
