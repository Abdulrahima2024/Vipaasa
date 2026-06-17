import React from "react";

interface PlantLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function PlantLoader({
  size = "md",
  text,
  className = "",
}: PlantLoaderProps) {
  // Size mapping
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const svgSizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-36 h-36",
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
      {/* Styles for Plant Growing Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes seed-animation {
          0%, 100% { transform: scale(1); fill: #8B5A2B; }
          15%, 85% { transform: scale(1.15); fill: #5C4033; }
        }

        @keyframes stem-animation {
          0%, 15% { stroke-dashoffset: 100; }
          75%, 100% { stroke-dashoffset: 0; }
        }

        @keyframes leaf-left-animation {
          0%, 40% { transform: scale(0); opacity: 0; }
          60%, 100% { transform: scale(1); opacity: 1; }
        }

        @keyframes leaf-right-animation {
          0%, 55% { transform: scale(0); opacity: 0; }
          75%, 100% { transform: scale(1); opacity: 1; }
        }

        @keyframes leaf-top-animation {
          0%, 70% { transform: scale(0); opacity: 0; }
          85%, 100% { transform: scale(1); opacity: 1; }
        }

        @keyframes text-fade {
          0%, 100% { opacity: 0.4; transform: translateY(2px); }
          50% { opacity: 0.9; transform: translateY(0); }
        }
        
        .animate-seed-loader {
          transform-origin: 50px 83px;
          animation: seed-animation 3.5s ease-in-out infinite;
        }
        .animate-stem-loader {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: stem-animation 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-leaf-left-loader {
          transform-origin: 49px 60px;
          animation: leaf-left-animation 3.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) infinite;
        }
        .animate-leaf-right-loader {
          transform-origin: 52px 42px;
          animation: leaf-right-animation 3.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) infinite;
        }
        .animate-leaf-top-loader {
          transform-origin: 48px 18px;
          animation: leaf-top-animation 3.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) infinite;
        }
        .animate-text-loader {
          animation: text-fade 3.5s ease-in-out infinite;
        }
      `}} />

      {/* SVG Sprouting Animation */}
      <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
        <svg viewBox="0 0 100 100" className={`${svgSizeClasses[size]}`}>
          {/* Soil Ground Line */}
          <path
            d="M 20 85 Q 50 82 80 85"
            stroke="#8B5A2B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          
          {/* Splitting Seed */}
          <circle cx="50" cy="83" r="3" fill="#8B5A2B" className="animate-seed-loader" />
          
          {/* Sprouting/Growing Stem */}
          <path
            className="animate-stem-loader"
            d="M 50 83 Q 46 62 54 44 T 48 18"
            stroke="#2D6A4F"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Left Leaf */}
          <path
            className="animate-leaf-left-loader"
            d="M 49 60 Q 30 50 35 37 Q 47 46 49 60"
            fill="#2D6A4F"
          />
          
          {/* Right Leaf */}
          <path
            className="animate-leaf-right-loader"
            d="M 52 42 Q 70 34 65 21 Q 53 31 52 42"
            fill="#2D6A4F"
          />
          
          {/* Top Leaf Sprout */}
          <path
            className="animate-leaf-top-loader"
            d="M 48 18 Q 41 6 50 1 Q 59 6 48 18"
            fill="#1B4332"
          />
        </svg>
      </div>

      {/* Elegant Brand Status Message */}
      {text && (
        <p className="font-serif text-[11px] sm:text-xs font-semibold tracking-wider text-[#5C6E61] uppercase mt-4 animate-text-loader select-none">
          {text}
        </p>
      )}
    </div>
  );
}
