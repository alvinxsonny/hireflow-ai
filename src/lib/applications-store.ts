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

let inMemoryApplications: ApplicationRecord[] = [];

export async function createApplicationRecord(data: Omit<ApplicationRecord, "id" | "createdAt">): Promise<ApplicationRecord> {
  const newRecord: ApplicationRecord = {
    id: `app-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };

  try {
    let candidateUser = await prisma.user.findUnique({
      where: { email: data.candidateEmail.toLowerCase().trim() },
    });

    if (!candidateUser) {
      candidateUser = await prisma.user.create({
        data: {
          email: data.candidateEmail.toLowerCase().trim(),
          fullName: data.candidateName,
          phone: data.candidatePhone,
          portfolioUrl: data.portfolioUrl,
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
            parsedSkills: data.matchedSkills || [],
            aiStrengths: data.strengths || [],
            aiWeaknesses: data.weaknesses || [],
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
    console.error("[createApplicationRecord] DB error:", e);
  }

  inMemoryApplications.unshift(newRecord);
  return newRecord;
}

export async function getApplications(filter?: { candidateEmail?: string; jobId?: string }): Promise<ApplicationRecord[]> {
  try {
    const dbApps = await prisma.application.findMany({
      where: {
        ...(filter?.jobId ? { jobId: filter.jobId } : {}),
        ...(filter?.candidateEmail
          ? { candidate: { email: { equals: filter.candidateEmail.toLowerCase().trim(), mode: "insensitive" } } }
          : {}),
      },
      include: {
        job: true,
        candidate: true,
        resume: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbApps.length > 0) {
      return dbApps.map((a) => ({
        id: a.id,
        jobId: a.jobId,
        jobTitle: a.job.title,
        candidateName: a.candidate.fullName,
        candidateEmail: a.candidate.email,
        candidatePhone: a.candidate.phone || undefined,
        portfolioUrl: a.candidate.portfolioUrl || undefined,
        coverLetter: a.coverLetter || undefined,
        resumeFileName: "resume.pdf",
        resumeFileUrl: a.resume?.fileUrl || "",
        resumeRawText: a.resume?.rawText || undefined,
        status: a.status as any,
        matchScore: a.resume?.matchScore ? Number(a.resume.matchScore) : undefined,
        aiSummary: a.resume?.aiSummary || undefined,
        matchedSkills: a.resume?.parsedSkills || [],
        strengths: a.resume?.aiStrengths || [],
        weaknesses: a.resume?.aiWeaknesses || [],
        createdAt: a.createdAt.toISOString(),
      }));
    }
  } catch (e) {
    console.error("[getApplications] DB query error:", e);
  }

  let list = [...inMemoryApplications];
  if (filter?.candidateEmail) {
    list = list.filter((a) => a.candidateEmail.toLowerCase() === filter.candidateEmail!.toLowerCase());
  }
  if (filter?.jobId) {
    list = list.filter((a) => a.jobId === filter.jobId);
  }
  return list;
}

export async function getApplicationById(id: string): Promise<ApplicationRecord | null> {
  try {
    const a = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        resume: true,
      },
    });

    if (a) {
      return {
        id: a.id,
        jobId: a.jobId,
        jobTitle: a.job.title,
        candidateName: a.candidate.fullName,
        candidateEmail: a.candidate.email,
        candidatePhone: a.candidate.phone || undefined,
        portfolioUrl: a.candidate.portfolioUrl || undefined,
        coverLetter: a.coverLetter || undefined,
        resumeFileName: "resume.pdf",
        resumeFileUrl: a.resume?.fileUrl || "",
        resumeRawText: a.resume?.rawText || undefined,
        status: a.status as any,
        matchScore: a.resume?.matchScore ? Number(a.resume.matchScore) : undefined,
        aiSummary: a.resume?.aiSummary || undefined,
        matchedSkills: a.resume?.parsedSkills || [],
        strengths: a.resume?.aiStrengths || [],
        weaknesses: a.resume?.aiWeaknesses || [],
        createdAt: a.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getApplicationById] DB error:", e);
  }

  return inMemoryApplications.find((a) => a.id === id) || null;
}

export async function updateApplicationRecord(
  id: string,
  updates: Partial<ApplicationRecord>
): Promise<ApplicationRecord | null> {
  try {
    const existingResume = await prisma.resume.findUnique({ where: { applicationId: id } });

    await prisma.application.update({
      where: { id },
      data: {
        ...(updates.status ? { status: updates.status as any } : {}),
      },
    });

    if (
      updates.matchScore !== undefined ||
      updates.aiSummary ||
      updates.matchedSkills ||
      updates.strengths ||
      updates.weaknesses
    ) {
      if (existingResume) {
        await prisma.resume.update({
          where: { applicationId: id },
          data: {
            ...(updates.matchScore !== undefined ? { matchScore: updates.matchScore } : {}),
            ...(updates.aiSummary ? { aiSummary: updates.aiSummary } : {}),
            ...(updates.matchedSkills ? { parsedSkills: updates.matchedSkills } : {}),
            ...(updates.strengths ? { aiStrengths: updates.strengths } : {}),
            ...(updates.weaknesses ? { aiWeaknesses: updates.weaknesses } : {}),
          },
        });
      } else {
        await prisma.resume.create({
          data: {
            applicationId: id,
            fileUrl: updates.resumeFileUrl || "/uploads/resumes/default.pdf",
            matchScore: updates.matchScore,
            aiSummary: updates.aiSummary,
            parsedSkills: updates.matchedSkills || [],
            aiStrengths: updates.strengths || [],
            aiWeaknesses: updates.weaknesses || [],
          },
        });
      }
    }
  } catch (e) {
    console.error("[updateApplicationRecord] DB update error:", e);
  }

  const index = inMemoryApplications.findIndex((a) => a.id === id);
  if (index !== -1) {
    inMemoryApplications[index] = {
      ...inMemoryApplications[index],
      ...updates,
    };
    return inMemoryApplications[index];
  }

  return getApplicationById(id);
}
