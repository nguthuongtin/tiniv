import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';

const TEN_COLLECTION = 'bao_cao_tuan_vdcd';

export async function GET(req: NextRequest) {
  try {
    const db = adminFirestore();
    const tuan = req.nextUrl.searchParams.get('tuan');
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const snap = await db.collection(TEN_COLLECTION).doc(id).get();
      return NextResponse.json({
        ok: true,
        item: snap.exists ? { id: snap.id, ...snap.data() } : null
      });
    }

    let queryRef: FirebaseFirestore.Query = db.collection(TEN_COLLECTION);
    if (tuan) {
      queryRef = queryRef.where('tuan', '==', tuan);
    }

    const snap = await queryRef.limit(300).get();
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    console.error('[bao-cao-tuan-vdcd GET]:', err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Không thể tải báo cáo tuần', items: [] },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Thiếu id' }, { status: 400 });
    }

    const db = adminFirestore();
    const payload = {
      ...body,
      id,
      ngay_cap_nhat: new Date().toISOString()
    };

    await db.collection(TEN_COLLECTION).doc(id).set(payload, { merge: true });
    return NextResponse.json({ ok: true, item: payload });
  } catch (err: any) {
    console.error('[bao-cao-tuan-vdcd PUT]:', err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Không thể lưu báo cáo tuần lên hệ thống' },
      { status: 500 }
    );
  }
}
