'use client';

import type {
  KeHoachTuan,
  KeHoachThang,
  ItemKeHoachTuan,
  NhatKyKetQuaTuan
} from '../../thu_vien/types/ke_hoach';
import type {
  BaoCaoKeHoachTuan,
  BaoCaoKeHoachThang
} from '../../thu_vien/types/bao_cao_ke_hoach';
import type { NhanSu, NguoiDungDangNhap } from '../../thu_vien/types/nhan_su';
import type { LichGapKH } from '../../thu_vien/types/lich_gap_kh';
import {
  layKeHoachTuan,
  luuKeHoachTuan,
  layTuanFromDateISO
} from './dich_vu_ke_hoach';
import {
  layBaoCaoKeHoachTuan,
  luuBaoCaoKeHoachTuan,
  layBaoCaoKeHoachThang,
  luuBaoCaoKeHoachThang
} from './dich_vu_bao_cao_ke_hoach';
import {
  danhSachBaoCaoCongViec,
  taoBaoCaoCongViecMoi,
  capNhatBaoCaoCongViec
} from '../bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';
import {
  danhSachLichGapKH,
  taoLichGapKHMoi,
  capNhatLichGapKH
} from '../lich_gap_kh/dich_vu_lich_gap_kh';
import { taoTienDoDuAnMoi } from '../ho_so_du_an/dich_vu_tien_do_du_an';
import { doiGiaiDoanHoSoDuAn, layChiTietHoSoDuAn } from '../ho_so_du_an/dich_vu_ho_so_du_an';
import { layChiTietKhachHang, capNhatKhachHang } from '../khach_hang/dich_vu_khach_hang';
import type { GiaiDoanDuAn } from '../../thu_vien/types/du_an';
import { ghiNhatKyHoatDong } from '../../thu_vien/firebase/client_firebase';

/**
 * Tính khoảng ngày (Thứ 2 -> Chủ nhật) của một tuần ISO (VD: "2026-W40")
 */
export const layKhoangNgayTuTuanISO = (
  tuanISO: string
): { tuNgay: string; denNgay: string } => {
  const match = tuanISO.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    const homNay = new Date().toISOString().slice(0, 10);
    return { tuNgay: homNay, denNgay: homNay };
  }
  const nam = Number(match[1]);
  const tuan = Number(match[2]);

  // Ngày 4/1 luôn thuộc tuần 1 theo chuẩn ISO-8601
  const jan4 = new Date(Date.UTC(nam, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // 1 (T2) .. 7 (CN)
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1);

  const mondayTarget = new Date(mondayWeek1);
  mondayTarget.setUTCDate(mondayWeek1.getUTCDate() + (tuan - 1) * 7);

  const sundayTarget = new Date(mondayTarget);
  sundayTarget.setUTCDate(mondayTarget.getUTCDate() + 6);

  return {
    tuNgay: mondayTarget.toISOString().slice(0, 10),
    denNgay: sundayTarget.toISOString().slice(0, 10)
  };
};

/**
 * 1. TỰ ĐỘNG ĐỒNG BỘ KẾ HOẠCH TUẦN -> BÁO CÁO KẾ HOẠCH TUẦN (Single Source of Truth)
 * Giúp nhân viên không cần mở Drawer bấm "Gửi báo cáo" lần 2, số liệu luôn khớp 100%.
 */
export const dongBoTuDongBaoCaoTuan = async (
  keHoach: KeHoachTuan,
  nhanVien?: Partial<NhanSu> | NguoiDungDangNhap | null,
  ghiChuBoSung?: {
    kho_khan?: string | null;
    de_xuat?: string | null;
    trang_thai?: 'nhap' | 'da_gui';
  }
): Promise<BaoCaoKeHoachTuan | null> => {
  try {
    const ds = keHoach.danh_sach_tac_chien ?? [];
    const soHoanThanh = ds.filter(
      (x) => x.da_hoan_thanh || (x as any).trang_thai_vat_chung === 'da_lay'
    ).length;
    const tyLeHoanThanh = ds.length > 0 ? Math.round((soHoanThanh / ds.length) * 100) : 0;

    const baoCaoCu = await layBaoCaoKeHoachTuan(keHoach.nhan_vien_id, keHoach.tuan);

    const danhSachKetQua = ds.map((item) => ({
      item_id: item.id,
      loai_cong_viec: item.loai_cong_viec || 'thi_truong',
      ten_khach_hang_du_an:
        item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || 'Công việc tuần',
      dau_ra_cam_ket:
        item.ket_qua_mong_muon || item.dau_ra_cam_ket || item.hanh_dong_tuan || '',
      ngay_du_kien: item.ngay_du_kien || null,
      danh_sach_ket_qua: item.danh_sach_ket_qua || [],
      ket_qua_thuc_te: item.ket_qua_thuc_te || null,
      da_hoan_thanh: Boolean(item.da_hoan_thanh),
      can_ho_tro: item.can_ho_tro || item.nguoi_ho_tro || null
    }));

    const ketQua = await luuBaoCaoKeHoachTuan({
      id: baoCaoCu?.id,
      ke_hoach_tuan_id: keHoach.id,
      nhan_vien_id: keHoach.nhan_vien_id,
      ten_nhan_vien:
        (nhanVien as any)?.ho_va_ten || baoCaoCu?.ten_nhan_vien || '',
      ma_nhan_vien:
        (nhanVien as any)?.ma_nhan_vien || baoCaoCu?.ma_nhan_vien || '',
      chi_nhanh_id: keHoach.chi_nhanh_id ?? baoCaoCu?.chi_nhanh_id ?? null,
      phong_ban_id: keHoach.phong_ban_id ?? baoCaoCu?.phong_ban_id ?? null,
      tuan: keHoach.tuan,
      tong_muc_tieu: ds.length,
      so_hoan_thanh: soHoanThanh,
      ty_le_hoan_thanh: tyLeHoanThanh,
      danh_sach_ket_qua: danhSachKetQua,
      kho_khan:
        ghiChuBoSung?.kho_khan !== undefined
          ? ghiChuBoSung.kho_khan
          : (baoCaoCu?.kho_khan ?? null),
      de_xuat:
        ghiChuBoSung?.de_xuat !== undefined
          ? ghiChuBoSung.de_xuat
          : (baoCaoCu?.de_xuat ?? null),
      trang_thai: ghiChuBoSung?.trang_thai ?? baoCaoCu?.trang_thai ?? 'da_gui',
      nguoi_tao_id: keHoach.nhan_vien_id
    });

    return ketQua;
  } catch (err) {
    console.warn('[dongBoTuDongBaoCaoTuan] Lỗi đồng bộ tự động:', err);
    return null;
  }
};

