# ⚖️ AI COURT — "Present Your Proof. Challenge the Truth."

> **A social courtroom debate and evidence-based argument game where human advocates compete against friends or AI opponents, adjudicated in real time by an impartial AI Magistrate.**

---

## 🏛️ Executive Summary & Concept

**AI Court** transforms logical argumentation, critical reasoning, and evidence analysis into an immersive competitive courtroom game. Players step into a virtual legal chamber, select a disputed case dossier or author their own, join private multiplayer lobbies with friends, choose opposing roles (**Prosecution** vs **Defense**), submit and challenge digital evidence exhibits, raise procedural objections, cross-examine opponents, and receive a comprehensive, reasoned verdict from an impartial AI Judge.

> [!IMPORTANT]
> **Fictional Simulation Notice:** AI Court is strictly an entertainment and critical-thinking game. All cases, exhibits, and AI Magistrate judgments are fictional simulations and do not constitute actual legal advice or judicial proceedings.

---

## 🎨 Visual Identity & Courtroom Design System

- **Atmosphere:** Deep obsidian and charcoal surfaces (`#080a0e`, `#11151c`), subtle glassmorphism panels with 16px backdrop blur, and directional ambient lighting.
- **Accents:** 
  - **Judicial Gold:** `#d4af37` / `#f5d77f` with ambient bloom.
  - **Prosecution Rose:** `#e11d48` / `#f43f5e` for the state/accuser bench.
  - **Defense Azure:** `#2563eb` / `#38bdf8` for the advocacy bench.
  - **Jury Amethyst:** `#9333ea` for deliberations.
- **Typography:** Classical serif headings powered by **Cinzel**, paired with high-legibility **Inter** for argument reading and **JetBrains Mono** for timestamps and telemetry.
- **Synthesized Audio Engine:** Built using the browser's native **Web Audio API** (`AudioContext`). Features zero-latency wooden gavel strikes, dramatic objection alarm chords, turn countdown clock ticks, and majestic verdict fanfares without external audio asset dependencies.

---

## ⚙️ 7-Phase Turn-Based Trial State Machine

Trials progress strictly through a validated 7-phase procedural cycle:

```
[Phase 1: Opening Statements]
       │ Theory of the Case & Primary Accusation
       ▼
[Phase 2: Evidence Submission]
       │ Introduce Telemetry, Chat Logs, Receipts, Forensics
       ▼
[Phase 3: Evidence Examination]
       │ Inspect Admissibility & Challenge Reliability
       ▼
[Phase 4: Cross-Examination]
       │ Interrogate Gaps & Chronological Coincidences
       ▼
[Phase 5: Direct Rebuttal]
       │ Counter Opposing Syllogisms & Disprove Narratives
       ▼
[Phase 6: Closing Arguments]
       │ Synthesize Final Record for the Magistrate
       ▼
[Phase 7: AI Magistrate Verdict]
       │ Objective Scoring, Detailed Judgment & Elo Updates
```

---

## 🧠 AI Magistrate & Adversary Architecture

### 1. The AI Judge
- **Neutral & Transparant:** Evaluates arguments based on **Reasoning (/35)**, **Evidence Usage (/30)**, **Counterargument Handling (/25)**, and **Decorum (/10)** for a total of **100 points**. Does not reward aggression, word volume, or prompt injection.
- **Procedural Objections:** Evaluates four legal grounds:
  - `Unsupported Claim`: Asserts unevidenced facts as settled truth.
  - `Irrelevant`: Statement wanders outside the disputed facts dossier.
  - `Contradiction`: Clashes directly with admitted exhibits.
  - `Speculation`: Guesses subjective mental states or feelings without testimony.
