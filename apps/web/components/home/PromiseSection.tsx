import React from "react";
import Image from "next/image";

export default function PromiseSection() {
  return (
    <section className="space-y-8">
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27] text-center">
        The Vipaasa Promise
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Promise Card 1: Regenerative Sourcing */}
        <div className="md:col-span-3 bg-white border border-[#EAE6DB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm space-y-8 min-h-[340px]">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-[#EAF5EC] rounded-full flex items-center justify-center text-[#2D6A4F]">
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.22 5.22l13.56 13.56M18.78 5.22L5.22 18.78" />
              </svg>
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
              Regenerative Sourcing
            </h4>
            <p className="text-xs sm:text-sm font-medium text-[#5C6E61] leading-relaxed max-w-lg">
              We don&apos;t just source organic; we partner with farmers who restore the soil. Every purchase supports a cycle of replenishment for our planet.
            </p>
          </div>

          {/* Textured soil image using next/image */}
          <div className="w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-[#EAE6DB]/60 bg-[#ECE9E0] relative">
            <Image
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600"
              alt="Organic soil texture"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover brightness-[0.95] contrast-[0.9]"
            />
          </div>
        </div>

        {/* Promise Card 2: Lab Tested Purity */}
        <div className="md:col-span-2 bg-[#2D6A4F] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-md space-y-6 min-h-[340px]">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20">
            <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>

          <div className="space-y-3 max-w-xs">
            <h4 className="font-serif text-xl sm:text-2xl font-bold">
              Lab Tested Purity
            </h4>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-light">
              Every batch undergoes rigorous 14-point testing for heavy metals and pesticides. Clean labels only.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
