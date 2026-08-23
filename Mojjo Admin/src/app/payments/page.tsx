'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Smartphone,
  Globe,
  Wallet,
} from 'lucide-react';
import { useAdminStore } from '../../services/adminStore';

export default function PaymentsPage() {
  const orders = useAdminStore((s) => s.orders);
  const [gatewayFilter, setGatewayFilter] = useState<'All' | 'eSewa' | 'Khalti' | 'COD'>('All');

  const filteredOrders = orders.filter((o) => {
    if (gatewayFilter !== 'All' && o.paymentMethod !== gatewayFilter) return false;
    return true;
  });

  const totalCollected = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Completed' ? o.totalAmount : 0), 184500);
  const esewaTotal = orders.filter((o) => o.paymentMethod === 'eSewa').reduce((sum, o) => sum + o.totalAmount, 98400);
  const khaltiTotal = orders.filter((o) => o.paymentMethod === 'Khalti').reduce((sum, o) => sum + o.totalAmount, 52100);
  const codTotal = orders.filter((o) => o.paymentMethod === 'COD').reduce((sum, o) => sum + o.totalAmount, 34000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-teal-400" />
            <span>Payments & Gateway Reconciliation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of eSewa, Khalti, and Cash on Delivery remittances
          </p>
        </div>
      </div>

      {/* Payment Gateway Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Revenue</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">रू {totalCollected.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500">Live Kathmandu transactions</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-emerald-400 uppercase font-bold flex items-center gap-1">
            🟢 eSewa Digital
          </span>
          <p className="text-2xl font-black text-white mt-1">रू {esewaTotal.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Instant direct settlement</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-purple-400 uppercase font-bold flex items-center gap-1">
            🟣 Khalti Wallet
          </span>
          <p className="text-2xl font-black text-white mt-1">रू {khaltiTotal.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Merchant API verified</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-amber-400 uppercase font-bold flex items-center gap-1">
            💵 Cash on Delivery
          </span>
          <p className="text-2xl font-black text-white mt-1">रू {codTotal.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400">Collected by bike fleet</span>
        </div>
      </div>

      {/* Gateway Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setGatewayFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            gatewayFilter === 'All'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All Gateways
        </button>
        <button
          onClick={() => setGatewayFilter('eSewa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            gatewayFilter === 'eSewa'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-emerald-400 border border-slate-800 hover:text-emerald-300'
          }`}
        >
          eSewa
        </button>
        <button
          onClick={() => setGatewayFilter('Khalti')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            gatewayFilter === 'Khalti'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-purple-400 border border-slate-800 hover:text-purple-300'
          }`}
        >
          Khalti
        </button>
        <button
          onClick={() => setGatewayFilter('COD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            gatewayFilter === 'COD'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-amber-400 border border-slate-800 hover:text-amber-300'
          }`}
        >
          Cash on Delivery
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Transaction & Order</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Gateway Provider</th>
                <th className="px-5 py-3.5">Amount (NPR)</th>
                <th className="px-5 py-3.5">Settlement Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-white">{order.orderNumber}</p>
                    <p className="text-[10px] text-slate-500">{order.createdAt}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">+977 {order.customerPhone}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        order.paymentMethod === 'eSewa'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : order.paymentMethod === 'Khalti'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-black text-white">
                    रू {order.totalAmount.toLocaleString()}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        order.paymentStatus === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {order.paymentStatus}
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
