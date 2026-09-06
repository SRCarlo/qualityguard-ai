import { askAIJson } from "../lib/jsonAI.js";
import { SafetyReviewSchema } from "../types/agentOutput.js";

export async function safetyChecker(issue: string, actionPlan: unknown) {
  const prompt = `
Review this manufacturing investigation plan.

Check:

1. Unsafe instructions
2. Machine-control instructions
3. Missing human approval
4. Unsupported recommendations
5. Missing safety information

Return ONLY valid JSON.

Required format:

{
  "status": "PASS",
  "reasons": []
}

Allowed status values:

PASS
REVIEW REQUIRED

Provide maximum 3 reasons.

Issue:

${issue}

Action plan:

${JSON.stringify(actionPlan)}
`;

  return await askAIJson(
    "You are a strict manufacturing safety checker. Return JSON only.",
    prompt,
    SafetyReviewSchema,
  );
}
