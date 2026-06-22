"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Package,
  Activity,
  Users2,
  BadgeCent
} from "lucide-react";
import { fetchAPI } from "../../../lib/api";

interface SalesBreakdown {
  period: string;
  orders: number;
  conversion: string;
  revenue: string;
}

interface ProductReportItem {
  name: string;
  sku: string;
  cat: string;
  sold: number;
  kg: number;
  rev: string;
}

interface LowStockItem {
  name: string;
  left: string;
}

interface FastMovingItem {
  name: string;
  sold: string;
}

interface DamagedLogItem {
  name: string;
  qty: string;
}

interface AnalyticsData {
  sales: {
    grossVolume: string;
    avgTicketSize: string;
    netConversions: string;
    fulfillmentSLA: string;
    breakdownLog: SalesBreakdown[];
  };
  products: ProductReportItem[];
  inventory: {
    lowStock: LowStockItem[];
    fastMoving: FastMovingItem[];
    damaged: DamagedLogItem[];
  };
  customers: {
    newPercent: number;
    newCount: number;
    repeatPercent: number;
    repeatCount: number;
    satisfaction: string;
    lifetimeValue: string;
  };
  financial: {
    grossVolume: string;
    onlineRevenue: string;
    codRevenue: string;
    gstCollected: string;
    cgst: string;
    sgst: string;
    netProfit: string;
  };
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "products" | "inventory" | "customers" | "financial" >("sales");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-filter for Sales
  const [salesRange, setSalesRange] = useState<"daily" | "weekly" | "monthly" | "annual">("monthly");

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAPI("/api/reports/analytics");
      setAnalyticsData(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load reports data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleDownloadReport = (name: string) => {
    alert(`Downloading ${name}_Report.csv...`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 font-bold flex items-center gap-2">
          <Activity className="animate-spin text-[var(--primary-green)]" />
          Loading reports data...
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center bg-white rounded-2xl border border-gray-100">
        <h2 className="text-lg font-bold text-red-600 mb-2">Error Loading Reports</h2>
        <p className="text-sm text-gray-500 mb-4">{error || "Could not retrieve statistics."}</p>
        <button onClick={loadAnalytics} className="bg-[var(--primary-green)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[var(--primary-hover)]">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Reports & Analytics</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Review organizational logs, financial statements, and performance.</p>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {[
          { id: "sales", label: "Sales Reports", icon: TrendingUp },
          { id: "products", label: "Product Reports", icon: Package },
          { id: "inventory", label: "Inventory Reports", icon: Activity },
          { id: "customers", label: "Customer Reports", icon: Users2 },
          { id: "financial", label: "Financial Reports", icon: BadgeCent }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-b-[var(--primary-green)] text-[var(--primary-green)] bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SALES REPORTS */}
      {activeTab === "sales" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Sub-filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Sales Analytics</h2>
              <p className="text-xs text-gray-400 mt-0.5">Aggregate gross order value over timeline blocks.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {(["daily", "weekly", "monthly", "annual"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSalesRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                      salesRange === r
                        ? "bg-white text-[var(--primary-green)] shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => handleDownloadReport(`Sales_${salesRange}`)}
                className="flex items-center gap-1.5 bg-[var(--primary-green)] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all active:scale-95 ml-auto sm:ml-0"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Sales metrics data grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-5 border border-gray-150">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Gross Volume</span>
              <span className="text-xl font-bold text-gray-950 block mt-1">{analyticsData.sales.grossVolume}</span>
              <span className="text-[10px] text-green-600 font-bold block mt-2">↗ Real-time volume</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-150">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Average Ticket Size</span>
              <span className="text-xl font-bold text-gray-950 block mt-1">{analyticsData.sales.avgTicketSize}</span>
              <span className="text-[10px] text-green-600 font-bold block mt-2">↗ Real-time average</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-150">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Net Conversions</span>
              <span className="text-xl font-bold text-gray-950 block mt-1">{analyticsData.sales.netConversions}</span>
              <span className="text-[10px] text-gray-400 font-semibold block mt-2">Conversion rate log</span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-150">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Fulfillment SLA</span>
              <span className="text-xl font-bold text-gray-950 block mt-1">{analyticsData.sales.fulfillmentSLA}</span>
              <span className="text-[10px] text-green-600 font-bold block mt-2">↗ Ahead of target</span>
            </div>
          </div>

          {/* Sales log list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
              Sales Breakdown Log
            </div>
            <div className="divide-y divide-gray-100 font-semibold text-xs text-gray-700">
              {analyticsData.sales.breakdownLog.map((row, idx) => (
                <div key={idx} className="p-4 flex justify-between hover:bg-gray-50/20">
                  <span className="font-bold text-gray-900 w-32">{row.period}</span>
                  <span className="text-gray-500 w-24 text-center">{row.orders} orders</span>
                  <span className="text-gray-500 w-24 text-center">{row.conversion} CR</span>
                  <span className="font-bold text-gray-900 text-right w-24">{row.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT REPORTS */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Product Wise Sales</h2>
              <p className="text-xs text-gray-400 mt-0.5">Quantity and revenue aggregate logs by SKU.</p>
            </div>
            <button 
              onClick={() => handleDownloadReport("Products")}
              className="flex items-center gap-1.5 bg-[var(--primary-green)] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-gray-600 font-semibold">
              <thead className="bg-gray-50/50 uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-center">SKU</th>
                  <th className="px-6 py-4 text-center">Category</th>
                  <th className="px-6 py-4 text-center">Quantity Sold</th>
                  <th className="px-6 py-4 text-center">Total Volume (KG)</th>
                  <th className="px-6 py-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {analyticsData.products.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/20 font-medium">
                    <td className="px-6 py-4 font-bold text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-center font-mono text-gray-500">{row.sku}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{row.cat}</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">{row.sold} units</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-bold">{row.kg} kg</td>
                    <td className="px-6 py-4 text-right text-gray-950 font-bold">{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY REPORTS */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Inventory Stock Audits</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ledger logs of available, reserved, and damaged levels.</p>
            </div>
            <button 
              onClick={() => handleDownloadReport("Inventory")}
              className="flex items-center gap-1.5 bg-[var(--primary-green)] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Low stock card list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-max border border-red-100">
                Low Stock Alert Products
              </h3>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                {analyticsData.inventory.lowStock.map((row, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{row.name}</span>
                    <span className="text-red-600 font-bold">{row.left}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast moving items */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-max border border-emerald-100">
                Fast Moving Grains & Staples
              </h3>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                {analyticsData.inventory.fastMoving.map((row, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{row.name}</span>
                    <span className="text-emerald-700 font-bold">{row.sold}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Damaged / Write-off stocks */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded w-max border border-gray-200">
                Damaged / Write-off Logs
              </h3>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                {analyticsData.inventory.damaged.map((row, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{row.name}</span>
                    <span className="text-gray-500 font-bold">{row.qty}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER REPORTS */}
      {activeTab === "customers" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Customer Engagement Statistics</h2>
              <p className="text-xs text-gray-400 mt-0.5">Demographics and repeat purchase cohorts analysis.</p>
            </div>
            <button 
              onClick={() => handleDownloadReport("Customers")}
              className="flex items-center gap-1.5 bg-[var(--primary-green)] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New vs Repeat */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Customer Acquisition Type</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">New Customers</span>
                  <span className="text-gray-900">{analyticsData.customers.newCount} ({analyticsData.customers.newPercent}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[var(--primary-green)] h-full" style={{ width: `${analyticsData.customers.newPercent}%` }} />
                  <div className="bg-teal-500 h-full" style={{ width: `${analyticsData.customers.repeatPercent}%` }} />
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Repeat Customers</span>
                  <span className="text-gray-900">{analyticsData.customers.repeatCount} ({analyticsData.customers.repeatPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Loyalty levels */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Retention Cohorts</h3>
              <div className="space-y-3.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Loyalty Rate (2+ Orders)</span>
                  <span className="text-emerald-700">{analyticsData.customers.repeatPercent}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Average Customer Lifetime Value</span>
                  <span className="text-gray-900">{analyticsData.customers.lifetimeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction Score</span>
                  <span className="text-emerald-700 font-bold">{analyticsData.customers.satisfaction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL REPORTS */}
      {activeTab === "financial" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Tax & Net Profit Statements</h2>
              <p className="text-xs text-gray-400 mt-0.5">GST mapping collections and profit margin analytics.</p>
            </div>
            <button 
              onClick={() => handleDownloadReport("Financial")}
              className="flex items-center gap-1.5 bg-[var(--primary-green)] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export Balance
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</span>
                <span className="text-xs font-bold text-green-650 bg-green-50 px-1.5 py-0.5 rounded">{analyticsData.financial.grossVolume}</span>
              </div>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span>Online Payments</span>
                  <span className="text-gray-900">{analyticsData.financial.onlineRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash on Delivery</span>
                  <span className="text-gray-900">{analyticsData.financial.codRevenue}</span>
                </div>
              </div>
            </div>

            {/* Tax Collected card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">GST Tax collected</span>
                <span className="text-xs font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded">{analyticsData.financial.gstCollected}</span>
              </div>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span>CGST Collected (50%)</span>
                  <span className="text-gray-900">{analyticsData.financial.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST Collected (50%)</span>
                  <span className="text-gray-900">{analyticsData.financial.sgst}</span>
                </div>
              </div>
            </div>

            {/* Profit margin card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Profit</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{analyticsData.financial.netProfit}</span>
              </div>
              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span>Operating Cost Margin</span>
                  <span className="text-gray-900">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin Rate</span>
                  <span className="text-emerald-700 font-bold">40%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
