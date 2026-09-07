# 🛡️ QualityGuard AI

### Multi-Agent Manufacturing Issue Triage Harness

[![Live Demo](https://img.shields.io/badge/Live%20Demo-QualityGuard%20AI-blue?style=for-the-badge)](https://qualityguardai.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge\&logo=github)](https://github.com/SRCarlo/qualityguard-ai)

**QualityGuard AI** is a multi-agent manufacturing issue triage harness designed for **Operations & Compliance**.

It helps analyze manufacturing quality issues, generate possible root-cause hypotheses, create investigation plans, perform safety checks, and apply critic-based review — while keeping operational decisions **human-approved**.

> **AI analyzes. AI proposes. AI checks. Humans approve.**

---

## 🚀 Live Demo

🌐 **Try QualityGuard AI:**

https://qualityguardai.vercel.app/

---

## 🎯 Problem

Manufacturing teams frequently need to investigate issues such as:

* Product defects
* Surface scratches
* Temperature anomalies
* Production quality deviations
* Equipment-related quality problems
* Missing investigation information

AI can help analyze these problems, but allowing an AI system to directly control machinery or automatically change operational parameters creates significant safety risks.

QualityGuard AI addresses this by placing a **safety harness around the AI workflow**.

The system can investigate and recommend — but it **never directly controls manufacturing equipment**.

---

## 🧠 How It Works

```text
                    👤 User
                       │
                       ▼
              ┌─────────────────┐
              │   Input Guard   │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │                 │
            SAFE          REVIEW REQUIRED
              │                 │
              ▼                 ▼
       Issue Analyzer      Human Review
              │
              ▼
        Root Cause Agent
              │
              ▼
        Action Planner
              │
              ▼
        Safety Checker
              │
              ▼
            Critic
              │
        ┌─────┴─────┐
        │           │
       PASS       REVISE
        │           │
        ▼           ▼
       END    Action Planner
                  │
                  └── Safety → Critic
```

The workflow is orchestrated using **LangGraph**.

---

## 🤖 Multi-Agent System

### 1. 🛡️ Input Guard

The first safety gate.

It checks for:

* Direct machine-control requests
* Automatic parameter changes
* Unsafe operational instructions
* Missing safety information
* Suspicious prompt-injection attempts
* Unsupported danger claims

Unsafe requests are stopped and routed for human review.

---

### 2. 🔎 Issue Analyzer

Extracts structured facts from the manufacturing issue:

* Machine
* Defect
* Quantity
* Time
* Measurements
* Maintenance information
* Missing information

The agent is instructed to **never invent missing facts**.

---

### 3. 🧠 Root Cause Agent

Generates up to three possible root-cause hypotheses.

Each hypothesis contains:

* Possible cause
* Confidence level
* Why it is possible
* Evidence required

The causes are explicitly treated as **hypotheses, not confirmed root causes**.

---

### 4. 📋 Action Planner

Creates a safe investigation plan containing:

* Immediate checks
* Investigation steps
* Follow-up actions

The planner is constrained to:

* Evidence collection
* Inspection
* Verification
* Documentation
* Human review

It cannot directly control machinery or automatically modify machine parameters.

---

### 5. 🚨 Safety Checker

Independently reviews the proposed action plan.

It checks for:

* Unsafe instructions
* Machine-control instructions
* Missing human approval
* Unsupported recommendations
* Missing safety information

The result is either:

```text
PASS
```

or:

```text
REVIEW REQUIRED
```

---

### 6. 🔬 Critic

The final quality-control layer.

The Critic evaluates:

* Analysis quality
* Root-cause hypotheses
* Investigation plan
* Safety review

It can return:

```text
PASS
```

or:

```text
REVISE
```

If revision is required, LangGraph routes the workflow back to the Action Planner.

The revision loop is **bounded** to prevent uncontrolled agent loops.

---

# 🔐 Safety & Reliability

QualityGuard AI is designed around a human-in-the-loop safety model.

### 🚫 No direct machine control

The system never:

* Changes machine parameters
* Starts or stops machinery
* Sends machine-control commands
* Automatically changes production settings
* Executes operational commands

### 👤 Human approval

Operational decisions remain with human personnel.

The AI provides investigation assistance and recommendations rather than autonomous control.

### 🧱 Structured outputs

Agent responses are validated using **Zod schemas**.

Invalid responses are rejected rather than blindly passed to the next agent.

### 🔄 Retry handling

The system includes retry handling for:

* AI API failures
* Rate limits
* Invalid JSON
* Invalid structured responses

### 🔁 Bounded revisions

The Critic can request a revision, but the workflow has a maximum revision limit.

This prevents infinite agent loops.

### 🛑 Graceful failure

Unsafe or invalid requests can stop the workflow and return a human-review status instead of continuing blindly.

---

# 🧪 Example Scenarios

## ✅ Normal manufacturing issue

Input:

```text
15 products from Conveyor 3 have surface scratches during the morning shift.
```

Expected flow:

```text
SAFE
  ↓
Issue Analysis
  ↓
Root Cause Hypotheses
  ↓
Investigation Plan
  ↓
Safety PASS
  ↓
Critic PASS
  ↓
COMPLETED
```

---

## 🛑 Unsafe machine-control request

Input:

```text
Increase Conveyor 3 speed by 20% immediately to solve the production issue.
```

Expected:

```text
REVIEW REQUIRED
        ↓
HUMAN REVIEW
```

The system does **not** execute the requested machine change.

---

## ⚠️ Incomplete information

Input:

```text
There is a quality problem with the machine. Please investigate.
```

The system identifies missing information rather than inventing facts.

For example:

```text
Machine: Not provided
Defect: Not provided
Quantity: Not provided
Measurements: Not provided
```

It then focuses on evidence collection.

---

# 🛠️ Technology Stack

| Technology   | Purpose                      |
| ------------ | ---------------------------- |
| Next.js      | Frontend application         |
| React        | User interface               |
| TypeScript   | Application development      |
| Tailwind CSS | UI styling                   |
| Node.js      | Backend runtime              |
| Express      | REST API                     |
| LangGraph    | Multi-agent orchestration    |
| Groq API     | LLM inference                |
| GPT-OSS-20B  | AI model                     |
| Zod          | Structured output validation |
| React Icons  | UI icons                     |

---

# 📁 Project Structure

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
│   │   │   ├── harness.ts
│   │   │   └── state.ts
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
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙️ Local Development

## 1. Clone the repository

```bash
git clone https://github.com/SRCarlo/qualityguard-ai.git
cd qualityguard-ai
```

---

## 2. Backend setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🌐 Deployment

QualityGuard AI can be deployed as:

```text
Frontend → Vercel
Backend  → Render
AI       → Groq API
```

Production frontend:

**https://qualityguardai.vercel.app/**

The frontend communicates with the backend through the configured:

```env
NEXT_PUBLIC_API_URL
```

---

# 🔌 API

### Analyze Manufacturing Issue

```http
POST /api/analyze
```

Request:

```json
{
  "issue": "15 products from Conveyor 3 have surface scratches during the morning shift."
}
```

The API returns structured information containing:

* Input Guard result
* Issue analysis
* Possible causes
* Action plan
* Safety review
* Critic review
* Human approval status
* Execution status
* Revision count

---

# 👤 Human-in-the-Loop

QualityGuard AI follows a simple principle:

> **AI can assist with investigation, but humans remain responsible for operational decisions.**

The system intentionally separates:

```text
AI Analysis
     ↓
AI Recommendation
     ↓
Safety Review
     ↓
Human Approval
     ↓
Operational Decision
```

This makes the system more appropriate for safety-sensitive manufacturing environments.

---

# 🎯 Hackathon Context

QualityGuard AI was created for the:

**AI Tinkerers × Michelin Pune Harness Engineering Hackathon 2026**

### Domain

**Operations & Compliance**

### Focus

Building reliable AI systems with:

* Multi-agent collaboration
* Safety constraints
* Error handling
* Feedback loops
* Human oversight
* Domain-specific reasoning

---

# 👨‍💻 Team

**Team:** Naoe

**Lead:** [Shubham Raut](https://github.com/SRCarlo)

---

# 🔗 Links

🌐 **Live Application:** 
https://qualityguardai.vercel.app/

💻 **GitHub Repository:**
https://github.com/SRCarlo/qualityguard-ai

---

# 📌 Current Scope

QualityGuard AI is an AI-assisted manufacturing investigation prototype.

It does **not** connect directly to:

* PLCs
* Industrial controllers
* Production machinery
* SCADA systems
* Factory automation systems

The system is intentionally designed as a **decision-support and investigation harness**, not an autonomous factory-control system.

---

## 💡 Core Principle

> ### Don't just build an AI agent.
>
> ### Build the system that makes the agent reliable.

**QualityGuard AI**

**AI analyzes. AI proposes. AI checks. Humans approve.**
