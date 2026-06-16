"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/authStore";

// Mock products representing the curated Pantry Essentials catalog
interface CategoryProduct {
  id: string;
  name: string;
  category: "Dals & Pulses" | "Flours" | "Spices & Powders" | "Millets & Grains" | "Broken Grains (Rava)" | "Honey & Ghee";
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

export const CATEGORY_PRODUCTS: CategoryProduct[] = [
  {
    id: "pe-1",
    name: "Golden Turmeric",
    category: "Spices & Powders",
    prices: { "250g": 345, "500g": 650, "1kg": 1200 },
    weight: "250g",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    tag: "USDA Organic",
    description: "250g • High Curcumin Content",
    inStock: true,
    rating: 4.9,
    createdAt: "2026-06-01"
  },
  {
    id: "pe-2",
    name: "Wood-Pressed Coconut Oil",
    category: "Honey & Ghee",
    prices: { "250g": 360, "500g": 680, "1kg": 1300 },
    weight: "500g",
    image: "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&q=80&w=600",
    tag: "In Stock",
    description: "500ml • Cold-pressed",
    inStock: true,
    rating: 4.8,
    createdAt: "2026-06-02"
  },
  {
    id: "pe-3",
    name: "Snow-fed Walnuts",
    category: "Millets & Grains",
    prices: { "250g": 520, "500g": 980, "1kg": 1800 },
    weight: "250g",
    image: "https://images.unsplash.com/photo-1585445490387-f47934b73b54?auto=format&fit=crop&q=80&w=600",
    tag: "Premium",
    description: "200g • Extra Light Halves",
    inStock: true,
    rating: 4.7,
    createdAt: "2026-06-03"
  },
  {
    id: "pe-4",
    name: "Vedic A2 Desi Ghee",
    category: "Honey & Ghee",
    prices: { "250g": 680, "500g": 1250, "1kg": 2400 },
    weight: "500g",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=600",
    tag: "Bilona Churned",
    description: "500ml • Traditional Method",
    inStock: true,
    rating: 4.95,
    createdAt: "2026-06-04"
  },
  {
    id: "pe-5",
    name: "Long Grain Basmati Rice",
    category: "Millets & Grains",
    prices: { "250g": 70, "500g": 130, "1kg": 225 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
    tag: "Aged 2 Years",
    description: "1kg • 2-Year Aged",
    inStock: true,
    rating: 4.6,
    createdAt: "2026-06-05"
  },
  {
    id: "pe-6",
    name: "Wild Forest Honey",
    category: "Honey & Ghee",
    prices: { "250g": 480, "500g": 890, "1kg": 1700 },
    weight: "500g",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
    tag: "Raw & Unfiltered",
    description: "500g • Cold-processed",
    inStock: true,
    rating: 4.9,
    createdAt: "2026-06-06"
  },
  {
    id: "pe-7",
    name: "Kandipappu",
    category: "Dals & Pulses",
    prices: { "250g": 90, "500g": 180, "1kg": 360 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400",
    tag: "Best Seller",
    description: "1kg • Organic Pigeon Peas",
    inStock: true,
    rating: 4.8,
    createdAt: "2026-06-07"
  },
  {
    id: "pe-8",
    name: "Pottu Minapappu",
    category: "Dals & Pulses",
    prices: { "250g": 74, "500g": 147, "1kg": 294 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400",
    tag: "Unpolished",
    description: "1kg • Split Black Gram",
    inStock: true,
    rating: 4.7,
    createdAt: "2026-06-08"
  },
  {
    id: "pe-9",
    name: "Pesalu",
    category: "Dals & Pulses",
    prices: { "250g": 59, "500g": 117, "1kg": 234 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400",
    tag: "Rich Protein",
    description: "1kg • Split Green Gram",
    inStock: true,
    rating: 4.65,
    createdAt: "2026-06-09"
  },
  {
    id: "pe-10",
    name: "Raagi Pindi",
    category: "Flours",
    prices: { "250g": 36, "500g": 72, "1kg": 144 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    tag: "Gluten-Free",
    description: "1kg • Sprouted Ragi Flour",
    inStock: true,
    rating: 4.8,
    createdAt: "2026-06-10"
  },
  {
    id: "pe-11",
    name: "Godhuma Pindi",
    category: "Flours",
    prices: { "250g": 29, "500g": 57, "1kg": 114 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
    tag: "Stone Ground",
    description: "1kg • Whole Wheat Flour",
    inStock: true,
    rating: 4.7,
    createdAt: "2026-06-11"
  },
  {
    id: "pe-12",
    name: "Bellam Podi",
    category: "Spices & Powders",
    prices: { "250g": 60, "500g": 120, "1kg": 240 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400",
    tag: "Chemical Free",
    description: "1kg • Jaggery Powder",
    inStock: true,
    rating: 4.6,
    createdAt: "2026-06-12"
  },
  {
    id: "pe-13",
    name: "Pachi Karam",
    category: "Spices & Powders",
    prices: { "250g": 210, "500g": 420, "1kg": 840 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400",
    tag: "Pure Spicy",
    description: "1kg • Raw Chilli Powder",
    inStock: true,
    rating: 4.7,
    createdAt: "2026-06-13"
  },
  {
    id: "pe-14",
    name: "Raagulu",
    category: "Millets & Grains",
    prices: { "250g": 22, "500g": 44, "1kg": 87 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400",
    tag: "Whole Grain",
    description: "1kg • Whole Finger Millets",
    inStock: true,
    rating: 4.8,
    createdAt: "2026-06-14"
  },
  {
    id: "pe-15",
    name: "Arikelu",
    category: "Millets & Grains",
    prices: { "250g": 41, "500g": 81, "1kg": 162 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400",
    tag: "Organic",
    description: "1kg • Kodo Millet Grains",
    inStock: true,
    rating: 4.75,
    createdAt: "2026-06-15"
  },
  {
    id: "pe-16",
    name: "Korra Upma Ravva",
    category: "Broken Grains (Rava)",
    prices: { "250g": 65, "500g": 129, "1kg": 258 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
    tag: "Fiber Rich",
    description: "1kg • Foxtail Millet Rava",
    inStock: true,
    rating: 4.7,
    createdAt: "2026-06-16"
  },
  {
    id: "pe-17",
    name: "Korra Idly Ravva",
    category: "Broken Grains (Rava)",
    prices: { "250g": 65, "500g": 129, "1kg": 258 },
    weight: "1kg",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400",
    tag: "High Nutrient",
    description: "1kg • Foxtail Millet Idli Rava",
    inStock: true,
    rating: 4.65,
    createdAt: "2026-06-17"
  },
  {
    id: "pe-18",
    name: "Jamun Honey",
    category: "Honey & Ghee",
    prices: { "250g": 199, "500g": 398, "1kg": 795 },
    weight: "500g",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
    tag: "Medicinal",
    description: "500g • Jamun Wood Honey",
    inStock: true,
    rating: 4.8,
    createdAt: "2026-06-18"
  }
];

export default function CategoriesClient() {
  const [mounted, setMounted] = useState(false);

  // Cart/Favorites store
  const { items, favorites, addToCart, toggleFavorite } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Search input query
  const [searchQuery, setSearchQuery] = useState("");

  // Filters state
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

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
  }, []);

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

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return CATEGORY_PRODUCTS.filter((product) => {
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
  }, [selectedSubcategories, priceRange, inStockOnly, searchQuery]);

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

            <div className="relative flex items-center">
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

        {/* WORKSPACE CONTENT GRID */}
        <div className="flex flex-col md:flex-row gap-10 mt-2">
          
          {/* LEFT FILTERS SIDEBAR */}
          <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 self-start bg-white md:bg-transparent p-5 md:p-0 rounded-2xl border border-[#EAE6DB]/60 md:border-none">
            
            {/* SUBCATEGORIES SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                Subcategories
              </h4>
              <div className="flex flex-col gap-3">
                {[
                  "Dals & Pulses",
                  "Flours",
                  "Spices & Powders",
                  "Millets & Grains",
                  "Broken Grains (Rava)",
                  "Honey & Ghee"
                ].map((subcat) => {
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
                        className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                          isChecked
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
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-2xl border border-[#EAE6DB]/60 px-6 max-w-xl mx-auto">
                <svg className="w-10 h-10 text-[#738276] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <h4 className="font-serif text-lg font-bold text-[#113C27] mb-1">
                  No products found
                </h4>
                <p className="text-xs text-[#738276] font-medium max-w-sm mx-auto mb-6">
                  We couldn't find any staples that match your current filter selections. Try clearing them to see all.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#113C27] text-white hover:bg-[#2D6A4F] text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => {
                  const isFavorite = mounted && favorites.includes(product.id);
                  const price = product.prices[product.weight];
                  const isAdding = addingId === product.id;
                  
                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-[#EAE6DB]/40 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:border-[#EAE6DB]/80 transition-all duration-300 group relative"
                    >
                      {/* Product Image and Overlay Labels */}
                      <div className="relative w-full aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden mb-4">
                        <Link href={`/products/${product.id}`} className="block w-full h-full relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
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
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                product.inStock
                                  ? "bg-[#C1F2D0]/50 text-[#113C27]"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                          
                          <Link href={`/products/${product.id}`} className="block">
                            <h4 className="font-serif text-base font-extrabold text-[#113C27] tracking-tight mt-1 hover:text-[#2d6a4f] transition-colors leading-tight">
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
                            <span className="text-base sm:text-lg font-bold text-[#113C27]">
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
                              className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 transform text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy Now
                            </button>

                            {/* Add to Cart button */}
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.inStock || isAdding}
                              className={`flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 transform whitespace-nowrap ${
                                !product.inStock
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
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                  </svg>
                                  <span>Add</span>
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
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activePage === 1
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
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                        isActive
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
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                    activePage === totalPages
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

    </div>
  );
}
