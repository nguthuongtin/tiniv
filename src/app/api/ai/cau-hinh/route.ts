import { NextResponse } from 'next/server';
import { adminFirestore } from '../../../../thu_vien/firebase/admin_firebase';
import { CAU_HINH_AI_MAC_DINH, type CauHinhAIGemini } from '../../../../thu_vien/types/ai_danh_gia';

const DOC_ID = 'ai_gemini';

export async function GET() {
  try {
    const db = adminFirestore();
    const docRef = db.collection('cau_hinh_he_thong').doc(DOC_ID);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({
        thanh_cong: true,
        cau_hinh: CAU_HINH_AI_MAC_DINH
      });
    }

    const data = snap.data() as CauHinhAIGemini;
    return NextResponse.json({
      thanh_cong: true,
      cau_hinh: {
        ...CAU_HINH_AI_MAC_DINH,
        ...data
      }
    });
  } catch (error: any) {
    console.error('Lỗi API lấy cấu hình AI:', error);
    return NextResponse.json(
      { thanh_cong: false, loi: error?.message || 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = adminFirestore();
    const docRef = db.collection('cau_hinh_he_thong').doc(DOC_ID);

    const snap = await docRef.get();
    const currentData = snap.exists ? (snap.data() as CauHinhAIGemini) : CAU_HINH_AI_MAC_DINH;

    const updatedData: CauHinhAIGemini = {
      ...currentData,
      ...body,
      ngay_cap_nhat: new Date().toISOString()
    };

    await docRef.set(updatedData, { merge: true });

    return NextResponse.json({
      thanh_cong: true,
      cau_hinh: updatedData
    });
  } catch (error: any) {
    console.error('Lỗi API lưu cấu hình AI:', error);
    return NextResponse.json(
      { thanh_cong: false, loi: error?.message || 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    );
  }
}
