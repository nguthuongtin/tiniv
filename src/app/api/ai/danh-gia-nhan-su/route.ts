import { NextResponse } from 'next/server';
import { adminFirestore } from '../../../../thu_vien/firebase/admin_firebase';
import type { AIDanhGiaNhanSu, CauHinhAIGemini } from '../../../../thu_vien/types/ai_danh_gia';
import { CAU_HINH_AI_MAC_DINH } from '../../../../thu_vien/types/ai_danh_gia';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Allow sufficient time for AI generation

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { nhan_vien_id, ngay_danh_gia } = body;

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
          loi: 'Hệ thống chưa cấu hình Google Gemini API Key. Quản trị viên vui lòng vào mục "Quản trị > Cấu hình AI" để nhập key.'
        },
        { status: 400 }
      );
    }

    const model = configData.model || 'gemini-3.8-flash';
    // Đảm bảo lấy ngày theo múi giờ Việt Nam (Asia/Ho_Chi_Minh)
    const ngayHomNayVN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const ngayMucTieu = ngay_danh_gia || ngayHomNayVN;

    // 2. Xác định danh sách nhân sự cần phân tích
    let danhSachNhanSuCanChay: any[] = [];
    if (nhan_vien_id) {
      const snap = await db.collection('nhan_su').doc(nhan_vien_id).get();
      if (!snap.exists) {
        return NextResponse.json(
          { thanh_cong: false, loi: 'Không tìm thấy thông tin nhân sự yêu cầu' },
          { status: 404 }
        );
      }
      danhSachNhanSuCanChay.push({ id: snap.id, ...snap.data() });
    } else {
      // Lấy tất cả nhân sự đang hoạt động
      const snap = await db
        .collection('nhan_su')
        .where('trang_thai', '==', true)
        .get();

      danhSachNhanSuCanChay = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((ns: any) => ns.trang_thai_du_lieu !== 'da_xoa');
    }

    if (danhSachNhanSuCanChay.length === 0) {
      return NextResponse.json({
        thanh_cong: true,
        thong_diep: 'Không có nhân sự nào cần phân tích',
        du_lieu: []
      });
    }

    // 3. Phân tích từng nhân sự
    const ketQuaDanhGia: AIDanhGiaNhanSu[] = [];
    let loiCuoiCung = '';

    for (const ns of danhSachNhanSuCanChay) {
      const nsId = ns.id;
      const tenNs = ns.ho_va_ten || ns.ho_ten || ns.ten || 'Nhân viên';

      // 3.1. Lấy danh sách dự án mà nhân viên là người phụ trách chính
      const duAnSnap = await db
        .collection('ho_so_du_an')
        .where('nguoi_phu_trach_id', '==', nsId)
        .get();

      const dsDuAn = duAnSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((da) => da.trang_thai !== 'da_xoa' && da.trang_thai_du_lieu !== 'da_xoa');

      const tongDuAn = dsDuAn.length;
      const duAnTiemNangCao = dsDuAn.filter((da) =>
        ['cao', 'rat_cao'].includes(da.muc_do_tiem_nang)
      );
      const duAnSapKyHD = dsDuAn.filter((da) =>
        ['dam_phan', 'bao_gia', 'ky_hop_dong'].includes(da.giai_doan)
      );
      const tongGiaTriDuKien = dsDuAn.reduce(
        (tong, da) => tong + (Number(da.gia_tri_du_kien) || 0),
        0
      );

      // 3.2. Lấy Kế hoạch Tuần (sắp xếp giảm dần để luôn lấy tuần hiện tại & gần nhất)
      const keHoachTuanSnap = await db
        .collection('ke_hoach_tuan')
        .where('nhan_vien_id', '==', nsId)
        .get();

      const dsKeHoachTuan = keHoachTuanSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((k) => k.trang_thai_du_lieu !== 'da_xoa')
        .sort((a, b) => (b.tuan || b.ngay_tao || '').localeCompare(a.tuan || a.ngay_tao || ''))
        .slice(0, 2);

      // 3.3. Lấy Kế hoạch Tháng (sắp xếp giảm dần để luôn lấy tháng hiện tại)
      const keHoachThangSnap = await db
        .collection('ke_hoach_thang')
        .where('nhan_vien_id', '==', nsId)
        .get();

      const dsKeHoachThang = keHoachThangSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((k) => k.trang_thai_du_lieu !== 'da_xoa')
        .sort((a, b) => (b.thang || b.ngay_tao || '').localeCompare(a.thang || a.ngay_tao || ''))
        .slice(0, 2);

      // 3.4. Lấy Báo cáo công việc (sắp xếp giảm dần để lấy 14 ngày mới nhất tính đến hôm nay)
      const baoCaoSnap = await db
        .collection('bao_cao_cong_viec')
        .where('nhan_vien_id', '==', nsId)
        .get();

      const dsBaoCao = baoCaoSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((b) => b.trang_thai_du_lieu !== 'da_xoa')
        .sort((a, b) => (b.ngay_bao_cao || b.ngay_tao || '').localeCompare(a.ngay_bao_cao || a.ngay_tao || ''))
        .slice(0, 14);

      // 3.5. Xây dựng Prompt cho Google Gemini
      const duAnTomTat = dsDuAn.map((da) => ({
        ten: da.ten_du_an,
        giai_doan: da.giai_doan,
        tiem_nang: da.muc_do_tiem_nang,
        gia_tri: da.gia_tri_du_kien,
        ngay_cap_nhat: da.ngay_cap_nhat
      }));

      const keHoachTuanTomTat = dsKeHoachTuan.flatMap((kh) =>
        (kh.danh_sach_tac_chien || []).map((tc: any) => ({
          tuan: kh.tuan,
          viec_tuan: tc.noi_dung_tuan || tc.hanh_dong_tuan || tc.ten_khach_hang_du_an,
          cam_ket: tc.dau_ra_cam_ket || tc.ket_qua_mong_muon,
          da_xong: tc.da_hoan_thanh,
          ket_qua: tc.ket_qua_thuc_te
        }))
      );

      const keHoachThangTomTat = dsKeHoachThang.flatMap((kh) =>
        (kh.danh_sach_dia_ban || []).map((db: any) => ({
          thang: kh.thang,
          dia_ban_khach_hang: db.ten_khach_hang_du_an || db.co_quan_doanh_nghiep,
          muc_tieu: db.muc_tieu_thang || db.ten_muc_tieu,
          doanh_so_du_kien: db.doanh_so_du_kien || db.gia_tri_hd,
          ket_qua_thuc_te: db.ket_qua_thuc_te || db.thuc_te_thu
        }))
      );

      const baoCaoTomTat = dsBaoCao.map((bc) => {
        const noiDungChiTiet = Array.isArray(bc.danh_sach_chi_tiet)
          ? bc.danh_sach_chi_tiet
              .map((ct: any) => ct?.noi_dung?.trim())
              .filter(Boolean)
              .join('; ')
          : '';

        return {
          ngay: bc.ngay_bao_cao,
          noi_dung: noiDungChiTiet || bc.noi_dung_thuc_hien || 'Chưa ghi nội dung',
          kho_khan: bc.kho_khan || 'Không có',
          ke_hoach_ngay_mai: bc.ke_hoach_ngay_mai || ''
        };
      });

      const promptData = {
        thong_tin_nhan_su: {
          id: nsId,
          ho_ten: tenNs,
          chuc_vu: ns.chuc_vu || 'Nhân viên kinh doanh',
          phong_ban: ns.phong_ban || 'Kinh doanh'
        },
        du_an_phu_trach_chinh: {
          tong_so: tongDuAn,
          tiem_nang_cao: duAnTiemNangCao.length,
          sap_ky_hop_dong: duAnSapKyHD.length,
          tong_gia_tri: tongGiaTriDuKien,
          danh_sach: duAnTomTat
        },
        ke_hoach_thang: keHoachThangTomTat,
        ke_hoach_tuan: keHoachTuanTomTat,
        bao_cao_cong_viec_gan_day: baoCaoTomTat,
        ngay_danh_gia: ngayMucTieu
      };

      const systemPrompt = `Bạn là Giám đốc điều hành & Trưởng phòng Kinh doanh sắc bén, thấu hiểu tâm lý nhân sự và quản trị dự án thực chiến.
Nhiệm vụ của bạn là soi kỹ lưỡng dữ liệu của nhân sự (kế hoạch, báo cáo công việc hằng ngày, và các dự án được giao phụ trách chính) để đưa ra bản đánh giá điều hành trung thực, không vuốt ve, mang tính định hướng cao.

HÃY ĐÁNH GIÁ ĐỦ 9 TIÊU CHÍ SAU ĐÂY:
1. Soi "Báo cáo đối phó" (bao_cao_doi_pho): Kiểm tra xem các báo cáo hằng ngày có bị trùng lặp, copy-paste của nhau không, nội dung có quá sơ sài nộp cho có lệ không.
2. Soi "Độ khớp với Kế hoạch" (do_khop_ke_hoach): So sánh nội dung báo cáo ngày có bám sát mục tiêu trong Kế hoạch tuần không, hay làm việc tùy hứng "kế hoạch một đằng, làm một nẻo".
3. Soi "Dự án đóng băng" (du_an_dong_bang): Kiểm tra các dự án quan trọng (nhất là Tiềm năng cao và Sắp chốt hợp đồng) xem có dự án nào nhiều ngày không thấy cập nhật tiến độ hoặc không được nhắc tới trong báo cáo không.
4. Soi "Mức độ ưu tiên" (muc_do_uu_tien): Nhân viên có ưu tiên thời gian cho các dự án lớn, tiềm năng cao không, hay sa đà vào việc vụn vặt, khách hàng ít tiềm năng.
5. Soi "Tỷ lệ hoàn thành (KPI)" (ty_le_hoan_thanh_kpi): Tỷ lệ các đầu việc đã cam kết trong tuần được hoàn thành thực tế là bao nhiêu %.
6. Soi "Lý do viện cớ lặp lại" (ly_do_lap_lai): Phát hiện những khó khăn bị lặp đi lặp lại nhiều ngày (như khách bận, chờ duyệt...) mà nhân viên không chủ động tìm giải pháp tháo gỡ.
7. Soi "Khối lượng công việc (Workload)" (khoi_luong_cong_viec): Đánh giá xem nhân sự đang bị quá tải (ôm quá nhiều dự án dẫn đến hụt hơi) hay đang quá rảnh rỗi (ít việc, làm việc cầm chừng).
8. Soi "Tần suất chăm sóc khách hàng" (tan_suat_cham_soc_kh): Tần suất tương tác, gặp gỡ, gọi điện, chăm sóc các dự án/khách hàng trọng điểm.
10. "Dự báo rủi ro cuối tháng" (du_bao_cuoi_thang): Dự báo khả năng đạt mục tiêu doanh số/tiến độ tháng của nhân viên này với nhịp độ làm việc hiện tại.

Mỗi tiêu chí trong 9 tiêu chí trên BẮT BUỘC phải có trường:
- "ten_tieu_chi": Tên tiêu chí tiếng Việt
- "muc_do": Chỉ nhận 1 trong 3 giá trị: "tot" (Tốt/Đạt), "canh_bao" (Cần lưu ý), hoặc "rui_ro" (Nguy cơ/Kém)
- "nhan_xet": Nhận xét sắc sảo, dẫn chứng trực tiếp từ tên dự án, báo cáo ngày cụ thể.

Định dạng JSON trả về PHẢI CHÍNH XÁC theo cấu trúc sau:
{
  "diem_hieu_suat": 85, // Số nguyên từ 0 đến 100
  "muc_do_tong_the": "tot" | "canh_bao" | "rui_ro",
  "nhan_dinh_chung": "Nhận định tổng quan 1-2 câu ngắn gọn nhưng đắt giá",
  "chi_tiet_tieu_chi": {
    "bao_cao_doi_pho": { "ten_tieu_chi": "Soi báo cáo đối phó", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "do_khop_ke_hoach": { "ten_tieu_chi": "Soi độ khớp với Kế hoạch", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "du_an_dong_bang": { "ten_tieu_chi": "Soi dự án đóng băng", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "muc_do_uu_tien": { "ten_tieu_chi": "Soi mức độ ưu tiên", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "ty_le_hoan_thanh_kpi": { "ten_tieu_chi": "Soi tỷ lệ hoàn thành KPI", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "ly_do_lap_lai": { "ten_tieu_chi": "Soi lý do viện cớ lặp lại", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "khoi_luong_cong_viec": { "ten_tieu_chi": "Soi khối lượng công việc", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "tan_suat_cham_soc_kh": { "ten_tieu_chi": "Soi tần suất chăm sóc khách hàng", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." },
    "du_bao_cuoi_thang": { "ten_tieu_chi": "Dự báo rủi ro cuối tháng", "muc_do": "tot"|"canh_bao"|"rui_ro", "nhan_xet": "..." }
  },
  "de_xuat_cho_quan_ly": "Hành động cụ thể cấp quản lý nên can thiệp ngay để hỗ trợ hoặc chấn chỉnh nhân viên này"
}`;

      // 3.6. Gọi Google Gemini API
      const client = new GoogleGenAI({ apiKey });
      let rawText;
      try {
        const interaction = await client.interactions.create({
          model,
          input: `${systemPrompt}\n\nDỮ LIỆU ĐỐI SOÁT CỦA NHÂN SỰ:\n${JSON.stringify(promptData, null, 2)}`,
          response_format: {
            type: 'text',
            mime_type: 'application/json'
          }
        });
        rawText = interaction.output_text;
      } catch (err: any) {
        loiCuoiCung = err?.message || String(err);
        console.error('Lỗi gọi Gemini cho nhân viên ' + tenNs + ':', err);
        continue;
      }
      if (!rawText) {
        loiCuoiCung = 'Mô hình AI không phản hồi nội dung văn bản';
        continue;
      }

      let parsed: any;
      try {
        let cleanText = (rawText || '').trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        parsed = JSON.parse(cleanText);
      } catch (e: any) {
        loiCuoiCung = 'Không thể đọc định dạng JSON từ phản hồi của AI';
        console.error('Lỗi parse JSON từ Gemini:', rawText);
        continue;
      }

      const docId = `${nsId}_${ngayMucTieu}`;
      const record: AIDanhGiaNhanSu = {
        id: docId,
        nhan_vien_id: nsId,
        ten_nhan_vien: tenNs,
        ngay_danh_gia: ngayMucTieu,
        diem_hieu_suat: Math.max(0, Math.min(100, Number(parsed.diem_hieu_suat) || 75)),
        muc_do_tong_the: ['tot', 'canh_bao', 'rui_ro'].includes(parsed.muc_do_tong_the)
          ? parsed.muc_do_tong_the
          : 'canh_bao',
        nhan_dinh_chung: parsed.nhan_dinh_chung || 'Chưa có nhận định chung',
        chi_tiet_tieu_chi: parsed.chi_tiet_tieu_chi || {},
        de_xuat_cho_quan_ly: parsed.de_xuat_cho_quan_ly || 'Theo dõi sát sao tiến độ',
        du_an_chinh_thong_ke: {
          tong_du_an: tongDuAn,
          tiem_nang_cao: duAnTiemNangCao.length,
          sap_ky_hop_dong: duAnSapKyHD.length,
          tong_gia_tri_du_kien: tongGiaTriDuKien
        },
        ngay_tao: new Date().toISOString(),
        ngay_cap_nhat: new Date().toISOString()
      };

      // 3.7. Lưu vào Firestore collection ai_danh_gia_nhan_su
      await db.collection('ai_danh_gia_nhan_su').doc(docId).set(record, { merge: true });
      ketQuaDanhGia.push(record);
    }

    if (ketQuaDanhGia.length === 0 && (nhan_vien_id || danhSachNhanSuCanChay.length > 0)) {
      return NextResponse.json(
        {
          thanh_cong: false,
          loi: loiCuoiCung || 'Không thể tạo bản đánh giá từ AI. Vui lòng kiểm tra lại API Key hoặc dữ liệu nhân sự.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      thanh_cong: true,
      thong_diep: `Đã phân tích thành công cho ${ketQuaDanhGia.length} nhân sự`,
      du_lieu: nhan_vien_id ? ketQuaDanhGia[0] : ketQuaDanhGia
    });
  } catch (error: any) {
    console.error('Lỗi xử lý AI đánh giá nhân sự:', error);
    return NextResponse.json(
      {
        thanh_cong: false,
        loi: error?.message || 'Lỗi xử lý phân tích AI nội bộ'
      },
      { status: 500 }
    );
  }
}
