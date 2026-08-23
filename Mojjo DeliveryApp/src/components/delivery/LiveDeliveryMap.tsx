'use client';

import React from 'react';
import { Bike, MapPin, Store, Navigation2, Compass, AlertCircle } from 'lucide-react';
import { ActiveDeliveryOrder, DeliveryStep } from '../../types/rider';

interface LiveDeliveryMapProps {
  order: ActiveDeliveryOrder;
  currentStep: DeliveryStep;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({ order, currentStep }) => {
  const isNavigatingToStore = currentStep === 'navigating_to_store';
  const isOutForDelivery = currentStep === 'out_for_delivery';
  const isArrivedAtCustomer = currentStep === 'arrived_at_customer';

  const destinationName = isNavigatingToStore
    ? order.darkStoreHub.name
    : order.deliveryAddress.street;

  const destinationType = isNavigatingToStore ? 'STORE PICKUP' : 'CUSTOMER DROPOFF';
  const targetDistance = isNavigatingToStore ? `${order.distanceToStoreKm} km` : `${order.distanceToCustomerKm} km`;
  const estimatedMins = isNavigatingToStore ? 4 : 10;

  return (
    <div className="relative w-full h-56 rounded-3xl overflow-hidden bg-[#07131b] border border-slate-800 shadow-2xl">
      {/* Tactical Dark Map Canvas Background */}
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#143144_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Simulated Road Grid Lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M -20 180 Q 80 120, 160 130 T 320 80 T 450 50"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="6"
        />
        <path
          d="M 160 130 L 160 220"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="5"
        />
        <path
          d="M 50 40 L 400 170"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="4"
        />
        
        {/* Active Route Glowing Polyline */}
        <path
          d={
            isNavigatingToStore
              ? 'M 60 160 Q 110 140, 170 120 T 260 70'
              : 'M 170 120 Q 230 110, 290 85 T 370 65'
          }
          fill="none"
          stroke="#14b8a6"
          strokeWidth="4"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
      </svg>

      {/* RIDER BIKE MARKER (Pulsing GPS Pin) */}
      <div className="absolute top-[58%] left-[16%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/50">
            <Bike className="w-5 h-5 text-teal-300" />
          </div>
          <span className="absolute -inset-1 rounded-full bg-teal-400 opacity-75 animate-ping pointer-events-none" />
        </div>
        <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-black text-teal-300 border border-teal-500/30">
          YOU (GPS 3m)
        </span>
      </div>

      {/* STORE HUB MARKER */}
      <div className="absolute top-[28%] left-[54%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-teal-400 text-teal-400 flex items-center justify-center shadow-lg">
          <Store className="w-4 h-4" />
        </div>
        <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-bold text-slate-300 border border-slate-800">
          HUB-01
        </span>
      </div>

      {/* CUSTOMER DESTINATION MARKER */}
      <div className="absolute top-[22%] left-[86%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 border-2 border-white">
          <MapPin className="w-4 h-4" />
        </div>
        <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-bold text-purple-300 border border-purple-500/30">
          DROP
        </span>
      </div>

      {/* TOP FLOATING GPS HUD BAR */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE SATELLITE TRACKING</span>
        </div>

        <div className="px-2 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300">
          <Compass className="w-3 h-3 text-teal-400" />
          <span>KTM 27.68° N</span>
        </div>
      </div>

      {/* BOTTOM TURN-BY-TURN INSTRUCTION BAR */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800/90 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
            <Navigation2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                {destinationType}
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-[10px] text-slate-400">{targetDistance}</span>
            </div>
            <p className="text-xs font-bold text-white truncate max-w-[190px]">
              {destinationName}
            </p>
          </div>
        </div>

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            destinationName + ' Kathmandu Lalitpur Nepal'
          )}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1"
        >
          <span>MAPS</span>
        </a>
      </div>
    </div>
  );
};
