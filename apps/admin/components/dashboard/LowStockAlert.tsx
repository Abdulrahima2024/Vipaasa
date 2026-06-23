"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
}

interface LowStockAlertProps {
  items?: LowStockItem[];
  loading?: boolean;
}

const DEFAULT_ITEMS: LowStockItem[] = [];

export default function LowStockAlert({ items = DEFAULT_ITEMS, loading }: LowStockAlertProps) {
  const [localItems, setLocalItems] = useState<LowStockItem[]>([]);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleRestock = (id: string) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, currentStock: item.minStock + 10 } : item
      ).filter((item) => item.currentStock <= item.minStock)
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Low Stock Alert</h2>
        </div>
        <span className="bg-red-50 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-100">
          {loading ? "..." : `${localItems.length} Critical`}
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-6 text-center text-gray-400 text-sm">
          Loading low stocks...
        </div>
      ) : localItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-gray-500">
          <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium">All stocks healthy!</span>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[260px] pr-1">
          {localItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors"
            >
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</span>
                <span className="block text-[10px] text-gray-400 font-mono">{item.sku}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-bold text-red-600">{item.currentStock} left</span>
                  <span className="block text-[9px] text-gray-400 font-medium">Min: {item.minStock}</span>
                </div>
                <button
                  onClick={() => handleRestock(item.id)}
                  className="p-1.5 bg-gray-100 hover:bg-[var(--primary-green)] hover:text-white rounded-lg text-gray-500 transition-all active:scale-95"
                  title="Restock Item"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
