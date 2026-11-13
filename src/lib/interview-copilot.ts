import { callGeminiWithRetry } from "@/lib/gemini";

export interface AISuggestedQuestion {
  category: "TECHNICAL_DEEP_DIVE" | "BEHAVIORAL" | "RESUME_GAP_VERIFICATION" | "PROBLEM_SOLVING";
  question: string;
  context: string;
}

export async function generateInterviewQuestionsWithAI(
  jobTitle: string,
  requiredSkills: string[],
  candidateName: string,
  weaknesses: string[] = []
): Promise<AISuggestedQuestion[]> {
  const prompt = `
You are an expert technical interviewer and hiring co-pilot.
Generate 4 tailored interview questions for candidate "${candidateName}" interviewing for the role "${jobTitle}".
Key role requirements: ${requiredSkills.join(", ")}.
Candidate areas to verify or explore: ${weaknesses.join("; ") || "General architecture depth and scaling challenges"}.

Output ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "category": "TECHNICAL_DEEP_DIVE",
      "question": "Can you describe how you architected...",
      "context": "Verifies hands-on experience with high-throughput systems."
    }
  ]
}
`;

  try {
    const result = await callGeminiWithRetry<{
      questions: AISuggestedQuestion[];
    }>(prompt, "You are an AI Interview Co-Pilot assisting hiring managers with rigorous interview questions.");

    if (result.questions && result.questions.length > 0) {
      return result.questions;
    }
  } catch (err: any) {
    console.warn("[Interview Co-Pilot] AI failed, falling back to curated role questions:", err?.message);
  }

  // Curated Fallback Interview Questions
  return [
    {
      category: "TECHNICAL_DEEP_DIVE",
      question: `Walk me through the most complex system architecture you designed involving ${requiredSkills[0] || "modern web frameworks"}. What trade-offs did you make regarding caching, database indexing, and latency?`,
      context: `Verifies deep technical craftsmanship and practical system design understanding.`,
    },
    {
      category: "RESUME_GAP_VERIFICATION",
      question: `Our stack relies heavily on ${requiredSkills[1] || "PostgreSQL and vector embeddings"}. Describe your experience implementing data migrations and handling connection pooling under load.`,
      context: `Probes candidate capability in data resilience and scaling bottlenecks.`,
    },
    {
      category: "PROBLEM_SOLVING",
      question: `Suppose a production incident causes sudden 504 Gateway Timeouts across our API during a traffic spike. How do you isolate the root cause between database locks, external APIs, and compute memory exhaustion?`,
      context: `Evaluates real-time debugging discipline, observability tools, and structured troubleshooting.`,
    },
    {
      category: "BEHAVIORAL",
      question: `Describe a situation where you strongly disagreed with a product specification or engineering priority. How did you communicate your concerns and reach a consensus?`,
      context: `Assesses collaborative maturity, communication skills, and empathy in high-velocity teams.`,
    },
  ];
}

