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
  { key: 'moi_tao',       stt: 1,  nhan_ngan: 'Mới tạo',   nhan_day_du: '1. Mới tạo',    kieu: 'muted',   khoa_ghi_nhan_doanh_so: false },
  { key: 'tiep_can',      stt: 2,  nhan_ngan: 'Tiếp cận',  nhan_day_du: '2. Tiếp cận',   kieu: 'primary', khoa_ghi_nhan_doanh_so: false },
  { key: 'khao_sat',      stt: 3,  nhan_ngan: 'Khảo sát',  nhan_day_du: '3. Khảo sát',   kieu: 'primary', khoa_ghi_nhan_doanh_so: false },
  { key: 'len_giai_phap', stt: 4,  nhan_ngan: 'Giải pháp', nhan_day_du: '4. Giải pháp',  kieu: 'primary', khoa_ghi_nhan_doanh_so: false },
  { key: 'bao_gia',       stt: 5,  nhan_ngan: 'Báo giá',   nhan_day_du: '5. Báo giá',    kieu: 'warning', khoa_ghi_nhan_doanh_so: false },
  { key: 'dam_phan',      stt: 6,  nhan_ngan: 'Đàm phán',  nhan_day_du: '6. Đàm phán',   kieu: 'warning', khoa_ghi_nhan_doanh_so: false },
  { key: 'ky_hop_dong',   stt: 7,  nhan_ngan: 'Ký HĐ',     nhan_day_du: '7. Ký HĐ',      kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'trien_khai',    stt: 8,  nhan_ngan: 'Triển khai',nhan_day_du: '8. Triển khai',  kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'nghiem_thu',    stt: 9,  nhan_ngan: 'Nghiệm thu',nhan_day_du: '9. Nghiệm thu',  kieu: 'success', khoa_ghi_nhan_doanh_so: true  },
  { key: 'hoan_thanh',    stt: 10, nhan_ngan: 'Hoàn thành',nhan_day_du: '10. Hoàn thành', kieu: 'success', khoa_ghi_nhan_doanh_so: false },
  { key: 'tam_dung',      stt: 11, nhan_ngan: 'Tạm dừng',  nhan_day_du: '11. Tạm dừng',  kieu: 'danger',  khoa_ghi_nhan_doanh_so: false },
  { key: 'huy',           stt: 12, nhan_ngan: 'Hủy',       nhan_day_du: '12. Hủy',       kieu: 'danger',  khoa_ghi_nhan_doanh_so: false }
];

export const GIAI_DOAN_KEYS: GiaiDoanDuAn[] = DANH_SACH_GIAI_DOAN_MAC_DINH.map((x) => x.key);

const DANH_SACH_GIAI_DOAN_OVERRIDE_KEY = '__GIAI_DOAN_DU_AN_CONFIG_CACHE__';
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
  return all.find((x) => x.key === key) ?? all[0];
};

export const layDanhSachGiaiDoanGhiNhanDoanhSo = (): GiaiDoanDuAn[] => {
  return layDanhSachGiaiDoan()
    .filter((x) => x.khoa_ghi_nhan_doanh_so)
    .map((x) => x.key);
};
