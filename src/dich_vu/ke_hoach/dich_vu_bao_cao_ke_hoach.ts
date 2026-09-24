'use client';

import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import type {
  BaoCaoKeHoachTuan,
  BaoCaoKeHoachThang
} from '../../thu_vien/types/bao_cao_ke_hoach';
import {
  thamChieuCollection,
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';

const COLLECTION_BC_TUAN = 'bao_cao_ke_hoach_tuan' as const;
const COLLECTION_BC_THANG = 'bao_cao_ke_hoach_thang' as const;

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

// === BÁO CÁO KẾ HOẠCH TUẦN ===

export const layBaoCaoKeHoachTuan = async (
  nhanVienId: string,
  tuan: string
): Promise<BaoCaoKeHoachTuan | null> => {
  const cacheKey = `ebms_bc_kh_tuan_${nhanVienId}_${tuan}`;
  let itemRemote: BaoCaoKeHoachTuan | null = null;
  let remoteFound = false;

  try {
    const q = query(
      thamChieuCollection(COLLECTION_BC_TUAN),
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
      itemRemote = { id: foundDoc.id, ...(foundDoc.data() as Omit<BaoCaoKeHoachTuan, 'id'>) };
    }
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] layBaoCaoKeHoachTuan Firestore catch:', err);
  }

  if (remoteFound && itemRemote) {
    luuCacheLocal(cacheKey, itemRemote);
    return itemRemote;
  }

  const itemLocal = layCacheLocal<BaoCaoKeHoachTuan>(cacheKey);
  return itemRemote || itemLocal;
};

export const luuBaoCaoKeHoachTuan = async (
  bc: Omit<BaoCaoKeHoachTuan, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'trang_thai_du_lieu'> & {
    id?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
  }
): Promise<BaoCaoKeHoachTuan> => {
  const now = new Date().toISOString();
  const docId = bc.id || null;
  const cacheKey = `ebms_bc_kh_tuan_${bc.nhan_vien_id}_${bc.tuan}`;

  const rawCopy = { ...bc };
  delete rawCopy.id;

  const dataClean = loaiBoUndefined(rawCopy);

  let ketQua: BaoCaoKeHoachTuan;

  try {
    if (docId) {
      const patch = {
        ...dataClean,
        ngay_cap_nhat: now
      };
      await setDoc(thamChieuBanGhi(COLLECTION_BC_TUAN, docId), patch, { merge: true });
      ketQua = {
        ...bc,
        id: docId,
        ngay_tao: bc.ngay_tao || now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: bc.trang_thai_du_lieu || 'hoat_dong'
      };
    } else {
      const raw = {
        ...dataClean,
        ngay_tao: now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: 'hoat_dong' as const
      };
      const ref = await addDoc(thamChieuCollection(COLLECTION_BC_TUAN), raw);
      ketQua = { id: ref.id, ...raw };
    }
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] luuBaoCaoKeHoachTuan fallback:', err);
    ketQua = {
      ...bc,
      id: docId || `local_bc_tuan_${Date.now()}`,
      ngay_tao: bc.ngay_tao || now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: bc.trang_thai_du_lieu || 'hoat_dong'
    };
  }

  luuCacheLocal(cacheKey, ketQua);
  return ketQua;
};

export const danhSachBaoCaoTuanTheoFilter = async (
  tuan: string,
  chiNhanhId?: string | null
): Promise<BaoCaoKeHoachTuan[]> => {
  let res: BaoCaoKeHoachTuan[] = [];
  try {
    const q = query(thamChieuCollection(COLLECTION_BC_TUAN), where('tuan', '==', tuan), limit(200));
    const snap = await getDocs(q);
    res = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<BaoCaoKeHoachTuan, 'id'>) }))
      .filter((x) => x.trang_thai_du_lieu === 'hoat_dong' || !x.trang_thai_du_lieu);
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] danhSachBaoCaoTuanTheoFilter catch:', err);
  }

  if (chiNhanhId) {
    return res.filter((x) => x.chi_nhanh_id === chiNhanhId);
  }
  return res;
};

