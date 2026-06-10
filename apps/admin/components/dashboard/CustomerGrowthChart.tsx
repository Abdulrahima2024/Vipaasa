export default function CustomerGrowthChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  // Mock heights for the bars (percentages)
  const heights = [30, 40, 35, 55, 65, 80];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Customer Growth</h2>
          <p className="text-sm text-gray-500">New acquisitions over the last 6 months</p>
        </div>
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium">
          Last 6 Months
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 mt-8">
        {months.map((month, i) => (
          <div key={month} className="flex flex-col items-center w-full gap-3 group">
            <div className="w-full h-48 bg-gray-50 rounded-t-sm flex items-end relative overflow-hidden transition-all duration-300">
              <div 
                className={`w-full rounded-t-sm transition-all duration-500 group-hover:opacity-90 ${
                  i === months.length - 1 ? 'bg-[var(--primary-green)]' : 'bg-[#c6d7cd]'
                }`}
                style={{ height: `${heights[i]}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-400">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
