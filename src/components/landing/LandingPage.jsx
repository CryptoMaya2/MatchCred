import React from 'react';
import { ArrowRight, ArrowUpRight, Check, CircleHelp, FileText, GraduationCap, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
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

export default function LandingPage({ onOpenApp }) {
  return <div className="mc-site" id="top">
    <header className="mc-nav"><a href="#top" aria-label="MatchCred home" className="mc-brand"><Logo size={33} variant="light"/></a><nav aria-label="Main navigation"><a href="#experience">The experience</a><a href="#how">How it works</a><a href="#genlayer">GenLayer</a></nav><button className="mc-nav-button" onClick={() => onOpenApp('credentials')}>Open MatchCred <ArrowUpRight size={15}/></button></header>
    <main>
      <section className="mc-hero"><div className="mc-hero-glow"/><div className="mc-hero-inner"><span className="mc-eyebrow">A smarter way to see what’s possible</span><h1>Every opportunity<br/>starts with <em>clarity.</em></h1><p>Know how your experience matches the opportunity ahead. See what you have, what you need, and where to go next.</p><div className="mc-hero-actions"><button className="mc-primary" onClick={() => onOpenApp('credentials')}>Check your eligibility <ArrowRight size={18}/></button><a href="#experience">See how it works <ArrowUpRight size={16}/></a></div><div className="mc-hero-note"><ShieldCheck size={15}/> Clear evidence. Honest answers. Your next step.</div></div><div className="mc-product-stage"><div className="mc-stage-halo"/><ProductPreview/><div className="mc-stage-caption">A clearer view of what comes next.</div></div></section>

      <section id="experience" className="mc-statement"><span className="mc-section-label">INTRODUCING MATCHCRED</span><h2>Less guessing.<br/><span>More going for it.</span></h2><p>Opportunity requirements don't have to feel like a puzzle. MatchCred turns them into a simple, useful picture of where you stand.</p></section>

      <section id="how" className="mc-section mc-how"><div className="mc-section-intro"><span className="mc-section-label">MADE FOR YOUR NEXT MOVE</span><h2>Three steps.<br/>A much clearer path.</h2><p>From your experience to an actionable plan, all in one place.</p></div><div className="mc-step-grid">{steps.map(({icon:Icon,label,title,body})=><article className="mc-step" key={label}><div className="mc-step-icon"><Icon size={25}/></div><span>{label} / 03</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

      <section className="mc-feature"><div className="mc-feature-copy"><span className="mc-section-label">ANSWERS WITH CONTEXT</span><h2>Not just a score.<br/><span>The whole story.</span></h2><p>Understand why each requirement is met, unclear, or still out of reach. See the evidence behind the result and build a plan around the gaps.</p><button className="mc-inline-link" onClick={() => onOpenApp('credentials')}>Explore MatchCred <ArrowRight size={17}/></button></div><div className="mc-feature-art"><div className="mc-art-orb"/><div className="mc-insight-card"><span className="mc-insight-eyebrow">YOUR NEXT STEP</span><div className="mc-insight-icon"><Sparkles size={22}/></div><h3>A plan you can act on.</h3><p>Your education matches. Add details about your professional certification to strengthen this application.</p><div><span className="mc-insight-pill">1 item to clarify</span><span className="mc-insight-line"/></div></div></div></section>

      <section id="genlayer" className="mc-network"><div className="mc-network-symbol"><LockKeyhole size={25}/></div><div><span className="mc-section-label">POWERED BY GENLAYER</span><h2>Decisions with a trail.</h2><p>Choose a public GenLayer consensus review for manually entered credentials, or keep your CV in a local preview. Consensus evaluates the evidence you provide; it does not authenticate a credential with its issuer.</p><a href={CONTRACT_READY ? `https://explorer-studio.genlayer.com/address/${CONTRACT_ADDRESS}` : "https://genlayer.com"} target="_blank" rel="noreferrer" className="mc-network-link">{CONTRACT_READY ? 'View the Studionet contract' : 'Explore GenLayer'} <ArrowUpRight size={15}/></a></div></section>

      <section className="mc-close"><span className="mc-section-label">READY WHEN YOU ARE</span><h2>See where you stand.<br/><em>Then go further.</em></h2><button className="mc-primary" onClick={() => onOpenApp('credentials')}>Get started <ArrowRight size={18}/></button></section>
    </main><footer className="mc-footer"><Logo size={28} variant="light"/><span>© {new Date().getFullYear()} MatchCred. Built for what's next.</span><a href="#top">Back to top ↑</a></footer>
  </div>;
}
