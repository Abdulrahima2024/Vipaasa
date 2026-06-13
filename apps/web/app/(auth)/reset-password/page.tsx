"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../components/layout/Header";
import { useCartStore } from "../../../store/useCartStore";
import { Lock, Check, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("target") || "";
  const otp = searchParams.get("otp") || "";

  const [mounted, setMounted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [strength, setStrength] = useState<{ label: string; color: string; width: string }>({
    label: "",
    color: "bg-gray-200",
    width: "w-0",
  });

  // Cart store for Header notifications/counts
  const { items, favorites } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password Strength Logic
  useEffect(() => {
    if (!newPassword) {
      setStrength({ label: "", color: "bg-gray-200", width: "w-0" });
      return;
    }

    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) {
      setStrength({ label: "Weak", color: "bg-[#D9534F]", width: "w-1/3" });
    } else if (score <= 4) {
      setStrength({ label: "Medium", color: "bg-[#F0AD4E]", width: "w-2/3" });
    } else {
      setStrength({ label: "Strong", color: "bg-[#5CB85C]", width: "w-full" });
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsUpdating(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Password reset failed. Ensure OTP is verified.");
        setIsUpdating(false);
        return;
      }

      setIsSuccess(true);
      
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 4000);

      return () => clearTimeout(timeout);
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMessage("Cannot connect to the authentication server.");
      setIsUpdating(false);
    }
  };

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

          {/* Right Side: Form or Success Card */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-[#FAF9F5]">
            
            {isSuccess ? (
              // Success View
              <div className="text-center space-y-6 py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#E8F5E9] text-[#2D6A4F]">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight">
                    Password Updated!
                  </h2>
                  <p className="text-sm text-[#5C6E61] font-semibold leading-relaxed">
                    Your password has been successfully updated. Redirecting to the Login page in a few seconds...
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-block w-full text-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none transition-all active:scale-[0.98]"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              // Reset Password Form View
              <>
                {/* Progress: 3 of 3 segments active */}
                <div className="flex space-x-2 mb-8">
                  <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
                  <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
                  <div className="h-1 flex-1 bg-[#113C27] rounded-full" />
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight mb-2">
                    Reset Password
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold leading-relaxed">
                    Create a strong new password to secure your organic sanctuary.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2.5 bg-[#FDEDEC] text-[#D9534F] text-xs font-semibold p-3.5 rounded-xl border border-[#FADBD8] mb-4">
                    <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* New Password Input */}
                  <div>
                    <label htmlFor="newPassword" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#5C6E61] uppercase tracking-wider">
                          <span>Password Strength</span>
                          <span className="font-extrabold text-[#113C27]">{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#ECE9E0] rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Update Password Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113C27] active:scale-[0.98] transform transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] text-[#113C27] font-serif text-xl">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
