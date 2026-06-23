"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../lib/api";
import { 
  ChevronRight, 
  Search, 
  ChevronDown, 
  Download, 
  RefreshCw, 
  X,
  Printer,
  Ban,
  RotateCcw,
  CircleDollarSign,
  Truck,
  TrendingUp,
  ShoppingBag
} from "lucide-react";
import { OrderDetailsModal, Order } from "../../../components/OrderDetailsModal";
import AssignDeliveryModal from "../../../components/orders/AssignDeliveryModal";

// Order and OrderItem interfaces are imported from OrderDetailsModal

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats state
  const [orderStats, setOrderStats] = useState<{ totalRevenue: number; totalOrders: number } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  const fetchOrders = () => {
    setIsLoading(true);
    fetchAPI("/api/admin/orders")
      .then((res) => {
        if (res && res.data) {
          const mapped: Order[] = res.data.map((o: any) => {
            const formattedItems = (o.items || []).map((item: any) => ({
              name: item.variant?.product?.name || "Product",
              qty: item.quantity,
              weight: item.variant?.weightGrams ? `${item.variant.weightGrams}g` : "250g",
              price: Number(item.unitPrice),
            }));

            const addr = `${o.shippingAddressLine1}${o.shippingAddressLine2 ? ', ' + o.shippingAddressLine2 : ''}, ${o.shippingCity}, ${o.shippingState}, ${o.shippingPostalCode}`;

            let status = "Pending";
            if (o.status === "PENDING_PAYMENT") status = "Pending Payment";
            else if (o.status === "PAYMENT_FAILED") status = "Payment Failed";
            else if (o.status === "PAYMENT_SUCCESS") status = "Payment Success";
            else if (o.status === "CONFIRMED") status = "Confirmed";
            else if (o.status === "PROCESSING") status = "Processing";
            else if (o.status === "PACKED") status = "Packed";
            else if (o.status === "SHIPPED") status = "Shipped";
            else if (o.status === "OUT_FOR_DELIVERY") status = "Out for Delivery";
            else if (o.status === "DELIVERY_FAILED") status = "Delivery Failed";
            else if (o.status === "DELIVERED") status = "Delivered";
            else if (o.status === "RETURN_REQUESTED") status = "Return Requested";
            else if (o.status === "RETURNED") status = "Returned";
            else if (o.status === "CANCELLED") status = "Cancelled";
            else if (o.status === "REFUNDED") status = "Refunded";

            if (o.paymentStatus === "REFUNDED") {
              status = "Refunded";
            }

            return {
              id: o.id,
              orderNumber: o.orderNumber || o.id,
              customerName: o.user?.profile ? `${o.user.profile.firstName} ${o.user.profile.lastName}`.trim() : "Customer",
              email: o.user?.email || "",
              date: new Date(o.createdAt).toISOString().split("T")[0],
              items: formattedItems,
              total: Number(o.totalPayable),
              status,
              paymentMethod: o.paymentStatus === "PAID" ? "Paid" : "Cash on Delivery",
              paymentId: o.payments?.[0]?.gatewayPaymentIntentId || "",
              bankDetails: o.payments?.[0]?.gatewayName || "COD",
              shippingAddress: addr,
            };
          });
          setOrders(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch admin orders:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Fetch order stats
    setIsStatsLoading(true);
    fetchAPI("/api/admin/orders/stats")
      .then((res: any) => {
        if (res && res.data) {
          setOrderStats(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch order stats:", err))
      .finally(() => setIsStatsLoading(false));
  }, []);

  // Selected Order Detail View State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Assign Delivery Modal State
  const [assignModalOrderId, setAssignModalOrderId] = useState<string | null>(null);

  // Status handler helpers
  const handleUpdateStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      const response = await fetchAPI(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (response && response.status === "success") {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert(err.message || "Failed to update order status.");
    }
  };

  const handleSimulateInvoiceDownload = (order: Order) => {
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; }
            .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #f8fafc; font-weight: 600; }
            .total { font-size: 18px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">INVOICE</h1>
            <p>Vipaasa Organics</p>
          </div>
          <div class="details">
            <div>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${order.date}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <div>
              <p><strong>Bill To:</strong></p>
              <p>${order.customerName}<br>${order.shippingAddress}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Weight</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.weight}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.price * item.qty}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Grand Total: ₹${order.total}</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    } else {
      alert("Please allow popups to download the invoice.");
    }
  };

  // Filter calculations
  const filteredOrders = orders.filter((o) => {
    const orderNumStr = String(o.orderNumber || "").toLowerCase();
    const custNameStr = String(o.customerName || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    
    let matchesSearch = true;
    if (query !== "") {
      const isUUID = orderNumStr.length === 36 && orderNumStr.includes("-");
      if (isUUID) {
         matchesSearch = custNameStr.includes(query) || orderNumStr === query;
      } else {
         matchesSearch = orderNumStr.includes(query) || custNameStr.includes(query);
      }
    }
    const matchesStatus = selectedStatusFilter === "All" || o.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Orders</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">View status, handle returns/refunds, and manage invoices.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Total Revenue Card */}
        <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-white pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Order Revenue</p>
              {isStatsLoading ? (
                <div className="h-8 w-32 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  ₹{Number(orderStats?.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1.5 font-semibold">Excluding cancelled & refunded orders</p>
            </div>
            <div className="p-4 bg-emerald-100 rounded-2xl">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-white pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
              {isStatsLoading ? (
                <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {(orderStats?.totalOrders || 0).toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1.5 font-semibold">Showing last 100 loaded orders below</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-2xl">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-gray-50/20"
              placeholder="Search by Order ID, Customer Name..."
            />
          </div>

          {/* Filters dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
                <option value="Refunded">Refunded</option>
              </select>
              <div className="absolute right-3.5 pointer-events-none text-gray-500">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <button 
              onClick={() => { setSearchQuery(""); setSelectedStatusFilter("All"); fetchOrders(); }}
              className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Orders Table Grid */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-[var(--primary-green)]" />
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-semibold">
              No orders found matching the criteria.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Items Count</th>
                  <th className="px-6 py-4 font-bold">Total Amount</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((order) => {
                  // Status styles
                  let statusClass = "bg-gray-100 text-gray-800 border-gray-200";
                  switch (order.status) {
                    case "Pending":
                      statusClass = "bg-amber-50 text-amber-700 border-amber-100";
                      break;
                    case "Processing":
                      statusClass = "bg-blue-50 text-blue-700 border-blue-100";
                      break;
                    case "Shipped":
                      statusClass = "bg-indigo-50 text-indigo-700 border-indigo-100";
                      break;
                    case "Delivered":
                      statusClass = "bg-green-50 text-green-700 border-green-100";
                      break;
                    case "Cancelled":
                      statusClass = "bg-red-50 text-red-700 border-red-100";
                      break;
                    case "Returned":
                      statusClass = "bg-purple-50 text-purple-700 border-purple-100";
                      break;
                    case "Refunded":
                    case "Confirmed":
                      statusClass = "bg-blue-100 text-blue-800 border-blue-200";
                      break;
                    case "Packed":
                      statusClass = "bg-teal-50 text-teal-700 border-teal-100";
                      break;
                    case "Out for Delivery":
                      statusClass = "bg-orange-50 text-orange-700 border-orange-100";
                      break;
                  }

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-gray-900 font-bold">{order.customerName}</div>
                          <div className="text-xs text-gray-400 font-semibold">{order.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 text-xs">
                        {order.items.reduce((acc, item) => acc + item.qty, 0)} units ({order.items.length} unique)
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{order.total}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "Packed" && (
                            <button
                              onClick={() => setAssignModalOrderId(order.id)}
                              className="px-2.5 py-1.5 bg-[var(--primary-green)] hover:bg-[var(--secondary-green)] text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold border border-gray-200 rounded-lg text-gray-700"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleSimulateInvoiceDownload(order)}
                            className="p-2 text-gray-400 hover:text-[var(--primary-green)] hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ORDER DETAILS DIALOG */}
      {selectedOrder && (
        <OrderDetailsModal 
          selectedOrder={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus} 
        />
      )}

      {/* ASSIGN DELIVERY MODAL */}
      <AssignDeliveryModal
        isOpen={!!assignModalOrderId}
        onClose={() => setAssignModalOrderId(null)}
        orderId={assignModalOrderId}
        onAssigned={() => {
          fetchOrders(); // Refresh to show new status
        }}
      />
    </div>
  );
}
