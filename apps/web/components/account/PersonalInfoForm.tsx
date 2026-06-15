"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { User, Mail, Phone, Calendar, Check, AlertTriangle } from "lucide-react";

export default function PersonalInfoForm() {
  const router = useRouter();
  const { user, token, updateUser, logout } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const fn = user.profile?.firstName || "";
      const ln = user.profile?.lastName || "";
      setFullName(`${fn} ${ln}`.trim());
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
      if (user.profile?.dateOfBirth) {
        setDob(String(user.profile.dateOfBirth).split("T")[0]);
      } else {
        setDob("");
      }
    }
  }, [user]);

  const validateFields = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (phone && !/^(\+?\d{1,4})?[\d\s-]{7,15}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid mobile number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!validateFields()) return;

    setIsLoading(true);

    try {
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: phone || undefined,
          dateOfBirth: dob || undefined,
        }),
      });

      if (response.status === 401) {
        logout();
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      updateUser(data.user);
      setSuccess("Personal information updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="personal" className="bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] scroll-mt-28">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27] mb-6">
        Personal Information
      </h2>

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-4 bg-[#0F5132]/8 border border-[#0F5132]/20 text-[#0F5132] rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-[#0F5132]/15 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span>{success}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-[#A84444]/8 border border-[#A84444]/20 text-[#A84444] rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-[#A84444]/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
              <User className="h-4 w-4" />
            </div>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
              }}
              placeholder="Aditi Rao"
              className={`appearance-none block w-full pl-10 pr-3.5 py-2.5 border rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:bg-white font-semibold transition-all duration-200 ${
                fieldErrors.fullName
                  ? "border-[#A84444] focus:ring-[#A84444] focus:border-[#A84444]"
                  : "border-[#EAE6DB] focus:ring-[#0F5132] focus:border-[#0F5132]"
              }`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="mt-1 text-[10px] font-semibold text-[#A84444]">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="profileEmail"
            className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="aditi.rao@example.com"
              className={`appearance-none block w-full pl-10 pr-3.5 py-2.5 border rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:bg-white font-semibold transition-all duration-200 ${
                fieldErrors.email
                  ? "border-[#A84444] focus:ring-[#A84444] focus:border-[#A84444]"
                  : "border-[#EAE6DB] focus:ring-[#0F5132] focus:border-[#0F5132]"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-[10px] font-semibold text-[#A84444]">{fieldErrors.email}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label
            htmlFor="profilePhone"
            className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
          >
            Mobile Number
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#EAE6DB] bg-[#F9F7F2]/60 text-xs font-bold text-[#5C6E61]">
              +91
            </span>
            <div className="relative flex-1">
              <input
                id="profilePhone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="9876543210"
                className={`appearance-none block w-full pl-3.5 pr-3.5 py-2.5 border rounded-r-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:bg-white font-semibold transition-all duration-200 ${
                  fieldErrors.phone
                    ? "border-[#A84444] focus:ring-[#A84444] focus:border-[#A84444]"
                    : "border-[#EAE6DB] focus:ring-[#0F5132] focus:border-[#0F5132]"
                }`}
              />
            </div>
          </div>
          {fieldErrors.phone && (
            <p className="mt-1 text-[10px] font-semibold text-[#A84444]">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label
            htmlFor="profileDob"
            className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
          >
            Date of Birth
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              id="profileDob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#0F5132] focus:border-[#0F5132] focus:bg-white font-semibold transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2 pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-8 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-[#0F5132] hover:bg-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F5132] active:scale-[0.97] transform transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
