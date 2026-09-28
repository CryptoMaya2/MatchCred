/**
 * MatchCred Requirement Evaluation Engine
 * 
 * ============================================================================
 * Refined Evaluation Architecture:
 * ============================================================================
 * Statuses:
 * - MET (🟢 The candidate has sufficient evidence)
 * - NOT MET (🔴 The opportunity explicitly requires something the candidate does not have)
 * - UNCLEAR (🟡 There is not enough information to determine whether the candidate meets it)
 * 
 * Requirement Types:
 * - Required (Explicitly required by the opportunity)
 * - Preferred (Explicitly described as preferred, desirable, or an advantage)
 * - Potential Differentiator (Candidate's existing credential not required, but strengthens application)
 * 
 * Evidence:
 * - Every MET requirement presents verifiable proof (Name, Issuer, Status, Year, Ref)
 * ============================================================================
 */

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SYNONYMS = {
  nursing: ['nurse', 'nursing', 'rn', 'midwife', 'midwifery'],
  bachelor: ['bachelor', 'bachelors', 'bsc', 'ba', 'bs', 'btech', 'degree', 'undergraduate'],
  master: ['master', 'masters', 'msc', 'ma', 'ms', 'postgraduate'],
  doctorate: ['phd', 'doctorate', 'doctoral', 'md'],
  experience: ['experience', 'work', 'years', 'practicing', 'history', 'hands-on', 'projects', 'tenure'],
  registered: ['registered', 'licensed', 'certified', 'licensure', 'accredited'],
  developer: ['developer', 'engineer', 'programmer', 'software', 'frontend', 'backend', 'fullstack'],
  design: ['design', 'designer', 'ux', 'ui', 'prototyping', 'product design', 'visual'],
  marketing: ['marketing', 'digital marketing', 'content', 'growth', 'seo', 'campaigns'],
  business: ['business', 'analyst', 'analysis', 'finance', 'consulting', 'strategy'],
  data: ['data', 'analytics', 'analysis', 'science', 'scientist', 'sql', 'bi'],
  leadership: ['leadership', 'lead', 'management', 'coordinator', 'supervision', 'director']
};

function getExpandedTokens(text) {
  const norm = normalize(text);
  const rawTokens = norm.split(' ').filter(t => t.length > 2);
  const expanded = new Set(rawTokens);

  for (const token of rawTokens) {
    for (const [, synonyms] of Object.entries(SYNONYMS)) {
      if (synonyms.includes(token)) {
        synonyms.forEach(syn => expanded.add(syn));
      }
    }
  }

  return { rawTokens, expandedTokens: Array.from(expanded) };
}

/**
 * Categorizes whether a requirement is experience, certification, degree, or general
 */
export function categorizeRequirement(requirement) {
  const r = requirement.toLowerCase();
  if (
    /\b(\d+|two|three|four|five)\s*(years?|yrs?|months?)\b/i.test(r) ||
    /\b(experience|clinical experience|work history|track record|practice)\b/i.test(r)
  ) {
    return 'experience';
  }
  if (
    /\b(bls|cpr|acls|pals|certification|certificate|license|licensed|registered|credential)\b/i.test(r) &&
    !/\b(degree|bachelor|master|phd)\b/i.test(r)
  ) {
    return 'certification';
  }
  if (/\b(bachelor|master|doctorate|phd|degree|diploma|bsc|ba|ms|msc)\b/i.test(r)) {
    return 'degree';
  }
  return 'general';
}

/**
 * Determines whether a requirement is "Required" or "Preferred"
 */
export function determineRequirementType(rawRequirement) {
  const text = rawRequirement.toLowerCase();
  if (
    /\b(preferred|desirable|advantage|advantageous|nice to have|plus|ideal|beneficial)\b/i.test(text)
  ) {
    return 'Preferred';
  }
  return 'Required';
}

/**
 * Clean text of requirement for display (removing leading "Preferred:", "Desirable:")
 */
export function cleanRequirementText(rawRequirement) {
  return rawRequirement
    .replace(/^(preferred|desirable|advantageous|nice to have|required)[\s:\-]+/i, '')
    .trim();
}

/**
 * Parses raw pasted requirement text into individual clean requirement strings.
 */
export function parseRequirementsText(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/);
  const requirements = [];

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Strip leading markdown bullets, dashes, list numbers
    line = line.replace(/^[\*\-\•\·\–\—\+]\s+/, '');
    line = line.replace(/^\d+[\.\)\-]\s+/, '');
    line = line.trim();

    // Skip generic headers
    if (
      line.toLowerCase() === 'requirements:' ||
      line.toLowerCase() === 'requirements' ||
      line.toLowerCase() === 'qualifications:' ||
      line.toLowerCase() === 'qualifications' ||
      line.toLowerCase() === 'eligibility:' ||
      line.toLowerCase() === 'eligibility criteria:'
    ) {
      continue;
    }

    if (line.length > 0) {
      requirements.push(line);
    }
  }

  return requirements;
}

