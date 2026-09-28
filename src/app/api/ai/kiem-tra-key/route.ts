import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { apiKey, model = 'gemini-3.8-flash' } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json({
        hop_le: false,
        thong_diep: 'Vui lòng nhập API Key Google Gemini'
      });
    }

    const cleanKey = apiKey.trim();
    const client = new GoogleGenAI({ apiKey: cleanKey });

    const interaction = await client.interactions.create({
      model: model,
      input: 'Xin chào Gemini, hãy phản hồi chữ "OK" để xác nhận kết nối thành công.'
    });

    const reply = interaction.output_text || '';

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
