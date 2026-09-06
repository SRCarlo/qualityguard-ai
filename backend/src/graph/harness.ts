import { StateGraph, START, END } from "@langchain/langgraph";

import { HarnessState } from "./state.js";

import { inputGuard } from "../agents/inputGuard.js";
import { issueAnalyzer } from "../agents/issueAnalyzer.js";
import { rootCause } from "../agents/rootCause.js";
import { actionPlanner } from "../agents/actionPlanner.js";
import { safetyChecker } from "../agents/safetyChecker.js";
import { critic } from "../agents/critic.js";

//  1. INPUT GUARD

const inputGuardNode = async (state: typeof HarnessState.State) => {
  console.log("🛡️ Input Guard");

  const result = await inputGuard(state.issue);

  return {
    inputGuard: result,
  };
};

//  2. INPUT GUARD DECISION

const inputGuardDecision = (state: typeof HarnessState.State) => {
  const status = state.inputGuard?.status;

  if (status === "SAFE") {
    console.log("✅ Input Guard passed. Continuing analysis.");

    return "continue";
  }

  console.log("🛑 Input Guard blocked the request. Human review required.");

  return "human_review";
};

//  3. ISSUE ANALYZER

const issueAnalyzerNode = async (state: typeof HarnessState.State) => {
  console.log("🔎 Issue Analyzer");

  const result = await issueAnalyzer(state.issue);

  return {
    issueAnalysis: result,
  };
};

//  4. ROOT CAUSE AGENT

const rootCauseNode = async (state: typeof HarnessState.State) => {
  console.log("🧠 Root Cause Agent");

  const result = await rootCause(state.issue, state.issueAnalysis);

  return {
    possibleCauses: result,
  };
};

//  5. ACTION PLANNER

const actionPlannerNode = async (state: typeof HarnessState.State) => {
  console.log("📋 Action Planner");

  const result = await actionPlanner(state.issue, state.possibleCauses);

  return {
    actionPlan: result,
  };
};

//  6. SAFETY CHECKER

const safetyCheckerNode = async (state: typeof HarnessState.State) => {
  console.log("🚨 Safety Checker");

  const result = await safetyChecker(state.issue, state.actionPlan);

  return {
    safetyReview: result,

    // Every operational recommendation
    // requires human approval.
    requiresHumanApproval: true,
  };
};

//  7. CRITIC

const criticNode = async (state: typeof HarnessState.State) => {
  console.log("🔬 Critic");

  const result = await critic(
    state.issue,
    state.issueAnalysis,
    state.possibleCauses,
    state.actionPlan,
    state.safetyReview,
  );

  return {
    criticReview: result,

    revisionCount: state.revisionCount + 1,
  };
};

//  8. CRITIC DECISION

const criticDecision = (state: typeof HarnessState.State) => {
  const decision = state.criticReview?.decision;

  // Critic approved

  if (decision === "PASS") {
    console.log("✅ Critic approved final result");

    return "finish";
  }

  // Critic rejected + revision available

  if (decision === "REVISE" && state.revisionCount < 2) {
    console.log("🔄 Critic requested revision");

    return "revise";
  }

  // Maximum revisions reached

  console.log("⚠️ Maximum revisions reached. Human review required.");

  return "finish";
};

//  9. BUILD GRAPH

const graph = new StateGraph(HarnessState)

  // Nodes
  .addNode("inputGuardNode", inputGuardNode)

  .addNode("issueAnalyzerNode", issueAnalyzerNode)

  .addNode("rootCauseNode", rootCauseNode)

  .addNode("actionPlannerNode", actionPlannerNode)

  .addNode("safetyCheckerNode", safetyCheckerNode)

  .addNode("criticNode", criticNode)

  // Start

  .addEdge(START, "inputGuardNode")

  // INPUT GUARD GATE

  .addConditionalEdges(
    "inputGuardNode",

    inputGuardDecision,

    {
      continue: "issueAnalyzerNode",

      human_review: END,
    },
  )

  // Main pipeline

  .addEdge("issueAnalyzerNode", "rootCauseNode")

  .addEdge("rootCauseNode", "actionPlannerNode")

  .addEdge("actionPlannerNode", "safetyCheckerNode")

  .addEdge("safetyCheckerNode", "criticNode")

  // Critic feedback loop

  .addConditionalEdges(
    "criticNode",

    criticDecision,

    {
      revise: "actionPlannerNode",

      finish: END,
    },
  );

//  10. COMPILE GRAPH

export const qualityGuardGraph = graph.compile();
