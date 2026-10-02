import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سكن',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/api/public/app-icon?size=192',
    apple: '/api/public/app-icon?size=192'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
