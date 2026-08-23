'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Smartphone,
  Globe,
  Search,
  Filter,
  CheckCircle2,
  Bike,
  Clock,
  User,
  Phone,
  MapPin,
  ChevronRight,
  Package,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Banknote,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore } from '../../services/adminStore';
import { AdminOrder, OrderStatus, PlatformSource } from '../../types/admin';

type OrderTabFilter =
  | 'All'
  | 'Pending'
  | 'Processing'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunds';

export default function AdminOrdersPage() {
  const orders = useAdminStore((s) => s.orders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);
  const assignRiderToOrder = useAdminStore((s) => s.assignRiderToOrder);

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformSource>('All');
  const [activeTab, setActiveTab] = useState<OrderTabFilter>('All');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (platformFilter !== 'All' && order.platform !== platformFilter) return false;
    
    // Tab Filter
    if (activeTab === 'Pending' && order.orderStatus !== 'Pending') return false;
    if (activeTab === 'Processing' && order.orderStatus !== 'Preparing') return false;
    if (activeTab === 'OutForDelivery' && order.orderStatus !== 'OutForDelivery') return false;
    if (activeTab === 'Delivered' && order.orderStatus !== 'Delivered') return false;
    if (activeTab === 'Cancelled' && order.orderStatus !== 'Cancelled') return false;
    if (activeTab === 'Refunds' && order.paymentStatus !== 'Refunded') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const getTabCount = (tab: OrderTabFilter) => {
    if (tab === 'All') return orders.length;
    if (tab === 'Pending') return orders.filter((o) => o.orderStatus === 'Pending').length;
    if (tab === 'Processing') return orders.filter((o) => o.orderStatus === 'Preparing').length;
    if (tab === 'OutForDelivery') return orders.filter((o) => o.orderStatus === 'OutForDelivery').length;
    if (tab === 'Delivered') return orders.filter((o) => o.orderStatus === 'Delivered').length;
    if (tab === 'Cancelled') return orders.filter((o) => o.orderStatus === 'Cancelled').length;
    if (tab === 'Refunds') return orders.filter((o) => o.paymentStatus === 'Refunded').length;
    return 0;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-teal-400" />
            <span>Orders Command & Dispatch</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fulfillment across Kathmandu Valley • 45-minute delivery SLA
          </p>
        </div>

        {/* Omnichannel Source Selector */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start">
          <button
            onClick={() => setPlatformFilter('All')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              platformFilter === 'All'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setPlatformFilter('MobileApp')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              platformFilter === 'MobileApp'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          <button
            onClick={() => setPlatformFilter('Web')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              platformFilter === 'Web'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Store</span>
          </button>
        </div>
      </div>

      {/* 7 Core Order Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('All')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
            activeTab === 'All'
              ? 'bg-teal-500 text-slate-950 border-teal-500 font-extrabold shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          All Orders ({getTabCount('All')})
        </button>

        <button
          onClick={() => setActiveTab('Pending')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'Pending'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-amber-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({getTabCount('Pending')})</span>
        </button>

        <button
          onClick={() => setActiveTab('Processing')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'Processing'
              ? 'bg-blue-500 text-white border-blue-500 font-extrabold shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-blue-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Processing ({getTabCount('Processing')})</span>
        </button>

        <button
          onClick={() => setActiveTab('OutForDelivery')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'OutForDelivery'
              ? 'bg-purple-500 text-white border-purple-500 font-extrabold shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-purple-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Out for Delivery ({getTabCount('OutForDelivery')})</span>
        </button>

        <button
          onClick={() => setActiveTab('Delivered')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'Delivered'
              ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-emerald-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Delivered ({getTabCount('Delivered')})</span>
        </button>

        <button
          onClick={() => setActiveTab('Cancelled')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'Cancelled'
              ? 'bg-rose-600 text-white border-rose-600 font-extrabold'
              : 'bg-slate-900 text-rose-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancelled ({getTabCount('Cancelled')})</span>
        </button>

        <button
          onClick={() => setActiveTab('Refunds')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'Refunds'
              ? 'bg-amber-600 text-white border-amber-600 font-extrabold'
              : 'bg-slate-900 text-amber-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refunds ({getTabCount('Refunds')})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by order number (MOJ-...), customer name, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden flex-1"
        />
        <span className="text-xs text-slate-400 mr-2 font-medium">
          {filteredOrders.length} Orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Order ID & Source</th>
                <th className="px-5 py-3.5">Customer Details</th>
                <th className="px-5 py-3.5">Delivery Destination</th>
                <th className="px-5 py-3.5">Items in Bag</th>
                <th className="px-5 py-3.5">Amount & Gateway</th>
                <th className="px-5 py-3.5">Fulfillment Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Order Number & Platform */}
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-white text-sm">{order.orderNumber}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {order.platform === 'MobileApp' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                          <Smartphone className="w-2.5 h-2.5" /> Mobile App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <Globe className="w-2.5 h-2.5" /> Web Store
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">{order.createdAt}</span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-100">{order.customerName}</p>
                    <p className="text-slate-400 font-mono text-[11px]">+977 {order.customerPhone}</p>
                  </td>

                  {/* Delivery Location */}
                  <td className="px-5 py-4">
                    <p className="text-slate-200 font-medium">{order.deliveryAddress.street}</p>
                    <p className="text-slate-400 text-[11px]">
                      {order.deliveryAddress.area}, {order.deliveryAddress.city}
                    </p>
                    <p className="text-[10px] text-teal-400 font-semibold">{order.deliveryAddress.landmark}</p>
                  </td>

                  {/* Items */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {order.items.map((i) => (
                        <p key={i.id} className="text-slate-300 font-medium truncate max-w-[180px]">
                          {i.quantity}x {i.productName}
                        </p>
                      ))}
                    </div>
                  </td>

                  {/* Amount & Payment */}
                  <td className="px-5 py-4">
                    <p className="font-black text-white text-sm">रू {order.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800">
                        {order.paymentMethod}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          order.paymentStatus === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-hidden focus:border-teal-500"
                    >
                      <option value="Pending">🟡 Pending</option>
                      <option value="Preparing">🔵 Processing</option>
                      <option value="OutForDelivery">🟣 Out for Delivery</option>
                      <option value="Delivered">🟢 Delivered</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400">Order Invoice</span>
                <h3 className="text-lg font-black text-white">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-teal-400">+977 {selectedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-200 text-right">
                  {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.area}
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Items:</span>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between p-2 rounded-xl bg-slate-950">
                  <span className="text-white">
                    {item.quantity}x {item.productName} ({item.unit})
                  </span>
                  <span className="font-bold text-emerald-400">रू {item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
              <span>Total Amount</span>
              <span className="text-emerald-400">रू {selectedOrder.totalAmount.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
