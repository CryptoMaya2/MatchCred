import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LogoIcon } from '../Logo';

export default function FinalCtaSection({ onStart }) {
  const prefersReducedMotion = useReducedMotion();
  const easeCurve = [0.25, 0.1, 0.25, 1];

  return (
    <section className="relative py-36 lg:py-48 bg-[#0C0C0C] overflow-hidden border-t border-[rgba(215,226,234,0.06)]">
      {/* Background radial glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full pointer-events-none opacity-15 blur-[160px]"
        style={{
          background: 'radial-gradient(circle, #4DA3FF 0%, #7C5CFC 50%, transparent 80%)',
        }}
      />

      {/* Floating 3D C + M Monogram Emblem in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none perspective-1000">
        <motion.div
          animate={prefersReducedMotion ? {} : {
            rotateY: [0, 6, 0, -6, 0],
            rotateX: [0, -4, 0, 4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 16,
            ease: 'easeInOut',
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <LogoIcon size={480} variant="dark" />
        </motion.div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Large Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeCurve }}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5"
        >
          Know before you apply.
        </motion.h2>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeCurve }}
          className="text-base sm:text-lg text-[rgba(215,226,234,0.65)] font-light leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Verify your credentials. Understand the requirements. Prepare your application.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeCurve }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            onClick={onStart}
            className="px-9 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_35px_-5px_rgba(77,163,255,0.45)] hover:shadow-[0_0_45px_rgba(77,163,255,0.7)] transition-all duration-300 flex items-center gap-3 cursor-pointer"
            style={{
              background: 'linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)',
            }}
          >
            <span>Check My Eligibility</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
