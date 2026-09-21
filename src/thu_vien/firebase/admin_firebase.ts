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

  // 3. Fallback cau hinh mac dinh truc tiep cho project ebms-deb7c
  if (!serviceAccount) {
    serviceAccount = {
      projectId: "ebms-deb7c",
      clientEmail: "firebase-adminsdk-fbsvc@ebms-deb7c.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzZzhx52NFyPMI\n6KhriBVWvZztllL7n0i8riMyTvLJdzvml3FzMQp6jtlB6CWV3sRVUDyk3pln4WEW\nGU8/mLEWFbBN8W19rIXzUMQov4qIHW7y+g3dFDD/GS6ejQgr+my4PrnJhowRLBz6\nBRM3h+0h8Zh1/D1rh1lgO5KOusLJCseLMahBudLtIzIRY+sycEoD0z5JQ/xbLZdy\nTeBjBnISYcGAhdMBSlbOh11maTnGAgLG0ZGjBJc28OmlkuT6Qg0qd2Qyk25YUb9O\nQ2L+db6wxTUEOCN58tlXweu34OKXru91WqQczpN7vLu6v/5x85BeIYW6toZMDU7W\njxJOkFWNAgMBAAECggEAI8tDqgg4WJdSFDQ1TDUbytFsksO0HVOHs+uLhrFVRAiH\n2UdcgZbmiBLhuoJao2cNpZbrbpqiIWWIlRvqIZ5xsJ4VrctuZM1r8WKrLJUgyu0S\ncqSc6P/rEa6gzE4HtByUHgOX1mNDpXZ3dpPWJHV4hNX67QltaLuZw7dHE7aj/+/S\nvxn7wB3pwJ7Hg7KJoX1GXQ34Aowdj3GhDRuOcL8bsMQRtJT2QrDiGBSgcgP5HfYn\nFZ6auiBEII/Jq76uiyDor5sF3tvX1FYv0r1/df8C7agYPA3alSTFGfqu6WcSlHqp\nrb/H/xPtDvMYPtPpx56QCIdxFH1jwoI20b+U5LAy2QKBgQDiqJspGqL13lkLg5Wv\ntJYC7BLLzfNRPV6JqTxvN3a4l69ne4O8Yqkk/+7p2UWcIychtqO+uWBEFR4G8Shz\nOATzSArzCojygpIeoZ0vJK7gxZP5mPsz8kQ/iO/iLBK0hVcTNq24evyNZ+z7yNwg\nkGuSeLlvxoNDMM3Ru+MmBnEyKQKBgQDKoJXN98A3vRMMKHU37EaT2kFCyK+RHss2\nMzWaJDa33xa4UKy6+dJ96caK+9JCwBq/UJZxcV46zz6V8pqhanXrtr2QmzNnR3kn\nFdO0C0zs5IzJc30PvHpEr8nNSFvUKtw0v/sMJP78w/av4yoHML4vrAX2YqbCTaNS\nSY74Cb5cxQKBgQCnDv7N3QQflDKted7qEoA+xyFTdgjQ6Bq1/Da/AnJOu/5cl30R\nbOaejsTZN3tHCeHdx3AJMzjw9V+cXkMiKTf82Cy51hn6JKLuUNA53x/GK9pVLZx5\nPSdwbM3iNfnTdDQpxTNltcBPuTnCmtkkZ03iN3j2GarF60LIQ2O4sybbgQKBgQCx\nEgo3dtUUIHefvU9KMoEuvaEgMm4yfF2LHM8vx4vFvP+GzIFV1/EZNYzacdu5l1UI\ncO03b6Gv9OG1ec+lVXp9JTGdR/NwwqXeARYDFYkAz200smbMtKGImrHYYe5Vh6rt\nsgM6Bq6JxtoxtGtK406gLEz9lhIyZFRgGYYFvcYMHQKBgQCbDBLoXAMQ1zKDN6ED\n90E+J76gLs87Cvg4sd+dn+5e21tiPAPAOCVMhQM6gtD6u3+gX1z493WqWYWxCzCG\nb97XfOULgSYL+v2GWQaHtVHj5ceO8kA9Lfbh0aQujp/SibBkTTIlyRVZG/ojlMz+\nUxzLAKQuxz4zjicgjsuUsZfGEQ==\n-----END PRIVATE KEY-----\n"
    } as ServiceAccount;
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
