"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Search, 
  ChevronDown, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  X,
  Plus,
  Shield,
  UserCheck,
  Edit2,
  Trash2,
  Lock,
  Eye
} from "lucide-react";
import { fetchAPI } from "../../../lib/api";

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
  role: "Admin" | "Store Executive" | "Super Admin";
  status: "Active" | "Inactive";
  permissions: PermissionSet;
}

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit user Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<SystemUser["role"]>("Store Executive");
  const [formStatus, setFormStatus] = useState(true);
  const [formPermProducts, setFormPermProducts] = useState(false);
  const [formPermOrders, setFormPermOrders] = useState(false);
  const [formPermInventory, setFormPermInventory] = useState(true);
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

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = (roleType: SystemUser["role"]) => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole(roleType);
    setFormStatus(true);
    setFormPermProducts(roleType === "Admin");
    setFormPermOrders(true);
    setFormPermInventory(true);
    setFormPermReports(roleType === "Admin");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: SystemUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus ? "Active" : "Inactive"
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

  // Filter list
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );


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

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-[var(--primary-green)] bg-emerald-50">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Active Admins</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">
              {users.filter(u => u.role === "Admin" || u.role === "Super Admin").length} Users
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-teal-600 bg-teal-50">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Store Executives</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">
              {users.filter(u => u.role === "Store Executive").length} Users
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-red-600 bg-red-50">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Role Permissions Lock</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">RBAC Enabled</span>
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
              onClick={() => handleOpenAddModal("Store Executive")}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all bg-gray-50/50"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Executive
            </button>
            <button
              onClick={() => handleOpenAddModal("Admin")}
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
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Active Permission Flags</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredUsers.map((user) => {
                const isSuper = user.role === "Super Admin";
                
                // Role tag styling
                let roleStyle = "bg-gray-50 border-gray-100 text-gray-600";
                if (user.role === "Super Admin") {
                  roleStyle = "bg-purple-50 border-purple-100 text-purple-700";
                } else if (user.role === "Admin") {
                  roleStyle = "bg-emerald-50 border-emerald-100 text-emerald-700";
                } else {
                  roleStyle = "bg-teal-50 border-teal-100 text-teal-700";
                }

                return (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900 font-bold">{user.name}</div>
                        <div className="text-xs text-gray-400 font-semibold">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${roleStyle}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {user.permissions.manageProducts && (
                          <span className="text-[10px] bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold">Products</span>
                        )}
                        {user.permissions.manageOrders && (
                          <span className="text-[10px] bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold">Orders</span>
                        )}
                        {user.permissions.manageInventory && (
                          <span className="text-[10px] bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold">Inventory</span>
                        )}
                        {user.permissions.viewReports && (
                          <span className="text-[10px] bg-gray-50 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-bold">Reports</span>
                        )}
                        {!user.permissions.manageProducts && 
                         !user.permissions.manageOrders && 
                         !user.permissions.manageInventory && 
                         !user.permissions.viewReports && (
                          <span className="text-[10px] text-gray-400 italic font-semibold">No active permissions</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        user.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-95"
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
                {editingUser ? "Edit User Account" : "Create System Account"}
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

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role Definition</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                  >
                    <option value="Store Executive">Store Executive</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end pb-3">
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
                  {editingUser ? "Save User" : "Create Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
