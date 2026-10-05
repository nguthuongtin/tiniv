import { NextResponse } from 'next/server';
import { adminFirestore } from '../../../../thu_vien/firebase/admin_firebase';
import type { CauHinhAIGemini } from '../../../../thu_vien/types/ai_danh_gia';
import { CAU_HINH_AI_MAC_DINH } from '../../../../thu_vien/types/ai_danh_gia';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { nhan_vien_id, ngay_hien_tai } = body;

    if (!nhan_vien_id) {
      return NextResponse.json(
        { thanh_cong: false, loi: 'Thiếu thông tin nhân sự cần phân tích.' },
        { status: 400 }
      );
    }

    const db = adminFirestore();

    // 1. Lấy cấu hình Gemini API
    const configSnap = await db.collection('cau_hinh_he_thong').doc('ai_gemini').get();
    const configData: CauHinhAIGemini = configSnap.exists
      ? (configSnap.data() as CauHinhAIGemini)
      : CAU_HINH_AI_MAC_DINH;

    const apiKey = configData.gemini_api_key?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          thanh_cong: false,
          loi: 'Hệ thống chưa cấu hình Google Gemini API Key.'
        },
        { status: 400 }
      );
    }

    const model = configData.model || 'gemini-2.5-flash';
    const ngayHomNayVN =
      ngay_hien_tai ||
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

    // 2. Lấy dữ liệu Dự án, Tiến độ dự án, Kế hoạch tuần, Lịch hẹn của Sale
    const [duAnSnap, keHoachTuanSnap, keHoachThangSnap, lichGapSnap] = await Promise.all([
      db.collection('ho_so_du_an').where('nguoi_phu_trach_id', '==', nhan_vien_id).get(),
      db.collection('ke_hoach_tuan').where('nhan_vien_id', '==', nhan_vien_id).get(),
      db.collection('ke_hoach_thang').where('nhan_vien_id', '==', nhan_vien_id).get(),
      db.collection('lich_gap_kh').where('nguoi_phu_trach_id', '==', nhan_vien_id).get()
    ]);

    const dsDuAn = duAnSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((da) => da.trang_thai !== 'da_xoa' && !['hoan_thanh', 'huy'].includes(da.giai_doan));

    // Lấy tiến độ của các dự án đang hoạt động (tối đa 30 dự án gần nhất)
    const duAnIds = dsDuAn.slice(0, 30).map((d) => d.id);
    let dsTienDo: any[] = [];
    if (duAnIds.length > 0) {
      const chunks: string[][] = [];
      for (let i = 0; i < duAnIds.length; i += 10) {
        chunks.push(duAnIds.slice(i, i + 10));
      }
      const snaps = await Promise.all(
        chunks.map((c) => db.collection('tien_do_du_an').where('du_an_id', 'in', c).get())
      );
      for (const s of snaps) {
        for (const d of s.docs) {
          const data = d.data();
          if (data.trang_thai_du_lieu !== 'da_xoa') {
            dsTienDo.push({ id: d.id, ...data });
          }
        }
      }
    }

    const dsKeHoachTuan = keHoachTuanSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((k) => k.trang_thai_du_lieu !== 'da_xoa')
      .sort((a, b) => (b.tuan || '').localeCompare(a.tuan || ''))
      .slice(0, 2);

    const dsKeHoachThang = keHoachThangSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((k) => k.trang_thai_du_lieu !== 'da_xoa')
      .sort((a, b) => (b.thang || '').localeCompare(a.thang || ''))
      .slice(0, 1);

    const dsLichSapToi = lichGapSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as any))
      .filter((l) => l.ngay >= ngayHomNayVN)
      .sort((a, b) => (a.ngay || '').localeCompare(b.ngay || ''))
      .slice(0, 15);

    // Chuẩn bị dữ liệu gọn nhẹ cho Gemini
    const duAnContext = dsDuAn.map((da) => {
      const tienDoCuaDA = dsTienDo
        .filter((t) => t.du_an_id === da.id)
        .sort((a, b) => (b.ngay_tao || '').localeCompare(a.ngay_tao || ''))
        .slice(0, 3);
      return {
        id: da.id,
        khach_hang_id: da.khach_hang_id || null,
        ten_du_an: da.ten_du_an,
        giai_doan: da.giai_doan,
        tiem_nang: da.muc_do_tiem_nang,
        gia_tri_du_kien: da.gia_tri_du_kien,
        ngay_cap_nhat_cuoi: da.ngay_cap_nhat?.slice(0, 10),
        co_nguoi_lien_he: Boolean(da.nguoi_lien_he_id),
        tien_do_gan_nhat: tienDoCuaDA.map((t) => ({
          ngay: (t.ngay_tao || '').slice(0, 10),
          tinh_hinh: t.tinh_hinh_hien_tai,
          hanh_dong_tiep: t.hanh_dong_tiep_theo,
          deadline: t.deadline_hanh_dong,
          y_kien_chi_dao: t.y_kien_chi_dao || null,
          nguoi_chi_dao: t.ten_nguoi_chi_dao || null
        }))
      };
    });

    const congViecTuanContext = dsKeHoachTuan.flatMap((kh) =>
      (kh.danh_sach_tac_chien || []).map((tc: any) => ({
        tuan: kh.tuan,
        id: tc.id,
        du_an_id: tc.du_an_id || null,
        khach_hang_id: tc.khach_hang_id || null,
        khach_hang_du_an: tc.co_quan_doanh_nghiep || tc.ten_khach_hang_du_an,
        hanh_dong: tc.hanh_dong_tuan || tc.noi_dung_tuan,
        ngay_du_kien: tc.ngay_du_kien,
        da_hoan_thanh: tc.da_hoan_thanh,
        nhat_ky_check_in: (tc.danh_sach_ket_qua || []).slice(0, 3).map((kq: any) => ({
          ngay: kq.ngay_ghi_nhan,
          noi_dung: kq.noi_dung,
          chi_dao: kq.chi_dao?.noi_dung || null
        }))
      }))
    );

    const mucTieuThangContext = (dsKeHoachThang[0]?.danh_sach_dia_ban || []).map((m: any) => ({
      muc_tieu: m.muc_tieu_thang || m.ten_muc_tieu,
      khach_hang: m.co_quan_doanh_nghiep || m.ten_khach_hang_du_an,
      chi_tieu: m.doanh_so_du_kien || m.chi_tieu || 0,
      thuc_te: m.thuc_te_thu || m.ket_qua_thuc_te || 0
    }));

    const systemPrompt = `Bạn là Trợ lý AI Cố vấn Kinh doanh đắc lực dành riêng cho nhân viên Sale (Hôm nay là ${ngayHomNayVN}).
Phong cách: Tích cực, đồng hành, sắc bén, thực chiến, ngắn gọn, đi thẳng vào vấn đề giúp Sale không bỏ sót cơ hội. Tuyệt đối KHÔNG dùng giọng điệu phán xét hay từ "giám sát".

Hãy phân tích dữ liệu (Dự án, Tiến độ dự án, Nhật ký check-in công việc tuần, Lịch hẹn sắp tới, Mục tiêu tháng) và tìm ra tối đa 6 vấn đề quan trọng nhất cần báo cho Sale theo 4 nhóm:
1. "dut_gay_follow_up": Phát hiện các cuộc liên hệ / check-in hoặc tiến độ dự án mà Sale ghi nhận sẽ làm bước tiếp theo (VD: hẹn gọi lại, gửi báo giá, gửi dự toán, trình hồ sơ, đợi khách phản hồi...) nhưng chưa thấy tạo lịch hẹn hoặc chưa có bước xử lý tiếp theo.
2. "chi_dao_lanh_dao": Có ý kiến chỉ đạo / định hướng của Lãnh đạo trong tiến độ dự án hoặc kế hoạch tuần mà Sale cần ưu tiên thực hiện.
3. "du_an_dong_bang": Dự án tiềm năng hoặc giá trị lớn đã lâu không cập nhật tiến độ mới.
4. "thieu_thong_tin": Hồ sơ dự án hoặc kế hoạch đang thiếu thông tin quan trọng (chưa có người liên hệ, chưa có mục tiêu rõ ràng) hoặc mục tiêu tháng đang cần tăng tốc.

Trả về đúng định dạng JSON sau:
{
  "tom_tat_nhanh": "1-2 câu ngắn gọn, truyền năng lượng và chỉ rõ trọng tâm ưu tiên nhất hôm nay",
  "danh_sach_canh_bao": [
    {
      "loai": "dut_gay_follow_up" | "chi_dao_lanh_dao" | "du_an_dong_bang" | "thieu_thong_tin",
      "muc_do": "khan_cap" | "quan_trong" | "goi_y",
      "tieu_de": "Tiêu đề ngắn gọn (dưới 12 từ)",
      "noi_dung": "Mô tả cụ thể phát hiện của AI (nêu rõ tên khách hàng/dự án, ngày check-in hoặc nội dung liên quan)",
      "hanh_dong_de_xuat": "Gợi ý bước hành động cụ thể ngay hôm nay",
      "du_an_id": "ID dự án nếu có hoặc null",
      "khach_hang_id": "ID khách hàng nếu có hoặc null"
    }
  ]
}`;

    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create({
      model,
      input: `${systemPrompt}\n\nDỮ LIỆU CỦA SALE:\n${JSON.stringify(
        {
          ngay_hom_nay: ngayHomNayVN,
          du_an: duAnContext,
          cong_viec_tuan: congViecTuanContext,
          lich_hen_sap_toi: dsLichSapToi.map((l) => ({
            ngay: l.ngay,
            khach_hang: l.ten_khach_hang,
            noi_dung: l.noi_dung
          })),
          muc_tieu_thang: mucTieuThangContext
        },
        null,
        2
      )}`,
      response_format: {
        type: 'text',
        mime_type: 'application/json'
      }
    });

    let cleanText = (interaction.output_text || '').trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanText);

    return NextResponse.json({
      thanh_cong: true,
      du_lieu: {
        tom_tat_nhanh: parsed.tom_tat_nhanh || 'Hãy ưu tiên xử lý các chỉ đạo và cơ hội đang mở.',
        danh_sach_canh_bao: Array.isArray(parsed.danh_sach_canh_bao)
          ? parsed.danh_sach_canh_bao
          : []
      }
    });
  } catch (error: any) {
    console.error('[API tro-ly-sale] Lỗi:', error);
    return NextResponse.json(
      {
        thanh_cong: false,
        loi: error?.message || 'Không thể kết nối AI phân tích lúc này.'
      },
      { status: 500 }
    );
  }
}
