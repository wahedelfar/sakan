export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const host = searchParams.get('domain') || req.headers.get('host') || 'sakan-egy.vercel.app'
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  
  // يحاول يجيب اعدادات الدومين ده، لو ملقاش يجيب اول واحد
  let { data } = await supabase.from('settings').select('*').eq('tenant_domain', host).maybeSingle()
  if (!data) {
    const { data: fallback } = await supabase.from('settings').select('*').order('created_at',{ascending:false}).limit(1).maybeSingle()
    data = fallback
  }
  return NextResponse.json(data || {}, {headers: {'Cache-Control':'no-store'}})
}
