/**
 * Seed FIREBASE 1 LAN DUY NHAT de khoi tao CSDL EBMS:
 *   - Tao user Auth: admin@ebms.io / EBMS@2026
 *   - Tao 1 Chi nhanh mau "Trung tam" + 1 Phong ban "Quan tri"
 *   - Tao document nhan_su/{ADMIN_UID} co vai tro = quan_tri_he_thong, trang_thai = true
 *   - Ghi 1 dong nhat_ky_hoat_dong "tao_moi" module quan_tri
 *
 * Su dung:
 *   1. Chac chan da dien .env.local 7 bien SDK Firebase
 *   2. Mo PowerShell o thu muc goc:
 *          npx tsx src/thu_vien/firebase/seed/seed_firebase.ts
 *   3. Sau khi thanh cong, DANG NHAP LAM ROI -> DOI MAT KHAU ADMIN NGAY.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ========================================================
// 1. Nap .env.local (Next.js doc env tu dong, nhung tsx CLI thi khong)
// ========================================================
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

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error('[Lỗi ❌] Thiếu NEXT_PUBLIC_FIREBASE_API_KEY hoặc PROJECT_ID trong .env.local');
  process.exit(1);
}

// ========================================================
// 2. Thông tin ADMIN MẶC ĐỊNH (hãy đổi mật khẩu sau khi đăng nhập)
// ========================================================
const ADMIN_EMAIL = 'admin@ebms.io';
const ADMIN_MAT_KHAU = 'EBMS@2026';
const ADMIN_HO_TEN = 'Administrator Hệ thống EBMS';
const ADMIN_MA_NV = 'ADM001';

const REST_AUTH = `https://identitytoolkit.googleapis.com/v1/accounts`;
const REST_FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

type ValueFirestore =
  | { stringValue?: string | null }
  | { booleanValue?: boolean }
  | { integerValue?: string | number }
  | { doubleValue?: number }
  | { arrayValue?: { values: ValueFirestore[] } }
  | { timestampValue?: string }
  | { nullValue?: null };

const chuyenDoiGiaTri = (v: unknown): ValueFirestore => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) {
    return {
      arrayValue: {
        values: v.map((ptu) => chuyenDoiGiaTri(ptu))
      }
    };
  }
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  return { stringValue: String(v) };
};

const taoFields = (obj: Record<string, unknown>): Record<string, ValueFirestore> => {
  const kq: Record<string, ValueFirestore> = {};
  for (const [k, v] of Object.entries(obj)) kq[k] = chuyenDoiGiaTri(v);
  return kq;
};

const guiPOST = async (url: string, body: unknown, token?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { _raw: text };
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json;
};

type KiemTraTonTai = 'KHOI_TAO_DAU_TIEN' | 'GHI_DE' | 'TAO_MOI';

const ghiBanGhi = async (
  token: string,
  collection: string,
  idTuyChon: string | null,
  duLieu: Record<string, unknown>,
  kiemTraTonTai: KiemTraTonTai = idTuyChon ? 'GHI_DE' : 'TAO_MOI'
): Promise<{ id: string; name: string }> => {
  let url: string;
  if (!idTuyChon) {
    url = `${REST_FIRESTORE}/${collection}?documentId=${''}`;
  } else if (kiemTraTonTai === 'KHOI_TAO_DAU_TIEN') {
    url = `${REST_FIRESTORE}/${collection}/${idTuyChon}?currentDocument.exists=false`;
  } else if (kiemTraTonTai === 'TAO_MOI') {
    url = `${REST_FIRESTORE}/${collection}/${idTuyChon}?currentDocument.exists=false`;
  } else {
    // GHI_DE → không kiểm tra exists, PATCH tự do (dùng cho update sau khi đã tạo)
    url = `${REST_FIRESTORE}/${collection}/${idTuyChon}`;
  }
  const body = { fields: taoFields(duLieu) };
  const phuongThuc = idTuyChon ? 'PATCH' : 'POST';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const res = await fetch(url, { method: phuongThuc, headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Firestore response khong phai JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`Firestore ${collection} ${phuongThuc} loi: HTTP ${res.status} ${JSON.stringify(json).slice(0, 400)}`);
  }
  // name format: projects/.../databases/.../documents/<collection>/<id>
  const phanTach = (json.name as string).split('/');
  return { id: phanTach[phanTach.length - 1], name: json.name };
};

const main = async () => {
  console.log('==================================================================');
  console.log('EBMS 1.0 — Seed Tai khoan ADMIN va CSDL mau tren Firebase');
  console.log(`Project: ${PROJECT_ID}`);
  console.log('==================================================================\n');

  // Buoc 1: Dang ky user Auth moi (signUp bang REST)
  console.log('[1/6] Tao user Auth: %s / %s ...', ADMIN_EMAIL, ADMIN_MAT_KHAU);
  let uidAdmin: string;
  let idTokenDangNhap: string;
  try {
    const dk = await guiPOST(`${REST_AUTH}:signUp?key=${API_KEY}`, {
      email: ADMIN_EMAIL,
      password: ADMIN_MAT_KHAU,
      returnSecureToken: true
    });
    uidAdmin = dk.localId;
    idTokenDangNhap = dk.idToken;
    console.log('   OK ✅ localId = %s', uidAdmin);
  } catch (e: any) {
    const thongBao = String(e?.message ?? e);
    // Neu user da ton tai -> dang nhap lai de lay token
    if (thongBao.includes('EMAIL_EXISTS') || thongBao.includes('duplicate')) {
      console.log('   (user da ton tai, dang nhap de lay token...)');
      const dn = await guiPOST(`${REST_AUTH}:signInWithPassword?key=${API_KEY}`, {
        email: ADMIN_EMAIL,
        password: ADMIN_MAT_KHAU,
        returnSecureToken: true
      });
      uidAdmin = dn.localId;
      idTokenDangNhap = dn.idToken;
      console.log('   OK ✅ Dang nhap lai thanh cong uid = %s', uidAdmin);
    } else {
      console.error('[Loi ❌] Tao/dang nhap admin auth that bai:\n', e);
      process.exit(2);
    }
  }

  // === THU TU BOOTSTRAP MOI:
  // Buoc 2 → Tao ho so nhan_su ADMIN TRUOC (voi chi_nhanh_id/phong_ban_id = null)
  //          → Su dung rule dac biet dangKyQuanTriLanDau trong firestore.rules
  // Buoc 3 → Tao chi nhanh (gio da co quyen laQuanTriHeThong → OK)
  // Buoc 4 → Tao phong ban (OK)
  // Buoc 5 → UPDATE nhan_su ADMIN dien id chi nhanh + phong ban (dung quyen admin)
  // Buoc 6 → Ghi nhat ky

  let idChiNhanh = '';
  let idPhongBan = '';
  const gioHienTai = new Date().toISOString();

  // Buoc 2: Ghi document nhan_su/{uidAdmin} (FK = null) → CHO PHEP VI RULE dangKyQuanTriLanDau
  //    Neu chay seed lan 2 → document da ton tai (409) → bo qua, su dung existing profile (da co vai tro admin)
  console.log('[2/6] Ghi document nhan_su ADMIN (bootstrap, FK tam thoi null)...');
  let nhanSuDaTonTaiTuTruoc = false;
  try {
    await ghiBanGhi(
      idTokenDangNhap,
      'nhan_su',
      uidAdmin,
      {
        ma_nhan_vien: ADMIN_MA_NV,
        ho_va_ten: ADMIN_HO_TEN,
        so_dien_thoai: '0900-000-000',
        email: ADMIN_EMAIL,
        chi_nhanh_id: null,
        phong_ban_id: null,
        chuc_vu: 'Quan tri vien cap cao',
        vai_tro: 'quan_tri_he_thong',
        url_anh_dai_dien: null,
        trang_thai: true,
        ngay_tao: gioHienTai,
        ngay_cap_nhat: gioHienTai
      },
      'KHOI_TAO_DAU_TIEN'
    );
    console.log('   OK ✅ nhan_su/%s da duoc ghi (laQuanTriHeThong da san sang)', uidAdmin);
  } catch (e: any) {
    const thongBao = String(e?.message ?? e);
    if (thongBao.includes('ALREADY_EXISTS') || thongBao.includes('HTTP 409')) {
      nhanSuDaTonTaiTuTruoc = true;
      console.log('   ℹ️  nhan_su document da ton tai tu truoc → bo qua tao moi (dang su dung quyen admin hien co)');
    } else {
      console.error('[Loi ❌] Ghi document nhan_su that bai:\n', e);
      process.exit(5);
    }
  }

  // Buoc 3: Tao chi nhanh mau "Trung tam"
  console.log('[3/6] Tao chi nhanh mau: Trung tam ...');
  try {
    const { id } = await ghiBanGhi(idTokenDangNhap, 'chi_nhanh', null, {
      ten_chi_nhanh: 'Chi nhanh Trung tam (VN)',
      dia_chi: 'Tan Binh, TP. Ho Chi Minh',
      so_dien_thoai: '1900-0000',
      ghi_chu: 'Duoc tao tu script seed_firebase.ts (lan dau khoi tao)',
      ngay_tao: gioHienTai
    });
    idChiNhanh = id;
    console.log('   OK ✅ chi_nhanh.id =', id);
  } catch (e) {
    console.error('[Loi ❌] Tao chi nhanh that bai:\n', e);
    process.exit(3);
  }

  // Buoc 4: Tao phong ban mau "Quan tri"
  console.log('[4/6] Tao phong ban mau: Quan tri (thuoc chi nhanh vua tao)...');
  try {
    const { id } = await ghiBanGhi(idTokenDangNhap, 'phong_ban', null, {
      chi_nhanh_id: idChiNhanh,
      ten_phong_ban: 'Bo phan Quan tri he thong',
      ghi_chu: 'Duoc tao tu script seed_firebase.ts',
      ngay_tao: gioHienTai
    });
    idPhongBan = id;
    console.log('   OK ✅ phong_ban.id =', id);
  } catch (e) {
    console.error('[Loi ❌] Tao phong ban that bai:\n', e);
    process.exit(4);
  }

  // Buoc 5: UPDATE lai nhan_su ADMIN voi 2 FK vua tao (dung quyen laQuanTriHeThong) — GHI_DE khong kiem tra exists
  console.log('[5/6] UPDATE nhan_su ADMIN → lien ket chi nhanh + phong ban...');
  try {
    await ghiBanGhi(
      idTokenDangNhap,
      'nhan_su',
      uidAdmin,
      {
        ma_nhan_vien: ADMIN_MA_NV,
        ho_va_ten: ADMIN_HO_TEN,
        so_dien_thoai: '0900-000-000',
        email: ADMIN_EMAIL,
        chi_nhanh_id: idChiNhanh,
        phong_ban_id: idPhongBan,
        chuc_vu: 'Quan tri vien cap cao',
        vai_tro: 'quan_tri_he_thong',
        url_anh_dai_dien: null,
        trang_thai: true,
        ngay_tao: gioHienTai,
        ngay_cap_nhat: new Date().toISOString()
      },
      'GHI_DE'
    );
    console.log('   OK ✅ nhan_su/%s da lien ket chi_nhanh + phong_ban', uidAdmin);
  } catch (e) {
    console.error('[Loi ❌] Update nhan_su that bai:\n', e);
    process.exit(6);
  }

  // Buoc 6: Ghi 1 dong nhat ky hoat dong
  console.log('[6/6] Ghi nhat ky hoat dong: tao_moi / module quan_tri ...');
  try {
    await ghiBanGhi(idTokenDangNhap, 'nhat_ky_hoat_dong', null, {
      nguoi_dung_id: uidAdmin,
      module: 'quan_tri',
      hanh_dong: 'tao_moi',
      ban_ghi_id: uidAdmin,
      noi_dung: `[Seed] Khoi tao he thong EBMS 1.0 - tao admin ${ADMIN_EMAIL} + chi nhanh + phong ban`,
      thoi_gian: new Date().toISOString()
    });
    console.log('   OK ✅ nhat_ky_hoat_dong da them');
  } catch (_e) {
    console.log('   [WARNING] Khong the ghi nhat ky (co the rules Firestore chua apply). Tiep tuc...');
  }

  // Buoc 6: In thong tin ghi nho
  console.log('\n==================================================================');
  console.log(' SEED HOAN TAT ✅ — thong tin de dang nhap LAN DAU:');
  console.log('   Link Firebase Console Auth: https://console.firebase.google.com/project/%s/authentication/users', PROJECT_ID);
  console.log('   Link Firestore:               https://console.firebase.google.com/project/%s/firestore/data', PROJECT_ID);
  console.log('   Email ADMIN:                 %s', ADMIN_EMAIL);
  console.log('   Mat khau mac dinh:           %s', ADMIN_MAT_KHAU);
  console.log('   UID nhan_su document:        %s', uidAdmin);
  console.log('   ID chi nhanh (Trung tam):    %s', idChiNhanh);
  console.log('   ID phong ban (Quan tri):     %s', idPhongBan);
  console.log('');
  console.log('   >>> DOI MAT KHAU ADMIN NGAY SAU KHI DANG NHAP LAN 1 <<<');
  console.log('   >>> AP DUNG 2 FILE firestore.rules + storage.rules len Firebase Console <<<');
  console.log('==================================================================\n');

  // Luu thong tin vao TAI_KHOAN_MAC_DINH.md de backup
  try {
    const codeWrap = (x: string | number) => '`' + String(x) + '`';
    const md =
      '# Tai khoan ADMIN khoi tao (lan dau)\n\n' +
      '> Tu dong tao boi script ' + codeWrap('src/thu_vien/firebase/seed/seed_firebase.ts') + '.\n' +
      '> Hay doi mat khau truoc khi dua he thong vao su dung that.\n\n' +
      '| Truong            | Gia tri                                      |\n' +
      '|--------------------|----------------------------------------------|\n' +
      '| Project ID         | ' + codeWrap(PROJECT_ID) + '                              |\n' +
      '| Email dang nhap    | ' + codeWrap(ADMIN_EMAIL) + '                           |\n' +
      '| Mat khau mac dinh  | ' + codeWrap(ADMIN_MAT_KHAU) + '                        |\n' +
      '| UID Auth nhan su   | ' + codeWrap(uidAdmin) + '                             |\n' +
      '| Vai tro            | ' + codeWrap('quan_tri_he_thong') + '                   |\n' +
      '| ID Chi nhanh       | ' + codeWrap(idChiNhanh) + ' (Trung tam)               |\n' +
      '| ID Phong ban       | ' + codeWrap(idPhongBan) + ' (Quan tri he thong)       |\n' +
      '| Thoi gian tao      | ' + new Date().toLocaleString('vi-VN') + '           |\n\n' +
      '## Buoc tiep theo de bao mat:\n' +
      '1. Dang nhap ' + codeWrap('/dang-nhap') + ' voi thong tin tren → vao Trang chu EBMS.\n' +
      '2. Chon menu Quan tri → Doi mat khau.\n' +
      '3. Vao Firebase Console Authentication reset password them 1 lop bao mat nua.\n' +
      '4. Upload 3 file rules (firestore.rules, storage.rules) len Firebase Console (xem ' +
      codeWrap('co_so_du_lieu_firebase/README.md') + ').\n';
    fs.mkdirSync(path.resolve(process.cwd(), 'docs'), { recursive: true });
    fs.writeFileSync(path.resolve(process.cwd(), 'docs', 'TAI_KHOAN_MAC_DINH.md'), md, 'utf8');
    console.log(' Backup credentials → docs/TAI_KHOAN_MAC_DINH.md OK');
  } catch (_e) {
    // khong sao neu loi ghi file
  }
};

main().catch((err) => {
  console.error('\n[Script Seed Thất Bại ❌]\n', err);
  process.exit(99);
});
