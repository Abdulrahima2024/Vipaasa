"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { parseEmojiImage } from "../../../../lib/image";
import { 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Check, 
  ChevronRight, 
  Star, 
  Loader2, 
  ShoppingBag,
  ArrowLeft,
  Info
} from "lucide-react";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { useCartStore } from "../../../../store/useCartStore";
import { useAuthStore } from "../../../../store/authStore";
import { fetchApi } from "../../../../lib/api";

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
  rating?: number;
  variants?: any[];
}

// Unsplash images helper to populate alternative gallery pictures dynamically
const getAlternativeImages = (product: Product): string[] => {
  const main = product.image;
  const category = product.category.toLowerCase();
  
  if (category.includes("spices") || product.name.toLowerCase().includes("turmeric") || product.name.toLowerCase().includes("karam") || product.name.toLowerCase().includes("podi")) {
    return [
      main,
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600", // Spices sack
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=600"  // Spice layout
    ];
  }
  if (category.includes("honey") || product.name.toLowerCase().includes("honey")) {
    return [
      main,
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600", // Honey dipper
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600"  // Herb layout
    ];
  }
  if (category.includes("ghee") || product.name.toLowerCase().includes("ghee") || category.includes("oil")) {
    return [
      main,
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=600", // Ghee bowl
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600"  // Rustic oil bottle
    ];
  }
  if (category.includes("grains") || category.includes("pulses") || category.includes("millets") || category.includes("dals") || product.name.toLowerCase().includes("pappu") || product.name.toLowerCase().includes("lu")) {
    return [
      main,
      "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600", // Grains fields
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"  // Wheat flour/baking
    ];
  }
  if (category.includes("flours") || product.name.toLowerCase().includes("pindi")) {
    return [
      main,
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600", // Flour baking
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600"  // Raw millets
    ];
  }
  return [
    main,
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600"
  ];
};

