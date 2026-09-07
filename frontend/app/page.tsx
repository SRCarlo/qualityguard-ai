"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiClipboard,
  FiCpu,
  FiFileText,
  FiGithub,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiXCircle,
  FiZap,
} from "react-icons/fi";

/* =========================================================
   TYPES
========================================================= */

type Cause = {
  cause: string;
  confidence: "Low" | "Medium" | "High";
  whyPossible: string;
  evidenceNeeded: string;
};

type AnalysisResult = {
  issue: string;

  inputGuard: {
    status: "SAFE" | "REVIEW REQUIRED";
    reasons: string[];
  } | null;

  issueAnalysis: {
    machine: string;
    defect: string;
    quantity: string;
    time: string;
    measurements: string;
    maintenance: string;
    missingInformation: string[];
  } | null;

  possibleCauses: {
    causes: Cause[];
  } | null;

  actionPlan: {
    immediateChecks: string[];
    investigation: string[];
    followUp: string[];
  } | null;

  safetyReview: {
    status: "PASS" | "REVIEW REQUIRED";
    reasons: string[];
  } | null;

  criticReview: {
    decision: "PASS" | "REVISE";
    reasons: string[];
  } | null;

  requiresHumanApproval: boolean;

  revisionCount: number;

  executionStatus: "COMPLETED" | "HUMAN_REVIEW_REQUIRED";
};

type AnalyzeResponse = {
  success?: boolean;
  error?: string;
  data?: AnalysisResult;
};

type AgentStatus = "waiting" | "running" | "complete";

/* =========================================================
   AGENTS
========================================================= */

const agents = [
  {
    name: "Input Guard",
    description: "Safety & input validation",
    icon: FiShield,
  },
  {
    name: "Issue Analyzer",
    description: "Extract manufacturing facts",
    icon: FiSearch,
  },
  {
    name: "Root Cause",
    description: "Generate possible causes",
    icon: FiCpu,
  },
  {
    name: "Action Planner",
    description: "Create investigation steps",
    icon: FiClipboard,
  },
  {
    name: "Safety Checker",
    description: "Validate recommendations",
    icon: FiAlertTriangle,
  },
  {
    name: "Critic",
    description: "Audit final recommendation",
    icon: FiCheckCircle,
  },
];

/* =========================================================
   EXAMPLES
========================================================= */

