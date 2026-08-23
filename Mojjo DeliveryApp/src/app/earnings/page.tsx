'use client';

import React from 'react';
import {
  Wallet,
  TrendingUp,
  Banknote,
  Bike,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  QrCode,
  CreditCard,
} from 'lucide-react';
import { useRiderStore } from '../../services/riderStore';

export default function RiderEarningsPage() {
  const profile = useRiderStore((s) => s.profile);
  const completedOrders = useRiderStore((s) => s.completedOrders);

  return (
    <div className="space-y-5">
      {/* Earnings Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0b2433] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4" /> Today's Net Earnings
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {profile.totalTrips} Total Trips
          </span>
        </div>

        <div>
          <p className="text-3xl font-black text-white">
            रू {profile.todayEarningsNpr.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Transferred directly to your eSewa / Bank account daily at midnight.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Base Pay</span>
            <p className="text-sm font-bold text-white">रू {Math.round(profile.todayEarningsNpr * 0.85)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Tips & Surges</span>
            <p className="text-sm font-bold text-emerald-400">+ रू {Math.round(profile.todayEarningsNpr * 0.15)}</p>
          </div>
        </div>
      </div>

      {/* Doorstep Collection Breakdown (Cash vs QR) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash in Hand */}
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <Banknote className="w-4 h-4" /> Cash in Hand (COD)
          </div>
          <p className="text-xl font-black text-white">
            रू {profile.cashInHandNpr.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">
            To remit at {profile.currentHub}
          </p>
        </div>

        {/* QR Code Digital */}
        <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
            <QrCode className="w-4 h-4" /> QR Digital Paid
          </div>
          <p className="text-xl font-black text-white">
            रू {profile.digitalCollectedNpr.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">
            Verified to Mojjo account
          </p>
        </div>
      </div>

      {/* Recent Trips Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Bike className="w-4 h-4 text-teal-400" />
            Completed Trips ({completedOrders.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Tonight</span>
        </div>

        {completedOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No completed trips yet tonight. Accept incoming orders to earn!
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ord.orderNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      ✓ Delivered
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {ord.deliveryAddress.area} • {ord.totalDistanceKm} km
                  </p>
                  {ord.doorstepPayment && (
                    <p className="text-[10px] text-teal-400 font-semibold mt-0.5">
                      Paid via {ord.doorstepPayment.mode === 'cash' ? '💵 Cash' : ord.doorstepPayment.mode === 'qr_online' ? '📱 QR Code' : '🔀 Split'}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400">
                    + रू {ord.totalRiderEarningNpr}
                  </span>
                  <p className="text-[10px] text-slate-500">Bill: रू {ord.totalAmountNpr.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
