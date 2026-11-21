'use client';

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import type { KeHoachTuanMoi, MucTieuTuanMoi } from '../../thu_vien/types/ke_hoach_tuan_moi';
import {
  thamChieuCollection,
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';
import { danhSachLichGapKH } from '../lich_gap_kh/dich_vu_lich_gap_kh';
import { danhSachBaoCaoCongViec } from '../bao_cao_cong_viec/dich_vu_bao_cao_cong_viec';

const COLLECTION_NAME = 'ke_hoach_tuan_moi';

// Helper loại bỏ undefined trước khi ghi vào Firestore
function loaiBoUndefined<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  const res: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined) continue;
    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      res[key] = loaiBoUndefined(val);
    } else {
      res[key] = val;
    }
  }
  return res;
}

/**
 * 1. LẤY KẾ HOẠCH TUẦN CỦA 1 NHÂN VIÊN
 */
export const layKeHoachTuanMoi = async (
  nhanVienId: string,
  tuan: string
): Promise<KeHoachTuanMoi | null> => {
  if (!nhanVienId || !tuan) return null;
  const docId = `${nhanVienId}_${tuan}`;
  try {
    const ref = thamChieuBanGhi(COLLECTION_NAME as any, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as KeHoachTuanMoi;
  } catch (err) {
    console.warn('[layKeHoachTuanMoi] Lỗi:', err);
    return null;
  }
};

/**
 * 2. LƯU HOẶC CẬP NHẬT KẾ HOẠCH TUẦN
 */
export const luuKeHoachTuanMoi = async (
  keHoach: KeHoachTuanMoi
): Promise<KeHoachTuanMoi> => {
  const docId = keHoach.id || `${keHoach.nhan_vien_id}_${keHoach.tuan}`;
  const duLieu = loaiBoUndefined({
    ...keHoach,
    id: docId,
    ngay_cap_nhat: new Date().toISOString()
  });

  const ref = thamChieuBanGhi(COLLECTION_NAME as any, docId);
  await setDoc(ref, duLieu, { merge: true });
  return duLieu;
};

/**
 * 3. LẤY DANH SÁCH KẾ HOẠCH TUẦN THEO TUẦN (CHO TRƯỞNG PHÒNG / LÃNH ĐẠO)
 */
export const danhSachKeHoachTuanMoiTheoTuan = async (
  tuan: string
): Promise<KeHoachTuanMoi[]> => {
  if (!tuan) return [];
  try {
    const ref = thamChieuCollection(COLLECTION_NAME as any);
    const q = query(ref, where('tuan', '==', tuan));
    const snap = await getDocs(q);
    const list: KeHoachTuanMoi[] = [];
    snap.forEach((d) => list.push(d.data() as KeHoachTuanMoi));
    return list;
  } catch (err) {
    console.warn('[danhSachKeHoachTuanMoiTheoTuan] Lỗi:', err);
    return [];
  }
};

/**
 * 4. TRƯỞNG PHÒNG / LÃNH ĐẠO PHẢN HỒI ĐỊNH HƯỚNG
 */
export const phanHoiKeHoachTuanMoi = async (
  keHoachId: string,
  phanHoi: string,
  nguoiPhanHoi: { id: string; ho_va_ten: string }
): Promise<void> => {
  if (!keHoachId) return;
  const ref = thamChieuBanGhi(COLLECTION_NAME as any, keHoachId);
  await updateDoc(ref, {
    phan_hoi_lanh_dao: phanHoi.trim(),
    nguoi_phan_hoi_id: nguoiPhanHoi.id,
    ten_nguoi_phan_hoi: nguoiPhanHoi.ho_va_ten,
    ngay_phan_hoi: new Date().toISOString(),
    trang_thai: 'da_phan_hoi',
    ngay_cap_nhat: new Date().toISOString()
  });
};

/**
 * 5. QUÉT LỊCH LÀM VIỆC ĐỂ GỢI Ý MỤC TIÊU TUẦN (ĐẦU TUẦN)
 */
export const quetLichTuanDeGoiY = async (
  nhanVienId: string,
  ngayBatDau: string,
  ngayKetThuc: string
): Promise<MucTieuTuanMoi[]> => {
  if (!nhanVienId || !ngayBatDau || !ngayKetThuc) return [];
  try {
    const dsLich = await danhSachLichGapKH({
      nguoi_phu_trach_id: nhanVienId,
      tu_ngay: ngayBatDau,
      den_ngay: ngayKetThuc
    });

    const mucTieuMap = new Map<string, MucTieuTuanMoi>();
    for (const lich of dsLich) {
      const key = lich.du_an_id || lich.khach_hang_id || lich.tieu_de;
      if (!key) continue;
      if (!mucTieuMap.has(key)) {
        mucTieuMap.set(key, {
          id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          du_an_id: lich.du_an_id || null,
          ten_du_an: (lich as any).ten_du_an || null,
          khach_hang_id: lich.khach_hang_id || null,
          ten_khach_hang: lich.ten_khach_hang || null,
          noi_dung_trong_tam: lich.tieu_de || lich.noi_dung || 'Gặp gỡ trao đổi công việc',
          ket_qua_dat_duoc: (lich.ket_qua || '').trim() || null,
          trang_thai: lich.trang_thai === 'da_hoan_thanh' ? 'da_xong' : 'dang_lam'
        });
      }
    }
    return Array.from(mucTieuMap.values());
  } catch (err) {
    console.warn('[quetLichTuanDeGoiY] Lỗi:', err);
    return [];
  }
};

/**
 * 6. TỰ ĐỘNG TỔNG HỢP KẾT QUẢ TỪ LỊCH LÀM VIỆC & BÁO CÁO NGÀY (CUỐI TUẦN)
 */
export const quetKetQuaThucTeTuan = async (
  nhanVienId: string,
  ngayBatDau: string,
  ngayKetThuc: string
): Promise<Map<string, string>> => {
  const ketQuaTheoDuAnVaKhachHang = new Map<string, string>();
  if (!nhanVienId || !ngayBatDau || !ngayKetThuc) return ketQuaTheoDuAnVaKhachHang;

  try {
    // 1. Quét từ Lịch làm việc đã hoàn thành
    const dsLich = await danhSachLichGapKH({
      nguoi_phu_trach_id: nhanVienId,
      tu_ngay: ngayBatDau,
      den_ngay: ngayKetThuc
    });

    for (const lich of dsLich) {
      if (lich.ket_qua?.trim()) {
        const kq = `${lich.ngay ? `[${lich.ngay.slice(5)}] ` : ''}${lich.ket_qua.trim()}`;
        if (lich.du_an_id) {
          const cu = ketQuaTheoDuAnVaKhachHang.get(lich.du_an_id);
          ketQuaTheoDuAnVaKhachHang.set(lich.du_an_id, cu ? `${cu}\n- ${kq}` : `- ${kq}`);
        }
        if (lich.khach_hang_id) {
          const cu = ketQuaTheoDuAnVaKhachHang.get(lich.khach_hang_id);
          ketQuaTheoDuAnVaKhachHang.set(lich.khach_hang_id, cu ? `${cu}\n- ${kq}` : `- ${kq}`);
        }
      }
    }

    // 2. Quét từ Báo cáo công việc ngày
    const { mang: dsBaoCao } = await danhSachBaoCaoCongViec({
      nhan_vien_id: nhanVienId,
      ngay_bao_cao_tu_ngay: ngayBatDau,
      ngay_bao_cao_den_ngay: ngayKetThuc,
      trang_thai_du_lieu: 'hoat_dong'
    });

    for (const bc of dsBaoCao) {
      for (const ct of bc.danh_sach_chi_tiet || []) {
        if (ct.du_an_id && ct.noi_dung?.trim()) {
          const cu = ketQuaTheoDuAnVaKhachHang.get(ct.du_an_id);
          const dong = `[${bc.ngay_bao_cao.slice(5)}] ${ct.noi_dung.trim()}`;
          if (!cu || !cu.includes(ct.noi_dung.trim())) {
            ketQuaTheoDuAnVaKhachHang.set(ct.du_an_id, cu ? `${cu}\n- ${dong}` : `- ${dong}`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[quetKetQuaThucTeTuan] Lỗi:', err);
  }

  return ketQuaTheoDuAnVaKhachHang;
};
