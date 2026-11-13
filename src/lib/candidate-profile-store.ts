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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const candidatePhone = user.phone || inMemoryProfiles[normalizedEmail]?.phone || "";
      const headline = user.headline || inMemoryProfiles[normalizedEmail]?.headline || "";

      const profile: CandidateProfileData = {
        email: user.email,
        fullName: user.fullName || "",
        phone: candidatePhone,
        headline,
        portfolioUrl: user.portfolioUrl || inMemoryProfiles[normalizedEmail]?.portfolioUrl || "",
        skills: user.skills && user.skills.length > 0 ? user.skills : (inMemoryProfiles[normalizedEmail]?.skills || []),
        bio: user.bio || inMemoryProfiles[normalizedEmail]?.bio || "",
        isProfileComplete: Boolean(candidatePhone && headline),
      };

      inMemoryProfiles[normalizedEmail] = profile;
      return profile;
    }
  } catch (e) {
    console.error("[getCandidateProfile] DB query error:", e);
  }

  const cached = inMemoryProfiles[normalizedEmail];
  if (cached) {
    return cached;
  }

  return {
    email: normalizedEmail,
    fullName: "",
    phone: "",
    headline: "",
    portfolioUrl: "",
    skills: [],
    bio: "",
    isProfileComplete: false,
  };
}

export async function saveCandidateProfile(
  email: string,
  data: Partial<CandidateProfileData>
): Promise<CandidateProfileData> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        headline: data.headline,
        portfolioUrl: data.portfolioUrl,
        skills: data.skills,
        bio: data.bio,
      },
      create: {
        email: normalizedEmail,
        fullName: data.fullName || "Candidate",
        phone: data.phone,
        headline: data.headline,
        portfolioUrl: data.portfolioUrl,
        skills: data.skills || [],
        bio: data.bio,
        role: "CANDIDATE",
        portalAccess: "CANDIDATE",
      },
    });

    const result: CandidateProfileData = {
      email: user.email,
      fullName: user.fullName || "",
      phone: user.phone || "",
      headline: user.headline || "",
      portfolioUrl: user.portfolioUrl || "",
      skills: user.skills || [],
      bio: user.bio || "",
      isProfileComplete: Boolean(user.phone && user.headline),
    };

    inMemoryProfiles[normalizedEmail] = result;
    return result;
  } catch (e) {
    console.error("[saveCandidateProfile] DB upsert error:", e);

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
      isProfileComplete: Boolean((data.phone ?? existing.phone) && (data.headline ?? existing.headline)),
    };

    inMemoryProfiles[normalizedEmail] = updated;
    return updated;
  }
}
