import { useState } from "react";
import { MoreHorizontal, Package, X, CreditCard, User, ShoppingBag, Truck } from "lucide-react";

interface RecentOrder {
  id: string;
  customer: string;
  initials: string;
  color: string;
  date: string;
  total: string;
  status: string;
  statusColor: string;
  paymentMethod?: string;
  email?: string;
  phone?: string;
  shippingAddress?: string;
  items?: {
    name: string;
    quantity: number;
    price: string;
  }[];
}

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
  loading?: boolean;
}

export default function RecentOrdersTable({ orders = [], loading }: RecentOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Orders</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <button 
            onClick={() => window.location.href = "/orders"}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-green)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            Manage All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Loading recent orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="h-8 w-8 mb-2 text-gray-300" />
                    No recent orders found.
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.color || "bg-gray-100 text-gray-700"}`}>
                        {order.initials}
                      </div>
                      <span className="font-medium text-gray-900">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold border border-gray-200 rounded-lg text-gray-700 transition-all active:scale-95"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 text-center bg-gray-50/30">
        <button 
          onClick={() => window.location.href = "/orders"}
          className="text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-hover)] transition-colors"
        >
          See full order history
        </button>
      </div>

      {/* DETAILED MODAL DIALOG */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200 text-left">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order details - {selectedOrder.id}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Placed on {selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Row 1: Shipping and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" />
                    <span>Customer Details</span>
                  </div>
                  <div className="text-xs space-y-1 font-semibold">
                    <p className="text-gray-900 font-bold text-sm">{selectedOrder.customer}</p>
                    <p className="text-gray-500">Email: {selectedOrder.email || "N/A"}</p>
                    <p className="text-gray-500">Phone: {selectedOrder.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                    {selectedOrder.shippingAddress || "No shipping address provided."}
                  </p>
                </div>
              </div>

              {/* Row 2: Payment and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Method</span>
                  </div>
                  <div className="text-xs space-y-1 font-semibold">
                    <p className="text-gray-900 font-bold text-sm">
                      {selectedOrder.paymentMethod || "COD"}
                    </p>
                    <p className="text-gray-500">Status: PAID</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Fulfillment Status</span>
                  </div>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${selectedOrder.statusColor}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Items Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5" />
                  <span>Items Summary</span>
                </div>
                <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-150">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 text-xs font-semibold bg-gray-50/10">
                        <div>
                          <span className="text-gray-900 block font-bold">{item.name}</span>
                          <span className="text-gray-400 block font-medium mt-0.5">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-gray-950 font-bold">{item.price}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-450 font-medium">
                      No item details available.
                    </div>
                  )}
                  <div className="flex justify-between items-center p-4 text-xs bg-gray-50 font-bold border-t border-gray-200">
                    <span className="text-gray-750 uppercase tracking-wider">Total Amount Paid</span>
                    <span className="text-sm text-gray-950 font-bold">{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
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

