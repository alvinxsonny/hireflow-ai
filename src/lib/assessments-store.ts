import { GeneratedQuestion } from "@/lib/assessment-generator";

export interface ProctoringViolation {
  id: string;
  type: "TAB_SWITCH" | "FULLSCREEN_EXIT" | "COPY_PASTE" | "WINDOW_BLUR" | "CAMERA_UNAVAILABLE";
  timestamp: string;
  message: string;
}

export interface AssessmentRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
  timeLimitMinutes: number;
  questions: GeneratedQuestion[];
  candidateAnswers: Record<string, number>; // questionId -> chosenOptionIndex
  totalScore?: number; // 0 to 100
  isPassed?: boolean;
  proctoringScore: number; // Starts at 100, drops per violation
  violations: ProctoringViolation[];
  startedAt?: string;
  submittedAt?: string;
  createdAt: string;
}

let inMemoryAssessments: AssessmentRecord[] = [
  {
    id: "test-1",
    applicationId: "app-101",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    jobTitle: "Senior Full-Stack Engineer",
    status: "NOT_STARTED",
    timeLimitMinutes: 15,
    questions: [
      {
        id: "q-1",
        type: "TECHNICAL",
        question: "In Next.js 14 App Router, which file naming convention creates an isolated sub-tree error boundary?",
        options: ["not-found.tsx", "error.tsx", "catch.tsx", "fault.tsx"],
        correctAnswer: 1,
        explanation: "error.tsx defines an Error Boundary for a route segment.",
      },
      {
        id: "q-2",
        type: "TECHNICAL",
        question: "What is the primary benefit of using PostgreSQL pgvector over external vector search APIs?",
        options: [
          "It forces all vector dimensions to equal 1",
          "It allows ACID-compliant relational joins directly between application data and embeddings in a single database transaction",
          "It prevents any user authentication checks",
          "It disables SQL query optimization",
        ],
        correctAnswer: 1,
        explanation: "pgvector keeps vector embeddings and relational entities in the same transactional PostgreSQL instance.",
      },
      {
        id: "q-3",
        type: "APTITUDE",
        question: "A background batch worker screens 15 resumes in 60 seconds. At this constant throughput, how many minutes will it take to screen 450 resumes?",
        options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
        correctAnswer: 1,
        explanation: "Rate is 15 resumes/minute. 450 / 15 = 30 minutes.",
      },
      {
        id: "q-4",
        type: "TECHNICAL",
        question: "Which HTTP header is typically used to prevent Clickjacking attacks by forbidding iframe embedding from foreign origins?",
        options: ["X-Frame-Options: DENY", "Access-Control-Allow-Origin: *", "Content-Type: text/html", "ETag: 12345"],
        correctAnswer: 0,
        explanation: "X-Frame-Options: DENY instructs browsers not to render the page in a frame or iframe.",
      },
      {
        id: "q-5",
        type: "APTITUDE",
        question: "In an A/B test, Variant A converts at 4% and Variant B converts at 6%. What is the relative percentage improvement of Variant B over Variant A?",
        options: ["2%", "20%", "50%", "150%"],
        correctAnswer: 2,
        explanation: "(6 - 4) / 4 = 2 / 4 = 50% relative increase.",
      },
    ],
    candidateAnswers: {},
    proctoringScore: 100,
    violations: [],
    createdAt: new Date().toISOString(),
  },
];

export async function createAssessment(data: Omit<AssessmentRecord, "id" | "createdAt" | "proctoringScore" | "violations" | "candidateAnswers">) {
  const newAssessment: AssessmentRecord = {
    id: `test-${Date.now()}`,
    ...data,
    candidateAnswers: {},
    proctoringScore: 100,
    violations: [],
    createdAt: new Date().toISOString(),
  };

  inMemoryAssessments.unshift(newAssessment);
  return newAssessment;
}

export async function getAssessmentById(id: string) {
  return inMemoryAssessments.find((a) => a.id === id) || null;
}

export async function getAssessmentByApplicationId(applicationId: string) {
  return inMemoryAssessments.find((a) => a.applicationId === applicationId) || null;
}

export async function recordViolation(
  assessmentId: string,
  type: ProctoringViolation["type"],
  message: string
) {
  const test = inMemoryAssessments.find((a) => a.id === assessmentId);
  if (!test) return null;

  const violation: ProctoringViolation = {
    id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    timestamp: new Date().toISOString(),
    message,
  };

  test.violations.push(violation);

  // Deduct integrity score: Tab switches deduct 15 points, fullscreen exit 10 points, copy paste 10 points
  const penalty = type === "TAB_SWITCH" ? 15 : type === "FULLSCREEN_EXIT" ? 10 : 5;
  test.proctoringScore = Math.max(0, test.proctoringScore - penalty);

  return { test, violation };
}

export async function submitAssessment(
  assessmentId: string,
  candidateAnswers: Record<string, number>
) {
  const test = inMemoryAssessments.find((a) => a.id === assessmentId);
  if (!test) return null;

  test.candidateAnswers = candidateAnswers;
  test.submittedAt = new Date().toISOString();
  test.status = "SUBMITTED";

  // Calculate score
  let correctCount = 0;
  test.questions.forEach((q) => {
    const candidateChoice = candidateAnswers[q.id];
    if (candidateChoice !== undefined && candidateChoice === q.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = test.questions.length || 1;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  test.totalScore = scorePercentage;
  test.isPassed = scorePercentage >= 60; // 60% passing mark

  return test;
}
