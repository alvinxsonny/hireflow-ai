import { prisma } from "@/lib/prisma";

export interface HrProfileData {
  email: string;
  fullName: string;
  phone?: string;
  designation: string;
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  officeLocation?: string;
  companyBio?: string;
  isProfileComplete: boolean;
}

let inMemoryHrProfiles: Record<string, HrProfileData> = {};

export async function getHrProfile(email: string): Promise<HrProfileData> {
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const cached = inMemoryHrProfiles[normalizedEmail];
      const designation = cached?.designation || "";
      const companyName = cached?.companyName || "";

      return {
        email: user.email,
        fullName: user.fullName || cached?.fullName || "",
        phone: user.phone || cached?.phone || "",
        designation,
        companyName,
        companyWebsite: cached?.companyWebsite || "",
        companySize: cached?.companySize || "",
        industry: cached?.industry || "",
        officeLocation: cached?.officeLocation || "",
        companyBio: cached?.companyBio || "",
        isProfileComplete: Boolean(companyName && designation),
      };
    }
  } catch (e) {
    // Database offline or fallback
  }

  const cached = inMemoryHrProfiles[normalizedEmail];
  if (cached) {
    return cached;
  }

  return {
    email: normalizedEmail,
    fullName: "",
    phone: "",
    designation: "",
    companyName: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    officeLocation: "",
    companyBio: "",
    isProfileComplete: false,
  };
}

export async function saveHrProfile(
  email: string,
  data: Partial<HrProfileData>
): Promise<HrProfileData> {
  const normalizedEmail = email.toLowerCase();

  try {
    await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        role: "RECRUITER",
        portalAccess: "HR",
      },
      create: {
        email: normalizedEmail,
        fullName: data.fullName || "HR Recruiter",
        phone: data.phone,
        role: "RECRUITER",
        portalAccess: "HR",
      },
    });
  } catch (e) {
    console.warn("Could not save HR user to PostgreSQL, persisting in store:", e);
  }

  const existing = inMemoryHrProfiles[normalizedEmail] || {
    email: normalizedEmail,
    fullName: data.fullName || "",
    phone: "",
    designation: "",
    companyName: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    officeLocation: "",
    companyBio: "",
    isProfileComplete: false,
  };

  const updated: HrProfileData = {
    ...existing,
    ...data,
    email: normalizedEmail,
    isProfileComplete: Boolean(
      (data.companyName ?? existing.companyName) &&
      (data.designation ?? existing.designation)
    ),
  };

  inMemoryHrProfiles[normalizedEmail] = updated;
  return updated;
}
