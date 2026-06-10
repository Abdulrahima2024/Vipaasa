import { Search, Bell } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Operations Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, Administrator. Here's what's happening today.
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--primary-green)] bg-white shadow-sm"
            placeholder="Search data..."
          />
        </div>
        
        <button className="relative p-2 text-gray-400 hover:text-gray-500 bg-white border border-gray-200 rounded-full shadow-sm transition-colors">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>
      </div>
    </div>
  );
}