/**
 * 2. TỰ ĐỘNG ĐỒNG BỘ KẾ HOẠCH THÁNG -> BÁO CÁO KẾ HOẠCH THÁNG
 */
export const dongBoTuDongBaoCaoThang = async (
  keHoach: KeHoachThang,
  nhanVien?: Partial<NhanSu> | NguoiDungDangNhap | null,
  ghiChuBoSung?: {
    kho_khan?: string | null;
    de_xuat?: string | null;
    trang_thai?: 'nhap' | 'da_gui';
  }
): Promise<BaoCaoKeHoachThang | null> => {
  try {
    const ds = keHoach.danh_sach_dia_ban ?? [];
    const baoCaoCu = await layBaoCaoKeHoachThang(keHoach.nhan_vien_id, keHoach.thang);

    const dsTaiChinh = ds.filter(
      (x) =>
        x.loai_muc_tieu === 'tai_chinh' ||
        (!x.loai_muc_tieu && ((x.du_kien_thu_thang_nay || 0) > 0 || (x.doanh_so_du_kien || 0) > 0))
    );
    const tongGiaTriHd = dsTaiChinh.reduce((acc, x) => acc + (x.gia_tri_hd || 0), 0);
    const tongDuKienThu = dsTaiChinh.reduce(
      (acc, x) => acc + (x.doanh_so_du_kien || x.du_kien_thu_thang_nay || x.chi_tieu || 0),
      0
    );
    const tongThucTeThu = dsTaiChinh.reduce(
      (acc, x) => acc + (x.thuc_te_thu ?? x.ket_qua_thuc_te ?? 0),
      0
    );
    const tyLeDatTien =
      tongDuKienThu > 0 ? Math.round((tongThucTeThu / tongDuKienThu) * 100) : 0;

    let soMucTieuDat = 0;
    let tongDiemDat = 0;

    const danhSachKetQua = ds.map((item) => {
      const isTC =
        item.loai_muc_tieu === 'tai_chinh' ||
        (!item.loai_muc_tieu &&
          ((item.du_kien_thu_thang_nay || 0) > 0 || (item.doanh_so_du_kien || 0) > 0));
      const chiTieu = isTC
        ? item.doanh_so_du_kien || item.du_kien_thu_thang_nay || item.chi_tieu || 0
        : item.chi_tieu || 0;
      const thucTe = isTC
        ? item.thuc_te_thu ?? item.ket_qua_thuc_te ?? 0
        : item.ket_qua_thuc_te || 0;
      const tyLeDat = chiTieu > 0 ? Math.round((thucTe / chiTieu) * 100) : thucTe > 0 ? 100 : 0;
      if (tyLeDat >= 100) soMucTieuDat++;
      tongDiemDat += Math.min(100, tyLeDat);

      return {
        item_id: item.id,
        ten_khach_hang_du_an:
          item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || item.ten_muc_tieu || 'Mục tiêu tháng',
        loai_muc_tieu: item.loai_muc_tieu || (isTC ? 'tai_chinh' : 'thi_truong'),
        chi_tieu: chiTieu,
        don_vi_tinh: item.don_vi_tinh || (isTC ? 'VNĐ' : ''),
        ket_qua_thuc_te: thucTe,
        gia_tri_hd: item.gia_tri_hd || 0,
        du_kien_thu_thang_nay: isTC ? chiTieu : 0,
        thuc_te_thu: isTC ? thucTe : 0,
        ty_le_dat: tyLeDat,
        ghi_chu_ket_qua: item.ghi_chu_ket_qua || item.ghi_chu || null
      };
    });

    const tyLeHoanThanhKpi = ds.length > 0 ? Math.round(tongDiemDat / ds.length) : 0;

    const ketQua = await luuBaoCaoKeHoachThang({
      id: baoCaoCu?.id,
      ke_hoach_thang_id: keHoach.id,
      nhan_vien_id: keHoach.nhan_vien_id,
      ten_nhan_vien:
        (nhanVien as any)?.ho_va_ten || baoCaoCu?.ten_nhan_vien || '',
      ma_nhan_vien:
        (nhanVien as any)?.ma_nhan_vien || baoCaoCu?.ma_nhan_vien || '',
      chi_nhanh_id: keHoach.chi_nhanh_id ?? baoCaoCu?.chi_nhanh_id ?? null,
      phong_ban_id: keHoach.phong_ban_id ?? baoCaoCu?.phong_ban_id ?? null,
      thang: keHoach.thang,
      tong_muc_tieu: ds.length,
      so_muc_tieu_dat: soMucTieuDat,
      ty_le_hoan_thanh_kpi: tyLeHoanThanhKpi,
      tong_gia_tri_hd: tongGiaTriHd,
      tong_du_kien_thu: tongDuKienThu,
      tong_thuc_te_thu: tongThucTeThu,
      ty_le_dat_ke_hoach: tyLeDatTien,
      danh_sach_ket_qua: danhSachKetQua,
      kho_khan:
        ghiChuBoSung?.kho_khan !== undefined
          ? ghiChuBoSung.kho_khan
          : (baoCaoCu?.kho_khan ?? null),
      de_xuat:
        ghiChuBoSung?.de_xuat !== undefined
          ? ghiChuBoSung.de_xuat
          : (baoCaoCu?.de_xuat ?? null),
      trang_thai: ghiChuBoSung?.trang_thai ?? baoCaoCu?.trang_thai ?? 'da_gui',
      nguoi_tao_id: keHoach.nhan_vien_id
    });

    return ketQua;
  } catch (err) {
    console.warn('[dongBoTuDongBaoCaoThang] Lỗi đồng bộ tự động:', err);
    return null;
  }
};

