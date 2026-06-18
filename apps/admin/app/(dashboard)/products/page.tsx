"use client";

import { useState, useEffect } from "react";
import InventoryTable from "@/components/inventory/InventoryTable";
import { ChevronRight, CheckCircle, TrendingUp } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function ProductsPage() {
  const [stats, setStats] = useState({
    total: 0,
    activePercent: "0%",
    lowStock: 0,
    valuation: "₹0",
  });
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);
      // Fetch up to 1000 products to compute dashboard statistics
      const data = await fetchAPI("/api/products", {
        params: { limit: 1000, includeInactive: true },
      });
      const items = data.items || [];
      const total = items.length;
      
      let activeCount = 0;
      let lowStockCount = 0;
      let totalValuation = 0;

      items.forEach((product: any) => {
        if (product.isActive) {
          activeCount++;
        }
        
        let productStock = 0;
        (product.variants || []).forEach((v: any) => {
          let variantStock = 0;
          if (v.inventories) {
            v.inventories.forEach((inv: any) => {
              variantStock += (inv.quantityOnHand - inv.quantityReserved);
            });
          }
          productStock += variantStock;
          
          if (v.pricing) {
            const price = parseFloat(v.pricing.basePrice);
            totalValuation += price * variantStock;
          }
        });
        
        if (productStock <= 15) {
          lowStockCount++;
        }
      });

      const activePercent = total > 0 ? `${((activeCount / total) * 100).toFixed(1)}%` : "0%";

      setStats({
        total,
        activePercent,
        lowStock: lowStockCount,
        valuation: `₹${totalValuation.toLocaleString("en-IN")}`,
      });
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Products</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Inventory List</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product Inventory</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : stats.total}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Live Catalogue
            </span>
          </div>
        </div>

        {/* Active Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Status</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : stats.activePercent}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Low Stock Items</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : stats.lowStock}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
              Critical
            </span>
          </div>
        </div>

        {/* Total Valuation */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Valuation</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {loading ? "..." : stats.valuation}
            </p>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <InventoryTable onProductChange={loadStats} />

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
