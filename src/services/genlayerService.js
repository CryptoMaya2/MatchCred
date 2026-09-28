import { createClient, chains } from 'genlayer-js';
import { evaluateRequirements, parseRequirementsText } from './requirementMatcher.js';

export const CONTRACT_ADDRESS = (import.meta.env.VITE_GENLAYER_CONTRACT_ADDRESS || '0xE93A364A11b8e41615042921798303a9FBa2132f').trim();
export const CONTRACT_READY = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

export async function evaluateRequirementsViaGenLayer(credentials = [], requirements = [], cvData = null) {
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
  const evidence = credentials.map(({ name, issuer, year }) => ({ name, issuer, year, status: 'Candidate submitted' }));
  const txHash = await client.writeContract({
    address: CONTRACT_ADDRESS, functionName: 'evaluate_requirements',
    args: [reviewId, JSON.stringify(evidence), JSON.stringify(parsed)],
  });
  const receipt = await client.waitForTransactionReceipt({ hash: txHash, status: 'FINALIZED' });
  if (receipt.statusName !== 'FINALIZED' || receipt.txExecutionResultName !== 'SUCCESS') throw new Error(`GenLayer review failed: ${receipt.statusName || 'transaction not accepted'}`);
  const raw = await client.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_review', args: [reviewId] });
  const reviewed = JSON.parse(raw);
  if (!Array.isArray(reviewed) || reviewed.length !== parsed.length) throw new Error('Contract returned an incomplete review.');
  const items = localReport.items.map((item, index) => ({ ...item, status: reviewed[index].status, explanation: reviewed[index].explanation }));
  return {
    ...localReport, items,
    matchedCount: items.filter(item => item.status === 'MET').length,
    unmetCount: items.filter(item => item.status === 'NOT MET').length,
    unclearCount: items.filter(item => item.status === 'UNCLEAR').length,
    evaluationSource: 'GenLayer Studionet consensus', genLayerVerified: true,
    transactionHash: txHash, contractAddress: CONTRACT_ADDRESS,
  };
}

export const GENLAYER_NETWORKS = { studionet: { rpcUrl: 'https://studio.genlayer.com/api' } };
export async function testGenLayerConnection() {
  try {
    const response = await fetch(GENLAYER_NETWORKS.studionet.rpcUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
    });
    const data = await response.json();
    return data.error ? { ok: false, message: data.error.message } : { ok: true, message: `RPC reachable (chain ${parseInt(data.result, 16)}). This does not verify an evaluation.` };
  } catch (error) { return { ok: false, message: `RPC unavailable: ${error.message}` }; }
}
