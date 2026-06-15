"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Gift, Star, TrendingUp } from "lucide-react";

export default function RewardsCard() {
  const { token } = useAuthStore();
  const [rewardPoints, setRewardPoints] = useState(250);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiBaseUrl}/api/users/rewards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRewardPoints(data.rewardPoints ?? 250);
        }
      } catch {
        // Fallback to default
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewards();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-[#F0FFF4] to-[#F9F7F2] rounded-2xl border border-[#D4E7DC]/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-[#0F5132]/20 group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0F5132]/15 transition-colors duration-300">
          <Gift className="w-6 h-6 text-[#0F5132]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-[#0F5132] mb-1">
            Rewards Program
          </h3>
          <p className="text-sm text-[#4B594F] font-medium leading-relaxed">
            You have{" "}
            <span className="font-extrabold text-[#0F5132] text-base">
              {isLoading ? "..." : rewardPoints}
            </span>{" "}
            pure points. Redeem them on your next organic order.
          </p>

          {/* Points bar visual */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 transition-colors ${
                    i <= Math.min(5, Math.floor(rewardPoints / 50))
                      ? "text-[#0F5132] fill-[#0F5132]"
                      : "text-[#D4E7DC]"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#738276] uppercase tracking-wider">
              Tier: {rewardPoints >= 500 ? "Gold" : rewardPoints >= 200 ? "Silver" : "Bronze"}
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="hidden sm:flex items-center gap-1 text-[#0F5132] bg-[#0F5132]/8 px-2 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-bold">+12%</span>
        </div>
      </div>
    </div>
  );
}
