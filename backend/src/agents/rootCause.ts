import { askAIJson } from "../lib/jsonAI.js";
import { RootCauseSchema } from "../types/agentOutput.js";

export async function rootCause(issue: string, analysis: unknown) {
  const prompt = `
Identify up to 3 possible causes for this manufacturing issue.

Return ONLY valid JSON.

Use exactly this format:

{
  "causes": [
    {
      "cause": "",
      "confidence": "Low",
      "whyPossible": "",
      "evidenceNeeded": ""
    }
  ]
}

Rules:
- Maximum 3 causes.
- Each cause must be short.
- whyPossible must be less than 20 words.
- evidenceNeeded must be less than 20 words.
- confidence must be Low, Medium, or High.
- Causes are hypotheses, NOT confirmed root causes.
- Do not invent facts.
- Do not provide explanations outside JSON.

Issue:
${issue}

Issue analysis:
${JSON.stringify(analysis)}
`;

  return await askAIJson(
    "You are a concise manufacturing root-cause agent. Return JSON only.",
    prompt,
    RootCauseSchema,
  );
}
