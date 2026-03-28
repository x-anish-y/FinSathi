<div align="center">
  <img src="/app/icon.png" alt="FinSathi Logo" width="120" />
</div>

<h1 align="center">FinSathi®</h1>
<h4 align="center">India's First Free, Objective & AI-Powered Financial Intelligence Platform</h4>

<p align="center">
  <a href="https://fin-sathi.netlify.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Deployment-Netlify-%2300C3DA?style=for-the-badge&logo=netlify" alt="Deployed Link" />
  </a>
</p>

---

## 🎯 The Problem
Only **27% of Indian adults are financially literate**. For the remaining majority, seeking financial guidance inevitably leads to traditional wealth managers who are often heavily incentivized to cross-sell expensive, high-commission mutual funds or insurance products. 

Furthermore, calculating optimal tax regimes (post-Budget 2026), projecting FIRE (Financial Independence, Retire Early) timelines, and parsing chaotic multi-page CAMS mutual fund statements are overwhelming tasks for retail investors.

## 💡 Our Solution
<img src="/app/HomePage.png" alt="FinSathi Home Page" />
FinSathi is an un-biased, commission-free platform driven entirely by mathematical modeling and state-of-the-art AI orchestration. It replaces human upselling with pure algorithm-driven tax planning and portfolio analysis.

Our architecture leverages an underlying **Multi-Agent Orchestrator** which connects localized PDF parsers directly with Indian tax code variables (Section 80C, 115BAC, etc.) to generate deeply personalized, actionable insights in milliseconds—without the bias.


---

## 🚀 Key Features & Modules

1. **🫀 Money Health Score**
   A diagnostic 12-factor scan of your entire financial landscape. Instantly identifies critical gaps across emergency preparedness, debt-to-income limits, and insurance coverage.

2. **🔥 FIRE Path Planner**
   When can you realistically stop working? Using aggressive inflation markers and dynamic ROI matrices, the calculator determines the exact SIP cadence needed to hit your Financial Independence corpus target.

3. **🧙 Tax Wizard (Form 16 Parsing)**
   A robust file-upload module that extracts chaotic tabular data from standard Indian **Form 16 PDFs**. The Wizard calculates your exact liabilities under the New vs. Old Regime (FY2026-27), explicitly highlighting missed deduction opportunities (like Section 80CCD(1B)).

4. **🔬 MF Portfolio X-Ray (CAMS CAS)**
   Upload your consolidated CAMS/KFintech Statement. The X-Ray module parses raw, garbled transactional strings to detect **hidden stock overlap risks**, calculate precise **XIRR trajectories** across inflows/outflows, and visualize your true asset allocation.

5. **💑 Couple's Money Planner**
   India's first AI-powered joint planner designed for dual-income households to sync goals, optimize joint taxation, and leverage intra-spouse investment capabilities without triggering clubbing provisions.

6. **📋 Audit Trail (Transparency Layer)**
   Because AI in finance requires absolute trust, the **Audit Trail** provides fully transparent, real-time logging directly to a MongoDB database, exposing the *exact* reasoning behind every single AI-generated output.

---

## 🛠 Tech Stack

**Frontend layer engineered for ultra-fast, premium interactions:**
*   **Core:** Next.js 14 (App Router) + React 18
*   **Styling:** Tailwind CSS (Custom Dark Navy & Teal Glow Aesthetic)
*   **Animations:** Framer Motion (Staggered arrays, text reveals, fluid springs)
*   **Data Visualization:** Recharts (Radar charts & portfolio breakdowns)

**Backend analytical layer & AI:**
*   **Server Processing:** Node.js (Next.js Server Actions & API Routes)
*   **Parsing Pipeline:** `pdf-parse` (Enhanced with vertical regex modeling for chaotic tabular arrays)
*   **AI Models:** OpenAI API (Strictly prompted for Indian localization & SEBI disclaimers)
*   **Database:** MongoDB Atlas (for persistent Audit Logging)

---

## 🌟 What Makes FinSathi Unique?

*   **Robust Non-Standard Regex Parsers:** Instead of relying entirely on LLMs to parse deeply fragmented Indian financial PDFs (which fail frequently due to horizontal wrapping), we built custom deterministic regex layers that clean, string-match, and remap Form 16 variables and CAMS Mutual Fund statements *before* streaming them to the AI calculation nodes.
*   **Defensive Design Architecture:** Built with integrated SEBI warnings, fallback inputs for missing fields, and specific boundary rules hardcoding AI narratives to the present fiscal year to prevent hallucinations.
*   **Zero-Interaction Onboarding:** The user doesn't need to know financial jargon; they only need to upload their CAMS statement and their Form 16 to instantly trigger the multi-agent orchestration. 

---

## 🌐 Live Application
Check out the fully responsive, mobile-first experience here: **[https://fin-sathi.netlify.app/](https://fin-sathi.netlify.app/)**

---

<p align="center">
  <i>Expert Advice. Minus the Bias. Free Forever.</i>
</p>
