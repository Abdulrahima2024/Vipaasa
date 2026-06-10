import { AlertTriangle } from "lucide-react";

export default function AlertBanner() {
  return (
    <div className="bg-[#fceaea] border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-gray-800">
          <span className="font-semibold text-red-700">Low Stock Alert:</span> Vipaasa Cold-Pressed Moringa Oil (4 units remaining) and Organic Saffron (2 units remaining).
        </p>
      </div>
      <button className="text-sm font-semibold text-red-600 hover:text-red-800 underline decoration-red-300 underline-offset-2 transition-colors">
        Restock Now
      </button>
    </div>
  );
}
