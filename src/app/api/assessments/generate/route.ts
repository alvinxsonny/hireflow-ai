import { NextResponse } from "next/server";
import { getApplicationById, updateApplicationRecord } from "@/lib/applications-store";
import { getJobById } from "@/lib/jobs-store";
import { generateAssessmentWithAI } from "@/lib/assessment-generator";
import { createAssessment, getAssessmentByApplicationId } from "@/lib/assessments-store";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required" },
        { status: 400 }
      );
    }

    // Check if test already exists for this application
    const existing = await getAssessmentByApplicationId(applicationId);
    if (existing) {
      return NextResponse.json({ success: true, assessment: existing });
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const job = await getJobById(application.jobId);
    const requiredSkills = job?.requiredSkills || ["Problem Solving", "Web Development"];

    // Generate questions with Gemini AI
    const questions = await generateAssessmentWithAI(
      application.jobTitle,
      requiredSkills,
      5
    );

    const newAssessment = await createAssessment({
      applicationId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobTitle: application.jobTitle,
      status: "NOT_STARTED",
      timeLimitMinutes: 15,
      questions,
    });

    await updateApplicationRecord(applicationId, { status: "ASSESSMENT_PENDING" });

    return NextResponse.json({ success: true, assessment: newAssessment });
  } catch (error: any) {
    console.error("Generate assessment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate assessment" },
      { status: 500 }
    );
  }
}

