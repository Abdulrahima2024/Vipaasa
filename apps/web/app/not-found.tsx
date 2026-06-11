import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F7F2] text-[#1F3E2F] p-6 text-center">
      <h2 className="font-serif text-3xl font-bold mb-3 text-[#113C27]">
        Page Not Found
      </h2>
      <p className="text-sm text-[#5C6E61] mb-8 max-w-sm leading-relaxed">
        The harvest page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        className="bg-[#113C27] hover:bg-[#2D6A4F] text-white font-bold py-2.5 px-6 rounded-xl transition-all"
      >
        Go Home
      </a>
    </div>
  );
}
