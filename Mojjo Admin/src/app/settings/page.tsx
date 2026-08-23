'use client';

import React, { useState } from 'react';
import {
  Settings,
  Store,
  Wifi,
  Smartphone,
  Globe,
  Bell,
  Save,
  Shield,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Lalitpur Hub 1 - Jhamsikhel');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [allowCod, setAllowCod] = useState(true);
  const [backendApiUrl, setBackendApiUrl] = useState('https://api.mojjo.com.np/api/v1');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-teal-400" />
          <span>System & Dark Store Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Global controls for Mojjo Mobile App & Web Storefront infrastructure
        </p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
        {/* Store Operation Status */}
        <div className="space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-teal-400" />
            <span>Dark Store Operations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Active Dark Store Hub</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">.NET Backend API Endpoint</label>
              <input
                type="text"
                value={backendApiUrl}
                onChange={(e) => setBackendApiUrl(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Global Toggles */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Platform Controls</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-white">Accept New 10-Min Orders</p>
                <p className="text-[11px] text-slate-400">Controls order placement on both Mobile App and Web Storefront</p>
              </div>
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isStoreOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {isStoreOpen ? 'Open (Active)' : 'Closed'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-white">Enable Cash on Delivery (COD)</p>
                <p className="text-[11px] text-slate-400">Allows customers to pay cash to delivery rider upon door arrival</p>
              </div>
              <button
                onClick={() => setAllowCod(!allowCod)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  allowCod
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {allowCod ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-slate-800 pt-6 flex justify-end">
          <button className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