/**
 * Evaluates how well a single requirement matches against candidate credentials and/or CV data.
 * Produces MET, NOT MET, or UNCLEAR with complete evidence or actionable advice.
 * 
 * IMPORTANT VERIFICATION DISTINCTION:
 * - "Verified Credential": Independently verified by an issuing institution.
 * - "Candidate Credential": Entered by candidate, pending independent verification.
 * - "Candidate CV": Extracted from candidate's uploaded CV (self-reported evidence).
 */
function evaluateSingleRequirement(requirement, credentials = [], cvData = null) {
  const cleanedReq = cleanRequirementText(requirement);
  const reqNorm = normalize(cleanedReq);
  const { rawTokens: reqTokens, expandedTokens: reqExpanded } = getExpandedTokens(cleanedReq);
  const category = categorizeRequirement(cleanedReq);
  const reqType = determineRequirementType(requirement);

  // Helper to construct evidence metadata
  const makeEvidence = (cred, sourceOverride = null) => {
    const isVerified = false; // No issuer integration exists; never promote a self-selected status.
    const source = sourceOverride || (isVerified ? 'Verified Credential' : 'Candidate Credential');
    const label = isVerified ? 'Verified credential' : 'Candidate-submitted credential';
    return {
      evidenceSource: source,
      evidenceType: isVerified ? 'verified' : 'candidate',
      evidenceLabel: label,
      evidence: {
        credentialName: cred.name,
        issuer: cred.issuer || 'Recognized Institution',
        status: 'Candidate submitted (unverified)',
        year: cred.year || 'N/A',
        documentRef: cred.documentRef || null
      }
    };
  };

  // ==========================================================================
  // 1. EVALUATE EXPERIENCE REQUIREMENTS (Duration / Tenure)
  // ==========================================================================
  if (category === 'experience') {
    // Check credentials first for documented experience
    const experienceCred = credentials.find(c => {
      const cNorm = normalize(`${c.name} ${c.issuer || ''} ${c.documentRef || ''}`);
      const hasDomainOrWork = /\b(work|experience|employment|clinical|software|engineering|design|leadership|management|community|research|marketing|business|analytics|healthcare|hospital|practice|residency|internship|fellowship|practicing|volunteer|industry)\b/i.test(cNorm);
      const hasExperienceOrTenure = /\b(experience|practice|practicing|residency|internship|fellowship|years|months|history|tenure|track record)\b/i.test(cNorm);
      return hasDomainOrWork && hasExperienceOrTenure;
    });

    if (experienceCred) {
      const meta = makeEvidence(experienceCred);
      return {
        status: 'MET',
        category,
        reqType,
        matchedCredential: experienceCred,
        ...meta,
        explanation: `Sufficient evidence: Documented experience "${experienceCred.name}" satisfies this requirement. Evidence: ${meta.evidenceLabel}.`
      };
    }

    // Check CV data for experience
    if (cvData && Array.isArray(cvData.experience) && cvData.experience.length > 0) {
      const reqYearsMatch = cleanedReq.match(/\b(\d+)\+?\s*(years?|yrs?)\b/i);
      const requiredYears = reqYearsMatch ? parseInt(reqYearsMatch[1], 10) : null;
      const candidateYears = cvData.totalYearsExperience || cvData.experience[0]?.years || 1;
      const primaryExp = cvData.experience[0];

      // If specific duration required, perform gap analysis
      if (requiredYears !== null) {
        if (candidateYears >= requiredYears) {
          return {
            status: 'MET',
            category,
            reqType,
            matchedCredential: null,
            evidenceSource: 'Candidate CV',
            evidenceType: 'cv',
            evidenceLabel: 'Candidate CV',
            evidence: {
              credentialName: `${candidateYears} years experience (${primaryExp.role})`,
              issuer: primaryExp.organization || 'Documented in CV',
              status: 'Candidate CV',
              year: primaryExp.duration || 'Documented',
              documentRef: cvData.sourceFileName || 'Uploaded CV'
            },
            explanation: `Candidate CV documents ${candidateYears} years of experience as ${primaryExp.role} at ${primaryExp.organization}. (Evidence: Candidate CV)`
          };
        } else {
          // Experience GAP detected!
          const missingYears = requiredYears - candidateYears;
          return {
            status: 'UNCLEAR',
            category,
            reqType,
            matchedCredential: null,
            evidenceSource: 'Candidate CV (Gap Detected)',
            evidenceType: 'cv-gap',
            evidenceLabel: 'Candidate CV',
            gap: {
              requiredYears,
              candidateYears,
              missingYears
            },
            evidence: {
              credentialName: `${candidateYears} of ${requiredYears} years documented`,
              issuer: primaryExp.organization || 'Documented in CV',
              status: 'Candidate CV (Gap Detected)',
              year: primaryExp.duration || 'Documented',
              documentRef: cvData.sourceFileName || 'Uploaded CV'
            },
            explanation: `Experience gap: Opportunity specifies ${requiredYears} years of experience, but candidate CV currently documents ${candidateYears} year${candidateYears === 1 ? '' : 's'}.`,
            howToAddress: `Your CV lists ${candidateYears} year${candidateYears === 1 ? '' : 's'} of experience. If you have freelance work, internships, or unrecorded projects to help bridge the ${missingYears}-year gap, clarify them via "Help Me Prepare".`
          };
        }
      }

      // General experience requirement (no specific number of years)
      return {
        status: 'MET',
        category,
        reqType,
        matchedCredential: null,
        evidenceSource: 'Candidate CV',
        evidenceType: 'cv',
        evidenceLabel: 'Candidate CV',
        evidence: {
          credentialName: primaryExp.role,
          issuer: primaryExp.organization || 'Documented in CV',
          status: 'Candidate CV',
          year: primaryExp.duration || 'Documented',
          documentRef: cvData.sourceFileName || 'Uploaded CV'
        },
        explanation: `Candidate CV documents relevant practical experience in ${primaryExp.role}. (Evidence: Candidate CV)`
      };
    }

    return {
      status: 'NOT MET',
      category,
      reqType,
      matchedCredential: null,
      evidenceSource: 'No supporting record found',
      evidenceType: 'none',
      evidenceLabel: 'None',
      evidence: null,
      explanation: 'Missing: No documented work tenure, project history, or relevant professional experience found in submitted credentials or CV.',
      howToAddress: 'If you have relevant project experience, internships, or professional hours, record them via "Help Me Prepare".'
    };
  }

  // ==========================================================================
  // 2. EVALUATE AGAINST CREDENTIALS
  // ==========================================================================
  let bestMatch = null;
  let highestScore = 0;
  let partialMatch = null;

  for (const cred of credentials) {
    const credNorm = normalize(`${cred.name} ${cred.issuer || ''}`);
    const { rawTokens: credTokens, expandedTokens: credExpanded } = getExpandedTokens(cred.name);

    // 1. Direct or Near Exact Match
    if (credNorm.includes(reqNorm) || reqNorm.includes(normalize(cred.name))) {
      const meta = makeEvidence(cred);
      return {
        status: 'MET',
        category,
        reqType,
        matchedCredential: cred,
        ...meta,
        explanation: `Matches credential "${cred.name}" issued by ${cred.issuer || 'recognized institution'}. (Evidence: ${meta.evidenceLabel})`
      };
    }

    // 2. Specific BLS / CPR certification matching
    const isBLSReq = /\b(bls|basic life support|cpr)\b/i.test(cleanedReq);
    const isBLSCred = /\b(bls|basic life support|cpr)\b/i.test(cred.name);
    if (isBLSReq && isBLSCred) {
      const meta = makeEvidence(cred);
      return {
        status: 'MET',
        category,
        reqType,
        matchedCredential: cred,
        ...meta,
        explanation: `Your credential "${cred.name}" fulfills the certification requirement. (Evidence: ${meta.evidenceLabel})`
      };
    }

    // 3. Token overlap scoring with expansion
    const sharedTokens = reqTokens.filter(t => credTokens.includes(t));
    const sharedExpanded = reqExpanded.filter(t => credExpanded.includes(t));
    const tokenScore = (sharedTokens.length * 2 + sharedExpanded.length) / Math.max(reqTokens.length, 1);

    if (tokenScore > highestScore) {
      highestScore = tokenScore;
      bestMatch = cred;
    }

    // 4. Academic degree matching
    const isDegreeReq = /\b(bachelor|master|doctor|degree|diploma|certificate|undergraduate|postgraduate)\b/i.test(cleanedReq) || /\b(b\.?\s*sc|m\.?\s*sc|b\.?\s*a|m\.?\s*a)\b/i.test(cleanedReq);
    const isDegreeCred = /\b(bachelor|master|doctor|degree|diploma|certificate|bsc|ba|ms|msc|undergraduate|postgraduate)\b/i.test(cred.name) || /\b(b\.?\s*sc|m\.?\s*sc|b\.?\s*a|m\.?\s*a)\b/i.test(cred.name);

    if (isDegreeReq && isDegreeCred) {
      const fieldReqTokens = reqTokens.filter(t => !['bachelor', 'bachelors', 'degree', 'in', 'of', 'and', 'the', 'stem', 'field', 'related', 'discipline'].includes(t));
      const fieldCredTokens = credTokens.filter(t => !['bachelor', 'bachelors', 'degree', 'science', 'arts', 'of', 'in', 'and'].includes(t));
      const commonField = fieldReqTokens.filter(t => fieldCredTokens.includes(t) || credExpanded.includes(t));

      if (commonField.length > 0 || fieldReqTokens.length === 0) {
        const meta = makeEvidence(cred);
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: cred,
          ...meta,
          explanation: `Your degree "${cred.name}" satisfies the ${cleanedReq} requirement. (Evidence: ${meta.evidenceLabel})`
        };
      }
    }

    // 5. Specialized Vendor / Professional Certifications (e.g. AWS, Azure, Google, PMP)
    const isCertReq = category === 'certification' || /\b(certification|certificate|certified|credential)\b/i.test(cleanedReq);
    const isCertCred = /\b(certification|certificate|certified|credential)\b/i.test(cred.name);
    if (isCertReq && isCertCred) {
      const coreReqCertTokens = reqTokens.filter(t => !['certification', 'certificate', 'certified', 'credential', 'credentials', 'required', 'preferred'].includes(t));
      const coreCredCertTokens = credTokens.filter(t => !['certification', 'certificate', 'certified', 'credential', 'credentials'].includes(t));
      const hasDomainOverlap = coreReqCertTokens.some(t => coreCredCertTokens.includes(t) || credExpanded.includes(t));
      if (hasDomainOverlap) {
        const meta = makeEvidence(cred);
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: cred,
          ...meta,
          explanation: `Your credential "${cred.name}" fulfills this certification requirement. (Evidence: ${meta.evidenceLabel})`
        };
      }
    }

    // 6. Professional licenses
    const isLicenseReq = /\b(registered|licensed|certified|rn|license)\b/i.test(cleanedReq);
    const isLicenseCred = /\b(registered|licensed|certified|rn|license)\b/i.test(cred.name);

    if (isLicenseReq && isLicenseCred) {
      const coreReq = reqTokens.filter(t => !['registered', 'licensed', 'certified'].includes(t));
      const coreCred = credTokens.filter(t => !['registered', 'licensed', 'certified'].includes(t));
      const hasCoreMatch = coreReq.some(t => coreCred.includes(t) || credExpanded.includes(t));

      if (hasCoreMatch) {
        const meta = makeEvidence(cred);
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: cred,
          ...meta,
          explanation: `Your professional license "${cred.name}" fulfills this requirement. (Evidence: ${meta.evidenceLabel})`
        };
      }
    }

    if (tokenScore >= 0.8) {
      partialMatch = cred;
    }
  }

  // ==========================================================================
  // 3. EVALUATE AGAINST CANDIDATE CV (Candidate-Provided Evidence)
  // ==========================================================================
  if (cvData) {
    // A. Academic Degree in CV
    if (category === 'degree' && Array.isArray(cvData.education) && cvData.education.length > 0) {
      for (const edu of cvData.education) {
        const eduNorm = normalize(`${edu.degree} ${edu.institution || ''}`);
        const fieldReqTokens = reqTokens.filter(t => !['bachelor', 'bachelors', 'degree', 'in', 'of', 'and', 'the', 'undergraduate', 'postgraduate'].includes(t));
        const eduTokens = normalize(edu.degree).split(' ');
        const matchesField = fieldReqTokens.length === 0 || fieldReqTokens.some(t => eduTokens.includes(t) || reqExpanded.includes(t));

        if (matchesField) {
          return {
            status: 'MET',
            category,
            reqType,
            matchedCredential: null,
            evidenceSource: 'Candidate CV',
            evidenceType: 'cv',
            evidenceLabel: 'Candidate CV (Unverified)',
            evidence: {
              credentialName: edu.degree,
              issuer: edu.institution || 'Reported in CV',
              status: 'Candidate CV (Unverified)',
              year: edu.year || 'Documented',
              documentRef: cvData.sourceFileName || 'Uploaded CV'
            },
            explanation: `Candidate CV lists "${edu.degree}" from ${edu.institution}. Note: This is candidate-provided evidence and has not undergone independent institutional verification.`
          };
        }
      }
    }

    // B. Certifications in CV
    if (category === 'certification' && Array.isArray(cvData.certifications) && cvData.certifications.length > 0) {
      const certStopWords = ['professional', 'certificate', 'certification', 'certified', 'credential', 'credentials', 'in', 'of', 'and', 'the', 'for', 'program', 'course', 'training'];
      for (const cert of cvData.certifications) {
        const certName = typeof cert === 'string' ? cert : cert.name;
        const certNorm = normalize(certName);
        const certTokens = certNorm.split(' ').filter(t => !certStopWords.includes(t) && t.length > 2);
        const meaningfulReqTokens = reqTokens.filter(t => !certStopWords.includes(t));
        const meaningfulOverlap = meaningfulReqTokens.filter(t => certTokens.includes(t));

        if (meaningfulOverlap.length >= 1 || (certNorm && reqNorm.includes(certNorm)) || (reqNorm && certNorm.includes(reqNorm))) {
          return {
            status: 'MET',
            category,
            reqType,
            matchedCredential: null,
            evidenceSource: 'Candidate CV',
            evidenceType: 'cv',
            evidenceLabel: 'Candidate CV (Unverified)',
            evidence: {
              credentialName: certName,
              issuer: cert.issuer || 'Reported in CV',
              status: 'Candidate CV (Unverified)',
              year: cert.year || 'Reported',
              documentRef: cvData.sourceFileName || 'Uploaded CV'
            },
            explanation: `Candidate CV reports certification "${certName}". (Evidence: Candidate CV claim, unverified)`
          };
        }
      }
    }

    // C. Skills, Projects, Volunteer, Leadership in CV
    if (category === 'general' && Array.isArray(cvData.skills) && cvData.skills.length > 0) {
      for (const skill of cvData.skills) {
        const skillNorm = normalize(skill);
        if (skillNorm.length > 2 && (new RegExp(`\\b${skillNorm}\\b`, 'i').test(reqNorm) || reqNorm.includes(skillNorm))) {
          return {
            status: 'MET',
            category,
            reqType,
            matchedCredential: null,
            evidenceSource: 'Candidate CV',
            evidenceType: 'cv',
            evidenceLabel: 'Candidate CV',
            evidence: {
              credentialName: `Skill: ${skill}`,
              issuer: 'Candidate CV',
              status: 'Candidate CV',
              year: 'Documented',
              documentRef: cvData.sourceFileName || 'Uploaded CV'
            },
            explanation: `Candidate CV documents proficiency in ${skill}. (Evidence: Candidate CV)`
          };
        }
      }
    }

    // D. Projects or Portfolio in CV (for portfolio or project requirements, not certifications or degrees)
    if (category !== 'certification' && category !== 'degree' && Array.isArray(cvData.projects) && cvData.projects.length > 0) {
      const isPortfolioReq = /\b(portfolio|github|code sample)\b/i.test(cleanedReq) || (/\b(project|projects)\b/i.test(cleanedReq) && !/\b(management|manager|lead|pmp|certification|certified|degree)\b/i.test(cleanedReq));
      if (isPortfolioReq) {
        const proj = cvData.projects[0];
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: null,
          evidenceSource: 'Candidate CV',
          evidenceType: 'cv',
          evidenceLabel: 'Candidate CV',
          evidence: {
            credentialName: proj.name,
            issuer: 'Candidate Portfolio / Project',
            status: 'Candidate CV',
            year: 'Documented',
            documentRef: cvData.sourceFileName || 'Uploaded CV'
          },
          explanation: `Candidate CV demonstrates project work: "${proj.name}". (Evidence: Candidate CV)`
        };
      }
    }

    // E. Volunteer / Leadership in CV (for leadership or community requirements, never for certifications or degrees)
    if (category !== 'certification' && category !== 'degree' && Array.isArray(cvData.leadership) && cvData.leadership.length > 0) {
      const isLeadershipReq = /\b(leadership|lead|coordination|team lead)\b/i.test(cleanedReq) && !/\b(pmp|certification|certified|degree)\b/i.test(cleanedReq);
      if (isLeadershipReq) {
        const lead = cvData.leadership[0];
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: null,
          evidenceSource: 'Candidate CV',
          evidenceType: 'cv',
          evidenceLabel: 'Candidate CV',
          evidence: {
            credentialName: lead.role,
            issuer: 'Candidate CV',
            status: 'Candidate CV',
            year: 'Documented',
            documentRef: cvData.sourceFileName || 'Uploaded CV'
          },
          explanation: `Candidate CV documents leadership experience: "${lead.role}". (Evidence: Candidate CV)`
        };
      }
    }

    if (category !== 'certification' && category !== 'degree' && Array.isArray(cvData.volunteer) && cvData.volunteer.length > 0) {
      const isVolunteerReq = /\b(volunteer|community|outreach|social impact|civic)\b/i.test(cleanedReq);
      if (isVolunteerReq) {
        const vol = cvData.volunteer[0];
        return {
          status: 'MET',
          category,
          reqType,
          matchedCredential: null,
          evidenceSource: 'Candidate CV',
          evidenceType: 'cv',
          evidenceLabel: 'Candidate CV',
          evidence: {
            credentialName: vol.role,
            issuer: vol.organization || 'Volunteer Organization',
            status: 'Candidate CV',
            year: 'Documented',
            documentRef: cvData.sourceFileName || 'Uploaded CV'
          },
          explanation: `Candidate CV documents community/volunteer engagement: "${vol.role}". (Evidence: Candidate CV)`
        };
      }
    }
  }

  // Handle Ambiguous or Partial credential matches
  if (partialMatch || (highestScore >= 0.6 && bestMatch)) {
    const cand = partialMatch || bestMatch;
    return {
      status: 'UNCLEAR',
      category,
      reqType,
      matchedCredential: cand,
      evidenceSource: 'Partial Credential Match',
      evidenceType: 'partial',
      evidenceLabel: 'Partial match',
      evidence: null,
      explanation: `Information missing: Related credential "${cand.name}" detected, but exact equivalence or prerequisites cannot be verified automatically.`,
      howToAddress: 'Confirm syllabus equivalence or provide certified accreditation transcript.'
    };
  }

  // Handle Certifications that were not found in either
  if (category === 'certification') {
    return {
      status: 'UNCLEAR',
      category,
      reqType,
      matchedCredential: null,
      evidenceSource: 'No supporting credential found',
      evidenceType: 'none',
      evidenceLabel: 'None',
      evidence: null,
      explanation: 'Professional certification: No supporting credential or CV record found.',
      howToAddress: reqType === 'Preferred'
        ? 'This is a preferred advantage; you may still apply if you meet all required criteria.'
        : 'Obtain this certification or attach proof before submitting your application.'
    };
  }

  // Default: Not Met
  return {
    status: 'NOT MET',
    category,
    reqType,
    matchedCredential: null,
    evidenceSource: 'No supporting record found',
    evidenceType: 'none',
    evidenceLabel: 'None',
    evidence: null,
    explanation: `Missing: No supporting credential or CV record found for "${cleanedReq}".`,
    howToAddress: reqType === 'Preferred'
      ? 'This is a preferred advantage; you may still apply if you meet all required criteria.'
      : 'Obtain this qualification or clarify related experience via "Help Me Prepare".'
  };
}

