'use client';

import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Type,
  Layout,
  ExternalLink,
} from 'lucide-react';

export default function WebsiteManagementPage() {
  const [heroHeadline, setHeroHeadline] = useState('The good stuff, at your door in under an hour.');
  const [heroSubtext, setHeroSubtext] = useState('Whisky, wine and beer alongside cigarettes, snacks and cold drinks. One order, one delivery.');
  const [topBarAnnouncement, setTopBarAnnouncement] = useState('⚡ Flash delivery live across Kathmandu & Lalitpur • 45 Mins Average SLA');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-teal-400" />
            <span>Website Management & CMS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customize hero banners, top announcements, and landing page content for Mojjo Web
          </p>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all self-start"
        >
          <ExternalLink className="w-4 h-4 text-teal-400" />
          <span>Preview Web Storefront</span>
        </a>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Website content updated and published live to visitors!</span>
        </div>
      )}

      {/* Content Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            Top Header Announcement Bar
          </label>
          <input
            type="text"
            value={topBarAnnouncement}
            onChange={(e) => setTopBarAnnouncement(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            Hero Headline (Main Homepage Title)
          </label>
          <input
            type="text"
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-300">
            Hero Subtitle / Description
          </label>
          <textarea
            rows={3}
            value={heroSubtext}
            onChange={(e) => setHeroSubtext(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Publish Website Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
