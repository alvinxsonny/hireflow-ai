"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  TrendingUp,
} from "lucide-react";

export default function HrDashboardPage() {
  const { data: session } = useSession();

  const stats = [
    { label: "Active Job Openings", value: "6", change: "+2 this week", icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Screened Resumes", value: "148", change: "94% AI matched", icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { label: "Proctored Tests Completed", value: "34", change: "89% avg integrity", icon: ShieldCheck, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
    { label: "Pending HR Approvals", value: "5", change: "Action required", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

  const recentCandidates = [
    {
      name: "Alex Johnson",
      role: "Senior Full-Stack Engineer",
      matchScore: 94,
      assessmentScore: "88/100",
      status: "HR_REVIEW",
      statusLabel: "Ready for Approval",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      name: "Priya Sharma",
      role: "Product Designer (UI/UX)",
      matchScore: 91,
      assessmentScore: "92/100",
      status: "OFFER_SENT",
      statusLabel: "Offer Letter Sent",
      statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      name: "Marcus Vance",
      role: "DevOps Engineer",
      matchScore: 86,
      assessmentScore: "Pending",
      status: "ASSESSMENT_PENDING",
      statusLabel: "Test in Progress",
      statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recruiter Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruitment Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage job postings, review AI screening rubrics, and approve candidate offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hr/jobs/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Create Job Posting</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border p-5 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Candidate Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Candidate Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI screening scores, assessment results, and current review states.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Target Role</th>
                <th className="py-3.5 px-6">AI Match</th>
                <th className="py-3.5 px-6">Assessment</th>
                <th className="py-3.5 px-6">Stage</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCandidates.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-4 px-6 text-slate-600">{c.role}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs border border-blue-200">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      {c.matchScore}%
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{c.assessmentScore}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.statusColor}`}
                    >
                      {c.statusLabel}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                      Review & Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

