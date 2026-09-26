import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function EligibilityPreviewSection({ onStart }) {
  const easeCurve = [0.25, 0.1, 0.25, 1];

  const requirements = [
    {
      title: 'Undergraduate Degree',
      status: 'MET',
      badgeClass: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40',
      icon: CheckCircle2,
    },
    {
      title: 'Project Coordination Experience',
      status: 'MET',
      badgeClass: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/40',
      icon: CheckCircle2,
    },
    {
      title: '1+ Years Community Involvement',
      status: 'UNCLEAR',
      badgeClass: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/40',
      icon: AlertCircle,
    },
    {
      title: "Master's Degree",
      status: 'NOT MET',
      badgeClass: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/40',
      icon: XCircle,
    },
  ];

  return (
    <section id="eligibility-preview" className="relative py-32 lg:py-44 bg-[#0C0C0C] overflow-hidden border-t border-[rgba(215,226,234,0.06)]">
      {/* Background Soft Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none opacity-10 blur-[160px]"
        style={{
          background: 'radial-gradient(circle, #4DA3FF 0%, #7C5CFC 50%, transparent 80%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            Know where you stand before you apply.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeCurve }}
            className="text-base text-[rgba(215,226,234,0.6)] font-light"
          >
            Every qualification evaluated requirement by requirement.
          </motion.p>
        </div>

        {/* Single Strong Product Visualization Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeCurve }}
          className="rounded-3xl p-6 sm:p-10 bg-[#121624]/85 backdrop-blur-2xl border border-[rgba(215,226,234,0.12)] shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
        >
          {/* Opportunity Header */}
          <div className="pb-6 mb-8 border-b border-[rgba(215,226,234,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#4DA3FF] block mb-1">
                OPPORTUNITY RESULT
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Global Leadership Scholarship
              </h3>
            </div>
            <div className="text-xs font-mono text-[rgba(215,226,234,0.5)] self-start sm:self-auto">
              Evaluation Preview
            </div>
          </div>

          {/* Clean Requirement Rows */}
          <div className="space-y-4 mb-8">
            {requirements.map((req) => {
              const Icon = req.icon;
              return (
                <div
                  key={req.title}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-[rgba(215,226,234,0.06)]"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#D7E2EA]">
                    {req.title}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${req.badgeClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{req.status}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Integrated Potential Differentiator Highlight */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#151928] border border-[rgba(125,226,255,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#7DE2FF]/10 border border-[#7DE2FF]/30 flex items-center justify-center text-[#7DE2FF] flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7DE2FF] mb-1">
                  Potential differentiator
                </div>
                <div className="text-sm sm:text-base font-bold text-white mb-0.5">
                  Community health outreach experience
                </div>
                <p className="text-xs text-[rgba(215,226,234,0.6)] font-light leading-relaxed">
                  Relevant background that strengthens your profile without being an explicit mandatory requirement.
                </p>
              </div>
            </div>

            <span className="self-start sm:self-auto px-2.5 py-1 rounded text-[11px] font-mono text-[rgba(215,226,234,0.6)] bg-white/5 border border-white/10 whitespace-nowrap">
              Not a requirement
            </span>
          </div>

          {/* Action to Launch into Flow */}
          <div className="mt-8 pt-6 border-t border-[rgba(215,226,234,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[rgba(215,226,234,0.5)]">
              Ready to verify your own credentials?
            </span>
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 shadow-md cursor-pointer"
              style={{
                background: 'linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)',
              }}
            >
              Check My Eligibility
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
