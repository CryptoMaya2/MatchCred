import React, { useState, useMemo } from 'react';
import { CONTRACT_READY } from '../services/genlayerService';
import { parseRequirementsText } from '../services/requirementMatcher';
import { extractOpportunityFromUrl } from '../services/opportunityExtractor';

export default function RequirementsScreen({
  requirementsText,
  setRequirementsText,
  opportunityTitle,
  setOpportunityTitle,
  activePreset,
  onLoadPresetRequirements,
  onClearPreset,
  onEvaluate,
  isEvaluating,
  evaluationError,
  onBack
}) {
  // Input Method: 'paste' (Option A) or 'link' (Option B)
  const [inputMode, setInputMode] = useState('paste');

  // Option B Link State
  const [linkUrl, setLinkUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [extractSuccess, setExtractSuccess] = useState(null);

  const parsedRequirements = useMemo(() => {
    return parseRequirementsText(requirementsText);
  }, [requirementsText]);

  const handleExtractLink = async (urlToUse) => {
    const targetUrl = urlToUse || linkUrl;
    if (!targetUrl.trim()) {
      setExtractError('Please enter an opportunity URL.');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    const result = await extractOpportunityFromUrl(targetUrl);
    setIsExtracting(false);

    if (result.success) {
      if (result.title) setOpportunityTitle(result.title);
      if (result.requirementsText) setRequirementsText(result.requirementsText);
      setExtractSuccess({
        isSample: !!result.isSampleData,
        title: result.title,
        org: result.organization || 'Opportunity Host',
        count: result.rawExtractedCount || 0
      });
    } else {
      setExtractError(result.error || 'Failed to extract opportunity details from link.');
    }
  };

  const handleUseDemoLink = (url) => {
    setLinkUrl(url);
    handleExtractLink(url);
  };

  return (
    <div>
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2 className="screen-title" style={{ margin: 0 }}>
            {activePreset ? 'Example Opportunity' : 'Opportunity Requirements'}
          </h2>
          {activePreset && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(77, 163, 255, 0.15)',
              border: '1px solid rgba(77, 163, 255, 0.4)',
              color: '#4DA3FF',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px'
            }}>
              Example Data ({activePreset.name})
            </span>
          )}
        </div>
        <p className="screen-subtitle">
          {activePreset
            ? `Evaluating requirements for the "${activePreset.name}" scenario. You can adjust the requirements or clear to test your own opportunity.`
            : 'Verify your credentials against a job, scholarship, fellowship, or academic application.'}
        </p>
      </div>

      {/* Input Mode Tabs: Option A vs Option B */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${inputMode === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setInputMode('paste')}
          style={{ borderRadius: '8px' }}
        >
          📄 Option A: Paste Requirements / Job Description
        </button>

        <button
          type="button"
          className={`btn btn-sm ${inputMode === 'link' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setInputMode('link')}
          style={{ borderRadius: '8px' }}
        >
          🔗 Option B: Paste Opportunity Link
        </button>
      </div>

      {/* OPTION B: PASTE LINK */}
      {inputMode === 'link' && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid #bfdbfe', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', marginBottom: '0.4rem' }}>
            Option B: Extract Directly from Opportunity Link
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
            Enter a public job or scholarship posting URL. MatchCred will attempt to extract the title, organization, and requirements.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="url"
              className="form-input"
              style={{ flex: 1, minWidth: '280px' }}
              placeholder="e.g. https://foundation.org/scholarships/global-leadership-2025"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleExtractLink()}
              disabled={isExtracting}
            >
              {isExtracting ? 'Analyzing Link...' : 'Extract Requirements →'}
            </button>
          </div>

          {/* Quick Demo Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>Try Public Examples (Curated Sample Data):</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', textDecoration: 'underline', color: '#2563eb' }}
              onClick={() => handleUseDemoLink('https://foundation.org/scholarships/global-leadership-2025')}
            >
              [Sample] Postgraduate Scholarship
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', textDecoration: 'underline', color: '#2563eb' }}
              onClick={() => handleUseDemoLink('https://careers.example.tech/jobs/frontend-engineer-react')}
            >
              [Sample] Frontend Software Engineer
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', textDecoration: 'underline', color: '#2563eb' }}
              onClick={() => handleUseDemoLink('https://fellowships.example.org/design-innovation-2025')}
            >
              [Sample] Product Design Fellowship
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', textDecoration: 'underline', color: '#64748b' }}
              onClick={() => handleUseDemoLink('https://restricted-internal-portal.example.com/login-required')}
            >
              [Test] Simulate Blocked URL
            </button>
          </div>

          {/* Extraction Feedback */}
          {extractSuccess && (
            <div style={{
              padding: '0.75rem 1rem',
              background: extractSuccess.isSample ? '#eff6ff' : '#ecfdf5',
              border: `1px solid ${extractSuccess.isSample ? '#bfdbfe' : '#a7f3d0'}`,
              borderRadius: '8px',
              color: extractSuccess.isSample ? '#1e40af' : '#065f46',
              fontSize: '0.875rem',
              marginTop: '0.5rem'
            }}>
              {extractSuccess.isSample ? (
                <>
                  📋 <strong>Curated Sample Data Loaded:</strong> Loaded {extractSuccess.count} requirements for "{extractSuccess.title}" ({extractSuccess.org}). <em>Note: This is curated benchmark sample data for demonstration, not a live network fetch.</em>
                </>
              ) : (
                <>
                  ✓ <strong>Live Requirements Extracted!</strong> Extracted {extractSuccess.count} requirements for "{extractSuccess.title}" ({extractSuccess.org}). Review or modify details below.
                </>
              )}
            </div>
          )}

          {extractError && (
            <div style={{ padding: '0.85rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>⚠️ Link Extraction Notice</div>
              {extractError}
              <div style={{ marginTop: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setInputMode('paste')}
                >
                  Switch to Option A &amp; Paste Manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Opportunity Card (Applies to both extracted link data and manual paste) */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>
            Opportunity Details &amp; Stated Requirements
          </h3>

          {inputMode === 'paste' && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Try an Example:</span>
              <button
                type="button"
                className={`btn btn-sm ${activePreset?.key === 'scholarship' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onLoadPresetRequirements('scholarship')}
              >
                🎓 Scholarship
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activePreset?.key === 'tech' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onLoadPresetRequirements('tech')}
              >
                💻 Tech Job
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activePreset?.key === 'fellowship' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onLoadPresetRequirements('fellowship')}
              >
                🎨 Design
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activePreset?.key === 'business' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onLoadPresetRequirements('business')}
              >
                📊 Business
              </button>
              {activePreset && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={onClearPreset}
                  style={{ color: '#ef4444', fontSize: '0.75rem' }}
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="opportunity-title">
            Opportunity / Position Title
          </label>
          <input
            id="opportunity-title"
            type="text"
            className="form-input"
            placeholder="e.g. Product Design Fellowship, Frontend Developer, Global Leadership Scholarship, Business Analyst"
            value={opportunityTitle}
            onChange={(e) => setOpportunityTitle(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" htmlFor="requirements-box" style={{ margin: 0 }}>
              Requirements / Eligibility Criteria <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {parsedRequirements.length} requirement{parsedRequirements.length === 1 ? '' : 's'} identified
            </span>
          </div>

          <textarea
            id="requirements-box"
            className="form-textarea"
            placeholder={`Paste bullet points, qualifications, or requirements. You can also specify desirable criteria:
* Bachelor's degree or equivalent qualification
* Relevant professional experience or portfolio
* Documented project track record
* Relevant certification
* Desirable: Cross-functional collaboration`}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
          />
        </div>

        {/* Live Parsed Preview */}
        {parsedRequirements.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
              Identified Requirements Checklist:
            </span>
            <ul style={{ listStyle: 'none', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {parsedRequirements.map((req, idx) => {
                const isPreferred = /\b(preferred|desirable|advantage|nice to have)\b/i.test(req);
                return (
                  <li key={idx} style={{ fontSize: '0.9rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isPreferred ? '#d97706' : '#2563eb', fontWeight: 700 }}>
                      {isPreferred ? '○' : '•'}
                    </span>
                    <span>{req}</span>
                    {isPreferred && (
                      <span style={{ fontSize: '0.7rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                        Preferred
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          ← Back to Credentials
        </button>

        {evaluationError && <p role="alert" style={{ color: '#f87171', marginBottom: '1rem' }}>{evaluationError}</p>}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onEvaluate}
          disabled={parsedRequirements.length === 0 || isEvaluating}
        >
          {isEvaluating ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              {CONTRACT_READY ? 'Waiting for GenLayer consensus...' : 'Building local preview...'}
            </>
          ) : (
            CONTRACT_READY ? 'Submit public GenLayer review →' : 'Generate local eligibility preview →'
          )}
        </button>
      </div>
    </div>
  );
}
