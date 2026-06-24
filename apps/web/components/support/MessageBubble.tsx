"use client";

import React from "react";

interface MessageBubbleProps {
  content: string;
  sender: "user" | "bot" | "agent";
  timestamp: string;
  avatar?: string;
}

export default function MessageBubble({ content, sender, timestamp, avatar }: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm select-none ${
        isUser ? "bg-[#C1F2D0] text-[#113C27]" : "bg-[#113C27] text-[#C1F2D0]"
      }`}>
        {isUser ? "U" : "S"}
      </div>

      {/* Bubble Content */}
      <div className="flex flex-col max-w-[70%] gap-1">
        <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${
          isUser 
            ? "bg-[#113C27] text-white rounded-tr-none" 
            : "bg-white border border-[#EAE6DB]/80 text-[#1F3E2F] rounded-tl-none"
        }`}>
          {content}
        </div>
        <span className={`text-[10px] text-gray-400 font-bold ${isUser ? "text-right" : "text-left"}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
}
