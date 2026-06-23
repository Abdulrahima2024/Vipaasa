"use client";

import { useState } from "react";
import { X, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { fetchAPI } from "../../lib/api";

type AddPartnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddPartnerModal({ isOpen, onClose, onAdded }: AddPartnerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleNumber: "",
    vehicleType: "",
    licenseNumber: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validatePhone = (phone: string) => {
    // Basic validation: at least 10 digits
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required fields check
    if (!formData.name || !formData.phone || !formData.vehicleNumber || !formData.vehicleType || !formData.licenseNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetchAPI("/api/admin/delivery-partners", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      
      if (res && res.status === "success") {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onAdded();
          onClose();
          // Reset form
          setFormData({
            name: "",
            phone: "",
            email: "",
            vehicleNumber: "",
            vehicleType: "",
            licenseNumber: ""
          });
        }, 1500);
      } else {
        throw new Error(res?.error || "Failed to create partner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add delivery partner.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--primary-green)]" />
            Add Delivery Partner
          </h2>
          <button onClick={onClose} disabled={isLoading || isSuccess} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Added!</h3>
              <p className="text-sm text-gray-600">The delivery partner has been successfully created.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white"
                    placeholder="e.g., John Doe"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white"
                      placeholder="+91 9876543210"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white"
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white uppercase"
                      placeholder="KA 01 AB 1234"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white"
                      disabled={isLoading}
                    >
                      <option value="">Select Type</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Van">Van</option>
                      <option value="Mini Truck">Mini Truck</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 focus:border-[var(--primary-green)] transition-all bg-white uppercase"
                    placeholder="DL-1420110012345"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Partner
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
