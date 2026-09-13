/**
 * Script test KET NOI END-TO-END voi Firebase EBMS:
 *   - Dang nhap bang tai khoan ADMIN (admin@ebms.io / EBMS@2026)
 *   - GET document nhan_su/{uid} (kiem tra vai_tro = quan_tri_he_thong va trang_thai = true)
 *   - LIST 2 document dau trong collection chi_nhanh + phong_ban (chung minh quyen READ theo rules OK)
 *
 * Su dung (da cai tsx):
 *   npx tsx src/thu_vien/firebase/seed/kiem_tra_ket_noi.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Nap .env.local tuong tu seed
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envRaw = fs.readFileSync(envPath, 'utf8');
  for (const dong of envRaw.split(/\r?\n/)) {
    if (!dong || dong.startsWith('#') || !dong.includes('=')) continue;
    const viTriBang = dong.indexOf('=');
    const khoa = dong.slice(0, viTriBang).trim();
    let giaTri = dong.slice(viTriBang + 1).trim();
    if ((giaTri.startsWith('"') && giaTri.endsWith('"')) || (giaTri.startsWith("'") && giaTri.endsWith("'"))) {
      giaTri = giaTri.slice(1, -1);
    }
    if (!(khoa in process.env)) {
      (process.env as Record<string, string | undefined>)[khoa] = giaTri;
    }
  }
}

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

if (!API_KEY || !PROJECT_ID) {
  console.error('[Loi ❌] Thieu env NEXT_PUBLIC_FIREBASE_API_KEY / PROJECT_ID.');
  process.exit(1);
}

const REST_AUTH = `https://identitytoolkit.googleapis.com/v1/accounts`;
const REST_FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const guiPOST = async (url: string, body: unknown, token?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
};

const guiGET = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status} READ loi: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
};

const giaiMaGiaTri = (f: any): any => {
  if (!f) return null;
  if ('stringValue' in f) return f.stringValue ?? null;
  if ('booleanValue' in f) return f.booleanValue;
  if ('integerValue' in f) return Number(f.integerValue);
  if ('doubleValue' in f) return Number(f.doubleValue);
  if ('timestampValue' in f) return f.timestampValue;
  if ('nullValue' in f) return null;
  if ('arrayValue' in f) return (f.arrayValue?.values ?? []).map(giaiMaGiaTri);
  return f;
};

const giaiMaDocument = (doc: any) => {
  const fields = doc.fields ?? {};
  const ten: string = doc.name ?? '';
  const phanTach = ten.split('/');
  return {
    _id: phanTach[phanTach.length - 1],
    _name: ten,
    _createTime: doc.createTime,
    _updateTime: doc.updateTime,
    data: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, giaiMaGiaTri(v)]))
  };
};

const main = async () => {
  console.log('==========================================================');
  console.log(' EBMS 1.0  — KIEM TRA KET NOI CSDL END-TO-END');
  console.log(` Project: ${PROJECT_ID}`);
  console.log('==========================================================\n');

  const ADMIN_EMAIL = 'admin@ebms.io';
  const ADMIN_MAT_KHAU = 'EBMS@2026';

  // B1: Dang nhap de lay idToken
  console.log('[1/4] Dang nhap Auth → %s ...', ADMIN_EMAIL);
  const dn = await guiPOST(`${REST_AUTH}:signInWithPassword?key=${API_KEY}`, {
    email: ADMIN_EMAIL,
    password: ADMIN_MAT_KHAU,
    returnSecureToken: true
  });
  const TOKEN = dn.idToken;
  const UID = dn.localId;
  console.log('   ✅ OK. idToken length =', TOKEN.length, 'UID =', UID);

  // B2: GET document nhan_su/{UID}
  console.log('\n[2/4] GET nhan_su/%s ...', UID);
  const nsRaw = await guiGET(`${REST_FIRESTORE}/nhan_su/${UID}`, TOKEN);
  const nhanSu = giaiMaDocument(nsRaw);
  console.log('   ✅ OK.');
  console.log('      + ho_va_ten =', nhanSu.data.ho_va_ten ?? '(null)');
  console.log('      + vai_tro   =', nhanSu.data.vai_tro ?? '(null)');
  console.log('      + email     =', nhanSu.data.email ?? '(null)');
  console.log('      + trang_thai=', nhanSu.data.trang_thai);
  console.log('      + chi_nhanh_id =', nhanSu.data.chi_nhanh_id ?? '(null)');
  console.log('      + phong_ban_id =', nhanSu.data.phong_ban_id ?? '(null)');

  const vaiTroOK = nhanSu.data.vai_tro === 'quan_tri_he_thong';
  const trangThaiOK = nhanSu.data.trang_thai === true;
  const fkOK = Boolean(nhanSu.data.chi_nhanh_id && nhanSu.data.phong_ban_id);

  // B3: LIST collection chi_nhanh
  console.log('\n[3/4] LIST chi_nhanh (max 5, pageSize=5)...');
  const chiNhanhRaw = await guiGET(`${REST_FIRESTORE}/chi_nhanh?pageSize=5&orderBy=__name__`, TOKEN);
  const dsChiNhanh = (chiNhanhRaw.documents ?? []).map(giaiMaDocument);
  console.log('   ✅ OK. So luong =', dsChiNhanh.length);
  for (const c of dsChiNhanh) {
    console.log('      - id:', c._id, '| ten:', (c.data as any).ten_chi_nhanh);
  }

  // B4: LIST collection phong_ban
  console.log('\n[4/4] LIST phong_ban (max 5)...');
  const pbRaw = await guiGET(`${REST_FIRESTORE}/phong_ban?pageSize=5&orderBy=__name__`, TOKEN);
  const dsPB = (pbRaw.documents ?? []).map(giaiMaDocument);
  console.log('   ✅ OK. So luong =', dsPB.length);
  for (const p of dsPB) {
    console.log('      - id:', p._id, '| ten:', (p.data as any).ten_phong_ban, '| chi_nhanh_id =', (p.data as any).chi_nhanh_id);
  }

  // ==== KET LUAN ====
  console.log('\n==========================================================');
  console.log(' KET LUAN KET QUA KIEM TRA:');
  if (vaiTroOK && trangThaiOK && fkOK && dsChiNhanh.length > 0 && dsPB.length > 0) {
    console.log(' ✅ TẤT CẢ CÁC KIỂM TRA ĐỀU PASS');
    console.log('   → KẾT NỐI FIREBASE CSDL (AUTH + FIRESTORE) HOẠT ĐỘNG BÌNH THƯỜNG');
    console.log('   → Bây giờ bạn có thể chạy `npm run dev`, vào /dang-nhap đăng nhập thật.');
  } else {
    console.log(' ⚠️  Một số kiểm tra CHƯA ĐẠT:');
    if (!vaiTroOK) console.log('   - vai_tro ≠ quan_tri_he_thong');
    if (!trangThaiOK) console.log('   - trang_thai ≠ true (bi khoa)');
    if (!fkOK) console.log('   - ADMIN chưa có chi_nhanh_id / phong_ban_id');
    if (dsChiNhanh.length === 0) console.log('   - collection chi_nhanh đang trống');
    if (dsPB.length === 0) console.log('   - collection phong_ban đang trống');
    process.exit(2);
  }
  console.log('==========================================================\n');
};

main().catch((err) => {
  console.error('\n[KIEM TRA KET NOI THAT BAI ❌]\n', err);
  process.exit(99);
});
