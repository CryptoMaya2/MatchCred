import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotion();
  const easeCurve = [0.25, 0.1, 0.25, 1];

  const steps = [
    {
      num: '01',
      title: 'Add your credentials',
      brief: 'Degrees, certifications, and professional background.',
    },
    {
      num: '02',
      title: 'Choose an opportunity',
      brief: 'Paste the link or enter the requirements directly.',
    },
    {
      num: '03',
      title: 'Check your eligibility',
      brief: 'Requirement-by-requirement evaluation.',
    },
    {
      num: '04',
      title: 'Prepare your application',
      brief: 'Understand gaps and strengthen your submission.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 lg:py-44 bg-[#0C0C0C] overflow-hidden border-t border-[rgba(215,226,234,0.06)]">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeCurve }}
            className="text-base text-[rgba(215,226,234,0.6)] font-light"
          >
            Four straightforward steps to verify where you stand before applying.
          </motion.p>
        </div>

        {/* 4 Minimalist Steps Grid with Generous Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: easeCurve }}
              whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-[#121622]/60 border border-[rgba(215,226,234,0.08)] hover:border-[rgba(77,163,255,0.3)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#4DA3FF] tracking-widest block mb-4">
                  {step.num}
                </span>

                <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-[rgba(215,226,234,0.6)] font-light leading-relaxed">
                  {step.brief}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
