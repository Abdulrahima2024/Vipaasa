"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Plus, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit2, 
  Power,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  PackageCheck
} from "lucide-react";
import { fetchAPI } from "../../../lib/api";
import AddPartnerModal from "../../../components/delivery-partners/AddPartnerModal";
import EditPartnerModal from "../../../components/delivery-partners/EditPartnerModal";

type DeliveryPartner = {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
  completedDeliveries: number;
  assignedOrders: number;
};

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPartnerId, setEditPartnerId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "view">("view");

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAPI("/api/admin/delivery-partners");
      setPartners(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load delivery partners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this partner?")) return;
    try {
      await fetchAPI(`/api/admin/delivery-partners/${id}`, { method: "DELETE" });
      loadPartners();
    } catch (err) {
      alert("Failed to deactivate partner.");
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Available</span>;
      case "BUSY": return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3"/> Busy</span>;
      case "OFFLINE": return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3"/> Offline</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-[var(--primary-green)]" />
            Delivery Partners
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery fleet and view performance.</p>
        </div>
        <button 
          className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <span className="text-xl leading-none">🚚</span>
          Add Delivery Partner
        </button>
      </div>

      {/* Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Partners</p>
            <h3 className="text-2xl font-bold text-gray-900">{partners.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available</p>
            <h3 className="text-2xl font-bold text-gray-900">{partners.filter(p => p.status === "AVAILABLE").length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Busy</p>
            <h3 className="text-2xl font-bold text-gray-900">{partners.filter(p => p.status === "BUSY").length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Deliveries</p>
            <h3 className="text-2xl font-bold text-gray-900">{partners.reduce((acc, p) => acc + p.completedDeliveries, 0)}</h3>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search partners by name, phone, or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Partner Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Assigned / Completed</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-green)] mx-auto mb-2"></div>
                    Loading partners...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-bold text-gray-900 mb-1">No delivery partners found</p>
                    <p className="text-sm mb-6">Create your first delivery partner to start assigning deliveries.</p>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-800 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 mx-auto flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Delivery Partner
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{partner.name}</td>
                    <td className="px-6 py-4 text-gray-600">{partner.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{partner.vehicleNumber}</span>
                        <span className="text-xs text-gray-500">{partner.vehicleType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(partner.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-semibold text-xs mr-2 border border-blue-100" title="Assigned Orders">
                        {partner.assignedOrders} Active
                      </span>
                      <span className="inline-flex items-center justify-center bg-gray-50 text-gray-700 px-2 py-1 rounded-md font-semibold text-xs border border-gray-200" title="Completed Deliveries">
                        {partner.completedDeliveries} Done
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          title="View Details"
                          onClick={() => { setModalMode("view"); setEditPartnerId(partner.id); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          title="Edit Partner"
                          onClick={() => { setModalMode("edit"); setEditPartnerId(partner.id); }}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          title="Deactivate Partner"
                          onClick={() => handleDeactivate(partner.id)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          title="Delete Partner"
                          onClick={() => alert("Hard delete not implemented. Use Deactivate instead.")}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Partner Modal */}
      <AddPartnerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdded={() => loadPartners()} 
      />

      {/* Edit Partner Modal */}
      <EditPartnerModal
        isOpen={!!editPartnerId}
        onClose={() => setEditPartnerId(null)}
        onUpdated={() => loadPartners()}
        partnerId={editPartnerId}
        mode={modalMode}
      />
    </div>
  );
}
