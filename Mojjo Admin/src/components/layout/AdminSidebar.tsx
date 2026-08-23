'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Bike,
  CreditCard,
  Tag,
  Star,
  Headphones,
  Globe,
  Smartphone,
  Bell,
  BarChart3,
  Settings,
  Zap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [ordersOpen, setOrdersOpen] = useState<boolean>(true);
  const [supportOpen, setSupportOpen] = useState<boolean>(false);

  return (
    <aside className="w-64 bg-[#0b1f2a] text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Mojjo <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">45-Min Kathmandu Command</p>
          </div>
        </div>

        {/* Omnichannel Indicator */}
        <div className="mt-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-teal-400 font-semibold">
            <Smartphone className="w-3 h-3" />
            <span>Mobile App</span>
          </div>
          <span className="text-slate-600 font-bold">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Globe className="w-3 h-3" />
            <span>Web Store</span>
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto text-xs">
        {/* 1. Dashboard */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname === '/'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* 2. Orders Group (Collapsible) */}
        <div>
          <button
            onClick={() => setOrdersOpen(!ordersOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${
              pathname.startsWith('/orders')
                ? 'text-teal-300 bg-slate-900/90'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                Live
              </span>
              {ordersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </button>

          {ordersOpen && (
            <div className="ml-5 pl-2 border-l border-slate-800 my-1 space-y-0.5">
              <Link
                href="/orders"
                className={`block px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  pathname === '/orders' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                • All Orders
              </Link>
            </div>
          )}
        </div>

        {/* 3. Products */}
        <Link
          href="/products"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/products')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products</span>
        </Link>

        {/* 4. Categories */}
        <Link
          href="/categories"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/categories')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories</span>
        </Link>

        {/* 5. Inventory */}
        <Link
          href="/inventory"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/inventory')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventory</span>
        </Link>

        {/* 6. Customers */}
        <Link
          href="/customers"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/customers')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers</span>
        </Link>

        {/* 7. Delivery Partners */}
        <Link
          href="/delivery-partners"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/delivery-partners')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Delivery Partners</span>
        </Link>

        {/* 8. Payments */}
        <Link
          href="/payments"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/payments')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments</span>
        </Link>

        {/* 9. Coupons & Offers */}
        <Link
          href="/marketing"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/marketing')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Coupons & Offers</span>
        </Link>

        {/* 10. Reviews */}
        <Link
          href="/reviews"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/reviews')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews</span>
        </Link>

        {/* 11. Support */}
        <Link
          href="/support"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/support')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support & Complaints</span>
        </Link>

        {/* 12. Website Management */}
        <Link
          href="/website"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/website')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website Management</span>
        </Link>

        {/* 13. Mobile App Management */}
        <Link
          href="/app-management"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/app-management')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile App Management</span>
        </Link>

        {/* 14. Notifications */}
        <Link
          href="/notifications"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/notifications')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </Link>

        {/* 15. Reports & Analytics */}
        <Link
          href="/analytics"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/analytics')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </Link>

        {/* 16. Settings */}
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
            pathname.startsWith('/settings')
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};
