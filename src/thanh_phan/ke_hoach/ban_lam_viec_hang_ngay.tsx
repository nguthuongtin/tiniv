'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '../../thu_vien/utils/cn';
import type { KeHoachTuan, ItemKeHoachTuan } from '../../thu_vien/types/ke_hoach';
import type { HoSoDuAn } from '../../thu_vien/types/du_an';
import type { KhachHang } from '../../thu_vien/types/khach_hang';

interface Props {
  keHoachTuan: KeHoachTuan | null;
  danhSachDuAn?: HoSoDuAn[];
  danhSachKhachHang?: KhachHang[];
  ngayChon: string;
  onDoiNgayChon: (ngay: string) => void;
  laSuaDuoc: boolean;
  onThemNhanh: (item: ItemKeHoachTuan) => void;
  onXoaCongViec: (itemId: string) => void;
  onCheckIn1Cham: (item: ItemKeHoachTuan) => void;
  onDoiNhanhHoanThanh: (itemId: string, daXong: boolean) => void;
  onLenNongCongViec: (
    item: ItemKeHoachTuan,
    ngayDich: string | null,
    hinhThucMoi: 'gap_mat' | 'goi_dien'
  ) => void;
}

const TEN_THU = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const congNgay = (iso: string, soNgay: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + soNgay);
  return toISO(d);
};

const nhanNgay = (iso: string, homNay: string) => {
  const d = new Date(`${iso}T00:00:00`);
  const dm = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (iso === homNay) return `Hôm nay · ${dm}`;
  if (iso === congNgay(homNay, 1)) return `Ngày mai · ${dm}`;
  if (iso === congNgay(homNay, -1)) return `Hôm qua · ${dm}`;
  return `${TEN_THU[d.getDay()]} · ${dm}`;
};

