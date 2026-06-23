"use client";

import { useState, useEffect } from "react";
import { X, Truck, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { fetchAPI } from "../../lib/api";

type EditPartnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  partnerId: string | null;
  mode: "edit" | "view";
};

export default function EditPartnerModal({ isOpen, onClose, onUpdated, partnerId, mode }: EditPartnerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleNumber: "",
    vehicleType: "",
    licenseNumber: "",
    status: ""
  });
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && partnerId) {
      loadPartnerData();
    }
  }, [isOpen, partnerId]);

  const loadPartnerData = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetchAPI(`/api/admin/delivery-partners/${partnerId}`);
      if (res && res.data) {
        setFormData({
          name: res.data.name || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          vehicleNumber: res.data.vehicleNumber || "",
          vehicleType: res.data.vehicleType || "",
          licenseNumber: res.data.licenseNumber || "",
          status: res.data.status || ""
        });
        setAssignments(res.data.assignments || []);
      }
    } catch (err: any) {
      setError("Failed to fetch partner details.");
    } finally {
      setIsFetching(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }
    setError(null);

    if (!formData.name || !formData.phone || !formData.vehicleNumber) {
      setError("Please fill in required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetchAPI(`/api/admin/delivery-partners/${partnerId}`, {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      if (res && res.status === "success") {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onUpdated();
          onClose();
        }, 1500);
      } else {
        throw new Error(res?.error || "Failed to update partner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update delivery partner.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied OTP: ${text}`);
  };

  const activeAssignments = assignments.filter(a => a.status === "ASSIGNED" || a.status === "ACCEPTED");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--primary-green)]" />
            {mode === "view" ? "Partner Details" : "Edit Partner Details"}
          </h2>
          <button onClick={onClose} disabled={isLoading || isSuccess} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isFetching ? (
            <div className="py-12 text-center text-gray-500">Loading details...</div>
          ) : isSuccess ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Updated!</h3>
              <p className="text-sm text-gray-600">The delivery partner details have been saved.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal & Vehicle Info</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                    disabled={isLoading || mode === "view"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white uppercase disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    >
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Van">Van</option>
                      <option value="Mini Truck">Mini Truck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driving License</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white uppercase disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={isLoading || mode === "view"}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Assignments Section */}
              {mode === "view" && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Active Deliveries ({activeAssignments.length})</h3>
                  
                  {activeAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {activeAssignments.map((assignment: any) => {
                        const otp = assignment.order?.DeliveryOTP?.otp;
                        const orderNum = assignment.order?.orderNumber;

                        return (
                          <div key={assignment.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="font-bold text-gray-900">{orderNum || "Unknown Order"}</div>
                              <div className="text-xs font-semibold text-blue-600 mt-0.5">Status: {assignment.status}</div>
                            </div>
                            
                            {otp ? (
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-[10px] font-bold text-gray-500 uppercase">Delivery OTP</div>
                                  <div className="text-lg font-bold text-gray-900 tracking-widest bg-white px-3 py-1 rounded-md border border-gray-200 mt-1">
                                    {otp}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(otp)}
                                  className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-[var(--primary-green)] hover:border-[var(--primary-green)] hover:bg-green-50 transition-all shadow-sm group"
                                  title="Copy OTP"
                                >
                                  <Copy className="w-5 h-5 group-active:scale-95 transition-transform" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-400 italic">No OTP found</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm font-medium text-gray-500">
                      No active deliveries assigned to this partner.
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {mode === "view" ? "Close" : "Cancel"}
                </button>
                {mode === "edit" && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Save Changes
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
