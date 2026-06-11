import React from "react";
import Image from "next/image";

export default function SeasonalSpotlight() {
  return (
    <section className="bg-white border border-[#EAE6DB] rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-sm">
      {/* Left Bowl Image using next/image */}
      <div className="h-72 sm:h-96 md:h-auto min-h-[300px] relative">
        <Image
          src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600"
          alt="Golden Morning Ritual breakfast bowl"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Right Text Content */}
      <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-6">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2D6A4F]">
          Seasonal Living
        </span>
        
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#113C27] leading-tight tracking-tight">
          The Golden Morning Ritual
        </h3>

        <p className="text-xs sm:text-sm font-medium text-[#5C6E61] leading-relaxed">
          Discover the healing power of our Lakadong Turmeric and Wild Honey infusion. A traditional tonic reimagined for the modern home.
        </p>

        <div>
          <button className="bg-[#113C27] hover:bg-[#2D6A4F] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-200">
            <span>Read the Recipe</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
