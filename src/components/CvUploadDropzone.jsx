import React, { useState, useRef } from 'react';
import { parseCvFile, extractStructuredCvData, SAMPLE_CVS } from '../services/cvExtractor';

/**
 * CV Upload Dropzone Component
 * 
 * Supports:
 * - PDF and DOCX file upload & parsing
 * - Drag and drop
 * - Direct CV text pasting
 * - Instant testing with realistic diverse sample CVs
 */
export default function CvUploadDropzone({ onCvExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPasteMode, setShowPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    setIsExtracting(true);
    setErrorMessage(null);

    try {
      const extracted = await parseCvFile(file);
      setIsExtracting(false);
      onCvExtracted(extracted);
    } catch (err) {
      setIsExtracting(false);
      setErrorMessage(err.message || 'Error processing CV file. You can also paste your CV text directly.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleProcessPastedText = (e) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setErrorMessage('Please paste some CV text to extract.');
      return;
    }
    const extracted = extractStructuredCvData(pastedText.trim(), 'Pasted CV Text');
    onCvExtracted(extracted);
  };

  const handleLoadSampleCv = (sampleKey) => {
    const sample = SAMPLE_CVS[sampleKey];
    if (sample) {
      onCvExtracted({
        ...sample.data,
        extractedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <strong>Upload Notice:</strong> {errorMessage}
        </div>
      )}

      {!showPasteMode ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
            borderRadius: '14px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: isDragging ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            {isExtracting ? '⏳' : '📄'}
          </div>

          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.35rem', fontWeight: 700 }}>
            {isExtracting ? 'Analyzing and Extracting CV Details...' : 'Upload your CV / Resume'}
          </h3>

          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            Supported formats: <strong>PDF (.pdf)</strong> and <strong>Word (.docx)</strong>. MatchCred extracts your education, experience, and skills for review.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isExtracting}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {isExtracting ? 'Extracting...' : 'Browse Computer'}
          </button>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowPasteMode(true);
              }}
              style={{ fontSize: '0.8rem', color: '#2563eb' }}
            >
              📋 Or Paste CV Text Directly
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid #cbd5e1', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>
              Paste Your CV / Resume Text
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPasteMode(false)}
              style={{ fontSize: '0.8rem', color: '#64748b' }}
            >
              ← Back to File Upload
            </button>
          </div>

          <textarea
            className="form-textarea"
            rows={7}
            placeholder={`Paste your CV text here:
EDUCATION
B.Sc. Computer Science - University of Lagos (2025)

EXPERIENCE
Frontend Developer - 2 years
Built web applications with React and TypeScript

SKILLS
React, TypeScript, JavaScript, Git, Figma`}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleProcessPastedText}
            >
              Extract &amp; Review CV Data →
            </button>
          </div>
        </div>
      )}

      {/* Quick Test Samples */}
      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 600, color: '#64748b' }}>Try an Example CV:</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
          onClick={() => handleLoadSampleCv('tech')}
        >
          💻 Frontend Developer CV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
          onClick={() => handleLoadSampleCv('design')}
        >
          🎨 Product Designer CV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
          onClick={() => handleLoadSampleCv('scholarship')}
        >
          🎓 Global Leadership CV
        </button>
      </div>
    </div>
  );
}
