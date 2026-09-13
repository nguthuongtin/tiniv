'use client';

import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  getFirestore
} from 'firebase/firestore';
import { ref, type FirebaseStorage, getStorage } from 'firebase/storage';
import type { NhatKyHoatDong, HanhDongNhatKy } from '../types';

export const layCauHinhFirebase = (): FirebaseOptions => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!apiKey || !projectId || !appId) {
    throw new Error(
      'Thieu bien moi truong Firebase (NEXT_PUBLIC_FIREBASE_API_KEY, PROJECT_ID hoac APP_ID). Vui long kiem tra file .env.local'
    );
  }

  const cau_hinh: FirebaseOptions = {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? '0',
    appId
  };

  if (measurementId) {
    cau_hinh.measurementId = measurementId;
  }

  return cau_hinh;
};

let appFirebase: FirebaseApp | null = null;
let xacThucFirebase: Auth | null = null;
let luuTruChinhFirebase: Firestore | null = null;
let luuTruFileFirebase: FirebaseStorage | null = null;

const khoiTaoFirebase = (): {
  app: FirebaseApp;
  xacThuc: Auth;
  csdl: Firestore;
  storage: FirebaseStorage;
} => {
  if (!appFirebase) {
    const cau_hinh = layCauHinhFirebase();
    appFirebase = initializeApp(cau_hinh);
  }

  if (!xacThucFirebase) {
    xacThucFirebase = getAuth(appFirebase);
  }

  if (!luuTruChinhFirebase) {
    luuTruChinhFirebase = getFirestore(appFirebase);
  }

  if (!luuTruFileFirebase) {
    luuTruFileFirebase = getStorage(appFirebase);
  }

  return {
    app: appFirebase,
    xacThuc: xacThucFirebase,
    csdl: luuTruChinhFirebase,
    storage: luuTruFileFirebase
  };
};

const { app, xacThuc, csdl, storage } = khoiTaoFirebase();

// ==== Helper lay collection reference nhanh theo ten collection ====
type TenCollection =
  | 'nhan_su'
  | 'chi_nhanh'
  | 'phong_ban'
  | 'vai_tro'
  | 'chuc_vu'
  | 'khach_hang'
  | 'nguoi_lien_he'
  | 'ho_so_du_an'
  | 'tien_do_du_an'
  | 'cong_viec'
  | 'bao_cao_cong_viec'
  | 'tai_lieu_du_an'
  | 'nhat_ky_hoat_dong'
  | 'san_pham_dich_vu'
  | 'nhom_san_pham_dich_vu'
  | 'ke_hoach_thang'
  | 'ke_hoach_tuan'
  | 'cau_hinh_he_thong';

export const thamChieuCollection = (ten: TenCollection): CollectionReference => {
  return collection(csdl, ten);
};

export const thamChieuBanGhi = (
  tenCollection: TenCollection,
  idBanGhi: string
): DocumentReference => {
  return doc(csdl, tenCollection, idBanGhi);
};

// ==== Helper ghi nhat ky hoat dong tu dong khi co tac dong ====
export const ghiNhatKyHoatDong = async (
  nguoiDungId: string | null | undefined,
  module: string,
  hanhDong: HanhDongNhatKy | string,
  banGhiId?: string | null,
  noiDung?: string | null
): Promise<string | null> => {
  try {
    if (!nguoiDungId) return null;
    const duLieu: Omit<NhatKyHoatDong, 'id'> = {
      nguoi_dung_id: nguoiDungId,
      module,
      hanh_dong: hanhDong,
      ban_ghi_id: banGhiId ?? null,
      noi_dung: noiDung ?? null,
      thoi_gian: new Date().toISOString()
    };
    const thamChieu = await addDoc(collection(csdl, 'nhat_ky_hoat_dong'), duLieu as any);
    return thamChieu.id;
  } catch (_err) {
    return null;
  }
};

export const layServerTimestamp = () => serverTimestamp();

export { app as firebaseApp, xacThuc as firebaseAuth, csdl as firebaseFirestore, storage as firebaseStorage };
export default khoiTaoFirebase;