const examples = [
  {
    label: "Dimension issue",
    text: "Machine M-204 is producing parts with inconsistent dimensions. The measured diameter varies between 24.8 mm and 25.4 mm, while the target specification is 25.0 mm.",
  },
  {
    label: "Temperature issue",
    text: "Machine M-120 is producing 8 defective parts. The defect appeared after approximately two hours of production, and the recorded process temperature was higher than the normal operating range.",
  },
  {
    label: "Surface defect",
    text: "Machine M-410 produced 18 defective components during the last production shift. The defect appears as surface scratches, and the machine has not had its scheduled maintenance for 45 days.",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Home() {
  const [issue, setIssue] = useState("");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [agentStatuses, setAgentStatuses] = useState<
    Record<string, AgentStatus>
  >({
    "Input Guard": "waiting",
    "Issue Analyzer": "waiting",
    "Root Cause": "waiting",
    "Action Planner": "waiting",
    "Safety Checker": "waiting",
    Critic: "waiting",
  });

  /* =======================================================
     RESET AGENTS
  ======================================================= */

  const resetAgents = () => {
    setAgentStatuses({
      "Input Guard": "waiting",
      "Issue Analyzer": "waiting",
      "Root Cause": "waiting",
      "Action Planner": "waiting",
      "Safety Checker": "waiting",
      Critic: "waiting",
    });
  };

  /* =======================================================
     RUN ANALYSIS
  ======================================================= */

  const runAnalysis = async () => {
    if (issue.trim().length < 10) {
      setError(
        "Please enter a manufacturing issue with at least 10 characters.",
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    resetAgents();

    setAgentStatuses((previous) => ({
      ...previous,
      "Input Guard": "running",
    }));

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue: issue.trim(),
        }),
      });

      let data: AnalyzeResponse;

      try {
        data = (await response.json()) as AnalyzeResponse;
      } catch {
        throw new Error("Backend returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Backend request failed with status ${response.status}.`,
        );
      }

      if (!data.success) {
        throw new Error(data.error || "QualityGuard analysis failed.");
      }

      if (!data.data) {
        throw new Error("Backend returned no analysis data.");
      }

      /* -----------------------------------------------
         HUMAN REVIEW
      ------------------------------------------------ */

      if (data.data.executionStatus === "HUMAN_REVIEW_REQUIRED") {
        setAgentStatuses({
          "Input Guard": "complete",
          "Issue Analyzer": "waiting",
          "Root Cause": "waiting",
          "Action Planner": "waiting",
          "Safety Checker": "waiting",
          Critic: "waiting",
        });

        setResult(data.data);

        return;
      }

      /* -----------------------------------------------
         NORMAL COMPLETION
      ------------------------------------------------ */

      const pipeline = [
        "Input Guard",
        "Issue Analyzer",
        "Root Cause",
        "Action Planner",
        "Safety Checker",
        "Critic",
      ];

      for (let i = 0; i < pipeline.length; i++) {
        setAgentStatuses((previous) => ({
          ...previous,

          [pipeline[i]]: "complete",

          ...(pipeline[i + 1]
            ? {
                [pipeline[i + 1]]: "running",
              }
            : {}),
        }));

        await new Promise((resolve) => setTimeout(resolve, 220));
      }

      setResult(data.data);

      setAgentStatuses({
        "Input Guard": "complete",
        "Issue Analyzer": "complete",
        "Root Cause": "complete",
        "Action Planner": "complete",
        "Safety Checker": "complete",
        Critic: "complete",
      });
    } catch (err) {
      console.error("QualityGuard frontend error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to QualityGuard backend.",
      );

      resetAgents();
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD EXAMPLE
  ======================================================= */

  const loadExample = (text: string) => {
    setIssue(text);
    setError("");
    setResult(null);
    resetAgents();
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearAll = () => {
    setIssue("");
    setResult(null);
    setError("");
    resetAgents();
  };

  /* =======================================================
     PROGRESS
  ======================================================= */

  const completedCount = Object.values(agentStatuses).filter(
    (status) => status === "complete",
  ).length;

  const progress = Math.round((completedCount / agents.length) * 100);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#060a10] text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#060a10]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
              <FiShield className="text-lg text-blue-400" />
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">
                QualityGuard AI
              </h1>

              <p className="hidden text-[11px] text-gray-500 sm:block">
                Manufacturing Triage Harness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-3 py-1.5 text-[11px] font-medium text-green-300 sm:px-4 sm:py-2 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            Human-in-the-loop
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-12">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d1624] via-[#0a111c] to-[#080d15] p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-blue-300">
              <FiZap />
              Operations & Compliance
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Manufacturing issues,
              <br />
              <span className="text-blue-400">safer investigation plans.</span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              QualityGuard coordinates specialized AI agents to analyze quality
              issues, identify possible causes, challenge recommendations, and
              keep humans in control.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <FeatureBadge icon={<FiShield />} text="Safety-first" />

              <FeatureBadge icon={<FiCpu />} text="Multi-agent" />

              <FeatureBadge icon={<FiUser />} text="Human approval" />
            </div>
          </div>
        </section>

        {/* =================================================
            ISSUE INPUT
        ================================================= */}

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
                  <FiFileText />
                </div>

                <h3 className="text-lg font-semibold">
                  Report a Quality Issue
                </h3>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Describe what was observed on the production floor.
              </p>
            </div>

            {issue && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 transition hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b121c] transition focus-within:border-blue-400/40 focus-within:ring-4 focus-within:ring-blue-400/5">
            <textarea
              value={issue}
              onChange={(e) => {
                setIssue(e.target.value);
                setError("");
              }}
              placeholder="Example: Machine M-204 is producing parts with inconsistent dimensions..."
              className="min-h-[170px] w-full resize-none bg-transparent p-5 text-sm leading-7 text-white outline-none placeholder:text-gray-600 sm:min-h-[190px]"
            />

            <div className="flex flex-col gap-4 border-t border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[11px] text-gray-600">Try:</span>

                {examples.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => loadExample(example.text)}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-gray-400 transition hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-blue-300"
                  >
                    {example.label}
                  </button>
                ))}
              </div>

              <button
                onClick={runAnalysis}
                disabled={loading}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiActivity />
                    Analyze Issue
                    <FiChevronRight />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              <FiXCircle className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-600">
            <FiShield className="text-green-500" />
            AI recommendations never directly control machinery.
          </div>
        </section>

        {/* =================================================
            AGENT PIPELINE
        ================================================= */}

        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                AI Harness
              </p>

              <h3 className="mt-1 text-xl font-bold">Multi-agent validation</h3>

              <p className="mt-1 text-sm text-gray-500">
                Each agent has one focused responsibility.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-500">Harness progress</p>

              <p className="mt-1 text-sm font-semibold text-gray-300">
                {progress}%
              </p>
            </div>
          </div>

          <div className="mb-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {agents.map((agent, index) => {
              const Icon = agent.icon;

              const status = agentStatuses[agent.name];

              return (
                <AgentCard
                  key={agent.name}
                  index={index}
                  name={agent.name}
                  description={agent.description}
                  icon={<Icon />}
                  status={status}
                />
              );
            })}
          </div>
        </section>

        {/* =================================================
            RESULTS
        ================================================= */}

        {result && (
          <div className="space-y-6">
            {/* RESULT HEADER */}

            <section className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <FiCheckCircle className="text-green-400" />
                    Analysis complete
                  </div>

                  <h3 className="mt-2 text-xl font-bold">
                    QualityGuard Decision
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    The issue was evaluated through the configured safety and
                    reliability pipeline.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    label={result.inputGuard?.status ?? "NOT AVAILABLE"}
                    type={
                      result.inputGuard?.status === "SAFE"
                        ? "success"
                        : "warning"
                    }
                  />

                  <StatusBadge
                    label={result.safetyReview?.status ?? "NOT RUN"}
                    type={
                      result.safetyReview?.status === "PASS"
                        ? "success"
                        : "warning"
                    }
                  />

                  <StatusBadge
                    label={result.criticReview?.decision ?? "NOT RUN"}
                    type={
                      result.criticReview?.decision === "PASS"
                        ? "success"
                        : "warning"
                    }
                  />
                </div>
              </div>
            </section>

            {/* HUMAN REVIEW */}

            {result.executionStatus === "HUMAN_REVIEW_REQUIRED" && (
              <HumanReviewCard reasons={result.inputGuard?.reasons ?? []} />
            )}

            {/* COMPLETED */}

            {result.executionStatus === "COMPLETED" && (
              <>
                {/* ISSUE FACTS */}

                {result.issueAnalysis && (
                  <section className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5 sm:p-6">
                    <SectionHeading
                      icon={<FiSearch />}
                      title="Issue Facts"
                      subtitle="Information extracted from the report."
                    />

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Fact
                        label="Machine"
                        value={result.issueAnalysis.machine}
                      />

                      <Fact
                        label="Defect"
                        value={result.issueAnalysis.defect}
                      />

                      <Fact
                        label="Quantity"
                        value={result.issueAnalysis.quantity}
                      />

                      <Fact label="Time" value={result.issueAnalysis.time} />

                      <Fact
                        label="Measurements"
                        value={result.issueAnalysis.measurements}
                      />

                      <Fact
                        label="Maintenance"
                        value={result.issueAnalysis.maintenance}
                      />
                    </div>

                    {result.issueAnalysis.missingInformation.length > 0 && (
                      <div className="mt-4 rounded-xl border border-yellow-400/15 bg-yellow-400/5 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-yellow-300">
                          <FiAlertTriangle />
                          Missing information
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.issueAnalysis.missingInformation.map(
                            (item, index) => (
                              <span
                                key={index}
                                className="rounded-lg border border-yellow-400/10 bg-yellow-400/5 px-3 py-1.5 text-xs text-yellow-200"
                              >
                                {item}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* ROOT CAUSES */}

                {result.possibleCauses && (
                  <section className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5 sm:p-6">
                    <SectionHeading
                      icon={<FiCpu />}
                      title="Possible Root Causes"
                      subtitle="Hypotheses generated from the available evidence."
                    />

                    <div className="grid gap-4 lg:grid-cols-3">
                      {result.possibleCauses.causes.map((cause, index) => (
                        <CauseCard key={index} index={index} cause={cause} />
                      ))}
                    </div>
                  </section>
                )}

                {/* ACTION PLAN */}

                {result.actionPlan && (
                  <section className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5 sm:p-6">
                    <SectionHeading
                      icon={<FiClipboard />}
                      title="Investigation Plan"
                      subtitle="Safe evidence-gathering steps for human review."
                    />

                    <div className="grid gap-4 lg:grid-cols-3">
                      <ActionGroup
                        number="01"
                        title="Immediate Checks"
                        items={result.actionPlan.immediateChecks}
                      />

                      <ActionGroup
                        number="02"
                        title="Investigation"
                        items={result.actionPlan.investigation}
                      />

                      <ActionGroup
                        number="03"
                        title="Follow Up"
                        items={result.actionPlan.followUp}
                      />
                    </div>
                  </section>
                )}

                {/* REVIEWS */}

                <section className="grid gap-4 lg:grid-cols-2">
                  {result.safetyReview && (
                    <ReviewCard
                      title="Safety Checker"
                      icon={<FiShield />}
                      status={result.safetyReview.status}
                      reasons={result.safetyReview.reasons}
                    />
                  )}

                  {result.criticReview && (
                    <ReviewCard
                      title="Reliability Critic"
                      icon={<FiCheckCircle />}
                      status={result.criticReview.decision}
                      reasons={result.criticReview.reasons}
                    />
                  )}
                </section>

                {/* HUMAN APPROVAL */}

                {result.requiresHumanApproval && (
                  <section className="overflow-hidden rounded-2xl border border-yellow-400/20 bg-gradient-to-r from-yellow-400/5 to-transparent">
                    <div className="flex gap-4 p-5 sm:p-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                        <FiUser />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-yellow-300">
                            Human Approval Required
                          </h3>

                          <span className="rounded-full border border-yellow-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-yellow-300">
                            Safety boundary
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          QualityGuard provides investigation recommendations
                          only. A qualified human must review and approve any
                          operational change.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* COMPLETION */}

                <section className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.03] p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                        <FiCheckCircle />
                        Harness execution complete
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        All configured validation stages completed successfully.
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600">
                          Revisions
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {result.revisionCount}
                        </p>
                      </div>

                      <div className="h-8 w-px bg-white/10" />

                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-600">
                          Agents
                        </p>

                        <p className="mt-1 text-2xl font-bold">6</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!result && !loading && (
          <section className="mb-10 rounded-2xl border border-dashed border-white/[0.08] bg-[#0a1018]/50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-600">
              <FiActivity />
            </div>

            <h3 className="mt-4 font-semibold text-gray-300">
              Ready for analysis
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              Enter a manufacturing issue above and QualityGuard will route it
              through the multi-agent harness.
            </p>
          </section>
        )}

        {/* =================================================
            WHY QUALITYGUARD
        ================================================= */}

        <section className="mt-14 border-t border-white/[0.06] pt-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
              Why QualityGuard?
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              One model gives an answer.
              <br />
              <span className="text-blue-400">
                A harness creates a safer process.
              </span>
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              number="01"
              title="Specialized Agents"
              text="Each agent performs one focused task instead of relying on a single model."
            />

            <InfoCard
              number="02"
              title="Validation Loop"
              text="The critic can challenge weak recommendations and request another planning cycle."
            />

            <InfoCard
              number="03"
              title="Human Control"
              text="AI never directly controls machinery. Operational decisions remain with humans."
            />
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-12 border-t border-white/[0.06] py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-gray-300">
                QualityGuard AI
              </p>

              <p className="mt-1 text-[11px] text-gray-600">
                Manufacturing Operations & Compliance · Human-in-the-loop
              </p>
            </div>

            <a
              href="https://github.com/SRCarlo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit SRCarlo on GitHub"
              className="group flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-gray-400 transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-blue-300"
            >
              <FiGithub className="text-base transition-transform duration-300 group-hover:scale-110" />

              <span>
                Built by{" "}
                <span className="font-semibold text-gray-300 group-hover:text-blue-300">
                  SRCarlo
                </span>
              </span>

              <FiChevronRight className="text-gray-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-blue-400" />
            </a>
          </div>

          <div className="mt-6 text-center text-[10px] text-gray-700">
            © 2026 QualityGuard AI · AI-assisted investigation, human-approved
            decisions
          </div>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   FEATURE BADGE
========================================================= */

function FeatureBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-gray-400">
      <span className="text-blue-400">{icon}</span>

      {text}
    </div>
  );
}

/* =========================================================
   AGENT CARD
========================================================= */

function AgentCard({
  index,
  name,
  description,
  icon,
  status,
}: {
  index: number;
  name: string;
  description: string;
  icon: ReactNode;
  status: AgentStatus;
}) {
  const isRunning = status === "running";

  const isComplete = status === "complete";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        isRunning
          ? "border-blue-400/40 bg-blue-400/[0.06] shadow-lg shadow-blue-500/5"
          : isComplete
            ? "border-green-400/20 bg-green-400/[0.035]"
            : "border-white/[0.07] bg-[#0b121c]"
      }`}
    >
      {isRunning && (
        <div className="absolute inset-x-0 top-0 h-px bg-blue-400" />
      )}

      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isComplete
              ? "bg-green-400/10 text-green-400"
              : isRunning
                ? "bg-blue-400/10 text-blue-400"
                : "bg-white/[0.04] text-gray-600"
          }`}
        >
          {isComplete ? <FiCheck /> : icon}
        </div>

        <span className="text-[10px] font-medium text-gray-600">
          0{index + 1}
        </span>
      </div>

      <h4 className="mt-4 text-sm font-semibold">{name}</h4>

      <p className="mt-1 text-[11px] leading-5 text-gray-600">{description}</p>

      <div className="mt-3">
        {status === "waiting" && (
          <span className="text-[10px] text-gray-600">Waiting</span>
        )}

        {status === "running" && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Processing
          </span>
        )}

        {status === "complete" && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-300">
            <FiCheckCircle />
            Complete
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: "success" | "warning";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
        type === "success"
          ? "border-green-400/20 bg-green-400/5 text-green-300"
          : "border-yellow-400/20 bg-yellow-400/5 text-yellow-300"
      }`}
    >
      {label}
    </span>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>

        <p className="mt-0.5 text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}

/* =========================================================
   FACT
========================================================= */

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#070c13] p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-600">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-gray-300">{value}</p>
    </div>
  );
}

/* =========================================================
   CAUSE CARD
========================================================= */

function CauseCard({ index, cause }: { index: number; cause: Cause }) {
  const confidence = cause.confidence;

  const confidenceStyle =
    confidence === "High"
      ? "border-red-400/20 bg-red-400/5 text-red-300"
      : confidence === "Medium"
        ? "border-yellow-400/20 bg-yellow-400/5 text-yellow-300"
        : "border-blue-400/20 bg-blue-400/5 text-blue-300";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#070c13] p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Cause 0{index + 1}
        </span>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${confidenceStyle}`}
        >
          {confidence}
        </span>
      </div>

      <h4 className="mt-4 text-sm font-semibold leading-6">{cause.cause}</h4>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-600">
            Why possible
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            {cause.whyPossible}
          </p>
        </div>

        <div className="border-t border-white/[0.05] pt-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-600">
            Evidence needed
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            {cause.evidenceNeeded}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACTION GROUP
========================================================= */

function ActionGroup({
  number,
  title,
  items,
}: {
  number: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#070c13] p-5">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-blue-400">{number}</span>

        <h4 className="text-sm font-semibold">{title}</h4>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-gray-600">No items provided.</p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 text-xs leading-6 text-gray-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />

              <span>{item}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({
  title,
  icon,
  status,
  reasons,
}: {
  title: string;
  icon: ReactNode;
  status: string;
  reasons: string[];
}) {
  const passed = status === "PASS";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0b121c] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
            {icon}
          </div>

          <h3 className="font-semibold">{title}</h3>
        </div>

        <span
          className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
            passed
              ? "border-green-400/20 bg-green-400/5 text-green-300"
              : "border-yellow-400/20 bg-yellow-400/5 text-yellow-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {reasons.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-400/5 p-3 text-xs text-green-300">
            <FiCheckCircle />
            No issues reported.
          </div>
        ) : (
          reasons.map((reason, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-lg border border-white/[0.05] bg-[#070c13] p-3 text-xs leading-5 text-gray-400"
            >
              {passed ? (
                <FiCheckCircle className="mt-0.5 shrink-0 text-green-400" />
              ) : (
                <FiAlertTriangle className="mt-0.5 shrink-0 text-yellow-400" />
              )}

              <span>{reason}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   HUMAN REVIEW CARD
========================================================= */

function HumanReviewCard({ reasons }: { reasons: string[] }) {
  return (
    <section className="rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.04] p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
          <FiUser />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-yellow-300">
              Human Review Required
            </h3>

            <span className="rounded-full border border-yellow-400/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-yellow-300">
              Harness stopped
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            The Input Guard stopped the harness before further analysis. No
            root-cause or operational recommendation was generated.
          </p>

          {reasons.length > 0 && (
            <div className="mt-4 space-y-2">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-lg border border-yellow-400/10 bg-[#080d14] p-3 text-xs text-gray-300"
                >
                  <FiAlertTriangle className="mt-0.5 shrink-0 text-yellow-400" />

                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1018] p-5">
      <span className="text-[10px] font-bold tracking-widest text-blue-400">
        {number}
      </span>

      <h4 className="mt-3 font-semibold">{title}</h4>

      <p className="mt-2 text-xs leading-6 text-gray-600">{text}</p>
    </div>
  );
}
