import React, { useState } from 'react';
import CvUploadDropzone from './CvUploadDropzone';
import CvReviewCard from './CvReviewCard';

export default function CredentialsScreen({
  credentials,
  activePreset,
  onAddCredential,
  onRemoveCredential,
  onLoadPreset,
  onClearPreset,
  onClearCredentials,
  onContinue,
  onBack,
  cvData,
  onChangeCvData,
  inputMode = 'credentials',
  setInputMode
}) {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState('Candidate submitted');
  const [documentRef, setDocumentRef] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a credential name (e.g. B.Sc. Computer Science).');
      return;
    }
    setError('');

    onAddCredential({
      id: 'cred-' + Date.now(),
      name: name.trim(),
      issuer: issuer.trim() || 'Unspecified Institution',
      year: year.trim() || 'N/A',
      status: status || 'Candidate submitted',
      documentRef: documentRef.trim() || ''
    });

    // Reset form
    setName('');
    setIssuer('');
    setYear(new Date().getFullYear().toString());
    setDocumentRef('');
    setStatus('Candidate submitted');
  };

  const getStatusBadgeClass = (s) => {
    if (s === 'Institution verified') return 'status-verified';
    if (s === 'Candidate submitted') return 'status-self';
    return 'status-unverified';
  };

  const showCvSection = inputMode === 'cv' || inputMode === 'both';
  const showCredentialsSection = inputMode === 'credentials' || inputMode === 'both';

  return (
    <div>
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2 className="screen-title" style={{ margin: 0 }}>
            {inputMode === 'cv' ? 'Upload & Review CV' : inputMode === 'both' ? 'Credentials & CV Profile' : activePreset ? 'Example Credentials' : 'My Credentials'}
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
          Choose how you want to provide your information: add formal credentials, upload your CV to extract practical experience, or combine both.
        </p>
      </div>

      {/* 3-WAY STARTING FLOW SELECTOR (Option 1: Add Credentials | Option 2: Upload CV | Option 3: Use Both) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.75rem'
      }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setInputMode && setInputMode('credentials')}
          style={{
            padding: '1rem',
            cursor: 'pointer',
            textAlign: 'left',
            border: inputMode === 'credentials' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: inputMode === 'credentials' ? '#eff6ff' : '#ffffff',
            borderRadius: '12px',
            boxShadow: inputMode === 'credentials' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>📋</div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: inputMode === 'credentials' ? '#1d4ed8' : '#0f172a' }}>
            Option 1: Add Credentials
          </strong>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Add education degrees, licenses, and verified certifications
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setInputMode && setInputMode('cv')}
          style={{
            padding: '1rem',
            cursor: 'pointer',
            textAlign: 'left',
            border: inputMode === 'cv' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: inputMode === 'cv' ? '#eff6ff' : '#ffffff',
            borderRadius: '12px',
            boxShadow: inputMode === 'cv' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>📄</div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: inputMode === 'cv' ? '#1d4ed8' : '#0f172a' }}>
            Option 2: Upload CV
          </strong>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Upload PDF/DOCX to extract skills, experience &amp; achievements
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setInputMode && setInputMode('both')}
          style={{
            padding: '1rem',
            cursor: 'pointer',
            textAlign: 'left',
            border: inputMode === 'both' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: inputMode === 'both' ? '#eff6ff' : '#ffffff',
            borderRadius: '12px',
            boxShadow: inputMode === 'both' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>⚡</div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: inputMode === 'both' ? '#1d4ed8' : '#0f172a' }}>
            Option 3: Use Both
          </strong>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Combine your CV with formal credentials for full evidence
          </span>
        </div>
      </div>

      {/* CV SECTION (Active in Option 2 and Option 3) */}
      {showCvSection && (
        <div style={{ marginBottom: showCredentialsSection ? '2rem' : '0' }}>
          {!cvData ? (
            <CvUploadDropzone onCvExtracted={onChangeCvData} />
          ) : (
            <CvReviewCard
              cvData={cvData}
              onChangeCvData={onChangeCvData}
              onClearCv={() => onChangeCvData(null)}
              onUploadAnother={() => onChangeCvData(null)}
            />
          )}
        </div>
      )}

      {/* CREDENTIALS SECTION (Active in Option 1 and Option 3) */}
      {showCredentialsSection && (
        <>

      {/* Example Scenarios (Try an Example) Actions Bar */}
      <div style={{
        background: activePreset ? 'rgba(77, 163, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
        border: activePreset ? '1px solid rgba(77, 163, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.85rem 1.15rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activePreset ? '#4DA3FF' : '#94a3b8' }}>
              {activePreset ? '💡 Example Scenario Active' : 'Try an Example:'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {activePreset
                ? `Populated with demo information for "${activePreset.name}".`
                : 'Use an example scenario to explore MatchCred across industries (optional):'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {activePreset && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClearPreset}
                style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
              >
                ✕ Exit Example &amp; Use My Own Data
              </button>
            )}
            {credentials.length > 0 && !activePreset && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClearCredentials}
                style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn btn-sm ${activePreset?.key === 'scholarship' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLoadPreset('scholarship')}
          >
            🎓 Scholarship
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activePreset?.key === 'tech' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLoadPreset('tech')}
          >
            💻 Tech Job
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activePreset?.key === 'fellowship' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLoadPreset('fellowship')}
          >
            🎨 Design Fellowship
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activePreset?.key === 'business' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLoadPreset('business')}
          >
            📊 Business Analyst
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activePreset?.key === 'publicHealth' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLoadPreset('publicHealth')}
          >
            🌱 Public Health
          </button>
        </div>
      </div>

      {/* Add Credential Form */}
      <div className="add-cred-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>
            + Add a Credential
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Candidate submissions remain distinct until verified
          </span>
        </div>

        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label" htmlFor="cred-name">
                Credential Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="cred-name"
                type="text"
                className="form-input"
                placeholder="e.g. B.Sc. Computer Science, Google UX Certificate, PMP"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label" htmlFor="cred-issuer">
                Issuing Institution
              </label>
              <input
                id="cred-issuer"
                type="text"
                className="form-input"
                placeholder="e.g. University of Lagos, Project Management Institute, Google"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="cred-year">
                Date / Year
              </label>
              <input
                id="cred-year"
                type="text"
                className="form-input"
                placeholder="e.g. 2021"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" htmlFor="cred-status">
                Verification Status
              </label>
              <select
                id="cred-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Candidate submitted">Candidate submitted</option>
                <option value="Institution verified">Institution verified</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" htmlFor="cred-doc">
              Optional Document / Reference
            </label>
            <input
              id="cred-doc"
              type="text"
              className="form-input"
              placeholder="e.g. Certificate #AWS-88219, Degree #UL-CS-2025, or verification URL"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              + Add Credential
            </button>
          </div>
        </form>
      </div>

      {/* List of Current Credentials */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a' }}>
            {activePreset ? 'Example Credentials' : 'Current Credentials'} ({credentials.length})
          </h3>
          {activePreset && (
            <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
              Sample Data
            </span>
          )}
        </div>

        {credentials.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📁</div>
            <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              No credentials added yet
            </p>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
              Add your credentials above or select an example scenario to test the matching engine.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onLoadPreset('scholarship')}
            >
              Try an Example (Scholarship)
            </button>
          </div>
        ) : (
          <div className="credentials-list">
            {credentials.map((cred) => (
              <div key={cred.id} className="credential-item">
                <div className="cred-info">
                  <div className="cred-name">{cred.name}</div>
                  <div className="cred-meta">
                    <span>🏛️ {cred.issuer}</span>
                    <span>•</span>
                    <span>📅 {cred.year}</span>
                    {cred.documentRef && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#2563eb' }}>📄 {cred.documentRef}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className={`status-badge ${getStatusBadgeClass(cred.status)}`}>
                      {cred.status === 'Institution verified' ? '✓ Institution verified' : cred.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onRemoveCredential(cred.id)}
                  title="Remove credential"
                  style={{ color: '#94a3b8' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          ← Back to Overview
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onContinue}
          disabled={credentials.length === 0 && !cvData}
        >
          Next: Opportunity Requirements →
        </button>
      </div>
    </div>
  );
}
