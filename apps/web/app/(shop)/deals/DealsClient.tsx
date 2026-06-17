"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useCartStore } from "../../../store/useCartStore";
import { useAuthStore } from "../../../store/authStore";
import { fetchApi } from "../../../lib/api";
import productsData from "../../../data/products.json";

interface DealProduct {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  image: string;
  dealType: "Flash Sales" | "Combo Bundles" | "Bulk Savings";
  inStock: boolean;
  weight: "1kg" | "500g" | "250g";
  prices: {
    "1kg": number;
    "500g": number;
    "250g": number;
  };
  description: string;
  rating: number;
}

export default function DealsClient() {
  const [mounted, setMounted] = useState(false);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cart/Favorites store
  const { items, favorites, addToCart, toggleFavorite } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  // Filters state
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"Latest" | "Price Low to High" | "Price High to Low" | "Popular">("Latest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Adding to cart feedback track
  const [addingId, setAddingId] = useState<string | null>(null);

  // Timer state for countdown
  const [timeRemaining, setTimeRemaining] = useState("12h 00m 00s");

  const updateTimer = useCallback(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeRemaining("00h 00m 00s");
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [updateTimer]);

  // Fetch real API products or fallback to local productsData
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await fetchApi<{ items: any[] }>("/api/products?limit=100");
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setApiProducts(data.items);
        } else {
          setApiProducts(productsData);
        }
      } catch (err) {
        console.warn("DealsClient: Failed to fetch API products, falling back to local data.", err);
        setApiProducts(productsData);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [token]);

  // Parse products into clean, normalized deals (cohesive with standard UI)
  const dealsData = useMemo(() => {
    if (apiProducts.length === 0) return [];
    
    const dealsList: DealProduct[] = [];

    const findProductByName = (name: string) => {
      return apiProducts.find(p => p.name?.toLowerCase() === name.toLowerCase()) || 
             apiProducts.find(p => p.name?.toLowerCase().includes(name.toLowerCase())) || 
             apiProducts[0];
    };

    // 1. Flash Sales
    const gheeProduct = findProductByName("Desi Cow Ghee");
    if (gheeProduct) {
      const isApiShape = !!gheeProduct.price;
      const basePrice250g = isApiShape ? gheeProduct.price : gheeProduct.prices["250g"];
      dealsList.push({
        id: gheeProduct.id || "desi-cow-ghee-deal",
        name: gheeProduct.name || "Desi Cow Ghee",
        category: gheeProduct.category?.name || gheeProduct.category || "Honey & Ghee",
        originalPrice: isApiShape ? Math.round(basePrice250g * 3.2) : gheeProduct.prices["1kg"],
        dealPrice: isApiShape ? Math.round(basePrice250g * 3.2 * 0.8) : Math.round(gheeProduct.prices["1kg"] * 0.8),
        discountPercentage: 20,
        image: gheeProduct.images?.[0] || gheeProduct.image || "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
        dealType: "Flash Sales",
        inStock: gheeProduct.stockStatus === "IN_STOCK" || gheeProduct.inStock || true,
        weight: "1kg",
        prices: {
          "250g": isApiShape ? basePrice250g : gheeProduct.prices["250g"],
          "500g": isApiShape ? Math.round(basePrice250g * 1.8) : gheeProduct.prices["500g"],
          "1kg": isApiShape ? Math.round(basePrice250g * 3.2 * 0.8) : Math.round(gheeProduct.prices["1kg"] * 0.8)
        },
        description: gheeProduct.description || "100% pure A2 Desi Cow Ghee prepared traditional bilona method.",
        rating: 4.8
      });
    }

    const honeyProduct = findProductByName("Wild Forest Honey");
    if (honeyProduct) {
      const isApiShape = !!honeyProduct.price;
      const basePrice250g = isApiShape ? honeyProduct.price : honeyProduct.prices["250g"];
      dealsList.push({
        id: honeyProduct.id || "wild-honey-deal",
        name: honeyProduct.name || "Wild Forest Honey",
        category: honeyProduct.category?.name || honeyProduct.category || "Honey & Ghee",
        originalPrice: isApiShape ? Math.round(basePrice250g * 1.8) : honeyProduct.prices["500g"],
        dealPrice: isApiShape ? Math.round(basePrice250g * 1.8 * 0.75) : Math.round(honeyProduct.prices["500g"] * 0.75),
        discountPercentage: 25,
        image: honeyProduct.images?.[0] || honeyProduct.image || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
        dealType: "Flash Sales",
        inStock: honeyProduct.stockStatus === "IN_STOCK" || honeyProduct.inStock || true,
        weight: "500g",
        prices: {
          "250g": isApiShape ? basePrice250g : honeyProduct.prices["250g"],
          "500g": isApiShape ? Math.round(basePrice250g * 1.8 * 0.75) : Math.round(honeyProduct.prices["500g"] * 0.75),
          "1kg": isApiShape ? Math.round(basePrice250g * 3.2) : honeyProduct.prices["1kg"]
        },
        description: honeyProduct.description || "Pure raw wild forest honey harvested sustainably from local tribes.",
        rating: 4.7
      });
    }

    const munagaKaram = findProductByName("Munaga Karam") || findProductByName("Munaga Podi");
    if (munagaKaram) {
      const isApiShape = !!munagaKaram.price;
      const basePrice250g = isApiShape ? munagaKaram.price : munagaKaram.prices["250g"];
      dealsList.push({
        id: munagaKaram.id || "munaga-karam-deal",
        name: munagaKaram.name || "Munaga Karam",
        category: munagaKaram.category?.name || munagaKaram.category || "Spices & Powders",
        originalPrice: basePrice250g,
        dealPrice: Math.round(basePrice250g * 0.8),
        discountPercentage: 20,
        image: munagaKaram.images?.[0] || munagaKaram.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400",
        dealType: "Flash Sales",
        inStock: munagaKaram.stockStatus === "IN_STOCK" || munagaKaram.inStock || true,
        weight: "250g",
        prices: {
          "250g": Math.round(basePrice250g * 0.8),
          "500g": isApiShape ? Math.round(basePrice250g * 1.8) : munagaKaram.prices["500g"],
          "1kg": isApiShape ? Math.round(basePrice250g * 3.2) : munagaKaram.prices["1kg"]
        },
        description: munagaKaram.description || "Nutritious moringa leaf spice powder, perfect for daily immune support.",
        rating: 4.6
      });
    }

    // 2. Combo Bundles
    dealsList.push({
      id: "bundle-wellness",
      name: "Organic Wellness Combo",
      category: "Honey & Ghee",
      originalPrice: 950,
      dealPrice: 799,
      discountPercentage: 15,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
      dealType: "Combo Bundles",
      inStock: true,
      weight: "500g",
      prices: {
        "250g": 399,
        "500g": 799,
        "1kg": 1499
      },
      description: "A combination of raw Jamun Honey (250g) and premium Desi Ghee (250g) for your daily health.",
      rating: 4.9
    });

    dealsList.push({
      id: "bundle-millets",
      name: "Conscious Grains Starter Kit",
      category: "Millets & Grains",
      originalPrice: 420,
      dealPrice: 340,
      discountPercentage: 19,
      image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400",
      dealType: "Combo Bundles",
      inStock: true,
      weight: "1kg",
      prices: {
        "250g": 99,
        "500g": 190,
        "1kg": 340
      },
      description: "Clean organic Millets sampler pack featuring 1kg each of Korralu and Raagulu.",
      rating: 4.8
    });

    // 3. Bulk Savings
    const dalProduct = findProductByName("Kandipappu");
    if (dalProduct) {
      const isApiShape = !!dalProduct.price;
      const basePrice250g = isApiShape ? dalProduct.price : dalProduct.prices["250g"];
      dealsList.push({
        id: dalProduct.id || "kandipappu-bulk",
        name: dalProduct.name || "Kandipappu (Toor Dal)",
        category: dalProduct.category?.name || dalProduct.category || "Dals & Pulses",
        originalPrice: isApiShape ? Math.round(basePrice250g * 3.2) : dalProduct.prices["1kg"],
        dealPrice: isApiShape ? Math.round(basePrice250g * 3.2 * 0.85) : Math.round(dalProduct.prices["1kg"] * 0.85),
        discountPercentage: 15,
        image: dalProduct.images?.[0] || dalProduct.image || "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400",
        dealType: "Bulk Savings",
        inStock: dalProduct.stockStatus === "IN_STOCK" || dalProduct.inStock || true,
        weight: "1kg",
        prices: {
          "250g": isApiShape ? basePrice250g : dalProduct.prices["250g"],
          "500g": isApiShape ? Math.round(basePrice250g * 1.8) : dalProduct.prices["500g"],
          "1kg": isApiShape ? Math.round(basePrice250g * 3.2 * 0.85) : Math.round(dalProduct.prices["1kg"] * 0.85)
        },
        description: dalProduct.description || "Unpolished, stone-ground toor dal packed with raw proteins and fiber.",
        rating: 4.7
      });
    }

    const ragiProduct = findProductByName("Raagi Pindi") || findProductByName("Godhuma Pindi");
    if (ragiProduct) {
      const isApiShape = !!ragiProduct.price;
      const basePrice250g = isApiShape ? ragiProduct.price : ragiProduct.prices["250g"];
      dealsList.push({
        id: ragiProduct.id || "ragi-pindi-bulk",
        name: ragiProduct.name || "Raagi Pindi (Millet Flour)",
        category: ragiProduct.category?.name || ragiProduct.category || "Flours",
        originalPrice: isApiShape ? Math.round(basePrice250g * 3.2) : ragiProduct.prices["1kg"],
        dealPrice: isApiShape ? Math.round(basePrice250g * 3.2 * 0.85) : Math.round(ragiProduct.prices["1kg"] * 0.85),
        discountPercentage: 15,
        image: ragiProduct.images?.[0] || ragiProduct.image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400",
        dealType: "Bulk Savings",
        inStock: ragiProduct.stockStatus === "IN_STOCK" || ragiProduct.inStock || true,
        weight: "1kg",
        prices: {
          "250g": isApiShape ? basePrice250g : ragiProduct.prices["250g"],
          "500g": isApiShape ? Math.round(basePrice250g * 1.8) : ragiProduct.prices["500g"],
          "1kg": isApiShape ? Math.round(basePrice250g * 3.2 * 0.85) : Math.round(ragiProduct.prices["1kg"] * 0.85)
        },
        description: ragiProduct.description || "Finely stone-ground nutritious finger millet flour, rich in bone calcium.",
        rating: 4.5
      });
    }

    return dealsList;
  }, [apiProducts]);

  const handleDealTypeToggle = (type: string) => {
    setSelectedDealTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedDealTypes([]);
    setPriceRange(5000);
    setInStockOnly(false);
    setCurrentPage(1);
  };

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return dealsData.filter((deal) => {
      const matchesType =
        selectedDealTypes.length === 0 || selectedDealTypes.includes(deal.dealType);
      
      const price = deal.prices[deal.weight];
      const matchesPrice = price <= priceRange;
      
      const matchesStock = !inStockOnly || deal.inStock;

      return matchesType && matchesPrice && matchesStock;
    });
  }, [selectedDealTypes, priceRange, inStockOnly, dealsData]);

  // Sorted deals
  const sortedDeals = useMemo(() => {
    const dealsCopy = [...filteredDeals];
    if (sortBy === "Latest") {
      return dealsCopy;
    }
    if (sortBy === "Price Low to High") {
      return dealsCopy.sort((a, b) => a.prices[a.weight] - b.prices[b.weight]);
    }
    if (sortBy === "Price High to Low") {
      return dealsCopy.sort((a, b) => b.prices[b.weight] - a.prices[a.weight]);
    }
    if (sortBy === "Popular") {
      return dealsCopy.sort((a, b) => b.rating - a.rating);
    }
    return dealsCopy;
  }, [filteredDeals, sortBy]);

  // Pagination calculations
  const totalItems = sortedDeals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const paginatedDeals = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return sortedDeals.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDeals, activePage]);

  const showingFrom = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(activePage * itemsPerPage, totalItems);

  // Cart helper wrapper
  const handleAddToCart = (product: DealProduct) => {
    setAddingId(product.id);
    const cartPayload = {
      id: product.id,
      name: product.name,
      category: product.category,
      prices: product.prices,
      image: product.image,
      description: product.description
    };
    addToCart(cartPayload, product.weight);
    
    setTimeout(() => {
      setAddingId(null);
    }, 800);
  };

  const handleBuyNow = (product: DealProduct) => {
    const cartPayload = {
      id: product.id,
      name: product.name,
      category: product.category,
      prices: product.prices,
      image: product.image,
      description: product.description
    };
    addToCart(cartPayload, product.weight);
    
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
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        activeNav="Deals"
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
          <span className="text-[#113C27] font-extrabold">Exclusive Deals</span>
        </nav>

        {/* HERO TITLE & DESCRIPTIONS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#EAE6DB] pb-6 gap-6">
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#113C27] tracking-tight">
              Exclusive Deals
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#5C6E61] mt-2 leading-relaxed">
              Curated savings on premium, sun-drenched organic staples.
              <br />
              Supporting local micro-farmers and natural harvesting. Offers refresh in {timeRemaining}.
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
            
            {/* DEAL TYPES SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest text-[#738276] uppercase">
                Deal Types
              </h4>
              <div className="flex flex-col gap-3">
                {["Flash Sales", "Combo Bundles", "Bulk Savings"].map((type) => {
                  const isChecked = selectedDealTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group text-xs sm:text-sm font-semibold text-[#4B594F] hover:text-[#113C27] transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDealTypeToggle(type)}
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
                      <span className="select-none">{type}</span>
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

          </aside>

          {/* PRODUCT GRID SECTION */}
          <div className="flex-1 space-y-10">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : paginatedDeals.length === 0 ? (
              <div className="relative overflow-hidden text-center py-24 rounded-3xl border border-[#EAE6DB]/80 bg-[#FAF9F5] px-6">
                <h3 className="font-serif text-2xl font-extrabold text-[#113C27] mb-3 tracking-tight">
                  No Deals Found
                </h3>
                <p className="text-sm font-medium text-[#738276] max-w-sm mx-auto leading-relaxed mb-8">
                  We are updating our harvest offers. Please check back shortly or adjust your filters.
                </p>
                {(selectedDealTypes.length > 0 || inStockOnly) && (
                  <button
                    onClick={handleResetFilters}
                    className="bg-[#113C27] text-white hover:bg-[#2D6A4F] text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDeals.map((deal) => {
                  const isFavorite = mounted && favorites.includes(deal.id);
                  const price = deal.prices[deal.weight];
                  const isAdding = addingId === deal.id;
                  
                  return (
                    <div
                      key={deal.id}
                      className="bg-white border border-[#EAE6DB]/40 rounded-2xl p-4 flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:border-[#EAE6DB]/80 transition-all duration-300 group relative"
                    >
                      {/* Product Image and Overlay Labels */}
                      <div className="relative w-full aspect-square bg-[#FAF9F5] rounded-xl overflow-hidden mb-4">
                        <Link href={deal.id.startsWith("bundle") ? "#" : `/products/${deal.id}`} className="block w-full h-full relative">
                          <img
                            src={deal.image}
                            alt={deal.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>
                        
                        {/* Organic Label / Custom tag */}
                        <span className="absolute top-2.5 left-2.5 bg-[#A84444] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 select-none shadow-sm uppercase tracking-wide">
                          Save {deal.discountPercentage}%
                        </span>
                        
                        {/* Favorite button */}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(deal.id)}
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
                              {deal.category}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                deal.inStock
                                  ? "bg-[#C1F2D0]/50 text-[#113C27]"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {deal.inStock ? deal.dealType : "Out of Stock"}
                            </span>
                          </div>
                          
                          <Link href={deal.id.startsWith("bundle") ? "#" : `/products/${deal.id}`} className="block">
                            <h4 className="font-serif text-base font-extrabold text-[#113C27] tracking-tight mt-1 hover:text-[#2d6a4f] transition-colors leading-tight">
                              {deal.name}
                            </h4>
                          </Link>
                          
                          {/* Rating Review Stars */}
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center text-[#F5A623]">
                              {[...Array(5)].map((_, i) => {
                                const starVal = i + 1;
                                const isFull = starVal <= Math.floor(deal.rating);
                                const isHalf = !isFull && starVal - 0.5 <= deal.rating;
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
                              {deal.rating.toFixed(1)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#738276] font-medium mt-1.5 line-clamp-2">
                            {deal.description}
                          </p>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-[#EAE6DB]/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-[#113C27]">
                                ₹{price}
                              </span>
                              <span className="text-xs text-[#738276] line-through">
                                ₹{deal.originalPrice}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#738276] font-bold uppercase tracking-wider bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE6DB]/60">
                              {deal.weight}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {/* Buy Now button */}
                            <button
                              onClick={() => handleBuyNow(deal)}
                              disabled={!deal.inStock}
                              className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 transform text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy Now
                            </button>

                            {/* Add to Cart button */}
                            <button
                              onClick={() => handleAddToCart(deal)}
                              disabled={!deal.inStock || isAdding}
                              className={`flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 transform whitespace-nowrap ${
                                !deal.inStock
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : isAdding
                                  ? "bg-[#2D6A4F] text-white"
                                  : "bg-[#113C27] text-white hover:bg-[#2D6A4F]"
                              }`}
                              aria-label={`Add ${deal.name} to cart`}
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
