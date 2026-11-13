import { NextResponse } from "next/server";
import { getAllOnboardingProfiles, getOnboardingProfileByEmail } from "@/lib/onboarding-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const profile = await getOnboardingProfileByEmail(email);
      return NextResponse.json({ success: true, profile });
    }

    const profiles = await getAllOnboardingProfiles();
    return NextResponse.json({ success: true, profiles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch onboarding" },
      { status: 500 }
    );
  }
}
