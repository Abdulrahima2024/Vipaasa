"use client";

import React, { useState } from "react";
import { Star, Smile } from "lucide-react";

interface SatisfactionRatingProps {
  onSubmit: (rating: number, feedback: string) => void;
}

export default function SatisfactionRating({ onSubmit }: SatisfactionRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#EAF5EC] border border-[#C1F2D0] rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-white text-[#113C27] shadow-sm">
          <Smile className="w-8 h-8" />
        </div>
        <h4 className="font-serif text-lg font-bold text-[#113C27]">Thank you for your feedback!</h4>
        <p className="text-xs text-[#5C6E61] max-w-xs mx-auto leading-relaxed">
          Your response has been registered. It helps us continuously improve our organic delivery care service.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#EAE6DB] rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="text-center space-y-1">
        <h4 className="font-serif text-base font-extrabold text-[#113C27]">Rate your chat support experience</h4>
        <p className="text-xs text-gray-500 font-medium">How would you rate our agent's assistance?</p>
      </div>

      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-gray-300 hover:scale-110 active:scale-95 transition-all focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Any additional feedback? (Optional)"
          rows={3}
          className="w-full rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] p-3 text-xs outline-none resize-none font-sans font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0}
        className="w-full bg-[#113C27] hover:bg-[#2D6A4F] text-white text-xs font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        Submit Feedback
      </button>
    </form>
  );
}
