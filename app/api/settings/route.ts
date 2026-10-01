import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://apmopxvwxmwxwgxscbqt.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_XY3KDQqMY0YkqqvceRQI4g_tjcaZgsG'
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle()

  return NextResponse.json(data || {}, {
    headers: { 'Cache-Control': 'no-store, max-age=0' }
  })
}
