"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/authStore";
import { fetchApi } from "../../../lib/api";
import { parseEmojiImage } from "../../../lib/image";


// Real API product shape (used only for internal state)
interface CategoryProduct {
  id: string;
  name: string;
  category: "Dals & Pulses" | "Flours" | "Spices & Powders" | "Millets & Grains" | "Broken Grains (Rava)" | "Honey & Ghee" | string;
  prices: {
    "1kg": number;
    "500g": number;
    "250g": number;
  };
  weight: "1kg" | "500g" | "250g";
  image: string;
  tag?: string;
  description: string;
  inStock: boolean;
  rating: number;
  createdAt: string;
}


export default function CategoriesClient() {
  const [mounted, setMounted] = useState(false);
  const [apiProducts, setApiProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([
    "Dals & Pulses",
    "Flours",
    "Spices & Powders",
    "Millets & Grains",
    "Broken Grains (Rava)",
    "Honey & Ghee"
  ]);

  // Cart/Favorites store
  const { items, favorites, addToCart, toggleFavorite } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  // Search input query
  const [searchQuery, setSearchQuery] = useState("");

  // Filters state
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Mobile drawer states
  const [isFilterOpenMobile, setIsFilterOpenMobile] = useState<boolean>(false);
  const [isSortOpenMobile, setIsSortOpenMobile] = useState<boolean>(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<"Latest" | "Price Low to High" | "Price High to Low" | "Popular">("Latest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Adding to cart animation track
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }

    async function loadProducts() {
      setLoading(true);
      setApiError(null);
      try {
        const data = await fetchApi<{ items: any[] }>("/api/products?limit=100");
        if (data && data.items) {
          const mapped: CategoryProduct[] = data.items.map((item: any) => {
            // Find first available variant weight
            let defaultWeight: "1kg" | "500g" | "250g" = "250g";
            if (item.variants && item.variants.length > 0) {
              const firstGrams = item.variants[0].weightGrams;
              defaultWeight = firstGrams === 1000 ? "1kg" : firstGrams === 500 ? "500g" : "250g";
            }

            // Map prices based on actual variants if available, otherwise fallback
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

            const imageUrl = (item.images && item.images[0]?.url) || "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400";

            return {
              id: item.id,
              name: item.name,
              category: item.category?.name || "General",
              prices,
              weight: defaultWeight,
              image: imageUrl,
              tag: item.stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock",
              description: item.description || `${item.name} — 100% pure organic staple.`,
              inStock: item.stockStatus === "IN_STOCK",
              rating: 4.5 + (parseInt((item.id || "0").replace(/\D/g, "") || "0") % 5) * 0.1,
              createdAt: new Date().toISOString().split("T")[0],
            };
          });
          setApiProducts(mapped);
        } else {
          setApiProducts([]);
        }
      } catch (err: any) {
        console.error("CategoriesClient: failed to load products:", err);
        setApiError(err?.message || "Failed to load products");
        setApiProducts([]);
      } finally {
        setLoading(false);
      }
    }
    async function loadCategories() {
      try {
        const data = await fetchApi<any[]>("/api/categories");
        if (data && Array.isArray(data)) {
          const list: string[] = [];
          const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
              if (node.name) {
                list.push(node.name);
              }
              if (node.children && node.children.length > 0) {
                traverse(node.children);
              }
            });
          };
          traverse(data);
          if (list.length > 0) {
            setCategories(list);
          }
        }
      } catch (err: any) {
        console.error("CategoriesClient: failed to load categories:", err);
      }
    }

    loadCategories();
    loadProducts();
  }, [token]);

  // Sync searchQuery to URL query parameter silently
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? "?" + newSearch : ""}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }, [searchQuery, mounted]);

  // Lock body scroll when mobile drawers are open
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isFilterOpenMobile || isSortOpenMobile) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [isFilterOpenMobile, isSortOpenMobile]);

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((item) => item !== subcategory)
        : [...prev, subcategory]
    );
    setCurrentPage(1); // reset to page 1
  };

  const handleResetFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange(5000);
    setInStockOnly(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Active filters count for mobile UI
  const activeFiltersCount = useMemo(() => {
    return selectedSubcategories.length + (priceRange < 5000 ? 1 : 0) + (inStockOnly ? 1 : 0);
  }, [selectedSubcategories, priceRange, inStockOnly]);

  // Filtered and Sorted products — always use apiProducts (real API only)
  const filteredProducts = useMemo(() => {
    return apiProducts.filter((product) => {
      // Subcategories filter
      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(product.category);

      // Price limit filter
      const productPrice = product.prices[product.weight];
      const matchesPrice = productPrice <= priceRange;

      // In Stock filter
      const matchesStock = !inStockOnly || product.inStock;

      // Search query filter (nav search filters listing)
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSubcategory && matchesPrice && matchesStock && matchesSearch;
    });
  }, [apiProducts, selectedSubcategories, priceRange, inStockOnly, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const productsCopy = [...filteredProducts];
    if (sortBy === "Latest") {
      return productsCopy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === "Price Low to High") {
      return productsCopy.sort(
        (a, b) => a.prices[a.weight] - b.prices[b.weight]
      );
    }
    if (sortBy === "Price High to Low") {
      return productsCopy.sort(
        (a, b) => b.prices[b.weight] - a.prices[a.weight]
      );
    }
    if (sortBy === "Popular") {
      return productsCopy.sort((a, b) => b.rating - a.rating);
    }
    return productsCopy;
  }, [filteredProducts, sortBy]);

  // Pagination calculations
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Safe page guard
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const paginatedProducts = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, activePage]);

  // Dynamic range boundaries for pagination display
  const showingFrom = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(activePage * itemsPerPage, totalItems);

  // Cart helper wrapper
  const handleAddToCart = (product: CategoryProduct) => {
    setAddingId(product.id);
    addToCart(product, product.weight);

    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  const handleBuyNow = (product: CategoryProduct) => {
    addToCart(product, product.weight);
    if (isAuthenticated) {
      window.location.href = "/checkout";
    } else {
      window.location.href = `/login?redirect=/checkout`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">

      {/* HEADER SECTION */}
      <Header
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        activeNav="Categories"
        onNavChange={(navItem) => {
          if (navItem === "Shop") {
            window.location.href = "/";
          }
        }}
        onFavoritesClick={() => {
          window.location.href = "/favorites";
        }}
      />

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-16 py-8 flex-1 flex flex-col gap-6">

        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="text-[11px] font-extrabold tracking-wider flex items-center gap-2 text-[#738276] uppercase">
          <Link href="/" className="hover:text-[#113C27] transition-colors">
            Home
          </Link>
          <span className="text-gray-400 font-light text-[9px]">&gt;</span>
          <Link href="/categories" className="hover:text-[#113C27] transition-colors">
            category
          </Link>
          <span className="text-gray-400 font-light text-[9px]">&gt;</span>
          <span className="text-[#113C27] font-extrabold">Pantry Essentials</span>
        </nav>

        {/* HERO TITLE & DESCRIPTIONS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAE6DB] pb-6 gap-6">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#113C27] tracking-tight">
              Pantry Essentials
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#5C6E61] mt-2 leading-relaxed">
              Hand-picked, stone-ground, and ethically sourced staples for your conscious kitchen.
              <br />
              Pure ingredients from sun-drenched organic farms.
            </p>
          </div>

          {/* DYNAMIC RESULTS COUNT & SORTING */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:justify-end">
            <span className="text-xs font-bold text-[#5C6E61] whitespace-nowrap">
              Showing {showingFrom}-{showingTo} of {totalItems} results
            </span>

            <div className="relative hidden md:flex items-center">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#EAE6DB] hover:border-[#738276] rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-[#113C27] focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.01)]"
              >
                <option value="Latest">Sort by: Latest</option>
                <option value="Price Low to High">Sort by: Price Low to High</option>
                <option value="Price High to Low">Sort by: Price High to Low</option>
                <option value="Popular">Sort by: Popular</option>
              </select>
              <div className="absolute right-3.5 pointer-events-none text-[#113C27]">
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE FILTER & SORT BAR */}
        <div className="md:hidden flex items-center justify-between gap-4 py-3 px-4 bg-white/95 backdrop-blur-md border border-[#EAE6DB] rounded-2xl sticky top-[72px] z-30 shadow-md">
          <button
            type="button"
            onClick={() => setIsFilterOpenMobile(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#113C27] hover:bg-[#FAF9F5] rounded-xl transition-all"
          >
            <svg className="w-4 h-4 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-[#113C27] text-white text-[10px] rounded-full font-bold ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <div className="w-px h-5 bg-[#EAE6DB]" />
          
          <button
            type="button"
            onClick={() => setIsSortOpenMobile(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#113C27] hover:bg-[#FAF9F5] rounded-xl transition-all"
          >
            <svg className="w-4 h-4 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            <span className="truncate">Sort: {sortBy}</span>
          </button>
        </div>

        {/* WORKSPACE CONTENT GRID */}
        <div className="flex flex-col md:flex-row gap-10 mt-2">

          {/* LEFT FILTERS SIDEBAR */}
          <aside className="hidden md:block w-64 flex-shrink-0 md:sticky md:top-24 self-start">

            {/* SUBCATEGORIES SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                Subcategories
              </h4>
              <div className="flex flex-col gap-3">
                {categories.map((subcat) => {
                  const isChecked = selectedSubcategories.includes(subcat);
                  return (
                    <label key={subcat} className="flex items-center gap-3 cursor-pointer group text-xs sm:text-sm font-semibold text-[#4B594F] hover:text-[#113C27] transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryToggle(subcat)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isChecked
                          ? "bg-[#113C27] border-[#113C27] text-white"
                          : "border-[#EAE6DB] bg-white group-hover:border-[#738276]"
                          }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="select-none">{subcat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* PRICE SLIDER RANGE SECTION */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                  Price Range
                </h4>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-[#ECE9E0] rounded-lg appearance-none cursor-pointer accent-[#113C27] outline-none"
                />
                <div className="flex justify-between text-[11px] text-[#738276] font-extrabold uppercase tracking-wide">
                  <span>₹100</span>
                  <span className="text-[#113C27] bg-[#C1F2D0]/40 px-2 py-0.5 rounded font-extrabold">₹{priceRange} max</span>
                  <span>₹5,000</span>
                </div>
              </div>
            </div>

            {/* IN STOCK TOGGLE SWITCH */}
            <div className="mt-8 pt-6 border-t border-[#EAE6DB]/60 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#4B594F]">
                Show in stock only
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => {
                    setInStockOnly(!inStockOnly);
                    setCurrentPage(1);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#ECE9E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#113C27]"></div>
              </label>
            </div>

            {/* BOTANICAL SKETCH VECTOR BOX */}
            <div className="mt-10 hidden md:block">
              <div className="p-6 border border-[#EAE6DB]/60 rounded-2xl bg-white/40 flex items-center justify-center aspect-square max-w-[170px] mx-auto opacity-70 hover:opacity-100 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <svg className="w-20 h-20 text-[#738276]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 7c2-1.5 5-2.5 7-1M12 11c2-1.5 5-2.5 7-1M12 15c2-1.5 5-2.5 7-1M12 7c-2-1.5-5-2.5-7-1M12 11-2-1.5-5-2.5-7-1M12 15c-2-1.5-5-2.5-7-1" />
                </svg>
              </div>
            </div>

          </aside>

          {/* PRODUCT GRID SECTION */}
          <div className="flex-1 space-y-10">
            {/* LOADING SKELETON */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#EAE6DB]/40 rounded-2xl p-4 space-y-3 animate-pulse">
                    <div className="w-full aspect-square rounded-xl bg-[#F0EDE5]" />
                    <div className="h-3 w-20 rounded bg-[#EAE6DB]/60" />
                    <div className="h-4 w-3/4 rounded bg-[#EAE6DB]/80" />
                    <div className="h-3 w-1/2 rounded bg-[#EAE6DB]/50" />
                    <div className="h-10 w-full rounded-xl bg-[#EAE6DB]/60" />
                  </div>
                ))}
              </div>
            ) : apiError ? (
              <div className="text-center py-16 bg-white/50 rounded-2xl border border-red-100 px-6">
                <p className="text-sm text-red-500 font-medium">{apiError}</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="relative overflow-hidden text-center py-24 rounded-3xl border border-[#EAE6DB]/80 bg-gradient-to-br from-[#F6F4EC] via-[#F9F7F2] to-[#EEF5EB] px-6">
                {/* Decorative blobs */}
                <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-[#C1F2D0]/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-[#D4EDDA]/20 blur-3xl pointer-events-none" />

                {/* Icon box */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-[0_8px_32px_rgba(17,60,39,0.08)] mb-6">
                  <svg className="w-9 h-9 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-[#C1F2D0] text-[#113C27]">
                    <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#113C27] mb-3 tracking-tight">
                  No Products Found
                </h3>
                <p className="text-sm font-medium text-[#738276] max-w-sm mx-auto leading-relaxed mb-8">
                  Our shelves are currently empty. Fresh harvests from organic farms are being prepared — check back soon!
                </p>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="h-px w-16 bg-[#EAE6DB]" />
                  <span className="text-[10px] font-bold tracking-widest text-[#B0BDB4] uppercase">Coming Soon</span>
                  <div className="h-px w-16 bg-[#EAE6DB]" />
                </div>

                {(selectedSubcategories.length > 0 || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="bg-[#113C27] text-white hover:bg-[#2D6A4F] text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {paginatedProducts.map((product) => {
                  const isFavorite = mounted && favorites.includes(product.id);
                  const price = product.prices[product.weight];
                  const isAdding = addingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-[#EAE6DB]/40 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:border-[#EAE6DB]/80 transition-all duration-300 group relative"
                    >
                      {/* Product Image and Overlay Labels */}
                      <div className="relative w-full aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden mb-4">
                        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
                          {(() => {
                            const emojiInfo = parseEmojiImage(product.image);
                            return emojiInfo.isEmoji ? (
                              <div
                                className="w-full h-full flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-105 select-none"
                                style={{ backgroundColor: emojiInfo.bgColor }}
                              >
                                {emojiInfo.emoji}
                              </div>
                            ) : (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            );
                          })()}
                        </Link>

                        {/* Organic Label / Custom tag */}
                        {product.tag && (
                          <span className="absolute top-2.5 left-2.5 bg-[#C1F2D0] text-[#113C27] text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 select-none shadow-sm">
                            {product.tag}
                          </span>
                        )}

                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full transition-all shadow-sm active:scale-90 transform z-10"
                          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg
                            className="w-4 h-4 stroke-[2.5] transition-all duration-300"
                            fill={isFavorite ? "#A84444" : "none"}
                            stroke={isFavorite ? "#A84444" : "#113C27"}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        </button>
                      </div>

                      {/* Product Content Details */}
                      <div className="space-y-3 flex-1 flex flex-col justify-between">

                        <div>
                          {/* Stock Status + Name Row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#738276]">
                              {product.category}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${product.inStock
                                ? "bg-[#C1F2D0]/50 text-[#113C27]"
                                : "bg-red-50 text-red-600"
                                }`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>

                          <Link href={`/products/${product.id}`} className="block">
                            <h4 className="font-serif text-xs sm:text-base font-extrabold text-[#113C27] tracking-tight mt-1 hover:text-[#2d6a4f] transition-colors leading-tight">
                              {product.name}
                            </h4>
                          </Link>

                          {/* Rating Review Stars */}
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center text-[#F5A623]">
                              {[...Array(5)].map((_, i) => {
                                const starVal = i + 1;
                                const isFull = starVal <= Math.floor(product.rating);
                                const isHalf = !isFull && starVal - 0.5 <= product.rating;
                                return (
                                  <svg
                                    key={i}
                                    className="w-3.5 h-3.5 fill-current"
                                    viewBox="0 0 24 24"
                                  >
                                    {isFull ? (
                                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    ) : isHalf ? (
                                      <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                                    ) : (
                                      <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1v9.3z" fill="none" stroke="currentColor" strokeWidth="2" />
                                    )}
                                  </svg>
                                );
                              })}
                            </div>
                            <span className="text-[10px] font-bold text-[#738276] leading-none mt-0.5 ml-1">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>

                          <p className="text-xs text-[#738276] font-medium mt-1.5">
                            {product.description}
                          </p>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="flex flex-col gap-2.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-lg font-bold text-[#113C27]">
                              ₹{price}
                            </span>
                            <span className="text-[10px] text-[#738276] font-bold uppercase tracking-wider bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE6DB]/60">
                              {product.weight}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {/* Buy Now button */}
                            <button
                              onClick={() => handleBuyNow(product)}
                              disabled={!product.inStock}
                              className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-[9px] sm:text-xs font-bold px-1.5 py-2 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95 transform text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy Now
                            </button>

                            {/* Add to Cart button */}
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.inStock || isAdding}
                              className={`flex items-center justify-center gap-1.5 text-xs font-bold px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95 transform whitespace-nowrap ${!product.inStock
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isAdding
                                  ? "bg-[#2D6A4F] text-white"
                                  : "bg-[#113C27] text-white hover:bg-[#2D6A4F]"
                                }`}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              {isAdding ? (
                                <>
                                  <svg className="w-3.5 h-3.5 stroke-[3.5] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                  </svg>
                                  <span className="hidden sm:inline">Added!</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                  </svg>
                                  <span className="hidden sm:inline">Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">

                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={activePage === 1}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${activePage === 1
                    ? "border-[#EAE6DB]/60 text-gray-300 cursor-not-allowed"
                    : "border-[#EAE6DB] text-[#113C27] hover:border-[#738276] hover:bg-white"
                    }`}
                  aria-label="Previous Page"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = activePage === page;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${isActive
                        ? "bg-[#113C27] text-white shadow-sm"
                        : "border border-[#EAE6DB] text-[#4B594F] hover:border-[#738276] hover:bg-white"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${activePage === totalPages
                    ? "border-[#EAE6DB]/60 text-gray-300 cursor-not-allowed"
                    : "border-[#EAE6DB] text-[#113C27] hover:border-[#738276] hover:bg-white"
                    }`}
                  aria-label="Next Page"
                >
                  <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER SECTION */}
      <Footer />

      {/* MOBILE FILTER DRAWER */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${isFilterOpenMobile ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${isFilterOpenMobile ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsFilterOpenMobile(false)}
        />
        
        {/* Drawer sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#F9F7F2] rounded-t-[2rem] flex flex-col shadow-2xl transition-transform duration-300 transform ${isFilterOpenMobile ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-[#EAE6DB] rounded-full mx-auto my-3 flex-shrink-0" />
          
          {/* Header */}
          <div className="px-6 pb-4 border-b border-[#EAE6DB]/60 flex items-center justify-between flex-shrink-0">
            <h3 className="font-serif text-lg font-extrabold text-[#113C27]">Filters</h3>
            <div className="flex items-center gap-4">
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#A84444] hover:underline"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsFilterOpenMobile(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EAE6DB]/40 text-[#113C27]"
              >
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto space-y-8 flex-1">
            {/* Subcategories */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                Subcategories
              </h4>
              <div className="flex flex-col gap-3.5">
                {categories.map((subcat) => {
                  const isChecked = selectedSubcategories.includes(subcat);
                  return (
                    <label key={subcat} className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-[#4B594F] hover:text-[#113C27] transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSubcategoryToggle(subcat)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isChecked
                            ? "bg-[#113C27] border-[#113C27] text-white"
                            : "border-[#EAE6DB] bg-white"
                          }`}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="select-none">{subcat}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            {/* Price Slider */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                Price Range
              </h4>
              <div className="space-y-2">
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1 bg-[#ECE9E0] rounded-lg appearance-none cursor-pointer accent-[#113C27] outline-none"
                />
                <div className="flex justify-between text-[11px] text-[#738276] font-extrabold uppercase tracking-wide">
                  <span>₹100</span>
                  <span className="text-[#113C27] bg-[#C1F2D0]/40 px-2.5 py-0.5 rounded font-extrabold">₹{priceRange} max</span>
                  <span>₹5,000</span>
                </div>
              </div>
            </div>
            
            {/* In Stock */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EAE6DB]/60">
              <span className="text-sm font-semibold text-[#4B594F]">
                Show in stock only
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => {
                    setInStockOnly(!inStockOnly);
                    setCurrentPage(1);
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#ECE9E0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#113C27]"></div>
              </label>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-[#EAE6DB]/60 bg-white/40 flex gap-3 flex-shrink-0">
            <button
              onClick={() => setIsFilterOpenMobile(false)}
              className="flex-1 bg-[#113C27] hover:bg-[#2D6A4F] text-white text-sm font-bold py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] text-center"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SORT DRAWER */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${isSortOpenMobile ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${isSortOpenMobile ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsSortOpenMobile(false)}
        />
        
        {/* Drawer sheet */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#F9F7F2] rounded-t-[2rem] flex flex-col shadow-2xl transition-transform duration-300 transform ${isSortOpenMobile ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-[#EAE6DB] rounded-full mx-auto my-3 flex-shrink-0" />
          
          {/* Header */}
          <div className="px-6 pb-4 border-b border-[#EAE6DB]/60 flex items-center justify-between flex-shrink-0">
            <h3 className="font-serif text-lg font-extrabold text-[#113C27]">Sort By</h3>
            <button
              onClick={() => setIsSortOpenMobile(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EAE6DB]/40 text-[#113C27]"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1 divide-y divide-[#EAE6DB]/40">
            {[
              { value: "Latest", label: "Sort by: Latest" },
              { value: "Price Low to High", label: "Sort by: Price Low to High" },
              { value: "Price High to Low", label: "Sort by: Price High to Low" },
              { value: "Popular", label: "Sort by: Popular" }
            ].map((opt) => {
              const isSelected = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value as any);
                    setIsSortOpenMobile(false);
                  }}
                  className="w-full flex items-center justify-between py-3.5 text-left text-sm font-semibold text-[#4B594F] hover:text-[#113C27] transition-colors"
                >
                  <span className={isSelected ? "text-[#113C27] font-extrabold" : ""}>{opt.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#113C27] stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
