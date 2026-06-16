"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Settings2, 
  Activity, 
  Warehouse, 
  Store, 
  ShieldAlert, 
  Sliders, 
  RefreshCcw,
  Sparkles,
  ArrowUpDown,
  AlertTriangle
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitType: string; // e.g. "kg", "grams", "liters"
  purchaseCost: number;
  sellingPrice: number;
  openingStock: number;
  warehouseStock: number;
  storeStock: number;
  reservedStock: number;
  lowStockAlert: number;
}

export default function InventoryPage() {
  // Inventory database state
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Kandipappu",
      sku: "VPA-DAL-001",
      category: "Dals & Pulses",
      unitType: "kg",
      purchaseCost: 160,
      sellingPrice: 240,
      openingStock: 150,
      warehouseStock: 80,
      storeStock: 20,
      reservedStock: 5,
      lowStockAlert: 25,
    },
    {
      id: "2",
      name: "Pottu Minapappu",
      sku: "VPA-DAL-002",
      category: "Dals & Pulses",
      unitType: "kg",
      purchaseCost: 130,
      sellingPrice: 196,
      openingStock: 120,
      warehouseStock: 65,
      storeStock: 15,
      reservedStock: 2,
      lowStockAlert: 20,
    },
    {
      id: "3",
      name: "Wild Forest Honey",
      sku: "VPA-HNY-037",
      category: "Honey & Ghee",
      unitType: "liters",
      purchaseCost: 280,
      sellingPrice: 420,
      openingStock: 80,
      warehouseStock: 30,
      storeStock: 12,
      reservedStock: 4,
      lowStockAlert: 15,
    },
    {
      id: "4",
      name: "Desi Cow Ghee",
      sku: "VPA-GHE-040",
      category: "Honey & Ghee",
      unitType: "liters",
      purchaseCost: 2900,
      sellingPrice: 4200,
      openingStock: 40,
      warehouseStock: 8,
      storeStock: 4,
      reservedStock: 3,
      lowStockAlert: 10,
    },
    {
      id: "5",
      name: "Korralu",
      sku: "VPA-MIL-013",
      category: "Millets & Grains",
      unitType: "kg",
      purchaseCost: 70,
      sellingPrice: 108,
      openingStock: 200,
      warehouseStock: 120,
      storeStock: 40,
      reservedStock: 8,
      lowStockAlert: 30,
    }
  ]);

  // Auto Inventory Rules states
  const [ruleOnlineOrder, setRuleOnlineOrder] = useState(true);
  const [ruleStoreSale, setRuleStoreSale] = useState(true);
  const [ruleCancellation, setRuleCancellation] = useState(true);
  const [ruleReturn, setRuleReturn] = useState(true);

  // Modal Adjustment Form State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"add" | "subtract" | "damaged">("add");
  const [adjustLocation, setAdjustLocation] = useState<"warehouse" | "store">("warehouse");
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState("Restock audit intake");

  // Summary Metrics calculations
  const totalWarehouseStock = inventory.reduce((acc, item) => acc + item.warehouseStock, 0);
  const totalStoreStock = inventory.reduce((acc, item) => acc + item.storeStock, 0);
  const totalReservedStock = inventory.reduce((acc, item) => acc + item.reservedStock, 0);
  const totalCurrentStock = totalWarehouseStock + totalStoreStock;
  const totalAvailableStock = totalCurrentStock - totalReservedStock;

  // Open adjustment dialog helper
  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustType("add");
    setAdjustLocation("warehouse");
    setAdjustQty(1);
    setAdjustReason("Restock audit intake");
    setIsAdjustOpen(true);
  };

  // Adjust stock handler
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== selectedItem.id) return item;

        let delta = adjustQty;
        if (adjustType === "subtract" || adjustType === "damaged") {
          delta = -adjustQty;
        }

        const isWarehouse = adjustLocation === "warehouse";
        let newWarehouse = item.warehouseStock;
        let newStore = item.storeStock;

        if (isWarehouse) {
          newWarehouse = Math.max(0, item.warehouseStock + delta);
        } else {
          newStore = Math.max(0, item.storeStock + delta);
        }

        return {
          ...item,
          warehouseStock: newWarehouse,
          storeStock: newStore,
        };
      })
    );

    setIsAdjustOpen(false);
  };

  // Simulate transactions to show Auto Inventory Rules in action
  const [simFeedback, setSimFeedback] = useState("");
  const simulateOnlineOrder = () => {
    if (!ruleOnlineOrder) {
      setSimFeedback("Simulation skipped: Rule 'Reduce Stock on Online Order' is disabled.");
      return;
    }
    // pick first product (Kandipappu) to adjust
    setInventory((prev) =>
      prev.map((item, idx) => {
        if (idx === 0) {
          const qty = 1;
          const warehouseReduction = Math.min(item.warehouseStock, qty);
          return {
            ...item,
            warehouseStock: item.warehouseStock - warehouseReduction,
            reservedStock: item.reservedStock + qty,
          };
        }
        return item;
      })
    );
    setSimFeedback("Rule Triggered: 1 unit of Kandipappu allocated (Warehouse stock reduced by 1, Reserved stock increased by 1).");
  };

  const simulateStoreSale = () => {
    if (!ruleStoreSale) {
      setSimFeedback("Simulation skipped: Rule 'Reduce Stock on Store Sale' is disabled.");
      return;
    }
    setInventory((prev) =>
      prev.map((item, idx) => {
        if (idx === 0) {
          const storeReduction = Math.min(item.storeStock, 1);
          return {
            ...item,
            storeStock: item.storeStock - storeReduction,
          };
        }
        return item;
      })
    );
    setSimFeedback("Rule Triggered: Direct storefront sale completed. 1 unit of Kandipappu deducted from Retail Store stock.");
  };

  const simulateCancellation = () => {
    if (!ruleCancellation) {
      setSimFeedback("Simulation skipped: Rule 'Increase Stock on Cancellation' is disabled.");
      return;
    }
    setInventory((prev) =>
      prev.map((item, idx) => {
        if (idx === 0) {
          const reservedReduction = Math.min(item.reservedStock, 1);
          return {
            ...item,
            reservedStock: item.reservedStock - reservedReduction,
            warehouseStock: item.warehouseStock + reservedReduction,
          };
        }
        return item;
      })
    );
    setSimFeedback("Rule Triggered: Order Cancelled. 1 reserved unit returned to Warehouse active stock.");
  };

  const simulateReturn = () => {
    if (!ruleReturn) {
      setSimFeedback("Simulation skipped: Rule 'Increase Stock on Return' is disabled.");
      return;
    }
    setInventory((prev) =>
      prev.map((item, idx) => {
        if (idx === 0) {
          return {
            ...item,
            warehouseStock: item.warehouseStock + 1,
          };
        }
        return item;
      })
    );
    setSimFeedback("Rule Triggered: Return processed. 1 returned unit added back to Warehouse inventory.");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Inventory Ledger & Rules</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure stock ledgers, adjustments, and automated rules.</p>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
            <Activity className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Stock</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">{totalCurrentStock}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-[var(--primary-green)] bg-emerald-50">
            <Warehouse className="w-6 h-6 text-[var(--primary-green)]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Warehouse Stock</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">{totalWarehouseStock}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-teal-600 bg-teal-50">
            <Store className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Retail Store Stock</span>
            <span className="block text-2xl font-bold text-gray-900 mt-0.5">{totalStoreStock}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-amber-600 bg-amber-50">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Reserved Stock</span>
            <span className="block text-2xl font-bold text-[#b4771f] mt-0.5">{totalReservedStock}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-green-600 bg-green-50">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Available Sellable</span>
            <span className="block text-2xl font-bold text-green-800 mt-0.5">{totalAvailableStock}</span>
          </div>
        </div>
      </div>

      {/* Main Stock Ledger table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Active Stock Ledgers</h2>
          <p className="text-xs text-gray-500 mt-0.5">Product Master configurations and stock allocation metrics</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Product Name</th>
                <th className="px-6 py-4 font-bold">SKU</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold text-center">Unit</th>
                <th className="px-6 py-4 font-bold text-right">Costs & Prices</th>
                <th className="px-6 py-4 font-bold text-center">Warehouse Stock</th>
                <th className="px-6 py-4 font-bold text-center">Store Stock</th>
                <th className="px-6 py-4 font-bold text-center">Reserved</th>
                <th className="px-6 py-4 font-bold text-center">Available Sellable</th>
                <th className="px-6 py-4 font-bold text-center">Stock Alert</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {inventory.map((item) => {
                const current = item.warehouseStock + item.storeStock;
                const available = current - item.reservedStock;
                const isLow = available <= item.lowStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[11px] font-bold text-gray-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs uppercase font-bold text-gray-500">{item.unitType}</td>
                    <td className="px-6 py-4 text-right text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-400">Cost: <span className="text-gray-800 font-bold">₹{item.purchaseCost}</span></span>
                        <span className="text-gray-400">Sell: <span className="text-gray-900 font-bold">₹{item.sellingPrice}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{item.warehouseStock}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900">{item.storeStock}</td>
                    <td className="px-6 py-4 text-center font-semibold text-amber-600">{item.reservedStock}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      <span className={isLow ? "text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded" : "text-emerald-700"}>
                        {available}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs font-semibold">Healthy</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="bg-gray-100 hover:bg-[var(--primary-green)] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto Inventory Rules & Simulation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Rules panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-[var(--primary-green)]" />
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Auto Inventory Rules</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Manage how transactions automatically affect system stock.</p>
          </div>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-sm font-bold text-gray-800">Reduce Stock on Online Order</span>
                <span className="block text-xs text-gray-400">Deducts sellable stock immediately on order checkout placement</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleOnlineOrder}
                  onChange={(e) => setRuleOnlineOrder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-sm font-bold text-gray-800">Reduce Stock on Store Sale</span>
                <span className="block text-xs text-gray-400">Deducts active shelf stock on barcode registers scan</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleStoreSale}
                  onChange={(e) => setRuleStoreSale(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-sm font-bold text-gray-800">Increase Stock on Cancellation</span>
                <span className="block text-xs text-gray-400">Releases allocated reservation and increments sellable levels</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleCancellation}
                  onChange={(e) => setRuleCancellation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="block text-sm font-bold text-gray-800">Increase Stock on Return</span>
                <span className="block text-xs text-gray-400">Increments warehouse stock upon return authorization receipt</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleReturn}
                  onChange={(e) => setRuleReturn(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-green)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Live Simulator console */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Auto Rules Simulator</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Trigger transaction simulation scripts to test active rules.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <button
              onClick={simulateOnlineOrder}
              className="bg-gray-50 border border-gray-150 hover:bg-emerald-50 hover:border-emerald-200 text-gray-800 hover:text-emerald-800 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">Online Order Checkout</span>
              <span className="text-[10px] text-gray-400 group-hover:text-emerald-600 font-semibold uppercase">Trigger Rule</span>
            </button>

            <button
              onClick={simulateStoreSale}
              className="bg-gray-50 border border-gray-150 hover:bg-teal-50 hover:border-teal-200 text-gray-800 hover:text-teal-800 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">Direct Store Sale</span>
              <span className="text-[10px] text-gray-400 group-hover:text-teal-600 font-semibold uppercase">Trigger Rule</span>
            </button>

            <button
              onClick={simulateCancellation}
              className="bg-gray-50 border border-gray-150 hover:bg-amber-50 hover:border-amber-200 text-gray-800 hover:text-amber-800 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">Order Cancelled</span>
              <span className="text-[10px] text-gray-400 group-hover:text-amber-600 font-semibold uppercase">Trigger Rule</span>
            </button>

            <button
              onClick={simulateReturn}
              className="bg-gray-50 border border-gray-150 hover:bg-purple-50 hover:border-purple-200 text-gray-800 hover:text-purple-800 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 transition-all group cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">Return Processed</span>
              <span className="text-[10px] text-gray-400 group-hover:text-purple-600 font-semibold uppercase">Trigger Rule</span>
            </button>
          </div>

          <div className="bg-[#FAF8F5] border border-[#EAE6DB]/60 p-4 rounded-xl mt-4">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Simulation Log Feed</span>
            <div className="text-xs font-mono text-gray-700 leading-relaxed min-h-[44px]">
              {simFeedback ? (
                <span className="text-emerald-700 font-semibold">{simFeedback}</span>
              ) : (
                <span className="text-gray-400 italic">No events triggered. Click a trigger script to test.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {isAdjustOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Stock Adjustment</h3>
              <button onClick={() => setIsAdjustOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-6">
              
              {/* Product Info Readonly */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase">Product</span>
                  <span className="block text-sm font-bold text-gray-900">{selectedItem.name}</span>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="block text-xs font-bold text-gray-400 uppercase">SKU</span>
                  <span className="block text-xs font-mono font-bold text-gray-600">{selectedItem.sku}</span>
                </div>
              </div>

              {/* Adjustment Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                >
                  <option value="add">Add Stock (Received Shipment / Audit Correction)</option>
                  <option value="subtract">Subtract Stock (Usage / Audit Correction)</option>
                  <option value="damaged">Damaged Stock Entry (Write-off)</option>
                </select>
              </div>

              {/* Grid: Location & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inventory Location</label>
                  <select
                    value={adjustLocation}
                    onChange={(e) => setAdjustLocation(e.target.value as any)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                  >
                    <option value="warehouse">Main Warehouse</option>
                    <option value="store">Retail Storefront</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity ({selectedItem.unitType})</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
              </div>

              {/* Adjustment Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical inventory reconciliation"
                  className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary-green)] text-white hover:bg-[var(--primary-hover)] rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

// Simple internal icon helper since lucide X can be handled custom or imported
function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
