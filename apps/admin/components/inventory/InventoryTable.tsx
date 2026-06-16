"use client";

import { useState } from "react";
import { 
  Edit2, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  Upload,
  Percent,
  Receipt
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  prices: {
    "1kg": number;
    "500g": number;
    "250g": number;
  };
  taxRate: number; // e.g. 5%
  discount: number; // e.g. 10%
  stock: number;
  status: boolean;
  imageBg: string;
  imageEmoji: string;
}

export default function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Pure Sandalwood Oil",
      description: "Organic extraction amber bottle",
      sku: "SNDL-001-OIL",
      category: "Essential Oils",
      prices: { "1kg": 2400, "500g": 1250, "250g": 680 },
      taxRate: 18,
      discount: 10,
      stock: 85,
      status: true,
      imageBg: "bg-[#f3ece0]",
      imageEmoji: "💧"
    },
    {
      id: "2",
      name: "Rosewater Mist",
      description: "100ml pure spray bottle",
      sku: "ROSE-MST-100",
      category: "Toners",
      prices: { "1kg": 420, "500g": 220, "250g": 120 },
      taxRate: 12,
      discount: 5,
      stock: 12,
      status: true,
      imageBg: "bg-[#fbebee]",
      imageEmoji: "🌹"
    },
    {
      id: "3",
      name: "Wild Himalayan Tea",
      description: "Loose leaf medicinal tea",
      sku: "TEA-WLD-250",
      category: "Wellness",
      prices: { "1kg": 355, "500g": 180, "250g": 95 },
      taxRate: 5,
      discount: 0,
      stock: 40,
      status: false,
      imageBg: "bg-[#edf6ee]",
      imageEmoji: "🍃"
    }
  ]);

  const [categories, setCategories] = useState<string[]>([
    "Essential Oils",
    "Toners",
    "Wellness",
    "Dals & Pulses",
    "Flours",
    "Spices & Powders",
    "Honey & Ghee"
  ]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Add/Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ original: string; current: string } | null>(null);

  // Form states for product
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice1kg, setFormPrice1kg] = useState(0);
  const [formPrice500g, setFormPrice500g] = useState(0);
  const [formPrice250g, setFormPrice250g] = useState(0);
  const [formTaxRate, setFormTaxRate] = useState(5);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formStock, setFormStock] = useState(10);
  const [formStatus, setFormStatus] = useState(true);
  const [formEmoji, setFormEmoji] = useState("🌿");
  const [formBg, setFormBg] = useState("bg-[#edf6ee]");

  const toggleStatus = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: !p.status } : p));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormSku("");
    setFormCategory(categories[0] || "");
    setFormPrice1kg(0);
    setFormPrice500g(0);
    setFormPrice250g(0);
    setFormTaxRate(5);
    setFormDiscount(0);
    setFormStock(10);
    setFormStatus(true);
    setFormEmoji("🌿");
    setFormBg("bg-[#edf6ee]");
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormSku(product.sku);
    setFormCategory(product.category);
    setFormPrice1kg(product.prices["1kg"]);
    setFormPrice500g(product.prices["500g"]);
    setFormPrice250g(product.prices["250g"]);
    setFormTaxRate(product.taxRate);
    setFormDiscount(product.discount);
    setFormStock(product.stock);
    setFormStatus(product.status);
    setFormEmoji(product.imageEmoji);
    setFormBg(product.imageBg);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      // Edit mode
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formName,
        description: formDescription,
        sku: formSku,
        category: formCategory,
        prices: {
          "1kg": Number(formPrice1kg),
          "500g": Number(formPrice500g),
          "250g": Number(formPrice250g)
        },
        taxRate: Number(formTaxRate),
        discount: Number(formDiscount),
        stock: Number(formStock),
        status: formStatus,
        imageEmoji: formEmoji,
        imageBg: formBg
      } : p));
    } else {
      // Add mode
      const newProduct: Product = {
        id: (products.length + 1).toString(),
        name: formName,
        description: formDescription,
        sku: formSku || `VPA-${formName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        category: formCategory,
        prices: {
          "1kg": Number(formPrice1kg),
          "500g": Number(formPrice500g),
          "250g": Number(formPrice250g)
        },
        taxRate: Number(formTaxRate),
        discount: Number(formDiscount),
        stock: Number(formStock),
        status: formStatus,
        imageEmoji: formEmoji,
        imageBg: formBg
      };
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Are you sure you want to delete category "${cat}"? Products under it will need to be remapped.`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  const handleRenameCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.current) {
      setCategories(categories.map(c => c === editingCategory.original ? editingCategory.current : c));
      setProducts(products.map(p => p.category === editingCategory.original ? { ...p, category: editingCategory.current } : p));
      setEditingCategory(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-gray-50/20"
            placeholder="Search by name, SKU, or category..."
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3.5 pointer-events-none text-gray-500">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all bg-gray-50/50"
          >
            Manage Categories
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-[var(--primary-green)] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Product
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
              <th className="px-6 py-4 font-bold">Product Details</th>
              <th className="px-6 py-4 font-bold">SKU</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Pricing (1kg / 500g / 250g)</th>
              <th className="px-6 py-4 font-bold">Tax & Disc.</th>
              <th className="px-6 py-4 font-bold">Stock</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              // Stock colors
              let stockText = "text-gray-700";
              let stockBg = "bg-gray-50";
              if (product.stock <= 15) {
                stockText = "text-red-700 font-bold";
                stockBg = "bg-red-50 border border-red-100";
              } else if (product.stock <= 40) {
                stockText = "text-amber-700 font-bold";
                stockBg = "bg-amber-50 border border-amber-100";
              }

              return (
                <tr key={product.id} className="hover:bg-gray-50/20 transition-colors">
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
                        <div className="font-bold text-gray-900 leading-tight">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 font-semibold">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-50 border border-gray-100 text-gray-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs font-bold text-gray-950 gap-0.5">
                      <span>₹{product.prices["1kg"]} <span className="text-[10px] text-gray-400 font-semibold">/ 1kg</span></span>
                      <span>₹{product.prices["500g"]} <span className="text-[10px] text-gray-400 font-semibold">/ 500g</span></span>
                      <span>₹{product.prices["250g"]} <span className="text-[10px] text-gray-400 font-semibold">/ 250g</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Receipt className="w-3.5 h-3.5 text-gray-400" />
                        Tax: {product.taxRate}%
                      </span>
                      {product.discount > 0 ? (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md w-max">
                          <Percent className="w-3.5 h-3.5 text-red-500" />
                          {product.discount}% Off
                        </span>
                      ) : (
                        <span className="text-gray-400 font-semibold italic">No discount</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs ${stockBg} ${stockText}`}>
                      {product.stock} units
                    </span>
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
                      <button 
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-95"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                      >
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
        <span className="text-xs font-semibold text-gray-500">
          Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of <span className="font-bold text-gray-900">{products.length}</span> results
        </span>

        <div className="flex items-center gap-2">
          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white bg-[var(--primary-green)] rounded-lg">
            1
          </button>

          <button className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              
              {/* Row 1: Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Kandipappu"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
              </div>

              {/* Row 2: Description & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Description</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Premium whole grain millet"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category Mapping</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                <h4 className="text-xs font-extrabold text-[var(--primary-green)] uppercase tracking-wider border-b border-gray-200 pb-1.5">
                  Pricing Configuration
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Price (1kg)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice1kg}
                      onChange={(e) => setFormPrice1kg(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Price (500g)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice500g}
                      onChange={(e) => setFormPrice500g(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Price (250g)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice250g}
                      onChange={(e) => setFormPrice250g(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Discount Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tax Configuration (GST %)</label>
                  <select
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(Number(e.target.value))}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5% (Standard CGST/SGST)</option>
                    <option value={12}>12% (Processed items)</option>
                    <option value={18}>18% (Premium essential oils)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discount Configuration (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
              </div>

              {/* Aesthetics: Image Emoji, Background, & Active toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image / Emoji Icon</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Color Style</label>
                  <select
                    value={formBg}
                    onChange={(e) => setFormBg(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white"
                  >
                    <option value="bg-[#f3ece0]">Gold Cream</option>
                    <option value="bg-[#edf6ee]">Mint Green</option>
                    <option value="bg-[#fbebee]">Rose Pink</option>
                    <option value="bg-gray-100">Classic Grey</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formStatus}
                      onChange={(e) => setFormStatus(e.target.checked)}
                      className="rounded border-gray-300 text-[var(--primary-green)] focus:ring-[var(--primary-green)] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Product Activated</span>
                  </label>
                </div>
              </div>

              {/* Drag and Drop Image upload mockup */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Product Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[var(--primary-green)]/40 transition-colors cursor-pointer bg-gray-50/30">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-bold">Drag and drop files here, or click to upload</p>
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--primary-green)] text-white hover:bg-[var(--primary-hover)] rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Manage Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Category creation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Create New Category</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Dried Fruits"
                    className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="bg-[var(--primary-green)] text-white hover:bg-[var(--primary-hover)] px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Existing Categories</label>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between p-3 hover:bg-gray-50/50">
                      {editingCategory?.original === cat ? (
                        <form onSubmit={handleRenameCategory} className="flex-grow flex gap-2 mr-2">
                          <input
                            type="text"
                            value={editingCategory.current}
                            onChange={(e) => setEditingCategory({ ...editingCategory, current: e.target.value })}
                            className="flex-grow px-2 py-1 border border-gray-200 rounded-lg text-xs"
                          />
                          <button type="submit" className="text-xs font-bold text-[var(--primary-green)] hover:underline">Save</button>
                          <button type="button" onClick={() => setEditingCategory(null)} className="text-xs font-bold text-gray-400 hover:underline">Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-gray-800">{cat}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCategory({ original: cat, current: cat })}
                              className="text-xs font-bold text-[var(--primary-green)] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
