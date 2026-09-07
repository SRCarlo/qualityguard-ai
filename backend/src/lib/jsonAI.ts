import { askAI } from "./ai.js";

function extractJson(text: string): string {
  let cleaned = text.trim();

  // Remove markdown code fences if the model
  // accidentally returns them.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Find the JSON object.
  const firstBrace = cleaned.indexOf("{");

  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export async function askAIJson<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: {
    parse: (data: unknown) => T;
  },
): Promise<T> {
  const maxAttempts = 3;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await askAI(systemPrompt, userPrompt);

      console.log(`🤖 Raw AI response attempt ${attempt}:`);

      console.log(response);

      if (!response || !response.trim()) {
        throw new Error("AI returned an empty response");
      }

      const jsonText = extractJson(response);

      console.log(`📦 Extracted JSON attempt ${attempt}:`);

      console.log(jsonText);

      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonText);
      } catch (jsonError: any) {
        console.error("❌ JSON.parse failed:");

        console.error(jsonError?.message);

        throw new Error("AI returned invalid JSON");
      }

      try {
        const validated = schema.parse(parsed);

        console.log(`✅ Schema validation passed on attempt ${attempt}`);

        return validated;
      } catch (schemaError: any) {
        console.error("❌ Zod validation failed:");

        console.error(schemaError?.message);

        throw new Error("AI response did not match the required schema");
      }
    } catch (error: any) {
      lastError = error;

      console.error(`❌ Structured AI output failed on attempt ${attempt}:`);

      console.error(error?.message || error);

      if (attempt < maxAttempts) {
        console.log("🔄 Retrying structured AI response...");

        await new Promise((resolve) => setTimeout(resolve, 1500));

        continue;
      }
    }
  }

  console.error(" All structured AI attempts failed.");

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "AI returned an invalid structured response",
  );
}
