import React, { useState } from 'react';

export default function PreparationScreen({
  unmetItems = [],
  unclearItems = [],
  metItems = [],
  onAddCredential,
  onSaveExperience,
  onProceedToPlan,
  onBackToResults
}) {
  // Store responses to targeted questions
  const [experienceResponses, setExperienceResponses] = useState({});
  const [certResponses, setCertResponses] = useState({});
  const [savedExperiences, setSavedExperiences] = useState([]);
  const [markedToObtain, setMarkedToObtain] = useState([]);

  // Modal state for adding credential
  const [addingCertReq, setAddingCertReq] = useState(null);

  const missingOrUnclear = [...unmetItems, ...unclearItems];

  const handleExperienceChoice = (reqName, hasExp) => {
    setExperienceResponses(prev => ({
      ...prev,
      [reqName]: {
        ...(prev[reqName] || {}),
        hasExperience: hasExp
      }
    }));
  };

  const handleExperienceFieldChange = (reqName, field, val) => {
    setExperienceResponses(prev => ({
      ...prev,
      [reqName]: {
        ...(prev[reqName] || {}),
        [field]: val
      }
    }));
  };

  const handleSaveExperience = (reqName) => {
    const data = experienceResponses[reqName] || {};
    if (!data.type && !data.where) return;

    const newExp = {
      id: 'exp-' + Date.now(),
      requirement: reqName,
      type: data.type || 'Relevant Professional Experience',
      where: data.where || 'Documented Employer / Project',
      duration: data.duration || 'Documented Tenure',
      duties: data.duties || 'Demonstrated practical responsibilities and deliverables.'
    };

    setSavedExperiences(prev => [...prev, newExp]);
    onSaveExperience(newExp);

    // Also add to candidate credentials as documented experience record
    onAddCredential({
      id: 'cred-exp-' + Date.now(),
      name: `${data.duration || 'Documented'} ${data.type || 'Professional Experience'} (${data.where || 'Project'})`,
      issuer: data.where || 'Documented Experience',
      year: new Date().getFullYear().toString(),
      status: 'Candidate submitted',
      documentRef: `Responsibilities: ${data.duties || 'Practical achievements'}`
    });

    setExperienceResponses(prev => ({
      ...prev,
      [reqName]: {
        ...prev[reqName],
        isSaved: true
      }
    }));
  };

  const handleCertChoice = (reqName, hasCert) => {
    setCertResponses(prev => ({
      ...prev,
      [reqName]: {
        ...(prev[reqName] || {}),
        hasCert
      }
    }));

    if (!hasCert) {
      if (!markedToObtain.includes(reqName)) {
        setMarkedToObtain(prev => [...prev, reqName]);
      }
    }
  };

  return (
    <div>
      <div className="screen-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span>TARGETED GAP ANALYSIS</span>
        </div>
        <h2 className="screen-title">Help Me Prepare</h2>
        <p className="screen-subtitle">
          Instead of just leaving requirements as unmet, let's explore if you have unrecorded experience, or identify the exact credentials you need to obtain before applying.
        </p>
      </div>

      {missingOrUnclear.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>All Requirements Already Met!</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Your submitted credentials satisfy all stated opportunity criteria. You can proceed directly to prepare your application.
          </p>
          <button type="button" className="btn btn-primary" onClick={onProceedToPlan}>
            View Preparation Plan &amp; Application →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ padding: '0.85rem 1.25rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '0.9rem', color: '#1e40af' }}>
            💡 <strong>Targeted Focus:</strong> We found <strong>{missingOrUnclear.length} requirement{missingOrUnclear.length === 1 ? '' : 's'}</strong> needing clarification or proof. Answer these targeted questions to strengthen your candidate profile.
          </div>

          {missingOrUnclear.map((item, index) => {
            const isExperience = item.category === 'experience';
            const isCertification = item.category === 'certification';
            const expData = experienceResponses[item.requirement] || {};
            const certData = certResponses[item.requirement] || {};

            return (
              <div key={index} className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#64748b' }}>
                      Target Requirement #{index + 1}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: '0.2rem' }}>
                      {item.requirement}
                    </h3>
                  </div>

                  <span className="badge-unmet" style={{ fontSize: '0.75rem' }}>
                    {item.status}
                  </span>
                </div>

                {/* EXPERIENCE TARGETED QUESTION */}
                {isExperience && (
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
                      {item.gap
                        ? `"The opportunity requires ${item.gap.requiredYears} years of experience. Your CV documents ${item.gap.candidateYears} year${item.gap.candidateYears === 1 ? '' : 's'}. Do you have any freelance work, internships, or unrecorded projects to help bridge this ${item.gap.missingYears}-year gap?"`
                        : '"Do you have relevant work, freelance, project, internship, or volunteer experience that you have not yet added?"'}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input
                          type="radio"
                          name={`exp-${index}`}
                          checked={expData.hasExperience === true}
                          onChange={() => handleExperienceChoice(item.requirement, true)}
                        />
                        Yes, I have relevant experience
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input
                          type="radio"
                          name={`exp-${index}`}
                          checked={expData.hasExperience === false}
                          onChange={() => handleExperienceChoice(item.requirement, false)}
                        />
                        No, not yet
                      </label>
                    </div>

                    {expData.hasExperience === true && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        {expData.isSaved ? (
                          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            ✓ Experience details saved to your profile: {expData.type} at {expData.where} ({expData.duration})
                          </div>
                        ) : (
                          <div>
                            <div className="form-row">
                              <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">What type of experience?</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. Frontend Development, UX Design, Project Coordination, Research"
                                  value={expData.type || ''}
                                  onChange={(e) => handleExperienceFieldChange(item.requirement, 'type', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Where did you practice / work?</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. Acme Tech, Global Initiative, Community Clinic, University Lab"
                                  value={expData.where || ''}
                                  onChange={(e) => handleExperienceFieldChange(item.requirement, 'where', e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Duration / Timeframe</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="e.g. 2 years (2022 - 2024)"
                                  value={expData.duration || ''}
                                  onChange={(e) => handleExperienceFieldChange(item.requirement, 'duration', e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="form-group">
                              <label className="form-label">What did you do? (Key responsibilities &amp; accomplishments)</label>
                              <textarea
                                className="form-input"
                                style={{ minHeight: '70px' }}
                                placeholder="e.g. Led database migration, engineered component architecture, coordinated team outreach, or delivered project milestones."
                                value={expData.duties || ''}
                                onChange={(e) => handleExperienceFieldChange(item.requirement, 'duties', e.target.value)}
                              />
                            </div>

                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSaveExperience(item.requirement)}
                              disabled={!expData.where || !expData.duration}
                            >
                              + Save &amp; Add Experience to Profile
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {expData.hasExperience === false && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                        This requirement will be highlighted in your Preparation Plan as a critical gap to fulfill or gain before applying.
                      </div>
                    )}
                  </div>
                )}

                {/* CERTIFICATION TARGETED QUESTION */}
                {isCertification && (
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
                      "Do you currently have a {item.requirement} or equivalent certification?"
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input
                          type="radio"
                          name={`cert-${index}`}
                          checked={certData.hasCert === true}
                          onChange={() => handleCertChoice(item.requirement, true)}
                        />
                        Yes, I have it
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input
                          type="radio"
                          name={`cert-${index}`}
                          checked={certData.hasCert === false}
                          onChange={() => handleCertChoice(item.requirement, false)}
                        />
                        No, I do not have it
                      </label>
                    </div>

                    {certData.hasCert === true && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                          Add it now to update your credentials list and satisfy this requirement:
                        </p>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setAddingCertReq(item.requirement)}
                        >
                          + Add {item.requirement} Credential Now
                        </button>
                      </div>
                    )}

                    {certData.hasCert === false && (
                      <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                          ⚠️ Credential Requirement Advisory
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                          This credential is listed as required for this opportunity. You can mark it as a credential you need to obtain, and attach it to your application once completed.
                        </p>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '999px', color: '#92400e', fontWeight: 600 }}>
                            Marked: Need to Obtain
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DEGREE TARGETED QUESTION */}
                {item.category === 'degree' && (
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                      Do you hold an accredited degree or institutional diploma for: "{item.requirement}"?
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      If you have an unlisted university degree, transcript, or equivalent academic diploma, you can add it directly:
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAddingCertReq(item.requirement)}
                    >
                      + Add Academic Degree
                    </button>
                  </div>
                )}

                {/* GENERAL / PRACTICAL SKILL TARGETED QUESTION */}
                {!isExperience && !isCertification && item.category !== 'degree' && (
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                      Do you have practical project experience or skills demonstrating: "{item.requirement}"?
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      You can document this as practical project experience or add an accredited credential:
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleExperienceChoice(item.requirement, true)}
                      >
                        + Document Practical Experience
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setAddingCertReq(item.requirement)}
                      >
                        + Add Credential
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackToResults}
        >
          ← Back to Results
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onProceedToPlan}
        >
          View Preparation Plan →
        </button>
      </div>

      {/* Inline Add Credential Modal if triggered */}
      {addingCertReq && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
              Add Credential for: {addingCertReq}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const name = form.elements['name'].value;
              const issuer = form.elements['issuer'].value;
              const year = form.elements['year'].value;
              const status = form.elements['status'].value;
              const docRef = form.elements['docRef'].value;

              if (name) {
                onAddCredential({
                  id: 'cred-' + Date.now(),
                  name,
                  issuer: issuer || 'Institution',
                  year: year || '2024',
                  status: status || 'Candidate submitted',
                  documentRef: docRef || ''
                });
                setAddingCertReq(null);
              }
            }}>
              <div className="form-group">
                <label className="form-label">Credential Name</label>
                <input name="name" defaultValue={addingCertReq} className="form-input" required />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Issuing Institution</label>
                  <input name="issuer" placeholder="e.g. American Heart Association" className="form-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Year</label>
                  <input name="year" defaultValue="2024" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Verification Status</label>
                <select name="status" className="form-select">
                  <option value="Candidate submitted">Candidate submitted</option>
                  <option value="Institution verified">Institution verified</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Optional Document / Reference</label>
                <input name="docRef" placeholder="e.g. Card ID, Verification URL" className="form-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddingCertReq(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
