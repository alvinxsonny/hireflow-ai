import { prisma } from "@/lib/prisma";

export interface ApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  resumeFileName: string;
  resumeFileUrl: string;
  resumeRawText?: string;
  status:
    | "APPLIED"
    | "SCREENED"
    | "SHORTLISTED"
    | "ASSESSMENT_PENDING"
    | "ASSESSMENT_COMPLETED"
    | "INTERVIEW_SCHEDULED"
    | "HR_REVIEW"
    | "OFFER_PENDING"
    | "OFFER_ACCEPTED"
    | "ONBOARDING"
    | "HIRED"
    | "REJECTED";
  matchScore?: number;
  aiSummary?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
  createdAt: string;
}

let inMemoryApplications: ApplicationRecord[] = [
  {
    id: "app-101",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    candidatePhone: "+1 (555) 234-5678",
    portfolioUrl: "https://alexjohnson.dev",
    coverLetter: "Excited to apply! I have 6 years building Next.js & Node.js scalable web platforms.",
    resumeFileName: "alex_johnson_resume.pdf",
    resumeFileUrl: "/uploads/resumes/mock-resume-1.pdf",
    status: "HR_REVIEW",
    matchScore: 94,
    aiSummary: "Exceptional candidate with 6 years experience in Next.js, TypeScript, PostgreSQL and AI integrations.",
    matchedSkills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL"],
    missingSkills: ["pgvector"],
    strengths: [
      "Demonstrated lead architect experience with modern Next.js 14 and SSR.",
      "Extensive background in scalable PostgreSQL relational schemas.",
    ],
    weaknesses: ["Needs verification on vector database indexing."],
    recommendation: "STRONG_SHORTLIST",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "app-102",
    jobId: "job-2",
    jobTitle: "AI / Machine Learning Engineer",
    candidateName: "Priya Sharma",
    candidateEmail: "priya.sharma@example.com",
    candidatePhone: "+1 (555) 876-5432",
    portfolioUrl: "https://priyasharma.ai",
    coverLetter: "Deep focus on LLMs, evaluation benchmarks, and vector embeddings.",
    resumeFileName: "priya_sharma_cv.pdf",
    resumeFileUrl: "/uploads/resumes/mock-resume-2.pdf",
    status: "ASSESSMENT_PENDING",
    matchScore: 91,
    aiSummary: "Strong background in PyTorch, Gemini API integration, and prompt engineering.",
    matchedSkills: ["Python", "Machine Learning", "LLMs", "Prompt Engineering"],
    missingSkills: ["FastAPI"],
    strengths: ["Strong publishing record in LLM evaluation and safety.", "Proven prompt engineering techniques."],
    weaknesses: ["Minor gap in enterprise API gateway frameworks."],
    recommendation: "SHORTLIST",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "app-103",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer",
    candidateName: "Carlos Mendez",
    candidateEmail: "carlos.mendez@example.com",
    candidatePhone: "+1 (555) 345-6789",
    coverLetter: "Applying with strong backend and cloud background.",
    resumeFileName: "carlos_mendez_resume.pdf",
    resumeFileUrl: "/uploads/resumes/mock-resume-3.pdf",
    status: "APPLIED",
    matchScore: undefined,
    createdAt: new Date().toISOString(),
  },
];

export async function createApplicationRecord(data: Omit<ApplicationRecord, "id" | "createdAt">) {
  const newRecord: ApplicationRecord = {
    id: `app-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  try {
    // Attempt Prisma if DB is available
    let candidateUser = await prisma.user.findUnique({
      where: { email: data.candidateEmail },
    });

    if (!candidateUser) {
      candidateUser = await prisma.user.create({
        data: {
          email: data.candidateEmail,
          fullName: data.candidateName,
          phone: data.candidatePhone,
          role: "CANDIDATE",
          portalAccess: "CANDIDATE",
        },
      });
    }

    const dbApp = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateId: candidateUser.id,
        coverLetter: data.coverLetter,
        status: data.status as any,
        resume: {
          create: {
            fileUrl: data.resumeFileUrl,
            rawText: data.resumeRawText || "",
            matchScore: data.matchScore,
            aiSummary: data.aiSummary,
          },
        },
      },
      include: {
        job: true,
        candidate: true,
        resume: true,
      },
    });

    newRecord.id = dbApp.id;
  } catch (e) {
    // DB offline, fall back to in-memory store
  }

  inMemoryApplications.unshift(newRecord);
  return newRecord;
}

export async function getApplications(filter?: { candidateEmail?: string; jobId?: string }) {
  let list = [...inMemoryApplications];
  if (filter?.candidateEmail) {
    list = list.filter((a) => a.candidateEmail.toLowerCase() === filter.candidateEmail!.toLowerCase());
  }
  if (filter?.jobId) {
    list = list.filter((a) => a.jobId === filter.jobId);
  }
  return list;
}

export async function getApplicationById(id: string) {
  return inMemoryApplications.find((a) => a.id === id) || null;
}

export async function updateApplicationRecord(
  id: string,
  updates: Partial<ApplicationRecord>
) {
  const index = inMemoryApplications.findIndex((a) => a.id === id);
  if (index !== -1) {
    inMemoryApplications[index] = {
      ...inMemoryApplications[index],
      ...updates,
    };
    return inMemoryApplications[index];
  }
  return null;
}

