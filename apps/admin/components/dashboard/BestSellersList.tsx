export default function BestSellersList() {
  const products = [
    { name: "Amla Vitality Serum", sold: 324, max: 400 },
    { name: "Moringa Face Oil", sold: 280, max: 400 },
    { name: "Turmeric Ashwagandha Tea", sold: 195, max: 400 },
    { name: "Rose Petal Infusion", sold: 142, max: 400 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-6">Best Sellers</h2>

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

      <div className="pt-6 mt-4 border-t border-gray-100 text-center">
        <button className="text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-hover)] transition-colors">
          View All Products
        </button>
      </div>
    </div>
  );
}
