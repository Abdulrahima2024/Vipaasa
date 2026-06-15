import React from "react";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 px-6 lg:px-16 pt-16 pb-20 text-[#4B594F] overflow-hidden">
      {/* Background Image Container using optimized Next.js Image component */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/images/footer_bg_v4.png"
          alt="Farming silhouette background"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-contain md:object-cover object-bottom"
        />
      </div>
      {/* Bright Cream Tint Overlay for perfect text contrast while preserving image details */}
      <div className="absolute inset-0 bg-[#F9F7F2]/45 -z-10" />
      {/* Fade-in blend gradient from page background (#F9F7F2) to transparent */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F9F7F2] to-transparent -z-10" />


      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Brand & Socials */}
        <div className="md:col-span-6 space-y-5">
          <h4 className="font-serif text-xl font-bold text-[#113C27]">Vipaasa Organics</h4>
          <p className="text-sm leading-relaxed max-w-sm">
            Bringing back the wisdom of the ancients through pure, artisanal, and regenerative organic produce.
          </p>

          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
              </svg>
            </a>
            <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
              </svg>
            </a>
            <a href="#" className="p-1 text-[#4B594F] hover:text-[#113C27] transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Company</h4>
          <ul className="space-y-2.5 text-sm font-semibold">
            <li><a href="#" className="hover:text-[#113C27] transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#113C27] transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-[#113C27] transition-colors">Wholesale</a></li>
            <li><a href="#" className="hover:text-[#113C27] transition-colors">Contact Us</a></li>
          </ul>
        </div>

        {/* Join Our Circle newsletter signup (rendered as client component) */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#113C27]">Join Our Circle</h4>
          <p className="text-xs leading-relaxed">
            Get seasonal harvest updates and organic living tips.
          </p>
          <NewsletterForm />
        </div>

      </div>

      {/* Footer Bottom copyright */}
      <div className="max-w-7xl mx-auto  mt-10 pt-6 text-center text-xs font-medium text-[#738276]">
        &copy; 2024 Vipaasa Organics. Artisanal. Ethical. Pure.
      </div>
    </footer>
  );
}
