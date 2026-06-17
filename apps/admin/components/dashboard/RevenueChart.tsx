"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

interface RevenueChartProps {
  filter: "today" | "week" | "month";
}

export default function RevenueChart({ filter }: RevenueChartProps) {
  const chartData = useMemo(() => {
    switch (filter) {
      case "today":
        return {
          labels: ["9AM", "12PM", "3PM", "6PM", "9PM"],
          values: [20, 50, 45, 80, 60],
          amounts: ["₹2.0k", "₹5.0k", "₹4.5k", "₹8.0k", "₹6.0k"],
          maxValue: 100,
          title: "Today's Revenue Trend",
          subtext: "Hourly sales analysis",
          totalRevenue: "₹25.5k",
        };
      case "week":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [30, 45, 40, 60, 75, 90, 85],
          amounts: ["₹12k", "₹18k", "₹16k", "₹24k", "₹30k", "₹36k", "₹34k"],
          maxValue: 100,
          title: "Weekly Revenue Trend",
          subtext: "Daily sales analysis",
          totalRevenue: "₹170k",
        };
      case "month":
      default:
        return {
          labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"],
          values: [35, 50, 68, 58, 80],
          amounts: ["₹70k", "₹100k", "₹135k", "₹116k", "₹160k"],
          maxValue: 100,
          title: "Monthly Revenue Trend",
          subtext: "Weekly aggregated sales",
          totalRevenue: "₹581k",
        };
    }
  }, [filter]);

  const maxValue = Math.max(...chartData.values);
  const totalRevenue = chartData.values.reduce((a, b) => a + b, 0);
  const avgRevenue = (totalRevenue / chartData.values.length).toFixed(1);

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

      {/* Bar Chart */}
      <div className="flex-grow flex items-end justify-between gap-2 mb-6 px-2">
        {chartData.values.map((value, idx) => {
          const heightPercent = (value / maxValue) * 100;
          const isHighest = value === maxValue;
          
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
          <span className="text-sm font-bold text-gray-900 mt-1">₹{(totalRevenue / chartData.values.length).toFixed(0)}k</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-semibold">Peak Revenue</span>
          <span className="text-sm font-bold text-[var(--primary-green)] mt-1">{chartData.amounts[chartData.values.indexOf(maxValue)]}</span>
        </div>
      </div>

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
