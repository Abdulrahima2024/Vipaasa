"use client";

import { useState } from "react";
import { X, Plus, Calendar, Percent, Currency } from "lucide-react";
import { fetchAPI } from "../../lib/api";

interface AddCouponModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddCouponModal({ onClose, onSuccess, initialData }: AddCouponModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    description: initialData?.description || "",
    discountType: initialData?.discountType || "PERCENTAGE",
    discountValue: initialData?.discountValue?.toString() || "",
    minOrderAmount: initialData?.minOrderAmount?.toString() || "0",
    maxDiscount: initialData?.maxDiscount?.toString() || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    usageLimit: initialData?.usageLimit?.toString() || "",
    perUserLimit: initialData?.perUserLimit?.toString() || "1"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: parseInt(formData.perUserLimit) || 1,
      };

      if (!payload.code || !payload.discountValue || !payload.startDate || !payload.endDate) {
        throw new Error("Please fill in all required fields.");
      }

      const isEdit = !!initialData;
      const url = isEdit ? `/api/admin/coupons/${initialData.id}` : "/api/admin/coupons";
      const res = await fetchAPI(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      if (res && res.status === "success") {
        onSuccess();
      } else {
        throw new Error(isEdit ? "Failed to update coupon." : "Failed to create coupon.");
      }
    } catch (err: any) {
      setError(err.message || (initialData ? "Failed to update coupon." : "Failed to create coupon."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{initialData ? "Edit Coupon" : "Create New Coupon"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{initialData ? "Update existing discount code." : "Add a new discount code for your store."}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <form id="create-coupon-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER24"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)] uppercase"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off all summer items"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Discount Value *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.discountType === "PERCENTAGE" ? <Percent className="w-4 h-4 text-gray-400" /> : <span className="text-gray-400 text-sm font-bold">₹</span>}
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder={formData.discountType === "PERCENTAGE" ? "20" : "500"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Min Order Amount</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max Discount (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="No limit"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)] disabled:opacity-50"
                  disabled={formData.discountType === "FIXED"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Total Usage Limit (Optional)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Per User Limit</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="1"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary-green)] focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-coupon-form"
            disabled={isSubmitting}
            className="bg-[var(--primary-green)] hover:bg-[var(--secondary-green)] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Coupon" : "Create Coupon")}
          </button>
        </div>
      </div>
    </div>
  );
}
