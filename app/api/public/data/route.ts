import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
export async function GET(req:Request){
 const domain=host(req),s=db();
 const [p,b,sec,settings]=await Promise.all([
  s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false}),
  s.from('bookings').select('id,property_id,check_in,check_out,status,customer_phone,arrival_time').eq('tenant_domain',domain).in('status',['مؤكد','معلق']),
  s.from('sections').select('*').order('name'),
  s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle()
 ]);
 if(p.error||b.error||settings.error)return NextResponse.json({error:p.error?.message||b.error?.message||settings.error?.message},{status:500});
 return NextResponse.json({properties:p.data||[],bookings:b.data||[],sections:sec.data||[],settings:settings.data||{}},{headers:{'Cache-Control':'no-store'}});
}