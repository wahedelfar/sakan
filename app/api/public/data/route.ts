import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_DOMAIN='sakan-egy.vercel.app';

function db(){return createClient('https://apmopxvwxmwxwgxscbqt.supabase.co',process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function host(req:Request){return (req.headers.get('x-forwarded-host')||req.headers.get('host')||PRIMARY_DOMAIN).split(':')[0].toLowerCase();}

export async function GET(req:Request){
  const domain=host(req),s=db();
  const {data:lic}=await s.from('licenses').select('status,expires_at,is_active').eq('domain',domain).maybeSingle();
  if(lic&&((lic.status&&lic.status!=='active')||lic.is_active===false||(lic.expires_at&&new Date(lic.expires_at).getTime()<Date.now())))
    return NextResponse.json({error:'الاشتراك غير نشط أو منتهي',subscriptionInactive:true},{status:403});

  const legacy=domain===PRIMARY_DOMAIN;
  let p=await s.from('properties').select('*').eq('tenant_domain',domain).order('created_at',{ascending:false});
  let b=await s.from('bookings').select('id,property_id,check_in,check_out,status,arrival_time').eq('tenant_domain',domain).in('status',['مؤكد','معلق']);
  let sec=await s.from('sections').select('*').eq('tenant_domain',domain).order('name');
  let settings=await s.from('settings').select('*').eq('tenant_domain',domain).maybeSingle();

  if(legacy){
    if(!p.data?.length&&!p.error)p=await s.from('properties').select('*').is('tenant_domain',null).order('created_at',{ascending:false});
    if(!b.data?.length&&!b.error)b=await s.from('bookings').select('id,property_id,check_in,check_out,status,arrival_time').is('tenant_domain',null).in('status',['مؤكد','معلق']);
    if(!sec.data?.length&&!sec.error)sec=await s.from('sections').select('*').is('tenant_domain',null).order('name');
    if(!settings.data&&!settings.error)settings=await s.from('settings').select('*').is('tenant_domain',null).order('created_at',{ascending:false}).maybeSingle();
  }

  const error=p.error||b.error||sec.error||settings.error;
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({properties:p.data||[],bookings:b.data||[],sections:sec.data||[],settings:settings.data||{brand_name:'سكن',tenant_domain:domain}},{headers:{'Cache-Control':'no-store'}});
}
