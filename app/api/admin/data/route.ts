import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
function auth(){return cookies().get('sakan_admin')?.value==='1';}
export async function GET(req:Request){
  if(!auth()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const domain=host(req), s=db();
  const [p,b,sec,settings]=await Promise.all([
    s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false}),
    s.from('bookings').select('*,properties(title)').eq('tenant_domain',domain).order('created_at',{ascending:false}),
    s.from('sections').select('*').order('name'),
    s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle()
  ]);
  if(p.error||b.error||sec.error) return NextResponse.json({error:p.error?.message||b.error?.message||sec.error?.message},{status:500});
  return NextResponse.json({domain,properties:p.data||[],bookings:b.data||[],sections:sec.data||[],settings:settings.data||{}},{headers:{'Cache-Control':'no-store'}});
}