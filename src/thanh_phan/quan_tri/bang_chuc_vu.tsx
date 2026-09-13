'use client';

import { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  Save
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import type { ChucVu } from '../../thu_vien/types/nhan_su';
import type { TaoMoiChucVuDTO, CapNhatChucVuDTO } from '../../dich_vu/nhan_su/dich_vu_chuc_vu';
import { Nut } from '../ui';

interface BangChucVuProps {
  danhSach: ChucVu[];
  dangTai: boolean;
  onLuu: (dto: TaoMoiChucVuDTO | CapNhatChucVuDTO, idSua?: string) => Promise<void>;
  onXoa: (cv: ChucVu) => Promise<void>;
  onKhoiPhuc: (cv: ChucVu) => Promise<void>;
}

export default function BangChucVu({
  danhSach,
  dangTai,
  onLuu,
  onXoa,
  onKhoiPhuc
}: BangChucVuProps) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [trangThaiLoc, setTrangThaiLoc] = useState<'hoat_dong' | 'da_xoa' | 'tat_ca'>('hoat_dong');
  const [moModal, setMoModal] = useState(false);
  const [dangSua, setDangSua] = useState<ChucVu | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<TaoMoiChucVuDTO>({
    ten_chuc_vu: '',
    ma_chuc_vu: null,
    mo_ta: null,
    thu_tu_sap_xep: 0,
    trang_thai_du_lieu: 'hoat_dong'
  });

  const moThemMoi = () => {
    setDangSua(null);
    setLoi(null);
    setForm({
      ten_chuc_vu: '',
      ma_chuc_vu: null,
      mo_ta: null,
      thu_tu_sap_xep: (danhSach.length + 1) * 10,
      trang_thai_du_lieu: 'hoat_dong'
    });
    setMoModal(true);
  };

  const moChinhSua = (item: ChucVu) => {
    setDangSua(item);
    setLoi(null);
    setForm({
      ten_chuc_vu: item.ten_chuc_vu,
      ma_chuc_vu: item.ma_chuc_vu,
      mo_ta: item.mo_ta,
      thu_tu_sap_xep: item.thu_tu_sap_xep ?? 0,
      trang_thai_du_lieu: item.trang_thai_du_lieu
    });
    setMoModal(true);
  };

  const handleLuu = async () => {
    if (!form.ten_chuc_vu.trim()) {
      setLoi('Vui lòng nhập tên chức vụ');
      return;
    }
    setDangLuu(true);
    setLoi(null);
    try {
      if (dangSua) {
        await onLuu({ ...form, id: dangSua.id } as CapNhatChucVuDTO, dangSua.id);
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
      const matchTen = item.ten_chuc_vu.toLowerCase().includes(q);
      const matchMa = item.ma_chuc_vu?.toLowerCase().includes(q);
      return matchTen || matchMa;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Chức danh công việc</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vị trí chuyên môn trong doanh nghiệp (Tổng giám đốc, Trưởng phòng kinh doanh, Kỹ sư...)</p>
        </div>
        <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoi}>
          Thêm chức vụ
        </Nut>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm tên hoặc mã chức vụ..."
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
          Không tìm thấy chức vụ nào phù hợp.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left w-12">STT</th>
                <th className="p-3 text-left w-28">Mã</th>
                <th className="p-3 text-left">Tên chức vụ</th>
                <th className="p-3 text-left">Mô tả</th>
                <th className="p-3 text-center w-20">Thứ tự</th>
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
                    {item.ma_chuc_vu || '—'}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.ten_chuc_vu}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {item.mo_ta || <span className="text-slate-400 italic">Chưa có mô tả</span>}
                  </td>
                  <td className="p-3 text-center text-xs text-slate-500 tabular-nums">
                    {item.thu_tu_sap_xep ?? 0}
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
                            if (!confirm(`Xác nhận xóa chức vụ "${item.ten_chuc_vu}"?`)) return;
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
                <div className="size-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Briefcase className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSua ? 'Sửa chức danh' : 'Thêm chức danh mới'}
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
                  Tên chức vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.ten_chuc_vu}
                  onChange={(e) => setForm({ ...form, ten_chuc_vu: e.target.value })}
                  placeholder="Ví dụ: Giám đốc kinh doanh, Kỹ sư giải pháp..."
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Mã chức vụ
                  </label>
                  <input
                    value={form.ma_chuc_vu ?? ''}
                    onChange={(e) => setForm({ ...form, ma_chuc_vu: e.target.value || null })}
                    placeholder="VD: GDKD, KSGP"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={form.thu_tu_sap_xep ?? 0}
                    onChange={(e) => setForm({ ...form, thu_tu_sap_xep: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mô tả chức năng
                </label>
                <textarea
                  rows={2}
                  value={form.mo_ta ?? ''}
                  onChange={(e) => setForm({ ...form, mo_ta: e.target.value || null })}
                  placeholder="Mô tả phạm vi trách nhiệm (nếu có)..."
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
