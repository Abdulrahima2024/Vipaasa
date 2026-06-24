"use client";

import { useState, useEffect } from "react";
import { X, Truck, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    if (isOpen && orderId) {
      loadAvailablePartners();
      setSuccessOtp(null);
      setSelectedPartner("");
      setNotes("");
      setError(null);
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

      if (res.data?.generatedOtp) {
        setSuccessOtp(res.data.generatedOtp);
      } else {
        onAssigned();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign delivery partner.");
    } finally {
      setIsLoading(false);
    }
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {successOtp ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery Assigned!</h3>
              <p className="text-sm text-gray-600 mb-6">Partner will receive the details. Please share this Delivery OTP with the partner so they can complete the delivery.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Delivery OTP</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-[var(--primary-green)]">{successOtp}</p>
              </div>
              <button 
                onClick={() => {
                  onAssigned();
                  onClose();
                }}
                className="w-full bg-[var(--primary-green)] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[var(--secondary-green)] transition-colors"
              >
                Done
              </button>
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
