"use client";

import { useState, useEffect } from "react";
import { X, Truck, AlertCircle, CheckCircle2, Copy, Check, Send } from "lucide-react";
import { fetchAPI } from "../../lib/api";

type Partner = {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
};

type AssignDeliveryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onAssigned: () => void;
};

export default function AssignDeliveryModal({ isOpen, onClose, orderId, onAssigned }: AssignDeliveryModalProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOtp, setSuccessOtp] = useState<string | null>(null);
  const [assignedPartner, setAssignedPartner] = useState<Partner | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadAvailablePartners();
      setSuccessOtp(null);
      setSelectedPartner("");
      setNotes("");
      setError(null);
      setAssignedPartner(null);
      setCopied(false);
    }
  }, [isOpen, orderId]);

  const loadAvailablePartners = async () => {
    setIsFetching(true);
    try {
      const res = await fetchAPI("/api/admin/delivery-partners/available");
      setPartners(res.data || []);
      if (res.data?.length > 0) {
        setSelectedPartner(res.data[0].id);
      }
    } catch (err) {
      setError("Failed to load available delivery partners.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPartner) {
      setError("Please select a delivery partner.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchAPI(`/api/admin/orders/${orderId}/assign-delivery`, {
        method: "POST",
        body: JSON.stringify({ partnerId: selectedPartner, notes })
      });

      // Immediately trigger the parent list refresh in the background
      onAssigned();

      // Store full partner object for WhatsApp send
      const partner = partners.find(p => p.id === selectedPartner) || null;
      setAssignedPartner(partner);

      if (res.data?.generatedOtp) {
        setSuccessOtp(res.data.generatedOtp);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign delivery partner.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOtp = async () => {
    if (!successOtp) return;
    try {
      await navigator.clipboard.writeText(successOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = successOtp;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendWhatsApp = () => {
    if (!successOtp || !assignedPartner) return;

    const message =
      `🚚 *Vipaasa Organics — Delivery Assignment*\n\n` +
      `Hello ${assignedPartner.name},\n\n` +
      `You have been assigned a new delivery.\n\n` +
      `📦 *Order ID:* ${orderId}\n` +
      `🔐 *Delivery OTP:* ${successOtp}\n\n` +
      `Please use this OTP to confirm delivery with the customer.\n\n` +
      `— Vipaasa Admin`;

    // Clean phone: remove spaces, dashes, add country code if missing
    let phone = assignedPartner.phone.replace(/[\s\-]/g, "");
    if (!phone.startsWith("+") && !phone.startsWith("91")) {
      phone = "91" + phone; // India country code
    }
    phone = phone.replace(/^\+/, "");

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDone = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--primary-green)]" />
            Assign Delivery Partner
          </h2>
          <button onClick={handleDone} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {successOtp ? (
            <div className="text-center py-4">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delivery Assigned!</h3>
              {assignedPartner && (
                <p className="text-sm font-semibold text-[var(--primary-green)] mb-1">
                  Assigned to: {assignedPartner.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-5">
                Share the OTP with the delivery partner to confirm delivery.
              </p>

              {/* OTP Box with Copy Button */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Delivery OTP</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-4xl font-mono font-extrabold tracking-[0.3em] text-[var(--primary-green)]">
                    {successOtp}
                  </p>
                  <button
                    onClick={handleCopyOtp}
                    title="Copy OTP"
                    className={`p-2 rounded-lg transition-all ${
                      copied
                        ? "bg-green-100 text-green-600"
                        : "bg-white border border-gray-200 text-gray-400 hover:text-[var(--primary-green)] hover:border-[var(--primary-green)]"
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-semibold mt-2 animate-pulse">
                    ✓ Copied to clipboard!
                  </p>
                )}
              </div>

              {/* Partner details reminder */}
              {assignedPartner && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-left">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">Partner Details</p>
                  <div className="space-y-0.5 text-sm text-gray-700 font-medium">
                    <p>👤 {assignedPartner.name}</p>
                    <p>📱 {assignedPartner.phone}</p>
                    <p>🚗 {assignedPartner.vehicleNumber} ({assignedPartner.vehicleType})</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* Send via WhatsApp */}
                {assignedPartner?.phone && (
                  <button
                    onClick={handleSendWhatsApp}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Send OTP &amp; Details via WhatsApp
                  </button>
                )}

                {/* Done / Close */}
                <button
                  onClick={handleDone}
                  className="w-full bg-[var(--primary-green)] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[var(--secondary-green)] transition-colors"
                >
                  Done — Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Partner
                </label>
                {isFetching ? (
                  <div className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 animate-pulse">
                    Loading partners...
                  </div>
                ) : partners.length === 0 ? (
                  <div className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm">
                    No available partners. Please check Delivery Partners tab.
                  </div>
                ) : (
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.vehicleNumber} - {p.vehicleType})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Fragile items, deliver before 5 PM..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isLoading || partners.length === 0 || !selectedPartner}
                  className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Assign Delivery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
