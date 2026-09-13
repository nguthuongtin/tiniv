'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  limit,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
  onSnapshot
} from 'firebase/firestore';
import type { ChucVu } from '../../thu_vien/types/nhan_su';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  ghiNhatKyHoatDong
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'chuc_vu' as const;
const GIOI_HAN_MAC_DINH = 500;
const STORAGE_KEY = 'ebms_danh_sach_chuc_vu';

export const CAC_CHUC_VU_MAC_DINH: Omit<ChucVu, 'id'>[] = [
  {
    ten_chuc_vu: 'Tổng Giám Đốc',
    ma_chuc_vu: 'TGD',
    mo_ta: 'Điều hành toàn bộ hoạt động chiến lược và kinh doanh',
    thu_tu_sap_xep: 10,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Phó Tổng Giám Đốc',
    ma_chuc_vu: 'PTGD',
    mo_ta: 'Hỗ trợ Tổng Giám Đốc điều hành các khối vận hành',
    thu_tu_sap_xep: 20,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Trưởng Phòng Kinh Doanh',
    ma_chuc_vu: 'TPKD',
    mo_ta: 'Quản lý phòng kinh doanh và chỉ tiêu doanh số toàn đơn vị',
    thu_tu_sap_xep: 30,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Nhân Viên Kinh Doanh',
    ma_chuc_vu: 'NVKD',
    mo_ta: 'Tìm kiếm khách hàng, tư vấn giải pháp và phát triển doanh số',
    thu_tu_sap_xep: 40,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Trưởng Phòng Kỹ Thuật',
    ma_chuc_vu: 'TPKT',
    mo_ta: 'Chỉ đạo kỹ thuật, giám sát giải pháp công nghệ và tiến độ dự án',
    thu_tu_sap_xep: 50,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Kỹ Sư Triển Khai',
    ma_chuc_vu: 'KSTK',
    mo_ta: 'Khảo sát, lắp đặt, vận hành giải pháp và nghiệm thu dự án',
    thu_tu_sap_xep: 60,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Kế Toán Trưởng',
    ma_chuc_vu: 'KTT',
    mo_ta: 'Kiểm soát tài chính, thuế, dòng tiền và hạch toán kế toán',
    thu_tu_sap_xep: 70,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Nhân Viên Kế Toán',
    ma_chuc_vu: 'NVKT',
    mo_ta: 'Thực hiện thu chi, hóa đơn và lưu trữ chứng từ kế toán',
    thu_tu_sap_xep: 80,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  },
  {
    ten_chuc_vu: 'Chuyên Viên Nhân Sự',
    ma_chuc_vu: 'HR',
    mo_ta: 'Tuyển dụng, chấm công, chế độ phúc lợi và quản trị nhân sự',
    thu_tu_sap_xep: 90,
    nguoi_tao_id: null,
    ngay_tao: '2026-01-01T00:00:00.000Z',
    ngay_cap_nhat: '2026-01-01T00:00:00.000Z',
    trang_thai_du_lieu: 'hoat_dong'
  }
];

export interface DieuKienLocChucVu {
  tuKhoa?: string | null;
  trang_thai_du_lieu?: 'tat_ca' | 'hoat_dong' | 'da_xoa' | null;
  gioiHan?: number | null;
}

export interface TaoMoiChucVuDTO {
  ten_chuc_vu: string;
  ma_chuc_vu?: string | null;
  mo_ta?: string | null;
  thu_tu_sap_xep?: number;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface CapNhatChucVuDTO extends Partial<Omit<TaoMoiChucVuDTO, 'ten_chuc_vu' | 'trang_thai_du_lieu'>> {
  id: string;
  ten_chuc_vu?: string;
  trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
}

export interface KetQuaDanhSachChucVu {
  mang: ChucVu[];
  tong: number;
}

type RawBanGhi = Omit<ChucVu, 'id'>;

const loaiBoUndefined = <T extends Record<string, any>>(obj: T): T => {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
};

const chuyenDoiDocThanhDoiTuong = (id: string, raw: DocumentData | RawBanGhi | undefined | null): ChucVu => {
  const r = (raw ?? {}) as Partial<RawBanGhi>;
  const today = new Date().toISOString();
  const tt = (r.trang_thai_du_lieu as ChucVu['trang_thai_du_lieu']) ?? 'hoat_dong';
  return {
    id,
    ma_chuc_vu: r.ma_chuc_vu ?? null,
    ten_chuc_vu: String(r.ten_chuc_vu ?? ''),
    mo_ta: r.mo_ta ?? null,
    thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number' ? r.thu_tu_sap_xep : 0,
    nguoi_tao_id: r.nguoi_tao_id ?? null,
    ngay_tao: String(r.ngay_tao ?? today),
    ngay_cap_nhat: String(r.ngay_cap_nhat ?? today),
    trang_thai_du_lieu: tt
  };
};

const layTuLocalStorage = (): ChucVu[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const luuVaoLocalStorage = (mang: ChucVu[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mang));
  } catch (e) {
    console.warn('[dich_vu_chuc_vu] luuVaoLocalStorage failed:', e);
  }
};

