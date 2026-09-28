'use client';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  limit,
  type Unsubscribe
} from 'firebase/firestore';
import { firebaseFirestore as csdl } from '../../thu_vien/firebase/client_firebase';
import type { AIDanhGiaNhanSu, CauHinhAIGemini } from '../../thu_vien/types/ai_danh_gia';
import { CAU_HINH_AI_MAC_DINH } from '../../thu_vien/types/ai_danh_gia';

const COLLECTION_NAME = 'ai_danh_gia_nhan_su';

/**
 * Lấy danh sách đánh giá AI theo ngày (mặc định lấy tất cả hoặc theo ngày cụ thể)
 */
export const danhSachAIDanhGia = async (
  ngay?: string,
  nhanVienId?: string
): Promise<AIDanhGiaNhanSu[]> => {
  try {
    const colRef = collection(csdl, COLLECTION_NAME);
    const dieuKien: any[] = [];

    if (ngay) {
      dieuKien.push(where('ngay_danh_gia', '==', ngay));
    }
    if (nhanVienId) {
      dieuKien.push(where('nhan_vien_id', '==', nhanVienId));
    }

    const q = dieuKien.length > 0 ? query(colRef, ...dieuKien) : query(colRef, limit(100));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as AIDanhGiaNhanSu[];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách AI đánh giá:', error);
    return [];
  }
};

/**
 * Lắng nghe realtime danh sách đánh giá AI
 */
export const langNgheThayDoiAIDanhGia = (
  ngay: string,
  callback: (duLieu: AIDanhGiaNhanSu[]) => void
): Unsubscribe => {
  const colRef = collection(csdl, COLLECTION_NAME);
  const q = query(colRef, where('ngay_danh_gia', '==', ngay));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as AIDanhGiaNhanSu[];
      callback(items);
    },
    (error) => {
      console.error('Lỗi lắng nghe AI đánh giá:', error);
      callback([]);
    }
  );
};

/**
 * Lấy lịch sử đánh giá của 1 nhân viên cụ thể (7 - 30 ngày gần nhất)
 */
export const layLichSuDanhGiaNhanVien = async (
  nhanVienId: string,
  soLuong: number = 10
): Promise<AIDanhGiaNhanSu[]> => {
  try {
    const colRef = collection(csdl, COLLECTION_NAME);
    // Truy vấn theo nhan_vien_id và sắp xếp trong bộ nhớ để không cần tạo Firestore Composite Index
    const q = query(
      colRef,
      where('nhan_vien_id', '==', nhanVienId)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as AIDanhGiaNhanSu[];

    return items
      .sort((a, b) => (b.ngay_danh_gia || '').localeCompare(a.ngay_danh_gia || ''))
      .slice(0, soLuong);
  } catch (error) {
    console.error('Lỗi lấy lịch sử đánh giá nhân viên:', error);
    return [];
  }
};

/**
 * Gọi API backend để kích hoạt AI đánh giá (cho 1 nhân viên hoặc tất cả)
 */
export const kichHoatAIDanhGia = async (thamSo: {
  nhan_vien_id?: string;
  ngay_danh_gia?: string;
}): Promise<{
  thanh_cong: boolean;
  thong_diep?: string;
  du_lieu?: AIDanhGiaNhanSu | AIDanhGiaNhanSu[];
  loi?: string;
}> => {
  try {
    const res = await fetch('/api/ai/danh-gia-nhan-su', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(thamSo)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.loi || data.message || 'Lỗi khi kích hoạt AI đánh giá');
    }

    return data;
  } catch (error: any) {
    return {
      thanh_cong: false,
      loi: error?.message || 'Không thể kết nối đến máy chủ AI'
    };
  }
};

/**
 * Lấy cấu hình AI (dành cho trang Quản trị)
 */
export const layCauHinhAIAdmin = async (): Promise<CauHinhAIGemini> => {
  try {
    const res = await fetch('/api/ai/cau-hinh', { method: 'GET' });
    if (!res.ok) throw new Error('Không thể tải cấu hình AI');
    const data = await res.json();
    return data.cau_hinh || CAU_HINH_AI_MAC_DINH;
  } catch (error) {
    console.error('Lỗi lấy cấu hình AI:', error);
    return CAU_HINH_AI_MAC_DINH;
  }
};

/**
 * Lưu cấu hình AI (dành cho trang Quản trị)
 */
export const luuCauHinhAIAdmin = async (
  cauHinh: Partial<CauHinhAIGemini>
): Promise<{ thanh_cong: boolean; loi?: string }> => {
  try {
    const res = await fetch('/api/ai/cau-hinh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cauHinh)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.loi || 'Không thể lưu cấu hình');
    return { thanh_cong: true };
  } catch (error: any) {
    return { thanh_cong: false, loi: error?.message || 'Lỗi lưu cấu hình AI' };
  }
};

/**
 * Kiểm tra kết nối Gemini API Key
 */
export const kiemTraKetNoiAIAdmin = async (
  apiKey: string,
  model: string = 'gemini-2.0-flash'
): Promise<{ hop_le: boolean; thong_diep: string }> => {
  try {
    const res = await fetch('/api/ai/kiem-tra-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model })
    });
    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      hop_le: false,
      thong_diep: error?.message || 'Lỗi kiểm tra kết nối API Key'
    };
  }
};
