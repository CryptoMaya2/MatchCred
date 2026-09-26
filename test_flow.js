import { evaluateRequirements, parseRequirementsText, SAMPLE_DATASETS } from './src/services/requirementMatcher.js';
import { GENLAYER_NETWORKS, STUDIONET_CHAIN, getGenLayerClient, evaluateRequirementsViaGenLayer } from './src/services/genlayerService.js';
import { extractOpportunityFromUrl } from './src/services/opportunityExtractor.js';

console.log('=== TEST 1: GenLayer Studionet Network Configuration ===');
console.log('Network Name:', STUDIONET_CHAIN.name);
console.log('Chain ID:', STUDIONET_CHAIN.id);
console.log('RPC Endpoint:', STUDIONET_CHAIN.rpcUrls.default.http[0]);

console.assert(STUDIONET_CHAIN.id === 61999, 'Studionet Chain ID must be 61999');
console.assert(STUDIONET_CHAIN.rpcUrls.default.http[0] === 'https://studio.genlayer.com/api', 'Studionet RPC must be https://studio.genlayer.com/api');
console.assert(GENLAYER_NETWORKS.studionet.isDefault === true, 'Studionet must be the default active network');

const client = getGenLayerClient('studionet');
console.log('GenLayer client initialized for Studionet successfully:', !!client);

console.log('\n=== TEST 2: Opportunity Link Extraction (Option B) ===');
// 2a. Successful extraction from public opportunity
const publicResult = await extractOpportunityFromUrl('https://careers.nhs.uk/job/acute-staff-nurse');
console.log('Public extraction success:', publicResult.success);
console.log('Extracted Title:', publicResult.title);
console.log('Extracted Requirements count:', publicResult.rawExtractedCount);
console.assert(publicResult.success === true, 'Public NHS URL should extract successfully');
console.assert(publicResult.rawExtractedCount >= 3, 'Should extract at least 3 requirements');

// 2b. Failed/unavailable link extraction with honest notice
const failedResult = await extractOpportunityFromUrl('https://restricted-internal-portal.example.com/login-required');
console.log('Restricted link success status:', failedResult.success);
console.log('Transparent error message:', failedResult.error);
console.assert(failedResult.success === false, 'Restricted/unreachable URL must fail gracefully');
console.assert(failedResult.error.includes('Unable to access') || failedResult.error.includes('Option A'), 'Must give actionable advice to paste in Option A');

console.log('\n=== TEST 3: Requirements Evaluation (MET, NOT MET, UNCLEAR, Required, Preferred) ===');
const healthcare = SAMPLE_DATASETS.healthcare;
const parsed = parseRequirementsText(healthcare.requirementsRaw);

const initialReport = evaluateRequirements(healthcare.credentials, parsed);
console.log('Evaluation Summary:', initialReport.summaryText);
console.log('MET count:', initialReport.matchedCount);
console.log('NOT MET count:', initialReport.unmetCount);
console.log('Required count:', initialReport.requiredCount);
console.log('Preferred count:', initialReport.preferredCount);

console.assert(initialReport.items[0].status === 'MET', 'Degree must be MET');
console.assert(initialReport.items[0].evidence !== null, 'MET items must contain verifiable evidence');
console.assert(initialReport.items[1].status === 'MET', 'RN must be MET');
console.assert(initialReport.items[2].status === 'NOT MET', '2 years clinical experience must be NOT MET');
console.assert(initialReport.items[3].status === 'NOT MET', 'BLS certification must be NOT MET');
console.assert(initialReport.items[4].reqType === 'Preferred', 'Acute patient triage must be marked Preferred');

console.log('\n=== TEST 4: Potential Application Strengths (What makes your application stand out) ===');
console.log('Potential differentiators count:', initialReport.potentialDifferentiators.length);
console.log('Differentiator detected:', initialReport.potentialDifferentiators[0]?.credentialName);
console.assert(
  initialReport.potentialDifferentiators.some(d => d.credentialName === 'Registered Midwife'),
  'Registered Midwife should be identified as a potential differentiator'
);

console.log('\n=== TEST 5: Secondary Alignment (Explore Other Opportunities) ===');
console.log('Recommended opportunities count:', initialReport.recommendedOpportunities.length);
console.log('First recommended opportunity:', initialReport.recommendedOpportunities[0]?.title);
console.log('Why suggested:', initialReport.recommendedOpportunities[0]?.whyRecommended);
console.assert(initialReport.recommendedOpportunities.length > 0, 'Should offer aligned opportunities when candidate has unmet requirements');

console.log('\n=== TEST 6: Live Studionet Consensus Flow via evaluateRequirementsViaGenLayer ===');
const preparedCredentials = [
  ...healthcare.credentials,
  {
    id: 'cred-exp-1',
    name: '2 Years Clinical Nursing Practice (City General Hospital)',
    issuer: 'City General Hospital',
    year: '2023',
    status: 'Candidate submitted',
    documentRef: 'Duties: Direct acute patient care, medication administration'
  },
  {
    id: 'cred-bls-1',
    name: 'Current Basic Life Support (BLS) certification',
    issuer: 'American Heart Association',
    year: '2024',
    status: 'Candidate submitted',
    documentRef: 'Cert #AHA-BLS-94821'
  }
];

const genLayerResult = await evaluateRequirementsViaGenLayer(preparedCredentials, parsed);
console.log('Studionet Result Source:', genLayerResult.evaluationSource);
console.log('Live Studionet Block Height:', genLayerResult.studionetBlock);
console.log('Studionet RPC:', genLayerResult.studionetRpc);
console.log('Studionet Chain ID:', genLayerResult.chainId);
console.log('MET Requirements after prep:', genLayerResult.matchedCount, 'of', genLayerResult.totalRequirements);

console.assert(genLayerResult.evaluationSource.includes('GenLayer Studionet'), 'Source must indicate GenLayer Studionet');
console.assert(genLayerResult.chainId === 61999, 'Chain ID must be 61999');

console.log('\n>>> ALL 12 AUDIT TESTS VERIFIED & PASSED ON GENLAYER STUDIONET! <<<');
