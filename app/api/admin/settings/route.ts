export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  if (searchParams.get('all') === '1') {
    const { data } = await supabase.from('settings').select('*').order('tenant_domain')
    return NextResponse.json(data || [])
  }
  return NextResponse.json({})
}

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const domain = body.tenant_domain || req.headers.get('host') || 'sakan-egy.vercel.app'
  const { data: old } = await supabase.from('settings').select('id').eq('tenant_domain', domain).maybeSingle()
  let res
  if (old?.id) {
    res = await supabase.from('settings').update({
      brand_name: body.brand_name,
      whatsapp_number: body.whatsapp_number,
      vodafone_number: body.vodafone_number,
      instapay_ipn: body.instapay_ipn,
      tenant_domain: domain
    }).eq('id', old.id).select().single()
  } else {
    res = await supabase.from('settings').insert({
      brand_name: body.brand_name,
      whatsapp_number: body.whatsapp_number,
      vodafone_number: body.vodafone_number,
      instapay_ipn: body.instapay_ipn,
      tenant_domain: domain
    }).select().single()
  }
  return NextResponse.json(res.data || {}, {headers: {'Cache-Control':'no-store'}})
}
