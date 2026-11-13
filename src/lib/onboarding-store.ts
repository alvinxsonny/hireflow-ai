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

// Empty initial profiles — only created when a candidate accepts an official offer
let inMemoryOnboardingProfiles: OnboardingProfile[] = [];

export async function getAllOnboardingProfiles() {
  return inMemoryOnboardingProfiles;
}

export async function getOnboardingProfileByEmail(email: string) {
  if (!email) return null;
  return (
    inMemoryOnboardingProfiles.find(
      (p) => p.candidateEmail.toLowerCase() === email.toLowerCase()
    ) || null
  );
}

export async function createOnboardingProfileForCandidate(
  applicationId: string,
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  department: string = "Engineering",
  joiningDate: string = new Date().toISOString().split("T")[0]
) {
  const existing = inMemoryOnboardingProfiles.find(
    (p) => p.candidateEmail.toLowerCase() === candidateEmail.toLowerCase()
  );
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
    documents: [
      {
        id: `doc-${Date.now()}-1`,
        docType: "GOVERNMENT_ID",
        title: "Government Passport / Photo ID",
        status: "PENDING",
      },
      {
        id: `doc-${Date.now()}-2`,
        docType: "TAX_DECLARATION",
        title: "Federal W-4 / Tax Withholding Declaration",
        status: "PENDING",
      },
      {
        id: `doc-${Date.now()}-3`,
        docType: "ACADEMIC_DEGREE",
        title: "Highest Degree / University Diploma",
        status: "PENDING",
      },
      {
        id: `doc-${Date.now()}-4`,
        docType: "BANK_DETAILS",
        title: "Direct Deposit Bank Routing Slip",
        status: "PENDING",
      },
    ],
    checklist: [
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
    ],
    createdAt: new Date().toISOString(),
  };

  inMemoryOnboardingProfiles.unshift(newProfile);
  return newProfile;
}

export async function uploadOnboardingDocument(
  profileId: string,
  docType: OnboardingDoc["docType"],
  fileName: string,
  fileUrl: string,
  aiValidationNotes?: string
) {
  const profile = inMemoryOnboardingProfiles.find((p) => p.id === profileId);
  if (!profile) return null;

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

  return profile;
}

export async function reviewOnboardingDocument(
  profileId: string,
  docId: string,
  status: "VERIFIED" | "REJECTED",
  rejectionReason?: string
) {
  const profile = inMemoryOnboardingProfiles.find((p) => p.id === profileId);
  if (!profile) return null;

  const doc = profile.documents.find((d) => d.id === docId);
  if (doc) {
    doc.status = status;
    doc.rejectionReason = rejectionReason;
  }

  return profile;
}

