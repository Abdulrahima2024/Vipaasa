"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Search, 
  ChevronDown, 
  RefreshCw, 
  X,
  User,
  Ban,
  Mail,
  MapPin
} from "lucide-react";
import { fetchAPI } from "../../../lib/api";

interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  totalSpent: number;
  ordersCount: number;
  shippingAddress: string;
  orderHistory?: CustomerOrder[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected customer modal details
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAPI(`/api/admin/customers?page=${page}&limit=50`);
      setCustomers(res.data);
      if (res.meta?.totalPages) {
        setTotalPages(res.meta.totalPages);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load customers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleViewProfile = async (customer: Customer) => {
    setSelectedCust(customer); // Show basic info immediately
    try {
      setIsDetailLoading(true);
      const res = await fetchAPI(`/api/admin/customers/${customer.id}`);
      setSelectedCust(res.data); // Update with full details + orderHistory
    } catch (err: any) {
      console.error("Failed to load customer details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Toggle active/inactive status (optimistic local state)
  const toggleCustStatus = (id: string) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c));
    if (selectedCust && selectedCust.id === id) {
      setSelectedCust({ ...selectedCust, status: selectedCust.status === "Active" ? "Inactive" : "Active" });
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const nameMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = c.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Customers</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Customer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review active clients, purchase logs, and status locks.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-gray-50/20"
              placeholder="Search by Name, Email..."
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="absolute right-3.5 pointer-events-none text-gray-500">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <button 
              onClick={() => { setSearchQuery(""); setStatusFilter("All"); loadCustomers(); }}
              className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              title="Reset Filters & Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customer Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Customer ID</th>
                <th className="px-6 py-4 font-bold">Profile</th>
                <th className="px-6 py-4 font-bold">Joined Date</th>
                <th className="px-6 py-4 font-bold text-center">Orders</th>
                <th className="px-6 py-4 font-bold">Total Value Spent</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ban className="h-6 w-6 text-red-400" />
                      <span>{error}</span>
                      <button onClick={loadCustomers} className="mt-2 text-[var(--primary-green)] underline text-xs font-bold">Try Again</button>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isActive = cust.status === "Active";
                  return (
                    <tr key={cust.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs" title={cust.id}>
                        {cust.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--primary-green)]/10 text-[var(--primary-green)] flex items-center justify-center font-bold uppercase">
                            {cust.name ? cust.name[0] : "C"}
                          </div>
                          <div>
                            <div className="text-gray-900 font-bold">{cust.name}</div>
                            <div className="text-xs text-gray-400 font-semibold">{cust.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">{cust.joinedDate}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{cust.ordersCount} orders</td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{cust.totalSpent}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleCustStatus(cust.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isActive 
                              ? "bg-green-50 text-green-700 border-green-100" 
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {cust.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewProfile(cust)}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold border border-gray-200 rounded-lg text-gray-700"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS MODAL (WITH ORDER HISTORY) */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-green)]/15 text-[var(--primary-green)] flex items-center justify-center text-lg font-bold uppercase">
                  {selectedCust.name ? selectedCust.name[0] : "C"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedCust.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold" title={selectedCust.id}>
                    {selectedCust.id.substring(0, 8)}... • Joined {selectedCust.joinedDate}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedCust(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs font-semibold">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedCust.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedCust.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{selectedCust.shippingAddress || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:border-l sm:border-gray-200 sm:pl-6">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Account Status</span>
                    <button 
                      onClick={() => toggleCustStatus(selectedCust.id)}
                      className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide border ${
                        selectedCust.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-150"
                          : "bg-red-50 text-red-700 border-red-150"
                      }`}
                    >
                      {selectedCust.status}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Total Orders Placed</span>
                    <span className="text-gray-900 font-bold">{selectedCust.ordersCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Total Spent</span>
                    <span className="text-gray-900 font-bold">₹{selectedCust.totalSpent}</span>
                  </div>
                </div>
              </div>

              {/* Order History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchase History Log</h4>
                
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 min-h-[100px] relative">
                  {isDetailLoading && !selectedCust.orderHistory && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                      <div className="flex items-center gap-2 text-gray-500 font-medium text-xs">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Fetching latest details...
                      </div>
                    </div>
                  )}
                  
                  {selectedCust.orderHistory && selectedCust.orderHistory.length > 0 ? (
                    selectedCust.orderHistory.map((order) => (
                      <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-xs font-semibold">
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-gray-900" title={order.id}>
                            {order.id.substring(0, 10)}...
                          </span>
                          <span className="text-gray-400 font-medium">{order.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-950">₹{order.total}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.status === "Delivered" 
                              ? "bg-green-50 text-green-700" 
                              : order.status === "Pending" || order.status === "Shipped"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : isDetailLoading ? null : (
                    <div className="p-6 text-center text-gray-400 text-xs">No orders found for this customer.</div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedCust(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                >
                  Close Profile
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
