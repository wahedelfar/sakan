import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { tenantDomainFromRequest } from '@/lib/tenant';

function db(){return createClient('https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}

export async function GET(req:Request){
  const domain=tenantDomainFromRequest(req),s=db();

  const {data:lic,error:licenseError}=await s.from('licenses')
    .select('status,expires_at,is_active')
    .eq('domain',domain)
    .maybeSingle();

  if(licenseError)return NextResponse.json({error:'تعذر التحقق من الاشتراك'},{status:500});

  const activeLicense =
    !!lic &&
    lic.status !== 'suspended' &&
    lic.status !== 'expired' &&
    lic.is_active !== false &&
    (!lic.expires_at || new Date(lic.expires_at).getTime() >= Date.now());

  if(!activeLicense)
    return NextResponse.json({error:'الاشتراك غير نشط أو غير مُفعّل',subscriptionInactive:true},{status:403});

  const p=await s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false});
  const b=await s.from('bookings').select('id,property_id,check_in,check_out,status,arrival_time').eq('tenant_domain',domain).in('status',['مؤكد','معلق']);
  const sec=await s.from('sections').select('*').eq('tenant_domain',domain).order('name');
  const settings=await s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();

  const error=p.error||b.error||sec.error||settings.error;
  if(error)return NextResponse.json({error:error.message},{status:500});

  return NextResponse.json({
    properties:p.data||[],
    bookings:b.data||[],
    sections:sec.data||[],
    settings:settings.data||{brand_name:'سكن',tenant_domain:domain}
  },{headers:{'Cache-Control':'no-store'}});
}