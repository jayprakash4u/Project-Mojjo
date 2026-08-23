'use client';

import React, { useState } from 'react';
import {
  Bike,
  Star,
  MapPin,
  Phone,
  Power,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  ExternalLink,
} from 'lucide-react';

interface RiderFleetMember {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  rating: number;
  totalTrips: number;
  assignedHub: string;
  isOnline: boolean;
  activeOrderId?: string;
  todayEarningsNpr: number;
  cashInHandNpr: number;
}

const SAMPLE_RIDERS: RiderFleetMember[] = [
  {
    id: 'r-1',
    name: 'Rohan Shrestha',
    phone: '9801122334',
    vehicleNumber: 'Ba 88 Pa 4921',
    vehicleType: 'Yamaha FZ-S',
    rating: 4.9,
    totalTrips: 418,
    assignedHub: 'Hub-01 (Jhamsikhel)',
    isOnline: true,
    activeOrderId: 'MOJ-94821',
    todayEarningsNpr: 1850,
    cashInHandNpr: 4200,
  },
  {
    id: 'r-2',
    name: 'Bishal Gurung',
    phone: '9812345678',
    vehicleNumber: 'Ba 92 Pa 1102',
    vehicleType: 'Honda Shine',
    rating: 4.8,
    totalTrips: 312,
    assignedHub: 'Hub-02 (Baluwatar)',
    isOnline: true,
    todayEarningsNpr: 1420,
    cashInHandNpr: 2800,
  },
  {
    id: 'r-3',
    name: 'Sandesh Karki',
    phone: '9841998877',
    vehicleNumber: 'Ba 74 Pa 8841',
    vehicleType: 'TVS Raider',
    rating: 4.7,
    totalTrips: 260,
    assignedHub: 'Hub-03 (Baneshwor)',
    isOnline: false,
    todayEarningsNpr: 800,
    cashInHandNpr: 0,
  },
];

export default function DeliveryPartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SAMPLE_RIDERS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery) ||
    r.assignedHub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bike className="w-6 h-6 text-teal-400" />
            <span>Delivery Fleet & Rider Partners</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of on-duty delivery boys across Kathmandu hubs
          </p>
        </div>

        <a
          href="http://localhost:3002"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all self-start"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch Rider Partner App (Port 3002)</span>
        </a>
      </div>

      {/* Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((rider) => (
          <div
            key={rider.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 font-black flex items-center justify-center">
                  {rider.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{rider.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">+977 {rider.phone}</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  rider.isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {rider.isOnline ? '🟢 On Duty' : 'Offline'}
              </span>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Base:</span>
                <span className="font-bold text-white">{rider.assignedHub}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="text-slate-200">{rider.vehicleType} ({rider.vehicleNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rating & Trips:</span>
                <span className="text-amber-400 font-bold">⭐ {rider.rating} • {rider.totalTrips} Trips</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">COD in Hand:</span>
                <span className="font-black text-emerald-400">रू {rider.cashInHandNpr.toLocaleString()}</span>
              </div>
            </div>

            {rider.activeOrderId && (
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] text-purple-300 flex items-center justify-between">
                <span>Active Delivery: <strong>{rider.activeOrderId}</strong></span>
                <span className="font-bold text-purple-400">En Route ➔</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
