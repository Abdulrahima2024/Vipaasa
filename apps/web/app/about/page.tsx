"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/authStore";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Leaf,
  Sprout,
  Heart,
  ShieldCheck,
  Award,
  Send,
  CheckCircle2,
  Compass,
  Globe,
  Store,
  ChevronRight
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timings: string;
  mapEmbedUrl: string;
}

const branches: Branch[] = [
  {
    id: "hyderabad",
    name: "Hyderabad Flagship Outlet",
    address: "Road No. 36, Near Jubilee Hills Check Post, Jubilee Hills, Hyderabad - 500033",
    phone: "+91 98765 43210",
    email: "hyd@vipaasaorganics.com",
    timings: "9:00 AM - 9:00 PM (Open Daily)",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.0142345864195!2d78.4014389!3d17.4350917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9132204c34cb%3A0xb3eb30855427d113!2sJubilee%20Hills%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },
  {
    id: "bengaluru",
    name: "Bengaluru Experience Store",
    address: "Indiranagar Double Road, Opposite Metro Pillar 84, Indiranagar, Bengaluru - 560038",
    phone: "+91 87654 32109",
    email: "blr@vipaasaorganics.com",
    timings: "10:00 AM - 9:00 PM (Open Daily)",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9715978187847!2d77.6384234!3d12.9783692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a30c5e15ab%3A0xe4a4087ec8f886f4!2sIndiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },
  {
    id: "vijayawada",
    name: "Vijayawada Outlet",
    address: "Benz Circle Main Road, Near Jyothi Mahal, Vijayawada - 520010",
    phone: "+91 76543 21098",
    email: "vja@vipaasaorganics.com",
    timings: "9:00 AM - 9:30 PM (Open Daily)",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.4674395662055!2d80.6480112!3d16.5024765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f3dfd96201b1%3A0x6a0fcf6004b56658!2sBenz%20Circle%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  }
];

