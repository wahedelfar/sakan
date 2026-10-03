import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const host = headers().get('host')?.split(':')[0].toLowerCase() || 'egarat.online';
  const base = `https://${host}`;

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
