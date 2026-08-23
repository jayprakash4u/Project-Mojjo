'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Smartphone,
  Globe,
  Wallet,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { INITIAL_KPIS } from '../../services/adminData';

export default function AdminAnalyticsPage() {
  const kpis = INITIAL_KPIS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          <span>Omnichannel Revenue & Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Performance insights across Mobile App and Web Storefront channels
        </p>
      </div>

      {/* Platform Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mobile App Performance Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0b2433] p-6 rounded-2xl border border-teal-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Mobile App Channel</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs">
              74% Volume Share
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Daily Revenue</p>
              <p className="text-2xl font-black text-white mt-1">
                रू {kpis.platformSplit.mobileAppRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Orders Completed</p>
              <p className="text-2xl font-black text-teal-400 mt-1">
                {kpis.platformSplit.mobileAppOrders}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-teal-300">📱 Mobile Highlights</p>
            <p>• Fast 1-tap OTP authentication drives high conversion.</p>
            <p>• 88% of users utilize eSewa & Khalti in-app checkout.</p>
          </div>
        </div>

        {/* Web Store Performance Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0b2b24] p-6 rounded-2xl border border-emerald-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Web Storefront</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
              26% Volume Share
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Daily Revenue</p>
              <p className="text-2xl font-black text-white mt-1">
                रू {kpis.platformSplit.webRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Orders Completed</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {kpis.platformSplit.webOrders}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-300">💻 Web Highlights</p>
            <p>• High average order value for bulk grocery orders.</p>
            <p>• Key discovery channel via Google organic search in Nepal.</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Distribution */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-teal-400" />
          <span>Payment Gateway Distribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="font-bold text-sm text-[#41A124]">eSewa Wallet</p>
            <p className="text-2xl font-black text-white mt-1">54%</p>
            <p className="text-[11px] text-slate-500 mt-1">185 transactions verified</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="font-bold text-sm text-[#5D2E8E]">Khalti Wallet</p>
            <p className="text-2xl font-black text-white mt-1">32%</p>
            <p className="text-[11px] text-slate-500 mt-1">109 transactions verified</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <p className="font-bold text-sm text-amber-400">Cash on Delivery</p>
            <p className="text-2xl font-black text-white mt-1">14%</p>
            <p className="text-[11px] text-slate-500 mt-1">48 cash orders collected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
