"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/layout/Header";
import { useCartStore } from "../../store/useCartStore";

export default function CartPage() {
  const {
    items,
    savedItems,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
    clearCart,
    favorites,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: loader, 2: success

  // Calculate pricing values
  const activeItems = mounted ? items.filter(item => !item.saved) : [];
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 0.08; // 8% as derived from mockup
  const estimatedTax = parseFloat((subtotal * taxRate).toFixed(2));
  
  // Shipping logic: Free shipping threshold is ₹1000.
  const freeShippingThreshold = 1000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const shippingText = isFreeShipping ? "Free" : "Calculated at checkout";
  const total = parseFloat((subtotal + estimatedTax).toFixed(2));

  // Handle checkout animation flow
  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    setIsCheckingOut(true);
    setCheckoutStep(1);

    // Simulate processing payment
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutStep(2);
    }, 2000);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    if (checkoutStep === 2) {
      // Reset cart on successful order
      clearCart();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          .font-sans { font-family: 'Outfit', sans-serif; }
          .font-serif { font-family: 'Playfair Display', serif; }
        `}} />
        <Header showSearch={false} cartCount={0} favoritesCount={0} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8 flex items-center justify-center">
          <div className="text-center py-20 text-[#738276] font-semibold text-lg animate-pulse">
            Loading your basket...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Dynamic Font Import */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        .font-sans {
          font-family: 'Outfit', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}} />

      {/* HEADER SECTION */}
      <Header
        showSearch={false}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        onFavoritesClick={() => {
          window.location.href = "/favorites";
        }}
      />

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8">
        
        {/* BREADCRUMB */}
        <nav className="text-xs font-semibold tracking-wider text-[#738276] mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="#" className="hover:text-[#113C27] transition-colors">Home</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <span className="text-[#113C27]">Shopping Cart</span>
            </li>
          </ol>
        </nav>

        {/* PAGE TITLE */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#113C27] mb-8 tracking-tight">
          Your Basket
        </h1>

        {activeItems.length === 0 ? (
          /* EMPTY BASKET STATE */
          <div className="bg-white/60 border border-[#EAE6DB] rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-[#EAF5EC] rounded-full flex items-center justify-center mx-auto mb-6 text-[#113C27]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#113C27] mb-3">Your Basket is Empty</h2>
            <p className="text-sm text-[#5C6E61] mb-8 max-w-sm mx-auto leading-relaxed">
              Looks like you haven&apos;t added any artisanal, sustainable products to your basket yet.
            </p>
            <a
              href="#"
              className="inline-block bg-[#1B4332] text-white px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide hover:bg-[#113C27] transition-all duration-200 shadow-md shadow-green-950/10"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          /* ACTIVE CART LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: CART ITEMS LIST */}
            <div className="lg:col-span-2 space-y-6">
              {activeItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F6F4EC] border border-[#EAE6DB]/60 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] transition-shadow duration-300"
                >
                  {/* Product Image */}
                  <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-[#FAF8F5] flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      {/* Title & Specification */}
                      <div>
                        <h2 className="font-sans text-lg sm:text-xl font-bold text-[#113C27] leading-snug">
                          {item.name}
                        </h2>
                        <p className="text-[13px] font-medium text-[#738276] mt-1">
                          {item.spec}
                        </p>
                      </div>
                      
                      {/* Price Display */}
                      <span className="font-sans text-lg sm:text-xl font-bold text-[#113C27] tabular-nums">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Controls & Card Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                      {/* Quantity Selector Container */}
                      <div className="flex items-center bg-[#ECE9E0] rounded-full p-1.5 shadow-inner">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#113C27] hover:bg-white/60 active:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        </button>
                        
                        <span className="w-10 text-center font-bold text-sm text-[#113C27] select-none tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#113C27] hover:bg-white/60 active:bg-white transition-all"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center space-x-5 text-sm font-semibold tracking-wide">
                        <button
                          onClick={() => saveForLater(item.id)}
                          className="text-[#113C27] underline decoration-1 underline-offset-4 hover:text-opacity-80 transition-colors"
                        >
                          Save for Later
                        </button>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#A84444] hover:text-[#C55353] transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                
                {/* Summary Title */}
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
                  Order Summary
                </h2>

                {/* Pricing Breakdown */}
                <div className="space-y-4 text-[15px] font-semibold text-[#5C6E61]">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-[#113C27] tabular-nums">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Estimated Shipping */}
                  <div className="flex justify-between items-start gap-4">
                    <span>Estimated Shipping</span>
                    <span className={`text-right leading-snug ${isFreeShipping ? "text-[#2D6A4F]" : "text-[#2D6A4F] font-bold"}`}>
                      {shippingText}
                    </span>
                  </div>

                  {/* Estimated Tax */}
                  <div className="flex justify-between items-center">
                    <span>Estimated Tax</span>
                    <span className="text-[#113C27] tabular-nums">₹{estimatedTax.toFixed(2)}</span>
                  </div>
                </div>

                <hr className="border-[#EAE6DB]" />

                {/* Total */}
                <div className="flex justify-between items-baseline py-1">
                  <span className="text-lg font-bold text-[#113C27]">Total</span>
                  <span className="text-3xl font-bold text-[#113C27] tabular-nums">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#1B4332] hover:bg-[#113C27] text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-200 shadow-md shadow-green-950/10 active:scale-[0.98]"
                >
                  <span>Proceed to Checkout</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                {/* Free Shipping Dynamic Progress */}
                <div className="bg-[#EAF5EC] text-[#2D6A4F] px-4 py-3.5 rounded-xl flex items-center gap-3 text-xs sm:text-[13px] font-semibold leading-snug">
                  {/* Delivery truck icon */}
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.09-1.124A1.125 1.125 0 0 0 19.824 12h-2.203a1.125 1.125 0 0 0-1.09.876L16.25 14.25m-2.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h-3.75a1.125 1.125 0 0 1-1.125-1.125V7.5a9 9 0 0 0-9 9m9-9H18a2.25 2.25 0 0 1 2.25 2.25v1.364t-.063.268" />
                  </svg>
                  <span>
                    {isFreeShipping ? (
                      "Congratulations! You've unlocked Free Shipping!"
                    ) : (
                      <>You&apos;re <span className="underline">₹{amountToFreeShipping.toFixed(2)}</span> away from Free Shipping!</>
                    )}
                  </span>
                </div>

                {/* Badges */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-[#738276]">
                    <svg className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    <span>Secured Payment Processing</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-[#738276]">
                    <svg className="w-5 h-5 text-[#2D6A4F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Sustainable & Plastic-free Packaging</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* SAVED FOR LATER SECTION */}
        {savedItems.length > 0 && (
          <div className="mt-16 border-t border-[#EAE6DB] pt-12">
            <h2 className="font-serif text-2xl font-bold text-[#113C27] mb-6">
              Saved for Later ({savedItems.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#F6F4EC]/60 border border-[#EAE6DB]/40 rounded-xl p-4 flex gap-4 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#FAF8F5] flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm sm:text-base text-[#113C27] leading-tight">
                          {item.name}
                        </h3>
                        <span className="font-bold text-sm text-[#113C27]">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-[#738276] mt-0.5">{item.spec}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4 text-xs font-semibold">
                      <button
                        onClick={() => moveToCart(item.id)}
                        className="bg-[#1B4332] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#113C27] transition-colors"
                      >
                        Move to Basket
                      </button>
                      <button
                        onClick={() => removeSavedItem(item.id)}
                        className="text-[#A84444] hover:text-[#C55353] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="relative z-10 border-t border-[#EAE6DB] mt-24 px-6 lg:px-16 pt-16 pb-20 text-[#4B594F] overflow-hidden">
        {/* Background Image Container using optimized Next.js Image component */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/footer_bg.png"
            alt="Farming silhouette background"
            fill
            quality={100}
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>
        {/* Bright Cream Tint Overlay for perfect text contrast while preserving image details */}
        <div className="absolute inset-0 bg-[#F9F7F2]/75 -z-10" />




        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Preserving the sanctity of nature through artisanal practices and ethical sourcing.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Shop</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          {/* Business Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Business</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto border-t border-[#DEDAD0] mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
          &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
        </div>
      </footer>

      {/* CHECKOUT MODAL / POPUP */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="bg-[#F9F7F2] border border-[#EAE6DB] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={closeCheckoutModal}
              disabled={isCheckingOut}
              className="absolute top-4 right-4 p-2 text-[#738276] hover:text-[#113C27] transition-colors disabled:opacity-30"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {checkoutStep === 1 ? (
              /* PROCESSING PAYMENT STATE */
              <div className="text-center py-8">
                <div className="inline-block relative w-16 h-16 mb-6">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-[#1B4332]/20 border-t-[#1B4332] animate-spin"></div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#113C27] mb-2">Processing Order</h3>
                <p className="text-sm text-[#5C6E61] max-w-xs mx-auto">
                  Please hold on while we secure your payment and confirm your basket with the farm...
                </p>
              </div>
            ) : (
              /* SUCCESS STATE */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#EAF5EC] text-[#2D6A4F] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#113C27] mb-2">Order Confirmed!</h3>
                <p className="text-sm text-[#5C6E61] mb-6">
                  Thank you for shopping with Vipaasa Organics. Your artisanal order is on its way to your doorstep.
                </p>
                <div className="bg-white border border-[#EAE6DB] rounded-2xl p-4 mb-8 text-left space-y-2 text-xs font-semibold text-[#5C6E61]">
                  <div className="flex justify-between">
                    <span>Order Reference</span>
                    <span className="text-[#113C27]">#VO-892714</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Charged</span>
                    <span className="text-[#113C27] font-bold">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Option</span>
                    <span className="text-[#113C27]">Sustainable Ground</span>
                  </div>
                </div>
                <button
                  onClick={closeCheckoutModal}
                  className="w-full bg-[#1B4332] hover:bg-[#113C27] text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-green-950/10"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
