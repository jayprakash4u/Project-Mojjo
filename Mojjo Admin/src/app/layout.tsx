import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';

export const metadata: Metadata = {
  title: 'Mojjo Admin | Unified 10-Min Quick-Commerce Command Center',
  description: 'Unified management portal for Mojjo Web Storefront & Mobile App (Orders, Catalog, Delivery Zones, and Inventory)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
        {/* Left Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto bg-slate-950/60">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