- **Prompt Injection Defense:** Input sanitization redacts system commands, developer mode triggers, and instruction overrides (`[REDACTED_PROMPT_INJECTION]`), treating all submissions strictly as untrusted courtroom testimony.
- **Dual Engine Strategy:** 
  - **Default Built-in Magistrate:** High-intelligence rule-based heuristic evaluator requiring **zero external API keys** and running 100% offline.
  - **Google Gemini API Integration:** Toggleable in Settings (`VITE_GEMINI_API_KEY` or custom key), generating real-time dynamic LLM rulings and personalized critiques.

### 2. AI Opponent Personalities & Difficulties
- **Difficulties:** Beginner (10 min), Intermediate (15 min), Expert (20 min).
- **Personalities:**
  - `Calm Analyst`: Data-centric, quotes timestamps, calculates probabilities, dispassionate.
  - `Aggressive Debater`: Passionate trial attorney, sharp counter-punches, pressuring rhetorical questions.
  - `Witty Lawyer`: Charismatic litigator, ironic analogies, vivid idioms, grounded legal flair.
  - `Master Strategist`: Anticipates counterarguments, turns opponent's evidence against them.

---

## 📁 Pre-Seeded Case Library

The application includes rich, multi-perspective cases across all required categories:
1. **Everyday & Friendship Drama:** *The Stolen Wagyu & The Broken Dorm Pact*
2. **School & College Controversies:** *The Leaked Algorithms Exam & The Discord Ghost*
3. **Technology, AI & Media:** *The Synthetic Scandal: Deepfake or Caught On Camera?*
4. **Mystery & Detective:** *The Blackwood Manor Diamond Heist*
5. **Ethics & Philosophy:** *The Dilemma of Unit 7: Autonomous Trolley Logic*
6. **Business & Startups:** *The Poached CTO & The 30GB Cloud Transfer*
7. **Historical What-If:** *The Inquest of Galileo: Telescopes vs Dogma*
8. **Absurd & Funny:** *The Case of the "Haunted" Velvet Sofa*
9. **Custom Cases:** Integrated creator with AI auto-drafting assistance.

---

## 🌐 Multiplayer Friend Lobbies & Synchronization

- **Room Codes & Direct Links:** Create a lobby with a unique 6-character code (e.g., `7X9K2M`) and shareable link (`?lobby=7X9K2M`).
- **Flexible Bench Roster:** Prosecution, Defense, Judge, Jury, and Spectators.
- **Realtime Synchronization:**
  - **Supabase Realtime Channel:** Broadcasts turns, chat, and evidence updates when Supabase is configured.
  - **Cross-Tab BroadcastChannel:** Built-in zero-config fallback enabling two players to test and play multiplayer seamlessly in two separate browser windows or tabs on the same machine!
- **AI Auto-Fill:** Hosts can add AI bot advocates to fill unoccupied seats with customizable difficulty.

---

## 🏆 Gamification & Competitive Progression

- **Elo Rating Engine:** Standard competitive Elo implementation ($K=32$) adjusting ratings based on match results and confidence margins.
- **Rank Titles:**
  - 🌟 **Grandmaster** (1500+ ELO)
  - ⚖️ **Senior Counsel** (1350 – 1499 ELO)
  - 📜 **Litigator** (1200 – 1349 ELO)
  - 🛡️ **Advocate** (1050 – 1199 ELO)
  - 🔰 **Rookie** (<1050 ELO)
- **Earned Badges:** `Logic Master` (>30 reasoning), `Evidence Expert` (>25 evidence score), `Perfect Rebuttal`, `First Victory`, `Trial Veteran`.
- **Match History:** Persistent records with match replay summaries and score differentials.

---

## 🛠️ Tech Stack & Directory Structure

