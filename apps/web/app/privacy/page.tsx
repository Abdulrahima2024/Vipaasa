"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useCartStore } from "../../store/useCartStore";
import { Shield, Lock, Eye, FileText, Scale } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { items, favorites } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-[#1F3E2F]">
      {/* Dynamic premium fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      {/* HEADER SECTION */}
      <Header
        showSearch={true}
        activeNav="Privacy Policy"
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        onFavoritesClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/favorites";
          }
        }}
      />

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 sm:px-8 py-12 md:py-16 space-y-10">
        {/* HERO SECTION BANNER */}
        <section className="relative py-12 bg-[#113C27] text-white text-center px-6 overflow-hidden rounded-3xl shadow-xl">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[10%] left-[5%] w-24 h-24 border border-white rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[5%] w-32 h-32 border-4 border-white border-dashed rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/60 text-[#C1F2D0] text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              Your Security First
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#C1F2D0] font-medium opacity-90 max-w-md mx-auto">
              Last updated: June 24, 2026
            </p>
          </div>
        </section>

        {/* POLICY CONTENT */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-[#E8E5DD] space-y-10 text-[#4B594F] leading-relaxed">
          <section className="space-y-4">
            <p>
              At <strong>Vipaasa Organics</strong>, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Vipaasa Organics and how we use it.
            </p>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
            </p>
          </section>

          <hr className="border-[#E8E5DD]" />

          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <Eye className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">1. Information We Collect</h2>
            </div>
            <p>
              We collect information to provide better services to all our users. The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you register for an account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</li>
              <li><strong>Purchase Details:</strong> If you buy items from us, we collect payment and transaction information to process the order safely.</li>
              <li><strong>Communications:</strong> If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <FileText className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">2. How We Use Your Information</h2>
            </div>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Process your transactions and ship organic items directly to you</li>
              <li>Send you emails, updates, and customer support messages</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <Lock className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">3. Data Security</h2>
            </div>
            <p>
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#113C27]">
              <Scale className="w-6 h-6 shrink-0" />
              <h2 className="font-serif text-2xl font-bold">4. Your Data Protection Rights</h2>
            </div>
            <p>
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            </ul>
          </section>
        </div>
      </main>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}
