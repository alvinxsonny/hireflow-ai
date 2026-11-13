import { NextResponse } from "next/server";
import { getAllJobs } from "@/lib/jobs-store";
import { getApplications } from "@/lib/applications-store";
import { getAllInterviews } from "@/lib/interviews-store";
import { getAllOffers } from "@/lib/offers-store";
import { getAllOnboardingProfiles } from "@/lib/onboarding-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [jobs, applications, interviews, offers, onboardingProfiles] = await Promise.all([
      getAllJobs(),
      getApplications(),
      getAllInterviews(),
      getAllOffers(),
      getAllOnboardingProfiles(),
    ]);

    const activeJobs = jobs.filter((j: any) => j.status === "PUBLISHED" || !j.status);
    const screenedApps = applications.filter(
      (a: any) => a.aiScreeningScore !== undefined && a.aiScreeningScore !== null
    );
    const assessedApps = applications.filter(
      (a: any) => a.assessmentScore !== undefined || a.status === "ASSESSMENT_COMPLETED"
    );
    const pendingApprovals = applications.filter(
      (a: any) => a.status === "HR_REVIEW" || a.status === "OFFER_PENDING"
    );
    const sentOffers = offers.filter((o: any) => o.status === "SENT" || o.status === "ACCEPTED");

    // Format recent candidates
    const recentCandidates = applications.slice(0, 10).map((app: any) => {
      let statusLabel = "Applied";
      let statusColor = "bg-slate-50 text-slate-700 border-slate-200";

      switch (app.status) {
        case "SCREENED":
        case "SHORTLISTED":
          statusLabel = "Screened (AI)";
          statusColor = "bg-blue-50 text-blue-700 border-blue-200";
          break;
        case "ASSESSMENT_PENDING":
          statusLabel = "Test in Progress";
          statusColor = "bg-cyan-50 text-cyan-700 border-cyan-200";
          break;
        case "ASSESSMENT_COMPLETED":
          statusLabel = "Test Completed";
          statusColor = "bg-purple-50 text-purple-700 border-purple-200";
          break;
        case "INTERVIEW_SCHEDULED":
          statusLabel = "Interview Scheduled";
          statusColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
          break;
        case "HR_REVIEW":
          statusLabel = "Ready for HR Approval";
          statusColor = "bg-amber-50 text-amber-700 border-amber-200";
          break;
        case "OFFER_PENDING":
        case "OFFER_ACCEPTED":
          statusLabel = app.status === "OFFER_ACCEPTED" ? "Offer Accepted" : "Offer Dispatched";
          statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
          break;
        case "ONBOARDING":
          statusLabel = "Onboarding Active";
          statusColor = "bg-teal-50 text-teal-700 border-teal-200";
          break;
        case "REJECTED":
          statusLabel = "Not Selected";
          statusColor = "bg-rose-50 text-rose-700 border-rose-200";
          break;
        default:
          statusLabel = "Applied";
          statusColor = "bg-slate-50 text-slate-700 border-slate-200";
      }

      return {
        id: app.id,
        name: app.candidateName,
        role: app.jobTitle,
        matchScore: app.aiScreeningScore ?? null,
        assessmentScore: app.assessmentScore !== undefined ? `${app.assessmentScore}/100` : "Pending",
        status: app.status,
        statusLabel,
        statusColor,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        activeJobsCount: activeJobs.length,
        screenedCount: screenedApps.length,
        assessmentsCount: assessedApps.length,
        pendingApprovalsCount: pendingApprovals.length,
        interviewsCount: interviews.length,
        offersCount: sentOffers.length,
        onboardingCount: onboardingProfiles.length,
      },
      recentCandidates,
    });
  } catch (error: any) {
    console.error("[api/hr/dashboard] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stats: {
          activeJobsCount: 0,
          screenedCount: 0,
          assessmentsCount: 0,
          pendingApprovalsCount: 0,
          interviewsCount: 0,
          offersCount: 0,
          onboardingCount: 0,
        },
        recentCandidates: [],
      },
      { status: 500 }
    );
  }
}
