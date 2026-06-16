"use client";

import React from "react";

interface AnimatedEyeProps {
  isOpen: boolean;
  className?: string;
}

export default function AnimatedEye({ isOpen, className = "w-5 h-5" }: AnimatedEyeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-colors duration-200`}
    >
      {/* Upper Eyelid */}
      <path
        d={isOpen ? "M2 12C5 6 19 6 22 12" : "M2 12C5 16 19 16 22 12"}
        className="transition-[d] duration-300 ease-in-out"
      />
      {/* Lower Eyelid */}
      <path
        d={isOpen ? "M2 12C5 18 19 18 22 12" : "M2 12C5 16 19 16 22 12"}
        className="transition-[d] duration-300 ease-in-out"
      />
      {/* Pupil */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        className="transition-all duration-300 ease-in-out origin-center"
        style={{
          transform: isOpen ? "scale(1)" : "scale(0)",
          opacity: isOpen ? 1 : 0,
        }}
      />
      {/* Eyelashes (visible when closed) */}
      <g
        className="transition-all duration-300 ease-in-out origin-center"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? "translateY(-3px) scaleY(0.5)" : "translateY(0) scaleY(1)",
        }}
      >
        {/* Left lash */}
        <line x1="8" y1="14.5" x2="6" y2="17.5" />
        {/* Middle lash */}
        <line x1="12" y1="15" x2="12" y2="18.5" />
        {/* Right lash */}
        <line x1="16" y1="14.5" x2="18" y2="17.5" />
      </g>
    </svg>
  );
}
