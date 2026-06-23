"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Edit2, Plus, X, Phone, Check, ArrowLeft, Loader2 } from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuthStore } from "../../../store/authStore";
import { useCartStore } from "../../../store/useCartStore";
import { fetchApi } from "../../../lib/api";

interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

const DEFAULT_MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    type: "Home",
    name: "Ananya Sharma",
    addressLine1: "42, Lotus Boulevard, Sector 150",
    addressLine2: "",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "201310",
    country: "India",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Work",
    name: "Ananya Sharma",
    addressLine1: "The Hub, Floor 12, Cyber City, Phase III",
    addressLine2: "",
    city: "Gurugram",
    state: "Haryana",
    postalCode: "122002",
    country: "India",
    phone: "+91 98765 99887",
    isDefault: false,
  },
];

export default function ManageAddressesPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items, favorites } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Form fields
  const [type, setType] = useState<"Home" | "Work" | "Other">("Home");
  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Initialize
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch addresses from backend database
  useEffect(() => {
    if (mounted && isAuthenticated) {
      setIsLoadingAddresses(true);
      fetchApi<{ status: string; data: Address[] }>("/api/users/addresses")
        .then((res) => {
          if (res && res.data) {
            setAddresses(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch addresses from backend", err);
        })
        .finally(() => {
          setIsLoadingAddresses(false);
        });
    } else if (mounted && !isAuthenticated) {
      setIsLoadingAddresses(false);
    }
  }, [mounted, isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/account/addresses");
    }
  }, [mounted, isAuthenticated, router]);

  const resetForm = () => {
    setType("Home");
    setName("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("India");
    setPhone("");
    setIsDefault(false);
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEditClick = (addr: Address) => {
    setEditingAddress(addr);
    setType(addr.type);
    setName(addr.name);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsDefault(!!addr.isDefault);
    setShowForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await fetchApi(`/api/users/addresses/${id}`, {
          method: "DELETE",
        });
        const updated = addresses.filter((a) => a.id !== id);
        // If we deleted the default address and there are other addresses, make the first one default
        if (addresses.find((a) => a.id === id)?.isDefault && updated.length > 0) {
          updated[0].isDefault = true;
          await fetchApi(`/api/users/addresses/${updated[0].id}`, {
            method: "PUT",
            body: JSON.stringify({ isDefault: true }),
          });
        }
        setAddresses(updated);
      } catch (err) {
        console.error("Failed to delete address", err);
        alert("Failed to delete address.");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetchApi<{ status: string; data: Address }>(`/api/users/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isDefault: true }),
      });
      if (res && res.data) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to set default address", err);
      alert("Failed to set default address.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !addressLine1 || !city || !state || !postalCode || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingAddress) {
        const res = await fetchApi<{ status: string; data: Address }>(`/api/users/addresses/${editingAddress.id}`, {
          method: "PUT",
          body: JSON.stringify({
            addressType: type === "Home" ? "HOME" : type === "Work" ? "WORK" : "SHIPPING",
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            phone,
            isDefault,
          }),
        });

        if (res && res.data) {
          setAddresses((prev) => {
            let updated = prev.map((a) => (a.id === editingAddress.id ? res.data : a));
            if (isDefault) {
              updated = updated.map((a) => ({
                ...a,
                isDefault: a.id === editingAddress.id,
              }));
            }
            return updated;
          });
        }
      } else {
        const res = await fetchApi<{ status: string; data: Address }>("/api/users/addresses", {
          method: "POST",
          body: JSON.stringify({
            addressType: type === "Home" ? "HOME" : type === "Work" ? "WORK" : "SHIPPING",
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            postalCode,
            country,
            phone,
            isDefault,
          }),
        });

        if (res && res.data) {
          setAddresses((prev) => {
            let updated = [...prev];
            if (res.data.isDefault) {
              updated = updated.map((a) => ({ ...a, isDefault: false }));
            }
            updated.push(res.data);
            return updated;
          });
        }
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save address", err);
      alert("Failed to save address.");
    }
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#0F5132] animate-spin" />
          <span className="text-sm font-semibold text-[#5C6E61]">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const activeCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Google Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* Header */}
      <Header
        showSearch={false}
        cartCount={activeCartCount}
        favoritesCount={favorites.length}
        activeNav=""
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-16 py-10">
        {/* Back Link to Profile */}
        <div className="mb-6">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#5C6E61] hover:text-[#0F5132] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>

        {/* Heading Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#113C27] tracking-tight">
              Manage Addresses
            </h1>
            <p className="text-sm sm:text-base text-[#5C6E61] mt-1 font-medium">
              Update your shipping details for faster artisanal checkout.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#0F5132] hover:bg-[#113C27] text-white py-3 px-5 sm:px-6 rounded-xl font-bold transition-all shadow-md shadow-green-950/10 hover:shadow-lg hover:shadow-green-950/15 active:scale-[0.98] text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingAddresses ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 bg-white/60 border border-[#EAE6DB]/60 rounded-3xl shadow-sm">
              <Loader2 className="w-10 h-10 text-[#0F5132] animate-spin" />
              <span className="text-sm font-semibold text-[#5C6E61]">Fetching saved addresses...</span>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-2xl border border-[#EAE6DB]/60 p-6 flex flex-col justify-between relative shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:border-[#738276]/30 transition-all duration-300 group min-h-[260px]"
              >
              <div>
                {/* Header Row: Badge */}
                <div className="flex items-center justify-between mb-4">
                  {addr.isDefault ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#0F5132]">
                      Default
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EAE6DB]/60 text-[#4B594F]">
                      {addr.type}
                    </span>
                  )}
                  
                  {/* Small Action Set for Default setting */}
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold text-[#738276] hover:text-[#0F5132] transition-colors border border-[#EAE6DB]/80 px-2 py-0.5 rounded hover:bg-[#FAF8F5]"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-serif text-lg font-bold text-[#113C27] mb-2">
                  {addr.name}
                </h3>

                {/* Address Lines */}
                <div className="text-sm font-semibold text-[#5C6E61] space-y-0.5 leading-relaxed">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                </div>
              </div>

              {/* Phone and Actions Row */}
              <div className="mt-6 pt-4 border-t border-[#EAE6DB]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F3E2F]">
                  <Phone className="w-3.5 h-3.5 text-[#738276]" />
                  <span>{addr.phone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditClick(addr)}
                    className="text-xs font-bold text-[#0F5132] hover:text-[#113C27] transition-colors flex items-center gap-1"
                    title="Edit Address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(addr.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                    title="Delete Address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

          {/* Add New Delivery Point Card */}
          <div
            onClick={() => {
              setEditingAddress(null);
              setShowForm(true);
            }}
            className="cursor-pointer border-2 border-dashed border-[#EAE6DB] hover:border-[#738276] bg-white/40 hover:bg-white/70 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 min-h-[260px] group transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF5EC] text-[#2D6A4F] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(45,106,79,0.08)]">
              <MapPin className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="space-y-1">
              <span className="block text-sm font-bold text-[#113C27]">Add New Delivery Point</span>
              <span className="block text-[11px] text-[#738276] font-medium max-w-[180px]">
                Create a new location card for quick delivery checkout.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal Overlay for Add/Edit Address Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F9F7F2] border border-[#EAE6DB] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-[#738276] hover:text-[#113C27] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#113C27] mb-6">
              {editingAddress ? "Edit Delivery Address" : "Add New Address"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold text-[#1F3E2F]">
              {/* Type selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-2 font-bold">
                  Address Type
                </label>
                <div className="flex gap-3">
                  {(["Home", "Work", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold transition-all ${
                        type === t
                          ? "border-[#0F5132] bg-[#EAF5EC]/20 text-[#0F5132]"
                          : "border-[#EAE6DB] bg-white text-[#738276] hover:border-[#738276]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                  placeholder="e.g. Elena Thorne"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                  placeholder="Street address, P.O. box, company name"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                    placeholder="e.g. Portland"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                    placeholder="e.g. OR"
                  />
                </div>
              </div>

              {/* Pincode and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                    placeholder="e.g. 97201"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                    placeholder="United States"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F5132] font-medium text-[#1F3E2F]"
                  placeholder="e.g. +1 (503) 555-0192"
                />
              </div>

              {/* Default checkbox */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  disabled={editingAddress?.isDefault} // Can't unset default directly, must set another default
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-[#EAE6DB] text-[#0F5132] focus:ring-[#0F5132] accent-[#0F5132]"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-xs text-[#5C6E61] select-none cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-[#EAE6DB]/40">
                <button
                  type="submit"
                  className="flex-grow bg-[#0F5132] hover:bg-[#113C27] text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white border border-[#EAE6DB] hover:border-[#738276] text-[#113C27] py-3 px-6 rounded-xl font-bold transition-all hover:bg-[#FAF8F5] text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
