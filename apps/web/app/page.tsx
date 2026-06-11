"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { useCartStore } from "../store/useCartStore";

interface Product {
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
function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  isAnimatingFavorite,
}: {
  product: Product;
  onAddToCart: (weight: "1kg" | "500g" | "250g") => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isAnimatingFavorite: boolean;
}) {
  const [selectedWeight, setSelectedWeight] = useState<"1kg" | "500g" | "250g">("1kg");

  return (
    <div className="bg-white border border-[#EAE6DB]/30 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)] hover:border-[#EAE6DB]/60 transition-all duration-300 group relative">
      
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.isNew && (
          <span className="absolute top-2.5 left-2.5 bg-[#A84444] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
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
          className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md hover:bg-white p-2 rounded-full transition-all shadow-sm active:scale-90 transform z-10"
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

      {/* Local Heart Burst Animation */}
      {isAnimatingFavorite && (
        <div className="absolute top-[42px] right-[42px] pointer-events-none z-20 flex items-center justify-center">
          {/* Big pulsating heart */}
          <svg
            className="w-6 h-6 text-[#A84444] fill-[#A84444] absolute animate-local-heart-burst"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          
          {/* Small floating hearts */}
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

export default function HomePage() {
  // Navigation active state
  const [activeNav, setActiveNav] = useState("Shop");

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Zustand Cart Store connection
  const {
    items,
    favorites,
    animatingProductId,
    addToCart,
    toggleFavorite,
    setAnimatingProductId,
  } = useCartStore();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("filter") === "favorites") {
        setShowFavoritesOnly(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          const element = document.getElementById("products-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      }
    }
  }, []);

  // Hook local timer inside useEffect if animatingProductId is set
  useEffect(() => {
    if (animatingProductId) {
      const timer = setTimeout(() => setAnimatingProductId(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [animatingProductId, setAnimatingProductId]);

  // High-quality category Unsplash URLs
  const imgPulses = "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=400";
  const imgFlours = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400";
  const imgSpices = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400";
  const imgMillets = "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400";
  const imgRava = "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400";
  const imgHoney = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400";
  const imgGhee = "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400";

  // Transcribed 40-product list based on user images
  const products: Product[] = [
    // 1. Dals & Pulses
    { id: "1", name: "Kandipappu", category: "Dals & Pulses", prices: { "1kg": 360, "500g": 180, "250g": 90 }, image: imgPulses, isNew: true },
    { id: "2", name: "Pottu Minapappu", category: "Dals & Pulses", prices: { "1kg": 294, "500g": 147, "250g": 74 }, image: imgPulses },
    { id: "3", name: "Pesalu", category: "Dals & Pulses", prices: { "1kg": 234, "500g": 117, "250g": 59 }, image: imgPulses },
    
    // 2. Flours
    { id: "4", name: "Raagi Pindi", category: "Flours", prices: { "1kg": 144, "500g": 72, "250g": 36 }, image: imgFlours },
    { id: "5", name: "Godhuma Pindi", category: "Flours", prices: { "1kg": 114, "500g": 57, "250g": 29 }, image: imgFlours },
    
    // 3. Spices & Powders
    { id: "6", name: "Bellam Podi", category: "Spices & Powders", prices: { "1kg": 240, "500g": 120, "250g": 60 }, image: imgSpices },
    { id: "7", name: "Pachi Karam", category: "Spices & Powders", prices: { "1kg": 840, "500g": 420, "250g": 210 }, image: imgSpices },
    { id: "8", name: "Sambar Karam", category: "Spices & Powders", prices: { "1kg": 960, "500g": 480, "250g": 240 }, image: imgSpices },
    { id: "9", name: "Munaga Podi", category: "Spices & Powders", prices: { "1kg": 1200, "500g": 600, "250g": 300 }, image: imgSpices },
    { id: "10", name: "Munaga Karam", category: "Spices & Powders", prices: { "1kg": 675, "500g": 338, "250g": 169 }, image: imgSpices },
    { id: "11", name: "Karivepaku Podi", category: "Spices & Powders", prices: { "1kg": 900, "500g": 450, "250g": 225 }, image: imgSpices },
    { id: "12", name: "Karivepaku Karam", category: "Spices & Powders", prices: { "1kg": 675, "500g": 338, "250g": 169 }, image: imgSpices },
    
    // 4. Millets & Grains
    { id: "13", name: "Korralu", category: "Millets & Grains", prices: { "1kg": 162, "500g": 81, "250g": 41 }, image: imgMillets },
    { id: "14", name: "Raagulu", category: "Millets & Grains", prices: { "1kg": 87, "500g": 44, "250g": 22 }, image: imgMillets },
    { id: "15", name: "Arikelu", category: "Millets & Grains", prices: { "1kg": 162, "500g": 81, "250g": 41 }, image: imgMillets },
    { id: "16", name: "Udhalu", category: "Millets & Grains", prices: { "1kg": 180, "500g": 90, "250g": 45 }, image: imgMillets },
    { id: "17", name: "Saamalu", category: "Millets & Grains", prices: { "1kg": 177, "500g": 89, "250g": 44 }, image: imgMillets },
    { id: "18", name: "Andukorralu", category: "Millets & Grains", prices: { "1kg": 372, "500g": 186, "250g": 93 }, image: imgMillets },
    { id: "19", name: "Pacha Jonnalu", category: "Millets & Grains", prices: { "1kg": 147, "500g": 74, "250g": 37 }, image: imgMillets },
    { id: "20", name: "Thella Jonnalu", category: "Millets & Grains", prices: { "1kg": 114, "500g": 57, "250g": 29 }, image: imgMillets },
    
    // 5. Broken Grains (Rava)
    { id: "21", name: "Korra Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 258, "500g": 129, "250g": 65 }, image: imgRava },
    { id: "22", name: "Korra Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 258, "500g": 129, "250g": 65 }, image: imgRava },
    { id: "23", name: "Raagi Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 132, "500g": 66, "250g": 33 }, image: imgRava },
    { id: "24", name: "Raagi Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 138, "500g": 69, "250g": 35 }, image: imgRava },
    { id: "25", name: "Arika Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 228, "500g": 114, "250g": 57 }, image: imgRava },
    { id: "26", name: "Arika Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 228, "500g": 114, "250g": 57 }, image: imgRava },
    { id: "27", name: "Udha Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 228, "500g": 114, "250g": 57 }, image: imgRava },
    { id: "28", name: "Udha Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 264, "500g": 132, "250g": 66 }, image: imgRava },
    { id: "29", name: "Saama Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 264, "500g": 132, "250g": 66 }, image: imgRava },
    { id: "30", name: "Saama Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 264, "500g": 132, "250g": 66 }, image: imgRava },
    { id: "31", name: "Andukorra Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 264, "500g": 132, "250g": 66 }, image: imgRava },
    { id: "32", name: "Andukorra Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 264, "500g": 132, "250g": 66 }, image: imgRava },
    { id: "33", name: "Pacha Jonna Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 234, "500g": 117, "250g": 59 }, image: imgRava },
    { id: "34", name: "Pacha Jonna Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 234, "500g": 117, "250g": 59 }, image: imgRava },
    { id: "35", name: "Thella Jonna Upma Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 108, "500g": 54, "250g": 27 }, image: imgRava },
    { id: "36", name: "Thella Jonna Idly Ravva", category: "Broken Grains (Rava)", prices: { "1kg": 108, "500g": 54, "250g": 27 }, image: imgRava },
    
    // 6. Honey & Ghee
    { id: "37", name: "Wild Forest Honey", category: "Honey & Ghee", prices: { "1kg": 630, "500g": 315, "250g": 158 }, image: imgHoney },
    { id: "38", name: "Jamun Honey", category: "Honey & Ghee", prices: { "1kg": 795, "500g": 398, "250g": 199 }, image: imgHoney },
    { id: "39", name: "Neem Honey", category: "Honey & Ghee", prices: { "1kg": 780, "500g": 390, "250g": 195 }, image: imgHoney },
    { id: "40", name: "Desi Cow Ghee", category: "Honey & Ghee", prices: { "1kg": 6300, "500g": 3150, "250g": 1575 }, image: imgGhee }
  ];

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


  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      
      {/* Dynamic Font Import */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        .font-sans {
          font-family: 'Outfit', sans-serif;
        }
        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes local-heart-burst {
          0% {
            transform: scale(0.3) rotate(0deg);
            opacity: 0;
          }
          30% {
            transform: scale(2.2) rotate(-12deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.8) rotate(8deg);
            opacity: 1;
          }
          100% {
            transform: scale(3.5) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes local-float-up-left {
          0% {
            transform: translate(0, 0) scale(0.8) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translate(-32px, -48px) scale(0.4) rotate(-30deg);
            opacity: 0;
          }
        }
        @keyframes local-float-up-right {
          0% {
            transform: translate(0, 0) scale(0.8) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translate(32px, -44px) scale(0.4) rotate(30deg);
            opacity: 0;
          }
        }
        @keyframes local-float-up-center {
          0% {
            transform: translate(0, 0) scale(0.8) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translate(4px, -56px) scale(0.4) rotate(10deg);
            opacity: 0;
          }
        }
        
        .animate-local-heart-burst {
          animation: local-heart-burst 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-local-float-up-left {
          animation: local-float-up-left 1.1s ease-out forwards;
        }
        .animate-local-float-up-right {
          animation: local-float-up-right 1.2s ease-out forwards;
        }
        .animate-local-float-up-center {
          animation: local-float-up-center 1.0s ease-out forwards;
        }
      `}} />

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
          setShowFavoritesOnly((prev) => {
            const nextVal = !prev;
            if (nextVal) {
              setTimeout(() => {
                const element = document.getElementById("products-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }
            return nextVal;
          });
        }}
      />

      {/* HERO SECTION */}
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/organic_farming_hero.png"
            alt="Organic farming products from Vipaasa Organics"
            className="w-full h-full object-cover object-center scale-105 transform translate-y-[-5%] brightness-[0.85] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-16 z-10 text-white space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-[52px] font-bold leading-[1.15] max-w-xl tracking-tight">
            Directly From Earth&apos;s Lap to Your Home
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-md font-medium text-white/90 leading-relaxed">
            Artisanal organic staples curated from regenerative farms across India.
          </p>
          <div className="pt-2">
            <button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-black/20 transition-all duration-300 transform active:scale-95">
              Explore Harvest
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-16 py-10 space-y-16">
        
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
            
            <a href="#" className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#113C27] hover:opacity-85 transition-opacity whitespace-nowrap">
              <span>View All</span>
              <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
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

        {/* THE VIPAASA PROMISE */}
        <section className="space-y-8">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27] text-center">
            The Vipaasa Promise
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Promise Card 1: Regenerative Sourcing */}
            <div className="md:col-span-3 bg-white border border-[#EAE6DB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-8 min-h-[340px]">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-[#EAF5EC] rounded-full flex items-center justify-center text-[#2D6A4F]">
                  <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.22 5.22l13.56 13.56M18.78 5.22L5.22 18.78" />
                  </svg>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
                  Regenerative Sourcing
                </h4>
                <p className="text-xs sm:text-sm font-medium text-[#5C6E61] leading-relaxed max-w-lg">
                  We don&apos;t just source organic; we partner with farmers who restore the soil. Every purchase supports a cycle of replenishment for our planet.
                </p>
              </div>

              {/* Textured soil image at bottom */}
              <div className="w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-[#EAE6DB]/60 bg-[#ECE9E0]">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600"
                  alt="Organic soil texture"
                  className="w-full h-full object-cover brightness-[0.95] contrast-[0.9]"
                />
              </div>
            </div>

            {/* Promise Card 2: Lab Tested Purity */}
            <div className="md:col-span-2 bg-[#2D6A4F] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-md space-y-6 min-h-[340px]">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20">
                <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>

              <div className="space-y-3 max-w-xs">
                <h4 className="font-serif text-xl sm:text-2xl font-bold">
                  Lab Tested Purity
                </h4>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
                  Every batch undergoes rigorous 14-point testing for heavy metals and pesticides. Clean labels only.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* SPOTLIGHT: SEASONAL LIVING */}
        <section className="bg-white border border-[#EAE6DB] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-sm">
          {/* Left Bowl Image */}
          <div className="h-72 sm:h-96 md:h-auto min-h-[300px] relative">
            <img
              src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600"
              alt="Golden Morning Ritual breakfast bowl"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Right Text Content */}
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-6">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2D6A4F]">
              Seasonal Living
            </span>
            
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#113C27] leading-tight tracking-tight">
              The Golden Morning Ritual
            </h3>

            <p className="text-xs sm:text-sm font-medium text-[#5C6E61] leading-relaxed">
              Discover the healing power of our Lakadong Turmeric and Wild Honey infusion. A traditional tonic reimagined for the modern home.
            </p>

            <div>
              <button className="bg-[#113C27] hover:bg-[#2D6A4F] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-200">
                <span>Read the Recipe</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-[#EAE8E1] border-t border-[#EAE6DB] mt-24 px-6 lg:px-16 py-12 text-[#4B594F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand & Socials */}
          <div className="md:col-span-6 space-y-5">
            <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
            <p className="text-sm leading-relaxed max-w-sm">
              Bringing back the wisdom of the ancients through pure, artisanal, and regenerative organic produce.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
                </svg>
              </a>
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
              <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Company</h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
              <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Join Our Circle newsletter signup */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Join Our Circle</h4>
            <p className="text-xs leading-relaxed">
              Get seasonal harvest updates and organic living tips.
            </p>

            {newsletterSubscribed ? (
              <div className="bg-[#C1F2D0] border border-[#A7F3D0] text-[#113C27] text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Subscribed successfully! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-white border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#113C27] focus:outline-none focus:ring-1 focus:ring-[#113C27] flex-1 font-semibold placeholder-[#738276]"
                />
                <button
                  type="submit"
                  className="bg-[#113C27] hover:bg-[#2D6A4F] text-white p-3 rounded-xl transition-all duration-200"
                  aria-label="Subscribe"
                >
                  <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="max-w-7xl mx-auto border-t border-[#DEDAD0] mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
          &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
        </div>
      </footer>

    </div>
  );
}
