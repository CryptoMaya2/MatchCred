import React from 'react';
import Logo from './Logo';
import TrustVerificationFlow from './TrustVerificationFlow';

export default function HomeScreen({ onStart, onLoadSample }) {
  return (
    <div className="home-hero">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <Logo size={48} showWordmark={true} />
      </div>

      <div className="home-badge">
        <span style={{ fontSize: '0.9rem' }}>🛡️</span>
        Instant Credential Verification &amp; Application Prep
      </div>

      <h1 className="home-title">
        Verify Your Eligibility <br/>
        <span className="highlight">Before You Apply.</span>
      </h1>

      <p className="home-one-liner" style={{ maxWidth: '640px', margin: '0 auto 2rem auto', fontSize: '1.15rem' }}>
        MatchCred helps people check whether their credentials meet the requirements of jobs, scholarships, fellowships, school applications, and other opportunities.
      </p>

      <div className="home-cta-box">
        <button 
          type="button" 
          className="btn btn-primary btn-lg"
          onClick={onStart}
        >
          Check My Eligibility →
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onLoadSample('scholarship')}
        >
          Or explore with an Example Scenario
        </button>
      </div>

      {/* Visual illustration of the user's example */}
      <div className="home-example-card">
        <div className="example-header">
          <span className="example-badge">Evaluation &amp; Evidence Model</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>GenLayer Studionet (Chain ID 61999)</span>
        </div>

        <div className="example-grid">
          <div className="example-col">
            <h4>Candidate Credentials</h4>
            <ul className="example-list">
              <li>🎓 B.Sc. Computer Science (University of Lagos, Verified)</li>
              <li>📋 Full-Stack Web Development Certification (Verified)</li>
              <li>⭐ AWS Certified Cloud Practitioner (Potential Differentiator)</li>
            </ul>
          </div>

          <div className="example-col">
            <h4>Opportunity Requirements</h4>
            <ul className="example-list">
              <li style={{ borderColor: '#a7f3d0', background: '#ecfdf5', color: '#065f46' }}>
                <span style={{ fontWeight: 700 }}>🟢</span> Bachelor's degree in Computer Science — <strong>MET</strong>
              </li>
              <li style={{ borderColor: '#a7f3d0', background: '#ecfdf5', color: '#065f46' }}>
                <span style={{ fontWeight: 700 }}>🟢</span> Proficiency in modern JavaScript &amp; React — <strong>MET</strong>
              </li>
              <li style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b' }}>
                <span style={{ fontWeight: 700 }}>🔴</span> 2+ years web application development experience — <strong>NOT MET</strong>
              </li>
              <li style={{ borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }}>
                <span style={{ fontWeight: 700 }}>🟡</span> Cloud deployment experience (Desirable) — <strong>UNCLEAR</strong>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              Result: <span style={{ color: '#2563eb' }}>2 of 3 core requirements met</span>
            </span>
            <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
              + AWS Cloud Practitioner flagged as application differentiator
            </span>
          </div>

          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onLoadSample('tech')}
          >
            Load &amp; Run Example Flow
          </button>
        </div>
      </div>

      {/* 4-Step Verification Architecture */}
      <TrustVerificationFlow compact={false} />
    </div>
  );
}
