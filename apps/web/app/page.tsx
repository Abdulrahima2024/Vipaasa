import React from "react";
import HomeClientLayout from "../components/home/HomeClientLayout";
import Hero from "../components/home/Hero";
import BenefitsSection from "../components/home/BenefitsSection";
import PromiseSection from "../components/home/PromiseSection";
import SeasonalSpotlight from "../components/home/SeasonalSpotlight";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "Vipaasa Organics - Pure & Regenerative Staples",
  description: "Artisanal organic staples curated from regenerative farms across India. High-quality pulses, millets, honey, and cow ghee.",
};

export default function HomePage() {
  return (
    <HomeClientLayout
      hero={<Hero />}
      benefits={<BenefitsSection />}
      promise={<PromiseSection />}
      spotlight={<SeasonalSpotlight />}
      footer={<Footer />}
    />
  );
}

