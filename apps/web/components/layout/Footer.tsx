import React from "react";
import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const COMPANY_LINKS = [
  { label: "About Vipaasa", href: "/about" },
  { label: "Our Farms", href: "/about#farms" },
  { label: "Sustainability", href: "/about#sustainability" },
  { label: "Contact Us", href: "/support" },
];

const CUSTOMER_LINKS = [
  { label: "My Account", href: "/account" },
  { label: "Order History", href: "/orders" },
  { label: "Track Order", href: "/support" },
  { label: "Returns & Refunds", href: "/support" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Cookie Policy", href: "/cookies" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/vipaasaorganics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@vipaasaorganics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/vipaasaorganics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/91XXXXXXXXXX",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

const TRUST_BADGES = [
  { icon: "🌿", label: "100% Organic" },
  { icon: "🔒", label: "Secure Payments" },
  { icon: "🚚", label: "Pan India Delivery" },
  { icon: "♻️", label: "Eco Packaging" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-8 md:mt-24 overflow-hidden" aria-label="Site footer">
      {/* Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/images/footer_bg_v4.png"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-contain md:object-cover object-bottom"
          aria-hidden="true"
        />
      </div>
      <div className="absolute inset-0 bg-[#F9F7F2]/50 -z-10" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F9F7F2] to-transparent -z-10" aria-hidden="true" />

      {/* Trust Badges Strip */}
      <div className="border-t border-b border-[#D0E5D8]/60 bg-white/40 backdrop-blur-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F]">
              <span aria-hidden="true">{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-6 lg:px-16 pt-12 pb-8 md:pt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h2>
              <p className="text-sm leading-relaxed text-[#4B594F] mt-2 max-w-xs">
                Bringing back the wisdom of the ancients through pure, artisanal, and regenerative organic produce — from India&apos;s heartland to your kitchen.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#EAF2EC] text-[#2D6A4F] hover:bg-[#0F5132] hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Certifications */}
            <p className="text-[11px] text-[#738276] font-medium">
              FSSAI Licensed &bull; APEDA Certified &bull; Made with ❤️ in India
            </p>
          </div>

          {/* Company Links */}
          <nav className="lg:col-span-2 space-y-4" aria-label="Company links">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Company</h3>
            <ul className="space-y-2.5 text-sm font-semibold text-[#4B594F]">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#0F5132] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer Links */}
          <nav className="lg:col-span-2 space-y-4" aria-label="Customer links">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Customer</h3>
            <ul className="space-y-2.5 text-sm font-semibold text-[#4B594F]">
              {CUSTOMER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#0F5132] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Join Our Circle</h3>
            <p className="text-xs leading-relaxed text-[#4B594F]">
              Get seasonal harvest updates, organic living tips, and exclusive member offers — straight to your inbox.
            </p>
            <NewsletterForm />

            {/* Payment Methods */}
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-wider text-[#9EAF9E] font-bold mb-2">Secure Payments</p>
              <div className="flex items-center gap-2 flex-wrap">
                {["Visa", "MC", "UPI", "Razorpay", "NetBanking"].map((pm) => (
                  <span
                    key={pm}
                    className="text-[10px] font-bold px-2 py-1 bg-white/70 border border-[#D0E5D8] rounded-md text-[#4B594F]"
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-[#D0E5D8]/50 px-6 lg:px-16 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#738276] font-medium">
          <p>
            &copy; {currentYear} Vipaasa Organics. All rights reserved. Artisanal. Ethical. Pure.
          </p>
          <nav className="flex items-center gap-4" aria-label="Legal links">
            {LEGAL_LINKS.map((l, i) => (
              <React.Fragment key={l.label}>
                <Link href={l.href} className="hover:text-[#0F5132] transition-colors">
                  {l.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && <span aria-hidden="true">&bull;</span>}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
