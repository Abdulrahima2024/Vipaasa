"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../../store/useCartStore";
import productsData from "../../data/products.json";

export interface Product {
  id: string;
  name: string;
  category: string;
  prices: {
    "1kg": number;
    "500g": number;
    "250g": number;
  };
  image: string;
  isNew?: boolean;
}

// Separate Product Card Component to handle local weight selection state
export function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isAnimatingFavorite,
  onRemoveFavorite,
}: {
  product: Product;
  onAddToCart: (weight: "1kg" | "500g" | "250g") => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isAnimatingFavorite: boolean;
  onRemoveFavorite?: () => void;
}) {
  const [selectedWeight, setSelectedWeight] = useState<"1kg" | "500g" | "250g">("1kg");

  return (
    <div className="bg-white border border-[#EAE6DB]/30 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)] hover:border-[#EAE6DB]/60 transition-all duration-300 group relative">
      
      {/* Product Image using next/image */}
      <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.isNew && (
          <span className="absolute top-2.5 left-2.5 bg-[#A84444] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10">
            New
          </span>
        )}
        
        {/* Favorite Heart Button Overlay */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md hover:bg-white p-2 rounded-full transition-all shadow-sm active:scale-95 transform z-10"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-4 h-4 stroke-[2.5] transition-colors duration-300"
            fill={isFavorite ? "#A84444" : "none"}
            stroke={isFavorite ? "#A84444" : "#113C27"}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </div>

      {/* Product Title and Category */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#738276]">
            {product.category}
          </span>
          <h4 className="font-sans text-sm sm:text-base font-bold text-[#113C27] tracking-tight mt-0.5 leading-tight">
            {product.name}
          </h4>
          
          {/* Rating Review Stars (Yellowish Gold) */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center text-[#F5A623]">
              {[...Array(5)].map((_, i) => {
                const starVal = i + 1;
                // Generate a stable rating between 4.5 and 4.9 based on product ID
                const prodRating = product.rating || (4.5 + (parseInt(product.id) % 5) * 0.1);
                const isFull = starVal <= Math.floor(prodRating);
                const isHalf = !isFull && starVal - 0.5 <= prodRating;
                return (
                  <svg
                    key={i}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current"
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
              {(product.rating || (4.5 + (parseInt(product.id) % 5) * 0.1)).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Weight Toggle Buttons */}
        <div className="flex gap-1.5 p-1 bg-[#ECE9E0]/60 rounded-lg">
          {(["250g", "500g", "1kg"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWeight(w)}
              className={`flex-1 text-[10px] font-extrabold py-1 px-1.5 rounded transition-all whitespace-nowrap ${
                selectedWeight === w
                  ? "bg-white text-[#113C27] shadow-sm"
                  : "text-[#5C6E61] hover:text-[#113C27]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="font-sans text-base sm:text-lg font-bold text-[#113C27] tabular-nums">
              ₹{product.prices[selectedWeight]}
            </span>
            <span className="text-[9px] text-[#738276] font-medium leading-none">
              ({selectedWeight})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Remove from Favorites button — only shown when onRemoveFavorite is passed */}
            {onRemoveFavorite && (
              <button
                type="button"
                onClick={onRemoveFavorite}
                title="Remove from favorites"
                aria-label={`Remove ${product.name} from favorites`}
                className="bg-[#FEF2F2] text-[#A84444] hover:bg-[#A84444] hover:text-white border border-[#F5C6C6] hover:border-[#A84444] p-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95 transform"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}

            {/* Add to Cart button */}
            <button
              onClick={() => onAddToCart(selectedWeight)}
              className="bg-[#113C27] text-white hover:bg-[#2D6A4F] p-2.5 rounded-xl transition-colors shadow-sm active:scale-95 transform"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Local Heart Burst Animation */}
      {isAnimatingFavorite && (
        <div className="absolute top-[42px] right-[42px] pointer-events-none z-20 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-[#A84444] fill-[#A84444] absolute animate-local-heart-burst"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          
          <span className="absolute animate-local-float-up-left" style={{ animationDelay: '0.1s' }}>
            <svg className="w-2.5 h-2.5 text-[#A84444] fill-[#A84444]" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          </span>
          <span className="absolute animate-local-float-up-right" style={{ animationDelay: '0.2s' }}>
            <svg className="w-3.5 h-3.5 text-[#C55353] fill-[#C55353]" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          </span>
          <span className="absolute animate-local-float-up-center" style={{ animationDelay: '0.0s' }}>
            <svg className="w-2.5 h-2.5 text-[#A84444] fill-[#A84444]" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          </span>
        </div>
      )}

    </div>
  );
}

interface ProductListingProps {
  searchQuery: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProductListing({
  searchQuery,
  selectedCategory,
  setSelectedCategory,
  showFavoritesOnly,
  setShowFavoritesOnly,
}: ProductListingProps) {
  
  const products = productsData as Product[];

  // Zustand Cart Store connection
  const {
    favorites,
    animatingProductId,
    addToCart,
    toggleFavorite,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // List of aggregated category values
  const categories = [
    { name: "All", label: "All Categories" },
    { name: "Dals & Pulses", label: "Dals & Pulses" },
    { name: "Flours", label: "Flours" },
    { name: "Spices & Powders", label: "Spices & Powders" },
    { name: "Millets & Grains", label: "Millets & Grains" },
    { name: "Broken Grains (Rava)", label: "Broken Grains (Rava)" },
    { name: "Honey & Ghee", label: "Honey & Ghee" }
  ];

  // Filter products based on search input, active category pill, and favorites filter
  const filteredProducts = products.filter((product) => {
    const matchesFavorites = !showFavoritesOnly || favorites.includes(product.id);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFavorites && matchesCategory && matchesSearch;
  });

  // By default, under "All Categories", display only the best 4 products (when search is empty and favorites only is false)
  const displayedProducts = (selectedCategory === "All" && searchQuery === "" && !showFavoritesOnly)
    ? [
        products.find(p => p.name === "Kandipappu"),
        products.find(p => p.name === "Korralu"),
        products.find(p => p.name === "Wild Forest Honey"),
        products.find(p => p.name === "Desi Cow Ghee")
      ].filter((p): p is Product => !!p)
    : filteredProducts;

  return (
    <div className="space-y-12">
      {/* CATEGORY PILL FILTER */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name && !showFavoritesOnly;
          return (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setShowFavoritesOnly(false);
              }}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? "bg-[#C1F2D0] border-[#C1F2D0] text-[#113C27]"
                  : "bg-transparent border-[#EAE6DB] text-[#4B594F] hover:border-[#738276] hover:text-[#113C27]"
              }`}
            >
              {cat.name === "All" && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
              <span>{cat.label}</span>
              {cat.name === "All" && (
                <svg className="w-3 h-3 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* PRODUCTS LIST */}
      <section id="products-section" className="space-y-6">
        <div className="flex justify-between items-end border-b border-[#EAE6DB] pb-4">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27]">
              {showFavoritesOnly ? "Your Favorites" : "New Arrivals"}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#738276] mt-1">
              {showFavoritesOnly
                ? "Products you've favorited across our harvest catalog."
                : "The latest seasonal harvests from our trusted small-scale farmers."}
            </p>
          </div>
          
          <Link href="/categories" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#113C27] hover:opacity-85 transition-opacity whitespace-nowrap">
            <span>View All</span>
            <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#F6F4EC]/40 rounded-3xl border border-[#EAE6DB]/60">
            <svg className="w-12 h-12 text-[#738276] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <h4 className="font-serif text-lg font-bold text-[#113C27] mb-1">
              {showFavoritesOnly ? "No favorites yet" : "No products found"}
            </h4>
            <p className="text-xs text-[#738276]">
              {showFavoritesOnly
                ? "Click the heart button on any product card to save it here."
                : "Try refining your search or choosing another category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(weight) => addToCart(product, weight)}
                isFavorite={mounted && favorites.includes(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                isAnimatingFavorite={animatingProductId === product.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
