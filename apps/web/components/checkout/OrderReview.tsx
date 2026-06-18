import React, { useState } from "react";
import { Address } from "./AddressSelector";
import { CartItem } from "../../store/useCartStore";
import { parseEmojiImage } from "../../lib/image";

interface OrderReviewProps {
  address: Address;
  items: CartItem[];
  onProceed: () => void;
  onBack: () => void;
}

export default function OrderReview({ address, items, onProceed, onBack }: OrderReviewProps) {
  const activeItems = items.filter(item => !item.saved);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27] mb-2 tracking-tight">
          Review Your Order
        </h2>
        <p className="text-sm text-[#5C6E61] font-medium">
          Please verify your shipping details and items before proceeding.
        </p>
      </div>

      {/* Address Review Card */}
      <div className="bg-white border border-[#EAE6DB] rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] space-y-6 text-sm font-semibold text-[#5C6E61]">
        <div className="flex items-center justify-between border-b border-[#EAE6DB]/60 pb-4">
          <span className="font-serif text-lg font-bold text-[#113C27]">Shipping Address</span>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#1B4332] hover:text-[#113C27] hover:underline"
          >
            Change Address
          </button>
        </div>
        <div className="space-y-1">
          <p className="text-[#1F3E2F] font-bold text-base">{address.name}</p>
          <p>{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}</p>
          <p>{address.city}, {address.state} {address.postalCode}</p>
          <p>{address.country}</p>
          <p className="pt-2 flex items-center gap-1 text-[#1F3E2F] font-bold text-xs">
            <svg className="w-3.5 h-3.5 text-[#738276]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.145-.44.02-9.27.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            {address.phone}
          </p>
        </div>

        {/* Billing address section */}
        <div className="pt-4 border-t border-[#EAE6DB]/60 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBillingSameAsShipping(!billingSameAsShipping)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                billingSameAsShipping ? "border-[#1B4332] bg-[#1B4332]" : "border-[#D1C9B8]"
              }`}
            >
              {billingSameAsShipping && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
            <span className="text-xs text-[#1F3E2F] font-bold">Billing address is same as shipping address</span>
          </div>

          {!billingSameAsShipping && (
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl text-xs space-y-1">
              <p className="text-[#1F3E2F] font-bold">Ananya Sharma</p>
              <p>The Hub, Floor 12, Cyber City, Phase III</p>
              <p>Gurugram, Haryana 122002</p>
              <p>India</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Items Review */}
      <div className="bg-white border border-[#EAE6DB] rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#113C27] border-b border-[#EAE6DB]/60 pb-3">
          Basket Items ({activeItems.length})
        </h3>
        <div className="divide-y divide-[#EAE6DB]/60">
          {activeItems.map((item) => (
            <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
              {(() => {
                const emojiInfo = parseEmojiImage(item.image);
                return emojiInfo.isEmoji ? (
                  <div
                    className="w-16 h-16 flex items-center justify-center text-3xl rounded-lg border border-[#EAE6DB]/40 bg-[#FAF8F5] select-none"
                    style={{ backgroundColor: emojiInfo.bgColor }}
                  >
                    {emojiInfo.emoji}
                  </div>
                ) : (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-[#EAE6DB]/40 bg-[#FAF8F5]"
                  />
                );
              })()}
              <div className="flex-1 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-[#1F3E2F] text-[15px]">{item.name}</h4>
                  <p className="text-xs text-[#738276] mt-0.5">{item.spec}</p>
                  <p className="text-xs text-[#5C6E61] mt-2 font-bold bg-[#FAF8F5] inline-block px-2.5 py-1 rounded-md">
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-[#113C27] text-sm tabular-nums">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#EAE6DB]/40">
        <button
          onClick={onProceed}
          className="flex-1 bg-[#1B4332] hover:bg-[#113C27] text-white py-4 px-8 rounded-xl font-bold transition-all shadow-md shadow-green-950/10 active:scale-[0.98]"
        >
          Proceed to Payment
        </button>
        <button
          onClick={onBack}
          className="bg-white border border-[#EAE6DB] hover:border-[#738276] text-[#113C27] py-4 px-8 rounded-xl font-bold transition-all hover:bg-[#FAF8F5]"
        >
          Back to Address
        </button>
      </div>
    </div>
  );
}
