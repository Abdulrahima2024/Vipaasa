"use client";

import React, { useState } from "react";

export default function NewsletterForm() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  if (newsletterSubscribed) {
    return (
      <div className="bg-[#C1F2D0] border border-[#A7F3D0] text-[#113C27] text-xs font-bold p-3 rounded-xl flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <span>Subscribed successfully! Thank you.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
      <input
        type="email"
        placeholder="Email address"
        required
        value={newsletterEmail}
        onChange={(e) => setNewsletterEmail(e.target.value)}
        className="bg-white border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#113C27] focus:outline-none focus:ring-1 focus:ring-[#113C27] flex-1 font-semibold placeholder-[#738276]"
      />
      <button
        type="submit"
        className="bg-[#113C27] hover:bg-[#2D6A4F] text-white p-3 rounded-xl transition-all duration-200"
        aria-label="Subscribe"
      >
        <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </form>
  );
}
