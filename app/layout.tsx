import type { Metadata } from 'next';
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google';
import './globals.css';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

const notoSansKr = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pnu-observation-hub.seung1100.chatgpt.site'),
  title: {
    default: 'PNU 통합 관측자료 플랫폼',
    template: '%s | PNU 관측자료',
  },
  description: '갯벌·농림을 시작으로 다양한 현장·드론·위성 관측자료를 날짜와 위치로 탐색하는 공개 데이터 플랫폼',
  openGraph: {
    title: 'PNU 통합 관측자료 플랫폼',
    description: '현장 · 드론 · 항공 · 위성 데이터를 한곳에서',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PNU 통합 관측자료 플랫폼' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNU 통합 관측자료 플랫폼',
    description: '현장 · 드론 · 항공 · 위성 데이터를 한곳에서',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