// Generates dynamic descriptions and feature points based on category metadata
const getProductDetails = (product: Product) => {
  const name = product.name;
  
  if (name.toLowerCase().includes("turmeric") || name.toLowerCase().includes("karam") || name.toLowerCase().includes("podi")) {
    return {
      description: "Premium high-curcumin turmeric harvested from the hills of Jaintia. Earthy, aromatic, and ethically sourced.",
      longDescription: "Sourced directly from the pristine Jaintia Hills of Meghalaya, our Lakadong Turmeric is renowned for its exceptionally high curcumin content (averaging 7-9%). Unlike commercial varieties, this artisanal spice is traditionally stone-ground to preserve its essential oils and medicinal properties.",
      bullets: [
        "Rich in Curcumin (7-9%) for superior health benefits.",
        "Non-GMO, No additives, No synthetic fertilizers used.",
        "Vacuum packed to ensure maximum freshness and potency."
      ]
    };
  }
  if (name.toLowerCase().includes("honey")) {
    return {
      description: "Pure, raw, forest-fresh honey gathered from medicinal wildflower blossoms. Golden, thick, and unprocessed.",
      longDescription: "Gathered from nectar in deep, unpolluted forest reserves, our Raw Forest Honey is filtered without high-heat pasteurization, leaving all beneficial enzymes, pollens, and organic minerals completely active.",
      bullets: [
        "100% Raw, unfiltered honey to maintain natural medicinal value.",
        "Cold-extracted to safeguard anti-bacterial qualities.",
        "Directly gathered from wild hives, promoting forest livelihoods."
      ]
    };
  }
  if (name.toLowerCase().includes("ghee") || name.toLowerCase().includes("oil")) {
    return {
      description: "Wood-pressed and hand-churned using ancient Vedic processes for maximum purity.",
      longDescription: "Prepared using the traditional Bilona method from grass-fed cows' curd, our Ghee and wood-pressed oils offer unmatched aroma and pure fats that boost immunity and support intestinal digestion.",
      bullets: [
        "Stone-ground or wood-pressed extraction at low temperatures.",
        "Prepared from organic grass-fed cow milk fat or selected seeds.",
        "Free from preservatives, trans fats, and artificial color elements."
      ]
    };
  }
  return {
    description: "Ethically grown, stone-milled, and unpolished agricultural staple packed with natural fiber.",
    longDescription: "Sustainably harvested by small-scale farmers in India, our grains and pulses are processed traditionally to retain their unpolished outer bran layers, rich in plant proteins and low-GI slow carbs.",
    bullets: [
      "Unpolished grains retain rich minerals and complex fiber layers.",
      "100% natural, certified pesticide-free, and chemical-free.",
      "Sourced direct from regenerative soil-friendly small farm grids."
    ]
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const { items, favorites, addToCart, toggleFavorite } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<"250g" | "500g" | "1kg">("250g");
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // API state for this product
  const [product, setProduct] = useState<Product | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiNotFound, setApiNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch product from API
  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    async function loadProduct() {
      setApiLoading(true);
      setApiNotFound(false);
      try {
        const raw = await fetchApi<any>(`/api/products/${id}`);
        if (!raw || !raw.id) {
          setApiNotFound(true);
          setProduct(null);
          return;
        }
        const prices: { "1kg": number; "500g": number; "250g": number } = {
          "250g": Math.round(raw.price),
          "500g": Math.round(raw.price * 1.8),
          "1kg": Math.round(raw.price * 3.2),
        };

        if (raw.variants && raw.variants.length > 0) {
          raw.variants.forEach((v: any) => {
            if (v.pricing && v.pricing.basePrice) {
              const basePriceNum = Math.round(parseFloat(v.pricing.basePrice.toString()));
              if (v.weightGrams === 250) {
                prices["250g"] = basePriceNum;
              } else if (v.weightGrams === 500) {
                prices["500g"] = basePriceNum;
              } else if (v.weightGrams === 1000) {
                prices["1kg"] = basePriceNum;
              }
            }
          });
        }

        const rawImg = raw.images && raw.images[0];
        const imageUrl = rawImg ? (typeof rawImg === "string" ? rawImg : rawImg.url) : "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600";

        const mapped: Product = {
          id: raw.id,
          name: raw.name,
          category: raw.category?.name || "General",
          prices,
          image: imageUrl,
          isNew: raw.stockStatus === "IN_STOCK",
          rating: 4.5 + (parseInt((raw.id || "0").replace(/\D/g, "") || "0") % 5) * 0.1,
          variants: raw.variants,
        };
        setProduct(mapped);
      } catch (err: any) {
        console.error("ProductDetailPage: failed to fetch product", err);
        setApiNotFound(true);
        setProduct(null);
      } finally {
        setApiLoading(false);
      }
    }
    loadProduct();
  }, [params.id, token]);

  // Gallery Active Image
  const gallery = useMemo(() => {
    if (!product) return [];
    return getAlternativeImages(product);
  }, [product]);

  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (gallery.length > 0) {
      setActiveImage(gallery[0]);
    }
  }, [gallery]);

  const details = useMemo(() => {
    if (!product) return null;
    return getProductDetails(product);
  }, [product]);

  // Favorites Helper
  const isFavorite = useMemo(() => {
    if (!mounted || !product) return false;
    return favorites.includes(product.id);
  }, [favorites, product, mounted]);

  // Loading state
  if (!mounted || apiLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#113C27] animate-spin" />
          <span className="text-sm font-semibold text-[#5C6E61]">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (apiNotFound || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
        <Header showSearch={true} />
        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center">
          <Info className="w-16 h-16 text-[#738276] mb-4" />
          <h1 className="font-serif text-3xl font-bold text-[#113C27] mb-2">Product Not Found</h1>
          <p className="text-sm text-[#5C6E61] max-w-md mb-8 leading-relaxed">
            The seasonal harvest you are looking for is currently unavailable or the link might have expired.
          </p>
          <Link
            href="/categories"
            className="bg-[#1B4332] text-white hover:bg-[#113C27] font-bold px-8 py-3.5 rounded-xl transition-all shadow-md text-sm"
          >
            Explore Catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const price = product.prices[selectedWeight];

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const shareData = {
        title: product?.name || 'Vipaasa Organics',
        text: `Check out ${product?.name} at Vipaasa Organics!`,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleAddToCartClick = () => {
    addToCart(product, selectedWeight, quantity);
    setToastMessage(`Added ${quantity} x ${product.name} (${selectedWeight}) to your basket`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNowClick = () => {
    addToCart(product, selectedWeight, quantity);
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      
      {/* Premium Fonts Import */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* Navigation Header */}
      <Header
        showSearch={true}
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
      />

      {/* Main Content Layout */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-16 py-8">
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" className="text-[11px] font-extrabold tracking-wider flex items-center gap-2 text-[#738276] uppercase mb-8">
          <Link href="/" className="hover:text-[#113C27] transition-colors">
            Home
          </Link>
          <span className="text-gray-400 font-light text-[9px]">&gt;</span>
          <Link href="/categories" className="hover:text-[#113C27] transition-colors">
            Categories
          </Link>
          <span className="text-gray-400 font-light text-[9px]">&gt;</span>
          <span className="hover:text-[#113C27] transition-colors cursor-pointer">{product.category}</span>
          <span className="text-gray-400 font-light text-[9px]">&gt;</span>
          <span className="text-[#113C27] font-extrabold truncate">{product.name}</span>
        </nav>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: MULTI-IMAGE VIEWPORT GALLERY (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            
            {/* Thumbnails Sidebar - Ordered vertically on desktop, horizontally on mobile */}
            <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 justify-center md:justify-start">
              {gallery.map((imgUrl, index) => {
                const isActive = imgUrl === activeImage;
                const emojiInfo = parseEmojiImage(imgUrl);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                      isActive 
                        ? "border-[#1B4332] shadow-[0_4px_12px_rgba(27,67,50,0.08)] scale-98"
                        : "border-[#EAE6DB] hover:border-[#738276]/60"
                    }`}
                  >
                    {emojiInfo.isEmoji ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-3xl select-none"
                        style={{ backgroundColor: emojiInfo.bgColor }}
                      >
                        {emojiInfo.emoji}
                      </div>
                    ) : (
                      <img
                        src={emojiInfo.imageUrl}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Interactive Screen Viewport */}
            <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden border border-[#EAE6DB]/40 shadow-sm order-1 md:order-2 bg-white">
              {activeImage && (() => {
                const emojiInfo = parseEmojiImage(activeImage);
                return emojiInfo.isEmoji ? (
                  <div
                    className="w-full h-full flex items-center justify-center text-7xl select-none transition-transform duration-700 hover:scale-105"
                    style={{ backgroundColor: emojiInfo.bgColor }}
                  >
                    {emojiInfo.emoji}
                  </div>
                ) : (
                  <img
                    src={emojiInfo.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                );
              })()}

              {/* Heart/Favorite Toggle Overlay */}
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(product.id);
                  const isNowFavorite = !favorites.includes(product.id);
                  setToastMessage(isNowFavorite ? "Product added into your Wishlist" : "Product removed from your Wishlist");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full transition-all shadow-md active:scale-90 transform z-10"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className="w-5 h-5 transition-colors duration-300"
                  fill={isFavorite ? "#A84444" : "none"}
                  stroke={isFavorite ? "#A84444" : "#113C27"}
                  strokeWidth={2.5}
                />
              </button>

              {/* Share/Link Copy Button Overlay */}
              <button
                type="button"
                onClick={handleShare}
                className="absolute top-20 right-4 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full transition-all shadow-md active:scale-90 transform z-10"
                aria-label="Share product details"
                title={copiedLink ? "Link Copied!" : "Copy Link"}
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-[#2D6A4F]" strokeWidth={3} />
                ) : (
                  <Share2 className="w-5 h-5 text-[#113C27]" strokeWidth={2.5} />
                )}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE INFORMATION (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Top Row: Certification & Stock status */}
            <div className="flex items-center gap-3">
              <span className="bg-[#C1F2D0] text-[#113C27] text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase select-none">
                Certified Organic
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-bold select-none">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>In-stock</span>
              </div>
            </div>

            {/* Product Title and short description */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#113C27] tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-[#5C6E61] text-sm leading-relaxed font-medium">
                {details?.description}
              </p>
            </div>

            {/* Dynamic Price presentation */}
            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-serif text-3xl font-extrabold text-[#113C27] tabular-nums">
                ₹{price.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-[#738276]">
                / {selectedWeight} Pack
              </span>
            </div>

            {/* Price dynamic notice info */}
            <div className="border-t border-b border-[#EAE6DB]/60 py-4 space-y-4">
              {/* Weight selection toggle buttons */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#738276] font-extrabold mb-2.5">
                  Package Size
                </label>
                <div className="flex gap-2">
                  {(["250g", "500g", "1kg"] as const).map((w) => {
                    const isSelected = selectedWeight === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`flex-1 text-xs font-bold py-3 px-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#113C27] border-[#113C27] text-white shadow-sm"
                            : "bg-white border-[#EAE6DB] text-[#4B594F] hover:border-[#738276]"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#738276] font-extrabold">
                  Quantity
                </span>
                <div className="flex items-center border border-[#EAE6DB] rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#5C6E61] hover:text-[#113C27] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="w-10 text-center font-bold text-[#113C27] text-sm tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#5C6E61] hover:text-[#113C27] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="flex items-center justify-center gap-2 bg-[#113C27] hover:bg-[#2D6A4F] text-white py-4 rounded-2xl font-bold transition-all shadow-md shadow-green-950/10 active:scale-[0.98] text-sm"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNowClick}
                className="bg-[#F5A623] hover:bg-[#E09015] text-[#113C27] py-4 rounded-2xl font-bold transition-all shadow-md shadow-amber-950/5 active:scale-[0.98] text-sm text-center"
              >
                Buy Now
              </button>
            </div>

            {/* Trust highlights section */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white border border-[#EAE6DB]/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#2D6A4F] flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3zm-1 15H9v-2h2v2zm0-4H9V7h2v7zm4 4h-2v-2h2v2zm0-4h-2V7h2v7z" fill="none" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-[#113C27]">Certified Organic</span>
                  <span className="block text-[10px] text-[#738276] font-semibold">100% Natural Origins</span>
                </div>
              </div>

              <div className="bg-white border border-[#EAE6DB]/40 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF5EC] flex items-center justify-center text-[#2D6A4F] flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-[#113C27]">Ethically Traded</span>
                  <span className="block text-[10px] text-[#738276] font-semibold">Direct from Farmers</span>
                </div>
              </div>
            </div>

            {/* Product details section */}
            <div className="pt-4 border-t border-[#EAE6DB]/60 space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#113C27]">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6E61] leading-relaxed font-semibold">
                {details?.longDescription}
              </p>
              
              {/* Bullets with checked vectors */}
              <ul className="space-y-2.5 pt-2">
                {details?.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#1F3E2F]">
                    <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#2D6A4F] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* Footer component */}
      <Footer />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#113C27] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-[#C1F2D0]" />
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
