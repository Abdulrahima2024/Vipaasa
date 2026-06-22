"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, Loader2, RefreshCw, Truck, X, User as UserIcon, CreditCard, ShoppingBag } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/useCartStore";
import { parseEmojiImage } from "../../lib/image";
import { fetchApi } from "../../lib/api";

interface OrderItem {
  id: string;
  orderId: string;
  placedOn: string;
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  rawStatus: string;
  images: string[];
  extraItemsCount?: number;
  shippingAddress?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  paymentMethod?: string;
  itemsList?: any[];
  subtotal?: number;
  shippingFee?: number;
  taxAmount?: number;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: "ord-1",
    orderId: "#VO-89341",
    placedOn: "Oct 24, 2023",
    total: 142.50,
    status: "Delivered",
    rawStatus: "DELIVERED",
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
    rawStatus: "SHIPPED",
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
    rawStatus: "PENDING",
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
    total: 0,
    status: "Cancelled",
    rawStatus: "CANCELLED",
    images: [],
    shippingAddress: "",
    paymentStatus: "",
    deliveryStatus: "",
    paymentMethod: "",
    itemsList: [],
    subtotal: 0,
    shippingFee: 0,
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
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderItem | null>(null);

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const response = await fetchApi<{ status: string; message?: string; data?: any }>(
        `/api/orders/${cancellingOrderId}/cancel`,
        {
          method: "PATCH",
        }
      );

