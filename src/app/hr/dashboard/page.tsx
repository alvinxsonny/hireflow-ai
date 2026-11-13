"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function HrDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    screenedCount: 0,
    assessmentsCount: 0,
    pendingApprovalsCount: 0,
    interviewsCount: 0,
    offersCount: 0,
    onboardingCount: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/dashboard");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentCandidates(data.recentCandidates || []);
      }
    } catch (e) {
      console.error("Failed to load HR dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metricCards = [
    {
      label: "Active Job Openings",
      value: stats.activeJobsCount,
      change: stats.activeJobsCount === 0 ? "No active listings" : `${stats.activeJobsCount} published`,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/hr/jobs",
    },
    {
      label: "Screened Resumes",
      value: stats.screenedCount,
      change: stats.screenedCount === 0 ? "Awaiting applicants" : "AI evaluated",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/hr/candidates",
    },
    {
      label: "Proctored Tests",
      value: stats.assessmentsCount,
      change: stats.assessmentsCount === 0 ? "None completed" : "Integrity audited",
      icon: ShieldCheck,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      link: "/hr/candidates",
    },
    {
      label: "Pending HR Approvals",
      value: stats.pendingApprovalsCount,
      change: stats.pendingApprovalsCount === 0 ? "All caught up" : "Action required",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/hr/approvals",
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
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <Link
            href="/hr/jobs/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Posting</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.link}
              className="bg-white rounded-2xl border p-5 border-slate-200 shadow-sm hover:border-slate-300 transition block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.change}</div>
            </Link>
          );
        })}
      </div>

      {/* Complete Recruitment & Onboarding Lifecycle Funnel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recruitment & Onboarding Lifecycle Funnel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live candidate volume progression through all 7 platform stages.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Realtime DB Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            {
              step: "1. Jobs",
              count: stats.activeJobsCount,
              label: "Active Roles",
              color: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              step: "2. Screened",
              count: stats.screenedCount,
              label: "AI Evaluated",
              color: "bg-indigo-50 text-indigo-700 border-indigo-200",
            },
            {
              step: "3. Assessed",
              count: stats.assessmentsCount,
              label: "Proctored Tests",
              color: "bg-cyan-50 text-cyan-700 border-cyan-200",
            },
            {
              step: "4. Interview",
              count: stats.interviewsCount,
              label: "AI Co-Pilot",
              color: "bg-purple-50 text-purple-700 border-purple-200",
            },
            {
              step: "5. Approved",
              count: stats.pendingApprovalsCount,
              label: "HR Approvals",
              color: "bg-amber-50 text-amber-700 border-amber-200",
            },
            {
              step: "6. Offers",
              count: stats.offersCount,
              label: "Dispatched",
              color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              step: "7. Onboard",
              count: stats.onboardingCount,
              label: "Active Hires",
              color: "bg-teal-50 text-teal-700 border-teal-200",
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${item.color}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                {item.step}
              </span>
              <span className="text-xl font-black mt-1 block">{item.count}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5 block">{item.label}</span>
            </div>
          ))}
        </div>
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
          {recentCandidates.length > 0 && (
            <Link
              href="/hr/candidates"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All Candidates &rarr;
            </Link>
          )}
        </div>

        {recentCandidates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Candidates in Pipeline Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Post a job opening to start receiving real applications. Candidate resumes will be
              automatically screened with Gemini AI, rubrics will be generated, and candidates will
              progress through assessments and interviews.
            </p>
            <Link
              href="/hr/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Your First Job Opening</span>
            </Link>
          </div>
        ) : (
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
                      {c.matchScore !== null ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs border border-blue-200">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          {c.matchScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not Screened</span>
                      )}
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
                      <Link
                        href="/hr/candidates"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View AI Diagnostics &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
