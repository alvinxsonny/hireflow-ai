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
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const designation = user.designation || inMemoryHrProfiles[normalizedEmail]?.designation || "";
      const companyName = user.companyName || inMemoryHrProfiles[normalizedEmail]?.companyName || "";

      const profile: HrProfileData = {
        email: user.email,
        fullName: user.fullName || "",
        phone: user.phone || inMemoryHrProfiles[normalizedEmail]?.phone || "",
        designation,
        companyName,
        companyWebsite: user.companyWebsite || inMemoryHrProfiles[normalizedEmail]?.companyWebsite || "",
        companySize: user.companySize || inMemoryHrProfiles[normalizedEmail]?.companySize || "51-200 Employees",
        industry: user.industry || inMemoryHrProfiles[normalizedEmail]?.industry || "Software & Technology",
        officeLocation: user.officeLocation || inMemoryHrProfiles[normalizedEmail]?.officeLocation || "",
        companyBio: user.companyBio || inMemoryHrProfiles[normalizedEmail]?.companyBio || "",
        isProfileComplete: Boolean(companyName && designation),
      };

      inMemoryHrProfiles[normalizedEmail] = profile;
      return profile;
    }
  } catch (e) {
    console.error("[getHrProfile] DB query error:", e);
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
    companySize: "51-200 Employees",
    industry: "Software & Technology",
    officeLocation: "",
    companyBio: "",
    isProfileComplete: false,
  };
}

export async function saveHrProfile(
  email: string,
  data: Partial<HrProfileData>
): Promise<HrProfileData> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        designation: data.designation,
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        companySize: data.companySize,
        industry: data.industry,
        officeLocation: data.officeLocation,
        companyBio: data.companyBio,
        role: "RECRUITER",
        portalAccess: "HR",
      },
      create: {
        email: normalizedEmail,
        fullName: data.fullName || "HR Recruiter",
        phone: data.phone,
        designation: data.designation,
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        companySize: data.companySize,
        industry: data.industry,
        officeLocation: data.officeLocation,
        companyBio: data.companyBio,
        role: "RECRUITER",
        portalAccess: "HR",
      },
    });

    const result: HrProfileData = {
      email: user.email,
      fullName: user.fullName || "",
      phone: user.phone || "",
      designation: user.designation || "",
      companyName: user.companyName || "",
      companyWebsite: user.companyWebsite || "",
      companySize: user.companySize || "51-200 Employees",
      industry: user.industry || "Software & Technology",
      officeLocation: user.officeLocation || "",
      companyBio: user.companyBio || "",
      isProfileComplete: Boolean(user.companyName && user.designation),
    };

    inMemoryHrProfiles[normalizedEmail] = result;
    return result;
  } catch (e) {
    console.error("[saveHrProfile] DB upsert error:", e);

    const existing = inMemoryHrProfiles[normalizedEmail] || {
      email: normalizedEmail,
      fullName: data.fullName || "",
      phone: "",
      designation: "",
      companyName: "",
      companyWebsite: "",
      companySize: "51-200 Employees",
      industry: "Software & Technology",
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
}
