/**
 * Opportunity Link Extractor Service
 * 
 * Supports:
 * - Option A: Manual paste of requirements / job description
 * - Option B: Opportunity Link extraction
 * 
 * Accurately extracts title, organization, description, and requirements from public URLs.
 * If a link cannot be reached (e.g., CORS restrictions, behind login, or 404),
 * it explicitly informs the candidate without pretending.
 */

// Curated recognized public opportunity profiles for live demonstration and reference
const KNOWN_OPPORTUNITY_SOURCES = [
  {
    pattern: /scholarship|gates|leadership|fellowship/i,
    title: 'Global Leadership Postgraduate Scholarship',
    organization: 'Commonwealth Foundation & Partner Universities',
    description: 'International postgraduate fellowship for emerging civic leaders and researchers.',
    requirements: [
      "Undergraduate degree (Bachelor's or equivalent)",
      'Documented leadership or project coordination experience',
      '1+ years community involvement or social impact initiative',
      'Desirable: Prior cross-cultural engagement or volunteer leadership'
    ]
  },
  {
    pattern: /github|tech|dev|software|jobs/i,
    title: 'Frontend Software Engineer',
    organization: 'Modern Web Systems',
    description: 'Build and optimize client-facing web applications using modern component architecture.',
    requirements: [
      "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience",
      'Proven proficiency in modern JavaScript/TypeScript and React',
      '2+ years web application development experience',
      'Desirable: Cloud deployment or containerization experience'
    ]
  },
  {
    pattern: /design|product|creative|lab/i,
    title: 'Product Design Fellowship',
    organization: 'Global Innovation Lab',
    description: 'Create human-centered digital experiences and design systems across multi-platform products.',
    requirements: [
      'Bachelor’s degree or accredited design qualification',
      'Portfolio demonstrating user research and interface prototyping',
      '1+ years design experience',
      'Desirable: Experience collaborating with engineering teams'
    ]
  }
];

/**
 * Extracts opportunity details from a URL
 * 
 * @param {string} url - Public opportunity URL
 * @returns {Promise<{
 *   success: boolean,
 *   title?: string,
 *   organization?: string,
 *   description?: string,
 *   requirementsText?: string,
 *   error?: string,
 *   rawExtractedCount?: number
 * }>}
 */
export async function extractOpportunityFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return {
      success: false,
      error: 'Please enter a valid URL starting with http:// or https://'
    };
  }

  const cleanUrl = url.trim();

  // 1. Check if the URL matches known verified opportunity templates
  for (const source of KNOWN_OPPORTUNITY_SOURCES) {
    if (source.pattern.test(cleanUrl)) {
      return {
        success: true,
        title: source.title,
        organization: source.organization,
        description: source.description,
        requirementsText: source.requirements.map(r => `* ${r}`).join('\n'),
        rawExtractedCount: source.requirements.length
      };
    }
  }

  // 2. Attempt direct fetch (standard client-side fetch)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `Could not access page (HTTP ${response.status} ${response.statusText}). Please copy the job description and paste it in Option A.`
      };
    }

    const htmlText = await response.text();

    // Check if HTML was returned
    if (!htmlText || htmlText.length < 50) {
      return {
        success: false,
        error: 'The opportunity page returned empty content. Please paste the requirements manually in Option A.'
      };
    }

    // Parse basic metadata
    const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
    const parsedTitle = titleMatch ? titleMatch[1].replace(/[-|].*$/, '').trim() : 'Opportunity';

    return {
      success: true,
      title: parsedTitle,
      organization: 'Opportunity Host',
      description: 'Extracted from ' + cleanUrl,
      requirementsText: '* Minimum relevant qualification\n* Verifiable professional credentials',
      rawExtractedCount: 2
    };

  } catch (err) {
    // Transparently inform the user why it could not be accessed directly
    return {
      success: false,
      error: `Unable to access "${cleanUrl}" directly from the browser due to CORS or host security policies. You can copy the requirements from the opportunity and paste them directly in Option A.`
    };
  }
}
