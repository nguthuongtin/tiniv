import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';
import { guiThongBaoTelegram } from '@/dich_vu/thong_bao/dich_vu_telegram';

const TEN_COLLECTION = 'yeu_cau_phoi_hop';

// GET: Lấy danh sách yêu cầu phối hợp
export async function GET(req: NextRequest) {
  try {
    const db = adminFirestore();
    const duAnId = req.nextUrl.searchParams.get('du_an_id');
    const nguoiTaoId = req.nextUrl.searchParams.get('nguoi_tao_id');

    let colRef: FirebaseFirestore.Query = db
      .collection(TEN_COLLECTION)
      .where('trang_thai_du_lieu', '==', 'hoat_dong');

    if (duAnId) {
      colRef = colRef.where('du_an_id', '==', duAnId);
    }
    if (nguoiTaoId) {
      colRef = colRef.where('nguoi_tao_id', '==', nguoiTaoId);
    }

    const snap = await colRef.limit(300).get();
    const danhSach = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      thanh_cong: true,
      mang: danhSach
    });
  } catch (error: any) {
    console.error('[API yeu-cau-phoi-hop GET] Lỗi:', error);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: error?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

// POST: Tạo mới yêu cầu phối hợp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.du_an_id || !body.noi_dung_yeu_cau) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu thông tin dự án hoặc nội dung' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const id = body.id || `yc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowISO = new Date().toISOString();

    const nhatKyKhoiTao = {
      id: `log_${Date.now()}`,
      thoi_gian: nowISO,
      nguoi_thuc_hien_id: body.nguoi_tao_id || 'thanh_vien',
      ten_nguoi_thuc_hien: body.ten_nguoi_tao || 'Thành viên',
      chuc_vu: body.chuc_vu || null,
      vai_tro: body.vai_tro || null,
      hanh_dong: 'Tạo yêu cầu phối hợp',
      ghi_chu: body.noi_dung_yeu_cau,
      link_drive: body.link_drive_dau_vao || null
    };

    const yeuCauMoi = {
      ...body,
      id,
      trang_thai: 'cho_tpkd_duyet',
      lich_su_xu_ly: [nhatKyKhoiTao],
      ngay_tao: nowISO,
      ngay_cap_nhat: nowISO,
      trang_thai_du_lieu: 'hoat_dong'
    };

    await db.collection(TEN_COLLECTION).doc(id).set(yeuCauMoi);

    // Gửi thông báo Telegram nếu có cấu hình
    guiThongBaoTelegram(
      '🔔 YÊU CẦU PHỐI HỢP MỚI',
      `• Dự án: ${body.ten_du_an || body.du_an_id}\n• Người tạo: ${body.ten_nguoi_tao || 'Kinh doanh'}\n• Nội dung: ${body.noi_dung_yeu_cau}`
    ).catch(() => {});

    // Đồng thời ghi 1 dòng tiến độ vào hồ sơ dự án
    try {
      await db.collection('tien_do_du_an').add({
        du_an_id: body.du_an_id,
        tinh_hinh_hien_tai: `[Yêu cầu phối hợp]: ${body.noi_dung_yeu_cau}`,
        hanh_dong_tiep_theo: 'Chờ tiếp nhận & phân công xử lý',
        deadline_hanh_dong: body.han_hoan_thanh || null,
        link_tai_lieu: body.link_drive_dau_vao || null,
        ten_tai_lieu: body.link_drive_dau_vao ? 'Tài liệu đầu vào (Google Drive)' : null,
        ket_qua_thuc_hien: null,
        trang_thai_hanh_dong: 'dang_thuc_hien',
        nguoi_tao_id: body.nguoi_tao_id || null,
        nguoi_hoan_thanh_id: null,
        ngay_tao: nowISO,
        ngay_cap_nhat: nowISO,
        ngay_hoan_thanh: null,
        trang_thai_du_lieu: 'hoat_dong'
      });
    } catch (eTD) {
      console.warn('[API yeu-cau-phoi-hop] Không thể thêm dòng tiến độ dự án:', eTD);
    }

    return NextResponse.json({
      thanh_cong: true,
      du_lieu: yeuCauMoi
    });
  } catch (error: any) {
    console.error('[API yeu-cau-phoi-hop POST] Lỗi:', error);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: error?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật / Chuyển bước yêu cầu phối hợp
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu ID yêu cầu' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    const docRef = db.collection(TEN_COLLECTION).doc(body.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Không tìm thấy yêu cầu' },
        { status: 404 }
      );
    }

    const hienTai = docSnap.data() || {};
    const nowISO = new Date().toISOString();
    const patch: Record<string, any> = {
      ngay_cap_nhat: nowISO
    };

    if (body.trang_thai) patch.trang_thai = body.trang_thai;
    if (body.noi_dung_yeu_cau !== undefined) patch.noi_dung_yeu_cau = body.noi_dung_yeu_cau;
    if (body.link_drive_dau_vao !== undefined) patch.link_drive_dau_vao = body.link_drive_dau_vao;
    if (body.link_drive_ket_qua !== undefined) patch.link_drive_ket_qua = body.link_drive_ket_qua;
    if (body.han_hoan_thanh !== undefined) patch.han_hoan_thanh = body.han_hoan_thanh;
    if (body.ghi_chu_phan_hoi !== undefined) patch.ghi_chu_phan_hoi = body.ghi_chu_phan_hoi;
    if (body.danh_sach_nhan_su_thuc_hien_ids !== undefined) patch.danh_sach_nhan_su_thuc_hien_ids = body.danh_sach_nhan_su_thuc_hien_ids;
    if (body.danh_sach_ten_nhan_su_thuc_hien !== undefined) patch.danh_sach_ten_nhan_su_thuc_hien = body.danh_sach_ten_nhan_su_thuc_hien;

    // Thêm bản ghi lịch sử nếu có
    if (body.nhat_ky_moi) {
      const lichSuCu = Array.isArray(hienTai.lich_su_xu_ly) ? hienTai.lich_su_xu_ly : [];
      patch.lich_su_xu_ly = [...lichSuCu, body.nhat_ky_moi];
    }

    await docRef.update(patch);

    // Gửi thông báo Telegram cập nhật trạng thái
    if (body.trang_thai && body.trang_thai !== hienTai.trang_thai) {
      const tenTrangThaiMap: Record<string, string> = {
        cho_tpkd_duyet: 'Chờ tiếp nhận & giao việc',
        cho_khth_thuc_hien: 'Đang xử lý / Đã phân công',
        cho_tpkd_duyet_ket_qua: 'Chờ duyệt kết quả',
        cho_lanh_dao_duyet: 'Chờ duyệt kết quả',
        yeu_cau_chinh_sua: 'Cần chỉnh sửa lại',
        da_phe_duyet: 'Đã duyệt - Kết quả sẵn sàng',
        da_hoan_thanh: 'Đã hoàn tất',
        can_chinh_sua: 'Cần chỉnh sửa lại',
        hoan_thanh: 'Đã hoàn tất'
      };
      const ttMoi = tenTrangThaiMap[body.trang_thai] || body.trang_thai;
      guiThongBaoTelegram(
        `🔄 CẬP NHẬT YÊU CẦU PHỐI HỢP`,
        `• Dự án: ${hienTai.ten_du_an || hienTai.du_an_id}\n• Trạng thái mới: ${ttMoi}${body.ghi_chu_phan_hoi ? `\n• Ghi chú: ${body.ghi_chu_phan_hoi}` : ''}`
      ).catch(() => {});
    }

    const duLieuCapNhat = {
      ...hienTai,
      ...patch
    };

    return NextResponse.json({
      thanh_cong: true,
      du_lieu: duLieuCapNhat
    });
  } catch (error: any) {
    console.error('[API yeu-cau-phoi-hop PUT] Lỗi:', error);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: error?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa mềm yêu cầu
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu ID yêu cầu' },
        { status: 400 }
      );
    }

    const db = adminFirestore();
    await db.collection(TEN_COLLECTION).doc(id).update({
      trang_thai_du_lieu: 'da_xoa',
      ngay_cap_nhat: new Date().toISOString()
    });

    return NextResponse.json({
      thanh_cong: true
    });
  } catch (error: any) {
    console.error('[API yeu-cau-phoi-hop DELETE] Lỗi:', error);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: error?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}
