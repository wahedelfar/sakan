import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function host(req:Request){
  return (req.headers.get('x-forwarded-host')||req.headers.get('host')||'sakan-egy.vercel.app').split(':')[0].toLowerCase();
}

export async function GET(req:Request){
  const domain=host(req);
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const {data,error}=await supabase.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data||{brand_name:'سكن',tenant_domain:domain},{headers:{'Cache-Control':'no-store'}});
}
