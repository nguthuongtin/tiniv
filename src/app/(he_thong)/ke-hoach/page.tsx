'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Users,
  CalendarRange,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../../thu_vien/utils/cn';
import useStoreXacThuc from '../../../thu_vien/zustand/store_xac_thuc';
import { coQuyen, layPhamViPhongBan } from '../../../thu_vien/phan_quyen/kiem_tra_quyen';
import type { NhanSu } from '../../../thu_vien/types/nhan_su';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import type { KhachHang } from '../../../thu_vien/types/khach_hang';
import type {
  KeHoachThang,
  KeHoachTuan,
  ItemKeHoachThang,
  ItemKeHoachTuan
} from '../../../thu_vien/types/ke_hoach';
import {
  layKeHoachThang,
  luuKeHoachThang,
  layKeHoachTuan,
  luuKeHoachTuan,
  layThangHienTaiISO,
  layTuanHienTaiISO
} from '../../../dich_vu/ke_hoach/dich_vu_ke_hoach';
import { danhSachNhanSu } from '../../../dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachKhachHang } from '../../../dich_vu/khach_hang/dich_vu_khach_hang';
import Bo_Cuc_Trang from '../../../thanh_phan/ui/bo_cuc_trang';

import BangKeHoachThang from '../../../thanh_phan/ke_hoach/bang_ke_hoach_thang';
import BangKeHoachTuan from '../../../thanh_phan/ke_hoach/bang_ke_hoach_tuan';
import FormDiaBanDrawer from '../../../thanh_phan/ke_hoach/form_dia_ban_drawer';
import FormTacChienTuanDrawer from '../../../thanh_phan/ke_hoach/form_tac_chien_tuan_drawer';

const DS_NAM = [2024, 2025, 2026, 2027, 2028];

const taoDanhSachTuanNam = (nam: number) => {
  const ds = [];
  for (let w = 1; w <= 52; w++) {
    const wStr = String(w).padStart(2, '0');
    ds.push({ val: `${nam}-W${wStr}`, label: `Tuần ${w} (${nam})` });
  }
  return ds;
};

