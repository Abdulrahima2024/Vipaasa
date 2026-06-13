"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../../components/layout/Header";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/authStore";
import { Lock, Mail, Phone, User, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Zustand Auth Store
  const { login, register, isLoading, error: authError, isAuthenticated } = useAuthStore();

  // Cart store for Header notifications/counts
  const { items, favorites } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (loginMethod === "mobile") {
      setValidationError("Mobile authentication is not supported. Please use Email method.");
      return;
    }

    if (authMode === "login") {
      const success = await login(email, password);
      if (success) {
        router.push("/");
      }
    } else {
      if (!termsAccepted) {
        setValidationError("You must accept the terms and conditions.");
        return;
      }
      const success = await register(email, password, fullName, mobileNumber || undefined);
      if (success) {
        router.push("/");
      }
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
              src="https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800"
              alt="Organic Tea Leaves"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark green overlay for branding aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#113C27]/90 via-[#113C27]/40 to-black/10" />
            
            {/* Narrative copy at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-3 z-10">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
                Artisanal. Ethical. Pure.
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-sm">
                {authMode === "login"
                  ? "Welcome back to the sanctuary of organic wellness. Your curated apothecary journey continues here."
                  : "Begin your journey into the sanctuary of organic wellness. Discover pure, artisanal harvests."}
              </p>
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
            
            {/* Title / Subtext */}
            <div className="mb-6">
              <h2 className="font-serif text-2.5xl sm:text-3xl font-bold text-[#113C27] leading-tight mb-1">
                {authMode === "login" ? "Welcome Back" : "Welcome"}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold">
                {authMode === "login" ? "Sign in to your organic profile" : "Create your organic profile"}
              </p>
            </div>

            {/* Error display */}
            {(authError || validationError) && (
              <div className="mb-4 p-3.5 bg-[#A84444]/10 border border-[#A84444]/25 text-[#A84444] rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                <svg className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-[#A84444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{authError || validationError}</span>
              </div>
            )}

            {/* Email / Mobile Selector Tabs */}
            <div className="flex bg-[#ECE9E0]/60 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === "email"
                    ? "bg-white text-[#113C27] shadow-sm"
                    : "text-[#5C6E61] hover:text-[#113C27]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("mobile")}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === "mobile"
                    ? "bg-white text-[#113C27] shadow-sm"
                    : "text-[#5C6E61] hover:text-[#113C27]"
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name input for registration */}
              {authMode === "register" && (
                <div>
                  <label htmlFor="fullName" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Input */}
              {loginMethod === "email" ? (
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@vipaasa.com"
                      className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                    />
                  </div>
                </div>
              ) : (
                /* Mobile Number Input */
                <div>
                  <label htmlFor="mobileNumber" className="block text-[10px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      id="mobileNumber"
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold text-[#113C27] uppercase tracking-wider">
                    Password
                  </label>
                  {authMode === "login" && (
                    <Link
                      href="/forgot-password"
                      className="text-[10px] font-extrabold text-[#2D6A4F] hover:text-[#113C27] tracking-wide transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#113C27] focus:border-[#113C27] focus:bg-white font-semibold transition-all duration-200"
                  />
                </div>
              </div>

              {/* Additional Options */}
              {authMode === "login" ? (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        rememberMe
                          ? "bg-[#113C27] border-[#113C27] text-white"
                          : "border-[#EAE6DB] bg-[#F9F7F2]/30"
                      }`}
                    >
                      {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span className="ml-2.5 text-xs text-[#5C6E61] font-semibold select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                      Remember me
                    </span>
                  </div>
                </div>
              ) : (
                /* Terms of Service check for registration */
                <div className="flex items-start pt-1">
                  <button
                    type="button"
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                      termsAccepted
                        ? "bg-[#113C27] border-[#113C27] text-white"
                        : "border-[#EAE6DB] bg-[#F9F7F2]/30"
                    }`}
                  >
                    {termsAccepted && <Check className="h-3 w-3 stroke-[3]" />}
                  </button>
                  <span className="ml-2.5 text-xs text-[#5C6E61] font-semibold leading-normal select-none cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                    I accept the terms and conditions and privacy policies.
                  </span>
                </div>
              )}

              {/* Login/Sign Up Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (authMode === "register" && !termsAccepted)}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#113C27] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#113C27] active:scale-[0.98] transform transition-all duration-200 ${
                    (isLoading || (authMode === "register" && !termsAccepted)) ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {authMode === "login" ? "Logging in..." : "Creating Account..."}
                    </span>
                  ) : (
                    authMode === "login" ? "Login" : "Create Account"
                  )}
                </button>
              </div>
            </form>

            {/* OR CONTINUE WITH */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-[#EAE6DB]" />
              <span className="flex-shrink mx-4 text-[10px] font-bold text-[#738276] uppercase tracking-widest">
                OR CONTINUE WITH
              </span>
              <div className="flex-grow border-t border-[#EAE6DB]" />
            </div>

            {/* Social Logins */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[#EAE6DB] rounded-xl shadow-sm bg-white hover:bg-[#F9F7F2] text-xs font-bold text-[#4B594F] transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {/* Toggle login/register views link */}
            <p className="mt-6 text-center text-xs font-semibold text-[#5C6E61]">
              {authMode === "login" ? (
                <>
                  New to vipaasa?{" "}
                  <span
                    onClick={() => {
                      setAuthMode("register");
                      setTermsAccepted(false);
                    }}
                    className="font-bold text-[#113C27] hover:underline cursor-pointer"
                  >
                    Create Account
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => setAuthMode("login")}
                    className="font-bold text-[#113C27] hover:underline cursor-pointer"
                  >
                    Login
                  </span>
                </>
              )}
            </p>

          </div>
        </div>
      </main>

      {/* Footer (matches homepage design styling) */}
      <footer className="relative z-10 px-6 lg:px-16 pt-16 pb-20 text-[#4B594F] overflow-hidden">
        {/* Background Image Container using optimized Next.js Image component */}
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
        {/* Bright Cream Tint Overlay for perfect text contrast while preserving image details */}
        <div className="absolute inset-0 bg-[#F9F7F2]/45 -z-10" />
        {/* Fade-in blend gradient from page background (#F9F7F2) to transparent */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F9F7F2] to-transparent -z-10" />




        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand & Narrative */}
          <div className="md:col-span-6 space-y-5">
            <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
            <p className="text-sm leading-relaxed max-w-sm">
              Bringing back the wisdom of the ancients through pure, artisanal, and regenerative organic produce.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
                </svg>
              </a>
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Company</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Core Values sprout/leaf aesthetics icon decorations */}
          <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-center md:justify-start gap-6 pt-4 text-[#738276]">
            <div className="flex items-center gap-6">
              <span aria-label="Pure Leaf" title="100% Organic Pure Leaf">
                <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
                </svg>
              </span>
              <span aria-label="Sustainable Sprout" title="Sustainable Sprout Products">
                <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
                </svg>
              </span>
              <span aria-label="Artisanal Production" title="Artisanal Production Process">
                <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </span>
            </div>
          </div>

        </div>

        {/* Footer Copyright */}
        <div className="max-w-7xl mx-auto border-t border-[#DEDAD0] mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
          &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
        </div>
      </footer>

    </div>
  );
}
