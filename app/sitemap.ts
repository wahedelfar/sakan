import type { MetadataRoute } from 'next';
export default function sitemap():MetadataRoute.Sitemap{
  const base='https://egarat.online';
  return[{url:base,lastModified:new Date(),changeFrequency:'weekly',priority:1},{url:base+'/#features',lastModified:new Date(),changeFrequency:'monthly',priority:.8},{url:base+'/#demos',lastModified:new Date(),changeFrequency:'weekly',priority:.8},{url:base+'/#pricing',lastModified:new Date(),changeFrequency:'monthly',priority:.9}];
}
