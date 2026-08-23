'use client';

import React, { useState } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Users,
  Clock,
  History,
} from 'lucide-react';

interface NotificationBroadcast {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  sentTime: string;
  clicks: number;
}

const SAMPLE_BROADCASTS: NotificationBroadcast[] = [
  {
    id: 'b-1',
    title: '⚡ Midnight Craft Beer Restocked!',
    body: 'Tuborg and IPA chilled cans are available for under 45-min delivery across Kathmandu.',
    targetAudience: 'All Mobile App Users (Kathmandu)',
    sentTime: 'Today, 8:00 PM',
    clicks: 342,
  },
  {
    id: 'b-2',
    title: '🎟️ Weekend Voucher: NPR 200 OFF',
    body: 'Use code APPFIRST on orders above NPR 1,500 tonight.',
    targetAudience: 'VIP Customers',
    sentTime: 'Yesterday, 6:30 PM',
    clicks: 580,
  },
];

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('AllUsers');
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>(SAMPLE_BROADCASTS);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newBroadcast: NotificationBroadcast = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      targetAudience: target === 'AllUsers' ? 'All Mobile App Users' : 'VIP Members',
      sentTime: 'Just now',
      clicks: 0,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setTitle('');
    setBody('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-teal-400" />
            <span>Push Notifications & SMS Campaigns</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast instant push messages and deals directly to customer phone lockscreens
          </p>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Push notification broadcast sent successfully to 1,240 active mobile devices!</span>
        </div>
      )}

      {/* Broadcast Composer */}
      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Send className="w-4 h-4 text-teal-400" />
          Compose Push Notification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Notification Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 🍷 Weekend Single Malt Special"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Target Audience *</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-teal-500"
            >
              <option value="AllUsers">All Mobile App Users (Kathmandu & Lalitpur)</option>
              <option value="VipMembers">VIP Buyers (LTV &gt; NPR 20,000)</option>
              <option value="Inactive">Inactive Buyers (Last 14 days)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">Message Body *</label>
          <textarea
            rows={2}
            required
            placeholder="e.g. Cold beers and cigarettes delivered to your door in under 45 minutes tonight."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Push Broadcast</span>
          </button>
        </div>
      </form>

      {/* Past Broadcasts */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <History className="w-4 h-4 text-teal-400" />
          Recent Broadcast Campaigns
        </h3>

        <div className="space-y-2.5">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-bold text-white text-xs">{b.title}</p>
                <p className="text-xs text-slate-300 mt-0.5">{b.body}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {b.targetAudience} • {b.sentTime}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-teal-400">{b.clicks} App Opens</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
