import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const targetRole = body?.role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";
    const targetPortal = targetRole === "RECRUITER" ? "HR" : "CANDIDATE";

    if (session?.user?.email) {
      await prisma.user.upsert({
        where: { email: session.user.email },
        update: {
          role: targetRole,
          portalAccess: targetPortal,
        },
        create: {
          email: session.user.email,
          fullName: session.user.name || "User",
          role: targetRole,
          portalAccess: targetPortal,
          emailVerified: true,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      role: targetRole,
      portalAccess: targetPortal,
    });

    // Set cookie so JWT callback also respects the intent
    response.cookies.set("auth_portal_intent", targetPortal, {
      path: "/",
      maxAge: 3600 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("[set-role] Error updating user role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

