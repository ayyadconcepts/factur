import type { MetadataRoute } from 'next';

const BASE_URL = 'https://facturxfacile.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/history/',
          '/checkout/',
          '/api/',
          '/auth/',
          '/(auth)/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
