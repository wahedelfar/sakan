import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { normalizeTenantDomain } from '@/lib/tenant';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = normalizeTenantDomain(headers().get('host')?.split(':')[0] || '') || 'egarat.online';
  const base = `https://${host}`;
  const isSaaS = host === 'egarat.online' || host === 'www.egarat.online';

  if (isSaaS) {
    return [
      { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
      { url: `${base}/#features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
      { url: `${base}/#demos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${base}/#pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ];
  }

  // The tenant UI currently exposes property details in an on-page modal,
  // not at a public /property/:id URL. Keep the sitemap conservative:
  // emit only URLs that actually exist and are publicly indexable.
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ];
}
