import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tini PMS - Hệ thống Quản trị Dự án',
    short_name: 'Tini PMS',
    description: 'Hệ thống quản trị dự án và hồ sơ dự án chuyên nghiệp',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2F2F7',
    theme_color: '#007AFF',
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
        purpose: 'maskable',
      },
    ],
  };
}
