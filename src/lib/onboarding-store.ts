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

let inMemoryOnboardingProfiles: OnboardingProfile[] = [
  {
    id: "onb-1",
    applicationId: "app-101",
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    employeeCode: "EMP-2026-042",
    jobTitle: "Senior Lead Full-Stack Engineer",
    department: "Engineering",
    joiningDate: "2026-12-01",
    orientationStatus: "IN_PROGRESS",
    checklistProgress: 40,
    documents: [
      {
        id: "doc-1",
        docType: "GOVERNMENT_ID",
        title: "Government Passport / Photo ID",
        fileName: "alex_johnson_passport.pdf",
        fileUrl: "/uploads/onboarding/mock-passport.pdf",
        status: "VERIFIED",
        aiValidationNotes: "Verified valid government identity document format. Clear photo & legible MRZ zone.",
        uploadedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "doc-2",
        docType: "TAX_DECLARATION",
        title: "Federal W-4 / Tax Withholding Declaration",
        fileName: "w4_signed_alex_johnson.pdf",
        fileUrl: "/uploads/onboarding/mock-w4.pdf",
        status: "SUBMITTED",
        aiValidationNotes: "Standard W-4 form detected. Awaiting HR payroll confirmation.",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: "doc-3",
        docType: "ACADEMIC_DEGREE",
        title: "Highest Degree / University Diploma",
        status: "PENDING",
      },
      {
        id: "doc-4",
        docType: "BANK_DETAILS",
        title: "Direct Deposit Bank Routing Slip",
        status: "PENDING",
      },
    ],
    checklist: [
      {
        id: "task-1",
        title: "Review & Sign IT Security & Data Privacy Policy",
        description: "Company policy governing code access, customer PII, and endpoint encryption.",
        completed: true,
      },
      {
        id: "task-2",
        title: "Submit Government ID & Tax Withholding Documents",
        description: "Upload passport and completed W-4 for HR verification.",
        completed: true,
      },
      {
        id: "task-3",
        title: "Setup Enterprise GitHub & Cloud Infrastructure Access",
        description: "Configure mandatory 2FA on Google Workspace and engineering repositories.",
        completed: false,
      },
      {
        id: "task-4",
        title: "Meet with Team Lead for 30-Day Engineering Onboarding Roadmap",
        description: "Introductory 1-on-1 sync to review first sprint tickets and architecture.",
        completed: false,
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

export async function getAllOnboardingProfiles() {
  return inMemoryOnboardingProfiles;
}

export async function getOnboardingProfileByEmail(email: string) {
  return inMemoryOnboardingProfiles.find(
    (p) => p.candidateEmail.toLowerCase() === email.toLowerCase()
  ) || inMemoryOnboardingProfiles[0]; // Fallback to demo profile
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