/**
 * 3. TỰ ĐỘNG GHI NHẬN CHECK-IN TIẾN ĐỘ TUẦN VÀO BÁO CÁO CÔNG VIỆC NGÀY (1 Chạm)
 * Khi NVKD cập nhật kết quả ở Kế hoạch tuần -> tự động sinh/cập nhật Báo cáo công việc ngày.
 */
export const ghiNhanCheckInVaoBaoCaoNgay = async (params: {
  nhanVienId: string;
  chiNhanhId?: string | null;
  phongBanId?: string | null;
  ngayBaoCao: string; // YYYY-MM-DD
  duAnId?: string | null;
  tenKhachHangDuAn: string;
  noiDungKetQua: string;
  nguoiThucHien?: Pick<NhanSu, 'id'> | null;
}): Promise<boolean> => {
  try {
    const noiDungSach = params.noiDungKetQua.trim();
    if (!noiDungSach || !params.nhanVienId || !params.ngayBaoCao) return false;

    const tieuDeNgan = params.tenKhachHangDuAn.trim();
    const dongBaoCao =
      tieuDeNgan && !noiDungSach.toLowerCase().includes(tieuDeNgan.toLowerCase())
        ? `[${tieuDeNgan}] ${noiDungSach}`
        : noiDungSach;

    // Kiểm tra báo cáo ngày hôm đó của nhân viên đã có chưa
    const { mang } = await danhSachBaoCaoCongViec({
      nhan_vien_id: params.nhanVienId,
      ngay_bao_cao_tu_ngay: params.ngayBaoCao,
      ngay_bao_cao_den_ngay: params.ngayBaoCao,
      trang_thai_du_lieu: 'hoat_dong'
    });

    const baoCaoHomDo = mang.find((bc) => bc.ngay_bao_cao === params.ngayBaoCao);

    if (baoCaoHomDo) {
      const dsCu = baoCaoHomDo.danh_sach_chi_tiet ?? [];
      const daTonTai = dsCu.some(
        (ct) =>
          ct.noi_dung.trim().toLowerCase() === dongBaoCao.toLowerCase() ||
          ct.noi_dung.trim().toLowerCase() === noiDungSach.toLowerCase()
      );
      if (daTonTai) return true;

      await capNhatBaoCaoCongViec(
        baoCaoHomDo.id,
        {
          danh_sach_chi_tiet: [
            ...dsCu,
            {
              du_an_id: params.duAnId || null,
              noi_dung: dongBaoCao
            }
          ],
          trang_thai: 'da_gui'
        },
        params.nguoiThucHien ?? { id: params.nhanVienId }
      );
      return true;
    }

    await taoBaoCaoCongViecMoi(
      {
        ngay_bao_cao: params.ngayBaoCao,
        nhan_vien_id: params.nhanVienId,
        chi_nhanh_id: params.chiNhanhId ?? null,
        phong_ban_id: params.phongBanId ?? null,
        danh_sach_chi_tiet: [
          {
            du_an_id: params.duAnId || null,
            noi_dung: dongBaoCao
          }
        ],
        trang_thai: 'da_gui'
      },
      params.nguoiThucHien ?? { id: params.nhanVienId }
    );
    return true;
  } catch (err) {
    console.warn('[ghiNhanCheckInVaoBaoCaoNgay] Lỗi:', err);
    return false;
  }
};

