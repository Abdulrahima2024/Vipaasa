"use client";

import { useState } from "react";
import { CreditCard, Calendar, User, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  payerName: string;
  amount: number;
  method: string;
  date: string;
  bankDetails: string;
}

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>([
    {
      id: "PAY-001",
      payerName: "Tejesh Kumar",
      amount: 4680,
      method: "Razorpay (Online)",
      date: "2026-06-16",
      bankDetails: "HDFC Bank - 1234567890",
    },
    {
      id: "PAY-002",
      payerName: "Sai Kiran",
      amount: 490,
      method: "Cash on Delivery",
      date: "2026-06-15",
      bankDetails: "Cash Payment - N/A",
    },
    {
      id: "PAY-003",
      payerName: "Ananya Rao",
      amount: 468,
      method: "UPI (Online)",
      date: "2026-06-14",
      bankDetails: "Google Pay - 9876543210",
    },
    {
      id: "PAY-004",
      payerName: "Mohan Lal",
      amount: 860,
      method: "Razorpay (Online)",
      date: "2026-06-13",
      bankDetails: "ICICI Bank - 1122334455",
    },
    {
      id: "PAY-005",
      payerName: "Kavitha Reddy",
      amount: 1060,
      method: "Razorpay (Online)",
      date: "2026-06-12",
      bankDetails: "SBI Bank - 6677889900",
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments</h1>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 uppercase text-xs text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold">Payment ID</th>
              <th className="px-6 py-4 font-bold">Payer</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Method</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Bank Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-gray-900">{p.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{p.payerName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{p.amount}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>{p.method}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {p.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    {p.bankDetails}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
