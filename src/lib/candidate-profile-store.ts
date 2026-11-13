import { prisma } from "@/lib/prisma";

export interface CandidateProfileData {
  email: string;
  fullName: string;
  phone?: string;
  headline?: string;
  portfolioUrl?: string;
  skills: string[];
  bio?: string;
  isProfileComplete: boolean;
}

let inMemoryProfiles: Record<string, CandidateProfileData> = {};

export async function getCandidateProfile(email: string): Promise<CandidateProfileData> {
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      return {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || inMemoryProfiles[normalizedEmail]?.phone || "",
        headline: inMemoryProfiles[normalizedEmail]?.headline || "",
        portfolioUrl: inMemoryProfiles[normalizedEmail]?.portfolioUrl || "",
        skills: inMemoryProfiles[normalizedEmail]?.skills || [],
        bio: inMemoryProfiles[normalizedEmail]?.bio || "",
        isProfileComplete: !!(user.phone || inMemoryProfiles[normalizedEmail]?.phone),
      };
    }
  } catch (e) {
    // Database offline or fallback
  }

  return (
    inMemoryProfiles[normalizedEmail] || {
      email: normalizedEmail,
      fullName: "",
      phone: "",
      headline: "",
      portfolioUrl: "",
      skills: [],
      bio: "",
      isProfileComplete: false,
    }
  );
}

export async function saveCandidateProfile(
  email: string,
  data: Partial<CandidateProfileData>
): Promise<CandidateProfileData> {
  const normalizedEmail = email.toLowerCase();

  try {
    await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName: data.fullName,
        phone: data.phone,
      },
      create: {
        email: normalizedEmail,
        fullName: data.fullName || "Candidate",
        phone: data.phone,
        role: "CANDIDATE",
        portalAccess: "CANDIDATE",
      },
    });
  } catch (e) {
    console.warn("Could not save to PostgreSQL, persisting in store:", e);
  }

  const existing = inMemoryProfiles[normalizedEmail] || {
    email: normalizedEmail,
    fullName: data.fullName || "",
    phone: "",
    headline: "",
    portfolioUrl: "",
    skills: [],
    bio: "",
    isProfileComplete: false,
  };

  const updated: CandidateProfileData = {
    ...existing,
    ...data,
    email: normalizedEmail,
    isProfileComplete: !!(data.phone || existing.phone),
  };

  inMemoryProfiles[normalizedEmail] = updated;
  return updated;
}