/**
 * 4. ĐỒNG BỘ TỪ MỤC TIÊU TUẦN -> LỊCH CÔNG TÁC (lich_gap_kh)
 * Khi tạo mục tiêu tuần có ngày dự kiến -> tự động đưa lên Lịch công tác.
 * Khi hoàn thành mục tiêu tuần -> tự động cập nhật trạng thái lịch hẹn.
 */
export const dongBoCongViecTuanSangLichGap = async (params: {
  item: ItemKeHoachTuan;
  nhanVienId: string;
  chiNhanhId?: string | null;
  nguoiTaoId: string;
  choPhepTaoMoiLich?: boolean;
}): Promise<void> => {
  try {
    const { item, nhanVienId, chiNhanhId, nguoiTaoId, choPhepTaoMoiLich = true } = params;
    if (!item.ngay_du_kien || !nhanVienId) return;

    const tuanISO = layTuanFromDateISO(item.ngay_du_kien);
    const { tuNgay, denNgay } = layKhoangNgayTuTuanISO(tuanISO);

    const dsLich = await danhSachLichGapKH({
      nguoi_phu_trach_id: nhanVienId,
      tu_ngay: tuNgay,
      den_ngay: denNgay
    });

    const tenKH = (
      item.co_quan_doanh_nghiep ||
      item.ten_khach_hang_du_an ||
      item.du_an_du_kien ||
      item.hanh_dong_tuan ||
      'Khách hàng'
    ).trim();

    const tieuDeCv = (item.hanh_dong_tuan || item.noi_dung_tuan || `Làm việc với ${tenKH}`).trim();

    const lichKhop = dsLich.find((l) => {
      if (l.tieu_de && l.tieu_de.trim().toLowerCase() === tieuDeCv.toLowerCase()) return true;
      if (item.khach_hang_id && l.khach_hang_id === item.khach_hang_id && l.ngay === item.ngay_du_kien) return true;
      if (item.du_an_id && l.du_an_id === item.du_an_id && l.ngay === item.ngay_du_kien) return true;
      if (
        tenKH &&
        l.ten_khach_hang &&
        l.ten_khach_hang.trim().toLowerCase() === tenKH.toLowerCase() &&
        l.ngay === item.ngay_du_kien
      ) {
        return true;
      }
      return false;
    });

    if (lichKhop) {
      const capNhatData: Record<string, any> = {};
      if (item.da_hoan_thanh && lichKhop.trang_thai === 'sap_toi') {
        capNhatData.trang_thai = 'da_hoan_thanh';
        capNhatData.ket_qua = item.ket_qua_thuc_te || lichKhop.ket_qua || 'Đã hoàn thành theo kế hoạch tuần';
      }
      if (item.ngay_du_kien && lichKhop.ngay !== item.ngay_du_kien) {
        capNhatData.ngay = item.ngay_du_kien;
      }
      if (item.gio_bat_dau && lichKhop.gio_bat_dau !== item.gio_bat_dau) {
        capNhatData.gio_bat_dau = item.gio_bat_dau;
      }
      if (item.gio_ket_thuc && lichKhop.gio_ket_thuc !== item.gio_ket_thuc) {
        capNhatData.gio_ket_thuc = item.gio_ket_thuc;
      }
      if (item.dia_diem_hen !== undefined && item.dia_diem_hen !== lichKhop.dia_diem) {
        capNhatData.dia_diem = item.dia_diem_hen || item.xa_phuong || lichKhop.dia_diem;
      }

      if (Object.keys(capNhatData).length > 0) {
        await capNhatLichGapKH(lichKhop.id, capNhatData, nguoiTaoId);
      }
      return;
    }

    // Chỉ tạo lịch hẹn mới trên Lịch công tác khi công việc đã chốt lịch hẹn (gap_mat)
    if (!choPhepTaoMoiLich || !tenKH || item.hinh_thuc !== 'gap_mat') return;

    const nlhRaw = item.nguoi_lien_he || '';
    const tenLienHe = nlhRaw.includes('_') ? nlhRaw.split('_')[0] : nlhRaw;

    await taoLichGapKHMoi({
      tieu_de: tieuDeCv,
      khach_hang_id: item.khach_hang_id || null,
      ten_khach_hang: tenKH,
      nguoi_lien_he_id: null,
      ten_nguoi_lien_he: tenLienHe || null,
      so_dien_thoai: null,
      nguoi_phu_trach_id: nhanVienId,
      nguoi_tham_gia_ids: [],
      chi_nhanh_id: chiNhanhId ?? null,
      ngay: item.ngay_du_kien,
      gio_bat_dau: item.gio_bat_dau || '08:30',
      gio_ket_thuc: item.gio_ket_thuc || '10:00',
      dia_diem: item.dia_diem_hen || item.xa_phuong || null,
      noi_dung: item.ket_qua_mong_muon || item.dau_ra_cam_ket || item.hanh_dong_tuan || null,
      ket_qua: item.ket_qua_thuc_te || null,
      trang_thai: item.da_hoan_thanh ? 'da_hoan_thanh' : 'sap_toi',
      nguon_lead_id: null,
      du_an_id: item.du_an_id || null,
      nguoi_tao_id: nguoiTaoId
    });
  } catch (err) {
    console.warn('[dongBoCongViecTuanSangLichGap] Lỗi:', err);
  }
};

