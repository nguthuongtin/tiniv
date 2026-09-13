'use client';

import { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  Save,
  Building2
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import type { PhongBan, ChiNhanh } from '../../thu_vien/types/nhan_su';
import type { TaoMoiPhongBanDTO, CapNhatPhongBanDTO } from '../../dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { Nut } from '../ui';

interface BangPhongBanProps {
  danhSach: PhongBan[];
  dsChiNhanh: ChiNhanh[];
  dangTai: boolean;
  onLuu: (dto: TaoMoiPhongBanDTO | CapNhatPhongBanDTO, idSua?: string) => Promise<void>;
  onXoa: (pb: PhongBan) => Promise<void>;
  onKhoiPhuc: (pb: PhongBan) => Promise<void>;
}

export default function BangPhongBan({
  danhSach,
  dsChiNhanh,
  dangTai,
  onLuu,
  onXoa,
  onKhoiPhuc
}: BangPhongBanProps) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [chiNhanhLoc, setChiNhanhLoc] = useState<string>('tat_ca');
  const [trangThaiLoc, setTrangThaiLoc] = useState<'hoat_dong' | 'da_xoa' | 'tat_ca'>('hoat_dong');
  const [moModal, setMoModal] = useState(false);
  const [dangSua, setDangSua] = useState<PhongBan | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<TaoMoiPhongBanDTO>({
    ten_phong_ban: '',
    chi_nhanh_id: null,
    ma_phong_ban: null,
    ghi_chu: null,
    trang_thai_du_lieu: 'hoat_dong'
  });

  const moThemMoi = () => {
    setDangSua(null);
    setLoi(null);
    setForm({
      ten_phong_ban: '',
      chi_nhanh_id: dsChiNhanh.find((c) => c.trang_thai_du_lieu === 'hoat_dong')?.id || null,
      ma_phong_ban: null,
      ghi_chu: null,
      trang_thai_du_lieu: 'hoat_dong'
    });
    setMoModal(true);
  };

  const moChinhSua = (item: PhongBan) => {
    setDangSua(item);
    setLoi(null);
    setForm({
      ten_phong_ban: item.ten_phong_ban,
      chi_nhanh_id: item.chi_nhanh_id,
      ma_phong_ban: item.ma_phong_ban,
      ghi_chu: item.ghi_chu,
      trang_thai_du_lieu: item.trang_thai_du_lieu
    });
    setMoModal(true);
  };

  const handleLuu = async () => {
    if (!form.ten_phong_ban.trim()) {
      setLoi('Vui lòng nhập tên phòng ban');
      return;
    }
    setDangLuu(true);
    setLoi(null);
    try {
      if (dangSua) {
        await onLuu({ ...form, id: dangSua.id } as CapNhatPhongBanDTO, dangSua.id);
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

  const layTenChiNhanh = (cnId: string | null | undefined) => {
    if (!cnId) return 'Chưa gán';
    const found = dsChiNhanh.find((c) => c.id === cnId);
    return found ? found.ten_chi_nhanh : 'Chi nhánh khác';
  };

  const dsLoc = danhSach.filter((item) => {
    if (trangThaiLoc !== 'tat_ca' && item.trang_thai_du_lieu !== trangThaiLoc) return false;
    if (chiNhanhLoc !== 'tat_ca' && item.chi_nhanh_id !== chiNhanhLoc) return false;
    if (tuKhoa.trim()) {
      const q = tuKhoa.toLowerCase();
      const matchTen = item.ten_phong_ban.toLowerCase().includes(q);
      const matchMa = item.ma_phong_ban?.toLowerCase().includes(q);
      return matchTen || matchMa;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Phòng ban</h2>
          <p className="text-xs text-slate-500 mt-0.5">Cơ cấu phòng ban trực thuộc từng chi nhánh</p>
        </div>
        <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoi}>
          Thêm phòng ban
        </Nut>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm tên hoặc mã phòng ban..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
        <select
          value={chiNhanhLoc}
          onChange={(e) => setChiNhanhLoc(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-slate-700"
        >
          <option value="tat_ca">Tất cả chi nhánh</option>
          {dsChiNhanh
            .filter((c) => c.trang_thai_du_lieu === 'hoat_dong')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.ten_chi_nhanh}
              </option>
            ))}
        </select>
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
          Không tìm thấy phòng ban nào phù hợp.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left w-12">STT</th>
                <th className="p-3 text-left w-28">Mã PB</th>
                <th className="p-3 text-left">Tên phòng ban</th>
                <th className="p-3 text-left w-56">Chi nhánh trực thuộc</th>
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
                    {item.ma_phong_ban || '—'}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.ten_phong_ban}</div>
                    {item.ghi_chu && (
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.ghi_chu}</div>
                    )}
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">
                      <Building2 className="size-3 text-slate-500" />
                      {layTenChiNhanh(item.chi_nhanh_id)}
                    </span>
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
                            if (!confirm(`Xác nhận xóa phòng ban "${item.ten_phong_ban}"?`)) return;
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
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Layers className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSua ? 'Sửa thông tin phòng ban' : 'Thêm phòng ban mới'}
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
                  Chi nhánh trực thuộc <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.chi_nhanh_id ?? ''}
                  onChange={(e) => setForm({ ...form, chi_nhanh_id: e.target.value || null })}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                >
                  <option value="">(Chọn chi nhánh)</option>
                  {dsChiNhanh
                    .filter((c) => c.trang_thai_du_lieu === 'hoat_dong')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ten_chi_nhanh}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên phòng ban <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.ten_phong_ban}
                  onChange={(e) => setForm({ ...form, ten_phong_ban: e.target.value })}
                  placeholder="Ví dụ: Phòng Kinh doanh, Phòng Kỹ thuật..."
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mã phòng ban
                </label>
                <input
                  value={form.ma_phong_ban ?? ''}
                  onChange={(e) => setForm({ ...form, ma_phong_ban: e.target.value || null })}
                  placeholder="VD: PB-KD, PB-KT"
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
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
                  placeholder="Ghi chú chức năng nhiệm vụ (nếu có)..."
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
