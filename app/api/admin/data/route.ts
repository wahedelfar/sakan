import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';

const PRIMARY_DOMAIN='sakan-egy.vercel.app';

function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||PRIMARY_DOMAIN).split(':')[0].toLowerCase();}
function auth(){return validSessionToken(cookies().get('sakan_admin')?.value,'admin');}

export async function GET(req:Request){
  if(!auth())return NextResponse.json({error:'Unauthorized'},{status:401});
  const domain=host(req),s=db(),legacy=domain===PRIMARY_DOMAIN;

  let p=await s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false});
  let b=await s.from('bookings').select('*,properties(title)').eq('tenant_domain',domain).order('created_at',{ascending:false});
  let sec=await s.from('sections').select('*').eq('tenant_domain',domain).order('name');
  const settings=await s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();
  const customers=await s.from('customers').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false});

  if(legacy){
    if(!p.data?.length&&!p.error)p=await s.from('properties').select('*').is('tenant_domain',null).order('created_at',{ascending:false});
    if(!b.data?.length&&!b.error)b=await s.from('bookings').select('*,properties(title)').is('tenant_domain',null).order('created_at',{ascending:false});
    if(!sec.data?.length&&!sec.error)sec=await s.from('sections').select('*').is('tenant_domain',null).order('name');
  }

  let brand=settings.data;
  if(!brand&&!settings.error&&legacy){
    const fallback=await s.from('settings').select('*').is('tenant_domain',null).order('created_at',{ascending:false}).maybeSingle();
    brand=fallback.data;
  }

  const error=p.error||b.error||sec.error||settings.error||customers.error;
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({domain,properties:p.data||[],bookings:b.data||[],sections:sec.data||[],settings:brand||{},customers:customers.data||[]},{headers:{'Cache-Control':'no-store'}});
}