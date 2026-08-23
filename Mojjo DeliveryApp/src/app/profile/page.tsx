'use client';

import React from 'react';
import {
  User,
  Bike,
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Award,
} from 'lucide-react';
import { useRiderStore } from '../../services/riderStore';

export default function RiderProfilePage() {
  const profile = useRiderStore((s) => s.profile);
  const resetAll = useRiderStore((s) => s.resetAll);

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 mx-auto shadow-lg shadow-teal-500/20">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-xl text-white">
            {profile.name.charAt(0)}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-white">{profile.name}</h2>
          <p className="text-xs text-slate-400 font-mono">+977 {profile.phone}</p>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-300 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span>{profile.rating} Rating</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-teal-400">
            <Award className="w-4 h-4" />
            <span>{profile.totalTrips} Trips Done</span>
          </div>
        </div>
      </div>

      {/* Vehicle & Hub Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
        <h3 className="font-black text-white uppercase tracking-wider text-[11px] text-slate-400">
          Vehicle & Base Hub
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400">Vehicle Type</span>
          <span className="font-bold text-white">{profile.vehicleType}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400">Number Plate</span>
          <span className="font-mono font-bold text-teal-400">{profile.vehicleNumber}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400">Assigned Hub</span>
          <span className="font-bold text-white">{profile.currentHub}</span>
        </div>
      </div>

      {/* Support & Dispatch Hotline */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-black text-white uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-teal-400" />
          Rider Support & Emergency
        </h3>
        <p className="text-xs text-slate-400">
          Need assistance with a customer location, flat tire, or payment dispute?
        </p>
        <a
          href="tel:014440000"
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Dispatch Command (+977-01-4440000)</span>
        </a>
      </div>

      {/* Demo Reset */}
      <div className="pt-2 text-center">
        <button
          onClick={resetAll}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Flow</span>
        </button>
      </div>
    </div>
  );
}