```
ai-court/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Brand header, profile pill, audio & settings
│   │   ├── LandingPage.tsx        # Cinematic hero, trending trials, dockets
│   │   ├── CaseBrowser.tsx        # Search, category filters, random case
│   │   ├── CustomCaseModal.tsx    # Fictional case authoring & AI draft
│   │   ├── LobbyView.tsx          # Private lobbies, role selection, chat
│   │   ├── Courtroom.tsx          # 7-phase trial chamber, timer, argument dock
│   │   ├── VerdictView.tsx        # Confetti, score breakdown, judge's opinion
│   │   ├── ProfileModal.tsx       # User stats, rank, Elo, badges, history
│   │   ├── AuthModal.tsx          # Supabase Auth + Guest practice mode
│   │   ├── SettingsModal.tsx      # Audio, LLM provider, API key, Supabase status
│   │   └── LeaderboardView.tsx    # Global bar standings and tier filters
│   ├── data/
│   │   └── cases.ts               # Seed case scenarios with evidence exhibits
│   ├── services/
│   │   ├── aiJudge.ts             # Judicial evaluation & objection ruling engine
│   │   ├── aiOpponent.ts          # Adversary debate generation
│   │   ├── multiplayer.ts         # BroadcastChannel & Supabase Realtime sync
│   │   ├── sound.ts               # Web Audio API procedural sound effects
│   │   ├── storage.ts             # LocalStorage & profile management
│   │   └── supabase.ts            # Supabase client & Auth helper
│   ├── tests/
│   │   ├── court.test.ts          # Integration tests for state machine & scoring
│   │   └── runDiagnostics.ts      # Automated diagnostic runner
│   ├── types/
│   │   └── court.ts               # Complete TypeScript data contracts
│   ├── App.tsx                    # Top-level view router & state conductor
│   ├── main.tsx                   # React 18 DOM mount
│   └── index.css                  # Tailwind styles & courtroom glow utilities
├── supabase/
│   └── migrations/
│       └── 20261020000000_init_ai_court.sql  # Normalized PostgreSQL schema & RLS
├── .env.example                   # Environment configuration template
├── tailwind.config.js             # Courtroom dark theme & custom animations
└── package.json                   # Dependencies and npm scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### 2. Installation & Running Locally
```bash
# Clone or navigate to the project directory
cd ai-court

# Install dependencies
npm install

# Run self-diagnostic tests (verifies seed cases, objections, verdicts, Elo)
npm test

# Launch Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Testing 2-Player Multiplayer Locally
1. Launch the app in **Browser Window A**. Click **Play with Friends** -> **Create Private Lobby**.
2. Copy the 6-character Join Code (or copy the shareable link).
3. Open an **Incognito Window** or **Browser Window B** at `http://localhost:5173`.
4. Click **Multiplayer Lobbies** -> Enter the Join Code -> Click **Join Lobby**.
5. Window A claims **Prosecution**; Window B claims **Defense**.
6. Both toggle **Ready** -> Host clicks **COMMENCE TRIAL**.
7. Both windows will enter the live synchronized trial chamber!

---

## 🗄️ Supabase Configuration (Optional Production Backend)

To enable live cloud authentication, PostgreSQL persistence, and cross-device realtime synchronization:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and execute the migration script located at:
   `supabase/migrations/20261020000000_init_ai_court.sql`
3. Copy your project URL and public Anon key.
4. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   ```
5. *(Optional)* Add your Gemini API key for live generative AI:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...
   ```

---

## 🧪 Automated Test Suite

Run the full diagnostic suite at any time:
```bash
npm test
```
The test suite validates:
- [x] Seed cases and disputed facts integrity
- [x] Lobby creation, join codes, and multi-player assignments
- [x] AI opponent procedural argument generation
- [x] AI Magistrate objection evaluation and rulings
- [x] Verdict generation, confidence ratings, and score breakdowns
- [x] Elo rating adjustment and XP progression formulas

---

## 🛡️ Content Safety & Legal Disclaimer

- **No Real Legal Claims:** AI Court simulates fictional debate. Rulings must not be construed as legal advice.
- **Fair Play & Anti-Abuse:** No cash gambling, wagering, or pay-to-win advantages.
- **Untrusted Input Safeguards:** All player arguments and custom case submissions are treated as untrusted text. Prompt-injection patterns are actively scrubbed prior to AI evaluation.
