import type { GiaiDoanDuAn } from '../types/du_an';

export type KieuBadgeGiaiDoan = 'muted' | 'primary' | 'warning' | 'success' | 'danger';

export interface CauHinhMotGiaiDoan {
  key: GiaiDoanDuAn;
  stt: number;
  nhan_ngan: string;
  nhan_day_du: string;
  kieu: KieuBadgeGiaiDoan;
  khoa_ghi_nhan_doanh_so: boolean;
}

export const DANH_SACH_GIAI_DOAN_MAC_DINH: CauHinhMotGiaiDoan[] = [
  { key: 'tiep_can',              stt: 1, nhan_ngan: 'Tiếp cận',              nhan_day_du: '1. Tiếp cận',              kieu: 'primary', khoa_ghi_nhan_doanh_so: false },
  { key: 'bao_gia',               stt: 2, nhan_ngan: 'Báo giá',               nhan_day_du: '2. Báo giá',               kieu: 'warning', khoa_ghi_nhan_doanh_so: false },
  { key: 'co_chu_truong',         stt: 3, nhan_ngan: 'Có chủ trương',         nhan_day_du: '3. Có chủ trương',         kieu: 'primary', khoa_ghi_nhan_doanh_so: false },
  { key: 'ky_hop_dong',           stt: 4, nhan_ngan: 'Ký HĐ',                 nhan_day_du: '4. Ký HĐ',                 kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'tt_dot_1',              stt: 5, nhan_ngan: 'TT đợt 1',              nhan_day_du: '5. TT đợt 1',              kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'trien_khai',            stt: 6, nhan_ngan: 'Triển khai',            nhan_day_du: '6. Triển khai',            kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'hoan_thanh_tt_dot_2',   stt: 7, nhan_ngan: 'Hoàn thành & TT đợt 2', nhan_day_du: '7. Hoàn thành và TT đợt 2', kieu: 'success', khoa_ghi_nhan_doanh_so: true  },
  { key: 'tam_dung_huy',          stt: 8, nhan_ngan: 'Tạm dừng/Hủy',          nhan_day_du: '8. Tạm dừng / Hủy',        kieu: 'danger',  khoa_ghi_nhan_doanh_so: false }
];

export const CHUAN_HOA_GIAI_DOAN_MAP: Record<string, string> = {
  moi_tao: 'tiep_can',
  tiep_can: 'tiep_can',
  khao_sat: 'tiep_can',
  len_giai_phap: 'tiep_can',
  bao_gia: 'bao_gia',
  co_chu_truong: 'co_chu_truong',
  dam_phan: 'co_chu_truong',
  ky_hop_dong: 'ky_hop_dong',
  tt_dot_1: 'tt_dot_1',
  trien_khai: 'trien_khai',
  nghiem_thu: 'hoan_thanh_tt_dot_2',
  hoan_thanh: 'hoan_thanh_tt_dot_2',
  hoan_thanh_tt_dot_2: 'hoan_thanh_tt_dot_2',
  tam_dung: 'tam_dung_huy',
  huy: 'tam_dung_huy',
  tam_dung_huy: 'tam_dung_huy'
};

export const chuanHoaGiaiDoan = (key: string | null | undefined): string => {
  if (!key) return 'tiep_can';
  return CHUAN_HOA_GIAI_DOAN_MAP[key] || key;
};

export const GIAI_DOAN_KEYS: GiaiDoanDuAn[] = DANH_SACH_GIAI_DOAN_MAC_DINH.map((x) => x.key);

const DANH_SACH_GIAI_DOAN_OVERRIDE_KEY = '__GIAI_DOAN_DU_AN_CONFIG_CACHE_V2__';
let trongNho: CauHinhMotGiaiDoan[] | null = null;

export const setCacheTamGiaiDoan = (ds: CauHinhMotGiaiDoan[] | null): void => {
  trongNho = ds;
  try {
    if (typeof window !== 'undefined') {
      if (ds) window.localStorage.setItem(DANH_SACH_GIAI_DOAN_OVERRIDE_KEY, JSON.stringify(ds));
      else window.localStorage.removeItem(DANH_SACH_GIAI_DOAN_OVERRIDE_KEY);
    }
  } catch {
    /* ignore */
  }
};

export const layDanhSachGiaiDoan = (): CauHinhMotGiaiDoan[] => {
  if (trongNho && Array.isArray(trongNho) && trongNho.length > 0) {
    return trongNho;
  }
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(DANH_SACH_GIAI_DOAN_OVERRIDE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CauHinhMotGiaiDoan[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          trongNho = parsed;
          return trongNho;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return DANH_SACH_GIAI_DOAN_MAC_DINH.map((x) => ({ ...x }));
};

export const layCauHinhGiaiDoanTheoKey = (key: string | null | undefined): CauHinhMotGiaiDoan => {
  const all = layDanhSachGiaiDoan();
  const direct = all.find((x) => x.key === key);
  if (direct) return direct;
  const mappedKey = key ? CHUAN_HOA_GIAI_DOAN_MAP[key] : undefined;
  if (mappedKey) {
    const mapped = all.find((x) => x.key === mappedKey);
    if (mapped) return mapped;
  }
  return all[0];
};

export const layDanhSachGiaiDoanGhiNhanDoanhSo = (): GiaiDoanDuAn[] => {
  return layDanhSachGiaiDoan()
    .filter((x) => x.khoa_ghi_nhan_doanh_so)
    .map((x) => x.key);
};
