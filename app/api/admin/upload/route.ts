import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
export async function POST(req:Request){
  if(!validSessionToken(cookies().get('sakan_admin')?.value,'admin'))return NextResponse.json({error:'Unauthorized'},{status:401});
  const domain=host(req),body=await req.json().catch(()=>({}));
  if(!body.name||!body.base64)return NextResponse.json({error:'ملف غير صالح'},{status:400});
  const buf=Buffer.from(String(body.base64).split(',').pop()||'','base64');
  if(buf.length>8*1024*1024)return NextResponse.json({error:'حجم الصورة أكبر من 8MB'},{status:400});
  const safe=String(body.name).replace(/[^a-zA-Z0-9._-]/g,'_');
  const path=domain+'/properties/'+Date.now()+'-'+safe;
  const s=db(),u=await s.storage.from('property-images').upload(path,buf,{contentType:body.type||'image/jpeg',upsert:false});
  if(u.error)return NextResponse.json({error:u.error.message},{status:400});
  return NextResponse.json({url:s.storage.from('property-images').getPublicUrl(path).data.publicUrl});
}