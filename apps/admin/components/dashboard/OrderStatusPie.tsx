"use client";

import { useMemo } from "react";
import { Package } from "lucide-react";

interface OrderStatusPieProps {
  filter: "today" | "week" | "month";
  data?: {
    delivered: number;
    pending: number;
    cancelled: number;
    returned: number;
  };
  loading?: boolean;
}

export default function OrderStatusPie({ filter, data, loading }: OrderStatusPieProps) {
  const stats = useMemo(() => {
    if (data) return data;
    return {
      delivered: 0,
      pending: 0,
      cancelled: 0,
      returned: 0,
    };
  }, [data]);

  const total = stats.delivered + stats.pending + stats.cancelled + stats.returned;

  // Pie angles
  const angles = useMemo(() => {
    if (total === 0) {
      return {
        deliveredDash: "0 100",
        pendingDash: "0 100",
        cancelledDash: "0 100",
        returnedDash: "0 100",
        pendingOffset: 0,
        cancelledOffset: 0,
        returnedOffset: 0,
      };
    }

    const dPct = stats.delivered / total;
    const pPct = stats.pending / total;
    const cPct = stats.cancelled / total;
    const rPct = stats.returned / total;

    // Circumference for stroke-dasharray (Radius = 15.915, Circ = 100)
    const circ = 100;
    const dStroke = dPct * circ;
    const pStroke = pPct * circ;
    const cStroke = cPct * circ;
    const rStroke = rPct * circ;

    return {
      deliveredDash: `${dStroke} ${circ - dStroke}`,
      pendingDash: `${pStroke} ${circ - pStroke}`,
      cancelledDash: `${cStroke} ${circ - cStroke}`,
      returnedDash: `${rStroke} ${circ - rStroke}`,
      pendingOffset: 100 - dStroke,
      cancelledOffset: 100 - dStroke - pStroke,
      returnedOffset: 100 - dStroke - pStroke - cStroke,
    };
  }, [stats, total]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-2">OrderStatus</h2>
      <p className="text-sm text-gray-500 mb-6">Breakdown of order fulfillments</p>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-8 text-gray-400 text-sm">
          Loading order stats...
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400 text-sm text-center">
          <Package className="h-8 w-8 mb-2 text-gray-300" />
          No order data available for this period.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-8 justify-center flex-1">
          {/* Donut Chart */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="3.2" />

              {/* Delivered */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="var(--primary-green)"
                strokeWidth="3.2"
                strokeDasharray={angles.deliveredDash}
                strokeDashoffset={0}
              />

              {/* Pending */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#e5c158"
                strokeWidth="3.2"
                strokeDasharray={angles.pendingDash}
                strokeDashoffset={angles.pendingOffset}
              />

              {/* Cancelled */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="3.2"
                strokeDasharray={angles.cancelledDash}
                strokeDashoffset={angles.cancelledOffset}
              />

              {/* Returned */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="#6b7280"
                strokeWidth="3.2"
                strokeDasharray={angles.returnedDash}
                strokeDashoffset={angles.returnedOffset}
              />
            </svg>

            {/* Center text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-xl font-extrabold text-gray-900">{total}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Orders</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 flex-1 min-w-[120px]">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-green)]" />
                <span>Delivered</span>
              </div>
              <span className="text-gray-900">{stats.delivered}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5c158]" />
                <span>Pending</span>
              </div>
              <span className="text-gray-900">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span>Cancelled</span>
              </div>
              <span className="text-gray-900">{stats.cancelled}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6b7280]" />
                <span>Returned</span>
              </div>
              <span className="text-gray-900">{stats.returned}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
