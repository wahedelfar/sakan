import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const commonIcons = { icon:'/sakan-icon.svg', apple:'/sakan-icon.svg' };

export async function generateMetadata(): Promise<Metadata>{
  const host=headers().get('host')?.split(':')[0].toLowerCase()||'';
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
      url:`https://${host || 'egarat.online'}`,
      siteName:'سكن',
      locale:'ar_EG',
      title:'سكن | نظام تأجير عقاري جاهز باسمك',
      description:'منصة تأجير عقاري جاهزة باسمك — موقع حجز ولوحة تحكم وإدارة للحجوزات والدفع والتوافر.',
      images:[{url:'/share-preview',width:1200,height:630,alt:'سكن — منصة تأجير عقاري'}]
    },
    twitter:{
      card:'summary_large_image',
      title:'سكن | نظام تأجير عقاري جاهز باسمك',
      description:'منصة تأجير عقاري جاهزة باسمك.'
    },
    robots:{index:true,follow:true,googleBot:{index:true,follow:true}},
    icons:commonIcons
  };

  return{
    metadataBase:new URL(`https://${host || 'egarat.online'}`),
    title:'سكن',
    description:'منصة سكن للتأجير العقاري.',
    manifest:'/manifest.webmanifest',
    openGraph:{
      type:'website',
      siteName:'سكن',
      locale:'ar_EG',
      title:'سكن',
      description:'منصة سكن للتأجير العقاري.',
      images:[{url:'/share-preview',width:1200,height:630,alt:'سكن'}]
    },
    twitter:{card:'summary_large_image',title:'سكن',images:['/share-preview']},
    icons:commonIcons
  };
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