/**
 * 5. ĐỒNG BỘ TỪ LỊCH CÔNG TÁC / LEAD -> KẾ HOẠCH TUẦN + BÁO CÁO NGÀY
 * Khi NVKD đặt lịch hẹn (từ trang Lead hoặc Lịch công tác) hoặc cập nhật kết quả buổi gặp:
 * -> Tự động thêm/cập nhật vào Kế hoạch Tuần của tuần đó
 * -> Nếu đã Hoàn thành có kết quả -> Tự động ghi Báo cáo công việc ngày & Báo cáo tuần!
 */
export const dongBoLichGapSangKeHoachTuanVaBaoCaoNgay = async (params: {
  lich: LichGapKH;
  nguoiThucHien?: NguoiDungDangNhap | null;
}): Promise<KeHoachTuan | null> => {
  try {
    const { lich, nguoiThucHien } = params;
    const nhanVienId = lich.nguoi_phu_trach_id || nguoiThucHien?.id;
    if (!nhanVienId || !lich.ngay) return null;

    const tuanISO = layTuanFromDateISO(lich.ngay);
    const keHoachHienTai = await layKeHoachTuan(nhanVienId, tuanISO);
    const dsTacChien = [...(keHoachHienTai?.danh_sach_tac_chien ?? [])];

    const tenKH = (lich.ten_khach_hang || lich.tieu_de || '').trim();
    const idMucTieuLich = lich.id ? `tuan_lich_${lich.id}` : '';

    const idxKhop = dsTacChien.findIndex((item) => {
      if (idMucTieuLich && item.id === idMucTieuLich) return true;
      if (item.hinh_thuc !== 'gap_mat') return false;
      if (item.ngay_du_kien !== lich.ngay) return false;
      if (item.gio_bat_dau && lich.gio_bat_dau && item.gio_bat_dau !== lich.gio_bat_dau) {
        return false;
      }
      if (lich.khach_hang_id && item.khach_hang_id === lich.khach_hang_id) {
        return true;
      }
      if (lich.du_an_id && item.du_an_id === lich.du_an_id) {
        return true;
      }
      const tenItem = (item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '').trim();
      return tenKH.length > 0 && tenItem.toLowerCase() === tenKH.toLowerCase();
    });

    const daXongLich = lich.trang_thai === 'da_hoan_thanh';
    const ketQuaLich = (lich.ket_qua || '').trim();
    const nowISO = new Date().toISOString();

    if (idxKhop >= 0) {
      const itemCu = dsTacChien[idxKhop];
      const dsKqCu = [...(itemCu.danh_sach_ket_qua ?? [])];

      if (ketQuaLich) {
        const daCoKq = dsKqCu.some(
          (k) => k.noi_dung.trim().toLowerCase() === ketQuaLich.toLowerCase()
        );
        if (!daCoKq) {
          const nhatKyMoi: NhatKyKetQuaTuan = {
            id: `kq_lich_${Date.now()}`,
            ngay_ghi_nhan: lich.ngay,
            noi_dung: ketQuaLich,
            nguoi_ghi_id: nguoiThucHien?.id || nhanVienId,
            ten_nguoi_ghi: nguoiThucHien?.ho_va_ten || null
          };
          dsKqCu.unshift(nhatKyMoi);
        }
      }

      const dsNgayMoi = Array.from(
        new Set([...(itemCu.cac_ngay_thuc_hien ?? []), lich.ngay])
      ).sort();

      dsTacChien[idxKhop] = {
        ...itemCu,
        hinh_thuc: 'gap_mat',
        ngay_du_kien: lich.ngay,
        cac_ngay_thuc_hien: dsNgayMoi,
        gio_bat_dau: lich.gio_bat_dau || itemCu.gio_bat_dau || '08:30',
        gio_ket_thuc: lich.gio_ket_thuc || itemCu.gio_ket_thuc || '10:00',
        dia_diem_hen: lich.dia_diem || itemCu.dia_diem_hen || null,
        da_hoan_thanh: daXongLich ? true : itemCu.da_hoan_thanh,
        ngay_hoan_thanh: daXongLich ? itemCu.ngay_hoan_thanh || lich.ngay : itemCu.ngay_hoan_thanh,
        ket_qua_thuc_te: ketQuaLich || itemCu.ket_qua_thuc_te || null,
        danh_sach_ket_qua: dsKqCu,
        ngay_cap_nhat_tien_do: nowISO
      };
    } else {
      // Tự động tạo mục tiêu tác chiến tuần mới từ Lịch hẹn
      const dsKqMoi: NhatKyKetQuaTuan[] = ketQuaLich
        ? [
            {
              id: `kq_lich_${Date.now()}`,
              ngay_ghi_nhan: lich.ngay,
              noi_dung: ketQuaLich,
              nguoi_ghi_id: nguoiThucHien?.id || nhanVienId,
              ten_nguoi_ghi: nguoiThucHien?.ho_va_ten || null
            }
          ]
        : [];

      const itemMoi: ItemKeHoachTuan = {
        id: `tuan_lich_${lich.id || Date.now()}`,
        loai_hanh_dong: 'phat_sinh',
        loai_cong_viec: 'khach_hang',
        hinh_thuc: 'gap_mat',
        khach_hang_id: lich.khach_hang_id || null,
        du_an_id: lich.du_an_id || null,
        xa_phuong: lich.dia_diem || null,
        co_quan_doanh_nghiep: tenKH,
        nguoi_lien_he: lich.ten_nguoi_lien_he || null,
        ten_khach_hang_du_an: tenKH,
        hanh_dong_tuan: lich.tieu_de || lich.noi_dung || `Gặp gỡ / Làm việc với ${tenKH}`,
        noi_dung_tuan: lich.tieu_de || lich.noi_dung || `Gặp gỡ / Làm việc với ${tenKH}`,
        ket_qua_mong_muon: lich.noi_dung || 'Trao đổi nắm bắt nhu cầu & thúc đẩy cơ hội',
        dau_ra_cam_ket: lich.noi_dung || 'Trao đổi nắm bắt nhu cầu & thúc đẩy cơ hội',
        ngay_du_kien: lich.ngay,
        cac_ngay_thuc_hien: [lich.ngay],
        gio_bat_dau: lich.gio_bat_dau || '08:30',
        gio_ket_thuc: lich.gio_ket_thuc || '10:00',
        dia_diem_hen: lich.dia_diem || null,
        da_hoan_thanh: daXongLich,
        ngay_hoan_thanh: daXongLich ? lich.ngay : null,
        danh_sach_ket_qua: dsKqMoi,
        ket_qua_thuc_te: ketQuaLich || null,
        ngay_cap_nhat_tien_do: nowISO
      };
      dsTacChien.push(itemMoi);
    }

    const keHoachDaLuu = await luuKeHoachTuan(
      {
        id: keHoachHienTai?.id,
        tuan: tuanISO,
        nhan_vien_id: nhanVienId,
        chi_nhanh_id: lich.chi_nhanh_id ?? keHoachHienTai?.chi_nhanh_id ?? nguoiThucHien?.chi_nhanh_id ?? null,
        phong_ban_id: keHoachHienTai?.phong_ban_id ?? nguoiThucHien?.phong_ban_id ?? null,
        danh_sach_tac_chien: dsTacChien
      },
      nguoiThucHien ? { id: nguoiThucHien.id } : { id: nhanVienId }
    );

    // Đồng bộ sang Báo cáo Tuần
    await dongBoTuDongBaoCaoTuan(keHoachDaLuu, nguoiThucHien);

    // Nếu lịch gặp đã hoàn thành hoặc có kết quả -> Tự động ghi vào Báo cáo công việc ngày!
    if (daXongLich || ketQuaLich) {
      await ghiNhanCheckInVaoBaoCaoNgay({
        nhanVienId,
        chiNhanhId: lich.chi_nhanh_id ?? nguoiThucHien?.chi_nhanh_id ?? null,
        phongBanId: nguoiThucHien?.phong_ban_id ?? null,
        ngayBaoCao: lich.ngay,
        duAnId: lich.du_an_id || null,
        tenKhachHangDuAn: tenKH,
        noiDungKetQua: ketQuaLich || `Hoàn thành lịch hẹn: ${lich.tieu_de}`,
        nguoiThucHien: nguoiThucHien ? { id: nguoiThucHien.id } : { id: nhanVienId }
      });
    }

    return keHoachDaLuu;
  } catch (err) {
    console.warn('[dongBoLichGapSangKeHoachTuanVaBaoCaoNgay] Lỗi:', err);
    return null;
  }
};

