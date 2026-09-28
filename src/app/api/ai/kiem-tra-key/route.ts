import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey, model = 'gemini-2.0-flash' } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json({
        hop_le: false,
        thong_diep: 'Vui lòng nhập API Key Google Gemini'
      });
    }

    const cleanKey = apiKey.trim();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Xin chào Gemini, hãy phản hồi chữ "OK" để xác nhận kết nối thành công.'
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 20
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg =
        data?.error?.message || `Lỗi từ Google Gemini (HTTP ${res.status}): ${res.statusText}`;
      return NextResponse.json({
        hop_le: false,
        thong_diep: errMsg
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      hop_le: true,
      thong_diep: `Kết nối thành công tới mô hình ${model}! (Phản hồi: "${reply.trim()}")`
    });
  } catch (error: any) {
    console.error('Lỗi kiểm tra key Gemini:', error);
    return NextResponse.json({
      hop_le: false,
      thong_diep: error?.message || 'Không thể gửi yêu cầu kiểm tra tới Google'
    });
  }
}
