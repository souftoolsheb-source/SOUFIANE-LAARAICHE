import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WhatsApp Bot Pro | لوحة تحكم وأتمتة واتساب',
  description:
    'منصة احترافية لإدارة وأتمتة بوت واتساب الشخصي، ربط الحساب برمز الاقتران، إدارة التنزيلات الذكية، ومراقبة النشاط اللحظي.',
  openGraph: {
    title: 'WhatsApp Bot Pro | لوحة تحكم وأتمتة واتساب',
    description:
      'منصة احترافية لإدارة وأتمتة بوت واتساب الشخصي، ربط الحساب برمز الاقتران، إدارة التنزيلات الذكية، ومراقبة النشاط اللحظي.',
    type: 'website',
    locale: 'ar_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Bot Pro | لوحة تحكم وأتمتة واتساب',
    description:
      'منصة احترافية لإدارة وأتمتة بوت واتساب الشخصي، ربط الحساب برمز الاقتران، إدارة التنزيلات الذكية، ومراقبة النشاط اللحظي.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
