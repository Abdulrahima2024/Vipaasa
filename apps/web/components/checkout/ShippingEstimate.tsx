import React from "react";

interface ShippingEstimateProps {
  addressName?: string;
  postalCode?: string;
}

export default function ShippingEstimate({ addressName = "Noida", postalCode = "201310" }: ShippingEstimateProps) {
  return (
    <div className="bg-white border border-[#EAE6DB] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
      {/* CSS Pulse & Floating Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { opacity: 0; transform: scale(2.2); }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(0.8); }
        }
        @keyframes pin-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        .pulse-dot {
          animation: pulse-dot 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        .pin-bounce {
          animation: pin-bounce 2s ease-in-out infinite;
        }
      `}} />

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#113C27]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-.977l-4.82 2.41a1.25 1.25 0 0 1-1.034 0l-4.82-2.41a1.25 1.25 0 0 0-1.034 0L3.13 5.348c-.38.19-.622.58-.622 1.006v11.968c0 .836.88 1.38 1.628.977l4.82-2.41a1.25 1.25 0 0 1 1.034 0l4.82 2.41a1.25 1.25 0 0 0 1.034 0Z" />
          </svg>
          <span className="text-sm font-bold text-[#113C27]">Live Location Preview</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF5EC] rounded-full">
          <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-ping"></span>
          <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider">Accuracy: High</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EAE6DB]/60 flex items-center justify-center">
        {/* Minimal SVG Map Design */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          {/* Land background */}
          <rect width="400" height="200" fill="#F4EFE6" />
          
          {/* Green zones/parks */}
          <path d="M 0,0 Q 80,40 120,0 Z" fill="#E5EADF" />
          <path d="M 300,200 Q 340,140 400,160 L 400,200 Z" fill="#E5EADF" />
          <path d="M 50,120 Q 90,150 70,200 L 0,200 Z" fill="#E5EADF" />
          
          {/* Roads grid */}
          <path d="M -10,100 Q 150,120 410,90" fill="none" stroke="#E6DFD3" strokeWidth="16" strokeLinecap="round" />
          <path d="M -10,100 Q 150,120 410,90" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />

          <path d="M 100,-10 Q 120,90 80,210" fill="none" stroke="#E6DFD3" strokeWidth="12" strokeLinecap="round" />
          <path d="M 100,-10 Q 120,90 80,210" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

          <path d="M 280,-10 Q 240,110 320,210" fill="none" stroke="#E6DFD3" strokeWidth="12" strokeLinecap="round" />
          <path d="M 280,-10 Q 240,110 320,210" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

          <path d="M 150,60 Q 250,50 300,120" fill="none" stroke="#E6DFD3" strokeWidth="10" strokeLinecap="round" />
          <path d="M 150,60 Q 250,50 300,120" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        </svg>

        {/* Heartbeat Location Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute w-12 h-12 rounded-full bg-[#1B4332]/20 pulse-ring -top-2"></div>
          
          {/* Pin Icon */}
          <div className="pin-bounce relative">
            <svg className="w-8 h-8 text-[#113C27]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {/* Center dot inside pin */}
            <div className="absolute w-2.5 h-2.5 bg-white rounded-full top-[9px] left-[11px] pulse-dot"></div>
          </div>
        </div>

        {/* Small floating card showing destination info */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-[#EAE6DB]/80 text-[10px] font-bold text-[#113C27] shadow-sm tracking-wider uppercase">
          Pin: {postalCode}
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EAE6DB]/40 rounded-xl p-3.5">
        <svg className="w-5 h-5 text-[#2D6A4F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <div className="text-xs font-semibold text-[#5C6E61]">
          Estimated delivery to <span className="text-[#113C27] font-bold">{addressName}</span>: <span className="text-[#2D6A4F] font-bold">35-45 mins</span>
        </div>
      </div>
    </div>
  );
}
