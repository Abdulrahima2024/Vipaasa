import { X, Printer, Ban, RotateCcw, CircleDollarSign, CheckCircle } from "lucide-react";
import { useState } from "react";
import { fetchAPI } from "../lib/api";

interface OrderItem {
  name: string;
  qty: number;
  weight: string;
  price: number;
}

export interface Order {
  id: string; // Database UUID
  orderNumber: string; // Human readable ID e.g., ORD-...
  customerName: string;
  email: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentId?: string; 
  bankDetails?: string; 
  shippingAddress: string;
}

interface OrderDetailsModalProps {
  selectedOrder: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Order["status"]) => void;
}

export function OrderDetailsModal({ selectedOrder, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const handleCancelOrder = (id: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      onUpdateStatus(id, "Cancelled");
    }
  };

  const handleProcessReturn = (id: string) => {
    if (confirm("Accept return request and mark order as Returned?")) {
      onUpdateStatus(id, "Returned");
    }
  };

  const handleProcessRefund = (id: string) => {
    if (confirm("Authorize refund transaction back to customer? Status will change to Refunded.")) {
      onUpdateStatus(id, "Refunded");
    }
  };

  const handleSimulateInvoiceDownload = (order: Order) => {
    alert(`Downloading Invoice_${order.orderNumber}.pdf\nReceipt Total: ₹${order.total}\nCustomer: ${order.customerName}`);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter the delivery OTP");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetchAPI(`/api/admin/orders/${selectedOrder.id}/verify-delivery`, {
        method: "POST",
        body: JSON.stringify({ otp })
      });
      if (res && res.status === "success") {
        alert("Delivery verified successfully!");
        onUpdateStatus(selectedOrder.id, "Delivered");
      }
    } catch (err: any) {
      alert(err.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
      setOtp("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order Details - {selectedOrder.orderNumber}</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Placed on {selectedOrder.date}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
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
                  onChange={(e) => onUpdateStatus(selectedOrder.id, e.target.value as any)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
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
              
              {selectedOrder.status === "Out for Delivery" && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-orange-200 shadow-sm w-full mb-2">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm font-mono tracking-widest border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otp.length < 6}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isVerifying ? "Verifying..." : <><CheckCircle className="w-3.5 h-3.5" /> Verify Delivery</>}
                  </button>
                </div>
              )}
              
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
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 rounded-xl text-xs font-bold text-gray-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
