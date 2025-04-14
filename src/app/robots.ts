import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/dashboard/',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap`,
  };
} 