import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sakan-egy.vercel.app';
  return [
    { url: base, lastModified: new Date() },
    { url: base + '/terms', lastModified: new Date() },
    { url: base + '/rules', lastModified: new Date() },
    { url: base + '/privacy', lastModified: new Date() },
    { url: base + '/cancellation', lastModified: new Date() },
  ];
}
