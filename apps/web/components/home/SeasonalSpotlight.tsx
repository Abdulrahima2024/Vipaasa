import React from "react";
import Image from "next/image";
import { ShieldCheck, HeartHandshake, Trees, Award } from "lucide-react";

export default function SeasonalSpotlight() {
  const pillars = [
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#2D6A4F]" />,
      title: "Directly from Indian Soil",
      description: "Ethically sourced directly from partner farmers in native regions — like Kandipappu from Andhra drylands and Turmeric from Meghalaya.",
    },
    {
      icon: <Trees className="w-6 h-6 text-[#2D6A4F]" />,
      title: "Vedic Craftsmanship",
      description: "Processed using traditional nutrient-retaining methods like wood-pressed cold extraction (Kachi Ghani) and stone-ground milling.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />,
      title: "100% Lab-Tested Purity",
      description: "Every single harvest is certified pesticide-free, residue-free, and tested for heavy metals with complete public transparency.",
    },
  ];

  return (
    <section className="bg-white border border-[#EAE6DB] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Interactive Imagery and Certifications */}
        <div className="lg:col-span-5 h-80 lg:h-auto min-h-[350px] relative overflow-hidden group">
          <Image
            src="/images/indian-organic-farmer.png"
            alt="Indian farmer working on an organic farm"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#113C27]/70 via-transparent to-[#113C27]/10" />
          
          {/* Floating Trust Badge */}
          <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm border border-[#EAE6DB] rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2D6A4F] flex-shrink-0">
              <Award className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#113C27] tracking-tight">NPOP Certified Organic</p>
              <p className="text-[10px] text-[#5C6E61] font-semibold">100% Chemical & Pesticide Free</p>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Purity and Source Pillars */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center space-y-8 bg-[#FAF9F5]/40">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
              Trust & Traceability
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#113C27] leading-tight tracking-tight">
              Purity Sourced from Roots
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6E61] font-medium max-w-xl leading-relaxed">
              We bridge the gap between Indian regenerative organic farmers and your kitchen. Know exactly what you consume, where it grew, and how it was made.
            </p>
          </div>

          {/* Pillars List */}
          <div className="grid grid-cols-1 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-[#EAE6DB] hover:bg-white transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE6DB]/60 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {pillar.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#113C27]">{pillar.title}</h4>
                  <p className="text-xs text-[#5C6E61] leading-relaxed font-medium">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
