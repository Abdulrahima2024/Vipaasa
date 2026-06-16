"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Tag, Truck, Package, ArrowLeft, Loader2, Check } from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuthStore } from "../../../store/authStore";
import { useCartStore } from "../../../store/useCartStore";

interface NotificationItem {
  id: string;
  type: "order" | "sale" | "delivery" | "shipment";
  title: string;
  description: string;
  timestamp: string;
  isNew: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "order",
    title: "Order Confirmed",
    description: "Your order #VP-8829 for Raw Forest Honey and Cold-Pressed Mustard Oil has been confirmed.",
    timestamp: "2 mins ago",
    isNew: true,
  },
  {
    id: "notif-2",
    type: "sale",
    title: "Seasonal Harvest Sale",
    description: "Exclusive early access! Get 20% off on our entire Essential Oils collection for the next 24 hours.",
    timestamp: "3 hours ago",
    isNew: true,
  },
  {
    id: "notif-3",
    type: "delivery",
    title: "Out for Delivery",
    description: "Your organic pantry staples are on their way and expected to arrive by 6 PM today.",
    timestamp: "Yesterday",
    isNew: false,
  },
  {
    id: "notif-4",
    type: "shipment",
    title: "Items Shipped",
    description: "Great news! Your Handcrafted Pottery set has been dispatched from our workshop.",
    timestamp: "Jan 12",
    isNew: false,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items, favorites } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("vipaasa_notifications_page");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notifications", e);
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem("vipaasa_notifications_page", JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/account/notifications");
    }
  }, [mounted, isAuthenticated, router]);

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem("vipaasa_notifications_page", JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isNew: false }));
    saveNotifications(updated);
  };

  const handleToggleRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isNew: !n.isNew } : n
    );
    saveNotifications(updated);
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#0F5132] animate-spin" />
          <span className="text-sm font-semibold text-[#5C6E61]">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const activeCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return (
          <div className="w-12 h-12 rounded-full bg-[#C1F2D0]/50 flex items-center justify-center text-[#0F5132]">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "sale":
        return (
          <div className="w-12 h-12 rounded-full bg-[#0F5132] flex items-center justify-center text-[#FAF8F5]">
            <Tag className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "delivery":
        return (
          <div className="w-12 h-12 rounded-full bg-[#EAE6DB]/60 flex items-center justify-center text-[#4B594F]">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "shipment":
        return (
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EAE6DB] flex items-center justify-center text-[#2D6A4F]">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Google Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* Header */}
      <Header
        showSearch={false}
        cartCount={activeCartCount}
        favoritesCount={favorites.length}
        activeNav=""
      />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back to Profile */}
        <div className="mb-6">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5C6E61] hover:text-[#0F5132] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        {/* Title / Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#113C27] tracking-tight">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-[#5C6E61] mt-1 font-medium">
              Stay updated with your artisanal orders and exclusive offers.
            </p>
          </div>

          {notifications.some((n) => n.isNew) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center justify-center gap-2 border border-[#EAE6DB] hover:border-[#738276] bg-white text-[#113C27] hover:bg-[#FAF8F5] py-2 px-5 rounded-full font-semibold transition-all text-xs tracking-wide shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4 mb-16">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleToggleRead(notif.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                notif.isNew
                  ? "bg-white border-[#C1F2D0]/60 shadow-[0_6px_20px_rgba(15,81,50,0.02)] hover:border-[#0F5132]/25"
                  : "bg-white/75 border-[#EAE6DB]/50 hover:bg-white hover:border-[#738276]/30"
              }`}
            >
              {/* Left Column: Color-coded Icon */}
              <div className="flex-shrink-0">
                {getIcon(notif.type)}
              </div>

              {/* Middle Column: Details */}
              <div className="flex-grow min-w-0 pr-4">
                <h3 className="font-serif text-base font-bold text-[#113C27] leading-tight">
                  {notif.title}
                </h3>
                <p className="text-sm text-[#5C6E61] font-semibold mt-1 leading-relaxed">
                  {notif.description}
                </p>
                {notif.isNew && (
                  <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-bold text-[#0F5132]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F5132]" />
                    New
                  </span>
                )}
              </div>

              {/* Right Column: Time */}
              <div className="flex-shrink-0 text-right">
                <span className="text-[11px] font-bold text-[#738276]">
                  {notif.timestamp}
                </span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 bg-white/60 border border-dashed border-[#EAE6DB] rounded-3xl p-10">
              <span className="text-sm text-[#738276] font-semibold">You have no notifications yet.</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
