import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chasing Cats Club',
    short_name: 'Chasing Cats',
    description: 'The premier membership community for wildlife photography enthusiasts learning about wild cats.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F1E3',
    theme_color: '#0a0a1a',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
