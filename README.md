# ZeroLeak: Blockchain-Based Dynamic Examination Paper Generation System

ZeroLeak is a next-generation secure examination infrastructure platform designed to prevent large-scale exam paper leaks in high-stakes tests (e.g., NEET, JEE, UPSC, and board examinations). 

The platform implements the core design principle: **NO FINAL EXAM PAPER SHOULD EXIST BEFORE EXAM TIME**. Instead of storing pre-generated exam sheets on disk or central clouds (where they can be leaked by administrative insiders or database hackers), ZeroLeak dynamically mixes decentralized entropy sources at runtime to select items from a cryptographically secure redundant repository and validates selections against an immutable blockchain ledger.

---

## 🏗️ System Architecture & Cryptographic Model

### 1. The Redundancy Pool ($N = X \times n$)
To prevent entropy-searching or direct memory analysis leaks, the final exam sheet containing $X$ questions is selected from a large pool of $N$ questions:
* Let $X$ be the target exam size (e.g., 10 questions).
* Let $n$ be the redundancy multiplier (e.g., 20).
* The active pool size $N = X \times n = 200$ fully encrypted questions.

### 2. Entropy Mixing Formula
At the exact release time ($T$), the generation agent aggregates four independent entropy blocks to calculate a unique hash $r$:

$$r = \text{SHA-256}(T + H + S + E)$$

Where:
* $T$: Precise Unix Millisecond release timestamp.
* $H$: Cryptographic hash of the latest transaction block on the verification chain.
* $S$: High-entropy secret key shared across distributed HSM nodes.
* $E$: Salt value siphoned from random mouse movements or environment pools at the active examination center.

The hash $r$ is used to seed a cryptographically secure PRNG that runs a modulo selection index selector over $N$.

### 3. Verification Chain
Each block on the verification chain corresponds to an ingested question and contains:
`[Block Index, Question Hash, Metadata (Subject, Topic, Difficulty), Validator ECDSA Signature, Previous Block Hash, Hash]`

This ledger prevents unauthorized question changes or direct database manipulations.

---

## 🤖 Multi-Agent Orchestrator

The system operates using an event-driven loop coordinated by **9 autonomous agents**:

1. **Question Ingestion Agent:** Validates drafts, tags difficulty, runs duplicate detectors, encrypts content (AES-256-GCM), and signs headers.
2. **Blockchain Verification Agent:** Links blocks, signs hashes, and validates ledger link integrity.
3. **Dynamic Paper Generation Agent:** Gathers entropy, executes seeded PRNG selections, and checks results against the ledger.
4. **Security Monitoring Agent:** Rates systemic threat alerts and manages global safety scoring.
5. **Time-Lock Authorization Agent:** Blocks early key decryption requests and enforces temporal locks.
6. **Audit & Forensics Agent:** Links administrative actions into an immutable, hashed audit timeline.
7. **Examination Delivery Agent:** Packages exam sheets and manages center tickets.
8. **AI Anomaly Detection Agent:** Inspects client signatures and flags atypical behaviors (IPs/user agents).
9. **Load Balancing & Distribution Agent:** Syncs ledger nodes across regional edge directories.

---

## ⚡ Quick Start

The platform supports both **Local Standalone Run** and **Dockerized Orchestration**.

### Option A: Local Dev Command (Recommended for Instant Demo)

1. **Start the NestJS Backend:**
   ```bash
   cd backend
   npm run start
   ```
   *The backend runs on `http://localhost:5001`. It will auto-generate a `db.json` database in the root folder pre-seeded with 400 questions.*

2. **Start the Next.js Frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   *The frontend runs on `http://localhost:3000`.*

3. Open **`http://localhost:3000`** in your browser.

---

### Option B: Docker Compose

Launch both services simultaneously:
```bash
docker-compose up --build
```

---

## 🧪 Simulation Runbook

1. **Authenticate:** Click **Launch Terminal** on the Landing Page. Enter role `SuperAdmin` and enter MFA code **`123456`**.
2. **Ingest Questions:** Navigate to the **Encrypted Repository**. Fill the form and click *Ingest*. Inspect the new entry to see it encrypted in real-time.
3. **Inspect Ledger:** Open **Ledger Explorer**. Select blocks to read raw JSON headers in the Monaco Editor. Click *Verify Ledger Health* to run cryptographic integrity checks.
4. **Generate Exam:** Open the **Paper Generator**. Select an exam (e.g. *JEE Physics*) and click *Trigger Dynamic Generation*. Watch the multi-agent pipeline execute.
5. **Test Delivery Decrypter:** Open **Delivery Decrypter**. Select the exam and click *Decrypt Paper*. 
6. **Run Attacks:** Open the **Threat Monitor (SOC)** panel. Trigger any of the simulated attacks:
   * *Insider Database Tampering:* Edits database records directly. Go back to the *Ledger Explorer* and run *Verify Ledger Health* — the verification agent will detect the tampering and sound critical alarms.
   * *Unauthorized Early Decryption Check:* Attempts early decryption, triggering a Security Monitoring agent block.
   * *Compromised Admin Token:* Sends a request from a blocked subnet. The AI Anomaly agent spikes the threat rating and stops key release.
