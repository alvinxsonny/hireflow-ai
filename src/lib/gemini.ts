import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client using Google AI Studio Free Tier Key
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json",
  },
});

/**
 * Helper to call Gemini with exponential backoff to easily respect
 * the Google AI Studio free-tier rate limits (15 RPM / 1M TPM).
 */
export async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction?: string,
  retries = 3,
  delayMs = 2000
): Promise<T> {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please get a free key from https://aistudio.google.com/app/apikey and add it to your .env"
    );
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as T;
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("Quota exceeded");

      if (isRateLimit && attempt < retries) {
        console.warn(
          `[Gemini Free Tier] Rate limit reached. Backing off for ${delayMs}ms (Attempt ${attempt}/${retries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Failed to get response from Gemini API after retries");
}
