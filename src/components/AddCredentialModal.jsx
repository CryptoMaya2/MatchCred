import React, { useState } from 'react';

export default function AddCredentialModal({ isOpen, onClose, onAdd, defaultName = '' }) {
  const [name, setName] = useState(defaultName);
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState('Candidate submitted');
  const [documentRef, setDocumentRef] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a credential name.');
      return;
    }

    onAdd({
      id: 'cred-' + Date.now(),
      name: name.trim(),
      issuer: issuer.trim() || 'Unspecified Institution',
      year: year.trim() || 'N/A',
      status,
      documentRef: documentRef.trim() || ''
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Add Credential</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ fontSize: '1.2rem', padding: '0.2rem 0.5rem' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="modal-cred-name">
              Credential Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="modal-cred-name"
              type="text"
              className="form-input"
              placeholder="e.g. B.Sc. Computer Science, Google UX Certificate, PMP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label" htmlFor="modal-cred-issuer">
                Issuing Institution
              </label>
              <input
                id="modal-cred-issuer"
                type="text"
                className="form-input"
                placeholder="e.g. University of Lagos, Project Management Institute, Google"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="modal-cred-year">
                Date / Year
              </label>
              <input
                id="modal-cred-year"
                type="text"
                className="form-input"
                placeholder="e.g. 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modal-cred-status">
              Verification Status
            </label>
            <select
              id="modal-cred-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Candidate submitted">Candidate submitted (Default)</option>
              <option value="Institution verified">Institution verified</option>
              <option value="Unverified">Unverified</option>
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Note: Uploaded documents remain Candidate submitted until verified by the issuing institution.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="modal-cred-doc">
              Optional Document / Reference
            </label>
            <input
              id="modal-cred-doc"
              type="text"
              className="form-input"
              placeholder="e.g. Certificate ID #AWS-88219, Degree #UL-CS-2025, or verification link"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Credential
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
