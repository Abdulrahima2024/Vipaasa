"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sprout, X, Send, Bot, User, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const faqData: Record<string, string> = {
  "What makes Vipaasa Organics unique?": "Vipaasa Organics is 200% committed to chemical-free farming. We partner directly with marginal farmers using Vedic agriculture (Jeevamrutham, natural cow manure) and process products traditionally (stone-grinding, wood-fire ghee, cold-pressed oils).",
  "Where are your store branches located?": "We have 3 physical stores:\n1. Jubilee Hills, Hyderabad\n2. Indiranagar, Bengaluru\n3. Benz Circle, Vijayawada\nYou can visit our /about page for full addresses, maps, and timings!",
  "What are your delivery timings?": "We deliver across major cities. Local deliveries in Hyderabad, Bengaluru, and Vijayawada take 4-24 hours. Domestic shipping takes 3-5 business days.",
  "Do you use chemical preservatives?": "Absolutely not! Every flour, dal, oil, honey, and ghee is packed raw, unpolished, and without artificial preservatives or coloring.",
  "How do I partner as a farmer?": "We are always looking for regenerative farmers! Please email us at info@vipaasaorganics.com or submit the partner form on our /about page."
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Namaste! Welcome to Vipaasa Organics helper. How can I assist you today?",
        timestamp: timeString
      }
    ]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: timeString
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot thinking/typing
    setTimeout(() => {
      const responseText = faqData[textToSend] || "I don't have an idea on that topic. Please feel free to reach out to our team at info@vipaasaorganics.com or call +91 99887 76655!";
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <>
      {/* Dynamic styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3.2s ease-in-out infinite;
        }
        @keyframes sproutGrow {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50% { transform: scale(1.16) rotate(6deg); }
        }
        .animate-sprout-grow {
          transform-origin: bottom center;
          animation: sproutGrow 3.2s ease-in-out infinite;
        }
        .animate-spin-once {
          animation: spin 0.4s ease-out 1;
        }
      `}} />

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-[#113C27] hover:bg-[#2D6A4F] text-white p-4 rounded-full shadow-[0_6px_24px_rgba(17,60,39,0.3)] hover:shadow-[0_8px_30px_rgba(17,60,39,0.45)] transition-all duration-300 active:scale-95 flex items-center justify-center focus:outline-none ${
          isOpen ? "" : "animate-bounce-slow"
        }`}
        aria-label="Toggle chat helper"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-spin-once" />
        ) : (
          <Sprout className="w-6 h-6 text-[#C1F2D0] animate-sprout-grow" />
        )}
      </button>

      {/* CHAT WINDOW INTERFACE */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-[#F9F7F2] border border-[#EAE6DB] rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.12)] z-50 flex flex-col overflow-hidden animate-fade-in font-sans">
          
          {/* Header row */}
          <div className="bg-[#113C27] text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-[#C1F2D0] flex items-center justify-center border border-[#C1F2D0]/20">
                <Bot className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">Vipaasa Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-semibold text-[#C1F2D0]/90">We are online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages display box */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-[#113C27] text-white"
                      : "bg-[#2D6A4F] text-[#C1F2D0]"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-[#113C27] text-white rounded-tr-none shadow-sm"
                        : "bg-white text-[#113C27] border border-[#EAE6DB] rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[#738276] font-semibold block px-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing visual indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <div className="w-7 h-7 rounded-full bg-[#2D6A4F] text-[#C1F2D0] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#EAE6DB] px-3.5 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <span className="w-1.5 h-1.5 bg-[#738276] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#738276] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#738276] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ buttons */}
          <div className="px-4 py-2 border-t border-[#EAE6DB]/40 bg-white/40 flex flex-wrap gap-2 justify-start max-h-[120px] overflow-y-auto">
            {Object.keys(faqData).map((question) => (
              <button
                key={question}
                onClick={() => handleSendMessage(question)}
                className="text-[10px] font-bold text-[#113C27] bg-white border border-[#EAE6DB] px-3 py-1.5 rounded-full hover:bg-[#C1F2D0] hover:border-[#113C27]/40 transition-colors shadow-sm text-left leading-normal"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Message input form */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-[#EAE6DB] bg-white flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask anything about Vipaasa..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow bg-[#FAF9F5] border border-[#EAE6DB] rounded-2xl px-4 py-2.5 text-xs text-[#113C27] font-semibold placeholder-[#738276] focus:outline-none focus:ring-1 focus:ring-[#113C27] transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-[#113C27] hover:bg-[#2D6A4F] text-white disabled:opacity-45 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-md focus:outline-none"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
