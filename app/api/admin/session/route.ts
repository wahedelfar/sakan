import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validSessionToken } from '@/lib/sessionAuth';

export async function GET() {
  return NextResponse.json({ ok: validSessionToken(cookies().get('sakan_admin')?.value, 'admin') });
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('sakan_admin', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
  return res;
}
