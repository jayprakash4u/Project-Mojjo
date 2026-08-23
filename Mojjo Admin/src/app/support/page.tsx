'use client';

import React, { useState } from 'react';
import {
  Headphones,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck,
  Bike,
  MessageSquare,
  FileText,
  Search,
} from 'lucide-react';

type SupportSubTab = 'Complaints' | 'Tickets' | 'DeliveryIssues' | 'AgeVerification';

interface SupportTicket {
  id: string;
  ticketNo: string;
  type: 'Complaint' | 'Ticket' | 'DeliveryIssue' | 'AgeVerification';
  customerName: string;
  customerPhone: string;
  orderNumber?: string;
  subject: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'InProgress' | 'Resolved';
  createdAt: string;
}

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 't-1',
    ticketNo: 'TIC-1092',
    type: 'DeliveryIssue',
    customerName: 'Bikash Adhikari',
    customerPhone: '9803344556',
    orderNumber: 'MOJ-94824',
    subject: 'Rider unable to locate house gate in New Baneshwor',
    description: 'Customer specified near Everest Hotel opposite gate 4. Rider contacted via dispatch.',
    priority: 'High',
    status: 'InProgress',
    createdAt: '10 mins ago',
  },
  {
    id: 't-2',
    ticketNo: 'TIC-1091',
    type: 'AgeVerification',
    customerName: 'Suman Shrestha',
    customerPhone: '9811223344',
    subject: 'Citizenship / Driving License 18+ KYC Upload',
    description: 'Customer submitted Nagarikta for legal age alcohol ordering compliance.',
    priority: 'Medium',
    status: 'Open',
    createdAt: '25 mins ago',
  },
  {
    id: 't-3',
    ticketNo: 'TIC-1090',
    type: 'Complaint',
    customerName: 'Prashant KC',
    customerPhone: '9845566778',
    orderNumber: 'MOJ-94819',
    subject: 'Cold drinks temperature check request',
    description: 'Customer wanted to confirm if Red Bull arrives chilled on express bike.',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2 hours ago',
  },
];

export default function SupportDeskPage() {
  const [activeSubTab, setActiveSubTab] = useState<SupportSubTab>('Complaints');
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_TICKETS);

  const filtered = tickets.filter((t) => {
    if (activeSubTab === 'Complaints' && t.type !== 'Complaint') return false;
    if (activeSubTab === 'Tickets' && t.type !== 'Ticket') return false;
    if (activeSubTab === 'DeliveryIssues' && t.type !== 'DeliveryIssue') return false;
    if (activeSubTab === 'AgeVerification' && t.type !== 'AgeVerification') return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-teal-400" />
            <span>Support Command & Customer Helpdesk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Resolve buyer complaints, address delivery issues & verify 18+ age identification
          </p>
        </div>
      </div>

      {/* 4 Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveSubTab('Complaints')}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
            activeSubTab === 'Complaints'
              ? 'bg-rose-600 text-white border-rose-600 font-extrabold shadow-md shadow-rose-600/20'
              : 'bg-slate-900 text-rose-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Complaints</span>
        </button>

        <button
          onClick={() => setActiveSubTab('Tickets')}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
            activeSubTab === 'Tickets'
              ? 'bg-teal-500 text-slate-950 border-teal-500 font-extrabold shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Support Tickets</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DeliveryIssues')}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
            activeSubTab === 'DeliveryIssues'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-amber-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Delivery Issues</span>
        </button>

        <button
          onClick={() => setActiveSubTab('AgeVerification')}
          className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
            activeSubTab === 'AgeVerification'
              ? 'bg-purple-500 text-white border-purple-500 font-extrabold shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-purple-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Customer Verification (18+ KYC)</span>
        </button>
      </div>

      {/* Tickets Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-500">
            No active records in this section. All customer issues resolved!
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-teal-400">{t.ticketNo}</span>
                  <span className="text-xs font-black text-white">{t.subject}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Open'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : t.status === 'InProgress'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {t.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Customer: <strong className="text-white">{t.customerName}</strong> (+977 {t.customerPhone})
                </span>
                <span>{t.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
