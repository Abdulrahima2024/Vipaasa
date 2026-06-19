import React, { useState } from "react";

interface PaymentSectionProps {
  onPaymentComplete: (method: string) => void;
  onBack: () => void;
  totalAmount: number;
}

type PaymentMethod = "CARD" | "UPI" | "COD" | "NET_BANKING";

export default function PaymentSection({ onPaymentComplete, onBack, totalAmount }: PaymentSectionProps) {
  const [method, setMethod] = useState<PaymentMethod>("CARD");
  const [isProcessing, setIsProcessing] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // UPI Form State
  const [upiId, setUpiId] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "CARD") {
      if (cardNumber.length < 19 || !cardExpiry || cardCvv.length < 3 || !cardName) {
        alert("Please enter valid card details.");
        return;
      }
    } else if (method === "UPI") {
      if (!upiId || !upiId.includes("@")) {
        alert("Please enter a valid UPI ID (e.g. user@upi).");
        return;
      }
    }

    setIsProcessing(true);

    // Simulate processing payment
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete(method);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#113C27] mb-2 tracking-tight">
          Choose Payment Method
        </h2>
        <p className="text-sm text-[#5C6E61] font-medium">
          Select your preferred secure payment method.
        </p>
      </div>

      <form onSubmit={handlePay} className="space-y-6">
        {/* Payment Methods Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-semibold">
          {([
            { id: "CARD", label: "Card", icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v13.5c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V3.375c0-.621.504-1.125 1.125-1.125Z" />
              </svg>
            )},
            { id: "UPI", label: "UPI", icon: (
              <span className="font-serif italic text-xs tracking-tighter font-extrabold uppercase border-2 px-1 rounded border-current">Upi</span>
            )},
            { id: "COD", label: "Cash (COD)", icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a6 6 0 0 1 12 0m0 0a3 3 0 1 1-6 0m6 0h6.562c.621 0 1.125-.504 1.125-1.125V11.25M18 14.25M9 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )},
            { id: "NET_BANKING", label: "Net Banking", icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5m-1.5 0h18" />
              </svg>
            )},
          ] as const).map((opt) => {
            const isSelected = method === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMethod(opt.id)}
                className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-300 ${
                  isSelected
                    ? "border-[#1B4332] bg-white text-[#113C27] shadow-[0_8px_24px_rgba(27,67,50,0.05)]"
                    : "border-[#EAE6DB] hover:border-[#738276] bg-white/70 hover:bg-white text-[#5C6E61]"
                }`}
              >
                <div className={`p-2 rounded-full ${isSelected ? "bg-[#EAF5EC] text-[#2D6A4F]" : "bg-[#FAF8F5]"}`}>
                  {opt.icon}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Payment Forms */}
        <div className="bg-white border border-[#EAE6DB] rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.01)] text-sm font-semibold text-[#1F3E2F]">
          {method === "CARD" && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#113C27] border-b border-[#EAE6DB]/60 pb-3 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Enter Card Details
              </h3>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                  placeholder="e.g. Ananya Sharma"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332] tracking-[0.15em] font-mono"
                  placeholder="0000 0000 0000 0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332] font-mono text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332] font-mono text-center"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
          )}

          {method === "UPI" && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#113C27] border-b border-[#EAE6DB]/60 pb-3 mb-2">
                UPI Payment
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#738276] mb-1.5 font-bold">Enter UPI ID *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#EAE6DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1B4332]"
                    placeholder="e.g. ananya@okaxis"
                  />
                </div>
                <p className="text-[11px] text-[#738276] mt-2 font-bold uppercase tracking-wider">You will receive a collect request in your UPI App</p>
              </div>

              {/* Mock QR code container for maximum wow-factor */}
              <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#EAE6DB]/60 bg-[#FAF8F5] rounded-2xl p-4">
                <span className="text-xs text-[#5C6E61] font-bold">Scan QR to Pay via Any App</span>
                <div className="w-32 h-32 bg-white border border-[#EAE6DB] rounded-xl p-2.5 flex items-center justify-center relative shadow-sm">
                  {/* Decorative QR-like SVG */}
                  <svg className="w-full h-full text-[#113C27]" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 h30 v10 h-20 v20 h-10 Z M70,0 h30 v30 h-10 v-20 h-20 Z M0,70 h10 v20 h20 v10 h-30 Z M90,90 h-20 v10 h30 v-30 h-10 Z M15,15 h10 v10 h-10 Z M75,15 h10 v10 h-10 Z M15,75 h10 v10 h-10 Z M45,45 h10 v10 h-10 Z M35,25 h5 v5 h-5 Z M55,65 h10 v5 h-10 Z M25,40 h10 v5 h-10 Z M65,35 h5 v15 h-5 Z" />
                  </svg>
                  {/* Overlay brand logo in the center of QR */}
                  <div className="absolute w-7 h-7 bg-[#EAF5EC] border-2 border-white rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#2D6A4F]">VO</div>
                </div>
                <span className="text-[10px] font-bold text-[#738276] uppercase tracking-wider">Scan & Secure checkout</span>
              </div>
            </div>
          )}

          {method === "COD" && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EAF5EC] text-[#2D6A4F] flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a6 6 0 0 1 12 0m0 0a3 3 0 1 1-6 0m6 0h6.562c.621 0 1.125-.504 1.125-1.125V11.25M18 14.25M9 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#113C27]">
                Cash on Delivery (COD)
              </h3>
              <p className="text-xs text-[#5C6E61] max-w-xs mx-auto leading-relaxed">
                Pay with cash or scan payment QR upon delivery. Please ensure someone is available at the address.
              </p>
            </div>
          )}

          {method === "NET_BANKING" && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#113C27] border-b border-[#EAE6DB]/60 pb-3 mb-2">
                Popular Banks
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#5C6E61]">
                {(["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"] as const).map((bank) => (
                  <button
                    key={bank}
                    type="submit"
                    className="p-3 border border-[#EAE6DB] rounded-xl hover:border-[#738276] bg-[#FAF8F5] text-left hover:bg-white transition-all"
                  >
                    {bank}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#738276] text-center pt-2 font-bold uppercase tracking-wider">Or select your bank from a list on the next page</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#EAE6DB]/40">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 bg-[#1B4332] hover:bg-[#113C27] text-white py-4 px-8 rounded-xl font-bold transition-all shadow-md shadow-green-950/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                {/* Spinning Loader */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {method === "COD" ? "Placing Order..." : "Securing Payment..."}
              </>
            ) : (
              method === "COD"
                ? `Place Order (Cash on Delivery) - ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `Pay ₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Now`
            )}
          </button>
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="bg-white border border-[#EAE6DB] hover:border-[#738276] text-[#113C27] py-4 px-8 rounded-xl font-bold transition-all hover:bg-[#FAF8F5] disabled:opacity-50"
          >
            Back to Review
          </button>
        </div>
      </form>
    </div>
  );
}
