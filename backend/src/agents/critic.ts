import { askAIJson } from "../lib/jsonAI.js";
import { CriticReviewSchema } from "../types/agentOutput.js";

export async function critic(
  issue: string,
  analysis: unknown,
  causes: unknown,
  actions: unknown,
  safety: unknown,
) {
  const prompt = `
Audit this manufacturing recommendation.

Return ONLY valid JSON.

Use exactly this format:

{
  "decision": "PASS",
  "reasons": []
}

Rules:
- decision must be PASS or REVISE
- maximum 2 short reasons
- each reason must be less than 15 words
- do not explain anything outside JSON
- do not repeat the full analysis

Issue:
${issue}

Analysis:
${JSON.stringify(analysis)}

Possible causes:
${JSON.stringify(causes)}

Action plan:
${JSON.stringify(actions)}

Safety review:
${JSON.stringify(safety)}
`;

  return await askAIJson(
    "You are a concise reliability critic. Return JSON only.",
    prompt,
    CriticReviewSchema,
  );
}
