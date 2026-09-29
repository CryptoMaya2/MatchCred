import React from 'react';

export default function PreparationPlanScreen({
  report,
  credentials = [],
  cvData = null,
  savedExperiences = [],
  onProceedToApplication,
  onBackToPrep
}) {
  if (!report) return null;

  // 1. Requirements already met
  const metItems = report.items.filter(i => i.status === 'MET' || i.status === 'MATCH');

  // 2. Requirements that need clarification (UNCLEAR)
  const unclearItems = report.items.filter(i => i.status === 'UNCLEAR');

  // 3. Experience requirements that have tenure gaps or need documentation
  const experienceReqs = report.items.filter(i => 
    (i.status === 'NOT MET' || i.status === 'UNCLEAR') && (i.category === 'experience' || i.category === 'general')
  );

  // 4. Formal credentials you may need (strictly degrees and professional certifications, NOT project experience)
  const neededCredentials = report.items.filter(i => 
    i.status === 'NOT MET' && (i.category === 'certification' || i.category === 'degree')
  );

  // 5. Recommended next steps
  const nextSteps = [];

  experienceReqs.forEach(expItem => {
    if (expItem.gap) {
      nextSteps.push(`Address the ${expItem.gap.missingYears}-year experience gap: document freelance projects, internships, or open-source work to satisfy the ${expItem.gap.requiredYears}-year requirement.`);
    } else {
      nextSteps.push(`Document relevant practical accomplishments, projects, or work history for "${expItem.requirement}" in your application CV.`);
    }
  });

  if (savedExperiences.length > 0) {
    nextSteps.push('Incorporate your documented practical experience clearly into your CV employment or experience section.');
  }

  neededCredentials.forEach(cred => {
    nextSteps.push(`Obtain or provide accredited verification for the required ${cred.requirement}.`);
  });

  if (cvData && cvData.skills && cvData.skills.length > 0) {
    nextSteps.push('Highlight extracted skills (' + cvData.skills.slice(0, 4).join(', ') + ') in your application summary.');
  }

  nextSteps.push('Update and review your application to ensure all verified credentials and experiences are highlighted.');

  return (
    <div>
      <div className="screen-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span>ACTIONABLE ROADMAP</span>
        </div>
        <h2 className="screen-title">Your Preparation Plan</h2>
        <p className="screen-subtitle">
          Based on the opportunity's verified criteria, here is your customized plan to qualify and prepare a competitive application.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* SECTION 1: REQUIREMENTS ALREADY MET */}
        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <h3 style={{ fontSize: '1.15rem', color: '#065f46' }}>
              Requirements Already Met ({metItems.length})
            </h3>
          </div>

          {metItems.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No requirements met yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {metItems.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>
                    <span style={{ fontWeight: 600, color: '#065f46' }}>{item.requirement}</span>
                  </div>
                  {item.matchedCredential && (
                    <span style={{ fontSize: '0.8rem', color: '#047857' }}>
                      Satisfied by: {item.matchedCredential.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SECTION 2: REQUIREMENTS THAT NEED CLARIFICATION */}
        {/* SECTION 2: PRACTICAL EXPERIENCE & PROJECTS TO DOCUMENT */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>💼</span>
            <h3 style={{ fontSize: '1.15rem', color: '#92400e' }}>
              Practical Experience &amp; Projects to Document ({experienceReqs.length})
            </h3>
          </div>

          {experienceReqs.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              No experience or practical project gaps identified.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {experienceReqs.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#fffbeb',
                    borderRadius: '8px',
                    border: '1px solid #fde68a'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#92400e' }}>
                      {item.requirement}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '999px', color: '#b45309', fontWeight: 600 }}>
                      {item.gap
                        ? `Tenure Gap: ${item.gap.missingYears} yr${item.gap.missingYears === 1 ? '' : 's'} needed`
                        : 'Document in CV / Portfolio'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                    {item.gap
                      ? `Opportunity specifies ${item.gap.requiredYears} years of experience; CV currently documents ${item.gap.candidateYears} year${item.gap.candidateYears === 1 ? '' : 's'}. `
                      : `${item.explanation || 'Practical hands-on requirement.'} `}
                    {savedExperiences.some(s => s.requirement === item.requirement)
                      ? `You recorded practical details during preparation, which will be included in your application.`
                      : 'Highlight relevant project accomplishments, hands-on tasks, or practical work history in your application CV to demonstrate this experience.'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SECTION 3: FORMAL CREDENTIALS YOU MAY NEED */}
        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎓</span>
            <h3 style={{ fontSize: '1.15rem', color: '#991b1b' }}>
              Formal Credentials &amp; Degrees You May Need ({neededCredentials.length})
            </h3>
          </div>

          {neededCredentials.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              No additional formal academic degrees or institutional certifications are required.
            </p>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                The following formal credential{neededCredentials.length === 1 ? ' was' : 's were'} explicitly specified by the opportunity:
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {neededCredentials.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#fef2f2',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#991b1b' }}>{item.requirement}</div>
                      <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                        Formal credential required for opportunity submission
                      </div>
                    </div>

                    <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
                      To Obtain / Attach
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION 4: UNCLEAR REQUIREMENTS NEEDING CLARIFICATION */}
        {unclearItems.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔍</span>
              <h3 style={{ fontSize: '1.15rem', color: '#3730a3' }}>
                Requirements Needing Clarification ({unclearItems.length})
              </h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {unclearItems.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#eef2ff',
                    borderRadius: '8px',
                    border: '1px solid #c7d2fe'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#3730a3' }}>{item.requirement}</span>
                  <p style={{ fontSize: '0.85rem', color: '#4338ca', margin: '0.25rem 0 0 0' }}>
                    {item.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 4: RECOMMENDED NEXT STEPS */}
        <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
            <h3 style={{ fontSize: '1.15rem', color: '#1e40af' }}>
              Recommended Next Steps
            </h3>
          </div>

          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {nextSteps.map((step, idx) => (
              <li key={idx} style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 500 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackToPrep}
        >
          ← Edit Gap Responses
        </button>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onProceedToApplication}
        >
          Prepare My Application →
        </button>
      </div>
    </div>
  );
}