      if (response && (response.status === "success" || response.data)) {
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === cancellingOrderId
              ? { ...o, status: "Cancelled" as const, rawStatus: "CANCELLED" }
              : o
          )
        );
        if (selectedOrderDetail && selectedOrderDetail.id === cancellingOrderId) {
          setSelectedOrderDetail((prev) =>
            prev ? { ...prev, status: "Cancelled" as const, rawStatus: "CANCELLED" } : null
          );
        }
        setIsCancelConfirmOpen(false);
        setCancellingOrderId(null);
      } else {
        setCancelError(response?.message || "Failed to cancel order.");
      }
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      setCancelError(err?.message || "An error occurred while cancelling your order.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchApi<{ status: string; data: any[] }>("/api/orders")
        .then((res) => {
          if (res && res.data) {
            const mapped = res.data.map((order: any) => {
              const formattedImages = (order.items || []).map((item: any) => {
                const img = item.variant?.product?.images?.[0]?.url || item.variant?.product?.image || "🟢";
                return img;
              });

              let status: OrderItem["status"] = "Processing";
              if (order.status === "SHIPPED") status = "Shipped";
              else if (order.status === "DELIVERED") status = "Delivered";
              else if (order.status === "CANCELLED") status = "Cancelled";

              const addr = `${order.shippingAddressLine1}${order.shippingAddressLine2 ? ", " + order.shippingAddressLine2 : ""}, ${order.shippingCity}, ${order.shippingState}, ${order.shippingPostalCode}`;

              return {
                id: order.id,
                orderId: order.orderNumber || `#${order.id.slice(0, 8)}`,
                placedOn: new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                total: Number(order.totalPayable),
                status,
                rawStatus: order.status,
                images: formattedImages.slice(0, 3),
                extraItemsCount: Math.max(0, formattedImages.length - 3),
                shippingAddress: addr,
                paymentStatus: order.paymentStatus,
                deliveryStatus: order.deliveryStatus,
                paymentMethod: order.payments?.[0]?.paymentMethod || "COD",
                itemsList: (order.items || []).map((item: any) => ({
                  name: item.variant?.product?.name || "Product",
                  spec: item.variant?.name || "",
                  quantity: item.quantity,
                  price: Number(item.unitPrice),
                  image: item.variant?.product?.images?.[0]?.url || item.variant?.product?.image || "🟢",
                })),
                subtotal: Number(order.totalItemsPrice),
                shippingFee: Number(order.shippingFee),
                taxAmount: Number(order.taxAmount),
              };
            });
            setOrders(mapped);
          }
        })
        .catch((err) => {
          console.error("Failed to load customer orders:", err);
        });
    }
  }, [isAuthenticated, items]);

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

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#113C27] tracking-tight">
            My Orders
          </h1>
          <p className="text-sm sm:text-base text-[#5C6E61] mt-1 font-medium">
            Track your artisanal purchases and organic deliveries.
          </p>
        </div>

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

        <div className="space-y-6 mb-12">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#EAE6DB]/60 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
            >
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

              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                  {order.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-xl border border-[#EAE6DB]/60 overflow-hidden bg-[#F9F7F2] flex-shrink-0"
                    >
                      {(() => {
                        const emojiInfo = parseEmojiImage(img);
                        return emojiInfo.isEmoji ? (
                          <div
                            className="w-full h-full flex items-center justify-center text-3xl select-none"
                            style={{ backgroundColor: emojiInfo.bgColor }}
                          >
                            {emojiInfo.emoji}
                          </div>
                        ) : (
                          <img
                            src={img}
                            alt="Product thumbnail"
                            className="w-full h-full object-cover"
                          />
                        );
                      })()}
                    </div>
                  ))}
                  {order.extraItemsCount && order.extraItemsCount > 0 && (
                    <div className="w-16 h-16 rounded-xl border border-[#EAE6DB]/60 bg-[#FAF9F5] flex items-center justify-center text-xs font-bold text-[#738276] flex-shrink-0">
                      +{order.extraItemsCount}
                    </div>
                  )}
                </div>

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
                  
                  {order.rawStatus === "PENDING" && (
                    <button
                      onClick={() => {
                        setCancellingOrderId(order.id);
                        setIsCancelConfirmOpen(true);
                      }}
                      className="bg-[#FAF9F5] hover:bg-[#FDE4E4] text-[#A84444] border border-[#EAE6DB] hover:border-[#FDE4E4] py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrderDetail(order)}
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

      {/* DETAILED MODAL DIALOG */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE6DB]/60 p-6 sm:p-8 space-y-6 relative text-left">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-6 right-6 p-2 bg-[#FAF9F5] hover:bg-[#EAE6DB]/40 rounded-full text-[#738276] hover:text-[#1F3E2F] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <span className="text-[10px] font-bold text-[#A39E93] uppercase tracking-widest block mb-1">Order Details</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#113C27] tracking-tight">
                {selectedOrderDetail.orderId}
              </h2>
              <p className="text-xs font-semibold text-[#738276] mt-1">Placed on {selectedOrderDetail.placedOn}</p>
            </div>

            {/* How Ordered & Which User Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-6 border-b border-[#EAE6DB]/45">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#738276]" />
                  Customer Details
                </h3>
                <div className="text-xs space-y-1 font-semibold text-[#5C6E61]">
                  <p className="text-[#1F3E2F] font-bold text-sm">
                    {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : user?.email.split("@")[0]}
                  </p>
                  <p>Email: {user?.email}</p>
                  <p>Phone: {user?.phoneNumber || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#738276]" />
                  Shipping Address
                </h3>
                <p className="text-xs font-semibold text-[#5C6E61] leading-relaxed">
                  {selectedOrderDetail.shippingAddress || "No shipping address provided."}
                </p>
              </div>
            </div>

            {/* Payment status & Fulfillment status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#EAE6DB]/45">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#738276]" />
                  Payment Details
                </h3>
                <div className="text-xs space-y-1 font-semibold text-[#5C6E61]">
                  <p className="text-[#1F3E2F] font-bold text-sm">
                    Paid via {selectedOrderDetail.paymentMethod || "COD"}
                  </p>
                  <p>Status: <span className="font-bold text-[#0F5132]">{selectedOrderDetail.paymentStatus || "UNPAID"}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#738276]" />
                  Fulfillment Status
                </h3>
                <div>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#0F5132]">
                    {selectedOrderDetail.status}
                  </span>
                  <span className="block text-[10px] font-bold text-[#738276] mt-1.5">
                    Delivery: {selectedOrderDetail.deliveryStatus || "PENDING"}
                  </span>
                </div>
              </div>
            </div>

            {/* What Products */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#1F3E2F] uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#738276]" />
                Products Placed ({selectedOrderDetail.itemsList?.length || 0})
              </h3>
              <div className="border border-[#EAE6DB]/60 rounded-2xl overflow-hidden divide-y divide-[#EAE6DB]/40">
                {selectedOrderDetail.itemsList && selectedOrderDetail.itemsList.length > 0 ? (
                  selectedOrderDetail.itemsList.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 first:pt-4 last:pb-4 items-center bg-[#FAF9F5]/20">
                      <div className="w-12 h-12 rounded-lg border border-[#EAE6DB]/60 overflow-hidden bg-[#F9F7F2] flex-shrink-0 flex items-center justify-center">
                        {(() => {
                          const emojiInfo = parseEmojiImage(item.image);
                          return emojiInfo.isEmoji ? (
                            <span className="text-2xl select-none" style={{ backgroundColor: emojiInfo.bgColor }}>
                              {emojiInfo.emoji}
                            </span>
                          ) : (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1F3E2F] text-xs sm:text-sm truncate">{item.name}</h4>
                        <p className="text-[10px] text-[#738276] font-semibold mt-0.5">
                          {item.spec} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-[#113C27] text-xs sm:text-sm whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-[#738276] font-semibold">
                    No items in this order.
                  </div>
                )}

                {/* Total breakdown */}
                <div className="p-4 bg-[#FAF9F5]/45 border-t border-[#EAE6DB]/60 text-xs font-bold text-[#5C6E61] space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Items Subtotal</span>
                    <span className="text-[#1F3E2F]">₹{(selectedOrderDetail.subtotal || selectedOrderDetail.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping Fee</span>
                    <span className="text-[#1F3E2F]">₹{(selectedOrderDetail.shippingFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Estimated GST (18%)</span>
                    <span className="text-[#1F3E2F]">₹{(selectedOrderDetail.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#EAE6DB]/40 text-sm font-extrabold text-[#113C27]">
                    <span>Total Amount Paid</span>
                    <span>₹{selectedOrderDetail.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              {selectedOrderDetail.rawStatus === "PENDING" ? (
                <button
                  onClick={() => {
                    setCancellingOrderId(selectedOrderDetail.id);
                    setIsCancelConfirmOpen(true);
                  }}
                  className="bg-[#FAF9F5] hover:bg-[#FDE4E4] text-[#A84444] border border-[#EAE6DB] hover:border-[#FDE4E4] py-3 px-6 rounded-xl font-bold transition-all text-xs active:scale-95 flex items-center gap-1.5 animate-fade-in"
                >
                  <X className="w-4 h-4" /> Cancel Order
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="bg-[#0F5132] hover:bg-[#113C27] text-white py-3 px-8 rounded-xl font-bold transition-all text-xs active:scale-95 shadow-sm shadow-green-950/10"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION DIALOG */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#EAE6DB] p-6 space-y-6 relative text-left">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#113C27]">Cancel Order?</h3>
              <p className="text-xs text-[#5C6E61] mt-2 leading-relaxed">
                Are you sure you want to cancel this order? This action will release all reserved inventory items and cannot be undone.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-[#FDE4E4] border border-[#FAF9F5] text-xs text-[#A84444] rounded-xl font-semibold">
                {cancelError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isCancelling}
                onClick={() => {
                  setIsCancelConfirmOpen(false);
                  setCancellingOrderId(null);
                  setCancelError(null);
                }}
                className="bg-[#EAE6DB]/60 hover:bg-[#EAE6DB]/90 text-[#1F3E2F] py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 disabled:opacity-50"
              >
                No, Keep Order
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="bg-[#A84444] hover:bg-[#8b3535] text-white py-2.5 px-5 rounded-xl font-bold transition-all text-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
