'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, MapPin, Search, Save, X, Sparkles, Loader2, Filter } from 'lucide-react';
import type { DiaGioiHanhChinh } from '../../thu_vien/types/dia_gioi_hanh_chinh';
import { DANH_SACH_TINH_MIEN_TAY } from '../../dich_vu/dia_gioi_hanh_chinh/dich_vu_dia_gioi_hanh_chinh';

interface Props {
  danhSach: DiaGioiHanhChinh[];
  onThemMoi: (item: Omit<DiaGioiHanhChinh, 'id'>) => Promise<void>;
  onCapNhat: (id: string, patch: Partial<DiaGioiHanhChinh>) => Promise<void>;
  onXoa: (id: string) => Promise<void>;
  onNapDuLieuMau?: () => Promise<void>;
}

export default function BangDiaGioiHanhChinh({ danhSach, onThemMoi, onCapNhat, onXoa, onNapDuLieuMau }: Props) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [locTinh, setLocTinh] = useState('tat_ca');
  const [dangNapMau, setDangNapMau] = useState(false);
  const [moModal, setMoModal] = useState(false);
  const [dangSua, setDangSua] = useState<DiaGioiHanhChinh | null>(null);

  // Form fields
  const [tinhThanh, setTinhThanh] = useState('');
  const [xaPhuong, setXaPhuong] = useState('');
  const [loai, setLoai] = useState<'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac'>('xa');

  const openFormThem = () => {
    setDangSua(null);
    setTinhThanh('');
    setXaPhuong('');
    setLoai('xa');
    setMoModal(true);
  };

  const openFormSua = (item: DiaGioiHanhChinh) => {
    setDangSua(item);
    setTinhThanh(item.tinh_thanh);
    setXaPhuong(item.xa_phuong);
    setLoai(item.loai || 'xa');
    setMoModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tinhThanh.trim() || !xaPhuong.trim()) return;

    if (dangSua) {
      await onCapNhat(dangSua.id, {
        tinh_thanh: tinhThanh.trim(),
        xa_phuong: xaPhuong.trim(),
        loai
      });
    } else {
      await onThemMoi({
        tinh_thanh: tinhThanh.trim(),
        xa_phuong: xaPhuong.trim(),
        loai,
        trang_thai: 'hoat_dong'
      });
    }
    setMoModal(false);
  };

  // Danh sách các tỉnh thành (kết hợp mặc định và thực tế)
  const danhSachCacTinh = useMemo(() => {
    const set = new Set<string>(DANH_SACH_TINH_MIEN_TAY);
    danhSach.forEach((x) => {
      if (x.tinh_thanh) set.add(x.tinh_thanh);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [danhSach]);

  const filteredList = useMemo(() => {
    return danhSach.filter((x) => {
      const matchTinh = locTinh === 'tat_ca' || x.tinh_thanh === locTinh;
      const matchTuKhoa =
        tuKhoa === '' ||
        x.tinh_thanh.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        x.xa_phuong.toLowerCase().includes(tuKhoa.toLowerCase());
      return matchTinh && matchTuKhoa;
    });
  }, [danhSach, locTinh, tuKhoa]);

  const handleNapDuLieu = async () => {
    if (!onNapDuLieuMau) return;
    try {
      setDangNapMau(true);
      await onNapDuLieuMau();
    } finally {
      setDangNapMau(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
          {/* Tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo Tỉnh/Thành hoặc Xã/Phường..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-xs"
            />
          </div>

          {/* Bộ lọc Tỉnh/Thành */}
          <div className="relative min-w-[170px]">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={locTinh}
              onChange={(e) => setLocTinh(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-xs font-medium cursor-pointer"
            >
              <option value="tat_ca">Tất cả tỉnh thành ({danhSachCacTinh.length})</option>
              {danhSachCacTinh.map((tinh) => (
                <option key={tinh} value={tinh}>
                  {tinh}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNapDuLieuMau && (
            <button
              type="button"
              onClick={handleNapDuLieu}
              disabled={dangNapMau}
              className="h-9 px-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Tự động nạp danh sách xã/phường/thị trấn 13 tỉnh Miền Tây"
            >
              {dangNapMau ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5 text-primary" />
              )}
              <span>Tự động nạp Miền Tây</span>
            </button>
          )}

          <button
            type="button"
            onClick={openFormThem}
            className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold inline-flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="size-4" /> Thêm địa giới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Tỉnh / Thành phố</th>
              <th className="p-3">Xã / Phường / Đặc khu</th>
              <th className="p-3 w-28 text-center">Phân loại</th>
              <th className="p-3 w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Chưa có dữ liệu địa giới hành chính. Bấm "Thêm địa giới hành chính" để thêm mới.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-center font-medium text-muted-foreground">{idx + 1}</td>
                  <td className="p-3 font-semibold text-foreground">{item.tinh_thanh}</td>
                  <td className="p-3 font-medium text-foreground">{item.xa_phuong}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 capitalize">
                      {item.loai || 'xa'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openFormSua(item)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn xóa "${item.xa_phuong}"?`)) {
                            void onXoa(item.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {moModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                {dangSua ? 'Sửa Địa giới hành chính' : 'Thêm Địa giới hành chính'}
              </h3>
              <button
                type="button"
                onClick={() => setMoModal(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  required
                  list="ds-tinh-thanh-goi-y"
                  placeholder="Chọn hoặc nhập tỉnh/thành (VD: An Giang, Cần Thơ...)"
                  value={tinhThanh}
                  onChange={(e) => setTinhThanh(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                />
                <datalist id="ds-tinh-thanh-goi-y">
                  {danhSachCacTinh.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Xã / Phường / Đặc khu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Xã Phú Hòa, Phường 1..."
                  value={xaPhuong}
                  onChange={(e) => setXaPhuong(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phân loại</label>
                <select
                  value={loai}
                  onChange={(e) => setLoai(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium"
                >
                  <option value="xa">Xã</option>
                  <option value="phuong">Phường</option>
                  <option value="dac_khu">Đặc khu</option>
                  <option value="thi_trai">Thị trấn / Thị xã</option>
                  <option value="khac">Khác</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMoModal(false)}
                  className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 inline-flex items-center gap-1.5"
                >
                  <Save className="size-3.5" /> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
