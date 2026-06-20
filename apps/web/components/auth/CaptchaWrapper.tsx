"use client";

import React, { forwardRef, useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface CaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export const CaptchaWrapper = forwardRef<HCaptcha, CaptchaWrapperProps>(
  ({ onVerify, onExpire }, ref) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      // Render a placeholder matching the hCaptcha widget dimensions to prevent layout shifts (CLS)
      return <div className="flex justify-center py-2 min-h-[78px]" />;
    }

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const siteKey = isLocalhost
      ? "10000000-ffff-ffff-ffff-000000000001"
      : (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001");

    return (
      <div className="flex justify-center py-2 min-h-[78px]">
        <HCaptcha
          ref={ref}
          sitekey={siteKey}
          onVerify={onVerify}
          onExpire={onExpire}
        />
      </div>
    );
  }
);

CaptchaWrapper.displayName = "CaptchaWrapper";
export default CaptchaWrapper;
