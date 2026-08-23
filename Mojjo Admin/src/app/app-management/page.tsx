'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  Save,
  CheckCircle2,
  Bell,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';

export default function MobileAppManagementPage() {
  const [minAppVersion, setMinAppVersion] = useState('1.0.0');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [perPieceEnabled, setPerPieceEnabled] = useState(true);
  const [esewaSdkEnabled, setEsewaSdkEnabled] = useState(true);
  const [khaltiSdkEnabled, setKhaltiSdkEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-teal-400" />
            <span>Mobile App Management (iOS & Android)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure mobile app feature flags, force update policies & payment SDK toggles
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Mobile app configuration updated live!</span>
        </div>
      )}

      {/* Feature Flags & Controls */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          Active App Feature Flags
        </h3>

        <div className="space-y-3 text-xs">
          {/* Per Piece Cigarette Toggle */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Per-Piece Cigarette Buying Flow</span>
              <span className="text-[11px] text-slate-400">Allow customers to buy single sticks alongside full packs</span>
            </div>
            <input
              type="checkbox"
              checked={perPieceEnabled}
              onChange={(e) => setPerPieceEnabled(e.target.checked)}
              className="rounded text-teal-500 w-5 h-5 focus:ring-0"
            />
          </label>

          {/* eSewa Native SDK */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">eSewa Nepal Payment Gateway</span>
              <span className="text-[11px] text-slate-400">Enable in-app direct wallet payments</span>
            </div>
            <input
              type="checkbox"
              checked={esewaSdkEnabled}
              onChange={(e) => setEsewaSdkEnabled(e.target.checked)}
              className="rounded text-teal-500 w-5 h-5 focus:ring-0"
            />
          </label>

          {/* Khalti SDK */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="font-bold text-white block">Khalti Nepal Payment Gateway</span>
              <span className="text-[11px] text-slate-400">Enable in-app Khalti checkout button</span>
            </div>
            <input
              type="checkbox"
              checked={khaltiSdkEnabled}
              onChange={(e) => setKhaltiSdkEnabled(e.target.checked)}
              className="rounded text-teal-500 w-5 h-5 focus:ring-0"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save App Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