const thongBaoCapNhat = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ebms:chuc_vu:cap_nhat'));
  }
};

const taoDieuKien = (dk: DieuKienLocChucVu): QueryConstraint[] => {
  const mang: QueryConstraint[] = [];
  mang.push(limit(typeof dk.gioiHan === 'number' ? dk.gioiHan : GIOI_HAN_MAC_DINH));
  return mang;
};

const sortTrongBoNho = (mang: ChucVu[]): ChucVu[] => {
  return [...mang].sort((a, b) => {
    const thuTu = (a.thu_tu_sap_xep ?? 0) - (b.thu_tu_sap_xep ?? 0);
    if (thuTu !== 0) return thuTu;
    return (a.ten_chuc_vu ?? '').localeCompare(b.ten_chuc_vu ?? '', 'vi');
  });
};

const locTheoDieuKienBoNho = (mang: ChucVu[], dk: DieuKienLocChucVu): ChucVu[] => {
  return mang.filter((x) => {
    if (dk.trang_thai_du_lieu && dk.trang_thai_du_lieu !== 'tat_ca') {
      if ((x.trang_thai_du_lieu ?? 'hoat_dong') !== dk.trang_thai_du_lieu) return false;
    }
    return true;
  });
};

const locTheoTuKhoa = (mang: ChucVu[], tuKhoa: string | null | undefined): ChucVu[] => {
  const kw = String(tuKhoa ?? '').trim().toLowerCase();
  if (!kw) return mang;
  return mang.filter((x) =>
    [x.ten_chuc_vu, x.ma_chuc_vu, x.mo_ta]
      .map((s) => (s ?? '').toString().toLowerCase())
      .some((s) => s.includes(kw))
  );
};

export const danhSachChucVu = async (dk: DieuKienLocChucVu = {}): Promise<KetQuaDanhSachChucVu> => {
  const full: DieuKienLocChucVu = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...dk };
  let danhSachTong: ChucVu[] = [];

  try {
    const snap = await getDocs(query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full)));
    const mangFirestore = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
    
    // Gộp với local storage (tránh mất các bản ghi vừa tạo nếu Firestore indexing có độ trễ)
    const local = layTuLocalStorage();
    const map = new Map<string, ChucVu>();
    
    // Đưa local vào trước
    local.forEach((item) => map.set(item.id, item));
    // Firestore ghi đè lên local nếu cùng id
    mangFirestore.forEach((item) => map.set(item.id, item));
    
    danhSachTong = Array.from(map.values());

    // Nếu cả firestore lẫn local đều trống, khởi tạo danh sách chức vụ mặc định
    if (danhSachTong.length === 0) {
      danhSachTong = CAC_CHUC_VU_MAC_DINH.map((item, idx) => ({
        ...item,
        id: `chuc_vu_mac_dinh_${idx + 1}`
      }));
      // Tự động lưu ngầm vào local storage
      luuVaoLocalStorage(danhSachTong);
    } else {
      luuVaoLocalStorage(danhSachTong);
    }
  } catch (err) {
    console.warn('[dich_vu_chuc_vu] danhSachChucVu getDocs error, using localStorage fallback:', err);
    danhSachTong = layTuLocalStorage();
    if (danhSachTong.length === 0) {
      danhSachTong = CAC_CHUC_VU_MAC_DINH.map((item, idx) => ({
        ...item,
        id: `chuc_vu_mac_dinh_${idx + 1}`
      }));
      luuVaoLocalStorage(danhSachTong);
    }
  }

  const mang = sortTrongBoNho(danhSachTong);
  const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
  const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
  return { mang: daLoc, tong: daLoc.length };
};

export const layChiTietChucVu = async (id: string): Promise<ChucVu | null> => {
  try {
    const snap = await getDoc(thamChieuBanGhi(TEN_COLLECTION, id));
    if (snap.exists()) {
      return chuyenDoiDocThanhDoiTuong(snap.id, snap.data());
    }
  } catch (e) {
    console.warn('[dich_vu_chuc_vu] layChiTietChucVu Firestore error:', e);
  }
  const local = layTuLocalStorage();
  return local.find((x) => x.id === id) ?? null;
};

