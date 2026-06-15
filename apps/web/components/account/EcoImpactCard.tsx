"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { TreePine, Leaf, Droplets } from "lucide-react";

export default function EcoImpactCard() {
  const { token } = useAuthStore();
  const [treesPlanted, setTreesPlanted] = useState(12);
  const [co2Saved, setCo2Saved] = useState(48);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEcoImpact = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/users/eco-impact`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTreesPlanted(data.treesPlanted ?? 12);
          setCo2Saved(data.co2Saved ?? 48);
        }
      } catch {
        // Fallback to defaults
      } finally {
        setIsLoading(false);
      }
    };
    fetchEcoImpact();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-[#F0FFF4] to-[#F9F7F2] rounded-2xl border border-[#D4E7DC]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-[#0F5132]/20 group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F5132]/15 transition-colors duration-300">
          <TreePine className="w-6 h-6 text-[#0F5132]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-[#0F5132] mb-1">
            Eco-Impact
          </h3>
          <p className="text-sm text-[#4B594F] font-medium leading-relaxed">
            Through your orders, you&apos;ve helped plant{" "}
            <span className="font-extrabold text-[#0F5132] text-base">
              {isLoading ? "..." : treesPlanted}
            </span>{" "}
            trees this year.
          </p>

          {/* Eco Stats */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="text-[10px] font-bold text-[#4B594F]">
                {co2Saved}kg CO₂ saved
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="text-[10px] font-bold text-[#4B594F]">
                100% organic
              </span>
            </div>
          </div>
        </div>

        {/* Visual badge */}
        <div className="hidden sm:flex flex-col items-center gap-0.5 bg-[#0F5132]/8 px-2.5 py-1.5 rounded-lg">
          <span className="text-lg font-extrabold text-[#0F5132]">{treesPlanted}</span>
          <span className="text-[8px] font-bold text-[#738276] uppercase tracking-wider">Trees</span>
        </div>
      </div>
    </div>
  );
}
