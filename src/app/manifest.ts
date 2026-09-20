import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TiniPMS',
    short_name: 'TiniPMS',
    description: 'Hệ thống Quản lý Dự án & Tiến độ Công việc TiniPMS',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#071630',
    theme_color: '#0055d4',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
