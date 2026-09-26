import React from 'react';

/**
 * MatchCred Integrated C + M Logo Symbol
 * 
 * Concept:
 * An interconnected monogram where the enclosing precision curve of 'C' (Credential/Certify)
 * integrates seamlessly into the geometric dual peaks of 'M' (Match/Mutual Consensus).
 * Formed as a unified, architectural symbol conveying trust, verification, and precision.
 * 
 * Accent: linear-gradient(120deg, #7C5CFC 0%, #4DA3FF 50%, #7DE2FF 100%)
 */
export function LogoIcon({ size = 36, className = '', variant = 'dark' }) {
  const isLight = variant === 'light';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MatchCred C+M Emblem"
    >
      <defs>
        <linearGradient id="cmAccentGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFC" />
          <stop offset="50%" stopColor="#4DA3FF" />
          <stop offset="100%" stopColor="#7DE2FF" />
        </linearGradient>
        <linearGradient id="cmCardGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isLight ? "#F1F5F9" : "#141721"} />
          <stop offset="100%" stopColor={isLight ? "#E2E8F0" : "#0C0E14"} />
        </linearGradient>
      </defs>

      {/* Background soft shield tile with subtle glowing edge */}
      <rect 
        x="1.5" 
        y="1.5" 
        width="45" 
        height="45" 
        rx="12" 
        fill="url(#cmCardGrad)" 
        stroke="url(#cmAccentGrad)" 
        strokeWidth="1.2"
        strokeOpacity={isLight ? "0.4" : "0.5"} 
      />

      {/* 
        The Integrated C+M Monogram Glyph:
        The 'C' wraps around outer arc from top-right to bottom-right.
      */}
      <path
        d="M36 14C33.2 11.5 29 10 24 10C15.163 10 9 16.268 9 24C9 31.732 15.163 38 24 38C29.2 38 33.5 36.4 36.2 33.8"
        stroke={isLight ? "#0f172a" : "#D7E2EA"}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Internal integrated 'M' bridging across the C core in accent gradient */}
      <path
        d="M17 31V18.5L24 25.5L31 18.5V31"
        stroke="url(#cmAccentGrad)"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Focal consensus node at the central junction of M & C */}
      <circle cx="24" cy="25.5" r="2.2" fill={isLight ? "#0f172a" : "#FFFFFF"} />
    </svg>
  );
}

export default function Logo({ size = 36, showWordmark = true, variant = 'dark', className = '' }) {
  const isLight = variant === 'light';

  return (
    <div 
      className={`brand-logo-container flex items-center gap-3 select-none ${className}`}
      style={{ textDecoration: 'none' }}
    >
      <LogoIcon size={size} variant={variant} />
      {showWordmark && (
        <span 
          className="brand-name tracking-tight font-extrabold flex items-center" 
          style={{ 
            fontSize: size >= 36 ? '1.35rem' : '1.15rem', 
            color: isLight ? '#0f172a' : '#D7E2EA',
            fontFamily: "'Kanit', sans-serif"
          }}
        >
          Match
          <span className="bg-gradient-to-r from-[#7C5CFC] via-[#4DA3FF] to-[#7DE2FF] bg-clip-text text-transparent ml-0.5">
            Cred
          </span>
        </span>
      )}
    </div>
  );
}
