'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Star,
  ShoppingBag,
  Smartphone,
  Globe,
  MapPin,
  Award,
  Phone,
  Calendar,
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpentNpr: number;
  loyaltyCoins: number;
  primaryArea: string;
  platform: 'MobileApp' | 'Web';
  isAgeVerified: boolean;
  joinedDate: string;
}

const SAMPLE_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c-1',
    name: 'Jay Prakash Yadav',
    phone: '9841234567',
    email: 'jay@example.com',
    totalOrders: 28,
    totalSpentNpr: 74800,
    loyaltyCoins: 840,
    primaryArea: 'Jhamsikhel, Lalitpur',
    platform: 'MobileApp',
    isAgeVerified: true,
    joinedDate: 'Jan 2026',
  },
  {
    id: 'c-2',
    name: 'Aayush Maharjan',
    phone: '9818765432',
    email: 'aayush.m@example.com',
    totalOrders: 14,
    totalSpentNpr: 32400,
    loyaltyCoins: 420,
    primaryArea: 'Sanepa, Lalitpur',
    platform: 'Web',
    isAgeVerified: true,
    joinedDate: 'Feb 2026',
  },
  {
    id: 'c-3',
    name: 'Sunita Thapa',
    phone: '9849988776',
    email: 'sunita.t@example.com',
    totalOrders: 19,
    totalSpentNpr: 46200,
    loyaltyCoins: 580,
    primaryArea: 'Pulchowk, Lalitpur',
    platform: 'MobileApp',
    isAgeVerified: true,
    joinedDate: 'Jan 2026',
  },
  {
    id: 'c-4',
    name: 'Bikash Adhikari',
    phone: '9803344556',
    email: 'bikash@example.com',
    totalOrders: 6,
    totalSpentNpr: 18500,
    loyaltyCoins: 190,
    primaryArea: 'New Baneshwor, Kathmandu',
    platform: 'Web',
    isAgeVerified: false,
    joinedDate: 'Mar 2026',
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SAMPLE_CUSTOMERS.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.primaryArea.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-400" />
            <span>Customers & VIP Members</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Omnichannel buyer directory, loyalty coin balance & 18+ age verification status
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search customer by name, phone (+977...), or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden flex-1"
        />
        <span className="text-xs text-slate-400 mr-2 font-medium">
          {filtered.length} Registered Buyers
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Customer Profile</th>
                <th className="px-5 py-3.5">Primary Area</th>
                <th className="px-5 py-3.5">Total Orders</th>
                <th className="px-5 py-3.5">Lifetime Value (LTV)</th>
                <th className="px-5 py-3.5">Mojjo Coins</th>
                <th className="px-5 py-3.5">18+ KYC Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{c.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">+977 {c.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{c.primaryArea}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-white">
                    {c.totalOrders} Orders
                  </td>

                  <td className="px-5 py-3.5 font-black text-emerald-400">
                    रू {c.totalSpentNpr.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      🪙 {c.loyaltyCoins}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        c.isAgeVerified
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {c.isAgeVerified ? '✓ 18+ Verified' : 'Pending Verification'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
