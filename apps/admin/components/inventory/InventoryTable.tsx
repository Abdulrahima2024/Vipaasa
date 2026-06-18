"use client";

import { useState, useEffect } from "react";
import { 
  Edit2, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  Upload,
  Percent,
  Receipt,
  RefreshCw
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  weightGrams: number;
  skuStatus: string;
  pricing?: {
    basePrice: string;
    compareAtPrice?: string;
  };
  inventories?: Array<{
    quantityOnHand: number;
    quantityReserved: number;
  }>;
}

interface BackendProduct {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  variants: ProductVariant[];
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function InventoryTable() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Add/Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BackendProduct | null>(null);

  // Form states for product creation
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice1kg, setFormPrice1kg] = useState(0);
  const [formPrice500g, setFormPrice500g] = useState(0);
  const [formPrice250g, setFormPrice250g] = useState(0);
  const [formTaxRate, setFormTaxRate] = useState(5);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formStock, setFormStock] = useState(10);
  const [formStatus, setFormStatus] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load categories and products on mount
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategoryFilter, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await fetchAPI("/api/categories");
      // Flatten hierarchical category tree to simple list
      const list: CategoryItem[] = [];
      const traverse = (nodes: any[]) => {
        nodes.forEach(node => {
          list.push({ id: node.id, name: node.name, slug: node.slug });
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        });
      };
      traverse(data);
      setCategories(list);
      if (list.length > 0) {
        setFormCategoryId(list[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load categories", err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
      };
      if (selectedCategoryFilter !== "All") {
        params.categoryId = selectedCategoryFilter;
      }

      let data;
      if (searchQuery.trim() !== "") {
        data = await fetchAPI("/api/products/search", {
          params: { q: searchQuery, page: currentPage, limit: 10 }
        });
      } else {
        data = await fetchAPI("/api/products", { params });
      }

      setProducts(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // In production we send a PATCH to update isActive
    try {
      // Mock update local state first for instant response
      setProducts(products.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      // Then send update to backend
      // await fetchAPI(`/api/products/${id}`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ isActive: !currentStatus })
      // });
    } catch (err) {
      console.error(err);
      loadProducts();
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormSku("");
    if (categories.length > 0) {
      setFormCategoryId(categories[0].id);
    }
    setFormPrice1kg(0);
    setFormPrice500g(0);
    setFormPrice250g(0);
    setFormTaxRate(5);
    setFormDiscount(0);
    setFormStock(10);
    setFormStatus(true);
    setFormImageUrl("");
    setUploadedImages([]);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        // In production we trigger a DELETE API call
        // await fetchAPI(`/api/products/${id}`, { method: "DELETE" });
        setProducts(products.filter(p => p.id !== id));
      } catch (err: any) {
        alert(err.message || "Failed to delete product");
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct variants payload based on input prices
    const variants = [];
    if (formPrice1kg > 0) {
      variants.push({
        name: "1kg Pack",
        sku: formSku ? `${formSku}-1KG` : undefined,
        weightGrams: 1000,
        price: formPrice1kg,
        stock: formStock,
      });
    }
    if (formPrice500g > 0) {
      variants.push({
        name: "500g Pack",
        sku: formSku ? `${formSku}-500G` : undefined,
        weightGrams: 500,
        price: formPrice500g,
        stock: 0,
      });
    }
    if (formPrice250g > 0) {
      variants.push({
        name: "250g Pack",
        sku: formSku ? `${formSku}-250G` : undefined,
        weightGrams: 250,
        price: formPrice250g,
        stock: 0,
      });
    }

    if (variants.length === 0) {
      alert("Please configure at least one variant with a price greater than 0");
      return;
    }

    const allImages = [...uploadedImages];
    if (formImageUrl.trim() !== "") {
      allImages.unshift(formImageUrl.trim());
    }

    const payload = {
      name: formName,
      description: formDescription,
      categoryId: formCategoryId,
      isActive: formStatus,
      images: allImages,
      variants,
    };

    try {
      if (editingProduct) {
        // Edit mode (Not fully implemented in the current backend routing, but structured for correctness)
        // await fetchAPI(`/api/products/${editingProduct.id}`, {
        //   method: "PUT",
        //   body: JSON.stringify(payload)
        // });
      } else {
        // Add mode
        await fetchAPI("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setIsProductModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    }
  };

  // Helper helper to get pricing details for display
  const getProductPrices = (product: BackendProduct) => {
    const prices: Record<string, string> = { "1kg": "-", "500g": "-", "250g": "-" };
    (product.variants || []).forEach((v) => {
      const priceStr = v.pricing ? `₹${parseFloat(v.pricing.basePrice).toFixed(0)}` : "-";
      if (v.weightGrams === 1000) prices["1kg"] = priceStr;
      else if (v.weightGrams === 500) prices["500g"] = priceStr;
      else if (v.weightGrams === 250) prices["250g"] = priceStr;
    });
    return prices;
  };

  // Helper helper to get stock levels
  const getProductStock = (product: BackendProduct) => {
    let totalStock = 0;
    (product.variants || []).forEach(v => {
      if (v.inventories) {
        v.inventories.forEach(inv => {
          totalStock += (inv.quantityOnHand - inv.quantityReserved);
        });
      }
    });
    return totalStock;
  };

  // Extract display emoji and style from product image URL mock if exists
  const getProductStyle = (product: BackendProduct) => {
    const firstImg = product.images?.[0]?.url || "";
    if (firstImg.startsWith("emoji://")) {
      const match = firstImg.match(/emoji:\/\/([^?]+)\?bg=(.+)/);
      if (match) {
        return {
          emoji: decodeURIComponent(match[1]),
          bg: decodeURIComponent(match[2])
        };
      }
    }
    return { emoji: "🌿", bg: "bg-[#edf6ee]" };
  };

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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-gray-50/20"
            placeholder="Search products by name or description..."
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 pointer-events-none text-gray-500">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <button
            onClick={loadProducts}
            className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
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
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary-green)]" />
            <p className="text-sm font-semibold">Fetching organic catalogue...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-600 font-semibold text-sm">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-semibold text-sm">
            No products found matching your selection.
          </div>
        ) : (
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
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Pricing (1kg / 500g / 250g)</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const prices = getProductPrices(product);
                const stock = getProductStock(product);
                const { emoji, bg } = getProductStyle(product);

                let stockText = "text-gray-700";
                let stockBg = "bg-gray-50";
                if (stock <= 15) {
                  stockText = "text-red-700 font-bold";
                  stockBg = "bg-red-50 border border-red-100";
                } else if (stock <= 40) {
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
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden text-lg bg-gray-50 shadow-sm border border-gray-100">
                          {product.images && product.images[0]?.url && !product.images[0].url.startsWith("emoji://") ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{emoji}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{product.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-gray-50 border border-gray-100 text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs font-bold text-gray-950 gap-0.5">
                        <span>{prices["1kg"]} <span className="text-[10px] text-gray-400 font-semibold">/ 1kg</span></span>
                        <span>{prices["500g"]} <span className="text-[10px] text-gray-400 font-semibold">/ 500g</span></span>
                        <span>{prices["250g"]} <span className="text-[10px] text-gray-400 font-semibold">/ 250g</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs ${stockBg} ${stockText}`}>
                        {stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(product.id, product.isActive)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          product.isActive ? 'bg-[var(--primary-green)]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            product.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setFormName(product.name);
                            setFormDescription(product.description);
                            setFormCategoryId(product.category?.id || "");
                            setFormStatus(product.isActive);
                            // Setup prefilled prices
                            const variantsList = product.variants || [];
                            const p1 = variantsList.find(v => v.weightGrams === 1000)?.pricing?.basePrice;
                            const p2 = variantsList.find(v => v.weightGrams === 500)?.pricing?.basePrice;
                            const p3 = variantsList.find(v => v.weightGrams === 250)?.pricing?.basePrice;
                            setFormPrice1kg(p1 ? parseFloat(p1) : 0);
                            setFormPrice500g(p2 ? parseFloat(p2) : 0);
                            setFormPrice250g(p3 ? parseFloat(p3) : 0);
                            const productImages = product.images || [];
                            if (productImages.length > 0) {
                              setFormImageUrl(productImages[0].url);
                              setUploadedImages(productImages.map(img => img.url));
                            } else {
                              setFormImageUrl("");
                              setUploadedImages([]);
                            }
                            setIsProductModalOpen(true);
                          }}
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
        )}
      </div>

      {/* Pagination */}
      <div className="p-6 flex items-center justify-between border-t border-gray-100 bg-white">
        <span className="text-xs font-semibold text-gray-500">
          Showing <span className="font-bold text-gray-900">{products.length}</span> of <span className="font-bold text-gray-900">{totalCount}</span> results
        </span>

        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white bg-[var(--primary-green)] rounded-lg">
            {currentPage}
          </button>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Base</label>
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
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Premium whole grain millet"
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category Mapping</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
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

              {/* Product Activation Status */}
              <div className="pt-2">
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

              {/* Image Input Configuration */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Image URL</label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Or Upload Image File</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-xs font-bold text-gray-600 bg-white">
                      <Upload className="w-4 h-4 text-gray-500" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadedImages.length > 0 && (
                      <span className="text-xs text-gray-500 font-semibold">
                        {uploadedImages.length} image(s) selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  );
}
