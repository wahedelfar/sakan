import { ImageResponse } from 'next/og';
import { supabase } from '../../../lib/supabaseClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const domain = (url.searchParams.get('domain') || 'sakan-egy.vercel.app').split(':')[0].toLowerCase();

  const { data: brand } = await supabase
    .from('settings')
    .select('*')
    .eq('tenant_domain', domain)
    .maybeSingle();

  const clientName = brand?.client_name || brand?.brand_name || 'سكن';
  const area = brand?.area || brand?.location || 'مصر';
  const logoUrl = brand?.logo_url || '';

  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #090a0c 0%, #17130a 100%)',
          color: '#fff',
          fontFamily: 'Arial',
          textAlign: 'center',
          padding: '60px'
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            width="180"
            height="180"
            style={{ objectFit: 'contain', borderRadius: '28px', marginBottom: '28px' }}
          />
        ) : (
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '28px',
              background: '#D4AF37',
              color: '#090a0c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '86px',
              fontWeight: 800,
              marginBottom: '28px'
            }}
          >
            س
          </div>
        )}
        <div style={{ fontSize: '54px', fontWeight: 800, marginBottom: '18px' }}>
          {clientName}
        </div>
        <div style={{ fontSize: '34px', color: '#D4AF37' }}>
          شقق للايجار في {area}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
