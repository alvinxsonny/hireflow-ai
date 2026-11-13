import { NextResponse } from "next/server";
import { getAllInterviews, createInterview } from "@/lib/interviews-store";
import { getApplicationById, updateApplicationRecord } from "@/lib/applications-store";
import { getJobById } from "@/lib/jobs-store";
import { generateInterviewQuestionsWithAI } from "@/lib/interview-copilot";

export async function GET() {
  try {
    const interviews = await getAllInterviews();
    return NextResponse.json({ success: true, interviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicationId,
      interviewerName,
      scheduledAt,
      meetingLink,
    } = body;

    if (!applicationId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "applicationId and scheduledAt are required" },
        { status: 400 }
      );
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const job = await getJobById(application.jobId);
    const requiredSkills = job?.requiredSkills || ["System Architecture", "Coding"];

    // Generate AI suggested questions tailored to candidate weaknesses / gaps
    const aiQuestions = await generateInterviewQuestionsWithAI(
      application.jobTitle,
      requiredSkills,
      application.candidateName,
      application.weaknesses || []
    );

    const interview = await createInterview({
      applicationId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobTitle: application.jobTitle,
      interviewerName: interviewerName || "Hiring Team Lead",
      scheduledAt,
      meetingLink: meetingLink || "https://meet.google.com/hfa-live-room",
      aiSuggestedQuestions: aiQuestions,
    });

    // Update application stage to INTERVIEW_SCHEDULED
    await updateApplicationRecord(applicationId, { status: "INTERVIEW_SCHEDULED" });

    return NextResponse.json({ success: true, interview });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule interview" },
      { status: 500 }
    );
  }
}

