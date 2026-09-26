import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import EligibilityPreviewSection from './EligibilityPreviewSection';
import FinalCtaSection from './FinalCtaSection';
import Footer from './Footer';

export default function LandingPage({ onOpenApp }) {
  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0C0C0C] text-[#D7E2EA] min-h-screen overflow-x-clip selection:bg-[#4DA3FF]/30 selection:text-white">
      {/* Minimal Sticky Navbar */}
      <Navbar onOpenApp={onOpenApp} />

      {/* 1. HERO SECTION: Main visual focus with 3D Credential -> Opportunity -> Eligibility */}
      <HeroSection
        onStart={() => onOpenApp('credentials')}
        onScrollToHowItWorks={scrollToHowItWorks}
      />

      {/* 2. HOW IT WORKS: 4 minimal, clear steps */}
      <HowItWorksSection />

      {/* 3. ELIGIBILITY PREVIEW: Single high-fidelity product visualization + potential differentiator */}
      <EligibilityPreviewSection onStart={() => onOpenApp('credentials')} />

      {/* 4. FINAL CTA: Simple, spacious call to action with 3D C+M emblem */}
      <FinalCtaSection onStart={() => onOpenApp('credentials')} />

      {/* Minimal Clean Footer */}
      <Footer />
    </div>
  );
}
