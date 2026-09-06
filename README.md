# QualityGuard AI

**Multi-Agent Manufacturing Issue Triage Harness for Operations & Compliance**

QualityGuard AI is a safety-first multi-agent system designed to analyze manufacturing quality issues, generate possible root-cause hypotheses, and create investigation plans while keeping operational decisions human-approved.

> **Important:** QualityGuard AI does not directly control manufacturing equipment, change machine parameters, or execute operational commands. Recommendations require human approval.

---

## Overview

QualityGuard AI uses specialized AI agents connected through a LangGraph workflow:

```text
User
  ↓
Next.js Interface
  ↓
Input Guard
  ├── SAFE → Issue Analyzer
  └── REVIEW REQUIRED → Human Review
                    ↓
             Issue Analyzer
                    ↓
               Root Cause
                    ↓
              Action Planner
                    ↓
             Safety Checker
                    ↓
                 Critic
              ┌─────┴─────┐
              ↓           ↓
            PASS        REVISE
              ↓           ↓
             END     Action Planner
                          ↓
                   Safety Checker
                          ↓
                       Critic
```

---

## Multi-Agent Workflow

### 1. Input Guard

The first safety gate.

- Detects direct machine-control requests
- Detects automatic parameter-change requests
- Detects unsafe operational instructions
- Detects missing safety information
- Detects suspicious prompt-injection instructions
- Stops unsafe requests before further analysis

Possible results:

```text
SAFE
REVIEW REQUIRED
```

### 2. Issue Analyzer

Extracts structured facts from the manufacturing issue:

- Machine
- Defect
- Quantity
- Time
- Measurements
- Maintenance information
- Missing information

The agent does not invent missing facts. Missing information is reported as **Not provided**.

### 3. Root Cause Agent

Generates up to three possible root-cause hypotheses.

Each hypothesis includes:

- Possible cause
- Confidence level
- Why the cause is possible
- Evidence needed to verify it

Causes are treated as **hypotheses, not confirmed root causes**.

### 4. Action Planner

Creates a safe investigation plan containing:

- Immediate checks
- Investigation steps
- Follow-up actions

It focuses on inspection, evidence collection, verification, documentation, and human review.

It does **not** provide machine-control commands, automatic parameter changes, or autonomous operational instructions.

### 5. Safety Checker

Independently reviews the proposed investigation plan for:

- Unsafe instructions
- Machine-control instructions
- Missing human approval
- Unsupported recommendations
- Missing safety information

Possible results:

```text
PASS
REVIEW REQUIRED
```

### 6. Critic

Performs a final quality review.

Possible decisions:

```text
PASS
REVISE
```

If revision is required, LangGraph routes the workflow back to the Action Planner. The revision cycle is bounded to prevent endless loops.

---

## Safety & Reliability

QualityGuard AI is designed as a **human-in-the-loop** system.

### Safety controls

- Input safety gate
- Human-review routing
- No direct machine control
- No automatic parameter changes
- No automatic equipment shutdown commands
- Root causes remain hypotheses
- Safety review before completion
- Critic validation
- Bounded revision loop

### Reliability controls

- Zod schema validation
- Structured JSON output
- JSON parsing and extraction
- AI response validation
- Retry handling
- Groq rate-limit handling
- Bounded critic revisions
- Graceful API error responses

---

## Example Scenarios

### Safe manufacturing issue

```text
15 products from Conveyor 3 have surface scratches during the morning shift.
```

Expected flow:

```text
Input Guard → SAFE
Issue Analyzer
→ Root Cause
→ Action Planner
→ Safety Checker
→ Critic
→ COMPLETED
```

### Unsafe machine-control request

```text
Increase Conveyor 3 speed by 20% immediately to solve the production issue.
```

Expected result:

```text
Input Guard → REVIEW REQUIRED
```

The request is stopped before operational analysis continues.

**No machine operation is performed.**

### Incomplete issue

```text
There is a quality problem with the machine. Please investigate.
```

The system identifies missing information instead of inventing facts.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Icons
- Genos typography

### Backend

- Node.js
- TypeScript
- Express
- LangGraph
- Zod

### AI

- Groq API
- GPT-OSS-20B

---

## Project Structure

```text
qualityguard-ai/
│
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── actionPlanner.ts
│   │   │   ├── critic.ts
│   │   │   ├── harness.ts
│   │   │   ├── inputGuard.ts
│   │   │   ├── issueAnalyzer.ts
│   │   │   ├── rootCause.ts
│   │   │   └── safetyChecker.ts
│   │   │
│   │   ├── graph/
│   │   │   ├── state.ts
│   │   │   └── harness.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── ai.ts
│   │   │   ├── groq.ts
│   │   │   └── jsonAI.ts
│   │   │
│   │   ├── routes/
│   │   │   └── analyze.ts
│   │   │
│   │   ├── types/
│   │   │   ├── agentOutput.ts
│   │   │   └── harness.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Getting Started

### Prerequisites

Install:

- Node.js 18+
- npm
- Git
- A Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/SRCarlo/qualityguard-ai.git
cd qualityguard-ai
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

Never commit your `.env` file or expose your API key publicly.

### 3. Start the Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Test the Harness

Safe issue:

```text
15 products from Conveyor 3 have surface scratches during the morning shift.
```

Unsafe request:

```text
Increase Conveyor 3 speed by 20% immediately to solve the production issue.
```

Incomplete issue:

```text
There is a quality problem with the machine. Please investigate.
```

---

## API

### Analyze Manufacturing Issue

**Endpoint**

```text
POST /api/analyze
```

### Request

```json
{
  "issue": "15 products from Conveyor 3 have surface scratches during the morning shift."
}
```

The API returns structured results containing:

- Input Guard result
- Issue analysis
- Possible causes
- Action plan
- Safety review
- Critic review
- Human approval requirement
- Revision count
- Execution status

---

## Demo Video

[Watch the QualityGuard AI Demo Video](https://drive.google.com/file/d/1aMvxQtLT_kRHMcjtz0AWhRhqfJTgozKl/view?usp=sharing)

The demo shows the multi-agent manufacturing issue triage workflow, including safe requests, unsafe machine-control requests, human-review routing, and incomplete issue handling.

## Human-in-the-Loop Design

QualityGuard AI follows a safety-first principle:

```text
AI analyzes
    ↓
AI proposes
    ↓
AI checks
    ↓
Human approves
    ↓
Operational decision
```

The AI system is intentionally prevented from becoming an autonomous machine-control system.

---

## Current Scope

This prototype focuses on:

- Manufacturing quality issue triage
- Root-cause hypothesis generation
- Investigation planning
- Safety validation
- Human-review routing
- Multi-agent orchestration

The current MVP does not persist analysis history in a database.

Future extensions could include:

- Investigation history
- Audit logs
- User authentication
- Role-based access
- Analytics dashboards
- Production-system integrations
- Approval workflows

---

## Hackathon Context

**Project:** QualityGuard AI  
**Domain:** Operations & Compliance  
**Theme:** Multi-Agent Manufacturing Issue Triage Harness

The project demonstrates how specialized AI agents can collaborate through a controlled workflow while applying safety gates, structured outputs, validation, bounded revisions, and human oversight.

---

## Team

**Team:** Naoe

**Lead:** Shubham Raut

---

## License

This project is a hackathon prototype created for demonstration and experimentation.
