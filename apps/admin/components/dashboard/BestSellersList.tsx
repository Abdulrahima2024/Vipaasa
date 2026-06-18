import { ShoppingBag } from "lucide-react";

interface BestSellerProduct {
  name: string;
  sold: number;
  max: number;
}

interface BestSellersListProps {
  data?: BestSellerProduct[];
  loading?: boolean;
}

export default function BestSellersList({ data, loading }: BestSellersListProps) {
  const products = data || [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-6">Best Sellers</h2>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Loading best sellers...
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm text-center py-6">
          <ShoppingBag className="h-8 w-8 mb-2 text-gray-300" />
          No best sellers found.
        </div>
      ) : (
        <div className="space-y-5 flex-1">
          {products.map((product) => (
            <div key={product.name} className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-800">{product.name}</span>
                <span className="text-gray-500">{product.sold} Sold</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-[var(--primary-green)] h-2 rounded-full"
                  style={{ width: `${(product.sold / product.max) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 mt-4 border-t border-gray-100 text-center">
        <button className="text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-hover)] transition-colors">
          View All Products
        </button>
      </div>
    </div>
  );
}

