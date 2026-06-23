"use client";

import { useState, useEffect } from "react";
import { Plus, Bell, Send, Trash2, Users } from "lucide-react";
import { fetchAPI } from "../../../lib/api";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAPI("/api/admin/notifications");
      setCampaigns(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Are you sure you want to send this notification now?")) return;
    try {
      await fetchAPI(`/api/admin/notifications/${id}/send`, { method: "POST" });
      loadCampaigns();
    } catch (err: any) {
      alert("Failed to send notification: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Notifications...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[var(--primary-green)]" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage push notification campaigns</p>
        </div>
        <button className="bg-[var(--primary-green)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--secondary-green)] transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Campaign
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
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Target Audience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No notification campaigns found.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{camp.title}</div>
                      <div className="text-xs text-gray-500 max-w-[250px] truncate mt-1">{camp.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {camp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        {camp.targetAudience}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${
                        camp.status === "SENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(camp.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {camp.status === "PENDING" && (
                        <button 
                          onClick={() => handleSend(camp.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 font-medium"
                        >
                          <Send className="w-4 h-4" /> Send
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
