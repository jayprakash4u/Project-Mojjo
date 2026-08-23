'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  Layers,
  History,
  Boxes,
  Truck,
  FileSpreadsheet,
  X,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useAdminStore } from '../../services/adminStore';
import { AdminProduct } from '../../types/admin';

interface StockMovementLog {
  id: string;
  productName: string;
  type: 'inward' | 'sale' | 'adjustment';
  quantityDelta: number;
  newBalance: number;
  reason: string;
  timestamp: string;
  hub: string;
}

const SAMPLE_STOCK_LOGS: StockMovementLog[] = [
  {
    id: 'log-1',
    productName: 'Premium Single Malt Whisky',
    type: 'sale',
    quantityDelta: -1,
    newBalance: 20,
    reason: 'Customer Order Dispatched #MOJ-94821',
    timestamp: '15 mins ago',
    hub: 'Jhamsikhel Hub-01',
  },
  {
    id: 'log-2',
    productName: 'Surya 24 Carat Lights',
    type: 'sale',
    quantityDelta: -2,
    newBalance: 45,
    reason: 'Customer Order Dispatched #MOJ-94821',
    timestamp: '15 mins ago',
    hub: 'Jhamsikhel Hub-01',
  },
  {
    id: 'log-3',
    productName: 'Craft IPA Beer Pack',
    type: 'inward',
    quantityDelta: +20,
    newBalance: 40,
    reason: 'Distributor Delivery Batch (Crate #8841)',
    timestamp: 'Today, 11:30 AM',
    hub: 'Jhamsikhel Hub-01',
  },
  {
    id: 'log-4',
    productName: 'Red Bull Energy Drink (4 Cans)',
    type: 'sale',
    quantityDelta: -4,
    newBalance: 3,
    reason: 'Customer Order Dispatched #MOJ-94818 (Low Stock Triggered)',
    timestamp: 'Today, 02:15 PM',
    hub: 'Jhamsikhel Hub-01',
  },
];

