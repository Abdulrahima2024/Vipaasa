"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, Calendar, Image as ImageIcon } from "lucide-react";
import { fetchAPI } from "../../../lib/api";
import { format } from "date-fns";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAPI("/api/admin/deals");
      setDeals(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await fetchAPI(`/api/admin/deals/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      loadDeals();
    } catch (err: any) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await fetchAPI(`/api/admin/deals/${id}`, { method: "DELETE" });
      loadDeals();
    } catch (err: any) {
      alert("Failed to delete deal");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Deals...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-[var(--primary-green)]" />
            Top Deals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage home page top deals and promotions</p>
        </div>
        <button className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Deal
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
                <th className="px-6 py-4">Deal</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No deals found. Create your first deal!
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {deal.imageUrl ? (
                          <img src={deal.imageUrl} alt={deal.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{deal.title}</div>
                          <div className="text-xs text-gray-500 max-w-[200px] truncate">{deal.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--primary-green)]">{deal.discountPercentage}% OFF</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-gray-600 gap-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Start: {format(new Date(deal.startDate), "MMM dd, yyyy")}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> End: {format(new Date(deal.endDate), "MMM dd, yyyy")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {deal.priority}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(deal.id, deal.status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors ${
                          deal.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {deal.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(deal.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
