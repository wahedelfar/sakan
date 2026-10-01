import { createHmac, timingSafeEqual } from 'crypto';

type SessionRole = 'admin' | 'super';

function secret() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return value;
}

export function sessionToken(role: SessionRole) {
  const signature = createHmac('sha256', secret()).update(role).digest('base64url');
  return `${role}.${signature}`;
}

export function validSessionToken(value: string | undefined, role: SessionRole) {
  if (!value) return false;
  const expected = sessionToken(role);
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
