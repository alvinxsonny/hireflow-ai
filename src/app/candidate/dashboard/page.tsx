"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function CandidateDashboardPage() {
  const { data: session } = useSession();

  // Mock data representing candidate's application pipeline
  const applications = [
    {
      id: "app-1",
      role: "Senior Full-Stack Engineer",
      company: "HireFlow AI",
      location: "Remote",
      appliedDate: "Nov 12, 2026",
      status: "ASSESSMENT_PENDING",
      statusLabel: "Online Assessment Ready",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      actionText: "Take AI Assessment",
      actionLink: "/candidate/assessments/test-1",
      matchScore: 92,
    },
    {
      id: "app-2",
      role: "AI / Machine Learning Engineer",
      company: "HireFlow AI",
      location: "San Francisco, CA (Hybrid)",
      appliedDate: "Nov 08, 2026",
      status: "INTERVIEW_SCHEDULED",
      statusLabel: "Interview Scheduled",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      actionText: "View Interview Schedule",
      actionLink: "/hr/interviews",
      matchScore: 91,
    },
    {
      id: "app-3",
      role: "Lead Systems Architect",
      company: "HireFlow AI",
      location: "Remote",
      appliedDate: "Nov 01, 2026",
      status: "OFFER_PENDING",
      statusLabel: "Official Offer Letter Issued",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      actionText: "Review & Sign Offer",
      actionLink: "/candidate/offers/offer-1",
      matchScore: 95,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Candidate Portal Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {session?.user?.name || "Applicant"}!
          </h1>
          <p className="mt-2 text-blue-100 max-w-xl text-sm leading-relaxed">
            Track your job applications, complete proctored technical evaluations, and proceed to
            offer acceptance and employee onboarding.
          </p>
        </div>
      </div>

      {/* Grid: Applications and Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Applications</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {applications.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border p-6 hover:shadow-md transition border-slate-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{app.role}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{app.company}</span>
                      <span>•</span>
                      <span>{app.location}</span>
                      <span>•</span>
                      <span>Applied on {app.appliedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${app.statusColor}`}
                    >
                      {app.statusLabel}
                    </span>
                    <div className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                      {app.matchScore}% Match
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Resume screened & verified</span>
                  </div>

                  <Link
                    href={app.actionLink}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition"
                  >
                    <span>{app.actionText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Next Milestones */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Next Steps</h2>

          <div className="bg-white rounded-2xl border p-6 space-y-4 border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Technical Assessment</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete the 45-minute timed test with online webcam proctoring for Senior Full-Stack Engineer.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Final HR Approval</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upon assessment completion, hiring manager reviews your portfolio and scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

