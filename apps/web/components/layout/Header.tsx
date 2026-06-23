"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Flame } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/useCartStore";
import { fetchApi } from "../../lib/api";
import CartDrawer from "../cart/CartDrawer";

interface HeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  cartCount?: number;
  favoritesCount?: number;
  activeNav?: string;
  onNavChange?: (val: string) => void;
  onFavoritesClick?: () => void;
}

export default function Header({
  showSearch = true,
  searchQuery = "",
  onSearchChange,
  cartCount = 0,
  favoritesCount = 0,
  activeNav = "Home",
  onNavChange,
  onFavoritesClick,
}: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const storeItems = useCartStore((state) => state.items);
  const storeFavorites = useCartStore((state) => state.favorites);

  const displayCartCount = mounted
    ? storeItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const displayFavoritesCount = mounted
    ? storeFavorites.length
    : 0;

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNotificationsOpen, setIsMobileNotificationsOpen] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("Search harvests...");

  useEffect(() => {
    const words = [
      "Search 'Kandipappu'...",
      "Search 'Desi Cow Ghee'...",
      "Search 'Wild Forest Honey'...",
      "Search 'Korralu'...",
      "Search 'Bellam Podi'...",
      "Search 'Raagi Pindi'...",
      "Search 'Munaga Podi'...",
      "Search 'Pachi Karam'...",
      "Search 'Pottu Minapappu'...",
      "Search 'Jamun Honey'..."
    ];
    let isDeleting = false;
    let wordIndex = 0;
    let charIndex = 0;
    let timeout: any;

    function tick() {
      const currentWord = words[wordIndex];
      if (!isDeleting) {
        setCurrentPlaceholder(currentWord.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          timeout = setTimeout(tick, 2000);
        } else {
          timeout = setTimeout(tick, 80);
        }
      } else {
        setCurrentPlaceholder(currentWord.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          timeout = setTimeout(tick, 500);
        } else {
          timeout = setTimeout(tick, 40);
        }
      }
    }

    tick();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearchQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      if (typeof window !== "undefined") {
        if (window.location.pathname === "/categories") {
          const newUrl = `${window.location.pathname}?search=${encodeURIComponent(localSearchQuery.trim())}`;
          window.history.pushState({ path: newUrl }, "", newUrl);
        } else {
          window.location.href = `/categories?search=${encodeURIComponent(localSearchQuery.trim())}`;
        }
      }
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!mounted || !_hasHydrated || !isAuthenticated) {
      setNotifications([]);
      return;
    }

    async function loadNotifications() {
      try {
        const res = await fetchApi<{ status: string; data: any[] }>("/api/orders");
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          const newNotifications = res.data.map((order: any) => {
            let title = "Order Placed 📦";
            let description = `Your order ${order.orderNumber || "#" + order.id.slice(0, 8)} has been received and is being processed.`;
            if (order.status === "SHIPPED") {
              title = "Order Dispatched 🚚";
              description = `Your order ${order.orderNumber || "#" + order.id.slice(0, 8)} has been shipped.`;
            } else if (order.status === "DELIVERED") {
              title = "Order Delivered 🎉";
              description = `Your order ${order.orderNumber || "#" + order.id.slice(0, 8)} has been successfully delivered.`;
            } else if (order.status === "CANCELLED") {
              title = "Order Cancelled ❌";
              description = `Your order ${order.orderNumber || "#" + order.id.slice(0, 8)} has been cancelled.`;
            }

            const timeStr = new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " at " + new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

            return {
              id: order.id,
              title,
              description,
              timestamp: timeStr,
              isRead: false,
            };
          });

          // Sort by ID/Date most recent first
          newNotifications.sort((a, b) => b.id.localeCompare(a.id));

          setNotifications(newNotifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to load notifications from orders:", err);
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [mounted, _hasHydrated, isAuthenticated]);

  const hasUnread = notifications.some((n) => !n.isRead);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isNotificationsOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen, isUserMenuOpen]);


  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent marking as read when deleting
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#EAE6DB] w-full">
      <div className="px-6 lg:px-16 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <a
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-[#113C27] hover:opacity-90 transition-opacity"
          >
            Vipaasa Organics
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Home", "Categories", "About Vipaasa"].map((navItem) => {
            if (navItem === "Categories" || navItem === "Home" || navItem === "About Vipaasa") {
              const href = navItem === "Home" ? "/" : navItem === "Categories" ? "/categories" : "/about";
              return (
                <Link
                  key={navItem}
                  href={href}
                  className={`text-sm font-medium transition-colors relative py-1 ${activeNav === navItem ? "text-[#113C27] font-semibold" : "text-[#4B594F] hover:text-[#113C27]"
                    }`}
                >
                  <span>{navItem}</span>
                  {activeNav === navItem && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#113C27] rounded-full" />
                  )}
                </Link>
              );
            }
            return (
              <button
                key={navItem}
                type="button"
                onClick={() => onNavChange && onNavChange(navItem)}
                className={`text-sm font-medium transition-colors relative py-1 ${activeNav === navItem ? "text-[#113C27] font-semibold" : "text-[#4B594F] hover:text-[#113C27]"
                  }`}
              >
                {navItem}
                {activeNav === navItem && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#113C27] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Header Right Interactions */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Search Box */}
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738276]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={currentPlaceholder}
                value={localSearchQuery}
                onChange={handleInputChange}
                className="bg-[#ECE9E0] text-sm text-[#113C27] font-semibold placeholder-[#738276] rounded-full pl-9 pr-8 py-2 w-48 md:w-56 lg:w-64 xl:w-72 focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all"
              />
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#738276] hover:text-[#113C27]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          )}



          {/* Favourites Icon Link */}
          <button
            type="button"
            onClick={onFavoritesClick}
            className="relative p-1 text-[#113C27] hover:opacity-80 transition-opacity focus:outline-none"
            aria-label="Favourites"
          >
            <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {displayFavoritesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#A84444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all scale-100">
                {displayFavoritesCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          <div className="relative hidden md:flex items-center" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-1 text-[#113C27] hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 bg-[#2D6A4F] w-2 h-2 rounded-full border border-[#F9F7F2]"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white border border-[#EAE6DB] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden font-sans">
                {/* Popover Header */}
                <div className="px-4 py-3 border-b border-[#EAE6DB]/60 flex justify-between items-center bg-[#FAF9F5]">
                  <span className="text-sm font-bold text-[#113C27]">Notifications</span>
                  <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[10px] font-extrabold text-[#2D6A4F] hover:text-[#113C27] transition-all tracking-wider uppercase"
                      >
                        Mark all as read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-1 hover:bg-[#ECE9E0]/50 rounded-lg text-[#738276] hover:text-[#113C27] transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Popover Body List */}
                <div className="max-h-[320px] overflow-y-auto divide-y divide-[#EAE6DB]/40">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => toggleRead(n.id)}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors group relative hover:bg-[#FAF9F5]/50 ${!n.isRead ? "bg-[#FAF9F5]/30" : ""
                          }`}
                      >
                        {/* Unread dot */}
                        <div className="flex-shrink-0 w-2 pt-1.5">
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-[#2D6A4F] rounded-full" />
                          )}
                        </div>

                        {/* Content details */}
                        <div className="flex-grow pr-4">
                          <h5 className="text-xs font-bold text-[#113C27]">{n.title}</h5>
                          <p className="text-xs text-[#5C6E61] mt-1 leading-relaxed">{n.description}</p>
                          <span className="text-[10px] text-[#738276] mt-2 block font-semibold">{n.timestamp}</span>
                        </div>

                        {/* Delete notification button on hover */}
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(n.id, e)}
                          className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ECE9E0] rounded-md text-[#738276] hover:text-[#113C27] transition-all"
                          aria-label="Delete notification"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    /* Popover Empty State */
                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAF9F5] flex items-center justify-center text-[#EAE6DB] mb-3">
                        <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-[#113C27]">No notifications</span>
                      <span className="text-xs text-[#738276] mt-1 font-semibold">You’re all caught up.</span>
                    </div>
                  )}
                </div>

                {/* Popover Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-[#FAF9F5] border-t border-[#EAE6DB]/60 flex justify-end">
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-[10px] font-extrabold text-[#738276] hover:text-[#A84444] transition-all tracking-wider uppercase"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon Link */}
          <button type="button" onClick={() => setIsCartDrawerOpen(true)} className="relative p-1 text-[#113C27] hover:opacity-80 transition-opacity" aria-label="Shopping Cart">
            <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {displayCartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#A84444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all scale-100">
                {displayCartCount}
              </span>
            )}
          </button>

          {/* User Profile Link */}
          {_hasHydrated && isAuthenticated ? (
            <div className="relative hidden md:flex items-center animate-fade-in" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative w-8 h-8 rounded-full bg-[#113C27] hover:bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs transition-colors focus:outline-none"
                aria-label="User Menu"
              >
                {user?.profile?.firstName
                  ? `${user.profile.firstName[0]}${user.profile.lastName ? user.profile.lastName[0] : ""}`.toUpperCase()
                  : user?.email ? user.email.slice(0, 2).toUpperCase() : "U"}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-[#EAE6DB] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden font-sans">
                  <div className="px-4 py-3 border-b border-[#EAE6DB]/60 bg-[#FAF9F5]">
                    <p className="text-[10px] text-[#738276] font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-xs font-bold text-[#113C27] truncate mt-0.5">
                      {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27] transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27] transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left block px-4 py-2 text-xs font-bold text-[#A84444] hover:bg-[#FAF9F5] transition-colors border-t border-[#EAE6DB]/40"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                id="header-signin-btn"
                className="px-4 py-1.5 text-xs font-bold text-[#113C27] border border-[#113C27] rounded-full hover:bg-[#113C27] hover:text-white transition-all duration-200 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=register"
                id="header-signup-btn"
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#113C27] border border-[#113C27] rounded-full hover:bg-[#2D6A4F] hover:border-[#2D6A4F] transition-all duration-200 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger Menu Icon for Mobile */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileNotificationsOpen(false);
            }}
            className="md:hidden p-1 text-[#113C27] hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 stroke-2" />
            ) : (
              <Menu className="w-6 h-6 stroke-2" />
            )}
          </button>
        </div>
      </div>

      {/* Persistent Mobile Search Bar (Always visible below the main header row on mobile) */}
      {showSearch && (
        <div className="px-6 pb-3 pt-0 sm:hidden bg-transparent">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738276]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={currentPlaceholder}
              value={localSearchQuery}
              onChange={handleInputChange}
              className="bg-[#ECE9E0] text-sm text-[#113C27] font-semibold placeholder-[#738276] rounded-full pl-9 pr-10 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all"
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#738276] hover:text-[#113C27]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile Navigation Panel */}
      {isMobileMenuOpen && (
        <div className="px-6 py-4 border-t border-[#EAE6DB]/40 md:hidden bg-[#F9F7F2]/95 animate-fade-in flex flex-col gap-3 shadow-inner">
          <nav className="flex flex-col gap-2">
            {["Home", "Categories", "About Vipaasa"].map((navItem) => {
              if (navItem === "Categories" || navItem === "Home" || navItem === "About Vipaasa") {
                const href = navItem === "Home" ? "/" : navItem === "Categories" ? "/categories" : "/about";
                return (
                  <Link
                    key={navItem}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-semibold transition-colors py-2 px-3 rounded-lg flex items-center justify-between ${activeNav === navItem
                      ? "bg-[#C1F2D0] text-[#113C27]"
                      : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {navItem}
                    </span>
                  </Link>
                );
              }
              return (
                <button
                  key={navItem}
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavChange && onNavChange(navItem);
                  }}
                  className={`text-left text-sm font-semibold transition-colors py-2 px-3 rounded-lg ${activeNav === navItem
                    ? "bg-[#C1F2D0] text-[#113C27]"
                    : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
                    }`}
                >
                  {navItem}
                </button>
              );
            })}

            {/* Divider */}
            <div className="border-t border-[#EAE6DB]/60 my-2" />

            {/* Mobile Notifications Section */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setIsMobileNotificationsOpen(!isMobileNotificationsOpen)}
                className={`flex items-center justify-between w-full text-left text-sm font-semibold transition-colors py-2 px-3 rounded-lg ${isMobileNotificationsOpen
                  ? "bg-[#C1F2D0]/50 text-[#113C27]"
                  : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  <span>Notifications</span>
                  {hasUnread && (
                    <span className="bg-[#2D6A4F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 text-[#738276] ${isMobileNotificationsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {isMobileNotificationsOpen && (
                <div className="mt-1 mx-1 p-3 bg-white/60 border border-[#EAE6DB] rounded-xl flex flex-col gap-2 max-h-72 overflow-y-auto">
                  {/* Actions Row */}
                  {notifications.length > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-[#EAE6DB]/60">
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[10px] font-extrabold text-[#2D6A4F] hover:text-[#113C27] uppercase tracking-wider"
                      >
                        Mark all as read
                      </button>
                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-[10px] font-extrabold text-[#738276] hover:text-[#A84444] uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {/* Notifications list */}
                  <div className="divide-y divide-[#EAE6DB]/40">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => toggleRead(n.id)}
                          className="py-2.5 flex gap-2 cursor-pointer transition-colors group relative"
                        >
                          {/* Unread indicator */}
                          <div className="flex-shrink-0 w-1.5 pt-1.5">
                            {!n.isRead && (
                              <div className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full" />
                            )}
                          </div>

                          {/* Content details */}
                          <div className="flex-grow pr-6">
                            <h5 className="text-xs font-bold text-[#113C27]">{n.title}</h5>
                            <p className="text-[11px] text-[#5C6E61] mt-0.5 leading-relaxed">{n.description}</p>
                            <span className="text-[9px] text-[#738276] mt-1 block font-semibold">{n.timestamp}</span>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => deleteNotification(n.id, e)}
                            className="absolute right-1 top-2.5 p-1 hover:bg-[#ECE9E0] rounded-md text-[#738276] hover:text-[#A84444] transition-all"
                            aria-label="Delete notification"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      /* Empty state */
                      <div className="py-6 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-[#113C27]">No notifications</span>
                        <span className="text-[11px] text-[#738276] mt-0.5 font-semibold">You’re all caught up.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#EAE6DB]/60 my-2" />

            {/* Mobile Auth Options */}
            {_hasHydrated && isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <Link
                  href="/account/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left text-sm font-semibold text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27] py-2 px-3 rounded-lg transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-left text-sm font-semibold text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27] py-2 px-3 rounded-lg transition-colors"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-left text-sm font-bold text-[#A84444] hover:bg-[#FAF9F5] py-2 px-3 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1 px-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-bold text-[#113C27] border border-[#113C27] rounded-full py-2 hover:bg-[#113C27] hover:text-white transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-bold text-white bg-[#113C27] border border-[#113C27] rounded-full py-2 hover:bg-[#2D6A4F] hover:border-[#2D6A4F] transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}



      {/* Deal Announcement Bar */}
      <div className="bg-[#113C27] text-white text-[10px] sm:text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 border-t border-[#2D6A4F]/20 select-none shadow-sm">
        <span className="animate-pulse text-amber-400">⚡</span>
        <span className="text-center tracking-wide">
          Flash Sale: Get <span className="text-[#C1F2D0] font-extrabold">15% OFF</span> on Organic Honey & Vedic Cow Ghee today! Use code: <span className="bg-[#2D6A4F] text-[#C1F2D0] px-2 py-0.5 rounded font-black tracking-wider text-[9px] sm:text-[10px]">PURE15</span>
        </span>
        <span className="animate-pulse text-amber-400">⚡</span>
      </div>

      {/* Cart Sidebar Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
    </header>
  );
}
