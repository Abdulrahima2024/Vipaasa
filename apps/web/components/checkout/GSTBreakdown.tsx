import React from "react";
import { CartItem } from "../../store/useCartStore";

interface GSTBreakdownProps {
  items: CartItem[];
}

export default function GSTBreakdown({ items }: GSTBreakdownProps) {
  const activeItems = items.filter(item => !item.saved);
  const itemCount = activeItems.reduce((acc, item) => acc + item.quantity, 0);
  
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
  const total = parseFloat((subtotal + shippingFee + estimatedTax).toFixed(2));

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
      </div>

      <hr className="border-[#EAE6DB]" />

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
