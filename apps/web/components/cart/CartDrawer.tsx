"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { parseEmojiImage } from "../../lib/image";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, updatingItemId, actionItemId } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use body overflow hidden when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const content = (
    <div className="relative z-[99999]">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header section from reference */}
        <div className="flex flex-col p-5 border-b border-[#EAE6DB]/60 bg-white gap-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="text-[#5C6E61] hover:text-[#113C27] text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Continue shopping
            </button>
            <button onClick={onClose} className="p-1 text-[#5C6E61] hover:text-[#113C27]">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-xl font-bold text-[#113C27]">Your Order</h2>
            <Link href="/cart" onClick={onClose} className="text-sm font-bold text-[#4B594F] underline hover:text-[#113C27]">
              View cart
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="font-bold text-[#113C27]">Products <span className="text-[#738276] text-sm font-normal">({totalItems})</span></h3>
            <svg className="w-4 h-4 text-[#738276]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <p className="text-[#113C27] font-bold text-lg">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[#113C27] text-white font-bold rounded hover:bg-[#2D6A4F] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const emojiInfo = parseEmojiImage(item.image);
                return (
                  <div key={item.id} className="flex gap-4 bg-white relative group">
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF9F5] rounded border border-[#EAE6DB]/40 overflow-hidden flex-shrink-0 relative">
                      {emojiInfo.isEmoji ? (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl"
                          style={{ backgroundColor: emojiInfo.bgColor }}
                        >
                          {emojiInfo.emoji}
                        </div>
                      ) : (
                        <img
                          src={emojiInfo.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-start gap-1">
                      <div className="pr-2">
                        <h4 className="font-semibold text-[#113C27] text-sm leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-sm font-normal text-[#4B594F] mt-0.5">
                          Rs. {item.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        {/* Quantity Selector - reference style */}
                        <div className="flex items-center border border-[#113C27] rounded overflow-hidden h-7 bg-white">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) removeItem(item.id);
                              else updateQuantity(item.id, -1);
                            }}
                            disabled={actionItemId === item.id}
                            className="px-2.5 h-full bg-[#113C27] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
                          >
                            <span className="font-bold">-</span>
                          </button>
                          
                          <div className="w-8 text-center flex items-center justify-center">
                            <span className="text-xs font-bold text-[#113C27] select-none tabular-nums">
                              {item.quantity}
                            </span>
                          </div>

                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={actionItemId === item.id}
                            className="px-2.5 h-full bg-[#113C27] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
                          >
                            <span className="font-bold">+</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updatingItemId === item.id || actionItemId === item.id}
                          className="text-xs text-[#5C6E61] underline hover:text-[#113C27] disabled:opacity-50"
                        >
                          {actionItemId === item.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-white p-5 space-y-4 border-t border-[#EAE6DB]/60">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#4B594F] font-normal text-sm">Subtotal:</span>
              <span className="font-normal text-[#113C27] text-base">Rs. {totalAmount.toFixed(2)}</span>
            </div>

            <Link href="/checkout" onClick={onClose} className="block w-full">
              <button className="w-full bg-[#113C27] hover:bg-[#2D6A4F] text-white font-bold py-3.5 rounded transition-colors shadow-sm flex items-center justify-center">
                Checkout Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
