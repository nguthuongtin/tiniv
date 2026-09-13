'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import type { KeHoachTuan, ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';

interface Props {
  keHoach: KeHoachTuan | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onSuaItem: (item: ItemKeHoachTuan) => void;
  onXoaItem: (itemId: string) => void;
  onDoiVatChung: (itemId: string, daLay: boolean) => void;
}

export default function BangKeHoachTuan({
  keHoach,
  laSuaDuoc,
  onThemMoi,
  onSuaItem,
  onXoaItem,
  onDoiVatChung
}: Props) {
  const ds = keHoach?.danh_sach_tac_chien ?? [];

  const soDaHoanThanh = ds.filter((x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay').length;
  const soPhaiHoTro = ds.filter((x) => (x.can_ho_tro ?? '').trim().length > 0).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng số công việc tuần
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {ds.length}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            🎯
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Đã hoàn thành
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {soDaHoanThanh} / {ds.length}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Cần hỗ trợ
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {soPhaiHoTro}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
            <HelpCircle className="size-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between gap-3 flex-wrap bg-muted/20">
          <h3 className="font-bold text-sm text-foreground">
            Kế hoạch Tuần
          </h3>
          {laSuaDuoc && (
            <button
              type="button"
              onClick={onThemMoi}
              className="h-8.5 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="size-4" /> Thêm mới
            </button>
          )}
        </div>

        {ds.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-2">
            <AlertCircle className="size-7 mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-xs">Chưa có kế hoạch tuần nào.</p>
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-xs font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm kế hoạch tuần
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">Xong</th>
                  <th className="py-3 px-3 min-w-[180px]">Khách hàng / Công việc</th>
                  <th className="py-3 px-3 min-w-[220px]">Nội dung / Lịch tuần</th>
                  <th className="py-3 px-3 min-w-[200px]">Đầu ra cần đạt</th>
                  <th className="py-3 px-3 min-w-[160px]">Cần hỗ trợ</th>
                  {laSuaDuoc && <th className="py-3 px-3 w-16 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ds.map((item, idx) => {
                  const ten = item.ten_khach_hang_du_an || (item as any).ten_dia_ban || '';
                  const noiDung = item.noi_dung_tuan || (item as any).hanh_dong_cu_the || '—';
                  const dauRa = item.dau_ra_cam_ket || (item as any).vat_chung_bat_buoc || '—';
                  const daXong = item.da_hoan_thanh || (item as any).trang_thai_vat_chung === 'da_lay';
                  return (
                    <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 text-center">
                        {laSuaDuoc ? (
                          <input
                            type="checkbox"
                            checked={Boolean(daXong)}
                            onChange={(e) => onDoiVatChung(item.id, e.target.checked)}
                            className="size-4 rounded text-primary focus:ring-primary cursor-pointer"
                            title={daXong ? 'Đã xong' : 'Đánh dấu xong'}
                          />
                        ) : (
                          <span className="size-4 inline-block">
                            {daXong ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertCircle className="size-4 text-muted-foreground" />}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {item.du_an_id ? (
                          <Link
                            href={`/ho-so-du-an/${item.du_an_id}`}
                            className="hover:text-primary transition-colors block"
                          >
                            {ten}
                          </Link>
                        ) : (
                          <span>{ten}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-foreground leading-relaxed">
                        {noiDung}
                      </td>
                      <td className="py-3 px-3 font-semibold text-primary">
                        <span className={daXong ? 'line-through text-emerald-600 font-bold' : ''}>
                          {dauRa}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-amber-700 dark:text-amber-400 font-medium">
                        {item.can_ho_tro ? (
                          <div className="flex items-center gap-1">
                            <span>💡</span>
                            <span>{item.can_ho_tro}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      {laSuaDuoc && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSuaItem(item)}
                              className="size-7 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                              title="Sửa"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onXoaItem(item.id)}
                              className="size-7 rounded-md border border-danger/20 bg-danger/10 text-danger hover:bg-danger/20 flex items-center justify-center transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
