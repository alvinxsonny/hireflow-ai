import { GoogleGenerativeAI } from "@google/generative-ai";

const groqApiKey = process.env.GROQ_API_KEY || "";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Groq models (Fastest AI inference on earth: 300 - 800+ tokens/sec)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

// Fallback Gemini models if Groq key is absent or exhausted
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

/**
 * Call Groq API via high-performance OpenAI-compatible REST endpoint.
 */
async function callGroq<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `${systemInstruction || "You are a recruitment AI assistant."} You MUST return ONLY valid raw JSON with no Markdown backticks or commentary.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Groq HTTP ${res.status}: ${errorBody}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Groq ${model} attempt failed]:`, err?.message);
      // Try next Groq model
    }
  }

  throw lastError || new Error("All Groq models failed.");
}

/**
 * Primary AI execution engine.
 * Automatically uses ultra-fast Groq if GROQ_API_KEY is present, with seamless fallback to Gemini.
 */
export async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction?: string,
  retries = 2
): Promise<T> {
  // 1. Try Groq First (Instant 0.2s - 0.4s response)
  if (groqApiKey) {
    try {
      return await callGroq<T>(prompt, systemInstruction);
    } catch (groqErr) {
      console.warn("[Groq Error] Falling back to Gemini:", groqErr);
    }
  }

  // 2. Fallback to Gemini 1.5 Flash
  if (!genAI || !geminiApiKey) {
    throw new Error(
      "Neither GROQ_API_KEY nor GEMINI_API_KEY is configured. Please set at least one in your environment."
    );
  }

  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
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
        const cleaned = text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        return JSON.parse(cleaned) as T;
      } catch (error: any) {
        lastError = error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("Failed to get response from AI providers");
}
