"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { Lock, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import AnimatedEye from "../ui/AnimatedEye";

export default function SecuritySettings() {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
    if (score === 2) return { level: 2, label: "Fair", color: "bg-yellow-400" };
    if (score === 3) return { level: 3, label: "Good", color: "bg-[#2D6A4F]" };
    return { level: 4, label: "Strong", color: "bg-[#0F5132]" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.status === 401) {
        logout();
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="security" className="bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] scroll-mt-28">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-[#0F5132]" />
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
          Security & Password
        </h2>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPwd"
            className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
          >
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="currentPwd"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#0F5132] focus:border-[#0F5132] focus:bg-white font-semibold transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#738276] hover:text-[#113C27] transition-colors"
            >
              <AnimatedEye isOpen={showCurrentPassword} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Password + Confirm side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPwd"
              className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="newPwd"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-[#EAE6DB] rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:ring-[#0F5132] focus:border-[#0F5132] focus:bg-white font-semibold transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#738276] hover:text-[#113C27] transition-colors"
              >
                <AnimatedEye isOpen={showNewPassword} className="w-4 h-4" />
              </button>
            </div>
            {/* Strength meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.level ? strength.color : "bg-[#EAE6DB]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-[#738276]">
                  Strength: <span className={`${strength.level >= 3 ? "text-[#0F5132]" : strength.level >= 2 ? "text-yellow-600" : "text-[#A84444]"}`}>{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPwd"
              className="block text-[11px] font-bold text-[#113C27] mb-1.5 uppercase tracking-wider"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#738276]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="confirmPwd"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Match new password"
                className={`appearance-none block w-full pl-10 pr-10 py-2.5 border rounded-xl placeholder-[#738276] text-sm text-[#113C27] bg-[#F9F7F2]/30 focus:outline-none focus:ring-1 focus:bg-white font-semibold transition-all duration-200 ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-[#A84444] focus:ring-[#A84444] focus:border-[#A84444]"
                    : "border-[#EAE6DB] focus:ring-[#0F5132] focus:border-[#0F5132]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#738276] hover:text-[#113C27] transition-colors"
              >
                <AnimatedEye isOpen={showConfirmPassword} className="w-4 h-4" />
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-[10px] font-semibold text-[#A84444]">Passwords do not match.</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 px-8 border-2 border-[#0F5132] rounded-xl text-xs font-bold text-[#0F5132] bg-transparent hover:bg-[#0F5132] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F5132] active:scale-[0.97] transform transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
