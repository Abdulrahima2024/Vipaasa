"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F2] text-[#1F3E2F] p-6 text-center">
      <h2 className="font-serif text-2xl font-bold mb-4 text-[#113C27]">
        Something went wrong!
      </h2>
      <p className="text-sm text-[#5C6E61] mb-6 max-w-xs leading-relaxed">
        An error occurred while loading this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="bg-[#113C27] hover:bg-[#2D6A4F] text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 transform"
      >
        Try again
      </button>
    </div>
  );
}
