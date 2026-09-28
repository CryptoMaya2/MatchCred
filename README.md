# MatchCred

An eligibility assessment for jobs, scholarships, and fellowships. Candidates enter credentials or upload a CV, compare them with opportunity requirements, and review a preparation plan.

## Current modes

- **Local preview:** Works without a wallet or contract. Uses rule-based matching in the browser. Results are clearly marked as local.
- **GenLayer consensus review:** Enabled by the deployed Studionet address in the application. Override with `VITE_GENLAYER_CONTRACT_ADDRESS` if deploying a newer version. Connects a wallet on Studionet, submits a write transaction, waits for finalization, then reads the stored review. Failed or rejected transactions show an error, never a fake verified result.

**Important:** A candidate can type any qualification. MatchCred does not yet verify issuance with universities, licensing bodies, or employers. GenLayer consensus assesses supplied evidence against requirements; it does not establish whether the evidence is authentic. The onchain path sends manually entered credential names, issuers, years, statuses and requirements to a public chain. CV uploads are blocked from the onchain path because they can contain private information.

## Run locally

```bash
npm ci
cp .env.example .env
npm run dev
```

## Deploy the intelligent contract

The source is [`contracts/MatchCred.py`](contracts/MatchCred.py). The old `gl.llm_call` view implementation has been replaced with a state-changing function using `gl.nondet.exec_prompt` under `gl.eq_principle.prompt_comparative` and a read function to retrieve finalized decisions.

1. Open [GenLayer Studio](https://studio.genlayer.com/) and connect the wallet that will own the deployment. Ensure the environment is **Studionet**, chain ID **61999**.
2. Paste `contracts/MatchCred.py` into Studio and deploy. Wait for a successful finalized deployment, then copy the **contract address** from Studio. A source file or transaction hash alone is not a deployed address.
3. Put `VITE_GENLAYER_CONTRACT_ADDRESS=0x...` in `.env` locally and in the frontend hosting environment. Rebuild the frontend (`npm run build`). Never commit private keys or seed phrases.
4. Submit a short, non-sensitive credential and one requirement from two different wallets to verify `evaluate_requirements` and `get_review`; check the transaction in Studio. Validate the deployed schema if Studio reports an SDK or GenVM compatibility error.

Deployment requires a funded, connected wallet. Studionet deployment `0xE93A364A11b8e41615042921798303a9FBa2132f` finalized and a sample consensus review finalized successfully. Studio may reset; use Bradbury for a persistent testnet submission after Studio validation, and update the frontend network configuration to Bradbury if deploying there.

## Build

```bash
npm run build
```
