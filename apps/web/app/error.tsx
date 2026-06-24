"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service in production
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F2] text-[#1F3E2F] px-6 text-center">
      {/* Decorative broken leaf */}
      <div className="mb-8 opacity-20 select-none" aria-hidden="true">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <path d="M50 80 Q28 55 36 28 Q50 8 64 28 Q72 55 50 80Z" fill="#A84444" />
          <path d="M50 80 Q54 55 62 38" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#A84444] mb-3">
        Something went wrong
      </p>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#113C27] mb-4 leading-tight">
        Unexpected Error
      </h1>

      <p className="text-base text-[#5C6E61] mb-3 max-w-sm leading-relaxed">
        An error occurred while loading this page. Our team has been notified. You can try again or go back to the homepage.
      </p>

      {/* Show error digest in dev mode only */}
      {error.digest && process.env.NODE_ENV === "development" && (
        <p className="text-xs font-mono text-[#9EAF9E] bg-[#EAE6DB]/60 rounded-lg px-3 py-1.5 mb-6 max-w-xs truncate">
          Digest: {error.digest}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-[#0F5132] hover:bg-[#2D6A4F] active:scale-[0.97] text-white font-bold py-3 px-7 rounded-2xl transition-all duration-200 shadow-lg shadow-[#0F5132]/20 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white border border-[#D0E5D8] text-[#0F5132] hover:border-[#0F5132] font-bold py-3 px-7 rounded-2xl transition-all duration-200 text-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
