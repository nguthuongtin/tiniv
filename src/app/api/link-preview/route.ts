import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function nhanDienLoaiLienKet(urlStr: string): string {
  const u = urlStr.toLowerCase();
  if (u.includes('docs.google.com/spreadsheets') || u.includes('.xlsx') || u.includes('.csv')) {
    return 'google_sheets';
  }
  if (u.includes('docs.google.com/document') || u.includes('.docx')) {
    return 'google_docs';
  }
  if (u.includes('docs.google.com/presentation') || u.includes('.pptx')) {
    return 'google_slides';
  }
  if (u.includes('drive.google.com')) {
    return 'google_drive';
  }
  if (u.includes('figma.com')) {
    return 'figma';
  }
  if (u.includes('canva.com')) {
    return 'canva';
  }
  if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('vimeo.com') || u.includes('tiktok.com')) {
    return 'video';
  }
  if (u.endsWith('.pdf') || u.includes('.pdf?')) {
    return 'pdf';
  }
  return 'trang_web';
}

function layDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function lamSachChuoi(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function donDepTieuDe(tieuDe: string): string {
  let clean = lamSachChuoi(tieuDe);
  clean = clean
    .replace(/\s*-\s*Google (Tài liệu|Docs|Trang tính|Sheets|Trang trình bày|Slides|Drive|Biểu mẫu|Forms).*$/i, '')
    .replace(/\s*\|\s*Figma.*$/i, '')
    .replace(/\s*-\s*YouTube$/i, '')
    .replace(/\s*\|\s*Canva.*$/i, '')
    .replace(/\s*-\s*Notion.*$/i, '')
    .replace(/\s*\|\s*Jira.*$/i, '')
    .trim();

  if (
    clean.includes('Google Docs: Free Online Document') ||
    clean.includes('Google Sheets: Online Spreadsheet') ||
    clean.includes('Google Drive: Sign-in') ||
    clean.includes('Đăng nhập - Tài khoản Google') ||
    clean.includes('Sign in - Google Accounts')
  ) {
    return '';
  }

  return clean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const urlRaw = String(body?.url || '').trim();

    if (!urlRaw || (!urlRaw.startsWith('http://') && !urlRaw.startsWith('https://'))) {
      return NextResponse.json(
        { thanh_cong: false, thong_diep: 'Đường dẫn không hợp lệ. Vui lòng có https://' },
        { status: 400 }
      );
    }

    const domain = layDomain(urlRaw);
    const loaiDuDoan = nhanDienLoaiLienKet(urlRaw);
    let tieuDe = '';
    const iconFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(urlRaw, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8'
        },
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const html = await res.text();
          const ogTitleMatch =
            html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const rawTieuDe = (ogTitleMatch?.[1] || titleMatch?.[1] || '').trim();
          tieuDe = donDepTieuDe(rawTieuDe);
        }
      }
    } catch {
      // Bỏ qua lỗi fetch, người dùng tự điền nếu link riêng tư
    }

    if (!tieuDe) {
      if (loaiDuDoan === 'google_sheets') tieuDe = 'Bảng tính Google Sheets';
      else if (loaiDuDoan === 'google_docs') tieuDe = 'Tài liệu Google Docs';
      else if (loaiDuDoan === 'google_drive') tieuDe = 'Thư mục Google Drive';
      else if (loaiDuDoan === 'figma') tieuDe = 'Bản vẽ Figma';
      else if (loaiDuDoan === 'canva') tieuDe = 'Thiết kế Canva';
      else if (loaiDuDoan === 'pdf') tieuDe = 'Tài liệu PDF';
      else tieuDe = domain || 'Tài liệu liên kết';
    }

    // Chỉ trả về tiêu đề và loại file
    return NextResponse.json({
      thanh_cong: true,
      du_lieu: {
        tieu_de: tieuDe,
        loai_lien_ket: loaiDuDoan,
        favicon: iconFavicon,
        domain
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { thanh_cong: false, thong_diep: error?.message || 'Lỗi xử lý link' },
      { status: 500 }
    );
  }
}
