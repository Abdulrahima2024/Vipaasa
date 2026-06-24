"use client";

import React, { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import SatisfactionRating from "./SatisfactionRating";
import { Send, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "agent";
  timestamp: string;
}

interface ChatWindowProps {
  ticketId: string;
  category: string;
  initialMessage: string;
}

export default function ChatWindow({ ticketId, category, initialMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<"Open" | "Resolved">("Open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const initialMsgs: Message[] = [
      {
        id: "init-bot",
        content: `Hello! Thanks for reaching out. We have opened Support Ticket ${ticketId} under category "${category}". How can I assist you today?`,
        sender: "bot",
        timestamp: time
      }
    ];

    if (initialMessage) {
      initialMsgs.push({
        id: "init-user",
        content: initialMessage,
        sender: "user",
        timestamp: time
      });
      setMessages(initialMsgs);
      simulateBotResponse(initialMessage);
    } else {
      setMessages(initialMsgs);
    }
  }, [ticketId, category, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateBotResponse = (userQuery: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      
      let reply = "";
      const q = userQuery.toLowerCase();
      if (q.includes("order") || q.includes("track")) {
        reply = "I can definitely help with your order status. Could you please provide your Order ID (e.g. #VO-12345) so I can query our fulfillment database?";
      } else if (q.includes("delivery") || q.includes("shipping")) {
        reply = "Our fresh harvests are generally delivered within 2-4 hours for express shipping, and 24 hours for standard shipping. You can track all live shipments in the 'My Orders' section.";
      } else if (q.includes("payment") || q.includes("refund")) {
        reply = "For any payment discrepancies or refund claims, rest assured that funds are auto-reversed back to the source account within 3-5 business days. Please write to billing@vipaasa.com if it takes longer.";
      } else if (q.includes("organic") || q.includes("ghee") || q.includes("honey")) {
        reply = "At Vipaasa, all our products are stone-ground, bilona churned, and sustainably sourced from certified organic cooperative micro-farmers. We ensure 100% purity and zero chemicals.";
      } else {
        reply = "Thank you for the message. I have forwarded these details to our customer care manager. An executive will follow up with you at your registered email address shortly.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-reply-${Date.now()}`,
          content: reply,
          sender: "agent",
          timestamp: time
        }
      ]);
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status === "Resolved") return;

    const time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputText,
      sender: "user",
      timestamp: time
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    simulateBotResponse(inputText);
  };

  const handleResolveTicket = () => {
    setStatus("Resolved");
    const time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      {
        id: `resolved-${Date.now()}`,
        content: "This ticket has been marked as Resolved. Thank you for contacting Vipaasa support center!",
        sender: "bot",
        timestamp: time
      }
    ]);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DB] overflow-hidden flex flex-col h-[550px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      {/* Chat Header */}
      <div className="bg-[#FAF9F5]/80 backdrop-blur-md border-b border-[#EAE6DB] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#113C27] flex items-center justify-center text-white font-serif text-sm font-bold">
              VO
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#113C27]">Vipaasa Support Assistant</h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Ticket ID: {ticketId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
            status === "Open" ? "bg-[#C1F2D0] text-[#113C27]" : "bg-gray-100 text-gray-400"
          }`}>
            {status}
          </span>
          {status === "Open" && (
            <button
              onClick={handleResolveTicket}
              className="flex items-center gap-1 bg-[#FAF9F5] hover:bg-[#FDE4E4] text-[#A84444] border border-[#EAE6DB] px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
            >
              <CheckCircle className="w-3 h-3" /> Mark Resolved
            </button>
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F5]/20">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            sender={msg.sender}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#113C27] text-[#C1F2D0] flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm">
              S
            </div>
            <div className="bg-white border border-[#EAE6DB]/80 rounded-2xl px-4 py-3 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {status === "Resolved" && (
          <div className="pt-4 max-w-sm mx-auto">
            <SatisfactionRating onSubmit={(rating, feedback) => {
              console.log("Feedback submitted:", rating, feedback);
            }} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      {status === "Open" && (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#EAE6DB] flex gap-3 bg-white">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow rounded-xl border border-[#EAE6DB] focus:border-[#113C27] focus:ring-1 focus:ring-[#113C27] px-4 py-2.5 text-xs sm:text-sm font-medium outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#113C27] hover:bg-[#2D6A4F] text-white p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