/**
 * Discovers potential differentiators / application strengths.
 * Identifies credentials and CV qualifications the candidate has that were NOT required.
 */
export function identifyApplicationStrengths(credentials = [], items = [], cvData = null) {
  const matchedCredIds = new Set(items.filter(i => i.matchedCredential).map(i => i.matchedCredential.id));
  const strengths = [];

  // Check extra credentials
  for (const cred of credentials) {
    if (!matchedCredIds.has(cred.id)) {
      // Analyze domain relevance
      const isHealthcare = /\b(nurse|midwife|clinical|health|medical|cpr|pharma|patient)\b/i.test(cred.name);
      const isTech = /\b(computer|data|ai|software|learning|cloud|python|web|react|aws)\b/i.test(cred.name);
      const isLeadership = /\b(lead|management|fellow|scholar|director|coordinator|volunteer|community)\b/i.test(cred.name);
      const isDesign = /\b(design|ux|ui|creative|art|media|prototyping)\b/i.test(cred.name);
      const isBusiness = /\b(business|finance|analytics|project|marketing|economics|pmp)\b/i.test(cred.name);

      if (isHealthcare || isTech || isLeadership || isDesign || isBusiness) {
        strengths.push({
          credentialName: cred.name,
          issuer: cred.issuer,
          year: cred.year,
          status: cred.status,
          documentRef: cred.documentRef,
          evidenceSource: 'Candidate Credential',
          differentiatorNote: `Not required in the opportunity, but highly relevant and may strengthen your application as a distinct qualification.`
        });
      }
    }
  }

  // Check extra standout items from CV (e.g. leadership roles, certifications, achievements)
  if (cvData) {
    if (Array.isArray(cvData.leadership) && cvData.leadership.length > 0) {
      const lead = cvData.leadership[0];
      if (!strengths.some(s => s.credentialName === lead.role)) {
        strengths.push({
          credentialName: lead.role,
          issuer: 'Candidate CV',
          year: 'Documented',
          status: 'Candidate CV',
          evidenceSource: 'Candidate CV',
          differentiatorNote: 'Documented leadership role from CV that sets your application apart.'
        });
      }
    }

    if (Array.isArray(cvData.achievements) && cvData.achievements.length > 0) {
      const ach = cvData.achievements[0];
      strengths.push({
        credentialName: ach,
        issuer: 'Candidate CV',
        year: 'Documented',
        status: 'Candidate CV',
        evidenceSource: 'Candidate CV',
        differentiatorNote: 'Standout achievement noted in candidate CV.'
      });
    }
  }

  return strengths;
}

