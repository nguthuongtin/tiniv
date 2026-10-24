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

/**
 * Yêu cầu người dùng cấp quyền thông báo trên thiết bị
 */
export async function xinQuyenThongBaoTrinhDuyet(): Promise<NotificationPermission> {
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
    }
    return permission;
  } catch {
    return 'denied';
  }
}
