import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ReduxProvider from '@/lib/redux/Provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Top Performance — Todo',
  description: 'A high-end, blazing-fast Todo experience powered by Next.js + Redux Toolkit.',
  applicationName: 'Top Performance Todo',
  authors: [{ name: 'Magma Software House' }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
