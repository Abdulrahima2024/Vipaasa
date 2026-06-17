"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Clock, Sparkles, ShoppingCart, Award } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

interface DealItem {
  id: string;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  weight: "1kg" | "500g" | "250g";
  badge: string;
  claimedPercentage: number;
  stars: number;
  reviewsCount: number;
}

export default function DealsSection() {
  const { addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 48 });

  // Mock deals matching real products in database
  const deals: DealItem[] = [
    {
      id: "40", // Desi Cow Ghee
      name: "Desi Cow Ghee (A2 Vedic Churned)",
      category: "Honey & Ghee",
      image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
      originalPrice: 4200,
      dealPrice: 3499,
      weight: "1kg",
      badge: "Best Seller • Save 17%",
      claimedPercentage: 82,
      stars: 4.9,
      reviewsCount: 1842,
    },
    {
      id: "37", // Wild Forest Honey
      name: "Raw Wild Forest Honey",
      category: "Honey & Ghee",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
      originalPrice: 420,
      dealPrice: 299,
      weight: "1kg",
      badge: "Deal of the Day • Save 29%",
      claimedPercentage: 64,
      stars: 4.8,
      reviewsCount: 894,
    },
    {
      id: "1", // Kandipappu
      name: "Premium Kandipappu (Toor Dal)",
      category: "Dals & Pulses",
      image: "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400",
      originalPrice: 240,
      dealPrice: 169,
      weight: "1kg",
      badge: "Lightning Deal • Save 30%",
      claimedPercentage: 47,
      stars: 4.7,
      reviewsCount: 1230,
    },
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 6; // Reset to 6 hours
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddDealToCart = (deal: DealItem) => {
    const formattedProduct = {
      id: deal.id,
      name: deal.name,
      category: deal.category,
      image: deal.image,
      prices: {
        [deal.weight]: deal.dealPrice,
      },
    };
    addToCart(formattedProduct, deal.weight);
  };

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <section className="bg-gradient-to-br from-[#FFEBEB] via-[#FFF8F0] to-[#FFFBF5] border border-[#FFD2D2] rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-md">
      {/* Decorative background elements for Amazon-like pop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#FFD2D2]/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#A84444] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white text-white" /> Lightning Deals
            </span>
            <span className="text-amber-700 bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              Limited-Time Offers
            </span>
          </div>
          
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#7C1A1A] leading-tight">
            Super Saver Harvest Sale
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-semibold">
            Pure organic essentials at unmatched prices. Real-time stock alerts & hourly deals.
          </p>
        </div>

        {/* Live Timer Countdown */}
        {mounted && (
          <div className="flex items-center gap-3 bg-[#8C2323] text-white px-4 py-2.5 rounded-2xl shadow-inner border border-[#A84444]">
            <Clock className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[10px] font-extrabold uppercase text-amber-100 tracking-wider">Ends In:</span>
            <div className="flex items-center gap-1 font-mono text-sm font-extrabold text-white">
              <span className="bg-[#5C1515] px-2 py-0.5 rounded shadow-sm">{formatNumber(timeLeft.hours)}</span>
              <span>:</span>
              <span className="bg-[#5C1515] px-2 py-0.5 rounded shadow-sm">{formatNumber(timeLeft.minutes)}</span>
              <span>:</span>
              <span className="bg-[#5C1515] px-2 py-0.5 rounded shadow-sm">{formatNumber(timeLeft.seconds)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {deals.map((deal) => {
          const discount = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
          return (
            <div
              key={deal.id}
              className="bg-white border-2 border-[#FFD2D2]/40 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#A84444]/40 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Product Badge Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#A84444] text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded-md tracking-wider flex items-center gap-1 shadow-sm">
                  {deal.badge}
                </span>
              </div>

              {/* Product Image Wrapper */}
              <div className="relative w-full aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden mb-4 border border-gray-100">
                <Link href={`/products/${deal.id}`} className="block w-full h-full relative">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Hover overlay shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </Link>
              </div>

              {/* Details & Controls */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {deal.category}
                  </span>
                  
                  <Link href={`/products/${deal.id}`} className="block mt-2">
                    <h4 className="font-sans text-sm sm:text-base font-bold text-[#113C27] hover:text-[#A84444] transition-colors leading-snug">
                      {deal.name}
                    </h4>
                  </Link>

                  {/* Rating Review */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-[#A84444] leading-none mt-0.5 ml-1">
                      {deal.stars.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold">
                      ({deal.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Price Box with Savings tag */}
                <div className="flex items-end justify-between bg-[#FFF5F5] border border-[#FFD2D2]/30 p-3 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#A84444] font-extrabold uppercase tracking-wide">
                      Deal Price ({deal.weight})
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-black text-red-600">
                        ₹{deal.dealPrice}
                      </span>
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        ₹{deal.originalPrice}
                      </span>
                    </div>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
                    {discount}% OFF
                  </span>
                </div>

                {/* Claimed Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-gray-600">
                    <span className="flex items-center gap-1 text-red-700">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {deal.claimedPercentage}% Claimed
                    </span>
                    <span className="text-[#A84444]">Limited Stock Left</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${deal.claimedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Buy Button & Direct Add-to-Cart */}
                <button
                  type="button"
                  onClick={() => handleAddDealToCart(deal)}
                  className="w-full bg-gradient-to-r from-[#B93C3C] to-[#8C2323] hover:from-[#A12E2E] hover:to-[#731919] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-red-700/10 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  Add Deal to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile-friendly bottom "View All" button */}
      <div className="flex justify-center mt-8">
        <Link
          href="/deals"
          className="bg-[#7C1A1A] hover:bg-[#A84444] text-white font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full shadow-md hover:shadow-[#A84444]/20 active:scale-95 transition-all flex items-center gap-2 border border-[#FFD2D2]/30"
        >
          <span>View All Deals</span>
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
