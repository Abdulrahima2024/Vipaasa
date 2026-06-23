"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { ProductCard, Product } from "../../components/home/ProductListing";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/authStore";
import { fetchApi } from "../../lib/api";

export default function FavoritesPage() {
  const {
    items,
    favorites,
    animatingProductId,
    addToCart,
    toggleFavorite,
  } = useCartStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const handleBuyNow = (product: Product, weight: "1kg" | "500g" | "250g") => {
    addToCart(product, weight);
    if (isAuthenticated) {
      window.location.href = "/checkout";
    } else {
      window.location.href = `/login?redirect=/checkout`;
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const data = await fetchApi<{ items: any[] }>("/api/products?limit=100");
        if (data && Array.isArray(data.items)) {
          const mapped: Product[] = data.items.map((item: any) => {
            const prices = {
              "250g": item.price || 0,
              "500g": Math.round((item.price || 0) * 1.8),
              "1kg": Math.round((item.price || 0) * 3.2),
            };

            if (item.variants && item.variants.length > 0) {
              item.variants.forEach((v: any) => {
                const grams = v.weightGrams;
                const weightKey = grams === 1000 ? "1kg" : grams === 500 ? "500g" : "250g";
                const basePrice = v.pricing ? Number(v.pricing.basePrice) : 0;
                if (basePrice > 0) {
                  prices[weightKey] = basePrice;
                }
              });
            }

            return {
              id: item.id,
              name: item.name,
              category: item.category?.name || "General",
              prices,
              image: (item.images && item.images[0]?.url) || item.image || "/placeholder.jpg",
              isNew: item.stockStatus === "IN_STOCK",
              rating: 4.5 + (parseInt((item.id || "0").replace(/\D/g, "") || "0") % 5) * 0.1,
              variants: item.variants,
              description: item.description || `${item.name} — 100% pure organic staple.`,
              weight: item.variants?.[0]?.weightGrams === 1000 ? "1kg" : item.variants?.[0]?.weightGrams === 500 ? "500g" : "250g",
              inStock: item.stockStatus === "IN_STOCK",
            };
          });
          setApiProducts(mapped);
        }
      } catch (err) {
        console.error("FavoritesPage: Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, [mounted, token, _hasHydrated]);

  const favoriteProducts = apiProducts.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Dynamic Font Import */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* HEADER SECTION */}
      <Header
        showSearch={true}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        onFavoritesClick={() => {
          // Already on favorites page, do nothing or scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-8 space-y-8">
        
        {/* BREADCRUMB */}
        <nav className="text-xs font-semibold tracking-wider text-[#738276]" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-[#113C27] transition-colors">Home</a>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <span className="text-[#113C27]">Your Favorites</span>
            </li>
          </ol>
        </nav>

        {/* PAGE HEADER */}
        <div className="border-b border-[#EAE6DB] pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#113C27] tracking-tight">
            Your Favorites
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#738276] mt-1">
            Products you have saved across our harvest catalog.
          </p>
        </div>

        {/* FAVORITES GRID OR EMPTY STATE */}
        {!mounted || loadingProducts ? (
          <div className="text-center py-20 text-[#738276] font-semibold text-lg animate-pulse">
            Loading your favorites...
          </div>
        ) : favoriteProducts.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white/60 border border-[#EAE6DB] rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm backdrop-blur-sm">
            <div className="w-16 h-16 bg-[#EAF5EC] rounded-full flex items-center justify-center mx-auto mb-6 text-[#113C27]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#113C27] mb-3">No favorites saved yet</h2>
            <p className="text-sm text-[#5C6E61] mb-8 max-w-sm mx-auto leading-relaxed">
              Explore our fresh seasonal harvests and tap the heart icon on any product to save them here.
            </p>
            <Link
              href="/categories"
              className="inline-block bg-[#1B4332] text-white px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide hover:bg-[#113C27] transition-all duration-200 shadow-md shadow-green-950/10"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* PRODUCTS GRID */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-4">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(weight) => addToCart(product, weight)}
                onBuyNow={(weight) => handleBuyNow(product, weight)}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isAnimatingFavorite={animatingProductId === product.id}
                onRemoveFavorite={() => toggleFavorite(product.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}
