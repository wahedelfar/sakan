import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{
  return{rules:[{userAgent:'*',allow:'/'}],sitemap:'https://egarat.online/sitemap.xml',host:'https://egarat.online'};
}