/**
 * Curated real opportunity archetypes for recommendations
 * When candidate does not meet all requirements of an opportunity.
 */
export const RECOMMENDED_OPPORTUNITY_CATALOG = [
  {
    id: 'opp-rec-1',
    title: 'Associate Product Designer',
    organization: 'Global Innovation Studio',
    location: 'Remote / Hybrid',
    type: 'Fellowship / Early Career',
    whyRecommended: 'May align with your credentials, recognizing portfolio and digital design experience.',
    matchingQualifications: ["Bachelor's Degree", 'Design Portfolio'],
    notes: 'Structured mentorship program provided during initial 6 months.'
  },
  {
    id: 'opp-rec-2',
    title: 'Junior Frontend Software Engineer',
    organization: 'Open Tech Collaborative',
    location: 'Remote',
    type: 'Full-time / Technology',
    whyRecommended: 'May align with candidates holding computer science or web development credentials.',
    matchingQualifications: ['B.Sc. Computer Science', 'Web Development Certification'],
    notes: 'Emphasizes practical project code and component architecture.'
  },
  {
    id: 'opp-rec-3',
    title: 'Emerging Leaders Policy Scholar',
    organization: 'Commonwealth Foundation',
    location: 'International / Hybrid',
    type: 'Postgraduate Scholarship',
    whyRecommended: 'May align with candidates combining an undergraduate degree with verified community leadership.',
    matchingQualifications: ['Undergraduate Degree', 'Community Leadership Certificate'],
    notes: 'Values interdisciplinary academic backgrounds.'
  }
];