export default function InventoryPage() {
  const products = useAdminStore((s) => s.products);
  const updateStock = useAdminStore((s) => s.updateStock);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'LowStock' | 'OutOfStock'>('All');
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(SAMPLE_STOCK_LOGS);

  // Inwarding Modal States
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'p1');
  const [inwardQuantity, setInwardQuantity] = useState('10');
  const [distributorName, setDistributorName] = useState('Jawalakhel Group of Industries / Surya Nepal');
  const [invoiceRef, setInvoiceRef] = useState('INV-2026-9841');
  const [inwardSuccessToast, setInwardSuccessToast] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (filterType === 'LowStock' && (p.stockQuantity > 5 || p.stockQuantity === 0)) return false;
    if (filterType === 'OutOfStock' && p.stockQuantity > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const handleQuickAdd = (product: AdminProduct, delta: number) => {
    updateStock(product.id, delta);

    const newLog: StockMovementLog = {
      id: `log-${Date.now()}`,
      productName: product.name,
      type: delta > 0 ? 'inward' : 'adjustment',
      quantityDelta: delta,
      newBalance: Math.max(0, product.stockQuantity + delta),
      reason: delta > 0 ? `Manual Quick Inward (+${delta})` : `Stock Adjustment (${delta})`,
      timestamp: 'Just now',
      hub: 'Jhamsikhel Hub-01',
    };

    setStockLogs([newLog, ...stockLogs]);
    setInwardSuccessToast(`Updated "${product.name}": New stock is ${product.stockQuantity + delta} units.`);
    setTimeout(() => setInwardSuccessToast(null), 3500);
  };

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(inwardQuantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    const targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct) return;

    updateStock(selectedProductId, qty);

    const newLog: StockMovementLog = {
      id: `log-${Date.now()}`,
      productName: targetProduct.name,
      type: 'inward',
      quantityDelta: +qty,
      newBalance: targetProduct.stockQuantity + qty,
      reason: `Supplier Inward: ${distributorName} (${invoiceRef})`,
      timestamp: 'Just now',
      hub: 'Jhamsikhel Hub-01',
    };

    setStockLogs([newLog, ...stockLogs]);
    setIsInwardModalOpen(false);
    setInwardSuccessToast(
      `Received +${qty} units of "${targetProduct.name}"! Total stock is now ${targetProduct.stockQuantity + qty} units.`
    );
    setTimeout(() => setInwardSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {inwardSuccessToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5" />
          <span>{inwardSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-teal-400" />
            <span>Inventory & Stock Inwarding Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track shelf inventory, record distributor stock arrivals & view live audit logs
          </p>
        </div>

        <button
          onClick={() => setIsInwardModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all self-start"
        >
          <Truck className="w-4 h-4" />
          <span>+ Inward Stock from Distributor</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold">Total Catalog SKUs</span>
          <p className="text-2xl font-black text-white mt-1">{products.length} Products</p>
          <span className="text-xs text-emerald-400 font-semibold">Active in Kathmandu Hubs</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-amber-400 uppercase font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
          </span>
          <p className="text-2xl font-black text-amber-300 mt-1">{lowStockCount} SKUs</p>
          <span className="text-xs text-slate-400">≤ 5 units on dark store shelf</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-rose-400 uppercase font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Out of Stock
          </span>
          <p className="text-2xl font-black text-rose-400 mt-1">{outOfStockCount} SKUs</p>
          <span className="text-xs text-slate-400">Needs immediate re-order</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search product by name, category, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden flex-1"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setFilterType('All')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'All'
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterType('LowStock')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'LowStock'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-amber-400 border border-slate-800 hover:text-amber-300'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterType('OutOfStock')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'OutOfStock'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950 text-rose-400 border border-slate-800 hover:text-rose-300'
            }`}
          >
            Out ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Stock Management Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Product & SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Selling Price</th>
                <th className="px-5 py-3.5">Available Shelf Stock</th>
                <th className="px-5 py-3.5 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((product) => {
                const isLow = product.stockQuantity > 0 && product.stockQuantity <= 5;
                const isOut = product.stockQuantity === 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{product.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{product.unit} • SKU: {product.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      रू {product.price.toLocaleString()}
                    </td>

                    {/* Stock Level with Progress Meter */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                              isOut
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {product.stockQuantity} Units
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isOut ? 'Sold Out' : isLow ? 'Running Low' : 'In Stock'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Quick Adjustment Stepper (+1, +5, +10, +50, or Inward) */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAdd(product, -1)}
                          disabled={product.stockQuantity <= 0}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-black disabled:opacity-40"
                          title="Reduce stock by 1 (e.g. spoilage/breakage)"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product, 5)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product, 10)}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickAdd(product, 50)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold"
                          title="Add 50 units (Crate)"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* REAL-TIME STOCK MOVEMENT AUDIT TRAIL / LEDGER */}
      {/* ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <span>Stock Inflow & Outflow Movement Ledger</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Live Kathmandu Hub Tracking</span>
        </div>

        <div className="space-y-2">
          {stockLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    log.quantityDelta > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {log.quantityDelta > 0 ? '+' : ''}
                  {log.quantityDelta}
                </div>
                <div>
                  <p className="font-bold text-white">{log.productName}</p>
                  <p className="text-[11px] text-slate-400">{log.reason}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">New Balance</span>
                  <span className="font-black text-teal-300">{log.newBalance} Units</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">{log.hub}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* INWARD STOCK BATCH MODAL */}
      {/* ============================================================ */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Inward Stock from Distributor</h3>
                  <p className="text-xs text-slate-400">Receive new crates into Kathmandu Dark Store Hub</p>
                </div>
              </div>
              <button
                onClick={() => setIsInwardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInwardSubmit} className="space-y-3.5 text-xs">
              {/* Product Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Product to Restock *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-hidden focus:border-teal-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Shelf Stock: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Added */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Inward Quantity (Units / Bottles / Packs) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 10, 20, 50"
                  value={inwardQuantity}
                  onChange={(e) => setInwardQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 text-sm font-bold focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Supplier / Distributor */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Supplier / Distributor Name</label>
                <input
                  type="text"
                  value={distributorName}
                  onChange={(e) => setDistributorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Invoice Reference */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Invoice / Delivery Challan #</label>
                <input
                  type="text"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-lg shadow-teal-500/20"
                >
                  Confirm Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
