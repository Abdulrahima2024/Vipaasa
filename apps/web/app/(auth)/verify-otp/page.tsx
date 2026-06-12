"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/layout/Header";
import { useCartStore } from "../../../store/useCartStore";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = searchParams.get("target") || "";

  const [mounted, setMounted] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cart store for Header notifications/counts
  const { items, favorites } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // take the last digit if pasted
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(60);
    alert("OTP has been resent!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      // Simulate verification and proceed to reset password
      router.push("/reset-password");
    } else {
      alert("Please enter a valid 6-digit OTP.");
    }
  };

  // Format time (e.g. 0:59)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">

      {/* Dynamic Font Import */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        .font-sans {
          font-family: 'Outfit', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}} />

      {/* Header */}
      <Header
        showSearch={false}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        activeNav=""
      />

      {/* Main Grid */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* Left Side: Editorial */}
          <div className="relative hidden md:block min-h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800"
              alt="Organic Farm Nature"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#113C27]/90 via-[#113C27]/40 to-black/10" />

            <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-3 z-10">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
                Secure Your Ritual
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-sm">
                Your account safety is our priority. Follow the simple steps to restore access to your organic sanctuary.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#FAF9F5]">

            {/* Progress: 2 of 3 segments active */}
            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
              <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
              <div className="h-1 flex-1 bg-[#ECE9E0] rounded-full" />
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight mb-2">
                OTP Verification
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold leading-relaxed">
                Enter the 6-digit verification code sent to <span className="text-[#113C27] font-bold">{target || "your registered email/mobile"}</span>.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Digit Input Boxes */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border border-[#EAE6DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C27] focus:border-[#113C27] bg-[#F9F7F2]/30 text-[#113C27] font-sans"
                  />
                ))}
              </div>

              {/* Countdown and Resend Options */}
              <div className="flex justify-between items-center text-xs font-semibold text-[#5C6E61]">
                {timeLeft > 0 ? (
                  <span>Resend code in <span className="text-[#113C27] font-bold">{formatTime(timeLeft)}</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#2D6A4F] hover:text-[#113C27] font-bold hover:underline transition-all"
                  >
                    Resend Verification Code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113C27] active:scale-[0.98] transform transition-all duration-200"
                >
                  Verify OTP
                </button>
              </div>
            </form>

            {/* Back to Sign In Link */}
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-[#5C6E61] hover:text-[#113C27] transition-colors"
              >
                Back to Sign In
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#EAE8E1] border-t border-[#EAE6DB] px-6 lg:px-16 py-12 text-[#4B594F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

          <div className="md:col-span-6 space-y-4">
            <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
            <p className="text-xs text-[#5C6E61] max-w-sm leading-relaxed">
              &copy; 2024 ḍipaasa ǎ rganics. Artisanal. Ethical. Pure. Crafting natural wellness solutions with respect for Mother Earth.
            </p>
          </div>

          <div className="md:col-span-6 flex md:justify-end">
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-semibold text-[#5C6E61] self-center">
              <a href="#" className="hover:text-[#113C27] transition-colors underline decoration-1 underline-offset-4 decoration-[#738276]/30">Privacy Policy</a>
              <a href="#" className="hover:text-[#113C27] transition-colors underline decoration-1 underline-offset-4 decoration-[#738276]/30">Wholesale</a>
              <a href="#" className="hover:text-[#113C27] transition-colors underline decoration-1 underline-offset-4 decoration-[#738276]/30">Shipping Info</a>
              <a href="#" className="hover:text-[#113C27] transition-colors underline decoration-1 underline-offset-4 decoration-[#738276]/30">Contact Us</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] text-[#113C27] font-serif text-xl">Loading Verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
