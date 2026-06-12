import React from "react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="2" width="12" height="20" rx="3" />
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
        </svg>
      ),
      title: "High Nutritional Value",
      description: "Organic food consumes way more minerals and natural vitamins",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Top Toggle */}
          <rect x="4" y="4" width="16" height="7" rx="3.5" />
          <circle cx="14.5" cy="7.5" r="2" fill="currentColor" />
          {/* Bottom Toggle */}
          <rect x="4" y="13" width="16" height="7" rx="3.5" />
          <circle cx="9.5" cy="16.5" r="2" />
        </svg>
      ),
      title: "Preserves the Environment",
      description: "Organic farming creates healthy soil and assures our soil will be completely nourished which will help our environment to be better.",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      title: "No Artificial Colors and Pesticides",
      description: "Organic food farming doesn’t use any artificial colors or pesticides, we provide 100% Organic Food.",
    },
    {
      icon: (
        <svg className="w-8 h-8 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      ),
      title: "Certified Organic Products",
      description: "All our products are certified by IMO Control, that gives our consumer product authentication.",
    },
  ];

  return (
    <section className="py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b, index) => (
          <div
            key={index}
            className="group relative overflow-hidden bg-white/50 border border-[#EAE6DB]/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.03)] hover:border-[#113C27]/30 hover:bg-white transition-all duration-500 transform hover:-translate-y-1.5"
          >
            {/* Glow Background Effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#113C27]/5 rounded-full blur-2xl group-hover:bg-[#113C27]/10 transition-all duration-500 -mr-6 -mt-6 pointer-events-none" />

            {/* Centered Icon Container with Background Accent */}
            <div className="w-16 h-16 bg-[#EAF5EC] rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-[#113C27]/10 transition-all duration-300">
              {b.icon}
            </div>

            {/* Centered Heading */}
            <h4 className="font-sans text-base sm:text-lg font-bold text-[#113C27] tracking-tight leading-snug transition-colors duration-300">
              {b.title}
            </h4>

            {/* Centered Description */}
            <p className="text-xs sm:text-sm text-[#5C6E61] font-medium leading-relaxed max-w-xs">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
