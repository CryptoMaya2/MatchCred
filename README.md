# MatchCred

**Verify your eligibility before you apply.**  
Instant credential verification, candidate CV extraction, and application preparation powered by GenLayer Studionet consensus.

---

## Overview

MatchCred helps people check whether their qualifications and credentials meet the criteria of jobs, scholarships, fellowships, grants, and academic programs before submitting an application.

### Key Capabilities

1. **Flexible Entry Paths (Credentials, CV, or Both)**:
   - **Option 1: Add Credentials**: Enter academic degrees, licenses, and certifications with verifiable institutional references.
   - **Option 2: Upload CV**: Upload a CV in PDF or DOCX format (or paste text) to extract education, experience, skills, certifications, projects, volunteer work, and leadership.
   - **Option 3: Use Both**: Combine CV-extracted experience and skills with verified institutional credentials.

2. **Strict Verification Distinction**:
   - `✓ Verified Credential`: Independently verified by issuing institutions.
   - `📄 Candidate CV (Unverified)`: Self-reported claims extracted from applicant CVs.

3. **Transparent Eligibility Decisions**:
   - `MET`, `NOT MET`, and `UNCLEAR` statuses with explicit evidence sources for each requirement.

4. **Experience Gap Analysis & "Help Me Prepare"**:
   - Detects shortfalls (e.g. 2 years documented vs. 3 years required) and guides candidates through targeted questions to document missing experience, build an actionable roadmap, and generate a tailored application CV.

5. **GenLayer Studionet Integration**:
   - Connected to **GenLayer Studionet** (Chain ID: `61999`, RPC: `https://studio.genlayer.com/api`) for decentralized intelligent contract evaluation.

---

## Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide React, Vanilla CSS
- **Document Extraction**: `pdfjs-dist` (PDF), `mammoth` (DOCX)
- **Web3 / Intelligent Contracts**: GenLayer Studionet SDK, Python Intelligent Contracts (`contracts/MatchCred.py`)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
git clone https://github.com/CryptoMaya2/MatchCred.git
cd MatchCred
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

```env
VITE_GENLAYER_NETWORK=studionet
VITE_GENLAYER_CHAIN_ID=61999
VITE_GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

---

## License

MIT
