import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const USER = process.env.SAKAN_SUPER_USER || 'waheed';
const PASSWORD_HASH = process.env.SAKAN_SUPER_PASSWORD_SHA256 || 'bc6eedbe7460d03724f47de7d560628c03796b3b63231475c698a43b9c86a029';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const hash = createHash('sha256').update(String(body.password || '')).digest('hex');
  if (body.username !== USER || hash !== PASSWORD_HASH) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('sakan_super', '1', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return response;
}
