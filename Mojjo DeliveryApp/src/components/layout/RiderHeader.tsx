'use client';

import React from 'react';
import { Bike, Power, Star, MapPin, BatteryCharging, Wifi, PhoneCall, ShieldAlert, Zap } from 'lucide-react';
import { useRiderStore } from '../../services/riderStore';

export const RiderHeader: React.FC = () => {
  const profile = useRiderStore((s) => s.profile);
  const toggleDutyStatus = useRiderStore((s) => s.toggleDutyStatus);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 space-y-2">
      {/* Top Telemetry / Status Ribbon */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-slate-800/50 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>GPS LOCKED (3m)</span>
          </span>
          <span>•</span>
          <span className="text-slate-400 font-mono">BATTERY: 94%</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:015542000"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
          >
            <PhoneCall className="w-3 h-3" />
            <span>DISPATCH SOS</span>
          </a>
        </div>
      </div>

      {/* Main Profile & Duty Bar */}
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Rider Info */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md shadow-teal-500/20">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-black text-white text-sm">
                {profile.name.charAt(0)}
              </div>
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                profile.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-white">{profile.name}</h1>
              <div className="flex items-center text-amber-400 text-[11px] font-bold gap-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span>{profile.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3 text-teal-400" />
              <span className="truncate max-w-[140px]">{profile.currentHub}</span>
            </div>
          </div>
        </div>

        {/* Shift Earnings Badge & Duty Toggle */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Today</span>
            <span className="text-xs font-black text-emerald-400">रू {profile.todayEarningsNpr.toLocaleString()}</span>
          </div>

          <button
            onClick={toggleDutyStatus}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all ${
              profile.isOnline
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{profile.isOnline ? 'ON DUTY' : 'OFFLINE'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
