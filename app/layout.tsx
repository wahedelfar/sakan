import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { normalizeTenantDomain } from '@/lib/tenant';

const commonIcons = {
  icon: [
    { url: '/sakan-icon.svg', type: 'image/svg+xml' }
  ],
  apple: [
    { url: '/sakan-icon.svg', type: 'image/svg+xml' }
  ]
};

async function tenantSettings(host: string) {
  const supabase = createClient(
    'https://apmopxvwxmwxwgxscbqt.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from('settings')
    .select('brand_name,logo_url')
    .eq('tenant_domain', host)
    .maybeSingle();
  return data;
}

export async function generateMetadata(): Promise<Metadata>{
  const host=normalizeTenantDomain(headers().get('host')?.split(':')[0] || '') || 'egarat.online';
  const saas=host==='egarat.online'||host==='www.egarat.online';

  if(saas)return{
    metadataBase:new URL('https://egarat.online'),
    title:{default:'سكن | نظام تأجير عقاري جاهز باسمك',template:'%s | سكن'},
    description:'سكن — منصة SaaS مصرية متخصصة في التأجير. استلم موقع حجز للشقق والشاليهات باسم مكتبك مع لوحة تحكم وحجوزات ودفع وتقويم توافر.',
    keywords:['نظام حجز شقق','نظام حجز شاليهات','برنامج إدارة العقارات للإيجار','موقع حجز شقق باسمك','نظام تأجير عقارات','برنامج حجز شاليهات','SaaS للإيجار العقاري في مصر'],
    alternates:{canonical:'https://egarat.online'},
    openGraph:{
      type:'website',
      url:'https://egarat.online',
      siteName:'سكن',
      locale:'ar_EG',
      title:'سكن | نظام تأجير عقاري جاهز باسمك',
      description:'منصة تأجير عقاري جاهزة باسمك — موقع حجز ولوحة تحكم وإدارة للحجوزات والدفع والتوافر.',
      images:[{url:'/opengraph-image?v=2',width:1200,height:630,alt:'سكن — منصة تأجير عقاري'}]
    },
    twitter:{
      card:'summary_large_image',
      title:'سكن | نظام تأجير عقاري جاهز باسمك',
      description:'منصة تأجير عقاري جاهزة باسمك.'
    },
    robots:{index:true,follow:true,googleBot:{index:true,follow:true}},
    icons:commonIcons
  };

  const settings = await tenantSettings(host);
  const brand = settings?.brand_name || 'سكن';
  const canonical = `https://${host}`;

  return{
    metadataBase:new URL(canonical),
    title:`${brand} | شقق وعقارات للإيجار`,
    description:`تصفح العقارات المتاحة لدى ${brand} واحجز إقامتك بسهولة.`,
    alternates:{canonical},
    manifest:'/manifest.webmanifest',
    openGraph:{
      type:'website',
      url:canonical,
      siteName:brand,
      locale:'ar_EG',
      title:`${brand} | شقق وعقارات للإيجار`,
      description:`تصفح العقارات المتاحة لدى ${brand} واحجز إقامتك بسهولة.`,
      images:[{url:'/opengraph-image?v=2',width:1200,height:630,alt:brand}]
    },
    twitter:{
      card:'summary_large_image',
      title:`${brand} | شقق وعقارات للإيجار`,
      description:`تصفح العقارات المتاحة لدى ${brand} واحجز إقامتك بسهولة.`,
      images:['/opengraph-image?v=2']
    },
    robots:{index:true,follow:true,googleBot:{index:true,follow:true}},
    icons:commonIcons
  };
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
