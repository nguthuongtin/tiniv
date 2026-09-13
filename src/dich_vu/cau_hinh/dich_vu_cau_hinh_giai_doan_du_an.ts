'use client';

import {
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import type { CauHinhMotGiaiDoan } from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  DANH_SACH_GIAI_DOAN_MAC_DINH,
  setCacheTamGiaiDoan
} from '../../thu_vien/cau_hinh/giai_doan_du_an';
import {
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'cau_hinh_he_thong' as const;
const ID_DOC_GIAI_DOAN = 'giai_doan_du_an';

export interface CauHinhGiaiDoanDuAnHeThong {
  id: string;
  danh_sach: CauHinhMotGiaiDoan[];
  ngay_cap_nhat: string;
}

const rawToCauHinh = (raw: any | null | undefined): CauHinhGiaiDoanDuAnHeThong => {
  const nhap: any[] = Array.isArray(raw?.danh_sach) ? raw.danh_sach : [];
  const map = new Map<string, any>(nhap.map((x) => [String(x.key), x]));
  const setDaThem = new Set<string>();
  const danh_sach: CauHinhMotGiaiDoan[] = [];
  for (const macDinh of DANH_SACH_GIAI_DOAN_MAC_DINH) {
    const k = macDinh.key;
    setDaThem.add(k);
    const override = map.get(k);
    danh_sach.push({
      ...macDinh,
      kieu: override?.kieu ?? macDinh.kieu,
      nhan_ngan: override?.nhan_ngan ?? macDinh.nhan_ngan,
      nhan_day_du: override?.nhan_day_du ?? macDinh.nhan_day_du,
      khoa_ghi_nhan_doanh_so: typeof override?.khoa_ghi_nhan_doanh_so === 'boolean' ? override.khoa_ghi_nhan_doanh_so : macDinh.khoa_ghi_nhan_doanh_so,
      stt: typeof override?.stt === 'number' ? override.stt : macDinh.stt
    } satisfies CauHinhMotGiaiDoan);
  }
  for (const [k, override] of map.entries()) {
    if (setDaThem.has(k)) continue;
    const DS_KIEU_HOP_LE: CauHinhMotGiaiDoan['kieu'][] = ['muted', 'primary', 'warning', 'success', 'danger'];
    const kieuHopLe = DS_KIEU_HOP_LE.includes(String(override?.kieu ?? 'muted') as any)
      ? (override.kieu as CauHinhMotGiaiDoan['kieu'])
      : 'muted';
    danh_sach.push({
      key: k,
      kieu: kieuHopLe,
      nhan_ngan: String(override?.nhan_ngan ?? override?.key ?? k),
      nhan_day_du: String(override?.nhan_day_du ?? override?.nhan_ngan ?? override?.key ?? k),
      khoa_ghi_nhan_doanh_so: typeof override?.khoa_ghi_nhan_doanh_so === 'boolean' ? override.khoa_ghi_nhan_doanh_so : false,
      stt: typeof override?.stt === 'number' ? override.stt : (DANH_SACH_GIAI_DOAN_MAC_DINH.length + danh_sach.length + 1)
    } satisfies CauHinhMotGiaiDoan);
  }
  danh_sach.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0) || a.key.localeCompare(b.key));
  return {
    id: String(raw?.id ?? ID_DOC_GIAI_DOAN),
    danh_sach,
    ngay_cap_nhat: String(raw?.ngay_cap_nhat ?? new Date().toISOString())
  };
};

export const layCauHinhGiaiDoanDuAn = async (): Promise<CauHinhGiaiDoanDuAnHeThong> => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_GIAI_DOAN);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const seed: CauHinhGiaiDoanDuAnHeThong = {
      id: ID_DOC_GIAI_DOAN,
      danh_sach: DANH_SACH_GIAI_DOAN_MAC_DINH.map((x) => ({ ...x })),
      ngay_cap_nhat: new Date().toISOString()
    };
    try {
      await setDoc(ref, seed as any, { merge: true });
    } catch {
      /* ignore */
    }
    setCacheTamGiaiDoan(seed.danh_sach);
    return seed;
  }
  const ketQua = rawToCauHinh({ id: snap.id, ...snap.data() });
  setCacheTamGiaiDoan(ketQua.danh_sach);
  return ketQua;
};

export const capNhatCauHinhGiaiDoanDuAn = async (
  danh_sach_moi: CauHinhMotGiaiDoan[]
): Promise<CauHinhGiaiDoanDuAnHeThong> => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_GIAI_DOAN);
  const bayGio = new Date().toISOString();
  const danh_sach = danh_sach_moi.map((x) => ({ ...x }));
  const ghi: any = {
    id: ID_DOC_GIAI_DOAN,
    danh_sach,
    ngay_cap_nhat: bayGio
  };
  await setDoc(ref, ghi, { merge: true });
  setCacheTamGiaiDoan(danh_sach);
  return { id: ID_DOC_GIAI_DOAN, danh_sach, ngay_cap_nhat: bayGio };
};

export const langNgheCauHinhGiaiDoanDuAn = (
  xuLy: (c: CauHinhGiaiDoanDuAnHeThong) => void
): Unsubscribe => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_GIAI_DOAN);
  return onSnapshot(ref, { includeMetadataChanges: false }, (snap) => {
    if (snap.exists()) {
      const c = rawToCauHinh({ id: snap.id, ...snap.data() });
      setCacheTamGiaiDoan(c.danh_sach);
      xuLy(c);
    } else {
      void layCauHinhGiaiDoanDuAn()
        .then((seeded) => xuLy(seeded))
        .catch(() => {
          const fallback: CauHinhGiaiDoanDuAnHeThong = {
            id: ID_DOC_GIAI_DOAN,
            danh_sach: DANH_SACH_GIAI_DOAN_MAC_DINH.map((x) => ({ ...x })),
            ngay_cap_nhat: new Date().toISOString()
          };
          setCacheTamGiaiDoan(fallback.danh_sach);
          xuLy(fallback);
        });
    }
  });
};
