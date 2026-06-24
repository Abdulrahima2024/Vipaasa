"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ChevronRight, 
  Search, 
  X,
  Plus,
  Shield,
  Edit2,
  Trash2,
  Lock,
  Package,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  Users2,
  IndianRupee
} from "lucide-react";
import { fetchAPI } from "../../../lib/api";
import { OrderDetailsModal, Order } from "../../../components/OrderDetailsModal";

interface PermissionSet {
  manageProducts: boolean;
  manageOrders: boolean;
  manageInventory: boolean;
  viewReports: boolean;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "Admin" | "Super Admin" | string;
  status: "Active" | "Inactive";
  permissions: PermissionSet;
  createdAt?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit user Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Order History State
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<SystemUser | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPagination, setOrdersPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formPermProducts, setFormPermProducts] = useState(false);
  const [formPermOrders, setFormPermOrders] = useState(false);
  const [formPermInventory, setFormPermInventory] = useState(false);
  const [formPermReports, setFormPermReports] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAPI("/api/users");
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users list.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    setIsStatsLoading(true);
    try {
      const data = await fetchAPI("/api/users/dashboard-stats");
      if (data) {
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form field state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formPermProducts, setFormPermProducts] = useState(true);
  const [formPermOrders, setFormPermOrders] = useState(true);
  const [formPermInventory, setFormPermInventory] = useState(true);
  const [formPermReports, setFormPermReports] = useState(true);

  // Order history state
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<SystemUser | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPagination, setOrdersPagination] = useState<any>({ page: 1, pages: 1, total: 0 });

  // Selected order detail for the order details modal
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    loadDashboardStats();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormStatus(true);
    // Default to all permissions for a new Admin
    setFormPermProducts(true);
    setFormPermOrders(true);
    setFormPermInventory(true);
    setFormPermReports(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormStatus(user.status === "Active");
    setFormPermProducts(user.permissions.manageProducts);
    setFormPermOrders(user.permissions.manageOrders);
    setFormPermInventory(user.permissions.manageInventory);
    setFormPermReports(user.permissions.viewReports);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this system user?")) {
      try {
        await fetchAPI(`/api/users/${id}`, { method: "DELETE" });
        setUsers(users.filter(u => u.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete user.");
      }
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    if (user.role === "Super Admin") {
      alert("Cannot toggle status for Super Admin");
      return;
    }
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      await fetchAPI(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          status: newStatus,
          permissions: user.permissions
        })
      });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err: any) {
      alert("Failed to update user status.");
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      status: formStatus ? "Active" : "Inactive",
      permissions: {
        manageProducts: formPermProducts,
        manageOrders: formPermOrders,
        manageInventory: formPermInventory,
        viewReports: formPermReports
      }
    };

    try {
      if (editingUser) {
        // Edit mode
        await fetchAPI(`/api/users/${editingUser.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        // Add mode
        await fetchAPI("/api/users", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message || "Failed to save user.");
    }
  };

  const loadUserOrders = async (userId: string, page: number = 1) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await fetchAPI(`/api/users/${userId}/orders?page=${page}&limit=10`);
      if (response && response.success) {
        setUserOrders(response.data);
        setOrdersPagination(response.pagination);
      } else {
        setOrdersError("Failed to load order history.");
      }
    } catch (err: any) {
      setOrdersError("Failed to load order history. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenOrderHistory = (user: SystemUser) => {
    setSelectedUserForOrders(user);
    loadUserOrders(user.id, 1);
  };

  const handleOpenOrderDetails = async (orderId: string) => {
    // Fetch all admin orders and find the specific one. 
    // This uses the existing order details API behavior.
    try {
      const res = await fetchAPI("/api/admin/orders");
      if (res && res.data) {
        const found = res.data.find((o: any) => o.id === orderId || o.orderNumber === orderId);
        if (found) {
          const formattedItems = (found.items || []).map((item: any) => ({
            name: item.variant?.product?.name || "Product",
            qty: item.quantity,
            weight: item.variant?.weightGrams ? `${item.variant.weightGrams}g` : "250g",
            price: Number(item.unitPrice),
          }));

          const addr = `${found.shippingAddressLine1}${found.shippingAddressLine2 ? ', ' + found.shippingAddressLine2 : ''}, ${found.shippingCity}, ${found.shippingState}, ${found.shippingPostalCode}`;

          let status: Order["status"] = "Pending";
          if (found.status === "PROCESSING") status = "Processing";
          else if (found.status === "SHIPPED") status = "Shipped";
          else if (found.status === "DELIVERED") status = "Delivered";
          else if (found.status === "CANCELLED") status = "Cancelled";
          else if (found.status === "RETURNED") status = "Returned";
          if (found.paymentStatus === "REFUNDED") status = "Refunded";

          const mappedOrder: Order = {
            id: found.id,
            orderNumber: found.orderNumber || found.id,
            customerName: found.user?.profile ? `${found.user.profile.firstName} ${found.user.profile.lastName}`.trim() : "Customer",
            email: found.user?.email || "",
            date: new Date(found.createdAt).toISOString().split("T")[0],
            items: formattedItems,
            total: Number(found.totalPayable),
            status,
            paymentMethod: found.paymentStatus === "PAID" ? "Paid" : "Cash on Delivery",
            paymentId: found.payments?.[0]?.gatewayPaymentIntentId || "",
            bankDetails: found.payments?.[0]?.gatewayName || "COD",
            shippingAddress: addr,
          };
          setSelectedOrderDetail(mappedOrder);
        } else {
          alert("Order details not found.");
        }
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
      alert("Failed to load order details.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      const response = await fetchAPI(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (response && response.status === "success") {
        if (selectedOrderDetail && selectedOrderDetail.id === id) {
          setSelectedOrderDetail({ ...selectedOrderDetail, status: newStatus });
        }
        // Also refresh the history list if needed
        if (selectedUserForOrders) {
          loadUserOrders(selectedUserForOrders.id, ordersPagination.page);
        }
      }
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert(err.message || "Failed to update order status.");
    }
  };

  // Filter list
  // Specifically filter out the legacy "Store Executive" roles from the UI display entirely.
  const filteredUsers = users.filter((u) => {
    if (u.role === "Store Executive") return false;
    
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">User & Role Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">System Users & RBAC</h1>
          <p className="text-sm text-gray-500 mt-1">Assign system permissions, create executive accounts, and manage security control blocks.</p>
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Total Users */}
        <div 
          onClick={() => loadUsers()}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
        >
          <div className="p-3 bg-emerald-50 rounded-lg text-[var(--primary-green)] group-hover:scale-110 transition-transform">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">
              {isStatsLoading ? "..." : dashboardStats.totalUsers}
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div 
          onClick={() => router.push("/orders")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
        >
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">
              {isStatsLoading ? "..." : dashboardStats.totalOrders}
            </span>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div 
          onClick={() => router.push("/reports")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group"
        >
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">
              {isStatsLoading ? "..." : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dashboardStats.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
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
              placeholder="Search users, roles, email..."
            />
          </div>

          {/* Quick Create Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-[var(--primary-green)] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Admin
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">User Name</th>
                <th className="hidden md:table-cell px-6 py-4 font-bold">Email</th>
                <th className="hidden md:table-cell px-6 py-4 font-bold">Phone</th>
                <th className="hidden md:table-cell px-6 py-4 font-bold">Role</th>
                <th className="hidden lg:table-cell px-6 py-4 font-bold">Registration Date</th>
                <th className="px-6 py-4 font-bold text-center">Total Orders</th>
                <th className="hidden md:table-cell px-6 py-4 font-bold text-right">Total Spent</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredUsers.map((user) => {
                const isSuper = user.role === "Super Admin";
                
                // Role tag styling
                let roleStyle = "bg-emerald-50 border-emerald-100 text-emerald-700";
                if (isSuper) {
                  roleStyle = "bg-purple-50 border-purple-100 text-purple-700";
                } else if (user.role === "Customer") {
                  roleStyle = "bg-blue-50 border-blue-100 text-blue-700";
                }

                // Default fallbacks
                const phoneDisplay = user.phone || "-";
                const dateDisplay = user.createdAt ? format(new Date(user.createdAt), "dd-MMM-yyyy") : "-";
                const totalOrdersDisplay = user.totalOrders || 0;
                
                // Currency formatter for INR
                const formattedSpent = new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0
                }).format(user.totalSpent || 0);

                return (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900 font-bold">{user.name}</div>
                        <div className="text-xs text-gray-400 font-semibold md:hidden">{user.email}</div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-gray-600">
                      {user.email}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-gray-600">
                      {phoneDisplay}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${roleStyle}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 text-gray-600 whitespace-nowrap">
                      {dateDisplay}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      {totalOrdersDisplay}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-right font-bold text-[var(--primary-green)]">
                      {formattedSpent}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isSuper}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenOrderHistory(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                          title="View Order History"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          disabled={isSuper}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          disabled={isSuper}
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER FORM MODAL (ADD & EDIT WITH PERMISSIONS LOCK) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? "Edit Admin Account" : "Create Admin Account"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-6">
              
              {/* Name & Email inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ramesh Babu"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="ramesh.b@vipaasa.com"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
              </div>

              {/* Status Row */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formStatus}
                    onChange={(e) => setFormStatus(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">User Active</span>
                </label>
              </div>

              {/* RBAC Custom Permissions Assignment */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <span className="block text-xs font-extrabold text-[var(--primary-green)] uppercase tracking-wider border-b border-gray-200 pb-1.5">
                  Assign RBAC Permissions
                </span>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermProducts}
                      onChange={(e) => setFormPermProducts(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)]"
                    />
                    <span>Manage Products</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermOrders}
                      onChange={(e) => setFormPermOrders(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)]"
                    />
                    <span>Manage Orders</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermInventory}
                      onChange={(e) => setFormPermInventory(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)]"
                    />
                    <span>Manage Inventory</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermReports}
                      onChange={(e) => setFormPermReports(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)]"
                    />
                    <span>View Reports</span>
                  </label>
                </div>
              </div>

              {/* Actions panel */}
              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--primary-green)] text-white hover:bg-[var(--primary-hover)] rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {editingUser ? "Save Admin" : "Create Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* ORDER HISTORY MODAL */}
      {selectedUserForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Order History</h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 font-semibold">Customer:</span>
                    <span className="text-gray-900 font-bold">{selectedUserForOrders.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 font-semibold">Email:</span>
                    <span className="text-gray-900 font-bold">{selectedUserForOrders.email}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 font-semibold">Total Orders:</span>
                    <span className="text-[var(--primary-green)] font-extrabold">{ordersPagination.total}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-gray-400 font-semibold">Lifetime Spend:</span>
                    <span className="text-gray-900 font-bold">
                      ₹{((ordersPagination as any).lifetimeSpend || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUserForOrders(null)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-gray-50/30">
              {ordersLoading ? (
                <div className="p-12 text-center text-gray-500 font-semibold flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-[var(--primary-green)]" />
                  <span>Loading Order History...</span>
                </div>
              ) : ordersError ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <p className="text-red-500 font-bold">{ordersError}</p>
                  <button 
                    onClick={() => loadUserOrders(selectedUserForOrders.id, ordersPagination.page)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">No Orders Found</h4>
                  <p className="text-sm text-gray-500 mt-1">This user hasn't placed any orders yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-600 bg-white">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Order ID</th>
                      <th className="px-6 py-4 font-bold">Date</th>
                      <th className="px-6 py-4 font-bold">Products</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold text-center">Payment Status</th>
                      <th className="px-6 py-4 font-bold text-center">Order Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {userOrders.map((order) => {
                      // Payment Badge Styles
                      let paymentClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
                      if (order.paymentStatus === "PAID") paymentClass = "bg-green-50 text-green-700 border-green-100";
                      else if (order.paymentStatus === "FAILED") paymentClass = "bg-red-50 text-red-700 border-red-100";
                      else if (order.paymentStatus === "REFUNDED") paymentClass = "bg-blue-50 text-blue-700 border-blue-100";

                      // Order Badge Styles
                      let orderClass = "bg-gray-100 text-gray-800 border-gray-200";
                      switch (order.orderStatus) {
                        case "PENDING":
                          orderClass = "bg-amber-50 text-amber-700 border-amber-100";
                          break;
                        case "PROCESSING":
                          orderClass = "bg-blue-50 text-blue-700 border-blue-100";
                          break;
                        case "SHIPPED":
                          orderClass = "bg-indigo-50 text-indigo-700 border-indigo-100";
                          break;
                        case "DELIVERED":
                          orderClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                          break;
                        case "CANCELLED":
                          orderClass = "bg-red-50 text-red-700 border-red-100";
                          break;
                        case "RETURNED":
                          orderClass = "bg-purple-50 text-purple-700 border-purple-100";
                          break;
                      }

                      // Format Order Status
                      const displayOrderStatus = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1).toLowerCase();
                      const displayPaymentStatus = order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).toLowerCase();

                      return (
                        <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleOpenOrderDetails(order.orderId)}
                              className="font-mono font-bold text-[var(--primary-green)] hover:underline hover:text-[var(--primary-hover)] text-left"
                            >
                              {order.orderId}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                            {new Date(order.createdAt).toISOString().split("T")[0]}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-700 truncate max-w-[200px]" title={order.products}>
                            {order.products}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${paymentClass}`}>
                              {displayPaymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${orderClass}`}>
                              {displayOrderStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {userOrders.length > 0 && ordersPagination.pages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl shrink-0">
                <span className="text-xs font-semibold text-gray-500">
                  Page {ordersPagination.page} of {ordersPagination.pages} ({ordersPagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={ordersPagination.page <= 1 || ordersLoading}
                    onClick={() => loadUserOrders(selectedUserForOrders!.id, ordersPagination.page - 1)}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={ordersPagination.page >= ordersPagination.pages || ordersLoading}
                    onClick={() => loadUserOrders(selectedUserForOrders!.id, ordersPagination.page + 1)}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARED ORDER DETAILS DIALOG */}
      {selectedOrderDetail && (
        <OrderDetailsModal 
          selectedOrder={selectedOrderDetail} 
          onClose={() => setSelectedOrderDetail(null)} 
          onUpdateStatus={handleUpdateStatus} 
        />
      )}
    </div>
  );
}
