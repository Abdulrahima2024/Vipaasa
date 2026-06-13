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
  const flow = searchParams.get("flow") || "forgot-password"; // "register" or "forgot-password"
  const method = searchParams.get("method") || "email"; // "email" or "mobile"

  const [mounted, setMounted] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleResend = async () => {
    setError(null);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: target }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Resend failed.");
        return;
      }

      setTimeLeft(60);
      alert(`OTP has been resent to your email!`);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Cannot connect to server to resend OTP.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setVerifying(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: target, otp: otpValue }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Invalid or expired OTP code.");
          setVerifying(false);
          return;
        }

        setVerifying(false);
        setVerified(true);
        // Redirect after showing success
        setTimeout(() => {
          if (flow === "register") {
            router.push("/login");
          } else {
            router.push(`/reset-password?target=${encodeURIComponent(target)}&otp=${encodeURIComponent(otpValue)}`);
          }
        }, 1500);
      } catch (err) {
        console.error("Verify OTP error:", err);
        setError("Cannot connect to the authentication server.");
        setVerifying(false);
      }
    } else {
      setError("Please enter a valid 6-digit OTP.");
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
                {flow === "register" ? "Almost There!" : "Secure Your Ritual"}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-sm">
                {flow === "register"
                  ? "Verify your identity to complete your registration and start your organic wellness journey."
                  : "Your account safety is our priority. Follow the simple steps to restore access to your organic sanctuary."}
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#FAF9F5]">

            {/* Progress bar */}
            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
              <div className={`h-1 flex-1 rounded-full ${verified ? "bg-[#113C27]" : "bg-[#113C27]"}`} />
              <div className={`h-1 flex-1 rounded-full ${verified ? "bg-[#113C27]" : "bg-[#ECE9E0]"}`} />
            </div>

            {/* SUCCESS STATE */}
            {verified ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-[fadeIn_0.4s_ease-out]">
                <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#113C27]">
                  {flow === "register" ? "Account Verified!" : "Identity Confirmed!"}
                </h2>
                <p className="text-sm text-[#5C6E61] font-semibold text-center max-w-xs">
                  {flow === "register"
                    ? "Your account has been created successfully. Redirecting you to login..."
                    : "Redirecting you to set a new password..."}
                </p>
                <div className="flex gap-1 pt-2">
                  <span className="w-2 h-2 bg-[#113C27] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-[#113C27] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-[#113C27] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            ) : (
              <>
                {/* Title */}
                <div className="mb-6">
                  <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight mb-2">
                    {flow === "register" ? "Verify Your Account" : "OTP Verification"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold leading-relaxed">
                    Enter the 6-digit verification code sent to your{" "}
                    <span className="text-[#113C27] font-bold">
                      {method === "email" ? "email" : "mobile number"}{target ? ` (${target})` : ""}
                    </span>.
                  </p>
                </div>

                {/* Method indicator badge */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-[#EAF5EC] border border-[#C1F2D0] rounded-xl w-fit">
                  {method === "email" ? (
                    <svg className="w-4 h-4 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  )}
                  <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                    {method === "email" ? "Email Verification" : "Mobile Verification"}
                  </span>
                </div>

                {/* Error display */}
                {error && (
                  <div className="mb-4 p-3.5 bg-[#A84444]/10 border border-[#A84444]/25 text-[#A84444] rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#A84444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

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
                        disabled={verifying}
                        className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border border-[#EAE6DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#113C27] focus:border-[#113C27] bg-[#F9F7F2]/30 text-[#113C27] font-sans transition-all ${verifying ? "opacity-50" : ""}`}
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
                      disabled={verifying}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113C27] active:scale-[0.98] transform transition-all duration-200 ${verifying ? "opacity-70 cursor-wait" : ""}`}
                    >
                      {verifying ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        flow === "register" ? "Verify & Create Account" : "Verify OTP"
                      )}
                    </button>
                  </div>
                </form>

                {/* Back to Sign In Link */}
                <div className="mt-8 text-center">
                  <Link
                    href={flow === "register" ? "/register" : "/login"}
                    className="text-xs font-bold text-[#5C6E61] hover:text-[#113C27] transition-colors"
                  >
                    {flow === "register" ? "← Back to Registration" : "Back to Sign In"}
                  </Link>
                </div>
              </>
            )}

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
