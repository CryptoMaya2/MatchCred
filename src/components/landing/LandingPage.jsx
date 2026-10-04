import React from 'react';
import { ArrowRight, ArrowUpRight, Check, CircleHelp, FileText, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, Mic, Volume2 } from 'lucide-react';
import Logo from '../Logo';
import { CONTRACT_ADDRESS, CONTRACT_READY } from '../../services/genlayerService';
import './landing.css';

const steps = [
  { icon: FileText, label: '01', title: 'Your profile.', body: 'Add your credentials or upload a CV to build your profile.' },
  { icon: GraduationCap, label: '02', title: 'Your opportunity.', body: 'Paste the requirements for a job, scholarship, or fellowship.' },
  { icon: Sparkles, label: '03', title: 'Your next move.', body: 'See the match, understand the gaps, and prepare with purpose.' },
];

function ProductPreview() {
  return <div className="mc-device" aria-label="Illustrative MatchCred eligibility dashboard">
    <div className="mc-device-top"><div className="mc-device-dots"><i/><i/><i/></div><span>MatchCred / Eligibility report</span><span className="mc-device-avatar">MC</span></div>
    <div className="mc-device-body"><aside className="mc-device-side"><div className="mc-side-logo">M<span>✦</span></div><div className="mc-side-active">▦ <span>Overview</span></div><div>▧ <span>Credentials</span></div><div>◇ <span>Opportunities</span></div><div>◎ <span>Preparation</span></div></aside>
      <div className="mc-device-main"><div className="mc-preview-label">YOUR REPORT <span>EXAMPLE</span></div><h3>You're closer than you think.</h3><p>Product Design Fellowship · Example opportunity</p><div className="mc-report-grid"><div className="mc-report-score"><div className="mc-score-ring"><strong>75<span>%</span></strong></div><span>Requirements supported</span></div><div className="mc-report-mini"><span><i className="mc-green"/> 3 requirements met</span><span><i className="mc-amber"/> 1 needs clarification</span><span><i className="mc-gray"/> 0 not met</span></div></div><div className="mc-report-title">Requirement breakdown <span>View all <ArrowUpRight size={12}/></span></div><div className="mc-report-row"><div className="mc-row-icon"><Check size={15}/></div><div><strong>Relevant degree</strong><small>Supported by candidate-submitted credential</small></div><b>MET</b></div><div className="mc-report-row"><div className="mc-row-icon"><Check size={15}/></div><div><strong>Portfolio experience</strong><small>Relevant projects found in your profile</small></div><b>MET</b></div><div className="mc-report-row unsure"><div className="mc-row-icon"><CircleHelp size={15}/></div><div><strong>Professional certification</strong><small>More information is needed</small></div><b>UNCLEAR</b></div></div>
    </div>
  </div>;
}

