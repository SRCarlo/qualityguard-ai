import { inputGuard } from "./inputGuard.js";
import { issueAnalyzer } from "./issueAnalyzer.js";
import { rootCause } from "./rootCause.js";
import { actionPlanner } from "./actionPlanner.js";
import { safetyChecker } from "./safetyChecker.js";
import { critic } from "./critic.js";

export async function runHarness(issue: string) {
  console.log("1. Running Input Guard...");

  const guard = await inputGuard(issue);

  console.log("2. Running Issue Analyzer...");

  const analysis = await issueAnalyzer(issue);

  console.log("3. Running Root Cause Agent...");

  const causes = await rootCause(issue, analysis);

  console.log("4. Running Action Planner...");

  const actions = await actionPlanner(issue, causes);

  console.log("5. Running Safety Checker...");

  const safety = await safetyChecker(issue, actions);

  console.log("6. Running Critic...");

  const review = await critic(issue, analysis, causes, actions, safety);

  return {
    issue,
    inputGuard: guard,
    issueAnalysis: analysis,
    possibleCauses: causes,
    actionPlan: actions,
    safetyReview: safety,
    criticReview: review,
    requiresHumanApproval: true,
  };
}
