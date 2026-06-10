"use client";

import { useState } from "react";
import { Edit2, Trash2, Search, SlidersHorizontal, ChevronDown, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  maxStock: number;
  status: boolean;
  imageBg: string;
  imageEmoji: string;
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pure Sandalwood Oil",
      description: "30ml Amber Glass",
      sku: "SNDL-001-OIL",
      category: "Essential Oils",
      price: "$124.00",
      stock: 85,
      maxStock: 100,
      status: true,
      imageBg: "bg-[#f3ece0]",
      imageEmoji: "💧"
    },
    {
      id: "2",
      name: "Rosewater Mist",
      description: "100ml Spray Bottle",
      sku: "ROSE-MST-100",
      category: "Toners",
      price: "$42.00",
      stock: 12,
      maxStock: 100,
      status: true,
      imageBg: "bg-[#fbebee]",
      imageEmoji: "🌹"
    },
    {
      id: "3",
      name: "Wild Himalayan Tea",
      description: "250g Loose Leaf",
      sku: "TEA-WLD-250",
      category: "Wellness",
      price: "$35.50",
      stock: 40,
      maxStock: 100,
      status: false,
      imageBg: "bg-[#edf6ee]",
      imageEmoji: "🍃"
    }
  ]);

  const toggleStatus = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: !p.status } : p));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
            placeholder="Search by name, SKU, or category..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-gray-50/50">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            Filters
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-gray-50/50">
            Bulk Actions
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <Download className="h-4 w-4" />
          </button>

          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">SKU</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              // Stock bar color
              let barColor = "bg-[var(--primary-green)]";
              if (product.stock <= 15) {
                barColor = "bg-red-500";
              } else if (product.stock <= 40) {
                barColor = "bg-[#c6d7cd]";
              }

              // Category tag styles
              let catStyle = "bg-gray-100 text-gray-800";
              if (product.category === "Essential Oils") {
                catStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
              } else if (product.category === "Toners") {
                catStyle = "bg-teal-50 text-teal-700 border border-teal-100";
              } else if (product.category === "Wellness") {
                catStyle = "bg-green-50 text-green-700 border border-green-100";
              }

              return (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${product.imageBg} shadow-sm border border-gray-100`}>
                        {product.imageEmoji}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${catStyle}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{product.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 w-32">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${(product.stock / product.maxStock) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        product.status ? 'bg-[var(--primary-green)]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          product.status ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 flex items-center justify-between border-t border-gray-100 bg-white">
        <span className="text-xs font-medium text-gray-500">
          Showing <span className="font-semibold text-gray-900">1 to 3</span> of <span className="font-semibold text-gray-900">1,284</span> results
        </span>

        <div className="flex items-center gap-2">
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-white bg-[var(--primary-green)] rounded-lg">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">
            3
          </button>
          <span className="text-xs font-semibold text-gray-400 px-1">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">
            428
          </button>

          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
