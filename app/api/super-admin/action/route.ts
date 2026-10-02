import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { validSessionToken } from '@/lib/sessionAuth';
import { normalizeTenantDomain } from '@/lib/tenant';

const SUPABASE_URL='https://apmopxvwxmwxwgxscbqt.supabase.co';
function db(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY!);}
function isSuperAdmin(){return validSessionToken(cookies().get('sakan_super')?.value,'super');}

export async function POST(req:Request){
  if(!isSuperAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>({})),action=String(body.action||''),s=db();

  if(action==='license_save'){
    const id=body.id?String(body.id):'';
    const domain=normalizeTenantDomain(body.data?.domain);
    if(!domain)return NextResponse.json({error:'الدومين غير صالح. استخدم مثال: sakan-rasalbar.vercel.app'},{status:400});
    const status=['active','suspended','expired'].includes(body.data?.status)?body.data.status:'active';
    const payload={
      client_name:(String(body.data?.customer_name||body.data?.client_name||'').trim()||domain),
      phone:String(body.data?.customer_phone||body.data?.phone||'').trim()||null,
      domain,
      is_active:status==='active',
      expires_at:body.data?.expires_at||null,
      subscription_amount:body.data?.subscription_amount===''||body.data?.subscription_amount==null?null:Number(body.data.subscription_amount),
      payment_status:['paid','unpaid','pending','overdue','waived'].includes(body.data?.payment_status)?body.data.payment_status:'unpaid',
      payment_date:body.data?.payment_date||null,
      payment_method:body.data?.payment_method||null,
      payment_reference:body.data?.payment_reference||null,
      notes:body.data?.notes||null
    };
    let data:any,error:any;
    if(id){
      const result=await s.from('licenses').update(payload).eq('id',id).select().single();
      data=result.data; error=result.error;
    }else{
      const existing=await s.from('licenses').select('id').eq('domain',domain).maybeSingle();
      if(existing.error)return NextResponse.json({error:existing.error.message},{status:500});
      if(existing.data?.id){
        const result=await s.from('licenses').update(payload).eq('id',existing.data.id).select().single();
        data=result.data; error=result.error;
      }else{
        const result=await s.from('licenses').insert(payload).select().single();
        data=result.data; error=result.error;
      }
    }
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({ok:true,license:{...data,customer_name:data.client_name||'',customer_phone:data.phone||'',status:data.is_active===false?'suspended':(data.expires_at&&new Date(data.expires_at).getTime()<Date.now()?'expired':'active')}});
  }

  if(action==='license_delete'){
    const id=String(body.id||'');if(!id)return NextResponse.json({error:'id is required'},{status:400});
    const {error}=await s.from('licenses').delete().eq('id',id);
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({ok:true});
  }

  if(action==='settings_save'){
    const domain=normalizeTenantDomain(body.data?.tenant_domain);
    if(!domain)return NextResponse.json({error:'الدومين غير صالح. استخدم مثال: sakan-rasalbar.vercel.app'},{status:400});
    const payload={
      tenant_domain:domain,
      brand_name:String(body.data?.brand_name||''),
      whatsapp_number:String(body.data?.whatsapp_number||''),
      vodafone_number:String(body.data?.vodafone_number||''),
      instapay_ipn:String(body.data?.instapay_ipn||''),
      logo_url:String(body.data?.logo_url||''),
      brand_edit_locked:true
    };
    const existing=await s.from('settings').select('id').eq('tenant_domain',domain).maybeSingle();
    if(existing.error)return NextResponse.json({error:existing.error.message},{status:500});
    let data:any,error:any;
    if(existing.data?.id){
      const result=await s.from('settings').update(payload).eq('id',existing.data.id).select().single();
      data=result.data; error=result.error;
    }else{
      const result=await s.from('settings').insert(payload).select().single();
      data=result.data; error=result.error;
    }
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({ok:true,settings:data});
  }

  return NextResponse.json({error:'Unknown action'},{status:400});
}