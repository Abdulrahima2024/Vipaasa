'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Sprout, Wheat } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-section w-full bg-white overflow-hidden relative">
      {/* Floating Animated Nature Icons (Stroke outline only) - Scaled down on mobile */}
      <Leaf className="absolute top-[8%] left-[2%] text-[#2D6A4F] opacity-[0.15] w-8 h-8 animate-float-1 hidden md:block z-30 pointer-events-none" />
      <Leaf className="absolute bottom-[10%] left-[3%] text-[#2D6A4F] opacity-[0.2] w-6 h-6 md:w-10 md:h-10 animate-float-2 z-30 pointer-events-none" />
      <Leaf className="absolute bottom-[6%] left-[45%] text-[#1B4332] opacity-[0.12] w-6 h-6 md:w-6 md:h-6 animate-float-3 hidden sm:block z-30 pointer-events-none" />
      <Leaf className="absolute top-[6%] right-[3%] text-[#2D6A4F] opacity-[0.18] w-7 h-7 md:w-12 md:h-12 animate-float-2 z-30 pointer-events-none" />
      <Leaf className="absolute bottom-[12%] right-[4%] text-[#1B4332] opacity-[0.15] w-6 h-6 md:w-9 md:h-9 animate-float-1 z-30 pointer-events-none" />

      {/* Additional Stroke Icons */}
      <Sprout className="absolute top-[22%] left-[9%] text-[#2D6A4F] opacity-[0.15] w-8 h-8 animate-float-3 hidden md:block z-30 pointer-events-none" />
      <Wheat className="absolute top-[32%] right-[8%] text-[#2D6A4F] opacity-[0.15] w-9 h-9 animate-float-1 hidden md:block z-30 pointer-events-none" />
      <Sprout className="absolute bottom-[20%] right-[16%] text-[#40916C] opacity-[0.15] w-5 h-5 md:w-8 md:h-8 animate-float-2 z-30 pointer-events-none" />
      <Wheat className="absolute bottom-[22%] left-[10%] text-[#1B4332] opacity-[0.12] w-6 h-6 md:w-8 md:h-8 animate-float-3 z-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/9] bg-white overflow-hidden">
          {/* Clean Background Image (no baked-in text) */}
          <Image
            src="/images/hero-clean-bg.png"
            alt="Organic harvest and staples"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right md:object-center"
          />

          {/* Faded Borders Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Box-shadow vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_30px_rgba(255,255,255,1)] md:shadow-[inset_0_0_100px_60px_rgba(255,255,255,1)]" />
            {/* Deep left fade behind text */}
            <div className="absolute inset-y-0 left-0 w-[55%] md:w-[45%] bg-gradient-to-r from-white via-white/80 to-transparent" />
            {/* Top fade */}
            <div className="absolute inset-x-0 top-0 h-[15%] bg-gradient-to-b from-white to-transparent" />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-white to-transparent" />
            {/* Right fade */}
            <div className="absolute inset-y-0 right-0 w-[12%] bg-gradient-to-l from-white to-transparent" />
          </div>

          {/* HTML Text Overlay on the left */}
          <div className="absolute inset-y-0 left-0 w-[55%] md:w-[50%] flex flex-col justify-center pl-[5%] pr-2 md:pl-[6%] md:pr-4 space-y-2.5 sm:space-y-5 md:space-y-7 lg:space-y-9 z-20">
            <h2 className="font-serif text-[18px] sm:text-3xl md:text-[40px] lg:text-[52px] font-bold leading-[1.2] md:leading-[1.25] lg:leading-[1.3] text-[#222222] tracking-tight">
              Fresh From <span className="text-[#2D6A4F]">Nature</span>,<br />
              Delivered to You
            </h2>
            <p className="text-[10px] sm:text-sm lg:text-base text-gray-600 font-medium leading-relaxed max-w-[170px] sm:max-w-xs md:max-w-md">
              Discover 200% organic groceries, farm-fresh produce, and wholesome essentials for a healthier, happier you.
            </p>
            <div className="flex gap-2 sm:gap-4 pt-1 sm:pt-2">
              <Link href="/categories" className="inline-block">
                <button className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold transition-all duration-300 rounded-full shadow-md hover:shadow-[#2D6A4F]/20 active:scale-95 text-[9px] sm:text-xs md:text-sm lg:text-base px-2.5 py-1.5 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3.5">
                  Shop Fresh
                </button>
              </Link>
              <Link href="/about" className="inline-block">
                <button className="border border-gray-300 hover:border-gray-400 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 font-bold transition-all duration-300 rounded-full active:scale-95 text-[9px] sm:text-xs md:text-sm lg:text-base px-2.5 py-1.5 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3.5">
                  Our Story
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animations CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-15px) rotate(12deg) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(25deg) scale(0.95); }
          50% { transform: translateY(-20px) rotate(5deg) scale(1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(-15deg) scale(1); }
          50% { transform: translateY(-10px) rotate(-5deg) scale(0.9); }
        }
        .animate-float-1 {
          animation: float1 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float2 8s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float3 7s ease-in-out infinite;
        }
      `}} />
    </section>
  );
}
