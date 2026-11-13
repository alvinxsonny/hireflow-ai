import { NextResponse } from "next/server";
import { getCandidateProfile, saveCandidateProfile } from "@/lib/candidate-profile-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email query param is required" },
        { status: 400 }
      );
    }

    const profile = await getCandidateProfile(email);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, phone, headline, portfolioUrl, skills, bio } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const updated = await saveCandidateProfile(email, {
      fullName,
      phone,
      headline,
      portfolioUrl,
      skills: Array.isArray(skills) ? skills : [],
      bio,
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}

