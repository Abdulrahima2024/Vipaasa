import React, { useState, useEffect } from "react";
import { CartItem } from "../../store/useCartStore";
import { fetchApi } from "../../lib/api";
import { io, Socket } from "socket.io-client";

interface GSTBreakdownProps {
  items: CartItem[];
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponDiscount: number;
  setCouponDiscount: (discount: number) => void;
}

export default function GSTBreakdown({ items, couponCode, setCouponCode, couponDiscount, setCouponDiscount }: GSTBreakdownProps) {
  const activeItems = items.filter(item => !item.saved);
  const itemCount = activeItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const [inputCode, setInputCode] = useState(couponCode);
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponsList, setShowCouponsList] = useState(false);

  // Load existing and real-time coupons
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const res = await fetchApi<{ data: any[] }>("/api/coupons");
        if (res && res.data) {
          setAvailableCoupons(res.data);
        }
      } catch (err) {
        console.error("Failed to load active coupons:", err);
      }
    };
    loadCoupons();

    // Initialize socket connection
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      transports: ["websocket"]
    });

    socket.on("coupon_created", (newCoupon: any) => {
      setAvailableCoupons((prev) => {
        // Prevent duplicates
        if (prev.find(c => c.code === newCoupon.code)) return prev;
        return [newCoupon, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Subtotal Calculation
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Shipping logic (Free above ₹1000)
  const freeShippingThreshold = 1000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 70; // Standard shipping fee of ₹70
  
  // GST Tax (5% matching Indian organic goods standard shown in mockup)
  const taxRate = 0.05;
  const estimatedTax = parseFloat((subtotal * taxRate).toFixed(2));
  
  // Total payable
  const total = parseFloat((subtotal + shippingFee + estimatedTax - couponDiscount).toFixed(2));

  const handleApplyCoupon = async () => {
    if (!inputCode.trim()) return;
    setIsValidating(true);
    setCouponError("");
    
    try {
      const res = await fetchApi<{ status: string, data: any }>("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: inputCode, orderAmount: subtotal })
      });
      
      if (res && res.data) {
        setCouponCode(inputCode);
        setCouponDiscount(res.data.discountAmount);
      }
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
      setCouponCode("");
      setCouponDiscount(0);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setInputCode("");
    setCouponDiscount(0);
    setCouponError("");
  };

  return (
    <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
        Order Summary
      </h2>

      {/* Breakdown lines */}
      <div className="space-y-4 text-[15px] font-semibold text-[#5C6E61]">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-[#113C27] tabular-nums">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between items-center">
          <span>Delivery Fee</span>
          <span className={`tabular-nums ${isFreeShipping ? "text-[#2D6A4F] font-bold" : "text-[#113C27]"}`}>
            {isFreeShipping ? "FREE" : `₹${shippingFee.toFixed(2)}`}
          </span>
        </div>

        {/* GST */}
        <div className="flex justify-between items-center">
          <span>Tax (GST 5%)</span>
          <span className="text-[#113C27] tabular-nums">₹{estimatedTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-[#A84444]">
            <span>Discount ({couponCode})</span>
            <span className="tabular-nums font-bold">-₹{couponDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <hr className="border-[#EAE6DB]" />

      {/* Coupon Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Discount code" 
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            disabled={couponDiscount > 0 || isValidating}
            className="flex-1 bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-2 text-sm font-semibold text-[#113C27] focus:outline-none focus:border-[#2D6A4F] disabled:opacity-50"
          />
          {couponDiscount > 0 ? (
            <button 
              onClick={handleRemoveCoupon}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          ) : (
            <button 
              onClick={handleApplyCoupon}
              disabled={!inputCode || isValidating}
              className="bg-[#113C27] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
            >
              {isValidating ? "..." : "Apply"}
            </button>
          )}
        </div>
        {couponError && <p className="text-red-500 text-xs font-bold">{couponError}</p>}
      </div>

      {/* Available Coupons */}
      {availableCoupons.length > 0 && couponDiscount === 0 && (
        <div className="space-y-2 animate-fade-in">
          <button
            type="button"
            onClick={() => setShowCouponsList(!showCouponsList)}
            className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1.5 hover:opacity-85 transition-opacity focus:outline-none w-full justify-between py-1 border-b border-dashed border-[#EAE6DB]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 0 0 2.037 0l4.318-4.318a1.44 1.44 0 0 0 0-2.037L10.03 3.659A2.25 2.25 0 0 0 8.432 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h.008v.008H7.5V7.5Z" />
              </svg>
              Available Coupons
            </span>
            <svg 
              className={`w-3.5 h-3.5 transition-transform duration-200 text-[#2D6A4F] ${showCouponsList ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          {showCouponsList && (
            <div className="flex flex-wrap gap-2 pt-1.5 animate-fade-in">
              {availableCoupons.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setInputCode(c.code);
                    setCouponError("");
                  }}
                  title={c.description || ""}
                  className={`border px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-start min-w-[100px] ${
                    inputCode === c.code 
                      ? "bg-[#C1F2D0] border-[#2D6A4F] text-[#113C27]" 
                      : "bg-[#F9F7F2] border-[#EAE6DB] text-[#4B594F] hover:bg-[#FAF8F5] hover:border-[#2D6A4F]"
                  }`}
                >
                  <span className="font-extrabold tracking-wider">{c.code}</span>
                  <span className="text-[10px] text-[#2D6A4F] mt-0.5">
                    {c.discountType === "PERCENTAGE" ? `${Number(c.discountValue)}% OFF` : `₹${Number(c.discountValue)} OFF`}
                  </span>
                  {c.minOrderAmount > 0 && (
                    <span className="text-[8px] text-[#738276] mt-0.5">Min: ₹{Number(c.minOrderAmount)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Total Section */}
      <div className="flex justify-between items-baseline py-1">
        <span className="text-lg font-bold text-[#113C27]">Total</span>
        <span className="text-3xl font-bold text-[#2D6A4F] tabular-nums">
          ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Free Shipping Dynamic Progress Alert */}
      {!isFreeShipping && (
        <div className="bg-[#FAF8F5] text-[#738276] px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed border border-[#EAE6DB]/60">
          Add <span className="text-[#113C27] font-bold">₹{(freeShippingThreshold - subtotal).toFixed(2)}</span> more to unlock <span className="text-[#2D6A4F] font-bold">Free Shipping</span>!
        </div>
      )}

      {/* Trust Badges */}
      <div className="pt-2 space-y-3 border-t border-[#EAE6DB]/40">
        <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-[#738276]">
          <svg className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <span>Secured Payment Processing</span>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-[#738276]">
          <svg className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Sustainable & Plastic-free Packaging</span>
        </div>
      </div>
    </div>
  );
}
