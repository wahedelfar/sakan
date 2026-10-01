import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_DOMAIN = 'sakan-egy.vercel.app';

function host(req:Request){
  return (req.headers.get('x-forwarded-host')||req.headers.get('host')||PRIMARY_DOMAIN).split(':')[0].toLowerCase();
}

export async function GET(req:Request){
  const domain=host(req);
  const supabase=createClient('https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let {data,error}=await supabase.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();

  // Preserve the original store configuration for the primary domain only.
  if(!data && !error && domain===PRIMARY_DOMAIN){
    const fallback=await supabase.from('settings').select('*').is('tenant_domain',null).order('created_at',{ascending:false}).maybeSingle();
    data=fallback.data;
    error=fallback.error;
  }

  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data||{brand_name:'سكن',tenant_domain:domain},{headers:{'Cache-Control':'no-store'}});
}
