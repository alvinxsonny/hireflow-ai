import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Preferred model hierarchy for free tier
const PREFERRED_MODELS = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

export async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction?: string,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in .env. Please add your key from Google AI Studio."
    );
  }

  let lastError: any = null;

  for (const modelName of PREFERRED_MODELS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
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
        lastError = error;
        const msg = error?.message || "";
        const isSpike = error?.status === 503 || msg.includes("high demand") || msg.includes("overloaded");
        const isRateLimit = error?.status === 429 || msg.includes("RESOURCE_EXHAUSTED");

        if (isSpike || isRateLimit) {
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
            continue;
          }
          // If all retries on this model failed, break to next model in hierarchy
          break;
        }

        // If model not found or deprecated, try next model immediately
        if (error?.status === 404 || msg.includes("not found") || msg.includes("no longer available")) {
          break;
        }

        throw error;
      }
    }
  }

  throw lastError || new Error("Failed to get response from Gemini API");
}
