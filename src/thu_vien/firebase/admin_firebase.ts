import { getApps, getApp, initializeApp, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

let adminApp: App | null = null;

export const layFirebaseAdmin = (): App => {
  if (adminApp) return adminApp;
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    adminApp = existingApps[0];
    return adminApp;
  }

  let serviceAccount: ServiceAccount | null = null;

  // 1. Uu tien bien moi truong FIREBASE_SERVICE_ACCOUNT_KEY (danh cho Vercel / Production)
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    try {
      const trimmed = envKey.trim();
      if (trimmed.startsWith('{')) {
        serviceAccount = JSON.parse(trimmed);
      } else {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
      }
    } catch (e) {
      console.error('Loi parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
    }
  }

  // 2. Neu khong co env thi doc tu file firebase-admin.json o thu muc goc (danh cho Local Dev)
  if (!serviceAccount) {
    const localFilePath = path.join(process.cwd(), 'firebase-admin.json');
    if (fs.existsSync(localFilePath)) {
      try {
        const fileContent = fs.readFileSync(localFilePath, 'utf-8');
        serviceAccount = JSON.parse(fileContent);
      } catch (e) {
        console.error('Loi doc file firebase-admin.json:', e);
      }
    }
  }

  if (!serviceAccount) {
    throw new Error(
      'Khong tim thay cau hinh Firebase Service Account (bien FIREBASE_SERVICE_ACCOUNT_KEY hoac file firebase-admin.json)'
    );
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount)
  });

  return adminApp;
};

export const adminAuth = () => {
  const app = layFirebaseAdmin();
  return getAuth(app);
};

export const adminFirestore = () => {
  const app = layFirebaseAdmin();
  return getFirestore(app);
};
