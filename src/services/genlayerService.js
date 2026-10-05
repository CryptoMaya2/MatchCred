import { createClient, chains } from 'genlayer-js';
import { evaluateRequirements, parseRequirementsText } from './requirementMatcher.js';

export const CONTRACT_ADDRESS = (import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS || '0x4e071577C0A71c4710E9dAb1400FE881dCc5eBa1').trim();
export const CONTRACT_READY = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

export async function evaluateRequirementsViaGenLayer(credentials = [], requirements = [], cvData = null, opportunityUrl = '') {
  const parsed = Array.isArray(requirements) ? requirements : parseRequirementsText(requirements);
  const localReport = evaluateRequirements(credentials, parsed, cvData);
  if (!CONTRACT_READY) return { ...localReport, evaluationSource: 'Local eligibility preview', genLayerVerified: false };
  if (cvData) return { ...localReport, evaluationSource: 'Local CV eligibility preview', genLayerVerified: false };
  if (parsed.length > 20) throw new Error('GenLayer reviews support up to 20 requirements. Shorten the list and try again.');
  if (!window.ethereum) throw new Error('Connect a wallet to submit a GenLayer consensus review.');
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!account) throw new Error('No wallet account selected.');
  const client = createClient({ chain: chains.studionet, account, provider: window.ethereum });
  await client.connect('studionet');
  const reviewId = crypto.randomUUID();
  const evidence = credentials.map(({ name, issuer, year, documentRef, status }) => ({
    name,
    issuer,
    year,
    documentRef: documentRef || '',
    status: status || 'Candidate submitted',
  }));

  let txHash;
  try {
    // Attempt evaluation with live web source & provenance authentication
    txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'evaluate_requirements_with_provenance',
      args: [reviewId, JSON.stringify(evidence), JSON.stringify(parsed), opportunityUrl || ''],
    });
  } catch (err) {
    // Fallback to legacy function signature if contract deployed is prior version
    console.warn('evaluate_requirements_with_provenance unavailable, trying evaluate_requirements fallback:', err?.message);
    txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'evaluate_requirements',
      args: [reviewId, JSON.stringify(evidence), JSON.stringify(parsed)],
    });
  }

  const receipt = await client.waitForTransactionReceipt({ hash: txHash, status: 'FINALIZED' });
  if (receipt.statusName !== 'FINALIZED' || receipt.txExecutionResultName !== 'SUCCESS') {
    throw new Error(`GenLayer review failed: ${receipt.statusName || 'transaction not accepted'}`);
  }
  const raw = await client.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_review', args: [reviewId] });
  const reviewed = JSON.parse(raw);
  if (!Array.isArray(reviewed) || reviewed.length !== parsed.length) {
    throw new Error('Contract returned an incomplete review.');
  }

  const items = localReport.items.map((item, index) => {
    const rev = reviewed[index] || {};
    return {
      ...item,
      status: rev.status || item.status,
      explanation: rev.explanation || item.explanation,
      provenance: rev.provenance || (rev.status === 'MET' && opportunityUrl ? 'AUTHENTICATED_WEB_SOURCE' : 'SELF_REPORTED'),
      provenanceSource: opportunityUrl || null,
    };
  });

  const hasWebProvenance = Boolean(opportunityUrl || items.some(i => i.provenance === 'AUTHENTICATED_WEB_SOURCE'));

  return {
    ...localReport,
    items,
    matchedCount: items.filter(item => item.status === 'MET').length,
    unmetCount: items.filter(item => item.status === 'NOT MET').length,
    unclearCount: items.filter(item => item.status === 'UNCLEAR').length,
    evaluationSource: hasWebProvenance ? 'GenLayer Web Provenance Consensus' : 'GenLayer Studionet consensus',
    genLayerVerified: true,
    hasWebProvenance,
    opportunityUrl: opportunityUrl || null,
    transactionHash: txHash,
    contractAddress: CONTRACT_ADDRESS,
  };
}

export const GENLAYER_NETWORKS = {
  studionet: {
    rpcUrl: 'https://studio.genlayer.com/api',
    isDefault: true,
  },
};

export const STUDIONET_CHAIN = {
  id: 61999,
  name: 'GenLayer Studionet',
  rpcUrls: {
    default: { http: ['https://studio.genlayer.com/api'] },
  },
};

export function getGenLayerClient(_networkKey = 'studionet') {
  return createClient({ chain: chains.studionet });
}

export async function testGenLayerConnection() {
  try {
    const response = await fetch(GENLAYER_NETWORKS.studionet.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
    });
    const data = await response.json();
    return data.error
      ? { ok: false, message: data.error.message }
      : { ok: true, message: `RPC reachable (chain ${parseInt(data.result, 16)}). Web provenance enabled.` };
  } catch (error) {
    return { ok: false, message: `RPC unavailable: ${error.message}` };
  }
}
