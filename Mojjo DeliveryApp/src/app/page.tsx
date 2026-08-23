'use client';

import React, { useState } from 'react';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Banknote,
  KeyRound,
  QrCode,
  CreditCard,
  Layers,
  Split,
  Store,
  ShieldAlert,
  MessageCircle,
  CheckCheck,
  Compass,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useRiderStore } from '../services/riderStore';
import { DoorstepPaymentMode } from '../types/rider';
import { LiveDeliveryMap } from '../components/delivery/LiveDeliveryMap';

export default function RiderDashboardPage() {
  const profile = useRiderStore((s) => s.profile);
  const activeOrder = useRiderStore((s) => s.activeOrder);
  const toggleDutyStatus = useRiderStore((s) => s.toggleDutyStatus);
  const acceptOrder = useRiderStore((s) => s.acceptOrder);
  const rejectOrder = useRiderStore((s) => s.rejectOrder);
  const advanceStep = useRiderStore((s) => s.advanceStep);
  const toggleItemVerification = useRiderStore((s) => s.toggleItemVerification);
  const verifyAllItems = useRiderStore((s) => s.verifyAllItems);
  const completeDoorstepDelivery = useRiderStore((s) => s.completeDoorstepDelivery);
  const simulateNewOrder = useRiderStore((s) => s.simulateNewOrder);

  // Doorstep Payment & Verification States
  const [paymentMode, setPaymentMode] = useState<DoorstepPaymentMode>('cash');
  const [cashGiven, setCashGiven] = useState<string>('8820');
  const [qrRefNumber, setQrRefNumber] = useState<string>('');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('5000');
  const [splitQrAmount, setSplitQrAmount] = useState<string>('3820');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(true);
  const [showFullQrModal, setShowFullQrModal] = useState<boolean>(false);
  const [isAtGateWaiting, setIsAtGateWaiting] = useState<boolean>(false);
  const [showPayoutBreakdown, setShowPayoutBreakdown] = useState<boolean>(false);

  // ============================================================
  // 1. RIDER IS OFFLINE
  // ============================================================
  if (!profile.isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-5">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
          <Bike className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">You are Offline</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Go online to receive high-payout 45-minute liquor, cigarette and snack deliveries in Kathmandu.
          </p>
        </div>
        <button
          onClick={toggleDutyStatus}
          className="w-full max-w-xs py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>GO ON DUTY (START SHIFT)</span>
        </button>
      </div>
    );
  }

  // ============================================================
  // 2. RIDER IS ONLINE & SEARCHING (RADAR MODE)
  // ============================================================
  if (!activeOrder) {
    return (
      <div className="space-y-4">
        {/* Active Hotspot Surge Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 fill-current" />
            <div>
              <span className="text-xs font-black text-amber-300">Surge Active: +रू 50 Bonus</span>
              <p className="text-[10px] text-slate-400">High demand in Jhamsikhel & Sanepa tonight</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            1.4x Surge
          </span>
        </div>

        {/* Radar Scanning View */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-xl">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-teal-500/40" />
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Bike className="w-8 h-8 text-teal-300" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-wider">
              GPS Radar Active (3km Radius)
            </span>
            <h2 className="text-xl font-black text-white mt-2">Searching for Orders...</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Assigned to <strong>{profile.currentHub}</strong>. Instant notifications will chime when a customer orders.
            </p>
          </div>

          {/* Today's Shift Metrics Card */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-left">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Trips Done</span>
              <span className="text-sm font-black text-white">{profile.totalTrips} Orders</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Earnings</span>
              <span className="text-sm font-black text-emerald-400">रू {profile.todayEarningsNpr.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">SLA On-Time</span>
              <span className="text-sm font-black text-teal-400">{profile.onTimeRatePercent}%</span>
            </div>
          </div>

          <button
            onClick={simulateNewOrder}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Incoming 45-Min Order (Demo)</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 3. INCOMING ORDER BROADCAST (STATE: incoming_request)
  // ============================================================
  if (activeOrder.currentStep === 'incoming_request') {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Urgent Broadcast Ring Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              ⚡ 45-Min Express Order Broadcast
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 font-bold">{activeOrder.orderNumber}</span>
        </div>

        {/* Guaranteed Payout Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Guaranteed Payout</span>
              <p className="text-3xl font-black text-emerald-400 mt-0.5">
                रू {activeOrder.totalRiderEarningNpr}
              </p>
              <button
                type="button"
                onClick={() => setShowPayoutBreakdown(!showPayoutBreakdown)}
                className="text-[11px] text-teal-400 font-bold underline mt-0.5 block"
              >
                {showPayoutBreakdown ? 'Hide Breakdown' : 'View Pay Breakdown ➔'}
              </button>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Distance</span>
              <p className="text-xl font-black text-white mt-0.5">{activeOrder.totalDistanceKm} km</p>
              <span className="text-[11px] text-teal-300 font-semibold">
                ~{activeOrder.estimatedTimeMins} mins total trip
              </span>
            </div>
          </div>

          {/* Pay Breakdown Details */}
          {showPayoutBreakdown && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex justify-between text-slate-300">
                <span>Base Delivery Pay:</span>
                <span className="font-bold text-white">रू {activeOrder.basePayNpr}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distance Pay (2.5 km):</span>
                <span className="font-bold text-white">रू {activeOrder.distancePayNpr}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold">
                <span>⚡ Surge Bonus (Late Night):</span>
                <span>+ रू {activeOrder.surgePayNpr}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>❤️ Customer Tip:</span>
                <span>+ रू {activeOrder.tipNpr}</span>
              </div>
            </div>
          )}

          {/* Route Milestones */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
            {/* Step 1 Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-teal-400 uppercase">Pickup ({activeOrder.distanceToStoreKm} km)</span>
                </div>
                <p className="text-xs font-bold text-white">{activeOrder.darkStoreHub.name}</p>
                <p className="text-[11px] text-slate-400">{activeOrder.darkStoreHub.landmark}</p>
              </div>
            </div>

            {/* Step 2 Dropoff */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-purple-400 uppercase">Dropoff ({activeOrder.distanceToCustomerKm} km)</span>
                </div>
                <p className="text-xs font-bold text-white">{activeOrder.deliveryAddress.street}</p>
                <p className="text-[11px] text-slate-400">
                  {activeOrder.deliveryAddress.area}, {activeOrder.deliveryAddress.city}
                </p>
              </div>
            </div>
          </div>

          {/* Items Summary & Age Check Notice */}
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Bag Contents ({activeOrder.items.length} Products):
              </span>
              {activeOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="text-slate-500 font-mono">{item.unit}</span>
                </div>
              ))}
            </div>

            {activeOrder.requiresAgeCheck && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Requires 18+ Age & ID Check on Doorstep</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={rejectOrder}
              className="py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Decline
            </button>
            <button
              onClick={acceptOrder}
              className="py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>ACCEPT DELIVERY (45m)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 4. ACTIVE DELIVERY PROGRESSION PIPELINE
  // ============================================================
  const totalAmount = activeOrder.totalAmountNpr;
  const cashNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashNum - totalAmount);
  const allVerified = activeOrder.items.every((i) => i.isVerified);

  const handleFinishDoorstepDelivery = () => {
    let cashCollected = 0;
    let qrAmount = 0;
    let changeGiven = 0;

    if (paymentMode === 'cash') {
      cashCollected = totalAmount;
      changeGiven = changeDue;
    } else if (paymentMode === 'qr_online') {
      qrAmount = totalAmount;
    } else if (paymentMode === 'split') {
      cashCollected = parseFloat(splitCashAmount) || 0;
      qrAmount = parseFloat(splitQrAmount) || 0;
    }

    completeDoorstepDelivery({
      mode: paymentMode,
      cashCollected,
      changeGiven,
      qrAmount,
      qrRef: qrRefNumber.trim() || 'REF-VERIFIED',
      isAgeVerified,
    });
  };

  return (
    <div className="space-y-4">
      {/* Real-time Tactical Dark GPS Map */}
      <LiveDeliveryMap order={activeOrder} currentStep={activeOrder.currentStep} />

      {/* SLA Timer Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-white">45-Minute Delivery SLA</span>
        </div>
        <span className="font-black text-emerald-400">
          ⚡ ~{activeOrder.slaDeadlineMins} Mins Remaining
        </span>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: EN ROUTE TO STORE HUB */}
      {/* ============================================================ */}
      {activeOrder.currentStep === 'navigating_to_store' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-teal-400">
              <Store className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Step 1: Ride to Store Hub</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{activeOrder.orderNumber}</span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{activeOrder.darkStoreHub.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{activeOrder.darkStoreHub.address}</p>
            <p className="text-xs text-teal-300 font-semibold mt-1">
              📍 Landmark: {activeOrder.darkStoreHub.landmark}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Hub Storekeeper:</span>
              <span className="font-mono text-white font-bold">+977 {activeOrder.darkStoreHub.phone}</span>
            </div>
            <a
              href={`tel:${activeOrder.darkStoreHub.phone}`}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-teal-300 font-bold text-xs flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> Call Hub
            </a>
          </div>

          <button
            onClick={advanceStep}
            className="w-full py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I HAVE ARRIVED AT DARK STORE HUB</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: VERIFYING ITEMS & BAG SEAL AT STORE HUB */}
      {/* ============================================================ */}
      {activeOrder.currentStep === 'verifying_at_store' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Step 2: Inspect Bag Items</span>
            </div>
            <button
              onClick={verifyAllItems}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Verify All</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Check each product into your Mojjo insulated delivery backpack:
          </p>

          <div className="space-y-2">
            {activeOrder.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItemVerification(item.id)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  item.isVerified
                    ? 'bg-teal-500/15 border-teal-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                  )}
                  <div>
                    <p className="text-xs font-bold">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{item.unit} • Qty: {item.quantity}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    item.isVerified ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  ✓
                </div>
              </button>
            ))}
          </div>

          {/* Tamper Seal Badge */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Tamper-Proof Bag Seal:</span>
            <span className="font-mono font-bold text-amber-400">{activeOrder.bagSealCode}</span>
          </div>

          <button
            onClick={advanceStep}
            className="w-full py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>BAG PACKED ➔ START 45-MIN DELIVERY</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: EN ROUTE TO CUSTOMER */}
      {/* ============================================================ */}
      {activeOrder.currentStep === 'out_for_delivery' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Bike className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Step 3: En Route to Customer</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{activeOrder.orderNumber}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Customer & Address</span>
            <h3 className="text-lg font-black text-white">{activeOrder.customerName}</h3>
            <p className="text-xs text-slate-300 mt-1">{activeOrder.deliveryAddress.street}</p>
            <p className="text-xs text-purple-300 font-semibold mt-0.5">
              📍 Landmark: {activeOrder.deliveryAddress.landmark}
            </p>
          </div>

          {/* Gate & Entry Instructions */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
            <span className="text-[10px] font-bold text-purple-300 uppercase block">
              🚪 Gate & Doorbell Instructions:
            </span>
            <p className="text-xs text-slate-200">
              "{activeOrder.deliveryAddress.gateInstructions}"
            </p>
          </div>

          {/* Quick Communication Actions */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={`tel:${activeOrder.customerPhone}`}
              className="py-3 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-teal-300 font-bold flex items-center justify-center gap-1.5 shadow-xs hover:border-teal-500"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>Call Customer</span>
            </a>

            <a
              href={`https://wa.me/977${activeOrder.customerPhone}?text=${encodeURIComponent(
                `Namaste ${activeOrder.customerName}, your Mojjo 45-min delivery (${activeOrder.orderNumber}) is arriving outside your gate now!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold flex items-center justify-center gap-1.5 shadow-xs hover:border-emerald-500"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp ETA</span>
            </a>
          </div>

          <button
            onClick={advanceStep}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            <span>I HAVE ARRIVED AT CUSTOMER DOOR</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: DOORSTEP PAYMENT SETTLEMENT & FINAL HANDOVER */}
      {/* ============================================================ */}
      {activeOrder.currentStep === 'arrived_at_customer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-wider">Step 4: Doorstep Settlement & Handover</span>
            </div>
            <span className="text-xs font-bold text-slate-400">{activeOrder.orderNumber}</span>
          </div>

          {/* Total Bill Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Bill to Collect</span>
              <p className="text-2xl font-black text-white">
                रू {totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Customer</span>
              <p className="text-xs font-bold text-teal-300">{activeOrder.customerName}</p>
            </div>
          </div>

          {/* Doorstep Payment Mode Switcher */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              How is the Customer Paying?
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {/* Option 1: Cash */}
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>💵 Cash</span>
              </button>

              {/* Option 2: QR Code */}
              <button
                type="button"
                onClick={() => setPaymentMode('qr_online')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'qr_online'
                    ? 'bg-purple-600 text-white border-purple-600 font-black shadow-md shadow-purple-600/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>📱 QR Code</span>
              </button>

              {/* Option 3: Split Pay */}
              <button
                type="button"
                onClick={() => setPaymentMode('split')}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'split'
                    ? 'bg-teal-500 text-slate-950 border-teal-500 font-black shadow-md shadow-teal-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Split className="w-4 h-4" />
                <span>🔀 Split Pay</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CASH MODE: Change Calculator */}
          {/* ============================================================ */}
          {paymentMode === 'cash' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Cash Handed by Customer (NPR):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-black text-white focus:outline-hidden focus:border-teal-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setCashGiven(totalAmount.toString())}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Exact
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashGiven((Math.ceil(totalAmount / 1000) * 1000).toString())}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300"
                  >
                    रू {(Math.ceil(totalAmount / 1000) * 1000).toLocaleString()}
                  </button>
                </div>
              </div>

              {/* Change Output */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Change to return customer:</span>
                <span className={`text-base font-black ${changeDue > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  रू {changeDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* QR ONLINE MODE: Dynamic In-Person QR Code */}
          {/* ============================================================ */}
          {paymentMode === 'qr_online' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-300 block">Fonepay / eSewa / Khalti QR</span>
                  <span className="text-[11px] text-slate-400">Ask customer to scan with any banking app</span>
                </div>
              </div>

              {/* High-res Scannable QR Code */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=mojjo-pay://order/${activeOrder.orderNumber}?amount=${totalAmount}`}
                  alt="Payment QR"
                  className="w-40 h-40 rounded-lg"
                />
                <div className="text-center text-slate-950">
                  <p className="font-extrabold text-sm">Mojjo Quick Commerce Hub</p>
                  <p className="font-black text-emerald-700 text-base">रू {totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-600 font-mono">Bill Ref: {activeOrder.orderNumber}</p>
                </div>
              </div>

              {/* Transaction Ref Number */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400">
                  Customer eSewa / Bank Transaction Ref # (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9842145892"
                  value={qrRefNumber}
                  onChange={(e) => setQrRefNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SPLIT PAYMENT MODE */}
          {/* ============================================================ */}
          {paymentMode === 'split' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3 text-xs">
              <span className="font-bold text-teal-300 block">Split Payment Distribution</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Cash Part (NPR)</label>
                  <input
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => setSplitCashAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">QR Part (NPR)</label>
                  <input
                    type="number"
                    value={splitQrAmount}
                    onChange={(e) => setSplitQrAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-purple-400 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 18+ Age & Legal Compliance Checkbox */}
          {activeOrder.requiresAgeCheck && (
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isAgeVerified}
                onChange={(e) => setIsAgeVerified(e.target.checked)}
                className="rounded text-teal-500 w-4 h-4 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">
                I have verified that the recipient is <strong className="text-white">18 years or older</strong> for liquor delivery.
              </span>
            </label>
          )}

          {/* 4-Digit Customer OTP Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" /> Ask Customer for 4-Digit Delivery OTP
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Demo Code: {activeOrder.otpCode}</span>
            </label>
            <input
              type="text"
              maxLength={4}
              placeholder="e.g. 4921"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-center text-xl font-mono tracking-widest text-emerald-400 font-black focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinishDoorstepDelivery}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>CONFIRM PAYMENT & COMPLETE DELIVERY</span>
          </button>
        </div>
      )}
    </div>
  );
}
