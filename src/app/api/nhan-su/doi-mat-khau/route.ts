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
    const { nhan_su_id, mat_khau_moi } = body;

    if (!nhan_su_id || !mat_khau_moi) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu ID nhân sự hoặc mật khẩu mới' },
        { status: 400 }
      );
    }

    if (typeof mat_khau_moi !== 'string' || mat_khau_moi.length < 6) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
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
          { thanh_cong: false, thong_diep: 'Bạn không có quyền đổi mật khẩu cho tài khoản này' },
          { status: 403 }
        );
      }
    }

    // Thực hiện cập nhật mật khẩu trực tiếp qua Firebase Admin SDK
    await auth.updateUser(nhan_su_id, {
      password: mat_khau_moi
    });

    // Ghi nhật ký hoạt động
    try {
      await db.collection('nhat_ky_hoat_dong').add({
        nguoi_dung_id: nguoiGoiUid,
        module: 'nhan_su',
        hanh_dong: 'doi_mat_khau',
        ban_ghi_id: nhan_su_id,
        noi_dung: laChinhMinh
          ? 'Đổi mật khẩu tài khoản của chính mình'
          : `Admin đổi/reset mật khẩu cho nhân viên ${nhan_su_id}`,
        thoi_gian: new Date().toISOString()
      });
    } catch (_logErr) {
      // Bỏ qua lỗi ghi log
    }

    return NextResponse.json({
      thanh_cong: true,
      thong_diep: 'Đã cập nhật mật khẩu thành công'
    });
  } catch (error: any) {
    console.error('Lỗi API đổi mật khẩu:', error);
    let thongDiep = error?.message || 'Đổi mật khẩu thất bại';
    if (error?.code === 'auth/user-not-found') {
      thongDiep = 'Không tìm thấy tài khoản Firebase Auth tương ứng với nhân sự này';
    }
    return NextResponse.json(
      { thanh_cong: false, thong_diep: thongDiep },
      { status: 500 }
    );
  }
}
