import { groq } from "./groq.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function askAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🤖 Groq request attempt ${attempt}`);

      const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.1,

        max_tokens: 700,

        messages: [
          {
            role: "system",
            content: `${systemPrompt}

You are part of a manufacturing safety harness.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add explanations outside JSON.`,
          },

          {
            role: "user",
            content: userPrompt,
          },
        ],

        response_format: {
          type: "json_object",
        },
      });

      const content = response.choices?.[0]?.message?.content;

      if (!content || typeof content !== "string") {
        throw new Error("Groq returned empty content");
      }

      console.log(`✅ Groq response received on attempt ${attempt}`);

      return content;
    } catch (error: any) {
      console.error(`❌ Groq attempt ${attempt} failed`);

      console.error(error?.message || error);

      if (error?.status === 429 && attempt < maxAttempts) {
        console.log("⏳ Rate limit detected. Waiting 5 seconds...");

        await sleep(5000);

        continue;
      }

      if (attempt < maxAttempts) {
        console.log("🔄 Retrying Groq request...");

        await sleep(2000);

        continue;
      }

      throw error;
    }
  }

  throw new Error("AI request failed after multiple attempts");
}