export default function BanLamViecHangNgay({
  keHoachTuan,
  danhSachDuAn = [],
  danhSachKhachHang = [],
  ngayChon,
  onDoiNgayChon,
  laSuaDuoc,
  onThemNhanh,
  onXoaCongViec,
  onCheckIn1Cham,
  onDoiNhanhHoanThanh,
  onLenNongCongViec
}: Props) {
  const homNay = useMemo(() => toISO(new Date()), []);
  const [noiDung, setNoiDung] = useState('');
  const [duAnId, setDuAnId] = useState('');
  const [laGapMat, setLaGapMat] = useState(false);
  const [moViecCho, setMoViecCho] = useState(false);

  const ds = useMemo(() => keHoachTuan?.danh_sach_tac_chien ?? [], [keHoachTuan]);

  const mapDuAn = useMemo(() => new Map(danhSachDuAn.map((d) => [d.id, d])), [danhSachDuAn]);
  const mapKH = useMemo(() => new Map(danhSachKhachHang.map((k) => [k.id, k])), [danhSachKhachHang]);

  const viecTrongNgay = useMemo(() => {
    const list = ds.filter(
      (x) =>
        x.ngay_du_kien === ngayChon ||
        x.ngay_hoan_thanh === ngayChon ||
        x.danh_sach_ket_qua?.some((k) => k.ngay_ghi_nhan === ngayChon)
    );
    return [...list.filter((x) => !x.da_hoan_thanh), ...list.filter((x) => x.da_hoan_thanh)];
  }, [ds, ngayChon]);

  const viecCho = useMemo(
    () =>
      ds.filter(
        (x) => !x.da_hoan_thanh && (!x.ngay_du_kien || x.ngay_du_kien < ngayChon)
      ),
    [ds, ngayChon]
  );

  const soXong = viecTrongNgay.filter((x) => x.da_hoan_thanh).length;

  const moTaPhu = (item: ItemKeHoachTuan) => {
    const da = item.du_an_id ? mapDuAn.get(item.du_an_id) : undefined;
    const tenDA = da?.ten_du_an || item.du_an_du_kien;
    const tenKH = item.co_quan_doanh_nghiep;
    return [tenKH, tenDA].filter(Boolean).join(' · ');
  };

  const xuLyThem = () => {
    const text = noiDung.trim();
    if (!text) return;
    const da = duAnId ? mapDuAn.get(duAnId) : undefined;
    const kh = da?.khach_hang_id ? mapKH.get(da.khach_hang_id) : undefined;
    const tenKH = kh?.ten_khach_hang || null;

    onThemNhanh({
      id: `item_tuan_${Date.now()}`,
      muc_tieu_thang_id: null,
      loai_hanh_dong: 'phat_sinh',
      hinh_thuc: laGapMat ? 'gap_mat' : 'goi_dien',
      khach_hang_id: da?.khach_hang_id || null,
      du_an_id: da?.id || null,
      ten_khach_hang_du_an: tenKH || da?.ten_du_an || text,
      co_quan_doanh_nghiep: tenKH,
      du_an_du_kien: da?.ten_du_an || null,
      hanh_dong_tuan: text,
      noi_dung_tuan: text,
      ket_qua_mong_muon: null,
      dau_ra_cam_ket: text,
      ngay_du_kien: ngayChon,
      da_hoan_thanh: false
    } as ItemKeHoachTuan);

    setNoiDung('');
    setLaGapMat(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      {/* Chọn ngày */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDoiNgayChon(congNgay(ngayChon, -1))}
            className="size-8 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="text-lg font-black text-foreground px-1 min-w-[170px] text-center">
            {nhanNgay(ngayChon, homNay)}
          </h2>
          <button
            type="button"
            onClick={() => onDoiNgayChon(congNgay(ngayChon, 1))}
            className="size-8 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
          {ngayChon !== homNay && (
            <button
              type="button"
              onClick={() => onDoiNgayChon(homNay)}
              className="ml-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Về hôm nay
            </button>
          )}
        </div>
        {viecTrongNgay.length > 0 && (
          <span className="text-xs font-semibold text-muted-foreground">
            {soXong}/{viecTrongNgay.length} xong
          </span>
        )}
      </div>

      {/* Thêm nhanh */}
      {laSuaDuoc && (
        <div className="bg-card border border-border rounded-xl p-2 flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Plus className="size-4 text-muted-foreground shrink-0 ml-1" />
            <input
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && xuLyThem()}
              placeholder="Thêm việc..."
              className="flex-1 min-w-0 h-9 bg-transparent border-0 text-sm focus:outline-hidden focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={duAnId}
              onChange={(e) => setDuAnId(e.target.value)}
              className="h-9 max-w-[200px] rounded-lg border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="">Dự án</option>
              {danhSachDuAn.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ten_du_an}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setLaGapMat((v) => !v)}
              title="Gặp mặt khách hàng (đưa lên Lịch công tác)"
              className={cn(
                'h-9 px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 cursor-pointer',
                laGapMat
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="size-3.5" /> Gặp mặt
            </button>
            <button
              type="button"
              onClick={xuLyThem}
              disabled={!noiDung.trim()}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Thêm
            </button>
          </div>
        </div>
      )}

      {/* Danh sách việc trong ngày */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border/70">
        {viecTrongNgay.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Chưa có việc</div>
        ) : (
          viecTrongNgay.map((item) => {
            const phu = moTaPhu(item);
            return (
              <div key={item.id} className="group flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30">
                <button
                  type="button"
                  disabled={!laSuaDuoc}
                  onClick={() => onDoiNhanhHoanThanh(item.id, !item.da_hoan_thanh)}
                  className="shrink-0 text-muted-foreground hover:text-emerald-600 cursor-pointer"
                >
                  {item.da_hoan_thanh ? (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onCheckIn1Cham(item)}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <div
                    className={cn(
                      'text-sm font-medium text-foreground truncate',
                      item.da_hoan_thanh && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.hanh_dong_tuan || item.noi_dung_tuan}
                  </div>
                  {phu && <div className="text-xs text-muted-foreground truncate">{phu}</div>}
                </button>

                {item.hinh_thuc === 'gap_mat' && (
                  <Users className="size-4 text-emerald-600 shrink-0" aria-label="Gặp mặt" />
                )}

                {laSuaDuoc && (
                  <button
                    type="button"
                    onClick={() => onXoaCongViec(item.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Việc chờ trong tuần */}
      {viecCho.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setMoViecCho((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronDown className={cn('size-4 transition-transform', !moViecCho && '-rotate-90')} />
            Việc chờ ({viecCho.length})
          </button>

          {moViecCho && (
            <div className="mt-2 bg-card border border-border rounded-xl divide-y divide-border/70">
              {viecCho.map((item) => {
                const phu = moTaPhu(item);
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">
                        {item.hanh_dong_tuan || item.noi_dung_tuan}
                      </div>
                      {phu && <div className="text-xs text-muted-foreground truncate">{phu}</div>}
                    </div>
                    {laSuaDuoc && (
                      <button
                        type="button"
                        onClick={() =>
                          onLenNongCongViec(
                            item,
                            ngayChon,
                            item.hinh_thuc === 'gap_mat' ? 'gap_mat' : 'goi_dien'
                          )
                        }
                        className="shrink-0 h-8 px-3 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                      >
                        Làm hôm nay
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
