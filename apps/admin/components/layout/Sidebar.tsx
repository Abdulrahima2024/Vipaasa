"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LifeBuoy,
  BarChart3,
  Users,
  Settings,
  LogOut,
  FileText,
  ClipboardList,
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: ClipboardList },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Users", href: "/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#f4f5f5] border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[var(--primary-green)] tracking-tight">
          Vipaasa Admin
        </h1>
        <p className="text-xs text-gray-500 mt-1">Global Operations</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.name === "Dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--primary-green)] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 bg-[var(--primary-green)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
          <FileText className="h-4 w-4" />
          Generate Report
        </button>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-500" />
          Settings
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
