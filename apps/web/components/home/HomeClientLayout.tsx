"use client";

import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import ProductListing from "./ProductListing";
import { useCartStore } from "../../store/useCartStore";

interface HomeClientLayoutProps {
  hero: React.ReactNode;
  benefits: React.ReactNode;
  promise: React.ReactNode;
  spotlight: React.ReactNode;
  footer: React.ReactNode;
}

export default function HomeClientLayout({
  hero,
  benefits,
  promise,
  spotlight,
  footer,
}: HomeClientLayoutProps) {
  // Navigation active state
  const [activeNav, setActiveNav] = useState("Shop");

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Favorites toggle filter state
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Zustand Store connection for counts
  const { items, favorites } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("filter") === "favorites") {
        window.location.href = "/favorites";
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      
      {/* HEADER SECTION */}
      <Header
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onFavoritesClick={() => {
          window.location.href = "/favorites";
        }}
      />

      {/* Static Hero Section (Server Component) */}
      {hero}

      {/* MAIN CONTENT SECTION */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-10 space-y-16">
        
        {/* Product listing container wrapper (Client component) */}
        <ProductListing
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
        />

        {/* Benefits Section (Server Component) */}
        {benefits}

        {/* Static Promise Section (Server Component) */}
        {promise}

        {/* Static Spotlight Section (Server Component) */}
        {spotlight}

      </main>

      {/* Static Footer Section (Server Component) */}
      {footer}

    </div>
  );
}
