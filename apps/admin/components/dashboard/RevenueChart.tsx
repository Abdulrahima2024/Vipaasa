"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  filter: "today" | "week" | "month";
  data?: {
    labels: string[];
    values: number[];
    amounts: string[];
    maxValue: number;
    title: string;
    subtext: string;
    totalRevenue: string;
  };
  loading?: boolean;
}

export default function RevenueChart({ filter, data, loading }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (data) return data;
    return {
      labels: filter === "today" ? ["9AM", "12PM", "3PM", "6PM", "9PM"] : filter === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"],
      values: filter === "today" ? [0, 0, 0, 0, 0] : filter === "week" ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0],
      amounts: filter === "today" ? ["₹0k", "₹0k", "₹0k", "₹0k", "₹0k"] : filter === "week" ? ["₹0k", "₹0k", "₹0k", "₹0k", "₹0k", "₹0k", "₹0k"] : ["₹0k", "₹0k", "₹0k", "₹0k", "₹0k"],
      maxValue: 100,
      title: filter === "today" ? "Today's Revenue Trend" : filter === "week" ? "Weekly Revenue Trend" : "Monthly Revenue Trend",
      subtext: filter === "today" ? "Hourly sales analysis" : filter === "week" ? "Daily sales analysis" : "Weekly aggregated sales",
      totalRevenue: "₹0.0k",
    };
  }, [data, filter]);

  const hasData = useMemo(() => {
    return chartData.values.some((val) => val > 0);
  }, [chartData.values]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.values);
    return max > 0 ? max : 100;
  }, [chartData.values]);

  const totalRevenue = useMemo(() => {
    return chartData.values.reduce((a, b) => a + b, 0);
  }, [chartData.values]);

  const peakIndex = useMemo(() => {
    const max = Math.max(...chartData.values);
    return chartData.values.indexOf(max);
  }, [chartData.values]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full min-h-[24rem]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--primary-green)]" />
            {chartData.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{chartData.subtext}</p>
        </div>
        <div className="text-right bg-green-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 font-semibold">Total Revenue</div>
          <div className="text-lg font-bold text-[var(--primary-green)] mt-1">{chartData.totalRevenue}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
          Loading revenue trend...
        </div>
      ) : !hasData ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-sm py-12">
          <TrendingUp className="h-8 w-8 mb-2 text-gray-300 animate-pulse" />
          No revenue recorded for this period.
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="flex-grow flex items-end justify-between gap-2 mb-6 px-2">
            {chartData.values.map((value, idx) => {
              const heightPercent = (value / maxValue) * 100;
              const isHighest = value === maxValue && value > 0;
              
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group cursor-pointer"
                >
                  {/* Value Label */}
                  <div className="text-[10px] font-bold text-gray-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {chartData.amounts[idx]}
                  </div>

                  {/* Bar Container */}
                  <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden hover:shadow-md transition-all duration-300 relative"
                    style={{
                      height: `${Math.max(heightPercent * 3, 8)}px`,
                      backgroundColor: "#f3f4f6",
                    }}>
                    {/* Animated Bar Fill */}
                    <div
                      className={`h-full rounded-t-lg transition-all duration-500 ease-out ${
                        isHighest
                          ? "bg-gradient-to-t from-[var(--primary-green)] to-[#4ade80]"
                          : "bg-gradient-to-t from-[var(--primary-green)] to-[#86efac]"
                      } hover:shadow-lg transform group-hover:scale-y-110 origin-bottom`}
                      style={{
                        height: "100%",
                        animation: `slideUp${idx} 0.6s ease-out ${idx * 80}ms backwards`,
                      }}
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-[11px] font-semibold text-gray-600 mt-2 text-center">
                    {chartData.labels[idx]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">Average Revenue</span>
              <span className="text-sm font-bold text-gray-900 mt-1">₹{(totalRevenue / chartData.values.length).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-semibold">Peak Revenue</span>
              <span className="text-sm font-bold text-[var(--primary-green)] mt-1">{chartData.amounts[peakIndex]}</span>
            </div>
          </div>
        </>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        ${chartData.values.map((_, idx) => `
          @keyframes slideUp${idx} {
            from {
              height: 0;
              opacity: 0;
            }
            to {
              height: 100%;
              opacity: 1;
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}
