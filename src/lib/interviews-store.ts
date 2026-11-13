import { prisma } from "@/lib/prisma";
import { AISuggestedQuestion } from "@/lib/interview-copilot";

export interface InterviewScorecard {
  technicalRating: number; // 1 to 5
  communicationRating: number; // 1 to 5
  problemSolvingRating: number; // 1 to 5
  culturalFitRating: number; // 1 to 5
  recommendation: "STRONG_HIRE" | "HIRE" | "HOLD" | "REJECT";
  notes: string;
  submittedAt: string;
}

export interface InterviewRecord {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  interviewerName: string;
  scheduledAt: string;
  meetingLink: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  aiSuggestedQuestions: AISuggestedQuestion[];
  scorecard?: InterviewScorecard;
  createdAt: string;
}

let inMemoryInterviews: InterviewRecord[] = [];

export async function createInterview(data: Omit<InterviewRecord, "id" | "createdAt" | "status">): Promise<InterviewRecord> {
  const newInterview: InterviewRecord = {
    id: `int-${Date.now()}`,
    ...data,
    status: "SCHEDULED",
    createdAt: new Date().toISOString(),
  };

  try {
    const scheduledDate = new Date(data.scheduledAt);
    const validDate = isNaN(scheduledDate.getTime()) ? new Date() : scheduledDate;

    const dbInt = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        scheduledAt: validDate,
        meetingLink: data.meetingLink,
        status: "SCHEDULED",
        aiSuggestedQuestions: data.aiSuggestedQuestions as any,
      },
    });

    newInterview.id = dbInt.id;
  } catch (e) {
    console.error("[createInterview] DB error:", e);
  }

  inMemoryInterviews.unshift(newInterview);
  return newInterview;
}

export async function getAllInterviews(): Promise<InterviewRecord[]> {
  try {
    const dbInterviews = await prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    if (dbInterviews.length > 0) {
      return dbInterviews.map((i) => ({
        id: i.id,
        applicationId: i.applicationId,
        candidateName: i.application.candidate.fullName,
        candidateEmail: i.application.candidate.email,
        jobTitle: i.application.job.title,
        interviewerName: "HR Recruiter",
        scheduledAt: i.scheduledAt.toISOString(),
        meetingLink: i.meetingLink || "",
        status: i.status as any,
        aiSuggestedQuestions: (i.aiSuggestedQuestions as any) || [],
        scorecard: i.technicalRating ? {
          technicalRating: i.technicalRating,
          communicationRating: i.communicationRating || 4,
          problemSolvingRating: 4,
          culturalFitRating: 4,
          recommendation: (i.recommendation as any) || "HIRE",
          notes: i.feedbackNotes || "",
          submittedAt: i.updatedAt.toISOString(),
        } : undefined,
        createdAt: i.createdAt.toISOString(),
      }));
    }
  } catch (e) {
    console.error("[getAllInterviews] DB query error:", e);
  }

  return inMemoryInterviews;
}

export async function getInterviewById(id: string): Promise<InterviewRecord | null> {
  try {
    const i = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (i) {
      return {
        id: i.id,
        applicationId: i.applicationId,
        candidateName: i.application.candidate.fullName,
        candidateEmail: i.application.candidate.email,
        jobTitle: i.application.job.title,
        interviewerName: "HR Recruiter",
        scheduledAt: i.scheduledAt.toISOString(),
        meetingLink: i.meetingLink || "",
        status: i.status as any,
        aiSuggestedQuestions: (i.aiSuggestedQuestions as any) || [],
        scorecard: i.technicalRating ? {
          technicalRating: i.technicalRating,
          communicationRating: i.communicationRating || 4,
          problemSolvingRating: 4,
          culturalFitRating: 4,
          recommendation: (i.recommendation as any) || "HIRE",
          notes: i.feedbackNotes || "",
          submittedAt: i.updatedAt.toISOString(),
        } : undefined,
        createdAt: i.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getInterviewById] DB query error:", e);
  }

  return inMemoryInterviews.find((i) => i.id === id) || null;
}

export async function getInterviewByApplicationId(applicationId: string): Promise<InterviewRecord | null> {
  try {
    const i = await prisma.interview.findFirst({
      where: { applicationId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (i) {
      return {
        id: i.id,
        applicationId: i.applicationId,
        candidateName: i.application.candidate.fullName,
        candidateEmail: i.application.candidate.email,
        jobTitle: i.application.job.title,
        interviewerName: "HR Recruiter",
        scheduledAt: i.scheduledAt.toISOString(),
        meetingLink: i.meetingLink || "",
        status: i.status as any,
        aiSuggestedQuestions: (i.aiSuggestedQuestions as any) || [],
        scorecard: i.technicalRating ? {
          technicalRating: i.technicalRating,
          communicationRating: i.communicationRating || 4,
          problemSolvingRating: 4,
          culturalFitRating: 4,
          recommendation: (i.recommendation as any) || "HIRE",
          notes: i.feedbackNotes || "",
          submittedAt: i.updatedAt.toISOString(),
        } : undefined,
        createdAt: i.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getInterviewByApplicationId] DB error:", e);
  }

  return inMemoryInterviews.find((i) => i.applicationId === applicationId) || null;
}

export async function submitInterviewScorecard(
  interviewId: string,
  scorecard: Omit<InterviewScorecard, "submittedAt">
): Promise<InterviewRecord | null> {
  try {
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        technicalRating: scorecard.technicalRating,
        communicationRating: scorecard.communicationRating,
        recommendation: scorecard.recommendation,
        feedbackNotes: scorecard.notes,
      },
    });
  } catch (e) {
    console.error("[submitInterviewScorecard] DB error:", e);
  }

  const interview = inMemoryInterviews.find((i) => i.id === interviewId);
  if (interview) {
    interview.scorecard = {
      ...scorecard,
      submittedAt: new Date().toISOString(),
    };
    interview.status = "COMPLETED";
    return interview;
  }

  return getInterviewById(interviewId);
}
