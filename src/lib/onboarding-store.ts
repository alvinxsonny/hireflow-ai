import { prisma } from "@/lib/prisma";

export interface OnboardingDoc {
  id: string;
  docType: "GOVERNMENT_ID" | "TAX_DECLARATION" | "ACADEMIC_DEGREE" | "BANK_DETAILS";
  title: string;
  fileName?: string;
  fileUrl?: string;
  status: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  aiValidationNotes?: string;
  uploadedAt?: string;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingProfile {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  orientationStatus: "IN_PROGRESS" | "COMPLETED";
  checklistProgress: number; // 0 to 100
  documents: OnboardingDoc[];
  checklist: OnboardingChecklistItem[];
  createdAt: string;
}

let inMemoryOnboardingProfiles: OnboardingProfile[] = [];

const defaultChecklist: OnboardingChecklistItem[] = [
  {
    id: `task-1`,
    title: "Review & Sign IT Security & Data Privacy Policy",
    description: "Company policy governing code access, customer PII, and endpoint encryption.",
    completed: false,
  },
  {
    id: `task-2`,
    title: "Submit Government ID & Tax Withholding Documents",
    description: "Upload passport and completed W-4 for HR verification.",
    completed: false,
  },
  {
    id: `task-3`,
    title: "Setup Enterprise GitHub & Cloud Infrastructure Access",
    description: "Configure mandatory 2FA on Google Workspace and engineering repositories.",
    completed: false,
  },
  {
    id: `task-4`,
    title: "Meet with Team Lead for 30-Day Engineering Onboarding Roadmap",
    description: "Introductory 1-on-1 sync to review first sprint tickets and architecture.",
    completed: false,
  },
];

const defaultDocs: OnboardingDoc[] = [
  {
    id: "doc-gov-id",
    docType: "GOVERNMENT_ID",
    title: "Government Passport / Photo ID",
    status: "PENDING",
  },
  {
    id: "doc-tax-dec",
    docType: "TAX_DECLARATION",
    title: "Federal W-4 / Tax Withholding Declaration",
    status: "PENDING",
  },
  {
    id: "doc-academic",
    docType: "ACADEMIC_DEGREE",
    title: "Highest Degree / University Diploma",
    status: "PENDING",
  },
  {
    id: "doc-bank-det",
    docType: "BANK_DETAILS",
    title: "Direct Deposit Bank Routing Slip",
    status: "PENDING",
  },
];

export async function createOnboardingProfileForCandidate(
  applicationId: string,
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  department: string = "Engineering",
  joiningDate: string = new Date().toISOString().split("T")[0]
): Promise<OnboardingProfile> {
  const existing = await getOnboardingProfileByEmail(candidateEmail);
  if (existing) return existing;

  const year = new Date().getFullYear();
  const randCode = Math.floor(100 + Math.random() * 900);
  const employeeCode = `EMP-${year}-${randCode}`;

  const newProfile: OnboardingProfile = {
    id: `onb-${Date.now()}`,
    applicationId,
    candidateName,
    candidateEmail,
    employeeCode,
    jobTitle,
    department,
    joiningDate,
    orientationStatus: "IN_PROGRESS",
    checklistProgress: 0,
    documents: defaultDocs.map((d, idx) => ({ ...d, id: `doc-${Date.now()}-${idx}` })),
    checklist: defaultChecklist,
    createdAt: new Date().toISOString(),
  };

  try {
    const user = await prisma.user.findUnique({ where: { email: candidateEmail.toLowerCase().trim() } });
    if (user) {
      const dbProfile = await prisma.onboardingProfile.upsert({
        where: { applicationId },
        update: {
          employeeCode,
          department,
          joiningDate: new Date(joiningDate),
          orientationStatus: "IN_PROGRESS",
          checklistProgress: 0,
        },
        create: {
          applicationId,
          userId: user.id,
          employeeCode,
          department,
          joiningDate: new Date(joiningDate),
          orientationStatus: "IN_PROGRESS",
          checklistProgress: 0,
          documents: {
            create: defaultDocs.map((d) => ({
              docType: d.docType,
              fileUrl: "",
              status: "PENDING",
            })),
          },
        },
        include: { documents: true },
      });

      newProfile.id = dbProfile.id;
    }
  } catch (e) {
    console.error("[createOnboardingProfileForCandidate] DB error:", e);
  }

  inMemoryOnboardingProfiles.unshift(newProfile);
  return newProfile;
}

export async function getAllOnboardingProfiles(): Promise<OnboardingProfile[]> {
  try {
    const dbProfiles = await prisma.onboardingProfile.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbProfiles.length > 0) {
      return dbProfiles.map((p) => ({
        id: p.id,
        applicationId: p.applicationId,
        candidateName: p.application.candidate.fullName,
        candidateEmail: p.application.candidate.email,
        employeeCode: p.employeeCode || "EMP-PENDING",
        jobTitle: p.application.job.title,
        department: p.department || p.application.job.department || "Engineering",
        joiningDate: p.joiningDate ? p.joiningDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        orientationStatus: (p.orientationStatus as any) || "IN_PROGRESS",
        checklistProgress: p.checklistProgress ? Number(p.checklistProgress) : 0,
        documents: p.documents.map((d) => ({
          id: d.id,
          docType: d.docType as any,
          title: defaultDocs.find((x) => x.docType === d.docType)?.title || d.docType,
          fileName: d.fileUrl ? d.fileUrl.split("/").pop() : undefined,
          fileUrl: d.fileUrl || undefined,
          status: d.status as any,
          rejectionReason: d.rejectionReason || undefined,
          aiValidationNotes: (d.aiValidationDetails as any)?.notes || undefined,
          uploadedAt: d.uploadedAt.toISOString(),
        })),
        checklist: defaultChecklist,
        createdAt: p.createdAt.toISOString(),
      }));
    }
  } catch (e) {
    console.error("[getAllOnboardingProfiles] DB query error:", e);
  }

