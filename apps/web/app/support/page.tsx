"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Clock, HelpCircle, Loader2 } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/authStore";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQs: FAQItem[] = [
  {
    question: "How long does shipping/delivery take?",
    answer: "Our fresh organic harvests are delivered within 2-4 hours for express locations, and within 24 hours for standard city limits. You can view real-time shipping updates in your Orders tab."
  },
  {
    question: "What is your refund policy?",
    answer: "We offer a 100% satisfaction guarantee. If you are not satisfied with the quality of any harvest item, please contact us within 24 hours of delivery for a full replacement or refund."
  },
  {
    question: "Where do you source your products?",
    answer: "All Vipaasa products are sourced directly from certified organic cooperative micro-farmers. We ensure our flours are stone-ground, ghee is traditional A2 bilona churned, and honey is raw and unprocessed."
  },
  {
    question: "Can I cancel or modify my order?",
    answer: "Yes, you can cancel your order directly from the Orders tab within 15 minutes of placing it (before fulfillment begins). Once processed or shipped, order modifications are not possible."
  }
];

export default function SupportPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, favorites } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Order Status");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate API request saving ticket details
    setTimeout(() => {
      setLoading(false);
      const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
      router.push(`/support/${ticketId}?category=${encodeURIComponent(category)}&message=${encodeURIComponent(message)}`);
    }, 1200);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#113C27] animate-spin" />
      </div>
    );
  }

  const activeCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      <Header
        showSearch={false}
        cartCount={activeCartCount}
        favoritesCount={favorites.length}
        activeNav=""
      />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#113C27] tracking-tight">
            Support Center
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#5C6E61] leading-relaxed">
            Need help with a harvest order or product details? Find answers below or start a live support ticket simulation.
          </p>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all">
            <div className="p-3 bg-[#EAF5EC] text-[#113C27] rounded-2xl">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#113C27]">Email Support</h3>
            <p className="text-xs text-gray-500 font-medium">Get in touch with our billing & general query team</p>
            <a href="mailto:support@vipaasa.com" className="text-xs font-bold text-[#113C27] underline">
              support@vipaasa.com
            </a>
          </div>

          <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all">
            <div className="p-3 bg-[#FFF5F5] text-[#A84444] rounded-2xl">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#113C27]">Call Us Directly</h3>
            <p className="text-xs text-gray-500 font-medium">Direct customer care line for fast queries</p>
            <a href="tel:+919876543210" className="text-xs font-bold text-[#113C27] underline">
              +91 98765 43210
            </a>
          </div>

          <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)] transition-all">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#113C27]">Support Hours</h3>
            <p className="text-xs text-gray-500 font-medium">Standard support timings</p>
            <span className="text-xs font-bold text-[#113C27]">
              Mon - Sat: 9 AM - 6 PM IST
            </span>
          </div>
        </div>

        {/* Content Section: FAQ + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FAQ Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#113C27] flex items-center gap-2 border-b border-[#EAE6DB] pb-3">
              <HelpCircle className="w-5 h-5 text-[#2D6A4F]" /> Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#EAE6DB]/60 space-y-3">
              {FAQs.map((faq, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <div key={idx} className="bg-white border border-[#EAE6DB]/60 rounded-2xl overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => toggleFAQ(idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[#113C27] focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-[#5C6E61] leading-relaxed font-semibold">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-[#113C27] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2D6A4F]" /> Open Support Ticket
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Submit details below to launch the live support chat simulation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] p-3 text-xs outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] p-3 text-xs outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Query Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] p-3 text-xs outline-none font-medium bg-white cursor-pointer"
                  >
                    <option value="Order Status">Order Status & Tracking</option>
                    <option value="Payments & Refunds">Payments & Refunds</option>
                    <option value="Product Quality">Product Quality & Feedback</option>
                    <option value="General Queries">General Queries</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Message / Query Description</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query in detail..."
                    className="w-full rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] p-3 text-xs outline-none font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#113C27] hover:bg-[#2D6A4F] text-white text-xs font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-green-950/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching Chat...
                    </>
                  ) : (
                    "Launch Live Support Chat"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
