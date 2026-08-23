'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Zap,
  Bike,
  Clock,
  AlertTriangle,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { INITIAL_DELIVERY_ZONES } from '../../services/adminData';
import { AdminDeliveryZone } from '../../types/admin';

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<AdminDeliveryZone[]>(INITIAL_DELIVERY_ZONES);

  const handleToggleSurge = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isSurgePricing: !z.isSurgePricing } : z))
    );
  };

  const handleToggleActive = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isActive: !z.isActive } : z))
    );
  };

  const handleEtaChange = (zoneId: string, delta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const newEta = Math.max(5, z.standardEtaMinutes + delta);
          return { ...z, standardEtaMinutes: newEta };
        }
        return z;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-teal-400" />
            <span>Delivery Zones & 10-Min Dark Store Hubs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure serviceable radii, live ETAs, surge pricing, and rider allocations across Kathmandu Valley
          </p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Add Delivery Zone</span>
        </button>
      </div>

      {/* Dark Store Hubs KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Dark Store Hubs</span>
          <p className="text-2xl font-black text-teal-400 mt-1">2 Live Hubs</p>
          <p className="text-xs text-slate-500 mt-1">Jhamsikhel Hub & Baneshwor Hub</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Delivery Fleet</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">35 Fleet Riders</p>
          <p className="text-xs text-slate-500 mt-1">Equipped with thermal delivery bags</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guaranteed Delivery Radius</span>
          <p className="text-2xl font-black text-amber-400 mt-1">3.5 km Radius</p>
          <p className="text-xs text-slate-500 mt-1">Optimized for &lt; 10 min door arrival</p>
        </div>
      </div>

      {/* Delivery Zones Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Zone & Dark Store Hub</th>
                <th className="px-5 py-4">City</th>
                <th className="px-5 py-4">Standard ETA</th>
                <th className="px-5 py-4">Riders & Queued Orders</th>
                <th className="px-5 py-4">Surge Mode</th>
                <th className="px-5 py-4">Zone Status</th>
                <th className="px-5 py-4 text-right">ETA Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-white text-sm">{zone.name}</p>
                    <p className="text-slate-400 text-[11px]">{zone.darkStoreHub}</p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-200">{zone.city}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-extrabold text-xs border border-teal-500/30">
                      ⚡ {zone.standardEtaMinutes} Mins
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Bike className="w-3.5 h-3.5" /> {zone.activeRidersCount} riders
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400 font-bold">{zone.pendingOrdersCount} orders</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleSurge(zone.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        zone.isSurgePricing
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {zone.isSurgePricing ? 'Surge Active (+ रू 20)' : 'Normal'}
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggleActive(zone.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        zone.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {zone.isActive ? 'Active Service' : 'Disabled'}
                    </button>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => handleEtaChange(zone.id, -2)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                      >
                        -2m
                      </button>
                      <span className="px-2 font-mono font-bold text-white text-xs">{zone.standardEtaMinutes}m</span>
                      <button
                        onClick={() => handleEtaChange(zone.id, 2)}
                        className="w-7 h-7 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                      >
                        +2m
                      </button>
                    </div>
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
