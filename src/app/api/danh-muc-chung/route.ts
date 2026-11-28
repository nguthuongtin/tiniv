import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';

const CAC_LOAI_HOP_LE = new Set([
  'chi_nhanh',
  'phong_ban',
  'nhan_su',
  'san_pham_dich_vu'
]);

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút dùng chung cho toàn bộ người dùng
const cacheDanhMuc = new Map<string, { items: Record<string, any>[]; ts: number }>();

export async function GET(req: NextRequest) {
  const loai = req.nextUrl.searchParams.get('loai') || '';
  if (!CAC_LOAI_HOP_LE.has(loai)) {
    return NextResponse.json({ ok: false, error: 'Loại danh mục không hợp lệ', items: [] }, { status: 400 });
  }

  const cached = cacheDanhMuc.get(loai);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
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
