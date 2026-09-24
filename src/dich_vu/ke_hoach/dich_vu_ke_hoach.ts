'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  type QueryConstraint
} from 'firebase/firestore';
import type {
  KeHoachThang,
  KeHoachTuan,
  ItemKeHoachThang,
  ItemKeHoachTuan
} from '../../thu_vien/types/ke_hoach';
import type { NhanSu } from '../../thu_vien/types/nhan_su';
import {
  thamChieuCollection,
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';

const COLLECTION_THANG = 'ke_hoach_thang' as const;
const COLLECTION_TUAN = 'ke_hoach_tuan' as const;

// Helper localStorage cache
const layCacheLocal = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const luuCacheLocal = <T>(key: string, val: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
};

// Helper tu dong sanitize tat ca bien undefined truoc khi gui Firestore
function loaiBoUndefined<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  const res: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      res[key] = loaiBoUndefined(val);
    } else {
      res[key] = val;
    }
  }
  return res;
}

// --- KẾ HOẠCH THÁNG ---

export const layKeHoachThang = async (
  nhanVienId: string,
  thang: string
): Promise<KeHoachThang | null> => {
  const cacheKey = `ebms_ke_hoach_thang_${nhanVienId}_${thang}`;
  let itemRemote: KeHoachThang | null = null;
  let remoteFound = false;

  try {
    const q = query(
      thamChieuCollection(COLLECTION_THANG),
      where('nhan_vien_id', '==', nhanVienId),
      limit(50)
    );
    const snap = await getDocs(q);
    const foundDoc = snap.docs.find((d) => {
      const data = d.data();
      return (
        data.thang === thang &&
        (data.trang_thai_du_lieu === 'hoat_dong' || !data.trang_thai_du_lieu)
      );
    });

    if (foundDoc) {
      remoteFound = true;
      itemRemote = { id: foundDoc.id, ...(foundDoc.data() as Omit<KeHoachThang, 'id'>) };
    }
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] layKeHoachThang Firestore catch:', err);
  }

  if (remoteFound && itemRemote) {
    luuCacheLocal(cacheKey, itemRemote);
    return itemRemote;
  }

  const itemLocal = layCacheLocal<KeHoachThang>(cacheKey);
  return itemRemote || itemLocal;
};

export const luuKeHoachThang = async (
  kh: Omit<KeHoachThang, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'trang_thai_du_lieu'> & {
    id?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
  },
  nguoiThucHien?: Pick<NhanSu, 'id'> | null
): Promise<KeHoachThang> => {
  const now = new Date().toISOString();
  const docId = kh.id || null;
  const cacheKey = `ebms_ke_hoach_thang_${kh.nhan_vien_id}_${kh.thang}`;
  
  const rawCopy = { ...kh };
  delete rawCopy.id;

  const dataClean = loaiBoUndefined(rawCopy);

  let ketQua: KeHoachThang;

  try {
    if (docId) {
      const patch = {
        ...dataClean,
        ngay_cap_nhat: now
      };
      await setDoc(thamChieuBanGhi(COLLECTION_THANG, docId), patch, { merge: true });
      ketQua = {
        ...kh,
        id: docId,
        ngay_tao: kh.ngay_tao || now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: kh.trang_thai_du_lieu || 'hoat_dong'
      };
    } else {
      const raw = {
        ...dataClean,
        ngay_tao: now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: 'hoat_dong' as const
      };
      const ref = await addDoc(thamChieuCollection(COLLECTION_THANG), raw);
      ketQua = { id: ref.id, ...raw };
    }
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] luuKeHoachThang Firestore error fallback:', err);
    ketQua = {
      ...kh,
      id: docId || `local_thang_${Date.now()}`,
      ngay_tao: kh.ngay_tao || now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: kh.trang_thai_du_lieu || 'hoat_dong'
    };
  }

  luuCacheLocal(cacheKey, ketQua);
  return ketQua;
};

export const danhSachKeHoachThangTheoFilter = async (
  thang: string,
  chiNhanhId?: string | null
): Promise<KeHoachThang[]> => {
  try {
    const q = query(thamChieuCollection(COLLECTION_THANG), where('thang', '==', thang), limit(200));
    const snap = await getDocs(q);
    const res = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<KeHoachThang, 'id'>) }))
      .filter((x) => x.trang_thai_du_lieu === 'hoat_dong' || !x.trang_thai_du_lieu);

    if (chiNhanhId) {
      return res.filter((x) => x.chi_nhanh_id === chiNhanhId);
    }
    return res;
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] danhSachKeHoachThangTheoFilter catch:', err);
    return [];
  }
};

