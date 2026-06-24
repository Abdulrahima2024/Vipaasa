"use client";

import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import {
  User,
  ShoppingBag,
  MapPin,
  Bell,
  LogOut,
  Camera,
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

/** Compresses an image file to JPEG base64 with max width and quality */
function compressImage(file: File, maxWidth = 400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/** Converts a compressed image data URL back to a File object for multipart uploads */
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function ProfileSidebar({
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { user, logout, token, updateUser } = useAuthStore();
  const { showToast } = useToastStore();

  const firstName = user?.profile?.firstName || "";
  const lastName = user?.profile?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const email = user?.email || "";
  const displayAvatar = avatarPreview || user?.profile?.avatarUrl || null;

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
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = ""; // reset so same file can be re-selected

      // 1. Strict production validations
      const MAX_SIZE_MB = 2;
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showToast(`Image exceeds the ${MAX_SIZE_MB}MB size limit.`, "warning");
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        showToast("Invalid file type. Only JPG and PNG images are allowed.", "error");
        return;
      }

      setIsUploading(true);
      try {
        // 2. Compress image client-side & show instant preview
        const compressedDataUrl = await compressImage(file, 400, 0.82);
        setAvatarPreview(compressedDataUrl);

        // 3. Construct binary multipart body
        const compressedFile = dataURLtoFile(compressedDataUrl, file.name);
        const formData = new FormData();
        formData.append("avatar", compressedFile);

        // 4. Send to S3 upload endpoint
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/users/profile/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          logout();
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (response.ok && data.user) {
          updateUser(data.user);
          setAvatarPreview(null); // Clear preview to use updated URL from S3/CloudFront
          showToast("Profile photo updated successfully! 🌿", "success");
        } else {
          setAvatarPreview(null);
          showToast(data.error || "Failed to update profile photo. Please try again.", "error");
        }
      } catch (err: any) {
        setAvatarPreview(null);
        console.error("Error uploading avatar:", err);
        showToast("Something went wrong while uploading. Please try again.", "error");
      } finally {
        setIsUploading(false);
      }
    },
    [token, logout, router, updateUser, showToast]
  );

  return (
    <aside className="bg-white rounded-2xl border border-[#EAE6DB]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 h-fit sticky top-28">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
        className="hidden"
      />

      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative group">
          {/* Main avatar button */}
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-[#0F5132]/20 transition-transform duration-300 group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0F5132]/40"
            title="Change profile photo"
          >
            {isUploading ? (
              <div className="w-full h-full bg-[#0F5132]/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#0F5132] animate-spin" />
              </div>
            ) : displayAvatar ? (
              <img
                src={displayAvatar}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0F5132] to-[#2D6A4F] flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            {/* Hover camera overlay */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white drop-shadow" />
              </div>
            )}
          </button>

          {/* Small camera badge */}
          <button
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-[#EAE6DB] rounded-full flex items-center justify-center text-[#0F5132] shadow-md hover:bg-[#F0FFF4] transition-all duration-200 hover:scale-110 focus:outline-none"
            title="Change profile photo"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <h3 className="mt-4 font-serif text-lg font-bold text-[#113C27]">
          {fullName.toUpperCase()}
        </h3>
        <p className="text-xs font-semibold text-[#5C6E61] mt-0.5">
          Conscious Enthusiast
        </p>
        <p className="text-[10px] text-[#9EAF9E] mt-1">
          {isUploading ? "Uploading photo…" : "Click photo to change"}
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
