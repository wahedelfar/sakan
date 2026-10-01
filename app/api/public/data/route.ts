import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_DOMAIN = 'sakan-egy.vercel.app';

function db(){return createClient('https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||PRIMARY_DOMAIN).split(':')[0].toLowerCase();}

export async function GET(req:Request){
  const domain=host(req),s=db();
  const {data:lic}=await s.from('licenses').select('status,expires_at,is_active').eq('domain',domain).maybeSingle();
  const inactive = lic && (
    (lic.status && lic.status!=='active') ||
    (lic.is_active===false) ||
    (lic.expires_at&&new Date(lic.expires_at).getTime()<Date.now())
  );
  if(inactive)
    return NextResponse.json({error:'الاشتراك غير نشط أو منتهي',subscriptionInactive:true},{status:403});

  // Legacy compatibility: existing records created before multi-tenant isolation
  // remain visible ONLY on the original primary domain. Other tenants never get this fallback.
  const legacy = domain===PRIMARY_DOMAIN;

  const propertyQuery = s.from('properties').select('*').order('created_at',{ascending:false});
  const bookingQuery = s.from('bookings').select('id,property_id,check_in,check_out,status,arrival_time').in('status',['مؤكد','معلق']);
  const sectionQuery = s.from('sections').select('*').order('name');
  const settingsQuery = s.from('settings').select('*').maybeSingle();

  const [p,b,sec,settings]=await Promise.all([
    legacy
      ? propertyQuery.or(`tenant_domain.eq.${domain},tenant_domain.is.null`)
      : propertyQuery.eq('tenant_domain',domain),
    legacy
      ? bookingQuery.or(`tenant_domain.eq.${domain},tenant_domain.is.null`)
      : bookingQuery.eq('tenant_domain',domain),
    legacy
      ? sectionQuery.or(`tenant_domain.eq.${domain},tenant_domain.is.null`)
      : sectionQuery.eq('tenant_domain',domain),
    settingsQuery.eq('tenant_domain',domain)
  ]);

  let brand=settings.data;
  if(!brand && legacy){
    const fallback=await s.from('settings').select('*').is('tenant_domain',null).order('created_at',{ascending:false}).maybeSingle();
    brand=fallback.data;
  }

  if(p.error||b.error||sec.error||settings.error)
    return NextResponse.json({error:p.error?.message||b.error?.message||sec.error?.message||settings.error?.message},{status:500});

  return NextResponse.json({
    properties:p.data||[],
    bookings:b.data||[],
    sections:sec.data||[],
    settings:brand||{brand_name:'سكن',tenant_domain:domain}
  },{headers:{'Cache-Control':'no-store'}});
}