// --- KẾ HOẠCH TUẦN ---

export const layKeHoachTuan = async (
  nhanVienId: string,
  tuan: string
): Promise<KeHoachTuan | null> => {
  const cacheKey = `ebms_ke_hoach_tuan_${nhanVienId}_${tuan}`;
  let itemRemote: KeHoachTuan | null = null;
  let remoteFound = false;

  try {
    const q = query(
      thamChieuCollection(COLLECTION_TUAN),
      where('nhan_vien_id', '==', nhanVienId),
      limit(50)
    );
    const snap = await getDocs(q);
    const foundDoc = snap.docs.find((d) => {
      const data = d.data();
      return (
        data.tuan === tuan &&
        (data.trang_thai_du_lieu === 'hoat_dong' || !data.trang_thai_du_lieu)
      );
    });

    if (foundDoc) {
      remoteFound = true;
      itemRemote = { id: foundDoc.id, ...(foundDoc.data() as Omit<KeHoachTuan, 'id'>) };
    }
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] layKeHoachTuan Firestore catch:', err);
  }

  if (remoteFound && itemRemote) {
    luuCacheLocal(cacheKey, itemRemote);
    return itemRemote;
  }

  const itemLocal = layCacheLocal<KeHoachTuan>(cacheKey);
  return itemRemote || itemLocal;
};

export const luuKeHoachTuan = async (
  kh: Omit<KeHoachTuan, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'trang_thai_du_lieu'> & {
    id?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
  },
  nguoiThucHien?: Pick<NhanSu, 'id'> | null
): Promise<KeHoachTuan> => {
  const now = new Date().toISOString();
  const docId = kh.id || null;
  const cacheKey = `ebms_ke_hoach_tuan_${kh.nhan_vien_id}_${kh.tuan}`;

  const rawCopy = { ...kh };
  delete rawCopy.id;

  const dataClean = loaiBoUndefined(rawCopy);

  let ketQua: KeHoachTuan;

  try {
    if (docId) {
      const patch = {
        ...dataClean,
        ngay_cap_nhat: now
      };
      await setDoc(thamChieuBanGhi(COLLECTION_TUAN, docId), patch, { merge: true });
      ketQua = {
        ...kh,
        id: docId,
        ngay_tao: kh.ngay_tao || now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: kh.trang_thai_du_lieu || 'hoat_dong'
      };
    } else {
      const raw = {
        ...dataClean,
        ngay_tao: now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: 'hoat_dong' as const
      };
      const ref = await addDoc(thamChieuCollection(COLLECTION_TUAN), raw);
      ketQua = { id: ref.id, ...raw };
    }
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] luuKeHoachTuan Firestore error fallback:', err);
    ketQua = {
      ...kh,
      id: docId || `local_tuan_${Date.now()}`,
      ngay_tao: kh.ngay_tao || now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: kh.trang_thai_du_lieu || 'hoat_dong'
    };
  }

  luuCacheLocal(cacheKey, ketQua);
  return ketQua;
};

export const danhSachKeHoachTuanTheoFilter = async (
  tuan: string,
  chiNhanhId?: string | null
): Promise<KeHoachTuan[]> => {
  let res: KeHoachTuan[] = [];
  try {
    const q = query(thamChieuCollection(COLLECTION_TUAN), where('tuan', '==', tuan), limit(200));
    const snap = await getDocs(q);
    res = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<KeHoachTuan, 'id'>) }))
      .filter((x) => x.trang_thai_du_lieu === 'hoat_dong' || !x.trang_thai_du_lieu);
  } catch (err) {
    console.warn('[dich_vu_ke_hoach] danhSachKeHoachTuanTheoFilter catch:', err);
  }

  // Scanner fallback từ localStorage nếu Firestore chưa đồng bộ hoặc offline
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ebms_ke_hoach_tuan_')) {
          const item = layCacheLocal<KeHoachTuan>(key);
          if (item && item.tuan === tuan && !res.some((r) => r.nhan_vien_id === item.nhan_vien_id)) {
            res.push(item);
          }
        }
      }
    } catch (e) {
      console.warn('localStorage scan error:', e);
    }
  }

  if (chiNhanhId) {
    return res.filter((x) => x.chi_nhanh_id === chiNhanhId);
  }
  return res;
};

// Utilities cho tuần & tháng ISO
export const layThangHienTaiISO = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

export const layTuanFromDateISO = (dateStr?: string | null): string => {
  const date = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(date.getTime())) return layTuanHienTaiISO();
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const layTuanHienTaiISO = (): string => {
  return layTuanFromDateISO();
};