export default function LandingPage({ onOpenApp, onOpenAlexa }) {
  return <div className="mc-site" id="top">
    <header className="mc-nav">
      <a href="#top" aria-label="MatchCred home" className="mc-brand"><Logo size={33} variant="light"/></a>
      <nav aria-label="Main navigation">
        <a href="#experience">The experience</a>
        <a href="#alexa-showcase">Alexa+ Voice</a>
        <a href="#how">How it works</a>
        <a href="#genlayer">GenLayer</a>
        {onOpenAlexa && (
          <button type="button" onClick={onOpenAlexa} className="mc-nav-alexa-link" style={{ background: 'rgba(0, 202, 255, 0.12)', border: '1px solid rgba(0, 202, 255, 0.4)', color: '#7de2ff', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00caff', display: 'inline-block', boxShadow: '0 0 8px #00caff' }} />
            Simulated Alexa+
          </button>
        )}
      </nav>
      <button className="mc-nav-button" onClick={() => onOpenApp('credentials')}>Open MatchCred <ArrowUpRight size={15}/></button>
    </header>
    <main>
      <section className="mc-hero">
        <div className="mc-hero-glow"/>
        <div className="mc-hero-inner">
          <div className="mc-alexa-banner-tag">
            <span className="mc-alexa-pulse-dot"/>
            <span>Simulated Alexa+ Voice &amp; Screen Experience Available</span>
          </div>
          <h1>Every opportunity<br/>starts with <em>clarity.</em></h1>
          <p>Know how your experience matches the opportunity ahead. See what you have, what you need, and where to go next — with step-by-step review or ambient Alexa voice.</p>
          <div className="mc-hero-actions">
            <button className="mc-primary" onClick={() => onOpenApp('credentials')}>
              Check your eligibility <ArrowRight size={18}/>
            </button>
            {onOpenAlexa && (
              <button
                type="button"
                className="mc-alexa-hero-btn"
                onClick={onOpenAlexa}
                title="Launch Simulated Alexa+ Screen"
              >
                <span className="mc-alexa-pulse-dot" />
                <span>Try with Alexa Voice</span>
                <Mic size={16} />
              </button>
            )}
            <a href="#experience">See how it works <ArrowUpRight size={16}/></a>
          </div>
          <div className="mc-hero-note">
            <ShieldCheck size={15}/> Choose between hands-free Alexa voice evaluation or interactive CV &amp; credential review.
          </div>
        </div>
        <div className="mc-product-stage"><div className="mc-stage-halo"/><ProductPreview/><div className="mc-stage-caption">A clearer view of what comes next.</div></div>
      </section>

      {/* DEDICATED ALEXA VOICE FEATURE SHOWCASE */}
      <section id="alexa-showcase" className="mc-alexa-showcase">
        <div className="mc-alexa-showcase-inner">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(0, 202, 255, 0.15)', border: '1px solid rgba(0, 202, 255, 0.4)', borderRadius: '999px', color: '#7de2ff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              <span className="mc-alexa-pulse-dot"/>
              Simulated Alexa+ Experience • No Gated SDK Required
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', lineHeight: 1.15, fontWeight: 700, margin: '0 0 20px 0', letterSpacing: '-0.04em' }}>
              “Alexa, do I qualify for this fellowship?”
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#94a3b8', margin: '0 0 28px 0', maxWidth: '520px' }}>
              Talk or type hands-free. MatchCred checks whether your credentials or CV are loaded, evaluates requirements in real time, and both speaks and shows your percentage match, met criteria, gaps, and preparation next steps.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {onOpenAlexa && (
                <button
                  type="button"
                  className="mc-alexa-hero-btn"
                  onClick={onOpenAlexa}
                  style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff' }}
                >
                  <Volume2 size={16} />
                  <span>Launch Alexa Screen (/alexa)</span>
                </button>
              )}
              <button
                type="button"
                className="mc-primary"
                onClick={() => onOpenApp('credentials')}
                style={{ background: '#1e293b', border: '1px solid #334155' }}
              >
                <span>Check Eligibility Manually</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(0, 202, 255, 0.35)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 202, 255, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pb: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00caff', boxShadow: '0 0 10px #00caff' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7de2ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Smart Screen Context
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>localhost /alexa</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Spoken Query</div>
              <strong style={{ fontSize: '15px', color: '#ffffff' }}>“Alexa, do I qualify for this fellowship?”</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0, 202, 255, 0.06)', border: '1px solid rgba(0, 202, 255, 0.25)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#00caff 0 75%, #1e293b 75% 100%)', display: 'grid', placeItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0b1120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <strong style={{ fontSize: '16px', color: '#fff' }}>75%</strong>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#7de2ff', marginBottom: '4px' }}>Product Design Fellowship</div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>3 MET</span>
                  <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>1 UNCLEAR</span>
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>0 NOT MET</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '12px' }}>
              <strong style={{ color: '#00caff', display: 'block', marginBottom: '4px' }}>Spoken Alexa Response:</strong>
              “Based on MatchCred's evaluation for Product Design Fellowship: you have a 75% match. 3 requirements met, 1 unclear. Next step: Enter Preparation mode to document experience and address gaps.”
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="mc-statement"><span className="mc-section-label">INTRODUCING MATCHCRED</span><h2>Less guessing.<br/><span>More going for it.</span></h2><p>Opportunity requirements don't have to feel like a puzzle. MatchCred turns them into a simple, useful picture of where you stand.</p></section>

      <section id="how" className="mc-section mc-how"><div className="mc-section-intro"><span className="mc-section-label">MADE FOR YOUR NEXT MOVE</span><h2>Three steps.<br/>A much clearer path.</h2><p>From your experience to an actionable plan, all in one place.</p></div><div className="mc-step-grid">{steps.map(({icon:Icon,label,title,body})=><article className="mc-step" key={label}><div className="mc-step-icon"><Icon size={25}/></div><span>{label} / 03</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <section className="mc-feature"><div className="mc-feature-copy"><span className="mc-section-label">ANSWERS WITH CONTEXT</span><h2>Not just a score.<br/><span>The whole story.</span></h2><p>Understand why each requirement is met, unclear, or still out of reach. See the evidence behind the result and build a plan around the gaps.</p><button className="mc-inline-link" onClick={() => onOpenApp('credentials')}>Explore MatchCred <ArrowRight size={17}/></button></div><div className="mc-feature-art"><div className="mc-art-orb"/><div className="mc-insight-card"><span className="mc-insight-eyebrow">YOUR NEXT STEP</span><div className="mc-insight-icon"><Sparkles size={22}/></div><h3>A plan you can act on.</h3><p>Your education matches. Add details about your professional certification to strengthen this application.</p><div><span className="mc-insight-pill">1 item to clarify</span><span className="mc-insight-line"/></div></div></div></section>

      <section id="genlayer" className="mc-network"><div className="mc-network-symbol"><LockKeyhole size={25}/></div><div><span className="mc-section-label">POWERED BY GENLAYER</span><h2>Decisions with a trail.</h2><p>Choose a public GenLayer consensus review for manually entered credentials, or keep your CV in a local preview. Consensus evaluates the evidence you provide; it does not authenticate a credential with its issuer.</p><a href={CONTRACT_READY ? `https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}` : "https://genlayer.com"} target="_blank" rel="noreferrer" className="mc-network-link">{CONTRACT_READY ? 'View the Studionet contract' : 'Explore GenLayer'} <ArrowUpRight size={15}/></a></div></section>

      <section className="mc-close"><span className="mc-section-label">READY WHEN YOU ARE</span><h2>See where you stand.<br/><em>Then go further.</em></h2><button className="mc-primary" onClick={() => onOpenApp('credentials')}>Get started <ArrowRight size={18}/></button></section>
    </main><footer className="mc-footer"><Logo size={28} variant="light"/><span>© {new Date().getFullYear()} MatchCred. Built for what's next.</span><a href="#top">Back to top ↑</a></footer>
  </div>;
}
