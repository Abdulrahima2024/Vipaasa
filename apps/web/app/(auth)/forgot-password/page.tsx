"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import { useCartStore } from "../../../store/useCartStore";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState("");

  // Cart store for Header notifications/counts
  const { items, favorites } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrMobile.trim()) {
      const target = emailOrMobile.trim();
      const method = target.includes("@") ? "email" : "mobile";
      router.push(`/verify-otp?target=${encodeURIComponent(target)}&flow=forgot-password&method=${method}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      
      {/* Dynamic Font Import to ensure beautiful premium typography */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        .font-sans {
          font-family: 'Outfit', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
      `}} />

      {/* Navbar Header (Search hidden as in login page image) */}
      <Header
        showSearch={false}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        activeNav=""
      />

      {/* Main Authentication Grid */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Side: Editorial Banner / Image */}
          <div className="relative hidden md:block min-h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800"
              alt="Organic Farm Nature"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark green overlay for branding aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#113C27]/90 via-[#113C27]/40 to-black/10" />
            
            {/* Narrative copy at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-3 z-10">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
                Secure Your Ritual
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-sm">
                Your account safety is our priority. Follow the simple steps to restore access to your organic sanctuary.
              </p>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#FAF9F5]">
            
            {/* Progress indicator at top: three segments. The first segment is dark green, rest are light gray/beige */}
            <div className="flex space-x-2 mb-8">
              <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
              <div className="h-1 flex-1 bg-[#ECE9E0] rounded-full" />
              <div className="h-1 flex-1 bg-[#ECE9E0] rounded-full" />
            </div>

            {/* Title / Subtext */}
            <div className="mb-6">
              <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight mb-2">
                Forgot Password?
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold leading-relaxed">
                Enter your registered email or mobile number and we'll send you an OTP to verify your identity.
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email or Mobile Number Input */}
              <div>
                <label htmlFor="emailOrMobile" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                  Email or Mobile Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="emailOrMobile"
                    type="text"
                    required
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="appearance-none block w-full pl-10 pr-3.5 py-3 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113C27] active:scale-[0.98] transform transition-all duration-200"
                >
                  Send Verification Code
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

      {/* Footer (matches homepage design styling exactly) */}
      <footer className="bg-[#EAE8E1] border-t border-[#EAE6DB] px-6 lg:px-16 py-12 text-[#4B594F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand & Narrative */}
          <div className="md:col-span-6 space-y-4">
            <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
            <p className="text-xs text-[#5C6E61] max-w-sm leading-relaxed">
              &copy; 2024 ḍipaasa ǎ rganics. Artisanal. Ethical. Pure. Crafting natural wellness solutions with respect for Mother Earth.
            </p>
          </div>

          {/* Quick Links Column */}
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
