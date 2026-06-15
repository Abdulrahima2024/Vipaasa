"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/layout/Header";
import ProfileSidebar from "../../../components/account/ProfileSidebar";
import PersonalInfoForm from "../../../components/account/PersonalInfoForm";
import SecuritySettings from "../../../components/account/SecuritySettings";
import RewardsCard from "../../../components/account/RewardsCard";
import EcoImpactCard from "../../../components/account/EcoImpactCard";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  // Zustand stores
  const { user, token, isAuthenticated, updateUser, logout, _hasHydrated } = useAuthStore();
  const { items, favorites } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth guard
  useEffect(() => {
    if (mounted && _hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, _hasHydrated, isAuthenticated, router]);

  // Fetch fresh profile on mount
  useEffect(() => {
    if (mounted && isAuthenticated && token) {
      const fetchProfile = async () => {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const response = await fetch(`${apiBaseUrl}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.status === 401) {
            logout();
            router.push("/login");
            return;
          }
          if (response.ok) {
            const data = await response.json();
            updateUser(data.user);
          }
        } catch (err) {
          console.error("Failed to fetch fresh user profile on mount:", err);
        }
      };
      fetchProfile();
    }
  }, [mounted, isAuthenticated, token, logout, router]);

  // Handle sidebar nav clicks for order history and addresses
  const handleSectionChange = (section: string) => {
    if (section === "orders") {
      router.push("/orders");
      return;
    }
    if (section === "addresses") {
      router.push("/account/addresses");
      return;
    }
    setActiveSection(section);
    
    // Smooth scroll to card
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Loading state
  if (!mounted || !_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#EAE6DB] border-t-[#0F5132] animate-spin" />
          </div>
          <span className="text-sm font-semibold text-[#5C6E61]">Securing session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Header */}
      <Header
        showSearch={false}
        cartCount={items.reduce((acc, item) => acc + item.quantity, 0)}
        favoritesCount={favorites.length}
        activeNav=""
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <ProfileSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Personal Information */}
            <PersonalInfoForm />

            {/* Security & Password */}
            <SecuritySettings />

            {/* Rewards + Eco Impact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <RewardsCard />
              <EcoImpactCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-16 pt-16 pb-20 text-[#4B594F] overflow-hidden bg-[#FAF9F5] border-t border-[#EAE6DB]/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-6 space-y-5">
            <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
            <p className="text-sm leading-relaxed max-w-sm">
              Crafting premium, artisanal wellness products with a commitment to pure ingredients and ethical earth stewardship.
            </p>
          </div>
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Company</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Ethos</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Support</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[#DEDAD0] mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
          &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
        </div>
      </footer>
    </div>
  );
}
