"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import {
  User,
  ShoppingBag,
  MapPin,
  Bell,
  LogOut,
  Edit2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "personal", label: "Personal Information", icon: User },
  { id: "security", label: "Security & Password", icon: ShieldCheck },
  { id: "orders", label: "Order History", icon: ShoppingBag },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function ProfileSidebar({
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, logout, token, updateUser } = useAuthStore();

  const firstName = user?.profile?.firstName || "";
  const lastName = user?.profile?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const email = user?.email || "";

  // Calculate profile completion
  const calculateCompletion = () => {
    let filled = 0;
    const total = 5;
    if (firstName) filled++;
    if (lastName) filled++;
    if (email) filled++;
    if (user?.phoneNumber) filled++;
    if (user?.profile?.dateOfBirth) filled++;
    return Math.round((filled / total) * 100);
  };

  const completionPercent = calculateCompletion();

  const getCompletionHint = () => {
    if (!firstName) return "Add your first name!";
    if (!lastName) return "Add your last name!";
    if (!user?.phoneNumber) return "Add your phone number for a special gift!";
    if (!user?.profile?.dateOfBirth) return "Add your birthdate for a special gift!";
    return "Your profile is 100% complete! ✨";
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Please select an image smaller than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setIsUploading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName,
            lastName: lastName || undefined,
            email,
            phoneNumber: user?.phoneNumber || undefined,
            dateOfBirth: user?.profile?.dateOfBirth || undefined,
            avatarUrl: base64String,
          }),
        });

        if (response.status === 401) {
          logout();
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (response.ok && data.user) {
          updateUser(data.user);
        } else {
          console.error("Failed to upload avatar:", data.error);
        }
      } catch (err) {
        console.error("Error updating avatar:", err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 h-fit sticky top-28">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative group">
          <button 
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-[#0F5132]/20 transition-transform duration-300 group-hover:scale-105"
          >
            {isUploading ? (
              <div className="w-full h-full bg-[#0F5132]/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#0F5132] animate-spin" />
              </div>
            ) : user?.profile?.avatarUrl ? (
              <img
                src={user.profile.avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0F5132] to-[#2D6A4F] flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
          </button>
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-[#EAE6DB] rounded-full flex items-center justify-center text-[#0F5132] shadow-md hover:bg-[#F0FFF4] transition-all duration-200 hover:scale-110"
            title="Edit Avatar"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <h3 className="mt-4 font-serif text-lg font-bold text-[#113C27]">
          {fullName}
        </h3>
        <p className="text-xs font-semibold text-[#5C6E61] mt-0.5">
          Conscious Enthusiast
        </p>
      </div>

      {/* Profile Completion */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#113C27] tracking-wide">
            Profile Completion
          </span>
          <span className="text-[11px] font-extrabold text-[#0F5132]">
            {completionPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#EAE6DB]/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0F5132] to-[#2D6A4F] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-[#738276] mt-1.5 font-medium">
          {getCompletionHint()}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#EAE6DB]/60 mb-4" />

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-[#0F5132]/10 text-[#0F5132]"
                  : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-[#0F5132]" : "text-[#738276] group-hover:text-[#113C27]"
                }`}
              />
              {item.label}
            </button>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#A84444] hover:bg-red-50 transition-all duration-200 mt-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
