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

// Initial realistic default jobs
let inMemoryJobs: JobPostingData[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote / Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    minExperienceYears: 5,
    salaryRangeMin: 120000,
    salaryRangeMax: 160000,
    description: `### About the Role
We are seeking an experienced Senior Full-Stack Engineer to lead the architecture and development of scalable web applications. You will collaborate closely with AI engineers, product designers, and cross-functional teams to build next-generation enterprise tools.

### Responsibilities
- Architect, build, and maintain robust full-stack applications using Next.js, TypeScript, and Node.js.
- Design clean RESTful and GraphQL APIs, along with high-performance PostgreSQL database schemas.
- Integrate AI/LLM models for automated candidate screening, scoring, and workflow automations.
- Champion code quality, comprehensive unit/integration testing, and CI/CD best practices.

### Qualifications
- 5+ years of software development experience with modern JavaScript/TypeScript ecosystems.
- Deep expertise in React/Next.js, Tailwind CSS, PostgreSQL, and modern ORMs (Prisma/Drizzle).
- Familiarity with cloud deployments (AWS, Vercel, Docker) and vector databases.`,
    requiredSkills: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Prisma"],
    preferredSkills: ["pgvector", "Docker", "Tailwind CSS", "Gemini API"],
    status: "PUBLISHED",
    createdAt: new Date().toISOString(),
    applicantCount: 14,
  },
  {
    id: "job-2",
    title: "AI / Machine Learning Engineer",
    department: "AI Research",
    location: "San Francisco, CA",
    employmentType: "Full-time",
    experienceLevel: "Mid-Senior",
    minExperienceYears: 3,
    salaryRangeMin: 140000,
    salaryRangeMax: 185000,
    description: `### About the Role
Join our AI team building intelligent resume parsing, assessment scoring algorithms, and automated candidate-job matching pipelines.

### Responsibilities
- Build and fine-tune multimodal LLM workflows (Gemini, Llama) for structured extraction.
- Implement high-speed embeddings, semantic search, and candidate ranking metrics.
- Evaluate model safety, bias prevention, and accuracy in human-in-the-loop hiring.

### Qualifications
- 3+ years experience with Python, PyTorch/TensorFlow, and LLM APIs (OpenAI/Gemini).
- Experience with vector search engines (pgvector, Pinecone, Qdrant) and prompt engineering.`,
    requiredSkills: ["Python", "Machine Learning", "LLMs", "Vector Embeddings", "Prompt Engineering"],
    preferredSkills: ["FastAPI", "PyTorch", "pgvector", "LangChain"],
    status: "PUBLISHED",
    createdAt: new Date().toISOString(),
    applicantCount: 22,
  },
  {
    id: "job-3",
    title: "Product Designer (UI/UX)",
    department: "Design",
    location: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Mid",
    minExperienceYears: 3,
    salaryRangeMin: 90000,
    salaryRangeMax: 125000,
    description: `### About the Role
Design intuitive, modern interfaces for both HR recruiters managing complex hiring pipelines and candidates going through assessments and onboarding.

### Responsibilities
- Craft seamless user journeys, high-fidelity wireframes, and design systems in Figma.
- Collaborate with frontend engineers to ensure pixel-perfect and accessible component implementation.
- Conduct user research with hiring managers and applicants to optimize recruitment conversion.`,
    requiredSkills: ["Figma", "UI/UX Design", "Wireframing", "Design Systems", "Prototyping"],
    preferredSkills: ["HTML/CSS", "Design Tokens", "Usability Testing"],
    status: "PUBLISHED",
    createdAt: new Date().toISOString(),
    applicantCount: 8,
  },
];

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

