import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/thu_vien/firebase/admin_firebase';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Chưa xác thực người dùng (thiếu token)' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const auth = adminAuth();
    const db = adminFirestore();

    // Xác thực token người gọi
    let nguoiGoiDecoded;
    try {
      nguoiGoiDecoded = await auth.verifyIdToken(token);
    } catch (e: any) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Phiên đăng nhập đã hết hạn hoặc token không hợp lệ' },
        { status: 401 }
      );
    }

    const nguoiGoiUid = nguoiGoiDecoded.uid;

    const body = await req.json();
    const { nhan_su_id, email_moi } = body;

    if (!nhan_su_id || !email_moi) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu ID nhân sự hoặc email mới' },
        { status: 400 }
      );
    }

    const emailMoiChuan = String(email_moi).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailMoiChuan)) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Định dạng email không hợp lệ' },
        { status: 400 }
      );
    }

    // Kiểm tra quyền: phải là chính mình hoặc là Quản trị hệ thống / Giám đốc
    const laChinhMinh = nguoiGoiUid === nhan_su_id;
    if (!laChinhMinh) {
      const docNguoiGoi = await db.collection('nhan_su').doc(nguoiGoiUid).get();
      const duLieuNguoiGoi = docNguoiGoi.data();
      const vaiTro = duLieuNguoiGoi?.vai_tro;
      const laAdmin = vaiTro === 'quan_tri_he_thong' || vaiTro === 'giam_doc';

      if (!laAdmin) {
        return NextResponse.json(
          { thanh_cong: false, thong_diep: 'Bạn không có quyền đổi email cho tài khoản này' },
          { status: 403 }
        );
      }
    }

    // 1. Cập nhật email trong Firebase Auth
    await auth.updateUser(nhan_su_id, {
      email: emailMoiChuan
    });

    // 2. Cập nhật email trong Firestore collection nhan_su
    await db.collection('nhan_su').doc(nhan_su_id).update({
      email: emailMoiChuan,
      ngay_cap_nhat: new Date().toISOString()
    });

    // 3. Ghi nhật ký hoạt động
    try {
      await db.collection('nhat_ky_hoat_dong').add({
        nguoi_dung_id: nguoiGoiUid,
        module: 'nhan_su',
        hanh_dong: 'doi_email',
        ban_ghi_id: nhan_su_id,
        noi_dung: laChinhMinh
          ? `Tự cập nhật email tài khoản sang: ${emailMoiChuan}`
          : `Admin cập nhật email nhân viên ${nhan_su_id} sang: ${emailMoiChuan}`,
        thoi_gian: new Date().toISOString()
      });
    } catch (_logErr) {
      // Bỏ qua lỗi ghi log
    }

    return NextResponse.json({
      thanh_cong: true,
      thong_diep: 'Đã đổi email đăng nhập thành công'
    });
  } catch (error: any) {
    console.error('Lỗi API đổi email:', error);
    let thongDiep = error?.message || 'Đổi email thất bại';
    if (error?.code === 'auth/email-already-exists') {
      thongDiep = 'Email này đã được sử dụng bởi một tài khoản khác trong hệ thống';
    } else if (error?.code === 'auth/user-not-found') {
      thongDiep = 'Không tìm thấy tài khoản Firebase Auth tương ứng với nhân sự này';
    }
    return NextResponse.json(
      { thanh_cong: false, thong_diep: thongDiep },
      { status: 500 }
    );
  }
}
