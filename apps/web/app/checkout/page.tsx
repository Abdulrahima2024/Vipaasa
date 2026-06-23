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
import { Sprout } from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, favorites, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Address, 2: Summary, 3: Payment, 4: Success
  const [confetti, setConfetti] = useState<{ id: number; left: number; size: number; delay: number; duration: number; color: string; rotation: number; shape: "square" | "circle" }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchApi<{ status: string; data: Address[] }>("/api/users/addresses")
        .then((res) => {
          if (res && res.data) {
            setAddresses(res.data);
            const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to fetch addresses from backend", err);
        });
    }
  }, [mounted, isAuthenticated]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Total amount details for payment
  const activeItems = mounted ? items.filter(item => !item.saved) : [];
  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 1000;
  const shippingFee = isFreeShipping ? 0 : 100;
  const estimatedTax = parseFloat((subtotal * 0.18).toFixed(2)); // 18% standard tax to match backend
  const finalTotal = parseFloat((subtotal + shippingFee + estimatedTax - couponDiscount).toFixed(2));

  // Address Handlers
  const handleAddAddress = async (newAddr: Omit<Address, "id">) => {
    try {
      const res = await fetchApi<{ status: string; data: Address }>("/api/users/addresses", {
        method: "POST",
        body: JSON.stringify({
          addressType: newAddr.type === "Home" ? "HOME" : newAddr.type === "Work" ? "WORK" : "SHIPPING",
          addressLine1: newAddr.addressLine1,
          addressLine2: newAddr.addressLine2,
          city: newAddr.city,
          state: newAddr.state,
          postalCode: newAddr.postalCode,
          country: newAddr.country,
          phone: newAddr.phone,
        }),
      });

      if (res && res.data) {
        setAddresses((prev) => {
          const added = res.data;
          let updated: Address[];
          if (added.isDefault) {
            updated = [...prev.map((a) => ({ ...a, isDefault: false })), added];
          } else {
            updated = [...prev, added];
          }
          return updated;
        });
        setSelectedAddressId(res.data.id);
      }
    } catch (err) {
      console.error("Failed to add address", err);
      alert("Failed to add address to backend database.");
    }
  };

  const handleEditAddress = async (id: string, updatedAddr: Address) => {
    try {
      const res = await fetchApi<{ status: string; data: Address }>(`/api/users/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          addressType: updatedAddr.type === "Home" ? "HOME" : updatedAddr.type === "Work" ? "WORK" : "SHIPPING",
          addressLine1: updatedAddr.addressLine1,
          addressLine2: updatedAddr.addressLine2,
          city: updatedAddr.city,
          state: updatedAddr.state,
          postalCode: updatedAddr.postalCode,
          country: updatedAddr.country,
          phone: updatedAddr.phone,
          isDefault: updatedAddr.isDefault,
        }),
      });

      if (res && res.data) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === id ? res.data : a))
        );
      }
    } catch (err) {
      console.error("Failed to update address", err);
      alert("Failed to update address in backend database.");
    }
  };

  const handlePaymentComplete = async (method: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (!selectedAddress) {
        throw new Error("Please select or add a delivery address first.");
      }

      const rawAddress = {
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 || "",
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
        phone: selectedAddress.phone || "",
      };

      const payload: any = {};
      if (selectedAddress.id && !selectedAddress.id.startsWith("addr-")) {
        payload.shippingAddressId = selectedAddress.id;
        payload.billingAddressId = selectedAddress.id;
      } else {
        payload.shippingAddress = rawAddress;
        payload.billingAddress = rawAddress;
      }
      if (couponCode) {
        payload.couponCode = couponCode;
      }

      const result = await fetchApi<{ status: string; data: any }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result && result.status === "success" && result.data) {
        setPlacedOrder(result.data);
        setStep(4);
      } else {
        throw new Error("Failed to place order.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Something went wrong during checkout.");
      setStep(2); // Go back to review step
    } finally {
      setIsSubmitting(false);
    }
  };


  // Clear cart upon arriving at success step
  useEffect(() => {
    if (step === 4) {
      clearCart();
    }
  }, [step, clearCart]);

  if (!mounted || isSubmitting) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          .font-sans { font-family: 'Outfit', sans-serif; }
          .font-serif { font-family: 'Playfair Display', serif; }
        `}} />
        <Header showSearch={true} cartCount={0} favoritesCount={0} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4332]" />
          <div className="text-center text-[#738276] font-semibold text-lg animate-pulse">
            {isSubmitting ? "Placing your organic order..." : "Loading checkout..."}
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
          showSearch={true}
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
        @keyframes active-sprout-grow {
          0%, 100% { transform: scale(1) rotate(-5deg); }
          50% { transform: scale(1.15) rotate(5deg); }
        }
        .active-sprout-animation {
          display: inline-block;
          animation: active-sprout-grow 2.2s ease-in-out infinite;
        }
      `}} />

      {/* Header */}
      <Header
        showSearch={true}
        cartCount={activeItems.reduce((acc, item) => acc + item.quantity, 0)}
        favoritesCount={favorites.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8">
        {step !== 4 && (
          /* STEPPER COMPONENT */
          <div className="max-w-xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Connection Lines Background */}
              <div className="absolute left-10 right-10 top-5 -translate-y-1/2 h-[2px] bg-[#EAE6DB] z-0" />
              {/* Active Connection Line Progress */}
              <div
                className="absolute left-10 top-5 -translate-y-1/2 h-[2px] bg-[#2D6A4F] transition-all duration-500 z-0"
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
                  <div key={s.num} className="flex flex-col items-center gap-2 relative">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 relative z-10 ${
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
                      ) : isActive ? (
                        <Sprout className="w-5 h-5 text-[#C1F2D0] stroke-[2.5] active-sprout-animation" />
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
                  {placedOrder?.orderNumber || "#VO-8829-2024"}
                </span>
              </div>
              
              {/* Expected Delivery */}
              <div className="flex-1 text-center pl-4">
                <span className="block text-[10px] font-bold text-[#738276] uppercase tracking-widest mb-1.5">
                  Expected Delivery
                </span>
                <span className="text-base sm:text-xl font-bold text-[#1F3E2F]">
                  {placedOrder?.createdAt 
                    ? new Date(new Date(placedOrder.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Oct 24, 2024"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-4 pt-4 relative z-10">
              <button
                onClick={() => window.location.href = `/orders/${placedOrder?.id}`}
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
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl text-sm font-semibold mb-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}
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
                  addressName={selectedAddress?.city || "your city"}
                  postalCode={selectedAddress?.postalCode || ""}
                />
              )}
              <GSTBreakdown 
                items={items} 
                couponCode={couponCode} 
                setCouponCode={setCouponCode} 
                couponDiscount={couponDiscount} 
                setCouponDiscount={setCouponDiscount} 
              />
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
