import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';
import { CAC_VAI_TRO_CHUAN_HE_THONG } from '@/thu_vien/types/nhan_su';

export async function GET() {
  try {
    const db = adminFirestore();
    const snap = await db.collection('vai_tro').get();
    const today = new Date().toISOString();

    const mang = snap.docs.map((doc) => {
      const r = doc.data() || {};
      const id = doc.id;
      const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((s) => s.key === id || s.key === r.ma_vai_tro);
      const tenVaiTro = String(r.ten_vai_tro || stdInfo?.tenMacDinh || id).trim();

      return {
        id,
        ma_vai_tro: r.ma_vai_tro ?? stdInfo?.key ?? id,
        ten_vai_tro: tenVaiTro,
        mo_ta: r.mo_ta ?? stdInfo?.moTa ?? null,
        kieu_hien_thi: r.kieu_hien_thi ?? stdInfo?.badge ?? 'muted',
        thu_tu_sap_xep: typeof r.thu_tu_sap_xep === 'number'
          ? r.thu_tu_sap_xep
          : (stdInfo ? (CAC_VAI_TRO_CHUAN_HE_THONG.indexOf(stdInfo) + 1) * 10 : 0),
        danh_sach_quyen: Array.isArray(r.danh_sach_quyen) ? r.danh_sach_quyen : [],
        is_he_thong: Boolean(r.is_he_thong || stdInfo),
        nguoi_tao_id: r.nguoi_tao_id ?? null,
        ngay_tao: String(r.ngay_tao ?? today),
        ngay_cap_nhat: String(r.ngay_cap_nhat ?? today),
        trang_thai_du_lieu: r.trang_thai_du_lieu ?? 'hoat_dong'
      };
    });

    return NextResponse.json({ thanh_cong: true, mang });
  } catch (err: any) {
    console.error('[API phan-quyen GET] Lỗi lấy danh sách vai trò:', err);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: err?.message || 'Lỗi server' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vai_tro_id, danh_sach_quyen, nguoi_thuc_hien_id, danh_sach_cap_nhat } = body;

    const db = adminFirestore();
    const now = new Date().toISOString();

    // Trường hợp 1: Cập nhật hàng loạt (batch update)
    if (Array.isArray(danh_sach_cap_nhat) && danh_sach_cap_nhat.length > 0) {
      const batch = db.batch();
      for (const item of danh_sach_cap_nhat) {
        const id = item.vai_tro_id || item.id;
        const quyen = Array.isArray(item.danh_sach_quyen) ? item.danh_sach_quyen : [];
        if (!id) continue;

        const docRef = db.collection('vai_tro').doc(id);
        const existingSnap = await docRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() : null;

        const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((s) => s.key === id || s.key === existingData?.ma_vai_tro);
        const tenVaiTro = String(existingData?.ten_vai_tro || stdInfo?.tenMacDinh || id).trim();
        const maVaiTro = existingData?.ma_vai_tro || stdInfo?.key || id;
        const isHeThong = Boolean(existingData?.is_he_thong || stdInfo);
        const kieuHienThi = existingData?.kieu_hien_thi || stdInfo?.badge || 'primary';
        const moTa = existingData?.mo_ta ?? stdInfo?.moTa ?? null;
        const thuTu = typeof existingData?.thu_tu_sap_xep === 'number'
          ? existingData.thu_tu_sap_xep
          : (stdInfo ? (CAC_VAI_TRO_CHUAN_HE_THONG.indexOf(stdInfo) + 1) * 10 : 0);

        batch.set(
          docRef,
          {
            ten_vai_tro: tenVaiTro,
            ma_vai_tro: maVaiTro,
            mo_ta: moTa,
            kieu_hien_thi: kieuHienThi,
            thu_tu_sap_xep: thuTu,
            danh_sach_quyen: quyen,
            is_he_thong: isHeThong,
            nguoi_tao_id: existingData?.nguoi_tao_id || nguoi_thuc_hien_id || null,
            ngay_tao: existingData?.ngay_tao || now,
            ngay_cap_nhat: now,
            trang_thai_du_lieu: existingData?.trang_thai_du_lieu || 'hoat_dong'
          },
          { merge: true }
        );
      }
      await batch.commit();

      return NextResponse.json({
        thanh_cong: true,
        thong_diep: `Đã cập nhật ma trận phân quyền cho ${danh_sach_cap_nhat.length} vai trò`
      });
    }

    // Trường hợp 2: Cập nhật 1 vai trò đơn lẻ
    if (!vai_tro_id || !Array.isArray(danh_sach_quyen)) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Thiếu vai_tro_id hoặc danh_sach_quyen không hợp lệ' },
        { status: 400 }
      );
    }

    const docRef = db.collection('vai_tro').doc(vai_tro_id);
    const existingSnap = await docRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() : null;

    const stdInfo = CAC_VAI_TRO_CHUAN_HE_THONG.find((s) => s.key === vai_tro_id || s.key === existingData?.ma_vai_tro);
    const tenVaiTro = String(existingData?.ten_vai_tro || stdInfo?.tenMacDinh || vai_tro_id).trim();
    const maVaiTro = existingData?.ma_vai_tro || stdInfo?.key || vai_tro_id;
    const isHeThong = Boolean(existingData?.is_he_thong || stdInfo);
    const kieuHienThi = existingData?.kieu_hien_thi || stdInfo?.badge || 'primary';
    const moTa = existingData?.mo_ta ?? stdInfo?.moTa ?? null;
    const thuTu = typeof existingData?.thu_tu_sap_xep === 'number'
      ? existingData.thu_tu_sap_xep
      : (stdInfo ? (CAC_VAI_TRO_CHUAN_HE_THONG.indexOf(stdInfo) + 1) * 10 : 0);

    const dataToSave = {
      ten_vai_tro: tenVaiTro,
      ma_vai_tro: maVaiTro,
      mo_ta: moTa,
      kieu_hien_thi: kieuHienThi,
      thu_tu_sap_xep: thuTu,
      danh_sach_quyen: danh_sach_quyen,
      is_he_thong: isHeThong,
      nguoi_tao_id: existingData?.nguoi_tao_id || nguoi_thuc_hien_id || null,
      ngay_tao: existingData?.ngay_tao || now,
      ngay_cap_nhat: now,
      trang_thai_du_lieu: existingData?.trang_thai_du_lieu || 'hoat_dong'
    };

    await docRef.set(dataToSave, { merge: true });

    return NextResponse.json({
      thanh_cong: true,
      thong_diep: `Đã cập nhật phân quyền cho vai trò "${tenVaiTro}"`,
      vai_tro: { id: vai_tro_id, ...dataToSave }
    });
  } catch (err: any) {
    console.error('[API phan-quyen] Lỗi cập nhật vai trò:', err);
    return NextResponse.json(
      { thanh_cong: false, thong_diep: 'Lỗi máy chủ: ' + (err?.message || 'Không xác định') },
      { status: 500 }
    );
  }
}
