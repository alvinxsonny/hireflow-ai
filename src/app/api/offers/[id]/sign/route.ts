import { NextResponse } from "next/server";
import { signOfferLetter } from "@/lib/offers-store";
import { updateApplicationRecord } from "@/lib/applications-store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const { signatureDataUrl, accept } = await request.json();

    const signed = await signOfferLetter(offerId, signatureDataUrl || "", accept !== false);
    if (!signed) {
      return NextResponse.json({ success: false, error: "Offer not found" }, { status: 404 });
    }

    if (signed.applicationId) {
      const nextStatus = accept !== false ? "ONBOARDING" : "REJECTED";
      await updateApplicationRecord(signed.applicationId, { status: nextStatus });
    }

    return NextResponse.json({
      success: true,
      message: accept !== false ? "Offer accepted successfully!" : "Offer declined.",
      offer: signed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process signature" },
      { status: 500 }
    );
  }
}
