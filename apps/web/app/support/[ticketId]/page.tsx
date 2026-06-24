"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import ChatWindow from "../../../components/support/ChatWindow";
import { useCartStore } from "../../../store/useCartStore";

interface Props {
  params: {
    ticketId: string;
  };
}

export default function TicketSupportPage({ params }: Props) {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { items, favorites } = useCartStore();

  const ticketId = params.ticketId || "TKT-UNKNOWN";
  const category = searchParams.get("category") || "General Help";
  const message = searchParams.get("message") || "";

  useEffect(() => {
    setMounted(true);
  }, []);

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

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#113C27] hover:text-[#2D6A4F] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Support Center
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chat Window Column */}
          <div className="lg:col-span-8">
            <ChatWindow
              ticketId={ticketId}
              category={category}
              initialMessage={message}
            />
          </div>

          {/* Ticket Info Card Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <h3 className="font-serif text-base font-extrabold text-[#113C27] border-b border-[#EAE6DB] pb-3">
                Session Metadata
              </h3>
              
              <div className="space-y-3 text-xs font-medium text-[#5C6E61]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Ticket Reference</span>
                  <span className="text-[#1F3E2F] font-bold text-sm">{ticketId}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Topic</span>
                  <span className="text-[#1F3E2F] font-bold">{category}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Service Level Agreement</span>
                  <span className="text-[#1F3E2F] font-bold">2-4 Hours Reply Guarantee</span>
                </div>
              </div>
            </div>

            <div className="bg-[#EAF5EC] border border-[#C1F2D0] rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#113C27] font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" /> End-to-End Secure
              </div>
              <p className="text-[11px] text-[#5C6E61] leading-relaxed font-semibold">
                Your support chats are encrypted and securely logged. Vipaasa Customer Care values your privacy. We never share chat logs with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
