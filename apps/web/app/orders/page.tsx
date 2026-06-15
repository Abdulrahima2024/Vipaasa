"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Loader2, RefreshCw, Truck } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/useCartStore";

interface OrderItem {
  id: string;
  orderId: string;
  placedOn: string;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  images: string[];
  extraItemsCount?: number;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderId: "#VO-89341",
    placedOn: "Oct 24, 2023",
    total: 142.50,
    status: "Delivered",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=150"
    ],
    extraItemsCount: 1
  },
  {
    id: "ord-2",
    orderId: "#VO-90212",
    placedOn: "Nov 02, 2023",
    total: 88.00,
    status: "Shipped",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=150"
    ]
  },
  {
    id: "ord-3",
    orderId: "#VO-91045",
    placedOn: "Today, 09:12 AM",
    total: 210.30,
    status: "Processing",
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=150"
    ],
    extraItemsCount: 3
  },
  {
    id: "ord-4",
    orderId: "#VO-87221",
    placedOn: "Sep 15, 2023",
    total: 45.00,
    status: "Cancelled",
    images: [
      "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?auto=format&fit=crop&q=80&w=150"
    ]
  }
];

type StatusFilter = "All Orders" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { items, favorites } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusFilter>("All Orders");
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    setMounted(true);
    // Map cart items to order-like objects for display
    const cartOrders = items.map((item, idx) => ({
      id: `order-${idx}`,
      orderId: `#VO-${Date.now() + idx}`,
      placedOn: new Date().toLocaleDateString(),
      total: item.price * item.quantity,
      status: "Processing" as const,
      images: item.image ? [item.image] : [],
      extraItemsCount: 0,
    } as any));
    setOrders(cartOrders);
  }, [items]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#0F5132] animate-spin" />
          <span className="text-sm font-semibold text-[#5C6E61]">Loading your orders...</span>
        </div>
      </div>
    );
  }

  const activeCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Filter orders based on selected tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "All Orders") return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-[#C1F2D0]/50 text-[#0F5132]">
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-[#D2F4EA] text-[#0F5132]">
            Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-[#EAE6DB]/75 text-[#5C6E61]">
            Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-[#FDE4E4] text-[#A84444]">
            Cancelled
          </span>
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
        {/* Title Block */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#113C27] tracking-tight">
            My Orders
          </h1>
          <p className="text-sm sm:text-base text-[#5C6E61] mt-1 font-medium">
            Track your artisanal purchases and organic deliveries.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="border-b border-[#EAE6DB] mb-8 flex overflow-x-auto whitespace-nowrap no-scrollbar gap-6">
          {(["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  isActive
                    ? "text-[#113C27]"
                    : "text-[#738276] hover:text-[#113C27]"
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#113C27] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        <div className="space-y-6 mb-12">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#EAE6DB]/60 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
            >
              {/* Order Info Row */}
              <div className="px-6 py-4 bg-[#FAF9F5]/40 border-b border-[#EAE6DB]/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#738276]">
                  <div>
                    <span className="block text-[10px] text-[#A39E93] mb-0.5">Order ID</span>
                    <span className="text-sm font-bold text-[#1F3E2F]">{order.orderId}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#A39E93] mb-0.5">Placed On</span>
                    <span className="text-[#1F3E2F]">{order.placedOn}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#A39E93] mb-0.5">Total</span>
                    <span className="text-[#0F5132] font-extrabold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Body: Thumbnails & Action */}
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Product Images */}
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                  {order.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-xl border border-[#EAE6DB]/60 overflow-hidden bg-[#F9F7F2] flex-shrink-0"
                    >
                      <img
                        src={img}
                        alt="Product thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.extraItemsCount && order.extraItemsCount > 0 && (
                    <div className="w-16 h-16 rounded-xl border border-[#EAE6DB]/60 bg-[#FAF9F5] flex items-center justify-center text-xs font-bold text-[#738276] flex-shrink-0">
                      +{order.extraItemsCount}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {order.status === "Shipped" && (
                    <button
                      className="bg-[#EAE6DB]/60 hover:bg-[#EAE6DB]/90 text-[#1F3E2F] py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Order
                    </button>
                  )}
                  {order.status === "Cancelled" && (
                    <button
                      className="bg-[#EAE6DB]/60 hover:bg-[#EAE6DB]/90 text-[#1F3E2F] py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reorder
                    </button>
                  )}
                  
                  <button
                    className={`py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 ${
                      order.status === "Cancelled"
                        ? "bg-[#EAE6DB]/60 hover:bg-[#EAE6DB]/90 text-[#1F3E2F]"
                        : "bg-[#0F5132] hover:bg-[#113C27] text-white shadow-sm shadow-green-950/10"
                    }`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-20 bg-white/60 border border-dashed border-[#EAE6DB] rounded-3xl p-10">
              <span className="text-sm text-[#738276] font-semibold">No orders found matching this status.</span>
            </div>
          )}
        </div>

        {/* Bottom Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Help Banner */}
          <div className="md:col-span-8 bg-[#0F5132] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-[0_12px_40px_rgba(15,81,50,0.08)]">
            <div className="max-w-md relative z-10 space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white leading-tight">
                Need help with an order?
              </h3>
              <p className="text-xs sm:text-sm text-[#C1F2D0] leading-relaxed font-semibold">
                Our artisanal support team is here to assist you with tracking, returns, or any questions about our organic sourcing.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link
                href="/support"
                className="inline-block bg-white hover:bg-[#FAF8F5] text-[#0F5132] py-3 px-6 rounded-xl font-bold transition-all text-xs tracking-wider"
              >
                Contact Support
              </Link>
            </div>
            
            {/* Watermark question mark */}
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10 select-none pointer-events-none">
              <span className="text-[160px] font-bold text-white font-serif">?</span>
            </div>
          </div>

          {/* Invoices Card */}
          <div className="md:col-span-4 bg-[#FCE8E6] rounded-3xl p-8 flex flex-col justify-between min-h-[200px] shadow-[0_12px_40px_rgba(0,0,0,0.01)] border border-[#EAE6DB]/20">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5]/50 flex items-center justify-center text-[#A84444]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#1F3E2F]">Invoices</h3>
                <p className="text-xs text-[#738276] leading-relaxed font-semibold">
                  Download digital receipts for all your past purchases.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#A84444] hover:text-[#8b3535] underline transition-all"
              >
                Go to Receipts <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
