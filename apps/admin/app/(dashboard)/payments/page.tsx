"use client";

import { useState, useEffect } from "react";
import { CreditCard, Calendar, User, DollarSign, ChevronRight } from "lucide-react";
import { fetchAPI } from "../../../lib/api";

interface Payment {
  id: string;
  payerName: string;
  amount: number;
  method: string;
  date: string;
  bankDetails: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAPI("/api/payments");
        setPayments(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load payment transactions.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, []);


  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-[var(--primary-green)]">Payments</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Payments</h1>
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
