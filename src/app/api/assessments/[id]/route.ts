import { NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/assessments-store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const { searchParams } = new URL(request.url);
    const isHR = searchParams.get("role") === "hr";

    const test = await getAssessmentById(testId);
    if (!test) {
      return NextResponse.json({ success: false, error: "Assessment not found" }, { status: 404 });
    }

    // Mask correct answers if candidate is taking the test
    if (!isHR && test.status !== "SUBMITTED") {
      const maskedQuestions = test.questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
      }));

      return NextResponse.json({
        success: true,
        assessment: {
          ...test,
          questions: maskedQuestions,
        },
      });
    }

    return NextResponse.json({ success: true, assessment: test });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

