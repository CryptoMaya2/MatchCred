import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, FileText, ChevronRight } from 'lucide-react';

export default function HeroSection({ onStart, onScrollToHowItWorks }) {
  const prefersReducedMotion = useReducedMotion();
  
  // Mouse position for subtle 3D tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalized coordinates (-1 to 1)
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 lg:py-0 overflow-hidden"
      style={{ background: '#0C0C0C' }}
    >
      {/* Background Soft Radial Glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full pointer-events-none opacity-20 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #4DA3FF 0%, #7C5CFC 40%, transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full pointer-events-none opacity-15 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #7DE2FF 0%, #2563eb 50%, transparent 80%)',
        }}
      />

      {/* Grid Pattern overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #D7E2EA 1px, transparent 1px), linear-gradient(to bottom, #D7E2EA 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)] py-12">
          
          {/* Left Hero Content (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-7 text-left flex flex-col items-start"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(215,226,234,0.12)] bg-[#12151E]/80 backdrop-blur-md mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#4DA3FF] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D7E2EA]/90">
                CREDENTIALS × OPPORTUNITIES
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
              Verify your{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#7C5CFC] via-[#4DA3FF] to-[#7DE2FF] bg-clip-text text-transparent">
                  eligibility.
                </span>
                {/* Subtle underline glow */}
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#7C5CFC] via-[#4DA3FF] to-[#7DE2FF] opacity-60"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#D7E2EA] font-medium max-w-xl leading-relaxed mb-3">
              Instant credential verification and application prep.
            </p>

            {/* Small Supporting Line */}
            <p className="text-sm sm:text-base text-[rgba(215,226,234,0.6)] font-light max-w-lg leading-relaxed mb-10">
              Verify eligibility before you apply.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={onStart}
                className="group relative px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_35px_-5px_rgba(77,163,255,0.45)] hover:shadow-[0_0_45px_rgba(77,163,255,0.7)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                style={{
                  background: 'linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)',
                }}
              >
                <span>Check My Eligibility</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={onScrollToHowItWorks}
                className="px-6 py-4 rounded-xl text-sm font-medium text-[#D7E2EA] hover:text-white bg-[#141722]/80 hover:bg-[#1A1F2E] border border-[rgba(215,226,234,0.12)] hover:border-[rgba(215,226,234,0.25)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-[#D7E2EA]/60" />
              </button>
            </div>
          </motion.div>

          {/* Right Hero 3D Object Visualization (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] perspective-1000">
            {/* Interactive 3D Canvas Container */}
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                transform: prefersReducedMotion
                  ? 'none'
                  : `rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
                transition: prefersReducedMotion ? 'none' : 'transform 0.15s ease-out',
              }}
              className="relative w-full max-w-[420px] h-[460px] flex items-center justify-center"
            >
              {/* Central Glowing Orb behind 3D cards */}
              <div 
                className="absolute inset-0 m-auto w-56 h-56 rounded-full opacity-40 blur-[80px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #4DA3FF 0%, #7C5CFC 60%, transparent 90%)',
                }}
              />

              {/* LAYER 1: Credential Card (Top/Back Layer) */}
              <motion.div
                initial={{ opacity: 0, y: -40, z: -30 }}
                animate={{ 
                  opacity: 1, 
                  y: prefersReducedMotion ? 0 : [0, -6, 0], 
                  z: 0 
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.2 },
                  y: {
                    repeat: Infinity,
                    duration: 5,
                    ease: 'easeInOut',
                  }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(10px)',
                }}
                className="absolute top-2 -left-2 sm:-left-4 w-[280px] sm:w-[310px] rounded-2xl p-4 sm:p-5 bg-[#121622]/90 backdrop-blur-xl border border-[rgba(215,226,234,0.12)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFC]/30 to-[#4DA3FF]/30 border border-[#4DA3FF]/30 flex items-center justify-center text-white">
                      <FileText className="w-4 h-4 text-[#7DE2FF]" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#D7E2EA]/50">
                        CREDENTIAL CLAIM
                      </div>
                      <div className="text-sm font-bold text-white tracking-tight">
                        B.Sc. Computer Science
                      </div>
                    </div>
                  </div>
                  {/* Verified indicator badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#34D399] text-[10px] font-semibold"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </motion.div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[rgba(215,226,234,0.08)] text-xs text-[rgba(215,226,234,0.7)]">
                  <div className="flex justify-between">
                    <span className="text-[rgba(215,226,234,0.45)]">Issuing Institution:</span>
                    <span className="font-medium text-white">University of Lagos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(215,226,234,0.45)]">Completion Year:</span>
                    <span className="font-mono text-[#7DE2FF]">2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(215,226,234,0.45)]">Attestation Hash:</span>
                    <span className="font-mono text-[10px] text-[rgba(215,226,234,0.4)]">0x9c4f...7a1b</span>
                  </div>
                </div>
              </motion.div>

              {/* LAYER 2: Opportunity Card (Middle Layer) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, z: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: prefersReducedMotion ? 0 : [0, 8, 0],
                  z: 40 
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 1.4 },
                  scale: { duration: 0.6, delay: 1.4 },
                  y: {
                    repeat: Infinity,
                    duration: 5.5,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(40px)',
                }}
                className="absolute top-36 right-0 sm:-right-4 w-[290px] sm:w-[320px] rounded-2xl p-4 sm:p-5 bg-[#141826]/95 backdrop-blur-xl border border-[rgba(77,163,255,0.25)] shadow-[0_25px_50px_rgba(0,0,0,0.7)] z-20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4DA3FF]">
                    OPPORTUNITY REQUIREMENTS
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[rgba(215,226,234,0.6)]">
                    Target
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-3">
                  Product Design Fellowship
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-xs text-[#D7E2EA]">Bachelor's degree</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#10B981]">Required</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-xs text-[#D7E2EA]">Design portfolio</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#10B981]">Required</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="text-xs text-[#D7E2EA]">Relevant experience</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#F59E0B]">Details needed</span>
                  </div>
                </div>
              </motion.div>

              {/* LAYER 3: Eligibility Result Card (Front Foreground Layer) */}
              <motion.div
                initial={{ opacity: 0, y: 50, z: 60 }}
                animate={{ 
                  opacity: 1, 
                  y: prefersReducedMotion ? 0 : [0, -6, 0],
                  z: 75 
                }}
                transition={{
                  opacity: { duration: 0.7, delay: 2.2 },
                  y: {
                    repeat: Infinity,
                    duration: 6,
                    ease: 'easeInOut',
                    delay: 1,
                  }
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(75px)',
                }}
                className="absolute bottom-2 left-2 sm:left-4 w-[270px] sm:w-[290px] rounded-2xl p-4 bg-gradient-to-b from-[#181D2E] to-[#0F121C] backdrop-blur-2xl border border-[rgba(124,92,252,0.35)] shadow-[0_30px_60px_rgba(0,0,0,0.85)] z-30"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(215,226,234,0.1)]">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#D7E2EA]/60">
                    ELIGIBILITY EVALUATION
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/50 text-[#34D399] font-bold text-xs">
                    MET
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span><strong>2</strong> requirements verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#FBBF24]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    <span><strong>1</strong> requirement needs review</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[rgba(215,226,234,0.08)] flex items-center justify-between text-[10px] text-[rgba(215,226,234,0.6)]">
                  <span>Requirement Evaluation</span>
                  <span className="font-mono text-[#7DE2FF]">Clear Pathway</span>
                </div>
              </motion.div>

              {/* Connecting 3D laser glow line between layers */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background: 'linear-gradient(45deg, transparent 40%, rgba(77,163,255,0.2) 50%, transparent 60%)',
                }}
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