/**
 * PRIMARY EVALUATION SERVICE FUNCTION
 * 
 * Supports:
 * - Credentials only
 * - CV only
 * - Both (CV + Credentials)
 */
export function evaluateRequirements(credentials = [], opportunityRequirements = [], cvData = null) {
  const reqList = Array.isArray(opportunityRequirements)
    ? opportunityRequirements
    : parseRequirementsText(opportunityRequirements);

  if (reqList.length === 0) {
    return {
      totalRequirements: 0,
      matchedCount: 0,
      unmetCount: 0,
      unclearCount: 0,
      requiredCount: 0,
      preferredCount: 0,
      summaryText: '0 of 0 requirements met',
      items: [],
      potentialDifferentiators: [],
      recommendedOpportunities: [],
      evaluatedAt: new Date().toISOString(),
      genLayerReady: true
    };
  }

  const items = reqList.map(req => {
    const single = evaluateSingleRequirement(req, credentials, cvData);
    return {
      requirement: req,
      ...single
    };
  });

  const matchedCount = items.filter(i => i.status === 'MET').length;
  const unmetCount = items.filter(i => i.status === 'NOT MET').length;
  const unclearCount = items.filter(i => i.status === 'UNCLEAR').length;
  const requiredCount = items.filter(i => i.reqType === 'Required').length;
  const preferredCount = items.filter(i => i.reqType === 'Preferred').length;
  const total = items.length;

  // Identify application strengths / potential differentiators
  const potentialDifferentiators = identifyApplicationStrengths(credentials, items, cvData);

  // Surface aligned opportunities if candidate has unmet requirements
  const recommendedOpportunities = unmetCount > 0 ? RECOMMENDED_OPPORTUNITY_CATALOG : [];

  return {
    totalRequirements: total,
    matchedCount,
    unmetCount,
    unclearCount,
    requiredCount,
    preferredCount,
    summaryText: `${matchedCount} of ${total} requirements met`,
    items,
    potentialDifferentiators,
    recommendedOpportunities,
    evaluatedAt: new Date().toISOString(),
    genLayerReady: true
  };
}

