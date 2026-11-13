import { NextResponse } from "next/server";
import { recordViolation } from "@/lib/assessments-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const testId = params.id;
    const { type, message } = await request.json();

    if (!type) {
      return NextResponse.json({ success: false, error: "Violation type is required" }, { status: 400 });
    }

    const result = await recordViolation(
      testId,
      type,
      message || "Proctoring infraction recorded by client telemetry"
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      currentProctoringScore: result.test.proctoringScore,
      violation: result.violation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log proctoring violation" },
      { status: 500 }
    );
  }
}

