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

    const model = configData.model || 'gemini-3.5-flash-lite';
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
      // Lấy danh sách ID phòng ban thuộc nhóm "Kinh doanh"
      const pbSnap = await db.collection('phong_ban').get();
      const kinhDoanhIds = pbSnap.docs
        .filter((d) => (d.data().ten_phong_ban || d.data().ten || '').toLowerCase().includes('kinh doanh'))
        .map((d) => d.id);

      // Lấy tất cả nhân sự đang hoạt động
      const snap = await db
        .collection('nhan_su')
        .where('trang_thai', '==', true)
        .get();

      danhSachNhanSuCanChay = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((ns: any) => {
          if (ns.trang_thai_du_lieu === 'da_xoa') return false;
          if (!kinhDoanhIds.includes(ns.phong_ban_id)) return false;
          
          // Trưởng phòng KD là người quản lý/điều hành kế hoạch chung, không trực tiếp nhận KPI doanh số cá nhân
          if (
            ns.vai_tro === 'truong_phong' ||
            ns.vai_tro === 'giam_doc' ||
            ns.vai_tro === 'quan_tri_he_thong' ||
            (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') ||
            (ns.chuc_vu || '').toLowerCase().includes('phó phòng')
          ) {
            return false;
          }
          return true;
        });
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

      // 3.1.5. Lấy Lịch gặp khách hàng của nhân sự
      const lichSnap = await db
        .collection('lich_gap_kh')
        .where('nguoi_phu_trach_id', '==', nsId)
        .get();

      const dsLichGap = lichSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as any))
        .filter((l) => l.trang_thai !== 'huy' && !l.da_xoa);

      // Lịch hẹn đã đến/qua hạn nhưng CHƯA cập nhật kết quả
      const dsLichChuaKQ = dsLichGap.filter(
        (l) => l.ngay <= ngayMucTieu && (!l.ket_qua?.trim() || l.trang_thai !== 'da_hoan_thanh')
      );

      // Dự án bị "nguội": tiềm năng cao nhưng ngày cập nhật cách ngày mục tiêu > 7 ngày
      const dsDuAnNguoi = duAnTiemNangCao.filter((da) => {
        const ngayCapNhat = da.ngay_cap_nhat || da.ngay_tao || '';
        if (!ngayCapNhat) return true;
        const diffDays = Math.floor(
          (new Date(ngayMucTieu).getTime() - new Date(ngayCapNhat.slice(0, 10)).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return diffDays > 7;
      });

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

      const tongSoViecTuan = keHoachTuanTomTat.length;
      const soViecTuanDaXong = keHoachTuanTomTat.filter((tc: any) => tc.da_xong).length;

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
        du_an_nguoi_can_kich_hoat: dsDuAnNguoi.map((da) => ({
          ten: da.ten_du_an,
          gia_tri: da.gia_tri_du_kien,
          ngay_cap_nhat_cuoi: da.ngay_cap_nhat || da.ngay_tao
        })),
        lich_gap_khach_hang: {
          tong_so: dsLichGap.length,
          chua_cap_nhat_ket_qua: dsLichChuaKQ.map((l) => ({
            ngay: l.ngay,
            gio: `${l.gio_bat_dau} - ${l.gio_ket_thuc}`,
            khach_hang: l.ten_khach_hang,
            dia_diem: l.dia_diem,
            canh_bao: 'Đã đến ngày làm việc nhưng CHƯA CẬP NHẬT KẾT QUẢ'
          })),
          lich_hoan_thanh_gan_day: dsLichGap
            .filter((l) => l.ket_qua?.trim())
            .slice(0, 5)
            .map((l) => ({ ngay: l.ngay, khach_hang: l.ten_khach_hang, ket_qua: l.ket_qua }))
        },
        ke_hoach_thang: keHoachThangTomTat,
        ke_hoach_tuan: keHoachTuanTomTat,
        ty_le_hoan_thanh_cam_ket_tuan: tongSoViecTuan > 0 ? `${Math.round((soViecTuanDaXong / tongSoViecTuan) * 100)}%` : '100%',
        bao_cao_cong_viec_gan_day: baoCaoTomTat,
        ngay_danh_gia: ngayMucTieu
      };

      const systemPrompt = `Bạn là Giám đốc điều hành & Trưởng phòng Kinh doanh sắc bén, thấu hiểu tâm lý nhân sự và quản trị dự án thực chiến.
Nhiệm vụ của bạn là soi kỹ lưỡng dữ liệu của nhân sự (kế hoạch, báo cáo công việc hằng ngày, các dự án được giao, và lịch hẹn khách hàng) để đưa ra bản đánh giá điều hành trung thực, không vuốt ve, mang tính định hướng cao (TUYỆT ĐỐI KHÔNG dùng từ "giám sát").

HÃY ĐÁNH GIÁ ĐỦ 9 TIÊU CHÍ SAU ĐÂY:
1. Soi "Báo cáo đối phó & Nhịp độ hoạt động" (bao_cao_doi_pho): Kiểm tra xem các báo cáo hằng ngày có bị trùng lặp, copy-paste không; nhịp độ hoạt động thực tế có đều đặn không.
2. Soi "Độ khớp với Kế hoạch" (do_khop_ke_hoach): So sánh nội dung báo cáo ngày và hành động thực tế có bám sát mục tiêu trong Kế hoạch tuần không.
3. Soi "Dự án đóng băng & Dự án nguội" (du_an_dong_bang): Kiểm tra các dự án quan trọng (nhất là Tiềm năng cao và Sắp chốt HĐ) xem có dự án nào > 7 ngày không thấy cập nhật tiến độ hoặc bị bỏ quên không.
4. Soi "Mức độ ưu tiên" (muc_do_uu_tien): Nhân viên có ưu tiên thời gian cho các dự án lớn, tiềm năng cao không, hay sa đà vào việc vụn vặt.
5. Soi "Tỷ lệ hoàn thành (KPI)" (ty_le_hoan_thanh_kpi): Tỷ lệ các đầu việc đã cam kết trong tuần được hoàn thành thực tế là bao nhiêu %.
6. Soi "Lý do viện cớ lặp lại" (ly_do_lap_lai): Phát hiện những khó khăn bị lặp đi lặp lại nhiều ngày mà nhân viên không chủ động tìm giải pháp tháo gỡ.
7. Soi "Khối lượng công việc (Workload)" (khoi_luong_cong_viec): Đánh giá xem nhân sự đang bị quá tải hay đang quá rảnh rỗi, làm việc cầm chừng.
8. Soi "Lịch hẹn & Tần suất chăm sóc khách hàng" (tan_suat_cham_soc_kh): Tần suất gặp gỡ khách hàng. ĐẶC BIỆT soi kỹ các cuộc hẹn đã diễn ra nhưng CHƯA CẬP NHẬT KẾT QUẢ làm việc để kịp thời đôn đốc.
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
        de_xuat_cho_quan_ly: parsed.de_xuat_cho_quan_ly || 'Đồng hành hỗ trợ tiến độ',
        du_an_chinh_thong_ke: {
          tong_du_an: tongDuAn,
          tiem_nang_cao: duAnTiemNangCao.length,
          sap_ky_hop_dong: duAnSapKyHD.length,
          tong_gia_tri_du_kien: tongGiaTriDuKien
        },
        thong_ke_hoat_dong: {
          lich_chua_ket_qua: dsLichChuaKQ.length,
          du_an_nguoi: dsDuAnNguoi.length,
          ty_le_hoan_thanh_cam_ket: tongSoViecTuan > 0 ? Math.round((soViecTuanDaXong / tongSoViecTuan) * 100) : 100
        },
        ngay_tao: new Date().toISOString(),
        ngay_cap_nhat: new Date().toISOString()
      };

      // 3.7. Lưu vào Firestore collection ai_danh_gia_nhan_su
      await db.collection('ai_danh_gia_nhan_su').doc(docId).set(record, { merge: true });
      ketQuaDanhGia.push(record);
    }

    // 4. Sinh Bản Tổng Kết Điều Hành AI Toàn Đội Ngũ (Khi chạy toàn bộ)
    let tongKetDieuHanh: any = null;
    if (!nhan_vien_id && ketQuaDanhGia.length > 0) {
      try {
        const allLichSnap = await db.collection('lich_gap_kh').get();
        const dsAllLich = allLichSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as any))
          .filter((l) => l.trang_thai !== 'huy' && !l.da_xoa);

        const allLichChuaKQ = dsAllLich.filter(
          (l) => l.ngay <= ngayMucTieu && (!l.ket_qua?.trim() || l.trang_thai !== 'da_hoan_thanh')
        );

        const nhanSuCoLichChuaKQ = Array.from(
          new Set(
            allLichChuaKQ
              .map((l) => {
                const ns = danhSachNhanSuCanChay.find((n) => n.id === l.nguoi_phu_trach_id);
                return ns ? (ns.ho_va_ten || ns.ho_ten || ns.ten) : '';
              })
              .filter(Boolean)
          )
        );

        const tongDuAnNguoi = ketQuaDanhGia.reduce(
          (sum, k) => sum + (k.thong_ke_hoat_dong?.du_an_nguoi || 0),
          0
        );
        const tongDuAnSapKy = ketQuaDanhGia.reduce(
          (sum, k) => sum + (k.du_an_chinh_thong_ke?.sap_ky_hop_dong || 0),
          0
        );
        const tongGiaTriPipeline = ketQuaDanhGia.reduce(
          (sum, k) => sum + (k.du_an_chinh_thong_ke?.tong_gia_tri_du_kien || 0),
          0
        );
        const tyLeHoanThanhTB = Math.round(
          ketQuaDanhGia.reduce(
            (sum, k) => sum + (k.thong_ke_hoat_dong?.ty_le_hoan_thanh_cam_ket || 100),
            0
          ) / ketQuaDanhGia.length
        );

        const duLieuTongHopDoiNgu = {
          ngay_tong_ket: ngayMucTieu,
          so_luong_nhan_su: ketQuaDanhGia.length,
          lich_hen: {
            tong_so_chua_co_kq: allLichChuaKQ.length,
            danh_sach_nhan_su_chua_cap_nhat_kq: nhanSuCoLichChuaKQ
          },
          hoat_dong_va_cam_ket: {
            tong_lich_hen: dsAllLich.length,
            ty_le_hoan_thanh_cam_ket_trung_binh: tyLeHoanThanhTB
          },
          pipeline_du_an: {
            du_an_tiem_nang_bi_nguoi: tongDuAnNguoi,
            du_an_sap_ky_hop_dong: tongDuAnSapKy,
            tong_gia_tri_pipeline: tongGiaTriPipeline
          },
          tom_tat_danh_gia_nhan_su: ketQuaDanhGia.map((k) => ({
            ten: k.ten_nhan_vien,
            diem: k.diem_hieu_suat,
            muc_do: k.muc_do_tong_the,
            nhan_dinh: k.nhan_dinh_chung,
            lich_chua_kq: k.thong_ke_hoat_dong?.lich_chua_ket_qua || 0,
            du_an_nguoi: k.thong_ke_hoat_dong?.du_an_nguoi || 0
          }))
        };

        const promptTongKet = `Bạn là Giám đốc kinh doanh cấp cao điều hành doanh nghiệp.
Dựa trên 4 nhóm dữ liệu điều hành cốt lõi hôm nay (${ngayMucTieu}):
1. Lịch hẹn đã diễn ra nhưng CHƯA CẬP NHẬT KẾT QUẢ: ${allLichChuaKQ.length} cuộc hẹn (Nhân sự liên quan: ${nhanSuCoLichChuaKQ.join(', ') || 'Không có'}).
2. Nhịp độ hoạt động & Cam kết tuần: Tỷ lệ hoàn thành cam kết công việc đạt ${tyLeHoanThanhTB}%.
3. Dòng chảy dự án: Có ${tongDuAnNguoi} dự án tiềm năng cao bị "nguội" (> 7 ngày chưa tương tác) và ${tongDuAnSapKy} dự án đang chuẩn bị ký HĐ.
4. Tiến độ mục tiêu: Tổng giá trị dự kiến trong pipeline là ${tongGiaTriPipeline.toLocaleString('vi-VN')} đ.

Hãy tổng hợp 1 Bản Báo cáo Điều hành AI súc tích, đắt giá, mang tinh thần đồng hành hỗ trợ (TUYỆT ĐỐI KHÔNG dùng từ "giám sát").

Trả về ĐÚNG JSON:
{
  "tong_quan": "2-3 câu ngắn gọn sắc bén tóm lược nhịp độ và bức tranh kinh doanh toàn đội ngũ hôm nay",
  "tieu_chi": {
    "lich_chua_cap_nhat_kq": {
      "so_luong": ${allLichChuaKQ.length},
      "danh_sach_nhan_vien": ${JSON.stringify(nhanSuCoLichChuaKQ)},
      "nhan_xet_ai": "Nhận xét ngắn về tình trạng cập nhật kết quả gặp gỡ khách hàng"
    },
    "nhip_do_hoat_dong": {
      "tong_lich_hen": ${dsAllLich.length},
      "ty_le_hoan_thanh_cam_ket": ${tyLeHoanThanhTB},
      "nhan_xet_ai": "Nhận xét ngắn về nhịp độ làm việc và cam kết công việc của đội ngũ"
    },
    "dong_chay_du_an": {
      "du_an_nguoi_dong_bang": ${tongDuAnNguoi},
      "du_an_sap_ky": ${tongDuAnSapKy},
      "nhan_xet_ai": "Nhận xét về các dự án nguội cần kích hoạt và cơ hội chốt hợp đồng"
    },
    "tien_do_muc_tieu": {
      "tong_gia_tri_pipeline": ${tongGiaTriPipeline},
      "nhan_xet_ai": "Nhận xét về khả năng bám đuổi mục tiêu doanh số"
    }
  },
  "khuyen_nghi_dieu_hanh": [
    "Hành động ưu tiên 1 cho người quản lý hôm nay",
    "Hành động ưu tiên 2 cho người quản lý hôm nay"
  ]
}`;

        const client = new GoogleGenAI({ apiKey });
        const interactionTk = await client.interactions.create({
          model,
          input: `${promptTongKet}\n\nCHI TIẾT ĐỘI NGŨ:\n${JSON.stringify(duLieuTongHopDoiNgu, null, 2)}`,
          response_format: {
            type: 'text',
            mime_type: 'application/json'
          }
        });

        let rawTk = (interactionTk.output_text || '').trim();
        if (rawTk.startsWith('```json')) {
          rawTk = rawTk.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawTk.startsWith('```')) {
          rawTk = rawTk.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        const parsedTk = JSON.parse(rawTk);

        tongKetDieuHanh = {
          id: `tong_ket_${ngayMucTieu}`,
          ngay_tong_ket: ngayMucTieu,
          tong_quan: parsedTk.tong_quan || 'Đội ngũ đang duy trì nhịp độ hoạt động ổn định.',
          tieu_chi: parsedTk.tieu_chi || {},
          khuyen_nghi_dieu_hanh: parsedTk.khuyen_nghi_dieu_hanh || [],
          ngay_tao: new Date().toISOString(),
          ngay_cap_nhat: new Date().toISOString()
        };

        await db.collection('ai_danh_gia_nhan_su').doc(`tong_ket_${ngayMucTieu}`).set(tongKetDieuHanh, { merge: true });
      } catch (e) {
        console.error('Lỗi sinh bản tổng kết điều hành AI:', e);
      }
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
      du_lieu: nhan_vien_id ? ketQuaDanhGia[0] : ketQuaDanhGia,
      tong_ket_dieu_hanh: tongKetDieuHanh
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
