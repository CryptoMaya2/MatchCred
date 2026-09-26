import React, { useState } from 'react';

/**
 * CV Review & Edit Card
 * 
 * Displays the structured information extracted from a candidate's CV (PDF, DOCX, or text).
 * Allows the candidate to review, correct, edit, or add to any section before checking eligibility.
 * 
 * Explicitly distinguishes candidate-provided CV data from verified credentials.
 */
export default function CvReviewCard({
  cvData,
  onChangeCvData,
  onClearCv,
  onUploadAnother
}) {
  const [newSkill, setNewSkill] = useState('');
  const [editingSection, setEditingSection] = useState(null);

  if (!cvData) return null;

  // Add a skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (!cvData.skills.includes(trimmed)) {
      onChangeCvData({
        ...cvData,
        skills: [...(cvData.skills || []), trimmed]
      });
    }
    setNewSkill('');
  };

  // Remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    onChangeCvData({
      ...cvData,
      skills: (cvData.skills || []).filter(s => s !== skillToRemove)
    });
  };

  // Update education item
  const handleUpdateEducation = (id, field, value) => {
    onChangeCvData({
      ...cvData,
      education: cvData.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const handleAddEducation = () => {
    const newItem = {
      id: 'edu-' + Date.now(),
      degree: 'Degree / Qualification',
      institution: 'University or College',
      year: new Date().getFullYear().toString(),
      details: 'Reported in CV'
    };
    onChangeCvData({
      ...cvData,
      education: [...(cvData.education || []), newItem]
    });
  };

  const handleRemoveEducation = (id) => {
    onChangeCvData({
      ...cvData,
      education: cvData.education.filter(e => e.id !== id)
    });
  };

  // Update experience item
  const handleUpdateExperience = (id, field, value) => {
    const updated = cvData.experience.map(e => {
      if (e.id === id) {
        const next = { ...e, [field]: value };
        if (field === 'years') {
          next.duration = `${value} years`;
        }
        return next;
      }
      return e;
    });

    // Recompute total years
    const maxYears = updated.reduce((acc, curr) => Math.max(acc, parseInt(curr.years, 10) || 0), 0);
    onChangeCvData({
      ...cvData,
      experience: updated,
      totalYearsExperience: maxYears
    });
  };

  const handleAddExperience = () => {
    const newItem = {
      id: 'exp-' + Date.now(),
      role: 'Job Role / Title',
      organization: 'Company / Organization',
      duration: '1 year',
      years: 1,
      description: 'Candidate documented experience'
    };
    const updated = [...(cvData.experience || []), newItem];
    const maxYears = updated.reduce((acc, curr) => Math.max(acc, parseInt(curr.years, 10) || 0), 0);
    onChangeCvData({
      ...cvData,
      experience: updated,
      totalYearsExperience: Math.max(cvData.totalYearsExperience || 0, maxYears)
    });
  };

  const handleRemoveExperience = (id) => {
    onChangeCvData({
      ...cvData,
      experience: cvData.experience.filter(e => e.id !== id)
    });
  };

  // Update certification item
  const handleUpdateCert = (id, field, value) => {
    onChangeCvData({
      ...cvData,
      certifications: cvData.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const handleAddCert = () => {
    const newItem = {
      id: 'cert-' + Date.now(),
      name: 'Certification Name',
      issuer: 'Issuing Body',
      year: new Date().getFullYear().toString()
    };
    onChangeCvData({
      ...cvData,
      certifications: [...(cvData.certifications || []), newItem]
    });
  };

  const handleRemoveCert = (id) => {
    onChangeCvData({
      ...cvData,
      certifications: cvData.certifications.filter(c => c.id !== id)
    });
  };

  return (
    <div className="card" style={{ marginBottom: '1.75rem', border: '1px solid #93c5fd', background: '#f8fafc' }}>
      {/* Header with Source & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.25rem' }}>📄</span>
            <h3 style={{ fontSize: '1.15rem', color: '#1e3a8a', margin: 0, fontWeight: 700 }}>
              CV Information Found
            </h3>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}>
              {cvData.sourceFileName}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Extracted and parsed on {new Date(cvData.extractedAt).toLocaleDateString()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onUploadAnother && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onUploadAnother}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
            >
              🔄 Change CV File
            </button>
          )}
          {onClearCv && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClearCv}
              style={{ fontSize: '0.8rem', color: '#ef4444', padding: '0.25rem 0.6rem' }}
            >
              ✕ Remove CV
            </button>
          )}
        </div>
      </div>

      {/* Critical Verification Distinction Alert */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.825rem',
        color: '#92400e',
        lineHeight: 1.5
      }}>
        <strong>⚠️ Candidate-Provided Evidence:</strong> Information extracted from your CV is self-reported by the applicant.
        MatchCred does <em>not</em> label CV claims as "Verified Credentials" simply because they were extracted.
        Review and edit below to ensure everything accurately reflects your profile.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* SECTION 1: EDUCATION */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🎓 Education</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({cvData.education?.length || 0})</span>
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleAddEducation}
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', color: '#2563eb' }}
            >
              + Add Education
            </button>
          </div>

          {(!cvData.education || cvData.education.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
              No formal degree detected in CV. You can add one or rely on practical experience.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cvData.education.map((edu) => (
                <div
                  key={edu.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Degree (e.g. B.Sc. Computer Science)"
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={edu.institution}
                    onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="University / College"
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '80px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={edu.year}
                    onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                    placeholder="Year"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemoveEducation(edu.id)}
                    style={{ color: '#ef4444', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: WORK EXPERIENCE */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💼 Work Experience</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                ({cvData.totalYearsExperience || 0} years documented)
              </span>
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleAddExperience}
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', color: '#2563eb' }}
            >
              + Add Experience
            </button>
          </div>

          {(!cvData.experience || cvData.experience.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
              No employment history extracted. Click "+ Add Experience" if you have practical experience.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cvData.experience.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, minWidth: '160px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                    placeholder="Role (e.g. Frontend Developer)"
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, minWidth: '160px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={exp.organization}
                    onChange={(e) => handleUpdateExperience(exp.id, 'organization', e.target.value)}
                    placeholder="Company / Employer"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="form-input"
                      style={{ width: '65px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                      value={exp.years || 1}
                      onChange={(e) => handleUpdateExperience(exp.id, 'years', parseInt(e.target.value, 10) || 0)}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>yrs</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemoveExperience(exp.id)}
                    style={{ color: '#ef4444', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: SKILLS */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.6rem 0', fontWeight: 700 }}>
            🛠️ Skills ({cvData.skills?.length || 0})
          </h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {(cvData.skills || []).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#93c5fd',
                    fontWeight: 700,
                    padding: 0,
                    fontSize: '0.75rem',
                    lineHeight: 1
                  }}
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
              placeholder="Type a skill and press Enter (e.g. React, User Research, Python)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              + Add Skill
            </button>
          </form>
        </div>

        {/* SECTION 4: CERTIFICATIONS */}
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>📜 Certifications Mentioned in CV</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({cvData.certifications?.length || 0})</span>
            </h4>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleAddCert}
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', color: '#2563eb' }}
            >
              + Add Certification
            </button>
          </div>

          {(!cvData.certifications || cvData.certifications.length === 0) ? (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
              No certifications listed in CV. (If you have an official certificate, you can also add it as a Credential).
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cvData.certifications.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 3, padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={cert.name}
                    onChange={(e) => handleUpdateCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification Name"
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2, padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuer"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemoveCert(cert.id)}
                    style={{ color: '#ef4444', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5: PROJECTS, VOLUNTEER & LEADERSHIP */}
        {((cvData.projects && cvData.projects.length > 0) ||
          (cvData.volunteer && cvData.volunteer.length > 0) ||
          (cvData.leadership && cvData.leadership.length > 0) ||
          (cvData.achievements && cvData.achievements.length > 0)) && (
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.6rem 0', fontWeight: 700 }}>
              ⭐ Standout Highlights (Projects, Leadership, Volunteer)
            </h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(cvData.projects || []).map((p, idx) => (
                <li key={'p-' + idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                  🚀 <strong>Project:</strong> {p.name} {p.tech && `(${p.tech})`}
                </li>
              ))}
              {(cvData.leadership || []).map((l, idx) => (
                <li key={'l-' + idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                  👑 <strong>Leadership:</strong> {l.role}
                </li>
              ))}
              {(cvData.volunteer || []).map((v, idx) => (
                <li key={'v-' + idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                  🤝 <strong>Volunteer:</strong> {v.role} ({v.organization})
                </li>
              ))}
              {(cvData.achievements || []).map((a, idx) => (
                <li key={'a-' + idx} style={{ fontSize: '0.85rem', color: '#334155' }}>
                  🏆 <strong>Achievement:</strong> {a}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
