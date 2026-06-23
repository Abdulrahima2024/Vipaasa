"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Ticket, Percent, Users, Coins } from "lucide-react";
import { fetchAPI } from "../../../lib/api";
import { format } from "date-fns";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAPI("/api/admin/coupons");
      setCoupons(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await fetchAPI(`/api/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      loadCoupons();
    } catch (err: any) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetchAPI(`/api/admin/coupons/${id}`, { method: "DELETE" });
      loadCoupons();
    } catch (err: any) {
      alert("Failed to delete coupon");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Coupons...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[var(--primary-green)]" />
            Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons and track usage</p>
        </div>
        <button className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Conditions</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No coupons found. Create your first coupon!
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-lg text-gray-900 tracking-wider bg-gray-100 px-2 py-1 rounded inline-block w-max">
                          {coupon.code}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{coupon.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--primary-green)] flex items-center gap-1">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <>{coupon.discountValue}% OFF</>
                        ) : (
                          <>₹{coupon.discountValue} OFF</>
                        )}
                      </span>
                      {coupon.maxDiscount && (
                        <span className="text-[10px] text-gray-500 block mt-1">Max: ₹{coupon.maxDiscount}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1"><Coins className="w-3 h-3 text-gray-400" /> Min Order: ₹{coupon.minOrderAmount}</div>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" /> Per User Limit: {coupon.perUserLimit}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div>{format(new Date(coupon.startDate), "MMM dd")} - {format(new Date(coupon.endDate), "MMM dd, yyyy")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon._count?.usages || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "used"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon.id, coupon.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          coupon.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {coupon.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
