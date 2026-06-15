"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/layout/Header";
import { useCartStore } from "../../store/useCartStore";
import AddressSelector, { Address } from "../../components/checkout/AddressSelector";
import ShippingEstimate from "../../components/checkout/ShippingEstimate";
import GSTBreakdown from "../../components/checkout/GSTBreakdown";
import OrderReview from "../../components/checkout/OrderReview";
import PaymentSection from "../../components/checkout/PaymentSection";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, favorites, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Address, 2: Summary, 3: Payment, 4: Success
  const [confetti, setConfetti] = useState<{ id: number; left: number; size: number; delay: number; duration: number; color: string; rotation: number; shape: "square" | "circle" }[]>([]);

  useEffect(() => {
    setMounted(true);
    const colors = ["#113C27", "#2D6A4F", "#C1F2D0", "#FAF8F5", "#EAE6DB"];
    const generated = Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 6,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      shape: Math.random() > 0.4 ? ("square" as const) : ("circle" as const)
    }));
    setConfetti(generated);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [mounted, isAuthenticated, router]);

  // Default Addresses from mockup
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      type: "Home",
      name: "Ananya Sharma",
      addressLine1: "42, Lotus Boulevard, Sector 150",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201310",
      country: "India",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: "addr-2",
      type: "Work",
      name: "Ananya Sharma",
      addressLine1: "The Hub, Floor 12, Cyber City, Phase III",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122002",
      country: "India",
      phone: "+91 98765 99887",
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];


  // Total amount details for payment
  const activeItems = mounted ? items.filter(item => !item.saved) : [];
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 1000;
  const shippingFee = isFreeShipping ? 0 : 70;
  const estimatedTax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST
  const finalTotal = parseFloat((subtotal + shippingFee + estimatedTax).toFixed(2));

  // Address Handlers
  const handleAddAddress = (newAddr: Omit<Address, "id">) => {
    const id = `addr-${Date.now()}`;
    const added: Address = { ...newAddr, id };
    setAddresses((prev) => [...prev, added]);
    setSelectedAddressId(id);
  };

  const handleEditAddress = (id: string, updatedAddr: Address) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? updatedAddr : a)));
  };

  const handlePaymentComplete = (method: string) => {
    setStep(4);
    // Note: We clear the cart in Step 4's mount/render so the total amount is still visible on completion screen
  };

  // Clear cart upon arriving at success step
  useEffect(() => {
    if (step === 4) {
      clearCart();
    }
  }, [step, clearCart]);

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
            Loading checkout...
          </div>
        </main>
      </div>
    );
  }

  // Handle empty cart case (but not when order succeeded)
  if (activeItems.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
        <Header
          showSearch={false}
          cartCount={0}
          favoritesCount={favorites.length}
        />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-12 flex items-center justify-center">
          <div className="bg-white/60 border border-[#EAE6DB] rounded-3xl p-12 text-center max-w-2xl w-full shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-[#EAF5EC] rounded-full flex items-center justify-center mx-auto mb-6 text-[#113C27]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#113C27] mb-3">No Items for Checkout</h2>
            <p className="text-sm text-[#5C6E61] mb-8 max-w-sm mx-auto leading-relaxed">
              Your basket is empty. Please add some artisanal, sustainable products before checking out.
            </p>
            <Link
              href="/categories"
              className="inline-block bg-[#1B4332] text-white px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide hover:bg-[#113C27] transition-all duration-200 shadow-md shadow-green-950/10"
            >
              Go to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* Header */}
      <Header
        showSearch={false}
        cartCount={activeItems.reduce((acc, item) => acc + item.quantity, 0)}
        favoritesCount={favorites.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8">
        {step !== 4 && (
          /* STEPPER COMPONENT */
          <div className="max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Connection Lines Background */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#EAE6DB] -z-10" />
              {/* Active Connection Line Progress */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#2D6A4F] transition-all duration-500 -z-10"
                style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
              />

              {/* Stepper Nodes */}
              {([
                { num: 1, label: "Address" },
                { num: 2, label: "Summary" },
                { num: 3, label: "Payment" },
              ] as const).map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;

                return (
                  <div key={s.num} className="flex flex-col items-center gap-2 bg-[#F9F7F2] px-4">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#2D6A4F] border-[#2D6A4F] text-white"
                          : isActive
                          ? "bg-[#1B4332] border-[#1B4332] text-white shadow-md shadow-green-900/10"
                          : "bg-white border-[#EAE6DB] text-[#738276]"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5 stroke-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                        isActive ? "text-[#113C27]" : "text-[#738276]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 ? (
          /* SUCCESS PAGE (STEP 4) */
          <div className="max-w-2xl mx-auto my-12 text-center space-y-8 relative z-10 animate-fade-in py-10">
            {/* CSS styles for Confetti animations */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes confetti-fall {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(115vh) rotate(720deg); opacity: 0.3; }
              }
              @keyframes confetti-sway {
                0%, 100% { margin-left: -20px; }
                50% { margin-left: 20px; }
              }
              .confetti-piece {
                position: fixed;
                top: -20px;
                z-index: 0;
                pointer-events: none;
                animation-name: confetti-fall, confetti-sway;
                animation-iteration-count: infinite, infinite;
                animation-timing-function: linear, ease-in-out;
              }
            `}} />

            {/* Confetti Particles Container */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              {confetti.map((c) => (
                <div
                  key={c.id}
                  className="confetti-piece"
                  style={{
                    left: `${c.left}%`,
                    width: `${c.size}px`,
                    height: `${c.size}px`,
                    backgroundColor: c.color,
                    animationDelay: `${c.delay}s, ${c.delay + 0.5}s`,
                    animationDuration: `${c.duration}s, 2.5s`,
                    transform: `rotate(${c.rotation}deg)`,
                    borderRadius: c.shape === "circle" ? "50%" : "2px",
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            {/* Checkmark Icon (matches mockup style: green background, white checkmark, centered) */}
            <div className="w-20 h-20 bg-[#1F3E2F] text-[#C1F2D0] rounded-full flex items-center justify-center mx-auto shadow-md border-4 border-white animate-scale-up">
              <svg className="w-10 h-10 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>

            {/* Titles */}
            <div className="space-y-3">
              <h2 className="font-serif text-3.5xl sm:text-4xl lg:text-5xl font-extrabold text-[#113C27] tracking-tight">
                Order Placed Successfully!
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#4B594F] max-w-lg mx-auto leading-relaxed">
                Thank you for choosing artisanal, ethical purity. Your journey towards wellness continues.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-white/80 border border-[#EAE6DB] rounded-3xl p-6 sm:p-8 flex items-center justify-between max-w-xl mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.02)] divide-x divide-[#EAE6DB] relative z-10">
              {/* Order Number */}
              <div className="flex-1 text-center pr-4">
                <span className="block text-[10px] font-bold text-[#738276] uppercase tracking-widest mb-1.5">
                  Order Number
                </span>
                <span className="text-base sm:text-xl font-bold text-[#1F3E2F]">
                  #VO-8829-2024
                </span>
              </div>
              
              {/* Expected Delivery */}
              <div className="flex-1 text-center pl-4">
                <span className="block text-[10px] font-bold text-[#738276] uppercase tracking-widest mb-1.5">
                  Expected Delivery
                </span>
                <span className="text-base sm:text-xl font-bold text-[#1F3E2F]">
                  Oct 24, 2024
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 pt-4 relative z-10">
              <button
                onClick={() => window.location.href = "/"}
                className="bg-[#1B4332] hover:bg-[#113C27] text-white py-3.5 px-8 rounded-xl font-bold transition-all shadow-md shadow-green-950/10 active:scale-[0.98] text-sm font-semibold"
              >
                Track Order
              </button>
              <Link
                href="/categories"
                className="bg-white border border-[#1B4332] hover:border-[#113C27] text-[#1B4332] hover:text-[#113C27] py-3.5 px-8 rounded-xl font-bold transition-all hover:bg-[#FAF8F5] text-sm font-semibold"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Botanical Illustrations */}
            <div className="flex justify-center items-end gap-8 pt-8 opacity-75 relative z-10">
              {/* Framed Leaf Sketch */}
              <div className="w-16 h-20 bg-[#FAF8F5] border border-[#EAE6DB] rounded shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-1.5 flex items-center justify-center">
                <svg className="w-10 h-14 text-[#5C6E61]/70" viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M20,50 C20,38 23,28 27,20" />
                  <path d="M20,40 C17,35 15,30 15,24" />
                  <path d="M20,50 C20,25 25,12 25,12" />
                  <path d="M20,50 C20,18 13,10 13,10" />
                  <path d="M20,30 C22,25 24,20 25,18" />
                  <path d="M20,20 C18,17 17,14 17,12" />
                </svg>
              </div>

              {/* Sprout Sketch */}
              <div className="w-16 h-20 flex flex-col items-center justify-end">
                <svg className="w-12 h-16 text-[#5C6E61]" viewBox="0 0 40 50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M10,45 Q20,38 30,45 Q20,43 10,45" fill="#EAE6DB" stroke="#D1C9B8" strokeWidth="1" />
                  <path d="M20,42 Q20,25 24,15" />
                  <path d="M21,30 Q28,26 27,20 Q20,24 21,30" fill="none" />
                  <path d="M19,25 Q11,23 13,17 Q19,20 19,25" fill="none" />
                  <path d="M22,18 Q29,13 26,8 Q20,13 22,18" fill="none" />
                  <path d="M24,15 Q24,6 20,4 Q16,8 24,15" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CHECKOUT LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* LEFT COLUMN: ACTIVE STEP DETAILS */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <AddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelect={setSelectedAddressId}
                  onAdd={handleAddAddress}
                  onEdit={handleEditAddress}
                  onProceed={() => setStep(2)}
                  onBackToCart={() => window.location.href = "/cart"}
                />
              )}
              {step === 2 && (
                <OrderReview
                  address={selectedAddress}
                  items={items}
                  onProceed={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <PaymentSection
                  totalAmount={finalTotal}
                  onPaymentComplete={handlePaymentComplete}
                  onBack={() => setStep(2)}
                />
              )}
            </div>

            {/* RIGHT COLUMN: ESTIMATE MAP & GST SUMMARY */}
            <div className="lg:col-span-1 space-y-6">
              {/* Only show Live Preview on Step 1 or 2 */}
              {step <= 2 && (
                <ShippingEstimate
                  addressName={selectedAddress.city}
                  postalCode={selectedAddress.postalCode}
                />
              )}
              <GSTBreakdown items={items} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 px-6 lg:px-16 pt-16 pb-20 text-[#4B594F] overflow-hidden">
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <Image
            src="/images/footer_bg_v4.png"
            alt="Farming silhouette background"
            fill
            quality={100}
            sizes="100vw"
            className="object-contain md:object-cover object-bottom"
          />
        </div>
        <div className="absolute inset-0 bg-[#F9F7F2]/45 -z-10" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F9F7F2] to-transparent -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Preserving the sanctity of nature through artisanal practices and ethical sourcing.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Shop</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Business</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#DEDAD0] mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
          &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
        </div>
      </footer>
    </div>
  );
}
