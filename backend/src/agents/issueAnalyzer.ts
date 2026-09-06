import { askAIJson } from "../lib/jsonAI.js";
import { IssueAnalysisSchema } from "../types/agentOutput.js";

export async function issueAnalyzer(issue: string) {
  const prompt = `
Extract facts from this manufacturing issue.

Return ONLY valid JSON.

Use exactly this format:

{
  "machine": "",
  "defect": "",
  "quantity": "",
  "time": "",
  "measurements": "",
  "maintenance": "",
  "missingInformation": []
}

Rules:
- Do NOT invent information.
- Use "Not provided" when missing.
- Keep each field short.
- missingInformation should contain only missing facts.

Issue:
${issue}
`;

  return await askAIJson(
    "You are a concise manufacturing fact extraction agent. Return JSON only.",
    prompt,
    IssueAnalysisSchema,
  );
}
