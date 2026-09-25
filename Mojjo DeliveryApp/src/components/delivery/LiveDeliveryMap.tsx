'use client';

import React, { useEffect, useState } from 'react';
import { Bike, MapPin, Store, Navigation2, Compass, Radio, Play, Pause, Smartphone } from 'lucide-react';
import { ActiveDeliveryOrder, DeliveryStep, GpsLocation } from '../../types/rider';
import { useRiderStore } from '../../services/riderStore';
import { deliveryGpsService } from '../../services/deliveryGpsService';

interface LiveDeliveryMapProps {
  order: ActiveDeliveryOrder;
  currentStep: DeliveryStep;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({ order, currentStep }) => {
  const gpsState = useRiderStore((s) => s.gpsState);
  const startGpsPublishing = useRiderStore((s) => s.startGpsPublishing);
  const stopGpsPublishing = useRiderStore((s) => s.stopGpsPublishing);
  const updateGpsLocation = useRiderStore((s) => s.updateGpsLocation);

  const [currentLoc, setCurrentLoc] = useState<GpsLocation | null>(gpsState.lastLocation);
  const [serverSynced, setServerSynced] = useState<boolean>(gpsState.serverSynced);

  useEffect(() => {
    // Subscribe to live GPS changes from service
    const unsubscribe = deliveryGpsService.subscribe((loc, synced) => {
      setCurrentLoc(loc);
      setServerSynced(synced);
      updateGpsLocation(loc, synced);
    });

    // Auto-start GPS if not already publishing during delivery
    if (!deliveryGpsService.getIsPublishing()) {
      startGpsPublishing('simulation');
    }

    return () => {
      unsubscribe();
    };
  }, [order.id]);

  const isNavigatingToStore = currentStep === 'navigating_to_store';
  const isOutForDelivery = currentStep === 'out_for_delivery';
  const isArrivedAtCustomer = currentStep === 'arrived_at_customer';

  const destinationName = isNavigatingToStore
    ? order.darkStoreHub.name
    : order.deliveryAddress.street;

  const destinationType = isNavigatingToStore ? 'STORE PICKUP' : 'CUSTOMER DROPOFF';
  const targetDistance = isNavigatingToStore ? `${order.distanceToStoreKm} km` : `${order.distanceToCustomerKm} km`;

  const handleToggleMode = () => {
    const nextMode = gpsState.mode === 'simulation' ? 'device_gps' : 'simulation';
    startGpsPublishing(nextMode);
  };

  const handleTogglePublishing = () => {
    if (gpsState.isPublishing) {
      stopGpsPublishing();
    } else {
      startGpsPublishing(gpsState.mode);
    }
  };

  const speed = currentLoc?.speedKmH ?? 28;
  const heading = currentLoc?.heading ?? 45;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#07131b] border border-slate-800 shadow-2xl space-y-0">
      {/* Tactical Map Viewport */}
      <div className="relative h-60 w-full overflow-hidden">
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

        {/* RIDER BIKE MARKER (Pulsing GPS Pin with Heading Orientation) */}
        <div
          className="absolute top-[54%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700"
        >
          <div className="relative">
            <div
              style={{ transform: `rotate(${heading}deg)` }}
              className="w-11 h-11 rounded-full bg-teal-500/25 border-2 border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/50 transition-transform duration-500"
            >
              <Bike className="w-6 h-6 text-teal-300" />
            </div>
            {gpsState.isPublishing && (
              <span className="absolute -inset-1.5 rounded-full bg-teal-400 opacity-75 animate-ping pointer-events-none" />
            )}
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/95 text-[9px] font-black text-teal-300 border border-teal-500/40 shadow-md">
            {speed} km/h • GPS 📍
          </span>
        </div>

        {/* STORE HUB MARKER */}
        <div className="absolute top-[28%] left-[56%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-teal-400 text-teal-400 flex items-center justify-center shadow-lg">
            <Store className="w-4 h-4" />
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-bold text-slate-300 border border-slate-800">
            HUB-01
          </span>
        </div>

        {/* CUSTOMER DESTINATION MARKER */}
        <div className="absolute top-[22%] left-[84%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 border-2 border-white">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[9px] font-bold text-purple-300 border border-purple-500/30">
            DOORSTEP
          </span>
        </div>

        {/* TOP FLOATING GPS BROADCAST STATUS BAR */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          <div className="px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 text-[10px] font-bold shadow-md">
            <span
              className={`w-2 h-2 rounded-full ${
                gpsState.isPublishing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className={gpsState.isPublishing ? 'text-emerald-400' : 'text-slate-400'}>
              {gpsState.isPublishing
                ? serverSynced
                  ? 'BROADCASTING LIVE TO CUSTOMER'
                  : 'GPS ACTIVE (LOCAL STREAM)'
                : 'GPS BROADCAST PAUSED'}
            </span>
          </div>

          <button
            onClick={handleToggleMode}
            className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 flex items-center gap-1 text-[10px] font-bold text-amber-300 transition-colors shadow-md"
            title="Switch GPS Mode"
          >
            {gpsState.mode === 'simulation' ? (
              <>
                <Radio className="w-3 h-3 text-amber-400" />
                <span>Kathmandu Sim Route</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-teal-400" />
                <span>Phone Real GPS</span>
              </>
            )}
          </button>
        </div>

        {/* BOTTOM TURN-BY-TURN INSTRUCTION BAR */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800/90 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
              <Navigation2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider">
                  {destinationType}
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-[9px] text-slate-400">{targetDistance}</span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[170px]">
                {destinationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePublishing}
              className={`px-2.5 py-1.5 rounded-xl font-black text-[11px] flex items-center gap-1 transition-all ${
                gpsState.isPublishing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {gpsState.isPublishing ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Stream</span>
                </>
              )}
            </button>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                destinationName + ' Kathmandu Lalitpur Nepal'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[11px] shadow-md transition-all flex items-center gap-1"
            >
              <span>MAPS</span>
            </a>
          </div>
        </div>
      </div>

      {/* GPS LIVE TELEMETRY BAR */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-around text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Speed</span>
          <span className="text-sm font-black text-teal-300 font-mono">{speed} km/h</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Bearing</span>
          <span className="text-sm font-black text-white font-mono">{heading}° N</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Coordinates</span>
          <span className="text-[11px] font-mono font-bold text-slate-300">
            {currentLoc ? `${currentLoc.latitude.toFixed(4)}, ${currentLoc.longitude.toFixed(4)}` : '27.6915, 85.3420'}
          </span>
        </div>
      </div>
    </div>
  );
};
