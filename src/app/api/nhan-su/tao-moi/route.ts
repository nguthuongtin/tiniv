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

    // 1. Xác thực token người gọi
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

    // 2. Kiểm tra quyền của người gọi
    const docNguoiGoi = await db.collection('nhan_su').doc(nguoiGoiUid).get();
    const duLieuNguoiGoi = docNguoiGoi.data();
    const vaiTroNguoiGoi = duLieuNguoiGoi?.vai_tro;
    const laAdmin =
      vaiTroNguoiGoi === 'quan_tri_he_thong' ||
      vaiTroNguoiGoi === 'giam_doc' ||
      vaiTroNguoiGoi === 'truong_phong';

    if (!laAdmin) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Bạn không có quyền tạo tài khoản nhân sự mới' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ho_va_ten, email, mat_khau } = body;

    if (!ho_va_ten || !ho_va_ten.trim()) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Họ và tên không được để trống' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    const emailChuan = email.trim().toLowerCase();
    const mkThucTe =
      mat_khau && typeof mat_khau === 'string' && mat_khau.trim().length >= 6
        ? mat_khau.trim()
        : 'Ebms@2026';

    // 3. Tự động sinh mã nhân viên nếu chưa có
    let maNhanVien = body.ma_nhan_vien;
    if (!maNhanVien) {
      try {
        const snap = await db
          .collection('nhan_su')
          .orderBy('ma_nhan_vien', 'desc')
          .limit(1)
          .get();
        let so = 1;
        if (!snap.empty) {
          const cuoi = snap.docs[0].data().ma_nhan_vien as string | undefined;
          const chuSo = (cuoi ?? '').replace(/[^0-9]/g, '');
          if (chuSo) so = parseInt(chuSo, 10) + 1;
        }
        maNhanVien = `NV${so.toString().padStart(4, '0')}`;
      } catch {
        maNhanVien = `NV${Date.now().toString().slice(-4)}`;
      }
    }

    // 4. Tạo User trên Firebase Authentication qua Admin SDK
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: emailChuan,
        password: mkThucTe,
        displayName: ho_va_ten.trim(),
        photoURL: body.url_anh_dai_dien || undefined
      });
    } catch (e: any) {
      const code = (e.code || '').toLowerCase();
      const message = e.message || '';
      if (
        code.includes('email-already-in-use') ||
        code.includes('email-already-exists') ||
        message.includes('already in use')
      ) {
        return NextResponse.json(
          {
            thanh_cong: false,
            thong_diep: 'Email này đã tồn tại tài khoản trên hệ thống. Hãy sử dụng email khác.'
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          thanh_cong: false,
          thong_diep: `Lỗi tạo tài khoản Firebase Auth: ${message || code}`
        },
        { status: 400 }
      );
    }

    const newUid = userRecord.uid;
    const now = new Date().toISOString();

    // 5. Ghi hồ sơ nhân sự vào Firestore qua Admin SDK (100% bypass Firestore Security Rules)
    const duLieuRaw: Record<string, any> = {
      ma_nhan_vien: maNhanVien,
      ho_va_ten: ho_va_ten.trim(),
      so_dien_thoai: body.so_dien_thoai?.trim() || null,
      email: emailChuan,
      chi_nhanh_id: body.chi_nhanh_id ?? null,
      phong_ban_id: body.phong_ban_id ?? null,
      phong_ban_phu_trach_them: body.phong_ban_phu_trach_them ?? [],
      chuc_vu: body.chuc_vu?.trim() || null,
      vai_tro: body.vai_tro || 'nhan_vien_ky_thuat',
      quyen_ngoai_le_cap_them: body.quyen_ngoai_le_cap_them ?? [],
      quyen_ngoai_le_chan: body.quyen_ngoai_le_chan ?? [],
      url_anh_dai_dien: body.url_anh_dai_dien ?? null,
      trang_thai: body.trang_thai !== undefined ? Boolean(body.trang_thai) : true,
      nguoi_tao_id: nguoiGoiUid,
      ngay_tao: now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: 'hoat_dong'
    };

    try {
      await db.collection('nhan_su').doc(newUid).set(duLieuRaw);
    } catch (eFirestore: any) {
      // Rollback: Xóa user auth nếu ghi Firestore thất bại
      try {
        await auth.deleteUser(newUid);
      } catch {
        /* ignore */
      }
      return NextResponse.json(
        {
          thanh_cong: false,
          thong_diep: `Lỗi ghi hồ sơ Firestore: ${eFirestore.message}`
        },
        { status: 500 }
      );
    }

    // 6. Ghi nhật ký hoạt động
    try {
      await db.collection('nhat_ky_hoat_dong').add({
        nguoi_dung_id: nguoiGoiUid,
        doi_tuong: 'nhan_su',
        hanh_dong: 'tao_moi',
        ban_ghi_id: newUid,
        noi_dung: `Tạo tài khoản nhân sự "${duLieuRaw.ho_va_ten}" (${duLieuRaw.ma_nhan_vien}) vai trò "${duLieuRaw.vai_tro}"`,
        thoi_gian: now
      });
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      thanh_cong: true,
      thong_diep: 'Tạo nhân sự thành công',
      du_lieu: {
        id: newUid,
        ...duLieuRaw
      }
    });
  } catch (e: any) {
    console.error('Lỗi API /api/nhan-su/tao-moi:', e);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: `Lỗi máy chủ nội bộ: ${e.message || 'Lỗi không xác định'}` },
      { status: 500 }
    );
  }
}
