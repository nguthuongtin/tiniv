import { adminFirestore } from '@/thu_vien/firebase/admin_firebase';

/**
 * Gửi thông báo trực tiếp về điện thoại qua Telegram Bot
 * Không cần cài thêm database, cấu hình lưu tại cau_hinh_he_thong/telegram
 */
export async function guiThongBaoTelegram(tieuDe: string, noiDung: string, linkWeb?: string) {
  try {
    const db = adminFirestore();
    const snap = await db.collection('cau_hinh_he_thong').doc('telegram').get();
    if (!snap.exists) return;

    const data = snap.data() || {};
    const botToken = data.bot_token;
    const chatId = data.chat_id;
    const batThongBao = data.bat_thong_bao ?? true;

    if (!batThongBao || !botToken || !chatId) {
      return;
    }

    let text = `<b>${tieuDe}</b>\n\n${noiDung}`;
    if (linkWeb) {
      text += `\n\n👉 <a href="${linkWeb}">Bấm để mở trên phần mềm</a>`;
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
  } catch (err) {
    console.warn('[guiThongBaoTelegram] Không thể gửi tin nhắn Telegram:', err);
  }
}
