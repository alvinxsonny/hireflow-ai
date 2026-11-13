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

// Empty initial interviews — created only when HR schedules an interview
let inMemoryInterviews: InterviewRecord[] = [];

export async function createInterview(data: Omit<InterviewRecord, "id" | "createdAt" | "status">) {
  const newInterview: InterviewRecord = {
    id: `int-${Date.now()}`,
    ...data,
    status: "SCHEDULED",
    createdAt: new Date().toISOString(),
  };

  inMemoryInterviews.unshift(newInterview);
  return newInterview;
}

export async function getAllInterviews() {
  return inMemoryInterviews;
}

export async function getInterviewById(id: string) {
  return inMemoryInterviews.find((i) => i.id === id) || null;
}

export async function getInterviewByApplicationId(applicationId: string) {
  return inMemoryInterviews.find((i) => i.applicationId === applicationId) || null;
}

export async function submitInterviewScorecard(
  interviewId: string,
  scorecard: Omit<InterviewScorecard, "submittedAt">
) {
  const interview = inMemoryInterviews.find((i) => i.id === interviewId);
  if (!interview) return null;

  interview.scorecard = {
    ...scorecard,
    submittedAt: new Date().toISOString(),
  };
  interview.status = "COMPLETED";

  return interview;
}

