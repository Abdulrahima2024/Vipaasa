"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useCartStore } from "../../store/useCartStore";
import { Truck, Clock, ShieldCheck, MapPin, AlertCircle } from "lucide-react";

export default function ShippingInfoPage() {
  const { items, favorites } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Dynamic premium fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* HEADER SECTION */}
      <Header
        showSearch={true}
        activeNav="Shipping Info"
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        onFavoritesClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/favorites";
          }
        }}
      />

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 sm:px-8 py-12 md:py-16 space-y-10">
        {/* HERO SECTION BANNER */}
        <section className="relative py-12 bg-[#113C27] text-white text-center px-6 overflow-hidden rounded-3xl shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[10%] left-[5%] w-24 h-24 border border-white rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[5%] w-32 h-32 border-4 border-white border-dashed rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/60 text-[#C1F2D0] text-xs font-bold uppercase tracking-wider mb-2">
              <Truck className="w-3.5 h-3.5" />
              Fast & Reliable Delivery
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Shipping & Delivery
            </h1>
            <p className="text-sm text-[#C1F2D0] font-medium opacity-90 max-w-md mx-auto">
              Pure organic goodness, delivered fresh to your doorstep.
            </p>
          </div>
        </section>

        {/* SHIPPING DETAILS CONTENT */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-[#E8E5DD] space-y-10 text-[#4B594F] leading-relaxed">
          <section className="space-y-4">
            <p>
              At <strong>Vipaasa Organics</strong>, we strive to deliver your artisanal and regenerative organic produce in the freshest and most sustainable manner possible. We partner with reliable delivery networks to ensure that our products reach your kitchen without losing their nutritional integrity.
            </p>
          </section>

          <hr className="border-[#E8E5DD]" />

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <Clock className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">1. Shipping Timelines</h2>
            </div>
            <p>
              We process orders within 24 to 48 hours of confirmation. Delivery times vary based on your location:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Local Deliveries (Within Metro Areas):</strong> 2 to 3 business days.</li>
              <li><strong>Regional/Domestic Shipping:</strong> 4 to 7 business days depending on location accessibility.</li>
              <li><strong>Fresh Harvest/Seasonal Items:</strong> Subject to harvest cycles; exact shipping schedules will be specified on individual product pages.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">2. Shipping Charges</h2>
            </div>
            <p>
              Our shipping rates are calculated dynamically based on package weight and delivery pin code at check-out:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free Shipping:</strong> On all orders above ₹999.</li>
              <li><strong>Standard Delivery Charges:</strong> Flat ₹79 for orders under ₹999.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <MapPin className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">3. Order Tracking</h2>
            </div>
            <p>
              Once your package is dispatched, we will send you a tracking link via email and SMS. You can monitor your shipment’s status in real-time until it is delivered safely to your location.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">4. Damaged or Missing Shipments</h2>
            </div>
            <p>
              In the rare event that your items are damaged in transit or fail to arrive within the scheduled delivery window, please contact our support team immediately at <a href="/about#contact" className="text-[#113C27] underline font-semibold">Contact Us</a>. We will dispatch a replacement or issue a refund immediately.
            </p>
          </section>
        </div>
      </main>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}
