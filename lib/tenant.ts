export const PRIMARY_DOMAIN = 'sakan-egy.vercel.app';

export function normalizeTenantDomain(value: unknown): string {
  let raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return '';

  // Accept both a hostname and a full URL, but never store the scheme/path.
  raw = raw.split(',')[0].trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  }

  try {
    const hostname = new URL(`https://${raw}`).hostname.toLowerCase();
    if (hostname === 'localhost') return hostname;
    if (!hostname.includes('.')) return '';
    if (hostname.length > 253) return '';
    if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) return '';
    return hostname;
  } catch {
    return '';
  }
}

export function tenantDomainFromRequest(req: Request): string {
  const raw =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    PRIMARY_DOMAIN;
  return normalizeTenantDomain(raw) || PRIMARY_DOMAIN;
}
