import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../Logo';

export default function Navbar({ onOpenApp }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Eligibility', href: '#eligibility-preview' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0C0C0C]/85 backdrop-blur-xl border-b border-[rgba(215,226,234,0.08)] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo & Text */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group text-decoration-none"
        >
          <Logo size={34} variant="dark" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs uppercase tracking-widest font-medium text-[#D7E2EA]/75 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenApp('credentials')}
            className="relative group overflow-hidden px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold text-white transition-all duration-300 shadow-[0_0_20px_-3px_rgba(77,163,255,0.4)] hover:shadow-[0_0_28px_rgba(77,163,255,0.6)] cursor-pointer"
            style={{
              background: 'linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Check My Eligibility
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => onOpenApp('credentials')}
            className="sm:hidden px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#7C5CFC] to-[#4DA3FF]"
          >
            Check
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#D7E2EA] hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-[#0C0C0C]/95 backdrop-blur-2xl border-b border-[rgba(215,226,234,0.1)] px-4 pt-4 pb-6 shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-3 py-2 text-sm uppercase tracking-wider font-medium text-[#D7E2EA] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-[rgba(215,226,234,0.1)] flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenApp('credentials');
                  }}
                  className="w-full py-3 rounded-xl text-sm uppercase tracking-wider font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)',
                  }}
                >
                  Check My Eligibility
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
