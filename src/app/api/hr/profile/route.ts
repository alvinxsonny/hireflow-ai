import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHrProfile, saveHrProfile } from "@/lib/hr-profile-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const emailParam = url.searchParams.get("email");
    const targetEmail = emailParam || session?.user?.email;

    if (!targetEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const profile = await getHrProfile(targetEmail);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("[api/hr/profile GET] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const targetEmail = body.email || session?.user?.email;

    if (!targetEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updated = await saveHrProfile(targetEmail, body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error("[api/hr/profile POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
