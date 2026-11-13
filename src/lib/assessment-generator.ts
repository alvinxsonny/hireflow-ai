import { callGeminiWithRetry } from "@/lib/gemini";

export interface GeneratedQuestion {
  id: string;
  type: "TECHNICAL" | "APTITUDE";
  question: string;
  options: string[];
  correctAnswer: number; // 0-3
  explanation?: string;
}

export async function generateAssessmentWithAI(
  jobTitle: string,
  requiredSkills: string[],
  count = 5
): Promise<GeneratedQuestion[]> {
  const prompt = `
Create ${count} multiple-choice test questions for the role "${jobTitle}".
Skills to test: ${requiredSkills.join(", ") || "General Problem Solving & Technical Aptitude"}.
Include a mix of technical coding/architecture questions and logical reasoning questions.
Each question must have exactly 4 options. Indicate the 0-based index of the correct answer.

Output ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "type": "TECHNICAL",
      "question": "What is the primary purpose of...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Option A is correct because..."
    }
  ]
}
`;

  try {
    const result = await callGeminiWithRetry<{
      questions: Array<{
        type: "TECHNICAL" | "APTITUDE";
        question: string;
        options: string[];
        correctAnswer: number;
        explanation?: string;
      }>;
    }>(prompt, "You are a senior technical interviewer creating accurate multiple-choice assessment questions.");

    if (result.questions && result.questions.length > 0) {
      return result.questions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx + 1}`,
        type: q.type || "TECHNICAL",
        question: q.question,
        options: q.options && q.options.length === 4 ? q.options : ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        explanation: q.explanation,
      }));
    }
  } catch (err: any) {
    console.warn("[Assessment Generator] AI failed, falling back to curated test bank:", err?.message);
  }

  // Curated Fallback Assessment Bank
  return [
    {
      id: `q-1`,
      type: "TECHNICAL",
      question: `In modern web development with ${requiredSkills[0] || "TypeScript/React"}, what is the primary architectural benefit of Server Components?`,
      options: [
        "They eliminate the need for any CSS styling in the client bundle",
        "They execute exclusively on the server, significantly reducing client-side JavaScript bundle size",
        "They convert client state into permanent browser cookies",
        "They bypass HTTP and communicate directly via raw TCP sockets",
      ],
      correctAnswer: 1,
      explanation: "Server components render on the server, shipping zero client-side JavaScript for those components.",
    },
    {
      id: `q-2`,
      type: "TECHNICAL",
      question: "Which of the following database operations has an average time complexity of O(1) when retrieving a record by its unique index in a hash-based index?",
      options: [
        "Full table scan with regex filter",
        "Point lookup on a hash index",
        "B-Tree index range traversal across 10 million rows",
        "Nested Cartesian join on unindexed foreign keys",
      ],
      correctAnswer: 1,
      explanation: "Hash indexes provide constant O(1) average lookup time for point queries.",
    },
    {
      id: `q-3`,
      type: "APTITUDE",
      question: "If a server cluster processes 1,200 requests per minute with 4 worker nodes, how many requests per second does each node handle on average?",
      options: ["5 requests/sec", "20 requests/sec", "50 requests/sec", "300 requests/sec"],
      correctAnswer: 0,
      explanation: "1,200 req/min = 20 req/sec total across cluster. 20 / 4 workers = 5 req/sec per node.",
    },
    {
      id: `q-4`,
      type: "TECHNICAL",
      question: "In asynchronous event-driven architectures, what mechanism prevents rapid repeat execution during burst user actions (such as keystroke search)?",
      options: ["Polymorphism", "Debouncing / Throttling", "Garbage collection", "Deadlock detection"],
      correctAnswer: 1,
      explanation: "Debouncing postpones execution until a specified quiet period has elapsed.",
    },
    {
      id: `q-5`,
      type: "APTITUDE",
      question: "You have a microservice with a 99% uptime SLA. Approximately what is the maximum permissible unplanned downtime in a 30-day month (720 hours)?",
      options: ["43 minutes", "7.2 hours", "24 hours", "72 hours"],
      correctAnswer: 1,
      explanation: "1% of 720 hours = 7.2 hours of maximum permissible downtime.",
    },
  ];
}
