import { prisma } from "@/lib/prisma";
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

let inMemoryAssessments: AssessmentRecord[] = [];

export async function createAssessment(
  data: Omit<AssessmentRecord, "id" | "createdAt" | "proctoringScore" | "violations" | "candidateAnswers">
): Promise<AssessmentRecord> {
  const newAssessment: AssessmentRecord = {
    id: `test-${Date.now()}`,
    ...data,
    candidateAnswers: {},
    proctoringScore: 100,
    violations: [],
    createdAt: new Date().toISOString(),
  };

  try {
    const dbAssessment = await prisma.assessment.create({
      data: {
        applicationId: data.applicationId,
        timeLimitMins: data.timeLimitMinutes,
        proctoringScore: 100,
        questions: {
          create: data.questions.map((q) => ({
            questionText: q.question,
            options: q.options as any,
            correctAnswer: String(q.correctAnswer),
          })),
        },
      },
    });

    newAssessment.id = dbAssessment.id;
  } catch (e) {
    console.error("[createAssessment] DB error:", e);
  }

  inMemoryAssessments.unshift(newAssessment);
  return newAssessment;
}

export async function getAssessmentById(id: string): Promise<AssessmentRecord | null> {
  try {
    const a = await prisma.assessment.findFirst({
      where: {
        OR: [{ id }, { applicationId: id }],
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        questions: true,
        proctoringLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (a) {
      return {
        id: a.id,
        applicationId: a.applicationId,
        candidateName: a.application.candidate.fullName,
        candidateEmail: a.application.candidate.email,
        jobTitle: a.application.job.title,
        status: a.submittedAt ? "SUBMITTED" : a.startedAt ? "IN_PROGRESS" : "NOT_STARTED",
        timeLimitMinutes: a.timeLimitMins,
        questions: a.questions.map((q) => ({
          id: q.id,
          question: q.questionText,
          options: (q.options as string[]) || [],
          correctAnswer: Number(q.correctAnswer || 0),
          explanation: "",
          skill: "Technical",
          type: "TECHNICAL" as const,
        })),
        candidateAnswers: {},
        totalScore: a.totalScore ? Number(a.totalScore) : undefined,
        isPassed: a.isPassed,
        proctoringScore: a.proctoringScore ? Number(a.proctoringScore) : 100,
        violations: a.proctoringLogs.map((p) => ({
          id: p.id,
          type: (p.eventType as any) || "TAB_SWITCH",
          timestamp: p.timestamp.toISOString(),
          message: (p.details as any)?.message || p.eventType,
        })),
        startedAt: a.startedAt?.toISOString() || undefined,
        submittedAt: a.submittedAt?.toISOString() || undefined,
        createdAt: a.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getAssessmentById] DB query error:", e);
  }

  return inMemoryAssessments.find((a) => a.id === id) || null;
}

export async function getAssessmentByApplicationId(applicationId: string): Promise<AssessmentRecord | null> {
  try {
    const a = await prisma.assessment.findFirst({
      where: { applicationId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        questions: true,
        proctoringLogs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (a) {
      return {
        id: a.id,
        applicationId: a.applicationId,
        candidateName: a.application.candidate.fullName,
        candidateEmail: a.application.candidate.email,
        jobTitle: a.application.job.title,
        status: a.submittedAt ? "SUBMITTED" : a.startedAt ? "IN_PROGRESS" : "NOT_STARTED",
        timeLimitMinutes: a.timeLimitMins,
        questions: a.questions.map((q) => ({
          id: q.id,
          question: q.questionText,
          options: (q.options as string[]) || [],
          correctAnswer: Number(q.correctAnswer || 0),
          explanation: "",
          skill: "Technical",
          type: "TECHNICAL" as const,
        })),
        candidateAnswers: {},
        totalScore: a.totalScore ? Number(a.totalScore) : undefined,
        isPassed: a.isPassed,
        proctoringScore: a.proctoringScore ? Number(a.proctoringScore) : 100,
        violations: a.proctoringLogs.map((p) => ({
          id: p.id,
          type: (p.eventType as any) || "TAB_SWITCH",
          timestamp: p.timestamp.toISOString(),
          message: (p.details as any)?.message || p.eventType,
        })),
        startedAt: a.startedAt?.toISOString() || undefined,
        submittedAt: a.submittedAt?.toISOString() || undefined,
        createdAt: a.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getAssessmentByApplicationId] DB error:", e);
  }

  return inMemoryAssessments.find((a) => a.applicationId === applicationId) || null;
}

export async function recordViolation(
  assessmentId: string,
  type: ProctoringViolation["type"],
  message: string
) {
  const penalty = type === "TAB_SWITCH" ? 15 : type === "FULLSCREEN_EXIT" ? 10 : 5;
  const test = await getAssessmentById(assessmentId);
  const targetId = test?.id || assessmentId;

  try {
    await prisma.proctoringLog.create({
      data: {
        assessmentId: targetId,
        eventType: type,
        details: { message },
      },
    });

    await prisma.assessment.update({
      where: { id: targetId },
      data: {
        proctoringScore: {
          decrement: penalty,
        },
      },
    });
  } catch (e) {
    console.error("[recordViolation] DB error:", e);
  }

  const inMem = inMemoryAssessments.find((a) => a.id === targetId || a.applicationId === assessmentId);
  const violation: ProctoringViolation = {
    id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    timestamp: new Date().toISOString(),
    message,
  };

  if (inMem) {
    inMem.violations.push(violation);
    inMem.proctoringScore = Math.max(0, inMem.proctoringScore - penalty);
    return { test: inMem, violation };
  }

  return { test: await getAssessmentById(targetId), violation };
}

export async function submitAssessment(
  assessmentId: string,
  candidateAnswers: Record<string, number>
) {
  const test = await getAssessmentById(assessmentId);
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
  const isPassed = scorePercentage >= 60;

  test.totalScore = scorePercentage;
  test.isPassed = isPassed;

  try {
    await prisma.assessment.update({
      where: { id: test.id },
      data: {
        submittedAt: new Date(),
        totalScore: scorePercentage,
        isPassed,
      },
    });
  } catch (e) {
    console.error("[submitAssessment] DB error:", e);
  }

  const inMem = inMemoryAssessments.find((a) => a.id === assessmentId);
  if (inMem) {
    inMem.candidateAnswers = candidateAnswers;
    inMem.submittedAt = test.submittedAt;
    inMem.status = "SUBMITTED";
    inMem.totalScore = scorePercentage;
    inMem.isPassed = isPassed;
  }

  return test;
}