/**
 * Sample datasets for testing both matching and the "Help Me Prepare" flow.
 * Diverse, realistic, cross-industry examples (Scholarship, Tech, Design, Health, Business).
 */
export const SAMPLE_DATASETS = {
  scholarship: {
    key: 'scholarship',
    title: 'Global Leadership Scholarship',
    category: 'Scholarship',
    credentials: [
      {
        id: 'cred-sch-1',
        name: 'Bachelor of Science in Economics',
        issuer: 'University of Lagos',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Degree Certificate #UL-2024-8821'
      },
      {
        id: 'cred-sch-2',
        name: 'Student Council Leadership Certificate',
        issuer: 'University Student Union',
        year: '2023',
        status: 'Candidate submitted',
        documentRef: 'Certificate ID: USU-LEAD-2023'
      },
      {
        id: 'cred-sch-3',
        name: 'Community Initiative Leadership Award',
        issuer: 'Civic Action Network',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Attestation #CAN-CIV-901'
      }
    ],
    requirementsRaw: `* Undergraduate degree (Bachelor's or equivalent)
* Documented leadership or project coordination experience
* 1+ years community involvement or social impact initiative
* Desirable: Prior cross-cultural engagement or volunteer leadership`,
    opportunityTitle: 'Global Leadership Postgraduate Scholarship — Commonwealth Foundation'
  },
  tech: {
    key: 'tech',
    title: 'Frontend Developer Position',
    category: 'Technology',
    credentials: [
      {
        id: 'cred-tech-1',
        name: 'B.Sc. in Computer Science',
        issuer: 'University of Lagos',
        year: '2025',
        status: 'Institution verified',
        documentRef: 'Diploma #UL-CS-2025-091'
      },
      {
        id: 'cred-tech-2',
        name: 'Full-Stack Web Development Certification',
        issuer: 'Open Code Institute',
        year: '2024',
        status: 'Candidate submitted',
        documentRef: 'Certificate ID: OCI-FS-8812'
      },
      {
        id: 'cred-tech-3',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Validation #AWS-CP-49102'
      }
    ],
    requirementsRaw: `* Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience
* Proven proficiency in modern JavaScript/TypeScript and React
* 2+ years web application development experience
* Desirable: Cloud deployment or containerization experience`,
    opportunityTitle: 'Frontend Software Engineer — Modern Web Systems'
  },
  fellowship: {
    key: 'fellowship',
    title: 'Product Design Fellowship',
    category: 'Design',
    credentials: [
      {
        id: 'cred-des-1',
        name: 'Bachelor of Arts in Design',
        issuer: 'National Design Academy',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Diploma #NDA-DES-2024'
      },
      {
        id: 'cred-des-2',
        name: 'Google UX Design Professional Certificate',
        issuer: 'Google Career Certificates',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Certificate #G-UX-84192'
      },
      {
        id: 'cred-des-3',
        name: 'Community Health Outreach Volunteer',
        issuer: 'Public Health Volunteer Alliance',
        year: '2023',
        status: 'Candidate submitted',
        documentRef: 'Volunteer Letter #PHVA-882'
      }
    ],
    requirementsRaw: `* Bachelor's degree or accredited design qualification
* Portfolio demonstrating user research and interface prototyping
* 1+ years design experience
* Desirable: Experience collaborating with engineering teams`,
    opportunityTitle: 'Product Design Fellowship — Global Innovation Lab'
  },
  publicHealth: {
    key: 'publicHealth',
    title: 'Community Health Programme',
    category: 'Public Health',
    credentials: [
      {
        id: 'cred-ph-1',
        name: 'B.Sc. in Public Health Sciences',
        issuer: 'College of Health Sciences',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Degree #CHS-PH-2024-04'
      },
      {
        id: 'cred-ph-2',
        name: 'First Aid & Emergency Response Certification',
        issuer: 'Red Cross Society',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Certification #RC-FA-2024'
      }
    ],
    requirementsRaw: `* University degree in Public Health, Health Sciences, or related field
* Current emergency first aid or basic life support certification
* 1+ years field outreach or community clinic coordination experience
* Desirable: Experience in community health data collection`,
    opportunityTitle: 'Community Health Field Coordinator — Health For All Initiative'
  },
  business: {
    key: 'business',
    title: 'Business Analyst Internship',
    category: 'Business',
    credentials: [
      {
        id: 'cred-bus-1',
        name: 'B.Sc. in Business Administration & Analytics',
        issuer: 'Metropolitan Business School',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Degree #MBS-BA-4819'
      },
      {
        id: 'cred-bus-2',
        name: 'Financial Modeling & Spreadsheet Certification',
        issuer: 'Corporate Finance Institute',
        year: '2024',
        status: 'Institution verified',
        documentRef: 'Cert #CFI-FM-1082'
      }
    ],
    requirementsRaw: `* Bachelor's degree in Business, Finance, Economics, or related analytical discipline
* Proficiency with structured data modeling and spreadsheet analysis
* Strong presentation and analytical documentation skills
* Desirable: Familiarity with SQL or business intelligence reporting`,
    opportunityTitle: 'Business Analyst Graduate Associate — Global Advisory Partners'
  }
};
