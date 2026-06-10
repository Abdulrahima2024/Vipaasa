import { MoreHorizontal } from "lucide-react";

export default function RecentOrdersTable() {
  const orders = [
    { id: "#VIP-9920", customer: "Elena Dubois", initials: "ED", color: "bg-green-100 text-green-700", date: "Oct 24, 2024", total: "$142.00", status: "Shipped", statusColor: "bg-green-100 text-green-700" },
    { id: "#VIP-9919", customer: "Marcus Sterling", initials: "MS", color: "bg-pink-100 text-pink-700", date: "Oct 24, 2024", total: "$89.50", status: "Processing", statusColor: "bg-gray-100 text-gray-700" },
    { id: "#VIP-9918", customer: "Sarah Jenkins", avatar: "SJ", color: "bg-orange-100 text-orange-700", date: "Oct 23, 2024", total: "$210.30", status: "Delivered", statusColor: "bg-green-100 text-green-700" },
    { id: "#VIP-9917", customer: "Arthur Lowen", initials: "AL", color: "bg-gray-200 text-gray-700", date: "Oct 23, 2024", total: "$55.00", status: "Canceled", statusColor: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Orders</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-green)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
            Manage All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.color}`}>
                      {order.initials || order.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{order.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-gray-900">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 text-center bg-gray-50/30">
        <button className="text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-hover)] transition-colors">
          See full order history
        </button>
      </div>
    </div>
  );
}
