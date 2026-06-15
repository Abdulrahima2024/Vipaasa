import React, { useState } from "react";

export interface Address {
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

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelect: (id: string) => void;
  onAdd: (address: Omit<Address, "id">) => void;
  onEdit: (id: string, address: Address) => void;
  onProceed: () => void;
  onBackToCart: () => void;
}

export default function AddressSelector({
  addresses,
  selectedAddressId,
  onSelect,
  onAdd,
  onEdit,
  onProceed,
  onBackToCart,
}: AddressSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form Fields State
  const [type, setType] = useState<"Home" | "Work" | "Other">("Home");
  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setType("Home");
    setName("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setPhone("");
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEditClick = (e: React.MouseEvent, addr: Address) => {
    e.stopPropagation(); // Avoid triggering card selection
    setEditingAddress(addr);
    setType(addr.type);
    setName(addr.name);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setPhone(addr.phone);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !addressLine1 || !city || !state || !postalCode || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      type,
      name,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      country: "India",
      phone,
    };

    if (editingAddress) {
      onEdit(editingAddress.id, { ...editingAddress, ...payload });
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27] mb-2 tracking-tight">
          Select Delivery Address
        </h2>
        <p className="text-sm text-[#5C6E61] font-medium">
          Choose where you want your organic basket to be shipped.
        </p>
      </div>

      {/* Address cards list */}
      <div className="space-y-4">
        {addresses.map((addr) => {
          const isSelected = addr.id === selectedAddressId;
          return (
            <div
              key={addr.id}
              onClick={() => onSelect(addr.id)}
              className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 ${
                isSelected
                  ? "border-[#1B4332] bg-white shadow-[0_8px_24px_rgba(27,67,50,0.06)]"
                  : "border-[#EAE6DB] hover:border-[#738276] bg-white/70 hover:bg-white shadow-[0_4px_16px_rgba(0,0,0,0.01)]"
              }`}
            >
              {/* Card top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Styled Radio Input */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-[#1B4332]" : "border-[#D1C9B8]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
                    )}
                  </div>
                  {/* Address Type Tag */}
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C6E61]">
                    {addr.type} {addr.isDefault && "(Default)"}
                  </span>
                </div>

                {/* Edit Button */}
                <button
                  onClick={(e) => handleEditClick(e, addr)}
                  className="text-xs font-bold text-[#1B4332] hover:text-[#113C27] hover:underline transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Address details */}
              <div className="mt-4 pl-8 space-y-1 text-sm font-semibold text-[#5C6E61]">
                <p className="text-[#1F3E2F] font-bold text-base">{addr.name}</p>
                <p className="leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                <p className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#1F3E2F]">
                  <svg className="w-3.5 h-3.5 text-[#738276]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.108-7.108c-.145-.44.02-9.27.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  {addr.phone}
                </p>
              </div>
            </div>
          );
        })}

        {/* Add Address Card Button */}
        <div
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="cursor-pointer border-2 border-dashed border-[#EAE6DB] hover:border-[#738276] bg-white/40 hover:bg-white/70 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-[#EAF5EC] text-[#2D6A4F] flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#113C27]">Add New Address</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#EAE6DB]/40">
        <button
          onClick={onProceed}
          className="flex-1 bg-[#1B4332] hover:bg-[#113C27] text-white py-4 px-8 rounded-xl font-bold transition-all shadow-md shadow-green-950/10 active:scale-[0.98]"
        >
          Deliver to this Address
        </button>
        <button
          onClick={onBackToCart}
          className="bg-white border border-[#EAE6DB] hover:border-[#738276] text-[#113C27] py-4 px-8 rounded-xl font-bold transition-all hover:bg-[#FAF8F5]"
        >
          Back to Cart
        </button>
      </div>

      {/* Modal form overlay for adding/editing addresses */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F9F7F2] border border-[#EAE6DB] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-[#738276] hover:text-[#113C27] transition-colors"
            >
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-serif text-2xl font-bold text-[#113C27] mb-6">
              {editingAddress ? "Edit Delivery Address" : "Add New Address"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold text-[#1F3E2F]">
              {/* Type selector */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-2 font-bold">Address Type</label>
                <div className="flex gap-3">
                  {(["Home", "Work", "Other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${
                        type === t
                          ? "border-[#1B4332] bg-[#EAF5EC]/20 text-[#113C27]"
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
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                  placeholder="e.g. Ananya Sharma"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                  placeholder="Street, building, apartment"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                  placeholder="Suite, unit, floor, etc."
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                    placeholder="e.g. Noida"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                    placeholder="e.g. Uttar Pradesh"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Postal Code / PIN *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                    placeholder="e.g. 201310"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4 border-t border-[#EAE6DB]/40">
                <button
                  type="submit"
                  className="flex-1 bg-[#1B4332] hover:bg-[#113C27] text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white border border-[#EAE6DB] hover:border-[#738276] text-[#113C27] py-3 px-6 rounded-xl font-bold transition-all hover:bg-[#FAF8F5]"
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
