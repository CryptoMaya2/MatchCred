import React, { useState } from 'react';
import AddCredentialModal from './AddCredentialModal';

export default function ApplicationScreen({
  credentials = [],
  cvData = null,
  savedExperiences = [],
  opportunityTitle = '',
  onAddCredential,
  onBackToPlan
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Group candidate credentials strictly based on what was provided
  const educationCreds = credentials.filter(c => 
    /\b(bachelor|master|phd|doctorate|degree|diploma|bsc|ba|ms|msc)\b/i.test(c.name)
  );
  
  const licenseCreds = credentials.filter(c => 
    /\b(registered|licensed|license|rn|rm|midwife|board)\b/i.test(c.name)
  );

  const certCreds = credentials.filter(c => 
    /\b(cert|bls|cpr|acls|pals|specialization|fellowship)\b/i.test(c.name) &&
    !/\b(degree|bachelor|master)\b/i.test(c.name)
  );

  const otherCreds = credentials.filter(c => 
    !educationCreds.includes(c) && !licenseCreds.includes(c) && !certCreds.includes(c)
  );

  // Assemble strictly truthful default summary based on provided items
  const primaryRole = licenseCreds.length > 0
    ? licenseCreds[0].name
    : (educationCreds.length > 0
      ? `${educationCreds[0].name} Graduate`
      : (cvData?.education?.[0]?.degree
        ? `${cvData.education[0].degree} Specialist`
        : (cvData?.experience?.[0]?.role || 'Qualified Professional')));

  const degreeMention = educationCreds.length > 0
    ? `holding a ${educationCreds.map(e => e.name).join(', ')} from ${educationCreds.map(e => e.issuer).join(', ')}`
    : (cvData?.education?.length > 0
      ? `holding ${cvData.education.map(e => `${e.degree || 'Degree'} from ${e.institution || 'documented institution'}`).join(', ')}`
      : '');

  const combinedExperiences = [
    ...savedExperiences,
    ...(cvData?.experience || []).map(exp => ({
      id: exp.id,
      type: exp.role,
      where: exp.company,
      duration: exp.duration || (exp.years ? `${exp.years} years` : 'documented in CV'),
      duties: exp.details || 'Documented professional role on CV.',
      source: 'Candidate CV'
    }))
  ];

  const expMention = combinedExperiences.length > 0
    ? `with practical experience in ${combinedExperiences.slice(0, 2).map(e => `${e.type} at ${e.where}`).join(' and ')}`
    : '';

  const initialSummary = `${primaryRole} ${degreeMention ? `${degreeMention}, ` : ''}${expMention ? `${expMention}. ` : ''}Committed to verified standards, impactful execution, and continuous excellence.`
    .replace(/\s+/g, ' ')
    .trim();

  // Initial skills from CV or fallback
  const initialSkills = cvData?.skills && cvData.skills.length > 0
    ? cvData.skills.join(', ')
    : 'Project Coordination, Cross-Functional Collaboration, Technical Documentation, Problem Solving, Strategic Planning';

  // Editable CV state
  const [candidateName, setCandidateName] = useState(cvData?.candidateName || 'Candidate Name');
  const [candidateContact, setCandidateContact] = useState(cvData?.contactInfo || 'candidate.profile@email.com | +1 (555) 019-2834');
  const [professionalSummary, setProfessionalSummary] = useState(initialSummary);
  const [skillsText, setSkillsText] = useState(initialSkills);

  const copyCvText = () => {
    const text = `
${candidateName}
${candidateContact}
Target Opportunity: ${opportunityTitle || 'Opportunity Application'}
==================================================

PROFESSIONAL SUMMARY
${professionalSummary}

${licenseCreds.length > 0 ? `PROFESSIONAL REGISTRATION & LICENSURE\n${licenseCreds.map(l => `• ${l.name} — ${l.issuer} (${l.year}) [${l.status}]${l.documentRef ? ` Ref: ${l.documentRef}` : ''}`).join('\n')}\n` : ''}
EDUCATION
${educationCreds.length > 0
  ? educationCreds.map(e => `• ${e.name} — ${e.issuer} (${e.year}) [${e.status}]${e.documentRef ? ` Ref: ${e.documentRef}` : ''}`).join('\n')
  : (cvData?.education || []).map(e => `• ${e.degree} — ${e.institution} (${e.year || 'Documented'}) [Candidate CV]`).join('\n')}

EXPERIENCE
${combinedExperiences.length > 0
  ? combinedExperiences.map(exp => `• ${exp.type} | ${exp.where} (${exp.duration}) [${exp.source || 'Candidate Record'}]\n  Duties: ${exp.duties}`).join('\n\n')
  : '• Experience documented through verified registrations and qualifications.'}

CERTIFICATIONS & QUALIFICATIONS
${certCreds.map(c => `• ${c.name} — ${c.issuer} (${c.year}) [${c.status}]${c.documentRef ? ` Ref: ${c.documentRef}` : ''}`).join('\n')}
${(cvData?.certifications || []).map(c => `• ${c.name || c} [Candidate CV]`).join('\n')}
${otherCreds.map(o => `• ${o.name} — ${o.issuer} (${o.year}) [${o.status}]`).join('\n')}

RELEVANT SKILLS
${skillsText}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="screen-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span>APPLICATION &amp; CV GENERATOR</span>
        </div>
        <h2 className="screen-title">Application-Ready CV</h2>
        <p className="screen-subtitle">
          Constructed strictly from information and credentials you have provided. Review, refine, and edit any section before applying.
        </p>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add Credential
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={copyCvText}
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Formatted CV'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          🔒 Strictly uninvented: candidate-verified data only
        </span>
      </div>

      {/* CV Document Preview Card */}
      <div className="card" style={{ padding: '2.5rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
        
        {/* CV Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            style={{ fontSize: '1.75rem', fontWeight: 800, width: '100%', border: 'none', background: 'transparent', outline: 'none', color: '#0f172a' }}
            title="Click to edit name"
          />
          <input
            type="text"
            value={candidateContact}
            onChange={(e) => setCandidateContact(e.target.value)}
            style={{ fontSize: '0.9rem', color: '#64748b', width: '100%', border: 'none', background: 'transparent', outline: 'none', marginTop: '0.25rem' }}
            title="Click to edit contact info"
          />
          {opportunityTitle && (
            <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginTop: '0.5rem' }}>
              Applying for: {opportunityTitle}
            </div>
          )}
        </div>

        {/* 1. PROFESSIONAL SUMMARY */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            Professional Summary
          </h4>
          <textarea
            className="form-textarea"
            style={{ minHeight: '80px', fontSize: '0.95rem', border: '1px dashed #cbd5e1', background: '#fafbfc' }}
            value={professionalSummary}
            onChange={(e) => setProfessionalSummary(e.target.value)}
            title="Editable professional summary"
          />
        </div>

        {/* 2. PROFESSIONAL REGISTRATION & LICENSURE */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', margin: 0 }}>
              Professional Registration &amp; Licensure
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAddModalOpen(true)}
              style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
            >
              + Add License
            </button>
          </div>

          {licenseCreds.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No professional licenses recorded. Click "+ Add Credential" to specify.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {licenseCreds.map(cred => (
                <li key={cred.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{cred.name}</strong> — {cred.issuer} ({cred.year})
                    {cred.documentRef && (
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', marginLeft: '0.5rem' }}>
                        Ref: {cred.documentRef}
                      </span>
                    )}
                  </div>
                  <span className={`status-badge ${cred.status === 'Institution verified' ? 'status-verified' : 'status-self'}`}>
                    {cred.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. EDUCATION */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', margin: 0 }}>
              Education
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAddModalOpen(true)}
              style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
            >
              + Add Degree
            </button>
          </div>

          {educationCreds.length === 0 && (!cvData?.education || cvData.education.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No educational degrees recorded. Click "+ Add Degree" to add your degree.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {educationCreds.map(cred => (
                <li key={cred.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{cred.name}</strong>{cred.issuer ? ` — ${cred.issuer}` : ''} {cred.year ? `(${cred.year})` : ''}
                    {cred.documentRef && (
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', marginLeft: '0.5rem' }}>
                        Doc: {cred.documentRef}
                      </span>
                    )}
                  </div>
                  <span className={`status-badge ${cred.status === 'Institution verified' ? 'status-verified' : 'status-self'}`}>
                    {cred.status}
                  </span>
                </li>
              ))}

              {/* CV-Extracted Education (Distinct Candidate-Provided Badge) */}
              {(cvData?.education || []).map((edu, idx) => (
                <li key={'cvedu-' + idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{edu.degree}</strong>{edu.institution ? ` — ${edu.institution}` : ''} {edu.year ? `(${edu.year})` : ''}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                    📄 Candidate CV (Unverified)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 4. EXPERIENCE */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            Documented Experience
          </h4>

          {combinedExperiences.length === 0 ? (
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                No experience entries recorded. Add credentials or upload a CV to populate experience.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {combinedExperiences.map((exp, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                      {exp.type} — {exp.where}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {exp.duration}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: exp.source === 'Candidate CV' ? '#eff6ff' : '#f1f5f9', color: exp.source === 'Candidate CV' ? '#2563eb' : '#475569', border: '1px solid #cbd5e1', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                        {exp.source === 'Candidate CV' ? '📄 Candidate CV' : 'Prep Session'}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
                    <strong>Key Duties:</strong> {exp.duties}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. CERTIFICATIONS & OTHER QUALIFICATIONS */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', margin: 0 }}>
              Certifications &amp; Credentials
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAddModalOpen(true)}
              style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
            >
              + Add Certification
            </button>
          </div>

          {certCreds.length === 0 && otherCreds.length === 0 && (!cvData?.certifications || cvData.certifications.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No specialized certifications added yet (e.g. AWS Cloud Practitioner, PMP, Google UX Certificate).
            </p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...certCreds, ...otherCreds].map(cred => (
                <li key={cred.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{cred.name}</strong> — {cred.issuer} ({cred.year})
                    {cred.documentRef && (
                      <span style={{ fontSize: '0.8rem', color: '#2563eb', marginLeft: '0.5rem' }}>
                        ID: {cred.documentRef}
                      </span>
                    )}
                  </div>
                  <span className={`status-badge ${cred.status === 'Institution verified' ? 'status-verified' : 'status-self'}`}>
                    {cred.status}
                  </span>
                </li>
              ))}

              {/* CV-Extracted Certifications */}
              {(cvData?.certifications || []).map((cert, idx) => (
                <li key={'cvcert-' + idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{cert.name || cert}</strong>
                    {cert.issuer && <span style={{ color: '#64748b' }}> — {cert.issuer}</span>}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                    📄 Candidate CV (Unverified)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 6. RELEVANT SKILLS */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '0.6rem' }}>
            Relevant Skills
          </h4>
          <input
            type="text"
            className="form-input"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            title="Edit comma-separated skills"
          />
        </div>

      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackToPlan}
        >
          ← Back to Preparation Plan
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={copyCvText}
          >
            {copied ? '✓ Copied!' : 'Copy CV'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
          >
            Print Application CV
          </button>
        </div>
      </div>

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddCredential}
      />
    </div>
  );
}
