'use client';

import { useState } from 'react';
import {
  Package2,
  Folder,
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  Save,
  Tag
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import { formatNgay } from '../../thu_vien/utils/format_ngay';
import type { SanPhamDichVu, NhomSanPhamDichVu } from '../../thu_vien/types/san_pham_dich_vu';
import type {
  TaoMoiSanPhamDichVuDTO,
  CapNhatSanPhamDichVuDTO
} from '../../dich_vu/san_pham_dich_vu/dich_vu_san_pham_dich_vu';
import type {
  TaoMoiNhomSanPhamDichVuDTO,
  CapNhatNhomSanPhamDichVuDTO
} from '../../dich_vu/san_pham_dich_vu/dich_vu_nhom_san_pham_dich_vu';
import { Nut, Hieu } from '../ui';

interface BangSanPhamDichVuProps {
  dsSanPham: SanPhamDichVu[];
  dsNhom: NhomSanPhamDichVu[];
  dangTai: boolean;
  onLuuSp: (dto: TaoMoiSanPhamDichVuDTO | CapNhatSanPhamDichVuDTO, idSua?: string) => Promise<void>;
  onXoaSp: (sp: SanPhamDichVu) => Promise<void>;
  onKhoiPhucSp: (sp: SanPhamDichVu) => Promise<void>;
  onLuuNhom: (dto: TaoMoiNhomSanPhamDichVuDTO | CapNhatNhomSanPhamDichVuDTO, idSua?: string) => Promise<void>;
  onXoaNhom: (nhom: NhomSanPhamDichVu) => Promise<void>;
  onKhoiPhucNhom: (nhom: NhomSanPhamDichVu) => Promise<void>;
}

const DINH_DANG_TIEN = (v: number | null | undefined): string => {
  if (!v) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
};

export default function BangSanPhamDichVu({
  dsSanPham,
  dsNhom,
  dangTai,
  onLuuSp,
  onXoaSp,
  onKhoiPhucSp,
  onLuuNhom,
  onXoaNhom,
  onKhoiPhucNhom
}: BangSanPhamDichVuProps) {
  const [tabCon, setTabCon] = useState<'san_pham' | 'nhom'>('san_pham');
  const [tuKhoa, setTuKhoa] = useState('');
  const [nhomLoc, setNhomLoc] = useState('tat_ca');
  const [loaiLoc, setLoaiLoc] = useState('tat_ca');
  const [trangThaiLoc, setTrangThaiLoc] = useState<'hoat_dong' | 'da_xoa' | 'tat_ca'>('hoat_dong');

  // State Modal San Pham
  const [moModalSp, setMoModalSp] = useState(false);
  const [dangSuaSp, setDangSuaSp] = useState<SanPhamDichVu | null>(null);
  const [dangLuuSp, setDangLuuSp] = useState(false);
  const [loiSp, setLoiSp] = useState<string | null>(null);
  const [formSp, setFormSp] = useState<TaoMoiSanPhamDichVuDTO>({
    nhom_san_pham_id: null,
    ten_san_pham: '',
    ma_san_pham: null,
    loai: 'san_pham',
    don_vi_tinh: null,
    gia_tham_khao: null,
    mo_ta: null,
    thu_tu_sap_xep: 0,
    trang_thai_du_lieu: 'hoat_dong'
  });

  // State Modal Nhom
  const [moModalNhom, setMoModalNhom] = useState(false);
  const [dangSuaNhom, setDangSuaNhom] = useState<NhomSanPhamDichVu | null>(null);
  const [dangLuuNhom, setDangLuuNhom] = useState(false);
  const [loiNhom, setLoiNhom] = useState<string | null>(null);
  const [formNhom, setFormNhom] = useState<TaoMoiNhomSanPhamDichVuDTO>({
    ten_nhom: '',
    ma_nhom: null,
    mau_sac: null,
    icon_hien_thi: null,
    mo_ta: null,
    thu_tu_sap_xep: 0,
    trang_thai_du_lieu: 'hoat_dong'
  });

  const moThemMoiSp = () => {
    setDangSuaSp(null);
    setLoiSp(null);
    setFormSp({
      nhom_san_pham_id: dsNhom.find((n) => n.trang_thai_du_lieu === 'hoat_dong')?.id || null,
      ten_san_pham: '',
      ma_san_pham: null,
      loai: 'san_pham',
      don_vi_tinh: 'Cái',
      gia_tham_khao: null,
      mo_ta: null,
      thu_tu_sap_xep: 0,
      trang_thai_du_lieu: 'hoat_dong'
    });
    setMoModalSp(true);
  };

  const moChinhSuaSp = (sp: SanPhamDichVu) => {
    setDangSuaSp(sp);
    setLoiSp(null);
    setFormSp({
      nhom_san_pham_id: sp.nhom_san_pham_id,
      ten_san_pham: sp.ten_san_pham,
      ma_san_pham: sp.ma_san_pham,
      loai: sp.loai,
      don_vi_tinh: sp.don_vi_tinh,
      gia_tham_khao: sp.gia_tham_khao,
      mo_ta: sp.mo_ta,
      thu_tu_sap_xep: sp.thu_tu_sap_xep ?? 0,
      trang_thai_du_lieu: sp.trang_thai_du_lieu
    });
    setMoModalSp(true);
  };

  const handleLuuSp = async () => {
    if (!formSp.ten_san_pham.trim()) {
      setLoiSp('Vui lòng nhập tên sản phẩm / dịch vụ');
      return;
    }
    setDangLuuSp(true);
    setLoiSp(null);
    try {
      if (dangSuaSp) {
        await onLuuSp({ ...formSp, id: dangSuaSp.id } as CapNhatSanPhamDichVuDTO, dangSuaSp.id);
      } else {
        await onLuuSp(formSp);
      }
      setMoModalSp(false);
    } catch (err: any) {
      setLoiSp(err?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuuSp(false);
    }
  };

  const moThemMoiNhom = () => {
    setDangSuaNhom(null);
    setLoiNhom(null);
    setFormNhom({
      ten_nhom: '',
      ma_nhom: null,
      mau_sac: '#3b82f6',
      icon_hien_thi: null,
      mo_ta: null,
      thu_tu_sap_xep: dsNhom.length + 1,
      trang_thai_du_lieu: 'hoat_dong'
    });
    setMoModalNhom(true);
  };

  const moChinhSuaNhom = (nhom: NhomSanPhamDichVu) => {
    setDangSuaNhom(nhom);
    setLoiNhom(null);
    setFormNhom({
      ten_nhom: nhom.ten_nhom,
      ma_nhom: nhom.ma_nhom,
      mau_sac: nhom.mau_sac,
      icon_hien_thi: nhom.icon_hien_thi,
      mo_ta: nhom.mo_ta,
      thu_tu_sap_xep: nhom.thu_tu_sap_xep ?? 0,
      trang_thai_du_lieu: nhom.trang_thai_du_lieu
    });
    setMoModalNhom(true);
  };

  const handleLuuNhom = async () => {
    if (!formNhom.ten_nhom.trim()) {
      setLoiNhom('Vui lòng nhập tên nhóm danh mục');
      return;
    }
    setDangLuuNhom(true);
    setLoiNhom(null);
    try {
      if (dangSuaNhom) {
        await onLuuNhom({ ...formNhom, id: dangSuaNhom.id } as CapNhatNhomSanPhamDichVuDTO, dangSuaNhom.id);
      } else {
        await onLuuNhom(formNhom);
      }
      setMoModalNhom(false);
    } catch (err: any) {
      setLoiNhom(err?.message || 'Có lỗi xảy ra');
    } finally {
      setDangLuuNhom(false);
    }
  };

  const layTenNhom = (nhomId: string | null | undefined) => {
    if (!nhomId) return 'Chưa phân nhóm';
    const found = dsNhom.find((n) => n.id === nhomId);
    return found ? found.ten_nhom : 'Chưa phân nhóm';
  };

  const dsSpLoc = dsSanPham.filter((item) => {
    if (trangThaiLoc !== 'tat_ca' && item.trang_thai_du_lieu !== trangThaiLoc) return false;
    if (nhomLoc !== 'tat_ca' && item.nhom_san_pham_id !== nhomLoc) return false;
    if (loaiLoc !== 'tat_ca' && item.loai !== loaiLoc) return false;
    if (tuKhoa.trim()) {
      const q = tuKhoa.toLowerCase();
      const matchTen = item.ten_san_pham.toLowerCase().includes(q);
      const matchMa = item.ma_san_pham?.toLowerCase().includes(q);
      return matchTen || matchMa;
    }
    return true;
  });

  const dsNhomLoc = dsNhom.filter((item) => {
    if (trangThaiLoc !== 'tat_ca' && item.trang_thai_du_lieu !== trangThaiLoc) return false;
    if (tuKhoa.trim()) {
      const q = tuKhoa.toLowerCase();
      const matchTen = item.ten_nhom.toLowerCase().includes(q);
      const matchMa = item.ma_nhom?.toLowerCase().includes(q);
      return matchTen || matchMa;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sản phẩm & Dịch vụ</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng giá danh mục thiết bị, phần mềm và dịch vụ triển khai
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tabCon === 'san_pham' ? (
            <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoiSp}>
              Thêm sản phẩm/DV
            </Nut>
          ) : (
            <Nut kieu="primary" kich_thuoc="sm" icon_trai={Plus} onClick={moThemMoiNhom}>
              Thêm nhóm danh mục
            </Nut>
          )}
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTabCon('san_pham')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px',
            tabCon === 'san_pham'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <Package2 className="size-4" />
          Sản phẩm & Dịch vụ ({dsSanPham.filter((s) => s.trang_thai_du_lieu === 'hoat_dong').length})
        </button>
        <button
          type="button"
          onClick={() => setTabCon('nhom')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition -mb-px',
            tabCon === 'nhom'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <Folder className="size-4" />
          Nhóm danh mục ({dsNhom.filter((n) => n.trang_thai_du_lieu === 'hoat_dong').length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder={tabCon === 'san_pham' ? 'Tìm tên hoặc mã SP/DV...' : 'Tìm tên nhóm...'}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        {tabCon === 'san_pham' && (
          <>
            <select
              value={nhomLoc}
              onChange={(e) => setNhomLoc(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="tat_ca">Tất cả nhóm</option>
              {dsNhom
                .filter((n) => n.trang_thai_du_lieu === 'hoat_dong')
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.ten_nhom}
                  </option>
                ))}
            </select>
            <select
              value={loaiLoc}
              onChange={(e) => setLoaiLoc(e.target.value)}
              className="h-9 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="tat_ca">Tất cả phân loại</option>
              <option value="san_pham">Sản phẩm</option>
              <option value="dich_vu">Dịch vụ</option>
              <option value="kep">Kép (SP & DV)</option>
            </select>
          </>
        )}

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
          <span>Đang tải danh mục...</span>
        </div>
      ) : tabCon === 'san_pham' ? (
        dsSpLoc.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Không có sản phẩm / dịch vụ nào phù hợp.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left w-12">STT</th>
                  <th className="p-3 text-left w-28">Mã SP</th>
                  <th className="p-3 text-left">Tên sản phẩm / Dịch vụ</th>
                  <th className="p-3 text-left w-36">Nhóm</th>
                  <th className="p-3 text-left w-24">Phân loại</th>
                  <th className="p-3 text-right w-32">Giá tham khảo</th>
                  <th className="p-3 text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dsSpLoc.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-slate-50/70 transition-colors',
                      item.trang_thai_du_lieu === 'da_xoa' && 'opacity-60 bg-slate-50/30'
                    )}
                  >
                    <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs font-semibold text-primary">
                      {item.ma_san_pham || '—'}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{item.ten_san_pham}</div>
                      {item.don_vi_tinh && (
                        <span className="text-xs text-slate-500">ĐVT: {item.don_vi_tinh}</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {layTenNhom(item.nhom_san_pham_id)}
                      </span>
                    </td>
                    <td className="p-3">
                      <Hieu
                        kieu={item.loai === 'dich_vu' ? 'secondary' : item.loai === 'kep' ? 'warning' : 'primary'}
                        kich_thuoc="xs"
                      >
                        {item.loai === 'dich_vu' ? 'Dịch vụ' : item.loai === 'kep' ? 'Kép' : 'Sản phẩm'}
                      </Hieu>
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900 tabular-nums">
                      {DINH_DANG_TIEN(item.gia_tham_khao)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => moChinhSuaSp(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {item.trang_thai_du_lieu === 'da_xoa' ? (
                          <button
                            type="button"
                            onClick={() => onKhoiPhucSp(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Khôi phục"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm(`Xác nhận xóa "${item.ten_san_pham}"?`)) return;
                              onXoaSp(item);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
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
        )
      ) : dsNhomLoc.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Không có nhóm danh mục nào phù hợp.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left w-12">STT</th>
                <th className="p-3 text-left w-28">Mã nhóm</th>
                <th className="p-3 text-left">Tên nhóm danh mục</th>
                <th className="p-3 text-center w-28">Số SP/DV</th>
                <th className="p-3 text-left w-28">Ngày tạo</th>
                <th className="p-3 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dsNhomLoc.map((item, idx) => {
                const soMon = dsSanPham.filter((s) => s.nhom_san_pham_id === item.id).length;
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-slate-50/70 transition-colors',
                      item.trang_thai_du_lieu === 'da_xoa' && 'opacity-60 bg-slate-50/30'
                    )}
                  >
                    <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs font-semibold text-primary">
                      {item.ma_nhom || '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {item.mau_sac && (
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.mau_sac }}
                          />
                        )}
                        <span className="font-semibold text-slate-900">{item.ten_nhom}</span>
                      </div>
                      {item.mo_ta && (
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.mo_ta}</div>
                      )}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 tabular-nums">
                      {soMon}
                    </td>
                    <td className="p-3 text-xs text-slate-500 tabular-nums">
                      {formatNgay(item.ngay_tao)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => moChinhSuaNhom(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {item.trang_thai_du_lieu === 'da_xoa' ? (
                          <button
                            type="button"
                            onClick={() => onKhoiPhucNhom(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Khôi phục"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm(`Xác nhận xóa nhóm "${item.ten_nhom}"?`)) return;
                              onXoaNhom(item);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Xóa"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal San Pham */}
      {moModalSp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Package2 className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSuaSp ? 'Sửa sản phẩm / dịch vụ' : 'Thêm sản phẩm / dịch vụ mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMoModalSp(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Nhóm danh mục
                  </label>
                  <select
                    value={formSp.nhom_san_pham_id ?? ''}
                    onChange={(e) => setFormSp({ ...formSp, nhom_san_pham_id: e.target.value || null })}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                  >
                    <option value="">(Chưa phân nhóm)</option>
                    {dsNhom
                      .filter((n) => n.trang_thai_du_lieu === 'hoat_dong')
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.ten_nhom}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Phân loại <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSp.loai}
                    onChange={(e) => setFormSp({ ...formSp, loai: e.target.value as any })}
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-900"
                  >
                    <option value="san_pham">Sản phẩm</option>
                    <option value="dich_vu">Dịch vụ</option>
                    <option value="kep">Kép (SP & DV)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên sản phẩm / Dịch vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  value={formSp.ten_san_pham}
                  onChange={(e) => setFormSp({ ...formSp, ten_san_pham: e.target.value })}
                  placeholder="Ví dụ: Máy in nhiệt bill POS-80C"
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Mã SP/DV
                  </label>
                  <input
                    value={formSp.ma_san_pham ?? ''}
                    onChange={(e) => setFormSp({ ...formSp, ma_san_pham: e.target.value || null })}
                    placeholder="VD: SP001"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    value={formSp.don_vi_tinh ?? ''}
                    onChange={(e) => setFormSp({ ...formSp, don_vi_tinh: e.target.value || null })}
                    placeholder="Cái, Gói..."
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Giá tham khảo
                  </label>
                  <input
                    type="number"
                    value={formSp.gia_tham_khao ?? ''}
                    onChange={(e) => setFormSp({ ...formSp, gia_tham_khao: parseFloat(e.target.value) || null })}
                    placeholder="0 ₫"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mô tả / Thông số kỹ thuật
                </label>
                <textarea
                  rows={2}
                  value={formSp.mo_ta ?? ''}
                  onChange={(e) => setFormSp({ ...formSp, mo_ta: e.target.value || null })}
                  placeholder="Ghi chú chi tiết..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {loiSp && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-medium">
                  {loiSp}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Nut kieu="ghost" kich_thuoc="sm" onClick={() => setMoModalSp(false)}>
                Hủy
              </Nut>
              <Nut
                kieu="primary"
                kich_thuoc="sm"
                icon_trai={dangLuuSp ? Loader2 : Save}
                onClick={handleLuuSp}
                disabled={dangLuuSp}
              >
                {dangLuuSp ? 'Đang lưu...' : dangSuaSp ? 'Cập nhật' : 'Tạo mới'}
              </Nut>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nhom */}
      {moModalNhom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Folder className="size-5" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {dangSuaNhom ? 'Sửa nhóm danh mục' : 'Thêm nhóm danh mục mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMoModalNhom(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Tên nhóm <span className="text-rose-500">*</span>
                </label>
                <input
                  value={formNhom.ten_nhom}
                  onChange={(e) => setFormNhom({ ...formNhom, ten_nhom: e.target.value })}
                  placeholder="Ví dụ: Thiết bị POS, Phần mềm, Dịch vụ triển khai..."
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Mã nhóm
                  </label>
                  <input
                    value={formNhom.ma_nhom ?? ''}
                    onChange={(e) => setFormNhom({ ...formNhom, ma_nhom: e.target.value || null })}
                    placeholder="VD: THIET_BI, PHAN_MEM"
                    className="w-full h-10 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Màu sắc nhận diện
                  </label>
                  <input
                    type="color"
                    value={formNhom.mau_sac ?? '#3b82f6'}
                    onChange={(e) => setFormNhom({ ...formNhom, mau_sac: e.target.value })}
                    className="w-full h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={formNhom.mo_ta ?? ''}
                  onChange={(e) => setFormNhom({ ...formNhom, mo_ta: e.target.value || null })}
                  placeholder="Ghi chú nhóm..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {loiNhom && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-600 border border-rose-200 font-medium">
                  {loiNhom}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <Nut kieu="ghost" kich_thuoc="sm" onClick={() => setMoModalNhom(false)}>
                Hủy
              </Nut>
              <Nut
                kieu="primary"
                kich_thuoc="sm"
                icon_trai={dangLuuNhom ? Loader2 : Save}
                onClick={handleLuuNhom}
                disabled={dangLuuNhom}
              >
                {dangLuuNhom ? 'Đang lưu...' : dangSuaNhom ? 'Cập nhật' : 'Tạo mới'}
              </Nut>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
