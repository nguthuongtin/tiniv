'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  RotateCcw,
  Save,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { CauHinhMotGiaiDoan } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import { DANH_SACH_GIAI_DOAN_MAC_DINH } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import { Nut, Hieu } from '../ui';

interface BangGiaiDoanPipelineProps {
  danhSach: CauHinhMotGiaiDoan[];
  dangTai: boolean;
  onLuu: (danhSachMoi: CauHinhMotGiaiDoan[]) => Promise<void>;
}

export default function BangGiaiDoanPipeline({
  danhSach,
  dangTai,
  onLuu
}: BangGiaiDoanPipelineProps) {
  const [dsGiaiDoan, setDsGiaiDoan] = useState<CauHinhMotGiaiDoan[]>([]);
  const [daThayDoi, setDaThayDoi] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [moModal, setMoModal] = useState(false);
  const [dangSuaIndex, setDangSuaIndex] = useState<number | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  const [form, setForm] = useState<CauHinhMotGiaiDoan>({
    stt: 1,
    key: '',
    nhan_ngan: '',
    nhan_day_du: '',
    kieu: 'primary',
    khoa_ghi_nhan_doanh_so: false
  });

  useEffect(() => {
    if (danhSach && danhSach.length > 0) {
      setDsGiaiDoan([...danhSach].sort((a, b) => a.stt - b.stt));
      setDaThayDoi(false);
    } else {
      setDsGiaiDoan([...DANH_SACH_GIAI_DOAN_MAC_DINH]);
      setDaThayDoi(false);
    }
  }, [danhSach]);

  const moThemMoi = () => {
    setDangSuaIndex(null);
    setLoi(null);
    setForm({
      stt: dsGiaiDoan.length + 1,
      key: '',
      nhan_ngan: '',
      nhan_day_du: '',
      kieu: 'primary',
      khoa_ghi_nhan_doanh_so: false
    });
    setMoModal(true);
  };

  const moChinhSua = (gd: CauHinhMotGiaiDoan, idx: number) => {
    setDangSuaIndex(idx);
    setLoi(null);
    setForm({ ...gd });
    setMoModal(true);
  };

  const xuLyLuuModal = () => {
    if (!form.nhan_ngan.trim()) {
      setLoi('Vui lòng nhập tên ngắn');
      return;
    }
    if (!form.nhan_day_du.trim()) {
      setLoi('Vui lòng nhập tên đầy đủ');
      return;
    }
    let keyChuan = form.key?.trim();
    if (!keyChuan) {
      keyChuan = form.nhan_ngan
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
    }

    const itemCapNhat: CauHinhMotGiaiDoan = {
      ...form,
      key: keyChuan,
      nhan_ngan: form.nhan_ngan.trim(),
      nhan_day_du: form.nhan_day_du.trim()
    };

    let danhSachMoi: CauHinhMotGiaiDoan[];
    if (dangSuaIndex !== null) {
      danhSachMoi = dsGiaiDoan.map((x, i) => (i === dangSuaIndex ? itemCapNhat : x));
    } else {
      danhSachMoi = [...dsGiaiDoan, itemCapNhat];
    }
    danhSachMoi.sort((a, b) => a.stt - b.stt);
    setDsGiaiDoan(danhSachMoi);
    setDaThayDoi(true);
    setMoModal(false);
  };

  const toggleDoanhSo = (idx: number) => {
    const dsMoi = dsGiaiDoan.map((gd, i) =>
      i === idx ? { ...gd, khoa_ghi_nhan_doanh_so: !gd.khoa_ghi_nhan_doanh_so } : gd
    );
    setDsGiaiDoan(dsMoi);
    setDaThayDoi(true);
  };

  const xoaGiaiDoan = (idx: number) => {
    const muc = dsGiaiDoan[idx];
    if (!confirm(`Xác nhận xóa giai đoạn "${muc.nhan_day_du}"?`)) return;
    const dsMoi = dsGiaiDoan.filter((_, i) => i !== idx);
    setDsGiaiDoan(dsMoi);
    setDaThayDoi(true);
  };

  const khoiPhucMacDinh = () => {
    if (!confirm('Khôi phục danh sách giai đoạn chuẩn (10 bước mặc định)?')) return;
    setDsGiaiDoan([...DANH_SACH_GIAI_DOAN_MAC_DINH]);
    setDaThayDoi(true);
  };

  const handleLuuHeThong = async () => {
    setDangLuu(true);
    try {
      await onLuu(dsGiaiDoan);
      setDaThayDoi(false);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Vòng đời & Giai đoạn Dự án (Pipeline)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình các bước trong phễu kinh doanh và mốc ghi nhận doanh thu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Nut kieu="secondary" kich_thuoc="sm" icon_trai={RotateCcw} onClick={khoiPhucMacDinh}>
            Mặc định
          </Nut>
          <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoi}>
            Thêm giai đoạn
          </Nut>
          <Nut
            kieu="primary"
            kich_thuoc="sm"
            icon_trai={dangLuu ? Loader2 : Save}
            onClick={handleLuuHeThong}
            disabled={!daThayDoi || dangLuu}
          >
            {dangLuu ? 'Đang lưu...' : daThayDoi ? 'Lưu thay đổi' : 'Đã đồng bộ'}
          </Nut>
        </div>
      </div>

      {dangTai ? (
        <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Đang tải cấu hình giai đoạn...</span>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-center w-14">STT</th>
                <th className="p-3 text-left">Tên giai đoạn</th>
                <th className="p-3 text-left w-36">Mã (key)</th>
                <th className="p-3 text-left w-32">Badge hiển thị</th>
                <th className="p-3 text-center w-36">Ghi nhận doanh số</th>
                <th className="p-3 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dsGiaiDoan.map((gd, idx) => (
                <tr key={gd.key || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-center text-slate-400 text-xs font-semibold tabular-nums">
                    {gd.stt}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{gd.nhan_day_du}</div>
                    <div className="text-xs text-slate-500">{gd.nhan_ngan}</div>
                  </td>
                  <td className="p-3 font-mono text-xs text-primary font-medium">
                    {gd.key}
                  </td>
                  <td className="p-3">
                    <Hieu kieu={gd.kieu} kich_thuoc="sm">
                      {gd.nhan_ngan}
                    </Hieu>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleDoanhSo(idx)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition',
                        gd.khoa_ghi_nhan_doanh_so
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {gd.khoa_ghi_nhan_doanh_so ? (
                        <>
                          <Check className="size-3 text-emerald-600" /> Có tính
                        </>
                      ) : (
                        <>
                          <X className="size-3 text-slate-400" /> Không
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => moChinhSua(gd, idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => xoaGiaiDoan(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                        title="Xóa giai đoạn"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
                  <Settings className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSuaIndex !== null ? 'Sửa giai đoạn' : 'Thêm giai đoạn mới'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Thứ tự bước (STT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stt}
                    onChange={(e) => setForm({ ...form, stt: parseInt(e.target.value) || 1 })}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Màu sắc Badge
                  </label>
                  <select
                    value={form.kieu}
                    onChange={(e) => setForm({ ...form, kieu: e.target.value as any })}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                  >
                    <option value="muted">Xám (Muted)</option>
                    <option value="primary">Xanh dương (Primary)</option>
                    <option value="warning">Vàng cam (Warning)</option>
                    <option value="success">Xanh lá (Success)</option>
                    <option value="danger">Đỏ (Danger)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên đầy đủ hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.nhan_day_du}
                  onChange={(e) => setForm({ ...form, nhan_day_du: e.target.value })}
                  placeholder="Ví dụ: 1. Mới tạo, 5. Báo giá..."
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Tên ngắn (trên Stepper) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={form.nhan_ngan}
                    onChange={(e) => setForm({ ...form, nhan_ngan: e.target.value })}
                    placeholder="VD: Báo giá"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Mã hệ thống (key)
                  </label>
                  <input
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    placeholder="VD: bao_gia"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Ghi nhận doanh thu</div>
                  <div className="text-xs text-slate-500">
                    Tích bật nếu giai đoạn này được tính vào giá trị chốt hợp đồng / KPI doanh số
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, khoa_ghi_nhan_doanh_so: !form.khoa_ghi_nhan_doanh_so })}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition',
                    form.khoa_ghi_nhan_doanh_so
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  )}
                >
                  {form.khoa_ghi_nhan_doanh_so ? 'Đang bật' : 'Đang tắt'}
                </button>
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
              <Nut kieu="primary" kich_thuoc="sm" icon_trai={Save} onClick={xuLyLuuModal}>
                Xác nhận
              </Nut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
