import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'sakan-egy.vercel.app';
  
  // بيانات افتراضية لحد ما نجيبها من supabase لو عايز
  const clientName = searchParams.get('title') || 'سكن';
  const area = searchParams.get('area') || 'مصر';

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111',
        color: '#D4AF37',
        fontSize: 60,
        fontWeight: 800,
      }}>
        {clientName} - {area}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
