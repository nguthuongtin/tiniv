'use client';

import { getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { thamChieuBanGhi } from '../../thu_vien/firebase/client_firebase';

const TEN_COLLECTION = 'cau_hinh_he_thong' as const;
const ID_DOC_QUY_TRINH = 'quy_trinh_phoi_hop';

export interface CauHinhQuyTrinhPhoiHop {
  tp_khth_id: string | null;
  ten_tp_khth: string | null;
  tp_kd_id: string | null;
  ten_tp_kd: string | null;
  giam_doc_id: string | null;
  ten_giam_doc: string | null;
  che_do_duyet_bao_cao_tuan?: '1_cap' | '2_cap';
  nguoi_duyet_tuan_cap_1_id?: string | null;
  ten_nguoi_duyet_tuan_cap_1?: string | null;
  nguoi_duyet_tuan_cap_2_id?: string | null;
  ten_nguoi_duyet_tuan_cap_2?: string | null;
  ngay_cap_nhat?: string;
}

const CAU_HINH_MAC_DINH: CauHinhQuyTrinhPhoiHop = {
  tp_khth_id: null,
  ten_tp_khth: null,
  tp_kd_id: null,
  ten_tp_kd: null,
  giam_doc_id: null,
  ten_giam_doc: null,
  che_do_duyet_bao_cao_tuan: '2_cap',
  nguoi_duyet_tuan_cap_1_id: null,
  ten_nguoi_duyet_tuan_cap_1: null,
  nguoi_duyet_tuan_cap_2_id: null,
  ten_nguoi_duyet_tuan_cap_2: null
};

let cacheTamCauHinh: CauHinhQuyTrinhPhoiHop | null = null;

export const layCauHinhQuyTrinhPhoiHop = async (): Promise<CauHinhQuyTrinhPhoiHop> => {
  if (cacheTamCauHinh) return cacheTamCauHinh;
  try {
    const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_QUY_TRINH);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      cacheTamCauHinh = { ...CAU_HINH_MAC_DINH };
      return cacheTamCauHinh;
    }
    const data = snap.data();
    cacheTamCauHinh = {
      tp_khth_id: data.tp_khth_id || null,
      ten_tp_khth: data.ten_tp_khth || null,
      tp_kd_id: data.tp_kd_id || null,
      ten_tp_kd: data.ten_tp_kd || null,
      giam_doc_id: data.giam_doc_id || null,
      ten_giam_doc: data.ten_giam_doc || null,
      che_do_duyet_bao_cao_tuan: data.che_do_duyet_bao_cao_tuan === '1_cap' ? '1_cap' : '2_cap',
      nguoi_duyet_tuan_cap_1_id: data.nguoi_duyet_tuan_cap_1_id || null,
      ten_nguoi_duyet_tuan_cap_1: data.ten_nguoi_duyet_tuan_cap_1 || null,
      nguoi_duyet_tuan_cap_2_id: data.nguoi_duyet_tuan_cap_2_id || null,
      ten_nguoi_duyet_tuan_cap_2: data.ten_nguoi_duyet_tuan_cap_2 || null,
      ngay_cap_nhat: data.ngay_cap_nhat || undefined
    };
    return cacheTamCauHinh;
  } catch (err) {
    console.warn('[layCauHinhQuyTrinhPhoiHop] Lỗi đọc cấu hình:', err);
    return { ...CAU_HINH_MAC_DINH };
  }
};

export const capNhatCauHinhQuyTrinhPhoiHop = async (
  duLieu: Partial<CauHinhQuyTrinhPhoiHop>
): Promise<CauHinhQuyTrinhPhoiHop> => {
  const hienTai = await layCauHinhQuyTrinhPhoiHop();
  const moi: CauHinhQuyTrinhPhoiHop = {
    ...hienTai,
    ...duLieu,
    ngay_cap_nhat: new Date().toISOString()
  };

  const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_QUY_TRINH);
  await setDoc(ref, moi, { merge: true });
  cacheTamCauHinh = moi;
  return moi;
};

export const langNgheCauHinhQuyTrinh = (
  cb: (cfg: CauHinhQuyTrinhPhoiHop) => void
): Unsubscribe => {
  const ref = thamChieuBanGhi(TEN_COLLECTION, ID_DOC_QUY_TRINH);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cacheTamCauHinh = { ...CAU_HINH_MAC_DINH };
        cb(cacheTamCauHinh);
        return;
      }
      const data = snap.data();
      cacheTamCauHinh = {
        tp_khth_id: data.tp_khth_id || null,
        ten_tp_khth: data.ten_tp_khth || null,
        tp_kd_id: data.tp_kd_id || null,
        ten_tp_kd: data.ten_tp_kd || null,
        giam_doc_id: data.giam_doc_id || null,
        ten_giam_doc: data.ten_giam_doc || null,
        ngay_cap_nhat: data.ngay_cap_nhat || undefined
      };
      cb(cacheTamCauHinh);
    },
    (err) => {
      console.warn('[langNgheCauHinhQuyTrinh] Lỗi realtime:', err);
    }
  );
};
