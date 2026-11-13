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

// Empty initial applications — only real applications submitted by candidates will appear
let inMemoryApplications: ApplicationRecord[] = [];

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

