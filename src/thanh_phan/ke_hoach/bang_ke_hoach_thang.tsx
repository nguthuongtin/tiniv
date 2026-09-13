'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, Wallet, Target, AlertCircle } from 'lucide-react';
import type { KeHoachThang, ItemKeHoachThang } from '../../thu_vien/types/ke_hoach';
import { DINH_DANG_TIEN_NGAN_GON } from '../../thu_vien/utils/format_tien';

interface Props {
  keHoach: KeHoachThang | null;
  laSuaDuoc: boolean;
  onThemMoi: () => void;
  onSuaItem: (item: ItemKeHoachThang) => void;
  onXoaItem: (itemId: string) => void;
}

export default function BangKeHoachThang({
  keHoach,
  laSuaDuoc,
  onThemMoi,
  onSuaItem,
  onXoaItem
}: Props) {
  const ds = keHoach?.danh_sach_dia_ban ?? [];

  const tongGiaTriHd = ds.reduce((acc, x) => acc + (x.gia_tri_hd || 0), 0);
  const tongDuKienThu = ds.reduce((acc, x) => acc + (x.du_kien_thu_thang_nay || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng số KH / Dự án
            </span>
            <span className="text-2xl font-extrabold text-foreground mt-1 block">
              {ds.length}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Target className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tổng giá trị hợp đồng
            </span>
            <span className="text-2xl font-extrabold text-foreground tabular-nums mt-1 block">
              {DINH_DANG_TIEN_NGAN_GON(tongGiaTriHd)}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
            <Wallet className="size-5" />
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Dự kiến thu tháng này
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
              {DINH_DANG_TIEN_NGAN_GON(tongDuKienThu)}
            </span>
          </div>
          <div className="size-10 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-lg">
            💵
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between gap-3 flex-wrap bg-muted/20">
          <h3 className="font-bold text-sm text-foreground">
            Kế hoạch Tháng
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
            <p className="font-semibold text-xs">Chưa có kế hoạch tháng nào.</p>
            {laSuaDuoc && (
              <button
                type="button"
                onClick={onThemMoi}
                className="text-xs font-bold text-primary hover:underline inline-block pt-1"
              >
                + Thêm kế hoạch tháng
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[200px]">Khách hàng / Dự án</th>
                  <th className="py-3 px-3 min-w-[150px] text-right">Giá trị HĐ</th>
                  <th className="py-3 px-3 min-w-[160px] text-right">Dự kiến thu tháng này</th>
                  <th className="py-3 px-3 min-w-[180px]">Ghi chú</th>
                  {laSuaDuoc && <th className="py-3 px-3 w-16 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {ds.map((item, idx) => {
                  const ten = item.ten_khach_hang_du_an || (item as any).ten_dia_ban || '';
                  return (
                    <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                        {idx + 1}
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
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-foreground">
                        {DINH_DANG_TIEN_NGAN_GON(item.gia_tri_hd)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                        {DINH_DANG_TIEN_NGAN_GON(item.du_kien_thu_thang_nay)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground leading-relaxed">
                        {item.ghi_chu || (item as any).ghi_chu_tam_ung || '—'}
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
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/50 font-bold">
                  <td colSpan={2} className="py-3 px-3 text-right uppercase text-[11px] text-muted-foreground">
                    Tổng cộng:
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm tabular-nums text-foreground">
                    {DINH_DANG_TIEN_NGAN_GON(tongGiaTriHd)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                    {DINH_DANG_TIEN_NGAN_GON(tongDuKienThu)}
                  </td>
                  <td colSpan={laSuaDuoc ? 2 : 1}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
