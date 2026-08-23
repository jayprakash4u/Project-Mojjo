'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Bike,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Users,
  CreditCard,
  Boxes,
  Layers,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Smartphone,
  ExternalLink,
  Wine,
  Cigarette,
  Cookie,
  Coffee,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  Activity,
  ShieldCheck,
  MapPin,
  Flame,
  Radio,
  Sliders,
  DollarSign,
  Send,
  Search,
  Tag,
} from 'lucide-react';
import { useAdminStore } from '../services/adminStore';
import { AddProductModal } from '../components/products/AddProductModal';
import { AdminProduct } from '../types/admin';

export default function AdminDashboardPage() {
  const products = useAdminStore((s) => s.products);
  const categories = useAdminStore((s) => s.categories);
  const orders = useAdminStore((s) => s.orders);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateStock = useAdminStore((s) => s.updateStock);

  // States
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState('alcohol');
  const [stockToast, setStockToast] = useState<string | null>(null);

  const openAddProductModal = (cat: string) => {
    setTargetCategory(cat);
    setIsAddProductModalOpen(true);
  };

  const handleQuickStockUpdate = (product: AdminProduct, delta: number) => {
    updateStock(product.id, delta);
    const newQty = Math.max(0, product.stockQuantity + delta);
    setStockToast(`Updated "${product.name}": New stock balance is ${newQty} ${product.unit}.`);
    setTimeout(() => setStockToast(null), 3000);
  };

  // Calculations
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'Completed' ? o.totalAmount : 0),
    184500
  );
  const appOrdersCount = orders.filter((o) => o.platform === 'MobileApp').length;
  const webOrdersCount = orders.filter((o) => o.platform === 'Web').length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);

  // Filtered products for the Category-Wise Inventory Grid
  const filteredProducts = products.filter((p) => {
    if (selectedCategoryTab === 'low_stock' && p.stockQuantity > 5) return false;
    if (selectedCategoryTab === 'out_of_stock' && p.stockQuantity > 0) return false;
    if (
      selectedCategoryTab !== 'all' &&
      selectedCategoryTab !== 'low_stock' &&
      selectedCategoryTab !== 'out_of_stock' &&
      p.category !== selectedCategoryTab
    ) {
      return false;
    }
    if (stockSearchQuery.trim()) {
      const q = stockSearchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Toast Notification */}
      {stockToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5" />
          <span>{stockToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TACTICAL OPERATIONS COMMAND BANNER */}
      {/* ============================================================ */}
      <div className="relative bg-gradient-to-br from-[#0b2230] via-[#081721] to-[#040e15] border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Live Ops Command</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800 text-[11px] font-bold flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-teal-400" />
                <span>3 Kathmandu Dark Stores Operational</span>
              </span>

              <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-slate-800 text-[11px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Avg SLA: 14.2 Mins</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mojjo Quick-Commerce Control Tower
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unified command for 45-minute liquor, cigarettes & snack deliveries across Kathmandu & Lalitpur. Real-time catalog, stock alerts, and dispatch telemetry.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={() => openAddProductModal('alcohol')}
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Product</span>
            </button>

            <Link
              href="/inventory"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Boxes className="w-4 h-4 text-teal-400" />
              <span>Batch Inwarding</span>
            </Link>

            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-teal-500/30 transition-all"
            >
              <Bike className="w-4 h-4 text-teal-400" />
              <span>Launch Rider App</span>
              <ExternalLink className="w-3 h-3 text-teal-400" />
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXECUTIVE REVENUE & OPERATIONS VELOCITY (4 KPI CARDS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              रू {totalRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span className="text-teal-400 font-bold">↑ +18.4%</span>
              <span>vs last Sunday pace</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Live Orders & Omnichannel Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Deliveries Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {orders.length} Orders
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-teal-300 font-bold flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> {appOrdersCount} App
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <Globe className="w-3 h-3" /> {webOrdersCount} Web
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Fleet Velocity & Active Riders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Riders on Wheels
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              28 Active Fleet
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">18 En Route</span>
              <span>• 10 at Dark Hubs</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Stock Health & Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inventory Health
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              {lowStockCount} Low • {outOfStockCount} Out
            </p>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-slate-400">
                Value: <strong>रू {(totalInventoryValue / 1000).toFixed(0)}k</strong>
              </span>
              <Link href="/inventory" className="text-amber-400 font-bold hover:underline">
                Restock ➔
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CATEGORY-WISE INVENTORY HEALTH & WARNING MATRIX */}
      {/* ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-teal-400" />
              <span>Category Stock Command & Real-Time Warning Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live available bottle/pack counts and instant low-stock indicators across all aisles
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search within Stock */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 w-44 sm:w-56"
              />
            </div>

            <Link
              href="/inventory"
              className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <span>Audit Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 ${
              selectedCategoryTab === 'all'
                ? 'bg-teal-500 text-slate-950 border-teal-500 font-black shadow-md shadow-teal-500/20'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Products ({products.length})
          </button>

          <button
            onClick={() => setSelectedCategoryTab('low_stock')}
            className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategoryTab === 'low_stock'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-amber-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ Low Stock ({lowStockCount})</span>
          </button>

          <button
            onClick={() => setSelectedCategoryTab('out_of_stock')}
            className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategoryTab === 'out_of_stock'
                ? 'bg-rose-600 text-white border-rose-600 font-black shadow-md shadow-rose-600/20'
                : 'bg-slate-950 text-rose-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Out of Stock ({outOfStockCount})</span>
          </button>

          {categories.map((cat) => {
            const catCount = products.filter((p) => p.category === cat.id).length;
            const isSelected = selectedCategoryTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryTab(cat.id)}
                className={`px-3.5 py-2 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-500 font-black shadow-md shadow-teal-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon || '📦'}</span>
                <span>{cat.name} ({catCount})</span>
              </button>
            );
          })}
        </div>

        {/* High-Density Category Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-500">
            No products match the selected filter or search term.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((product) => {
              const isOut = product.stockQuantity === 0;
              const isLow = product.stockQuantity > 0 && product.stockQuantity <= 5;
              const stockRatio = Math.min(100, (product.stockQuantity / 30) * 100);

              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isOut
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-xs'
                      : isLow
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-xs'
                      : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block truncate">
                          {product.category}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate max-w-[170px]">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {product.unit} • <strong className="text-emerald-400">रू {product.price.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="shrink-0">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-slate-950 font-black text-[10px] uppercase">
                          0 Left (Out)
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase animate-pulse">
                          ⚠️ {product.stockQuantity} Remaining
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                          {product.stockQuantity} in stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Gauge Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Shelf Level:</span>
                      <span className={isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}>
                        {product.stockQuantity} Units
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOut ? 'bg-rose-500' : isLow ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${stockRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* 1-Click Restock Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">SKU: {product.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickStockUpdate(product, -1)}
                        disabled={product.stockQuantity <= 0}
                        className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-black flex items-center justify-center disabled:opacity-30"
                        title="Reduce 1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuickStockUpdate(product, 5)}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-bold"
                        title="Add +5"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleQuickStockUpdate(product, 10)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold"
                        title="Add +10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. HUB TELEMETRY & DOORSTEP SETTLEMENT REVENUE SPLIT */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hub 1: Kathmandu Dark Stores Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Kathmandu Dark Store Hub Status</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">🟢 All Online</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Hub 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Hub-01 (Jhamsikhel Primary Base)</p>
                <p className="text-[11px] text-slate-400">Serving Lalitpur, Sanepa, Pulchowk & Kupondole</p>
              </div>
              <div className="text-right">
                <span className="font-black text-teal-400">12 Active Riders</span>
                <p className="text-[10px] text-slate-500">11.4 min avg SLA</p>
              </div>
            </div>

            {/* Hub 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Hub-02 (Baluwatar North Base)</p>
                <p className="text-[11px] text-slate-400">Serving Lazimpat, Maharajgunj, Naxal & Durbarmarg</p>
              </div>
              <div className="text-right">
                <span className="font-black text-teal-400">9 Active Riders</span>
                <p className="text-[10px] text-slate-500">13.8 min avg SLA</p>
              </div>
            </div>

            {/* Hub 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Hub-03 (Baneshwor East Base)</p>
                <p className="text-[11px] text-slate-400">Serving Koteshwor, Maitighar & Sinamangal</p>
              </div>
              <div className="text-right">
                <span className="font-black text-teal-400">7 Active Riders</span>
                <p className="text-[10px] text-slate-500">14.1 min avg SLA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doorstep Payment Settlement Split */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-400" />
              <span>Doorstep Payment Settlement Split</span>
            </h3>
            <Link href="/payments" className="text-xs font-bold text-teal-400 hover:underline">
              Reconcile ➔
            </Link>
          </div>

          <div className="space-y-3">
            {/* eSewa */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                  🟢
                </div>
                <div>
                  <p className="font-bold text-white">eSewa Digital Wallet</p>
                  <p className="text-[11px] text-slate-400">Instant direct API settlement</p>
                </div>
              </div>
              <span className="font-black text-emerald-400 text-sm">रू 98,400</span>
            </div>

            {/* Khalti */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
                  🟣
                </div>
                <div>
                  <p className="font-bold text-white">Khalti Wallet</p>
                  <p className="text-[11px] text-slate-400">Verified gateway merchant pay</p>
                </div>
              </div>
              <span className="font-black text-purple-400 text-sm">रू 52,100</span>
            </div>

            {/* Doorstep Cash */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  💵
                </div>
                <div>
                  <p className="font-bold text-white">Doorstep Cash (COD)</p>
                  <p className="text-[11px] text-slate-400">In hand with on-duty delivery fleet</p>
                </div>
              </div>
              <span className="font-black text-amber-400 text-sm">रू 34,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. OPERATIONAL HUBS ENTERPRISE GATEWAY */}
      {/* ============================================================ */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Operational Management Hubs</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quick shortcuts to all enterprise sections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hub 1: Orders */}
          <Link
            href="/orders"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Orders Hub (7 Sub-Tabs)</h4>
            <p className="text-xs text-slate-400">
              Manage Pending, Processing, Out for Delivery, Delivered, Cancelled & Refunds.
            </p>
          </Link>

          {/* Hub 2: Products */}
          <Link
            href="/products"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Products & Homepage Sections</h4>
            <p className="text-xs text-slate-400">
              Configure prices, tags, and Homepage Checkboxes (Deals of the Day, Popular Now).
            </p>
          </Link>

          {/* Hub 3: Inventory */}
          <Link
            href="/inventory"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Boxes className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Inventory & Distributor Inwarding</h4>
            <p className="text-xs text-slate-400">
              Batch stock inwarding (+10/+50), low-stock monitoring & live movement audit ledger.
            </p>
          </Link>

          {/* Hub 4: Delivery Partners */}
          <Link
            href="/delivery-partners"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                <Bike className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Delivery Partners & Fleet</h4>
            <p className="text-xs text-slate-400">
              Real-time on-duty rider tracking, bike details, and COD cash remittance balance.
            </p>
          </Link>

          {/* Hub 5: Customers */}
          <Link
            href="/customers"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Customers & 18+ Age KYC</h4>
            <p className="text-xs text-slate-400">
              Customer lifetime value (LTV), Mojjo loyalty coins, and 18+ age verification status.
            </p>
          </Link>

          {/* Hub 6: Payments */}
          <Link
            href="/payments"
            className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-white text-sm">Payments & Reconciliation</h4>
            <p className="text-xs text-slate-400">
              Settlement tracking across eSewa Digital, Khalti Wallet, and Doorstep Cash.
            </p>
          </Link>
        </div>
      </div>

      {/* Add Product Modal from Dashboard */}
      {isAddProductModalOpen && (
        <AddProductModal
          isOpen={isAddProductModalOpen}
          defaultCategoryId={targetCategory}
          onClose={() => setIsAddProductModalOpen(false)}
          onAddProduct={(newProd) => addProduct(newProd)}
        />
      )}
    </div>
  );
}
