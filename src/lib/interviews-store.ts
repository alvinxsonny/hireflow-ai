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

let inMemoryInterviews: InterviewRecord[] = [
  {
    id: "int-1",
    applicationId: "app-101",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    jobTitle: "Senior Full-Stack Engineer",
    interviewerName: "Sarah Connor (Staff Tech Lead)",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    meetingLink: "https://meet.google.com/hfa-rec-live",
    status: "SCHEDULED",
    aiSuggestedQuestions: [
      {
        category: "TECHNICAL_DEEP_DIVE",
        question: "How do you structure Server Actions vs Route Handlers in Next.js 14 when handling transactional mutations?",
        context: "Verifies Next.js 14 backend architecture and state consistency.",
      },
      {
        category: "RESUME_GAP_VERIFICATION",
        question: "Explain how you would configure pgvector cosine similarity indexes (HNSW vs IVFFlat) for 500,000 resume records.",
        context: "Alex's resume highlighted PostgreSQL but lacked direct pgvector references.",
      },
      {
        category: "PROBLEM_SOLVING",
        question: "If an external AI API experiences 503 rate limits during batch processing, what retry and queuing strategy do you implement?",
        context: "Crucial for reliable automated screening pipelines.",
      },
      {
        category: "BEHAVIORAL",
        question: "Tell me about a time you mentored a junior developer whose code was repeatedly failing automated CI checks.",
        context: "Evaluates leadership and team mentorship.",
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

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