export const taoChucVuMoi = async (
  dto: TaoMoiChucVuDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChucVu> => {
  if (!dto.ten_chuc_vu || !dto.ten_chuc_vu.trim()) {
    throw new Error('Tên chức vụ không được để trống.');
  }
  const now = new Date().toISOString();
  const idNguoiThucHien = nguoiThucHien?.id ?? null;
  const duLieuRaw: RawBanGhi = loaiBoUndefined({
    ten_chuc_vu: dto.ten_chuc_vu.trim(),
    ma_chuc_vu: dto.ma_chuc_vu?.trim() || null,
    mo_ta: dto.mo_ta?.trim() || null,
    thu_tu_sap_xep: typeof dto.thu_tu_sap_xep === 'number' ? dto.thu_tu_sap_xep : 0,
    nguoi_tao_id: idNguoiThucHien,
    ngay_tao: now,
    ngay_cap_nhat: now,
    trang_thai_du_lieu: dto.trang_thai_du_lieu ?? 'hoat_dong'
  });

  let moi: ChucVu;
  try {
    const thamChieu = await addDoc(thamChieuCollection(TEN_COLLECTION), duLieuRaw as any);
    moi = chuyenDoiDocThanhDoiTuong(thamChieu.id, duLieuRaw);
    try {
      await ghiNhatKyHoatDong(
        idNguoiThucHien,
        TEN_COLLECTION,
        'tao_moi',
        moi.id,
        `Tạo chức vụ "${moi.ten_chuc_vu}"`
      );
    } catch { /* Bỏ qua nếu nhật ký không ghi được */ }
  } catch (err) {
    console.warn('[dich_vu_chuc_vu] taoChucVuMoi Firestore fallback:', err);
    const mockId = `cv_${Date.now()}`;
    moi = chuyenDoiDocThanhDoiTuong(mockId, duLieuRaw);
  }

  // Cập nhật ngay lập tức vào LocalStorage để UI nhận ngay
  const dsHienTai = layTuLocalStorage();
  const dsMoi = [moi, ...dsHienTai.filter((x) => x.id !== moi.id)];
  luuVaoLocalStorage(dsMoi);
  thongBaoCapNhat();

  return moi;
};

export const capNhatChucVu = async (
  dto: CapNhatChucVuDTO,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChucVu> => {
  const hienTai = await layChiTietChucVu(dto.id);
  const now = new Date().toISOString();
  const patchRaw: Partial<RawBanGhi> = {};
  (Object.keys(dto) as (keyof CapNhatChucVuDTO)[]).forEach((k) => {
    if (k === 'id') return;
    const giaTriRaw = (dto as unknown as Record<string, unknown>)[k];
    if (giaTriRaw === undefined) return;
    if (typeof giaTriRaw === 'string') {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw.trim() || null;
    } else {
      (patchRaw as unknown as Record<string, unknown>)[k] = giaTriRaw;
    }
  });
  patchRaw.ngay_cap_nhat = now;
  const cleanPatch = loaiBoUndefined(patchRaw);

  try {
    await setDoc(thamChieuBanGhi(TEN_COLLECTION, dto.id), cleanPatch as any, { merge: true });
    try {
      await ghiNhatKyHoatDong(
        nguoiThucHien?.id,
        TEN_COLLECTION,
        'cap_nhat',
        dto.id,
        `Cập nhật chức vụ "${cleanPatch.ten_chuc_vu || hienTai?.ten_chuc_vu || dto.id}"`
      );
    } catch { /* Bỏ qua nhật ký */ }
  } catch (err) {
    console.warn('[dich_vu_chuc_vu] capNhatChucVu Firestore fallback:', err);
  }

  const moi = { ...(hienTai || {}), ...cleanPatch, id: dto.id } as ChucVu;

  // Cập nhật LocalStorage
  const dsHienTai = layTuLocalStorage();
  const dsMoi = dsHienTai.map((x) => (x.id === dto.id ? moi : x));
  if (!dsMoi.some((x) => x.id === dto.id)) {
    dsMoi.push(moi);
  }
  luuVaoLocalStorage(dsMoi);
  thongBaoCapNhat();

  return moi;
};

export const xoaMemChucVu = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChucVu> => {
  return capNhatChucVu({ id, trang_thai_du_lieu: 'da_xoa' }, nguoiThucHien);
};

export const khoiPhucChucVu = async (
  id: string,
  nguoiThucHien: Pick<NhanSu, 'id'> | null | undefined
): Promise<ChucVu> => {
  return capNhatChucVu({ id, trang_thai_du_lieu: 'hoat_dong' }, nguoiThucHien);
};

export const langNgheThayDoiDanhSachChucVu = (
  callback: (mang: ChucVu[]) => void,
  loc: DieuKienLocChucVu = {}
): Unsubscribe => {
  const full: DieuKienLocChucVu = { tuKhoa: null, trang_thai_du_lieu: 'hoat_dong', gioiHan: null, ...loc };
  const q = query(thamChieuCollection(TEN_COLLECTION), ...taoDieuKien(full));
  
  const unsub = onSnapshot(
    q,
    (snap) => {
      const mangChuaSort = snap.docs.map((d) => chuyenDoiDocThanhDoiTuong(d.id, d.data()));
      const local = layTuLocalStorage();
      const map = new Map<string, ChucVu>();
      local.forEach((item) => map.set(item.id, item));
      mangChuaSort.forEach((item) => map.set(item.id, item));
      const danhSachTong = Array.from(map.values());

      const mang = sortTrongBoNho(danhSachTong);
      const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
      const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
      callback(daLoc);
    },
    (err) => {
      console.warn('[dich_vu_chuc_vu] onSnapshot error:', err);
      // Fallback khi onSnapshot gặp lỗi mạng/rules
      const local = layTuLocalStorage();
      const mang = sortTrongBoNho(local);
      const daLocTheoDieuKien = locTheoDieuKienBoNho(mang, full);
      const daLoc = locTheoTuKhoa(daLocTheoDieuKien, full.tuKhoa);
      callback(daLoc);
    }
  );

  return unsub;
};
