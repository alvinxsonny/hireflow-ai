import { prisma } from "@/lib/prisma";

export interface JobPostingData {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  minExperienceYears: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  applicantCount?: number;
}

// Empty initial jobs — only real jobs created by HR will appear
let inMemoryJobs: JobPostingData[] = [];

export async function getAllJobs(filter?: {
  status?: string;
  department?: string;
  search?: string;
}) {
  try {
    const dbJobs = await prisma.jobPosting.findMany({
      where: {
        ...(filter?.status ? { status: filter.status as any } : {}),
        ...(filter?.department ? { department: { contains: filter.department, mode: "insensitive" } } : {}),
      },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbJobs.length > 0) {
      return dbJobs.map((j) => ({
        id: j.id,
        title: j.title,
        department: j.department || "General",
        location: j.location,
        employmentType: j.employmentType,
        experienceLevel: j.experienceLevel || "Mid",
        minExperienceYears: j.minExperienceYears,
        salaryRangeMin: Number(j.salaryRangeMin || 0),
        salaryRangeMax: Number(j.salaryRangeMax || 0),
        description: j.description,
        requiredSkills: j.requiredSkills,
        preferredSkills: j.preferredSkills,
        status: j.status as any,
        createdAt: j.createdAt.toISOString(),
        applicantCount: j._count.applications,
      }));
    }
  } catch (e) {
    // DB not available, fall through to in-memory
  }

  let results = [...inMemoryJobs];
  if (filter?.status) {
    results = results.filter((j) => j.status === filter.status);
  }
  if (filter?.department && filter.department !== "All") {
    results = results.filter((j) =>
      j.department.toLowerCase().includes(filter.department!.toLowerCase())
    );
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }
  return results;
}

export async function getJobById(id: string) {
  try {
    const dbJob = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        _count: { select: { applications: true } },
      },
    });
    if (dbJob) {
      return {
        id: dbJob.id,
        title: dbJob.title,
        department: dbJob.department || "General",
        location: dbJob.location,
        employmentType: dbJob.employmentType,
        experienceLevel: dbJob.experienceLevel || "Mid",
        minExperienceYears: dbJob.minExperienceYears,
        salaryRangeMin: Number(dbJob.salaryRangeMin || 0),
        salaryRangeMax: Number(dbJob.salaryRangeMax || 0),
        description: dbJob.description,
        requiredSkills: dbJob.requiredSkills,
        preferredSkills: dbJob.preferredSkills,
        status: dbJob.status as any,
        createdAt: dbJob.createdAt.toISOString(),
        applicantCount: dbJob._count.applications,
      };
    }
  } catch (e) {
    // Ignore and fallback
  }

  return inMemoryJobs.find((j) => j.id === id) || null;
}

export async function createJob(data: Omit<JobPostingData, "id" | "createdAt" | "applicantCount">) {
  try {
    const newDbJob = await prisma.jobPosting.create({
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        minExperienceYears: data.minExperienceYears,
        salaryRangeMin: data.salaryRangeMin,
        salaryRangeMax: data.salaryRangeMax,
        description: data.description,
        requiredSkills: data.requiredSkills,
        preferredSkills: data.preferredSkills,
        status: data.status,
      },
    });

    return {
      id: newDbJob.id,
      ...data,
      createdAt: newDbJob.createdAt.toISOString(),
      applicantCount: 0,
    };
  } catch (e) {
    // Fallback store
    const job: JobPostingData = {
      id: `job-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      applicantCount: 0,
    };
    inMemoryJobs.unshift(job);
    return job;
  }
}

