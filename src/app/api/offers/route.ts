import { NextResponse } from "next/server";
import { getAllOffers, createOfferRecord } from "@/lib/offers-store";
import { getApplicationById, updateApplicationRecord } from "@/lib/applications-store";

export async function GET() {
  try {
    const offers = await getAllOffers();
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      applicationId,
      designation,
      offeredSalary,
      joiningDate,
      expiryDate,
      benefits,
    } = body;

    if (!applicationId || !designation || !offeredSalary || !joiningDate) {
      return NextResponse.json(
        { success: false, error: "Missing required offer letter fields" },
        { status: 400 }
      );
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const defaultBenefits = [
      "Comprehensive Health, Dental, and Vision Insurance",
      "Flexible Remote Work with Home Office Stipend",
      "Unlimited Paid Time Off (PTO)",
      "401(k) Retirement Plan with 4% Company Match",
    ];

    const offer = await createOfferRecord({
      applicationId,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      jobTitle: application.jobTitle,
      designation,
      offeredSalary: Number(offeredSalary),
      joiningDate,
      expiryDate: expiryDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      benefits: Array.isArray(benefits) && benefits.length > 0 ? benefits : defaultBenefits,
    });

    // Update application stage to OFFER_PENDING
    await updateApplicationRecord(applicationId, { status: "OFFER_PENDING" });

    return NextResponse.json({ success: true, offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate offer letter" },
      { status: 500 }
    );
  }
}

