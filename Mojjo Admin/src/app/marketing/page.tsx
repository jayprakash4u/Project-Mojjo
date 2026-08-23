'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Smartphone,
  Globe,
  Sparkles,
  Zap,
  Clock,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { INITIAL_COUPONS } from '../../services/adminData';
import { AdminCoupon } from '../../types/admin';

export default function AdminMarketingPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(INITIAL_COUPONS);
  const [activeTab, setActiveTab] = useState<'coupons' | 'hero' | 'dealband' | 'showcases'>('coupons');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Hero Section Settings (Synced to Web & Mobile App)
  const [heroTitle, setHeroTitle] = useState('The good stuff, at your door in 10 minutes.');
  const [heroSubtitle, setHeroSubtitle] = useState('Cold drinks, dairy, snacks, and daily groceries. One order, ultra-fast doorstep arrival.');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('500');
  const [deliveryEtaMinutes, setDeliveryEtaMinutes] = useState('10');

  // Deals of the Day (DealBand) Countdown Settings
  const [dealBandSubtitle, setDealBandSubtitle] = useState('Reduced until midnight, while stock lasts.');
  const [countdownLabel, setCountdownLabel] = useState('⏳ Midnight (11:59 PM)');

  const handleSaveHeroSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast('Hero & Delivery Promises updated for Mobile App & Web!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSaveDealBandSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast('Deals of the Day banner updated across all channels!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-teal-400" />
            <span>Marketing, Banners & Home Page Sections</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage hero banners, deals of the day, coupons, and curated showcases across Web & Mobile App
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-teal-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Coupons & Promo Codes ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'bg-teal-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Hero Banners & Promises</span>
        </button>

        <button
          onClick={() => setActiveTab('dealband')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'dealband'
              ? 'bg-teal-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Deals of the Day (DealBand)</span>
        </button>

        <button
          onClick={() => setActiveTab('showcases')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'showcases'
              ? 'bg-teal-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Product Showcases</span>
        </button>
      </div>

      {/* TAB 1: Coupons & Promo Codes */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Active Promotional Coupons</h3>
            <button className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-md space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-teal-400 tracking-wider">
                      {coupon.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        coupon.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <p className="text-xl font-black text-white mt-2">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `रू ${coupon.discountValue} Flat Discount`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Min. order रू {coupon.minOrderAmount} {coupon.maxDiscount ? `(Up to रू ${coupon.maxDiscount})` : ''}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Channel Eligibility:</span>
                    <span className="font-bold text-slate-200">
                      {coupon.validFor === 'All' ? '📱 Mobile & 💻 Web' : coupon.validFor === 'MobileApp' ? '📱 Mobile App Only' : '💻 Web Only'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Total Redemptions:</span>
                    <span className="font-bold text-teal-400">{coupon.usageCount} times</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleCoupon(coupon.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    coupon.isActive
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                >
                  {coupon.isActive ? 'Pause Coupon' : 'Activate Coupon'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Hero Banners & Promises */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHeroSettings} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-400" />
              <span>Hero Marketplace Banner & Delivery Promises</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Changes apply synchronously to the top hero section on <strong>Web Storefront</strong> and <strong>Mobile App</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Hero Main Heading</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Hero Subtitle</label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Guaranteed Delivery ETA (Mins)</label>
                <input
                  type="number"
                  value={deliveryEtaMinutes}
                  onChange={(e) => setDeliveryEtaMinutes(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Free Delivery Threshold (रू)</label>
                <input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Sync Hero to App & Web</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Deals of the Day (DealBand) */}
      {activeTab === 'dealband' && (
        <form onSubmit={handleSaveDealBandSettings} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Deals of the Day (DealBand) & Countdown Timer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Governs the limited-time discount strip shown below the hero section on both platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Deal Band Subtitle</label>
              <input
                type="text"
                value={dealBandSubtitle}
                onChange={(e) => setDealBandSubtitle(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Countdown Timer Badge</label>
              <input
                type="text"
                value={countdownLabel}
                onChange={(e) => setCountdownLabel(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <p className="font-bold text-white">⚡ Featured Deal Items</p>
            <p className="text-slate-400">Products marked with <strong>⚡ Flash Deal Active</strong> in the Products tab automatically populate this showcase.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish DealBand</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Curated Showcases */}
      {activeTab === 'showcases' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Home Page Curated Showcases</span>
          </h3>
          <p className="text-slate-400">
            Configure section titles and categories featured on both the Website and Mobile App Home Screens:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">🔥 Popular Now</p>
                <p className="text-slate-400 text-[11px]">Dynamic algorithm ranking high-demand products in Kathmandu Valley</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold">Active on App & Web</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">🍿 Snacks & Munchies</p>
                <p className="text-slate-400 text-[11px]">Curated showcase featuring Wai Wai, Lays, Biscuits & Evening Bites</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold">Active on App & Web</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">🥤 Cold Drinks & Juices</p>
                <p className="text-slate-400 text-[11px]">Chilled Real Juice, Coca Cola, Soda & Energy Drinks from Dark Stores</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold">Active on App & Web</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
