import { NextResponse } from "next/server";
import { submitInterviewScorecard, getInterviewById } from "@/lib/interviews-store";
import { updateApplicationRecord } from "@/lib/applications-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    const body = await request.json();
    const {
      technicalRating,
      communicationRating,
      problemSolvingRating,
      culturalFitRating,
      recommendation,
      notes,
    } = body;

    const updated = await submitInterviewScorecard(interviewId, {
      technicalRating: Number(technicalRating || 4),
      communicationRating: Number(communicationRating || 4),
      problemSolvingRating: Number(problemSolvingRating || 4),
      culturalFitRating: Number(culturalFitRating || 4),
      recommendation: recommendation || "HIRE",
      notes: notes || "Candidate performed well across all core competency questions.",
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Interview record not found" },
        { status: 404 }
      );
    }

    // Move candidate to HR_REVIEW stage (Ready for Phase 6 Human HR Approval!)
    if (updated.applicationId) {
      await updateApplicationRecord(updated.applicationId, {
        status: "HR_REVIEW",
      });
    }

    return NextResponse.json({ success: true, interview: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit scorecard" },
      { status: 500 }
    );
  }
}

