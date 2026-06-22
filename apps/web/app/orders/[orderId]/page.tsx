"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  User, 
  XCircle, 
  CornerUpLeft, 
  DollarSign, 
  AlertCircle,
  HelpCircle,
  FileText,
  Sprout
} from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuthStore } from "../../../store/authStore";
import { fetchApi } from "../../../lib/api";
import { parseEmojiImage } from "../../../lib/image";

interface StatusHistoryItem {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  totalPayable: number;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  createdAt: string;
  executive?: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
    variant: {
      id: string;
      name: string;
      product: {
        id: string;
        name: string;
        image?: string;
        images?: Array<{ url: string }>;
      };
    };
  }>;
  statusHistory: StatusHistoryItem[];
}

export default function OrderTrackingPage() {
  const { orderId } = useParams() as { orderId: string };
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/orders/" + orderId);
      return;
    }

    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetchApi<{ data: OrderDetail }>("/api/orders/" + orderId);
        if (res && res.data) {
          setOrder(res.data);
        } else {
          setError("Failed to load order details.");
        }
      } catch (err: any) {
        console.error("Failed to load order details:", err);
        setError(err.message || "An error occurred while loading order details.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId && token) {
      loadOrder();
    }
  }, [orderId, token, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#1B4332]" />
          <p className="mt-4 text-[#5C6E61] font-semibold text-sm">Loading tracking details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col">
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex p-4 rounded-full bg-red-50 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#113C27] mb-2">Order Not Found</h1>
          <p className="text-sm text-[#5C6E61] mb-8 leading-relaxed">
            {error || "We couldn't retrieve the details for this order. It may have been deleted or belongs to another user."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#113C27] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper: check status history dates
  const getStatusTime = (statusKey: string) => {
    const history = order.statusHistory.find(
      (h) => h.status.toLowerCase() === statusKey.toLowerCase()
    );
    if (history) {
      const date = new Date(history.createdAt);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + 
        " at " + 
        date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return null;
  };

  // Determine current active steps based on OrderStatus
  const statusHierarchy = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStatusIndex = statusHierarchy.indexOf(order.status);

  // Status timeline steps mapping
  const timelineSteps = [
    {
      key: "PENDING",
      label: "Order Received",
      defaultTime: getStatusTime("PENDING") || new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isActive: currentStatusIndex >= 0 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 0 && order.status !== "CANCELLED"
    },
    {
      key: "CONFIRMED",
      label: "Payment Confirmed",
      defaultTime: getStatusTime("CONFIRMED") || (order.paymentStatus === "PAID" ? "Payment received" : null),
      isActive: currentStatusIndex >= 1 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 1 && order.status !== "CANCELLED"
    },
    {
      key: "PROCESSING",
      label: "Processing",
      defaultTime: getStatusTime("PROCESSING") || null,
      isActive: currentStatusIndex >= 2 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 2 && order.status !== "CANCELLED"
    },
    {
      key: "PACKED",
      label: "Packed",
      defaultTime: getStatusTime("PACKED") || null,
      isActive: currentStatusIndex >= 2 && order.status !== "CANCELLED", // derived under processing
      isCompleted: currentStatusIndex > 2 && order.status !== "CANCELLED"
    },
    {
      key: "DISPATCHED",
      label: "Ready for Dispatch",
      defaultTime: getStatusTime("DISPATCHED") || null,
      isActive: currentStatusIndex >= 2 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 2 && order.status !== "CANCELLED"
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      defaultTime: getStatusTime("SHIPPED") || null,
      isActive: currentStatusIndex >= 3 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 3 && order.status !== "CANCELLED"
    },
    {
      key: "DELIVERING",
      label: "Out for Delivery",
      defaultTime: getStatusTime("DELIVERING") || (order.status === "SHIPPED" ? "In Transit" : null),
      isActive: currentStatusIndex >= 3 && order.status !== "CANCELLED",
      isCompleted: currentStatusIndex > 3 && order.status !== "CANCELLED"
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      defaultTime: getStatusTime("DELIVERED") || null,
      isActive: order.status === "DELIVERED",
      isCompleted: order.status === "DELIVERED"
    }
  ];

  // Additional Special Status Indicators
  const isCancelled = order.status === "CANCELLED";
  const isReturned = order.status === "RETURNED";
  const isRefunded = order.paymentStatus === "REFUNDED";

  const executiveName = order.executive 
    ? `${order.executive.profile?.firstName || ""} ${order.executive.profile?.lastName || ""}`.trim() 
    : "Rahul Singh";
  
  const executivePhone = order.executive?.profile?.phoneNumber || "+91 98765 43210";

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col text-[#1F3E2F]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation back and header controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <Link 
              href="/orders" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C6E61] hover:text-[#1B4332] transition-colors mb-2 uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" /> Back to My Orders
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#113C27]">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6E61] font-semibold">
              Order #{order.orderNumber} &mdash; Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/support"
              className="bg-white border border-[#EAE6DB] hover:border-[#738276]/60 text-[#1F3E2F] text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-[#738276]" />
              Support
            </Link>
            <Link 
              href={`/orders/${order.id}/invoice`}
              className="bg-[#113C27] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-green-950/10 active:scale-95 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              View Invoice
            </Link>
          </div>
        </div>

        {/* Main tracking content grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Timeline Journey Progress (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white border border-[#EAE6DB]/60 rounded-3xl p-6 shadow-sm">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#113C27] pb-4 border-b border-[#EAE6DB]/60 flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#738276]" /> Journey Progress
            </h2>

            <div className="relative pl-8 space-y-6">
              {/* Timeline continuous line */}
              <div className="absolute top-3 bottom-3 left-[15px] w-0.5 bg-gray-100" />

               {/* Status steps */}
              {timelineSteps.map((step, idx) => {
                const isStepCompleted = step.isCompleted;
                const isStepActive = step.isActive && !isStepCompleted;
                const isCurrentStatus = (step.isActive && !isStepCompleted) || (order.status === "DELIVERED" && step.key === "DELIVERED");

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle icon marker */}
                    <div 
                      className={`absolute -left-[27px] w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                        isCurrentStatus && !isCancelled
                          ? "bg-white border-[#113C27] text-[#113C27] animate-pulse"
                          : isStepCompleted
                          ? "bg-[#113C27] border-[#113C27] text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {isCurrentStatus && !isCancelled ? (
                        <Sprout className="w-4 h-4 text-[#113C27]" />
                      ) : isStepCompleted ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>

                    <div className="space-y-0.5 pl-3">
                      <h4 className={`text-xs sm:text-sm font-bold ${
                        isStepCompleted || isStepActive || isCurrentStatus ? "text-[#1F3E2F]" : "text-gray-400"
                      }`}>
                        {step.label}
                      </h4>
                      {step.defaultTime && (
                        <p className="text-[10px] sm:text-xs text-[#738276] font-medium">
                          {step.defaultTime}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Special Status Badges */}
            <div className="mt-8 pt-6 border-t border-[#EAE6DB]/60 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-full ${isCancelled ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-50 text-gray-300"}`}>
                  <XCircle className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${isCancelled ? "text-red-600" : "text-gray-400"}`}>Cancelled</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-full ${isReturned ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-gray-50 text-gray-300"}`}>
                  <CornerUpLeft className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${isReturned ? "text-amber-600" : "text-gray-400"}`}>Returned</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className={`p-2 rounded-full ${isRefunded ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-300"}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${isRefunded ? "text-emerald-600" : "text-gray-400"}`}>Refunded</span>
              </div>
            </div>
          </div>

          {/* Right Column: Map, Courier Info, Address, Item List (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Map and courier layout */}
            <div className="relative rounded-3xl overflow-hidden border border-[#EAE6DB]/60 bg-gradient-to-br from-[#FFEBEB] to-[#FFFBF5] shadow-sm">
              <div className="relative aspect-[1.8] w-full">
                <img 
                  src="/delivery_route_map.png"
                  alt="Delivery Route Tracking Map"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Delivery associate detail overlay card */}
              <div className="p-5 border-t border-[#EAE6DB]/60 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#113C27] flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#738276] uppercase tracking-wider">
                      Your Delivery Associate
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#113C27] leading-snug">
                      {executiveName}
                    </h3>
                    <p className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5 mt-0.5">
                      ★ 4.9 Rating
                    </p>
                  </div>
                </div>

                <a 
                  href={`tel:${executivePhone}`}
                  className="bg-[#113C27] hover:bg-[#2D6A4F] text-white py-2 px-5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-green-950/10 active:scale-95 flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-200" /> Call
                </a>
              </div>
            </div>

            {/* Address & Items Summary boxes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Shipping Address */}
              <div className="md:col-span-6 bg-white border border-[#EAE6DB]/60 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#738276]" /> Shipping Address
                </h3>
                <div className="text-xs text-[#5C6E61] space-y-1 font-semibold leading-relaxed">
                  <p>{order.shippingAddressLine1}</p>
                  {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                  <p>{order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}</p>
                  <p>{order.shippingCountry}</p>
                  {executivePhone && <p className="pt-2 text-[#1F3E2F] font-bold">{executivePhone}</p>}
                </div>
              </div>

              {/* Items List */}
              <div className="md:col-span-6 bg-white border border-[#EAE6DB]/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#738276]" /> Items Ordered
                  </h3>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {order.items.map((item) => {
                      const emojiInfo = parseEmojiImage(item.variant?.product?.image);
                      return (
                        <div key={item.id} className="flex justify-between items-center gap-2 text-xs py-1 border-b border-[#EAE6DB]/30 last:border-0">
                          <span className="text-[#5C6E61] font-semibold truncate flex-1">
                            {item.variant?.product?.name || "Product Item"} ({item.variant?.name || "Standard"})
                          </span>
                          <span className="text-[#738276] font-bold flex-shrink-0">
                            x{item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAE6DB]/60 flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-[#738276]">Total Paid</span>
                  <span className="text-base font-black text-[#113C27]">₹{Number(order.totalPayable).toLocaleString()}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
