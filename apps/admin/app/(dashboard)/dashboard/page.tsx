import Header from "@/components/layout/Header";
import AlertBanner from "@/components/dashboard/AlertBanner";
import StatCard from "@/components/dashboard/StatCard";
import CustomerGrowthChart from "@/components/dashboard/CustomerGrowthChart";
import BestSellersList from "@/components/dashboard/BestSellersList";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import { Package, Banknote, Truck } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <AlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value="1,284"
          subtext="vs last 30 days"
          icon={Package}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Revenue"
          value="$42,905.00"
          subtext="Average order: $33.40"
          icon={Banknote}
          trend="+8.4%"
          trendUp={true}
        />
        <StatCard
          title="Pending Deliveries"
          value="56"
          subtext="Estimated arrival: 2.4 days"
          icon={Truck}
          alertText="14 Urgent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CustomerGrowthChart />
        </div>
        <div className="lg:col-span-1">
          <BestSellersList />
        </div>
      </div>

      <RecentOrdersTable />

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
