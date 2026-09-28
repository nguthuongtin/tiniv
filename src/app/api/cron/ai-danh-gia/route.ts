import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Nếu có biến môi trường CRON_SECRET thì kiểm tra, không thì chạy an toàn
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ loi: 'Unauthorized' }, { status: 401 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const targetUrl = `${protocol}://${host}/api/ai/danh-gia-nhan-su`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ngay_danh_gia: new Date().toISOString().split('T')[0]
      })
    });

    const data = await res.json();
    return NextResponse.json({
      cron_status: 'Thành công',
      chi_tiet: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { cron_status: 'Lỗi', loi: error?.message },
      { status: 500 }
    );
  }
}
