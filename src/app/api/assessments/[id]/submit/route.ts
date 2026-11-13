import { NextResponse } from "next/server";
import { submitAssessment } from "@/lib/assessments-store";
import { updateApplicationRecord } from "@/lib/applications-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const { candidateAnswers } = await request.json();

    const graded = await submitAssessment(testId, candidateAnswers || {});
    if (!graded) {
      return NextResponse.json({ success: false, error: "Assessment not found" }, { status: 404 });
    }

    // Update application stage to ASSESSMENT_COMPLETED
    if (graded.applicationId) {
      await updateApplicationRecord(graded.applicationId, {
        status: "ASSESSMENT_COMPLETED",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Assessment submitted and graded successfully",
      score: graded.totalScore,
      isPassed: graded.isPassed,
      proctoringScore: graded.proctoringScore,
      violationsCount: graded.violations.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
