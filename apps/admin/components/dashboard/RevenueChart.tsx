"use client";

import { useMemo } from "react";

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
          yAxis: ["₹8k", "₹6k", "₹4k", "₹2k", "₹0"],
          title: "Today's Revenue Trend",
          subtext: "Hourly sales analysis",
        };
      case "week":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [30, 45, 40, 60, 75, 90, 85],
          amounts: ["₹12k", "₹18k", "₹16k", "₹24k", "₹30k", "₹36k", "₹34k"],
          yAxis: ["₹40k", "₹30k", "₹20k", "₹10k", "₹0"],
          title: "Weekly Revenue Trend",
          subtext: "Daily sales analysis",
        };
      case "month":
      default:
        return {
          labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"],
          values: [40, 60, 55, 85],
          amounts: ["₹80k", "₹120k", "₹110k", "₹170k"],
          yAxis: ["₹200k", "₹150k", "₹100k", "₹50k", "₹0"],
          title: "Monthly Revenue Trend",
          subtext: "Weekly aggregated sales",
        };
    }
  }, [filter]);

  // Points list coordinates
  const points = useMemo(() => {
    const totalPoints = chartData.values.length;
    return chartData.values.map((val, idx) => ({
      x: (idx / (totalPoints - 1)) * 100,
      y: 100 - val
    }));
  }, [chartData]);

  // Generate smooth cubic bezier spline path
  const svgPath = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      // Tangents calculated as horizontal control points (smooth ease-in-out)
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Generate smooth area fill path
  const svgFillPath = useMemo(() => {
    if (points.length === 0) return "";
    return `${svgPath} L 100 100 L 0 100 Z`;
  }, [points, svgPath]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{chartData.title}</h2>
          <p className="text-sm text-gray-500">{chartData.subtext}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Revenue</span>
        </div>
      </div>

      {/* Main Chart Container with Y-Axis column and Chart space */}
      <div className="flex-grow flex gap-4 mt-6">
        
        {/* Y-Axis Labels Column */}
        <div className="flex flex-col justify-between text-[10px] font-bold text-gray-400 h-48 select-none text-right w-10 pb-4">
          {chartData.yAxis.map((val, idx) => (
            <span key={idx}>{val}</span>
          ))}
        </div>

        {/* Chart Viewport Wrapper */}
        <div className="flex-grow relative h-48">
          
          {/* SVG Canvas */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid horizontal lines */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="#f9fafb" strokeWidth="0.5" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="1" />

            {/* Area Fill */}
            <path d={svgFillPath} fill="url(#greenGrad)" className="transition-all duration-700 ease-in-out" />

            {/* Line Path */}
            <path
              d={svgPath}
              fill="none"
              stroke="var(--primary-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-700 ease-in-out"
            />

            {/* Gradient Definition */}
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1f5c43" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#1f5c43" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Data Points */}
            {points.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="white"
                  stroke="var(--primary-green)"
                  strokeWidth="2.5"
                  className="transition-all duration-500 hover:scale-125 focus:outline-none"
                />
                <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
              </g>
            ))}
          </svg>

          {/* Floating Amount Tooltips aligned with point positions */}
          <div className="absolute inset-0 pointer-events-none">
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="absolute flex flex-col items-center select-none"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: "translate(-50%, -125%)",
                }}
              >
                <span className="text-[10px] font-bold text-gray-700 bg-white border border-gray-150 rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap animate-in fade-in duration-300">
                  {chartData.amounts[idx]}
                </span>
                {/* Arrow */}
                <div className="w-1.5 h-1.5 bg-white border-r border-b border-gray-150 transform rotate-45 -mt-1" />
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* X-Axis Labels aligned with the chart viewport */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50 text-[11px] font-semibold text-gray-400 pl-14">
        {chartData.labels.map((lbl, idx) => (
          <span key={idx} className="w-12 text-center select-none">
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}