/**
 * 6. ĐỒNG BỘ TỪ BÁO CÁO CÔNG VIỆC NGÀY -> KẾ HOẠCH TUẦN & BÁO CÁO TUẦN
 * Khi NVKD lưu Báo cáo công việc ngày có gắn Dự án hoặc nội dung trùng với mục tiêu tuần:
 * -> Tự động đẩy kết quả về Kế hoạch tuần để NVKD không phải cập nhật lại.
 */
export const dongBoBaoCaoNgaySangKeHoachTuan = async (params: {
  nhanVienId: string;
  ngayBaoCao: string;
  danhSachChiTiet: { du_an_id?: string | null; noi_dung: string }[];
  nguoiThucHien?: NguoiDungDangNhap | null;
}): Promise<number> => {
  try {
    const { nhanVienId, ngayBaoCao, danhSachChiTiet, nguoiThucHien } = params;
    if (!nhanVienId || !ngayBaoCao || danhSachChiTiet.length === 0) return 0;

    const tuanISO = layTuanFromDateISO(ngayBaoCao);
    const keHoach = await layKeHoachTuan(nhanVienId, tuanISO);
    if (!keHoach || !keHoach.danh_sach_tac_chien?.length) return 0;

    let soMucDaDongBo = 0;
    const nowISO = new Date().toISOString();

    const dsMoi = keHoach.danh_sach_tac_chien.map((item) => {
      // Tìm các dòng báo cáo ngày khớp với dự án hoặc tên khách hàng/cơ quan của mục tiêu tuần
      const tenCQ = (item.co_quan_doanh_nghiep || item.ten_khach_hang_du_an || '').trim().toLowerCase();
      const tenDA = (item.du_an_du_kien || '').trim().toLowerCase();

      const cacDongKhop = danhSachChiTiet.filter((ct) => {
        if (item.du_an_id && ct.du_an_id && item.du_an_id === ct.du_an_id) return true;
        const ndLower = ct.noi_dung.toLowerCase();
        if (tenCQ.length >= 4 && ndLower.includes(tenCQ)) return true;
        if (tenDA.length >= 4 && ndLower.includes(tenDA)) return true;
        return false;
      });

      if (cacDongKhop.length === 0) return item;

      const dsKq = [...(item.danh_sach_ket_qua ?? [])];
      let coThemMoi = false;

      for (const ct of cacDongKhop) {
        const ndSach = ct.noi_dung.trim();
        const daCo = dsKq.some((k) => k.noi_dung.trim().toLowerCase() === ndSach.toLowerCase());
        if (!daCo) {
          dsKq.unshift({
            id: `kq_bccv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            ngay_ghi_nhan: ngayBaoCao,
            noi_dung: ndSach,
            nguoi_ghi_id: nguoiThucHien?.id || nhanVienId,
            ten_nguoi_ghi: nguoiThucHien?.ho_va_ten || null
          });
          coThemMoi = true;
        }
      }

      if (!coThemMoi) return item;
      soMucDaDongBo++;

      return {
        ...item,
        danh_sach_ket_qua: dsKq,
        ket_qua_thuc_te: dsKq[0]?.noi_dung || item.ket_qua_thuc_te || null,
        ngay_cap_nhat_tien_do: nowISO
      };
    });

    if (soMucDaDongBo > 0) {
      const keHoachDaLuu = await luuKeHoachTuan(
        {
          id: keHoach.id,
          tuan: keHoach.tuan,
          nhan_vien_id: keHoach.nhan_vien_id,
          chi_nhanh_id: keHoach.chi_nhanh_id,
          phong_ban_id: keHoach.phong_ban_id,
          danh_sach_tac_chien: dsMoi
        },
        nguoiThucHien ? { id: nguoiThucHien.id } : { id: nhanVienId }
      );
      await dongBoTuDongBaoCaoTuan(keHoachDaLuu, nguoiThucHien);
    }

    return soMucDaDongBo;
  } catch (err) {
    console.warn('[dongBoBaoCaoNgaySangKeHoachTuan] Lỗi:', err);
    return 0;
  }
};

/**
 * 7. SUPER-SYNC CHECK-IN 1 CHẠM (BÓP CÒ BẢN CHUẨN)
 * Khi NVKD check-in tại Kế hoạch tuần, đẩy dữ liệu về 4 đích:
 * - Về Hồ sơ Dự án (Timeline TienDoDuAn)
 * - Về Phễu Pipeline (Giai đoạn Dự án nếu NVKD đổi)
 * - Về Báo cáo công việc ngày (BaoCaoCongViec)
 * - Về Audit Log (NhatKyHoatDong)
 */
export const superSyncCheckIn1Cham = async (params: {
  item: ItemKeHoachTuan;
  nhanVienId: string;
  ngayBaoCao: string; // YYYY-MM-DD
  noiDungKetQua: string;
  linkTaiLieu?: string | null;
  tenTaiLieu?: string | null;
  trangThaiCongViec: 'da_hoan_thanh' | 'dang_thuc_hien' | 'doi_hen';
  giaiDoanDuAnMoi?: string | null;
  nguoiThucHien?: NguoiDungDangNhap | null;
}): Promise<void> => {
  const {
    item,
    nhanVienId,
    ngayBaoCao,
    noiDungKetQua,
    linkTaiLieu,
    tenTaiLieu,
    trangThaiCongViec,
    giaiDoanDuAnMoi,
    nguoiThucHien
  } = params;

  try {
    const noiDungSach = noiDungKetQua.trim();
    const kqMoiNhat = item.danh_sach_ket_qua?.[0];

    const duAnIdMucTieu = kqMoiNhat?.du_an_id || item.du_an_id || null;
    const tenDuAnMucTieu =
      kqMoiNhat?.ten_du_an || item.du_an_du_kien || item.ten_khach_hang_du_an;
    const tenDoiTuongBaoCao =
      kqMoiNhat?.ten_du_an ||
      kqMoiNhat?.ten_khach_hang ||
      item.co_quan_doanh_nghiep ||
      item.ten_khach_hang_du_an ||
      'Công việc tuần';

    // [Đích 1] Về Hồ sơ Dự án (Timeline TienDoDuAn) — chỉ tạo khi không phải vừa tạo mới dự án
    if (
      duAnIdMucTieu &&
      noiDungSach &&
      kqMoiNhat?.loai_tac_nghiep !== 'tao_du_an'
    ) {
      await taoTienDoDuAnMoi(
        {
          du_an_id: duAnIdMucTieu,
          tinh_hinh_hien_tai: noiDungSach,
          link_tai_lieu: linkTaiLieu || null,
          ten_tai_lieu: tenTaiLieu || null,
          trang_thai_hanh_dong:
            trangThaiCongViec === 'da_hoan_thanh'
              ? 'da_hoan_thanh'
              : trangThaiCongViec === 'doi_hen'
              ? 'dang_cho'
              : 'dang_thuc_hien',
          nguoi_tao_id: nguoiThucHien?.id || nhanVienId
        },
        tenDuAnMucTieu
      );
    }

    // [Đích 2] Về Phễu Pipeline (Đổi giai đoạn dự án nếu NVKD có chọn)
    if (duAnIdMucTieu && giaiDoanDuAnMoi && giaiDoanDuAnMoi.trim()) {
      await doiGiaiDoanHoSoDuAn(
        duAnIdMucTieu,
        giaiDoanDuAnMoi.trim() as GiaiDoanDuAn,
        nguoiThucHien ? { id: nguoiThucHien.id } : null
      );
    }

    // [Đích 3] Về Báo cáo công việc ngày
    if (noiDungSach) {
      await ghiNhanCheckInVaoBaoCaoNgay({
        nhanVienId,
        chiNhanhId: nguoiThucHien?.chi_nhanh_id || null,
        phongBanId: nguoiThucHien?.phong_ban_id || null,
        ngayBaoCao,
        duAnId: duAnIdMucTieu,
        tenKhachHangDuAn: tenDoiTuongBaoCao,
        noiDungKetQua: noiDungSach,
        nguoiThucHien
      });
    }

    // [Đích 4] Lịch công tác (Chỉ đồng bộ nếu là Gặp mặt đi thị trường)
    if (item.hinh_thuc === 'gap_mat' && item.ngay_du_kien) {
      await dongBoCongViecTuanSangLichGap({
        item: {
          ...item,
          da_hoan_thanh: trangThaiCongViec === 'da_hoan_thanh'
        },
        nhanVienId,
        chiNhanhId: nguoiThucHien?.chi_nhanh_id || null,
        nguoiTaoId: nguoiThucHien?.id || nhanVienId
      });
    }

    // [Đích 5] Đồng bộ về Lịch sử Tác nghiệp & Ghi chú của Khách hàng
    let khachHangIdMucTieu = kqMoiNhat?.khach_hang_id || item.khach_hang_id || null;
    if (!khachHangIdMucTieu && duAnIdMucTieu) {
      try {
        const da = await layChiTietHoSoDuAn(duAnIdMucTieu);
        if (da?.khach_hang_id) {
          khachHangIdMucTieu = da.khach_hang_id;
        }
      } catch (e) {
        console.warn('[superSyncCheckIn1Cham] Không tìm thấy khách hàng từ dự án:', e);
      }
    }

    if (khachHangIdMucTieu) {
      const noiDungGhiNhan =
        noiDungSach ||
        item.ket_qua_thuc_te ||
        `Cập nhật tiến độ: ${item.hanh_dong_tuan || item.noi_dung_tuan || 'Hoàn thành công việc trong ngày'}`;

      await ghiNhatKyHoatDong(
        nguoiThucHien?.id || nhanVienId,
        'khach_hang',
        'cap_nhat',
        khachHangIdMucTieu,
        `Tác nghiệp bàn làm việc [${item.hinh_thuc || 'liên hệ'}]: ${noiDungGhiNhan}`
      );

      try {
        const khach = await layChiTietKhachHang(khachHangIdMucTieu);
        if (khach) {
          const tenNguoiThucHien = nguoiThucHien?.ho_va_ten || 'NVKD';
          const dongMoi = `[${ngayBaoCao} - ${tenNguoiThucHien}]: ${noiDungGhiNhan}`;
          const ghiChuMoi = khach.ghi_chu ? `${khach.ghi_chu}\n${dongMoi}` : dongMoi;
          await capNhatKhachHang({ id: khachHangIdMucTieu, ghi_chu: ghiChuMoi }, nguoiThucHien);
        }
      } catch (err) {
        console.warn('[superSyncCheckIn1Cham] Lỗi đồng bộ ghi chú khách hàng:', err);
      }
    }

    // [Đích 6] Nhật ký hoạt động chung (Audit log)
    await ghiNhatKyHoatDong(
      nguoiThucHien?.id || nhanVienId,
      'ke_hoach',
      'cap_nhat',
      item.id,
      `Check-in 1 chạm công việc "${tenDoiTuongBaoCao}": ${noiDungSach || trangThaiCongViec}`
    );
  } catch (err) {
    console.warn('[superSyncCheckIn1Cham] Lỗi:', err);
  }
};

