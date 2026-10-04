/**
 * /api/nebius-match Server Route
 * 
 * Nebius x NVIDIA Global AI Hackathon (Best Apps and Agents)
 * Evaluates candidate eligibility using an NVIDIA Nemotron open model served on Nebius Token Factory.
 * 
 * Base URL: https://api.tokenfactory.nebius.com/v1/
 * Auth: Authorization: Bearer ${NEBIUS_API_KEY}
 * Primary reasoning model: nvidia/Nemotron-3-Ultra-550b-a55b
 * Fast fallbacks: listed Nemotron 3 Super or Nemotron 3.5 Lightning ids
 */

const NEBIUS_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';
const PREFERRED_MODEL = 'nvidia/Nemotron-3-Ultra-550b-a55b';

/**
 * Resolves the appropriate Nemotron model ID against Nebius Token Factory.
 * If preferred model is rejected or models list is queried, selects available Nemotron ID.
 */
async function resolveNemotronModel(apiKey) {
  try {
    const res = await fetch(`${NEBIUS_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const models = (data.data || []).map(m => m.id);

      // 1. Look for Nemotron 3 Ultra
      const ultra = models.find(id => /nemotron.*3.*ultra/i.test(id)) ||
                    models.find(id => /nemotron.*ultra/i.test(id));
      if (ultra) return ultra;

      // 2. Exact preferred model check
      if (models.includes(PREFERRED_MODEL)) return PREFERRED_MODEL;

      // 3. Fast fallback: Nemotron 3 Super
      const superModel = models.find(id => /nemotron.*3.*super/i.test(id)) ||
                         models.find(id => /nemotron.*super/i.test(id));
      if (superModel) return superModel;

      // 4. Fast fallback: Nemotron 3.5 Lightning
      const lightning = models.find(id => /nemotron.*3\.?5.*lightning/i.test(id)) ||
                        models.find(id => /nemotron.*lightning/i.test(id));
      if (lightning) return lightning;

      // 5. Any Nemotron model listed
      const anyNemotron = models.find(id => /nemotron/i.test(id));
      if (anyNemotron) return anyNemotron;
    }
  } catch (err) {
    console.warn('[Nebius Token Factory] Model list inspection note:', err.message);
  }

  return PREFERRED_MODEL;
}

/**
 * Formats candidate credentials and CV data into a cohesive profile description.
 */
function buildCandidateProfileText(credentials = [], cvData = null, profileText = '') {
  const parts = [];

  if (profileText && profileText.trim()) {
    parts.push(`Profile Overview:\n${profileText.trim()}`);
  }

  if (credentials && credentials.length > 0) {
    const credsList = credentials.map((c, i) => 
      `${i + 1}. ${c.name} — Issuer: ${c.issuer || 'N/A'}, Year: ${c.year || 'N/A'}, Status: ${c.status || 'Candidate submitted'}${c.documentRef ? `, Ref: ${c.documentRef}` : ''}`
    ).join('\n');
    parts.push(`Formal Credentials:\n${credsList}`);
  }

  if (cvData) {
    const cvParts = [];
    if (cvData.candidateName) cvParts.push(`Candidate: ${cvData.candidateName}`);
    if (cvData.summary) cvParts.push(`Summary: ${cvData.summary}`);
    if (cvData.skills && cvData.skills.length > 0) {
      cvParts.push(`Skills: ${cvData.skills.join(', ')}`);
    }
    if (cvData.education && cvData.education.length > 0) {
      cvParts.push(`Education:\n${cvData.education.map(e => `• ${e.degree || e.institution || 'Degree'} (${e.year || 'N/A'})`).join('\n')}`);
    }
    if (cvData.experience && cvData.experience.length > 0) {
      cvParts.push(`Experience:\n${cvData.experience.map(e => `• ${e.title || 'Role'} at ${e.company || 'Organization'} (${e.duration || 'N/A'}): ${e.description || ''}`).join('\n')}`);
    }
    if (cvData.certifications && cvData.certifications.length > 0) {
      cvParts.push(`Certifications: ${cvData.certifications.join(', ')}`);
    }
    if (cvParts.length > 0) {
      parts.push(`Candidate CV Records:\n${cvParts.join('\n\n')}`);
    }
  }

  return parts.length > 0 
    ? parts.join('\n\n') 
    : 'No candidate credentials or CV records provided.';
}

export async function handleNebiusMatchRequest(reqBody, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'NEBIUS_API_KEY is not configured on the server. Please set NEBIUS_API_KEY in your environment variables to use Nebius Token Factory.',
        provider: 'Nebius Token Factory',
        apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
        model: PREFERRED_MODEL
      }
    };
  }

  const { credentials = [], cvData = null, requirementsText = '', opportunityTitle = '', profileText = '' } = reqBody || {};

  if (!requirementsText || !requirementsText.trim()) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Opportunity requirementsText is required for evaluation.',
        provider: 'Nebius Token Factory',
        apiUrl: `${NEBIUS_BASE_URL}/chat/completions`
      }
    };
  }

  const candidateProfile = buildCandidateProfileText(credentials, cvData, profileText);
  let modelToUse = await resolveNemotronModel(apiKey);

  const systemPrompt = `You are MatchCred's intelligent eligibility evaluator powered by NVIDIA Nemotron on Nebius Token Factory.
Your task is to objectively evaluate a candidate's profile against the given opportunity requirements.
You MUST output valid, parseable JSON ONLY with NO surrounding markdown ticks, no preamble, and no commentary.

Expected JSON Structure:
{
  "percentMatch": <integer from 0 to 100>,
  "matchedCount": <integer>,
  "unclearCount": <integer>,
  "unmetCount": <integer>,
  "items": [
    {
      "requirement": "<exact requirement from input>",
      "status": "MET" | "UNCLEAR" | "NOT MET",
      "evidence": "<the specific evidence sentence or quote from the candidate profile that justifies this status>",
      "explanation": "<short factual justification>"
    }
  ],
  "nextStep": "<one specific, actionable preparation recommendation for the candidate to address gaps or submit>"
}

Evaluation Rules:
- Mark MET only if the profile contains documented evidence supporting the requirement.
- Mark UNCLEAR if relevant knowledge is claimed but verifiable experience, dates, or credentials are ambiguous.
- Mark NOT MET if the requirement is unaddressed in the profile.
- Return JSON only.`;

  const userPrompt = `Opportunity: ${opportunityTitle || 'Opportunity Requirements'}

Opportunity Requirements:
${requirementsText.trim()}

Candidate Profile & Evidence:
${candidateProfile}`;

  const callCompletion = async (modelId) => {
    return fetch(`${NEBIUS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });
  };

  let response = await callCompletion(modelToUse);

  // If rejected with 400/404 indicating model issue, resolve from models list and retry
  if (!response.ok && (response.status === 400 || response.status === 404)) {
    const errorText = await response.text();
    console.warn(`[Nebius Token Factory] Model ${modelToUse} rejected:`, errorText);
    
    // Check if error is related to model ID
    if (/model|not found|invalid_request_error/i.test(errorText)) {
      const fallbackModel = await resolveNemotronModel(apiKey);
      if (fallbackModel && fallbackModel !== modelToUse) {
        modelToUse = fallbackModel;
        response = await callCompletion(modelToUse);
      } else {
        return {
          status: response.status,
          data: {
            success: false,
            error: `Nebius Token Factory API rejected model ${modelToUse}: ${errorText}`,
            provider: 'Nebius Token Factory',
            apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
            model: modelToUse
          }
        };
      }
    } else {
      return {
        status: response.status,
        data: {
          success: false,
          error: `Nebius Token Factory API error (${response.status}): ${errorText}`,
          provider: 'Nebius Token Factory',
          apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
          model: modelToUse
        }
      };
    }
  }

  if (!response.ok) {
    const errBody = await response.text();
    return {
      status: response.status || 502,
      data: {
        success: false,
        error: `Nebius Token Factory inference failed (${response.status}): ${errBody}`,
        provider: 'Nebius Token Factory',
        apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
        model: modelToUse
      }
    };
  }

  const completionData = await response.json();
  const rawContent = completionData.choices?.[0]?.message?.content || '';

  // Clean JSON response (strip markdown wrappers if model included them)
  const cleanJson = rawContent
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsedDecision;
  try {
    parsedDecision = JSON.parse(cleanJson);
  } catch {
    // Attempt regex extraction if extra text surrounds the JSON
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedDecision = JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        return {
          status: 502,
          data: {
            success: false,
            error: `Failed to parse Nemotron response from Nebius Token Factory: ${innerErr.message}`,
            rawResponse: cleanJson,
            provider: 'Nebius Token Factory',
            apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
            model: modelToUse
          }
        };
      }
    } else {
      return {
        status: 502,
        data: {
          success: false,
          error: 'Nebius Token Factory Nemotron model did not return a valid JSON object.',
          rawResponse: cleanJson,
          provider: 'Nebius Token Factory',
          apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
          model: modelToUse
        }
      };
    }
  }

  const items = (parsedDecision.items || []).map((item, idx) => ({
    id: `nebius-item-${idx}`,
    requirement: item.requirement || `Requirement ${idx + 1}`,
    status: (item.status || 'UNCLEAR').toUpperCase(),
    reqType: 'Required',
    explanation: item.explanation || '',
    evidence: item.evidence || 'Evaluated by Nemotron',
    evidenceSource: item.evidence || 'Evaluated by Nemotron',
    evidenceType: 'nebius-nemotron'
  }));

  const matchedCount = items.filter(i => i.status === 'MET').length;
  const unmetCount = items.filter(i => i.status === 'NOT MET').length;
  const unclearCount = items.filter(i => i.status === 'UNCLEAR').length;
  const total = items.length || 1;
  const percentMatch = typeof parsedDecision.percentMatch === 'number'
    ? parsedDecision.percentMatch
    : Math.round((matchedCount / total) * 100);

  return {
    status: 200,
    data: {
      success: true,
      provider: 'Nebius Token Factory',
      apiUrl: `${NEBIUS_BASE_URL}/chat/completions`,
      model: modelToUse,
      evaluatedAt: new Date().toISOString(),
      report: {
        totalRequirements: total,
        matchedCount,
        unmetCount,
        unclearCount,
        percentMatch,
        summaryText: `${matchedCount} of ${total} requirements met`,
        items,
        nextStep: parsedDecision.nextStep || 'Review qualifications and proceed to preparation.',
        nebiusVerified: true,
        provider: 'Nebius Token Factory',
        model: modelToUse,
        apiUrl: `${NEBIUS_BASE_URL}/chat/completions`
      }
    }
  };
}

/**
 * Standard Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid JSON request body.' });
    }
  }

  const apiKey = process.env.NEBIUS_API_KEY;
  const result = await handleNebiusMatchRequest(body, apiKey);

  return res.status(result.status).json(result.data);
}
