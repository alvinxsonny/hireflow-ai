import { NextResponse } from "next/server";
import { toggleChecklistItem } from "@/lib/onboarding-store";

export async function PATCH(request: Request) {
  try {
    const { profileId, taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 });
    }

    const updated = await toggleChecklistItem(profileId || "onb-1", taskId);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update checklist" },
      { status: 500 }
    );
  }
}
