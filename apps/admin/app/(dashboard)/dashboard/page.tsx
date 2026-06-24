"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import CustomerGrowthChart from "@/components/dashboard/CustomerGrowthChart";
import BestSellersList from "@/components/dashboard/BestSellersList";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrderStatusPie from "@/components/dashboard/OrderStatusPie";
import { Package, Banknote, Truck, Calendar, ShoppingBag, Eye, Users2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const [filter, setFilter] = useState<"today" | "week" | "month">("month");

  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats', filter],
    queryFn: async () => {
      const res = await fetchAPI("/api/reports/dashboard", {
        params: { filter }
      });
      return res;
    }
  });

  // Dynamic values depending on filter selection
  const totalOrders = loading ? "..." : String(data?.kpis?.totalOrders ?? 0);
  const revenueVal = loading ? "..." : String(data?.kpis?.revenue ?? "₹0");
  const pendingDeliveries = loading ? "..." : String(data?.kpis?.pendingDeliveries ?? 0);
  const todayOrders = loading ? "..." : String(data?.kpis?.todayOrders ?? 0);
  
  const customerCount = loading ? "..." : String(data?.customerStats?.totalCustomers ?? 0);
  const customerTrend = loading ? "..." : String(data?.customerStats?.growthTrend ?? "+0.0%");
  const activeRate = loading ? "..." : String(data?.customerStats?.activeRate ?? "0%");
  const satisfactionScore = loading ? "..." : String(data?.customerStats?.satisfactionScore ?? "0.0 / 5.0");

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Performance</h1>
          <p className="text-xs text-gray-500 mt-0.5">Overview of business metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilter("today")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === "today"
                ? "bg-white text-[var(--primary-green)] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("week")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === "week"
                ? "bg-white text-[var(--primary-green)] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              filter === "month"
                ? "bg-white text-[var(--primary-green)] shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          subtext="vs last period"
          icon={Package}
          trend={loading ? undefined : (filter === "today" ? "+4%" : filter === "week" ? "+8%" : "+12%")}
          trendUp={true}
        />
        <StatCard
          title={filter === "today" ? "Today's Orders" : "Average Orders"}
          value={todayOrders}
          subtext="Direct order influx"
          icon={ShoppingBag}
          trend={loading ? undefined : "+1.4%"}
          trendUp={true}
        />
        <StatCard
          title="Revenue"
          value={revenueVal}
          subtext="Aggregated value"
          icon={Banknote}
          trend={loading ? undefined : (filter === "today" ? "+3.5%" : filter === "week" ? "+6.2%" : "+8.4%")}
          trendUp={true}
        />
        <StatCard
          title="Pending Deliveries"
          value={pendingDeliveries}
          subtext="Unfulfilled shipments"
          icon={Truck}
          alertText={loading ? undefined : (filter === "today" ? "2 Urgent" : filter === "week" ? "6 Urgent" : "14 Urgent")}
        />
      </div>

      {/* Middle Grid: Dynamic Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart filter={filter} data={data?.revenueChart} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlert items={data?.lowStockItems} loading={loading} />
        </div>
      </div>

      {/* Spacing Widgets Grid: Customer Stats, Order Statuses, Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Customer Statistics Widget */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users2 className="h-5 w-5 text-[var(--primary-green)]" />
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Customer Statistics</h2>
            </div>
            <p className="text-sm text-gray-500">Customer engagement and demographics</p>
          </div>
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="text-xs text-gray-500 font-semibold">Total Customers</span>
              <span className="text-sm font-bold text-gray-900">{customerCount}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="text-xs text-gray-500 font-semibold">Active Rate</span>
              <span className="text-sm font-bold text-gray-900">{activeRate}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="text-xs text-gray-500 font-semibold">Growth Trend</span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {customerTrend}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">Satisfaction Score</span>
              <span className="text-sm font-bold text-emerald-600">{satisfactionScore}</span>
            </div>
          </div>
          <div className="pt-2">
            <button className="w-full text-center text-xs font-bold text-[var(--primary-green)] hover:underline">
              View Customer Lists
            </button>
          </div>
        </div>

        {/* Donut Order Status Widget */}
        <div>
          <OrderStatusPie filter={filter} data={data?.orderStatusPie} loading={loading} />
        </div>

        {/* Best Sellers */}
        <div>
          <BestSellersList data={data?.bestSellers} loading={loading} />
        </div>
      </div>

      <footer className="mt-12 flex items-center justify-between text-xs text-gray-500 pb-8">
        <p>© 2024 Vipaasa Organics. Artisanal. Ethical. Pure.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Support Center</a>
          <a href="#" className="hover:text-gray-900 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
