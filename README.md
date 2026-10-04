# MatchCred

An eligibility assessment for jobs, scholarships, and fellowships. Candidates enter credentials or upload a CV, compare them with opportunity requirements, and review a preparation plan.

## Current modes

- **Local preview:** Works without a wallet or contract. Uses rule-based matching in the browser. Results are clearly marked as local.
- **Simulated Alexa+ experience (`/alexa`):** An ambient voice-and-screen interface simulating Alexa+ smart display interactions (no official Alexa SDK required). Users can tap or ask *"Alexa, do I qualify for this fellowship?"*. The interface verifies if credentials or opportunity text are present (prompting for them only if not already loaded), evaluates eligibility via MatchCred's matching engine, and presents plus speaks the verdict (percent match, met, unclear, not met, and next steps) using browser speech synthesis with a complete text fallback. Includes a one-click *"Try the example"* flow wired to the sample fellowship.
- **GenLayer consensus review:** Enabled by the deployed Studionet address in the application. Override with `VITE_GENLAYER_CONTRACT_ADDRESS` if deploying a newer version. Connects a wallet on Studionet, submits a write transaction, waits for finalization, then reads the stored review. Failed or rejected transactions show an error, never a fake verified result.
- **Nebius Token Factory (NVIDIA Nemotron):** Third evaluation mode built for the *Nebius x NVIDIA Global AI Hackathon (Best Apps and Agents)*. Calls an NVIDIA open model served on Nebius Token Factory (`nvidia/Nemotron-3-Ultra-550b-a55b`) via the secure server route `/api/nebius-match`. Returns structured JSON containing percent match, requirement evidence sentences, and actionable next steps.

**Important:** A candidate can type any qualification. MatchCred does not yet verify issuance with universities, licensing bodies, or employers. GenLayer consensus assesses supplied evidence against requirements; it does not establish whether the evidence is authentic. The onchain path sends manually entered credential names, issuers, years, statuses and requirements to a public chain. CV uploads are blocked from the onchain path because they can contain private information.

## Run locally

```bash
npm ci
cp .env.example .env
npm run dev
```

Navigate to:
- Main Web App: `http://localhost:5173`
- Simulated Alexa+ Experience: `http://localhost:5173/alexa`

## Simulated Alexa+ Experience (`/alexa`)

MatchCred includes a dedicated **Simulated Alexa+ experience** accessible directly at `/alexa` (or via the header and landing page navigation links).

