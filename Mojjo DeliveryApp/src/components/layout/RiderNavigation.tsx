'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bike, Wallet, User, History } from 'lucide-react';

export const RiderNavigation: React.FC = () => {
  const pathname = usePathname();

  const tabs = [
    { name: 'Deliveries', href: '/', icon: Bike },
    { name: 'Earnings', href: '/earnings', icon: Wallet },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-300 font-semibold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