// === BÁO CÁO KẾ HOẠCH THÁNG ===

export const layBaoCaoKeHoachThang = async (
  nhanVienId: string,
  thang: string
): Promise<BaoCaoKeHoachThang | null> => {
  const cacheKey = `ebms_bc_kh_thang_${nhanVienId}_${thang}`;
  let itemRemote: BaoCaoKeHoachThang | null = null;
  let remoteFound = false;

  try {
    const q = query(
      thamChieuCollection(COLLECTION_BC_THANG),
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
      itemRemote = { id: foundDoc.id, ...(foundDoc.data() as Omit<BaoCaoKeHoachThang, 'id'>) };
    }
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] layBaoCaoKeHoachThang Firestore catch:', err);
  }

  if (remoteFound && itemRemote) {
    luuCacheLocal(cacheKey, itemRemote);
    return itemRemote;
  }

  const itemLocal = layCacheLocal<BaoCaoKeHoachThang>(cacheKey);
  return itemRemote || itemLocal;
};

export const luuBaoCaoKeHoachThang = async (
  bc: Omit<BaoCaoKeHoachThang, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'trang_thai_du_lieu'> & {
    id?: string;
    ngay_tao?: string;
    ngay_cap_nhat?: string;
    trang_thai_du_lieu?: 'hoat_dong' | 'da_xoa';
  }
): Promise<BaoCaoKeHoachThang> => {
  const now = new Date().toISOString();
  const docId = bc.id || null;
  const cacheKey = `ebms_bc_kh_thang_${bc.nhan_vien_id}_${bc.thang}`;

  const rawCopy = { ...bc };
  delete rawCopy.id;

  const dataClean = loaiBoUndefined(rawCopy);

  let ketQua: BaoCaoKeHoachThang;

  try {
    if (docId) {
      const patch = {
        ...dataClean,
        ngay_cap_nhat: now
      };
      await setDoc(thamChieuBanGhi(COLLECTION_BC_THANG, docId), patch, { merge: true });
      ketQua = {
        ...bc,
        id: docId,
        ngay_tao: bc.ngay_tao || now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: bc.trang_thai_du_lieu || 'hoat_dong'
      };
    } else {
      const raw = {
        ...dataClean,
        ngay_tao: now,
        ngay_cap_nhat: now,
        trang_thai_du_lieu: 'hoat_dong' as const
      };
      const ref = await addDoc(thamChieuCollection(COLLECTION_BC_THANG), raw);
      ketQua = { id: ref.id, ...raw };
    }
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] luuBaoCaoKeHoachThang fallback:', err);
    ketQua = {
      ...bc,
      id: docId || `local_bc_thang_${Date.now()}`,
      ngay_tao: bc.ngay_tao || now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: bc.trang_thai_du_lieu || 'hoat_dong'
    };
  }

  luuCacheLocal(cacheKey, ketQua);
  return ketQua;
};

export const danhSachBaoCaoThangTheoFilter = async (
  thang: string,
  chiNhanhId?: string | null
): Promise<BaoCaoKeHoachThang[]> => {
  let res: BaoCaoKeHoachThang[] = [];
  try {
    const q = query(thamChieuCollection(COLLECTION_BC_THANG), where('thang', '==', thang), limit(200));
    const snap = await getDocs(q);
    res = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<BaoCaoKeHoachThang, 'id'>) }))
      .filter((x) => x.trang_thai_du_lieu === 'hoat_dong' || !x.trang_thai_du_lieu);
  } catch (err) {
    console.warn('[dich_vu_bao_cao_ke_hoach] danhSachBaoCaoThangTheoFilter catch:', err);
  }

  if (chiNhanhId) {
    return res.filter((x) => x.chi_nhanh_id === chiNhanhId);
  }
  return res;
};
