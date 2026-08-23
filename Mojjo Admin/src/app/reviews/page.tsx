'use client';

import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

interface CustomerReview {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  reviewText: string;
  orderNumber: string;
  date: string;
  isVerifiedBuyer: boolean;
  status: 'Approved' | 'Pending';
}

const SAMPLE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Jay Prakash Yadav',
    productName: 'Premium Single Malt Whisky',
    rating: 5,
    reviewText: 'Delivered in under 20 minutes to Jhamsikhel! Perfect ice cold condition and authentic seal.',
    orderNumber: 'MOJ-94821',
    date: 'Today, 2:30 PM',
    isVerifiedBuyer: true,
    status: 'Approved',
  },
  {
    id: 'rev-2',
    customerName: 'Aayush Maharjan',
    productName: 'Craft IPA Beer Pack',
    rating: 5,
    reviewText: 'Great packaging and the rider was super polite. Best late-night delivery service in Lalitpur.',
    orderNumber: 'MOJ-94822',
    date: 'Yesterday',
    isVerifiedBuyer: true,
    status: 'Approved',
  },
  {
    id: 'rev-3',
    customerName: 'Sunita Thapa',
    productName: 'Artisan Salted Chips',
    rating: 4,
    reviewText: 'Fresh and crispy, arrived together with my soft drinks in one single bag.',
    orderNumber: 'MOJ-94823',
    date: '2 days ago',
    isVerifiedBuyer: true,
    status: 'Approved',
  },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(SAMPLE_REVIEWS);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400 fill-current" />
            <span>Product & Delivery Reviews</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Customer feedback ratings for Kathmandu quick commerce delivery
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs">
                  {rev.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">{rev.customerName}</h3>
                  <p className="text-[10px] text-slate-400">{rev.date} • {rev.orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center text-amber-400 text-xs font-bold gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] text-teal-400 font-bold block">{rev.productName}</span>
              <p className="italic">"{rev.reviewText}"</p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                {rev.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
