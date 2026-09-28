import React from 'react';

/**
 * Visual explanation of the Trust & Verification Model:
 * Institution issues credential → Candidate controls/shares credential → MatchCred verifies status → GenLayer evaluates requirements
 */
export default function TrustVerificationFlow({ compact = false }) {
  const steps = [
    {
      num: '1',
      title: 'Institution Issues Credential',
      desc: 'Universities, licensure boards, and accrediting bodies issue degrees and licenses with verifiable records.'
    },
    {
      num: '2',
      title: 'Candidate Controls & Shares',
      desc: 'You hold and manage your own credential claims, privacy, and supporting reference IDs.'
    },
    {
      num: '3',
      title: 'MatchCred Verifies Status',
      desc: 'Credentials maintain strict audit trail: Candidate submitted or CV extracted; issuer verification is not yet available.'
    },
    {
      num: '4',
      title: 'GenLayer Evaluates Evidence',
      desc: 'Intelligent Contract on GenLayer Studionet evaluates requirements against candidate-submitted evidence.'
    }
  ];

  if (compact) {
    return (
      <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.5rem' }}>
          Verification Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#334155' }}>
          <span style={{ fontWeight: 600 }}>🏛️ Institution Issues</span>
          <span>→</span>
          <span style={{ fontWeight: 600 }}>👤 Candidate Controls</span>
          <span>→</span>
          <span style={{ fontWeight: 600 }}>🛡️ MatchCred Verifies</span>
          <span>→</span>
          <span style={{ fontWeight: 700, color: '#2563eb' }}>⛓️ GenLayer Evaluates</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
            Decentralized Credential Architecture
          </span>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginTop: '0.35rem' }}>
            How Verification &amp; Evaluation Works
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          GenLayer Studionet (Chain ID 61999)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {steps.map((s, idx) => (
          <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: idx === 3 ? '#2563eb' : '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                {s.num}
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{s.title}</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
