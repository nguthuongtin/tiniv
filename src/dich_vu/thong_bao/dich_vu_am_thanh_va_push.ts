'use client';

/**
 * Phát âm thanh thông báo "Ting" trong trẻo, sang trọng bằng Web Audio API
 * Hoạt động 100% native trên mọi trình duyệt (Desktop, Android, iOS), không cần tải file MP3
 */
export function phatChuongThongBao() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Hợp âm Arpeggio Đô - Mi - Sol (C5 - E5 - G5) thanh lịch
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, t + 0.16); // G5

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  } catch {
    // Trình duyệt có thể chặn âm thanh nếu chưa có tương tác đầu tiên
  }
}

/**
 * Phát thông báo nổi ra hệ điều hành / thanh thông báo điện thoại (Web Push & Notification API)
 */
export function phatThongBaoTrinhDuyet(tieuDe: string, noiDung: string, duongDan: string = '/ke-hoach') {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    // 1. Nếu có Service Worker (PWA Mobile Android / iOS)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(tieuDe, {
            body: noiDung,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: { url: duongDan }
          } as any);
        })
        .catch(() => {
          taoNotificationDonGian(tieuDe, noiDung, duongDan);
        });
    } else {
      taoNotificationDonGian(tieuDe, noiDung, duongDan);
    }
  }
}

function taoNotificationDonGian(tieuDe: string, noiDung: string, duongDan: string) {
  try {
    const notif = new Notification(tieuDe, {
      body: noiDung,
      icon: '/icon-192x192.png'
    });
    notif.onclick = () => {
      window.focus();
      window.location.href = duongDan;
      notif.close();
    };
  } catch {}
}

import { VAPID_PUBLIC_KEY } from './cau_hinh_web_push';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Đăng ký Push Token với hệ điều hành điện thoại & lưu về server
 */
export async function dangKyNhanPushNen(userId: string): Promise<boolean> {
  if (typeof window === 'undefined' || !userId) return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.pushManager) return false;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    if (sub) {
      await fetch('/api/thong-bao/dang-ky-thiet-bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          subscription: sub.toJSON(),
          thiet_bi: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        })
      });
      return true;
    }
  } catch (err) {
    console.warn('[WebPush] Lỗi đăng ký nhận Push nền:', err);
  }
  return false;
}

/**
 * Yêu cầu người dùng cấp quyền thông báo trên thiết bị & tự động liên kết Push nền
 */
export async function xinQuyenThongBaoTrinhDuyet(userId?: string): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      phatThongBaoTrinhDuyet(
        'TiniPMS',
        'Đã bật thông báo thành công trên thiết bị của bạn!'
      );
      if (userId) {
        void dangKyNhanPushNen(userId);
      }
    }
    return permission;
  } catch {
    return 'denied';
  }
}