  return inMemoryOnboardingProfiles;
}

export async function getOnboardingProfileByEmail(email: string): Promise<OnboardingProfile | null> {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  try {
    const p = await prisma.onboardingProfile.findFirst({
      where: {
        application: {
          candidate: { email: { equals: normalized, mode: "insensitive" } },
        },
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (p) {
      return {
        id: p.id,
        applicationId: p.applicationId,
        candidateName: p.application.candidate.fullName,
        candidateEmail: p.application.candidate.email,
        employeeCode: p.employeeCode || "EMP-PENDING",
        jobTitle: p.application.job.title,
        department: p.department || p.application.job.department || "Engineering",
        joiningDate: p.joiningDate ? p.joiningDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        orientationStatus: (p.orientationStatus as any) || "IN_PROGRESS",
        checklistProgress: p.checklistProgress ? Number(p.checklistProgress) : 0,
        documents: p.documents.map((d) => ({
          id: d.id,
          docType: d.docType as any,
          title: defaultDocs.find((x) => x.docType === d.docType)?.title || d.docType,
          fileName: d.fileUrl ? d.fileUrl.split("/").pop() : undefined,
          fileUrl: d.fileUrl || undefined,
          status: d.status as any,
          rejectionReason: d.rejectionReason || undefined,
          aiValidationNotes: (d.aiValidationDetails as any)?.notes || undefined,
          uploadedAt: d.uploadedAt.toISOString(),
        })),
        checklist: defaultChecklist,
        createdAt: p.createdAt.toISOString(),
      };
    }
  } catch (e) {
    console.error("[getOnboardingProfileByEmail] DB error:", e);
  }

  return inMemoryOnboardingProfiles.find(
    (p) => p.candidateEmail.toLowerCase() === normalized
  ) || null;
}

export async function uploadOnboardingDocument(
  profileId: string,
  docType: OnboardingDoc["docType"],
  fileName: string,
  fileUrl: string,
  aiValidationNotes?: string
) {
  try {
    const doc = await prisma.onboardingDocument.findFirst({
      where: { onboardingProfileId: profileId, docType },
    });

    if (doc) {
      await prisma.onboardingDocument.update({
        where: { id: doc.id },
        data: {
          fileUrl,
          status: "SUBMITTED",
          aiValidationDetails: aiValidationNotes ? { notes: aiValidationNotes } : undefined,
        },
      });
    } else {
      await prisma.onboardingDocument.create({
        data: {
          onboardingProfileId: profileId,
          docType,
          fileUrl,
          status: "SUBMITTED",
          aiValidationDetails: aiValidationNotes ? { notes: aiValidationNotes } : undefined,
        },
      });
    }
  } catch (e) {
    console.error("[uploadOnboardingDocument] DB error:", e);
  }

  const profile = inMemoryOnboardingProfiles.find((p) => p.id === profileId);
  if (profile) {
    const doc = profile.documents.find((d) => d.docType === docType);
    if (doc) {
      doc.fileName = fileName;
      doc.fileUrl = fileUrl;
      doc.status = "SUBMITTED";
      doc.aiValidationNotes = aiValidationNotes;
      doc.uploadedAt = new Date().toISOString();
    }
    return profile;
  }

  const profiles = await getAllOnboardingProfiles();
  return profiles.find((p) => p.id === profileId) || null;
}

export async function toggleChecklistItem(profileId: string, taskId: string) {
  const profile = inMemoryOnboardingProfiles.find((p) => p.id === profileId);
  if (!profile) return null;

  const task = profile.checklist.find((t) => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
  }

  const completedCount = profile.checklist.filter((t) => t.completed).length;
  profile.checklistProgress = Math.round((completedCount / profile.checklist.length) * 100);

  if (profile.checklistProgress === 100) {
    profile.orientationStatus = "COMPLETED";
  }

  try {
    await prisma.onboardingProfile.update({
      where: { id: profileId },
      data: {
        checklistProgress: profile.checklistProgress,
        orientationStatus: profile.orientationStatus,
      },
    });
  } catch (e) {
    console.error("[toggleChecklistItem] DB error:", e);
  }

  return profile;
}

export async function reviewOnboardingDocument(
  profileId: string,
  docId: string,
  status: "VERIFIED" | "REJECTED",
  rejectionReason?: string
) {
  try {
    await prisma.onboardingDocument.update({
      where: { id: docId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        reviewedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("[reviewOnboardingDocument] DB error:", e);
  }

  const profile = inMemoryOnboardingProfiles.find((p) => p.id === profileId);
  if (profile) {
    const doc = profile.documents.find((d) => d.id === docId);
    if (doc) {
      doc.status = status;
      doc.rejectionReason = rejectionReason;
    }
    return profile;
  }

  const profiles = await getAllOnboardingProfiles();
  return profiles.find((p) => p.id === profileId) || null;
}
