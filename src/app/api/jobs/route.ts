import { NextResponse } from "next/server";
import { getAllJobs, createJob } from "@/lib/jobs-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const department = searchParams.get("department") || undefined;
    const search = searchParams.get("search") || undefined;

    const jobs = await getAllJobs({ status, department, search });
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      department,
      location,
      employmentType,
      experienceLevel,
      minExperienceYears,
      salaryRangeMin,
      salaryRangeMax,
      description,
      requiredSkills,
      preferredSkills,
      status,
    } = body;

    if (!title || !location || !description) {
      return NextResponse.json(
        { success: false, error: "Title, location, and description are required." },
        { status: 400 }
      );
    }

    const newJob = await createJob({
      title,
      department: department || "General",
      location,
      employmentType: employmentType || "Full-time",
      experienceLevel: experienceLevel || "Mid",
      minExperienceYears: Number(minExperienceYears || 0),
      salaryRangeMin: Number(salaryRangeMin || 0),
      salaryRangeMax: Number(salaryRangeMax || 0),
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : [],
      status: status || "PUBLISHED",
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}
