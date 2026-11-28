import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';

const CAC_LOAI_HOP_LE = new Set([
  'chi_nhanh',
  'phong_ban',
  'nhan_su',
  'san_pham_dich_vu',
  'ho_so_du_an',
  'khach_hang',
  'nguoi_lien_he'
]);

const TTL_MAC_DINH_MS = 5 * 60 * 1000; // 5 phút cho danh mục tĩnh
const TTL_NGHIEP_VU_MS = 3 * 60 * 1000; // 3 phút cho dự án / khách hàng / liên hệ
const LOAI_NGHIEP_VU = new Set(['ho_so_du_an', 'khach_hang', 'nguoi_lien_he']);
const cacheDanhMuc = new Map<string, { items: Record<string, any>[]; ts: number }>();

export async function GET(req: NextRequest) {
  const loai = req.nextUrl.searchParams.get('loai') || '';
  if (!CAC_LOAI_HOP_LE.has(loai)) {
    return NextResponse.json({ ok: false, error: 'Loại danh mục không hợp lệ', items: [] }, { status: 400 });
  }

  const ttlMs = LOAI_NGHIEP_VU.has(loai) ? TTL_NGHIEP_VU_MS : TTL_MAC_DINH_MS;
  const cached = cacheDanhMuc.get(loai);
  if (cached && Date.now() - cached.ts < ttlMs) {
    return NextResponse.json({ ok: true, items: cached.items, cached: true });
  }

  try {
    const db = adminFirestore();
    const snap = await db.collection(loai).limit(2000).get();
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    cacheDanhMuc.set(loai, { items, ts: Date.now() });
    return NextResponse.json({ ok: true, items, cached: false });
  } catch (err: any) {
    console.warn(`[api/danh-muc-chung] Lỗi đọc ${loai}:`, err?.message || err);
    if (cached) {
      return NextResponse.json({ ok: true, items: cached.items, cached: true, stale: true });
    }
    return NextResponse.json(
      { ok: false, error: err?.message || 'Không thể tải danh mục', items: [] },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const loai = req.nextUrl.searchParams.get('loai') || '';
  if (loai && CAC_LOAI_HOP_LE.has(loai)) {
    cacheDanhMuc.delete(loai);
  } else if (!loai) {
    cacheDanhMuc.clear();
  }
  return NextResponse.json({ ok: true });
}
