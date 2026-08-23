'use client';

import React from 'react';
import {
  Search,
  Bell,
  Store,
  Wifi,
  ChevronDown,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Active Dark Store Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
          <Store className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Active Dark Store: <strong>Lalitpur Hub 1 (Jhamsikhel)</strong></span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span>Syncing Live: Web & Mobile App Orders</span>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Global Admin Search */}
        <div className="relative hidden sm:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, SKU, customers..."
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Live Clock / Nepal Time */}
        <div className="text-right hidden lg:block border-l border-slate-200 dark:border-slate-800 pl-4">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Kathmandu, Nepal</p>
          <p className="text-[11px] text-slate-500 font-mono">10-Min Delivery Peak</p>
        </div>
      </div>
    </header>
  );
};