- **Purpose:** Demonstrates voice-first multimodal eligibility evaluation without requiring gated Alexa+ developer tools, AWS Lambda ASK endpoints, or account linking.
- **Workflow:**
  1. The user taps or speaks: *"Alexa, do I qualify for this fellowship?"* (or uses their microphone).
  2. If credentials or requirements are missing, Alexa prompts for them and displays an on-screen drawer for quick CV paste or credential entry.
  3. If loaded, Alexa calls MatchCred's evaluation engine and displays a rich generative UI card while speaking the result aloud using browser speech synthesis (`window.speechSynthesis`).
  4. The verdict clearly covers **percent match**, count of requirements **MET**, **UNCLEAR**, and **NOT MET**, followed by the recommended **next step** (e.g. entering MatchCred's *“Help Me Prepare”* mode).
  5. Includes a one-click **“Try the example”** button pre-wired to the sample Product Design Fellowship with candidate credentials.
  6. Maintains full text fallbacks and voice mute controls for accessibility.

## Deploy the intelligent contract

The source is [`contracts/MatchCred.py`](contracts/MatchCred.py). The old `gl.llm_call` view implementation has been replaced with a state-changing function using `gl.nondet.exec_prompt` under `gl.eq_principle.prompt_comparative` and a read function to retrieve finalized decisions.

1. Open [GenLayer Studio](https://studio.genlayer.com/) and connect the wallet that will own the deployment. Ensure the environment is **Studionet**, chain ID **61999**.
2. Paste `contracts/MatchCred.py` into Studio and deploy. Wait for a successful finalized deployment, then copy the **contract address** from Studio. A source file or transaction hash alone is not a deployed address.
3. Put `VITE_GENLAYER_CONTRACT_ADDRESS=0x...` in `.env` locally and in the frontend hosting environment. Rebuild the frontend (`npm run build`). Never commit private keys or seed phrases.
4. Submit a short, non-sensitive credential and one requirement from two different wallets to verify `evaluate_requirements` and `get_review`; check the transaction in Studio. Validate the deployed schema if Studio reports an SDK or GenVM compatibility error.

Deployment requires a funded, connected wallet. Studionet deployment `0xE93A364A11b8e41615042921798303a9FBa2132f` finalized and a sample consensus review finalized successfully. Studio may reset; use Bradbury for a persistent testnet submission after Studio validation, and update the frontend network configuration to Bradbury if deploying there.

## Nebius Token Factory

MatchCred includes an evaluation path integrated with **Nebius Token Factory**, built for the **Nebius x NVIDIA Global AI Hackathon (Track: Best Apps and Agents)**.

- **Primary Reasoning Model:** `nvidia/Nemotron-3-Ultra-550b-a55b`
- **Fallback Resolution:** If the primary ID is not recognized, the server queries `GET https://api.tokenfactory.nebius.com/v1/models` and selects the listed Nemotron 3 Ultra, Nemotron 3 Super, or Nemotron 3.5 Lightning ID.
- **Server Route:** `POST /api/nebius-match`
- **OpenAI-Compatible Base URL:** `https://api.tokenfactory.nebius.com/v1/`
- **Security:** `NEBIUS_API_KEY` is read strictly on the server (never exposed to the browser, never committed).

### How to Run One Match with Nemotron

1. **Configure your API key** in `.env` locally (or in your hosting provider's environment variables):
   ```bash
   NEBIUS_API_KEY=your_nebius_token_factory_key
   ```
2. **Start the local server:**
   ```bash
   npm run dev
   ```
3. **Run via the Web UI:**
   - Open `http://localhost:5173`
   - Click **Check your eligibility** and add credentials or load the sample fellowship.
   - On either the **Opportunity Requirements** screen or the **Eligibility Evaluation Report**, click the **"Match with Nemotron on Nebius ⚡"** button.
   - The screen will display:
     - Provider: **Nebius Token Factory**
     - Model ID: `nvidia/Nemotron-3-Ultra-550b-a55b` (or listed Nemotron ID)
     - API Endpoint: `https://api.tokenfactory.nebius.com/v1/chat/completions`
     - Evaluated criteria with evidence sentences and recommended next steps.
   - If the key is missing or invalid, an explicit error banner is displayed. MatchCred **never** silently falls back to the local matcher when Nebius is requested.

4. **Run via cURL (Direct API verification):**
   ```bash
   curl -X POST http://localhost:5173/api/nebius-match \
     -H "Content-Type: application/json" \
     -d '{
       "opportunityTitle": "Product Design Fellowship",
       "requirementsText": "* Bachelor degree in Design or related field\n* 1+ years UX prototyping experience",
       "credentials": [
         { "name": "Bachelor of Arts in Design", "issuer": "National Design Academy", "year": "2024", "status": "Institution verified" }
       ]
     }'
   ```
   The network response returns:
   ```json
   {
     "success": true,
     "provider": "Nebius Token Factory",
     "apiUrl": "https://api.tokenfactory.nebius.com/v1/chat/completions",
     "model": "nvidia/Nemotron-3-Ultra-550b-a55b",
     "report": {
       "percentMatch": 50,
       "matchedCount": 1,
       "unclearCount": 0,
       "unmetCount": 1,
       "items": [ ... ],
       "nextStep": "..."
     }
   }
   ```

## Build

```bash
npm run build
```

## License

This project is licensed under the terms of the [MIT License](LICENSE).

