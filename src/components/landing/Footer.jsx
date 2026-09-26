import React from 'react';
import Logo from '../Logo';

export default function Footer() {
  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Eligibility', href: '#eligibility-preview' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#080808] border-t border-[rgba(215,226,234,0.06)] py-14 text-[#D7E2EA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[rgba(215,226,234,0.06)]">
          {/* Logo & Brief Tagline */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block text-decoration-none"
            >
              <Logo size={32} variant="dark" />
            </a>
            <span className="hidden sm:inline-block text-white/20">|</span>
            <span className="text-xs text-[rgba(215,226,234,0.6)] font-light">
              Credential verification &amp; application prep
            </span>
          </div>

          {/* Minimal Navigation */}
          <div className="flex items-center gap-6 text-xs text-[rgba(215,226,234,0.6)]">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Metadata & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[rgba(215,226,234,0.4)]">
          <div>
            © 2026 MatchCred. All rights reserved.
          </div>
          <div className="font-mono text-[11px]">
            Connected to GenLayer Studionet (Chain 61999)
          </div>
        </div>
      </div>
    </footer>
  );
}
