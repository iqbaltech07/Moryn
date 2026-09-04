"use client";

import { useState } from "react";
import { Navbar, Footer } from "./components/layout";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  LeaderboardSection,
  IntegrationsSection,
  PricingSection,
  CtaSection,
} from "./components/landing";
import { ExamplePrdModal } from "./components/modals";

export default function HomePage() {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#141817] selection:bg-[#e85d3f]/20 selection:text-[#141817]">
      <Navbar />
      <main>
        <HeroSection onSeeExample={() => setShowExample(true)} />
        <FeaturesSection />
        <HowItWorksSection />
        <LeaderboardSection />
        <IntegrationsSection />
        <PricingSection />
        <CtaSection onSeeExample={() => setShowExample(true)} />
      </main>
      <Footer />
      {showExample && <ExamplePrdModal onClose={() => setShowExample(false)} />}
    </div>
  );
}