export default function AboutPage() {
  const { items, favorites } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // States for interactive map selection
  const [activeBranchId, setActiveBranchId] = useState<string>("hyderabad");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("hyderabad");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMessage("Please fill out all required fields.");
      setFormStatus("error");
      return;
    }

    setFormStatus("submitting");

    // Simulate API call for premium UI feedback
    setTimeout(() => {
      setFormStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setErrorMessage("");
    }, 1500);
  };

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
        activeNav="About Vipaasa"
        cartCount={mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0}
        favoritesCount={mounted ? favorites.length : 0}
        onFavoritesClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/favorites";
          }
        }}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-8 space-y-12 sm:space-y-16">
        
        {/* HERO SECTION BANNER */}
        <section className="relative py-16 sm:py-24 bg-[#113C27] text-white text-center px-6 overflow-hidden rounded-3xl shadow-xl">
          {/* Nature icons style outlines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[10%] left-[5%] w-24 h-24 border border-white rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[5%] w-32 h-32 border-4 border-white border-dashed rounded-full" />
            <div className="absolute top-[40%] right-[12%] w-16 h-16 border-2 border-white rounded-md rotate-45" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2D6A4F]/60 text-[#C1F2D0] text-xs font-bold uppercase tracking-wider mb-2">
              <Leaf className="w-3.5 h-3.5" />
              Our Story & Heritage
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Purity from Seed to Soul
            </h1>
            <p className="text-sm sm:text-lg text-[#C1F2D0] font-medium leading-relaxed max-w-2xl mx-auto">
              Vipaasa Organics was founded to restore the connection between pristine, traditional agricultural methods and conscious modern households.
            </p>
          </div>
        </section>

        {/* HERITAGE STORY & PHILOSOPHY */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#113C27]">
              The Roots of Vipaasa Organics
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-[#4B594F] leading-relaxed">
              <p>
                Our journey began with a simple observation: the modern food industry had lost its connection to nature. Chemical fertilizers, artificial colors, and heavy processing had compromised both nutritional value and original taste.
              </p>
              <p>
                <strong>Vipaasa Organics</strong> was born to create a pesticide-free haven. We partner directly with small-scale, marginal farmers across India who practice regenerative Vedic agriculture. By skipping third-party brokers, we ensure our farmers are paid premium prices, and our customers receive absolute purity.
              </p>
              <p>
                From nutrient-dense stone-ground flours to pure, aromatic A2 Desi Cow Ghee cooked in traditional clay pots, our kitchen staples reflect a lifestyle aligned with health, transparency, and environment.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EAE6DB] text-xs font-bold text-[#113C27] shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                100% Pesticide-Free
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EAE6DB] text-xs font-bold text-[#113C27] shadow-sm">
                <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                Regenerative Vedic Soil
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EAE6DB] text-xs font-bold text-[#113C27] shadow-sm">
                <Heart className="w-4 h-4 text-[#2D6A4F]" />
                Direct-from-Farmer Sourced
              </div>
            </div>
          </div>

          {/* Graphical Stats Cards block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#113C27] to-[#1E4D36] text-white space-y-2 shadow-lg group hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif block text-[#C1F2D0]">10k+</span>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">Happy Families</h4>
              <p className="text-[11px] sm:text-xs text-white/80 leading-normal font-medium">Choosing purity, nutrition, and chemical-free wellness daily.</p>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE6DB] text-[#113C27] space-y-2 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif block text-[#2D6A4F]">500+</span>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4B594F]">Acres Restored</h4>
              <p className="text-[11px] sm:text-xs text-[#5C6E61] leading-normal font-semibold">Protected soil using Vedic, biodynamic composts and natural cycles.</p>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE6DB] text-[#113C27] space-y-2 shadow-sm group hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif block text-[#2D6A4F]">100%</span>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4B594F]">Traceable Staples</h4>
              <p className="text-[11px] sm:text-xs text-[#5C6E61] leading-normal font-semibold">Every harvest batch is directly traced back to its organic farm roots.</p>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#2D6A4F] to-[#113C27] text-white space-y-2 shadow-lg group hover:-translate-y-1 transition-all duration-300">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif block text-[#C1F2D0]">150+</span>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">Traditional Staples</h4>
              <p className="text-[11px] sm:text-xs text-white/80 leading-normal font-medium">Stone-ground powders, unpolished grains, and hand-churned ghee.</p>
            </div>
          </div>
        </section>

        {/* PILLARS OF PURITY SECTION */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#113C27]">Our Pillars of Purity</h2>
            <p className="text-xs sm:text-sm text-[#4B594F] font-semibold leading-relaxed">
              Every Vipaasa Organics staple undergoes rigorous standards before leaving the fields.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#EAE6DB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C1F2D0] text-[#113C27] flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#113C27]">Regenerative Soils</h4>
              <p className="text-xs text-[#5C6E61] leading-relaxed font-medium">
                We replenish farm soil with Vedic Jeevamrutham, bio-composts, and natural cow manure to retain natural soil carbon.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE6DB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C1F2D0] text-[#113C27] flex items-center justify-center mx-auto">
                <Leaf className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#113C27]">No Chemical Compromise</h4>
              <p className="text-xs text-[#5C6E61] leading-relaxed font-medium">
                Zero synthetic pesticides, zero processing bleaching agents, and zero synthetic preservatives from harvest to packing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE6DB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C1F2D0] text-[#113C27] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#113C27]">Traditional Craft</h4>
              <p className="text-xs text-[#5C6E61] leading-relaxed font-medium">
                Cold-pressed oils, stone-ground whole wheat flours, and wood-fire ghee prepared in micro-batches to preserve essential oils.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE6DB] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#C1F2D0] text-[#113C27] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#113C27]">Farmer First Ethos</h4>
              <p className="text-xs text-[#5C6E61] leading-relaxed font-medium">
                100% of our farming partners receive premium, non-volatile market pricing directly, boosting rural farm community economies.
              </p>
            </div>
          </div>
        </section>

        {/* OUTLETS & PHYSICAL STORES SECTION */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#113C27]">Our Stores & Outlets</h2>
            <p className="text-xs sm:text-sm text-[#4B594F] font-semibold leading-relaxed">
              Step in to experience our fresh harvests, organic grains, and hand-crafted wellness blends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  activeBranchId === b.id
                    ? "bg-[#113C27] text-white border-[#113C27] shadow-lg scale-[1.02]"
                    : "bg-white text-[#113C27] border-[#EAE6DB] shadow-sm hover:shadow-md hover:border-[#2D6A4F]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${activeBranchId === b.id ? "bg-[#2D6A4F]/60 text-[#C1F2D0]" : "bg-[#FAF9F5] text-[#113C27]"}`}>
                      <Store className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeBranchId === b.id ? "bg-[#C1F2D0] text-[#113C27]" : "bg-[#FAF9F5] text-[#5C6E61] border border-[#EAE6DB]"
                    }`}>
                      Active Branch
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold">{b.name}</h3>
                    <p className={`text-xs leading-relaxed ${activeBranchId === b.id ? "text-white/80" : "text-[#5C6E61]"} font-medium`}>
                      {b.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t mt-6 border-current/10">
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-semibold">{b.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-semibold break-all">{b.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-semibold">{b.timings}</span>
                  </div>

                  <button
                    type="button"
                    className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeBranchId === b.id
                        ? "bg-[#C1F2D0] text-[#113C27] hover:bg-white"
                        : "bg-[#FAF9F5] text-[#113C27] hover:bg-[#113C27] hover:text-white"
                    }`}
                  >
                    View Map Location
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MAP PANEL SECTION */}
        <section className="bg-white border border-[#EAE6DB] rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DB]/60 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 animate-spin" />
                Store Locator
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
                {activeBranch.name} Location Map
              </h3>
            </div>
            {/* Map tab pills */}
            <div className="flex gap-2 flex-wrap">
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBranchId(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeBranchId === b.id
                      ? "bg-[#113C27] text-white"
                      : "bg-[#FAF9F5] text-[#4B594F] border border-[#EAE6DB] hover:bg-[#ECE9E0]"
                  }`}
                >
                  {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full h-[320px] sm:h-[450px] overflow-hidden rounded-2xl bg-[#FAF9F5] border border-[#EAE6DB]/60 shadow-inner">
            <iframe
              src={activeBranch.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${activeBranch.name} Map`}
              className="absolute inset-0"
            />
          </div>
        </section>

        {/* CONTACT INQUIRY FORM */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start bg-white border border-[#EAE6DB] rounded-3xl overflow-hidden shadow-sm">
          {/* Form left banner */}
          <div className="p-8 lg:p-12 bg-[#113C27] text-white space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C1F2D0]">Get in Touch</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                Connect with Our Organic Experts
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-semibold">
                Have questions about specific grains, bulk orders, shipping details, or regenerative farming? Our dedicated support team is ready to guide you.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C1F2D0] flex-shrink-0" />
                <div>
                  <p className="font-bold text-white">Central Support Helpline</p>
                  <p className="text-white/70 font-semibold">+91 99887 76655</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C1F2D0] flex-shrink-0" />
                <div>
                  <p className="font-bold text-white">Direct Email</p>
                  <p className="text-white/70 font-semibold break-all">info@vipaasaorganics.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#C1F2D0] flex-shrink-0" />
                <div>
                  <p className="font-bold text-white">Website support hours</p>
                  <p className="text-white/70 font-semibold">Monday - Saturday (9 AM - 6 PM)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form right inputs */}
          <div className="p-6 sm:p-10 lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#113C27]">
                Submit an Inquiry
              </h4>
              <p className="text-xs text-[#5C6E61] font-semibold">
                Complete the form below and receive a detailed response within 24 hours.
              </p>
            </div>

            {formStatus === "success" ? (
              <div className="p-8 rounded-2xl bg-[#C1F2D0]/30 border border-[#2D6A4F]/20 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#C1F2D0] text-[#113C27] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h5 className="font-serif text-lg font-bold text-[#113C27]">Inquiry Submitted Successfully!</h5>
                  <p className="text-xs sm:text-sm text-[#4B594F] max-w-md mx-auto leading-relaxed font-semibold">
                    Thank you for reaching out to Vipaasa Organics. Our organics consultant has received your message and will email or call you shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormStatus("idle")}
                  className="px-6 py-2 rounded-xl bg-[#113C27] text-white hover:bg-[#2D6A4F] text-xs font-bold transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
                {formStatus === "error" && errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 animate-shake">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="name-input" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      required
                      placeholder="e.g. Kumara Sai"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-semibold placeholder-[#738276] focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email-input" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      placeholder="e.g. kumarasai@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-semibold placeholder-[#738276] focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="phone-input" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      placeholder="e.g. +91 99887 76655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-semibold placeholder-[#738276] focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="branch-select" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                      Select Nearest Branch
                    </label>
                    <select
                      id="branch-select"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-bold focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                    >
                      <option value="hyderabad">Hyderabad Jubilee Hills</option>
                      <option value="bengaluru">Bengaluru Indiranagar</option>
                      <option value="vijayawada">Vijayawada Benz Circle</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="subject-select" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                    Inquiry Topic
                  </label>
                  <select
                    id="subject-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-bold focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bulk">Bulk / Retail Distribution Order</option>
                    <option value="farmers">Farmer Partnership Opportunities</option>
                    <option value="support">Order Status & Delivery Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="message-input" className="text-xs font-extrabold text-[#113C27] uppercase tracking-wider block">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message-input"
                    required
                    rows={4}
                    placeholder="Tell us what you'd like to ask or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DB] rounded-xl px-4 py-2.5 text-xs text-[#113C27] font-semibold placeholder-[#738276] focus:outline-none focus:ring-1 focus:ring-[#113C27]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  className="w-full py-3 rounded-xl bg-[#113C27] text-white hover:bg-[#2D6A4F] text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-[#113C27]/15"
                >
                  {formStatus === "submitting" ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <Footer />
    </div>
  );
}
