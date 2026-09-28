import React, { useState } from 'react';
import { GENLAYER_NETWORKS, testGenLayerConnection } from '../services/genlayerService';
import TrustVerificationFlow from './TrustVerificationFlow';

export default function ResultsScreen({
  report,
  opportunityTitle,
  onHelpMePrepare,
  onEditRequirements,
  onEditCredentials,
  onReset
}) {
  const [showGenLayerInfo, setShowGenLayerInfo] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('studionet');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  if (!report || !report.items) {
    return (
      <div className="card empty-state">
        <p>No evaluation report available yet.</p>
        <button type="button" className="btn btn-primary" onClick={onEditRequirements}>
          Go to Requirements
        </button>
      </div>
    );
  }

  const {
    totalRequirements,
    matchedCount,
    unmetCount,
    unclearCount,
    requiredCount,
    preferredCount,
    items,
    potentialDifferentiators = [],
    recommendedOpportunities = []
  } = report;

  const matchPercentage = totalRequirements > 0 ? Math.round((matchedCount / totalRequirements) * 100) : 0;
  const gapCount = unmetCount + unclearCount;

  const handleTestConnection = async () => {
    setIsCheckingConnection(true);
    setConnectionStatus(null);
    const res = await testGenLayerConnection(selectedNetwork);
    setConnectionStatus(res);
    setIsCheckingConnection(false);
  };

  return (
    <div>
      <div className="screen-header">
        <h2 className="screen-title">Eligibility Evaluation Report</h2>
        <p className="screen-subtitle">
          {opportunityTitle ? (
            <span>Eligibility assessment for <strong>{opportunityTitle}</strong></span>
          ) : (
            'Eligibility assessment results based on candidate-submitted information.'
          )}
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="results-summary-card">
        <div>
          <div className="summary-score-large">
            <span className="fraction">{matchedCount}</span> of {totalRequirements} requirements met
          </div>
          <div className="summary-meta">
            {matchedCount === totalRequirements ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>🎉 Full Eligibility: You satisfy 100% of the opportunity's criteria.</span>
            ) : matchedCount > 0 ? (
              <span>You meet {matchedCount} requirement{matchedCount === 1 ? '' : 's'} ({requiredCount} required, {preferredCount} preferred), with {unmetCount} unmet {unclearCount > 0 ? `and ${unclearCount} unclear` : ''}.</span>
            ) : (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>No stated requirements are satisfied by current credentials.</span>
            )}
          </div>

          {/* Status Breakdown Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span className="badge-match">
              🟢 {matchedCount} MET
            </span>
            <span className="badge-unmet">
              🔴 {unmetCount} NOT MET
            </span>
            {unclearCount > 0 && (
              <span className="badge-unclear">
                🟡 {unclearCount} UNCLEAR
              </span>
            )}
          </div>

          <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: report.genLayerVerified ? '#08734e' : '#965b09' }}>
            {report.genLayerVerified ? '⛓️ Consensus reviewed on GenLayer Studionet' : '◌ Local eligibility preview · No onchain review'}
            {report.transactionHash && <div style={{ marginTop: '0.4rem' }}>Transaction: <code style={{ overflowWrap: 'anywhere' }}>{report.transactionHash}</code></div>}
            {report.contractAddress && <div>Contract: <code>{report.contractAddress}</code></div>}
            <div style={{ marginTop: '0.4rem', opacity: 0.8 }}>Self-reported credentials are not authenticated by an issuer.</div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            <span>Requirements supported</span>
            <span>{matchPercentage}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${matchPercentage}%`,
                background: matchPercentage === 100 ? '#059669' : matchPercentage >= 50 ? '#2563eb' : '#f59e0b'
              }}
            />
          </div>
        </div>
      </div>

      {/* "Help Me Prepare" Callout when gaps exist */}
      {gapCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)'
        }}>
          <div style={{ maxWidth: '580px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(255, 255, 255, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
              Candidate Action Plan
            </span>
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: '0.4rem 0 0.3rem 0', fontWeight: 800 }}>
              Don't stop at "Not Met" — Prepare Your Application
            </h3>
            <p style={{ fontSize: '0.925rem', color: '#dbeafe', margin: 0, lineHeight: 1.5 }}>
              MatchCred helps you clarify unrecorded practical experience, identify necessary credentials, and compile an application-ready CV.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-lg"
            style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
            onClick={onHelpMePrepare}
          >
            Help Me Prepare →
          </button>
        </div>
      )}

      {/* Requirement-by-Requirement Breakdown with Complete Evidence */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
          Requirement-by-Requirement Evidence &amp; Evaluation
        </h3>

        <div className="results-list">
          {items.map((item, idx) => {
            const isMet = item.status === 'MET';
            const isUnmet = item.status === 'NOT MET';
            const isUnclear = item.status === 'UNCLEAR';
            const isPreferred = item.reqType === 'Preferred';

            return (
              <div
                key={idx}
                className={`result-card-item ${
                  isMet
                    ? 'status-match-border'
                    : isUnmet
                    ? 'status-unmet-border'
                    : 'status-unclear-border'
                }`}
              >
                <div className="result-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className="result-req-text">{item.requirement}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: isPreferred ? '#fef3c7' : '#f1f5f9',
                      color: isPreferred ? '#92400e' : '#475569',
                      border: `1px solid ${isPreferred ? '#fde68a' : '#cbd5e1'}`
                    }}>
                      {item.reqType}
                    </span>
                  </div>

                  <div>
                    {isMet && (
                      <span className="badge-match">
                        🟢 MET
                      </span>
                    )}
                    {isUnmet && (
                      <span className="badge-unmet">
                        🔴 NOT MET
                      </span>
                    )}
                    {isUnclear && (
                      <span className="badge-unclear">
                        🟡 UNCLEAR
                      </span>
                    )}
                  </div>
                </div>

                {/* Explicit Evidence Line distinguishing Verified Credential vs Candidate CV */}
                <div style={{
                  marginTop: '0.6rem',
                  marginBottom: '0.75rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  background: isMet 
                    ? (item.evidenceType === 'verified' ? '#f0fdf4' : '#eff6ff') 
                    : isUnclear ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${
                    isMet 
                      ? (item.evidenceType === 'verified' ? '#bbf7d0' : '#bfdbfe') 
                      : isUnclear ? '#fde68a' : '#fecaca'
                  }`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: isMet ? (item.evidenceType === 'verified' ? '#166534' : '#1e40af') : isUnclear ? '#92400e' : '#991b1b' }}>
                      Evidence:
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      {item.evidenceSource || item.evidenceLabel || (isMet ? 'Documented in profile' : 'No supporting credential or CV record found')}
                    </span>
                    {item.evidence?.credentialName && (
                      <span style={{ color: '#475569', fontSize: '0.8rem' }}>
                        — {item.evidence.credentialName}
                      </span>
                    )}
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: item.evidenceType === 'verified' ? '#dcfce7' : item.evidenceType === 'cv' ? '#dbeafe' : item.evidenceType === 'cv-gap' ? '#fef3c7' : '#f1f5f9',
                    color: item.evidenceType === 'verified' ? '#15803d' : item.evidenceType === 'cv' ? '#1d4ed8' : item.evidenceType === 'cv-gap' ? '#b45309' : '#64748b'
                  }}>
                    {item.evidenceType === 'verified'
                      ? 'Candidate-submitted credential'
                      : item.evidenceType === 'cv'
                      ? '📄 Candidate CV'
                      : item.evidenceType === 'cv-gap'
                      ? '⚠️ Experience Gap'
                      : 'Unverified'}
                  </span>
                </div>

                {/* Evidence Details for Verified Credential */}
                {isMet && item.evidence && item.evidenceType === 'verified' && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🛡️ Verifiable Evidence:</span>
                      <span style={{ fontWeight: 600 }}>{item.evidence.credentialName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', color: '#15803d', fontSize: '0.8rem' }}>
                      <span><strong>Issuer:</strong> {item.evidence.issuer}</span>
                      <span>•</span>
                      <span><strong>Status:</strong> {item.evidence.status}</span>
                      <span>•</span>
                      <span><strong>Year:</strong> {item.evidence.year}</span>
                      {item.evidence.documentRef && (
                        <>
                          <span>•</span>
                          <span><strong>Ref:</strong> {item.evidence.documentRef}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Evidence Details for Candidate CV */}
                {isMet && item.evidence && item.evidenceType === 'cv' && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                    color: '#334155'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e40af', fontWeight: 600 }}>
                      <span>📄 Reported in Candidate CV:</span>
                      <span>{item.evidence.credentialName}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      Candidate-provided evidence from {item.evidence.documentRef || 'uploaded CV'}. Not independently verified.
                    </span>
                  </div>
                )}

                {/* Gap details banner if experience shortfall */}
                {item.gap && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                    color: '#92400e'
                  }}>
                    <strong>Experience Shortfall:</strong> Opportunity requires <strong>{item.gap.requiredYears} years</strong>, but your CV documents <strong>{item.gap.candidateYears} year{item.gap.candidateYears === 1 ? '' : 's'}</strong> ({item.gap.missingYears} year gap).
                  </div>
                )}

                {/* Explanation & Actionable Guidance for NOT MET / UNCLEAR */}
                <div className="result-explanation">
                  <strong>Assessment Note:</strong> {item.explanation}
                  {item.howToAddress && (
                    <div style={{ marginTop: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                      👉 <strong>Actionable Step:</strong> {item.howToAddress}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: POTENTIAL APPLICATION STRENGTHS ("What could make your application stand out?") */}
      {potentialDifferentiators.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', border: '1px solid #c7d2fe', background: '#f5f3ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⭐</span>
            <h3 style={{ fontSize: '1.2rem', color: '#3730a3' }}>
              What Could Make Your Application Stand Out?
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#4338ca', marginBottom: '1.25rem' }}>
            MatchCred identified credentials and qualifications you already possess that were <strong>not explicitly required</strong>, but are highly relevant and can serve as competitive differentiators in your application.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {potentialDifferentiators.map((diff, dIdx) => (
              <div
                key={dIdx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' }}>
                    {diff.credentialName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.2rem 0 0.4rem 0' }}>
                    Issued by: {diff.issuer} ({diff.year}) • {diff.status}
                    {diff.documentRef && ` • Ref: ${diff.documentRef}`}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#4c1d95', margin: 0, fontStyle: 'italic' }}>
                    "{diff.differentiatorNote}"
                  </p>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  background: '#ede9fe',
                  color: '#5b21b6',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  border: '1px solid #c4b5fd'
                }}>
                  Potential Differentiator
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: RECOMMEND OTHER OPPORTUNITIES */}
      {recommendedOpportunities.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', border: '1px solid #cbd5e1', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Secondary Alignment
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: '0.2rem' }}>
                Explore Other Opportunities
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
              Non-recruitment advisor
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
            You may not meet all current requirements of this specific opportunity. Based on your existing verified qualifications, here are other available opportunity profiles that appear more aligned:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recommendedOpportunities.map((opp) => (
              <div
                key={opp.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{opp.title}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                    {opp.organization} ({opp.location})
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.35rem' }}>
                  💡 <strong>Why Suggested:</strong> {opp.whyRecommended}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Aligned with your:</span>
                  {opp.matchingQualifications.map((q, qIdx) => (
                    <span key={qIdx} style={{ fontSize: '0.72rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                      ✓ {q}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', fontStyle: 'italic' }}>
                  {opp.notes} (Opportunity guidance only — not a qualification guarantee)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Architecture Component */}
      <TrustVerificationFlow compact={false} />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onEditRequirements}
          >
            ← Revise Opportunity
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onEditCredentials}
          >
            Update My Credentials
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onHelpMePrepare}
          >
            Help Me Prepare →
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
          >
            Check Another Opportunity
          </button>
        </div>
      </div>

      {/* GenLayer Studionet Configuration & Verification Box */}
      <div className="genlayer-banner">
        <div className="genlayer-banner-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="genlayer-badge">GenLayer Studionet</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
              {report.genLayerVerified ? 'Consensus reviewed (Chain ID 61999)' : 'Local preview · Contract review pending'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowGenLayerInfo(!showGenLayerInfo)}
            style={{ fontSize: '0.8rem' }}
          >
            {showGenLayerInfo ? 'Hide Details ▲' : 'Inspect Studionet Contract ▼'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: '#475569' }}>Active Network:</span>
            <span style={{ fontWeight: 700, color: '#2563eb' }}>GenLayer Studionet (Chain ID 61999)</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            RPC: <code>{GENLAYER_NETWORKS.studionet.rpcUrl}</code>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleTestConnection}
            disabled={isCheckingConnection}
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
          >
            {isCheckingConnection ? 'Checking RPC...' : 'Test Connection'}
          </button>
        </div>

        {connectionStatus && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            background: connectionStatus.ok ? '#ecfdf5' : '#fffbeb',
            color: connectionStatus.ok ? '#065f46' : '#92400e',
            border: `1px solid ${connectionStatus.ok ? '#a7f3d0' : '#fde68a'}`
          }}>
            {connectionStatus.ok ? '✓ ' : 'ℹ️ '} {connectionStatus.message}
          </div>
        )}

        {showGenLayerInfo && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
              The application cleanly isolates <strong>Credential information</strong>, <strong>Opportunity requirements</strong>, and <strong>Requirement evaluation</strong>.
              When submitted onchain, an Intelligent Contract applies validator consensus to the evidence provided:
            </p>
            <p>Contract address: {report.contractAddress || 'Not deployed yet'}. An onchain decision requires a finalized transaction. Local previews are separate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
