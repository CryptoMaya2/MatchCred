/**
 * Nebius Token Factory Evaluation Service
 * 
 * Track: Nebius x NVIDIA Global AI Hackathon, Best Apps and Agents.
 * Evaluates candidate eligibility using an NVIDIA Nemotron model hosted on Nebius Token Factory.
 */

export const NEBIUS_PROVIDER = 'Nebius Token Factory';
export const NEBIUS_BASE_URL = 'https://api.tokenfactory.nebius.com/v1/';
export const PREFERRED_NEMOTRON_MODEL = 'nvidia/Nemotron-3-Ultra-550b-a55b';

/**
 * Sends candidate profile and opportunity requirements to /api/nebius-match
 * for eligibility evaluation via NVIDIA Nemotron on Nebius Token Factory.
 * 
 * @param {Array} credentials Candidate submitted credentials
 * @param {string} requirementsText Opportunity criteria
 * @param {Object|null} cvData Candidate CV extraction
 * @param {string} opportunityTitle Opportunity name
 * @returns {Promise<Object>} Standardized report with Nebius verification metadata
 */
export async function evaluateRequirementsViaNebius(credentials, requirementsText, cvData = null, opportunityTitle = '') {
  const payload = {
    credentials: credentials || [],
    cvData: cvData || null,
    requirementsText: requirementsText || '',
    opportunityTitle: opportunityTitle || ''
  };

  const response = await fetch('/api/nebius-match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const errorMsg = data.error || `Nebius Token Factory request failed with status ${response.status}.`;
    const err = new Error(errorMsg);
    err.provider = NEBIUS_PROVIDER;
    err.apiUrl = data.apiUrl || 'https://api.tokenfactory.nebius.com/v1/chat/completions';
    err.model = data.model || PREFERRED_NEMOTRON_MODEL;
    throw err;
  }

  // Ensure report maintains MatchCred contract schema while displaying Nebius proof
  const rawReport = data.report || data.data || {};

  const items = (rawReport.items || []).map((item, idx) => ({
    id: `nebius-item-${idx}`,
    requirement: item.requirement || `Requirement ${idx + 1}`,
    status: (item.status || 'UNCLEAR').toUpperCase(),
    reqType: item.reqType || 'Required',
    explanation: item.explanation || '',
    evidenceSource: item.evidence || item.evidenceSource || 'Evaluated by Nemotron',
    evidenceType: 'nebius-nemotron',
    howToAddress: item.howToAddress || ''
  }));

  const matchedCount = items.filter(i => i.status === 'MET').length;
  const unmetCount = items.filter(i => i.status === 'NOT MET').length;
  const unclearCount = items.filter(i => i.status === 'UNCLEAR').length;
  const totalRequirements = items.length || 1;
  const percentMatch = typeof rawReport.percentMatch === 'number' 
    ? rawReport.percentMatch 
    : Math.round((matchedCount / totalRequirements) * 100);

  return {
    totalRequirements,
    matchedCount,
    unmetCount,
    unclearCount,
    requiredCount: items.length,
    preferredCount: 0,
    percentMatch,
    summaryText: `${matchedCount} of ${totalRequirements} requirements met`,
    items,
    nextStep: rawReport.nextStep || 'Review eligibility gaps and continue to preparation.',
    nebiusVerified: true,
    provider: data.provider || NEBIUS_PROVIDER,
    model: data.model || PREFERRED_NEMOTRON_MODEL,
    apiUrl: data.apiUrl || 'https://api.tokenfactory.nebius.com/v1/chat/completions',
    evaluatedAt: data.evaluatedAt || new Date().toISOString()
  };
}
