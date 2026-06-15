"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

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
  activeNav = "Shop",
  onNavChange,
  onFavoritesClick,
}: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Mock notifications data matching VIPAASA Organics premium products and events
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Fresh Harvest Alert 🌿",
      description: "Our premium Matcha green tea has just been restocked. Grab yours before it's gone!",
      timestamp: "2 hours ago",
      isRead: false,
    },
    {
      id: "2",
      title: "Order Dispatched 📦",
      description: "Your order #VP-8921 has been shipped and is on its way to your organic sanctuary.",
      timestamp: "1 day ago",
      isRead: false,
    },
    {
      id: "3",
      title: "Ethos Update 🌸",
      description: "Read about our new regenerative farming partner in Southern India on our blog.",
      timestamp: "3 days ago",
      isRead: true,
    },
  ]);

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
      <div className="px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon for Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-[#113C27] hover:opacity-80 transition-opacity focus:outline-none flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 stroke-2" />
            ) : (
              <Menu className="w-6 h-6 stroke-2" />
            )}
          </button>

          {/* Brand Logo */}
          <a
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-[#113C27] hover:opacity-90 transition-opacity"
          >
            Vipaasa Organics
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {["Shop", "Categories", "Ethos", "Deals"].map((navItem) => {
            if (navItem === "Categories") {
              return (
                <Link
                  key={navItem}
                  href="/categories"
                  className={`text-sm font-medium transition-colors relative py-1 ${
                    activeNav === navItem ? "text-[#113C27] font-semibold" : "text-[#4B594F] hover:text-[#113C27]"
                  }`}
                >
                  {navItem}
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
                className={`text-sm font-medium transition-colors relative py-1 ${
                  activeNav === navItem ? "text-[#113C27] font-semibold" : "text-[#4B594F] hover:text-[#113C27]"
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
                placeholder="Search harvests..."
                value={localSearchQuery}
                onChange={handleInputChange}
                className="bg-[#ECE9E0] text-sm text-[#113C27] font-semibold placeholder-[#738276] rounded-full pl-9 pr-8 py-2 w-48 lg:w-60 focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all"
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

          {/* Mobile Search Toggle */}
          {showSearch && (
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1 text-[#113C27] hover:opacity-80 transition-opacity focus:outline-none sm:hidden flex items-center justify-center"
              aria-label="Toggle search"
            >
              <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </button>
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
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-[#A84444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all scale-100">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
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
                      className={`p-4 flex gap-3 cursor-pointer transition-colors group relative hover:bg-[#FAF9F5]/50 ${
                        !n.isRead ? "bg-[#FAF9F5]/30" : ""
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
        <a href="/cart" className="relative p-1 text-[#113C27] hover:opacity-80 transition-opacity" aria-label="Shopping Cart">
          <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-[#A84444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-all scale-100">
              {cartCount}
            </span>
          )}
        </a>

        {/* User Profile Link */}
        {_hasHydrated && isAuthenticated ? (
          <div className="relative flex items-center animate-fade-in" ref={userMenuRef}>
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
          <div className="flex items-center gap-2">
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
      </div>
    </div>

      {/* Mobile Navigation Panel */}
      {isMobileMenuOpen && (
        <div className="px-6 py-4 border-t border-[#EAE6DB]/40 md:hidden bg-[#F9F7F2]/95 animate-fade-in flex flex-col gap-3 shadow-inner">
          <nav className="flex flex-col gap-2">
            {["Shop", "Categories", "Ethos", "Deals"].map((navItem) => {
              if (navItem === "Categories") {
                return (
                  <Link
                    key={navItem}
                    href="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-semibold transition-colors py-2 px-3 rounded-lg ${
                      activeNav === navItem 
                        ? "bg-[#C1F2D0] text-[#113C27]" 
                        : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
                    }`}
                  >
                    {navItem}
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
                  className={`text-left text-sm font-semibold transition-colors py-2 px-3 rounded-lg ${
                    activeNav === navItem 
                      ? "bg-[#C1F2D0] text-[#113C27]" 
                      : "text-[#4B594F] hover:bg-[#FAF9F5] hover:text-[#113C27]"
                  }`}
                >
                  {navItem}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Mobile Search Bar Dropdown */}
      {showSearch && isMobileSearchOpen && (
        <div className="px-6 pb-4 pt-1 border-t border-[#EAE6DB]/40 sm:hidden bg-[#F9F7F2]/95 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738276]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search harvests..."
              value={localSearchQuery}
              onChange={handleInputChange}
              className="bg-[#ECE9E0] text-sm text-[#113C27] font-semibold placeholder-[#738276] rounded-full pl-9 pr-10 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all"
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
    </header>
  );
}
