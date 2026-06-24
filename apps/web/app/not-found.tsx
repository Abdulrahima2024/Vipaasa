import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F2] text-[#1F3E2F] px-6 text-center">
      {/* Decorative leaf SVG */}
      <div className="mb-8 opacity-20 select-none" aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M50 90 Q30 60 40 30 Q50 10 60 30 Q70 60 50 90Z" fill="#0F5132" />
          <path d="M50 90 Q55 60 65 40" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#2D6A4F] mb-3">
        404 — Not Found
      </p>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113C27] mb-4 leading-tight">
        Lost in the Field?
      </h1>

      <p className="text-base text-[#5C6E61] mb-10 max-w-sm leading-relaxed">
        The harvest page you are looking for has been moved or no longer exists. Let&apos;s guide you back home.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#0F5132] hover:bg-[#2D6A4F] active:scale-[0.97] text-white font-bold py-3 px-7 rounded-2xl transition-all duration-200 shadow-lg shadow-[#0F5132]/20 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7m-9 5v6a1 1 0 001 1h4a1 1 0 001-1v-6m-6 0h6" />
          </svg>
          Back to Home
        </Link>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 bg-white border border-[#D0E5D8] text-[#0F5132] hover:border-[#0F5132] font-bold py-3 px-7 rounded-2xl transition-all duration-200 text-sm"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
