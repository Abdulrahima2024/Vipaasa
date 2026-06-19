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
  CircleDollarSign
} from "lucide-react";

interface OrderItem {
  name: string;
  qty: number;
  weight: string;
  price: number;
}

interface Order {
  id: string; // Database UUID
  orderNumber: string; // Human readable ID e.g., ORD-...
  customerName: string;
  email: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned" | "Refunded";
  paymentMethod: string;
  paymentId?: string; 
  bankDetails?: string; 
  shippingAddress: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

            // Map backend status to title case
            let status: Order["status"] = "Pending";
            if (o.status === "PROCESSING") status = "Processing";
            else if (o.status === "SHIPPED") status = "Shipped";
            else if (o.status === "DELIVERED") status = "Delivered";
            else if (o.status === "CANCELLED") status = "Cancelled";
            else if (o.status === "RETURNED") status = "Returned";
            
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
  }, []);

  // Selected Order Detail View State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleCancelOrder = (id: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      handleUpdateStatus(id, "Cancelled");
    }
  };

  const handleProcessReturn = (id: string) => {
    if (confirm("Accept return request and mark order as Returned?")) {
      handleUpdateStatus(id, "Returned");
    }
  };

  const handleProcessRefund = (id: string) => {
    if (confirm("Authorize refund transaction back to customer? Status will change to Refunded.")) {
      handleUpdateStatus(id, "Refunded");
    }
  };

  const handleSimulateInvoiceDownload = (order: Order) => {
    alert(`Downloading Invoice_${order.orderNumber}.pdf\nReceipt Total: ₹${order.total}\nCustomer: ${order.customerName}`);
  };

  // Filter calculations
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
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
                      statusClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details - {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Placed on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Row 1: Shipping and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Address</span>
                  <p className="text-xs text-gray-700 font-semibold leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment Status</span>
                  <div className="flex sm:justify-end gap-2 items-center">
                    <span className="text-sm font-bold text-gray-800 mr-2">{selectedOrder.status}</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-2 border-b border-gray-100 pb-6">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-gray-400">Payer:</span>
                    <span className="block text-gray-900 mt-0.5">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment ID:</span>
                    <span className="block text-gray-900 mt-0.5">{selectedOrder.paymentId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="block text-gray-900 mt-0.5">₹{selectedOrder.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Bank/Gateway Details:</span>
                    <span className="block text-gray-900 mt-0.5">{selectedOrder.bankDetails || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Items Summary</span>
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-150">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs bg-gray-50/20 font-semibold">
                      <div>
                        <span className="text-gray-900 block font-bold">{item.name}</span>
                        <span className="text-gray-400 block font-medium">Variant: {item.weight} • Qty: {item.qty}</span>
                      </div>
                      <span className="text-gray-950 font-bold">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 text-xs bg-gray-50 font-bold border-t border-gray-200">
                    <span className="text-gray-700 uppercase tracking-wide">Total Amount Paid</span>
                    <span className="text-sm text-gray-950 font-bold">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <span className="block text-xs font-extrabold text-[var(--primary-green)] uppercase tracking-wider border-b border-gray-200 pb-1.5">
                  Fulfillment Actions
                </span>
                
                <div className="flex flex-wrap gap-2.5 pt-1">
                  
                  {/* Cancel Action */}
                  <button
                    disabled={selectedOrder.status === "Cancelled" || selectedOrder.status === "Refunded"}
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex items-center gap-1.5 bg-red-50 border border-red-100 hover:bg-red-200 text-red-700 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel Order
                  </button>

                  {/* Return Action */}
                  <button
                    disabled={selectedOrder.status === "Returned" || selectedOrder.status !== "Delivered"}
                    onClick={() => handleProcessReturn(selectedOrder.id)}
                    className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 hover:bg-purple-200 text-purple-700 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Process Return
                  </button>

                  {/* Refund Action */}
                  <button
                    disabled={selectedOrder.status === "Refunded" || (selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Returned")}
                    onClick={() => handleProcessRefund(selectedOrder.id)}
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <CircleDollarSign className="w-3.5 h-3.5" />
                    Process Refund
                  </button>

                  {/* Print Invoice */}
                  <button
                    onClick={() => handleSimulateInvoiceDownload(selectedOrder)}
                    className="flex items-center gap-1.5 bg-gray-150 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ml-auto"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                </div>
              </div>

              {/* Close Panel Button */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
