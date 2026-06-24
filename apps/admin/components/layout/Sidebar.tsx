"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  LogOut,
  FileText,
  ClipboardList,
  Settings,
  CreditCard,
  Truck,
  Tag,
  Ticket,
  LineChart,
  Bell,
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: ClipboardList },
  { name: "Delivery Partners", href: "/delivery-partners", icon: Truck },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Top Deals", href: "/deals", icon: Tag },
  { name: "Coupons", href: "/coupons", icon: Ticket },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Users", href: "/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("vipaasa_admin_token");
    router.replace("/login");
  };

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
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
        >
          <LogOut className="h-5 w-5 text-red-600" />
          Logout
        </button>
      </div>
    </aside>
  );
}
