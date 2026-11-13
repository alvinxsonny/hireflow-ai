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

// Empty initial assessments — generated dynamically when HR approves a candidate for testing
let inMemoryAssessments: AssessmentRecord[] = [];

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

