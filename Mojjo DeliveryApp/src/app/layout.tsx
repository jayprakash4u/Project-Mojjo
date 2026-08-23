import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RiderHeader } from '../components/layout/RiderHeader';
import { RiderNavigation } from '../components/layout/RiderNavigation';

export const metadata: Metadata = {
  title: 'Mojjo Rider Partner • Delivery Command',
  description: 'Fast 45-minute quick commerce delivery partner app for Kathmandu Valley',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen pb-20 selection:bg-teal-500/30">
        <div className="max-w-md mx-auto min-h-screen bg-[#090e15] border-x border-slate-800/40 shadow-2xl flex flex-col">
          <RiderHeader />
          <main className="flex-1 p-4">{children}</main>
          <RiderNavigation />
        </div>
      </body>
    </html>
  );
}
