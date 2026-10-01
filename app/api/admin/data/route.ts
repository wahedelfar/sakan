import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();}
function auth(){return validSessionToken(cookies().get('sakan_admin')?.value,'admin');}

export async function GET(req:Request){
  if(!auth()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const domain=host(req), s=db();
  const [p,b,sec,settings,customers]=await Promise.all([
    s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false}),
    s.from('bookings').select('*,properties(title)').eq('tenant_domain',domain).order('created_at',{ascending:false}),
    s.from('sections').select('*').eq('tenant_domain',domain).order('name'),
    s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle(),
    s.from('customers').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false})
  ]);
  const error=p.error||b.error||sec.error||settings.error||customers.error;
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({domain,properties:p.data||[],bookings:b.data||[],sections:sec.data||[],settings:settings.data||{},customers:customers.data||[]},{headers:{'Cache-Control':'no-store'}});
}