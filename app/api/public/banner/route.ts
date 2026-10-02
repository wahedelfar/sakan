import { NextResponse } from 'next/server';
import { tenantDomainFromRequest } from '@/lib/tenant';

export async function GET(req:Request){
  const domain=tenantDomainFromRequest(req);
  const url='https://apmopxvwxmwxwgxscbqt.supabase.co/storage/v1/object/public/property-images/'+encodeURIComponent(domain)+'/branding/header-banner';
  return NextResponse.redirect(url,{status:302});
}
