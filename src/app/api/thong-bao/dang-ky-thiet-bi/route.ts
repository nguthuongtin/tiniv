import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.user_id || !body.subscription || !body.subscription.endpoint) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu thông tin thiết bị hoặc người dùng' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const endpoint = body.subscription.endpoint;
    // Băm endpoint hoặc dùng Base64 rút gọn làm ID tài liệu để tránh trùng lặp
    const docId = Buffer.from(endpoint).toString('base64').slice(-60).replace(/[^a-zA-Z0-9]/g, '_');
    const nowISO = new Date().toISOString();

    await db.collection('thiet_bi_thong_bao').doc(docId).set({
      user_id: body.user_id,
      subscription: body.subscription,
      thiet_bi: body.thiet_bi || 'mobile',
      trang_thai: 'hoat_dong',
      ngay_dang_ky: nowISO,
      ngay_cap_nhat: nowISO
    });

    return NextResponse.json({ thanh_cong: true });
  } catch (err: any) {
    console.error('[API dang-ky-thiet-bi] Lỗi:', err);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: err?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}
