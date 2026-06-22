"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../lib/api";

export default function Page() {
  // Personal details states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [productAlerts, setProductAlerts] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettingsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch user profile
      const profileRes = await fetchAPI("/api/users/profile");
      const user = profileRes.user;
      const first = user.profile?.firstName || "";
      const last = user.profile?.lastName || "";
      setFullName(`${first} ${last}`.trim());
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");

      // 2. Fetch notifications settings
      const settingsRes = await fetchAPI("/api/settings");
      setEmailNotifications(settingsRes.emailNotifications);
      setSmsNotifications(settingsRes.smsNotifications);
      setProductAlerts(settingsRes.productAlerts);
    } catch (err: any) {
      console.error("Error loading settings:", err);
      setError("Failed to load account settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSavePersonalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = fullName.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    try {
      await fetchAPI("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: phone,
        }),
      });
      alert("Personal details updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update personal details.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      await fetchAPI("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to update password.");
    }
  };

  const handleToggleNotification = async (channel: "email" | "sms" | "alerts", checked: boolean) => {
    try {
      const payload: any = {};
      if (channel === "email") {
        setEmailNotifications(checked);
        payload.emailNotifications = checked;
      } else if (channel === "sms") {
        setSmsNotifications(checked);
        payload.smsNotifications = checked;
      } else if (channel === "alerts") {
        setProductAlerts(checked);
        payload.productAlerts = checked;
      }

      await fetchAPI("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      alert(err.message || "Failed to save notification preferences.");
      // Revert states
      loadSettingsData();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center text-gray-500 font-bold">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-sm font-semibold text-[var(--primary-green)] uppercase tracking-[0.2em]">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-gray-900">Account settings</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Update your profile details, change your password, and manage notification preferences.
        </p>
      </div>

      <div className="space-y-10">
        {/* Personal Details */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSavePersonalDetails}>
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Personal details</h2>
              <p className="text-sm text-gray-500">Edit your name, email, and phone number.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-700">
                <span>Full name</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9999999999"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="rounded-2xl bg-[var(--primary-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors">
                Save personal details
              </button>
            </div>
          </form>
        </section>

        {/* Update Password */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Update password</h2>
              <p className="text-sm text-gray-500">Change your account password to keep your account secure.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-700">
                <span>Current password</span>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>New password</span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                <span>Confirm new password</span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-[var(--primary-green)] focus:outline-none focus:ring-2 focus:ring-[rgba(16,185,129,0.12)]"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="rounded-2xl bg-[var(--primary-green)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors">
                Update password
              </button>
            </div>
          </form>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Choose how you want to receive alerts and updates.</p>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 cursor-pointer select-none">
              <div>
                <p className="text-sm font-semibold text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-500">Receive account updates, product alerts, and news by email.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => handleToggleNotification("email", e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 cursor-pointer select-none">
              <div>
                <p className="text-sm font-semibold text-gray-900">SMS notifications</p>
                <p className="text-sm text-gray-500">Get important alerts on your mobile phone.</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => handleToggleNotification("sms", e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 cursor-pointer select-none">
              <div>
                <p className="text-sm font-semibold text-gray-900">Product alerts</p>
                <p className="text-sm text-gray-500">Receive notifications for inventory, orders, and product updates.</p>
              </div>
              <input
                type="checkbox"
                checked={productAlerts}
                onChange={(e) => handleToggleNotification("alerts", e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] cursor-pointer"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