export default function TrangKeHoachNVKD() {
  const [tabHienTai, setTabHienTai] = useState<'thang' | 'tuan'>('thang');
  const [dangTai, setDangTai] = useState(true);

  // Time selectors
  const [thangChon, setThangChon] = useState<string>(layThangHienTaiISO());
  const [tuanChon, setTuanChon] = useState<string>(layTuanHienTaiISO());
  const [namTuanChon, setNamTuanChon] = useState<number>(new Date().getFullYear());

  // Data states
  const [dsNhanSu, setDsNhanSu] = useState<NhanSu[]>([]);
  const [dsHoSoDuAn, setDsHoSoDuAn] = useState<HoSoDuAn[]>([]);
  const [dsKhachHang, setDsKhachHang] = useState<KhachHang[]>([]);
  const [nhanVienChonId, setNhanVienChonId] = useState<string>('');

  const [keHoachThang, setKeHoachThang] = useState<KeHoachThang | null>(null);
  const [keHoachTuan, setKeHoachTuan] = useState<KeHoachTuan | null>(null);

  // Drawers
  const [moDrawerThang, setMoDrawerThang] = useState(false);
  const [dangSuaThang, setDangSuaThang] = useState<ItemKeHoachThang | null>(null);

  const [moDrawerTuan, setMoDrawerTuan] = useState(false);
  const [dangSuaTuan, setDangSuaTuan] = useState<ItemKeHoachTuan | null>(null);

  const nguoiDungHienTai = useStoreXacThuc((s) => s.nguoiDungHienTai);
  const laQuanLyHoacGiamDoc =
    ['quan_tri_he_thong', 'giam_doc', 'truong_phong'].includes(nguoiDungHienTai?.vai_tro ?? '') ||
    coQuyen(nguoiDungHienTai, 'ke_hoach.duyet');

  const phamVi = useMemo(() => {
    return layPhamViPhongBan(nguoiDungHienTai);
  }, [nguoiDungHienTai]);

  const dsNhanSuDuocChon = useMemo(() => {
    if (!nguoiDungHienTai) return [];
    if (phamVi.toanCongTy) return dsNhanSu;
    return dsNhanSu.filter((ns) =>
      ns.id === nguoiDungHienTai.id || (ns.phong_ban_id && phamVi.danhSachPhongBanIds.includes(ns.phong_ban_id))
    );
  }, [dsNhanSu, nguoiDungHienTai, phamVi]);

  useEffect(() => {
    if (nguoiDungHienTai?.id && !nhanVienChonId) {
      setNhanVienChonId(nguoiDungHienTai.id);
    }
  }, [nguoiDungHienTai, nhanVienChonId]);

  useEffect(() => {
    void (async () => {
      try {
        const [resNS, resDA, resKH] = await Promise.all([
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachHoSoDuAn({ trang_thai: 'hoat_dong' }),
          danhSachKhachHang({ trang_thai: 'hoat_dong' })
        ]);
        setDsNhanSu(resNS.mang ?? []);
        setDsHoSoDuAn(resDA.mang ?? []);
        setDsKhachHang(resKH.mang ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const taiKinhDoanhPlan = useCallback(async () => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;
    setDangTai(true);
    try {
      if (tabHienTai === 'thang') {
        const res = await layKeHoachThang(targetId, thangChon);
        setKeHoachThang(res);
      } else {
        const res = await layKeHoachTuan(targetId, tuanChon);
        setKeHoachTuan(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDangTai(false);
    }
  }, [nhanVienChonId, nguoiDungHienTai, tabHienTai, thangChon, tuanChon]);

  useEffect(() => {
    void taiKinhDoanhPlan();
  }, [taiKinhDoanhPlan]);

  const dsTuanTrongNam = useMemo(() => taoDanhSachTuanNam(namTuanChon), [namTuanChon]);

  // Handlers for Month Navigation
  const doiThangTroi = (delta: number) => {
    const [y, m] = thangChon.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setThangChon(`${yyyy}-${mm}`);
  };

  // Handlers for Week Navigation
  const doiTuanTroi = (delta: number) => {
    const match = tuanChon.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return;
    let y = Number(match[1]);
    let w = Number(match[2]) + delta;
    if (w < 1) {
      y -= 1;
      w = 52;
    } else if (w > 52) {
      y += 1;
      w = 1;
    }
    setNamTuanChon(y);
    setTuanChon(`${y}-W${String(w).padStart(2, '0')}`);
  };

  const xuLyLuuItemThang = async (item: ItemKeHoachThang) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;

    const dsHienTai = keHoachThang?.danh_sach_dia_ban ?? [];
    const tonTaiIdx = dsHienTai.findIndex((x) => x.id === item.id);
    let dsMoi: ItemKeHoachThang[];
    if (tonTaiIdx >= 0) {
      dsMoi = [...dsHienTai];
      dsMoi[tonTaiIdx] = item;
    } else {
      dsMoi = [...dsHienTai, item];
    }

    const nv = dsNhanSu.find((x) => x.id === targetId);

    const res = await luuKeHoachThang(
      {
        id: keHoachThang?.id,
        thang: thangChon,
        nhan_vien_id: targetId,
        chi_nhanh_id: nv?.chi_nhanh_id ?? null,
        phong_ban_id: nv?.phong_ban_id ?? null,
        danh_sach_dia_ban: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachThang(res);
  };

  const xuLyXoaItemThang = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa kế hoạch này?')) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachThang) return;

    const dsMoi = keHoachThang.danh_sach_dia_ban.filter((x) => x.id !== itemId);
    const res = await luuKeHoachThang(
      {
        id: keHoachThang.id,
        thang: thangChon,
        nhan_vien_id: targetId,
        danh_sach_dia_ban: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachThang(res);
  };

  const xuLyLuuItemTuan = async (item: ItemKeHoachTuan) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId) return;

    const dsHienTai = keHoachTuan?.danh_sach_tac_chien ?? [];
    const tonTaiIdx = dsHienTai.findIndex((x) => x.id === item.id);
    let dsMoi: ItemKeHoachTuan[];
    if (tonTaiIdx >= 0) {
      dsMoi = [...dsHienTai];
      dsMoi[tonTaiIdx] = item;
    } else {
      dsMoi = [...dsHienTai, item];
    }

    const nv = dsNhanSu.find((x) => x.id === targetId);

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan?.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        chi_nhanh_id: nv?.chi_nhanh_id ?? null,
        phong_ban_id: nv?.phong_ban_id ?? null,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);
  };

  const xuLyXoaItemTuan = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa kế hoạch này?')) return;
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const dsMoi = keHoachTuan.danh_sach_tac_chien.filter((x) => x.id !== itemId);
    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);
  };

  const xuLyDoiVatChung = async (itemId: string, daLay: boolean) => {
    const targetId = nhanVienChonId || nguoiDungHienTai?.id;
    if (!targetId || !keHoachTuan) return;

    const homNay = new Date().toISOString().split('T')[0];

    const dsMoi = keHoachTuan.danh_sach_tac_chien.map((x) => {
      if (x.id !== itemId) return x;

      let ngayHoanThanh = x.ngay_hoan_thanh || null;
      if (daLay) {
        // Nếu chưa từng lưu ngày hoàn thành, lưu ngày hôm nay
        if (!ngayHoanThanh) {
          ngayHoanThanh = homNay;
        }
      } else {
        // Nếu hủy hoàn thành trong cùng ngày hôm nay thì xóa, nếu ngày hôm trước thì giữ nguyên để chống gian lận
        if (ngayHoanThanh === homNay) {
          ngayHoanThanh = null;
        }
      }

      return {
        ...x,
        da_hoan_thanh: daLay,
        trang_thai_vat_chung: daLay ? ('da_lay' as const) : ('chua_lay' as const),
        ngay_hoan_thanh: ngayHoanThanh
      };
    });

    const res = await luuKeHoachTuan(
      {
        id: keHoachTuan.id,
        tuan: tuanChon,
        nhan_vien_id: targetId,
        danh_sach_tac_chien: dsMoi
      },
      nguoiDungHienTai
    );

    setKeHoachTuan(res);
  };

  const laSuaDuoc = Boolean(
    !nhanVienChonId ||
      nhanVienChonId === nguoiDungHienTai?.id ||
      laQuanLyHoacGiamDoc
  );

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border">
        {/* Main Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTabHienTai('thang')}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2',
              tabHienTai === 'thang'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarDays className="size-4" /> Kế hoạch Tháng
          </button>
          <button
            type="button"
            onClick={() => setTabHienTai('tuan')}
            className={cn(
              'h-9 px-4 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2',
              tabHienTai === 'tuan'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarRange className="size-4" /> Kế hoạch Tuần
          </button>
        </div>

        {/* Filters: Time & Employee Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabHienTai === 'thang' ? (
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => doiThangTroi(-1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <input
                type="month"
                value={thangChon}
                onChange={(e) => setThangChon(e.target.value)}
                className="h-7 border-0 bg-transparent px-2 text-xs font-bold text-foreground focus:ring-0"
              />
              <button
                type="button"
                onClick={() => doiThangTroi(1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => doiTuanTroi(-1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tuần trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <select
                value={namTuanChon}
                onChange={(e) => setNamTuanChon(Number(e.target.value))}
                className="h-7 border-0 bg-transparent px-1 text-xs font-bold"
              >
                {DS_NAM.map((n) => (
                  <option key={n} value={n}>
                    Năm {n}
                  </option>
                ))}
              </select>
              <select
                value={tuanChon}
                onChange={(e) => setTuanChon(e.target.value)}
                className="h-7 border-0 bg-transparent px-1 text-xs font-bold text-foreground"
              >
                {dsTuanTrongNam.map((t) => (
                  <option key={t.val} value={t.val}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => doiTuanTroi(1)}
                className="size-7 rounded hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Tuần sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {laQuanLyHoacGiamDoc && (
            <div className="flex items-center gap-1 text-xs ml-1">
              <Users className="size-4 text-muted-foreground" />
              <select
                value={nhanVienChonId}
                onChange={(e) => setNhanVienChonId(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value={nguoiDungHienTai?.id ?? ''}>Kế hoạch của tôi</option>
                {dsNhanSuDuocChon.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.ho_va_ten} ({ns.ma_nhan_vien})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {dangTai ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2.25} />
          <span className="font-semibold text-xs">Đang tải kế hoạch...</span>
        </div>
      ) : tabHienTai === 'thang' ? (
        <BangKeHoachThang
          keHoach={keHoachThang}
          laSuaDuoc={laSuaDuoc}
          onThemMoi={() => {
            setDangSuaThang(null);
            setMoDrawerThang(true);
          }}
          onSuaItem={(item) => {
            setDangSuaThang(item);
            setMoDrawerThang(true);
          }}
          onXoaItem={xuLyXoaItemThang}
        />
      ) : (
        <BangKeHoachTuan
          keHoach={keHoachTuan}
          laSuaDuoc={laSuaDuoc}
          onThemMoi={() => {
            setDangSuaTuan(null);
            setMoDrawerTuan(true);
          }}
          onSuaItem={(item) => {
            setDangSuaTuan(item);
            setMoDrawerTuan(true);
          }}
          onXoaItem={xuLyXoaItemTuan}
          onDoiVatChung={xuLyDoiVatChung}
        />
      )}

      <FormDiaBanDrawer
        mo={moDrawerThang}
        onDong={() => setMoDrawerThang(false)}
        dangSua={dangSuaThang}
        danhSachDuAn={dsHoSoDuAn}
        danhSachKhachHang={dsKhachHang}
        onLuu={xuLyLuuItemThang}
      />

      <FormTacChienTuanDrawer
        mo={moDrawerTuan}
        onDong={() => setMoDrawerTuan(false)}
        dangSua={dangSuaTuan}
        danhSachDuAn={dsHoSoDuAn}
        danhSachKhachHang={dsKhachHang}
        onLuu={xuLyLuuItemTuan}
      />
    </Bo_Cuc_Trang>
  );
}
