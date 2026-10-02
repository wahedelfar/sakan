import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tenantDomainFromRequest } from '@/lib/tenant';

export async function GET(req:Request){
  const domain=tenantDomainFromRequest(req);
  const supabase=createClient('https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const {data:license,error:licenseError}=await supabase.from('licenses')
    .select('status,expires_at,is_active')
    .eq('domain',domain)
    .maybeSingle();

  if(licenseError)return NextResponse.json({error:'تعذر التحقق من الاشتراك'},{status:500});

  const activeLicense =
    !!license &&
    license.status !== 'suspended' &&
    license.status !== 'expired' &&
    license.is_active !== false &&
    (!license.expires_at || new Date(license.expires_at).getTime() >= Date.now());

  if(!activeLicense)
    return NextResponse.json({error:'الاشتراك غير نشط أو غير مُفعّل',subscriptionInactive:true},{status:403});

  const {data,error}=await supabase.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();

  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(
    data||{brand_name:'سكن',tenant_domain:domain},
    {headers:{'Cache-Control':'no-store'}}
  );
}