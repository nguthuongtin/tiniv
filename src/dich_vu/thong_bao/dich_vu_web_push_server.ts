import webpush from 'web-push';
import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';
import {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT
} from './cau_hinh_web_push';

// Thiết lập thông tin VAPID cho máy chủ
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('[WebPush] Lỗi thiết lập VAPID details:', e);
}

export interface ThongBaoPushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
}

/**
 * Gửi thông báo Web Push trực tiếp tới thiết bị điện thoại (kể cả khi đã đóng app/khóa màn hình)
 */
export async function guiWebPushChoNhanSu(
  danhSachUserId: string[],
  tieuDe: string,
  noiDung: string,
  urlWeb: string = '/ke-hoach'
) {
  if (!Array.isArray(danhSachUserId) || danhSachUserId.length === 0) return;

  const db = adminFirestore();
  const payload: ThongBaoPushPayload = {
    title: tieuDe,
    body: noiDung,
    url: urlWeb,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };
  const payloadString = JSON.stringify(payload);

  try {
    // Tìm các token thiết bị thuộc danh sách user này
    // Firebase `in` query hỗ trợ tối đa 30 phần tử
    const batches: string[][] = [];
    for (let i = 0; i < danhSachUserId.length; i += 25) {
      batches.push(danhSachUserId.slice(i, i + 25));
    }

    const cacThietBi: { id: string; subscription: any }[] = [];

    for (const batch of batches) {
      const snap = await db
        .collection('thiet_bi_thong_bao')
        .where('user_id', 'in', batch)
        .where('trang_thai', '==', 'hoat_dong')
        .get();

      snap.forEach((doc) => {
        const d = doc.data();
        if (d?.subscription && d.subscription.endpoint) {
          cacThietBi.push({ id: doc.id, subscription: d.subscription });
        }
      });
    }

    if (cacThietBi.length === 0) return;

    // Gửi đồng loạt tới các thiết bị
    await Promise.all(
      cacThietBi.map(async ({ id, subscription }) => {
        try {
          await webpush.sendNotification(subscription, payloadString);
        } catch (err: any) {
          // Nếu token đã hết hạn hoặc người dùng gỡ app (404/410) -> xóa để tiết kiệm tài nguyên
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            try {
              await db.collection('thiet_bi_thong_bao').doc(id).delete();
            } catch {}
          }
        }
      })
    );
  } catch (error) {
    console.warn('[WebPush] Lỗi gửi thông báo nền:', error);
  }
}
