import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'سكن — منصة تأجير عقاري';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{
      width:'100%',
      height:'100%',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'#000'
    }}>
      <img
        src="https://egarat.online/sakan-icon.svg"
        width="540"
        height="540"
        style={{objectFit:'contain'}}
      />
    </div>,
    size
  );
}
