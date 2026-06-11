import React from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[480px] sm:h-[560px] overflow-hidden flex items-center">
      {/* Background Image using next/image optimized for LCP */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/organic_farming_hero.png"
          alt="Organic farming products from Vipaasa Organics"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transform translate-y-[-5%] brightness-[0.85] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-16 z-20 text-white space-y-6">
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-[52px] font-bold leading-[1.15] max-w-xl tracking-tight">
          Directly From Earth&apos;s Lap to Your Home
        </h2>
        <p className="text-sm sm:text-base md:text-lg max-w-md font-medium text-white/90 leading-relaxed">
          Artisanal organic staples curated from regenerative farms across India.
        </p>
        <div className="pt-2">
          <button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-black/20 transition-all duration-300 transform active:scale-95">
            Explore Harvest
          </button>
        </div>
      </div>
    </section>
  );
}
