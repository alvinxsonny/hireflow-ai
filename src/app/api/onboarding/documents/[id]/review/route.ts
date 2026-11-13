import { NextResponse } from "next/server";
import { reviewOnboardingDocument } from "@/lib/onboarding-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    const { profileId, status, rejectionReason } = await request.json();

    const updated = await reviewOnboardingDocument(
      profileId || "onb-1",
      docId,
      status || "VERIFIED",
      rejectionReason
    );

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to review document" },
      { status: 500 }
    );
  }
}

