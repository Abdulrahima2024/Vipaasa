"use client";

import { useState, useEffect } from "react";
import { LineChart, BarChart3, Users, Package, TrendingUp, IndianRupee, RefreshCcw } from "lucide-react";
import { fetchAPI } from "../../../lib/api";

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [weeklyRes, monthlyRes, productRes, customerRes] = await Promise.all([
        fetchAPI("/api/admin/analytics/weekly"),
        fetchAPI("/api/admin/analytics/monthly"),
        fetchAPI("/api/admin/analytics/products"),
        fetchAPI("/api/admin/analytics/customers")
      ]);
      
      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
      setProductData(productRes.data);
      setCustomerData(customerRes.data);
    } catch (err) {
      console.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-gray-500">
        <RefreshCcw className="w-8 h-8 animate-spin mb-4 text-[var(--primary-green)]" />
        <p className="font-medium">Compiling Analytics Data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-[var(--primary-green)]" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your business growth and metrics</p>
        </div>
        <button className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenue This Month" 
          value={`₹${monthlyData?.revenueThisMonth || 0}`} 
          icon={<IndianRupee className="w-5 h-5 text-white" />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Orders This Month" 
          value={monthlyData?.ordersThisMonth || 0} 
          icon={<Package className="w-5 h-5 text-white" />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Avg Order Value" 
          value={`₹${monthlyData?.averageOrderValue || 0}`} 
          icon={<TrendingUp className="w-5 h-5 text-white" />} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="New Customers" 
          value={customerData?.newCustomersThisMonth || 0} 
          icon={<Users className="w-5 h-5 text-white" />} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            This Week's Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Revenue</span>
              <span className="text-xl font-bold text-gray-900">₹{weeklyData?.revenueThisWeek || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Orders</span>
              <span className="text-xl font-bold text-gray-900">{weeklyData?.ordersThisWeek || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">New Customers</span>
              <span className="text-xl font-bold text-gray-900">{weeklyData?.newCustomersThisWeek || 0}</span>
            </div>
          </div>
        </div>

        {/* Product Analytics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            Top Selling Products
          </h3>
          <div className="space-y-3">
            {productData?.topSellingProducts?.length > 0 ? (
              productData.topSellingProducts.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <span className="text-gray-800 font-medium">{p.name}</span>
                  </div>
                  <span className="text-[var(--primary-green)] font-bold">{p.quantitySold} sold</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No product data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );
}
