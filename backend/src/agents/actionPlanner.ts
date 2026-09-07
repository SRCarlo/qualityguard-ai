import { askAIJson } from "../lib/jsonAI.js";
import { ActionPlanSchema } from "../types/agentOutput.js";

export async function actionPlanner(issue: string, causes: unknown) {
  const prompt = `
Create a SAFE manufacturing investigation plan.

Return ONLY this JSON object:

{
  "immediateChecks": [],
  "investigation": [],
  "followUp": []
}

STRICT OUTPUT RULES:

1. immediateChecks must contain 0 to 2 strings.
2. investigation must contain 0 to 2 strings.
3. followUp must contain 0 to 2 strings.
4. Every array item must be a short string.
5. Do not use nested objects.
6. Do not use null.
7. Do not use numbers.
8. Do not use booleans.
9. Do not add any other fields.
10. Do not write markdown.
11. Do not use code fences.

SAFETY RULES:

- Do not control machinery.
- Do not automatically change machine parameters.
- Do not provide machine-control commands.
- Do not instruct the system to shut down equipment.
- Do not claim the root cause is confirmed.
- Focus on inspection, verification, evidence collection,
  documentation, and human review.
- Human approval is required before operational changes.

If the available information is insufficient,
provide investigation and evidence-collection steps.

Manufacturing issue:

${issue}

Possible causes:

${JSON.stringify(causes)}
`;

  return await askAIJson(
    "You are a strict manufacturing investigation planner. Return JSON only.",
    prompt,
    ActionPlanSchema,
  );
}
